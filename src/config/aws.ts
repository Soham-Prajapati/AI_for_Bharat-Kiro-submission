/**
 * AWS SDK configuration and service initialization
 */

import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';
import { TranscribeClient } from '@aws-sdk/client-transcribe';

export interface AWSConfig {
  region: string;
  credentials?: {
    accessKeyId: string;
    secretAccessKey: string;
  };
}

export class AWSServiceManager {
  private bedrockClient: BedrockRuntimeClient;
  private transcribeClient: TranscribeClient;
  private config: AWSConfig;

  constructor(config: AWSConfig) {
    this.config = config;
    this.bedrockClient = new BedrockRuntimeClient({
      region: config.region,
      credentials: config.credentials
    });
    this.transcribeClient = new TranscribeClient({
      region: config.region,
      credentials: config.credentials
    });
  }

  getBedrockClient(): BedrockRuntimeClient {
    return this.bedrockClient;
  }

  getTranscribeClient(): TranscribeClient {
    return this.transcribeClient;
  }

  getConfig(): AWSConfig {
    return this.config;
  }
}

export function createAWSServiceManager(): AWSServiceManager {
  const config: AWSConfig = {
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: process.env.AWS_ACCESS_KEY_ID ? {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
    } : undefined
  };

  return new AWSServiceManager(config);
}
