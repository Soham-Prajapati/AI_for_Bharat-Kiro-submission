'use client'

import { useState, useEffect } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export interface ViralFactor {
  name: string
  impact: number
  description: string
}

export interface ViralScoreData {
  score: number
  factors: ViralFactor[]
  recommendations: string[]
}

interface ViralScoreGaugeProps {
  data?: ViralScoreData
  animated?: boolean
  showFactors?: boolean
  showRecommendations?: boolean
}

// ============================================================================
// MOCK DATA FOR TESTING
// ============================================================================

const mockViralData: ViralScoreData = {
  score: 78,
  factors: [
    {
      name: 'Hook Strength',
      impact: 85,
      description: 'Strong opening that captures attention immediately'
    },
    {
      name: 'Emotional Appeal',
      impact: 72,
      description: 'Good emotional connection with audience'
    },
    {
      name: 'Shareability',
      impact: 80,
      description: 'High potential for social sharing'
    },
    {
      name: 'Trend Alignment',
      impact: 65,
      description: 'Moderate alignment with current trends'
    }
  ],
  recommendations: [
    'Add a stronger call-to-action in the first 3 seconds',
    'Include trending audio or music',
    'Optimize for mobile viewing with larger text'
  ]
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getScoreColor(score: number): string {
  if (score >= 80) return '#10b981' // green
  if (score >= 60) return '#f59e0b' // amber
  if (score >= 40) return '#f97316' // orange
  return '#ef4444' // red
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Fair'
  return 'Needs Work'
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function ViralScoreGauge({
  data = mockViralData,
  animated = true,
  showFactors = true,
  showRecommendations = true
}: ViralScoreGaugeProps) {
  const [displayScore, setDisplayScore] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  const scoreColor = getScoreColor(data.score)
  const scoreLabel = getScoreLabel(data.score)

  // Animate score counter
  useEffect(() => {
    if (!animated) {
      setDisplayScore(data.score)
      setIsVisible(true)
      return
    }

    setIsVisible(true)
    const duration = 2000
    const steps = 60
    const increment = data.score / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= data.score) {
        setDisplayScore(data.score)
        clearInterval(timer)
      } else {
        setDisplayScore(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [data.score, animated])

  // Calculate gauge rotation (180 degrees = 0-100 scale)
  const rotation = (displayScore / 100) * 180 - 90

  return (
    <div
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6"
    >
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Viral Potential Score
        </h2>
        <p className="text-gray-400 text-sm">
          AI-powered prediction of content virality
        </p>
      </div>

      {/* Gauge Visualization */}
      <div className="relative flex items-center justify-center mb-8">
        <div className="relative w-64 h-32">
          {/* Background Arc */}
          <svg
            className="w-full h-full"
            viewBox="0 0 200 100"
            style={{ overflow: 'visible' }}
          >
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="33%" stopColor="#f97316" />
                <stop offset="66%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
            
            {/* Background track */}
            <path
              d="M 20 90 A 80 80 0 0 1 180 90"
              fill="none"
              stroke="#374151"
              strokeWidth="12"
              strokeLinecap="round"
            />
            
            {/* Colored progress arc */}
            <path
              d="M 20 90 A 80 80 0 0 1 180 90"
              fill="none"
              stroke="url(#gaugeGradient)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray="251.2"
              strokeDashoffset={251.2 - (displayScore / 100) * 251.2}
            />

            {/* Needle */}
            <div g
              style={{ transformOrigin: '100px 90px' }}
            >
              <line
                x1="100"
                y1="90"
                x2="100"
                y2="30"
                stroke={scoreColor}
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="100" cy="90" r="6" fill={scoreColor} />
            </div>
          </svg>

          {/* Score Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
            <div
              className="text-5xl font-bold"
              style={{ color: scoreColor }}
            >
              {displayScore}
            </div>
            <div className="text-sm text-gray-400 mt-1">{scoreLabel}</div>
          </div>
        </div>
      </div>

      {/* Score Range Labels */}
      <div className="flex justify-between text-xs text-gray-500 mb-8 px-4">
        <span>0</span>
        <span>25</span>
        <span>50</span>
        <span>75</span>
        <span>100</span>
      </div>

      {/* Viral Factors */}
      {showFactors && data.factors.length > 0 && (
        <div
          className="mb-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Key Factors</h3>
          <div className="space-y-3">
            {data.factors.map((factor, index) => (
              <div
                key={factor.name}
                className="bg-gray-800/30 rounded-lg p-4 border border-gray-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-white">
                    {factor.name}
                  </span>
                  <span
                    className="text-lg font-bold"
                    style={{ color: getScoreColor(factor.impact) }}
                  >
                    {factor.impact}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-2">{factor.description}</p>
                
                {/* Progress bar */}
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ backgroundColor: getScoreColor(factor.impact) }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {showRecommendations && data.recommendations.length > 0 && (
        <div
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            💡 Recommendations
          </h3>
          <div className="space-y-2">
            {data.recommendations.map((recommendation, index) => (
              <div
                key={index}
                className="flex items-start gap-3 bg-blue-900/20 border border-blue-800/30 rounded-lg p-3"
              >
                <span className="text-blue-400 mt-0.5">→</span>
                <span className="text-sm text-gray-300">{recommendation}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
