'use client'

import ContentMultiplier from './ContentMultiplier'
import { useState } from 'react'

/**
 * ContentMultiplier Example Usage
 * 
 * This example demonstrates how to use the ContentMultiplier component
 * with mock data and various configurations.
 */

export default function ContentMultiplierExample() {
  const [exportedItems, setExportedItems] = useState<any[]>([])

  // Mock transcript for testing
  const mockTranscript = `
    Welcome to this amazing tutorial on content creation!
    Today we're going to explore how to create engaging content
    that resonates with your audience across multiple platforms.
    
    First, let's talk about the importance of understanding your audience.
    Knowing who you're creating for is crucial to success.
    
    Next, we'll dive into platform-specific strategies.
    Each platform has its own unique characteristics and best practices.
    
    Finally, we'll discuss how to repurpose your content efficiently.
    One piece of content can be transformed into dozens of variations!
  `

  const handleExport = (items: any[]) => {
    console.log('Exported items:', items)
    setExportedItems(items)
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">
          ContentMultiplier Component Demo
        </h1>

        {/* Component Demo */}
        <ContentMultiplier
          videoId="demo-video-123"
          transcript={mockTranscript}
          onExport={handleExport}
        />

        {/* Export Results */}
        {exportedItems.length > 0 && (
          <div className="mt-8 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
            <h2 className="text-2xl font-bold text-white mb-4">
              Exported Items ({exportedItems.length})
            </h2>
            <pre className="text-sm text-gray-300 overflow-auto max-h-96 bg-gray-900 p-4 rounded">
              {JSON.stringify(exportedItems, null, 2)}
            </pre>
          </div>
        )}

        {/* Usage Instructions */}
        <div className="mt-8 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Usage Instructions</h2>
          <div className="space-y-4 text-gray-300">
            <div>
              <h3 className="text-lg font-semibold text-purple-400 mb-2">Basic Usage</h3>
              <pre className="bg-gray-900 p-4 rounded text-sm overflow-auto">
{`import ContentMultiplier from '@/components/ContentMultiplier'

<ContentMultiplier
  videoId="your-video-id"
  transcript="Your video transcript..."
  onExport={(items) => console.log(items)}
/>`}
              </pre>
            </h2>

            <div>
              <h3 className="text-lg font-semibold text-purple-400 mb-2">Features</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Generate 50+ content pieces from a single video</li>
                <li>Toggle between Grid and Tree view modes</li>
                <li>Search across all content</li>
                <li>Filter by content type (clips, quotes, audiograms)</li>
                <li>Select individual items or bulk select</li>
                <li>Export selected items or all items</li>
                <li>Smooth animations with Framer Motion</li>
                <li>Dark theme optimized</li>
                <li>Responsive design</li>
              </ul>
            </ul>

            <div>
              <h3 className="text-lg font-semibold text-purple-400 mb-2">Props</h3>
              <ul className="list-disc list-inside space-y-2">
                <li><code className="text-pink-400">videoId</code> (optional): Video identifier</li>
                <li><code className="text-pink-400">transcript</code> (optional): Video transcript text</li>
                <li><code className="text-pink-400">onExport</code> (optional): Callback when items are exported</li>
              </ul>
            </ul>

            <div>
              <h3 className="text-lg font-semibold text-purple-400 mb-2">API Integration</h3>
              <p className="mb-2">
                The component uses <code className="text-pink-400">apiClient.multiply.generate()</code> to generate content:
              </p>
              <pre className="bg-gray-900 p-4 rounded text-sm overflow-auto">
{`const response = await apiClient.multiply.generate({
  videoId: 'video-123',
  transcript: 'Your transcript...',
  platforms: ['youtube', 'instagram', 'tiktok', 'linkedin', 'twitter', 'facebook']
})`}
              </pre>
            </h3>
          </div>
        </div>
      </div>
    </div>
  )
}
