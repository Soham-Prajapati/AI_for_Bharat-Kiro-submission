# TrendDashboard Component

A comprehensive, animated dashboard component for displaying trending topics with AI-powered predictions, timeline visualizations, and platform intensity heatmaps.

## Features

- **Trend Cards**: Display trending topics with growth indicators, engagement metrics, and status badges
- **Timeline Visualization**: Interactive line charts showing trend lifecycle and engagement over time
- **Platform Heatmap**: Visual representation of trend intensity across different social media platforms
- **AI Predictions**: Confidence scores and peak date predictions for each trend
- **Status Filtering**: Filter trends by status (rising, peak, declining)
- **Interactive Modal**: Click any trend card to view detailed analytics
- **Smooth Animations**: Framer Motion animations throughout
- **Dark Theme**: Glass morphism design matching ViralScoreGauge and ROIDashboard
- **Responsive Layout**: Adapts to different screen sizes

## Installation

Ensure you have the required dependencies:

```bash
npm install framer-motion recharts
# or
yarn add framer-motion recharts
```

## Basic Usage

```tsx
import TrendDashboard from './components/TrendDashboard'

function App() {
  return <TrendDashboard />
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `TrendDashboardData` | `mockTrendData` | Trend data to display |
| `animated` | `boolean` | `true` | Enable/disable animations |
| `showTimeline` | `boolean` | `true` | Show timeline chart in detail modal |
| `showHeatmap` | `boolean` | `true` | Show platform heatmap in detail modal |
| `showPredictions` | `boolean` | `true` | Show prediction cards |

## TypeScript Interfaces

### TrendData

```typescript
interface TrendData {
  id: string
  topic: string
  growthRate: number // percentage
  engagementVelocity: number // engagement per hour
  platforms: Platform[]
  status: TrendStatus
  confidence: number // 0-100
  peakPrediction: {
    date: string
    confidence: number
  }
  timeline: {
    date: string
    engagement: number
    mentions: number
  }[]
  platformIntensity: {
    platform: Platform
    intensity: number // 0-100
  }[]
}
```

### TrendDashboardData

```typescript
interface TrendDashboardData {
  trends: TrendData[]
  lastUpdated: string
}
```

### Types

```typescript
type TrendStatus = 'rising' | 'peak' | 'declining'
type Platform = 'TikTok' | 'Instagram' | 'YouTube' | 'Twitter' | 'Facebook'
```

## Mock Data

The component includes comprehensive mock data with 20 diverse trends covering various topics:
- AI Content Creation
- Sustainable Fashion
- Productivity Hacks
- Plant-Based Recipes
- Remote Work Tips
- Crypto Trading
- Mental Health Awareness
- Gaming Highlights
- Home Workout Routines
- Travel Vlogs
- DIY Home Decor
- Tech Reviews
- Cooking Tutorials
- Pet Content
- Financial Literacy
- Fashion Hauls
- Study Tips
- Car Modifications
- Skincare Routines
- Music Production

## Customization Examples

### Custom Data

```tsx
const customData: TrendDashboardData = {
  lastUpdated: new Date().toISOString(),
  trends: [
    {
      id: '1',
      topic: 'My Custom Trend',
      growthRate: 150,
      engagementVelocity: 10000,
      platforms: ['TikTok', 'Instagram'],
      status: 'rising',
      confidence: 85,
      peakPrediction: {
        date: '2024-03-01',
        confidence: 82
      },
      timeline: [
        { date: 'Day 1', engagement: 5000, mentions: 120 },
        { date: 'Day 2', engagement: 8000, mentions: 200 },
        // ... more timeline data
      ],
      platformIntensity: [
        { platform: 'TikTok', intensity: 92 },
        { platform: 'Instagram', intensity: 85 },
        // ... more platforms
      ]
    }
  ]
}

<TrendDashboard data={customData} />
```

### Minimal Configuration

```tsx
<TrendDashboard
  animated={false}
  showTimeline={false}
  showHeatmap={false}
  showPredictions={false}
/>
```

### API Integration

```tsx
function DashboardWithAPI() {
  const [data, setData] = useState<TrendDashboardData>()

  useEffect(() => {
    fetch('/api/trends')
      .then(res => res.json())
      .then(setData)
  }, [])

  return <TrendDashboard data={data} />
}
```

## Component Structure

### Main Components

1. **TrendDashboard** (Main Container)
   - Header with stats overview
   - Filter buttons
   - Trend cards grid
   - Detail modal
   - Top predictions section

2. **TrendCard** (Individual Trend Card)
   - Topic name and status badge
   - Growth rate indicator
   - Engagement metrics
   - Platform badges
   - Peak prediction info

3. **TimelineChart** (Trend Timeline)
   - Area chart for engagement
   - Line chart for mentions
   - Custom tooltip
   - Gradient fills

4. **PlatformHeatmap** (Platform Intensity)
   - Horizontal bar chart
   - Color-coded by intensity
   - Platform icons
   - Animated bars

## Color Scheme

### Status Colors
- **Rising**: `#10b981` (Green)
- **Peak**: `#f59e0b` (Amber)
- **Declining**: `#ef4444` (Red)

### Intensity Colors
- **High (80-100)**: `#10b981` (Green)
- **Medium (60-79)**: `#3b82f6` (Blue)
- **Low (40-59)**: `#f59e0b` (Amber)
- **Very Low (0-39)**: `#6b7280` (Gray)

## Animations

All animations use Framer Motion:
- **Fade in**: Cards and sections fade in on mount
- **Stagger**: Cards animate in sequence
- **Hover effects**: Cards scale on hover
- **Modal**: Scale and fade animation
- **Progress bars**: Animated width transitions
- **Counters**: Number counting animations

## Responsive Design

- **Mobile**: Single column layout
- **Tablet**: 2-column grid for trend cards
- **Desktop**: 3-column grid for trend cards
- **Large Desktop**: 4-column stats overview

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Considerations

- Uses `ResponsiveContainer` from recharts for optimal chart rendering
- Animations can be disabled with `animated={false}`
- Modal uses backdrop blur for modern browsers
- Efficient re-renders with React best practices

## Accessibility

- Semantic HTML structure
- Keyboard navigation support
- ARIA labels where appropriate
- Color contrast meets WCAG standards
- Focus indicators on interactive elements

## License

Part of the viral content analysis platform.
