/**
 * Creative Director Service
 * 
 * AI feedback on content quality before publishing
 * - Analyze structure, pacing, engagement
 * - Score on 10 dimensions
 * - Suggest specific improvements
 * - Compare against best practices
 * - Provide actionable recommendations
 */

export interface ContentAnalysisRequest {
  contentId?: string;
  title: string;
  description?: string;
  transcript: string;
  platform: 'youtube' | 'instagram' | 'tiktok' | 'twitter' | 'linkedin' | 'blog';
  duration?: number; // seconds
  targetAudience?: string;
}

export interface DimensionScore {
  dimension: string;
  score: number; // 0-10
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

export interface ContentScore {
  overallScore: number; // 0-100
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  dimensions: DimensionScore[];
  summary: string;
  topStrengths: string[];
  topWeaknesses: string[];
  priorityImprovements: string[];
}

export interface ImprovementSuggestion {
  suggestionId: string;
  category: 'structure' | 'pacing' | 'engagement' | 'clarity' | 'seo' | 'technical';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string; // Expected impact of implementing
  effort: 'easy' | 'moderate' | 'difficult';
  examples?: string[];
}

export interface BestPracticeComparison {
  practice: string;
  yourContent: string;
  bestPractice: string;
  gap: 'aligned' | 'minor_gap' | 'major_gap';
  recommendation: string;
}

export interface AnalysisResult {
  analysisId: string;
  contentId?: string;
  score: ContentScore;
  improvements: ImprovementSuggestion[];
  bestPractices: BestPracticeComparison[];
  competitorInsights?: string[];
  estimatedEngagement: {
    views: string;
    engagement: string;
    viralPotential: number; // 0-100
  };
  analyzedAt: string;
}

export class CreativeDirectorService {
  private analyses: Map<string, AnalysisResult>;

  constructor() {
    this.analyses = new Map();
  }

  // ============================================================================
  // CONTENT ANALYSIS
  // ============================================================================

  /**
   * Analyze content and provide comprehensive feedback
   */
  async analyzeContent(request: ContentAnalysisRequest): Promise<AnalysisResult> {
    // Analyze all 10 dimensions
    const dimensions = await this.analyzeDimensions(request);

    // Calculate overall score
    const overallScore = this.calculateOverallScore(dimensions);
    const grade = this.calculateGrade(overallScore);

    // Extract top strengths and weaknesses
    const topStrengths = this.extractTopStrengths(dimensions);
    const topWeaknesses = this.extractTopWeaknesses(dimensions);

    // Generate priority improvements
    const priorityImprovements = this.generatePriorityImprovements(dimensions);

    // Generate summary
    const summary = this.generateSummary(overallScore, grade, topStrengths, topWeaknesses);

    const score: ContentScore = {
      overallScore,
      grade,
      dimensions,
      summary,
      topStrengths,
      topWeaknesses,
      priorityImprovements,
    };

    // Generate improvement suggestions
    const improvements = await this.generateImprovements(request, dimensions);

    // Compare against best practices
    const bestPractices = await this.compareBestPractices(request, dimensions);

    // Estimate engagement
    const estimatedEngagement = this.estimateEngagement(overallScore, request.platform);

    const result: AnalysisResult = {
      analysisId: this.generateId('analysis'),
      contentId: request.contentId,
      score,
      improvements,
      bestPractices,
      estimatedEngagement,
      analyzedAt: new Date().toISOString(),
    };

    this.analyses.set(result.analysisId, result);
    return result;
  }

  // ============================================================================
  // DIMENSION ANALYSIS (10 DIMENSIONS)
  // ============================================================================

  /**
   * Analyze content across 10 dimensions
   */
  private async analyzeDimensions(request: ContentAnalysisRequest): Promise<DimensionScore[]> {
    return [
      await this.analyzeHook(request),
      await this.analyzeStructure(request),
      await this.analyzePacing(request),
      await this.analyzeClarity(request),
      await this.analyzeEngagement(request),
      await this.analyzeEmotionalImpact(request),
      await this.analyzeValueDelivery(request),
      await this.analyzeCallToAction(request),
      await this.analyzeSEO(request),
      await this.analyzeTechnicalQuality(request),
    ];
  }

  /**
   * 1. Hook Analysis (First 3-5 seconds)
   */
  private async analyzeHook(request: ContentAnalysisRequest): Promise<DimensionScore> {
    const firstSentences = request.transcript.split('.').slice(0, 2).join('.');
    const titleStrength = this.evaluateTitleStrength(request.title);
    
    // Check for hook elements
    const hasQuestion = /\?/.test(firstSentences);
    const hasBoldClaim = /amazing|incredible|shocking|secret|never|always/i.test(firstSentences);
    const hasNumbers = /\d+/.test(firstSentences);
    const hasEmotionalWords = /love|hate|fear|excited|worried/i.test(firstSentences);

    let score = 5;
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const suggestions: string[] = [];

    if (titleStrength > 7) {
      score += 1.5;
      strengths.push('Strong, attention-grabbing title');
    } else {
      weaknesses.push('Title could be more compelling');
      suggestions.push('Add numbers, power words, or curiosity gaps to title');
    }

    if (hasQuestion) {
      score += 1;
      strengths.push('Opens with engaging question');
    }

    if (hasBoldClaim) {
      score += 1;
      strengths.push('Uses bold claims to capture attention');
    }

    if (hasNumbers) {
      score += 0.5;
      strengths.push('Includes specific numbers/data');
    }

    if (!hasQuestion && !hasBoldClaim) {
      weaknesses.push('Hook lacks strong attention-grabber');
      suggestions.push('Start with a question, bold claim, or surprising statement');
    }

    if (firstSentences.length > 200) {
      score -= 1;
      weaknesses.push('Hook is too long');
      suggestions.push('Shorten opening to under 150 characters');
    }

    const feedback = score >= 7 
      ? 'Strong hook that captures attention effectively'
      : score >= 5
      ? 'Decent hook but could be more compelling'
      : 'Hook needs significant improvement to capture attention';

    return {
      dimension: 'Hook',
      score: Math.min(10, Math.max(0, score)),
      feedback,
      strengths,
      weaknesses,
      suggestions,
    };
  }

