/**
 * YouTube Shorts Prompt
 * Optimized for 60-second vertical video format
 */

export interface YouTubeShortInput {
  transcript: string;
  domain: string;
  keywords: string[];
  language?: string;
}

export function generateYouTubeShortPrompt(input: YouTubeShortInput): string {
  const { transcript, domain, keywords, language = 'English' } = input;

  return `You are an expert YouTube Shorts creator specializing in ${domain} content.

TASK: Create a compelling 60-second YouTube Short script from the provided content.

CONTENT:
${transcript.substring(0, 1000)}

DOMAIN: ${domain}
KEYWORDS: ${keywords.join(', ')}
LANGUAGE: ${language}

OUTPUT FORMAT:
{
  "title": "Catchy title (max 100 chars, include main keyword)",
  "hook": "First 3 seconds hook (attention-grabbing question or statement)",
  "script": [
    {"timestamp": "0:00-0:03", "text": "Hook line", "visual": "Visual suggestion"},
    {"timestamp": "0:03-0:15", "text": "Main point 1", "visual": "Visual suggestion"},
    {"timestamp": "0:15-0:30", "text": "Main point 2", "visual": "Visual suggestion"},
    {"timestamp": "0:30-0:45", "text": "Main point 3", "visual": "Visual suggestion"},
    {"timestamp": "0:45-0:60", "text": "CTA + outro", "visual": "Visual suggestion"}
  ],
  "description": "SEO-optimized description (150-200 words) with keywords naturally integrated",
  "hashtags": ["#Shorts", "#${domain.replace(/\s+/g, '')}", "8 more relevant hashtags"],
  "cta": "Clear call-to-action (like, subscribe, comment prompt)",
  "thumbnail_text": "3-5 words for thumbnail overlay"
}

REQUIREMENTS:
- Hook must grab attention in first 3 seconds
- Each segment should be concise and punchy
- Use conversational, energetic tone
- Include natural pauses for emphasis
- End with strong CTA
- Optimize for mobile viewing (vertical format)
- Include trending hashtags relevant to ${domain}

Generate the YouTube Short script now in JSON format.`;
}
