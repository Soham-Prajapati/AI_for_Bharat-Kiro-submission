# Community UI Integration Guide

Quick guide to integrate the Community UI components into your application.

## Installation

All components are already created in `frontend/components/community/`. No additional packages required beyond the existing dependencies.

## Quick Start

### 1. Import Components

```tsx
import { Feed, ProfileCard, GroupList } from '@/components/community';
// Or import individually
import Feed from '@/components/community/Feed';
```

### 2. Import Types

```tsx
import { Post, User, Group, CreatePostData } from '@/types/community';
```

### 3. Basic Implementation

```tsx
'use client';

import { Feed } from '@/components/community';

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-gray-950 py-8">
      <div className="container mx-auto px-4">
        <Feed
          onCreatePost={async (data) => {
            // Your API call here
            await fetch('/api/posts', {
              method: 'POST',
              body: JSON.stringify(data),
            });
          }}
          onLoadMore={async (page) => {
            const res = await fetch(`/api/posts?page=${page}`);
            return res.json();
          }}
        />
      </div>
    </div>
  );
}
```

## API Integration

### Create Post Endpoint

```typescript
// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const data = await request.json();
  
  // Handle image uploads
  if (data.images) {
    // Upload to your storage service (S3, Cloudinary, etc.)
  }
  
  // Save post to database
  const post = await db.posts.create({
    data: {
      content: data.content,
      authorId: session.user.id,
      images: uploadedImages,
    },
  });
  
  return NextResponse.json(post);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 10;
  
  const posts = await db.posts.findMany({
    skip: (page - 1) * limit,
    take: limit,
    include: {
      author: true,
      images: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  
  return NextResponse.json(posts);
}
```

### Like Post Endpoint

```typescript
// app/api/posts/[id]/like/route.ts
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const postId = params.id;
  const userId = session.user.id;
  
  // Toggle like
  const existingLike = await db.likes.findUnique({
    where: { userId_postId: { userId, postId } },
  });
  
  if (existingLike) {
    await db.likes.delete({ where: { id: existingLike.id } });
  } else {
    await db.likes.create({ data: { userId, postId } });
  }
  
  return NextResponse.json({ success: true });
}
```

### Groups Endpoints

```typescript
// app/api/groups/route.ts
export async function GET() {
  const groups = await db.groups.findMany({
    include: {
      _count: {
        select: { members: true, posts: true },
      },
    },
  });
  
  return NextResponse.json(groups);
}

// app/api/groups/[id]/join/route.ts
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const groupId = params.id;
  const userId = session.user.id;
  
  await db.groupMembers.create({
    data: { userId, groupId },
  });
  
  return NextResponse.json({ success: true });
}
```

## State Management

### Using React Context

```tsx
// context/CommunityContext.tsx
'use client';

import { createContext, useContext, useState } from 'react';
import { Post, User, Group } from '@/types/community';

interface CommunityContextType {
  posts: Post[];
  setPosts: (posts: Post[]) => void;
  currentUser: User | null;
  // ... other state
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

export function CommunityProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  return (
    <CommunityContext.Provider value={{ posts, setPosts, currentUser }}>
      {children}
    </CommunityContext.Provider>
  );
}

export const useCommunity = () => {
  const context = useContext(CommunityContext);
  if (!context) throw new Error('useCommunity must be used within CommunityProvider');
  return context;
};
```

### Using with Context

```tsx
import { useCommunity } from '@/context/CommunityContext';

export default function CommunityPage() {
  const { posts, setPosts, currentUser } = useCommunity();
  
  return (
    <Feed
      initialPosts={posts}
      userAvatar={currentUser?.avatar}
      // ... handlers
    />
  );
}
```

## Real-time Updates

### WebSocket Integration

```tsx
'use client';

import { useEffect } from 'react';
import { Feed } from '@/components/community';

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  
  useEffect(() => {
    const ws = new WebSocket('ws://your-server.com/community');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'new_post':
          setPosts(prev => [data.post, ...prev]);
          break;
        case 'post_liked':
          setPosts(prev => prev.map(post =>
            post.id === data.postId
              ? { ...post, likeCount: data.likeCount }
              : post
          ));
          break;
      }
    };
    
    return () => ws.close();
  }, []);
  
  return <Feed initialPosts={posts} />;
}
```

## Image Upload

### Client-side Image Handling

```tsx
const handleCreatePost = async (data: CreatePostData) => {
  const formData = new FormData();
  formData.append('content', data.content);
  
  // Add images
  data.images?.forEach((image, index) => {
    formData.append(`image_${index}`, image);
  });
  
  const response = await fetch('/api/posts', {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Failed to create post');
  }
};
```

### Server-side with Cloudinary

```typescript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: 'community-posts' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(buffer);
  });
}
```

## Performance Optimization

### 1. Lazy Loading Images

```tsx
<img
  src={image.url}
  alt={image.alt}
  loading="lazy"
  className="w-full h-64 object-cover"
/>
```

### 2. Memoize Components

```tsx
import { memo } from 'react';

const PostCard = memo(({ post, onLike, onComment }: PostCardProps) => {
  // Component code
});
```

### 3. Virtual Scrolling (for large lists)

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

function Feed({ posts }: FeedProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: posts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 400,
  });
  
  return (
    <div ref={parentRef} style={{ height: '100vh', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div key={virtualItem.key} style={{ transform: `translateY(${virtualItem.start}px)` }}>
            <PostCard post={posts[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Testing

### Unit Test Example

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import PostCard from '@/components/community/PostCard';

describe('PostCard', () => {
  const mockPost = {
    id: '1',
    author: { name: 'Test User', username: 'testuser' },
    content: 'Test content',
    likeCount: 10,
    commentCount: 5,
    isLiked: false,
    createdAt: new Date().toISOString(),
  };
  
  it('renders post content', () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });
  
  it('handles like button click', () => {
    const onLike = jest.fn();
    render(<PostCard post={mockPost} onLike={onLike} />);
    
    fireEvent.click(screen.getByLabelText('Like post'));
    expect(onLike).toHaveBeenCalledWith('1');
  });
});
```

## Troubleshooting

### Images not loading
- Check CORS settings on your image server
- Verify image URLs are accessible
- Add error handling for failed image loads

### Infinite scroll not working
- Ensure `onLoadMore` returns a Promise
- Check IntersectionObserver browser support
- Verify `hasMore` state is managed correctly

### Styling issues
- Ensure TailwindCSS is properly configured
- Check that dark mode is enabled: `darkMode: 'class'`
- Verify custom animations are in tailwind.config.ts

## Next Steps

1. Set up authentication and user sessions
2. Implement database schema for posts, users, groups
3. Add image upload service integration
4. Set up WebSocket for real-time updates
5. Add notification system
6. Implement search and filtering
7. Add analytics tracking

## Support

For issues or questions:
- Check the README.md for component documentation
- Review the CommunityExample.tsx for implementation examples
- Refer to type definitions in types/community.ts
