/**
 * ADHD Navigator API Tests
 */

import request from 'supertest';
import app from '../index';

describe('ADHD Navigator API', () => {
  const testUserId = 'test-user-adhd';

  describe('POST /api/adhd/session/start', () => {
    it('should start a focus session', async () => {
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
    });

    it('should use default duration if not provided', async () => {
      const response = await request(app)
        .post('/api/adhd/session/start')
        .send({
          userId: testUserId,
          taskName: 'Code review'
        });

      expect(response.status).toBe(201);
      expect(response.body.session.duration).toBe(25);
    });

    it('should return 400 if userId is missing', async () => {
      const response = await request(app)
        .post('/api/adhd/session/start')
        .send({
          taskName: 'Task without user'
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 if duration is invalid', async () => {
      const response = await request(app)
        .post('/api/adhd/session/start')
        .send({
          userId: testUserId,
          taskName: 'Test task',
          duration: 100
        });

      expect(response.status).toBe(400);
    });
  });

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

    it('should complete a session', async () => {
      const response = await request(app)
        .post(`/api/adhd/session/${sessionId}/complete`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.session.completed).toBe(true);
      expect(response.body.rewards).toBeInstanceOf(Array);
    });

    it('should award first session reward', async () => {
      const response = await request(app)
        .post(`/api/adhd/session/${sessionId}/complete`);

      expect(response.body.rewards.length).toBeGreaterThan(0);
      expect(response.body.rewards[0].name).toBe('First Focus');
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

    it('should interrupt a session', async () => {
      const response = await request(app)
        .post(`/api/adhd/session/${sessionId}/interrupt`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.session.interrupted).toBe(true);
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
    });

    it('should return 404 for non-existent session', async () => {
      const response = await request(app)
        .get('/api/adhd/session/non-existent');

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/adhd/progress/:userId', () => {
    beforeEach(async () => {
      // Create and complete a session
      const startResponse = await request(app)
        .post('/api/adhd/session/start')
        .send({
          userId: testUserId,
          taskName: 'Progress test'
        });

      await request(app)
        .post(`/api/adhd/session/${startResponse.body.session.id}/complete`);
    });

    it('should get user progress', async () => {
      const response = await request(app)
        .get(`/api/adhd/progress/${testUserId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.progress.userId).toBe(testUserId);
      expect(response.body.progress.totalSessions).toBeGreaterThan(0);
      expect(response.body.progress.level).toBeGreaterThanOrEqual(1);
    });

    it('should calculate completion rate', async () => {
      const response = await request(app)
        .get(`/api/adhd/progress/${testUserId}`);

      expect(response.body.progress).toHaveProperty('completionRate');
      expect(response.body.progress.completionRate).toBeGreaterThanOrEqual(0);
      expect(response.body.progress.completionRate).toBeLessThanOrEqual(100);
    });
  });

  describe('GET /api/adhd/history/:userId', () => {
    beforeEach(async () => {
      // Create multiple sessions
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/adhd/session/start')
          .send({
            userId: testUserId,
            taskName: `Task ${i + 1}`
          });
      }
    });

    it('should get session history', async () => {
      const response = await request(app)
        .get(`/api/adhd/history/${testUserId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.sessions).toBeInstanceOf(Array);
      expect(response.body.sessions.length).toBeGreaterThan(0);
    });

    it('should support limit parameter', async () => {
      const response = await request(app)
        .get(`/api/adhd/history/${testUserId}?limit=2`);

      expect(response.status).toBe(200);
      expect(response.body.sessions.length).toBeLessThanOrEqual(2);
    });
  });

  describe('POST /api/adhd/task/chunk', () => {
    it('should chunk a large task', async () => {
      const response = await request(app)
        .post('/api/adhd/task/chunk')
        .send({
          taskDescription: 'Build entire feature',
          estimatedMinutes: 75
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.chunks).toBeInstanceOf(Array);
      expect(response.body.chunks.length).toBe(3); // 75 / 25 = 3
    });

    it('should return 400 if parameters missing', async () => {
      const response = await request(app)
        .post('/api/adhd/task/chunk')
        .send({
          taskDescription: 'Task without time'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/adhd/break/:userId', () => {
    it('should recommend break duration', async () => {
      const response = await request(app)
        .get(`/api/adhd/break/${testUserId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('recommendedBreakMinutes');
      expect([5, 15]).toContain(response.body.recommendedBreakMinutes);
    });
  });
});
