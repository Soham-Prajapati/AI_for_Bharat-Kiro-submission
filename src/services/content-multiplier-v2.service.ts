/**
 * Content Multiplier V2 Service
 * 
 * Advanced content repurposing: 1 video → 100+ pieces
 * - AI-generated variations for each platform (REAL AI)
 * - Platform-specific optimizations
 * - Auto-scheduling recommendations
 * - Content calendar generation
 * - Performance tracking
 * 
 * UPDATED: Now uses GitHubModelsService for actual AI content generation
 */

import { GitHubModelsService } from './github-models.service';

// Initialize AI service
const githubModels = new GitHubModelsService();

export interface MultiplyRequest {
  videoId: string;
  transcript: string;
  duration: number; // seconds
  platforms: ('youtube' | 'instagram' | 'tiktok' | 'twitter' | 'linkedin' | 'facebook' | 'pinterest' | 'reddit')[];
  contentTypes: ('short' | 'reel' | 'story' | 'post' | 'thread' | 'carousel' | 'infographic' | 'quote' | 'audiogram' | 'blog')[];
  variations: number; // Number of variations per content type (1-5)
  includeScheduling?: boolean;
  targetAudience?: string;
  brandVoice?: 'professional' | 'casual' | 'humorous' | 'inspirational' | 'educational';
}

export interface ContentPiece {
  pieceId: string;
  type: string;
  platform: string;
  title?: string;
  content: string;
  hashtags?: string[];
  media?: {
    type: 'image' | 'video' | 'audio';
    url: string;
    thumbnail?: string;
    duration?: number;
  };
  scheduledTime?: Date;
  estimatedEngagement: number;
  priority: 'high' | 'medium' | 'low';
  variation: number;
}

export interface MultiplyResult {
  multiplyId: string;
  videoId: string;
  totalPieces: number;
  pieces: ContentPiece[];
  contentCalendar: ContentCalendarEntry[];
  analytics: {
    piecesByPlatform: Record<string, number>;
    piecesByType: Record<string, number>;
    estimatedReach: number;
    estimatedEngagement: number;
    contentDiversity: number; // 0-100
  };
  recommendations: string[];
  generatedAt: string;
}

export interface ContentCalendarEntry {
  date: Date;
  dayOfWeek: string;
  pieces: ContentPiece[];
  theme?: string;
  notes?: string;
}

export class ContentMultiplierV2Service {
  private multiplications: Map<string, MultiplyResult>;

  constructor() {
    this.multiplications = new Map();
  }

  // ============================================================================
  // MAIN MULTIPLICATION
  // ============================================================================

  /**
   * Multiply content: 1 video → 100+ pieces
   */
  async multiplyContent(request: MultiplyRequest): Promise<MultiplyResult> {
    const pieces: ContentPiece[] = [];

    // Generate content for each platform and type
    for (const platform of request.platforms) {
      for (const contentType of request.contentTypes) {
        // Generate variations
        for (let i = 1; i <= request.variations; i++) {
          const piece = await this.generateContentPiece(
            request,
            platform,
            contentType,
            i
          );
          pieces.push(piece);
        }
      }
    }

    // Generate content calendar if requested
    const contentCalendar = request.includeScheduling
      ? this.generateContentCalendar(pieces)
      : [];

    // Calculate analytics
    const analytics = this.calculateAnalytics(pieces, request);

    // Generate recommendations
    const recommendations = this.generateRecommendations(pieces, request);

    const result: MultiplyResult = {
      multiplyId: this.generateId('multiply'),
      videoId: request.videoId,
      totalPieces: pieces.length,
      pieces,
      contentCalendar,
      analytics,
      recommendations,
      generatedAt: new Date().toISOString(),
    };

    this.multiplications.set(result.multiplyId, result);
    return result;
  }

  // ============================================================================
  // CONTENT GENERATION
  // ============================================================================

