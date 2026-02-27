# Ecosystem Analytics Dashboard

## Overview
The Ecosystem Analytics Dashboard provides creators with comprehensive cross-platform performance insights across 6 major social media platforms: YouTube, Instagram, LinkedIn, Twitter, TikTok, and Facebook.

## Features

### 1. Platform Performance Cards
- **Visual Design**: Each platform has a unique color scheme and icon
- **Key Metrics**:
  - Follower count with formatted numbers (K/M)
  - Engagement rate with animated progress bar
  - Trend indicator (up/down/stable)
  - Top performing post preview with views and likes
- **Responsive**: Adapts to mobile (1 col), tablet (2 cols), and desktop (3 cols)

### 2. Engagement Chart
- **Multi-line chart** showing engagement trends over time
- **Interactive tooltips** with detailed metrics
- **Platform-specific colors** for easy identification
- **Responsive design** that adapts to screen size
- **Smooth animations** on load

### 3. AI Recommendations
- **Priority-based insights** (high, medium, low)
- **Actionable suggestions** based on performance data
- **Platform-specific recommendations** with color coding
- **Icon-based visual hierarchy**

### 4. Summary Statistics
- Total followers across all platforms
- Average engagement rate
- Number of growing platforms

## Components

### PlatformCard.tsx
Displays individual platform performance metrics.

**Props**:
- `data`: PlatformData object
- `index`: Number for staggered animations

**Features**:
- Platform-specific color theming
- Animated engagement bar
- Trend indicators with icons
- Formatted number display (K/M notation)
- Hover effects with shadow

### EngagementChart.tsx
Line chart showing engagement trends over time.

**Props**:
- `data`: Array of EngagementDataPoint objects

**Features**:
- 6 platform lines with distinct colors
- Interactive tooltips
- Responsive container
- Grid and axis styling
- Legend with platform names

### RecommendationList.tsx
Displays AI-generated recommendations.

**Props**:
- `recommendations`: Array of Recommendation objects

**Features**:
- Priority-based color coding
- Platform badges
- Icon indicators
- Staggered animations
- Hover effects

## Data Types

### PlatformData
```typescript
{
  platform: 'youtube' | 'instagram' | 'linkedin' | 'twitter' | 'tiktok' | 'facebook';
  followers: number;
  engagement: number; // 0-1 (percentage)
  trend: 'up' | 'down' | 'stable';
  topPost: {
    title: string;
    views: number;
    likes: number;
  };
}
```

### EngagementDataPoint
```typescript
{
  date: string;
  youtube: number;
  instagram: number;
  linkedin: number;
  twitter: number;
  tiktok: number;
  facebook: number;
}
```

### Recommendation
```typescript
{
  id: string;
  priority: 'high' | 'medium' | 'low';
  message: string;
  platform?: Platform;
}
```

## Platform Colors

- **YouTube**: #FF0000 (Red)
- **Instagram**: #E1306C (Pink/Purple)
- **LinkedIn**: #0077B5 (Blue)
- **Twitter**: #1DA1F2 (Light Blue)
- **TikTok**: #00F2EA (Cyan)
- **Facebook**: #1877F2 (Blue)

## Responsive Breakpoints

- **Mobile** (< 768px): 1 column grid
- **Tablet** (768px - 1024px): 2 column grid
- **Desktop** (> 1024px): 3 column grid

## Animations

All components use Framer Motion for smooth animations:
- **Fade in + slide up** on page load
- **Staggered animations** for platform cards (0.1s delay each)
- **Progress bar animations** for engagement rates
- **Hover effects** with scale and shadow transitions

## Usage

Navigate to `/analytics` to view the dashboard.

```tsx
import AnalyticsPage from '@/app/analytics/page';

// The page is self-contained with mock data
// In production, replace mock data with API calls
```

## Future Enhancements

1. **Real-time data**: Connect to platform APIs
2. **Date range selector**: Filter data by time period
3. **Export functionality**: Download reports as PDF/CSV
4. **Comparison mode**: Compare different time periods
5. **Custom metrics**: Allow users to define custom KPIs
6. **Alerts**: Set up notifications for significant changes
7. **Deep dive**: Click platform cards for detailed analytics

## Dependencies

- **Next.js 14**: React framework
- **Framer Motion**: Animation library
- **Recharts**: Chart library
- **Lucide React**: Icon library
- **Tailwind CSS**: Styling

## Accessibility

- Semantic HTML structure
- ARIA labels for interactive elements
- Keyboard navigation support
- Color contrast ratios meet WCAG standards
- Responsive text sizing
