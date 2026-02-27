/**
 * Instagram Reel Prompt
 * Optimized for 15-90 second vertical video format
 */

export interface InstagramReelInput {
  transcript: string;
  domain: string;
  keywords: string[];
  language?: string;
  duration?: 15 | 30 | 60 | 90;
}

export function generateInstagramReelPrompt(input: InstagramReelInput): string {
  const { transcript, domain, keywords, language = 'English', duration = 30 } = input;

  return `You are an expert Instagram Reel creator specializing in ${domain} content.

TASK: Create an engaging ${duration}-second Instagram Reel caption and script from the provided content.

CONTENT:
${transcript.substring(0, 1000)}

DOMAIN: ${domain}
KEYWORDS: ${keywords.join(', ')}
LANGUAGE: ${language}
DURATION: ${duration} seconds

OUTPUT FORMAT:
{
  "caption": "Engaging caption with emojis (max 2200 chars, first line is hook)",
  "hook": "First line of caption (must stop scrollers)",
  "hashtags": ["20-30 relevant hashtags including trending and niche"],
  "cta": "Call-to-action (save, share, follow, comment prompt)",
  "audio_suggestion": "Trending audio recommendation for ${domain}",
  "cover_text": "Text overlay for cover frame (3-5 words)",
  "script_beats": [
    {"second": "0-3", "action": "Hook visual/text", "text": "What to say"},
    {"second": "3-10", "action": "Main content", "text": "What to say"},
    {"second": "10-${duration-5}", "action": "Value delivery", "text": "What to say"},
    {"second": "${duration-5}-${duration}", "action": "CTA", "text": "What to say"}
  ],
  "engagement_tactics": ["Question to ask", "Poll idea", "Share prompt"]
}

REQUIREMENTS:
- Caption must have strong hook in first line (before "...more")
- Use emojis strategically (not excessive)
- Include line breaks for readability
- Mix popular hashtags (1M+ posts) with niche hashtags (10K-100K posts)
- CTA should encourage saves/shares (algorithm boost)
- Audio suggestion should be trending in ${domain} niche
- Cover text should be curiosity-inducing
- Optimize for Instagram's algorithm (watch time, saves, shares)

CAPTION STRUCTURE:
Line 1: Hook (stop the scroll)
Line 2-3: Context/story
Line 4-6: Value/tips
Line 7: CTA
Line 8: Hashtags

Generate the Instagram Reel content now in JSON format.`;
}
