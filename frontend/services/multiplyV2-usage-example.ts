/**
 * Content Multiplier V2 API Usage Examples
 * 
 * This file demonstrates how to use the multiplyV2 API client methods
 * for generating 100+ content pieces from a single video.
 */

import apiClient from './api';
import type { MultiplyV2GenerateRequest } from '@/types/api';

// ============================================================================
// EXAMPLE 1: Generate Content with Full Options
// ============================================================================

async function generateContentFullOptions() {
  try {
    const request: MultiplyV2GenerateRequest = {
      videoId: 'video_123',
      transcript: 'Your video transcript here...',
      duration: 600, // 10 minutes in seconds
      platforms: ['instagram', 'tiktok', 'youtube', 'twitter', 'linkedin'],
      contentTypes: ['short', 'reel', 'post', 'carousel', 'quote', 'infographic'],
      variations: 3, // Generate 3 variations per content type
      includeScheduling: true,
      targetAudience: 'entrepreneurs and content creators',
      brandVoice: 'professional',
    };

    const result = await apiClient.multiplyV2.generate(request);

    console.log(`Generated ${result.totalPieces} content pieces!`);
    console.log(`Multiply ID: ${result.multiplyId}`);
    console.log(`Estimated reach: ${result.analytics.estimatedReach}`);
    console.log(`Recommendations:`, result.recommendations);

    return result;
  } catch (error) {
    console.error('Failed to generate content:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 2: Generate Content with Minimal Options
// ============================================================================

async function generateContentMinimal() {
  try {
    const request: MultiplyV2GenerateRequest = {
      videoId: 'video_456',
      transcript: 'Your video transcript here...',
      duration: 300,
      platforms: ['instagram', 'tiktok'],
      contentTypes: ['reel', 'short'],
      variations: 2,
    };

    const result = await apiClient.multiplyV2.generate(request);
    return result;
  } catch (error) {
    console.error('Failed to generate content:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 3: Check Job Status (for async processing)
// ============================================================================

async function checkJobStatus(jobId: string) {
  try {
    const status = await apiClient.multiplyV2.getStatus(jobId);

    console.log(`Job ${jobId} status: ${status.status}`);
    
    if (status.progress !== undefined) {
      console.log(`Progress: ${status.progress}%`);
    }

    if (status.status === 'completed' && status.result) {
      console.log(`Generated ${status.result.totalPieces} pieces`);
      return status.result;
    }

    if (status.status === 'failed') {
      console.error(`Job failed: ${status.error}`);
    }

    return status;
  } catch (error) {
    console.error('Failed to check job status:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 4: Fetch Complete Results
// ============================================================================

async function fetchResults(jobId: string) {
  try {
    const response = await apiClient.multiplyV2.getResults(jobId);

    if (response.success) {
      const result = response.result;
      
      // Access all generated pieces
      console.log(`Total pieces: ${result.totalPieces}`);
      
      // Filter by platform
      const instagramPieces = result.pieces.filter(p => p.platform === 'instagram');
      console.log(`Instagram pieces: ${instagramPieces.length}`);
      
      // Filter by priority
      const highPriority = result.pieces.filter(p => p.priority === 'high');
      console.log(`High priority pieces: ${highPriority.length}`);
      
      // Access content calendar
      if (result.contentCalendar.length > 0) {
        console.log(`Content calendar spans ${result.contentCalendar.length} days`);
      }
      
      return result;
    }
  } catch (error) {
    console.error('Failed to fetch results:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 5: Poll for Job Completion
// ============================================================================

async function pollUntilComplete(jobId: string, maxAttempts = 30, intervalMs = 2000) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const status = await apiClient.multiplyV2.getStatus(jobId);

    if (status.status === 'completed') {
      return status.result;
    }

    if (status.status === 'failed') {
      throw new Error(`Job failed: ${status.error}`);
    }

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }

  throw new Error('Job timeout: exceeded maximum polling attempts');
}

// ============================================================================
// EXAMPLE 6: Generate and Wait for Completion
// ============================================================================

async function generateAndWait() {
  try {
    // Start generation
    const request: MultiplyV2GenerateRequest = {
      videoId: 'video_789',
      transcript: 'Your video transcript here...',
      duration: 450,
      platforms: ['instagram', 'tiktok', 'youtube'],
      contentTypes: ['short', 'reel', 'post', 'quote'],
      variations: 2,
      includeScheduling: true,
      brandVoice: 'casual',
    };

    const initialResult = await apiClient.multiplyV2.generate(request);

    // If the API returns a job ID instead of immediate results,
    // poll for completion
    if ('multiplyId' in initialResult) {
      // Results returned immediately
      return initialResult;
    }

    // Otherwise, if async processing is implemented:
    // const jobId = initialResult.jobId;
    // const finalResult = await pollUntilComplete(jobId);
    // return finalResult;

    return initialResult;
  } catch (error) {
    console.error('Failed to generate and wait:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 7: Error Handling with Retry
// ============================================================================

async function generateWithRetry(request: MultiplyV2GenerateRequest, maxRetries = 3) {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await apiClient.multiplyV2.generate(request);
      return result;
    } catch (error: any) {
      lastError = error;
      console.warn(`Attempt ${attempt + 1} failed:`, error.message);

      // Don't retry on validation errors
      if (error.statusCode === 400) {
        throw error;
      }

      // Wait before retry (exponential backoff)
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
      }
    }
  }

  throw lastError;
}

// ============================================================================
// EXAMPLE 8: Process Results by Platform
// ============================================================================

async function processResultsByPlatform(jobId: string) {
  const response = await apiClient.multiplyV2.getResults(jobId);
  
  if (!response.success) {
    throw new Error('Failed to fetch results');
  }

  const result = response.result;

  // Group pieces by platform
  const byPlatform = result.pieces.reduce((acc, piece) => {
    if (!acc[piece.platform]) {
      acc[piece.platform] = [];
    }
    acc[piece.platform].push(piece);
    return acc;
  }, {} as Record<string, typeof result.pieces>);

  // Process each platform
  for (const [platform, pieces] of Object.entries(byPlatform)) {
    console.log(`\n${platform.toUpperCase()}: ${pieces.length} pieces`);
    
    // Sort by priority
    const sorted = pieces.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    // Display top 3
    sorted.slice(0, 3).forEach((piece, idx) => {
      console.log(`  ${idx + 1}. [${piece.priority}] ${piece.type}: ${piece.content.substring(0, 50)}...`);
    });
  }

  return byPlatform;
}

// Export examples for use in other files
export {
  generateContentFullOptions,
  generateContentMinimal,
  checkJobStatus,
  fetchResults,
  pollUntilComplete,
  generateAndWait,
  generateWithRetry,
  processResultsByPlatform,
};
