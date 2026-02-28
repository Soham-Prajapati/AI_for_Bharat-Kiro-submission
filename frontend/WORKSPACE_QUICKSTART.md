# Workspace Collaboration Quick Start

## Installation

The workspace collaboration features are built into the frontend hooks. No additional dependencies required beyond the existing project setup.

## Basic Setup

### 1. Import the Hooks

```typescript
import { useWorkspace, useCollaboration } from '@/hooks';
```

### 2. Set Up WebSocket Connection

```typescript
const {
  workspace,
  users,
  isConnected,
  error,
  sendMessage,
} = useWorkspace({
  workspaceId: 'your-workspace-id',
  userId: 'current-user-id',
  user: {
    id: 'current-user-id',
    name: 'John Doe',
    email: 'john@example.com',
    color: '#FF6B6B',
    isActive: true,
    lastSeen: Date.now(),
  },
});
```

### 3. Enable Collaborative Editing

```typescript
const {
  content,
  cursors,
  selections,
  applyOperation,
  updateCursor,
  undo,
  redo,
} = useCollaboration({
  workspaceId: 'your-workspace-id',
  userId: 'current-user-id',
  initialContent: workspace?.content || '',
  onContentChange: (newContent) => {
    console.log('Content updated:', newContent);
  },
});
```

## Common Use Cases

### Text Insertion

```typescript
// User types "hello" at position 10
applyOperation({
  type: 'insert',
  position: 10,
  content: 'hello',
});
```

### Text Deletion

```typescript
// User deletes 5 characters at position 10
applyOperation({
  type: 'delete',
  position: 10,
  length: 5,
});
```

### Cursor Movement

```typescript
// User moves cursor to line 5, column 20
updateCursor(5, 20);
```

### Text Selection

```typescript
// User selects from (0, 0) to (0, 10)
updateSelection(
  { line: 0, column: 0 },
  { line: 0, column: 10 }
);
```

### Undo/Redo

```typescript
// Undo last operation
if (canUndo) {
  undo();
}

// Redo last undone operation
if (canRedo) {
  redo();
}
```

## Displaying Remote Users

### Show Active Users

```typescript
<div className="users-list">
  {users.map((user) => (
    <div key={user.id} className="user-badge">
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
```

### Show Remote Cursors

```typescript
<div className="editor-container">
  {Array.from(cursors.entries()).map(([userId, cursor]) => {
    const user = users.find((u) => u.id === userId);
    return (
      <div
        key={userId}
        className="remote-cursor"
        style={{
          position: 'absolute',
          top: `${cursor.line * 20}px`,
          left: `${cursor.column * 8}px`,
          borderLeft: `2px solid ${user?.color}`,
          height: '20px',
        }}
      >
        <div
          className="cursor-label"
          style={{ backgroundColor: user?.color }}
        >
          {user?.name}
        </div>
      </div>
    );
  })}
</div>
```

### Show Remote Selections

```typescript
{Array.from(selections.entries()).map(([userId, selection]) => {
  const user = users.find((u) => u.id === userId);
  return (
    <div
      key={userId}
      className="remote-selection"
      style={{
        position: 'absolute',
        top: `${selection.start.line * 20}px`,
        left: `${selection.start.column * 8}px`,
        width: `${(selection.end.column - selection.start.column) * 8}px`,
        height: '20px',
        backgroundColor: `${user?.color}33`,
      }}
    />
  );
})}
```

## Connection Status

### Display Connection State

```typescript
<div className="connection-status">
  {isConnected ? (
    <span className="connected">🟢 Connected</span>
  ) : (
    <span className="disconnected">🔴 Disconnected</span>
  )}
  {isSyncing && <span className="syncing">⏳ Syncing...</span>}
  {error && <span className="error">❌ {error}</span>}
</div>
```

### Manual Reconnection

```typescript
<button onClick={reconnect} disabled={isConnected}>
  Reconnect
</button>
```

## Configuration

### Custom Configuration

