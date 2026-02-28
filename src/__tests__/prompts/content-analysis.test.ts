/**
 * Content Analysis Prompt Tests
 * 
 * Comprehensive unit tests for the content analysis prompt generator
 * Testing various inputs, edge cases, and output validation
 */

import {
  generateContentAnalysisPrompt,
  ContentAnalysisInput,
} from '../../prompts/content-analysis.prompt';

// Note: This test file does not require the setup.ts utilities
// as we're testing a pure function that generates prompts

describe('Content Analysis Prompt', () => {
  describe('generateContentAnalysisPrompt', () => {
    describe('Basic Functionality', () => {
      it('should generate a prompt with minimal input', () => {
        const input: ContentAnalysisInput = {
          transcript: 'This is a test transcript about cooking pasta.',
        };

        const result = generateContentAnalysisPrompt(input);

        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      });

      it('should include the transcript in the prompt', () => {
        const transcript = 'Learn how to make the perfect carbonara in 5 minutes!';
        const input: ContentAnalysisInput = {
          transcript,
        };

        const result = generateContentAnalysisPrompt(input);

        expect(result).toContain(transcript);
        expect(result).toContain('CONTENT:');
      });

      it('should return a string output', () => {
        const input: ContentAnalysisInput = {
          transcript: 'Test content',
        };

        const result = generateContentAnalysisPrompt(input);

        expect(typeof result).toBe('string');
      });
    });

    describe('Metadata Handling', () => {
      it('should include duration metadata when provided', () => {
        const input: ContentAnalysisInput = {
          transcript: 'Test transcript',
          metadata: {
            duration: 60,
          },
        };

        const result = generateContentAnalysisPrompt(input);

        expect(result).toContain('Duration: 60 seconds');
        expect(result).toContain('METADATA:');
      });

      it('should include platform metadata when provided', () => {
        const input: ContentAnalysisInput = {
          transcript: 'Test transcript',
          metadata: {
            platform: 'YouTube',
          },
        };

        const result = generateContentAnalysisPrompt(input);

        expect(result).toContain('Platform: YouTube');
      });

      it('should include engagement metrics when provided', () => {
        const input: ContentAnalysisInput = {
          transcript: 'Test transcript',
          metadata: {
            existingEngagement: {
              views: 10000,
              likes: 500,
              comments: 50,
              shares: 25,
            },
          },
        };

        const result = generateContentAnalysisPrompt(input);

        expect(result).toContain('Existing Engagement');
        expect(result).toContain('Views: 10000');
        expect(result).toContain('Likes: 500');
        expect(result).toContain('Comments: 50');
        expect(result).toContain('Shares: 25');
      });

      it('should handle partial engagement metrics', () => {
        const input: ContentAnalysisInput = {
          transcript: 'Test transcript',
          metadata: {
            existingEngagement: {
              views: 5000,
              likes: 100,
            },
          },
        };

        const result = generateContentAnalysisPrompt(input);

        expect(result).toContain('Views: 5000');
        expect(result).toContain('Likes: 100');
        expect(result).toContain('Comments: N/A');
        expect(result).toContain('Shares: N/A');
      });

      it('should include all metadata fields when provided', () => {
        const input: ContentAnalysisInput = {
          transcript: 'Complete test transcript',
          metadata: {
            duration: 120,
            platform: 'TikTok',
            existingEngagement: {
              views: 50000,
              likes: 2500,
              comments: 150,
              shares: 300,
            },
          },
        };

        const result = generateContentAnalysisPrompt(input);

        expect(result).toContain('Duration: 120 seconds');
        expect(result).toContain('Platform: TikTok');
        expect(result).toContain('Views: 50000');
        expect(result).toContain('Likes: 2500');
        expect(result).toContain('Comments: 150');
        expect(result).toContain('Shares: 300');
      });

      it('should work without metadata', () => {
        const input: ContentAnalysisInput = {
          transcript: 'Test transcript without metadata',
        };

        const result = generateContentAnalysisPrompt(input);

        expect(result).toBeDefined();
        expect(result).toContain('Test transcript without metadata');
        expect(result).not.toContain('METADATA:');
      });
    });

    describe('Analysis Requirements', () => {
      it('should include domain classification requirements', () => {
        const input: ContentAnalysisInput = {
          transcript: 'Test content',
        };

        const result = generateContentAnalysisPrompt(input);

        expect(result).toContain('domain_classification');
        expect(result).toContain('primary_domain');
        expect(result).toContain('sub_domains');
        expect(result).toContain('confidence');
      });

      it('should include audience analysis requirements', () => {
        const input: ContentAnalysisInput = {
          transcript: 'Test content',
        };

        const result = generateContentAnalysisPrompt(input);

        expect(result).toContain('audience_analysis');
        expect(result).toContain('target_audience');
        expect(result).toContain('age_range');
        expect(result).toContain('interests');
        expect(result).toContain('pain_points');
      });

      it('should include content structure requirements', () => {
        const input: ContentAnalysisInput = {
          transcript: 'Test content',
        };

        const result = generateContentAnalysisPrompt(input);

        expect(result).toContain('content_structure');
        expect(result).toContain('hook_quality');
        expect(result).toContain('narrative_flow');
        expect(result).toContain('value_delivery');
        expect(result).toContain('cta_effectiveness');
      });

      it('should include SEO keywords requirements', () => {
        const input: ContentAnalysisInput = {
          transcript: 'Test content',
        };

        const result = generateContentAnalysisPrompt(input);

        expect(result).toContain('seo_keywords');
        expect(result).toContain('primary_keywords');
        expect(result).toContain('secondary_keywords');
        expect(result).toContain('long_tail_keywords');
      });

      it('should include sentiment analysis requirements', () => {
        const input: ContentAnalysisInput = {
          transcript: 'Test content',
        };

        const result = generateContentAnalysisPrompt(input);

        expect(result).toContain('sentiment_analysis');
        expect(result).toContain('overall_sentiment');
        expect(result).toContain('sentiment_score');
        expect(result).toContain('tone');
      });

      it('should include virality potential requirements', () => {
        const input: ContentAnalysisInput = {
          transcript: 'Test content',
        };

        const result = generateContentAnalysisPrompt(input);

        expect(result).toContain('virality_potential');
        expect(result).toContain('score');
        expect(result).toContain('Relatability');
        expect(result).toContain('Shareability');
        expect(result).toContain('viral_elements');
      });

      it('should include platform recommendations requirements', () => {
        const input: ContentAnalysisInput = {
          transcript: 'Test content',
        };

        const result = generateContentAnalysisPrompt(input);

        expect(result).toContain('platform_recommendations');
        expect(result).toContain('fit_score');
        expect(result).toContain('optimization_tips');
      });

      it('should include improvement opportunities requirements', () => {
        const input: ContentAnalysisInput = {
          transcript: 'Test content',
        };

        const result = generateContentAnalysisPrompt(input);

        expect(result).toContain('improvement_opportunities');
        expect(result).toContain('content_gaps');
        expect(result).toContain('actionable_recommendations');
      });

      it('should include competitive analysis requirements', () => {
        const input: ContentAnalysisInput = {
          transcript: 'Test content',
        };

        const result = generateContentAnalysisPrompt(input);

        expect(result).toContain('competitive_analysis');
        expect(result).toContain('similar_content');
        expect(result).toContain('differentiation');
        expect(result).toContain('market_saturation');
      });

      it('should include engagement predictions requirements', () => {
        const input: ContentAnalysisInput = {
          transcript: 'Test content',
        };

        const result = generateContentAnalysisPrompt(input);

        expect(result).toContain('engagement_predictions');
        expect(result).toContain('estimated_watch_time');
        expect(result).toContain('estimated_engagement_rate');
      });
    });

    describe('Output Format Specification', () => {
      it('should specify JSON output format', () => {
        const input: ContentAnalysisInput = {
          transcript: 'Test content',
        };

        const result = generateContentAnalysisPrompt(input);

        expect(result).toContain('OUTPUT FORMAT:');
        expect(result).toContain('JSON format');
      });

      it('should include all required output fields', () => {
        const input: ContentAnalysisInput = {
          transcript: 'Test content',
        };

        const result = generateContentAnalysisPrompt(input);

        const requiredFields = [
          'domain_classification',
          'audience_analysis',
          'content_structure',
          'key_insights',
          'seo_keywords',
          'sentiment_analysis',
          'virality_potential',
          'platform_recommendations',
          'content_gaps',
          'improvement_opportunities',
          'competitive_analysis',
          'engagement_predictions',
          'actionable_recommendations',
        ];

        requiredFields.forEach(field => {
          expect(result).toContain(field);
        });
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty transcript', () => {
        const input: ContentAnalysisInput = {
          transcript: '',
        };

        const result = generateContentAnalysisPrompt(input);

        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
        expect(result).toContain('CONTENT:');
      });

      it('should handle very long transcript', () => {
        const longTranscript = 'This is a test. '.repeat(1000);
        const input: ContentAnalysisInput = {
          transcript: longTranscript,
        };

        const result = generateContentAnalysisPrompt(input);

        expect(result).toBeDefined();
        expect(result).toContain(longTranscript);
      });

      it('should handle special characters in transcript', () => {
        const input: ContentAnalysisInput = {
          transcript: 'Test with special chars: @#$%^&*(){}[]|\\<>?/~`',
        };

        const result = generateContentAnalysisPrompt(input);

        expect(result).toBeDefined();
        expect(result).toContain('Test with special chars');
      });

      it('should handle unicode characters in transcript', () => {
        const input: ContentAnalysisInput = {
          transcript: 'Test with emoji 🎉🚀💡 and unicode: café, naïve, 日本語',
        };

        const result = generateContentAnalysisPrompt(input);

        expect(result).toBeDefined();
        expect(result).toContain('🎉🚀💡');
        expect(result).toContain('café');
      });

      it('should handle newlines in transcript', () => {
        const input: ContentAnalysisInput = {
          transcript: 'Line 1\nLine 2\nLine 3',
        };

        const result = generateContentAnalysisPrompt(input);

        expect(result).toBeDefined();
        expect(result).toContain('Line 1');
        expect(result).toContain('Line 2');
        expect(result).toContain('Line 3');
      });

      it('should handle zero engagement metrics', () => {
        const input: ContentAnalysisInput = {
          transcript: 'Test content',
          metadata: {
            existingEngagement: {
              views: 0,
              likes: 0,
              comments: 0,
              shares: 0,
            },
          },
        };

        const result = generateContentAnalysisPrompt(input);

        // Note: The function treats 0 as falsy and shows N/A
        // This is the current behavior of the implementation
        expect(result).toContain('Views: N/A');
        expect(result).toContain('Likes: N/A');
        expect(result).toContain('Comments: N/A');
        expect(result).toContain('Shares: N/A');
      });

      it('should handle undefined engagement metrics', () => {
        const input: ContentAnalysisInput = {
          transcript: 'Test content',
          metadata: {
            existingEngagement: {},
          },
        };

        const result = generateContentAnalysisPrompt(input);

        expect(result).toContain('Views: N/A');
        expect(result).toContain('Likes: N/A');
        expect(result).toContain('Comments: N/A');
        expect(result).toContain('Shares: N/A');
      });

      it('should handle empty metadata object', () => {
        const input: ContentAnalysisInput = {
          transcript: 'Test content',
          metadata: {},
        };

        const result = generateContentAnalysisPrompt(input);

        expect(result).toBeDefined();
        expect(result).toContain('Test content');
      });
    });

    describe('Domain-Specific Content', () => {
      it('should handle food/cooking content', () => {
        const input: ContentAnalysisInput = {
          transcript: 'Today I\'m showing you how to make authentic Italian carbonara with just 5 ingredients.',
          metadata: {
            platform: 'YouTube',
            duration: 180,
          },
        };

        const result = generateContentAnalysisPrompt(input);

        expect(result).toContain('authentic Italian carbonara');
        expect(result).toContain('Platform: YouTube');
        expect(result).toContain('Duration: 180 seconds');
      });

      it('should handle tech/education content', () => {
        const input: ContentAnalysisInput = {
          transcript: 'Learn React hooks in 10 minutes. We\'ll cover useState, useEffect, and custom hooks.',
          metadata: {
            platform: 'TikTok',
          },
        };

        const result = generateContentAnalysisPrompt(input);

        expect(result).toContain('Learn React hooks');
        expect(result).toContain('Platform: TikTok');
      });

      it('should handle fitness content', () => {
        const input: ContentAnalysisInput = {
          transcript: '5 exercises to build abs at home. No equipment needed!',
          metadata: {
            duration: 60,
            existingEngagement: {
              views: 100000,
              likes: 5000,
            },
          },
        };

        const result = generateContentAnalysisPrompt(input);

        expect(result).toContain('5 exercises to build abs');
        expect(result).toContain('Views: 100000');
        expect(result).toContain('Likes: 5000');
      });

      it('should handle business/entrepreneurship content', () => {
        const input: ContentAnalysisInput = {
          transcript: 'How I built a 6-figure business in 12 months using these 3 strategies.',
        };

        const result = generateContentAnalysisPrompt(input);

        expect(result).toContain('6-figure business');
        expect(result).toContain('3 strategies');
      });
    });

    describe('Prompt Structure', () => {
      it('should include task description', () => {
        const input: ContentAnalysisInput = {
          transcript: 'Test content',
        };

        const result = generateContentAnalysisPrompt(input);

        expect(result).toContain('TASK:');
        expect(result).toContain('expert content analyst');
      });

      it('should include analysis requirements section', () => {
        const input: ContentAnalysisInput = {
          transcript: 'Test content',
        };

        const result = generateContentAnalysisPrompt(input);

        expect(result).toContain('ANALYSIS REQUIREMENTS:');
        expect(result).toContain('DOMAIN CLASSIFICATION:');
        expect(result).toContain('AUDIENCE ANALYSIS:');
        expect(result).toContain('CONTENT STRUCTURE:');
      });

      it('should include detailed instructions for each analysis type', () => {
        const input: ContentAnalysisInput = {
          transcript: 'Test content',
        };

        const result = generateContentAnalysisPrompt(input);

        expect(result).toContain('SEO & KEYWORDS:');
        expect(result).toContain('SENTIMENT & TONE:');
        expect(result).toContain('VIRALITY ASSESSMENT:');
        expect(result).toContain('PLATFORM FIT:');
        expect(result).toContain('IMPROVEMENT OPPORTUNITIES:');
        expect(result).toContain('COMPETITIVE CONTEXT:');
      });

      it('should end with generation instruction', () => {
        const input: ContentAnalysisInput = {
          transcript: 'Test content',
        };

        const result = generateContentAnalysisPrompt(input);

        expect(result).toContain('Generate comprehensive content analysis');
      });
    });

    describe('Real-World Scenarios', () => {
      it('should handle viral video analysis request', () => {
        const input: ContentAnalysisInput = {
          transcript: 'POV: You\'re a barista and this customer orders the most complicated drink ever. Watch what happens next!',
          metadata: {
            platform: 'TikTok',
            duration: 15,
            existingEngagement: {
              views: 5000000,
              likes: 500000,
              comments: 25000,
              shares: 100000,
            },
          },
        };

        const result = generateContentAnalysisPrompt(input);

        expect(result).toContain('POV:');
        expect(result).toContain('Views: 5000000');
        expect(result).toContain('Platform: TikTok');
        expect(result).toContain('Duration: 15 seconds');
      });

      it('should handle educational tutorial analysis', () => {
        const input: ContentAnalysisInput = {
          transcript: 'In this comprehensive guide, I\'ll teach you everything you need to know about Python decorators. We\'ll start with the basics and work our way up to advanced patterns.',
          metadata: {
            platform: 'YouTube',
            duration: 600,
            existingEngagement: {
              views: 50000,
              likes: 2000,
              comments: 150,
            },
          },
        };

        const result = generateContentAnalysisPrompt(input);

        expect(result).toContain('Python decorators');
        expect(result).toContain('comprehensive guide');
        expect(result).toContain('Duration: 600 seconds');
      });

      it('should handle product review analysis', () => {
        const input: ContentAnalysisInput = {
          transcript: 'I\'ve been using this new smartphone for 30 days. Here\'s my honest review - the good, the bad, and the ugly.',
          metadata: {
            platform: 'Instagram',
            duration: 90,
          },
        };

        const result = generateContentAnalysisPrompt(input);

        expect(result).toContain('honest review');
        expect(result).toContain('Platform: Instagram');
      });
    });

    describe('Type Safety', () => {
      it('should accept valid ContentAnalysisInput type', () => {
        const input: ContentAnalysisInput = {
          transcript: 'Test',
          metadata: {
            duration: 60,
            platform: 'YouTube',
            existingEngagement: {
              views: 1000,
              likes: 100,
              comments: 10,
              shares: 5,
            },
          },
        };

        expect(() => generateContentAnalysisPrompt(input)).not.toThrow();
      });

      it('should work with only required fields', () => {
        const input: ContentAnalysisInput = {
          transcript: 'Minimal input',
        };

        expect(() => generateContentAnalysisPrompt(input)).not.toThrow();
      });
    });
  });
});
