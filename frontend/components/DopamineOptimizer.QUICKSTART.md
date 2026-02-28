# DopamineOptimizer - Quick Start Guide

## 1. Install Dependencies

```bash
npm install framer-motion
```

## 2. Basic Usage

```tsx
import DopamineOptimizer from '@/components/DopamineOptimizer'

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <DopamineOptimizer />
    </div>
  )
}
```

## 3. With API Integration

```tsx
'use client'

import { useState, useEffect } from 'react'
import DopamineOptimizer, { DopamineOptimizationResult } from '@/components/DopamineOptimizer'

export default function ContentAnalysis() {
  const [data, setData] = useState<DopamineOptimizationResult | null>(null)

  useEffect(() => {
    async function analyze() {
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
    }
    analyze()
  }, [])

  if (!data) return <div>Loading...</div>

  return <DopamineOptimizer data={data} />
}
```

## 4. API Route Setup

```typescript
// app/api/dopamine-optimizer/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { dopamineOptimizerService } from '@/services/dopamine-optimizer.service'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const result = await dopamineOptimizerService.optimizeContent(body)
  return NextResponse.json(result)
}
```

## 5. Customization

```tsx
<DopamineOptimizer 
  data={customData}
  animated={true}
  showTimeline={true}
  showImprovements={true}
/>
```

## Props

- `data` - Analysis results (optional, uses mock data by default)
- `animated` - Enable animations (default: true)
- `showTimeline` - Show pacing timeline (default: true)
- `showImprovements` - Show improvement suggestions (default: true)

## Features

✅ Overall engagement score gauge
✅ Hooks analysis with strength ratings
✅ Emotional peaks tracking
✅ Pacing analysis with timeline
✅ Retention prediction with dropoff points
✅ Cliffhanger identification
✅ Prioritized improvement suggestions
✅ Responsive design (mobile/tablet/desktop)
✅ Smooth animations
✅ Dark theme
✅ Accessibility compliant

## Files

- `DopamineOptimizer.tsx` - Main component
- `DopamineOptimizer.types.ts` - TypeScript types
- `DopamineOptimizer.README.md` - Full documentation
- `DopamineOptimizer.example.tsx` - Usage examples
- `DopamineOptimizer.REVIEW.md` - Architecture review

## Next Steps

1. See `DopamineOptimizer.README.md` for detailed documentation
2. Check `DopamineOptimizer.example.tsx` for more examples
3. Review `DopamineOptimizer.REVIEW.md` for architecture details
4. Customize styling to match your brand
5. Add export/share functionality as needed
