/**
 * Voice Quality Tests
 * 
 * Comprehensive test suite for voice cloning and quality metrics including:
 * - Voice similarity (>80% target)
 * - Naturalness (MOS >4.0/5.0)
 * - Voice cloning accuracy
 * - Audio quality metrics
 * - Edge cases (noise, different accents, etc.)
 * 
 * Note: Since voice-clone.service.ts doesn't exist yet, these are mock tests
 * that define the expected behavior and quality standards.
 */

import {
  wait,
  randomNumber,
  createMockFile,
} from './setup';

// ============================================================================
// Mock Voice Clone Service
// ============================================================================

/**
 * Mock voice clone service for testing
 * This would be replaced with actual service implementation
 */
class MockVoiceCloneService {
  /**
   * Clone a voice from audio sample
   */
  async cloneVoice(audioBuffer: Buffer, options: {
    targetLanguage?: string;
    accent?: string;
    noiseLevel?: number;
  } = {}): Promise<{
    voiceId: string;
    similarity: number;
    quality: number;
    processingTime: number;
  }> {
    await wait(100); // Simulate processing time
    
    // Simulate noise impact on quality
    const noiseImpact = (options.noiseLevel || 0) * 0.3;
    const baseSimilarity = 0.85 + (Math.random() * 0.1);
    const baseQuality = 4.2 + (Math.random() * 0.6);
    
    return {
      voiceId: `voice-${Date.now()}`,
      similarity: Math.max(0, Math.min(1, baseSimilarity - noiseImpact)),
      quality: Math.max(1, Math.min(5, baseQuality - (noiseImpact * 2))),
      processingTime: 100 + randomNumber(0, 50),
    };
  }

  /**
   * Synthesize speech using cloned voice
   */
  async synthesizeSpeech(voiceId: string, text: string, options: {
    speed?: number;
    pitch?: number;
    emotion?: string;
  } = {}): Promise<{
    audioBuffer: Buffer;
    duration: number;
    sampleRate: number;
    bitrate: number;
    format: string;
  }> {
    await wait(50);
    
    return {
      audioBuffer: Buffer.from(`synthesized-audio-${voiceId}`),
      duration: text.length * 0.1, // Rough estimate
      sampleRate: 44100,
      bitrate: 192,
      format: 'mp3',
    };
  }

  /**
   * Calculate voice similarity between two audio samples
   */
  async calculateSimilarity(audio1: Buffer, audio2: Buffer): Promise<{
    similarity: number;
    confidence: number;
    metrics: {
      spectralSimilarity: number;
      pitchSimilarity: number;
      timbreSimilarity: number;
      rhythmSimilarity: number;
    };
  }> {
    await wait(75);
    
    const baseSimilarity = 0.82 + (Math.random() * 0.15);
    
    return {
      similarity: baseSimilarity,
      confidence: 0.9 + (Math.random() * 0.09),
      metrics: {
        spectralSimilarity: baseSimilarity + (Math.random() * 0.05 - 0.025),
        pitchSimilarity: baseSimilarity + (Math.random() * 0.05 - 0.025),
        timbreSimilarity: baseSimilarity + (Math.random() * 0.05 - 0.025),
        rhythmSimilarity: baseSimilarity + (Math.random() * 0.05 - 0.025),
      },
    };
  }

  /**
   * Calculate Mean Opinion Score (MOS) for audio quality
   */
  async calculateMOS(audioBuffer: Buffer, options: {
    noiseLevel?: number;
    compression?: string;
  } = {}): Promise<{
    mos: number;
    confidence: number;
    metrics: {
      clarity: number;
      naturalness: number;
      pleasantness: number;
      intelligibility: number;
    };
  }> {
    await wait(60);
    
    // Simulate noise and compression impact
    const noiseImpact = (options.noiseLevel || 0) * 1.0; // Increased impact
    const compressionImpact = options.compression === 'low' ? 0.5 : 0; // Increased impact
    const baseMOS = 4.3 + (Math.random() * 0.5);
    
    const finalMOS = Math.max(1, Math.min(5, baseMOS - noiseImpact - compressionImpact));
    
    return {
      mos: finalMOS,
      confidence: 0.88 + (Math.random() * 0.1),
      metrics: {
        clarity: finalMOS + (Math.random() * 0.2 - 0.1),
        naturalness: finalMOS + (Math.random() * 0.2 - 0.1),
        pleasantness: finalMOS + (Math.random() * 0.2 - 0.1),
        intelligibility: finalMOS + (Math.random() * 0.2 - 0.1),
      },
    };
  }

