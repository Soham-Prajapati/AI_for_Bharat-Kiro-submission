'use client';

import React from 'react';
import { UserPresence as UserPresenceType } from '@/types/workspace';

interface UserPresenceProps {
  activeUsers: UserPresenceType[];
  maxVisible?: number;
}

export default function UserPresence({ activeUsers, maxVisible = 5 }: UserPresenceProps) {
  const visibleUsers = activeUsers.slice(0, maxVisible);
  const remainingCount = Math.max(0, activeUsers.length - maxVisible);

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {visibleUsers.map((presence) => (
          <div
            key={presence.userId}
            className="relative group"
            title={presence.user.name}
          >
            <div
              className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-white text-sm font-medium shadow-lg transition-transform hover:scale-110 hover:z-10"
              style={{ backgroundColor: presence.user.color }}
            >
              {presence.user.avatar ? (
                <img
                  src={presence.user.avatar}
                  alt={presence.user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span>{presence.user.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            {presence.isTyping && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse" />
            )}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {presence.user.name}
              {presence.isTyping && ' (typing...)'}
            </div>
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-600 flex items-center justify-center text-white text-xs font-medium shadow-lg">
            +{remainingCount}
          </div>
        )}
      </div>
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {activeUsers.length} {activeUsers.length === 1 ? 'user' : 'users'} online
      </span>
    </div>
  );
}
