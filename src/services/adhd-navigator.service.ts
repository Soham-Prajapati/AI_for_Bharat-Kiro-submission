/**
 * ADHD Navigator Service
 * Focus mode with Pomodoro timer, task chunking, and gamification
 */

import { v4 as uuidv4 } from 'uuid';

export interface Session {
  id: string;
  userId: string;
  taskName: string;
  type: 'focus' | 'break';
  duration: number; // minutes
  startTime: Date;
  endTime: Date;
  completed: boolean;
  interrupted: boolean;
}

export interface Progress {
  userId: string;
  totalSessions: number;
  completedSessions: number;
  totalFocusTime: number; // minutes
  streak: number; // consecutive days
  level: number;
  xp: number;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  xp: number;
  unlockedAt: Date;
}

class ADHDNavigatorService {
  private sessions: Map<string, Session> = new Map();
  private progress: Map<string, Progress> = new Map();
  private activeTimers: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Start a focus session (Pomodoro)
   */
  startSession(userId: string, taskName: string, duration: number = 25): Session {
    const session: Session = {
      id: uuidv4(),
      userId,
      taskName,
      type: 'focus',
      duration,
      startTime: new Date(),
      endTime: new Date(Date.now() + duration * 60 * 1000),
      completed: false,
      interrupted: false
    };

    this.sessions.set(session.id, session);
    
    // Update progress
    const userProgress = this.getProgress(userId);
    userProgress.totalSessions++;
    this.progress.set(userId, userProgress);

    return session;
  }

  /**
   * Complete a session
   */
  completeSession(sessionId: string): { session: Session; rewards: Reward[] } {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    session.completed = true;
    
    // Update progress
    const userProgress = this.getProgress(session.userId);
    userProgress.completedSessions++;
    userProgress.totalFocusTime += session.duration;
    
    // Award XP
    const xpGained = session.duration * 10;
    userProgress.xp += xpGained;
    
    // Level up
    const newLevel = Math.floor(userProgress.xp / 1000) + 1;
    const leveledUp = newLevel > userProgress.level;
    userProgress.level = newLevel;
    
    this.progress.set(session.userId, userProgress);

    // Check for rewards
    const rewards = this.checkRewards(session.userId, leveledUp);

    return { session, rewards };
  }

  /**
   * Interrupt/cancel a session
   */
  interruptSession(sessionId: string): Session {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    session.interrupted = true;
    return session;
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): Session | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get user progress
   */
  getProgress(userId: string): Progress {
    if (!this.progress.has(userId)) {
      this.progress.set(userId, {
        userId,
        totalSessions: 0,
        completedSessions: 0,
        totalFocusTime: 0,
        streak: 0,
        level: 1,
        xp: 0
      });
    }
    return this.progress.get(userId)!;
  }

  /**
   * Get user session history
   */
  getSessionHistory(userId: string, limit: number = 50): Session[] {
    const userSessions = Array.from(this.sessions.values())
      .filter(s => s.userId === userId)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, limit);
    
    return userSessions;
  }

  /**
   * Check for rewards
   */
  private checkRewards(userId: string, leveledUp: boolean): Reward[] {
    const rewards: Reward[] = [];
    const userProgress = this.getProgress(userId);

    // First session reward
    if (userProgress.completedSessions === 1) {
      rewards.push({
        id: uuidv4(),
        name: 'First Focus',
        description: 'Completed your first focus session!',
        xp: 50,
        unlockedAt: new Date()
      });
    }

    // 10 sessions milestone
    if (userProgress.completedSessions === 10) {
      rewards.push({
        id: uuidv4(),
        name: 'Focus Master',
        description: 'Completed 10 focus sessions!',
        xp: 200,
        unlockedAt: new Date()
      });
    }

    // Level up reward
    if (leveledUp) {
      rewards.push({
        id: uuidv4(),
        name: `Level ${userProgress.level}`,
        description: `Reached level ${userProgress.level}!`,
        xp: 100,
        unlockedAt: new Date()
      });
    }

    return rewards;
  }

  /**
   * Get recommended break duration
   */
  getBreakDuration(completedSessions: number): number {
    // After 4 sessions, take a longer break
    return completedSessions % 4 === 0 ? 15 : 5;
  }

  /**
   * Chunk a large task into smaller subtasks
   */
  chunkTask(taskDescription: string, estimatedMinutes: number): string[] {
    const chunks: string[] = [];
    const sessionsNeeded = Math.ceil(estimatedMinutes / 25);
    
    for (let i = 1; i <= sessionsNeeded; i++) {
      chunks.push(`${taskDescription} - Part ${i}/${sessionsNeeded}`);
    }
    
    return chunks;
  }
}

export const adhdNavigatorService = new ADHDNavigatorService();
