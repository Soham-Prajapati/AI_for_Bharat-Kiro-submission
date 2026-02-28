# ViralScoreGauge Component - Integration Guide

## Overview

The `ViralScoreGauge` component displays viral potential scores with an animated gauge visualization, key factors breakdown, and actionable recommendations. It follows the same patterns as other chart components in the project (DNAChart, AnalyticsChart, EngagementChart).

## Features

- **Animated Gauge**: Smooth 180-degree arc gauge with color-coded scoring
- **Score Counter**: Animated number counter from 0 to final score
- **Key Factors**: Breakdown of individual factors contributing to the score
- **Recommendations**: AI-generated suggestions for improvement
- **Responsive Design**: Works on all screen sizes
- **Consistent Styling**: Matches project's design system

## API Integration

### 1. API Endpoint (Already Available)

The viral prediction endpoint is already defined in `frontend/services/api.ts`:

```typescript
viral = {
  predict: (data: ViralPredictRequest) =>
    this.request<ViralPredictResponse>('/api/viral/predict', {
      method: 'POST',
      body: data,
    }),
};
```

### 2. Type Definitions (Already Available)

Types are defined in `frontend/types/api.ts`:

```typescript
export interface ViralPredictRequest {
  transcript: string;
  metadata?: Record<string, any>;
}

export interface ViralPrediction {
  score: number;
  factors: Array<{
    name: string;
    impact: number;
    description: string;
  }>;
  recommendations: string[];
}

export interface ViralPredictResponse {
  success: boolean;
  prediction: ViralPrediction;
  analyzedAt: string;
}
```

## Usage Examples

### Basic Usage (with Mock Data)

```tsx
import ViralScoreGauge from '@/components/ViralScoreGauge'

export default function MyPage() {
  return (
    <div>
      <ViralScoreGauge />
    </div>
  )
}
```

### With Real API Data

```tsx
'use client'

import { useState, useEffect } from 'react'
import ViralScoreGauge from '@/components/ViralScoreGauge'
import apiClient from '@/services/api'
import { ViralPrediction } from '@/types/api'

export default function ContentAnalysisPage() {
  const [viralData, setViralData] = useState<ViralPrediction | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyzeContent = async (transcript: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await apiClient.viral.predict({ transcript })
      setViralData(response.prediction)
    } catch (err: any) {
      setError(err.message || 'Failed to analyze content')
      console.error('Viral prediction error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      {loading && <div>Analyzing content...</div>}
      {error && <div className="text-red-500">{error}</div>}
      
      {viralData && (
        <ViralScoreGauge 
          data={viralData}
          animated={true}
          showFactors={true}
          showRecommendations={true}
        />
      )}
    </div>
  )
}
```

### With AppContext Integration

```tsx
'use client'

import { useState } from 'react'
import { useAppContext } from '@/context/AppContext'
import ViralScoreGauge from '@/components/ViralScoreGauge'
import apiClient from '@/services/api'
import { ViralPrediction } from '@/types/api'

export default function DashboardPage() {
  const { state, dispatch, actions } = useAppContext()
  const [viralData, setViralData] = useState<ViralPrediction | null>(null)

  const analyzeCurrentContent = async () => {
    if (!state.content.currentItem) return

    dispatch(actions.setLoading(true))
    
    try {
      const response = await apiClient.viral.predict({
        transcript: state.content.currentItem.content
      })
      setViralData(response.prediction)
      dispatch(actions.clearError())
    } catch (err: any) {
      dispatch(actions.setError(err.message))
    } finally {
      dispatch(actions.setLoading(false))
    }
  }

  return (
    <div>
      <button onClick={analyzeCurrentContent}>
        Analyze Viral Potential
      </button>
      
      {viralData && <ViralScoreGauge data={viralData} />}
    </div>
  )
}
```

### Custom Styling & Props

```tsx
<ViralScoreGauge 
  data={customData}
  animated={false}           // Disable animations
  showFactors={false}        // Hide factors section
  showRecommendations={true} // Show only recommendations
/>
```

## Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `ViralScoreData` | Mock data | Viral score data object |
| `animated` | `boolean` | `true` | Enable/disable animations |
| `showFactors` | `boolean` | `true` | Show/hide factors breakdown |
| `showRecommendations` | `boolean` | `true` | Show/hide recommendations |

## Data Structure

