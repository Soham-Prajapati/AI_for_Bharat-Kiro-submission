/**
 * Safety & Moderation Service
 * 
 * Content moderation and compliance checking
 * - AWS Rekognition for image/video moderation
 * - AWS Bedrock for text moderation
 * - Platform guidelines compliance
 * - Brand safety checks
 * - Automated flagging and suggestions
 */

export interface SafetyCheckRequest {
  contentId: string;
  contentType: 'text' | 'image' | 'video' | 'audio';
  content?: string; // Text content or URL
  url?: string; // Media URL
  platforms?: string[]; // Target platforms for compliance check
  strictness?: 'low' | 'medium' | 'high'; // Moderation strictness
}

export interface Violation {
  violationId: string;
  category: 'explicit' | 'violence' | 'hate_speech' | 'harassment' | 'spam' | 'misinformation' | 'copyright' | 'privacy' | 'dangerous';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-100
  description: string;
  location?: {
    start?: number; // For text: character position
    end?: number;
    timestamp?: number; // For video: seconds
    boundingBox?: { // For image: coordinates
      left: number;
      top: number;
      width: number;
      height: number;
    };
  };
  platformViolations?: string[]; // Which platforms this violates
}

export interface SafetyCheckResult {
  checkId: string;
  contentId: string;
  safe: boolean;
  overallScore: number; // 0-100 (100 = completely safe)
  violations: Violation[];
  warnings: string[];
  suggestions: string[];
  platformCompliance: Record<string, {
    compliant: boolean;
    violations: string[];
    warnings: string[];
  }>;
  moderationLabels?: {
    label: string;
    confidence: number;
    parentLabel?: string;
  }[];
  checkedAt: string;
}

export class SafetyService {
  private checks: Map<string, SafetyCheckResult>;
  private platformGuidelines: Map<string, PlatformGuideline>;

  constructor() {
    this.checks = new Map();
    this.platformGuidelines = new Map();
    this.initializePlatformGuidelines();
  }

  // ============================================================================
  // MAIN SAFETY CHECK
  // ============================================================================

