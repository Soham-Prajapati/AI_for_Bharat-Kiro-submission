/**
 * Watermark Service
 * Adds visible and invisible watermarks to media files for brand protection and content tracking
 * Supports images, videos, and audio with customizable positioning and styling
 */

interface WatermarkRequest {
  mediaUrl: string;
  mediaType: 'image' | 'video' | 'audio';
  watermarkType: 'visible' | 'invisible' | 'both';
  visibleOptions?: VisibleWatermarkOptions;
  invisibleOptions?: InvisibleWatermarkOptions;
}

interface VisibleWatermarkOptions {
  logoUrl?: string;
  text?: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' | 'custom';
  customPosition?: { x: number; y: number }; // Percentage (0-100)
  opacity: number; // 0-100
  size: 'small' | 'medium' | 'large' | 'custom';
  customSize?: { width: number; height: number }; // Pixels
  color?: string; // For text watermarks
  fontSize?: number; // For text watermarks
  fontFamily?: string;
  rotation?: number; // Degrees
  padding?: number; // Pixels from edge
}

interface InvisibleWatermarkOptions {
  payload: string; // Data to embed (user ID, content ID, timestamp, etc.)
  strength: number; // 1-10 (higher = more robust but more visible)
  method: 'lsb' | 'dct' | 'dwt'; // Steganography method
}

interface WatermarkResult {
  watermarkedUrl: string;
  originalUrl: string;
  watermarkId: string;
  metadata: WatermarkMetadata;
  processingTime: number; // milliseconds
  fileSize: number; // bytes
  cost: number; // dollars
}

interface WatermarkMetadata {
  mediaType: 'image' | 'video' | 'audio';
  watermarkType: 'visible' | 'invisible' | 'both';
  appliedAt: Date;
  userId: string;
  contentId?: string;
  visibleSettings?: VisibleWatermarkOptions;
  invisiblePayload?: string;
}

interface WatermarkDetectionResult {
  hasWatermark: boolean;
  watermarkType?: 'visible' | 'invisible' | 'both';
  payload?: string;
  confidence: number; // 0-1
  metadata?: WatermarkMetadata;
}

interface WatermarkTemplate {
  templateId: string;
  name: string;
  description: string;
  visibleOptions: VisibleWatermarkOptions;
  invisibleOptions?: InvisibleWatermarkOptions;
  preview: string; // URL to preview image
}

export class WatermarkService {
  private watermarkRegistry: Map<string, WatermarkMetadata>;
  private templates: Map<string, WatermarkTemplate>;

  constructor() {
    this.watermarkRegistry = new Map();
    this.templates = new Map();
    this.initializeDefaultTemplates();
  }

  /**
   * Apply watermark to media file
   */
  async applyWatermark(request: WatermarkRequest, userId: string): Promise<WatermarkResult> {
    const startTime = Date.now();
    const watermarkId = this.generateWatermarkId();

    // Validate request
    this.validateRequest(request);

    // Process based on media type
    let watermarkedUrl: string;
    let fileSize: number;

    if (request.mediaType === 'image') {
      const result = await this.watermarkImage(request, watermarkId);
      watermarkedUrl = result.url;
      fileSize = result.size;
    } else if (request.mediaType === 'video') {
      const result = await this.watermarkVideo(request, watermarkId);
      watermarkedUrl = result.url;
      fileSize = result.size;
    } else if (request.mediaType === 'audio') {
      const result = await this.watermarkAudio(request, watermarkId);
      watermarkedUrl = result.url;
      fileSize = result.size;
    } else {
      throw new Error('Unsupported media type');
    }

    // Store metadata
    const metadata: WatermarkMetadata = {
      mediaType: request.mediaType,
      watermarkType: request.watermarkType,
      appliedAt: new Date(),
      userId,
      visibleSettings: request.visibleOptions,
      invisiblePayload: request.invisibleOptions?.payload,
    };

    this.watermarkRegistry.set(watermarkId, metadata);

    const processingTime = Date.now() - startTime;
    const cost = this.calculateCost(request.mediaType, fileSize);

    return {
      watermarkedUrl,
      originalUrl: request.mediaUrl,
      watermarkId,
      metadata,
      processingTime,
      fileSize,
      cost,
    };
  }

