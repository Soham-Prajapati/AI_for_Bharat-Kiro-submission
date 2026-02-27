import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-east-1' });

export class BedrockService {
  async generateContent(prompt: string, maxTokens: number = 2000): Promise<string> {
    const payload = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }]
    };

    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload)
    });

    const response = await client.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.body));
    return result.content[0].text;
  }

  async generatePlatformContent(transcript: string, platform: string, language: string = 'en'): Promise<any> {
    const prompt = `Generate ${platform} content from this transcript in ${language}:\n\n${transcript}\n\nProvide title, description, and hashtags.`;
    const content = await this.generateContent(prompt);
    
    return {
      platform,
      content,
      generatedAt: new Date().toISOString()
    };
  }
}

export const bedrockService = new BedrockService();
