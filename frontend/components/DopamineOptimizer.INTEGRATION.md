# DopamineOptimizer Integration Guide

Complete guide for integrating the DopamineOptimizer component into your application.

## Quick Start

### 1. Install Dependencies

```bash
npm install framer-motion
```

### 2. Import and Use

```tsx
import DopamineOptimizer from '@/components/DopamineOptimizer'

export default function Page() {
  return <DopamineOptimizer />
}
```

## Backend Integration

### API Route Setup

Create an API route to connect to the backend service:

```typescript
// app/api/dopamine-optimizer/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { dopamineOptimizerService } from '@/services/dopamine-optimizer.service'

rt async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, contentType, duration, targetPlatform } = body

    // Validate input
    if (!content || !contentType) {
      return NextResponse.json(
        { error: 'Content and contentType are required' },
        { status: 400 }
      )
    }

    // Call service
    const result = await dopamineOptimizerService.optimizeContent({
      content,
      contentType,
      duration,
      targetPlatform
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Dopamine optimization error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze content' },
      { status: 500 }
    )
  }
}
```

### Frontend Integration

```tsx
'use client'

import { useState } from 'react'
import DopamineOptimizer, { Dopamifrom '@/components/DopamineOptimizer'

export default function ContentAnalysisPage() {
  const [data, setData] = useState<DopamineOptimizationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyzeContent = async (content: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/dopamine-optimizer', {
        method: 'POST',
        headers: { 'Con
        body: JSON.stringify({
          content,
          contentType: 'video_script',
          duration: 60,
          targetPlatform: 'youtube'
        })
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
>
      {loading && <div>Analyzing...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {data && <DopamineOptimizer data={data} />}
    </div>
  )
}
```

## Content Workflow Integration

### Step 1: Content Input

```tsx
import { useState } from 'react'

export function ContentInput({ onAnalyze }: { onAnalyze: (content: string) => void }) {
  const [content, setContent] = useState('')

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
-2xl font-bold text-white mb-4">
        Enter Your Content
      </h2>
      
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Paste your video script, social post, or blog content..."
        className="w-full h-64 bg-gray-900 text-white rounded-lg p-4 border border-gray-700 focus:border-blue-500 focus:outline-none resize-none"
      />
      
      <div className="flex gap-4 mt-4">
        <button
   
          disabled={!content.trim()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Analyze Content
        </button>
        
        <button
          onClick={() => setContent('')}
          className="px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
        >
          Clear
        </button>
      </div>
    </div>
  )
}
```

### Step 2: Analysis Display

```tsx
import DopamineOptimizer from '@/components/DopamineOptimizer'

export function AnalysisDisplay({ data }: { data: DopamineOptimizationResult }) {
  return (
    <div className="space-y-6">
      <DopamineOptimizer data={data} />
      
      {/* Additional actions */}
      <div className="flex gap-4">
        <button className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">
          Apply Suggestions
        </button>
        
 button className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700">
          Export Report
        </button>
      </div>
    </div>
  )
}
```

### Step 3: Complete Workflow

```tsx
'use client'

import { useState } from 'react'
import { ContentInput } from './ContentInput'
import { AnalysisDisplay } from './AnalysisDisplay'
import { DopamineOptimizationResult } from '@/components/DopamineOptimizer'

export default function ContentOptimizationWorkflow() {
  c] = useState<'input' | 'analyzing' | 'results'>('input')
  const [data, setData] = useState<DopamineOptimizationResult | null>(null)

  const handleAnalyze = async (content: string) => {
    setStep('analyzing')

    try {
      const response = await fetch('/api/dopamine-optimizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          contentType: 'video_script',
          targetPlatform: 'youtube'
        })
      })

      const result = await response.json()
      setData(result)
      setStep('results')
    } catch (error) {
      console.error('Analysis failed:', error)
      setStep('input')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            <Step number={1} label="Input" active={step === 'input'} />
            <div className="w-16 h-1 bg-gray-700" />
            <Step number={2} label="Analyzing" active={step === 'analyzing'} />
            <div className="w-16 h-1 bg-gray-700" />
            <Step number={3} label="Results" active={step === 'results'} />
          </div>
        </div>

        {/* Content */}
        {step === 'input' && <ContentInput onAnalyze={handleAnalyze} />}
        
        {step === 'analyzing' && (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4" />
            <p className="text-white text-xl">Analyzing your content...</p>
          </div>
        )}
        
        {step === 'results' && data && (
          <>
            <button
              onClick={() => setStep('input')}
              className="mb-6 text-blue-400 hover:text-blue-300"
            >
              ← Analyze New Content
            </button>
            <AnalysisDisplay data={data} />
          </>
        )}
v>
    </div>
  )
}

function Step({ number, label, active }: { number: number; label: string; active: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
          active ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'
        }`}
      >
        {number}
      </div>
      <span className={`text-sm mt-2 ${active ? 'text-white' : 'text-gray-400'}`}>
        {label}
      </span>
  </div>
  )
}
```

## State Management Integration

### With React Context

```tsx
// contexts/ContentAnalysisContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react'
import { DopamineOptimizationResult } from '@/components/DopamineOptimizer'

