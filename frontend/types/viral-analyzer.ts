/**
 * TypeScript Type Definitions for Viral Analyzer
 * Comprehensive types for viral content analysis
 */

// ============================================================================
// CORE DATA TYPES
// ============================================================================

/**
 * Timeline event representing a viral hook at a specific timestamp
 */
export interface TimelineEvent {
  /** Timestamp in format "MM:SS" or "HH:MM:SS" */
  timestamp: string;
  /** Type of hook (visual, emotional, narrative, audio) */
  type: 'visual' | 'emotional' | 'narrative' | 'audio';
  /** Impact level of the hook */
  impact: 'high' | 'medium' | 'low';
  /** Optional description of the hook */
  description?: string;
}

/**
 * Viral pattern detected in the content
 */
export interface ViralPattern {
  /** Pattern type identifier (hook, pacing, emotion, etc.) */
  type: string;
  /** Strength score (0-1) indicating pattern effectiveness */
  strength: number;
  /** Human-readable description of the pattern */
  description: string;
  /** Optional recommendations for replicating this pattern */
  recommendations?: string[];
}

/**
 * Complete viral analysis result
 */
export interface ViralAnalysis {
  /** Original video URL analyzed */
  videoUrl: string;
  /** Overall viral score (0-100) */
  viralScore: number;
  /** Detected viral patterns */
  patterns: ViralPattern[];
  /** Timeline hooks/events */
  hooks: TimelineEvent[];
  /** Strategic guide for replication */
  guide: string;
  /** Analysis timestamp */
  analyzedAt?: string;
  /** Data source (for debugging: 'mock', 'ai-analysis', etc.) */
  source?: string;
}

/**
 * Request payload for viral analysis
 */
export interface AnalyzeViralRequest {
  /** Video URL to analyze */
  videoUrl: string;
  /** Optional: Additional metadata for enhanced analysis */
  metadata?: {
    /** Platform where video is hosted */
    platform?: string;
    /** Video duration in seconds */
    duration?: number;
    /** Content category */
    category?: string;
  };
}

/**
 * Response from viral analysis endpoint
 */
export interface AnalyzeViralResponse extends ViralAnalysis {
  /** Success indicator */
  success?: boolean;
  /** Error message if analysis failed */
  error?: string;
}

// ============================================================================
// COMPONENT STATE TYPES
// ============================================================================

/**
 * Loading states for the analysis process
 */
export type AnalysisLoadingState =
  | 'idle' // No analysis in progress
  | 'validating' // Validating input
  | 'analyzing' // Analysis in progress
  | 'complete' // Analysis complete
  | 'error'; // Error occurred

/**
 * Component state interface
 */
export interface ViralAnalyzerState {
  /** Current loading state */
  loadingState: AnalysisLoadingState;
  /** Analysis result data */
  analysis: ViralAnalysis | null;
  /** Error information */
  error: {
    message: string;
    code?: string;
    details?: any;
  } | null;
  /** Input video URL */
  videoUrl: string;
  /** Progress percentage (0-100) */
  progress: number;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Error codes specific to viral analyzer
 */
export enum ViralAnalyzerErrorCode {
  INVALID_URL = 'INVALID_URL',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  RATE_LIMIT = 'RATE_LIMIT',
  SERVER_ERROR = 'SERVER_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Structured error information
 */
export interface ViralAnalyzerError {
  /** Error code for programmatic handling */
  code: ViralAnalyzerErrorCode;
  /** Technical error message */
  message: string;
  /** User-friendly error message */
  userMessage: string;
  /** Whether the operation can be retried */
  retryable: boolean;
  /** Additional error details */
  details?: any;
}

// ============================================================================
// HOOK RETURN TYPES
// ============================================================================

/**
 * Return type for useViralAnalyzer hook
 */
export interface UseViralAnalyzerReturn extends ViralAnalyzerState {
  /** Function to trigger analysis */
  analyze: (videoUrl: string) => Promise<AnalyzeViralResponse>;
  /** Function to reset state */
  reset: () => void;
  /** Computed: Whether analysis is in progress */
  isLoading: boolean;
  /** Computed: Whether an error occurred */
  hasError: boolean;
  /** Computed: Whether results are available */
  hasResult: boolean;
}

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

/**
 * Props for ViralAnalyzer main component
 */
export interface ViralAnalyzerProps {
  /** Initial video URL (optional) */
  initialUrl?: string;
  /** Callback when analysis completes */
  onAnalysisComplete?: (analysis: ViralAnalysis) => void;
  /** Callback when error occurs */
  onError?: (error: ViralAnalyzerError) => void;
  /** Custom CSS class */
  className?: string;
}

/**
 * Props for PatternCard component
 */
export interface PatternCardProps {
  /** Pattern data to display */
  pattern: ViralPattern;
  /** Index for animation delays */
  index: number;
  /** Custom CSS class */
  className?: string;
}

/**
 * Props for TimelineEvent component
 */
export interface TimelineEventProps {
  /** Event data to display */
  event: TimelineEvent;
  /** Total video duration for positioning (optional) */
  totalDuration?: number;
  /** Custom CSS class */
  className?: string;
}

/**
 * Props for ViralAnalyzerResults component
 */
export interface ViralAnalyzerResultsProps {
  /** Analysis data to display */
  analysis: ViralAnalysis;
  /** Callback to trigger new analysis */
  onAnalyzeNew?: () => void;
  /** Custom CSS class */
  className?: string;
}

/**
 * Props for ViralAnalyzerError component
 */
export interface ViralAnalyzerErrorProps {
  /** Error information */
  error: ViralAnalyzerError;
  /** Callback to retry analysis */
  onRetry?: () => void;
  /** Custom CSS class */
  className?: string;
}

/**
 * Props for ViralAnalyzerLoading component
 */
export interface ViralAnalyzerLoadingProps {
  /** Current loading state */
  state: AnalysisLoadingState;
  /** Progress percentage (0-100) */
  progress: number;
  /** Custom CSS class */
  className?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Cache entry for storing analysis results
 */
export interface CacheEntry {
  /** Cached analysis data */
  data: AnalyzeViralResponse;
  /** Timestamp when cached */
  timestamp: number;
}

/**
 * Pattern statistics for aggregation
 */
export interface PatternStats {
  /** Pattern type */
  type: string;
  /** Average strength across analyses */
  averageStrength: number;
  /** Number of occurrences */
  count: number;
}

/**
 * Timeline position calculation result
 */
export interface TimelinePosition {
  /** Event data */
  event: TimelineEvent;
  /** Position percentage (0-100) */
  position: number;
  /** Timestamp in seconds */
  seconds: number;
}
