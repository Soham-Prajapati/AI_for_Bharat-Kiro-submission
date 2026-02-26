# 🎯 Prompt Engineering Guide — Production-Quality Outputs

> **Goal:** Polish prompts to get outputs that ACTUALLY WORK, not just demo-quality garbage.

---

## 🚨 THE PROBLEM

**Bad prompts = Bad outputs**

Example of BAD prompt:
```
"Generate a YouTube description for this video about cooking."
```

Result: Generic, boring, unusable content.

---

## ✅ THE SOLUTION

**Good prompts = Production-quality outputs**

Example of GOOD prompt:
```
You are a professional YouTube content strategist with 10 years of experience.

Context:
- Video topic: Butter Chicken Recipe
- Creator's style: Casual, friendly, educational
- Target audience: Home cooks aged 25-45
- Video length: 10 minutes
- Key moments: 0:30 (ingredients), 2:15 (cooking), 8:45 (plating)

Task: Generate a YouTube description that:
1. Hooks viewers in the first 2 lines
2. Includes timestamps for key moments
3. Lists all ingredients with measurements
4. Includes 10 SEO keywords naturally
5. Ends with a call-to-action (subscribe + comment)
6. Is 300-400 words
7. Matches the creator's casual, friendly tone

Format:
[Hook - 2 lines]
[Main description - 200 words]
[Timestamps]
[Ingredients list]
[Call-to-action]

Generate now:
```

Result: Professional, usable, SEO-optimized content.

---

## 📋 PROMPT TEMPLATES (Copy-Paste Ready)

### **1. YouTube Description**

```typescript
const youtubeDescriptionPrompt = `
You are a professional YouTube content strategist with 10 years of experience optimizing videos for discovery and engagement.

CONTEXT:
- Video transcript: ${transcript}
- Video domain: ${domain}
- Creator's tone: ${tone} (casual/professional/educational/entertaining)
- Target audience: ${audience}
- Video length: ${duration}
- Key moments: ${timestamps}

TASK:
Generate a YouTube description that:
1. Opens with a compelling hook (2 sentences max)
2. Summarizes the video content (150-200 words)
3. Includes timestamps for key moments (format: 0:00 - Intro)
4. Naturally incorporates these SEO keywords: ${keywords}
5. Ends with a strong call-to-action (subscribe, like, comment)
6. Matches the creator's ${tone} tone
7. Is 300-400 words total

FORMAT:
[Hook - 2 sentences]

[Main description - 150-200 words]

⏱️ TIMESTAMPS:
0:00 - [Section name]
[Additional timestamps]

[Call-to-action - 2 sentences]

CONSTRAINTS:
- No emojis in the hook
- Use bullet points for lists
- Keep paragraphs short (2-3 sentences max)
- Include relevant hashtags at the end (max 5)

Generate the description now:
`;
```

---

### **2. Instagram Caption**

```typescript
const instagramCaptionPrompt = `
You are a social media expert specializing in Instagram content that drives engagement.

CONTEXT:
- Content: ${transcript}
- Domain: ${domain}
- Creator's voice: ${tone}
- Target audience: ${audience}
- Post type: ${postType} (Reel/Post/Story)

TASK:
Generate an Instagram caption that:
1. Hooks attention in the first line (before "...more")
2. Tells a micro-story or shares a valuable insight
3. Includes a question to drive comments
4. Uses 3-5 relevant emojis (not excessive)
5. Ends with a clear call-to-action
6. Is 100-150 words
7. Includes 10-15 hashtags (mix of popular and niche)

FORMAT:
[Hook line - must be compelling]

[Main caption - 80-120 words with emojis]

[Question to drive engagement]

[Call-to-action]

.
.
.
#hashtag1 #hashtag2 [10-15 total]

STYLE GUIDE:
- Use line breaks for readability
- Emojis should enhance, not replace words
- Hashtags should be relevant, not spammy
- Tone should match creator's voice: ${tone}

Generate the caption now:
`;
```

---

### **3. LinkedIn Post**

```typescript
const linkedinPostPrompt = `
You are a LinkedIn content strategist who creates posts that drive professional engagement and thought leadership.

