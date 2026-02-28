/**
 * Cultural Adaptation API Route
 * POST /api/cultural/adapt - Adapt content for regional audiences
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.middleware';
import { ValidationError } from '../types/errors';
import { CulturalAdapterService } from '../services/cultural-adapter.service';

const router = Router();
const culturalAdapterService = new CulturalAdapterService();

/**
 * POST /api/cultural/adapt
 * Adapt content for target region
 */
router.post('/adapt', asyncHandler(async (req: Request, res: Response) => {
  const { content, targetRegion, sourceRegion, contentType } = req.body;

  if (!content || !targetRegion) {
    throw new ValidationError('content and targetRegion required');
  }

  const adapted = await culturalAdapterService.adaptContent({
    content,
    targetRegion,
    sourceRegion: sourceRegion || 'en-US',
    contentType: contentType || 'general'
  });

  res.json(adapted);
}));

export default router;
