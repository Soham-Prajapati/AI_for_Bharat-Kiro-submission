'use client'

import { useState, useEffect } from 'react'

// ============================================================================
// TYPES - Matching backend service interfaces
// ============================================================================

export type HookType = 'question' | 'shock' | 'curiosity' | 'promise' | 'pattern_interrupt' | 'story'
export type EmotionType = 'excitement' | 'surprise' | 'curiosity' | 'fear' | 'joy' | 'anticipation'
export type PaceType = 'too_slow' | 'slow' | 'optimal' | 'fast' | 'too_fast'
export type CliffhangerType = 'question' | 'revelation' | 'suspense' | 'promise' | 'challenge'
export type ImprovementCategory = 'hook' | 'pacing' | 'emotion' | 'cliffhanger' | 'retention' | 'structure'
export type ImprovementPriority = 'critical' | 'high' | 'medium' | 'low'
export type DropoffSeverity = 'low' | 'medium' | 'high'

export interface Hook {
  position: number
  type: HookType
  strength: number
  text: string
  reasoning: string
  suggestions?: string[]
}

export interface EmotionalPeak {
  position: number
  timestamp?: number
  emotion: EmotionType
  intensity: number
  trigger: string
  context: string
}

export interface PacingTimeline {
  start: number
  end: number
  pace: 'slow' | 'medium' | 'fast'
  description: string
}

export interface PacingAnalysis {
  overallPace: PaceType
  paceScore: number
  sentenceVariety: number
  rhythmScore: number
  recommendations: string[]
  timeline?: PacingTimeline[]
}

export interface Cliffhanger {
  position: number
  type: CliffhangerType
  strength: number
  text: string
  effectiveness: string
}

export interface DropoffPoint {
  position: number
  timestamp?: number
  reason: string
  severity: DropoffSeverity
  suggestion: string
}

export interface StrongPoint {
  position: number
  timestamp?: number
  reason: string
  strength: number
}

export interface RetentionPrediction {
  predictedRetention: number
  dropoffPoints: DropoffPoint[]
  strongPoints: StrongPoint[]
  averageWatchTime: number
  confidence: number
}

export interface Improvement {
  category: ImprovementCategory
  priority: ImprovementPriority
  issue: string
  suggestion: string
  expectedImpact: string
  implementation: string
}

export interface DopamineOptimizationResult {
  overallScore: number
  hooks: Hook[]
  emotionalPeaks: EmotionalPeak[]
  pacingAnalysis: PacingAnalysis
  cliffhangers: Cliffhanger[]
  retentionPrediction: RetentionPrediction
  improvements: Improvement[]
  optimizedContent?: string
}

interface DopamineOptimizerProps {
  data?: DopamineOptimizationResult
  animated?: boolean
  showTimeline?: boolean
  showImprovements?: boolean
}

// ============================================================================
// MOCK DATA FOR TESTING
// ============================================================================

