/**
 * ROI Calculator Service Tests
 * 
 * Comprehensive unit tests for the ROI calculator service
 * Tests ROI calculations, time/money savings, and edge cases
 */

import {
  roiCalculatorService,
  ROICalculation,
} from '../services/roi-calculator.service';

import {
  randomString,
} from './setup';

describe('ROICalculatorService', () => {
  describe('calculate', () => {
    it('should return ROI calculation for a valid user ID', async () => {
      const userId = randomString(10);
      const roi = await roiCalculatorService.calculate(userId);

      expect(roi).toBeDefined();
      expect(roi).toHaveProperty('videosProcessed');
      expect(roi).toHaveProperty('timeSaved');
      expect(roi).toHaveProperty('moneySaved');
      expect(roi).toHaveProperty('roi');
      expect(roi).toHaveProperty('breakdown');
      expect(roi).toHaveProperty('projections');
    });

    it('should return ROI calculation with correct structure', async () => {
      const userId = randomString(10);
      const roi = await roiCalculatorService.calculate(userId);

      expect(typeof roi.videosProcessed).toBe('number');
      expect(typeof roi.timeSaved).toBe('string');
      expect(typeof roi.moneySaved).toBe('string');
      expect(typeof roi.roi).toBe('string');
      expect(typeof roi.breakdown).toBe('object');
      expect(typeof roi.projections).toBe('object');
    });
  });

  describe('ROI Calculations', () => {
    let roi: ROICalculation;

    beforeEach(async () => {
      roi = await roiCalculatorService.calculate('test-user');
    });

    it('should calculate time saved correctly', async () => {
      const roi = await roiCalculatorService.calculate('test-user');
      
      // With 50 videos (default mock):
      // Manual time: 50 * 5 hours = 250 hours
      // AI time: 50 * 60 seconds = 3000 seconds = 0.833 hours
      // Time saved: 250 - 0.833 = 249.167 hours
      
      expect(roi.timeSaved).toBeDefined();
      expect(roi.timeSaved).toContain('days');
    });

    it('should calculate money saved correctly', async () => {
      const roi = await roiCalculatorService.calculate('test-user');
      
      // With 50 videos:
      // Manual cost: 250 hours * $50/hour = $12,500
      // AI cost: 50 * $0.10 = $5
      // Money saved: $12,500 - $5 = $12,495
      
      expect(roi.moneySaved).toBeDefined();
      const moneySaved = parseFloat(roi.moneySaved);
      expect(moneySaved).toBeGreaterThan(0);
      expect(moneySaved).toBeCloseTo(12495, 0);
    });

    it('should calculate ROI percentage correctly', async () => {
      const roi = await roiCalculatorService.calculate('test-user');
      
      // ROI = ((Money Saved / AI Cost) * 100)
      // ROI = (($12,495 / $5) * 100) = 249,900%
      
      expect(roi.roi).toBeDefined();
      expect(roi.roi).toContain('%');
      
      const roiValue = parseInt(roi.roi.replace('%', ''));
      expect(roiValue).toBeGreaterThan(0);
      expect(roiValue).toBeCloseTo(249900, 0);
    });
  });

  describe('Breakdown Calculations', () => {
    let roi: ROICalculation;

    beforeEach(async () => {
      roi = await roiCalculatorService.calculate('test-user');
    });

    it('should include breakdown object', () => {
      expect(roi.breakdown).toBeDefined();
      expect(roi.breakdown).toHaveProperty('manualTime');
      expect(roi.breakdown).toHaveProperty('aiTime');
      expect(roi.breakdown).toHaveProperty('manualCost');
      expect(roi.breakdown).toHaveProperty('aiCost');
    });

    it('should calculate manual time correctly', () => {
      // 50 videos * 5 hours = 250 hours
      expect(roi.breakdown.manualTime).toBeDefined();
      expect(roi.breakdown.manualTime).toContain('days');
      
      // 250 hours = 10 days 10 hours
      expect(roi.breakdown.manualTime).toContain('10 days');
    });

    it('should calculate AI time correctly', () => {
      // 50 videos * 60 seconds = 3000 seconds = 50 minutes
      expect(roi.breakdown.aiTime).toBeDefined();
      expect(roi.breakdown.aiTime).toContain('minutes');
      expect(roi.breakdown.aiTime).toContain('50');
    });

    it('should calculate manual cost correctly', () => {
      // 250 hours * $50/hour = $12,500
      expect(roi.breakdown.manualCost).toBeDefined();
      expect(typeof roi.breakdown.manualCost).toBe('number');
      expect(roi.breakdown.manualCost).toBe(12500);
    });

    it('should calculate AI cost correctly', () => {
      // 50 videos * $0.10 = $5
      expect(roi.breakdown.aiCost).toBeDefined();
      expect(typeof roi.breakdown.aiCost).toBe('number');
      expect(roi.breakdown.aiCost).toBe(5);
    });

    it('should have manual cost greater than AI cost', () => {
      expect(roi.breakdown.manualCost).toBeGreaterThan(roi.breakdown.aiCost);
    });

    it('should have manual time greater than AI time', () => {
      // Parse time strings to compare
      const manualHours = parseFloat(roi.breakdown.manualTime);
      const aiMinutes = parseFloat(roi.breakdown.aiTime);
      
      // Manual should be in hours/days, AI in minutes
      expect(roi.breakdown.manualTime).toContain('days');
      expect(roi.breakdown.aiTime).toContain('minutes');
    });
  });

  describe('Projections Calculations', () => {
    let roi: ROICalculation;

    beforeEach(async () => {
      roi = await roiCalculatorService.calculate('test-user');
    });

    it('should include projections object', () => {
      expect(roi.projections).toBeDefined();
      expect(roi.projections).toHaveProperty('monthly');
      expect(roi.projections).toHaveProperty('yearly');
    });

    it('should calculate monthly projections', () => {
      expect(roi.projections.monthly).toBeDefined();
      expect(roi.projections.monthly).toHaveProperty('videos');
      expect(roi.projections.monthly).toHaveProperty('savings');
      
      // Monthly videos = 50 / 3 = ~17
      expect(roi.projections.monthly.videos).toBeCloseTo(17, 0);
      
      // Monthly savings = $12,495 / 3 = $4,165
      const monthlySavings = parseFloat(roi.projections.monthly.savings);
      expect(monthlySavings).toBeCloseTo(4165, 0);
    });

    it('should calculate yearly projections', () => {
      expect(roi.projections.yearly).toBeDefined();
      expect(roi.projections.yearly).toHaveProperty('videos');
      expect(roi.projections.yearly).toHaveProperty('savings');
      
      // Yearly videos = 50 * 4 = 200
      expect(roi.projections.yearly.videos).toBe(200);
      
      // Yearly savings = $12,495 * 4 = $49,980
      const yearlySavings = parseFloat(roi.projections.yearly.savings);
      expect(yearlySavings).toBeCloseTo(49980, 0);
    });

    it('should have yearly projections greater than monthly', () => {
      const monthlyVideos = roi.projections.monthly.videos;
      const yearlyVideos = roi.projections.yearly.videos;
      
      expect(yearlyVideos).toBeGreaterThan(monthlyVideos);
      
      const monthlySavings = parseFloat(roi.projections.monthly.savings);
      const yearlySavings = parseFloat(roi.projections.yearly.savings);
      
      expect(yearlySavings).toBeGreaterThan(monthlySavings);
    });

    it('should have positive projection values', () => {
      expect(roi.projections.monthly.videos).toBeGreaterThan(0);
      expect(roi.projections.yearly.videos).toBeGreaterThan(0);
      
      const monthlySavings = parseFloat(roi.projections.monthly.savings);
      const yearlySavings = parseFloat(roi.projections.yearly.savings);
      
      expect(monthlySavings).toBeGreaterThan(0);
      expect(yearlySavings).toBeGreaterThan(0);
    });
  });

  describe('Formula Validation', () => {
    it('should use correct manual time formula (4-6 hours average = 5 hours)', async () => {
      const roi = await roiCalculatorService.calculate('test-user');
      
      // Manual time per video should be 5 hours (average of 4-6)
      // 50 videos * 5 hours = 250 hours
      const manualCost = roi.breakdown.manualCost;
      const hourlyRate = 50;
      const manualHours = manualCost / hourlyRate;
      
      expect(manualHours).toBe(250);
      expect(manualHours / 50).toBe(5); // 5 hours per video
    });

    it('should use correct AI time formula (60 seconds per video)', async () => {
      const roi = await roiCalculatorService.calculate('test-user');
      
      // AI time should be 60 seconds per video
      // 50 videos * 60 seconds = 3000 seconds = 50 minutes
      expect(roi.breakdown.aiTime).toContain('50 minutes');
    });

    it('should use correct manual cost formula ($50/hour)', async () => {
      const roi = await roiCalculatorService.calculate('test-user');
      
      // Manual cost = hours * $50/hour
      // 250 hours * $50 = $12,500
      expect(roi.breakdown.manualCost).toBe(12500);
    });

    it('should use correct AI cost formula ($0.10/video)', async () => {
      const roi = await roiCalculatorService.calculate('test-user');
      
      // AI cost = videos * $0.10
      // 50 videos * $0.10 = $5
      expect(roi.breakdown.aiCost).toBe(5);
    });

    it('should calculate ROI using correct formula', async () => {
      const roi = await roiCalculatorService.calculate('test-user');
      
      // ROI = ((moneySaved / aiCost) * 100)%
      const moneySaved = parseFloat(roi.moneySaved);
      const aiCost = roi.breakdown.aiCost;
      const expectedROI = ((moneySaved / aiCost) * 100).toFixed(0);
      
      expect(roi.roi).toBe(`${expectedROI}%`);
    });
  });

  describe('Edge Cases', () => {
    describe('1 Video', () => {
      let roi: ROICalculation;

      beforeEach(async () => {
        // Mock getUserVideoCount to return 1
        jest.spyOn(roiCalculatorService as any, 'getUserVideoCount')
          .mockResolvedValue(1);
        
        roi = await roiCalculatorService.calculate('one-video-user');
      });

      afterEach(() => {
        jest.restoreAllMocks();
      });

      it('should handle 1 video correctly', () => {
        expect(roi.videosProcessed).toBe(1);
      });

      it('should calculate time saved for 1 video', () => {
        // Manual: 1 * 5 hours = 5 hours
        // AI: 1 * 60 seconds = 1 minute
        // Saved: ~5 hours
        expect(roi.timeSaved).toBeDefined();
        expect(roi.timeSaved).toContain('hours');
      });

      it('should calculate money saved for 1 video', () => {
        // Manual: 5 hours * $50 = $250
        // AI: 1 * $0.10 = $0.10
        // Saved: $249.90
        const moneySaved = parseFloat(roi.moneySaved);
        expect(moneySaved).toBeCloseTo(249.90, 2);
      });

      it('should calculate ROI for 1 video', () => {
        // ROI = (($249.90 / $0.10) * 100) = 249,900%
        const roiValue = parseInt(roi.roi.replace('%', ''));
        expect(roiValue).toBeCloseTo(249900, 0);
      });

      it('should have valid breakdown for 1 video', () => {
        expect(roi.breakdown.manualTime).toContain('5.0 hours');
        expect(roi.breakdown.aiTime).toContain('1 minutes');
        expect(roi.breakdown.manualCost).toBe(250);
        expect(roi.breakdown.aiCost).toBe(0.10);
      });
    });

    describe('1000 Videos', () => {
      let roi: ROICalculation;

      beforeEach(async () => {
        // Mock getUserVideoCount to return 1000
        jest.spyOn(roiCalculatorService as any, 'getUserVideoCount')
          .mockResolvedValue(1000);
        
        roi = await roiCalculatorService.calculate('thousand-video-user');
      });

      afterEach(() => {
        jest.restoreAllMocks();
      });

      it('should handle 1000 videos correctly', () => {
        expect(roi.videosProcessed).toBe(1000);
      });

      it('should calculate time saved for 1000 videos', () => {
        // Manual: 1000 * 5 hours = 5000 hours
        // AI: 1000 * 60 seconds = 16.67 hours
        // Saved: ~4983 hours = 207 days
        expect(roi.timeSaved).toBeDefined();
        expect(roi.timeSaved).toContain('days');
      });

      it('should calculate money saved for 1000 videos', () => {
        // Manual: 5000 hours * $50 = $250,000
        // AI: 1000 * $0.10 = $100
        // Saved: $249,900
        const moneySaved = parseFloat(roi.moneySaved);
        expect(moneySaved).toBeCloseTo(249900, 0);
      });

      it('should calculate ROI for 1000 videos', () => {
        // ROI = (($249,900 / $100) * 100) = 249,900%
        const roiValue = parseInt(roi.roi.replace('%', ''));
        expect(roiValue).toBeCloseTo(249900, 0);
      });

      it('should have valid breakdown for 1000 videos', () => {
        expect(roi.breakdown.manualTime).toContain('days');
        expect(roi.breakdown.aiTime).toContain('hours');
        expect(roi.breakdown.manualCost).toBe(250000);
        expect(roi.breakdown.aiCost).toBe(100);
      });

      it('should have realistic yearly projections for 1000 videos', () => {
        // Yearly: 1000 * 4 = 4000 videos
        expect(roi.projections.yearly.videos).toBe(4000);
        
        // Yearly savings: $249,900 * 4 = $999,600
        const yearlySavings = parseFloat(roi.projections.yearly.savings);
        expect(yearlySavings).toBeCloseTo(999600, 0);
      });
    });

    describe('0 Videos', () => {
      let roi: ROICalculation;

      beforeEach(async () => {
        // Mock getUserVideoCount to return 0
        jest.spyOn(roiCalculatorService as any, 'getUserVideoCount')
          .mockResolvedValue(0);
        
        roi = await roiCalculatorService.calculate('zero-video-user');
      });

      afterEach(() => {
        jest.restoreAllMocks();
      });

      it('should handle 0 videos correctly', () => {
        expect(roi.videosProcessed).toBe(0);
      });

      it('should calculate zero time saved for 0 videos', () => {
        expect(roi.timeSaved).toBeDefined();
        expect(roi.timeSaved).toContain('0 minutes');
      });

      it('should calculate zero money saved for 0 videos', () => {
        const moneySaved = parseFloat(roi.moneySaved);
        expect(moneySaved).toBe(0);
      });

      it('should handle ROI calculation for 0 videos', () => {
        // ROI with 0 videos would be division by zero
        // Should return "0%" or handle gracefully
        expect(roi.roi).toBeDefined();
      });

      it('should have zero costs for 0 videos', () => {
        expect(roi.breakdown.manualCost).toBe(0);
        expect(roi.breakdown.aiCost).toBe(0);
      });

      it('should have zero projections for 0 videos', () => {
        expect(roi.projections.monthly.videos).toBe(0);
        expect(roi.projections.yearly.videos).toBe(0);
        
        const monthlySavings = parseFloat(roi.projections.monthly.savings);
        const yearlySavings = parseFloat(roi.projections.yearly.savings);
        
        expect(monthlySavings).toBe(0);
        expect(yearlySavings).toBe(0);
      });
    });
  });

  describe('Time Formatting', () => {
    it('should format time in minutes for less than 1 hour', async () => {
      jest.spyOn(roiCalculatorService as any, 'getUserVideoCount')
        .mockResolvedValue(1);
      
      const roi = await roiCalculatorService.calculate('test-user');
      
      // AI time for 1 video = 60 seconds = 1 minute
      expect(roi.breakdown.aiTime).toContain('minutes');
      
      jest.restoreAllMocks();
    });

    it('should format time in hours for 1-23 hours', async () => {
      jest.spyOn(roiCalculatorService as any, 'getUserVideoCount')
        .mockResolvedValue(3);
      
      const roi = await roiCalculatorService.calculate('test-user');
      
      // Manual time for 3 videos = 15 hours
      expect(roi.breakdown.manualTime).toContain('hours');
      
      jest.restoreAllMocks();
    });

    it('should format time in days and hours for 24+ hours', async () => {
      jest.spyOn(roiCalculatorService as any, 'getUserVideoCount')
        .mockResolvedValue(50);
      
      const roi = await roiCalculatorService.calculate('test-user');
      
      // Manual time for 50 videos = 250 hours = 10 days 10 hours
      expect(roi.breakdown.manualTime).toContain('days');
      expect(roi.breakdown.manualTime).toContain('hours');
      
      jest.restoreAllMocks();
    });
  });

  describe('Data Consistency', () => {
    it('should return consistent data for same user', async () => {
      const userId = 'consistent-user';
      const roi1 = await roiCalculatorService.calculate(userId);
      const roi2 = await roiCalculatorService.calculate(userId);
      
      expect(roi1.videosProcessed).toBe(roi2.videosProcessed);
      expect(roi1.timeSaved).toBe(roi2.timeSaved);
      expect(roi1.moneySaved).toBe(roi2.moneySaved);
      expect(roi1.roi).toBe(roi2.roi);
    });

    it('should have money saved equal to manual cost minus AI cost', async () => {
      const roi = await roiCalculatorService.calculate('test-user');
      
      const moneySaved = parseFloat(roi.moneySaved);
      const expectedSavings = roi.breakdown.manualCost - roi.breakdown.aiCost;
      
      expect(moneySaved).toBeCloseTo(expectedSavings, 2);
    });

    it('should have all numeric values as positive or zero', async () => {
      const roi = await roiCalculatorService.calculate('test-user');
      
      expect(roi.videosProcessed).toBeGreaterThanOrEqual(0);
      expect(parseFloat(roi.moneySaved)).toBeGreaterThanOrEqual(0);
      expect(roi.breakdown.manualCost).toBeGreaterThanOrEqual(0);
      expect(roi.breakdown.aiCost).toBeGreaterThanOrEqual(0);
      expect(roi.projections.monthly.videos).toBeGreaterThanOrEqual(0);
      expect(roi.projections.yearly.videos).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Type Safety', () => {
    it('should return correct TypeScript types', async () => {
      const roi = await roiCalculatorService.calculate('test-user');
      
      // Check main object structure
      expect(typeof roi.videosProcessed).toBe('number');
      expect(typeof roi.timeSaved).toBe('string');
      expect(typeof roi.moneySaved).toBe('string');
      expect(typeof roi.roi).toBe('string');
      
      // Check breakdown structure
      expect(typeof roi.breakdown.manualTime).toBe('string');
      expect(typeof roi.breakdown.aiTime).toBe('string');
      expect(typeof roi.breakdown.manualCost).toBe('number');
      expect(typeof roi.breakdown.aiCost).toBe('number');
      
      // Check projections structure
      expect(typeof roi.projections.monthly.videos).toBe('number');
      expect(typeof roi.projections.monthly.savings).toBe('string');
      expect(typeof roi.projections.yearly.videos).toBe('number');
      expect(typeof roi.projections.yearly.savings).toBe('string');
    });

    it('should have all required properties', async () => {
      const roi = await roiCalculatorService.calculate('test-user');
      
      const requiredProps = [
        'videosProcessed',
        'timeSaved',
        'moneySaved',
        'roi',
        'breakdown',
        'projections'
      ];
      
      requiredProps.forEach(prop => {
        expect(roi).toHaveProperty(prop);
      });
    });

    it('should have all required breakdown properties', async () => {
      const roi = await roiCalculatorService.calculate('test-user');
      
      const breakdownProps = ['manualTime', 'aiTime', 'manualCost', 'aiCost'];
      
      breakdownProps.forEach(prop => {
        expect(roi.breakdown).toHaveProperty(prop);
      });
    });

    it('should have all required projection properties', async () => {
      const roi = await roiCalculatorService.calculate('test-user');
      
      expect(roi.projections).toHaveProperty('monthly');
      expect(roi.projections).toHaveProperty('yearly');
      
      expect(roi.projections.monthly).toHaveProperty('videos');
      expect(roi.projections.monthly).toHaveProperty('savings');
      expect(roi.projections.yearly).toHaveProperty('videos');
      expect(roi.projections.yearly).toHaveProperty('savings');
    });
  });

  describe('Performance', () => {
    it('should return ROI calculation quickly', async () => {
      const startTime = Date.now();
      await roiCalculatorService.calculate('test-user');
      const endTime = Date.now();
      
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle multiple concurrent requests', async () => {
      const promises = Array.from({ length: 10 }, (_, i) => 
        roiCalculatorService.calculate(`user-${i}`)
      );
      
      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.videosProcessed).toBeDefined();
      });
    });
  });

  describe('Business Logic Validation', () => {
    it('should always show positive ROI (AI is cheaper than manual)', async () => {
      const roi = await roiCalculatorService.calculate('test-user');
      
      const roiValue = parseInt(roi.roi.replace('%', ''));
      expect(roiValue).toBeGreaterThan(0);
    });

    it('should show significant time savings', async () => {
      const roi = await roiCalculatorService.calculate('test-user');
      
      // Manual time should be much greater than AI time
      expect(roi.breakdown.manualTime).toContain('days');
      expect(roi.breakdown.aiTime).toContain('minutes');
    });

    it('should show significant cost savings', async () => {
      const roi = await roiCalculatorService.calculate('test-user');
      
      // Manual cost should be much greater than AI cost
      expect(roi.breakdown.manualCost).toBeGreaterThan(roi.breakdown.aiCost * 100);
    });

    it('should demonstrate value proposition', async () => {
      const roi = await roiCalculatorService.calculate('test-user');
      
      const moneySaved = parseFloat(roi.moneySaved);
      const aiCost = roi.breakdown.aiCost;
      
      // Money saved should be at least 100x the AI cost
      expect(moneySaved).toBeGreaterThan(aiCost * 100);
    });
  });
});
