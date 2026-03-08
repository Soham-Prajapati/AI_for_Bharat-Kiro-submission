/**
 * Bedrock Content Service
 *
 * Domain-aware parallel AI agents using Amazon Bedrock.
 * - Claude 3.5 Sonnet  → YouTube, LinkedIn, Blog, Podcast (quality-critical, long-form)
 * - Claude 3 Haiku     → Instagram, TikTok, Twitter (speed-critical, short-form)
 *
 * Each platform runs as an independent agent in parallel via Promise.allSettled,
 * so failures are isolated and partial results are still returned.
 */

import { InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { getBedrockClient } from '../config/aws';
import { BEDROCK_MODELS, PLATFORM_MODEL } from '../config/bedrock-models';
import { Platform, PlatformContent, VideoMetadata } from '../types/upload-to-results';

// Domain-specific system personas — injected into every platform prompt
const DOMAIN_SYSTEM: Record<string, string> = {
  technology:    'You are a tech content expert for Indian developers and tech enthusiasts. You know what makes tech content viral in India — practical demos, "I didn\'t know this" moments, career growth tips.',
  food:          'You are a food content strategist for Indian creators. You understand regional Indian cuisine diversity, recipe virality, and what food content makes Indian audiences stop scrolling.',
  travel:        'You are a travel content expert for Indian creators. You understand India\'s diverse destinations, budget travel culture, and how to make wanderlust content hit for Indian audiences.',
  fitness:       'You are a fitness & wellness strategist for Indian creators. You know Indian workout culture, yoga trends, nutrition habits, and motivational hooks that resonate with Indian health seekers.',
  finance:       'You are a personal finance content expert for Indian audiences. You simplify SIPs, mutual funds, tax saving, and wealth building into content that drives massive engagement.',
  entertainment: 'You are an entertainment content strategist for Indian creators. You understand Bollywood, OTT culture, memes, and what makes entertainment content viral for Indian Gen-Z and millennials.',
  education:     'You are an education content strategist for Indian creators. You know how to make learning engaging, turn complex topics into viral content, and serve India\'s massive student audience.',
  gaming:        'You are a gaming content expert for Indian gaming creators. You understand BGMI, Free Fire, esports culture, and what makes gaming content blow up for Indian gaming communities.',
  general:       'You are an expert Indian content strategist who helps creators go viral across all platforms. You deeply understand the Indian digital creator ecosystem, audience psychology, and platform algorithms.',
};

export interface BedrockContentRequest {
  transcript: string;
  keyPoints: string[];
  metadata: VideoMetadata;
  platforms: Platform[];
  domain?: string;
}

export class BedrockContentService {
  private isAvailable: boolean | null = null;

  /** Quick availability check — attempts a tiny Bedrock call */
  async checkAvailability(): Promise<boolean> {
    if (this.isAvailable !== null) return this.isAvailable;
    try {
      await this.invokeClaude('Reply with the word OK.', BEDROCK_MODELS.HAIKU_3, 10);
      this.isAvailable = true;
    } catch {
      this.isAvailable = false;
    }
    return this.isAvailable;
  }

  /** Core Bedrock invocation — Claude models via Messages API */
  private async invokeClaude(
    userPrompt: string,
    modelId: string,
    maxTokens: number = 1500,
    systemPrompt?: string,
  ): Promise<string> {
    const client = getBedrockClient();

    const body: Record<string, any> = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: userPrompt }],
    };
    if (systemPrompt) body.system = systemPrompt;

    const command = new InvokeModelCommand({
      modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(body),
    });

    const response = await client.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.body));
    return result.content[0].text as string;
  }

  /** Extract the first complete JSON object from any string */
  private extractJSON(raw: string): Record<string, any> {
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start === -1 || end <= start) throw new Error('No JSON object in response');
    return JSON.parse(raw.substring(start, end + 1));
  }

  /** Generate content for all requested platforms in parallel */
  async generateContent(req: BedrockContentRequest): Promise<Record<string, PlatformContent>> {
    const domain = (req.domain || 'general').toLowerCase();
    const system = DOMAIN_SYSTEM[domain] || DOMAIN_SYSTEM.general;
    const kp = req.keyPoints.slice(0, 5).join(' | ');
    const excerpt = req.transcript.substring(0, 700);
    const topic = req.metadata.fileName?.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ') || 'content';

    const context = `Content topic: "${topic}"\nDomain: ${domain}\nKey insights: ${kp}\nTranscript: ${excerpt}`;

    const targetPlatforms = req.platforms.filter(p => p !== 'analytics' && PLATFORM_MODEL[p]);

    // Spawn one agent per platform — all run in parallel
    const settled = await Promise.allSettled(
      targetPlatforms.map(p => this.generateForPlatform(p, context, system))
    );

    const result: Record<string, PlatformContent> = {};

    for (let i = 0; i < settled.length; i++) {
      const outcome = settled[i];
      const platform = targetPlatforms[i];
      if (outcome.status === 'fulfilled') {
        result[platform] = outcome.value;
      } else {
        console.warn(`Bedrock agent [${platform}] failed:`, outcome.reason?.message || outcome.reason);
      }
    }

    // Analytics is always local
    if (req.platforms.includes('analytics')) {
      const wordCount = req.transcript.split(/\s+/).length;
      result.analytics = {
        platform: 'analytics',
        content: JSON.stringify({ wordCount, keyTopics: req.keyPoints.slice(0, 5) }, null, 2),
        metadata: { wordCount, keyTopics: req.keyPoints.slice(0, 5) },
      };
    }

    const generated = Object.keys(result).filter(k => k !== 'analytics');
    console.log(`Bedrock agents completed: ${generated.join(', ')} (${generated.length}/${targetPlatforms.length})`);
    return result;
  }

  private async generateForPlatform(
    platform: Platform,
    context: string,
    systemPersona: string,
  ): Promise<PlatformContent> {
    const modelId = PLATFORM_MODEL[platform] || BEDROCK_MODELS.HAIKU_3;

    const { prompt, maxTokens } = this.buildPrompt(platform, context);
    const raw = await this.invokeClaude(prompt, modelId, maxTokens, systemPersona);
    const data = this.extractJSON(raw);
    return this.mapToContent(platform, data);
  }

  private buildPrompt(platform: Platform, context: string): { prompt: string; maxTokens: number } {
    const prompts: Record<string, { prompt: string; maxTokens: number }> = {
      youtube: {
        maxTokens: 1400,
        prompt: `${context}

You are generating YouTube content. Return ONLY valid JSON:
{"hook":"Powerful 2-3 sentence opening script for first 30 seconds — start with a surprising question or bold claim that creates must-watch urgency","title":"SEO-optimised title under 70 chars with power word","titleAlternatives":["compelling alt title 2","compelling alt title 3"],"description":"Full 180-word YouTube description: open with value proposition, 3 key points, timestamps placeholder, relevant keywords, subscribe CTA","chapters":[{"time":"0:00","title":"Hook & Intro"},{"time":"1:30","title":"Core Insight"},{"time":"3:00","title":"How To Apply It"},{"time":"4:30","title":"Common Mistakes"},{"time":"5:30","title":"Key Takeaway"}],"tags":["tag1","tag2","tag3","tag4","tag5","tag6","tag7","tag8","tag9","tag10"],"thumbnailConcept":"Specific thumbnail: describe the main visual element, text overlay (max 5 words), and the emotion/expression that will maximise CTR"}`,
      },

      instagram: {
        maxTokens: 800,
        prompt: `${context}

You are generating Instagram content. Return ONLY valid JSON:
{"hook":"First 3 seconds on-screen text — max 8 words, shocking or curiosity-gap to stop scrolling","caption":"Full caption: bold opening line, 2-3 value sentences with relevant emojis, line breaks for readability, CTA to save/follow. Under 150 words.","hashtags":["#india","#reels","#viral","#trending","#explore","#reelsinstagram","#instareels","#indiancreator","#contentcreator","#fyp","#bharat","#instagood","#motivation","#creator","#reelsindia","#instadaily","#growth","#trending","#reelsvideo","#instagram"],"reelConcept":"3-act reel structure: Hook scene (0-3s what to show), Main beats (3-25s key moments), Payoff & CTA (25-30s)","coverConcept":"Post cover concept: dominant colour, text overlay (3-5 words), visual element that communicates the topic instantly"}`,
      },

      tiktok: {
        maxTokens: 700,
        prompt: `${context}

You are generating TikTok content. Return ONLY valid JSON:
{"hook":"First 3 seconds on-screen text — max 8 words, controversial or surprising to stop the scroll cold","caption":"TikTok caption under 120 chars, punchy with 2-3 emojis","hashtags":["#fyp","#foryou","#foryoupage","#viral","#trending","#india","#tiktokindia","#learnontiktok","#tiktoktrend","#explore","#discover","#tiktok"],"videoStructure":"Hook (0-3s): exact visual/text to show. Content (3-45s): 3-4 punchy beats to cover. Payoff (45-60s): surprise reveal or strong CTA","soundSuggestion":"Specific audio style that would amplify this (e.g. trending beat, emotional piano, voiceover only, lo-fi)"}`,
      },

      linkedin: {
        maxTokens: 1200,
        prompt: `${context}

You are generating LinkedIn content. Return ONLY valid JSON:
{"headline":"One powerful sentence to stop scrolling — bold claim, contrarian take, or specific number. Not a title. First line of the post.","post":"Full LinkedIn post body (after headline): blank line after headline, then 3-4 insight paragraphs with blank lines between each. Conversational but professional. End with a direct question to drive comments. 160-200 words total including headline.","hashtags":["#india","#growth","#career","#leadership","#learning"],"keyInsight":"The single most shareable insight from this content in 1-2 punchy sentences — the thing people screenshot"}`,
      },

      twitter: {
        maxTokens: 900,
        prompt: `${context}

You are generating a Twitter/X thread. Return ONLY valid JSON:
{"hook":"Opening tweet under 280 chars — bold claim or surprising question that makes people click 'read more'","thread":["Tweet 2: expand the hook with the context (under 280 chars)","Tweet 3: the surprising insight or counter-intuitive point (under 280 chars)","Tweet 4: specific actionable tip anyone can use today (under 280 chars)","Tweet 5: real-world example or mini-story to make it concrete (under 280 chars)","Tweet 6: broader implication — why this matters (under 280 chars)"],"cta":"Final tweet: engaging question + follow for more CTA (under 280 chars)"}`,
      },

      blog: {
        maxTokens: 1300,
        prompt: `${context}

You are generating a blog post. Return ONLY valid JSON:
{"title":"SEO blog title 60-70 chars with primary keyword — specific and promise-driven","metaDescription":"Meta description under 155 chars: clear value + keyword + subtle CTA","outline":["Introduction: hook with a relatable problem","Section 1: core concept explained simply","Section 2: step-by-step practical application","Section 3: common mistakes and how to avoid them","Conclusion: key takeaway + next steps"],"intro":"Opening 2 paragraphs: start with a relatable problem or surprising fact, then establish why this matters and what the reader will get from the post","cta":"End-of-post call to action that feels natural and valuable, not salesy"}`,
      },

      podcast: {
        maxTokens: 1300,
        prompt: `${context}

You are generating a podcast episode. Return ONLY valid JSON:
{"episodeTitle":"Episode title that makes listeners click play — specific, curiosity-driven, promises a clear outcome","intro":"30-second warm spoken intro script: greet audience, tease the episode's key insight, explain why it matters today. Conversational, not corporate.","segments":[{"title":"Opening story","description":"Relatable hook story or question that sets up the episode's core problem","duration":"3-4 min"},{"title":"Core teaching","description":"Main insight broken into 2-3 digestible points with real examples","duration":"8-10 min"},{"title":"Practical framework","description":"Actionable steps listeners can apply immediately","duration":"6-8 min"},{"title":"Q&A or case study","description":"Real example, listener question, or detailed case study","duration":"4-5 min"}],"outro":"30-second outro: summarise the key takeaway, ask listeners to subscribe/share/review, tease next episode"}`,
      },
    };

    return prompts[platform] || { prompt: `Generate content for ${platform} about: ${context}. Return JSON with title and content fields.`, maxTokens: 600 };
  }

  private mapToContent(platform: Platform, data: Record<string, any>): PlatformContent {
    switch (platform) {
      case 'youtube':
        return {
          platform: 'youtube',
          title: data.title,
          content: data.description || data.hook,
          hashtags: data.tags,
          metadata: {
            hook: data.hook,
            titleAlternatives: data.titleAlternatives,
            description: data.description,
            chapters: data.chapters,
            thumbnailConcept: data.thumbnailConcept,
          },
        };

      case 'instagram':
        return {
          platform: 'instagram',
          content: data.caption,
          hashtags: data.hashtags,
          metadata: {
            hook: data.hook,
            caption: data.caption,
            reelConcept: data.reelConcept,
            coverConcept: data.coverConcept,
          },
        };

      case 'tiktok':
        return {
          platform: 'tiktok',
          content: data.caption,
          hashtags: data.hashtags,
          metadata: {
            hook: data.hook,
            videoStructure: data.videoStructure,
            soundSuggestion: data.soundSuggestion,
          },
        };

      case 'linkedin':
        return {
          platform: 'linkedin',
          title: data.headline,
          content: data.post,
          hashtags: data.hashtags,
          metadata: {
            headline: data.headline,
            keyInsight: data.keyInsight,
          },
        };

      case 'twitter': {
        const tweets = [data.hook, ...(data.thread || []), data.cta].filter(Boolean);
        return {
          platform: 'twitter',
          content: tweets.join('\n\n'),
          metadata: {
            hook: data.hook,
            thread: data.thread,
            cta: data.cta,
            tweets,
          },
        };
      }

      case 'blog':
        return {
          platform: 'blog',
          title: data.title,
          content: data.intro,
          metadata: {
            metaDescription: data.metaDescription,
            outline: data.outline,
            intro: data.intro,
            cta: data.cta,
          },
        };

      case 'podcast':
        return {
          platform: 'podcast',
          title: data.episodeTitle,
          content: data.intro,
          script: data.intro,
          metadata: {
            episodeTitle: data.episodeTitle,
            intro: data.intro,
            segments: data.segments,
            outro: data.outro,
          },
        };

      default:
        return { platform, content: JSON.stringify(data) };
    }
  }
}

export const bedrockContentService = new BedrockContentService();
