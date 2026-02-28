# Collaborative Editor Implementation Guide

## Recommended Stack

### Core Libraries
- **Editor Framework**: Tiptap (recommended) or Lexical
- **Collaboration Layer**: Yjs (CRDT implementation)
- **Network Provider**: WebSocket (y-websocket) or Liveblocks
- **State Management**: Zustand (for presence/UI state)

### Why This Stack?

**Tiptap over alternatives:**
- Built on battle-tested ProseMirror foundation
- Excellent Yjs integration out-of-the-box
- Headless architecture for full UI control
- Rich extension ecosystem
- Better TypeScript support than Slate
- More mature than Lexical (which is still pre-1.0)

**Yjs (CRDT) over Operational Transform:**
- No central server required for conflict resolution
- Clients can work offline and sync later
- Better scalability (can be distributed)
- Simpler implementation than OT
- Industry standard (used by Figma, Linear, Notion)

## Architecture Overview

```
┌─────────────┐
│   Tiptap    │ ← Rich text editing
│   Editor    │
└──────┬──────┘
       │
┌──────▼──────┐
│     Yjs     │ ← CRDT sync layer
│   Y.Doc     │
└──────┬──────┘
       │
┌──────▼──────┐
│  WebSocket  │ ← Network transport
│  Provider   │
└─────────────┘
```

## Installation

```bash
# Core dependencies
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-collaboration
npm install @tiptap/extension-collaboration-cursor yjs y-websocket

# State management
npm install zustand

# Optional: UI components
npm install @tiptap/extension-placeholder @tiptap/extension-text-align
```

## Implementation Examples

### 1. Basic Collaborative Editor Setup

```tsx
// components/CollaborativeEditor.tsx
'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { useEffect, useState } from 'react';

interface EditorProps {
  documentId: string;
  userName: string;
  userColor: string;
}

export default function CollaborativeEditor({ 
  documentId, 
  userName, 
  userColor 
}: EditorProps) {
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);

  useEffect(() => {
    // Initialize Yjs document
    const ydoc = new Y.Doc();
    
    // Connect to WebSocket server
    const wsProvider = new WebsocketProvider(
      'ws://localhost:1234', // Your WebSocket server
      documentId,
      ydoc
    );

    setProvider(wsProvider);

    return () => {
      wsProvider?.destroy();
      ydoc?.destroy();
    };
  }, [documentId]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false, // Disable local history (Yjs handles this)
      }),
      Collaboration.configure({
        document: provider?.document,
      }),
      CollaborationCursor.configure({
        provider: provider,
        user: {
          name: userName,
          color: userColor,
        },
      }),
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none',
      },
    },
  });

  if (!editor || !provider) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className="border rounded-lg p-4">
      <EditorContent editor={editor} />
    </div>
  );
}
```

### 2. Presence & Cursor Tracking

```tsx
// stores/presenceStore.ts
import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  color: string;
  cursor?: { x: number; y: number };
  selection?: { from: number; to: number };
}

interface PresenceStore {
  users: Map<string, User>;
  addUser: (user: User) => void;
  removeUser: (userId: string) => void;
  updateCursor: (userId: string, cursor: { x: number; y: number }) => void;
}

export const usePresenceStore = create<PresenceStore>((set) => ({
  users: new Map(),
  
  addUser: (user) =>
    set((state) => {
      const newUsers = new Map(state.users);
      newUsers.set(user.id, user);
      return { users: newUsers };
    }),
    
  removeUser: (userId) =>
    set((state) => {
      const newUsers = new Map(state.users);
      newUsers.delete(userId);
      return { users: newUsers };
    }),
    
  updateCursor: (userId, cursor) =>
    set((state) => {
      const newUsers = new Map(state.users);
      const user = newUsers.get(userId);
      if (user) {
        newUsers.set(userId, { ...user, cursor });
      }
      return { users: newUsers };
    }),
}));
```

```tsx
// components/PresenceIndicators.tsx
'use client';

import { usePresenceStore } from '@/stores/presenceStore';

export function PresenceIndicators() {
  const users = usePresenceStore((state) => state.users);

  return (
    <div className="flex items-center gap-2 p-2">
      <span className="text-sm text-gray-600">Active users:</span>
      <div className="flex -space-x-2">
        {Array.from(users.values()).map((user) => (
          <div
            key={user.id}
            className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-medium"
            style={{ backgroundColor: user.color }}
            title={user.name}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 3. WebSocket State Management

```tsx
// hooks/useWebSocketSync.ts
import { useEffect, useRef, useState } from 'react';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';

