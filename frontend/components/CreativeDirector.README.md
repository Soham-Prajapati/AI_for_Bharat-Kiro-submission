# CreativeDirector Component

A comprehensive content analysis component that provides professional feedback on content structure, pacing, engagement, and clarity.

## Features

- **Real-time Content Analysis**: Analyzes content using the Creative Director API
- **Visual Score Display**: Interactive gauge and score cards with animations
- **Detailed Feedback**: Aspect-by-aspect ratings with actionable comments
- **Improvement Suggestions**: Prioritized list of actionable improvements
- **Error Handling**: Graceful error states with retry functionality
- **Loading States**: Smooth loading animations during analysis
- **TypeScript**: Fully typed with proper interfaces
- **Responsive Design**: Works on all screen sizes
- **Reusable Sub-components**: Modular design for flexibility

## Installation

```bash
npm install framer-motion
```

## Usage

### Basic Usage

```tsx
import CreativeDirector from '@/components/CreativeDirector'

function MyPage() {
  return (
    <CreativeDirector
      contentId="my-content-123"
      initialContent="Your content here..."
    />
  )
}
```

### With Callback

```tsx
import CreativeDirector from '@/components/CreativeDirector'

function MyPage() {
  const handleAnalysisComplete = (result) => {
    console.log('Analysis complete:', result)
    // Handle the result
  }

  return (
    <CreativeDirector
      contentId="my-content-123"
      onAnalysisComplete={handleAnalysisComplete}
      autoAnalyze={true}
    />
  )
}
```

### Using Sub-components

```tsx
import { ScoreCard, FeedbackItem, ImprovementList } from '@/components/CreativeDirector'

function CustomAnalysis() {
  return (
    <div>
      <ScoreCard label="Structure" score={85} icon="🏗️" />
      <FeedbackItem
        feedback={{
          aspect: 'Opening Hook',
          rating: 'excellent',
          comment: 'Strong opening that captures attention'
        }}
        index={0}
      />
      <ImprovementList improvements={['Add more examples', 'Improve pacing']} />
    </div>
  )
}
```

## Props

### CreativeDirector

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `contentId` | `string` | - | Unique identifier for the content |
| `initialContent` | `string` | `''` | Pre-filled content to analyze |
| `onAnalysisComplete` | `(result: AnalyzeContentResponse) => void` | - | Callback when analysis completes |
| `autoAnalyze` | `boolean` | `false` | Auto-analyze on mount |
| `showHeader` | `boolean` | `true` | Show/hide the header section |
| `className` | `string` | `''` | Additional CSS classes |

### ScoreCard

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Score label (e.g., "Structure") |
| `score` | `number` | - | Score value (0-100) |
| `icon` | `string` | - | Emoji icon |
| `animated` | `boolean` | `true` | Enable animation |
| `delay` | `number` | `0` | Animation delay in seconds |

### FeedbackItem

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `feedback` | `ContentFeedback` | - | Feedback object |
| `index` | `number` | - | Item index for staggered animation |

### ImprovementList

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `improvements` | `string[]` | - | Array of improvement suggestions |

### OverallScoreGauge

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `score` | `number` | - | Overall score (0-100) |
| `animated` | `boolean` | `true` | Enable animation |

## TypeScript Interfaces

```typescript
interface ContentScore {
  structure: number
  pacing: number
  engagement: number
  clarity: number
  overall: number
}

interface ContentFeedback {
  aspect: string
  rating: 'excellent' | 'good' | 'fair' | 'poor'
  comment: string
}

interface AnalyzeContentResponse {
  contentId: string
  score: ContentScore
  feedback: ContentFeedback[]
  improvements: string[]
}
```

## API Integration

The component integrates with the Creative Director API endpoint:

```typescript
POST /api/creative-director/analyze
{
  "contentId": "string",
  "content": "string"
}
```

Response:
```typescript
{
  "contentId": "string",
  "score": {
    "structure": 85,
    "pacing": 78,
    "engagement": 92,
    "clarity": 88,
    "overall": 86
  },
  "feedback": [
    {
      "aspect": "Opening Hook",
      "rating": "excellent",
      "comment": "Strong opening that captures attention immediately"
    }
  ],
  "improvements": [
    "Consider adding more specific examples",
    "Improve transition between sections"
  ]
}
```

## Error Handling

The component handles various error scenarios:

- **Network Errors**: Displays retry option
- **Validation Errors**: Shows specific error messages
- **API Errors**: Graceful error states with user-friendly messages
- **Empty Content**: Prevents analysis of empty content

## State Management

Uses AppContext for:
- User authentication state
- Global loading states
- Error handling

## Styling

- Uses Tailwind CSS for styling
- Framer Motion for animations
- Responsive design with mobile-first approach
- Dark theme optimized

## Accessibility

- Semantic HTML structure
- ARIA labels where appropriate
- Keyboard navigation support
- Screen reader friendly

## Performance

- Lazy loading of analysis results
- Optimized animations
- Memoized calculations
- Efficient re-renders

## Best Practices

1. **Always provide contentId**: Helps track analysis history
2. **Use callbacks**: Handle analysis results in parent components
3. **Error boundaries**: Wrap in error boundary for production
4. **Loading states**: Show feedback during analysis
5. **Validation**: Validate content before analysis

## Examples

### With AppContext

```tsx
import { useAppContext } from '@/context/AppContext'
import CreativeDirector from '@/components/CreativeDirector'

function AnalysisPage() {
  const { state } = useAppContext()

  return (
    <CreativeDirector
      contentId={state.content.currentItem?.id}
      initialContent={state.content.currentItem?.content}
    />
  )
}
```

### Custom Styling

```tsx
<CreativeDirector
  className="custom-analysis-container"
  showHeader={false}
  contentId="custom-123"
/>
```

### Embedded in Dashboard

```tsx
function Dashboard() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        {/* Other content */}
      </div>
      <div>
        <CreativeDirector
          showHeader={false}
          autoAnalyze={true}
          contentId="dashboard-content"
        />
      </div>
    </div>
  )
}
```

## Testing

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CreativeDirector from './CreativeDirector'

test('analyzes content on button click', async () => {
  render(<CreativeDirector contentId="test-123" />)
  
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

### Analysis not working
- Check API endpoint configuration
- Verify authentication token
- Check network connectivity

### Animations not smooth
- Ensure framer-motion is installed
- Check browser compatibility
- Reduce animation complexity

### Scores not displaying
- Verify API response format
- Check TypeScript types
- Validate score values (0-100)

## Related Components

- `ViralAnalyzer`: Analyzes viral potential
- `DopamineOptimizer`: Optimizes engagement
- `SafetyDashboard`: Content safety checks

## License

Part of the Content Intelligence Platform
