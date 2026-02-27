/**
 * TikTok Prompt
 * Optimized for 15-60 second vertical video format
 */

export interface TikTokInput {
  transcript: string;
  domain: string;
  keywords: string[];
  language?: string;
  trend?: string;
}

export function generateTikTokPrompt(input: TikTokInput): string {
  const { transcript, domain, keywords, language = 'English', trend } = input;

  return `You are an expert TikTok creator specializing in ${domain} content with deep knowledge of viral trends.

TASK: Create a viral-optimized TikTok caption and script from the provided content.

CONTENT:
${transcript.substring(0, 800)}

DOMAIN: ${domain}
KEYWORDS: ${keywords.join(', ')}
LANGUAGE: ${language}
${trend ? `TRENDING: ${trend}` : ''}

OUTPUT FORMAT:
{
  "caption": "Short, punchy caption with emojis (max 150 chars)",
  "hook": "First 1 second hook (must stop scroll immediately)",
  "hashtags": ["10-15 hashtags: mix of trending + niche + FYP"],
  "sounds": ["Trending sound suggestions for ${domain}"],
  "text_overlays": [
    {"timing": "0-2s", "text": "Hook text overlay", "position": "center"},
    {"timing": "2-5s", "text": "Key point 1", "position": "top"},
    {"timing": "5-10s", "text": "Key point 2", "position": "center"}
  ],
  "transitions": ["Transition suggestions between scenes"],
  "cta": "Call-to-action (follow, duet, stitch, comment)",
  "viral_elements": ["List of viral elements used: trend, sound, format, etc."],
  "script": {
    "0-1s": "Hook (visual + audio)",
    "1-5s": "Setup/context",
    "5-15s": "Main content/value",
    "15-20s": "Payoff/conclusion",
    "20-25s": "CTA"
  }
}

REQUIREMENTS:
- Hook must be INSTANT (1 second max to grab attention)
- Use trending sounds from ${domain} niche
- Caption should be curiosity-inducing or relatable
- Include #FYP, #ForYou, #ForYouPage strategically
- Text overlays should be easy to read (large font, high contrast)
- Optimize for completion rate (keep it tight, no fluff)
- Use TikTok-native language (no cringe, authentic)
- Leverage current trends/challenges when relevant
${trend ? `- Incorporate the trending element: ${trend}` : ''}

VIRAL FORMULA:
1. Pattern interrupt (first 1 second)
2. Relatability or curiosity (next 3 seconds)
3. Value delivery (middle section)
4. Satisfying payoff (end)
5. Strong CTA (last 2 seconds)

HASHTAG STRATEGY:
- 3-4 trending hashtags (millions of views)
- 3-4 niche hashtags (10K-500K views)
- 2-3 evergreen hashtags (#FYP, #${domain.replace(/\s+/g, '')})
- 1-2 branded/unique hashtags

Generate the TikTok content now in JSON format.`;
}