  /**
   * 2. Structure Analysis
   */
  private async analyzeStructure(request: ContentAnalysisRequest): Promise<DimensionScore> {
    const paragraphs = request.transcript.split('\n\n').filter(p => p.trim());
    const sentences = request.transcript.split(/[.!?]+/).filter(s => s.trim());
    
    let score = 5;
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const suggestions: string[] = [];

    // Check for clear structure
    const hasIntro = paragraphs.length > 0;
    const hasBody = paragraphs.length > 2;
    const hasConclusion = paragraphs.length > 1;

    if (hasIntro && hasBody && hasConclusion) {
      score += 2;
      strengths.push('Clear three-part structure (intro, body, conclusion)');
    } else {
      weaknesses.push('Structure is unclear or incomplete');
      suggestions.push('Organize content into clear intro, body, and conclusion');
    }

    // Check for logical flow
    const avgSentencesPerParagraph = sentences.length / paragraphs.length;
    if (avgSentencesPerParagraph >= 3 && avgSentencesPerParagraph <= 6) {
      score += 1.5;
      strengths.push('Well-balanced paragraph lengths');
    } else if (avgSentencesPerParagraph < 3) {
      weaknesses.push('Paragraphs are too short');
      suggestions.push('Expand paragraphs with more detail and examples');
    } else {
      weaknesses.push('Paragraphs are too long');
      suggestions.push('Break long paragraphs into smaller, digestible chunks');
    }

    // Check for transitions
    const hasTransitions = /first|second|next|then|finally|however|therefore|additionally/i.test(request.transcript);
    if (hasTransitions) {
      score += 1.5;
      strengths.push('Uses transition words for smooth flow');
    } else {
      weaknesses.push('Lacks clear transitions between ideas');
      suggestions.push('Add transition words to connect ideas smoothly');
    }

    const feedback = score >= 7
      ? 'Excellent structure with clear organization'
      : score >= 5
      ? 'Decent structure but could be more organized'
      : 'Structure needs significant improvement';

    return {
      dimension: 'Structure',
      score: Math.min(10, Math.max(0, score)),
      feedback,
      strengths,
      weaknesses,
      suggestions,
    };
  }

  /**
   * 3. Pacing Analysis
   */
  private async analyzePacing(request: ContentAnalysisRequest): Promise<DimensionScore> {
    const sentences = request.transcript.split(/[.!?]+/).filter(s => s.trim());
    const words = request.transcript.split(/\s+/).filter(w => w.trim());
    const avgWordsPerSentence = words.length / sentences.length;
    
    let score = 5;
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const suggestions: string[] = [];

    // Optimal: 15-25 words per sentence
    if (avgWordsPerSentence >= 15 && avgWordsPerSentence <= 25) {
      score += 2;
      strengths.push('Optimal sentence length for readability');
    } else if (avgWordsPerSentence < 15) {
      score += 0.5;
      strengths.push('Short, punchy sentences');
      suggestions.push('Consider varying sentence length for better rhythm');
    } else {
      score -= 1;
      weaknesses.push('Sentences are too long');
      suggestions.push('Break long sentences into shorter ones for better pacing');
    }

    // Check for variety in sentence length
    const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
    const variance = this.calculateVariance(sentenceLengths);
    
    if (variance > 20) {
      score += 2;
      strengths.push('Good variety in sentence length creates rhythm');
    } else {
      weaknesses.push('Monotonous sentence length');
      suggestions.push('Vary sentence length to create better pacing');
    }

    // Check for momentum builders
    const hasMomentum = /but|however|and then|suddenly|imagine|now|here's the thing/i.test(request.transcript);
    if (hasMomentum) {
      score += 1;
      strengths.push('Uses momentum-building phrases');
    }

    const feedback = score >= 7
      ? 'Excellent pacing that keeps audience engaged'
      : score >= 5
      ? 'Decent pacing but could be more dynamic'
      : 'Pacing needs improvement to maintain interest';

    return {
      dimension: 'Pacing',
      score: Math.min(10, Math.max(0, score)),
      feedback,
      strengths,
      weaknesses,
      suggestions,
    };
  }

