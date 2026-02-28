/**
 * Regional Network Service
 * 
 * Connects creators by region and language for local collaboration.
 * Creates regional hubs (North, South, East, West India), language-based groups,
 * and provides intelligent creator matching for collaborations.
 * 
 * Features:
 * - 4 regional hubs covering all of India
 * - 9 language-based groups (Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, Odia)
 * - Creator matching algorithm (by region, language, niche, audience size)
 * - Collaboration request system with status tracking
 * - Regional analytics and insights
 */

import { GitHubModelsService } from './github-models.service';

// ============================================================================
// TYPES
// ============================================================================

export type RegionType = 'north' | 'south' | 'east' | 'west';
export type LanguageType = 'hindi' | 'bengali' | 'tamil' | 'telugu' | 'marathi' | 'gujarati' | 'kannada' | 'malayalam' | 'odia';
export type CollaborationStatus = 'pending' | 'accepted' | 'rejected' | 'completed';

export interface Region {
  id: string;
  name: string;
  type: RegionType;
  states: string[];
  languages: LanguageType[];
  creatorCount: number;
  topNiches: string[];
  averageAudienceSize: number;
}

export interface Creator {
  id: string;
  name: string;
  region: RegionType;
  languages: LanguageType[];
  niche: string;
  audienceSize: number;
  platforms: string[];
  bio: string;
  lookingForCollabs: boolean;
  collaborationPreferences: {
    regions: RegionType[];
    languages: LanguageType[];
    niches: string[];
    minAudienceSize?: number;
    maxAudienceSize?: number;
  };
}

export interface LanguageGroup {
  language: LanguageType;
  creatorCount: number;
  regions: RegionType[];
  topNiches: string[];
  totalAudience: number;
}

export interface CollaborationMatch {
  creator1: Creator;
  creator2: Creator;
  matchScore: number; // 0-100
  matchReasons: string[];
  suggestedCollabType: string;
  potentialReach: number;
}

export interface CollaborationRequest {
  id: string;
  fromCreatorId: string;
  toCreatorId: string;
  status: CollaborationStatus;
  message: string;
  collabType: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegionalAnalytics {
  totalCreators: number;
  creatorsByRegion: Record<RegionType, number>;
  creatorsByLanguage: Record<LanguageType, number>;
  topNiches: Array<{ niche: string; count: number }>;
  collaborationStats: {
    totalRequests: number;
    acceptanceRate: number;
    completedCollabs: number;
  };
}

// ============================================================================
// SERVICE
// ============================================================================

export class RegionalNetworkService {
  private githubModels: GitHubModelsService;

  // Regional hub definitions
  private readonly REGIONS: Region[] = [
    {
      id: 'north',
      name: 'North India',
      type: 'north',
      states: ['Delhi', 'Punjab', 'Haryana', 'Uttar Pradesh', 'Uttarakhand', 'Himachal Pradesh', 'Jammu & Kashmir', 'Rajasthan'],
      languages: ['hindi'],
      creatorCount: 0,
      topNiches: [],
      averageAudienceSize: 0,
    },
    {
      id: 'south',
      name: 'South India',
      type: 'south',
      states: ['Tamil Nadu', 'Karnataka', 'Kerala', 'Andhra Pradesh', 'Telangana', 'Puducherry'],
      languages: ['tamil', 'telugu', 'kannada', 'malayalam'],
      creatorCount: 0,
      topNiches: [],
      averageAudienceSize: 0,
    },
    {
      id: 'east',
      name: 'East India',
      type: 'east',
      states: ['West Bengal', 'Odisha', 'Bihar', 'Jharkhand', 'Assam', 'Sikkim', 'Arunachal Pradesh', 'Nagaland', 'Manipur', 'Mizoram', 'Tripura', 'Meghalaya'],
      languages: ['bengali', 'odia'],
      creatorCount: 0,
      topNiches: [],
      averageAudienceSize: 0,
    },
    {
      id: 'west',
      name: 'West India',
      type: 'west',
      states: ['Maharashtra', 'Gujarat', 'Goa', 'Madhya Pradesh', 'Chhattisgarh'],
      languages: ['marathi', 'gujarati', 'hindi'],
      creatorCount: 0,
      topNiches: [],
      averageAudienceSize: 0,
    },
  ];

