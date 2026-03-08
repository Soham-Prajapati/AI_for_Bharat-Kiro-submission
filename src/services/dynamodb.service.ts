import { GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { awsConfig, getDynamoDBDocumentClient, hasDynamoDBConfig } from '../config/aws';
import { logger } from '../utils/logger';
import { GenerationResults, ProcessingJob } from '../types/upload-to-results';

interface StoredUser {
  userId: string;
  [key: string]: any;
}

class DynamoDBService {
  private readonly documentClient = getDynamoDBDocumentClient();
  private readonly usersTableName = `${awsConfig.dynamoDBTablePrefix}-users`;
  private readonly jobsTableName = `${awsConfig.dynamoDBTablePrefix}-jobs`;
  private readonly resultsTableName = `${awsConfig.dynamoDBTablePrefix}-results`;

  // In-memory fallback for local development when DynamoDB is unavailable.
  private readonly usersFallback = new Map<string, StoredUser>();
  private readonly jobsFallback = new Map<string, ProcessingJob>();
  private readonly resultsFallback = new Map<string, GenerationResults>();

  private useFallback(): boolean {
    return !hasDynamoDBConfig();
  }

  async createUser(user: StoredUser): Promise<void> {
    try {
      if (this.useFallback()) {
        this.usersFallback.set(user.userId, user);
        return;
      }

      await this.documentClient.send(
        new PutCommand({
          TableName: this.usersTableName,
          Item: user,
        })
      );
    } catch (error) {
      logger.error('DynamoDB createUser failed, using fallback', { error });
      this.usersFallback.set(user.userId, user);
    }
  }

  async getUser(userId: string): Promise<StoredUser | null> {
    try {
      if (this.useFallback()) {
        return this.usersFallback.get(userId) || null;
      }

      const response = await this.documentClient.send(
        new GetCommand({
          TableName: this.usersTableName,
          Key: { userId },
        })
      );

      return (response.Item as StoredUser) || null;
    } catch (error) {
      logger.error('DynamoDB getUser failed, using fallback', { userId, error });
      return this.usersFallback.get(userId) || null;
    }
  }

  async createJob(job: ProcessingJob): Promise<void> {
    try {
      if (this.useFallback()) {
        this.jobsFallback.set(job.jobId, job);
        return;
      }

      await this.documentClient.send(
        new PutCommand({
          TableName: this.jobsTableName,
          Item: job,
        })
      );
    } catch (error) {
      logger.error('DynamoDB createJob failed, using fallback', { jobId: job.jobId, error });
      this.jobsFallback.set(job.jobId, job);
    }
  }

  async getJob(jobId: string): Promise<ProcessingJob | null> {
    try {
      if (this.useFallback()) {
        return this.jobsFallback.get(jobId) || null;
      }

      const response = await this.documentClient.send(
        new GetCommand({
          TableName: this.jobsTableName,
          Key: { jobId },
        })
      );

      return (response.Item as ProcessingJob) || null;
    } catch (error) {
      logger.error('DynamoDB getJob failed, using fallback', { jobId, error });
      return this.jobsFallback.get(jobId) || null;
    }
  }

  async updateJob(jobId: string, data: Partial<ProcessingJob>): Promise<void> {
    try {
      if (this.useFallback()) {
        const existing = this.jobsFallback.get(jobId);
        if (existing) {
          this.jobsFallback.set(jobId, { ...existing, ...data });
        }
        return;
      }

      const keys = Object.keys(data).filter((key) => key !== 'jobId');
      if (keys.length === 0) {
        return;
      }

      const expressionNames: Record<string, string> = {};
      const expressionValues: Record<string, any> = {};
      const updates = keys.map((key) => {
        const nameKey = `#${key}`;
        const valueKey = `:${key}`;
        expressionNames[nameKey] = key;
        expressionValues[valueKey] = (data as any)[key];
        return `${nameKey} = ${valueKey}`;
      });

      await this.documentClient.send(
        new UpdateCommand({
          TableName: this.jobsTableName,
          Key: { jobId },
          UpdateExpression: `SET ${updates.join(', ')}`,
          ExpressionAttributeNames: expressionNames,
          ExpressionAttributeValues: expressionValues,
        })
      );
    } catch (error) {
      logger.error('DynamoDB updateJob failed, using fallback', { jobId, error });
      const existing = this.jobsFallback.get(jobId);
      if (existing) {
        this.jobsFallback.set(jobId, { ...existing, ...data });
      }
    }
  }

  async saveResult(result: GenerationResults): Promise<void> {
    const resultId = result.jobId;

    try {
      if (this.useFallback()) {
        this.resultsFallback.set(resultId, result);
        return;
      }

      await this.documentClient.send(
        new PutCommand({
          TableName: this.resultsTableName,
          Item: {
            resultId,
            ...result,
          },
        })
      );
    } catch (error) {
      logger.error('DynamoDB saveResult failed, using fallback', { resultId, error });
      this.resultsFallback.set(resultId, result);
    }
  }

  async getResult(resultId: string): Promise<GenerationResults | null> {
    try {
      if (this.useFallback()) {
        return this.resultsFallback.get(resultId) || null;
      }

      const response = await this.documentClient.send(
        new GetCommand({
          TableName: this.resultsTableName,
          Key: { resultId },
        })
      );

      if (!response.Item) {
        return null;
      }

      const { resultId: _resultId, ...result } = response.Item;
      return result as GenerationResults;
    } catch (error) {
      logger.error('DynamoDB getResult failed, using fallback', { resultId, error });
      return this.resultsFallback.get(resultId) || null;
    }
  }
}

export const dynamoDBService = new DynamoDBService();
export { DynamoDBService, StoredUser };
