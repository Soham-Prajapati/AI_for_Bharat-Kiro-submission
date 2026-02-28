/**
 * TikTok Prompt Tests
 * 
 * Comprehensive unit tests for the TikTok prompt generator
 * Testing various inputs, edge cases, and platform-specific requirements
 */

import { generateYouTubeShortPrompt, YouTubeShortInput } from '../../prompts/tiktok.prompt';

describe('TikTok Prompt Generator', () => {
  describe('Basic Functionality', () => {
    it('should generate a valid prompt with minimal required inputs', () => {
      const input: YouTubeShortInput = {
        transcript: 'This is a test transcript about productivity tips.',
        domain: 'productivity',
        keywords: ['productivity', 'tips', 'efficiency'],
      };

      const result = generateYouTubeShortPrompt(input);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should include all required input fields in the prompt', () => {
      const input: YouTubeShortInput = {
        transcript: 'Test transcript content',
        domain: 'fitness',
        keywords: ['workout', 'health'],
      };

      const result = generateYouTubeShortPrompt(input);

      expect(result).toContain('fitness');
      expect(result).toContain('workout');
      expect(result).toContain('health');
      expect(result).toContain('Test transcript content');
    });

    it('should use default language when not specified', () => {
      const input: YouTubeShortInput = {
        transcript: 'Test content',
        domain: 'tech',
        keywords: ['coding'],
      };

      const result = generateYouTubeShortPrompt(input);

      expect(result).toContain('LANGUAGE: English');
    });

    it('should use custom language when specified', () => {
      const input: YouTubeShortInput = {
        transcript: 'Test content',
        domain: 'tech',
        keywords: ['coding'],
        language: 'Spanish',
      };

      const result = generateYouTubeShortPrompt(input);

      expect(result).toContain('LANGUAGE: Spanish');
    });
  });

  describe('Domain-Specific Content', () => {
    it('should handle fitness domain', () => {
      const input: YouTubeShortInput = {
        transcript: 'Here are 5 exercises to build muscle fast.',
        domain: 'fitness',
        keywords: ['workout', 'muscle', 'exercise'],
      };

      const result = generateYouTubeShortPrompt(input);

      expect(result).toContain('fitness');
      expect(result).toContain('workout');
      expect(result).toContain('muscle');
    });

    it('should handle tech domain', () => {
      const input: YouTubeShortInput = {
        transcript: 'Learn JavaScript in 60 seconds.',
        domain: 'technology',
        keywords: ['javascript', 'coding', 'programming'],
      };

      const result = generateYouTubeShortPrompt(input);

      expect(result).toContain('technology');
      expect(result).toContain('javascript');
      expect(result).toContain('coding');
    });

    it('should handle cooking domain', () => {
      const input: YouTubeShortInput = {
        transcript: 'Quick recipe for chocolate cake.',
        domain: 'cooking',
        keywords: ['recipe', 'baking', 'dessert'],
      };

      const result = generateYouTubeShortPrompt(input);

      expect(result).toContain('cooking');
      expect(result).toContain('recipe');
      expect(result).toContain('baking');
    });

    it('should handle business domain', () => {
      const input: YouTubeShortInput = {
        transcript: 'Top 3 strategies for startup success.',
        domain: 'business',
        keywords: ['startup', 'entrepreneur', 'success'],
      };

      const result = generateYouTubeShortPrompt(input);

      expect(result).toContain('business');
      expect(result).toContain('startup');
      expect(result).toContain('entrepreneur');
    });
  });

  describe('Keyword Handling', () => {
    it('should handle single keyword', () => {
      const input: YouTubeShortInput = {
        transcript: 'Test content',
        domain: 'education',
        keywords: ['learning'],
      };

      const result = generateYouTubeShortPrompt(input);

      expect(result).toContain('learning');
    });

    it('should handle multiple keywords', () => {
      const input: YouTubeShortInput = {
        transcript: 'Test content',
        domain: 'education',
        keywords: ['learning', 'study', 'education', 'tips', 'students'],
      };

      const result = generateYouTubeShortPrompt(input);

      expect(result).toContain('learning');
      expect(result).toContain('study');
      expect(result).toContain('education');
      expect(result).toContain('tips');
      expect(result).toContain('students');
    });

    it('should join keywords with commas', () => {
      const input: YouTubeShortInput = {
        transcript: 'Test content',
        domain: 'tech',
        keywords: ['ai', 'machine learning', 'data'],
      };

      const result = generateYouTubeShortPrompt(input);

      expect(result).toContain('ai, machine learning, data');
    });

    it('should handle keywords with special characters', () => {
      const input: YouTubeShortInput = {
        transcript: 'Test content',
        domain: 'tech',
        keywords: ['C++', 'Node.js', 'React.js'],
      };

      const result = generateYouTubeShortPrompt(input);

      expect(result).toContain('C++');
      expect(result).toContain('Node.js');
      expect(result).toContain('React.js');
    });
  });

  describe('Trending Content', () => {
    it('should include trending element when provided', () => {
      const input: YouTubeShortInput = {
        transcript: 'Test content',
        domain: 'entertainment',
        keywords: ['funny', 'viral'],
        trend: 'dance challenge',
      };

      const result = generateYouTubeShortPrompt(input);

      expect(result).toContain('TRENDING: dance challenge');
      expect(result).toContain('Incorporate the trending element: dance challenge');
    });

    it('should not include trending section when not provided', () => {
      const input: YouTubeShortInput = {
        transcript: 'Test content',
        domain: 'entertainment',
        keywords: ['funny'],
      };

      const result = generateYouTubeShortPrompt(input);

      expect(result).not.toContain('TRENDING:');
      expect(result).not.toContain('Incorporate the trending element:');
    });

    it('should handle various trending formats', () => {
      const trends = [
        'viral sound',
        'transition effect',
        'duet challenge',
        'green screen trend',
        'POV format',
      ];

      trends.forEach(trend => {
        const input: YouTubeShortInput = {
          transcript: 'Test content',
          domain: 'entertainment',
          keywords: ['viral'],
          trend,
        };

        const result = generateYouTubeShortPrompt(input);
        expect(result).toContain(`TRENDING: ${trend}`);
      });
    });
  });

  describe('TikTok-Specific Requirements', () => {
    it('should include hook requirements', () => {
      const input: YouTubeShortInput = {
        transcript: 'Test content',
        domain: 'tech',
        keywords: ['coding'],
      };

      const result = generateYouTubeShortPrompt(input);

      expect(result).toContain('hook');
      expect(result).toContain('Hook must be INSTANT (1 second max to grab attention)');
      expect(result).toContain('Pattern interrupt (first 1 second)');
    });

    it('should include caption requirements', () => {
      const input: YouTubeShortInput = {
        transcript: 'Test content',
        domain: 'tech',
        keywords: ['coding'],
      };

      const result = generateYouTubeShortPrompt(input);

      expect(result).toContain('caption');
      expect(result).toContain('max 150 chars');
      expect(result).toContain('Caption should be curiosity-inducing or relatable');
    });

    it('should include hashtag strategy', () => {
      const input: YouTubeShortInput = {
        transcript: 'Test content',
        domain: 'fitness',
        keywords: ['workout'],
      };

      const result = generateYouTubeShortPrompt(input);

      expect(result).toContain('hashtags');
      expect(result).toContain('#FYP');
      expect(result).toContain('#ForYou');
      expect(result).toContain('#ForYouPage');
      expect(result).toContain('HASHTAG STRATEGY');
    });

    it('should include text overlay requirements', () => {
      const input: YouTubeShortInput = {
        transcript: 'Test content',
        domain: 'tech',
        keywords: ['coding'],
      };

      const result = generateYouTubeShortPrompt(input);

      expect(result).toContain('text_overlays');
      expect(result).toContain('Text overlays should be easy to read');
    });

    it('should include CTA requirements', () => {
      const input: YouTubeShortInput = {
        transcript: 'Test content',
        domain: 'tech',
        keywords: ['coding'],
      };

      const result = generateYouTubeShortPrompt(input);

      expect(result).toContain('cta');
      expect(result).toContain('Call-to-action');
      expect(result).toContain('follow, duet, stitch, comment');
    });

    it('should include viral formula', () => {
      const input: YouTubeShortInput = {
        transcript: 'Test content',
        domain: 'tech',
        keywords: ['coding'],
      };

      const result = generateYouTubeShortPrompt(input);

      expect(result).toContain('VIRAL FORMULA');
      expect(result).toContain('Pattern interrupt');
      expect(result).toContain('Relatability or curiosity');
      expect(result).toContain('Value delivery');
      expect(result).toContain('Satisfying payoff');
    });

    it('should include script timing structure', () => {
      const input: YouTubeShortInput = {
        transcript: 'Test content',
        domain: 'tech',
        keywords: ['coding'],
      };

      const result = generateYouTubeShortPrompt(input);

      expect(result).toContain('script');
      expect(result).toContain('0-1s');
      expect(result).toContain('1-5s');
      expect(result).toContain('5-15s');
      expect(result).toContain('15-20s');
      expect(result).toContain('20-25s');
    });
  });

  describe('Transcript Handling', () => {
    it('should truncate long transcripts to 800 characters', () => {
      const longTranscript = 'a'.repeat(1500);
      const input: YouTubeShortInput = {
        transcript: longTranscript,
        domain: 'tech',
        keywords: ['coding'],
      };

      const result = generateYouTubeShortPrompt(input);

      // The prompt should contain only the first 800 characters
      expect(result).toContain('a'.repeat(800));
      expect(result).not.toContain('a'.repeat(801));
    });

    it('should handle short transcripts without truncation', () => {
      const shortTranscript = 'Short content';
      const input: YouTubeShortInput = {
        transcript: shortTranscript,
        domain: 'tech',
        keywords: ['coding'],
      };

      const result = generateYouTubeShortPrompt(input);

      expect(result).toContain(shortTranscript);
    });

    it('should handle transcripts with special characters', () => {
      const input: YouTubeShortInput = {
        transcript: 'Content with special chars: @#$%^&*()_+-=[]{}|;:,.<>?',
        domain: 'tech',
        keywords: ['coding'],
      };

      const result = generateYouTubeShortPrompt(input);

      expect(result).toContain('@#$%^&*()_+-=[]{}|;:,.<>?');
    });

    it('should handle transcripts with newlines', () => {
      const input: YouTubeShortInput = {
        transcript: 'Line 1\nLine 2\nLine 3',
        domain: 'tech',
        keywords: ['coding'],
      };

      const result = generateYouTubeShortPrompt(input);

      expect(result).toContain('Line 1\nLine 2\nLine 3');
    });

    it('should handle empty transcript', () => {
      const input: YouTubeShortInput = {
        transcript: '',
        domain: 'tech',
        keywords: ['coding'],
      };

      const result = generateYouTubeShortPrompt(input);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  describe('Language Support', () => {
    it('should support Spanish', () => {
      const input: YouTubeShortInput = {
        transcript: 'Contenido de prueba',
        domain: 'educación',
        keywords: ['aprendizaje'],
        language: 'Spanish',
      };

      const result = generateYouTubeShortPrompt(input);

      expect(result).toContain('LANGUAGE: Spanish');
    });

    it('should support French', () => {
      const input: YouTubeShortInput = {
        transcript: 'Contenu de test',
        domain: 'éducation',
        keywords: ['apprentissage'],
        language: 'French',
      };

      const result = generateYouTubeShortPrompt(input);

      expect(result).toContain('LANGUAGE: French');
    });

    it('should support German', () => {
      const input: YouTubeShortInput = {
        transcript: 'Testinhalt',
        domain: 'Bildung',
        keywords: ['Lernen'],
        language: 'German',
      };

      const result = generateYouTubeShortPrompt(input);

      expect(result).toContain('LANGUAGE: German');
    });

    it('should support Japanese', () => {
      const input: YouTubeShortInput = {
        transcript: 'テストコンテンツ',
        domain: '教育',
        keywords: ['学習'],
        language: 'Japanese',
      };

      const result = generateYouTubeShortPrompt(input);

      expect(result).toContain('LANGUAGE: Japanese');
    });
  });

  describe('Output Format Requirements', () => {
    it('should specify JSON output format', () => {
      const input: YouTubeShortInput = {
        transcript: 'Test content',
        domain: 'tech',
        keywords: ['coding'],
      };

      const result = generateYouTubeShortPrompt(input);

      expect(result).toContain('OUTPUT FORMAT');
      expect(result).toContain('JSON format');
    });

    it('should include all required output fields', () => {
      const input: YouTubeShortInput = {
        transcript: 'Test content',
        domain: 'tech',
        keywords: ['coding'],
      };

      const result = generateYouTubeShortPrompt(input);

      const requiredFields = [
        'caption',
        'hook',
        'hashtags',
        'sounds',
        'text_overlays',
        'transitions',
        'cta',
        'viral_elements',
        'script',
      ];

      requiredFields.forEach(field => {
        expect(result).toContain(field);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long domain names', () => {
      const input: YouTubeShortInput = {
        transcript: 'Test content',
        domain: 'very long domain name with multiple words and spaces',
        keywords: ['test'],
      };

      const result = generateYouTubeShortPrompt(input);

      expect(result).toContain('very long domain name with multiple words and spaces');
    });

    it('should handle empty keywords array', () => {
      const input: YouTubeShortInput = {
        transcript: 'Test content',
        domain: 'tech',
        keywords: [],
      };

      const result = generateYouTubeShortPrompt(input);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle domain with special characters', () => {
      const input: YouTubeShortInput = {
        transcript: 'Test content',
        domain: 'tech & innovation',
        keywords: ['tech'],
      };

      const result = generateYouTubeShortPrompt(input);

      expect(result).toContain('tech & innovation');
    });

    it('should handle very long trend descriptions', () => {
      const input: YouTubeShortInput = {
        transcript: 'Test content',
        domain: 'entertainment',
        keywords: ['viral'],
        trend: 'This is a very long trending description that includes multiple details about the trend and how it should be incorporated into the content',
      };

      const result = generateYouTubeShortPrompt(input);

      expect(result).toContain('This is a very long trending description');
    });

    it('should handle Unicode characters in transcript', () => {
      const input: YouTubeShortInput = {
        transcript: 'Content with emojis 🎉🚀💡 and symbols ™️®️©️',
        domain: 'tech',
        keywords: ['coding'],
      };

      const result = generateYouTubeShortPrompt(input);

      expect(result).toContain('🎉🚀💡');
      expect(result).toContain('™️®️©️');
    });
  });

  describe('Integration Tests', () => {
    it('should generate complete prompt with all optional parameters', () => {
      const input: YouTubeShortInput = {
        transcript: 'Complete test transcript with all parameters included.',
        domain: 'productivity',
        keywords: ['productivity', 'tips', 'efficiency', 'work'],
        language: 'English',
        trend: 'morning routine challenge',
      };

      const result = generateYouTubeShortPrompt(input);

      expect(result).toContain('productivity');
      expect(result).toContain('productivity, tips, efficiency, work');
      expect(result).toContain('LANGUAGE: English');
      expect(result).toContain('TRENDING: morning routine challenge');
      expect(result).toContain('Complete test transcript');
    });

    it('should maintain consistent structure across different inputs', () => {
      const inputs: YouTubeShortInput[] = [
        {
          transcript: 'Fitness content',
          domain: 'fitness',
          keywords: ['workout'],
        },
        {
          transcript: 'Tech content',
          domain: 'technology',
          keywords: ['coding'],
        },
        {
          transcript: 'Cooking content',
          domain: 'cooking',
          keywords: ['recipe'],
        },
      ];

      const results = inputs.map(input => generateYouTubeShortPrompt(input));

      results.forEach(result => {
        expect(result).toContain('OUTPUT FORMAT');
        expect(result).toContain('REQUIREMENTS');
        expect(result).toContain('VIRAL FORMULA');
        expect(result).toContain('HASHTAG STRATEGY');
      });
    });
  });
});