  /**
   * Generate single content piece
   */
  private async generateContentPiece(
    request: MultiplyRequest,
    platform: string,
    contentType: string,
    variation: number
  ): Promise<ContentPiece> {
    // Extract key points from transcript
    const keyPoints = this.extractKeyPoints(request.transcript);

    // Generate content based on type
    let content = '';
    let title = '';
    let hashtags: string[] = [];
    let media: ContentPiece['media'];

    switch (contentType) {
      case 'short':
        content = await this.generateShortFormContent(keyPoints, platform, variation, request.brandVoice);
        hashtags = this.generateHashtags(content, platform, 10);
        media = { type: 'video', url: `${request.videoId}_short_${variation}.mp4`, duration: 60 };
        break;

      case 'reel':
        content = await this.generateReelContent(keyPoints, variation, request.brandVoice);
        hashtags = this.generateHashtags(content, platform, 20);
        media = { type: 'video', url: `${request.videoId}_reel_${variation}.mp4`, duration: 30 };
        break;

      case 'story':
        content = await this.generateStoryContent(keyPoints, variation, request.brandVoice);
        media = { type: 'image', url: `${request.videoId}_story_${variation}.jpg` };
        break;

      case 'post':
        ({ title, content } = await this.generateSocialPost(keyPoints, platform, variation, request.brandVoice));
        hashtags = this.generateHashtags(content, platform, 15);
        break;

      case 'thread':
        content = await this.generateThread(keyPoints, variation, request.brandVoice);
        break;

      case 'carousel':
        content = await this.generateCarouselContent(keyPoints, variation, request.brandVoice);
        media = { type: 'image', url: `${request.videoId}_carousel_${variation}.jpg` };
        hashtags = this.generateHashtags(content, platform, 15);
        break;

      case 'infographic':
        content = await this.generateInfographicContent(keyPoints, variation);
        media = { type: 'image', url: `${request.videoId}_infographic_${variation}.png` };
        break;

      case 'quote':
        content = await this.generateQuoteContent(keyPoints, variation, request.brandVoice);
        media = { type: 'image', url: `${request.videoId}_quote_${variation}.jpg` };
        hashtags = this.generateHashtags(content, platform, 10);
        break;

      case 'audiogram':
        content = await this.generateAudiogramContent(keyPoints, variation);
        media = { type: 'audio', url: `${request.videoId}_audiogram_${variation}.mp3`, duration: 60 };
        break;

      case 'blog':
        ({ title, content } = await this.generateBlogPost(keyPoints, variation, request.brandVoice));
        break;

      default:
        content = await this.generateGenericContent(keyPoints, variation, request.brandVoice);
    }

    // Estimate engagement
    const estimatedEngagement = this.estimateEngagement(contentType, platform, content);

    // Determine priority
    const priority = this.determinePriority(estimatedEngagement, contentType, platform);

    return {
      pieceId: this.generateId('piece'),
      type: contentType,
      platform,
      title,
      content,
      hashtags,
      media,
      estimatedEngagement,
      priority,
      variation,
    };
  }

  // ============================================================================
  // CONTENT TYPE GENERATORS - AI POWERED
  // ============================================================================

  /**
   * Generate short-form video content (60s) using AI
   */
  private async generateShortFormContent(
    keyPoints: string[],
    platform: string,
    variation: number,
    brandVoice?: string
  ): Promise<string> {
    const prompt = `You are an expert ${platform} content creator. Create a compelling 60-second short-form video script.

KEY POINTS FROM ORIGINAL CONTENT:
${keyPoints.slice(0, 5).map((p, i) => `${i + 1}. ${p}`).join('\n')}

REQUIREMENTS:
- Platform: ${platform.toUpperCase()} (optimize for this platform's audience)
- Duration: 60 seconds
- Tone: ${brandVoice || 'engaging and informative'}
- Variation #${variation} (make it unique)
- Start with a strong hook (first 3 seconds must grab attention)
- Include clear visual/scene suggestions in [brackets]
- End with a platform-appropriate call-to-action

FORMAT:
[0:00-0:03 HOOK]
(attention-grabbing opening)

[0:03-0:20 MAIN POINT 1]
(content with visual suggestions)

[0:20-0:40 MAIN POINT 2]
(content with visual suggestions)

[0:40-0:55 KEY TAKEAWAY]
(memorable conclusion)

[0:55-1:00 CTA]
(call to action)

Generate unique, engaging content now:`;

    try {
      const response = await githubModels.generate(prompt, {
        model: 'gpt-4o',
        temperature: 0.8 + (variation * 0.05), // Slightly different for each variation
        maxTokens: 800
      });
      return response;
    } catch (error) {
      console.error('AI generation failed for short-form, using fallback:', error);
      // Fallback template
      const cta = platform === 'tiktok' ? 'Follow for more!' : 'Like and subscribe!';
      return `🎬 ${keyPoints[0] || 'Key insight'}\n\n✨ ${keyPoints[1] || 'More details'}\n\n💡 ${keyPoints[2] || 'Pro tip'}\n\n${cta}`;
    }
  }

