# ViralAnalyzer Component

A visually stunning React component for analyzing viral content with timeline visualization, annotations, and success pattern detection.

## Features

- **Interactive Timeline**: Visual representation of content progression with annotation markers
- **Annotation System**: Four types of markers (hooks, emotional peaks, cliffhangers, CTAs)
- **Pattern Cards**: Display extracted success patterns with effectiveness metrics
- **Metrics Dashboard**: Key performance indicators with trend indicators
- **Dark Mode Design**: Modern gradient-based UI with TailwindCSS
- **Responsive Layout**: Works seamlessly on mobile, tablet, and desktop
- **Hover Effects**: Interactive elements with smooth transitions

## Installation

```bash
# Ensure you have the required dependencies
npm install react react-dom
npm install -D tailwindcss typescript @types/react
```

## Usage

```tsx
import ViralAnalyzer from './components/ViralAnalyzer';

function App() {
  return <ViralAnalyzer />;
}
```

## Component Structure

### Main Sections

1. **Header**: Title and description
2. **Metrics Dashboard**: 4 metric cards showing key stats
3. **Timeline Section**: Interactive timeline with annotations
4. **Pattern Cards**: Grid of success patterns

### Data Types

```typescript
interface Annotation {
  id: string;
  timestamp: number;
  type: 'hook' | 'emotional-peak' | 'cliffhanger' | 'call-to-action';
  title: string;
  description: string;
  impact: number;
}

interface Pattern {
  id: string;
  title: string;
  description: string;
  frequency: number;
  effectiveness: number;
  examples: string[];
}

interface ViralMetrics {
  totalViews: number;
  engagementRate: number;
  shareRate: number;
  retentionRate: number;
}
```

## Customization

### Replace Mock Data

To use real data, replace the mock constants with props or API calls:

```tsx
interface ViralAnalyzerProps {
  annotations: Annotation[];
  patterns: Pattern[];
  metrics: ViralMetrics;
  videoDuration?: number;
}

const ViralAnalyzer: React.FC<ViralAnalyzerProps> = ({
  annotations,
  patterns,
  metrics,
  videoDuration = 60
}) => {
  // Component logic
};
```

### Color Customization

Modify the color scheme by updating the Tailwind classes:

```typescript
const getAnnotationColor = (type: Annotation['type']) => {
  const colors = {
    'hook': 'bg-purple-500',        // Change to your color
    'emotional-peak': 'bg-pink-500', // Change to your color
    'cliffhanger': 'bg-orange-500',  // Change to your color
    'call-to-action': 'bg-blue-500'  // Change to your color
  };
  return colors[type];
};
```

### Add Custom Annotation Types

1. Update the type union in the `Annotation` interface
2. Add color mapping in `getAnnotationColor`
3. Add icon mapping in `getAnnotationIcon`
4. Update the legend section

## TailwindCSS Configuration

Ensure your `tailwind.config.js` includes:

```javascript
module.exports = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
```

## Responsive Breakpoints

- Mobile: Single column layout
- Tablet (md): 2-column pattern grid, 4-column metrics
- Desktop: Full layout with optimal spacing

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Tips

1. Use React.memo for pattern cards if rendering many items
2. Implement virtualization for large annotation lists
3. Lazy load pattern examples on hover
4. Debounce hover events for better performance

## Future Enhancements

- Video playback integration
- Export analysis as PDF/image
- Real-time annotation editing
- Pattern comparison view
- A/B testing visualization
- Integration with analytics APIs

## License

MIT
