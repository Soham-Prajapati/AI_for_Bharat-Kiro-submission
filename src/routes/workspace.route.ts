/**
 * Workspace API Routes
 * POST /api/workspace/create - Create new workspace
 * GET /api/workspace/:id - Get workspace details
 * DELETE /api/workspace/:id - Delete workspace
 * GET /api/workspace/:id/users - Get workspace users
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.middleware';
import { ValidationError } from '../types/errors';
import { workspaceService } from '../services/workspace.service';

const router = Router();

/**
 * POST /api/workspace/create
 * Create a new collaborative workspace
 */
router.post('/create', asyncHandler(async (req: Request, res: Response) => {
  const { name, initialContent } = req.body;

  if (!name || typeof name !== 'string') {
    throw new ValidationError('name (string) required');
  }

  const workspace = workspaceService.create(name, initialContent || '');

  res.status(201).json({
    success: true,
    workspace: {
      id: workspace.id,
      name: workspace.name,
      content: workspace.content,
      version: workspace.version,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt
    }
  });
}));

/**
 * GET /api/workspace/:id
 * Get workspace details
 */
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new ValidationError('workspace id required');
  }

  const workspace = workspaceService.get(id);

  if (!workspace) {
    return res.status(404).json({
      success: false,
      error: 'Workspace not found'
    });
  }

  res.json({
    success: true,
    workspace: {
      id: workspace.id,
      name: workspace.name,
      content: workspace.content,
      version: workspace.version,
      userCount: workspace.users.size,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt
    }
  });
}));

/**
 * GET /api/workspace/:id/users
 * Get users currently in workspace
 */
router.get('/:id/users', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new ValidationError('workspace id required');
  }

  const users = workspaceService.getUsers(id);

  res.json({
    success: true,
    workspaceId: id,
    users,
    count: users.length
  });
}));

/**
 * DELETE /api/workspace/:id
 * Delete workspace
 */
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new ValidationError('workspace id required');
  }

  const deleted = workspaceService.delete(id);

  if (!deleted) {
    return res.status(404).json({
      success: false,
      error: 'Workspace not found'
    });
  }

  res.json({
    success: true,
    message: 'Workspace deleted',
    workspaceId: id
  });
}));

export default router;
