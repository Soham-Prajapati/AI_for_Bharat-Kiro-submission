'use client';

import React, { useState, useEffect } from 'react';
import Editor from '@/components/workspace/Editor';
import UserPresence from '@/components/workspace/UserPresence';
import CommentThread from '@/components/workspace/CommentThread';
import VersionHistory from '@/components/workspace/VersionHistory';
import {
  UserPresence as UserPresenceType,
  Comment,
  VersionHistoryEntry,
  User,
} from '@/types/workspace';

// Mock data for demonstration
const mockCurrentUser: User = {
  id: 'user-1',
  name: 'You',
  email: 'you@example.com',
  color: '#3B82F6',
};

const mockUsers: UserPresenceType[] = [
  {
    userId: 'user-1',
    user: mockCurrentUser,
    isTyping: false,
    lastActive: new Date(),
  },
  {
    userId: 'user-2',
    user: {
      id: 'user-2',
      name: 'Sarah Chen',
      email: 'sarah@example.com',
      color: '#10B981',
    },
    isTyping: true,
    lastActive: new Date(),
    cursorPosition: { line: 5, column: 20 },
  },
  {
    userId: 'user-3',
    user: {
      id: 'user-3',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      color: '#F59E0B',
    },
    isTyping: false,
    lastActive: new Date(Date.now() - 300000),
  },
];

const mockComments: Comment[] = [
  {
    id: 'comment-1',
    workspaceId: 'workspace-1',
    userId: 'user-2',
    user: {
      id: 'user-2',
      name: 'Sarah Chen',
      email: 'sarah@example.com',
      color: '#10B981',
    },
    content: 'Should we expand on this section? I think we need more details about the implementation.',
    position: { line: 10, column: 0 },
    resolved: false,
    replies: [
      {
        id: 'reply-1',
        commentId: 'comment-1',
        userId: 'user-3',
        user: {
          id: 'user-3',
          name: 'Mike Johnson',
          email: 'mike@example.com',
          color: '#F59E0B',
        },
        content: 'Good point! I can add more technical details.',
        createdAt: new Date(Date.now() - 3600000),
      },
    ],
    createdAt: new Date(Date.now() - 7200000),
    updatedAt: new Date(Date.now() - 3600000),
  },
  {
    id: 'comment-2',
    workspaceId: 'workspace-1',
    userId: 'user-3',
    user: {
      id: 'user-3',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      color: '#F59E0B',
    },
    content: 'This looks great! Ready to publish.',
    position: { line: 25, column: 0 },
    resolved: true,
    replies: [],
    createdAt: new Date(Date.now() - 1800000),
    updatedAt: new Date(Date.now() - 1800000),
  },
];

const mockHistory: VersionHistoryEntry[] = [
  {
    id: 'version-3',
    workspaceId: 'workspace-1',
    version: 3,
    userId: 'user-1',
    user: mockCurrentUser,
    changes: 'Updated introduction and added examples',
    content: '',
    timestamp: new Date(),
  },
  {
    id: 'version-2',
    workspaceId: 'workspace-1',
    version: 2,
    userId: 'user-2',
    user: {
      id: 'user-2',
      name: 'Sarah Chen',
      email: 'sarah@example.com',
      color: '#10B981',
    },
    changes: 'Fixed typos and improved formatting',
    content: '',
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    id: 'version-1',
    workspaceId: 'workspace-1',
    version: 1,
    userId: 'user-3',
    user: {
      id: 'user-3',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      color: '#F59E0B',
    },
    changes: 'Initial draft created',
    content: '',
    timestamp: new Date(Date.now() - 86400000),
  },
];

