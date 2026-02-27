import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.middleware';
import { CacheService } from '../services/cache.service';

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

  // TODO: Replace with real regional-network.service.ts
  const mockCreators = {
    region,
    language,
    creators: [
      { id: 'c1', name: 'Creator 1', region: 'North', language: 'hi', followers: 50000 },
      { id: 'c2', name: 'Creator 2', region: 'South', language: 'ta', followers: 75000 }
    ],
    source: 'mock'
  };

  await cache.set(cacheKey, JSON.stringify(mockCreators), 600);
  res.json(mockCreators);
}));

// POST /api/regional/collab - Request collaboration
router.post('/collab', asyncHandler(async (req: Request, res: Response) => {
  const { fromUserId, toUserId, message } = req.body;

  // TODO: Replace with real regional-network.service.ts
  res.json({
    collabId: `collab_${Date.now()}`,
    fromUserId,
    toUserId,
    status: 'pending',
    createdAt: new Date().toISOString(),
    source: 'mock'
  });
}));

export default router;
