/**
 * Trend Predictor Service
 * Analyzes social media data to identify current trends and predict upcoming ones
 * Tracks trend lifecycle, growth velocity, and provides content recommendations
 */

import { GitHubModelsService } from './github-models.service';

interface Trend {
  trendId: string;
  topic: string;
  keywords: string[];
  category: string;
  platforms: PlatformTrendData[];
  overallScore: number;
  growthRate: number;
  engagementVelocity: number;
  peakDate?: Date;
  lifecycle: 'emerging' | 'rising' | 'peak' | 'declining' | 'fading';
  confidence: number;
  firstDetected: Date;
  lastUpdated: Date;
}

interface PlatformTrendData {
  platform: 'twitter' | 'youtube' | 'instagram' | 'tiktok' | 'linkedin' | 'reddit';
  mentions: number;
  engagement: number;
  growthRate: number;
  topPosts: TrendingPost[];
}

interface TrendingPost {
  postId: string;
  author: string;
  content: string;
  engagement: number;
  timestamp: Date;
  url: string;
}

interface TrendPrediction {
  trend: Trend;
  predictedPeak: Date;
  predictedLifespan: number; // days
  recommendedAction: 'create_now' | 'wait' | 'too_late' | 'monitor';
  reasoning: string;
  contentSuggestions: string[];
  confidence: number;
}

interface TrendAnalysisResult {
  currentTrends: Trend[];
  emergingTrends: Trend[];
  predictions: TrendPrediction[];
  recommendations: string[];
  analysisTimestamp: Date;
}

interface TrendSearchQuery {
  category?: string;
  platform?: string;
  minScore?: number;
  lifecycle?: string;
  limit?: number;
}

export class TrendPredictorService {
  private githubModels: GitHubModelsService;
  private trendCache: Map<string, Trend>;
  private historicalData: Map<string, Trend[]>; // topic -> historical trends

  constructor() {
    this.githubModels = new GitHubModelsService();
    this.trendCache = new Map();
    this.historicalData = new Map();
  }

  /**
   * Get current trending topics across all platforms
   */
  async getCurrentTrends(query?: TrendSearchQuery): Promise<Trend[]> {
    // Fetch trends from all platforms
    const platformTrends = await Promise.all([
      this.fetchTwitterTrends(),
      this.fetchYouTubeTrends(),
      this.fetchInstagramTrends(),
      this.fetchTikTokTrends(),
      this.fetchLinkedInTrends(),
      this.fetchRedditTrends(),
    ]);

    // Aggregate and deduplicate trends
    const aggregatedTrends = this.aggregateTrends(platformTrends.flat());

    // Apply filters
    let filteredTrends = aggregatedTrends;
    if (query) {
      filteredTrends = this.filterTrends(aggregatedTrends, query);
    }

    // Sort by overall score
    filteredTrends.sort((a, b) => b.overallScore - a.overallScore);

    // Update cache
    filteredTrends.forEach((trend) => this.trendCache.set(trend.trendId, trend));

    return filteredTrends.slice(0, query?.limit || 50);
  }

  /**
   * Predict upcoming trends based on early signals
   */
  async predictUpcomingTrends(): Promise<TrendPrediction[]> {
    const currentTrends = await this.getCurrentTrends({ lifecycle: 'emerging' });
    const predictions: TrendPrediction[] = [];

    for (const trend of currentTrends) {
      const prediction = await this.analyzeTrendPotential(trend);
      predictions.push(prediction);
    }

    // Sort by confidence
    predictions.sort((a, b) => b.confidence - a.confidence);

    return predictions.slice(0, 20);
  }

  /**
   * Analyze specific trend potential
   */
  async analyzeTrendPotential(trend: Trend): Promise<TrendPrediction> {
    // Calculate growth velocity
    const velocity = this.calculateEngagementVelocity(trend);

    // Predict peak date based on growth rate
    const predictedPeak = this.predictPeakDate(trend);

    // Predict lifespan based on historical data
    const predictedLifespan = this.predictLifespan(trend);

    // Get AI-powered insights
    const aiAnalysis = await this.getAITrendAnalysis(trend);

    // Determine recommended action
    const recommendedAction = this.determineRecommendedAction(trend, predictedPeak, predictedLifespan);

    return {
      trend,
      predictedPeak,
      predictedLifespan,
      recommendedAction,
      reasoning: aiAnalysis.reasoning,
      contentSuggestions: aiAnalysis.suggestions,
      confidence: aiAnalysis.confidence,
    };
  }

