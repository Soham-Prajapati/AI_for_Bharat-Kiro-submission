/**
 * SEO Translation Prompt Tests
 * Comprehensive unit tests for SEO translation prompt generator
 */

import { generateSEOTranslationPrompt, SEOTranslationInput } from '../../prompts/seo-translation.prompt';

describe('SEO Translation Prompt Generator', () => {
  describe('Basic Functionality', () => {
    it('should generate a valid prompt with all required inputs', () => {
      const input: SEOTranslationInput = {
        content: 'This is test content about technology.',
        sourceLanguage: 'English',
        targetLanguage: 'Spanish',
        domain: 'technology',
        keywords: ['tech', 'innovation'],
        contentType: 'blog-post',
      };

      const result = generateSEOTranslationPrompt(input);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should include all required input fields in the prompt', () => {
      const input: SEOTranslationInput = {
        content: 'Test content',
        sourceLanguage: 'English',
        targetLanguage: 'French',
        domain: 'business',
        keywords: ['business', 'strategy'],
        contentType: 'website-copy',
      };

      const result = generateSEOTranslationPrompt(input);

      expect(result).toContain('Test content');
      expect(result).toContain('English');
      expect(result).toContain('French');
      expect(result).toContain('business');
      expect(result).toContain('business, strategy');
      expect(result).toContain('website-copy');
    });
  });

  describe('Content Type Variations', () => {
    it('should handle video-description content type', () => {
      const input: SEOTranslationInput = {
        content: 'Video description',
        sourceLanguage: 'English',
        targetLanguage: 'Spanish',
        domain: 'education',
        keywords: ['learning'],
        contentType: 'video-description',
      };

      const result = generateSEOTranslationPrompt(input);

      expect(result).toContain('video-description');
      expect(result).toContain('VIDEO DESCRIPTION');
      expect(result).toContain('timestamps');
    });

    it('should handle blog-post content type', () => {
      const input: SEOTranslationInput = {
        content: 'Blog post content',
        sourceLanguage: 'English',
        targetLanguage: 'German',
        domain: 'technology',
        keywords: ['tech'],
        contentType: 'blog-post',
      };

      const result = generateSEOTranslationPrompt(input);

      expect(result).toContain('blog-post');
      expect(result).toContain('BLOG POST');
      expect(result).toContain('headings');
    });

    it('should handle social-caption content type', () => {
      const input: SEOTranslationInput = {
        content: 'Social media caption',
        sourceLanguage: 'English',
        targetLanguage: 'Portuguese',
        domain: 'lifestyle',
        keywords: ['lifestyle'],
        contentType: 'social-caption',
      };

      const result = generateSEOTranslationPrompt(input);

      expect(result).toContain('social-caption');
      expect(result).toContain('SOCIAL CAPTION');
      expect(result).toContain('emojis');
    });

    it('should handle website-copy content type', () => {
      const input: SEOTranslationInput = {
        content: 'Website copy',
        sourceLanguage: 'English',
        targetLanguage: 'Japanese',
        domain: 'ecommerce',
        keywords: ['shop'],
        contentType: 'website-copy',
      };

      const result = generateSEOTranslationPrompt(input);

      expect(result).toContain('website-copy');
      expect(result).toContain('WEBSITE COPY');
      expect(result).toContain('brand voice');
    });
  });

  describe('Translation Requirements', () => {
    it('should include translation quality requirements', () => {
      const input: SEOTranslationInput = {
        content: 'Test content',
        sourceLanguage: 'English',
        targetLanguage: 'Spanish',
        domain: 'tech',
        keywords: ['tech'],
        contentType: 'blog-post',
      };

      const result = generateSEOTranslationPrompt(input);

      expect(result).toContain('TRANSLATION QUALITY');
      expect(result).toContain('Native-level fluency');
    });

    it('should include SEO preservation requirements', () => {
      const input: SEOTranslationInput = {
        content: 'Test content',
        sourceLanguage: 'English',
        targetLanguage: 'French',
        domain: 'tech',
        keywords: ['tech'],
        contentType: 'blog-post',
      };

      const result = generateSEOTranslationPrompt(input);

      expect(result).toContain('SEO PRESERVATION');
      expect(result).toContain('keywords');
    });

    it('should include cultural adaptation requirements', () => {
      const input: SEOTranslationInput = {
        content: 'Test content',
        sourceLanguage: 'English',
        targetLanguage: 'German',
        domain: 'tech',
        keywords: ['tech'],
        contentType: 'blog-post',
      };

      const result = generateSEOTranslationPrompt(input);

      expect(result).toContain('CULTURAL ADAPTATION');
      expect(result).toContain('idioms');
    });
  });

  describe('Output Format', () => {
    it('should specify JSON output format', () => {
      const input: SEOTranslationInput = {
        content: 'Test content',
        sourceLanguage: 'English',
        targetLanguage: 'Spanish',
        domain: 'tech',
        keywords: ['tech'],
        contentType: 'blog-post',
      };

      const result = generateSEOTranslationPrompt(input);

      expect(result).toContain('OUTPUT FORMAT');
      expect(result).toContain('JSON format');
    });

    it('should include all required output fields', () => {
      const input: SEOTranslationInput = {
        content: 'Test content',
        sourceLanguage: 'English',
        targetLanguage: 'Spanish',
        domain: 'tech',
        keywords: ['tech'],
        contentType: 'blog-post',
      };

      const result = generateSEOTranslationPrompt(input);

      const requiredFields = [
        'translation',
        'localized_keywords',
        'cultural_adaptations',
        'seo_notes',
        'alternative_translations',
        'metadata',
      ];

      requiredFields.forEach(field => {
        expect(result).toContain(field);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty content', () => {
      const input: SEOTranslationInput = {
        content: '',
        sourceLanguage: 'English',
        targetLanguage: 'Spanish',
        domain: 'tech',
        keywords: ['tech'],
        contentType: 'blog-post',
      };

      const result = generateSEOTranslationPrompt(input);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle empty keywords array', () => {
      const input: SEOTranslationInput = {
        content: 'Test content',
        sourceLanguage: 'English',
        targetLanguage: 'Spanish',
        domain: 'tech',
        keywords: [],
        contentType: 'blog-post',
      };

      const result = generateSEOTranslationPrompt(input);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });
});
