'use client';

import React, { useState } from 'react';
import { User, Post } from '@/types/community';

interface ProfileCardProps {
  user: User;
  recentPosts?: Post[];
  onFollow?: (userId: string) => void;
  onUnfollow?: (userId: string) => void;
  onViewProfile?: (userId: string) => void;
  isCurrentUser?: boolean;
}

/**
 * ProfileCard Component
 * User profile display with avatar, stats, follow button, and recent posts preview
 */
export default function ProfileCard({
  user,
  recentPosts = [],
  onFollow,
  onUnfollow,
  onViewProfile,
  isCurrentUser = false
}: ProfileCardProps) {
  const [isFollowing, setIsFollowing] = useState(user.isFollowing || false);
  const [followerCount, setFollowerCount] = useState(user.followerCount);

  const handleFollowToggle = () => {
    if (isFollowing) {
      setIsFollowing(false);
      setFollowerCount(prev => prev - 1);
      onUnfollow?.(user.id);
    } else {
      setIsFollowing(true);
      setFollowerCount(prev => prev + 1);
      onFollow?.(user.id);
    }
  };

  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-xl border border-gray-700/50 overflow-hidden hover:border-purple-500/30 transition-all duration-300">
      {/* Header with gradient background */}
      <div className="h-24 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 relative">
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Profile Content */}
      <div className="px-6 pb-6">
        {/* Avatar */}
        <div className="relative -mt-12 mb-4">
          <img
            src={user.avatar || '/default-avatar.png'}
            alt={user.name}
            className="w-24 h-24 rounded-full object-cover ring-4 ring-gray-900 cursor-pointer hover:ring-purple-500 transition-all duration-300"
            onClick={() => onViewProfile?.(user.id)}
          />
          {user.verified && (
            <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1.5 ring-4 ring-gray-900">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="mb-4">
          <h3 
            className="text-xl font-bold text-white mb-1 cursor-pointer hover:text-purple-400 transition-colors"
            onClick={() => onViewProfile?.(user.id)}
          >
            {user.name}
          </h3>
          <p className="text-gray-400 text-sm mb-3">@{user.username}</p>
          
          {user.bio && (
            <p className="text-gray-300 text-sm leading-relaxed">{user.bio}</p>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-6 mb-4 pb-4 border-b border-gray-700/50">
          <div className="text-center">
            <div className="text-xl font-bold text-white">{formatCount(followerCount)}</div>
            <div className="text-xs text-gray-400">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-white">{formatCount(user.followingCount)}</div>
            <div className="text-xs text-gray-400">Following</div>
          </div>
        </div>

        {/* Action Button */}
        {!isCurrentUser && (
          <button
            onClick={handleFollowToggle}
            className={`w-full py-2.5 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
              isFollowing
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
            }`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        )}

        {isCurrentUser && (
          <button
            onClick={() => onViewProfile?.(user.id)}
            className="w-full py-2.5 rounded-lg font-medium bg-gray-700 hover:bg-gray-600 text-white transition-all duration-200 transform hover:scale-105"
          >
            Edit Profile
          </button>
        )}

        {/* Recent Posts Preview */}
        {recentPosts.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-700/50">
            <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Recent Posts</h4>
            <div className="space-y-3">
              {recentPosts.slice(0, 3).map((post) => (
                <div
                  key={post.id}
                  className="group cursor-pointer"
                  onClick={() => onViewProfile?.(user.id)}
                >
                  <p className="text-sm text-gray-300 line-clamp-2 group-hover:text-purple-400 transition-colors">
                    {post.content}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {post.likeCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {post.commentCount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
