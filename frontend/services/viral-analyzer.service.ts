/**
 * Viral Analyzer Service
 * Service layer for viral content analysis
 * Handles validation, API communication, and business logic
 */

import apiClient from './api';
import {
  AnalyzeViralRequest,
  AnalyzeViralResponse,
  ViralAnalysis,
} from '@/types/viral-analyzer';
import { ApiError } from '@/types/api';

/**
 * Service class for viral content analysis
 */
export class ViralAnalyzerService {
  /**
   * Analyze viral content from a video URL
   * @param videoUrl - URL of the video to analyze
   * @returns Promise resolving to analysis results
   * @throws {ApiError} If the request fails or URL is invalid
   */
  static async analyzeVideo(videoUrl: string): Promise<AnalyzeViralResponse> {
    // Validate URL format
    if (!this.isValidVideoUrl(videoUrl)) {
      throw new ApiError('Invalid video URL format', 400, 'INVALID_URL', {
        url: videoUrl,
      });
    }

    // Build request with metadata
    const request: AnalyzeViralRequest = {
      videoUrl: this.normalizeUrl(videoUrl),
      metadata: {
        platform: this.detectPlatform(videoUrl),
      },
    };

    // Make API request
    const response = await apiClient.viralAnalyzer.analyze(request);

    // Validate response
    this.validateResponse(response);

    return response;
  }