  /**
   * 4. Clarity Analysis
   */
  private async analyzeClarity(request: ContentAnalysisRequest): Promise<DimensionScore> {
    const words = request.transcript.split(/\s+/).filter(w => w.trim());
    const complexWords = words.filter(w => w.length > 12).length;
    const complexityRatio = complexWords / words.length;
    
    let score = 5;
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const suggestions: string[] = [];

    // Check complexity
    if (complexityRatio < 0.1) {
      score += 2;
      strengths.push('Clear, simple language');
    } else if (complexityRatio > 0.2) {
      score -= 1;
      weaknesses.push('Too many complex words');
      suggestions.push('Simplify language for broader audience');
    }

    // Check for jargon
    const hasJargon = /synergy|leverage|paradigm|utilize|facilitate/i.test(request.transcript);
    if (hasJargon) {
      score -= 0.5;
      weaknesses.push('Contains unnecessary jargon');
      suggestions.push('Replace jargon with plain language');
    } else {
      strengths.push('Avoids unnecessary jargon');
    }

    // Check for examples
    const hasExamples = /for example|such as|like|imagine|let's say/i.test(request.transcript);
    if (hasExamples) {
      score += 1.5;
      strengths.push('Uses examples to clarify concepts');
    } else {
      weaknesses.push('Lacks concrete examples');
      suggestions.push('Add specific examples to illustrate points');
    }

    // Check for definitions
    const hasDefinitions = /means|is defined as|refers to|in other words/i.test(request.transcript);
    if (hasDefinitions) {
      score += 1;
      strengths.push('Defines key terms clearly');
    }

    const feedback = score >= 7
      ? 'Crystal clear communication'
      : score >= 5
      ? 'Generally clear but could be simpler'
      : 'Clarity needs significant improvement';

    return {
      dimension: 'Clarity',
      score: Math.min(10, Math.max(0, score)),
      feedback,
      strengths,
      weaknesses,
      suggestions,
    };
  }

  /**
   * 5. Engagement Analysis
   */
  private async analyzeEngagement(request: ContentAnalysisRequest): Promise<DimensionScore> {
    let score = 5;
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const suggestions: string[] = [];

    // Check for questions
    const questionCount = (request.transcript.match(/\?/g) || []).length;
    if (questionCount >= 3) {
      score += 2;
      strengths.push('Engages audience with questions');
    } else if (questionCount === 0) {
      weaknesses.push('No questions to engage audience');
      suggestions.push('Ask questions to involve your audience');
    }

    // Check for direct address
    const hasDirectAddress = /you|your|you're|you'll/i.test(request.transcript);
    if (hasDirectAddress) {
      score += 1.5;
      strengths.push('Speaks directly to audience');
    } else {
      weaknesses.push('Lacks direct audience address');
      suggestions.push('Use "you" to speak directly to viewers');
    }

    // Check for storytelling
    const hasStory = /story|remember when|once|happened|experience/i.test(request.transcript);
    if (hasStory) {
      score += 1.5;
      strengths.push('Incorporates storytelling elements');
    } else {
      suggestions.push('Add personal stories or anecdotes');
    }

    // Check for emotional language
    const hasEmotion = /love|excited|frustrated|amazing|terrible|wonderful/i.test(request.transcript);
    if (hasEmotion) {
      score += 1;
      strengths.push('Uses emotional language');
    } else {
      weaknesses.push('Lacks emotional connection');
      suggestions.push('Add emotional language to connect with audience');
    }

    const feedback = score >= 7
      ? 'Highly engaging content'
      : score >= 5
      ? 'Moderately engaging'
      : 'Needs more engagement elements';

    return {
      dimension: 'Engagement',
      score: Math.min(10, Math.max(0, score)),
      feedback,
      strengths,
      weaknesses,
      suggestions,
    };
  }

  /**
   * 6. Emotional Impact Analysis
   */
  private async analyzeEmotionalImpact(request: ContentAnalysisRequest): Promise<DimensionScore> {
    let score = 5;
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const suggestions: string[] = [];

    // Positive emotions
    const positiveWords = (request.transcript.match(/happy|joy|excited|love|amazing|wonderful|great|excellent/gi) || []).length;
    
    // Negative emotions
    const negativeWords = (request.transcript.match(/sad|angry|frustrated|terrible|awful|hate|worried|fear/gi) || []).length;
    
    // Surprise/curiosity
    const surpriseWords = (request.transcript.match(/surprising|shocking|unexpected|believe|imagine|guess what/gi) || []).length;

    const totalEmotionalWords = positiveWords + negativeWords + surpriseWords;
    const words = request.transcript.split(/\s+/).length;
    const emotionalDensity = totalEmotionalWords / words;

    if (emotionalDensity > 0.05) {
      score += 2;
      strengths.push('Strong emotional language throughout');
    } else if (emotionalDensity < 0.02) {
      score -= 1;
      weaknesses.push('Lacks emotional depth');
      suggestions.push('Incorporate more emotional language');
    }

    // Check for personal vulnerability
    const hasVulnerability = /struggled|failed|learned|mistake|challenge|difficult/i.test(request.transcript);
    if (hasVulnerability) {
      score += 2;
      strengths.push('Shows vulnerability and authenticity');
    } else {
      suggestions.push('Share personal challenges to build connection');
    }

    // Check for empathy
    const hasEmpathy = /understand|feel|know how|been there|relate/i.test(request.transcript);
    if (hasEmpathy) {
      score += 1;
      strengths.push('Demonstrates empathy with audience');
    }

    const feedback = score >= 7
      ? 'Powerful emotional impact'
      : score >= 5
      ? 'Moderate emotional resonance'
      : 'Needs stronger emotional connection';

    return {
      dimension: 'Emotional Impact',
      score: Math.min(10, Math.max(0, score)),
      feedback,
      strengths,
      weaknesses,
      suggestions,
    };
  }

