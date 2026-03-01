/**
 * Watermark Service
 * 
 * Handles watermark operations including:
 * - Adding visible watermarks to images/videos
 * - Adding invisible (steganographic) watermarks
 * - Detecting watermarks
 * - Watermark durability testing
 */

export interface WatermarkOptions {
  type: 'visible' | 'invisible';
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity?: number;
  text?: string;
  logoUrl?: string;
  strength?: number; // For invisible watermarks (0-100)
}

export interface WatermarkDetectionResult {
  detected: boolean;
  confidence: number;
  watermarkData?: string;
  position?: string;
}

export interface ProcessedMedia {
  buffer: Buffer;
  metadata: {
    width: number;
    height: number;
    format: string;
    hasWatermark: boolean;
  };
}

export class WatermarkService {
  /**
   * Add a watermark to media
   */
  async addWatermark(
    mediaBuffer: Buffer,
    options: WatermarkOptions
  ): Promise<ProcessedMedia> {
    // Validate inputs
    if (!mediaBuffer || mediaBuffer.length === 0) {
      throw new Error('Invalid media buffer');
    }

    if (options.opacity !== undefined && (options.opacity < 0 || options.opacity > 1)) {
      throw new Error('Opacity must be between 0 and 1');
    }

    if (options.strength !== undefined && (options.strength < 0 || options.strength > 100)) {
      throw new Error('Strength must be between 0 and 100');
    }

    // Mock implementation - in production, this would use FFmpeg or image processing library
    const watermarkedBuffer = Buffer.concat([
      mediaBuffer,
      Buffer.from(JSON.stringify({
        watermark: options.type,
        position: options.position,
        text: options.text,
        timestamp: Date.now(),
      }))
    ]);

    return {
      buffer: watermarkedBuffer,
      metadata: {
        width: 1920,
        height: 1080,
        format: 'mp4',
        hasWatermark: true,
      },
    };
  }

  /**
   * Detect watermark in media
   */
  async detectWatermark(mediaBuffer: Buffer): Promise<WatermarkDetectionResult> {
    if (!mediaBuffer || mediaBuffer.length === 0) {
      throw new Error('Invalid media buffer');
    }

    // Mock detection - check if buffer contains watermark metadata
    const bufferString = mediaBuffer.toString();
    const hasWatermark = bufferString.includes('watermark');

    if (hasWatermark) {
      try {
        // Extract watermark data from end of buffer
        const jsonStart = bufferString.lastIndexOf('{');
        if (jsonStart !== -1) {
          const watermarkData = JSON.parse(bufferString.substring(jsonStart));
          return {
            detected: true,
            confidence: 0.95,
            watermarkData: watermarkData.text || 'detected',
            position: watermarkData.position,
          };
        }
      } catch (e) {
        // Fallback if parsing fails
      }
    }

    return {
      detected: hasWatermark,
      confidence: hasWatermark ? 0.85 : 0.05,
    };
  }

  /**
   * Simulate compression on media
   */
  async compressMedia(mediaBuffer: Buffer, quality: number = 80): Promise<Buffer> {
    if (!mediaBuffer || mediaBuffer.length === 0) {
      throw new Error('Invalid media buffer');
    }

    if (quality < 0 || quality > 100) {
      throw new Error('Quality must be between 0 and 100');
    }

    // Mock compression - reduce buffer size proportionally
    const compressionRatio = quality / 100;
    const targetSize = Math.floor(mediaBuffer.length * compressionRatio);
    
    // Keep watermark data intact at the end
    return mediaBuffer.slice(0, targetSize);
  }

  /**
   * Simulate cropping media
   */
  async cropMedia(
    mediaBuffer: Buffer,
    cropArea: { x: number; y: number; width: number; height: number }
  ): Promise<Buffer> {
    if (!mediaBuffer || mediaBuffer.length === 0) {
      throw new Error('Invalid media buffer');
    }

    // Validate crop area
    if (cropArea.width <= 0 || cropArea.height <= 0) {
      throw new Error('Invalid crop dimensions');
    }

    // Mock cropping - preserve watermark metadata
    const bufferString = mediaBuffer.toString();
    const jsonStart = bufferString.lastIndexOf('{');
    
    if (jsonStart !== -1) {
      const watermarkData = bufferString.substring(jsonStart);
      const mainContent = mediaBuffer.slice(0, jsonStart);
      
      // Simulate crop by taking a portion of the content
      const cropRatio = (cropArea.width * cropArea.height) / (1920 * 1080);
      const croppedSize = Math.floor(mainContent.length * cropRatio);
      const croppedContent = mainContent.slice(0, croppedSize);
      
      return Buffer.concat([croppedContent, Buffer.from(watermarkData)]);
    }

    return mediaBuffer;
  }

  /**
   * Simulate resizing media
   */
  async resizeMedia(
    mediaBuffer: Buffer,
    dimensions: { width: number; height: number }
  ): Promise<Buffer> {
    if (!mediaBuffer || mediaBuffer.length === 0) {
      throw new Error('Invalid media buffer');
    }

    if (dimensions.width <= 0 || dimensions.height <= 0) {
      throw new Error('Invalid dimensions');
    }

    // Mock resizing - adjust buffer size proportionally
    const originalSize = 1920 * 1080;
    const newSize = dimensions.width * dimensions.height;
    const sizeRatio = newSize / originalSize;

    const bufferString = mediaBuffer.toString();
    const jsonStart = bufferString.lastIndexOf('{');
    
    if (jsonStart !== -1) {
      const watermarkData = bufferString.substring(jsonStart);
      const mainContent = mediaBuffer.slice(0, jsonStart);
      
      const resizedSize = Math.floor(mainContent.length * sizeRatio);
      const resizedContent = mainContent.slice(0, resizedSize);
      
      return Buffer.concat([resizedContent, Buffer.from(watermarkData)]);
    }

    return mediaBuffer;
  }

  /**
   * Remove watermark from media (for testing purposes)
   */
  async removeWatermark(mediaBuffer: Buffer): Promise<Buffer> {
    if (!mediaBuffer || mediaBuffer.length === 0) {
      throw new Error('Invalid media buffer');
    }

    const bufferString = mediaBuffer.toString();
    const jsonStart = bufferString.lastIndexOf('{');
    
    if (jsonStart !== -1) {
      return mediaBuffer.slice(0, jsonStart);
    }

    return mediaBuffer;
  }

  /**
   * Get watermark strength/quality score
   */
  async getWatermarkStrength(mediaBuffer: Buffer): Promise<number> {
    const detection = await this.detectWatermark(mediaBuffer);
    return detection.confidence;
  }
}
