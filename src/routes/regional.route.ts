import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.middleware';
import { CacheService } from '../services/cache.service';
import { ValidationError } from '../types/errors';
import { regionalNetworkService, RegionType, LanguageType } from '../services/regional-network.service';

const router = Router();
const cache = new CacheService();

// GET /api/regional/creators - Get creators by region
router.get('/creators', asyncHandler(async (req: Request, res: Response) => {
  const { region, language } = req.query;
  const cacheKey = `regional:creators:${region}:${language}`;
  const cached = await cache.get(cacheKey);

  if (cached) {
    return res.json(JSON.parse(cached as string));
  }

  // Uses the actual regional network service
  const creators = await regionalNetworkService.getCreatorsByRegion(
    (region as RegionType) || 'north',
    language ? { language: language as LanguageType } : undefined
  );

  const response = {
    region,
    language,
    creators
  };

  await cache.set(cacheKey, JSON.stringify(response), 600);
  res.json(response);
}));

// POST /api/regional/collab - Request collaboration
router.post('/collab', asyncHandler(async (req: Request, res: Response) => {
  const { fromUserId, toUserId, message } = req.body;

  // Uses the actual regional network service
  const collabRequest = await regionalNetworkService.createCollaborationRequest(
    fromUserId,
    toUserId,
    message || 'Would love to collaborate!',
    req.body.collabType || 'video'
  );

  res.json(collabRequest);
}));

export default router;
