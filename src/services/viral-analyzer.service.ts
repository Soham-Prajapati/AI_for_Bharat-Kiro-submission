/**
 * Viral Analyzer Service
 * 
 * Reverse engineer viral content to extract success patterns
 * - Analyze viral videos (structure, hooks, pacing, engagement)
 * - Extract success patterns and formulas
 * - Generate replication guide
 * - Identify viral elements and triggers
 * - Provide actionable insights
 */

export interface ViralContentRequest {
  contentId?: string;
  url?: string;
  title: string;
  description?: string;
  transcript: string;
  platform: 'youtube' | 'instagram' | 'tiktok' | 'twitter' | 'linkedin';
  metrics: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    duration: number; // seconds
    publishedDate: string;
  };
  creatorInfo?: {
    name: string;
    followers: number;
    averageViews: number;
  };
}

export interface ViralPattern {
  patternId: string;
  name: string;
  category: 'hook' | 'structure' | 'pacing' | 'emotion' | 'storytelling' | 'cta' | 'technical';
  description: string;
  frequency: number; // How often this pattern appears in viral content (0-100%)
  effectiveness: number; // How effective this pattern is (0-100)
  examples: string[];
  howToReplicate: string;
}

export interface ViralHook {
  hookId: string;
  type: 'question' | 'bold_claim' | 'story_tease' | 'shock' | 'curiosity_gap' | 'problem_statement';
  text: string;
  timestamp: number; // seconds
  effectiveness: number; // 0-100
  whyItWorks: string;
  replicationTemplate: string;
}

export interface EmotionalTrigger {
  triggerId: string;
  emotion: 'curiosity' | 'surprise' | 'joy' | 'fear' | 'anger' | 'sadness' | 'excitement';
  intensity: number; // 0-100
  timestamp: number; // seconds
  context: string;
  impact: string;
}

export interface ViralFormula {
  formulaId: string;
  name: string;
  structure: string[];
  timing: Record<string, string>; // e.g., { "hook": "0-3s", "problem": "3-10s", "solution": "10-45s" }
  keyElements: string[];
  successRate: number; // 0-100
  bestFor: string[]; // Platforms or content types
}

export interface ReplicationGuide {
  summary: string;
  stepByStep: string[];
  dosList: string[];
  dontsList: string[];
  criticalElements: string[];
  timingBreakdown: Array<{
    timeRange: string;
    action: string;
    purpose: string;
  }>;
  scriptTemplate: string;
}

export interface ViralAnalysisResult {
  analysisId: string;
  contentId?: string;
  viralScore: number; // 0-100
  viralFactors: {
    viewVelocity: number; // Views per day
    engagementRate: number; // (likes + comments + shares) / views
    shareability: number; // Shares / views
    retentionEstimate: number; // Estimated % who watched to end
    algorithmFriendliness: number; // 0-100
  };
  patterns: ViralPattern[];
  hooks: ViralHook[];
  emotionalTriggers: EmotionalTrigger[];
  formulas: ViralFormula[];
  replicationGuide: ReplicationGuide;
  competitorInsights: string[];
  predictedPerformance: {
    estimatedViews: string;
    estimatedEngagement: string;
    viralPotential: number; // 0-100
  };
  analyzedAt: string;
}

export class ViralAnalyzerService {
  private analyses: Map<string, ViralAnalysisResult>;
  private viralPatternDatabase: Map<string, ViralPattern>;

  constructor() {
    this.analyses = new Map();
    this.viralPatternDatabase = new Map();
    this.initializePatternDatabase();
  }

  // ============================================================================
  // VIRAL CONTENT ANALYSIS
  // ============================================================================

  /**
   * Analyze viral content and extract success patterns
   */
  async analyzeViralContent(request: ViralContentRequest): Promise<ViralAnalysisResult> {
    // Calculate viral score
    const viralScore = this.calculateViralScore(request.metrics);

    // Calculate viral factors
    const viralFactors = this.calculateViralFactors(request);

    // Extract patterns
    const patterns = await this.extractPatterns(request);

    // Identify hooks
    const hooks = await this.identifyHooks(request);

    // Detect emotional triggers
    const emotionalTriggers = await this.detectEmotionalTriggers(request);

    // Identify formulas
    const formulas = await this.identifyFormulas(request, patterns);

    // Generate replication guide
    const replicationGuide = await this.generateReplicationGuide(request, patterns, hooks, formulas);

    // Generate competitor insights
    const competitorInsights = this.generateCompetitorInsights(request, patterns);

    // Predict performance
    const predictedPerformance = this.predictPerformance(viralScore, request.platform);

    const result: ViralAnalysisResult = {
      analysisId: this.generateId('viral_analysis'),
      contentId: request.contentId,
      viralScore,
      viralFactors,
      patterns,
      hooks,
      emotionalTriggers,
      formulas,
      replicationGuide,
      competitorInsights,
      predictedPerformance,
      analyzedAt: new Date().toISOString(),
    };

    this.analyses.set(result.analysisId, result);
    return result;
  }

