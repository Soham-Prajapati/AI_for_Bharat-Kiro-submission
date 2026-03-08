/**
 * POST /api/ideate
 *
 * AI-First mode: creator describes an idea in text.
 * Uses GitHub Models (gpt-4o) → OpenAI (gpt-4o) fallback chain.
 */

import { Router, Request, Response } from 'express';
import { GitHubModelsService } from '../services/github-models.service';
import OpenAI from 'openai';
import { asyncHandler } from '../middleware/asyncHandler.middleware';
import { ValidationError } from '../types/errors';

const router = Router();
const githubModels = new GitHubModelsService();

const TARGET_PLATFORMS = ['youtube', 'instagram', 'tiktok', 'twitter', 'linkedin', 'blog', 'podcast'];

const DOMAIN_PERSONA: Record<string, string> = {
  technology:    'You are a tech content expert for Indian developers and tech enthusiasts.',
  food:          'You are a food content strategist for Indian creators who understands regional Indian cuisine and recipe virality.',
  travel:        'You are a travel content expert for Indian creators who understands India\'s diverse destinations.',
  fitness:       'You are a fitness & wellness strategist for Indian creators.',
  finance:       'You are a personal finance content expert for Indian audiences — SIPs, mutual funds, tax saving.',
  entertainment: 'You are an entertainment content strategist for Indian creators covering Bollywood and OTT culture.',
  education:     'You are an education content strategist for Indian creators who makes learning engaging.',
  gaming:        'You are a gaming content expert for Indian gaming creators (BGMI, Free Fire, esports).',
  general:       'You are an expert Indian content strategist who helps creators go viral across all platforms.',
};

function buildIdeatePrompt(idea: string, domain: string, tone?: string, targetAudience?: string, platforms: string[] = TARGET_PLATFORMS): string {
  const persona = DOMAIN_PERSONA[(domain || 'general').toLowerCase()] || DOMAIN_PERSONA.general;
  const toneNote = tone ? `Tone: ${tone}.` : '';
  const audienceNote = targetAudience ? `Target audience: ${targetAudience}.` : '';
  const activePlatforms = platforms.filter(p => p !== 'analytics');

  return `${persona}

A creator has this content idea: "${idea}"
Domain: ${domain}. ${toneNote} ${audienceNote}

Generate platform-ready content for ALL of these platforms: ${activePlatforms.join(', ')}.

Return ONLY a valid JSON object (no markdown, no explanation) with this structure:
{
  "youtube": {
    "title": "SEO-optimised title under 70 chars",
    "content": "Full 150-word YouTube description with value proposition, key points, and subscribe CTA",
    "hashtags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
    "metadata": { "hook": "Powerful 2-3 sentence opening script for first 30 seconds", "thumbnailConcept": "Specific thumbnail concept with text overlay" }
  },
  "instagram": {
    "content": "Full caption with emojis, line breaks, save/follow CTA. Under 150 words.",
    "hashtags": ["#india","#reels","#viral","#trending","#creator","#fyp","#instagood"],
    "metadata": { "hook": "First 3 seconds text — max 8 words", "reelConcept": "Hook scene → Main beats → Payoff & CTA" }
  },
  "tiktok": {
    "content": "TikTok caption under 120 chars with 2-3 emojis",
    "hashtags": ["#fyp","#foryou","#viral","#trending","#india"],
    "metadata": { "hook": "First 3 seconds — max 8 words", "videoStructure": "Hook(0-3s) → 3 beats(3-45s) → CTA(45-60s)" }
  },
  "twitter": {
    "content": "Opening tweet + 5 thread tweets + CTA tweet, separated by double newlines",
    "metadata": { "hook": "Opening tweet under 280 chars", "thread": ["tweet2","tweet3","tweet4","tweet5","tweet6"], "cta": "Final CTA tweet" }
  },
  "linkedin": {
    "title": "One powerful headline sentence",
    "content": "Full LinkedIn post: headline, blank line, 3-4 insight paragraphs, closing question. 160-200 words.",
    "hashtags": ["#india","#growth","#career","#learning"],
    "metadata": { "keyInsight": "Single most shareable insight in 1-2 sentences" }
  },
  "blog": {
    "title": "SEO blog title 60-70 chars",
    "content": "Opening 2 paragraphs: hook with relatable problem, then why it matters and what the reader gets",
    "metadata": { "metaDescription": "Meta description under 155 chars", "outline": ["Introduction","Section 1","Section 2","Conclusion"], "cta": "End-of-post call to action" }
  },
  "podcast": {
    "title": "Episode title that makes listeners click play",
    "content": "30-second warm spoken intro script",
    "metadata": { "segments": [{"title":"Opening story","description":"Hook story","duration":"3-4 min"},{"title":"Core teaching","description":"Main insight","duration":"8-10 min"},{"title":"Practical steps","description":"Actionable framework","duration":"6-8 min"}], "outro": "30-second outro with key takeaway and subscribe CTA" }
  }
}`;
}

