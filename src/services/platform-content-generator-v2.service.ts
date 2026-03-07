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

export interface GeneratePlatformContentRequest {
  transcript: string;
  keyPoints: string[];
  metadata: VideoMetadata;
  platforms: Platform[];
}

export class PlatformContentGeneratorV2 {
  /**
   * Generate content for all requested platforms in parallel
   * Uses Promise.allSettled to handle failures gracefully
   * Integrates Content Multiplier V2 service for enhanced content generation
   */
  async generatePlatformContent(
    request: GeneratePlatformContentRequest
  ): Promise<Record<string, PlatformContent>> {
    const { transcript, keyPoints, metadata, platforms } = request;
    
    // Try to use Content Multiplier V2 service first for enhanced content
    try {
      const multiplierResult = await this.generateWithContentMultiplier(
        transcript,
        keyPoints,
        metadata,
        platforms
      );
      
      // If Content Multiplier V2 succeeded, use its results
      if (multiplierResult && Object.keys(multiplierResult).length > 0) {
        console.log('Successfully generated content using Content Multiplier V2');
        return multiplierResult;
      }
    } catch (error) {
      console.warn('Content Multiplier V2 failed, falling back to basic generation:', error);
    }
    
    // Fallback to basic generation if Content Multiplier V2 fails
    return this.generateWithBasicMethod(transcript, keyPoints, metadata, platforms);
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
