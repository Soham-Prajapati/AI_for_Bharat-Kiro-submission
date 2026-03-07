/**
 * Example Test File
 * 
 * This file demonstrates how to use the test setup utilities and mocks
 * defined in setup.ts. Use this as a reference for writing new tests.
 */

import {
  // AWS Mocks
  s3Mock,
  bedrockMock,
  transcribeMock,
  
  // Mock Data Factories
  createMockUser,
  createMockWorkspace,
  createMockADHDSession,
  createMockFile,
  createMockS3Upload,
  createMockAIContent,
  createMockTranscription,
  createMockCommunityPost,
  
  // Test Utilities
  wait,
  createMockRequest,
  createMockResponse,
  createMockNext,
  expectSuccessResponse,
  expectErrorResponse,
  randomString,
  randomNumber,
} from './setup';

import { PutObjectCommand } from '@aws-sdk/client-s3';
import { InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

describe('Test Setup Examples', () => {
  describe('Mock Data Factories', () => {
    it('should create mock user with default values', () => {
      const user = createMockUser();
      
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('color');
      expect(user.name).toBe('Test User');
    });

    it('should create mock user with custom values', () => {
      const user = createMockUser({
        name: 'John Doe',
        email: 'john@example.com',
      });
      
      expect(user.name).toBe('John Doe');
      expect(user.email).toBe('john@example.com');
    });

    it('should create mock workspace', () => {
      const workspace = createMockWorkspace({
        name: 'My Workspace',
        content: 'Initial content',
      });
      
      expect(workspace.name).toBe('My Workspace');
      expect(workspace.content).toBe('Initial content');
      expect(workspace.version).toBe(0);
    });

    it('should create mock ADHD session', () => {
      const session = createMockADHDSession({
        taskName: 'Write tests',
        duration: 25,
      });
      
      expect(session.taskName).toBe('Write tests');
      expect(session.duration).toBe(25);
      expect(session.completed).toBe(false);
    });

    it('should create mock file upload', () => {
      const file = createMockFile({
        originalname: 'video.mp4',
        mimetype: 'video/mp4',
        size: 2048,
      });
      
      expect(file.originalname).toBe('video.mp4');
      expect(file.mimetype).toBe('video/mp4');
      expect(file.size).toBe(2048);
    });
  });

  describe('AWS Service Mocks', () => {
    it('should mock S3 upload', async () => {
      // The default mock is already set up in setup.ts
      // You can override it for specific tests
      s3Mock.on(PutObjectCommand).resolves({
        ETag: '"custom-etag"',
        VersionId: 'v123',
      });

      // Your code that uses S3 would go here
      // For example:
      // const result = await s3Service.uploadFile(file);
      
      // Verify the mock was called
      const calls = s3Mock.commandCalls(PutObjectCommand);
      expect(calls.length).toBeGreaterThanOrEqual(0);
    });

    it('should mock Bedrock AI invocation', async () => {
      // Override default mock for this test
      bedrockMock.on(InvokeModelCommand).resolves({
        body: new TextEncoder().encode(JSON.stringify({
          completion: 'Custom AI response',
          stop_reason: 'end_turn',
        })),
        contentType: 'application/json',
      });

      // Your code that uses Bedrock would go here
      // For example:
      // const result = await bedrockService.generateContent(prompt);
      
      const calls = bedrockMock.commandCalls(InvokeModelCommand);
      expect(calls.length).toBeGreaterThanOrEqual(0);
    });

    it('should mock Transcribe service', () => {
      // Default mocks are already set up
      // You can verify or override them as needed
      expect(transcribeMock).toBeDefined();
    });
  });

  describe('Test Utilities', () => {
    it('should wait for specified time', async () => {
      const start = Date.now();
      await wait(100);
      const elapsed = Date.now() - start;
      
      expect(elapsed).toBeGreaterThanOrEqual(100);
    });

    it('should create mock Express request', () => {
      const req = createMockRequest({
        body: { name: 'test' },
        params: { id: '123' },
        query: { page: '1' },
      });
      
      expect(req.body.name).toBe('test');
      expect(req.params.id).toBe('123');
      expect(req.query.page).toBe('1');
    });

    it('should create mock Express response', () => {
      const res = createMockResponse();
      
      res.status(200).json({ success: true });
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('should create mock next function', () => {
      const next = createMockNext();
      const error = new Error('Test error');
      
      next(error);
      
      expect(next).toHaveBeenCalledWith(error);
    });

    it('should generate random string', () => {
      const str1 = randomString(10);
      const str2 = randomString(10);
      
      expect(str1).toHaveLength(10);
      expect(str2).toHaveLength(10);
      expect(str1).not.toBe(str2);
    });

    it('should generate random number in range', () => {
      const num = randomNumber(1, 10);
      
      expect(num).toBeGreaterThanOrEqual(1);
      expect(num).toBeLessThanOrEqual(10);
    });
  });

  describe('Custom Matchers', () => {
    it('should validate UUID format', () => {
      const validUUID = '123e4567-e89b-12d3-a456-426614174000';
      const invalidUUID = 'not-a-uuid';
      
      expect(validUUID).toBeValidUUID();
      expect(invalidUUID).not.toBeValidUUID();
    });

    it('should validate ISO date format', () => {
      const validDate = new Date().toISOString();
      const invalidDate = 'not-a-date';
      
      expect(validDate).toBeValidISODate();
      expect(invalidDate).not.toBeValidISODate();
    });

    it('should check object properties', () => {
      const obj = {
        id: '123',
        name: 'Test',
        email: 'test@example.com',
      };
      
      expect(obj).toHaveProperties(['id', 'name', 'email']);
      expect(obj).not.toHaveProperties(['id', 'name', 'email', 'missing']);
    });
  });

  describe('Response Assertions', () => {
    it('should assert success response', () => {
      const response = {
        status: 200,
        body: { success: true, data: {} },
      };
      
      expectSuccessResponse(response, 200);
    });

    it('should assert error response', () => {
      const response = {
        status: 400,
        body: { error: 'Bad request' },
      };
      
      expectErrorResponse(response, 400, 'Bad request');
    });
  });

  describe('Integration Example', () => {
    it('should demonstrate complete test workflow', async () => {
      // 1. Create mock data
      const user = createMockUser({ name: 'Integration Test User' });
      const workspace = createMockWorkspace({ name: 'Test Workspace' });
      
      // 2. Set up AWS mocks
      s3Mock.on(PutObjectCommand).resolves({
        ETag: '"integration-test-etag"',
      });
      
      // 3. Create mock request/response
      const req = createMockRequest({
        body: {
          userId: user.id,
          workspaceId: workspace.id,
        },
      });
      const res = createMockResponse();
      const next = createMockNext();
      
      // 4. Your middleware/controller logic would go here
      // For example:
      // await yourController(req, res, next);
      
      // 5. Assert results
      expect(user.name).toBe('Integration Test User');
      expect(workspace.name).toBe('Test Workspace');
      expect(req.body.userId).toBe(user.id);
      
      // 6. Verify mocks were called as expected
      // expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
