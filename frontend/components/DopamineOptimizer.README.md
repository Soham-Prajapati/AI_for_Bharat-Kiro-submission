# DopamineOptimizer Component

A comprehensive React component for analyzing and optimizing content engagement using AI-powered dopamine trigger analysis.

## Features

- **Overall Engagement Score**: Visual gauge showing comprehensive content analysis (0-100)
- **Hooks Analysis**: Identifies and rates opening hooks and engagement triggers
- **Emotional Peaks**: Tracks emotional intensity throughout content
- **Pacing Analysis**: Evaluates content rhythm and sentence variety
- **Retention Prediction**: Predicts viewer retention with dropoff points
- **Cliffhangers**: Identifies suspense and engagement maintenance techniques
- **Improvement Suggestions**: Prioritized recommendations for optimization
- **Responsive Design**: Mobile, tablet, and desktop optimized
- **Smooth Animations**: Framer Motion powered transitions

## Installation

```bash
npm install framer-motion
```

## Usage

### Basic Usage

```tsx
import DopamineOptimizer from '@/components/DopamineOptimizer'

export default function ContentAnalysis() {
  return <DopamineOptimizer />
}
```

### With Custom Data

```tsx
import DopamineOptimizer, { DopamineOptimizationResult } from '@/components/DopamineOptimizer'

const analysisData: DopamineOptimizationResult = {
  overallScore: 76,
  hooks: [...],
  emotionalPeaks: [...],
  pacingAnalysis: {...},
  cliffhangers: [...],
  retentionPrediction: {...},
  improvements: [...]
}

export default function ContentAnalysis() {
  return <DopamineOptimizer data={analysisData} />
}
```

### With API Integration

```tsx
'use client'

import { useState, useEffect } from 'react'
import DopamineOptimizer, { DopamineOptimizationResult } from '@/components/DopamineOptimizer'

export default function ContentAnalysis() {
  const [data, setData] = useState<DopamineOptimizationResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAnalysis() {
      try {
        const response = await fetch('/api/dopamine-optimizer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: 'Your content here...',
            contentType: 'video_script',
            targetPlatform: 'youtube'
          })
        })
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error('Failed to fetch analysis:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalysis()
  }, [])

  if (loading) return <div>Analyzing content...</div>
  if (!data) return <div>Failed to load analysis</div>

  return <DopamineOptimizer data={data} />
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `DopamineOptimizationResult` | Mock data | Analysis results from backend service |
| `animated` | `boolean` | `true` | Enable/disable animations |
| `showTimeline` | `boolean` | `true` | Show pacing timeline visualization |
| `showImprovements` | `boolean` | `true` | Display improvement suggestions |

## Data Structure

### DopamineOptimizationResult

```typescript
interface DopamineOptimizationResult {
  overallScore: number              // 0-100
  hooks: Hook[]
  emotionalPeaks: EmotionalPeak[]
  pacingAnalysis: PacingAnalysis
  cliffhangers: Cliffhanger[]
  retentionPrediction: RetentionPrediction
  improvements: Improvement[]
  optimizedContent?: string
}
```

### Hook

```typescript
interface Hook {
  position: number
  type: 'question' | 'shock' | 'curiosity' | 'promise' | 'pattern_interrupt' | 'story'
  strength: number                  // 0-100
  text: string
  reasoning: string
  suggestions?: string[]
}
```

### EmotionalPeak

```typescript
interface EmotionalPeak {
  position: number
  timestamp?: number                // seconds
  emotion: 'excitement' | 'surprise' | 'curiosity' | 'fear' | 'joy' | 'anticipation'
  intensity: number                 // 0-100
  trigger: string
  context: string
}
```

### PacingAnalysis

```typescript
interface PacingAnalysis {
  overallPace: 'too_slow' | 'slow' | 'optimal' | 'fast' | 'too_fast'
  paceScore: number                 // 0-100
  sentenceVariety: number           // 0-100
  rhythmScore: number               // 0-100
  recommendations: string[]
  timeline?: PacingTimeline[]
}
```

### RetentionPrediction

```typescript
interface RetentionPrediction {
  predictedRetention: number        // 0-100 percentage
  dropoffPoints: DropoffPoint[]
  strongPoints: StrongPoint[]
  averageWatchTime: number          // seconds
  confidence: number                // 0-1
}
```

### Improvement

```typescript
interface Improvement {
  category: 'hook' | 'pacing' | 'emotion' | 'cliffhanger' | 'retention' | 'structure'
  priority: 'critical' | 'high' | 'medium' | 'low'
  issue: string
  suggestion: string
  expectedImpact: string
  implementation: string
}
```

## Styling

The component uses Tailwind CSS with a dark theme. Key color schemes:

- **Score Colors**: Red (0-39), Orange (40-59), Blue (60-79), Green (80-100)
- **Priority Colors**: Critical (red), High (orange), Medium (blue), Low (gray)
- **Background**: Dark gray with backdrop blur
- **Borders**: Gray-700 with hover effects

## Accessibility

- ARIA labels on interactive elements
- Keyboard navigation support
- Color contrast meets WCAG AA standards
- Screen reader friendly content structure

## Performance Optimization

- Lazy rendering of detailed sections
- Memoized calculations for large datasets
- Optimized animations with Framer Motion
- Efficient re-renders with React hooks

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Related Components

- `ViralScoreGauge`: Viral potential scoring
- `TrendDashboard`: Trend analysis and predictions
- `DNAChart`: Content DNA visualization

## Backend Integration

Connects to `src/services/dopamine-optimizer.service.ts`:

```typescript
import { dopamineOptimizerService } from '@/services/dopamine-optimizer.service'

const result = await dopamineOptimizerService.optimizeContent({
  content: 'Your content...',
  contentType: 'video_script',
  duration: 60,
  targetPlatform: 'youtube'
})
```

## Examples

See `DopamineOptimizer.example.tsx` for complete usage examples.

## License

MIT
