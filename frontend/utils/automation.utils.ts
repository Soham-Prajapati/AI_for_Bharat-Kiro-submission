/**
 * Automation Utilities
 * Helper functions for automation management
 */

import {
  CronExpression,
  CronPreset,
  CRON_PRESETS,
  ActionConfig,
  ActionType,
  EventConfig,
  EventType,
  Platform,
  PlatformConfig,
} from '@/types/automation';

// ============================================================================
// CRON UTILITIES
// ============================================================================

/**
 * Parse cron expression into components
 */
export function parseCronExpression(cron: string): CronExpression | null {
  const parts = cron.trim().split(/\s+/);
  
  if (parts.length !== 5) {
    return null;
  }

  return {
    minute: parts[0],
    hour: parts[1],
    dayOfMonth: parts[2],
    month: parts[3],
    dayOfWeek: parts[4],
  };
}

/**
 * Build cron expression from components
 */
export function buildCronExpression(expr: CronExpression): string {
  return `${expr.minute} ${expr.hour} ${expr.dayOfMonth} ${expr.month} ${expr.dayOfWeek}`;
}

/**
 * Get human-readable description of cron expression
 */
export function describeCronExpression(cron: string): string {
  // Check if it matches a preset
  const preset = CRON_PRESETS.find((p) => p.expression === cron);
  if (preset) {
    return preset.description;
  }

  const expr = parseCronExpression(cron);
  if (!expr) {
    return 'Invalid cron expression';
  }

  const parts: string[] = [];

  // Minute
  if (expr.minute === '*') {
    parts.push('every minute');
  } else if (expr.minute.startsWith('*/')) {
    parts.push(`every ${expr.minute.slice(2)} minutes`);
  } else {
    parts.push(`at minute ${expr.minute}`);
  }

  // Hour
  if (expr.hour !== '*') {
    if (expr.hour.startsWith('*/')) {
      parts.push(`every ${expr.hour.slice(2)} hours`);
    } else {
      const hour = parseInt(expr.hour);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      parts.push(`at ${displayHour}:00 ${ampm}`);
    }
  }

  // Day of week
  if (expr.dayOfWeek !== '*') {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    if (expr.dayOfWeek.includes('-')) {
      const [start, end] = expr.dayOfWeek.split('-').map(Number);
      parts.push(`${days[start]} through ${days[end]}`);
    } else {
      parts.push(`on ${days[parseInt(expr.dayOfWeek)]}`);
    }
  }

  // Day of month
  if (expr.dayOfMonth !== '*') {
    parts.push(`on day ${expr.dayOfMonth} of the month`);
  }

  return parts.join(', ');
}

/**
 * Validate cron expression
 */
export function isValidCronExpression(cron: string): boolean {
  const expr = parseCronExpression(cron);
  if (!expr) return false;

  const validatePart = (part: string, min: number, max: number): boolean => {
    if (part === '*') return true;
    if (part.startsWith('*/')) {
      const step = parseInt(part.slice(2));
      return !isNaN(step) && step > 0 && step <= max;
    }
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number);
      return !isNaN(start) && !isNaN(end) && start >= min && end <= max && start < end;
    }
    if (part.includes(',')) {
      return part.split(',').every((p) => validatePart(p.trim(), min, max));
    }
    const num = parseInt(part);
    return !isNaN(num) && num >= min && num <= max;
  };

  return (
    validatePart(expr.minute, 0, 59) &&
    validatePart(expr.hour, 0, 23) &&
    validatePart(expr.dayOfMonth, 1, 31) &&
    validatePart(expr.month, 1, 12) &&
    validatePart(expr.dayOfWeek, 0, 6)
  );
}

/**
 * Get next execution time for cron expression
 */
export function getNextExecutionTime(cron: string): Date | null {
  // This is a simplified version. In production, use a library like 'cron-parser'
  try {
    const expr = parseCronExpression(cron);
    if (!expr) return null;

    const now = new Date();
    const next = new Date(now);

    // Simple logic for common cases
    if (expr.minute !== '*') {
      next.setMinutes(parseInt(expr.minute));
    }
    if (expr.hour !== '*') {
      next.setHours(parseInt(expr.hour));
    }

    // If the time has passed today, move to tomorrow
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }

    return next;
  } catch {
    return null;
  }
}

// ============================================================================
// ACTION CONFIGURATION
// ============================================================================

/**
 * Get configuration for action type
 */
