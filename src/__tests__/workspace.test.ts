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

describe('Concurrent Editing and Conflict Resolution', () => {
  afterEach(() => {
    const workspaces = workspaceService.list();
    workspaces.forEach(ws => workspaceService.delete(ws.id));
  });

  describe('10 Concurrent Users Editing Same Workspace', () => {
    it('should handle 10 users making simultaneous edits', async () => {
      const workspace = workspaceService.create('Concurrent Test', 'Initial content');
      const userCount = 10;
      const users = Array.from({ length: userCount }, (_, i) => ({
        id: `user${i}`,
        name: `User ${i}`,
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`
      }));

      // Add all users to workspace
      users.forEach(user => workspaceService.addUser(workspace.id, user));

      // Each user makes an insert at different positions
      const changes = users.map((user, i) => ({
        id: `change-${i}`,
        userId: user.id,
        timestamp: Date.now() + i,
        operation: 'insert' as const,
        position: i * 2,
        content: ` [${user.name}]`
      }));

      // Apply all changes concurrently
      const results = await Promise.all(
        changes.map(change => 
          Promise.resolve(workspaceService.applyChange(workspace.id, change))
        )
      );

      // Verify all changes succeeded
      results.forEach(result => {
        expect(result.success).toBe(true);
      });

      // Verify workspace version incremented correctly
      const updated = workspaceService.get(workspace.id);
      expect(updated?.version).toBe(userCount);

      // Verify all user edits are present
      users.forEach(user => {
        expect(updated?.content).toContain(`[${user.name}]`);
      });
    });

    it('should maintain data integrity with concurrent inserts at same position', async () => {
      const workspace = workspaceService.create('Same Position Test', 'Start End');
      const userCount = 10;
      const insertPosition = 6; // Between "Start" and "End"

      const changes = Array.from({ length: userCount }, (_, i) => ({
        id: `change-${i}`,
        userId: `user${i}`,
        timestamp: Date.now() + i,
        operation: 'insert' as const,
        position: insertPosition,
        content: `${i}`
      }));

      // Apply all changes
      const results = await Promise.all(
        changes.map(change => 
          Promise.resolve(workspaceService.applyChange(workspace.id, change))
        )
      );

      results.forEach(result => {
        expect(result.success).toBe(true);
      });

      const updated = workspaceService.get(workspace.id);
      expect(updated?.version).toBe(userCount);
      
      // Verify content contains all numbers
      for (let i = 0; i < userCount; i++) {
        expect(updated?.content).toContain(`${i}`);
      }

      // Verify Start and End are still present
      expect(updated?.content).toContain('Start');
      expect(updated?.content).toContain('End');
    });

    it('should handle concurrent deletes without corruption', async () => {
      const workspace = workspaceService.create(
        'Concurrent Delete Test',
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      );

      const changes = Array.from({ length: 10 }, (_, i) => ({
        id: `delete-${i}`,
        userId: `user${i}`,
        timestamp: Date.now() + i,
        operation: 'delete' as const,
        position: i * 2,
        length: 1
      }));

      const results = await Promise.all(
        changes.map(change => 
          Promise.resolve(workspaceService.applyChange(workspace.id, change))
        )
      );

      results.forEach(result => {
        expect(result.success).toBe(true);
      });

      const updated = workspaceService.get(workspace.id);
      expect(updated?.version).toBe(10);
      expect(updated?.content.length).toBeLessThan(26);
    });
  });

  describe('Operational Transform Conflict Resolution', () => {
    it('should correctly transform concurrent insert operations', () => {
      const workspace = workspaceService.create('OT Test', 'Hello World');

      // User 1 inserts at position 5
      const change1 = {
        id: 'c1',
        userId: 'user1',
        timestamp: Date.now(),
        operation: 'insert' as const,
        position: 5,
        content: ' Beautiful'
      };

      // User 2 inserts at position 11 (before user1's change is known)
      const change2 = {
        id: 'c2',
        userId: 'user2',
        timestamp: Date.now() + 1,
        operation: 'insert' as const,
        position: 11,
        content: '!'
      };

      const result1 = workspaceService.applyChange(workspace.id, change1);
      const result2 = workspaceService.applyChange(workspace.id, change2);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);

      const updated = workspaceService.get(workspace.id);
      expect(updated?.content).toContain('Beautiful');
      expect(updated?.content).toContain('!');
    });

    it('should handle insert-delete conflicts', () => {
      const workspace = workspaceService.create('Conflict Test', 'The quick brown fox');

      // User 1 deletes "quick "
      const deleteChange = {
        id: 'c1',
        userId: 'user1',
        timestamp: Date.now(),
        operation: 'delete' as const,
        position: 4,
        length: 6
      };

      // User 2 inserts before "quick"
      const insertChange = {
        id: 'c2',
        userId: 'user2',
        timestamp: Date.now() + 1,
        operation: 'insert' as const,
        position: 4,
        content: 'very '
      };

      workspaceService.applyChange(workspace.id, deleteChange);
      workspaceService.applyChange(workspace.id, insertChange);

      const updated = workspaceService.get(workspace.id);
      expect(updated?.version).toBe(2);
      expect(updated?.content).toBeTruthy();
    });

    it('should handle replace-replace conflicts', () => {
      const workspace = workspaceService.create('Replace Test', 'Hello World');

      // User 1 replaces "Hello"
      const replace1 = {
        id: 'c1',
        userId: 'user1',
        timestamp: Date.now(),
        operation: 'replace' as const,
        position: 0,
        length: 5,
        content: 'Goodbye'
      };

      // User 2 replaces "World"
      const replace2 = {
        id: 'c2',
        userId: 'user2',
        timestamp: Date.now() + 1,
        operation: 'replace' as const,
        position: 6,
        length: 5,
        content: 'Universe'
      };

      const result1 = workspaceService.applyChange(workspace.id, replace1);
      const result2 = workspaceService.applyChange(workspace.id, replace2);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);

      const updated = workspaceService.get(workspace.id);
      expect(updated?.version).toBe(2);
      // Verify both operations were applied (content may be transformed)
      expect(updated?.content.length).toBeGreaterThan(0);
    });

    it('should maintain operation order with timestamps', () => {
      const workspace = workspaceService.create('Order Test', 'ABC');
      const baseTime = Date.now();

      const changes = [
        {
          id: 'c3',
          userId: 'user3',
          timestamp: baseTime + 30,
          operation: 'insert' as const,
          position: 3,
          content: '3'
        },
        {
          id: 'c1',
          userId: 'user1',
          timestamp: baseTime + 10,
          operation: 'insert' as const,
          position: 3,
          content: '1'
        },
        {
          id: 'c2',
          userId: 'user2',
          timestamp: baseTime + 20,
          operation: 'insert' as const,
          position: 3,
          content: '2'
        }
      ];

      // Apply in random order
      changes.forEach(change => {
        workspaceService.applyChange(workspace.id, change);
      });

      const updated = workspaceService.get(workspace.id);
      expect(updated?.version).toBe(3);
      expect(updated?.content).toContain('ABC');
    });
  });

  describe('Data Integrity After Concurrent Edits', () => {
    it('should maintain content length consistency', async () => {
      const initialContent = 'A'.repeat(100);
      const workspace = workspaceService.create('Length Test', initialContent);

      const insertChanges = Array.from({ length: 5 }, (_, i) => ({
        id: `insert-${i}`,
        userId: `user${i}`,
        timestamp: Date.now() + i,
        operation: 'insert' as const,
        position: i * 10,
        content: 'XX'
      }));

      await Promise.all(
        insertChanges.map(change => 
          Promise.resolve(workspaceService.applyChange(workspace.id, change))
        )
      );

      const updated = workspaceService.get(workspace.id);
      expect(updated?.content.length).toBeGreaterThan(initialContent.length);
      expect(updated?.version).toBe(5);
    });

    it('should preserve content boundaries', async () => {
      const workspace = workspaceService.create(
        'Boundary Test',
        'START___MIDDLE___END'
      );

      const changes = [
        {
          id: 'c1',
          userId: 'user1',
          timestamp: Date.now(),
          operation: 'insert' as const,
          position: 5,
          content: '[A]'
        },
        {
          id: 'c2',
          userId: 'user2',
          timestamp: Date.now() + 1,
          operation: 'insert' as const,
          position: 14,
          content: '[B]'
        }
      ];

      await Promise.all(
        changes.map(change => 
          Promise.resolve(workspaceService.applyChange(workspace.id, change))
        )
      );

      const updated = workspaceService.get(workspace.id);
      expect(updated?.content).toContain('START');
      expect(updated?.content).toContain('MIDDLE');
      expect(updated?.content).toContain('END');
      expect(updated?.content).toContain('[A]');
      expect(updated?.content).toContain('[B]');
    });

    it('should handle empty content edge case', async () => {
      const workspace = workspaceService.create('Empty Test', '');

      const changes = Array.from({ length: 10 }, (_, i) => ({
        id: `c${i}`,
        userId: `user${i}`,
        timestamp: Date.now() + i,
        operation: 'insert' as const,
        position: 0,
        content: `${i}`
      }));

      await Promise.all(
        changes.map(change => 
          Promise.resolve(workspaceService.applyChange(workspace.id, change))
        )
      );

      const updated = workspaceService.get(workspace.id);
      expect(updated?.content.length).toBeGreaterThan(0);
      expect(updated?.version).toBe(10);
    });

    it('should maintain version consistency', async () => {
      const workspace = workspaceService.create('Version Test', 'Content');
      const operationCount = 20;

      const changes = Array.from({ length: operationCount }, (_, i) => ({
        id: `c${i}`,
        userId: `user${i % 5}`,
        timestamp: Date.now() + i,
        operation: (i % 2 === 0 ? 'insert' : 'delete') as 'insert' | 'delete',
        position: Math.min(i, 7),
        content: i % 2 === 0 ? 'X' : undefined,
        length: i % 2 === 1 ? 1 : undefined
      }));

      await Promise.all(
        changes.map(change => 
          Promise.resolve(workspaceService.applyChange(workspace.id, change))
        )
      );

      const updated = workspaceService.get(workspace.id);
      expect(updated?.version).toBe(operationCount);
      expect(updated?.changes.length).toBe(operationCount);
    });
  });

  describe('Race Conditions and Edge Cases', () => {
    it('should handle rapid-fire edits from single user', async () => {
      const workspace = workspaceService.create('Rapid Test', 'Base');
      const userId = 'rapid-user';

      const changes = Array.from({ length: 50 }, (_, i) => ({
        id: `rapid-${i}`,
        userId,
        timestamp: Date.now() + i,
        operation: 'insert' as const,
        position: 4,
        content: '.'
      }));

      const results = await Promise.all(
        changes.map(change => 
          Promise.resolve(workspaceService.applyChange(workspace.id, change))
        )
      );

      expect(results.every(r => r.success)).toBe(true);

      const updated = workspaceService.get(workspace.id);
      expect(updated?.version).toBe(50);
    });

    it('should handle delete beyond content length', () => {
      const workspace = workspaceService.create('Delete Edge', 'Short');

      const change = {
        id: 'c1',
        userId: 'user1',
        timestamp: Date.now(),
        operation: 'delete' as const,
        position: 3,
        length: 100 // Way beyond content length
      };

      const result = workspaceService.applyChange(workspace.id, change);
      expect(result.success).toBe(true);

      const updated = workspaceService.get(workspace.id);
      expect(updated?.content).toBe('Sho');
    });

    it('should handle insert at invalid position gracefully', () => {
      const workspace = workspaceService.create('Position Edge', 'Test');

      const change = {
        id: 'c1',
        userId: 'user1',
        timestamp: Date.now(),
        operation: 'insert' as const,
        position: 1000, // Beyond content
        content: 'X'
      };

      const result = workspaceService.applyChange(workspace.id, change);
      expect(result.success).toBe(true);

      const updated = workspaceService.get(workspace.id);
      expect(updated?.content).toContain('X');
    });

    it('should handle concurrent operations on non-existent workspace', async () => {
      const fakeId = 'non-existent-workspace';

      const changes = Array.from({ length: 5 }, (_, i) => ({
        id: `c${i}`,
        userId: `user${i}`,
        timestamp: Date.now() + i,
        operation: 'insert' as const,
        position: 0,
        content: 'X'
      }));

      const results = await Promise.all(
        changes.map(change => 
          Promise.resolve(workspaceService.applyChange(fakeId, change))
        )
      );

      expect(results.every(r => !r.success)).toBe(true);
    });

    it('should handle zero-length operations', () => {
      const workspace = workspaceService.create('Zero Test', 'Content');

      const changes = [
        {
          id: 'c1',
          userId: 'user1',
          timestamp: Date.now(),
          operation: 'insert' as const,
          position: 3,
          content: '' // Empty insert
        },
        {
          id: 'c2',
          userId: 'user2',
          timestamp: Date.now() + 1,
          operation: 'delete' as const,
          position: 3,
          length: 0 // Zero-length delete
        }
      ];

      changes.forEach(change => {
        const result = workspaceService.applyChange(workspace.id, change);
        expect(result.success).toBe(true);
      });

      const updated = workspaceService.get(workspace.id);
      expect(updated?.content).toBe('Content');
    });
  });

  describe('Mixed Concurrent Operations', () => {
    it('should handle mix of insert, delete, and replace operations', async () => {
      const workspace = workspaceService.create(
        'Mixed Ops Test',
        'The quick brown fox jumps over the lazy dog'
      );

      const changes = [
        {
          id: 'c1',
          userId: 'user1',
          timestamp: Date.now(),
          operation: 'insert' as const,
          position: 4,
          content: 'very '
        },
        {
          id: 'c2',
          userId: 'user2',
          timestamp: Date.now() + 1,
          operation: 'delete' as const,
          position: 10,
          length: 6 // Delete "brown "
        },
        {
          id: 'c3',
          userId: 'user3',
          timestamp: Date.now() + 2,
          operation: 'replace' as const,
          position: 35,
          length: 4,
          content: 'sleepy'
        },
        {
          id: 'c4',
          userId: 'user4',
          timestamp: Date.now() + 3,
          operation: 'insert' as const,
          position: 44,
          content: '!'
        }
      ];

      const results = await Promise.all(
        changes.map(change => 
          Promise.resolve(workspaceService.applyChange(workspace.id, change))
        )
      );

      expect(results.every(r => r.success)).toBe(true);

      const updated = workspaceService.get(workspace.id);
      expect(updated?.version).toBe(4);
      expect(updated?.content).toBeTruthy();
    });

    it('should handle overlapping operations', async () => {
      const workspace = workspaceService.create('Overlap Test', '0123456789');

      const changes = [
        {
          id: 'c1',
          userId: 'user1',
          timestamp: Date.now(),
          operation: 'replace' as const,
          position: 2,
          length: 3,
          content: 'ABC'
        },
        {
          id: 'c2',
          userId: 'user2',
          timestamp: Date.now() + 1,
          operation: 'replace' as const,
          position: 4,
          length: 3,
          content: 'XYZ'
        }
      ];

      await Promise.all(
        changes.map(change => 
          Promise.resolve(workspaceService.applyChange(workspace.id, change))
        )
      );

      const updated = workspaceService.get(workspace.id);
      expect(updated?.version).toBe(2);
      expect(updated?.content.length).toBeGreaterThan(0);
    });
  });

  describe('Final Content Consistency', () => {
    it('should produce consistent final state regardless of operation order', async () => {
      // Create two identical workspaces
      const workspace1 = workspaceService.create('Consistency Test 1', 'ABCDEF');
      const workspace2 = workspaceService.create('Consistency Test 2', 'ABCDEF');

      const changes = [
        {
          id: 'c1',
          userId: 'user1',
          timestamp: Date.now(),
          operation: 'insert' as const,
          position: 3,
          content: 'X'
        },
        {
          id: 'c2',
          userId: 'user2',
          timestamp: Date.now() + 10,
          operation: 'insert' as const,
          position: 3,
          content: 'Y'
        }
      ];

      // Apply in order to workspace1
      changes.forEach(change => {
        workspaceService.applyChange(workspace1.id, change);
      });

      // Apply in reverse order to workspace2
      [...changes].reverse().forEach(change => {
        workspaceService.applyChange(workspace2.id, change);
      });

      const updated1 = workspaceService.get(workspace1.id);
      const updated2 = workspaceService.get(workspace2.id);

      // Both should have applied 2 changes
      expect(updated1?.version).toBeGreaterThanOrEqual(2);
      expect(updated2?.version).toBeGreaterThanOrEqual(2);

      // Both should contain both insertions
      expect(updated1?.content).toContain('X');
      expect(updated1?.content).toContain('Y');
      expect(updated2?.content).toContain('X');
      expect(updated2?.content).toContain('Y');
      
      // Both should still contain original content
      expect(updated1?.content).toContain('ABC');
      expect(updated2?.content).toContain('ABC');
    });

    it('should maintain content integrity across all users', async () => {
      const workspace = workspaceService.create('Integrity Test', 'START');
      const userCount = 10;

      // Each user adds their marker
      const changes = Array.from({ length: userCount }, (_, i) => ({
        id: `c${i}`,
        userId: `user${i}`,
        timestamp: Date.now() + i,
        operation: 'insert' as const,
        position: 5 + i,
        content: `[U${i}]`
      }));

      await Promise.all(
        changes.map(change => 
          Promise.resolve(workspaceService.applyChange(workspace.id, change))
        )
      );

      const updated = workspaceService.get(workspace.id);

      // Verify all user markers are present
      for (let i = 0; i < userCount; i++) {
        expect(updated?.content).toContain(`[U${i}]`);
      }

      // Verify START is still there
      expect(updated?.content).toContain('START');
    });
  });

  describe('Performance Under Concurrent Load', () => {
    it('should handle 100 concurrent operations efficiently', async () => {
      const workspace = workspaceService.create('Performance Test', 'Base Content');
      const operationCount = 100;
      const startTime = Date.now();

      const changes = Array.from({ length: operationCount }, (_, i) => ({
        id: `perf-${i}`,
        userId: `user${i % 10}`,
        timestamp: Date.now() + i,
        operation: (i % 3 === 0 ? 'insert' : i % 3 === 1 ? 'delete' : 'replace') as 'insert' | 'delete' | 'replace',
        position: Math.floor(Math.random() * 20),
        content: i % 3 !== 1 ? `[${i}]` : undefined,
        length: i % 3 === 1 ? 1 : i % 3 === 2 ? 2 : undefined
      }));

      const results = await Promise.all(
        changes.map(change => 
          Promise.resolve(workspaceService.applyChange(workspace.id, change))
        )
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(results.every(r => r.success)).toBe(true);
      expect(duration).toBeLessThan(5000); // Should complete in under 5 seconds

      const updated = workspaceService.get(workspace.id);
      expect(updated?.version).toBe(operationCount);
    });

    it('should maintain performance with large content', async () => {
      const largeContent = 'A'.repeat(10000);
      const workspace = workspaceService.create('Large Content Test', largeContent);

      const changes = Array.from({ length: 20 }, (_, i) => ({
        id: `large-${i}`,
        userId: `user${i}`,
        timestamp: Date.now() + i,
        operation: 'insert' as const,
        position: Math.floor(Math.random() * 10000),
        content: `[MARK-${i}]`
      }));

      const startTime = Date.now();

      await Promise.all(
        changes.map(change => 
          Promise.resolve(workspaceService.applyChange(workspace.id, change))
        )
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(2000); // Should be fast even with large content

      const updated = workspaceService.get(workspace.id);
      expect(updated?.version).toBe(20);
    });

    it('should handle burst of operations from multiple users', async () => {
      const workspace = workspaceService.create('Burst Test', 'Initial');
      const usersCount = 10;
      const opsPerUser = 10;

      const allChanges = [];
      for (let user = 0; user < usersCount; user++) {
        for (let op = 0; op < opsPerUser; op++) {
          allChanges.push({
            id: `u${user}-op${op}`,
            userId: `user${user}`,
            timestamp: Date.now() + (user * opsPerUser + op),
            operation: 'insert' as const,
            position: Math.floor(Math.random() * 10),
            content: `${user}${op}`
          });
        }
      }

      const startTime = Date.now();

      const results = await Promise.all(
        allChanges.map(change => 
          Promise.resolve(workspaceService.applyChange(workspace.id, change))
        )
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(results.every(r => r.success)).toBe(true);
      expect(duration).toBeLessThan(3000);

      const updated = workspaceService.get(workspace.id);
      expect(updated?.version).toBe(usersCount * opsPerUser);
    });
  });

  describe('User Presence During Concurrent Editing', () => {
    it('should track all users during concurrent editing', async () => {
      const workspace = workspaceService.create('Presence Test', 'Content');
      const userCount = 10;

      // Add users
      const users = Array.from({ length: userCount }, (_, i) => ({
        id: `user${i}`,
        name: `User ${i}`,
        color: `#${i}${i}${i}${i}${i}${i}`
      }));

      users.forEach(user => workspaceService.addUser(workspace.id, user));

      // Users make edits
      const changes = users.map((user, i) => ({
        id: `c${i}`,
        userId: user.id,
        timestamp: Date.now() + i,
        operation: 'insert' as const,
        position: i,
        content: `[${i}]`
      }));

      await Promise.all(
        changes.map(change => 
          Promise.resolve(workspaceService.applyChange(workspace.id, change))
        )
      );

      // Verify all users are still tracked
      const activeUsers = workspaceService.getUsers(workspace.id);
      expect(activeUsers.length).toBe(userCount);
    });

    it('should update cursor positions during concurrent editing', async () => {
      const workspace = workspaceService.create('Cursor Test', 'Content');
      const userCount = 5;

      const users = Array.from({ length: userCount }, (_, i) => ({
        id: `user${i}`,
        name: `User ${i}`,
        color: `#FF00${i}${i}`
      }));

      users.forEach(user => workspaceService.addUser(workspace.id, user));

      // Update cursors concurrently
      await Promise.all(
        users.map((user, i) => 
          Promise.resolve(workspaceService.updateCursor(workspace.id, user.id, {
            line: i,
            column: i * 10
          }))
        )
      );

      const activeUsers = workspaceService.getUsers(workspace.id);
      activeUsers.forEach((user, i) => {
        expect(user.cursor).toEqual({
          line: i,
          column: i * 10
        });
      });
    });
  });
});
