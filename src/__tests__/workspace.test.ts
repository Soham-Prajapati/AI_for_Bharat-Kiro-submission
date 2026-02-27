/**
 * Workspace API Tests
 * Tests for collaborative workspace REST API and WebSocket
 */

import request from 'supertest';
import app from '../index';
import { workspaceService } from '../services/workspace.service';

describe('Workspace API', () => {
  afterEach(() => {
    // Clean up workspaces after each test
    const workspaces = workspaceService.list();
    workspaces.forEach(ws => workspaceService.delete(ws.id));
  });

  describe('POST /api/workspace/create', () => {
    it('should create a new workspace', async () => {
      const response = await request(app)
        .post('/api/workspace/create')
        .send({
          name: 'Test Workspace',
          initialContent: 'Hello World'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.workspace).toHaveProperty('id');
      expect(response.body.workspace.name).toBe('Test Workspace');
      expect(response.body.workspace.content).toBe('Hello World');
      expect(response.body.workspace.version).toBe(0);
    });

    it('should create workspace with empty content if not provided', async () => {
      const response = await request(app)
        .post('/api/workspace/create')
        .send({
          name: 'Empty Workspace'
        });

      expect(response.status).toBe(201);
      expect(response.body.workspace.content).toBe('');
    });

    it('should return 400 if name is missing', async () => {
      const response = await request(app)
        .post('/api/workspace/create')
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/workspace/:id', () => {
    it('should get workspace details', async () => {
      // Create workspace first
      const createResponse = await request(app)
        .post('/api/workspace/create')
        .send({
          name: 'Test Workspace',
          initialContent: 'Content'
        });

      const workspaceId = createResponse.body.workspace.id;

      // Get workspace
      const response = await request(app)
        .get(`/api/workspace/${workspaceId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.workspace.id).toBe(workspaceId);
      expect(response.body.workspace.name).toBe('Test Workspace');
      expect(response.body.workspace.content).toBe('Content');
    });

    it('should return 404 for non-existent workspace', async () => {
      const response = await request(app)
        .get('/api/workspace/non-existent-id');

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/workspace/:id/users', () => {
    it('should return empty users list for new workspace', async () => {
      // Create workspace
      const createResponse = await request(app)
        .post('/api/workspace/create')
        .send({
          name: 'Test Workspace'
        });

      const workspaceId = createResponse.body.workspace.id;

      // Get users
      const response = await request(app)
        .get(`/api/workspace/${workspaceId}/users`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.users).toEqual([]);
      expect(response.body.count).toBe(0);
    });
  });

  describe('DELETE /api/workspace/:id', () => {
    it('should delete workspace', async () => {
      // Create workspace
      const createResponse = await request(app)
        .post('/api/workspace/create')
        .send({
          name: 'Test Workspace'
        });

      const workspaceId = createResponse.body.workspace.id;

      // Delete workspace
      const response = await request(app)
        .delete(`/api/workspace/${workspaceId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify it's deleted
      const getResponse = await request(app)
        .get(`/api/workspace/${workspaceId}`);

      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for non-existent workspace', async () => {
      const response = await request(app)
        .delete('/api/workspace/non-existent-id');

      expect(response.status).toBe(404);
    });
  });
});

describe('Workspace Service', () => {
  afterEach(() => {
    const workspaces = workspaceService.list();
    workspaces.forEach(ws => workspaceService.delete(ws.id));
  });

  describe('Operational Transform', () => {
    it('should apply insert operation', () => {
      const workspace = workspaceService.create('Test', 'Hello');

      const change = {
        id: '1',
        userId: 'user1',
        timestamp: Date.now(),
        operation: 'insert' as const,
        position: 5,
        content: ' World'
      };

      const result = workspaceService.applyChange(workspace.id, change);

      expect(result.success).toBe(true);
      
      const updated = workspaceService.get(workspace.id);
      expect(updated?.content).toBe('Hello World');
      expect(updated?.version).toBe(1);
    });

    it('should apply delete operation', () => {
      const workspace = workspaceService.create('Test', 'Hello World');

      const change = {
        id: '1',
        userId: 'user1',
        timestamp: Date.now(),
        operation: 'delete' as const,
        position: 5,
        length: 6
      };

      const result = workspaceService.applyChange(workspace.id, change);

      expect(result.success).toBe(true);
      
      const updated = workspaceService.get(workspace.id);
      expect(updated?.content).toBe('Hello');
    });

    it('should apply replace operation', () => {
      const workspace = workspaceService.create('Test', 'Hello World');

      const change = {
        id: '1',
        userId: 'user1',
        timestamp: Date.now(),
        operation: 'replace' as const,
        position: 6,
        length: 5,
        content: 'Universe'
      };

      const result = workspaceService.applyChange(workspace.id, change);

      expect(result.success).toBe(true);
      
      const updated = workspaceService.get(workspace.id);
      expect(updated?.content).toBe('Hello Universe');
    });
  });

  describe('User Management', () => {
    it('should add user to workspace', () => {
      const workspace = workspaceService.create('Test', '');

      const user = {
        id: 'user1',
        name: 'John Doe',
        color: '#FF0000'
      };

      const added = workspaceService.addUser(workspace.id, user);
      expect(added).toBe(true);

      const users = workspaceService.getUsers(workspace.id);
      expect(users).toHaveLength(1);
      expect(users[0].id).toBe('user1');
    });

    it('should remove user from workspace', () => {
      const workspace = workspaceService.create('Test', '');

      const user = {
        id: 'user1',
        name: 'John Doe',
        color: '#FF0000'
      };

      workspaceService.addUser(workspace.id, user);
      const removed = workspaceService.removeUser(workspace.id, 'user1');

      expect(removed).toBe(true);

      const users = workspaceService.getUsers(workspace.id);
      expect(users).toHaveLength(0);
    });

    it('should update user cursor', () => {
      const workspace = workspaceService.create('Test', '');

      const user = {
        id: 'user1',
        name: 'John Doe',
        color: '#FF0000'
      };

      workspaceService.addUser(workspace.id, user);
      
      const updated = workspaceService.updateCursor(workspace.id, 'user1', {
        line: 5,
        column: 10
      });

      expect(updated).toBe(true);

      const users = workspaceService.getUsers(workspace.id);
      expect(users[0].cursor).toEqual({ line: 5, column: 10 });
    });
  });
});
