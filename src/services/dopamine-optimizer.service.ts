/**
 * Dopamine Optimizer Service
 * Optimizes content for maximum engagement by analyzing and enhancing dopamine triggers
 * Focuses on hooks, emotional peaks, pacing, cliffhangers, and retention patterns
 */

import { GitHubModelsService } from './github-models.service';

interface ContentAnalysisRequest {
  content: string;
  contentType: 'video_script' | 'social_post' | 'blog' | 'email';
  duration?: number; // seconds (for video)
  targetPlatform?: 'youtube' | 'instagram' | 'tiktok' | 'twitter' | 'linkedin';
}

interface DopamineOptimizationResult {
  overallScore: number; // 0-100
  hooks: Hook[];
  emotionalPeaks: EmotionalPeak[];
  pacingAnalysis: PacingAnalysis;
  cliffhangers: Cliffhanger[];
  retentionPrediction: RetentionPrediction;
  improvements: Improvement[];
  optimizedContent?: string;
}

interface Hook {
  position: number; // Character position or timestamp
  type: 'question' | 'shock' | 'curiosity' | 'promise' | 'pattern_interrupt' | 'story';
  strength: number; // 0-100
  text: string;
  reasoning: string;
  suggestions?: string[];
}

interface EmotionalPeak {
  position: number;
  timestamp?: number; // seconds (for video)
  emotion: 'excitement' | 'surprise' | 'curiosity' | 'fear' | 'joy' | 'anticipation';
  intensity: number; // 0-100
  trigger: string;
  context: string;
}

interface PacingAnalysis {
  overallPace: 'too_slow' | 'slow' | 'optimal' | 'fast' | 'too_fast';
  paceScore: number; // 0-100
  sentenceVariety: number; // 0-100
  rhythmScore: number; // 0-100
  recommendations: string[];
  timeline?: PacingTimeline[];
}

interface PacingTimeline {
  start: number; // seconds
  end: number;
  pace: 'slow' | 'medium' | 'fast';
  description: string;
}

interface Cliffhanger {
  position: number;
  type: 'question' | 'revelation' | 'suspense' | 'promise' | 'challenge';
  strength: number; // 0-100
  text: string;
  effectiveness: string;
}

interface RetentionPrediction {
  predictedRetention: number; // 0-100 percentage
  dropoffPoints: DropoffPoint[];
  strongPoints: StrongPoint[];
  averageWatchTime: number; // seconds
  confidence: number;
}

interface DropoffPoint {
  position: number;
  timestamp?: number;
  reason: string;
  severity: 'low' | 'medium' | 'high';
  suggestion: string;
}

interface StrongPoint {
  position: number;
  timestamp?: number;
  reason: string;
  strength: number;
}

interface Improvement {
  category: 'hook' | 'pacing' | 'emotion' | 'cliffhanger' | 'retention' | 'structure';
  priority: 'critical' | 'high' | 'medium' | 'low';
  issue: string;
  suggestion: string;
  expectedImpact: string;
  implementation: string;
}

export class DopamineOptimizerService {
  private githubModels: GitHubModelsService;

  constructor() {
    this.githubModels = new GitHubModelsService();
  }

  /**
   * Analyze and optimize content for engagement
   */
  async optimizeContent(request: ContentAnalysisRequest): Promise<DopamineOptimizationResult> {
    // Analyze all dopamine trigger components
    const [hooks, emotionalPeaks, pacingAnalysis, cliffhangers, retentionPrediction] = await Promise.all([
      this.analyzeHooks(request.content, request.contentType),
      this.analyzeEmotionalPeaks(request.content),
      this.analyzePacing(request.content, request.duration),
      this.analyzeCliffhangers(request.content),
      this.predictRetention(request.content, request.duration),
    ]);

    // Calculate overall engagement score
    const overallScore = this.calculateOverallScore(hooks, emotionalPeaks, pacingAnalysis, cliffhangers, retentionPrediction);

    // Generate improvement suggestions
    const improvements = this.generateImprovements(hooks, emotionalPeaks, pacingAnalysis, cliffhangers, retentionPrediction);

    // Optionally generate optimized version
    const optimizedContent = await this.generateOptimizedContent(request, improvements);

    return {
      overallScore,
      hooks,
      emotionalPeaks,
      pacingAnalysis,
      cliffhangers,
      retentionPrediction,
      improvements,
      optimizedContent,
    };
  }

