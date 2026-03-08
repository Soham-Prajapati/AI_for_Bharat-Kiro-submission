/**
 * OpenAI Whisper transcription service.
 * Used as a fallback when AWS Transcribe is unavailable.
 * Reads the local media file and streams it to the Whisper API.
 */

import fs from 'fs';
import path from 'path';
import OpenAI, { toFile } from 'openai';
import { logger } from '../utils/logger';

export interface WhisperTranscriptResult {
  transcript: string;
  keyPoints: string[];
  wordCount: number;
}

class OpenAIWhisperService {
  private client: OpenAI | null = null;

  isConfigured(): boolean {
    return Boolean(process.env.OPENAI_API_KEY);
  }

  private getClient(): OpenAI {
    if (!this.client) {
      this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return this.client;
  }

  async transcribeLocalFile(
    localPath: string,
    fileId: string,
  ): Promise<WhisperTranscriptResult> {
    if (!this.isConfigured()) {
      throw new Error('OPENAI_API_KEY is not set — cannot use Whisper fallback.');
    }

    if (!fs.existsSync(localPath)) {
      throw new Error(`Local file not found for Whisper transcription: ${localPath}`);
    }

    logger.info('Transcribing with OpenAI Whisper', { fileId, localPath });

    const ext = path.extname(localPath).toLowerCase() || '.mp4';
    const mimeMap: Record<string, string> = {
      '.mp4': 'video/mp4', '.mp3': 'audio/mpeg', '.wav': 'audio/wav',
      '.m4a': 'audio/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime',
      '.avi': 'video/x-msvideo',
    };
    const mimeType = mimeMap[ext] || 'video/mp4';

    const file = await toFile(
      fs.createReadStream(localPath),
      path.basename(localPath),
      { type: mimeType },
    );

    const response = await this.getClient().audio.transcriptions.create({
      model: 'whisper-1',
      file,
      response_format: 'text',
    });

    const transcriptText = typeof response === 'string' ? response : (response as any).text ?? '';

    const sentences = transcriptText
      .split(/[.!?]\s+/)
      .map((s: string) => s.trim())
      .filter(Boolean);

    const keyPoints = sentences.slice(0, 5);
    const wordCount = transcriptText.split(/\s+/).filter((w: string) => w.trim()).length;

    logger.info('Whisper transcription complete', { fileId, wordCount });

    return { transcript: transcriptText, keyPoints, wordCount };
  }
}

export const openAIWhisperService = new OpenAIWhisperService();
