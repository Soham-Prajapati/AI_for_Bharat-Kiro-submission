/**
 * ROI API Route
 * GET /api/roi/:userId - Calculate ROI for user
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.middleware';
import { ValidationError } from '../types/errors';
import { ROICalculatorService } from '../services/roi-calculator.service';

const router = Router();
const roiCalculatorService = new ROICalculatorService();

/**
 * GET /api/roi/:userId
 * Calculate time and money saved by using AI
 */
router.get('/:userId', asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { videosProcessed = 10 } = req.query;

  if (!userId) {
    throw new ValidationError('userId required');
  }

  const roi = roiCalculatorService.calculateUserROI(userId, Number(videosProcessed));

  res.json(roi);
}));

export default router;
