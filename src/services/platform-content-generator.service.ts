/**
 * Platform Content Generator Service
 * Mode 3: Human-First (Minimal AI)
 * Minimal AI assistance - translation, SEO, analytics only
 */

import { GitHubModelsService } from './github-models.service';
import { generateSEOTranslationPrompt } from '../prompts';

export interface PlatformContentRequest {
  userContent: {
    title: string;
    description: string;
    tags?: string[];
    customCaption?: string;
  };
  domain: string;
  targetLanguages?: string[];
  seoOptimization?: boolean;
  contentType: 'video-description' | 'blog-post' | 'social-caption' | 'website-copy';
}

export interface PlatformContentResult {
  original: {
    title: string;
    description: string;
    tags?: string[];
  };
  seoOptimized?: {
    title: string;
    description: string;
    keywords: string[];
    suggestions: string[];
  };
  translations?: Record<string, {
    title: string;
    description: string;
    tags?: string[];
    localizedKeywords: string[];
  }>;
  analytics?: {
    readabilityScore: number;
    keywordDensity: Record<string, number>;
    suggestions: string[];
  };
}

export class PlatformContentGeneratorService {
  private githubModels: GitHubModelsService;

  constructor() {
    this.githubModels = new GitHubModelsService();
  }

  /**
   * Process user's manually created content (Human-First mode)
   * Use case: Creator wants full control, AI only helps with translation/SEO
   */
  async processUserContent(request: PlatformContentRequest): Promise<PlatformContentResult> {
    const { userContent, domain, targetLanguages, seoOptimization, contentType } = request;

    const result: PlatformContentResult = {
      original: {
        title: userContent.title,
        description: userContent.description,
        tags: userContent.tags
      }
    };

    // Step 1: SEO optimization if requested
    if (seoOptimization) {
      console.log('Optimizing for SEO...');
      result.seoOptimized = await this.optimizeForSEO(
        userContent,
        domain,
        contentType
      );
    }

    // Step 2: Translations if requested
    if (targetLanguages && targetLanguages.length > 0) {
      console.log('Generating translations...');
      result.translations = await this.generateTranslations(
        userContent,
        targetLanguages,
        domain,
        contentType
      );
    }

    // Step 3: Analytics and suggestions
    console.log('Analyzing content...');
    result.analytics = await this.analyzeContent(userContent, domain);

    return result;
  }

  /**
   * Optimize user's content for SEO
   */
  private async optimizeForSEO(
    userContent: PlatformContentRequest['userContent'],
    domain: string,
    contentType: string
  ): Promise<PlatformContentResult['seoOptimized']> {
    const prompt = `You are an SEO expert specializing in ${domain} content.

TASK: Analyze and optimize this user-created content for SEO without changing the core message.

USER CONTENT:
Title: ${userContent.title}
Description: ${userContent.description}
${userContent.tags ? `Tags: ${userContent.tags.join(', ')}` : ''}

CONTENT TYPE: ${contentType}
DOMAIN: ${domain}

OUTPUT FORMAT:
{
  "optimized_title": "SEO-optimized version (preserve user's intent)",
  "optimized_description": "SEO-optimized version (preserve user's voice)",
  "keywords": ["primary keyword", "secondary keywords"],
  "keyword_suggestions": ["Additional keywords to consider"],
  "seo_score": 0-100,
  "improvements": [
    {"area": "title | description | keywords", "suggestion": "specific improvement", "impact": "high | medium | low"}
  ],
  "meta_description": "If applicable, 150-160 char meta description"
}

REQUIREMENTS:
- Preserve user's original voice and intent
- Suggest improvements, don't force changes
- Focus on natural keyword integration
- Provide actionable, specific suggestions
- Respect user's creative choices

Generate SEO analysis in JSON format.`;

    try {
      const response = await this.githubModels.generate(prompt, {
        model: 'gpt-4o',
        temperature: 0.3,
        maxTokens: 1000
      });

      const parsed = JSON.parse(response);

      return {
        title: parsed.optimized_title,
        description: parsed.optimized_description,
        keywords: parsed.keywords,
        suggestions: parsed.improvements.map((i: any) => 
          `[${i.impact.toUpperCase()}] ${i.area}: ${i.suggestion}`
        )
      };
    } catch (error) {
      console.error('SEO optimization failed:', error);
      return {
        title: userContent.title,
        description: userContent.description,
        keywords: [],
        suggestions: ['SEO analysis unavailable']
      };
    }
  }

