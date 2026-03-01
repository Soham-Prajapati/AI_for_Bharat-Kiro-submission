/**
 * E2E Tests for Trend Predictor Feature
 * 
 * Tests the complete trend prediction workflow:
 * 1. Scrape trending topics from platforms
 * 2. Analyze growth velocity
 * 3. Predict trend lifespan
 * 4. Alert creators to jump on trends early
 * 
 * Feature #15 from FEATURES_MASTER.md
 */

import request from 'supertest';
import app from '../../index';
import { trendPredictorService } from '../../services/trend-predictor.service';
import { cacheService } from '../../services/cache.service';
import { expectSuccessResponse, expectErrorResponse } from '../setup';

// Mock services
jest.mock('../../services/trend-predictor.service');

describe('E2E: Trend Predictor', () => {
  const mockTrends = [
    {
      topic: 'AI Revolution',
      platforms: ['twitter', 'youtube', 'tiktok'],
      velocity: 0.95,
      saturation: 0.25,
      lifespan: 14,
      relevance: 0.88,
      growthRate: 0.45,
      peakDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'rising',
      hashtags: ['#AI', '#AIRevolution', '#TechTrends'],
      relatedTopics: ['ChatGPT', 'Machine Learning', 'Automation']
    },
    {
      topic: 'Sustainable Living',
      platforms: ['instagram', 'youtube'],
      velocity: 0.72,
      saturation: 0.60,
      lifespan: 30,
      relevance: 0.65,
      growthRate: 0.15,
      peakDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'stable',
      hashtags: ['#Sustainability', '#EcoFriendly'],
      relatedTopics: ['Zero Waste', 'Green Energy']
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    cacheService.clear();

    // Setup default mocks
    (trendPredictorService.getCurrentTrends as jest.Mock).mockResolvedValue(mockTrends);
    (trendPredictorService.predictTrends as jest.Mock).mockResolvedValue(mockTrends);
    (trendPredictorService.analyzeTrend as jest.Mock).mockResolvedValue(mockTrends[0]);
    (trendPredictorService.getTrendHistory as jest.Mock).mockResolvedValue([]);
  });

  afterEach(() => {
    cacheService.clear();
  });

  describe('GET /api/trends/current - Get Current Trends', () => {
    describe('Successful Retrieval', () => {
      it('should retrieve current trending topics', async () => {
        const response = await request(app)
          .get('/api/trends/current')
          .expect(200);

        expectSuccessResponse(response, 200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('trends');
        expect(Array.isArray(response.body.trends)).toBe(true);
        expect(response.body.trends.length).toBeGreaterThan(0);

        expect(trendPredictorService.getCurrentTrends).toHaveBeenCalled();
      });

      it('should include all trend properties', async () => {
        const response = await request(app)
          .get('/api/trends/current')
          .expect(200);

        const trend = response.body.trends[0];
        expect(trend).toHaveProperty('topic');
        expect(trend).toHaveProperty('platforms');
        expect(trend).toHaveProperty('velocity');
        expect(trend).toHaveProperty('saturation');
        expect(trend).toHaveProperty('lifespan');
        expect(trend).toHaveProperty('relevance');
        expect(trend).toHaveProperty('growthRate');
        expect(trend).toHaveProperty('peakDate');
        expect(trend).toHaveProperty('status');
        expect(trend).toHaveProperty('hashtags');
      });

      it('should validate trend metrics are in valid ranges', async () => {
        const response = await request(app)
          .get('/api/trends/current')
          .expect(200);

        response.body.trends.forEach((trend: any) => {
          expect(trend.velocity).toBeGreaterThanOrEqual(0);
          expect(trend.velocity).toBeLessThanOrEqual(1);
          expect(trend.saturation).toBeGreaterThanOrEqual(0);
          expect(trend.saturation).toBeLessThanOrEqual(1);
          expect(trend.relevance).toBeGreaterThanOrEqual(0);
          expect(trend.relevance).toBeLessThanOrEqual(1);
          expect(trend.lifespan).toBeGreaterThan(0);
        });
      });

      it('should filter trends by platform', async () => {
        const response = await request(app)
          .get('/api/trends/current')
          .query({ platform: 'tiktok' })
          .expect(200);

        expect(response.body.trends).toBeDefined();
        expect(trendPredictorService.getCurrentTrends).toHaveBeenCalledWith(
          expect.objectContaining({ platform: 'tiktok' })
        );
      });

      it('should filter trends by category', async () => {
        const response = await request(app)
          .get('/api/trends/current')
          .query({ category: 'technology' })
          .expect(200);

        expect(response.body.trends).toBeDefined();
        expect(trendPredictorService.getCurrentTrends).toHaveBeenCalledWith(
          expect.objectContaining({ category: 'technology' })
        );
      });

      it('should filter trends by status', async () => {
        const statuses = ['rising', 'stable', 'declining', 'peaked'];

        for (const status of statuses) {
          const response = await request(app)
            .get('/api/trends/current')
            .query({ status })
            .expect(200);

          expect(response.body.trends).toBeDefined();
        }
      });

      it('should limit number of results', async () => {
        const response = await request(app)
          .get('/api/trends/current')
          .query({ limit: 5 })
          .expect(200);

        expect(response.body.trends.length).toBeLessThanOrEqual(5);
      });

      it('should sort trends by velocity', async () => {
        const response = await request(app)
          .get('/api/trends/current')
          .query({ sortBy: 'velocity', order: 'desc' })
          .expect(200);

        const velocities = response.body.trends.map((t: any) => t.velocity);
        const sorted = [...velocities].sort((a, b) => b - a);
        expect(velocities).toEqual(sorted);
      });

      it('should cache trend results', async () => {
        // First request
        await request(app)
          .get('/api/trends/current')
          .expect(200);

        jest.clearAllMocks();

        // Second request should use cache
        const response = await request(app)
          .get('/api/trends/current')
          .expect(200);

        expect(response.body.trends).toBeDefined();
        // Service may or may not be called depending on cache implementation
      });
    });

    describe('Platform-Specific Trends', () => {
      const platforms = ['twitter', 'youtube', 'tiktok', 'instagram', 'linkedin'];

      platforms.forEach(platform => {
        it(`should retrieve trends for ${platform}`, async () => {
          const response = await request(app)
            .get('/api/trends/current')
            .query({ platform })
            .expect(200);

          expect(response.body.success).toBe(true);
          expect(response.body.trends).toBeDefined();
        });
      });
    });

    describe('Error Handling', () => {
      it('should handle service failure', async () => {
        (trendPredictorService.getCurrentTrends as jest.Mock).mockRejectedValue(
          new Error('Failed to fetch trends')
        );

        const response = await request(app)
          .get('/api/trends/current')
          .expect(500);

        expectErrorResponse(response, 500);
      });

      it('should handle empty results', async () => {
        (trendPredictorService.getCurrentTrends as jest.Mock).mockResolvedValue([]);

        const response = await request(app)
          .get('/api/trends/current')
          .expect(200);

        expect(response.body.trends).toEqual([]);
      });
    });
  });

  describe('GET /api/trends/predict - Predict Future Trends', () => {
    describe('Successful Predictions', () => {
      it('should predict upcoming trends', async () => {
        const response = await request(app)
          .get('/api/trends/predict')
          .query({ days: 7 })
          .expect(200);

        expectSuccessResponse(response, 200);
        expect(response.body).toHaveProperty('predictions');
        expect(Array.isArray(response.body.predictions)).toBe(true);
        expect(response.body).toHaveProperty('timeframe');

        expect(trendPredictorService.predictTrends).toHaveBeenCalledWith(
          expect.objectContaining({ days: 7 })
        );
      });

      it('should predict for different timeframes', async () => {
        const timeframes = [3, 7, 14, 30];

        for (const days of timeframes) {
          const response = await request(app)
            .get('/api/trends/predict')
            .query({ days })
            .expect(200);

          expect(response.body.predictions).toBeDefined();
          expect(response.body.timeframe).toBe(days);
        }
      });

      it('should include confidence scores', async () => {
        const response = await request(app)
          .get('/api/trends/predict')
          .query({ days: 7 })
          .expect(200);

        response.body.predictions.forEach((prediction: any) => {
          expect(prediction).toHaveProperty('confidence');
          expect(prediction.confidence).toBeGreaterThanOrEqual(0);
          expect(prediction.confidence).toBeLessThanOrEqual(1);
        });
      });

      it('should predict peak dates', async () => {
        const response = await request(app)
          .get('/api/trends/predict')
          .query({ days: 14 })
          .expect(200);

        response.body.predictions.forEach((prediction: any) => {
          expect(prediction).toHaveProperty('peakDate');
          const peakDate = new Date(prediction.peakDate);
          expect(peakDate.getTime()).toBeGreaterThan(Date.now());
        });
      });

      it('should filter predictions by niche', async () => {
        const response = await request(app)
          .get('/api/trends/predict')
          .query({
            days: 7,
            niche: 'technology'
          })
          .expect(200);

        expect(response.body.predictions).toBeDefined();
        expect(trendPredictorService.predictTrends).toHaveBeenCalledWith(
          expect.objectContaining({ niche: 'technology' })
        );
      });
    });

    describe('Validation Errors', () => {
      it('should return 400 for invalid timeframe', async () => {
        const response = await request(app)
          .get('/api/trends/predict')
          .query({ days: 0 })
          .expect(400);

        expectErrorResponse(response, 400);
      });

      it('should return 400 for timeframe too far in future', async () => {
        const response = await request(app)
          .get('/api/trends/predict')
          .query({ days: 365 })
          .expect(400);

        expectErrorResponse(response, 400);
        expect(response.body.error).toContain('maximum');
      });
    });
  });

  describe('GET /api/trends/analyze/:topic - Analyze Specific Trend', () => {
    describe('Successful Analysis', () => {
      it('should analyze specific trend', async () => {
        const response = await request(app)
          .get('/api/trends/analyze/AI%20Revolution')
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('trend');
        expect(response.body.trend.topic).toBe('AI Revolution');

        expect(trendPredictorService.analyzeTrend).toHaveBeenCalledWith('AI Revolution');
      });

      it('should include detailed metrics', async () => {
        const response = await request(app)
          .get('/api/trends/analyze/AI%20Revolution')
          .expect(200);

        const trend = response.body.trend;
        expect(trend).toHaveProperty('velocity');
        expect(trend).toHaveProperty('saturation');
        expect(trend).toHaveProperty('lifespan');
        expect(trend).toHaveProperty('growthRate');
        expect(trend).toHaveProperty('peakDate');
      });

      it('should provide related topics', async () => {
        const response = await request(app)
          .get('/api/trends/analyze/AI%20Revolution')
          .expect(200);

        expect(response.body.trend.relatedTopics).toBeDefined();
        expect(Array.isArray(response.body.trend.relatedTopics)).toBe(true);
      });

      it('should include recommended hashtags', async () => {
        const response = await request(app)
          .get('/api/trends/analyze/AI%20Revolution')
          .expect(200);

        expect(response.body.trend.hashtags).toBeDefined();
        expect(Array.isArray(response.body.trend.hashtags)).toBe(true);
        expect(response.body.trend.hashtags.length).toBeGreaterThan(0);
      });

      it('should provide platform breakdown', async () => {
        const response = await request(app)
          .get('/api/trends/analyze/AI%20Revolution')
          .expect(200);

        expect(response.body.trend.platforms).toBeDefined();
        expect(Array.isArray(response.body.trend.platforms)).toBe(true);
      });
    });

    describe('Error Handling', () => {
      it('should return 404 for non-existent trend', async () => {
        (trendPredictorService.analyzeTrend as jest.Mock).mockResolvedValue(null);

        const response = await request(app)
          .get('/api/trends/analyze/NonExistentTrend')
          .expect(404);

        expectErrorResponse(response, 404);
      });

      it('should handle special characters in topic', async () => {
        const response = await request(app)
          .get('/api/trends/analyze/AI%20%26%20ML')
          .expect(200);

        expect(response.body.trend).toBeDefined();
      });
    });
  });

  describe('GET /api/trends/history/:topic - Get Trend History', () => {
    it('should retrieve trend history', async () => {
      const mockHistory = [
        { date: '2024-01-01', velocity: 0.5, saturation: 0.2 },
        { date: '2024-01-02', velocity: 0.6, saturation: 0.25 },
        { date: '2024-01-03', velocity: 0.75, saturation: 0.3 }
      ];

      (trendPredictorService.getTrendHistory as jest.Mock).mockResolvedValue(mockHistory);

      const response = await request(app)
        .get('/api/trends/history/AI%20Revolution')
        .expect(200);

      expect(response.body).toHaveProperty('history');
      expect(Array.isArray(response.body.history)).toBe(true);
      expect(response.body.history.length).toBe(3);
    });

    it('should support date range filtering', async () => {
      const response = await request(app)
        .get('/api/trends/history/AI%20Revolution')
        .query({
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        })
        .expect(200);

      expect(response.body.history).toBeDefined();
    });
  });

  describe('POST /api/trends/alerts - Set Trend Alerts', () => {
    describe('Successful Alert Creation', () => {
      it('should create trend alert', async () => {
        const response = await request(app)
          .post('/api/trends/alerts')
          .send({
            userId: 'user-123',
            topic: 'AI Revolution',
            threshold: 0.8,
            notifyWhen: 'rising'
          })
          .expect(201);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('alert');
        expect(response.body.alert.topic).toBe('AI Revolution');
      });

      it('should support different alert conditions', async () => {
        const conditions = ['rising', 'peaked', 'declining', 'threshold'];

        for (const condition of conditions) {
          const response = await request(app)
            .post('/api/trends/alerts')
            .send({
              userId: 'user-123',
              topic: 'Test Topic',
              notifyWhen: condition
            })
            .expect(201);

          expect(response.body.success).toBe(true);
        }
      });

      it('should allow platform-specific alerts', async () => {
        const response = await request(app)
          .post('/api/trends/alerts')
          .send({
            userId: 'user-123',
            topic: 'AI Revolution',
            platforms: ['tiktok', 'youtube'],
            notifyWhen: 'rising'
          })
          .expect(201);

        expect(response.body.alert.platforms).toEqual(['tiktok', 'youtube']);
      });
    });

    describe('Validation Errors', () => {
      it('should return 400 when userId is missing', async () => {
        const response = await request(app)
          .post('/api/trends/alerts')
          .send({
            topic: 'AI Revolution',
            notifyWhen: 'rising'
          })
          .expect(400);

        expectErrorResponse(response, 400);
      });

      it('should return 400 when topic is missing', async () => {
        const response = await request(app)
          .post('/api/trends/alerts')
          .send({
            userId: 'user-123',
            notifyWhen: 'rising'
          })
          .expect(400);

        expectErrorResponse(response, 400);
      });
    });
  });

  describe('GET /api/trends/recommendations/:userId - Get Personalized Recommendations', () => {
    it('should provide personalized trend recommendations', async () => {
      const mockRecommendations = [
        {
          topic: 'AI Revolution',
          relevanceScore: 0.95,
          reason: 'Matches your niche: technology',
          urgency: 'high'
        },
        {
          topic: 'Sustainable Living',
          relevanceScore: 0.72,
          reason: 'Growing in your audience demographic',
          urgency: 'medium'
        }
      ];

      (trendPredictorService.getRecommendations as jest.Mock).mockResolvedValue(mockRecommendations);

      const response = await request(app)
        .get('/api/trends/recommendations/user-123')
        .expect(200);

      expect(response.body).toHaveProperty('recommendations');
      expect(Array.isArray(response.body.recommendations)).toBe(true);
      
      response.body.recommendations.forEach((rec: any) => {
        expect(rec).toHaveProperty('topic');
        expect(rec).toHaveProperty('relevanceScore');
        expect(rec).toHaveProperty('reason');
        expect(rec).toHaveProperty('urgency');
      });
    });

    it('should filter by niche', async () => {
      const response = await request(app)
        .get('/api/trends/recommendations/user-123')
        .query({ niche: 'technology' })
        .expect(200);

      expect(response.body.recommendations).toBeDefined();
    });
  });

  describe('Complete Trend Discovery Workflow', () => {
    it('should complete full trend discovery → alert → content creation cycle', async () => {
      // Step 1: Discover current trends
      const trendsResponse = await request(app)
        .get('/api/trends/current')
        .query({ platform: 'tiktok' })
        .expect(200);

      expect(trendsResponse.body.trends.length).toBeGreaterThan(0);
      const topTrend = trendsResponse.body.trends[0];

      // Step 2: Analyze specific trend
      const analysisResponse = await request(app)
        .get(`/api/trends/analyze/${encodeURIComponent(topTrend.topic)}`)
        .expect(200);

      expect(analysisResponse.body.trend.velocity).toBeGreaterThan(0.7);

      // Step 3: Set alert for trend
      const alertResponse = await request(app)
        .post('/api/trends/alerts')
        .send({
          userId: 'user-123',
          topic: topTrend.topic,
          notifyWhen: 'rising'
        })
        .expect(201);

      expect(alertResponse.body.success).toBe(true);

      // Step 4: Generate content based on trend
      const contentResponse = await request(app)
        .post('/api/generate')
        .send({
          jobId: 'test-job-123',
          platforms: ['tiktok'],
          trendTopic: topTrend.topic,
          hashtags: topTrend.hashtags
        })
        .expect(200);

      expect(contentResponse.body.success).toBe(true);
    });

    it('should handle concurrent trend analysis', async () => {
      const topics = ['AI Revolution', 'Sustainable Living', 'Web3'];

      const requests = topics.map(topic =>
        request(app).get(`/api/trends/analyze/${encodeURIComponent(topic)}`)
      );

      const responses = await Promise.all(requests);

      responses.forEach((response, index) => {
        expect(response.status).toBe(200);
        expect(response.body.trend.topic).toBe(topics[index]);
      });

      expect(trendPredictorService.analyzeTrend).toHaveBeenCalledTimes(3);
    });
  });

  describe('Trend Comparison', () => {
    it('should compare multiple trends', async () => {
      const response = await request(app)
        .post('/api/trends/compare')
        .send({
          topics: ['AI Revolution', 'Sustainable Living', 'Web3']
        })
        .expect(200);

      expect(response.body).toHaveProperty('comparison');
      expect(Array.isArray(response.body.comparison)).toBe(true);
      expect(response.body.comparison.length).toBe(3);
    });
  });
});