  /**
   * Get comprehensive trend analysis
   */
  async analyzeTrends(): Promise<TrendAnalysisResult> {
    const allTrends = await this.getCurrentTrends();

    const currentTrends = allTrends.filter((t) => t.lifecycle === 'peak' || t.lifecycle === 'rising');
    const emergingTrends = allTrends.filter((t) => t.lifecycle === 'emerging');

    const predictions = await this.predictUpcomingTrends();

    const recommendations = this.generateRecommendations(currentTrends, emergingTrends, predictions);

    return {
      currentTrends: currentTrends.slice(0, 10),
      emergingTrends: emergingTrends.slice(0, 10),
      predictions: predictions.slice(0, 10),
      recommendations,
      analysisTimestamp: new Date(),
    };
  }

  /**
   * Search trends by keyword
   */
  async searchTrends(keyword: string): Promise<Trend[]> {
    const allTrends = await this.getCurrentTrends();
    return allTrends.filter(
      (t) =>
        t.topic.toLowerCase().includes(keyword.toLowerCase()) ||
        t.keywords.some((k) => k.toLowerCase().includes(keyword.toLowerCase()))
    );
  }

  /**
   * Get trend history for a topic
   */
  getTrendHistory(topic: string): Trend[] {
    return this.historicalData.get(topic.toLowerCase()) || [];
  }

  /**
   * Fetch Twitter trends (mock data - ready for real API)
   */
  private async fetchTwitterTrends(): Promise<Trend[]> {
    // In production: Use Twitter API v2
    // For now: Return mock data
    return this.generateMockTrends('twitter', 10);
  }

  /**
   * Fetch YouTube trends (mock data - ready for real API)
   */
  private async fetchYouTubeTrends(): Promise<Trend[]> {
    // In production: Use YouTube Data API v3
    return this.generateMockTrends('youtube', 10);
  }

  /**
   * Fetch Instagram trends (mock data - ready for real API)
   */
  private async fetchInstagramTrends(): Promise<Trend[]> {
    // In production: Use Instagram Graph API
    return this.generateMockTrends('instagram', 10);
  }

  /**
   * Fetch TikTok trends (mock data - ready for real API)
   */
  private async fetchTikTokTrends(): Promise<Trend[]> {
    // In production: Use TikTok API
    return this.generateMockTrends('tiktok', 10);
  }

  /**
   * Fetch LinkedIn trends (mock data - ready for real API)
   */
  private async fetchLinkedInTrends(): Promise<Trend[]> {
    // In production: Use LinkedIn API
    return this.generateMockTrends('linkedin', 10);
  }

  /**
   * Fetch Reddit trends (mock data - ready for real API)
   */
  private async fetchRedditTrends(): Promise<Trend[]> {
    // In production: Use Reddit API
    return this.generateMockTrends('reddit', 10);
  }

