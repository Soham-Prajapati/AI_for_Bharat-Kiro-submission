# Workspace Integration Guide

This guide explains how to integrate the collaborative workspace with your backend and add real-time functionality.

## Table of Contents

1. [WebSocket Integration](#websocket-integration)
2. [Backend API Setup](#backend-api-setup)
3. [Authentication](#authentication)
4. [Real-time Events](#real-time-events)
5. [State Management](#state-management)
6. [Error Handling](#error-handling)

## WebSocket Integration

### 1. Install Socket.IO Client

```bash
npm install socket.io-client
```

### 2. Create WebSocket Hook

Create `frontend/hooks/useWorkspaceSocket.ts`:

```typescript
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { UserPresence, EditorChange, Comment } from '@/types/workspace';

export function useWorkspaceSocket(workspaceId: string, userId: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001', {
      query: { workspaceId, userId },
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to workspace');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from workspace');
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [workspaceId, userId]);

  return { socket, isConnected };
}
```

### 3. Update Workspace Page

```typescript
'use client';

import { useWorkspaceSocket } from '@/hooks/useWorkspaceSocket';

export default function WorkspacePage() {
  const { socket, isConnected } = useWorkspaceSocket('workspace-1', 'user-1');

  useEffect(() => {
    if (!socket) return;

    // Listen for content changes
    socket.on('content-update', (data: { content: string; userId: string }) => {
      if (data.userId !== currentUserId) {
        setContent(data.content);
      }
    });

    // Listen for cursor updates
    socket.on('cursor-update', (data: UserPresence) => {
      setActiveUsers((users) =>
        users.map((u) => (u.userId === data.userId ? data : u))
      );
    });

    // Listen for new comments
    socket.on('comment-added', (comment: Comment) => {
      setComments((prev) => [...prev, comment]);
    });

    return () => {
      socket.off('content-update');
      socket.off('cursor-update');
      socket.off('comment-added');
    };
  }, [socket]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    socket?.emit('content-change', {
      workspaceId: 'workspace-1',
      content: newContent,
      userId: currentUserId,
    });
  };

  // ... rest of component
}
```

## Backend API Setup

### 1. Workspace Routes

Create `src/routes/workspace.ts`:

```typescript
import express from 'express';
import { WorkspaceController } from '../controllers/workspace';

const router = express.Router();
const controller = new WorkspaceController();

// Get workspace
router.get('/:id', controller.getWorkspace);

// Update workspace
router.put('/:id', controller.updateWorkspace);

// Add comment
router.post('/:id/comments', controller.addComment);

// Reply to comment
router.post('/:id/comments/:commentId/replies', controller.addReply);

// Resolve comment
router.put('/:id/comments/:commentId/resolve', controller.resolveComment);

// Delete comment
router.delete('/:id/comments/:commentId', controller.deleteComment);

// Get version history
router.get('/:id/history', controller.getHistory);

// Restore version
router.post('/:id/restore/:versionId', controller.restoreVersion);

export default router;
```

### 2. Workspace Controller

Create `src/controllers/workspace.ts`:

```typescript
import { Request, Response } from 'express';
import { WorkspaceService } from '../services/workspace';

export class WorkspaceController {
  private service = new WorkspaceService();

  async getWorkspace(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const workspace = await this.service.getWorkspace(id);
      res.json({ success: true, data: workspace });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async updateWorkspace(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { content, userId } = req.body;
      const workspace = await this.service.updateWorkspace(id, content, userId);
      res.json({ success: true, data: workspace });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async addComment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { content, position, userId } = req.body;
      const comment = await this.service.addComment(id, {
        content,
        position,
        userId,
      });
      res.json({ success: true, data: comment });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // ... other methods
}
```

### 3. WebSocket Server

Create `src/websocket/workspace.ts`:

```typescript
import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

export function setupWorkspaceSocket(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  // Track active users per workspace
  const workspaceUsers = new Map<string, Set<string>>();

  io.on('connection', (socket) => {
    const { workspaceId, userId } = socket.handshake.query;

    console.log(`User ${userId} connected to workspace ${workspaceId}`);

    // Join workspace room
    socket.join(workspaceId as string);

    // Track user
    if (!workspaceUsers.has(workspaceId as string)) {
      workspaceUsers.set(workspaceId as string, new Set());
    }
    workspaceUsers.get(workspaceId as string)?.add(userId as string);

    // Broadcast user joined
    socket.to(workspaceId as string).emit('user-joined', {
      userId,
      timestamp: new Date(),
    });

    // Handle content changes
    socket.on('content-change', (data) => {
      socket.to(workspaceId as string).emit('content-update', data);
    });

    // Handle cursor movements
    socket.on('cursor-move', (data) => {
      socket.to(workspaceId as string).emit('cursor-update', data);
    });

    // Handle typing indicators
    socket.on('typing-start', (data) => {
      socket.to(workspaceId as string).emit('user-typing', {
        userId: data.userId,
        isTyping: true,
      });
    });

    socket.on('typing-stop', (data) => {
      socket.to(workspaceId as string).emit('user-typing', {
        userId: data.userId,
        isTyping: false,
      });
    });

    // Handle comments
    socket.on('comment-add', (data) => {
      socket.to(workspaceId as string).emit('comment-added', data);
    });

    socket.on('comment-resolve', (data) => {
      socket.to(workspaceId as string).emit('comment-resolved', data);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected from workspace ${workspaceId}`);
      workspaceUsers.get(workspaceId as string)?.delete(userId as string);
      socket.to(workspaceId as string).emit('user-left', {
        userId,
        timestamp: new Date(),
      });
    });
  });

  return io;
}
```

## Authentication

### 1. Add Auth Middleware

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
}
```

