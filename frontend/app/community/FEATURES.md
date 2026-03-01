# Community Page Features

## Feature Overview

### 1. Create Posts ✍️

**What it does**: Allows users to create text posts with optional images

**How to use**:
1. Type your message in the text area
2. (Optional) Click "Photo" to upload images
3. Click "Post" to publish

**Features**:
- Multi-line text support
- Multiple image uploads
- Image preview before posting
- Remove images before posting
- Real-time upload progress
- Validation (content required)

**Code Example**:
```typescript
const handleCreatePost = async () => {
  const response = await apiClient.community.createPost({
    userId: currentUserId,
    content: newPostContent,
    images: newPostImages,
  });
};
```

---

### 2. Feed with Infinite Scroll 📜

**What it does**: Displays posts from all users with automatic loading

**How it works**:
- Initial load: 50 posts
- Scroll to bottom: Automatically loads next 50
- Continues until no more posts

**Features**:
- Smooth scrolling experience
- Loading indicator
- No "Load More" button needed
- Efficient memory management

**Code Example**:
```typescript
useEffect(() => {
  observerRef.current = new IntersectionObserver(
    entries => {
      if (entries[0].isIntersecting && feedState.hasMore) {
        fetchFeed(feedState.offset, true);
      }
    },
    { threshold: 0.5 }
  );
}, [feedState]);
```

---

### 3. Like Posts ❤️

**What it does**: Like/unlike posts with instant feedback

**How to use**:
1. Click the thumbs-up icon
2. Like count increases immediately
3. API call happens in background

**Features**:
- Optimistic updates (instant UI)
- Error recovery (rollback on failure)
- Like count display
- Visual feedback

**Code Example**:
```typescript
const handleLikePost = async (postId: string) => {
  // Optimistic update
  setFeedState(prev => ({
    ...prev,
    posts: prev.posts.map(post =>
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    ),
  }));
  
  try {
    await apiClient.community.likePost(postId, currentUserId);
  } catch (error) {
    // Revert on error
    setFeedState(prev => ({
      ...prev,
      posts: prev.posts.map(post =>
        post.id === postId ? { ...post, likes: post.likes - 1 } : post
      ),
    }));
  }
};
```

---

### 4. Comments 💬

**What it does**: Add comments to posts

**How to use**:
1. Click the comment icon on a post
2. Type your comment
3. Press Enter or click "Send"

**Features**:
- Expandable comment section
- Real-time comment submission
- Comment count updates
- Keyboard shortcuts (Enter to send)

**Code Example**:
```typescript
const handleAddComment = async (postId: string) => {
  const response = await apiClient.community.addComment(
    postId,
    currentUserId,
    content
  );
  
  // Update comment count
  setFeedState(prev => ({
    ...prev,
    posts: prev.posts.map(post =>
      post.id === postId ? { ...post, comments: post.comments + 1 } : post
    ),
  }));
};
```

---

### 5. Image Upload 🖼️

**What it does**: Upload and attach images to posts

**How to use**:
1. Click "Photo" button
2. Select one or multiple images
3. Preview appears below text area
4. Click X to remove any image

**Features**:
- Multiple image support
- Drag & drop (browser default)
- Image preview
- Remove before posting
- Progress indication
- File size validation (100MB max)

**Supported Formats**:
- JPEG/JPG
- PNG
- GIF
- WebP

**Code Example**:
```typescript
const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files) return;

  const uploadPromises = Array.from(files).map(file =>
    apiClient.upload.file(file, undefined, currentUserId)
  );

  const results = await Promise.all(uploadPromises);
  const urls = results.map(r => r.url);
  
  setNewPostImages(prev => [...prev, ...urls]);
};
```

---

### 6. User Profiles 👤

**What it does**: Display user information and stats

**Features**:
- Avatar display
- Username
- Follower/following counts
- Post count
- Bio (coming soon)

**Cached for Performance**:
```typescript
const fetchUserProfile = async (userId: string) => {
  if (userCache[userId]) return; // Use cache
  
  const response = await apiClient.community.getUser(userId);
  setUserCache(prev => ({ ...prev, [userId]: response.user }));
};
```

---

### 7. Groups 👥

**What it does**: Discover and join community groups

**Features**:
- Group list in sidebar
- Member count display
- Join/leave actions
- Group-specific feeds (coming soon)

**Coming Soon**:
- Create groups
- Group management
- Private groups
- Group posts

