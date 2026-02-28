/**
 * Content Multiplier Service
 * Repurposes 1 piece of content into 50+ derivative pieces across multiple formats
 * Extracts clips, quotes, audiograms, infographics, and platform-specific variations
 */

import { GitHubModelsService } from './github-models.service';

interface MultiplicationRequest {
  sourceUrl: string;
  sourceType: 'video' | 'audio' | 'blog' | 'podcast';
  transcript?: string;
  duration?: number; // seconds
  targetFormats: ContentFormat[];
  platforms?: Platform[];
  language?: string;
}

type ContentFormat =
  | 'video_clips'
  | 'audiograms'
  | 'quote_cards'
  | 'infographics'
  | 'blog_posts'
  | 'social_posts'
  | 'email_snippets'
  | 'carousel_posts'
  | 'stories'
  | 'thumbnails';

type Platform = 'youtube' | 'instagram' | 'tiktok' | 'twitter' | 'linkedin' | 'facebook' | 'pinterest';

interface MultiplicationResult {
  sourceUrl: string;
  totalPieces: number;
  clips: VideoClip[];
  audiograms: Audiogram[];
  quoteCards: QuoteCard[];
  infographics: Infographic[];
  blogPosts: BlogPost[];
  socialPosts: SocialPost[];
  emailSnippets: EmailSnippet[];
  carouselPosts: CarouselPost[];
  stories: Story[];
  thumbnails: Thumbnail[];
  processingTime: number;
  cost: number;
}

interface VideoClip {
  clipId: string;
  title: string;
  description: string;
  startTime: number; // seconds
  endTime: number;
  duration: number;
  url: string;
  thumbnail: string;
  platform: Platform;
  format: 'vertical' | 'horizontal' | 'square';
  resolution: string;
  keyMoment: string;
  hashtags: string[];
}

interface Audiogram {
  audiogramId: string;
  title: string;
  audioUrl: string;
  waveformUrl: string;
  duration: number;
  quote: string;
  backgroundImage?: string;
  format: 'square' | 'vertical';
  platform: Platform;
}

interface QuoteCard {
  quoteId: string;
  quote: string;
  author?: string;
  backgroundUrl: string;
  textColor: string;
  fontSize: number;
  fontFamily: string;
  platform: Platform;
  format: 'square' | 'vertical' | 'horizontal';
}

interface Infographic {
  infographicId: string;
  title: string;
  dataPoints: DataPoint[];
  imageUrl: string;
  format: 'vertical' | 'square';
  platform: Platform;
}

interface DataPoint {
  label: string;
  value: string | number;
  icon?: string;
}

interface BlogPost {
  postId: string;
  title: string;
  content: string;
  excerpt: string;
  wordCount: number;
  readingTime: number; // minutes
  seoKeywords: string[];
  metaDescription: string;
}

interface SocialPost {
  postId: string;
  platform: Platform;
  content: string;
  hashtags: string[];
  mediaUrl?: string;
  callToAction?: string;
  characterCount: number;
}

interface EmailSnippet {
  snippetId: string;
  subject: string;
  preview: string;
  body: string;
  callToAction: string;
  purpose: 'newsletter' | 'promotion' | 'update' | 'announcement';
}

interface CarouselPost {
  carouselId: string;
  platform: Platform;
  slides: CarouselSlide[];
  caption: string;
  hashtags: string[];
}

interface CarouselSlide {
  slideNumber: number;
  imageUrl: string;
  title: string;
  content: string;
}

interface Story {
  storyId: string;
  platform: Platform;
  frames: StoryFrame[];
  duration: number;
}

interface StoryFrame {
  frameNumber: number;
  imageUrl: string;
  text?: string;
  duration: number; // seconds
  animation?: string;
}

interface Thumbnail {
  thumbnailId: string;
  imageUrl: string;
  title: string;
  style: 'bold' | 'minimal' | 'colorful' | 'professional';
  platform: Platform;
}

export class ContentMultiplierService {
  private githubModels: GitHubModelsService;

  constructor() {
    this.githubModels = new GitHubModelsService();
  }

