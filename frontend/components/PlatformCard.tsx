'use client';

import { motion } from 'framer-motion';
import { PlatformData, PLATFORM_COLORS, PLATFORM_NAMES } from '@/types/analytics';
import { TrendingUp, TrendingDown, Minus, Eye, Heart } from 'lucide-react';

interface PlatformCardProps {
  data: PlatformData;
  index: number;
}

const platformIcons: Record<string, string> = {
  youtube: '▶',
  instagram: '📷',
  linkedin: '💼',
  twitter: '🐦',
  tiktok: '🎵',
  facebook: '👥',
};

export default function PlatformCard({ data, index }: PlatformCardProps) {
  const color = PLATFORM_COLORS[data.platform];
  const name = PLATFORM_NAMES[data.platform];
  const icon = platformIcons[data.platform];
  
  const TrendIcon = data.trend === 'up' ? TrendingUp : data.trend === 'down' ? TrendingDown : Minus;
  const trendColor = data.trend === 'up' ? 'text-green-400' : data.trend === 'down' ? 'text-red-400' : 'text-gray-400';
  
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-lg"
      style={{ 
        boxShadow: `0 4px 20px ${color}15`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="text-3xl w-12 h-12 flex items-center justify-center rounded-lg"
            style={{ backgroundColor: `${color}20` }}
          >
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{name}</h3>
            <div className="flex items-center gap-1 text-sm">
              <TrendIcon className={`w-4 h-4 ${trendColor}`} />
              <span className={trendColor}>
                {data.trend === 'up' ? 'Growing' : data.trend === 'down' ? 'Declining' : 'Stable'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Followers */}
      <div className="mb-4">
        <p className="text-gray-400 text-sm mb-1">Followers</p>
        <p className="text-3xl font-bold text-white">{formatNumber(data.followers)}</p>
      </div>

      {/* Engagement Rate */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <p className="text-gray-400 text-sm">Engagement Rate</p>
          <p className="text-white font-semibold">{(data.engagement * 100).toFixed(1)}%</p>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${data.engagement * 100}%` }}
            transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
          />
        </div>
      </div>

      {/* Top Post */}
      <div className="pt-4 border-t border-gray-700">
        <p className="text-gray-400 text-xs mb-2">Top Performing Post</p>
        <p className="text-white text-sm font-medium mb-3 line-clamp-2">{data.topPost.title}</p>
        <div className="flex items-center gap-4 text-gray-400 text-xs">
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span>{formatNumber(data.topPost.views)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            <span>{formatNumber(data.topPost.likes)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
