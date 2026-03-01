/**
 * Trend Predictor Service
 * Predicts upcoming trends and analyzes trend lifecycles
 * Owner: Nidhi (AI Intelligence Lead)
 */

export interface TrendData {
  id: string;
  topic: string;
  platform: string;
  mentions: number;
  engagementRate: number;
  growthRate: number;
  velocity: number;
  timestamp: Date;
}

export interface TrendPrediction {
  topic: string;
  currentScore: number;
  predictedLifespan: number; // in days
  growthRate: number; // percentage
  engagementVelocity: number; // engagement per hour
  confidence: number; // 0-1
  peakDate: Date;
  category: 'emerging' | 'trending' | 'peaking' | 'declining';
  platforms: {
    platform: string;
    score: number;
  }[];
}

export interface HistoricalTrendData {
  topic: string;
  startDate: Date;
  peakDate: Date;
  endDate: Date;
  actualLifespan: number;
  maxEngagement: number;
}

class TrendPredictorService {
  /**
   * Predict trend lifecycle and metrics
   */
  async predict(trendData: TrendData[]): Promise<TrendPrediction[]> {
    const trendMap = new Map<string, TrendData[]>();
    
    // Group by topic
    trendData.forEach(data => {
      if (!trendMap.has(data.topic)) {
        trendMap.set(data.topic, []);
      }
      trendMap.get(data.topic)!.push(data);
    });
    
    const predictions: TrendPrediction[] = [];
    
    for (const [topic, dataPoints] of trendMap.entries()) {
      const prediction = this.predictTrendLifecycle(topic, dataPoints);
      predictions.push(prediction);
    }
    
    return predictions.sort((a, b) => b.currentScore - a.currentScore);
  }
  
  /**
   * Calculate trend lifespan based on growth patterns
   */
  predictTrendLifespan(dataPoints: TrendData[]): number {
    if (dataPoints.length < 2) return 7; // Default 7 days
    
    const sortedData = [...dataPoints].sort((a, b) => 
      a.timestamp.getTime() - b.timestamp.getTime()
    );
    
    const growthRates = this.calculateGrowthRates(sortedData);
    const avgGrowth = growthRates.reduce((a, b) => a + b, 0) / growthRates.length;
    
    // High growth = shorter lifespan (burns out fast)
    // Moderate growth = longer lifespan (sustainable)
    if (avgGrowth > 100) return 3; // 3 days - viral spike
    if (avgGrowth > 50) return 7; // 1 week - trending
    if (avgGrowth > 20) return 14; // 2 weeks - steady growth
    return 30; // 1 month - slow burn
  }
  
  /**
   * Calculate growth rate between data points
   */
  calculateGrowthRate(current: TrendData, previous: TrendData): number {
    if (previous.mentions === 0) return 100;
    return ((current.mentions - previous.mentions) / previous.mentions) * 100;
  }
  
  /**
   * Calculate engagement velocity (engagement per hour)
   */
  calculateEngagementVelocity(dataPoints: TrendData[]): number {
    if (dataPoints.length < 2) return 0;
    
    const sortedData = [...dataPoints].sort((a, b) => 
      a.timestamp.getTime() - b.timestamp.getTime()
    );
    
    const totalEngagement = sortedData.reduce((sum, d) => 
      sum + (d.mentions * d.engagementRate), 0
    );
    
    const timeSpan = (sortedData[sortedData.length - 1].timestamp.getTime() - 
                      sortedData[0].timestamp.getTime()) / (1000 * 60 * 60); // hours
    
    return timeSpan > 0 ? totalEngagement / timeSpan : 0;
  }
  
  /**
   * Calculate confidence score based on data quality
   */
  calculateConfidence(dataPoints: TrendData[]): number {
    // More data points = higher confidence
    const dataPointScore = Math.min(dataPoints.length / 10, 0.5);
    
    // Consistent growth = higher confidence
    const growthRates = this.calculateGrowthRates(dataPoints);
    const variance = this.calculateVariance(growthRates);
    const consistencyScore = Math.max(0, 0.3 - variance / 1000);
    
    // Multiple platforms = higher confidence
    const platforms = new Set(dataPoints.map(d => d.platform));
    const platformScore = Math.min(platforms.size / 5, 0.2);
    
    return Math.min(dataPointScore + consistencyScore + platformScore, 1);
  }
  
