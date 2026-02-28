'use client';

/**
 * Analytics Dashboard Example
 * 
 * This example demonstrates how to use all the reusable analytics components:
 * - MetricCard: Display key metrics with animated counters
 * - TrendChart: Show time-series data with multiple series
 * - InsightPanel: Display AI-generated insights with actions
 * - PlatformPerformanceCard: Show platform-specific metrics
 * 
 * Usage:
 * Import this component in your analytics page or dashboard
 */

import { useState } from 'react';
import MetricCard from './MetricCard';
import TrendChart, { TrendDataPoint, TrendSeries } from './TrendChart';
import InsightPanel, { Insight } from './InsightPanel';
import PlatformPerformanceCard from './PlatformPerformanceCard';
import { Platform } from '@/types/analytics';

export default function AnalyticsDashboardExample() {
  const [loading, setLoading] = useState(false);

  // Sample data for MetricCards
  const metrics = [
    {
      name: 'Total Revenue',
      value: 45230,
      change: 12.5,
      icon: '💰',
      format: 'currency' as const,
    },
    {
      name: 'Total Followers',
      value: 128450,
      change: 8.3,
      icon: '👥',
      format: 'number' as const,
    },
    {
      name: 'Engagement Rate',
      value: 4.7,
      change: -2.1,
      icon: '❤️',
      format: 'percentage' as const,
    },
    {
      name: 'Content Posts',
      value: 342,
      change: 15.8,
      icon: '📝',
      format: 'number' as const,
    },
  ];

  // Sample data for TrendChart
  const trendData: TrendDataPoint[] = [
    { date: 'Jan', youtube: 45000, instagram: 32000, linkedin: 18000 },
    { date: 'Feb', youtube: 52000, instagram: 38000, linkedin: 22000 },
    { date: 'Mar', youtube: 48000, instagram: 42000, linkedin: 25000 },
    { date: 'Apr', youtube: 61000, instagram: 45000, linkedin: 28000 },
    { date: 'May', youtube: 55000, instagram: 51000, linkedin: 32000 },
    { date: 'Jun', youtube: 67000, instagram: 58000, linkedin: 35000 },
  ];

  const trendSeries: TrendSeries[] = [
    { key: 'youtube', name: 'YouTube', color: '#FF0000', gradient: true },
    { key: 'instagram', name: 'Instagram', color: '#E1306C', gradient: true },
    { key: 'linkedin', name: 'LinkedIn', color: '#0077B5', gradient: true },
  ];

  // Sample data for InsightPanel
  const insights: Insight[] = [
    {
      id: '1',
      type: 'opportunity',
      title: 'YouTube Growth Opportunity',
      description: 'Your YouTube engagement is 23% higher on weekends. Consider scheduling more content for Saturday and Sunday.',
      details: 'Analysis of the last 30 days shows that videos posted on weekends receive 45% more views in the first 24 hours and maintain higher engagement rates throughout their lifecycle.',
      action: {
        label: 'Schedule Content',
        onClick: () => alert('Navigate to content scheduler'),
      },
    },
    {
      id: '2',
      type: 'warning',
      title: 'Instagram Engagement Declining',
      description: 'Instagram engagement has dropped 15% over the last 2 weeks. Your posting frequency may be too low.',
      details: 'Competitors in your niche are posting 2-3 times daily. Your current rate of 4 posts per week may not be sufficient to maintain visibility in the algorithm.',
      action: {
        label: 'View Recommendations',
        onClick: () => alert('Show posting recommendations'),
      },
    },
    {
      id: '3',
      type: 'success',
      title: 'LinkedIn Performance Excellent',
      description: 'Your LinkedIn posts are performing 40% above industry average. Keep up the great work!',
      details: 'Your professional content strategy is resonating well with your audience. Posts with industry insights and case studies are getting the most traction.',
    },
    {
      id: '4',
      type: 'opportunity',
      title: 'Cross-Platform Content Potential',
      description: 'Your YouTube tutorials could be repurposed into LinkedIn carousel posts for 3x reach.',
      action: {
        label: 'Generate Content',
        onClick: () => alert('Start content multiplier'),
      },
    },
  ];

  // Sample data for PlatformPerformanceCards
  const platforms: Array<{
    platform: Platform;
    metrics: { followers: number; engagement: number; posts: number };
    change: number;
    trendData: Array<{ value: number }>;
  }> = [
    {
      platform: 'youtube',
      metrics: { followers: 45200, engagement: 5.8, posts: 124 },
      change: 12.3,
      trendData: [
        { value: 40000 },
        { value: 41000 },
        { value: 42500 },
        { value: 43800 },
        { value: 45200 },
      ],
    },
    {
      platform: 'instagram',
      metrics: { followers: 32800, engagement: 4.2, posts: 287 },
      change: -3.5,
      trendData: [
        { value: 35000 },
        { value: 34500 },
        { value: 33800 },
        { value: 33200 },
        { value: 32800 },
      ],
    },
    {
      platform: 'linkedin',
      metrics: { followers: 18500, engagement: 6.4, posts: 89 },
      change: 18.7,
      trendData: [
        { value: 15000 },
        { value: 16200 },
        { value: 17100 },
        { value: 17800 },
        { value: 18500 },
      ],
    },
    {
      platform: 'twitter',
      metrics: { followers: 28300, engagement: 3.1, posts: 456 },
      change: 5.2,
      trendData: [
        { value: 26500 },
        { value: 27000 },
        { value: 27500 },
        { value: 27900 },
        { value: 28300 },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-gray-400">
              Comprehensive view of your content performance
            </p>
          </div>
          <button
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 2000);
            }}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Refresh Data
          </button>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <MetricCard
              key={index}
              name={metric.name}
              value={metric.value}
              change={metric.change}
              icon={metric.icon}
              format={metric.format}
              loading={loading}
            />
          ))}
        </div>

        {/* Trend Chart */}
        <TrendChart
          data={trendData}
          series={trendSeries}
          title="Follower Growth Trends"
          height={400}
          loading={loading}
          yAxisFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
          tooltipFormatter={(value) => value.toLocaleString()}
        />

        {/* Platform Performance Cards */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Platform Performance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {platforms.map((platform) => (
              <PlatformPerformanceCard
                key={platform.platform}
                platform={platform.platform}
                metrics={platform.metrics}
                trendData={platform.trendData}
                change={platform.change}
                loading={loading}
                onClick={() => alert(`View ${platform.platform} details`)}
              />
            ))}
          </div>
        </div>

        {/* AI Insights Panel */}
        <InsightPanel insights={insights} loading={loading} />
      </div>
    </div>
  );
}
