# Collaborative Workspace Editor

A Google Docs-style collaborative workspace editor for the Content Intelligence Platform with real-time editing, user presence indicators, inline comments, and version history.

## Features

### 🎯 Real-time Collaboration
- Live user presence indicators showing who's online
- Real-time cursor positions and selections
- Typing indicators for active users
- Color-coded user avatars

### 💬 Inline Comments
- Add comments at any position in the document
- Threaded discussions with replies
- Resolve/unresolve comments
- Filter by all/open comments
- Delete your own comments

### 📜 Version History
- Complete timeline of all document changes
- See who made each change and when
- Preview previous versions
- Restore any previous version
- Current version indicator

### 🎨 Modern UI/UX
- Clean, distraction-free editor interface
- Rich text formatting toolbar
- Dark mode support with smooth transitions
- Responsive design for all screen sizes
- Accessible keyboard navigation

## Components

### 1. Editor Component
**Location:** `frontend/components/workspace/Editor.tsx`

The main text editor with:
- Auto-resizing textarea
- Formatting toolbar (bold, italic, underline, headings, lists)
- Real-time cursor indicators for other users
- Word and character count
- Status indicators

**Props:**
```typescript
interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  activeUsers: UserPresence[];
  onCursorMove: (position: { line: number; column: number }) => void;
  readOnly?: boolean;
}
```

### 2. UserPresence Component
**Location:** `frontend/components/workspace/UserPresence.tsx`

Shows active users with:
- User avatars with color coding
- Typing indicators
- Hover tooltips with user names
- Overflow handling (shows +N for additional users)

**Props:**
```typescript
interface UserPresenceProps {
  activeUsers: UserPresence[];
  maxVisible?: number; // Default: 5
}
```

### 3. CommentThread Component
**Location:** `frontend/components/workspace/CommentThread.tsx`

Displays comment threads with:
- User avatars and names
- Timestamp formatting (relative time)
- Reply functionality
- Resolve/unresolve actions
- Delete for comment owners
- Expandable/collapsible threads

**Props:**
```typescript
interface CommentThreadProps {
  comment: Comment;
  onReply: (commentId: string, content: string) => void;
  onResolve: (commentId: string) => void;
  onDelete: (commentId: string) => void;
  currentUserId: string;
}
```

### 4. VersionHistory Component
**Location:** `frontend/components/workspace/VersionHistory.tsx`

Shows document history with:
- Timeline of all versions
- User who made each change
- Change descriptions
- Preview and restore actions
- Current version highlighting

**Props:**
```typescript
interface VersionHistoryProps {
  history: VersionHistoryEntry[];
  currentVersion: number;
  onRestore: (versionId: string) => void;
  onPreview: (versionId: string) => void;
}
```

## Type Definitions

**Location:** `frontend/types/workspace.ts`

Key types:
- `User` - User information with color coding
- `UserPresence` - Real-time user presence data
- `Comment` - Comment with replies
- `CommentReply` - Individual reply
- `VersionHistoryEntry` - Version history record
- `WorkspaceDocument` - Complete workspace document
- `EditorChange` - Individual edit operation

## Usage

### Basic Setup

```typescript
import WorkspacePage from '@/app/workspace/page';

// The page is a complete standalone component
// Just navigate to /workspace in your app
```

### Integration with WebSocket

For real-time collaboration, integrate with WebSocket:

```typescript
import { useWebSocket } from '@/hooks/useWebSocket';

const { socket, isConnected } = useWebSocket('ws://your-server/workspace');

// Broadcast changes
socket.emit('content-change', {
  workspaceId,
  content,
  userId,
  timestamp: new Date(),
});

// Listen for changes
socket.on('content-update', (data) => {
  setContent(data.content);
});

// Broadcast cursor position
socket.emit('cursor-move', {
  workspaceId,
  userId,
  position: { line, column },
});

// Listen for cursor updates
socket.on('cursor-update', (data) => {
  updateUserCursor(data.userId, data.position);
});
```

### Custom Styling

The workspace uses Tailwind CSS with dark mode support. Customize colors in `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      // Add your custom colors
      primary: '#your-color',
    },
  },
}
```

## Accessibility

The workspace is built with accessibility in mind:

- ✅ Keyboard navigation support
- ✅ ARIA labels on all interactive elements
- ✅ Focus indicators
- ✅ Screen reader friendly
- ✅ Semantic HTML structure
- ✅ Color contrast compliance (WCAG AA)

## Performance Optimizations

- Debounced content updates to reduce network traffic
- Virtual scrolling for large comment lists
- Lazy loading of version history
- Optimistic UI updates
- Efficient re-rendering with React.memo

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

- [ ] Rich text editor with markdown support
- [ ] @mentions for users
- [ ] Inline code blocks with syntax highlighting
- [ ] Image and file attachments
- [ ] Export to PDF/Word
- [ ] Collaborative cursor tracking
- [ ] Voice comments
- [ ] Suggestion mode (like Google Docs)
- [ ] Real-time spell check
- [ ] Keyboard shortcuts panel

## API Integration

### Required Endpoints

```typescript
// Get workspace
GET /api/workspace/:id

// Update workspace content
PUT /api/workspace/:id
Body: { content: string }

// Add comment
POST /api/workspace/:id/comments
Body: { content: string, position: { line, column } }

// Reply to comment
POST /api/workspace/:id/comments/:commentId/replies
Body: { content: string }

// Resolve comment
PUT /api/workspace/:id/comments/:commentId/resolve

// Get version history
GET /api/workspace/:id/history

// Restore version
POST /api/workspace/:id/restore/:versionId
```

## Development

### Running Locally

```bash
cd frontend
npm install
npm run dev
```

Navigate to `http://localhost:3000/workspace`

### Testing

```bash
npm run test
```

### Building for Production

```bash
npm run build
npm start
```

## Troubleshooting

### Dark mode not working
- Ensure `darkMode: 'class'` is set in `tailwind.config.ts`
- Check that the `dark` class is being toggled on the `<html>` element

### Comments not showing
- Verify the `showComments` state is true
- Check that comments array has data
- Ensure sidebar width is not collapsed

### Version history empty
- Confirm history data is being passed correctly
- Check that version entries have all required fields
- Verify the API endpoint is returning data

## License

Part of the Content Intelligence Platform. All rights reserved.
