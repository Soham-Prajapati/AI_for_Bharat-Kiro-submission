/**
 * Video Metadata Service Tests
 * 
 * Tests for video metadata extraction from local files and YouTube URLs
 */

import { VideoMetadataServiceClass } from '../services/video-metadata.service';
import { ProcessingError } from '../types/upload-to-results';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs module
jest.mock('fs');

describe('VideoMetadataService', () => {
  let service: VideoMetadataServiceClass;

  beforeEach(() => {
    service = new VideoMetadataServiceClass();
    jest.clearAllMocks();
  });

  describe('extractFromFile', () => {
    it('should extract metadata from a valid video file', async () => {
      // Mock file stats
      const mockStats = {
        size: 10485760, // 10 MB
        birthtime: new Date('2024-01-15T10:00:00Z')
      };

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.statSync as jest.Mock).mockReturnValue(mockStats);

      const result = await service.extractFromFile(
        'user123/video.mp4',
        'video.mp4',
        'video/mp4',
        '/uploads/user123/video.mp4'
      );

      expect(result).toMatchObject({
        fileId: 'user123/video.mp4',
        fileName: 'video.mp4',
        mimeType: 'video/mp4',
        size: 10485760,
        localPath: '/uploads/user123/video.mp4',
        uploadedAt: '2024-01-15T10:00:00.000Z'
      });

      expect(result.duration).toBeGreaterThan(0);
      expect(typeof result.duration).toBe('number');
    });

    it('should extract metadata from an audio file', async () => {
      const mockStats = {
        size: 5242880, // 5 MB
        birthtime: new Date('2024-01-15T10:00:00Z')
      };

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.statSync as jest.Mock).mockReturnValue(mockStats);

      const result = await service.extractFromFile(
        'user123/audio.mp3',
        'audio.mp3',
        'audio/mpeg',
        '/uploads/user123/audio.mp3'
      );

      expect(result).toMatchObject({
        fileId: 'user123/audio.mp3',
        fileName: 'audio.mp3',
        mimeType: 'audio/mpeg',
        size: 5242880
      });

      expect(result.duration).toBeGreaterThan(0);
    });

    it('should throw ProcessingError when file does not exist', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await expect(
        service.extractFromFile(
          'user123/missing.mp4',
          'missing.mp4',
          'video/mp4',
          '/uploads/user123/missing.mp4'
        )
      ).rejects.toThrow(ProcessingError);

      await expect(
        service.extractFromFile(
          'user123/missing.mp4',
          'missing.mp4',
          'video/mp4',
          '/uploads/user123/missing.mp4'
        )
      ).rejects.toThrow('File not found');
    });

    it('should throw ProcessingError when fs.statSync fails', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.statSync as jest.Mock).mockImplementation(() => {
        throw new Error('Permission denied');
      });

      await expect(
        service.extractFromFile(
          'user123/video.mp4',
          'video.mp4',
          'video/mp4',
          '/uploads/user123/video.mp4'
        )
      ).rejects.toThrow(ProcessingError);
    });

    it('should handle different video mime types', async () => {
      const mockStats = {
        size: 10485760,
        birthtime: new Date()
      };

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.statSync as jest.Mock).mockReturnValue(mockStats);

      const mimeTypes = [
        'video/mp4',
        'video/quicktime',
        'video/x-msvideo',
        'video/webm'
      ];

      for (const mimeType of mimeTypes) {
        const result = await service.extractFromFile(
          'user123/video',
          'video',
          mimeType,
          '/uploads/user123/video'
        );

        expect(result.mimeType).toBe(mimeType);
        expect(result.duration).toBeGreaterThan(0);
      }
    });

    it('should handle different audio mime types', async () => {
      const mockStats = {
        size: 5242880,
        birthtime: new Date()
      };

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.statSync as jest.Mock).mockReturnValue(mockStats);

      const mimeTypes = [
        'audio/mpeg',
        'audio/wav',
        'audio/x-m4a'
      ];

      for (const mimeType of mimeTypes) {
        const result = await service.extractFromFile(
          'user123/audio',
          'audio',
          mimeType,
          '/uploads/user123/audio'
        );

        expect(result.mimeType).toBe(mimeType);
        expect(result.duration).toBeGreaterThan(0);
      }
    });
  });

  describe('extractFromYouTubeUrl', () => {
    it('should extract metadata from youtube.com URL', async () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

      const result = await service.extractFromYouTubeUrl(url);

      expect(result).toMatchObject({
        title: expect.stringContaining('dQw4w9WgXcQ'),
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
      });

      expect(result.duration).toBeGreaterThan(0);
      expect(result.duration).toBeLessThanOrEqual(600);
    });

    it('should extract metadata from youtu.be URL', async () => {
      const url = 'https://youtu.be/dQw4w9WgXcQ';

      const result = await service.extractFromYouTubeUrl(url);

      expect(result).toMatchObject({
        title: expect.stringContaining('dQw4w9WgXcQ'),
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
      });

      expect(result.duration).toBeGreaterThan(0);
    });

    it('should handle youtube.com URL without www', async () => {
      const url = 'https://youtube.com/watch?v=abc123';

      const result = await service.extractFromYouTubeUrl(url);

      expect(result.title).toContain('abc123');
      expect(result.thumbnail).toContain('abc123');
    });

    it('should handle youtube.com URL with additional query parameters', async () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s&list=PLxyz';

      const result = await service.extractFromYouTubeUrl(url);

      expect(result.title).toContain('dQw4w9WgXcQ');
      expect(result.thumbnail).toContain('dQw4w9WgXcQ');
    });

    it('should throw ProcessingError for invalid YouTube URL', async () => {
      const invalidUrls = [
        'https://vimeo.com/123456',
        'https://example.com/video',
        'not-a-url',
        'https://youtube.com/invalid',
        'https://www.youtube.com/channel/UCxyz'
      ];

      for (const url of invalidUrls) {
        await expect(
          service.extractFromYouTubeUrl(url)
        ).rejects.toThrow(ProcessingError);
      }
    });

    it('should throw ProcessingError when video ID cannot be extracted', async () => {
      const url = 'https://www.youtube.com/watch?';

      await expect(
        service.extractFromYouTubeUrl(url)
      ).rejects.toThrow(ProcessingError);
    });
  });

  describe('hasAudio', () => {
    it('should return true for existing files', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      const result = await service.hasAudio('/uploads/user123/video.mp4');

      expect(result).toBe(true);
    });

    it('should return false for non-existent files', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const result = await service.hasAudio('/uploads/user123/missing.mp4');

      expect(result).toBe(false);
    });

    it('should return false when fs.existsSync throws error', async () => {
      (fs.existsSync as jest.Mock).mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const result = await service.hasAudio('/uploads/user123/video.mp4');

      expect(result).toBe(false);
    });
  });

  describe('validateFile', () => {
    it('should return true for valid files', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.statSync as jest.Mock).mockReturnValue({ size: 1024 });

      const result = await service.validateFile('/uploads/user123/video.mp4');

      expect(result).toBe(true);
    });

    it('should return false for non-existent files', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const result = await service.validateFile('/uploads/user123/missing.mp4');

      expect(result).toBe(false);
    });

    it('should return false for empty files', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.statSync as jest.Mock).mockReturnValue({ size: 0 });

      const result = await service.validateFile('/uploads/user123/empty.mp4');

      expect(result).toBe(false);
    });

    it('should return false when fs.statSync throws error', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.statSync as jest.Mock).mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const result = await service.validateFile('/uploads/user123/video.mp4');

      expect(result).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large files', async () => {
      const mockStats = {
        size: 100 * 1024 * 1024, // 100 MB
        birthtime: new Date()
      };

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.statSync as jest.Mock).mockReturnValue(mockStats);

      const result = await service.extractFromFile(
        'user123/large.mp4',
        'large.mp4',
        'video/mp4',
        '/uploads/user123/large.mp4'
      );

      expect(result.size).toBe(100 * 1024 * 1024);
      expect(result.duration).toBeGreaterThan(0);
    });

    it('should handle very small files', async () => {
      const mockStats = {
        size: 1024, // 1 KB
        birthtime: new Date()
      };

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.statSync as jest.Mock).mockReturnValue(mockStats);

      const result = await service.extractFromFile(
        'user123/small.mp4',
        'small.mp4',
        'video/mp4',
        '/uploads/user123/small.mp4'
      );

      expect(result.size).toBe(1024);
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });

    it('should handle special characters in file paths', async () => {
      const mockStats = {
        size: 10485760,
        birthtime: new Date()
      };

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.statSync as jest.Mock).mockReturnValue(mockStats);

      const result = await service.extractFromFile(
        'user123/video (1) [final].mp4',
        'video (1) [final].mp4',
        'video/mp4',
        '/uploads/user123/video (1) [final].mp4'
      );

      expect(result.fileName).toBe('video (1) [final].mp4');
    });
  });
});
