/**
 * Complete E2E Journey Test for Content Intelligence Platform
 * 
 * This test validates the entire user journey:
 * 1. Upload a video file
 * 2. Process the video (transcription)
 * 3. Generate content for multiple platforms
 * 4. Retrieve and verify the generated content
 * 5. Test Creator DNA analysis
 * 6. Test Viral Score prediction
 * 7. Test ROI calculation
 */

import request from 'supertest';
import app from '../../index';
import { S3Service } from '../../services/s3.service';
import { transcribeService } from '../../services/transcription.service';
import { bedrockService } from '../../services/bedrock.service';
import { dnaAnalysisService } from '../../services/dna-analysis.service';
import { viralPredictorService } from '../../services/viral-predictor.service';
import { roiCalculatorService } from '../../services/roi-calculator.service';
import { cacheService } from '../../services/cache.service';
import { 
  expectSuccessResponse, 
  createMockFile,
  wait 
} from '../setup';

// Mock all AWS services and external dependencies
jest.mock('../../services/s3.service');
jest.mock('../../services/transcription.service');
jest.mock('../../services/bedrock.service');
jest.mock('../../services/dna-analysis.service');
jest.mock('../../services/viral-predictor.service');
jest.mock('../../services/roi-calculator.service');

describe('E2E: Complete User Journey', () => {
  // Test data that will be used throughout the journey
  let testUserId: string;
  let uploadedFileId: string;
  let transcriptionJobId: string;
  let generationId: string;
  let mockTranscript: string;

  // Mock services
  let mockS3Service: jest.Mocked<S3Service>;

  beforeAll(() => {
    // Initialize test data
    testUserId = `test-user-${Date.now()}`;
    mockTranscript = 'Welcome to my channel! Today we are discussing the future of AI and how it will transform content creation. AI tools are becoming more accessible and powerful every day.';
    
    // Get mocked service instances
    mockS3Service = S3Service.prototype as jest.Mocked<S3Service>;
  });

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    cacheService.clear();
    
    // Setup default mock implementations
    setupDefaultMocks();
  });

  afterEach(() => {
    // Clean up cache after each test
    cacheService.clear();
  });

  /**
   * Setup default mock implementations for all services
   */
  function setupDefaultMocks() {
    // S3 Service mocks
    mockS3Service.upload = jest.fn().mockResolvedValue({
      key: `${testUserId}/${Date.now()}-test-video.mp4`,
      url: `https://test-bucket.s3.amazonaws.com/${testUserId}/test-video.mp4`,
      etag: '"mock-etag-123"'
    });

    mockS3Service.getPresignedUrl = jest.fn().mockResolvedValue(
      'https://test-bucket.s3.amazonaws.com/presigned-url'
    );

    // Transcription Service mocks
    (transcribeService.startTranscription as jest.Mock) = jest.fn().mockResolvedValue({
      jobName: `transcribe-${Date.now()}`,
      status: 'IN_PROGRESS'
    });

    (transcribeService.getTranscriptionStatus as jest.Mock) = jest.fn().mockResolvedValue({
      status: 'COMPLETED',
      transcript: mockTranscript,
      confidence: 0.98
    });

    // Bedrock Service mocks
    (bedrockService.generatePlatformContent as jest.Mock) = jest.fn()
      .mockImplementation(async (transcript: string, platform: string) => {
        const contentMap: Record<string, string> = {
          twitter: '🚀 The future of AI is here! Content creation is being transformed by powerful, accessible AI tools. #AI #ContentCreation #FutureTech',
          linkedin: 'The AI Revolution in Content Creation\n\nArtificial Intelligence is fundamentally changing how we create and distribute content...',
          instagram: '✨ AI is transforming content creation! Swipe to learn more about the future of creative tools. #AITools #ContentCreator',
          tiktok: 'POV: You just discovered AI content tools 🤯 The future is NOW! #AIRevolution #ContentCreation',
          youtube: 'The Future of AI in Content Creation | Complete Guide'
        };
        
        return {
          content: contentMap[platform] || 'Generated content for ' + platform,
          metadata: {
            model: 'claude-3-sonnet',
            tokens: 150,
            confidence: 0.95
          }
        };
      });

    // DNA Analysis Service mocks
    (dnaAnalysisService.analyze as jest.Mock) = jest.fn().mockResolvedValue({
      personality: {
        tone: 'enthusiastic',
        style: 'educational',
        humor: 0.7,
        formality: 0.4
      },
      topics: ['AI', 'technology', 'content creation', 'innovation'],
      patterns: {
        avgLength: 180,
        postingFrequency: 'daily',
        bestPerformingTime: '10:00 AM'
      },
      strengths: ['Clear explanations', 'Engaging storytelling', 'Technical accuracy'],
      recommendations: ['Increase video length', 'Add more visual examples']
    });

    // Viral Predictor Service mocks
    (viralPredictorService.predict as jest.Mock) = jest.fn().mockResolvedValue({
      score: 8.5,
      confidence: 0.92,
      factors: {
        engagement: 9.0,
        timing: 8.0,
        trending: 8.5,
        emotional: 8.0
      },
      recommendations: [
        'Post during peak hours (10 AM - 2 PM)',
        'Add trending hashtags',
        'Include call-to-action'
      ],
      estimatedReach: 50000
    });

    // ROI Calculator Service mocks
    (roiCalculatorService.calculate as jest.Mock) = jest.fn().mockResolvedValue({
      timeSaved: {
        hours: 45.5,
        value: 2275
      },
      moneySaved: {
        amount: 3500,
        breakdown: {
          contentCreation: 2000,
          editing: 1000,
          research: 500
        }
      },
      productivity: {
        contentGenerated: 120,
        platformsCovered: 5,
        avgTimePerContent: 2.5
      },
      comparison: {
        withAI: 2.5,
        withoutAI: 25,
        improvement: '90%'
      }
    });
  }

  // ============================================================================
  // STEP 1: Upload Video File
  // ============================================================================

  describe('Step 1: Upload Video File', () => {
    it('should successfully upload a video file', async () => {
      const mockFile = createMockFile({
        originalname: 'test-video.mp4',
        mimetype: 'video/mp4',
        size: 5 * 1024 * 1024, // 5MB
        buffer: Buffer.from('mock video content')
      });

      const response = await request(app)
        .post('/api/upload')
        .attach('file', mockFile.buffer, mockFile.originalname)
        .field('userId', testUserId)
        .expect(200);

      expectSuccessResponse(response, 200);
      
      // Verify response structure
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('fileId');
      expect(response.body).toHaveProperty('fileName', 'test-video.mp4');
      expect(response.body).toHaveProperty('mimeType', 'video/mp4');
      expect(response.body).toHaveProperty('size');
      expect(response.body).toHaveProperty('userId', testUserId);
      expect(response.body).toHaveProperty('url');
      expect(response.body).toHaveProperty('uploadedAt');

      // Store fileId for next steps
      uploadedFileId = response.body.fileId;

      // Verify S3 service was called
      expect(mockS3Service.upload).toHaveBeenCalledTimes(1);
      expect(mockS3Service.upload).toHaveBeenCalledWith(
        expect.any(Buffer),
        expect.stringContaining(testUserId),
        'video/mp4'
      );
    });

    it('should reject upload without file', async () => {
      const response = await request(app)
        .post('/api/upload')
        .field('userId', testUserId)
        .expect(400);

      expect(response.body.success).not.toBe(true);
    });

    it('should handle large file uploads', async () => {
      const largeFile = createMockFile({
        originalname: 'large-video.mp4',
        mimetype: 'video/mp4',
        size: 95 * 1024 * 1024, // 95MB (under 100MB limit)
        buffer: Buffer.alloc(1024) // Mock buffer
      });

      const response = await request(app)
        .post('/api/upload')
        .attach('file', largeFile.buffer, largeFile.originalname)
        .field('userId', testUserId)
        .expect(200);

      expectSuccessResponse(response, 200);
    });
  });

  // ============================================================================
  // STEP 2: Process Video (Transcription)
  // ============================================================================

  describe('Step 2: Process Video (Transcription)', () => {
    beforeEach(() => {
      // Ensure we have a fileId from upload
      uploadedFileId = `${testUserId}/${Date.now()}-test-video.mp4`;
    });

    it('should start transcription job successfully', async () => {
      const response = await request(app)
        .post('/api/process')
        .send({
          fileId: uploadedFileId,
          contentType: 'video'
        })
        .expect(200);

      expectSuccessResponse(response, 200);

      // Verify response structure
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('jobId');
      expect(response.body).toHaveProperty('fileId', uploadedFileId);
      expect(response.body).toHaveProperty('status', 'processing');
      expect(response.body).toHaveProperty('startedAt');

      // Store jobId for next steps
      transcriptionJobId = response.body.jobId;

      // Verify transcription service was called
      expect(transcribeService.startTranscription).toHaveBeenCalledTimes(1);
      expect(transcribeService.startTranscription).toHaveBeenCalledWith(
        expect.stringContaining('presigned-url'),
        expect.stringContaining('transcribe-')
      );
    });

    it('should reject processing without fileId', async () => {
      const response = await request(app)
        .post('/api/process')
        .send({})
        .expect(400);

      expect(response.body.success).not.toBe(true);
    });

    it('should check transcription status', async () => {
      const jobId = `transcribe-${Date.now()}`;

      const response = await request(app)
        .get(`/api/process/${jobId}`)
        .expect(200);

      // Verify response structure
      expect(response.body).toHaveProperty('jobId', jobId);
      expect(response.body).toHaveProperty('status', 'COMPLETED');
      expect(response.body).toHaveProperty('transcript');
      expect(response.body).toHaveProperty('completedAt');

      // Verify transcript content
      expect(response.body.transcript).toBe(mockTranscript);

      // Verify service was called
      expect(transcribeService.getTranscriptionStatus).toHaveBeenCalledWith(jobId);
    });

    it('should handle transcription in progress', async () => {
      // Mock in-progress status
      (transcribeService.getTranscriptionStatus as jest.Mock).mockResolvedValueOnce({
        status: 'IN_PROGRESS',
        transcript: null
      });

      const jobId = `transcribe-${Date.now()}`;

      const response = await request(app)
        .get(`/api/process/${jobId}`)
        .expect(200);

      expect(response.body.status).toBe('IN_PROGRESS');
      expect(response.body.transcript).toBeNull();
    });
  });

  // ============================================================================
  // STEP 3: Generate Content for Multiple Platforms
  // ============================================================================

  describe('Step 3: Generate Content for Multiple Platforms', () => {
    beforeEach(() => {
      // Ensure we have a jobId from processing
      transcriptionJobId = `transcribe-${Date.now()}`;
    });

    it('should generate content for multiple platforms', async () => {
      const platforms = ['twitter', 'linkedin', 'instagram', 'tiktok', 'youtube'];

      const response = await request(app)
        .post('/api/generate')
        .send({
          jobId: transcriptionJobId,
          platforms,
          language: 'en',
          creatorMode: 'hybrid'
        })
        .expect(200);

      expectSuccessResponse(response, 200);

      // Verify response structure
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('generationId');
      expect(response.body).toHaveProperty('jobId', transcriptionJobId);
      expect(response.body).toHaveProperty('status', 'completed');
      expect(response.body).toHaveProperty('language', 'en');
      expect(response.body).toHaveProperty('creatorMode', 'hybrid');
      expect(response.body).toHaveProperty('results');

      // Store generationId for next steps
      generationId = response.body.generationId;

      // Verify all platforms have content
      const results = response.body.results;
      platforms.forEach(platform => {
        expect(results).toHaveProperty(platform);
        expect(results[platform]).toHaveProperty('content');
        expect(results[platform]).toHaveProperty('metadata');
        expect(results[platform].content).toBeTruthy();
      });

      // Verify Bedrock service was called for each platform
      expect(bedrockService.generatePlatformContent).toHaveBeenCalledTimes(platforms.length);
    });

    it('should generate content for single platform', async () => {
      const response = await request(app)
        .post('/api/generate')
        .send({
          jobId: transcriptionJobId,
          platforms: ['twitter']
        })
        .expect(200);

      expectSuccessResponse(response, 200);
      expect(response.body.results).toHaveProperty('twitter');
      expect(bedrockService.generatePlatformContent).toHaveBeenCalledTimes(1);
    });

    it('should reject generation without jobId', async () => {
      const response = await request(app)
        .post('/api/generate')
        .send({
          platforms: ['twitter']
        })
        .expect(400);

      expect(response.body.success).not.toBe(true);
    });

    it('should reject generation without platforms', async () => {
      const response = await request(app)
        .post('/api/generate')
        .send({
          jobId: transcriptionJobId
        })
        .expect(400);

      expect(response.body.success).not.toBe(true);
    });

    it('should reject generation with empty platforms array', async () => {
      const response = await request(app)
        .post('/api/generate')
        .send({
          jobId: transcriptionJobId,
          platforms: []
        })
        .expect(400);

      expect(response.body.success).not.toBe(true);
    });
  });

  // ============================================================================
  // STEP 4: Retrieve and Verify Generated Content
  // ============================================================================

  describe('Step 4: Retrieve and Verify Generated Content', () => {
    beforeEach(async () => {
      // Generate content first to have a generationId
      const response = await request(app)
        .post('/api/generate')
        .send({
          jobId: `transcribe-${Date.now()}`,
          platforms: ['twitter', 'linkedin']
        });
      
      generationId = response.body.generationId;
    });

    it('should retrieve generated content by generationId', async () => {
      const response = await request(app)
        .get(`/api/generate/${generationId}`)
        .expect(200);

      // Verify response structure
      expect(response.body).toHaveProperty('generationId', generationId);
      expect(response.body).toHaveProperty('status', 'completed');
      expect(response.body).toHaveProperty('results');

      // Verify content is present
      const results = response.body.results;
      expect(results).toHaveProperty('twitter');
      expect(results).toHaveProperty('linkedin');
    });

    it('should return 404 for non-existent generationId', async () => {
      const fakeId = 'gen-nonexistent-123';

      const response = await request(app)
        .get(`/api/generate/${fakeId}`)
        .expect(404);

      expect(response.body.success).not.toBe(true);
    });

    it('should verify content quality and structure', async () => {
      const response = await request(app)
        .get(`/api/generate/${generationId}`)
        .expect(200);

      const results = response.body.results;

      // Verify Twitter content
      if (results.twitter) {
        expect(results.twitter.content).toBeTruthy();
        expect(typeof results.twitter.content).toBe('string');
        expect(results.twitter.content.length).toBeGreaterThan(0);
        expect(results.twitter.metadata).toHaveProperty('model');
        expect(results.twitter.metadata).toHaveProperty('tokens');
      }

      // Verify LinkedIn content
      if (results.linkedin) {
        expect(results.linkedin.content).toBeTruthy();
        expect(typeof results.linkedin.content).toBe('string');
        expect(results.linkedin.content.length).toBeGreaterThan(0);
      }
    });
  });

  // ============================================================================
  // STEP 5: Test Creator DNA Analysis
  // ============================================================================

  describe('Step 5: Creator DNA Analysis', () => {
    it('should analyze creator DNA from video history', async () => {
      const videoIds = ['video-1', 'video-2', 'video-3', 'video-4', 'video-5'];

      const response = await request(app)
        .post('/api/dna/analyze')
        .send({
          userId: testUserId,
          videoIds
        })
        .expect(200);

      expectSuccessResponse(response, 200);

      // Verify response structure
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('userId', testUserId);
      expect(response.body).toHaveProperty('videoCount', videoIds.length);
      expect(response.body).toHaveProperty('profile');
      expect(response.body).toHaveProperty('analyzedAt');

      // Verify profile structure
      const profile = response.body.profile;
      expect(profile).toHaveProperty('personality');
      expect(profile).toHaveProperty('topics');
      expect(profile).toHaveProperty('patterns');
      expect(profile).toHaveProperty('strengths');
      expect(profile).toHaveProperty('recommendations');

      // Verify personality traits
      expect(profile.personality).toHaveProperty('tone');
      expect(profile.personality).toHaveProperty('style');
      expect(profile.personality).toHaveProperty('humor');
      expect(profile.personality).toHaveProperty('formality');

      // Verify topics is an array
      expect(Array.isArray(profile.topics)).toBe(true);
      expect(profile.topics.length).toBeGreaterThan(0);

      // Verify service was called
      expect(dnaAnalysisService.analyze).toHaveBeenCalledWith({
        userId: testUserId,
        videoIds
      });
    });

    it('should reject DNA analysis without userId', async () => {
      const response = await request(app)
        .post('/api/dna/analyze')
        .send({
          videoIds: ['video-1', 'video-2']
        })
        .expect(400);

      expect(response.body.success).not.toBe(true);
    });

    it('should reject DNA analysis without videoIds', async () => {
      const response = await request(app)
        .post('/api/dna/analyze')
        .send({
          userId: testUserId
        })
        .expect(400);

      expect(response.body.success).not.toBe(true);
    });

    it('should reject DNA analysis with empty videoIds array', async () => {
      const response = await request(app)
        .post('/api/dna/analyze')
        .send({
          userId: testUserId,
          videoIds: []
        })
        .expect(400);

      expect(response.body.success).not.toBe(true);
    });

    it('should handle large video history', async () => {
      const videoIds = Array.from({ length: 50 }, (_, i) => `video-${i + 1}`);

      const response = await request(app)
        .post('/api/dna/analyze')
        .send({
          userId: testUserId,
          videoIds
        })
        .expect(200);

      expectSuccessResponse(response, 200);
      expect(response.body.videoCount).toBe(50);
    });
  });

  // ============================================================================
  // STEP 6: Test Viral Score Prediction
  // ============================================================================

  describe('Step 6: Viral Score Prediction', () => {
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

      // Verify response structure
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('prediction');
      expect(response.body).toHaveProperty('analyzedAt');

      // Verify prediction structure
      const prediction = response.body.prediction;
      expect(prediction).toHaveProperty('score');
      expect(prediction).toHaveProperty('confidence');
      expect(prediction).toHaveProperty('factors');
      expect(prediction).toHaveProperty('recommendations');
      expect(prediction).toHaveProperty('estimatedReach');

      // Verify score is in valid range
      expect(prediction.score).toBeGreaterThanOrEqual(0);
      expect(prediction.score).toBeLessThanOrEqual(10);

      // Verify confidence is in valid range
      expect(prediction.confidence).toBeGreaterThanOrEqual(0);
      expect(prediction.confidence).toBeLessThanOrEqual(1);

      // Verify factors
      expect(prediction.factors).toHaveProperty('engagement');
      expect(prediction.factors).toHaveProperty('timing');
      expect(prediction.factors).toHaveProperty('trending');
      expect(prediction.factors).toHaveProperty('emotional');

      // Verify recommendations is an array
      expect(Array.isArray(prediction.recommendations)).toBe(true);

      // Verify service was called
      expect(viralPredictorService.predict).toHaveBeenCalledWith(
        mockTranscript,
        expect.objectContaining({
          platform: 'tiktok'
        })
      );
    });

    it('should reject prediction without transcript', async () => {
      const response = await request(app)
        .post('/api/viral/predict')
        .send({
          metadata: { platform: 'tiktok' }
        })
        .expect(400);

      expect(response.body.success).not.toBe(true);
    });

    it('should reject prediction with empty transcript', async () => {
      const response = await request(app)
        .post('/api/viral/predict')
        .send({
          transcript: '',
          metadata: { platform: 'tiktok' }
        })
        .expect(400);

      expect(response.body.success).not.toBe(true);
    });

    it('should handle prediction without metadata', async () => {
      const response = await request(app)
        .post('/api/viral/predict')
        .send({
          transcript: mockTranscript
        })
        .expect(200);

      expectSuccessResponse(response, 200);
      expect(viralPredictorService.predict).toHaveBeenCalledWith(
        mockTranscript,
        {}
      );
    });

    it('should predict for different content types', async () => {
      const contentTypes = [
        { transcript: 'Breaking news about technology!', metadata: { platform: 'twitter' } },
        { transcript: 'Professional insights on industry trends', metadata: { platform: 'linkedin' } },
        { transcript: 'Fun dance challenge video!', metadata: { platform: 'tiktok' } }
      ];

      for (const content of contentTypes) {
        const response = await request(app)
          .post('/api/viral/predict')
          .send(content)
          .expect(200);

        expectSuccessResponse(response, 200);
        expect(response.body.prediction.score).toBeGreaterThanOrEqual(0);
      }
    });
  });

  // ============================================================================
  // STEP 7: Test ROI Calculation
  // ============================================================================

  describe('Step 7: ROI Calculation', () => {
    it('should calculate ROI for user', async () => {
      const response = await request(app)
        .get(`/api/roi/${testUserId}`)
        .expect(200);

      expectSuccessResponse(response, 200);

      // Verify response structure
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('userId', testUserId);
      expect(response.body).toHaveProperty('roi');
      expect(response.body).toHaveProperty('calculatedAt');

      // Verify ROI structure
      const roi = response.body.roi;
      expect(roi).toHaveProperty('timeSaved');
      expect(roi).toHaveProperty('moneySaved');
      expect(roi).toHaveProperty('productivity');
      expect(roi).toHaveProperty('comparison');

      // Verify timeSaved
      expect(roi.timeSaved).toHaveProperty('hours');
      expect(roi.timeSaved).toHaveProperty('value');
      expect(typeof roi.timeSaved.hours).toBe('number');
      expect(typeof roi.timeSaved.value).toBe('number');

      // Verify moneySaved
      expect(roi.moneySaved).toHaveProperty('amount');
      expect(roi.moneySaved).toHaveProperty('breakdown');
      expect(typeof roi.moneySaved.amount).toBe('number');
      expect(roi.moneySaved.breakdown).toHaveProperty('contentCreation');
      expect(roi.moneySaved.breakdown).toHaveProperty('editing');
      expect(roi.moneySaved.breakdown).toHaveProperty('research');

      // Verify productivity
      expect(roi.productivity).toHaveProperty('contentGenerated');
      expect(roi.productivity).toHaveProperty('platformsCovered');
      expect(roi.productivity).toHaveProperty('avgTimePerContent');

      // Verify comparison
      expect(roi.comparison).toHaveProperty('withAI');
      expect(roi.comparison).toHaveProperty('withoutAI');
      expect(roi.comparison).toHaveProperty('improvement');

      // Verify service was called
      expect(roiCalculatorService.calculate).toHaveBeenCalledWith(testUserId);
    });

    it('should reject ROI calculation without userId', async () => {
      const response = await request(app)
        .get('/api/roi/')
        .expect(404);

      expect(response.body.success).not.toBe(true);
    });

    it('should handle ROI calculation for new user', async () => {
      const newUserId = `new-user-${Date.now()}`;

      // Mock zero ROI for new user
      (roiCalculatorService.calculate as jest.Mock).mockResolvedValueOnce({
        timeSaved: { hours: 0, value: 0 },
        moneySaved: { amount: 0, breakdown: { contentCreation: 0, editing: 0, research: 0 } },
        productivity: { contentGenerated: 0, platformsCovered: 0, avgTimePerContent: 0 },
        comparison: { withAI: 0, withoutAI: 0, improvement: '0%' }
      });

      const response = await request(app)
        .get(`/api/roi/${newUserId}`)
        .expect(200);

      expectSuccessResponse(response, 200);
      expect(response.body.roi.timeSaved.hours).toBe(0);
      expect(response.body.roi.moneySaved.amount).toBe(0);
    });

    it('should calculate ROI with realistic values', async () => {
      const response = await request(app)
        .get(`/api/roi/${testUserId}`)
        .expect(200);

      const roi = response.body.roi;

      // Verify realistic values
      expect(roi.timeSaved.hours).toBeGreaterThan(0);
      expect(roi.moneySaved.amount).toBeGreaterThan(0);
      expect(roi.productivity.contentGenerated).toBeGreaterThan(0);
      
      // Verify improvement percentage format
      expect(roi.comparison.improvement).toMatch(/^\d+%$/);
    });
  });

  // ============================================================================
  // COMPLETE END-TO-END JOURNEY TEST
  // ============================================================================

  describe('Complete Journey: Upload → Process → Generate → Analyze', () => {
    it('should complete the entire user journey successfully', async () => {
      // STEP 1: Upload video file
      const mockFile = createMockFile({
        originalname: 'journey-test.mp4',
        mimetype: 'video/mp4',
        size: 10 * 1024 * 1024,
        buffer: Buffer.from('complete journey test video')
      });

      const uploadResponse = await request(app)
        .post('/api/upload')
        .attach('file', mockFile.buffer, mockFile.originalname)
        .field('userId', testUserId)
        .expect(200);

      expectSuccessResponse(uploadResponse, 200);
      const fileId = uploadResponse.body.fileId;
      expect(fileId).toBeTruthy();

      // STEP 2: Start transcription
      const processResponse = await request(app)
        .post('/api/process')
        .send({ fileId, contentType: 'video' })
        .expect(200);

      expectSuccessResponse(processResponse, 200);
      const jobId = processResponse.body.jobId;
      expect(jobId).toBeTruthy();

      // Wait for processing (simulated)
      await wait(100);

      // STEP 3: Check transcription status
      const statusResponse = await request(app)
        .get(`/api/process/${jobId}`)
        .expect(200);

      expect(statusResponse.body.status).toBe('COMPLETED');
      expect(statusResponse.body.transcript).toBeTruthy();

      // STEP 4: Generate content for multiple platforms
      const platforms = ['twitter', 'linkedin', 'instagram', 'tiktok'];
      const generateResponse = await request(app)
        .post('/api/generate')
        .send({ jobId, platforms, language: 'en' })
        .expect(200);

      expectSuccessResponse(generateResponse, 200);
      const genId = generateResponse.body.generationId;
      expect(genId).toBeTruthy();

      // Verify all platforms have content
      platforms.forEach(platform => {
        expect(generateResponse.body.results[platform]).toBeTruthy();
        expect(generateResponse.body.results[platform].content).toBeTruthy();
      });

      // STEP 5: Retrieve generated content
      const retrieveResponse = await request(app)
        .get(`/api/generate/${genId}`)
        .expect(200);

      expect(retrieveResponse.body.generationId).toBe(genId);
      expect(retrieveResponse.body.results).toBeTruthy();

      // STEP 6: Analyze Creator DNA
      const videoIds = ['video-1', 'video-2', 'video-3'];
      const dnaResponse = await request(app)
        .post('/api/dna/analyze')
        .send({ userId: testUserId, videoIds })
        .expect(200);

      expectSuccessResponse(dnaResponse, 200);
      expect(dnaResponse.body.profile).toBeTruthy();
      expect(dnaResponse.body.profile.personality).toBeTruthy();

      // STEP 7: Predict viral score
      const viralResponse = await request(app)
        .post('/api/viral/predict')
        .send({ 
          transcript: statusResponse.body.transcript,
          metadata: { platform: 'tiktok' }
        })
        .expect(200);

      expectSuccessResponse(viralResponse, 200);
      expect(viralResponse.body.prediction.score).toBeGreaterThanOrEqual(0);
      expect(viralResponse.body.prediction.score).toBeLessThanOrEqual(10);

      // STEP 8: Calculate ROI
      const roiResponse = await request(app)
        .get(`/api/roi/${testUserId}`)
        .expect(200);

      expectSuccessResponse(roiResponse, 200);
      expect(roiResponse.body.roi.timeSaved).toBeTruthy();
      expect(roiResponse.body.roi.moneySaved).toBeTruthy();

      // Verify all services were called
      expect(mockS3Service.upload).toHaveBeenCalled();
      expect(transcribeService.startTranscription).toHaveBeenCalled();
      expect(transcribeService.getTranscriptionStatus).toHaveBeenCalled();
      expect(bedrockService.generatePlatformContent).toHaveBeenCalled();
      expect(dnaAnalysisService.analyze).toHaveBeenCalled();
      expect(viralPredictorService.predict).toHaveBeenCalled();
      expect(roiCalculatorService.calculate).toHaveBeenCalled();
    });

    it('should handle errors gracefully throughout the journey', async () => {
      // Simulate S3 upload failure
      mockS3Service.upload = jest.fn().mockRejectedValue(new Error('S3 upload failed'));

      const mockFile = createMockFile({
        originalname: 'error-test.mp4',
        mimetype: 'video/mp4',
        buffer: Buffer.from('error test')
      });

      const uploadResponse = await request(app)
        .post('/api/upload')
        .attach('file', mockFile.buffer, mockFile.originalname)
        .field('userId', testUserId)
        .expect(500);

      expect(uploadResponse.body.success).not.toBe(true);
    });

    it('should handle transcription failures', async () => {
      // Simulate transcription failure
      (transcribeService.startTranscription as jest.Mock).mockRejectedValue(
        new Error('Transcription service unavailable')
      );

      const response = await request(app)
        .post('/api/process')
        .send({ fileId: 'test-file-id', contentType: 'video' })
        .expect(500);

      expect(response.body.success).not.toBe(true);
    });

    it('should handle content generation failures', async () => {
      // Simulate Bedrock failure
      (bedrockService.generatePlatformContent as jest.Mock).mockRejectedValue(
        new Error('AI service unavailable')
      );

      const response = await request(app)
        .post('/api/generate')
        .send({ 
          jobId: 'test-job-id',
          platforms: ['twitter']
        })
        .expect(500);

      expect(response.body.success).not.toBe(true);
    });
  });

  // ============================================================================
  // PERFORMANCE AND EDGE CASES
  // ============================================================================

  describe('Performance and Edge Cases', () => {
    it('should handle concurrent requests', async () => {
      const requests = Array.from({ length: 5 }, (_, i) => 
        request(app)
          .get(`/api/roi/user-${i}`)
      );

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });

    it('should handle very long transcripts', async () => {
      const longTranscript = 'AI technology '.repeat(1000);

      const response = await request(app)
        .post('/api/viral/predict')
        .send({ transcript: longTranscript })
        .expect(200);

      expectSuccessResponse(response, 200);
    });

    it('should handle special characters in content', async () => {
      const specialTranscript = 'Content with émojis 🚀 and spëcial çharacters!';

      const response = await request(app)
        .post('/api/viral/predict')
        .send({ transcript: specialTranscript })
        .expect(200);

      expectSuccessResponse(response, 200);
    });

    it('should handle multiple platform generation efficiently', async () => {
      const allPlatforms = ['twitter', 'linkedin', 'instagram', 'tiktok', 'youtube'];
      
      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/generate')
        .send({
          jobId: `transcribe-${Date.now()}`,
          platforms: allPlatforms
        })
        .expect(200);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expectSuccessResponse(response, 200);
      
      // Verify all platforms generated
      allPlatforms.forEach(platform => {
        expect(response.body.results[platform]).toBeTruthy();
      });

      // Performance check (should complete reasonably fast with mocks)
      expect(duration).toBeLessThan(5000); // 5 seconds max
    });

    it('should properly cache and retrieve generation results', async () => {
      // Generate content
      const generateResponse = await request(app)
        .post('/api/generate')
        .send({
          jobId: `transcribe-${Date.now()}`,
          platforms: ['twitter']
        })
        .expect(200);

      const genId = generateResponse.body.generationId;

      // Retrieve multiple times
      for (let i = 0; i < 3; i++) {
        const retrieveResponse = await request(app)
          .get(`/api/generate/${genId}`)
          .expect(200);

        expect(retrieveResponse.body.generationId).toBe(genId);
        expect(retrieveResponse.body.results).toEqual(generateResponse.body.results);
      }
    });
  });
});
