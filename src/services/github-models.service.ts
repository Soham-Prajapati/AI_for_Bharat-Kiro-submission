import axios from 'axios';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GenerateOptions {
  model?: 'gpt-4o' | 'claude-3.5-sonnet' | 'o1-mini';
  temperature?: number;
  maxTokens?: number;
}

export class GitHubModelsService {
  private baseUrl = 'https://models.inference.ai.azure.com';

  constructor() {
    // API key is read dynamically to support dotenv loading
  }

  private getApiKey(): string {
    const apiKey = process.env.GITHUB_TOKEN;
    if (!apiKey) {
      throw new Error('GITHUB_TOKEN not found in environment variables');
    }
    return apiKey;
  }

  async generate(prompt: string, options: GenerateOptions = {}): Promise<string> {
    const apiKey = this.getApiKey();
    const {
      model = 'gpt-4o',
      temperature = 0.7,
      maxTokens = 2000
    } = options;

    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          messages: [{ role: 'user', content: prompt }],
          model: model,
          temperature: temperature,
          max_tokens: maxTokens
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error: any) {
      console.error('GitHub Models API error:', error.response?.data || error.message);
      throw new Error(`GitHub Models API failed: ${error.message}`);
    }
  }

  async generateWithContext(messages: Message[], options: GenerateOptions = {}): Promise<string> {
    const apiKey = this.getApiKey();
    const {
      model = 'gpt-4o',
      temperature = 0.7,
      maxTokens = 2000
    } = options;

    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          messages: messages,
          model: model,
          temperature: temperature,
          max_tokens: maxTokens
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error: any) {
      console.error('GitHub Models API error:', error.response?.data || error.message);
      throw new Error(`GitHub Models API failed: ${error.message}`);
    }
  }

  async *streamGenerate(prompt: string, options: GenerateOptions = {}): AsyncGenerator<string> {
    const apiKey = this.getApiKey();
    const {
      model = 'gpt-4o',
      temperature = 0.7,
      maxTokens = 2000
    } = options;

    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          messages: [{ role: 'user', content: prompt }],
          model: model,
          temperature: temperature,
          max_tokens: maxTokens,
          stream: true
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          responseType: 'stream'
        }
      );

      for await (const chunk of response.data) {
        const lines = chunk.toString().split('\n').filter((line: string) => line.trim() !== '');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              if (content) yield content;
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error: any) {
      console.error('GitHub Models streaming error:', error.response?.data || error.message);
      throw new Error(`GitHub Models streaming failed: ${error.message}`);
    }
  }
}