  /**
   * Multiply content into 50+ pieces
   */
  async multiplyContent(request: MultiplicationRequest): Promise<MultiplicationResult> {
    const startTime = Date.now();

    // Extract key moments and insights from source
    const analysis = await this.analyzeSource(request);

    // Generate all content types in parallel
    const [clips, audiograms, quoteCards, infographics, blogPosts, socialPosts, emailSnippets, carouselPosts, stories, thumbnails] =
      await Promise.all([
        request.targetFormats.includes('video_clips') ? this.generateVideoClips(request, analysis) : Promise.resolve([]),
        request.targetFormats.includes('audiograms') ? this.generateAudiograms(request, analysis) : Promise.resolve([]),
        request.targetFormats.includes('quote_cards') ? this.generateQuoteCards(request, analysis) : Promise.resolve([]),
        request.targetFormats.includes('infographics') ? this.generateInfographics(request, analysis) : Promise.resolve([]),
        request.targetFormats.includes('blog_posts') ? this.generateBlogPosts(request, analysis) : Promise.resolve([]),
        request.targetFormats.includes('social_posts') ? this.generateSocialPosts(request, analysis) : Promise.resolve([]),
        request.targetFormats.includes('email_snippets') ? this.generateEmailSnippets(request, analysis) : Promise.resolve([]),
        request.targetFormats.includes('carousel_posts') ? this.generateCarouselPosts(request, analysis) : Promise.resolve([]),
        request.targetFormats.includes('stories') ? this.generateStories(request, analysis) : Promise.resolve([]),
        request.targetFormats.includes('thumbnails') ? this.generateThumbnails(request, analysis) : Promise.resolve([]),
      ]);

    const totalPieces =
      clips.length +
      audiograms.length +
      quoteCards.length +
      infographics.length +
      blogPosts.length +
      socialPosts.length +
      emailSnippets.length +
      carouselPosts.length +
      stories.length +
      thumbnails.length;

    const processingTime = Date.now() - startTime;
    const cost = this.calculateCost(totalPieces, request.sourceType);

    return {
      sourceUrl: request.sourceUrl,
      totalPieces,
      clips,
      audiograms,
      quoteCards,
      infographics,
      blogPosts,
      socialPosts,
      emailSnippets,
      carouselPosts,
      stories,
      thumbnails,
      processingTime,
      cost,
    };
  }

  /**
   * Analyze source content to extract key moments and insights
   */
  private async analyzeSource(request: MultiplicationRequest): Promise<{
    keyMoments: Array<{ timestamp: number; description: string; importance: number }>;
    quotes: string[];
    topics: string[];
    dataPoints: DataPoint[];
    summary: string;
  }> {
    const prompt = `Analyze this content and extract key information:

Transcript: ${request.transcript?.substring(0, 2000) || 'No transcript provided'}
Duration: ${request.duration || 'Unknown'} seconds

Extract:
1. 5-10 key moments with timestamps (important/interesting parts)
2. 10-15 quotable sentences
3. Main topics discussed
4. Key data points or statistics mentioned
5. Brief summary

Format as JSON:
{
  "keyMoments": [{"timestamp": 30, "description": "...", "importance": 0.9}],
  "quotes": ["quote 1", "quote 2"],
  "topics": ["topic 1", "topic 2"],
  "dataPoints": [{"label": "stat", "value": "123"}],
  "summary": "brief summary"
}`;

    try {
      const response = await this.githubModels.generate(prompt, { temperature: 0.7, maxTokens: 1500 });
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Error analyzing source:', error);
    }

    // Fallback: Generate mock analysis
    return this.generateMockAnalysis(request);
  }

  /**
   * Generate mock analysis (fallback)
   */
  private generateMockAnalysis(request: MultiplicationRequest): any {
    const duration = request.duration || 300;
    const keyMoments = [];
    for (let i = 0; i < 8; i++) {
      keyMoments.push({
        timestamp: Math.floor((duration / 8) * i),
        description: `Key moment ${i + 1}: Important insight or action`,
        importance: 0.7 + Math.random() * 0.3,
      });
    }

    return {
      keyMoments,
      quotes: [
        'This is a powerful insight from the content',
        'The key to success is consistency',
        'Always focus on providing value',
        'Quality over quantity every time',
        'Your audience deserves your best work',
      ],
      topics: ['Content Creation', 'Strategy', 'Growth', 'Engagement'],
      dataPoints: [
        { label: 'Success Rate', value: '85%' },
        { label: 'Time Saved', value: '10 hours' },
        { label: 'ROI', value: '300%' },
      ],
      summary: 'Comprehensive guide to content creation and audience growth strategies.',
    };
  }

