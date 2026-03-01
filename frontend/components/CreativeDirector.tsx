'use client'

import React, { useState, useEffect } from 'react'
import apiClient from '@/services/api'
import { useAppContext } from '@/context/AppContext'
import {
  AnalyzeContentRequest,
  AnalyzeContentResponse,
  ContentScore,
  ContentFeedback,
  ApiError,
} from '@/types/api'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CreativeDirectorProps {
  contentId?: string
  initialContent?: string
  onAnalysisComplete?: (result: AnalyzeContentResponse) => void
  autoAnalyze?: boolean
  showHeader?: boolean
  className?: string
}

interface AnalysisState {
  isLoading: boolean
  result: AnalyzeContentResponse | null
  error: string | null
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-500'
  if (score >= 60) return 'text-blue-500'
  if (score >= 40) return 'text-yellow-500'
  return 'text-red-500'
}

function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-green-500'
  if (score >= 60) return 'bg-blue-500'
  if (score >= 40) return 'bg-yellow-500'
  return 'bg-red-500'
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Fair'
  return 'Needs Improvement'
}

function getRatingColor(rating: ContentFeedback['rating']): string {
  switch (rating) {
    case 'excellent':
      return 'text-green-500'
    case 'good':
      return 'text-blue-500'
    case 'fair':
      return 'text-yellow-500'
    case 'poor':
      return 'text-red-500'
    default:
      return 'text-gray-500'
  }
}