  /**
   * Check content safety and compliance
   */
  async checkSafety(request: SafetyCheckRequest): Promise<SafetyCheckResult> {
    const violations: Violation[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    let moderationLabels: SafetyCheckResult['moderationLabels'] = [];

    // Check based on content type
    if (request.contentType === 'text' && request.content) {
      const textResults = await this.checkTextSafety(request.content, request.strictness);
      violations.push(...textResults.violations);
      warnings.push(...textResults.warnings);
      moderationLabels.push(...textResults.labels);
    } else if (request.contentType === 'image' && request.url) {
      const imageResults = await this.checkImageSafety(request.url, request.strictness);
      violations.push(...imageResults.violations);
      warnings.push(...imageResults.warnings);
      moderationLabels.push(...imageResults.labels);
    } else if (request.contentType === 'video' && request.url) {
      const videoResults = await this.checkVideoSafety(request.url, request.strictness);
      violations.push(...videoResults.violations);
      warnings.push(...videoResults.warnings);
      moderationLabels.push(...videoResults.labels);
    }

    // Check platform compliance
    const platformCompliance = request.platforms
      ? this.checkPlatformCompliance(violations, request.platforms, request.content || '')
      : {};

    // Generate suggestions
    if (violations.length > 0) {
      suggestions.push(...this.generateSuggestions(violations));
    }

    // Calculate overall safety score
    const overallScore = this.calculateSafetyScore(violations);

    // Determine if content is safe
    const safe = violations.filter(v => v.severity === 'high' || v.severity === 'critical').length === 0;

    const result: SafetyCheckResult = {
      checkId: this.generateId('check'),
      contentId: request.contentId,
      safe,
      overallScore,
      violations,
      warnings,
      suggestions,
      platformCompliance,
      moderationLabels,
      checkedAt: new Date().toISOString(),
    };

    this.checks.set(result.checkId, result);
    return result;
  }

  // ============================================================================
  // TEXT MODERATION
  // ============================================================================

  /**
   * Check text content safety using AWS Bedrock
   */
  private async checkTextSafety(
    text: string,
    strictness: string = 'medium'
  ): Promise<{
    violations: Violation[];
    warnings: string[];
    labels: { label: string; confidence: number }[];
  }> {
    const violations: Violation[] = [];
    const warnings: string[] = [];
    const labels: { label: string; confidence: number }[] = [];

    // In production, use AWS Bedrock for AI-powered text moderation
    // For now, use rule-based detection

    // Check for explicit content
    const explicitPatterns = /\b(explicit|nsfw|adult|sexual|porn)\b/gi;
    if (explicitPatterns.test(text)) {
      violations.push({
        violationId: this.generateId('violation'),
        category: 'explicit',
        severity: 'high',
        confidence: 85,
        description: 'Potentially explicit or adult content detected',
        platformViolations: ['youtube', 'instagram', 'tiktok', 'linkedin'],
      });
      labels.push({ label: 'Explicit Content', confidence: 85 });
    }

    // Check for hate speech
    const hateSpeechPatterns = /\b(hate|racist|sexist|homophobic|discriminat)\w*/gi;
    if (hateSpeechPatterns.test(text)) {
      violations.push({
        violationId: this.generateId('violation'),
        category: 'hate_speech',
        severity: 'critical',
        confidence: 90,
        description: 'Potential hate speech or discriminatory language detected',
        platformViolations: ['youtube', 'instagram', 'tiktok', 'twitter', 'linkedin', 'facebook'],
      });
      labels.push({ label: 'Hate Speech', confidence: 90 });
    }

    // Check for violence
    const violencePatterns = /\b(kill|murder|attack|weapon|bomb|terror)\w*/gi;
    if (violencePatterns.test(text)) {
      violations.push({
        violationId: this.generateId('violation'),
        category: 'violence',
        severity: 'high',
        confidence: 80,
        description: 'Violent or threatening content detected',
        platformViolations: ['youtube', 'instagram', 'tiktok', 'facebook'],
      });
      labels.push({ label: 'Violence', confidence: 80 });
    }

    // Check for spam indicators
    const spamPatterns = /\b(click here|buy now|limited time|act now|free money|get rich)\b/gi;
    const spamMatches = text.match(spamPatterns);
    if (spamMatches && spamMatches.length >= 3) {
      violations.push({
        violationId: this.generateId('violation'),
        category: 'spam',
        severity: 'medium',
        confidence: 75,
        description: 'Content appears to be spam or overly promotional',
        platformViolations: ['twitter', 'linkedin', 'reddit'],
      });
      labels.push({ label: 'Spam', confidence: 75 });
    }

    // Check for misinformation indicators
    const misinfoPatterns = /\b(fake news|conspiracy|hoax|cover-up|they don't want you to know)\b/gi;
    if (misinfoPatterns.test(text)) {
      warnings.push('Content may contain unverified claims - consider adding sources');
      labels.push({ label: 'Potential Misinformation', confidence: 60 });
    }

    // Check for excessive caps (shouting)
    const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
    if (capsRatio > 0.5 && text.length > 50) {
      warnings.push('Excessive use of capital letters may be perceived as shouting');
    }

    // Check for profanity (mild warning)
    const profanityPatterns = /\b(damn|hell|crap|suck)\b/gi;
    if (profanityPatterns.test(text)) {
      warnings.push('Mild profanity detected - may not be suitable for all audiences');
    }

    return { violations, warnings, labels };
  }

  // ============================================================================
  // IMAGE MODERATION
  // ============================================================================

  /**
   * Check image safety using AWS Rekognition
   */
  private async checkImageSafety(
    imageUrl: string,
    strictness: string = 'medium'
  ): Promise<{
    violations: Violation[];
    warnings: string[];
    labels: { label: string; confidence: number; parentLabel?: string }[];
  }> {
    const violations: Violation[] = [];
    const warnings: string[] = [];
    const labels: { label: string; confidence: number; parentLabel?: string }[] = [];

    // In production, use AWS Rekognition DetectModerationLabels API
    // For now, return mock moderation results

    // Mock moderation labels (in production, these come from Rekognition)
    const mockLabels = [
      { label: 'Safe', confidence: 95, parentLabel: 'General' },
    ];

    // Simulate detection based on URL patterns (for testing)
    if (imageUrl.includes('explicit') || imageUrl.includes('nsfw')) {
      violations.push({
        violationId: this.generateId('violation'),
        category: 'explicit',
        severity: 'critical',
        confidence: 95,
        description: 'Explicit or suggestive content detected in image',
        platformViolations: ['youtube', 'instagram', 'tiktok', 'linkedin', 'facebook'],
      });
      labels.push({ label: 'Explicit Nudity', confidence: 95, parentLabel: 'Explicit' });
    }

    if (imageUrl.includes('violence') || imageUrl.includes('gore')) {
      violations.push({
        violationId: this.generateId('violation'),
        category: 'violence',
        severity: 'high',
        confidence: 90,
        description: 'Violent or graphic content detected in image',
        platformViolations: ['youtube', 'instagram', 'tiktok', 'facebook'],
      });
      labels.push({ label: 'Graphic Violence', confidence: 90, parentLabel: 'Violence' });
    }

    // Check for text in image (potential copyright or inappropriate text)
    if (imageUrl.includes('text')) {
      warnings.push('Text detected in image - ensure it complies with platform guidelines');
    }

    return { violations, warnings, labels: labels.length > 0 ? labels : mockLabels };
  }

  // ============================================================================
  // VIDEO MODERATION
  // ============================================================================

  /**
   * Check video safety using AWS Rekognition Video
   */
  private async checkVideoSafety(
    videoUrl: string,
    strictness: string = 'medium'
  ): Promise<{
    violations: Violation[];
    warnings: string[];
    labels: { label: string; confidence: number; parentLabel?: string }[];
  }> {
    const violations: Violation[] = [];
    const warnings: string[] = [];
    const labels: { label: string; confidence: number; parentLabel?: string }[] = [];

    // In production, use AWS Rekognition Video StartContentModeration API
    // For now, return mock results

    // Mock video moderation (in production, analyze each frame)
    const mockLabels = [
      { label: 'Safe Content', confidence: 92, parentLabel: 'General' },
    ];

    // Simulate detection based on URL patterns
    if (videoUrl.includes('explicit')) {
      violations.push({
        violationId: this.generateId('violation'),
        category: 'explicit',
        severity: 'critical',
        confidence: 93,
        description: 'Explicit content detected in video',
        location: { timestamp: 15 }, // At 15 seconds
        platformViolations: ['youtube', 'instagram', 'tiktok', 'linkedin', 'facebook'],
      });
      labels.push({ label: 'Suggestive Content', confidence: 93, parentLabel: 'Explicit' });
    }

    if (videoUrl.includes('violence')) {
      violations.push({
        violationId: this.generateId('violation'),
        category: 'violence',
        severity: 'high',
        confidence: 88,
        description: 'Violent content detected in video',
        location: { timestamp: 30 }, // At 30 seconds
        platformViolations: ['youtube', 'instagram', 'tiktok', 'facebook'],
      });
      labels.push({ label: 'Violence', confidence: 88, parentLabel: 'Violence' });
    }

    // Check video duration (some platforms have limits)
    warnings.push('Ensure video duration complies with platform limits (TikTok: 10min, Instagram Reels: 90s)');

    return { violations, warnings, labels: labels.length > 0 ? labels : mockLabels };
  }

  // ============================================================================
  // PLATFORM COMPLIANCE
  // ============================================================================

  /**
   * Check compliance with platform-specific guidelines
   */
  private checkPlatformCompliance(
    violations: Violation[],
    platforms: string[],
    content: string
  ): Record<string, { compliant: boolean; violations: string[]; warnings: string[] }> {
    const compliance: Record<string, { compliant: boolean; violations: string[]; warnings: string[] }> = {};

    for (const platform of platforms) {
      const guideline = this.platformGuidelines.get(platform);
      if (!guideline) {
        compliance[platform] = {
          compliant: true,
          violations: [],
          warnings: ['Platform guidelines not available'],
        };
        continue;
      }

      const platformViolations: string[] = [];
      const platformWarnings: string[] = [];

      // Check if any violations affect this platform
      violations.forEach(violation => {
        if (violation.platformViolations?.includes(platform)) {
          platformViolations.push(`${violation.category}: ${violation.description}`);
        }
      });

      // Check platform-specific rules
      if (guideline.maxTextLength && content.length > guideline.maxTextLength) {
        platformWarnings.push(`Content exceeds ${platform} character limit (${guideline.maxTextLength})`);
      }

      if (guideline.requiresAgeGate && violations.some(v => v.category === 'explicit')) {
        platformWarnings.push(`Content may require age gate on ${platform}`);
      }

      if (guideline.bannedKeywords) {
        const foundBanned = guideline.bannedKeywords.filter(keyword =>
          content.toLowerCase().includes(keyword.toLowerCase())
        );
        if (foundBanned.length > 0) {
          platformViolations.push(`Banned keywords detected: ${foundBanned.join(', ')}`);
        }
      }

      compliance[platform] = {
        compliant: platformViolations.length === 0,
        violations: platformViolations,
        warnings: platformWarnings,
      };
    }

    return compliance;
  }

  // ============================================================================
  // SCORING & SUGGESTIONS
  // ============================================================================

  /**
   * Calculate overall safety score
   */
  private calculateSafetyScore(violations: Violation[]): number {
    if (violations.length === 0) return 100;

    let deductions = 0;
    violations.forEach(violation => {
      switch (violation.severity) {
        case 'critical':
          deductions += 40;
          break;
        case 'high':
          deductions += 25;
          break;
        case 'medium':
          deductions += 15;
          break;
        case 'low':
          deductions += 5;
          break;
      }
    });

    return Math.max(0, 100 - deductions);
  }

  /**
   * Generate suggestions to fix violations
   */
  private generateSuggestions(violations: Violation[]): string[] {
    const suggestions: string[] = [];
    const categories = new Set(violations.map(v => v.category));

    if (categories.has('explicit')) {
      suggestions.push('Remove or blur explicit content');
      suggestions.push('Add age restriction if content is educational');
      suggestions.push('Consider using more appropriate language or imagery');
    }

    if (categories.has('hate_speech')) {
      suggestions.push('Remove discriminatory or hateful language');
      suggestions.push('Rephrase content to be more inclusive');
      suggestions.push('Review content for unintentional bias');
    }

    if (categories.has('violence')) {
      suggestions.push('Remove or reduce violent imagery');
      suggestions.push('Add content warnings if violence is contextually necessary');
      suggestions.push('Consider alternative ways to convey your message');
    }

    if (categories.has('spam')) {
      suggestions.push('Reduce promotional language');
      suggestions.push('Focus on providing value rather than selling');
      suggestions.push('Remove excessive calls-to-action');
    }

    if (categories.has('misinformation')) {
      suggestions.push('Add credible sources to support claims');
      suggestions.push('Clearly label opinions vs facts');
      suggestions.push('Verify information before publishing');
    }

    return suggestions.slice(0, 5); // Top 5 suggestions
  }

  // ============================================================================
  // PLATFORM GUIDELINES
  // ============================================================================

  /**
   * Initialize platform-specific guidelines
   */
  private initializePlatformGuidelines(): void {
    this.platformGuidelines.set('youtube', {
      platform: 'youtube',
      maxTextLength: 5000,
      requiresAgeGate: true,
      bannedKeywords: ['spam', 'scam', 'fake'],
      allowsExplicit: false,
      allowsViolence: false,
      allowsPolitical: true,
    });

    this.platformGuidelines.set('instagram', {
      platform: 'instagram',
      maxTextLength: 2200,
      requiresAgeGate: true,
      bannedKeywords: ['follow for follow', 'like for like'],
      allowsExplicit: false,
      allowsViolence: false,
      allowsPolitical: true,
    });

    this.platformGuidelines.set('tiktok', {
      platform: 'tiktok',
      maxTextLength: 2200,
      requiresAgeGate: true,
      bannedKeywords: ['18+', 'adult only'],
      allowsExplicit: false,
      allowsViolence: false,
      allowsPolitical: true,
    });

    this.platformGuidelines.set('twitter', {
      platform: 'twitter',
      maxTextLength: 280,
      requiresAgeGate: false,
      bannedKeywords: [],
      allowsExplicit: true, // With sensitive content warning
      allowsViolence: false,
      allowsPolitical: true,
    });

    this.platformGuidelines.set('linkedin', {
      platform: 'linkedin',
      maxTextLength: 3000,
      requiresAgeGate: false,
      bannedKeywords: ['get rich quick', 'mlm'],
      allowsExplicit: false,
      allowsViolence: false,
      allowsPolitical: true,
    });

    this.platformGuidelines.set('facebook', {
      platform: 'facebook',
      maxTextLength: 63206,
      requiresAgeGate: true,
      bannedKeywords: ['clickbait'],
      allowsExplicit: false,
      allowsViolence: false,
      allowsPolitical: true,
    });
  }

  // ============================================================================
  // RETRIEVAL METHODS
  // ============================================================================

  /**
   * Get safety check result by ID
   */
  getCheck(checkId: string): SafetyCheckResult | null {
    return this.checks.get(checkId) || null;
  }

  /**
   * Get all checks for content
   */
  getContentChecks(contentId: string): SafetyCheckResult[] {
    return Array.from(this.checks.values())
      .filter(check => check.contentId === contentId)
      .sort((a, b) => new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime());
  }

  /**
   * Get platform guidelines
   */
  getPlatformGuidelines(platform: string): PlatformGuideline | null {
    return this.platformGuidelines.get(platform) || null;
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

interface PlatformGuideline {
  platform: string;
  maxTextLength?: number;
  requiresAgeGate: boolean;
  bannedKeywords: string[];
  allowsExplicit: boolean;
  allowsViolence: boolean;
  allowsPolitical: boolean;
}

export const safetyService = new SafetyService();