  /**
   * Generate translations for user's content
   */
  private async generateTranslations(
    userContent: PlatformContentRequest['userContent'],
    targetLanguages: string[],
    domain: string,
    contentType: string
  ): Promise<PlatformContentResult['translations']> {
    const translations: PlatformContentResult['translations'] = {};

    const fullContent = `Title: ${userContent.title}\n\nDescription: ${userContent.description}`;

    for (const targetLang of targetLanguages) {
      try {
        const translationPrompt = generateSEOTranslationPrompt({
          content: fullContent,
          sourceLanguage: 'English', // Assume English source, can be detected
          targetLanguage: targetLang,
          domain,
          keywords: userContent.tags || [],
          contentType: contentType as any
        });

        const response = await this.githubModels.generate(translationPrompt, {
          model: 'gpt-4o',
          temperature: 0.3,
          maxTokens: 1500
        });

        const parsed = JSON.parse(response);

        // Extract title and description from translation
        const translatedContent = parsed.translation;
        const titleMatch = translatedContent.match(/Title: (.+?)(?:\n|$)/);
        const descMatch = translatedContent.match(/Description: (.+)/s);

        translations[targetLang] = {
          title: titleMatch ? titleMatch[1].trim() : parsed.metadata?.title_translation || userContent.title,
          description: descMatch ? descMatch[1].trim() : translatedContent,
          tags: userContent.tags,
          localizedKeywords: parsed.localized_keywords || []
        };
      } catch (error) {
        console.error(`Translation to ${targetLang} failed:`, error);
        translations[targetLang] = {
          title: userContent.title,
          description: userContent.description,
          tags: userContent.tags,
          localizedKeywords: []
        };
      }
    }

    return translations;
  }

  /**
   * Analyze user's content and provide insights
   */
  private async analyzeContent(
    userContent: PlatformContentRequest['userContent'],
    domain: string
  ): Promise<PlatformContentResult['analytics']> {
    const prompt = `You are a content analytics expert.

TASK: Analyze this user-created content and provide insights.

CONTENT:
Title: ${userContent.title}
Description: ${userContent.description}

DOMAIN: ${domain}

OUTPUT FORMAT:
{
  "readability": {
    "score": 0-100,
    "reading_level": "grade level",
    "avg_sentence_length": number,
    "notes": "readability feedback"
  },
  "keyword_analysis": {
    "detected_keywords": [{"keyword": "word", "frequency": number, "density": "percentage"}],
    "keyword_density_score": 0-100,
    "notes": "keyword usage feedback"
  },
  "engagement_potential": {
    "score": 0-100,
    "hook_strength": 0-10,
    "cta_clarity": 0-10,
    "notes": "engagement feedback"
  },
  "suggestions": [
    {"priority": "high | medium | low", "suggestion": "specific actionable tip"}
  ]
}

REQUIREMENTS:
- Be constructive and specific
- Focus on actionable improvements
- Respect user's creative choices
- Provide data-driven insights

Generate content analysis in JSON format.`;

    try {
      const response = await this.githubModels.generate(prompt, {
        model: 'gpt-4o',
        temperature: 0.3,
        maxTokens: 1000
      });

      const parsed = JSON.parse(response);

      const keywordDensity: Record<string, number> = {};
      parsed.keyword_analysis.detected_keywords.forEach((kw: any) => {
        keywordDensity[kw.keyword] = kw.frequency;
      });

      return {
        readabilityScore: parsed.readability.score,
        keywordDensity,
        suggestions: parsed.suggestions.map((s: any) => 
          `[${s.priority.toUpperCase()}] ${s.suggestion}`
        )
      };
    } catch (error) {
      console.error('Content analysis failed:', error);
      return {
        readabilityScore: 0,
        keywordDensity: {},
        suggestions: ['Analysis unavailable']
      };
    }
  }

  /**
   * Generate keyword suggestions for user's content
   */
  async suggestKeywords(
    content: string,
    domain: string,
    count: number = 10
  ): Promise<string[]> {
    const prompt = `Extract the top ${count} SEO keywords for this ${domain} content.

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
      console.error('Keyword suggestion failed:', error);
      return [];
    }
  }

  /**
   * Validate user's content against platform requirements
   */
  async validateForPlatform(
    content: string,
    platform: string
  ): Promise<{ valid: boolean; issues: string[]; suggestions: string[] }> {
    const platformLimits: Record<string, any> = {
      'youtube': { titleMax: 100, descriptionMax: 5000 },
      'instagram': { captionMax: 2200, hashtagMax: 30 },
      'tiktok': { captionMax: 150, hashtagMax: 15 },
      'twitter': { tweetMax: 280 },
      'linkedin': { postMax: 3000 }
    };

    const limits = platformLimits[platform];
    if (!limits) {
      return { valid: true, issues: [], suggestions: [] };
    }

    const issues: string[] = [];
    const suggestions: string[] = [];

    // Check length constraints
    if (limits.titleMax && content.length > limits.titleMax) {
      issues.push(`Content exceeds ${platform} title limit (${limits.titleMax} chars)`);
      suggestions.push(`Shorten to ${limits.titleMax} characters or less`);
    }

    if (limits.captionMax && content.length > limits.captionMax) {
      issues.push(`Content exceeds ${platform} caption limit (${limits.captionMax} chars)`);
      suggestions.push(`Shorten to ${limits.captionMax} characters or less`);
    }

    return {
      valid: issues.length === 0,
      issues,
      suggestions
    };
  }
}
