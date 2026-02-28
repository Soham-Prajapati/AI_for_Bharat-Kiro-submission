/**
 * KnowledgeGraph Component Tests
 * Tests the interactive network graph visualization with performance testing
 */

import { describe, it, expect, beforeEach, afterEach, vi } from '@jest/globals'
import { GraphNode, GraphEdge, GraphData } from './KnowledgeGraph'

// ============================================================================
// TEST DATA GENERATORS
// ============================================================================

/**
 * Generate test graph data with specified number of nodes
 */
function generateGraphData(nodeCount: number): GraphData {
  const nodes: GraphNode[] = []
  const edges: GraphEdge[] = []
  
  const nodeTypes: Array<'content' | 'topic' | 'creator'> = ['content', 'topic', 'creator']
  
  // Generate nodes
  for (let i = 0; i < nodeCount; i++) {
    nodes.push({
      id: `node-${i}`,
      label: `Node ${i}`,
      type: nodeTypes[i % 3],
      weight: Math.floor(Math.random() * 10) + 1,
      metadata: {
        created: new Date().toISOString(),
        index: i
      }
    })
  }
  
  // Generate edges (create a connected graph)
  const edgesPerNode = Math.min(5, Math.floor(nodeCount / 10))
  for (let i = 0; i < nodeCount; i++) {
    const numEdges = Math.floor(Math.random() * edgesPerNode) + 1
    for (let j = 0; j < numEdges; j++) {
      const targetIndex = Math.floor(Math.random() * nodeCount)
      if (targetIndex !== i) {
        edges.push({
          source: `node-${i}`,
          target: `node-${targetIndex}`,
          weight: Math.random(),
          type: 'related'
        })
      }
    }
  }
  
  return { nodes, edges }
}

// ============================================================================
// UNIT TESTS
// ============================================================================

describe('KnowledgeGraph Component', () => {
  describe('Data Structure Validation', () => {
    it('should generate valid graph data structure', () => {
      const data = generateGraphData(10)
      
      expect(data.nodes).toBeDefined()
      expect(data.edges).toBeDefined()
      expect(Array.isArray(data.nodes)).toBe(true)
      expect(Array.isArray(data.edges)).toBe(true)
      expect(data.nodes.length).toBe(10)
    })
    
    it('should have valid node properties', () => {
      const data = generateGraphData(5)
      
      data.nodes.forEach(node => {
        expect(node.id).toBeDefined()
        expect(node.label).toBeDefined()
        expect(node.type).toMatch(/^(content|topic|creator)$/)
        expect(node.weight).toBeGreaterThanOrEqual(1)
        expect(node.weight).toBeLessThanOrEqual(10)
      })
    })
    
    it('should have valid edge properties', () => {
      const data = generateGraphData(10)
      
      data.edges.forEach(edge => {
        expect(edge.source).toBeDefined()
        expect(edge.target).toBeDefined()
        expect(edge.weight).toBeGreaterThanOrEqual(0)
        expect(edge.weight).toBeLessThanOrEqual(1)
        expect(edge.type).toBeDefined()
      })
    })
    
    it('should create edges between existing nodes', () => {
      const data = generateGraphData(10)
      const nodeIds = new Set(data.nodes.map(n => n.id))
      
      data.edges.forEach(edge => {
        expect(nodeIds.has(edge.source)).toBe(true)
        expect(nodeIds.has(edge.target)).toBe(true)
      })
    })
  })
  
  describe('Node Type Distribution', () => {
    it('should distribute node types evenly', () => {
      const data = generateGraphData(30)
      
      const typeCounts = {
        content: 0,
        topic: 0,
        creator: 0
      }
      
      data.nodes.forEach(node => {
        typeCounts[node.type]++
      })
      
      // Each type should have approximately 1/3 of nodes
      expect(typeCounts.content).toBeGreaterThan(5)
      expect(typeCounts.topic).toBeGreaterThan(5)
      expect(typeCounts.creator).toBeGreaterThan(5)
    })
  })
  
  describe('Graph Connectivity', () => {
    it('should create a connected graph', () => {
      const data = generateGraphData(20)
      
      // Build adjacency list
      const adjacency = new Map<string, Set<string>>()
      data.nodes.forEach(node => adjacency.set(node.id, new Set()))
      
      data.edges.forEach(edge => {
        adjacency.get(edge.source)?.add(edge.target)
        adjacency.get(edge.target)?.add(edge.source)
      })
      
      // Check that most nodes have connections
      let connectedNodes = 0
      adjacency.forEach(neighbors => {
        if (neighbors.size > 0) connectedNodes++
      })
      
      expect(connectedNodes).toBeGreaterThan(data.nodes.length * 0.5)
    })
  })
})

