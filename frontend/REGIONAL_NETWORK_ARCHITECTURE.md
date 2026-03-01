# Regional Network UI Architecture (Feature #25)

## Overview

The Regional Network UI enables creators to discover and collaborate with other creators in their region. This feature provides intelligent filtering, search, and real-time collaboration request management across India's diverse linguistic and geographic landscape.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Type System](#type-system)
3. [State Management](#state-management)
4. [API Integration](#api-integration)
5. [Component Hierarchy](#component-hierarchy)
6. [Data Flow](#data-flow)
7. [Performance Optimizations](#performance-optimizations)
8. [Error Handling](#error-handling)
9. [Real-time Updates](#real-time-updates)
10. [Testing Strategy](#testing-strategy)

---

## Architecture Overview

### Technology Stack

- **Framework**: Next.js 14 (App Router)
- **State Management**: Custom React Hook (`useRegionalNetwork`)
- **API Client**: Extended `apiClient` from `services/api.ts`
- **Real-time**: WebSocket (optional)
- **UI Components**: React + TailwindCSS
- **Type Safety**: TypeScript (strict mode)

### Design Principles

1. **Single Source of Truth**: All state managed in one hook
2. **Optimistic Updates**: Immediate UI feedback for user actions
3. **Progressive Enhancement**: Core features work without WebSocket
4. **Performance First**: Lazy loading, pagination, debouncing
5. **Type Safety**: Comprehensive TypeScript coverage

---

## Type System

### Core Types

Located in `frontend/types/regional-network.ts`:

```typescript
// Geographic & Language
type Region = 'north' | 'south' | 'east' | 'west' | 'central' | 'northeast';
type Language = 'english' | 'hindi' | 'tamil' | 'telugu' | ...;

// Content & Skills
type ContentDomain = 'education' | 'food' | 'travel' | ...;
type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

// Collaboration
type CollaborationStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';
```

### Data Models

**RegionData**: Geographic region with metadata
```typescript
interface RegionData {
  id: string;
  name: string;
  code: Region;
  languages: Language[];
  creatorCount: number;
  popularDomains: ContentDomain[];
}
```

**CreatorProfile**: Complete creator information
```typescript
interface CreatorProfile {
  id: string;
  name: string;
  region: Region;
  languages: Language[];
  primaryDomain: ContentDomain;
  skills: CreatorSkill[];
  stats: CreatorStats;
  verified: boolean;
  availableForCollab: boolean;
}
```

**CollaborationRequest**: Collaboration proposal
```typescript
interface CollaborationRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: CollaborationStatus;
  message: string;
  proposedProject?: ProjectProposal;
  createdAt: string;
}
```

---

## State Management

### Strategy: Custom Hook Pattern

We use a **custom React hook** (`useRegionalNetwork`) instead of Context API or Redux for:

- **Simplicity**: Single hook import, no provider setup
- **Performance**: No unnecessary re-renders
- **Flexibility**: Easy to extend and test
- **Type Safety**: Full TypeScript inference

### State Structure

```typescript
interface RegionalNetworkState {
  regions: {
    data: RegionData[];
    stats: Record<string, RegionStats>;
    loading: boolean;
    error: string | null;
  };
  creators: {
    data: CreatorProfile[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
    loading: boolean;
    error: string | null;
  };
  filters: CreatorFilters;
  searchQuery: string;
  selectedRegion: Region | null;
  selectedCreator: CreatorProfile | null;
  collaborationRequests: {
    sent: CollaborationRequest[];
    received: CollaborationRequest[];
    loading: boolean;
    error: string | null;
  };
  notifications: {
    unreadCount: number;
    items: WebSocketEvent[];
  };
}
```

### Hook API

```typescript
const {
  // Regions
  regions,
  regionsLoading,
  selectedRegion,
  selectRegion,
  
  // Creators
  creators,
  creatorsLoading,
  creatorsHasMore,
  loadMoreCreators,
  selectCreator,
  
  // Filters
  filters,
  updateFilters,
  resetFilters,
  searchQuery,
  setSearchQuery,
  
  // Collaboration
  collaborationRequests,
  sendCollaborationRequest,
  acceptCollaborationRequest,
  rejectCollaborationRequest,
  
  // Notifications
  notifications,
  clearNotifications,
} = useRegionalNetwork();
```

---

## API Integration

### Endpoint Structure

All regional network endpoints follow the pattern `/api/regional/*`:

```
GET    /api/regional/regions
GET    /api/regional/creators
GET    /api/regional/creators/:id
POST   /api/regional/collaboration/request
GET    /api/regional/collaboration/requests
PATCH  /api/regional/collaboration/request/:id
```

### Integration Flow

1. **Fetch Regions** → Display region cards
2. **Select Region** → Filter creators by region
3. **Fetch Creators** → Display creator list with pagination
4. **Apply Filters** → Refetch creators with filters
5. **Send Collaboration** → POST request + optimistic update
6. **Real-time Updates** → WebSocket events update state

### API Client Extension

Add to `frontend/services/api.ts`:

```typescript
const apiClient = new ApiClient(API_URL);

apiClient.regional = {
  getRegions: (params) => { /* ... */ },
  getCreators: (params) => { /* ... */ },
  getCreator: (creatorId) => { /* ... */ },
  sendCollaborationRequest: (data) => { /* ... */ },
  getCollaborationRequests: (params) => { /* ... */ },
  updateCollaborationRequest: (data) => { /* ... */ },
};
```

---

## Component Hierarchy

```
app/regional-network/
├── page.tsx                          # Main page
└── components/
    ├── RegionSelector.tsx            # Region cards grid
    ├── CreatorList.tsx               # Creator cards with infinite scroll
    ├── CreatorCard.tsx               # Individual creator card
    ├── CreatorFilters.tsx            # Filter sidebar
    ├── CreatorProfileModal.tsx       # Creator detail modal
    ├── CollaborationModal.tsx        # Send collaboration form
    ├── CollaborationRequestList.tsx  # Sent/received requests
    ├── CollaborationRequestCard.tsx  # Individual request card
    └── NotificationBadge.tsx         # Real-time notification indicator
```

### Component Responsibilities

**RegionSelector**
- Display all regions as cards
- Show region stats (creator count, popular domains)
- Handle region selection
- Highlight selected region

**CreatorList**
- Display paginated creator cards
- Implement infinite scroll
- Show loading states
- Handle empty states

**CreatorFilters**
- Multi-select filters (languages, domains, skills)
- Range sliders (followers, engagement)
- Toggle switches (verified, available)
- Reset filters button

**CollaborationModal**
- Form for collaboration request
- Project proposal fields
- Message textarea
- Submit with validation

---

## Data Flow

### 1. Initial Load

```
User visits page
  ↓
useRegionalNetwork() initializes
  ↓
fetchRegions() called
  ↓
API: GET /api/regional/regions
  ↓
State updated with regions
  ↓
UI renders region cards
```

### 2. Region Selection

```
User clicks region card
  ↓
selectRegion(region) called
  ↓
State: selectedRegion = region
State: filters.regions = [region]
State: creators reset
  ↓
fetchCreators() triggered
  ↓
API: GET /api/regional/creators?regions=south
  ↓
State updated with creators
  ↓
UI renders creator list
```

### 3. Filter Application

```
User changes filters
  ↓
updateFilters(newFilters) called
  ↓
State: filters merged
State: creators reset
  ↓
fetchCreators() triggered (debounced)
  ↓
API: GET /api/regional/creators?filters...
  ↓
State updated with filtered creators
  ↓
UI re-renders with new results
```

### 4. Collaboration Request

```
User clicks "Collaborate"
  ↓
CollaborationModal opens
  ↓
User fills form and submits
  ↓
sendCollaborationRequest(data) called
  ↓
Optimistic update: Add to sent requests
  ↓
API: POST /api/regional/collaboration/request
  ↓
Success: Confirm in state
Failure: Rollback optimistic update
  ↓
UI shows success message
```

### 5. Real-time Update (WebSocket)

```
WebSocket receives event
  ↓
Event type: collaboration_request_received
  ↓
State: Add to received requests
State: Increment notification count
  ↓
UI shows notification badge
UI updates request list
```

---

## Performance Optimizations

### 1. Pagination & Infinite Scroll

```typescript
const loadMoreCreators = useCallback(() => {
  if (!creatorsLoading && creatorsHasMore) {
    fetchCreators({ page: page + 1, append: true });
  }
}, [creatorsLoading, creatorsHasMore, page]);

// In component
<InfiniteScroll
  dataLength={creators.length}
  next={loadMoreCreators}
  hasMore={creatorsHasMore}
  loader={<Spinner />}
>
  {creators.map(creator => <CreatorCard key={creator.id} />)}
</InfiniteScroll>
```

### 2. Search Debouncing

```typescript
const setSearchQuery = useCallback((query: string) => {
  setState(prev => ({ ...prev, searchQuery: query }));
  
  if (searchTimeoutRef.current) {
    clearTimeout(searchTimeoutRef.current);
  }
  
  searchTimeoutRef.current = setTimeout(() => {
    fetchCreators(); // Only fetch after 500ms of no typing
  }, 500);
}, []);
```

### 3. Lazy Loading Components

```typescript
const CreatorProfileModal = lazy(() => 
  import('./components/CreatorProfileModal')
);

const CollaborationModal = lazy(() => 
  import('./components/CollaborationModal')
);
```

### 4. Memoization

```typescript
const filteredCreators = useMemo(() => {
  return creators.filter(creator => 
    // Client-side filtering for instant feedback
    matchesFilters(creator, filters)
  );
}, [creators, filters]);

const CreatorCard = memo(({ creator, onCollaborate }) => {
  // Prevent unnecessary re-renders
  return <div>...</div>;
});
```

### 5. Caching Strategy

```typescript
// Cache regions (rarely change)
const REGIONS_CACHE_KEY = 'regional_network_regions';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const fetchRegions = useCallback(async () => {
  const cached = localStorage.getItem(REGIONS_CACHE_KEY);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DURATION) {
      setState(prev => ({ ...prev, regions: { data, loading: false } }));
      return;
    }
  }
  
  // Fetch from API if cache miss or expired
  const response = await apiClient.regional.getRegions();
  localStorage.setItem(REGIONS_CACHE_KEY, JSON.stringify({
    data: response.regions,
    timestamp: Date.now(),
  }));
}, []);
```

---

## Error Handling

### Error Types

1. **Network Errors**: Connection failures, timeouts
2. **API Errors**: 4xx/5xx responses
3. **Validation Errors**: Invalid form data
4. **WebSocket Errors**: Connection drops

### Error Handling Strategy

```typescript
try {
  const response = await apiClient.regional.getCreators(params);
  // Success path
} catch (error: any) {
  if (error instanceof NetworkError) {
    // Show retry button
    setState(prev => ({
      ...prev,
      creators: {
        ...prev.creators,
        error: 'Network error. Please check your connection.',
      },
    }));
  } else if (error instanceof ValidationError) {
    // Show field-specific errors
    setFieldError(error.field, error.message);
  } else {
    // Generic error
    setState(prev => ({
      ...prev,
      creators: {
        ...prev.creators,
        error: error.message || 'Something went wrong',
      },
    }));
  }
}
```

### User-Friendly Error Messages

```typescript
const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
  NOT_FOUND: 'Creator not found. They may have deleted their profile.',
  RATE_LIMIT: 'Too many requests. Please wait a moment and try again.',
  UNAUTHORIZED: 'Please log in to send collaboration requests.',
  VALIDATION_ERROR: 'Please check your input and try again.',
};
```

---

## Real-time Updates

### WebSocket Integration (Optional)

```typescript
const connectWebSocket = useCallback(() => {
  const ws = new WebSocket('ws://localhost:3000/ws');
  
  ws.onmessage = (event) => {
    const wsEvent: WebSocketEvent = JSON.parse(event.data);
    
    switch (wsEvent.type) {
      case 'collaboration_request_received':
        // Add to received requests
        setState(prev => ({
          ...prev,
          collaborationRequests: {
            ...prev.collaborationRequests,
            received: [wsEvent.payload, ...prev.collaborationRequests.received],
          },
          notifications: {
            unreadCount: prev.notifications.unreadCount + 1,
            items: [wsEvent, ...prev.notifications.items],
          },
        }));
        break;
        
      case 'collaboration_request_accepted':
        // Show success notification
        showToast('Your collaboration request was accepted!', 'success');
        break;
    }
  };
  
  ws.onerror = () => {
    // Fallback to polling
    startPolling();
  };
}, []);
```

### Polling Fallback

```typescript
const startPolling = useCallback(() => {
  const interval = setInterval(() => {
    fetchCollaborationRequests();
  }, 30000); // Poll every 30 seconds
  
  return () => clearInterval(interval);
}, []);
```

---

## Testing Strategy

### Unit Tests

```typescript
describe('useRegionalNetwork', () => {
  it('should fetch regions on mount', async () => {
    const { result } = renderHook(() => useRegionalNetwork());
    
    await waitFor(() => {
      expect(result.current.regions).toHaveLength(6);
    });
  });
  
  it('should filter creators by region', async () => {
    const { result } = renderHook(() => useRegionalNetwork());
    
    act(() => {
      result.current.selectRegion('south');
    });
    
    await waitFor(() => {
      expect(result.current.filters.regions).toEqual(['south']);
    });
  });
});
```

### Integration Tests

```typescript
describe('Regional Network Page', () => {
  it('should display creators after selecting region', async () => {
    render(<RegionalNetworkPage />);
    
    const southRegion = screen.getByText('South India');
    fireEvent.click(southRegion);
    
    await waitFor(() => {
      expect(screen.getByText('Tamil Nadu Creators')).toBeInTheDocument();
    });
  });
});
```

---

## Implementation Checklist

- [x] Define TypeScript types
- [x] Create custom hook (`useRegionalNetwork`)
- [x] Implement API service layer
- [ ] Build UI components
- [ ] Add infinite scroll
- [ ] Implement filters
- [ ] Add collaboration modal
- [ ] Integrate WebSocket (optional)
- [ ] Add error boundaries
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Performance optimization
- [ ] Accessibility audit
- [ ] Documentation

---

## Next Steps

1. **Backend API**: Implement `/api/regional/*` endpoints
2. **Database Schema**: Design tables for regions, creators, collaborations
3. **UI Components**: Build React components following design system
4. **Testing**: Write comprehensive test suite
5. **Deployment**: Deploy to staging for testing

---

**Last Updated**: 2024
**Status**: Architecture Complete, Implementation Pending
