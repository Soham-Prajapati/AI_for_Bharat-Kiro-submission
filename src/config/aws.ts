import * as dotenv from 'dotenv';
import { S3Client } from '@aws-sdk/client-s3';
import { TranscribeClient } from '@aws-sdk/client-transcribe';
import { RekognitionClient } from '@aws-sdk/client-rekognition';
import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { SQSClient } from '@aws-sdk/client-sqs';

dotenv.config();

export interface AWSConfig {
  accessKeyId?: string;
  secretAccessKey?: string;
  region?: string;
  rekognitionRegion?: string;
  s3BucketName?: string;
  dynamoDBTablePrefix?: string;
  sqsQueueUrl?: string;
  cloudFrontDistributionId?: string;
  cloudFrontDomain?: string;
}

export const awsConfig: AWSConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  rekognitionRegion: process.env.AWS_REKOGNITION_REGION,
  s3BucketName: process.env.S3_BUCKET_NAME || process.env.S3_BUCKET,
  dynamoDBTablePrefix: process.env.AWS_DYNAMODB_TABLE_PREFIX || 'content-platform',
  sqsQueueUrl: process.env.AWS_SQS_QUEUE_URL,
  cloudFrontDistributionId: process.env.AWS_CLOUDFRONT_DISTRIBUTION_ID,
  cloudFrontDomain: process.env.CLOUDFRONT_DOMAIN,
};

const placeholderAccessKeys = new Set(['your_access_key', 'your_access_key_here']);
const placeholderSecretKeys = new Set(['your_secret_key', 'your_secret_key_here']);

export const hasValidAWSCredentials = (): boolean => {
  const accessKeyId = awsConfig.accessKeyId;
  const secretAccessKey = awsConfig.secretAccessKey;

  if (!accessKeyId || !secretAccessKey || !awsConfig.region) {
    return false;
  }

  return !placeholderAccessKeys.has(accessKeyId) && !placeholderSecretKeys.has(secretAccessKey);
};

export const hasS3Config = (): boolean => hasValidAWSCredentials() && Boolean(awsConfig.s3BucketName);
export const hasCloudFrontConfig = (): boolean => Boolean(awsConfig.cloudFrontDomain);
export const hasDynamoDBConfig = (): boolean => hasValidAWSCredentials() && Boolean(awsConfig.dynamoDBTablePrefix);
export const hasSQSConfig = (): boolean => hasValidAWSCredentials() && Boolean(awsConfig.sqsQueueUrl);

const requireBaseAWSConfig = (): { region: string; credentials: { accessKeyId: string; secretAccessKey: string } } => {
  if (!hasValidAWSCredentials()) {
    throw new Error('AWS credentials/region are not configured in environment variables.');
  }

  return {
    region: awsConfig.region!,
    credentials: {
      accessKeyId: awsConfig.accessKeyId!,
      secretAccessKey: awsConfig.secretAccessKey!,
    },
  };
};

let s3ClientInstance: S3Client | null = null;
let transcribeClientInstance: TranscribeClient | null = null;
let rekognitionClientInstance: RekognitionClient | null = null;
let bedrockClientInstance: BedrockRuntimeClient | null = null;
let dynamoDBClientInstance: DynamoDBClient | null = null;
let dynamoDBDocumentClientInstance: DynamoDBDocumentClient | null = null;
let sqsClientInstance: SQSClient | null = null;

export const getS3Client = (): S3Client => {
  if (!s3ClientInstance) {
    s3ClientInstance = new S3Client(requireBaseAWSConfig());
  }
  return s3ClientInstance;
};

export const getTranscribeClient = (): TranscribeClient => {
  if (!transcribeClientInstance) {
    const baseConfig = requireBaseAWSConfig();
    transcribeClientInstance = new TranscribeClient({
      ...baseConfig,
      region: process.env.AWS_TRANSCRIBE_REGION || baseConfig.region,
    });
  }
  return transcribeClientInstance;
};

export const getRekognitionClient = (): RekognitionClient => {
  if (!rekognitionClientInstance) {
    const baseConfig = requireBaseAWSConfig();
    rekognitionClientInstance = new RekognitionClient({
      ...baseConfig,
      region: awsConfig.rekognitionRegion || baseConfig.region,
    });
  }
  return rekognitionClientInstance;
};

export const getBedrockClient = (): BedrockRuntimeClient => {
  if (!bedrockClientInstance) {
    bedrockClientInstance = new BedrockRuntimeClient(requireBaseAWSConfig());
  }
  return bedrockClientInstance;
};

export const getDynamoDBClient = (): DynamoDBClient => {
  if (!dynamoDBClientInstance) {
    dynamoDBClientInstance = new DynamoDBClient(requireBaseAWSConfig());
  }
  return dynamoDBClientInstance;
};

export const getDynamoDBDocumentClient = (): DynamoDBDocumentClient => {
  if (!dynamoDBDocumentClientInstance) {
    dynamoDBDocumentClientInstance = DynamoDBDocumentClient.from(getDynamoDBClient(), {
      marshallOptions: {
        removeUndefinedValues: true,
      },
    });
  }
  return dynamoDBDocumentClientInstance;
};

export const getSQSClient = (): SQSClient => {
  if (!sqsClientInstance) {
    sqsClientInstance = new SQSClient(requireBaseAWSConfig());
  }
  return sqsClientInstance;
};

export const toS3HttpUrl = (key: string): string => {
  if (!awsConfig.s3BucketName || !awsConfig.region) {
    throw new Error('S3 bucket/region is not configured.');
  }
  return `https://${awsConfig.s3BucketName}.s3.${awsConfig.region}.amazonaws.com/${key}`;
};

export const toS3Uri = (key: string): string => {
  if (!awsConfig.s3BucketName) {
    throw new Error('S3 bucket is not configured.');
  }
  return `s3://${awsConfig.s3BucketName}/${key}`;
};

export const toCloudFrontUrl = (key: string): string => {
  if (!awsConfig.cloudFrontDomain) {
    return toS3HttpUrl(key);
  }

  const normalizedDomain = awsConfig.cloudFrontDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
  return `https://${normalizedDomain}/${key}`;
};

export interface AWSManagerConfig {
  region: string;
  credentials?: {
    accessKeyId: string;
    secretAccessKey: string;
  };
}

export class AWSServiceManager {
  private bedrockClient: BedrockRuntimeClient;
  private transcribeClient: TranscribeClient;
  private config: AWSManagerConfig;

  constructor(config: AWSManagerConfig) {
    this.config = config;
    this.bedrockClient = new BedrockRuntimeClient({
      region: config.region,
      credentials: config.credentials,
    });
    this.transcribeClient = new TranscribeClient({
      region: config.region,
      credentials: config.credentials,
    });
  }

  getBedrockClient(): BedrockRuntimeClient {
    return this.bedrockClient;
  }

  getTranscribeClient(): TranscribeClient {
    return this.transcribeClient;
  }

  getConfig(): AWSManagerConfig {
    return this.config;
  }
}

export function createAWSServiceManager(): AWSServiceManager {
  const config: AWSManagerConfig = {
    region: awsConfig.region || 'us-east-1',
    credentials: hasValidAWSCredentials()
      ? {
          accessKeyId: awsConfig.accessKeyId!,
          secretAccessKey: awsConfig.secretAccessKey!,
        }
      : undefined,
  };

  return new AWSServiceManager(config);
}