  /**
   * 7. Value Delivery Analysis
   */
  private async analyzeValueDelivery(request: ContentAnalysisRequest): Promise<DimensionScore> {
    let score = 5;
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const suggestions: string[] = [];

    // Check for actionable tips
    const hasTips = /tip|trick|hack|method|technique|strategy|step|way to/i.test(request.transcript);
    if (hasTips) {
      score += 2;
      strengths.push('Provides actionable tips');
    } else {
      weaknesses.push('Lacks actionable takeaways');
      suggestions.push('Add specific tips or steps viewers can implement');
    }

    // Check for numbered lists
    const hasNumbers = /first|second|third|1\.|2\.|3\.|number one|number two/i.test(request.transcript);
    if (hasNumbers) {
      score += 1.5;
      strengths.push('Organizes information with numbered points');
    } else {
      suggestions.push('Use numbered lists for better organization');
    }

    // Check for benefits
    const hasBenefits = /benefit|advantage|help you|allow you|enable you|will get/i.test(request.transcript);
    if (hasBenefits) {
      score += 1.5;
      strengths.push('Clearly states benefits');
    } else {
      weaknesses.push('Does not clearly state benefits');
      suggestions.push('Explicitly state what viewers will gain');
    }

    // Check for proof/credibility
    const hasProof = /study|research|data|statistics|proven|tested|results/i.test(request.transcript);
    if (hasProof) {
      score += 1;
      strengths.push('Backs claims with evidence');
    } else {
      suggestions.push('Add data or proof to support claims');
    }

    const feedback = score >= 7
      ? 'Delivers exceptional value'
      : score >= 5
      ? 'Provides decent value'
      : 'Value delivery needs improvement';

    return {
      dimension: 'Value Delivery',
      score: Math.min(10, Math.max(0, score)),
      feedback,
      strengths,
      weaknesses,
      suggestions,
    };
  }

  /**
   * 8. Call-to-Action Analysis
   */
  private async analyzeCallToAction(request: ContentAnalysisRequest): Promise<DimensionScore> {
    let score = 5;
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const suggestions: string[] = [];

    // Check for CTA presence
    const hasCTA = /subscribe|like|comment|share|follow|click|download|visit|check out|link in|sign up/i.test(request.transcript);
    if (hasCTA) {
      score += 3;
      strengths.push('Includes clear call-to-action');
    } else {
      score -= 2;
      weaknesses.push('Missing call-to-action');
      suggestions.push('Add a clear CTA (subscribe, like, comment, etc.)');
    }

    // Check for urgency
    const hasUrgency = /now|today|don't wait|limited|hurry|before|deadline/i.test(request.transcript);
    if (hasUrgency) {
      score += 1.5;
      strengths.push('Creates urgency');
    } else {
      suggestions.push('Add urgency to encourage immediate action');
    }

    // Check for benefit in CTA
    const hasBenefitCTA = /so you can|to help you|you'll get|you'll learn|you'll discover/i.test(request.transcript);
    if (hasBenefitCTA) {
      score += 1.5;
      strengths.push('CTA emphasizes benefits');
    } else {
      suggestions.push('Explain the benefit of taking action');
    }

    // Check for multiple CTAs
    const ctaCount = (request.transcript.match(/subscribe|like|comment|share|follow/gi) || []).length;
    if (ctaCount > 3) {
      score -= 1;
      weaknesses.push('Too many CTAs may dilute effectiveness');
      suggestions.push('Focus on 1-2 primary CTAs');
    }

    const feedback = score >= 7
      ? 'Strong, clear call-to-action'
      : score >= 5
      ? 'Has CTA but could be stronger'
      : 'CTA needs significant improvement';

    return {
      dimension: 'Call-to-Action',
      score: Math.min(10, Math.max(0, score)),
      feedback,
      strengths,
      weaknesses,
      suggestions,
    };
  }

  /**
   * 9. SEO Analysis
   */
  private async analyzeSEO(request: ContentAnalysisRequest): Promise<DimensionScore> {
    let score = 5;
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const suggestions: string[] = [];

    // Title length (optimal: 50-60 characters)
    const titleLength = request.title.length;
    if (titleLength >= 50 && titleLength <= 60) {
      score += 1.5;
      strengths.push('Optimal title length for SEO');
    } else if (titleLength < 50) {
      weaknesses.push('Title is too short');
      suggestions.push('Expand title to 50-60 characters');
    } else {
      weaknesses.push('Title is too long');
      suggestions.push('Shorten title to 50-60 characters');
    }

    // Title has keywords
    const titleHasKeywords = /how to|best|guide|tips|tutorial|review|vs|top/i.test(request.title);
    if (titleHasKeywords) {
      score += 1.5;
      strengths.push('Title includes searchable keywords');
    } else {
      weaknesses.push('Title lacks SEO keywords');
      suggestions.push('Add keywords like "how to", "best", "guide", etc.');
    }

    // Description length (optimal: 150-160 characters)
    if (request.description) {
      const descLength = request.description.length;
      if (descLength >= 150 && descLength <= 160) {
        score += 1.5;
        strengths.push('Optimal description length');
      } else {
        suggestions.push('Optimize description to 150-160 characters');
      }
    } else {
      score -= 1;
      weaknesses.push('Missing description');
      suggestions.push('Add a compelling description');
    }

    // Keyword density
    const words = request.transcript.toLowerCase().split(/\s+/);
    const wordFreq = new Map<string, number>();
    words.forEach(w => {
      if (w.length > 4) { // Only count meaningful words
        wordFreq.set(w, (wordFreq.get(w) || 0) + 1);
      }
    });
    
    const topKeywords = Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    if (topKeywords.length > 0 && topKeywords[0][1] >= 3) {
      score += 1.5;
      strengths.push('Good keyword repetition');
    } else {
      suggestions.push('Repeat main keywords 3-5 times naturally');
    }

    // Has timestamps (for video)
    const hasTimestamps = /\d+:\d+/.test(request.transcript);
    if (hasTimestamps) {
      score += 1;
      strengths.push('Includes timestamps for better navigation');
    } else if (request.platform === 'youtube') {
      suggestions.push('Add timestamps to improve SEO and user experience');
    }

    const feedback = score >= 7
      ? 'Well-optimized for search'
      : score >= 5
      ? 'Basic SEO but could be better'
      : 'SEO needs significant improvement';

    return {
      dimension: 'SEO',
      score: Math.min(10, Math.max(0, score)),
      feedback,
      strengths,
      weaknesses,
      suggestions,
    };
  }

