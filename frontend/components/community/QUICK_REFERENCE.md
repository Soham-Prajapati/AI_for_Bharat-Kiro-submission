# Community UI - Quick Reference

## 🚀 Import Components

```tsx
import { Feed, PostCard, CreatePost, ProfileCard, GroupList } from '@/components/community';
```

## 📝 Basic Usage

### Feed
```tsx
<Feed
  onCreatePost={async (data) => { /* API call */ }}
  onLoadMore={async (page) => { /* Load more posts */ }}
  onLikePost={(id) => { /* Handle like */ }}
  userAvatar="/avatar.jpg"
/>
```

### PostCard
```tsx
<PostCard
  post={postData}
  onLike={(id) => { /* Handle like */ }}
  onComment={(id) => { /* Handle comment */ }}
  onShare={(id) => { /* Handle share */ }}
/>
```

### CreatePost
```tsx
<CreatePost
  onSubmit={async (data) => { /* Create post */ }}
  placeholder="Share your thoughts..."
  userAvatar="/avatar.jpg"
/>
```

### ProfileCard
```tsx
<ProfileCard
  user={userData}
  recentPosts={posts}
  onFollow={(id) => { /* Handle follow */ }}
  onViewProfile={(id) => { /* Navigate */ }}
  isCurrentUser={false}
/>
```

### GroupList
```tsx
<GroupList
  groups={groupsData}
  onJoinGroup={(id) => { /* Handle join */ }}
  onCreateGroup={() => { /* Open modal */ }}
  onViewGroup={(id) => { /* Navigate */ }}
/>
```

## 🎨 Color Classes

```tsx
// Backgrounds
bg-gradient-to-br from-gray-900 to-gray-800
bg-gradient-to-r from-purple-600 to-pink-600

// Text
text-white text-gray-400 text-gray-500

// Borders
border-gray-700/50 hover:border-purple-500/30

// Rings
ring-2 ring-purple-500/30
```

## 📐 Layout Pattern

```tsx
<div className="min-h-screen bg-gray-950 py-8">
  <div className="container mx-auto px-4">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main content - 2 cols */}
      <div className="lg:col-span-2">
        <Feed />
      </div>
      
      {/* Sidebar - 1 col */}
      <aside className="space-y-6">
        <ProfileCard />
        <GroupList />
      </aside>
    </div>
  </div>
</div>
```

## 🔧 Type Imports

```tsx
import type {
  Post,
  User,
  Group,
  CreatePostData,
  FeedFilters
} from '@/types/community';
```

## 🎯 Common Patterns

### API Handler
```tsx
const handleCreatePost = async (data: CreatePostData) => {
  const response = await fetch('/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) throw new Error('Failed to create post');
  return response.json();
};
```

### Infinite Scroll
```tsx
const handleLoadMore = async (page: number): Promise<Post[]> => {
  const response = await fetch(`/api/posts?page=${page}&limit=10`);
  return response.json();
};
```

### State Management
```tsx
const [posts, setPosts] = useState<Post[]>([]);
const [groups, setGroups] = useState<Group[]>([]);
const [currentUser, setCurrentUser] = useState<User | null>(null);
```

## 🎨 Custom Styling

### Override Card Style
```tsx
<PostCard
  post={post}
  className="custom-class" // Add if needed
/>
```

### Custom Gradient
```tsx
className="bg-gradient-to-r from-blue-600 to-purple-600"
```

## 🔄 Real-time Updates

```tsx
useEffect(() => {
  const ws = new WebSocket('ws://api.example.com/community');
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'new_post') {
      setPosts(prev => [data.post, ...prev]);
    }
  };
  
  return () => ws.close();
}, []);
```

## 📱 Responsive Classes

```tsx
// Mobile first
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

// Hide on mobile
className="hidden md:block"

// Show only on mobile
className="block md:hidden"
```

## ⚡ Performance Tips

```tsx
// Memoize expensive components
const MemoizedPostCard = memo(PostCard);

// Lazy load images
<img loading="lazy" src={url} alt={alt} />

// Debounce scroll
const debouncedScroll = useMemo(
  () => debounce(handleScroll, 300),
  []
);
```

## 🧪 Testing Example

```tsx
import { render, screen, fireEvent } from '@testing-library/react';

test('likes a post', () => {
  const onLike = jest.fn();
  render(<PostCard post={mockPost} onLike={onLike} />);
  
  fireEvent.click(screen.getByLabelText('Like post'));
  expect(onLike).toHaveBeenCalledWith(mockPost.id);
});
```

## 🎭 Mock Data

```tsx
const mockPost: Post = {
  id: '1',
  author: {
    id: '1',
    name: 'John Doe',
    username: 'johndoe',
    avatar: 'https://i.pravatar.cc/150',
    followerCount: 1000,
    followingCount: 500,
    verified: true,
  },
  content: 'Hello world!',
  likeCount: 42,
  commentCount: 10,
  isLiked: false,
  createdAt: new Date().toISOString(),
};
```

## 🔐 Security

```tsx
// Sanitize user input
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(userInput);

// Validate images
const isValidImage = (file: File) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
  return validTypes.includes(file.type) && file.size < 5_000_000;
};
```

## 📊 Analytics

```tsx
const handleLike = (postId: string) => {
  // Track event
  analytics.track('post_liked', { postId });
  
  // Update UI
  onLike?.(postId);
};
```

## 🎨 Animation Classes

```tsx
// Fade in
className="animate-fade-in"

// Slide up
className="animate-slide-up"

// Pulse
className="animate-pulse-slow"

// Spin
className="animate-spin"

// Scale on hover
className="transition-transform hover:scale-105"
```

## 🔍 Debugging

```tsx
// Log props
useEffect(() => {
  console.log('Post data:', post);
}, [post]);

// Check render count
const renderCount = useRef(0);
useEffect(() => {
  renderCount.current++;
  console.log('Renders:', renderCount.current);
});
```

## 📚 Resources

- **Full Docs**: README.md
- **Integration**: INTEGRATION_GUIDE.md
- **Design**: VISUAL_GUIDE.md
- **Example**: CommunityExample.tsx
- **Types**: types/community.ts

## 🆘 Common Issues

### Images not loading
```tsx
// Add error handler
<img
  src={url}
  alt={alt}
  onError={(e) => {
    e.currentTarget.src = '/fallback.png';
  }}
/>
```

### Infinite scroll not triggering
```tsx
// Check observer setup
useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      console.log('Intersecting:', entries[0].isIntersecting);
    },
    { threshold: 0.1 }
  );
  // ...
}, []);
```

### TypeScript errors
```tsx
// Ensure types are imported
import type { Post } from '@/types/community';

// Check prop types match
const post: Post = { /* ... */ };
```

## ✅ Checklist

- [ ] Import components
- [ ] Import types
- [ ] Set up API handlers
- [ ] Add error handling
- [ ] Test responsive design
- [ ] Check accessibility
- [ ] Add loading states
- [ ] Implement analytics
- [ ] Test with real data
- [ ] Deploy!

---

**Need more help?** Check the full documentation files in this directory.
