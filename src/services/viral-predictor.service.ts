/**
 * Viral Score Predictor Service
 * Predicts content virality based on multiple factors
 * Uses weighted scoring algorithm with AI-powered analysis
 */

import { GitHubModelsService } from './github-models.service';

export interface ViralPredictionRequest {
  transcript: string;
  metadata?: {
    duration?: number;
    platform?: string;
    category?: string;
    hasVisuals?: boolean;
  };
}

export interface ViralPrediction {
  score: number;
  factors: {
    hook: number;
    pacing: number;
    emotion: number;
    trending: number;
    length: number;
  };
  suggestions: string[];
  confidence: number;
  category: 'low' | 'medium' | 'high' | 'viral';
}

export interface ViralPredictionResponse {
  success: boolean;
  prediction: ViralPrediction;
  analyzedAt: Date;
}

export class ViralPredictorService {
  private githubModels: GitHubModelsService;

  // Weights for each factor
  private readonly WEIGHTS = {
    hook: 0.30,
    pacing: 0.20,
    emotion: 0.25,
    trending: 0.15,
    length: 0.10
  };

  constructor() {
    this.githubModels = new GitHubModelsService();
  }

  /**
   * Predict viral potential of content
   */
  async predictViralScore(request: ViralPredictionRequest): Promise<ViralPredictionResponse> {
    const { transcript, metadata } = request;

    // Analyze each factor
    const factors = {
      hook: await this.analyzeHook(transcript),
      pacing: await this.analyzePacing(transcript),
      emotion: await this.analyzeEmotion(transcript),
      trending: await this.analyzeTrending(transcript),
      length: this.analyzeLength(transcript, metadata?.duration)
    };

    // Calculate weighted score
    const score = this.calculateWeightedScore(factors);

    // Generate suggestions
    const suggestions = await this.generateSuggestions(factors, transcript, metadata);

    // Calculate confidence
    const confidence = this.calculateConfidence(factors);

    // Categorize score
    const category = this.categorizeScore(score);

    return {
      success: true,
      prediction: {
        score: Math.round(score),
        factors,
        suggestions,
        confidence: Math.round(confidence * 100) / 100,
        category
      },
      analyzedAt: new Date()
    };
  }

  /**
   * Analyze hook strength (first 3-5 seconds / ~100 characters)
   * Weight: 30% of total score
   */
  private async analyzeHook(transcript: string): Promise<number> {
    const hookText = transcript.substring(0, 150); // First ~150 chars

    const prompt = `You are a viral content expert analyzing video hooks.

TASK: Analyze the hook strength of this opening.

HOOK TEXT: "${hookText}"

EVALUATE:
1. Attention-grabbing (question, bold statement, curiosity gap)
2. Clarity (immediately clear what content is about)
3. Emotional trigger (surprise, curiosity, urgency)
4. Pattern interrupt (breaks scroll, stops viewer)
5. Value promise (clear benefit for watching)

OUTPUT FORMAT (JSON):
{
  "score": 0-100,
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"]
}

SCORING GUIDE:
- 0-40: Weak hook (generic, boring, unclear)
- 41-60: Decent hook (some interest, could be stronger)
- 61-80: Strong hook (compelling, clear value)
- 81-100: Viral hook (irresistible, pattern interrupt)

Generate the analysis in JSON format.`;

    try {
      const response = await this.githubModels.generate(prompt, {
        model: 'gpt-4o',
        temperature: 0.3,
        maxTokens: 300
      });

      const analysis = JSON.parse(response);
      return Math.min(Math.max(analysis.score, 0), 100);
    } catch (error) {
      console.error('Hook analysis failed:', error);
      // Fallback to heuristic analysis
      return this.analyzeHookHeuristic(hookText);
    }
  }

  /**
   * Fallback heuristic hook analysis
   */
  private analyzeHookHeuristic(hookText: string): number {
    let score = 60; // Base score

    const powerWords = ['amazing', 'shocking', 'secret', 'never', 'must', 'how to', 'why', 'what', 'discover', 'revealed'];
    const lowerHook = hookText.toLowerCase();

    powerWords.forEach(word => {
      if (lowerHook.includes(word)) score += 8;
    });

    // Bonus for questions
    if (hookText.includes('?')) score += 10;

    // Bonus for numbers
    if (/\d+/.test(hookText)) score += 5;

    return Math.min(score, 100);
  }

  /**
   * Analyze pacing (content flow and rhythm)
   * Weight: 20% of total score
   */
  private async analyzePacing(transcript: string): Promise<number> {
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    if (sentences.length === 0) return 50;

    // Calculate average sentence length
    const avgLength = sentences.reduce((sum, s) => sum + s.split(' ').length, 0) / sentences.length;

    // Calculate sentence length variance
    const variance = sentences.reduce((sum, s) => {
      const len = s.split(' ').length;
      return sum + Math.pow(len - avgLength, 2);
    }, 0) / sentences.length;

    const stdDev = Math.sqrt(variance);

    // Optimal: 15-25 words per sentence, with good variation
    let score = 50;

    // Score based on average length
    if (avgLength >= 15 && avgLength <= 25) {
      score += 30;
    } else if (avgLength >= 10 && avgLength <= 30) {
      score += 20;
    } else {
      score += 10;
    }

    // Score based on variation (higher variation = better pacing)
    if (stdDev > 5) {
      score += 20; // Good variation
    } else if (stdDev > 3) {
      score += 10; // Some variation
    }

    return Math.min(score, 100);
  }