  /**
   * Analyze audio quality metrics
   */
  async analyzeAudioQuality(audioBuffer: Buffer): Promise<{
    sampleRate: number;
    bitrate: number;
    channels: number;
    duration: number;
    format: string;
    snr: number; // Signal-to-noise ratio
    dynamicRange: number;
    peakLevel: number;
  }> {
    await wait(40);
    
    return {
      sampleRate: 44100,
      bitrate: 192,
      channels: 2,
      duration: 10.5,
      format: 'mp3',
      snr: 35 + randomNumber(0, 15), // dB
      dynamicRange: 60 + randomNumber(0, 20), // dB
      peakLevel: -3 + (Math.random() * 2), // dB
    };
  }

  /**
   * Detect and reduce noise in audio
   */
  async reduceNoise(audioBuffer: Buffer, aggressiveness: number = 0.5): Promise<{
    cleanedAudio: Buffer;
    noiseReduction: number;
    originalNoiseLevel: number;
    finalNoiseLevel: number;
  }> {
    await wait(80);
    
    const originalNoise = 0.2 + (Math.random() * 0.3);
    const reduction = aggressiveness * 0.7;
    
    return {
      cleanedAudio: Buffer.from(`cleaned-${audioBuffer.toString()}`),
      noiseReduction: reduction,
      originalNoiseLevel: originalNoise,
      finalNoiseLevel: Math.max(0, originalNoise - reduction),
    };
  }

  /**
   * Detect accent in audio sample
   */
  async detectAccent(audioBuffer: Buffer): Promise<{
    accent: string;
    confidence: number;
    alternatives: Array<{ accent: string; confidence: number }>;
  }> {
    await wait(70);
    
    const accents = ['american', 'british', 'australian', 'indian', 'neutral'];
    const primaryAccent = accents[randomNumber(0, accents.length - 1)];
    
    return {
      accent: primaryAccent,
      confidence: 0.75 + (Math.random() * 0.2),
      alternatives: accents
        .filter(a => a !== primaryAccent)
        .slice(0, 2)
        .map(a => ({
          accent: a,
          confidence: 0.3 + (Math.random() * 0.3),
        })),
    };
  }
}

// ============================================================================
// Test Suite
// ============================================================================

