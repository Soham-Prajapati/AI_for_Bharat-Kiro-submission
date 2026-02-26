/**
 * AI Service Manager
 * Manages AWS AI service integrations with health monitoring and fallbacks
 */

import { AWSServiceManager } from '../config/aws';

export interface ServiceHealth {
  service: string;
  healthy: boolean;
  lastCheck: Date;
  errorCount: number;
}

export class AIServiceManager {
  private awsManager: AWSServiceManager;
  private healthStatus: Map<string, ServiceHealth>;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // ms

  constructor(awsManager: AWSServiceManager) {
    this.awsManager = awsManager;
    this.healthStatus = new Map();
  }

  /**
   * Check service health
   */
  async checkHealth(serviceName: string): Promise<boolean> {
    const health = this.healthStatus.get(serviceName);
    if (!health) {
      this.healthStatus.set(serviceName, {
        service: serviceName,
        healthy: true,
        lastCheck: new Date(),
        errorCount: 0
      });
      return true;
    }
    return health.healthy;
  }

  /**
   * Record service failure
   */
  recordFailure(serviceName: string): void {
    const health = this.healthStatus.get(serviceName);
    if (health) {
      health.errorCount++;
      health.lastCheck = new Date();
      if (health.errorCount >= 3) {
        health.healthy = false;
      }
    }
  }

  /**
   * Execute with retry and fallback
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    serviceName: string
  ): Promise<T> {
    let lastError: Error | undefined;
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const result = await operation();
        return result;
      } catch (error) {
        lastError = error as Error;
        this.recordFailure(serviceName);
        
        if (attempt < this.maxRetries - 1) {
          await this.delay(this.retryDelay * Math.pow(2, attempt));
        }
      }
    }
    
    throw lastError || new Error(`Failed after ${this.maxRetries} attempts`);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getAWSManager(): AWSServiceManager {
    return this.awsManager;
  }
}
