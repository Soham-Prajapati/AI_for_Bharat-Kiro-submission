import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.middleware';
import { InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { getBedrockClient } from '../config/aws';
import { GitHubModelsService } from '../services/github-models.service';
import { BEDROCK_MODELS, PLATFORM_MODEL } from '../config/bedrock-models';

const router = Router();

const DOMAIN_SYSTEM: Record<string, string> = {
  technology:    'You are a tech content expert for Indian developers and tech enthusiasts.',
  food:          'You are a food content strategist for Indian creators and regional cuisine.',
  travel:        'You are a travel content expert for Indian creators and diverse destinations.',
  fitness:       'You are a fitness & wellness strategist for Indian health-conscious audiences.',
  finance:       'You are a personal finance content expert for Indian audiences (SIPs, mutual funds, wealth building).',
  entertainment: 'You are an entertainment content strategist for Indian Bollywood, OTT, and meme culture.',
  education:     'You are an education content strategist for India\'s massive student audience.',
  gaming:        'You are a gaming content expert for BGMI, Free Fire, and Indian esports communities.',
  general:       'You are an expert Indian content strategist who helps creators go viral across all platforms.',
};

const PLATFORM_GUIDELINES: Record<string, string> = {
  instagram: 'Instagram caption (max 2200 chars). Use emojis, line breaks, 5-10 relevant hashtags, a hook in the first line.',
  youtube:   'YouTube description (max 5000 chars). Compelling intro paragraph, keywords naturally, call-to-action.',
  twitter:   'Twitter/X - punchy, conversational, max 280 chars per tweet, relevant hashtags.',
  linkedin:  'LinkedIn post (max 3000 chars). Professional tone, storytelling, 3-5 hashtags, call-to-action.',
  tiktok:    'TikTok caption (max 150 chars). Short, trendy, 3-5 hashtags, hook in first line.',
  blog:      'Blog opening paragraph - SEO-friendly, engaging, 150-200 words.',
  podcast:   'Podcast intro script - warm, conversational, 60-second spoken intro.',
};

async function invokeBedrockClaude(userPrompt: string, modelId: string, systemPrompt?: string): Promise<string> {
  const client = getBedrockClient();
  const body: Record<string, unknown> = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 2000,
    messages: [{ role: 'user', content: userPrompt }],
  };
  if (systemPrompt) body.system = systemPrompt;
  const cmd = new InvokeModelCommand({
    modelId,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify(body),
  });
  const response = await client.send(cmd);
  const result = JSON.parse(new TextDecoder().decode(response.body));
  return result.content[0].text as string;
}

router.post('/refine', asyncHandler(async (req: Request, res: Response) => {
  const {
    platform,
    transcript,
    previousContent,
    improvements,
    domain,
    audienceType,
    iterationNumber = 1,
  } = req.body as {
    platform: string;
    transcript: string;
    previousContent: string;
    improvements: string[];
    domain?: string;
    audienceType?: string;
    iterationNumber?: number;
  };

  if (!platform || !transcript || !previousContent || !Array.isArray(improvements)) {
    res.status(400).json({ success: false, error: 'platform, transcript, previousContent, and improvements[] are required' });
    return;
  }

  const platformGuidance = PLATFORM_GUIDELINES[platform.toLowerCase()] ||
    `${platform} content. Follow standard best practices for the platform.`;

  const contextParts: string[] = [];
  if (audienceType) contextParts.push(`Target audience: ${audienceType}`);

  const prompt = `You are refining content for ${platform} (iteration ${iterationNumber}).
${contextParts.length > 0 ? contextParts.join('\n') + '\n' : ''}
ORIGINAL VIDEO TRANSCRIPT:
"""
${transcript}
"""

CURRENT DRAFT (improve this):
"""
${previousContent}
"""

IMPROVEMENTS TO APPLY:
${improvements.map((imp: string, i: number) => `${i + 1}. ${imp}`).join('\n')}

PLATFORM FORMAT REQUIREMENTS:
${platformGuidance}

Rewrite the content applying ALL the improvements while keeping the platform format correct and the core message intact.
Respond with ONLY the refined content - no preamble, no explanations.`;

  const domainKey = (domain || 'general').toLowerCase();
  const systemPersona = DOMAIN_SYSTEM[domainKey] || DOMAIN_SYSTEM.general;
  const modelId = PLATFORM_MODEL[platform.toLowerCase()] || BEDROCK_MODELS.HAIKU_3;

  let refinedContent: string;
  let usedEngine = 'bedrock';

  try {
    refinedContent = await invokeBedrockClaude(prompt, modelId, systemPersona);
  } catch (bedrockErr: unknown) {
    // Bedrock unavailable - fall back to GitHub Models
    usedEngine = 'github-models-fallback';
    const githubModels = new GitHubModelsService();
    refinedContent = await githubModels.generate(`${systemPersona}\n\n${prompt}`, {
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 2000,
    }).catch((err: Error) => {
      const isRateLimit = err.message?.toLowerCase().includes('rate limit') || err.message?.includes('429');
      if (isRateLimit) {
        throw Object.assign(new Error('AI rate limit reached for today. Try again tomorrow or edit manually in the Workspace.'), { statusCode: 429 });
      }
      throw err;
    });
  }

  const changesSummary = `Applied ${improvements.length} improvement${improvements.length !== 1 ? 's' : ''}: ${improvements.slice(0, 3).join('; ')}${improvements.length > 3 ? ` and ${improvements.length - 3} more` : ''}.`;

  res.json({
    success: true,
    refinedContent: refinedContent.trim(),
    platform,
    iterationNumber,
    appliedImprovements: improvements,
    changesSummary,
    engine: usedEngine,
    domain: domainKey,
  });
}));

export default router;