async function callOpenAI(prompt: string): Promise<Record<string, any>> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not set');
  const client = new OpenAI({ apiKey });
  const completion = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.8,
    max_tokens: 3000,
  });
  const raw = completion.choices[0].message.content || '';
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end <= start) throw new Error('No JSON in OpenAI response');
  return JSON.parse(raw.substring(start, end + 1));
}

router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const { idea, domain = 'general', targetPlatforms, tone, targetAudience } = req.body;

  if (!idea || typeof idea !== 'string' || idea.trim().length < 10) {
    throw new ValidationError('idea must be at least 10 characters');
  }

  const platforms = Array.isArray(targetPlatforms) && targetPlatforms.length
    ? targetPlatforms
    : TARGET_PLATFORMS;

  const prompt = buildIdeatePrompt(idea.trim(), domain, tone, targetAudience, platforms);
  let results: Record<string, any> = {};

  // Primary: GitHub Models gpt-4o
  try {
    const raw = await githubModels.generate(prompt, { model: 'gpt-4o', temperature: 0.8, maxTokens: 3000 });
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start !== -1 && end > start) {
      results = JSON.parse(raw.substring(start, end + 1));
    }
  } catch (err: any) {
    console.warn('GitHub Models ideate failed, trying OpenAI:', err.message);
  }

  // Fallback 1: OpenAI direct
  if (!results || Object.keys(results).length === 0) {
    try {
      results = await callOpenAI(prompt);
    } catch (err: any) {
      console.warn('OpenAI ideate failed, trying Bedrock:', err.message);
    }
  }

  // Fallback 2: Bedrock
  if (!results || Object.keys(results).length === 0) {
    try {
      const { bedrockContentService } = await import('../services/bedrock-content.service');
      const enriched = [`CONTENT IDEA: ${idea.trim()}`, tone ? `TONE: ${tone}` : '', targetAudience ? `AUDIENCE: ${targetAudience}` : ''].filter(Boolean).join('\n');
      results = await bedrockContentService.generateContent({
        transcript: enriched, keyPoints: [], domain,
        metadata: { fileId: `idea-${Date.now()}`, duration: 0, fileName: '', mimeType: '', size: 0, localPath: '', uploadedAt: new Date().toISOString() } as any,
        platforms: platforms as any[],
      });
    } catch (bedrockErr: any) {
      console.warn('Bedrock fallback failed:', bedrockErr.message);
    }
  }

  // Final fallback: template-based generation (always works, no API needed)
  if (!results || Object.keys(results).length === 0) {
    results = generateTemplateContent(idea.trim(), domain, tone, targetAudience, platforms);
  }

  res.json({ success: true, results: { platforms: results }, domain, idea: idea.trim() });
}));

function capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

