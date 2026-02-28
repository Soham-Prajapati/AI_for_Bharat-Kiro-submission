import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.middleware';
import { ValidationError } from '../types/errors';
import { localizationService } from '../services/localization.service';

const router = Router();

// POST /api/vernacular/translate - Translate to Indian languages
router.post('/translate', asyncHandler(async (req: Request, res: Response) => {
  const { content, targetLanguage } = req.body;

  if (!content || !targetLanguage) {
    throw new ValidationError('content and targetLanguage required');
  }

  const translation = await localizationService.translateToLanguage(content, targetLanguage);

  res.json(translation);
}));

export default router;
