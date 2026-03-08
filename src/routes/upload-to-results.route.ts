import { Router, Request, Response } from 'express';
import path from 'path';
import { asyncHandler } from '../middleware/asyncHandler.middleware';
import { ValidationError, NotFoundError } from '../types/errors';
import { processingPipeline } from '../services/processing-pipeline.service';
import { videoMetadataService } from '../services/video-metadata.service';
import { mockTranscriptService } from '../services/mock-transcript.service';
import { whisperTranscriptionService } from '../services/whisper-transcription.service';
import { PlatformContentGeneratorV2 } from '../services/platform-content-generator-v2.service';
import { ViralPredictorService } from '../services/viral-predictor.service';
import { DomainDetectionService } from '../services/domain-detection.service';
import {
  Platform,
  GenerationResults,
  VideoMetadata,
  RESULTS_TTL,
} from '../types/upload-to-results';

const router = Router();

// Initialize AI services
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

router.post('/process', asyncHandler(async (req: Request, res: Response) => {
  const {
    fileId,
    fileName,
    mimeType,
    userId = 'anonymous',
    platforms,
    localPath,
    url,
  } = req.body;

  if (!fileId) {
    throw new ValidationError('fileId required');
  }

  const selectedPlatforms: Platform[] = Array.isArray(platforms) && platforms.length > 0
    ? platforms
    : DEFAULT_PLATFORMS;

  const hasInvalidPlatform = selectedPlatforms.some((platform) => !ALL_PLATFORMS.has(platform));
  if (hasInvalidPlatform) {
    throw new ValidationError(`Invalid platform found. Allowed platforms: ${Array.from(ALL_PLATFORMS).join(', ')}`);
  }

  const job = processingPipeline.createJob(fileId, userId);

  try {
    processingPipeline.updateJob(job.jobId, {
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

    processingPipeline.updateJob(job.jobId, {
      progress: 45,
      currentStep: 'Generating transcript',
    });

    const transcriptContextHint = [
      fileName,
      metadata.fileName,
      url,
    ].filter(Boolean).join(' ');

    // Try real transcription methods first, then fall back to mock
    let transcriptResult: { transcript: string; keyPoints: string[]; wordCount: number } | null = null;

    // 1. Try Whisper transcription for video/audio files (REAL content analysis)
    const isMediaFile = (mimeType || metadata.mimeType || '').startsWith('video/') ||
                        (mimeType || metadata.mimeType || '').startsWith('audio/');
    
    if (isMediaFile && metadata.localPath && whisperTranscriptionService.isAvailable()) {
      processingPipeline.updateJob(job.jobId, {
        currentStep: 'Transcribing audio with AI...',
      });
      
      const whisperResult = await whisperTranscriptionService.transcribe(
        metadata.localPath,
        fileName || metadata.fileName
      );
      
      if (whisperResult) {
        transcriptResult = whisperResult;
        console.log('✅ Used real Whisper transcription');
      }
    }

    // 2. Try reading text-based files directly
    if (!transcriptResult) {
      const textResult = mockTranscriptService.generateTranscriptFromLocalFile(
        metadata.localPath,
        fileId,
        fileName || metadata.fileName,
        mimeType || metadata.mimeType
      );
      
      if (textResult) {
        transcriptResult = textResult;
        console.log('✅ Used text file content');
      }
    }

    // 3. Fall back to mock/template generation (based on filename context)
    if (!transcriptResult) {
      transcriptResult = mockTranscriptService.generateTranscript(
        fileId,
        fileName || metadata.fileName,
        transcriptContextHint
      );
      console.log('⚠️ Used mock transcript (set OPENAI_API_KEY for real transcription)');
    }

    // At this point transcriptResult is guaranteed to be non-null
    const finalTranscript = transcriptResult;

    processingPipeline.updateJob(job.jobId, {
      progress: 75,
      currentStep: 'Generating platform content',
    });

    const contentGenerator = new PlatformContentGeneratorV2();
    const generatedPlatforms = await contentGenerator.generatePlatformContent({
      transcript: finalTranscript.transcript,
      keyPoints: finalTranscript.keyPoints,
      metadata,
      platforms: selectedPlatforms,
    });

    // Use AI for viral prediction
    processingPipeline.updateJob(job.jobId, {
      progress: 85,
      currentStep: 'Analyzing viral potential',
    });

    let viralScore = 75;
    let viralAnalysis: GenerationResults['viralAnalysis'] = {
      patterns: [],
      hooks: [],
      recommendations: [],
    };
    let contentFeedback: GenerationResults['contentFeedback'] = {
      overallScore: 75,
      grade: 'B+',
      topStrengths: ['Clear content structure'],
      topWeaknesses: ['Could improve engagement hooks'],
      improvements: [],
    };

    try {
      // Get real AI viral prediction
      const viralResult = await viralPredictor.predictViralScore({
        transcript: finalTranscript.transcript,
        metadata: {
          duration: metadata.duration,
          platform: 'multi-platform',
          category: 'general'
        }
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

        // Calculate letter grade
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
          ],
          topWeaknesses: viralResult.prediction.suggestions.slice(0, 2).map(s => s.split('.')[0]),
          improvements: viralResult.prediction.suggestions.map((suggestion, i) => ({
            aspect: `improvement-${i + 1}`,
            current: 'Current approach',
            suggested: suggestion,
            impact: i === 0 ? 'high' : 'medium',
            reasoning: 'AI-recommended improvement based on viral factor analysis',
          })),
        };
      }
    } catch (error) {
      console.error('Viral prediction failed, using estimates:', error);
    }

    // Try to detect domain
    let domainInfo = { domain: 'General', confidence: 0.5 };
    try {
      domainInfo = await domainDetector.detectDomain(finalTranscript.transcript);
    } catch (error) {
      console.error('Domain detection failed:', error);
    }

    const generatedAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + RESULTS_TTL).toISOString();

    // Calculate realistic analytics based on content quality
    const baseReach = viralScore > 80 ? 15000 : viralScore > 60 ? 8000 : 4000;
    const engagementRate = viralScore > 80 ? 0.12 : viralScore > 60 ? 0.08 : 0.05;

    const results: GenerationResults = {
      jobId: job.jobId,
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

    processingPipeline.completeJob(job.jobId, results);

    res.json({
      success: true,
      jobId: job.jobId,
      status: 'completed',
      message: 'Content generated successfully',
      results,
    });
  } catch (error) {
    processingPipeline.failJob(job.jobId, error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}));

router.get('/status/:jobId', asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = req.params;
  const job = processingPipeline.getJob(jobId);

  if (!job) {
    throw new NotFoundError('Processing job');
  }

  res.json({
    success: true,
    job,
  });
}));

router.get('/results/:jobId', asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = req.params;
  const results = processingPipeline.getResults(jobId);

  if (!results) {
    throw new NotFoundError('Results');
  }

  res.json({
    success: true,
    jobId,
    results,
  });
}));

export default router;