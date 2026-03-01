/**
 * Integration Tests for Analytics API Route
 * Tests GET /api/analytics/:userId endpoint
 */

import request from 'supertest';
import express from 'express';
import analyticsRoute from '../../routes/analytics.route';
import { cacheService } from '../../services/cache.service';
import { ecosystemAnalyticsService } from '../../services/ecosystem-analytics.service';
import { expectSuccessResponse, expectErrorResponse } from '../setup';
import { errorHandler } from '../../middleware/error.middleware';

// Mock the ecosystem analytics service
jest.mock('../../services/ecosystem-analytics.service', () => ({
  ecosystemAnalyticsService: {
    getAnalytics: jest.fn(),
  },
}));

describe('Analytics API Integration Tests', () => {
  let app: express.Application;

  const mockAnalyticsData = {
    platforms: {
      youtube: {
        followers: 125000,
        engagement: 0.045,
        topPosts: 15,
        avgViews: 8500,
        growthRate: 0.12,
      },
      instagram: {
        followers: 45000,
        engagement: 0.068,
        topPosts: 8,
        avgViews: 3200,
        growthRate: 0.08,
      },
      tiktok: {
        followers: 89000,
        engagement: 0.092,
        topPosts: 20,
        avgViews: 12000,
        growthRate: 0.25,
      },
    },
    recommendations: [
      'Focus more on TikTok - highest engagement and growth rate',
      'LinkedIn shows strong growth potential',
    ],
    bestPerforming: 'tiktok',
    contentGaps: ['Short-form video content on YouTube'],
    overallScore: 7.8,
  };

  beforeEach(() => {
    // Create a fresh Express app for each test
    app = express();
    app.use(express.json());
    app.use('/api/analytics', analyticsRoute);
    app.use(errorHandler);

    // Clear cache before each test
    cacheService.clear();
    
    // Reset all mocks
    jest.clearAllMocks();
    
    // Set up default mock implementation
    (ecosystemAnalyticsService.getAnalytics as jest.Mock).mockResolvedValue(mockAnalyticsData);
  });

  afterEach(() => {
    // Clean up cache after each test
    cacheService.clear();
  });

  describe('GET /api/analytics/:userId', () => {
    describe('Successful Analytics Retrieval', () => {
      it('should return 200 with analytics data for valid userId', async () => {
        const userId = 'test-user-123';
        
        const response = await request(app)
          .get(`/api/analytics/${userId}`)
          .expect(200);

        expectSuccessResponse(response, 200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('userId', userId);
        expect(response.body).toHaveProperty('analytics');
        expect(response.body).toHaveProperty('cached', false);
        expect(response.body).toHaveProperty('fetchedAt');
        
        // Verify analytics data structure
        expect(response.body.analytics).toEqual(mockAnalyticsData);
        
        // Verify service was called
        expect(ecosystemAnalyticsService.getAnalytics).toHaveBeenCalledWith(userId);
        expect(ecosystemAnalyticsService.getAnalytics).toHaveBeenCalledTimes(1);
      });

      it('should return analytics with correct response structure', async () => {
        const userId = 'creator-456';
        
        const response = await request(app)
          .get(`/api/analytics/${userId}`)
          .expect(200);

        // Verify all required fields are present
        expect(response.body).toHaveProperty('success');
        expect(response.body).toHaveProperty('userId');
        expect(response.body).toHaveProperty('analytics');
        expect(response.body).toHaveProperty('cached');
        expect(response.body).toHaveProperty('fetchedAt');
        
        // Verify field types
        expect(typeof response.body.success).toBe('boolean');
        expect(typeof response.body.userId).toBe('string');
        expect(typeof response.body.analytics).toBe('object');
        expect(typeof response.body.cached).toBe('boolean');
        expect(typeof response.body.fetchedAt).toBe('string');
        
        // Verify fetchedAt is valid ISO date
        expect(() => new Date(response.body.fetchedAt)).not.toThrow();
        expect(new Date(response.body.fetchedAt).toISOString()).toBe(response.body.fetchedAt);
      });

      it('should return analytics with complete platform data', async () => {
        const userId = 'platform-test-user';
        
        const response = await request(app)
          .get(`/api/analytics/${userId}`)
          .expect(200);

        const { analytics } = response.body;
        
        // Verify platforms object exists
        expect(analytics).toHaveProperty('platforms');
        expect(typeof analytics.platforms).toBe('object');
        
        // Verify platform stats structure
        const platforms = ['youtube', 'instagram', 'tiktok'];
        platforms.forEach(platform => {
          if (analytics.platforms[platform]) {
            expect(analytics.platforms[platform]).toHaveProperty('followers');
            expect(analytics.platforms[platform]).toHaveProperty('engagement');
            expect(analytics.platforms[platform]).toHaveProperty('topPosts');
            expect(analytics.platforms[platform]).toHaveProperty('avgViews');
            expect(analytics.platforms[platform]).toHaveProperty('growthRate');
          }
        });
        
        // Verify other analytics fields
        expect(analytics).toHaveProperty('recommendations');
        expect(Array.isArray(analytics.recommendations)).toBe(true);
        expect(analytics).toHaveProperty('bestPerforming');
        expect(analytics).toHaveProperty('contentGaps');
        expect(Array.isArray(analytics.contentGaps)).toBe(true);
        expect(analytics).toHaveProperty('overallScore');
        expect(typeof analytics.overallScore).toBe('number');
      });
    });

    describe('Caching Behavior', () => {
      it('should return cached: false on first call', async () => {
        const userId = 'cache-test-user';
        
        const response = await request(app)
          .get(`/api/analytics/${userId}`)
          .expect(200);

        expect(response.body.cached).toBe(false);
        expect(ecosystemAnalyticsService.getAnalytics).toHaveBeenCalledTimes(1);
      });

      it('should return cached: true on second call', async () => {
        const userId = 'cache-test-user-2';
        
        // First call - should fetch fresh data
        const firstResponse = await request(app)
          .get(`/api/analytics/${userId}`)
          .expect(200);

        expect(firstResponse.body.cached).toBe(false);
        expect(ecosystemAnalyticsService.getAnalytics).toHaveBeenCalledTimes(1);
        
        // Second call - should return cached data
        const secondResponse = await request(app)
          .get(`/api/analytics/${userId}`)
          .expect(200);

        expect(secondResponse.body.cached).toBe(true);
        expect(secondResponse.body.analytics).toEqual(firstResponse.body.analytics);
        
        // Service should not be called again
        expect(ecosystemAnalyticsService.getAnalytics).toHaveBeenCalledTimes(1);
      });

      it('should cache data for different users independently', async () => {
        const userId1 = 'user-one';
        const userId2 = 'user-two';
        
        // First user - first call
        await request(app)
          .get(`/api/analytics/${userId1}`)
          .expect(200);

        expect(ecosystemAnalyticsService.getAnalytics).toHaveBeenCalledWith(userId1);
        
        // Second user - first call (should not be cached)
        const response2 = await request(app)
          .get(`/api/analytics/${userId2}`)
          .expect(200);

        expect(response2.body.cached).toBe(false);
        expect(ecosystemAnalyticsService.getAnalytics).toHaveBeenCalledWith(userId2);
        expect(ecosystemAnalyticsService.getAnalytics).toHaveBeenCalledTimes(2);
        
        // First user - second call (should be cached)
        const response3 = await request(app)
          .get(`/api/analytics/${userId1}`)
          .expect(200);

        expect(response3.body.cached).toBe(true);
        expect(ecosystemAnalyticsService.getAnalytics).toHaveBeenCalledTimes(2);
      });

      it('should return same analytics data from cache', async () => {
        const userId = 'consistency-test';
        
        // First call
        const firstResponse = await request(app)
          .get(`/api/analytics/${userId}`)
          .expect(200);

        // Second call (cached)
        const secondResponse = await request(app)
          .get(`/api/analytics/${userId}`)
          .expect(200);

        // Analytics data should be identical
        expect(secondResponse.body.analytics).toEqual(firstResponse.body.analytics);
        expect(secondResponse.body.userId).toBe(firstResponse.body.userId);
      });
    });

    describe('Error Handling', () => {
      it('should return 404 for missing userId parameter', async () => {
        const response = await request(app)
          .get('/api/analytics/')
          .expect(404);

        expect(response.body.success).not.toBe(true);
      });

      it('should handle service errors gracefully', async () => {
        const userId = 'error-test-user';
        const errorMessage = 'Service unavailable';
        
        // Mock service to throw error
        (ecosystemAnalyticsService.getAnalytics as jest.Mock).mockRejectedValue(
          new Error(errorMessage)
        );

        const response = await request(app)
          .get(`/api/analytics/${userId}`)
          .expect(500);

        expect(response.body.success).not.toBe(true);
      });

      it('should handle empty userId gracefully', async () => {
        // Note: Express will treat empty string as missing parameter
        const response = await request(app)
          .get('/api/analytics/ ')
          .expect(404);

        expect(response.body.success).not.toBe(true);
      });

      it('should handle special characters in userId', async () => {
        const userId = 'user@email.com';
        
        const response = await request(app)
          .get(`/api/analytics/${encodeURIComponent(userId)}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.userId).toBe(userId);
        expect(ecosystemAnalyticsService.getAnalytics).toHaveBeenCalledWith(userId);
      });

      it('should handle very long userId strings', async () => {
        const userId = 'a'.repeat(1000);
        
        const response = await request(app)
          .get(`/api/analytics/${userId}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.userId).toBe(userId);
      });
    });

    describe('Response Contract Validation', () => {
      it('should always include success field', async () => {
        const response = await request(app)
          .get('/api/analytics/test-user')
          .expect(200);

        expect(response.body).toHaveProperty('success');
        expect(response.body.success).toBe(true);
      });

      it('should always include userId field', async () => {
        const userId = 'contract-test';
        
        const response = await request(app)
          .get(`/api/analytics/${userId}`)
          .expect(200);

        expect(response.body).toHaveProperty('userId');
        expect(response.body.userId).toBe(userId);
      });

      it('should always include analytics field', async () => {
        const response = await request(app)
          .get('/api/analytics/test-user')
          .expect(200);

        expect(response.body).toHaveProperty('analytics');
        expect(response.body.analytics).toBeDefined();
      });

      it('should always include cached field', async () => {
        const response = await request(app)
          .get('/api/analytics/test-user')
          .expect(200);

        expect(response.body).toHaveProperty('cached');
        expect(typeof response.body.cached).toBe('boolean');
      });

      it('should always include fetchedAt field', async () => {
        const response = await request(app)
          .get('/api/analytics/test-user')
          .expect(200);

        expect(response.body).toHaveProperty('fetchedAt');
        expect(typeof response.body.fetchedAt).toBe('string');
      });

      it('should return valid JSON response', async () => {
        const response = await request(app)
          .get('/api/analytics/test-user')
          .expect(200)
          .expect('Content-Type', /json/);

        expect(() => JSON.stringify(response.body)).not.toThrow();
      });
    });
  });
});
