# Workspace Collaboration Architecture

## Overview

This document describes the technical architecture for real-time collaborative editing in the workspace feature. The implementation uses WebSocket connections, Operational Transform (OT) for conflict resolution, and optimistic UI updates for a seamless collaborative experience.

## Architecture Components

### 1. Type System (`types/workspace.ts`)

Comprehensive TypeScript interfaces for:
- **Core Workspace Types**: Workspace data structures and metadata
- **Collaboration Types**: User presence, cursors, and selections
- **Operational Transform**: Operation types and transformation logic
- **WebSocket Messages**: Strongly-typed message protocol
- **State Management**: Collaboration state and conflict resolution
- **Configuration**: Customizable behavior settings

### 2. WebSocket Connection (`hooks/useWorkspace.ts`)

Manages the WebSocket lifecycle and workspace synchronization:

#### Features
- **Automatic Connection Management**: Connects on mount, reconnects on disconnect
- **Heartbeat Mechanism**: Keeps connection alive with periodic pings
- **Message Routing**: Routes incoming messages to appropriate handlers
- **State Synchronization**: Syncs workspace state on connection
- **User Presence**: Tracks active users in the workspace
- **Event System**: Emits events for workspace changes

#### Configuration
```typescript
{
  reconnectAttempts: 5,        // Max reconnection attempts
  reconnectInterval: 3000,     // Delay between reconnects (ms)
  heartbeatInterval: 30000,    // Heartbeat frequency (ms)
}
```

#### Usage Example
```typescript
const {
  workspace,
  users,
  isConnected,
  isSyncing,
  error,
  version,
  sendMessage,
  reconnect,
  disconnect,
} = useWorkspace({
  workspaceId: 'workspace-123',
  userId: 'user-456',
  user: {
    id: 'user-456',
    name: 'John Doe',
    email: 'john@example.com',
    color: '#FF6B6B',
    isActive: true,
    lastSeen: Date.now(),
  },
  onEvent: (event) => {
    console.log('Workspace event:', event);
  },
});
```

### 3. Collaborative Editing (`hooks/useCollaboration.ts`)

Implements real-time editing with Operational Transform:

#### Features
- **Operational Transform**: Resolves concurrent edits without conflicts
- **Optimistic Updates**: Applies local changes immediately
- **Operation Batching**: Batches multiple operations for efficiency
- **Cursor Tracking**: Real-time cursor position synchronization
- **Selection Sharing**: Shows other users' text selections
- **Undo/Redo**: Full history management with undo/redo support
- **Conflict Resolution**: Automatic conflict resolution using OT

#### Configuration
```typescript
{
  operationBatchSize: 10,      // Max operations per batch
  operationBatchDelay: 100,    // Batch delay (ms)
  cursorUpdateThrottle: 50,    // Cursor update throttle (ms)
  presenceUpdateInterval: 5000, // Presence update frequency (ms)
  maxHistorySize: 1000,        // Max undo/redo history
}
```

#### Usage Example
```typescript
const {
  content,
  cursors,
  selections,
  presences,
  applyOperation,
  updateCursor,
  updateSelection,
  clearSelection,
  undo,
  redo,
  canUndo,
  canRedo,
} = useCollaboration({
  workspaceId: 'workspace-123',
  userId: 'user-456',
  initialContent: 'Hello, world!',
  onContentChange: (newContent) => {
    console.log('Content changed:', newContent);
  },
  onCursorChange: (cursors) => {
    console.log('Cursors updated:', cursors);
  },
});

// Apply an insert operation
applyOperation({
  type: 'insert',
  position: 5,
  content: ' beautiful',
});

// Update cursor position
updateCursor(1, 10);

// Update selection
updateSelection({ line: 0, column: 0 }, { line: 0, column: 5 });
```

## Operational Transform Algorithm

### Operation Types

1. **Insert**: Add text at a position
   ```typescript
   { type: 'insert', position: 5, content: 'text' }
   ```

2. **Delete**: Remove text from a position
   ```typescript
   { type: 'delete', position: 5, length: 4 }
   ```

3. **Retain**: Keep text unchanged (used for cursor positioning)
   ```typescript
   { type: 'retain', position: 5, length: 10 }
   ```

### Transformation Rules

The OT algorithm transforms concurrent operations to maintain consistency:

#### Insert vs Insert
- If positions differ: Adjust position of later operation
- If same position: Use userId to break tie deterministically