  /**
   * Generate mock trends for testing
   */
  private generateMockTrends(platform: string, count: number): Trend[] {
    const topics = [
      'AI Content Creation',
      'Short-form Video',
      'Sustainability',
      'Remote Work',
      'Web3',
      'Mental Health',
      'Fitness Tech',
      'Plant-based Diet',
      'Electric Vehicles',
      'Space Exploration',
      'Metaverse',
      'NFT Art',
      'Crypto Trading',
      'Mindfulness',
      'Home Automation',
    ];

    const categories = ['Technology', 'Lifestyle', 'Business', 'Entertainment', 'Health', 'Education'];
    const lifecycles: Array<'emerging' | 'rising' | 'peak' | 'declining' | 'fading'> = [
      'emerging',
      'rising',
      'peak',
      'declining',
      'fading',
    ];

    return Array.from({ length: count }, (_, i) => {
      const topic = topics[Math.floor(Math.random() * topics.length)];
      const lifecycle = lifecycles[Math.floor(Math.random() * lifecycles.length)];
      const growthRate = Math.random() * 100 - 20; // -20 to 80

      return {
        trendId: `${platform}-${Date.now()}-${i}`,
        topic,
        keywords: [topic.toLowerCase(), ...topic.toLowerCase().split(' ')],
        category: categories[Math.floor(Math.random() * categories.length)],
        platforms: [
          {
            platform: platform as any,
            mentions: Math.floor(Math.random() * 100000),
            engagement: Math.floor(Math.random() * 1000000),
            growthRate,
            topPosts: [],
          },
        ],
        overallScore: Math.random() * 100,
        growthRate,
        engagementVelocity: Math.random() * 50,
        lifecycle,
        confidence: 0.7 + Math.random() * 0.25,
        firstDetected: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        lastUpdated: new Date(),
      };
    });
  }

  /**
   * Aggregate trends from multiple platforms
   */
  private aggregateTrends(trends: Trend[]): Trend[] {
    const trendMap = new Map<string, Trend>();

    trends.forEach((trend) => {
      const key = trend.topic.toLowerCase();
      const existing = trendMap.get(key);

      if (existing) {
        // Merge platform data
        existing.platforms.push(...trend.platforms);
        existing.overallScore = (existing.overallScore + trend.overallScore) / 2;
        existing.growthRate = (existing.growthRate + trend.growthRate) / 2;
        existing.engagementVelocity = (existing.engagementVelocity + trend.engagementVelocity) / 2;
        existing.confidence = Math.max(existing.confidence, trend.confidence);
        existing.lastUpdated = new Date();
      } else {
        trendMap.set(key, trend);
      }
    });

    return Array.from(trendMap.values());
  }

  /**
   * Filter trends based on query
   */
  private filterTrends(trends: Trend[], query: TrendSearchQuery): Trend[] {
    return trends.filter((trend) => {
      if (query.category && trend.category !== query.category) return false;
      if (query.platform && !trend.platforms.some((p) => p.platform === query.platform)) return false;
      if (query.minScore && trend.overallScore < query.minScore) return false;
      if (query.lifecycle && trend.lifecycle !== query.lifecycle) return false;
      return true;
    });
  }

  /**
   * Calculate engagement velocity (rate of change)
   */
  private calculateEngagementVelocity(trend: Trend): number {
    // Calculate based on growth rate and time since detection
    const daysSinceDetection = (Date.now() - trend.firstDetected.getTime()) / (1000 * 60 * 60 * 24);
    return trend.growthRate / Math.max(daysSinceDetection, 1);
  }

  /**
   * Predict peak date based on growth rate
   */
  private predictPeakDate(trend: Trend): Date {
    // Simple model: trends peak after 7-21 days depending on growth rate
    const daysUntilPeak = trend.growthRate > 50 ? 7 : trend.growthRate > 20 ? 14 : 21;
    return new Date(Date.now() + daysUntilPeak * 24 * 60 * 60 * 1000);
  }

  /**
   * Predict trend lifespan
   */
  private predictLifespan(trend: Trend): number {
    // Simple model: faster growth = shorter lifespan
    if (trend.growthRate > 60) return 14; // 2 weeks
    if (trend.growthRate > 30) return 30; // 1 month
    if (trend.growthRate > 10) return 60; // 2 months
    return 90; // 3 months
  }