CONTEXT:
- Content: ${transcript}
- Domain: ${domain}
- Creator's expertise: ${expertise}
- Target audience: ${audience}
- Post goal: ${goal} (educate/inspire/share insight/start discussion)

TASK:
Generate a LinkedIn post that:
1. Opens with a bold statement or question
2. Shares a professional insight or lesson
3. Uses storytelling to make it relatable
4. Includes 2-3 key takeaways (bullet points)
5. Ends with a thought-provoking question
6. Is 150-200 words
7. Maintains a professional yet conversational tone

FORMAT:
[Hook - bold statement or question]

[Story or context - 80-100 words]

Key takeaways:
• [Takeaway 1]
• [Takeaway 2]
• [Takeaway 3]

[Closing question to drive comments]

STYLE GUIDE:
- No emojis (professional platform)
- Use short paragraphs (1-2 sentences)
- Include line breaks for readability
- Avoid corporate jargon
- Be authentic and human

Generate the post now:
`;
```

---

### **4. Twitter Thread**

```typescript
const twitterThreadPrompt = `
You are a Twitter content expert who creates viral threads that educate and engage.

CONTEXT:
- Content: ${transcript}
- Domain: ${domain}
- Creator's voice: ${tone}
- Target audience: ${audience}
- Thread goal: ${goal}

TASK:
Generate a Twitter thread (5-7 tweets) that:
1. Tweet 1: Hook that stops scrolling (max 280 chars)
2. Tweets 2-5: Break down the main points (one idea per tweet)
3. Tweet 6: Key takeaway or surprising insight
4. Tweet 7: Call-to-action (retweet, follow, reply)
5. Each tweet is 200-280 characters
6. Uses 1-2 emojis per tweet (strategic placement)
7. Includes relevant hashtags (max 2 per tweet)

FORMAT:
1/ [Hook tweet - must grab attention]

2/ [First main point]

3/ [Second main point]

4/ [Third main point]

5/ [Fourth main point - if needed]

6/ [Key takeaway or insight]

7/ [Call-to-action]

STYLE GUIDE:
- Start with a number (1/, 2/, etc.)
- Use line breaks within tweets for readability
- Include one emoji per tweet (not more)
- Make each tweet valuable on its own
- End with a clear CTA

Generate the thread now:
`;
```

---

### **5. TikTok Caption**

```typescript
const tiktokCaptionPrompt = `
You are a TikTok content creator who understands viral trends and Gen Z language.

CONTEXT:
- Content: ${transcript}
- Domain: ${domain}
- Creator's vibe: ${tone}
- Target audience: ${audience}
- Video hook: ${hook}

TASK:
Generate a TikTok caption that:
1. Hooks attention immediately (first 5 words)
2. Is short and punchy (50-100 characters)
3. Uses trending phrases or sounds (if relevant)
4. Includes 3-5 emojis
5. Ends with a question or CTA
6. Includes 5-8 hashtags (mix of trending and niche)

FORMAT:
[Hook - 5 words max] [Main caption with emojis] [Question/CTA]

#hashtag1 #hashtag2 [5-8 total]

STYLE GUIDE:
- Be casual and conversational
- Use Gen Z language (but not forced)
- Emojis are essential
- Keep it under 100 characters
- Hashtags should include trending ones

Generate the caption now:
`;
```

---

### **6. SEO Keywords Extraction**

```typescript
const seoKeywordsPrompt = `
You are an SEO expert specializing in YouTube and Google search optimization.

CONTEXT:
- Content transcript: ${transcript}
- Domain: ${domain}
- Target audience: ${audience}
- Competitor keywords: ${competitorKeywords}

TASK:
Extract and generate SEO keywords that:
1. Are actually searched by users (high search volume)
2. Match the content accurately (no keyword stuffing)
3. Include long-tail keywords (3-5 words)
4. Cover different search intents (informational, transactional, navigational)
5. Are ranked by priority (high/medium/low competition)

