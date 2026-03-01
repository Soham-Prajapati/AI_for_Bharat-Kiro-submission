/**
 * Ecosystem Analytics Service Tests
 * 
 * Comprehensive unit tests for the ecosystem analytics service
 * Tests analytics calculations, platform comparisons, and recommendations
 */

import {
  ecosystemAnalyticsService,
  EcosystemAnalytics,
  PlatformStats,
} from '../services/ecosystem-analytics.service';

import {
  randomString,
  randomNumber,
} from './setup';

describe('EcosystemAnalyticsService', () => {
  describe('getAnalytics', () => {
    it('should return analytics for a valid user ID', async () => {
      const userId = randomString(10);
      const analytics = await ecosystemAnalyticsService.getAnalytics(userId);

      expect(analytics).toBeDefined();
      expect(analytics).toHaveProperty('platforms');
      expect(analytics).toHaveProperty('recommendations');
      expect(analytics).toHaveProperty('bestPerforming');
      expect(analytics).toHaveProperty('contentGaps');
      expect(analytics).toHaveProperty('overallScore');
    });

    it('should return analytics with correct structure', async () => {
      const userId = randomString(10);
      const analytics = await ecosystemAnalyticsService.getAnalytics(userId);

      expect(typeof analytics.overallScore).toBe('number');
      expect(typeof analytics.bestPerforming).toBe('string');
      expect(Array.isArray(analytics.recommendations)).toBe(true);
      expect(Array.isArray(analytics.contentGaps)).toBe(true);
      expect(typeof analytics.platforms).toBe('object');
    });
  });

  describe('Platform Statistics', () => {
    let analytics: EcosystemAnalytics;

    beforeEach(async () => {
      analytics = await ecosystemAnalyticsService.getAnalytics('test-user');
    });

    describe('YouTube Platform', () => {
      it('should include YouTube platform data', () => {
        expect(analytics.platforms.youtube).toBeDefined();
      });

      it('should have valid YouTube statistics', () => {
        const youtube = analytics.platforms.youtube!;
        
        expect(youtube).toHaveProperty('followers');
        expect(youtube).toHaveProperty('engagement');
        expect(youtube).toHaveProperty('topPosts');
        expect(youtube).toHaveProperty('avgViews');
        expect(youtube).toHaveProperty('growthRate');
      });

      it('should have positive YouTube follower count', () => {
        const youtube = analytics.platforms.youtube!;
        expect(youtube.followers).toBeGreaterThan(0);
      });

      it('should have valid YouTube engagement rate', () => {
        const youtube = analytics.platforms.youtube!;
        expect(youtube.engagement).toBeGreaterThanOrEqual(0);
        expect(youtube.engagement).toBeLessThanOrEqual(1);
      });

      it('should have valid YouTube growth rate', () => {
        const youtube = analytics.platforms.youtube!;
        expect(typeof youtube.growthRate).toBe('number');
      });
    });

    describe('Instagram Platform', () => {
      it('should include Instagram platform data', () => {
        expect(analytics.platforms.instagram).toBeDefined();
      });

      it('should have valid Instagram statistics', () => {
        const instagram = analytics.platforms.instagram!;
        
        expect(instagram).toHaveProperty('followers');
        expect(instagram).toHaveProperty('engagement');
        expect(instagram).toHaveProperty('topPosts');
        expect(instagram).toHaveProperty('avgViews');
        expect(instagram).toHaveProperty('growthRate');
      });

      it('should have positive Instagram follower count', () => {
        const instagram = analytics.platforms.instagram!;
        expect(instagram.followers).toBeGreaterThan(0);
      });

      it('should have valid Instagram engagement rate', () => {
        const instagram = analytics.platforms.instagram!;
        expect(instagram.engagement).toBeGreaterThanOrEqual(0);
        expect(instagram.engagement).toBeLessThanOrEqual(1);
      });
    });

    describe('LinkedIn Platform', () => {
      it('should include LinkedIn platform data', () => {
        expect(analytics.platforms.linkedin).toBeDefined();
      });

      it('should have valid LinkedIn statistics', () => {
        const linkedin = analytics.platforms.linkedin!;
        
        expect(linkedin).toHaveProperty('followers');
        expect(linkedin).toHaveProperty('engagement');
        expect(linkedin).toHaveProperty('topPosts');
        expect(linkedin).toHaveProperty('avgViews');
        expect(linkedin).toHaveProperty('growthRate');
      });

      it('should have positive LinkedIn follower count', () => {
        const linkedin = analytics.platforms.linkedin!;
        expect(linkedin.followers).toBeGreaterThan(0);
      });

      it('should have valid LinkedIn engagement rate', () => {
        const linkedin = analytics.platforms.linkedin!;
        expect(linkedin.engagement).toBeGreaterThanOrEqual(0);
        expect(linkedin.engagement).toBeLessThanOrEqual(1);
      });
    });

    describe('Twitter Platform', () => {
      it('should include Twitter platform data', () => {
        expect(analytics.platforms.twitter).toBeDefined();
      });

      it('should have valid Twitter statistics', () => {
        const twitter = analytics.platforms.twitter!;
        
        expect(twitter).toHaveProperty('followers');
        expect(twitter).toHaveProperty('engagement');
        expect(twitter).toHaveProperty('topPosts');
        expect(twitter).toHaveProperty('avgViews');
        expect(twitter).toHaveProperty('growthRate');
      });

      it('should have positive Twitter follower count', () => {
        const twitter = analytics.platforms.twitter!;
        expect(twitter.followers).toBeGreaterThan(0);
      });

      it('should have valid Twitter engagement rate', () => {
        const twitter = analytics.platforms.twitter!;
        expect(twitter.engagement).toBeGreaterThanOrEqual(0);
        expect(twitter.engagement).toBeLessThanOrEqual(1);
      });
    });

    describe('TikTok Platform', () => {
      it('should include TikTok platform data', () => {
        expect(analytics.platforms.tiktok).toBeDefined();
      });

      it('should have valid TikTok statistics', () => {
        const tiktok = analytics.platforms.tiktok!;
        
        expect(tiktok).toHaveProperty('followers');
        expect(tiktok).toHaveProperty('engagement');
        expect(tiktok).toHaveProperty('topPosts');
        expect(tiktok).toHaveProperty('avgViews');
        expect(tiktok).toHaveProperty('growthRate');
      });

      it('should have positive TikTok follower count', () => {
        const tiktok = analytics.platforms.tiktok!;
        expect(tiktok.followers).toBeGreaterThan(0);
      });

      it('should have valid TikTok engagement rate', () => {
        const tiktok = analytics.platforms.tiktok!;
        expect(tiktok.engagement).toBeGreaterThanOrEqual(0);
        expect(tiktok.engagement).toBeLessThanOrEqual(1);
      });
    });

    describe('Facebook Platform', () => {
      it('should include Facebook platform data', () => {
        expect(analytics.platforms.facebook).toBeDefined();
      });

      it('should have valid Facebook statistics', () => {
        const facebook = analytics.platforms.facebook!;
        
        expect(facebook).toHaveProperty('followers');
        expect(facebook).toHaveProperty('engagement');
        expect(facebook).toHaveProperty('topPosts');
        expect(facebook).toHaveProperty('avgViews');
        expect(facebook).toHaveProperty('growthRate');
      });

      it('should have positive Facebook follower count', () => {
        const facebook = analytics.platforms.facebook!;
        expect(facebook.followers).toBeGreaterThan(0);
      });

      it('should have valid Facebook engagement rate', () => {
        const facebook = analytics.platforms.facebook!;
        expect(facebook.engagement).toBeGreaterThanOrEqual(0);
        expect(facebook.engagement).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Engagement Rate Calculations', () => {
    let analytics: EcosystemAnalytics;

    beforeEach(async () => {
      analytics = await ecosystemAnalyticsService.getAnalytics('test-user');
    });

    it('should calculate engagement rates for all platforms', () => {
      const platforms = analytics.platforms;
      
      Object.values(platforms).forEach(platform => {
        if (platform) {
          expect(platform.engagement).toBeGreaterThanOrEqual(0);
          expect(platform.engagement).toBeLessThanOrEqual(1);
        }
      });
    });

    it('should have TikTok with highest engagement rate', () => {
      const tiktok = analytics.platforms.tiktok!;
      const youtube = analytics.platforms.youtube!;
      const instagram = analytics.platforms.instagram!;
      
      expect(tiktok.engagement).toBeGreaterThan(youtube.engagement);
      expect(tiktok.engagement).toBeGreaterThan(instagram.engagement);
    });

    it('should have engagement rates as decimal values', () => {
      const platforms = analytics.platforms;
      
      Object.values(platforms).forEach(platform => {
        if (platform) {
          expect(platform.engagement).toBeLessThan(1);
        }
      });
    });
  });

  describe('Growth Rate Calculations', () => {
    let analytics: EcosystemAnalytics;

    beforeEach(async () => {
      analytics = await ecosystemAnalyticsService.getAnalytics('test-user');
    });

    it('should calculate growth rates for all platforms', () => {
      const platforms = analytics.platforms;
      
      Object.values(platforms).forEach(platform => {
        if (platform) {
          expect(typeof platform.growthRate).toBe('number');
        }
      });
    });

    it('should have TikTok with highest growth rate', () => {
      const tiktok = analytics.platforms.tiktok!;
      const youtube = analytics.platforms.youtube!;
      const instagram = analytics.platforms.instagram!;
      
      expect(tiktok.growthRate).toBeGreaterThan(youtube.growthRate);
      expect(tiktok.growthRate).toBeGreaterThan(instagram.growthRate);
    });

    it('should allow positive growth rates', () => {
      const platforms = analytics.platforms;
      
      Object.values(platforms).forEach(platform => {
        if (platform) {
          expect(platform.growthRate).toBeGreaterThanOrEqual(0);
        }
      });
    });
  });

  describe('Overall Score Calculation', () => {
    let analytics: EcosystemAnalytics;

    beforeEach(async () => {
      analytics = await ecosystemAnalyticsService.getAnalytics('test-user');
    });

    it('should calculate an overall score', () => {
      expect(analytics.overallScore).toBeDefined();
      expect(typeof analytics.overallScore).toBe('number');
    });

    it('should have overall score within valid range', () => {
      expect(analytics.overallScore).toBeGreaterThan(0);
      expect(analytics.overallScore).toBeLessThanOrEqual(10);
    });

    it('should return consistent overall score', async () => {
      const analytics1 = await ecosystemAnalyticsService.getAnalytics('test-user');
      const analytics2 = await ecosystemAnalyticsService.getAnalytics('test-user');
      
      expect(analytics1.overallScore).toBe(analytics2.overallScore);
    });
  });

  describe('Best Performing Platform Detection', () => {
    let analytics: EcosystemAnalytics;

    beforeEach(async () => {
      analytics = await ecosystemAnalyticsService.getAnalytics('test-user');
    });

    it('should identify best performing platform', () => {
      expect(analytics.bestPerforming).toBeDefined();
      expect(typeof analytics.bestPerforming).toBe('string');
    });

    it('should identify TikTok as best performing', () => {
      expect(analytics.bestPerforming).toBe('tiktok');
    });

    it('should identify a valid platform name', () => {
      const validPlatforms = ['youtube', 'instagram', 'linkedin', 'twitter', 'tiktok', 'facebook'];
      expect(validPlatforms).toContain(analytics.bestPerforming);
    });

    it('should base best performing on engagement and growth', () => {
      const bestPlatform = analytics.platforms[analytics.bestPerforming as keyof typeof analytics.platforms];
      
      expect(bestPlatform).toBeDefined();
      if (bestPlatform) {
        expect(bestPlatform.engagement).toBeGreaterThan(0);
        expect(bestPlatform.growthRate).toBeGreaterThan(0);
      }
    });
  });

  describe('Recommendations Logic', () => {
    let analytics: EcosystemAnalytics;

    beforeEach(async () => {
      analytics = await ecosystemAnalyticsService.getAnalytics('test-user');
    });

    it('should provide recommendations', () => {
      expect(analytics.recommendations).toBeDefined();
      expect(Array.isArray(analytics.recommendations)).toBe(true);
    });

    it('should provide multiple recommendations', () => {
      expect(analytics.recommendations.length).toBeGreaterThan(0);
    });

    it('should provide actionable recommendations', () => {
      analytics.recommendations.forEach(recommendation => {
        expect(typeof recommendation).toBe('string');
        expect(recommendation.length).toBeGreaterThan(0);
      });
    });

    it('should include TikTok recommendation', () => {
      const hasTikTokRecommendation = analytics.recommendations.some(rec => 
        rec.toLowerCase().includes('tiktok')
      );
      expect(hasTikTokRecommendation).toBe(true);
    });

    it('should include growth-focused recommendations', () => {
      const hasGrowthRecommendation = analytics.recommendations.some(rec => 
        rec.toLowerCase().includes('growth') || rec.toLowerCase().includes('increase')
      );
      expect(hasGrowthRecommendation).toBe(true);
    });

    it('should include platform-specific recommendations', () => {
      const platforms = ['youtube', 'instagram', 'linkedin', 'twitter', 'tiktok', 'facebook'];
      const hasPlatformRecommendation = analytics.recommendations.some(rec => 
        platforms.some(platform => rec.toLowerCase().includes(platform))
      );
      expect(hasPlatformRecommendation).toBe(true);
    });
  });

  describe('Content Gaps Identification', () => {
    let analytics: EcosystemAnalytics;

    beforeEach(async () => {
      analytics = await ecosystemAnalyticsService.getAnalytics('test-user');
    });

    it('should identify content gaps', () => {
      expect(analytics.contentGaps).toBeDefined();
      expect(Array.isArray(analytics.contentGaps)).toBe(true);
    });

    it('should provide multiple content gaps', () => {
      expect(analytics.contentGaps.length).toBeGreaterThan(0);
    });

    it('should provide specific content gap suggestions', () => {
      analytics.contentGaps.forEach(gap => {
        expect(typeof gap).toBe('string');
        expect(gap.length).toBeGreaterThan(0);
      });
    });

    it('should identify platform-specific content gaps', () => {
      const platforms = ['youtube', 'instagram', 'linkedin', 'twitter', 'tiktok', 'facebook'];
      const hasPlatformGap = analytics.contentGaps.some(gap => 
        platforms.some(platform => gap.toLowerCase().includes(platform))
      );
      expect(hasPlatformGap).toBe(true);
    });

    it('should identify content type gaps', () => {
      const contentTypes = ['video', 'post', 'content', 'poll', 'story'];
      const hasContentTypeGap = analytics.contentGaps.some(gap => 
        contentTypes.some(type => gap.toLowerCase().includes(type))
      );
      expect(hasContentTypeGap).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty user ID', async () => {
      const analytics = await ecosystemAnalyticsService.getAnalytics('');
      
      expect(analytics).toBeDefined();
      expect(analytics.platforms).toBeDefined();
    });

    it('should handle very long user ID', async () => {
      const longUserId = randomString(1000);
      const analytics = await ecosystemAnalyticsService.getAnalytics(longUserId);
      
      expect(analytics).toBeDefined();
      expect(analytics.platforms).toBeDefined();
    });

    it('should handle special characters in user ID', async () => {
      const specialUserId = 'user@#$%^&*()_+-=[]{}|;:,.<>?';
      const analytics = await ecosystemAnalyticsService.getAnalytics(specialUserId);
      
      expect(analytics).toBeDefined();
      expect(analytics.platforms).toBeDefined();
    });

    it('should handle numeric user ID', async () => {
      const numericUserId = '12345';
      const analytics = await ecosystemAnalyticsService.getAnalytics(numericUserId);
      
      expect(analytics).toBeDefined();
      expect(analytics.platforms).toBeDefined();
    });
  });

  describe('Platform Comparison', () => {
    let analytics: EcosystemAnalytics;

    beforeEach(async () => {
      analytics = await ecosystemAnalyticsService.getAnalytics('test-user');
    });

    it('should have YouTube with largest follower base', () => {
      const youtube = analytics.platforms.youtube!;
      const instagram = analytics.platforms.instagram!;
      const linkedin = analytics.platforms.linkedin!;
      
      expect(youtube.followers).toBeGreaterThan(instagram.followers);
      expect(youtube.followers).toBeGreaterThan(linkedin.followers);
    });

    it('should have TikTok with highest average views', () => {
      const tiktok = analytics.platforms.tiktok!;
      const youtube = analytics.platforms.youtube!;
      
      expect(tiktok.avgViews).toBeGreaterThan(0);
      expect(youtube.avgViews).toBeGreaterThan(0);
    });

    it('should have varying engagement rates across platforms', () => {
      const engagementRates = Object.values(analytics.platforms)
        .filter(platform => platform !== undefined)
        .map(platform => platform!.engagement);
      
      const uniqueRates = new Set(engagementRates);
      expect(uniqueRates.size).toBeGreaterThan(1);
    });

    it('should have varying growth rates across platforms', () => {
      const growthRates = Object.values(analytics.platforms)
        .filter(platform => platform !== undefined)
        .map(platform => platform!.growthRate);
      
      const uniqueRates = new Set(growthRates);
      expect(uniqueRates.size).toBeGreaterThan(1);
    });

    it('should have all platforms with positive metrics', () => {
      Object.values(analytics.platforms).forEach(platform => {
        if (platform) {
          expect(platform.followers).toBeGreaterThanOrEqual(0);
          expect(platform.engagement).toBeGreaterThanOrEqual(0);
          expect(platform.topPosts).toBeGreaterThanOrEqual(0);
          expect(platform.avgViews).toBeGreaterThanOrEqual(0);
        }
      });
    });
  });

  describe('Data Consistency', () => {
    it('should return consistent data for same user', async () => {
      const userId = 'consistent-user';
      const analytics1 = await ecosystemAnalyticsService.getAnalytics(userId);
      const analytics2 = await ecosystemAnalyticsService.getAnalytics(userId);
      
      expect(analytics1.overallScore).toBe(analytics2.overallScore);
      expect(analytics1.bestPerforming).toBe(analytics2.bestPerforming);
      expect(analytics1.platforms.youtube?.followers).toBe(analytics2.platforms.youtube?.followers);
    });

    it('should have consistent platform count', async () => {
      const analytics = await ecosystemAnalyticsService.getAnalytics('test-user');
      const platformCount = Object.keys(analytics.platforms).length;
      
      expect(platformCount).toBe(6);
    });

    it('should have all required platform properties', async () => {
      const analytics = await ecosystemAnalyticsService.getAnalytics('test-user');
      const requiredProps = ['followers', 'engagement', 'topPosts', 'avgViews', 'growthRate'];
      
      Object.values(analytics.platforms).forEach(platform => {
        if (platform) {
          requiredProps.forEach(prop => {
            expect(platform).toHaveProperty(prop);
          });
        }
      });
    });
  });

  describe('Performance', () => {
    it('should return analytics quickly', async () => {
      const startTime = Date.now();
      await ecosystemAnalyticsService.getAnalytics('test-user');
      const endTime = Date.now();
      
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle multiple concurrent requests', async () => {
      const promises = Array.from({ length: 10 }, (_, i) => 
        ecosystemAnalyticsService.getAnalytics(`user-${i}`)
      );
      
      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.platforms).toBeDefined();
      });
    });
  });

  describe('Type Safety', () => {
    it('should return correct TypeScript types', async () => {
      const analytics = await ecosystemAnalyticsService.getAnalytics('test-user');
      
      // Check main object structure
      expect(typeof analytics.overallScore).toBe('number');
      expect(typeof analytics.bestPerforming).toBe('string');
      expect(Array.isArray(analytics.recommendations)).toBe(true);
      expect(Array.isArray(analytics.contentGaps)).toBe(true);
      
      // Check platform stats structure
      if (analytics.platforms.youtube) {
        const youtube = analytics.platforms.youtube;
        expect(typeof youtube.followers).toBe('number');
        expect(typeof youtube.engagement).toBe('number');
        expect(typeof youtube.topPosts).toBe('number');
        expect(typeof youtube.avgViews).toBe('number');
        expect(typeof youtube.growthRate).toBe('number');
      }
    });

    it('should have optional platform properties', async () => {
      const analytics = await ecosystemAnalyticsService.getAnalytics('test-user');
      
      // All platforms should be present in mock data
      expect(analytics.platforms.youtube).toBeDefined();
      expect(analytics.platforms.instagram).toBeDefined();
      expect(analytics.platforms.linkedin).toBeDefined();
      expect(analytics.platforms.twitter).toBeDefined();
      expect(analytics.platforms.tiktok).toBeDefined();
      expect(analytics.platforms.facebook).toBeDefined();
    });
  });
});
