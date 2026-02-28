/**
 * ADHD Navigator Service
 * 
 * Focus mode for creators with ADHD
 * - Pomodoro timer (25/5 min intervals)
 * - Task chunking (break big tasks into small)
 * - Progress gamification (XP, levels, rewards)
 * - Distraction-free interface support
 * - Focus analytics and insights
 * - Customizable session durations
 * - Break reminders
 * - Streak tracking
 */

export interface FocusSession {
  sessionId: string;
  userId: string;
  taskName: string;
  taskDescription?: string;
  type: 'focus' | 'break';
  duration: number; // minutes
  startTime: string;
  endTime: string;
  status: 'active' | 'completed' | 'interrupted' | 'paused';
  pausedAt?: string;
  resumedAt?: string;
  totalPausedTime: number; // minutes
  actualFocusTime: number; // minutes (excluding pauses)
  distractions: Distraction[];
  notes?: string;
  completedAt?: string;
}

export interface Distraction {
  timestamp: string;
  type: 'notification' | 'manual' | 'external';
  description?: string;
  duration: number; // seconds
}

export interface UserProgress {
  userId: string;
  totalSessions: number;
  completedSessions: number;
  interruptedSessions: number;
  totalFocusTime: number; // minutes
  totalBreakTime: number; // minutes
  currentStreak: number; // consecutive days
  longestStreak: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  lastSessionDate?: string;
  achievements: Achievement[];
  preferences: SessionPreferences;
  statistics: FocusStatistics;
}

export interface Achievement {
  achievementId: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  unlockedAt: string;
  category: 'milestone' | 'streak' | 'level' | 'special';
}

export interface SessionPreferences {
  focusDuration: number; // minutes (default: 25)
  shortBreakDuration: number; // minutes (default: 5)
  longBreakDuration: number; // minutes (default: 15)
  sessionsBeforeLongBreak: number; // default: 4
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  autoStartBreaks: boolean;
  autoStartNextSession: boolean;
  theme: 'minimal' | 'colorful' | 'dark';
}

export interface FocusStatistics {
  averageSessionLength: number; // minutes
  completionRate: number; // percentage
  mostProductiveHour: number; // 0-23
  mostProductiveDayOfWeek: number; // 0-6 (Sunday-Saturday)
  totalDistractionsLogged: number;
  averageDistractionsPerSession: number;
  focusScore: number; // 0-100
}

export interface TaskChunk {
  chunkId: string;
  taskName: string;
  chunkNumber: number;
  totalChunks: number;
  description: string;
  estimatedDuration: number; // minutes
  completed: boolean;
  sessionId?: string;
}

export interface BreakSuggestion {
  type: 'short' | 'long';
  duration: number; // minutes
  reason: string;
  activities: string[];
}

export interface FocusInsight {
  insightId: string;
  type: 'pattern' | 'recommendation' | 'achievement' | 'warning';
  title: string;
  description: string;
  actionable: boolean;
  suggestedActions?: string[];
  relatedData: Record<string, any>;
  createdAt: string;
}

export interface PomodoroConfig {
  userId: string;
  currentCycle: number; // 1-4
  totalCyclesCompleted: number;
  nextBreakType: 'short' | 'long';
  nextBreakDuration: number;
}

export class ADHDNavigatorService {
  private sessions: Map<string, FocusSession>;
  private progress: Map<string, UserProgress>;
  private taskChunks: Map<string, TaskChunk[]>;
  private pomodoroConfigs: Map<string, PomodoroConfig>;

  constructor() {
    this.sessions = new Map();
    this.progress = new Map();
    this.taskChunks = new Map();
    this.pomodoroConfigs = new Map();
  }

  // ============================================================================
  // SESSION MANAGEMENT
  // ============================================================================

