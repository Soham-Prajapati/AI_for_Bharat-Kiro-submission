/**
 * Regional Network UI - TypeScript Type Definitions
 * Feature #25: Regional creator discovery and collaboration
 */

// ============================================================================
// CORE TYPES
// ============================================================================

export type Language = 
  | 'english' 
  | 'hindi' 
  | 'tamil' 
  | 'telugu' 
  | 'kannada' 
  | 'malayalam' 
  | 'bengali' 
  | 'marathi' 
  | 'gujarati';

export type Region = 
  | 'north' 
  | 'south' 
  | 'east' 
  | 'west' 
  | 'central' 
  | 'northeast';

export type ContentDomain = 
  | 'education' 
  | 'food' 
  | 'travel' 
  | 'product_reviews' 
  | 'entertainment' 
  | 'fitness' 
  | 'technology' 
  | 'business';

export type CollaborationStatus = 
  | 'pending' 
  | 'accepted' 
  | 'rejected' 
  | 'cancelled';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

// ============================================================================
// REGION TYPES
// ============================================================================

export interface RegionData {
  id: string;
  name: string;
  code: Region;
  languages: Language[];
  creatorCount: number;
  popularDomains: ContentDomain[];
  description?: string;
}

export interface RegionStats {
  regionId: string;
  totalCreators: number;
  activeCreators: number;
  totalCollaborations: number;
  averageEngagement: number;
  topLanguages: Array<{
    language: Language;
    percentage: number;
  }>;
  topDomains: Array<{
    domain: ContentDomain;
    count: number;
  }>;
}

// ============================================================================
// CREATOR TYPES
// ============================================================================

export interface CreatorProfile {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  bio?: string;
  region: Region;
  languages: Language[];
  primaryDomain: ContentDomain;
  secondaryDomains?: ContentDomain[];
  skills: CreatorSkill[];
  stats: CreatorStats;
  socialLinks?: SocialLinks;
  verified: boolean;
  availableForCollab: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatorSkill {
  name: string;
  level: SkillLevel;
  yearsOfExperience?: number;
}

export interface CreatorStats {
  totalFollowers: number;
  totalViews: number;
  engagementRate: number;
  contentCount: number;
  collaborationCount: number;
  rating: number;
  reviewCount: number;
}

export interface SocialLinks {
  youtube?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  tiktok?: string;
  facebook?: string;
}

// ============================================================================
// COLLABORATION TYPES
// ============================================================================

export interface CollaborationRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: CollaborationStatus;
  message: string;
  proposedProject?: ProjectProposal;
  createdAt: string;
  updatedAt: string;
  respondedAt?: string;
}

export interface ProjectProposal {
  title: string;
  description: string;
  domain: ContentDomain;
  estimatedDuration?: string;
  budget?: {
    min: number;
    max: number;
    currency: string;
  };
  deliverables?: string[];
}

export interface CollaborationThread {
  requestId: string;
  messages: CollaborationMessage[];
  participants: string[];
  status: CollaborationStatus;
}

export interface CollaborationMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

// ============================================================================
// FILTER & SEARCH TYPES
// ============================================================================

export interface CreatorFilters {
  regions?: Region[];
  languages?: Language[];
  domains?: ContentDomain[];
  skills?: string[];
  minFollowers?: number;
  maxFollowers?: number;
  minEngagement?: number;
  availableOnly?: boolean;
  verifiedOnly?: boolean;
  minRating?: number;
}