  /**
   * Analyze emotional impact
   * Weight: 25% of total score
   */
  private async analyzeEmotion(transcript: string): Promise<number> {
    const prompt = `You are an emotional intelligence expert analyzing content.

TASK: Analyze the emotional impact of this content.

CONTENT: ${transcript.substring(0, 1000)}

EVALUATE:
1. Emotional language usage
2. Storytelling and relatability
3. Emotional peaks and valleys
4. Connection with audience
5. Authenticity and vulnerability

OUTPUT FORMAT (JSON):
{
  "score": 0-100,
  "emotions": ["emotion1", "emotion2"],
  "intensity": "low" | "medium" | "high"
}

SCORING GUIDE:
- 0-40: Flat, no emotional connection
- 41-60: Some emotional elements
- 61-80: Strong emotional impact
- 81-100: Deeply emotional, highly relatable

Generate the analysis in JSON format.`;

    try {
      const response = await this.githubModels.generate(prompt, {
        model: 'gpt-4o',
        temperature: 0.3,
        maxTokens: 300
      });

      const analysis = JSON.parse(response);
      return Math.min(Math.max(analysis.score, 0), 100);
    } catch (error) {
      console.error('Emotion analysis failed:', error);
      // Fallback to heuristic
      return this.analyzeEmotionHeuristic(transcript);
    }
  }

  /**
   * Fallback heuristic emotion analysis
   */
  private analyzeEmotionHeuristic(transcript: string): number {
    let score = 50;

    const emotionalWords = ['love', 'hate', 'amazing', 'terrible', 'incredible', 'shocking', 'wow', 'beautiful', 'awful', 'fantastic'];
    const lowerTranscript = transcript.toLowerCase();

    emotionalWords.forEach(word => {
      if (lowerTranscript.includes(word)) score += 6;
    });

    // Bonus for personal pronouns (storytelling)
    const personalPronouns = (transcript.match(/\b(I|me|my|we|our)\b/gi) || []).length;
    score += Math.min(personalPronouns * 2, 20);

    return Math.min(score, 100);
  }

  /**
   * Analyze trending topic relevance
   * Weight: 15% of total score
   */
  private async analyzeTrending(transcript: string): Promise<number> {
    const prompt = `You are a trend analysis expert.

TASK: Analyze how well this content aligns with current trends.

CONTENT: ${transcript.substring(0, 800)}

EVALUATE:
1. Trending topics mentioned
2. Current events relevance
3. Popular themes and formats
4. Timely vs evergreen content
5. Viral potential based on trends

OUTPUT FORMAT (JSON):
{
  "score": 0-100,
  "trends": ["trend1", "trend2"],
  "timeliness": "evergreen" | "timely" | "trending"
}

SCORING GUIDE:
- 0-40: No trending elements, outdated
- 41-60: Some relevant topics
- 61-80: Aligns with current trends
- 81-100: Perfectly timed, highly trending

Generate the analysis in JSON format.`;

    try {
      const response = await this.githubModels.generate(prompt, {
        model: 'gpt-4o',
        temperature: 0.3,
        maxTokens: 300
      });

      const analysis = JSON.parse(response);
      return Math.min(Math.max(analysis.score, 0), 100);
    } catch (error) {
      console.error('Trending analysis failed:', error);
      // Fallback to heuristic
      return this.analyzeTrendingHeuristic(transcript);
    }
  }

  /**
   * Fallback heuristic trending analysis
   */
  private analyzeTrendingHeuristic(transcript: string): number {
    let score = 40;

    const trendingTopics = ['ai', 'crypto', 'tech', 'viral', 'trending', 'hack', 'tip', 'tutorial', 'review', 'challenge'];
    const lowerTranscript = transcript.toLowerCase();

    trendingTopics.forEach(topic => {
      if (lowerTranscript.includes(topic)) score += 10;
    });

    return Math.min(score, 100);
  }

  /**
   * Analyze content length optimization
   * Weight: 10% of total score
   */
  private analyzeLength(transcript: string, duration?: number): number {
    const wordCount = transcript.split(/\s+/).length;

    // If duration provided, calculate words per minute
    if (duration) {
      const minutes = duration / 60;
      const wordsPerMinute = wordCount / minutes;

      // Optimal: 150-180 words per minute
      if (wordsPerMinute >= 150 && wordsPerMinute <= 180) {
        return 90;
      } else if (wordsPerMinute >= 120 && wordsPerMinute <= 200) {
        return 75;
      } else if (wordsPerMinute >= 100 && wordsPerMinute <= 220) {
        return 60;
      } else {
        return 40;
      }
    }

    // Fallback: score based on total word count
    // Optimal: 500-1500 words
    if (wordCount >= 500 && wordCount <= 1500) {
      return 85;
    } else if (wordCount >= 300 && wordCount <= 2000) {
      return 70;
    } else if (wordCount >= 200 && wordCount <= 2500) {
      return 55;
    } else {
      return 40;
    }
  }

