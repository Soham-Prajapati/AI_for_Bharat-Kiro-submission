'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import apiClient from '@/services/api'
import { MultiplyGenerateResponse, Platform } from '@/types/api'

// ============================================================================
// TYPES
// ============================================================================

type ContentType = 'all' | 'clips' | 'quotes' | 'audiograms' | 'blogs' | 'newsletters'
type ViewMode = 'grid' | 'tree' | 'list'
type SortBy = 'type' | 'platform' | 'duration' | 'recent'

export interface ContentItem {
  id: string
  type: 'clip' | 'quote' | 'audiogram' | 'blog' | 'newsletter'
  title: string
  url?: string
  imageUrl?: string
  text?: string
  duration?: number
  platform?: Platform
  createdAt: string
  tags?: string[]
}

interface ContentMultiplierV2Props {
  videoId?: string
  transcript?: string
  onExport?: (items: ContentItem[]) => void
  initialData?: MultiplyGenerateResponse
}

interface TreeNode {
  id: string
  label: string
  type: ContentType
  children: ContentItem[]
  count: number
  expanded: boolean
}

// ============================================================================
// MOCK DATA GENERATOR (for demo with 100+ items)
// ============================================================================

const generateMockData = (count: number = 120): ContentItem[] => {
  const types: ContentItem['type'][] = ['clip', 'quote', 'audiogram', 'blog', 'newsletter']
  const platforms: Platform[] = ['youtube', 'instagram', 'tiktok', 'linkedin', 'twitter', 'facebook']
  const items: ContentItem[] = []

  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)]
    items.push({
      id: `item-${i}`,
      type,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} ${i + 1}`,
      platform: type === 'clip' ? platforms[Math.floor(Math.random() * platforms.length)] : undefined,
      duration: type === 'clip' || type === 'audiogram' ? Math.floor(Math.random() * 60) + 15 : undefined,
      text: type === 'quote' ? `Inspirational quote ${i + 1} about content creation and growth` : undefined,
      imageUrl: type === 'quote' ? `/placeholder-${i % 5}.jpg` : undefined,
      url: type !== 'quote' ? `https://example.com/content/${i}` : undefined,
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['content', 'viral', type]
    })
  }
  return items
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ContentMultiplierV2({
  videoId,
  transcript,
  onExport,
  initialData
}: ContentMultiplierV2Props) {
  // State
  const [viewMode, setViewMode] = useState<ViewMode>('tree')
  const [filterType, setFilterType] = useState<ContentType>('all')
  const [sortBy, setSortBy] = useState<SortBy>('type')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [contentData, setContentData] = useState<ContentItem[]>(() => generateMockData(120))
  const [error, setError] = useState<string | null>(null)
  const [previewItem, setPreviewItem] = useState<ContentItem | null>(null)
  const [treeNodes, setTreeNodes] = useState<TreeNode[]>([])
  
  // Virtualization
  const containerRef = useRef<HTMLDivElement>(null)
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 })
  const ITEM_HEIGHT = 120
  const BUFFER_SIZE = 5

  // Build tree structure
  useEffect(() => {
    const nodes: TreeNode[] = [
      { id: 'clips', label: 'Video Clips', type: 'clips', children: [], count: 0, expanded: true },
      { id: 'quotes', label: 'Quote Images', type: 'quotes', children: [], count: 0, expanded: true },
      { id: 'audiograms', label: 'Audiograms', type: 'audiograms', children: [], count: 0, expanded: true },
      { id: 'blogs', label: 'Blog Posts', type: 'blogs', children: [], count: 0, expanded: true },
      { id: 'newsletters', label: 'Newsletters', type: 'newsletters', children: [], count: 0, expanded: true }
    ]

    contentData.forEach(item => {
      const node = nodes.find(n => n.type === `${item.type}s` as ContentType)
      if (node) {
        node.children.push(item)
        node.count++
      }
    })

    setTreeNodes(nodes)
  }, [contentData])

  // Filtered and sorted content
  const filteredContent = useMemo(() => {
    let filtered = contentData

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(item => `${item.type}s` === filterType)
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.text?.toLowerCase().includes(query) ||
        item.platform?.toLowerCase().includes(query) ||
        item.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'type':
          return a.type.localeCompare(b.type)
        case 'platform':
          return (a.platform || '').localeCompare(b.platform || '')
        case 'duration':
          return (b.duration || 0) - (a.duration || 0)
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        default:
          return 0
      }
    })

    return filtered
  }, [contentData, filterType, searchQuery, sortBy])

  // Virtualized content for grid view
  const virtualizedContent = useMemo(() => {
    return filteredContent.slice(visibleRange.start, visibleRange.end)
  }, [filteredContent, visibleRange])

  // Handle scroll for virtualization
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop
    const start = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_SIZE)
    const end = Math.min(filteredContent.length, start + 20 + BUFFER_SIZE * 2)
    setVisibleRange({ start, end })
  }, [filteredContent.length])

  // Selection handlers
  const toggleSelection = useCallback((id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }, [])

  const selectAll = useCallback(() => {
    setSelectedItems(new Set(filteredContent.map(item => item.id)))
  }, [filteredContent])

  const deselectAll = useCallback(() => {
    setSelectedItems(new Set())
  }, [])

  const selectByType = useCallback((type: ContentType) => {
    const items = contentData.filter(item => type === 'all' || `${item.type}s` === type)
    setSelectedItems(new Set(items.map(item => item.id)))
  }, [contentData])

  // Bulk actions
  const handleBulkDelete = useCallback(() => {
    if (confirm(`Delete ${selectedItems.size} items?`)) {
      setContentData(prev => prev.filter(item => !selectedItems.has(item.id)))
      setSelectedItems(new Set())
    }
  }, [selectedItems])

  const handleBulkSchedule = useCallback(() => {
    alert(`Scheduling ${selectedItems.size} items for publishing`)
    // Implement scheduling logic
  }, [selectedItems])

  const handleBulkExport = useCallback((format: 'json' | 'csv' | 'pdf') => {
    const items = contentData.filter(item => selectedItems.has(item.id))
    
    if (format === 'json') {
      const dataStr = JSON.stringify(items, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `content-export-${Date.now()}.json`
      link.click()
      URL.revokeObjectURL(url)
    } else if (format === 'csv') {
      const headers = ['ID', 'Type', 'Title', 'Platform', 'Duration', 'Created']
      const rows = items.map(item => [
        item.id,
        item.type,
        item.title,
        item.platform || '',
        item.duration || '',
        new Date(item.createdAt).toLocaleDateString()
      ])
      const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `content-export-${Date.now()}.csv`
      link.click()
      URL.revokeObjectURL(url)
    }
    
    onExport?.(items)
  }, [contentData, selectedItems, onExport])

  // Tree node toggle
  const toggleTreeNode = useCallback((nodeId: string) => {
    setTreeNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, expanded: !node.expanded } : node
    ))
  }, [])

  // Get icon and color for content type
  const getTypeIcon = (type: string) => {
    const icons = {
      clip: '🎬',
      quote: '💬',
      audiogram: '🎵',
      blog: '📝',
      newsletter: '📧'
    }
    return icons[type as keyof typeof icons] || '📄'
  }

  const getTypeColor = (type: string) => {
    const colors = {
      clip: 'from-purple-500 to-pink-500',
      quote: 'from-blue-500 to-cyan-500',
      audiogram: 'from-green-500 to-emerald-500',
      blog: 'from-orange-500 to-red-500',
      newsletter: 'from-indigo-500 to-purple-500'
    }
    return colors[type as keyof typeof colors] || 'from-gray-500 to-gray-600'
  }

  return (
    <div
      className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <span className="text-4xl">🔄</span>
              Content Multiplier V2
            </h2>
            <p className="text-gray-300 text-sm">
              Transform 1 video into 100+ pieces of optimized content
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              {contentData.length}
            </div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Total Pieces</div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-6 bg-gray-800/30">
        {treeNodes.map(node => (
          <div
            key={node.id}
            className="bg-gray-700/50 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-700/70 transition-colors"
            onClick={() => selectByType(node.type)}
          >
            <div className="text-3xl mb-2">{getTypeIcon(node.type.slice(0, -1))}</div>
            <div className="text-2xl font-bold text-white">{node.count}</div>
            <div className="text-xs text-gray-400 mt-1">{node.label}</div>
          </div>
        ))}
      </div>

      {/* Controls Bar */}
      <div className="p-6 bg-gray-800/20 border-b border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search content by title, platform, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-12 bg-gray-700/50 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as ContentType)}
            className="px-4 py-3 bg-gray-700/50 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="clips">Video Clips</option>
            <option value="quotes">Quote Images</option>
            <option value="audiograms">Audiograms</option>
            <option value="blogs">Blog Posts</option>
            <option value="newsletters">Newsletters</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="px-4 py-3 bg-gray-700/50 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
          >
            <option value="type">Sort by Type</option>
            <option value="platform">Sort by Platform</option>
            <option value="duration">Sort by Duration</option>
            <option value="recent">Sort by Recent</option>
          </select>

          {/* View Mode */}
          <div className="flex gap-2">
            {(['grid', 'tree', 'list'] as ViewMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-3 rounded-lg font-semibold capitalize ${
                  viewMode === mode
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
{selectedItems.size > 0 && (
          <div
            className="p-4 bg-purple-900/30 border-b border-purple-700/50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-white font-semibold">
                  {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={selectAll}
                  className="text-sm text-purple-400 hover:text-purple-300"
                >
                  Select All ({filteredContent.length})
                </button>
                <button
                  onClick={deselectAll}
                  className="text-sm text-gray-400 hover:text-gray-300"
                >
                  Deselect All
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkExport('json')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export JSON
                </button>
                
                <button
                  onClick={() => handleBulkExport('csv')}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export CSV
                </button>
                
                <button
                  onClick={handleBulkSchedule}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Schedule
                </button>
                
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
{/* Content Display */}
      <div className="flex">
        {/* Main Content Area */}
        <div className={`flex-1 ${previewItem ? 'lg:w-2/3' : 'w-full'}`}>
          {viewMode === 'grid' && (
            <GridView
              content={virtualizedContent}
              selectedItems={selectedItems}
              onToggleSelect={toggleSelection}
              onPreview={setPreviewItem}
              getTypeIcon={getTypeIcon}
              getTypeColor={getTypeColor}
              totalCount={filteredContent.length}
              onScroll={handleScroll}
            />
          )}

          {viewMode === 'tree' && (
            <TreeView
              nodes={treeNodes}
              selectedItems={selectedItems}
              onToggleSelect={toggleSelection}
              onToggleNode={toggleTreeNode}
              onPreview={setPreviewItem}
              getTypeIcon={getTypeIcon}
              getTypeColor={getTypeColor}
            />
          )}

          {viewMode === 'list' && (
            <ListView
              content={filteredContent}
              selectedItems={selectedItems}
              onToggleSelect={toggleSelection}
              onPreview={setPreviewItem}
              getTypeIcon={getTypeIcon}
            />
          )}

          {/* Empty State */}
          {filteredContent.length === 0 && (
            <div
              className="text-center py-20"
            >
              <div className="text-6xl mb-4">🔍</div>
              <div className="text-2xl text-gray-300 font-semibold mb-2">No content found</div>
              <div className="text-sm text-gray-500">
                Try adjusting your filters or search query
              </div>
            </div>
          )}
        </div>

        {/* Preview Panel */}
{previewItem && (
            <PreviewPanel
              item={previewItem}
              onClose={() => setPreviewItem(null)}
              getTypeIcon={getTypeIcon}
              getTypeColor={getTypeColor}
            />
          )}
</div>
    </div>
  )
}

// ============================================================================
// GRID VIEW COMPONENT
// ============================================================================

interface GridViewProps {
  content: ContentItem[]
  selectedItems: Set<string>
  onToggleSelect: (id: string) => void
  onPreview: (item: ContentItem) => void
  getTypeIcon: (type: string) => string
  getTypeColor: (type: string) => string
  totalCount: number
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void
}

function GridView({
  content,
  selectedItems,
  onToggleSelect,
  onPreview,
  getTypeIcon,
  getTypeColor,
  totalCount,
  onScroll
}: GridViewProps) {
  return (
    <div 
      className="p-6 overflow-y-auto max-h-[600px]"
      onScroll={onScroll}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
{content.map((item, index) => (
            <div
              key={item.id}
              className={`bg-gray-800/50 rounded-lg border-2 overflow-hidden cursor-pointer transition-all ${
                selectedItems.has(item.id) ? 'border-purple-500 ring-2 ring-purple-500/50' : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              {/* Thumbnail */}
              <div 
                className={`h-32 bg-gradient-to-br ${getTypeColor(item.type)} flex items-center justify-center relative`}
                onClick={() => onPreview(item)}
              >
                <div className="text-5xl">{getTypeIcon(item.type)}</div>
                
                {/* Selection Checkbox */}
                <div 
                  className="absolute top-2 left-2 z-10"
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleSelect(item.id)
                  }}
                >
                  {selectedItems.has(item.id) ? (
                    <div className="w-6 h-6 bg-purple-500 rounded-md flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-6 h-6 border-2 border-white/50 rounded-md bg-black/20 hover:bg-black/40" />
                  )}
                </div>

                {/* Preview Button */}
                <button
                  onClick={() => onPreview(item)}
                  className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-md transition-colors"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="px-2 py-1 bg-gray-700 text-gray-200 text-xs rounded font-semibold capitalize">
                    {item.type}
                  </span>
                  {item.platform && (
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded capitalize">
                      {item.platform}
                    </span>
                  )}
                  {item.duration && (
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                      {item.duration}s
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-white line-clamp-2 mb-2">
                  {item.title}
                </h3>
                {item.tags && (
                  <div className="flex gap-1 flex-wrap">
                    {item.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-xs text-gray-400">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
</div>
      
      {/* Showing indicator */}
      <div className="text-center text-sm text-gray-400 mt-6">
        Showing {content.length} of {totalCount} items
      </div>
    </div>
  )
}

// ============================================================================
// TREE VIEW COMPONENT
// ============================================================================

interface TreeViewProps {
  nodes: TreeNode[]
  selectedItems: Set<string>
  onToggleSelect: (id: string) => void
  onToggleNode: (nodeId: string) => void
  onPreview: (item: ContentItem) => void
  getTypeIcon: (type: string) => string
  getTypeColor: (type: string) => string
}

function TreeView({
  nodes,
  selectedItems,
  onToggleSelect,
  onToggleNode,
  onPreview,
  getTypeIcon,
  getTypeColor
}: TreeViewProps) {
  return (
    <div className="p-6 overflow-y-auto max-h-[600px]">
      <div className="space-y-3">
        {nodes.map(node => (
          <div
            key={node.id}
            className="bg-gray-800/30 rounded-xl overflow-hidden border border-gray-700"
          >
            {/* Node Header */}
            <div 
              className="flex items-center justify-between p-4 bg-gray-800/50 cursor-pointer hover:bg-gray-800/70 transition-colors"
              onClick={() => onToggleNode(node.id)}
            >
              <div className="flex items-center gap-4">
                <div
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                
                <div className="text-3xl">{getTypeIcon(node.type.slice(0, -1))}</div>
                
                <div>
                  <h3 className="text-lg font-bold text-white">{node.label}</h3>
                  <p className="text-sm text-gray-400">{node.count} items</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  {node.count}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    const nodeItems = node.children.map(c => c.id)
                    const allSelected = nodeItems.every(id => selectedItems.has(id))
                    nodeItems.forEach(id => {
                      if (allSelected) {
                        selectedItems.delete(id)
                      } else if (!selectedItems.has(id)) {
                        onToggleSelect(id)
                      }
                    })
                  }}
                  className="px-3 py-1 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Select All
                </button>
              </div>
            </div>

            {/* Node Children */}
{node.expanded && (
                <div
                  className="overflow-hidden"
                >
                  <div className="p-4 space-y-2 bg-gray-900/30">
                    {node.children.map((item, index) => (
                      <div
                        key={item.id}
                        className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all ${
                          selectedItems.has(item.id)
                            ? 'bg-purple-500/20 border border-purple-500'
                            : 'bg-gray-800/50 border border-gray-700 hover:bg-gray-800/70'
                        }`}
                      >
                        {/* Checkbox */}
                        <div 
                          className="flex-shrink-0"
                          onClick={() => onToggleSelect(item.id)}
                        >
                          {selectedItems.has(item.id) ? (
                            <div className="w-5 h-5 bg-purple-500 rounded flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          ) : (
                            <div className="w-5 h-5 border-2 border-gray-500 rounded" />
                          )}
                        </div>

                        {/* Icon */}
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getTypeColor(item.type)} flex items-center justify-center text-2xl flex-shrink-0`}>
                          {getTypeIcon(item.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-white truncate">{item.title}</div>
                          <div className="flex items-center gap-2 mt-1">
                            {item.platform && (
                              <span className="text-xs text-gray-400 capitalize">{item.platform}</span>
                            )}
                            {item.duration && (
                              <span className="text-xs text-gray-400">{item.duration}s</span>
                            )}
                            <span className="text-xs text-gray-500">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Preview Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onPreview(item)
                          }}
                          className="flex-shrink-0 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
</div>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// LIST VIEW COMPONENT
// ============================================================================

interface ListViewProps {
  content: ContentItem[]
  selectedItems: Set<string>
  onToggleSelect: (id: string) => void
  onPreview: (item: ContentItem) => void
  getTypeIcon: (type: string) => string
}

function ListView({
  content,
  selectedItems,
  onToggleSelect,
  onPreview,
  getTypeIcon
}: ListViewProps) {
  return (
    <div className="p-6 overflow-y-auto max-h-[600px]">
      <div className="bg-gray-800/30 rounded-xl overflow-hidden border border-gray-700">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 p-4 bg-gray-800/50 border-b border-gray-700 text-sm font-semibold text-gray-400">
          <div className="col-span-1"></div>
          <div className="col-span-1">Type</div>
          <div className="col-span-4">Title</div>
          <div className="col-span-2">Platform</div>
          <div className="col-span-1">Duration</div>
          <div className="col-span-2">Created</div>
          <div className="col-span-1">Actions</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-700">
          {content.map((item, index) => (
            <div
              key={item.id}
              className={`grid grid-cols-12 gap-4 p-4 items-center transition-colors ${
                selectedItems.has(item.id)
                  ? 'bg-purple-500/10'
                  : 'hover:bg-gray-800/50'
              }`}
            >
              {/* Checkbox */}
              <div className="col-span-1">
                <div 
                  className="cursor-pointer"
                  onClick={() => onToggleSelect(item.id)}
                >
                  {selectedItems.has(item.id) ? (
                    <div className="w-5 h-5 bg-purple-500 rounded flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-5 h-5 border-2 border-gray-500 rounded" />
                  )}
                </div>
              </div>

              {/* Type */}
              <div className="col-span-1">
                <div className="text-2xl">{getTypeIcon(item.type)}</div>
              </div>

              {/* Title */}
              <div className="col-span-4">
                <div className="text-sm font-semibold text-white truncate">{item.title}</div>
                {item.tags && (
                  <div className="flex gap-1 mt-1">
                    {item.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-xs text-gray-400">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Platform */}
              <div className="col-span-2">
                {item.platform ? (
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded capitalize">
                    {item.platform}
                  </span>
                ) : (
                  <span className="text-xs text-gray-500">—</span>
                )}
              </div>

              {/* Duration */}
              <div className="col-span-1">
                {item.duration ? (
                  <span className="text-sm text-gray-300">{item.duration}s</span>
                ) : (
                  <span className="text-xs text-gray-500">—</span>
                )}
              </div>

              {/* Created */}
              <div className="col-span-2">
                <span className="text-sm text-gray-400">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Actions */}
              <div className="col-span-1">
                <button
                  onClick={() => onPreview(item)}
                  className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// PREVIEW PANEL COMPONENT
// ============================================================================

interface PreviewPanelProps {
  item: ContentItem
  onClose: () => void
  getTypeIcon: (type: string) => string
  getTypeColor: (type: string) => string
}

function PreviewPanel({
  item,
  onClose,
  getTypeIcon,
  getTypeColor
}: PreviewPanelProps) {
  return (
    <div
      className="w-full lg:w-1/3 border-l border-gray-700 bg-gray-800/30"
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Preview</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Thumbnail */}
          <div className={`w-full h-48 rounded-xl bg-gradient-to-br ${getTypeColor(item.type)} flex items-center justify-center mb-6`}>
            <div className="text-7xl">{getTypeIcon(item.type)}</div>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider">Type</label>
              <div className="mt-1 px-3 py-2 bg-gray-700/50 rounded-lg">
                <span className="text-white font-semibold capitalize">{item.type}</span>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider">Title</label>
              <div className="mt-1 px-3 py-2 bg-gray-700/50 rounded-lg">
                <span className="text-white">{item.title}</span>
              </div>
            </div>

            {item.platform && (
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider">Platform</label>
                <div className="mt-1 px-3 py-2 bg-gray-700/50 rounded-lg">
                  <span className="text-white capitalize">{item.platform}</span>
                </div>
              </div>
            )}

            {item.duration && (
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider">Duration</label>
                <div className="mt-1 px-3 py-2 bg-gray-700/50 rounded-lg">
                  <span className="text-white">{item.duration} seconds</span>
                </div>
              </div>
            )}

            {item.text && (
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider">Content</label>
                <div className="mt-1 px-3 py-2 bg-gray-700/50 rounded-lg">
                  <p className="text-white text-sm leading-relaxed">{item.text}</p>
                </div>
              </div>
            )}

            {item.url && (
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider">URL</label>
                <div className="mt-1 px-3 py-2 bg-gray-700/50 rounded-lg">
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 text-sm break-all"
                  >
                    {item.url}
                  </a>
                </div>
              </div>
            )}

            {item.tags && item.tags.length > 0 && (
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider">Tags</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {item.tags.map(tag => (
                    <span 
                      key={tag}
                      className="px-3 py-1 bg-purple-500/20 text-purple-400 text-sm rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider">Created</label>
              <div className="mt-1 px-3 py-2 bg-gray-700/50 rounded-lg">
                <span className="text-white text-sm">
                  {new Date(item.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 space-y-3">
            <button
              className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>

            <button
              className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>

            <button
              className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
