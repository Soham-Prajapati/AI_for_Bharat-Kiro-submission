/**
 * Viral Score API Route
 * POST /api/viral/predict - Predict content virality
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.middleware';
import { ValidationError } from '../types/errors';
import { ViralPredictorService } from '../services/viral-predictor.service';

const router = Router();
const viralPredictorService = new ViralPredictorService();

/**
 * POST /api/viral/predict
 * Predict viral score for content based on transcript and metadata
 */
router.post('/predict', asyncHandler(async (req: Request, res: Response) => {
  const { transcript, metadata } = req.body;

  if (!transcript) {
    throw new ValidationError('transcript required');
  }

  const prediction = await viralPredictorService.predictViralScore({
    transcript,
    metadata: metadata || {}
  });

  res.json(prediction);
}));

export default router;
