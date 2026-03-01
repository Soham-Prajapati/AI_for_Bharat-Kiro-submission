'use client';

import React, { useState } from 'react';
import { Group } from '@/types/community';

interface GroupListProps {
  groups: Group[];
  onJoinGroup?: (groupId: string) => void;
  onLeaveGroup?: (groupId: string) => void;
  onCreateGroup?: () => void;
  onViewGroup?: (groupId: string) => void;
  isLoading?: boolean;
}

/**
 * GroupList Component
 * Displays a grid of group cards with join/leave functionality
 */
export default function GroupList({
  groups,
  onJoinGroup,
  onLeaveGroup,
  onCreateGroup,
  onViewGroup,
  isLoading = false
}: GroupListProps) {
  const [joinedGroups, setJoinedGroups] = useState<Set<string>>(
    new Set(groups.filter(g => g.isJoined).map(g => g.id))
  );

  const handleToggleJoin = (groupId: string, isCurrentlyJoined: boolean) => {
    if (isCurrentlyJoined) {
      setJoinedGroups(prev => {
        const next = new Set(prev);
        next.delete(groupId);
        return next;
      });
      onLeaveGroup?.(groupId);
    } else {
      setJoinedGroups(prev => new Set(prev).add(groupId));
      onJoinGroup?.(groupId);
    }
  };

  const formatMemberCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M members`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K members`;
    }
    return `${count} ${count === 1 ? 'member' : 'members'}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-gray-700 border-t-purple-500 animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-pink-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Groups</h2>
          <p className="text-gray-400">Discover and join communities</p>
        </p>
        {onCreateGroup && (
          <button
            onClick={onCreateGroup}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Group
          </button>
        )}
      </div>

      {/* Groups Grid */}
      {groups.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-12 text-center border border-gray-700/50">
          <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No groups found</h3>
          <p className="text-gray-500 mb-4">Be the first to create a community!</p>
          {onCreateGroup && (
            <button
              onClick={onCreateGroup}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              Create Group
            </button>
          )}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => {
            const isJoined = joinedGroups.has(group.id);
            
            return (
              <article
                key={group.id}
                className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-xl border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300 overflow-hidden group"
              >
                {/* Cover Image */}
                <div
                  className="h-32 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 relative cursor-pointer overflow-hidden"
                  onClick={() => onViewGroup?.(group.id)}
                >
                  {group.coverImage ? (
                    <img
                      src={group.coverImage}
                      alt={group.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/50 to-pink-600/50 group-hover:from-purple-600/70 group-hover:to-pink-600/70 transition-all duration-300"></div>
                  )}
                  
                  {/* Private Badge */}
                  {group.isPrivate && (
                    <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span className="text-xs text-gray-300 font-medium">Private</span>
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3
                    className="text-lg font-bold text-white mb-2 cursor-pointer hover:text-purple-400 transition-colors line-clamp-1"
                    onClick={() => onViewGroup?.(group.id)}
                  >
                    {group.name}
                  </h3>
                  
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
                    {group.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      {formatMemberCount(group.memberCount)}
                    </span>
                    {group.postCount !== undefined && (
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                        {group.postCount} posts
                      </span>
                    )}
                  </div>

                  {/* Join/Leave Button */}
                  <button
                    onClick={() => handleToggleJoin(group.id, isJoined)}
                    className={`w-full py-2.5 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
                      isJoined
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                    }`}
                  >
                    {isJoined ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Joined
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Join Group
                      </span>
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </h3>
      )}
    </div>
  );
}
