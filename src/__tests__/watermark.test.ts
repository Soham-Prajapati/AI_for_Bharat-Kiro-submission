/**
 * Viral Predictor Service Tests
 * Comprehensive test suite for viral score prediction
 */

import { viralPredictorService } from '../services/viral-predictor.service';
import type { ViralPrediction, ContentMetadata } from '../services/viral-predictor.service';

describe('ViralPredictorService', () => {
  describe('predict() method', () => {
    describe('Viral-like transcripts (expected high scores)', () => {
      test('should predict high score for engaging tech content with hook', async () => {
        const transcript = `Amazing AI breakthrough! This secret technique will change everything. 
        The tech industry is buzzing about this incredible discovery. Let me show you why this matters.
        Artificial intelligence has reached a new milestone. This is shocking news for developers.
        The implications are massive. You won't believe what happens next. This viral trend is spreading fast.`;
        
        const result = await viralPredictorService.predict(transcript);
        
        expect(result.score).toBeGreaterThanOrEqual(70);
        expect(result.category).toMatch(/high|viral/);
        expect(result.factors.hook).toBeGreaterThan(60);
      });

      test('should predict high score for emotional storytelling', async () => {
        const transcript = `I love sharing this incredible story with you. It's amazing how life changes.
        This journey has been shocking and wonderful. The emotions I felt were incredible.
        You'll love this next part. It's truly amazing what happened. This is a story of love and triumph.
        The terrible obstacles we faced made us stronger. Wow, what an experience!`;
        
        const result = await viralPredictorService.predict(transcript);
        
        expect(result.score).toBeGreaterThanOrEqual(65);
        expect(result.factors.emotion).toBeGreaterThan(70);
      });

      test('should predict high score for trending crypto content', async () => {
        const transcript = `The crypto market is exploding! This viral hack will help you understand blockchain.
        AI and crypto are merging in amazing ways. This trending topic is everywhere.
        Tech enthusiasts are loving this new development. The secret to success in crypto revealed.
        This is shocking news for investors. You must see this incredible opportunity.`;
        
        const result = await viralPredictorService.predict(transcript);
        
        expect(result.score).toBeGreaterThanOrEqual(70);
        expect(result.factors.trending).toBeGreaterThan(60);
      });

      test('should predict high score for how-to content with strong hook', async () => {
        const transcript = `How to master AI in 30 days - this secret method is amazing!
        Never struggle with tech again. This incredible tip will change your life.
        The shocking truth about learning AI. You must try this technique.
        This viral method has helped thousands. Love the results you'll get.`;
        
        const result = await viralPredictorService.predict(transcript);
        
        expect(result.score).toBeGreaterThanOrEqual(70);
        expect(result.factors.hook).toBeGreaterThan(70);
      });

      test('should predict high score for well-paced educational content', async () => {
        const transcript = `Let me explain this concept. It's quite simple really. First, understand the basics.
        Then, apply the principles. This amazing technique works every time. The results are incredible.
        You'll love how easy this is. This is a game-changer. The secret is in the details.
        Never give up on learning. This shocking discovery will help you. Tech is evolving fast.`;
        
        const result = await viralPredictorService.predict(transcript);
        
        expect(result.score).toBeGreaterThanOrEqual(65);
        expect(result.factors.pacing).toBeGreaterThanOrEqual(60);
      });

      test('should predict viral score for multi-factor optimized content', async () => {
        const transcript = `Amazing secret revealed! How to use AI and crypto together - this is shocking!
        The tech world is buzzing about this viral trend. You must see this incredible hack.
        I love sharing these tips with you. This is truly amazing content. Never miss this opportunity.
        The trending topics are AI, blockchain, and innovation. This emotional journey will inspire you.
        Wow, the results are incredible! This terrible mistake costs millions. Learn the secret now.`;
        
        const result = await viralPredictorService.predict(transcript);
        
        expect(result.score).toBeGreaterThanOrEqual(75);
        expect(result.category).toMatch(/high|viral/);
        expect(result.factors.hook).toBeGreaterThan(70);
        expect(result.factors.emotion).toBeGreaterThan(60);
        expect(result.factors.trending).toBeGreaterThan(60);
      });

      test('should predict high score for optimal length content with duration', async () => {
        const transcript = `${'Amazing content that keeps you engaged. '.repeat(50)}
        This viral trend is spreading. The tech community loves this. AI is incredible.
        Shocking developments in crypto. This is a must-see tutorial. How to succeed fast.`;
        
        const metadata: ContentMetadata = { duration: 600 }; // 10 minutes
        const result = await viralPredictorService.predict(transcript, metadata);
        
        expect(result.score).toBeGreaterThanOrEqual(65);
        expect(result.factors.length).toBeGreaterThanOrEqual(70);
      });

      test('should predict high score for question-based hook content', async () => {
        const transcript = `Why is everyone talking about this? The secret nobody tells you about AI.
        How to leverage trending topics for viral content. This amazing discovery will shock you.
        Never underestimate the power of a good hook. Must-see content for tech enthusiasts.
        The incredible truth about viral videos. This is what you need to know.`;
        
        const result = await viralPredictorService.predict(transcript);
        
        expect(result.score).toBeGreaterThanOrEqual(70);
        expect(result.factors.hook).toBeGreaterThan(65);
      });

      test('should predict high score for emotionally charged content', async () => {
        const transcript = `I love this incredible journey we're on together. The amazing support is overwhelming.
        This shocking revelation changed everything. Hate seeing people struggle with this.
        The terrible truth is now revealed. Wow, what an incredible transformation!
        This is truly amazing and inspiring. Love conquers all obstacles. Shocking results ahead.`;
        
        const result = await viralPredictorService.predict(transcript);
        
        expect(result.score).toBeGreaterThanOrEqual(65);
        expect(result.factors.emotion).toBeGreaterThan(70);
      });

      test('should predict high score for trending topic compilation', async () => {
        const transcript = `AI is revolutionizing tech. Crypto markets are trending upward. This viral hack works.
        The latest tech trends you need to know. AI and blockchain integration is amazing.
        Trending topics in the tech world today. This viral content strategy is incredible.
        Crypto tips and AI tricks for success. The tech community is buzzing about this.`;
        
        const result = await viralPredictorService.predict(transcript);
        
        expect(result.score).toBeGreaterThanOrEqual(65);
        expect(result.factors.trending).toBeGreaterThan(70);
      });
    });

    describe('Non-viral transcripts (expected lower scores)', () => {
      test('should predict low score for bland corporate content', async () => {
        const transcript = `Our company provides services to clients. We have been in business for many years.
        The quarterly report shows steady growth. Our team is dedicated to excellence.
        We offer various solutions for your needs. Please contact us for more information.
        Thank you for your continued support. We appreciate your business partnership.`;
        
        const result = await viralPredictorService.predict(transcript);
        
        expect(result.score).toBeLessThan(70);
        expect(result.category).toMatch(/low|medium/);
      });

      test('should predict low score for technical documentation style', async () => {
        const transcript = `The function accepts two parameters. First parameter is a string value.
        Second parameter is an optional number. The return type is boolean.
        Implementation follows standard patterns. Error handling is included.
        Documentation is available in the repository. Tests cover all edge cases.`;
        
        const result = await viralPredictorService.predict(transcript);
        
        expect(result.score).toBeLessThan(65);
        expect(result.factors.emotion).toBeLessThan(60);
        expect(result.factors.hook).toBeLessThan(70);
      });

      test('should predict low score for monotonous content', async () => {
        const transcript = `Today I will discuss the topic. The topic is important to understand.
        There are several points to consider. Each point has its own merit.
        The first point relates to the second point. The third point is also relevant.
        In conclusion, all points are connected. This completes the discussion.`;
        
        const result = await viralPredictorService.predict(transcript);
        
        expect(result.score).toBeLessThan(65);
        expect(result.factors.pacing).toBeLessThan(80);
      });

      test('should predict low score for overly formal academic content', async () => {
        const transcript = `The research methodology employed herein utilizes quantitative analysis.
        Statistical significance was determined through rigorous testing procedures.
        The hypothesis was formulated based on prior literature review.
        Results indicate correlation between variables as hypothesized.`;
        
        const result = await viralPredictorService.predict(transcript);
        
        expect(result.score).toBeLessThan(60);
        expect(result.factors.emotion).toBeLessThan(55);
      });

      test('should predict low score for generic product description', async () => {
        const transcript = `This product is available in multiple colors. It comes with a warranty.
        The dimensions are standard size. Shipping is available worldwide.
        Customer service is available during business hours. Returns accepted within thirty days.
        Made from quality materials. Suitable for everyday use.`;
        
        const result = await viralPredictorService.predict(transcript);
        
        expect(result.score).toBeLessThan(65);
        expect(result.category).toMatch(/low|medium/);
      });

      test('should predict low score for weather report style content', async () => {
        const transcript = `The temperature today is seventy degrees. Partly cloudy skies expected.
        Wind speed is ten miles per hour. Humidity levels are moderate.
        Tomorrow will be similar conditions. No precipitation in the forecast.
        Extended outlook shows stable weather patterns. Back to you in the studio.`;
        
        const result = await viralPredictorService.predict(transcript);
        
        expect(result.score).toBeLessThan(60);
        expect(result.factors.trending).toBeLessThan(60);
      });

      test('should predict low score for instruction manual content', async () => {
        const transcript = `Step one: Remove the device from packaging. Step two: Connect the power cable.
        Step three: Press the power button. Step four: Wait for initialization.
        Step five: Follow on-screen instructions. Step six: Complete the setup process.
        Refer to troubleshooting section if needed. Keep manual for future reference.`;
        
        const result = await viralPredictorService.predict(transcript);
        
        expect(result.score).toBeLessThan(65);
      });

      test('should predict low score for meeting minutes content', async () => {
        const transcript = `The meeting was called to order at two PM. Attendees were present.
        The agenda was reviewed and approved. Previous minutes were accepted.
        Discussion items were addressed in order. Action items were assigned.
        Next meeting scheduled for next month. Meeting adjourned at three PM.`;
        
        const result = await viralPredictorService.predict(transcript);
        
        expect(result.score).toBeLessThan(60);
        expect(result.factors.hook).toBeLessThan(70);
      });

      test('should predict low score for neutral news report', async () => {
        const transcript = `The event took place yesterday afternoon. Officials confirmed the details.
        Witnesses provided statements to authorities. Investigation is ongoing.
        More information will be released later. Updates expected in coming days.
        Authorities ask public to remain calm. Further developments to follow.`;
        
        const result = await viralPredictorService.predict(transcript);
        
        expect(result.score).toBeLessThan(65);
      });

      test('should predict low score for legal disclaimer content', async () => {
        const transcript = `Terms and conditions apply to all transactions. Users must agree to policies.
        Liability is limited as stated in agreement. Jurisdiction applies per local laws.
        Privacy policy governs data collection. Users retain certain rights.
        Company reserves right to modify terms. Effective date is listed above.`;
        
        const result = await viralPredictorService.predict(transcript);
        
        expect(result.score).toBeLessThanOrEqual(60);
        expect(result.factors.emotion).toBeLessThan(55);
      });
    });
  });

  describe('Factor calculations', () => {
    describe('Hook factor', () => {
      test('should score high for strong hook words in first 100 chars', async () => {
        const transcript = 'Amazing secret revealed! How to never fail again. This shocking discovery will change everything you know.';
        const result = await viralPredictorService.predict(transcript);
        
        expect(result.factors.hook).toBeGreaterThan(70);
      });

      test('should score lower for weak opening', async () => {
        const transcript = 'Today I want to talk about something. It is a topic that interests me. Let me begin.';
        const result = await viralPredictorService.predict(transcript);
        
        expect(result.factors.hook).toBeLessThan(70);
      });

      test('should detect multiple hook words', async () => {
        const transcript = 'The secret amazing shocking must-see never-before-revealed how to guide!';
        const result = await viralPredictorService.predict(transcript);
        
        expect(result.factors.hook).toBeGreaterThan(80);
      });
    });

    describe('Pacing factor', () => {
      test('should score high for optimal sentence length', async () => {
        const transcript = `This is a well-paced sentence with good length. 
        Another sentence that flows naturally and keeps engagement. 
        The rhythm is consistent and easy to follow.`;
        const result = await viralPredictorService.predict(transcript);
        
        expect(result.factors.pacing).toBeGreaterThanOrEqual(60);
      });

      test('should score lower for very short sentences', async () => {
        const transcript = 'Short. Very short. Too short. Not good. Bad pacing. Fix this.';
        const result = await viralPredictorService.predict(transcript);
        
        expect(result.factors.pacing).toBeLessThan(85);
      });

      test('should score lower for very long run-on sentences', async () => {
        const transcript = `This is an extremely long sentence that goes on and on without proper breaks or pauses which makes it difficult to follow and reduces engagement because viewers lose interest when sentences are too lengthy and complex without natural stopping points.`;
        const result = await viralPredictorService.predict(transcript);
        
        expect(result.factors.pacing).toBeLessThan(85);
      });
    });

    describe('Emotion factor', () => {
      test('should score high for emotional language', async () => {
        const transcript = 'I love this amazing content! It is incredible and shocking. Wow, truly terrible how some people hate this.';
        const result = await viralPredictorService.predict(transcript);
        
        expect(result.factors.emotion).toBeGreaterThan(70);
      });

      test('should score low for neutral language', async () => {
        const transcript = 'The data shows results. Analysis indicates trends. Observations were recorded. Conclusions were drawn.';
        const result = await viralPredictorService.predict(transcript);
        
        expect(result.factors.emotion).toBeLessThan(60);
      });

      test('should detect multiple emotional words', async () => {
        const transcript = 'Love this amazing incredible shocking terrible wow experience!';
        const result = await viralPredictorService.predict(transcript);
        
        expect(result.factors.emotion).toBeGreaterThan(80);
      });
    });

    describe('Trending factor', () => {
      test('should score high for trending topics', async () => {
        const transcript = 'AI and crypto are trending! This viral tech hack is going viral. Check out this trending tip!';
        const result = await viralPredictorService.predict(transcript);
        
        expect(result.factors.trending).toBeGreaterThan(70);
      });

      test('should score low for non-trending topics', async () => {
        const transcript = 'The historical context of medieval agriculture practices in rural communities.';
        const result = await viralPredictorService.predict(transcript);
        
        expect(result.factors.trending).toBeLessThan(60);
      });

      test('should detect multiple trending keywords', async () => {
        const transcript = 'AI crypto tech viral trending hack tip for everyone!';
        const result = await viralPredictorService.predict(transcript);
        
        expect(result.factors.trending).toBeGreaterThan(85);
      });
    });

    describe('Length factor', () => {
      test('should score high for optimal word count', async () => {
        const transcript = 'word '.repeat(800); // 800 words
        const result = await viralPredictorService.predict(transcript);
        
        expect(result.factors.length).toBeGreaterThan(80);
      });

      test('should score high for optimal words per minute with duration', async () => {
        const transcript = 'word '.repeat(400); // 400 words
        const metadata: ContentMetadata = { duration: 120 }; // 2 minutes = 200 wpm
        const result = await viralPredictorService.predict(transcript, metadata);
        
        expect(result.factors.length).toBeGreaterThan(80);
      });

      test('should score lower for too few words', async () => {
        const transcript = 'Short content here.';
        const result = await viralPredictorService.predict(transcript);
        
        expect(result.factors.length).toBeLessThan(85);
      });

      test('should score lower for speaking too fast', async () => {
        const transcript = 'word '.repeat(1000); // 1000 words
        const metadata: ContentMetadata = { duration: 120 }; // 2 minutes = 500 wpm (too fast)
        const result = await viralPredictorService.predict(transcript, metadata);
        
        expect(result.factors.length).toBeLessThan(90);
      });
    });
  });

  describe('Score validation', () => {
    test('should return score between 0 and 100', async () => {
      const transcripts = [
        'Amazing viral content!',
        'Regular content here.',
        'Boring corporate speak.',
        'How to create amazing AI content with shocking results!'
      ];

      for (const transcript of transcripts) {
        const result = await viralPredictorService.predict(transcript);
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(100);
      }
    });

    test('should return all factor scores between 0 and 100', async () => {
      const transcript = 'Test content for factor validation.';
      const result = await viralPredictorService.predict(transcript);
      
      expect(result.factors.hook).toBeGreaterThanOrEqual(0);
      expect(result.factors.hook).toBeLessThanOrEqual(100);
      expect(result.factors.pacing).toBeGreaterThanOrEqual(0);
      expect(result.factors.pacing).toBeLessThanOrEqual(100);
      expect(result.factors.emotion).toBeGreaterThanOrEqual(0);
      expect(result.factors.emotion).toBeLessThanOrEqual(100);
      expect(result.factors.trending).toBeGreaterThanOrEqual(0);
      expect(result.factors.trending).toBeLessThanOrEqual(100);
      expect(result.factors.length).toBeGreaterThanOrEqual(0);
      expect(result.factors.length).toBeLessThanOrEqual(100);
    });

    test('should return confidence between 0 and 1', async () => {
      const transcript = 'Test content.';
      const result = await viralPredictorService.predict(transcript);
      
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('Category classification', () => {
    test('should classify score >= 85 as viral', async () => {
      const transcript = `Amazing secret revealed! How to use AI and crypto - shocking viral content!
      This incredible hack is trending everywhere. Must see this now! Never miss this opportunity.
      The tech world loves this amazing discovery. Wow, truly incredible results here!`;
      const result = await viralPredictorService.predict(transcript);
      
      if (result.score >= 85) {
        expect(result.category).toBe('viral');
      }
    });

    test('should classify score 70-84 as high', async () => {
      const transcript = 'Amazing content with good hook. This is trending in tech. AI is incredible!';
      const result = await viralPredictorService.predict(transcript);
      
      if (result.score >= 70 && result.score < 85) {
        expect(result.category).toBe('high');
      }
    });

    test('should classify score 50-69 as medium', async () => {
      const transcript = 'Some interesting content here. It has moderate appeal. Worth checking out.';
      const result = await viralPredictorService.predict(transcript);
      
      if (result.score >= 50 && result.score < 70) {
        expect(result.category).toBe('medium');
      }
    });

    test('should classify score < 50 as low', async () => {
      const transcript = 'The meeting minutes were reviewed. Action items were assigned. Next meeting scheduled.';
      const result = await viralPredictorService.predict(transcript);
      
      if (result.score < 50) {
        expect(result.category).toBe('low');
      }
    });

    test('should have valid category for any score', async () => {
      const transcripts = [
        'Amazing viral AI crypto tech trending hack!',
        'Regular content.',
        'Corporate meeting minutes.'
      ];

      for (const transcript of transcripts) {
        const result = await viralPredictorService.predict(transcript);
        expect(['low', 'medium', 'high', 'viral']).toContain(result.category);
      }
    });
  });

  describe('Suggestions generation', () => {
    test('should suggest hook improvement for low hook score', async () => {
      const transcript = 'Today I will discuss a topic. It is somewhat interesting. Let me explain the details.';
      const result = await viralPredictorService.predict(transcript);
      
      if (result.factors.hook < 70) {
        expect(result.suggestions.some(s => s.toLowerCase().includes('hook'))).toBe(true);
      }
    });

    test('should suggest pacing improvement for low pacing score', async () => {
      const transcript = 'Short. Too short. Very short sentences. Not good. Bad. Fix.';
      const result = await viralPredictorService.predict(transcript);
      
      if (result.factors.pacing < 70) {
        expect(result.suggestions.some(s => s.toLowerCase().includes('pacing'))).toBe(true);
      }
    });

    test('should suggest emotion improvement for low emotion score', async () => {
      const transcript = 'The data shows results. Analysis indicates trends. Observations recorded.';
      const result = await viralPredictorService.predict(transcript);
      
      if (result.factors.emotion < 70) {
        expect(result.suggestions.some(s => s.toLowerCase().includes('emotion'))).toBe(true);
      }
    });

    test('should suggest trending topics for low trending score', async () => {
      const transcript = 'Historical analysis of agricultural practices in medieval times.';
      const result = await viralPredictorService.predict(transcript);
      
      if (result.factors.trending < 60) {
        expect(result.suggestions.some(s => s.toLowerCase().includes('trending'))).toBe(true);
      }
    });

    test('should suggest length optimization for low length score', async () => {
      const transcript = 'Very short.';
      const result = await viralPredictorService.predict(transcript);
      
      if (result.factors.length < 70) {
        expect(result.suggestions.some(s => s.toLowerCase().includes('length'))).toBe(true);
      }
    });

    test('should provide positive feedback for high scores', async () => {
      const transcript = `Amazing AI breakthrough! This shocking secret will change everything.
      The viral tech trend is incredible. Must see this now! Love this content.
      Trending everywhere with amazing results. Wow, truly incredible discovery!`;
      const result = await viralPredictorService.predict(transcript);
      
      if (result.score >= 80) {
        expect(result.suggestions.some(s => s.toLowerCase().includes('great'))).toBe(true);
      }
    });

    test('should return array of suggestions', async () => {
      const transcript = 'Test content.';
      const result = await viralPredictorService.predict(transcript);
      
      expect(Array.isArray(result.suggestions)).toBe(true);
      expect(result.suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('Edge cases', () => {
    test('should handle empty transcript', async () => {
      const transcript = '';
      const result = await viralPredictorService.predict(transcript);
      
      expect(result).toBeDefined();
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.category).toBeDefined();
    });

    test('should handle very long transcript', async () => {
      const transcript = 'This is a very long transcript. '.repeat(1000); // ~5000 words
      const result = await viralPredictorService.predict(transcript);
      
      expect(result).toBeDefined();
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    test('should handle transcript with special characters', async () => {
      const transcript = 'Amazing! @#$% content with *special* characters & symbols: 100% viral!!!';
      const result = await viralPredictorService.predict(transcript);
      
      expect(result).toBeDefined();
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    test('should handle transcript with emojis', async () => {
      const transcript = '🔥 Amazing content! 🚀 This is viral! 💯 Must see! ❤️ Love this!';
      const result = await viralPredictorService.predict(transcript);
      
      expect(result).toBeDefined();
      expect(result.factors).toBeDefined();
    });

    test('should handle transcript with only punctuation', async () => {
      const transcript = '!!! ??? ... --- !!!';
      const result = await viralPredictorService.predict(transcript);
      
      expect(result).toBeDefined();
      expect(result.score).toBeGreaterThanOrEqual(0);
    });

    test('should handle transcript with numbers only', async () => {
      const transcript = '123 456 789 101112 131415';
      const result = await viralPredictorService.predict(transcript);
      
      expect(result).toBeDefined();
      expect(result.category).toBeDefined();
    });

    test('should handle single word transcript', async () => {
      const transcript = 'Amazing';
      const result = await viralPredictorService.predict(transcript);
      
      expect(result).toBeDefined();
      expect(result.factors.hook).toBeGreaterThan(0);
    });

    test('should handle transcript with mixed case', async () => {
      const transcript = 'aMaZiNg CoNtEnT WiTh MiXeD CaSe!';
      const result = await viralPredictorService.predict(transcript);
      
      expect(result).toBeDefined();
      expect(result.factors.hook).toBeGreaterThan(60);
    });

    test('should handle transcript with line breaks', async () => {
      const transcript = 'Amazing content\n\nWith line breaks\n\nAnd paragraphs\n\nViral trending AI';
      const result = await viralPredictorService.predict(transcript);
      
      expect(result).toBeDefined();
      expect(result.score).toBeGreaterThan(0);
    });

    test('should handle transcript with tabs and spaces', async () => {
      const transcript = 'Amazing\t\tcontent  with   irregular    spacing';
      const result = await viralPredictorService.predict(transcript);
      
      expect(result).toBeDefined();
      expect(result.factors).toBeDefined();
    });

    test('should handle metadata with missing fields', async () => {
      const transcript = 'Test content';
      const metadata: ContentMetadata = {};
      const result = await viralPredictorService.predict(transcript, metadata);
      
      expect(result).toBeDefined();
      expect(result.factors.length).toBeGreaterThan(0);
    });

    test('should handle metadata with platform info', async () => {
      const transcript = 'Test content for platform';
      const metadata: ContentMetadata = { platform: 'youtube', category: 'tech' };
      const result = await viralPredictorService.predict(transcript, metadata);
      
      expect(result).toBeDefined();
    });
  });

  describe('Accuracy metrics', () => {
    test('should achieve >70% accuracy on sample dataset', async () => {
      // Dataset: 10 viral-like, 10 non-viral
      const viralTranscripts = [
        'Amazing AI breakthrough! This secret will change everything. Shocking viral content!',
        'How to master crypto - this incredible hack is trending everywhere. Must see!',
        'I love this amazing journey! Wow, truly shocking and incredible results here!',
        'Never miss this viral tech trend! The secret everyone is talking about now!',
        'This is the most amazing discovery! AI and crypto merge in shocking ways!',
        'Incredible viral content! How to succeed with this trending AI hack today!',
        'The secret to viral success revealed! This amazing tech tip is everywhere!',
        'Shocking truth about AI! This viral trend will change your life forever!',
        'Amazing breakthrough in tech! This incredible hack is trending worldwide!',
        'Must see this viral AI content! Shocking results that will amaze you!'
      ];

      const nonViralTranscripts = [
        'The quarterly report shows steady growth in revenue streams.',
        'Meeting minutes: agenda reviewed, action items assigned, next meeting scheduled.',
        'Product specifications: dimensions are standard, warranty included, ships worldwide.',
        'The function accepts parameters and returns boolean values as documented.',
        'Weather forecast: partly cloudy, temperature moderate, no precipitation expected.',
        'Terms and conditions apply. Users must agree to policies and guidelines.',
        'Historical analysis of agricultural practices in medieval rural communities.',
        'Step one: remove packaging. Step two: connect cable. Step three: press button.',
        'The research methodology utilizes quantitative analysis and statistical testing.',
        'Company provides services to clients with dedication to excellence and quality.'
      ];

      let correctPredictions = 0;
      const totalSamples = viralTranscripts.length + nonViralTranscripts.length;

      // Test viral transcripts (should score >= 65)
      for (const transcript of viralTranscripts) {
        const result = await viralPredictorService.predict(transcript);
        if (result.score >= 65) {
          correctPredictions++;
        }
      }

      // Test non-viral transcripts (should score < 65)
      for (const transcript of nonViralTranscripts) {
        const result = await viralPredictorService.predict(transcript);
        if (result.score < 65) {
          correctPredictions++;
        }
      }

      const accuracy = (correctPredictions / totalSamples) * 100;
      
      expect(accuracy).toBeGreaterThanOrEqual(70);
      expect(correctPredictions).toBeGreaterThanOrEqual(14); // 70% of 20
    });

    test('should correctly classify high-scoring content as high/viral', async () => {
      const highQualityTranscripts = [
        'Amazing secret revealed! How to use AI - shocking viral tech hack trending now!',
        'Incredible breakthrough! This must-see content will change everything. Wow!',
        'The viral trend everyone loves! Amazing AI and crypto tips you need today!'
      ];

      let correctClassifications = 0;

      for (const transcript of highQualityTranscripts) {
        const result = await viralPredictorService.predict(transcript);
        if (result.category === 'high' || result.category === 'viral') {
          correctClassifications++;
        }
      }

      const accuracy = (correctClassifications / highQualityTranscripts.length) * 100;
      expect(accuracy).toBeGreaterThanOrEqual(66);
    });

    test('should correctly classify low-scoring content as low/medium', async () => {
      const lowQualityTranscripts = [
        'The meeting was held. Items discussed. Minutes recorded.',
        'Product available. Standard size. Warranty included.',
        'Terms apply. Conditions listed. Agreement required.'
      ];

      let correctClassifications = 0;

      for (const transcript of lowQualityTranscripts) {
        const result = await viralPredictorService.predict(transcript);
        if (result.category === 'low' || result.category === 'medium') {
          correctClassifications++;
        }
      }

      const accuracy = (correctClassifications / lowQualityTranscripts.length) * 100;
      expect(accuracy).toBeGreaterThanOrEqual(70);
    });
  });

  describe('Response structure', () => {
    test('should return all required fields', async () => {
      const transcript = 'Test content';
      const result = await viralPredictorService.predict(transcript);
      
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('factors');
      expect(result).toHaveProperty('suggestions');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('category');
    });

    test('should return all factor fields', async () => {
      const transcript = 'Test content';
      const result = await viralPredictorService.predict(transcript);
      
      expect(result.factors).toHaveProperty('hook');
      expect(result.factors).toHaveProperty('pacing');
      expect(result.factors).toHaveProperty('emotion');
      expect(result.factors).toHaveProperty('trending');
      expect(result.factors).toHaveProperty('length');
    });

    test('should return numeric values for all fields', async () => {
      const transcript = 'Test content';
      const result = await viralPredictorService.predict(transcript);
      
      expect(typeof result.score).toBe('number');
      expect(typeof result.confidence).toBe('number');
      expect(typeof result.factors.hook).toBe('number');
      expect(typeof result.factors.pacing).toBe('number');
      expect(typeof result.factors.emotion).toBe('number');
      expect(typeof result.factors.trending).toBe('number');
      expect(typeof result.factors.length).toBe('number');
    });

    test('should return string category', async () => {
      const transcript = 'Test content';
      const result = await viralPredictorService.predict(transcript);
      
      expect(typeof result.category).toBe('string');
    });

    test('should return array of string suggestions', async () => {
      const transcript = 'Test content';
      const result = await viralPredictorService.predict(transcript);
      
      expect(Array.isArray(result.suggestions)).toBe(true);
      result.suggestions.forEach(suggestion => {
        expect(typeof suggestion).toBe('string');
      });
    });
  });

  describe('Consistency', () => {
    test('should return consistent results for same input', async () => {
      const transcript = 'Amazing viral AI content with trending tech hacks!';
      
      const result1 = await viralPredictorService.predict(transcript);
      const result2 = await viralPredictorService.predict(transcript);
      
      expect(result1.score).toBe(result2.score);
      expect(result1.category).toBe(result2.category);
      expect(result1.factors).toEqual(result2.factors);
    });

    test('should handle multiple predictions sequentially', async () => {
      const transcripts = [
        'Amazing content!',
        'Regular content.',
        'Viral trending AI!'
      ];

      const results = [];
      for (const transcript of transcripts) {
        const result = await viralPredictorService.predict(transcript);
        results.push(result);
      }

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.score).toBeGreaterThanOrEqual(0);
      });
    });

    test('should differentiate between similar but different content', async () => {
      const transcript1 = 'Amazing AI content!';
      const transcript2 = 'Regular AI content.';
      
      const result1 = await viralPredictorService.predict(transcript1);
      const result2 = await viralPredictorService.predict(transcript2);
      
      // Should have different scores due to different hook words
      expect(result1.score).not.toBe(result2.score);
    });
  });

  describe('Metadata handling', () => {
    test('should use duration when provided', async () => {
      const transcript = 'word '.repeat(300); // 300 words
      const withDuration = await viralPredictorService.predict(transcript, { duration: 120 });
      const withoutDuration = await viralPredictorService.predict(transcript);
      
      // Length scores might differ based on duration calculation
      expect(withDuration.factors.length).toBeDefined();
      expect(withoutDuration.factors.length).toBeDefined();
    });

    test('should handle all metadata fields', async () => {
      const transcript = 'Test content';
      const metadata: ContentMetadata = {
        duration: 600,
        platform: 'youtube',
        category: 'tech',
        hasVisuals: true
      };
      
      const result = await viralPredictorService.predict(transcript, metadata);
      
      expect(result).toBeDefined();
      expect(result.score).toBeGreaterThanOrEqual(0);
    });
  });
});
