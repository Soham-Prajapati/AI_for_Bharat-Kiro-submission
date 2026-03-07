/**
 * Blog Post Prompt Tests
 * 
 * Comprehensive unit tests for the blog post prompt generator
 * Testing various inputs, edge cases, and output validation
 */

// Note: These tests don't require AWS mocks, so we import directly
import { generateBlogPostPrompt, BlogPostInput } from '../../prompts/blog-post.prompt';

describe('generateBlogPostPrompt', () => {
  // ============================================================================
  // Basic Functionality Tests
  // ============================================================================

  describe('Basic Functionality', () => {
    it('should generate prompt with all required fields', () => {
      const input: BlogPostInput = {
        transcript: 'This is a sample transcript about healthy eating habits.',
        domain: 'Food & Cooking',
        keywords: ['healthy eating', 'nutrition', 'diet'],
        language: 'English',
        wordCount: 1500,
      };

      const prompt = generateBlogPostPrompt(input);

      expect(prompt).toBeDefined();
      expect(typeof prompt).toBe('string');
      expect(prompt.length).toBeGreaterThan(0);
    });

    it('should return a string output', () => {
      const input: BlogPostInput = {
        transcript: 'Test transcript',
        domain: 'Technology',
        keywords: ['AI', 'machine learning'],
      };

      const prompt = generateBlogPostPrompt(input);

      expect(typeof prompt).toBe('string');
    });

    it('should include the transcript in the prompt', () => {
      const transcript = 'This is a unique transcript about quantum computing.';
      const input: BlogPostInput = {
        transcript,
        domain: 'Technology',
        keywords: ['quantum computing', 'technology'],
      };

      const prompt = generateBlogPostPrompt(input);

      expect(prompt).toContain(transcript);
    });

    it('should include the domain in the prompt', () => {
      const domain = 'Education & Learning';
      const input: BlogPostInput = {
        transcript: 'Educational content',
        domain,
        keywords: ['learning', 'education'],
      };

      const prompt = generateBlogPostPrompt(input);

      expect(prompt).toContain(domain);
    });

    it('should include all keywords in the prompt', () => {
      const keywords = ['travel', 'adventure', 'backpacking', 'destinations'];
      const input: BlogPostInput = {
        transcript: 'Travel guide content',
        domain: 'Travel & Adventure',
        keywords,
      };

      const prompt = generateBlogPostPrompt(input);

      keywords.forEach(keyword => {
        expect(prompt).toContain(keyword);
      });
    });
  });

  // ============================================================================
  // Default Values Tests
  // ============================================================================

  describe('Default Values', () => {
    it('should use default language (English) when not provided', () => {
      const input: BlogPostInput = {
        transcript: 'Test content',
        domain: 'Technology',
        keywords: ['tech'],
      };

      const prompt = generateBlogPostPrompt(input);

      expect(prompt).toContain('LANGUAGE: English');
    });

    it('should use default word count (1500) when not provided', () => {
      const input: BlogPostInput = {
        transcript: 'Test content',
        domain: 'Technology',
        keywords: ['tech'],
      };

      const prompt = generateBlogPostPrompt(input);

      expect(prompt).toContain('TARGET WORD COUNT: 1500 words');
    });

    it('should use first keyword as primary SEO keyword when seoFocus not provided', () => {
      const keywords = ['primary keyword', 'secondary keyword'];
      const input: BlogPostInput = {
        transcript: 'Test content',
        domain: 'Technology',
        keywords,
      };

      const prompt = generateBlogPostPrompt(input);

      expect(prompt).toContain(`PRIMARY SEO KEYWORD: ${keywords[0]}`);
    });
  });

  // ============================================================================
  // Optional Parameters Tests
  // ============================================================================

  describe('Optional Parameters', () => {
    it('should handle custom language parameter', () => {
      const input: BlogPostInput = {
        transcript: 'Contenu de test',
        domain: 'Technology',
        keywords: ['technologie'],
        language: 'French',
      };

      const prompt = generateBlogPostPrompt(input);

      expect(prompt).toContain('LANGUAGE: French');
    });

    it('should handle custom word count parameter', () => {
      const input: BlogPostInput = {
        transcript: 'Test content',
        domain: 'Technology',
        keywords: ['tech'],
        wordCount: 2500,
      };

      const prompt = generateBlogPostPrompt(input);

      expect(prompt).toContain('TARGET WORD COUNT: 2500 words');
      expect(prompt).toContain('Body (2200 words)'); // 2500 - 300
    });

    it('should handle custom seoFocus parameter', () => {
      const seoFocus = 'custom SEO keyword';
      const input: BlogPostInput = {
        transcript: 'Test content',
        domain: 'Technology',
        keywords: ['tech', 'innovation'],
        seoFocus,
      };

      const prompt = generateBlogPostPrompt(input);

      expect(prompt).toContain(`PRIMARY SEO KEYWORD: ${seoFocus}`);
    });

    it('should prioritize seoFocus over first keyword', () => {
      const seoFocus = 'priority keyword';
      const input: BlogPostInput = {
        transcript: 'Test content',
        domain: 'Technology',
        keywords: ['other keyword', 'another keyword'],
        seoFocus,
      };

      const prompt = generateBlogPostPrompt(input);

      expect(prompt).toContain(`PRIMARY SEO KEYWORD: ${seoFocus}`);
      expect(prompt).not.toContain('PRIMARY SEO KEYWORD: other keyword');
    });
  });

  // ============================================================================
  // Domain-Specific Tests
  // ============================================================================

  describe('Domain-Specific Content', () => {
    it('should include Food & Cooking specific content', () => {
      const input: BlogPostInput = {
        transcript: 'Recipe content',
        domain: 'Food & Cooking',
        keywords: ['recipe', 'cooking'],
      };

      const prompt = generateBlogPostPrompt(input);

      expect(prompt).toContain('Recipe format, ingredients list, step-by-step instructions');
    });

    it('should include Education & Learning specific content', () => {
      const input: BlogPostInput = {
        transcript: 'Educational content',
        domain: 'Education & Learning',
        keywords: ['learning', 'education'],
      };

      const prompt = generateBlogPostPrompt(input);

      expect(prompt).toContain('Tutorial format, learning objectives, practice exercises');
    });

    it('should include Technology specific content', () => {
      const input: BlogPostInput = {
        transcript: 'Tech content',
        domain: 'Technology',
        keywords: ['technology', 'software'],
      };

      const prompt = generateBlogPostPrompt(input);

      expect(prompt).toContain('How-to guides, comparisons, technical explanations');
    });

    it('should include Travel & Adventure specific content', () => {
      const input: BlogPostInput = {
        transcript: 'Travel content',
        domain: 'Travel & Adventure',
        keywords: ['travel', 'adventure'],
      };

      const prompt = generateBlogPostPrompt(input);

      expect(prompt).toContain('Destination guides, itineraries, travel tips');
    });

    it('should handle generic domain without specific content', () => {
      const input: BlogPostInput = {
        transcript: 'Generic content',
        domain: 'Business',
        keywords: ['business', 'strategy'],
      };

      const prompt = generateBlogPostPrompt(input);

      expect(prompt).toBeDefined();
      expect(prompt).toContain('DOMAIN: Business');
    });
  });

  // ============================================================================
  // SEO Requirements Tests
  // ============================================================================

  describe('SEO Requirements', () => {
    it('should include SEO optimization section', () => {
      const input: BlogPostInput = {
        transcript: 'Test content',
        domain: 'Technology',
        keywords: ['SEO', 'optimization'],
      };

      const prompt = generateBlogPostPrompt(input);

      expect(prompt).toContain('SEO OPTIMIZATION:');
    });

    it('should include SEO title requirements', () => {
      const input: BlogPostInput = {
        transcript: 'Test content',
        domain: 'Technology',
        keywords: ['tech'],
      };

      const prompt = generateBlogPostPrompt(input);

      expect(prompt).toContain('SEO-optimized title (50-60 chars, include primary keyword)');
    });

    it('should include meta description requirements', () => {
      const input: BlogPostInput = {
        transcript: 'Test content',
        domain: 'Technology',
        keywords: ['tech'],
      };

      const prompt = generateBlogPostPrompt(input);

      expect(prompt).toContain('meta_description');
      expect(prompt).toContain('150-160 chars');
    });

    it('should include keyword density requirements', () => {
      const input: BlogPostInput = {
        transcript: 'Test content',
        domain: 'Technology',
        keywords: ['tech'],
      };

      const prompt = generateBlogPostPrompt(input);

      expect(prompt).toContain('keyword_density');
      expect(prompt).toContain('1-2%');
    });

    it('should include featured snippet opportunity', () => {
      const input: BlogPostInput = {
        transcript: 'Test content',
        domain: 'Technology',
        keywords: ['tech'],
      };

      const prompt = generateBlogPostPrompt(input);

      expect(prompt).toContain('featured_snippet_opportunity');
    });

    it('should include FAQ section', () => {
      const input: BlogPostInput = {
        transcript: 'Test content',
        domain: 'Technology',
        keywords: ['tech'],
      };

      const prompt = generateBlogPostPrompt(input);

      expect(prompt).toContain('faq_section');
    });
  });

  // ============================================================================
  // Content Structure Tests
  // ============================================================================

  describe('Content Structure Requirements', () => {
    it('should include structure section in output format', () => {
      const input: BlogPostInput = {
        transcript: 'Test content',
        domain: 'Technology',
        keywords: ['tech'],
      };

      const prompt = generateBlogPostPrompt(input);

      expect(prompt).toContain('"structure":');
      expect(prompt).toContain('"introduction":');
      expect(prompt).toContain('"body":');
      expect(prompt).toContain('"conclusion":');
    });

    it('should include heading requirements', () => {
      const input: BlogPostInput = {
        transcript: 'Test content',
        domain: 'Technology',
        keywords: ['tech'],
      };

      const prompt = generateBlogPostPrompt(input);

      expect(prompt).toContain('H1');
      expect(prompt).toContain('H2');
      expect(prompt).toContain('H3');
    });

    it('should include introduction requirements', () => {
      const input: BlogPostInput = {
        transcript: 'Test content',
        domain: 'Technology',
        keywords: ['tech'],
      };

      const prompt = generateBlogPostPrompt(input);

      expect(prompt).toContain('hook');
      expect(prompt).toContain('problem');
      expect(prompt).toContain('promise');
    });

    it('should include readability requirements', () => {
      const input: BlogPostInput = {
        transcript: 'Test content',
        domain: 'Technology',
        keywords: ['tech'],
      };

      const prompt = generateBlogPostPrompt(input);

      expect(prompt).toContain('READABILITY:');
      expect(prompt).toContain('8th-grade reading level');
    });

    it('should include engagement requirements', () => {
      const input: BlogPostInput = {
        transcript: 'Test content',
        domain: 'Technology',
        keywords: ['tech'],
      };

      const prompt = generateBlogPostPrompt(input);

      expect(prompt).toContain('ENGAGEMENT:');
      expect(prompt).toContain('call-to-action');
    });
  });

  // ============================================================================
  // Edge Cases Tests
  // ============================================================================

  describe('Edge Cases', () => {
    it('should handle empty keywords array', () => {
      const input: BlogPostInput = {
        transcript: 'Test content',
        domain: 'Technology',
        keywords: [],
      };

      const prompt = generateBlogPostPrompt(input);

      expect(prompt).toBeDefined();
      expect(typeof prompt).toBe('string');
    });

    it('should handle single keyword', () => {
      const input: BlogPostInput = {
        transcript: 'Test content',
        domain: 'Technology',
        keywords: ['single-keyword'],
      };

      const prompt = generateBlogPostPrompt(input);

      expect(prompt).toContain('single-keyword');
      expect(prompt).toContain('PRIMARY SEO KEYWORD: single-keyword');
    });

    it('should handle very long transcript', () => {
      const longTranscript = 'Lorem ipsum dolor sit amet. '.repeat(1000); // ~28,000 chars
      const input: BlogPostInput = {
        transcript: longTranscript,
        domain: 'Technology',
        keywords: ['tech'],
      };

      const prompt = generateBlogPostPrompt(input);

      expect(prompt).toBeDefined();
      expect(prompt).toContain(longTranscript);
    });

    it('should handle very short transcript', () => {
      const input: BlogPostInput = {
        transcript: 'Short.',
        domain: 'Technology',
        keywords: ['tech'],
      };

      const prompt = generateBlogPostPrompt(input);

      expect(prompt).toBeDefined();
      expect(prompt).toContain('Short.');
    });

    it('should handle special characters in transcript', () => {
      const input: BlogPostInput = {
        transcript: 'Test with special chars: @#$%^&*(){}[]|\\<>?/~`',
        domain: 'Technology',
        keywords: ['tech'],
      };

      const prompt = generateBlogPostPrompt(input);

      expect(prompt).toBeDefined();
      expect(prompt).toContain('@#$%^&*(){}[]|\\<>?/~`');
    });

    it('should handle special characters in keywords', () => {
      const input: BlogPostInput = {
        transcript: 'Test content',
        domain: 'Technology',
        keywords: ['C++', 'Node.js', 'React/Vue'],
      };

      const prompt = generateBlogPostPrompt(input);

      expect(prompt).toContain('C++');
      expect(prompt).toContain('Node.js');
      expect(prompt).toContain('React/Vue');
    });

    it('should handle very long keywords', () => {
      const input: BlogPostInput = {
        transcript: 'Test content',
        domain: 'Technology',
        keywords: ['this-is-a-very-long-keyword-that-might-be-used-in-some-edge-cases'],
      };

      const prompt = generateBlogPostPrompt(input);

      expect(prompt).toContain('this-is-a-very-long-keyword-that-might-be-used-in-some-edge-cases');
    });

    it('should handle many keywords', () => {
      const manyKeywords = Array.from({ length: 20 }, (_, i) => `keyword${i + 1}`);
      const input: BlogPostInput = {
        transcript: 'Test content',
        domain: 'Technology',
        keywords: manyKeywords,
      };

      const prompt = generateBlogPostPrompt(input);

      expect(prompt).toBeDefined();
      manyKeywords.forEach(keyword => {
        expect(prompt).toContain(keyword);
      });
    });

    it('should handle very small word count', () => {
      const input: BlogPostInput = {
        transcript: 'Test content',
        domain: 'Technology',
        keywords: ['tech'],
        wordCount: 500,
      };

      const prompt = generateBlogPostPrompt(input);

      expect(prompt).toContain('TARGET WORD COUNT: 500 words');
      expect(prompt).toContain('Body (200 words)'); // 500 - 300
    });

    it('should handle very large word count', () => {
      const input: BlogPostInput = {
        transcript: 'Test content',
        domain: 'Technology',
        keywords: ['tech'],
        wordCount: 5000,
      };

      const prompt = generateBlogPostPrompt(input);

      expect(prompt).toContain('TARGET WORD COUNT: 5000 words');
      expect(prompt).toContain('Body (4700 words)'); // 5000 - 300
    });

    it('should handle unicode characters in transcript', () => {
      const input: BlogPostInput = {
        transcript: 'Test with unicode: 你好 مرحبا שלום',
        domain: 'Technology',
        keywords: ['tech'],
      };

      const prompt = generateBlogPostPrompt(input);

      expect(prompt).toContain('你好');
      expect(prompt).toContain('مرحبا');
      expect(prompt).toContain('שלום');
    });

    it('should handle emojis in transcript', () => {
      const input: BlogPostInput = {
        transcript: 'Test with emojis: 😀 🚀 💻 🎉',
        domain: 'Technology',
        keywords: ['tech'],
      };

      const prompt = generateBlogPostPrompt(input);

      expect(prompt).toContain('😀');
      expect(prompt).toContain('🚀');
    });

    it('should handle newlines and tabs in transcript', () => {
      const input: BlogPostInput = {
        transcript: 'Line 1\nLine 2\tTabbed content',
        domain: 'Technology',
        keywords: ['tech'],
      };

      const prompt = generateBlogPostPrompt(input);

      expect(prompt).toContain('Line 1\nLine 2\tTabbed content');
    });
  });

  // ============================================================================
  // Output Format Tests
  // ============================================================================

  describe('Output Format', () => {
    it('should include JSON output format specification', () => {
      const input: BlogPostInput = {
        transcript: 'Test content',
        domain: 'Technology',
        keywords: ['tech'],
      };

      const prompt = generateBlogPostPrompt(input);

      expect(prompt).toContain('OUTPUT FORMAT:');
      expect(prompt).toContain('{');
      expect(prompt).toContain('}');
    });

    it('should include all required JSON fields', () => {
      const input: BlogPostInput = {
        transcript: 'Test content',
        domain: 'Technology',
        keywords: ['tech'],
      };

      const prompt = generateBlogPostPrompt(input);

      const requiredFields = [
        '"seo"',
        '"structure"',
        '"content"',
        '"internal_links"',
        '"external_links"',
        '"images"',
        '"featured_snippet_opportunity"',
        '"faq_section"',
      ];

      requiredFields.forEach(field => {
        expect(prompt).toContain(field);
      });
    });

    it('should include image requirements', () => {
      const input: BlogPostInput = {
        transcript: 'Test content',
        domain: 'Technology',
        keywords: ['tech'],
      };

      const prompt = generateBlogPostPrompt(input);

      expect(prompt).toContain('"images"');
      expect(prompt).toContain('alt_text');
      expect(prompt).toContain('placement');
    });

    it('should include internal and external links', () => {
      const input: BlogPostInput = {
        transcript: 'Test content',
        domain: 'Technology',
        keywords: ['tech'],
      };

      const prompt = generateBlogPostPrompt(input);

      expect(prompt).toContain('"internal_links"');
      expect(prompt).toContain('"external_links"');
    });
  });

  // ============================================================================
  // Integration Tests
  // ============================================================================

  describe('Integration Tests', () => {
    it('should generate complete prompt for Food & Cooking domain', () => {
      const input: BlogPostInput = {
        transcript: 'Today we are making a delicious pasta carbonara with authentic Italian ingredients.',
        domain: 'Food & Cooking',
        keywords: ['pasta carbonara', 'Italian recipe', 'cooking'],
        language: 'English',
        wordCount: 1200,
        seoFocus: 'pasta carbonara recipe',
      };

      const prompt = generateBlogPostPrompt(input);

      expect(prompt).toContain('pasta carbonara');
      expect(prompt).toContain('Food & Cooking');
      expect(prompt).toContain('1200 words');
      expect(prompt).toContain('pasta carbonara recipe');
      expect(prompt).toContain('Recipe format');
    });

    it('should generate complete prompt for Education & Learning domain', () => {
      const input: BlogPostInput = {
        transcript: 'Learn how to master calculus with these proven study techniques.',
        domain: 'Education & Learning',
        keywords: ['calculus', 'study techniques', 'math learning'],
        language: 'English',
        wordCount: 2000,
      };

      const prompt = generateBlogPostPrompt(input);

      expect(prompt).toContain('calculus');
      expect(prompt).toContain('Education & Learning');
      expect(prompt).toContain('2000 words');
      expect(prompt).toContain('Tutorial format');
    });

    it('should generate complete prompt for Technology domain', () => {
      const input: BlogPostInput = {
        transcript: 'Artificial intelligence is transforming how we build software applications.',
        domain: 'Technology',
        keywords: ['AI', 'software development', 'machine learning'],
        language: 'English',
        wordCount: 1800,
        seoFocus: 'AI in software development',
      };

      const prompt = generateBlogPostPrompt(input);

      expect(prompt).toContain('Artificial intelligence');
      expect(prompt).toContain('Technology');
      expect(prompt).toContain('1800 words');
      expect(prompt).toContain('AI in software development');
      expect(prompt).toContain('How-to guides');
    });

    it('should generate complete prompt for Travel & Adventure domain', () => {
      const input: BlogPostInput = {
        transcript: 'Discover the hidden gems of Southeast Asia with our comprehensive travel guide.',
        domain: 'Travel & Adventure',
        keywords: ['Southeast Asia', 'travel guide', 'backpacking'],
        language: 'English',
        wordCount: 1500,
      };

      const prompt = generateBlogPostPrompt(input);

      expect(prompt).toContain('Southeast Asia');
      expect(prompt).toContain('Travel & Adventure');
      expect(prompt).toContain('1500 words');
      expect(prompt).toContain('Destination guides');
    });

    it('should generate prompt with all optional parameters', () => {
      const input: BlogPostInput = {
        transcript: 'Complete test with all parameters.',
        domain: 'Technology',
        keywords: ['test', 'complete', 'parameters'],
        language: 'Spanish',
        wordCount: 2500,
        seoFocus: 'complete testing guide',
      };

      const prompt = generateBlogPostPrompt(input);

      expect(prompt).toContain('Complete test with all parameters.');
      expect(prompt).toContain('Technology');
      expect(prompt).toContain('test, complete, parameters');
      expect(prompt).toContain('Spanish');
      expect(prompt).toContain('2500 words');
      expect(prompt).toContain('complete testing guide');
    });

    it('should generate prompt with minimal required parameters', () => {
      const input: BlogPostInput = {
        transcript: 'Minimal test.',
        domain: 'Technology',
        keywords: ['minimal'],
      };

      const prompt = generateBlogPostPrompt(input);

      expect(prompt).toContain('Minimal test.');
      expect(prompt).toContain('Technology');
      expect(prompt).toContain('minimal');
      expect(prompt).toContain('English'); // default
      expect(prompt).toContain('1500 words'); // default
    });
  });

  // ============================================================================
  // Consistency Tests
  // ============================================================================

  describe('Consistency Tests', () => {
    it('should generate consistent output for same input', () => {
      const input: BlogPostInput = {
        transcript: 'Consistency test',
        domain: 'Technology',
        keywords: ['consistency'],
      };

      const prompt1 = generateBlogPostPrompt(input);
      const prompt2 = generateBlogPostPrompt(input);

      expect(prompt1).toBe(prompt2);
    });

    it('should generate different output for different inputs', () => {
      const input1: BlogPostInput = {
        transcript: 'First test',
        domain: 'Technology',
        keywords: ['first'],
      };

      const input2: BlogPostInput = {
        transcript: 'Second test',
        domain: 'Technology',
        keywords: ['second'],
      };

      const prompt1 = generateBlogPostPrompt(input1);
      const prompt2 = generateBlogPostPrompt(input2);

      expect(prompt1).not.toBe(prompt2);
    });
  });
});
