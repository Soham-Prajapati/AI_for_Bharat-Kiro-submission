/**
 * Mode Detection Service
 * Automatically detects which creator mode to use based on user input
 * Routes requests to appropriate service (AI-First, Hybrid, or Human-First)
 */

import { AIContentGeneratorService } from './ai-content-generator.service';
import { HumanContentProcessorService } from './human-content-processor.service';
import { PlatformContentGeneratorService } from './platform-content-generator.service';

export type CreatorMode = 'ai-first' | 'hybrid' | 'human-first';

export interface ModeDetectionInput {
  // User input signals
  hasVideoFile?: boolean;
  hasAudioFile?: boolean;
  hasTranscript?: boolean;
  hasManualContent?: boolean;
  topicOnly?: boolean;
  
  // User preferences (from onboarding or profile)
  preferredMode?: CreatorMode;
  
  // Content details
  content?: {
    topic?: string;
    outline?: string[];
    transcript?: string;
    userWrittenContent?: {
      title: string;
      description: string;
      tags?: string[];
    };
  };
  
  // Request details
  targetPlatforms: string[];
  preferences?: {
    useAIVoice?: boolean;
    useAIVideo?: boolean;
    generateScripts?: boolean;
    generateThumbnails?: boolean;
    multiLanguage?: boolean;
    targetLanguages?: string[];
    requireApproval?: boolean;
  };
}

export interface ModeDetectionResult {
  detectedMode: CreatorMode;
  confidence: number;
  reasoning: string;
  recommendedService: 'ai-content-generator' | 'human-content-processor' | 'platform-content-generator';
  alternativeModes?: Array<{
    mode: CreatorMode;
    reason: string;
  }>;
}

export class ModeDetectionService {
  private aiContentGenerator: AIContentGeneratorService;
  private humanContentProcessor: HumanContentProcessorService;
  private platformContentGenerator: PlatformContentGeneratorService;

  constructor() {
    this.aiContentGenerator = new AIContentGeneratorService();
    this.humanContentProcessor = new HumanContentProcessorService();
    this.platformContentGenerator = new PlatformContentGeneratorService();
  }

  /**
   * Detect which creator mode to use based on input signals
   */
  detectMode(input: ModeDetectionInput): ModeDetectionResult {
    // Priority 1: User's explicit preference
    if (input.preferredMode) {
      return {
        detectedMode: input.preferredMode,
        confidence: 1.0,
        reasoning: 'User explicitly selected this mode in preferences',
        recommendedService: this.getServiceForMode(input.preferredMode)
      };
    }

    // Priority 2: Analyze input signals
    const signals = this.analyzeInputSignals(input);

    // Decision logic based on signals
    if (signals.hasUserVideo || signals.hasUserAudio) {
      // User uploaded their own content → Hybrid mode
      return {
        detectedMode: 'hybrid',
        confidence: 0.95,
        reasoning: 'User uploaded video/audio file - will process their content and generate platform-specific captions',
        recommendedService: 'human-content-processor',
        alternativeModes: [
          {
            mode: 'human-first',
            reason: 'If you want minimal AI assistance (translation only)'
          }
        ]
      };
    }

    if (signals.hasManualContent && !signals.wantsAIGeneration) {
      // User wrote everything manually → Human-First mode
      return {
        detectedMode: 'human-first',
        confidence: 0.9,
        reasoning: 'User provided manually written content - will only assist with translation and SEO',
        recommendedService: 'platform-content-generator',
        alternativeModes: [
          {
            mode: 'hybrid',
            reason: 'If you want AI to generate platform-specific variations'
          }
        ]
      };
    }

    if (signals.topicOnly || signals.wantsFullAutomation) {
      // User wants AI to generate everything → AI-First mode
      return {
        detectedMode: 'ai-first',
        confidence: 0.9,
        reasoning: 'User provided topic/outline only - will generate complete content including scripts and platform variations',
        recommendedService: 'ai-content-generator',
        alternativeModes: [
          {
            mode: 'hybrid',
            reason: 'If you want to shoot your own video first'
          }
        ]
      };
    }

    // Default: Hybrid mode (most common use case)
    return {
      detectedMode: 'hybrid',
      confidence: 0.7,
      reasoning: 'Default mode - most creators shoot their own content and want AI assistance',
      recommendedService: 'human-content-processor',
      alternativeModes: [
        {
          mode: 'ai-first',
          reason: 'If you want AI to generate everything from scratch'
        },
        {
          mode: 'human-first',
          reason: 'If you want minimal AI assistance'
        }
      ]
    };
  }

