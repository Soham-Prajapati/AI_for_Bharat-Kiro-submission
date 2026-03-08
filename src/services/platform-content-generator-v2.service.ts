/**
 * Platform Content Generator V2 Service
 * Generates platform-specific content for upload-to-results flow
 * Supports 8 platforms: YouTube, Instagram, TikTok, LinkedIn, Twitter, Blog, Podcast, Analytics
 */

import { 
  Platform, 
  PlatformContent, 
  VideoMetadata 
} from '../types/upload-to-results';
import { contentMultiplierV2Service, ContentPiece } from './content-multiplier-v2.service';
import { bedrockContentService } from './bedrock-content.service';
import { GitHubModelsService } from './github-models.service';

const githubModels = new GitHubModelsService();

export interface GeneratePlatformContentRequest {
  transcript: string;
  keyPoints: string[];
  metadata: VideoMetadata;
  platforms: Platform[];
  domain?: string;
}

export class PlatformContentGeneratorV2 {
  /**
   * Generate content for all requested platforms in parallel
   * Primary: AWS Bedrock Claude agents (domain-aware, parallel)
   * Fallback: Content Multiplier V2 → basic templates
   */
  async generatePlatformContent(
    request: GeneratePlatformContentRequest
  ): Promise<Record<string, PlatformContent>> {
    const { transcript, keyPoints, metadata, platforms, domain } = request;

    // Primary: AWS Bedrock domain-aware parallel agents
    try {
      const available = await bedrockContentService.checkAvailability();
      if (available) {
        const bedrockResult = await bedrockContentService.generateContent({
          transcript, keyPoints, metadata, platforms, domain,
        });
        if (bedrockResult && Object.keys(bedrockResult).filter(k => k !== 'analytics').length > 0) {
          console.log('Successfully generated content using Bedrock agents');
          return bedrockResult;
        }
      }
    } catch (error: any) {
      console.warn('Bedrock generation failed, falling back to Content Multiplier V2:', error?.message || error);
    }

    // Fallback 1: GitHub Models (GPT-4o) — real AI, per-platform parallel calls
    try {
      const ghResult = await this.generateWithGitHubModels(transcript, keyPoints, metadata, platforms, domain);
      if (ghResult && Object.keys(ghResult).filter(k => k !== 'analytics').length > 0) {
        console.log('Successfully generated content using GitHub Models (GPT-4o)');
        return ghResult;
      }
    } catch (error: any) {
      console.warn('GitHub Models generation failed, falling back to Content Multiplier V2:', error?.message || error);
    }

    // Fallback 2: Content Multiplier V2
    try {
      const multiplierResult = await this.generateWithContentMultiplier(
        transcript,
        keyPoints,
        metadata,
        platforms
      );
      if (multiplierResult && Object.keys(multiplierResult).length > 0) {
        console.log('Successfully generated content using Content Multiplier V2');
        return multiplierResult;
      }
    } catch (error) {
      console.warn('Content Multiplier V2 failed, falling back to basic generation:', error);
    }

    // Final fallback
    return this.generateWithBasicMethod(transcript, keyPoints, metadata, platforms);
  }


