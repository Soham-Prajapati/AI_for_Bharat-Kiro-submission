'use client';

import React from 'react';

export interface PlatformMetrics {
  platform: string;
  icon: string;
  color: string;
  followers: number;
  engagement: number;
  posts: number;
  reach: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

export interface PlatformPerformanceCardProps {
  metrics: PlatformMetrics;
  index?: number;
}

export const PlatformPerformanceCard: React.FC<PlatformPerformanceCardProps> = ({
  metrics,
  index = 0,
}) => {
  const getTrendIcon = () => {
    if (metrics.trend === 'up') return '↑';
    if (metrics.trend === 'down') return '↓';
    return '→';
  };

  const getTrendColor = () => {
    if (metrics.trend === 'up') return 'text-green-400';
    if (metrics.trend === 'down') return 'text-red-400';
    return 'text-gray-400';
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div
      className="group relative overflow-hidden rounded-xl border border-gray-800 bg-gradient-to-br from-gray-900/80 to-gray-800/50 p-6 backdrop-blur-sm transition-all hover:border-gray-700 hover:shadow-xl"
    >
      {/* Background gradient effect */}
      <div
        className="absolute right-0 top-0 h-32 w-32 rounded-full opacity-10 blur-3xl transition-opacity group-hover:opacity-20"
        style={{ backgroundColor: metrics.color }}
      />

      {/* Header */}
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
            style={{ backgroundColor: `${metrics.color}20` }}
          >
            {metrics.icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {metrics.platform}
            </h3>
            <p className="text-sm text-gray-400">
              {formatNumber(metrics.followers)} followers
            </p>
          </div>
        </div>
        <div className={`text-right ${getTrendColor()}`}>
          <div className="text-2xl font-bold">
            {getTrendIcon()} {Math.abs(metrics.change)}%
          </div>
          <div className="text-xs text-gray-500">growth</div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="relative mt-6 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {metrics.engagement}%
          </div>
          <div className="text-xs text-gray-400">Engagement</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {formatNumber(metrics.posts)}
          </div>
          <div className="text-xs text-gray-400">Posts</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {formatNumber(metrics.reach)}
          </div>
          <div className="text-xs text-gray-400">Reach</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative mt-4">
        <div className="h-2 overflow-hidden rounded-full bg-gray-800">
          <div
            className="h-full rounded-full"
            style={{ backgroundColor: metrics.color }}
          />
        </div>
      </div>
    </div>
  );
};