  /**
   * Validate video URL format
   * @param url - URL to validate
   * @returns True if URL is valid
   */
  private static isValidVideoUrl(url: string): boolean {
    if (!url || typeof url !== 'string') {
      return false;
    }

    const trimmed = url.trim();
    if (trimmed.length === 0) {
      return false;
    }

    try {
      const urlObj = new URL(trimmed);
      // Only allow http and https protocols
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  /**
   * Normalize URL (trim whitespace, ensure protocol)
   * @param url - URL to normalize
   * @returns Normalized URL
   */
  private static normalizeUrl(url: string): string {
    let normalized = url.trim();

    // Add https:// if no protocol specified
    if (!normalized.match(/^https?:\/\//i)) {
      normalized = `https://${normalized}`;
    }

    return normalized;
  }

  /**
   * Detect platform from URL
   * @param url - Video URL
   * @returns Platform name or undefined
   */
  private static detectPlatform(url: string): string | undefined {
    const urlLower = url.toLowerCase();

    if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
      return 'youtube';
    }

    if (urlLower.includes('tiktok.com')) {
      return 'tiktok';
    }

    if (urlLower.includes('instagram.com')) {
      return 'instagram';
    }

    if (urlLower.includes('facebook.com') || urlLower.includes('fb.watch')) {
      return 'facebook';
    }

    if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) {
      return 'twitter';
    }

    if (urlLower.includes('vimeo.com')) {
      return 'vimeo';
    }

    return undefined;
  }

  /**
   * Validate API response structure
   * @param response - Response to validate
   * @throws {ApiError} If response is invalid
   */
  private static validateResponse(response: AnalyzeViralResponse): void {
    if (!response) {
      throw new ApiError(
        'Empty response from server',
        500,
        'INVALID_RESPONSE'
      );
    }

    // Check for error in response
    if (response.error) {
      throw new ApiError(
        response.error,
        400,
        'ANALYSIS_ERROR',
        { response }
      );
    }

    // Validate required fields
    const requiredFields: (keyof ViralAnalysis)[] = [
      'videoUrl',
      'viralScore',
      'patterns',
      'hooks',
      'guide',
    ];

    for (const field of requiredFields) {
      if (!(field in response)) {
        throw new ApiError(
          `Missing required field: ${field}`,
          500,
          'INVALID_RESPONSE',
          { response }
        );
      }
    }

    // Validate viral score range
    if (
      typeof response.viralScore !== 'number' ||
      response.viralScore < 0 ||
      response.viralScore > 100
    ) {
      throw new ApiError(
        'Invalid viral score',
        500,
        'INVALID_RESPONSE',
        { viralScore: response.viralScore }
      );
    }

    // Validate arrays
    if (!Array.isArray(response.patterns)) {
      throw new ApiError(
        'Invalid patterns data',
        500,
        'INVALID_RESPONSE'
      );
    }

    if (!Array.isArray(response.hooks)) {
      throw new ApiError(
        'Invalid hooks data',
        500,
        'INVALID_RESPONSE'
      );
    }
  }

  /**
   * Extract video ID from URL (platform-specific)
   * @param url - Video URL
   * @returns Video ID or null
   */
  static extractVideoId(url: string): string | null {
    try {
      const urlObj = new URL(url);

      // YouTube
      if (urlObj.hostname.includes('youtube.com')) {
        return urlObj.searchParams.get('v');
      }

      if (urlObj.hostname.includes('youtu.be')) {
        return urlObj.pathname.slice(1);
      }

      // TikTok
      if (urlObj.hostname.includes('tiktok.com')) {
        const match = urlObj.pathname.match(/\/video\/(\d+)/);
        return match ? match[1] : null;
      }

      // Instagram
      if (urlObj.hostname.includes('instagram.com')) {
        const match = urlObj.pathname.match(/\/(p|reel)\/([^/]+)/);
        return match ? match[2] : null;
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Get platform display name
   * @param platform - Platform identifier
   * @returns Display name
   */
  static getPlatformDisplayName(platform?: string): string {
    if (!platform) return 'Unknown';

    const displayNames: Record<string, string> = {
      youtube: 'YouTube',
      tiktok: 'TikTok',
      instagram: 'Instagram',
      facebook: 'Facebook',
      twitter: 'Twitter',
      vimeo: 'Vimeo',
    };

    return displayNames[platform.toLowerCase()] || platform;
  }

  /**
   * Format timestamp for display
   * @param timestamp - Timestamp string (MM:SS or HH:MM:SS)
   * @returns Formatted timestamp
   */
  static formatTimestamp(timestamp: string): string {
    // Already formatted
    if (timestamp.match(/^\d{1,2}:\d{2}(:\d{2})?$/)) {
      return timestamp;
    }

    // Convert seconds to MM:SS
    const seconds = parseInt(timestamp, 10);
    if (!isNaN(seconds)) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    return timestamp;
  }

  /**
   * Convert timestamp to seconds
   * @param timestamp - Timestamp string (MM:SS or HH:MM:SS)
   * @returns Seconds
   */
  static timestampToSeconds(timestamp: string): number {
    const parts = timestamp.split(':').map((p) => parseInt(p, 10));

    if (parts.length === 2) {
      // MM:SS
      return parts[0] * 60 + parts[1];
    }

    if (parts.length === 3) {
      // HH:MM:SS
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }

    return 0;
  }

  /**
   * Calculate pattern strength category
   * @param strength - Strength value (0-1)
   * @returns Category label
   */
  static getStrengthCategory(strength: number): 'weak' | 'moderate' | 'strong' {
    if (strength >= 0.7) return 'strong';
    if (strength >= 0.4) return 'moderate';
    return 'weak';
  }

  /**
   * Get color for viral score
   * @param score - Viral score (0-100)
   * @returns Color class or hex code
   */
  static getScoreColor(score: number): string {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#3b82f6'; // blue
    if (score >= 40) return '#f59e0b'; // amber
    return '#ef4444'; // red
  }

  /**
   * Sort patterns by strength (descending)
   * @param patterns - Array of patterns
   * @returns Sorted patterns
   */
  static sortPatternsByStrength(patterns: any[]): any[] {
    return [...patterns].sort((a, b) => b.strength - a.strength);
  }

  /**
   * Sort hooks by timestamp (ascending)
   * @param hooks - Array of hooks
   * @returns Sorted hooks
   */
  static sortHooksByTimestamp(hooks: any[]): any[] {
    return [...hooks].sort((a, b) => {
      const aSeconds = this.timestampToSeconds(a.timestamp);
      const bSeconds = this.timestampToSeconds(b.timestamp);
      return aSeconds - bSeconds;
    });
  }
}

export default ViralAnalyzerService;
