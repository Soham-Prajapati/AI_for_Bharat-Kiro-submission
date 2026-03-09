/**
 * Regional Network Types
 * Shared types for the Regional Network feature
 */

export type RegionType = 'north' | 'south' | 'east' | 'west';
export type LanguageType = 'hindi' | 'bengali' | 'tamil' | 'telugu' | 'marathi' | 'gujarati' | 'kannada' | 'malayalam' | 'odia';
export type CollaborationStatus = 'pending' | 'accepted' | 'rejected' | 'completed';
export type AudienceType = 'beginners' | 'intermediate' | 'expert' | 'general' | 'youth' | 'professional';

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
  handle: string;
  region: RegionType;
  city: string;
  languages: LanguageType[];
  niche: string;
  /** Total combined followers across all platforms */
  audienceSize: number;
  /** Followers broken down per platform */
  followersByPlatform: Record<string, number>;
  /** Dominant audience type */
  audienceType: AudienceType;
  platforms: string[];
  bio: string;
  lookingForCollabs: boolean;
  verified: boolean;
  /** Tailwind gradient classes for avatar background */
  avatarColor: string;
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

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  type: 'message' | 'collab_request' | 'agent_update';
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
