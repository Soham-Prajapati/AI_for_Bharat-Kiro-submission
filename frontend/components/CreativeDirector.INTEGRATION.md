# CreativeDirector Integration Guide

Quick guide for integrating the CreativeDirector component into your application.

## Quick Start

### 1. Basic Integration

```tsx
import CreativeDirector from '@/components/CreativeDirector'

export default function AnalysisPage() {
  return <CreativeDirector contentId="my-content" />
}
```

### 2. With AppContext

```tsx
'use client'

import { useAppContext } from '@/context/AppContext'
import CreativeDirector from '@/components/CreativeDirector'

export default function ContentAnalysisPage() {
  const { state, actions } = useAppContext()
  const currentContent = state.content.currentItem

  const handleAnalysisComplete = (result) => {
    // Save to context
    actions.updateContentItem(currentContent.id, {
      metadata: {
        ...currentContent.metadata,
        lastAnalysis: result,
        analyzedAt: new Date().toISOString(),
      },
    })
  }

  return (
    <CreativeDirector
      contentId={currentContent?.id}
      initialContent={currentContent?.content}
      onAnalysisComplete={handleAnalysisComplete}
    />
  )
}
```

### 3. Dashboard Integration

```tsx
import CreativeDirector from '@/components/CreativeDirector'

export default function Dashboard() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Other dashboard widgets */}
      <div className="col-span-1">
        <CreativeDirector
          showHeader={false}
          contentId="dashboard-content"
          className="h-full"
        />
      </div>
    </div>
  )
}
```

## API Setup

Ensure your API endpoint is configured:

```typescript
// backend/routes/creative-director.ts
router.post('/api/creative-director/analyze', async (req, res) => {
  const { contentId, content } = req.body

  // Your analysis logic here
  const result = {
    contentId,
    score: {
      structure: 85,
      pacing: 78,
      engagement: 92,
      clarity: 88,
      overall: 86,
    },
    feedback: [
      {
        aspect: 'Opening Hook',
        rating: 'excellent',
        comment: 'Strong opening',
      },
    ],
    improvements: ['Add more examples'],
  }

  res.json(result)
})
```

## Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Common Use Cases

### 1. Content Editor Integration

```tsx
import { useState } from 'react'
import CreativeDirector from '@/components/CreativeDirector'

export default function ContentEditor() {
  const [content, setContent] = useState('')
  const [showAnalysis, setShowAnalysis] = useState(false)

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-96"
        />
        <button onClick={() => setShowAnalysis(true)}>
          Analyze
        </button>
      </div>
      {showAnalysis && (
        <div>
          <CreativeDirector
            contentId="editor-content"
            initialContent={content}
            autoAnalyze={true}
          />
        </div>
      )}
    </div>
  )
}
```

### 2. Batch Analysis

```tsx
import { useState } from 'react'
import { ScoreCard } from '@/components/CreativeDirector'

export default function BatchAnalysis() {
  const [results, setResults] = useState([])

  const analyzeMultiple = async (contents) => {
    const analyses = await Promise.all(
      contents.map((content) =>
        apiClient.creativeDirector.analyze({
          contentId: content.id,
          content: content.text,
        })
      )
    )
    setResults(analyses)
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {results.map((result) => (
        <ScoreCard
          key={result.contentId}
          label={result.contentId}
          score={result.score.overall}
        />
      ))}
    </div>
  )
}
```

### 3. Real-time Analysis

```tsx
import { useState, useEffect } from 'react'
import { debounce } from 'lodash'
import CreativeDirector from '@/components/CreativeDirector'

export default function RealTimeAnalysis() {
  const [content, setContent] = useState('')
  const [debouncedContent, setDebouncedContent] = useState('')

  useEffect(() => {
    const handler = debounce(() => {
      setDebouncedContent(content)
    }, 1000)

    handler()
    return () => handler.cancel()
  }, [content])

  return (
    <div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      {debouncedContent && (
        <CreativeDirector
          contentId="realtime"
          initialContent={debouncedContent}
          autoAnalyze={true}
        />
      )}
    </div>
  )
}
```

