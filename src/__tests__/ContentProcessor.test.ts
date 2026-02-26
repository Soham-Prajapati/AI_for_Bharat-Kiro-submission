/**
 * Tests for ContentProcessor service
 */

import { ContentProcessor, ContentInput } from '../services/ContentProcessor';
import { ContentType } from '../types/core';

describe('ContentProcessor', () => {
  let processor: ContentProcessor;

  beforeEach(() => {
    processor = new ContentProcessor();
  });

  describe('detectContentType', () => {
    it('should detect video content type', () => {
      expect(processor.detectContentType('video/mp4')).toBe(ContentType.VIDEO);
    });

    it('should detect image content type', () => {
      expect(processor.detectContentType('image/jpeg')).toBe(ContentType.IMAGE);
    });

    it('should detect text content type', () => {
      expect(processor.detectContentType('text/plain')).toBe(ContentType.TEXT);
    });

    it('should detect structured data content type', () => {
      expect(processor.detectContentType('text/csv')).toBe(ContentType.STRUCTURED_DATA);
    });
  });

  describe('validateContent', () => {
    it('should validate correct content input', () => {
      const input: ContentInput = {
        file: Buffer.from('test'),
        filename: 'test.txt',
        mimeType: 'text/plain'
      };
      const result = processor.validateContent(input);
      expect(result.valid).toBe(true);
    });

    it('should reject empty file', () => {
      const input: ContentInput = {
        file: Buffer.from(''),
        filename: 'test.txt',
        mimeType: 'text/plain'
      };
      const result = processor.validateContent(input);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Empty file');
    });
  });

  describe('createMetadata', () => {
    it('should create valid metadata', () => {
      const input: ContentInput = {
        file: Buffer.from('test content'),
        filename: 'test.txt',
        mimeType: 'text/plain'
      };
      const metadata = processor.createMetadata(input);
      
      expect(metadata.id).toBeDefined();
      expect(metadata.type).toBe(ContentType.TEXT);
      expect(metadata.originalFilename).toBe('test.txt');
      expect(metadata.size).toBe(12);
      expect(metadata.mimeType).toBe('text/plain');
    });
  });
});
