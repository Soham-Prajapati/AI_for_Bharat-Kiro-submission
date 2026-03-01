# ContentMultiplierV2 Integration Guide

## Quick Start

### 1. Import the Component

```tsx
import ContentMultiplierV2 from '@/components/ContentMultiplierV2'
```

### 2. Basic Implementation

```tsx
export default function ContentPage() {
  return (
    <div className="container mx-auto p-6">
      <ContentMultiplierV2
        videoId="video-123"
        transcript="Your video transcript..."
      />
    </div>
  )
}
```

## Integration Scenarios

### Scenario 1: Content Generation Workflow

Integrate with the content generation pipeline:

```tsx
'use client'

import { useState } from 'react'
import ContentMultiplierV2 from '@/components/ContentMultiplierV2'
import apiClient from '@/services/api'

export default function GeneratePage() {
  const [transcript, setTranscript] = useState('')
  const [videoId, setVideoId] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      // Step 1: Upload video
      const uploadResponse = await apiClient.upload.file(videoFile)
      
      // Step 2: Process video
      const processResponse = await apiClient.process.start({
        fileId: uploadResponse.fileId
      })
      
      // Step 3: Get transcript
      const statusResponse = await apiClient.process.status(processResponse.jobId)
      setTranscript(statusResponse.transcript)
      setVideoId(uploadResponse.fileId)
    } catch (error) {
      console.error('Generation failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4">
          Upload Video
        </h2>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg"
        >
          {isGenerating ? 'Generating...' : 'Generate Content'}
        </button>
      </div>

      {/* Content Multiplier */}
      {transcript && (
        <ContentMultiplierV2
          videoId={videoId}
          transcript={transcript}
        />
      )}
    </div>
  )
}
```

### Scenario 2: Dashboard Integration

Add to user dashboard for content management:

```tsx
'use client'

import { useState, useEffect } from 'react'
import ContentMultiplierV2 from '@/components/ContentMultiplierV2'
import { useAuth } from '@/hooks/useAuth'

export default function DashboardPage() {
  const { user } = useAuth()
  const [recentContent, setRecentContent] = useState(null)

  useEffect(() => {
    // Load user's recent content
    loadRecentContent()
  }, [user])

  const loadRecentContent = async () => {
    // Fetch from API
    const data = await fetch(`/api/content/${user.id}/recent`)
    setRecentContent(await data.json())
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">
            Quick Stats
          </h3>
          {/* Stats content */}
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-2">
        <ContentMultiplierV2
          initialData={recentContent}
          onExport={(items) => {
            console.log('Exporting:', items)
          }}
        />
      </div>
    </div>
  )
}
```

### Scenario 3: Modal/Dialog Integration

Use in a modal for focused content management:

```tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ContentMultiplierV2 from '@/components/ContentMultiplierV2'

export default function ContentModal({ videoId, transcript, onClose }) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-7xl max-h-[90vh] overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gray-900 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white">
                Content Manager
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-lg"
              >
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <ContentMultiplierV2
                videoId={videoId}
                transcript={transcript}
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
```

### Scenario 4: Real-time Updates

Integrate with WebSocket for live content generation:

```tsx
'use client'

import { useState, useEffect } from 'react'
import ContentMultiplierV2 from '@/components/ContentMultiplierV2'
import { useWebSocket } from '@/hooks/useWebSocket'

export default function LiveGenerationPage() {
  const [contentItems, setContentItems] = useState([])
  const { socket, isConnected } = useWebSocket()

  useEffect(() => {
    if (!socket) return

    // Listen for new content
    socket.on('content:generated', (newItem) => {
      setContentItems(prev => [...prev, newItem])
    })

    // Listen for updates
    socket.on('content:updated', (updatedItem) => {
      setContentItems(prev => 
        prev.map(item => 
          item.id === updatedItem.id ? updatedItem : item
        )
      )
    })

    return () => {
      socket.off('content:generated')
      socket.off('content:updated')
    }
  }, [socket])

  return (
    <div>
      {/* Connection Status */}
      <div className="mb-4 p-4 bg-gray-800 rounded-lg">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`} />
          <span className="text-white">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Content Multiplier */}
      <ContentMultiplierV2
        initialData={{
          clips: contentItems.filter(i => i.type === 'clip'),
          quotes: contentItems.filter(i => i.type === 'quote'),
          audiograms: contentItems.filter(i => i.type === 'audiogram'),
          totalPieces: contentItems.length,
          generatedAt: new Date().toISOString()
        }}
      />
    </div>
  )
}
```

## API Integration

### Fetching Content

```tsx
import apiClient from '@/services/api'

// Generate new content
const generateContent = async (videoId: string, transcript: string) => {
  const response = await apiClient.multiply.generate({
    videoId,
    transcript,
    platforms: ['youtube', 'instagram', 'tiktok', 'linkedin', 'twitter', 'facebook']
  })
  return response
}

// Load existing content
const loadContent = async (userId: string) => {
  const response = await fetch(`/api/content/${userId}`)
  return await response.json()
}
```

### Exporting Content

```tsx
const exportContent = async (items: ContentItem[], format: 'json' | 'csv' | 'pdf') => {
  const response = await apiClient.export.content({
    items,
    format
  })
  
  // Download file
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `content-export-${Date.now()}.${format}`
  link.click()
  URL.revokeObjectURL(url)
}
```

### Scheduling Content

```tsx
const scheduleContent = async (items: ContentItem[], schedule: Date) => {
  const response = await apiClient.automation.create({
    userId: user.id,
    name: 'Scheduled Content',
    trigger: {
      type: 'schedule',
      cron: schedule.toISOString()
    },
    actions: items.map(item => ({
      type: 'publish',
      platform: item.platform,
      contentId: item.id
    }))
  })
  return response
}
```

## State Management

### Using React Context

```tsx
// ContentContext.tsx
import { createContext, useContext, useState } from 'react'

