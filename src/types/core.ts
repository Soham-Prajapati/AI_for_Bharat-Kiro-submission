/**
 * Core data models and interfaces for the Content Intelligence Platform
 */

export enum ContentType {
  VIDEO = 'video',
  TEXT = 'text',
  IMAGE = 'image',
  STRUCTURED_DATA = 'structured_data'
}

export enum DomainType {
  EDUCATION = 'education',
  FOOD = 'food',
  TRAVEL = 'travel',
  PRODUCT_REVIEWS = 'product_reviews',
  GENERAL = 'general'
}

export interface ContentMetadata {
  id: string;
  type: ContentType;
  originalFilename?: string;
  uploadedAt: Date;
  size: number;
  mimeType: string;
}

export interface ExtractedContent {
  rawText?: string;
  transcription?: string;
  imageDescription?: string;
  structuredData?: Record<string, unknown>;
  extractedAt: Date;
}

export interface StructuralAnalysis {
  keyMoments?: Array<{ timestamp: number; description: string }>;
  sections?: Array<{ title: string; content: string }>;
  hierarchy?: Record<string, unknown>;
  flowAnalysis?: string;
}

export interface ConceptualAnalysis {
  mainConcepts: string[];
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  complexity: 'beginner' | 'intermediate' | 'advanced';
  topics: string[];
  confidence: number;
  reasoning: string;
}

export interface SingleSourceTruth {
  metadata: ContentMetadata;
  extractedContent: ExtractedContent;
  structuralAnalysis: StructuralAnalysis;
  conceptualAnalysis: ConceptualAnalysis;
  domain: DomainType;
  domainConfidence: number;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DomainAnalysis {
  domain: DomainType;
  confidence: number;
  specificPatterns: Record<string, unknown>;
  reasoning: string;
}

export interface GeneratedContent {
  type: 'script' | 'caption' | 'notes' | 'quiz' | 'itinerary' | 'thumbnail_guidance';
  content: string;
  reasoning: string;
  aiAssisted: true;
  editable: boolean;
  generatedAt: Date;
}

export interface ApprovalRequest {
  id: string;
  contentId: string;
  generatedContent: GeneratedContent;
  status: 'pending' | 'approved' | 'modified' | 'rejected';
  creatorFeedback?: string;
  createdAt: Date;
  resolvedAt?: Date;
}
