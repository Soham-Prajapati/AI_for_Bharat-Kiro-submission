/**
 * Regional Network Types
 * Shared types for the Regional Network feature
 */

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
  matchScore: number;
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
