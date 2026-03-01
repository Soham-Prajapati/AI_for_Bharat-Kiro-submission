import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.middleware';
import { CacheService } from '../services/cache.service';
import { ValidationError } from '../types/errors';
import { automationService } from '../services/automation.service';

const router = Router();
const cache = new CacheService();

// POST /api/automation/create - Create automation
router.post('/create', asyncHandler(async (req: Request, res: Response) => {
  const { userId, name, trigger, actions } = req.body;

  if (!userId || !name || !trigger || !actions) {
    throw new ValidationError('userId, name, trigger, and actions required');
  }

  // Uses the actual automation service
  const automationConfig = await automationService.createAutomation(
    userId,
    name,
    trigger,
    actions
  );

  res.json(automationConfig);
}));

// GET /api/automation/list - List user automations
router.get('/list', asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.query;

  if (!userId) {
    throw new ValidationError('userId required');
  }

  const cacheKey = `automation:list:${userId}`;
  const cached = await cache.get(cacheKey);

  if (cached) {
    return res.json(JSON.parse(cached as string));
  }

  // Uses the actual automation service
  const userAutomations = await automationService.getUserAutomations(userId as string);

  await cache.set(cacheKey, JSON.stringify(userAutomations), 300);
  res.json(userAutomations);
}));

// DELETE /api/automation/:id - Delete automation
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Uses the actual automation service
  await automationService.deleteAutomation(id);

  res.json({
    automationId: id,
    status: 'deleted',
    deletedAt: new Date().toISOString(),
  });
}));

export default router;