  /**
   * Start a new focus session
   */
  startSession(
    userId: string,
    taskName: string,
    options?: {
      taskDescription?: string;
      duration?: number;
      type?: 'focus' | 'break';
    }
  ): FocusSession {
    const preferences = this.getUserPreferences(userId);
    const duration = options?.duration || 
      (options?.type === 'break' ? preferences.shortBreakDuration : preferences.focusDuration);

    const now = new Date();
    const endTime = new Date(now.getTime() + duration * 60 * 1000);

    const session: FocusSession = {
      sessionId: this.generateId('session'),
      userId,
      taskName,
      taskDescription: options?.taskDescription,
      type: options?.type || 'focus',
      duration,
      startTime: now.toISOString(),
      endTime: endTime.toISOString(),
      status: 'active',
      totalPausedTime: 0,
      actualFocusTime: 0,
      distractions: [],
    };

    this.sessions.set(session.sessionId, session);

    // Update progress
    const userProgress = this.getProgress(userId);
    userProgress.totalSessions++;
    this.progress.set(userId, userProgress);

    return session;
  }

  /**
   * Complete a session
   */
  completeSession(sessionId: string): {
    session: FocusSession;
    achievements: Achievement[];
    leveledUp: boolean;
    newLevel?: number;
    xpGained: number;
  } {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    if (session.status === 'completed') {
      throw new Error('Session already completed');
    }

    // Calculate actual focus time
    const now = new Date();
    const startTime = new Date(session.startTime);
    const totalTime = (now.getTime() - startTime.getTime()) / (1000 * 60); // minutes
    session.actualFocusTime = totalTime - session.totalPausedTime;
    session.status = 'completed';
    session.completedAt = now.toISOString();

    // Update progress
    const userProgress = this.getProgress(session.userId);
    userProgress.completedSessions++;
    
    if (session.type === 'focus') {
      userProgress.totalFocusTime += session.actualFocusTime;
    } else {
      userProgress.totalBreakTime += session.actualFocusTime;
    }

    // Update streak
    this.updateStreak(session.userId);

    // Award XP (only for focus sessions)
    let xpGained = 0;
    if (session.type === 'focus') {
      xpGained = Math.floor(session.actualFocusTime * 10);
      
      // Bonus XP for completing full duration
      if (session.actualFocusTime >= session.duration * 0.9) {
        xpGained += 50; // Completion bonus
      }
      
      // Bonus XP for no distractions
      if (session.distractions.length === 0) {
        xpGained += 25; // Focus bonus
      }

      const oldLevel = userProgress.level;
      userProgress.xp += xpGained;
      
      // Level up calculation
      const newLevel = this.calculateLevel(userProgress.xp);
      const leveledUp = newLevel > oldLevel;
      userProgress.level = newLevel;
      userProgress.xpToNextLevel = this.getXPForNextLevel(newLevel);

      this.progress.set(session.userId, userProgress);

      // Check for achievements
      const achievements = this.checkAchievements(session.userId, session, leveledUp);

      // Update statistics
      this.updateStatistics(session.userId);

      return {
        session,
        achievements,
        leveledUp,
        newLevel: leveledUp ? newLevel : undefined,
        xpGained,
      };
    }

    this.progress.set(session.userId, userProgress);
    return {
      session,
      achievements: [],
      leveledUp: false,
      xpGained: 0,
    };
  }

  /**
   * Pause a session
   */
  pauseSession(sessionId: string): FocusSession {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    if (session.status !== 'active') {
      throw new Error('Session is not active');
    }

    session.status = 'paused';
    session.pausedAt = new Date().toISOString();

    return session;
  }

  /**
   * Resume a paused session
   */
  resumeSession(sessionId: string): FocusSession {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    if (session.status !== 'paused') {
      throw new Error('Session is not paused');
    }

    const now = new Date();
    if (session.pausedAt) {
      const pausedTime = (now.getTime() - new Date(session.pausedAt).getTime()) / (1000 * 60);
      session.totalPausedTime += pausedTime;
    }

    session.status = 'active';
    session.resumedAt = now.toISOString();

    return session;
  }

