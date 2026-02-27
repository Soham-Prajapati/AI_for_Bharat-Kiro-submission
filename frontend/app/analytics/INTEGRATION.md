# Analytics Dashboard Integration Guide

## Quick Start

The analytics dashboard is ready to use at `/analytics`. All components are self-contained with mock data.

## Integrating Real Data

### Step 1: Create API Service

Create `frontend/services/analytics.ts`:

```typescript
import { PlatformData, EngagementDataPoint, Recommendation } from '@/types/analytics';

export async function fetchPlatformData(): Promise<PlatformData[]> {
  const response = await fetch('/api/analytics/platforms');
  return response.json();
}

export async function fetchEngagementData(): Promise<EngagementDataPoint[]> {
  const response = await fetch('/api/analytics/engagement');
  return response.json();
}

export async function fetchRecommendations(): Promise<Recommendation[]> {
  const response = await fetch('/api/analytics/recommendations');
  return response.json();
}
```

### Step 2: Update Analytics Page

Replace mock data with API calls:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { fetchPlatformData, fetchEngagementData, fetchRecommendations } from '@/services/analytics';

export default function AnalyticsPage() {
  const [platformsData, setPlatformsData] = useState<PlatformData[]>([]);
  const [engagementData, setEngagementData] = useState<EngagementDataPoint[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [platforms, engagement, recs] = await Promise.all([
          fetchPlatformData(),
          fetchEngagementData(),
          fetchRecommendations(),
        ]);
        
        setPlatformsData(platforms);
        setEngagementData(engagement);
        setRecommendations(recs);
      } catch (error) {
        console.error('Failed to load analytics data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  // Rest of component...
}
```

### Step 3: Backend API Endpoints

Create these endpoints in your backend:

#### GET /api/analytics/platforms
Returns array of PlatformData objects.

#### GET /api/analytics/engagement
Returns array of EngagementDataPoint objects.

#### GET /api/analytics/recommendations
Returns array of Recommendation objects.

## Platform API Integration

### YouTube Data API
```typescript
async function fetchYouTubeData(channelId: string) {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${API_KEY}`
  );
  const data = await response.json();
  
  return {
    platform: 'youtube',
    followers: parseInt(data.items[0].statistics.subscriberCount),
    // ... map other fields
  };
}
```

### Instagram Graph API
```typescript
async function fetchInstagramData(userId: string, accessToken: string) {
  const response = await fetch(
    `https://graph.instagram.com/${userId}?fields=followers_count,media_count&access_token=${accessToken}`
  );
  const data = await response.json();
  
  return {
    platform: 'instagram',
    followers: data.followers_count,
    // ... map other fields
  };
}
```

### LinkedIn API
```typescript
async function fetchLinkedInData(organizationId: string, accessToken: string) {
  const response = await fetch(
    `https://api.linkedin.com/v2/organizations/${organizationId}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );
  const data = await response.json();
  
  return {
    platform: 'linkedin',
    followers: data.followersCount,
    // ... map other fields
  };
}
```

### Twitter API v2
```typescript
async function fetchTwitterData(userId: string, bearerToken: string) {
  const response = await fetch(
    `https://api.twitter.com/2/users/${userId}?user.fields=public_metrics`,
    {
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
      },
    }
  );
  const data = await response.json();
  
  return {
    platform: 'twitter',
    followers: data.data.public_metrics.followers_count,
    // ... map other fields
  };
}
```

### TikTok API
```typescript
async function fetchTikTokData(username: string, accessToken: string) {
  const response = await fetch(
    `https://open-api.tiktok.com/user/info/?open_id=${username}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );
  const data = await response.json();
  
  return {
    platform: 'tiktok',
    followers: data.data.user.follower_count,
    // ... map other fields
  };
}
```

### Facebook Graph API
```typescript
async function fetchFacebookData(pageId: string, accessToken: string) {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/${pageId}?fields=followers_count,engagement&access_token=${accessToken}`
  );
  const data = await response.json();
  
  return {
    platform: 'facebook',
    followers: data.followers_count,
    // ... map other fields
  };
}
```

## Calculating Engagement Rate

```typescript
function calculateEngagementRate(likes: number, comments: number, shares: number, followers: number): number {
  const totalEngagement = likes + comments + shares;
  return totalEngagement / followers;
}
```

## Generating Recommendations

```typescript
function generateRecommendations(platforms: PlatformData[]): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  // Find best performing platform
  const bestPlatform = platforms.reduce((best, current) => 
    current.engagement > best.engagement ? current : best
  );
  
  // Find growing platforms
  const growingPlatforms = platforms.filter(p => p.trend === 'up');
  
  // Find declining platforms
  const decliningPlatforms = platforms.filter(p => p.trend === 'down');
  
  // Generate recommendations based on analysis
  if (growingPlatforms.length > 0) {
    recommendations.push({
      id: generateId(),
      priority: 'high',
      message: `${PLATFORM_NAMES[growingPlatforms[0].platform]} is growing fast. Increase posting frequency.`,
      platform: growingPlatforms[0].platform,
    });
  }
  
  // ... more recommendation logic
  
  return recommendations;
}
```

## Caching Strategy

Use caching to reduce API calls:

```typescript
import { unstable_cache } from 'next/cache';

export const getCachedPlatformData = unstable_cache(
  async () => fetchPlatformData(),
  ['platform-data'],
  { revalidate: 3600 } // Cache for 1 hour
);
```

## Error Handling

```typescript
try {
  const data = await fetchPlatformData();
  setPlatformsData(data);
} catch (error) {
  if (error instanceof Error) {
    toast.error(`Failed to load analytics: ${error.message}`);
  }
  // Fallback to cached data or show error state
}
```

## Testing

```typescript
import { render, screen } from '@testing-library/react';
import AnalyticsPage from './page';

describe('AnalyticsPage', () => {
  it('renders platform cards', () => {
    render(<AnalyticsPage />);
    expect(screen.getByText('YouTube')).toBeInTheDocument();
    expect(screen.getByText('Instagram')).toBeInTheDocument();
  });
  
  it('displays engagement chart', () => {
    render(<AnalyticsPage />);
    expect(screen.getByText('Engagement Over Time')).toBeInTheDocument();
  });
});
```

## Performance Optimization

1. **Lazy load charts**: Use dynamic imports for Recharts
2. **Virtualize lists**: For large recommendation lists
3. **Debounce updates**: When filtering or searching
4. **Memoize calculations**: Use useMemo for derived data
5. **Optimize images**: Use Next.js Image component for platform icons

## Security Considerations

1. **API Keys**: Store in environment variables
2. **Rate Limiting**: Implement on backend
3. **Data Validation**: Validate all API responses
4. **CORS**: Configure properly for API calls
5. **Authentication**: Require user authentication for analytics access
