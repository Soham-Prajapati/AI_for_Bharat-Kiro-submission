/**
 * Upload-to-Results Flow Types
 * Shared types for the complete upload-to-results content generation flow
 * Used by both backend (Express.js) and frontend (Next.js)
 */

// ============================================================================
// PLATFORM TYPES
// ============================================================================

export type Platform = 
  | 'youtube' 
  | 'instagram' 
  | 'tiktok' 
  | 'linkedin' 
  | 'twitter' 
  | 'blog' 
  | 'podcast' 
  | 'analytics';

export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type ProcessingStep = 
  | 'idle'
  | 'uploading' 
  | 'analyzing' 
  | 'generating' 
  | 'complete';

// ============================================================================
// PLATFORM CONTENT
// ============================================================================

export interface PlatformContent {
  platform: Platform;
  title?: string;
  content: string;
  hashtags?: string[];
  script?: string;
  timestamps?: Array<{ time: string; text: string }>;
  metadata?: Record<string, any>;
}

// ============================================================================
// VIDEO METADATA
// ============================================================================

export interface VideoMetadata {
  fileId: string;
  fileName: string;
  mimeType: string;
  size: number;
  duration: number; // seconds
  localPath: string;
  transcript?: string;
  keyPoints?: string[];
  uploadedAt: string;
}

// ============================================================================
// VIRAL ANALYSIS
// ============================================================================

export interface ViralPattern {
  type: string;
  strength: number;
  description: string;
  examples?: string[];
}

export interface ViralHook {
  timestamp: string;
  type: string;
  impact: 'high' | 'medium' | 'low';
  description: string;
}

export interface ViralAnalysis {
  patterns: ViralPattern[];
  hooks: ViralHook[];
  recommendations: string[];
}

// ============================================================================
// CONTENT FEEDBACK
// ============================================================================

export interface ImprovementSuggestion {
  aspect: string;
  current: string;
  suggested: string;
  impact: 'high' | 'medium' | 'low';
  reasoning: string;
}

export interface ContentFeedback {
  overallScore: number;
  grade: string;
  topStrengths: string[];
  topWeaknesses: string[];
  improvements: ImprovementSuggestion[];
}

// ============================================================================
// ANALYTICS
// ============================================================================

export interface Analytics {
  estimatedReach: number;
  estimatedEngagement: number;
  contentQualityScore: number;
  viralPotential: number;
  detectedDomain?: string;
  domainConfidence?: number;
}

// ============================================================================
// SAFETY CHECK
// ============================================================================

export interface SafetyCheck {
  isSafe: boolean;
  violations: any[];
  suggestions: string[];
}

// ============================================================================
// GENERATION RESULTS
// ============================================================================

export interface GenerationResults {
  jobId: string;
  videoId: string;
  userId: string;
  platforms: Record<Platform, PlatformContent>;
  viralScore: number; // 0-100
  analytics: Analytics;
  viralAnalysis: ViralAnalysis;
  contentFeedback: ContentFeedback;
  safetyCheck: SafetyCheck;
  generatedAt: string;
  expiresAt: string;
}

// ============================================================================
// PROCESSING JOB
// ============================================================================

export interface ProcessingJob {
  jobId: string;
  fileId: string;
  userId: string;
  status: ProcessingStatus;
  progress: number; // 0-100
  currentStep: string;
  startedAt: string;
  completedAt?: string;
  error?: string;
  results?: GenerationResults;
}

// ============================================================================
// API REQUEST TYPES
// ============================================================================

export interface ProcessVideoRequest {
  fileId: string;
  fileName: string;
  mimeType: string;
  userId: string;
  platforms: Platform[];
}

