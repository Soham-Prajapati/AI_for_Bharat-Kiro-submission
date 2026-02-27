/**
 * Content Analysis Prompt
 * Comprehensive content intelligence and insights
 */

export interface ContentAnalysisInput {
  transcript: string;
  metadata?: {
    duration?: number;
    platform?: string;
    existingEngagement?: {
      views?: number;
      likes?: number;
      comments?: number;
      shares?: number;
    };
  };
}

export function generateContentAnalysisPrompt(input: ContentAnalysisInput): string {
  const { transcript, metadata } = input;

  return `You are an expert content analyst with deep knowledge of social media algorithms, audience psychology, and content performance optimization.

TASK: Perform comprehensive analysis of the provided content to extract insights, identify opportunities, and provide actionable recommendations.

CONTENT:
${transcript}

${metadata ? `
METADATA:
${metadata.duration ? `- Duration: ${metadata.duration} seconds` : ''}
${metadata.platform ? `- Platform: ${metadata.platform}` : ''}
${metadata.existingEngagement ? `
- Existing Engagement:
  - Views: ${metadata.existingEngagement.views || 'N/A'}
  - Likes: ${metadata.existingEngagement.likes || 'N/A'}
  - Comments: ${metadata.existingEngagement.comments || 'N/A'}
  - Shares: ${metadata.existingEngagement.shares || 'N/A'}
` : ''}
` : ''}

OUTPUT FORMAT:
{
  "domain_classification": {
    "primary_domain": "Main category (Food, Tech, Education, etc.)",
    "sub_domains": ["Specific niches within primary domain"],
    "confidence": 0.0-1.0
  },
  "audience_analysis": {
    "target_audience": "Primary audience demographic",
    "age_range": "Estimated age range",
    "interests": ["Key interests of target audience"],
    "pain_points": ["Problems this content addresses"],
    "motivations": ["Why audience would engage with this"]
  },
  "content_structure": {
    "hook_quality": "Rating 1-10 with explanation",
    "narrative_flow": "Rating 1-10 with explanation",
    "value_delivery": "Rating 1-10 with explanation",
    "cta_effectiveness": "Rating 1-10 with explanation",
    "pacing": "Too fast | Good | Too slow"
  },
  "key_insights": {
    "main_topics": ["3-5 core topics covered"],
    "key_messages": ["2-3 main takeaways"],
    "unique_angles": ["What makes this content unique"],
    "emotional_triggers": ["Emotions evoked: curiosity, fear, joy, etc."]
  },
  "seo_keywords": {
    "primary_keywords": ["Top 3 keywords"],
    "secondary_keywords": ["5-7 supporting keywords"],
    "long_tail_keywords": ["3-5 long-tail phrases"],
    "trending_topics": ["Related trending topics"]
  },
  "sentiment_analysis": {
    "overall_sentiment": "positive | neutral | negative",
    "sentiment_score": -1.0 to 1.0,
    "tone": "educational | entertaining | inspirational | promotional | etc.",
    "emotional_arc": "How emotion changes throughout content"
  },
  "virality_potential": {
    "score": 0-100,
    "factors": [
      {"factor": "Relatability", "score": 0-10, "notes": "explanation"},
      {"factor": "Shareability", "score": 0-10, "notes": "explanation"},
      {"factor": "Emotional impact", "score": 0-10, "notes": "explanation"},
      {"factor": "Uniqueness", "score": 0-10, "notes": "explanation"},
      {"factor": "Timing/relevance", "score": 0-10, "notes": "explanation"}
    ],
    "viral_elements": ["Elements that could drive virality"],
    "barriers": ["What might prevent virality"]
  },
  "platform_recommendations": [
    {
      "platform": "YouTube Shorts | Instagram | TikTok | etc.",
      "fit_score": 0-10,
      "reasoning": "Why this platform is good/bad fit",
      "optimization_tips": ["Platform-specific tips"]
    }
  ],
  "content_gaps": [
    {"gap": "Missing element", "impact": "high | medium | low", "suggestion": "How to address"}
  ],
  "improvement_opportunities": [
    {
      "area": "Hook | Structure | CTA | etc.",
      "current_state": "What's happening now",
      "suggested_improvement": "Specific actionable change",
      "expected_impact": "What improvement would achieve"
    }
  ],
  "competitive_analysis": {
    "similar_content": ["Types of similar content in this niche"],
    "differentiation": "How this stands out (or doesn't)",
    "market_saturation": "low | medium | high",
    "opportunity_score": 0-10
  },
  "engagement_predictions": {
    "estimated_watch_time": "Percentage of viewers who will watch to end",
    "estimated_engagement_rate": "Percentage (likes + comments + shares / views)",
    "estimated_share_rate": "Percentage who will share",
    "bottlenecks": ["Where viewers might drop off"]
  },
  "actionable_recommendations": [
    {
      "priority": "high | medium | low",
      "recommendation": "Specific action to take",
      "reasoning": "Why this will improve performance",
      "implementation": "How to implement"
    }
  ]
}

ANALYSIS REQUIREMENTS:

DOMAIN CLASSIFICATION:
- Identify primary domain with confidence score
- Detect sub-niches and specific topics
- Consider cross-domain appeal

AUDIENCE ANALYSIS:
- Define target demographic precisely
- Identify pain points content addresses
- Understand audience motivations
- Assess audience size and accessibility

CONTENT STRUCTURE:
- Evaluate hook effectiveness (first 3 seconds)
- Assess narrative flow and pacing
- Rate value delivery (does it deliver on promise?)
- Evaluate CTA clarity and effectiveness

SEO & KEYWORDS:
- Extract primary keywords (high search volume)
- Identify secondary keywords (supporting topics)
- Find long-tail keywords (specific phrases)
- Connect to trending topics

SENTIMENT & TONE:
- Analyze overall sentiment (positive/negative/neutral)
- Identify tone (educational, entertaining, etc.)
- Map emotional arc throughout content
- Detect emotional triggers

VIRALITY ASSESSMENT:
- Score virality potential (0-100)
- Identify viral elements (relatability, shareability, etc.)
- Detect barriers to virality
- Suggest viral optimization tactics

PLATFORM FIT:
- Recommend best platforms for this content
- Explain why each platform is good/bad fit
- Provide platform-specific optimization tips
- Consider platform algorithm preferences

IMPROVEMENT OPPORTUNITIES:
- Identify content gaps
- Suggest specific improvements
- Prioritize recommendations by impact
- Provide implementation guidance

COMPETITIVE CONTEXT:
- Assess market saturation
- Identify differentiation opportunities
- Evaluate competitive advantage
- Suggest positioning strategy

Generate comprehensive content analysis now in JSON format.`;
}
