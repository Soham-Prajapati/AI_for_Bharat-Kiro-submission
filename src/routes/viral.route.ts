/**
 * Viral Score API Route
 * POST /api/viral/predict - Predict content virality
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.middleware';
import { ValidationError } from '../types/errors';
import { viralIntelligenceService } from '../services/viral-intelligence.service';

const router = Router();

/**
 * POST /api/viral/predict
 * Predict viral score for content based on transcript and metadata
 */
router.post('/predict', asyncHandler(async (req: Request, res: Response) => {
  const { transcript, metadata = {} } = req.body;

  if (!transcript || typeof transcript !== 'string' || transcript.trim().length === 0) {
    throw new ValidationError('transcript (non-empty string) required');
  }

  const prediction = await viralIntelligenceService.predict(transcript, metadata);

  res.json({
    success: true,
    prediction,
    analyzedAt: new Date().toISOString()
  });
}));

export default router;
