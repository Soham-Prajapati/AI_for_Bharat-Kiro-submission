/**
 * Analytics Utility Functions
 * Formatting and calculation helpers for analytics dashboard
 */

import { Metric, PlatformPerformance } from '@/types/api';

// ============================================================================
// METRIC FORMATTING
// ============================================================================

/**
 * Format large numbers with K, M, B suffixes
 * @param value - The numeric value to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string (e.g., "1.5K", "2.3M")
 */
export function formatMetricValue(value: number, decimals: number = 1): string {
  if (value === 0) return '0';
  
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  
  if (absValue >= 1_000_000_000) {
    return `${sign}${(absValue / 1_000_000_000).toFixed(decimals)}B`;
  }
  
  if (absValue >= 1_000_000) {
    return `${sign}${(absValue / 1_000_000).toFixed(decimals)}M`;
  }
  
  if (absValue >= 1_000) {
    return `${sign}${(absValue / 1_000).toFixed(decimals)}K`;
  }
  
  return `${sign}${absValue.toFixed(decimals)}`;
}

/**
 * Format percentage values
 * @param value - The percentage value (e.g., 0.15 for 15%)
 * @param decimals - Number of decimal places (default: 1)
 * @param includeSign - Whether to include + sign for positive values
 * @returns Formatted percentage string (e.g., "+15.0%", "-5.2%")
 */
export function formatPercentage(
  value: number,
  decimals: number = 1,
  includeSign: boolean = true
): string {
  const percentage = value * 100;
  const sign = includeSign && percentage > 0 ? '+' : '';
  return `${sign}${percentage.toFixed(decimals)}%`;
}

// ============================================================================
// TREND CALCULATION
// ============================================================================

/**
 * Calculate trend direction and percentage change
 * @param current - Current period value
 * @param previous - Previous period value
 * @returns Object with trend direction and change percentage
 */
export function calculateTrend(
  current: number,
  previous: number
): { trend: 'up' | 'down' | 'stable'; change: number } {
  if (previous === 0) {
    return {
      trend: current > 0 ? 'up' : 'stable',
      change: current > 0 ? 1 : 0,
    };
  }

  const change = (current - previous) / previous;
  const threshold = 0.01; // 1% threshold for "stable"

  let trend: 'up' | 'down' | 'stable';
  if (Math.abs(change) < threshold) {
    trend = 'stable';
  } else if (change > 0) {
    trend = 'up';
  } else {
    trend = 'down';
  }

  return { trend, change };
}

/**
 * Calculate growth rate between two values
 * @param current - Current value
 * @param previous - Previous value
 * @returns Growth rate as decimal (e.g., 0.15 for 15% growth)
 */
export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 1 : 0;
  return (current - previous) / previous;
}

// ============================================================================
// CHART DATA GENERATION
// ============================================================================

export interface ChartDataPoint {
  label: string;
  value: number;
  date?: string;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    color?: string;
  }>;
}

/**
 * Generate chart data from metrics
 * @param metrics - Array of metrics
 * @returns Chart-ready data structure
 */
export function generateChartData(metrics: Metric[]): ChartData {
  return {
    labels: metrics.map((m) => m.name),
    datasets: [
      {
        label: 'Current Value',
        data: metrics.map((m) => m.value),
        color: '#3b82f6',
      },
    ],
  };
}

/**
 * Generate time series chart data
 * @param dataPoints - Array of data points with timestamps
 * @returns Chart-ready time series data
 */
export function generateTimeSeriesData(
  dataPoints: Array<{ timestamp: string; value: number }>
): ChartData {
  return {
    labels: dataPoints.map((point) => {
      const date = new Date(point.timestamp);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Value',
        data: dataPoints.map((point) => point.value),
        color: '#3b82f6',
      },
    ],
  };
}

/**
 * Generate platform comparison chart data
 * @param platforms - Array of platform performance data
 * @returns Chart-ready comparison data
 */