  /**
   * Get AI-powered trend analysis
   */
  private async getAITrendAnalysis(
    trend: Trend
  ): Promise<{ reasoning: string; suggestions: string[]; confidence: number }> {
    const prompt = `Analyze this trending topic and provide insights:

**Trend:** ${trend.topic}
**Category:** ${trend.category}
**Growth Rate:** ${trend.growthRate.toFixed(1)}%
**Lifecycle:** ${trend.lifecycle}
**Platforms:** ${trend.platforms.map((p) => p.platform).join(', ')}

Provide:
1. Why this trend is gaining traction
2. 3 specific content ideas to capitalize on this trend
3. Confidence score (0-1) for trend longevity

Format as JSON:
{
  "reasoning": "brief explanation",
  "suggestions": ["idea 1", "idea 2", "idea 3"],
  "confidence": 0.85
}`;

    try {
      const response = await this.githubModels.generate(prompt, {
        temperature: 0.7,
        maxTokens: 500,
      });

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          reasoning: parsed.reasoning || 'Trend shows strong growth signals',
          suggestions: parsed.suggestions || ['Create content about this topic'],
          confidence: parsed.confidence || 0.7,
        };
      }
    } catch (error) {
      console.error('Error in AI trend analysis:', error);
    }

    // Fallback
    return {
      reasoning: `${trend.topic} is ${trend.lifecycle} with ${trend.growthRate.toFixed(1)}% growth rate`,
      suggestions: [
        `Create ${trend.category.toLowerCase()} content about ${trend.topic}`,
        `Share your perspective on ${trend.topic}`,
        `Tutorial or guide related to ${trend.topic}`,
      ],
      confidence: trend.confidence,
    };
  }

  /**
   * Determine recommended action
   */
  private determineRecommendedAction(
    trend: Trend,
    predictedPeak: Date,
    predictedLifespan: number
  ): 'create_now' | 'wait' | 'too_late' | 'monitor' {
    const daysUntilPeak = (predictedPeak.getTime() - Date.now()) / (1000 * 60 * 60 * 24);

    if (trend.lifecycle === 'declining' || trend.lifecycle === 'fading') {
      return 'too_late';
    }

    if (trend.lifecycle === 'emerging' && daysUntilPeak > 7) {
      return 'monitor';
    }

    if (trend.lifecycle === 'emerging' || trend.lifecycle === 'rising') {
      return 'create_now';
    }

    if (trend.lifecycle === 'peak' && daysUntilPeak > 0) {
      return 'create_now';
    }

    return 'wait';
  }

  /**
   * Generate recommendations based on trend analysis
   */
  private generateRecommendations(
    currentTrends: Trend[],
    emergingTrends: Trend[],
    predictions: TrendPrediction[]
  ): string[] {
    const recommendations: string[] = [];

    // Top current trend
    if (currentTrends.length > 0) {
      const top = currentTrends[0];
      recommendations.push(`Create content about "${top.topic}" - currently at peak with ${top.growthRate.toFixed(1)}% growth`);
    }

    // Best emerging trend
    const bestEmerging = emergingTrends.sort((a, b) => b.growthRate - a.growthRate)[0];
    if (bestEmerging) {
      recommendations.push(`Get ahead of the curve: "${bestEmerging.topic}" is emerging with ${bestEmerging.growthRate.toFixed(1)}% growth`);
    }

    // Best prediction
    const bestPrediction = predictions.filter((p) => p.recommendedAction === 'create_now')[0];
    if (bestPrediction) {
      recommendations.push(`Act now on "${bestPrediction.trend.topic}" - predicted to peak in ${Math.ceil((bestPrediction.predictedPeak.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days`);
    }

    // Category insights
    const categoryCount = new Map<string, number>();
    currentTrends.forEach((t) => categoryCount.set(t.category, (categoryCount.get(t.category) || 0) + 1));
    const topCategory = Array.from(categoryCount.entries()).sort((a, b) => b[1] - a[1])[0];
    if (topCategory) {
      recommendations.push(`${topCategory[0]} is the hottest category right now with ${topCategory[1]} trending topics`);
    }

    return recommendations.slice(0, 5);
  }

  /**
   * Compare trend performance across platforms
   */
  comparePlatformPerformance(trend: Trend): { platform: string; score: number }[] {
    return trend.platforms
      .map((p) => ({
        platform: p.platform,
        score: (p.engagement / 1000 + p.growthRate) / 2,
      }))
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Get trend recommendations for specific category
   */
  async getTrendsByCategory(category: string): Promise<Trend[]> {
    return this.getCurrentTrends({ category, limit: 20 });
  }
}

export const trendPredictorService = new TrendPredictorService();
