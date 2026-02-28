# CulturalSettings Component - Integration Guide

## Overview

The `CulturalSettings` component provides a complete UI for adapting content to different regional audiences. It integrates with the cultural adaptation API to automatically replace region-specific references, festivals, currencies, and measurements.

## Features

- ✅ Region selection with visual flags
- ✅ Real-time content adaptation
- ✅ Loading states with skeleton UI
- ✅ Error handling with user-friendly messages
- ✅ Automatic caching of adaptation results
- ✅ Changes breakdown with visual indicators
- ✅ Confidence scoring
- ✅ Smooth animations (optional)

## API Integration

### Endpoints Used

1. **GET /api/cultural/regions** - Fetch available regions
2. **POST /api/cultural/adapt** - Adapt content for a target region

### Type Definitions

```typescript
// Request
interface CulturalAdaptRequest {
  content: string
  targetRegion: string
}

// Response
interface CulturalAdaptResponse {
  success: boolean
  adaptation: CulturalAdaptation
  adaptedAt: string
}

interface CulturalAdaptation {
  originalContent: string
  adaptedContent: string
  targetRegion: string
  changes: CulturalChange[]
  confidence: number
}

interface CulturalChange {
  original: string
  adapted: string
  type: 'idiom' | 'festival' | 'currency' | 'measurement' | 'reference'
}
```

## Basic Usage

### Simple Integration

```tsx
import CulturalSettings from '@/components/CulturalSettings'

export default function MyPage() {
  return (
    <div className="container mx-auto p-6">
      <CulturalSettings />
    </div>
  )
}
```

### With Initial Content

```tsx
import CulturalSettings from '@/components/CulturalSettings'

export default function ContentEditor() {
  const initialContent = "Join us for our Thanksgiving sale! Get 50% off, that's just $99!"

  return (
    <CulturalSettings 
      initialContent={initialContent}
    />
  )
}
```

### With Callback

```tsx
import { useState } from 'react'
import CulturalSettings from '@/components/CulturalSettings'
import { CulturalAdaptation } from '@/types/api'

export default function ContentManager() {
  const [adaptedContent, setAdaptedContent] = useState<string>('')

  const handleAdaptation = (adaptation: CulturalAdaptation) => {
    console.log('Adaptation complete:', adaptation)
    setAdaptedContent(adaptation.adaptedContent)
    
    // Save to database, update state, etc.
  }

  return (
    <div>
      <CulturalSettings 
        onAdaptationComplete={handleAdaptation}
      />
      
      {adaptedContent && (
        <div className="mt-4">
          <h3>Ready to publish:</h3>
          <p>{adaptedContent}</p>
        </div>
      )}
    </div>
  )
}
```

## Advanced Usage

### Custom Integration with Form

```tsx
'use client'

import { useState } from 'react'
import CulturalSettings from '@/components/CulturalSettings'
import { CulturalAdaptation } from '@/types/api'

export default function ContentPublisher() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [adaptedDescription, setAdaptedDescription] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('us')

  const handleAdaptation = (adaptation: CulturalAdaptation) => {
    setAdaptedDescription(adaptation.adaptedContent)
    setSelectedRegion(adaptation.targetRegion)
  }

  const handlePublish = async () => {
    const content = {
      title,
      description: adaptedDescription || description,
      region: selectedRegion
    }
    
    // Publish to your backend
    await fetch('/api/content/publish', {
      method: 'POST',
      body: JSON.stringify(content)
    })
  }

  return (
    <div className="space-y-6">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Content Title"
        className="w-full p-3 rounded-lg"
      />

      <CulturalSettings
        initialContent={description}
        onAdaptationComplete={handleAdaptation}
        showPreview={true}
        animated={true}
      />

      <button
        onClick={handlePublish}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg"
      >
        Publish Content
      </button>
    </div>
  )
}
```

### Direct API Usage (Without Component)

```tsx
import { useState } from 'react'
import apiClient from '@/services/api'
import { CulturalAdaptation } from '@/types/api'

export default function CustomAdapter() {
  const [loading, setLoading] = useState(false)
  const [adaptation, setAdaptation] = useState<CulturalAdaptation | null>(null)
  const [error, setError] = useState<string | null>(null)

  const adaptContent = async (content: string, region: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiClient.cultural.adapt({
        content,
        targetRegion: region
      })
      
      setAdaptation(response.adaptation)
      return response.adaptation
    } catch (err: any) {
      setError(err.message || 'Failed to adapt content')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button onClick={() => adaptContent('Hello world!', 'india')}>
        Adapt for India
      </button>
      
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {adaptation && <p>{adaptation.adaptedContent}</p>}
    </div>
  )
}
```

## Loading States

The component handles three loading states:

1. **Initial regions loading** - Shows skeleton cards while fetching available regions
2. **Content adaptation loading** - Shows spinner button and loading message
3. **Cached results** - Instant display from cache (no loading)

```tsx
// Loading states are handled automatically
<CulturalSettings />

// Disable animations for faster perceived performance
<CulturalSettings animated={false} />
```

## Error Handling

