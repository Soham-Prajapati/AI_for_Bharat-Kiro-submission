import { Router, Request, Response } from 'express';
import { bedrockService } from '../services/bedrock.service';
import { transcribeService } from '../services/transcription.service';
import { cacheService } from '../services/cache.service';
import { asyncHandler } from '../middleware/asyncHandler.middleware';
import { ValidationError, NotFoundError, AWSError } from '../types/errors';

const router = Router();

router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const { jobId, platforms, language = 'en', creatorMode = 'hybrid' } = req.body;

  if (!jobId || !platforms || !Array.isArray(platforms)) {
    throw new ValidationError('jobId and platforms[] required');
  }

  try {
    const transcriptData = await transcribeService.getTranscriptionStatus(jobId);
    const generationId = `gen-${Date.now()}`;
    
    const results: Record<string, any> = {};
    for (const platform of platforms) {
      results[platform] = await bedrockService.generatePlatformContent(
        transcriptData.transcript || '',
        platform,
        language
      );
    }

    cacheService.set(generationId, { jobId, results, creatorMode }, 3600);

    res.json({
      success: true,
      generationId,
      jobId,
      status: 'completed',
      language,
      creatorMode,
      results
    });
  } catch (error: any) {
    throw new AWSError(error.message || 'Generation failed', 'Bedrock');
  }
}));

router.get('/:generationId', asyncHandler(async (req: Request, res: Response) => {
  const { generationId } = req.params;
  const cached = cacheService.get(generationId);

  if (!cached) {
    throw new NotFoundError('Generation not found');
  }

  res.json({
    generationId,
    status: 'completed',
    ...cached
  });
}));

export default router;
