import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.middleware';
import { ValidationError } from '../types/errors';

const router = Router();

// POST /api/integrations/connect - Connect platform account
router.post('/connect', asyncHandler(async (req: Request, res: Response) => {
  const { userId, platform, accessToken } = req.body;

  if (!userId || !platform || !accessToken) {
    throw new ValidationError('userId, platform, and accessToken required');
  }

  // TODO: Replace with real platform-integration.service.ts and OAuth
  const mockConnection = {
    connectionId: `conn_${Date.now()}`,
    userId,
    platform,
    status: 'connected',
    connectedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days
    source: 'mock'
  };

  res.json(mockConnection);
}));

// POST /api/integrations/post - Post content to platform
router.post('/post', asyncHandler(async (req: Request, res: Response) => {
  const { connectionId, content, platform } = req.body;

  if (!connectionId || !content || !platform) {
    throw new ValidationError('connectionId, content, and platform required');
  }

  // TODO: Replace with real platform-integration.service.ts
  const mockPost = {
    postId: `post_${Date.now()}`,
    connectionId,
    platform,
    status: 'published',
    url: `https://${platform}.com/post/${Date.now()}`,
    postedAt: new Date().toISOString(),
    source: 'mock'
  };

  res.json(mockPost);
}));

// GET /api/integrations/list/:userId - List user connections
router.get('/list/:userId', asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  // TODO: Replace with real platform-integration.service.ts
  const mockConnections = {
    connections: [
      { platform: 'youtube', status: 'connected', connectedAt: '2026-02-20' },
      { platform: 'instagram', status: 'connected', connectedAt: '2026-02-21' },
      { platform: 'linkedin', status: 'disconnected', connectedAt: null }
    ],
    source: 'mock'
  };

  res.json(mockConnections);
}));

export default router;
