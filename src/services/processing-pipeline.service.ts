/**
 * Processing Pipeline Service
 * 
 * Core orchestration service that manages all processing jobs for the upload-to-results flow.
 * Handles job lifecycle, results caching, and automatic expiration.
 * 
 * Features:
 * - In-memory job storage with unique jobId generation
 * - In-memory results cache with TTL-based auto-expiration (1 hour)
 * - Job state management (pending, processing, completed, failed)
 * - Automatic cleanup of expired results
 */

import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import {
  ProcessingJob,
  GenerationResults,
  ProcessingStatus,
  RESULTS_TTL
} from '../types/upload-to-results';

/**
 * ProcessingPipeline class
 * Manages processing jobs and results cache
 */
class ProcessingPipeline {
  // In-memory job storage
  private jobs: Map<string, ProcessingJob>;
  
  // In-memory results cache
  private results: Map<string, GenerationResults>;
  
  // Expiration timers for auto-cleanup
  private expirationTimers: Map<string, NodeJS.Timeout>;
  
  // TTL for results (1 hour by default)
  private readonly ttl: number;

  constructor(ttl: number = RESULTS_TTL) {
    this.jobs = new Map();
    this.results = new Map();
    this.expirationTimers = new Map();
    this.ttl = ttl;
    
    logger.info('ProcessingPipeline initialized', { ttl: this.ttl });
  }

  /**
   * Generate a unique job ID
   * Format: job_{timestamp}_{uuid}
   */
  generateJobId(): string {
    const timestamp = Date.now();
    const uuid = uuidv4().split('-')[0]; // Use first segment of UUID for brevity
    return `job_${timestamp}_${uuid}`;
  }

  /**
   * Create a new processing job
   * @param fileId - The uploaded file ID
   * @param userId - The user ID
   * @returns The created job
   */
  createJob(fileId: string, userId: string): ProcessingJob {
    const jobId = this.generateJobId();
    
    const job: ProcessingJob = {
      jobId,
      fileId,
      userId,
      status: 'pending',
      progress: 0,
      currentStep: 'Initializing',
      startedAt: new Date().toISOString()
    };
    
    this.jobs.set(jobId, job);
    
    logger.info('Processing job created', {
      jobId,
      fileId,
      userId
    });
    
    return job;
  }

  /**
   * Get a job by ID
   * @param jobId - The job ID
   * @returns The job or null if not found
   */
  getJob(jobId: string): ProcessingJob | null {
    return this.jobs.get(jobId) || null;
  }

  /**
   * Update a job's status and progress
   * @param jobId - The job ID
   * @param updates - Partial job updates
   */
  updateJob(jobId: string, updates: Partial<ProcessingJob>): void {
    const job = this.jobs.get(jobId);
    
    if (!job) {
      logger.warn('Attempted to update non-existent job', { jobId });
      return;
    }
    
    Object.assign(job, updates);
    
    logger.debug('Job updated', {
      jobId,
      status: job.status,
      progress: job.progress,
      currentStep: job.currentStep
    });
  }

  /**
   * Mark a job as completed and store results
   * @param jobId - The job ID
   * @param results - The generation results
   */
  completeJob(jobId: string, results: GenerationResults): void {
    const job = this.jobs.get(jobId);
    
    if (!job) {
      logger.warn('Attempted to complete non-existent job', { jobId });
      return;
    }
    
    // Update job status
    job.status = 'completed';
    job.progress = 100;
    job.currentStep = 'Complete';
    job.completedAt = new Date().toISOString();
    job.results = results;
    
    // Store results in cache
    this.storeResults(jobId, results);
    
    logger.info('Job completed', {
      jobId,
      duration: Date.now() - new Date(job.startedAt).getTime()
    });
  }

  /**
   * Mark a job as failed
   * @param jobId - The job ID
   * @param error - The error message
   */
  failJob(jobId: string, error: string): void {
    const job = this.jobs.get(jobId);
    
    if (!job) {
      logger.warn('Attempted to fail non-existent job', { jobId });
      return;
    }
    
    job.status = 'failed';
    job.error = error;
    job.completedAt = new Date().toISOString();
    
    logger.error('Job failed', {
      jobId,
      error,
      duration: Date.now() - new Date(job.startedAt).getTime()
    });
  }

