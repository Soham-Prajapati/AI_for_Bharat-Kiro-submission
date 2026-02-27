import { TranscribeClient, StartTranscriptionJobCommand, GetTranscriptionJobCommand } from '@aws-sdk/client-transcribe';
import { AWSError, ValidationError, NotFoundError } from '../types/errors';

const client = new TranscribeClient({ region: process.env.AWS_REGION || 'us-east-1' });

export class TranscribeService {
  async startTranscription(fileUri: string, jobName: string, languageCode: string = 'en-US'): Promise<string> {
    try {
      if (!fileUri || !fileUri.startsWith('s3://')) {
        throw new ValidationError('Invalid S3 URI format');
      }

      if (!jobName || jobName.length < 1 || jobName.length > 200) {
        throw new ValidationError('Job name must be between 1 and 200 characters');
      }

      const validLanguages = ['en-US', 'hi-IN', 'bn-IN', 'ta-IN', 'te-IN', 'mr-IN', 'gu-IN', 'kn-IN', 'ml-IN'];
      if (!validLanguages.includes(languageCode)) {
        throw new ValidationError(`Invalid language code. Must be one of: ${validLanguages.join(', ')}`);
      }

      const command = new StartTranscriptionJobCommand({
        TranscriptionJobName: jobName,
        LanguageCode: languageCode,
        Media: { MediaFileUri: fileUri },
        MediaFormat: 'mp4',
        OutputBucketName: process.env.AWS_S3_BUCKET
      });

      await client.send(command);
      return jobName;
    } catch (error: any) {
      if (error instanceof ValidationError) throw error;

      if (error.name === 'ConflictException') {
        throw new AWSError('Transcription job already exists', 'Transcribe', error.code);
      }

      if (error.name === 'LimitExceededException') {
        throw new AWSError('Transcription limit exceeded', 'Transcribe', error.code);
      }

      throw new AWSError(error.message || 'Failed to start transcription', 'Transcribe', error.code);
    }
  }

  async getTranscriptionStatus(jobName: string): Promise<any> {
    try {
      if (!jobName) {
        throw new ValidationError('Job name is required');
      }

      const command = new GetTranscriptionJobCommand({
        TranscriptionJobName: jobName
      });

      const response = await client.send(command);

      if (!response.TranscriptionJob) {
        throw new NotFoundError('Transcription job');
      }

      return {
        status: response.TranscriptionJob.TranscriptionJobStatus,
        transcript: response.TranscriptionJob.Transcript?.TranscriptFileUri
      };
    } catch (error: any) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }

      if (error.name === 'BadRequestException') {
        throw new NotFoundError('Transcription job');
      }

      throw new AWSError(error.message || 'Failed to get transcription status', 'Transcribe', error.code);
    }
  }
}

export const transcribeService = new TranscribeService();