  /**
   * Calculate weighted score from factors
   */
  private calculateWeightedScore(factors: ViralPrediction['factors']): number {
    const score = 
      (factors.hook * this.WEIGHTS.hook) +
      (factors.pacing * this.WEIGHTS.pacing) +
      (factors.emotion * this.WEIGHTS.emotion) +
      (factors.trending * this.WEIGHTS.trending) +
      (factors.length * this.WEIGHTS.length);

    return Math.min(Math.max(score, 0), 100);
  }

  /**
   * Generate actionable suggestions
   */
  private async generateSuggestions(
    factors: ViralPrediction['factors'],
    transcript: string,
    metadata?: ViralPredictionRequest['metadata']
  ): Promise<string[]> {
    const suggestions: string[] = [];

    // Hook suggestions
    if (factors.hook < 60) {
      suggestions.push('Strengthen your hook - start with a compelling question or bold statement');
    } else if (factors.hook >= 80) {
      suggestions.push('Great hook! Consider posting during peak hours for maximum reach');
    }

    // Pacing suggestions
    if (factors.pacing < 60) {
      suggestions.push('Improve pacing - vary sentence length and add more transitions');
    }

    // Emotion suggestions
    if (factors.emotion < 60) {
      suggestions.push('Add more emotional language to connect with viewers');
    } else if (factors.emotion >= 80) {
      suggestions.push('Strong emotional connection - this resonates well with audiences');
    }

    // Trending suggestions
    if (factors.trending < 50) {
      suggestions.push('Incorporate trending topics or current events for better reach');
    }

    // Length suggestions
    if (factors.length < 60) {
      if (metadata?.duration) {
        suggestions.push('Adjust pacing - aim for 150-180 words per minute');
      } else {
        suggestions.push('Optimize length - aim for 500-1500 words for best engagement');
      }
    }

    // Overall suggestions
    const overallScore = this.calculateWeightedScore(factors);
    if (overallScore >= 70) {
      suggestions.push('High viral potential! Share across multiple platforms for maximum impact');
    }

    return suggestions.slice(0, 4); // Return top 4 suggestions
  }

  /**
   * Calculate confidence level
   */
  private calculateConfidence(factors: ViralPrediction['factors']): number {
    // Confidence based on factor consistency
    const scores = Object.values(factors);
    const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    
    // Calculate standard deviation
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);

    // Lower deviation = higher confidence
    const confidence = 1 - (stdDev / 100);

    return Math.min(Math.max(confidence, 0.5), 1.0);
  }

  /**
   * Categorize score into buckets
   */
  private categorizeScore(score: number): 'low' | 'medium' | 'high' | 'viral' {
    if (score >= 85) return 'viral';
    if (score >= 70) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  }

  /**
   * Batch predict viral scores for multiple pieces of content
   */
  async batchPredict(requests: ViralPredictionRequest[]): Promise<ViralPredictionResponse[]> {
    return Promise.all(requests.map(req => this.predictViralScore(req)));
  }

  /**
   * Compare two pieces of content
   * Future enhancement for A/B testing
   */
  async compareContent(
    content1: ViralPredictionRequest,
    content2: ViralPredictionRequest
  ): Promise<{
    winner: 'content1' | 'content2' | 'tie';
    scoreDifference: number;
    recommendations: string[];
  }> {
    const [prediction1, prediction2] = await Promise.all([
      this.predictViralScore(content1),
      this.predictViralScore(content2)
    ]);

    const diff = prediction1.prediction.score - prediction2.prediction.score;

    let winner: 'content1' | 'content2' | 'tie';
    if (Math.abs(diff) < 5) {
      winner = 'tie';
    } else if (diff > 0) {
      winner = 'content1';
    } else {
      winner = 'content2';
    }

    const recommendations: string[] = [];
    if (winner === 'content1') {
      recommendations.push('Content 1 has higher viral potential');
      recommendations.push(`Stronger factors: ${this.identifyStrongerFactors(prediction1.prediction.factors, prediction2.prediction.factors)}`);
    } else if (winner === 'content2') {
      recommendations.push('Content 2 has higher viral potential');
      recommendations.push(`Stronger factors: ${this.identifyStrongerFactors(prediction2.prediction.factors, prediction1.prediction.factors)}`);
    } else {
      recommendations.push('Both pieces have similar viral potential');
      recommendations.push('Consider A/B testing to determine audience preference');
    }

    return {
      winner,
      scoreDifference: Math.abs(diff),
      recommendations
    };
  }

  /**
   * Identify stronger factors between two predictions
   */
  private identifyStrongerFactors(
    factors1: ViralPrediction['factors'],
    factors2: ViralPrediction['factors']
  ): string {
    const stronger: string[] = [];

    Object.keys(factors1).forEach(key => {
      const k = key as keyof ViralPrediction['factors'];
      if (factors1[k] > factors2[k] + 10) {
        stronger.push(key);
      }
    });

    return stronger.join(', ') || 'none';
  }
}
