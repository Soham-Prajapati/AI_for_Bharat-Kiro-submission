/**
 * DNA Analysis API Route
 * POST /api/dna/analyze - Analyze creator's content DNA
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.middleware';
import { ValidationError } from '../types/errors';
import { DNAAnalysisService } from '../services/dna-analysis.service';

const dnaAnalysisService = new DNAAnalysisService();

const router = Router();

/**
 * POST /api/dna/analyze
 * Analyze creator's past content to build personality profile
 */
router.post('/analyze', asyncHandler(async (req: Request, res: Response) => {
  const { userId, videoIds } = req.body;

  if (!userId || !videoIds || !Array.isArray(videoIds) || videoIds.length === 0) {
    throw new ValidationError('userId and videoIds[] (non-empty array) required');
  }

  const profile = await dnaAnalysisService.analyzeCreatorDNA({ userId, videoIds });

  res.json({
    success: true,
    userId,
    videoCount: videoIds.length,
    profile,
    analyzedAt: new Date().toISOString()
  });
}));

export default router;
