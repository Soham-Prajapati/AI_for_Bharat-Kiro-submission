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
  // Mock creator database
  const allCreators = [
    // North region
    { id: 'c1', name: 'Creator 1', region: 'North', language: 'hi', followers: 50000 },
    { id: 'c2', name: 'Creator 2', region: 'North', language: 'hi', followers: 45000 },
    { id: 'c3', name: 'Creator 3', region: 'North', language: 'pa', followers: 30000 },
    { id: 'c4', name: 'Creator 4', region: 'North', language: 'mr', followers: 35000 },
    // South region
    { id: 'c5', name: 'Creator 5', region: 'South', language: 'ta', followers: 75000 },
    { id: 'c6', name: 'Creator 6', region: 'South', language: 'ta', followers: 60000 },
    { id: 'c7', name: 'Creator 7', region: 'South', language: 'te', followers: 55000 },
    { id: 'c8', name: 'Creator 8', region: 'South', language: 'kn', followers: 40000 },
    { id: 'c9', name: 'Creator 9', region: 'South', language: 'ml', followers: 38000 },
    // East region
    { id: 'c10', name: 'Creator 10', region: 'East', language: 'bn', followers: 65000 },
    { id: 'c11', name: 'Creator 11', region: 'East', language: 'bn', followers: 48000 },
    // West region
    { id: 'c12', name: 'Creator 12', region: 'West', language: 'gu', followers: 42000 },
    { id: 'c13', name: 'Creator 13', region: 'West', language: 'gu', followers: 37000 },
    { id: 'c14', name: 'Creator 14', region: 'West', language: 'mr', followers: 33000 },
  ];

  // Filter creators based on query parameters
  let filteredCreators = allCreators;
  
  if (region) {
    filteredCreators = filteredCreators.filter(c => c.region === region);
  }
  
  if (language) {
    filteredCreators = filteredCreators.filter(c => c.language === language);
  }

  const mockCreators = {
    region,
    language,
    creators: filteredCreators,
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