  // ============================================================================
  // VIRAL SCORE CALCULATION
  // ============================================================================

  /**
   * Calculate overall viral score
   */
  private calculateViralScore(metrics: ViralContentRequest['metrics']): number {
    const { views, likes, comments, shares } = metrics;

    // Engagement rate
    const engagementRate = (likes + comments + shares) / views;

    // Share rate (most important for virality)
    const shareRate = shares / views;

    // Like rate
    const likeRate = likes / views;

    // Comment rate
    const commentRate = comments / views;

    // Weighted score
    const score = 
      (shareRate * 1000 * 40) +      // Shares are most important (40%)
      (engagementRate * 100 * 30) +  // Overall engagement (30%)
      (likeRate * 100 * 20) +        // Likes (20%)
      (commentRate * 100 * 10);      // Comments (10%)

    return Math.min(100, Math.round(score));
  }

  /**
   * Calculate detailed viral factors
   */
  private calculateViralFactors(request: ViralContentRequest): ViralAnalysisResult['viralFactors'] {
    const { views, likes, comments, shares, publishedDate } = request.metrics;

    // View velocity (views per day)
    const daysOld = Math.max(1, Math.floor((Date.now() - new Date(publishedDate).getTime()) / (1000 * 60 * 60 * 24)));
    const viewVelocity = Math.round(views / daysOld);

    // Engagement rate
    const engagementRate = ((likes + comments + shares) / views) * 100;

    // Shareability
    const shareability = (shares / views) * 100;

    // Retention estimate (based on engagement patterns)
    const retentionEstimate = Math.min(100, engagementRate * 10);

    // Algorithm friendliness (based on engagement signals)
    const algorithmFriendliness = Math.min(100, 
      (engagementRate * 0.4) + 
      (shareability * 10 * 0.3) + 
      (retentionEstimate * 0.3)
    );

    return {
      viewVelocity,
      engagementRate: Math.round(engagementRate * 10) / 10,
      shareability: Math.round(shareability * 100) / 100,
      retentionEstimate: Math.round(retentionEstimate),
      algorithmFriendliness: Math.round(algorithmFriendliness),
    };
  }

  // ============================================================================
  // PATTERN EXTRACTION
  // ============================================================================

  /**
   * Extract viral patterns from content
   */
  private async extractPatterns(request: ViralContentRequest): Promise<ViralPattern[]> {
    const patterns: ViralPattern[] = [];
    const transcript = request.transcript.toLowerCase();

    // Check for each known pattern
    for (const [, pattern] of this.viralPatternDatabase) {
      const isPresent = this.checkPatternPresence(transcript, pattern);
      if (isPresent) {
        patterns.push(pattern);
      }
    }

    // Add custom patterns detected in this specific content
    const customPatterns = await this.detectCustomPatterns(request);
    patterns.push(...customPatterns);

    // Sort by effectiveness
    return patterns.sort((a, b) => b.effectiveness - a.effectiveness);
  }

  /**
   * Check if pattern is present in content
   */
  private checkPatternPresence(transcript: string, pattern: ViralPattern): boolean {
    // Simple keyword matching (in production, use AI for better detection)
    const keywords = pattern.examples.map(e => e.toLowerCase());
    return keywords.some(keyword => transcript.includes(keyword.substring(0, 20)));
  }

  /**
   * Detect custom patterns specific to this content
   */
  private async detectCustomPatterns(request: ViralContentRequest): Promise<ViralPattern[]> {
    const patterns: ViralPattern[] = [];
    const transcript = request.transcript;

    // Pattern: Repetition for emphasis
    const repeatedPhrases = this.findRepeatedPhrases(transcript);
    if (repeatedPhrases.length > 0) {
      patterns.push({
        patternId: this.generateId('pattern'),
        name: 'Repetition for Emphasis',
        category: 'pacing',
        description: 'Repeats key phrases for memorability and emphasis',
        frequency: 65,
        effectiveness: 75,
        examples: repeatedPhrases,
        howToReplicate: 'Identify your key message and repeat it 2-3 times throughout the content',
      });
    }

    // Pattern: Numbers and statistics
    const hasNumbers = /\d+%|\d+ times|\d+ ways|\d+ tips|\d+ secrets/i.test(transcript);
    if (hasNumbers) {
      patterns.push({
        patternId: this.generateId('pattern'),
        name: 'Data-Driven Claims',
        category: 'hook',
        description: 'Uses specific numbers and statistics for credibility',
        frequency: 80,
        effectiveness: 85,
        examples: transcript.match(/\d+%|\d+ times|\d+ ways|\d+ tips|\d+ secrets/gi)?.slice(0, 3) || [],
        howToReplicate: 'Include specific numbers, percentages, or statistics to back your claims',
      });
    }

    // Pattern: Controversy or contrarian view
    const hasControversy = /unpopular opinion|controversial|nobody talks about|secret|truth/i.test(transcript);
    if (hasControversy) {
      patterns.push({
        patternId: this.generateId('pattern'),
        name: 'Contrarian Angle',
        category: 'hook',
        description: 'Takes a controversial or contrarian stance to spark interest',
        frequency: 55,
        effectiveness: 90,
        examples: ['Unpopular opinion', 'What nobody tells you', 'The truth about'],
        howToReplicate: 'Challenge common beliefs or reveal hidden truths in your niche',
      });
    }

    return patterns;
  }

