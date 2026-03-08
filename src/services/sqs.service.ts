import {
  DeleteMessageCommand,
  Message,
  ReceiveMessageCommand,
  SendMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';
import { awsConfig, hasSQSConfig } from '../config/aws';
import { logger } from '../utils/logger';

export interface ProcessingJobPayload {
  jobId: string;
  fileId: string;
  fileName?: string;
  mimeType?: string;
  userId: string;
  platforms?: string[];
  localPath?: string;
  url?: string;
  domain?: string;  // user profile domain — passed to Bedrock agents
}

class SQSService {
  private client: SQSClient | null = null;

  private getClient(): SQSClient {
    if (this.client) {
      return this.client;
    }

    const queueUrl = this.getQueueUrl();
    const inferredRegion = queueUrl.split('.')[1] || awsConfig.region;

    this.client = new SQSClient({
      region: inferredRegion,
      credentials: {
        accessKeyId: awsConfig.accessKeyId || '',
        secretAccessKey: awsConfig.secretAccessKey || '',
      },
    });

    return this.client;
  }

  private getQueueUrl(): string {
    if (!hasSQSConfig() || !awsConfig.sqsQueueUrl) {
      throw new Error('SQS queue is not configured. Set AWS_SQS_QUEUE_URL in environment.');
    }
    return awsConfig.sqsQueueUrl;
  }

  async sendProcessingJob(payload: ProcessingJobPayload): Promise<{ messageId?: string }> {
    try {
      const client = this.getClient();
      const response = await client.send(
        new SendMessageCommand({
          QueueUrl: this.getQueueUrl(),
          MessageBody: JSON.stringify(payload),
        })
      );

      logger.info('Processing job enqueued to SQS', {
        jobId: payload.jobId,
        fileId: payload.fileId,
        messageId: response.MessageId,
      });

      return { messageId: response.MessageId };
    } catch (error) {
      logger.error('Failed to enqueue processing job', {
        jobId: payload.jobId,
        error,
      });
      throw error;
    }
  }

  async receiveProcessingJob(): Promise<Message | null> {
    try {
      const client = this.getClient();
      const response = await client.send(
        new ReceiveMessageCommand({
          QueueUrl: this.getQueueUrl(),
          MaxNumberOfMessages: 1,
          WaitTimeSeconds: 20,
          VisibilityTimeout: 60,
        })
      );

      return response.Messages?.[0] || null;
    } catch (error) {
      logger.error('Failed to receive processing job from SQS', { error });
      throw error;
    }
  }

  async deleteMessage(receiptHandle: string): Promise<void> {
    try {
      const client = this.getClient();
      await client.send(
        new DeleteMessageCommand({
          QueueUrl: this.getQueueUrl(),
          ReceiptHandle: receiptHandle,
        })
      );
    } catch (error) {
      logger.error('Failed to delete SQS message', { error });
      throw error;
    }
  }
}

export const sqsService = new SQSService();
export { SQSService };
