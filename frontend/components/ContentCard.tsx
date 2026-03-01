'use client'

import { ContentItem } from '@/types/content'

interface ContentCardProps {
  content: ContentItem;
  index: number;
}

const platformColors = {
  YouTube: 'from-red-500 to-red-600',
  Instagram: 'from-pink-500 to-purple-600',
  LinkedIn: 'from-blue-600 to-blue-700',
  Twitter: 'from-sky-400 to-sky-600',
  Facebook: 'from-blue-500 to-blue-600',
  Blog: 'from-gray-600 to-gray-700',
}

const platformIcons = {
  YouTube: '📺',
  Instagram: '📸',
  LinkedIn: '💼',
  Twitter: '🐦',
  Facebook: '👥',
  Blog: '📝',
}

export default function ContentCard({ content, index }: ContentCardProps) {
  const statusColors = {
    draft: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    published: 'bg-green-500/20 text-green-400 border-green-500/30',
    scheduled: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  }

  return (
    <div
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden hover:border-purple-500/50 transition-all"
    >
      {/* Thumbnail */}
      <div className={`h-48 bg-gradient-to-br ${platformColors[content.platform]} flex items-center justify-center relative`}>
        <div className="text-6xl">{platformIcons[content.platform]}</div>
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[content.status]}`}>
          {content.status}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-semibold text-white line-clamp-2 flex-1">
            {content.title}
          </h3>
        </div>

        <div className="flex items-center gap-2 mb-4 text-sm text-gray-400">
          <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded">
            {content.platform}
          </span>
          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
            {content.language}
          </span>
        </div>

        <p className="text-gray-300 text-sm mb-4 line-clamp-3">
          {content.content}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {content.tags.slice(0, 3).map((tag, i) => (
            <span
              key={i}
              className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Engagement Stats */}
        <div className="grid grid-cols-4 gap-2 pt-4 border-t border-gray-700">
          <div className="text-center">
            <div className="text-lg font-semibold text-purple-400">
              {content.engagement.views >= 1000
                ? `${(content.engagement.views / 1000).toFixed(1)}K`
                : content.engagement.views}
            </div>
            <div className="text-xs text-gray-400">Views</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-pink-400">
              {content.engagement.likes >= 1000
                ? `${(content.engagement.likes / 1000).toFixed(1)}K`
                : content.engagement.likes}
            </div>
            <div className="text-xs text-gray-400">Likes</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-400">
              {content.engagement.shares}
            </div>
            <div className="text-xs text-gray-400">Shares</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-green-400">
              {content.engagement.comments}
            </div>
            <div className="text-xs text-gray-400">Comments</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <button
            className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold rounded-lg"
          >
            View Details
          </div>
          <button
            className="px-4 py-2 bg-gray-700 text-white text-sm font-semibold rounded-lg"
          >
            Edit
          </div>
        </div>
      </div>
    </div>
  )
}
