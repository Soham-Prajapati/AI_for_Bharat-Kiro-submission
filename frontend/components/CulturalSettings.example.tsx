'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import CulturalSettings from './CulturalSettings'
import { CulturalAdaptation } from '@/types/api'

/**
 * Example usage of CulturalSettings component
 * Demonstrates various integration patterns
 */

// Sample content for testing
const SAMPLE_CONTENTS = [
  {
    title: 'E-commerce Sale',
    content: 'Join our Black Friday sale! Get 50% off everything. Prices start at just $29.99. Free shipping on orders over $100!'
  },
  {
    title: 'Holiday Greeting',
    content: 'Happy Thanksgiving! We hope you enjoy this special day with your family. Our stores will be closed on Thursday.'
  },
  {
    title: 'Sports Event',
    content: 'Watch the Super Bowl live! Get your tickets now for just $250. The game starts at 6:30 PM EST.'
  },
  {
    title: 'Product Description',
    content: 'This premium product weighs only 2 pounds and measures 12 inches. Available for $149 with free shipping.'
  }
]

export default function CulturalSettingsExample() {
  const [selectedSample, setSelectedSample] = useState<number | null>(null)
  const [customContent, setCustomContent] = useState('')
  const [adaptationHistory, setAdaptationHistory] = useState<CulturalAdaptation[]>([])
  const [showHistory, setShowHistory] = useState(false)

  const handleAdaptationComplete = (adaptation: CulturalAdaptation) => {
    console.log('✅ Adaptation complete:', adaptation)
    
    // Add to history
    setAdaptationHistory(prev => [adaptation, ...prev].slice(0, 10))
    
    // You could also:
    // - Save to database
    // - Update parent component state
    // - Trigger analytics event
    // - Show success notification
  }

  const handleSampleClick = (index: number) => {
    setSelectedSample(index)
    setCustomContent(SAMPLE_CONTENTS[index].content)
  }

  const clearHistory = () => {
    setAdaptationHistory([])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            🌍 Cultural Adaptation Demo
          </h1>
          <p className="text-xl text-gray-300">
            Adapt your content for different regional audiences
          </p>
        </motion.div>

        {/* Sample Content Selector */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">
            Try Sample Content
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {SAMPLE_CONTENTS.map((sample, index) => (
              <motion.button
                key={index}
                onClick={() => handleSampleClick(index)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  selectedSample === index
                    ? 'bg-purple-600 border-purple-400'
                    : 'bg-gray-800/50 border-gray-700 hover:border-purple-500'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <h3 className="text-lg font-semibold text-white mb-2">
                  {sample.title}
                </h3>
                <p className="text-sm text-gray-300 line-clamp-3">
                  {sample.content}
                </p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Main Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <CulturalSettings
            initialContent={customContent}
            onAdaptationComplete={handleAdaptationComplete}
            showPreview={true}
            animated={true}
          />
        </motion.div>

        {/* Adaptation History */}
        {adaptationHistory.length > 0 && (
          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">
                  📜 Adaptation History ({adaptationHistory.length})
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    {showHistory ? 'Hide' : 'Show'}
                  </button>
                  <button
                    onClick={clearHistory}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {showHistory && (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {adaptationHistory.map((adaptation, index) => (
                    <motion.div
                      key={index}
                      className="p-4 bg-gray-900/50 rounded-lg border border-gray-700"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-purple-400">
                          {adaptation.targetRegion.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">
                          {adaptation.changes.length} changes
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 line-clamp-2">
                        {adaptation.adaptedContent}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Info Cards */}
        <motion.div
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Smart Adaptation
            </h3>
            <p className="text-gray-400 text-sm">
              Automatically adapts festivals, currencies, measurements, and cultural references
            </p>
          </div>

          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Fast & Cached
            </h3>
            <p className="text-gray-400 text-sm">
              Results are cached for instant retrieval. No repeated API calls for the same content
            </p>
          </div>

          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
            <div className="text-4xl mb-3">🌐</div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Multi-Region Support
            </h3>
            <p className="text-gray-400 text-sm">
              Supports India, UK, US, Canada, Australia, and more regions coming soon
            </p>
          </div>
        </motion.div>

        {/* Usage Example Code */}
        <motion.div
          className="mt-12 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <h3 className="text-xl font-semibold text-white mb-4">
            💻 Usage Example
          </h3>
          <pre className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <code className="text-sm text-gray-300">
{`import CulturalSettings from '@/components/CulturalSettings'
import { CulturalAdaptation } from '@/types/api'

export default function MyPage() {
  const handleComplete = (adaptation: CulturalAdaptation) => {
    console.log('Adapted:', adaptation.adaptedContent)
    console.log('Changes:', adaptation.changes)
  }

  return (
    <CulturalSettings
      initialContent="Your content here"
      onAdaptationComplete={handleComplete}
      showPreview={true}
      animated={true}
    />
  )
}`}
            </code>
          </pre>
        </motion.div>

        {/* API Usage Example */}
        <motion.div
          className="mt-6 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.1 }}
        >
          <h3 className="text-xl font-semibold text-white mb-4">
            🔌 Direct API Usage
          </h3>
          <pre className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <code className="text-sm text-gray-300">
{`import apiClient from '@/services/api'

// Adapt content
const response = await apiClient.cultural.adapt({
  content: 'Join our Thanksgiving sale for $99!',
  targetRegion: 'india'
})

console.log(response.adaptation.adaptedContent)
// Output: "Join our Diwali sale for ₹99!"

// Get available regions
const regions = await apiClient.cultural.getRegions()
console.log(regions.regions)
// Output: ['india', 'uk', 'us', 'canada', 'australia']`}
            </code>
          </pre>
        </motion.div>
      </div>
    </div>
  )
}