#### Insert vs Delete
- Adjust positions based on operation order
- Handle overlapping ranges

#### Delete vs Delete
- Merge overlapping deletes
- Adjust positions for non-overlapping deletes

### Example Transformation

```typescript
// User A inserts "hello" at position 5
const opA = { type: 'insert', position: 5, content: 'hello', userId: 'A' };

// User B inserts "world" at position 5 (concurrent)
const opB = { type: 'insert', position: 5, content: 'world', userId: 'B' };

// Transform: opB is adjusted to position 10 (after opA's insert)
const transformed = transformOperations(opA, opB);
// Result: { type: 'insert', position: 10, content: 'world', userId: 'B' }
```

## WebSocket Protocol

### Connection URL
```
ws://host/ws/workspace/:workspaceId
```

### Message Format
```typescript
{
  type: 'workspace:operation',
  workspaceId: 'workspace-123',
  userId: 'user-456',
  data: { operation: {...}, version: 5 },
  timestamp: 1234567890,
  messageId: 'user-456-1234567890-0.123'
}
```

### Message Types

#### Client → Server

1. **workspace:join** - Join workspace
   ```typescript
   { workspaceId, userId, user: CollaborativeUser }
   ```

2. **workspace:leave** - Leave workspace
   ```typescript
   { workspaceId, userId }
   ```

3. **workspace:operation** - Apply operation
   ```typescript
   { operation: Operation, version: number }
   ```

4. **workspace:cursor** - Update cursor
   ```typescript
   { cursor: CursorPosition }
   ```

5. **workspace:selection** - Update selection
   ```typescript
   { selection: TextSelection | null }
   ```

6. **workspace:presence** - Update presence
   ```typescript
   { presence: UserPresence }
   ```

#### Server → Client

1. **workspace:sync** - Initial sync
   ```typescript
   { workspace: Workspace, users: CollaborativeUser[], version: number }
   ```

2. **workspace:user_joined** - User joined
   ```typescript
   { user: CollaborativeUser }
   ```

3. **workspace:user_left** - User left
   ```typescript
   { userId: string }
   ```

4. **workspace:operation** - Remote operation
   ```typescript
   { operation: Operation, version: number }
   ```

5. **workspace:cursor** - Remote cursor
   ```typescript
   { cursor: CursorPosition }
   ```

6. **workspace:selection** - Remote selection
   ```typescript
   { selection: TextSelection | null }
   ```

7. **workspace:error** - Error occurred
   ```typescript
   { code: string, message: string, details?: any }
   ```

8. **workspace:ack** - Acknowledgment
   ```typescript
   { messageId: string, success: boolean, version?: number }
   ```

## State Management

### Collaboration State Structure

```typescript
{
  workspace: Workspace | null,           // Current workspace
  users: Map<string, CollaborativeUser>, // Active users
  presences: Map<string, UserPresence>,  // User presences
  pendingOperations: Operation[],        // Pending operations
  version: number,                       // Current version
  isConnected: boolean,                  // Connection status
  isSyncing: boolean,                    // Syncing status
  error: string | null,                  // Error message
}
```

### Update Queue

Manages optimistic updates:

```typescript
{
  pending: OptimisticUpdate[],    // Awaiting confirmation
  confirmed: OptimisticUpdate[],  // Confirmed by server
  rejected: OptimisticUpdate[],   // Rejected by server
}
```

## Performance Optimizations

### 1. Operation Batching
- Batches multiple operations within a time window
- Reduces WebSocket message overhead
- Configurable batch size and delay

### 2. Cursor Throttling
- Throttles cursor updates to reduce network traffic
- Configurable throttle interval (default: 50ms)

### 3. Presence Updates
- Periodic presence updates instead of continuous
- Configurable update interval (default: 5s)

### 4. History Management
- Limits undo/redo history size
- Automatically trims old operations
- Configurable max history size (default: 1000)

### 5. Optimistic UI
- Applies local changes immediately
- Rolls back on server rejection
- Provides instant feedback

## Error Handling

### Connection Errors
- Automatic reconnection with exponential backoff
- Configurable retry attempts and intervals
- User notification on connection failure

### Operation Errors
- Optimistic update rollback on rejection
- Conflict resolution using OT
- Error events for application handling

### Sync Errors
- Re-sync on version mismatch
- Full state refresh on critical errors
- Graceful degradation

## Security Considerations

