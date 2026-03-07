/**
 * Platform Content Generator V2 Service Tests
 * Tests for upload-to-results flow platform content generation
 */

import { PlatformContentGeneratorV2 } from '../services/platform-content-generator-v2.service';
import { Platform, VideoMetadata } from '../types/upload-to-results';

describe('PlatformContentGeneratorV2', () => {
  let generator: PlatformContentGeneratorV2;
  let mockMetadata: VideoMetadata;
  let mockTranscript: string;
  let mockKeyPoints: string[];

  beforeEach(() => {
    generator = new PlatformContentGeneratorV2();
    
    mockMetadata = {
      fileId: 'test-file-id',
      fileName: 'test-video.mp4',
      mimeType: 'video/mp4',
      size: 1024000,
      duration: 180, // 3 minutes
      localPath: '/uploads/test/test-video.mp4',
      uploadedAt: new Date().toISOString()
    };

    mockTranscript = 'This is a test transcript about building amazing applications. ' +
      'We will cover key concepts and best practices. ' +
      'The goal is to help developers create better software.';

    mockKeyPoints = [
      'Building amazing applications',
      'Key concepts and best practices',
      'Helping developers create better software'
    ];
  });

  describe('generatePlatformContent', () => {
    it('should generate content for all 8 platforms', async () => {
      const platforms: Platform[] = [
        'youtube',
        'instagram',
        'tiktok',
        'linkedin',
        'twitter',
        'blog',
        'podcast',
        'analytics'
      ];

      const result = await generator.generatePlatformContent({
        transcript: mockTranscript,
        keyPoints: mockKeyPoints,
        metadata: mockMetadata,
        platforms
      });

      // Should have content for all 8 platforms
      expect(Object.keys(result)).toHaveLength(8);
      
      // Verify each platform has content
      platforms.forEach(platform => {
        expect(result[platform]).toBeDefined();
        expect(result[platform].platform).toBe(platform);
        expect(result[platform].content).toBeTruthy();
      });
    });

    it('should generate content in parallel using Promise.allSettled', async () => {
      const platforms: Platform[] = ['youtube', 'instagram', 'tiktok'];
      
      const startTime = Date.now();
      const result = await generator.generatePlatformContent({
        transcript: mockTranscript,
        keyPoints: mockKeyPoints,
        metadata: mockMetadata,
        platforms
      });
      const duration = Date.now() - startTime;

      // Should complete quickly (parallel execution)
      expect(duration).toBeLessThan(1000); // Less than 1 second
      expect(Object.keys(result)).toHaveLength(3);
    });

    it('should handle failures gracefully and continue generating other platforms', async () => {
      const platforms: Platform[] = ['youtube', 'instagram'];

      const result = await generator.generatePlatformContent({
        transcript: mockTranscript,
        keyPoints: mockKeyPoints,
        metadata: mockMetadata,
        platforms
      });

      // Should still return results for all platforms
      expect(Object.keys(result)).toHaveLength(2);
      expect(result.youtube).toBeDefined();
      expect(result.instagram).toBeDefined();
    });
  });

  describe('YouTube content generation', () => {
    it('should generate YouTube content with title, script, and timestamps', async () => {
      const result = await generator.generatePlatformContent({
        transcript: mockTranscript,
        keyPoints: mockKeyPoints,
        metadata: mockMetadata,
        platforms: ['youtube']
      });

      const youtube = result.youtube;
      expect(youtube.platform).toBe('youtube');
      expect(youtube.title).toBeTruthy();
      expect(youtube.content).toBeTruthy();
      expect(youtube.timestamps).toBeDefined();
      expect(youtube.timestamps!.length).toBeGreaterThan(0);
      expect(youtube.metadata).toBeDefined();
      expect(youtube.metadata!.description).toBeTruthy();
      expect(youtube.metadata!.tags).toBeDefined();
    });

    it('should generate SEO-optimized title', async () => {
      const result = await generator.generatePlatformContent({
        transcript: mockTranscript,
        keyPoints: mockKeyPoints,
        metadata: mockMetadata,
        platforms: ['youtube']
      });

      const youtube = result.youtube;
      expect(youtube.title).toBe('Building Amazing Applications');
      expect(youtube.title!.length).toBeLessThanOrEqual(100);
    });

    it('should generate timestamps based on video duration', async () => {
      const result = await generator.generatePlatformContent({
        transcript: mockTranscript,
        keyPoints: mockKeyPoints,
        metadata: mockMetadata,
        platforms: ['youtube']
      });

      const youtube = result.youtube;
      expect(youtube.timestamps).toBeDefined();
      expect(youtube.timestamps!.length).toBeGreaterThanOrEqual(3);
      expect(youtube.timestamps![0].time).toBe('0:00');
      expect(youtube.timestamps![0].text).toBe('Introduction');
    });
  });

  describe('Instagram content generation', () => {
    it('should generate Instagram content with caption and hashtags', async () => {
      const result = await generator.generatePlatformContent({
        transcript: mockTranscript,
        keyPoints: mockKeyPoints,
        metadata: mockMetadata,
        platforms: ['instagram']
      });

      const instagram = result.instagram;
      expect(instagram.platform).toBe('instagram');
      expect(instagram.content).toBeTruthy();
      expect(instagram.hashtags).toBeDefined();
      expect(instagram.hashtags!.length).toBeGreaterThan(0);
      expect(instagram.hashtags!.length).toBeLessThanOrEqual(30);
    });

    it('should generate 20-30 hashtags', async () => {
      const result = await generator.generatePlatformContent({
        transcript: mockTranscript,
        keyPoints: mockKeyPoints,
        metadata: mockMetadata,
        platforms: ['instagram']
      });

      const instagram = result.instagram;
      expect(instagram.hashtags!.length).toBeGreaterThanOrEqual(20);
      expect(instagram.hashtags!.length).toBeLessThanOrEqual(30);
    });
  });

  describe('TikTok content generation', () => {
    it('should generate TikTok content with short caption and hashtags', async () => {
      const result = await generator.generatePlatformContent({
        transcript: mockTranscript,
        keyPoints: mockKeyPoints,
        metadata: mockMetadata,
        platforms: ['tiktok']
      });

      const tiktok = result.tiktok;
      expect(tiktok.platform).toBe('tiktok');
      expect(tiktok.content).toBeTruthy();
      expect(tiktok.content.length).toBeLessThanOrEqual(150);
      expect(tiktok.hashtags).toBeDefined();
      expect(tiktok.hashtags).toContain('#FYP');
      expect(tiktok.hashtags).toContain('#ForYou');
    });
  });

  describe('LinkedIn content generation', () => {
    it('should generate LinkedIn content with professional post', async () => {
      const result = await generator.generatePlatformContent({
        transcript: mockTranscript,
        keyPoints: mockKeyPoints,
        metadata: mockMetadata,
        platforms: ['linkedin']
      });

      const linkedin = result.linkedin;
      expect(linkedin.platform).toBe('linkedin');
      expect(linkedin.title).toBeTruthy();
      expect(linkedin.content).toBeTruthy();
      expect(linkedin.hashtags).toBeDefined();
      expect(linkedin.hashtags!.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Twitter content generation', () => {
    it('should generate Twitter thread with multiple tweets', async () => {
      const result = await generator.generatePlatformContent({
        transcript: mockTranscript,
        keyPoints: mockKeyPoints,
        metadata: mockMetadata,
        platforms: ['twitter']
      });

      const twitter = result.twitter;
      expect(twitter.platform).toBe('twitter');
      expect(twitter.content).toBeTruthy();
      expect(twitter.metadata).toBeDefined();
      expect(twitter.metadata!.tweetCount).toBeGreaterThan(0);
    });

    it('should ensure each tweet is under 280 characters', async () => {
      const result = await generator.generatePlatformContent({
        transcript: mockTranscript,
        keyPoints: mockKeyPoints,
        metadata: mockMetadata,
        platforms: ['twitter']
      });

      const twitter = result.twitter;
      const tweets = twitter.content.split('\n\n');
      
      tweets.forEach(tweet => {
        expect(tweet.length).toBeLessThanOrEqual(280);
      });
    });
  });

  describe('Blog content generation', () => {
    it('should generate blog post with title and content', async () => {
      const result = await generator.generatePlatformContent({
        transcript: mockTranscript,
        keyPoints: mockKeyPoints,
        metadata: mockMetadata,
        platforms: ['blog']
      });

      const blog = result.blog;
      expect(blog.platform).toBe('blog');
      expect(blog.title).toBeTruthy();
      expect(blog.content).toBeTruthy();
      expect(blog.content).toContain('# ');
      expect(blog.content).toContain('## Introduction');
    });
  });

  describe('Podcast content generation', () => {
    it('should generate podcast script with intro, content, and outro', async () => {
      const result = await generator.generatePlatformContent({
        transcript: mockTranscript,
        keyPoints: mockKeyPoints,
        metadata: mockMetadata,
        platforms: ['podcast']
      });

      const podcast = result.podcast;
      expect(podcast.platform).toBe('podcast');
      expect(podcast.title).toBeTruthy();
      expect(podcast.script).toBeTruthy();
      expect(podcast.content).toBeTruthy();
      expect(podcast.content).toContain('INTRO');
      expect(podcast.content).toContain('OUTRO');
    });
  });

  describe('Analytics content generation', () => {
    it('should generate analytics with insights', async () => {
      const result = await generator.generatePlatformContent({
        transcript: mockTranscript,
        keyPoints: mockKeyPoints,
        metadata: mockMetadata,
        platforms: ['analytics']
      });

      const analytics = result.analytics;
      expect(analytics.platform).toBe('analytics');
      expect(analytics.content).toBeTruthy();
      
      const parsed = JSON.parse(analytics.content);
      expect(parsed.wordCount).toBeGreaterThan(0);
      expect(parsed.keyTopics).toBeDefined();
      expect(parsed.sentiment).toBeDefined();
      expect(parsed.readability).toBeDefined();
    });
  });

  describe('Platform content diversity', () => {
    it('should generate different content for different platforms', async () => {
      const platforms: Platform[] = ['youtube', 'instagram', 'tiktok'];
      
      const result = await generator.generatePlatformContent({
        transcript: mockTranscript,
        keyPoints: mockKeyPoints,
        metadata: mockMetadata,
        platforms
      });

      // Content should be different across platforms
      expect(result.youtube.content).not.toBe(result.instagram.content);
      expect(result.instagram.content).not.toBe(result.tiktok.content);
      expect(result.tiktok.content).not.toBe(result.youtube.content);
    });
  });
});