  /**
   * Generate Instagram/TikTok reel content (30s) using AI
   */
  private async generateReelContent(
    keyPoints: string[],
    variation: number,
    brandVoice?: string
  ): Promise<string> {
    const prompt = `Create an engaging 30-second Instagram Reel script.

KEY POINTS:
${keyPoints.slice(0, 4).map((p, i) => `${i + 1}. ${p}`).join('\n')}

REQUIREMENTS:
- Duration: 30 seconds max
- Tone: ${brandVoice || 'trendy and engaging'}
- Start with a hook that stops the scroll
- Include emoji for visual appeal
- Add trending reel format elements
- End with "Save this!" or similar CTA
- Variation #${variation}

Generate the reel script:`;

    try {
      const response = await githubModels.generate(prompt, {
        model: 'gpt-4o',
        temperature: 0.8,
        maxTokens: 500
      });
      return response;
    } catch (error) {
      console.error('AI generation failed for reel, using fallback:', error);
      return `✨ ${keyPoints[0] || 'Quick tip'}\n\n💡 ${keyPoints[1] || 'Key insight'}\n\nSave this for later! 📌`;
    }
  }

  /**
   * Generate story content (24h ephemeral) using AI
   */
  private async generateStoryContent(
    keyPoints: string[],
    variation: number,
    brandVoice?: string
  ): Promise<string> {
    const prompt = `Create an engaging Instagram Story slide.

KEY INSIGHT: ${keyPoints[0] || 'Interesting topic'}

REQUIREMENTS:
- Very short (story slide format)
- Include emoji
- Add interactive element (poll, question, or CTA)
- Tone: ${brandVoice || 'casual and engaging'}
- Variation #${variation}

Generate story content:`;

    try {
      const response = await githubModels.generate(prompt, {
        model: 'gpt-4o',
        temperature: 0.8,
        maxTokens: 200
      });
      return response;
    } catch (error) {
      console.error('AI generation failed for story, using fallback:', error);
      return `🔥 ${keyPoints[0] || 'Hot take'}\n\nSwipe up to learn more! ✨`;
    }
  }

  /**
   * Generate social media post using AI
   */
  private async generateSocialPost(
    keyPoints: string[],
    platform: string,
    variation: number,
    brandVoice?: string
  ): Promise<{ title: string; content: string }> {
    const prompt = `Create an engaging ${platform.toUpperCase()} post.

KEY POINTS:
${keyPoints.slice(0, 4).map((p, i) => `${i + 1}. ${p}`).join('\n')}

PLATFORM: ${platform}
TONE: ${brandVoice || 'professional yet engaging'}
VARIATION: #${variation}

REQUIREMENTS:
${platform === 'linkedin' ? `- Professional tone
- Include personal insight or story hook
- Add line breaks for readability
- End with a question to drive engagement
- 150-300 words` : 
platform === 'facebook' ? `- Conversational and friendly
- Include emoji naturally
- End with "Tag someone" or similar CTA
- 50-150 words` : 
`- Platform-optimized format
- Include relevant emoji
- Clear call-to-action
- Concise and engaging`}

OUTPUT FORMAT:
Title: [catchy title/headline]
---
Content:
[the full post content]

Generate now:`; 

    try {
      const response = await githubModels.generate(prompt, {
        model: 'gpt-4o',
        temperature: 0.7,
        maxTokens: 600
      });
      
      // Parse title and content
      const titleMatch = response.match(/Title:\s*(.+?)(?:\n|---)/);
      const contentMatch = response.match(/Content:\s*([\s\S]+)/);
      
      return {
        title: titleMatch?.[1]?.trim() || keyPoints[0] || 'Engaging Post',
        content: contentMatch?.[1]?.trim() || response
      };
    } catch (error) {
      console.error('AI generation failed for social post, using fallback:', error);
      const title = keyPoints[0] || 'Interesting insight';
      let content = `${title}\n\n`;
      keyPoints.slice(1, 3).forEach((point) => {
        content += `• ${point}\n`;
      });
      content += `\nWhat do you think? 💭`;
      return { title, content };
    }
  }