### 2. Protect Routes

```typescript
import { authenticateToken } from '../middleware/auth';

router.get('/:id', authenticateToken, controller.getWorkspace);
router.put('/:id', authenticateToken, controller.updateWorkspace);
// ... other routes
```

## Real-time Events

### Event Types

#### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `content-change` | `{ workspaceId, content, userId }` | User edited content |
| `cursor-move` | `{ workspaceId, userId, position }` | User moved cursor |
| `typing-start` | `{ workspaceId, userId }` | User started typing |
| `typing-stop` | `{ workspaceId, userId }` | User stopped typing |
| `comment-add` | `{ workspaceId, comment }` | User added comment |
| `comment-resolve` | `{ workspaceId, commentId }` | User resolved comment |

#### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `content-update` | `{ content, userId }` | Content was updated |
| `cursor-update` | `{ userId, position }` | Cursor position changed |
| `user-typing` | `{ userId, isTyping }` | Typing status changed |
| `comment-added` | `{ comment }` | New comment added |
| `comment-resolved` | `{ commentId }` | Comment was resolved |
| `user-joined` | `{ userId, timestamp }` | User joined workspace |
| `user-left` | `{ userId, timestamp }` | User left workspace |

## State Management

### Using Context API

Create `frontend/context/WorkspaceContext.tsx`:

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { WorkspaceDocument, UserPresence, Comment } from '@/types/workspace';
import { useWorkspaceSocket } from '@/hooks/useWorkspaceSocket';