export function getActionConfig(type: ActionType): ActionConfig {
  const configs: Record<ActionType, ActionConfig> = {
    post: {
      type: 'post',
      label: 'Post to Platform',
      description: 'Publish content to a social media platform',
      icon: '📤',
      category: 'content',
      requiresPlatformConnection: true,
      configFields: [
        {
          key: 'platform',
          label: 'Platform',
          type: 'select',
          required: true,
          options: [
            { value: 'instagram', label: 'Instagram' },
            { value: 'tiktok', label: 'TikTok' },
            { value: 'youtube', label: 'YouTube' },
            { value: 'twitter', label: 'Twitter' },
            { value: 'linkedin', label: 'LinkedIn' },
            { value: 'facebook', label: 'Facebook' },
          ],
        },
        {
          key: 'content.caption',
          label: 'Caption',
          type: 'textarea',
          required: true,
          placeholder: 'Enter your caption...',
        },
        {
          key: 'content.hashtags',
          label: 'Hashtags',
          type: 'text',
          required: false,
          placeholder: '#example #hashtags',
          helpText: 'Separate hashtags with spaces',
        },
      ],
    },
    generate: {
      type: 'generate',
      label: 'Generate Content',
      description: 'Generate content using AI',
      icon: '✨',
      category: 'content',
      configFields: [
        {
          key: 'contentType',
          label: 'Content Type',
          type: 'select',
          required: true,
          options: [
            { value: 'caption', label: 'Caption' },
            { value: 'script', label: 'Script' },
            { value: 'description', label: 'Description' },
            { value: 'hashtags', label: 'Hashtags' },
            { value: 'full', label: 'Full Content' },
          ],
        },
        {
          key: 'platforms',
          label: 'Target Platforms',
          type: 'multiselect',
          required: true,
          options: [
            { value: 'instagram', label: 'Instagram' },
            { value: 'tiktok', label: 'TikTok' },
            { value: 'youtube', label: 'YouTube' },
          ],
        },
        {
          key: 'creatorMode',
          label: 'Creator Mode',
          type: 'select',
          required: false,
          options: [
            { value: 'hybrid', label: 'Hybrid' },
            { value: 'authentic', label: 'Authentic' },
            { value: 'optimized', label: 'Optimized' },
          ],
        },
      ],
    },
    notify: {
      type: 'notify',
      label: 'Send Notification',
      description: 'Send a notification to users',
      icon: '🔔',
      category: 'communication',
      configFields: [
        {
          key: 'channel',
          label: 'Channel',
          type: 'select',
          required: true,
          options: [
            { value: 'email', label: 'Email' },
            { value: 'sms', label: 'SMS' },
            { value: 'push', label: 'Push Notification' },
            { value: 'in_app', label: 'In-App' },
          ],
        },
        {
          key: 'message',
          label: 'Message',
          type: 'textarea',
          required: true,
          placeholder: 'Enter your message...',
        },
        {
          key: 'recipients',
          label: 'Recipients',
          type: 'text',
          required: true,
          placeholder: 'user@example.com',
          helpText: 'Separate multiple recipients with commas',
        },
      ],
    },
    webhook: {
      type: 'webhook',
      label: 'Call Webhook',
      description: 'Send HTTP request to external service',
      icon: '🔗',
      category: 'integration',
      configFields: [
        {
          key: 'url',
          label: 'Webhook URL',
          type: 'url',
          required: true,
          placeholder: 'https://example.com/webhook',
          validation: {
            pattern: '^https?://.+',
            message: 'Must be a valid URL',
          },
        },
        {
          key: 'method',
          label: 'HTTP Method',
          type: 'select',
          required: true,
          options: [
            { value: 'POST', label: 'POST' },
            { value: 'GET', label: 'GET' },
            { value: 'PUT', label: 'PUT' },
            { value: 'PATCH', label: 'PATCH' },
          ],
        },
      ],
    },
    email: {
      type: 'email',
      label: 'Send Email',
      description: 'Send an email message',
      icon: '📧',
      category: 'communication',
      configFields: [
        {
          key: 'to',
          label: 'To',
          type: 'text',
          required: true,
          placeholder: 'recipient@example.com',
        },
        {
          key: 'subject',
          label: 'Subject',
          type: 'text',
          required: true,
          placeholder: 'Email subject',
        },
        {
          key: 'body',
          label: 'Body',
          type: 'textarea',
          required: true,
          placeholder: 'Email content...',
        },
      ],
    },
    analyze: {
      type: 'analyze',
      label: 'Analyze Content',
      description: 'Analyze content for insights',
      icon: '📊',
      category: 'analytics',
      configFields: [
        {
          key: 'analysisType',
          label: 'Analysis Type',
          type: 'select',
          required: true,
          options: [
            { value: 'viral', label: 'Viral Potential' },
            { value: 'content', label: 'Content Quality' },
            { value: 'dna', label: 'Creator DNA' },
            { value: 'engagement', label: 'Engagement Prediction' },
          ],
        },
      ],
    },
    multiply: {
      type: 'multiply',
      label: 'Multiply Content',
      description: 'Create multiple content variations',
      icon: '🔄',
      category: 'content',
      configFields: [
        {
          key: 'platforms',
          label: 'Target Platforms',
          type: 'multiselect',
          required: true,
          options: [
            { value: 'instagram', label: 'Instagram' },
            { value: 'tiktok', label: 'TikTok' },
            { value: 'youtube', label: 'YouTube' },
          ],
        },
        {
          key: 'generateClips',
          label: 'Generate Clips',
          type: 'boolean',
          required: false,
        },
        {
          key: 'generateQuotes',
          label: 'Generate Quotes',
          type: 'boolean',
          required: false,
        },
      ],
    },
    adapt_cultural: {
      type: 'adapt_cultural',
      label: 'Cultural Adaptation',
      description: 'Adapt content for different regions',
      icon: '🌍',
      category: 'content',
      configFields: [
        {
          key: 'targetRegions',
          label: 'Target Regions',
          type: 'multiselect',
          required: true,
          options: [
            { value: 'US', label: 'United States' },
            { value: 'UK', label: 'United Kingdom' },
            { value: 'JP', label: 'Japan' },
            { value: 'BR', label: 'Brazil' },
            { value: 'IN', label: 'India' },
          ],
        },
      ],
    },
    train_voice: {
      type: 'train_voice',
      label: 'Train Voice Model',
      description: 'Train a custom voice model',
      icon: '🎤',
      category: 'content',
      configFields: [
        {
          key: 'modelName',
          label: 'Model Name',
          type: 'text',
          required: false,
          placeholder: 'My Voice Model',
        },
      ],
    },
    update_analytics: {
      type: 'update_analytics',
      label: 'Update Analytics',
      description: 'Refresh analytics data',
      icon: '📈',
      category: 'analytics',
      configFields: [
        {
          key: 'forceRefresh',
          label: 'Force Refresh',
          type: 'boolean',
          required: false,
          helpText: 'Bypass cache and fetch fresh data',
        },
      ],
    },
  };

  return configs[type];
}