  /**
   * Interrupt/cancel a session
   */
  interruptSession(sessionId: string, reason?: string): FocusSession {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    session.status = 'interrupted';
    session.notes = reason;

    // Update progress
    const userProgress = this.getProgress(session.userId);
    userProgress.interruptedSessions++;
    this.progress.set(session.userId, userProgress);

    return session;
  }

  /**
   * Log a distraction during a session
   */
  logDistraction(
    sessionId: string,
    type: 'notification' | 'manual' | 'external',
    description?: string,
    duration: number = 30
  ): FocusSession {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const distraction: Distraction = {
      timestamp: new Date().toISOString(),
      type,
      description,
      duration,
    };

    session.distractions.push(distraction);

    return session;
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): FocusSession | null {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Get active session for user
   */
  getActiveSession(userId: string): FocusSession | null {
    const sessions = Array.from(this.sessions.values());
    return sessions.find(s => s.userId === userId && s.status === 'active') || null;
  }

  /**
   * Get user's session history
   */
  getSessionHistory(userId: string, limit: number = 50): FocusSession[] {
    const sessions = Array.from(this.sessions.values())
      .filter(s => s.userId === userId)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, limit);

    return sessions;
  }

  // ============================================================================
  // PROGRESS & GAMIFICATION
  // ============================================================================

  /**
   * Get user progress
   */
  getProgress(userId: string): UserProgress {
    if (!this.progress.has(userId)) {
      const defaultPreferences = this.getDefaultPreferences();
      this.progress.set(userId, {
        userId,
        totalSessions: 0,
        completedSessions: 0,
        interruptedSessions: 0,
        totalFocusTime: 0,
        totalBreakTime: 0,
        currentStreak: 0,
        longestStreak: 0,
        level: 1,
        xp: 0,
        xpToNextLevel: 1000,
        achievements: [],
        preferences: defaultPreferences,
        statistics: this.getDefaultStatistics(),
      });
    }
    return this.progress.get(userId)!;
  }

