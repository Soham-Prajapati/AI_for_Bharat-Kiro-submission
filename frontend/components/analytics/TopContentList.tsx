'use client';

import React from 'react';

export interface ContentItem {
  id: string;
  title: string;
  platform: string;
  platformColor: string;
  views: number;
  engagement: number;
  likes: number;
  shares: number;
  thumbnail?: string;
  publishedDate: string;
}

export interface TopContentListProps {
  content: ContentItem[];
  title?: string;
  limit?: number;
}

export const TopContentList: React.FC<TopContentListProps> = ({
  content,
  title = 'Top Performing Content',
  limit = 10,
}) => {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const displayContent = content.slice(0, limit);

  return (
    <div
      className="rounded-xl border border-gray-800 bg-gradient-to-br from-gray-900/50 to-gray-800/30 p-6 backdrop-blur-sm"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <span className="text-sm text-gray-400">
          {content.length} total posts
        </span>
      </div>

      <div className="space-y-3">
        {displayContent.map((item, index) => (
          <div
            key={item.id}
            className="group relative overflow-hidden rounded-lg border border-gray-800 bg-gray-900/50 p-4 transition-all hover:border-gray-700 hover:bg-gray-900/80"
          >
            <div className="flex gap-4">
              {/* Rank Badge */}
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 font-bold text-white">
                #{index + 1}
              </div>

              {/* Thumbnail */}
              {item.thumbnail ? (
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-800">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-gray-800 text-2xl">
                  📄
                </div>
              )}

              {/* Content Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-white line-clamp-1 group-hover:text-blue-400 transition-colors">
                    {item.title}
                  </h4>
                  <span
                    className="flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: `${item.platformColor}20`,
                      color: item.platformColor,
                    }}
                  >
                    {item.platform}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <span>👁️</span>
                    <span>{formatNumber(item.views)} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>❤️</span>
                    <span>{formatNumber(item.likes)} likes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>🔄</span>
                    <span>{formatNumber(item.shares)} shares</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>📊</span>
                    <span>{item.engagement}% engagement</span>
                  </div>
                </div>

                <div className="mt-2 text-xs text-gray-500">
                  {item.publishedDate}
                </div>
              </div>
            </div>

            {/* Engagement Bar */}
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-gray-800">
              <div
                className="h-full rounded-full"
                style={{ backgroundColor: item.platformColor }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
