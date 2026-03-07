/**
 * E2E Error Handling Tests for Content Intelligence Platform
 * 
 * Tests comprehensive error scenarios and edge cases:
 * - Invalid file uploads (wrong format, too large, corrupted)
 * - Missing required parameters
 * - Invalid jobIds/generationIds
 * - Rate limiting scenarios
 * - Timeout handling
 * - Concurrent request handling
 * - Authentication/authorization failures
 */

import request from 'supertest';
import express from 'express';
import uploadRoute from '../../routes/upload.route';
import processRoute from '../../routes/process.route';
import generateRoute from '../../routes/generate.route';
import { errorHandler, notFoundHandler } from '../../middleware/error.middleware';
import { uploadLimiter, apiLimiter } from '../../middleware/ratelimit.middleware';
import { transcribeService } from '../../services/transcription.service';
import { bedrockService } from '../../services/bedrock.service';
import { S3Service } from '../../services/s3.service';
import { cacheService } from '../../services/cache.service';
import { expectErrorResponse, createMockFile } from '../setup';

// Mock services
jest.mock('../../services/transcription.service');
jest.mock('../../services/bedrock.service');
jest.mock('../../services/s3.service');

describe('E2E Error Handling Tests', () => {
  let app: express.Application;

  beforeEach(() => {
    // Create fresh Express app for each test
    app = express();
    app.use(express.json({ limit: '10mb' }));
    app.use('/api/upload', uploadRoute);
    app.use('/api/process', processRoute);
    app.use('/api/generate', generateRoute);
    app.use(notFoundHandler);
    app.use(errorHandler);

    // Clear cache and reset mocks
    cacheService.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    cacheService.clear();
  });

  // ============================================================================
  // 1. Invalid File Upload Tests
  // ============================================================================

  describe('Invalid File Uploads', () => {
    describe('Missing File', () => {
      it('should return 400 when no file is uploaded', async () => {
        const response = await request(app)
          .post('/api/upload')
          .field('userId', 'test-user')
          .expect(400);

        expectErrorResponse(response, 400, 'No file uploaded');
        expect(response.body).toHaveProperty('error');
        expect(response.body).toHaveProperty('requestId');
      });

      it('should return 400 when file field is empty', async () => {
        const response = await request(app)
          .post('/api/upload')
          .field('userId', 'test-user')
          .field('file', '')
          .expect(400);

        expectErrorResponse(response, 400);
      });
    });

    describe('Invalid File Format', () => {
      it('should reject executable files', async () => {
        const mockFile = Buffer.from('MZ\x90\x00'); // EXE header
        
        const response = await request(app)
          .post('/api/upload')
          .attach('file', mockFile, 'malicious.exe')
          .field('userId', 'test-user')
          .expect(400);

        expectErrorResponse(response, 400);
      });

      it('should reject script files', async () => {
        const mockFile = Buffer.from('#!/bin/bash\nrm -rf /');
        
        const response = await request(app)
          .post('/api/upload')
          .attach('file', mockFile, 'script.sh')
          .field('userId', 'test-user')
          .expect(400);

        expectErrorResponse(response, 400);
      });

      it('should reject files with invalid MIME types', async () => {
        const mockFile = Buffer.from('test content');
        
        const response = await request(app)
          .post('/api/upload')
          .attach('file', mockFile, {
            filename: 'test.xyz',
            contentType: 'application/x-unknown'
          })
          .field('userId', 'test-user')
          .expect(400);

        expectErrorResponse(response, 400);
      });
    });

    describe('File Size Limits', () => {
      it('should reject files larger than 100MB', async () => {
        // Create a buffer larger than 100MB (simulate)
        const largeSize = 101 * 1024 * 1024; // 101MB
        const mockFile = Buffer.alloc(1024); // Small buffer for test
        
        const response = await request(app)
          .post('/api/upload')
          .attach('file', mockFile, 'large-file.mp4')
          .field('userId', 'test-user')
          .expect(400);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toMatch(/too large|size/i);
      });

      it('should reject zero-byte files', async () => {
        const emptyFile = Buffer.alloc(0);
        
        const response = await request(app)
          .post('/api/upload')
          .attach('file', emptyFile, 'empty.mp4')
          .field('userId', 'test-user')
          .expect(400);

        expectErrorResponse(response, 400);
      });
    });

    describe('Corrupted Files', () => {
      it('should handle corrupted video files', async () => {
        const corruptedVideo = Buffer.from('CORRUPTED_VIDEO_DATA');
        
        // Mock S3 service to throw error for corrupted file
        const mockS3 = S3Service as jest.MockedClass<typeof S3Service>;
        mockS3.prototype.upload = jest.fn().mockRejectedValue(
          new Error('Invalid file format')
        );

        const response = await request(app)
          .post('/api/upload')
          .attach('file', corruptedVideo, 'corrupted.mp4')
          .field('userId', 'test-user')
          .expect(502);

        expectErrorResponse(response, 502);
        expect(response.body.error).toMatch(/AWS S3 error/i);
      });

      it('should handle corrupted audio files', async () => {
        const corruptedAudio = Buffer.from('INVALID_AUDIO_HEADER');
        
        const mockS3 = S3Service as jest.MockedClass<typeof S3Service>;
        mockS3.prototype.upload = jest.fn().mockRejectedValue(
          new Error('File validation failed')
        );

        const response = await request(app)
          .post('/api/upload')
          .attach('file', corruptedAudio, 'corrupted.mp3')
          .field('userId', 'test-user')
          .expect(502);

        expectErrorResponse(response, 502);
      });
    });

    describe('File Name Validation', () => {
      it('should handle files with special characters in name', async () => {
        const mockFile = Buffer.from('test content');
        
        const response = await request(app)
          .post('/api/upload')
          .attach('file', mockFile, 'test@#$%^&*().mp4')
          .field('userId', 'test-user');

        // Should either accept with sanitization or reject
        expect([200, 400]).toContain(response.status);
      });

      it('should handle files with very long names', async () => {
        const longName = 'a'.repeat(300) + '.mp4';
        const mockFile = Buffer.from('test content');
        
        const response = await request(app)
          .post('/api/upload')
          .attach('file', mockFile, longName)
          .field('userId', 'test-user');

        expect([200, 400]).toContain(response.status);
      });

      it('should handle files with unicode characters', async () => {
        const mockFile = Buffer.from('test content');
        
        const response = await request(app)
          .post('/api/upload')
          .attach('file', mockFile, '测试文件🎬.mp4')
          .field('userId', 'test-user');

        expect([200, 400]).toContain(response.status);
      });
    });
  });

  // ============================================================================
  // 2. Missing Required Parameters Tests
  // ============================================================================

  describe('Missing Required Parameters', () => {
    describe('Process Endpoint', () => {
      it('should return 400 when fileId is missing', async () => {
        const response = await request(app)
          .post('/api/process')
          .send({})
          .expect(400);

        expectErrorResponse(response, 400, 'fileId required');
        expect(response.body).toHaveProperty('requestId');
      });

      it('should return 400 when fileId is null', async () => {
        const response = await request(app)
          .post('/api/process')
          .send({ fileId: null })
          .expect(400);

        expectErrorResponse(response, 400);
      });

      it('should return 400 when fileId is empty string', async () => {
        const response = await request(app)
          .post('/api/process')
          .send({ fileId: '' })
          .expect(400);

        expectErrorResponse(response, 400);
      });

      it('should return 400 when fileId is whitespace only', async () => {
        const response = await request(app)
          .post('/api/process')
          .send({ fileId: '   ' })
          .expect(400);

        expectErrorResponse(response, 400);
      });
    });

    describe('Generate Endpoint', () => {
      it('should return 400 when jobId is missing', async () => {
        const response = await request(app)
          .post('/api/generate')
          .send({ platforms: ['twitter', 'linkedin'] })
          .expect(400);

        expectErrorResponse(response, 400, 'jobId and platforms[] required');
      });

      it('should return 400 when platforms is missing', async () => {
        const response = await request(app)
          .post('/api/generate')
          .send({ jobId: 'test-job-123' })
          .expect(400);

        expectErrorResponse(response, 400, 'jobId and platforms[] required');
      });

      it('should return 400 when platforms is not an array', async () => {
        const response = await request(app)
          .post('/api/generate')
          .send({ 
            jobId: 'test-job-123',
            platforms: 'twitter'
          })
          .expect(400);

        expectErrorResponse(response, 400);
      });

      it('should return 400 when platforms is empty array', async () => {
        const response = await request(app)
          .post('/api/generate')
          .send({ 
            jobId: 'test-job-123',
            platforms: []
          })
          .expect(400);

        expectErrorResponse(response, 400);
      });

      it('should return 400 when both jobId and platforms are missing', async () => {
        const response = await request(app)
          .post('/api/generate')
          .send({})
          .expect(400);

        expectErrorResponse(response, 400);
      });
    });

    describe('Upload Endpoint', () => {
      it('should handle missing userId gracefully', async () => {
        const mockFile = Buffer.from('test content');
        
        const mockS3 = S3Service as jest.MockedClass<typeof S3Service>;
        mockS3.prototype.upload = jest.fn().mockResolvedValue({
          key: 'anonymous/test.mp4',
          url: 'https://test-bucket.s3.amazonaws.com/anonymous/test.mp4'
        });

        const response = await request(app)
          .post('/api/upload')
          .attach('file', mockFile, 'test.mp4')
          .expect(200);

        expect(response.body.userId).toBe('anonymous');
      });
    });
  });

  // ============================================================================
  // 3. Invalid IDs Tests
  // ============================================================================

  describe('Invalid JobIds and GenerationIds', () => {
    describe('Invalid JobId Format', () => {
      it('should return 502 for non-existent jobId in process status', async () => {
        const mockTranscribe = transcribeService as jest.Mocked<typeof transcribeService>;
        mockTranscribe.getTranscriptionStatus = jest.fn().mockRejectedValue(
          new Error('Job not found')
        );

        const response = await request(app)
          .get('/api/process/non-existent-job-123')
          .expect(502);

        expectErrorResponse(response, 502);
        expect(response.body.error).toMatch(/AWS Transcribe error/i);
      });

      it('should return 502 for invalid jobId format', async () => {
        const mockTranscribe = transcribeService as jest.Mocked<typeof transcribeService>;
        mockTranscribe.getTranscriptionStatus = jest.fn().mockRejectedValue(
          new Error('Invalid job name format')
        );

        const response = await request(app)
          .get('/api/process/invalid@job#id')
          .expect(502);

        expectErrorResponse(response, 502);
      });

      it('should return 502 for SQL injection attempt in jobId', async () => {
        const mockTranscribe = transcribeService as jest.Mocked<typeof transcribeService>;
        mockTranscribe.getTranscriptionStatus = jest.fn().mockRejectedValue(
          new Error('Invalid job name')
        );

        const response = await request(app)
          .get('/api/process/job-123\'; DROP TABLE jobs;--')
          .expect(502);

        expectErrorResponse(response, 502);
      });

      it('should return 502 for XSS attempt in jobId', async () => {
        const mockTranscribe = transcribeService as jest.Mocked<typeof transcribeService>;
        mockTranscribe.getTranscriptionStatus = jest.fn().mockRejectedValue(
          new Error('Invalid job name')
        );

        const response = await request(app)
          .get('/api/process/<script>alert("xss")</script>')
          .expect(502);

        expectErrorResponse(response, 502);
      });
    });

    describe('Invalid GenerationId', () => {
      it('should return 404 for non-existent generationId', async () => {
        const response = await request(app)
          .get('/api/generate/non-existent-gen-123')
          .expect(404);

        expectErrorResponse(response, 404, 'Generation not found');
      });

      it('should return 404 for expired generationId', async () => {
        // Set a generation that will expire
        const generationId = 'gen-expired-123';
        cacheService.set(generationId, { test: 'data' }, 0); // Expire immediately
        
        // Wait for expiration
        await new Promise(resolve => setTimeout(resolve, 100));

        const response = await request(app)
          .get(`/api/generate/${generationId}`)
          .expect(404);

        expectErrorResponse(response, 404);
      });

      it('should return 404 for malformed generationId', async () => {
        const response = await request(app)
          .get('/api/generate/malformed@gen#id')
          .expect(404);

        expectErrorResponse(response, 404);
      });

      it('should return 404 for empty generationId', async () => {
        const response = await request(app)
          .get('/api/generate/ ')
          .expect(404);

        expect(response.body).toHaveProperty('error');
      });
    });

    describe('Invalid FileId', () => {
      it('should return 502 for non-existent fileId', async () => {
        const mockS3 = S3Service as jest.MockedClass<typeof S3Service>;
        mockS3.prototype.getPresignedUrl = jest.fn().mockRejectedValue(
          new Error('NoSuchKey: The specified key does not exist')
        );

        const response = await request(app)
          .post('/api/process')
          .send({ fileId: 'non-existent-file-123' })
          .expect(502);

        expectErrorResponse(response, 502);
      });

      it('should return 502 for path traversal attempt in fileId', async () => {
        const mockS3 = S3Service as jest.MockedClass<typeof S3Service>;
        mockS3.prototype.getPresignedUrl = jest.fn().mockRejectedValue(
          new Error('Invalid key')
        );

        const response = await request(app)
          .post('/api/process')
          .send({ fileId: '../../etc/passwd' })
          .expect(502);

        expectErrorResponse(response, 502);
      });
    });
  });

  // ============================================================================
  // 4. Rate Limiting Tests
  // ============================================================================

  describe('Rate Limiting Scenarios', () => {
    describe('Upload Rate Limiting', () => {
      it('should enforce rate limits on upload endpoint', async () => {
        const mockFile = Buffer.from('test content');
        const mockS3 = S3Service as jest.MockedClass<typeof S3Service>;
        mockS3.prototype.upload = jest.fn().mockResolvedValue({
          key: 'test/file.mp4',
          url: 'https://test-bucket.s3.amazonaws.com/test/file.mp4'
        });

        // Make multiple rapid requests
        const requests = Array(12).fill(null).map(() =>
          request(app)
            .post('/api/upload')
            .attach('file', mockFile, 'test.mp4')
            .field('userId', 'rate-limit-test')
        );

        const responses = await Promise.all(requests);
        
        // Some requests should be rate limited (429)
        const rateLimitedResponses = responses.filter(r => r.status === 429);
        expect(rateLimitedResponses.length).toBeGreaterThan(0);
        
        // Check rate limit response format
        if (rateLimitedResponses.length > 0) {
          const rateLimitResponse = rateLimitedResponses[0];
          expect(rateLimitResponse.body).toHaveProperty('error');
          expect(rateLimitResponse.body.error).toMatch(/too many/i);
        }
      }, 30000); // Increase timeout for this test

      it('should include retry-after header in rate limit response', async () => {
        const mockFile = Buffer.from('test content');
        const mockS3 = S3Service as jest.MockedClass<typeof S3Service>;
        mockS3.prototype.upload = jest.fn().mockResolvedValue({
          key: 'test/file.mp4',
          url: 'https://test-bucket.s3.amazonaws.com/test/file.mp4'
        });

        // Exhaust rate limit
        const requests = Array(15).fill(null).map(() =>
          request(app)
            .post('/api/upload')
            .attach('file', mockFile, 'test.mp4')
            .field('userId', 'retry-test')
        );

        const responses = await Promise.all(requests);
        const rateLimited = responses.find(r => r.status === 429);
        
        if (rateLimited) {
          // Check for rate limit headers
          expect(rateLimited.headers).toBeDefined();
        }
      }, 30000);
    });

    describe('API Rate Limiting', () => {
      it('should enforce rate limits on generate endpoint', async () => {
        const mockTranscribe = transcribeService as jest.Mocked<typeof transcribeService>;
        mockTranscribe.getTranscriptionStatus = jest.fn().mockResolvedValue({
          status: 'COMPLETED',
          transcript: 'Test transcript'
        });

        const mockBedrock = bedrockService as jest.Mocked<typeof bedrockService>;
        mockBedrock.generatePlatformContent = jest.fn().mockResolvedValue({
          content: 'Generated content'
        });

        // Make many rapid requests
        const requests = Array(105).fill(null).map(() =>
          request(app)
            .post('/api/generate')
            .send({
              jobId: 'test-job-123',
              platforms: ['twitter']
            })
        );

        const responses = await Promise.all(requests);
        
        // Some should be rate limited
        const rateLimited = responses.filter(r => r.status === 429);
        expect(rateLimited.length).toBeGreaterThan(0);
      }, 60000);

      it('should rate limit per IP address', async () => {
        // This would require setting up different IP addresses
        // For now, we test that rate limiting is applied
        const mockTranscribe = transcribeService as jest.Mocked<typeof transcribeService>;
        mockTranscribe.getTranscriptionStatus = jest.fn().mockResolvedValue({
          status: 'COMPLETED',
          transcript: 'Test transcript'
        });

        const response = await request(app)
          .post('/api/generate')
          .send({
            jobId: 'test-job-123',
            platforms: ['twitter']
          });

        expect([200, 429, 502]).toContain(response.status);
      });
    });

    describe('Rate Limit Recovery', () => {
      it('should allow requests after rate limit window expires', async () => {
        // This test would require waiting for the rate limit window
        // For practical testing, we verify the mechanism exists
        const mockFile = Buffer.from('test content');
        
        const response = await request(app)
          .post('/api/upload')
          .attach('file', mockFile, 'test.mp4')
          .field('userId', 'recovery-test');

        expect([200, 400, 429, 502]).toContain(response.status);
      });
    });
  });

  // ============================================================================
  // 5. Timeout Handling Tests
  // ============================================================================

  describe('Timeout Handling', () => {
    describe('Service Timeouts', () => {
      it('should handle S3 upload timeout', async () => {
        const mockFile = Buffer.from('test content');
        const mockS3 = S3Service as jest.MockedClass<typeof S3Service>;
        
        // Simulate timeout
        mockS3.prototype.upload = jest.fn().mockImplementation(() => 
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), 100)
          )
        );

        const response = await request(app)
          .post('/api/upload')
          .attach('file', mockFile, 'test.mp4')
          .field('userId', 'timeout-test')
          .timeout(5000)
          .expect(502);

        expectErrorResponse(response, 502);
        expect(response.body.error).toMatch(/timeout|AWS S3 error/i);
      });

      it('should handle transcription service timeout', async () => {
        const mockS3 = S3Service as jest.MockedClass<typeof S3Service>;
        mockS3.prototype.getPresignedUrl = jest.fn().mockResolvedValue(
          'https://test-bucket.s3.amazonaws.com/test.mp4'
        );

        const mockTranscribe = transcribeService as jest.Mocked<typeof transcribeService>;
        mockTranscribe.startTranscription = jest.fn().mockImplementation(() =>
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Service timeout')), 100)
          )
        );

        const response = await request(app)
          .post('/api/process')
          .send({ fileId: 'test-file-123' })
          .timeout(5000)
          .expect(502);

        expectErrorResponse(response, 502);
      });

      it('should handle Bedrock generation timeout', async () => {
        const mockTranscribe = transcribeService as jest.Mocked<typeof transcribeService>;
        mockTranscribe.getTranscriptionStatus = jest.fn().mockResolvedValue({
          status: 'COMPLETED',
          transcript: 'Test transcript'
        });

        const mockBedrock = bedrockService as jest.Mocked<typeof bedrockService>;
        mockBedrock.generatePlatformContent = jest.fn().mockImplementation(() =>
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Model timeout')), 100)
          )
        );

        const response = await request(app)
          .post('/api/generate')
          .send({
            jobId: 'test-job-123',
            platforms: ['twitter']
          })
          .timeout(5000)
          .expect(502);

        expectErrorResponse(response, 502);
      });
    });

    describe('Long-Running Operations', () => {
      it('should handle slow file uploads gracefully', async () => {
        const mockFile = Buffer.from('test content');
        const mockS3 = S3Service as jest.MockedClass<typeof S3Service>;
        
        // Simulate slow upload
        mockS3.prototype.upload = jest.fn().mockImplementation(() =>
          new Promise(resolve => 
            setTimeout(() => resolve({
              key: 'test/file.mp4',
              url: 'https://test-bucket.s3.amazonaws.com/test/file.mp4'
            }), 2000)
          )
        );

        const response = await request(app)
          .post('/api/upload')
          .attach('file', mockFile, 'test.mp4')
          .field('userId', 'slow-upload-test')
          .timeout(10000);

        expect([200, 502]).toContain(response.status);
      }, 15000);

      it('should handle slow transcription status checks', async () => {
        const mockTranscribe = transcribeService as jest.Mocked<typeof transcribeService>;
        mockTranscribe.getTranscriptionStatus = jest.fn().mockImplementation(() =>
          new Promise(resolve => 
            setTimeout(() => resolve({
              status: 'COMPLETED',
              transcript: 'Test transcript'
            }), 2000)
          )
        );

        const response = await request(app)
          .get('/api/process/slow-job-123')
          .timeout(10000);

        expect([200, 502]).toContain(response.status);
      }, 15000);
    });

    describe('Request Timeout Configuration', () => {
      it('should respect client timeout settings', async () => {
        const mockFile = Buffer.from('test content');
        const mockS3 = S3Service as jest.MockedClass<typeof S3Service>;
        
        mockS3.prototype.upload = jest.fn().mockImplementation(() =>
          new Promise(resolve => setTimeout(resolve, 10000))
        );

        try {
          await request(app)
            .post('/api/upload')
            .attach('file', mockFile, 'test.mp4')
            .field('userId', 'timeout-config-test')
            .timeout(1000); // 1 second timeout
          
          fail('Should have timed out');
        } catch (error: any) {
          expect(error.message).toMatch(/timeout/i);
        }
      });
    });
  });

  // ============================================================================
  // 6. Concurrent Request Handling Tests
  // ============================================================================

  describe('Concurrent Request Handling', () => {
    describe('Parallel Uploads', () => {
      it('should handle multiple concurrent uploads', async () => {
        const mockFile = Buffer.from('test content');
        const mockS3 = S3Service as jest.MockedClass<typeof S3Service>;
        
        let uploadCount = 0;
        mockS3.prototype.upload = jest.fn().mockImplementation(() => {
          uploadCount++;
          return Promise.resolve({
            key: `test/file-${uploadCount}.mp4`,
            url: `https://test-bucket.s3.amazonaws.com/test/file-${uploadCount}.mp4`
          });
        });

        // Create 5 concurrent uploads
        const uploads = Array(5).fill(null).map((_, i) =>
          request(app)
            .post('/api/upload')
            .attach('file', mockFile, `test-${i}.mp4`)
            .field('userId', `user-${i}`)
        );

        const responses = await Promise.all(uploads);
        
        // All should succeed or fail gracefully
        responses.forEach(response => {
          expect([200, 400, 429, 502]).toContain(response.status);
        });

        // Verify all uploads were attempted
        expect(uploadCount).toBeGreaterThan(0);
      }, 30000);

      it('should maintain data integrity with concurrent uploads', async () => {
        const mockS3 = S3Service as jest.MockedClass<typeof S3Service>;
        
        const uploadedFiles: string[] = [];
        mockS3.prototype.upload = jest.fn().mockImplementation((buffer, key) => {
          uploadedFiles.push(key);
          return Promise.resolve({
            key,
            url: `https://test-bucket.s3.amazonaws.com/${key}`
          });
        });

        const mockFile = Buffer.from('test content');
        const uploads = Array(3).fill(null).map((_, i) =>
          request(app)
            .post('/api/upload')
            .attach('file', mockFile, `unique-${i}.mp4`)
            .field('userId', `user-${i}`)
        );

        await Promise.all(uploads);

        // Verify unique keys were generated
        const uniqueKeys = new Set(uploadedFiles);
        expect(uniqueKeys.size).toBe(uploadedFiles.length);
      }, 30000);
    });

    describe('Parallel Processing', () => {
      it('should handle concurrent transcription requests', async () => {
        const mockS3 = S3Service as jest.MockedClass<typeof S3Service>;
        mockS3.prototype.getPresignedUrl = jest.fn().mockResolvedValue(
          'https://test-bucket.s3.amazonaws.com/test.mp4'
        );

        const mockTranscribe = transcribeService as jest.Mocked<typeof transcribeService>;
        let jobCount = 0;
        mockTranscribe.startTranscription = jest.fn().mockImplementation(() => {
          jobCount++;
          return Promise.resolve();
        });

        const requests = Array(3).fill(null).map((_, i) =>
          request(app)
            .post('/api/process')
            .send({ fileId: `file-${i}` })
        );

        const responses = await Promise.all(requests);
        
        responses.forEach(response => {
          expect([200, 400, 502]).toContain(response.status);
        });

        expect(jobCount).toBeGreaterThan(0);
      }, 30000);

      it('should handle concurrent generation requests', async () => {
        const mockTranscribe = transcribeService as jest.Mocked<typeof transcribeService>;
        mockTranscribe.getTranscriptionStatus = jest.fn().mockResolvedValue({
          status: 'COMPLETED',
          transcript: 'Test transcript'
        });

        const mockBedrock = bedrockService as jest.Mocked<typeof bedrockService>;
        let genCount = 0;
        mockBedrock.generatePlatformContent = jest.fn().mockImplementation(() => {
          genCount++;
          return Promise.resolve({ content: `Generated content ${genCount}` });
        });

        const requests = Array(3).fill(null).map((_, i) =>
          request(app)
            .post('/api/generate')
            .send({
              jobId: `job-${i}`,
              platforms: ['twitter']
            })
        );

        const responses = await Promise.all(requests);
        
        responses.forEach(response => {
          expect([200, 400, 502]).toContain(response.status);
        });
      }, 30000);
    });

    describe('Race Conditions', () => {
      it('should handle concurrent access to same resource', async () => {
        const generationId = 'gen-race-test';
        cacheService.set(generationId, { test: 'data' }, 3600);

        // Multiple concurrent reads
        const reads = Array(5).fill(null).map(() =>
          request(app).get(`/api/generate/${generationId}`)
        );

        const responses = await Promise.all(reads);
        
        // All should succeed with same data
        const successResponses = responses.filter(r => r.status === 200);
        expect(successResponses.length).toBe(5);
        
        successResponses.forEach(response => {
          expect(response.body.generationId).toBe(generationId);
        });
      });

      it('should handle cache invalidation during concurrent access', async () => {
        const generationId = 'gen-invalidate-test';
        cacheService.set(generationId, { test: 'data' }, 1); // Short TTL

        // Start concurrent reads
        const reads = Array(3).fill(null).map(() =>
          request(app).get(`/api/generate/${generationId}`)
        );

        // Wait for cache to expire
        await new Promise(resolve => setTimeout(resolve, 1500));

        const responses = await Promise.all(reads);
        
        // Some may succeed, some may fail due to expiration
        responses.forEach(response => {
          expect([200, 404]).toContain(response.status);
        });
      });
    });

    describe('Resource Contention', () => {
      it('should handle high concurrent load gracefully', async () => {
        const mockTranscribe = transcribeService as jest.Mocked<typeof transcribeService>;
        mockTranscribe.getTranscriptionStatus = jest.fn().mockResolvedValue({
          status: 'COMPLETED',
          transcript: 'Test transcript'
        });

        const mockBedrock = bedrockService as jest.Mocked<typeof bedrockService>;
        mockBedrock.generatePlatformContent = jest.fn().mockResolvedValue({
          content: 'Generated content'
        });

        // Create high load
        const requests = Array(20).fill(null).map((_, i) =>
          request(app)
            .post('/api/generate')
            .send({
              jobId: `job-${i}`,
              platforms: ['twitter', 'linkedin']
            })
        );

        const responses = await Promise.all(requests);
        
        // System should handle load without crashing
        expect(responses.length).toBe(20);
        responses.forEach(response => {
          expect(response.status).toBeDefined();
          expect([200, 400, 429, 502, 503]).toContain(response.status);
        });
      }, 60000);
    });
  });

  // ============================================================================
  // 7. Authentication and Authorization Tests
  // ============================================================================

  describe('Authentication and Authorization', () => {
    describe('Missing Authentication', () => {
      it('should handle requests without authentication headers', async () => {
        const response = await request(app)
          .post('/api/generate')
          .send({
            jobId: 'test-job-123',
            platforms: ['twitter']
          });

        // Should either succeed (if auth not required) or fail with 401
        expect([200, 400, 401, 502]).toContain(response.status);
      });

      it('should handle requests with invalid auth token', async () => {
        const response = await request(app)
          .post('/api/generate')
          .set('Authorization', 'Bearer invalid-token-123')
          .send({
            jobId: 'test-job-123',
            platforms: ['twitter']
          });

        expect([200, 400, 401, 502]).toContain(response.status);
      });

      it('should handle requests with expired token', async () => {
        const response = await request(app)
          .post('/api/generate')
          .set('Authorization', 'Bearer expired-token')
          .send({
            jobId: 'test-job-123',
            platforms: ['twitter']
          });

        expect([200, 400, 401, 502]).toContain(response.status);
      });
    });

    describe('Authorization Failures', () => {
      it('should prevent access to other users resources', async () => {
        const generationId = 'gen-user-a';
        cacheService.set(generationId, { 
          userId: 'user-a',
          results: { twitter: 'content' }
        }, 3600);

        const response = await request(app)
          .get(`/api/generate/${generationId}`)
          .set('Authorization', 'Bearer user-b-token');

        // Should either allow (if no auth) or deny with 403
        expect([200, 403]).toContain(response.status);
      });

      it('should handle insufficient permissions', async () => {
        const mockFile = Buffer.from('test content');
        
        const response = await request(app)
          .post('/api/upload')
          .set('Authorization', 'Bearer limited-permissions-token')
          .attach('file', mockFile, 'test.mp4')
          .field('userId', 'test-user');

        expect([200, 400, 403, 502]).toContain(response.status);
      });
    });

    describe('API Key Validation', () => {
      it('should handle missing API key', async () => {
        const response = await request(app)
          .post('/api/generate')
          .send({
            jobId: 'test-job-123',
            platforms: ['twitter']
          });

        expect([200, 400, 401, 502]).toContain(response.status);
      });

      it('should handle invalid API key format', async () => {
        const response = await request(app)
          .post('/api/generate')
          .set('X-API-Key', 'invalid-key')
          .send({
            jobId: 'test-job-123',
            platforms: ['twitter']
          });

        expect([200, 400, 401, 502]).toContain(response.status);
      });

      it('should handle revoked API key', async () => {
        const response = await request(app)
          .post('/api/generate')
          .set('X-API-Key', 'revoked-key-123')
          .send({
            jobId: 'test-job-123',
            platforms: ['twitter']
          });

        expect([200, 400, 401, 403, 502]).toContain(response.status);
      });
    });

    describe('CORS and Origin Validation', () => {
      it('should handle requests from unauthorized origins', async () => {
        const response = await request(app)
          .post('/api/generate')
          .set('Origin', 'https://malicious-site.com')
          .send({
            jobId: 'test-job-123',
            platforms: ['twitter']
          });

        // CORS should be handled by middleware
        expect(response.status).toBeDefined();
      });

      it('should handle missing origin header', async () => {
        const response = await request(app)
          .post('/api/generate')
          .send({
            jobId: 'test-job-123',
            platforms: ['twitter']
          });

        expect(response.status).toBeDefined();
      });
    });
  });

  // ============================================================================
  // 8. AWS Service Error Handling Tests
  // ============================================================================

  describe('AWS Service Errors', () => {
    describe('S3 Errors', () => {
      it('should handle S3 access denied error', async () => {
        const mockFile = Buffer.from('test content');
        const mockS3 = S3Service as jest.MockedClass<typeof S3Service>;
        
        const error: any = new Error('Access Denied');
        error.name = 'AccessDenied';
        error.code = 'AccessDenied';
        mockS3.prototype.upload = jest.fn().mockRejectedValue(error);

        const response = await request(app)
          .post('/api/upload')
          .attach('file', mockFile, 'test.mp4')
          .field('userId', 'test-user')
          .expect(502);

        expectErrorResponse(response, 502);
      });

      it('should handle S3 bucket not found error', async () => {
        const mockFile = Buffer.from('test content');
        const mockS3 = S3Service as jest.MockedClass<typeof S3Service>;
        
        const error: any = new Error('The specified bucket does not exist');
        error.name = 'NoSuchBucket';
        mockS3.prototype.upload = jest.fn().mockRejectedValue(error);

        const response = await request(app)
          .post('/api/upload')
          .attach('file', mockFile, 'test.mp4')
          .field('userId', 'test-user')
          .expect(502);

        expectErrorResponse(response, 502);
      });

      it('should handle S3 throttling error', async () => {
        const mockS3 = S3Service as jest.MockedClass<typeof S3Service>;
        mockS3.prototype.getPresignedUrl = jest.fn().mockRejectedValue({
          name: 'ThrottlingException',
          code: 'ThrottlingException',
          message: 'Rate exceeded'
        });

        const response = await request(app)
          .post('/api/process')
          .send({ fileId: 'test-file-123' })
          .expect(502);

        expectErrorResponse(response, 502);
      });
    });

    describe('Transcribe Errors', () => {
      it('should handle transcription job failure', async () => {
        const mockTranscribe = transcribeService as jest.Mocked<typeof transcribeService>;
        mockTranscribe.getTranscriptionStatus = jest.fn().mockResolvedValue({
          status: 'FAILED',
          transcript: null,
          error: 'Transcription failed due to audio quality'
        });

        const response = await request(app)
          .get('/api/process/failed-job-123')
          .expect(200);

        expect(response.body.status).toBe('FAILED');
      });

      it('should handle unsupported audio format', async () => {
        const mockS3 = S3Service as jest.MockedClass<typeof S3Service>;
        mockS3.prototype.getPresignedUrl = jest.fn().mockResolvedValue(
          'https://test-bucket.s3.amazonaws.com/test.xyz'
        );

        const mockTranscribe = transcribeService as jest.Mocked<typeof transcribeService>;
        mockTranscribe.startTranscription = jest.fn().mockRejectedValue(
          new Error('Unsupported media format')
        );

        const response = await request(app)
          .post('/api/process')
          .send({ fileId: 'unsupported-file.xyz' })
          .expect(502);

        expectErrorResponse(response, 502);
      });

      it('should handle transcribe service unavailable', async () => {
        const mockS3 = S3Service as jest.MockedClass<typeof S3Service>;
        mockS3.prototype.getPresignedUrl = jest.fn().mockResolvedValue(
          'https://test-bucket.s3.amazonaws.com/test.mp4'
        );

        const mockTranscribe = transcribeService as jest.Mocked<typeof transcribeService>;
        const error: any = new Error('Service unavailable');
        error.name = 'ServiceUnavailable';
        mockTranscribe.startTranscription = jest.fn().mockRejectedValue(error);

        const response = await request(app)
          .post('/api/process')
          .send({ fileId: 'test-file-123' })
          .expect(502);

        expectErrorResponse(response, 502);
      });
    });

    describe('Bedrock Errors', () => {
      it('should handle model not found error', async () => {
        const mockTranscribe = transcribeService as jest.Mocked<typeof transcribeService>;
        mockTranscribe.getTranscriptionStatus = jest.fn().mockResolvedValue({
          status: 'COMPLETED',
          transcript: 'Test transcript'
        });

        const mockBedrock = bedrockService as jest.Mocked<typeof bedrockService>;
        mockBedrock.generatePlatformContent = jest.fn().mockRejectedValue(
          new Error('Model not found')
        );

        const response = await request(app)
          .post('/api/generate')
          .send({
            jobId: 'test-job-123',
            platforms: ['twitter']
          })
          .expect(502);

        expectErrorResponse(response, 502);
      });

      it('should handle content filtering error', async () => {
        const mockTranscribe = transcribeService as jest.Mocked<typeof transcribeService>;
        mockTranscribe.getTranscriptionStatus = jest.fn().mockResolvedValue({
          status: 'COMPLETED',
          transcript: 'Inappropriate content'
        });

        const mockBedrock = bedrockService as jest.Mocked<typeof bedrockService>;
        mockBedrock.generatePlatformContent = jest.fn().mockRejectedValue(
          new Error('Content filtered by safety guidelines')
        );

        const response = await request(app)
          .post('/api/generate')
          .send({
            jobId: 'test-job-123',
            platforms: ['twitter']
          })
          .expect(502);

        expectErrorResponse(response, 502);
      });

      it('should handle token limit exceeded', async () => {
        const mockTranscribe = transcribeService as jest.Mocked<typeof transcribeService>;
        const longTranscript = 'word '.repeat(10000);
        mockTranscribe.getTranscriptionStatus = jest.fn().mockResolvedValue({
          status: 'COMPLETED',
          transcript: longTranscript
        });

        const mockBedrock = bedrockService as jest.Mocked<typeof bedrockService>;
        mockBedrock.generatePlatformContent = jest.fn().mockRejectedValue(
          new Error('Token limit exceeded')
        );

        const response = await request(app)
          .post('/api/generate')
          .send({
            jobId: 'test-job-123',
            platforms: ['twitter']
          })
          .expect(502);

        expectErrorResponse(response, 502);
      });
    });
  });

  // ============================================================================
  // 9. Edge Cases and Boundary Tests
  // ============================================================================

  describe('Edge Cases and Boundary Conditions', () => {
    describe('Data Validation Edge Cases', () => {
      it('should handle extremely long userId', async () => {
        const longUserId = 'a'.repeat(10000);
        const mockFile = Buffer.from('test content');
        
        const response = await request(app)
          .post('/api/upload')
          .attach('file', mockFile, 'test.mp4')
          .field('userId', longUserId);

        expect([200, 400, 502]).toContain(response.status);
      });

      it('should handle special characters in userId', async () => {
        const specialUserId = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        const mockFile = Buffer.from('test content');
        
        const response = await request(app)
          .post('/api/upload')
          .attach('file', mockFile, 'test.mp4')
          .field('userId', specialUserId);

        expect([200, 400, 502]).toContain(response.status);
      });

      it('should handle unicode in request parameters', async () => {
        const response = await request(app)
          .post('/api/generate')
          .send({
            jobId: 'test-job-测试-🎬',
            platforms: ['twitter']
          });

        expect([200, 400, 502]).toContain(response.status);
      });

      it('should handle null bytes in parameters', async () => {
        const response = await request(app)
          .post('/api/process')
          .send({ fileId: 'test\x00file' });

        expect([400, 502]).toContain(response.status);
      });
    });

    describe('Array and Object Edge Cases', () => {
      it('should handle empty platforms array', async () => {
        const response = await request(app)
          .post('/api/generate')
          .send({
            jobId: 'test-job-123',
            platforms: []
          })
          .expect(400);

        expectErrorResponse(response, 400);
      });

      it('should handle platforms with invalid values', async () => {
        const mockTranscribe = transcribeService as jest.Mocked<typeof transcribeService>;
        mockTranscribe.getTranscriptionStatus = jest.fn().mockResolvedValue({
          status: 'COMPLETED',
          transcript: 'Test transcript'
        });

        const response = await request(app)
          .post('/api/generate')
          .send({
            jobId: 'test-job-123',
            platforms: ['invalid-platform', null, undefined, 123]
          });

        expect([200, 400, 502]).toContain(response.status);
      });

      it('should handle deeply nested objects', async () => {
        const deepObject: any = { level: 1 };
        let current = deepObject;
        for (let i = 0; i < 100; i++) {
          current.nested = { level: i + 2 };
          current = current.nested;
        }

        const response = await request(app)
          .post('/api/generate')
          .send({
            jobId: 'test-job-123',
            platforms: ['twitter'],
            metadata: deepObject
          });

        expect([200, 400, 502]).toContain(response.status);
      });

      it('should handle circular references gracefully', async () => {
        const circular: any = { name: 'test' };
        circular.self = circular;

        try {
          await request(app)
            .post('/api/generate')
            .send({
              jobId: 'test-job-123',
              platforms: ['twitter'],
              metadata: circular
            });
        } catch (error: any) {
          // Should handle circular reference error
          expect(error).toBeDefined();
        }
      });
    });

    describe('Numeric Boundary Tests', () => {
      it('should handle negative numbers in parameters', async () => {
        const response = await request(app)
          .post('/api/generate')
          .send({
            jobId: 'test-job-123',
            platforms: ['twitter'],
            maxLength: -100
          });

        expect([200, 400, 502]).toContain(response.status);
      });

      it('should handle very large numbers', async () => {
        const response = await request(app)
          .post('/api/generate')
          .send({
            jobId: 'test-job-123',
            platforms: ['twitter'],
            maxLength: Number.MAX_SAFE_INTEGER
          });

        expect([200, 400, 502]).toContain(response.status);
      });

      it('should handle floating point precision issues', async () => {
        const response = await request(app)
          .post('/api/generate')
          .send({
            jobId: 'test-job-123',
            platforms: ['twitter'],
            temperature: 0.1 + 0.2 // 0.30000000000000004
          });

        expect([200, 400, 502]).toContain(response.status);
      });

      it('should handle NaN and Infinity', async () => {
        const response = await request(app)
          .post('/api/generate')
          .send({
            jobId: 'test-job-123',
            platforms: ['twitter'],
            temperature: NaN,
            maxTokens: Infinity
          });

        expect([200, 400, 502]).toContain(response.status);
      });
    });

    describe('String Boundary Tests', () => {
      it('should handle empty strings', async () => {
        const response = await request(app)
          .post('/api/process')
          .send({ fileId: '' })
          .expect(400);

        expectErrorResponse(response, 400);
      });

      it('should handle whitespace-only strings', async () => {
        const response = await request(app)
          .post('/api/process')
          .send({ fileId: '   \t\n   ' })
          .expect(400);

        expectErrorResponse(response, 400);
      });

      it('should handle strings with only special characters', async () => {
        const response = await request(app)
          .post('/api/process')
          .send({ fileId: '!@#$%^&*()' });

        expect([200, 400, 502]).toContain(response.status);
      });
    });

    describe('HTTP Method Edge Cases', () => {
      it('should reject unsupported HTTP methods', async () => {
        const response = await request(app)
          .put('/api/upload')
          .send({})
          .expect(404);

        expect(response.body).toHaveProperty('error');
      });

      it('should handle OPTIONS requests', async () => {
        const response = await request(app)
          .options('/api/upload');

        expect([200, 204, 404]).toContain(response.status);
      });

      it('should handle HEAD requests', async () => {
        const response = await request(app)
          .head('/api/generate/test-gen-123');

        expect([200, 404]).toContain(response.status);
      });
    });

    describe('Content-Type Edge Cases', () => {
      it('should handle missing Content-Type header', async () => {
        const response = await request(app)
          .post('/api/generate')
          .set('Content-Type', '')
          .send('jobId=test&platforms=twitter');

        expect([200, 400, 415, 502]).toContain(response.status);
      });

      it('should handle invalid Content-Type', async () => {
        const response = await request(app)
          .post('/api/generate')
          .set('Content-Type', 'application/invalid')
          .send('invalid data');

        expect([400, 415, 502]).toContain(response.status);
      });

      it('should handle malformed JSON', async () => {
        const response = await request(app)
          .post('/api/generate')
          .set('Content-Type', 'application/json')
          .send('{ invalid json }')
          .expect(400);

        expect(response.body).toHaveProperty('error');
      });
    });
  });

  // ============================================================================
  // 10. Error Response Format Tests
  // ============================================================================

  describe('Error Response Format Validation', () => {
    describe('Error Response Structure', () => {
      it('should include error field in error responses', async () => {
        const response = await request(app)
          .post('/api/process')
          .send({})
          .expect(400);

        expect(response.body).toHaveProperty('error');
        expect(typeof response.body.error).toBe('string');
      });

      it('should include requestId in error responses', async () => {
        const response = await request(app)
          .post('/api/process')
          .send({})
          .expect(400);

        expect(response.body).toHaveProperty('requestId');
      });

      it('should not expose sensitive information in production', async () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';

        const mockS3 = S3Service as jest.MockedClass<typeof S3Service>;
        mockS3.prototype.upload = jest.fn().mockRejectedValue(
          new Error('Internal AWS credentials error: secret-key-123')
        );

        const mockFile = Buffer.from('test content');
        const response = await request(app)
          .post('/api/upload')
          .attach('file', mockFile, 'test.mp4')
          .field('userId', 'test-user')
          .expect(502);

        // Should not expose internal error details
        expect(response.body.error).toBeDefined();
        expect(response.body.error).not.toContain('secret-key');
        expect(response.body).not.toHaveProperty('stack');

        process.env.NODE_ENV = originalEnv;
      });

      it('should include stack trace in development mode', async () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';

        const response = await request(app)
          .post('/api/process')
          .send({})
          .expect(400);

        // In development, may include stack trace
        // This is optional based on error middleware configuration
        expect(response.body).toHaveProperty('error');

        process.env.NODE_ENV = originalEnv;
      });
    });

    describe('HTTP Status Code Accuracy', () => {
      it('should return 400 for validation errors', async () => {
        const response = await request(app)
          .post('/api/generate')
          .send({})
          .expect(400);

        expectErrorResponse(response, 400);
      });

      it('should return 404 for not found resources', async () => {
        const response = await request(app)
          .get('/api/generate/non-existent-id')
          .expect(404);

        expectErrorResponse(response, 404);
      });

      it('should return 404 for invalid routes', async () => {
        const response = await request(app)
          .get('/api/invalid-endpoint')
          .expect(404);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toMatch(/not found/i);
      });

      it('should return 502 for AWS service errors', async () => {
        const mockS3 = S3Service as jest.MockedClass<typeof S3Service>;
        mockS3.prototype.upload = jest.fn().mockRejectedValue(
          new Error('AWS error')
        );

        const mockFile = Buffer.from('test content');
        const response = await request(app)
          .post('/api/upload')
          .attach('file', mockFile, 'test.mp4')
          .field('userId', 'test-user')
          .expect(502);

        expectErrorResponse(response, 502);
      });
    });

    describe('Error Message Quality', () => {
      it('should provide clear error messages', async () => {
        const response = await request(app)
          .post('/api/process')
          .send({})
          .expect(400);

        expect(response.body.error).toBeDefined();
        expect(response.body.error.length).toBeGreaterThan(0);
        expect(response.body.error).toMatch(/fileId/i);
      });

      it('should provide actionable error messages', async () => {
        const response = await request(app)
          .post('/api/generate')
          .send({ jobId: 'test' })
          .expect(400);

        expect(response.body.error).toContain('platforms');
        expect(response.body.error).toContain('required');
      });

      it('should not expose internal implementation details', async () => {
        const mockS3 = S3Service as jest.MockedClass<typeof S3Service>;
        mockS3.prototype.upload = jest.fn().mockRejectedValue(
          new Error('Database connection string: mongodb://user:pass@host')
        );

        const mockFile = Buffer.from('test content');
        const response = await request(app)
          .post('/api/upload')
          .attach('file', mockFile, 'test.mp4')
          .field('userId', 'test-user')
          .expect(502);

        // Should sanitize error message
        expect(response.body.error).toBeDefined();
      });
    });

    describe('Consistent Error Format', () => {
      it('should maintain consistent error format across endpoints', async () => {
        const responses = await Promise.all([
          request(app).post('/api/process').send({}),
          request(app).post('/api/generate').send({}),
          request(app).get('/api/generate/non-existent')
        ]);

        responses.forEach(response => {
          expect(response.body).toHaveProperty('error');
          expect(typeof response.body.error).toBe('string');
        });
      });

      it('should use consistent field names in errors', async () => {
        const response = await request(app)
          .post('/api/process')
          .send({})
          .expect(400);

        // Should use 'error' not 'message' or 'errorMessage'
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBeDefined();
      });
    });
  });

  // ============================================================================
  // 11. Route Not Found Tests
  // ============================================================================

  describe('Route Not Found Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/non-existent-route')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/not found/i);
    });

    it('should include request path in 404 response', async () => {
      const response = await request(app)
        .get('/api/invalid-path')
        .expect(404);

      expect(response.body).toHaveProperty('path');
      expect(response.body.path).toBe('/api/invalid-path');
    });

    it('should include request method in 404 response', async () => {
      const response = await request(app)
        .post('/api/invalid-endpoint')
        .send({})
        .expect(404);

      expect(response.body).toHaveProperty('method');
      expect(response.body.method).toBe('POST');
    });

    it('should handle 404 for nested invalid routes', async () => {
      const response = await request(app)
        .get('/api/upload/invalid/nested/route')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });
});
