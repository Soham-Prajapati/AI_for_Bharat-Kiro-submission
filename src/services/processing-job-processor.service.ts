import path from 'path';
import fs from 'fs';
import { processingPipeline } from './processing-pipeline.service';
import { videoMetadataService } from './video-metadata.service';
import { mockTranscriptService } from './mock-transcript.service';
import { awsTranscribeService } from './aws-transcribe.service';
import { awsRekognitionService, RekognitionLabelInsight } from './aws-rekognition.service';
import { openAIWhisperService } from './openai-whisper.service';
import { awsConfig, toS3Uri } from '../config/aws';
import { PlatformContentGeneratorV2 } from './platform-content-generator-v2.service';
import { ViralPredictorService } from './viral-predictor.service';
import { DomainDetectionService } from './domain-detection.service';
import { GenerationResults, Platform, VideoMetadata, RESULTS_TTL } from '../types/upload-to-results';
import { logger } from '../utils/logger';
import { ProcessingJobPayload } from './sqs.service';

const viralPredictor = new ViralPredictorService();
const domainDetector = new DomainDetectionService();

const DEFAULT_PLATFORMS: Platform[] = [
  'youtube',
  'instagram',
  'tiktok',
  'linkedin',
  'twitter',
  'blog',
  'podcast',
  'analytics',
];

const ALL_PLATFORMS = new Set<Platform>(DEFAULT_PLATFORMS);

const buildVisualPatterns = (labels: RekognitionLabelInsight[]): GenerationResults['viralAnalysis']['patterns'] => {
  const highestConfidenceByLabel = new Map<string, RekognitionLabelInsight>();

  labels.forEach((entry) => {
    const existing = highestConfidenceByLabel.get(entry.label);
    if (!existing || entry.confidence > existing.confidence) {
      highestConfidenceByLabel.set(entry.label, entry);
    }
  });

  return Array.from(highestConfidenceByLabel.values())
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5)
    .map((entry) => ({
      type: 'visual-object-detection',
      strength: entry.confidence / 100,
      description: `Detected ${entry.label} at ${entry.timestamp}ms (${entry.confidence}% confidence)`,
      examples: [entry.label],
    }));
};

