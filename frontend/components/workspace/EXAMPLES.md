# Workspace Components - Usage Examples

This document provides practical examples of how to use each workspace component.

## Table of Contents

1. [Editor Component](#editor-component)
2. [UserPresence Component](#userpresence-component)
3. [CommentThread Component](#commentthread-component)
4. [VersionHistory Component](#versionhistory-component)
5. [Complete Integration](#complete-integration)

## Editor Component

### Basic Usage

```tsx
import Editor from '@/components/workspace/Editor';
import { useState } from 'react';

function MyWorkspace() {
  const [content, setContent] = useState('');
  const [activeUsers, setActiveUsers] = useState([]);

  const handleCursorMove = (position) => {
    console.log('Cursor at:', position);
    // Broadcast to other users via WebSocket
  };

  return (
    <Editor
      content={content}
      onChange={setContent}
      activeUsers={activeUsers}
      onCursorMove={handleCursorMove}
    />
  );
}
```

### Read-Only Mode

```tsx
<Editor
  content={content}
  onChange={() => {}}
  activeUsers={[]}
  onCursorMove={() => {}}
  readOnly={true}
/>
```

### With Real-time Collaboration

```tsx
import { useEffect } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';

function CollaborativeEditor() {
  const [content, setContent] = useState('');
  const { socket } = useWebSocket('ws://localhost:3001');

  useEffect(() => {
    if (!socket) return;

    socket.on('content-update', (data) => {
      setContent(data.content);
    });

    return () => {
      socket.off('content-update');
    };
  }, [socket]);

  const handleChange = (newContent) => {
    setContent(newContent);
    socket?.emit('content-change', {
      content: newContent,
      userId: 'current-user-id',
    });
  };

  return (
    <Editor
      content={content}
      onChange={handleChange}
      activeUsers={activeUsers}
      onCursorMove={handleCursorMove}
    />
  );
}
```

## UserPresence Component

### Basic Usage

```tsx
import UserPresence from '@/components/workspace/UserPresence';

const activeUsers = [
  {
    userId: 'user-1',
    user: {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      color: '#3B82F6',
    },
    isTyping: false,
    lastActive: new Date(),
  },
  {
    userId: 'user-2',
    user: {
      id: 'user-2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      color: '#10B981',
      avatar: 'https://example.com/avatar.jpg',
    },
    isTyping: true,
    lastActive: new Date(),
  },
];

function Header() {
  return (
    <div className="flex items-center justify-between p-4">
      <h1>My Document</h1>
      <UserPresence activeUsers={activeUsers} />
    </div>
  );
}
```

### Custom Max Visible Users

```tsx
<UserPresence activeUsers={activeUsers} maxVisible={3} />
```

### With Real-time Updates

```tsx
function LiveUserPresence() {
  const [activeUsers, setActiveUsers] = useState([]);
  const { socket } = useWebSocket('ws://localhost:3001');

  useEffect(() => {
    if (!socket) return;

    socket.on('user-joined', (user) => {
      setActiveUsers((prev) => [...prev, user]);
    });

    socket.on('user-left', (userId) => {
      setActiveUsers((prev) => prev.filter((u) => u.userId !== userId));
    });

    socket.on('user-typing', ({ userId, isTyping }) => {
      setActiveUsers((prev) =>
        prev.map((u) => (u.userId === userId ? { ...u, isTyping } : u))
      );
    });

    return () => {
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('user-typing');
    };
  }, [socket]);

  return <UserPresence activeUsers={activeUsers} />;
}
```

## CommentThread Component

### Basic Usage

```tsx
import CommentThread from '@/components/workspace/CommentThread';

const comment = {
  id: 'comment-1',
  workspaceId: 'workspace-1',
  userId: 'user-1',
  user: {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    color: '#3B82F6',
  },
  content: 'This section needs more detail.',
  position: { line: 10, column: 0 },
  resolved: false,
  replies: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

function CommentsSidebar() {
  const handleReply = (commentId, content) => {
    console.log('Reply to', commentId, ':', content);
    // Add reply via API
  };

  const handleResolve = (commentId) => {
    console.log('Resolve', commentId);
    // Mark as resolved via API
  };

  const handleDelete = (commentId) => {
    console.log('Delete', commentId);
    // Delete via API
  };

  return (
    <CommentThread
      comment={comment}
      onReply={handleReply}
      onResolve={handleResolve}
      onDelete={handleDelete}
      currentUserId="user-1"
    />
  );
}
```

### Multiple Comments

```tsx
function CommentsList() {
  const [comments, setComments] = useState([]);

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentThread
          key={comment.id}
          comment={comment}
          onReply={handleReply}
          onResolve={handleResolve}
          onDelete={handleDelete}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
}
```

### With API Integration

```tsx
import { useState } from 'react';

function CommentsWithAPI() {
  const [comments, setComments] = useState([]);

  const handleReply = async (commentId, content) => {
    try {
      const response = await fetch(
        `/api/workspace/${workspaceId}/comments/${commentId}/replies`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, userId: currentUserId }),
        }
      );

      const { data } = await response.json();

      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? { ...comment, replies: [...comment.replies, data] }
            : comment
        )
      );
    } catch (error) {
      console.error('Failed to add reply:', error);
    }
  };

  const handleResolve = async (commentId) => {
    try {
      await fetch(
        `/api/workspace/${workspaceId}/comments/${commentId}/resolve`,
        { method: 'PUT' }
      );

      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId ? { ...comment, resolved: true } : comment
        )
      );
    } catch (error) {
      console.error('Failed to resolve comment:', error);
    }
  };

  return (
    <div>
      {comments.map((comment) => (
        <CommentThread
          key={comment.id}
          comment={comment}
          onReply={handleReply}
          onResolve={handleResolve}
          onDelete={handleDelete}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
}
```

## VersionHistory Component

### Basic Usage

```tsx
import VersionHistory from '@/components/workspace/VersionHistory';

const history = [
  {
    id: 'version-3',
    workspaceId: 'workspace-1',
    version: 3,
    userId: 'user-1',
    user: {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      color: '#3B82F6',
    },
    changes: 'Updated introduction',
    content: '...',
    timestamp: new Date(),
  },
  // ... more versions
];

function Sidebar() {
  const handleRestore = (versionId) => {
    console.log('Restore version:', versionId);
    // Restore via API
  };

  const handlePreview = (versionId) => {
    console.log('Preview version:', versionId);
    // Show preview modal
  };

  return (
    <VersionHistory
      history={history}
      currentVersion={3}
      onRestore={handleRestore}
      onPreview={handlePreview}
    />
  );
}
```

### With API Integration

```tsx
import { useState, useEffect } from 'react';

function VersionHistoryWithAPI({ workspaceId }) {
  const [history, setHistory] = useState([]);
  const [currentVersion, setCurrentVersion] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [workspaceId]);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`/api/workspace/${workspaceId}/history`);
      const { data } = await response.json();
      setHistory(data.history);
      setCurrentVersion(data.currentVersion);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (versionId) => {
    try {
      const response = await fetch(
        `/api/workspace/${workspaceId}/restore/${versionId}`,
        { method: 'POST' }
      );

      const { data } = await response.json();
      setCurrentVersion(data.version);
      // Update content in editor
      onContentRestore(data.content);
    } catch (error) {
      console.error('Failed to restore version:', error);
    }
  };

  const handlePreview = async (versionId) => {
    try {
      const response = await fetch(
        `/api/workspace/${workspaceId}/history/${versionId}`
      );
      const { data } = await response.json();
      // Show preview modal
      showPreviewModal(data.content);
    } catch (error) {
      console.error('Failed to preview version:', error);
    }
  };

  if (loading) {
    return <div>Loading history...</div>;
  }

  return (
    <VersionHistory
      history={history}
      currentVersion={currentVersion}
      onRestore={handleRestore}
      onPreview={handlePreview}
    />
  );
}
```

### With Preview Modal

```tsx
import { useState } from 'react';

function VersionHistoryWithPreview() {
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState('');

  const handlePreview = async (versionId) => {
    const version = history.find((v) => v.id === versionId);
    if (version) {
      setPreviewContent(version.content);
      setShowPreview(true);
    }
  };

  return (
    <>
      <VersionHistory
        history={history}
        currentVersion={currentVersion}
        onRestore={handleRestore}
        onPreview={handlePreview}
      />

      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Version Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="prose dark:prose-invert">
              <pre className="whitespace-pre-wrap">{previewContent}</pre>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

## Complete Integration

### Full Workspace Page Example

```tsx
'use client';

import { useState, useEffect } from 'react';
import Editor from '@/components/workspace/Editor';
import UserPresence from '@/components/workspace/UserPresence';
import CommentThread from '@/components/workspace/CommentThread';
import VersionHistory from '@/components/workspace/VersionHistory';
import { useWebSocket } from '@/hooks/useWebSocket';

export default function WorkspacePage({ params }) {
  const { workspaceId } = params;
  const [content, setContent] = useState('');
  const [activeUsers, setActiveUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [history, setHistory] = useState([]);
  const [currentVersion, setCurrentVersion] = useState(1);
  const [showComments, setShowComments] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  const { socket, isConnected } = useWebSocket(
    `ws://localhost:3001?workspaceId=${workspaceId}`
  );

  // Load initial data
  useEffect(() => {
    loadWorkspace();
    loadComments();
    loadHistory();
  }, [workspaceId]);

  // Set up WebSocket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('content-update', (data) => {
      setContent(data.content);
    });

    socket.on('user-joined', (user) => {
      setActiveUsers((prev) => [...prev, user]);
    });

    socket.on('user-left', (userId) => {
      setActiveUsers((prev) => prev.filter((u) => u.userId !== userId));
    });

    socket.on('comment-added', (comment) => {
      setComments((prev) => [...prev, comment]);
    });

    return () => {
      socket.off('content-update');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('comment-added');
    };
  }, [socket]);

  const loadWorkspace = async () => {
    const response = await fetch(`/api/workspace/${workspaceId}`);
    const { data } = await response.json();
    setContent(data.content);
    setCurrentVersion(data.version);
  };

  const loadComments = async () => {
    const response = await fetch(`/api/workspace/${workspaceId}/comments`);
    const { data } = await response.json();
    setComments(data);
  };

  const loadHistory = async () => {
    const response = await fetch(`/api/workspace/${workspaceId}/history`);
    const { data } = await response.json();
    setHistory(data);
  };

  const handleContentChange = (newContent) => {
    setContent(newContent);
    socket?.emit('content-change', {
      workspaceId,
      content: newContent,
      userId: 'current-user-id',
    });
  };

  const handleCursorMove = (position) => {
    socket?.emit('cursor-move', {
      workspaceId,
      userId: 'current-user-id',
      position,
    });
  };

  const handleReply = async (commentId, replyContent) => {
    const response = await fetch(
      `/api/workspace/${workspaceId}/comments/${commentId}/replies`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyContent }),
      }
    );
    const { data } = await response.json();
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId ? { ...c, replies: [...c.replies, data] } : c
      )
    );
  };

  const handleResolveComment = async (commentId) => {
    await fetch(`/api/workspace/${workspaceId}/comments/${commentId}/resolve`, {
      method: 'PUT',
    });
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, resolved: true } : c))
    );
  };

  const handleDeleteComment = async (commentId) => {
    await fetch(`/api/workspace/${workspaceId}/comments/${commentId}`, {
      method: 'DELETE',
    });
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  const handleRestoreVersion = async (versionId) => {
    const response = await fetch(
      `/api/workspace/${workspaceId}/restore/${versionId}`,
      { method: 'POST' }
    );
    const { data } = await response.json();
    setContent(data.content);
    setCurrentVersion(data.version);
  };

  const handlePreviewVersion = (versionId) => {
    // Show preview modal
    console.log('Preview version:', versionId);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">My Workspace</h1>
          <div className="flex items-center gap-4">
            <UserPresence activeUsers={activeUsers} />
            <button
              onClick={() => setShowComments(!showComments)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              Comments
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              History
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1">
          <Editor
            content={content}
            onChange={handleContentChange}
            activeUsers={activeUsers}
            onCursorMove={handleCursorMove}
          />
        </main>

        {/* Sidebar */}
        {(showComments || showHistory) && (
          <aside className="w-80 border-l overflow-auto">
            {showComments && (
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-4">Comments</h2>
                {comments.map((comment) => (
                  <CommentThread
                    key={comment.id}
                    comment={comment}
                    onReply={handleReply}
                    onResolve={handleResolveComment}
                    onDelete={handleDeleteComment}
                    currentUserId="current-user-id"
                  />
                ))}
              </div>
            )}

            {showHistory && (
              <VersionHistory
                history={history}
                currentVersion={currentVersion}
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
```

## Tips and Best Practices

### 1. Debounce Content Updates

```tsx
import { debounce } from 'lodash';

const debouncedUpdate = debounce((content) => {
  socket?.emit('content-change', { content });
}, 500);
```

### 2. Optimistic UI Updates

```tsx
const handleAddComment = async (comment) => {
  // Add immediately to UI
  setComments((prev) => [...prev, comment]);

  try {
    // Send to server
    await api.addComment(comment);
  } catch (error) {
    // Rollback on error
    setComments((prev) => prev.filter((c) => c.id !== comment.id));
    toast.error('Failed to add comment');
  }
};
```

### 3. Handle Disconnections

```tsx
useEffect(() => {
  if (!socket) return;

  socket.on('disconnect', () => {
    toast.warning('Connection lost. Reconnecting...');
  });

  socket.on('reconnect', () => {
    toast.success('Reconnected!');
    // Reload data
    loadWorkspace();
  });
}, [socket]);
```

### 4. Keyboard Shortcuts

```tsx
useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 's') {
        e.preventDefault();
        saveWorkspace();
      } else if (e.key === 'k') {
        e.preventDefault();
        setShowComments(!showComments);
      }
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

### 5. Auto-save Indicator

```tsx
const [saveStatus, setSaveStatus] = useState('saved');

useEffect(() => {
  if (content) {
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      saveWorkspace();
      setSaveStatus('saved');
    }, 1000);
    return () => clearTimeout(timer);
  }
}, [content]);

return (
  <div className="text-sm text-gray-500">
    {saveStatus === 'saving' ? '💾 Saving...' : '✓ Saved'}
  </div>
);
```
