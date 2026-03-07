/**
 * Video Metadata Extraction Service
 * 
 * Extracts metadata from uploaded video/audio files and YouTube URLs.
 * For local files: extracts duration, file size, mime type
 * For YouTube URLs: extracts title, duration, thumbnail
 * 
 * Note: This is a mock implementation for demo purposes.
 * In production, use ffprobe/ffmpeg for real video analysis.
 */

import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../utils/logger';
import {
  VideoMetadata,
  YouTubeMetadata,
  ProcessingError
} from '../types/upload-to-results';

/**
 * VideoMetadataService class
 * Handles metadata extraction for both local files and YouTube URLs
 */
export class VideoMetadataService {
  /**
   * Extract metadata from a local video/audio file
   * @param fileId - The file ID (path key)
   * @param fileName - Original filename
   * @param mimeType - MIME type of the file
   * @param localPath - Local filesystem path to the file
   * @returns VideoMetadata object with extracted information
   */
  async extractFromFile(
    fileId: string,
    fileName: string,
    mimeType: string,
    localPath: string
  ): Promise<VideoMetadata> {
    try {
      logger.info('Extracting metadata from local file', {
        fileId,
        fileName,
        mimeType,
        localPath
      });

      // Check if file exists
      if (!fs.existsSync(localPath)) {
        throw new ProcessingError(
          `File not found at path: ${localPath}`,
          'CORRUPTED_FILE'
        );
      }

      // Get file stats
      const stats = fs.statSync(localPath);
      const size = stats.size;

      // Extract duration (mock implementation)
      // In production: use ffprobe to get real duration
      const duration = this.estimateDuration(size, mimeType);

      const metadata: VideoMetadata = {
        fileId,
        fileName,
        mimeType,
        size,
        duration,
        localPath,
        uploadedAt: stats.birthtime.toISOString()
      };

      logger.info('Metadata extracted successfully', {
        fileId,
        duration,
        size
      });

      return metadata;
    } catch (error) {
      logger.error('Failed to extract metadata from file', {
        fileId,
        error: error instanceof Error ? error.message : String(error)
      });

      if (error instanceof ProcessingError) {
        throw error;
      }

      throw new ProcessingError(
        'Failed to extract video metadata',
        'CORRUPTED_FILE'
      );
    }
  }

  /**
   * Extract metadata from a YouTube URL
   * @param url - YouTube video URL
   * @returns YouTubeMetadata object with video information
   */
  async extractFromYouTubeUrl(url: string): Promise<YouTubeMetadata> {
    try {
      logger.info('Extracting metadata from YouTube URL', { url });

      // Validate YouTube URL format
      if (!this.isValidYouTubeUrl(url)) {
        throw new ProcessingError(
          'Invalid YouTube URL format',
          'CORRUPTED_FILE'
        );
      }

      // Extract video ID from URL
      const videoId = this.extractYouTubeVideoId(url);

      if (!videoId) {
        throw new ProcessingError(
          'Could not extract video ID from URL',
          'CORRUPTED_FILE'
        );
      }

      // Mock metadata extraction
      // In production: use YouTube Data API v3 to get real metadata
      const metadata: YouTubeMetadata = {
        title: `YouTube Video ${videoId}`,
        duration: this.generateMockDuration(),
        thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
      };

      logger.info('YouTube metadata extracted successfully', {
        videoId,
        title: metadata.title,
        duration: metadata.duration
      });

      return metadata;
    } catch (error) {
      logger.error('Failed to extract YouTube metadata', {
        url,
        error: error instanceof Error ? error.message : String(error)
      });

      if (error instanceof ProcessingError) {
        throw error;
      }

      throw new ProcessingError(
        'Failed to extract YouTube metadata',
        'CORRUPTED_FILE'
      );
    }
  }

  /**
   * Validate YouTube URL format
   * @param url - URL to validate
   * @returns true if valid YouTube URL
   */
  private isValidYouTubeUrl(url: string): boolean {
    const patterns = [
      /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
      /^https?:\/\/youtu\.be\/[\w-]+/
    ];

    return patterns.some(pattern => pattern.test(url));
  }

  /**
   * Extract video ID from YouTube URL
   * @param url - YouTube URL
   * @returns Video ID or null
   */
  private extractYouTubeVideoId(url: string): string | null {
    // Pattern 1: youtube.com/watch?v=VIDEO_ID
    const match1 = url.match(/[?&]v=([^&]+)/);
    if (match1) {
      return match1[1];
    }

    // Pattern 2: youtu.be/VIDEO_ID
    const match2 = url.match(/youtu\.be\/([^?]+)/);
    if (match2) {
      return match2[1];
    }

    return null;
  }

  /**
   * Estimate video duration based on file size and mime type
   * This is a mock implementation for demo purposes
   * In production: use ffprobe to get accurate duration
   * 
   * @param size - File size in bytes
   * @param mimeType - MIME type of the file
   * @returns Estimated duration in seconds
   */
  private estimateDuration(size: number, mimeType: string): number {
    // Mock estimation based on typical bitrates
    // Video: ~2 Mbps average, Audio: ~128 kbps average
    
    const isVideo = mimeType.startsWith('video/');
    const isAudio = mimeType.startsWith('audio/');

    if (isVideo) {
      // Assume 2 Mbps (250 KB/s) for video
      const bytesPerSecond = 250 * 1024;
      return Math.round(size / bytesPerSecond);
    } else if (isAudio) {
      // Assume 128 kbps (16 KB/s) for audio
      const bytesPerSecond = 16 * 1024;
      return Math.round(size / bytesPerSecond);
    }

    // Default: assume video
    return Math.round(size / (250 * 1024));
  }

  /**
   * Generate a mock duration for YouTube videos
   * Returns a random duration between 60 and 600 seconds (1-10 minutes)
   */
  private generateMockDuration(): number {
    return Math.floor(Math.random() * (600 - 60 + 1)) + 60;
  }

  /**
   * Check if a file has audio
   * This is a mock implementation
   * In production: use ffprobe to detect audio streams
   * 
   * @param localPath - Path to the file
   * @returns true if file has audio
   */
  async hasAudio(localPath: string): Promise<boolean> {
    try {
      // Check if file exists
      if (!fs.existsSync(localPath)) {
        return false;
      }

      // Mock implementation: assume all files have audio
      // In production: use ffprobe to check for audio streams
      return true;
    } catch (error) {
      logger.error('Failed to check audio presence', {
        localPath,
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }

  /**
   * Validate file integrity
   * This is a mock implementation
   * In production: use ffprobe to validate file structure
   * 
   * @param localPath - Path to the file
   * @returns true if file is valid
   */
  async validateFile(localPath: string): Promise<boolean> {
    try {
      // Check if file exists
      if (!fs.existsSync(localPath)) {
        return false;
      }

      // Check if file is readable
      const stats = fs.statSync(localPath);
      
      // Check if file has content
      if (stats.size === 0) {
        return false;
      }

      // Mock implementation: assume all non-empty files are valid
      // In production: use ffprobe to validate file structure
      return true;
    } catch (error) {
      logger.error('Failed to validate file', {
        localPath,
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }
}

// Export singleton instance
export const videoMetadataService = new VideoMetadataService();

// Export class for testing
export { VideoMetadataService as VideoMetadataServiceClass };