OUTPUT FORMAT:
{
  "primary_keywords": [
    { "keyword": "butter chicken recipe", "volume": "high", "competition": "high" },
    { "keyword": "how to make butter chicken", "volume": "high", "competition": "medium" }
  ],
  "secondary_keywords": [
    { "keyword": "easy butter chicken at home", "volume": "medium", "competition": "low" },
    { "keyword": "authentic butter chicken recipe", "volume": "medium", "competition": "medium" }
  ],
  "long_tail_keywords": [
    { "keyword": "butter chicken recipe without cream", "volume": "low", "competition": "low" },
    { "keyword": "restaurant style butter chicken at home", "volume": "low", "competition": "low" }
  ]
}

CONSTRAINTS:
- Minimum 10 keywords total
- Maximum 20 keywords total
- Keywords must be relevant to the content
- Include search volume estimates (high/medium/low)
- Include competition level (high/medium/low)

Generate the keywords now:
`;
```

---

### **7. Translation (Context-Aware)**

```typescript
const translationPrompt = `
You are a professional translator specializing in ${targetLanguage} with expertise in ${domain} content.

CONTEXT:
- Source text: ${sourceText}
- Source language: ${sourceLanguage}
- Target language: ${targetLanguage}
- Domain: ${domain}
- Tone: ${tone}
- Cultural context: ${culturalContext}

TASK:
Translate the text while:
1. Preserving the original meaning and tone
2. Adapting idioms and cultural references for ${targetLanguage} audience
3. Maintaining the same emotional impact
4. Using natural, native-sounding language (not literal translation)
5. Keeping technical terms accurate
6. Preserving formatting (line breaks, bullet points, etc.)

SPECIAL INSTRUCTIONS:
- If translating to Hindi: Use Devanagari script, handle code-switching naturally
- If translating to regional languages: Adapt cultural references (festivals, food, etc.)
- If the source has humor: Adapt jokes to work in ${targetLanguage}
- If the source has slang: Use equivalent slang in ${targetLanguage}

OUTPUT FORMAT:
{
  "translated_text": "[Full translation]",
  "cultural_adaptations": [
    { "original": "[phrase]", "adapted": "[localized phrase]", "reason": "[why adapted]" }
  ],
  "translator_notes": "[Any important context for the creator]"
}

Translate now:
`;
```

---

### **8. Thumbnail Suggestions**

```typescript
const thumbnailSuggestionsPrompt = `
You are a YouTube thumbnail designer who creates click-worthy thumbnails that drive views.

CONTEXT:
- Video content: ${transcript}
- Domain: ${domain}
- Target audience: ${audience}
- Video frames available: ${frameTimestamps}
- Creator's style: ${style}

TASK:
Suggest 3 thumbnail concepts that:
1. Use high-contrast colors
2. Include 3-5 words of text (large, readable)
3. Show an emotional expression (if person is in frame)
4. Create curiosity or promise value
5. Stand out in a crowded feed
6. Match the creator's brand style

OUTPUT FORMAT:
{
  "thumbnails": [
    {
      "concept": "Thumbnail 1 description",
      "frame_timestamp": "2:15",
      "text_overlay": "BEST BUTTER CHICKEN",
      "text_color": "#FFFFFF",
      "background_color": "#FF6B35",
      "design_notes": "Use frame at 2:15 showing the finished dish. Add bold white text with orange background. Include creator's face in corner showing excitement."
    },
    {
      "concept": "Thumbnail 2 description",
      "frame_timestamp": "5:30",
      "text_overlay": "SECRET INGREDIENT",
      "text_color": "#FFD700",
      "background_color": "#1A1A1A",
      "design_notes": "Use frame at 5:30 showing the secret ingredient. Add gold text on dark background. Create mystery and curiosity."
    },
    {
      "concept": "Thumbnail 3 description",
      "frame_timestamp": "8:45",
      "text_overlay": "RESTAURANT QUALITY",
      "text_color": "#FF0000",
      "background_color": "#FFFFFF",
      "design_notes": "Use frame at 8:45 showing the plated dish. Add red text on white background. Emphasize quality and results."
    }
  ],
  "best_choice": 1,
  "reasoning": "Thumbnail 1 is the best choice because it shows the end result (what viewers want), uses high-contrast colors, and includes the creator's excited expression which builds trust."
}

Generate thumbnail suggestions now:
`;
```

---