---

### 8. Trending Topics 🔥

**What it does**: Shows popular hashtags and topics

**Features**:
- Top trending topics
- Post count per topic
- Click to filter (coming soon)

**Mock Data** (will be replaced with real API):
```typescript
const trending = [
  { tag: '#ContentCreation', posts: 1200 },
  { tag: '#VideoMarketing', posts: 856 },
  { tag: '#SocialMedia', posts: 642 },
];
```

---

### 9. Real-time Updates 🔄

**What it does**: Automatically refreshes feed with new content

**How it works**:
- Polls API every 30 seconds
- Fetches latest posts
- Updates feed without page reload

**Features**:
- Background polling
- No user action required
- Configurable interval
- Automatic cleanup on unmount

**Code Example**:
```typescript
useEffect(() => {
  pollingIntervalRef.current = setInterval(() => {
    fetchFeed(0, false);
  }, 30000); // 30 seconds

  return () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
  };
}, [fetchFeed]);
```

---

### 10. Error Handling 🛡️

**What it does**: Gracefully handles errors with user feedback

**Features**:
- Toast notifications for all errors
- Retry buttons on failures
- Loading states
- Error messages
- Automatic error recovery

**Error Types Handled**:
- Network errors
- API errors
- Upload failures
- Validation errors
- Timeout errors

**Code Example**:
```typescript
try {
  await apiClient.community.createPost(data);
  addToast('success', 'Post created!');
} catch (error: any) {
  addToast('error', error.message || 'Failed to create post');
}
```

---

### 11. Loading States ⏳

**What it does**: Shows loading indicators during operations

**Types**:
- **Initial Load**: Spinner with "Loading feed..." message
- **Infinite Scroll**: Small spinner at bottom
- **Creating Post**: "Posting..." button state
- **Uploading Images**: Progress indication

**Code Example**:
```typescript
{feedState.loading && feedState.posts.length === 0 ? (
  <div className="text-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
    <p className="mt-4 text-gray-500">Loading feed...</p>
  </div>
) : (
  // Show posts
)}
```

---

### 12. Responsive Design 📱

**What it does**: Adapts layout for all screen sizes

**Breakpoints**:
- **Mobile** (< 768px): Single column, stacked layout
- **Tablet** (768px - 1024px): Two columns
- **Desktop** (> 1024px): Three columns (sidebar-feed-sidebar)

**Features**:
- Mobile-first design
- Touch-friendly buttons
- Optimized images
- Collapsible sidebars

---

## Performance Features

### 1. Optimistic Updates
- Instant UI feedback
- Background API calls
- Error recovery

### 2. Lazy Loading
- Images load on-demand
- Next.js Image optimization
- Blur placeholders

### 3. Caching
- User profile cache
- Reduced API calls
- Memory efficient

### 4. Debouncing
- Search input (ready for implementation)
- Reduced API calls
- Better UX

### 5. Virtualization
- Efficient DOM management
- Handles 100+ posts
- Smooth scrolling

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Enter` | Send comment (in comment input) |
| `Esc` | Close expanded comment section |
| `Tab` | Navigate between inputs |

---

## Accessibility Features

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Screen reader support
- Focus indicators
- Color contrast compliance

---

## Browser Compatibility

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 90+ | ✅ Full |
| Firefox | 88+ | ✅ Full |
| Safari | 14+ | ✅ Full |
| Edge | 90+ | ✅ Full |
| Mobile Safari | 14+ | ✅ Full |
| Chrome Mobile | 90+ | ✅ Full |

---

## API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/community/post` | POST | Create post |
| `/api/community/feed` | GET | Get feed |
| `/api/community/post/:id/like` | POST | Like post |
| `/api/community/post/:id/comment` | POST | Add comment |
| `/api/community/user/:id` | GET | Get user profile |
| `/api/upload` | POST | Upload images |

---

## Coming Soon 🚀

- [ ] WebSocket for real-time updates
- [ ] Rich text editor
- [ ] Video uploads
- [ ] Post reactions (beyond likes)
- [ ] User mentions (@username)
- [ ] Hashtag support (#topic)
- [ ] Search functionality
- [ ] Filter by groups
- [ ] Sort options
- [ ] Notifications
- [ ] Direct messaging
- [ ] Post sharing
- [ ] Report/block
- [ ] Content moderation

---

**Last Updated**: 2026-02-27  
**Version**: 1.0.0
