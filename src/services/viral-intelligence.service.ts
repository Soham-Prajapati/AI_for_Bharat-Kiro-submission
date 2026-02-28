/**
 * Viral Intelligence Service
 * Consolidates: Viral Predictor + Viral Analyzer + Dopamine Optimizer
 * 
 * Single service for all virality analysis, prediction, and optimization.
 */

import { ViralPredictorService, ViralPredictionRequest, ViralPrediction, ViralPredictionResponse } from './viral-predictor.service';
import { ViralAnalyzerService, ViralContentRequest, ViralPattern, ViralHook, EmotionalTrigger, ViralFormula, ReplicationGuide } from './viral-analyzer.service';
import { DopamineOptimizerService } from './dopamine-optimizer.service';

// Re-export types
export { 
  ViralPredictionRequest, ViralPrediction, ViralPredictionResponse,
  ViralContentRequest, ViralPattern, ViralHook, EmotionalTrigger, ViralFormula, ReplicationGuide
};

export interface ViralIntelligenceResult {
  prediction: ViralPrediction;
  patterns: ViralPattern[];
  hooks: ViralHook[];
  emotionalTriggers: EmotionalTrigger[];
  optimization: {
    overallScore: number;
    improvements: string[];
    optimizedContent?: string;
  };
  analyzedAt: Date;
}

export class ViralIntelligenceService {
  private predictorService: ViralPredictorService;
  private analyzerService: ViralAnalyzerService;
  private dopamineService: DopamineOptimizerService;

  constructor() {
    this.predictorService = new ViralPredictorService();
    this.analyzerService = new ViralAnalyzerService();
    this.dopamineService = new DopamineOptimizerService();
  }

  // ============================================================================
  // UNIFIED METHODS
  // ============================================================================

  /**
   * Comprehensive viral intelligence analysis
   */
  async analyzeComprehensive(
    transcript: string,
    metadata?: { duration?: number; platform?: string; category?: string }
  ): Promise<ViralIntelligenceResult> {
    const [prediction, optimization] = await Promise.all([
      this.predictorService.predictViralScore({ transcript, metadata }),
      this.dopamineService.optimizeContent({ content: transcript, contentType: 'video_script' })
    ]);

    return {
      prediction: prediction.prediction,
      patterns: [],
      hooks: (optimization.hooks || []) as any as ViralHook[],
      emotionalTriggers: (optimization.emotionalPeaks || []) as any as EmotionalTrigger[],
      optimization: {
        overallScore: optimization.overallScore,
        improvements: optimization.improvements?.map((i: any) => i.suggestion || i) || [],
        optimizedContent: optimization.optimizedContent
      },
      analyzedAt: new Date()
    };
  }

  // ============================================================================
  // VIRAL PREDICTOR METHODS (delegated)
  // ============================================================================

  /**
   * Predict viral score for content
   */
  async predictScore(request: ViralPredictionRequest): Promise<ViralPredictionResponse> {
    return this.predictorService.predictViralScore(request);
  }

  /**
   * Simple prediction with transcript and optional metadata
   */
  async predict(transcript: string, metadata?: any): Promise<ViralPrediction> {
    const result = await this.predictorService.predictViralScore({ transcript, metadata });
    return result.prediction;
  }

  // ============================================================================
  // VIRAL ANALYZER METHODS (delegated)
  // ============================================================================

  /**
   * Analyze viral content to extract patterns
   */
  async analyzeContent(request: ViralContentRequest): Promise<any> {
    return this.analyzerService.analyzeViralContent(request);
  }

  /**
   * Extract viral patterns from content
   */
  async extractPatterns(content: ViralContentRequest): Promise<ViralPattern[]> {
    const analysis = await this.analyzerService.analyzeViralContent(content);
    return analysis.patterns || [];
  }

  /**
   * Get viral hooks from content
   */
  async extractHooks(content: ViralContentRequest): Promise<ViralHook[]> {
    const analysis = await this.analyzerService.analyzeViralContent(content);
    return analysis.hooks || [];
  }

  /**
   * Generate replication guide
   */
  async getReplicationGuide(content: ViralContentRequest): Promise<ReplicationGuide> {
    const analysis = await this.analyzerService.analyzeViralContent(content);
    return analysis.replicationGuide;
  }

  // ============================================================================
  // DOPAMINE OPTIMIZER METHODS (delegated)
  // ============================================================================

  /**
   * Optimize content for engagement
   */
  async optimizeEngagement(request: {
    content: string;
    contentType: 'video_script' | 'social_post' | 'blog' | 'email';
    duration?: number;
    targetPlatform?: 'youtube' | 'instagram' | 'tiktok' | 'twitter' | 'linkedin';
  }): Promise<any> {
    return this.dopamineService.optimizeContent(request);
  }

  /**
   * Analyze hooks in content
   */
  async analyzeHooks(content: string): Promise<any[]> {
    const result = await this.dopamineService.optimizeContent({ 
      content, 
      contentType: 'video_script' 
    });
    return result.hooks || [];
  }

  /**
   * Get retention prediction
   */
  async predictRetention(content: string, duration?: number): Promise<any> {
    const result = await this.dopamineService.optimizeContent({ 
      content, 
      contentType: 'video_script',
      duration 
    });
    return result.retentionPrediction;
  }

  /**
   * Get pacing analysis
   */
  async analyzePacing(content: string): Promise<any> {
    const result = await this.dopamineService.optimizeContent({ 
      content, 
      contentType: 'video_script' 
    });
    return result.pacingAnalysis;
  }
}

// Singleton export
export const viralIntelligenceService = new ViralIntelligenceService();