  /**
   * Watermark image
   */
  private async watermarkImage(
    request: WatermarkRequest,
    watermarkId: string
  ): Promise<{ url: string; size: number }> {
    // In production: Use image processing library (Sharp, Jimp, or Canvas)
    // - Load original image
    // - Apply visible watermark (logo/text overlay)
    // - Apply invisible watermark (LSB steganography)
    // - Save to S3
    // - Return S3 URL

    // Mock implementation
    const mockUrl = `https://watermarked-media.s3.amazonaws.com/images/${watermarkId}.jpg`;
    const mockSize = 1024 * 500; // 500 KB

    return { url: mockUrl, size: mockSize };
  }

  /**
   * Watermark video
   */
  private async watermarkVideo(
    request: WatermarkRequest,
    watermarkId: string
  ): Promise<{ url: string; size: number }> {
    // In production: Use FFmpeg
    // - Load video
    // - Add visible watermark overlay (logo/text)
    // - Add invisible watermark (frame-based steganography)
    // - Encode and save to S3
    // - Return S3 URL

    // Mock implementation
    const mockUrl = `https://watermarked-media.s3.amazonaws.com/videos/${watermarkId}.mp4`;
    const mockSize = 1024 * 1024 * 50; // 50 MB

    return { url: mockUrl, size: mockSize };
  }

  /**
   * Watermark audio
   */
  private async watermarkAudio(
    request: WatermarkRequest,
    watermarkId: string
  ): Promise<{ url: string; size: number }> {
    // In production: Use audio processing library
    // - Load audio
    // - Add invisible watermark (audio steganography)
    // - Save to S3
    // - Return S3 URL

    // Mock implementation
    const mockUrl = `https://watermarked-media.s3.amazonaws.com/audio/${watermarkId}.mp3`;
    const mockSize = 1024 * 1024 * 5; // 5 MB

    return { url: mockUrl, size: mockSize };
  }

  /**
   * Detect watermark in media
   */
  async detectWatermark(mediaUrl: string, mediaType: 'image' | 'video' | 'audio'): Promise<WatermarkDetectionResult> {
    // In production: Use detection algorithms
    // - Load media file
    // - Check for visible watermark (pattern matching)
    // - Extract invisible watermark (steganography extraction)
    // - Return detection results

    // Mock implementation
    const hasWatermark = Math.random() > 0.3; // 70% chance of detection

    if (!hasWatermark) {
      return {
        hasWatermark: false,
        confidence: 0.95,
      };
    }

    // Mock detected watermark
    const mockPayload = `user-${Math.floor(Math.random() * 1000)}-content-${Math.floor(Math.random() * 10000)}`;
    const mockMetadata = this.watermarkRegistry.get(mockPayload.split('-')[1]);

    return {
      hasWatermark: true,
      watermarkType: 'both',
      payload: mockPayload,
      confidence: 0.85,
      metadata: mockMetadata,
    };
  }

