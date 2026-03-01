/**
 * E2E Tests for Content Generation and Export Flow
 * Tests POST /api/generate and GET /api/generate/:generationId endpoints
 * 
 * Coverage:
 * - Generate flow with jobId and platform selections
 * - Export flow to retrieve generated content
 * - Multi-platform generation (YouTube, Instagram, LinkedIn, Twitter, TikTok, Facebook)
 * - Language support (en, hi, etc.)
 * - Error handling and edge cases
 */

import request from 'supertest';
import express from 'express';
import generateRoute from '../../routes/generate.route';
import { cacheService } from '../../services/cache.service';
import { bedrockService } from '../../services/bedrock.service';
import { transcribeService } from '../../services/transcription.service';
import { expectSuccessResponse, expectErrorResponse } from '../setup';
import { errorHandler } from '../../middleware/error.middleware';

// Mock the services
jest.mock('../../services/bedrock.service', () => ({
  bedrockService: {
    generatePlatformContent: jest.fn(),
  },
}));

jest.mock('../../services/transcription.service', () => ({
  transcribeService: {
    getTranscriptionStatus: jest.fn(),
  },
}));

describe('Generate and Export E2E Tests', () => {
  let app: express.Application;

  const mockTranscript = 'This is a sample transcript about AI technology and its impact on content creation.';
  
  const mockPlatformContent = (platform: string, language: string = 'en') => ({
    platform,
    content: `Generated ${platform} content in ${language}: ${mockTranscript.substring(0, 50)}...`,
    generatedAt: new Date().toISOString(),
  });

  beforeEach(() => {
    // Create fresh Express app for each test
    app = express();
    app.use(express.json());
    app.use('/api/generate', generateRoute);
    app.use(errorHandler);

    // Clear cache before each test
    cacheService.clear();
    
    // Reset all mocks
    jest.clearAllMocks();
    
    // Set up default mock implementations
    (transcribeService.getTranscriptionStatus as jest.Mock).mockResolvedValue({
      status: 'COMPLETED',
      transcript: mockTranscript,
    });

    (bedrockService.generatePlatformContent as jest.Mock).mockImplementation(
      (transcript: string, platform: string, language: string) => 
        Promise.resolve(mockPlatformContent(platform, language))
    );
  });

  afterEach(() => {
    // Clean up cache after each test
    cacheService.clear();
  });

  describe('POST /api/generate - Generate Flow', () => {
    describe('Successful Generation', () => {
      it('should generate content for single platform', async () => {
        const jobId = 'job-single-platform';
        const platforms = ['twitter'];

        const response = await request(app)
          .post('/api/generate')
          .send({ jobId, platforms })
          .expect(200);

        expectSuccessResponse(response, 200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('generationId');
        expect(response.body).toHaveProperty('jobId', jobId);
        expect(response.body).toHaveProperty('status', 'completed');
        expect(response.body).toHaveProperty('language', 'en');
        expect(response.body).toHaveProperty('creatorMode', 'hybrid');
        expect(response.body).toHaveProperty('results');
        
        // Verify results structure
        expect(response.body.results).toHaveProperty('twitter');
        expect(response.body.results.twitter).toHaveProperty('platform', 'twitter');
        expect(response.body.results.twitter).toHaveProperty('content');
        expect(response.body.results.twitter).toHaveProperty('generatedAt');

        // Verify services were called correctly
        expect(transcribeService.getTranscriptionStatus).toHaveBeenCalledWith(jobId);
        expect(bedrockService.generatePlatformContent).toHaveBeenCalledWith(
          mockTranscript,
          'twitter',
          'en'
        );
      });

      it('should generate content for multiple platforms', async () => {
        const jobId = 'job-multi-platform';
        const platforms = ['twitter', 'linkedin', 'instagram'];

        const response = await request(app)
          .post('/api/generate')
          .send({ jobId, platforms })
          .expect(200);

        expectSuccessResponse(response, 200);
        expect(response.body.results).toHaveProperty('twitter');
        expect(response.body.results).toHaveProperty('linkedin');
        expect(response.body.results).toHaveProperty('instagram');

        // Verify each platform was generated
        platforms.forEach(platform => {
          expect(response.body.results[platform]).toHaveProperty('platform', platform);
          expect(response.body.results[platform]).toHaveProperty('content');
        });

        // Verify service was called for each platform
        expect(bedrockService.generatePlatformContent).toHaveBeenCalledTimes(3);
      });

      it('should generate content with custom language', async () => {
        const jobId = 'job-hindi';
        const platforms = ['youtube'];
        const language = 'hi';

        const response = await request(app)
          .post('/api/generate')
          .send({ jobId, platforms, language })
          .expect(200);

        expectSuccessResponse(response, 200);
        expect(response.body).toHaveProperty('language', 'hi');
        expect(bedrockService.generatePlatformContent).toHaveBeenCalledWith(
          mockTranscript,
          'youtube',
          'hi'
        );
      });

      it('should generate content with custom creator mode', async () => {
        const jobId = 'job-creator-mode';
        const platforms = ['tiktok'];
        const creatorMode = 'professional';

        const response = await request(app)
          .post('/api/generate')
          .send({ jobId, platforms, creatorMode })
          .expect(200);

        expectSuccessResponse(response, 200);
        expect(response.body).toHaveProperty('creatorMode', 'professional');
      });

      it('should cache generated content', async () => {
        const jobId = 'job-cache-test';
        const platforms = ['facebook'];

        const response = await request(app)
          .post('/api/generate')
          .send({ jobId, platforms })
          .expect(200);

        const generationId = response.body.generationId;

        // Verify content is cached
        const cached = cacheService.get(generationId);
        expect(cached).toBeDefined();
        expect(cached).toHaveProperty('jobId', jobId);
        expect(cached).toHaveProperty('results');
        expect((cached as any).results).toHaveProperty('facebook');
      });
    });

    describe('Multi-Platform Generation', () => {
      const allPlatforms = ['youtube', 'instagram', 'linkedin', 'twitter', 'tiktok', 'facebook'];

      it('should generate content for all 6 platforms', async () => {
        const jobId = 'job-all-platforms';

        const response = await request(app)
          .post('/api/generate')
          .send({ jobId, platforms: allPlatforms })
          .expect(200);

        expectSuccessResponse(response, 200);
        
        // Verify all platforms are present
        allPlatforms.forEach(platform => {
          expect(response.body.results).toHaveProperty(platform);
          expect(response.body.results[platform]).toHaveProperty('platform', platform);
          expect(response.body.results[platform]).toHaveProperty('content');
          expect(response.body.results[platform].content).toContain(platform);
        });

        // Verify service was called for each platform
        expect(bedrockService.generatePlatformContent).toHaveBeenCalledTimes(6);
      });

      it('should generate YouTube content', async () => {
        const response = await request(app)
          .post('/api/generate')
          .send({ jobId: 'job-youtube', platforms: ['youtube'] })
          .expect(200);

        expect(response.body.results.youtube).toHaveProperty('platform', 'youtube');
        expect(response.body.results.youtube.content).toContain('youtube');
      });

      it('should generate Instagram content', async () => {
        const response = await request(app)
          .post('/api/generate')
          .send({ jobId: 'job-instagram', platforms: ['instagram'] })
          .expect(200);

        expect(response.body.results.instagram).toHaveProperty('platform', 'instagram');
        expect(response.body.results.instagram.content).toContain('instagram');
      });

      it('should generate LinkedIn content', async () => {
        const response = await request(app)
          .post('/api/generate')
          .send({ jobId: 'job-linkedin', platforms: ['linkedin'] })
          .expect(200);

        expect(response.body.results.linkedin).toHaveProperty('platform', 'linkedin');
        expect(response.body.results.linkedin.content).toContain('linkedin');
      });

      it('should generate Twitter content', async () => {
        const response = await request(app)
          .post('/api/generate')
          .send({ jobId: 'job-twitter', platforms: ['twitter'] })
          .expect(200);

        expect(response.body.results.twitter).toHaveProperty('platform', 'twitter');
        expect(response.body.results.twitter.content).toContain('twitter');
      });

      it('should generate TikTok content', async () => {
        const response = await request(app)
          .post('/api/generate')
          .send({ jobId: 'job-tiktok', platforms: ['tiktok'] })
          .expect(200);

        expect(response.body.results.tiktok).toHaveProperty('platform', 'tiktok');
        expect(response.body.results.tiktok.content).toContain('tiktok');
      });

      it('should generate Facebook content', async () => {
        const response = await request(app)
          .post('/api/generate')
          .send({ jobId: 'job-facebook', platforms: ['facebook'] })
          .expect(200);

        expect(response.body.results.facebook).toHaveProperty('platform', 'facebook');
        expect(response.body.results.facebook.content).toContain('facebook');
      });
    });

    describe('Language Support', () => {
      it('should generate content in English (en)', async () => {
        const response = await request(app)
          .post('/api/generate')
          .send({ jobId: 'job-en', platforms: ['twitter'], language: 'en' })
          .expect(200);

        expect(response.body).toHaveProperty('language', 'en');
        expect(bedrockService.generatePlatformContent).toHaveBeenCalledWith(
          mockTranscript,
          'twitter',
          'en'
        );
      });

      it('should generate content in Hindi (hi)', async () => {
        const response = await request(app)
          .post('/api/generate')
          .send({ jobId: 'job-hi', platforms: ['youtube'], language: 'hi' })
          .expect(200);

        expect(response.body).toHaveProperty('language', 'hi');
        expect(bedrockService.generatePlatformContent).toHaveBeenCalledWith(
          mockTranscript,
          'youtube',
          'hi'
        );
      });

      it('should generate content in Bengali (bn)', async () => {
        const response = await request(app)
          .post('/api/generate')
          .send({ jobId: 'job-bn', platforms: ['instagram'], language: 'bn' })
          .expect(200);

        expect(response.body).toHaveProperty('language', 'bn');
        expect(bedrockService.generatePlatformContent).toHaveBeenCalledWith(
          mockTranscript,
          'instagram',
          'bn'
        );
      });

      it('should generate content in Tamil (ta)', async () => {
        const response = await request(app)
          .post('/api/generate')
          .send({ jobId: 'job-ta', platforms: ['linkedin'], language: 'ta' })
          .expect(200);

        expect(response.body).toHaveProperty('language', 'ta');
      });

      it('should default to English when language not specified', async () => {
        const response = await request(app)
          .post('/api/generate')
          .send({ jobId: 'job-default-lang', platforms: ['twitter'] })
          .expect(200);

        expect(response.body).toHaveProperty('language', 'en');
      });

      it('should support multiple platforms with different languages', async () => {
        const platforms = ['youtube', 'twitter', 'instagram'];
        const language = 'hi';

        const response = await request(app)
          .post('/api/generate')
          .send({ jobId: 'job-multi-lang', platforms, language })
          .expect(200);

        expect(response.body).toHaveProperty('language', 'hi');
        
        // Verify each platform was called with Hindi
        platforms.forEach(platform => {
          expect(bedrockService.generatePlatformContent).toHaveBeenCalledWith(
            mockTranscript,
            platform,
            'hi'
          );
        });
      });
    });

    describe('Error Handling', () => {
      it('should return 400 when jobId is missing', async () => {
        const response = await request(app)
          .post('/api/generate')
          .send({ platforms: ['twitter'] })
          .expect(400);

        expect(response.body.success).not.toBe(true);
        expect(response.body.error).toContain('jobId');
      });

      it('should return 400 when platforms is missing', async () => {
        const response = await request(app)
          .post('/api/generate')
          .send({ jobId: 'job-123' })
          .expect(400);

        expect(response.body.success).not.toBe(true);
        expect(response.body.error).toContain('platforms');
      });

      it('should return 400 when platforms is not an array', async () => {
        const response = await request(app)
          .post('/api/generate')
          .send({ jobId: 'job-123', platforms: 'twitter' })
          .expect(400);

        expect(response.body.success).not.toBe(true);
        expect(response.body.error).toContain('platforms');
      });

      it('should return 400 when platforms array is empty', async () => {
        const response = await request(app)
          .post('/api/generate')
          .send({ jobId: 'job-123', platforms: [] })
          .expect(400);

        expect(response.body.success).not.toBe(true);
      });

      it('should handle transcription service errors', async () => {
        (transcribeService.getTranscriptionStatus as jest.Mock).mockRejectedValue(
          new Error('Transcription not found')
        );

        const response = await request(app)
          .post('/api/generate')
          .send({ jobId: 'job-error', platforms: ['twitter'] })
          .expect(500);

        expect(response.body.success).not.toBe(true);
      });

      it('should handle bedrock service errors', async () => {
        (bedrockService.generatePlatformContent as jest.Mock).mockRejectedValue(
          new Error('Content generation failed')
        );

        const response = await request(app)
          .post('/api/generate')
          .send({ jobId: 'job-bedrock-error', platforms: ['twitter'] })
          .expect(500);

        expect(response.body.success).not.toBe(true);
      });

      it('should handle partial platform failures gracefully', async () => {
        // Mock first platform to succeed, second to fail
        (bedrockService.generatePlatformContent as jest.Mock)
          .mockResolvedValueOnce(mockPlatformContent('twitter'))
          .mockRejectedValueOnce(new Error('Generation failed'));

        const response = await request(app)
          .post('/api/generate')
          .send({ jobId: 'job-partial-fail', platforms: ['twitter', 'linkedin'] })
          .expect(500);

        expect(response.body.success).not.toBe(true);
      });

      it('should handle empty transcript', async () => {
        (transcribeService.getTranscriptionStatus as jest.Mock).mockResolvedValue({
          status: 'COMPLETED',
          transcript: '',
        });

        const response = await request(app)
          .post('/api/generate')
          .send({ jobId: 'job-empty-transcript', platforms: ['twitter'] })
          .expect(200);

        // Should still attempt generation with empty transcript
        expect(bedrockService.generatePlatformContent).toHaveBeenCalledWith(
          '',
          'twitter',
          'en'
        );
      });
    });

    describe('Response Structure Validation', () => {
      it('should return all required fields', async () => {
        const response = await request(app)
          .post('/api/generate')
          .send({ jobId: 'job-structure', platforms: ['twitter'] })
          .expect(200);

        expect(response.body).toHaveProperty('success');
        expect(response.body).toHaveProperty('generationId');
        expect(response.body).toHaveProperty('jobId');
        expect(response.body).toHaveProperty('status');
        expect(response.body).toHaveProperty('language');
        expect(response.body).toHaveProperty('creatorMode');
        expect(response.body).toHaveProperty('results');
      });

      it('should return valid generationId format', async () => {
        const response = await request(app)
          .post('/api/generate')
          .send({ jobId: 'job-genid', platforms: ['twitter'] })
          .expect(200);

        expect(response.body.generationId).toMatch(/^gen-\d+$/);
      });

      it('should return ISO date format for generatedAt', async () => {
        const response = await request(app)
          .post('/api/generate')
          .send({ jobId: 'job-date', platforms: ['twitter'] })
          .expect(200);

        const generatedAt = response.body.results.twitter.generatedAt;
        expect(() => new Date(generatedAt)).not.toThrow();
        expect(new Date(generatedAt).toISOString()).toBe(generatedAt);
      });
    });
  });

  describe('GET /api/generate/:generationId - Export Flow', () => {
    describe('Successful Retrieval', () => {
      it('should retrieve generated content by generationId', async () => {
        // First, generate content
        const generateResponse = await request(app)
          .post('/api/generate')
          .send({ jobId: 'job-retrieve', platforms: ['twitter'] })
          .expect(200);

        const generationId = generateResponse.body.generationId;

        // Then, retrieve it
        const retrieveResponse = await request(app)
          .get(`/api/generate/${generationId}`)
          .expect(200);

        expect(retrieveResponse.body).toHaveProperty('generationId', generationId);
        expect(retrieveResponse.body).toHaveProperty('status', 'completed');
        expect(retrieveResponse.body).toHaveProperty('jobId', 'job-retrieve');
        expect(retrieveResponse.body).toHaveProperty('results');
        expect(retrieveResponse.body.results).toHaveProperty('twitter');
      });

      it('should retrieve multi-platform generated content', async () => {
        const platforms = ['youtube', 'instagram', 'linkedin'];
        
        // Generate content
        const generateResponse = await request(app)
          .post('/api/generate')
          .send({ jobId: 'job-multi-retrieve', platforms })
          .expect(200);

        const generationId = generateResponse.body.generationId;

        // Retrieve content
        const retrieveResponse = await request(app)
          .get(`/api/generate/${generationId}`)
          .expect(200);

        // Verify all platforms are present
        platforms.forEach(platform => {
          expect(retrieveResponse.body.results).toHaveProperty(platform);
        });
      });

      it('should retrieve content with correct creator mode', async () => {
        const creatorMode = 'casual';
        
        // Generate content
        const generateResponse = await request(app)
          .post('/api/generate')
          .send({ jobId: 'job-mode', platforms: ['twitter'], creatorMode })
          .expect(200);

        const generationId = generateResponse.body.generationId;

        // Retrieve content
        const retrieveResponse = await request(app)
          .get(`/api/generate/${generationId}`)
          .expect(200);

        expect(retrieveResponse.body).toHaveProperty('creatorMode', creatorMode);
      });

      it('should retrieve cached content without calling services again', async () => {
        // Generate content
        const generateResponse = await request(app)
          .post('/api/generate')
          .send({ jobId: 'job-cache-retrieve', platforms: ['twitter'] })
          .expect(200);

        const generationId = generateResponse.body.generationId;

        // Clear mock call history
        jest.clearAllMocks();

        // Retrieve content
        await request(app)
          .get(`/api/generate/${generationId}`)
          .expect(200);

        // Services should not be called again
        expect(transcribeService.getTranscriptionStatus).not.toHaveBeenCalled();
        expect(bedrockService.generatePlatformContent).not.toHaveBeenCalled();
      });

      it('should retrieve same content on multiple requests', async () => {
        // Generate content
        const generateResponse = await request(app)
          .post('/api/generate')
          .send({ jobId: 'job-consistency', platforms: ['twitter'] })
          .expect(200);

        const generationId = generateResponse.body.generationId;

        // Retrieve multiple times
        const retrieve1 = await request(app)
          .get(`/api/generate/${generationId}`)
          .expect(200);

        const retrieve2 = await request(app)
          .get(`/api/generate/${generationId}`)
          .expect(200);

        // Content should be identical
        expect(retrieve1.body.results).toEqual(retrieve2.body.results);
      });
    });

    describe('Error Handling', () => {
      it('should return 404 for non-existent generationId', async () => {
        const response = await request(app)
          .get('/api/generate/gen-nonexistent')
          .expect(404);

        expect(response.body.success).not.toBe(true);
        expect(response.body.error).toContain('not found');
      });

      it('should return 404 for invalid generationId format', async () => {
        const response = await request(app)
          .get('/api/generate/invalid-id-format')
          .expect(404);

        expect(response.body.success).not.toBe(true);
      });

      it('should return 404 for expired cache entries', async () => {
        // Generate content with very short TTL
        const generateResponse = await request(app)
          .post('/api/generate')
          .send({ jobId: 'job-expire', platforms: ['twitter'] })
          .expect(200);

        const generationId = generateResponse.body.generationId;

        // Manually expire the cache entry
        cacheService.delete(generationId);

        // Try to retrieve
        const response = await request(app)
          .get(`/api/generate/${generationId}`)
          .expect(404);

        expect(response.body.success).not.toBe(true);
      });
    });

    describe('Response Structure Validation', () => {
      it('should return all required fields', async () => {
        // Generate content
        const generateResponse = await request(app)
          .post('/api/generate')
          .send({ jobId: 'job-fields', platforms: ['twitter'] })
          .expect(200);

        const generationId = generateResponse.body.generationId;

        // Retrieve content
        const response = await request(app)
          .get(`/api/generate/${generationId}`)
          .expect(200);

        expect(response.body).toHaveProperty('generationId');
        expect(response.body).toHaveProperty('status');
        expect(response.body).toHaveProperty('jobId');
        expect(response.body).toHaveProperty('results');
        expect(response.body).toHaveProperty('creatorMode');
      });
    });
  });

  describe('Complete E2E Flow', () => {
    it('should complete full generate-export cycle', async () => {
      const jobId = 'job-full-cycle';
      const platforms = ['youtube', 'twitter', 'instagram'];
      const language = 'hi';
      const creatorMode = 'professional';

      // Step 1: Generate content
      const generateResponse = await request(app)
        .post('/api/generate')
        .send({ jobId, platforms, language, creatorMode })
        .expect(200);

      expect(generateResponse.body).toHaveProperty('success', true);
      expect(generateResponse.body).toHaveProperty('generationId');
      expect(generateResponse.body).toHaveProperty('language', language);
      expect(generateResponse.body).toHaveProperty('creatorMode', creatorMode);

      const generationId = generateResponse.body.generationId;

      // Step 2: Export/retrieve content
      const exportResponse = await request(app)
        .get(`/api/generate/${generationId}`)
        .expect(200);

      expect(exportResponse.body).toHaveProperty('generationId', generationId);
      expect(exportResponse.body).toHaveProperty('jobId', jobId);
      expect(exportResponse.body).toHaveProperty('status', 'completed');
      
      // Verify all platforms are present
      platforms.forEach(platform => {
        expect(exportResponse.body.results).toHaveProperty(platform);
        expect(exportResponse.body.results[platform]).toHaveProperty('platform', platform);
        expect(exportResponse.body.results[platform]).toHaveProperty('content');
      });
    });

    it('should handle concurrent generation requests', async () => {
      const requests = [
        request(app).post('/api/generate').send({ jobId: 'job-1', platforms: ['twitter'] }),
        request(app).post('/api/generate').send({ jobId: 'job-2', platforms: ['youtube'] }),
        request(app).post('/api/generate').send({ jobId: 'job-3', platforms: ['instagram'] }),
      ];

      const responses = await Promise.all(requests);

      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('generationId');
      });

      // All should have unique generationIds
      const generationIds = responses.map(r => r.body.generationId);
      const uniqueIds = new Set(generationIds);
      expect(uniqueIds.size).toBe(3);
    });

    it('should handle concurrent retrieval requests', async () => {
      // Generate content first
      const generateResponse = await request(app)
        .post('/api/generate')
        .send({ jobId: 'job-concurrent', platforms: ['twitter'] })
        .expect(200);

      const generationId = generateResponse.body.generationId;

      // Make concurrent retrieval requests
      const requests = [
        request(app).get(`/api/generate/${generationId}`),
        request(app).get(`/api/generate/${generationId}`),
        request(app).get(`/api/generate/${generationId}`),
      ];

      const responses = await Promise.all(requests);

      // All should succeed with same content
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('generationId', generationId);
      });

      // All should return identical content
      const contents = responses.map(r => JSON.stringify(r.body.results));
      expect(new Set(contents).size).toBe(1);
    });
  });
});
