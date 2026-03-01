'use client';

import React, { useState } from 'react';
import { VersionHistoryEntry } from '@/types/workspace';

interface VersionHistoryProps {
  history: VersionHistoryEntry[];
  currentVersion: number;
  onRestore: (versionId: string) => void;
  onPreview: (versionId: string) => void;
}

export default function VersionHistory({
  history,
  currentVersion,
  onRestore,
  onPreview,
}: VersionHistoryProps) {
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTimeDiff = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Version History
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {history.length} versions saved
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <svg
              className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-gray-600 dark:text-gray-400">No version history yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              Changes will be saved automatically
            </p>
          </p>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {history.map((entry, index) => {
              const isSelected = selectedVersion === entry.id;
              const isCurrent = entry.version === currentVersion;

              return (
                <div
                  key={entry.id}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer ${
                    isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                  onClick={() => setSelectedVersion(entry.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium"
                        style={{ backgroundColor: entry.user.color }}
                      >
                        {entry.user.avatar ? (
                          <img
                            src={entry.user.avatar}
                            alt={entry.user.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span>{entry.user.name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {entry.user.name}
                          {isCurrent && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                              Current
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTimeDiff(entry.timestamp)}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      v{entry.version}
                    </span>
                  </div>

                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    {entry.changes}
                  </p>

                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    {formatDate(entry.timestamp)}
                  </p>

                  {isSelected && !isCurrent && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPreview(entry.id);
                        }}
                        className="flex-1 px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      >
                        Preview
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRestore(entry.id);
                        }}
                        className="flex-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Restore
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
