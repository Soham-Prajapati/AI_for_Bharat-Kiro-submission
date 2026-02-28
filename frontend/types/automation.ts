/**
 * Comprehensive Automation Types
 * Enhanced TypeScript interfaces for AutomationBuilder component
 */

// ============================================================================
// CORE AUTOMATION TYPES
// ============================================================================

export type AutomationStatus = 'active' | 'paused' | 'deleted' | 'error';

export interface Automation {
  automationId: string;
  userId: string;
  name: string;
  description?: string;
  trigger: AutomationTrigger;
  conditions?: AutomationCondition[];
  actions: AutomationAction[];
  enabled: boolean;
  status: AutomationStatus;
  createdAt: string;
  updatedAt?: string;
  lastRunAt?: string;
  nextRunAt?: string;
  runCount?: number;
  errorCount?: number;
}

// ============================================================================
// TRIGGER TYPES
// ============================================================================

export type TriggerType = 'schedule' | 'event' | 'manual' | 'webhook' | 'content_ready';

export interface BaseTrigger {
  type: TriggerType;
  enabled: boolean;
}

export interface ScheduleTrigger extends BaseTrigger {
  type: 'schedule';
  cron: string;
  timezone?: string;
  description?: string;
}

export interface EventTrigger extends BaseTrigger {
  type: 'event';
  event: EventType;
  filters?: Record<string, any>;
}

export interface ManualTrigger extends BaseTrigger {
  type: 'manual';
}

export interface WebhookTrigger extends BaseTrigger {
  type: 'webhook';
  webhookUrl: string;
  secret?: string;
  method?: 'POST' | 'GET';
}

export interface ContentReadyTrigger extends BaseTrigger {
  type: 'content_ready';
  contentType?: 'video' | 'image' | 'text' | 'audio';
  minQualityScore?: number;
}

export type AutomationTrigger =
  | ScheduleTrigger
  | EventTrigger
  | ManualTrigger
  | WebhookTrigger
  | ContentReadyTrigger;

// ============================================================================
// EVENT TYPES
// ============================================================================

export type EventType =
  | 'content_generated'
  | 'upload_completed'
  | 'viral_score_threshold'
  | 'engagement_milestone'
  | 'follower_milestone'
  | 'trend_detected'
  | 'platform_connected'
  | 'subscription_changed';

export interface EventConfig {
  type: EventType;
  label: string;
  description: string;
  availableFilters: FilterConfig[];
}

export interface FilterConfig {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  options?: Array<{ value: string; label: string }>;
}

// ============================================================================
// CONDITION TYPES
// ============================================================================

export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'less_than'
  | 'contains'
  | 'not_contains'
  | 'in'
  | 'not_in'
  | 'exists'
  | 'not_exists';

export type ConditionLogic = 'AND' | 'OR';

export interface AutomationCondition {
  id: string;
  field: string;
  operator: ConditionOperator;
  value: any;
  logic?: ConditionLogic;
}

export interface ConditionGroup {
  id: string;
  logic: ConditionLogic;
  conditions: AutomationCondition[];
}

// ============================================================================
// ACTION TYPES
// ============================================================================

export type ActionType =
  | 'post'
  | 'generate'
  | 'notify'
  | 'webhook'
  | 'email'
  | 'analyze'
  | 'multiply'
  | 'adapt_cultural'
  | 'train_voice'
  | 'update_analytics';

export interface BaseAction {
  id: string;
  type: ActionType;
  enabled: boolean;
  order: number;
  retryOnFailure?: boolean;
  maxRetries?: number;
}

export interface PostAction extends BaseAction {
  type: 'post';
  platform: Platform;
  connectionId?: string;
  content: {
    title?: string;
    description?: string;
    caption?: string;
    hashtags?: string[];
    mediaUrl?: string;
  };
  scheduledTime?: string;
}

export interface GenerateAction extends BaseAction {
  type: 'generate';
  contentType: 'caption' | 'script' | 'description' | 'hashtags' | 'full';
  platforms: Platform[];
  language?: string;
  creatorMode?: 'hybrid' | 'authentic' | 'optimized';
  sourceContentId?: string;
}

export interface NotifyAction extends BaseAction {
  type: 'notify';
  channel: 'email' | 'sms' | 'push' | 'in_app';
  recipients: string[];
  template?: string;
  message: string;
  subject?: string;
}

export interface WebhookAction extends BaseAction {
  type: 'webhook';
  url: string;
  method: 'POST' | 'GET' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
  body?: Record<string, any>;
  authentication?: {
    type: 'bearer' | 'basic' | 'api_key';
    credentials: Record<string, string>;
  };
}

export interface EmailAction extends BaseAction {
  type: 'email';
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  attachments?: string[];
}

export interface AnalyzeAction extends BaseAction {
  type: 'analyze';
  analysisType: 'viral' | 'content' | 'dna' | 'engagement';
  contentId: string;
  saveResults?: boolean;
}

export interface MultiplyAction extends BaseAction {
  type: 'multiply';
  videoId: string;
  platforms: Platform[];
  generateClips?: boolean;
  generateQuotes?: boolean;
  generateAudiograms?: boolean;
}

export interface CulturalAdaptAction extends BaseAction {
  type: 'adapt_cultural';
  contentId: string;
  targetRegions: string[];
  autoPost?: boolean;
}

export interface VoiceTrainAction extends BaseAction {
  type: 'train_voice';
  sampleUrls: string[];
  modelName?: string;
}

export interface UpdateAnalyticsAction extends BaseAction {
  type: 'update_analytics';
  platforms?: Platform[];
  forceRefresh?: boolean;
}

