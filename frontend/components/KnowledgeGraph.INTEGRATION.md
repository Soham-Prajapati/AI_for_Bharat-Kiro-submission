# KnowledgeGraph Integration Guide

Complete guide for integrating the KnowledgeGraph component into your application.

## Quick Start

### 1. Import the Component

```tsx
import KnowledgeGraph from '@/components/KnowledgeGraph'
```

### 2. Add to Your Page

```tsx
export default function GraphPage() {
  return (
    <div className="p-8">
      <KnowledgeGraph />
    </div>
  )
}
```

That's it! The component will fetch data from the API and render the graph.

## API Integration

### Backend Requirements

The component expects these API endpoints:

#### GET /api/graph/explore
Fetch graph data for exploration.

**Query Parameters:**
- `topic` (optional): Starting topic
- `depth` (optional): Traversal depth (default: 2)

**Response:**
```json
{
  "nodes": [
    {
      "id": "1",
      "label": "AI Content",
      "type": "topic",
      "weight": 10,
      "metadata": {}
    }
  ],
  "edges": [
    {
      "source": "1",
      "target": "2",
      "weight": 0.8,
      "type": "related"
    }
  ],
  "timestamp": "2024-01-01T00:00:00Z",
  "source": "mock"
}
```

#### GET /api/graph/related
Fetch related content for a node.

**Query Parameters:**
- `contentId`: Node ID
- `limit` (optional): Max results (default: 10)

**Response:**
```json
{
  "contentId": "c1",
  "recommendations": [
    {
      "id": "c2",
      "title": "Related Content",
      "similarity": 0.92,
      "type": "video"
    }
  ],
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### API Client Methods

The component uses these methods from `apiClient`:

```typescript
// Explore graph
const data = await apiClient.graph.explore('AI Content', 2)

// Get related content
const related = await apiClient.graph.getRelated('content-id', 10)
```

## Advanced Integration

### 1. With State Management

```tsx
'use client'

import { useState } from 'react'
import KnowledgeGraph from '@/components/KnowledgeGraph'
import type { GraphNode } from '@/components/KnowledgeGraph'

export default function GraphPage() {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [relatedContent, setRelatedContent] = useState([])

  const handleNodeClick = async (node: GraphNode) => {
    setSelectedNode(node)
    
    // Fetch related content
    if (node.type === 'content') {
      const related = await apiClient.graph.getRelated(node.id)
      setRelatedContent(related.recommendations)
    }
  }

  return (
    <div>
      <KnowledgeGraph onNodeClick={handleNodeClick} />
      
      {selectedNode && (
        <div className="mt-4">
          <h2>Selected: {selectedNode.label}</h2>
          {/* Show related content */}
        </div>
      )}
    </div>
  )
}
```

### 2. With Router Navigation

```tsx
'use client'

import { useRouter } from 'next/navigation'
import KnowledgeGraph from '@/components/KnowledgeGraph'

export default function GraphPage() {
  const router = useRouter()

  const handleNodeClick = (node) => {
    switch (node.type) {
      case 'content':
        router.push(`/content/${node.id}`)
        break
      case 'topic':
        router.push(`/topics/${node.id}`)
        break
      case 'creator':
        router.push(`/creators/${node.id}`)
        break
    }
  }

  return <KnowledgeGraph onNodeClick={handleNodeClick} />
}
```

### 3. With Search Integration

```tsx
'use client'

import { useState } from 'react'
import KnowledgeGraph from '@/components/KnowledgeGraph'

export default function GraphPage() {
  const [topic, setTopic] = useState('AI Content')

  return (
    <div>
      <input
        type="text"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Search topic..."
      />
      
      <KnowledgeGraph
        initialTopic={topic}
        key={topic} // Re-render on topic change
      />
    </div>
  )
}
```

### 4. With Analytics Tracking

```tsx
'use client'

import KnowledgeGraph from '@/components/KnowledgeGraph'

export default function GraphPage() {
  const handleNodeClick = (node) => {
    // Track analytics
    analytics.track('graph_node_clicked', {
      nodeId: node.id,
      nodeType: node.type,
      nodeLabel: node.label,
    })
    
    // Handle click
    console.log('Node clicked:', node)
  }

  return <KnowledgeGraph onNodeClick={handleNodeClick} />
}
```

## Styling Integration

### With Tailwind

```tsx
<KnowledgeGraph
  className="shadow-2xl rounded-2xl border-2 border-purple-500"
/>
```

### Custom Container

```tsx
<div className="container mx-auto p-8">
  <div className="bg-gradient-to-br from-purple-900 to-blue-900 p-1 rounded-xl">
    <KnowledgeGraph />
  </div>
</div>
```

### Responsive Sizing

```tsx
'use client'

import { useState, useEffect } from 'react'
import KnowledgeGraph from '@/components/KnowledgeGraph'

