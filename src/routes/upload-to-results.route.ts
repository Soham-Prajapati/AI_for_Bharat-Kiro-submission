import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.middleware';
import { ValidationError, NotFoundError } from '../types/errors';
import { processingPipeline } from '../services/processing-pipeline.service';
import { sqsService } from '../services/sqs.service';
import { processingJobProcessorService } from '../services/processing-job-processor.service';
import { hasSQSConfig } from '../config/aws';
import { Platform } from '../types/upload-to-results';

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

/**
 * Enqueue processing instead of executing synchronously.
 * Worker service will consume SQS messages and run Transcribe/Rekognition/AI steps.
 */
router.post('/process', asyncHandler(async (req: Request, res: Response) => {
  const {
    fileId,
    fileName,
    mimeType,
    userId = 'anonymous',
    platforms,
    localPath,
    url,
    domain,
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

  const job = await processingPipeline.createJob(fileId, userId);

  const jobPayload = {
    jobId: job.jobId,
    fileId,
    fileName,
    mimeType,
    userId,
    platforms: selectedPlatforms,
    localPath,
    url,
    domain,
  };

  // Always process inline — SQS was causing in-memory state desync in
  // single-server setup: SQS worker sometimes runs before job is in cache,
  // silently aborting all updateJob calls and leaving jobs stuck at 5%.
  await processingPipeline.updateJob(job.jobId, {
    status: 'pending',
    progress: 5,
    currentStep: 'Starting processing...',
  });
  processingJobProcessorService.processJob(jobPayload).catch(() => {
    // errors are persisted to the job record by processJob itself
  });

  // Also send to SQS best-effort for any external workers (non-blocking)
  if (hasSQSConfig()) {
    sqsService.sendProcessingJob(jobPayload).catch(() => {});
  }

  res.json({
    success: true,
    jobId: job.jobId,
    status: 'pending',
    message: 'Job processing started',
  });
}));

router.get('/status/:jobId', asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = req.params;
  const job = await processingPipeline.getJob(jobId);

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
  const results = await processingPipeline.getResults(jobId);

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
