/**
 * Twitter Thread Prompt Tests
 * 
 * Comprehensive unit tests for the Twitter Thread prompt generator
 * Testing various inputs, thread lengths, edge cases, and platform-specific requirements
 */

import { generateTwitterThreadPrompt, TwitterThreadInput } from '../../prompts/twitter-thread.prompt';

describe('Twitter Thread Prompt Generator', () => {
  describe('Basic Functionality', () => {
    it('should generate a valid prompt with minimal required inputs', () => {
      const input: TwitterThreadInput = {
        transcript: 'This is a test transcript about productivity tips.',
        domain: 'productivity',
        keywords: ['productivity', 'tips', 'efficiency'],
      };

      const result = generateTwitterThreadPrompt(input);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should include all required input fields in the prompt', () => {
      const input: TwitterThreadInput = {
        transcript: 'Test transcript content',
        domain: 'fitness',
        keywords: ['workout', 'health'],
      };

      const result = generateTwitterThreadPrompt(input);

      expect(result).toContain('fitness');
      expect(result).toContain('workout');
      expect(result).toContain('health');
      expect(result).toContain('Test transcript content');
    });

    it('should use default language when not specified', () => {
      const input: TwitterThreadInput = {
        transcript: 'Test content',
        domain: 'tech',
        keywords: ['coding'],
      };

      const result = generateTwitterThreadPrompt(input);

      expect(result).toContain('LANGUAGE: English');
    });

    it('should use custom language when specified', () => {
      const input: TwitterThreadInput = {
        transcript: 'Test content',
        domain: 'tech',
        keywords: ['coding'],
        language: 'Spanish',
      };

      const result = generateTwitterThreadPrompt(input);

      expect(result).toContain('LANGUAGE: Spanish');
    });

    it('should use default thread length when not specified', () => {
      const input: TwitterThreadInput = {
        transcript: 'Test content',
        domain: 'tech',
        keywords: ['coding'],
      };

      const result = generateTwitterThreadPrompt(input);

      expect(result).toContain('THREAD LENGTH: 10 tweets');
      expect(result).toContain('10-tweet thread');
    });

    it('should use custom thread length when specified', () => {
      const input: TwitterThreadInput = {
        transcript: 'Test content',
        domain: 'tech',
        keywords: ['coding'],
        threadLength: 5,
      };

      const result = generateTwitterThreadPrompt(input);

      expect(result).toContain('THREAD LENGTH: 5 tweets');
      expect(result).toContain('5-tweet thread');
    });
  });

  describe('Thread Length Variations', () => {
    it('should handle short threads (3 tweets)', () => {
      const input: TwitterThreadInput = {
        transcript: 'Test content',
        domain: 'tech',
        keywords: ['coding'],
        threadLength: 3,
      };

      const result = generateTwitterThreadPrompt(input);

      expect(result).toContain('3-tweet thread');
      expect(result).toContain('THREAD LENGTH: 3 tweets');
    });

    it('should handle medium threads (10 tweets)', () => {
      const input: TwitterThreadInput = {
        transcript: 'Test content',
        domain: 'tech',
        keywords: ['coding'],
        threadLength: 10,
      };

      const result = generateTwitterThreadPrompt(input);

      expect(result).toContain('10-tweet thread');
      expect(result).toContain('THREAD LENGTH: 10 tweets');
    });

    it('should handle long threads (20 tweets)', () => {
      const input: TwitterThreadInput = {
        transcript: 'Test content',
        domain: 'tech',
        keywords: ['coding'],
        threadLength: 20,
      };

      const result = generateTwitterThreadPrompt(input);

      expect(result).toContain('20-tweet thread');
      expect(result).toContain('THREAD LENGTH: 20 tweets');
    });

    it('should handle very long threads (50 tweets)', () => {
      const input: TwitterThreadInput = {
        transcript: 'Test content',
        domain: 'tech',
        keywords: ['coding'],
        threadLength: 50,
      };

      const result = generateTwitterThreadPrompt(input);

      expect(result).toContain('50-tweet thread');
      expect(result).toContain('THREAD LENGTH: 50 tweets');
    });

    it('should adjust thread structure based on length', () => {
      const input: TwitterThreadInput = {
        transcript: 'Test content',
        domain: 'tech',
        keywords: ['coding'],
        threadLength: 7,
      };

      const result = generateTwitterThreadPrompt(input);

      // Should reference the second-to-last and last tweet positions
      expect(result).toContain('6/');
      expect(result).toContain('7/');
    });
  });

  describe('Domain-Specific Content', () => {
    it('should handle tech domain', () => {
      const input: TwitterThreadInput = {
        transcript: 'Learn JavaScript in 10 tweets.',
        domain: 'technology',
        keywords: ['javascript', 'coding', 'programming'],
      };

      const result = generateTwitterThreadPrompt(input);

      expect(result).toContain('technology');
      expect(result).toContain('javascript');
      expect(result).toContain('coding');
    });

    it('should handle business domain', () => {
      const input: TwitterThreadInput = {
        transcript: 'Top strategies for startup success.',
        domain: 'business',
        keywords: ['startup', 'entrepreneur', 'success'],
      };

      const result = generateTwitterThreadPrompt(input);

      expect(result).toContain('business');
      expect(result).toContain('startup');
      expect(result).toContain('entrepreneur');
    });

    it('should handle marketing domain', () => {
      const input: TwitterThreadInput = {
        transcript: 'Social media marketing tips.',
        domain: 'marketing',
        keywords: ['social media', 'marketing', 'growth'],
      };

      const result = generateTwitterThreadPrompt(input);

      expect(result).toContain('marketing');
      expect(result).toContain('social media');
      expect(result).toContain('growth');
    });

    it('should handle personal development domain', () => {
      const input: TwitterThreadInput = {
        transcript: 'Build better habits in 30 days.',
        domain: 'personal development',
        keywords: ['habits', 'self-improvement', 'growth'],
      };

      const result = generateTwitterThreadPrompt(input);

      expect(result).toContain('personal development');
      expect(result).toContain('habits');
      expect(result).toContain('self-improvement');
    });
  });

  describe('Keyword Handling', () => {
    it('should handle single keyword', () => {
      const input: TwitterThreadInput = {
        transcript: 'Test content',
        domain: 'education',
        keywords: ['learning'],
      };

      const result = generateTwitterThreadPrompt(input);

      expect(result).toContain('learning');
    });

    it('should handle multiple keywords', () => {
      const input: TwitterThreadInput = {
        transcript: 'Test content',
        domain: 'education',
        keywords: ['learning', 'study', 'education', 'tips', 'students'],
      };

      const result = generateTwitterThreadPrompt(input);

      expect(result).toContain('learning');
      expect(result).toContain('study');
      expect(result).toContain('education');
      expect(result).toContain('tips');
      expect(result).toContain('students');
    });

    it('should join keywords with commas', () => {
      const input: TwitterThreadInput = {
        transcript: 'Test content',
        domain: 'tech',
        keywords: ['ai', 'machine learning', 'data'],
      };

      const result = generateTwitterThreadPrompt(input);

      expect(result).toContain('ai, machine learning, data');
    });

    it('should handle keywords with hashtags', () => {
      const input: TwitterThreadInput = {
        transcript: 'Test content',
        domain: 'tech',
        keywords: ['#AI', '#MachineLearning', '#DataScience'],
      };

      const result = generateTwitterThreadPrompt(input);

      expect(result).toContain('#AI');
      expect(result).toContain('#MachineLearning');
      expect(result).toContain('#DataScience');
    });

    it('should handle empty keywords array', () => {
      const input: TwitterThreadInput = {
        transcript: 'Test content',
        domain: 'tech',
        keywords: [],
      };

      const result = generateTwitterThreadPrompt(input);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  describe('Twitter-Specific Requirements', () => {
    it('should include tweet character limit', () => {
      const input: TwitterThreadInput = {
        transcript: 'Test content',
        domain: 'tech',
        keywords: ['coding'],
      };

      const result = generateTwitterThreadPrompt(input);

      expect(result).toContain('max 280 chars');
      expect(result).toContain('Max 280 characters');
    });

    it('should include thread emoji requirement', () => {
      const input: TwitterThreadInput = {
        transcript: 'Test content',
        domain: 'tech',
        keywords: ['coding'],
      };

      const result = generateTwitterThreadPrompt(input);

      expect(result).toContain('🧵');
      expect(result).toContain('Include "🧵" emoji in first tweet');
    });

    it('should include hook requirements for first tweet', () => {
      const input: TwitterThreadInput = {
        transcript: 'Test content',
        domain: 'tech',
        keywords: ['coding'],
      };

      const result = generateTwitterThreadPrompt(input);

      expect(result).toContain('Tweet 1: Must be a scroll-stopper');
      expect(result).toContain('question, bold claim, or shocking stat');
      expect(result).toContain('Hook (question, stat, or bold claim)');
    });

    it('should include CTA requirements', () => {
      const input: TwitterThreadInput = {
        transcript: 'Test content',
        domain: 'tech',
        keywords: ['coding'],
      };

      const result = generateTwitterThreadPrompt(input);

      expect(result).toContain('cta_tweet');
      expect(result).toContain('Strong CTA');
      expect(result).toContain('follow, RT, check link in bio');
    });

    it('should include hashtag guidelines', () => {
      const input: TwitterThreadInput = {
        transcript: 'Test content',
        domain: 'tech',
        keywords: ['coding'],
      };

      const result = generateTwitterThreadPrompt(input);

      expect(result).toContain('hashtags');
      expect(result).toContain('max 2-3 per tweet');
      expect(result).toContain('3-5 relevant hashtags');
    });

    it('should include media suggestions', () => {
      const input: TwitterThreadInput = {
        transcript: 'Test content',
        domain: 'tech',
        keywords: ['coding'],
      };

      const result = generateTwitterThreadPrompt(input);

      expect(result).toContain('media_suggestions');
      expect(result).toContain('image/gif/video');
      expect(result).toContain('2-3 tweets for media attachments');
    });

    it('should include engagement tactics', () => {
      const input: TwitterThreadInput = {
        transcript: 'Test content',
        domain: 'tech',
        keywords: ['coding'],
      };

      const result = generateTwitterThreadPrompt(input);

      expect(result).toContain('ENGAGEMENT TACTICS');
      expect(result).toContain('Ask a question');
      expect(result).toContain('Use "You" language');
    });
  });

  describe('Thread Structure', () => {
    it('should define clear thread structure', () => {
      const input: TwitterThreadInput = {
        transcript: 'Test content',
        domain: 'tech',
        keywords: ['coding'],
        threadLength: 10,
      };

      const result = generateTwitterThreadPrompt(input);

      expect(result).toContain('THREAD STRUCTURE');
      expect(result).toContain('1/: Hook');
      expect(result).toContain('2/: Context');
      expect(result).toContain('8/: Key insight or story');
      expect(result).toContain('9/: Summary of takeaways');
      expect(result).toContain('10/: CTA');
    });

    it('should include tweet numbering format', () => {
      const input: TwitterThreadInput = {
        transcript: 'Test content',
        domain: 'tech',
        keywords: ['coding'],
      };

      const result = generateTwitterThreadPrompt(input);

      expect(result).toContain('Use numbers/bullets for listicles (1/, 2/, 3/ or •)');
    });

    it('should specify tweet purposes', () => {
      const input: TwitterThreadInput = {
        transcript: 'Test content',
        domain: 'tech',
        keywords: ['coding'],
      };

      const result = generateTwitterThreadPrompt(input);

      expect(result).toContain('Grab attention, promise value');
      expect(result).toContain('Set the stage, build credibility');
      expect(result).toContain('Deliver core value');
    });
  });

  describe('Transcript Handling', () => {
    it('should truncate long transcripts to 1500 characters', () => {
      const longTranscript = 'a'.repeat(2000);
      const input: TwitterThreadInput = {
        transcript: longTranscript,
        domain: 'tech',
        keywords: ['coding'],
      };

      const result = generateTwitterThreadPrompt(input);

      // The prompt should contain only the first 1500 characters
      expect(result).toContain('a'.repeat(1500));
      expect(result).not.toContain('a'.repeat(1501));
    });

    it('should handle short transcripts without truncation', () => {
      const shortTranscript = 'Short content for Twitter thread';
      const input: TwitterThreadInput = {
        transcript: shortTranscript,
        domain: 'tech',
        keywords: ['coding'],
      };

      const result = generateTwitterThreadPrompt(input);

      expect(result).toContain(shortTranscript);
    });

    it('should handle transcripts with special characters', () => {
      const input: TwitterThreadInput = {
        transcript: 'Content with special chars: @#$%^&*()_+-=[]{}|;:,.<>?',
        domain: 'tech',
        keywords: ['coding'],
      };

      const result = generateTwitterThreadPrompt(input);

      expect(result).toContain('@#$%^&*()_+-=[]{}|;:,.<>?');
    });

    it('should handle transcripts with newlines', () => {
      const input: TwitterThreadInput = {
        transcript: 'Line 1\nLine 2\nLine 3',
        domain: 'tech',
        keywords: ['coding'],
      };

      const result = generateTwitterThreadPrompt(input);

      expect(result).toContain('Line 1\nLine 2\nLine 3');
    });

    it('should handle empty transcript', () => {
      const input: TwitterThreadInput = {
        transcript: '',
        domain: 'tech',
        keywords: ['coding'],
      };

      const result = generateTwitterThreadPrompt(input);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle transcripts with URLs', () => {
      const input: TwitterThreadInput = {
        transcript: 'Check out https://example.com for more info',
        domain: 'tech',
        keywords: ['coding'],
      };

      const result = generateTwitterThreadPrompt(input);

      expect(result).toContain('https://example.com');
    });

    it('should handle transcripts with mentions', () => {
      const input: TwitterThreadInput = {
        transcript: 'Thanks to @user for the inspiration',
        domain: 'tech',
        keywords: ['coding'],
      };

      const result = generateTwitterThreadPrompt(input);

      expect(result).toContain('@user');
    });
  });

  describe('Language Support', () => {
    it('should support Spanish', () => {
      const input: TwitterThreadInput = {
        transcript: 'Contenido de prueba',
        domain: 'educación',
        keywords: ['aprendizaje'],
        language: 'Spanish',
      };

      const result = generateTwitterThreadPrompt(input);

      expect(result).toContain('LANGUAGE: Spanish');
    });

    it('should support French', () => {
      const input: TwitterThreadInput = {
        transcript: 'Contenu de test',
        domain: 'éducation',
        keywords: ['apprentissage'],
        language: 'French',
      };

      const result = generateTwitterThreadPrompt(input);

      expect(result).toContain('LANGUAGE: French');
    });

    it('should support German', () => {
      const input: TwitterThreadInput = {
        transcript: 'Testinhalt',
        domain: 'Bildung',
        keywords: ['Lernen'],
        language: 'German',
      };

      const result = generateTwitterThreadPrompt(input);

      expect(result).toContain('LANGUAGE: German');
    });

    it('should support Portuguese', () => {
      const input: TwitterThreadInput = {
        transcript: 'Conteúdo de teste',
        domain: 'educação',
        keywords: ['aprendizagem'],
        language: 'Portuguese',
      };

      const result = generateTwitterThreadPrompt(input);

      expect(result).toContain('LANGUAGE: Portuguese');
    });

    it('should support Japanese', () => {
      const input: TwitterThreadInput = {
        transcript: 'テストコンテンツ',
        domain: '教育',
        keywords: ['学習'],
        language: 'Japanese',
      };

      const result = generateTwitterThreadPrompt(input);

      expect(result).toContain('LANGUAGE: Japanese');
    });
  });

  describe('Output Format Requirements', () => {
    it('should specify JSON output format', () => {
      const input: TwitterThreadInput = {
        transcript: 'Test content',
        domain: 'tech',
        keywords: ['coding'],
      };

      const result = generateTwitterThreadPrompt(input);

      expect(result).toContain('OUTPUT FORMAT');
      expect(result).toContain('JSON format');
    });

    it('should include all required output fields', () => {
      const input: TwitterThreadInput = {
        transcript: 'Test content',
        domain: 'tech',
        keywords: ['coding'],
      };

      const result = generateTwitterThreadPrompt(input);

      const requiredFields = [
        'thread',
        'tweet_number',
        'content',
        'purpose',
        'engagement_tactic',
        'hashtags',
        'mentions',
        'media_suggestions',
        'cta_tweet',
        'engagement_hooks',
        'thread_summary',
      ];

      requiredFields.forEach(field => {
        expect(result).toContain(field);
      });
    });

    it('should include viral elements section', () => {
      const input: TwitterThreadInput = {
        transcript: 'Test content',
        domain: 'tech',
        keywords: ['coding'],
      };

      const result = generateTwitterThreadPrompt(input);

      expect(result).toContain('VIRAL ELEMENTS');
      expect(result).toContain('Contrarian take');
      expect(result).toContain('Actionable tips');
      expect(result).toContain('Relatable pain points');
    });
  });

  describe('Edge Cases', () => {
    it('should handle thread length of 1', () => {
      const input: TwitterThreadInput = {
        transcript: 'Test content',
        domain: 'tech',
        keywords: ['coding'],
        threadLength: 1,
      };

      const result = generateTwitterThreadPrompt(input);

      expect(result).toContain('1-tweet thread');
      expect(result).toContain('THREAD LENGTH: 1 tweets');
    });

    it('should handle thread length of 100', () => {
      const input: TwitterThreadInput = {
        transcript: 'Test content',
        domain: 'tech',
        keywords: ['coding'],
        threadLength: 100,
      };

      const result = generateTwitterThreadPrompt(input);

      expect(result).toContain('100-tweet thread');
      expect(result).toContain('THREAD LENGTH: 100 tweets');
    });

    it('should handle very long domain names', () => {
      const input: TwitterThreadInput = {
        transcript: 'Test content',
        domain: 'very long domain name with multiple words and spaces',
        keywords: ['test'],
      };

      const result = generateTwitterThreadPrompt(input);

      expect(result).toContain('very long domain name with multiple words and spaces');
    });

    it('should handle domain with special characters', () => {
      const input: TwitterThreadInput = {
        transcript: 'Test content',
        domain: 'tech & innovation',
        keywords: ['tech'],
      };

      const result = generateTwitterThreadPrompt(input);

      expect(result).toContain('tech & innovation');
    });

    it('should handle Unicode characters in transcript', () => {
      const input: TwitterThreadInput = {
        transcript: 'Content with emojis 🎉🚀💡 and symbols ™️®️©️',
        domain: 'tech',
        keywords: ['coding'],
      };

      const result = generateTwitterThreadPrompt(input);

      expect(result).toContain('🎉🚀💡');
      expect(result).toContain('™️®️©️');
    });

    it('should handle transcript at exactly 1500 characters', () => {
      const exactTranscript = 'a'.repeat(1500);
      const input: TwitterThreadInput = {
        transcript: exactTranscript,
        domain: 'tech',
        keywords: ['coding'],
      };

      const result = generateTwitterThreadPrompt(input);

      expect(result).toContain('a'.repeat(1500));
    });
  });

  describe('Integration Tests', () => {
    it('should generate complete prompt with all optional parameters', () => {
      const input: TwitterThreadInput = {
        transcript: 'Complete test transcript with all parameters included for a comprehensive Twitter thread.',
        domain: 'productivity',
        keywords: ['productivity', 'tips', 'efficiency', 'work'],
        language: 'English',
        threadLength: 15,
      };

      const result = generateTwitterThreadPrompt(input);

      expect(result).toContain('productivity');
      expect(result).toContain('productivity, tips, efficiency, work');
      expect(result).toContain('LANGUAGE: English');
      expect(result).toContain('THREAD LENGTH: 15 tweets');
      expect(result).toContain('15-tweet thread');
      expect(result).toContain('Complete test transcript');
    });

    it('should maintain consistent structure across different inputs', () => {
      const inputs: TwitterThreadInput[] = [
        {
          transcript: 'Fitness content',
          domain: 'fitness',
          keywords: ['workout'],
          threadLength: 5,
        },
        {
          transcript: 'Tech content',
          domain: 'technology',
          keywords: ['coding'],
          threadLength: 10,
        },
        {
          transcript: 'Business content',
          domain: 'business',
          keywords: ['startup'],
          threadLength: 20,
        },
      ];

      const results = inputs.map(input => generateTwitterThreadPrompt(input));

      results.forEach(result => {
        expect(result).toContain('OUTPUT FORMAT');
        expect(result).toContain('REQUIREMENTS');
        expect(result).toContain('THREAD STRUCTURE');
        expect(result).toContain('ENGAGEMENT TACTICS');
        expect(result).toContain('VIRAL ELEMENTS');
      });
    });

    it('should handle realistic use case with mixed content', () => {
      const input: TwitterThreadInput = {
        transcript: `
          In this video, I share 10 productivity tips that changed my life.
          From time management to focus techniques, these strategies will help you
          get more done in less time. Let's dive into each one and see how you can
          apply them to your daily routine.
        `,
        domain: 'productivity',
        keywords: ['productivity', 'time management', 'focus', 'efficiency', 'tips'],
        language: 'English',
        threadLength: 12,
      };

      const result = generateTwitterThreadPrompt(input);

      expect(result).toContain('productivity');
      expect(result).toContain('time management');
      expect(result).toContain('12-tweet thread');
      expect(result).toContain('10 productivity tips');
    });
  });

  describe('Readability and Formatting', () => {
    it('should include line break guidance', () => {
      const input: TwitterThreadInput = {
        transcript: 'Test content',
        domain: 'tech',
        keywords: ['coding'],
      };

      const result = generateTwitterThreadPrompt(input);

      expect(result).toContain('Use line breaks for readability');
      expect(result).toContain('not wall of text');
    });

    it('should include credibility building guidance', () => {
      const input: TwitterThreadInput = {
        transcript: 'Test content',
        domain: 'tech',
        keywords: ['coding'],
      };

      const result = generateTwitterThreadPrompt(input);

      expect(result).toContain('Tweet 2-3: Build credibility and context');
      expect(result).toContain('Set the stage, build credibility');
    });

    it('should include value delivery guidance', () => {
      const input: TwitterThreadInput = {
        transcript: 'Test content',
        domain: 'tech',
        keywords: ['coding'],
      };

      const result = generateTwitterThreadPrompt(input);

      expect(result).toContain('Middle tweets: Deliver core value');
      expect(result).toContain('tips, insights, story');
    });

    it('should include summary guidance', () => {
      const input: TwitterThreadInput = {
        transcript: 'Test content',
        domain: 'tech',
        keywords: ['coding'],
      };

      const result = generateTwitterThreadPrompt(input);

      expect(result).toContain('Second-to-last tweet: Summarize key takeaways');
      expect(result).toContain('Summary of takeaways');
    });
  });
});