  constructor() {
    this.githubModels = new GitHubModelsService();
  }

  // ============================================================================
  // MAIN METHODS
  // ============================================================================

  /**
   * Get all regional hubs with statistics
   */
  async getRegionalHubs(): Promise<Region[]> {
    // In production, fetch from database
    // For now, return mock data with realistic statistics
    return this.REGIONS.map(region => ({
      ...region,
      creatorCount: this.getMockCreatorCount(region.type),
      topNiches: this.getMockTopNiches(region.type),
      averageAudienceSize: this.getMockAverageAudience(region.type),
    }));
  }

  /**
   * Get creators in a specific region
   */
  async getCreatorsByRegion(region: RegionType, filters?: {
    language?: LanguageType;
    niche?: string;
    minAudienceSize?: number;
  }): Promise<Creator[]> {
    // In production, query database with filters
    // For now, return mock creators
    const mockCreators = this.generateMockCreators(region, 20);

    // Apply filters
    let filtered = mockCreators;
    if (filters?.language) {
      filtered = filtered.filter(c => c.languages.includes(filters.language!));
    }
    if (filters?.niche) {
      filtered = filtered.filter(c => c.niche.toLowerCase().includes(filters.niche!.toLowerCase()));
    }
    if (filters?.minAudienceSize) {
      filtered = filtered.filter(c => c.audienceSize >= filters.minAudienceSize!);
    }

    return filtered;
  }

  /**
   * Get language-based groups
   */
  async getLanguageGroups(): Promise<LanguageGroup[]> {
    const languages: LanguageType[] = ['hindi', 'bengali', 'tamil', 'telugu', 'marathi', 'gujarati', 'kannada', 'malayalam', 'odia'];

    return languages.map(lang => ({
      language: lang,
      creatorCount: this.getMockLanguageCreatorCount(lang),
      regions: this.getRegionsForLanguage(lang),
      topNiches: this.getMockLanguageNiches(lang),
      totalAudience: this.getMockLanguageTotalAudience(lang),
    }));
  }

  /**
   * Find collaboration matches for a creator
   */
  async findCollaborationMatches(creatorId: string, limit: number = 10): Promise<CollaborationMatch[]> {
    // In production, fetch creator from database
    const creator = await this.getCreatorById(creatorId);
    if (!creator) {
      throw new Error('Creator not found');
    }

    // Get potential matches based on preferences
    const potentialMatches = await this.getPotentialMatches(creator);

    // Calculate match scores
    const matches = potentialMatches.map(match => 
      this.calculateMatch(creator, match)
    );

    // Sort by match score and return top N
    return matches
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);
  }