class ProcessingJobProcessorService {
  async processJob(payload: ProcessingJobPayload): Promise<void> {
    const {
      jobId,
      fileId,
      fileName,
      mimeType,
      userId,
      platforms,
      localPath,
      url,
    } = payload;

    const selectedPlatforms: Platform[] = Array.isArray(platforms) && platforms.length > 0
      ? (platforms.filter((platform): platform is Platform => ALL_PLATFORMS.has(platform as Platform)))
      : DEFAULT_PLATFORMS;

    try {
      await processingPipeline.updateJob(jobId, {
        status: 'processing',
        progress: 20,
        currentStep: 'Extracting metadata',
      });

      let metadata: VideoMetadata;

      if (url) {
        const youtubeMetadata = await videoMetadataService.extractFromYouTubeUrl(url);
        metadata = {
          fileId,
          fileName: fileName || youtubeMetadata.title,
          mimeType: mimeType || 'video/mp4',
          size: 0,
          duration: youtubeMetadata.duration,
          localPath: localPath || '',
          uploadedAt: new Date().toISOString(),
        };
      } else {
        const inferredLocalPath = localPath || path.join(process.cwd(), 'uploads', fileId);

        try {
          metadata = await videoMetadataService.extractFromFile(
            fileId,
            fileName || 'uploaded-file',
            mimeType || 'video/mp4',
            inferredLocalPath
          );
        } catch {
          metadata = {
            fileId,
            fileName: fileName || 'uploaded-file',
            mimeType: mimeType || 'video/mp4',
            size: 0,
            duration: 180,
            localPath: inferredLocalPath,
            uploadedAt: new Date().toISOString(),
          };
        }
      }

      await processingPipeline.updateJob(jobId, {
        progress: 45,
        currentStep: 'Generating transcript',
      });

      let transcriptResult: { transcript: string; keyPoints: string[]; wordCount: number } | null = null;

      const isMediaFile = (mimeType || metadata.mimeType || '').startsWith('video/') ||
                          (mimeType || metadata.mimeType || '').startsWith('audio/');
      const isVideoFile = (mimeType || metadata.mimeType || '').startsWith('video/');

      if (isMediaFile && awsTranscribeService.isConfigured()) {
        await processingPipeline.updateJob(jobId, {
          currentStep: 'Transcribing audio with AWS Transcribe...',
        });

        const mediaUrl = awsConfig.s3BucketName ? toS3Uri(fileId) : null;

        if (mediaUrl) {
          try {
            const awsTranscript = await awsTranscribeService.transcribeFromS3(mediaUrl);
            const transcriptText = awsTranscript.transcript;
            transcriptResult = {
              transcript: transcriptText,
              keyPoints: transcriptText
                .split(/[.!?]\s+/)
                .map((sentence) => sentence.trim())
                .filter(Boolean)
                .slice(0, 5),
              wordCount: transcriptText.split(/\s+/).filter((word) => word.trim()).length,
            };
          } catch (error: any) {
            logger.warn('AWS Transcribe failed; falling back to mock workflow', {
              jobId,
              error: error?.message || String(error),
            });
          }
        }
      }

      if (!transcriptResult) {
        // ── Fallback 1: OpenAI Whisper — reads the actual video/audio file ──────
        // This is the real transcription path when AWS Transcribe is unavailable.
        const localFilePath = metadata.localPath || path.join(process.cwd(), 'uploads', fileId);
        const fileExists = localFilePath && fs.existsSync(localFilePath);

        if (isMediaFile && fileExists && openAIWhisperService.isConfigured()) {
          await processingPipeline.updateJob(jobId, {
            currentStep: 'Transcribing audio with Whisper...',
          });
          try {
            logger.info('Attempting Whisper transcription', { jobId, localFilePath });
            const whisperResult = await openAIWhisperService.transcribeLocalFile(localFilePath, fileId);
            transcriptResult = whisperResult;
            logger.info('Whisper transcription succeeded', { jobId, wordCount: whisperResult.wordCount });
          } catch (whisperError: any) {
            logger.warn('Whisper transcription failed; falling back to mock', {
              jobId,
              error: whisperError?.message || String(whisperError),
            });
          }
        }
      }

      if (!transcriptResult) {
        // ── Fallback 2: read the file bytes (works for text / subtitle files) ───
        const textResult = mockTranscriptService.generateTranscriptFromLocalFile(
          metadata.localPath,
          fileId,
          fileName || metadata.fileName,
          mimeType || metadata.mimeType
        );

        if (textResult) {
          transcriptResult = textResult;
        }
      }

      // Final fallback for media files — warns clearly that we couldn't transcribe.
      if (!transcriptResult && isMediaFile) {
        await processingPipeline.updateJob(jobId, {
          currentStep: 'Using filename context (transcription unavailable)...',
        });
        logger.warn('All transcription methods failed; using filename-based mock', { jobId, fileId });

        // Strip generic device/messenger filename patterns so we don't generate
        // contextually wrong content (e.g. "WhatsApp Video Mar 9 2026" → technology template).
        const GENERIC_FILENAME_RE = /^(whatsapp[\s_-]*(video|image|audio)|img[\s_]\d|vid[\s_-]\d|dsc[\s_]\d|mvi[\s_]\d|dcim|video\s*\d|photo\s*\d)/i;
        const cleanedName = (fileName || metadata.fileName || '')
          .replace(/\.(mp4|mov|avi|mp3|wav|m4a|webm|mkv)$/i, '')
          .replace(/[_\-\.]+/g, ' ')
          .replace(/\d{6,}/g, '')
          .trim();
        const nameForGeneration = GENERIC_FILENAME_RE.test(cleanedName) ? '' : (fileName || metadata.fileName);

        transcriptResult = mockTranscriptService.generateTranscript(
          fileId,
          nameForGeneration || undefined,
        );
      }

      if (!transcriptResult) {
        throw new Error('No transcript content available for non-media input.');
      }

      const finalTranscript = transcriptResult;

      let visualLabelInsights: RekognitionLabelInsight[] = [];
      const s3BucketName = awsConfig.s3BucketName;

      if (isVideoFile && s3BucketName && awsRekognitionService.isConfigured()) {
        await processingPipeline.updateJob(jobId, {
          progress: 60,
          currentStep: 'Running visual analysis with AWS Rekognition...',
        });

        try {
          const { jobId: rekognitionJobId } = await awsRekognitionService.analyzeVideo(s3BucketName, fileId);
          visualLabelInsights = await awsRekognitionService.waitForLabelDetection(rekognitionJobId);
        } catch (error: any) {
          logger.warn('AWS Rekognition failed; continuing without visual signals', {
            jobId,
            error: error?.message || String(error),
          });
        }
      }

      const visualPatterns = buildVisualPatterns(visualLabelInsights);

      await processingPipeline.updateJob(jobId, {
        progress: 70,
        currentStep: 'Detecting content domain',
      });

      // Run domain detection BEFORE content generation so agents get domain-aware prompts.
      // If caller supplied the user's profile domain, use it directly (more precise than auto-detect).
      let domainInfo = { domain: 'General', confidence: 0.5 };
      if (payload.domain && payload.domain !== 'general') {
        domainInfo = { domain: payload.domain, confidence: 1.0 };
        logger.info('Using user profile domain for Bedrock agent selection', { jobId, domain: domainInfo.domain });
      } else {
        try {
          domainInfo = await domainDetector.detectDomain(finalTranscript.transcript);
          logger.info('Domain detected', { jobId, domain: domainInfo.domain, confidence: domainInfo.confidence });
        } catch (error: any) {
          logger.warn('Domain detection failed; defaulting to General', {
            jobId,
            error: error?.message || String(error),
          });
        }
      }

      await processingPipeline.updateJob(jobId, {
        progress: 75,
        currentStep: 'Generating platform content',
      });

      const contentGenerator = new PlatformContentGeneratorV2();
      const generatedPlatforms = await contentGenerator.generatePlatformContent({
        transcript: finalTranscript.transcript,
        keyPoints: finalTranscript.keyPoints,
        metadata,
        platforms: selectedPlatforms,
        domain: domainInfo.domain,
      });

      await processingPipeline.updateJob(jobId, {
        progress: 85,
        currentStep: 'Analyzing viral potential',
      });

      let viralScore = 75;
      let viralAnalysis: GenerationResults['viralAnalysis'] = {
        patterns: [...visualPatterns],
        hooks: [],
        recommendations: visualPatterns.length > 0
          ? ['Use detected visual elements in the first 3 seconds to improve hook strength.']
          : [],
      };
      let contentFeedback: GenerationResults['contentFeedback'] = {
        overallScore: 75,
        grade: 'B+',
        topStrengths: ['Clear content structure'],
        topWeaknesses: ['Could improve engagement hooks'],
        improvements: [],
      };

      // When the transcript is very short (e.g. a silent/instrumental video), enrich the
      // analysis context with detected Rekognition labels so the viral predictor has
      // meaningful signal to work with rather than just an empty string.
      const transcriptWordCount = finalTranscript.transcript.trim().split(/\s+/).filter(Boolean).length;
      const analysisContext =
        transcriptWordCount < 15 && visualLabelInsights.length > 0
          ? `[Visual content detected] ${visualLabelInsights.slice(0, 10).map((l) => l.label).join(', ')}. ${finalTranscript.transcript}`.trim()
          : finalTranscript.transcript;

      try {
        const viralResult = await viralPredictor.predictViralScore({
          transcript: analysisContext,
          metadata: {
            duration: metadata.duration,
            platform: 'multi-platform',
            category: 'general',
          },
        });

        if (viralResult.success && viralResult.prediction) {
          viralScore = Math.round(viralResult.prediction.score);

          viralAnalysis = {
            patterns: [
              {
                type: 'hook-strength',
                strength: viralResult.prediction.factors.hook / 100,
                description: `Hook effectiveness: ${viralResult.prediction.factors.hook > 70 ? 'Strong' : 'Moderate'} opening engagement potential`,
              },
              {
                type: 'emotional-appeal',
                strength: viralResult.prediction.factors.emotion / 100,
                description: `Emotional resonance: ${viralResult.prediction.factors.emotion > 70 ? 'High' : 'Moderate'} emotional impact`,
              },
              {
                type: 'pacing',
                strength: viralResult.prediction.factors.pacing / 100,
                description: `Content pacing: ${viralResult.prediction.factors.pacing > 70 ? 'Optimal' : 'Acceptable'} for audience retention`,
              },
              ...visualPatterns,
            ],
            hooks: [
              {
                timestamp: '0:00',
                type: 'opening',
                impact: viralResult.prediction.factors.hook > 80 ? 'high' : viralResult.prediction.factors.hook > 60 ? 'medium' : 'low',
                description: 'Opening hook effectiveness based on AI analysis',
              },
            ],
            recommendations: viralResult.prediction.suggestions || [],
          };

          if (visualPatterns.length > 0) {
            viralAnalysis.recommendations.push('Highlight recurring visual objects/scenes in titles and thumbnails.');
          }

          const getGrade = (score: number) => {
            if (score >= 90) return 'A';
            if (score >= 85) return 'A-';
            if (score >= 80) return 'B+';
            if (score >= 75) return 'B';
            if (score >= 70) return 'B-';
            if (score >= 65) return 'C+';
            if (score >= 60) return 'C';
            return 'C-';
          };

          contentFeedback = {
            overallScore: viralScore,
            grade: getGrade(viralScore),
            topStrengths: [
              viralResult.prediction.factors.hook > 70 ? 'Strong opening hook' : 'Clear narrative structure',
              viralResult.prediction.factors.emotion > 70 ? 'High emotional engagement' : 'Informative content',
              viralResult.prediction.factors.pacing > 70 ? 'Well-paced delivery' : 'Structured flow',
              ...(visualPatterns.length > 0 ? ['Strong visual context detected from video frames'] : []),
            ],
            topWeaknesses: viralResult.prediction.suggestions.slice(0, 2).map((s) => s.split('.')[0]),
            improvements: viralResult.prediction.suggestions.map((suggestion, i) => ({
              aspect: `improvement-${i + 1}`,
              current: 'Current approach',
              suggested: suggestion,
              impact: i === 0 ? 'high' : 'medium',
              reasoning: 'AI-recommended improvement based on viral factor analysis',
            })),
          };
        }
      } catch (error: any) {
        logger.warn('Viral predictor failed; using default estimates', {
          jobId,
          error: error?.message || String(error),
        });
      }

      // Domain detection now happens before content generation (see above)
      // domainInfo is already populated

      const generatedAt = new Date().toISOString();
      const expiresAt = new Date(Date.now() + RESULTS_TTL).toISOString();
      const baseReach = viralScore > 80 ? 15000 : viralScore > 60 ? 8000 : 4000;
      const engagementRate = viralScore > 80 ? 0.12 : viralScore > 60 ? 0.08 : 0.05;

      const results: GenerationResults = {
        jobId,
        videoId: fileId,
        userId,
        platforms: generatedPlatforms as GenerationResults['platforms'],
        viralScore,
        analytics: {
          estimatedReach: Math.round(baseReach * (1 + Math.random() * 0.3)),
          estimatedEngagement: Math.round(baseReach * engagementRate),
          contentQualityScore: viralScore,
          viralPotential: viralScore,
          detectedDomain: domainInfo.domain,
          domainConfidence: Math.round(domainInfo.confidence * 100),
        },
        viralAnalysis,
        contentFeedback,
        safetyCheck: {
          isSafe: true,
          violations: [],
          suggestions: [],
        },
        generatedAt,
        expiresAt,
      };

      await processingPipeline.completeJob(jobId, results);
      logger.info('Queued processing job completed', { jobId, fileId });
    } catch (error: any) {
      await processingPipeline.failJob(jobId, error instanceof Error ? error.message : 'Unknown error');
      logger.error('Queued processing job failed', { jobId, error });
      throw error;
    }
  }
}

export const processingJobProcessorService = new ProcessingJobProcessorService();
export { ProcessingJobProcessorService };
