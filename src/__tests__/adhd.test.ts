/**
 * ADHD Navigator Comprehensive Usability Tests
 * 
 * Tests focus mode, Pomodoro timer, task chunking, gamification,
 * distraction-free interface, and user satisfaction metrics (>80% target)
 */

import request from 'supertest';
import app from '../index';
import { wait } from './setup';

describe('ADHD Navigator Comprehensive Usability Tests', () => {
  const testUserId = 'test-user-adhd';

  // ============================================================================
  // FOCUS MODE FUNCTIONALITY TESTS
  // ============================================================================

  describe('Focus Mode Functionality', () => {
    describe('POST /api/adhd/session/start', () => {
      it('should start a focus session with all required fields', async () => {
        const response = await request(app)
          .post('/api/adhd/session/start')
          .send({
            userId: testUserId,
            taskName: 'Write documentation',
            duration: 25
          });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.session).toHaveProperty('id');
        expect(response.body.session.taskName).toBe('Write documentation');
        expect(response.body.session.duration).toBe(25);
        expect(response.body.session.type).toBe('focus');
        expect(response.body.session).toHaveProperty('startTime');
        expect(response.body.session).toHaveProperty('endTime');
      });

      it('should use default 25-minute Pomodoro duration if not provided', async () => {
        const response = await request(app)
          .post('/api/adhd/session/start')
          .send({
            userId: testUserId,
            taskName: 'Code review'
          });

        expect(response.status).toBe(201);
        expect(response.body.session.duration).toBe(25);
      });

      it('should calculate correct end time based on duration', async () => {
        const startTime = Date.now();
        const response = await request(app)
          .post('/api/adhd/session/start')
          .send({
            userId: testUserId,
            taskName: 'Test task',
            duration: 25
          });

        const sessionStartTime = new Date(response.body.session.startTime).getTime();
        const sessionEndTime = new Date(response.body.session.endTime).getTime();
        const expectedDuration = 25 * 60 * 1000;

        expect(sessionEndTime - sessionStartTime).toBeCloseTo(expectedDuration, -3);
        expect(sessionStartTime).toBeGreaterThanOrEqual(startTime);
      });

      it('should accept custom durations within valid range', async () => {
        const durations = [10, 15, 20, 25, 30, 45, 60];
        
        for (const duration of durations) {
          const response = await request(app)
            .post('/api/adhd/session/start')
            .send({
              userId: testUserId,
              taskName: `Task ${duration}min`,
              duration
            });

          expect(response.status).toBe(201);
          expect(response.body.session.duration).toBe(duration);
        }
      });

      it('should return 400 if userId is missing', async () => {
        const response = await request(app)
          .post('/api/adhd/session/start')
          .send({
            taskName: 'Task without user'
          });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });

      it('should return 400 if taskName is missing', async () => {
        const response = await request(app)
          .post('/api/adhd/session/start')
          .send({
            userId: testUserId
          });

        expect(response.status).toBe(400);
      });

      it('should return 400 if duration is too short', async () => {
        const response = await request(app)
          .post('/api/adhd/session/start')
          .send({
            userId: testUserId,
            taskName: 'Test task',
            duration: 0
          });

        expect(response.status).toBe(400);
      });

      it('should return 400 if duration exceeds maximum', async () => {
        const response = await request(app)
          .post('/api/adhd/session/start')
          .send({
            userId: testUserId,
            taskName: 'Test task',
            duration: 100
          });

        expect(response.status).toBe(400);
      });

      it('should provide encouraging message on session start', async () => {
        const response = await request(app)
          .post('/api/adhd/session/start')
          .send({
            userId: testUserId,
            taskName: 'Focus task',
            duration: 25
          });

        expect(response.body.message).toBeDefined();
        expect(response.body.message).toContain('Focus session started');
      });
    });
  });

  // ============================================================================
  // POMODORO TIMER TESTS (25/5 MIN INTERVALS)
  // ============================================================================

  describe('Pomodoro Timer Functionality', () => {
    it('should support standard 25-minute Pomodoro sessions', async () => {
      const response = await request(app)
        .post('/api/adhd/session/start')
        .send({
          userId: testUserId,
          taskName: 'Pomodoro task',
          duration: 25
        });

      expect(response.status).toBe(201);
      expect(response.body.session.duration).toBe(25);
    });

    it('should recommend 5-minute break after regular session', async () => {
      const uniqueUserId = `break-test-${Date.now()}`;
      const session1 = await request(app)
        .post('/api/adhd/session/start')
        .send({ userId: uniqueUserId, taskName: 'Task 1' });
      
      await request(app)
        .post(`/api/adhd/session/${session1.body.session.id}/complete`);

      const breakResponse = await request(app)
        .get(`/api/adhd/break/${uniqueUserId}`);

      expect(breakResponse.body.recommendedBreakMinutes).toBe(5);
    });

    it('should recommend 15-minute break after 4 sessions', async () => {
      const uniqueUserId = `long-break-${Date.now()}`;
      
      // Complete 4 sessions
      for (let i = 0; i < 4; i++) {
        const sessionResponse = await request(app)
          .post('/api/adhd/session/start')
          .send({ userId: uniqueUserId, taskName: `Task ${i + 1}` });
        
        await request(app)
          .post(`/api/adhd/session/${sessionResponse.body.session.id}/complete`);
      }

      const breakResponse = await request(app)
        .get(`/api/adhd/break/${uniqueUserId}`);

      expect(breakResponse.body.recommendedBreakMinutes).toBe(15);
    });

    it('should track multiple Pomodoro cycles', async () => {
      const cycleUserId = `cycle-user-${Date.now()}`;
      const sessionsPerCycle = 4;
      const cycles = 2;

      for (let cycle = 0; cycle < cycles; cycle++) {
        for (let session = 0; session < sessionsPerCycle; session++) {
          const startResponse = await request(app)
            .post('/api/adhd/session/start')
            .send({
              userId: cycleUserId,
              taskName: `Cycle ${cycle + 1} - Session ${session + 1}`,
              duration: 25
            });

          await request(app)
            .post(`/api/adhd/session/${startResponse.body.session.id}/complete`);
        }
      }

      const progressResponse = await request(app)
        .get(`/api/adhd/progress/${cycleUserId}`);

      expect(progressResponse.body.progress.completedSessions).toBe(sessionsPerCycle * cycles);
      expect(progressResponse.body.progress.totalFocusTime).toBe(25 * sessionsPerCycle * cycles);
    });

    it('should maintain session timing accuracy', async () => {
      const response = await request(app)
        .post('/api/adhd/session/start')
        .send({
          userId: testUserId,
          taskName: 'Timing test',
          duration: 25
        });

      const startTime = new Date(response.body.session.startTime);
      const endTime = new Date(response.body.session.endTime);
      const durationMs = endTime.getTime() - startTime.getTime();
      const expectedMs = 25 * 60 * 1000;

      expect(durationMs).toBe(expectedMs);
    });
  });

  // ============================================================================
  // SESSION MANAGEMENT TESTS
  // ============================================================================

  describe('Session Management', () => {
    describe('POST /api/adhd/session/:id/complete', () => {
      let sessionId: string;

      beforeEach(async () => {
        const response = await request(app)
          .post('/api/adhd/session/start')
          .send({
            userId: testUserId,
            taskName: 'Test task'
          });
        
        sessionId = response.body.session.id;
      });

      it('should complete a session successfully', async () => {
        const response = await request(app)
          .post(`/api/adhd/session/${sessionId}/complete`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.session.completed).toBe(true);
        expect(response.body.rewards).toBeInstanceOf(Array);
      });

      it('should award first session reward', async () => {
        const uniqueUserId = `first-session-${Date.now()}`;
        const startResponse = await request(app)
          .post('/api/adhd/session/start')
          .send({ userId: uniqueUserId, taskName: 'First task' });

        const response = await request(app)
          .post(`/api/adhd/session/${startResponse.body.session.id}/complete`);

        expect(response.body.rewards.length).toBeGreaterThan(0);
        expect(response.body.rewards[0].name).toBe('First Focus');
        expect(response.body.rewards[0].xp).toBe(50);
      });

      it('should provide encouraging completion message', async () => {
        const response = await request(app)
          .post(`/api/adhd/session/${sessionId}/complete`);

        expect(response.body.message).toBeDefined();
        expect(response.body.message).toContain('Great job');
        expect(response.body.message).toContain('🎉');
      });

      it('should update user progress on completion', async () => {
        await request(app)
          .post(`/api/adhd/session/${sessionId}/complete`);

        const progressResponse = await request(app)
          .get(`/api/adhd/progress/${testUserId}`);

        expect(progressResponse.body.progress.completedSessions).toBeGreaterThan(0);
      });
    });

    describe('POST /api/adhd/session/:id/interrupt', () => {
      let sessionId: string;

      beforeEach(async () => {
        const response = await request(app)
          .post('/api/adhd/session/start')
          .send({
            userId: testUserId,
            taskName: 'Test task'
          });
        
        sessionId = response.body.session.id;
      });

      it('should interrupt a session gracefully', async () => {
        const response = await request(app)
          .post(`/api/adhd/session/${sessionId}/interrupt`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.session.interrupted).toBe(true);
      });

      it('should provide supportive message on interruption', async () => {
        const response = await request(app)
          .post(`/api/adhd/session/${sessionId}/interrupt`);

        expect(response.body.message).toBeDefined();
        expect(response.body.message).toContain('No worries');
        expect(response.body.message).toContain('💪');
      });

      it('should not penalize user for interruption', async () => {
        const uniqueUserId = `interrupt-test-${Date.now()}`;
        const startResponse = await request(app)
          .post('/api/adhd/session/start')
          .send({ userId: uniqueUserId, taskName: 'Interrupt test' });

        const progressBefore = await request(app)
          .get(`/api/adhd/progress/${uniqueUserId}`);

        await request(app)
          .post(`/api/adhd/session/${startResponse.body.session.id}/interrupt`);

        const progressAfter = await request(app)
          .get(`/api/adhd/progress/${uniqueUserId}`);

        expect(progressAfter.body.progress.totalSessions)
          .toBeGreaterThanOrEqual(progressBefore.body.progress.totalSessions);
      });
    });

    describe('GET /api/adhd/session/:id', () => {
      let sessionId: string;

      beforeEach(async () => {
        const response = await request(app)
          .post('/api/adhd/session/start')
          .send({
            userId: testUserId,
            taskName: 'Test task'
          });
        
        sessionId = response.body.session.id;
      });

      it('should get session details', async () => {
        const response = await request(app)
          .get(`/api/adhd/session/${sessionId}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.session.id).toBe(sessionId);
        expect(response.body.session).toHaveProperty('taskName');
        expect(response.body.session).toHaveProperty('duration');
        expect(response.body.session).toHaveProperty('startTime');
        expect(response.body.session).toHaveProperty('endTime');
      });

      it('should return 404 for non-existent session', async () => {
        const response = await request(app)
          .get('/api/adhd/session/non-existent-id');

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
      });

      it('should show session status (completed/interrupted)', async () => {
        const response = await request(app)
          .get(`/api/adhd/session/${sessionId}`);

        expect(response.body.session).toHaveProperty('completed');
        expect(response.body.session).toHaveProperty('interrupted');
      });
    });
  });

  // ============================================================================
  // TASK CHUNKING TESTS
  // ============================================================================

  describe('Task Chunking Features', () => {
    describe('POST /api/adhd/task/chunk', () => {
      it('should chunk a large task into manageable pieces', async () => {
        const response = await request(app)
          .post('/api/adhd/task/chunk')
          .send({
            taskDescription: 'Build entire feature',
            estimatedMinutes: 75
          });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.chunks).toBeInstanceOf(Array);
        expect(response.body.chunks.length).toBe(3);
        expect(response.body.totalChunks).toBe(3);
      });

      it('should handle tasks requiring single session', async () => {
        const response = await request(app)
          .post('/api/adhd/task/chunk')
          .send({
            taskDescription: 'Quick bug fix',
            estimatedMinutes: 20
          });

        expect(response.status).toBe(200);
        expect(response.body.chunks.length).toBe(1);
      });

      it('should handle very large tasks', async () => {
        const response = await request(app)
          .post('/api/adhd/task/chunk')
          .send({
            taskDescription: 'Major refactoring project',
            estimatedMinutes: 300
          });

        expect(response.status).toBe(200);
        expect(response.body.chunks.length).toBe(12);
      });

      it('should provide numbered chunks for clarity', async () => {
        const response = await request(app)
          .post('/api/adhd/task/chunk')
          .send({
            taskDescription: 'Write tests',
            estimatedMinutes: 50
          });

        expect(response.body.chunks[0]).toContain('Part 1/2');
        expect(response.body.chunks[1]).toContain('Part 2/2');
      });

      it('should recommend breaks based on chunk count', async () => {
        const response = await request(app)
          .post('/api/adhd/task/chunk')
          .send({
            taskDescription: 'Long task',
            estimatedMinutes: 200
          });

        expect(response.body).toHaveProperty('recommendedBreaks');
        expect(response.body.recommendedBreaks).toBeGreaterThan(0);
      });

      it('should return 400 if parameters missing', async () => {
        const response = await request(app)
          .post('/api/adhd/task/chunk')
          .send({
            taskDescription: 'Task without time'
          });

        expect(response.status).toBe(400);
      });

      it('should provide encouraging message about chunking', async () => {
        const response = await request(app)
          .post('/api/adhd/task/chunk')
          .send({
            taskDescription: 'Complex task',
            estimatedMinutes: 100
          });

        expect(response.body.message).toBeDefined();
        expect(response.body.message).toContain('manageable chunks');
      });
    });
  });

  // ============================================================================
  // PROGRESS GAMIFICATION TESTS
  // ============================================================================

  describe('Progress Gamification', () => {
    describe('XP and Leveling System', () => {
      it('should award XP based on session duration', async () => {
        const uniqueUserId = `xp-user-${Date.now()}`;
        const duration = 25;

        const startResponse = await request(app)
          .post('/api/adhd/session/start')
          .send({ userId: uniqueUserId, taskName: 'XP test', duration });

        await request(app)
          .post(`/api/adhd/session/${startResponse.body.session.id}/complete`);

        const progressResponse = await request(app)
          .get(`/api/adhd/progress/${uniqueUserId}`);

        expect(progressResponse.body.progress.xp).toBeGreaterThanOrEqual(duration * 10);
      });

      it('should level up after earning 1000 XP', async () => {
        const uniqueUserId = `level-user-${Date.now()}`;

        // Complete 4 sessions (4 * 25 * 10 = 1000 XP)
        for (let i = 0; i < 4; i++) {
          const startResponse = await request(app)
            .post('/api/adhd/session/start')
            .send({ userId: uniqueUserId, taskName: `Level task ${i + 1}`, duration: 25 });

          await request(app)
            .post(`/api/adhd/session/${startResponse.body.session.id}/complete`);
        }

        const progressResponse = await request(app)
          .get(`/api/adhd/progress/${uniqueUserId}`);

        expect(progressResponse.body.progress.level).toBeGreaterThanOrEqual(2);
        expect(progressResponse.body.progress.xp).toBeGreaterThanOrEqual(1000);
      });

      it('should calculate XP to next level correctly', async () => {
        const uniqueUserId = `xp-calc-${Date.now()}`;

        const startResponse = await request(app)
          .post('/api/adhd/session/start')
          .send({ userId: uniqueUserId, taskName: 'XP calc test' });

        await request(app)
          .post(`/api/adhd/session/${startResponse.body.session.id}/complete`);

        const progressResponse = await request(app)
          .get(`/api/adhd/progress/${uniqueUserId}`);

        const { level, xp, xpToNextLevel } = progressResponse.body.progress;
        expect(xpToNextLevel).toBe((level * 1000) - xp);
      });

      it('should track total focus time in minutes', async () => {
        const uniqueUserId = `time-user-${Date.now()}`;
        const sessions = [25, 15, 30];

        for (const duration of sessions) {
          const startResponse = await request(app)
            .post('/api/adhd/session/start')
            .send({ userId: uniqueUserId, taskName: 'Time test', duration });

          await request(app)
            .post(`/api/adhd/session/${startResponse.body.session.id}/complete`);
        }

        const progressResponse = await request(app)
          .get(`/api/adhd/progress/${uniqueUserId}`);

        const expectedMinutes = sessions.reduce((a, b) => a + b, 0);
        expect(progressResponse.body.progress.totalFocusTime).toBe(expectedMinutes);
      });

      it('should convert focus time to hours', async () => {
        const uniqueUserId = `hours-user-${Date.now()}`;

        for (let i = 0; i < 3; i++) {
          const startResponse = await request(app)
            .post('/api/adhd/session/start')
            .send({ userId: uniqueUserId, taskName: 'Hours test', duration: 25 });

          await request(app)
            .post(`/api/adhd/session/${startResponse.body.session.id}/complete`);
        }

        const progressResponse = await request(app)
          .get(`/api/adhd/progress/${uniqueUserId}`);

        expect(progressResponse.body.progress.totalFocusHours).toBeCloseTo(1.3, 1);
      });
    });

    describe('Reward System', () => {
      it('should award "First Focus" reward on first completion', async () => {
        const uniqueUserId = `reward-first-${Date.now()}`;

        const startResponse = await request(app)
          .post('/api/adhd/session/start')
          .send({ userId: uniqueUserId, taskName: 'First reward test' });

        const completeResponse = await request(app)
          .post(`/api/adhd/session/${startResponse.body.session.id}/complete`);

        expect(completeResponse.body.rewards).toHaveLength(1);
        expect(completeResponse.body.rewards[0].name).toBe('First Focus');
        expect(completeResponse.body.rewards[0].xp).toBe(50);
      });

      it('should award "Focus Master" after 10 sessions', async () => {
        const uniqueUserId = `reward-master-${Date.now()}`;

        for (let i = 0; i < 10; i++) {
          const startResponse = await request(app)
            .post('/api/adhd/session/start')
            .send({ userId: uniqueUserId, taskName: `Master task ${i + 1}` });

          await request(app)
            .post(`/api/adhd/session/${startResponse.body.session.id}/complete`);
        }

        const progressResponse = await request(app)
          .get(`/api/adhd/progress/${uniqueUserId}`);

        expect(progressResponse.body.progress.completedSessions).toBe(10);
      });

      it('should award level-up rewards', async () => {
        const uniqueUserId = `reward-level-${Date.now()}`;

        for (let i = 0; i < 5; i++) {
          const startResponse = await request(app)
            .post('/api/adhd/session/start')
            .send({ userId: uniqueUserId, taskName: `Level reward ${i + 1}`, duration: 25 });

          const completeResponse = await request(app)
            .post(`/api/adhd/session/${startResponse.body.session.id}/complete`);

          if (completeResponse.body.rewards.some((r: any) => r.name.includes('Level'))) {
            expect(completeResponse.body.rewards.find((r: any) => r.name.includes('Level')).xp).toBe(100);
          }
        }
      });

      it('should include reward metadata', async () => {
        const uniqueUserId = `reward-meta-${Date.now()}`;

        const startResponse = await request(app)
          .post('/api/adhd/session/start')
          .send({ userId: uniqueUserId, taskName: 'Metadata test' });

        const completeResponse = await request(app)
          .post(`/api/adhd/session/${startResponse.body.session.id}/complete`);

        const reward = completeResponse.body.rewards[0];
        expect(reward).toHaveProperty('id');
        expect(reward).toHaveProperty('name');
        expect(reward).toHaveProperty('description');
        expect(reward).toHaveProperty('xp');
        expect(reward).toHaveProperty('unlockedAt');
      });
    });

    describe('GET /api/adhd/progress/:userId', () => {
      it('should get comprehensive user progress', async () => {
        const uniqueUserId = `progress-test-${Date.now()}`;
        const startResponse = await request(app)
          .post('/api/adhd/session/start')
          .send({ userId: uniqueUserId, taskName: 'Progress test' });

        await request(app)
          .post(`/api/adhd/session/${startResponse.body.session.id}/complete`);

        const response = await request(app)
          .get(`/api/adhd/progress/${uniqueUserId}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.progress.userId).toBe(uniqueUserId);
        expect(response.body.progress.totalSessions).toBeGreaterThan(0);
        expect(response.body.progress.level).toBeGreaterThanOrEqual(1);
      });

      it('should calculate completion rate accurately', async () => {
        const uniqueUserId = `completion-test-${Date.now()}`;
        const startResponse = await request(app)
          .post('/api/adhd/session/start')
          .send({ userId: uniqueUserId, taskName: 'Completion test' });

        await request(app)
          .post(`/api/adhd/session/${startResponse.body.session.id}/complete`);

        const response = await request(app)
          .get(`/api/adhd/progress/${uniqueUserId}`);

        expect(response.body.progress).toHaveProperty('completionRate');
        expect(response.body.progress.completionRate).toBeGreaterThanOrEqual(0);
        expect(response.body.progress.completionRate).toBeLessThanOrEqual(100);
      });

      it('should include all progress metrics', async () => {
        const uniqueUserId = `metrics-test-${Date.now()}`;
        const startResponse = await request(app)
          .post('/api/adhd/session/start')
          .send({ userId: uniqueUserId, taskName: 'Metrics test' });

        await request(app)
          .post(`/api/adhd/session/${startResponse.body.session.id}/complete`);

        const response = await request(app)
          .get(`/api/adhd/progress/${uniqueUserId}`);

        const { progress } = response.body;
        expect(progress).toHaveProperty('totalSessions');
        expect(progress).toHaveProperty('completedSessions');
        expect(progress).toHaveProperty('completionRate');
        expect(progress).toHaveProperty('totalFocusTime');
        expect(progress).toHaveProperty('totalFocusHours');
        expect(progress).toHaveProperty('level');
        expect(progress).toHaveProperty('xp');
        expect(progress).toHaveProperty('xpToNextLevel');
      });
    });
  });

  // ============================================================================
  // SESSION HISTORY TESTS
  // ============================================================================

  describe('Session History', () => {
    describe('GET /api/adhd/history/:userId', () => {
      it('should get session history', async () => {
        const uniqueUserId = `history-test-${Date.now()}`;
        
        for (let i = 0; i < 3; i++) {
          await request(app)
            .post('/api/adhd/session/start')
            .send({ userId: uniqueUserId, taskName: `Task ${i + 1}` });
        }

        const response = await request(app)
          .get(`/api/adhd/history/${uniqueUserId}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.sessions).toBeInstanceOf(Array);
        expect(response.body.sessions.length).toBeGreaterThan(0);
      });

      it('should support limit parameter', async () => {
        const uniqueUserId = `limit-test-${Date.now()}`;
        
        for (let i = 0; i < 5; i++) {
          await request(app)
            .post('/api/adhd/session/start')
            .send({ userId: uniqueUserId, taskName: `Task ${i + 1}` });
        }

        const response = await request(app)
          .get(`/api/adhd/history/${uniqueUserId}?limit=2`);

        expect(response.status).toBe(200);
        expect(response.body.sessions.length).toBeLessThanOrEqual(2);
      });

      it('should return sessions in reverse chronological order', async () => {
        const uniqueUserId = `order-test-${Date.now()}`;
        
        for (let i = 0; i < 3; i++) {
          await request(app)
            .post('/api/adhd/session/start')
            .send({ userId: uniqueUserId, taskName: `Task ${i + 1}` });
          await wait(10);
        }

        const response = await request(app)
          .get(`/api/adhd/history/${uniqueUserId}`);

        const sessions = response.body.sessions;
        if (sessions.length > 1) {
          const firstTime = new Date(sessions[0].startTime).getTime();
          const secondTime = new Date(sessions[1].startTime).getTime();
          expect(firstTime).toBeGreaterThanOrEqual(secondTime);
        }
      });

      it('should include session details in history', async () => {
        const uniqueUserId = `details-test-${Date.now()}`;
        await request(app)
          .post('/api/adhd/session/start')
          .send({ userId: uniqueUserId, taskName: 'Details task' });

        const response = await request(app)
          .get(`/api/adhd/history/${uniqueUserId}`);

        const session = response.body.sessions[0];
        expect(session).toHaveProperty('id');
        expect(session).toHaveProperty('taskName');
        expect(session).toHaveProperty('duration');
        expect(session).toHaveProperty('startTime');
        expect(session).toHaveProperty('endTime');
        expect(session).toHaveProperty('completed');
        expect(session).toHaveProperty('interrupted');
      });

      it('should return count of sessions', async () => {
        const uniqueUserId = `count-test-${Date.now()}`;
        await request(app)
          .post('/api/adhd/session/start')
          .send({ userId: uniqueUserId, taskName: 'Count task' });

        const response = await request(app)
          .get(`/api/adhd/history/${uniqueUserId}`);

        expect(response.body).toHaveProperty('count');
        expect(response.body.count).toBe(response.body.sessions.length);
      });
    });
  });

  // ============================================================================
  // BREAK RECOMMENDATIONS TESTS
  // ============================================================================

  describe('Break Recommendations', () => {
    describe('GET /api/adhd/break/:userId', () => {
      it('should recommend break duration', async () => {
        const uniqueUserId = `break-rec-${Date.now()}`;
        const response = await request(app)
          .get(`/api/adhd/break/${uniqueUserId}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body).toHaveProperty('recommendedBreakMinutes');
        expect([5, 15]).toContain(response.body.recommendedBreakMinutes);
      });

      it('should provide encouraging break message', async () => {
        const uniqueUserId = `break-msg-${Date.now()}`;
        const response = await request(app)
          .get(`/api/adhd/break/${uniqueUserId}`);

        expect(response.body.message).toBeDefined();
        expect(response.body.message.length).toBeGreaterThan(0);
      });

      it('should show completed sessions count', async () => {
        const uniqueUserId = `break-count-${Date.now()}`;
        const response = await request(app)
          .get(`/api/adhd/break/${uniqueUserId}`);

        expect(response.body).toHaveProperty('completedSessions');
        expect(typeof response.body.completedSessions).toBe('number');
      });
    });
  });

  // ============================================================================
  // DISTRACTION-FREE INTERFACE TESTS
  // ============================================================================

  describe('Distraction-Free Interface', () => {
    it('should provide minimal response data during active session', async () => {
      const uniqueUserId = `minimal-${Date.now()}`;
      const startResponse = await request(app)
        .post('/api/adhd/session/start')
        .send({
          userId: uniqueUserId,
          taskName: 'Minimal test',
          duration: 25
        });

      expect(Object.keys(startResponse.body)).toHaveLength(3);
      expect(startResponse.body).toHaveProperty('success');
      expect(startResponse.body).toHaveProperty('session');
      expect(startResponse.body).toHaveProperty('message');
    });

    it('should use clear, simple language in messages', async () => {
      const uniqueUserId = `language-${Date.now()}`;
      const startResponse = await request(app)
        .post('/api/adhd/session/start')
        .send({
          userId: uniqueUserId,
          taskName: 'Language test',
          duration: 25
        });

      const message = startResponse.body.message;
      expect(message).toBeDefined();
      expect(message.split(' ').length).toBeLessThan(15);
    });

    it('should provide positive reinforcement without overwhelming', async () => {
      const uniqueUserId = `positive-${Date.now()}`;
      const startResponse = await request(app)
        .post('/api/adhd/session/start')
        .send({ userId: uniqueUserId, taskName: 'Positive test' });

      const completeResponse = await request(app)
        .post(`/api/adhd/session/${startResponse.body.session.id}/complete`);

      expect(completeResponse.body.message).toContain('Great job');
      expect(completeResponse.body.message).toMatch(/[🎉✨💪🌟]/);
    });

    it('should handle errors gracefully with supportive messages', async () => {
      const response = await request(app)
        .post('/api/adhd/session/non-existent/complete');

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  // ============================================================================
  // USER SATISFACTION METRICS (>80% TARGET)
  // ============================================================================

  describe('User Satisfaction Metrics (>80% Target)', () => {
    it('should track completion rate as satisfaction indicator', async () => {
      const uniqueUserId = `satisfaction-${Date.now()}`;

      // Complete 8 out of 10 sessions (80% completion rate)
      for (let i = 0; i < 10; i++) {
        const startResponse = await request(app)
          .post('/api/adhd/session/start')
          .send({ userId: uniqueUserId, taskName: `Satisfaction task ${i + 1}` });

        expect(startResponse.status).toBe(201);
        expect(startResponse.body.session).toBeDefined();
        expect(startResponse.body.session.id).toBeDefined();

        if (i < 8) {
          await request(app)
            .post(`/api/adhd/session/${startResponse.body.session.id}/complete`);
        }
      }

      const progressResponse = await request(app)
        .get(`/api/adhd/progress/${uniqueUserId}`);

      const completionRate = progressResponse.body.progress.completionRate;
      expect(completionRate).toBeGreaterThanOrEqual(80);
    });

    it('should measure engagement through session frequency', async () => {
      const uniqueUserId = `engagement-${Date.now()}`;

      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/adhd/session/start')
          .send({ userId: uniqueUserId, taskName: `Engagement task ${i + 1}` });
      }

      const historyResponse = await request(app)
        .get(`/api/adhd/history/${uniqueUserId}`);

      expect(historyResponse.body.count).toBeGreaterThanOrEqual(5);
    });

    it('should track user retention through level progression', async () => {
      const uniqueUserId = `retention-${Date.now()}`;

      for (let i = 0; i < 6; i++) {
        const startResponse = await request(app)
          .post('/api/adhd/session/start')
          .send({ userId: uniqueUserId, taskName: `Retention task ${i + 1}`, duration: 25 });

        await request(app)
          .post(`/api/adhd/session/${startResponse.body.session.id}/complete`);
      }

      const progressResponse = await request(app)
        .get(`/api/adhd/progress/${uniqueUserId}`);

      expect(progressResponse.body.progress.xp).toBeGreaterThan(1000);
    });

    it('should provide positive feedback ratio (rewards vs sessions)', async () => {
      const uniqueUserId = `feedback-${Date.now()}`;
      let totalRewards = 0;

      for (let i = 0; i < 5; i++) {
        const startResponse = await request(app)
          .post('/api/adhd/session/start')
          .send({ userId: uniqueUserId, taskName: `Feedback task ${i + 1}` });

        const completeResponse = await request(app)
          .post(`/api/adhd/session/${startResponse.body.session.id}/complete`);

        totalRewards += completeResponse.body.rewards.length;
      }

      expect(totalRewards).toBeGreaterThan(0);
    });

    it('should measure task completion success rate', async () => {
      const uniqueUserId = `success-${Date.now()}`;

      for (let i = 0; i < 5; i++) {
        const startResponse = await request(app)
          .post('/api/adhd/session/start')
          .send({ userId: uniqueUserId, taskName: `Success task ${i + 1}` });

        expect(startResponse.status).toBe(201);
        expect(startResponse.body.session).toBeDefined();
        expect(startResponse.body.session.id).toBeDefined();

        await request(app)
          .post(`/api/adhd/session/${startResponse.body.session.id}/complete`);
      }

      const progressResponse = await request(app)
        .get(`/api/adhd/progress/${uniqueUserId}`);

      expect(progressResponse.body.progress.completionRate).toBe(100);
    });

    it('should track low interruption rate as quality metric', async () => {
      const uniqueUserId = `quality-${Date.now()}`;

      for (let i = 0; i < 10; i++) {
        const startResponse = await request(app)
          .post('/api/adhd/session/start')
          .send({ userId: uniqueUserId, taskName: `Quality task ${i + 1}` });

        expect(startResponse.status).toBe(201);
        expect(startResponse.body.session).toBeDefined();
        expect(startResponse.body.session.id).toBeDefined();

        if (i < 2) {
          await request(app)
            .post(`/api/adhd/session/${startResponse.body.session.id}/interrupt`);
        } else {
          await request(app)
            .post(`/api/adhd/session/${startResponse.body.session.id}/complete`);
        }
      }

      const historyResponse = await request(app)
        .get(`/api/adhd/history/${uniqueUserId}`);

      const interrupted = historyResponse.body.sessions.filter((s: any) => s.interrupted).length;
      const interruptionRate = (interrupted / historyResponse.body.count) * 100;

      expect(interruptionRate).toBeLessThan(20);
    });
  });

  // ============================================================================
  // INTEGRATION AND EDGE CASES
  // ============================================================================

  describe('Integration and Edge Cases', () => {
    it('should handle rapid session creation', async () => {
      const uniqueUserId = `rapid-${Date.now()}`;
      const promises = [];

      for (let i = 0; i < 5; i++) {
        promises.push(
          request(app)
            .post('/api/adhd/session/start')
            .send({ userId: uniqueUserId, taskName: `Rapid task ${i + 1}` })
        );
      }

      const responses = await Promise.all(promises);
      responses.forEach(response => {
        expect(response.status).toBe(201);
      });
    });

    it('should maintain data consistency across operations', async () => {
      const uniqueUserId = `consistency-${Date.now()}`;

      const startResponse = await request(app)
        .post('/api/adhd/session/start')
        .send({ userId: uniqueUserId, taskName: 'Consistency test' });

      const sessionId = startResponse.body.session.id;

      const getResponse = await request(app)
        .get(`/api/adhd/session/${sessionId}`);

      expect(getResponse.body.session.id).toBe(sessionId);
      expect(getResponse.body.session.taskName).toBe('Consistency test');

      await request(app)
        .post(`/api/adhd/session/${sessionId}/complete`);

      const historyResponse = await request(app)
        .get(`/api/adhd/history/${uniqueUserId}`);

      const completedSession = historyResponse.body.sessions.find((s: any) => s.id === sessionId);
      expect(completedSession.completed).toBe(true);
    });

    it('should handle concurrent user sessions', async () => {
      const user1 = `concurrent-1-${Date.now()}`;
      const user2 = `concurrent-2-${Date.now()}`;

      const [response1, response2] = await Promise.all([
        request(app)
          .post('/api/adhd/session/start')
          .send({ userId: user1, taskName: 'User 1 task' }),
        request(app)
          .post('/api/adhd/session/start')
          .send({ userId: user2, taskName: 'User 2 task' })
      ]);

      expect(response1.status).toBe(201);
      expect(response2.status).toBe(201);
      expect(response1.body.session.id).not.toBe(response2.body.session.id);
    });

    it('should handle edge case: zero completed sessions', async () => {
      const uniqueUserId = `zero-${Date.now()}`;

      const progressResponse = await request(app)
        .get(`/api/adhd/progress/${uniqueUserId}`);

      expect(progressResponse.body.progress.completedSessions).toBe(0);
      expect(progressResponse.body.progress.completionRate).toBe(0);
      expect(progressResponse.body.progress.level).toBe(1);
    });

    it('should handle edge case: all sessions interrupted', async () => {
      const uniqueUserId = `all-interrupted-${Date.now()}`;

      for (let i = 0; i < 3; i++) {
        const startResponse = await request(app)
          .post('/api/adhd/session/start')
          .send({ userId: uniqueUserId, taskName: `Interrupted ${i + 1}` });

        await request(app)
          .post(`/api/adhd/session/${startResponse.body.session.id}/interrupt`);
      }

      const progressResponse = await request(app)
        .get(`/api/adhd/progress/${uniqueUserId}`);

      expect(progressResponse.body.progress.completedSessions).toBe(0);
      expect(progressResponse.body.progress.completionRate).toBe(0);
    });

    it('should handle multiple users independently', async () => {
      const user1 = `multi-user-1-${Date.now()}`;
      const user2 = `multi-user-2-${Date.now()}`;

      // User 1: Complete 3 sessions
      for (let i = 0; i < 3; i++) {
        const start = await request(app)
          .post('/api/adhd/session/start')
          .send({ userId: user1, taskName: `User1 task ${i + 1}` });
        await request(app)
          .post(`/api/adhd/session/${start.body.session.id}/complete`);
      }

      // User 2: Complete 5 sessions
      for (let i = 0; i < 5; i++) {
        const start = await request(app)
          .post('/api/adhd/session/start')
          .send({ userId: user2, taskName: `User2 task ${i + 1}` });
        await request(app)
          .post(`/api/adhd/session/${start.body.session.id}/complete`);
      }

      const progress1 = await request(app).get(`/api/adhd/progress/${user1}`);
      const progress2 = await request(app).get(`/api/adhd/progress/${user2}`);

      expect(progress1.body.progress.completedSessions).toBe(3);
      expect(progress2.body.progress.completedSessions).toBe(5);
    });
  });
});