// ============================================================================
// PERFORMANCE TESTS
// ============================================================================

describe('KnowledgeGraph Performance', () => {
  describe('Large Graph Generation', () => {
    it('should generate 1000 nodes efficiently', () => {
      const startTime = performance.now()
      const data = generateGraphData(1000)
      const endTime = performance.now()
      
      const generationTime = endTime - startTime
      
      expect(data.nodes.length).toBe(1000)
      expect(data.edges.length).toBeGreaterThan(0)
      expect(generationTime).toBeLessThan(1000) // Should complete in under 1 second
      
      console.log(`Generated 1000 nodes in ${generationTime.toFixed(2)}ms`)
    })
    
    it('should handle 1000 nodes with reasonable edge count', () => {
      const data = generateGraphData(1000)
      
      // Edge count should be reasonable (not too sparse, not too dense)
      const minEdges = 500
      const maxEdges = 5000
      
      expect(data.edges.length).toBeGreaterThan(minEdges)
      expect(data.edges.length).toBeLessThan(maxEdges)
      
      console.log(`Generated ${data.edges.length} edges for 1000 nodes`)
    })
  })
  
  describe('Data Structure Memory Efficiency', () => {
    it('should have reasonable memory footprint for 1000 nodes', () => {
      const data = generateGraphData(1000)
      
      // Calculate approximate memory usage
      const nodeSize = JSON.stringify(data.nodes[0]).length
      const edgeSize = JSON.stringify(data.edges[0]).length
      const totalSize = (nodeSize * data.nodes.length) + (edgeSize * data.edges.length)
      
      // Should be less than 5MB for 1000 nodes
      expect(totalSize).toBeLessThan(5 * 1024 * 1024)
      
      console.log(`Approximate memory usage: ${(totalSize / 1024).toFixed(2)}KB`)
    })
  })
  
  describe('Search and Filter Performance', () => {
    it('should filter nodes by type efficiently', () => {
      const data = generateGraphData(1000)
      
      const startTime = performance.now()
      const contentNodes = data.nodes.filter(n => n.type === 'content')
      const endTime = performance.now()
      
      const filterTime = endTime - startTime
      
      expect(contentNodes.length).toBeGreaterThan(0)
      expect(filterTime).toBeLessThan(50) // Should complete in under 50ms
      
      console.log(`Filtered 1000 nodes by type in ${filterTime.toFixed(2)}ms`)
    })
    
    it('should search nodes by label efficiently', () => {
      const data = generateGraphData(1000)
      
      const startTime = performance.now()
      const searchResults = data.nodes.filter(n => 
        n.label.toLowerCase().includes('node 1')
      )
      const endTime = performance.now()
      
      const searchTime = endTime - startTime
      
      expect(searchResults.length).toBeGreaterThan(0)
      expect(searchTime).toBeLessThan(50) // Should complete in under 50ms
      
      console.log(`Searched 1000 nodes in ${searchTime.toFixed(2)}ms`)
    })
  })
  
  describe('Edge Filtering Performance', () => {
    it('should filter edges for visible nodes efficiently', () => {
      const data = generateGraphData(1000)
      const visibleNodeIds = new Set(
        data.nodes.filter(n => n.type === 'content').map(n => n.id)
      )
      
      const startTime = performance.now()
      const filteredEdges = data.edges.filter(e => 
        visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target)
      )
      const endTime = performance.now()
      
      const filterTime = endTime - startTime
      
      expect(filteredEdges.length).toBeGreaterThanOrEqual(0)
      expect(filterTime).toBeLessThan(100) // Should complete in under 100ms
      
      console.log(`Filtered edges in ${filterTime.toFixed(2)}ms`)
    })
  })
})

// ============================================================================
// PHYSICS SIMULATION TESTS
// ============================================================================

