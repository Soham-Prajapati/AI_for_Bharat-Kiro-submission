/**
 * Human Content Processor Service
 * Mode 2: Hybrid (AI-Assisted)
 * Processes user-uploaded videos/audio and generates platform content
 */

import { GitHubModelsService } from './github-models.service';
import { DomainDetectionService } from './domain-detection.service';
import {
  generateYouTubeShortPrompt,
  generateInstagramReelPrompt,
  generateTikTokPrompt,
  generateTwitterThreadPrompt,
  generateLinkedInPostPrompt,
  generateBlogPostPrompt,
  generateContentAnalysisPrompt
} from '../prompts';

export interface HumanContentRequest {
  transcript: string; // From user's uploaded video (AWS Transcribe output)
  metadata?: {
    filename: string;
    duration?: number;
    fileSize?: number;
    uploadedAt?: Date;
  };
  targetPlatforms: string[];
  preferences?: {
    generateThumbnails?: boolean;
    extractClips?: boolean;
    multiLanguage?: boolean;
    targetLanguages?: string[];
  };
}

export interface HumanContentResult {
  analysis: {
    domain: string;
    keywords: string[];
    sentiment: any;
    viralityScore?: number;
  };
  platformContent: Array<{
    platform: string;
    content: any;
    thumbnailSuggestions?: string[];
    clipTimestamps?: Array<{ start: number; end: number; description: string }>;
  }>;
  translations?: Record<string, any>;
}

export class HumanContentProcessorService {
  private githubModels: GitHubModelsService;
  private domainDetection: DomainDetectionService;

  constructor() {
    this.githubModels = new GitHubModelsService();
    this.domainDetection = new DomainDetectionService();
  }

  /**
   * Process user's uploaded content (Hybrid mode)
   * Use case: Creator shoots their own video, AI handles the boring stuff
   */
  async processHumanContent(request: HumanContentRequest): Promise<HumanContentResult> {
    const { transcript, metadata, targetPlatforms, preferences } = request;

    // Step 1: Analyze the content
    console.log('Analyzing content...');
    const analysis = await this.analyzeContent(transcript, metadata);

    // Step 2: Generate platform-specific content
    console.log('Generating platform content...');
    const platformContent = await this.generatePlatformContent(
      transcript,
      analysis,
      targetPlatforms,
      preferences
    );

    // Step 3: Generate translations if requested
    let translations;
    if (preferences?.multiLanguage && preferences?.targetLanguages) {
      console.log('Generating translations...');
      translations = await this.generateTranslations(
        platformContent,
        preferences.targetLanguages,
        analysis.domain
      );
    }

    return {
      analysis,
      platformContent,
      translations
    };
  }

  /**
   * Analyze user's content to understand domain, keywords, sentiment
   */
  private async analyzeContent(
    transcript: string,
    metadata?: HumanContentRequest['metadata']
  ): Promise<HumanContentResult['analysis']> {
    // Detect domain
    const domainResult = await this.domainDetection.detectDomain(transcript);

    // Analyze sentiment
    const sentiment = await this.domainDetection.analyzeSentiment(transcript);

    // Comprehensive content analysis
    const analysisPrompt = generateContentAnalysisPrompt({
      transcript,
      metadata: metadata ? {
        duration: metadata.duration,
        platform: 'user-upload'
      } : undefined
    });

    let viralityScore;
    try {
      const analysisResponse = await this.githubModels.generate(analysisPrompt, {
        model: 'gpt-4o',
        temperature: 0.3,
        maxTokens: 2000
      });
      const fullAnalysis = JSON.parse(analysisResponse);
      viralityScore = fullAnalysis.virality_potential?.score;
    } catch (error) {
      console.error('Content analysis failed:', error);
    }

    return {
      domain: domainResult.domain,
      keywords: domainResult.keywords,
      sentiment,
      viralityScore
    };
  }

  /**
   * Generate platform-specific content from user's transcript
   */
  private async generatePlatformContent(
    transcript: string,
    analysis: HumanContentResult['analysis'],
    targetPlatforms: string[],
    preferences?: HumanContentRequest['preferences']
  ): Promise<HumanContentResult['platformContent']> {
    const results: HumanContentResult['platformContent'] = [];

    for (const platform of targetPlatforms) {
      try {
        const content = await this.generateForPlatform(
          platform,
          transcript,
          analysis.domain,
          analysis.keywords
        );

        // Add thumbnail suggestions if requested
        let thumbnailSuggestions;
        if (preferences?.generateThumbnails) {
          thumbnailSuggestions = await this.generateThumbnailSuggestions(
            transcript,
            analysis.domain,
            platform
          );
        }

        // Extract clip timestamps for short-form content
        let clipTimestamps;
        if (preferences?.extractClips && ['youtube-short', 'instagram-reel', 'tiktok'].includes(platform)) {
          clipTimestamps = await this.extractClipTimestamps(transcript, platform);
        }

        results.push({
          platform,
          content,
          thumbnailSuggestions,
          clipTimestamps
        });
      } catch (error) {
        console.error(`Failed to generate content for ${platform}:`, error);
        results.push({
          platform,
          content: { error: `Failed to generate content for ${platform}` }
        });
      }
    }

    return results;
  }

