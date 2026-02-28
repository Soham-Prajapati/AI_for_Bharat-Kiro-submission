/**
 * Unified Analytics Service
 * Consolidates: Ecosystem Analytics + Analytics Dashboard + ROI Calculator
 * 
 * This is the single source of truth for all analytics operations.
 */

import { EcosystemAnalyticsService, EcosystemAnalytics, AnalyticsResponse, PlatformHandles } from './ecosystem-analytics.service';
import { AnalyticsDashboardService, Metric, Insight, Forecast, PerformanceReport } from './analytics-dashboard.service';
import { ROICalculatorService } from './roi-calculator.service';

// Re-export types for external use
export { EcosystemAnalytics, AnalyticsResponse, PlatformHandles, Metric, Insight, Forecast, PerformanceReport };

export interface UnifiedAnalyticsResult {
  ecosystem: EcosystemAnalytics;
  metrics: {
    overview: any;
    platforms: any;
    trends: any[];
    insights: any[];
  };
  roi: {
    timeSaved: string;
    moneySaved: string;
    roi: string;
    breakdown: any;
    projections: any;
  };
  fetchedAt: Date;
}

export class UnifiedAnalyticsService {
  private ecosystemService: EcosystemAnalyticsService;
  private dashboardService: AnalyticsDashboardService;
  private roiService: ROICalculatorService;

  constructor() {
    this.ecosystemService = new EcosystemAnalyticsService();
    this.dashboardService = new AnalyticsDashboardService();
    this.roiService = new ROICalculatorService();
  }

  // ============================================================================
  // UNIFIED METHODS
  // ============================================================================

  /**
   * Get comprehensive analytics combining all three services
   */
  async getFullAnalytics(userId: string, platformHandles?: PlatformHandles): Promise<UnifiedAnalyticsResult> {
    const [ecosystemResult, dashboardMetrics, roiResult] = await Promise.all([
      this.ecosystemService.getEcosystemAnalytics(userId, platformHandles),
      this.dashboardService.getAnalytics(userId, 'month'),
      this.roiService.calculateUserROI(userId, 10)
    ]);

    return {
      ecosystem: ecosystemResult.analytics,
      metrics: {
        overview: dashboardMetrics.summary,
        platforms: {},
        trends: [],
        insights: dashboardMetrics.insights || []
      },
      roi: {
        timeSaved: roiResult.totalTimeSaved,
        moneySaved: roiResult.totalMoneySaved,
        roi: roiResult.averageROI,
        breakdown: roiResult.breakdown,
        projections: {}
      },
      fetchedAt: new Date()
    };
  }

  // ============================================================================
  // ECOSYSTEM ANALYTICS METHODS (delegated)
  // ============================================================================

  /**
   * Get cross-platform ecosystem analytics
   * @deprecated Use getFullAnalytics() for comprehensive data
   */
  async getEcosystemAnalytics(userId: string, platformHandles?: PlatformHandles): Promise<AnalyticsResponse> {
    return this.ecosystemService.getEcosystemAnalytics(userId, platformHandles);
  }

  /**
   * Shorthand for ecosystem analytics
   */
  async getAnalytics(userId: string): Promise<any> {
    const result = await this.ecosystemService.getEcosystemAnalytics(userId);
    return result.analytics;
  }

  // ============================================================================
  // DASHBOARD METHODS (delegated)
  // ============================================================================

  /**
   * Get dashboard metrics with trends and insights
   */
  async getDashboardMetrics(userId: string, timeRange: string = '30d'): Promise<any> {
    const period = this.mapTimeRangeToPeriod(timeRange);
    return this.dashboardService.getAnalytics(userId, period);
  }

  /**
   * Get audience insights
   */
  async getInsights(userId: string): Promise<any> {
    return this.dashboardService.getAudienceInsights(userId);
  }

  /**
   * Get performance report
   */
  async getPerformanceReport(userId: string, period: string): Promise<PerformanceReport> {
    const mappedPeriod = this.mapTimeRangeToPeriod(period);
    return this.dashboardService.getAnalytics(userId, mappedPeriod);
  }

  // ============================================================================
  // ROI METHODS (delegated)
  // ============================================================================

  /**
   * Calculate ROI for a user
   */
  async calculateROI(userId: string): Promise<any> {
    return this.roiService.calculateUserROI(userId, 10);
  }

  /**
   * Calculate ROI for a single video
   */
  calculateVideoROI(metrics: { duration: number; platforms: number; languages: number }): any {
    return this.roiService.calculateSingleVideo(metrics);
  }

  /**
   * Calculate batch ROI
   */
  calculateBatchROI(videos: Array<{ duration: number; platforms: number; languages: number }>): any {
    return this.roiService.calculateBatch(videos);
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  private mapTimeRangeToPeriod(timeRange: string): 'day' | 'week' | 'month' | 'quarter' | 'year' {
    const mapping: Record<string, 'day' | 'week' | 'month' | 'quarter' | 'year'> = {
      '1d': 'day',
      '7d': 'week',
      '30d': 'month',
      '90d': 'quarter',
      '365d': 'year',
      'day': 'day',
      'week': 'week',
      'month': 'month',
      'quarter': 'quarter',
      'year': 'year'
    };
    return mapping[timeRange] || 'month';
  }
}

// Singleton export
export const unifiedAnalyticsService = new UnifiedAnalyticsService();
