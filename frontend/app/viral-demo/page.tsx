'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import ViralScoreGauge, { ViralScoreData } from '@/components/ViralScoreGauge'
import apiClient from '@/services/api'

// Sample content examples for testing
const sampleContents = [
  {
    title: 'Tech Tutorial',
    transcript: 'In this video, I will show you how to build a React application from scratch. We will cover components, hooks, and state management.'
  },
  {
    title: 'Viral Challenge',
    transcript: 'OMG you won\'t believe what happened! This is the craziest thing ever! Watch till the end for a surprise!'
  },
  {
    title: 'Educational Content',
    transcript: 'Today we are exploring the fascinating world of quantum physics. Let\'s dive deep into the principles that govern our universe.'
  }
]

export default function ViralDemoPage() {
  const [viralData, setViralData] = useState<ViralScoreData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [customTranscript, setCustomTranscript] = useState('')
  const [selectedSample, setSelectedSample] = useState<number | null>(null)

  const analyzeContent = async (transcript: string) => {
    if (!transcript.trim()) {
      setError('Please enter some content to analyze')
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const response = await apiClient.viral.predict({ transcript })
      setViralData(response.prediction)
    } catch (err: any) {
      setError(err.message || 'Failed to analyze content')
      console.error('Viral prediction error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSampleClick = (index: number) => {
    setSelectedSample(index)
    setCustomTranscript(sampleContents[index].transcript)
    analyzeContent(sampleContents[index].transcript)
  }

  const handleCustomAnalyze = () => {
    setSelectedSample(null)
    analyzeContent(customTranscript)
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
            🚀 Viral Score Analyzer
          </h1>
          <p className="text-xl text-gray-300">
            Predict your content's viral potential with AI
          </p>
        </motion.div>

        {/* Sample Content Buttons */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">
            Try Sample Content
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sampleContents.map((sample, index) => (
              <motion.button
                key={index}
                onClick={() => handleSampleClick(index)}
                className={`p-6 rounded-xl border-2 transition-all ${
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
                  {sample.transcript}
                </p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Custom Input */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">
            Or Analyze Your Own Content
          </h2>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
            <textarea
              value={customTranscript}
              onChange={(e) => setCustomTranscript(e.target.value)}
              placeholder="Paste your video transcript, script, or content here..."
              className="w-full h-32 bg-gray-900/50 text-white rounded-lg p-4 border border-gray-700 focus:border-purple-500 focus:outline-none resize-none"
            />
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-gray-400">
                {customTranscript.length} characters
              </span>
              <motion.button
                onClick={handleCustomAnalyze}
                disabled={loading || !customTranscript.trim()}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {loading ? 'Analyzing...' : 'Analyze Content'}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            className="mb-8 p-4 bg-red-900/20 border border-red-800/30 rounded-lg"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <p className="text-red-400">⚠️ {error}</p>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="bg-gray-800/50 rounded-xl p-6 animate-pulse">
              <div className="h-64 bg-gray-700 rounded mb-4"></div>
              <div className="h-32 bg-gray-700 rounded"></div>
            </div>
          </motion.div>
        )}

        {/* Viral Score Gauge */}
        {!loading && viralData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ViralScoreGauge 
              data={viralData}
              animated={true}
              showFactors={true}
              showRecommendations={true}
            />
          </motion.div>
        )}

        {/* Info Section */}
        {!viralData && !loading && (
          <motion.div
            className="mt-12 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-4xl mb-3">📝</div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  1. Input Content
                </h3>
                <p className="text-gray-400 text-sm">
                  Paste your video transcript, script, or any content you want to analyze
                </p>
              </div>
              <div>
                <div className="text-4xl mb-3">🤖</div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  2. AI Analysis
                </h3>
                <p className="text-gray-400 text-sm">
                  Our AI analyzes hook strength, emotional appeal, shareability, and trend alignment
                </p>
              </div>
              <div>
                <div className="text-4xl mb-3">📊</div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  3. Get Insights
                </h3>
                <p className="text-gray-400 text-sm">
                  Receive a viral score, factor breakdown, and actionable recommendations
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