/**
 * Get all available action types
 */
export function getAvailableActions(): ActionConfig[] {
  const types: ActionType[] = [
    'post',
    'generate',
    'notify',
    'webhook',
    'email',
    'analyze',
    'multiply',
    'adapt_cultural',
    'train_voice',
    'update_analytics',
  ];

  return types.map((type) => getActionConfig(type));
}

// ============================================================================
// EVENT CONFIGURATION
// ============================================================================

/**
 * Get configuration for event type
 */
export function getEventConfig(type: EventType): EventConfig {
  const configs: Record<EventType, EventConfig> = {
    content_generated: {
      type: 'content_generated',
      label: 'Content Generated',
      description: 'Triggered when new content is generated',
      availableFilters: [
        {
          key: 'platform',
          label: 'Platform',
          type: 'select',
          options: [
            { value: 'instagram', label: 'Instagram' },
            { value: 'tiktok', label: 'TikTok' },
            { value: 'youtube', label: 'YouTube' },
          ],
        },
      ],
    },
    upload_completed: {
      type: 'upload_completed',
      label: 'Upload Completed',
      description: 'Triggered when a file upload completes',
      availableFilters: [
        {
          key: 'fileType',
          label: 'File Type',
          type: 'select',
          options: [
            { value: 'video', label: 'Video' },
            { value: 'image', label: 'Image' },
            { value: 'audio', label: 'Audio' },
          ],
        },
      ],
    },
    viral_score_threshold: {
      type: 'viral_score_threshold',
      label: 'Viral Score Threshold',
      description: 'Triggered when viral score exceeds threshold',
      availableFilters: [
        {
          key: 'threshold',
          label: 'Threshold',
          type: 'number',
        },
      ],
    },
    engagement_milestone: {
      type: 'engagement_milestone',
      label: 'Engagement Milestone',
      description: 'Triggered when engagement reaches milestone',
      availableFilters: [
        {
          key: 'milestone',
          label: 'Milestone',
          type: 'number',
        },
      ],
    },
    follower_milestone: {
      type: 'follower_milestone',
      label: 'Follower Milestone',
      description: 'Triggered when follower count reaches milestone',
      availableFilters: [
        {
          key: 'milestone',
          label: 'Milestone',
          type: 'number',
        },
      ],
    },
    trend_detected: {
      type: 'trend_detected',
      label: 'Trend Detected',
      description: 'Triggered when a new trend is detected',
      availableFilters: [
        {
          key: 'category',
          label: 'Category',
          type: 'string',
        },
      ],
    },
    platform_connected: {
      type: 'platform_connected',
      label: 'Platform Connected',
      description: 'Triggered when a platform is connected',
      availableFilters: [
        {
          key: 'platform',
          label: 'Platform',
          type: 'select',
          options: [
            { value: 'instagram', label: 'Instagram' },
            { value: 'tiktok', label: 'TikTok' },
            { value: 'youtube', label: 'YouTube' },
          ],
        },
      ],
    },
    subscription_changed: {
      type: 'subscription_changed',
      label: 'Subscription Changed',
      description: 'Triggered when subscription status changes',
      availableFilters: [
        {
          key: 'tier',
          label: 'Tier',
          type: 'select',
          options: [
            { value: 'free', label: 'Free' },
            { value: 'basic', label: 'Basic' },
            { value: 'pro', label: 'Pro' },
            { value: 'enterprise', label: 'Enterprise' },
          ],
        },
      ],
    },
  };

  return configs[type];
}