  /**
   * Generate Twitter thread using AI
   */
  private async generateThread(
    keyPoints: string[],
    variation: number,
    brandVoice?: string
  ): Promise<string> {
    const prompt = `Create an engaging Twitter/X thread (8-12 tweets).

KEY POINTS TO COVER:
${keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

REQUIREMENTS:
- Each tweet must be under 280 characters
- Start with a hook that makes people want to read more
- Number each tweet (1/, 2/, etc.)
- Include 🧵 emoji on first tweet
- Add relevant emoji throughout
- End with a strong call-to-action (retweet if useful, follow for more, etc.)
- Tone: ${brandVoice || 'insightful and engaging'}
- Variation #${variation}

Generate the complete thread:`;

    try {
      const response = await githubModels.generate(prompt, {
        model: 'gpt-4o',
        temperature: 0.8,
        maxTokens: 1000
      });
      return response;
    } catch (error) {
      console.error('AI generation failed for thread, using fallback:', error);
      let thread = `1/ ${keyPoints[0] || 'Thread'} 🧵\n\n`;
      keyPoints.slice(1, 5).forEach((point, i) => {
        thread += `${i + 2}/ ${point}\n\n`;
      });
      thread += `${keyPoints.length}/ That's it! Retweet if useful 🙏`;
      return thread;
    }
  }

  /**
   * Generate carousel content (multi-slide) using AI
   */
  private async generateCarouselContent(
    keyPoints: string[],
    variation: number,
    brandVoice?: string
  ): Promise<string> {
    const prompt = `Create an Instagram carousel post (6-10 slides).

KEY POINTS:
${keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

REQUIREMENTS:
- Slide 1: Eye-catching title/hook
- Slides 2-8: One key point per slide (short, punchy text)
- Last slide: Call-to-action (save, share, follow)
- Each slide should have minimal text (3-5 lines max)
- Include emoji for visual appeal
- Design suggestions in [brackets]
- Tone: ${brandVoice || 'educational and engaging'}
- Variation #${variation}

FORMAT:
Slide 1: [TITLE]
text here
[design suggestion]

Slide 2: [TOPIC]
text here

...continue for all slides

Generate the carousel:`; 

    try {
      const response = await githubModels.generate(prompt, {
        model: 'gpt-4o',
        temperature: 0.7,
        maxTokens: 800
      });
      return response;
    } catch (error) {
      console.error('AI generation failed for carousel, using fallback:', error);
      let carousel = `Slide 1: ${keyPoints[0] || 'Title'}\n\n`;
      keyPoints.slice(1, 5).forEach((point, i) => {
        carousel += `Slide ${i + 2}: ${point}\n\n`;
      });
      carousel += `Last Slide: Save this for later! ➡️`;
      return carousel;
    }
  }

  /**
   * Generate infographic content using AI
   */
  private async generateInfographicContent(
    keyPoints: string[],
    variation: number
  ): Promise<string> {
    const prompt = `Create content for an infographic.

KEY POINTS:
${keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

REQUIREMENTS:
- Clear, visual-friendly structure
- Numbered or bulleted points
- Design suggestions for each section
- Include data visualization ideas
- Variation #${variation}

FORMAT:
📊 INFOGRAPHIC: [Title]

Section 1: [Topic]
• Key stat or fact
[Visual suggestion: chart type, icon, etc.]

...continue for all sections

Generate the infographic content:`;

    try {
      const response = await githubModels.generate(prompt, {
        model: 'gpt-4o',
        temperature: 0.7,
        maxTokens: 600
      });
      return response;
    } catch (error) {
      console.error('AI generation failed for infographic, using fallback:', error);
      let infographic = `📊 Infographic: ${keyPoints[0] || 'Visual guide'}\n\n`;
      keyPoints.slice(1, 5).forEach((point, i) => {
        infographic += `${i + 1}. ${point}\n`;
      });
      infographic += `\n[Visual: Data visualization with icons and charts]`;
      return infographic;
    }
  }

  /**
   * Generate quote card content using AI
   */
  private async generateQuoteContent(
    keyPoints: string[],
    variation: number,
    brandVoice?: string
  ): Promise<string> {
    const prompt = `Create a powerful quote card from this content.

KEY INSIGHTS:
${keyPoints.slice(0, 3).map((p, i) => `${i + 1}. ${p}`).join('\n')}

REQUIREMENTS:
- Extract or create a memorable, quotable statement
- Should be inspiring/thought-provoking
- 15-30 words maximum
- Include attribution suggestion
- Design suggestion
- Variation #${variation}

FORMAT:
"[The quote here]"

— [Attribution]

[Visual suggestion: design style, colors, etc.]

Generate the quote card:`;

    try {
      const response = await githubModels.generate(prompt, {
        model: 'gpt-4o',
        temperature: 0.8,
        maxTokens: 200
      });
      return response;
    } catch (error) {
      console.error('AI generation failed for quote, using fallback:', error);
      const quote = keyPoints[0] || 'Inspirational thought';
      return `"${quote}"\n\n[Visual: Beautiful quote card with branded design]`;
    }
  }

