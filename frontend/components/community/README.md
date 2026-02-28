# Community UI Components

Modern, engaging community interface components for a content intelligence platform. Built with React 18, TypeScript, and TailwindCSS.

## Components Overview

### 1. Feed Component
Social media style feed with infinite scroll, post creation, and filtering capabilities.

**Features:**
- Infinite scroll with intersection observer
- Post creation with image upload
- Filter tabs (Recent, Popular, Following)
- Loading states and empty states
- Smooth animations

**Props:**
```typescript
interface FeedProps {
  initialPosts?: Post[];
  onLoadMore?: (page: number) => Promise<Post[]>;
  onCreatePost?: (data: CreatePostData) => Promise<void>;
  onLikePost?: (postId: string) => void;
  onCommentPost?: (postId: string) => void;
  onSharePost?: (postId: string) => void;
  userAvatar?: string;
  filters?: FeedFilters;
}
```

### 2. PostCard Component
Individual post display with user info, content, images, and interaction buttons.

**Features:**
- User avatar and verification badge
- Expandable content (show more/less)
- Image gallery (1-4+ images)
- Like, comment, share buttons
- Relative timestamps
- Smooth hover effects

**Props:**
```typescript
interface PostCardProps {
  post: Post;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
}
```

### 3. CreatePost Component
Input area for creating new posts with image upload support.

**Features:**
- Multi-line text input
- Multiple image upload
- Image preview with remove option
- Character limit handling
- Loading states

**Props:**
```typescript
interface CreatePostProps {
  onSubmit: (data: CreatePostData) => Promise<void>;
  placeholder?: string;
  userAvatar?: string;
}
```

### 4. ProfileCard Component
User profile display with stats, follow button, and recent posts preview.

**Features:**
- Gradient header background
- Avatar with verification badge
- Follower/following stats
- Follow/unfollow button
- Recent posts preview (up to 3)
- Edit profile option for current user

**Props:**
```typescript
interface ProfileCardProps {
  user: User;
  recentPosts?: Post[];
  onFollow?: (userId: string) => void;
  onUnfollow?: (userId: string) => void;
  onViewProfile?: (userId: string) => void;
  isCurrentUser?: boolean;
}
```

### 5. GroupList Component
Groups directory with grid layout and join/leave functionality.

**Features:**
- Responsive grid layout (1-3 columns)
- Cover images with gradient fallback
- Private group badges
- Member and post counts
- Join/leave buttons
- Create group button
- Empty state

**Props:**
```typescript
interface GroupListProps {
  groups: Group[];
  onJoinGroup?: (groupId: string) => void;
  onLeaveGroup?: (groupId: string) => void;
  onCreateGroup?: () => void;
  onViewGroup?: (groupId: string) => void;
  isLoading?: boolean;
}
```

## Design Features

### Dark Mode Theme
- Background: Gradient from gray-900 to gray-800
- Borders: gray-700/50 with purple-500/30 on hover
- Text: White primary, gray-400 secondary
- Accents: Purple-to-pink gradients

### Responsive Design
- Mobile: Single column, touch-friendly buttons
- Tablet: 2-column grid for groups
- Desktop: 3-column grid for groups, optimized spacing

### Animations
- Smooth transitions (200-300ms)
- Hover scale effects (scale-105)
- Loading spinners with dual rotation
- Fade-in and slide-up animations
- Image zoom on hover

### Accessibility
- Semantic HTML elements (article, button, etc.)
- ARIA labels for icon buttons
- Keyboard navigation support
- Focus states with ring utilities
- Alt text for images
- Color contrast compliance

## Usage Example

```tsx
'use client';

import Feed from '@/components/community/Feed';
import ProfileCard from '@/components/community/ProfileCard';
import GroupList from '@/components/community/GroupList';
import { Post, User, Group, CreatePostData } from '@/types/community';

export default function CommunityPage() {
  const handleCreatePost = async (data: CreatePostData) => {
    // API call to create post
    const response = await fetch('/api/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    // Handle response
  };

  const handleLoadMore = async (page: number): Promise<Post[]> => {
    const response = await fetch(`/api/posts?page=${page}`);
    return response.json();
  };

  return (
    <div className="min-h-screen bg-gray-950 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-2">
            <Feed
              onCreatePost={handleCreatePost}
              onLoadMore={handleLoadMore}
              onLikePost={(id) => console.log('Like:', id)}
              onCommentPost={(id) => console.log('Comment:', id)}
              userAvatar="/user-avatar.jpg"
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ProfileCard
              user={currentUser}
              recentPosts={userPosts}
              isCurrentUser={true}
            />
            
            <GroupList
              groups={groups}
              onJoinGroup={(id) => console.log('Join:', id)}
              onCreateGroup={() => console.log('Create group')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Type Definitions

All types are defined in `@/types/community.ts`:

- `User`: User profile information
- `Post`: Post content and metadata
- `PostImage`: Image attachment data
- `Comment`: Comment data
- `Group`: Group information
- `CreatePostData`: Post creation payload
- `FeedFilters`: Feed filtering options

## Styling

Components use TailwindCSS utility classes with:
- Custom gradients (purple-to-pink, purple-to-blue)
- Dark mode color palette
- Responsive breakpoints (sm, md, lg)
- Custom animations from tailwind.config.ts

## Best Practices

1. **Performance**: Use React.memo for PostCard if rendering large lists
2. **Images**: Implement lazy loading for post images
3. **Infinite Scroll**: Debounce scroll events if needed
4. **Error Handling**: Add error boundaries around components
5. **Loading States**: Show skeletons during initial load
6. **Optimistic Updates**: Update UI before API confirmation
7. **Accessibility**: Test with screen readers and keyboard navigation

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari 14+, Chrome Android

## Dependencies

- React 18+
- TypeScript 4.9+
- TailwindCSS 3+
- Next.js 14+ (optional, for image optimization)

## Future Enhancements

- [ ] Real-time updates with WebSocket
- [ ] Video post support
- [ ] Emoji reactions
- [ ] Comment threads
- [ ] Group chat integration
- [ ] Notification system
- [ ] Advanced search and filters
- [ ] User mentions and hashtags
