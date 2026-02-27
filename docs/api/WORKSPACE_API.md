# Collaborative Workspace API Documentation

## Overview

The Collaborative Workspace feature enables real-time collaborative editing of generated content, similar to Google Docs. Multiple users can edit the same content simultaneously with automatic conflict resolution using Operational Transform (OT).

## Architecture

### Components

1. **REST API** (`src/routes/workspace.route.ts`)
   - CRUD operations for workspaces
   - User management

2. **WebSocket Server** (`src/services/workspace-ws.service.ts`)
   - Real-time synchronization
   - User presence tracking
   - Change broadcasting

3. **Workspace Service** (`src/services/workspace.service.ts`)
   - Workspace state management
   - Operational Transform algorithm
   - Conflict resolution

### Data Flow

```
Client 1                    Server                      Client 2
   |                          |                            |
   |-- POST /workspace/create -->                          |
   |<-- { workspaceId } -------|                           |
   |                          |                            |
   |-- WS: join -------------->|                           |
   |<-- init: { content } -----|                           |
   |                          |                            |
   |                          |<-- WS: join ---------------|
   |                          |-- init: { content } ------>|
   |                          |                            |
   |-- WS: change ------------>|                           |
   |                          |-- OT Transform ----------->|
   |<-- WS: change ------------|-- WS: change ------------>|
```

## REST API Endpoints

### 1. Create Workspace

**POST** `/api/workspace/create`

Creates a new collaborative workspace.

**Request Body:**
```json
{
  "name": "My Workspace",
  "initialContent": "Optional initial content"
}
```

**Response:**
```json
{
  "success": true,
  "workspace": {
    "id": "uuid-v4",
    "name": "My Workspace",
    "content": "Optional initial content",
    "version": 0,
    "createdAt": "2026-02-27T...",
    "updatedAt": "2026-02-27T..."
  }
}
```

**Status Codes:**
- `201` - Workspace created successfully
- `400` - Invalid request (missing name)

---

### 2. Get Workspace

**GET** `/api/workspace/:id`

Retrieves workspace details.

**Response:**
```json
{
  "success": true,
  "workspace": {
    "id": "uuid-v4",
    "name": "My Workspace",
    "content": "Current content",
    "version": 5,
    "userCount": 3,
    "createdAt": "2026-02-27T...",
    "updatedAt": "2026-02-27T..."
  }
}
```

**Status Codes:**
- `200` - Success
- `404` - Workspace not found

---

### 3. Get Workspace Users

**GET** `/api/workspace/:id/users`

Gets list of users currently in the workspace.

**Response:**
```json
{
  "success": true,
  "workspaceId": "uuid-v4",
  "users": [
    {
      "id": "user-1",
      "name": "John Doe",
      "color": "#FF0000",
      "cursor": {
        "line": 5,
        "column": 10
      }
    }
  ],
  "count": 1
}
```

**Status Codes:**
- `200` - Success

---

### 4. Delete Workspace

**DELETE** `/api/workspace/:id`

Deletes a workspace.

**Response:**
```json
{
  "success": true,
  "message": "Workspace deleted",
  "workspaceId": "uuid-v4"
}
```

**Status Codes:**
- `200` - Workspace deleted
- `404` - Workspace not found

---

## WebSocket Protocol

### Connection

Connect to: `ws://localhost:3000/ws/workspace`

### Message Types

#### 1. Join Workspace

**Client → Server:**
```json
{
  "type": "join",
  "workspaceId": "uuid-v4",
  "user": {
    "id": "user-1",
    "name": "John Doe",
    "color": "#FF0000"
  }
}
```

**Server → Client (init):**
```json
{
  "type": "init",
  "workspace": {
    "id": "uuid-v4",
    "name": "My Workspace",
    "content": "Current content",
    "version": 5
  },
  "users": [
    { "id": "user-1", "name": "John Doe", "color": "#FF0000" }
  ]
}
```

