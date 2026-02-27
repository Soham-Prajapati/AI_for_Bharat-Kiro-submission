/**
 * ROI Calculator Service
 * Calculates time and money saved by using AI
 * Owner: Nidhi (AI Intelligence Lead)
 */

export interface ROICalculation {
  videosProcessed: number;
  timeSaved: string;
  moneySaved: string;
  roi: string;
  breakdown: {
    manualTime: string;
    aiTime: string;
    manualCost: number;
    aiCost: number;
  };
  projections: {
    monthly: { videos: number; savings: string };
    yearly: { videos: number; savings: string };
  };
}

class ROICalculatorService {
  private readonly MANUAL_HOURS_PER_VIDEO = 5; // Average 4-6 hours
  private readonly AI_SECONDS_PER_VIDEO = 60; // 60 seconds
  private readonly HOURLY_RATE = 50; // $50/hour for manual work
  private readonly AI_COST_PER_VIDEO = 0.10; // $0.10 per video

  /**
   * Calculate ROI for a user
   * TODO: Fetch real usage data from database (Nidhi - task 2.4a)
   */
  async calculate(userId: string): Promise<ROICalculation> {
    // Stub: Get user's video count (would come from database)
    const videosProcessed = await this.getUserVideoCount(userId);
    
    const manualTimeHours = videosProcessed * this.MANUAL_HOURS_PER_VIDEO;
    const aiTimeSeconds = videosProcessed * this.AI_SECONDS_PER_VIDEO;
    const aiTimeHours = aiTimeSeconds / 3600;
    
    const timeSavedHours = manualTimeHours - aiTimeHours;
    const manualCost = manualTimeHours * this.HOURLY_RATE;
    const aiCost = videosProcessed * this.AI_COST_PER_VIDEO;
    const moneySaved = manualCost - aiCost;
    const roiPercentage = ((moneySaved / aiCost) * 100).toFixed(0);
    
    return {
      videosProcessed,
      timeSaved: this.formatTime(timeSavedHours),
      moneySaved: `$${moneySaved.toFixed(2)}`,
      roi: `${roiPercentage}%`,
      breakdown: {
        manualTime: this.formatTime(manualTimeHours),
        aiTime: this.formatTime(aiTimeHours),
        manualCost,
        aiCost
      },
      projections: {
        monthly: {
          videos: Math.round(videosProcessed / 3), // Assume 3 months of usage
          savings: `$${((moneySaved / 3)).toFixed(2)}`
        },
        yearly: {
          videos: Math.round(videosProcessed * 4), // Project 4x current
          savings: `$${(moneySaved * 4).toFixed(2)}`
        }
      }
    };
  }
  
  private async getUserVideoCount(userId: string): Promise<number> {
    // Stub: Would query database for actual count
    // For demo, return mock data based on userId
    return 50; // Default 50 videos
  }
  
  private formatTime(hours: number): string {
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes} minutes`;
    }
    if (hours < 24) {
      return `${hours.toFixed(1)} hours`;
    }
    const days = Math.floor(hours / 24);
    const remainingHours = Math.round(hours % 24);
    return `${days} days ${remainingHours} hours`;
  }
}

export const roiCalculatorService = new ROICalculatorService();
