# 🚀 Workspace Feature - Quick Start

## What's New?

Real-time collaborative editing is now available! Multiple users can edit the same content simultaneously, just like Google Docs.

## For Developers

### Start the Server
```bash
npm run dev
```

The server now supports:
- **HTTP API:** `http://localhost:3000/api/workspace/*`
- **WebSocket:** `ws://localhost:3000/ws/workspace`

### Test It
```bash
# Quick test
ts-node src/test-workspace.ts

# Full test suite
npm test -- workspace
```

### API Endpoints

```bash
# Create workspace
curl -X POST http://localhost:3000/api/workspace/create \
  -H "Content-Type: application/json" \
  -d '{"name":"My Workspace","initialContent":"Hello!"}'

# Get workspace
curl http://localhost:3000/api/workspace/{id}

# Get users
curl http://localhost:3000/api/workspace/{id}/users

# Delete workspace
curl -X DELETE http://localhost:3000/api/workspace/{id}
```

## For Frontend (Srushti)

### Connect to Workspace

```typescript
import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:3000/ws/workspace');

ws.on('open', () => {
  // Join workspace
  ws.send(JSON.stringify({
    type: 'join',
    workspaceId: 'your-workspace-id',
    user: {
      id: 'user-123',
      name: 'John Doe',
      color: '#FF0000'
    }
  }));
});

ws.on('message', (data) => {
  const message = JSON.parse(data.toString());
  
  if (message.type === 'init') {
    // Workspace loaded
    console.log('Content:', message.workspace.content);
  }
  
  if (message.type === 'change') {
    // Apply change to editor
    applyChange(message.change);
  }
});
```

### Send Changes

```typescript
// Insert text
ws.send(JSON.stringify({
  type: 'change',
  workspaceId: 'your-workspace-id',
  change: {
    id: 'change-1',
    userId: 'user-123',
    timestamp: Date.now(),
    operation: 'insert',
    position: 10,
    content: 'Hello World'
  }
}));

// Delete text
ws.send(JSON.stringify({
  type: 'change',
  workspaceId: 'your-workspace-id',
  change: {
    id: 'change-2',
    userId: 'user-123',
    timestamp: Date.now(),
    operation: 'delete',
    position: 10,
    length: 5
  }
}));
```

## Documentation

- **Full API Docs:** `docs/api/WORKSPACE_API.md`
- **Implementation Details:** `docs/WORKSPACE_IMPLEMENTATION.md`

## Need Help?

- Check the test script: `src/test-workspace.ts`
- Read the API docs: `docs/api/WORKSPACE_API.md`
- Ask Shubh (Backend Lead)

---

**Status:** ✅ Ready for integration  
**Next:** Srushti to build UI (Task 3.1b)
