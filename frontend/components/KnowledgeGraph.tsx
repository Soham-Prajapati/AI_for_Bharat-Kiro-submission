'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import apiClient from '@/services/api'

// ============================================================================
// TYPES
// ============================================================================

export type NodeType = 'content' | 'topic' | 'creator'

export interface GraphNode {
  id: string
  label: string
  type: NodeType
  weight: number
  x?: number
  y?: number
  vx?: number
  vy?: number
  metadata?: Record<string, any>
}

export interface GraphEdge {
  source: string
  target: string
  weight: number
  type: string
}

export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

interface KnowledgeGraphProps {
  initialTopic?: string
  depth?: number
  width?: number
  height?: number
  onNodeClick?: (node: GraphNode) => void
  className?: string
}

// ============================================================================
// CONSTANTS
// ============================================================================

const NODE_COLORS: Record<NodeType, string> = {
  content: '#3b82f6',  // blue
  topic: '#ec4899',    // pink
  creator: '#10b981'   // green
}

const NODE_SIZES: Record<NodeType, number> = {
  content: 8,
  topic: 12,
  creator: 10
}

// ============================================================================
// PHYSICS SIMULATION
// ============================================================================

class ForceSimulation {
  private nodes: GraphNode[]
  private edges: GraphEdge[]
  private width: number
  private height: number
  private alpha: number = 1
  private alphaDecay: number = 0.02
  private velocityDecay: number = 0.4
  
  constructor(nodes: GraphNode[], edges: GraphEdge[], width: number, height: number) {
    this.nodes = nodes
    this.edges = edges
    this.width = width
    this.height = height
    
    // Initialize positions
    this.nodes.forEach(node => {
      if (!node.x) node.x = Math.random() * width
      if (!node.y) node.y = Math.random() * height
      node.vx = 0
      node.vy = 0
    })
  }
  
  tick(): boolean {
    if (this.alpha < 0.001) return false
    
    // Apply forces
    this.applyRepulsion()
    this.applyAttraction()
    this.applyCenterForce()
    
    // Update positions
    this.nodes.forEach(node => {
      node.vx! *= this.velocityDecay
      node.vy! *= this.velocityDecay
      node.x! += node.vx!
      node.y! += node.vy!
      
      // Boundary constraints
      node.x = Math.max(20, Math.min(this.width - 20, node.x!))
      node.y = Math.max(20, Math.min(this.height - 20, node.y!))
    })
    
    this.alpha *= (1 - this.alphaDecay)
    return true
  }
  