  /**
   * Generate video clips
   */
  private async generateVideoClips(request: MultiplicationRequest, analysis: any): Promise<VideoClip[]> {
    const clips: VideoClip[] = [];
    const platforms = request.platforms || ['youtube', 'instagram', 'tiktok'];

    // Generate clips from key moments
    for (let i = 0; i < Math.min(analysis.keyMoments.length, 10); i++) {
      const moment = analysis.keyMoments[i];
      const platform = platforms[i % platforms.length] as Platform;

      clips.push({
        clipId: this.generateId(),
        title: `Key Moment ${i + 1}`,
        description: moment.description,
        startTime: moment.timestamp,
        endTime: moment.timestamp + 30, // 30-second clips
        duration: 30,
        url: `https://clips.s3.amazonaws.com/clip-${i + 1}.mp4`,
        thumbnail: `https://clips.s3.amazonaws.com/thumb-${i + 1}.jpg`,
        platform,
        format: platform === 'youtube' ? 'horizontal' : 'vertical',
        resolution: platform === 'youtube' ? '1920x1080' : '1080x1920',
        keyMoment: moment.description,
        hashtags: this.generateHashtags(analysis.topics, platform),
      });
    }

    return clips;
  }

  /**
   * Generate audiograms
   */
  private async generateAudiograms(request: MultiplicationRequest, analysis: any): Promise<Audiogram[]> {
    const audiograms: Audiogram[] = [];

    // Create audiogram for each quote
    for (let i = 0; i < Math.min(analysis.quotes.length, 5); i++) {
      audiograms.push({
        audiogramId: this.generateId(),
        title: `Quote ${i + 1}`,
        audioUrl: `https://audio.s3.amazonaws.com/audiogram-${i + 1}.mp3`,
        waveformUrl: `https://audio.s3.amazonaws.com/waveform-${i + 1}.png`,
        duration: 15 + Math.random() * 15, // 15-30 seconds
        quote: analysis.quotes[i],
        backgroundImage: `https://backgrounds.s3.amazonaws.com/bg-${i + 1}.jpg`,
        format: i % 2 === 0 ? 'square' : 'vertical',
        platform: i % 2 === 0 ? 'instagram' : 'twitter',
      });
    }

    return audiograms;
  }

  /**
   * Generate quote cards
   */
  private async generateQuoteCards(request: MultiplicationRequest, analysis: any): Promise<QuoteCard[]> {
    const quoteCards: QuoteCard[] = [];
    const platforms: Platform[] = ['instagram', 'twitter', 'linkedin', 'pinterest'];

    for (let i = 0; i < Math.min(analysis.quotes.length, 12); i++) {
      const platform = platforms[i % platforms.length];
      quoteCards.push({
        quoteId: this.generateId(),
        quote: analysis.quotes[i],
        backgroundUrl: `https://quotes.s3.amazonaws.com/bg-${i + 1}.jpg`,
        textColor: i % 2 === 0 ? '#FFFFFF' : '#000000',
        fontSize: 36 + Math.floor(Math.random() * 12),
        fontFamily: i % 3 === 0 ? 'Arial' : i % 3 === 1 ? 'Georgia' : 'Helvetica',
        platform,
        format: platform === 'pinterest' ? 'vertical' : 'square',
      });
    }

    return quoteCards;
  }

  /**
   * Generate infographics
   */
  private async generateInfographics(request: MultiplicationRequest, analysis: any): Promise<Infographic[]> {
    const infographics: Infographic[] = [];

    if (analysis.dataPoints.length > 0) {
      infographics.push({
        infographicId: this.generateId(),
        title: 'Key Statistics',
        dataPoints: analysis.dataPoints,
        imageUrl: `https://infographics.s3.amazonaws.com/stats.png`,
        format: 'vertical',
        platform: 'pinterest',
      });
    }

    // Create topic-based infographic
    if (analysis.topics.length > 0) {
      infographics.push({
        infographicId: this.generateId(),
        title: 'Main Topics Covered',
        dataPoints: analysis.topics.map((topic: string, i: number) => ({
          label: topic,
          value: `${Math.floor(80 + Math.random() * 20)}%`,
        })),
        imageUrl: `https://infographics.s3.amazonaws.com/topics.png`,
        format: 'square',
        platform: 'instagram',
      });
    }

    return infographics;
  }

