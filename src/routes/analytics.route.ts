/**
 * Analytics API Route
 * GET /api/analytics/:userId - Get cross-platform analytics
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.middleware';
import { ValidationError } from '../types/errors';
import { EcosystemAnalyticsService } from '../services/ecosystem-analytics.service';
import { CacheService } from '../services/cache.service';

const router = Router();
const ecosystemAnalyticsService = new EcosystemAnalyticsService();
const cacheService = new CacheService();

const CACHE_TTL = 3600; // 1 hour

/**
 * GET /api/analytics/:userId
 * Get aggregated cross-platform analytics for a creator
 */
router.get('/:userId', asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ValidationError('userId required');
  }

  const cacheKey = `analytics:${userId}`;
  
  // Check cache first
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json({
      success: true,
      userId,
      analytics: cached,
      cached: true,
      fetchedAt: new Date().toISOString()
    });
  }

  // Fetch fresh data
  const analytics = await ecosystemAnalyticsService.getEcosystemAnalytics(userId);
  
  // Cache for 1 hour
  cacheService.set(cacheKey, analytics, CACHE_TTL);

  res.json({
    success: true,
    userId,
    analytics,
    cached: false,
    fetchedAt: new Date().toISOString()
  });
}));

export default router;
