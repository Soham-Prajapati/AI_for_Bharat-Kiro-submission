import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.middleware';
import { ValidationError } from '../types/errors';

const router = Router();

// POST /api/marketplace/list - Create marketplace listing
router.post('/list', asyncHandler(async (req: Request, res: Response) => {
  const { title, description, price, type, userId, fileUrl } = req.body;

  if (!title || !price || !type || !userId) {
    throw new ValidationError('title, price, type, and userId are required');
  }

  if (price < 0) {
    throw new ValidationError('price must be positive');
  }

  const validTypes = ['template', 'script', 'thumbnail', 'music', 'effect'];
  if (!validTypes.includes(type)) {
    throw new ValidationError(`type must be one of: ${validTypes.join(', ')}`);
  }

  // TODO: Replace with real marketplace.service.ts
  const listing = {
    id: `listing-${Date.now()}`,
    title,
    description,
    price,
    type,
    userId,
    fileUrl,
    status: 'active',
    createdAt: new Date().toISOString()
  };

  res.json({ success: true, listing });
}));

// POST /api/marketplace/purchase - Purchase listing
router.post('/purchase', asyncHandler(async (req: Request, res: Response) => {
  const { listingId, userId, paymentMethod } = req.body;

  if (!listingId || !userId) {
    throw new ValidationError('listingId and userId are required');
  }

  // TODO: Integrate with Stripe/Razorpay when ready
  const transaction = {
    id: `txn-${Date.now()}`,
    listingId,
    userId,
    amount: 99.99,
    status: 'completed',
    paymentMethod: paymentMethod || 'mock',
    purchasedAt: new Date().toISOString()
  };

  res.json({ success: true, transaction, downloadUrl: 'https://mock-download.com/file' });
}));

// GET /api/marketplace/listings - Get all listings
router.get('/listings', asyncHandler(async (req: Request, res: Response) => {
  const { type, search, limit = 20 } = req.query;

  // TODO: Replace with real database query
  const mockListings = Array.from({ length: Number(limit) }, (_, i) => ({
    id: `listing-${i}`,
    title: `${type || 'Content'} Template ${i}`,
    price: 9.99 + i,
    type: type || 'template',
    rating: 4.5,
    sales: Math.floor(Math.random() * 100)
  }));

  res.json({ listings: mockListings, total: mockListings.length });
}));

export default router;
