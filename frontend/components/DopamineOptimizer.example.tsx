'use client'

import { useState } from 'react'
import DopamineOptimizer, { DopamineOptimizationResult } from './DopamineOptimizer'

// Example 1: Basic usage with default mock data
export function BasicExample() {
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <DopamineOptimizer />
    </div>
  )
}

// Example 2: Custom data with API integration
export function APIIntegrationExample() {
  const [data, setData] = useState<DopamineOptimizationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')

  const analyzeContent = async () => {
    setLoading(true)
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
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4">Content Analysis</h2>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your content here for analysis..."
            className="w-full h-40 bg-gray-900 text-white rounded-lg p-4 border border-gray-700"
          />
          <button
            onClick={analyzeContent}
            disabled={loading || !content}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold"
          >
            {loading ? 'Analyzing...' : 'Analyze Content'}
          </button>
        </h2>
        {data && <DopamineOptimizer data={data} />}
      </div>
    </div>
  )
}

export default BasicExample
