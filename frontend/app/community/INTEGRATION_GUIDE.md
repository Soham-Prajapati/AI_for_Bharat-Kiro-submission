# Community Page Integration Guide

## Quick Start

### 1. Prerequisites

Ensure you have the following installed and configured:

```bash
# Required dependencies (already in package.json)
- next: ^14.0.0
- react: ^18.0.0
- typescript: ^5.0.0
- tailwindcss: ^3.0.0
```

### 2. Environment Setup

Add to your `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. Start the Backend

```bash
# In backend directory
npm run dev
```

The Community API should be available at `http://localhost:3000/api/community`

### 4. Access the Page

Navigate to: `http://localhost:3001/community`

## Integration Steps

### Step 1: Verify API Client

The page uses the centralized API client. Verify it's configured:

```typescript
// frontend/services/api.ts
import apiClient from '@/services/api';

// Community endpoints available:
apiClient.community.createPost(data);
apiClient.community.getFeed(userId, limit, offset);
apiClient.community.likePost(postId, userId);
apiClient.community.addComment(postId, userId, content);
apiClient.community.getUser(userId);
```

### Step 2: Add Toast Provider

Ensure your app is wrapped with ToastProvider:

```typescript
// frontend/app/layout.tsx
import { ToastProvider } from '@/context/ToastContext';
import ToastContainer from '@/components/ToastContainer';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ToastProvider>
          {children}
          <ToastContainer />
        </ToastProvider>
      </body>
    </html>
  );
}
```

### Step 3: Add Authentication (Optional)

Replace the hardcoded user ID with real authentication:

```typescript
// Before
const [currentUserId] = useState('user-123');

// After
import { useAuth } from '@/context/AuthContext';

const { user } = useAuth();
const currentUserId = user?.id || '';
```

### Step 4: Add Navigation Link

Add to your main navigation:

```typescript
// frontend/components/Navigation.tsx
<Link href="/community" className="nav-link">
  Community
</Link>
```

## API Endpoint Testing

### Test Create Post

```bash
curl -X POST http://localhost:3000/api/community/post \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "content": "Hello community!",
    "images": []
  }'
```

### Test Get Feed

```bash
curl http://localhost:3000/api/community/feed?limit=10&offset=0
```

### Test Like Post

```bash
curl -X POST http://localhost:3000/api/community/post/POST_ID/like \
  -H "Content-Type: application/json" \
  -d '{"userId": "user-123"}'
```

### Test Add Comment

```bash
curl -X POST http://localhost:3000/api/community/post/POST_ID/comment \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "content": "Great post!"
  }'
```

## Customization

### Change Polling Interval

```typescript
// Default: 30 seconds
useEffect(() => {
  pollingIntervalRef.current = setInterval(() => {
    fetchFeed(0, false);
  }, 60000); // Change to 60 seconds
}, [fetchFeed]);
```

### Change Posts Per Page

```typescript
// Default: 50 posts
const response = await apiClient.community.getFeed(undefined, 100, offset); // 100 posts
```

### Customize Colors

```typescript
// Primary color (blue -> purple)
className="bg-purple-600 hover:bg-purple-700"

// Accent color
className="text-purple-600"
```

### Add Custom Filters

```typescript
const [filter, setFilter] = useState<'all' | 'following' | 'popular'>('all');

const fetchFeed = async (offset: number = 0) => {
  // Add filter logic
  const response = await apiClient.community.getFeed(
    filter === 'following' ? currentUserId : undefined,
    50,
    offset
  );
};
```

## Advanced Features

### Add Search

```typescript
const [searchQuery, setSearchQuery] = useState('');
const [debouncedQuery] = useDebounce(searchQuery, 500);

useEffect(() => {
  if (debouncedQuery) {
    // Implement search API call
    searchPosts(debouncedQuery);
  }
}, [debouncedQuery]);
```

### Add Post Filtering

```typescript
const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

const fetchFeed = async (offset: number = 0) => {
  const response = await apiClient.community.getFeed(
    undefined,
    50,
    offset
  );
  
  // Filter by group
  const filtered = selectedGroup
    ? response.posts.filter(p => p.groupId === selectedGroup)
    : response.posts;
    
  setFeedState(prev => ({ ...prev, posts: filtered }));
};
```

