import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { AWSError, ValidationError, TimeoutError } from '../types/errors';
import { BEDROCK_MODELS } from '../config/bedrock-models';

const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-east-1' });

export class BedrockService {
  async generateContent(prompt: string, maxTokens: number = 2000): Promise<string> {
    try {
      if (!prompt || prompt.trim().length === 0) {
        throw new ValidationError('Prompt cannot be empty');
      }

      if (maxTokens < 1 || maxTokens > 4096) {
        throw new ValidationError('maxTokens must be between 1 and 4096');
      }

      const payload = {
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }]
      };

      const command = new InvokeModelCommand({
        modelId: BEDROCK_MODELS.SONNET_3_5,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(payload)
      });

      const response = await client.send(command);
      
      if (!response.body) {
        throw new AWSError('Empty response from Bedrock', 'Bedrock');
      }

      const result = JSON.parse(new TextDecoder().decode(response.body));
      
      if (!result.content || !result.content[0] || !result.content[0].text) {
        throw new AWSError('Invalid response format from Bedrock', 'Bedrock');
      }

      return result.content[0].text;
    } catch (error: any) {
      if (error instanceof ValidationError || error instanceof AWSError) {
        throw error;
      }

      if (error.name === 'ThrottlingException') {
        throw new AWSError('Rate limit exceeded, please retry', 'Bedrock', error.code);
      }

      if (error.name === 'TimeoutError' || error.code === 'TimeoutError') {
        throw new TimeoutError('Bedrock request');
      }

      throw new AWSError(error.message || 'Content generation failed', 'Bedrock', error.code);
    }
  }

  async generatePlatformContent(transcript: string, platform: string, language: string = 'en'): Promise<any> {
    try {
      if (!transcript || transcript.trim().length === 0) {
        throw new ValidationError('Transcript cannot be empty');
      }

      const validPlatforms = ['youtube', 'instagram', 'linkedin', 'twitter', 'tiktok', 'facebook'];
      if (!validPlatforms.includes(platform.toLowerCase())) {
        throw new ValidationError(`Invalid platform. Must be one of: ${validPlatforms.join(', ')}`);
      }

      const prompt = `Generate ${platform} content from this transcript in ${language}:\n\n${transcript}\n\nProvide title, description, and hashtags.`;
      const content = await this.generateContent(prompt);
      
      return {
        platform,
        content,
        generatedAt: new Date().toISOString()
      };
    } catch (error: any) {
      if (error instanceof ValidationError || error instanceof AWSError) {
        throw error;
      }
      throw new AWSError(error.message || 'Platform content generation failed', 'Bedrock', error.code);
    }
  }
}

export const bedrockService = new BedrockService();
