/**
 * ADHD Navigator API Routes
 * POST /api/adhd/session/start - Start focus session
 * POST /api/adhd/session/:id/complete - Complete session
 * POST /api/adhd/session/:id/interrupt - Interrupt session
 * GET /api/adhd/session/:id - Get session details
 * GET /api/adhd/progress/:userId - Get user progress
 * GET /api/adhd/history/:userId - Get session history
 * POST /api/adhd/task/chunk - Chunk a large task
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.middleware';
import { ValidationError } from '../types/errors';
import { adhdNavigatorService } from '../services/adhd-navigator.service';

const router = Router();

/**
 * POST /api/adhd/session/start
 * Start a new focus session (Pomodoro)
 */
router.post('/session/start', asyncHandler(async (req: Request, res: Response) => {
  const { userId, taskName, duration } = req.body;

  if (!userId || !taskName) {
    throw new ValidationError('userId and taskName required');
  }

  const sessionDuration = duration || 25; // Default 25 minutes

  if (sessionDuration < 1 || sessionDuration > 60) {
    throw new ValidationError('duration must be between 1 and 60 minutes');
  }

  const session = adhdNavigatorService.startSession(userId, taskName, sessionDuration);

  res.status(201).json({
    success: true,
    session: {
      id: session.id,
      userId: session.userId,
      taskName: session.taskName,
      type: session.type,
      duration: session.duration,
      startTime: session.startTime,
      endTime: session.endTime
    },
    message: `Focus session started for ${sessionDuration} minutes`
  });
}));

/**
 * POST /api/adhd/session/:id/complete
 * Mark session as completed
 */
router.post('/session/:id/complete', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = adhdNavigatorService.completeSession(id);

  res.json({
    success: true,
    session: {
      id: result.session.id,
      completed: result.session.completed,
      duration: result.session.duration
    },
    rewards: result.rewards,
    message: 'Great job! Session completed! 🎉'
  });
}));

/**
 * POST /api/adhd/session/:id/interrupt
 * Interrupt/cancel a session
 */
router.post('/session/:id/interrupt', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const session = adhdNavigatorService.interruptSession(id);

  res.json({
    success: true,
    session: {
      id: session.id,
      interrupted: session.interrupted
    },
    message: 'Session interrupted. No worries, try again! 💪'
  });
}));

/**
 * GET /api/adhd/session/:id
 * Get session details
 */
router.get('/session/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const session = adhdNavigatorService.getSession(id);

  if (!session) {
    return res.status(404).json({
      success: false,
      error: 'Session not found'
    });
  }

  res.json({
    success: true,
    session: {
      id: session.id,
      userId: session.userId,
      taskName: session.taskName,
      type: session.type,
      duration: session.duration,
      startTime: session.startTime,
      endTime: session.endTime,
      completed: session.completed,
      interrupted: session.interrupted
    }
  });
}));

/**
 * GET /api/adhd/progress/:userId
 * Get user progress and stats
 */
router.get('/progress/:userId', asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  const progress = adhdNavigatorService.getProgress(userId);
  const completionRate = progress.totalSessions > 0 
    ? Math.round((progress.completedSessions / progress.totalSessions) * 100)
    : 0;

  res.json({
    success: true,
    progress: {
      userId: progress.userId,
      totalSessions: progress.totalSessions,
      completedSessions: progress.completedSessions,
      completionRate,
      totalFocusTime: progress.totalFocusTime,
      totalFocusHours: Math.round(progress.totalFocusTime / 60 * 10) / 10,
      streak: progress.streak,
      level: progress.level,
      xp: progress.xp,
      xpToNextLevel: (progress.level * 1000) - progress.xp
    }
  });
}));

/**
 * GET /api/adhd/history/:userId
 * Get user session history
 */
router.get('/history/:userId', asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const limit = parseInt(req.query.limit as string) || 50;

  const sessions = adhdNavigatorService.getSessionHistory(userId, limit);

  res.json({
    success: true,
    userId,
    sessions: sessions.map(s => ({
      id: s.id,
      taskName: s.taskName,
      duration: s.duration,
      startTime: s.startTime,
      endTime: s.endTime,
      completed: s.completed,
      interrupted: s.interrupted
    })),
    count: sessions.length
  });
}));

/**
 * POST /api/adhd/task/chunk
 * Break a large task into smaller chunks
 */
router.post('/task/chunk', asyncHandler(async (req: Request, res: Response) => {
  const { taskDescription, estimatedMinutes } = req.body;

  if (!taskDescription || !estimatedMinutes) {
    throw new ValidationError('taskDescription and estimatedMinutes required');
  }

  const chunks = adhdNavigatorService.chunkTask(taskDescription, estimatedMinutes);
  const recommendedBreaks = Math.floor(chunks.length / 4);

  res.json({
    success: true,
    originalTask: taskDescription,
    estimatedMinutes,
    chunks,
    totalChunks: chunks.length,
    recommendedBreaks,
    message: `Task broken into ${chunks.length} manageable chunks!`
  });
}));

/**
 * GET /api/adhd/break/:userId
 * Get recommended break duration
 */
router.get('/break/:userId', asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  const progress = adhdNavigatorService.getProgress(userId);
  const breakDuration = adhdNavigatorService.getBreakDuration(progress.completedSessions);

  res.json({
    success: true,
    userId,
    completedSessions: progress.completedSessions,
    recommendedBreakMinutes: breakDuration,
    message: breakDuration === 15 
      ? 'Great work! Take a longer break 🌟'
      : 'Quick break time! ☕'
  });
}));

export default router;
