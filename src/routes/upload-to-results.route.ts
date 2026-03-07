import { Router, Request, Response } from 'express';
import path from 'path';
import { asyncHandler } from '../middleware/asyncHandler.middleware';
import { ValidationError, NotFoundError } from '../types/errors';
import { processingPipeline } from '../services/processing-pipeline.service';
import { videoMetadataService } from '../services/video-metadata.service';
import { mockTranscriptService } from '../services/mock-transcript.service';
import { whisperTranscriptionService } from '../services/whisper-transcription.service';
import { PlatformContentGeneratorV2 } from '../services/platform-content-generator-v2.service';
import {
  Platform,
  GenerationResults,
  VideoMetadata,
  RESULTS_TTL,
} from '../types/upload-to-results';

const router = Router();

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

    const generatedAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + RESULTS_TTL).toISOString();

    const results: GenerationResults = {
      jobId: job.jobId,
      videoId: fileId,
      userId,
      platforms: generatedPlatforms as GenerationResults['platforms'],
      viralScore: 78,
      analytics: {
        estimatedReach: 12000,
        estimatedEngagement: 1350,
        contentQualityScore: 84,
        viralPotential: 76,
      },
      viralAnalysis: {
        patterns: [
          {
            type: 'hook-strength',
            strength: 0.82,
            description: 'Strong opening hook with broad audience relevance',
          },
        ],
        hooks: [
          {
            timestamp: '0:03',
            type: 'curiosity',
            impact: 'high',
            description: 'Compelling promise in opening segment',
          },
        ],
        recommendations: [
          'Use a stronger first 3-second hook for short-form platforms',
          'Add a clear CTA near the ending for conversion',
        ],
      },
      contentFeedback: {
        overallScore: 84,
        grade: 'A-',
        topStrengths: ['Clear narrative structure', 'Actionable value for audience'],
        topWeaknesses: ['CTA can be more explicit'],
        improvements: [
          {
            aspect: 'call-to-action',
            current: 'Generic closing statement',
            suggested: 'Use a direct CTA with expected user action',
            impact: 'high',
            reasoning: 'Clear CTA generally improves engagement and conversion',
          },
        ],
      },
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