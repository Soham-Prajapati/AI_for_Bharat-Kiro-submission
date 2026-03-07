'use client'

import { useState } from 'react'
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
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 text-[10px] font-mono font-semibold text-cyan-400 uppercase tracking-widest mb-4">
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></span>
            AI-Powered
          </span>
          <h1 className="text-5xl font-black font-display text-white mb-4">
            Viral Score Analyzer
          </h1>
          <p className="text-lg text-white/40">
            Predict your content's viral potential with AI
          </p>
        </div>

        {/* Sample Content Buttons */}
        <div
          className="mb-8"
        >
          <h2 className="text-xl font-bold font-display text-white mb-4">
            Try Sample Content
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sampleContents.map((sample, index) => (
              <div
                key={index}
                onClick={() => handleSampleClick(index)}
                className={`p-6 rounded-2xl border cursor-pointer transition-all ${
                  selectedSample === index
                    ? 'bg-brand-600/20 border-brand-500/50 shadow-lg shadow-brand-900/20'
                    : 'bg-white/[0.03] border-white/[0.07] hover:border-brand-500/30 hover:bg-white/[0.05]'
                }`}
              >
                <h3 className="text-base font-bold text-white mb-2">
                  {sample.title}
                </h3>
                <p className="text-xs text-white/40 line-clamp-3">
                  {sample.transcript}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Input */}
        <div
          className="mb-8"
        >
          <h2 className="text-xl font-bold font-display text-white mb-4">
            Or Analyze Your Own Content
          </h2>
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
            <textarea
              value={customTranscript}
              onChange={(e) => setCustomTranscript(e.target.value)}
              placeholder="Paste your video transcript, script, or content here..."
              className="w-full h-32 bg-[#0A0E1A] text-white rounded-xl p-4 border border-white/[0.07] focus:border-brand-500/50 focus:outline-none resize-none text-sm placeholder:text-white/20"
            />
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs font-mono text-white/30">
                {customTranscript.length} characters
              </span>
              <button
                onClick={handleCustomAnalyze}
                disabled={loading || !customTranscript.trim()}
                className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Analyzing...' : 'Analyze Content'}
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
            <p className="text-red-400">⚠️ {error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="mb-8">
            <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 animate-pulse">
              <div className="h-64 bg-white/[0.05] rounded-xl mb-4"></div>
              <div className="h-32 bg-white/[0.05] rounded-xl"></div>
            </div>
          </div>
        )}

        {/* Viral Score Gauge */}
        {!loading && viralData && (
          <div
          >
            <ViralScoreGauge 
              data={viralData}
              animated={true}
              showFactors={true}
              showRecommendations={true}
            />
          </div>
        )}

        {/* Info Section */}
        {!viralData && !loading && (
          <div
            className="mt-12 bg-white/[0.03] border border-white/[0.07] rounded-2xl p-8"
          >
            <h2 className="text-2xl font-black font-display text-white mb-6">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-5">
                <div className="text-4xl mb-3">📝</div>
                <h3 className="text-base font-bold text-white mb-2">
                  1. Input Content
                </h3>
                <p className="text-white/40 text-sm">
                  Paste your video transcript, script, or any content you want to analyze
                </p>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-5">
                <div className="text-4xl mb-3">🤖</div>
                <h3 className="text-base font-bold text-white mb-2">
                  2. AI Analysis
                </h3>
                <p className="text-white/40 text-sm">
                  Our AI analyzes hook strength, emotional appeal, shareability, and trend alignment
                </p>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-5">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="text-base font-bold text-white mb-2">
                  3. Get Insights
                </h3>
                <p className="text-white/40 text-sm">
                  Receive a viral score, factor breakdown, and actionable recommendations
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