  /**
   * Generate platform-specific content using GitHub Models (GPT-4o).
   * This is the AI fallback when Bedrock is unavailable.
   * Each platform gets its own focused prompt and runs in parallel.
   */
  private async generateWithGitHubModels(
    transcript: string,
    keyPoints: string[],
    metadata: VideoMetadata,
    platforms: Platform[],
    domain?: string
  ): Promise<Record<string, PlatformContent>> {
    const kp = keyPoints.slice(0, 5).join(' | ');
    const excerpt = transcript.substring(0, 900);
    const topic = metadata.fileName?.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ') || 'content';
    const domainCtx = domain && domain !== 'General' ? `Domain/niche: ${domain}.` : '';

    const systemBase = `You are an expert Indian content strategist. ${domainCtx}
The creator's content is about: "${topic}"
Key insights from transcript: ${kp}
Transcript excerpt: ${excerpt}

IMPORTANT: Generate ORIGINAL, specific content based on the above. Do NOT echo the transcript back. Do NOT use generic placeholders. Write content the creator can actually use today.`;

    const platformPrompts: Partial<Record<Platform, { prompt: string; maxTokens: number }>> = {
      youtube: {
        maxTokens: 1400,
        prompt: `${systemBase}

Generate a complete YouTube content pack. Return ONLY valid JSON:
{
  "hook": "A powerful 2-3 sentence spoken hook for the first 30 seconds. Start with a surprising question or bold claim that makes viewers unable to click away. Be specific to the topic.",
  "title": "SEO-optimised YouTube title under 70 chars with a power word. Specific and compelling.",
  "titleAlternatives": ["second strong title option", "third strong title option"],
  "description": "A complete 200-word YouTube description. Open with a punchy value statement, list 3 specific things viewers will learn, add timestamps placeholder, include relevant keywords naturally, end with a subscribe CTA.",
  "chapters": [
    {"time": "0:00", "title": "Hook & what we're covering"},
    {"time": "1:30", "title": "First key insight"},
    {"time": "3:00", "title": "Second key insight"},
    {"time": "4:30", "title": "Practical takeaway"},
    {"time": "5:30", "title": "Wrap-up"}
  ],
  "tags": ["specific-tag-1", "specific-tag-2", "specific-tag-3", "specific-tag-4", "specific-tag-5", "specific-tag-6", "specific-tag-7", "specific-tag-8", "specific-tag-9", "specific-tag-10"],
  "thumbnailConcept": "Describe the thumbnail: exact visual, text overlay (max 5 words), and emotional expression to maximise CTR"
}`,
      },

      instagram: {
        maxTokens: 800,
        prompt: `${systemBase}

Generate a complete Instagram content pack. Return ONLY valid JSON:
{
  "hook": "On-screen text for the first 3 seconds of the reel. Max 8 words. Shocking, curiosity-gap, or bold. Specific to the topic.",
  "caption": "Full Instagram caption: bold hook line, 3-4 value sentences with relevant emojis, line breaks for readability, strong CTA (save/follow/comment). Under 150 words. Be specific, not generic.",
  "hashtags": ["#india", "#travel", "#reels", "#trending", "#viral", "#explore", "#reelsinstagram", "#instareels", "#indiancreator", "#contentcreator", "#insta", "#instagood", "#reelsvideo", "#instadaily", "#fyp", "#reelsindia", "#indiatravel", "#travelreels", "#travelblogger", "#wanderlust"],
  "reelConcept": "A specific 3-act reel structure: Hook (0-3s: exact visual/text), Content (3-25s: specific beats to show), Payoff (25-30s: reveal + CTA)",
  "coverConcept": "Instagram cover concept: dominant colour, bold text overlay (3-5 words), visual that communicates topic instantly"
}`,
      },

      tiktok: {
        maxTokens: 700,
        prompt: `${systemBase}

Generate TikTok content. Return ONLY valid JSON:
{
  "hook": "First 3 seconds on-screen text. Max 8 words. Controversial, surprising, or a bold statement to stop scrolling. Specific to this topic.",
  "caption": "TikTok caption under 120 chars. Punchy with 2-3 relevant emojis.",
  "hashtags": ["#fyp", "#foryou", "#foryoupage", "#viral", "#trending", "#india", "#tiktokindia", "#tiktoktrend", "#explore", "#learnontiktok"],
  "videoStructure": "Specific scene-by-scene TikTok structure: Hook (0-3s exact visual), Core content (3-45s: 3-4 punchy beats to film), Payoff (45-60s: surprising end or CTA)",
  "soundSuggestion": "Specific audio style that amplifies this content (e.g. trending beat genre, voiceover only, emotional piano, etc.)"
}`,
      },

      linkedin: {
        maxTokens: 1000,
        prompt: `${systemBase}

Generate a LinkedIn post. Return ONLY valid JSON:
{
  "headline": "One bold sentence to stop scrolling. A strong claim, contrarian take, or specific number. This is the FIRST line of the post — not a title.",
  "post": "Full LinkedIn post (160-200 words): Start with the headline, blank line, then 3-4 insight paragraphs with blank lines between each. Conversational but professional. End with a direct question to drive comments.",
  "hashtags": ["#india", "#growth", "#career", "#learning", "#leadership"],
  "keyInsight": "The single most shareable insight in 1-2 punchy sentences — the thing people screenshot"
}`,
      },

      twitter: {
        maxTokens: 900,
        prompt: `${systemBase}

Generate a Twitter/X thread. Return ONLY valid JSON:
{
  "hook": "Opening tweet under 280 chars. Bold claim or surprising question that makes people click 'read more'. Specific, not generic.",
  "thread": [
    "Tweet 2: expand the hook with the context people need (under 280 chars)",
    "Tweet 3: the surprising insight or counter-intuitive point (under 280 chars)",
    "Tweet 4: specific actionable tip anyone can use today (under 280 chars)",
    "Tweet 5: real-world example or mini-story to make it concrete (under 280 chars)",
    "Tweet 6: the broader implication — why this matters now (under 280 chars)"
  ],
  "cta": "Final tweet: engaging question + follow for more CTA (under 280 chars)"
}`,
      },

      blog: {
        maxTokens: 1200,
        prompt: `${systemBase}

Generate a blog post structure. Return ONLY valid JSON:
{
  "title": "SEO blog title 60-70 chars with primary keyword. Specific and promise-driven.",
  "metaDescription": "Meta description under 155 chars: clear value + keyword + subtle CTA",
  "outline": [
    "Introduction: open with a relatable problem or surprising fact",
    "Section 1: first key concept explained simply with an example",
    "Section 2: step-by-step practical application",
    "Section 3: common mistakes and how to avoid them",
    "Conclusion: the one key takeaway + next steps for the reader"
  ],
  "intro": "Opening 2 paragraphs: start with a relatable problem or a surprising statistic. Then establish why this matters and what the reader will walk away with.",
  "cta": "End-of-post call to action that feels natural and valuable, not salesy"
}`,
      },

      podcast: {
        maxTokens: 1200,
        prompt: `${systemBase}

Generate a podcast episode pack. Return ONLY valid JSON:
{
  "episodeTitle": "Episode title that makes listeners click play. Specific, curiosity-driven, promises a clear outcome.",
  "intro": "A 45-second warm spoken intro script. Greet the audience, tease the episode's key insight, explain why it matters today. Conversational, not corporate. Write it as spoken words.",
  "segments": [
    {"title": "Opening story", "description": "Specific relatable hook story or question that sets up the core problem", "duration": "3-4 min"},
    {"title": "Core teaching", "description": "Main insight broken into 2-3 digestible points with real examples", "duration": "8-10 min"},
    {"title": "Practical framework", "description": "Actionable steps the listener can apply immediately after this episode", "duration": "6-8 min"},
    {"title": "Real example or Q&A", "description": "A real-world case study or listener question that makes the lesson concrete", "duration": "4-5 min"}
  ],
  "outro": "30-second outro: summarise the ONE key takeaway, ask listeners to subscribe/share/review, tease what's coming next episode"
}`,
      },
    };

    const targetPlatforms = platforms.filter(p => p !== 'analytics' && platformPrompts[p]);

    const settled = await Promise.allSettled(
      targetPlatforms.map(async (p) => {
        const cfg = platformPrompts[p]!;
        const raw = await githubModels.generate(cfg.prompt, { model: 'gpt-4o', temperature: 0.75, maxTokens: cfg.maxTokens });
        const start = raw.indexOf('{');
        const end = raw.lastIndexOf('}');
        if (start === -1 || end <= start) throw new Error(`No JSON in response for ${p}`);
        const data = JSON.parse(raw.substring(start, end + 1));
        return { platform: p, data };
      })
    );

    const result: Record<string, PlatformContent> = {};

    for (const outcome of settled) {
      if (outcome.status === 'rejected') {
        console.warn('GitHub Models: platform agent failed:', outcome.reason?.message || outcome.reason);
        continue;
      }
      const { platform: p, data } = outcome.value;
      result[p] = this.mapGitHubResponseToContent(p, data);
    }

    if (platforms.includes('analytics')) {
      const wordCount = transcript.split(/\s+/).length;
      result.analytics = {
        platform: 'analytics',
        content: JSON.stringify({ wordCount, keyTopics: keyPoints.slice(0, 5) }, null, 2),
        metadata: { wordCount, keyTopics: keyPoints.slice(0, 5) },
      };
    }

    if (Object.keys(result).filter(k => k !== 'analytics').length === 0) {
      throw new Error('GitHub Models: all platform agents failed');
    }
    return result;
  }

