/**
 * E2E Tests for Creator DNA Analysis Feature
 * 
 * Tests the complete Creator DNA workflow:
 * 1. Analyze creator's personality from video history
 * 2. Build personality profile
 * 3. Use profile to guide content generation
 * 4. Update profile with new content
 * 
 * Feature #9 from FEATURES_MASTER.md
 */

import request from 'supertest';
import app from '../../index';
import { dnaAnalysisService } from '../../services/dna-analysis.service';
import { bedrockService } from '../../services/bedrock.service';
import { transcribeService } from '../../services/transcription.service';
import { cacheService } from '../../services/cache.service';
import { expectSuccessResponse, expectErrorResponse } from '../setup';

// Mock services
jest.mock('../../services/dna-analysis.service');
jest.mock('../../services/bedrock.service');
jest.mock('../../services/transcription.service');

describe('E2E: Creator DNA Analysis', () => {
  const testUserId = 'creator-test-user';
  const mockVideoIds = ['video-1', 'video-2', 'video-3', 'video-4', 'video-5'];
  
  const mockDNAProfile = {
    archetype: 'educator',
    traits: {
      energy: 0.8,
      formality: 0.4,
      humor: 0.6,
      technical_depth: 0.9,
      storytelling: 0.7
    },
    topics: ['technology', 'programming', 'AI', 'tutorials'],
    tone: 'casual but informative',
    vocabulary_level: 'intermediate',
    signature_phrases: ["let's dive in", "here's the thing", 'pretty cool'],
    pacing: {
      words_per_minute: 150,
      avg_video_length: 600
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    cacheService.clear();

    // Setup default mocks
    (dnaAnalysisService.analyze as jest.Mock).mockResolvedValue(mockDNAProfile);
    (dnaAnalysisService.getProfile as jest.Mock).mockResolvedValue(mockDNAProfile);
    (dnaAnalysisService.updateProfile as jest.Mock).mockResolvedValue({
      ...mockDNAProfile,
      updated: true
    });

    (transcribeService.getTranscriptionStatus as jest.Mock).mockResolvedValue({
      status: 'COMPLETED',
      transcript: 'Sample transcript for DNA analysis'
    });

    (bedrockService.generatePlatformContent as jest.Mock).mockResolvedValue({
      content: 'Generated content with DNA profile applied',
      metadata: { dna_applied: true }
    });
  });

  afterEach(() => {
    cacheService.clear();
  });

  describe('POST /api/dna/analyze - Analyze Creator DNA', () => {
    describe('Successful Analysis', () => {
      it('should analyze creator DNA from video history', async () => {
        const response = await request(app)
          .post('/api/dna/analyze')
          .send({
            userId: testUserId,
            videoIds: mockVideoIds
          })
          .expect(200);

        expectSuccessResponse(response, 200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('userId', testUserId);
        expect(response.body).toHaveProperty('videoCount', mockVideoIds.length);
        expect(response.body).toHaveProperty('profile');
        expect(response.body).toHaveProperty('analyzedAt');

        // Verify profile structure
        const profile = response.body.profile;
        expect(profile).toHaveProperty('archetype');
        expect(profile).toHaveProperty('traits');
        expect(profile).toHaveProperty('topics');
        expect(profile).toHaveProperty('tone');
        expect(profile).toHaveProperty('vocabulary_level');
        expect(profile).toHaveProperty('signature_phrases');

        // Verify service was called
        expect(dnaAnalysisService.analyze).toHaveBeenCalledWith({
          userId: testUserId,
          videoIds: mockVideoIds
        });
      });

      it('should analyze with minimum 5 videos', async () => {
        const response = await request(app)
          .post('/api/dna/analyze')
          .send({
            userId: testUserId,
            videoIds: mockVideoIds.slice(0, 5)
          })
          .expect(200);

        expect(response.body.videoCount).toBe(5);
        expect(response.body.profile).toBeDefined();
      });

      it('should analyze with large video history (50 videos)', async () => {
        const largeVideoIds = Array.from({ length: 50 }, (_, i) => `video-${i + 1}`);

        const response = await request(app)
          .post('/api/dna/analyze')
          .send({
            userId: testUserId,
            videoIds: largeVideoIds
          })
          .expect(200);

        expect(response.body.videoCount).toBe(50);
        expect(dnaAnalysisService.analyze).toHaveBeenCalledWith({
          userId: testUserId,
          videoIds: largeVideoIds
        });
      });

      it('should return all personality traits', async () => {
        const response = await request(app)
          .post('/api/dna/analyze')
          .send({
            userId: testUserId,
            videoIds: mockVideoIds
          })
          .expect(200);

        const traits = response.body.profile.traits;
        expect(traits).toHaveProperty('energy');
        expect(traits).toHaveProperty('formality');
        expect(traits).toHaveProperty('humor');
        expect(traits).toHaveProperty('technical_depth');
        expect(traits).toHaveProperty('storytelling');

        // Verify trait values are in valid range (0-1)
        Object.values(traits).forEach((value: any) => {
          expect(value).toBeGreaterThanOrEqual(0);
          expect(value).toBeLessThanOrEqual(1);
        });
      });

      it('should identify creator archetype', async () => {
        const validArchetypes = [
          'educator',
          'entertainer',
          'reviewer',
          'storyteller',
          'analyst',
          'motivator'
        ];

        const response = await request(app)
          .post('/api/dna/analyze')
          .send({
            userId: testUserId,
            videoIds: mockVideoIds
          })
          .expect(200);

        expect(validArchetypes).toContain(response.body.profile.archetype);
      });

      it('should extract signature phrases', async () => {
        const response = await request(app)
          .post('/api/dna/analyze')
          .send({
            userId: testUserId,
            videoIds: mockVideoIds
          })
          .expect(200);

        const phrases = response.body.profile.signature_phrases;
        expect(Array.isArray(phrases)).toBe(true);
        expect(phrases.length).toBeGreaterThan(0);
        phrases.forEach((phrase: string) => {
          expect(typeof phrase).toBe('string');
          expect(phrase.length).toBeGreaterThan(0);
        });
      });

      it('should cache DNA profile after analysis', async () => {
        const response = await request(app)
          .post('/api/dna/analyze')
          .send({
            userId: testUserId,
            videoIds: mockVideoIds
          })
          .expect(200);

        // Verify profile is cached
        const cacheKey = `dna-profile-${testUserId}`;
        const cached = cacheService.get(cacheKey);
        expect(cached).toBeDefined();
      });
    });

    describe('Validation Errors', () => {
      it('should return 400 when userId is missing', async () => {
        const response = await request(app)
          .post('/api/dna/analyze')
          .send({
            videoIds: mockVideoIds
          })
          .expect(400);

        expectErrorResponse(response, 400);
        expect(response.body.error).toContain('userId');
      });

      it('should return 400 when videoIds is missing', async () => {
        const response = await request(app)
          .post('/api/dna/analyze')
          .send({
            userId: testUserId
          })
          .expect(400);

        expectErrorResponse(response, 400);
        expect(response.body.error).toContain('videoIds');
      });

      it('should return 400 when videoIds is not an array', async () => {
        const response = await request(app)
          .post('/api/dna/analyze')
          .send({
            userId: testUserId,
            videoIds: 'video-1'
          })
          .expect(400);

        expectErrorResponse(response, 400);
      });

      it('should return 400 when videoIds array is empty', async () => {
        const response = await request(app)
          .post('/api/dna/analyze')
          .send({
            userId: testUserId,
            videoIds: []
          })
          .expect(400);

        expectErrorResponse(response, 400);
      });

      it('should return 400 when videoIds has less than 5 videos', async () => {
        const response = await request(app)
          .post('/api/dna/analyze')
          .send({
            userId: testUserId,
            videoIds: ['video-1', 'video-2', 'video-3']
          })
          .expect(400);

        expectErrorResponse(response, 400);
        expect(response.body.error).toContain('at least 5 videos');
      });
    });

    describe('Service Errors', () => {
      it('should handle DNA analysis service failure', async () => {
        (dnaAnalysisService.analyze as jest.Mock).mockRejectedValue(
          new Error('Analysis failed')
        );

        const response = await request(app)
          .post('/api/dna/analyze')
          .send({
            userId: testUserId,
            videoIds: mockVideoIds
          })
          .expect(500);

        expectErrorResponse(response, 500);
      });

      it('should handle insufficient video data', async () => {
        (dnaAnalysisService.analyze as jest.Mock).mockRejectedValue(
          new Error('Insufficient data for analysis')
        );

        const response = await request(app)
          .post('/api/dna/analyze')
          .send({
            userId: testUserId,
            videoIds: mockVideoIds
          })
          .expect(500);

        expectErrorResponse(response, 500);
      });
    });
  });

  describe('GET /api/dna/profile/:userId - Get DNA Profile', () => {
    describe('Successful Retrieval', () => {
      it('should retrieve existing DNA profile', async () => {
        const response = await request(app)
          .get(`/api/dna/profile/${testUserId}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('userId', testUserId);
        expect(response.body).toHaveProperty('profile');
        expect(response.body.profile).toHaveProperty('archetype');
        expect(response.body.profile).toHaveProperty('traits');

        expect(dnaAnalysisService.getProfile).toHaveBeenCalledWith(testUserId);
      });

      it('should return cached profile without calling service', async () => {
        // First request
        await request(app)
          .get(`/api/dna/profile/${testUserId}`)
          .expect(200);

        jest.clearAllMocks();

        // Second request should use cache
        const response = await request(app)
          .get(`/api/dna/profile/${testUserId}`)
          .expect(200);

        expect(response.body.profile).toBeDefined();
        // Service should not be called again if cached
      });
    });

    describe('Error Handling', () => {
      it('should return 404 when profile does not exist', async () => {
        (dnaAnalysisService.getProfile as jest.Mock).mockResolvedValue(null);

        const response = await request(app)
          .get('/api/dna/profile/non-existent-user')
          .expect(404);

        expectErrorResponse(response, 404);
        expect(response.body.error).toContain('not found');
      });

      it('should handle service errors', async () => {
        (dnaAnalysisService.getProfile as jest.Mock).mockRejectedValue(
          new Error('Database error')
        );

        const response = await request(app)
          .get(`/api/dna/profile/${testUserId}`)
          .expect(500);

        expectErrorResponse(response, 500);
      });
    });
  });

  describe('POST /api/dna/update - Update DNA Profile', () => {
    describe('Successful Update', () => {
      it('should update DNA profile with new video', async () => {
        const response = await request(app)
          .post('/api/dna/update')
          .send({
            userId: testUserId,
            videoId: 'new-video-123'
          })
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('profile');
        expect(response.body.profile.updated).toBe(true);

        expect(dnaAnalysisService.updateProfile).toHaveBeenCalledWith(
          testUserId,
          'new-video-123'
        );
      });

      it('should invalidate cache after update', async () => {
        const cacheKey = `dna-profile-${testUserId}`;
        cacheService.set(cacheKey, mockDNAProfile);

        await request(app)
          .post('/api/dna/update')
          .send({
            userId: testUserId,
            videoId: 'new-video-123'
          })
          .expect(200);

        // Cache should be invalidated
        const cached = cacheService.get(cacheKey);
        expect(cached).toBeUndefined();
      });
    });

    describe('Validation Errors', () => {
      it('should return 400 when userId is missing', async () => {
        const response = await request(app)
          .post('/api/dna/update')
          .send({
            videoId: 'new-video-123'
          })
          .expect(400);

        expectErrorResponse(response, 400);
      });

      it('should return 400 when videoId is missing', async () => {
        const response = await request(app)
          .post('/api/dna/update')
          .send({
            userId: testUserId
          })
          .expect(400);

        expectErrorResponse(response, 400);
      });
    });
  });

  describe('Complete DNA-Guided Content Generation Flow', () => {
    it('should complete full DNA analysis → content generation workflow', async () => {
      // Step 1: Analyze creator DNA
      const dnaResponse = await request(app)
        .post('/api/dna/analyze')
        .send({
          userId: testUserId,
          videoIds: mockVideoIds
        })
        .expect(200);

      expect(dnaResponse.body.success).toBe(true);
      const profile = dnaResponse.body.profile;
      expect(profile.archetype).toBe('educator');

      // Step 2: Generate content using DNA profile
      const generateResponse = await request(app)
        .post('/api/generate')
        .send({
          jobId: 'test-job-123',
          platforms: ['youtube', 'twitter'],
          useDNA: true,
          userId: testUserId
        })
        .expect(200);

      expect(generateResponse.body.success).toBe(true);
      expect(generateResponse.body.results).toHaveProperty('youtube');
      expect(generateResponse.body.results).toHaveProperty('twitter');

      // Verify DNA profile was used in generation
      expect(bedrockService.generatePlatformContent).toHaveBeenCalled();
      const callArgs = (bedrockService.generatePlatformContent as jest.Mock).mock.calls[0];
      expect(callArgs).toBeDefined();
    });

    it('should apply DNA traits to content generation', async () => {
      // Analyze DNA
      await request(app)
        .post('/api/dna/analyze')
        .send({
          userId: testUserId,
          videoIds: mockVideoIds
        })
        .expect(200);

      // Generate with DNA
      const response = await request(app)
        .post('/api/generate')
        .send({
          jobId: 'test-job-456',
          platforms: ['linkedin'],
          useDNA: true,
          userId: testUserId
        })
        .expect(200);

      expect(response.body.results.linkedin.metadata.dna_applied).toBe(true);
    });

    it('should update DNA profile after new content creation', async () => {
      // Initial analysis
      await request(app)
        .post('/api/dna/analyze')
        .send({
          userId: testUserId,
          videoIds: mockVideoIds
        })
        .expect(200);

      // Create new content
      const newVideoId = 'new-video-789';
      
      // Update profile
      const updateResponse = await request(app)
        .post('/api/dna/update')
        .send({
          userId: testUserId,
          videoId: newVideoId
        })
        .expect(200);

      expect(updateResponse.body.success).toBe(true);
      expect(updateResponse.body.profile.updated).toBe(true);
    });

    it('should handle concurrent DNA analysis requests', async () => {
      const requests = [
        request(app).post('/api/dna/analyze').send({
          userId: 'user-1',
          videoIds: mockVideoIds
        }),
        request(app).post('/api/dna/analyze').send({
          userId: 'user-2',
          videoIds: mockVideoIds
        }),
        request(app).post('/api/dna/analyze').send({
          userId: 'user-3',
          videoIds: mockVideoIds
        })
      ];

      const responses = await Promise.all(requests);

      responses.forEach((response, index) => {
        expect(response.status).toBe(200);
        expect(response.body.userId).toBe(`user-${index + 1}`);
        expect(response.body.profile).toBeDefined();
      });

      expect(dnaAnalysisService.analyze).toHaveBeenCalledTimes(3);
    });
  });

  describe('DNA Profile Comparison', () => {
    it('should compare DNA profiles between creators', async () => {
      const response = await request(app)
        .post('/api/dna/compare')
        .send({
          userId1: 'creator-1',
          userId2: 'creator-2'
        })
        .expect(200);

      expect(response.body).toHaveProperty('similarity');
      expect(response.body).toHaveProperty('differences');
      expect(response.body.similarity).toBeGreaterThanOrEqual(0);
      expect(response.body.similarity).toBeLessThanOrEqual(1);
    });
  });

  describe('DNA-Based Recommendations', () => {
    it('should provide content recommendations based on DNA', async () => {
      const response = await request(app)
        .get(`/api/dna/recommendations/${testUserId}`)
        .expect(200);

      expect(response.body).toHaveProperty('recommendations');
      expect(Array.isArray(response.body.recommendations)).toBe(true);
      expect(response.body.recommendations.length).toBeGreaterThan(0);
    });
  });
});