  /**
   * Analyze hooks (first 3 seconds / opening lines)
   */
  private async analyzeHooks(content: string, contentType: string): Promise<Hook[]> {
    const hooks: Hook[] = [];

    // Extract opening (first 150 characters or first 3 sentences)
    const opening = content.substring(0, 150);
    const sentences = content.split(/[.!?]+/).slice(0, 3);

    // Use AI to analyze hook strength
    const aiAnalysis = await this.analyzeHookWithAI(opening, contentType);

    // Add primary hook
    hooks.push({
      position: 0,
      type: aiAnalysis.type,
      strength: aiAnalysis.strength,
      text: opening,
      reasoning: aiAnalysis.reasoning,
      suggestions: aiAnalysis.suggestions,
    });

    // Detect additional hooks throughout content
    const additionalHooks = this.detectHookPatterns(content);
    hooks.push(...additionalHooks);

    return hooks.sort((a, b) => b.strength - a.strength);
  }

  /**
   * AI-powered hook analysis
   */
  private async analyzeHookWithAI(
    opening: string,
    contentType: string
  ): Promise<{ type: Hook['type']; strength: number; reasoning: string; suggestions: string[] }> {
    const prompt = `Analyze this content opening for hook strength:

Opening: "${opening}"
Content Type: ${contentType}

Evaluate:
1. Hook type (question, shock, curiosity, promise, pattern_interrupt, story)
2. Strength (0-100)
3. Why it works or doesn't work
4. 2-3 specific suggestions to improve

Format as JSON:
{
  "type": "curiosity",
  "strength": 75,
  "reasoning": "brief explanation",
  "suggestions": ["suggestion 1", "suggestion 2"]
}`;

    try {
      const response = await this.githubModels.generate(prompt, { temperature: 0.7, maxTokens: 300 });
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Error in AI hook analysis:', error);
    }

    // Fallback: Rule-based analysis
    return this.analyzeHookRuleBased(opening);
  }

  /**
   * Rule-based hook analysis (fallback)
   */
  private analyzeHookRuleBased(
    opening: string
  ): { type: Hook['type']; strength: number; reasoning: string; suggestions: string[] } {
    let strength = 50;
    let type: Hook['type'] = 'story';
    const suggestions: string[] = [];

    // Check for question
    if (opening.includes('?')) {
      type = 'question';
      strength += 15;
    }

    // Check for power words
    const powerWords = ['secret', 'shocking', 'never', 'always', 'discover', 'revealed', 'truth', 'mistake'];
    const hasPowerWords = powerWords.some((word) => opening.toLowerCase().includes(word));
    if (hasPowerWords) {
      strength += 10;
    }

    // Check for numbers
    if (/\d+/.test(opening)) {
      strength += 5;
    }

    // Check for "you" (direct address)
    if (opening.toLowerCase().includes('you')) {
      strength += 10;
    }

    if (strength < 70) {
      suggestions.push('Start with a compelling question or bold statement');
      suggestions.push('Use power words like "secret", "shocking", or "discover"');
    }

    return {
      type,
      strength: Math.min(strength, 100),
      reasoning: `Hook uses ${type} pattern with ${hasPowerWords ? 'power words' : 'standard language'}`,
      suggestions,
    };
  }

  /**
   * Detect hook patterns throughout content
   */
  private detectHookPatterns(content: string): Hook[] {
    const hooks: Hook[] = [];
    const sentences = content.split(/[.!?]+/);

    sentences.forEach((sentence, index) => {
      const trimmed = sentence.trim();
      if (trimmed.length < 10) return;

      // Detect questions
      if (trimmed.includes('?')) {
        hooks.push({
          position: content.indexOf(trimmed),
          type: 'question',
          strength: 60 + Math.random() * 20,
          text: trimmed,
          reasoning: 'Question creates curiosity',
        });
      }

      // Detect promises
      if (trimmed.toLowerCase().match(/will (show|teach|reveal|explain)/)) {
        hooks.push({
          position: content.indexOf(trimmed),
          type: 'promise',
          strength: 55 + Math.random() * 15,
          text: trimmed,
          reasoning: 'Promise of value delivery',
        });
      }
    });

    return hooks;
  }