  /**
   * Create a collaboration request
   */
  async createCollaborationRequest(
    fromCreatorId: string,
    toCreatorId: string,
    message: string,
    collabType: string
  ): Promise<CollaborationRequest> {
    // In production, save to database
    const request: CollaborationRequest = {
      id: `collab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fromCreatorId,
      toCreatorId,
      status: 'pending',
      message,
      collabType,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return request;
  }

  /**
   * Update collaboration request status
   */
  async updateCollaborationStatus(
    requestId: string,
    status: CollaborationStatus
  ): Promise<CollaborationRequest> {
    // In production, update in database
    // For now, return mock updated request
    return {
      id: requestId,
      fromCreatorId: 'creator1',
      toCreatorId: 'creator2',
      status,
      message: 'Let\'s collaborate!',
      collabType: 'video',
      createdAt: new Date(Date.now() - 86400000), // 1 day ago
      updatedAt: new Date(),
    };
  }

  /**
   * Get collaboration requests for a creator
   */
  async getCollaborationRequests(
    creatorId: string,
    type: 'sent' | 'received' = 'received'
  ): Promise<CollaborationRequest[]> {
    // In production, query database
    // For now, return mock requests
    return this.generateMockCollaborationRequests(creatorId, type, 5);
  }

  /**
   * Get regional analytics
   */
  async getRegionalAnalytics(): Promise<RegionalAnalytics> {
    const regions = await this.getRegionalHubs();
    const languageGroups = await this.getLanguageGroups();

    const creatorsByRegion: Record<RegionType, number> = {
      north: regions.find(r => r.type === 'north')?.creatorCount || 0,
      south: regions.find(r => r.type === 'south')?.creatorCount || 0,
      east: regions.find(r => r.type === 'east')?.creatorCount || 0,
      west: regions.find(r => r.type === 'west')?.creatorCount || 0,
    };

    const creatorsByLanguage: Record<LanguageType, number> = {
      hindi: languageGroups.find(l => l.language === 'hindi')?.creatorCount || 0,
      bengali: languageGroups.find(l => l.language === 'bengali')?.creatorCount || 0,
      tamil: languageGroups.find(l => l.language === 'tamil')?.creatorCount || 0,
      telugu: languageGroups.find(l => l.language === 'telugu')?.creatorCount || 0,
      marathi: languageGroups.find(l => l.language === 'marathi')?.creatorCount || 0,
      gujarati: languageGroups.find(l => l.language === 'gujarati')?.creatorCount || 0,
      kannada: languageGroups.find(l => l.language === 'kannada')?.creatorCount || 0,
      malayalam: languageGroups.find(l => l.language === 'malayalam')?.creatorCount || 0,
      odia: languageGroups.find(l => l.language === 'odia')?.creatorCount || 0,
    };

    return {
      totalCreators: Object.values(creatorsByRegion).reduce((sum, count) => sum + count, 0),
      creatorsByRegion,
      creatorsByLanguage,
      topNiches: this.aggregateTopNiches(regions),
      collaborationStats: {
        totalRequests: 1250,
        acceptanceRate: 0.68,
        completedCollabs: 420,
      },
    };
  }

  // ============================================================================
  // MATCHING ALGORITHM
  // ============================================================================

  /**
   * Calculate match score between two creators
   */
  private calculateMatch(creator1: Creator, creator2: Creator): CollaborationMatch {
    let score = 0;
    const reasons: string[] = [];

    // Region match (20 points)
    if (creator1.region === creator2.region) {
      score += 20;
      reasons.push('Same region - easier to meet and collaborate');
    } else if (creator1.collaborationPreferences.regions.includes(creator2.region)) {
      score += 10;
      reasons.push('Open to cross-regional collaboration');
    }

    // Language match (25 points)
    const commonLanguages = creator1.languages.filter(lang => 
      creator2.languages.includes(lang)
    );
    if (commonLanguages.length > 0) {
      score += 25;
      reasons.push(`Shared language: ${commonLanguages.join(', ')}`);
    }

    // Niche compatibility (30 points)
    const nicheMatch = this.calculateNicheCompatibility(creator1.niche, creator2.niche);
    score += nicheMatch;
    if (nicheMatch > 20) {
      reasons.push('Highly compatible content niches');
    } else if (nicheMatch > 10) {
      reasons.push('Complementary content niches');
    }

    // Audience size compatibility (15 points)
    const audienceMatch = this.calculateAudienceSizeMatch(
      creator1.audienceSize,
      creator2.audienceSize
    );
    score += audienceMatch;
    if (audienceMatch > 10) {
      reasons.push('Similar audience sizes - balanced collaboration');
    }

    // Platform overlap (10 points)
    const commonPlatforms = creator1.platforms.filter(p => 
      creator2.platforms.includes(p)
    );
    if (commonPlatforms.length > 0) {
      score += 10;
      reasons.push(`Active on same platforms: ${commonPlatforms.join(', ')}`);
    }

    // Determine suggested collaboration type
    const suggestedCollabType = this.suggestCollaborationType(creator1, creator2);

    // Calculate potential reach
    const potentialReach = creator1.audienceSize + creator2.audienceSize;

    return {
      creator1,
      creator2,
      matchScore: Math.min(score, 100),
      matchReasons: reasons,
      suggestedCollabType,
      potentialReach,
    };
  }

  /**
   * Calculate niche compatibility score
   */
  private calculateNicheCompatibility(niche1: string, niche2: string): number {
    // Exact match
    if (niche1.toLowerCase() === niche2.toLowerCase()) {
      return 30;
    }

    // Use AI to determine compatibility
    // For now, use simple keyword matching
    const keywords1 = niche1.toLowerCase().split(/\s+/);
    const keywords2 = niche2.toLowerCase().split(/\s+/);
    const commonKeywords = keywords1.filter(k => keywords2.includes(k));

    if (commonKeywords.length > 0) {
      return 20;
    }

    // Complementary niches (e.g., "cooking" and "food review")
    const complementaryPairs = [
      ['cooking', 'food'],
      ['tech', 'gaming'],
      ['fitness', 'health'],
      ['travel', 'photography'],
      ['education', 'tutorial'],
    ];

    for (const [a, b] of complementaryPairs) {
      if (
        (niche1.toLowerCase().includes(a) && niche2.toLowerCase().includes(b)) ||
        (niche1.toLowerCase().includes(b) && niche2.toLowerCase().includes(a))
      ) {
        return 15;
      }
    }

    return 5; // Default low score
  }

  /**
   * Calculate audience size match score
   */
  private calculateAudienceSizeMatch(size1: number, size2: number): number {
    const ratio = Math.min(size1, size2) / Math.max(size1, size2);

    if (ratio > 0.7) return 15; // Very similar
    if (ratio > 0.4) return 10; // Somewhat similar
    if (ratio > 0.2) return 5;  // Different but acceptable
    return 2; // Very different
  }

  /**
   * Suggest collaboration type based on creator profiles
   */
  private suggestCollaborationType(creator1: Creator, creator2: Creator): string {
    // Same niche → joint video
    if (creator1.niche === creator2.niche) {
      return 'Joint video or series';
    }

    // Complementary niches → cross-promotion
    if (this.calculateNicheCompatibility(creator1.niche, creator2.niche) > 10) {
      return 'Cross-promotion or guest appearance';
    }

    // Different niches → challenge or experiment
    return 'Collaborative challenge or experiment';
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Get potential matches for a creator
   */
  private async getPotentialMatches(creator: Creator): Promise<Creator[]> {
    // In production, query database with creator's preferences
    // For now, generate mock creators from preferred regions
    const matches: Creator[] = [];

    for (const region of creator.collaborationPreferences.regions) {
      const regionCreators = await this.getCreatorsByRegion(region);
      matches.push(...regionCreators.filter(c => c.id !== creator.id));
    }

    return matches;
  }

  /**
   * Get creator by ID
   */
  private async getCreatorById(creatorId: string): Promise<Creator | null> {
    // In production, fetch from database
    // For now, return mock creator
    return {
      id: creatorId,
      name: 'Sample Creator',
      region: 'north',
      languages: ['hindi'],
      niche: 'Technology',
      audienceSize: 50000,
      platforms: ['youtube', 'instagram'],
      bio: 'Tech content creator',
      lookingForCollabs: true,
      collaborationPreferences: {
        regions: ['north', 'west'],
        languages: ['hindi'],
        niches: ['technology', 'gaming'],
        minAudienceSize: 10000,
      },
    };
  }

  /**
   * Get regions where a language is spoken
   */
  private getRegionsForLanguage(language: LanguageType): RegionType[] {
    return this.REGIONS
      .filter(r => r.languages.includes(language))
      .map(r => r.type);
  }

  /**
   * Aggregate top niches across regions
   */
  private aggregateTopNiches(regions: Region[]): Array<{ niche: string; count: number }> {
    const nicheCounts: Record<string, number> = {};

    for (const region of regions) {
      for (const niche of region.topNiches) {
        nicheCounts[niche] = (nicheCounts[niche] || 0) + 1;
      }
    }

    return Object.entries(nicheCounts)
      .map(([niche, count]) => ({ niche, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  // ============================================================================
  // MOCK DATA GENERATORS
  // ============================================================================

  private getMockCreatorCount(region: RegionType): number {
    const counts = { north: 3500, south: 2800, east: 1200, west: 2100 };
    return counts[region];
  }

  private getMockTopNiches(region: RegionType): string[] {
    const niches: Record<RegionType, string[]> = {
      north: ['Technology', 'Education', 'Comedy', 'Food', 'Travel'],
      south: ['Food', 'Film Review', 'Education', 'Music', 'Technology'],
      east: ['Education', 'Culture', 'Food', 'Travel', 'Art'],
      west: ['Business', 'Food', 'Fashion', 'Technology', 'Entertainment'],
    };
    return niches[region];
  }

  private getMockAverageAudience(region: RegionType): number {
    const averages = { north: 45000, south: 38000, east: 25000, west: 42000 };
    return averages[region];
  }

  private getMockLanguageCreatorCount(language: LanguageType): number {
    const counts: Record<LanguageType, number> = {
      hindi: 4200,
      bengali: 980,
      tamil: 1500,
      telugu: 1100,
      marathi: 850,
      gujarati: 720,
      kannada: 650,
      malayalam: 580,
      odia: 420,
    };
    return counts[language];
  }

  private getMockLanguageNiches(language: LanguageType): string[] {
    // Most languages share similar popular niches
    return ['Education', 'Entertainment', 'Food', 'Technology', 'Lifestyle'];
  }

  private getMockLanguageTotalAudience(language: LanguageType): number {
    const audiences: Record<LanguageType, number> = {
      hindi: 180000000,
      bengali: 42000000,
      tamil: 65000000,
      telugu: 48000000,
      marathi: 35000000,
      gujarati: 28000000,
      kannada: 25000000,
      malayalam: 22000000,
      odia: 18000000,
    };
    return audiences[language];
  }

  private generateMockCreators(region: RegionType, count: number): Creator[] {
    const creators: Creator[] = [];
    const niches = this.getMockTopNiches(region);
    const languages = this.REGIONS.find(r => r.type === region)?.languages || ['hindi'];

    for (let i = 0; i < count; i++) {
      creators.push({
        id: `creator_${region}_${i}`,
        name: `Creator ${i + 1}`,
        region,
        languages: [languages[Math.floor(Math.random() * languages.length)]],
        niche: niches[Math.floor(Math.random() * niches.length)],
        audienceSize: Math.floor(Math.random() * 100000) + 10000,
        platforms: this.getRandomPlatforms(),
        bio: `${niches[Math.floor(Math.random() * niches.length)]} content creator from ${region} India`,
        lookingForCollabs: Math.random() > 0.3,
        collaborationPreferences: {
          regions: this.getRandomRegions(),
          languages: [languages[0]],
          niches: niches.slice(0, 3),
          minAudienceSize: 5000,
        },
      });
    }

    return creators;
  }

  private getRandomPlatforms(): string[] {
    const allPlatforms = ['youtube', 'instagram', 'tiktok', 'twitter', 'linkedin', 'facebook'];
    const count = Math.floor(Math.random() * 3) + 2; // 2-4 platforms
    return allPlatforms.slice(0, count);
  }

  private getRandomRegions(): RegionType[] {
    const allRegions: RegionType[] = ['north', 'south', 'east', 'west'];
    const count = Math.floor(Math.random() * 2) + 1; // 1-2 regions
    return allRegions.slice(0, count);
  }

  private generateMockCollaborationRequests(
    creatorId: string,
    type: 'sent' | 'received',
    count: number
  ): CollaborationRequest[] {
    const requests: CollaborationRequest[] = [];
    const statuses: CollaborationStatus[] = ['pending', 'accepted', 'rejected', 'completed'];

    for (let i = 0; i < count; i++) {
      requests.push({
        id: `collab_${Date.now()}_${i}`,
        fromCreatorId: type === 'sent' ? creatorId : `other_creator_${i}`,
        toCreatorId: type === 'received' ? creatorId : `other_creator_${i}`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        message: 'Would love to collaborate on a video!',
        collabType: ['video', 'series', 'cross-promotion', 'challenge'][Math.floor(Math.random() * 4)],
        createdAt: new Date(Date.now() - Math.random() * 30 * 86400000), // Random date in last 30 days
        updatedAt: new Date(),
      });
    }

    return requests;
  }
}