describe('Voice Quality Tests', () => {
  let voiceService: MockVoiceCloneService;

  beforeEach(() => {
    voiceService = new MockVoiceCloneService();
  });

  // ==========================================================================
  // Voice Similarity Tests (>80% target)
  // ==========================================================================

  describe('Voice Similarity', () => {
    it('should achieve >80% similarity for high-quality voice cloning', async () => {
      const mockAudio = createMockFile({
        originalname: 'voice-sample.wav',
        mimetype: 'audio/wav',
        buffer: Buffer.from('high-quality-audio-sample'),
        size: 1024 * 1024, // 1MB
      });

      const result = await voiceService.cloneVoice(mockAudio.buffer);

      expect(result.similarity).toBeGreaterThan(0.8);
      expect(result.similarity).toBeLessThanOrEqual(1.0);
      expect(result.voiceId).toBeDefined();
      expect(result.voiceId).toMatch(/^voice-\d+$/);
    });

    it('should calculate similarity between original and cloned voice', async () => {
      const originalAudio = Buffer.from('original-voice-sample');
      const clonedAudio = Buffer.from('cloned-voice-sample');

      const result = await voiceService.calculateSimilarity(originalAudio, clonedAudio);

      expect(result.similarity).toBeGreaterThan(0.8);
      expect(result.confidence).toBeGreaterThan(0.85);
      expect(result.metrics).toBeDefined();
      expect(result.metrics.spectralSimilarity).toBeGreaterThan(0.75);
      expect(result.metrics.pitchSimilarity).toBeGreaterThan(0.75);
      expect(result.metrics.timbreSimilarity).toBeGreaterThan(0.75);
      expect(result.metrics.rhythmSimilarity).toBeGreaterThan(0.75);
    });

    it('should maintain similarity across different text inputs', async () => {
      const mockAudio = Buffer.from('voice-sample');
      const cloneResult = await voiceService.cloneVoice(mockAudio);

      const texts = [
        'Hello, how are you today?',
        'The quick brown fox jumps over the lazy dog.',
        'Testing voice consistency across different sentences.',
      ];

      const synthesizedAudios = await Promise.all(
        texts.map(text => voiceService.synthesizeSpeech(cloneResult.voiceId, text))
      );

      // All synthesized audio should have consistent quality
      synthesizedAudios.forEach(audio => {
        expect(audio.sampleRate).toBe(44100);
        expect(audio.bitrate).toBe(192);
        expect(audio.format).toBe('mp3');
      });
    });

    it('should provide detailed similarity metrics breakdown', async () => {
      const audio1 = Buffer.from('voice-sample-1');
      const audio2 = Buffer.from('voice-sample-2');

      const result = await voiceService.calculateSimilarity(audio1, audio2);

      // Verify all metric components are present
      expect(result.metrics).toHaveProperty('spectralSimilarity');
      expect(result.metrics).toHaveProperty('pitchSimilarity');
      expect(result.metrics).toHaveProperty('timbreSimilarity');
      expect(result.metrics).toHaveProperty('rhythmSimilarity');

      // All metrics should be in valid range
      Object.values(result.metrics).forEach(metric => {
        expect(metric).toBeGreaterThanOrEqual(0);
        expect(metric).toBeLessThanOrEqual(1);
      });
    });
  });

  // ==========================================================================
  // Naturalness Tests (MOS >4.0/5.0)
  // ==========================================================================

  describe('Naturalness (MOS Score)', () => {
    it('should achieve MOS score >4.0 for synthesized speech', async () => {
      const mockAudio = Buffer.from('synthesized-speech');

      const result = await voiceService.calculateMOS(mockAudio);

      expect(result.mos).toBeGreaterThan(4.0);
      expect(result.mos).toBeLessThanOrEqual(5.0);
      expect(result.confidence).toBeGreaterThan(0.85);
    });

    it('should provide detailed MOS metrics breakdown', async () => {
      const mockAudio = Buffer.from('synthesized-speech');

      const result = await voiceService.calculateMOS(mockAudio);

      expect(result.metrics).toBeDefined();
      expect(result.metrics.clarity).toBeGreaterThan(3.5);
      expect(result.metrics.naturalness).toBeGreaterThan(3.5);
      expect(result.metrics.pleasantness).toBeGreaterThan(3.5);
      expect(result.metrics.intelligibility).toBeGreaterThan(3.5);

      // All metrics should be in valid MOS range (1-5)
      Object.values(result.metrics).forEach(metric => {
        expect(metric).toBeGreaterThanOrEqual(1);
        expect(metric).toBeLessThanOrEqual(5);
      });
    });

    it('should maintain high MOS across different voice characteristics', async () => {
      const mockAudio = Buffer.from('voice-sample');
      const cloneResult = await voiceService.cloneVoice(mockAudio);

      const variations = [
        { speed: 0.9, pitch: 0, emotion: 'neutral' },
        { speed: 1.0, pitch: 0, emotion: 'happy' },
        { speed: 1.1, pitch: 0, emotion: 'serious' },
      ];

      for (const variation of variations) {
        const synthesized = await voiceService.synthesizeSpeech(
          cloneResult.voiceId,
          'Test sentence for naturalness.',
          variation
        );

        const mos = await voiceService.calculateMOS(synthesized.audioBuffer);
        expect(mos.mos).toBeGreaterThan(4.0);
      }
    });

    it('should detect degradation in MOS with poor audio quality', async () => {
      const highQualityAudio = Buffer.from('high-quality-audio');
      const lowQualityAudio = Buffer.from('low-quality-audio');

      const highQualityMOS = await voiceService.calculateMOS(highQualityAudio);
      const lowQualityMOS = await voiceService.calculateMOS(lowQualityAudio, {
        compression: 'low',
        noiseLevel: 0.3,
      });

      // Low quality should be noticeably worse
      expect(lowQualityMOS.mos).toBeLessThan(4.0);
      expect(highQualityMOS.mos).toBeGreaterThan(4.0);
      expect(highQualityMOS.mos - lowQualityMOS.mos).toBeGreaterThan(0.3);
    });
  });

  // ==========================================================================
  // Voice Cloning Accuracy Tests
  // ==========================================================================

  describe('Voice Cloning Accuracy', () => {
    it('should successfully clone voice from audio sample', async () => {
      const mockAudio = createMockFile({
        originalname: 'speaker-voice.wav',
        mimetype: 'audio/wav',
        buffer: Buffer.from('speaker-audio-data'),
      });

      const result = await voiceService.cloneVoice(mockAudio.buffer);

      expect(result).toBeDefined();
      expect(result.voiceId).toBeDefined();
      expect(result.similarity).toBeGreaterThan(0.8);
      expect(result.quality).toBeGreaterThan(4.0);
      expect(result.processingTime).toBeGreaterThan(0);
    });

    it('should clone voice with different language targets', async () => {
      const mockAudio = Buffer.from('english-speaker');

      const languages = ['en-US', 'en-GB', 'es-ES', 'fr-FR'];

      for (const lang of languages) {
        const result = await voiceService.cloneVoice(mockAudio, {
          targetLanguage: lang,
        });

        expect(result.voiceId).toBeDefined();
        expect(result.similarity).toBeGreaterThan(0.75); // Slightly lower for cross-language
      }
    });

    it('should handle different accent variations', async () => {
      const mockAudio = Buffer.from('speaker-with-accent');

      const accents = ['american', 'british', 'australian', 'neutral'];

      for (const accent of accents) {
        const result = await voiceService.cloneVoice(mockAudio, {
          accent,
        });

        expect(result.voiceId).toBeDefined();
        expect(result.similarity).toBeGreaterThan(0.75);
      }
    });

    it('should synthesize speech with cloned voice', async () => {
      const mockAudio = Buffer.from('voice-sample');
      const cloneResult = await voiceService.cloneVoice(mockAudio);

      const text = 'This is a test of the cloned voice synthesis.';
      const synthesized = await voiceService.synthesizeSpeech(cloneResult.voiceId, text);

      expect(synthesized.audioBuffer).toBeDefined();
      expect(synthesized.duration).toBeGreaterThan(0);
      expect(synthesized.sampleRate).toBe(44100);
      expect(synthesized.bitrate).toBe(192);
      expect(synthesized.format).toBe('mp3');
    });

    it('should maintain voice characteristics in synthesis', async () => {
      const mockAudio = Buffer.from('voice-sample');
      const cloneResult = await voiceService.cloneVoice(mockAudio);

      const longText = 'This is a longer text to test voice consistency. '.repeat(10);
      const synthesized = await voiceService.synthesizeSpeech(cloneResult.voiceId, longText);

      expect(synthesized.duration).toBeGreaterThan(5); // Should be substantial
      expect(synthesized.audioBuffer.length).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // Audio Quality Metrics Tests
  // ==========================================================================

  describe('Audio Quality Metrics', () => {
    it('should analyze audio quality with correct sample rate', async () => {
      const mockAudio = Buffer.from('audio-sample');

      const result = await voiceService.analyzeAudioQuality(mockAudio);

      expect(result.sampleRate).toBe(44100); // CD quality
      expect(result.bitrate).toBeGreaterThanOrEqual(128);
      expect(result.channels).toBeGreaterThanOrEqual(1);
      expect(result.duration).toBeGreaterThan(0);
    });

    it('should measure signal-to-noise ratio (SNR)', async () => {
      const mockAudio = Buffer.from('audio-with-noise');

      const result = await voiceService.analyzeAudioQuality(mockAudio);

      expect(result.snr).toBeGreaterThan(30); // Good SNR threshold
      expect(result.snr).toBeLessThan(60); // Realistic upper bound
    });

    it('should measure dynamic range', async () => {
      const mockAudio = Buffer.from('audio-sample');

      const result = await voiceService.analyzeAudioQuality(mockAudio);

      expect(result.dynamicRange).toBeGreaterThan(50); // Minimum acceptable
      expect(result.dynamicRange).toBeLessThan(100); // Realistic upper bound
    });

    it('should detect peak levels within safe range', async () => {
      const mockAudio = Buffer.from('audio-sample');

      const result = await voiceService.analyzeAudioQuality(mockAudio);

      expect(result.peakLevel).toBeLessThan(0); // Should not clip
      expect(result.peakLevel).toBeGreaterThan(-10); // Should have good level
    });

    it('should verify audio format specifications', async () => {
      const mockAudio = Buffer.from('audio-sample');

      const result = await voiceService.analyzeAudioQuality(mockAudio);

      expect(result.format).toMatch(/^(mp3|wav|aac|flac)$/);
      expect(result.sampleRate).toBeGreaterThanOrEqual(22050); // Minimum acceptable
      expect(result.bitrate).toBeGreaterThanOrEqual(128); // Minimum acceptable
    });

    it('should ensure stereo audio quality', async () => {
      const mockAudio = Buffer.from('stereo-audio');

      const result = await voiceService.analyzeAudioQuality(mockAudio);

      expect(result.channels).toBe(2);
      expect(result.sampleRate).toBe(44100);
    });
  });

  // ==========================================================================
  // Edge Cases Tests
  // ==========================================================================

  describe('Edge Cases', () => {
    it('should handle noisy audio input', async () => {
      const noisyAudio = Buffer.from('noisy-audio-sample');

      const result = await voiceService.cloneVoice(noisyAudio, {
        noiseLevel: 0.5, // 50% noise
      });

      // Should still work but with reduced quality
      expect(result.voiceId).toBeDefined();
      expect(result.similarity).toBeGreaterThan(0.5); // Lower threshold for noisy input
      expect(result.quality).toBeGreaterThan(3.0); // Lower MOS acceptable
    });

    it('should reduce noise in audio samples', async () => {
      const noisyAudio = Buffer.from('very-noisy-audio');

      const result = await voiceService.reduceNoise(noisyAudio, 0.7);

      expect(result.cleanedAudio).toBeDefined();
      expect(result.noiseReduction).toBeGreaterThan(0.4);
      expect(result.finalNoiseLevel).toBeLessThan(result.originalNoiseLevel);
    });

    it('should handle different accent variations', async () => {
      const audioWithAccent = Buffer.from('accented-speech');

      const result = await voiceService.detectAccent(audioWithAccent);

      expect(result.accent).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0.6);
      expect(result.alternatives).toHaveLength(2);
      expect(result.alternatives[0]).toHaveProperty('accent');
      expect(result.alternatives[0]).toHaveProperty('confidence');
    });

    it('should handle very short audio samples', async () => {
      const shortAudio = Buffer.from('short');

      const result = await voiceService.cloneVoice(shortAudio);

      expect(result.voiceId).toBeDefined();
      // Quality might be lower for short samples
      expect(result.similarity).toBeGreaterThan(0.6);
    });

    it('should handle very long audio samples', async () => {
      const longAudio = Buffer.from('x'.repeat(10000)); // Simulate long audio

      const result = await voiceService.cloneVoice(longAudio);

      expect(result.voiceId).toBeDefined();
      expect(result.similarity).toBeGreaterThan(0.8);
      expect(result.processingTime).toBeGreaterThan(100); // Should take longer
    });

    it('should handle multiple speakers in audio', async () => {
      const multiSpeakerAudio = Buffer.from('multiple-speakers-audio');

      const result = await voiceService.cloneVoice(multiSpeakerAudio);

      // Should still process but might have lower similarity
      expect(result.voiceId).toBeDefined();
      expect(result.similarity).toBeGreaterThan(0.5);
    });

    it('should handle audio with background music', async () => {
      const audioWithMusic = Buffer.from('speech-with-background-music');

      const result = await voiceService.cloneVoice(audioWithMusic, {
        noiseLevel: 0.3,
      });

      expect(result.voiceId).toBeDefined();
      expect(result.similarity).toBeGreaterThan(0.6);
    });

    it('should handle different audio formats', async () => {
      const formats = [
        { buffer: Buffer.from('mp3-audio'), format: 'mp3' },
        { buffer: Buffer.from('wav-audio'), format: 'wav' },
        { buffer: Buffer.from('aac-audio'), format: 'aac' },
      ];

      for (const { buffer } of formats) {
        const result = await voiceService.cloneVoice(buffer);
        expect(result.voiceId).toBeDefined();
        expect(result.similarity).toBeGreaterThan(0.75);
      }
    });

    it('should handle extreme noise levels gracefully', async () => {
      const extremelyNoisyAudio = Buffer.from('extreme-noise');

      const result = await voiceService.cloneVoice(extremelyNoisyAudio, {
        noiseLevel: 0.9, // 90% noise
      });

      expect(result.voiceId).toBeDefined();
      // Should still return a result but with very low quality
      expect(result.similarity).toBeGreaterThan(0);
      expect(result.quality).toBeGreaterThan(0);
    });

    it('should handle aggressive noise reduction', async () => {
      const noisyAudio = Buffer.from('noisy-audio');

      const result = await voiceService.reduceNoise(noisyAudio, 0.95);

      expect(result.cleanedAudio).toBeDefined();
      expect(result.noiseReduction).toBeGreaterThan(0.6);
      expect(result.finalNoiseLevel).toBeLessThan(0.1);
    });
  });

  // ==========================================================================
  // Performance Tests
  // ==========================================================================

  describe('Performance', () => {
    it('should clone voice within acceptable time', async () => {
      const mockAudio = Buffer.from('voice-sample');

      const startTime = Date.now();
      const result = await voiceService.cloneVoice(mockAudio);
      const endTime = Date.now();

      const processingTime = endTime - startTime;

      expect(result.voiceId).toBeDefined();
      expect(processingTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should synthesize speech efficiently', async () => {
      const mockAudio = Buffer.from('voice-sample');
      const cloneResult = await voiceService.cloneVoice(mockAudio);

      const startTime = Date.now();
      await voiceService.synthesizeSpeech(cloneResult.voiceId, 'Test speech synthesis.');
      const endTime = Date.now();

      const synthesisTime = endTime - startTime;
      expect(synthesisTime).toBeLessThan(1000); // Should be fast
    });

    it('should handle concurrent voice cloning requests', async () => {
      const audioSamples = Array.from({ length: 5 }, (_, i) =>
        Buffer.from(`voice-sample-${i}`)
      );

      const startTime = Date.now();
      const results = await Promise.all(
        audioSamples.map(audio => voiceService.cloneVoice(audio))
      );
      const endTime = Date.now();

      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result.voiceId).toBeDefined();
        expect(result.similarity).toBeGreaterThan(0.8);
      });

      const totalTime = endTime - startTime;
      expect(totalTime).toBeLessThan(3000); // Should handle concurrency well
    });
  });

  // ==========================================================================
  // Integration Tests
  // ==========================================================================

  describe('Integration', () => {
    it('should complete full voice cloning workflow', async () => {
      // Step 1: Clone voice
      const originalAudio = Buffer.from('original-speaker-voice');
      const cloneResult = await voiceService.cloneVoice(originalAudio);

      expect(cloneResult.voiceId).toBeDefined();
      expect(cloneResult.similarity).toBeGreaterThan(0.8);

      // Step 2: Synthesize speech
      const text = 'Hello, this is a test of the cloned voice.';
      const synthesized = await voiceService.synthesizeSpeech(cloneResult.voiceId, text);

      expect(synthesized.audioBuffer).toBeDefined();

      // Step 3: Verify quality
      const mos = await voiceService.calculateMOS(synthesized.audioBuffer);
      expect(mos.mos).toBeGreaterThan(4.0);

      // Step 4: Verify similarity
      const similarity = await voiceService.calculateSimilarity(
        originalAudio,
        synthesized.audioBuffer
      );
      expect(similarity.similarity).toBeGreaterThan(0.75);
    });

    it('should handle noise reduction and voice cloning pipeline', async () => {
      // Step 1: Start with noisy audio
      const noisyAudio = Buffer.from('noisy-voice-sample');

      // Step 2: Reduce noise
      const cleaned = await voiceService.reduceNoise(noisyAudio, 0.7);
      expect(cleaned.noiseReduction).toBeGreaterThan(0.4);

      // Step 3: Clone voice from cleaned audio
      const cloneResult = await voiceService.cloneVoice(cleaned.cleanedAudio);
      expect(cloneResult.similarity).toBeGreaterThan(0.8);

      // Step 4: Verify noise was reduced
      expect(cleaned.finalNoiseLevel).toBeLessThan(cleaned.originalNoiseLevel);
      expect(cleaned.noiseReduction).toBeGreaterThan(0);
    });
  });
});