  /**
   * Generate content for specific platform
   */
  private async generateForPlatform(
    platform: string,
    transcript: string,
    domain: string,
    keywords: string[]
  ): Promise<any> {
    let prompt: string;

    switch (platform) {
      case 'youtube-short':
        prompt = generateYouTubeShortPrompt({ transcript, domain, keywords });
        break;
      case 'instagram-reel':
        prompt = generateInstagramReelPrompt({ transcript, domain, keywords, duration: 30 });
        break;
      case 'tiktok':
        prompt = generateTikTokPrompt({ transcript, domain, keywords });
        break;
      case 'twitter-thread':
        prompt = generateTwitterThreadPrompt({ transcript, domain, keywords, threadLength: 10 });
        break;
      case 'linkedin-post':
        prompt = generateLinkedInPostPrompt({ transcript, domain, keywords, tone: 'professional' });
        break;
      case 'blog-post':
        prompt = generateBlogPostPrompt({ transcript, domain, keywords, wordCount: 1500 });
        break;
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }

    const response = await this.githubModels.generate(prompt, {
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 2000
    });

    return JSON.parse(response);
  }

  /**
   * Generate thumbnail suggestions from user's video content
   */
  private async generateThumbnailSuggestions(
    transcript: string,
    domain: string,
    platform: string
  ): Promise<string[]> {
    const prompt = `You are a thumbnail design expert for ${platform}.

TASK: Suggest 3 compelling thumbnail concepts for this video content.

CONTENT: ${transcript.substring(0, 800)}
DOMAIN: ${domain}

OUTPUT FORMAT:
{
  "thumbnails": [
    {
      "concept": "Thumbnail concept description",
      "text_overlay": "3-5 words for thumbnail text",
      "visual_elements": "What should be in the frame",
      "color_scheme": "Recommended colors",
      "emotion": "Emotion to convey (curiosity, excitement, etc.)"
    }
  ]
}

REQUIREMENTS:
- High contrast and readable on mobile
- Text should be large and bold (3-5 words max)
- Evoke curiosity or emotion
- Stand out in feed
- Relevant to ${domain} content

Generate thumbnail suggestions in JSON format.`;

    try {
      const response = await this.githubModels.generate(prompt, {
        model: 'gpt-4o',
        temperature: 0.7,
        maxTokens: 500
      });
      const parsed = JSON.parse(response);
      return parsed.thumbnails.map((t: any) => 
        `${t.concept} | Text: "${t.text_overlay}" | Visual: ${t.visual_elements}`
      );
    } catch (error) {
      console.error('Thumbnail generation failed:', error);
      return [];
    }
  }

  /**
   * Extract optimal clip timestamps for short-form content
   */
  private async extractClipTimestamps(
    transcript: string,
    platform: string
  ): Promise<Array<{ start: number; end: number; description: string }>> {
    const duration = platform === 'youtube-short' ? 60 : 30;

    const prompt = `You are a video editing expert specializing in ${platform}.

TASK: Identify the best ${duration}-second clip from this video transcript.

TRANSCRIPT: ${transcript}

OUTPUT FORMAT:
{
  "clips": [
    {
      "start_second": 0,
      "end_second": ${duration},
      "description": "Why this clip is engaging",
      "hook_moment": "Timestamp of the hook (first 3 seconds)",
      "key_moments": ["Timestamp: description", "Timestamp: description"]
    }
  ]
}

REQUIREMENTS:
- Clip must have strong hook in first 3 seconds
- Should be self-contained (makes sense without context)
- Include the most engaging/valuable moment
- Optimize for watch time completion

Generate clip suggestions in JSON format.`;

    try {
      const response = await this.githubModels.generate(prompt, {
        model: 'gpt-4o',
        temperature: 0.5,
        maxTokens: 500
      });
      const parsed = JSON.parse(response);
      return parsed.clips.map((c: any) => ({
        start: c.start_second,
        end: c.end_second,
        description: c.description
      }));
    } catch (error) {
      console.error('Clip extraction failed:', error);
      return [];
    }
  }

  /**
   * Generate translations for platform content
   */
  private async generateTranslations(
    platformContent: HumanContentResult['platformContent'],
    targetLanguages: string[],
    domain: string
  ): Promise<Record<string, any>> {
    const translations: Record<string, any> = {};

    for (const lang of targetLanguages) {
      translations[lang] = {};
      
      for (const item of platformContent) {
        try {
          const contentStr = JSON.stringify(item.content);
          const translationPrompt = `Translate this ${item.platform} content to ${lang} while preserving formatting and SEO value.

Content: ${contentStr}
Domain: ${domain}

Return the translated content in the same JSON structure.`;

          const response = await this.githubModels.generate(translationPrompt, {
            model: 'gpt-4o',
            temperature: 0.3,
            maxTokens: 2000
          });

          translations[lang][item.platform] = JSON.parse(response);
        } catch (error) {
          console.error(`Translation to ${lang} failed for ${item.platform}:`, error);
          translations[lang][item.platform] = { error: 'Translation failed' };
        }
      }
    }

    return translations;
  }

  /**
   * Stream content generation for real-time UI updates
   */
  async *streamProcess(request: HumanContentRequest): AsyncGenerator<{ stage: string; data: any }> {
    yield { stage: 'analysis', data: 'Analyzing your content...' };
    const analysis = await this.analyzeContent(request.transcript, request.metadata);
    yield { stage: 'analysis', data: analysis };

    for (const platform of request.targetPlatforms) {
      yield { stage: 'generation', data: { platform, status: 'starting' } };
      
      const content = await this.generateForPlatform(
        platform,
        request.transcript,
        analysis.domain,
        analysis.keywords
      );

      yield { stage: 'generation', data: { platform, content } };
    }

    yield { stage: 'complete', data: 'All content generated!' };
  }
}