export default function GraphPage() {
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth - 64, // Account for padding
        height: window.innerHeight - 200,
      })
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  return (
    <KnowledgeGraph
      width={dimensions.width}
      height={dimensions.height}
    />
  )
}
```

## Dashboard Integration

### Example: Analytics Dashboard

```tsx
'use client'

import KnowledgeGraph from '@/components/KnowledgeGraph'
import { useState } from 'react'

export default function AnalyticsDashboard() {
  const [selectedNode, setSelectedNode] = useState(null)

  return (
    <div className="grid grid-cols-3 gap-6 p-8">
      {/* Graph - 2 columns */}
      <div className="col-span-2">
        <KnowledgeGraph
          width={800}
          height={600}
          onNodeClick={setSelectedNode}
        />
      </div>
      
      {/* Details - 1 column */}
      <div className="col-span-1">
        {selectedNode ? (
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">
              {selectedNode.label}
            </h2>
            {/* Show node details, metrics, etc. */}
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl p-6 text-center text-gray-400">
            Click a node to view details
          </div>
        )}
      </div>
    </div>
  )
}
```

## Performance Optimization

### 1. Lazy Loading

```tsx
import dynamic from 'next/dynamic'

const KnowledgeGraph = dynamic(
  () => import('@/components/KnowledgeGraph'),
  { ssr: false, loading: () => <div>Loading graph...</div> }
)

export default function GraphPage() {
  return <KnowledgeGraph />
}
```

### 2. Memoization

```tsx
'use client'

import { useMemo, useCallback } from 'react'
import KnowledgeGraph from '@/components/KnowledgeGraph'

export default function GraphPage() {
  const handleNodeClick = useCallback((node) => {
    console.log('Node clicked:', node)
  }, [])

  return <KnowledgeGraph onNodeClick={handleNodeClick} />
}
```

### 3. Conditional Rendering

```tsx
'use client'

import { useState } from 'react'
import KnowledgeGraph from '@/components/KnowledgeGraph'

export default function GraphPage() {
  const [showGraph, setShowGraph] = useState(false)

  return (
    <div>
      <button onClick={() => setShowGraph(true)}>
        Load Graph
      </button>
      
      {showGraph && <KnowledgeGraph />}
    </div>
  )
}
```

## Error Handling

### With Error Boundary

```tsx
'use client'

import { ErrorBoundary } from 'react-error-boundary'
import KnowledgeGraph from '@/components/KnowledgeGraph'

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="text-center p-8">
      <h2 className="text-xl font-bold text-red-500 mb-4">
        Graph Error
      </h2>
      <p className="text-gray-400 mb-4">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-red-600 rounded-lg"
      >
        Try Again
      </button>
    </div>
  )
}

export default function GraphPage() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <KnowledgeGraph />
    </ErrorBoundary>
  )
}
```

## Testing

### Unit Test Example

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import KnowledgeGraph from '@/components/KnowledgeGraph'

describe('KnowledgeGraph', () => {
  it('renders without crashing', () => {
    render(<KnowledgeGraph />)
    expect(screen.getByText('Knowledge Graph')).toBeInTheDocument()
  })

  it('calls onNodeClick when node is clicked', () => {
    const handleClick = jest.fn()
    render(<KnowledgeGraph onNodeClick={handleClick} />)
    
    // Simulate node click
    const canvas = screen.getByRole('img')
    fireEvent.click(canvas)
    
    // Verify callback was called
    expect(handleClick).toHaveBeenCalled()
  })
})
```

## Deployment Checklist

- [ ] API endpoints are accessible
- [ ] CORS is configured for frontend domain
- [ ] Graph data is properly formatted
- [ ] Error handling is in place
- [ ] Loading states are shown
- [ ] Performance is tested with large datasets
- [ ] Mobile responsiveness is verified
- [ ] Accessibility is tested
- [ ] Analytics tracking is implemented
- [ ] Error logging is configured

## Troubleshooting

### Graph not loading
**Problem:** Component shows loading state indefinitely

**Solutions:**
1. Check API endpoint URL in `.env.local`
2. Verify CORS headers on backend
3. Check browser console for errors
4. Test API endpoint directly with curl

### Performance issues
**Problem:** Graph is slow with many nodes

**Solutions:**
1. Reduce `depth` parameter
2. Implement pagination
3. Filter nodes on backend
4. Increase `alphaDecay` for faster simulation

### Nodes overlapping
**Problem:** Nodes are too close together

**Solutions:**
1. Increase canvas size
2. Adjust repulsion force in simulation
3. Reduce number of nodes
4. Give simulation more time to settle

## Support

For issues or questions:
1. Check the README.md
2. Review example usage
3. Check API integration
4. Contact the development team

## Next Steps

1. ✅ Install component
2. ✅ Configure API endpoints
3. ✅ Add to your page
4. ✅ Test with sample data
5. ✅ Customize styling
6. ✅ Add event handlers
7. ✅ Deploy to production

Happy graphing! 🎉
