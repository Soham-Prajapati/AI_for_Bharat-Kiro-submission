# DNAChart Component

A visually stunning radar/spider chart component for visualizing Creator DNA personality profiles across 5 key dimensions.

## Features

✨ **Radar Chart Visualization** - Interactive spider chart using Recharts
🎨 **Dark Mode Design** - Purple/pink/blue gradient theme
🎭 **Animated Transitions** - Smooth animations with Framer Motion
🖱️ **Interactive Tooltips** - Hover to see detailed dimension information
📊 **Dimension Cards** - Color-coded legend with progress bars
📱 **Responsive Design** - Works on all screen sizes
🧪 **Mock Data Included** - Ready to test out of the box

## Installation

The component requires the following dependencies (already added to package.json):

```bash
npm install recharts framer-motion
```

## Usage

### Basic Usage

```tsx
import DNAChart from '@/components/DNAChart'

export default function MyPage() {
  return <DNAChart />
}
```

### With Custom Data

```tsx
import DNAChart from '@/components/DNAChart'
import { CreatorDNA } from '@/types/dna'

const myCreatorData: CreatorDNA = {
  creatorId: 'creator-123',
  creatorName: 'John Doe',
  dimensions: [
    {
      dimension: 'Energy',
      value: 85,
      fullMark: 100,
      description: 'Enthusiasm and dynamism in content delivery',
      color: '#ec4899',
      icon: '⚡'
    },
    // ... more dimensions
  ]
}

export default function MyPage() {
  return (
    <DNAChart 
      dnaData={myCreatorData}
      showLegend={true}
      animated={true}
    />
  )
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `dnaData` | `CreatorDNA` | Mock data | Creator DNA profile data |
| `showLegend` | `boolean` | `true` | Show dimension cards below chart |
| `animated` | `boolean` | `true` | Enable smooth animations |

## Data Structure

### CreatorDNA Type

```typescript
interface CreatorDNA {
  creatorId: string
  creatorName: string
  dimensions: DNADimension[]
}
```

### DNADimension Type

```typescript
interface DNADimension {
  dimension: string      // Name of the dimension
  value: number         // Score (0-100)
  fullMark: number      // Maximum value (typically 100)
  description: string   // What this dimension measures
  color: string         // Hex color for visualization
  icon: string          // Emoji icon
}
```

## The 5 Dimensions

1. **⚡ Energy** - Enthusiasm and dynamism in content delivery
2. **👔 Formality** - Professional tone vs casual approach
3. **😄 Humor** - Use of comedy and lighthearted content
4. **🔬 Technical Depth** - Complexity and detail in explanations
5. **📖 Storytelling** - Narrative structure and emotional connection

## Demo Page

Visit `/dna-demo` to see the component in action with multiple creator profiles.

## Styling

The component uses:
- Tailwind CSS for styling
- Dark mode color scheme (gray-800/900 backgrounds)
- Purple (#a855f7), Pink (#ec4899), Blue (#3b82f6) gradient theme
- Backdrop blur effects for modern glass-morphism look

## Customization

### Change Colors

Modify the `color` property in each dimension:

```typescript
{
  dimension: 'Energy',
  value: 85,
  color: '#your-hex-color', // Change this
  // ...
}
```

### Disable Animations

```tsx
<DNAChart animated={false} />
```

### Hide Legend

```tsx
<DNAChart showLegend={false} />
```

## Integration Examples

### In a Dashboard

```tsx
import DNAChart from '@/components/DNAChart'

export default function Dashboard() {
  return (
    <div className="grid grid-cols-2 gap-6">
      <DNAChart />
      {/* Other dashboard components */}
    </div>
  )
}
```

### With API Data

```tsx
'use client'

import { useEffect, useState } from 'react'
import DNAChart from '@/components/DNAChart'
import { CreatorDNA } from '@/types/dna'

export default function CreatorProfile({ creatorId }: { creatorId: string }) {
  const [dnaData, setDnaData] = useState<CreatorDNA | null>(null)

  useEffect(() => {
    fetch(`/api/creators/${creatorId}/dna`)
      .then(res => res.json())
      .then(data => setDnaData(data))
  }, [creatorId])

  if (!dnaData) return <div>Loading...</div>

  return <DNAChart dnaData={dnaData} />
}
```

## Performance

- Chart renders efficiently with Recharts
- Animations are GPU-accelerated via Framer Motion
- Responsive container adapts to parent width
- Minimal re-renders with proper React optimization

## Browser Support

Works in all modern browsers that support:
- CSS Grid
- CSS Backdrop Filter
- SVG rendering
- ES6+ JavaScript

## Troubleshooting

### Chart not rendering

Make sure you've installed dependencies:
```bash
npm install recharts framer-motion
```

### Colors not showing

Ensure Tailwind CSS is properly configured and the component is marked as `'use client'` for Next.js.

### Animations not working

Check that `animated` prop is set to `true` and Framer Motion is installed.

## License

Part of the Content Intelligence Platform project.
