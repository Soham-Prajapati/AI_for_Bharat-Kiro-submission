/**
 * Integration tests for video metadata extraction with processing pipeline
 * Tests the complete flow of extracting metadata and using it in processing
 */

import { videoMetadataService } from '../services/video-metadata.service';
import { processingPipeline } from '../services/processing-pipeline.service';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs module
jest.mock('fs');

describe('Video Metadata Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    processingPipeline.clear();
  });

  afterEach(() => {
    processingPipeline.clear();
  });

  describe('Local File Processing Flow', () => {
    it('should extract metadata and create processing job', async () => {
      // Mock file stats
      const mockStats = {
        size: 10485760, // 10 MB
        birthtime: new Date('2024-01-15T10:00:00Z')
      };

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.statSync as jest.Mock).mockReturnValue(mockStats);

      // Step 1: Extract metadata from uploaded file
      const metadata = await videoMetadataService.extractFromFile(
        'user123/video.mp4',
        'video.mp4',
        'video/mp4',
        '/uploads/user123/video.mp4'
      );

      expect(metadata).toBeDefined();
      expect(metadata.duration).toBeGreaterThan(0);
      expect(metadata.size).toBe(10485760);

      // Step 2: Create processing job
      const job = processingPipeline.createJob(metadata.fileId, 'user123');

      expect(job).toBeDefined();
      expect(job.fileId).toBe(metadata.fileId);
      expect(job.status).toBe('pending');

      // Step 3: Update job with metadata
      processingPipeline.updateJob(job.jobId, {
        status: 'processing',
        progress: 20,
        currentStep: 'Metadata extracted'
      });

      const updatedJob = processingPipeline.getJob(job.jobId);
      expect(updatedJob?.status).toBe('processing');
      expect(updatedJob?.progress).toBe(20);
    });

    it('should handle multiple file types', async () => {
      const mockStats = {
        size: 5242880,
        birthtime: new Date()
      };

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.statSync as jest.Mock).mockReturnValue(mockStats);

      const fileTypes = [
        { mimeType: 'video/mp4', extension: 'mp4' },
        { mimeType: 'video/quicktime', extension: 'mov' },
        { mimeType: 'audio/mpeg', extension: 'mp3' },
        { mimeType: 'audio/wav', extension: 'wav' }
      ];

      for (const fileType of fileTypes) {
        const metadata = await videoMetadataService.extractFromFile(
          `user123/file.${fileType.extension}`,
          `file.${fileType.extension}`,
          fileType.mimeType,
          `/uploads/user123/file.${fileType.extension}`
        );

        expect(metadata.mimeType).toBe(fileType.mimeType);
        expect(metadata.duration).toBeGreaterThan(0);

        const job = processingPipeline.createJob(metadata.fileId, 'user123');
        expect(job.fileId).toBe(metadata.fileId);
      }
    });

    it('should handle file validation errors', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await expect(
        videoMetadataService.extractFromFile(
          'user123/missing.mp4',
          'missing.mp4',
          'video/mp4',
          '/uploads/user123/missing.mp4'
        )
      ).rejects.toThrow();

      // Job should not be created for invalid files
      const stats = processingPipeline.getStats();
      expect(stats.totalJobs).toBe(0);
    });
  });

  describe('YouTube URL Processing Flow', () => {
    it('should extract YouTube metadata and create processing job', async () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

      // Step 1: Extract metadata from YouTube URL
      const metadata = await videoMetadataService.extractFromYouTubeUrl(url);

      expect(metadata).toBeDefined();
      expect(metadata.title).toContain('dQw4w9WgXcQ');
      expect(metadata.duration).toBeGreaterThan(0);
      expect(metadata.thumbnail).toContain('dQw4w9WgXcQ');

      // Step 2: Create processing job with YouTube video ID
      const fileId = `youtube-${Date.now()}`;
      const job = processingPipeline.createJob(fileId, 'user123');

      expect(job).toBeDefined();
      expect(job.fileId).toBe(fileId);

      // Step 3: Update job with YouTube metadata
      processingPipeline.updateJob(job.jobId, {
        status: 'processing',
        progress: 20,
        currentStep: 'YouTube metadata extracted'
      });

      const updatedJob = processingPipeline.getJob(job.jobId);
      expect(updatedJob?.status).toBe('processing');
    });

    it('should handle different YouTube URL formats', async () => {
      const urls = [
        'https://www.youtube.com/watch?v=abc123',
        'https://youtu.be/abc123',
        'https://youtube.com/watch?v=abc123'
      ];

      for (const url of urls) {
        const metadata = await videoMetadataService.extractFromYouTubeUrl(url);
        expect(metadata).toBeDefined();
        expect(metadata.duration).toBeGreaterThan(0);

        const fileId = `youtube-${Date.now()}-${Math.random()}`;
        const job = processingPipeline.createJob(fileId, 'user123');
        expect(job.fileId).toBe(fileId);
      }
    });

    it('should handle invalid YouTube URLs', async () => {
      const invalidUrls = [
        'https://vimeo.com/123456',
        'https://example.com/video',
        'not-a-url'
      ];

      for (const url of invalidUrls) {
        await expect(
          videoMetadataService.extractFromYouTubeUrl(url)
        ).rejects.toThrow();
      }
    });
  });

  describe('Complete Processing Workflow', () => {
    it('should simulate complete upload-to-results flow', async () => {
      // Mock file stats
      const mockStats = {
        size: 10485760,
        birthtime: new Date()
      };

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.statSync as jest.Mock).mockReturnValue(mockStats);

      // Step 1: Upload and extract metadata
      const metadata = await videoMetadataService.extractFromFile(
        'user123/demo.mp4',
        'demo.mp4',
        'video/mp4',
        '/uploads/user123/demo.mp4'
      );

      // Step 2: Create processing job
      const job = processingPipeline.createJob(metadata.fileId, 'user123');

      // Step 3: Simulate processing stages
      const stages = [
        { progress: 10, step: 'Extracting metadata' },
        { progress: 30, step: 'Transcribing audio' },
        { progress: 50, step: 'Analyzing content' },
        { progress: 70, step: 'Generating platform content' },
        { progress: 90, step: 'Running safety checks' }
      ];

      for (const stage of stages) {
        processingPipeline.updateJob(job.jobId, {
          status: 'processing',
          progress: stage.progress,
          currentStep: stage.step
        });

        const updatedJob = processingPipeline.getJob(job.jobId);
        expect(updatedJob?.progress).toBe(stage.progress);
        expect(updatedJob?.currentStep).toBe(stage.step);
      }

      // Step 4: Complete job with results
      const results = {
        jobId: job.jobId,
        videoId: metadata.fileId,
        userId: 'user123',
        platforms: {} as any,
        viralScore: 75,
        analytics: {
          estimatedReach: 10000,
          estimatedEngagement: 500,
          contentQualityScore: 80,
          viralPotential: 75
        },
        viralAnalysis: {
          patterns: [],
          hooks: [],
          recommendations: []
        },
        contentFeedback: {
          overallScore: 80,
          grade: 'B',
          topStrengths: [],
          topWeaknesses: [],
          improvements: []
        },
        safetyCheck: {
          isSafe: true,
          violations: [],
          suggestions: []
        },
        generatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3600000).toISOString()
      };

      processingPipeline.completeJob(job.jobId, results);

      // Step 5: Verify completion
      const completedJob = processingPipeline.getJob(job.jobId);
      expect(completedJob?.status).toBe('completed');
      expect(completedJob?.progress).toBe(100);

      const cachedResults = processingPipeline.getResults(job.jobId);
      expect(cachedResults).toBeDefined();
      expect(cachedResults?.jobId).toBe(job.jobId);
    });

    it('should handle processing failures gracefully', async () => {
      const mockStats = {
        size: 10485760,
        birthtime: new Date()
      };

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.statSync as jest.Mock).mockReturnValue(mockStats);

      // Extract metadata
      const metadata = await videoMetadataService.extractFromFile(
        'user123/video.mp4',
        'video.mp4',
        'video/mp4',
        '/uploads/user123/video.mp4'
      );

      // Create job
      const job = processingPipeline.createJob(metadata.fileId, 'user123');

      // Simulate processing
      processingPipeline.updateJob(job.jobId, {
        status: 'processing',
        progress: 50,
        currentStep: 'Analyzing content'
      });

      // Simulate failure
      processingPipeline.failJob(job.jobId, 'Processing failed: No audio detected');

      // Verify failure state
      const failedJob = processingPipeline.getJob(job.jobId);
      expect(failedJob?.status).toBe('failed');
      expect(failedJob?.error).toBe('Processing failed: No audio detected');
      expect(failedJob?.completedAt).toBeDefined();
    });
  });

  describe('Metadata Validation', () => {
    it('should validate file before processing', async () => {
      // Valid file
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.statSync as jest.Mock).mockReturnValue({ size: 1024 });

      const isValid = await videoMetadataService.validateFile('/uploads/user123/video.mp4');
      expect(isValid).toBe(true);

      // Invalid file (empty)
      (fs.statSync as jest.Mock).mockReturnValue({ size: 0 });
      const isEmpty = await videoMetadataService.validateFile('/uploads/user123/empty.mp4');
      expect(isEmpty).toBe(false);

      // Non-existent file
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      const notExists = await videoMetadataService.validateFile('/uploads/user123/missing.mp4');
      expect(notExists).toBe(false);
    });

    it('should check audio presence', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      const hasAudio = await videoMetadataService.hasAudio('/uploads/user123/video.mp4');
      expect(hasAudio).toBe(true);

      (fs.existsSync as jest.Mock).mockReturnValue(false);
      const noFile = await videoMetadataService.hasAudio('/uploads/user123/missing.mp4');
      expect(noFile).toBe(false);
    });
  });
});
