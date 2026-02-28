# ContentMultiplier Integration Guide

## Overview

This guide explains how to integrate the `ContentMultiplier` component into your application, including API setup, state management, and common integration patterns.

## Quick Start

### 1. Import the Component

```tsx
import ContentMultiplier from '@/components/ContentMultiplier'
```

### 2. Basic Integration

```tsx
function MyPage() {
  return (
    <ContentMultiplier
      transcript="Your video transcript..."
      onExport={(items) => console.log(items)}
    />
  )
}
```

## Integration Patterns

### Pattern 1: With Upload Flow

Integrate with file upload and processing:

```tsx
import { useState } from 'react'
import ContentMultiplier from '@/components/ContentMultiplier'
import apiClient from '@/services/api'

function ContentCreationFlow() {
  const [videoId, setVideoId] = useState<string>()
  const [transcript, setTranscript] = useState<string>()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleUpload = async (file: File) => {
    setIsProcessing(true)
    
    try {
      // Upload file
      const uploadResponse = await apiClient.upload.file(file)
      setVideoId(uploadResponse.fileId)
      
      // Process video
      const processResponse = await apiClient.process.start({
        fileId: uploadResponse.fileId
      })
      
      // Poll for completion
      const statusResponse = await apiClient.process.getStatus(processResponse.jobId)
      setTranscript(statusResponse.transcript)
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div>
      {!transcript ? (
        <FileUploader onUpload={handleUpload} isLoading={isProcessing} />
      ) : (
        <ContentMultiplier
          videoId={videoId}
          transcript={transcript}
        />
      )}
    </div>
  )
}
```

### Pattern 2: With Dashboard Integration

Integrate into a content dashboard:

```tsx
import { useState, useEffect } from 'react'
import ContentMultiplier from '@/components/ContentMultiplier'

function ContentDashboard() {
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [videos, setVideos] = useState([])

  useEffect(() => {
    // Fetch user's videos
    fetchVideos()
  }, [])

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Sidebar with video list */}
      <div className="col-span-3">
        <VideoList
          videos={videos}
          onSelect={setSelectedVideo}
        />
      </div>
      
      {/* Main content area */}
      <div className="col-span-9">
        {selectedVideo ? (
          <ContentMultiplier
            videoId={selectedVideo.id}
            transcript={selectedVideo.transcript}
          />
        ) : (
          <EmptyState message="Select a video to multiply content" />
        )}
      </div>
    </div>
  )
}
```

### Pattern 3: With Export Management

Handle exports with custom logic:

```tsx
import { useState } from 'react'
import ContentMultiplier from '@/components/ContentMultiplier'

function ContentExportManager() {
  const [exportHistory, setExportHistory] = useState([])
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (items) => {
    setIsExporting(true)
    
    try {
      // Upload to cloud storage
      const uploadPromises = items.map(item => 
        uploadToS3(item.url, item.id)
      )
      const urls = await Promise.all(uploadPromises)
      
      // Save export record
      const exportRecord = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        itemCount: items.length,
        urls
      }
      
      setExportHistory([exportRecord, ...exportHistory])
      
      // Show success notification
      showToast('Export completed successfully!', 'success')
    } catch (error) {
      showToast('Export failed', 'error')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div>
      <ContentMultiplier
        transcript={transcript}
        onExport={handleExport}
      />
      
      {isExporting && <LoadingOverlay message="Exporting content..." />}
      
      <ExportHistory history={exportHistory} />
    </div>
  )
}
```

### Pattern 4: With Analytics Tracking

Track user interactions:

```tsx
import { useEffect } from 'react'
import ContentMultiplier from '@/components/ContentMultiplier'
import { trackEvent } from '@/services/analytics'

function AnalyticsTrackedMultiplier({ videoId, transcript }) {
  useEffect(() => {
    trackEvent('content_multiplier_viewed', { videoId })
  }, [videoId])

  const handleExport = (items) => {
    trackEvent('content_exported', {
      videoId,
      itemCount: items.length,
      types: items.map(i => i.type)
    })
    
    // Handle export
    downloadItems(items)
  }

  return (
    <ContentMultiplier
      videoId={videoId}
      transcript={transcript}
      onExport={handleExport}
    />
  )
}
```