export function generatePlatformChartData(platforms: PlatformPerformance[]): ChartData {
  return {
    labels: platforms.map((p) => p.platform),
    datasets: [
      {
        label: 'Views',
        data: platforms.map((p) => p.metrics.views),
        color: '#3b82f6',
      },
      {
        label: 'Engagement',
        data: platforms.map((p) => p.metrics.engagement),
        color: '#10b981',
      },
      {
        label: 'Followers',
        data: platforms.map((p) => p.metrics.followers),
        color: '#f59e0b',
      },
    ],
  };
}

// ============================================================================
// DATA AGGREGATION
// ============================================================================

/**
 * Calculate total from metrics
 * @param metrics - Array of metrics
 * @param metricName - Name of the metric to sum
 * @returns Total value
 */
export function calculateTotal(metrics: Metric[], metricName?: string): number {
  if (metricName) {
    const metric = metrics.find((m) => m.name === metricName);
    return metric?.value || 0;
  }
  return metrics.reduce((sum, metric) => sum + metric.value, 0);
}

/**
 * Calculate average from metrics
 * @param metrics - Array of metrics
 * @returns Average value
 */
export function calculateAverage(metrics: Metric[]): number {
  if (metrics.length === 0) return 0;
  const total = metrics.reduce((sum, metric) => sum + metric.value, 0);
  return total / metrics.length;
}

/**
 * Find top performing platforms
 * @param platforms - Array of platform performance data
 * @param metric - Metric to sort by ('views' | 'engagement' | 'followers')
 * @param limit - Number of top platforms to return
 * @returns Sorted array of top platforms
 */
export function getTopPlatforms(
  platforms: PlatformPerformance[],
  metric: 'views' | 'engagement' | 'followers' = 'views',
  limit: number = 3
): PlatformPerformance[] {
  return [...platforms]
    .sort((a, b) => b.metrics[metric] - a.metrics[metric])
    .slice(0, limit);
}

// ============================================================================
// DATE UTILITIES
// ============================================================================

/**
 * Get date range for common periods
 * @param period - Time period ('7d' | '30d' | '90d' | '1y')
 * @returns DateRange object with ISO date strings
 */
export function getDateRange(period: '7d' | '30d' | '90d' | '1y'): {
  startDate: string;
  endDate: string;
} {
  const endDate = new Date();
  const startDate = new Date();

  switch (period) {
    case '7d':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(endDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(endDate.getDate() - 90);
      break;
    case '1y':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
  }

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
}

/**
 * Format date for display
 * @param dateString - ISO date string
 * @param format - Format style ('short' | 'long' | 'relative')
 * @returns Formatted date string
 */
export function formatDate(
  dateString: string,
  format: 'short' | 'long' | 'relative' = 'short'
): string {
  const date = new Date(dateString);
  const now = new Date();

  if (format === 'relative') {
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
  }

  if (format === 'long') {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ============================================================================
// COLOR UTILITIES
// ============================================================================

/**
 * Get color based on trend direction
 * @param trend - Trend direction
 * @returns Tailwind color class
 */
export function getTrendColor(trend: 'up' | 'down' | 'stable'): string {
  switch (trend) {
    case 'up':
      return 'text-green-600';
    case 'down':
      return 'text-red-600';
    case 'stable':
      return 'text-gray-600';
  }
}

/**
 * Get background color based on trend direction
 * @param trend - Trend direction
 * @returns Tailwind background color class
 */
export function getTrendBgColor(trend: 'up' | 'down' | 'stable'): string {
  switch (trend) {
    case 'up':
      return 'bg-green-100';
    case 'down':
      return 'bg-red-100';
    case 'stable':
      return 'bg-gray-100';
  }
}

/**
 * Get icon for trend direction
 * @param trend - Trend direction
 * @returns Icon name or symbol
 */
export function getTrendIcon(trend: 'up' | 'down' | 'stable'): string {
  switch (trend) {
    case 'up':
      return '↑';
    case 'down':
      return '↓';
    case 'stable':
      return '→';
  }
}
