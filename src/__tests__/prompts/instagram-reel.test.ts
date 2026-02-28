/**
 * Instagram Reel Prompt Generator Tests
 * 
 * Comprehensive test suite for the Instagram Reel prompt generator
 * Testing various durations, domains, keywords, and edge cases
 */

import { generateInstagramReelPrompt, InstagramReelInput } from '../../prompts/instagram-reel.prompt';

// Note: This test file does not require AWS mocks as it only tests prompt generation

describe('Instagram Reel Prompt Generator', () => {
  describe('Basic Functionality', () => {
    it('should generate a prompt with valid input', () => {
      const input: InstagramReelInput = {
        transcript: 'This is a test transcript about fitness and health.',
        domain: 'fitness',
        keywords: ['workout', 'health', 'exercise'],
      };

      const prompt = generateInstagramReelPrompt(input);

      expect(prompt).toBeDefined();
      expect(typeof prompt).toBe('string');
      expect(prompt.length).toBeGreaterThan(0);
    });

    it('should include all required input fields in the prompt', () => {
      const input: InstagramReelInput = {
        transcript: 'Test content about cooking recipes.',
        domain: 'cooking',
        keywords: ['recipe', 'food', 'chef'],
      };

      const prompt = generateInstagramReelPrompt(input);

      expect(prompt).toContain('cooking');
      expect(prompt).toContain('recipe, food, chef');
      expect(prompt).toContain('Test content about cooking recipes.');
    });

    it('should use default language when not specified', () => {
      const input: InstagramReelInput = {
        transcript: 'Test transcript',
        domain: 'tech',
        keywords: ['coding'],
      };

      const prompt = generateInstagramReelPrompt(input);

      expect(prompt).toContain('LANGUAGE: English');
    });

    it('should use default duration of 30 seconds when not specified', () => {
      const input: InstagramReelInput = {
        transcript: 'Test transcript',
        domain: 'tech',
        keywords: ['coding'],
      };

      const prompt = generateInstagramReelPrompt(input);

      expect(prompt).toContain('DURATION: 30 seconds');
      expect(prompt).toContain('30-second Instagram Reel');
    });
  });

  describe('Duration Variations', () => {
    it('should generate prompt for 15-second reel', () => {
      const input: InstagramReelInput = {
        transcript: 'Quick tip about productivity.',
        domain: 'productivity',
        keywords: ['tips', 'efficiency'],
        duration: 15,
      };

      const prompt = generateInstagramReelPrompt(input);

      expect(prompt).toContain('15-second Instagram Reel');
      expect(prompt).toContain('DURATION: 15 seconds');
      expect(prompt).toContain('"second": "10-15"');
    });

    it('should generate prompt for 30-second reel', () => {
      const input: InstagramReelInput = {
        transcript: 'Medium length content.',
        domain: 'lifestyle',
        keywords: ['daily', 'routine'],
        duration: 30,
      };

      const prompt = generateInstagramReelPrompt(input);

      expect(prompt).toContain('30-second Instagram Reel');
      expect(prompt).toContain('DURATION: 30 seconds');
      expect(prompt).toContain('"second": "25-30"');
    });

    it('should generate prompt for 60-second reel', () => {
      const input: InstagramReelInput = {
        transcript: 'Longer form content with more details.',
        domain: 'education',
        keywords: ['learning', 'tutorial'],
        duration: 60,
      };

      const prompt = generateInstagramReelPrompt(input);

      expect(prompt).toContain('60-second Instagram Reel');
      expect(prompt).toContain('DURATION: 60 seconds');
      expect(prompt).toContain('"second": "55-60"');
    });

    it('should generate prompt for 90-second reel', () => {
      const input: InstagramReelInput = {
        transcript: 'Extended content for maximum engagement.',
        domain: 'storytelling',
        keywords: ['narrative', 'story'],
        duration: 90,
      };

      const prompt = generateInstagramReelPrompt(input);

      expect(prompt).toContain('90-second Instagram Reel');
      expect(prompt).toContain('DURATION: 90 seconds');
      expect(prompt).toContain('"second": "85-90"');
    });
  });

  describe('Domain and Keywords', () => {
    it('should handle fitness domain', () => {
      const input: InstagramReelInput = {
        transcript: 'Workout routine for beginners.',
        domain: 'fitness',
        keywords: ['workout', 'exercise', 'health'],
      };

      const prompt = generateInstagramReelPrompt(input);

      expect(prompt).toContain('fitness content');
      expect(prompt).toContain('workout, exercise, health');
      expect(prompt).toContain('trending in fitness niche');
    });

    it('should handle tech domain', () => {
      const input: InstagramReelInput = {
        transcript: 'Latest AI developments.',
        domain: 'technology',
        keywords: ['AI', 'innovation', 'tech'],
      };

      const prompt = generateInstagramReelPrompt(input);

      expect(prompt).toContain('technology content');
      expect(prompt).toContain('AI, innovation, tech');
      expect(prompt).toContain('trending in technology niche');
    });

    it('should handle multiple keywords', () => {
      const input: InstagramReelInput = {
        transcript: 'Comprehensive guide.',
        domain: 'business',
        keywords: ['entrepreneur', 'startup', 'growth', 'marketing', 'sales'],
      };

      const prompt = generateInstagramReelPrompt(input);

      expect(prompt).toContain('entrepreneur, startup, growth, marketing, sales');
    });

    it('should handle single keyword', () => {
      const input: InstagramReelInput = {
        transcript: 'Simple content.',
        domain: 'art',
        keywords: ['painting'],
      };

      const prompt = generateInstagramReelPrompt(input);

      expect(prompt).toContain('KEYWORDS: painting');
    });

    it('should handle special characters in domain', () => {
      const input: InstagramReelInput = {
        transcript: 'Content about health & wellness.',
        domain: 'health & wellness',
        keywords: ['wellbeing'],
      };

      const prompt = generateInstagramReelPrompt(input);

      expect(prompt).toContain('health & wellness');
    });
  });

  describe('Language Support', () => {
    it('should support Spanish language', () => {
      const input: InstagramReelInput = {
        transcript: 'Contenido en español.',
        domain: 'cultura',
        keywords: ['español', 'cultura'],
        language: 'Spanish',
      };

      const prompt = generateInstagramReelPrompt(input);

      expect(prompt).toContain('LANGUAGE: Spanish');
    });

    it('should support French language', () => {
      const input: InstagramReelInput = {
        transcript: 'Contenu en français.',
        domain: 'mode',
        keywords: ['fashion', 'style'],
        language: 'French',
      };

      const prompt = generateInstagramReelPrompt(input);

      expect(prompt).toContain('LANGUAGE: French');
    });

    it('should support German language', () => {
      const input: InstagramReelInput = {
        transcript: 'Deutscher Inhalt.',
        domain: 'technologie',
        keywords: ['tech'],
        language: 'German',
      };

      const prompt = generateInstagramReelPrompt(input);

      expect(prompt).toContain('LANGUAGE: German');
    });
  });

  describe('Instagram-Specific Requirements', () => {
    it('should include caption requirements', () => {
      const input: InstagramReelInput = {
        transcript: 'Test content.',
        domain: 'lifestyle',
        keywords: ['daily'],
      };

      const prompt = generateInstagramReelPrompt(input);

      expect(prompt).toContain('"caption"');
      expect(prompt).toContain('max 2200 chars');
      expect(prompt).toContain('first line is hook');
      expect(prompt).toContain('Hook (stop the scroll)');
    });

    it('should include hashtag requirements', () => {
      const input: InstagramReelInput = {
        transcript: 'Test content.',
        domain: 'travel',
        keywords: ['adventure'],
      };

      const prompt = generateInstagramReelPrompt(input);

      expect(prompt).toContain('"hashtags"');
      expect(prompt).toContain('20-30 relevant hashtags');
      expect(prompt).toContain('Mix popular hashtags');
      expect(prompt).toContain('1M+ posts');
      expect(prompt).toContain('10K-100K posts');
    });

    it('should include CTA requirements', () => {
      const input: InstagramReelInput = {
        transcript: 'Test content.',
        domain: 'food',
        keywords: ['recipe'],
      };

      const prompt = generateInstagramReelPrompt(input);

      expect(prompt).toContain('"cta"');
      expect(prompt).toContain('Call-to-action');
      expect(prompt).toContain('save, share, follow, comment');
    });

    it('should include audio suggestion', () => {
      const input: InstagramReelInput = {
        transcript: 'Test content.',
        domain: 'music',
        keywords: ['beats'],
      };

      const prompt = generateInstagramReelPrompt(input);

      expect(prompt).toContain('"audio_suggestion"');
      expect(prompt).toContain('Trending audio recommendation');
      expect(prompt).toContain('trending in music niche');
    });

    it('should include cover text requirements', () => {
      const input: InstagramReelInput = {
        transcript: 'Test content.',
        domain: 'fashion',
        keywords: ['style'],
      };

      const prompt = generateInstagramReelPrompt(input);

      expect(prompt).toContain('"cover_text"');
      expect(prompt).toContain('Text overlay for cover frame');
      expect(prompt).toContain('3-5 words');
      expect(prompt).toContain('curiosity-inducing');
    });

    it('should include script beats structure', () => {
      const input: InstagramReelInput = {
        transcript: 'Test content.',
        domain: 'education',
        keywords: ['learning'],
        duration: 30,
      };

      const prompt = generateInstagramReelPrompt(input);

      expect(prompt).toContain('"script_beats"');
      expect(prompt).toContain('"second": "0-3"');
      expect(prompt).toContain('Hook visual/text');
      expect(prompt).toContain('"second": "3-10"');
      expect(prompt).toContain('Main content');
      expect(prompt).toContain('"second": "10-25"');
      expect(prompt).toContain('Value delivery');
      expect(prompt).toContain('"second": "25-30"');
      expect(prompt).toContain('"action": "CTA"');
    });

    it('should include engagement tactics', () => {
      const input: InstagramReelInput = {
        transcript: 'Test content.',
        domain: 'wellness',
        keywords: ['mindfulness'],
      };

      const prompt = generateInstagramReelPrompt(input);

      expect(prompt).toContain('"engagement_tactics"');
      expect(prompt).toContain('Question to ask');
      expect(prompt).toContain('Poll idea');
      expect(prompt).toContain('Share prompt');
    });
  });

  describe('Output Format Requirements', () => {
    it('should specify JSON output format', () => {
      const input: InstagramReelInput = {
        transcript: 'Test content.',
        domain: 'tech',
        keywords: ['innovation'],
      };

      const prompt = generateInstagramReelPrompt(input);

      expect(prompt).toContain('OUTPUT FORMAT:');
      expect(prompt).toContain('JSON format');
    });

    it('should include caption structure guidelines', () => {
      const input: InstagramReelInput = {
        transcript: 'Test content.',
        domain: 'business',
        keywords: ['growth'],
      };

      const prompt = generateInstagramReelPrompt(input);

      expect(prompt).toContain('CAPTION STRUCTURE:');
      expect(prompt).toContain('Line 1: Hook');
      expect(prompt).toContain('Line 2-3: Context/story');
      expect(prompt).toContain('Line 4-6: Value/tips');
      expect(prompt).toContain('Line 7: CTA');
      expect(prompt).toContain('Line 8: Hashtags');
    });

    it('should include algorithm optimization requirements', () => {
      const input: InstagramReelInput = {
        transcript: 'Test content.',
        domain: 'entertainment',
        keywords: ['fun'],
      };

      const prompt = generateInstagramReelPrompt(input);

      expect(prompt).toContain("Instagram's algorithm");
      expect(prompt).toContain('watch time');
      expect(prompt).toContain('saves');
      expect(prompt).toContain('shares');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty transcript', () => {
      const input: InstagramReelInput = {
        transcript: '',
        domain: 'general',
        keywords: ['content'],
      };

      const prompt = generateInstagramReelPrompt(input);

      expect(prompt).toBeDefined();
      expect(prompt).toContain('CONTENT:');
    });

    it('should handle very short transcript', () => {
      const input: InstagramReelInput = {
        transcript: 'Hi',
        domain: 'greeting',
        keywords: ['hello'],
      };

      const prompt = generateInstagramReelPrompt(input);

      expect(prompt).toBeDefined();
      expect(prompt).toContain('Hi');
    });

    it('should truncate very long transcript to 1000 characters', () => {
      const longTranscript = 'A'.repeat(2000);
      const input: InstagramReelInput = {
        transcript: longTranscript,
        domain: 'test',
        keywords: ['long'],
      };

      const prompt = generateInstagramReelPrompt(input);

      expect(prompt).toBeDefined();
      // The transcript in the prompt should be truncated
      const contentMatch = prompt.match(/CONTENT:\n(.*?)\n\nDOMAIN:/s);
      if (contentMatch) {
        expect(contentMatch[1].length).toBeLessThanOrEqual(1000);
      }
    });

    it('should handle transcript exactly 1000 characters', () => {
      const transcript = 'B'.repeat(1000);
      const input: InstagramReelInput = {
        transcript,
        domain: 'test',
        keywords: ['exact'],
      };

      const prompt = generateInstagramReelPrompt(input);

      expect(prompt).toBeDefined();
      expect(prompt).toContain(transcript);
    });

    it('should handle empty keywords array', () => {
      const input: InstagramReelInput = {
        transcript: 'Test content.',
        domain: 'general',
        keywords: [],
      };

      const prompt = generateInstagramReelPrompt(input);

      expect(prompt).toBeDefined();
      expect(prompt).toContain('KEYWORDS: ');
    });

    it('should handle keywords with special characters', () => {
      const input: InstagramReelInput = {
        transcript: 'Test content.',
        domain: 'tech',
        keywords: ['#coding', '@developer', 'C++', 'Node.js'],
      };

      const prompt = generateInstagramReelPrompt(input);

      expect(prompt).toContain('#coding, @developer, C++, Node.js');
    });

    it('should handle very long domain name', () => {
      const input: InstagramReelInput = {
        transcript: 'Test content.',
        domain: 'health and wellness and fitness and nutrition and lifestyle',
        keywords: ['health'],
      };

      const prompt = generateInstagramReelPrompt(input);

      expect(prompt).toBeDefined();
      expect(prompt).toContain('health and wellness and fitness and nutrition and lifestyle');
    });

    it('should handle special characters in transcript', () => {
      const input: InstagramReelInput = {
        transcript: 'Test with special chars: @#$%^&*(){}[]|\\:;"<>?,./~`',
        domain: 'tech',
        keywords: ['special'],
      };

      const prompt = generateInstagramReelPrompt(input);

      expect(prompt).toBeDefined();
      expect(prompt).toContain('Test with special chars');
    });

    it('should handle unicode characters in transcript', () => {
      const input: InstagramReelInput = {
        transcript: 'Test with emojis 😀🎉🚀 and unicode characters: café, naïve, 日本語',
        domain: 'international',
        keywords: ['global'],
      };

      const prompt = generateInstagramReelPrompt(input);

      expect(prompt).toBeDefined();
      expect(prompt).toContain('😀🎉🚀');
    });

    it('should handle newlines in transcript', () => {
      const input: InstagramReelInput = {
        transcript: 'Line 1\nLine 2\nLine 3',
        domain: 'test',
        keywords: ['multiline'],
      };

      const prompt = generateInstagramReelPrompt(input);

      expect(prompt).toBeDefined();
      expect(prompt).toContain('Line 1');
    });
  });

  describe('Prompt Structure Validation', () => {
    it('should have clear task definition', () => {
      const input: InstagramReelInput = {
        transcript: 'Test content.',
        domain: 'test',
        keywords: ['test'],
      };

      const prompt = generateInstagramReelPrompt(input);

      expect(prompt).toContain('TASK:');
      expect(prompt).toContain('Create an engaging');
    });

    it('should have all required sections', () => {
      const input: InstagramReelInput = {
        transcript: 'Test content.',
        domain: 'test',
        keywords: ['test'],
      };

      const prompt = generateInstagramReelPrompt(input);

      expect(prompt).toContain('TASK:');
      expect(prompt).toContain('CONTENT:');
      expect(prompt).toContain('DOMAIN:');
      expect(prompt).toContain('KEYWORDS:');
      expect(prompt).toContain('LANGUAGE:');
      expect(prompt).toContain('DURATION:');
      expect(prompt).toContain('OUTPUT FORMAT:');
      expect(prompt).toContain('REQUIREMENTS:');
      expect(prompt).toContain('CAPTION STRUCTURE:');
    });

    it('should include expert role definition', () => {
      const input: InstagramReelInput = {
        transcript: 'Test content.',
        domain: 'marketing',
        keywords: ['social'],
      };

      const prompt = generateInstagramReelPrompt(input);

      expect(prompt).toContain('expert Instagram Reel creator');
      expect(prompt).toContain('specializing in marketing content');
    });

    it('should end with generation instruction', () => {
      const input: InstagramReelInput = {
        transcript: 'Test content.',
        domain: 'test',
        keywords: ['test'],
      };

      const prompt = generateInstagramReelPrompt(input);

      expect(prompt).toContain('Generate the Instagram Reel content now');
    });
  });

  describe('Type Safety', () => {
    it('should accept valid InstagramReelInput type', () => {
      const input: InstagramReelInput = {
        transcript: 'Valid input.',
        domain: 'test',
        keywords: ['valid'],
        language: 'English',
        duration: 30,
      };

      expect(() => generateInstagramReelPrompt(input)).not.toThrow();
    });

    it('should work with minimal required fields', () => {
      const input: InstagramReelInput = {
        transcript: 'Minimal input.',
        domain: 'test',
        keywords: ['minimal'],
      };

      expect(() => generateInstagramReelPrompt(input)).not.toThrow();
    });
  });

  describe('Consistency Tests', () => {
    it('should generate consistent output for same input', () => {
      const input: InstagramReelInput = {
        transcript: 'Consistency test.',
        domain: 'test',
        keywords: ['consistent'],
        duration: 30,
      };

      const prompt1 = generateInstagramReelPrompt(input);
      const prompt2 = generateInstagramReelPrompt(input);

      expect(prompt1).toBe(prompt2);
    });

    it('should generate different output for different durations', () => {
      const baseInput = {
        transcript: 'Test content.',
        domain: 'test',
        keywords: ['test'],
      };

      const prompt15 = generateInstagramReelPrompt({ ...baseInput, duration: 15 });
      const prompt30 = generateInstagramReelPrompt({ ...baseInput, duration: 30 });
      const prompt60 = generateInstagramReelPrompt({ ...baseInput, duration: 60 });
      const prompt90 = generateInstagramReelPrompt({ ...baseInput, duration: 90 });

      expect(prompt15).not.toBe(prompt30);
      expect(prompt30).not.toBe(prompt60);
      expect(prompt60).not.toBe(prompt90);
    });
  });
});
