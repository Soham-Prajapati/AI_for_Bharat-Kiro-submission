import { GitHubModelsService } from './github-models.service';

interface GenerateRequest {
  transcript: string;
  platform: string;
  domain: string;
  keywords: string[];
  language?: string;
}

export class ContentGenerationService {
  private githubModels: GitHubModelsService;

  constructor() {
    this.githubModels = new GitHubModelsService();
  }

  async generateForPlatform(request: GenerateRequest): Promise<string> {
    const { transcript, platform, domain, keywords, language = 'English' } = request;

    const prompts: Record<string, string> = {
      'youtube-short': `Create a YouTube Short script (60 seconds) from this content.

Content: ${transcript.substring(0, 500)}
Domain: ${domain}
Keywords: ${keywords.join(', ')}

Format:
Title: [catchy title]
Description: [engaging description with keywords]
Script: [60-second script with timestamps]
Tags: [10 relevant tags]`,

      'instagram-reel': `Create an Instagram Reel caption from this content.

Content: ${transcript.substring(0, 500)}
Domain: ${domain}
Keywords: ${keywords.join(', ')}

Format:
Caption: [engaging caption with emojis]
Hashtags: [20-30 relevant hashtags]
Call-to-action: [clear CTA]`,

      'tiktok': `Create a TikTok caption from this content.

Content: ${transcript.substring(0, 500)}
Domain: ${domain}
Keywords: ${keywords.join(', ')}

Format:
Caption: [short, catchy caption with emojis]
Hashtags: [10-15 trending hashtags]
Hook: [first 3 seconds hook]`,

      'twitter-thread': `Create a Twitter thread (10 tweets) from this content.

Content: ${transcript.substring(0, 800)}
Domain: ${domain}
Keywords: ${keywords.join(', ')}

Format each tweet (280 chars max):
1/10: [hook tweet]
2/10: [content]
...
10/10: [conclusion with CTA]`,

      'linkedin-post': `Create a LinkedIn post from this content.

Content: ${transcript.substring(0, 800)}
Domain: ${domain}
Keywords: ${keywords.join(', ')}

Format:
Post: [professional, engaging post with line breaks]
Hashtags: [5-10 professional hashtags]`,

      'blog-post': `Create a blog post from this content.

Content: ${transcript}
Domain: ${domain}
Keywords: ${keywords.join(', ')}

Format:
Title: [SEO-optimized title]
Meta Description: [150 chars]
Introduction: [engaging intro]
Body: [structured content with H2/H3 headings]
Conclusion: [summary with CTA]
SEO Keywords: [primary and secondary keywords]`
    };

    const prompt = prompts[platform] || prompts['blog-post'];

    try {
      const response = await this.githubModels.generate(prompt, {
        model: 'gpt-4o',
        temperature: 0.7,
        maxTokens: 2000
      });

      return response;
    } catch (error) {
      console.error(`Content generation failed for ${platform}:`, error);
      throw error;
    }
  }

  async *streamGenerate(request: GenerateRequest): AsyncGenerator<string> {
    const { transcript, platform, domain, keywords } = request;

    const prompts: Record<string, string> = {
      'youtube-short': `Create a YouTube Short script from: ${transcript.substring(0, 500)}`,
      'instagram-reel': `Create an Instagram Reel caption from: ${transcript.substring(0, 500)}`,
      'tiktok': `Create a TikTok caption from: ${transcript.substring(0, 500)}`,
      'twitter-thread': `Create a Twitter thread from: ${transcript.substring(0, 800)}`,
      'linkedin-post': `Create a LinkedIn post from: ${transcript.substring(0, 800)}`,
      'blog-post': `Create a blog post from: ${transcript}`
    };

    const prompt = prompts[platform] || prompts['blog-post'];

    try {
      for await (const chunk of this.githubModels.streamGenerate(prompt, {
        model: 'gpt-4o',
        temperature: 0.7,
        maxTokens: 2000
      })) {
        yield chunk;
      }
    } catch (error) {
      console.error(`Streaming generation failed for ${platform}:`, error);
      throw error;
    }
  }

  async generateMultiple(request: GenerateRequest, platforms: string[]): Promise<Record<string, string>> {
    const results: Record<string, string> = {};

    await Promise.all(
      platforms.map(async (platform) => {
        try {
          results[platform] = await this.generateForPlatform({ ...request, platform });
        } catch (error) {
          console.error(`Failed to generate for ${platform}:`, error);
          results[platform] = `Error generating content for ${platform}`;
        }
      })
    );

    return results;
  }
}
