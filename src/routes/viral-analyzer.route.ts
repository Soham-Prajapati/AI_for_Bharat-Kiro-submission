import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.middleware';
import { ValidationError } from '../types/errors';
import { viralIntelligenceService } from '../services/viral-intelligence.service';

const router = Router();

// POST /api/viral-analyzer/analyze - Analyze viral content
router.post('/analyze', asyncHandler(async (req: Request, res: Response) => {
  const { videoUrl, transcript, content, title, platform, metrics } = req.body;

  if (!videoUrl && !transcript && !content) {
    throw new ValidationError('videoUrl, transcript, or content required');
  }

  const analysis = await viralIntelligenceService.analyzeContent({
    url: videoUrl,
    title: title || 'Untitled',
    transcript: transcript || content || '',
    platform: platform || 'youtube',
    metrics: metrics || {
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      duration: 0,
      publishedDate: new Date().toISOString()
    }
  });

  res.json(analysis);
}));

export default router;
