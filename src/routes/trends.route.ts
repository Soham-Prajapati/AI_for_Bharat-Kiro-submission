import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.middleware';
import { CacheService } from '../services/cache.service';
import { trendPredictorService } from '../services/trend-predictor.service';

const router = Router();
const cache = new CacheService();
const CACHE_TTL = 6 * 60 * 60; // 6 hours

// GET /api/trends/current - Get current trending topics
router.get('/current', asyncHandler(async (req: Request, res: Response) => {
  const cacheKey = 'trends:current';
  const cached = await cache.get(cacheKey);

  if (cached) {
    return res.json(JSON.parse(cached as string));
  }

  // Uses the actual trend predictor service
  const currentTrends = await trendPredictorService.getCurrentTrends();

  await cache.set(cacheKey, JSON.stringify(currentTrends), CACHE_TTL);
  res.json(currentTrends);
}));

// GET /api/trends/predict - Predict upcoming trends
router.get('/predict', asyncHandler(async (req: Request, res: Response) => {
  const cacheKey = 'trends:predict';
  const cached = await cache.get(cacheKey);

  if (cached) {
    return res.json(JSON.parse(cached as string));
  }

  // Uses the actual trend predictor service
  // analyzeTrends gives a mix of current, emerging, and predictions
  const predictionResult = await trendPredictorService.analyzeTrends();

  await cache.set(cacheKey, JSON.stringify(predictionResult), CACHE_TTL);
  res.json(predictionResult);
}));

export default router;
