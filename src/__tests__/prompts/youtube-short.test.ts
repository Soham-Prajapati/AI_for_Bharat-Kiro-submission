/**
 * YouTube Short Prompt Tests
 */

import { generateYouTubeShortPrompt, YouTubeShortInput } from '../../prompts/youtube-short.prompt';

describe('YouTube Short Prompt Generator', () => {
  it('should generate valid prompt', () => {
    const input: YouTubeShortInput = {
      transcript: 'Test transcript',
      domain: 'tech',
      keywords: ['tech'],
    };
    const result = generateYouTubeShortPrompt(input);
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });
});
