/**
 * LinkedIn Post Prompt
 * Optimized for professional engagement and thought leadership
 */

export interface LinkedInPostInput {
  transcript: string;
  domain: string;
  keywords: string[];
  language?: string;
  tone?: 'professional' | 'inspirational' | 'educational' | 'storytelling';
}

export function generateLinkedInPostPrompt(input: LinkedInPostInput): string {
  const { transcript, domain, keywords, language = 'English', tone = 'professional' } = input;

  return `You are an expert LinkedIn content creator specializing in ${domain} with proven engagement and thought leadership.

TASK: Create a high-engagement LinkedIn post from the provided content.

CONTENT:
${transcript.substring(0, 1500)}

DOMAIN: ${domain}
KEYWORDS: ${keywords.join(', ')}
LANGUAGE: ${language}
TONE: ${tone}

OUTPUT FORMAT:
{
  "post": "Full post content (max 3000 chars, optimized for 'See more' break)",
  "hook": "First 2 lines (must appear before 'See more' - critical)",
  "structure": {
    "opening": "Hook (2 lines max)",
    "context": "Setup/background (2-3 lines)",
    "body": "Main content with line breaks",
    "conclusion": "Key takeaway",
    "cta": "Call-to-action"
  },
  "hashtags": ["5-10 professional hashtags relevant to ${domain}"],
  "mentions": ["Relevant companies/people to tag"],
  "engagement_question": "Question to ask in comments or end of post",
  "content_type": "Story | Tips | Insight | Case Study | Opinion",
  "visual_suggestion": "Image/carousel/video recommendation",
  "formatting": {
    "emojis": ["Strategic emoji usage (professional, not excessive)"],
    "line_breaks": "Use double line breaks for readability",
    "emphasis": "Use CAPS or → for key points"
  }
}

REQUIREMENTS:
- First 2 lines MUST hook readers (appears before "...see more")
- Use double line breaks between paragraphs (LinkedIn formatting)
- Professional tone but conversational (not corporate jargon)
- Include personal experience or story when relevant
- Add value: insights, tips, lessons, or frameworks
- Use strategic emojis (1-3 per post, professional context)
- Hashtags at the end (5-10 max, mix popular + niche)
- End with engagement question or clear CTA
- Optimize for LinkedIn algorithm (comments > likes)

POST STRUCTURE (${tone} tone):
Line 1-2: Hook (question, bold statement, or relatable pain point)
[...see more break]
Line 3-4: Context or personal story
Line 5-8: Main content (tips, insights, framework)
Line 9-10: Key takeaway or lesson
Line 11: Call-to-action or question
Line 12: Hashtags

HOOK FORMULAS:
- Question: "Ever wondered why [problem]?"
- Bold claim: "Here's what nobody tells you about [topic]:"
- Story: "3 years ago, I made a mistake that cost me [result]."
- Contrarian: "Unpopular opinion: [controversial take]"
- List: "5 lessons I learned from [experience]:"

ENGAGEMENT TACTICS:
- Ask a question (drives comments)
- Share vulnerable moment (builds connection)
- Provide actionable framework (saves/shares)
- Tag relevant people/companies (expands reach)
- Use carousel format for tips/steps (higher engagement)

CONTENT TYPES:
- ${tone === 'storytelling' ? 'Personal story with lesson' : ''}
- ${tone === 'educational' ? 'How-to or framework' : ''}
- ${tone === 'inspirational' ? 'Motivational insight' : ''}
- ${tone === 'professional' ? 'Industry insight or analysis' : ''}

HASHTAG STRATEGY:
- 2-3 broad hashtags (#${domain.replace(/\s+/g, '')}, #Leadership)
- 3-4 niche hashtags (specific to content)
- 1-2 trending hashtags (check LinkedIn trends)

Generate the LinkedIn post now in JSON format.`;
}
