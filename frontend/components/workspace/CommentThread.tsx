'use client';

import React, { useState } from 'react';
import { Comment, CommentReply } from '@/types/workspace';

interface CommentThreadProps {
  comment: Comment;
  onReply: (commentId: string, content: string) => void;
  onResolve: (commentId: string) => void;
  onDelete: (commentId: string) => void;
  currentUserId: string;
}

export default function CommentThread({
  comment,
  onReply,
  onResolve,
  onDelete,
  currentUserId,
}: CommentThreadProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  const handleSubmitReply = () => {
    if (replyContent.trim()) {
      onReply(comment.id, replyContent);
      setReplyContent('');
      setIsReplying(false);
    }
  };

  const formatDate = (date: Date) => {
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
    <div
      className={`border-l-4 pl-4 py-3 mb-3 transition-all ${
        comment.resolved
          ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
          : 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
            style={{ backgroundColor: comment.user.color }}
          >
            {comment.user.avatar ? (
              <img
                src={comment.user.avatar}
                alt={comment.user.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span>{comment.user.name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {comment.user.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(comment.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {comment.replies.length > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              aria-label={isExpanded ? 'Collapse thread' : 'Expand thread'}
            >
              {isExpanded ? '▼' : '▶'} {comment.replies.length}
            </button>
          )}
          {!comment.resolved && (
            <button
              onClick={() => onResolve(comment.id)}
              className="text-xs text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
              aria-label="Resolve comment"
            >
              ✓ Resolve
            </button>
          )}
          {comment.userId === currentUserId && (
            <button
              onClick={() => onDelete(comment.id)}
              className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              aria-label="Delete comment"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{comment.content}</p>

      {isExpanded && comment.replies.length > 0 && (
        <div className="ml-4 space-y-2 mb-2">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="flex items-start gap-2 py-2">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0"
                style={{ backgroundColor: reply.user.color }}
              >
                {reply.user.avatar ? (
                  <img
                    src={reply.user.avatar}
                    alt={reply.user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span>{reply.user.name.charAt(0).toUpperCase()}</span>
                )}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                    {reply.user.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(reply.createdAt)}
                  </span>
                </span>
                <p className="text-sm text-gray-700 dark:text-gray-300">{reply.content}</p>
              </p>
            </div>
          ))}
        </div>
      )}

      {!comment.resolved && (
        <div className="mt-2">
          {isReplying ? (
            <div className="space-y-2">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={2}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSubmitReply}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Reply
                </button>
                <button
                  onClick={() => {
                    setIsReplying(false);
                    setReplyContent('');
                  }}
                  className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsReplying(true)}
              className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Reply
            </button>
          )}
        </div>
      )}
    </div>
  );
}