```typescript
interface ViralScoreData {
  score: number                // 0-100 viral potential score
  factors: ViralFactor[]       // Contributing factors
  recommendations: string[]    // Improvement suggestions
}

interface ViralFactor {
  name: string                 // Factor name
  impact: number               // 0-100 impact score
  description: string          // Factor description
}
```

## Color Coding

The component uses color-coded scoring:

- **Green (80-100)**: Excellent viral potential
- **Amber (60-79)**: Good viral potential
- **Orange (40-59)**: Fair viral potential
- **Red (0-39)**: Needs improvement

## Integration Patterns

### Pattern 1: Dashboard Widget

Add to existing dashboard alongside other analytics:

```tsx
// frontend/app/dashboard/page.tsx
import ViralScoreGauge from '@/components/ViralScoreGauge'

<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <AnalyticsChart data={analyticsData} />
  <ViralScoreGauge data={viralData} />
</div>
```

### Pattern 2: Content Analysis Page

Create dedicated page for viral analysis:

```tsx
// frontend/app/viral-analysis/page.tsx
'use client'

import ViralScoreGauge from '@/components/ViralScoreGauge'
import FileUploader from '@/components/FileUploader'

export default function ViralAnalysisPage() {
  // Implementation here
}
```

### Pattern 3: Modal/Popup

Show as modal after content generation:

```tsx
import { useState } from 'react'
import ViralScoreGauge from '@/components/ViralScoreGauge'

function ContentModal({ content }) {
  const [showViralScore, setShowViralScore] = useState(false)
  
  return (
    <div className="modal">
      {showViralScore && <ViralScoreGauge data={viralData} />}
    </div>
  )
}
```

## Error Handling

```tsx
const analyzeContent = async (transcript: string) => {
  try {
    const response = await apiClient.viral.predict({ transcript })
    setViralData(response.prediction)
  } catch (err) {
    if (err instanceof ValidationError) {
      // Handle validation errors
    } else if (err instanceof NetworkError) {
      // Handle network errors
    } else {
      // Handle other errors
    }
  }
}
```

## Loading States

```tsx
{loading ? (
  <div className="bg-gray-800/50 rounded-xl p-6 animate-pulse">
    <div className="h-64 bg-gray-700 rounded"></div>
  </div>
) : (
  <ViralScoreGauge data={viralData} />
)}
```

## Best Practices

1. **Always handle loading states** - Show skeleton or spinner while fetching data
2. **Implement error boundaries** - Catch and display errors gracefully
3. **Cache results** - Store viral scores to avoid redundant API calls
4. **Validate input** - Ensure transcript is not empty before calling API
5. **Use TypeScript** - Leverage type safety for data structures
6. **Follow project patterns** - Match styling and structure of other components

## Testing

```tsx
// Example test with mock data
import { render, screen } from '@testing-library/react'
import ViralScoreGauge from '@/components/ViralScoreGauge'

test('renders viral score', () => {
  const mockData = {
    score: 85,
    factors: [],
    recommendations: []
  }
  
  render(<ViralScoreGauge data={mockData} animated={false} />)
  expect(screen.getByText('85')).toBeInTheDocument()
})
```

## Dependencies

The component uses:
- `framer-motion` - For animations (already in project)
- `react` - Core React hooks
- Tailwind CSS - For styling (already configured)

No additional dependencies needed!

## Troubleshooting

### Issue: Gauge not animating
**Solution**: Ensure `animated={true}` prop is set and framer-motion is installed

### Issue: API call fails
**Solution**: Check network tab, verify endpoint URL, ensure auth token is set

### Issue: Colors not showing
**Solution**: Verify Tailwind CSS is properly configured and classes are not purged

### Issue: Component not rendering
**Solution**: Check console for errors, verify all imports are correct

## Next Steps

1. ✅ Component created with proper patterns
2. ✅ API integration documented
3. ✅ Usage examples provided
4. 🔲 Add to desired page (dashboard, analytics, etc.)
5. 🔲 Connect to real API endpoint
6. 🔲 Add loading/error states
7. 🔲 Test with real data
8. 🔲 Add to navigation if needed

## Support

For questions or issues:
- Check existing chart components (DNAChart, AnalyticsChart) for reference
- Review API client documentation in `frontend/services/api.ts`
- Check type definitions in `frontend/types/api.ts`
