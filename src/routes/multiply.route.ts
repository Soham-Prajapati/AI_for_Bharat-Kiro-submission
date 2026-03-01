import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.middleware';
import { ValidationError } from '../types/errors';
import { contentMultiplierV2Service } from '../services/content-multiplier-v2.service';

const router = Router();

// POST /api/multiply/generate - Generate multiple content pieces
// @deprecated Use /api/multiply-v2/generate instead
router.post('/generate', asyncHandler(async (req: Request, res: Response) => {
  const { videoId, transcript, platforms } = req.body;

  if (!transcript) {
    throw new ValidationError('transcript is required');
  }

  if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
    throw new ValidationError('platforms array is required');
  }

  const result = await contentMultiplierV2Service.multiplyContent({
    transcript,
    platforms,
    videoId: videoId || `video-${Date.now()}`,
    duration: req.body.duration || 600,
    contentTypes: req.body.contentTypes || ['short', 'post', 'quote'],
    variations: req.body.variations || 1
  });

  res.json(result);
}));

export default router;