  private mapGitHubResponseToContent(platform: Platform, data: Record<string, any>): PlatformContent {
    switch (platform) {
      case 'youtube':
        return { platform: 'youtube', title: data.title, content: data.description || data.hook, hashtags: data.tags,
          metadata: { hook: data.hook, titleAlternatives: data.titleAlternatives, description: data.description, chapters: data.chapters, thumbnailConcept: data.thumbnailConcept } };
      case 'instagram':
        return { platform: 'instagram', content: data.caption, hashtags: data.hashtags,
          metadata: { hook: data.hook, caption: data.caption, reelConcept: data.reelConcept, coverConcept: data.coverConcept } };
      case 'tiktok':
        return { platform: 'tiktok', content: data.caption, hashtags: data.hashtags,
          metadata: { hook: data.hook, videoStructure: data.videoStructure, soundSuggestion: data.soundSuggestion } };
      case 'linkedin':
        return { platform: 'linkedin', title: data.headline, content: data.post, hashtags: data.hashtags,
          metadata: { headline: data.headline, keyInsight: data.keyInsight } };
      case 'twitter': {
        const tweets = [data.hook, ...(data.thread || []), data.cta].filter(Boolean);
        return { platform: 'twitter', content: tweets.join('\n\n'),
          metadata: { hook: data.hook, thread: data.thread, cta: data.cta, tweets } };
      }
      case 'blog':
        return { platform: 'blog', title: data.title, content: data.intro,
          metadata: { metaDescription: data.metaDescription, outline: data.outline, intro: data.intro, cta: data.cta } };
      case 'podcast':
        return { platform: 'podcast', title: data.episodeTitle, content: data.intro, script: data.intro,
          metadata: { episodeTitle: data.episodeTitle, intro: data.intro, segments: data.segments, outro: data.outro } };
      default:
        return { platform, content: JSON.stringify(data) };
    }
  }