  /**
   * Remove watermark (for authorized users only)
   */
  async removeWatermark(
    mediaUrl: string,
    watermarkId: string,
    userId: string
  ): Promise<{ success: boolean; cleanUrl?: string; error?: string }> {
    const metadata = this.watermarkRegistry.get(watermarkId);

    if (!metadata) {
      return { success: false, error: 'Watermark not found' };
    }

    if (metadata.userId !== userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // In production: Use watermark removal algorithms
    // - Load watermarked media
    // - Remove visible watermark (inpainting)
    // - Remove invisible watermark (if possible)
    // - Save clean version to S3

    // Mock implementation
    const cleanUrl = mediaUrl.replace('watermarked-media', 'clean-media');

    return { success: true, cleanUrl };
  }

  /**
   * Batch watermark multiple files
   */
  async batchWatermark(
    requests: WatermarkRequest[],
    userId: string
  ): Promise<{ results: WatermarkResult[]; totalCost: number; failedCount: number }> {
    const results: WatermarkResult[] = [];
    let totalCost = 0;
    let failedCount = 0;

    for (const request of requests) {
      try {
        const result = await this.applyWatermark(request, userId);
        results.push(result);
        totalCost += result.cost;
      } catch (error) {
        failedCount++;
        console.error('Failed to watermark:', error);
      }
    }

    return { results, totalCost, failedCount };
  }

  /**
   * Create watermark template
   */
  createTemplate(
    name: string,
    description: string,
    visibleOptions: VisibleWatermarkOptions,
    invisibleOptions?: InvisibleWatermarkOptions
  ): WatermarkTemplate {
    const templateId = this.generateId();
    const template: WatermarkTemplate = {
      templateId,
      name,
      description,
      visibleOptions,
      invisibleOptions,
      preview: `https://templates.s3.amazonaws.com/${templateId}-preview.jpg`,
    };

    this.templates.set(templateId, template);
    return template;
  }

  /**
   * Get template by ID
   */
  getTemplate(templateId: string): WatermarkTemplate | undefined {
    return this.templates.get(templateId);
  }

  /**
   * List all templates
   */
  listTemplates(): WatermarkTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Apply template to media
   */
  async applyTemplate(
    mediaUrl: string,
    mediaType: 'image' | 'video' | 'audio',
    templateId: string,
    userId: string,
    invisiblePayload?: string
  ): Promise<WatermarkResult> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    const request: WatermarkRequest = {
      mediaUrl,
      mediaType,
      watermarkType: template.invisibleOptions ? 'both' : 'visible',
      visibleOptions: template.visibleOptions,
      invisibleOptions: invisiblePayload && template.invisibleOptions
        ? { 
            payload: invisiblePayload,
            strength: template.invisibleOptions.strength,
            method: template.invisibleOptions.method
          }
        : template.invisibleOptions,
    };

    return this.applyWatermark(request, userId);
  }

  /**
   * Verify watermark authenticity
   */
  async verifyWatermark(
    mediaUrl: string,
    expectedPayload: string
  ): Promise<{ authentic: boolean; confidence: number; details: string }> {
    const detection = await this.detectWatermark(mediaUrl, 'image'); // Assume image for now

    if (!detection.hasWatermark) {
      return {
        authentic: false,
        confidence: detection.confidence,
        details: 'No watermark detected',
      };
    }

    const matches = detection.payload === expectedPayload;

    return {
      authentic: matches,
      confidence: detection.confidence,
      details: matches ? 'Watermark matches expected payload' : 'Watermark payload mismatch',
    };
  }

  /**
   * Get watermark statistics
   */
  getWatermarkStats(userId: string): {
    totalWatermarked: number;
    byType: Record<string, number>;
    totalCost: number;
    recentWatermarks: WatermarkMetadata[];
  } {
    const userWatermarks = Array.from(this.watermarkRegistry.values()).filter((m) => m.userId === userId);

    const byType: Record<string, number> = {
      image: 0,
      video: 0,
      audio: 0,
    };

    userWatermarks.forEach((m) => {
      byType[m.mediaType]++;
    });

    // Mock cost calculation
    const totalCost = userWatermarks.length * 0.05; // $0.05 per watermark

    return {
      totalWatermarked: userWatermarks.length,
      byType,
      totalCost,
      recentWatermarks: userWatermarks.slice(-10),
    };
  }

  /**
   * Test watermark durability
   */
  async testDurability(
    watermarkedUrl: string,
    transformations: Array<'compress' | 'crop' | 'resize' | 'rotate' | 'filter'>
  ): Promise<{ survived: boolean; confidence: number; details: string[] }> {
    // In production: Apply transformations and check if watermark survives
    // - Compress image/video
    // - Crop edges
    // - Resize
    // - Rotate
    // - Apply filters
    // - Detect watermark after each transformation

    const details: string[] = [];
    let survivedCount = 0;

    for (const transform of transformations) {
      const survived = Math.random() > 0.2; // 80% survival rate
      if (survived) {
        survivedCount++;
        details.push(`✓ Survived ${transform}`);
      } else {
        details.push(`✗ Failed ${transform}`);
      }
    }

    const confidence = survivedCount / transformations.length;

    return {
      survived: confidence > 0.7,
      confidence,
      details,
    };
  }