  /**
   * Generate audiogram content (audio snippet) using AI
   */
  private async generateAudiogramContent(
    keyPoints: string[],
    variation: number
  ): Promise<string> {
    const prompt = `Create an audiogram/audio snippet promotion.

KEY POINTS FROM AUDIO:
${keyPoints.slice(0, 4).map((p, i) => `${i + 1}. ${p}`).join('\n')}

REQUIREMENTS:
- Select the most engaging 30-60 second clip idea
- Create caption/teaser text
- Include timestamp suggestion
- Waveform visual suggestion
- Variation #${variation}

FORMAT:
🎧 AUDIOGRAM: [Title]

Featured Quote:
"[Most engaging snippet]"

Caption: [Social media caption]

[Visual: Audiogram design suggestion]

Generate the audiogram:`;

    try {
      const response = await githubModels.generate(prompt, {
        model: 'gpt-4o',
        temperature: 0.7,
        maxTokens: 400
      });
      return response;
    } catch (error) {
      console.error('AI generation failed for audiogram, using fallback:', error);
      const point = keyPoints[variation % keyPoints.length] || 'Key insight';
      return `🎧 Audio snippet:\n\n"${point}"\n\n[Visual: Animated waveform with captions]\n\nListen to the full episode!`;
    }
  }

  /**
   * Generate blog post using AI
   */
  private async generateBlogPost(
    keyPoints: string[],
    variation: number,
    brandVoice?: string
  ): Promise<{ title: string; content: string }> {
    const prompt = `Write a compelling blog post based on these key points.

KEY POINTS:
${keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

REQUIREMENTS:
- Engaging, SEO-friendly title
- Hook readers in the introduction
- Well-structured with H2 headings
- Include practical insights and examples
- End with a strong call-to-action
- 400-600 words
- Tone: ${brandVoice || 'informative and engaging'}
- Variation #${variation}

FORMAT:
TITLE: [Blog post title]

---

# [Title]

[Introduction paragraph - hook the reader]

## [Section 1 Heading]
[Content with insights]

## [Section 2 Heading]
[Content with examples]

## [Section 3 Heading]
[Content with practical advice]

## Conclusion
[Wrap up with key takeaways and CTA]

Generate the blog post:`;

    try {
      const response = await githubModels.generate(prompt, {
        model: 'gpt-4o',
        temperature: 0.7,
        maxTokens: 1200
      });
      
      // Parse title
      const titleMatch = response.match(/TITLE:\s*(.+?)(?:\n|---)/);
      const title = titleMatch?.[1]?.trim() || keyPoints[0] || 'Blog Post';
      
      // Get content after the title line
      const contentMatch = response.match(/---\s*([\s\S]+)/);
      const content = contentMatch?.[1]?.trim() || response;
      
      return { title, content };
    } catch (error) {
      console.error('AI generation failed for blog post, using fallback:', error);
      const title = keyPoints[0] || 'Blog post';
      let content = `# ${title}\n\n`;
      content += `## Introduction\n\n${keyPoints[1] || 'Opening'}\n\n`;
      keyPoints.slice(2, 5).forEach((point, i) => {
        content += `## ${point.split(' ').slice(0, 3).join(' ')}\n\n${point}\n\n`;
      });
      content += `## Conclusion\n\nWhat do you think? Share your thoughts!`;
      return { title, content };
    }
  }

  /**
   * Generate generic content using AI
   */
  private async generateGenericContent(
    keyPoints: string[],
    variation: number,
    brandVoice?: string
  ): Promise<string> {
    const prompt = `Create engaging social media content from these key points.

KEY POINTS:
${keyPoints.slice(0, 4).map((p, i) => `${i + 1}. ${p}`).join('\n')}

REQUIREMENTS:
- Engaging and shareable
- Include emoji for visual appeal
- Clear call-to-action
- Tone: ${brandVoice || 'friendly and informative'}
- Variation #${variation}

Generate the content:`;

    try {
      const response = await githubModels.generate(prompt, {
        model: 'gpt-4o',
        temperature: 0.8,
        maxTokens: 400
      });
      return response;
    } catch (error) {
      console.error('AI generation failed for generic content, using fallback:', error);
      return keyPoints.slice(0, 3).join('\n\n') || 'Content generated from video';
    }
  }

