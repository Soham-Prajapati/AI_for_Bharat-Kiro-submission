'use client'

/**
 * ContentMultiplierV2 Example Usage
 * 
 * This file demonstrates various ways to use the ContentMultiplierV2 component
 * in different scenarios and configurations.
 */

import { useState } from 'react'
import ContentMultiplierV2 from './ContentMultiplierV2'
import { ContentItem } from './ContentMultiplierV2'

// ============================================================================
// EXAMPLE 1: Basic Usage
// ============================================================================

export function BasicExample() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-6">
        Basic Content Multiplier
      </h1>
      
      <ContentMultiplierV2
        videoId="video-123"
        transcript="This is a sample video transcript about content creation..."
      />
    </div>
  )
}

// ============================================================================
// EXAMPLE 2: With Export Handler
// ============================================================================

export function ExportExample() {
  const [exportedItems, setExportedItems] = useState<ContentItem[]>([])

  const handleExport = (items: ContentItem[]) => {
    console.log('Exporting items:', items)
    setExportedItems(items)
    
    // Custom export logic
    alert(`Exported ${items.length} items!`)
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-6">
        Content Multiplier with Export
      </h1>
      
      <ContentMultiplierV2
        videoId="video-456"
        transcript="Sample transcript for export demo..."
        onExport={handleExport}
      />

      {exportedItems.length > 0 && (
        <div className="mt-6 p-4 bg-green-900/30 border border-green-700 rounded-lg">
          <h3 className="text-lg font-semibold text-green-400 mb-2">
            Last Export
          </h3>
          <p className="text-gray-300">
            Exported {exportedItems.length} items at {new Date().toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// EXAMPLE 3: Dashboard Integration
// ============================================================================

export function DashboardExample() {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'content'>('overview')

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-white mb-2">
          Content Dashboard
        </h1>
        <p className="text-gray-400">
          Manage all your repurposed content in one place
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setSelectedTab('overview')}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            selectedTab === 'overview'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setSelectedTab('content')}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            selectedTab === 'content'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Content Library
        </button>
      </div>

      {/* Content */}
      {selectedTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">
              Total Content
            </h3>
            <p className="text-4xl font-bold text-purple-400">120</p>
          </p>
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">
              Published
            </h3>
            <p className="text-4xl font-bold text-green-400">85</p>
          </p>
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">
              Scheduled
            </h3>
            <p className="text-4xl font-bold text-blue-400">35</p>
          </p>
        </div>
      )}

      {selectedTab === 'content' && (
        <ContentMultiplierV2
          videoId="dashboard-video"
          transcript="Dashboard content transcript..."
        />
      )}
    </div>
  )
}

// ============================================================================
// EXAMPLE 4: Modal Integration
// ============================================================================

export function ModalExample() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-6">
        Modal Content Manager
      </h1>

      <button
        onClick={() => setIsOpen(true)}
        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg"
      >
        Open Content Manager
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-7xl max-h-[90vh] bg-gray-900 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white">
                Content Manager
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <ContentMultiplierV2
                videoId="modal-video"
                transcript="Modal content transcript..."
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// EXAMPLE 5: Multi-Video Management
// ============================================================================

export function MultiVideoExample() {
  const [videos] = useState([
    { id: 'video-1', title: 'Tutorial Video', transcript: 'Tutorial transcript...' },
    { id: 'video-2', title: 'Product Review', transcript: 'Review transcript...' },
    { id: 'video-3', title: 'Vlog Episode', transcript: 'Vlog transcript...' }
  ])
  const [selectedVideo, setSelectedVideo] = useState(videos[0])

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-6">
        Multi-Video Content Manager
      </h1>

      {/* Video Selector */}
      <div className="mb-6 flex gap-4">
        {videos.map(video => (
          <button
            key={video.id}
            onClick={() => setSelectedVideo(video)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              selectedVideo.id === video.id
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {video.title}
          </button>
        ))}
      </div>

      {/* Content Multiplier */}
      <ContentMultiplierV2
        key={selectedVideo.id}
        videoId={selectedVideo.id}
        transcript={selectedVideo.transcript}
      />
    </div>
  )
}

// ============================================================================
// EXAMPLE 6: With Real-time Stats
// ============================================================================

export function StatsExample() {
  const [stats, setStats] = useState({
    totalItems: 0,
    selectedItems: 0,
    exportedItems: 0
  })

  const handleExport = (items: ContentItem[]) => {
    setStats(prev => ({
      ...prev,
      exportedItems: prev.exportedItems + items.length
    }))
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-6">
        Content Multiplier with Stats
      </h1>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">
            {stats.totalItems}
          </div>
          <div className="text-sm text-gray-400">Total Items</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">
            {stats.selectedItems}
          </div>
          <div className="text-sm text-gray-400">Selected</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">
            {stats.exportedItems}
          </div>
          <div className="text-sm text-gray-400">Exported</div>
        </div>
      </div>

      {/* Content Multiplier */}
      <ContentMultiplierV2
        videoId="stats-video"
        transcript="Stats demo transcript..."
        onExport={handleExport}
      />
    </div>
  )
}

// ============================================================================
// EXAMPLE 7: Compact View
// ============================================================================

export function CompactExample() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-4">
        Compact Content View
      </h1>

      <div className="bg-gray-800 rounded-xl p-4">
        <ContentMultiplierV2
          videoId="compact-video"
          transcript="Compact view transcript..."
        />
      </div>
    </div>
  )
}