/**
 * Get all available event types
 */
export function getAvailableEvents(): EventConfig[] {
  const types: EventType[] = [
    'content_generated',
    'upload_completed',
    'viral_score_threshold',
    'engagement_milestone',
    'follower_milestone',
    'trend_detected',
    'platform_connected',
    'subscription_changed',
  ];

  return types.map((type) => getEventConfig(type));
}

// ============================================================================
// PLATFORM CONFIGURATION
// ============================================================================

/**
 * Get platform configuration
 */
export function getPlatformConfig(platform: Platform): PlatformConfig {
  const configs: Record<Platform, PlatformConfig> = {
    instagram: {
      platform: 'instagram',
      label: 'Instagram',
      icon: '📷',
      color: '#E4405F',
      supportedContentTypes: ['image', 'video', 'carousel'],
      maxCaptionLength: 2200,
      maxHashtags: 30,
      requiresConnection: true,
    },
    tiktok: {
      platform: 'tiktok',
      label: 'TikTok',
      icon: '🎵',
      color: '#000000',
      supportedContentTypes: ['video'],
      maxCaptionLength: 150,
      maxHashtags: 10,
      requiresConnection: true,
    },
    youtube: {
      platform: 'youtube',
      label: 'YouTube',
      icon: '▶️',
      color: '#FF0000',
      supportedContentTypes: ['video'],
      maxCaptionLength: 5000,
      maxHashtags: 15,
      requiresConnection: true,
    },
    twitter: {
      platform: 'twitter',
      label: 'Twitter',
      icon: '🐦',
      color: '#1DA1F2',
      supportedContentTypes: ['text', 'image', 'video'],
      maxCaptionLength: 280,
      maxHashtags: 10,
      requiresConnection: true,
    },
    linkedin: {
      platform: 'linkedin',
      label: 'LinkedIn',
      icon: '💼',
      color: '#0A66C2',
      supportedContentTypes: ['text', 'image', 'video', 'article'],
      maxCaptionLength: 3000,
      maxHashtags: 10,
      requiresConnection: true,
    },
    facebook: {
      platform: 'facebook',
      label: 'Facebook',
      icon: '👍',
      color: '#1877F2',
      supportedContentTypes: ['text', 'image', 'video'],
      maxCaptionLength: 63206,
      maxHashtags: 30,
      requiresConnection: true,
    },
    pinterest: {
      platform: 'pinterest',
      label: 'Pinterest',
      icon: '📌',
      color: '#E60023',
      supportedContentTypes: ['image'],
      maxCaptionLength: 500,
      maxHashtags: 20,
      requiresConnection: true,
    },
    snapchat: {
      platform: 'snapchat',
      label: 'Snapchat',
      icon: '👻',
      color: '#FFFC00',
      supportedContentTypes: ['image', 'video'],
      maxCaptionLength: 250,
      requiresConnection: true,
    },
  };

  return configs[platform];
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format duration in milliseconds to human-readable string
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
  return `${(ms / 3600000).toFixed(1)}h`;
}

/**
 * Generate unique ID
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
