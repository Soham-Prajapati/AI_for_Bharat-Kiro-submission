import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.middleware';
import { CacheService } from '../services/cache.service';
import { unifiedAnalyticsService } from '../services/unified-analytics.service';

const router = Router();
const cache = new CacheService();

// GET /api/analytics-dashboard/metrics - Get comprehensive metrics
router.get('/metrics', asyncHandler(async (req: Request, res: Response) => {
  const { userId, timeRange = '30d' } = req.query;
  const cacheKey = `analytics:metrics:${userId}:${timeRange}`;
  const cached = await cache.get(cacheKey);

  if (cached) {
    return res.json(JSON.parse(cached as string));
  }

  const metrics = await unifiedAnalyticsService.getDashboardMetrics(userId as string, timeRange as string);

  await cache.set(cacheKey, JSON.stringify(metrics), 600); // 10 min cache
  res.json(metrics);
}));

export default router;
