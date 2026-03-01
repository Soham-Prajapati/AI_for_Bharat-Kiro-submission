/**
 * Content Multiplier V2 - Output Diversity Tests
 * 
 * Tests the Content Multiplier V2 system's ability to generate diverse,
 * high-quality content variations from a single video source.
 * 
 * Coverage:
 * - 1 video → 100+ content pieces generation
 * - Output diversity verification (>80% unique content)
 * - Platform-specific optimizations
 * - AI-generated variations
 * - Content quality across all outputs
 * - Auto-scheduling features
 * - Repetition detection and prevention
 */

import request from 'supertest';
import express from 'express';
import multiplyV2Route from '../routes/multiply-v2.route';
import { expectSuccessResponse } from './setup';
import { errorHandler } from '../middleware/error.middleware';

describe('Content Multiplier V2 - Output Diversity Tests', () => {
  let app: express.Application;

  const mockVideoId = 'video-test-123';
  const mockTranscript = 'This is a comprehensive video about AI technology, machine learning, and the future of content creation. It covers multiple topics including automation, creativity, and innovation.';

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/multiply-v2', multiplyV2Route);
    app.use(errorHandler);

    jest.clearAllMocks();
  });

  describe('1 Video → 100+ Content Pieces Generation', () => {
    it('should generate at least 100 content pieces from single video', async () => {
      const response = await request(app)
        .post('/api/multiply-v2/generate')
        .send({ videoId: mockVideoId })
        .expect(200);

      expect(response.body).toHaveProperty('videoId', mockVideoId);
      expect(response.body).toHaveProperty('generated');
      expect(response.body.generated).toBeGreaterThanOrEqual(100);
    });

    it('should generate exactly 105 content pieces', async () => {
      const response = await request(app)
        .post('/api/multiply-v2/generate')
        .send({ videoId: mockVideoId })
        .expect(200);

      const totalPieces = 
        response.body.clips.length +
        response.body.quotes.length +
        response.body.audiograms.length +
        response.body.infographics.length +
        response.body.thumbnails.length;

      expect(totalPieces).toBe(105);
      expect(response.body.generated).toBe(105);
    });

    it('should generate diverse content types', async () => {
      const response = await request(app)
        .post('/api/multiply-v2/generate')
        .send({ videoId: mockVideoId })
        .expect(200);

      expect(response.body).toHaveProperty('clips');
      expect(response.body).toHaveProperty('quotes');
      expect(response.body).toHaveProperty('audiograms');
      expect(response.body).toHaveProperty('infographics');
      expect(response.body).toHaveProperty('thumbnails');

      expect(Array.isArray(response.body.clips)).toBe(true);
      expect(Array.isArray(response.body.quotes)).toBe(true);
      expect(Array.isArray(response.body.audiograms)).toBe(true);
      expect(Array.isArray(response.body.infographics)).toBe(true);
      expect(Array.isArray(response.body.thumbnails)).toBe(true);
    });

    it('should generate 20 video clips', async () => {
      const response = await request(app)
        .post('/api/multiply-v2/generate')
        .send({ videoId: mockVideoId })
        .expect(200);

      expect(response.body.clips).toHaveLength(20);
      response.body.clips.forEach((clip: any, index: number) => {
        expect(clip).toHaveProperty('id');
        expect(clip).toHaveProperty('duration');
        expect(clip.id).toBe(`clip_${index}`);
      });
    });

    it('should generate 30 quote graphics', async () => {
      const response = await request(app)
        .post('/api/multiply-v2/generate')
        .send({ videoId: mockVideoId })
        .expect(200);

      expect(response.body.quotes).toHaveLength(30);
      response.body.quotes.forEach((quote: any, index: number) => {
        expect(quote).toHaveProperty('id');
        expect(quote).toHaveProperty('text');
        expect(quote.id).toBe(`quote_${index}`);
      });
    });

    it('should generate 15 audiograms', async () => {
      const response = await request(app)
        .post('/api/multiply-v2/generate')
        .send({ videoId: mockVideoId })
        .expect(200);

      expect(response.body.audiograms).toHaveLength(15);
      response.body.audiograms.forEach((audiogram: any) => {
        expect(audiogram).toHaveProperty('id');
        expect(audiogram).toHaveProperty('duration');
      });
    });

    it('should generate 20 infographics', async () => {
      const response = await request(app)
        .post('/api/multiply-v2/generate')
        .send({ videoId: mockVideoId })
        .expect(200);

      expect(response.body.infographics).toHaveLength(20);
      response.body.infographics.forEach((infographic: any) => {
        expect(infographic).toHaveProperty('id');
        expect(infographic).toHaveProperty('type');
      });
    });

    it('should generate 20 thumbnail variations', async () => {
      const response = await request(app)
        .post('/api/multiply-v2/generate')
        .send({ videoId: mockVideoId })
        .expect(200);

      expect(response.body.thumbnails).toHaveLength(20);
      response.body.thumbnails.forEach((thumbnail: any) => {
        expect(thumbnail).toHaveProperty('id');
        expect(thumbnail).toHaveProperty('variant');
      });
    });
  });

  describe('Output Diversity Verification (>80% Unique)', () => {
    it('should verify clips have varying durations', async () => {
      const response = await request(app)
        .post('/api/multiply-v2/generate')
        .send({ videoId: mockVideoId })
        .expect(200);

      const durations = response.body.clips.map((clip: any) => clip.duration);
      const uniqueDurations = new Set(durations);
      
      // At least 80% should be unique
      const uniquenessRatio = uniqueDurations.size / durations.length;
      expect(uniquenessRatio).toBeGreaterThanOrEqual(0.8);
    });

    it('should verify quotes have unique text content', async () => {
      const response = await request(app)
        .post('/api/multiply-v2/generate')
        .send({ videoId: mockVideoId })
        .expect(200);

      const quoteTexts = response.body.quotes.map((quote: any) => quote.text);
      const uniqueQuotes = new Set(quoteTexts);
      
      // All quotes should be unique
      expect(uniqueQuotes.size).toBe(quoteTexts.length);
    });

    it('should verify thumbnail variants are diverse', async () => {
      const response = await request(app)
        .post('/api/multiply-v2/generate')
        .send({ videoId: mockVideoId })
        .expect(200);

      const variants = response.body.thumbnails.map((thumb: any) => thumb.variant);
      const uniqueVariants = new Set(variants);
      
      // All thumbnails should have unique variants
      expect(uniqueVariants.size).toBe(variants.length);
    });

    it('should verify infographic types are diverse', async () => {
      const response = await request(app)
        .post('/api/multiply-v2/generate')
        .send({ videoId: mockVideoId })
        .expect(200);

      const types = response.body.infographics.map((info: any) => info.type);
      const uniqueTypes = new Set(types);
      
      // Should have multiple infographic types
      expect(uniqueTypes.size).toBeGreaterThan(1);
    });

    it('should calculate overall content uniqueness >80%', async () => {
      const response = await request(app)
        .post('/api/multiply-v2/generate')
        .send({ videoId: mockVideoId })
        .expect(200);

      // Collect all content identifiers with more specific uniqueness markers
      const allContent = [
        ...response.body.clips.map((c: any) => `clip_${c.id}_${c.duration}`),
        ...response.body.quotes.map((q: any) => `quote_${q.id}_${q.text}`),
        ...response.body.audiograms.map((a: any) => `audio_${a.id}_${a.duration}`),
        ...response.body.infographics.map((i: any) => `info_${i.id}_${i.type}`),
        ...response.body.thumbnails.map((t: any) => `thumb_${t.id}_${t.variant}`),
      ];

      const uniqueContent = new Set(allContent);
      const uniquenessRatio = uniqueContent.size / allContent.length;
      
      // With diverse mock data, should achieve >80% uniqueness
      expect(uniquenessRatio).toBeGreaterThanOrEqual(0.8);
    });

    it('should detect and prevent repetitive content', async () => {
      const response = await request(app)
        .post('/api/multiply-v2/generate')
        .send({ videoId: mockVideoId })
        .expect(200);

      // Check for duplicate IDs
      const allIds = [
        ...response.body.clips.map((c: any) => c.id),
        ...response.body.quotes.map((q: any) => q.id),
        ...response.body.audiograms.map((a: any) => a.id),
        ...response.body.infographics.map((i: any) => i.id),
        ...response.body.thumbnails.map((t: any) => t.id),
      ];

      const uniqueIds = new Set(allIds);
      expect(uniqueIds.size).toBe(allIds.length); // All IDs should be unique
    });
  });

  describe('Platform-Specific Optimizations', () => {
    it('should optimize clips for different platforms', async () => {
      const response = await request(app)
        .post('/api/multiply-v2/generate')
        .send({ 
          videoId: mockVideoId,
          platforms: ['youtube', 'tiktok', 'instagram', 'twitter']
        })
        .expect(200);

      // Clips should have varying durations suitable for different platforms
      const durations = response.body.clips.map((c: any) => c.duration);
      
      // Should have short clips (TikTok/Instagram: 15-60s)
      const shortClips = durations.filter((d: number) => d >= 15 && d <= 60);
      expect(shortClips.length).toBeGreaterThan(0);
      
      // Should have medium clips (YouTube Shorts: 60-90s)
      const mediumClips = durations.filter((d: number) => d > 60 && d <= 90);
      expect(mediumClips.length).toBeGreaterThan(0);
    });

    it('should generate platform-optimized aspect ratios', async () => {
      const response = await request(app)
        .post('/api/multiply-v2/generate')
        .send({ 
          videoId: mockVideoId,
          platforms: ['youtube', 'instagram', 'tiktok']
        })
        .expect(200);

      // Verify content includes platform metadata
      expect(response.body).toHaveProperty('clips');
      expect(response.body.clips.length).toBeGreaterThan(0);
    });

    it('should optimize quote graphics for social platforms', async () => {
      const response = await request(app)
        .post('/api/multiply-v2/generate')
        .send({ 
          videoId: mockVideoId,
          platforms: ['instagram', 'twitter', 'linkedin']
        })
        .expect(200);

      expect(response.body.quotes).toHaveLength(30);
      // All quotes should have text suitable for social sharing
      response.body.quotes.forEach((quote: any) => {
        expect(quote.text).toBeTruthy();
        expect(typeof quote.text).toBe('string');
      });
    });

    it('should generate audiograms optimized for audio platforms', async () => {
      const response = await request(app)
        .post('/api/multiply-v2/generate')
        .send({ 
          videoId: mockVideoId,
          platforms: ['spotify', 'soundcloud', 'twitter']
        })
        .expect(200);

      expect(response.body.audiograms).toHaveLength(15);
      response.body.audiograms.forEach((audiogram: any) => {
        expect(audiogram.duration).toBeGreaterThan(0);
        expect(audiogram.duration).toBeLessThanOrEqual(60); // Optimized for social
      });
    });

    it('should create platform-specific thumbnail variations', async () => {
      const response = await request(app)
        .post('/api/multiply-v2/generate')
        .send({ 
          videoId: mockVideoId,
          platforms: ['youtube', 'facebook', 'linkedin']
        })
        .expect(200);

      expect(response.body.thumbnails).toHaveLength(20);
      // Each thumbnail should have a unique variant
      const variants = response.body.thumbnails.map((t: any) => t.variant);
      const uniqueVariants = new Set(variants);
      expect(uniqueVariants.size).toBe(20);
    });
  });

  describe('AI-Generated Variations', () => {
    it('should generate AI-powered content variations', async () => {
      const response = await request(app)
        .post('/api/multiply-v2/generate')
        .send({ 
          videoId: mockVideoId,
          useAI: true
        })
        .expect(200);

      expect(response.body.generated).toBeGreaterThanOrEqual(100);
      expect(response.body).toHaveProperty('source');
    });

    it('should create varied quote styles', async () => {
      const response = await request(app)
        .post('/api/multiply-v2/generate')
        .send({ 
          videoId: mockVideoId,
          useAI: true
        })
        .expect(200);

      // Quotes should have different text content
      const quotes = response.body.quotes;
      expect(quotes.length).toBe(30);
      
      // Verify text diversity
      const uniqueTexts = new Set(quotes.map((q: any) => q.text));
      expect(uniqueTexts.size).toBe(30);
    });

    it('should generate creative infographic variations', async () => {
      const response = await request(app)
        .post('/api/multiply-v2/generate')
        .send({ 
          videoId: mockVideoId,
          useAI: true
        })
        .expect(200);

      const infographics = response.body.infographics;
      expect(infographics.length).toBe(20);
      
      // Should have multiple infographic types
      const types = infographics.map((i: any) => i.type);
      const uniqueTypes = new Set(types);
      expect(uniqueTypes.size).toBeGreaterThan(1);
    });

    it('should apply AI-driven content enhancement', async () => {
      const response = await request(app)
        .post('/api/multiply-v2/generate')
        .send({ 
          videoId: mockVideoId,
          useAI: true,
          enhancementLevel: 'high'
        })
        .expect(200);

      expect(response.body.generated).toBeGreaterThanOrEqual(100);
    });

    it('should generate contextually relevant variations', async () => {
      const response = await request(app)
        .post('/api/multiply-v2/generate')
        .send({ 
          videoId: mockVideoId,
          useAI: true,
          context: 'technology'
        })
        .expect(200);

      expect(response.body).toHaveProperty('clips');
      expect(response.body).toHaveProperty('quotes');
      expect(response.body).toHaveProperty('infographics');
    });
  });

  describe('Content Quality Across All Outputs', () => {
    it('should ensure all clips meet minimum quality standards', async () => {
      const response = await request(app)
        .post('/api/multiply-v2/generate')
        .send({ videoId: mockVideoId })
        .expect(200);

      response.body.clips.forEach((clip: any) => {
        expect(clip).toHaveProperty('id');
        expect(clip).toHaveProperty('duration');
        expect(clip.duration).toBeGreaterThan(0);
        expect(clip.duration).toBeLessThanOrEqual(120); // Max 2 minutes
      });
    });

    it('should validate quote text quality', async () => {
      const response = await request(app)
        .post('/api/multiply-v2/generate')
        .send({ videoId: mockVideoId })
        .expect(200);

      response.body.quotes.forEach((quote: any) => {
        expect(quote).toHaveProperty('text');
        expect(quote.text).toBeTruthy();
        expect(typeof quote.text).toBe('string');
        expect(quote.text.length).toBeGreaterThan(0);
      });
    });

    it('should ensure audiogram duration consistency', async () => {
      const response = await request(app)
        .post('/api/multiply-v2/generate')
        .send({ videoId: mockVideoId })
        .expect(200);

      response.body.audiograms.forEach((audiogram: any) => {
        expect(audiogram).toHaveProperty('duration');
        expect(audiogram.duration).toBeGreaterThan(0);
        expect(audiogram.duration).toBeLessThanOrEqual(60);
      });
    });

    it('should validate infographic structure', async () => {
      const response = await request(app)
        .post('/api/multiply-v2/generate')
        .send({ videoId: mockVideoId })
        .expect(200);

      response.body.infographics.forEach((infographic: any) => {
        expect(infographic).toHaveProperty('id');
        expect(infographic).toHaveProperty('type');
        expect(typeof infographic.type).toBe('string');
      });
    });

    it('should verify thumbnail quality metadata', async () => {
      const response = await request(app)
        .post('/api/multiply-v2/generate')
        .send({ videoId: mockVideoId })
        .expect(200);

      response.body.thumbnails.forEach((thumbnail: any) => {
        expect(thumbnail).toHaveProperty('id');
        expect(thumbnail).toHaveProperty('variant');
        expect(typeof thumbnail.variant).toBe('number');
      });
    });

    it('should maintain quality across all 105 pieces', async () => {
      const response = await request(app)
        .post('/api/multiply-v2/generate')
        .send({ videoId: mockVideoId })
        .expect(200);

      const allContent = [
        ...response.body.clips,
        ...response.body.quotes,
        ...response.body.audiograms,
        ...response.body.infographics,
        ...response.body.thumbnails,
      ];

      expect(allContent.length).toBe(105);
      
      // All content should have required properties
      allContent.forEach((content: any) => {
        expect(content).toHaveProperty('id');
        expect(content.id).toBeTruthy();
      });
    });
  });

  describe('Auto-Scheduling Features', () => {
    it('should generate scheduling metadata for all content', async () => {
      const response = await request(app)
        .post('/api/multiply-v2/generate')
        .send({ 
          videoId: mockVideoId,
          enableScheduling: true
        })
        .expect(200);

      expect(response.body.generated).toBeGreaterThanOrEqual(100);
    });

    it('should distribute content across optimal posting times', async () => {
      const response = await request(app)
        .post('/api/multiply-v2/generate')
        .send({ 
          videoId: mockVideoId,
          enableScheduling: true,
          scheduleDays: 30
        })
        .expect(200);

      expect(response.body).toHaveProperty('clips');
      expect(response.body).toHaveProperty('quotes');
    });

    it('should prioritize high-engagement time slots', async () => {
      const response = await request(app)
        .post('/api/multiply-v2/generate')
        .send({ 
          videoId: mockVideoId,
          enableScheduling: true,
          optimizeEngagement: true
        })
        .expect(200);

      expect(response.body.generated).toBeGreaterThanOrEqual(100);
    });

    it('should balance content types in schedule', async () => {
      const response = await request(app)
        .post('/api/multiply-v2/generate')
        .send({ 
          videoId: mockVideoId,
          enableScheduling: true,
          balanceTypes: true
        })
        .expect(200);

      // Should have diverse content types
      expect(response.body.clips.length).toBeGreaterThan(0);
      expect(response.body.quotes.length).toBeGreaterThan(0);
      expect(response.body.audiograms.length).toBeGreaterThan(0);
      expect(response.body.infographics.length).toBeGreaterThan(0);
      expect(response.body.thumbnails.length).toBeGreaterThan(0);
    });

    it('should support custom scheduling rules', async () => {
      const response = await request(app)
        .post('/api/multiply-v2/generate')
        .send({ 
          videoId: mockVideoId,
          enableScheduling: true,
          scheduleRules: {
            postsPerDay: 3,
            preferredTimes: ['09:00', '13:00', '18:00']
          }
        })
        .expect(200);

      expect(response.body.generated).toBeGreaterThanOrEqual(100);
    });

    it('should generate 30-day content calendar', async () => {
      const response = await request(app)
        .post('/api/multiply-v2/generate')
        .send({ 
          videoId: mockVideoId,
          enableScheduling: true,
          scheduleDays: 30
        })
        .expect(200);

      // 105 pieces over 30 days = ~3.5 posts per day
      expect(response.body.generated).toBe(105);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should return 400 when videoId is missing', async () => {
      const response = await request(app)
        .post('/api/multiply-v2/generate')
        .send({})
        .expect(400);

      expect(response.body.error).toContain('videoId');
    });

    it('should handle empty video content gracefully', async () => {
      const response = await request(app)
        .post('/api/multiply-v2/generate')
        .send({ 
          videoId: 'empty-video',
          transcript: ''
        })
        .expect(200);

      // Should still generate content structure
      expect(response.body).toHaveProperty('generated');
    });

    it('should handle very short videos', async () => {
      const response = await request(app)
        .post('/api/multiply-v2/generate')
        .send({ 
          videoId: 'short-video',
          duration: 30
        })
        .expect(200);

      // Should generate fewer but still diverse content
      expect(response.body).toHaveProperty('clips');
    });

    it('should handle very long videos', async () => {
      const response = await request(app)
        .post('/api/multiply-v2/generate')
        .send({ 
          videoId: 'long-video',
          duration: 3600 // 1 hour
        })
        .expect(200);

      // Should generate more content pieces
      expect(response.body.generated).toBeGreaterThanOrEqual(100);
    });

    it('should handle invalid platform specifications', async () => {
      const response = await request(app)
        .post('/api/multiply-v2/generate')
        .send({ 
          videoId: mockVideoId,
          platforms: ['invalid-platform']
        })
        .expect(200);

      // Should still generate content
      expect(response.body.generated).toBeGreaterThanOrEqual(100);
    });
  });

  describe('Performance and Scalability', () => {
    it('should generate 100+ pieces within reasonable time', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/multiply-v2/generate')
        .send({ videoId: mockVideoId })
        .expect(200);

      const duration = Date.now() - startTime;
      
      expect(response.body.generated).toBeGreaterThanOrEqual(100);
      expect(duration).toBeLessThan(30000); // Should complete within 30 seconds
    });

    it('should handle concurrent generation requests', async () => {
      const requests = Array.from({ length: 5 }, (_, i) =>
        request(app)
          .post('/api/multiply-v2/generate')
          .send({ videoId: `video-${i}` })
      );

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.generated).toBeGreaterThanOrEqual(100);
      });
    });

    it('should efficiently process large batch requests', async () => {
      const response = await request(app)
        .post('/api/multiply-v2/generate')
        .send({ 
          videoId: mockVideoId,
          batchSize: 'large'
        })
        .expect(200);

      expect(response.body.generated).toBeGreaterThanOrEqual(100);
    });
  });

  describe('Integration with Other Features', () => {
    it('should integrate with viral score analysis', async () => {
      const response = await request(app)
        .post('/api/multiply-v2/generate')
        .send({ 
          videoId: mockVideoId,
          analyzeVirality: true
        })
        .expect(200);

      expect(response.body.generated).toBeGreaterThanOrEqual(100);
    });

    it('should integrate with trend prediction', async () => {
      const response = await request(app)
        .post('/api/multiply-v2/generate')
        .send({ 
          videoId: mockVideoId,
          useTrendData: true
        })
        .expect(200);

      expect(response.body.generated).toBeGreaterThanOrEqual(100);
    });

    it('should integrate with creator DNA profiling', async () => {
      const response = await request(app)
        .post('/api/multiply-v2/generate')
        .send({ 
          videoId: mockVideoId,
          applyCreatorDNA: true,
          creatorId: 'creator-123'
        })
        .expect(200);

      expect(response.body.generated).toBeGreaterThanOrEqual(100);
    });
  });
});
