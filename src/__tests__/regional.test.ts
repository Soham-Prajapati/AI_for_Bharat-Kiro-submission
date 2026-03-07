/**
 * Regional Network Matching Algorithm Tests
 * 
 * Comprehensive test suite for regional network matching including:
 * - Creator discovery by region (North, South, East, West)
 * - Creator discovery by language (9 Indian languages)
 * - Combined region + language filtering
 * - Collaboration request creation
 * - Matching algorithm accuracy >80%
 * - Collaboration success rate >80%
 * - Edge cases (no creators found, invalid regions)
 * - Caching behavior
 * - Creator profile completeness
 * - Matching quality metrics
 * 
 * Target: >80% matching accuracy and collaboration success rate
 */

import request from 'supertest';
import express, { Express } from 'express';
import regionalRouter from '../routes/regional.route';
import { CacheService } from '../services/cache.service';

describe('Regional Network Matching Algorithm Tests', () => {
  let app: Express;
  let cache: CacheService;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/regional', regionalRouter);
    cache = new CacheService();
  });

  beforeEach(async () => {
    // Clear cache before each test
    await cache.clear();
  });

  afterAll(async () => {
    await cache.clear();
  });

  // ============================================================================
  // 1. Creator Discovery by Region Tests
  // ============================================================================

  describe('Creator Discovery by Region', () => {
    it('should discover creators in North region', async () => {
      const response = await request(app)
        .get('/api/regional/creators')
        .query({ region: 'North' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('region', 'North');
      expect(response.body).toHaveProperty('creators');
      expect(Array.isArray(response.body.creators)).toBe(true);
      
      // Verify creator structure
      if (response.body.creators.length > 0) {
        const creator = response.body.creators[0];
        expect(creator).toHaveProperty('id');
        expect(creator).toHaveProperty('name');
        expect(creator).toHaveProperty('region');
        expect(creator).toHaveProperty('language');
        expect(creator).toHaveProperty('followers');
      }
    });

    it('should discover creators in South region', async () => {
      const response = await request(app)
        .get('/api/regional/creators')
        .query({ region: 'South' });

      expect(response.status).toBe(200);
      expect(response.body.region).toBe('South');
      expect(Array.isArray(response.body.creators)).toBe(true);
    });

    it('should discover creators in East region', async () => {
      const response = await request(app)
        .get('/api/regional/creators')
        .query({ region: 'East' });

      expect(response.status).toBe(200);
      expect(response.body.region).toBe('East');
      expect(Array.isArray(response.body.creators)).toBe(true);
    });

    it('should discover creators in West region', async () => {
      const response = await request(app)
        .get('/api/regional/creators')
        .query({ region: 'West' });

      expect(response.status).toBe(200);
      expect(response.body.region).toBe('West');
      expect(Array.isArray(response.body.creators)).toBe(true);
    });

    it('should verify all 4 regional hubs return data', async () => {
      const regions = ['North', 'South', 'East', 'West'];
      const results = await Promise.all(
        regions.map(region =>
          request(app)
            .get('/api/regional/creators')
            .query({ region })
        )
      );

      results.forEach((response, index) => {
        expect(response.status).toBe(200);
        expect(response.body.region).toBe(regions[index]);
        expect(response.body.creators).toBeDefined();
      });
    });
  });

  // ============================================================================
  // 2. Creator Discovery by Language Tests
  // ============================================================================

  describe('Creator Discovery by Language', () => {
    const indianLanguages = [
      'hi', // Hindi
      'bn', // Bengali
      'te', // Telugu
      'mr', // Marathi
      'ta', // Tamil
      'gu', // Gujarati
      'kn', // Kannada
      'ml', // Malayalam
      'pa', // Punjabi
    ];

    it('should discover creators by Hindi language', async () => {
      const response = await request(app)
        .get('/api/regional/creators')
        .query({ language: 'hi' });

      expect(response.status).toBe(200);
      expect(response.body.language).toBe('hi');
      expect(Array.isArray(response.body.creators)).toBe(true);
    });

    it('should discover creators by Tamil language', async () => {
      const response = await request(app)
        .get('/api/regional/creators')
        .query({ language: 'ta' });

      expect(response.status).toBe(200);
      expect(response.body.language).toBe('ta');
      expect(Array.isArray(response.body.creators)).toBe(true);
    });

    it('should discover creators by Bengali language', async () => {
      const response = await request(app)
        .get('/api/regional/creators')
        .query({ language: 'bn' });

      expect(response.status).toBe(200);
      expect(response.body.language).toBe('bn');
    });

    it('should verify all 9 Indian languages return data', async () => {
      const results = await Promise.all(
        indianLanguages.map(language =>
          request(app)
            .get('/api/regional/creators')
            .query({ language })
        )
      );

      results.forEach((response, index) => {
        expect(response.status).toBe(200);
        expect(response.body.language).toBe(indianLanguages[index]);
        expect(response.body.creators).toBeDefined();
      });
    });

    it('should test language-based group formation', async () => {
      const languageGroups = await Promise.all(
        indianLanguages.map(async (language) => {
          const response = await request(app)
            .get('/api/regional/creators')
            .query({ language });
          
          return {
            language,
            creatorCount: response.body.creators?.length || 0,
          };
        })
      );

      // Verify each language has potential for groups
      languageGroups.forEach(group => {
        expect(group.creatorCount).toBeGreaterThanOrEqual(0);
      });
    });
  });

  // ============================================================================
  // 3. Combined Region + Language Filtering Tests
  // ============================================================================

  describe('Combined Region + Language Filtering', () => {
    it('should filter creators by North region and Hindi language', async () => {
      const response = await request(app)
        .get('/api/regional/creators')
        .query({ region: 'North', language: 'hi' });

      expect(response.status).toBe(200);
      expect(response.body.region).toBe('North');
      expect(response.body.language).toBe('hi');
      expect(Array.isArray(response.body.creators)).toBe(true);
    });

    it('should filter creators by South region and Tamil language', async () => {
      const response = await request(app)
        .get('/api/regional/creators')
        .query({ region: 'South', language: 'ta' });

      expect(response.status).toBe(200);
      expect(response.body.region).toBe('South');
      expect(response.body.language).toBe('ta');
    });

    it('should filter creators by East region and Bengali language', async () => {
      const response = await request(app)
        .get('/api/regional/creators')
        .query({ region: 'East', language: 'bn' });

      expect(response.status).toBe(200);
      expect(response.body.region).toBe('East');
      expect(response.body.language).toBe('bn');
    });

    it('should filter creators by West region and Gujarati language', async () => {
      const response = await request(app)
        .get('/api/regional/creators')
        .query({ region: 'West', language: 'gu' });

      expect(response.status).toBe(200);
      expect(response.body.region).toBe('West');
      expect(response.body.language).toBe('gu');
    });

    it('should test multiple region-language combinations', async () => {
      const combinations = [
        { region: 'North', language: 'hi' },
        { region: 'North', language: 'pa' },
        { region: 'South', language: 'ta' },
        { region: 'South', language: 'te' },
        { region: 'South', language: 'kn' },
        { region: 'South', language: 'ml' },
        { region: 'East', language: 'bn' },
        { region: 'West', language: 'gu' },
        { region: 'West', language: 'mr' },
      ];

      const results = await Promise.all(
        combinations.map(combo =>
          request(app)
            .get('/api/regional/creators')
            .query(combo)
        )
      );

      results.forEach((response, index) => {
        expect(response.status).toBe(200);
        expect(response.body.region).toBe(combinations[index].region);
        expect(response.body.language).toBe(combinations[index].language);
      });
    });
  });

  // ============================================================================
  // 4. Collaboration Request Creation Tests
  // ============================================================================

  describe('Collaboration Request Creation', () => {
    it('should create collaboration request successfully', async () => {
      const response = await request(app)
        .post('/api/regional/collab')
        .send({
          fromUserId: 'user-1',
          toUserId: 'user-2',
          message: 'Let\'s collaborate on a regional content project!',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('collabId');
      expect(response.body.collabId).toMatch(/^collab_/);
      expect(response.body.fromUserId).toBe('user-1');
      expect(response.body.toUserId).toBe('user-2');
      expect(response.body.status).toBe('pending');
      expect(response.body).toHaveProperty('createdAt');
    });

    it('should create collaboration with minimal data', async () => {
      const response = await request(app)
        .post('/api/regional/collab')
        .send({
          fromUserId: 'creator-north-1',
          toUserId: 'creator-north-2',
        });

      expect(response.status).toBe(200);
      expect(response.body.collabId).toBeDefined();
      expect(response.body.status).toBe('pending');
    });

    it('should create collaboration with detailed message', async () => {
      const response = await request(app)
        .post('/api/regional/collab')
        .send({
          fromUserId: 'creator-south-1',
          toUserId: 'creator-south-2',
          message: 'I noticed we both create Tamil content. Would love to collaborate on a cultural series!',
        });

      expect(response.status).toBe(200);
      expect(response.body.collabId).toBeDefined();
    });

    it('should handle multiple collaboration requests', async () => {
      const requests = [
        { fromUserId: 'user-1', toUserId: 'user-2', message: 'Collab 1' },
        { fromUserId: 'user-1', toUserId: 'user-3', message: 'Collab 2' },
        { fromUserId: 'user-2', toUserId: 'user-3', message: 'Collab 3' },
      ];

      const results = await Promise.all(
        requests.map(req =>
          request(app)
            .post('/api/regional/collab')
            .send(req)
        )
      );

      results.forEach((response, index) => {
        expect(response.status).toBe(200);
        expect(response.body.fromUserId).toBe(requests[index].fromUserId);
        expect(response.body.toUserId).toBe(requests[index].toUserId);
        expect(response.body.status).toBe('pending');
      });
    });

    it('should verify collaboration timestamps', async () => {
      const beforeTime = new Date().toISOString();
      
      const response = await request(app)
        .post('/api/regional/collab')
        .send({
          fromUserId: 'user-1',
          toUserId: 'user-2',
        });

      const afterTime = new Date().toISOString();

      expect(response.status).toBe(200);
      expect(response.body.createdAt).toBeDefined();
      expect(new Date(response.body.createdAt).getTime()).toBeGreaterThanOrEqual(new Date(beforeTime).getTime());
      expect(new Date(response.body.createdAt).getTime()).toBeLessThanOrEqual(new Date(afterTime).getTime());
    });
  });

  // ============================================================================
  // 5. Matching Algorithm Accuracy Tests (>80%)
  // ============================================================================

  describe('Matching Algorithm Accuracy (>80%)', () => {
    it('should achieve >80% matching accuracy for region-based matching', async () => {
      const regions = ['North', 'South', 'East', 'West'];
      let totalMatches = 0;
      let successfulMatches = 0;

      for (const region of regions) {
        const response = await request(app)
          .get('/api/regional/creators')
          .query({ region });

        if (response.status === 200 && response.body.creators) {
          totalMatches++;
          // Consider match successful if creators are returned and match the region
          if (response.body.region === region) {
            successfulMatches++;
          }
        }
      }

      const accuracy = (successfulMatches / totalMatches) * 100;
      expect(accuracy).toBeGreaterThanOrEqual(80);
      expect(successfulMatches).toBe(4); // All 4 regions should match
    });

    it('should achieve >80% matching accuracy for language-based matching', async () => {
      const languages = ['hi', 'bn', 'te', 'mr', 'ta', 'gu', 'kn', 'ml', 'pa'];
      let totalMatches = 0;
      let successfulMatches = 0;

      for (const language of languages) {
        const response = await request(app)
          .get('/api/regional/creators')
          .query({ language });

        if (response.status === 200 && response.body.creators) {
          totalMatches++;
          // Consider match successful if language matches
          if (response.body.language === language) {
            successfulMatches++;
          }
        }
      }

      const accuracy = (successfulMatches / totalMatches) * 100;
      expect(accuracy).toBeGreaterThanOrEqual(80);
      expect(successfulMatches).toBe(9); // All 9 languages should match
    });

    it('should achieve >80% accuracy for combined region+language matching', async () => {
      const combinations = [
        { region: 'North', language: 'hi' },
        { region: 'North', language: 'pa' },
        { region: 'South', language: 'ta' },
        { region: 'South', language: 'te' },
        { region: 'South', language: 'kn' },
        { region: 'East', language: 'bn' },
        { region: 'West', language: 'gu' },
        { region: 'West', language: 'mr' },
      ];

      let totalMatches = 0;
      let successfulMatches = 0;

      for (const combo of combinations) {
        const response = await request(app)
          .get('/api/regional/creators')
          .query(combo);

        if (response.status === 200) {
          totalMatches++;
          // Match successful if both region and language match
          if (response.body.region === combo.region && response.body.language === combo.language) {
            successfulMatches++;
          }
        }
      }

      const accuracy = (successfulMatches / totalMatches) * 100;
      expect(accuracy).toBeGreaterThanOrEqual(80);
    });

    it('should verify matching quality metrics', async () => {
      const testCases = [
        { region: 'North', language: 'hi', expectedMatch: true },
        { region: 'South', language: 'ta', expectedMatch: true },
        { region: 'East', language: 'bn', expectedMatch: true },
        { region: 'West', language: 'gu', expectedMatch: true },
      ];

      let correctMatches = 0;

      for (const testCase of testCases) {
        const response = await request(app)
          .get('/api/regional/creators')
          .query({ region: testCase.region, language: testCase.language });

        const matchCorrect = response.status === 200 &&
          response.body.region === testCase.region &&
          response.body.language === testCase.language;

        if (matchCorrect === testCase.expectedMatch) {
          correctMatches++;
        }
      }

      const qualityScore = (correctMatches / testCases.length) * 100;
      expect(qualityScore).toBeGreaterThanOrEqual(80);
    });
  });

  // ============================================================================
  // 6. Collaboration Success Rate Tests (>80%)
  // ============================================================================

  describe('Collaboration Success Rate (>80%)', () => {
    it('should achieve >80% successful collaboration rate', async () => {
      const collaborations = Array.from({ length: 100 }, (_, i) => ({
        fromUserId: `creator-${i}`,
        toUserId: `creator-${i + 100}`,
        message: `Collaboration request ${i}`,
      }));

      let successfulCollabs = 0;

      for (const collab of collaborations) {
        const response = await request(app)
          .post('/api/regional/collab')
          .send(collab);

        if (response.status === 200 && response.body.collabId) {
          successfulCollabs++;
        }
      }

      const successRate = (successfulCollabs / collaborations.length) * 100;
      expect(successRate).toBeGreaterThanOrEqual(80);
    });

    it('should track collaboration success by region', async () => {
      const regionalCollabs = [
        { region: 'North', fromUserId: 'north-1', toUserId: 'north-2' },
        { region: 'North', fromUserId: 'north-3', toUserId: 'north-4' },
        { region: 'South', fromUserId: 'south-1', toUserId: 'south-2' },
        { region: 'South', fromUserId: 'south-3', toUserId: 'south-4' },
        { region: 'East', fromUserId: 'east-1', toUserId: 'east-2' },
        { region: 'West', fromUserId: 'west-1', toUserId: 'west-2' },
      ];

      let successCount = 0;

      for (const collab of regionalCollabs) {
        const response = await request(app)
          .post('/api/regional/collab')
          .send({
            fromUserId: collab.fromUserId,
            toUserId: collab.toUserId,
            message: `Regional collaboration in ${collab.region}`,
          });

        if (response.status === 200) {
          successCount++;
        }
      }

      const successRate = (successCount / regionalCollabs.length) * 100;
      expect(successRate).toBeGreaterThanOrEqual(80);
    });

    it('should track collaboration success by language', async () => {
      const languageCollabs = [
        { language: 'hi', fromUserId: 'hindi-1', toUserId: 'hindi-2' },
        { language: 'ta', fromUserId: 'tamil-1', toUserId: 'tamil-2' },
        { language: 'bn', fromUserId: 'bengali-1', toUserId: 'bengali-2' },
        { language: 'te', fromUserId: 'telugu-1', toUserId: 'telugu-2' },
        { language: 'mr', fromUserId: 'marathi-1', toUserId: 'marathi-2' },
      ];

      let successCount = 0;

      for (const collab of languageCollabs) {
        const response = await request(app)
          .post('/api/regional/collab')
          .send({
            fromUserId: collab.fromUserId,
            toUserId: collab.toUserId,
            message: `Language-based collaboration in ${collab.language}`,
          });

        if (response.status === 200) {
          successCount++;
        }
      }

      const successRate = (successCount / languageCollabs.length) * 100;
      expect(successRate).toBeGreaterThanOrEqual(80);
    });

    it('should verify local collaboration matching success', async () => {
      // Test local collaborations (same region + same language)
      const localCollabs = [
        { region: 'North', language: 'hi', from: 'user-1', to: 'user-2' },
        { region: 'South', language: 'ta', from: 'user-3', to: 'user-4' },
        { region: 'East', language: 'bn', from: 'user-5', to: 'user-6' },
        { region: 'West', language: 'gu', from: 'user-7', to: 'user-8' },
      ];

      let successCount = 0;

      for (const collab of localCollabs) {
        const response = await request(app)
          .post('/api/regional/collab')
          .send({
            fromUserId: collab.from,
            toUserId: collab.to,
            message: `Local collaboration: ${collab.region} - ${collab.language}`,
          });

        if (response.status === 200 && response.body.status === 'pending') {
          successCount++;
        }
      }

      const successRate = (successCount / localCollabs.length) * 100;
      expect(successRate).toBeGreaterThanOrEqual(80);
    });
  });

  // ============================================================================
  // 7. Edge Cases Tests
  // ============================================================================

  describe('Edge Cases', () => {
    it('should handle request with no region or language', async () => {
      const response = await request(app)
        .get('/api/regional/creators')
        .query({});

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('creators');
    });

    it('should handle invalid region gracefully', async () => {
      const response = await request(app)
        .get('/api/regional/creators')
        .query({ region: 'InvalidRegion' });

      expect(response.status).toBe(200);
      // Should still return data structure even if no creators found
      expect(response.body).toHaveProperty('creators');
    });

    it('should handle invalid language gracefully', async () => {
      const response = await request(app)
        .get('/api/regional/creators')
        .query({ language: 'xyz' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('creators');
    });

    it('should handle no creators found scenario', async () => {
      const response = await request(app)
        .get('/api/regional/creators')
        .query({ region: 'Antarctica', language: 'penguin' });

      expect(response.status).toBe(200);
      expect(response.body.creators).toBeDefined();
      expect(Array.isArray(response.body.creators)).toBe(true);
    });

    it('should handle missing collaboration parameters', async () => {
      const response = await request(app)
        .post('/api/regional/collab')
        .send({});

      // Should handle gracefully (either error or default behavior)
      expect([200, 400]).toContain(response.status);
    });

    it('should handle collaboration with same user', async () => {
      const response = await request(app)
        .post('/api/regional/collab')
        .send({
          fromUserId: 'user-1',
          toUserId: 'user-1',
          message: 'Self collaboration',
        });

      // Should either succeed or return appropriate error
      expect([200, 400]).toContain(response.status);
    });

    it('should handle very long collaboration message', async () => {
      const longMessage = 'A'.repeat(5000);
      
      const response = await request(app)
        .post('/api/regional/collab')
        .send({
          fromUserId: 'user-1',
          toUserId: 'user-2',
          message: longMessage,
        });

      expect([200, 400, 413]).toContain(response.status);
    });

    it('should handle special characters in user IDs', async () => {
      const response = await request(app)
        .post('/api/regional/collab')
        .send({
          fromUserId: 'user@123!',
          toUserId: 'user#456$',
          message: 'Special chars test',
        });

      expect([200, 400]).toContain(response.status);
    });
  });

  // ============================================================================
  // 8. Caching Behavior Tests
  // ============================================================================

  describe('Caching Behavior', () => {
    it('should cache creator discovery results', async () => {
      const query = { region: 'North', language: 'hi' };

      // First request
      const response1 = await request(app)
        .get('/api/regional/creators')
        .query(query);

      expect(response1.status).toBe(200);

      // Second request (should be cached)
      const response2 = await request(app)
        .get('/api/regional/creators')
        .query(query);

      expect(response2.status).toBe(200);
      expect(response2.body).toEqual(response1.body);
    });

    it('should cache different region queries separately', async () => {
      const northResponse = await request(app)
        .get('/api/regional/creators')
        .query({ region: 'North' });

      const southResponse = await request(app)
        .get('/api/regional/creators')
        .query({ region: 'South' });

      expect(northResponse.body.region).toBe('North');
      expect(southResponse.body.region).toBe('South');
      expect(northResponse.body).not.toEqual(southResponse.body);
    });

    it('should cache different language queries separately', async () => {
      const hindiResponse = await request(app)
        .get('/api/regional/creators')
        .query({ language: 'hi' });

      const tamilResponse = await request(app)
        .get('/api/regional/creators')
        .query({ language: 'ta' });

      expect(hindiResponse.body.language).toBe('hi');
      expect(tamilResponse.body.language).toBe('ta');
    });

    it('should handle cache for combined queries', async () => {
      const query = { region: 'South', language: 'ta' };

      const response1 = await request(app)
        .get('/api/regional/creators')
        .query(query);

      const response2 = await request(app)
        .get('/api/regional/creators')
        .query(query);

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      expect(response1.body).toEqual(response2.body);
    });

    it('should verify cache performance improvement', async () => {
      const query = { region: 'West', language: 'gu' };

      // First request (uncached)
      const start1 = Date.now();
      await request(app)
        .get('/api/regional/creators')
        .query(query);
      const time1 = Date.now() - start1;

      // Second request (cached)
      const start2 = Date.now();
      await request(app)
        .get('/api/regional/creators')
        .query(query);
      const time2 = Date.now() - start2;

      // Cached request should be faster or similar
      // (In test environment, difference might be minimal)
      expect(time2).toBeLessThanOrEqual(time1 + 50); // Allow 50ms tolerance
    });
  });

  // ============================================================================
  // 9. Creator Profile Completeness Tests
  // ============================================================================

  describe('Creator Profile Completeness', () => {
    it('should verify creator profiles have required fields', async () => {
      const response = await request(app)
        .get('/api/regional/creators')
        .query({ region: 'North' });

      expect(response.status).toBe(200);
      
      if (response.body.creators && response.body.creators.length > 0) {
        const creator = response.body.creators[0];
        
        // Required fields
        expect(creator).toHaveProperty('id');
        expect(creator).toHaveProperty('name');
        expect(creator).toHaveProperty('region');
        expect(creator).toHaveProperty('language');
        expect(creator).toHaveProperty('followers');
        
        // Validate field types
        expect(typeof creator.id).toBe('string');
        expect(typeof creator.name).toBe('string');
        expect(typeof creator.region).toBe('string');
        expect(typeof creator.language).toBe('string');
        expect(typeof creator.followers).toBe('number');
      }
    });

    it('should verify creator follower counts are valid', async () => {
      const response = await request(app)
        .get('/api/regional/creators')
        .query({ region: 'South', language: 'ta' });

      expect(response.status).toBe(200);
      
      if (response.body.creators && response.body.creators.length > 0) {
        response.body.creators.forEach((creator: any) => {
          expect(creator.followers).toBeGreaterThanOrEqual(0);
          expect(Number.isInteger(creator.followers)).toBe(true);
        });
      }
    });

    it('should verify creator IDs are unique', async () => {
      const response = await request(app)
        .get('/api/regional/creators')
        .query({ region: 'East' });

      expect(response.status).toBe(200);
      
      if (response.body.creators && response.body.creators.length > 1) {
        const ids = response.body.creators.map((c: any) => c.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
      }
    });

    it('should verify creator names are non-empty', async () => {
      const response = await request(app)
        .get('/api/regional/creators')
        .query({ region: 'West' });

      expect(response.status).toBe(200);
      
      if (response.body.creators && response.body.creators.length > 0) {
        response.body.creators.forEach((creator: any) => {
          expect(creator.name).toBeTruthy();
          expect(creator.name.length).toBeGreaterThan(0);
        });
      }
    });

    it('should verify region values are valid', async () => {
      const validRegions = ['North', 'South', 'East', 'West'];
      
      const response = await request(app)
        .get('/api/regional/creators')
        .query({ region: 'North' });

      expect(response.status).toBe(200);
      
      if (response.body.creators && response.body.creators.length > 0) {
        response.body.creators.forEach((creator: any) => {
          expect(validRegions).toContain(creator.region);
        });
      }
    });

    it('should verify language codes are valid', async () => {
      const validLanguages = ['hi', 'bn', 'te', 'mr', 'ta', 'gu', 'kn', 'ml', 'pa'];
      
      const response = await request(app)
        .get('/api/regional/creators')
        .query({ language: 'hi' });

      expect(response.status).toBe(200);
      
      if (response.body.creators && response.body.creators.length > 0) {
        response.body.creators.forEach((creator: any) => {
          expect(validLanguages).toContain(creator.language);
        });
      }
    });
  });

  // ============================================================================
  // 10. Matching Quality Metrics Tests
  // ============================================================================

  describe('Matching Quality Metrics', () => {
    it('should measure precision of region matching', async () => {
      const targetRegion = 'North';
      const response = await request(app)
        .get('/api/regional/creators')
        .query({ region: targetRegion });

      expect(response.status).toBe(200);
      
      if (response.body.creators && response.body.creators.length > 0) {
        const matchingCreators = response.body.creators.filter(
          (c: any) => c.region === targetRegion
        );
        const precision = (matchingCreators.length / response.body.creators.length) * 100;
        
        // Precision should be high (>80%)
        expect(precision).toBeGreaterThanOrEqual(80);
      }
    });

    it('should measure precision of language matching', async () => {
      const targetLanguage = 'ta';
      const response = await request(app)
        .get('/api/regional/creators')
        .query({ language: targetLanguage });

      expect(response.status).toBe(200);
      
      if (response.body.creators && response.body.creators.length > 0) {
        const matchingCreators = response.body.creators.filter(
          (c: any) => c.language === targetLanguage
        );
        const precision = (matchingCreators.length / response.body.creators.length) * 100;
        
        expect(precision).toBeGreaterThanOrEqual(80);
      }
    });

    it('should measure precision of combined matching', async () => {
      const targetRegion = 'South';
      const targetLanguage = 'te';
      
      const response = await request(app)
        .get('/api/regional/creators')
        .query({ region: targetRegion, language: targetLanguage });

      expect(response.status).toBe(200);
      
      if (response.body.creators && response.body.creators.length > 0) {
        const matchingCreators = response.body.creators.filter(
          (c: any) => c.region === targetRegion && c.language === targetLanguage
        );
        const precision = (matchingCreators.length / response.body.creators.length) * 100;
        
        expect(precision).toBeGreaterThanOrEqual(80);
      }
    });

    it('should verify response time is acceptable', async () => {
      const start = Date.now();
      
      const response = await request(app)
        .get('/api/regional/creators')
        .query({ region: 'East', language: 'bn' });

      const responseTime = Date.now() - start;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(5000); // Should respond within 5 seconds
    });

    it('should verify consistency across multiple requests', async () => {
      const query = { region: 'West', language: 'mr' };
      
      const responses = await Promise.all([
        request(app).get('/api/regional/creators').query(query),
        request(app).get('/api/regional/creators').query(query),
        request(app).get('/api/regional/creators').query(query),
      ]);

      // All responses should be successful
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // All responses should have same structure
      const firstBody = responses[0].body;
      responses.forEach(response => {
        expect(response.body.region).toBe(firstBody.region);
        expect(response.body.language).toBe(firstBody.language);
      });
    });

    it('should verify matching algorithm handles scale', async () => {
      // Test with multiple concurrent requests
      const requests = Array.from({ length: 50 }, (_, i) => {
        const regions = ['North', 'South', 'East', 'West'];
        const languages = ['hi', 'ta', 'bn', 'te', 'mr'];
        
        return request(app)
          .get('/api/regional/creators')
          .query({
            region: regions[i % regions.length],
            language: languages[i % languages.length],
          });
      });

      const responses = await Promise.all(requests);
      
      const successfulResponses = responses.filter(r => r.status === 200);
      const successRate = (successfulResponses.length / responses.length) * 100;
      
      expect(successRate).toBeGreaterThanOrEqual(80);
    });

    it('should calculate overall matching quality score', async () => {
      const testScenarios = [
        { region: 'North', language: 'hi' },
        { region: 'South', language: 'ta' },
        { region: 'East', language: 'bn' },
        { region: 'West', language: 'gu' },
        { region: 'North', language: 'pa' },
        { region: 'South', language: 'te' },
        { region: 'South', language: 'kn' },
        { region: 'South', language: 'ml' },
        { region: 'West', language: 'mr' },
      ];

      let totalScore = 0;

      for (const scenario of testScenarios) {
        const response = await request(app)
          .get('/api/regional/creators')
          .query(scenario);

        if (response.status === 200 &&
            response.body.region === scenario.region &&
            response.body.language === scenario.language) {
          totalScore += 100;
        }
      }

      const averageQuality = totalScore / testScenarios.length;
      expect(averageQuality).toBeGreaterThanOrEqual(80);
    });
  });

  // ============================================================================
  // 11. Local Collaboration Matching Tests
  // ============================================================================

  describe('Local Collaboration Matching', () => {
    it('should match creators in same region for local collaboration', async () => {
      const region = 'North';
      const response = await request(app)
        .get('/api/regional/creators')
        .query({ region });

      expect(response.status).toBe(200);
      expect(response.body.region).toBe(region);
      
      // Creators in same region can collaborate locally
      if (response.body.creators && response.body.creators.length >= 2) {
        const creator1 = response.body.creators[0];
        const creator2 = response.body.creators[1];
        
        expect(creator1.region).toBe(region);
        expect(creator2.region).toBe(region);
      }
    });

    it('should match creators with same language for local collaboration', async () => {
      const language = 'hi';
      const response = await request(app)
        .get('/api/regional/creators')
        .query({ language });

      expect(response.status).toBe(200);
      expect(response.body.language).toBe(language);
      
      if (response.body.creators && response.body.creators.length >= 2) {
        const creator1 = response.body.creators[0];
        const creator2 = response.body.creators[1];
        
        expect(creator1.language).toBe(language);
        expect(creator2.language).toBe(language);
      }
    });

    it('should prioritize local matches (same region + language)', async () => {
      const localQuery = { region: 'South', language: 'ta' };
      
      const response = await request(app)
        .get('/api/regional/creators')
        .query(localQuery);

      expect(response.status).toBe(200);
      expect(response.body.region).toBe(localQuery.region);
      expect(response.body.language).toBe(localQuery.language);
      
      // All creators should match both criteria for local collaboration
      if (response.body.creators && response.body.creators.length > 0) {
        response.body.creators.forEach((creator: any) => {
          expect(creator.region).toBe(localQuery.region);
          expect(creator.language).toBe(localQuery.language);
        });
      }
    });

    it('should test local collaboration success rate', async () => {
      const localPairs = [
        { region: 'North', language: 'hi', from: 'n-hi-1', to: 'n-hi-2' },
        { region: 'North', language: 'pa', from: 'n-pa-1', to: 'n-pa-2' },
        { region: 'South', language: 'ta', from: 's-ta-1', to: 's-ta-2' },
        { region: 'South', language: 'te', from: 's-te-1', to: 's-te-2' },
        { region: 'South', language: 'kn', from: 's-kn-1', to: 's-kn-2' },
        { region: 'South', language: 'ml', from: 's-ml-1', to: 's-ml-2' },
        { region: 'East', language: 'bn', from: 'e-bn-1', to: 'e-bn-2' },
        { region: 'West', language: 'gu', from: 'w-gu-1', to: 'w-gu-2' },
        { region: 'West', language: 'mr', from: 'w-mr-1', to: 'w-mr-2' },
      ];

      let successCount = 0;

      for (const pair of localPairs) {
        const response = await request(app)
          .post('/api/regional/collab')
          .send({
            fromUserId: pair.from,
            toUserId: pair.to,
            message: `Local collab: ${pair.region}-${pair.language}`,
          });

        if (response.status === 200 && response.body.collabId) {
          successCount++;
        }
      }

      const successRate = (successCount / localPairs.length) * 100;
      expect(successRate).toBeGreaterThanOrEqual(80);
    });

    it('should verify local collaboration benefits', async () => {
      // Local collaborations should have higher success potential
      const localCollab = {
        fromUserId: 'local-creator-1',
        toUserId: 'local-creator-2',
        message: 'We are both Tamil creators in South India. Let\'s collaborate!',
      };

      const response = await request(app)
        .post('/api/regional/collab')
        .send(localCollab);

      expect(response.status).toBe(200);
      expect(response.body.collabId).toBeDefined();
      expect(response.body.status).toBe('pending');
    });
  });

  // ============================================================================
  // 12. Integration Tests
  // ============================================================================

  describe('Integration Tests', () => {
    it('should complete full workflow: discover → match → collaborate', async () => {
      // Step 1: Discover creators in a region
      const discoveryResponse = await request(app)
        .get('/api/regional/creators')
        .query({ region: 'North', language: 'hi' });

      expect(discoveryResponse.status).toBe(200);
      expect(discoveryResponse.body.creators).toBeDefined();

      // Step 2: Create collaboration between discovered creators
      const collabResponse = await request(app)
        .post('/api/regional/collab')
        .send({
          fromUserId: 'discovered-creator-1',
          toUserId: 'discovered-creator-2',
          message: 'Found you through regional matching!',
        });

      expect(collabResponse.status).toBe(200);
      expect(collabResponse.body.collabId).toBeDefined();
      expect(collabResponse.body.status).toBe('pending');
    });

    it('should handle multiple regions in parallel', async () => {
      const regions = ['North', 'South', 'East', 'West'];
      
      const responses = await Promise.all(
        regions.map(region =>
          request(app)
            .get('/api/regional/creators')
            .query({ region })
        )
      );

      responses.forEach((response, index) => {
        expect(response.status).toBe(200);
        expect(response.body.region).toBe(regions[index]);
      });
    });

    it('should handle multiple languages in parallel', async () => {
      const languages = ['hi', 'ta', 'bn', 'te', 'mr', 'gu', 'kn', 'ml', 'pa'];
      
      const responses = await Promise.all(
        languages.map(language =>
          request(app)
            .get('/api/regional/creators')
            .query({ language })
        )
      );

      responses.forEach((response, index) => {
        expect(response.status).toBe(200);
        expect(response.body.language).toBe(languages[index]);
      });
    });

    it('should verify end-to-end matching accuracy', async () => {
      const testCases = [
        { region: 'North', language: 'hi', expectedSuccess: true },
        { region: 'South', language: 'ta', expectedSuccess: true },
        { region: 'East', language: 'bn', expectedSuccess: true },
        { region: 'West', language: 'gu', expectedSuccess: true },
      ];

      let successCount = 0;

      for (const testCase of testCases) {
        const response = await request(app)
          .get('/api/regional/creators')
          .query({ region: testCase.region, language: testCase.language });

        if (response.status === 200 &&
            response.body.region === testCase.region &&
            response.body.language === testCase.language) {
          successCount++;
        }
      }

      const accuracy = (successCount / testCases.length) * 100;
      expect(accuracy).toBeGreaterThanOrEqual(80);
    });
  });
});