  /**
   * Analyze emotional peaks
   */
  private async analyzeEmotionalPeaks(content: string): Promise<EmotionalPeak[]> {
    const peaks: EmotionalPeak[] = [];
    const paragraphs = content.split(/\n\n+/);

    for (let i = 0; i < paragraphs.length; i++) {
      const para = paragraphs[i];
      if (para.trim().length < 50) continue;

      const emotion = this.detectEmotion(para);
      if (emotion.intensity > 60) {
        peaks.push({
          position: content.indexOf(para),
          emotion: emotion.type,
          intensity: emotion.intensity,
          trigger: emotion.trigger,
          context: para.substring(0, 100),
        });
      }
    }

    return peaks.sort((a, b) => b.intensity - a.intensity);
  }

  /**
   * Detect emotion in text
   */
  private detectEmotion(text: string): {
    type: EmotionalPeak['emotion'];
    intensity: number;
    trigger: string;
  } {
    const lower = text.toLowerCase();

    // Excitement words
    if (lower.match(/amazing|incredible|awesome|fantastic|wow|unbelievable/)) {
      return { type: 'excitement', intensity: 75, trigger: 'Excitement words detected' };
    }

    // Surprise words
    if (lower.match(/shocking|surprising|unexpected|suddenly|twist/)) {
      return { type: 'surprise', intensity: 80, trigger: 'Surprise elements detected' };
    }

    // Curiosity words
    if (lower.match(/secret|hidden|discover|reveal|mystery|wonder/)) {
      return { type: 'curiosity', intensity: 70, trigger: 'Curiosity triggers detected' };
    }

    // Fear/urgency words
    if (lower.match(/danger|warning|mistake|avoid|never|urgent/)) {
      return { type: 'fear', intensity: 75, trigger: 'Urgency/warning detected' };
    }

    // Joy words
    if (lower.match(/happy|joy|love|celebrate|success|win/)) {
      return { type: 'joy', intensity: 65, trigger: 'Positive emotions detected' };
    }

    return { type: 'anticipation', intensity: 50, trigger: 'Neutral content' };
  }

  /**
   * Analyze pacing
   */
  private async analyzePacing(content: string, duration?: number): Promise<PacingAnalysis> {
    const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const sentenceLengths = sentences.map((s) => s.trim().split(/\s+/).length);

    // Calculate metrics
    const avgLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
    const variance = this.calculateVariance(sentenceLengths);
    const sentenceVariety = Math.min((variance / avgLength) * 100, 100);

    // Determine overall pace
    let overallPace: PacingAnalysis['overallPace'];
    let paceScore = 50;

    if (avgLength < 10) {
      overallPace = 'too_fast';
      paceScore = 60;
    } else if (avgLength < 15) {
      overallPace = 'fast';
      paceScore = 75;
    } else if (avgLength < 20) {
      overallPace = 'optimal';
      paceScore = 90;
    } else if (avgLength < 25) {
      overallPace = 'slow';
      paceScore = 70;
    } else {
      overallPace = 'too_slow';
      paceScore = 50;
    }

    // Rhythm score (based on variety)
    const rhythmScore = sentenceVariety;

    const recommendations: string[] = [];
    if (overallPace === 'too_slow') {
      recommendations.push('Break long sentences into shorter ones for better pacing');
    }
    if (overallPace === 'too_fast') {
      recommendations.push('Add some longer sentences for variety and depth');
    }
    if (sentenceVariety < 50) {
      recommendations.push('Vary sentence length more for better rhythm');
    }

    return {
      overallPace,
      paceScore,
      sentenceVariety,
      rhythmScore,
      recommendations,
    };
  }

