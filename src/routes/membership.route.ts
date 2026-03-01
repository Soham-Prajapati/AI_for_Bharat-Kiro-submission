import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.middleware';
import { CacheService } from '../services/cache.service';
import { ValidationError } from '../types/errors';
import { membershipService } from '../services/membership.service';

const router = Router();
const cache = new CacheService();

// POST /api/membership/subscribe - Subscribe to a tier
router.post('/subscribe', asyncHandler(async (req: Request, res: Response) => {
  const { userId, tier } = req.body;

  if (!userId || !tier) {
    throw new ValidationError('userId and tier required');
  }

  // Uses the actual membership service and Stripe integration
  const subscription = await membershipService.subscribe(userId, tier, req.body.paymentMethodId);

  res.json(subscription);
}));

// POST /api/membership/cancel - Cancel subscription
router.post('/cancel', asyncHandler(async (req: Request, res: Response) => {
  const { subscriptionId } = req.body;

  if (!subscriptionId) {
    throw new ValidationError('subscriptionId required');
  }

  // Uses the actual membership service and Stripe integration
  const cancellation = await membershipService.cancelSubscription(subscriptionId, req.body.immediate);

  res.json(cancellation);
}));

// GET /api/membership/status/:userId - Get subscription status
router.get('/status/:userId', asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const cacheKey = `membership:status:${userId}`;
  const cached = await cache.get(cacheKey);

  if (cached) {
    return res.json(JSON.parse(cached as string));
  }

  // Uses the actual membership service
  const userSubscription = await membershipService.getUserSubscription(userId);
  const userUsage = await membershipService.getUsage(userId);
  const tierAccess = await membershipService.getContentAccess(userId);

  const status = {
    userId,
    tier: tierAccess.tier,
    status: userSubscription?.status || 'inactive',
    features: userSubscription ? ['basic_generation', 'single_platform'] : [],
    limits: userUsage.limits,
    usage: userUsage.percentUsed
  };

  await cache.set(cacheKey, JSON.stringify(status), 300); // 5 min cache
  res.json(status);
}));

export default router;