// ============================================================================
// EXAMPLE 8: Full Page Layout
// ============================================================================

export function FullPageExample() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">
            Content Intelligence Platform
          </h1>
          <div className="flex gap-4">
            <button className="text-gray-400 hover:text-white">
              Dashboard
            </button>
            <button className="text-gray-400 hover:text-white">
              Analytics
            </button>
            <button className="text-gray-400 hover:text-white">
              Settings
            </button>
          </div>
        </nav>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        <ContentMultiplierV2
          videoId="fullpage-video"
          transcript="Full page layout transcript..."
        />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 p-4 mt-12">
        <div className="container mx-auto text-center text-gray-400 text-sm">
          © 2026 Content Intelligence Platform
        </footer>
      </footer>
    </div>
  )
}

// ============================================================================
// EXAMPLE 9: Custom Export Formats
// ============================================================================

export function CustomExportExample() {
  const handleCustomExport = (items: ContentItem[]) => {
    // Group by platform
    const byPlatform = items.reduce((acc, item) => {
      const platform = item.platform || 'other'
      if (!acc[platform]) acc[platform] = []
      acc[platform].push(item)
      return acc
    }, {} as Record<string, ContentItem[]>)

    // Create custom export
    const exportData = {
      exportDate: new Date().toISOString(),
      totalItems: items.length,
      platforms: Object.keys(byPlatform),
      content: byPlatform
    }

    // Download as JSON
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `custom-export-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)

    alert('Custom export completed!')
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-6">
        Custom Export Format
      </h1>

      <ContentMultiplierV2
        videoId="custom-export-video"
        transcript="Custom export demo transcript..."
        onExport={handleCustomExport}
      />
    </div>
  )
}

// ============================================================================
// EXAMPLE 10: Demo Showcase
// ============================================================================

export default function ContentMultiplierV2Examples() {
  const [activeExample, setActiveExample] = useState<string>('basic')

  const examples = [
    { id: 'basic', label: 'Basic Usage', component: BasicExample },
    { id: 'export', label: 'With Export', component: ExportExample },
    { id: 'dashboard', label: 'Dashboard', component: DashboardExample },
    { id: 'modal', label: 'Modal', component: ModalExample },
    { id: 'multi', label: 'Multi-Video', component: MultiVideoExample },
    { id: 'stats', label: 'With Stats', component: StatsExample },
    { id: 'compact', label: 'Compact', component: CompactExample },
    { id: 'fullpage', label: 'Full Page', component: FullPageExample },
    { id: 'custom', label: 'Custom Export', component: CustomExportExample }
  ]

  const ActiveComponent = examples.find(e => e.id === activeExample)?.component || BasicExample

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-pink-900 p-8">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold text-white mb-2">
            ContentMultiplierV2 Examples
          </h1>
          <p className="text-gray-300">
            Explore different ways to use the Content Multiplier component
          </p>
        </div>
      </div>

      {/* Example Selector */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="container mx-auto">
          <div className="flex gap-2 flex-wrap">
            {examples.map(example => (
              <button
                key={example.id}
                onClick={() => setActiveExample(example.id)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  activeExample === example.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {example.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Example */}
      <div className="container mx-auto">
        <ActiveComponent />
      </div>
    </div>
  )
}
