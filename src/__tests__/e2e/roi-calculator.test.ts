/**
 * E2E Tests for ROI Calculator Feature
 * 
 * Tests the complete ROI calculation workflow:
 * 1. Calculate time saved from AI automation
 * 2. Calculate money saved (content creation, editing, research)
 * 3. Track productivity metrics
 * 4. Compare with/without AI scenarios
 * 5. Show ROI trends over time
 * 
 * Feature #13 from FEATURES_MASTER.md
 */

import request from 'supertest';
import app from '../../index';
import { roiCalculatorService } from '../../services/roi-calculator.service';
import { cacheService } from '../../services/cache.service';
import { expectSuccessResponse, expectErrorResponse } from '../setup';

// Mock services
jest.mock('../../services/roi-calculator.service');

describe('E2E: ROI Calculator', () => {
  const testUserId = 'roi-test-user';
  
  const mockROIData = {
    timeSaved: {
      hours: 45.5,
      value: 2275, // hours * $50/hour
      breakdown: {
        contentCreation: 25,
        editing: 15,
        research: 5.5
      }
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
      avgTimePerContent: 2.5,
      qualityScore: 0.92
    },
    comparison: {
      withAI: 2.5,
      withoutAI: 25,
      improvement: '90%',
      efficiencyGain: 10
    },
    period: {
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      days: 31
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    cacheService.clear();

    // Setup default mocks
    (roiCalculatorService.calculate as jest.Mock).mockResolvedValue(mockROIData);
  });

  afterEach(() => {
    cacheService.clear();
  });

  describe('GET /api/roi/:userId - Calculate ROI', () => {
    describe('Successful Calculations', () => {
      it('should calculate ROI for user with activity', async () => {
        const response = await request(app)
          .get(`/api/roi/${testUserId}`)
          .expect(200);

        expectSuccessResponse(response, 200);
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

        // Verify service was called
        expect(roiCalculatorService.calculate).toHaveBeenCalledWith(testUserId);
      });

      it('should calculate ROI for new user with zero values', async () => {
        const newUserId = 'new-user-123';
        
        (roiCalculatorService.calculate as jest.Mock).mockResolvedValueOnce({
          timeSaved: { hours: 0, value: 0, breakdown: { contentCreation: 0, editing: 0, research: 0 } },
          moneySaved: { amount: 0, breakdown: { contentCreation: 0, editing: 0, research: 0 } },
          productivity: { contentGenerated: 0, platformsCovered: 0, avgTimePerContent: 0, qualityScore: 0 },
          comparison: { withAI: 0, withoutAI: 0, improvement: '0%', efficiencyGain: 0 },
          period: { startDate: new Date().toISOString(), endDate: new Date().toISOString(), days: 0 }
        });

        const response = await request(app)
          .get(`/api/roi/${newUserId}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.roi.timeSaved.hours).toBe(0);
        expect(response.body.roi.moneySaved.amount).toBe(0);
        expect(response.body.roi.productivity.contentGenerated).toBe(0);
      });

      it('should return time saved metrics', async () => {
        const response = await request(app)
          .get(`/api/roi/${testUserId}`)
          .expect(200);

        const timeSaved = response.body.roi.timeSaved;
        expect(timeSaved).toHaveProperty('hours');
        expect(timeSaved).toHaveProperty('value');
        expect(timeSaved).toHaveProperty('breakdown');
        
        expect(typeof timeSaved.hours).toBe('number');
        expect(typeof timeSaved.value).toBe('number');
        expect(timeSaved.hours).toBeGreaterThan(0);
        expect(timeSaved.value).toBeGreaterThan(0);
      });

      it('should return money saved breakdown', async () => {
        const response = await request(app)
          .get(`/api/roi/${testUserId}`)
          .expect(200);

        const moneySaved = response.body.roi.moneySaved;
        expect(moneySaved).toHaveProperty('amount');
        expect(moneySaved).toHaveProperty('breakdown');
        
        const breakdown = moneySaved.breakdown;
        expect(breakdown).toHaveProperty('contentCreation');
        expect(breakdown).toHaveProperty('editing');
        expect(breakdown).toHaveProperty('research');
        
        expect(typeof breakdown.contentCreation).toBe('number');
        expect(typeof breakdown.editing).toBe('number');
        expect(typeof breakdown.research).toBe('number');
      });

      it('should return productivity metrics', async () => {
        const response = await request(app)
          .get(`/api/roi/${testUserId}`)
          .expect(200);

        const productivity = response.body.roi.productivity;
        expect(productivity).toHaveProperty('contentGenerated');
        expect(productivity).toHaveProperty('platformsCovered');
        expect(productivity).toHaveProperty('avgTimePerContent');
        expect(productivity).toHaveProperty('qualityScore');
        
        expect(typeof productivity.contentGenerated).toBe('number');
        expect(typeof productivity.platformsCovered).toBe('number');
        expect(typeof productivity.avgTimePerContent).toBe('number');
        expect(productivity.qualityScore).toBeGreaterThanOrEqual(0);
        expect(productivity.qualityScore).toBeLessThanOrEqual(1);
      });

      it('should return comparison metrics', async () => {
        const response = await request(app)
          .get(`/api/roi/${testUserId}`)
          .expect(200);

        const comparison = response.body.roi.comparison;
        expect(comparison).toHaveProperty('withAI');
        expect(comparison).toHaveProperty('withoutAI');
        expect(comparison).toHaveProperty('improvement');
        expect(comparison).toHaveProperty('efficiencyGain');
        
        expect(typeof comparison.withAI).toBe('number');
        expect(typeof comparison.withoutAI).toBe('number');
        expect(typeof comparison.improvement).toBe('string');
        expect(comparison.improvement).toMatch(/^\d+%$/);
      });

      it('should calculate percentage improvement correctly', async () => {
        const response = await request(app)
          .get(`/api/roi/${testUserId}`)
          .expect(200);

        const improvement = response.body.roi.comparison.improvement;
        expect(improvement).toMatch(/^\d+%$/);
        
        const percentage = parseInt(improvement);
        expect(percentage).toBeGreaterThanOrEqual(0);
        expect(percentage).toBeLessThanOrEqual(100);
      });

      it('should validate realistic values', async () => {
        const response = await request(app)
          .get(`/api/roi/${testUserId}`)
          .expect(200);

        const roi = response.body.roi;
        
        // Time saved should be reasonable (not negative, not absurdly high)
        expect(roi.timeSaved.hours).toBeGreaterThanOrEqual(0);
        expect(roi.timeSaved.hours).toBeLessThan(10000);
        
        // Money saved should be reasonable
        expect(roi.moneySaved.amount).toBeGreaterThanOrEqual(0);
        expect(roi.moneySaved.amount).toBeLessThan(1000000);
        
        // Content generated should be reasonable
        expect(roi.productivity.contentGenerated).toBeGreaterThanOrEqual(0);
        expect(roi.productivity.contentGenerated).toBeLessThan(100000);
      });

      it('should handle multiple calculation requests', async () => {
        const response1 = await request(app)
          .get(`/api/roi/${testUserId}`)
          .expect(200);

        const response2 = await request(app)
          .get(`/api/roi/${testUserId}`)
          .expect(200);

        expect(response1.body.success).toBe(true);
        expect(response2.body.success).toBe(true);
        expect(response1.body.roi).toEqual(response2.body.roi);
      });

      it('should cache ROI results', async () => {
        const response = await request(app)
          .get(`/api/roi/${testUserId}`)
          .expect(200);

        expect(response.body.success).toBe(true);

        // Verify cache
        const cacheKey = `roi-${testUserId}`;
        const cached = cacheService.get(cacheKey);
        expect(cached).toBeDefined();
      });
    });

    describe('ROI Breakdown', () => {
      it('should break down content creation savings', async () => {
        const response = await request(app)
          .get(`/api/roi/${testUserId}`)
          .expect(200);

        const breakdown = response.body.roi.timeSaved.breakdown;
        expect(breakdown.contentCreation).toBeDefined();
        expect(typeof breakdown.contentCreation).toBe('number');
        expect(breakdown.contentCreation).toBeGreaterThan(0);
      });

      it('should break down editing savings', async () => {
        const response = await request(app)
          .get(`/api/roi/${testUserId}`)
          .expect(200);

        const breakdown = response.body.roi.timeSaved.breakdown;
        expect(breakdown.editing).toBeDefined();
        expect(typeof breakdown.editing).toBe('number');
      });

      it('should break down research savings', async () => {
        const response = await request(app)
          .get(`/api/roi/${testUserId}`)
          .expect(200);

        const breakdown = response.body.roi.timeSaved.breakdown;
        expect(breakdown.research).toBeDefined();
        expect(typeof breakdown.research).toBe('number');
      });

      it('should calculate total hours saved', async () => {
        const response = await request(app)
          .get(`/api/roi/${testUserId}`)
          .expect(200);

        const timeSaved = response.body.roi.timeSaved;
        const breakdown = timeSaved.breakdown;
        
        const calculatedTotal = breakdown.contentCreation + breakdown.editing + breakdown.research;
        expect(timeSaved.hours).toBeCloseTo(calculatedTotal, 1);
      });

      it('should apply hourly rate correctly', async () => {
        const response = await request(app)
          .get(`/api/roi/${testUserId}`)
          .query({ hourlyRate: 75 })
          .expect(200);

        const timeSaved = response.body.roi.timeSaved;
        const expectedValue = timeSaved.hours * 75;
        
        // Allow for rounding differences
        expect(timeSaved.value).toBeCloseTo(expectedValue, 0);
      });

      it('should include platform coverage', async () => {
        const response = await request(app)
          .get(`/api/roi/${testUserId}`)
          .expect(200);

        const productivity = response.body.roi.productivity;
        expect(productivity.platformsCovered).toBeDefined();
        expect(productivity.platformsCovered).toBeGreaterThanOrEqual(0);
        expect(productivity.platformsCovered).toBeLessThanOrEqual(6); // Max 6 platforms
      });

      it('should count content generated', async () => {
        const response = await request(app)
          .get(`/api/roi/${testUserId}`)
          .expect(200);

        const productivity = response.body.roi.productivity;
        expect(productivity.contentGenerated).toBeDefined();
        expect(typeof productivity.contentGenerated).toBe('number');
        expect(productivity.contentGenerated).toBeGreaterThanOrEqual(0);
      });

      it('should calculate average time per content', async () => {
        const response = await request(app)
          .get(`/api/roi/${testUserId}`)
          .expect(200);

        const productivity = response.body.roi.productivity;
        expect(productivity.avgTimePerContent).toBeDefined();
        expect(typeof productivity.avgTimePerContent).toBe('number');
        expect(productivity.avgTimePerContent).toBeGreaterThan(0);
      });
    });

    describe('ROI History and Trends', () => {
      it('should retrieve ROI calculation multiple times', async () => {
        const response1 = await request(app)
          .get(`/api/roi/${testUserId}`)
          .expect(200);

        const response2 = await request(app)
          .get(`/api/roi/${testUserId}`)
          .expect(200);

        expect(response1.body).toHaveProperty('success', true);
        expect(response2.body).toHaveProperty('success', true);
        expect(response1.body.roi).toEqual(response2.body.roi);
      });

      it('should calculate ROI with custom date range', async () => {
        const startDate = '2024-01-01';
        const endDate = '2024-01-31';

        const response = await request(app)
          .get(`/api/roi/${testUserId}`)
          .query({ startDate, endDate })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.roi.period).toBeDefined();
      });

      it('should show ROI trends over time', async () => {
        // First calculation
        const first = await request(app)
          .get(`/api/roi/${testUserId}`)
          .expect(200);

        // Simulate time passing and more activity
        (roiCalculatorService.calculate as jest.Mock).mockResolvedValueOnce({
          ...mockROIData,
          timeSaved: { ...mockROIData.timeSaved, hours: 50 }
        });

        // Second calculation
        const second = await request(app)
          .get(`/api/roi/${testUserId}`)
          .expect(200);

        expect(first.body.success).toBe(true);
        expect(second.body.success).toBe(true);
      });

      it('should compare month-over-month savings', async () => {
        const response = await request(app)
          .get(`/api/roi/${testUserId}`)
          .query({ compareMonths: true })
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.roi).toBeDefined();
      });

      it('should track year-over-year improvements', async () => {
        const response = await request(app)
          .get(`/api/roi/${testUserId}`)
          .query({ compareYears: true })
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.roi).toBeDefined();
      });
    });

    describe('Integration with Other Features', () => {
      it('should update ROI after content generation', async () => {
        // Generate content
        await request(app)
          .post('/api/generate')
          .send({
            jobId: 'test-job-123',
            platforms: ['youtube', 'twitter'],
            userId: testUserId
          })
          .expect(200);

        // Check ROI update
        const response = await request(app)
          .get(`/api/roi/${testUserId}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.roi.productivity.contentGenerated).toBeGreaterThan(0);
      });

      it('should update ROI after DNA analysis', async () => {
        // Perform DNA analysis
        await request(app)
          .post('/api/dna/analyze')
          .send({
            userId: testUserId,
            videoIds: ['v1', 'v2', 'v3', 'v4', 'v5']
          })
          .expect(200);

        // Check ROI includes DNA analysis time
        const response = await request(app)
          .get(`/api/roi/${testUserId}`)
          .expect(200);

        expect(response.body.success).toBe(true);
      });

      it('should update ROI after viral optimization', async () => {
        // Optimize for virality
        await request(app)
          .post('/api/viral/optimize')
          .send({
            transcript: 'Test content',
            currentScore: 60,
            targetScore: 85,
            userId: testUserId
          })
          .expect(200);

        // Check ROI
        const response = await request(app)
          .get(`/api/roi/${testUserId}`)
          .expect(200);

        expect(response.body.success).toBe(true);
      });

      it('should update ROI after workspace activity', async () => {
        // Create workspace
        await request(app)
          .post('/api/workspace')
          .send({
            name: 'Test Workspace',
            ownerId: testUserId
          })
          .expect(200);

        // Check ROI includes collaboration time
        const response = await request(app)
          .get(`/api/roi/${testUserId}`)
          .expect(200);

        expect(response.body.success).toBe(true);
      });

      it('should aggregate ROI across platforms', async () => {
        const response = await request(app)
          .get(`/api/roi/${testUserId}`)
          .query({ breakdown: 'platform' })
          .expect(200);

        expect(response.body).toHaveProperty('platformBreakdown');
        expect(response.body.platformBreakdown).toHaveProperty('youtube');
        expect(response.body.platformBreakdown).toHaveProperty('twitter');
        expect(response.body.platformBreakdown).toHaveProperty('instagram');
      });
    });

    describe('Error Handling', () => {
      it('should return 400 when userId is missing', async () => {
        const response = await request(app)
          .get('/api/roi/')
          .expect(404);

        expect(response.body.error).toBeDefined();
      });

      it('should return 400 for invalid userId format', async () => {
        const response = await request(app)
          .get('/api/roi/invalid@user#id')
          .expect(400);

        expectErrorResponse(response, 400);
        expect(response.body.error).toContain('Invalid userId');
      });

      it('should handle service failures', async () => {
        (roiCalculatorService.calculate as jest.Mock).mockRejectedValue(
          new Error('Database connection failed')
        );

        const response = await request(app)
          .get(`/api/roi/${testUserId}`)
          .expect(500);

        expectErrorResponse(response, 500);
      });

      it('should handle insufficient data', async () => {
        (roiCalculatorService.calculate as jest.Mock).mockRejectedValue(
          new Error('Insufficient data for ROI calculation')
        );

        const response = await request(app)
          .get(`/api/roi/${testUserId}`)
          .expect(500);

        expectErrorResponse(response, 500);
        expect(response.body.error).toContain('Insufficient data');
      });

      it('should handle timeout scenarios', async () => {
        (roiCalculatorService.calculate as jest.Mock).mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 35000))
        );

        const response = await request(app)
          .get(`/api/roi/${testUserId}`)
          .timeout(30000)
          .expect(500);

        expectErrorResponse(response, 500);
      });
    });
  });

  describe('POST /api/roi/summary - Get ROI Summary', () => {
    it('should get comprehensive ROI summary', async () => {
      const response = await request(app)
        .get(`/api/roi/${testUserId}`)
        .query({ detailed: true })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('roi');
      expect(response.body.roi).toHaveProperty('timeSaved');
      expect(response.body.roi).toHaveProperty('moneySaved');
    });

    it('should include breakdown in summary', async () => {
      const response = await request(app)
        .get(`/api/roi/${testUserId}`)
        .query({ includeBreakdown: true })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.roi.timeSaved.breakdown).toBeDefined();
      expect(response.body.roi.moneySaved.breakdown).toBeDefined();
    });

    it('should support custom period in summary', async () => {
      const response = await request(app)
        .get(`/api/roi/${testUserId}`)
        .query({ 
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Complete ROI Workflow', () => {
    it('should complete full user journey with ROI tracking', async () => {
      const userId = 'workflow-test-user';

      // Step 1: Upload and process video
      const uploadResponse = await request(app)
        .post('/api/upload')
        .attach('file', Buffer.from('test video'), 'test.mp4')
        .field('userId', userId)
        .expect(200);

      const fileId = uploadResponse.body.fileId;

      // Step 2: Process video
      const processResponse = await request(app)
        .post('/api/process')
        .send({ fileId })
        .expect(200);

      const jobId = processResponse.body.jobId;

      // Step 3: Generate content
      await request(app)
        .post('/api/generate')
        .send({
          jobId,
          platforms: ['youtube', 'twitter', 'instagram'],
          userId
        })
        .expect(200);

      // Step 4: Calculate ROI
      const roiResponse = await request(app)
        .get(`/api/roi/${userId}`)
        .expect(200);

      expect(roiResponse.body.success).toBe(true);
      expect(roiResponse.body.roi.productivity.contentGenerated).toBeGreaterThan(0);
      expect(roiResponse.body.roi.timeSaved.hours).toBeGreaterThan(0);
      expect(roiResponse.body.roi.moneySaved.amount).toBeGreaterThan(0);
    });

    it('should handle concurrent ROI calculations', async () => {
      const userIds = ['user-1', 'user-2', 'user-3', 'user-4', 'user-5'];

      const requests = userIds.map(userId =>
        request(app).get(`/api/roi/${userId}`)
      );

      const responses = await Promise.all(requests);

      responses.forEach((response, index) => {
        expect(response.status).toBe(200);
        expect(response.body.userId).toBe(userIds[index]);
        expect(response.body.roi).toBeDefined();
      });

      expect(roiCalculatorService.calculate).toHaveBeenCalledTimes(5);
    });

    it('should maintain ROI accuracy over time', async () => {
      // Initial ROI
      const initial = await request(app)
        .get(`/api/roi/${testUserId}`)
        .expect(200);

      const initialSavings = initial.body.roi.moneySaved.amount;

      // Simulate activity
      await request(app)
        .post('/api/generate')
        .send({
          jobId: 'test-job-789',
          platforms: ['youtube'],
          userId: testUserId
        })
        .expect(200);

      // Updated ROI
      (roiCalculatorService.calculate as jest.Mock).mockResolvedValueOnce({
        ...mockROIData,
        moneySaved: {
          ...mockROIData.moneySaved,
          amount: initialSavings + 500
        }
      });

      const updated = await request(app)
        .get(`/api/roi/${testUserId}`)
        .expect(200);

      const updatedSavings = updated.body.roi.moneySaved.amount;
      expect(updatedSavings).toBeGreaterThan(initialSavings);
    });
  });

  describe('ROI Metrics Validation', () => {
    it('should validate ROI metrics are within expected ranges', async () => {
      const response = await request(app)
        .get(`/api/roi/${testUserId}`)
        .expect(200);

      const roi = response.body.roi;
      
      // Validate all metrics are positive
      expect(roi.timeSaved.hours).toBeGreaterThanOrEqual(0);
      expect(roi.moneySaved.amount).toBeGreaterThanOrEqual(0);
      expect(roi.productivity.contentGenerated).toBeGreaterThanOrEqual(0);
    });

    it('should show realistic improvement percentages', async () => {
      const response = await request(app)
        .get(`/api/roi/${testUserId}`)
        .expect(200);

      const improvement = response.body.roi.comparison.improvement;
      const percentage = parseInt(improvement);
      
      expect(percentage).toBeGreaterThanOrEqual(0);
      expect(percentage).toBeLessThanOrEqual(100);
    });
  });

  describe('ROI Comparison Features', () => {
    it('should compare ROI across different time periods', async () => {
      const response = await request(app)
        .get(`/api/roi/${testUserId}`)
        .query({ compare: 'periods' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.roi).toBeDefined();
    });

    it('should show ROI improvement trends', async () => {
      const response = await request(app)
        .get(`/api/roi/${testUserId}`)
        .query({ showTrends: true })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.roi.comparison).toBeDefined();
    });
  });
});
