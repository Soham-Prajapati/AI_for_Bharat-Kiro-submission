import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.middleware';
import { ValidationError } from '../types/errors';
import { marketplaceService } from '../services/marketplace.service';

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

  // Uses the actual marketplace service
  const newListing = await marketplaceService.createListing({
    sellerId: userId,
    title,
    description,
    category: type,
    price,
    currency: req.body.currency || 'USD',
    license: req.body.license || 'personal',
    tags: req.body.tags || [],
    fileUrl
  });

  res.json({ success: true, listing: newListing });
}));

// POST /api/marketplace/purchase - Purchase listing
router.post('/purchase', asyncHandler(async (req: Request, res: Response) => {
  const { listingId, userId, paymentMethod } = req.body;

  if (!listingId || !userId) {
    throw new ValidationError('listingId and userId are required');
  }

  // Uses the actual marketplace service
  const transaction = await marketplaceService.purchaseListing({
    listingId,
    buyerId: userId,
    paymentMethod: paymentMethod || 'mock',
    paymentToken: req.body.paymentToken || 'mock-token'
  });

  res.json({ success: true, transaction, downloadUrl: transaction.downloadUrl || 'https://mock-download.com/file' });
}));

// GET /api/marketplace/listings - Get all listings
router.get('/listings', asyncHandler(async (req: Request, res: Response) => {
  const { type, search, limit = 20 } = req.query;

  // Uses the actual marketplace service
  const listingsResponse = await marketplaceService.searchListings(
    req.query.search as string | undefined,
    { category: type as any },
    1,
    Number(limit)
  );

  res.json({ listings: listingsResponse.listings, total: listingsResponse.total });
}));

export default router;