## 🎯 PROMPT OPTIMIZATION CHECKLIST

Before using any prompt, verify:

- [ ] **Context is clear:** AI knows the domain, audience, tone
- [ ] **Task is specific:** Exactly what to generate, not vague
- [ ] **Format is defined:** Structure, length, style guide
- [ ] **Constraints are set:** What NOT to do
- [ ] **Examples are included:** (if needed) Show desired output
- [ ] **Output format is structured:** JSON, markdown, plain text

---

## 🧪 TESTING PROMPTS

### **Test Process:**

1. **Run prompt 5 times** with same input
2. **Compare outputs** — Are they consistent?
3. **Check quality** — Would you publish this?
4. **Measure time** — How long does it take?
5. **Calculate cost** — How many tokens used?

### **Quality Metrics:**

- **Relevance:** Does it match the content? (1-10)
- **Tone:** Does it match creator's voice? (1-10)
- **Usability:** Can you publish as-is? (Yes/No)
- **SEO:** Does it include keywords naturally? (1-10)
- **Engagement:** Would it drive clicks/comments? (1-10)

**Target:** 8+ on all metrics

---

## 🚀 IMPLEMENTATION

### **File Structure:**

```
src/prompts/
├── youtube-description.prompt.ts
├── instagram-caption.prompt.ts
├── linkedin-post.prompt.ts
├── twitter-thread.prompt.ts
├── tiktok-caption.prompt.ts
├── seo-keywords.prompt.ts
├── translation.prompt.ts
├── thumbnail-suggestions.prompt.ts
└── index.ts
```

### **Example Implementation:**

```typescript
// src/prompts/youtube-description.prompt.ts
export const generateYouTubeDescriptionPrompt = (params: {
  transcript: string;
  domain: string;
  tone: string;
  audience: string;
  duration: string;
  timestamps: string[];
  keywords: string[];
}): string => {
  return `
You are a professional YouTube content strategist with 10 years of experience optimizing videos for discovery and engagement.

CONTEXT:
- Video transcript: ${params.transcript}
- Video domain: ${params.domain}
- Creator's tone: ${params.tone}
- Target audience: ${params.audience}
- Video length: ${params.duration}
- Key moments: ${params.timestamps.join(', ')}

TASK:
Generate a YouTube description that:
1. Opens with a compelling hook (2 sentences max)
2. Summarizes the video content (150-200 words)
3. Includes timestamps for key moments (format: 0:00 - Intro)
4. Naturally incorporates these SEO keywords: ${params.keywords.join(', ')}
5. Ends with a strong call-to-action (subscribe, like, comment)
6. Matches the creator's ${params.tone} tone
7. Is 300-400 words total

FORMAT:
[Hook - 2 sentences]

[Main description - 150-200 words]

⏱️ TIMESTAMPS:
0:00 - [Section name]
[Additional timestamps]

[Call-to-action - 2 sentences]

CONSTRAINTS:
- No emojis in the hook
- Use bullet points for lists
- Keep paragraphs short (2-3 sentences max)
- Include relevant hashtags at the end (max 5)

Generate the description now:
  `.trim();
};
```

---

## 📊 COST OPTIMIZATION

### **Token Usage:**

- **Bad prompt:** 50 tokens → 500 token output = 550 tokens
- **Good prompt:** 200 tokens → 300 token output = 500 tokens

**Good prompts are MORE EFFICIENT** because they:
- Reduce back-and-forth iterations
- Generate usable output first time
- Require less editing

### **Cost Comparison:**

| Prompt Quality | Iterations | Total Tokens | Cost (Bedrock) |
|----------------|------------|--------------|----------------|
| Bad | 3 | 1,650 | $0.0041 |
| Good | 1 | 500 | $0.0013 |
| **Savings** | **-67%** | **-70%** | **-68%** |

---

## ✅ NEXT STEPS

1. **Copy prompts** to `src/prompts/` folder
2. **Test each prompt** with real data
3. **Measure quality** using metrics above
4. **Iterate and improve** based on results
5. **Document learnings** for team

---

**BOTTOM LINE:** Good prompts = Good outputs = Happy creators = Winning hackathon! 💪🔥🚀
