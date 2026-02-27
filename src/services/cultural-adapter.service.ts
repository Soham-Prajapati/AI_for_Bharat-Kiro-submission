/**
 * Cultural Adapter Service
 * Adapts content for regional audiences
 * Owner: Nidhi (AI Intelligence Lead)
 */

export interface CulturalAdaptation {
  originalContent: string;
  adaptedContent: string;
  targetRegion: string;
  changes: Array<{
    original: string;
    adapted: string;
    type: 'idiom' | 'festival' | 'currency' | 'measurement' | 'reference';
  }>;
  confidence: number;
}

const CULTURAL_MAPPINGS: Record<string, Record<string, string>> = {
  india: {
    'Thanksgiving': 'Diwali',
    'Christmas': 'Diwali',
    'Black Friday': 'Diwali Sale',
    'Super Bowl': 'IPL Finals',
    'dollar': 'rupee',
    'dollars': 'rupees',
    '$': '₹',
    'miles': 'kilometers',
    'feet': 'meters',
    'pounds': 'kilograms'
  },
  uk: {
    'Thanksgiving': 'Christmas',
    'Super Bowl': 'FA Cup Final',
    'dollar': 'pound',
    'dollars': 'pounds',
    '$': '£',
    'miles': 'miles', // UK uses miles
    'feet': 'feet' // UK uses feet
  },
  us: {
    // Default - no changes needed
  }
};

class CulturalAdapterService {
  /**
   * Adapt content for target region
   * TODO: Implement AI-powered cultural adaptation (Nidhi - task 2.5a)
   */
  async adapt(content: string, targetRegion: string): Promise<CulturalAdaptation> {
    const region = targetRegion.toLowerCase();
    const mappings = CULTURAL_MAPPINGS[region] || {};
    
    let adaptedContent = content;
    const changes: CulturalAdaptation['changes'] = [];
    
    // Apply cultural mappings
    for (const [original, adapted] of Object.entries(mappings)) {
      const regex = new RegExp(`\\b${original}\\b`, 'gi');
      if (regex.test(adaptedContent)) {
        adaptedContent = adaptedContent.replace(regex, adapted);
        changes.push({
          original,
          adapted,
          type: this.getChangeType(original)
        });
      }
    }
    
    return {
      originalContent: content,
      adaptedContent,
      targetRegion,
      changes,
      confidence: changes.length > 0 ? 0.85 : 1.0
    };
  }
  
  private getChangeType(term: string): 'idiom' | 'festival' | 'currency' | 'measurement' | 'reference' {
    const festivals = ['thanksgiving', 'christmas', 'diwali', 'black friday'];
    const currencies = ['dollar', 'dollars', '$', 'pound', 'pounds', '£', 'rupee', 'rupees', '₹'];
    const measurements = ['miles', 'feet', 'pounds', 'kilometers', 'meters', 'kilograms'];
    const references = ['super bowl', 'ipl', 'fa cup'];
    
    const lower = term.toLowerCase();
    if (festivals.includes(lower)) return 'festival';
    if (currencies.includes(lower)) return 'currency';
    if (measurements.includes(lower)) return 'measurement';
    if (references.some(ref => lower.includes(ref))) return 'reference';
    return 'idiom';
  }
  
  getSupportedRegions(): string[] {
    return ['india', 'uk', 'us', 'canada', 'australia'];
  }
}

export const culturalAdapterService = new CulturalAdapterService();
