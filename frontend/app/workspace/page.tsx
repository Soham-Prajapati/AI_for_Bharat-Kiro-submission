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
  const [lastEditedTime, setLastEditedTime] = useState('--:--:--');
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

  useEffect(() => {
    setLastEditedTime(new Date().toLocaleTimeString());
  }, []);

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
    <div className="h-screen flex flex-col bg-[#030712] transition-colors">
      {/* Header */}
      <header className="bg-[#0A0E1A] border-b border-white/[0.07] px-6 py-3 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            {isEditingName ? (
              <input
                type="text"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                className="text-xl font-bold bg-transparent border-b-2 border-brand-500 focus:outline-none text-white"
                autoFocus
              />
            ) : (
              <h1
                className="text-xl font-bold text-white cursor-pointer hover:text-brand-300 transition-colors font-display"
                onClick={() => setIsEditingName(true)}
              >
                {documentName}
              </h1>
            )}
            <span className="text-xs font-mono text-white/30">
              Last edited {lastEditedTime}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <UserPresence activeUsers={activeUsers} />

            <div className="flex items-center gap-2 border-l border-white/[0.07] pl-4">
              <button
                onClick={() => {
                  setShowComments(!showComments);
                  if (showHistory) setShowHistory(false);
                }}
                className={`p-2 rounded-lg transition-colors ${
                  showComments
                    ? 'bg-brand-500/20 text-brand-400'
                    : 'hover:bg-white/[0.05] text-white/50 hover:text-white'
                }`}
                title="Comments"
                aria-label="Toggle comments"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </button>

              <button
                onClick={() => {
                  setShowHistory(!showHistory);
                  if (showComments) setShowComments(false);
                }}
                className={`p-2 rounded-lg transition-colors ${
                  showHistory
                    ? 'bg-brand-500/20 text-brand-400'
                    : 'hover:bg-white/[0.05] text-white/50 hover:text-white'
                }`}
                title="Version History"
                aria-label="Toggle version history"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>

              <button
                className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition-colors font-semibold text-sm"
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
          <aside className="w-80 border-l border-white/[0.07] bg-[#0A0E1A] overflow-hidden transition-colors">
            {showComments && (
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-white/[0.07]">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-bold text-white font-display">Comments</h2>
                    <button
                      onClick={handleAddComment}
                      className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      + Add
                    </button>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <button className="px-3 py-1 bg-brand-500/10 text-brand-400 rounded-lg font-mono font-semibold">
                      All ({comments.length})
                    </button>
                    <button className="px-3 py-1 text-white/40 hover:bg-white/[0.05] hover:text-white rounded-lg transition-colors font-mono">
                      Open ({comments.filter((c) => !c.resolved).length})
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {comments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="text-4xl mb-4 opacity-20">💬</div>
                      <p className="text-white/40 text-sm">No comments yet</p>
                      <p className="text-xs text-white/20 mt-1">Start a conversation</p>
                    </div>
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