  /**
   * Generate content using Content Multiplier V2 service
   * Maps Content Multiplier V2 response to platform content structure
   */
  private async generateWithContentMultiplier(
    transcript: string,
    keyPoints: string[],
    metadata: VideoMetadata,
    platforms: Platform[]
  ): Promise<Record<string, PlatformContent>> {
    try {
      // Map our platform types to Content Multiplier V2 platform types
      const multiplierPlatforms: Array<'youtube' | 'instagram' | 'tiktok' | 'twitter' | 'linkedin' | 'facebook' | 'pinterest' | 'reddit'> = [];
      
      platforms.forEach(p => {
        if (p === 'analytics') return; // Skip analytics
        if (p === 'blog') {
          multiplierPlatforms.push('linkedin'); // Use LinkedIn for blog-style content
        } else if (p === 'podcast') {
          multiplierPlatforms.push('youtube'); // Use YouTube for podcast content
        } else {
          multiplierPlatforms.push(p as 'youtube' | 'instagram' | 'tiktok' | 'twitter' | 'linkedin');
        }
      });

      // Map our platform types to Content Multiplier V2 content types
      const contentTypes: Array<'short' | 'reel' | 'story' | 'post' | 'thread' | 'carousel' | 'infographic' | 'quote' | 'audiogram' | 'blog'> = [];
      
      if (platforms.includes('youtube')) contentTypes.push('short', 'post');
      if (platforms.includes('instagram')) contentTypes.push('reel', 'post');
      if (platforms.includes('tiktok')) contentTypes.push('short');
      if (platforms.includes('linkedin')) contentTypes.push('post');
      if (platforms.includes('twitter')) contentTypes.push('thread');
      if (platforms.includes('blog')) contentTypes.push('blog');
      if (platforms.includes('podcast')) contentTypes.push('audiogram');

      // Ensure we have at least one content type
      if (contentTypes.length === 0) {
        contentTypes.push('post');
      }

      // Call Content Multiplier V2 service
      const multiplyResult = await contentMultiplierV2Service.multiplyContent({
        videoId: metadata.fileId,
        transcript,
        duration: metadata.duration,
        platforms: multiplierPlatforms,
        contentTypes,
        variations: 1, // Generate 1 variation per content type
        includeScheduling: false,
        brandVoice: 'professional'
      });

      // Validate that we got pieces back
      if (!multiplyResult.pieces || multiplyResult.pieces.length === 0) {
        throw new Error('Content Multiplier V2 returned no content pieces');
      }

      console.log(`Content Multiplier V2 generated ${multiplyResult.pieces.length} pieces`);

      // Map Content Multiplier V2 pieces to our platform content structure
      const platformContent: Record<string, PlatformContent> = {};

      // Group pieces by platform and type
      const piecesByPlatformAndType = this.groupPiecesByPlatformAndType(multiplyResult.pieces);

      // Map each platform's pieces to our PlatformContent structure
      for (const platform of platforms) {
        if (platform === 'analytics') {
          // Generate analytics separately using transcript
          const keyPoints = this.extractKeyPointsFromTranscript(transcript);
          platformContent[platform] = await this.generateAnalyticsContent(transcript, keyPoints);
          continue;
        }

        // Find the best piece for this platform
        const piece = this.findBestPieceForPlatform(platform, piecesByPlatformAndType);

        if (piece) {
          platformContent[platform] = this.mapContentPieceToPlatformContent(
            piece,
            platform,
            metadata,
            keyPoints
          );
          console.log(`Mapped content for ${platform} from piece type: ${piece.type}`);
        } else {
          // Fallback if no pieces generated for this platform
          console.warn(`No content piece found for platform: ${platform}, using fallback`);
          platformContent[platform] = this.createFallbackContent(platform);
        }
      }

      return platformContent;
    } catch (error) {
      // Log the error and re-throw to trigger fallback in parent method
      console.error('Error in generateWithContentMultiplier:', error);
      throw error;
    }
  }