  /**
   * 10. Technical Quality Analysis
   */
  private async analyzeTechnicalQuality(request: ContentAnalysisRequest): Promise<DimensionScore> {
    let score = 5;
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const suggestions: string[] = [];

    // Grammar check (basic)
    const hasGrammarIssues = /\s{2,}|\.{2,}|,,|\s,|\s\./g.test(request.transcript);
    if (!hasGrammarIssues) {
      score += 2;
      strengths.push('Clean formatting and grammar');
    } else {
      weaknesses.push('Formatting issues detected');
      suggestions.push('Proofread for grammar and formatting errors');
    }

    // Check for filler words
    const fillerWords = (request.transcript.match(/\bum\b|\buh\b|\blike\b|\byou know\b|\bbasically\b|\bactually\b/gi) || []).length;
    const words = request.transcript.split(/\s+/).length;
    const fillerRatio = fillerWords / words;
    
    if (fillerRatio < 0.02) {
      score += 2;
      strengths.push('Minimal filler words');
    } else if (fillerRatio > 0.05) {
      score -= 1;
      weaknesses.push('Too many filler words');
      suggestions.push('Reduce filler words (um, uh, like, you know)');
    }

    // Check duration (if provided)
    if (request.duration) {
      const optimalDuration = this.getOptimalDuration(request.platform);
      if (request.duration >= optimalDuration.min && request.duration <= optimalDuration.max) {
        score += 2;
        strengths.push('Optimal duration for platform');
      } else if (request.duration < optimalDuration.min) {
        weaknesses.push('Content is too short');
        suggestions.push(`Aim for ${optimalDuration.min}-${optimalDuration.max} seconds`);
      } else {
        weaknesses.push('Content is too long');
        suggestions.push(`Shorten to ${optimalDuration.min}-${optimalDuration.max} seconds`);
      }
    }

    // Check for proper capitalization
    const sentences = request.transcript.split(/[.!?]+/).filter(s => s.trim());
    const properlyCapitalized = sentences.filter(s => /^[A-Z]/.test(s.trim())).length;
    const capitalizationRatio = properlyCapitalized / sentences.length;
    
    if (capitalizationRatio > 0.9) {
      score += 1;
      strengths.push('Proper capitalization');
    } else {
      weaknesses.push('Inconsistent capitalization');
      suggestions.push('Capitalize the first letter of each sentence');
    }

    const feedback = score >= 7
      ? 'High technical quality'
      : score >= 5
      ? 'Acceptable technical quality'
      : 'Technical quality needs improvement';

    return {
      dimension: 'Technical Quality',
      score: Math.min(10, Math.max(0, score)),
      feedback,
      strengths,
      weaknesses,
      suggestions,
    };
  }

  // ============================================================================
  // SCORING & GRADING
  // ============================================================================

  /**
   * Calculate overall score from dimensions
   */
  private calculateOverallScore(dimensions: DimensionScore[]): number {
    const total = dimensions.reduce((sum, d) => sum + d.score, 0);
    return Math.round((total / dimensions.length) * 10); // Convert to 0-100 scale
  }

  /**
   * Calculate letter grade
   */
  private calculateGrade(score: number): 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F' {
    if (score >= 97) return 'A+';
    if (score >= 93) return 'A';
    if (score >= 87) return 'B+';
    if (score >= 83) return 'B';
    if (score >= 77) return 'C+';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * Extract top 3 strengths
   */
  private extractTopStrengths(dimensions: DimensionScore[]): string[] {
    const allStrengths: Array<{ strength: string; score: number }> = [];
    
    dimensions.forEach(d => {
      d.strengths.forEach(s => {
        allStrengths.push({ strength: s, score: d.score });
      });
    });

    return allStrengths
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(s => s.strength);
  }

  /**
   * Extract top 3 weaknesses
   */
  private extractTopWeaknesses(dimensions: DimensionScore[]): string[] {
    const allWeaknesses: Array<{ weakness: string; score: number }> = [];
    
    dimensions.forEach(d => {
      d.weaknesses.forEach(w => {
        allWeaknesses.push({ weakness: w, score: d.score });
      });
    });

    return allWeaknesses
      .sort((a, b) => a.score - b.score) // Lowest scores first
      .slice(0, 3)
      .map(w => w.weakness);
  }