function getRatingIcon(rating: ContentFeedback['rating']): string {
  switch (rating) {
    case 'excellent':
      return '🌟'
    case 'good':
      return '👍'
    case 'fair':
      return '👌'
    case 'poor':
      return '⚠️'
    default:
      return '❓'
  }
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * ScoreCard Component
 * Displays individual score metrics with visual indicators
 */
interface ScoreCardProps {
  label: string
  score: number
  icon?: string
  animated?: boolean
  delay?: number
}

function ScoreCard({ label, score, icon, animated = true, delay = 0 }: ScoreCardProps) {
  const [displayScore, setDisplayScore] = useState(0)

  useEffect(() => {
    if (!animated) {
      setDisplayScore(score)
      return
    }

    const duration = 1500
    const steps = 60
    const increment = score / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= score) {
        setDisplayScore(score)
        clearInterval(timer)
      } else {
        setDisplayScore(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [score, animated])

  return (
    <div
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon && <span className="text-2xl">{icon}</span>}
          <h3 className="text-sm font-medium text-gray-400">{label}</h3>
        </div>
      </div>

      <div className="flex items-end gap-3">
        <div className={`text-4xl font-bold ${getScoreColor(displayScore)}`}>
          {displayScore}
        </div>
        <div className="text-sm text-gray-500 mb-1">/ 100</div>
      </div>

      <div className="mt-4 h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${getScoreBgColor(score)} rounded-full`}
        />
      </div>

      <div className="mt-2 text-xs text-gray-500 text-right">
        {getScoreLabel(displayScore)}
      </div>
    </div>
  )
}

/**
 * FeedbackItem Component
 * Displays individual feedback with rating and comments
 */
interface FeedbackItemProps {
  feedback: ContentFeedback
  index: number
}

function FeedbackItem({ feedback, index }: FeedbackItemProps) {
  return (
    <div
      className="bg-gray-800/30 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-all"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{getRatingIcon(feedback.rating)}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="text-sm font-semibold text-white">{feedback.aspect}</h4>
            <span
              className={`text-xs font-medium capitalize ${getRatingColor(
                feedback.rating
              )}`}
            >
              {feedback.rating}
            </span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">{feedback.comment}</p>
        </div>
      </div>
    </div>
  )
}

/**
 * ImprovementList Component
 * Displays actionable improvement suggestions
 */
interface ImprovementListProps {
  improvements: string[]
}

function ImprovementList({ improvements }: ImprovementListProps) {
  if (!improvements || improvements.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No improvements needed - your content is excellent!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {improvements.map((improvement, index) => (
        <div
          key={index}
          className="flex items-start gap-3 bg-blue-900/20 border border-blue-800/30 rounded-lg p-4 hover:bg-blue-900/30 transition-all"
        >
          <span className="text-blue-400 flex-shrink-0 mt-0.5">💡</span>
          <p className="text-sm text-gray-300 leading-relaxed">{improvement}</p>
        </div>
      ))}
    </div>
  )
}

/**
 * OverallScoreGauge Component
 * Displays the overall score with a circular gauge
 */
interface OverallScoreGaugeProps {
  score: number
  animated?: boolean
}

function OverallScoreGauge({ score, animated = true }: OverallScoreGaugeProps) {
  const [displayScore, setDisplayScore] = useState(0)
  const scoreColor = getScoreColor(score).replace('text-', '')
  const scoreLabel = getScoreLabel(score)

  useEffect(() => {
    if (!animated) {
      setDisplayScore(score)
      return
    }

    const duration = 2000
    const steps = 60
    const increment = score / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= score) {
        setDisplayScore(score)
        clearInterval(timer)
      } else {
        setDisplayScore(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [score, animated])

  const rotation = (displayScore / 100) * 180 - 90

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative w-64 h-32">
        <svg className="w-full h-full" viewBox="0 0 200 100" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="33%" stopColor="#f59e0b" />
              <stop offset="66%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          <path
            d="M 20 90 A 80 80 0 0 1 180 90"
            fill="none"
            stroke="#374151"
            strokeWidth="12"
            strokeLinecap="round"
          />

          <path
            d="M 20 90 A 80 80 0 0 1 180 90"
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray="251.2"
            strokeDashoffset={251.2 - (displayScore / 100) * 251.2}
          />

          <g
            style={{ transformOrigin: '100px 90px' }}
          >
            <line
              x1="100"
              y1="90"
              x2="100"
              y2="30"
              stroke={`var(--${scoreColor})`}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="100" cy="90" r="6" fill={`var(--${scoreColor})`} />
          </g>
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <div
            className={`text-5xl font-bold ${getScoreColor(score)}`}
          >
            {displayScore}
          </div>
          <div className="text-sm text-gray-400 mt-1">{scoreLabel}</div>
        </div>
      </div>
    </div>
  )
}

/**
 * LoadingState Component
 * Displays loading animation during analysis
 */
function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div
        className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
      />
      <p
        className="mt-6 text-gray-400"
      >
        Analyzing your content...
      </p>
    </div>
  )
}

/**
 * ErrorState Component
 * Displays error messages with retry option
 */
interface ErrorStateProps {
  error: string
  onRetry?: () => void
}

function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div
      className="bg-red-900/20 border border-red-800/30 rounded-xl p-8 text-center"
    >
      <div className="text-4xl mb-4">⚠️</div>
      <h3 className="text-xl font-semibold text-red-400 mb-2">Analysis Failed</h3>
      <p className="text-gray-400 mb-6">{error}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CreativeDirector({
  contentId,
  initialContent = '',
  onAnalysisComplete,
  autoAnalyze = false,
  showHeader = true,
  className = '',
}: CreativeDirectorProps) {
  const { state } = useAppContext()
  const [content, setContent] = useState(initialContent)
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    isLoading: false,
    result: null,
    error: null,
  })

  // Auto-analyze on mount if enabled
  useEffect(() => {
    if (autoAnalyze && content && contentId) {
      handleAnalyze()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAnalyze = async () => {
    if (!content.trim()) {
      setAnalysisState({
        isLoading: false,
        result: null,
        error: 'Please enter content to analyze',
      })
      return
    }

    setAnalysisState({ isLoading: true, result: null, error: null })

    try {
      const request: AnalyzeContentRequest = {
        contentId: contentId || `content-${Date.now()}`,
        content: content.trim(),
      }

      const result = await apiClient.creativeDirector.analyze(request)

      setAnalysisState({
        isLoading: false,
        result,
        error: null,
      })

      if (onAnalysisComplete) {
        onAnalysisComplete(result)
      }
    } catch (error) {
      const errorMessage =
        error instanceof ApiError
          ? error.message
          : 'Failed to analyze content. Please try again.'

      setAnalysisState({
        isLoading: false,
        result: null,
        error: errorMessage,
      })
    }
  }

  const handleRetry = () => {
    setAnalysisState({ isLoading: false, result: null, error: null })
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white ${className}`}>
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        {showHeader && (
          <div
            className="text-center space-y-2"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Creative Director
            </h1>
            <p className="text-gray-400">
              Get professional feedback on your content structure and engagement
            </p>
          </div>
        )}

        {/* Content Input */}
        <div
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
        >
          <label htmlFor="content-input" className="block text-sm font-medium text-gray-300 mb-3">
            Your Content
          </label>
          <textarea
            id="content-input"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your content here for analysis..."
            className="w-full h-48 bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled={analysisState.isLoading}
          />
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {content.length} characters
            </span>
            <button
              onClick={handleAnalyze}
              disabled={analysisState.isLoading || !content.trim()}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all"
            >
              {analysisState.isLoading ? 'Analyzing...' : 'Analyze Content'}
            </button>
          </div>
        </div>

        {/* Loading State */}
{analysisState.isLoading && <LoadingState />}

          {/* Error State */}
          {analysisState.error && (
            <ErrorState error={analysisState.error} onRetry={handleRetry} />
          )}

          {/* Results */}
          {analysisState.result && (
            <div
              className="space-y-8"
            >
              {/* Overall Score */}
              <div
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
              >
                <h2 className="text-2xl font-bold text-white mb-4 text-center">
                  Overall Score
                </h2>
                <OverallScoreGauge score={analysisState.result.score.overall} />
              </div>

              {/* Score Breakdown */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Score Breakdown</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <ScoreCard
                    label="Structure"
                    score={analysisState.result.score.structure}
                    icon="🏗️"
                    delay={0.1}
                  />
                  <ScoreCard
                    label="Pacing"
                    score={analysisState.result.score.pacing}
                    icon="⚡"
                    delay={0.2}
                  />
                  <ScoreCard
                    label="Engagement"
                    score={analysisState.result.score.engagement}
                    icon="🎯"
                    delay={0.3}
                  />
                  <ScoreCard
                    label="Clarity"
                    score={analysisState.result.score.clarity}
                    icon="💎"
                    delay={0.4}
                  />
                </div>
              </div>

              {/* Detailed Feedback */}
              <div
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
              >
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <span>📋</span>
                  <span>Detailed Feedback</span>
                </h2>
                <div className="space-y-4">
                  {analysisState.result.feedback.map((feedback, index) => (
                    <FeedbackItem key={index} feedback={feedback} index={index} />
                  ))}
                </div>
              </div>

              {/* Improvements */}
              <div
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
              >
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <span>🚀</span>
                  <span>Improvement Suggestions</span>
                </h2>
                <ImprovementList improvements={analysisState.result.improvements} />
              </div>
            </div>
          )}
</div>
    </div>
  )
}

// Export sub-components for reuse
export { ScoreCard, FeedbackItem, ImprovementList, OverallScoreGauge }