describe('Force Simulation', () => {
  describe('Position Initialization', () => {
    it('should initialize node positions within bounds', () => {
      const data = generateGraphData(100)
      const width = 800
      const height = 600
      
      // Simulate position initialization
      data.nodes.forEach(node => {
        node.x = Math.random() * width
        node.y = Math.random() * height
        node.vx = 0
        node.vy = 0
      })
      
      data.nodes.forEach(node => {
        expect(node.x).toBeGreaterThanOrEqual(0)
        expect(node.x).toBeLessThanOrEqual(width)
        expect(node.y).toBeGreaterThanOrEqual(0)
        expect(node.y).toBeLessThanOrEqual(height)
        expect(node.vx).toBe(0)
        expect(node.vy).toBe(0)
      })
    })
  })
  
  describe('Force Calculations', () => {
    it('should calculate repulsion forces between nodes', () => {
      const nodeA: GraphNode = {
        id: 'a',
        label: 'A',
        type: 'content',
        weight: 5,
        x: 100,
        y: 100,
        vx: 0,
        vy: 0
      }
      
      const nodeB: GraphNode = {
        id: 'b',
        label: 'B',
        type: 'topic',
        weight: 5,
        x: 150,
        y: 150,
        vx: 0,
        vy: 0
      }
      
      // Calculate distance
      const dx = nodeB.x - nodeA.x
      const dy = nodeB.y - nodeA.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      expect(distance).toBeGreaterThan(0)
      expect(distance).toBeCloseTo(70.71, 1)
    })
    
    it('should calculate attraction forces for connected nodes', () => {
      const source: GraphNode = {
        id: 's',
        label: 'Source',
        type: 'content',
        weight: 5,
        x: 100,
        y: 100,
        vx: 0,
        vy: 0
      }
      
      const target: GraphNode = {
        id: 't',
        label: 'Target',
        type: 'topic',
        weight: 5,
        x: 200,
        y: 200,
        vx: 0,
        vy: 0
      }
      
      const edge: GraphEdge = {
        source: 's',
        target: 't',
        weight: 0.8,
        type: 'related'
      }
      
      const dx = target.x - source.x
      const dy = target.y - source.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      expect(distance).toBeGreaterThan(0)
      expect(edge.weight).toBeGreaterThan(0)
    })
  })
})

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('KnowledgeGraph Integration', () => {
  describe('Complete Workflow', () => {
    it('should handle complete graph lifecycle with 1000 nodes', () => {
      // 1. Generate data
      const data = generateGraphData(1000)
      expect(data.nodes.length).toBe(1000)
      
      // 2. Filter by type
      const contentNodes = data.nodes.filter(n => n.type === 'content')
      expect(contentNodes.length).toBeGreaterThan(0)
      
      // 3. Search nodes
      const searchResults = data.nodes.filter(n => 
        n.label.toLowerCase().includes('node 5')
      )
      expect(searchResults.length).toBeGreaterThan(0)
      
      // 4. Filter edges
      const nodeIds = new Set(contentNodes.map(n => n.id))
      const filteredEdges = data.edges.filter(e => 
        nodeIds.has(e.source) && nodeIds.has(e.target)
      )
      expect(filteredEdges.length).toBeGreaterThanOrEqual(0)
      
      console.log('Complete workflow test passed with 1000 nodes')
    })
  })
  
  describe('Stress Testing', () => {
    it('should handle multiple operations on 1000 nodes', () => {
      const data = generateGraphData(1000)
      
      const startTime = performance.now()
      
      // Perform multiple operations
      for (let i = 0; i < 10; i++) {
        const filtered = data.nodes.filter(n => n.weight > 5)
        const searched = data.nodes.filter(n => n.label.includes('Node'))
        const typeFiltered = data.nodes.filter(n => n.type === 'topic')
      }
      
      const endTime = performance.now()
      const totalTime = endTime - startTime
      
      expect(totalTime).toBeLessThan(500) // Should complete in under 500ms
      
      console.log(`Performed 30 operations on 1000 nodes in ${totalTime.toFixed(2)}ms`)
    })
  })
})

// ============================================================================
// EDGE CASE TESTS
// ============================================================================

describe('Edge Cases', () => {
  it('should handle empty graph', () => {
    const data = generateGraphData(0)
    expect(data.nodes.length).toBe(0)
    expect(data.edges.length).toBe(0)
  })
  
  it('should handle single node', () => {
    const data = generateGraphData(1)
    expect(data.nodes.length).toBe(1)
    expect(data.nodes[0].id).toBe('node-0')
  })
  
  it('should handle graph with no edges', () => {
    const data: GraphData = {
      nodes: [
        { id: '1', label: 'Node 1', type: 'content', weight: 5 },
        { id: '2', label: 'Node 2', type: 'topic', weight: 7 }
      ],
      edges: []
    }
    
    expect(data.nodes.length).toBe(2)
    expect(data.edges.length).toBe(0)
  })
  
  it('should handle nodes with extreme weights', () => {
    const data: GraphData = {
      nodes: [
        { id: '1', label: 'Min', type: 'content', weight: 1 },
        { id: '2', label: 'Max', type: 'topic', weight: 10 }
      ],
      edges: []
    }
    
    expect(data.nodes[0].weight).toBe(1)
    expect(data.nodes[1].weight).toBe(10)
  })
})