The component gracefully handles errors:

```tsx
// Errors are displayed automatically
<CulturalSettings />

// Errors include:
// - Network failures
// - Invalid content
// - API errors
// - Validation errors
```

### Custom Error Handling

```tsx
import { useState } from 'react'
import apiClient from '@/services/api'

const MyComponent = () => {
  const [error, setError] = useState<string | null>(null)

  const handleAdapt = async () => {
    try {
      const result = await apiClient.cultural.adapt({
        content: 'My content',
        targetRegion: 'india'
      })
      // Success
    } catch (err: any) {
      if (err.statusCode === 400) {
        setError('Invalid content or region')
      } else if (err.statusCode === 429) {
        setError('Too many requests. Please try again later.')
      } else {
        setError('An unexpected error occurred')
      }
    }
  }

  return <div>{/* Your UI */}</div>
}
```

## Caching

The component automatically caches adaptation results to improve performance:

```tsx
// Cache key format: `${region}:${content.substring(0, 100)}`
// Cache is stored in component state (resets on unmount)

// For persistent caching, use localStorage:
const CACHE_KEY = 'cultural_adaptations'

const saveToCache = (adaptation: CulturalAdaptation) => {
  const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}')
  const key = `${adaptation.targetRegion}:${adaptation.originalContent.substring(0, 100)}`
  cache[key] = adaptation
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
}

const loadFromCache = (content: string, region: string) => {
  const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}')
  const key = `${region}:${content.substring(0, 100)}`
  return cache[key] || null
}
```

## Fetching Available Regions

```tsx
import { useState, useEffect } from 'react'
import apiClient from '@/services/api'

export default function RegionSelector() {
  const [regions, setRegions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadRegions = async () => {
      try {
        const response = await apiClient.cultural.getRegions()
        setRegions(response.regions)
      } catch (err) {
        console.error('Failed to load regions:', err)
        // Fallback to default regions
        setRegions(['india', 'uk', 'us', 'canada', 'australia'])
      } finally {
        setLoading(false)
      }
    }

    loadRegions()
  }, [])

  return (
    <div>
      {loading ? (
        <p>Loading regions...</p>
      ) : (
        <select>
          {regions.map(region => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialContent` | `string` | `''` | Initial content to display in the textarea |
| `onAdaptationComplete` | `(adaptation: CulturalAdaptation) => void` | `undefined` | Callback fired when adaptation completes |
| `showPreview` | `boolean` | `true` | Whether to show the adapted content preview |
| `animated` | `boolean` | `true` | Enable/disable animations |

## Styling

The component uses Tailwind CSS and follows the project's design system:

- Dark theme with gray-800/900 backgrounds
- Purple/pink gradient accents
- Smooth animations with Framer Motion
- Responsive grid layouts
- Backdrop blur effects

### Customization

```tsx
// Wrap in a custom container for different styling
<div className="my-custom-container">
  <CulturalSettings />
</div>

// Or create a themed variant
<div className="light-theme">
  <CulturalSettings />
</div>
```

## Best Practices

1. **Always validate content** before sending to API
2. **Use caching** to reduce API calls for repeated content
3. **Handle errors gracefully** with user-friendly messages
4. **Show loading states** for better UX
5. **Provide feedback** when adaptation completes
6. **Consider rate limiting** for high-traffic applications
7. **Test with various content types** (short, long, special characters)

## Performance Tips

1. **Debounce input** if adapting on every keystroke
2. **Use cache** for frequently adapted content
3. **Lazy load** the component if not immediately visible
4. **Disable animations** on slower devices
5. **Batch requests** if adapting multiple pieces of content

## Example: Debounced Adaptation

```tsx
import { useState, useEffect, useCallback } from 'react'
import { debounce } from 'lodash'
import apiClient from '@/services/api'

export default function LiveAdapter() {
  const [content, setContent] = useState('')
  const [adapted, setAdapted] = useState('')

  const adaptContent = useCallback(
    debounce(async (text: string, region: string) => {
      if (!text.trim()) return
      
      try {
        const response = await apiClient.cultural.adapt({
          content: text,
          targetRegion: region
        })
        setAdapted(response.adaptation.adaptedContent)
      } catch (err) {
        console.error('Adaptation failed:', err)
      }
    }, 500),
    []
  )

  useEffect(() => {
    adaptContent(content, 'india')
  }, [content, adaptContent])

  return (
    <div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type to adapt in real-time..."
      />
      <div>Adapted: {adapted}</div>
    </div>
  )
}
```

## Troubleshooting

### Issue: Regions not loading
**Solution**: Check API endpoint is accessible and returns correct format

### Issue: Adaptation not working
**Solution**: Verify content is not empty and region is valid

### Issue: Cache not working
**Solution**: Ensure cache key generation is consistent

### Issue: Slow performance
**Solution**: Enable caching, debounce input, disable animations

## Related Components

- `ModeSelector` - Similar pattern for mode selection
- `DNAChart` - Similar data visualization approach
- `ViralScoreGauge` - Similar API integration pattern
- `ROIDashboard` - Similar loading states and error handling
