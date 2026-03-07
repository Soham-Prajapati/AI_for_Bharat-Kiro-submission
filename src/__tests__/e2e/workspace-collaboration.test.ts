/**
 * E2E Tests for Collaborative Workspace Feature
 * 
 * Tests the complete workspace collaboration workflow:
 * 1. Create collaborative workspace
 * 2. Real-time multi-user editing
 * 3. Conflict resolution
 * 4. Version history
 * 5. Comments and suggestions
 * 
 * Feature #14 from FEATURES_MASTER.md
 */

import request from 'supertest';
import app from '../../index';
import { workspaceService } from '../../services/workspace.service';
import { cacheService } from '../../services/cache.service';
import { expectSuccessResponse, expectErrorResponse } from '../setup';

// Mock services
jest.mock('../../services/workspace.service');

describe('E2E: Workspace Collaboration', () => {
  const testUserId = 'user-123';
  const testUserId2 = 'user-456';
  
  const mockWorkspace = {
    id: 'workspace-123',
    name: 'Test Workspace',
    content: 'Initial content',
    version: 0,
    createdBy: testUserId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    collaborators: [testUserId],
    permissions: {
      [testUserId]: 'owner'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    cacheService.clear();

    // Setup default mocks
    (workspaceService.create as jest.Mock).mockResolvedValue(mockWorkspace);
    (workspaceService.get as jest.Mock).mockResolvedValue(mockWorkspace);
    (workspaceService.update as jest.Mock).mockResolvedValue({
      ...mockWorkspace,
      version: 1,
      content: 'Updated content'
    });
    (workspaceService.delete as jest.Mock).mockResolvedValue(true);
    (workspaceService.list as jest.Mock).mockResolvedValue([mockWorkspace]);
    (workspaceService.addCollaborator as jest.Mock).mockResolvedValue({
      ...mockWorkspace,
      collaborators: [testUserId, testUserId2]
    });
  });

  afterEach(() => {
    cacheService.clear();
  });

  describe('POST /api/workspace/create - Create Workspace', () => {
    describe('Successful Creation', () => {
      it('should create a new workspace', async () => {
        const response = await request(app)
          .post('/api/workspace/create')
          .send({
            name: 'My Workspace',
            userId: testUserId,
            initialContent: 'Hello World'
          })
          .expect(201);

        expectSuccessResponse(response, 201);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('workspace');
        expect(response.body.workspace).toHaveProperty('id');
        expect(response.body.workspace).toHaveProperty('name', 'My Workspace');
        expect(response.body.workspace).toHaveProperty('content', 'Hello World');
        expect(response.body.workspace).toHaveProperty('version', 0);
        expect(response.body.workspace).toHaveProperty('createdBy', testUserId);

        expect(workspaceService.create).toHaveBeenCalledWith({
          name: 'My Workspace',
          userId: testUserId,
          initialContent: 'Hello World'
        });
      });

      it('should create workspace with empty content', async () => {
        const response = await request(app)
          .post('/api/workspace/create')
          .send({
            name: 'Empty Workspace',
            userId: testUserId
          })
          .expect(201);

        expect(response.body.workspace.content).toBe('');
      });

      it('should set creator as owner', async () => {
        const response = await request(app)
          .post('/api/workspace/create')
          .send({
            name: 'Owner Test',
            userId: testUserId
          })
          .expect(201);

        expect(response.body.workspace.createdBy).toBe(testUserId);
        expect(response.body.workspace.permissions[testUserId]).toBe('owner');
      });

      it('should initialize version to 0', async () => {
        const response = await request(app)
          .post('/api/workspace/create')
          .send({
            name: 'Version Test',
            userId: testUserId
          })
          .expect(201);

        expect(response.body.workspace.version).toBe(0);
      });

      it('should include timestamps', async () => {
        const beforeCreate = new Date();
        
        const response = await request(app)
          .post('/api/workspace/create')
          .send({
            name: 'Timestamp Test',
            userId: testUserId
          })
          .expect(201);

        const afterCreate = new Date();
        const createdAt = new Date(response.body.workspace.createdAt);
        const updatedAt = new Date(response.body.workspace.updatedAt);

        expect(createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
        expect(createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
        expect(updatedAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      });
    });

    describe('Validation Errors', () => {
      it('should return 400 when name is missing', async () => {
        const response = await request(app)
          .post('/api/workspace/create')
          .send({
            userId: testUserId
          })
          .expect(400);

        expectErrorResponse(response, 400);
        expect(response.body.error).toContain('name');
      });

      it('should return 400 when userId is missing', async () => {
        const response = await request(app)
          .post('/api/workspace/create')
          .send({
            name: 'Test'
          })
          .expect(400);

        expectErrorResponse(response, 400);
        expect(response.body.error).toContain('userId');
      });

      it('should return 400 when name is empty', async () => {
        const response = await request(app)
          .post('/api/workspace/create')
          .send({
            name: '',
            userId: testUserId
          })
          .expect(400);

        expectErrorResponse(response, 400);
      });
    });
  });

  describe('GET /api/workspace/:id - Get Workspace', () => {
    describe('Successful Retrieval', () => {
      it('should retrieve workspace by ID', async () => {
        const response = await request(app)
          .get('/api/workspace/workspace-123')
          .query({ userId: testUserId })
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('workspace');
        expect(response.body.workspace.id).toBe('workspace-123');

        expect(workspaceService.get).toHaveBeenCalledWith('workspace-123');
      });

      it('should include all workspace details', async () => {
        const response = await request(app)
          .get('/api/workspace/workspace-123')
          .query({ userId: testUserId })
          .expect(200);

        const workspace = response.body.workspace;
        expect(workspace).toHaveProperty('id');
        expect(workspace).toHaveProperty('name');
        expect(workspace).toHaveProperty('content');
        expect(workspace).toHaveProperty('version');
        expect(workspace).toHaveProperty('createdBy');
        expect(workspace).toHaveProperty('collaborators');
        expect(workspace).toHaveProperty('permissions');
      });
    });

    describe('Access Control', () => {
      it('should allow owner to access workspace', async () => {
        const response = await request(app)
          .get('/api/workspace/workspace-123')
          .query({ userId: testUserId })
          .expect(200);

        expect(response.body.success).toBe(true);
      });

      it('should return 403 for unauthorized user', async () => {
        (workspaceService.get as jest.Mock).mockResolvedValue(mockWorkspace);

        const response = await request(app)
          .get('/api/workspace/workspace-123')
          .query({ userId: 'unauthorized-user' })
          .expect(403);

        expectErrorResponse(response, 403);
        expect(response.body.error).toContain('access denied');
      });

      it('should return 404 for non-existent workspace', async () => {
        (workspaceService.get as jest.Mock).mockResolvedValue(null);

        const response = await request(app)
          .get('/api/workspace/non-existent')
          .query({ userId: testUserId })
          .expect(404);

        expectErrorResponse(response, 404);
      });
    });
  });

  describe('PUT /api/workspace/:id - Update Workspace', () => {
    describe('Successful Updates', () => {
      it('should update workspace content', async () => {
        const response = await request(app)
          .put('/api/workspace/workspace-123')
          .send({
            userId: testUserId,
            content: 'Updated content',
            version: 0
          })
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.workspace.content).toBe('Updated content');
        expect(response.body.workspace.version).toBe(1);

        expect(workspaceService.update).toHaveBeenCalledWith(
          'workspace-123',
          expect.objectContaining({
            content: 'Updated content',
            version: 0
          })
        );
      });

      it('should increment version on update', async () => {
        const response = await request(app)
          .put('/api/workspace/workspace-123')
          .send({
            userId: testUserId,
            content: 'New content',
            version: 0
          })
          .expect(200);

        expect(response.body.workspace.version).toBe(1);
      });

      it('should update timestamp', async () => {
        const beforeUpdate = new Date();

        const response = await request(app)
          .put('/api/workspace/workspace-123')
          .send({
            userId: testUserId,
            content: 'Updated',
            version: 0
          })
          .expect(200);

        const afterUpdate = new Date();
        const updatedAt = new Date(response.body.workspace.updatedAt);

        expect(updatedAt.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
        expect(updatedAt.getTime()).toBeLessThanOrEqual(afterUpdate.getTime());
      });
    });

    describe('Conflict Resolution', () => {
      it('should detect version conflict', async () => {
        (workspaceService.update as jest.Mock).mockRejectedValue(
          new Error('Version conflict')
        );

        const response = await request(app)
          .put('/api/workspace/workspace-123')
          .send({
            userId: testUserId,
            content: 'Conflicting update',
            version: 0 // Outdated version
          })
          .expect(409);

        expectErrorResponse(response, 409);
        expect(response.body.error).toContain('conflict');
      });

      it('should provide current version on conflict', async () => {
        (workspaceService.update as jest.Mock).mockRejectedValue(
          new Error('Version conflict')
        );

        const response = await request(app)
          .put('/api/workspace/workspace-123')
          .send({
            userId: testUserId,
            content: 'Update',
            version: 0
          })
          .expect(409);

        expect(response.body).toHaveProperty('currentVersion');
      });

      it('should handle concurrent updates', async () => {
        const updates = [
          request(app).put('/api/workspace/workspace-123').send({
            userId: 'user-1',
            content: 'Update 1',
            version: 0
          }),
          request(app).put('/api/workspace/workspace-123').send({
            userId: 'user-2',
            content: 'Update 2',
            version: 0
          }),
          request(app).put('/api/workspace/workspace-123').send({
            userId: 'user-3',
            content: 'Update 3',
            version: 0
          })
        ];

        const responses = await Promise.all(updates);

        // At least one should succeed
        const successful = responses.filter(r => r.status === 200);
        expect(successful.length).toBeGreaterThan(0);

        // Others may have conflicts
        const conflicts = responses.filter(r => r.status === 409);
        expect(conflicts.length).toBeGreaterThanOrEqual(0);
      });
    });

    describe('Access Control', () => {
      it('should allow collaborator to update', async () => {
        const response = await request(app)
          .put('/api/workspace/workspace-123')
          .send({
            userId: testUserId,
            content: 'Update',
            version: 0
          })
          .expect(200);

        expect(response.body.success).toBe(true);
      });

      it('should deny update from non-collaborator', async () => {
        const response = await request(app)
          .put('/api/workspace/workspace-123')
          .send({
            userId: 'unauthorized-user',
            content: 'Unauthorized update',
            version: 0
          })
          .expect(403);

        expectErrorResponse(response, 403);
      });
    });
  });

  describe('POST /api/workspace/:id/collaborators - Add Collaborator', () => {
    describe('Successful Addition', () => {
      it('should add collaborator to workspace', async () => {
        const response = await request(app)
          .post('/api/workspace/workspace-123/collaborators')
          .send({
            userId: testUserId,
            collaboratorId: testUserId2,
            permission: 'editor'
          })
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.workspace.collaborators).toContain(testUserId2);

        expect(workspaceService.addCollaborator).toHaveBeenCalledWith(
          'workspace-123',
          testUserId2,
          'editor'
        );
      });

      it('should set collaborator permissions', async () => {
        const response = await request(app)
          .post('/api/workspace/workspace-123/collaborators')
          .send({
            userId: testUserId,
            collaboratorId: testUserId2,
            permission: 'viewer'
          })
          .expect(200);

        expect(response.body.workspace.permissions[testUserId2]).toBe('viewer');
      });

      it('should support different permission levels', async () => {
        const permissions = ['owner', 'editor', 'viewer'];

        for (const permission of permissions) {
          const response = await request(app)
            .post('/api/workspace/workspace-123/collaborators')
            .send({
              userId: testUserId,
              collaboratorId: `user-${permission}`,
              permission
            })
            .expect(200);

          expect(response.body.success).toBe(true);
        }
      });
    });

    describe('Validation Errors', () => {
      it('should return 400 when collaboratorId is missing', async () => {
        const response = await request(app)
          .post('/api/workspace/workspace-123/collaborators')
          .send({
            userId: testUserId,
            permission: 'editor'
          })
          .expect(400);

        expectErrorResponse(response, 400);
      });

      it('should return 400 for invalid permission level', async () => {
        const response = await request(app)
          .post('/api/workspace/workspace-123/collaborators')
          .send({
            userId: testUserId,
            collaboratorId: testUserId2,
            permission: 'invalid'
          })
          .expect(400);

        expectErrorResponse(response, 400);
      });

      it('should prevent adding same collaborator twice', async () => {
        (workspaceService.addCollaborator as jest.Mock).mockRejectedValue(
          new Error('Collaborator already exists')
        );

        const response = await request(app)
          .post('/api/workspace/workspace-123/collaborators')
          .send({
            userId: testUserId,
            collaboratorId: testUserId,
            permission: 'editor'
          })
          .expect(400);

        expectErrorResponse(response, 400);
      });
    });

    describe('Access Control', () => {
      it('should only allow owner to add collaborators', async () => {
        const response = await request(app)
          .post('/api/workspace/workspace-123/collaborators')
          .send({
            userId: 'non-owner',
            collaboratorId: testUserId2,
            permission: 'editor'
          })
          .expect(403);

        expectErrorResponse(response, 403);
      });
    });
  });

  describe('GET /api/workspace/:id/history - Version History', () => {
    it('should retrieve version history', async () => {
      const mockHistory = [
        { version: 2, content: 'Latest', updatedBy: testUserId, updatedAt: new Date().toISOString() },
        { version: 1, content: 'Middle', updatedBy: testUserId2, updatedAt: new Date().toISOString() },
        { version: 0, content: 'Initial', updatedBy: testUserId, updatedAt: new Date().toISOString() }
      ];

      (workspaceService.getHistory as jest.Mock).mockResolvedValue(mockHistory);

      const response = await request(app)
        .get('/api/workspace/workspace-123/history')
        .query({ userId: testUserId })
        .expect(200);

      expect(response.body).toHaveProperty('history');
      expect(Array.isArray(response.body.history)).toBe(true);
      expect(response.body.history.length).toBe(3);
      
      response.body.history.forEach((entry: any) => {
        expect(entry).toHaveProperty('version');
        expect(entry).toHaveProperty('content');
        expect(entry).toHaveProperty('updatedBy');
        expect(entry).toHaveProperty('updatedAt');
      });
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/workspace/workspace-123/history')
        .query({
          userId: testUserId,
          page: 1,
          limit: 10
        })
        .expect(200);

      expect(response.body).toHaveProperty('history');
      expect(response.body).toHaveProperty('pagination');
    });
  });

  describe('POST /api/workspace/:id/revert - Revert to Version', () => {
    it('should revert to previous version', async () => {
      (workspaceService.revertToVersion as jest.Mock).mockResolvedValue({
        ...mockWorkspace,
        version: 3,
        content: 'Reverted content'
      });

      const response = await request(app)
        .post('/api/workspace/workspace-123/revert')
        .send({
          userId: testUserId,
          targetVersion: 1
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.workspace.version).toBe(3); // New version created
      
      expect(workspaceService.revertToVersion).toHaveBeenCalledWith(
        'workspace-123',
        1
      );
    });
  });

  describe('POST /api/workspace/:id/comments - Add Comment', () => {
    it('should add comment to workspace', async () => {
      const response = await request(app)
        .post('/api/workspace/workspace-123/comments')
        .send({
          userId: testUserId,
          content: 'Great work!',
          position: { line: 5, column: 10 }
        })
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('comment');
      expect(response.body.comment.content).toBe('Great work!');
    });

    it('should support threaded comments', async () => {
      const response = await request(app)
        .post('/api/workspace/workspace-123/comments')
        .send({
          userId: testUserId,
          content: 'Reply to comment',
          parentCommentId: 'comment-123'
        })
        .expect(201);

      expect(response.body.comment.parentCommentId).toBe('comment-123');
    });
  });

  describe('Complete Collaboration Workflow', () => {
    it('should complete full collaboration cycle', async () => {
      // Step 1: Create workspace
      const createResponse = await request(app)
        .post('/api/workspace/create')
        .send({
          name: 'Collaboration Test',
          userId: testUserId,
          initialContent: 'Start'
        })
        .expect(201);

      const workspaceId = createResponse.body.workspace.id;

      // Step 2: Add collaborator
      await request(app)
        .post(`/api/workspace/${workspaceId}/collaborators`)
        .send({
          userId: testUserId,
          collaboratorId: testUserId2,
          permission: 'editor'
        })
        .expect(200);

      // Step 3: Collaborator updates content
      const updateResponse = await request(app)
        .put(`/api/workspace/${workspaceId}`)
        .send({
          userId: testUserId2,
          content: 'Updated by collaborator',
          version: 0
        })
        .expect(200);

      expect(updateResponse.body.workspace.version).toBe(1);

      // Step 4: Add comment
      await request(app)
        .post(`/api/workspace/${workspaceId}/comments`)
        .send({
          userId: testUserId,
          content: 'Looks good!'
        })
        .expect(201);

      // Step 5: View history
      const historyResponse = await request(app)
        .get(`/api/workspace/${workspaceId}/history`)
        .query({ userId: testUserId })
        .expect(200);

      expect(historyResponse.body.history).toBeDefined();
    });

    it('should handle real-time collaboration', async () => {
      const workspaceId = 'workspace-123';

      // Simulate multiple users editing simultaneously
      const edits = [
        { userId: 'user-1', content: 'Edit 1', version: 0 },
        { userId: 'user-2', content: 'Edit 2', version: 0 },
        { userId: 'user-3', content: 'Edit 3', version: 0 }
      ];

      const requests = edits.map(edit =>
        request(app)
          .put(`/api/workspace/${workspaceId}`)
          .send(edit)
      );

      const responses = await Promise.all(requests);

      // Verify conflict handling
      const successful = responses.filter(r => r.status === 200);
      const conflicts = responses.filter(r => r.status === 409);

      expect(successful.length + conflicts.length).toBe(3);
    });
  });

  describe('DELETE /api/workspace/:id - Delete Workspace', () => {
    it('should delete workspace', async () => {
      const response = await request(app)
        .delete('/api/workspace/workspace-123')
        .send({ userId: testUserId })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(workspaceService.delete).toHaveBeenCalledWith('workspace-123');
    });

    it('should only allow owner to delete', async () => {
      const response = await request(app)
        .delete('/api/workspace/workspace-123')
        .send({ userId: 'non-owner' })
        .expect(403);

      expectErrorResponse(response, 403);
    });
  });
});