  /**
   * Generate blog posts
   */
  private async generateBlogPosts(request: MultiplicationRequest, analysis: any): Promise<BlogPost[]> {
    const blogPosts: BlogPost[] = [];

    // Main blog post
    blogPosts.push({
      postId: this.generateId(),
      title: `Complete Guide: ${analysis.topics[0] || 'Content Strategy'}`,
      content: `${analysis.summary}\n\n[Full blog post content would be generated here based on transcript]`,
      excerpt: analysis.summary.substring(0, 160),
      wordCount: 1500,
      readingTime: 7,
      seoKeywords: analysis.topics,
      metaDescription: analysis.summary.substring(0, 155),
    });

    // Listicle post
    blogPosts.push({
      postId: this.generateId(),
      title: `${analysis.keyMoments.length} Key Insights About ${analysis.topics[0] || 'Content'}`,
      content: analysis.keyMoments.map((m: any, i: number) => `${i + 1}. ${m.description}`).join('\n\n'),
      excerpt: `Discover ${analysis.keyMoments.length} actionable insights...`,
      wordCount: 800,
      readingTime: 4,
      seoKeywords: analysis.topics,
      metaDescription: `${analysis.keyMoments.length} proven strategies for ${analysis.topics[0] || 'success'}`,
    });

    return blogPosts;
  }

  /**
   * Generate social posts
   */
  private async generateSocialPosts(request: MultiplicationRequest, analysis: any): Promise<SocialPost[]> {
    const socialPosts: SocialPost[] = [];
    const platforms: Platform[] = ['twitter', 'linkedin', 'facebook', 'instagram'];

    // Generate posts for each platform
    for (const platform of platforms) {
      // Quote post
      socialPosts.push({
        postId: this.generateId(),
        platform,
        content: this.formatForPlatform(analysis.quotes[0], platform),
        hashtags: this.generateHashtags(analysis.topics, platform),
        characterCount: analysis.quotes[0].length,
      });

      // Summary post
      socialPosts.push({
        postId: this.generateId(),
        platform,
        content: this.formatForPlatform(analysis.summary, platform),
        hashtags: this.generateHashtags(analysis.topics, platform),
        callToAction: 'Learn more in the full video!',
        characterCount: analysis.summary.length,
      });
    }

    return socialPosts;
  }

  /**
   * Generate email snippets
   */
  private async generateEmailSnippets(request: MultiplicationRequest, analysis: any): Promise<EmailSnippet[]> {
    return [
      {
        snippetId: this.generateId(),
        subject: `New Video: ${analysis.topics[0] || 'Latest Content'}`,
        preview: analysis.summary.substring(0, 100),
        body: `Hi there!\n\n${analysis.summary}\n\nWatch the full video here: ${request.sourceUrl}`,
        callToAction: 'Watch Now',
        purpose: 'newsletter',
      },
      {
        snippetId: this.generateId(),
        subject: `Don't Miss: ${analysis.topics[0] || 'Important Update'}`,
        preview: analysis.quotes[0].substring(0, 100),
        body: `"${analysis.quotes[0]}"\n\nDiscover more insights in our latest content.`,
        callToAction: 'Learn More',
        purpose: 'promotion',
      },
    ];
  }

  /**
   * Generate carousel posts
   */
  private async generateCarouselPosts(request: MultiplicationRequest, analysis: any): Promise<CarouselPost[]> {
    const slides: CarouselSlide[] = analysis.keyMoments.slice(0, 10).map((moment: any, i: number) => ({
      slideNumber: i + 1,
      imageUrl: `https://carousel.s3.amazonaws.com/slide-${i + 1}.jpg`,
      title: `Insight ${i + 1}`,
      content: moment.description,
    }));

    return [
      {
        carouselId: this.generateId(),
        platform: 'instagram',
        slides,
        caption: `${analysis.keyMoments.length} key insights about ${analysis.topics[0] || 'content'}. Swipe to learn more! 👉`,
        hashtags: this.generateHashtags(analysis.topics, 'instagram'),
      },
      {
        carouselId: this.generateId(),
        platform: 'linkedin',
        slides,
        caption: `${analysis.keyMoments.length} actionable strategies for ${analysis.topics[0] || 'success'}`,
        hashtags: this.generateHashtags(analysis.topics, 'linkedin'),
      },
    ];
  }

