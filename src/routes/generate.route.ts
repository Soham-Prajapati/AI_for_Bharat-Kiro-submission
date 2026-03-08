import { Router, Request, Response } from 'express';
import { bedrockContentService } from '../services/bedrock-content.service';
import { transcribeService } from '../services/transcription.service';
import { cacheService } from '../services/cache.service';
import { asyncHandler } from '../middleware/asyncHandler.middleware';
import { ValidationError, NotFoundError, AWSError } from '../types/errors';

const router = Router();

router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const { jobId, platforms, language = 'en', creatorMode = 'hybrid', domain } = req.body;

  if (!jobId || !platforms || !Array.isArray(platforms)) {
    throw new ValidationError('jobId and platforms[] required');
  }

  try {
    const transcriptData = await transcribeService.getTranscriptionStatus(jobId);
    const generationId = `gen-${Date.now()}`;

    const results = await bedrockContentService.generateContent({
      transcript: transcriptData.transcript || '',
      keyPoints: [],
      metadata: { fileId: jobId, fileName: jobId, mimeType: 'video/mp4', size: 0, duration: 0, localPath: '', uploadedAt: new Date().toISOString() },
      platforms: platforms as any[],
      domain: domain || 'general',
    });

    cacheService.set(generationId, { jobId, results, creatorMode, domain }, 3600);

    res.json({
      success: true,
      generationId,
      jobId,
      status: 'completed',
      language,
      creatorMode,
      domain,
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