  // ============================================================================
  // HELPER METHODS - AI ENHANCED
  // ============================================================================

  /**
   * Extract key points from transcript using AI
   */
  private async extractKeyPointsWithAI(transcript: string): Promise<string[]> {
    const prompt = `Extract 5-8 key points from this transcript.

TRANSCRIPT:
${transcript.substring(0, 2000)}

REQUIREMENTS:
- Each point should be a complete, standalone insight
- Focus on actionable or memorable content
- Keep each point under 100 characters
- Prioritize the most valuable information

Return as a JSON array of strings:
["point 1", "point 2", ...]`;

    try {
      const response = await githubModels.generate(prompt, {
        model: 'gpt-4o',
        temperature: 0.3,
        maxTokens: 500
      });
      
      // Try to parse JSON
      const match = response.match(/\[[\s\S]*\]/);
      if (match) {
        return JSON.parse(match[0]);
      }
      return this.extractKeyPoints(transcript);
    } catch (error) {
      console.error('AI key point extraction failed, using fallback:', error);
      return this.extractKeyPoints(transcript);
    }
  }

  /**
   * Extract key points from transcript (fallback)
   */
  private extractKeyPoints(transcript: string): string[] {
    // Simple extraction (in production, use AI for better results)
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    // Take every 3rd sentence as a key point
    const keyPoints: string[] = [];
    for (let i = 0; i < sentences.length; i += 3) {
      keyPoints.push(sentences[i].trim());
      if (keyPoints.length >= 10) break;
    }

    return keyPoints.length > 0 ? keyPoints : ['Key insight from video'];
  }

  /**
   * Generate hashtags for content
   */
  private generateHashtags(content: string, platform: string, count: number): string[] {
    // Simple hashtag generation (in production, use AI for better results)
    const words = content.toLowerCase().match(/\b\w{4,}\b/g) || [];
    const uniqueWords = [...new Set(words)];
    
    const hashtags = uniqueWords
      .slice(0, count)
      .map(word => `#${word.charAt(0).toUpperCase() + word.slice(1)}`);

    // Add platform-specific trending hashtags
    if (platform === 'instagram') {
      hashtags.push('#InstaGood', '#PhotoOfTheDay', '#InstaDaily');
    } else if (platform === 'tiktok') {
      hashtags.push('#FYP', '#ForYou', '#Viral');
    } else if (platform === 'linkedin') {
      hashtags.push('#Professional', '#Career', '#Business');
    }

    return hashtags.slice(0, count);
  }

  /**
   * Estimate engagement for content piece
   */
  private estimateEngagement(contentType: string, platform: string, content: string): number {
    let baseScore = 50;

    // Content type multipliers
    const typeMultipliers: Record<string, number> = {
      'short': 1.5,
      'reel': 1.8,
      'story': 1.2,
      'post': 1.0,
      'thread': 1.3,
      'carousel': 1.4,
      'infographic': 1.6,
      'quote': 1.1,
      'audiogram': 1.2,
      'blog': 0.9,
    };

    // Platform multipliers
    const platformMultipliers: Record<string, number> = {
      'tiktok': 1.8,
      'instagram': 1.5,
      'youtube': 1.3,
      'twitter': 1.2,
      'linkedin': 1.0,
      'facebook': 1.1,
      'pinterest': 1.2,
      'reddit': 1.4,
    };

    // Content quality factors
    const hasHashtags = content.includes('#');
    const hasEmojis = /[\u{1F300}-\u{1F9FF}]/u.test(content);
    const hasCallToAction = /follow|like|subscribe|share|comment|save/i.test(content);
    const isShort = content.length < 500;

    let qualityMultiplier = 1.0;
    if (hasHashtags) qualityMultiplier += 0.1;
    if (hasEmojis) qualityMultiplier += 0.1;
    if (hasCallToAction) qualityMultiplier += 0.15;
    if (isShort) qualityMultiplier += 0.05;

    const score = baseScore * 
      (typeMultipliers[contentType] || 1.0) * 
      (platformMultipliers[platform] || 1.0) * 
      qualityMultiplier;

    return Math.min(100, Math.round(score));
  }