  /**
   * Generate priority improvements
   */
  private generatePriorityImprovements(dimensions: DimensionScore[]): string[] {
    const improvements: Array<{ suggestion: string; score: number }> = [];
    
    dimensions.forEach(d => {
      d.suggestions.forEach(s => {
        improvements.push({ suggestion: s, score: d.score });
      });
    });

    return improvements
      .sort((a, b) => a.score - b.score) // Lowest scores = highest priority
      .slice(0, 5)
      .map(i => i.suggestion);
  }

  /**
   * Generate summary
   */
  private generateSummary(
    score: number,
    grade: string,
    strengths: string[],
    weaknesses: string[]
  ): string {
    if (score >= 90) {
      return `Excellent content (${grade})! Your ${strengths[0]?.toLowerCase() || 'content'} stands out. Minor tweaks to ${weaknesses[0]?.toLowerCase() || 'some areas'} will make it even better.`;
    } else if (score >= 80) {
      return `Strong content (${grade}). Your ${strengths[0]?.toLowerCase() || 'strengths'} are impressive. Focus on improving ${weaknesses[0]?.toLowerCase() || 'weaker areas'} for even better results.`;
    } else if (score >= 70) {
      return `Good foundation (${grade}). Build on your ${strengths[0]?.toLowerCase() || 'strengths'} and address ${weaknesses[0]?.toLowerCase() || 'key weaknesses'} to reach the next level.`;
    } else if (score >= 60) {
      return `Decent start (${grade}), but significant improvements needed. Focus on ${weaknesses[0]?.toLowerCase() || 'core issues'} first, then enhance ${strengths[0]?.toLowerCase() || 'your strengths'}.`;
    } else {
      return `Needs major revision (${grade}). Start by addressing ${weaknesses[0]?.toLowerCase() || 'fundamental issues'}, then work on building stronger ${strengths[0]?.toLowerCase() || 'content elements'}.`;
    }
  }

  // ============================================================================
  // IMPROVEMENT SUGGESTIONS
  // ============================================================================

  /**
   * Generate detailed improvement suggestions
   */
  private async generateImprovements(
    request: ContentAnalysisRequest,
    dimensions: DimensionScore[]
  ): Promise<ImprovementSuggestion[]> {
    const improvements: ImprovementSuggestion[] = [];

    // Generate improvements from low-scoring dimensions
    const lowScoreDimensions = dimensions.filter(d => d.score < 7).sort((a, b) => a.score - b.score);

    lowScoreDimensions.forEach((dim, index) => {
      dim.suggestions.forEach((suggestion, sugIndex) => {
        if (improvements.length < 10) { // Limit to top 10
          improvements.push({
            suggestionId: this.generateId('suggestion'),
            category: this.categorizeSuggestion(dim.dimension),
            priority: index === 0 && sugIndex === 0 ? 'high' : index < 2 ? 'medium' : 'low',
            title: suggestion,
            description: this.expandSuggestion(suggestion, dim.dimension),
            impact: this.estimateImpact(dim.dimension, dim.score),
            effort: this.estimateEffort(suggestion),
            examples: this.getExamples(suggestion),
          });
        }
      });
    });

    return improvements;
  }

  /**
   * Categorize suggestion
   */
  private categorizeSuggestion(dimension: string): ImprovementSuggestion['category'] {
    const categoryMap: Record<string, ImprovementSuggestion['category']> = {
      'Hook': 'engagement',
      'Structure': 'structure',
      'Pacing': 'pacing',
      'Clarity': 'clarity',
      'Engagement': 'engagement',
      'Emotional Impact': 'engagement',
      'Value Delivery': 'clarity',
      'Call-to-Action': 'engagement',
      'SEO': 'seo',
      'Technical Quality': 'technical',
    };
    return categoryMap[dimension] || 'structure';
  }

  /**
   * Expand suggestion with details
   */
  private expandSuggestion(suggestion: string, dimension: string): string {
    // Provide context-specific expansion
    if (suggestion.includes('hook')) {
      return 'A strong hook in the first 3-5 seconds is critical for retention. Use questions, bold claims, or surprising statements to immediately capture attention.';
    } else if (suggestion.includes('structure')) {
      return 'Clear structure helps viewers follow your content. Use a three-part format: intro (hook + preview), body (main content), conclusion (summary + CTA).';
    } else if (suggestion.includes('CTA')) {
      return 'A clear call-to-action tells viewers what to do next. Be specific (subscribe, like, comment) and explain the benefit of taking action.';
    } else if (suggestion.includes('SEO')) {
      return 'SEO optimization helps your content get discovered. Use relevant keywords naturally in title, description, and throughout the content.';
    }
    return `Improving ${dimension.toLowerCase()} will enhance overall content quality and audience engagement.`;
  }

  /**
   * Estimate impact of improvement
   */
  private estimateImpact(dimension: string, currentScore: number): string {
    const gap = 10 - currentScore;
    if (gap >= 5) {
      return `High impact: Could improve ${dimension.toLowerCase()} score by ${gap} points and significantly boost engagement.`;
    } else if (gap >= 3) {
      return `Medium impact: Could improve ${dimension.toLowerCase()} score by ${gap} points and enhance viewer experience.`;
    } else {
      return `Low impact: Minor improvement to ${dimension.toLowerCase()}, but every detail matters.`;
    }
  }