  /**
   * Analyze input signals to determine user intent
   */
  private analyzeInputSignals(input: ModeDetectionInput): {
    hasUserVideo: boolean;
    hasUserAudio: boolean;
    hasManualContent: boolean;
    topicOnly: boolean;
    wantsAIGeneration: boolean;
    wantsFullAutomation: boolean;
  } {
    return {
      hasUserVideo: input.hasVideoFile === true,
      hasUserAudio: input.hasAudioFile === true,
      hasManualContent: input.hasManualContent === true || !!input.content?.userWrittenContent,
      topicOnly: input.topicOnly === true || (!!input.content?.topic && !input.hasVideoFile && !input.hasManualContent),
      wantsAIGeneration: input.preferences?.generateScripts === true || input.preferences?.useAIVoice === true,
      wantsFullAutomation: input.preferences?.useAIVideo === true && input.preferences?.useAIVoice === true
    };
  }

  /**
   * Get service name for a given mode
   */
  private getServiceForMode(mode: CreatorMode): ModeDetectionResult['recommendedService'] {
    switch (mode) {
      case 'ai-first':
        return 'ai-content-generator';
      case 'hybrid':
        return 'human-content-processor';
      case 'human-first':
        return 'platform-content-generator';
    }
  }

  /**
   * Process content using the detected mode
   * This is the main entry point that routes to the appropriate service
   */
  async processContent(input: ModeDetectionInput): Promise<any> {
    const detection = this.detectMode(input);

    console.log(`Using ${detection.detectedMode} mode (confidence: ${detection.confidence})`);
    console.log(`Reasoning: ${detection.reasoning}`);

    switch (detection.detectedMode) {
      case 'ai-first':
        return this.processAIFirst(input);
      
      case 'hybrid':
        return this.processHybrid(input);
      
      case 'human-first':
        return this.processHumanFirst(input);
      
      default:
        throw new Error(`Unknown mode: ${detection.detectedMode}`);
    }
  }

  /**
   * Process using AI-First mode
   */
  private async processAIFirst(input: ModeDetectionInput) {
    if (!input.content?.topic) {
      throw new Error('AI-First mode requires a topic');
    }

    return this.aiContentGenerator.generateFromTopic({
      topic: input.content.topic,
      domain: 'General', // Should be detected or provided
      outline: input.content.outline,
      targetPlatforms: input.targetPlatforms,
      preferences: {
        tone: 'professional',
        length: 'medium',
        includeScript: true,
        includeVoiceover: input.preferences?.useAIVoice,
        includeVisuals: input.preferences?.useAIVideo
      }
    });
  }

  /**
   * Process using Hybrid mode
   */
  private async processHybrid(input: ModeDetectionInput) {
    if (!input.content?.transcript) {
      throw new Error('Hybrid mode requires a transcript (from uploaded video/audio)');
    }

    return this.humanContentProcessor.processHumanContent({
      transcript: input.content.transcript,
      targetPlatforms: input.targetPlatforms,
      preferences: {
        generateThumbnails: input.preferences?.generateThumbnails ?? true,
        extractClips: true,
        multiLanguage: input.preferences?.multiLanguage,
        targetLanguages: input.preferences?.targetLanguages
      }
    });
  }

  /**
   * Process using Human-First mode
   */
  private async processHumanFirst(input: ModeDetectionInput) {
    if (!input.content?.userWrittenContent) {
      throw new Error('Human-First mode requires user-written content');
    }

    return this.platformContentGenerator.processUserContent({
      userContent: input.content.userWrittenContent,
      domain: 'General', // Should be detected or provided
      targetLanguages: input.preferences?.targetLanguages,
      seoOptimization: true,
      contentType: 'video-description'
    });
  }