const mockDopamineData: DopamineOptimizationResult = {
  overallScore: 76,
  hooks: [
    {
      position: 0,
      type: 'question',
      strength: 82,
      text: 'What if I told you there\'s a secret to viral content?',
      reasoning: 'Strong opening question creates immediate curiosity',
      suggestions: [
        'Add specific numbers or statistics',
        'Include emotional power words'
      ]
    },
    {
      position: 150,
      type: 'promise',
      strength: 75,
      text: 'I\'ll show you exactly how to do this',
      reasoning: 'Clear value promise maintains engagement'
    }
  ],
  emotionalPeaks: [
    {
      position: 200,
      timestamp: 15,
      emotion: 'surprise',
      intensity: 88,
      trigger: 'Unexpected statistic revealed',
      context: '95% of creators miss this crucial element...'
    },
    {
      position: 450,
      timestamp: 35,
      emotion: 'excitement',
      intensity: 79,
      trigger: 'Success story shared',
      context: 'This strategy generated 10M views in just 3 days'
    }
  ],
  pacingAnalysis: {
    overallPace: 'optimal',
    paceScore: 85,
    sentenceVariety: 78,
    rhythmScore: 82,
    recommendations: [
      'Maintain current pacing rhythm',
      'Consider adding one more short sentence burst for emphasis'
    ],
    timeline: [
      { start: 0, end: 10, pace: 'fast', description: 'Strong hook section' },
      { start: 10, end: 30, pace: 'medium', description: 'Context building' },
      { start: 30, end: 45, pace: 'fast', description: 'Key insights delivery' }
    ]
  },
  cliffhangers: [
    {
      position: 300,
      type: 'suspense',
      strength: 84,
      text: 'But wait, there\'s something even more important...',
      effectiveness: 'Creates strong anticipation for next section'
    },
    {
      position: 600,
      type: 'question',
      strength: 77,
      text: 'Want to know the #1 mistake everyone makes?',
      effectiveness: 'Engages audience with relatable challenge'
    }
  ],
  retentionPrediction: {
    predictedRetention: 73,
    dropoffPoints: [
      {
        position: 250,
        timestamp: 20,
        reason: 'Long explanation without engagement trigger',
        severity: 'medium',
        suggestion: 'Add a surprising fact or visual element'
      },
      {
        position: 500,
        timestamp: 40,
        reason: 'Technical details may lose casual viewers',
        severity: 'low',
        suggestion: 'Simplify language or add analogy'
      }
    ],
    strongPoints: [
      {
        position: 50,
        timestamp: 5,
        reason: 'Powerful hook maintains attention',
        strength: 92
      },
      {
        position: 400,
        timestamp: 32,
        reason: 'Emotional peak drives engagement',
        strength: 85
      }
    ],
    averageWatchTime: 35,
    confidence: 0.81
  },
  improvements: [
    {
      category: 'hook',
      priority: 'high',
      issue: 'Opening could be more specific',
      suggestion: 'Add concrete numbers or bold claim in first sentence',
      expectedImpact: '+12-18% initial retention',
      implementation: 'Rewrite first sentence with specific statistic or shocking fact'
    },
    {
      category: 'emotion',
      priority: 'medium',
      issue: 'Could use one more emotional peak',
      suggestion: 'Add personal story or dramatic reveal around 25-second mark',
      expectedImpact: '+8-12% mid-content retention',
      implementation: 'Insert brief success story or relatable struggle'
    },
    {
      category: 'retention',
      priority: 'high',
      issue: 'Potential dropoff at 20-second mark',
      suggestion: 'Break up long explanation with pattern interrupt',
      expectedImpact: '+10-15% retention through middle section',
      implementation: 'Add surprising statistic or visual cue at 20 seconds'
    }
  ],
  optimizedContent: 'Optimized version of your content would appear here...'
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getScoreColor(score: number): string {
  if (score >= 80) return '#10b981'
  if (score >= 60) return '#3b82f6'
  if (score >= 40) return '#f59e0b'
  return '#ef4444'
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Fair'
  return 'Needs Work'
}

function getPriorityColor(priority: ImprovementPriority): string {
  switch (priority) {
    case 'critical': return '#ef4444'
    case 'high': return '#f59e0b'
    case 'medium': return '#3b82f6'
    case 'low': return '#6b7280'
  }
}

function getSeverityColor(severity: DropoffSeverity): string {
  switch (severity) {
    case 'high': return '#ef4444'
    case 'medium': return '#f59e0b'
    case 'low': return '#3b82f6'
  }
}

function getEmotionIcon(emotion: EmotionType): string {
  const icons: Record<EmotionType, string> = {
    excitement: '🎉',
    surprise: '😲',
    curiosity: '🤔',
    fear: '😰',
    joy: '😊',
    anticipation: '👀'
  }
  return icons[emotion]
}

function getHookIcon(type: HookType): string {
  const icons: Record<HookType, string> = {
    question: '❓',
    shock: '⚡',
    curiosity: '🔍',
    promise: '🎯',
    pattern_interrupt: '🔄',
    story: '📖'
  }
  return icons[type]
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// ============================================================================
// SCORE GAUGE COMPONENT
// ============================================================================

interface ScoreGaugeProps {
  score: number
  animated: boolean
}

function ScoreGauge({ score, animated }: ScoreGaugeProps) {
  const [displayScore, setDisplayScore] = useState(0)
  const scoreColor = getScoreColor(score)
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
    <div className="relative flex items-center justify-center">
      <div className="relative w-64 h-32">
        <svg className="w-full h-full" viewBox="0 0 200 100" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="dopamineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="33%" stopColor="#f59e0b" />
              <stop offset="66%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </svg>
          
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
            stroke="url(#dopamineGradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray="251.2"
            strokeDashoffset={251.2 - (displayScore / 100) * 251.2}
          />

          <div g
            style={{ transformOrigin: '100px 90px' }}
          >
            <line x1="100" y1="90" x2="100" y2="30" stroke={scoreColor} strokeWidth="3" strokeLinecap="round" />
            <circle cx="100" cy="90" r="6" fill={scoreColor} />
          </div>
        </div>

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
    </HookType>
  )
}

// ============================================================================
// HOOKS SECTION COMPONENT
// ============================================================================

interface HooksSectionProps {
  hooks: Hook[]
  index: number
}

function HooksSection({ hooks, index }: HooksSectionProps) {
  return (
    <div
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6"
    >
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span>🎣</span>
        <span>Hooks Analysis</span>
      </h3>

      <div className="space-y-4">
        {hooks.map((hook, idx) => (
          <div
            key={idx}
            className="bg-gray-800/30 rounded-lg p-4 border border-gray-700"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getHookIcon(hook.type)}</span>
                <div>
                  <div className="text-sm font-semibold text-white capitalize">
                    {hook.type.replace('_', ' ')}
                  </div>
                  <div className="text-xs text-gray-400">Position: {hook.position}</div>
                </div>
              </div>
              <div
                className="text-2xl font-bold"
                style={{ color: getScoreColor(hook.strength) }}
              >
                {hook.strength}
              </div>
            </div>

            <div className="mb-3">
              <div className="text-sm text-gray-300 italic mb-2">"{hook.text}"</div>
              <div className="text-xs text-gray-400">{hook.reasoning}</div>
            </div>

            <div className="h-2 bg-gray-700 rounded-full overflow-hidden mb-3">
              <div
                className="h-full rounded-full"
                style={{ backgroundColor: getScoreColor(hook.strength) }}
              />
            </div>

            {hook.suggestions && hook.suggestions.length > 0 && (
              <div className="space-y-1">
                {hook.suggestions.map((suggestion, sIdx) => (
                  <div key={sIdx} className="flex items-start gap-2 text-xs text-blue-400">
                    <span>💡</span>
                    <span>{suggestion}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// EMOTIONAL PEAKS COMPONENT
// ============================================================================

interface EmotionalPeaksSectionProps {
  peaks: EmotionalPeak[]
  index: number
}

function EmotionalPeaksSection({ peaks, index }: EmotionalPeaksSectionProps) {
  return (
    <div
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6"
    >
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span>💫</span>
        <span>Emotional Peaks</span>
      </h3>

      <div className="space-y-4">
        {peaks.map((peak, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-r from-purple-900/20 to-gray-800/30 rounded-lg p-4 border border-purple-700/30"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getEmotionIcon(peak.emotion)}</span>
                <div>
                  <div className="text-sm font-semibold text-white capitalize">
                    {peak.emotion}
                  </div>
                  <div className="text-xs text-gray-400">
                    {peak.timestamp ? formatTime(peak.timestamp) : `Pos: ${peak.position}`}
                  </div>
                </div>
              </div>
              <div
                className="text-2xl font-bold"
                style={{ color: getScoreColor(peak.intensity) }}
              >
                {peak.intensity}
              </div>
            </div>

            <div className="mb-3">
              <div className="text-xs text-purple-400 mb-1">{peak.trigger}</div>
              <div className="text-sm text-gray-300 italic">"{peak.context}"</div>
            </div>

            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// PACING ANALYSIS COMPONENT
// ============================================================================

interface PacingAnalysisSectionProps {
  pacing: PacingAnalysis
  index: number
}

function PacingAnalysisSection({ pacing, index }: PacingAnalysisSectionProps) {
  const paceColor = getScoreColor(pacing.paceScore)

  return (
    <div
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6"
    >
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span>⚡</span>
        <span>Pacing Analysis</span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
          <div className="text-xs text-gray-400 mb-2">Overall Pace</div>
          <div className="text-lg font-bold text-white capitalize">
            {pacing.overallPace.replace('_', ' ')}
          </div>
          <div className="text-sm" style={{ color: paceColor }}>
            Score: {pacing.paceScore}
          </div>
        </div>

        <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
          <div className="text-xs text-gray-400 mb-2">Sentence Variety</div>
          <div className="text-lg font-bold text-white">{pacing.sentenceVariety}%</div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden mt-2">
            <div
              className="h-full rounded-full bg-blue-500"
            />
          </div>
        </div>

        <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
          <div className="text-xs text-gray-400 mb-2">Rhythm Score</div>
          <div className="text-lg font-bold text-white">{pacing.rhythmScore}%</div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden mt-2">
            <div
              className="h-full rounded-full bg-green-500"
            />
          </div>
        </div>
      </div>

      {pacing.timeline && pacing.timeline.length > 0 && (
        <div className="mb-6">
          <div className="text-sm font-semibold text-white mb-3">Pacing Timeline</div>
          <div className="space-y-2">
            {pacing.timeline.map((segment, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3"
              >
                <div className="text-xs text-gray-400 w-20">
                  {formatTime(segment.start)} - {formatTime(segment.end)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        segment.pace === 'fast'
                          ? 'bg-red-900/30 text-red-400'
                          : segment.pace === 'medium'
                          ? 'bg-blue-900/30 text-blue-400'
                          : 'bg-green-900/30 text-green-400'
                      }`}
                    >
                      {segment.pace}
                    </span>
                    <span className="text-xs text-gray-300">{segment.description}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pacing.recommendations.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-semibold text-white mb-2">Recommendations</div>
          {pacing.recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 bg-blue-900/20 border border-blue-800/30 rounded-lg p-3"
            >
              <span className="text-blue-400">→</span>
              <span className="text-sm text-gray-300">{rec}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// RETENTION PREDICTION COMPONENT
// ============================================================================

interface RetentionPredictionSectionProps {
  retention: RetentionPrediction
  index: number
}

function RetentionPredictionSection({ retention, index }: RetentionPredictionSectionProps) {
  return (
    <div
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6"
    >
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span>📊</span>
        <span>Retention Prediction</span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-900/30 to-gray-800/30 rounded-lg p-4 border border-blue-700/30">
          <div className="text-xs text-blue-400 mb-2">Predicted Retention</div>
          <div
            className="text-3xl font-bold"
            style={{ color: getScoreColor(retention.predictedRetention) }}
          >
            {retention.predictedRetention}%
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-900/30 to-gray-800/30 rounded-lg p-4 border border-purple-700/30">
          <div className="text-xs text-purple-400 mb-2">Avg Watch Time</div>
          <div className="text-3xl font-bold text-white">
            {formatTime(retention.averageWatchTime)}
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-900/30 to-gray-800/30 rounded-lg p-4 border border-green-700/30">
          <div className="text-xs text-green-400 mb-2">Confidence</div>
          <div className="text-3xl font-bold text-white">
            {Math.round(retention.confidence * 100)}%
          </div>
        </div>
      </div>

      {retention.dropoffPoints.length > 0 && (
        <div className="mb-6">
          <div className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <span>⚠️</span>
            <span>Potential Dropoff Points</span>
          </div>
          <div className="space-y-3">
            {retention.dropoffPoints.map((point, idx) => (
              <div
                key={idx}
                className="bg-red-900/20 border border-red-800/30 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-1 rounded text-xs font-semibold"
                      style={{
                        backgroundColor: `${getSeverityColor(point.severity)}20`,
                        color: getSeverityColor(point.severity)
                      }}
                    >
                      {point.severity}
                    </span>
                    <span className="text-xs text-gray-400">
                      {point.timestamp ? formatTime(point.timestamp) : `Pos: ${point.position}`}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-300 mb-2">{point.reason}</div>
                <div className="flex items-start gap-2 text-xs text-blue-400">
                  <span>💡</span>
                  <span>{point.suggestion}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {retention.strongPoints.length > 0 && (
        <div>
          <div className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <span>✨</span>
            <span>Strong Points</span>
          </div>
          <div className="space-y-3">
            {retention.strongPoints.map((point, idx) => (
              <div
                key={idx}
                className="bg-green-900/20 border border-green-800/30 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">
                      {point.timestamp ? formatTime(point.timestamp) : `Pos: ${point.position}`}
                    </div>
                    <div className="text-sm text-gray-300">{point.reason}</div>
                  </div>
                  <div
                    className="text-xl font-bold"
                    style={{ color: getScoreColor(point.strength) }}
                  >
                    {point.strength}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// IMPROVEMENTS SECTION COMPONENT
// ============================================================================

interface ImprovementsSectionProps {
  improvements: Improvement[]
  index: number
}

function ImprovementsSection({ improvements, index }: ImprovementsSectionProps) {
  return (
    <div
      className="bg-gradient-to-br from-blue-900/20 to-gray-800/50 backdrop-blur-sm rounded-xl border border-blue-700/30 p-6"
    >
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span>🚀</span>
        <span>Improvement Suggestions</span>
      </h3>

      <div className="space-y-4">
        {improvements.map((improvement, idx) => (
          <div
            key={idx}
            className="bg-gray-800/50 rounded-lg p-5 border border-gray-700"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span
                  className="px-2 py-1 rounded text-xs font-semibold"
                  style={{
                    backgroundColor: `${getPriorityColor(improvement.priority)}20`,
                    color: getPriorityColor(improvement.priority)
                  }}
                >
                  {improvement.priority}
                </span>
                <span className="text-xs text-gray-400 capitalize">
                  {improvement.category}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-xs text-red-400 mb-1">Issue:</div>
                <div className="text-sm text-gray-300">{improvement.issue}</div>
              </div>

              <div>
                <div className="text-xs text-blue-400 mb-1">Suggestion:</div>
                <div className="text-sm text-white font-medium">{improvement.suggestion}</div>
              </div>

              <div>
                <div className="text-xs text-green-400 mb-1">Expected Impact:</div>
                <div className="text-sm text-gray-300">{improvement.expectedImpact}</div>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                <div className="text-xs text-purple-400 mb-1">Implementation:</div>
                <div className="text-sm text-gray-300">{improvement.implementation}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function DopamineOptimizer({
  data = mockDopamineData,
  animated = true,
  showTimeline = true,
  showImprovements = true
}: DopamineOptimizerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'details'>('overview')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
      >
        <h2 className="text-3xl font-bold text-white mb-2">
          Dopamine Optimizer
        </h2>
        <p className="text-gray-400">
          AI-powered content analysis for maximum engagement and retention
        </p>
      </div>

      {/* Overall Score */}
      <div
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6"
      >
        <div className="text-center mb-4">
          <h3 className="text-xl font-semibold text-white mb-2">
            Overall Engagement Score
          </h3>
          <p className="text-sm text-gray-400">
            Comprehensive analysis of hooks, emotions, pacing, and retention
          </p>
        </div>

        <ScoreGauge score={data.overallScore} animated={animated} />

        <div className="flex justify-between text-xs text-gray-500 mt-4 px-4">
          <span>0</span>
          <span>25</span>
          <span>50</span>
          <span>75</span>
          <span>100</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div
        className="flex gap-3"
      >
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('details')}
          className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all ${
            activeTab === 'details'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
          }`}
        >
          Detailed Analysis
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-5"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Hooks</span>
                <span className="text-2xl">🎣</span>
              </div>
              <div className="text-3xl font-bold text-white">{data.hooks.length}</div>
              <div className="text-xs text-gray-400 mt-1">
                Avg: {Math.round(data.hooks.reduce((sum, h) => sum + h.strength, 0) / data.hooks.length)}
              </div>
            </div>

            <div
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-5"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Emotional Peaks</span>
                <span className="text-2xl">💫</span>
              </div>
              <div className="text-3xl font-bold text-white">{data.emotionalPeaks.length}</div>
              <div className="text-xs text-gray-400 mt-1">
                Avg: {Math.round(data.emotionalPeaks.reduce((sum, p) => sum + p.intensity, 0) / data.emotionalPeaks.length)}
              </div>
            </div>

            <div
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-5"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Pacing</span>
                <span className="text-2xl">⚡</span>
              </div>
              <div className="text-3xl font-bold text-white">{data.pacingAnalysis.paceScore}</div>
              <div className="text-xs text-gray-400 mt-1 capitalize">
                {data.pacingAnalysis.overallPace.replace('_', ' ')}
              </div>
            </div>

            <div
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-5"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Retention</span>
                <span className="text-2xl">📊</span>
              </div>
              <div className="text-3xl font-bold text-white">
                {data.retentionPrediction.predictedRetention}%
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {formatTime(data.retentionPrediction.averageWatchTime)} avg
              </div>
            </div>
          </div>

          {/* Improvements */}
          {showImprovements && data.improvements.length > 0 && (
            <ImprovementsSection improvements={data.improvements} index={5} />
          )}
        </div>
      )}

      {/* Details Tab */}
      {activeTab === 'details' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <HooksSection hooks={data.hooks} index={0} />
            <EmotionalPeaksSection peaks={data.emotionalPeaks} index={1} />
          </div>

          <PacingAnalysisSection pacing={data.pacingAnalysis} index={2} />
          <RetentionPredictionSection retention={data.retentionPrediction} index={3} />

          {data.cliffhangers.length > 0 && (
            <div
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span>🎬</span>
                <span>Cliffhangers</span>
              </h3>

              <div className="space-y-3">
                {data.cliffhangers.map((cliff, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-800/30 rounded-lg p-4 border border-gray-700"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="text-xs text-gray-400 capitalize">
                          {cliff.type} • Pos: {cliff.position}
                        </span>
                      </div>
                      <div
                        className="text-xl font-bold"
                        style={{ color: getScoreColor(cliff.strength) }}
                      >
                        {cliff.strength}
                      </div>
                    </div>
                    <div className="text-sm text-gray-300 italic mb-2">"{cliff.text}"</div>
                    <div className="text-xs text-blue-400">{cliff.effectiveness}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
