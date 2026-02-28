/**
 * Comprehensive TypeScript API Types
 * Auto-generated from backend route analysis
 */

// ============================================================================
// BASE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, public field?: string) {
    super(message, 400, 'VALIDATION_ERROR', { field });
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends ApiError {
  constructor(message = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends ApiError {
  constructor(message = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends ApiError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends ApiError {
  constructor(message = 'Too many requests', public retryAfter?: number) {
    super(message, 429, 'RATE_LIMIT_ERROR', { retryAfter });
    this.name = 'RateLimitError';
  }
}

export class NetworkError extends ApiError {
  constructor(message = 'Network error') {
    super(message, 0, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends ApiError {
  constructor(message = 'Request timeout') {
    super(message, 408, 'TIMEOUT_ERROR');
    this.name = 'TimeoutError';
  }
}

export class UploadError extends ApiError {
  constructor(message: string, statusCode: number, code: string) {
    super(message, statusCode, code);
    this.name = 'UploadError';
  }
}

// ============================================================================
// UPLOAD TYPES
// ============================================================================

export interface UploadRequest {
  file: File;
  userId?: string;
}

export interface UploadResponse {
  success: boolean;
  fileId: string;
  fileName: string;
  mimeType: string;
  size: number;
  userId: string;
  url: string;
  uploadedAt: string;
}

// ============================================================================
// PROCESS TYPES
// ============================================================================

export interface ProcessRequest {
  fileId: string;
  contentType?: string;
}

export interface ProcessResponse {
  success: boolean;
  jobId: string;
  fileId: string;
  status: 'processing' | 'completed' | 'failed';
  startedAt: string;
}

export interface ProcessStatusResponse {
  jobId: string;
  status: 'processing' | 'completed' | 'failed';
  transcript?: string;
  completedAt: string;
}

// ============================================================================
// GENERATE TYPES
// ============================================================================

export type Platform = 'youtube' | 'instagram' | 'tiktok' | 'linkedin' | 'twitter' | 'facebook';
export type CreatorMode = 'hybrid' | 'authentic' | 'optimized';

export interface GenerateRequest {
  jobId: string;
  platforms: Platform[];
  language?: string;
  creatorMode?: CreatorMode;
}

export interface PlatformContent {
  title?: string;
  description?: string;
  caption?: string;
  hashtags?: string[];
  script?: string;
}

export interface GenerateResponse {
  success: boolean;
  generationId: string;
  jobId: string;
  status: 'completed' | 'processing' | 'failed';
  language: string;
  creatorMode: CreatorMode;
  results: Record<Platform, PlatformContent>;
}

// ============================================================================
// DNA ANALYSIS TYPES
// ============================================================================

export interface DnaAnalyzeRequest {
  userId: string;
  videoIds: string[];
}

export interface CreatorProfile {
  tone: string;
  style: string;
  topics: string[];
  vocabulary: string[];
  patterns: Record<string, any>;
}

export interface DnaAnalyzeResponse {
  success: boolean;
  userId: string;
  videoCount: number;
  profile: CreatorProfile;
  analyzedAt: string;
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface PlatformAnalytics {
  platform: Platform;
  followers: number;
  engagement: number;
  views: number;
  posts: number;
}

export interface AnalyticsData {
  totalFollowers: number;
  totalEngagement: number;
  totalViews: number;
  platforms: PlatformAnalytics[];
  trends: any[];
}

export interface AnalyticsResponse {
  success: boolean;
  userId: string;
  analytics: AnalyticsData;
  cached: boolean;
  fetchedAt: string;
}

// ============================================================================
// VIRAL PREDICTION TYPES
// ============================================================================

export interface ViralPredictRequest {
  transcript: string;
  metadata?: Record<string, any>;
}

export interface ViralPrediction {
  score: number;
  factors: Array<{
    name: string;
    impact: number;
    description: string;
  }>;
  recommendations: string[];
}

export interface ViralPredictResponse {
  success: boolean;
  prediction: ViralPrediction;
  analyzedAt: string;
}

// ============================================================================
// AUTH TYPES
// ============================================================================

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  userId: string;
  email: string;
  name?: string;
  token: string;
  createdAt?: string;
  loginAt?: string;
}

export interface VerifyTokenRequest {
  token: string;
}

export interface VerifyTokenResponse {
  valid: boolean;
  userId: string;
  email: string;
}

// ============================================================================
// AUTOMATION TYPES
// ============================================================================

export interface AutomationTrigger {
  type: 'schedule' | 'event' | 'manual';
  cron?: string;
  event?: string;
}

export interface AutomationAction {
  type: string;
  platform?: string;
  contentType?: string;
  [key: string]: any;
}

export interface CreateAutomationRequest {
  userId: string;
  name: string;
  trigger: AutomationTrigger;
  actions: AutomationAction[];
}

export interface Automation {
  automationId: string;
  userId: string;
  name: string;
  trigger: AutomationTrigger;
  actions: AutomationAction[];
  status: 'active' | 'paused' | 'deleted';
  createdAt: string;
}

export interface ListAutomationsResponse {
  automations: Automation[];
}

export interface DeleteAutomationResponse {
  automationId: string;
  status: 'deleted';
  deletedAt: string;
}

// ============================================================================
// COMMUNITY TYPES
// ============================================================================

export interface CreatePostRequest {
  userId: string;
  content: string;
  groupId?: string;
  images?: string[];
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  images?: string[];
  likes: number;
  comments: number;
  groupId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Comment {
  id: string;
  userId: string;
  postId: string;
  content: string;
  createdAt: string;
}

export interface FeedResponse {
  success: boolean;
  posts: Post[];
  count: number;
  limit: number;
  offset: number;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  ownerId: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  memberCount: number;
  postCount: number;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  followerCount: number;
  followingCount: number;
  createdAt: string;
}

// ============================================================================
// TRENDS TYPES
// ============================================================================

export interface Trend {
  topic: string;
  score: number;
  growth: number;
  platform: Platform;
}

export interface TrendPrediction {
  topic: string;
  confidence: number;
  estimatedPeak: string;
  lifespan: number;
}

export interface CurrentTrendsResponse {
  trends: Trend[];
  timestamp: string;
}

export interface PredictTrendsResponse {
  predictions: TrendPrediction[];
  timestamp: string;
}

// ============================================================================
// MULTIPLY TYPES
// ============================================================================

export interface MultiplyGenerateRequest {
  videoId?: string;
  transcript: string;
  platforms: Platform[];
}

export interface Clip {
  id: string;
  duration: number;
  url: string;
  platform: Platform;
}

export interface Quote {
  id: string;
  text: string;
  imageUrl: string;
}

export interface Audiogram {
  id: string;
  duration: number;
  url: string;
}

export interface MultiplyGenerateResponse {
  clips: Clip[];
  quotes: Quote[];
  audiograms: Audiogram[];
  totalPieces: number;
  generatedAt: string;
}

// ============================================================================
// MULTIPLY V2 TYPES
// ============================================================================

export interface MultiplyV2GenerateRequest {
  videoId: string;
  transcript: string;
  duration: number;
  platforms: ('youtube' | 'instagram' | 'tiktok' | 'twitter' | 'linkedin' | 'facebook' | 'pinterest' | 'reddit')[];
  contentTypes: ('short' | 'reel' | 'story' | 'post' | 'thread' | 'carousel' | 'infographic' | 'quote' | 'audiogram' | 'blog')[];
  variations: number;
  includeScheduling?: boolean;
  targetAudience?: string;
  brandVoice?: 'professional' | 'casual' | 'humorous' | 'inspirational' | 'educational';
}

export interface ContentPiece {
  pieceId: string;
  type: string;
  platform: string;
  title?: string;
  content: string;
  hashtags?: string[];
  media?: {
    type: 'image' | 'video' | 'audio';
    url: string;
    thumbnail?: string;
    duration?: number;
  };
  scheduledTime?: string;
  estimatedEngagement: number;
  priority: 'high' | 'medium' | 'low';
  variation: number;
}

export interface ContentCalendarEntry {
  date: string;
  dayOfWeek: string;
  pieces: ContentPiece[];
  theme?: string;
  notes?: string;
}

export interface MultiplyV2Analytics {
  piecesByPlatform: Record<string, number>;
  piecesByType: Record<string, number>;
  estimatedReach: number;
  estimatedEngagement: number;
  contentDiversity: number;
}

export interface MultiplyV2GenerateResponse {
  multiplyId: string;
  videoId: string;
  totalPieces: number;
  pieces: ContentPiece[];
  contentCalendar: ContentCalendarEntry[];
  analytics: MultiplyV2Analytics;
  recommendations: string[];
  generatedAt: string;
}

export interface MultiplyV2StatusResponse {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  result?: MultiplyV2GenerateResponse;
  error?: string;
}

export interface MultiplyV2ResultsResponse {
  success: boolean;
  result: MultiplyV2GenerateResponse;
}

// ============================================================================
// WORKSPACE TYPES
// ============================================================================

export interface CreateWorkspaceRequest {
  name: string;
  initialContent?: string;
}

export interface Workspace {
  id: string;
  name: string;
  content: string;
  version: number;
  userCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceUsersResponse {
  success: boolean;
  workspaceId: string;
  users: string[];
  count: number;
}

// ============================================================================
// MARKETPLACE TYPES
// ============================================================================

export type ListingType = 'template' | 'script' | 'thumbnail' | 'music' | 'effect';

export interface CreateListingRequest {
  title: string;
  description?: string;
  price: number;
  type: ListingType;
  userId: string;
  fileUrl?: string;
}

export interface Listing {
  id: string;
  title: string;
  description?: string;
  price: number;
  type: ListingType;
  userId: string;
  fileUrl?: string;
  status: 'active' | 'sold' | 'inactive';
  rating?: number;
  sales?: number;
  createdAt: string;
}

export interface PurchaseListingRequest {
  listingId: string;
  userId: string;
  paymentMethod?: string;
}

export interface Transaction {
  id: string;
  listingId: string;
  userId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod: string;
  purchasedAt: string;
}

export interface PurchaseListingResponse {
  success: boolean;
  transaction: Transaction;
  downloadUrl: string;
}

export interface ListingsResponse {
  listings: Listing[];
  total: number;
}

// ============================================================================
// INTEGRATIONS TYPES
// ============================================================================

export interface ConnectPlatformRequest {
  userId: string;
  platform: Platform;
  accessToken: string;
}

export interface PlatformConnection {
  connectionId: string;
  userId: string;
  platform: Platform;
  status: 'connected' | 'disconnected' | 'expired';
  connectedAt: string;
  expiresAt?: string;
}

export interface PostToPlatformRequest {
  connectionId: string;
  content: any;
  platform: Platform;
}

export interface PostToPlatformResponse {
  postId: string;
  connectionId: string;
  platform: Platform;
  status: 'published' | 'scheduled' | 'failed';
  url: string;
  postedAt: string;
}

export interface ListConnectionsResponse {
  connections: Array<{
    platform: Platform;
    status: string;
    connectedAt: string | null;
  }>;
}

// ============================================================================
// ROI TYPES
// ============================================================================

export interface RoiData {
  timeSaved: number;
  moneySaved: number;
  contentGenerated: number;
  efficiency: number;
}

export interface RoiResponse {
  success: boolean;
  userId: string;
  roi: RoiData;
  calculatedAt: string;
}

// ============================================================================
// CREATIVE DIRECTOR TYPES
// ============================================================================

export interface AnalyzeContentRequest {
  contentId: string;
  content: string;
}

export interface ContentScore {
  structure: number;
  pacing: number;
  engagement: number;
  clarity: number;
  overall: number;
}

export interface ContentFeedback {
  aspect: string;
  rating: 'excellent' | 'good' | 'fair' | 'poor';
  comment: string;
}

export interface AnalyzeContentResponse {
  contentId: string;
  score: ContentScore;
  feedback: ContentFeedback[];
  improvements: string[];
}

// ============================================================================
// VIRAL ANALYZER TYPES
// ============================================================================

export interface AnalyzeViralRequest {
  videoUrl: string;
}

export interface ViralPattern {
  type: string;
  strength: number;
  description: string;
}

export interface ViralHook {
  timestamp: string;
  type: string;
  impact: 'high' | 'medium' | 'low';
}

export interface AnalyzeViralResponse {
  videoUrl: string;
  patterns: ViralPattern[];
  hooks: ViralHook[];
  guide: string;
  viralScore: number;
}

// ============================================================================
// VOICE CLONING TYPES
// ============================================================================

export interface VoiceTrainRequest {
  userId: string;
  samples: File[];
}

export interface VoiceTrainResponse {
  success: boolean;
  modelId: string;
  samplesUploaded: number;
  status: 'training' | 'ready' | 'failed';
  estimatedTime: string;
  message: string;
}

export interface VoiceGenerateRequest {
  modelId: string;
  text: string;
}

export interface VoiceGenerateResponse {
  success: boolean;
  audioUrl: string;
  duration: number;
  status: 'completed' | 'processing' | 'failed';
  message: string;
}

// ============================================================================
// CULTURAL ADAPTATION TYPES
// ============================================================================

export interface CulturalAdaptRequest {
  content: string;
  targetRegion: string;
}

export interface CulturalChange {
  original: string;
  adapted: string;
  type: 'idiom' | 'festival' | 'currency' | 'measurement' | 'reference';
}

export interface CulturalAdaptation {
  originalContent: string;
  adaptedContent: string;
  targetRegion: string;
  changes: CulturalChange[];
  confidence: number;
}

export interface CulturalAdaptResponse {
  success: boolean;
  adaptation: CulturalAdaptation;
  adaptedAt: string;
}

export interface SupportedRegionsResponse {
  success: boolean;
  regions: string[];
}

// ============================================================================
// VOICE CLONING TYPES
// ============================================================================

export interface VoiceTrainRequest {
  userId: string;
  samples: Blob[];
}

export interface VoiceTrainResponse {
  success: boolean;
  jobId: string;
  message: string;
  estimatedTime?: number;
}

export interface VoiceTrainStatusResponse {
  jobId: string;
  status: 'processing' | 'completed' | 'error';
  progress: number;
  modelId?: string;
  error?: string;
  completedAt?: string;
}

export interface VoiceGenerateRequest {
  modelId: string;
  text: string;
  userId: string;
  speed?: number;
  pitch?: number;
}

export interface VoiceGenerateResponse {
  success: boolean;
  audioUrl: string;
  duration: number;
  generatedAt: string;
}

// ============================================================================
// MEMBERSHIP TYPES
// ============================================================================

export type SubscriptionTier = 'free' | 'basic' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'pending';

export interface SubscriptionPlan {
  tierId: SubscriptionTier;
  name: string;
  price: number;
  features: string[];
  limits: {
    uploads?: number;
    generations?: number;
    storage?: number;
  };
}

export interface Subscription {
  subscriptionId: string;
  userId: string;
  tierId: SubscriptionTier;
  status: SubscriptionStatus;
  startDate: string;
  endDate?: string;
  autoRenew: boolean;
  cancelledAt?: string;
}

export interface SubscribeRequest {
  tierId: SubscriptionTier;
  paymentMethod?: string;
}

export interface SubscribeResponse {
  success: boolean;
  subscription: Subscription;
  message: string;
}

export interface CancelSubscriptionResponse {
  success: boolean;
  subscription: Subscription;
  message: string;
}

export interface UpgradeSubscriptionRequest {
  newTierId: SubscriptionTier;
}

export interface UpgradeSubscriptionResponse {
  success: boolean;
  subscription: Subscription;
  message: string;
}

export interface SubscriptionStatusResponse {
  success: boolean;
  subscription: Subscription | null;
  plans: SubscriptionPlan[];
}

// ============================================================================
// KNOWLEDGE GRAPH TYPES
// ============================================================================

export type NodeType = 'content' | 'topic' | 'creator';

export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  weight: number;
  metadata?: Record<string, any>;
}

export interface GraphEdge {
  source: string;
  target: string;
  weight: number;
  type: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  timestamp?: string;
  source?: string;
}

export interface RelatedContent {
  id: string;
  title: string;
  similarity: number;
  type: string;
}

export interface RelatedContentResponse {
  contentId: string;
  recommendations: RelatedContent[];
  timestamp: string;
  source?: string;
}

// ============================================================================
// ANALYTICS DASHBOARD TYPES
// ============================================================================

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface Metric {
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export interface Insight {
  type: 'success' | 'warning' | 'info' | 'error';
  message: string;
  priority: 'high' | 'medium' | 'low';
  action?: string;
}

export interface PlatformPerformance {
  platform: Platform;
  metrics: {
    views: number;
    engagement: number;
    followers: number;
    posts: number;
  };
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
}

export interface AnalyticsDashboard {
  userId: string;
  dateRange: DateRange;
  metrics: Metric[];
  insights: Insight[];
  platformPerformance: PlatformPerformance[];
  lastUpdated: string;
}

export interface AnalyticsDashboardResponse {
  success: boolean;
  dashboard: AnalyticsDashboard;
  cached: boolean;
}

export interface MetricsResponse {
  success: boolean;
  metrics: Metric[];
  timestamp: string;
}

export interface InsightsResponse {
  success: boolean;
  insights: Insight[];
  timestamp: string;
}

export interface PlatformPerformanceResponse {
  success: boolean;
  platforms: PlatformPerformance[];
  timestamp: string;
}

export interface ExportAnalyticsResponse {
  success: boolean;
  downloadUrl: string;
  format: 'csv' | 'pdf';
  expiresAt: string;
}

