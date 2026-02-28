'use client';

import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { Platform, PLATFORM_COLORS, PLATFORM_NAMES } from '@/types/analytics';

export interface PlatformMetrics {
  followers: number;
  engagement: number;
  posts: number;
}

export interface PlatformTrendData {
  value: number;
}

export interface PlatformPerformanceCardProps {
  platform: Platform;
  metrics: PlatformMetrics;
  trendData?: PlatformTrendData[];
  change?: number;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

const platformLogos: Record<Platform, string> = {
  youtube: '▶️',
  instagram: '📷',
  linkedin: '💼',
  twitter: '🐦',
  tiktok: '🎵',
  facebook: '👥',
};

export default function PlatformPerformanceCard({
  platform,
  metrics,
  trendData = [],
  change,
  loading = false,
  onClick,
  className = '',
}: PlatformPerformanceCardProps) {
  const platformColor = PLATFORM_COLORS[platform];
  const platformName = PLATFORM_NAMES[platform];
  const platformLogo = platformLogos[platform];

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  if (loading) {
    return (
      <motion.div
        className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-5 ${className}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
              <div className="h-3 bg-gray-700 rounded w-16"></div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-700 rounded"></div>
          </div>
        </div>
      </motion.div>
    );
  }

  const isPositive = change !== undefined && change >= 0;

  return (
    <motion.div
      className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-5 hover:border-gray-600 transition-all ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={onClick ? { y: -4, scale: 1.02 } : {}}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      role={onClick ? 'button' : 'article'}
      aria-label={`${platformName} performance card`}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {/* Header with Platform Logo and Name */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
            style={{ backgroundColor: `${platformColor}20` }}
          >
            <span role="img" aria-label={platformName}>
              {platformLogo}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{platformName}</h3>
            {change !== undefined && (
              <div className="flex items-center gap-1 text-sm">
                <span className={isPositive ? 'text-green-400' : 'text-red-400'}>
                  {isPositive ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <MetricItem
          label="Followers"
          value={formatNumber(metrics.followers)}
          icon="👥"
        />
        <MetricItem
          label="Engagement"
          value={`${metrics.engagement.toFixed(1)}%`}
          icon="❤️"
        />
        <MetricItem
          label="Posts"
          value={formatNumber(metrics.posts)}
          icon="📝"
        />
      </div>

      {/* Mini Trend Chart */}
      {trendData.length > 0 && (
        <div className="h-16 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={platformColor}
                strokeWidth={2}
                dot={false}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}

function MetricItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="text-center">
      <div className="text-xs text-gray-400 mb-1 flex items-center justify-center gap-1">
        <span role="img" aria-label={label}>
          {icon}
        </span>
        <span>{label}</span>
      </div>
      <div className="text-sm font-bold text-white">{value}</div>
    </div>
  );
}
