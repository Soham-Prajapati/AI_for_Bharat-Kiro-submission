/**
 * Whisper Transcription Service
 * 
 * Transcribes audio/video files using OpenAI Whisper API
 * This provides REAL transcription from actual video content
 * 
 * Requirements:
 * - OPENAI_API_KEY environment variable
 * - ffmpeg installed for audio extraction from video
 */

import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { logger } from '../utils/logger';

const execAsync = promisify(exec);

export interface WhisperTranscriptResult {
  transcript: string;
  keyPoints: string[];
  wordCount: number;
  language?: string;
  duration?: number;
}

class WhisperTranscriptionService {
  private readonly openaiApiKey: string | undefined;
  private readonly tempDir: string;

  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.tempDir = path.join(process.cwd(), 'temp');
    
    // Create temp directory if it doesn't exist
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Check if Whisper transcription is available
   */
  isAvailable(): boolean {
    return !!this.openaiApiKey && this.openaiApiKey !== 'your_openai_api_key_here';
  }

  /**
   * Transcribe a video/audio file using OpenAI Whisper API
   * 
   * @param localPath - Path to the video/audio file
   * @param fileName - Original filename (for logging)
   * @returns Transcription result or null if failed
   */
  async transcribe(localPath: string, fileName?: string): Promise<WhisperTranscriptResult | null> {
    if (!this.isAvailable()) {
      logger.warn('Whisper transcription not available - OPENAI_API_KEY not configured');
      return null;
    }

    if (!localPath || !fs.existsSync(localPath)) {
      logger.warn('File not found for transcription', { localPath });
      return null;
    }

    try {
      logger.info('Starting Whisper transcription', { localPath, fileName });

      // Determine if we need to extract audio
      const extension = path.extname(localPath).toLowerCase();
      const isVideo = ['.mp4', '.mov', '.avi', '.mkv', '.webm'].includes(extension);
      
      let audioPath = localPath;
      
      // Extract audio from video if needed
      if (isVideo) {
        const extractedPath = await this.extractAudio(localPath);
        if (extractedPath) {
          audioPath = extractedPath;
        } else {
          logger.warn('Failed to extract audio, attempting direct upload');
        }
      }

      // Send to Whisper API
      const transcript = await this.callWhisperAPI(audioPath);
      
      // Clean up temp audio file if we created one
      if (audioPath !== localPath && fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath);
      }

      if (!transcript) {
        return null;
      }

      // Extract key points from the transcript
      const keyPoints = this.extractKeyPoints(transcript);
      const wordCount = transcript.split(/\s+/).filter(w => w.trim()).length;

      logger.info('Whisper transcription completed', {
        fileName,
        wordCount,
        keyPointsCount: keyPoints.length
      });

      return {
        transcript,
        keyPoints,
        wordCount
      };
    } catch (error) {
      logger.error('Whisper transcription failed', {
        localPath,
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }

  /**
   * Extract audio from video file using ffmpeg
   */
  private async extractAudio(videoPath: string): Promise<string | null> {
    const audioPath = path.join(this.tempDir, `audio_${Date.now()}.mp3`);
    
    try {
      // Check if ffmpeg is available
      await execAsync('which ffmpeg');
      
      // Extract audio (limit to first 10 minutes for API limits)
      await execAsync(
        `ffmpeg -i "${videoPath}" -vn -acodec libmp3lame -t 600 -y "${audioPath}"`,
        { timeout: 120000 } // 2 minute timeout
      );
      
      if (fs.existsSync(audioPath)) {
        const stats = fs.statSync(audioPath);
        if (stats.size > 0) {
          logger.info('Audio extracted successfully', { audioPath, size: stats.size });
          return audioPath;
        }
      }
      
      return null;
    } catch (error) {
      logger.warn('ffmpeg audio extraction failed', {
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }

  /**
   * Call OpenAI Whisper API for transcription
   */
  private async callWhisperAPI(audioPath: string): Promise<string | null> {
    try {
      const stats = fs.statSync(audioPath);
      
      // Whisper API has a 25MB limit
      if (stats.size > 25 * 1024 * 1024) {
        logger.warn('File too large for Whisper API (max 25MB)', { size: stats.size });
        return null;
      }

      // Use fetch with FormData for file upload
      const formData = new FormData();
      const fileBlob = new Blob([fs.readFileSync(audioPath)], { type: 'audio/mpeg' });
      formData.append('file', fileBlob, path.basename(audioPath));
      formData.append('model', 'whisper-1');
      formData.append('response_format', 'text');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('Whisper API error', { status: response.status, error: errorText });
        return null;
      }

      const transcript = await response.text();
      return transcript.trim();
    } catch (error) {
      logger.error('Whisper API call failed', {
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }

  /**
   * Extract key points from transcript using simple heuristics
   */
  private extractKeyPoints(transcript: string): string[] {
    const sentences = transcript
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 20 && s.length < 200);

    const keyIndicators = [
      'important', 'key', 'remember', 'crucial', 'essential',
      'first', 'second', 'third', 'finally', 'main',
      'you should', 'you need', 'the point is', 'in summary'
    ];

    // Find sentences with key indicators
    const keyPointCandidates = sentences.filter(sentence => {
      const lower = sentence.toLowerCase();
      return keyIndicators.some(indicator => lower.includes(indicator));
    });

    // If we found key sentences, use them; otherwise sample from transcript
    if (keyPointCandidates.length >= 3) {
      return keyPointCandidates.slice(0, 5);
    }

    // Sample evenly from the transcript
    const step = Math.max(1, Math.floor(sentences.length / 5));
    const sampled: string[] = [];
    for (let i = 0; i < sentences.length && sampled.length < 5; i += step) {
      sampled.push(sentences[i]);
    }

    return sampled;
  }
}

// Export singleton instance
export const whisperTranscriptionService = new WhisperTranscriptionService();