### Add Rich Text Editor

```typescript
// Install react-quill
npm install react-quill

// Import and use
import dynamic from 'next/dynamic';
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

<ReactQuill
  value={newPostContent}
  onChange={setNewPostContent}
  placeholder="What's on your mind?"
/>
```

### Add Video Upload

```typescript
const handleVideoUpload = async (file: File) => {
  try {
    const response = await apiClient.upload.file(file, (progress) => {
      console.log(`Upload progress: ${progress}%`);
    }, currentUserId);
    
    setNewPostVideos(prev => [...prev, response.url]);
  } catch (error) {
    addToast('error', 'Failed to upload video');
  }
};
```

## Performance Optimization

### Enable Image Optimization

```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['your-cdn-domain.com'],
    formats: ['image/avif', 'image/webp'],
  },
};
```

### Add Service Worker for Offline Support

```typescript
// public/sw.js
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

### Implement Virtual Scrolling

```typescript
// Install react-window
npm install react-window

import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={feedState.posts.length}
  itemSize={200}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <PostCard post={feedState.posts[index]} />
    </div>
  )}
</FixedSizeList>
```

## Monitoring & Analytics

### Add Analytics Tracking

```typescript
import { analytics } from '@/lib/analytics';

const handleCreatePost = async () => {
  // ... create post logic
  
  analytics.track('post_created', {
    userId: currentUserId,
    contentLength: newPostContent.length,
    hasImages: newPostImages.length > 0,
  });
};
```

### Add Error Tracking

```typescript
import * as Sentry from '@sentry/nextjs';

try {
  await apiClient.community.createPost(data);
} catch (error) {
  Sentry.captureException(error, {
    tags: { feature: 'community', action: 'create_post' },
  });
  addToast('error', 'Failed to create post');
}
```

## Testing

### Unit Tests

```typescript
// __tests__/community.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import CommunityPage from '@/app/community/page';

describe('CommunityPage', () => {
  it('renders create post section', () => {
    render(<CommunityPage />);
    expect(screen.getByPlaceholderText("What's on your mind?")).toBeInTheDocument();
  });
  
  it('handles post creation', async () => {
    render(<CommunityPage />);
    const textarea = screen.getByPlaceholderText("What's on your mind?");
    fireEvent.change(textarea, { target: { value: 'Test post' } });
    
    const postButton = screen.getByText('Post');
    fireEvent.click(postButton);
    
    // Assert post was created
  });
});
```

### Integration Tests

```typescript
// __tests__/community-integration.test.tsx
import { render, waitFor } from '@testing-library/react';
import CommunityPage from '@/app/community/page';

describe('Community Integration', () => {
  it('loads feed on mount', async () => {
    render(<CommunityPage />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading feed...')).not.toBeInTheDocument();
    });
    
    // Assert posts are displayed
  });
});
```

## Deployment

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Variables

Set in Vercel dashboard:
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_UPLOAD_URL` (if different)

### Build Optimization

```typescript
// next.config.js
module.exports = {
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};
```

## Troubleshooting

### Issue: Posts not loading

**Solution**: Check API endpoint and CORS settings

```typescript
// backend/src/index.ts
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true,
}));
```

### Issue: Images not displaying

**Solution**: Add domain to Next.js config

```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['localhost', 'your-api-domain.com'],
  },
};
```

### Issue: Infinite scroll not triggering

**Solution**: Check Intersection Observer threshold

```typescript
observerRef.current = new IntersectionObserver(
  entries => {
    if (entries[0].isIntersecting) {
      fetchFeed(feedState.offset, true);
    }
  },
  { threshold: 0.1 } // Lower threshold
);
```

## Support

For issues or questions:
1. Check the [README.md](./README.md)
2. Review [API Documentation](../../../docs/api/COMMUNITY_API.md)
3. Check browser console for errors
4. Verify backend is running

---

**Last Updated**: 2026-02-27  
**Version**: 1.0.0
