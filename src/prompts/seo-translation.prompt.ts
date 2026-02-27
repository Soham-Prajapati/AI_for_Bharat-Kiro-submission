/**
 * SEO Translation Prompt
 * Optimized for multilingual content with SEO preservation
 */

export interface SEOTranslationInput {
  content: string;
  sourceLanguage: string;
  targetLanguage: string;
  domain: string;
  keywords: string[];
  contentType: 'video-description' | 'blog-post' | 'social-caption' | 'website-copy';
}

export function generateSEOTranslationPrompt(input: SEOTranslationInput): string {
  const { content, sourceLanguage, targetLanguage, domain, keywords, contentType } = input;

  return `You are an expert translator and SEO specialist with native fluency in ${targetLanguage} and deep knowledge of ${domain} content.

TASK: Translate content from ${sourceLanguage} to ${targetLanguage} while preserving SEO value, cultural nuances, and engagement.

SOURCE CONTENT:
${content}

TRANSLATION PARAMETERS:
- Source Language: ${sourceLanguage}
- Target Language: ${targetLanguage}
- Domain: ${domain}
- Content Type: ${contentType}
- Keywords to preserve: ${keywords.join(', ')}

OUTPUT FORMAT:
{
  "translation": "Full translated content",
  "localized_keywords": ["Translated/localized keywords for ${targetLanguage}"],
  "cultural_adaptations": [
    {"original": "phrase/reference", "adapted": "culturally appropriate version", "reason": "why changed"}
  ],
  "seo_notes": {
    "keyword_placement": "How keywords were integrated naturally",
    "readability_score": "Estimated reading level",
    "tone_preservation": "How original tone was maintained"
  },
  "alternative_translations": [
    {"section": "specific phrase", "alternatives": ["option 1", "option 2"], "recommendation": "best choice and why"}
  ],
  "metadata": {
    "title_translation": "If applicable, translated title",
    "meta_description": "If applicable, translated meta description",
    "hashtags": "If applicable, localized hashtags"
  }
}

REQUIREMENTS:

TRANSLATION QUALITY:
- Native-level fluency (not literal/robotic translation)
- Preserve original meaning and intent
- Maintain tone and style (formal, casual, professional, etc.)
- Use natural idioms and expressions in ${targetLanguage}
- Adapt cultural references appropriately
- Keep brand names, product names unchanged (unless localized version exists)

SEO PRESERVATION:
- Translate keywords naturally (don't force exact matches)
- Research ${targetLanguage} search terms for ${domain}
- Maintain keyword density similar to original
- Preserve heading structure (H1, H2, H3)
- Keep URLs/links functional
- Translate alt text for images
- Adapt meta descriptions to ${targetLanguage} search behavior

CULTURAL ADAPTATION:
- Adapt idioms and expressions (not literal translation)
- Adjust humor/sarcasm if it doesn't translate
- Modify examples to be culturally relevant
- Change units of measurement if needed (metric/imperial)
- Adapt date/time formats to local conventions
- Consider religious/cultural sensitivities
- Use appropriate formality level for ${targetLanguage} culture

CONTENT TYPE SPECIFIC:

${contentType === 'video-description' ? `
VIDEO DESCRIPTION:
- Keep timestamps if present
- Translate chapter markers
- Adapt CTAs to local conventions
- Localize hashtags (research trending tags in ${targetLanguage})
` : ''}

${contentType === 'blog-post' ? `
BLOG POST:
- Translate headings with SEO keywords
- Adapt introduction hook for ${targetLanguage} audience
- Localize examples and case studies
- Translate internal/external link anchor text
- Create ${targetLanguage}-optimized meta description
` : ''}

${contentType === 'social-caption' ? `
SOCIAL CAPTION:
- Adapt emojis if cultural meaning differs
- Localize hashtags (research popular tags)
- Adjust character count for platform limits
- Translate CTAs to natural ${targetLanguage} phrases
- Consider platform popularity in target region
` : ''}

${contentType === 'website-copy' ? `
WEBSITE COPY:
- Maintain brand voice consistency
- Adapt CTAs to local conversion language
- Localize testimonials and social proof
- Translate navigation/UI elements
- Consider local payment/shipping terms
` : ''}

QUALITY CHECKS:
- Grammar and spelling perfect
- Natural flow and readability
- No awkward literal translations
- Cultural appropriateness verified
- SEO keywords integrated naturally
- Tone matches original
- Length similar to original (±10%)

LOCALIZATION BEST PRACTICES:
- Research local search behavior for ${domain} in ${targetLanguage}
- Use region-specific terminology (e.g., UK vs US English, Latin American vs Spain Spanish)
- Adapt currency, measurements, dates to local format
- Consider local regulations/legal requirements
- Use local examples and references when possible

Generate the translation now in JSON format with all required fields.`;
}
