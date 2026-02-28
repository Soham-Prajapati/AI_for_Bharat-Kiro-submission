'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MetricCard } from '@/components/analytics/MetricCard';
import { TrendChart } from '@/components/analytics/TrendChart';
import { PlatformPerformanceCard } from '@/components/analytics/PlatformPerformanceCard';
import { InsightPanel } from '@/components/analytics/InsightPanel';
import { PerformanceComparisonChart } from '@/components/analytics/PerformanceComparisonChart';
import { TopContentList } from '@/components/analytics/TopContentList';
import { ExportButton } from '@/components/analytics/ExportButton';

// Mock data generator for demonstration
const generateMockData = () => {
  const platforms = [
    { name: 'YouTube', icon: '▶️', color: '#FF0000' },
    { name: 'Instagram', icon: '📷', color: '#E1306C' },
    { name: 'LinkedIn', icon: '💼', color: '#0077B5' },
    { name: 'Twitter', icon: '🐦', color: '#1DA1F2' },
    { name: 'TikTok', icon: '🎵', color: '#00F2EA' },
    { name: 'Facebook', icon: '👥', color: '#1877F2' },
  ];

  // Generate time series data (30 days)
  const trendData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      youtube: Math.floor(Math.random() * 5000) + 10000,
      instagram: Math.floor(Math.random() * 4000) + 8000,
      linkedin: Math.floor(Math.random() * 3000) + 5000,
      twitter: Math.floor(Math.random() * 3500) + 6000,
      tiktok: Math.floor(Math.random() * 6000) + 12000,
      facebook: Math.floor(Math.random() * 4500) + 7000,
    };
  });

  // Platform performance data
  const platformMetrics = platforms.map((platform) => ({
    platform: platform.name,
    icon: platform.icon,
    color: platform.color,
    followers: Math.floor(Math.random() * 500000) + 100000,
    engagement: Math.floor(Math.random() * 15) + 5,
    posts: Math.floor(Math.random() * 200) + 50,
    reach: Math.floor(Math.random() * 1000000) + 500000,
    trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable',
    change: Math.floor(Math.random() * 30) + 5,
  }));

  // Comparison data
  const comparisonData = platforms.map((platform) => ({
    platform: platform.name,
    engagement: Math.floor(Math.random() * 80) + 20,
    reach: Math.floor(Math.random() * 90) + 10,
    conversions: Math.floor(Math.random() * 70) + 15,
    roi: Math.random() * 4 + 1,
  }));

  // Top content
  const topContent = Array.from({ length: 15 }, (_, i) => {
    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    return {
      id: `content-${i}`,
      title: `Amazing Content Post #${i + 1} - ${platform.name} Edition`,
      platform: platform.name,
      platformColor: platform.color,
      views: Math.floor(Math.random() * 500000) + 50000,
      engagement: Math.floor(Math.random() * 20) + 5,
      likes: Math.floor(Math.random() * 50000) + 5000,
      shares: Math.floor(Math.random() * 10000) + 1000,
      publishedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    };
  }).sort((a, b) => b.views - a.views);

  // AI Insights
  const insights = [
    {
      id: '1',
      type: 'success' as const,
      title: 'Outstanding Performance',
      description: 'Your YouTube content is performing 45% better than last month. Keep up the great work!',
      platform: 'YouTube',
      action: 'View Details',
    },
    {
      id: '2',
      type: 'tip' as const,
      title: 'Optimal Posting Time',
      description: 'Data shows your audience is most active on Instagram between 6-8 PM EST.',
      platform: 'Instagram',
      action: 'Schedule Posts',
    },
    {
      id: '3',
      type: 'warning' as const,
      title: 'Engagement Drop',
      description: 'LinkedIn engagement has decreased by 12%. Consider refreshing your content strategy.',
      platform: 'LinkedIn',
      action: 'Get Recommendations',
    },
    {
      id: '4',
      type: 'info' as const,
      title: 'Trending Topic',
      description: 'AI detected rising interest in "productivity tools" - great opportunity for content.',
      action: 'Create Content',
    },
  ];

  return { trendData, platformMetrics, comparisonData, topContent, insights };
};

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [chartType, setChartType] = useState<'line' | 'area'>('area');
  
  const data = useMemo(() => generateMockData(), []);

  const handleExport = (format: 'csv' | 'pdf' | 'json') => {
    console.log(`Exporting data as ${format}...`);
    // Implementation would go here
    alert(`Exporting analytics data as ${format.toUpperCase()}...`);
  };

  // Calculate overview metrics
  const totalViews = data.topContent.reduce((sum, item) => sum + item.views, 0);
  const avgEngagement = (data.platformMetrics.reduce((sum, p) => sum + p.engagement, 0) / data.platformMetrics.length).toFixed(1);
  const totalFollowers = data.platformMetrics.reduce((sum, p) => sum + p.followers, 0);
  const avgROI = (data.comparisonData.reduce((sum, p) => sum + p.roi, 0) / data.comparisonData.length).toFixed(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold text-white"
              >
                Analytics Dashboard
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="mt-1 text-sm text-gray-400"
              >
                Comprehensive insights across all your platforms
              </motion.p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Time Range Selector */}
              <div className="flex rounded-lg border border-gray-700 bg-gray-900/50 p-1">
                {(['7d', '30d', '90d'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`rounded-md px-3 py-1 text-sm font-medium transition-all ${
                      timeRange === range
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                  </button>
                ))}
              </div>

              {/* Chart Type Toggle */}
              <div className="flex rounded-lg border border-gray-700 bg-gray-900/50 p-1">
                {(['line', 'area'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setChartType(type)}
                    className={`rounded-md px-3 py-1 text-sm font-medium capitalize transition-all ${
                      chartType === type
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <ExportButton onExport={handleExport} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Overview Metrics */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Views"
            value={`${(totalViews / 1000000).toFixed(1)}M`}
            change={12.5}
            trend="up"
            icon="👁️"
            color="blue"
            subtitle="Across all platforms"
          />
          <MetricCard
            title="Avg Engagement"
            value={`${avgEngagement}%`}
            change={8.3}
            trend="up"
            icon="❤️"
            color="purple"
            subtitle="User interaction rate"
          />
          <MetricCard
            title="Total Followers"
            value={`${(totalFollowers / 1000000).toFixed(1)}M`}
            change={-2.1}
            trend="down"
            icon="👥"
            color="green"
            subtitle="Combined audience"
          />
          <MetricCard
            title="Avg ROI"
            value={`${avgROI}x`}
            change={15.7}
            trend="up"
            icon="💰"
            color="orange"
            subtitle="Return on investment"
          />
        </div>

        {/* Trend Chart */}
        <div className="mb-8">
          <TrendChart
            title="Engagement Trends Over Time"
            data={data.trendData}
            type={chartType}
            height={350}
            lines={[
              { dataKey: 'youtube', color: '#FF0000', name: 'YouTube' },
              { dataKey: 'instagram', color: '#E1306C', name: 'Instagram' },
              { dataKey: 'linkedin', color: '#0077B5', name: 'LinkedIn' },
              { dataKey: 'twitter', color: '#1DA1F2', name: 'Twitter' },
              { dataKey: 'tiktok', color: '#00F2EA', name: 'TikTok' },
              { dataKey: 'facebook', color: '#1877F2', name: 'Facebook' },
            ]}
          />
        </div>

        {/* Platform Performance Cards */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-white">
            Platform Performance
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.platformMetrics.map((metrics, index) => (
              <PlatformPerformanceCard
                key={metrics.platform}
                metrics={metrics}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* Insights and Comparison */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <InsightPanel insights={data.insights} />
          <PerformanceComparisonChart
            title="Platform Comparison"
            data={data.comparisonData}
            type="radar"
            height={350}
          />
        </div>

        {/* Bar Chart Comparison */}
        <div className="mb-8">
          <PerformanceComparisonChart
            title="Detailed Performance Metrics"
            data={data.comparisonData}
            type="bar"
            height={300}
          />
        </div>

        {/* Top Content List */}
        <TopContentList content={data.topContent} limit={10} />
      </div>
    </div>
  );
}
