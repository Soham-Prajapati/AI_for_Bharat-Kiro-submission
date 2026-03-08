/**
 * Processing Pipeline Service
 *
 * Core orchestration service that manages all processing jobs for the upload-to-results flow.
 * Persisted storage is handled through DynamoDB service. In-memory storage is retained
 * as a local fallback cache when AWS is unavailable.
 */

import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import {
  ProcessingJob,
  GenerationResults,
  RESULTS_TTL,
} from '../types/upload-to-results';
import { dynamoDBService } from './dynamodb.service';

class ProcessingPipeline {
  private jobsCache: Map<string, ProcessingJob>;
  private resultsCache: Map<string, GenerationResults>;
  private expirationTimers: Map<string, NodeJS.Timeout>;
  private readonly ttl: number;

  constructor(ttl: number = RESULTS_TTL) {
    this.jobsCache = new Map();
    this.resultsCache = new Map();
    this.expirationTimers = new Map();
    this.ttl = ttl;

    logger.info('ProcessingPipeline initialized', { ttl: this.ttl });
  }

  generateJobId(): string {
    const timestamp = Date.now();
    const uuid = uuidv4().split('-')[0];
    return `job_${timestamp}_${uuid}`;
  }

  async createJob(fileId: string, userId: string): Promise<ProcessingJob> {
    const jobId = this.generateJobId();

    const job: ProcessingJob = {
      jobId,
      fileId,
      userId,
      status: 'pending',
      progress: 0,
      currentStep: 'Initializing',
      startedAt: new Date().toISOString(),
    };

    await dynamoDBService.createJob(job);
    this.jobsCache.set(jobId, job);

    logger.info('Processing job created', { jobId, fileId, userId });
    return job;
  }

  async getJob(jobId: string): Promise<ProcessingJob | null> {
    const cached = this.jobsCache.get(jobId);
    if (cached) {
      return cached;
    }

    const job = await dynamoDBService.getJob(jobId);
    if (job) {
      this.jobsCache.set(jobId, job);
    }

    return job;
  }

  async updateJob(jobId: string, updates: Partial<ProcessingJob>): Promise<void> {
    const existingJob = (await this.getJob(jobId)) || null;

    if (!existingJob) {
      logger.warn('Attempted to update non-existent job', { jobId });
      return;
    }

    const updatedJob: ProcessingJob = {
      ...existingJob,
      ...updates,
    };

    await dynamoDBService.updateJob(jobId, updates);
    this.jobsCache.set(jobId, updatedJob);

    logger.debug('Job updated', {
      jobId,
      status: updatedJob.status,
      progress: updatedJob.progress,
      currentStep: updatedJob.currentStep,
    });
  }

  async completeJob(jobId: string, results: GenerationResults): Promise<void> {
    const job = await this.getJob(jobId);

    if (!job) {
      logger.warn('Attempted to complete non-existent job', { jobId });
      return;
    }

    const completedAt = new Date().toISOString();
    const updatedJob: ProcessingJob = {
      ...job,
      status: 'completed',
      progress: 100,
      currentStep: 'Complete',
      completedAt,
      results,
    };

    await dynamoDBService.updateJob(jobId, {
      status: 'completed',
      progress: 100,
      currentStep: 'Complete',
      completedAt,
      results,
    });

    await this.storeResults(jobId, results);
    this.jobsCache.set(jobId, updatedJob);

    logger.info('Job completed', {
      jobId,
      duration: Date.now() - new Date(job.startedAt).getTime(),
    });
  }

  async failJob(jobId: string, error: string): Promise<void> {
    const job = await this.getJob(jobId);

    if (!job) {
      logger.warn('Attempted to fail non-existent job', { jobId });
      return;
    }

    const completedAt = new Date().toISOString();
    const updatedJob: ProcessingJob = {
      ...job,
      status: 'failed',
      error,
      completedAt,
    };

    await dynamoDBService.updateJob(jobId, {
      status: 'failed',
      error,
      completedAt,
    });

    this.jobsCache.set(jobId, updatedJob);

    logger.error('Job failed', {
      jobId,
      error,
      duration: Date.now() - new Date(job.startedAt).getTime(),
    });
  }

  async storeResults(jobId: string, results: GenerationResults): Promise<void> {
    await dynamoDBService.saveResult(results);
    this.resultsCache.set(jobId, results);

    const existingTimer = this.expirationTimers.get(jobId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(() => {
      this.expireResults(jobId);
    }, this.ttl);

    this.expirationTimers.set(jobId, timer);

    logger.info('Results stored with TTL', {
      jobId,
      ttl: this.ttl,
      expiresAt: results.expiresAt,
    });
  }

  async getResults(jobId: string): Promise<GenerationResults | null> {
    const cachedResults = this.resultsCache.get(jobId);
    const results = cachedResults || (await dynamoDBService.getResult(jobId));

    if (!results) {
      logger.debug('Results not found', { jobId });
      return null;
    }

    const now = new Date();
    const expiresAt = new Date(results.expiresAt);

    if (now > expiresAt) {
      logger.info('Results expired', { jobId, expiresAt: results.expiresAt });
      this.expireResults(jobId);
      return null;
    }

    this.resultsCache.set(jobId, results);
    logger.debug('Results retrieved', { jobId });
    return results;
  }

  private expireResults(jobId: string): void {
    this.resultsCache.delete(jobId);

    const timer = this.expirationTimers.get(jobId);
    if (timer) {
      clearTimeout(timer);
      this.expirationTimers.delete(jobId);
    }

    logger.info('Results expired and removed from memory cache', { jobId });
  }

  async updateResults(jobId: string, results: GenerationResults): Promise<void> {
    const existingResults = await this.getResults(jobId);

    if (!existingResults) {
      logger.warn('Attempted to update non-existent results', { jobId });
      return;
    }

    await this.storeResults(jobId, results);
    logger.info('Results updated', { jobId });
  }

  getActiveJobsCount(): number {
    let count = 0;
    for (const job of this.jobsCache.values()) {
      if (job.status === 'processing' || job.status === 'pending') {
        count++;
      }
    }
    return count;
  }

  getCacheSize(): number {
    return this.resultsCache.size;
  }

  clear(): void {
    for (const timer of this.expirationTimers.values()) {
      clearTimeout(timer);
    }

    this.jobsCache.clear();
    this.resultsCache.clear();
    this.expirationTimers.clear();

    logger.info('ProcessingPipeline in-memory cache cleared');
  }

  getAllJobs(): ProcessingJob[] {
    return Array.from(this.jobsCache.values());
  }

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

    for (const job of this.jobsCache.values()) {
      if (job.status === 'completed') completed++;
      else if (job.status === 'failed') failed++;
      else if (job.status === 'processing' || job.status === 'pending') active++;
    }

    return {
      totalJobs: this.jobsCache.size,
      activeJobs: active,
      completedJobs: completed,
      failedJobs: failed,
      cacheSize: this.resultsCache.size,
    };
  }
}

export const processingPipeline = new ProcessingPipeline();
export { ProcessingPipeline };