interface ContentContextType {
  content: ContentItem[]
  addContent: (item: ContentItem) => void
  removeContent: (id: string) => void
  updateContent: (id: string, updates: Partial<ContentItem>) => void
}

const ContentContext = createContext<ContentContextType | null>(null)

export function ContentProvider({ children }) {
  const [content, setContent] = useState<ContentItem[]>([])

  const addContent = (item: ContentItem) => {
    setContent(prev => [...prev, item])
  }

  const removeContent = (id: string) => {
    setContent(prev => prev.filter(item => item.id !== id))
  }

  const updateContent = (id: string, updates: Partial<ContentItem>) => {
    setContent(prev => 
      prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    )
  }

  return (
    <ContentContext.Provider value={{ content, addContent, removeContent, updateContent }}>
      {children}
    </ContentContext.Provider>
  )
}

export const useContent = () => {
  const context = useContext(ContentContext)
  if (!context) throw new Error('useContent must be used within ContentProvider')
  return context
}
```

### Using with ContentMultiplierV2

```tsx
import { useContent } from '@/context/ContentContext'
import ContentMultiplierV2 from '@/components/ContentMultiplierV2'

export default function ContentPage() {
  const { content, removeContent } = useContent()

  const handleExport = (items: ContentItem[]) => {
    // Export logic
  }

  return (
    <ContentMultiplierV2
      initialData={{
        clips: content.filter(i => i.type === 'clip'),
        quotes: content.filter(i => i.type === 'quote'),
        audiograms: content.filter(i => i.type === 'audiogram'),
        totalPieces: content.length,
        generatedAt: new Date().toISOString()
      }}
      onExport={handleExport}
    />
  )
}
```

## Styling Customization

### Custom Theme

```tsx
// Create a custom theme wrapper
export default function ThemedContentMultiplier(props) {
  return (
    <div className="custom-theme">
      <style jsx global>{`
        .custom-theme {
          --color-primary: #8b5cf6;
          --color-secondary: #ec4899;
          --color-background: #1f2937;
          --color-surface: #374151;
        }
      `}</style>
      <ContentMultiplierV2 {...props} />
    </div>
  )
}
```

### Override Styles

```tsx
// Add custom CSS module
import styles from './CustomMultiplier.module.css'

export default function CustomMultiplier(props) {
  return (
    <div className={styles.wrapper}>
      <ContentMultiplierV2 {...props} />
    </div>
  )
}
```

## Testing

### Unit Tests

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import ContentMultiplierV2 from '@/components/ContentMultiplierV2'

describe('ContentMultiplierV2', () => {
  it('renders content items', () => {
    render(<ContentMultiplierV2 />)
    expect(screen.getByText('Content Multiplier V2')).toBeInTheDocument()
  })

  it('filters content by type', () => {
    render(<ContentMultiplierV2 />)
    const filter = screen.getByRole('combobox')
    fireEvent.change(filter, { target: { value: 'clips' } })
    // Assert filtered results
  })

  it('handles bulk selection', () => {
    render(<ContentMultiplierV2 />)
    const selectAllBtn = screen.getByText('Select All')
    fireEvent.click(selectAllBtn)
    // Assert all items selected
  })
})
```

### Integration Tests

```tsx
import { render, waitFor } from '@testing-library/react'
import ContentMultiplierV2 from '@/components/ContentMultiplierV2'
import apiClient from '@/services/api'

jest.mock('@/services/api')

describe('ContentMultiplierV2 Integration', () => {
  it('loads content from API', async () => {
    const mockData = {
      clips: [{ id: '1', type: 'clip', title: 'Test Clip' }],
      quotes: [],
      audiograms: [],
      totalPieces: 1,
      generatedAt: new Date().toISOString()
    }

    apiClient.multiply.generate.mockResolvedValue(mockData)

    render(
      <ContentMultiplierV2
        videoId="test-123"
        transcript="Test transcript"
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Test Clip')).toBeInTheDocument()
    })
  })
})
```

## Performance Tips

1. **Lazy Load Images**
   ```tsx
   <img 
     src={item.imageUrl} 
     loading="lazy"
     alt={item.title}
   />
   ```

2. **Debounce Search**
   ```tsx
   import { useDebouncedValue } from '@/hooks/useDebouncedValue'
   
   const debouncedSearch = useDebouncedValue(searchQuery, 300)
   ```

3. **Memoize Expensive Calculations**
   ```tsx
   const sortedContent = useMemo(() => {
     return [...content].sort(sortFunction)
   }, [content, sortFunction])
   ```

4. **Use React.memo for Child Components**
   ```tsx
   const ContentCard = React.memo(({ item, onSelect }) => {
     // Component logic
   })
   ```

## Troubleshooting

### Issue: Slow rendering with 100+ items
**Solution**: Ensure virtualization is enabled and buffer size is appropriate

### Issue: Memory leaks
**Solution**: Clean up event listeners and cancel pending requests in useEffect cleanup

### Issue: Animations stuttering
**Solution**: Use CSS transforms instead of layout properties, reduce animation complexity

## Best Practices

1. **Always provide a key prop** when rendering lists
2. **Use useCallback** for event handlers passed to child components
3. **Implement error boundaries** for graceful error handling
4. **Add loading states** for better UX
5. **Test with realistic data** (100+ items)
6. **Monitor performance** with React DevTools Profiler

## Support & Resources

- Component README: `ContentMultiplierV2.README.md`
- API Documentation: `/docs/api/`
- Type Definitions: `/types/api.ts`
- Examples: `/examples/content-multiplier/`

---

**Last Updated:** February 27, 2026  
**Version:** 2.0.0