  /**
   * Update user streak
   */
  private updateStreak(userId: string): void {
    const userProgress = this.getProgress(userId);
    const today = new Date().toISOString().split('T')[0];

    if (!userProgress.lastSessionDate) {
      // First session ever
      userProgress.currentStreak = 1;
      userProgress.lastSessionDate = today;
    } else {
      const lastDate = new Date(userProgress.lastSessionDate);
      const todayDate = new Date(today);
      const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 0) {
        // Same day, no change
      } else if (daysDiff === 1) {
        // Consecutive day
        userProgress.currentStreak++;
        userProgress.lastSessionDate = today;
      } else {
        // Streak broken
        userProgress.currentStreak = 1;
        userProgress.lastSessionDate = today;
      }

      // Update longest streak
      if (userProgress.currentStreak > userProgress.longestStreak) {
        userProgress.longestStreak = userProgress.currentStreak;
      }
    }
  }

  /**
   * Calculate level from XP
   */
  private calculateLevel(xp: number): number {
    // Level formula: level = floor(xp / 1000) + 1
    // Level 1: 0-999 XP
    // Level 2: 1000-1999 XP
    // Level 3: 2000-2999 XP, etc.
    return Math.floor(xp / 1000) + 1;
  }

  /**
   * Get XP required for next level
   */
  private getXPForNextLevel(currentLevel: number): number {
    return currentLevel * 1000;
  }

  /**
   * Check for achievements
   */
  private checkAchievements(
    userId: string,
    session: FocusSession,
    leveledUp: boolean
  ): Achievement[] {
    const achievements: Achievement[] = [];
    const userProgress = this.getProgress(userId);

    // First session
    if (userProgress.completedSessions === 1) {
      achievements.push({
        achievementId: this.generateId('achievement'),
        name: 'First Focus',
        description: 'Completed your first focus session!',
        icon: '🎯',
        xpReward: 50,
        unlockedAt: new Date().toISOString(),
        category: 'milestone',
      });
    }

    // 10 sessions milestone
    if (userProgress.completedSessions === 10) {
      achievements.push({
        achievementId: this.generateId('achievement'),
        name: 'Focus Apprentice',
        description: 'Completed 10 focus sessions!',
        icon: '📚',
        xpReward: 200,
        unlockedAt: new Date().toISOString(),
        category: 'milestone',
      });
    }

    // 50 sessions milestone
    if (userProgress.completedSessions === 50) {
      achievements.push({
        achievementId: this.generateId('achievement'),
        name: 'Focus Master',
        description: 'Completed 50 focus sessions!',
        icon: '🏆',
        xpReward: 500,
        unlockedAt: new Date().toISOString(),
        category: 'milestone',
      });
    }

    // 100 sessions milestone
    if (userProgress.completedSessions === 100) {
      achievements.push({
        achievementId: this.generateId('achievement'),
        name: 'Focus Legend',
        description: 'Completed 100 focus sessions!',
        icon: '👑',
        xpReward: 1000,
        unlockedAt: new Date().toISOString(),
        category: 'milestone',
      });
    }

    // Streak achievements
    if (userProgress.currentStreak === 7) {
      achievements.push({
        achievementId: this.generateId('achievement'),
        name: 'Week Warrior',
        description: '7-day focus streak!',
        icon: '🔥',
        xpReward: 300,
        unlockedAt: new Date().toISOString(),
        category: 'streak',
      });
    }

    if (userProgress.currentStreak === 30) {
      achievements.push({
        achievementId: this.generateId('achievement'),
        name: 'Month Master',
        description: '30-day focus streak!',
        icon: '⚡',
        xpReward: 1000,
        unlockedAt: new Date().toISOString(),
        category: 'streak',
      });
    }

    // Level up achievement
    if (leveledUp) {
      achievements.push({
        achievementId: this.generateId('achievement'),
        name: `Level ${userProgress.level}`,
        description: `Reached level ${userProgress.level}!`,
        icon: '⭐',
        xpReward: 100,
        unlockedAt: new Date().toISOString(),
        category: 'level',
      });
    }

    // Perfect focus (no distractions)
    if (session.distractions.length === 0 && session.type === 'focus') {
      achievements.push({
        achievementId: this.generateId('achievement'),
        name: 'Perfect Focus',
        description: 'Completed a session with zero distractions!',
        icon: '💎',
        xpReward: 75,
        unlockedAt: new Date().toISOString(),
        category: 'special',
      });
    }

    // Add achievements to user progress
    userProgress.achievements.push(...achievements);

    // Award bonus XP
    const bonusXP = achievements.reduce((sum, a) => sum + a.xpReward, 0);
    if (bonusXP > 0) {
      userProgress.xp += bonusXP;
      const newLevel = this.calculateLevel(userProgress.xp);
      userProgress.level = newLevel;
      userProgress.xpToNextLevel = this.getXPForNextLevel(newLevel);
    }

    return achievements;
  }

  // ============================================================================
  // TASK CHUNKING
  // ============================================================================

  /**
   * Chunk a large task into smaller subtasks
   */
  chunkTask(
    userId: string,
    taskName: string,
    estimatedMinutes: number,
    description?: string
  ): TaskChunk[] {
    const preferences = this.getUserPreferences(userId);
    const sessionsNeeded = Math.ceil(estimatedMinutes / preferences.focusDuration);
    
    const chunks: TaskChunk[] = [];
    for (let i = 1; i <= sessionsNeeded; i++) {
      chunks.push({
        chunkId: this.generateId('chunk'),
        taskName,
        chunkNumber: i,
        totalChunks: sessionsNeeded,
        description: description || `${taskName} - Part ${i}/${sessionsNeeded}`,
        estimatedDuration: preferences.focusDuration,
        completed: false,
      });
    }

    this.taskChunks.set(userId, chunks);
    return chunks;
  }

  /**
   * Get task chunks for user
   */
  getTaskChunks(userId: string): TaskChunk[] {
    return this.taskChunks.get(userId) || [];
  }

  /**
   * Mark chunk as completed
   */
  completeChunk(userId: string, chunkId: string, sessionId: string): TaskChunk {
    const chunks = this.getTaskChunks(userId);
    const chunk = chunks.find(c => c.chunkId === chunkId);
    
    if (!chunk) {
      throw new Error('Chunk not found');
    }

    chunk.completed = true;
    chunk.sessionId = sessionId;

    return chunk;
  }

  /**
   * Get next incomplete chunk
   */
  getNextChunk(userId: string): TaskChunk | null {
    const chunks = this.getTaskChunks(userId);
    return chunks.find(c => !c.completed) || null;
  }

  // ============================================================================
  // POMODORO MANAGEMENT
  // ============================================================================

  /**
   * Get Pomodoro configuration for user
   */
  getPomodoroConfig(userId: string): PomodoroConfig {
    if (!this.pomodoroConfigs.has(userId)) {
      const preferences = this.getUserPreferences(userId);
      this.pomodoroConfigs.set(userId, {
        userId,
        currentCycle: 1,
        totalCyclesCompleted: 0,
        nextBreakType: 'short',
        nextBreakDuration: preferences.shortBreakDuration,
      });
    }
    return this.pomodoroConfigs.get(userId)!;
  }

  /**
   * Advance Pomodoro cycle
   */
  advancePomorodoCycle(userId: string): PomodoroConfig {
    const config = this.getPomodoroConfig(userId);
    const preferences = this.getUserPreferences(userId);

    config.totalCyclesCompleted++;
    config.currentCycle++;

    // After 4 cycles, take long break and reset
    if (config.currentCycle > preferences.sessionsBeforeLongBreak) {
      config.currentCycle = 1;
      config.nextBreakType = 'long';
      config.nextBreakDuration = preferences.longBreakDuration;
    } else {
      config.nextBreakType = 'short';
      config.nextBreakDuration = preferences.shortBreakDuration;
    }

    return config;
  }

  /**
   * Get break suggestion
   */
  getBreakSuggestion(userId: string): BreakSuggestion {
    const config = this.getPomodoroConfig(userId);
    const preferences = this.getUserPreferences(userId);

    const isLongBreak = config.nextBreakType === 'long';
    const duration = isLongBreak ? preferences.longBreakDuration : preferences.shortBreakDuration;

    const shortBreakActivities = [
      'Stretch your body',
      'Get a glass of water',
      'Look away from screen (20-20-20 rule)',
      'Take a short walk',
      'Do breathing exercises',
    ];

    const longBreakActivities = [
      'Go for a walk outside',
      'Eat a healthy snack',
      'Do light exercise',
      'Meditate or relax',
      'Chat with a friend',
      'Listen to music',
    ];

    return {
      type: config.nextBreakType,
      duration,
      reason: isLongBreak 
        ? `You've completed ${preferences.sessionsBeforeLongBreak} focus sessions! Time for a longer break.`
        : 'Short break to recharge before the next session.',
      activities: isLongBreak ? longBreakActivities : shortBreakActivities,
    };
  }

  // ============================================================================
  // PREFERENCES
  // ============================================================================

  /**
   * Get user preferences
   */
  getUserPreferences(userId: string): SessionPreferences {
    const progress = this.getProgress(userId);
    return progress.preferences;
  }

  /**
   * Update user preferences
   */
  updatePreferences(userId: string, preferences: Partial<SessionPreferences>): SessionPreferences {
    const userProgress = this.getProgress(userId);
    userProgress.preferences = {
      ...userProgress.preferences,
      ...preferences,
    };
    this.progress.set(userId, userProgress);
    return userProgress.preferences;
  }

  /**
   * Get default preferences
   */
  private getDefaultPreferences(): SessionPreferences {
    return {
      focusDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      sessionsBeforeLongBreak: 4,
      soundEnabled: true,
      notificationsEnabled: true,
      autoStartBreaks: false,
      autoStartNextSession: false,
      theme: 'minimal',
    };
  }

  // ============================================================================
  // STATISTICS & INSIGHTS
  // ============================================================================

  /**
   * Update user statistics
   */
  private updateStatistics(userId: string): void {
    const userProgress = this.getProgress(userId);
    const sessions = this.getSessionHistory(userId, 1000);
    const completedSessions = sessions.filter(s => s.status === 'completed' && s.type === 'focus');

    if (completedSessions.length === 0) {
      return;
    }

    // Average session length
    const totalDuration = completedSessions.reduce((sum, s) => sum + s.actualFocusTime, 0);
    userProgress.statistics.averageSessionLength = totalDuration / completedSessions.length;

    // Completion rate
    const totalSessions = sessions.filter(s => s.type === 'focus').length;
    userProgress.statistics.completionRate = (completedSessions.length / totalSessions) * 100;

    // Most productive hour
    const hourCounts = new Map<number, number>();
    completedSessions.forEach(s => {
      const hour = new Date(s.startTime).getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });
    const mostProductiveHour = Array.from(hourCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 9;
    userProgress.statistics.mostProductiveHour = mostProductiveHour;

    // Most productive day of week
    const dayCounts = new Map<number, number>();
    completedSessions.forEach(s => {
      const day = new Date(s.startTime).getDay();
      dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
    });
    const mostProductiveDay = Array.from(dayCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 1;
    userProgress.statistics.mostProductiveDayOfWeek = mostProductiveDay;

    // Distraction statistics
    const totalDistractions = completedSessions.reduce((sum, s) => sum + s.distractions.length, 0);
    userProgress.statistics.totalDistractionsLogged = totalDistractions;
    userProgress.statistics.averageDistractionsPerSession = totalDistractions / completedSessions.length;

    // Focus score (0-100)
    const completionScore = userProgress.statistics.completionRate;
    const distractionScore = Math.max(0, 100 - (userProgress.statistics.averageDistractionsPerSession * 10));
    const streakScore = Math.min(100, userProgress.currentStreak * 5);
    userProgress.statistics.focusScore = Math.round((completionScore + distractionScore + streakScore) / 3);

    this.progress.set(userId, userProgress);
  }

  /**
   * Get default statistics
   */
  private getDefaultStatistics(): FocusStatistics {
    return {
      averageSessionLength: 0,
      completionRate: 0,
      mostProductiveHour: 9,
      mostProductiveDayOfWeek: 1,
      totalDistractionsLogged: 0,
      averageDistractionsPerSession: 0,
      focusScore: 0,
    };
  }

  /**
   * Get focus insights
   */
  getFocusInsights(userId: string): FocusInsight[] {
    const insights: FocusInsight[] = [];
    const userProgress = this.getProgress(userId);
    const stats = userProgress.statistics;

    // Completion rate insight
    if (stats.completionRate >= 80) {
      insights.push({
        insightId: this.generateId('insight'),
        type: 'achievement',
        title: 'Excellent Completion Rate',
        description: `You're completing ${stats.completionRate.toFixed(1)}% of your focus sessions!`,
        actionable: false,
        relatedData: { completionRate: stats.completionRate },
        createdAt: new Date().toISOString(),
      });
    } else if (stats.completionRate < 50) {
      insights.push({
        insightId: this.generateId('insight'),
        type: 'warning',
        title: 'Low Completion Rate',
        description: `Your completion rate is ${stats.completionRate.toFixed(1)}%. Consider shorter sessions.`,
        actionable: true,
        suggestedActions: [
          'Try 15-minute sessions instead of 25',
          'Reduce distractions before starting',
          'Set clearer task goals',
        ],
        relatedData: { completionRate: stats.completionRate },
        createdAt: new Date().toISOString(),
      });
    }

    // Streak insight
    if (userProgress.currentStreak >= 7) {
      insights.push({
        insightId: this.generateId('insight'),
        type: 'achievement',
        title: `${userProgress.currentStreak}-Day Streak!`,
        description: 'Keep up the amazing consistency!',
        actionable: false,
        relatedData: { streak: userProgress.currentStreak },
        createdAt: new Date().toISOString(),
      });
    }

    // Productive time insight
    insights.push({
      insightId: this.generateId('insight'),
      type: 'pattern',
      title: 'Your Peak Focus Time',
      description: `You're most productive at ${this.formatHour(stats.mostProductiveHour)} on ${this.formatDayOfWeek(stats.mostProductiveDayOfWeek)}s.`,
      actionable: true,
      suggestedActions: [
        `Schedule important tasks for ${this.formatHour(stats.mostProductiveHour)}`,
        `Block ${this.formatDayOfWeek(stats.mostProductiveDayOfWeek)}s for deep work`,
      ],
      relatedData: {
        hour: stats.mostProductiveHour,
        day: stats.mostProductiveDayOfWeek,
      },
      createdAt: new Date().toISOString(),
    });

    // Distraction insight
    if (stats.averageDistractionsPerSession > 3) {
      insights.push({
        insightId: this.generateId('insight'),
        type: 'recommendation',
        title: 'Reduce Distractions',
        description: `You average ${stats.averageDistractionsPerSession.toFixed(1)} distractions per session.`,
        actionable: true,
        suggestedActions: [
          'Turn off notifications before sessions',
          'Use website blockers',
          'Create a dedicated focus space',
          'Use noise-cancelling headphones',
        ],
        relatedData: { averageDistractions: stats.averageDistractionsPerSession },
        createdAt: new Date().toISOString(),
      });
    }

    // Focus score insight
    if (stats.focusScore >= 80) {
      insights.push({
        insightId: this.generateId('insight'),
        type: 'achievement',
        title: 'High Focus Score',
        description: `Your focus score is ${stats.focusScore}/100. Excellent work!`,
        actionable: false,
        relatedData: { focusScore: stats.focusScore },
        createdAt: new Date().toISOString(),
      });
    }

    return insights;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private formatHour(hour: number): string {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:00 ${period}`;
  }

  private formatDayOfWeek(day: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day];
  }

  /**
   * Get mock data for testing
   */
  getMockProgress(): UserProgress {
    return {
      userId: 'user_001',
      totalSessions: 45,
      completedSessions: 38,
      interruptedSessions: 7,
      totalFocusTime: 950, // minutes (~15.8 hours)
      totalBreakTime: 190, // minutes (~3.2 hours)
      currentStreak: 12,
      longestStreak: 15,
      level: 10,
      xp: 9500,
      xpToNextLevel: 10000,
      lastSessionDate: new Date().toISOString().split('T')[0],
      achievements: [
        {
          achievementId: 'ach_001',
          name: 'First Focus',
          description: 'Completed your first focus session!',
          icon: '🎯',
          xpReward: 50,
          unlockedAt: '2026-02-15T10:00:00Z',
          category: 'milestone',
        },
        {
          achievementId: 'ach_002',
          name: 'Week Warrior',
          description: '7-day focus streak!',
          icon: '🔥',
          xpReward: 300,
          unlockedAt: '2026-02-22T10:00:00Z',
          category: 'streak',
        },
      ],
      preferences: this.getDefaultPreferences(),
      statistics: {
        averageSessionLength: 25,
        completionRate: 84.4,
        mostProductiveHour: 9,
        mostProductiveDayOfWeek: 2, // Tuesday
        totalDistractionsLogged: 15,
        averageDistractionsPerSession: 0.4,
        focusScore: 87,
      },
    };
  }
}

export const adhdNavigatorService = new ADHDNavigatorService();