## API Integration

### Backend Route

The component uses the `/api/multiply/generate` endpoint:

```typescript
// Backend: src/routes/multiply.route.ts
router.post('/api/multiply/generate', async (req, res) => {
  const { videoId, transcript, platforms } = req.body
  
  // Generate content
  const result = await multiplyService.generate({
    videoId,
    transcript,
    platforms
  })
  
  res.json(result)
})
```

### API Client Method

```typescript
// Frontend: frontend/services/api.ts
multiply = {
  generate: (data: MultiplyGenerateRequest) =>
    this.request<MultiplyGenerateResponse>('/api/multiply/generate', {
      method: 'POST',
      body: data,
      timeout: 120000, // 2 minutes
    }),
}
```

### Type Definitions

```typescript
// frontend/types/api.ts
export interface MultiplyGenerateRequest {
  videoId?: string
  transcript: string
  platforms: Platform[]
}

export interface MultiplyGenerateResponse {
  clips: Clip[]
  quotes: Quote[]
  audiograms: Audiogram[]
  totalPieces: number
  generatedAt: string
}
```

## State Management

### Local State (Simple)

```tsx
function SimpleIntegration() {
  const [transcript, setTranscript] = useState('')
  
  return (
    <ContentMultiplier transcript={transcript} />
  )
}
```

### Context API (Medium)

```tsx
// ContentContext.tsx
const ContentContext = createContext()

export function ContentProvider({ children }) {
  const [currentVideo, setCurrentVideo] = useState(null)
  const [generatedContent, setGeneratedContent] = useState(null)
  
  return (
    <ContentContext.Provider value={{
      currentVideo,
      setCurrentVideo,
      generatedContent,
      setGeneratedContent
    }}>
      {children}
    </ContentContext.Provider>
  )
}

// Usage
function MyComponent() {
  const { currentVideo } = useContext(ContentContext)
  
  return (
    <ContentMultiplier
      videoId={currentVideo?.id}
      transcript={currentVideo?.transcript}
    />
  )
}
```

### Redux (Complex)

```tsx
// contentSlice.ts
const contentSlice = createSlice({
  name: 'content',
  initialState: {
    videos: [],
    selectedVideo: null,
    multipliedContent: null
  },
  reducers: {
    setSelectedVideo: (state, action) => {
      state.selectedVideo = action.payload
    },
    setMultipliedContent: (state, action) => {
      state.multipliedContent = action.payload
    }
  }
})

// Component
function ReduxIntegration() {
  const dispatch = useDispatch()
  const selectedVideo = useSelector(state => state.content.selectedVideo)
  
  return (
    <ContentMultiplier
      videoId={selectedVideo?.id}
      transcript={selectedVideo?.transcript}
    />
  )
}
```

## Error Handling

### Component-Level

The component handles errors internally:

```tsx
// Inside ContentMultiplier
try {
  const response = await apiClient.multiply.generate(...)
  setContentData(response)
} catch (err) {
  setError(err.message)
  // Error is displayed in UI
}
```

### Parent-Level

You can add additional error handling:

```tsx
function ParentComponent() {
  const [error, setError] = useState(null)
  
  const handleError = (error) => {
    setError(error)
    logErrorToService(error)
    showNotification('Failed to generate content', 'error')
  }
  
  return (
    <ErrorBoundary onError={handleError}>
      <ContentMultiplier transcript={transcript} />
    </ErrorBoundary>
  )
}
```

## Performance Optimization

### Lazy Loading

```tsx
import { lazy, Suspense } from 'react'

const ContentMultiplier = lazy(() => import('@/components/ContentMultiplier'))

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ContentMultiplier transcript={transcript} />
    </Suspense>
  )
}
```

### Memoization

