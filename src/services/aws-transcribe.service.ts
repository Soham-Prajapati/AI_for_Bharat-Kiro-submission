import axios from 'axios';
import {
  StartTranscriptionJobCommand,
  GetTranscriptionJobCommand,
} from '@aws-sdk/client-transcribe';
import { randomUUID } from 'crypto';
import { AWSError, ValidationError } from '../types/errors';
import { awsConfig, getTranscribeClient, hasS3Config } from '../config/aws';

export interface AWSCompletedTranscript {
  jobName: string;
  transcript: string;
  transcriptFileUri: string;
}

class AWSTranscribeService {
  isConfigured(): boolean {
    return hasS3Config();
  }

  private createJobName(): string {
    return `ai-bharat-transcribe-${Date.now()}-${randomUUID().slice(0, 8)}`;
  }

  private validateMediaUrl(mediaUrl: string): void {
    if (!mediaUrl) {
      throw new ValidationError('mediaUrl is required');
    }

    const isS3Uri = mediaUrl.startsWith('s3://');
    const isS3HttpUrl = /https:\/\/.*\.s3[.-].*amazonaws\.com\/.+/i.test(mediaUrl);

    if (!isS3Uri && !isS3HttpUrl) {
      throw new ValidationError('mediaUrl must be an S3 URI or S3 HTTPS URL');
    }
  }

  /**
   * Starts a transcription job for an S3 media URL.
   * Returns the job ID so callers can track status asynchronously.
   */
  async startTranscriptionJob(mediaUrl: string): Promise<string> {
    this.validateMediaUrl(mediaUrl);

    try {
      if (!this.isConfigured()) {
        throw new ValidationError('AWS Transcribe is not configured.');
      }

      const client = getTranscribeClient();
      const jobName = this.createJobName();

      const command = new StartTranscriptionJobCommand({
        TranscriptionJobName: jobName,
        LanguageCode: 'en-US',
        Media: {
          MediaFileUri: mediaUrl,
        },
        OutputBucketName: awsConfig.s3BucketName,
      });

      await client.send(command);
      return jobName;
    } catch (error: any) {
      throw new AWSError(error.message || 'Failed to start AWS Transcribe job', 'Transcribe', error.code);
    }
  }

  /**
   * Waits for AWS Transcribe completion and downloads transcript text.
   */
  async transcribeFromS3(mediaUrl: string, maxAttempts: number = 20, pollIntervalMs: number = 3000): Promise<AWSCompletedTranscript> {
    const jobName = await this.startTranscriptionJob(mediaUrl);
    const client = getTranscribeClient();

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const statusResponse = await client.send(
        new GetTranscriptionJobCommand({
          TranscriptionJobName: jobName,
        })
      );

      const job = statusResponse.TranscriptionJob;
      const status = job?.TranscriptionJobStatus;

      if (status === 'COMPLETED') {
        const transcriptFileUri = job?.Transcript?.TranscriptFileUri;

        if (!transcriptFileUri) {
          throw new AWSError('AWS Transcribe job completed without transcript URI', 'Transcribe');
        }

        const transcriptResponse = await axios.get(transcriptFileUri);
        const transcriptText = transcriptResponse.data?.results?.transcripts?.[0]?.transcript;

        if (!transcriptText) {
          throw new AWSError('Transcript text missing in AWS Transcribe response', 'Transcribe');
        }

        return {
          jobName,
          transcript: transcriptText,
          transcriptFileUri,
        };
      }

      if (status === 'FAILED') {
        throw new AWSError(job?.FailureReason || 'AWS Transcribe job failed', 'Transcribe');
      }

      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    }

    throw new AWSError('Timed out waiting for AWS Transcribe job completion', 'Transcribe');
  }
}

export const awsTranscribeService = new AWSTranscribeService();
export { AWSTranscribeService };