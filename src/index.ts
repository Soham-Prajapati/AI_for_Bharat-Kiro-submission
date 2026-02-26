/**
 * Main entry point for Content Intelligence Platform
 */

import * as dotenv from 'dotenv';
import { createAWSServiceManager } from './config/aws';
import { ContentProcessor } from './services/ContentProcessor';
import { DomainAdapter } from './services/DomainAdapter';
import { AIServiceManager } from './services/AIServiceManager';
import { AnalysisEngine } from './services/AnalysisEngine';
import { GenerationEngine } from './services/GenerationEngine';
import { HumanLoopController } from './services/HumanLoopController';

// Load environment variables
dotenv.config();

/**
 * Initialize all services
 */
export function initializeServices() {
  const awsManager = createAWSServiceManager();
  const aiServiceManager = new AIServiceManager(awsManager);
  
  return {
    contentProcessor: new ContentProcessor(),
    domainAdapter: new DomainAdapter(),
    aiServiceManager,
    analysisEngine: new AnalysisEngine(),
    generationEngine: new GenerationEngine(),
    humanLoopController: new HumanLoopController()
  };
}

// Export all types and services
export * from './types/core';
export * from './config/aws';
export * from './services/ContentProcessor';
export * from './services/DomainAdapter';
export * from './services/AIServiceManager';
export * from './services/AnalysisEngine';
export * from './services/GenerationEngine';
export * from './services/HumanLoopController';

// Main execution
if (require.main === module) {
  console.log('Content Intelligence Platform initialized');
  const services = initializeServices();
  console.log('Services ready:', Object.keys(services));
}