```tsx
import { memo } from 'react'

const MemoizedMultiplier = memo(ContentMultiplier, (prev, next) => {
  return prev.transcript === next.transcript &&
         prev.videoId === next.videoId
})
```

### Code Splitting

```tsx
// Dynamic import
const loadMultiplier = () => import('@/components/ContentMultiplier')

function App() {
  const [showMultiplier, setShowMultiplier] = useState(false)
  
  return (
    <div>
      <button onClick={() => setShowMultiplier(true)}>
        Show Multiplier
      </button>
      
      {showMultiplier && (
        <Suspense fallback={<Loading />}>
          <ContentMultiplier transcript={transcript} />
        </Suspense>
      )}
    </div>
  )
}
```

## Testing Integration

### Unit Tests

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import ContentMultiplier from './ContentMultiplier'

describe('ContentMultiplier', () => {
  it('renders generate button when no content', () => {
    render(<ContentMultiplier transcript="test" />)
    expect(screen.getByText(/Generate/i)).toBeInTheDocument()
  })
  
  it('calls onExport when exporting', async () => {
    const onExport = jest.fn()
    render(<ContentMultiplier transcript="test" onExport={onExport} />)
    
    // Generate content
    fireEvent.click(screen.getByText(/Generate/i))
    
    // Wait for content
    await screen.findByText(/Export All/i)
    
    // Export
    fireEvent.click(screen.getByText(/Export All/i))
    
    expect(onExport).toHaveBeenCalled()
  })
})
```

### Integration Tests

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ContentMultiplier from './ContentMultiplier'
import { server } from '@/mocks/server'

describe('ContentMultiplier Integration', () => {
  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())
  
  it('generates and displays content', async () => {
    render(<ContentMultiplier transcript="test transcript" />)
    
    // Click generate
    await userEvent.click(screen.getByText(/Generate/i))
    
    // Wait for content
    await waitFor(() => {
      expect(screen.getByText(/Total Pieces/i)).toBeInTheDocument()
    })
    
    // Verify content displayed
    expect(screen.getByText(/Clips/i)).toBeInTheDocument()
    expect(screen.getByText(/Quotes/i)).toBeInTheDocument()
  })
})
```

## Common Issues

### Issue 1: Content Not Generating

**Problem**: Generate button doesn't work

**Solution**:
```tsx
// Ensure transcript is provided
<ContentMultiplier
  transcript={transcript || ''}  // Provide default
/>

// Check API endpoint
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL)
```

### Issue 2: Export Not Working

**Problem**: Export doesn't download file

**Solution**:
```tsx
// Check browser permissions
// Verify Blob API support
if (!window.Blob) {
  console.error('Blob API not supported')
}

// Add error handling
const handleExport = (items) => {
  try {
    downloadItems(items)
  } catch (error) {
    console.error('Export failed:', error)
    alert('Export failed. Please try again.')
  }
}
```

### Issue 3: Slow Performance

**Problem**: Component is slow with many items

**Solution**:
```tsx
// Use pagination
const [page, setPage] = useState(1)
const itemsPerPage = 20
const paginatedItems = filteredContent.slice(
  (page - 1) * itemsPerPage,
  page * itemsPerPage
)

// Or use virtual scrolling
import { FixedSizeList } from 'react-window'
```

## Best Practices

1. **Always provide transcript**: Component needs transcript to generate content
2. **Handle errors gracefully**: Wrap in error boundary
3. **Show loading states**: Use loading indicators during generation
4. **Optimize re-renders**: Use memo and useMemo appropriately
5. **Test thoroughly**: Test all user flows
6. **Monitor performance**: Track generation times
7. **Log analytics**: Track user interactions
8. **Provide feedback**: Show success/error messages

## Next Steps

1. Review `ContentMultiplier.README.md` for detailed documentation
2. Check `ContentMultiplier.example.tsx` for usage examples
3. Test integration in your application
4. Monitor performance and user feedback
5. Iterate based on usage patterns

## Support

For integration help:
- Review this guide
- Check example implementations
- Contact development team
- Submit issues on GitHub
