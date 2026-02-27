/**
 * API Client Usage Examples
 * Common patterns and use cases for the Content Intelligence Platform API
 */

import apiClient from './api';
import type {
  UploadResponse,
  ProcessResponse,
  GenerateResponse,
  Platform,
} from '@/types/api';

// ============================================================================
// EXAMPLE 1: Complete Content Generation Workflow
// ============================================================================

export async function completeContentWorkflow(
  file: File,
  platforms: Platform[],
  onProgress?: (stage: string, progress: number) => void
): Promise<GenerateResponse> {
  try {
    // Step 1: Upload file
    onProgress?.('upload', 0);
    const uploadResponse = await apiClient.upload.file(file, (progress) => {
      onProgress?.('upload', progress);
    });
    onProgress?.('upload', 100);

    // Step 2: Start processing
    onProgress?.('process', 0);
    const processResponse = await apiClient.process.start({
      fileId: uploadResponse.fileId,
    });

    // Step 3: Poll for processing completion
    let status = await apiClient.process.getStatus(processResponse.jobId);
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes with 5-second intervals

    while (status.status === 'processing' && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      status = await apiClient.process.getStatus(processResponse.jobId);
      onProgress?.('process', Math.min(90, (attempts / maxAttempts) * 100));
      attempts++;
    }

    if (status.status !== 'completed') {
      throw new Error('Processing failed or timed out');
    }
    onProgress?.('process', 100);

    // Step 4: Generate content
    onProgress?.('generate', 0);
    const generateResponse = await apiClient.generate.create({
      jobId: processResponse.jobId,
      platforms,
      language: 'en',
      creatorMode: 'hybrid',
    });
    onProgress?.('generate', 100);

    return generateResponse;
  } catch (error) {
    console.error('Content workflow failed:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 2: User Authentication Flow
// ============================================================================

export async function authenticateUser(email: string, password: string) {
  try {
    // Login
    const loginResponse = await apiClient.auth.login({ email, password });

    // Token is automatically stored and set
    console.log('Logged in as:', loginResponse.email);

    // Verify token
    const verifyResponse = await apiClient.auth.verify({
      token: loginResponse.token,
    });

    return {
      userId: verifyResponse.userId,
      email: verifyResponse.email,
      token: loginResponse.token,
    };
  } catch (error) {
    console.error('Authentication failed:', error);
    throw error;
  }
}

export function logoutUser() {
  apiClient.auth.logout();
  // Redirect to login page
  window.location.href = '/login';
}

// ============================================================================
// EXAMPLE 3: Creator DNA Analysis
// ============================================================================

export async function analyzeCreatorDNA(userId: string, videoIds: string[]) {
  try {
    const dnaResponse = await apiClient.dna.analyze({
      userId,
      videoIds,
    });

    console.log('Creator Profile:', dnaResponse.profile);
    console.log('Tone:', dnaResponse.profile.tone);
    console.log('Style:', dnaResponse.profile.style);
    console.log('Topics:', dnaResponse.profile.topics);

    return dnaResponse.profile;
  } catch (error) {
    console.error('DNA analysis failed:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 4: Cross-Platform Analytics Dashboard
// ============================================================================

export async function fetchAnalyticsDashboard(userId: string) {
  try {
    const analyticsResponse = await apiClient.analytics.get(userId);

    const dashboard = {
      totalFollowers: analyticsResponse.analytics.totalFollowers,
      totalEngagement: analyticsResponse.analytics.totalEngagement,
      totalViews: analyticsResponse.analytics.totalViews,
      platforms: analyticsResponse.analytics.platforms.map((p) => ({
        platform: p.platform,
        followers: p.followers,
        engagement: p.engagement,
        views: p.views,
      })),
      cached: analyticsResponse.cached,
      lastUpdated: analyticsResponse.fetchedAt,
    };

    return dashboard;
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 5: Viral Content Prediction
// ============================================================================

export async function predictViralScore(transcript: string, metadata?: any) {
  try {
    const viralResponse = await apiClient.viral.predict({
      transcript,
      metadata,
    });

    const { prediction } = viralResponse;

    console.log('Viral Score:', prediction.score);
    console.log('Key Factors:');
    prediction.factors.forEach((factor) => {
      console.log(`- ${factor.name}: ${factor.impact} (${factor.description})`);
    });
    console.log('Recommendations:', prediction.recommendations);

    return prediction;
  } catch (error) {
    console.error('Viral prediction failed:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 6: Content Multiplication
// ============================================================================

export async function multiplyContent(
  transcript: string,
  platforms: Platform[]
) {
  try {
    const multiplyResponse = await apiClient.multiply.generate({
      transcript,
      platforms,
    });

    console.log(`Generated ${multiplyResponse.totalPieces} content pieces:`);
    console.log(`- ${multiplyResponse.clips.length} video clips`);
    console.log(`- ${multiplyResponse.quotes.length} quote images`);
    console.log(`- ${multiplyResponse.audiograms.length} audiograms`);

    return multiplyResponse;
  } catch (error) {
    console.error('Content multiplication failed:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 7: Community Engagement
// ============================================================================

export async function createAndEngagePost(
  userId: string,
  content: string,
  groupId?: string
) {
  try {
    // Create post
    const postResponse = await apiClient.community.createPost({
      userId,
      content,
      groupId,
    });

    const postId = postResponse.post.id;
    console.log('Post created:', postId);

    // Simulate engagement from another user
    const otherUserId = 'user-456';

    // Like the post
    await apiClient.community.likePost(postId, otherUserId);
    console.log('Post liked');

    // Add comment
    await apiClient.community.addComment(
      postId,
      otherUserId,
      'Great content!'
    );
    console.log('Comment added');

    // Get updated post
    const updatedPost = await apiClient.community.getPost(postId);
    return updatedPost.post;
  } catch (error) {
    console.error('Community engagement failed:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 8: Automation Setup
// ============================================================================

export async function setupDailyAutomation(userId: string) {
  try {
    // Create automation for daily content generation
    const automation = await apiClient.automation.create({
      userId,
      name: 'Daily Content Generator',
      trigger: {
        type: 'schedule',
        cron: '0 9 * * *', // Every day at 9 AM
      },
      actions: [
        {
          type: 'generate',
          platforms: ['instagram', 'twitter'],
          contentType: 'daily-tip',
        },
        {
          type: 'post',
          platform: 'instagram',
        },
      ],
    });

    console.log('Automation created:', automation.automationId);
    return automation;
  } catch (error) {
    console.error('Automation setup failed:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 9: Marketplace Transaction
// ============================================================================

export async function purchaseTemplate(
  listingId: string,
  userId: string,
  paymentMethod: string
) {
  try {
    // Purchase listing
    const purchaseResponse = await apiClient.marketplace.purchase({
      listingId,
      userId,
      paymentMethod,
    });

    console.log('Purchase successful!');
    console.log('Transaction ID:', purchaseResponse.transaction.id);
    console.log('Download URL:', purchaseResponse.downloadUrl);

    return purchaseResponse;
  } catch (error) {
    console.error('Purchase failed:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 10: Platform Integration
// ============================================================================

export async function connectAndPostToPlatform(
  userId: string,
  platform: Platform,
  accessToken: string,
  content: any
) {
  try {
    // Connect platform
    const connection = await apiClient.integrations.connect({
      userId,
      platform,
      accessToken,
    });

    console.log('Platform connected:', connection.connectionId);

    // Post content
    const postResponse = await apiClient.integrations.post({
      connectionId: connection.connectionId,
      content,
      platform,
    });

    console.log('Content posted:', postResponse.url);
    return postResponse;
  } catch (error) {
    console.error('Platform integration failed:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 11: Trend Analysis
// ============================================================================

export async function analyzeTrends() {
  try {
    // Get current trends
    const currentTrends = await apiClient.trends.current();
    console.log('Current Trends:');
    currentTrends.trends.forEach((trend) => {
      console.log(
        `- ${trend.topic}: Score ${trend.score}, Growth ${trend.growth}%`
      );
    });

    // Get trend predictions
    const predictions = await apiClient.trends.predict();
    console.log('\nUpcoming Trends:');
    predictions.predictions.forEach((pred) => {
      console.log(
        `- ${pred.topic}: ${pred.confidence * 100}% confidence, Peak: ${
          pred.estimatedPeak
        }`
      );
    });

    return { currentTrends, predictions };
  } catch (error) {
    console.error('Trend analysis failed:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 12: Collaborative Workspace
// ============================================================================

export async function createCollaborativeWorkspace(
  name: string,
  initialContent: string
) {
  try {
    // Create workspace
    const workspaceResponse = await apiClient.workspace.create({
      name,
      initialContent,
    });

    const workspaceId = workspaceResponse.workspace.id;
    console.log('Workspace created:', workspaceId);

    // Get workspace details
    const workspace = await apiClient.workspace.get(workspaceId);
    console.log('Workspace:', workspace.workspace);

    // Get users in workspace
    const users = await apiClient.workspace.getUsers(workspaceId);
    console.log('Users:', users.users);

    return workspace.workspace;
  } catch (error) {
    console.error('Workspace creation failed:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 13: ROI Calculation
// ============================================================================

export async function calculateUserROI(userId: string) {
  try {
    const roiResponse = await apiClient.roi.calculate(userId);

    const { roi } = roiResponse;

    console.log('ROI Analysis:');
    console.log(`- Time Saved: ${roi.timeSaved} hours`);
    console.log(`- Money Saved: $${roi.moneySaved}`);
    console.log(`- Content Generated: ${roi.contentGenerated} pieces`);
    console.log(`- Efficiency Gain: ${roi.efficiency}%`);

    return roi;
  } catch (error) {
    console.error('ROI calculation failed:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 14: Content Quality Analysis
// ============================================================================

export async function analyzeContentQuality(contentId: string, content: string) {
  try {
    const analysisResponse = await apiClient.creativeDirector.analyze({
      contentId,
      content,
    });

    console.log('Content Quality Scores:');
    console.log(`- Structure: ${analysisResponse.score.structure}/10`);
    console.log(`- Pacing: ${analysisResponse.score.pacing}/10`);
    console.log(`- Engagement: ${analysisResponse.score.engagement}/10`);
    console.log(`- Clarity: ${analysisResponse.score.clarity}/10`);
    console.log(`- Overall: ${analysisResponse.score.overall}/10`);

    console.log('\nFeedback:');
    analysisResponse.feedback.forEach((fb) => {
      console.log(`- ${fb.aspect} (${fb.rating}): ${fb.comment}`);
    });

    console.log('\nImprovements:');
    analysisResponse.improvements.forEach((imp) => {
      console.log(`- ${imp}`);
    });

    return analysisResponse;
  } catch (error) {
    console.error('Content analysis failed:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 15: Viral Pattern Analysis
// ============================================================================

export async function analyzeViralPatterns(videoUrl: string) {
  try {
    const analysisResponse = await apiClient.viralAnalyzer.analyze({
      videoUrl,
    });

    console.log(`Viral Score: ${analysisResponse.viralScore}/100`);

    console.log('\nViral Patterns:');
    analysisResponse.patterns.forEach((pattern) => {
      console.log(
        `- ${pattern.type}: ${pattern.strength * 100}% - ${pattern.description}`
      );
    });

    console.log('\nViral Hooks:');
    analysisResponse.hooks.forEach((hook) => {
      console.log(`- ${hook.timestamp} (${hook.type}): ${hook.impact} impact`);
    });

    console.log('\nReplication Guide:');
    console.log(analysisResponse.guide);

    return analysisResponse;
  } catch (error) {
    console.error('Viral analysis failed:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 16: Error Handling Patterns
// ============================================================================

import {
  ValidationError,
  AuthenticationError,
  RateLimitError,
  NetworkError,
} from '@/types/api';

export async function robustAPICall<T>(
  apiCall: () => Promise<T>,
  onRetry?: (attempt: number) => void
): Promise<T> {
  try {
    return await apiCall();
  } catch (error) {
    if (error instanceof ValidationError) {
      // Show validation error to user
      console.error('Validation error:', error.message, error.field);
      throw error;
    } else if (error instanceof AuthenticationError) {
      // Redirect to login
      console.error('Authentication required');
      logoutUser();
      throw error;
    } else if (error instanceof RateLimitError) {
      // Wait and retry
      console.log(`Rate limited. Retrying after ${error.retryAfter}s`);
      if (error.retryAfter) {
        await new Promise((resolve) =>
          setTimeout(resolve, error.retryAfter! * 1000)
        );
        return robustAPICall(apiCall, onRetry);
      }
      throw error;
    } else if (error instanceof NetworkError) {
      // Show network error message
      console.error('Network error. Please check your connection.');
      throw error;
    } else {
      // Generic error handling
      console.error('API call failed:', error);
      throw error;
    }
  }
}

// ============================================================================
// EXAMPLE 17: Batch Operations
// ============================================================================

export async function batchUploadAndProcess(files: File[]) {
  const results = await Promise.allSettled(
    files.map(async (file) => {
      try {
        // Upload
        const uploadResponse = await apiClient.upload.file(file);

        // Process
        const processResponse = await apiClient.process.start({
          fileId: uploadResponse.fileId,
        });

        return {
          file: file.name,
          uploadId: uploadResponse.fileId,
          jobId: processResponse.jobId,
          status: 'success',
        };
      } catch (error) {
        return {
          file: file.name,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    })
  );

  const successful = results.filter((r) => r.status === 'fulfilled');
  const failed = results.filter((r) => r.status === 'rejected');

  console.log(`Batch upload: ${successful.length} succeeded, ${failed.length} failed`);

  return results;
}

// ============================================================================
// EXAMPLE 18: Real-time Progress Tracking
// ============================================================================

export class ContentGenerationTracker {
  private stages = ['upload', 'process', 'generate'];
  private currentStage = 0;
  private stageProgress = 0;

  constructor(private onUpdate: (overall: number, stage: string) => void) {}

  updateProgress(stage: string, progress: number) {
    const stageIndex = this.stages.indexOf(stage);
    if (stageIndex === -1) return;

    this.currentStage = stageIndex;
    this.stageProgress = progress;

    // Calculate overall progress
    const overallProgress =
      (this.currentStage * 100 + this.stageProgress) / this.stages.length;

    this.onUpdate(overallProgress, stage);
  }

  async execute(file: File, platforms: Platform[]) {
    return completeContentWorkflow(file, platforms, (stage, progress) => {
      this.updateProgress(stage, progress);
    });
  }
}

// Usage
export async function trackContentGeneration(file: File, platforms: Platform[]) {
  const tracker = new ContentGenerationTracker((overall, stage) => {
    console.log(`Overall: ${overall.toFixed(1)}% | Stage: ${stage}`);
  });

  return tracker.execute(file, platforms);
}
