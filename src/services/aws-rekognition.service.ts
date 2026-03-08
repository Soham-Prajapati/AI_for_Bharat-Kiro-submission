import {
  StartLabelDetectionCommand,
  StartLabelDetectionCommandOutput,
  GetLabelDetectionCommand,
  GetLabelDetectionCommandOutput,
} from '@aws-sdk/client-rekognition';
import { randomUUID } from 'crypto';
import { AWSError, ValidationError } from '../types/errors';
import { getRekognitionClient, hasValidAWSCredentials } from '../config/aws';

export interface RekognitionLabelInsight {
  label: string;
  confidence: number;
  timestamp: number;
}

class AWSRekognitionService {
  isConfigured(): boolean {
    return hasValidAWSCredentials();
  }

  private generateJobTag(videoKey: string): string {
    const safeKey = videoKey.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 60);
    return `video-analysis-${safeKey}-${randomUUID().slice(0, 8)}`;
  }

  /**
   * Start asynchronous AWS Rekognition label detection for a video stored in S3.
   * Returns both raw AWS response and jobId for later polling.
   */
  async analyzeVideo(bucketName: string, videoKey: string): Promise<{ jobId: string; response: StartLabelDetectionCommandOutput }> {
    if (!bucketName || !videoKey) {
      throw new ValidationError('bucketName and videoKey are required');
    }

    try {
      if (!this.isConfigured()) {
        throw new ValidationError('AWS Rekognition is not configured.');
      }

      const client = getRekognitionClient();

      const command = new StartLabelDetectionCommand({
        Video: {
          S3Object: {
            Bucket: bucketName,
            Name: videoKey,
          },
        },
        MinConfidence: 70,
        JobTag: this.generateJobTag(videoKey),
      });

      const response = await client.send(command);
      const jobId = response.JobId;

      if (!jobId) {
        throw new AWSError('Rekognition did not return a JobId', 'Rekognition');
      }

      return { jobId, response };
    } catch (error: any) {
      throw new AWSError(error.message || 'Failed to start Rekognition label detection', 'Rekognition', error.code);
    }
  }

  /**
   * Check asynchronous Rekognition label-detection job status.
   */
  async getLabelDetectionStatus(jobId: string): Promise<GetLabelDetectionCommandOutput['JobStatus']> {
    if (!jobId) {
      throw new ValidationError('jobId is required');
    }

    try {
      const client = getRekognitionClient();
      const response = await client.send(new GetLabelDetectionCommand({ JobId: jobId, MaxResults: 1 }));
      return response.JobStatus;
    } catch (error: any) {
      throw new AWSError(error.message || 'Failed to get Rekognition job status', 'Rekognition', error.code);
    }
  }

  /**
   * Retrieve all detected labels with confidence and timestamp from Rekognition.
   * Structured output format:
   * { label: "Person", confidence: 98.5, timestamp: 1200 }
   */
  async getDetectedLabels(jobId: string): Promise<RekognitionLabelInsight[]> {
    if (!jobId) {
      throw new ValidationError('jobId is required');
    }

    try {
      const client = getRekognitionClient();
      let nextToken: string | undefined;
      const detectedLabels: RekognitionLabelInsight[] = [];

      do {
        const response: GetLabelDetectionCommandOutput = await client.send(
          new GetLabelDetectionCommand({
            JobId: jobId,
            SortBy: 'TIMESTAMP',
            MaxResults: 1000,
            NextToken: nextToken,
          })
        );

        const entries = response.Labels || [];
        for (const entry of entries) {
          const label = entry.Label?.Name;
          const confidence = entry.Label?.Confidence;
          if (!label || confidence === undefined) {
            continue;
          }

          detectedLabels.push({
            label,
            confidence: Number(confidence.toFixed(2)),
            timestamp: entry.Timestamp || 0,
          });
        }

        nextToken = response.NextToken;
      } while (nextToken);

      return detectedLabels;
    } catch (error: any) {
      throw new AWSError(error.message || 'Failed to fetch Rekognition labels', 'Rekognition', error.code);
    }
  }

  /**
   * Convenience helper: wait until job completes, then return structured labels.
   */
  async waitForLabelDetection(
    jobId: string,
    maxAttempts: number = 30,
    pollIntervalMs: number = 5000
  ): Promise<RekognitionLabelInsight[]> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const status = await this.getLabelDetectionStatus(jobId);

      if (status === 'SUCCEEDED') {
        return this.getDetectedLabels(jobId);
      }

      if (status === 'FAILED') {
        throw new AWSError('Rekognition label detection failed', 'Rekognition');
      }

      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    }

    throw new AWSError('Timed out waiting for Rekognition label detection', 'Rekognition');
  }
}

export const awsRekognitionService = new AWSRekognitionService();
export { AWSRekognitionService };