  private applyRepulsion() {
    const strength = 100
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const nodeA = this.nodes[i]
        const nodeB = this.nodes[j]
        
        const dx = nodeB.x! - nodeA.x!
        const dy = nodeB.y! - nodeA.y!
        const distance = Math.sqrt(dx * dx + dy * dy) || 1
        
        const force = (strength * this.alpha) / (distance * distance)
        const fx = (dx / distance) * force
        const fy = (dy / distance) * force
        
        nodeA.vx! -= fx
        nodeA.vy! -= fy
        nodeB.vx! += fx
        nodeB.vy! += fy
      }
    }
  }
  
  private applyAttraction() {
    const strength = 0.01
    this.edges.forEach(edge => {
      const source = this.nodes.find(n => n.id === edge.source)
      const target = this.nodes.find(n => n.id === edge.target)
      
      if (!source || !target) return
      
      const dx = target.x! - source.x!
      const dy = target.y! - source.y!
      const distance = Math.sqrt(dx * dx + dy * dy) || 1
      
      const force = distance * strength * edge.weight * this.alpha
      const fx = (dx / distance) * force
      const fy = (dy / distance) * force
      
      source.vx! += fx
      source.vy! += fy
      target.vx! -= fx
      target.vy! -= fy
    })
  }
  
  private applyCenterForce() {
    const strength = 0.05
    const cx = this.width / 2
    const cy = this.height / 2
    
    this.nodes.forEach(node => {
      const dx = cx - node.x!
      const dy = cy - node.y!
      node.vx! += dx * strength * this.alpha
      node.vy! += dy * strength * this.alpha
    })
  }
  
  reheat() {
    this.alpha = 1
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function KnowledgeGraph({
  initialTopic = 'AI Content',
  depth = 2,
  width = 800,
  height = 600,
  onNodeClick,
  className = ''
}: KnowledgeGraphProps) {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<NodeType | 'all'>('all')
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const simulationRef = useRef<ForceSimulation | null>(null)
  const animationFrameRef = useRef<number>()
  
  // ============================================================================
  // DATA FETCHING
  // ============================================================================
  
  useEffect(() => {
    fetchGraphData()
  }, [initialTopic, depth])
  
  const fetchGraphData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await apiClient.request<GraphData>('/api/graph/explore', {
        method: 'GET',
      })
      
      setGraphData(response)
    } catch (err: any) {
      setError(err.message || 'Failed to load graph data')
      console.error('Graph fetch error:', err)
    } finally {
      setLoading(false)
    }
  }
  
  // ============================================================================
  // FILTERING & SEARCH
  // ============================================================================
  
  const filteredData = useMemo(() => {
    let nodes = graphData.nodes
    
    // Filter by type
    if (filterType !== 'all') {
      nodes = nodes.filter(n => n.type === filterType)
    }
    
    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      nodes = nodes.filter(n => 
        n.label.toLowerCase().includes(query) ||
        n.id.toLowerCase().includes(query)
      )
    }
    
    // Filter edges to only include visible nodes
    const nodeIds = new Set(nodes.map(n => n.id))
    const edges = graphData.edges.filter(e => 
      nodeIds.has(e.source) && nodeIds.has(e.target)
    )
    
    return { nodes, edges }
  }, [graphData, filterType, searchQuery])
  
  // ============================================================================
  // PHYSICS SIMULATION
  // ============================================================================
  
  useEffect(() => {
    if (filteredData.nodes.length === 0) return
    
    simulationRef.current = new ForceSimulation(
      filteredData.nodes,
      filteredData.edges,
      width,
      height
    )
    
    const animate = () => {
      if (simulationRef.current?.tick()) {
        drawGraph()
        animationFrameRef.current = requestAnimationFrame(animate)
      } else {
        drawGraph()
      }
    }
    
    animate()
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [filteredData, width, height, zoom, pan])
  
  // ============================================================================
  // CANVAS RENDERING
  // ============================================================================
  
  const drawGraph = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height)
    
    // Apply transformations
    ctx.save()
    ctx.translate(pan.x, pan.y)
    ctx.scale(zoom, zoom)
    
    // Draw edges
    ctx.strokeStyle = 'rgba(156, 163, 175, 0.3)'
    ctx.lineWidth = 1
    filteredData.edges.forEach(edge => {
      const source = filteredData.nodes.find(n => n.id === edge.source)
      const target = filteredData.nodes.find(n => n.id === edge.target)
      
      if (!source || !target) return
      
      ctx.beginPath()
      ctx.moveTo(source.x!, source.y!)
      ctx.lineTo(target.x!, target.y!)
      ctx.globalAlpha = edge.weight
      ctx.stroke()
      ctx.globalAlpha = 1
    })
    
    // Draw nodes
    filteredData.nodes.forEach(node => {
      const size = NODE_SIZES[node.type] * (node.weight / 10)
      const color = NODE_COLORS[node.type]
      
      // Node circle
      ctx.beginPath()
      ctx.arc(node.x!, node.y!, size, 0, 2 * Math.PI)
      ctx.fillStyle = color
      ctx.fill()
      
      // Highlight selected/hovered
      if (selectedNode?.id === node.id || hoveredNode?.id === node.id) {
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 3
        ctx.stroke()
      }
      
      // Node label
      if (zoom > 0.5) {
        ctx.fillStyle = '#ffffff'
        ctx.font = `${12 / zoom}px sans-serif`
        ctx.textAlign = 'center'
        ctx.fillText(node.label, node.x!, node.y! + size + 15)
      }
    })
    
    ctx.restore()
  }, [filteredData, zoom, pan, selectedNode, hoveredNode, width, height])
  
  // ============================================================================
  // INTERACTION HANDLERS
  // ============================================================================
  
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left - pan.x) / zoom
    const y = (e.clientY - rect.top - pan.y) / zoom
    
    // Find clicked node
    const clickedNode = filteredData.nodes.find(node => {
      const dx = x - node.x!
      const dy = y - node.y!
      const distance = Math.sqrt(dx * dx + dy * dy)
      const size = NODE_SIZES[node.type] * (node.weight / 10)
      return distance <= size
    })
    
    if (clickedNode) {
      setSelectedNode(clickedNode)
      onNodeClick?.(clickedNode)
    } else {
      setSelectedNode(null)
    }
  }
  
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      const dx = e.clientX - dragStart.x
      const dy = e.clientY - dragStart.y
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }))
      setDragStart({ x: e.clientX, y: e.clientY })
      return
    }
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left - pan.x) / zoom
    const y = (e.clientY - rect.top - pan.y) / zoom
    
    // Find hovered node
    const hovered = filteredData.nodes.find(node => {
      const dx = x - node.x!
      const dy = y - node.y!
      const distance = Math.sqrt(dx * dx + dy * dy)
      const size = NODE_SIZES[node.type] * (node.weight / 10)
      return distance <= size
    })
    
    setHoveredNode(hovered || null)
    canvas.style.cursor = hovered ? 'pointer' : isDragging ? 'grabbing' : 'grab'
  }
  
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }
  
  const handleMouseUp = () => {
    setIsDragging(false)
  }
  
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom(prev => Math.max(0.1, Math.min(3, prev * delta)))
  }
  
  const handleZoomIn = () => setZoom(prev => Math.min(3, prev * 1.2))
  const handleZoomOut = () => setZoom(prev => Math.max(0.1, prev / 1.2))
  const handleResetView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
    simulationRef.current?.reheat()
  }
  
  // ============================================================================
  // RENDER
  // ============================================================================
  
  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-gray-800/50 rounded-xl border border-gray-700 ${className}`} style={{ width, height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading knowledge graph...</p>
        </p>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-800/50 rounded-xl border border-red-700 ${className}`} style={{ width, height }}>
        <div className="text-center text-red-400">
          <p className="font-semibold mb-2">Error loading graph</p>
          <p className="text-sm">{error}</p>
          <button 
            onClick={fetchGraphData}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Retry
          </button>
        </p>
      </div>
    )
  }
  
  return (
    <div
      className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Knowledge Graph</h2>
            <p className="text-sm text-gray-400">
              {filteredData.nodes.length} nodes, {filteredData.edges.length} connections
            </p>
          </h2>
          
          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Zoom Out"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <button
              onClick={handleZoomIn}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Zoom In"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button
              onClick={handleResetView}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Reset View"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search nodes..."
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as NodeType | 'all')}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Types</option>
            <option value="content">Content</option>
            <option value="topic">Topics</option>
            <option value="creator">Creators</option>
          </select>
        </div>
      </div>
      
      {/* Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          className="bg-gray-900"
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        />
        
        {/* Tooltip */}
        
          {hoveredNode && (
            <div
              className="absolute pointer-events-none bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-3 shadow-xl"
              style={{
                left: hoveredNode.x! * zoom + pan.x + 20,
                top: hoveredNode.y! * zoom + pan.y - 40
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: NODE_COLORS[hoveredNode.type] }}
                />
                <span className="font-semibold text-white capitalize">{hoveredNode.type}</span>
              </span>
              <div className="text-sm text-white font-medium">{hoveredNode.label}</div>
              <div className="text-xs text-gray-400 mt-1">Weight: {hoveredNode.weight}</div>
            </div>
          )}
        
      </div>
      
      {/* Legend */}
      <div className="p-4 border-t border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: NODE_COLORS.content }} />
            <span className="text-sm text-gray-300">Content</span>
          </span>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: NODE_COLORS.topic }} />
            <span className="text-sm text-gray-300">Topics</span>
          </span>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: NODE_COLORS.creator }} />
            <span className="text-sm text-gray-300">Creators</span>
          </span>
        </div>
        
        <div className="text-sm text-gray-400">
          Zoom: {(zoom * 100).toFixed(0)}%
        </div>
      </div>
      
      {/* Selected Node Details */}
      
        {selectedNode && (
          <div
            className="p-4 border-t border-gray-700 bg-gray-800/70"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: NODE_COLORS[selectedNode.type] }}
                  />
                  <h3 className="text-lg font-bold text-white">{selectedNode.label}</h3>
                </h3>
                <p className="text-sm text-gray-400 capitalize mb-2">Type: {selectedNode.type}</p>
                <p className="text-sm text-gray-400">Weight: {selectedNode.weight}</p>
                {selectedNode.metadata && (
                  <div className="mt-2 text-xs text-gray-500">
                    <pre>{JSON.stringify(selectedNode.metadata, null, 2)}</pre>
                  </p>
                )}
              </p>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      
    </div>
  )
}
