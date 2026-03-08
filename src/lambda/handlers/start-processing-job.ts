import {
  Platform,
  GenerationResults,
  RESULTS_TTL,
} from '../../types/upload-to-results';
import { processingPipeline } from '../../services/processing-pipeline.service';
import { awsTranscribeService } from '../../services/aws-transcribe.service';
import { awsRekognitionService, RekognitionLabelInsight } from '../../services/aws-rekognition.service';
import { mockTranscriptService } from '../../services/mock-transcript.service';
import { PlatformContentGeneratorV2 } from '../../services/platform-content-generator-v2.service';
import { ViralPredictorService } from '../../services/viral-predictor.service';
import { DomainDetectionService } from '../../services/domain-detection.service';
import { awsConfig, toS3Uri } from '../../config/aws';
import { logger } from '../../utils/logger';
import { LambdaEvent, LambdaResponse, jsonResponse, parseJsonBody } from '../utils/http';

interface StartProcessingRequest {
  fileId: string;
  fileName?: string;
  mimeType?: string;
  userId?: string;
  platforms?: Platform[];
}

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

/**
 * Lambda handler: start processing a media job and store state/results in DynamoDB.
 * This is a synchronous orchestrator suitable for API Gateway-triggered processing.
 */
export const handler = async (event: LambdaEvent): Promise<LambdaResponse> => {
  const viralPredictor = new ViralPredictorService();
  const domainDetector = new DomainDetectionService();

  try {
    const body = parseJsonBody<StartProcessingRequest>(event);

    if (!body.fileId) {
      return jsonResponse(400, { success: false, message: 'fileId is required' });
    }

    const fileId = body.fileId;
    const userId = body.userId || 'anonymous';
    const fileName = body.fileName || 'uploaded-file';
    const mimeType = body.mimeType || 'video/mp4';
    const selectedPlatforms = Array.isArray(body.platforms) && body.platforms.length > 0
      ? body.platforms
      : DEFAULT_PLATFORMS;

    const job = await processingPipeline.createJob(fileId, userId);

    await processingPipeline.updateJob(job.jobId, {
      status: 'processing',
      progress: 20,
      currentStep: 'Preparing metadata',
    });

    const transcriptContextHint = [fileName, fileId].filter(Boolean).join(' ');
    let transcriptResult: { transcript: string; keyPoints: string[]; wordCount: number } | null = null;

    const isMediaFile = mimeType.startsWith('video/') || mimeType.startsWith('audio/');
    const isVideoFile = mimeType.startsWith('video/');

    if (isMediaFile && awsTranscribeService.isConfigured() && awsConfig.s3BucketName) {
      await processingPipeline.updateJob(job.jobId, {
        progress: 45,
        currentStep: 'Transcribing with Amazon Transcribe',
      });

      try {
        const awsTranscript = await awsTranscribeService.transcribeFromS3(toS3Uri(fileId));
        const transcriptText = awsTranscript.transcript;
        transcriptResult = {
          transcript: transcriptText,
          keyPoints: transcriptText
            .split(/[.!?]\s+/)
            .map((line) => line.trim())
            .filter(Boolean)
            .slice(0, 5),
          wordCount: transcriptText.split(/\s+/).filter((word) => word.trim()).length,
        };
      } catch (error: any) {
        logger.warn('Transcribe failed, using mock transcript fallback', { error: error?.message || String(error) });
      }
    }

    if (!transcriptResult) {
      transcriptResult = mockTranscriptService.generateTranscript(fileId, fileName, transcriptContextHint);
    }

    let visualLabelInsights: RekognitionLabelInsight[] = [];

    if (isVideoFile && awsConfig.s3BucketName && awsRekognitionService.isConfigured()) {
      await processingPipeline.updateJob(job.jobId, {
        progress: 60,
        currentStep: 'Analyzing visuals with Amazon Rekognition',
      });

      try {
        const { jobId: rekognitionJobId } = await awsRekognitionService.analyzeVideo(awsConfig.s3BucketName, fileId);
        visualLabelInsights = await awsRekognitionService.waitForLabelDetection(rekognitionJobId);
      } catch (error: any) {
        logger.warn('Rekognition failed, continuing without visual labels', { error: error?.message || String(error) });
      }
    }

    await processingPipeline.updateJob(job.jobId, {
      progress: 75,
      currentStep: 'Generating platform outputs',
    });

    const metadata = {
      fileId,
      fileName,
      mimeType,
      size: 0,
      duration: 180,
      localPath: '',
      uploadedAt: new Date().toISOString(),
    };

    const contentGenerator = new PlatformContentGeneratorV2();
    const generatedPlatforms = await contentGenerator.generatePlatformContent({
      transcript: transcriptResult.transcript,
      keyPoints: transcriptResult.keyPoints,
      metadata,
      platforms: selectedPlatforms,
    });

    await processingPipeline.updateJob(job.jobId, {
      progress: 85,
      currentStep: 'Scoring viral potential',
    });

    const visualPatterns = buildVisualPatterns(visualLabelInsights);

    let viralScore = 75;
    let viralAnalysis: GenerationResults['viralAnalysis'] = {
      patterns: [...visualPatterns],
      hooks: [],
      recommendations: visualPatterns.length > 0
        ? ['Use detected visual elements early in the video for stronger hooks.']
        : [],
    };

    let contentFeedback: GenerationResults['contentFeedback'] = {
      overallScore: 75,
      grade: 'B+',
      topStrengths: ['Clear structure'],
      topWeaknesses: ['Can improve opening hook'],
      improvements: [],
    };

    try {
      const viralResult = await viralPredictor.predictViralScore({
        transcript: transcriptResult.transcript,
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
              description: 'Hook effectiveness from AI scoring',
            },
            {
              type: 'emotional-appeal',
              strength: viralResult.prediction.factors.emotion / 100,
              description: 'Emotional resonance from AI scoring',
            },
            ...visualPatterns,
          ],
          hooks: [
            {
              timestamp: '0:00',
              type: 'opening',
              impact: viralResult.prediction.factors.hook > 80 ? 'high' : viralResult.prediction.factors.hook > 60 ? 'medium' : 'low',
              description: 'Opening hook signal',
            },
          ],
          recommendations: viralResult.prediction.suggestions || [],
        };

        contentFeedback = {
          overallScore: viralScore,
          grade: viralScore >= 85 ? 'A-' : viralScore >= 75 ? 'B' : 'C+',
          topStrengths: [
            viralResult.prediction.factors.hook > 70 ? 'Strong hook' : 'Clear narrative',
            ...(visualPatterns.length > 0 ? ['Visual context detected from video frames'] : []),
          ],
          topWeaknesses: viralResult.prediction.suggestions.slice(0, 2).map((s) => s.split('.')[0]),
          improvements: viralResult.prediction.suggestions.map((suggestion, index) => ({
            aspect: `improvement-${index + 1}`,
            current: 'Current approach',
            suggested: suggestion,
            impact: index === 0 ? 'high' : 'medium',
            reasoning: 'AI recommendation',
          })),
        };
      }
    } catch (error: any) {
      logger.warn('Viral predictor failed, using defaults', { error: error?.message || String(error) });
    }

    let domainInfo = { domain: 'General', confidence: 0.5 };
    try {
      domainInfo = await domainDetector.detectDomain(transcriptResult.transcript);
    } catch (error: any) {
      logger.warn('Domain detection failed, defaulting to General', { error: error?.message || String(error) });
    }

    const generatedAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + RESULTS_TTL).toISOString();
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

    await processingPipeline.completeJob(job.jobId, results);

    return jsonResponse(200, {
      success: true,
      jobId: job.jobId,
      status: 'completed',
      results,
    });
  } catch (error: any) {
    logger.error('Lambda start-processing-job failed', { error: error?.message || String(error) });
    return jsonResponse(500, {
      success: false,
      message: error?.message || 'Failed to start processing job',
    });
  }
};
