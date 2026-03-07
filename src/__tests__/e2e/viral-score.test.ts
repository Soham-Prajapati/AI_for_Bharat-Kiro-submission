/**
 * E2E Tests for Viral Score Predictor Feature
 * 
 * Tests the complete Viral Score workflow:
 * 1. Predict viral potential (0-100 score)
 * 2. Analyze hook strength, pacing, emotion
 * 3. Match against trending topics
 * 4. Provide optimization suggestions
 * 
 * Feature #11 from FEATURES_MASTER.md
 */

import request from 'supertest';
import app from '../../index';
import { viralPredictorService } from '../../services/viral-predictor.service';
import { transcribeService } from '../../services/transcription.service';
import { bedrockService } from '../../services/bedrock.service';
import { cacheService } from '../../services/cache.service';
import { expectSuccessResponse, expectErrorResponse } from '../setup';

// Mock services
jest.mock('../../services/viral-predictor.service');
jest.mock('../../services/transcription.service');
jest.mock('../../services/bedrock.service');

describe('E2E: Viral Score Predictor', () => {
  const mockTranscript = 'Breaking news! This revolutionary AI tool will change everything. Watch till the end for a surprise!';
  
  const mockViralPrediction = {
    score: 85,
    confidence: 0.92,
    breakdown: {
      hook: 0.95,
      pacing: 0.80,
      emotion: 0.88,
      trends: 0.75,
      length: 0.90
    },
    factors: {
      hook_strength: 'strong',
      emotional_peaks: 3,
      trending_topics: ['AI', 'technology', 'innovation'],
      optimal_length: true,
      engagement_curve: 'ascending'
    },
    suggestions: [
      'Strengthen hook in first 3 seconds',
      'Add emotional peak at 2:30 mark',
      'Include trending hashtag #AIRevolution',
      'Trim to 8 minutes for optimal engagement'
    ],
    estimatedReach: 50000,
    viralProbability: 0.78
  };

  beforeEach(() => {
    jest.clearAllMocks();
    cacheService.clear();

    // Setup default mocks
    (viralPredictorService.predict as jest.Mock).mockResolvedValue(mockViralPrediction);
    (viralPredictorService.analyzeHook as jest.Mock).mockResolvedValue({
      strength: 0.95,
      type: 'question',
      effectiveness: 'high'
    });

    (transcribeService.getTranscriptionStatus as jest.Mock).mockResolvedValue({
      status: 'COMPLETED',
      transcript: mockTranscript
    });

    (bedrockService.analyzeTrends as jest.Mock).mockResolvedValue({
      trending: ['AI', 'technology', 'innovation'],
      relevance: 0.85
    });
  });

  afterEach(() => {
    cacheService.clear();
  });

  describe('POST /api/viral/predict - Predict Viral Score', () => {
    describe('Successful Predictions', () => {
      it('should predict viral score for content', async () => {
        const response = await request(app)
          .post('/api/viral/predict')
          .send({
            transcript: mockTranscript,
            metadata: {
              platform: 'tiktok',
              duration: 60,
              hasMusic: true,
              hasCaptions: true
            }
          })
          .expect(200);

        expectSuccessResponse(response, 200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('prediction');
        expect(response.body).toHaveProperty('analyzedAt');

        // Verify prediction structure
        const prediction = response.body.prediction;
        expect(prediction).toHaveProperty('score');
        expect(prediction).toHaveProperty('confidence');
        expect(prediction).toHaveProperty('breakdown');
        expect(prediction).toHaveProperty('suggestions');
        expect(prediction).toHaveProperty('estimatedReach');

        // Verify service was called
        expect(viralPredictorService.predict).toHaveBeenCalledWith(
          mockTranscript,
          expect.objectContaining({
            platform: 'tiktok'
          })
        );
      });

      it('should return score in valid range (0-100)', async () => {
        const response = await request(app)
          .post('/api/viral/predict')
          .send({
            transcript: mockTranscript,
            metadata: { platform: 'youtube' }
          })
          .expect(200);

        const score = response.body.prediction.score;
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      });

      it('should return confidence in valid range (0-1)', async () => {
        const response = await request(app)
          .post('/api/viral/predict')
          .send({
            transcript: mockTranscript
          })
          .expect(200);

        const confidence = response.body.prediction.confidence;
        expect(confidence).toBeGreaterThanOrEqual(0);
        expect(confidence).toBeLessThanOrEqual(1);
      });

      it('should analyze all scoring factors', async () => {
        const response = await request(app)
          .post('/api/viral/predict')
          .send({
            transcript: mockTranscript
          })
          .expect(200);

        const breakdown = response.body.prediction.breakdown;
        expect(breakdown).toHaveProperty('hook');
        expect(breakdown).toHaveProperty('pacing');
        expect(breakdown).toHaveProperty('emotion');
        expect(breakdown).toHaveProperty('trends');
        expect(breakdown).toHaveProperty('length');

        // All factors should be in valid range
        Object.values(breakdown).forEach((value: any) => {
          expect(value).toBeGreaterThanOrEqual(0);
          expect(value).toBeLessThanOrEqual(1);
        });
      });

      it('should provide actionable suggestions', async () => {
        const response = await request(app)
          .post('/api/viral/predict')
          .send({
            transcript: mockTranscript
          })
          .expect(200);

        const suggestions = response.body.prediction.suggestions;
        expect(Array.isArray(suggestions)).toBe(true);
        expect(suggestions.length).toBeGreaterThan(0);
        
        suggestions.forEach((suggestion: string) => {
          expect(typeof suggestion).toBe('string');
          expect(suggestion.length).toBeGreaterThan(10);
        });
      });

      it('should estimate potential reach', async () => {
        const response = await request(app)
          .post('/api/viral/predict')
          .send({
            transcript: mockTranscript,
            metadata: { platform: 'instagram' }
          })
          .expect(200);

        const reach = response.body.prediction.estimatedReach;
        expect(typeof reach).toBe('number');
        expect(reach).toBeGreaterThan(0);
      });
    });

    describe('Platform-Specific Predictions', () => {
      const platforms = ['youtube', 'tiktok', 'instagram', 'twitter', 'linkedin', 'facebook'];

      platforms.forEach(platform => {
        it(`should predict viral score for ${platform}`, async () => {
          const response = await request(app)
            .post('/api/viral/predict')
            .send({
              transcript: mockTranscript,
              metadata: { platform }
            })
            .expect(200);

          expect(response.body.success).toBe(true);
          expect(response.body.prediction.score).toBeDefined();
          
          expect(viralPredictorService.predict).toHaveBeenCalledWith(
            mockTranscript,
            expect.objectContaining({ platform })
          );
        });
      });

      it('should adjust predictions based on platform characteristics', async () => {
        // TikTok - short form, high energy
        const tiktokResponse = await request(app)
          .post('/api/viral/predict')
          .send({
            transcript: mockTranscript,
            metadata: { platform: 'tiktok', duration: 30 }
          })
          .expect(200);

        // YouTube - long form, educational
        const youtubeResponse = await request(app)
          .post('/api/viral/predict')
          .send({
            transcript: mockTranscript,
            metadata: { platform: 'youtube', duration: 600 }
          })
          .expect(200);

        expect(tiktokResponse.body.prediction).toBeDefined();
        expect(youtubeResponse.body.prediction).toBeDefined();
      });
    });

    describe('Content Type Analysis', () => {
      it('should analyze hook strength', async () => {
        const response = await request(app)
          .post('/api/viral/predict')
          .send({
            transcript: 'BREAKING: Revolutionary discovery changes everything!',
            metadata: { analyzeHook: true }
          })
          .expect(200);

        const breakdown = response.body.prediction.breakdown;
        expect(breakdown.hook).toBeGreaterThan(0.8); // Strong hook
      });

      it('should detect emotional content', async () => {
        const emotionalTranscript = 'This is absolutely incredible! I cannot believe this happened. It brought tears to my eyes!';
        
        const response = await request(app)
          .post('/api/viral/predict')
          .send({
            transcript: emotionalTranscript
          })
          .expect(200);

        const breakdown = response.body.prediction.breakdown;
        expect(breakdown.emotion).toBeDefined();
      });

      it('should identify trending topics', async () => {
        const response = await request(app)
          .post('/api/viral/predict')
          .send({
            transcript: 'AI and ChatGPT are revolutionizing the tech industry'
          })
          .expect(200);

        const factors = response.body.prediction.factors;
        expect(factors.trending_topics).toBeDefined();
        expect(Array.isArray(factors.trending_topics)).toBe(true);
      });

      it('should evaluate content length', async () => {
        const response = await request(app)
          .post('/api/viral/predict')
          .send({
            transcript: mockTranscript,
            metadata: {
              platform: 'tiktok',
              duration: 45 // Optimal for TikTok
            }
          })
          .expect(200);

        const breakdown = response.body.prediction.breakdown;
        expect(breakdown.length).toBeGreaterThan(0.7);
      });

      it('should analyze pacing and engagement curve', async () => {
        const response = await request(app)
          .post('/api/viral/predict')
          .send({
            transcript: mockTranscript,
            metadata: { analyzePacing: true }
          })
          .expect(200);

        const factors = response.body.prediction.factors;
        expect(factors.engagement_curve).toBeDefined();
      });
    });

    describe('Validation Errors', () => {
      it('should return 400 when transcript is missing', async () => {
        const response = await request(app)
          .post('/api/viral/predict')
          .send({
            metadata: { platform: 'youtube' }
          })
          .expect(400);

        expectErrorResponse(response, 400);
        expect(response.body.error).toContain('transcript');
      });

      it('should return 400 when transcript is empty', async () => {
        const response = await request(app)
          .post('/api/viral/predict')
          .send({
            transcript: '',
            metadata: { platform: 'youtube' }
          })
          .expect(400);

        expectErrorResponse(response, 400);
      });

      it('should return 400 when transcript is too short', async () => {
        const response = await request(app)
          .post('/api/viral/predict')
          .send({
            transcript: 'Hi'
          })
          .expect(400);

        expectErrorResponse(response, 400);
        expect(response.body.error).toContain('too short');
      });

      it('should handle prediction without metadata', async () => {
        const response = await request(app)
          .post('/api/viral/predict')
          .send({
            transcript: mockTranscript
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(viralPredictorService.predict).toHaveBeenCalledWith(
          mockTranscript,
          {}
        );
      });
    });

    describe('Service Errors', () => {
      it('should handle prediction service failure', async () => {
        (viralPredictorService.predict as jest.Mock).mockRejectedValue(
          new Error('Prediction failed')
        );

        const response = await request(app)
          .post('/api/viral/predict')
          .send({
            transcript: mockTranscript
          })
          .expect(500);

        expectErrorResponse(response, 500);
      });

      it('should handle trend analysis failure', async () => {
        (bedrockService.analyzeTrends as jest.Mock).mockRejectedValue(
          new Error('Trend analysis failed')
        );

        const response = await request(app)
          .post('/api/viral/predict')
          .send({
            transcript: mockTranscript,
            metadata: { analyzeTrends: true }
          })
          .expect(500);

        expectErrorResponse(response, 500);
      });
    });
  });

  describe('POST /api/viral/optimize - Optimize for Virality', () => {
    describe('Successful Optimization', () => {
      it('should provide optimization recommendations', async () => {
        const response = await request(app)
          .post('/api/viral/optimize')
          .send({
            transcript: mockTranscript,
            currentScore: 65,
            targetScore: 85,
            platform: 'tiktok'
          })
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('optimizations');
        expect(response.body).toHaveProperty('expectedImprovement');

        const optimizations = response.body.optimizations;
        expect(Array.isArray(optimizations)).toBe(true);
        expect(optimizations.length).toBeGreaterThan(0);
      });

      it('should prioritize optimizations by impact', async () => {
        const response = await request(app)
          .post('/api/viral/optimize')
          .send({
            transcript: mockTranscript,
            currentScore: 50,
            targetScore: 80
          })
          .expect(200);

        const optimizations = response.body.optimizations;
        optimizations.forEach((opt: any) => {
          expect(opt).toHaveProperty('priority');
          expect(opt).toHaveProperty('impact');
          expect(opt).toHaveProperty('suggestion');
        });
      });

      it('should provide before/after comparison', async () => {
        const response = await request(app)
          .post('/api/viral/optimize')
          .send({
            transcript: mockTranscript,
            currentScore: 60
          })
          .expect(200);

        expect(response.body).toHaveProperty('before');
        expect(response.body).toHaveProperty('after');
        expect(response.body.after.score).toBeGreaterThan(response.body.before.score);
      });
    });
  });

  describe('GET /api/viral/trends - Get Trending Topics', () => {
    it('should return current trending topics', async () => {
      (bedrockService.analyzeTrends as jest.Mock).mockResolvedValue({
        trends: [
          { topic: 'AI', velocity: 0.95, saturation: 0.3 },
          { topic: 'ChatGPT', velocity: 0.88, saturation: 0.6 },
          { topic: 'Web3', velocity: 0.72, saturation: 0.8 }
        ]
      });

      const response = await request(app)
        .get('/api/viral/trends')
        .query({ platform: 'tiktok' })
        .expect(200);

      expect(response.body).toHaveProperty('trends');
      expect(Array.isArray(response.body.trends)).toBe(true);
      
      response.body.trends.forEach((trend: any) => {
        expect(trend).toHaveProperty('topic');
        expect(trend).toHaveProperty('velocity');
        expect(trend).toHaveProperty('saturation');
      });
    });

    it('should filter trends by platform', async () => {
      const response = await request(app)
        .get('/api/viral/trends')
        .query({ platform: 'linkedin' })
        .expect(200);

      expect(response.body.platform).toBe('linkedin');
      expect(response.body.trends).toBeDefined();
    });
  });

  describe('Complete Viral Optimization Workflow', () => {
    it('should complete predict → optimize → re-predict cycle', async () => {
      // Step 1: Initial prediction
      const initialPrediction = await request(app)
        .post('/api/viral/predict')
        .send({
          transcript: mockTranscript,
          metadata: { platform: 'youtube' }
        })
        .expect(200);

      const initialScore = initialPrediction.body.prediction.score;
      expect(initialScore).toBeDefined();

      // Step 2: Get optimization suggestions
      const optimization = await request(app)
        .post('/api/viral/optimize')
        .send({
          transcript: mockTranscript,
          currentScore: initialScore,
          targetScore: 90,
          platform: 'youtube'
        })
        .expect(200);

      expect(optimization.body.optimizations).toBeDefined();
      expect(optimization.body.optimizations.length).toBeGreaterThan(0);

      // Step 3: Apply optimizations and re-predict
      const optimizedTranscript = mockTranscript + ' ' + optimization.body.optimizations[0].suggestion;
      
      (viralPredictorService.predict as jest.Mock).mockResolvedValueOnce({
        ...mockViralPrediction,
        score: 92
      });

      const finalPrediction = await request(app)
        .post('/api/viral/predict')
        .send({
          transcript: optimizedTranscript,
          metadata: { platform: 'youtube' }
        })
        .expect(200);

      const finalScore = finalPrediction.body.prediction.score;
      expect(finalScore).toBeGreaterThanOrEqual(initialScore);
    });

    it('should integrate with content generation', async () => {
      // Generate content
      const generateResponse = await request(app)
        .post('/api/generate')
        .send({
          jobId: 'test-job-123',
          platforms: ['tiktok'],
          optimizeForViral: true
        })
        .expect(200);

      expect(generateResponse.body.success).toBe(true);

      // Predict viral score for generated content
      const content = generateResponse.body.results.tiktok.content;
      
      const viralResponse = await request(app)
        .post('/api/viral/predict')
        .send({
          transcript: content,
          metadata: { platform: 'tiktok' }
        })
        .expect(200);

      expect(viralResponse.body.prediction.score).toBeDefined();
    });

    it('should handle batch predictions', async () => {
      const transcripts = [
        'First video about AI technology',
        'Second video about cooking recipes',
        'Third video about travel destinations'
      ];

      const requests = transcripts.map(transcript =>
        request(app)
          .post('/api/viral/predict')
          .send({ transcript })
      );

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.prediction.score).toBeDefined();
      });

      expect(viralPredictorService.predict).toHaveBeenCalledTimes(3);
    });
  });

  describe('Viral Score History', () => {
    it('should track viral score history for user', async () => {
      const userId = 'test-user-123';

      // Make multiple predictions
      await request(app)
        .post('/api/viral/predict')
        .send({
          transcript: mockTranscript,
          userId
        })
        .expect(200);

      // Get history
      const response = await request(app)
        .get(`/api/viral/history/${userId}`)
        .expect(200);

      expect(response.body).toHaveProperty('history');
      expect(Array.isArray(response.body.history)).toBe(true);
    });

    it('should show score trends over time', async () => {
      const userId = 'test-user-456';

      const response = await request(app)
        .get(`/api/viral/history/${userId}`)
        .query({ includeTrends: true })
        .expect(200);

      expect(response.body).toHaveProperty('trends');
      expect(response.body.trends).toHaveProperty('average');
      expect(response.body.trends).toHaveProperty('improvement');
    });
  });

  describe('A/B Testing Support', () => {
    it('should compare viral scores between variants', async () => {
      const response = await request(app)
        .post('/api/viral/compare')
        .send({
          variantA: 'First version of the content',
          variantB: 'Second improved version',
          platform: 'youtube'
        })
        .expect(200);

      expect(response.body).toHaveProperty('variantA');
      expect(response.body).toHaveProperty('variantB');
      expect(response.body).toHaveProperty('winner');
      expect(response.body).toHaveProperty('improvement');
    });
  });
});