  /**
   * Determine priority based on engagement
   */
  private determinePriority(engagement: number, contentType: string, platform: string): 'high' | 'medium' | 'low' {
    // High-value platforms and types
    const highValuePlatforms = ['tiktok', 'instagram', 'youtube'];
    const highValueTypes = ['short', 'reel', 'infographic'];

    if (engagement >= 80 || (highValuePlatforms.includes(platform) && highValueTypes.includes(contentType))) {
      return 'high';
    } else if (engagement >= 60) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  // ============================================================================
  // CONTENT CALENDAR
  // ============================================================================

  /**
   * Generate content calendar with scheduling recommendations
   */
  private generateContentCalendar(pieces: ContentPiece[]): ContentCalendarEntry[] {
    const calendar: ContentCalendarEntry[] = [];
    const startDate = new Date();
    
    // Sort pieces by priority
    const sortedPieces = [...pieces].sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    // Distribute pieces over 30 days (3-4 pieces per day)
    const piecesPerDay = Math.ceil(pieces.length / 30);
    let currentDate = new Date(startDate);
    let dayPieces: ContentPiece[] = [];

    sortedPieces.forEach((piece, index) => {
      // Assign optimal posting time based on platform
      const optimalTime = this.getOptimalPostingTime(piece.platform, currentDate);
      piece.scheduledTime = optimalTime;

      dayPieces.push(piece);

      // Move to next day after piecesPerDay pieces
      if ((index + 1) % piecesPerDay === 0 || index === sortedPieces.length - 1) {
        calendar.push({
          date: new Date(currentDate),
          dayOfWeek: currentDate.toLocaleDateString('en-US', { weekday: 'long' }),
          pieces: [...dayPieces],
          theme: this.generateDayTheme(dayPieces),
        });

        dayPieces = [];
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    return calendar;
  }

  /**
   * Get optimal posting time for platform
   */
  private getOptimalPostingTime(platform: string, date: Date): Date {
    const optimalHours: Record<string, number[]> = {
      'instagram': [9, 12, 17], // 9am, 12pm, 5pm
      'tiktok': [7, 12, 19], // 7am, 12pm, 7pm
      'twitter': [8, 12, 17], // 8am, 12pm, 5pm
      'linkedin': [8, 12, 17], // 8am, 12pm, 5pm (business hours)
      'facebook': [9, 13, 19], // 9am, 1pm, 7pm
      'youtube': [14, 18, 20], // 2pm, 6pm, 8pm
      'pinterest': [20, 21, 22], // 8pm, 9pm, 10pm (evening)
      'reddit': [7, 12, 21], // 7am, 12pm, 9pm
    };

    const hours = optimalHours[platform] || [9, 12, 17];
    const randomHour = hours[Math.floor(Math.random() * hours.length)];

    const scheduledDate = new Date(date);
    scheduledDate.setHours(randomHour, 0, 0, 0);

    return scheduledDate;
  }

  /**
   * Generate theme for day based on content
   */
  private generateDayTheme(pieces: ContentPiece[]): string {
    const types = pieces.map(p => p.type);
    
    if (types.includes('short') || types.includes('reel')) {
      return 'Video Content Day';
    } else if (types.includes('infographic') || types.includes('carousel')) {
      return 'Visual Content Day';
    } else if (types.includes('blog') || types.includes('thread')) {
      return 'Long-Form Content Day';
    } else if (types.includes('quote') || types.includes('story')) {
      return 'Engagement Day';
    } else {
      return 'Mixed Content Day';
    }
  }

  // ============================================================================
  // ANALYTICS
  // ============================================================================

  /**
   * Calculate analytics for multiplied content
   */
  private calculateAnalytics(pieces: ContentPiece[], request: MultiplyRequest): MultiplyResult['analytics'] {
    // Count by platform
    const piecesByPlatform: Record<string, number> = {};
    request.platforms.forEach(platform => {
      piecesByPlatform[platform] = pieces.filter(p => p.platform === platform).length;
    });

    // Count by type
    const piecesByType: Record<string, number> = {};
    request.contentTypes.forEach(type => {
      piecesByType[type] = pieces.filter(p => p.type === type).length;
    });

    // Estimate reach (followers × pieces × platform multiplier)
    const platformReachMultipliers: Record<string, number> = {
      'tiktok': 0.15,
      'instagram': 0.10,
      'youtube': 0.08,
      'twitter': 0.05,
      'linkedin': 0.04,
      'facebook': 0.06,
      'pinterest': 0.07,
      'reddit': 0.12,
    };

    const estimatedReach = pieces.reduce((total, piece) => {
      const multiplier = platformReachMultipliers[piece.platform] || 0.05;
      return total + (10000 * multiplier); // Assuming 10k followers
    }, 0);

    // Estimate engagement
    const estimatedEngagement = pieces.reduce((total, piece) => {
      return total + piece.estimatedEngagement;
    }, 0) / pieces.length;

    // Calculate content diversity (0-100)
    const uniqueTypes = new Set(pieces.map(p => p.type)).size;
    const uniquePlatforms = new Set(pieces.map(p => p.platform)).size;
    const contentDiversity = Math.min(100, (uniqueTypes * 10) + (uniquePlatforms * 8));

    return {
      piecesByPlatform,
      piecesByType,
      estimatedReach: Math.round(estimatedReach),
      estimatedEngagement: Math.round(estimatedEngagement),
      contentDiversity,
    };
  }

  // ============================================================================
  // RECOMMENDATIONS
  // ============================================================================

  /**
   * Generate recommendations for content strategy
   */
  private generateRecommendations(pieces: ContentPiece[], request: MultiplyRequest): string[] {
    const recommendations: string[] = [];

    // Priority pieces
    const highPriorityPieces = pieces.filter(p => p.priority === 'high');
    if (highPriorityPieces.length > 0) {
      recommendations.push(`Focus on ${highPriorityPieces.length} high-priority pieces first for maximum impact`);
    }

    // Platform recommendations
    const platformCounts = pieces.reduce((acc, p) => {
      acc[p.platform] = (acc[p.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topPlatform = Object.entries(platformCounts).sort((a, b) => b[1] - a[1])[0];
    if (topPlatform) {
      recommendations.push(`${topPlatform[0]} has the most content (${topPlatform[1]} pieces) - prioritize this platform`);
    }

    // Content type recommendations
    const shortFormPieces = pieces.filter(p => ['short', 'reel', 'story'].includes(p.type));
    if (shortFormPieces.length > pieces.length * 0.5) {
      recommendations.push('Heavy focus on short-form content - great for viral potential');
    }

    // Scheduling recommendation
    if (request.includeScheduling) {
      recommendations.push(`Content calendar spans ${Math.ceil(pieces.length / 3)} days - maintain consistent posting schedule`);
    }

    // Engagement recommendation
    const avgEngagement = pieces.reduce((sum, p) => sum + p.estimatedEngagement, 0) / pieces.length;
    if (avgEngagement >= 70) {
      recommendations.push('High estimated engagement across content - excellent variety and quality');
    } else if (avgEngagement < 50) {
      recommendations.push('Consider adding more high-engagement content types (reels, shorts, infographics)');
    }

    return recommendations.slice(0, 5);
  }

  // ============================================================================
  // RETRIEVAL METHODS
  // ============================================================================

  /**
   * Get multiplication result by ID
   */
  getMultiplication(multiplyId: string): MultiplyResult | null {
    return this.multiplications.get(multiplyId) || null;
  }

  /**
   * Get pieces by platform
   */
  getPiecesByPlatform(multiplyId: string, platform: string): ContentPiece[] {
    const result = this.multiplications.get(multiplyId);
    if (!result) return [];
    return result.pieces.filter(p => p.platform === platform);
  }

  /**
   * Get pieces by type
   */
  getPiecesByType(multiplyId: string, type: string): ContentPiece[] {
    const result = this.multiplications.get(multiplyId);
    if (!result) return [];
    return result.pieces.filter(p => p.type === type);
  }

  /**
   * Get high priority pieces
   */
  getHighPriorityPieces(multiplyId: string): ContentPiece[] {
    const result = this.multiplications.get(multiplyId);
    if (!result) return [];
    return result.pieces.filter(p => p.priority === 'high');
  }

  /**
   * Get content calendar
   */
  getContentCalendar(multiplyId: string): ContentCalendarEntry[] {
    const result = this.multiplications.get(multiplyId);
    return result?.contentCalendar || [];
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const contentMultiplierV2Service = new ContentMultiplierV2Service();