export function useWebSocketSync(documentId: string) {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);

  useEffect(() => {
    // Create Yjs document
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    // Create WebSocket provider
    const provider = new WebsocketProvider(
      process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:1234',
      documentId,
      ydoc,
      {
        connect: true,
        // Reconnect automatically
        maxBackoffTime: 5000,
      }
    );

    providerRef.current = provider;

    // Connection status handlers
    provider.on('status', (event: { status: string }) => {
      setStatus(event.status as any);
    });

    provider.on('sync', (isSynced: boolean) => {
      if (isSynced) {
        console.log('Document synced');
      }
    });

    // Cleanup
    return () => {
      provider?.destroy();
      ydoc?.destroy();
    };
  }, [documentId]);

  return {
    ydoc: ydocRef.current,
    provider: providerRef.current,
    status,
    isConnected: status === 'connected',
  };
}
```

### 4. Comment Threading UI

```tsx
// components/CommentThread.tsx
'use client';

import { useState } from 'react';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userColor: string;
  content: string;
  timestamp: Date;
  resolved: boolean;
}

interface CommentThreadProps {
  comments: Comment[];
  onAddComment: (content: string) => void;
  onResolve: () => void;
  position: { top: number; left: number };
}

export function CommentThread({ 
  comments, 
  onAddComment, 
  onResolve,
  position 
}: CommentThreadProps) {
  const [newComment, setNewComment] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment('');
    }
  };

  return (
    <div
      className="absolute w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
      style={{ top: position.top, left: position.left }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm font-medium"
        >
          {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
        </button>
        <button
          onClick={onResolve}
          className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
        >
          Resolve
        </button>
      </div>

      {/* Comments */}
      {isExpanded && (
        <div className="max-h-96 overflow-y-auto">
          <div className="p-3 space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-2">
                <div
                  className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-medium"
                  style={{ backgroundColor: comment.userColor }}
                >
                  {comment.userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium">{comment.userName}</span>
                    <span className="text-xs text-gray-500">
                      {comment.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Reply form */}
          <form onSubmit={handleSubmit} className="p-3 border-t">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a reply..."
              className="w-full text-sm border rounded p-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reply
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
```

### 5. Custom Toolbar with Formatting

```tsx
// components/EditorToolbar.tsx
'use client';

import { Editor } from '@tiptap/react';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered,
  Heading1,
  Heading2,
  Code,
  Quote
} from 'lucide-react';

interface ToolbarProps {
  editor: Editor | null;
}

export function EditorToolbar({ editor }: ToolbarProps) {
  if (!editor) return null;

  const ToolbarButton = ({ 
    onClick, 
    isActive, 
    icon: Icon, 
    label 
  }: any) => (
    <button
      onClick={onClick}
      className={`p-2 rounded hover:bg-gray-100 ${
        isActive ? 'bg-gray-200' : ''
      }`}
      title={label}
      type="button"
    >
      <Icon size={18} />
    </button>
  );

  return (
    <div className="border-b p-2 flex gap-1 flex-wrap">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        icon={Bold}
        label="Bold"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        icon={Italic}
        label="Italic"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive('heading', { level: 1 })}
        icon={Heading1}
        label="Heading 1"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
        icon={Heading2}
        label="Heading 2"
      />
      <div className="w-px bg-gray-300 mx-1" />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        icon={List}
        label="Bullet List"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        icon={ListOrdered}
        label="Numbered List"
      />
      <div className="w-px bg-gray-300 mx-1" />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive('codeBlock')}
        icon={Code}
        label="Code Block"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        icon={Quote}
        label="Quote"
      />
    </div>
  );
}
```

## Backend Setup (Node.js WebSocket Server)

```javascript
// server.js
const WebSocket = require('ws');
const http = require('http');
const { setupWSConnection } = require('y-websocket/bin/utils');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
  setupWSConnection(ws, req);
});

const PORT = process.env.PORT || 1234;
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});
```

```json
// package.json (backend)
{
  "dependencies": {
    "ws": "^8.14.2",
    "y-websocket": "^1.5.0",
    "yjs": "^13.6.8"
  }
}
```

## Performance Optimizations

### 1. Debounce Updates
```tsx
import { useDebouncedCallback } from 'use-debounce';

