/**
 * Mock Transcript Generator Service
 * 
 * Generates realistic mock transcripts for demo purposes.
 * In production, this would be replaced with a real speech-to-text API.
 * 
 * Features:
 * - Generate realistic transcripts (50-200 words) about various topics
 * - Extract 3-5 key points from generated transcript
 * - Deterministic generation based on fileId for consistency
 * 
 * Requirements: 4.2, 4.3
 */

import { logger } from '../utils/logger';
import * as fs from 'fs';
import * as path from 'path';

export interface TranscriptResult {
  transcript: string;
  keyPoints: string[];
  wordCount: number;
}

/**
 * Mock transcript templates for various content types
 */
const TRANSCRIPT_TEMPLATES = [
  {
    topic: 'productivity',
    transcript: `Welcome everyone! Today I want to share three powerful productivity hacks that completely transformed how I work. First, the two-minute rule: if something takes less than two minutes, do it immediately. This prevents small tasks from piling up and cluttering your mind. Second, time blocking. Instead of a simple to-do list, I schedule specific time blocks for each task. This creates accountability and helps me estimate how long things actually take. Third, the power of saying no. Every yes to something unimportant is a no to something that matters. I've learned to protect my time fiercely. These three strategies helped me double my output while working fewer hours. The key is consistency - start with one habit, master it, then add the next. Remember, productivity isn't about doing more things, it's about doing the right things effectively. Try implementing just one of these this week and see the difference it makes in your workflow.`,
    keyPoints: [
      'Two-minute rule: Complete tasks under 2 minutes immediately',
      'Time blocking creates accountability and better time estimation',
      'Saying no protects time for important priorities',
      'Consistency is key - master one habit before adding another',
      'Productivity is about doing the right things effectively'
    ]
  },
  {
    topic: 'technology',
    transcript: `Artificial intelligence is revolutionizing how we work and live. Machine learning algorithms can now process vast amounts of data in seconds, identifying patterns humans would miss. Natural language processing enables computers to understand and generate human-like text. Computer vision allows machines to interpret images and videos with remarkable accuracy. But with great power comes great responsibility. We must consider ethical implications: bias in training data, privacy concerns, and the impact on employment. The future isn't about AI replacing humans, but augmenting our capabilities. Developers need to prioritize transparency and fairness in their algorithms. Companies must invest in retraining programs for workers whose jobs are affected. Governments should establish clear regulations that protect citizens while fostering innovation. The AI revolution is here, and how we navigate it will define the next century. We have the opportunity to create technology that serves humanity's best interests.`,
    keyPoints: [
      'AI processes data and identifies patterns at unprecedented speed',
      'Natural language processing and computer vision are key AI capabilities',
      'Ethical considerations include bias, privacy, and employment impact',
      'AI should augment human capabilities, not replace them',
      'Transparency, fairness, and regulation are essential for responsible AI'
    ]
  },
  {
    topic: 'health',
    transcript: `Let's talk about building sustainable healthy habits. Many people start strong with New Year's resolutions but burn out within weeks. The secret is starting small and building gradually. Instead of overhauling your entire life overnight, focus on one tiny habit. Want to exercise more? Start with just five minutes a day. Want to eat healthier? Add one vegetable to one meal. These micro-habits feel effortless, which means you'll actually stick with them. Once they become automatic, you can gradually increase the intensity. The compound effect is powerful - small improvements add up to remarkable results over time. Another crucial factor is environment design. Make healthy choices the easy choices. Keep fruit visible on the counter. Lay out your workout clothes the night before. Remove temptations from your home. Your environment shapes your behavior more than willpower ever will. Remember, sustainable change happens through consistency, not intensity.`,
    keyPoints: [
      'Start with tiny habits instead of overwhelming life overhauls',
      'Micro-habits feel effortless and lead to better adherence',
      'Compound effect: small improvements create remarkable long-term results',
      'Environment design makes healthy choices easier than willpower',
      'Sustainable change requires consistency over intensity'
    ]
  },
  {
    topic: 'business',
    transcript: `Building a successful startup requires more than just a great idea. Market timing is crucial - even the best product will fail if the market isn't ready. Customer discovery should happen before you write a single line of code. Talk to potential customers, understand their pain points, validate that they'll actually pay for your solution. Many founders fall in love with their solution and forget to validate the problem. Fundraising is important, but profitability is better. Bootstrap when possible to maintain control and focus on revenue from day one. Build a strong team that complements your weaknesses. A mediocre idea with an excellent team will outperform a brilliant idea with a poor team every time. Stay lean and iterate quickly based on customer feedback. The market will tell you what to build if you listen carefully. Pivot when necessary - flexibility is a strength, not a weakness. Most successful companies look very different from their initial vision.`,
    keyPoints: [
      'Market timing and customer discovery are crucial before building',
      'Validate that customers will pay before falling in love with your solution',
      'Profitability and bootstrapping provide control and focus',
      'Strong complementary teams outperform brilliant ideas with poor execution',
      'Stay lean, iterate quickly, and pivot when market feedback demands it'
    ]
  },
  {
    topic: 'creativity',
    transcript: `Creativity isn't a mystical gift reserved for artists. It's a skill anyone can develop with practice. The key is creating space for ideas to emerge. Our best insights rarely come when we're forcing them. They appear in the shower, during walks, or right before sleep. This is because our subconscious mind continues working on problems even when we're not actively thinking about them. To boost creativity, consume diverse inputs. Read widely across different fields. Have conversations with people outside your industry. Travel to new places. Novel experiences create new neural connections. Keep an idea journal and capture thoughts immediately - inspiration is fleeting. Don't judge ideas too quickly. The best innovations often sound ridiculous at first. Embrace constraints - limitations force creative problem-solving. Set deadlines to prevent endless perfectionism. Share your work before it feels ready. Feedback accelerates improvement. Remember, creativity is about connecting existing ideas in new ways. The more diverse your knowledge base, the more connections you can make.`,
    keyPoints: [
      'Creativity is a developable skill, not an innate gift',
      'Best insights emerge when not forcing them - subconscious processing is key',
      'Diverse inputs and novel experiences create new neural connections',
      'Capture ideas immediately and avoid premature judgment',
      'Constraints, deadlines, and early sharing accelerate creative output'
    ]
  },
  {
    topic: 'education',
    transcript: `The traditional education system was designed for the industrial age, but we're living in the information age. Memorizing facts made sense when information was scarce. Now, with the internet, information is abundant. What matters is critical thinking, creativity, and the ability to learn continuously. Students need to learn how to learn, not just what to learn. Project-based learning is far more effective than passive lectures. When students work on real problems, they develop deeper understanding and practical skills. Personalized learning paths respect that everyone learns differently and at different paces. Technology enables this customization at scale. Teachers should be facilitators and mentors, not just information deliverers. The most valuable skills for the future are adaptability, emotional intelligence, and complex problem-solving. These can't be automated. We need to redesign education around these competencies. Lifelong learning isn't optional anymore - it's essential for staying relevant in a rapidly changing world.`,
    keyPoints: [
      'Traditional education designed for industrial age needs updating for information age',
      'Critical thinking and learning how to learn matter more than memorizing facts',
      'Project-based learning develops deeper understanding than passive lectures',
      'Personalized learning paths and teacher-as-facilitator improve outcomes',
      'Adaptability, emotional intelligence, and lifelong learning are essential future skills'
    ]
  },
  {
    topic: 'marketing',
    transcript: `Modern marketing is about building relationships, not interrupting people. Traditional advertising is losing effectiveness as consumers become more skeptical and ad-blind. Content marketing works because it provides value before asking for anything in return. Create content that educates, entertains, or inspires your target audience. Focus on solving their problems, not promoting your product. When you consistently deliver value, trust builds naturally. Social proof is incredibly powerful - testimonials, case studies, and user-generated content are more persuasive than any sales pitch. Authenticity matters more than polish. People connect with real stories and genuine personalities. Micro-influencers often deliver better ROI than celebrities because their audiences are more engaged and trusting. Email marketing isn't dead - it's still one of the highest-converting channels when done right. Personalization and segmentation are key. Track metrics that matter: customer lifetime value, not just vanity metrics like followers. The best marketing doesn't feel like marketing at all.`,
    keyPoints: [
      'Modern marketing builds relationships through value, not interruption',
      'Content marketing that solves problems builds trust naturally',
      'Social proof and authenticity are more persuasive than sales pitches',
      'Micro-influencers and email marketing deliver strong ROI when personalized',
      'Focus on customer lifetime value over vanity metrics'
    ]
  },
  {
    topic: 'travel',
    transcript: `Join me on this incredible journey as I explore breathtaking destinations and hidden gems. Traveling opens your mind to new perspectives and cultures you never knew existed. The best adventures often happen when you step off the beaten path and embrace the unexpected. Local experiences and authentic encounters create memories that last a lifetime. From stunning landscapes to vibrant street scenes, every moment tells a story worth sharing. Photography and video capture these fleeting moments so we can relive them forever. Travel isn't just about the destination - it's about the journey, the people you meet, and the transformation that happens along the way. Whether you're exploring ancient temples, pristine beaches, or bustling markets, each place has its own unique energy. The key is to travel with an open heart and curious spirit. These experiences shape who we become and remind us how vast and beautiful our world truly is.`,
    keyPoints: [
      'Traveling opens your mind to new perspectives and cultures',
      'The best adventures happen off the beaten path',
      'Local experiences create memories that last a lifetime',
      'Every destination has its own unique energy and story',
      'Travel transforms who we become'
    ]
  },
  {
    topic: 'vlog',
    transcript: `Hey everyone, welcome back to my channel! Today I'm taking you along on a day in my life. From morning routines to spontaneous adventures, I want to share the real, unfiltered moments that make life special. Vlogging has taught me to appreciate the small things and find beauty in everyday moments. Whether I'm trying new food, exploring my neighborhood, or just hanging out with friends, there's always something worth documenting. The connection I've built with this community means everything to me. Your comments and support keep me motivated to create and share more. Behind the scenes, there's a lot of planning and editing, but the authentic moments are what make it all worthwhile. Life isn't always perfect, and I think that's what makes these videos relatable. Thanks for being part of this journey with me - now let's see what today has in store!`,
    keyPoints: [
      'Vlogging captures real, unfiltered moments that make life special',
      'Finding beauty in everyday moments is key',
      'Community connection and support drives content creation',
      'Authentic moments make content relatable',
      'Life isn\'t perfect - embrace the journey'
    ]
  },
  {
    topic: 'memory',
    transcript: `Some moments in life stay with us forever, shaping who we are and how we see the world. This is a collection of those precious memories, captured so they can be cherished for years to come. Looking back at these moments reminds us of the joy, the laughter, and the connections that matter most. Whether it's a special trip, a celebration, or just quality time with loved ones, these memories tell our story. The sights, sounds, and feelings come rushing back when we revisit these moments. Creating lasting memories is about being present and embracing each experience fully. These aren't just videos - they're time capsules that preserve our happiest moments. Sharing these memories connects us with others who were there and introduces new friends to our journey. Every memory captured is a treasure, a reminder of life's beautiful moments that we can return to whenever we need a smile.`,
    keyPoints: [
      'Precious memories shape who we are',
      'Looking back reminds us of joy and connections that matter',
      'Being present helps create lasting memories',
      'Videos are time capsules preserving happiest moments',
      'Sharing memories connects us with others'
    ]
  },
  {
    topic: 'lifestyle',
    transcript: `Welcome to a glimpse into my daily life and the things that bring me joy. From morning rituals to evening wind-downs, I believe in living intentionally and making the most of each day. Lifestyle content isn't about perfection - it's about sharing inspiration and ideas that might resonate with you. Whether it's home organization, self-care routines, or finding balance, we're all on this journey together. I love discovering new ways to make everyday moments more meaningful. The small details often make the biggest difference in how we feel. Creating a life you love takes time and intention, but it's so worth it. I hope these videos inspire you to try something new or simply enjoy the moment. Remember, your lifestyle is uniquely yours - embrace it and make it beautiful in your own way.`,
    keyPoints: [
      'Living intentionally makes the most of each day',
      'Lifestyle content is about inspiration, not perfection',
      'Small details make the biggest difference',
      'Creating a life you love takes intention',
      'Your lifestyle is uniquely yours - embrace it'
    ]
  }
];

