/**
 * Blog Post Prompt
 * Optimized for SEO, readability, and comprehensive content
 */

export interface BlogPostInput {
  transcript: string;
  domain: string;
  keywords: string[];
  language?: string;
  wordCount?: number;
  seoFocus?: string;
}

export function generateBlogPostPrompt(input: BlogPostInput): string {
  const { transcript, domain, keywords, language = 'English', wordCount = 1500, seoFocus } = input;

  return `You are an expert blog writer and SEO specialist with expertise in ${domain} content.

TASK: Create a comprehensive, SEO-optimized blog post from the provided content.

CONTENT:
${transcript}

DOMAIN: ${domain}
KEYWORDS: ${keywords.join(', ')}
LANGUAGE: ${language}
TARGET WORD COUNT: ${wordCount} words
${seoFocus ? `PRIMARY SEO KEYWORD: ${seoFocus}` : `PRIMARY SEO KEYWORD: ${keywords[0]}`}

OUTPUT FORMAT:
{
  "seo": {
    "title": "SEO-optimized title (50-60 chars, include primary keyword)",
    "meta_description": "Compelling meta description (150-160 chars, include primary keyword)",
    "slug": "url-friendly-slug-with-primary-keyword",
    "primary_keyword": "${seoFocus || keywords[0]}",
    "secondary_keywords": ["2-3 secondary keywords from list"],
    "keyword_density": "Target 1-2% for primary keyword"
  },
  "structure": {
    "title": "H1 title (engaging + SEO)",
    "introduction": {
      "hook": "Opening sentence (grab attention)",
      "problem": "Pain point or question",
      "promise": "What reader will learn",
      "word_count": "100-150 words"
    },
    "body": [
      {
        "heading": "H2 heading (include keyword variation)",
        "subheadings": ["H3 subheading 1", "H3 subheading 2"],
        "content": "Section content with examples, data, tips",
        "word_count": "200-300 words"
      }
    ],
    "conclusion": {
      "summary": "Key takeaways (3-5 bullet points)",
      "cta": "Clear call-to-action",
      "word_count": "100-150 words"
    }
  },
  "content": "Full blog post in markdown format with proper headings",
  "internal_links": ["Suggested internal link anchor texts"],
  "external_links": ["Suggested authoritative sources to link"],
  "images": [
    {"placement": "After intro", "alt_text": "SEO-optimized alt text", "description": "What image should show"},
    {"placement": "Mid-article", "alt_text": "SEO-optimized alt text", "description": "What image should show"}
  ],
  "featured_snippet_opportunity": "Question + concise answer (40-60 words) for Google featured snippet",
  "faq_section": [
    {"question": "Common question 1", "answer": "Concise answer"},
    {"question": "Common question 2", "answer": "Concise answer"}
  ]
}

REQUIREMENTS:

SEO OPTIMIZATION:
- Include primary keyword in: title, first paragraph, H2 headings, conclusion
- Use keyword variations naturally (no keyword stuffing)
- Target keyword density: 1-2%
- Include LSI keywords (semantically related terms)
- Optimize for featured snippets (concise answers to questions)
- Add FAQ section for "People Also Ask" boxes
- Use descriptive alt text for images

CONTENT STRUCTURE:
- H1: One per post (main title)
- H2: Major sections (3-5 sections)
- H3: Subsections within H2s
- Paragraphs: 2-4 sentences max (readability)
- Lists: Use bullet points and numbered lists
- Bold: Emphasize key points
- Links: 2-3 internal, 2-3 external authoritative sources

READABILITY:
- Write at 8th-grade reading level
- Use short sentences (15-20 words average)
- Use active voice (not passive)
- Include examples and analogies
- Break up text with subheadings every 300 words
- Use transition words (however, therefore, additionally)

ENGAGEMENT:
- Start with hook (question, stat, story)
- Use "you" language (second person)
- Include actionable tips
- Add data/statistics when relevant
- End with clear CTA

BLOG POST STRUCTURE:
1. Title (H1) - Include primary keyword
2. Introduction (100-150 words)
   - Hook sentence
   - Problem/question
   - What reader will learn
3. Body (${wordCount - 300} words)
   - H2: Main Point 1
     - H3: Subpoint 1.1
     - H3: Subpoint 1.2
   - H2: Main Point 2
     - H3: Subpoint 2.1
     - H3: Subpoint 2.2
   - H2: Main Point 3
     - H3: Subpoint 3.1
4. FAQ Section (optional but recommended)
5. Conclusion (100-150 words)
   - Summary of key points
   - Call-to-action

CONTENT TYPES BY DOMAIN:
${domain === 'Food & Cooking' ? '- Recipe format, ingredients list, step-by-step instructions' : ''}
${domain === 'Education & Learning' ? '- Tutorial format, learning objectives, practice exercises' : ''}
${domain === 'Technology' ? '- How-to guides, comparisons, technical explanations' : ''}
${domain === 'Travel & Adventure' ? '- Destination guides, itineraries, travel tips' : ''}

Generate the complete blog post now in JSON format with full markdown content.`;
}
