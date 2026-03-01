import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.middleware';
import { ValidationError } from '../types/errors';
import { creativeDirectorService } from '../services/creative-director.service';

const router = Router();

// POST /api/creative-director/analyze - Analyze content quality
router.post('/analyze', asyncHandler(async (req: Request, res: Response) => {
  const { contentId, content } = req.body;

  if (!contentId || !content) {
    throw new ValidationError('contentId and content required');
  }

  // Uses the actual creative director service
  const analysisResult = await creativeDirectorService.analyzeContent({
    contentId,
    transcript: content,
    title: req.body.title || 'Untitled',
    platform: req.body.platform || 'youtube'
  });

  res.json(analysisResult);
}));

export default router;
