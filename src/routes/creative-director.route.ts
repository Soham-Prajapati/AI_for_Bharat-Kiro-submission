import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.middleware';
import { ValidationError } from '../types/errors';

const router = Router();

// POST /api/creative-director/analyze - Analyze content quality
router.post('/analyze', asyncHandler(async (req: Request, res: Response) => {
  const { contentId, content } = req.body;

  if (!contentId || !content) {
    throw new ValidationError('contentId and content required');
  }

  // TODO: Replace with real creative-director.service.ts
  const mockFeedback = {
    contentId,
    score: {
      structure: 8.5,
      pacing: 7.2,
      engagement: 9.1,
      clarity: 8.8,
      overall: 8.4
    },
    feedback: [
      { aspect: 'hook', rating: 'excellent', comment: 'Strong opening grabs attention' },
      { aspect: 'pacing', rating: 'good', comment: 'Consider shortening middle section' }
    ],
    improvements: [
      'Add more visual elements in the first 30 seconds',
      'Include a clear call-to-action at the end'
    ],
    source: 'mock'
  };

  res.json(mockFeedback);
}));

export default router;
