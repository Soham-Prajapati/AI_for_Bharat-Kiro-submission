import { TranscribeClient, StartTranscriptionJobCommand, GetTranscriptionJobCommand } from '@aws-sdk/client-transcribe';

const client = new TranscribeClient({ region: process.env.AWS_REGION || 'us-east-1' });

export class TranscribeService {
  async startTranscription(fileUri: string, jobName: string, languageCode: string = 'en-US'): Promise<string> {
    const command = new StartTranscriptionJobCommand({
      TranscriptionJobName: jobName,
      LanguageCode: languageCode,
      Media: { MediaFileUri: fileUri },
      MediaFormat: 'mp4',
      OutputBucketName: process.env.AWS_S3_BUCKET
    });

    await client.send(command);
    return jobName;
  }

  async getTranscriptionStatus(jobName: string): Promise<any> {
    const command = new GetTranscriptionJobCommand({
      TranscriptionJobName: jobName
    });

    const response = await client.send(command);
    return {
      status: response.TranscriptionJob?.TranscriptionJobStatus,
      transcript: response.TranscriptionJob?.Transcript?.TranscriptFileUri
    };
  }
}

export const transcribeService = new TranscribeService();
