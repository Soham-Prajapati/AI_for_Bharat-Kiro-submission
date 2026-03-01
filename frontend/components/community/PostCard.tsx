'use client';

import React, { useState } from 'react';
import { Post } from '@/types/community';

interface PostCardProps {
  post: Post;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
}

/**
 * PostCard Component
 * Displays individual post with user info, content, images, and interaction buttons
 */
export default function PostCard({ post, onLike, onComment, onShare }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [showFullContent, setShowFullContent] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    onLike?.(post.id);
  };

  const formatTimestamp = (date: Date | string) => {
    const postDate = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - postDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return postDate.toLocaleDateString();
  };

  const contentPreview = post.content.length > 280 && !showFullContent
    ? post.content.slice(0, 280) + '...'
    : post.content;

  return (
    <article className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <img
          src={post.author.avatar || '/default-avatar.png'}
          alt={post.author.name}
          className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-500/30"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white truncate">{post.author.name}</h3>
            {post.author.verified && (
              <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <p className="text-sm text-gray-400">@{post.author.username} · {formatTimestamp(post.createdAt)}</p>
        </p>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-gray-200 whitespace-pre-wrap break-words">{contentPreview}</p>
        {post.content.length > 280 && (
          <button
            onClick={() => setShowFullContent(!showFullContent)}
            className="text-purple-400 hover:text-purple-300 text-sm mt-2 font-medium transition-colors"
          >
            {showFullContent ? 'Show less' : 'Show more'}
          </button>
        )}
      </p>

      {/* Image Gallery */}
      {post.images && post.images.length > 0 && (
        <div className={`mb-4 grid gap-2 ${
          post.images.length === 1 ? 'grid-cols-1' :
          post.images.length === 2 ? 'grid-cols-2' :
          post.images.length === 3 ? 'grid-cols-3' :
          'grid-cols-2'
        }`}>
          {post.images.slice(0, 4).map((image, index) => (
            <div
              key={image.id}
              className={`relative overflow-hidden rounded-xl ${
                post.images!.length === 3 && index === 0 ? 'col-span-2' : ''
              } ${post.images!.length > 4 && index === 3 ? 'relative' : ''}`}
            >
              <img
                src={image.url}
                alt={image.alt || `Post image ${index + 1}`}
                className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
              />
              {post.images!.length > 4 && index === 3 && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <span className="text-white text-3xl font-bold">+{post.images!.length - 4}</span>
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Interaction Buttons */}
      <div className="flex items-center gap-6 pt-4 border-t border-gray-700/50">
        <button
          onClick={handleLike}
          className="flex items-center gap-2 group transition-all duration-200"
          aria-label={isLiked ? 'Unlike post' : 'Like post'}
        >
          <div className={`p-2 rounded-full transition-colors duration-200 ${
            isLiked ? 'bg-pink-500/20' : 'hover:bg-gray-700/50'
          }`}>
            <svg
              className={`w-5 h-5 transition-colors duration-200 ${
                isLiked ? 'text-pink-500 fill-current' : 'text-gray-400 group-hover:text-pink-400'
              }`}
              fill={isLiked ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          <span className={`text-sm font-medium ${isLiked ? 'text-pink-500' : 'text-gray-400'}`}>
            {likeCount}
          </span>
        </button>

        <button
          onClick={() => onComment?.(post.id)}
          className="flex items-center gap-2 group transition-all duration-200"
          aria-label="Comment on post"
        >
          <div className="p-2 rounded-full hover:bg-gray-700/50 transition-colors duration-200">
            <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
          <span className="text-sm font-medium text-gray-400">{post.commentCount}</span>
        </button>

        <button
          onClick={() => onShare?.(post.id)}
          className="flex items-center gap-2 group transition-all duration-200 ml-auto"
          aria-label="Share post"
        >
          <div className="p-2 rounded-full hover:bg-gray-700/50 transition-colors duration-200">
            <svg className="w-5 h-5 text-gray-400 group-hover:text-green-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </button>
      </div>
    </article>
  );
}