function generateTemplateContent(
  idea: string,
  domain: string,
  tone: string | undefined,
  targetAudience: string | undefined,
  platforms: string[],
): Record<string, any> {
  const toneAdj = tone === 'energetic' ? 'Powerful' : tone === 'inspirational' ? 'Life-Changing' : tone === 'humorous' ? 'Hilarious' : 'Essential';
  const audienceNote = targetAudience ? ` for ${targetAudience}` : '';
  const domainEmoji: Record<string, string> = {
    food: '🍽️', technology: '💻', travel: '✈️', fitness: '💪',
    finance: '💰', entertainment: '🎬', education: '📚', gaming: '🎮', general: '🚀',
  };
  const emoji = domainEmoji[domain] || '🚀';
  const shortIdea = idea.length > 60 ? idea.substring(0, 57) + '...' : idea;

  const result: Record<string, any> = {};

  if (platforms.includes('youtube')) {
    result.youtube = {
      platform: 'youtube',
      title: `${toneAdj} Guide: ${shortIdea}`,
      content: `${emoji} ${idea}\n\nIn this video, I'm sharing everything you need to know about ${idea.toLowerCase()}${audienceNote}. Whether you're just starting out or looking to level up, this guide covers the key steps, common mistakes to avoid, and proven strategies that actually work.\n\n📌 What you'll learn:\n• The fastest way to get started\n• Top mistakes and how to avoid them\n• Pro tips from real experience\n• Next steps to take action today\n\n⏰ Subscribe for more ${domain} content every week!\n\n#${domain} #${domain}tips #howto #tutorial #india`,
      hashtags: [`#${domain}`, '#howto', '#tutorial', '#india', '#tips'],
      metadata: {
        hook: `Did you know most people get ${idea.toLowerCase()} completely wrong? In the next 60 seconds, I'll show you exactly what to do instead.`,
        thumbnailConcept: `Bold text: "${toneAdj.toUpperCase()} GUIDE" on left, creator on right with surprised/excited expression. ${emoji} emoji prominent.`,
      },
    };
  }

  if (platforms.includes('instagram')) {
    result.instagram = {
      platform: 'instagram',
      content: `${emoji} ${idea}\n\nHere's what nobody tells you about this 👇\n\n✅ Start with the basics\n✅ Be consistent for 30 days\n✅ Track your progress weekly\n✅ Adjust based on results\n\nThe secret? Most people skip step 2. Don't be most people.\n\nSave this post so you don't forget! 🔖\nTag a friend who needs to see this 👇`,
      hashtags: ['#india', '#reels', '#viral', '#trending', `#${domain}`, '#creator', '#fyp', '#instagood', '#motivation', '#tips'],
      metadata: {
        hook: `${idea.split(' ').slice(0, 6).join(' ')}... 🤯`,
        reelConcept: `Hook (0-3s): Show the problem. Middle (3-25s): Reveal the solution step by step. Payoff (25-30s): Satisfying result + "Save for later" CTA.`,
      },
    };
  }

  if (platforms.includes('tiktok')) {
    result.tiktok = {
      platform: 'tiktok',
      content: `${idea} — this changed everything 🤯 #fyp #${domain}`,
      hashtags: ['#fyp', '#foryou', '#viral', '#trending', '#india', `#${domain}`],
      metadata: {
        hook: `Wait till you see this... ${emoji}`,
        videoStructure: `Hook (0-3s): "Nobody talks about this" + bold text. Content (3-45s): 3 quick tips with text overlays. Payoff (45-60s): Before/after reveal + follow CTA.`,
      },
    };
  }

  if (platforms.includes('twitter')) {
    const thread = [
      `Most people struggle with: ${idea}\n\nHere's the exact framework I use (thread) 🧵👇`,
      `1/ First, understand the core problem.\n\nEveryone tries to jump to the solution before they truly understand what they're solving. Big mistake.`,
      `2/ The fastest path forward is:\n→ Start small\n→ Be consistent\n→ Measure what matters\n→ Double down on what works`,
      `3/ The #1 mistake people make? Trying to do too much at once.\n\nPick ONE thing. Master it. Then move to the next.`,
      `4/ Here's the real secret: Progress > Perfection.\n\nDone is better than perfect. Ship it, learn, improve.`,
      `5/ Action step for today:\n→ Identify your biggest obstacle\n→ Break it into 3 small tasks\n→ Do the first one right now`,
      `If this helped, follow me for more ${domain} insights every day.\n\nRT to help someone who needs this 🙏`,
    ];
    result.twitter = {
      platform: 'twitter',
      content: thread.join('\n\n'),
      metadata: { hook: thread[0], thread: thread.slice(1, -1), cta: thread[thread.length - 1] },
    };
  }

  if (platforms.includes('linkedin')) {
    result.linkedin = {
      platform: 'linkedin',
      title: `Here's what I learned about ${idea.toLowerCase()}:`,
      content: `Here's what I learned about ${idea.toLowerCase()}:\n\nMost people overcomplicate it.\n\nAfter working on this${audienceNote}, I've found 3 principles that actually matter:\n\n1. Start before you're ready\nPerfection kills momentum. Done beats perfect every single time.\n\n2. Consistency compounds\nSmall actions every day create massive results over time. This is not motivational fluff — it's math.\n\n3. Feedback is your fastest teacher\nDon't spend 3 months planning. Ship in 2 weeks. Learn from real feedback.\n\nThe ${domain} space rewards those who take action, not those who wait for the perfect moment.\n\nWhat's your experience with ${idea.toLowerCase()}? Share in the comments 👇`,
      hashtags: ['#india', '#growth', `#${domain}`, '#career', '#learning'],
      metadata: { keyInsight: `Consistency + small daily actions beats any shortcut. Start now, refine as you go.` },
    };
  }

  if (platforms.includes('blog')) {
    result.blog = {
      platform: 'blog',
      title: `The Complete Guide to ${capitalize(idea.split(' ').slice(0, 6).join(' '))}`,
      content: `If you've been struggling with ${idea.toLowerCase()}, you're not alone. Thousands of people${audienceNote} face this exact challenge every day — and most of them never figure out why they're stuck.\n\nThe good news? The solution is simpler than you think. In this guide, I'm going to walk you through exactly what works, what doesn't, and how to get started today — even if you're a complete beginner.`,
      metadata: {
        metaDescription: `Learn everything about ${idea.toLowerCase()}. A practical, step-by-step guide with proven strategies that actually work.`,
        outline: ['Introduction: Why this matters', 'The core framework', 'Step-by-step walkthrough', 'Common mistakes to avoid', 'Next steps'],
        cta: `Ready to get started? Drop your biggest question in the comments and I'll personally respond.`,
      },
    };
  }

  if (platforms.includes('podcast')) {
    result.podcast = {
      platform: 'podcast',
      title: `${toneAdj} Insights: ${shortIdea}`,
      content: `Hey everyone, welcome back to the show! I'm so glad you're here today because we're diving into something that I get asked about ALL the time — ${idea.toLowerCase()}. Whether you're just discovering this topic or you've been at it for a while, I promise you're going to walk away from this episode with at least one thing you can act on immediately. Let's get into it.`,
      script: `Hey everyone, welcome back to the show! Today we're talking about ${idea.toLowerCase()}.`,
      metadata: {
        segments: [
          { title: 'Opening story', description: `Why ${idea.toLowerCase()} matters right now`, duration: '3-4 min' },
          { title: 'Core teaching', description: 'The framework broken into 3 digestible principles', duration: '8-10 min' },
          { title: 'Practical steps', description: 'Exactly what to do this week', duration: '6-8 min' },
        ],
        outro: `That's a wrap on today's episode! If you got value from this, please subscribe and share it with one person who needs to hear this. See you next time!`,
      },
    };
  }

  return result;
}

export default router;