export interface SearchParams extends CreatorFilters {
  query?: string;
  sortBy?: 'relevance' | 'followers' | 'engagement' | 'rating' | 'recent';
  sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// PAGINATION TYPES
// ============================================================================

export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

// ============================================================================
// API REQUEST TYPES
// ============================================================================

export interface GetRegionsRequest {
  includeStats?: boolean;
}

export interface GetRegionsResponse {
  success: boolean;
  regions: RegionData[];
  stats?: Record<string, RegionStats>;
}

export interface GetCreatorsRequest extends SearchParams, PaginationParams {
  regionId?: string;
}

export interface GetCreatorsResponse {
  success: boolean;
  creators: PaginatedResponse<CreatorProfile>;
  filters: {
    availableLanguages: Language[];
    availableDomains: ContentDomain[];
    availableSkills: string[];
  };
}

export interface GetCreatorRequest {
  creatorId: string;
  includeStats?: boolean;
}

export interface GetCreatorResponse {
  success: boolean;
  creator: CreatorProfile;
  recentContent?: Array<{
    id: string;
    title: string;
    domain: ContentDomain;
    views: number;
    engagement: number;
    createdAt: string;
  }>;
}

export interface SendCollaborationRequest {
  receiverId: string;
  message: string;
  proposal?: ProjectProposal;
}

export interface SendCollaborationResponse {
  success: boolean;
  request: CollaborationRequest;
  message: string;
}

export interface GetCollaborationRequestsRequest {
  type: 'sent' | 'received';
  status?: CollaborationStatus;
  page?: number;
  limit?: number;
}

export interface GetCollaborationRequestsResponse {
  success: boolean;
  requests: PaginatedResponse<CollaborationRequest>;
}

export interface UpdateCollaborationRequest {
  requestId: string;
  status: CollaborationStatus;
  message?: string;
}

export interface UpdateCollaborationResponse {
  success: boolean;
  request: CollaborationRequest;
  message: string;
}

// ============================================================================
// WEBSOCKET TYPES (Optional Real-time Updates)
// ============================================================================

export type WebSocketEventType = 
  | 'collaboration_request_received'
  | 'collaboration_request_accepted'
  | 'collaboration_request_rejected'
  | 'collaboration_message_received'
  | 'creator_status_changed';

export interface WebSocketEvent {
  type: WebSocketEventType;
  payload: any;
  timestamp: string;
}

export interface CollaborationRequestReceivedEvent extends WebSocketEvent {
  type: 'collaboration_request_received';
  payload: CollaborationRequest;
}

export interface CollaborationRequestAcceptedEvent extends WebSocketEvent {
  type: 'collaboration_request_accepted';
  payload: {
    requestId: string;
    acceptedBy: string;
    message?: string;
  };
}

export interface CollaborationMessageReceivedEvent extends WebSocketEvent {
  type: 'collaboration_message_received';
  payload: CollaborationMessage;
}

// ============================================================================
// UI STATE TYPES
// ============================================================================

export interface RegionalNetworkState {
  regions: {
    data: RegionData[];
    stats: Record<string, RegionStats>;
    loading: boolean;
    error: string | null;
  };
  creators: {
    data: CreatorProfile[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
    loading: boolean;
    error: string | null;
  };
  filters: CreatorFilters;
  searchQuery: string;
  selectedRegion: Region | null;
  selectedCreator: CreatorProfile | null;
  collaborationRequests: {
    sent: CollaborationRequest[];
    received: CollaborationRequest[];
    loading: boolean;
    error: string | null;
  };
  notifications: {
    unreadCount: number;
    items: WebSocketEvent[];
  };
}

// ============================================================================
// COMPONENT PROPS TYPES
// ============================================================================

export interface RegionCardProps {
  region: RegionData;
  stats?: RegionStats;
  selected?: boolean;
  onClick?: (region: RegionData) => void;
}

export interface CreatorCardProps {
  creator: CreatorProfile;
  onViewProfile?: (creator: CreatorProfile) => void;
  onCollaborate?: (creator: CreatorProfile) => void;
  showCollabButton?: boolean;
}

export interface CreatorFiltersProps {
  filters: CreatorFilters;
  availableLanguages: Language[];
  availableDomains: ContentDomain[];
  availableSkills: string[];
  onChange: (filters: CreatorFilters) => void;
  onReset: () => void;
}

export interface CollaborationRequestCardProps {
  request: CollaborationRequest;
  type: 'sent' | 'received';
  onAccept?: (requestId: string) => void;
  onReject?: (requestId: string) => void;
  onCancel?: (requestId: string) => void;
  onViewProfile?: (creatorId: string) => void;
}

export interface CreatorProfileModalProps {
  creator: CreatorProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onCollaborate?: (creator: CreatorProfile) => void;
}

export interface CollaborationModalProps {
  receiver: CreatorProfile;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SendCollaborationRequest) => Promise<void>;
}
