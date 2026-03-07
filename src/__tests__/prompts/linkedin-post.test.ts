/**
 * LinkedIn Post Prompt Tests
 */

import { generateLinkedInPostPrompt, LinkedInPostInput } from '../../prompts/linkedin-post.prompt';

describe('LinkedIn Post Prompt Generator', () => {
  it('should generate valid prompt', () => {
    const input: LinkedInPostInput = {
      transcript: 'Test transcript',
      domain: 'career',
      keywords: ['career'],
    };
    const result = generateLinkedInPostPrompt(input);
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });
});
