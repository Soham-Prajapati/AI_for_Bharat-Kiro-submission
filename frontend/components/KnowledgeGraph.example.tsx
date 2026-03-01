'use client'

import { useState } from 'react'
import KnowledgeGraph from './KnowledgeGraph'
import type { GraphNode } from './KnowledgeGraph'

/**
 * Example usage of KnowledgeGraph component
 * Demonstrates various features and integration patterns
 */

export default function KnowledgeGraphExample() {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [topic, setTopic] = useState('AI Content')
  const [depth, setDepth] = useState(2)

  const handleNodeClick = (node: GraphNode) => {
    console.log('Node clicked:', node)
    setSelectedNode(node)
    
    // Example: Navigate based on node type
    switch (node.type) {
      case 'content':
        console.log('Navigate to content:', node.id)
        // router.push(`/content/${node.id}`)
        break
      case 'topic':
        console.log('Explore topic:', node.label)
        // fetchRelatedContent(node.id)
        break
      case 'creator':
        console.log('View creator profile:', node.id)
        // router.push(`/creator/${node.id}`)
        break
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Knowledge Graph Explorer
          </h1>
          <p className="text-gray-400">
            Discover relationships between content, topics, and creators
          </p>
        </div>

        {/* Controls */}
        <div className="mb-6 bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Starting Topic
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                placeholder="Enter topic..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Exploration Depth
              </label>
              <select
                value={depth}
                onChange={(e) => setDepth(Number(e.target.value))}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                <option value={1}>1 level</option>
                <option value={2}>2 levels</option>
                <option value={3}>3 levels</option>
                <option value={4}>4 levels</option>
              </select>
            </div>
          </div>
        </div>

        {/* Graph */}
        <KnowledgeGraph
          initialTopic={topic}
          depth={depth}
          width={1200}
          height={700}
          onNodeClick={handleNodeClick}
          className="mb-6"
        />

        {/* Selected Node Details */}
        {selectedNode && (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-4">
              Selected Node Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">Label</p>
                <p className="text-lg font-semibold text-white">{selectedNode.label}</p>
              </p>
              <div>
                <p className="text-sm text-gray-400 mb-1">Type</p>
                <p className="text-lg font-semibold text-white capitalize">{selectedNode.type}</p>
              </p>
              <div>
                <p className="text-sm text-gray-400 mb-1">ID</p>
                <p className="text-lg font-mono text-white">{selectedNode.id}</p>
              </p>
              <div>
                <p className="text-sm text-gray-400 mb-1">Weight</p>
                <p className="text-lg font-semibold text-white">{selectedNode.weight}</p>
              </p>
            </div>
            
            {selectedNode.metadata && (
              <div className="mt-4">
                <p className="text-sm text-gray-400 mb-2">Metadata</p>
                <pre className="bg-gray-900 p-4 rounded-lg text-xs text-gray-300 overflow-auto">
                  {JSON.stringify(selectedNode.metadata, null, 2)}
                </pre>
              </p>
            )}
          </div>
        )}

        {/* Usage Examples */}
        <div className="mt-8 bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4">
            Usage Examples
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-purple-400 mb-2">
                1. Basic Usage
              </h3>
              <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-300 overflow-auto">
{`import KnowledgeGraph from '@/components/KnowledgeGraph'

export default function Page() {
  return <KnowledgeGraph />
}`}
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-purple-400 mb-2">
                2. With Custom Props
              </h3>
              <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-300 overflow-auto">
{`<KnowledgeGraph
  initialTopic="Video Editing"
  depth={3}
  width={1200}
  height={800}
  onNodeClick={(node) => {
    console.log('Clicked:', node)
  }}
/>`}
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-purple-400 mb-2">
                3. With Navigation
              </h3>
              <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-300 overflow-auto">
{`const handleNodeClick = (node) => {
  if (node.type === 'content') {
    router.push(\`/content/\${node.id}\`)
  } else if (node.type === 'creator') {
    router.push(\`/creator/\${node.id}\`)
  }
}

<KnowledgeGraph onNodeClick={handleNodeClick} />`}
              </pre>
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: '🎯', title: 'Interactive', desc: 'Click, drag, zoom, and explore' },
            { icon: '🔍', title: 'Search', desc: 'Find nodes instantly' },
            { icon: '🎨', title: 'Beautiful', desc: 'Dark theme with smooth animations' },
            { icon: '⚡', title: 'Fast', desc: 'Handles 1000+ nodes efficiently' },
            { icon: '🎮', title: 'Controls', desc: 'Zoom, pan, and reset view' },
            { icon: '📊', title: 'Types', desc: 'Content, topics, and creators' },
          ].map((feature, i) => (
            <div
              key={i}
              className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-purple-500 transition-colors"
            >
              <div className="text-3xl mb-2">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-1">{feature.title}</h3>
              <p className="text-sm text-gray-400">{feature.desc}</p>
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}