interface ContentAnalysisContextType {
  analyses: Map<string, DopamineOptimizationResult>
  addAnalysis: (id: string, data: DopamineOptimizationResult) => void
  getAnalysis: (id: string) => DopamineOptimizationResult | undefined
}

const ContentAnalysisContext = createContext<ContentAnalysisContextType | undefined>(undefined)

export function ContentAnalysisProvider({ children }: { children: ReactNode }) {
  const [analyses, setAnalyses] = useState(new Map<string, DopamineOptimizationResult>())

  const addAnalysis = (id: string, data: DopamineOptimizationResult) => {
    setAnalyses(prev => new Map(prev).set(id, data))
  }

  const getAnalysis = (id: string) => analyses.get(id)

  return (
lysis, getAnalysis }}>
      {children}
    </ContentAnalysisContext.Provider>
  )
}

export function useContentAnalysis() {
  const context = useContext(ContentAnalysisContext)
  if (!context) throw new Error('useContentAnalysis must be used within ContentAnalysisProvider')
  return context
}
```

r reports
3. Integrate with content management system
4. Add A/B testing capabilities
5. Implement real-time analysis updates
TheDocument()
  })
})
```

## Troubleshooting

### Common Issues

1. **Animations not working**: Ensure framer-motion is installed
2. **Styles not applying**: Check Tailwind CSS configuration
3. **API errors**: Verify backend service is running
4. **Type errors**: Ensure TypeScript types match backend interfaces

### Debug Mode

```tsx
<DopamineOptimizer 
  data={data} 
  animated={false}  // Disable animations for debugging
/>
```

## Next Steps

1. Customize styling to match your brand
2. Add export functionality fo/div>
    )
  }

  return <DopamineOptimizer />
}
```

## Testing

```tsx
import { render, screen } from '@testing-library/react'
import DopamineOptimizer from '@/components/DopamineOptimizer'

describe('DopamineOptimizer', () => {
  it('renders with mock data', () => {
    render(<DopamineOptimizer />)
    expect(screen.getByText('Dopamine Optimizer')).toBeInTheDocument()
  })

  it('displays overall score', () => {
    render(<DopamineOptimizer />)
    expect(screen.getByText(/Overall Engagement Score/i)).toBeInneOptimizer'

export function RobustAnalysis() {
  const [error, setError] = useState<Error | null>(null)

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-700 rounded-xl p-6">
        <h3 className="text-red-400 font-bold mb-2">Analysis Error</h3>
        <p className="text-gray-300">{error.message}</p>
        <button
          onClick={() => setError(null)}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg"
        >
          Try Again
        </button>
      <alysis...</div>,
    ssr: false
  }
)
```

### Memoization

```tsx
import { useMemo } from 'react'
import DopamineOptimizer, { DopamineOptimizationResult } from '@/components/DopamineOptimizer'

export function OptimizedAnalysis({ data }: { data: DopamineOptimizationResult }) {
  const memoizedData = useMemo(() => data, [data.overallScore])
  
  return <DopamineOptimizer data={memoizedData} />
}
```

## Error Handling

```tsx
import { useState } from 'react'
import DopamineOptimizer from '@/components/Dopami## Performance Optimization

### Lazy Loading

```tsx
import dynamic from 'next/dynamic'

const DopamineOptimizer = dynamic(
  () => import('@/components/DopamineOptimizer'),
  {
    loading: () => <div>Loading an