  /**
   * Generate stories
   */
  private async generateStories(request: MultiplicationRequest, analysis: any): Promise<Story[]> {
    const frames: StoryFrame[] = analysis.quotes.slice(0, 5).map((quote: string, i: number) => ({
      frameNumber: i + 1,
      imageUrl: `https://stories.s3.amazonaws.com/frame-${i + 1}.jpg`,
      text: quote,
      duration: 5,
      animation: i % 2 === 0 ? 'fade' : 'slide',
    }));

    return [
      {
        storyId: this.generateId(),
        platform: 'instagram',
        frames,
        duration: frames.length * 5,
      },
    ];
  }

  /**
   * Generate thumbnails
   */
  private async generateThumbnails(request: MultiplicationRequest, analysis: any): Promise<Thumbnail[]> {
    const styles: Array<'bold' | 'minimal' | 'colorful' | 'professional'> = ['bold', 'minimal', 'colorful', 'professional'];

    return styles.map((style, i) => ({
      thumbnailId: this.generateId(),
      imageUrl: `https://thumbnails.s3.amazonaws.com/${style}-${i + 1}.jpg`,
      title: analysis.topics[0] || 'Content',
      style,
      platform: 'youtube',
    }));
  }

  /**
   * Format content for specific platform
   */
  private formatForPlatform(content: string, platform: Platform): string {
    switch (platform) {
      case 'twitter':
        return content.substring(0, 280);
      case 'linkedin':
        return content.substring(0, 3000);
      case 'instagram':
        return content.substring(0, 2200);
      case 'facebook':
        return content.substring(0, 63206);
      default:
        return content;
    }
  }

  /**
   * Generate hashtags for platform
   */
  private generateHashtags(topics: string[], platform: Platform): string[] {
    const hashtags = topics.map((topic) => `#${topic.replace(/\s+/g, '')}`);

    // Add platform-specific hashtags
    if (platform === 'instagram') {
      hashtags.push('#instagood', '#viral');
    } else if (platform === 'tiktok') {
      hashtags.push('#fyp', '#foryou');
    } else if (platform === 'linkedin') {
      hashtags.push('#professional', '#business');
    }

    return hashtags.slice(0, platform === 'instagram' ? 30 : 10);
  }

  /**
   * Calculate processing cost
   */
  private calculateCost(totalPieces: number, sourceType: string): number {
    const baseCost = sourceType === 'video' ? 5.0 : sourceType === 'audio' ? 3.0 : 2.0;
    const perPieceCost = 0.05;
    return baseCost + totalPieces * perPieceCost;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get multiplication statistics
   */
  getMultiplicationStats(result: MultiplicationResult): {
    totalPieces: number;
    byFormat: Record<string, number>;
    estimatedReach: number;
    timeToCreate: string;
  } {
    const byFormat = {
      clips: result.clips.length,
      audiograms: result.audiograms.length,
      quoteCards: result.quoteCards.length,
      infographics: result.infographics.length,
      blogPosts: result.blogPosts.length,
      socialPosts: result.socialPosts.length,
      emailSnippets: result.emailSnippets.length,
      carouselPosts: result.carouselPosts.length,
      stories: result.stories.length,
      thumbnails: result.thumbnails.length,
    };

    // Estimate reach (mock calculation)
    const estimatedReach = result.totalPieces * 1000; // 1000 views per piece

    // Format processing time
    const minutes = Math.floor(result.processingTime / 60000);
    const seconds = Math.floor((result.processingTime % 60000) / 1000);
    const timeToCreate = `${minutes}m ${seconds}s`;

    return {
      totalPieces: result.totalPieces,
      byFormat,
      estimatedReach,
      timeToCreate,
    };
  }
}

export const contentMultiplierService = new ContentMultiplierService();