/**
 * MockTranscriptService class
 * Generates realistic mock transcripts for demo purposes
 */
class MockTranscriptService {
  private readonly MAX_TEXT_TRANSCRIPT_LENGTH = 8000;

  /**
   * Generate a mock transcript based on fileId
   * Uses fileId as seed for deterministic generation
   * 
   * @param fileId - The uploaded file ID (used as seed)
   * @param fileName - The file name (optional, for context)
   * @returns TranscriptResult with transcript and key points
   */
  generateTranscript(fileId: string, fileName?: string, contextHint?: string): TranscriptResult {
    logger.info('Generating mock transcript', { fileId, fileName, contextHint });
    
    const contentHint = [fileName, contextHint].filter(Boolean).join(' ');

    // Use context-aware template selection first, then fallback to deterministic fileId hash
    const template = this.selectTemplate(fileId, contentHint);
    
    // Get the transcript
    const transcript = this.buildContextualTranscript(template.transcript, fileName, contentHint);
    
    // Extract 3-5 key points (randomly select subset for variety)
    const numPoints = 3 + (this.hashString(fileId + 'points') % 3); // 3-5 points
    const keyPoints = this.selectKeyPoints(template.keyPoints, numPoints, fileId);
    
    // Calculate word count
    const wordCount = transcript.split(/\s+/).filter(w => w.trim()).length;
    
    logger.info('Mock transcript generated', {
      fileId,
      topic: template.topic,
      wordCount,
      keyPointsCount: keyPoints.length
    });
    
    return {
      transcript,
      keyPoints,
      wordCount
    };
  }

