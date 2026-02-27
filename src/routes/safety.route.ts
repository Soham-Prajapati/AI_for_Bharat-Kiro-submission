import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.middleware';
import { ValidationError } from '../types/errors';

const router = Router();

// POST /api/safety/check - Check content safety
router.post('/check', asyncHandler(async (req: Request, res: Response) => {
  const { content, contentType } = req.body;

  if (!content || !contentType) {
    throw new ValidationError('content and contentType required');
  }

  // TODO: Replace with real safety.service.ts (AWS Rekognition + Bedrock)
  const mockSafety = {
    safe: true,
    violations: [],
    suggestions: [],
    confidence: 0.98,
    categories: {
      violence: 0.01,
      adult: 0.02,
      hate: 0.00,
      spam: 0.03
    },
    source: 'mock'
  };

  res.json(mockSafety);
}));

export default router;
