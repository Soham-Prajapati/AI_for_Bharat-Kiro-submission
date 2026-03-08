import { GitHubModelsService } from './github-models.service';
import { safeParseJSON } from '../utils/json';

interface DomainResult {
  domain: string;
  confidence: number;
  keywords: string[];
}

export class DomainDetectionService {
  private githubModels: GitHubModelsService;

  constructor() {
    this.githubModels = new GitHubModelsService();
  }

  async detectDomain(transcript: string, metadata?: any): Promise<DomainResult> {
    const prompt = `Analyze this content and detect its domain category.

Content: ${transcript.substring(0, 1000)}

Respond in JSON format:
{
  "domain": "Food & Cooking" | "Education & Learning" | "Travel & Adventure" | "Product Reviews" | "Entertainment" | "Technology" | "Health & Fitness" | "Business & Finance",
  "confidence": 0.0-1.0,
  "keywords": ["keyword1", "keyword2", ...]
}`;

    try {
      const response = await this.githubModels.generate(prompt, {
        model: 'gpt-4o',
        temperature: 0.3
      });

      return safeParseJSON<DomainResult>(response);
    } catch (error) {
      console.error('Domain detection failed:', error);
      return {
        domain: 'General',
        confidence: 0.5,
        keywords: []
      };
    }
  }

  async extractKeywords(transcript: string, count: number = 10): Promise<string[]> {
    const prompt = `Extract the top ${count} most important keywords from this content.

Content: ${transcript.substring(0, 1000)}

Return only a JSON array of keywords: ["keyword1", "keyword2", ...]`;

    try {
      const response = await this.githubModels.generate(prompt, {
        model: 'gpt-4o',
        temperature: 0.3
      });

      return safeParseJSON(response);
    } catch (error) {
      console.error('Keyword extraction failed:', error);
      return [];
    }
  }

  async analyzeSentiment(transcript: string): Promise<{ sentiment: string; score: number }> {
    const prompt = `Analyze the sentiment of this content.

Content: ${transcript.substring(0, 1000)}

Respond in JSON format:
{
  "sentiment": "positive" | "neutral" | "negative",
  "score": -1.0 to 1.0
}`;

    try {
      const response = await this.githubModels.generate(prompt, {
        model: 'gpt-4o',
        temperature: 0.3
      });

      return safeParseJSON(response);
    } catch (error) {
      console.error('Sentiment analysis failed:', error);
      return { sentiment: 'neutral', score: 0 };
    }
  }
}