  /**
   * Group Content Multiplier V2 pieces by platform and type
   */
  private groupPiecesByPlatformAndType(pieces: ContentPiece[]): Map<string, ContentPiece[]> {
    const grouped = new Map<string, ContentPiece[]>();
    
    pieces.forEach(piece => {
      const key = `${piece.platform}-${piece.type}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(piece);
    });

    return grouped;
  }

  /**
   * Find the best Content Multiplier V2 piece for a given platform
   */
  private findBestPieceForPlatform(
    platform: Platform,
    piecesByPlatformAndType: Map<string, ContentPiece[]>
  ): ContentPiece | null {
    // Define preferred content types for each platform
    const preferredTypes: Record<Platform, string[]> = {
      youtube: ['short', 'post'],
      instagram: ['reel', 'post'],
      tiktok: ['short', 'reel'],
      linkedin: ['post', 'blog'],
      twitter: ['thread', 'post'],
      blog: ['blog', 'post'],
      podcast: ['audiogram', 'post'],
      analytics: []
    };

    // Map platform to Content Multiplier V2 platform name
    let mappedPlatform = platform;
    if (platform === 'blog') {
      mappedPlatform = 'linkedin';
    } else if (platform === 'podcast') {
      mappedPlatform = 'youtube';
    }

    const types = preferredTypes[platform] || ['post'];

    // Try to find a piece matching preferred types
    for (const type of types) {
      const key = `${mappedPlatform}-${type}`;
      const pieces = piecesByPlatformAndType.get(key);
      if (pieces && pieces.length > 0) {
        return pieces[0]; // Return the first (highest priority) piece
      }
    }

    // Fallback: find any piece for this platform
    for (const [key, pieces] of piecesByPlatformAndType.entries()) {
      if (key.startsWith(`${mappedPlatform}-`) && pieces.length > 0) {
        return pieces[0];
      }
    }

    return null;
  }

  /**
   * Map Content Multiplier V2 ContentPiece to our PlatformContent structure
   */
  private mapContentPieceToPlatformContent(
    piece: ContentPiece,
    platform: Platform,
    metadata: VideoMetadata,
    keyPoints: string[]
  ): PlatformContent {
    // Post-process content based on platform requirements
    let processedContent = piece.content;
    let processedHashtags = piece.hashtags || [];
    let processedTitle = piece.title || this.generateDefaultTitle(platform, piece.content);

    // Platform-specific post-processing
    if (platform === 'tiktok') {
      // Ensure TikTok content is short (max 150 chars)
      if (processedContent.length > 150) {
        processedContent = processedContent.substring(0, 147) + '...';
      }
      // Ensure required hashtags are present
      if (!processedHashtags.includes('#FYP')) processedHashtags.push('#FYP');
      if (!processedHashtags.includes('#ForYou')) processedHashtags.push('#ForYou');
    }

    if (platform === 'instagram') {
      // Ensure Instagram has 20-30 hashtags
      const genericHashtags = ['#InstaGood', '#PhotoOfTheDay', '#InstaDaily', '#Love', '#Instagood', '#Fashion', '#Style', '#Photography'];
      let hashtagIndex = 0;
      while (processedHashtags.length < 20) {
        const baseHashtag = genericHashtags[hashtagIndex % genericHashtags.length];
        const cycle = Math.floor(hashtagIndex / genericHashtags.length);
        const nextHashtag = cycle === 0 ? baseHashtag : `${baseHashtag}${cycle + 1}`;

        if (!processedHashtags.includes(nextHashtag)) {
          processedHashtags.push(nextHashtag);
        }

        hashtagIndex += 1;
      }
      processedHashtags = processedHashtags.slice(0, 30);
    }

    if (platform === 'linkedin') {
      // Limit LinkedIn hashtags to 10
      processedHashtags = processedHashtags.slice(0, 10);
    }

    if (platform === 'youtube') {
      // Keep YouTube title behavior consistent with the basic generation path
      const semanticSeed = keyPoints[0] || this.extractKeyPointsFromTranscript(processedContent)[0] || processedTitle || metadata.fileName;
      processedTitle = this.generateSEOTitle(semanticSeed);
    }

    if (platform === 'podcast') {
      // Ensure podcast has proper script format
      if (!processedContent.includes('INTRO') && !processedContent.includes('OUTRO')) {
        processedContent = this.generatePodcastScript(processedContent, [processedContent]);
      }
    }

    const platformContent: PlatformContent = {
      platform,
      content: processedContent,
      title: processedTitle,
      hashtags: processedHashtags,
      metadata: {
        pieceId: piece.pieceId,
        type: piece.type,
        estimatedEngagement: piece.estimatedEngagement,
        priority: piece.priority,
        variation: piece.variation
      }
    };

    // Add platform-specific enhancements
    if (platform === 'youtube') {
      platformContent.timestamps = this.generateTimestamps(processedContent, metadata.duration);
      platformContent.metadata = {
        ...platformContent.metadata,
        description: processedContent.substring(0, 500),
        tags: processedHashtags.map(h => h.replace('#', ''))
      };
    }

    if (platform === 'podcast') {
      platformContent.script = processedContent;
    }

    if (platform === 'twitter') {
      // Extract tweet count from thread content
      const tweets = processedContent.split('\n\n').filter(t => t.trim().length > 0);
      platformContent.metadata = {
        ...platformContent.metadata,
        tweetCount: tweets.length
      };
    }

    return platformContent;
  }

  /**
   * Generate default title for platforms that need one
   */
  private generateDefaultTitle(platform: Platform, content: string): string {
    // Extract first line or first 50 characters as title
    const firstLine = content.split('\n')[0];
    if (firstLine && firstLine.length > 0 && firstLine.length < 100) {
      return firstLine.replace(/^#+\s*/, '').trim(); // Remove markdown headers
    }
    return content.substring(0, 50).trim() + (content.length > 50 ? '...' : '');
  }

  /**
   * Fallback to basic generation method
   */
  private async generateWithBasicMethod(
    transcript: string,
    keyPoints: string[],
    metadata: VideoMetadata,
    platforms: Platform[]
  ): Promise<Record<string, PlatformContent>> {
    // Generate all platforms in parallel using Promise.allSettled
    const promises = platforms.map(async (platform) => {
      try {
        const content = await this.generateForPlatform(
          platform,
          transcript,
          keyPoints,
          metadata
        );
        return { platform, content, success: true };
      } catch (error) {
        console.error(`Failed to generate content for ${platform}:`, error);
        return {
          platform,
          content: this.createFallbackContent(platform),
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });

    const results = await Promise.allSettled(promises);
    
    // Collect all results (both successful and failed)
    const platformContent: Record<string, PlatformContent> = {};
    
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        const { platform, content } = result.value;
        platformContent[platform] = content;
      }
    });

    return platformContent;
  }

  /**
   * Generate content for a specific platform
   */
  private async generateForPlatform(
    platform: Platform,
    transcript: string,
    keyPoints: string[],
    metadata: VideoMetadata
  ): Promise<PlatformContent> {
    switch (platform) {
      case 'youtube':
        return this.generateYouTubeContent(transcript, keyPoints, metadata);
      case 'instagram':
        return this.generateInstagramContent(transcript, keyPoints);
      case 'tiktok':
        return this.generateTikTokContent(transcript, keyPoints);
      case 'linkedin':
        return this.generateLinkedInContent(transcript, keyPoints);
      case 'twitter':
        return this.generateTwitterContent(transcript, keyPoints);
      case 'blog':
        return this.generateBlogContent(transcript, keyPoints);
      case 'podcast':
        return this.generatePodcastContent(transcript, keyPoints);
      case 'analytics':
        return this.generateAnalyticsContent(transcript, keyPoints);
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  /**
   * Generate YouTube content with SEO-optimized title, script, and timestamps
   */
  private async generateYouTubeContent(
    transcript: string,
    keyPoints: string[],
    metadata: VideoMetadata
  ): Promise<PlatformContent> {
    const title = this.generateSEOTitle(keyPoints[0] || metadata.fileName);
    const description = this.generateDescription(keyPoints);
    const timestamps = this.generateTimestamps(transcript, metadata.duration);
    const tags = this.generateTags(keyPoints);

    return {
      platform: 'youtube',
      title,
      content: this.generateVideoScript(transcript, keyPoints),
      timestamps,
      metadata: {
        description,
        tags
      }
    };
  }

  /**
   * Generate Instagram content with reel caption and hashtags
   */
  private async generateInstagramContent(
    transcript: string,
    keyPoints: string[]
  ): Promise<PlatformContent> {
    const caption = this.generateReelCaption(keyPoints);
    const hashtags = this.generateHashtags(keyPoints, 25);

    return {
      platform: 'instagram',
      content: caption,
      hashtags
    };
  }

  /**
   * Generate TikTok content with short-form viral caption
   */
  private async generateTikTokContent(
    transcript: string,
    keyPoints: string[]
  ): Promise<PlatformContent> {
    const caption = this.generateShortFormCaption(keyPoints);
    const hashtags = this.generateHashtags(keyPoints, 12, ['#FYP', '#ForYou']);

    return {
      platform: 'tiktok',
      content: caption,
      hashtags
    };
  }

  /**
   * Generate LinkedIn content with professional article-style post
   */
  private async generateLinkedInContent(
    transcript: string,
    keyPoints: string[]
  ): Promise<PlatformContent> {
    const title = keyPoints[0] || 'Professional Insights';
    const content = this.generateProfessionalPost(keyPoints);
    const hashtags = this.generateHashtags(keyPoints, 5);

    return {
      platform: 'linkedin',
      title,
      content,
      hashtags
    };
  }

  /**
   * Generate Twitter content with thread (5-10 tweets)
   */
  private async generateTwitterContent(
    transcript: string,
    keyPoints: string[]
  ): Promise<PlatformContent> {
    const thread = this.generateThread(keyPoints);
    const tweetCount = thread.split('\n\n').length;

    return {
      platform: 'twitter',
      content: thread,
      metadata: {
        tweetCount
      }
    };
  }

  /**
   * Generate Blog content with full blog post
   */
  private async generateBlogContent(
    transcript: string,
    keyPoints: string[]
  ): Promise<PlatformContent> {
    const title = this.generateBlogTitle(keyPoints[0] || 'Insights');
    const content = this.generateBlogPost(transcript, keyPoints);

    return {
      platform: 'blog',
      title,
      content
    };
  }

  /**
   * Generate Podcast content with script
   */
  private async generatePodcastContent(
    transcript: string,
    keyPoints: string[]
  ): Promise<PlatformContent> {
    const title = keyPoints[0] || 'Podcast Episode';
    const script = this.generatePodcastScript(transcript, keyPoints);

    return {
      platform: 'podcast',
      title,
      script,
      content: script
    };
  }

  /**
   * Generate Analytics content with insights
   */
  private async generateAnalyticsContent(
    transcript: string,
    keyPoints: string[]
  ): Promise<PlatformContent> {
    const wordCount = transcript.split(/\s+/).length;
    const sentiment = this.analyzeSentiment(transcript);
    const readability = this.calculateReadability(transcript);

    const analyticsData = {
      wordCount,
      keyTopics: keyPoints.slice(0, 5),
      sentiment,
      readability,
      estimatedReadTime: Math.ceil(wordCount / 200) // 200 words per minute
    };

    return {
      platform: 'analytics',
      content: JSON.stringify(analyticsData, null, 2),
      metadata: analyticsData
    };
  }

  // ============================================================================
  // HELPER METHODS - Content Generation
  // ============================================================================

  /**
   * Extract key points from transcript for analytics
   */
  private extractKeyPointsFromTranscript(transcript: string): string[] {
    // Simple extraction - split into sentences and take meaningful ones
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    // Take every 3rd sentence as a key point
    const keyPoints: string[] = [];
    for (let i = 0; i < sentences.length; i += 3) {
      keyPoints.push(sentences[i].trim());
      if (keyPoints.length >= 10) break;
    }

    return keyPoints.length > 0 ? keyPoints : ['Key insight from video'];
  }

  private generateSEOTitle(keyPoint: string): string {
    // Remove file extension if present
    const cleaned = keyPoint.replace(/\.(mp4|mov|avi|mp3|wav|m4a|webm)$/i, '');
    // Capitalize first letter of each word
    return cleaned
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .substring(0, 100); // YouTube title limit
  }

  private generateDescription(keyPoints: string[]): string {
    return keyPoints.slice(0, 3).join('\n\n') + '\n\n#content #video';
  }

  private generateVideoScript(transcript: string, keyPoints: string[]): string {
    const intro = `📹 Video Overview\n\n${keyPoints[0] || 'Welcome to this video!'}\n\n`;
    const mainContent = `📝 Key Points:\n\n${keyPoints.map((point, i) => `${i + 1}. ${point}`).join('\n')}\n\n`;
    const transcriptSection = `📄 Full Transcript:\n\n${transcript.substring(0, 1000)}${transcript.length > 1000 ? '...' : ''}`;
    
    return intro + mainContent + transcriptSection;
  }

  private generateTimestamps(transcript: string, duration: number): Array<{ time: string; text: string }> {
    // Generate 3-5 timestamps based on duration
    const count = Math.min(5, Math.max(3, Math.floor(duration / 60)));
    const timestamps: Array<{ time: string; text: string }> = [];
    
    timestamps.push({ time: '0:00', text: 'Introduction' });
    
    for (let i = 1; i < count - 1; i++) {
      const seconds = Math.floor((duration / count) * i);
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      timestamps.push({
        time: `${minutes}:${secs.toString().padStart(2, '0')}`,
        text: `Section ${i}`
      });
    }
    
    const finalMinutes = Math.floor(duration / 60);
    const finalSecs = Math.floor(duration % 60);
    timestamps.push({
      time: `${finalMinutes}:${finalSecs.toString().padStart(2, '0')}`,
      text: 'Conclusion'
    });
    
    return timestamps;
  }

  private generateTags(keyPoints: string[]): string[] {
    // Extract potential tags from key points
    const tags: string[] = [];
    keyPoints.forEach(point => {
      const words = point.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.length > 3 && !tags.includes(word)) {
          tags.push(word);
        }
      });
    });
    return tags.slice(0, 10);
  }

  private generateReelCaption(keyPoints: string[]): string {
    const hook = keyPoints[0] || 'Check this out! 🔥';
    const body = keyPoints.slice(1, 3).join(' ✨ ');
    const cta = '\n\n💡 Save this for later!\n👉 Follow for more content!';
    
    return `${hook}\n\n${body}${cta}`;
  }

  private generateShortFormCaption(keyPoints: string[]): string {
    const hook = keyPoints[0] || 'You need to see this! 🔥';
    const cta = '\n\n✨ Follow for more!';
    
    return `${hook}${cta}`.substring(0, 150); // TikTok caption limit
  }

  private generateProfessionalPost(keyPoints: string[]): string {
    const intro = `${keyPoints[0] || 'Professional insights'}\n\n`;
    const body = keyPoints.slice(1).map((point, i) => `${i + 1}. ${point}`).join('\n\n');
    const cta = '\n\nWhat are your thoughts on this? Share in the comments below.';
    
    return intro + body + cta;
  }

  private generateThread(keyPoints: string[]): string {
    const tweets: string[] = [];
    
    // First tweet (hook)
    tweets.push(`🧵 Thread: ${keyPoints[0] || 'Key insights'}\n\n(1/${Math.min(keyPoints.length + 1, 10)})`);
    
    // Body tweets (one key point per tweet)
    keyPoints.slice(1, 9).forEach((point, i) => {
      const tweetNum = i + 2;
      const totalTweets = Math.min(keyPoints.length + 1, 10);
      const tweet = `${point}\n\n(${tweetNum}/${totalTweets})`;
      
      // Ensure tweet is under 280 characters
      if (tweet.length <= 280) {
        tweets.push(tweet);
      } else {
        tweets.push(`${point.substring(0, 260)}...\n\n(${tweetNum}/${totalTweets})`);
      }
    });
    
    return tweets.join('\n\n');
  }

  private generateBlogTitle(keyPoint: string): string {
    return keyPoint.charAt(0).toUpperCase() + keyPoint.slice(1);
  }

  private generateBlogPost(transcript: string, keyPoints: string[]): string {
    const title = `# ${this.generateBlogTitle(keyPoints[0] || 'Insights')}\n\n`;
    const intro = `## Introduction\n\n${keyPoints[0] || 'Welcome to this post.'}\n\n`;
    const body = `## Key Points\n\n${keyPoints.slice(1).map((point, i) => `### ${i + 1}. ${point}\n\n`).join('')}`;
    const conclusion = `## Conclusion\n\n${transcript.substring(0, 200)}...\n\n`;
    
    return title + intro + body + conclusion;
  }

  private generatePodcastScript(transcript: string, keyPoints: string[]): string {
    const intro = `🎙️ INTRO\n\nWelcome to today's episode! ${keyPoints[0] || 'Let\'s dive in.'}\n\n`;
    const mainContent = `📝 MAIN CONTENT\n\n${keyPoints.map((point, i) => `Segment ${i + 1}: ${point}`).join('\n\n')}\n\n`;
    const outro = `🎙️ OUTRO\n\nThanks for listening! Don't forget to subscribe and leave a review.`;
    
    return intro + mainContent + outro;
  }

  private generateHashtags(keyPoints: string[], count: number, required: string[] = []): string[] {
    const hashtags = [...required];
    
    // Extract hashtags from key points
    keyPoints.forEach(point => {
      const words = point.toLowerCase().split(/\s+/);
      words.forEach(word => {
        const cleaned = word.replace(/[^a-z0-9]/g, '');
        if (cleaned.length > 2 && hashtags.length < count) {
          const hashtag = `#${cleaned}`;
          if (!hashtags.includes(hashtag)) {
            hashtags.push(hashtag);
          }
        }
      });
    });
    
    // Add generic hashtags if needed to reach the count
    const genericHashtags = [
      '#content', '#viral', '#trending', '#fyp', '#explore', '#video',
      '#instagood', '#photooftheday', '#love', '#instagram', '#follow',
      '#like', '#fashion', '#style', '#photography', '#art', '#beautiful',
      '#picoftheday', '#happy', '#cute', '#tbt', '#followme', '#nature'
    ];
    
    genericHashtags.forEach(tag => {
      if (hashtags.length < count && !hashtags.includes(tag)) {
        hashtags.push(tag);
      }
    });
    
    return hashtags.slice(0, count);
  }

  // ============================================================================
  // HELPER METHODS - Analytics
  // ============================================================================

  private analyzeSentiment(text: string): string {
    // Simple sentiment analysis based on keywords
    const positiveWords = ['great', 'amazing', 'excellent', 'wonderful', 'fantastic', 'love', 'best'];
    const negativeWords = ['bad', 'terrible', 'awful', 'worst', 'hate', 'poor'];
    
    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private calculateReadability(text: string): number {
    // Simple readability score (0-100)
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).length;
    const avgWordsPerSentence = words / sentences;
    
    // Lower average words per sentence = higher readability
    // Ideal is 15-20 words per sentence
    if (avgWordsPerSentence <= 15) return 90;
    if (avgWordsPerSentence <= 20) return 75;
    if (avgWordsPerSentence <= 25) return 60;
    return 45;
  }

  // ============================================================================
  // FALLBACK CONTENT
  // ============================================================================

  private createFallbackContent(platform: Platform): PlatformContent {
    return {
      platform,
      content: `Content generation failed for ${platform}. Please regenerate.`,
      metadata: {
        fallback: true,
        error: true
      }
    };
  }
}

// Export singleton instance
export const platformContentGeneratorV2 = new PlatformContentGeneratorV2();
