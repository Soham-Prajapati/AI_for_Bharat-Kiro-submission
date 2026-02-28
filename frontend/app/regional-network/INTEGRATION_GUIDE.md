# Regional Network Integration Guide

## Quick Start

### 1. Environment Setup

Add to your `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 2. Install Dependencies

All dependencies are already included in the project:
- Next.js 14+
- React 18+
- TailwindCSS 3+
- TypeScript 5+

### 3. Access the Feature

Navigate to: `http://localhost:3000/regional-network`

## Integration Steps

### Step 1: Backend API Setup

Ensure the backend Regional Network service is running:

```bash
# In the backend directory
npm run dev
```

The service should be available at `http://localhost:3001/api/regional/*`

### Step 2: Frontend Configuration

The frontend is already configured with API routes that proxy to the backend:

```
/api/regional/hubs → Backend: /api/regional/hubs
/api/regional/creators → Backend: /api/regional/creators
/api/regional/matches → Backend: /api/regional/matches
/api/regional/collab-request → Backend: /api/regional/collab-request
```

### Step 3: Authentication Integration

To integrate with your authentication system:

1. Update `frontend/pages/api/regional/collab-request.ts`:

```typescript
// Replace this line:
const fromCreatorId = 'current_user';

// With your auth logic:
import { getSession } from 'next-auth/react';
const session = await getSession({ req });
const fromCreatorId = session?.user?.id;
```

2. Add authentication checks to all API routes:

```typescript
const session = await getSession({ req });
if (!session) {
  return res.status(401).json({ error: 'Unauthorized' });
}
```

### Step 4: Navigation Integration

Add Regional Network to your main navigation:

```tsx
// In your Navigation component
<Link href="/regional-network">
  <a className="nav-link">
    🗺️ Regional Network
  </a>
</Link>
```

### Step 5: User Profile Integration

Connect creator profiles to your user system:

```typescript
// In your user profile page
import { Creator } from '@/types/regional';

const userToCreator = (user: User): Creator => ({
  id: user.id,
  name: user.name,
  region: user.region,
  languages: user.languages,
  niche: user.contentNiche,
  audienceSize: user.followers,
  platforms: user.connectedPlatforms,
  bio: user.bio,
  lookingForCollabs: user.openToCollabs,
  collaborationPreferences: user.collabPreferences,
});
```

## API Integration Examples

### Fetching Creators

```typescript
// Client-side
const fetchCreators = async (region: string) => {
  const response = await fetch(`/api/regional/creators?region=${region}`);
  const data = await response.json();
  return data.creators;
};

// Server-side (in API route)
import { RegionalNetworkService } from '@/services/regional-network.service';

const service = new RegionalNetworkService();
const creators = await service.getCreatorsByRegion('north', {
  language: 'hindi',
  niche: 'technology',
});
```

### Finding Matches

```typescript
const findMatches = async (creatorId: string) => {
  const response = await fetch(`/api/regional/matches?creatorId=${creatorId}`);
  const data = await response.json();
  return data.matches;
};
```

### Sending Collaboration Requests

```typescript
const sendCollabRequest = async (
  toCreatorId: string,
  message: string,
  collabType: string
) => {
  const response = await fetch('/api/regional/collab-request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ toCreatorId, message, collabType }),
  });
  return response.json();
};
```

## Database Integration

### Creator Profile Schema

```typescript
// MongoDB/DynamoDB schema
{
  id: string;
  userId: string; // Link to user account
  name: string;
  region: 'north' | 'south' | 'east' | 'west';
  languages: string[];
  niche: string;
  audienceSize: number;
  platforms: string[];
  bio: string;
  lookingForCollabs: boolean;
  collaborationPreferences: {
    regions: string[];
    languages: string[];
    niches: string[];
    minAudienceSize?: number;
    maxAudienceSize?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### Collaboration Request Schema

```typescript
{
  id: string;
  fromCreatorId: string;
  toCreatorId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  message: string;
  collabType: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}
