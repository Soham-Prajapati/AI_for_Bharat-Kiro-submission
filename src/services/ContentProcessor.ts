/**
 * Content Processor Service
 * Handles content input validation, routing, and processing
 */

import { ContentType, ContentMetadata, ExtractedContent } from '../types/core';

export interface ContentInput {
  file: Buffer;
  filename: string;
  mimeType: string;
}

export class ContentProcessor {
  /**
   * Detect content type from MIME type
   */
  detectContentType(mimeType: string): ContentType {
    if (mimeType.startsWith('video/')) return ContentType.VIDEO;
    if (mimeType.startsWith('image/')) return ContentType.IMAGE;
    if (mimeType === 'text/csv' || 
        mimeType === 'application/vnd.ms-excel' ||
        mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      return ContentType.STRUCTURED_DATA;
    }
    if (mimeType.startsWith('text/') || mimeType === 'application/pdf') {
      return ContentType.TEXT;
    }
    return ContentType.TEXT; // default fallback
  }

  /**
   * Validate content input
   */
  validateContent(input: ContentInput): { valid: boolean; error?: string } {
    if (!input.file || input.file.length === 0) {
      return { valid: false, error: 'Empty file' };
    }
    if (!input.filename) {
      return { valid: false, error: 'Missing filename' };
    }
    if (!input.mimeType) {
      return { valid: false, error: 'Missing MIME type' };
    }
    return { valid: true };
  }

  /**
   * Create content metadata
   */
  createMetadata(input: ContentInput): ContentMetadata {
    return {
      id: this.generateId(),
      type: this.detectContentType(input.mimeType),
      originalFilename: input.filename,
      uploadedAt: new Date(),
      size: input.file.length,
      mimeType: input.mimeType
    };
  }

  /**
   * Route content to appropriate processor
   */
  async routeContent(metadata: ContentMetadata, file: Buffer): Promise<ExtractedContent> {
    switch (metadata.type) {
      case ContentType.VIDEO:
        return this.processVideo(file);
      case ContentType.TEXT:
        return this.processText(file);
      case ContentType.IMAGE:
        return this.processImage(file);
      case ContentType.STRUCTURED_DATA:
        return this.processStructuredData(file);
      default:
        throw new Error(`Unsupported content type: ${metadata.type}`);
    }
  }

  private async processVideo(file: Buffer): Promise<ExtractedContent> {
    // Placeholder - will be implemented in task 2.3
    return {
      transcription: '',
      extractedAt: new Date()
    };
  }

  private async processText(file: Buffer): Promise<ExtractedContent> {
    const rawText = file.toString('utf-8');
    
    // Clean and normalize text
    const normalizedText = this.normalizeText(rawText);
    
    // Detect structure (paragraphs, sections)
    const sections = this.detectTextStructure(normalizedText);
    
    return {
      rawText: normalizedText,
      extractedAt: new Date()
    };
  }

  private normalizeText(text: string): string {
    // Remove excessive whitespace
    let normalized = text.replace(/\r\n/g, '\n');
    normalized = normalized.replace(/\n{3,}/g, '\n\n');
    normalized = normalized.trim();
    return normalized;
  }

  private detectTextStructure(text: string): Array<{ title: string; content: string }> {
    const sections: Array<{ title: string; content: string }> = [];
    const lines = text.split('\n');
    
    let currentSection = { title: 'Introduction', content: '' };
    
    for (const line of lines) {
      // Detect headings (lines that are short and followed by content)
      if (line.length > 0 && line.length < 100 && !line.endsWith('.')) {
        if (currentSection.content.length > 0) {
          sections.push(currentSection);
        }
        currentSection = { title: line.trim(), content: '' };
      } else {
        currentSection.content += line + '\n';
      }
    }
    
    if (currentSection.content.length > 0) {
      sections.push(currentSection);
    }
    
    return sections;
  }

  private async processImage(file: Buffer): Promise<ExtractedContent> {
    // Placeholder - will be implemented in task 2.5
    return {
      imageDescription: '',
      extractedAt: new Date()
    };
  }

  private async processStructuredData(file: Buffer): Promise<ExtractedContent> {
    // Placeholder - will be implemented in task 2.6
    return {
      structuredData: {},
      extractedAt: new Date()
    };
  }

  private generateId(): string {
    return `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