const debouncedUpdate = useDebouncedCallback(
  (content) => {
    // Save to database
    saveDocument(content);
  },
  2000 // 2 seconds
);

editor?.on('update', ({ editor }) => {
  debouncedUpdate(editor.getJSON());
});
```

### 2. Lazy Load Extensions
```tsx
const editor = useEditor({
  extensions: [
    StarterKit,
    // Load heavy extensions only when needed
    ...(needsCodeHighlight ? [CodeBlockLowlight] : []),
    ...(needsImages ? [Image] : []),
  ],
});
```

### 3. Virtual Scrolling for Large Documents
```tsx
// Use react-window for large documents
import { FixedSizeList } from 'react-window';

// Split document into chunks and render visible portions only
```

### 4. Optimize Yjs Updates
```tsx
// Batch updates together
ydoc.transact(() => {
  ytext.insert(0, 'Hello ');
  ytext.insert(6, 'World');
  // Both operations sent as single update
});
```

## Best Practices

### Security
- Validate all user input on the server
- Implement authentication before allowing WebSocket connections
- Use WSS (WebSocket Secure) in production
- Rate limit connections and updates
- Sanitize HTML output from editor

### Conflict Resolution
- Yjs handles conflicts automatically via CRDT
- No manual conflict resolution needed
- Last-write-wins for metadata (like document title)
- Use awareness protocol for presence data

### Offline Support
```tsx
// Store updates locally when offline
import { IndexeddbPersistence } from 'y-indexeddb';

const indexeddbProvider = new IndexeddbPersistence(documentId, ydoc);

// Syncs automatically when back online
```

### Error Handling
```tsx
provider.on('connection-error', (error) => {
  console.error('Connection failed:', error);
  // Show user-friendly error message
  toast.error('Connection lost. Retrying...');
});

provider.on('connection-close', () => {
  // Attempt reconnection
  setTimeout(() => provider.connect(), 1000);
});
```

## Testing Strategy

### Unit Tests
```tsx
import { render, screen } from '@testing-library/react';
import { EditorContent, useEditor } from '@tiptap/react';

test('editor renders with initial content', () => {
  const editor = useEditor({
    content: '<p>Hello World</p>',
    extensions: [StarterKit],
  });
  
  render(<EditorContent editor={editor} />);
  expect(screen.getByText('Hello World')).toBeInTheDocument();
});
```

### Integration Tests
- Test WebSocket connection/disconnection
- Test concurrent edits from multiple clients
- Test presence updates
- Test comment threading

### Load Testing
- Use tools like Artillery or k6
- Test with 100+ concurrent users
- Monitor memory usage and CPU
- Test reconnection scenarios

## Alternative: Using Liveblocks (Managed Service)

If you prefer a managed solution instead of self-hosting:

```tsx
// app/providers.tsx
import { LiveblocksProvider } from '@liveblocks/react';

export function Providers({ children }) {
  return (
    <LiveblocksProvider publicApiKey="pk_prod_...">
      {children}
    </LiveblocksProvider>
  );
}
```

```tsx
// components/Editor.tsx
import { useRoom } from '@liveblocks/react';
import { LiveblocksYjsProvider } from '@liveblocks/yjs';

export function Editor() {
  const room = useRoom();
  const [provider, setProvider] = useState<LiveblocksYjsProvider | null>(null);

  useEffect(() => {
    const yDoc = new Y.Doc();
    const yProvider = new LiveblocksYjsProvider(room, yDoc);
    setProvider(yProvider);

    return () => {
      yProvider?.destroy();
      yDoc?.destroy();
    };
  }, [room]);

  // Rest of editor setup...
}
```

**Liveblocks Benefits:**
- No infrastructure management
- Built-in presence and comments
- Automatic scaling
- Generous free tier
- Better DX with React hooks

## Resources

- [Tiptap Documentation](https://tiptap.dev)
- [Yjs Documentation](https://docs.yjs.dev)
- [Liveblocks Guides](https://liveblocks.io/docs)
- [ProseMirror Guide](https://prosemirror.net/docs/guide/)
- [CRDT Explained](https://crdt.tech)

## Next Steps

1. Set up basic Tiptap editor with Yjs
2. Implement WebSocket server or use Liveblocks
3. Add presence indicators
4. Build comment threading system
5. Add offline support with IndexedDB
6. Implement autosave
7. Add version history
8. Performance testing and optimization
