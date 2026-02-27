/**
 * Cultural Adapter Service
 * Adapts content for regional audiences by localizing cultural references,
 * idioms, festivals, currency, measurements, and more
 */

import { GitHubModelsService } from './github-models.service';

interface CulturalAdaptationRequest {
  content: string;
  sourceRegion?: string; // Optional, can be auto-detected
  targetRegion: string;
  contentType?: 'video' | 'blog' | 'social' | 'marketing';
  preserveOriginalMeaning?: boolean; // Default: true
}

interface CulturalAdaptationResult {
  adaptedContent: string;
  changes: CulturalChange[];
  confidence: number;
  sourceRegion: string;
  targetRegion: string;
  adaptationSummary: string;
}

interface CulturalChange {
  original: string;
  adapted: string;
  category: 'idiom' | 'festival' | 'currency' | 'measurement' | 'food' | 'reference' | 'custom';
  reasoning: string;
}

interface RegionProfile {
  name: string;
  languages: string[];
  currency: { code: string; symbol: string };
  measurementSystem: 'metric' | 'imperial';
  dateFormat: string;
  majorFestivals: string[];
  commonIdioms: string[];
  culturalNorms: string[];
}

export class CulturalAdapterService {
  private githubModels: GitHubModelsService;
  private regionProfiles: Map<string, RegionProfile>;

  constructor() {
    this.githubModels = new GitHubModelsService();
    this.regionProfiles = this.initializeRegionProfiles();
  }

  /**
   * Main method: Adapt content for target region
   */
  async adaptContent(request: CulturalAdaptationRequest): Promise<CulturalAdaptationResult> {
    // Auto-detect source region if not provided
    const sourceRegion = request.sourceRegion || (await this.detectSourceRegion(request.content));

    // Get region profiles
    const sourceProfile = this.regionProfiles.get(sourceRegion);
    const targetProfile = this.regionProfiles.get(request.targetRegion);

    if (!sourceProfile || !targetProfile) {
      throw new Error(`Unsupported region: ${!sourceProfile ? sourceRegion : request.targetRegion}`);
    }

    // Use AI to adapt content
    const adaptationResult = await this.adaptWithAI(
      request.content,
      sourceProfile,
      targetProfile,
      request.contentType || 'social',
      request.preserveOriginalMeaning !== false
    );

    return adaptationResult;
  }

  /**
   * Batch adapt content for multiple regions
   */
  async adaptToMultipleRegions(
    content: string,
    targetRegions: string[],
    options?: Partial<CulturalAdaptationRequest>
  ): Promise<Map<string, CulturalAdaptationResult>> {
    const results = new Map<string, CulturalAdaptationResult>();

    await Promise.all(
      targetRegions.map(async (region) => {
        const result = await this.adaptContent({
          content,
          targetRegion: region,
          ...options,
        });
        results.set(region, result);
      })
    );

    return results;
  }

  /**
   * Detect source region from content
   */
  private async detectSourceRegion(content: string): Promise<string> {
    const prompt = `Analyze this content and identify the source region/culture based on cultural references, idioms, festivals, currency, measurements, etc.

Content: "${content.substring(0, 500)}"

Return ONLY the region code from: india, us, uk, canada, australia, singapore, uae, brazil, mexico

Region code:`;

    try {
      const response = await this.githubModels.generate(prompt, {
        temperature: 0.3,
        maxTokens: 50,
      });

      const detectedRegion = response.trim().toLowerCase();
      return this.regionProfiles.has(detectedRegion) ? detectedRegion : 'us'; // Default to US
    } catch (error) {
      console.error('Error detecting source region:', error);
      return 'us'; // Default fallback
    }
  }