```typescript
const config = {
  reconnectAttempts: 10,
  reconnectInterval: 5000,
  heartbeatInterval: 60000,
  operationBatchSize: 20,
  operationBatchDelay: 200,
  cursorUpdateThrottle: 100,
  presenceUpdateInterval: 10000,
  maxHistorySize: 500,
};

const workspace = useWorkspace({
  workspaceId,
  userId,
  user,
  config,
});

const collaboration = useCollaboration({
  workspaceId,
  userId,
  config,
});
```

## Event Handling

### Listen to Workspace Events

```typescript
useWorkspace({
  workspaceId,
  userId,
  user,
  onEvent: (event) => {
    switch (event.type) {
      case 'connected':
        console.log('Connected to workspace');
        break;
      case 'disconnected':
        console.log('Disconnected from workspace');
        break;
      case 'user_joined':
        console.log('User joined:', event.data);
        break;
      case 'user_left':
        console.log('User left:', event.data);
        break;
      case 'error':
        console.error('Workspace error:', event.data);
        break;
    }
  },
});
```

## Error Handling

### Handle Connection Errors

```typescript
useEffect(() => {
  if (error) {
    // Show error notification
    toast.error(`Workspace error: ${error}`);
    
    // Attempt manual reconnection
    setTimeout(() => {
      reconnect();
    }, 5000);
  }
}, [error, reconnect]);
```

### Handle Operation Failures

```typescript
useCollaboration({
  workspaceId,
  userId,
  onContentChange: (content) => {
    try {
      // Save content
      saveContent(content);
    } catch (err) {
      console.error('Failed to save content:', err);
      // Rollback or retry
    }
  },
});
```

## Performance Tips

### 1. Debounce Cursor Updates

```typescript
import { debounce } from 'lodash';

const debouncedCursorUpdate = debounce(updateCursor, 100);

// Use debounced version
debouncedCursorUpdate(line, column);
```

### 2. Batch Operations

```typescript
// Instead of multiple individual operations
applyOperation({ type: 'insert', position: 0, content: 'a' });
applyOperation({ type: 'insert', position: 1, content: 'b' });
applyOperation({ type: 'insert', position: 2, content: 'c' });

// Combine into single operation
applyOperation({ type: 'insert', position: 0, content: 'abc' });
```

### 3. Limit History Size

```typescript
const config = {
  maxHistorySize: 100, // Reduce for better memory usage
};
```

### 4. Throttle Presence Updates

```typescript
const config = {
  presenceUpdateInterval: 10000, // Update every 10 seconds
};
```

## Testing

### Mock WebSocket Connection

```typescript
// In tests
jest.mock('@/hooks/useWorkspace', () => ({
  useWorkspace: () => ({
    workspace: mockWorkspace,
    users: mockUsers,
    isConnected: true,
    error: null,
    sendMessage: jest.fn(),
  }),
}));
```

### Test Operation Transform

```typescript
import { transformOperations } from '@/hooks/useCollaboration';

test('transforms concurrent insert operations', () => {
  const op1 = { type: 'insert', position: 5, content: 'hello' };
  const op2 = { type: 'insert', position: 5, content: 'world' };
  
  const result = transformOperations(op1, op2);
  
  expect(result.transformed.position).toBe(10);
});
```

## Troubleshooting

### Connection Issues

**Problem**: WebSocket won't connect

**Solutions**:
- Check WebSocket URL configuration
- Verify backend is running
- Check CORS settings
- Ensure authentication token is valid

### Sync Issues

**Problem**: Content not syncing

**Solutions**:
- Check network connectivity
- Verify version numbers match
- Force reconnection
- Clear local state and re-sync

### Performance Issues

**Problem**: Slow or laggy editing

**Solutions**:
- Increase operation batch delay
- Reduce cursor update frequency
- Limit history size
- Optimize rendering

## Next Steps

- Read the [Architecture Documentation](./WORKSPACE_COLLABORATION_ARCHITECTURE.md)
- Explore the [Type Definitions](./types/workspace.ts)
- Check out the [Hook Implementations](./hooks/)
- Build your collaborative editor!

## Support

For issues or questions:
1. Check the architecture documentation
2. Review the type definitions
3. Examine the hook implementations
4. Test with the provided examples
