/**
 * Viral Analyzer Cache Utility
 * Implements session-based caching for analysis results
 */

import { AnalyzeViralResponse, CacheEntry } from '@/types/viral-analyzer';

/**
 * Cache manager for viral analysis results
 */
export class ViralAnalyzerCache {
  private static readonly STORAGE_KEY = 'viral_analyzer_cache';
  private static readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
  private static readonly MAX_CACHE_SIZE = 50; // Maximum number of cached entries

  /**
   * Get cached analysis result
   * @param videoUrl - Video URL key
   * @returns Cached result or null if not found/expired
   */
  static get(videoUrl: string): AnalyzeViralResponse | null {
    try {
      const cache = this.getCache();
      const normalizedUrl = this.normalizeUrl(videoUrl);
      const entry = cache[normalizedUrl];

      if (!entry) {
        return null;
      }

      // Check if expired
      const isExpired = Date.now() - entry.timestamp > this.CACHE_DURATION;
      if (isExpired) {
        this.remove(normalizedUrl);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.warn('Failed to retrieve from cache:', error);
      return null;
    }
  }

  /**
   * Set cached analysis result
   * @param videoUrl - Video URL key
   * @param data - Analysis result to cache
   */
  static set(videoUrl: string, data: AnalyzeViralResponse): void {
    try {
      const cache = this.getCache();
      const normalizedUrl = this.normalizeUrl(videoUrl);

      // Add new entry
      cache[normalizedUrl] = {
        data,
        timestamp: Date.now(),
      };

      // Enforce cache size limit
      this.enforceCacheLimit(cache);

      // Save to storage
      this.saveCache(cache);
    } catch (error) {
      console.warn('Failed to save to cache:', error);
      // Storage quota exceeded or unavailable - fail silently
    }
  }

  /**
   * Remove cached entry
   * @param videoUrl - Video URL key
   */
  static remove(videoUrl: string): void {
    try {
      const cache = this.getCache();
      const normalizedUrl = this.normalizeUrl(videoUrl);
      delete cache[normalizedUrl];
      this.saveCache(cache);
    } catch (error) {
      console.warn('Failed to remove from cache:', error);
    }
  }

  /**
   * Clear all cached entries
   */
  static clear(): void {
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(this.STORAGE_KEY);
      }
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  /**
   * Get all cached entries
   * @returns Cache object
   */
  private static getCache(): Record<string, CacheEntry> {
    try {
      if (typeof sessionStorage === 'undefined') {
        return {};
      }

      const cached = sessionStorage.getItem(this.STORAGE_KEY);
      if (!cached) {
        return {};
      }

      const parsed = JSON.parse(cached);
      
      // Validate cache structure
      if (typeof parsed !== 'object' || parsed === null) {
        return {};
      }

      return parsed;
    } catch (error) {
      console.warn('Failed to parse cache:', error);
      return {};
    }
  }

  /**
   * Save cache to storage
   * @param cache - Cache object to save
   */
  private static saveCache(cache: Record<string, CacheEntry>): void {
    if (typeof sessionStorage === 'undefined') {
      return;
    }

    try {
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(cache));
    } catch (error) {
      // Storage quota exceeded - try to clear old entries
      this.clearOldEntries(cache);
      try {
        sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(cache));
      } catch {
        // Still failing - clear entire cache
        this.clear();
      }
    }
  }

  /**
   * Enforce cache size limit by removing oldest entries
   * @param cache - Cache object
   */
  private static enforceCacheLimit(cache: Record<string, CacheEntry>): void {
    const entries = Object.entries(cache);
    
    if (entries.length <= this.MAX_CACHE_SIZE) {
      return;
    }

    // Sort by timestamp (oldest first)
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

    // Remove oldest entries
    const toRemove = entries.length - this.MAX_CACHE_SIZE;
    for (let i = 0; i < toRemove; i++) {
      delete cache[entries[i][0]];
    }
  }

  /**
   * Clear expired entries from cache
   * @param cache - Cache object
   */
  private static clearOldEntries(cache: Record<string, CacheEntry>): void {
    const now = Date.now();
    const entries = Object.entries(cache);

    for (const [url, entry] of entries) {
      if (now - entry.timestamp > this.CACHE_DURATION) {
        delete cache[url];
      }
    }
  }

  /**
   * Normalize URL for consistent cache keys
   * @param url - URL to normalize
   * @returns Normalized URL
   */
  private static normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      // Remove trailing slashes and normalize protocol
      return urlObj.href.toLowerCase().replace(/\/$/, '');
    } catch {
      // Invalid URL - return as-is
      return url.toLowerCase().trim();
    }
  }

  /**
   * Get cache statistics
   * @returns Cache stats
   */
  static getStats(): {
    size: number;
    oldestEntry: number | null;
    newestEntry: number | null;
  } {
    try {
      const cache = this.getCache();
      const entries = Object.values(cache);

      if (entries.length === 0) {
        return {
          size: 0,
          oldestEntry: null,
          newestEntry: null,
        };
      }

      const timestamps = entries.map((e) => e.timestamp);
      
      return {
        size: entries.length,
        oldestEntry: Math.min(...timestamps),
        newestEntry: Math.max(...timestamps),
      };
    } catch {
      return {
        size: 0,
        oldestEntry: null,
        newestEntry: null,
      };
    }
  }

  /**
   * Check if caching is available
   * @returns True if sessionStorage is available
   */
  static isAvailable(): boolean {
    try {
      if (typeof sessionStorage === 'undefined') {
        return false;
      }

      // Test storage
      const testKey = '__cache_test__';
      sessionStorage.setItem(testKey, 'test');
      sessionStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }
}

export default ViralAnalyzerCache;
