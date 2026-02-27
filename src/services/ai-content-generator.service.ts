/**
 * AI Content Generator Service
 * Mode 1: AI-First (Full Automation)
 * Generates complete content from topic/outline without user video
 */

import { GitHubModelsService } from './github-models.service';
import { 
  generateYouTubeShortPrompt, 
  generateInstagramReelPrompt,
  generateTikTokPrompt,
  generateTwitterThreadPrompt,
  generateLinkedInPostPrompt,
  generateBlogPostPrompt
} from '../prompts';

export interface AIContentRequest {
  topic: string;
  domain: string;
  outline?: string[];
  targetPlatforms: string[];
  preferences?: {
    tone?: 'professional' | 'casual' | 'educational' | 'entertaining';
    length?: 'short' | 'medium' | 'long';
    includeScript?: boolean;
    includeVoiceover?: boolean;
    includeVisuals?: boolean;
  };
}

export interface AIContentResult {
  platform: string;
  content: any;
  script?: string;
  voiceoverText?: string;
  visualSuggestions?: string[];
  estimatedDuration?: number;
}

export class AIContentGeneratorService {
  private githubModels: GitHubModelsService;

  constructor() {
    this.githubModels = new GitHubModelsService();
  }

  /**
   * Generate complete content from topic (AI-First mode)
   * Use case: Creator wants full automation - AI generates everything
   */
  async generateFromTopic(request: AIContentRequest): Promise<AIContentResult[]> {
    const { topic, domain, outline, targetPlatforms, preferences } = request;

    // Step 1: Generate comprehensive script/content from topic
    const baseContent = await this.generateBaseContent(topic, domain, outline, preferences);

    // Step 2: Generate platform-specific content for each target platform
    const results: AIContentResult[] = [];

    for (const platform of targetPlatforms) {
      try {
        const platformContent = await this.generateForPlatform(
          platform,
          baseContent,
          domain,
          preferences
        );
        results.push(platformContent);
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
   * Generate base content/script from topic
   */
  private async generateBaseContent(
    topic: string,
    domain: string,
    outline?: string[],
    preferences?: AIContentRequest['preferences']
  ): Promise<string> {
    const prompt = `You are an expert content creator specializing in ${domain}.

TASK: Create a comprehensive content script/outline for the following topic.

TOPIC: ${topic}

${outline ? `OUTLINE POINTS:\n${outline.map((point, i) => `${i + 1}. ${point}`).join('\n')}` : ''}

PREFERENCES:
- Tone: ${preferences?.tone || 'engaging and informative'}
- Length: ${preferences?.length || 'medium'} (short=30-60s, medium=2-5min, long=10-15min)

OUTPUT FORMAT:
{
  "title": "Compelling title for the content",
  "hook": "Attention-grabbing opening (first 5 seconds)",
  "introduction": "Brief introduction and context",
  "main_points": [
    {"point": "Main point 1", "details": "Explanation and examples", "duration": "estimated seconds"},
    {"point": "Main point 2", "details": "Explanation and examples", "duration": "estimated seconds"},
    {"point": "Main point 3", "details": "Explanation and examples", "duration": "estimated seconds"}
  ],
  "conclusion": "Summary and call-to-action",
  "key_takeaways": ["Takeaway 1", "Takeaway 2", "Takeaway 3"],
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "estimated_duration": "total seconds",
  "full_script": "Complete script with natural flow and transitions"
}

REQUIREMENTS:
- Start with a strong hook (curiosity, question, or bold statement)
- Structure content logically with clear flow
- Include specific examples and actionable tips
- End with clear call-to-action
- Make it engaging and valuable for ${domain} audience

Generate the content script now in JSON format.`;

    const response = await this.githubModels.generate(prompt, {
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 2000
    });

    const parsed = JSON.parse(response);
    return parsed.full_script || response;
  }

  /**
   * Generate platform-specific content from base script
   */
  private async generateForPlatform(
    platform: string,
    baseContent: string,
    domain: string,
    preferences?: AIContentRequest['preferences']
  ): Promise<AIContentResult> {
    const keywords = await this.extractKeywords(baseContent);

    let prompt: string;
    let estimatedDuration: number | undefined;

    switch (platform) {
      case 'youtube-short':
        prompt = generateYouTubeShortPrompt({
          transcript: baseContent,
          domain,
          keywords
        });
        estimatedDuration = 60;
        break;

      case 'instagram-reel':
        prompt = generateInstagramReelPrompt({
          transcript: baseContent,
          domain,
          keywords,
          duration: 30
        });
        estimatedDuration = 30;
        break;

      case 'tiktok':
        prompt = generateTikTokPrompt({
          transcript: baseContent,
          domain,
          keywords
        });
        estimatedDuration = 30;
        break;

      case 'twitter-thread':
        prompt = generateTwitterThreadPrompt({
          transcript: baseContent,
          domain,
          keywords,
          threadLength: 10
        });
        break;

      case 'linkedin-post':
        prompt = generateLinkedInPostPrompt({
          transcript: baseContent,
          domain,
          keywords,
          tone: preferences?.tone === 'professional' ? 'professional' : 'educational'
        });
        break;

      case 'blog-post':
        prompt = generateBlogPostPrompt({
          transcript: baseContent,
          domain,
          keywords,
          wordCount: preferences?.length === 'long' ? 2000 : 1500
        });
        break;

      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }

    const response = await this.githubModels.generate(prompt, {
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 2000
    });

    const content = JSON.parse(response);

    return {
      platform,
      content,
      script: content.script || content.full_script,
      voiceoverText: this.extractVoiceoverText(content),
      visualSuggestions: this.extractVisualSuggestions(content),
      estimatedDuration
    };
  }

  /**
   * Extract keywords from content
   */
  private async extractKeywords(content: string): Promise<string[]> {
    const prompt = `Extract the top 10 most important keywords from this content.

Content: ${content.substring(0, 1000)}

Return only a JSON array of keywords: ["keyword1", "keyword2", ...]`;

    try {
      const response = await this.githubModels.generate(prompt, {
        model: 'gpt-4o',
        temperature: 0.3,
        maxTokens: 200
      });
      return JSON.parse(response);
    } catch (error) {
      console.error('Keyword extraction failed:', error);
      return [];
    }
  }

  /**
   * Extract voiceover text from generated content
   */
  private extractVoiceoverText(content: any): string {
    if (content.script) {
      if (Array.isArray(content.script)) {
        return content.script.map((s: any) => s.text || s).join(' ');
      }
      if (typeof content.script === 'object') {
        return Object.values(content.script).join(' ');
      }
      return content.script;
    }
    if (content.full_script) return content.full_script;
    if (content.post) return content.post;
    if (content.caption) return content.caption;
    return '';
  }

  /**
   * Extract visual suggestions from generated content
   */
  private extractVisualSuggestions(content: any): string[] {
    const suggestions: string[] = [];

    if (content.script && Array.isArray(content.script)) {
      content.script.forEach((s: any) => {
        if (s.visual) suggestions.push(s.visual);
      });
    }

    if (content.visual_suggestion) {
      suggestions.push(content.visual_suggestion);
    }

    if (content.images && Array.isArray(content.images)) {
      content.images.forEach((img: any) => {
        if (img.description) suggestions.push(img.description);
      });
    }

    return suggestions;
  }

  /**
   * Stream content generation for real-time UI updates
   */
  async *streamGenerate(request: AIContentRequest): AsyncGenerator<{ platform: string; chunk: string }> {
    const { topic, domain, targetPlatforms } = request;

    for (const platform of targetPlatforms) {
      yield { platform, chunk: `\n\n=== Generating ${platform} content ===\n\n` };

      const baseContent = await this.generateBaseContent(topic, domain, request.outline, request.preferences);
      const keywords = await this.extractKeywords(baseContent);

      let prompt: string;
      switch (platform) {
        case 'youtube-short':
          prompt = generateYouTubeShortPrompt({ transcript: baseContent, domain, keywords });
          break;
        case 'instagram-reel':
          prompt = generateInstagramReelPrompt({ transcript: baseContent, domain, keywords });
          break;
        case 'tiktok':
          prompt = generateTikTokPrompt({ transcript: baseContent, domain, keywords });
          break;
        default:
          prompt = generateBlogPostPrompt({ transcript: baseContent, domain, keywords });
      }

      for await (const chunk of this.githubModels.streamGenerate(prompt)) {
        yield { platform, chunk };
      }
    }
  }
}
