/**
 * Comprehensive Workspace Tests - Part 2
 * Concurrent editing, conflict resolution, version history, edge cases
 */

import { workspaceService } from '../services/workspace.service';
import type { User, Change } from '../services/workspace.service';
import { createMockUser, wait } from './setup';

describe('Workspace - Concurrent Editing & Conflicts', () => {
  let workspaceId: string;
  let users: User[];

  beforeEach(() => {
    const workspace = workspaceService.create('Test', 'Initial content');
    workspaceId = workspace.id;
    users = Array.from({ length: 10 }, (_, i) => 
      createMockUser({
        id: `user-${i}`,
        name: `User ${i}`,
        email: `user${i}@example.com`,
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      })
    );
  });

  afterEach(() => {
    if (workspaceId) workspaceService.delete(workspaceId);
  });

  describe('10 Concurrent Users', () => {
    test('should handle 10 users editing simultaneously without data loss', () => {
      users.forEach(user => workspaceService.addUser(workspaceId, user));
      
      const timestamp = Date.now();
      const changes: Change[] = users.map((user, index) => ({
        id: `change-${index}`,
        userId: user.id,
        timestamp: timestamp + index,
        operation: 'insert' as const,
        position: 0,
        content: `[${user.id}]`,
      }));
      
      changes.forEach(change => {
        const result = workspaceService.applyChange(workspaceId, change);
        expect(result.success).toBe(true);
      });
      
      const workspace = workspaceService.get(workspaceId);
      expect(workspace?.version).toBe(10);
      expect(workspace?.changes).toHaveLength(10);
      
      users.forEach(user => {
        expect(workspace?.content).toContain(`[${user.id}]`);
      });
    });

    test('should handle 10 users editing at different positions', () => {
      users.forEach(user => workspaceService.addUser(workspaceId, user));
      
      const workspace = workspaceService.get(workspaceId);
      if (workspace) workspace.content = '0123456789';
      
      const timestamp = Date.now();
      users.forEach((user, index) => {
        const change: Change = {
          id: `change-${index}`,
          userId: user.id,
          timestamp: timestamp + index,
          operation: 'insert',
          position: index,
          content: `[${index}]`,
        };
        
        workspaceService.applyChange(workspaceId, change);
      });
      
      const finalWorkspace = workspaceService.get(workspaceId);
      expect(finalWorkspace?.version).toBe(10);
      
      users.forEach((_, index) => {
        expect(finalWorkspace?.content).toContain(`[${index}]`);
      });
    });

    test('should maintain data integrity with rapid concurrent edits', () => {
      users.forEach(user => workspaceService.addUser(workspaceId, user));
      
      const editsPerUser = 5;
      const allChanges: Change[] = [];
      
      users.forEach((user, userIndex) => {
        for (let i = 0; i < editsPerUser; i++) {
          allChanges.push({
            id: `change-${userIndex}-${i}`,
            userId: user.id,
            timestamp: Date.now() + userIndex * 10 + i,
            operation: 'insert',
            position: userIndex * 2,
            content: `${userIndex}`,
          });
        }
      });
      
      allChanges.forEach(change => {
        workspaceService.applyChange(workspaceId, change);
      });
      
      const workspace = workspaceService.get(workspaceId);
      expect(workspace?.version).toBe(50);
      expect(workspace?.changes).toHaveLength(50);
      
      users.forEach((_, index) => {
        expect(workspace?.content).toContain(`${index}`);
      });
    });
  });

  describe('Conflict Resolution', () => {
    test('should resolve conflicts when two users insert at same position', () => {
      const workspace = workspaceService.get(workspaceId);
      if (workspace) workspace.content = 'Hello World';
      
      const timestamp = Date.now();
      
      const change1: Change = {
        id: 'change-1',
        userId: users[0].id,
        timestamp: timestamp,
        operation: 'insert',
        position: 6,
        content: 'Beautiful ',
      };
      
      const change2: Change = {
        id: 'change-2',
        userId: users[1].id,
        timestamp: timestamp + 1,
        operation: 'insert',
        position: 6,
        content: 'Amazing ',
      };
      
      workspaceService.applyChange(workspaceId, change1);
      const result2 = workspaceService.applyChange(workspaceId, change2);
      
      expect(result2.success).toBe(true);
      expect(result2.transformedChange).toBeDefined();
      
      const finalWorkspace = workspaceService.get(workspaceId);
      expect(finalWorkspace?.content).toContain('Beautiful');
      expect(finalWorkspace?.content).toContain('Amazing');
    });

    test('should transform insert after earlier insert', () => {
      const workspace = workspaceService.get(workspaceId);
      if (workspace) workspace.content = 'ABC';
      
      const timestamp = Date.now();
      
      const change1: Change = {
        id: 'change-1',
        userId: users[0].id,
        timestamp: timestamp,
        operation: 'insert',
        position: 1,
        content: 'X',
      };
      
      const change2: Change = {
        id: 'change-2',
        userId: users[1].id,
        timestamp: timestamp + 1,
        operation: 'insert',
        position: 2,
        content: 'Y',
      };
      
      workspaceService.applyChange(workspaceId, change1);
      const result2 = workspaceService.applyChange(workspaceId, change2);
      
      expect(result2.success).toBe(true);
      
      const finalWorkspace = workspaceService.get(workspaceId);
      expect(finalWorkspace?.content).toContain('X');
      expect(finalWorkspace?.content).toContain('Y');
    });

    test('should handle multiple concurrent conflicts', () => {
      const workspace = workspaceService.get(workspaceId);
      if (workspace) workspace.content = 'Start';
      
      const timestamp = Date.now();
      
      const changes: Change[] = users.slice(0, 5).map((user, index) => ({
        id: `change-${index}`,
        userId: user.id,
        timestamp: timestamp + index,
        operation: 'insert' as const,
        position: 5,
        content: ` ${index}`,
      }));
      
      changes.forEach(change => {
        const result = workspaceService.applyChange(workspaceId, change);
        expect(result.success).toBe(true);
      });
      
      const finalWorkspace = workspaceService.get(workspaceId);
      
      for (let i = 0; i < 5; i++) {
        expect(finalWorkspace?.content).toContain(`${i}`);
      }
    });
  });

  describe('Version History', () => {
    test('should track all changes in history', () => {
      const changes: Change[] = [
        {
          id: 'change-1',
          userId: users[0].id,
          timestamp: Date.now(),
          operation: 'insert',
          position: 0,
          content: 'First ',
        },
        {
          id: 'change-2',
          userId: users[1].id,
          timestamp: Date.now() + 1,
          operation: 'insert',
          position: 6,
          content: 'Second ',
        },
        {
          id: 'change-3',
          userId: users[2].id,
          timestamp: Date.now() + 2,
          operation: 'insert',
          position: 13,
          content: 'Third',
        },
      ];
      
      changes.forEach(change => {
        workspaceService.applyChange(workspaceId, change);
      });
      
      const workspace = workspaceService.get(workspaceId);
      
      expect(workspace?.changes).toHaveLength(3);
      expect(workspace?.changes[0].id).toBe('change-1');
      expect(workspace?.changes[1].id).toBe('change-2');
      expect(workspace?.changes[2].id).toBe('change-3');
    });

    test('should track changes from multiple users', () => {
      users.slice(0, 5).forEach((user, index) => {
        const change: Change = {
          id: `change-${index}`,
          userId: user.id,
          timestamp: Date.now() + index,
          operation: 'insert',
          position: index * 2,
          content: `User${index}`,
        };
        
        workspaceService.applyChange(workspaceId, change);
      });
      
      const workspace = workspaceService.get(workspaceId);
      
      expect(workspace?.changes).toHaveLength(5);
      
      users.slice(0, 5).forEach((user, index) => {
        const userChange = workspace?.changes.find(c => c.userId === user.id);
        expect(userChange).toBeDefined();
        expect(userChange?.content).toBe(`User${index}`);
      });
    });
  });

  describe('WebSocket Real-time Sync Simulation', () => {
    test('should simulate real-time sync with delayed updates', async () => {
      users.slice(0, 3).forEach(user => {
        workspaceService.addUser(workspaceId, user);
      });
      
      const change1: Change = {
        id: 'change-1',
        userId: users[0].id,
        timestamp: Date.now(),
        operation: 'insert',
        position: 0,
        content: 'User1 ',
      };
      
      workspaceService.applyChange(workspaceId, change1);
      await wait(50);
      
      const change2: Change = {
        id: 'change-2',
        userId: users[1].id,
        timestamp: Date.now(),
        operation: 'insert',
        position: 0,
        content: 'User2 ',
      };
      
      workspaceService.applyChange(workspaceId, change2);
      await wait(50);
      
      const change3: Change = {
        id: 'change-3',
        userId: users[2].id,
        timestamp: Date.now(),
        operation: 'insert',
        position: 0,
        content: 'User3 ',
      };
      
      workspaceService.applyChange(workspaceId, change3);
      
      const workspace = workspaceService.get(workspaceId);
      
      expect(workspace?.version).toBe(3);
      expect(workspace?.content).toContain('User1');
      expect(workspace?.content).toContain('User2');
      expect(workspace?.content).toContain('User3');
    });

    test('should broadcast cursor updates to all users', () => {
      users.slice(0, 5).forEach(user => {
        workspaceService.addUser(workspaceId, user);
      });
      
      users.slice(0, 5).forEach((user, index) => {
        workspaceService.updateCursor(workspaceId, user.id, {
          line: index + 1,
          column: (index + 1) * 5,
        });
      });
      
      const workspaceUsers = workspaceService.getUsers(workspaceId);
      
      expect(workspaceUsers).toHaveLength(5);
      
      workspaceUsers.forEach((user, index) => {
        expect(user.cursor).toEqual({
          line: index + 1,
          column: (index + 1) * 5,
        });
      });
    });
  });

  describe('Data Integrity', () => {
    test('should maintain content integrity after 100 operations', () => {
      const workspace = workspaceService.get(workspaceId);
      if (workspace) workspace.content = '';
      
      for (let i = 0; i < 100; i++) {
        const change: Change = {
          id: `change-${i}`,
          userId: users[i % 10].id,
          timestamp: Date.now() + i,
          operation: 'insert',
          position: i,
          content: `${i % 10}`,
        };
        
        const result = workspaceService.applyChange(workspaceId, change);
        expect(result.success).toBe(true);
      }
      
      const finalWorkspace = workspaceService.get(workspaceId);
      
      expect(finalWorkspace?.version).toBe(100);
      expect(finalWorkspace?.changes).toHaveLength(100);
      expect(finalWorkspace?.content.length).toBe(100);
    });

    test('should handle special characters and unicode', () => {
      const workspace = workspaceService.get(workspaceId);
      if (workspace) workspace.content = '';
      
      const specialContent = '🚀 Hello 世界 ñ é ü';
      
      const change: Change = {
        id: 'change-1',
        userId: users[0].id,
        timestamp: Date.now(),
        operation: 'insert',
        position: 0,
        content: specialContent,
      };
      
      const result = workspaceService.applyChange(workspaceId, change);
      
      expect(result.success).toBe(true);
      
      const finalWorkspace = workspaceService.get(workspaceId);
      expect(finalWorkspace?.content).toBe(specialContent);
    });
  });

  describe('Edge Cases', () => {
    test('should handle operations on non-existent workspace', () => {
      const result = workspaceService.applyChange('non-existent-id', {
        id: 'change-1',
        userId: users[0].id,
        timestamp: Date.now(),
        operation: 'insert',
        position: 0,
        content: 'Test',
      });
      
      expect(result.success).toBe(false);
    });

    test('should handle simultaneous edits at same position by all 10 users', () => {
      const workspace = workspaceService.get(workspaceId);
      if (workspace) workspace.content = 'X';
      
      const timestamp = Date.now();
      
      users.forEach((user, index) => {
        const change: Change = {
          id: `change-${index}`,
          userId: user.id,
          timestamp: timestamp + index,
          operation: 'insert',
          position: 1,
          content: `[${index}]`,
        };
        
        const result = workspaceService.applyChange(workspaceId, change);
        expect(result.success).toBe(true);
      });
      
      const finalWorkspace = workspaceService.get(workspaceId);
      
      users.forEach((_, index) => {
        expect(finalWorkspace?.content).toContain(`[${index}]`);
      });
      
      expect(finalWorkspace?.version).toBe(10);
    });

    test('should handle network failure simulation (missing changes)', () => {
      const workspace = workspaceService.get(workspaceId);
      if (workspace) workspace.content = 'Start';
      
      const timestamp = Date.now();
      
      const changes = [1, 2, 4, 5].map(i => ({
        id: `change-${i}`,
        userId: users[i % 10].id,
        timestamp: timestamp + i * 10,
        operation: 'insert' as const,
        position: 5,
        content: ` ${i}`,
      }));
      
      changes.forEach(change => {
        const result = workspaceService.applyChange(workspaceId, change);
        expect(result.success).toBe(true);
      });
      
      const finalWorkspace = workspaceService.get(workspaceId);
      
      expect(finalWorkspace?.version).toBe(4);
      expect(finalWorkspace?.content).toContain('1');
      expect(finalWorkspace?.content).toContain('2');
      expect(finalWorkspace?.content).not.toContain('3');
      expect(finalWorkspace?.content).toContain('4');
      expect(finalWorkspace?.content).toContain('5');
    });

    test('should handle very large content', () => {
      const workspace = workspaceService.get(workspaceId);
      if (workspace) workspace.content = '';
      
      const largeContent = 'A'.repeat(10000);
      
      const change: Change = {
        id: 'change-1',
        userId: users[0].id,
        timestamp: Date.now(),
        operation: 'insert',
        position: 0,
        content: largeContent,
      };
      
      const result = workspaceService.applyChange(workspaceId, change);
      
      expect(result.success).toBe(true);
      
      const finalWorkspace = workspaceService.get(workspaceId);
      expect(finalWorkspace?.content.length).toBe(10000);
    });
  });

  describe('Performance Tests', () => {
    test('should handle 1000 sequential operations efficiently', () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        const change: Change = {
          id: `change-${i}`,
          userId: users[i % 10].id,
          timestamp: Date.now() + i,
          operation: 'insert',
          position: 0,
          content: `${i % 10}`,
        };
        
        workspaceService.applyChange(workspaceId, change);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      const workspace = workspaceService.get(workspaceId);
      
      expect(workspace?.version).toBe(1000);
      expect(duration).toBeLessThan(5000);
    });

    test('should handle all 10 users making 10 edits each', () => {
      users.forEach(user => workspaceService.addUser(workspaceId, user));
      
      const timestamp = Date.now();
      let changeCount = 0;
      
      users.forEach((user, userIndex) => {
        for (let i = 0; i < 10; i++) {
          const change: Change = {
            id: `change-${userIndex}-${i}`,
            userId: user.id,
            timestamp: timestamp + changeCount,
            operation: 'insert',
            position: changeCount,
            content: `${userIndex}`,
          };
          
          workspaceService.applyChange(workspaceId, change);
          changeCount++;
        }
      });
      
      const workspace = workspaceService.get(workspaceId);
      
      expect(workspace?.version).toBe(100);
      expect(workspace?.changes).toHaveLength(100);
      
      users.forEach(user => {
        const userChanges = workspace?.changes.filter(c => c.userId === user.id);
        expect(userChanges?.length).toBe(10);
      });
    });
  });
});