### Authentication
- WebSocket connection requires authentication
- User identity verified on connection
- Token-based authentication recommended

### Authorization
- Workspace access control
- Operation validation on server
- User permission checks

### Data Validation
- Input sanitization
- Operation validation
- Content size limits

## Integration Example

### Complete Component Example

```typescript
import React, { useEffect } from 'react';
import { useWorkspace, useCollaboration } from '@/hooks';

export function CollaborativeEditor({ workspaceId, userId, user }) {
  const {
    workspace,
    users,
    isConnected,
    error,
  } = useWorkspace({
    workspaceId,
    userId,
    user,
  });

  const {
    content,
    cursors,
    selections,
    applyOperation,
    updateCursor,
    updateSelection,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useCollaboration({
    workspaceId,
    userId,
    initialContent: workspace?.content || '',
  });

  const handleTextChange = (newText: string, position: number) => {
    const oldLength = content.length;
    const newLength = newText.length;

    if (newLength > oldLength) {
      // Insert operation
      applyOperation({
        type: 'insert',
        position,
        content: newText.slice(position, position + (newLength - oldLength)),
      });
    } else if (newLength < oldLength) {
      // Delete operation
      applyOperation({
        type: 'delete',
        position,
        length: oldLength - newLength,
      });
    }
  };

  const handleCursorMove = (line: number, column: number) => {
    updateCursor(line, column);
  };

  const handleSelectionChange = (
    start: { line: number; column: number },
    end: { line: number; column: number }
  ) => {
    updateSelection(start, end);
  };

  return (
    <div className="collaborative-editor">
      {/* Connection status */}
      <div className="status-bar">
        {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        {error && <span className="error">{error}</span>}
      </div>

      {/* Active users */}
      <div className="users">
        {users.map((user) => (
          <div key={user.id} className="user">
            <div
              className="avatar"
              style={{ backgroundColor: user.color }}
            >
              {user.name[0]}
            </div>
            <span>{user.name}</span>
          </div>
        ))}
      </div>

      {/* Editor */}
      <div className="editor">
        <textarea
          value={content}
          onChange={(e) => handleTextChange(e.target.value, e.target.selectionStart)}
          onSelect={(e) => {
            const target = e.target as HTMLTextAreaElement;
            handleSelectionChange(
              { line: 0, column: target.selectionStart },
              { line: 0, column: target.selectionEnd }
            );
          }}
        />

        {/* Remote cursors */}
        {Array.from(cursors.values()).map((cursor) => (
          <div
            key={cursor.userId}
            className="remote-cursor"
            style={{
              top: cursor.line * 20,
              left: cursor.column * 8,
              borderColor: users.find((u) => u.id === cursor.userId)?.color,
            }}
          />
        ))}

        {/* Remote selections */}
        {Array.from(selections.values()).map((selection) => (
          <div
            key={selection.userId}
            className="remote-selection"
            style={{
              backgroundColor: users.find((u) => u.id === selection.userId)?.color + '33',
            }}
          />
        ))}
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <button onClick={undo} disabled={!canUndo}>
          Undo
        </button>
        <button onClick={redo} disabled={!canRedo}>
          Redo
        </button>
      </div>
    </div>
  );
}
```

## Testing Recommendations

### Unit Tests
- Operation transformation logic
- State management
- Message handling
- History management

### Integration Tests
- WebSocket connection lifecycle
- Multi-user scenarios
- Conflict resolution
- Error handling

### Performance Tests
- Large document handling
- Many concurrent users
- Network latency simulation
- Operation throughput

## Future Enhancements

1. **Rich Text Support**: Extend OT for formatted text
2. **Offline Mode**: Queue operations when disconnected
3. **Conflict Visualization**: Show conflicts to users
4. **Version History**: Full document history with branching
5. **Presence Awareness**: Show what users are viewing/editing
6. **Voice/Video**: Integrate real-time communication
7. **Comments**: Inline commenting system
8. **Permissions**: Fine-grained access control
9. **Analytics**: Track collaboration metrics
10. **Mobile Support**: Optimize for mobile devices

## References

- [Operational Transformation](https://en.wikipedia.org/wiki/Operational_transformation)
- [WebSocket Protocol](https://datatracker.ietf.org/doc/html/rfc6455)
- [Conflict-free Replicated Data Types (CRDTs)](https://crdt.tech/)
- [Real-time Collaboration Best Practices](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)
