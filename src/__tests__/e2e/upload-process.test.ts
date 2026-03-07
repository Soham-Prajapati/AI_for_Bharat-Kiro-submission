/**
 * E2E Tests for Content Intelligence Platform Upload & Process Flow
 * 
 * Tests the complete workflow:
 * 1. Upload file to S3 via POST /api/upload
 * 2. Start processing via POST /api/process
 * 3. Check status via GET /api/process/:jobId
 * 
 * Mocks AWS services (S3, Transcribe) appropriately
 */

import request from 'supertest';
import express from 'express';
import uploadRoute from '../../routes/upload.route';
import processRoute from '../../routes/process.route';
import { S3Service } from '../../services/s3.service';
import { transcribeService } from '../../services/transcription.service';
import { errorHandler } from '../../middleware/error.middleware';
import { createMockFile, expectSuccessResponse, expectErrorResponse } from '../setup';

// Mock AWS services
jest.mock('../../services/s3.service');
jest.mock('../../services/transcription.service');

describe('E2E: Upload & Process Flow', () => {
  let app: express.Application;
  let mockS3Service: jest.Mocked<S3Service>;
  let mockTranscribeService: jest.Mocked<typeof transcribeService>;

  beforeEach(() => {
    // Create fresh Express app for each test
    app = express();
    app.use(express.json());
    app.use('/api/upload', uploadRoute);
    app.use('/api/process', processRoute);
    app.use(errorHandler);

    // Reset all mocks
    jest.clearAllMocks();

    // Get mocked instances
    mockS3Service = S3Service.prototype as jest.Mocked<S3Service>;
    mockTranscribeService = transcribeService as jest.Mocked<typeof transcribeService>;

    // Setup default mock implementations
    mockS3Service.upload = jest.fn().mockResolvedValue({
      key: 'test-user/1234567890-test-video.mp4',
      bucket: 'test-bucket',
      url: 'https://test-bucket.s3.amazonaws.com/test-user/1234567890-test-video.mp4',
      size: 1024,
    });

    mockS3Service.getPresignedUrl = jest.fn().mockResolvedValue(
      's3://test-bucket/test-user/1234567890-test-video.mp4'
    );

    mockTranscribeService.startTranscription = jest.fn().mockResolvedValue('transcribe-1234567890');

    mockTranscribeService.getTranscriptionStatus = jest.fn().mockResolvedValue({
      status: 'COMPLETED',
      transcript: 'https://test-bucket.s3.amazonaws.com/transcripts/transcribe-1234567890.json',
    });
  });

  describe('Complete Upload & Process Workflow', () => {
    it('should successfully complete full upload-process-status workflow', async () => {
      // Step 1: Upload file
      const testFile = createMockFile({
        originalname: 'test-video.mp4',
        mimetype: 'video/mp4',
        size: 1024,
        buffer: Buffer.from('mock video content'),
      });

      const uploadResponse = await request(app)
        .post('/api/upload')
        .attach('file', testFile.buffer, testFile.originalname)
        .field('userId', 'test-user-123')
        .expect(200);

      expectSuccessResponse(uploadResponse, 200);
      expect(uploadResponse.body).toHaveProperty('fileId');
      expect(uploadResponse.body).toHaveProperty('fileName', 'test-video.mp4');
      expect(uploadResponse.body).toHaveProperty('userId', 'test-user-123');
      expect(uploadResponse.body).toHaveProperty('url');
      expect(uploadResponse.body).toHaveProperty('uploadedAt');

      const { fileId } = uploadResponse.body;

      // Verify S3 upload was called
      expect(mockS3Service.upload).toHaveBeenCalledWith(
        expect.any(Buffer),
        expect.stringContaining('test-video.mp4'),
        'video/mp4'
      );

      // Step 2: Start processing
      const processResponse = await request(app)
        .post('/api/process')
        .send({ fileId, contentType: 'video' })
        .expect(200);

      expectSuccessResponse(processResponse, 200);
      expect(processResponse.body).toHaveProperty('jobId');
      expect(processResponse.body).toHaveProperty('fileId', fileId);
      expect(processResponse.body).toHaveProperty('status', 'processing');
      expect(processResponse.body).toHaveProperty('startedAt');

      const { jobId } = processResponse.body;

      // Verify presigned URL and transcription were called
      expect(mockS3Service.getPresignedUrl).toHaveBeenCalledWith(fileId);
      expect(mockTranscribeService.startTranscription).toHaveBeenCalled();

      // Step 3: Check processing status
      const statusResponse = await request(app)
        .get(`/api/process/${jobId}`)
        .expect(200);

      expect(statusResponse.body).toHaveProperty('jobId', jobId);
      expect(statusResponse.body).toHaveProperty('status', 'COMPLETED');
      expect(statusResponse.body).toHaveProperty('transcript');
      expect(statusResponse.body).toHaveProperty('completedAt');

      // Verify status check was called
      expect(mockTranscribeService.getTranscriptionStatus).toHaveBeenCalledWith(jobId);
    });

    it('should handle multiple concurrent uploads', async () => {
      const uploads = await Promise.all([
        request(app)
          .post('/api/upload')
          .attach('file', Buffer.from('video1'), 'video1.mp4')
          .field('userId', 'user-1'),
        request(app)
          .post('/api/upload')
          .attach('file', Buffer.from('video2'), 'video2.mp4')
          .field('userId', 'user-2'),
        request(app)
          .post('/api/upload')
          .attach('file', Buffer.from('video3'), 'video3.mp4')
          .field('userId', 'user-3'),
      ]);

      uploads.forEach((response, index) => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.fileName).toBe(`video${index + 1}.mp4`);
        expect(response.body.userId).toBe(`user-${index + 1}`);
      });

      expect(mockS3Service.upload).toHaveBeenCalledTimes(3);
    });

    it('should handle processing status polling', async () => {
      // Upload file
      const uploadResponse = await request(app)
        .post('/api/upload')
        .attach('file', Buffer.from('test video'), 'test.mp4')
        .field('userId', 'test-user')
        .expect(200);

      const { fileId } = uploadResponse.body;

      // Start processing
      const processResponse = await request(app)
        .post('/api/process')
        .send({ fileId })
        .expect(200);

      const { jobId } = processResponse.body;

      // Mock different status responses
      mockTranscribeService.getTranscriptionStatus
        .mockResolvedValueOnce({ status: 'IN_PROGRESS', transcript: null })
        .mockResolvedValueOnce({ status: 'IN_PROGRESS', transcript: null })
        .mockResolvedValueOnce({
          status: 'COMPLETED',
          transcript: 'https://test-bucket.s3.amazonaws.com/transcripts/job.json',
        });

      // Poll status multiple times
      const status1 = await request(app).get(`/api/process/${jobId}`).expect(200);
      expect(status1.body.status).toBe('IN_PROGRESS');

      const status2 = await request(app).get(`/api/process/${jobId}`).expect(200);
      expect(status2.body.status).toBe('IN_PROGRESS');

      const status3 = await request(app).get(`/api/process/${jobId}`).expect(200);
      expect(status3.body.status).toBe('COMPLETED');
      expect(status3.body.transcript).toBeDefined();

      expect(mockTranscribeService.getTranscriptionStatus).toHaveBeenCalledTimes(3);
    });
  });

  describe('POST /api/upload - File Upload', () => {
    describe('Successful Uploads', () => {
      it('should upload video file successfully', async () => {
        const response = await request(app)
          .post('/api/upload')
          .attach('file', Buffer.from('video content'), 'video.mp4')
          .field('userId', 'user-123')
          .expect(200);

        expectSuccessResponse(response, 200);
        expect(response.body).toMatchObject({
          success: true,
          fileName: 'video.mp4',
          mimeType: 'video/mp4',
          userId: 'user-123',
        });
        expect(response.body.fileId).toBeDefined();
        expect(response.body.url).toBeDefined();
        expect(response.body.uploadedAt).toBeDefined();
      });

      it('should upload audio file successfully', async () => {
        const response = await request(app)
          .post('/api/upload')
          .attach('file', Buffer.from('audio content'), 'audio.mp3')
          .field('userId', 'user-456')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.fileName).toBe('audio.mp3');
        expect(response.body.mimeType).toBe('audio/mpeg');
      });

      it('should use anonymous userId when not provided', async () => {
        const response = await request(app)
          .post('/api/upload')
          .attach('file', Buffer.from('content'), 'file.mp4')
          .expect(200);

        expect(response.body.userId).toBe('anonymous');
      });

      it('should handle large file uploads', async () => {
        const largeBuffer = Buffer.alloc(50 * 1024 * 1024); // 50MB
        
        const response = await request(app)
          .post('/api/upload')
          .attach('file', largeBuffer, 'large-video.mp4')
          .field('userId', 'user-large')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.size).toBe(largeBuffer.length);
      });

      it('should handle special characters in filename', async () => {
        const response = await request(app)
          .post('/api/upload')
          .attach('file', Buffer.from('content'), 'test file (1) [final].mp4')
          .field('userId', 'user-special')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.fileName).toBe('test file (1) [final].mp4');
      });

      it('should include correct timestamp in response', async () => {
        const beforeUpload = new Date();
        
        const response = await request(app)
          .post('/api/upload')
          .attach('file', Buffer.from('content'), 'test.mp4')
          .expect(200);

        const afterUpload = new Date();
        const uploadedAt = new Date(response.body.uploadedAt);

        expect(uploadedAt.getTime()).toBeGreaterThanOrEqual(beforeUpload.getTime());
        expect(uploadedAt.getTime()).toBeLessThanOrEqual(afterUpload.getTime());
      });
    });

    describe('Upload Validation Errors', () => {
      it('should return 400 when no file is provided', async () => {
        const response = await request(app)
          .post('/api/upload')
          .field('userId', 'user-123')
          .expect(400);

        expect(response.body.error).toContain('No file uploaded');
      });

      it('should handle file size limit exceeded', async () => {
        const hugeBuffer = Buffer.alloc(150 * 1024 * 1024); // 150MB (over 100MB limit)
        
        const response = await request(app)
          .post('/api/upload')
          .attach('file', hugeBuffer, 'huge-file.mp4')
          .expect(400);

        expect(response.body.error).toBeDefined();
      });

      it('should handle empty file', async () => {
        const response = await request(app)
          .post('/api/upload')
          .attach('file', Buffer.alloc(0), 'empty.mp4')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.size).toBe(0);
      });
    });

    describe('Upload AWS Errors', () => {
      it('should handle S3 upload failure', async () => {
        mockS3Service.upload = jest.fn().mockRejectedValue(
          new Error('S3 service unavailable')
        );

        const response = await request(app)
          .post('/api/upload')
          .attach('file', Buffer.from('content'), 'test.mp4')
          .expect(502);

        expect(response.body.error).toContain('AWS S3 error');
      });

      it('should handle S3 access denied', async () => {
        const accessError = new Error('Access Denied');
        (accessError as any).code = 'AccessDenied';
        mockS3Service.upload = jest.fn().mockRejectedValue(accessError);

        const response = await request(app)
          .post('/api/upload')
          .attach('file', Buffer.from('content'), 'test.mp4')
          .expect(502);

        expect(response.body.error).toBeDefined();
      });

      it('should handle S3 throttling', async () => {
        const throttleError = new Error('Throttling');
        (throttleError as any).code = 'ThrottlingException';
        mockS3Service.upload = jest.fn().mockRejectedValue(throttleError);

        const response = await request(app)
          .post('/api/upload')
          .attach('file', Buffer.from('content'), 'test.mp4')
          .expect(502);

        expect(response.body.error).toBeDefined();
      });
    });
  });

  describe('POST /api/process - Start Processing', () => {
    describe('Successful Processing', () => {
      it('should start processing with valid fileId', async () => {
        const response = await request(app)
          .post('/api/process')
          .send({ fileId: 'user-123/1234567890-video.mp4' })
          .expect(200);

        expectSuccessResponse(response, 200);
        expect(response.body).toMatchObject({
          success: true,
          fileId: 'user-123/1234567890-video.mp4',
          status: 'processing',
        });
        expect(response.body.jobId).toBeDefined();
        expect(response.body.startedAt).toBeDefined();
      });

      it('should start processing with contentType', async () => {
        const response = await request(app)
          .post('/api/process')
          .send({
            fileId: 'user-123/video.mp4',
            contentType: 'video',
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(mockS3Service.getPresignedUrl).toHaveBeenCalled();
        expect(mockTranscribeService.startTranscription).toHaveBeenCalled();
      });

      it('should generate unique jobId for each request', async () => {
        const response1 = await request(app)
          .post('/api/process')
          .send({ fileId: 'file1.mp4' })
          .expect(200);

        const response2 = await request(app)
          .post('/api/process')
          .send({ fileId: 'file2.mp4' })
          .expect(200);

        expect(response1.body.jobId).not.toBe(response2.body.jobId);
      });

      it('should include timestamp in jobId', async () => {
        const response = await request(app)
          .post('/api/process')
          .send({ fileId: 'test.mp4' })
          .expect(200);

        expect(response.body.jobId).toMatch(/^transcribe-\d+$/);
      });
    });

    describe('Processing Validation Errors', () => {
      it('should return 400 when fileId is missing', async () => {
        const response = await request(app)
          .post('/api/process')
          .send({})
          .expect(400);

        expect(response.body.error).toContain('fileId required');
      });

      it('should return 400 when fileId is empty string', async () => {
        const response = await request(app)
          .post('/api/process')
          .send({ fileId: '' })
          .expect(400);

        expect(response.body.error).toContain('fileId required');
      });

      it('should return 400 when fileId is null', async () => {
        const response = await request(app)
          .post('/api/process')
          .send({ fileId: null })
          .expect(400);

        expect(response.body.error).toContain('fileId required');
      });
    });

    describe('Processing AWS Errors', () => {
      it('should handle S3 presigned URL generation failure', async () => {
        mockS3Service.getPresignedUrl = jest.fn().mockRejectedValue(
          new Error('Failed to generate URL')
        );

        const response = await request(app)
          .post('/api/process')
          .send({ fileId: 'test.mp4' })
          .expect(502);

        expect(response.body.error).toContain('AWS');
      });

      it('should handle file not found in S3', async () => {
        const notFoundError = new Error('NoSuchKey');
        (notFoundError as any).code = 'NoSuchKey';
        mockS3Service.getPresignedUrl = jest.fn().mockRejectedValue(notFoundError);

        const response = await request(app)
          .post('/api/process')
          .send({ fileId: 'nonexistent.mp4' })
          .expect(502);

        expect(response.body.error).toBeDefined();
      });

      it('should handle Transcribe service failure', async () => {
        mockTranscribeService.startTranscription = jest.fn().mockRejectedValue(
          new Error('Transcribe service unavailable')
        );

        const response = await request(app)
          .post('/api/process')
          .send({ fileId: 'test.mp4' })
          .expect(502);

        expect(response.body.error).toContain('AWS Transcribe error');
      });

      it('should handle Transcribe job already exists', async () => {
        const conflictError = new Error('Job already exists');
        (conflictError as any).name = 'ConflictException';
        mockTranscribeService.startTranscription = jest.fn().mockRejectedValue(conflictError);

        const response = await request(app)
          .post('/api/process')
          .send({ fileId: 'test.mp4' })
          .expect(502);

        expect(response.body.error).toBeDefined();
      });

      it('should handle Transcribe limit exceeded', async () => {
        const limitError = new Error('Limit exceeded');
        (limitError as any).name = 'LimitExceededException';
        mockTranscribeService.startTranscription = jest.fn().mockRejectedValue(limitError);

        const response = await request(app)
          .post('/api/process')
          .send({ fileId: 'test.mp4' })
          .expect(502);

        expect(response.body.error).toBeDefined();
      });
    });
  });

  describe('GET /api/process/:jobId - Check Status', () => {
    describe('Successful Status Checks', () => {
      it('should return status for valid jobId', async () => {
        const response = await request(app)
          .get('/api/process/transcribe-1234567890')
          .expect(200);

        expect(response.body).toMatchObject({
          jobId: 'transcribe-1234567890',
          status: 'COMPLETED',
        });
        expect(response.body.transcript).toBeDefined();
        expect(response.body.completedAt).toBeDefined();
      });

      it('should return IN_PROGRESS status', async () => {
        mockTranscribeService.getTranscriptionStatus = jest.fn().mockResolvedValue({
          status: 'IN_PROGRESS',
          transcript: null,
        });

        const response = await request(app)
          .get('/api/process/transcribe-in-progress')
          .expect(200);

        expect(response.body.status).toBe('IN_PROGRESS');
        expect(response.body.transcript).toBeNull();
      });

      it('should return FAILED status', async () => {
        mockTranscribeService.getTranscriptionStatus = jest.fn().mockResolvedValue({
          status: 'FAILED',
          transcript: null,
        });

        const response = await request(app)
          .get('/api/process/transcribe-failed')
          .expect(200);

        expect(response.body.status).toBe('FAILED');
      });

      it('should handle special characters in jobId', async () => {
        const jobId = 'transcribe-user@email.com-123';
        
        const response = await request(app)
          .get(`/api/process/${encodeURIComponent(jobId)}`)
          .expect(200);

        expect(response.body.jobId).toBe(jobId);
        expect(mockTranscribeService.getTranscriptionStatus).toHaveBeenCalledWith(jobId);
      });

      it('should include completedAt timestamp', async () => {
        const beforeCheck = new Date();
        
        const response = await request(app)
          .get('/api/process/transcribe-123')
          .expect(200);

        const afterCheck = new Date();
        const completedAt = new Date(response.body.completedAt);

        expect(completedAt.getTime()).toBeGreaterThanOrEqual(beforeCheck.getTime());
        expect(completedAt.getTime()).toBeLessThanOrEqual(afterCheck.getTime());
      });
    });

    describe('Status Check Validation Errors', () => {
      it('should return 404 for missing jobId', async () => {
        const response = await request(app)
          .get('/api/process/')
          .expect(404);

        expect(response.body.error).toBeDefined();
      });

      it('should handle empty jobId', async () => {
        const response = await request(app)
          .get('/api/process/ ')
          .expect(200);

        // Express will treat this as a valid route parameter
        expect(mockTranscribeService.getTranscriptionStatus).toHaveBeenCalled();
      });
    });

    describe('Status Check AWS Errors', () => {
      it('should handle job not found', async () => {
        const notFoundError = new Error('Job not found');
        (notFoundError as any).name = 'BadRequestException';
        mockTranscribeService.getTranscriptionStatus = jest.fn().mockRejectedValue(notFoundError);

        const response = await request(app)
          .get('/api/process/nonexistent-job')
          .expect(502);

        expect(response.body.error).toBeDefined();
      });

      it('should handle Transcribe service error', async () => {
        mockTranscribeService.getTranscriptionStatus = jest.fn().mockRejectedValue(
          new Error('Service error')
        );

        const response = await request(app)
          .get('/api/process/transcribe-123')
          .expect(502);

        expect(response.body.error).toContain('AWS Transcribe error');
      });

      it('should handle Transcribe access denied', async () => {
        const accessError = new Error('Access Denied');
        (accessError as any).code = 'AccessDenied';
        mockTranscribeService.getTranscriptionStatus = jest.fn().mockRejectedValue(accessError);

        const response = await request(app)
          .get('/api/process/transcribe-123')
          .expect(502);

        expect(response.body.error).toBeDefined();
      });
    });
  });

  describe('Error Response Format', () => {
    it('should include requestId in error responses', async () => {
      mockS3Service.upload = jest.fn().mockRejectedValue(new Error('Test error'));

      const response = await request(app)
        .post('/api/upload')
        .attach('file', Buffer.from('content'), 'test.mp4')
        .set('x-request-id', 'test-request-123')
        .expect(502);

      expect(response.body.requestId).toBe('test-request-123');
    });

    it('should not expose stack traces in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      mockS3Service.upload = jest.fn().mockRejectedValue(new Error('Test error'));

      const response = await request(app)
        .post('/api/upload')
        .attach('file', Buffer.from('content'), 'test.mp4')
        .expect(502);

      expect(response.body.stack).toBeUndefined();

      process.env.NODE_ENV = originalEnv;
    });

    it('should include error message in response', async () => {
      const response = await request(app)
        .post('/api/process')
        .send({})
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(typeof response.body.error).toBe('string');
    });
  });

  describe('Response Contract Validation', () => {
    it('upload response should have all required fields', async () => {
      const response = await request(app)
        .post('/api/upload')
        .attach('file', Buffer.from('content'), 'test.mp4')
        .expect(200);

      const requiredFields = ['success', 'fileId', 'fileName', 'mimeType', 'size', 'userId', 'url', 'uploadedAt'];
      requiredFields.forEach(field => {
        expect(response.body).toHaveProperty(field);
      });
    });

    it('process response should have all required fields', async () => {
      const response = await request(app)
        .post('/api/process')
        .send({ fileId: 'test.mp4' })
        .expect(200);

      const requiredFields = ['success', 'jobId', 'fileId', 'status', 'startedAt'];
      requiredFields.forEach(field => {
        expect(response.body).toHaveProperty(field);
      });
    });

    it('status response should have all required fields', async () => {
      const response = await request(app)
        .get('/api/process/transcribe-123')
        .expect(200);

      const requiredFields = ['jobId', 'status', 'completedAt'];
      requiredFields.forEach(field => {
        expect(response.body).toHaveProperty(field);
      });
    });

    it('all responses should return valid JSON', async () => {
      const uploadRes = await request(app)
        .post('/api/upload')
        .attach('file', Buffer.from('content'), 'test.mp4')
        .expect('Content-Type', /json/);

      const processRes = await request(app)
        .post('/api/process')
        .send({ fileId: 'test.mp4' })
        .expect('Content-Type', /json/);

      const statusRes = await request(app)
        .get('/api/process/transcribe-123')
        .expect('Content-Type', /json/);

      expect(() => JSON.stringify(uploadRes.body)).not.toThrow();
      expect(() => JSON.stringify(processRes.body)).not.toThrow();
      expect(() => JSON.stringify(statusRes.body)).not.toThrow();
    });
  });
});