export type AutomationAction =
  | PostAction
  | GenerateAction
  | NotifyAction
  | WebhookAction
  | EmailAction
  | AnalyzeAction
  | MultiplyAction
  | CulturalAdaptAction
  | VoiceTrainAction
  | UpdateAnalyticsAction;

// ============================================================================
// PLATFORM TYPES
// ============================================================================

export type Platform =
  | 'youtube'
  | 'instagram'
  | 'tiktok'
  | 'linkedin'
  | 'twitter'
  | 'facebook'
  | 'pinterest'
  | 'snapchat';

export interface PlatformConfig {
  platform: Platform;
  label: string;
  icon: string;
  color: string;
  supportedContentTypes: string[];
  maxCaptionLength?: number;
  maxHashtags?: number;
  requiresConnection: boolean;
}

// ============================================================================
// AUTOMATION EXECUTION TYPES
// ============================================================================

export interface AutomationExecution {
  executionId: string;
  automationId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: string;
  completedAt?: string;
  duration?: number;
  triggeredBy: 'schedule' | 'event' | 'manual' | 'webhook';
  results: ExecutionResult[];
  error?: ExecutionError;
}

export interface ExecutionResult {
  actionId: string;
  actionType: ActionType;
  status: 'success' | 'failed' | 'skipped';
  output?: any;
  error?: string;
  duration: number;
  timestamp: string;
}

export interface ExecutionError {
  code: string;
  message: string;
  actionId?: string;
  details?: any;
  timestamp: string;
}

// ============================================================================
// AUTOMATION TEMPLATE TYPES
// ============================================================================

export interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  icon: string;
  trigger: Partial<AutomationTrigger>;
  actions: Partial<AutomationAction>[];
  tags: string[];
  popularity?: number;
  usageCount?: number;
}

export type TemplateCategory =
  | 'content_publishing'
  | 'analytics'
  | 'engagement'
  | 'notifications'
  | 'workflow'
  | 'integration';

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface CreateAutomationRequest {
  userId: string;
  name: string;
  description?: string;
  trigger: AutomationTrigger;
  conditions?: AutomationCondition[];
  actions: AutomationAction[];
  enabled?: boolean;
}

export interface UpdateAutomationRequest {
  name?: string;
  description?: string;
  trigger?: AutomationTrigger;
  conditions?: AutomationCondition[];
  actions?: AutomationAction[];
  enabled?: boolean;
}

export interface ListAutomationsRequest {
  userId: string;
  status?: AutomationStatus;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'runCount';
  sortOrder?: 'asc' | 'desc';
}

export interface ListAutomationsResponse {
  automations: Automation[];
  total: number;
  limit: number;
  offset: number;
}

export interface DeleteAutomationResponse {
  automationId: string;
  status: 'deleted';
  deletedAt: string;
}

export interface TestAutomationRequest {
  automationId: string;
  dryRun?: boolean;
  mockData?: Record<string, any>;
}

export interface TestAutomationResponse {
  success: boolean;
  executionId: string;
  results: ExecutionResult[];
  duration: number;
  errors?: ExecutionError[];
}

export interface ToggleAutomationRequest {
  automationId: string;
  enabled: boolean;
}

export interface ToggleAutomationResponse {
  automationId: string;
  enabled: boolean;
  updatedAt: string;
}

export interface GetAutomationHistoryRequest {
  automationId: string;
  limit?: number;
  offset?: number;
  status?: 'completed' | 'failed' | 'cancelled';
}

export interface GetAutomationHistoryResponse {
  executions: AutomationExecution[];
  total: number;
  limit: number;
  offset: number;
}

// ============================================================================
// UI STATE TYPES
// ============================================================================

export interface AutomationBuilderState {
  currentStep: 'trigger' | 'conditions' | 'actions' | 'review';
  automation: Partial<Automation>;
  isDirty: boolean;
  isValid: boolean;
  isSaving: boolean;
  isTesting: boolean;
  validationErrors: ValidationError[];
  testResults?: TestAutomationResponse;
}

export interface AutomationListState {
  automations: Automation[];
  loading: boolean;
  error: string | null;
  filters: {
    status?: AutomationStatus;
    search?: string;
  };
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
  selectedAutomation?: Automation;
}

// ============================================================================
// CRON HELPER TYPES
// ============================================================================

export interface CronExpression {
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
}

export interface CronPreset {
  label: string;
  description: string;
  expression: string;
}

export const CRON_PRESETS: CronPreset[] = [
  { label: 'Every hour', description: 'Runs at the start of every hour', expression: '0 * * * *' },
  { label: 'Every day at 9 AM', description: 'Runs daily at 9:00 AM', expression: '0 9 * * *' },
  { label: 'Every Monday at 9 AM', description: 'Runs every Monday at 9:00 AM', expression: '0 9 * * 1' },
  { label: 'Every weekday at 9 AM', description: 'Runs Monday-Friday at 9:00 AM', expression: '0 9 * * 1-5' },
  { label: 'Every Sunday at midnight', description: 'Runs every Sunday at 12:00 AM', expression: '0 0 * * 0' },
  { label: 'First day of month at 9 AM', description: 'Runs on the 1st of each month at 9:00 AM', expression: '0 9 1 * *' },
  { label: 'Every 15 minutes', description: 'Runs every 15 minutes', expression: '*/15 * * * *' },
  { label: 'Every 6 hours', description: 'Runs every 6 hours', expression: '0 */6 * * *' },
];

// ============================================================================
// ACTION CONFIGURATION TYPES
// ============================================================================

export interface ActionConfig {
  type: ActionType;
  label: string;
  description: string;
  icon: string;
  category: 'content' | 'communication' | 'analytics' | 'integration';
  requiresPlatformConnection?: boolean;
  configFields: ActionConfigField[];
}

export interface ActionConfigField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'number' | 'boolean' | 'url' | 'email';
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}