  /**
   * Find repeated phrases
   */
  private findRepeatedPhrases(transcript: string): string[] {
    const phrases = transcript.match(/\b\w+\s+\w+\s+\w+\b/g) || [];
    const phraseCount = new Map<string, number>();
    
    phrases.forEach(phrase => {
      const normalized = phrase.toLowerCase();
      phraseCount.set(normalized, (phraseCount.get(normalized) || 0) + 1);
    });

    return Array.from(phraseCount.entries())
      .filter(([, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([phrase]) => phrase);
  }

  // ============================================================================
  // HOOK IDENTIFICATION
  // ============================================================================

  /**
   * Identify viral hooks in content
   */
  private async identifyHooks(request: ViralContentRequest): Promise<ViralHook[]> {
    const hooks: ViralHook[] = [];
    const firstSentences = request.transcript.split(/[.!?]+/).slice(0, 3);

    firstSentences.forEach((sentence, index) => {
      const hook = this.analyzeHookType(sentence.trim(), index * 3);
      if (hook) {
        hooks.push(hook);
      }
    });

    return hooks;
  }

  /**
   * Analyze hook type and effectiveness
   */
  private analyzeHookType(text: string, timestamp: number): ViralHook | null {
    if (!text) return null;

    // Question hook
    if (text.includes('?')) {
      return {
        hookId: this.generateId('hook'),
        type: 'question',
        text,
        timestamp,
        effectiveness: 85,
        whyItWorks: 'Questions engage the brain and create curiosity gaps that demand answers',
        replicationTemplate: 'Start with "Have you ever wondered..." or "What if I told you..."',
      };
    }

    // Bold claim
    if (/changed everything|secret|nobody|never|always|best|worst/i.test(text)) {
      return {
        hookId: this.generateId('hook'),
        type: 'bold_claim',
        text,
        timestamp,
        effectiveness: 90,
        whyItWorks: 'Bold claims create intrigue and promise valuable information',
        replicationTemplate: 'Use superlatives: "The #1 mistake...", "The secret that changed..."',
      };
    }

    // Story tease
    if (/story|happened|remember|once|experience/i.test(text)) {
      return {
        hookId: this.generateId('hook'),
        type: 'story_tease',
        text,
        timestamp,
        effectiveness: 88,
        whyItWorks: 'Story teases tap into our natural love for narratives and create anticipation',
        replicationTemplate: 'Begin with "Let me tell you about the time..." or "This happened to me..."',
      };
    }

    // Shock value
    if (/shocking|unbelievable|crazy|insane|mind-blowing/i.test(text)) {
      return {
        hookId: this.generateId('hook'),
        type: 'shock',
        text,
        timestamp,
        effectiveness: 92,
        whyItWorks: 'Shock triggers emotional response and demands attention',
        replicationTemplate: 'Use: "You won\'t believe what happened..." or "This is insane..."',
      };
    }

    // Curiosity gap
    if (/but|however|until|then|suddenly/i.test(text)) {
      return {
        hookId: this.generateId('hook'),
        type: 'curiosity_gap',
        text,
        timestamp,
        effectiveness: 87,
        whyItWorks: 'Creates information gap that viewers want to fill',
        replicationTemplate: 'Set up expectation then subvert: "I thought X, but then Y happened..."',
      };
    }

    // Problem statement
    if (/problem|struggle|difficult|challenge|frustrated/i.test(text)) {
      return {
        hookId: this.generateId('hook'),
        type: 'problem_statement',
        text,
        timestamp,
        effectiveness: 83,
        whyItWorks: 'Identifies with viewer\'s pain points and promises solution',
        replicationTemplate: 'Start with: "Struggling with X? Here\'s why..." or "The problem with X is..."',
      };
    }

    return null;
  }

  // ============================================================================
  // EMOTIONAL TRIGGER DETECTION
  // ============================================================================

  /**
   * Detect emotional triggers in content
   */
  private async detectEmotionalTriggers(request: ViralContentRequest): Promise<EmotionalTrigger[]> {
    const triggers: EmotionalTrigger[] = [];
    const sentences = request.transcript.split(/[.!?]+/);

    sentences.forEach((sentence, index) => {
      const trigger = this.analyzeEmotionalContent(sentence.trim(), index * 5);
      if (trigger) {
        triggers.push(trigger);
      }
    });

    return triggers.slice(0, 10); // Top 10 triggers
  }

  /**
   * Analyze emotional content of text
   */
  private analyzeEmotionalContent(text: string, timestamp: number): EmotionalTrigger | null {
    if (!text) return null;

    // Curiosity
    if (/wonder|curious|secret|hidden|reveal|discover/i.test(text)) {
      return {
        triggerId: this.generateId('trigger'),
        emotion: 'curiosity',
        intensity: 80,
        timestamp,
        context: text.substring(0, 100),
        impact: 'Drives viewers to keep watching to satisfy curiosity',
      };
    }

    // Surprise
    if (/surprising|unexpected|shocking|believe|imagine|guess what/i.test(text)) {
      return {
        triggerId: this.generateId('trigger'),
        emotion: 'surprise',
        intensity: 85,
        timestamp,
        context: text.substring(0, 100),
        impact: 'Creates memorable moments that increase sharing',
      };
    }

    // Joy/Excitement
    if (/amazing|incredible|love|excited|happy|wonderful|great/i.test(text)) {
      return {
        triggerId: this.generateId('trigger'),
        emotion: 'joy',
        intensity: 75,
        timestamp,
        context: text.substring(0, 100),
        impact: 'Positive emotions increase engagement and sharing',
      };
    }

    // Fear/Concern
    if (/danger|risk|warning|careful|avoid|mistake|wrong/i.test(text)) {
      return {
        triggerId: this.generateId('trigger'),
        emotion: 'fear',
        intensity: 90,
        timestamp,
        context: text.substring(0, 100),
        impact: 'Fear triggers strong engagement and protective sharing',
      };
    }

    // Anger/Frustration
    if (/angry|frustrated|unfair|wrong|terrible|hate|annoying/i.test(text)) {
      return {
        triggerId: this.generateId('trigger'),
        emotion: 'anger',
        intensity: 88,
        timestamp,
        context: text.substring(0, 100),
        impact: 'Anger drives comments and passionate engagement',
      };
    }

    return null;
  }

  // ============================================================================
  // FORMULA IDENTIFICATION
  // ============================================================================

  /**
   * Identify viral formulas used
   */
  private async identifyFormulas(
    request: ViralContentRequest,
    patterns: ViralPattern[]
  ): Promise<ViralFormula[]> {
    const formulas: ViralFormula[] = [];

    // Check for known formulas
    const hasStrongHook = patterns.some(p => p.category === 'hook' && p.effectiveness > 80);
    const hasStory = /story|happened|experience|remember/i.test(request.transcript);
    const hasValueDelivery = /tip|trick|hack|method|way to/i.test(request.transcript);
    const hasCTA = /subscribe|like|comment|share|follow/i.test(request.transcript);

    // Formula 1: Hook + Story + Value + CTA
    if (hasStrongHook && hasStory && hasValueDelivery && hasCTA) {
      formulas.push({
        formulaId: this.generateId('formula'),
        name: 'Story-Driven Value Formula',
        structure: ['Strong Hook', 'Personal Story', 'Value/Tips', 'Call-to-Action'],
        timing: {
          'hook': '0-5s',
          'story': '5-30s',
          'value': '30-80s',
          'cta': '80-90s',
        },
        keyElements: [
          'Attention-grabbing opening',
          'Relatable personal experience',
          'Actionable takeaways',
          'Clear next step',
        ],
        successRate: 85,
        bestFor: ['YouTube', 'Instagram', 'TikTok'],
      });
    }

    // Formula 2: Problem + Agitation + Solution
    const hasProblem = /problem|struggle|difficult|challenge/i.test(request.transcript);
    const hasAgitation = /worse|frustrated|tired|enough/i.test(request.transcript);
    const hasSolution = /solution|answer|fix|solve|here's how/i.test(request.transcript);

    if (hasProblem && hasAgitation && hasSolution) {
      formulas.push({
        formulaId: this.generateId('formula'),
        name: 'Problem-Agitate-Solution (PAS)',
        structure: ['Identify Problem', 'Agitate Pain', 'Present Solution'],
        timing: {
          'problem': '0-10s',
          'agitate': '10-25s',
          'solution': '25-90s',
        },
        keyElements: [
          'Relatable problem statement',
          'Amplify the pain/frustration',
          'Offer clear solution',
          'Proof or results',
        ],
        successRate: 82,
        bestFor: ['LinkedIn', 'YouTube', 'Blog'],
      });
    }

    // Formula 3: Listicle Formula
    const hasNumberedList = /first|second|third|number \d+|\d+\./i.test(request.transcript);
    if (hasNumberedList && hasStrongHook) {
      formulas.push({
        formulaId: this.generateId('formula'),
        name: 'Listicle Formula',
        structure: ['Hook with Number', 'Point 1', 'Point 2', 'Point 3+', 'Summary'],
        timing: {
          'hook': '0-5s',
          'points': '5-75s',
          'summary': '75-90s',
        },
        keyElements: [
          'Specific number in title/hook',
          'Clear structure',
          'Quick pacing',
          'Memorable points',
        ],
        successRate: 78,
        bestFor: ['TikTok', 'Instagram', 'Twitter'],
      });
    }

    return formulas;
  }

  // ============================================================================
  // REPLICATION GUIDE GENERATION
  // ============================================================================

  /**
   * Generate step-by-step replication guide
   */
  private async generateReplicationGuide(
    request: ViralContentRequest,
    patterns: ViralPattern[],
    hooks: ViralHook[],
    formulas: ViralFormula[]
  ): Promise<ReplicationGuide> {
    const topPattern = patterns[0];
    const topHook = hooks[0];
    const topFormula = formulas[0];

    // Generate summary
    const summary = `This content went viral using ${topFormula?.name || 'a proven formula'} with ${topHook?.type.replace('_', ' ') || 'strong'} hook and ${patterns.length} viral patterns. Key success factors: ${patterns.slice(0, 3).map(p => p.name).join(', ')}.`;

    // Generate step-by-step guide
    const stepByStep = this.generateStepByStep(topFormula, topHook, patterns);

    // Generate dos and don'ts
    const dosList = this.generateDosList(patterns, hooks);
    const dontsList = this.generateDontsList();

    // Critical elements
    const criticalElements = [
      topHook ? `${topHook.type.replace('_', ' ')} hook in first 3-5 seconds` : 'Strong hook',
      topPattern ? topPattern.name : 'Clear structure',
      'High-energy delivery',
      'Clear value proposition',
      'Strong call-to-action',
    ];

    // Timing breakdown
    const timingBreakdown = this.generateTimingBreakdown(topFormula, request.metrics.duration);

    // Script template
    const scriptTemplate = this.generateScriptTemplate(topHook, topFormula);

    return {
      summary,
      stepByStep,
      dosList,
      dontsList,
      criticalElements,
      timingBreakdown,
      scriptTemplate,
    };
  }

  /**
   * Generate step-by-step instructions
   */
  private generateStepByStep(
    formula: ViralFormula | undefined,
    hook: ViralHook | undefined,
    patterns: ViralPattern[]
  ): string[] {
    const steps: string[] = [];

    steps.push('1. Start with a powerful hook in the first 3-5 seconds using ' + (hook?.type.replace('_', ' ') || 'a question or bold claim'));
    
    if (formula) {
      formula.structure.forEach((element, index) => {
        steps.push(`${index + 2}. ${element}: ${this.getElementDescription(element)}`);
      });
    } else {
      steps.push('2. Establish the problem or topic clearly');
      steps.push('3. Deliver value through tips, insights, or entertainment');
      steps.push('4. End with a strong call-to-action');
    }

    if (patterns.length > 0) {
      steps.push(`${steps.length + 1}. Incorporate these viral patterns: ${patterns.slice(0, 3).map(p => p.name).join(', ')}`);
    }

    steps.push(`${steps.length + 1}. Maintain high energy and pacing throughout`);
    steps.push(`${steps.length + 1}. Edit tightly - remove any dead air or filler`);

    return steps;
  }

  /**
   * Get element description
   */
  private getElementDescription(element: string): string {
    const descriptions: Record<string, string> = {
      'Strong Hook': 'Capture attention immediately with question, bold claim, or story tease',
      'Personal Story': 'Share relatable experience that connects emotionally',
      'Value/Tips': 'Deliver actionable insights or entertainment value',
      'Call-to-Action': 'Tell viewers exactly what to do next',
      'Identify Problem': 'State the problem your audience faces',
      'Agitate Pain': 'Amplify the frustration or consequences',
      'Present Solution': 'Offer your solution with proof',
      'Point 1': 'First key point with example',
      'Point 2': 'Second key point with example',
      'Point 3+': 'Additional points, keep them concise',
      'Summary': 'Recap key takeaways',
    };
    return descriptions[element] || element;
  }

  /**
   * Generate dos list
   */
  private generateDosList(patterns: ViralPattern[], hooks: ViralHook[]): string[] {
    const dos: string[] = [
      'Hook viewers in the first 3 seconds',
      'Maintain high energy and enthusiasm',
      'Use specific numbers and data',
      'Tell personal stories',
      'Create curiosity gaps',
      'Deliver clear value',
      'Edit tightly - no wasted time',
      'Include a clear call-to-action',
    ];

    // Add pattern-specific dos
    patterns.slice(0, 2).forEach(pattern => {
      dos.push(pattern.howToReplicate);
    });

    return dos.slice(0, 10);
  }

  /**
   * Generate don'ts list
   */
  private generateDontsList(): string[] {
    return [
      'Don\'t bury the lead - hook first',
      'Don\'t use slow intros or long explanations',
      'Don\'t be monotone - vary your energy',
      'Don\'t forget the call-to-action',
      'Don\'t make it too long - respect viewer time',
      'Don\'t use jargon without explanation',
      'Don\'t forget to edit out mistakes',
      'Don\'t copy exactly - adapt to your style',
    ];
  }

  /**
   * Generate timing breakdown
   */
  private generateTimingBreakdown(
    formula: ViralFormula | undefined,
    duration: number
  ): Array<{ timeRange: string; action: string; purpose: string }> {
    if (formula && formula.timing) {
      return Object.entries(formula.timing).map(([action, timeRange]) => ({
        timeRange,
        action: action.charAt(0).toUpperCase() + action.slice(1),
        purpose: this.getTimingPurpose(action),
      }));
    }

    // Default timing breakdown
    return [
      { timeRange: '0-3s', action: 'Hook', purpose: 'Capture attention immediately' },
      { timeRange: '3-10s', action: 'Setup', purpose: 'Establish topic and value proposition' },
      { timeRange: `10-${duration - 10}s`, action: 'Content', purpose: 'Deliver main value' },
      { timeRange: `${duration - 10}s-${duration}s`, action: 'CTA', purpose: 'Drive action' },
    ];
  }

  /**
   * Get timing purpose
   */
  private getTimingPurpose(action: string): string {
    const purposes: Record<string, string> = {
      'hook': 'Capture attention and prevent scrolling',
      'story': 'Build emotional connection',
      'value': 'Deliver promised content',
      'cta': 'Drive engagement and action',
      'problem': 'Establish relevance',
      'agitate': 'Amplify desire for solution',
      'solution': 'Provide resolution and value',
      'points': 'Deliver structured information',
      'summary': 'Reinforce key takeaways',
    };
    return purposes[action.toLowerCase()] || 'Advance the narrative';
  }

  /**
   * Generate script template
   */
  private generateScriptTemplate(hook: ViralHook | undefined, formula: ViralFormula | undefined): string {
    let template = '# Viral Content Script Template\n\n';
    
    template += '## Hook (0-3 seconds)\n';
    template += hook?.replicationTemplate || '[Start with a question, bold claim, or story tease]';
    template += '\n\n';

    if (formula) {
      formula.structure.forEach((element, index) => {
        template += `## ${element}\n`;
        template += `[${this.getElementDescription(element)}]\n\n`;
      });
    } else {
      template += '## Main Content\n[Deliver your value here]\n\n';
      template += '## Call-to-Action\n[Tell viewers what to do next]\n\n';
    }

    return template;
  }

  // ============================================================================
  // COMPETITOR INSIGHTS
  // ============================================================================

  /**
   * Generate competitor insights
   */
  private generateCompetitorInsights(
    request: ViralContentRequest,
    patterns: ViralPattern[]
  ): string[] {
    const insights: string[] = [];

    // Analyze creator performance
    if (request.creatorInfo) {
      const { averageViews, followers } = request.creatorInfo;
      const viewsToFollowersRatio = request.metrics.views / followers;
      
      if (viewsToFollowersRatio > 2) {
        insights.push(`This content performed ${Math.round(viewsToFollowersRatio)}x better than creator's average, indicating strong viral potential`);
      }

      const performanceVsAverage = (request.metrics.views / averageViews) * 100;
      if (performanceVsAverage > 200) {
        insights.push(`Outperformed creator's average by ${Math.round(performanceVsAverage - 100)}% - study what made this different`);
      }
    }

    // Pattern insights
    if (patterns.length > 5) {
      insights.push(`Uses ${patterns.length} viral patterns - more than typical content (3-4 patterns)`);
    }

    // Platform-specific insights
    const platformInsights = this.getPlatformInsights(request.platform, request.metrics);
    insights.push(...platformInsights);

    return insights.slice(0, 5);
  }

  /**
   * Get platform-specific insights
   */
  private getPlatformInsights(platform: string, metrics: ViralContentRequest['metrics']): string[] {
    const insights: string[] = [];
    const { duration, views, shares } = metrics;

    if (platform === 'tiktok') {
      if (duration < 30) {
        insights.push('Short duration (<30s) optimized for TikTok algorithm');
      }
      const shareRate = shares / views;
      if (shareRate > 0.05) {
        insights.push('High share rate indicates strong TikTok virality');
      }
    } else if (platform === 'youtube') {
      if (duration >= 480 && duration <= 900) {
        insights.push('Duration (8-15 min) optimized for YouTube algorithm');
      }
    } else if (platform === 'instagram') {
      if (duration >= 15 && duration <= 60) {
        insights.push('Duration optimized for Instagram Reels');
      }
    }

    return insights;
  }

  // ============================================================================
  // PERFORMANCE PREDICTION
  // ============================================================================

  /**
   * Predict performance for similar content
   */
  private predictPerformance(viralScore: number, platform: string): {
    estimatedViews: string;
    estimatedEngagement: string;
    viralPotential: number;
  } {
    // Base multiplier on viral score
    let multiplier = 1;
    if (viralScore >= 90) multiplier = 10;
    else if (viralScore >= 80) multiplier = 5;
    else if (viralScore >= 70) multiplier = 3;
    else if (viralScore >= 60) multiplier = 2;

    // Platform multipliers
    const platformMultipliers: Record<string, number> = {
      'tiktok': 3.0,
      'instagram': 2.0,
      'youtube': 1.5,
      'twitter': 1.0,
      'linkedin': 0.8,
    };

    const finalMultiplier = multiplier * (platformMultipliers[platform] || 1.0);
    const baseViews = 10000;
    const estimatedViews = baseViews * finalMultiplier;

    // Format views
    const viewsFormatted = estimatedViews >= 1000000 
      ? `${(estimatedViews / 1000000).toFixed(1)}M+`
      : estimatedViews >= 1000
      ? `${(estimatedViews / 1000).toFixed(0)}K+`
      : `${Math.round(estimatedViews)}+`;

    // Engagement rate
    const engagementRate = Math.min(15, viralScore / 10);

    return {
      estimatedViews: viewsFormatted,
      estimatedEngagement: `${engagementRate.toFixed(1)}%`,
      viralPotential: viralScore,
    };
  }

  // ============================================================================
  // PATTERN DATABASE
  // ============================================================================

  /**
   * Initialize viral pattern database
   */
  private initializePatternDatabase(): void {
    const patterns: ViralPattern[] = [
      {
        patternId: 'pattern_001',
        name: 'Pattern Interrupt',
        category: 'hook',
        description: 'Breaks expected pattern to capture attention',
        frequency: 75,
        effectiveness: 90,
        examples: ['Wait, before you scroll...', 'Stop! This is important...', 'Hold on...'],
        howToReplicate: 'Use unexpected words or actions in first 3 seconds to break scroll pattern',
      },
      {
        patternId: 'pattern_002',
        name: 'Social Proof',
        category: 'storytelling',
        description: 'References others doing/saying something',
        frequency: 85,
        effectiveness: 82,
        examples: ['Everyone is talking about...', 'Millions of people...', 'Experts agree...'],
        howToReplicate: 'Mention how many people are affected or interested in the topic',
      },
      {
        patternId: 'pattern_003',
        name: 'Transformation Story',
        category: 'storytelling',
        description: 'Shows before/after or journey',
        frequency: 70,
        effectiveness: 88,
        examples: ['I went from X to Y...', 'Before vs After...', 'My journey from...'],
        howToReplicate: 'Share your transformation or someone else\'s with specific details',
      },
      {
        patternId: 'pattern_004',
        name: 'Controversy Bait',
        category: 'emotion',
        description: 'Takes controversial stance to spark debate',
        frequency: 45,
        effectiveness: 95,
        examples: ['Unpopular opinion:', 'Hot take:', 'This will make you mad...'],
        howToReplicate: 'Challenge common beliefs in your niche (but stay authentic)',
      },
      {
        patternId: 'pattern_005',
        name: 'Urgency/Scarcity',
        category: 'cta',
        description: 'Creates time pressure or limited availability',
        frequency: 60,
        effectiveness: 80,
        examples: ['Only 24 hours left...', 'Before it\'s too late...', 'Limited spots...'],
        howToReplicate: 'Add time-sensitive element or limited availability',
      },
      {
        patternId: 'pattern_006',
        name: 'Relatability Hook',
        category: 'hook',
        description: 'Starts with universally relatable situation',
        frequency: 90,
        effectiveness: 85,
        examples: ['We\'ve all been there...', 'You know that feeling when...', 'Ever notice how...'],
        howToReplicate: 'Open with a situation your audience has experienced',
      },
      {
        patternId: 'pattern_007',
        name: 'Value Stacking',
        category: 'structure',
        description: 'Delivers multiple tips/insights rapidly',
        frequency: 65,
        effectiveness: 78,
        examples: ['5 ways to...', '3 secrets...', 'Here are 7 tips...'],
        howToReplicate: 'Package multiple quick tips in rapid succession',
      },
      {
        patternId: 'pattern_008',
        name: 'Cliffhanger',
        category: 'pacing',
        description: 'Teases information to keep watching',
        frequency: 55,
        effectiveness: 87,
        examples: ['But wait, there\'s more...', 'The best part is...', 'Number 3 will shock you...'],
        howToReplicate: 'Tease your best point early, deliver it later',
      },
    ];

    patterns.forEach(pattern => {
      this.viralPatternDatabase.set(pattern.patternId, pattern);
    });
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Get analysis by ID
   */
  getAnalysis(analysisId: string): ViralAnalysisResult | null {
    return this.analyses.get(analysisId) || null;
  }

  /**
   * Get user's analysis history
   */
  getUserAnalyses(userId: string, limit: number = 20): ViralAnalysisResult[] {
    // In production, filter by userId from database
    return Array.from(this.analyses.values())
      .sort((a, b) => new Date(b.analyzedAt).getTime() - new Date(a.analyzedAt).getTime())
      .slice(0, limit);
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get mock analysis for testing
   */
  getMockAnalysis(): ViralAnalysisResult {
    return {
      analysisId: 'viral_001',
      contentId: 'content_001',
      viralScore: 87,
      viralFactors: {
        viewVelocity: 50000,
        engagementRate: 8.5,
        shareability: 2.3,
        retentionEstimate: 85,
        algorithmFriendliness: 88,
      },
      patterns: [
        {
          patternId: 'pattern_001',
          name: 'Pattern Interrupt',
          category: 'hook',
          description: 'Breaks expected pattern to capture attention',
          frequency: 75,
          effectiveness: 90,
          examples: ['Wait, before you scroll...'],
          howToReplicate: 'Use unexpected words or actions in first 3 seconds',
        },
      ],
      hooks: [
        {
          hookId: 'hook_001',
          type: 'question',
          text: 'Have you ever wondered why some videos go viral?',
          timestamp: 0,
          effectiveness: 85,
          whyItWorks: 'Questions engage the brain and create curiosity gaps',
          replicationTemplate: 'Start with "Have you ever wondered..."',
        },
      ],
      emotionalTriggers: [
        {
          triggerId: 'trigger_001',
          emotion: 'curiosity',
          intensity: 80,
          timestamp: 0,
          context: 'Have you ever wondered why...',
          impact: 'Drives viewers to keep watching',
        },
      ],
      formulas: [
        {
          formulaId: 'formula_001',
          name: 'Story-Driven Value Formula',
          structure: ['Strong Hook', 'Personal Story', 'Value/Tips', 'Call-to-Action'],
          timing: { 'hook': '0-5s', 'story': '5-30s', 'value': '30-80s', 'cta': '80-90s' },
          keyElements: ['Attention-grabbing opening', 'Relatable experience', 'Actionable takeaways'],
          successRate: 85,
          bestFor: ['YouTube', 'Instagram', 'TikTok'],
        },
      ],
      replicationGuide: {
        summary: 'This content went viral using Story-Driven Value Formula with question hook and 8 viral patterns.',
        stepByStep: [
          '1. Start with a powerful hook using a question',
          '2. Share a relatable personal story',
          '3. Deliver actionable value',
          '4. End with clear call-to-action',
        ],
        dosList: ['Hook viewers in first 3 seconds', 'Use specific numbers', 'Tell personal stories'],
        dontsList: ['Don\'t bury the lead', 'Don\'t use slow intros', 'Don\'t be monotone'],
        criticalElements: ['Question hook in first 3 seconds', 'Pattern Interrupt', 'High-energy delivery'],
        timingBreakdown: [
          { timeRange: '0-3s', action: 'Hook', purpose: 'Capture attention immediately' },
          { timeRange: '3-10s', action: 'Setup', purpose: 'Establish value proposition' },
        ],
        scriptTemplate: '# Viral Content Script Template\n\n## Hook (0-3s)\n[Question or bold claim]\n\n## Story\n[Personal experience]\n\n## Value\n[Tips and insights]\n\n## CTA\n[Clear next step]',
      },
      competitorInsights: [
        'This content performed 3x better than creator\'s average',
        'Uses 8 viral patterns - more than typical content',
      ],
      predictedPerformance: {
        estimatedViews: '50K+',
        estimatedEngagement: '8.7%',
        viralPotential: 87,
      },
      analyzedAt: new Date().toISOString(),
    };
  }
}

export const viralAnalyzerService = new ViralAnalyzerService();