  /**
   * Read transcript directly from local text-based uploads.
   * Returns null when file is missing, non-text, or unreadable.
   */
  generateTranscriptFromLocalFile(
    localPath: string,
    fileId: string,
    fileName?: string,
    mimeType?: string
  ): TranscriptResult | null {
    try {
      if (!localPath || !fs.existsSync(localPath)) {
        return null;
      }

      const extension = path.extname(fileName || localPath).toLowerCase();
      const normalizedMimeType = (mimeType || '').toLowerCase();
      const isTextMime = normalizedMimeType.startsWith('text/')
        || normalizedMimeType.includes('json')
        || normalizedMimeType.includes('xml')
        || normalizedMimeType.includes('javascript')
        || normalizedMimeType.includes('typescript');
      const isTextExtension = [
        '.txt', '.md', '.markdown', '.json', '.csv', '.xml', '.yaml', '.yml', '.log', '.html', '.htm', '.js', '.ts'
      ].includes(extension);

      if (!isTextMime && !isTextExtension) {
        return null;
      }

      const rawText = fs.readFileSync(localPath, 'utf-8');
      const cleanedText = rawText
        .replace(/\u0000/g, ' ')
        .replace(/\r\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

      if (!cleanedText) {
        return null;
      }

      const transcript = cleanedText.length > this.MAX_TEXT_TRANSCRIPT_LENGTH
        ? `${cleanedText.slice(0, this.MAX_TEXT_TRANSCRIPT_LENGTH)}\n\n[Truncated for processing]`
        : cleanedText;

      const extractedKeyPoints = this.extractKeyPoints(transcript);
      const keyPoints = extractedKeyPoints.length > 0
        ? extractedKeyPoints.slice(0, 5)
        : this.generateTranscript(fileId, fileName, transcript.slice(0, 400)).keyPoints;

      const wordCount = transcript.split(/\s+/).filter(w => w.trim()).length;

      logger.info('Transcript generated from local text file', {
        fileId,
        fileName,
        localPath,
        wordCount,
      });

      return {
        transcript,
        keyPoints,
        wordCount,
      };
    } catch (error) {
      logger.warn('Falling back to mock transcript generation', {
        fileId,
        fileName,
        localPath,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  /**
   * Select transcript template using context keywords when available.
   * Falls back to dynamic generation based on filename, then deterministic fileId hashing.
   */
  private selectTemplate(fileId: string, contextHint: string): typeof TRANSCRIPT_TEMPLATES[number] {
    // Strip generic phone/messenger filename patterns that carry zero semantic signal.
    // E.g. "WhatsApp Video Mar 9 2026", "IMG_20260309_123456", "VID-20260309-WA0003"
    const GENERIC_FILENAME_RE = /^(whatsapp\s*(video|image|audio)|img[_\s]\d|vid[_\s-]\d|dsc[_\s]\d|mov[_\s]\d|mvi[_\s]\d|dcim|video\s*\d|photo\s*\d)/i;
    const stripped = (contextHint || '')
      .replace(/\.(mp4|mov|avi|mp3|wav|m4a|webm|mkv|jpg|jpeg|png)$/i, '')
      .replace(/[_\-\.]+/g, ' ')
      .replace(/\d{6,}/g, '') // strip long date/timestamp strings
      .trim();

    const normalized = stripped.toLowerCase();

    // If the remaining name looks like a generic device/messenger filename, skip keyword
    // matching entirely and go straight to the dynamic or hash-based fallback.
    const isGenericFilename = GENERIC_FILENAME_RE.test(normalized) || normalized.length < 4;

    const topicKeywords: Record<string, string[]> = {
      productivity: ['productivity', 'workflow', 'focus', 'habit', 'routine', 'efficiency', 'task', 'time management'],
      technology: ['tech', 'technology', 'artificial intelligence', 'software', 'coding', 'developer', 'saas', 'automation', 'machine learning', 'neural', 'chatgpt'],
      health: ['health', 'fitness', 'wellness', 'diet', 'workout', 'nutrition', 'mental health', 'exercise', 'gym'],
      business: ['business', 'startup', 'sales', 'founder', 'entrepreneur', 'revenue', 'growth hacking'],
      creativity: ['creative', 'design', 'storytelling', 'writing', 'art', 'illustration'],
      education: ['education', 'learning', 'study', 'course', 'teaching', 'student', 'tutorial', 'lecture'],
      marketing: ['marketing', 'branding', 'audience', 'engagement', 'seo', 'campaign', 'digital marketing'],
      travel: ['travel', 'trip', 'journey', 'destination', 'explore', 'adventure', 'vacation', 'holiday', 'tour'],
      vlog: ['vlog', 'day in my life', 'daily routine', 'behind the scenes', 'my life', 'follow me'],
      memory: ['memory', 'memories', 'throwback', 'nostalgia', 'moments', 'highlights', 'recap'],
      lifestyle: ['lifestyle', 'aesthetic', 'cozy', 'minimal', 'morning routine', 'evening routine', 'self care'],
    };

    if (!isGenericFilename) {
      for (const template of TRANSCRIPT_TEMPLATES) {
        const keywords = topicKeywords[template.topic] || [];
        // Use whole-word boundary matching to prevent partial matches like
        // "whatsapp".includes("app") → technology, or "travel".includes("art") → creativity.
        if (keywords.some((keyword) => new RegExp(`\\b${keyword.replace(/[-\s]/g, '[\\s_-]')}\\b`, 'i').test(normalized))) {
          return template;
        }
      }
    }

    // No topic matched (or generic filename) — generate dynamic content from the filename.
    const dynamicTemplate = this.generateDynamicTemplate(isGenericFilename ? '' : contextHint);
    if (dynamicTemplate) {
      return dynamicTemplate;
    }

    const templateIndex = this.hashString(fileId) % TRANSCRIPT_TEMPLATES.length;
    return TRANSCRIPT_TEMPLATES[templateIndex];
  }

  /**
   * Generate a dynamic transcript template based on filename/context.
   * Returns null when the context is empty or too short to be meaningful
   * (e.g. a generic WhatsApp/device filename that was already stripped).
   */
  private generateDynamicTemplate(contextHint: string): typeof TRANSCRIPT_TEMPLATES[number] | null {
    if (!contextHint || contextHint.trim().length < 4) {
      return null;
    }

    // Clean up the context to extract meaningful words
    const cleanedContext = contextHint
      .replace(/\.(mp4|mov|avi|mp3|wav|m4a|webm|mkv)$/i, '')
      .replace(/[_\-\.]+/g, ' ')
      .replace(/\d{6,}/g, '') // Remove long date/timestamp strings
      .trim();

    // If nothing meaningful remains after stripping, bail out
    if (!cleanedContext || cleanedContext.replace(/\s/g, '').length < 4) {
      return null;
    }

    const title = cleanedContext
      .split(' ')
      .filter(w => w.length > 0)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    const transcript = `Welcome to "${title}" - a special piece of content that captures something truly unique. This video showcases the essence of ${cleanedContext.toLowerCase()}, bringing you an authentic and engaging experience. Whether you're discovering this for the first time or revisiting a favourite moment, there's something here for everyone. The story unfolds naturally, highlighting the key elements that make ${cleanedContext.toLowerCase()} so compelling. From the opening scene to the final frame, every detail has been crafted to resonate with viewers. We explore the themes, emotions, and visuals that define this content. The journey through ${cleanedContext.toLowerCase()} reveals insights and moments worth sharing. As we dive deeper, you'll notice the care and intention behind each segment. This isn't just content - it's an experience designed to connect, inspire, and leave a lasting impression. Thank you for being here and being part of this ${cleanedContext.toLowerCase()} journey.`;

    const keyPoints = [
      `Discover the unique story of ${title}`,
      `Explore authentic moments and experiences from ${cleanedContext.toLowerCase()}`,
      `Key highlights and memorable scenes from the content`,
      `Insights and themes that make ${title} compelling`,
      `A journey worth sharing and revisiting`
    ];

    return {
      topic: 'dynamic',
      transcript,
      keyPoints
    };
  }

  /**
   * Build a contextual transcript that integrates the filename/context throughout.
   * Skips injection when the filename is a generic device/messenger pattern so
   * we don't produce nonsensical intros like "Welcome to WhatsApp Video Mar 9 2026".
   */
  private buildContextualTranscript(baseTranscript: string, fileName?: string, contextHint?: string): string {
    const GENERIC_FILENAME_RE = /^(whatsapp\s*(video|image|audio)|img[_\s]\d|vid[_\s-]\d|dsc[_\s]\d|mov[_\s]\d|mvi[_\s]\d|dcim|video\s*\d|photo\s*\d)/i;

    const clean = (s: string) => s
      .replace(/\.(mp4|mov|avi|mp3|wav|m4a|webm|mkv)$/i, '')
      .replace(/[_\-\.]+/g, ' ')
      .replace(/\d{6,}/g, '')
      .trim();

    const cleanedFileName = clean(fileName || '');
    const cleanedContext  = clean(contextHint || '');
    const contextLabel    = cleanedFileName || cleanedContext;

    // Skip injection for generic device/messenger filenames or when no meaningful label exists
    if (!contextLabel || contextLabel.length < 4 || GENERIC_FILENAME_RE.test(contextLabel)) {
      return baseTranscript;
    }

    const titleCased = contextLabel
      .split(' ')
      .filter(w => w.length > 0)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    const intro = `Welcome to "${titleCased}"! In this content, we're exploring what makes ${contextLabel.toLowerCase()} so special.`;
    const outro = `That's our deep dive into ${titleCased}. I hope you found this ${contextLabel.toLowerCase()} journey valuable and inspiring.`;

    return `${intro}\n\n${baseTranscript}\n\n${outro}`;
  }
  
  /**
   * Extract key points from a transcript
   * This is a simplified version - in production, would use NLP
   * 
   * @param transcript - The transcript text
   * @returns Array of key points
   */
  extractKeyPoints(transcript: string): string[] {
    // Split into sentences
    const sentences = transcript
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 20); // Filter out very short sentences
    
    // Simple heuristic: look for sentences with key indicators
    const keyIndicators = [
      'first', 'second', 'third', 'key', 'important', 'crucial',
      'remember', 'the secret', 'the key is', 'what matters',
      'you need to', 'you should', 'you must', 'essential'
    ];
    
    const keyPointCandidates = sentences.filter(sentence => {
      const lowerSentence = sentence.toLowerCase();
      return keyIndicators.some(indicator => lowerSentence.includes(indicator));
    });
    
    // If we found key sentences, use them; otherwise use first few sentences
    const selectedSentences = keyPointCandidates.length >= 3
      ? keyPointCandidates.slice(0, 5)
      : sentences.slice(0, 5);
    
    // Clean up and return
    return selectedSentences
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .slice(0, 5); // Max 5 key points
  }
  
  /**
   * Select a subset of key points deterministically
   * 
   * @param allPoints - All available key points
   * @param count - Number of points to select
   * @param seed - Seed for deterministic selection
   * @returns Selected key points
   */
  private selectKeyPoints(allPoints: string[], count: number, seed: string): string[] {
    // If we need all or more points than available, return all
    if (count >= allPoints.length) {
      return [...allPoints];
    }
    
    // Deterministically select points based on seed
    const selected: string[] = [];
    const indices = new Set<number>();
    
    for (let i = 0; i < count; i++) {
      let index = this.hashString(seed + i) % allPoints.length;
      
      // Ensure we don't select the same point twice
      while (indices.has(index)) {
        index = (index + 1) % allPoints.length;
      }
      
      indices.add(index);
      selected.push(allPoints[index]);
    }
    
    return selected;
  }
  
  /**
   * Simple hash function for deterministic randomness
   * 
   * @param str - String to hash
   * @returns Hash value
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
  
  /**
   * Get available transcript topics
   * Useful for testing and documentation
   * 
   * @returns Array of available topics
   */
  getAvailableTopics(): string[] {
    return TRANSCRIPT_TEMPLATES.map(t => t.topic);
  }
  
  /**
   * Get transcript by topic (for testing)
   * 
   * @param topic - The topic name
   * @returns TranscriptResult or null if topic not found
   */
  getTranscriptByTopic(topic: string): TranscriptResult | null {
    const template = TRANSCRIPT_TEMPLATES.find(t => t.topic === topic);
    
    if (!template) {
      logger.warn('Topic not found', { topic });
      return null;
    }
    
    return {
      transcript: template.transcript,
      keyPoints: template.keyPoints,
      wordCount: template.transcript.split(/\s+/).filter(w => w.trim()).length
    };
  }
}

// Export singleton instance
export const mockTranscriptService = new MockTranscriptService();

// Export class for testing
export { MockTranscriptService };
