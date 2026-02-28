/**
 * Type definitions for DopamineOptimizer component
 * Export these types for reuse across your application
 */

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