**Server → Other Clients (broadcast):**
```json
{
  "type": "user-joined",
  "user": {
    "id": "user-1",
    "name": "John Doe",
    "color": "#FF0000"
  }
}
```

---

#### 2. Leave Workspace

**Client → Server:**
```json
{
  "type": "leave",
  "workspaceId": "uuid-v4"
}
```

**Server → Other Clients:**
```json
{
  "type": "user-left",
  "userId": "user-1"
}
```

---

#### 3. Content Change

**Client → Server:**
```json
{
  "type": "change",
  "workspaceId": "uuid-v4",
  "change": {
    "id": "change-1",
    "userId": "user-1",
    "timestamp": 1709078400000,
    "operation": "insert",
    "position": 10,
    "content": "Hello"
  }
}
```

**Operations:**
- `insert` - Insert text at position
  - `position`: number
  - `content`: string
- `delete` - Delete text from position
  - `position`: number
  - `length`: number
- `replace` - Replace text at position
  - `position`: number
  - `length`: number
  - `content`: string

**Server → All Clients:**
```json
{
  "type": "change",
  "change": {
    "id": "change-1",
    "userId": "user-1",
    "timestamp": 1709078400000,
    "operation": "insert",
    "position": 10,
    "content": "Hello"
  }
}
```

---

#### 4. Cursor Position

**Client → Server:**
```json
{
  "type": "cursor",
  "workspaceId": "uuid-v4",
  "cursor": {
    "line": 5,
    "column": 10
  }
}
```

**Server → Other Clients:**
```json
{
  "type": "cursor",
  "userId": "user-1",
  "cursor": {
    "line": 5,
    "column": 10
  }
}
```

---

#### 5. Presence Request

**Client → Server:**
```json
{
  "type": "presence",
  "workspaceId": "uuid-v4"
}
```

**Server → All Clients:**
```json
{
  "type": "presence",
  "users": [
    {
      "id": "user-1",
      "name": "John Doe",
      "color": "#FF0000",
      "cursor": { "line": 5, "column": 10 }
    }
  ]
}
```

---

## Operational Transform (OT)

The system uses Operational Transform to handle concurrent edits without conflicts.

### How It Works

1. **Client makes change** at position 10: insert "Hello"
2. **Another client** simultaneously makes change at position 5: insert "World"
3. **Server receives both changes** and transforms them:
   - Change 1 (position 10) is adjusted to position 15 (because "World" was inserted before it)
   - Both changes are applied in correct order
4. **Server broadcasts** transformed changes to all clients
5. **All clients** end up with identical content

### Example

**Initial content:** `"The cat"`

**User A:** Insert " big" at position 3 → `"The big cat"`
**User B:** Insert " black" at position 7 → `"The cat black"`

**After OT:**
- User B's change is transformed to position 11 (adjusted for User A's insert)
- Final content: `"The big cat black"` ✅

---

## Client Implementation Example

### JavaScript/TypeScript

