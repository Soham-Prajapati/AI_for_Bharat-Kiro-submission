'use client'

import { useState, useMemo } from 'react'
import apiClient from '@/services/api'
import { MultiplyGenerateResponse, Clip, Quote, Audiogram } from '@/types/api'

// ============================================================================
// TYPES
// ============================================================================

type ContentType = 'all' | 'clips' | 'quotes' | 'audiograms'
type ViewMode = 'grid' | 'tree'

interface ContentItem {
  id: string
  type: 'clip' | 'quote' | 'audiogram'
  title: string
  url?: string
  imageUrl?: string
  text?: string
  duration?: number
  platform?: string
}

interface ContentMultiplierProps {
  videoId?: string
  transcript?: string
  onExport?: (items: ContentItem[]) => void
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function ContentMultiplier({
  videoId,
  transcript,
  onExport
}: ContentMultiplierProps) {
  // State
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [filterType, setFilterType] = useState<ContentType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [contentData, setContentData] = useState<MultiplyGenerateResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Transform API response to ContentItem[]
  const allContent = useMemo(() => {
    if (!contentData) return []
    
    const items: ContentItem[] = []
    
    // Add clips
    contentData.clips.forEach(clip => {
      items.push({
        id: clip.id,
        type: 'clip',
        title: `${clip.platform} Clip`,
        url: clip.url,
        duration: clip.duration,
        platform: clip.platform
      })
    })
    
    // Add quotes
    contentData.quotes.forEach(quote => {
      items.push({
        id: quote.id,
        type: 'quote',
        title: quote.text.substring(0, 50) + '...',
        text: quote.text,
        imageUrl: quote.imageUrl
      })
    })
    
    // Add audiograms
    contentData.audiograms.forEach(audiogram => {
      items.push({
        id: audiogram.id,
        type: 'audiogram',
        title: `Audiogram ${audiogram.duration}s`,
        url: audiogram.url,
        duration: audiogram.duration
      })
    })
    
    return items
  }, [contentData])

  // Filtered content
  const filteredContent = useMemo(() => {
    let filtered = allContent

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.type === filterType.slice(0, -1))
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.text?.toLowerCase().includes(query) ||
        item.platform?.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [allContent, filterType, searchQuery])

  // Generate content
  const handleGenerate = async () => {
    if (!transcript) {
      setError('No transcript provided')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await apiClient.multiply.generate({
        videoId,
        transcript,
        platforms: ['youtube', 'instagram', 'tiktok', 'linkedin', 'twitter', 'facebook']
      })
      setContentData(response)
    } catch (err: any) {
      setError(err.message || 'Failed to generate content')
    } finally {
      setIsLoading(false)
    }
  }

  // Selection handlers
  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedItems)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    setSelectedItems(newSelection)
  }

  const selectAll = () => {
    setSelectedItems(new Set(filteredContent.map(item => item.id)))
  }

  const deselectAll = () => {
    setSelectedItems(new Set())
  }

  // Export handlers
  const handleExportSelected = () => {
    const items = allContent.filter(item => selectedItems.has(item.id))
    onExport?.(items)
    // Trigger download
    downloadItems(items)
  }

  const handleExportAll = () => {
    onExport?.(filteredContent)
    downloadItems(filteredContent)
  }

  const downloadItems = (items: ContentItem[]) => {
    // Create a JSON file with all content metadata
    const dataStr = JSON.stringify(items, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `content-multiplier-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Get icon for content type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'clip': return '🎬'
      case 'quote': return '💬'
      case 'audiogram': return '🎵'
      default: return '📄'
    }
  }

  // Get color for content type
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'clip': return 'from-purple-500 to-pink-500'
      case 'quote': return 'from-blue-500 to-cyan-500'
      case 'audiogram': return 'from-green-500 to-emerald-500'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  return (
    <div
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6"
    >
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Content Multiplier
        </h2>
        <p className="text-gray-400 text-sm">
          Transform 1 video into 50+ pieces of content
        </p>
      </div>

      {/* Generate Button */}
      {!contentData && (
        <button
          onClick={handleGenerate}
          disabled={isLoading || !transcript}
          className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed mb-6"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating Content...
            </span>
          ) : (
            'Generate 50+ Content Pieces'
          )}
        </button>
      )}

      {/* Error Message */}
      {error && (
        <div
          className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400"
        >
          {error}
        </div>
      )}

      {/* Content Display */}
      {contentData && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-700/50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-purple-400">{contentData.totalPieces}</div>
              <div className="text-xs text-gray-400 mt-1">Total Pieces</div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-pink-400">{contentData.clips.length}</div>
              <div className="text-xs text-gray-400 mt-1">Clips</div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-400">{contentData.quotes.length}</div>
              <div className="text-xs text-gray-400 mt-1">Quotes</div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-400">{contentData.audiograms.length}</div>
              <div className="text-xs text-gray-400 mt-1">Audiograms</div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
              />
            </div>

            {/* Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as ContentType)}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="clips">Clips</option>
              <option value="quotes">Quotes</option>
              <option value="audiograms">Audiograms</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  viewMode === 'grid'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('tree')}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  viewMode === 'tree'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                Tree
              </button>
            </div>
          </div>

          {/* Selection Controls */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-700">
            <div className="text-sm text-gray-400">
              {selectedItems.size} of {filteredContent.length} selected
            </div>
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                className="px-3 py-1 text-sm text-purple-400 hover:text-purple-300"
              >
                Select All
              </button>
              <button
                onClick={deselectAll}
                className="px-3 py-1 text-sm text-gray-400 hover:text-gray-300"
              >
                Deselect All
              </button>
              <button
                onClick={handleExportSelected}
                disabled={selectedItems.size === 0}
                className="px-4 py-1 bg-purple-600 text-white text-sm font-semibold rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Export Selected
              </button>
              <button
                onClick={handleExportAll}
                className="px-4 py-1 bg-pink-600 text-white text-sm font-semibold rounded"
              >
                Export All
              </button>
            </div>
          </div>

          {/* Content Grid/Tree */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              
                {filteredContent.map((item, index) => (
                  <ContentCard
                    key={item.id}
                    item={item}
                    index={index}
                    isSelected={selectedItems.has(item.id)}
                    onToggleSelect={() => toggleSelection(item.id)}
                    getTypeIcon={getTypeIcon}
                    getTypeColor={getTypeColor}
                  />
                ))}
              
            </div>
          ) : (
            <ContentTree
              content={filteredContent}
              selectedItems={selectedItems}
              onToggleSelect={toggleSelection}
              getTypeIcon={getTypeIcon}
              getTypeColor={getTypeColor}
            />
          )}

          {/* Empty State */}
          {filteredContent.length === 0 && (
            <div
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">🔍</div>
              <div className="text-xl text-gray-400">No content found</div>
              <div className="text-sm text-gray-500 mt-2">
                Try adjusting your filters or search query
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ============================================================================
// CONTENT CARD COMPONENT
// ============================================================================

interface ContentCardProps {
  item: ContentItem
  index: number
  isSelected: boolean
  onToggleSelect: () => void
  getTypeIcon: (type: string) => string
  getTypeColor: (type: string) => string
}

function ContentCard({
  item,
  index,
  isSelected,
  onToggleSelect,
  getTypeIcon,
  getTypeColor
}: ContentCardProps) {
  return (
    <div
      className={`bg-gray-700/50 rounded-lg border-2 overflow-hidden cursor-pointer transition-all ${
        isSelected ? 'border-purple-500' : 'border-gray-600'
      }`}
      onClick={onToggleSelect}
    >
      {/* Thumbnail */}
      <div className={`h-32 bg-gradient-to-br ${getTypeColor(item.type)} flex items-center justify-center relative`}>
        <div className="text-5xl">{getTypeIcon(item.type)}</div>
        {isSelected && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-1 bg-gray-600 text-gray-200 text-xs rounded font-semibold">
            {item.type}
          </span>
          {item.platform && (
            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded">
              {item.platform}
            </span>
          )}
        </div>
        <h3 className="text-sm font-semibold text-white line-clamp-2 mb-2">
          {item.title}
        </h3>
        {item.duration && (
          <div className="text-xs text-gray-400">
            Duration: {item.duration}s
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// CONTENT TREE COMPONENT
// ============================================================================

interface ContentTreeProps {
  content: ContentItem[]
  selectedItems: Set<string>
  onToggleSelect: (id: string) => void
  getTypeIcon: (type: string) => string
  getTypeColor: (type: string) => string
}

function ContentTree({
  content,
  selectedItems,
  onToggleSelect,
  getTypeIcon,
  getTypeColor
}: ContentTreeProps) {
  // Group content by type
  const groupedContent = useMemo(() => {
    const groups: Record<string, ContentItem[]> = {
      clip: [],
      quote: [],
      audiogram: []
    }
    
    content.forEach(item => {
      groups[item.type].push(item)
    })
    
    return groups
  }, [content])

  return (
    <div className="space-y-4">
      {Object.entries(groupedContent).map(([type, items]) => (
        items.length > 0 && (
          <div
            key={type}
            className="bg-gray-700/30 rounded-lg p-4"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl">{getTypeIcon(type)}</div>
              <div>
                <h3 className="text-lg font-bold text-white capitalize">{type}s</h3>
                <p className="text-sm text-gray-400">{items.length} items</p>
              </p>
            </div>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                    selectedItems.has(item.id)
                      ? 'bg-purple-500/20 border border-purple-500'
                      : 'bg-gray-700/50 border border-gray-600'
                  }`}
                  onClick={() => onToggleSelect(item.id)}
                >
                  <div className="flex-shrink-0">
                    {selectedItems.has(item.id) ? (
                      <div className="w-5 h-5 bg-purple-500 rounded flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-500 rounded" />
                    )}
                  </h3>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-white">{item.title}</div>
                    {item.platform && (
                      <div className="text-xs text-gray-400 mt-1">{item.platform}</div>
                    )}
                  </div>
                  {item.duration && (
                    <div className="text-xs text-gray-400">{item.duration}s</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      ))}
    </div>
  )
}