  /**
   * Estimate effort required
   */
  private estimateEffort(suggestion: string): 'easy' | 'moderate' | 'difficult' {
    if (suggestion.includes('Add') || suggestion.includes('Include')) {
      return 'easy';
    } else if (suggestion.includes('Rewrite') || suggestion.includes('Restructure')) {
      return 'difficult';
    } else {
      return 'moderate';
    }
  }

  /**
   * Get examples for suggestion
   */
  private getExamples(suggestion: string): string[] {
    if (suggestion.includes('question')) {
      return [
        '"Have you ever wondered why...?"',
        '"What if I told you that...?"',
        '"Do you struggle with...?"',
      ];
    } else if (suggestion.includes('hook')) {
      return [
        '"This changed everything for me..."',
        '"The secret that nobody talks about..."',
        '"I made a $10,000 mistake so you don\'t have to..."',
      ];
    } else if (suggestion.includes('CTA')) {
      return [
        '"Subscribe for more tips like this"',
        '"Drop a comment with your biggest challenge"',
        '"Hit like if this helped you"',
      ];
    }
    return [];
  }

  // ============================================================================
  // BEST PRACTICES COMPARISON
  // ============================================================================

  /**
   * Compare against platform best practices
   */
  private async compareBestPractices(
    request: ContentAnalysisRequest,
    dimensions: DimensionScore[]
  ): Promise<BestPracticeComparison[]> {
    const comparisons: BestPracticeComparison[] = [];

    // Duration best practice
    if (request.duration) {
      const optimal = this.getOptimalDuration(request.platform);
      const gap = request.duration < optimal.min || request.duration > optimal.max ? 'major_gap' : 'aligned';
      comparisons.push({
        practice: 'Content Duration',
        yourContent: `${request.duration} seconds`,
        bestPractice: `${optimal.min}-${optimal.max} seconds for ${request.platform}`,
        gap,
        recommendation: gap === 'aligned' 
          ? 'Perfect duration for the platform'
          : `Adjust to ${optimal.min}-${optimal.max} seconds for optimal performance`,
      });
    }

    // Title length best practice
    const titleLength = request.title.length;
    const titleGap = titleLength < 50 || titleLength > 60 ? 'minor_gap' : 'aligned';
    comparisons.push({
      practice: 'Title Length',
      yourContent: `${titleLength} characters`,
      bestPractice: '50-60 characters',
      gap: titleGap,
      recommendation: titleGap === 'aligned'
        ? 'Optimal title length'
        : titleLength < 50
        ? 'Expand title with more descriptive keywords'
        : 'Shorten title to improve click-through rate',
    });

    // Hook timing
    const hookDim = dimensions.find(d => d.dimension === 'Hook');
    if (hookDim) {
      const hookGap = hookDim.score < 7 ? 'major_gap' : hookDim.score < 9 ? 'minor_gap' : 'aligned';
      comparisons.push({
        practice: 'Hook Strength',
        yourContent: `Score: ${hookDim.score}/10`,
        bestPractice: 'Strong hook in first 3-5 seconds',
        gap: hookGap,
        recommendation: hookGap === 'aligned'
          ? 'Excellent hook that captures attention'
          : 'Strengthen opening with question, bold claim, or surprising statement',
      });
    }

    // CTA presence
    const ctaDim = dimensions.find(d => d.dimension === 'Call-to-Action');
    if (ctaDim) {
      const ctaGap = ctaDim.score < 7 ? 'major_gap' : ctaDim.score < 9 ? 'minor_gap' : 'aligned';
      comparisons.push({
        practice: 'Call-to-Action',
        yourContent: `Score: ${ctaDim.score}/10`,
        bestPractice: 'Clear CTA with benefit stated',
        gap: ctaGap,
        recommendation: ctaGap === 'aligned'
          ? 'Strong, clear call-to-action'
          : 'Add specific CTA (subscribe, like, comment) with clear benefit',
      });
    }

    // Engagement elements
    const engagementDim = dimensions.find(d => d.dimension === 'Engagement');
    if (engagementDim) {
      const engagementGap = engagementDim.score < 7 ? 'major_gap' : engagementDim.score < 9 ? 'minor_gap' : 'aligned';
      comparisons.push({
        practice: 'Audience Engagement',
        yourContent: `Score: ${engagementDim.score}/10`,
        bestPractice: 'Direct address, questions, storytelling',
        gap: engagementGap,
        recommendation: engagementGap === 'aligned'
          ? 'Highly engaging content'
          : 'Add more questions, direct address ("you"), and personal stories',
      });
    }

    return comparisons;
  }

  // ============================================================================
  // ENGAGEMENT ESTIMATION
  // ============================================================================