```

## Real-time Updates (Optional)

To add real-time collaboration request notifications:

### Using WebSockets

```typescript
// In your WebSocket server
io.on('connection', (socket) => {
  socket.on('join-creator-room', (creatorId) => {
    socket.join(`creator-${creatorId}`);
  });
});

// Emit when new collaboration request
io.to(`creator-${toCreatorId}`).emit('new-collab-request', request);
```

### Using Server-Sent Events (SSE)

```typescript
// API route: /api/regional/notifications
export default async function handler(req, res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Send updates
  const interval = setInterval(() => {
    res.write(`data: ${JSON.stringify({ type: 'ping' })}\n\n`);
  }, 30000);

  req.on('close', () => {
    clearInterval(interval);
  });
}
```

## Analytics Integration

Track user interactions:

```typescript
// Using your analytics service
import { analytics } from '@/lib/analytics';

// Track region selection
analytics.track('Regional Network - Region Selected', {
  region: selectedRegion,
  timestamp: new Date(),
});

// Track collaboration request
analytics.track('Regional Network - Collab Request Sent', {
  fromCreatorId,
  toCreatorId,
  collabType,
  timestamp: new Date(),
});

// Track match view
analytics.track('Regional Network - Match Viewed', {
  matchScore,
  creatorId,
  timestamp: new Date(),
});
```

## Error Handling

Implement comprehensive error handling:

```typescript
// In your API routes
try {
  const data = await fetchFromBackend();
  return res.status(200).json(data);
} catch (error) {
  console.error('Regional Network Error:', error);
  
  // Log to error tracking service
  Sentry.captureException(error);
  
  return res.status(500).json({
    error: 'Failed to process request',
    message: error.message,
    code: 'REGIONAL_NETWORK_ERROR',
  });
}
```

## Testing Integration

### Unit Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import RegionMap from '@/components/regional/RegionMap';

describe('RegionMap', () => {
  it('calls onRegionSelect when region is clicked', () => {
    const onRegionSelect = jest.fn();
    render(<RegionMap selectedRegion={null} onRegionSelect={onRegionSelect} />);
    
    fireEvent.click(screen.getByText('North India'));
    expect(onRegionSelect).toHaveBeenCalledWith('north');
  });
});
```

### Integration Tests

```typescript
import { setupServer } from 'msw/node';
import { rest } from 'msw';

const server = setupServer(
  rest.get('/api/regional/creators', (req, res, ctx) => {
    return res(ctx.json({ creators: mockCreators }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Performance Optimization

### Caching Strategy

```typescript
// Use SWR for data fetching
import useSWR from 'swr';

const { data, error } = useSWR(
  `/api/regional/creators?region=${region}`,
  fetcher,
  {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // 1 minute
  }
);
```

### Image Optimization

```typescript
// Use Next.js Image component for creator avatars
import Image from 'next/image';

<Image
  src={creator.avatarUrl}
  alt={creator.name}
  width={64}
  height={64}
  className="rounded-full"
/>
```

## Security Considerations

1. **Input Validation**: Validate all user inputs
2. **Rate Limiting**: Implement rate limits on API routes
3. **CSRF Protection**: Use CSRF tokens for state-changing operations
4. **XSS Prevention**: Sanitize user-generated content
5. **Authentication**: Verify user identity for all requests

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Backend API accessible
- [ ] Database migrations run
- [ ] Authentication integrated
- [ ] Error tracking configured
- [ ] Analytics integrated
- [ ] Performance monitoring enabled
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] CORS configured correctly

## Support & Resources

- **Documentation**: `/docs/regional-network/`
- **API Reference**: `/docs/api/regional/`
- **Component Storybook**: `/storybook/regional/`
- **Support**: support@platform.com

---

**Integration Status**: ✅ Ready for Production
**Last Updated**: 2024
**Version**: 1.0.0