```typescript
import WebSocket from 'ws';

class WorkspaceClient {
  private ws: WebSocket;
  private workspaceId: string;
  private userId: string;

  constructor(workspaceId: string, user: { id: string; name: string; color: string }) {
    this.workspaceId = workspaceId;
    this.userId = user.id;
    
    this.ws = new WebSocket('ws://localhost:3000/ws/workspace');

    this.ws.on('open', () => {
      // Join workspace
      this.send({
        type: 'join',
        workspaceId,
        user
      });
    });

    this.ws.on('message', (data: Buffer) => {
      const message = JSON.parse(data.toString());
      this.handleMessage(message);
    });
  }

  private send(message: any) {
    this.ws.send(JSON.stringify(message));
  }

  private handleMessage(message: any) {
    switch (message.type) {
      case 'init':
        console.log('Workspace initialized:', message.workspace);
        break;
      
      case 'change':
        console.log('Change received:', message.change);
        this.applyChange(message.change);
        break;
      
      case 'user-joined':
        console.log('User joined:', message.user);
        break;
      
      case 'user-left':
        console.log('User left:', message.userId);
        break;
      
      case 'cursor':
        console.log('Cursor moved:', message.userId, message.cursor);
        break;
    }
  }

  public insertText(position: number, content: string) {
    this.send({
      type: 'change',
      workspaceId: this.workspaceId,
      change: {
        id: `${this.userId}-${Date.now()}`,
        userId: this.userId,
        timestamp: Date.now(),
        operation: 'insert',
        position,
        content
      }
    });
  }

  public deleteText(position: number, length: number) {
    this.send({
      type: 'change',
      workspaceId: this.workspaceId,
      change: {
        id: `${this.userId}-${Date.now()}`,
        userId: this.userId,
        timestamp: Date.now(),
        operation: 'delete',
        position,
        length
      }
    });
  }

  public updateCursor(line: number, column: number) {
    this.send({
      type: 'cursor',
      workspaceId: this.workspaceId,
      cursor: { line, column }
    });
  }

  private applyChange(change: any) {
    // Apply change to local content
    // This is where you'd update your editor
  }

  public disconnect() {
    this.send({
      type: 'leave',
      workspaceId: this.workspaceId
    });
    this.ws.close();
  }
}

// Usage
const client = new WorkspaceClient('workspace-id', {
  id: 'user-1',
  name: 'John Doe',
  color: '#FF0000'
});

client.insertText(0, 'Hello World!');
client.updateCursor(1, 12);
```

---

## Testing

### Manual Testing

1. Start the server:
   ```bash
   npm run dev
   ```

2. Run the test script:
   ```bash
   ts-node src/test-workspace.ts
   ```

### Automated Tests

Run the test suite:
```bash
npm test -- workspace
```

---

## Performance Considerations

### Scalability

- **Current implementation:** In-memory storage (Map)
- **Production recommendation:** Use Redis for distributed state
- **Concurrent users per workspace:** Tested up to 10 users
- **Message latency:** <100ms for local network

### Optimization Tips

1. **Throttle cursor updates** - Send at most 10 updates/second
2. **Batch changes** - Combine rapid keystrokes into single change
3. **Compress large changes** - Use gzip for changes >1KB
4. **Implement reconnection logic** - Handle network interruptions

---

## Security

### Authentication

- **TODO:** Add JWT authentication for WebSocket connections
- **Current:** No authentication (development only)

### Authorization

- **TODO:** Implement workspace access control
- **Current:** Anyone with workspace ID can join

### Rate Limiting

- **TODO:** Add rate limiting for WebSocket messages
- **Recommendation:** Max 100 messages/minute per user

---

## Future Enhancements

1. **Persistence** - Save workspaces to DynamoDB
2. **History** - Track all changes for undo/redo
3. **Comments** - Add inline comments and threads
4. **Permissions** - Read-only vs edit access
5. **Conflict UI** - Visual indicators for conflicts
6. **Rich text** - Support formatting (bold, italic, etc.)
7. **File attachments** - Attach images, videos
8. **Export** - Export to PDF, Markdown, etc.

---

## Troubleshooting

### WebSocket connection fails

**Problem:** `Error: connect ECONNREFUSED`

**Solution:** Make sure the server is running on the correct port.

---

### Changes not syncing

**Problem:** Changes made by one user don't appear for others

**Solution:** 
1. Check WebSocket connection is open
2. Verify `workspaceId` is correct
3. Check server logs for errors

---

### Content divergence

**Problem:** Users see different content

**Solution:**
1. This shouldn't happen with OT
2. If it does, it's a bug - please report with:
   - Sequence of operations
   - Initial content
   - Expected vs actual result

---

## Support

For issues or questions:
- GitHub Issues: [link]
- Email: support@example.com
- Slack: #workspace-support