  /**
   * Estimate engagement based on score
   */
  private estimateEngagement(score: number, platform: string): {
    views: string;
    engagement: string;
    viralPotential: number;
  } {
    // Base estimates on score
    let viewsMultiplier = 1;
    let engagementRate = 2;
    let viralPotential = score;

    if (score >= 90) {
      viewsMultiplier = 5;
      engagementRate = 8;
      viralPotential = 85;
    } else if (score >= 80) {
      viewsMultiplier = 3;
      engagementRate = 6;
      viralPotential = 70;
    } else if (score >= 70) {
      viewsMultiplier = 2;
      engagementRate = 4;
      viralPotential = 50;
    } else if (score >= 60) {
      viewsMultiplier = 1.5;
      engagementRate = 3;
      viralPotential = 30;
    } else {
      viewsMultiplier = 1;
      engagementRate = 2;
      viralPotential = 15;
    }

    // Platform-specific adjustments
    const platformMultipliers: Record<string, number> = {
      'youtube': 1.0,
      'tiktok': 2.0,
      'instagram': 1.5,
      'twitter': 0.8,
      'linkedin': 0.6,
      'blog': 0.5,
    };

    const platformMultiplier = platformMultipliers[platform] || 1.0;
    const finalMultiplier = viewsMultiplier * platformMultiplier;

    return {
      views: this.formatViewEstimate(finalMultiplier),
      engagement: `${engagementRate.toFixed(1)}%`,
      viralPotential: Math.round(viralPotential),
    };
  }

  /**
   * Format view estimate
   */
  private formatViewEstimate(multiplier: number): string {
    const baseViews = 1000;
    const estimatedViews = baseViews * multiplier;

    if (estimatedViews >= 1000000) {
      return `${(estimatedViews / 1000000).toFixed(1)}M+`;
    } else if (estimatedViews >= 1000) {
      return `${(estimatedViews / 1000).toFixed(1)}K+`;
    } else {
      return `${Math.round(estimatedViews)}+`;
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Evaluate title strength
   */
  private evaluateTitleStrength(title: string): number {
    let score = 5;

    // Has numbers
    if (/\d+/.test(title)) score += 1;

    // Has power words
    if (/best|top|ultimate|complete|essential|proven|secret|amazing/i.test(title)) score += 1;

    // Has year
    if (/202\d/.test(title)) score += 0.5;

    // Has brackets
    if (/\[|\(/.test(title)) score += 0.5;

    // Optimal length
    if (title.length >= 50 && title.length <= 60) score += 1;

    // Has question
    if (/\?/.test(title)) score += 1;

    return Math.min(10, score);
  }

  /**
   * Calculate variance
   */
  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
    const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2));
    return squaredDiffs.reduce((sum, d) => sum + d, 0) / numbers.length;
  }

  /**
   * Get optimal duration for platform
   */
  private getOptimalDuration(platform: string): { min: number; max: number } {
    const durations: Record<string, { min: number; max: number }> = {
      'youtube': { min: 480, max: 900 }, // 8-15 minutes
      'tiktok': { min: 15, max: 60 }, // 15-60 seconds
      'instagram': { min: 15, max: 90 }, // 15-90 seconds
      'twitter': { min: 30, max: 140 }, // 30-140 seconds
      'linkedin': { min: 60, max: 180 }, // 1-3 minutes
      'blog': { min: 300, max: 600 }, // 5-10 minutes read time
    };
    return durations[platform] || { min: 60, max: 300 };
  }

  /**
   * Get analysis by ID
   */
  getAnalysis(analysisId: string): AnalysisResult | null {
    return this.analyses.get(analysisId) || null;
  }

  /**
   * Get user's analysis history
   */
  getUserAnalyses(userId: string, limit: number = 20): AnalysisResult[] {
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
  getMockAnalysis(): AnalysisResult {
    return {
      analysisId: 'analysis_001',
      contentId: 'content_001',
      score: {
        overallScore: 82,
        grade: 'B',
        dimensions: [
          {
            dimension: 'Hook',
            score: 9,
            feedback: 'Strong hook that captures attention effectively',
            strengths: ['Strong, attention-grabbing title', 'Opens with engaging question'],
            weaknesses: [],
            suggestions: [],
          },
          {
            dimension: 'Structure',
            score: 8,
            feedback: 'Excellent structure with clear organization',
            strengths: ['Clear three-part structure', 'Well-balanced paragraph lengths'],
            weaknesses: [],
            suggestions: ['Add more transition words'],
          },
          // ... other dimensions
        ],
        summary: 'Strong content (B). Your hook and structure are impressive. Focus on improving SEO and call-to-action for even better results.',
        topStrengths: ['Strong, attention-grabbing title', 'Clear three-part structure', 'Engages audience with questions'],
        topWeaknesses: ['Missing call-to-action', 'Title lacks SEO keywords', 'Lacks concrete examples'],
        priorityImprovements: [
          'Add a clear CTA (subscribe, like, comment, etc.)',
          'Add keywords like "how to", "best", "guide", etc.',
          'Add specific examples to illustrate points',
        ],
      },
      improvements: [
        {
          suggestionId: 'sug_001',
          category: 'engagement',
          priority: 'high',
          title: 'Add a clear CTA (subscribe, like, comment, etc.)',
          description: 'A clear call-to-action tells viewers what to do next. Be specific and explain the benefit.',
          impact: 'High impact: Could improve call-to-action score by 5 points and significantly boost engagement.',
          effort: 'easy',
          examples: ['"Subscribe for more tips like this"', '"Drop a comment with your biggest challenge"'],
        },
      ],
      bestPractices: [
        {
          practice: 'Title Length',
          yourContent: '45 characters',
          bestPractice: '50-60 characters',
          gap: 'minor_gap',
          recommendation: 'Expand title with more descriptive keywords',
        },
      ],
      estimatedEngagement: {
        views: '3.0K+',
        engagement: '6.0%',
        viralPotential: 70,
      },
      analyzedAt: new Date().toISOString(),
    };
  }
}

export const creativeDirectorService = new CreativeDirectorService();
