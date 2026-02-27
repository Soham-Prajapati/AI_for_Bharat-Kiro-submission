/**
 * ROI Calculator Service
 * Calculates time and money saved by using AI vs manual content creation
 */

interface VideoMetrics {
  duration: number; // in seconds
  platforms: number; // number of platforms
  languages: number; // number of languages
}

interface ROIResult {
  timeSaved: string;
  moneySaved: string;
  roi: string;
  breakdown: {
    manualTime: number; // hours
    aiTime: number; // seconds
    manualCost: number; // dollars
    aiCost: number; // dollars
  };
  projections: {
    monthly: { timeSaved: string; moneySaved: string };
    yearly: { timeSaved: string; moneySaved: string };
  };
}

interface BatchROIResult {
  totalVideos: number;
  totalTimeSaved: string;
  totalMoneySaved: string;
  averageROI: string;
  breakdown: {
    totalManualTime: number;
    totalAITime: number;
    totalManualCost: number;
    totalAICost: number;
  };
}

export class ROICalculatorService {
  // Constants
  private readonly MANUAL_TIME_PER_VIDEO = 5; // hours (average of 4-6)
  private readonly MANUAL_HOURLY_RATE = 50; // dollars
  private readonly AI_TIME_PER_VIDEO = 60; // seconds
  private readonly AI_COST_PER_VIDEO = 0.1; // dollars
  private readonly PLATFORM_MULTIPLIER = 0.5; // additional time per extra platform (hours)
  private readonly LANGUAGE_MULTIPLIER = 1.5; // additional time per extra language (hours)

  /**
   * Calculate ROI for a single video
   */
  calculateSingleVideo(metrics: VideoMetrics): ROIResult {
    // Calculate manual time (base + platform + language adjustments)
    const manualTime =
      this.MANUAL_TIME_PER_VIDEO +
      (metrics.platforms - 1) * this.PLATFORM_MULTIPLIER +
      (metrics.languages - 1) * this.LANGUAGE_MULTIPLIER;

    // Calculate AI time (fixed)
    const aiTime = this.AI_TIME_PER_VIDEO;

    // Calculate costs
    const manualCost = manualTime * this.MANUAL_HOURLY_RATE;
    const aiCost = this.AI_COST_PER_VIDEO;

    // Calculate savings
    const timeSavedHours = manualTime - aiTime / 3600;
    const moneySaved = manualCost - aiCost;
    const roiPercentage = ((moneySaved / aiCost) * 100).toFixed(0);

    // Calculate projections (assuming 4 videos/month)
    const monthlyVideos = 4;
    const yearlyVideos = monthlyVideos * 12;

    return {
      timeSaved: this.formatTime(timeSavedHours),
      moneySaved: `$${moneySaved.toFixed(2)}`,
      roi: `${roiPercentage}%`,
      breakdown: {
        manualTime: parseFloat(manualTime.toFixed(2)),
        aiTime,
        manualCost: parseFloat(manualCost.toFixed(2)),
        aiCost,
      },
      projections: {
        monthly: {
          timeSaved: this.formatTime(timeSavedHours * monthlyVideos),
          moneySaved: `$${(moneySaved * monthlyVideos).toFixed(2)}`,
        },
        yearly: {
          timeSaved: this.formatTime(timeSavedHours * yearlyVideos),
          moneySaved: `$${(moneySaved * yearlyVideos).toFixed(2)}`,
        },
      },
    };
  }

  /**
   * Calculate ROI for multiple videos (batch)
   */
  calculateBatch(videos: VideoMetrics[]): BatchROIResult {
    let totalManualTime = 0;
    let totalAITime = 0;
    let totalManualCost = 0;
    let totalAICost = 0;

    videos.forEach((video) => {
      const result = this.calculateSingleVideo(video);
      totalManualTime += result.breakdown.manualTime;
      totalAITime += result.breakdown.aiTime;
      totalManualCost += result.breakdown.manualCost;
      totalAICost += result.breakdown.aiCost;
    });

    const totalTimeSaved = totalManualTime - totalAITime / 3600;
    const totalMoneySaved = totalManualCost - totalAICost;
    const averageROI = ((totalMoneySaved / totalAICost) * 100).toFixed(0);

    return {
      totalVideos: videos.length,
      totalTimeSaved: this.formatTime(totalTimeSaved),
      totalMoneySaved: `$${totalMoneySaved.toFixed(2)}`,
      averageROI: `${averageROI}%`,
      breakdown: {
        totalManualTime: parseFloat(totalManualTime.toFixed(2)),
        totalAITime: parseFloat((totalAITime / 3600).toFixed(2)),
        totalManualCost: parseFloat(totalManualCost.toFixed(2)),
        totalAICost: parseFloat(totalAICost.toFixed(2)),
      },
    };
  }

  /**
   * Calculate ROI for a user based on their usage history
   */
  calculateUserROI(userId: string, videosProcessed: number): BatchROIResult {
    // Assume average metrics for user's videos
    const averageMetrics: VideoMetrics = {
      duration: 600, // 10 minutes
      platforms: 3, // YouTube, Instagram, LinkedIn
      languages: 1, // English
    };

    const videos = Array(videosProcessed).fill(averageMetrics);
    return this.calculateBatch(videos);
  }

  /**
   * Compare ROI across different scenarios
   */
  compareScenarios(): {
    basic: ROIResult;
    multiPlatform: ROIResult;
    multiLanguage: ROIResult;
    enterprise: ROIResult;
  } {
    return {
      basic: this.calculateSingleVideo({
        duration: 600,
        platforms: 1,
        languages: 1,
      }),
      multiPlatform: this.calculateSingleVideo({
        duration: 600,
        platforms: 6,
        languages: 1,
      }),
      multiLanguage: this.calculateSingleVideo({
        duration: 600,
        platforms: 1,
        languages: 9,
      }),
      enterprise: this.calculateSingleVideo({
        duration: 600,
        platforms: 6,
        languages: 9,
      }),
    };
  }

  /**
   * Format time in human-readable format
   */
  private formatTime(hours: number): string {
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes} minutes`;
    } else if (hours < 24) {
      const wholeHours = Math.floor(hours);
      const minutes = Math.round((hours - wholeHours) * 60);
      return minutes > 0
        ? `${wholeHours} hours ${minutes} minutes`
        : `${wholeHours} hours`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = Math.round(hours % 24);
      return remainingHours > 0
        ? `${days} days ${remainingHours} hours`
        : `${days} days`;
    }
  }

  /**
   * Get cost breakdown explanation
   */
  getCostBreakdown(): {
    manual: { description: string; components: string[] };
    ai: { description: string; components: string[] };
  } {
    return {
      manual: {
        description: 'Manual content creation costs',
        components: [
          'Script writing: 1-2 hours',
          'Platform adaptation: 0.5-1 hour per platform',
          'Translation: 1-2 hours per language',
          'SEO optimization: 0.5-1 hour',
          'Quality review: 0.5-1 hour',
          `Hourly rate: $${this.MANUAL_HOURLY_RATE}`,
        ],
      },
      ai: {
        description: 'AI-powered content creation costs',
        components: [
          `Processing time: ${this.AI_TIME_PER_VIDEO} seconds`,
          `Cost per video: $${this.AI_COST_PER_VIDEO}`,
          'Includes: All platforms, all languages, SEO, quality check',
        ],
      },
    };
  }
}

export const roiCalculatorService = new ROICalculatorService();
