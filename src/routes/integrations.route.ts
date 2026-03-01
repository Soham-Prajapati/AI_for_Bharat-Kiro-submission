import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.middleware';
import { ValidationError } from '../types/errors';
import { platformIntegrationService } from '../services/platform-integration.service';

const router = Router();

// POST /api/integrations/connect - Connect platform account
router.post('/connect', asyncHandler(async (req: Request, res: Response) => {
  const { userId, platform, accessToken } = req.body;

  if (!userId || !platform || !accessToken) {
    throw new ValidationError('userId, platform, and accessToken required');
  }

  // Uses the actual platform integration service
  const connection = await platformIntegrationService.connectPlatform(
    userId,
    platform,
    accessToken
  );

  res.json(connection);
}));

// POST /api/integrations/post - Post content to platform
router.post('/post', asyncHandler(async (req: Request, res: Response) => {
  const { connectionId, content, platform } = req.body;

  if (!connectionId || !content || !platform) {
    throw new ValidationError('connectionId, content, and platform required');
  }

  // Uses the actual platform integration service
  // Note: the PostRequest type doesn't support a separate 'platform' directly in its type signature,
  // but it expects the connectionId to infer the platform inside the service.
  const postResult = await platformIntegrationService.postToPlatform({
    connectionId,
    content
  });

  res.json(postResult);
}));

// GET /api/integrations/list/:userId - List user connections
router.get('/list/:userId', asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  // Uses the actual platform integration service
  const connections = await platformIntegrationService.getUserConnections(userId);

  res.json({ connections });
}));

export default router;
