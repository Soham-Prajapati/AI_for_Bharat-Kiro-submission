/**
 * SST Serialization Service
 * Handles serialization, deserialization, and version control
 */

import { SingleSourceTruth } from '../types/core';
import * as fs from 'fs';
import * as path from 'path';

export interface SSTVersion {
  version: number;
  sst: SingleSourceTruth;
  timestamp: Date;
}

export class SSTSerializer {
  private storageDir: string;
  private versionHistory: Map<string, SSTVersion[]>;

  constructor(storageDir: string = './data/sst') {
    this.storageDir = storageDir;
    this.versionHistory = new Map();
    this.ensureStorageDir();
  }

  /**
   * Serialize SST to JSON
   */
  serialize(sst: SingleSourceTruth): string {
    return JSON.stringify(sst, null, 2);
  }

  /**
   * Deserialize SST from JSON
   */
  deserialize(json: string): SingleSourceTruth {
    const parsed = JSON.parse(json);
    
    // Convert date strings back to Date objects
    parsed.metadata.uploadedAt = new Date(parsed.metadata.uploadedAt);
    parsed.extractedContent.extractedAt = new Date(parsed.extractedContent.extractedAt);
    parsed.createdAt = new Date(parsed.createdAt);
    parsed.updatedAt = new Date(parsed.updatedAt);
    
    return parsed as SingleSourceTruth;
  }

  /**
   * Save SST to file system
   */
  async save(sst: SingleSourceTruth): Promise<void> {
    const filename = `${sst.metadata.id}.json`;
    const filepath = path.join(this.storageDir, filename);
    
    // Save current version
    const json = this.serialize(sst);
    await fs.promises.writeFile(filepath, json, 'utf-8');
    
    // Save to version history
    this.addToVersionHistory(sst);
  }

  /**
   * Load SST from file system
   */
  async load(id: string): Promise<SingleSourceTruth> {
    const filename = `${id}.json`;
    const filepath = path.join(this.storageDir, filename);
    
    const json = await fs.promises.readFile(filepath, 'utf-8');
    return this.deserialize(json);
  }

  /**
   * Add to version history
   */
  private addToVersionHistory(sst: SingleSourceTruth): void {
    const id = sst.metadata.id;
    const history = this.versionHistory.get(id) || [];
    
    history.push({
      version: sst.version,
      sst: JSON.parse(JSON.stringify(sst)), // Deep clone
      timestamp: new Date()
    });
    
    this.versionHistory.set(id, history);
  }

  /**
   * Get version history for an SST
   */
  getVersionHistory(id: string): SSTVersion[] {
    return this.versionHistory.get(id) || [];
  }

  /**
   * Get specific version
   */
  getVersion(id: string, version: number): SingleSourceTruth | undefined {
    const history = this.versionHistory.get(id);
    if (!history) return undefined;
    
    const versionEntry = history.find(v => v.version === version);
    return versionEntry?.sst;
  }

  /**
   * Rollback to previous version
   */
  async rollback(id: string, version: number): Promise<SingleSourceTruth> {
    const sst = this.getVersion(id, version);
    if (!sst) {
      throw new Error(`Version ${version} not found for SST ${id}`);
    }
    
    // Save rolled back version as new version
    const rolledBack: SingleSourceTruth = {
      ...sst,
      version: sst.version + 1,
      updatedAt: new Date()
    };
    
    await this.save(rolledBack);
    return rolledBack;
  }

  /**
   * Ensure storage directory exists
   */
  private ensureStorageDir(): void {
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  /**
   * List all stored SSTs
   */
  async listAll(): Promise<string[]> {
    const files = await fs.promises.readdir(this.storageDir);
    return files
      .filter(f => f.endsWith('.json'))
      .map(f => f.replace('.json', ''));
  }

  /**
   * Delete SST from storage
   */
  async delete(id: string): Promise<void> {
    const filename = `${id}.json`;
    const filepath = path.join(this.storageDir, filename);
    
    await fs.promises.unlink(filepath);
    this.versionHistory.delete(id);
  }
}
