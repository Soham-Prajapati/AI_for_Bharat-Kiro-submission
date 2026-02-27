# DNAChart Integration Guide

Quick guide for integrating the DNAChart component into your application.

## Quick Start

1. **Install dependencies** (if not already done):
```bash
cd frontend
npm install
```

2. **Import and use**:
```tsx
import DNAChart from '@/components/DNAChart'

<DNAChart />
```

## Integration Scenarios

### 1. Creator Profile Page

```tsx
// app/creators/[id]/page.tsx
import DNAChart from '@/components/DNAChart'

export default function CreatorProfilePage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto p-8">
      <h1>Creator Profile</h1>
      <DNAChart />
    </div>
  )
}
```

### 2. Dashboard Widget

```tsx
// app/dashboard/page.tsx
import DNAChart from '@/components/DNAChart'
import AnalyticsChart from '@/components/AnalyticsChart'

export default function Dashboard() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <AnalyticsChart data={analyticsData} />
      <DNAChart />
    </div>
  )
}
```

### 3. Comparison View

```tsx
// app/compare/page.tsx
'use client'

import DNAChart from '@/components/DNAChart'
import { CreatorDNA } from '@/types/dna'

export default function ComparePage() {
  const creator1: CreatorDNA = { /* ... */ }
  const creator2: CreatorDNA = { /* ... */ }

  return (
    <div className="grid grid-cols-2 gap-6">
      <DNAChart dnaData={creator1} />
      <DNAChart dnaData={creator2} />
    </div>
  )
}
```

### 4. With Real API Data

```tsx
'use client'

import { useEffect, useState } from 'react'
import DNAChart from '@/components/DNAChart'
import { CreatorDNA } from '@/types/dna'

export default function CreatorDNAWidget({ creatorId }: { creatorId: string }) {
  const [dnaData, setDnaData] = useState<CreatorDNA | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDNA() {
      try {
        const response = await fetch(`/api/creators/${creatorId}/dna`)
        const data = await response.json()
        setDnaData(data)
      } catch (error) {
        console.error('Failed to fetch DNA data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDNA()
  }, [creatorId])

  if (loading) {
    return (
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6 animate-pulse">
        <div className="h-96 bg-gray-700/50 rounded"></div>
      </div>
    )
  }

  if (!dnaData) {
    return <div>Failed to load DNA data</div>
  }

  return <DNAChart dnaData={dnaData} />
}
```

## Backend API Integration

### Expected API Response Format

Your backend should return data in this format:

```json
{
  "creatorId": "creator-123",
  "creatorName": "John Doe",
  "dimensions": [
    {
      "dimension": "Energy",
      "value": 85,
      "fullMark": 100,
      "description": "Enthusiasm and dynamism in content delivery",
      "color": "#ec4899",
      "icon": "⚡"
    },
    {
      "dimension": "Formality",
      "value": 45,
      "fullMark": 100,
      "description": "Professional tone vs casual approach",
      "color": "#8b5cf6",
      "icon": "👔"
    },
    {
      "dimension": "Humor",
      "value": 70,
      "fullMark": 100,
      "description": "Use of comedy and lighthearted content",
      "color": "#06b6d4",
      "icon": "😄"
    },
    {
      "dimension": "Technical Depth",
      "value": 90,
      "fullMark": 100,
      "description": "Complexity and detail in explanations",
      "color": "#3b82f6",
      "icon": "🔬"
    },
    {
      "dimension": "Storytelling",
      "value": 75,
      "fullMark": 100,
      "description": "Narrative structure and emotional connection",
      "color": "#a855f7",
      "icon": "📖"
    }
  ]
}
```

### Example Backend Endpoint (Express)

```typescript
// src/routes/creators.ts
import { Router } from 'express'

const router = Router()

router.get('/creators/:id/dna', async (req, res) => {
  const { id } = req.params
  
  // Fetch from your database or AI analysis service
  const dnaData = await getCreatorDNA(id)
  
  res.json(dnaData)
})

export default router
```

## Styling Customization

### Match Your Brand Colors

```tsx
const customDimensions = [
  {
    dimension: 'Energy',
    value: 85,
    color: '#your-brand-color', // Customize
    // ...
  }
]
```

### Adjust Size

```tsx
<div className="max-w-4xl mx-auto">
  <DNAChart />
</div>
```

### Remove Background

```tsx
// Modify the component or wrap it
<div className="bg-transparent">
  <DNAChart />
</div>
```

## Testing

### Unit Test Example

```typescript
import { render, screen } from '@testing-library/react'
import DNAChart from '@/components/DNAChart'

describe('DNAChart', () => {
  it('renders with mock data', () => {
    render(<DNAChart />)
    expect(screen.getByText('Creator DNA Profile')).toBeInTheDocument()
  })

  it('displays custom creator name', () => {
    const customData = {
      creatorId: 'test-1',
      creatorName: 'Test Creator',
      dimensions: [/* ... */]
    }
    render(<DNAChart dnaData={customData} />)
    expect(screen.getByText(/Test Creator/)).toBeInTheDocument()
  })
})
```

## Performance Tips

1. **Memoize data**: Use `useMemo` for expensive calculations
2. **Lazy load**: Load the component only when needed
3. **Disable animations**: Set `animated={false}` for better performance on low-end devices

```tsx
import dynamic from 'next/dynamic'

const DNAChart = dynamic(() => import('@/components/DNAChart'), {
  loading: () => <div>Loading chart...</div>,
  ssr: false // Disable server-side rendering if needed
})
```

## Common Issues

### Issue: Chart not visible
**Solution**: Ensure parent container has defined height/width

### Issue: Animations laggy
**Solution**: Reduce number of dimensions or disable animations

### Issue: Colors not matching design
**Solution**: Update the `color` property in dimension data

## Next Steps

1. Connect to your backend API
2. Implement real-time updates
3. Add export functionality (PNG/PDF)
4. Create comparison views
5. Add filtering/sorting options

## Support

For issues or questions, check:
- Component README: `DNAChart.README.md`
- Demo page: `/dna-demo`
- Type definitions: `types/dna.ts`