export default function WorkspacePage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showComments, setShowComments] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [content, setContent] = useState(
    `# Content Intelligence Platform - Collaborative Workspace

Welcome to the collaborative workspace! This is a Google Docs-style editor with real-time collaboration features.

## Features

- **Real-time Collaboration**: See who's online and where they're editing
- **Inline Comments**: Add comments and have threaded discussions
- **Version History**: Track all changes and restore previous versions
- **Dark Mode**: Easy on the eyes for long editing sessions

## Getting Started

Start typing to see the magic happen. Your changes are automatically saved and synced with other collaborators in real-time.

### Collaboration Tools

Use the toolbar above to format your text. Click the comment button to add inline comments. Check the version history to see all changes made to this document.

## Next Steps

1. Invite team members to collaborate
2. Set up automated workflows
3. Export your content to various platforms

Happy collaborating!`
  );
  const [activeUsers, setActiveUsers] = useState<UserPresenceType[]>(mockUsers);
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [history, setHistory] = useState<VersionHistoryEntry[]>(mockHistory);
  const [documentName, setDocumentName] = useState('Untitled Document');
  const [isEditingName, setIsEditingName] = useState(false);

  useEffect(() => {
    // Apply dark mode class to html element
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    // In a real app, this would trigger a WebSocket event to sync with other users
  };

  const handleCursorMove = (position: { line: number; column: number }) => {
    // In a real app, broadcast cursor position to other users
    console.log('Cursor moved to:', position);
  };

  const handleAddComment = () => {
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      workspaceId: 'workspace-1',
      userId: mockCurrentUser.id,
      user: mockCurrentUser,
      content: '',
      position: { line: 0, column: 0 },
      resolved: false,
      replies: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setComments([...comments, newComment]);
  };

  const handleReply = (commentId: string, replyContent: string) => {
    setComments(
      comments.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: [
              ...comment.replies,
              {
                id: `reply-${Date.now()}`,
                commentId,
                userId: mockCurrentUser.id,
                user: mockCurrentUser,
                content: replyContent,
                createdAt: new Date(),
              },
            ],
          };
        }
        return comment;
      })
    );
  };

  const handleResolveComment = (commentId: string) => {
    setComments(
      comments.map((comment) =>
        comment.id === commentId ? { ...comment, resolved: true } : comment
      )
    );
  };

  const handleDeleteComment = (commentId: string) => {
    setComments(comments.filter((comment) => comment.id !== commentId));
  };

  const handleRestoreVersion = (versionId: string) => {
    console.log('Restoring version:', versionId);
    // In a real app, fetch and restore the version content
  };

  const handlePreviewVersion = (versionId: string) => {
    console.log('Previewing version:', versionId);
    // In a real app, show a preview modal
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            {isEditingName ? (
              <input
                type="text"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                className="text-xl font-semibold bg-transparent border-b-2 border-blue-500 focus:outline-none text-gray-900 dark:text-gray-100"
                autoFocus
              />
            ) : (
              <h1
                className="text-xl font-semibold text-gray-900 dark:text-gray-100 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                onClick={() => setIsEditingName(true)}
              >
                {documentName}
              </h1>
            )}
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Last edited {new Date().toLocaleTimeString()}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <UserPresence activeUsers={activeUsers} />

            <div className="flex items-center gap-2 border-l border-gray-300 dark:border-gray-600 pl-4">
              <button
                onClick={() => {
                  setShowComments(!showComments);
                  if (showHistory) setShowHistory(false);
                }}
                className={`p-2 rounded-lg transition-colors ${
                  showComments
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
                title="Comments"
                aria-label="Toggle comments"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                  />
                </svg>
              </button>

              <button
                onClick={() => {
                  setShowHistory(!showHistory);
                  if (showComments) setShowComments(false);
                }}
                className={`p-2 rounded-lg transition-colors ${
                  showHistory
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
                title="Version History"
                aria-label="Toggle version history"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>

              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
                title={isDarkMode ? 'Light mode' : 'Dark mode'}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                )}
              </button>

              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                aria-label="Share document"
              >
                Share
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor */}
        <main className="flex-1 overflow-hidden">
          <Editor
            content={content}
            onChange={handleContentChange}
            activeUsers={activeUsers.filter((u) => u.userId !== mockCurrentUser.id)}
            onCursorMove={handleCursorMove}
          />
        </main>

        {/* Sidebar */}
        {(showComments || showHistory) && (
          <aside className="w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden transition-colors">
            {showComments && (
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Comments
                    </h2>
                    <button
                      onClick={handleAddComment}
                      className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      + Add
                    </button>
                  </div>
                  <div className="flex gap-2 text-sm">
                    <button className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg font-medium">
                      All ({comments.length})
                    </button>
                    <button className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      Open ({comments.filter((c) => !c.resolved).length})
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {comments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
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
                          d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                        />
                      </svg>
                      <p className="text-gray-600 dark:text-gray-400">No comments yet</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                        Start a conversation
                      </p>
                    </p>
                  ) : (
                    comments.map((comment) => (
                      <CommentThread
                        key={comment.id}
                        comment={comment}
                        onReply={handleReply}
                        onResolve={handleResolveComment}
                        onDelete={handleDeleteComment}
                        currentUserId={mockCurrentUser.id}
                      />
                    ))
                  )}
                </div>
              </div>
            )}

            {showHistory && (
              <VersionHistory
                history={history}
                currentVersion={3}
                onRestore={handleRestoreVersion}
                onPreview={handlePreviewVersion}
              />
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