## Styling Customization

### Custom Theme

```tsx
<CreativeDirector
  className="bg-gradient-to-br from-purple-900 to-blue-900"
  contentId="custom-theme"
/>
```

### Custom Colors

```css
/* globals.css */
.creative-director-custom {
  --score-excellent: #10b981;
  --score-good: #3b82f6;
  --score-fair: #f59e0b;
  --score-poor: #ef4444;
}
```

## Error Handling

```tsx
import { useState } from 'react'
import CreativeDirector from '@/components/CreativeDirector'
import { ApiError } from '@/types/api'

export default function WithErrorHandling() {
  const [error, setError] = useState(null)

  const handleAnalysisComplete = (result) => {
    setError(null)
    // Handle success
  }

  return (
    <div>
      {error && (
        <div className="bg-red-900/20 p-4 rounded-lg mb-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}
      <CreativeDirector
        contentId="error-handling"
        onAnalysisComplete={handleAnalysisComplete}
      />
    </div>
  )
}
```

## Performance Optimization

### Code Splitting

```tsx
import dynamic from 'next/dynamic'

const CreativeDirector = dynamic(
  () => import('@/components/CreativeDirector'),
  {
    loading: () => <div>Loading analysis tool...</div>,
    ssr: false,
  }
)

export default function OptimizedPage() {
  return <CreativeDirector contentId="optimized" />
}
```

### Lazy Loading

```tsx
import { lazy, Suspense } from 'react'

const CreativeDirector = lazy(() => import('@/components/CreativeDirector'))

export default function LazyLoadedPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreativeDirector contentId="lazy" />
    </Suspense>
  )
}
```

## Testing

### Component Test

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CreativeDirector from '@/components/CreativeDirector'
import { AppProvider } from '@/context/AppContext'

test('analyzes content', async () => {
  render(
    <AppProvider>
      <CreativeDirector contentId="test" />
    </AppProvider>
  )

  const textarea = screen.getByPlaceholderText(/paste your content/i)
  fireEvent.change(textarea, { target: { value: 'Test content' } })

  const button = screen.getByText(/analyze content/i)
  fireEvent.click(button)

  await waitFor(() => {
    expect(screen.getByText(/overall score/i)).toBeInTheDocument()
  })
})
```

## Troubleshooting

### Issue: API not responding
**Solution**: Check API_URL environment variable and backend server status

### Issue: Animations not working
**Solution**: Ensure framer-motion is installed: `npm install framer-motion`

### Issue: TypeScript errors
**Solution**: Ensure all types are imported from `@/types/api`

### Issue: Context errors
**Solution**: Wrap component in AppProvider

```tsx
import { AppProvider } from '@/context/AppContext'

<AppProvider>
  <CreativeDirector contentId="test" />
</AppProvider>
```

## Best Practices

1. **Always provide contentId**: Helps with tracking and debugging
2. **Use callbacks**: Handle results in parent components
3. **Validate content**: Check content before analysis
4. **Handle errors**: Provide user-friendly error messages
5. **Optimize performance**: Use code splitting for large apps
6. **Test thoroughly**: Write tests for critical paths

## Migration Guide

### From Custom Implementation

```tsx
// Before
<CustomAnalyzer content={content} onResult={handleResult} />

// After
<CreativeDirector
  contentId="migration"
  initialContent={content}
  onAnalysisComplete={handleResult}
/>
```

### From Other Components

```tsx
// Before
<ViralAnalyzer content={content} />

// After - Use both for comprehensive analysis
<div className="grid grid-cols-2 gap-4">
  <ViralAnalyzer content={content} />
  <CreativeDirector
    contentId="combined"
    initialContent={content}
  />
</div>
```

## Support

For issues or questions:
1. Check the README.md for detailed documentation
2. Review examples in CreativeDirector.example.tsx
3. Check the REVIEW.md for architecture details
4. Open an issue in the project repository

## Version History

- **v1.0.0**: Initial release with core functionality
- Full TypeScript support
- API integration
- Sub-components
- AppContext integration