  /**
   * AI-powered content adaptation
   */
  private async adaptWithAI(
    content: string,
    sourceProfile: RegionProfile,
    targetProfile: RegionProfile,
    contentType: string,
    preserveMeaning: boolean
  ): Promise<CulturalAdaptationResult> {
    const prompt = `You are a cultural localization expert. Adapt the following content from ${sourceProfile.name} to ${targetProfile.name}.

**Source Region:** ${sourceProfile.name}
- Currency: ${sourceProfile.currency.code}
- Measurement: ${sourceProfile.measurementSystem}
- Major Festivals: ${sourceProfile.majorFestivals.join(', ')}

**Target Region:** ${targetProfile.name}
- Currency: ${targetProfile.currency.code}
- Measurement: ${targetProfile.measurementSystem}
- Major Festivals: ${targetProfile.majorFestivals.join(', ')}

**Content Type:** ${contentType}
**Preserve Original Meaning:** ${preserveMeaning ? 'Yes' : 'No'}

**Original Content:**
${content}

**Instructions:**
1. Replace cultural references (festivals, holidays, traditions) with equivalent ones from target region
2. Convert currency (${sourceProfile.currency.code} → ${targetProfile.currency.code})
3. Convert measurements (${sourceProfile.measurementSystem} → ${targetProfile.measurementSystem})
4. Adapt idioms and expressions to target culture
5. Localize food references, sports, celebrities if relevant
6. Maintain the original tone and message
7. Ensure natural flow in target culture context

**Output Format (JSON):**
{
  "adaptedContent": "fully adapted content here",
  "changes": [
    {
      "original": "original phrase",
      "adapted": "adapted phrase",
      "category": "idiom|festival|currency|measurement|food|reference|custom",
      "reasoning": "why this change was made"
    }
  ],
  "confidence": 0.85,
  "adaptationSummary": "brief summary of key adaptations made"
}

Return ONLY valid JSON:`;

    try {
      const response = await this.githubModels.generate(prompt, {
        temperature: 0.7,
        maxTokens: 2000,
      });

      // Parse AI response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid AI response format');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        adaptedContent: parsed.adaptedContent,
        changes: parsed.changes || [],
        confidence: parsed.confidence || 0.7,
        sourceRegion: sourceProfile.name,
        targetRegion: targetProfile.name,
        adaptationSummary: parsed.adaptationSummary || 'Content adapted for target region',
      };
    } catch (error) {
      console.error('Error in AI adaptation:', error);
      // Fallback: basic adaptation
      return this.basicAdaptation(content, sourceProfile, targetProfile);
    }
  }

  /**
   * Fallback: Basic rule-based adaptation
   */
  private basicAdaptation(
    content: string,
    sourceProfile: RegionProfile,
    targetProfile: RegionProfile
  ): CulturalAdaptationResult {
    let adaptedContent = content;
    const changes: CulturalChange[] = [];

    // Currency conversion
    if (sourceProfile.currency.code !== targetProfile.currency.code) {
      const currencyRegex = new RegExp(`\\${sourceProfile.currency.symbol}(\\d+)`, 'g');
      adaptedContent = adaptedContent.replace(currencyRegex, (match, amount) => {
        changes.push({
          original: match,
          adapted: `${targetProfile.currency.symbol}${amount}`,
          category: 'currency',
          reasoning: `Converted currency from ${sourceProfile.currency.code} to ${targetProfile.currency.code}`,
        });
        return `${targetProfile.currency.symbol}${amount}`;
      });
    }

    // Measurement conversion (basic)
    if (sourceProfile.measurementSystem !== targetProfile.measurementSystem) {
      // Miles to kilometers
      if (sourceProfile.measurementSystem === 'imperial' && targetProfile.measurementSystem === 'metric') {
        adaptedContent = adaptedContent.replace(/(\d+)\s*miles?/gi, (match, num) => {
          const km = Math.round(parseFloat(num) * 1.60934);
          changes.push({
            original: match,
            adapted: `${km} km`,
            category: 'measurement',
            reasoning: 'Converted miles to kilometers',
          });
          return `${km} km`;
        });
      }
    }

    // Festival replacements (basic examples)
    const festivalMappings: Record<string, Record<string, string>> = {
      us: { Thanksgiving: 'harvest festival', 'Fourth of July': 'national day' },
      india: { Diwali: 'festival of lights', Holi: 'spring festival' },
    };

    const sourceFestivals = festivalMappings[sourceProfile.name.toLowerCase()] || {};
    Object.entries(sourceFestivals).forEach(([festival, generic]) => {
      if (adaptedContent.includes(festival)) {
        const targetFestival = targetProfile.majorFestivals[0] || generic;
        adaptedContent = adaptedContent.replace(new RegExp(festival, 'gi'), targetFestival);
        changes.push({
          original: festival,
          adapted: targetFestival,
          category: 'festival',
          reasoning: `Replaced ${sourceProfile.name} festival with ${targetProfile.name} equivalent`,
        });
      }
    });

    return {
      adaptedContent,
      changes,
      confidence: 0.6,
      sourceRegion: sourceProfile.name,
      targetRegion: targetProfile.name,
      adaptationSummary: `Basic adaptation applied: ${changes.length} changes made`,
    };
  }

  /**
   * Get adaptation preview (show what would change without applying)
   */
  async getAdaptationPreview(
    content: string,
    targetRegion: string
  ): Promise<{ changes: CulturalChange[]; summary: string }> {
    const result = await this.adaptContent({ content, targetRegion });
    return {
      changes: result.changes,
      summary: result.adaptationSummary,
    };
  }

  /**
   * Compare adaptations across multiple regions
   */
  async compareRegionalAdaptations(
    content: string,
    regions: string[]
  ): Promise<Map<string, { adaptedContent: string; changeCount: number }>> {
    const results = await this.adaptToMultipleRegions(content, regions);
    const comparison = new Map<string, { adaptedContent: string; changeCount: number }>();

    results.forEach((result, region) => {
      comparison.set(region, {
        adaptedContent: result.adaptedContent,
        changeCount: result.changes.length,
      });
    });

    return comparison;
  }

  /**
   * Initialize region profiles
   */
  private initializeRegionProfiles(): Map<string, RegionProfile> {
    const profiles = new Map<string, RegionProfile>();

    profiles.set('india', {
      name: 'India',
      languages: ['Hindi', 'English', 'Bengali', 'Tamil', 'Telugu', 'Marathi', 'Gujarati', 'Kannada', 'Malayalam'],
      currency: { code: 'INR', symbol: '₹' },
      measurementSystem: 'metric',
      dateFormat: 'DD/MM/YYYY',
      majorFestivals: ['Diwali', 'Holi', 'Eid', 'Christmas', 'Durga Puja', 'Ganesh Chaturthi'],
      commonIdioms: ['Aam ke aam guthliyon ke dam', 'Naach na jaane aangan tedha'],
      culturalNorms: ['Respect for elders', 'Joint family system', 'Vegetarianism common', 'Cricket is religion'],
    });

    profiles.set('us', {
      name: 'United States',
      languages: ['English', 'Spanish'],
      currency: { code: 'USD', symbol: '$' },
      measurementSystem: 'imperial',
      dateFormat: 'MM/DD/YYYY',
      majorFestivals: ['Thanksgiving', 'Fourth of July', 'Christmas', 'Halloween', 'Memorial Day'],
      commonIdioms: ['Break a leg', 'Piece of cake', 'Hit the nail on the head'],
      culturalNorms: ['Individualism', 'Direct communication', 'Tipping culture', 'American football'],
    });

    profiles.set('uk', {
      name: 'United Kingdom',
      languages: ['English'],
      currency: { code: 'GBP', symbol: '£' },
      measurementSystem: 'metric',
      dateFormat: 'DD/MM/YYYY',
      majorFestivals: ['Christmas', 'Easter', 'Bonfire Night', 'Boxing Day'],
      commonIdioms: ['Bob\'s your uncle', 'It\'s not my cup of tea', 'Chuffed to bits'],
      culturalNorms: ['Queuing culture', 'Politeness', 'Tea culture', 'Football (soccer)'],
    });

    profiles.set('canada', {
      name: 'Canada',
      languages: ['English', 'French'],
      currency: { code: 'CAD', symbol: 'C$' },
      measurementSystem: 'metric',
      dateFormat: 'DD/MM/YYYY',
      majorFestivals: ['Canada Day', 'Thanksgiving', 'Christmas', 'Victoria Day'],
      commonIdioms: ['Double-double', 'Toque', 'Loonie and toonie'],
      culturalNorms: ['Multiculturalism', 'Politeness', 'Hockey culture', 'Bilingualism'],
    });

    profiles.set('australia', {
      name: 'Australia',
      languages: ['English'],
      currency: { code: 'AUD', symbol: 'A$' },
      measurementSystem: 'metric',
      dateFormat: 'DD/MM/YYYY',
      majorFestivals: ['Australia Day', 'ANZAC Day', 'Christmas', 'Melbourne Cup'],
      commonIdioms: ['No worries', 'Fair dinkum', 'She\'ll be right'],
      culturalNorms: ['Laid-back attitude', 'Beach culture', 'BBQ culture', 'Cricket and AFL'],
    });

    profiles.set('singapore', {
      name: 'Singapore',
      languages: ['English', 'Mandarin', 'Malay', 'Tamil'],
      currency: { code: 'SGD', symbol: 'S$' },
      measurementSystem: 'metric',
      dateFormat: 'DD/MM/YYYY',
      majorFestivals: ['Chinese New Year', 'Hari Raya', 'Deepavali', 'National Day'],
      commonIdioms: ['Kiasu', 'Shiok', 'Paiseh'],
      culturalNorms: ['Multiculturalism', 'Food culture', 'Efficiency', 'Cleanliness'],
    });

    profiles.set('uae', {
      name: 'United Arab Emirates',
      languages: ['Arabic', 'English'],
      currency: { code: 'AED', symbol: 'د.إ' },
      measurementSystem: 'metric',
      dateFormat: 'DD/MM/YYYY',
      majorFestivals: ['Eid al-Fitr', 'Eid al-Adha', 'National Day', 'Ramadan'],
      commonIdioms: ['Inshallah', 'Mashallah', 'Yalla'],
      culturalNorms: ['Islamic values', 'Hospitality', 'Luxury lifestyle', 'Expat culture'],
    });

    profiles.set('brazil', {
      name: 'Brazil',
      languages: ['Portuguese'],
      currency: { code: 'BRL', symbol: 'R$' },
      measurementSystem: 'metric',
      dateFormat: 'DD/MM/YYYY',
      majorFestivals: ['Carnival', 'Festa Junina', 'Christmas', 'Independence Day'],
      commonIdioms: ['Dar um jeitinho', 'Saudade', 'Tudo bem'],
      culturalNorms: ['Warmth and friendliness', 'Football culture', 'Beach culture', 'Family-oriented'],
    });

    profiles.set('mexico', {
      name: 'Mexico',
      languages: ['Spanish'],
      currency: { code: 'MXN', symbol: 'Mex$' },
      measurementSystem: 'metric',
      dateFormat: 'DD/MM/YYYY',
      majorFestivals: ['Day of the Dead', 'Independence Day', 'Christmas', 'Cinco de Mayo'],
      commonIdioms: ['No hay mal que por bien no venga', 'Más vale tarde que nunca'],
      culturalNorms: ['Family values', 'Festive culture', 'Food culture', 'Respect for traditions'],
    });

    return profiles;
  }

  /**
   * Get list of supported regions
   */
  getSupportedRegions(): string[] {
    return Array.from(this.regionProfiles.keys());
  }

  /**
   * Get region profile details
   */
  getRegionProfile(region: string): RegionProfile | undefined {
    return this.regionProfiles.get(region);
  }
}

export const culturalAdapterService = new CulturalAdapterService();
