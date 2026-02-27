/**
 * Twitter Thread Prompt
 * Optimized for multi-tweet storytelling and engagement
 */

export interface TwitterThreadInput {
  transcript: string;
  domain: string;
  keywords: string[];
  language?: string;
  threadLength?: number;
}

export function generateTwitterThreadPrompt(input: TwitterThreadInput): string {
  const { transcript, domain, keywords, language = 'English', threadLength = 10 } = input;

  return `You are an expert Twitter thread creator specializing in ${domain} content with proven viral engagement.

TASK: Create a compelling ${threadLength}-tweet thread from the provided content.

CONTENT:
${transcript.substring(0, 1500)}

DOMAIN: ${domain}
KEYWORDS: ${keywords.join(', ')}
LANGUAGE: ${language}
THREAD LENGTH: ${threadLength} tweets

OUTPUT FORMAT:
{
  "thread": [
    {
      "tweet_number": 1,
      "content": "Hook tweet (max 280 chars)",
      "purpose": "Grab attention, promise value",
      "engagement_tactic": "Question, bold claim, or curiosity gap"
    },
    {
      "tweet_number": 2,
      "content": "Context/setup (max 280 chars)",
      "purpose": "Set the stage, build credibility"
    },
    ... (continue for ${threadLength} tweets)
  ],
  "hashtags": ["3-5 relevant hashtags to use across thread"],
  "mentions": ["Relevant accounts to mention/tag"],
  "media_suggestions": [
    {"tweet": 1, "type": "image/gif/video", "description": "What to include"},
    {"tweet": 5, "type": "image/gif/video", "description": "What to include"}
  ],
  "cta_tweet": "Final tweet with strong CTA (retweet, follow, link)",
  "engagement_hooks": ["Questions to ask followers", "Polls to include"],
  "thread_summary": "One-line summary of thread value"
}

REQUIREMENTS:
- Tweet 1: Must be a scroll-stopper (question, bold claim, or shocking stat)
- Each tweet: Max 280 characters (leave room for readability)
- Use line breaks for readability (not wall of text)
- Tweet 2-3: Build credibility and context
- Middle tweets: Deliver core value (tips, insights, story)
- Second-to-last tweet: Summarize key takeaways
- Last tweet: Strong CTA (follow, RT, check link in bio)
- Include "🧵" emoji in first tweet to signal thread
- Use numbers/bullets for listicles (1/, 2/, 3/ or •)
- Add relevant hashtags (max 2-3 per tweet, not every tweet)
- Suggest 2-3 tweets for media attachments (images/GIFs boost engagement)

THREAD STRUCTURE:
1/: Hook (question, stat, or bold claim) 🧵
2/: Context (why this matters)
3/: Point 1 (with example)
4/: Point 2 (with example)
5/: Point 3 (with example)
...
${threadLength-2}/: Key insight or story
${threadLength-1}/: Summary of takeaways
${threadLength}/: CTA (follow for more, RT to share, link)

ENGAGEMENT TACTICS:
- Ask a question in tweet 1 or 2
- Use "You" language (make it personal)
- Include specific numbers/data
- Share personal experience or story
- End with clear next step

VIRAL ELEMENTS:
- Contrarian take or unique angle
- Actionable tips (not just theory)
- Relatable pain points
- Surprising insights
- Social proof or results

Generate the Twitter thread now in JSON format.`;
}