export interface RegenerateContentRequest {
  platform: Platform;
  userId: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ProcessVideoResponse {
  success: boolean;
  jobId: string;
  status: ProcessingStatus;
  message: string;
}

export interface ResultsResponse {
  success: boolean;
  jobId: string;
  results: GenerationResults;
}

export interface RegenerateContentResponse {
  success: boolean;
  platform: Platform;
  content: PlatformContent;
}

export interface UploadFileResponse {
  success: boolean;
  fileId: string;
  fileName: string;
  mimeType: string;
  size: number;
  userId: string;
  url: string;
  uploadedAt: string;
  localPath: string;
}

export interface YouTubeMetadata {
  title: string;
  duration: number;
  thumbnail: string;
}

export interface YouTubeUploadResponse {
  success: boolean;
  fileId: string;
  metadata: YouTubeMetadata;
  domain: string;
  status: string;
  type: string;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export type UploadErrorCode = 
  | 'FILE_TOO_LARGE' 
  | 'INVALID_FILE_TYPE' 
  | 'UPLOAD_FAILED';

export type ProcessingErrorCode = 
  | 'NO_AUDIO' 
  | 'CORRUPTED_FILE' 
  | 'TRANSCRIPT_TOO_SHORT' 
  | 'PROCESSING_TIMEOUT';

export type NetworkErrorCode = 
  | 'TIMEOUT' 
  | 'CONNECTION_FAILED' 
  | 'SERVICE_UNAVAILABLE';

export class UploadError extends Error {
  constructor(
    message: string,
    public code: UploadErrorCode,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'UploadError';
  }
}

export class ProcessingError extends Error {
  constructor(
    message: string,
    public code: ProcessingErrorCode,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'ProcessingError';
  }
}

export class NetworkError extends Error {
  constructor(
    message: string,
    public code: NetworkErrorCode,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'NetworkError';
  }
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  sanitizedName?: string;
}

// ============================================================================
// SUPPORTED FILE TYPES
// ============================================================================

export const SUPPORTED_FILE_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'audio/mpeg',
  'audio/wav',
  'audio/x-m4a',
  'video/webm'
] as const;

export const SUPPORTED_FILE_EXTENSIONS = [
  'mp4',
  'mov',
  'avi',
  'mp3',
  'wav',
  'm4a',
  'webm'
] as const;

// ============================================================================
// CONSTANTS
// ============================================================================

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB in bytes
export const MIN_TRANSCRIPT_LENGTH = 50; // words
export const RESULTS_TTL = 3600000; // 1 hour in milliseconds
export const PROCESSING_TIMEOUT = 90000; // 90 seconds in milliseconds

// ============================================================================
// PLATFORM CONFIGURATION
// ============================================================================

export interface PlatformConfig {
  name: string;
  icon: string;
  color: string;
  maxLength?: number;
}

export const PLATFORM_CONFIGS: Record<Platform, PlatformConfig> = {
  youtube: {
    name: 'YouTube',
    icon: '▶',
    color: '#FF0000'
  },
  instagram: {
    name: 'Instagram',
    icon: '◎',
    color: '#E1306C'
  },
  tiktok: {
    name: 'TikTok',
    icon: '♪',
    color: '#00F2EA'
  },
  linkedin: {
    name: 'LinkedIn',
    icon: 'in',
    color: '#0077B5'
  },
  twitter: {
    name: 'Twitter',
    icon: '𝕏',
    color: '#1DA1F2',
    maxLength: 280
  },
  blog: {
    name: 'Blog',
    icon: '📝',
    color: '#818CF8'
  },
  podcast: {
    name: 'Podcast',
    icon: '🎙',
    color: '#22D3EE'
  },
  analytics: {
    name: 'Analytics',
    icon: '📊',
    color: '#F97316'
  }
};

// ============================================================================
// VIRAL SCORE CONFIGURATION
// ============================================================================

export interface ViralScoreConfig {
  min: number;
  max: number;
  color: string;
  label: string;
}

export const VIRAL_SCORE_RANGES: ViralScoreConfig[] = [
  { min: 0, max: 40, color: '#EF4444', label: 'Low' },
  { min: 41, max: 70, color: '#F59E0B', label: 'Medium' },
  { min: 71, max: 100, color: '#10B981', label: 'High' }
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getViralScoreConfig(score: number): ViralScoreConfig {
  return VIRAL_SCORE_RANGES.find(
    range => score >= range.min && score <= range.max
  ) || VIRAL_SCORE_RANGES[0];
}

export function isValidPlatform(platform: string): platform is Platform {
  return ['youtube', 'instagram', 'tiktok', 'linkedin', 'twitter', 'blog', 'podcast', 'analytics'].includes(platform);
}

export function isValidFileType(mimeType: string): boolean {
  return SUPPORTED_FILE_TYPES.includes(mimeType as any);
}

export function isValidFileExtension(extension: string): boolean {
  return SUPPORTED_FILE_EXTENSIONS.includes(extension.toLowerCase() as any);
}