interface WorkspaceContextType {
  workspace: WorkspaceDocument | null;
  activeUsers: UserPresence[];
  comments: Comment[];
  updateContent: (content: string) => void;
  addComment: (comment: Comment) => void;
  resolveComment: (commentId: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({
  children,
  workspaceId,
  userId,
}: {
  children: React.ReactNode;
  workspaceId: string;
  userId: string;
}) {
  const [workspace, setWorkspace] = useState<WorkspaceDocument | null>(null);
  const [activeUsers, setActiveUsers] = useState<UserPresence[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const { socket } = useWorkspaceSocket(workspaceId, userId);

  // ... implement methods and socket listeners

  return (
    <WorkspaceContext.Provider
      value={{
        workspace,
        activeUsers,
        comments,
        updateContent,
        addComment,
        resolveComment,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within WorkspaceProvider');
  }
  return context;
}
```

## Error Handling

### 1. Connection Errors

```typescript
socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
  // Show user-friendly error message
  toast.error('Failed to connect to workspace. Retrying...');
});

socket.on('reconnect', (attemptNumber) => {
  console.log('Reconnected after', attemptNumber, 'attempts');
  toast.success('Reconnected to workspace');
});
```

### 2. API Errors

```typescript
async function updateWorkspace(id: string, content: string) {
  try {
    const response = await fetch(`/api/workspace/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error('Failed to update workspace');
    }

    return await response.json();
  } catch (error) {
    console.error('Update error:', error);
    toast.error('Failed to save changes. Please try again.');
    throw error;
  }
}
```

### 3. Conflict Resolution

```typescript
// Implement operational transformation or CRDT for conflict resolution
function resolveConflict(localContent: string, remoteContent: string) {
  // Simple last-write-wins strategy
  // For production, use proper OT or CRDT library
  return remoteContent;
}
```

## Performance Optimization

### 1. Debounce Content Updates

```typescript
import { debounce } from 'lodash';

const debouncedUpdate = debounce((content: string) => {
  socket?.emit('content-change', {
    workspaceId,
    content,
    userId,
  });
}, 500);

const handleContentChange = (newContent: string) => {
  setContent(newContent);
  debouncedUpdate(newContent);
};
```

### 2. Throttle Cursor Updates

```typescript
import { throttle } from 'lodash';

const throttledCursorUpdate = throttle((position) => {
  socket?.emit('cursor-move', {
    workspaceId,
    userId,
    position,
  });
}, 100);
```

## Testing

### 1. Unit Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import Editor from '@/components/workspace/Editor';

describe('Editor', () => {
  it('updates content on change', () => {
    const onChange = jest.fn();
    render(
      <Editor
        content=""
        onChange={onChange}
        activeUsers={[]}
        onCursorMove={() => {}}
      />
    );

    const textarea = screen.getByPlaceholderText('Start typing...');
    fireEvent.change(textarea, { target: { value: 'Hello' } });

    expect(onChange).toHaveBeenCalledWith('Hello');
  });
});
```

### 2. Integration Tests

```typescript
import { io } from 'socket.io-client';

describe('Workspace WebSocket', () => {
  let socket;

  beforeEach(() => {
    socket = io('http://localhost:3001', {
      query: { workspaceId: 'test-1', userId: 'user-1' },
    });
  });

  afterEach(() => {
    socket.close();
  });

  it('broadcasts content changes', (done) => {
    socket.emit('content-change', {
      workspaceId: 'test-1',
      content: 'Test content',
      userId: 'user-1',
    });

    socket.on('content-update', (data) => {
      expect(data.content).toBe('Test content');
      done();
    });
  });
});
```

## Deployment

### Environment Variables

```env
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=https://api.yourapp.com
NEXT_PUBLIC_WS_URL=wss://ws.yourapp.com

# Backend (.env)
PORT=3001
JWT_SECRET=your-secret-key
DATABASE_URL=postgresql://...
FRONTEND_URL=https://yourapp.com
```

### Production Checklist

- [ ] Enable HTTPS/WSS
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable compression
- [ ] Configure CDN for static assets
- [ ] Set up monitoring and logging
- [ ] Implement backup strategy
- [ ] Test failover scenarios
- [ ] Configure auto-scaling
- [ ] Set up health checks

## Support

For issues or questions, please refer to:
- Main README: `frontend/app/workspace/README.md`
- API Documentation: `/docs/api`
- WebSocket Events: This guide, section "Real-time Events"
