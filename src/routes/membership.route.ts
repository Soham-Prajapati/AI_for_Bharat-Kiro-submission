import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.middleware';
import { CacheService } from '../services/cache.service';
import { ValidationError } from '../types/errors';

const router = Router();
const cache = new CacheService();

// POST /api/membership/subscribe - Subscribe to a tier
router.post('/subscribe', asyncHandler(async (req: Request, res: Response) => {
  const { userId, tier } = req.body;

  if (!userId || !tier) {
    throw new ValidationError('userId and tier required');
  }

  // TODO: Replace with real membership.service.ts and Stripe integration
  const mockSubscription = {
    subscriptionId: `sub_${Date.now()}`,
    userId,
    tier,
    status: 'active',
    startDate: new Date().toISOString(),
    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    amount: tier === 'pro' ? 999 : tier === 'enterprise' ? 4999 : 0,
    currency: 'INR',
    source: 'mock'
  };

  res.json(mockSubscription);
}));

// POST /api/membership/cancel - Cancel subscription
router.post('/cancel', asyncHandler(async (req: Request, res: Response) => {
  const { subscriptionId } = req.body;

  if (!subscriptionId) {
    throw new ValidationError('subscriptionId required');
  }

  // TODO: Replace with real membership.service.ts and Stripe integration
  const mockCancellation = {
    subscriptionId,
    status: 'cancelled',
    cancelledAt: new Date().toISOString(),
    refund: false,
    source: 'mock'
  };

  res.json(mockCancellation);
}));

// GET /api/membership/status/:userId - Get subscription status
router.get('/status/:userId', asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const cacheKey = `membership:status:${userId}`;
  const cached = await cache.get(cacheKey);

  if (cached) {
    return res.json(JSON.parse(cached as string));
  }

  // TODO: Replace with real membership.service.ts
  const mockStatus = {
    userId,
    tier: 'free',
    status: 'active',
    features: ['basic_generation', 'single_platform'],
    limits: { videosPerMonth: 10, platforms: 1 },
    source: 'mock'
  };

  await cache.set(cacheKey, JSON.stringify(mockStatus), 300); // 5 min cache
  res.json(mockStatus);
}));

export default router;
