/**
 * POST /api/ideate
 *
 * AI-First mode: creator describes an idea in text.
 * Bedrock generates a full script + platform-ready content with no video upload.
 */

import { Router, Request, Response } from 'express';
import { bedrockContentService } from '../services/bedrock-content.service';
import { asyncHandler } from '../middleware/asyncHandler.middleware';
import { ValidationError } from '../types/errors';

const router = Router();

const TARGET_PLATFORMS = ['youtube', 'instagram', 'tiktok', 'twitter', 'linkedin', 'blog', 'podcast'];

router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const { idea, domain = 'general', targetPlatforms, tone, targetAudience } = req.body;

  if (!idea || typeof idea !== 'string' || idea.trim().length < 10) {
    throw new ValidationError('idea must be at least 10 characters');
  }

  const platforms = Array.isArray(targetPlatforms) && targetPlatforms.length
    ? targetPlatforms
    : TARGET_PLATFORMS;

  // Build a rich "transcript" from the idea so the content service has full context
  const enrichedTranscript = [
    `CONTENT IDEA: ${idea.trim()}`,
    tone           ? `DESIRED TONE: ${tone}` : '',
    targetAudience ? `TARGET AUDIENCE: ${targetAudience}` : '',
    '',
    'TASK: This is an AI-First creation request — no video exists yet.',
    'Generate a complete script, platform content, hooks, titles, and descriptions as if you are producing this content from scratch.',
    'Be specific, creative, and optimised for virality on each platform.',
  ].filter(Boolean).join('\n');

  const results = await bedrockContentService.generateContent({
    transcript: enrichedTranscript,
    keyPoints:  [],
    metadata:   { fileId: `idea-${Date.now()}`, duration: 0, fileName: '', mimeType: '', size: 0, localPath: '', uploadedAt: new Date().toISOString() } as any,
    platforms:  platforms as any[],
    domain,
  });

  res.json({ success: true, results, domain, idea: idea.trim() });
}));

export default router;
