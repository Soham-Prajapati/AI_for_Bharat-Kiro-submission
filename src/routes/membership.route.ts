import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.middleware';
import { ValidationError } from '../types/errors';

const router = Router();

// POST /api/membership/subscribe - Subscribe to tier
router.post('/subscribe', asyncHandler(async (req: Request, res: Response) => {
  const { userId, tier, paymentMethod } = req.body;

  if (!userId || !tier) {
    throw new ValidationError('userId and tier are required');
  }

  const validTiers = ['free', 'pro', 'enterprise'];
  if (!validTiers.includes(tier)) {
    throw new ValidationError(`tier must be one of: ${validTiers.join(', ')}`);
  }

  // TODO: Integrate with Stripe subscriptions
  const subscription = {
    id: `sub-${Date.now()}`,
    userId,
    tier,
    status: 'active',
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600000).toISOString(),
    createdAt: new Date().toISOString()
  };

  res.json({ success: true, subscription });
}));

// POST /api/membership/cancel - Cancel subscription
router.post('/cancel', asyncHandler(async (req: Request, res: Response) => {
  const { subscriptionId, userId } = req.body;

  if (!subscriptionId || !userId) {
    throw new ValidationError('subscriptionId and userId are required');
  }

  // TODO: Cancel Stripe subscription
  res.json({
    success: true,
    message: 'Subscription cancelled',
    cancelledAt: new Date().toISOString()
  });
}));

// GET /api/membership/status - Get subscription status
router.get('/status', asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.query;

  if (!userId) {
    throw new ValidationError('userId is required');
  }

  // TODO: Fetch from database
  const mockStatus = {
    userId,
    tier: 'pro',
    status: 'active',
    features: ['unlimited_uploads', 'priority_support', 'advanced_analytics']
  };

  res.json(mockStatus);
}));

export default router;