  /**
   * Validate watermark request
   */
  private validateRequest(request: WatermarkRequest): void {
    if (!request.mediaUrl) {
      throw new Error('Media URL is required');
    }

    if (request.watermarkType === 'visible' && !request.visibleOptions) {
      throw new Error('Visible options required for visible watermark');
    }

    if (request.watermarkType === 'invisible' && !request.invisibleOptions) {
      throw new Error('Invisible options required for invisible watermark');
    }

    if (request.visibleOptions) {
      if (request.visibleOptions.opacity < 0 || request.visibleOptions.opacity > 100) {
        throw new Error('Opacity must be between 0 and 100');
      }
    }

    if (request.invisibleOptions) {
      if (request.invisibleOptions.strength < 1 || request.invisibleOptions.strength > 10) {
        throw new Error('Strength must be between 1 and 10');
      }
    }
  }

  /**
   * Calculate processing cost
   */
  private calculateCost(mediaType: 'image' | 'video' | 'audio', fileSize: number): number {
    // Base cost per media type
    const baseCost = {
      image: 0.01,
      video: 0.10,
      audio: 0.02,
    };

    // Additional cost for large files (per MB)
    const sizeMB = fileSize / (1024 * 1024);
    const sizeCost = sizeMB > 10 ? (sizeMB - 10) * 0.01 : 0;

    return baseCost[mediaType] + sizeCost;
  }

  /**
   * Initialize default templates
   */
  private initializeDefaultTemplates(): void {
    // Bottom-right logo template
    this.createTemplate(
      'Bottom Right Logo',
      'Small logo in bottom-right corner',
      {
        position: 'bottom-right',
        opacity: 70,
        size: 'small',
        padding: 20,
      },
      {
        payload: 'template-default',
        strength: 5,
        method: 'lsb',
      }
    );

    // Center text template
    this.createTemplate(
      'Center Text',
      'Large text watermark in center',
      {
        text: '© Your Brand',
        position: 'center',
        opacity: 30,
        size: 'large',
        color: '#FFFFFF',
        fontSize: 48,
        fontFamily: 'Arial',
      }
    );

    // Diagonal text template
    this.createTemplate(
      'Diagonal Text',
      'Diagonal text across image',
      {
        text: 'CONFIDENTIAL',
        position: 'center',
        opacity: 20,
        size: 'large',
        color: '#FF0000',
        fontSize: 72,
        fontFamily: 'Arial',
        rotation: -45,
      }
    );
  }

  /**
   * Generate watermark ID
   */
  private generateWatermarkId(): string {
    return `wm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get supported steganography methods
   */
  getSupportedMethods(): Array<{ method: string; description: string; robustness: string }> {
    return [
      {
        method: 'lsb',
        description: 'Least Significant Bit - Fast, low robustness',
        robustness: 'Low',
      },
      {
        method: 'dct',
        description: 'Discrete Cosine Transform - Medium robustness',
        robustness: 'Medium',
      },
      {
        method: 'dwt',
        description: 'Discrete Wavelet Transform - High robustness',
        robustness: 'High',
      },
    ];
  }

  /**
   * Estimate watermark capacity
   */
  estimateCapacity(mediaType: 'image' | 'video' | 'audio', fileSize: number): {
    maxPayloadSize: number; // bytes
    recommendedPayloadSize: number;
  } {
    // Rough estimates
    const capacityRatio = {
      image: 0.001, // 0.1% of file size
      video: 0.0001, // 0.01% of file size
      audio: 0.0005, // 0.05% of file size
    };

    const maxPayloadSize = Math.floor(fileSize * capacityRatio[mediaType]);
    const recommendedPayloadSize = Math.floor(maxPayloadSize * 0.5); // Use 50% for safety

    return {
      maxPayloadSize,
      recommendedPayloadSize,
    };
  }
}

export const watermarkService = new WatermarkService();
