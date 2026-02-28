import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.middleware';
import { ValidationError } from '../types/errors';
import { viralIntelligenceService } from '../services/viral-intelligence.service';

const router = Router();

// POST /api/dopamine/optimize - Optimize content for engagement
router.post('/optimize', asyncHandler(async (req: Request, res: Response) => {
  const { transcript, videoId } = req.body;

  if (!transcript || transcript.length === 0) {
    throw new ValidationError('transcript is required');
  }

  const optimization = await viralIntelligenceService.optimizeEngagement({
    content: transcript,
    contentType: 'video_script'
  });

  res.json(optimization);
}));

export default router;
