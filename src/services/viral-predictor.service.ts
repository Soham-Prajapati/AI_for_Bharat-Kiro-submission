/**
 * Viral Score Predictor Service
 * Predicts content virality based on various factors
 * Owner: Nidhi (AI Intelligence Lead)
 */

export interface ViralFactors {
  hook: number;
  pacing: number;
  emotion: number;
  trending: number;
  length: number;
}

export interface ViralPrediction {
  score: number;
  factors: ViralFactors;
  suggestions: string[];
  confidence: number;
  category: 'low' | 'medium' | 'high' | 'viral';
}

export interface ContentMetadata {
  duration?: number;
  platform?: string;
  category?: string;
  hasVisuals?: boolean;
}

class ViralPredictorService {
  /**
   * Predict viral score for content
   * TODO: Implement ML model and real analysis (Nidhi - task 2.3a)
   */
  async predict(transcript: string, metadata: ContentMetadata = {}): Promise<ViralPrediction> {
    // Stub implementation - returns mock prediction
    // Will be replaced with real ML model
    
    // Simple heuristics for demo
    const hookScore = this.analyzeHook(transcript);
    const pacingScore = this.analyzePacing(transcript);
    const emotionScore = this.analyzeEmotion(transcript);
    const trendingScore = this.analyzeTrending(transcript);
    const lengthScore = this.analyzeLength(transcript, metadata.duration);
    
    const factors: ViralFactors = {
      hook: hookScore,
      pacing: pacingScore,
      emotion: emotionScore,
      trending: trendingScore,
      length: lengthScore
    };
    
    // Weighted average
    const score = Math.round(
      hookScore * 0.3 +
      pacingScore * 0.2 +
      emotionScore * 0.25 +
      trendingScore * 0.15 +
      lengthScore * 0.1
    );
    
    const category = this.getCategory(score);
    const suggestions = this.generateSuggestions(factors, score);
    
    return {
      score,
      factors,
      suggestions,
      confidence: 0.78,
      category
    };
  }
  
  private analyzeHook(transcript: string): number {
    const first100 = transcript.substring(0, 100).toLowerCase();
    const hookWords = ['amazing', 'shocking', 'secret', 'never', 'must', 'how to', 'why'];
    const matches = hookWords.filter(word => first100.includes(word)).length;
    return Math.min(100, 60 + matches * 10);
  }
  
  private analyzePacing(transcript: string): number {
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgLength = transcript.length / sentences.length;
    // Optimal: 15-25 words per sentence
    if (avgLength >= 15 && avgLength <= 25) return 85;
    if (avgLength < 15) return 70;
    return 60;
  }
  
  private analyzeEmotion(transcript: string): number {
    const emotionalWords = ['love', 'hate', 'amazing', 'terrible', 'incredible', 'shocking', 'wow'];
    const text = transcript.toLowerCase();
    const matches = emotionalWords.filter(word => text.includes(word)).length;
    return Math.min(100, 50 + matches * 8);
  }
  
  private analyzeTrending(transcript: string): number {
    const trendingTopics = ['ai', 'crypto', 'tech', 'viral', 'trending', 'hack', 'tip'];
    const text = transcript.toLowerCase();
    const matches = trendingTopics.filter(topic => text.includes(topic)).length;
    return Math.min(100, 40 + matches * 12);
  }
  
  private analyzeLength(transcript: string, duration?: number): number {
    const wordCount = transcript.split(/\s+/).length;
    // Optimal: 150-300 words per minute
    if (duration) {
      const wpm = wordCount / (duration / 60);
      if (wpm >= 150 && wpm <= 300) return 90;
      if (wpm < 150) return 70;
      return 65;
    }
    // Fallback: optimal 500-1500 words
    if (wordCount >= 500 && wordCount <= 1500) return 85;
    return 70;
  }
  
  private getCategory(score: number): 'low' | 'medium' | 'high' | 'viral' {
    if (score >= 85) return 'viral';
    if (score >= 70) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  }
  
  private generateSuggestions(factors: ViralFactors, score: number): string[] {
    const suggestions: string[] = [];
    
    if (factors.hook < 70) {
      suggestions.push('Strengthen your hook - start with a compelling question or statement');
    }
    if (factors.pacing < 70) {
      suggestions.push('Improve pacing - vary sentence length and add more dynamic transitions');
    }
    if (factors.emotion < 70) {
      suggestions.push('Add more emotional language to connect with viewers');
    }
    if (factors.trending < 60) {
      suggestions.push('Incorporate trending topics or current events');
    }
    if (factors.length < 70) {
      suggestions.push('Optimize content length - aim for 8-12 minutes for YouTube');
    }
    
    if (score >= 80) {
      suggestions.push('Great content! Consider posting during peak hours for maximum reach');
    }
    
    return suggestions;
  }
}

export const viralPredictorService = new ViralPredictorService();