  /**
   * Store results in cache with TTL-based auto-expiration
   * @param jobId - The job ID
   * @param results - The generation results
   */
  storeResults(jobId: string, results: GenerationResults): void {
    // Store results
    this.results.set(jobId, results);
    
    // Clear any existing expiration timer
    const existingTimer = this.expirationTimers.get(jobId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    
    // Set new expiration timer
    const timer = setTimeout(() => {
      this.expireResults(jobId);
    }, this.ttl);
    
    this.expirationTimers.set(jobId, timer);
    
    logger.info('Results stored with TTL', {
      jobId,
      ttl: this.ttl,
      expiresAt: results.expiresAt
    });
  }

  /**
   * Get results from cache
   * @param jobId - The job ID
   * @returns The results or null if not found/expired
   */
  getResults(jobId: string): GenerationResults | null {
    const results = this.results.get(jobId);
    
    if (!results) {
      logger.debug('Results not found in cache', { jobId });
      return null;
    }
    
    // Check if results have expired
    const now = new Date();
    const expiresAt = new Date(results.expiresAt);
    
    if (now > expiresAt) {
      logger.info('Results expired', { jobId, expiresAt: results.expiresAt });
      this.expireResults(jobId);
      return null;
    }
    
    logger.debug('Results retrieved from cache', { jobId });
    return results;
  }

  /**
   * Expire and remove results from cache
   * @param jobId - The job ID
   */
  private expireResults(jobId: string): void {
    // Remove results
    this.results.delete(jobId);
    
    // Clear expiration timer
    const timer = this.expirationTimers.get(jobId);
    if (timer) {
      clearTimeout(timer);
      this.expirationTimers.delete(jobId);
    }
    
    // Optionally remove job (keep for debugging)
    // this.jobs.delete(jobId);
    
    logger.info('Results expired and removed', { jobId });
  }

  /**
   * Update results in cache (for regeneration)
   * @param jobId - The job ID
   * @param results - The updated results
   */
  updateResults(jobId: string, results: GenerationResults): void {
    const existingResults = this.results.get(jobId);
    
    if (!existingResults) {
      logger.warn('Attempted to update non-existent results', { jobId });
      return;
    }
    
    // Update results
    this.results.set(jobId, results);
    
    logger.info('Results updated in cache', { jobId });
  }

  /**
   * Get count of active jobs
   * @returns Number of jobs in processing or pending state
   */
  getActiveJobsCount(): number {
    let count = 0;
    
    for (const job of this.jobs.values()) {
      if (job.status === 'processing' || job.status === 'pending') {
        count++;
      }
    }
    
    return count;
  }

  /**
   * Get cache size
   * @returns Number of results in cache
   */
  getCacheSize(): number {
    return this.results.size;
  }

  /**
   * Clear all jobs and results (for testing)
   */
  clear(): void {
    // Clear all expiration timers
    for (const timer of this.expirationTimers.values()) {
      clearTimeout(timer);
    }
    
    this.jobs.clear();
    this.results.clear();
    this.expirationTimers.clear();
    
    logger.info('ProcessingPipeline cleared');
  }

  /**
   * Get all jobs (for debugging/monitoring)
   * @returns Array of all jobs
   */
  getAllJobs(): ProcessingJob[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Get statistics about the pipeline
   * @returns Pipeline statistics
   */
  getStats(): {
    totalJobs: number;
    activeJobs: number;
    completedJobs: number;
    failedJobs: number;
    cacheSize: number;
  } {
    let completed = 0;
    let failed = 0;
    let active = 0;
    
    for (const job of this.jobs.values()) {
      if (job.status === 'completed') completed++;
      else if (job.status === 'failed') failed++;
      else if (job.status === 'processing' || job.status === 'pending') active++;
    }
    
    return {
      totalJobs: this.jobs.size,
      activeJobs: active,
      completedJobs: completed,
      failedJobs: failed,
      cacheSize: this.results.size
    };
  }
}

// Export singleton instance
export const processingPipeline = new ProcessingPipeline();

// Export class for testing
export { ProcessingPipeline };