  /**
   * Stream content processing with mode detection
   */
  async *streamProcess(input: ModeDetectionInput): AsyncGenerator<{ stage: string; data: any }> {
    const detection = this.detectMode(input);

    yield {
      stage: 'mode-detection',
      data: {
        mode: detection.detectedMode,
        confidence: detection.confidence,
        reasoning: detection.reasoning
      }
    };

    switch (detection.detectedMode) {
      case 'ai-first':
        if (!input.content?.topic) {
          throw new Error('AI-First mode requires a topic');
        }
        
        for await (const chunk of this.aiContentGenerator.streamGenerate({
          topic: input.content.topic,
          domain: 'General',
          outline: input.content.outline,
          targetPlatforms: input.targetPlatforms
        })) {
          yield { stage: 'generation', data: chunk };
        }
        break;

      case 'hybrid':
        if (!input.content?.transcript) {
          throw new Error('Hybrid mode requires a transcript');
        }

        for await (const update of this.humanContentProcessor.streamProcess({
          transcript: input.content.transcript,
          targetPlatforms: input.targetPlatforms,
          preferences: {
            generateThumbnails: input.preferences?.generateThumbnails ?? true,
            extractClips: true,
            multiLanguage: input.preferences?.multiLanguage,
            targetLanguages: input.preferences?.targetLanguages
          }
        })) {
          yield update;
        }
        break;

      case 'human-first':
        // Human-First mode doesn't have streaming (quick operations)
        const result = await this.processHumanFirst(input);
        yield { stage: 'complete', data: result };
        break;
    }
  }

  /**
   * Validate input for detected mode
   */
  validateInput(input: ModeDetectionInput): { valid: boolean; errors: string[] } {
    const detection = this.detectMode(input);
    const errors: string[] = [];

    switch (detection.detectedMode) {
      case 'ai-first':
        if (!input.content?.topic) {
          errors.push('AI-First mode requires a topic');
        }
        if (input.targetPlatforms.length === 0) {
          errors.push('At least one target platform is required');
        }
        break;

      case 'hybrid':
        if (!input.content?.transcript && !input.hasVideoFile && !input.hasAudioFile) {
          errors.push('Hybrid mode requires a video/audio file or transcript');
        }
        if (input.targetPlatforms.length === 0) {
          errors.push('At least one target platform is required');
        }
        break;

      case 'human-first':
        if (!input.content?.userWrittenContent) {
          errors.push('Human-First mode requires user-written content (title and description)');
        }
        break;
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get mode recommendations based on user profile/history
   */
  recommendMode(userProfile?: {
    contentType?: string;
    uploadFrequency?: 'daily' | 'weekly' | 'monthly';
    hasVideoEquipment?: boolean;
    technicalSkill?: 'beginner' | 'intermediate' | 'advanced';
  }): { mode: CreatorMode; reasoning: string }[] {
    const recommendations: { mode: CreatorMode; reasoning: string }[] = [];

    if (!userProfile) {
      // Default recommendations
      return [
        { mode: 'hybrid', reasoning: 'Most popular - shoot your own content, AI handles the rest' },
        { mode: 'ai-first', reasoning: 'Fastest - AI generates everything from topic' },
        { mode: 'human-first', reasoning: 'Most control - you create, AI only translates/optimizes' }
      ];
    }

    // Personalized recommendations based on profile
    if (userProfile.uploadFrequency === 'daily' || userProfile.uploadFrequency === 'weekly') {
      recommendations.push({
        mode: 'ai-first',
        reasoning: 'High upload frequency - AI-First mode saves the most time'
      });
    }

    if (userProfile.hasVideoEquipment) {
      recommendations.push({
        mode: 'hybrid',
        reasoning: 'You have video equipment - shoot your own content, AI optimizes for platforms'
      });
    }

    if (userProfile.technicalSkill === 'advanced') {
      recommendations.push({
        mode: 'human-first',
        reasoning: 'Advanced user - maintain full creative control with minimal AI'
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        mode: 'hybrid',
        reasoning: 'Best balance of control and automation for most creators'
      });
    }

    return recommendations;
  }
}
