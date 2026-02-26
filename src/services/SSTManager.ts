/**
 * Single Source of Truth Manager
 * Manages creation, validation, and persistence of SST objects
 */

import { 
  SingleSourceTruth, 
  ContentMetadata, 
  ExtractedContent,
  StructuralAnalysis,
  ConceptualAnalysis,
  DomainType 
} from '../types/core';

export class SSTManager {
  private storage: Map<string, SingleSourceTruth>;

  constructor() {
    this.storage = new Map();
  }

  /**
   * Create a new SingleSourceTruth object
   */
  createSST(
    metadata: ContentMetadata,
    extractedContent: ExtractedContent,
    structuralAnalysis: StructuralAnalysis,
    conceptualAnalysis: ConceptualAnalysis,
    domain: DomainType,
    domainConfidence: number
  ): SingleSourceTruth {
    const sst: SingleSourceTruth = {
      metadata,
      extractedContent,
      structuralAnalysis,
      conceptualAnalysis,
      domain,
      domainConfidence,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Validate before storing
    this.validateSST(sst);
    
    // Store in memory
    this.storage.set(metadata.id, sst);

    return sst;
  }

  /**
   * Validate SingleSourceTruth object
   */
  validateSST(sst: SingleSourceTruth): void {
    if (!sst.metadata || !sst.metadata.id) {
      throw new Error('SST must have valid metadata with ID');
    }

    if (!sst.extractedContent) {
      throw new Error('SST must have extracted content');
    }

    if (!sst.structuralAnalysis) {
      throw new Error('SST must have structural analysis');
    }

    if (!sst.conceptualAnalysis) {
      throw new Error('SST must have conceptual analysis');
    }

    if (!sst.domain) {
      throw new Error('SST must have a domain');
    }

    if (sst.domainConfidence < 0 || sst.domainConfidence > 1) {
      throw new Error('Domain confidence must be between 0 and 1');
    }

    if (sst.conceptualAnalysis.confidence < 0 || sst.conceptualAnalysis.confidence > 1) {
      throw new Error('Analysis confidence must be between 0 and 1');
    }
  }

  /**
   * Retrieve SST by ID
   */
  getSST(id: string): SingleSourceTruth | undefined {
    return this.storage.get(id);
  }

  /**
   * Update SST
   */
  updateSST(id: string, updates: Partial<SingleSourceTruth>): SingleSourceTruth {
    const existing = this.storage.get(id);
    if (!existing) {
      throw new Error(`SST with ID ${id} not found`);
    }

    const updated: SingleSourceTruth = {
      ...existing,
      ...updates,
      version: existing.version + 1,
      updatedAt: new Date()
    };

    this.validateSST(updated);
    this.storage.set(id, updated);

    return updated;
  }

  /**
   * Delete SST
   */
  deleteSST(id: string): boolean {
    return this.storage.delete(id);
  }

  /**
   * List all SSTs
   */
  listSSTs(): SingleSourceTruth[] {
    return Array.from(this.storage.values());
  }
}