  /**
   * Calculate variance
   */
  private calculateVariance(numbers: number[]): number {
    const avg = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const squareDiffs = numbers.map((n) => Math.pow(n - avg, 2));
    return Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / numbers.length);
  }

  /**
   * Analyze cliffhangers
   */
  private async analyzeCliffhangers(content: string): Promise<Cliffhanger[]> {
    const cliffhangers: Cliffhanger[] = [];
    const paragraphs = content.split(/\n\n+/);

    paragraphs.forEach((para, index) => {
      const trimmed = para.trim();
      if (trimmed.length < 20) return;

      // Detect cliffhanger patterns
      if (trimmed.match(/but wait|however|but here's the thing|stay tuned|coming up|next/i)) {
        cliffhangers.push({
          position: content.indexOf(trimmed),
          type: 'suspense',
          strength: 70 + Math.random() * 20,
          text: trimmed.substring(0, 100),
          effectiveness: 'Creates anticipation for what comes next',
        });
      }

      // Detect questions at end of sections
      if (trimmed.endsWith('?')) {
        cliffhangers.push({
          position: content.indexOf(trimmed),
          type: 'question',
          strength: 65 + Math.random() * 15,
          text: trimmed.substring(0, 100),
          effectiveness: 'Question keeps audience engaged',
        });
      }
    });

    return cliffhangers.sort((a, b) => b.strength - a.strength);
  }

  /**
   * Predict retention
   */
  private async predictRetention(content: string, duration?: number): Promise<RetentionPrediction> {
    const dropoffPoints: DropoffPoint[] = [];
    const strongPoints: StrongPoint[] = [];

    // Analyze content sections
    const sections = content.split(/\n\n+/);
    let currentPosition = 0;

    sections.forEach((section, index) => {
      const sectionLength = section.length;

      // Detect potential dropoff points
      if (sectionLength > 500 && !section.includes('?') && !section.match(/amazing|incredible|shocking/i)) {
        dropoffPoints.push({
          position: currentPosition,
          reason: 'Long section without engagement triggers',
          severity: 'medium',
          suggestion: 'Add a question or surprising fact to maintain interest',
        });
      }

      // Detect strong points
      if (section.includes('?') || section.match(/amazing|incredible|shocking|secret|reveal/i)) {
        strongPoints.push({
          position: currentPosition,
          reason: 'Engagement trigger detected',
          strength: 75 + Math.random() * 20,
        });
      }

      currentPosition += sectionLength + 2; // +2 for newlines
    });

    // Calculate predicted retention
    const baseRetention = 70;
    const dropoffPenalty = dropoffPoints.length * 5;
    const strongBonus = Math.min(strongPoints.length * 3, 20);
    const predictedRetention = Math.max(30, Math.min(95, baseRetention - dropoffPenalty + strongBonus));

    // Estimate average watch time
    const averageWatchTime = duration ? (duration * predictedRetention) / 100 : 0;

    return {
      predictedRetention,
      dropoffPoints: dropoffPoints.slice(0, 5),
      strongPoints: strongPoints.slice(0, 5),
      averageWatchTime,
      confidence: 0.75,
    };
  }

  /**
   * Calculate overall engagement score
   */
  private calculateOverallScore(
    hooks: Hook[],
    emotionalPeaks: EmotionalPeak[],
    pacingAnalysis: PacingAnalysis,
    cliffhangers: Cliffhanger[],
    retentionPrediction: RetentionPrediction
  ): number {
    const hookScore = hooks.length > 0 ? hooks[0].strength : 50;
    const emotionScore = emotionalPeaks.length > 0 ? emotionalPeaks[0].intensity : 50;
    const paceScore = pacingAnalysis.paceScore;
    const cliffhangerScore = cliffhangers.length > 0 ? cliffhangers[0].strength : 50;
    const retentionScore = retentionPrediction.predictedRetention;

    // Weighted average
    return (hookScore * 0.3 + emotionScore * 0.2 + paceScore * 0.2 + cliffhangerScore * 0.15 + retentionScore * 0.15);
  }

  /**
   * Generate improvement suggestions
   */
  private generateImprovements(
    hooks: Hook[],
    emotionalPeaks: EmotionalPeak[],
    pacingAnalysis: PacingAnalysis,
    cliffhangers: Cliffhanger[],
    retentionPrediction: RetentionPrediction
  ): Improvement[] {
    const improvements: Improvement[] = [];

    // Hook improvements
    if (hooks.length === 0 || hooks[0].strength < 70) {
      improvements.push({
        category: 'hook',
        priority: 'critical',
        issue: 'Weak opening hook',
        suggestion: 'Start with a compelling question, shocking statement, or bold promise',
        expectedImpact: '+15-25% initial engagement',
        implementation: 'Rewrite first 3 seconds/sentences with pattern interrupt',
      });
    }

    // Emotional peak improvements
    if (emotionalPeaks.length < 2) {
      improvements.push({
        category: 'emotion',
        priority: 'high',
        issue: 'Insufficient emotional peaks',
        suggestion: 'Add 2-3 emotional high points throughout content',
        expectedImpact: '+10-20% retention',
        implementation: 'Insert surprising facts, personal stories, or dramatic reveals',
      });
    }

    // Pacing improvements
    if (pacingAnalysis.overallPace === 'too_slow' || pacingAnalysis.overallPace === 'too_fast') {
      improvements.push({
        category: 'pacing',
        priority: 'high',
        issue: `Pacing is ${pacingAnalysis.overallPace.replace('_', ' ')}`,
        suggestion: pacingAnalysis.recommendations[0] || 'Adjust sentence length for better flow',
        expectedImpact: '+5-15% retention',
        implementation: 'Rewrite sections with varied sentence structure',
      });
    }

    // Cliffhanger improvements
    if (cliffhangers.length < 2) {
      improvements.push({
        category: 'cliffhanger',
        priority: 'medium',
        issue: 'Few cliffhangers to maintain interest',
        suggestion: 'Add 2-3 cliffhangers at key transition points',
        expectedImpact: '+10-15% retention',
        implementation: 'End sections with questions or "but wait" moments',
      });
    }

    // Retention improvements
    if (retentionPrediction.predictedRetention < 60) {
      improvements.push({
        category: 'retention',
        priority: 'critical',
        issue: 'Low predicted retention',
        suggestion: 'Address dropoff points and add more engagement triggers',
        expectedImpact: '+20-30% retention',
        implementation: 'Follow all improvement suggestions above',
      });
    }

    return improvements.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Generate optimized content version
   */
  private async generateOptimizedContent(
    request: ContentAnalysisRequest,
    improvements: Improvement[]
  ): Promise<string | undefined> {
    if (improvements.length === 0) return undefined;

    const prompt = `Optimize this content for maximum engagement:

Original Content:
${request.content.substring(0, 1000)}

Improvements Needed:
${improvements
  .slice(0, 3)
  .map((i) => `- ${i.suggestion}`)
  .join('\n')}

Rewrite the content incorporating these improvements while maintaining the core message.

Optimized Content:`;

    try {
      const response = await this.githubModels.generate(prompt, {
        temperature: 0.8,
        maxTokens: 1000,
      });
      return response.trim();
    } catch (error) {
      console.error('Error generating optimized content:', error);
      return undefined;
    }
  }

  /**
   * Quick engagement score (simplified analysis)
   */
  async quickScore(content: string): Promise<number> {
    const hooks = await this.analyzeHooks(content, 'social_post');
    const emotionalPeaks = await this.analyzeEmotionalPeaks(content);
    const pacingAnalysis = await this.analyzePacing(content);

    return (hooks[0]?.strength || 50) * 0.4 + (emotionalPeaks[0]?.intensity || 50) * 0.3 + pacingAnalysis.paceScore * 0.3;
  }

  /**
   * Compare two versions of content
   */
  async compareVersions(
    version1: string,
    version2: string
  ): Promise<{ winner: 'version1' | 'version2' | 'tie'; score1: number; score2: number; differences: string[] }> {
    const [score1, score2] = await Promise.all([this.quickScore(version1), this.quickScore(version2)]);

    const differences: string[] = [];
    if (Math.abs(score1 - score2) < 5) {
      differences.push('Scores are very close');
    } else {
      differences.push(`${score1 > score2 ? 'Version 1' : 'Version 2'} has stronger engagement triggers`);
    }

    return {
      winner: score1 > score2 + 5 ? 'version1' : score2 > score1 + 5 ? 'version2' : 'tie',
      score1,
      score2,
      differences,
    };
  }
}

export const dopamineOptimizerService = new DopamineOptimizerService();
