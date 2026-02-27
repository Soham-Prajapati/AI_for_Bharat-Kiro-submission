/**
 * Cultural Adaptation API Route
 * POST /api/cultural/adapt - Adapt content for regional audiences
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.middleware';
import { ValidationError } from '../types/errors';
import { culturalAdapterService } from '../services/cultural-adapter.service';

const router = Router();

/**
 * POST /api/cultural/adapt
 * Adapt content for target region
 */
router.post('/adapt', asyncHandler(async (req: Request, res: Response) => {
  const { content, targetRegion } = req.body;

  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    throw new ValidationError('content (non-empty string) required');
  }

  if (!targetRegion || typeof targetRegion !== 'string') {
    throw new ValidationError('targetRegion (string) required');
  }

  const adaptation = await culturalAdapterService.adapt(content, targetRegion);

  res.json({
    success: true,
    adaptation,
    adaptedAt: new Date().toISOString()
  });
}));

/**
 * GET /api/cultural/regions
 * Get list of supported regions
 */
router.get('/regions', asyncHandler(async (req: Request, res: Response) => {
  const regions = culturalAdapterService.getSupportedRegions();

  res.json({
    success: true,
    regions
  });
}));

export default router;