  /**
   * Validate prediction accuracy against historical data
   */
  validatePrediction(
    predicted: TrendPrediction,
    actual: HistoricalTrendData
  ): {
    lifespanAccuracy: number;
    peakDateAccuracy: number;
    overallAccuracy: number;
  } {
    // Lifespan accuracy
    const lifespanError = Math.abs(predicted.predictedLifespan - actual.actualLifespan);
    const lifespanAccuracy = Math.max(0, 1 - lifespanError / actual.actualLifespan);
    
    // Peak date accuracy (within 2 days = 100%)
    const peakDateError = Math.abs(
      predicted.peakDate.getTime() - actual.peakDate.getTime()
    ) / (1000 * 60 * 60 * 24); // days
    const peakDateAccuracy = Math.max(0, 1 - peakDateError / 7);
    
    const overallAccuracy = (lifespanAccuracy + peakDateAccuracy) / 2;
    
    return {
      lifespanAccuracy,
      peakDateAccuracy,
      overallAccuracy
    };
  }
  
  // Private helper methods
  
  private predictTrendLifecycle(topic: string, dataPoints: TrendData[]): TrendPrediction {
    const sortedData = [...dataPoints].sort((a, b) => 
      a.timestamp.getTime() - b.timestamp.getTime()
    );
    
    const currentScore = this.calculateCurrentScore(sortedData);
    const predictedLifespan = this.predictTrendLifespan(sortedData);
    const growthRate = this.calculateAverageGrowthRate(sortedData);
    const engagementVelocity = this.calculateEngagementVelocity(sortedData);
    const confidence = this.calculateConfidence(sortedData);
    const category = this.categorize(growthRate, currentScore);
    const peakDate = this.predictPeakDate(sortedData, predictedLifespan);
    const platforms = this.aggregatePlatformScores(sortedData);
    
    return {
      topic,
      currentScore,
      predictedLifespan,
      growthRate,
      engagementVelocity,
      confidence,
      peakDate,
      category,
      platforms
    };
  }
  
  private calculateCurrentScore(dataPoints: TrendData[]): number {
    const latest = dataPoints[dataPoints.length - 1];
    const mentionScore = Math.min(latest.mentions / 1000, 50);
    const engagementScore = latest.engagementRate * 30;
    const velocityScore = Math.min(latest.velocity / 10, 20);
    
    return Math.min(mentionScore + engagementScore + velocityScore, 100);
  }
  
  private calculateGrowthRates(dataPoints: TrendData[]): number[] {
    const rates: number[] = [];
    for (let i = 1; i < dataPoints.length; i++) {
      rates.push(this.calculateGrowthRate(dataPoints[i], dataPoints[i - 1]));
    }
    return rates;
  }
  
  private calculateAverageGrowthRate(dataPoints: TrendData[]): number {
    const rates = this.calculateGrowthRates(dataPoints);
    return rates.length > 0 ? rates.reduce((a, b) => a + b, 0) / rates.length : 0;
  }
  
  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }
  
  private categorize(growthRate: number, currentScore: number): 
    'emerging' | 'trending' | 'peaking' | 'declining' {
    if (growthRate > 50 && currentScore < 70) return 'emerging';
    if (growthRate > 10 && currentScore >= 70) return 'trending';
    if (currentScore >= 80) return 'peaking';
    return 'declining';
  }
  
  private predictPeakDate(dataPoints: TrendData[], lifespan: number): Date {
    const latest = dataPoints[dataPoints.length - 1].timestamp;
    const peakOffset = lifespan * 0.4; // Peak at 40% of lifespan
    return new Date(latest.getTime() + peakOffset * 24 * 60 * 60 * 1000);
  }
  
  private aggregatePlatformScores(dataPoints: TrendData[]): { platform: string; score: number }[] {
    const platformMap = new Map<string, number[]>();
    
    dataPoints.forEach(d => {
      if (!platformMap.has(d.platform)) {
        platformMap.set(d.platform, []);
      }
      platformMap.get(d.platform)!.push(d.mentions * d.engagementRate);
    });
    
    return Array.from(platformMap.entries()).map(([platform, scores]) => ({
      platform,
      score: scores.reduce((a, b) => a + b, 0) / scores.length
    })).sort((a, b) => b.score - a.score);
  }
}

export const trendPredictorService = new TrendPredictorService();
