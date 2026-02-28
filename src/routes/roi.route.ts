/**
 * ROI API Route
 * GET /api/roi/:userId - Calculate ROI for user
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.middleware';
import { ValidationError } from '../types/errors';
import { unifiedAnalyticsService } from '../services/unified-analytics.service';

const router = Router();

/**
 * GET /api/roi/:userId
 * Calculate time and money saved by using AI
 */
router.get('/:userId', asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ValidationError('userId required');
  }

  const roi = await unifiedAnalyticsService.calculateROI(userId);

  res.json({
    success: true,
    userId,
    roi,
    calculatedAt: new Date().toISOString()
  });
}));

export default router;
