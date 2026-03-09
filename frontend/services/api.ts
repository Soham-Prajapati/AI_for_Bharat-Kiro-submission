/**
 * Production-Ready API Client
 * Type-safe methods for all 28+ backend routes
 * Features: Error handling, interceptors, retry logic, toast notifications
 */

import {
  ApiError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  RateLimitError,
  NetworkError,
  TimeoutError,
  UploadError,
  UploadResponse,
  ProcessRequest,
  ProcessResponse,
  ProcessStatusResponse,
  GenerateRequest,
  GenerateResponse,
  DnaAnalyzeRequest,
  DnaAnalyzeResponse,
  AnalyticsResponse,
  ViralPredictRequest,
  ViralPredictResponse,
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  VerifyTokenRequest,
  VerifyTokenResponse,
  CreateAutomationRequest,
  Automation,
  ListAutomationsResponse,
  DeleteAutomationResponse,
  CreatePostRequest,
  Post,
  FeedResponse,
  CreateGroupRequest,
  Group,
  UserProfile,
  Comment,
  CurrentTrendsResponse,
  PredictTrendsResponse,
  MultiplyGenerateRequest,
  MultiplyGenerateResponse,
  MultiplyV2GenerateRequest,
  MultiplyV2GenerateResponse,
  MultiplyV2StatusResponse,
  MultiplyV2ResultsResponse,
  CreateWorkspaceRequest,
  Workspace,
  WorkspaceUsersResponse,
  CreateListingRequest,
  Listing,
  PurchaseListingRequest,
  PurchaseListingResponse,
  ListingsResponse,
  ConnectPlatformRequest,
  PlatformConnection,
  PostToPlatformRequest,
  PostToPlatformResponse,
  ListConnectionsResponse,
  RoiResponse,
  AnalyzeContentRequest,
  AnalyzeContentResponse,
  AnalyzeViralRequest,
  AnalyzeViralResponse,
  CulturalAdaptRequest,
  CulturalAdaptResponse,
  SupportedRegionsResponse,
  VoiceTrainRequest,
  VoiceTrainResponse,
  VoiceTrainStatusResponse,
  VoiceGenerateRequest,
  VoiceGenerateResponse,
  GraphData,
  GraphNode,
  GraphEdge,
  RelatedContentResponse,
  SubscriptionTier,
  SubscriptionStatus,
  Subscription,
  SubscribeRequest,
  SubscribeResponse,
  CancelSubscriptionResponse,
  UpgradeSubscriptionRequest,
  UpgradeSubscriptionResponse,
  SubscriptionStatusResponse,
  AnalyticsDashboardResponse,
  MetricsResponse,
  InsightsResponse,
  PlatformPerformanceResponse,
  ExportAnalyticsResponse,
  DateRange,
  SafetyCheckRequest,
  SafetyCheckResponse,
  SafetyHistoryResponse,
  ApproveContentRequest,
  ApproveContentResponse,
  RejectContentRequest,
  RejectContentResponse,
} from '@/types/api';

// ============================================================================
// CONFIGURATION
// ============================================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const UPLOAD_TIMEOUT = 300000; // 5 minutes
const MAX_RETRIES = 5;
const RETRY_DELAY = 1000; // 1 second
const RATE_LIMIT_RETRY_DELAY = 5000; // 5 seconds for 429s

// ============================================================================
// TYPES
// ============================================================================

interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

interface RequestInterceptor {
  onRequest?: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
  onError?: (error: Error) => void;
}

interface ResponseInterceptor {
  onResponse?: (response: Response) => Response | Promise<Response>;
  onError?: (error: ApiError) => void;
}

// ============================================================================
// API CLIENT CLASS
// ============================================================================

class ApiClient {
  private baseUrl: string;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private authToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.loadAuthToken();
  }

  // --------------------------------------------------------------------------
  // AUTH TOKEN MANAGEMENT
  // --------------------------------------------------------------------------

  private loadAuthToken(): void {
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('authToken');
      if (savedToken) {
        this.authToken = savedToken;
      }
    }
  }

  setAuthToken(token: string | null): void {
    this.authToken = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('authToken', token);
      } else {
        localStorage.removeItem('authToken');
      }
    }
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  // --------------------------------------------------------------------------
  // INTERCEPTOR MANAGEMENT
  // --------------------------------------------------------------------------

  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  // --------------------------------------------------------------------------
  // ERROR HANDLING
  // --------------------------------------------------------------------------

  private createErrorFromResponse(status: number, data: any): ApiError {
    const message = data?.message || data?.error || 'Request failed';
    const code = data?.code || 'UNKNOWN_ERROR';

    switch (status) {
      case 400:
        return new ValidationError(message, data?.field);
      case 401:
        return new AuthenticationError(message);
      case 403:
        return new AuthorizationError(message);
      case 404:
        return new NotFoundError(data?.resource || 'Resource');
      case 429:
        return new RateLimitError(message, data?.retryAfter);
      case 408:
        return new TimeoutError(message);
      default:
        return new ApiError(message, status, code, data);
    }
  }

  // --------------------------------------------------------------------------
  // RETRY LOGIC
  // --------------------------------------------------------------------------

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private shouldRetry(error: ApiError, attempt: number, maxRetries: number): boolean {
    if (attempt >= maxRetries) return false;

    if (error instanceof NetworkError || error instanceof TimeoutError) {
      return true;
    }

    if (error.statusCode >= 500 && error.statusCode < 600) {
      return true;
    }

    if (error instanceof RateLimitError) {
      return true;
    }

    return false;
  }

  private calculateRetryDelay(attempt: number, baseDelay: number, error?: ApiError): number {
    if (error instanceof RateLimitError) {
      // Use retryAfter header if provided, otherwise use fixed 5s delay
      return error.retryAfter ? error.retryAfter * 1000 : RATE_LIMIT_RETRY_DELAY;
    }
    return baseDelay * Math.pow(2, attempt);
  }

  // --------------------------------------------------------------------------
  // CORE REQUEST METHOD
  // --------------------------------------------------------------------------

  public async request<T>(endpoint: string, config: RequestConfig): Promise<T> {
    let lastError: ApiError | null = null;
    const maxRetries = config.retries ?? MAX_RETRIES;
    const retryDelay = config.retryDelay ?? RETRY_DELAY;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        let modifiedConfig = { ...config };
        for (const interceptor of this.requestInterceptors) {
          if (interceptor.onRequest) {
            modifiedConfig = await interceptor.onRequest(modifiedConfig);
          }
        }

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          ...modifiedConfig.headers,
        };

        if (this.authToken) {
          headers['Authorization'] = `Bearer ${this.authToken}`;
        }

        const controller = new AbortController();
        const timeout = modifiedConfig.timeout ?? DEFAULT_TIMEOUT;
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
          const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: modifiedConfig.method,
            headers,
            body: modifiedConfig.body ? JSON.stringify(modifiedConfig.body) : undefined,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          let modifiedResponse = response;
          for (const interceptor of this.responseInterceptors) {
            if (interceptor.onResponse) {
              modifiedResponse = await interceptor.onResponse(modifiedResponse);
            }
          }

          if (!modifiedResponse.ok) {
            let errorData: any = {};
            try {
              errorData = await modifiedResponse.json();
            } catch {
              // Response is not JSON
            }

            const error = this.createErrorFromResponse(modifiedResponse.status, errorData);

            for (const interceptor of this.responseInterceptors) {
              if (interceptor.onError) {
                interceptor.onError(error);
              }
            }

            throw error;
          }

          const data = await modifiedResponse.json();
          return data as T;
        } catch (error: any) {
          clearTimeout(timeoutId);

          if (error.name === 'AbortError') {
            throw new TimeoutError('Request timeout');
          }

          if (error instanceof ApiError) {
            throw error;
          }

          throw new NetworkError(error.message || 'Network error');
        }
      } catch (error: any) {
        lastError = error instanceof ApiError ? error : new NetworkError(error.message);

        for (const interceptor of this.requestInterceptors) {
          if (interceptor.onError) {
            interceptor.onError(lastError);
          }
        }

        if (this.shouldRetry(lastError, attempt, maxRetries)) {
          const delay = this.calculateRetryDelay(attempt, retryDelay, lastError);
          await this.sleep(delay);
          continue;
        }

        throw lastError;
      }
    }

    throw lastError || new ApiError('Request failed', 500, 'UNKNOWN_ERROR');
  }

  // --------------------------------------------------------------------------
  // UPLOAD WITH PROGRESS
  // --------------------------------------------------------------------------

  async uploadWithProgress(
    file: File,
    onProgress?: (progress: number) => void,
    userId?: string
  ): Promise<UploadResponse> {
    return new Promise((resolve, reject) => {
      if (file.size > MAX_FILE_SIZE) {
        reject(
          new UploadError(
            `File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
            400,
            'FILE_TOO_LARGE'
          )
        );
        return;
      }

      if (!file || file.size === 0) {
        reject(new UploadError('Invalid file or empty file', 400, 'INVALID_FILE'));
        return;
      }

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response: UploadResponse = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(
              new UploadError('Invalid response from server', xhr.status, 'INVALID_RESPONSE')
            );
          }
        } else {
          let errorMessage = 'Upload failed';
          let errorCode = 'UPLOAD_FAILED';

          try {
            const errorData = JSON.parse(xhr.responseText);
            errorMessage = errorData.message || errorMessage;
            errorCode = errorData.code || errorCode;
          } catch {
            if (xhr.status === 413) {
              errorMessage = 'File is too large';
              errorCode = 'FILE_TOO_LARGE';
            } else if (xhr.status === 415) {
              errorMessage = 'File type not supported';
              errorCode = 'UNSUPPORTED_FILE_TYPE';
            } else if (xhr.status >= 500) {
              errorMessage = 'Server error. Please try again later';
              errorCode = 'SERVER_ERROR';
            }
          }

          reject(new UploadError(errorMessage, xhr.status, errorCode));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new UploadError('Network error. Please check your connection', 0, 'NETWORK_ERROR'));
      });

      xhr.addEventListener('timeout', () => {
        reject(new UploadError('Upload timeout. Please try again', 0, 'TIMEOUT'));
      });

      xhr.addEventListener('abort', () => {
        reject(new UploadError('Upload cancelled', 0, 'CANCELLED'));
      });

      const formData = new FormData();
      formData.append('file', file);
      if (userId) {
        formData.append('userId', userId);
      }

      xhr.open('POST', `${this.baseUrl}/api/upload`);
      xhr.timeout = UPLOAD_TIMEOUT;

      if (this.authToken) {
        xhr.setRequestHeader('Authorization', `Bearer ${this.authToken}`);
      }

      xhr.send(formData);
    });
  }

  // --------------------------------------------------------------------------
  // API ENDPOINTS
  // --------------------------------------------------------------------------

  upload = {
    file: (file: File, onProgress?: (progress: number) => void, userId?: string) =>
      this.uploadWithProgress(file, onProgress, userId),
  };

  process = {
    start: (data: ProcessRequest) =>
      this.request<ProcessResponse>('/api/process', {
        method: 'POST',
        body: data,
      }),

    getStatus: (jobId: string) =>
      this.request<ProcessStatusResponse>(`/api/process/${jobId}`, {
        method: 'GET',
      }),
  };

  generate = {
    create: (data: GenerateRequest) =>
      this.request<GenerateResponse>('/api/generate', {
        method: 'POST',
        body: data,
        timeout: 60000,
      }),

    get: (generationId: string) =>
      this.request<GenerateResponse>(`/api/generate/${generationId}`, {
        method: 'GET',
      }),
  };

  dna = {
    analyze: (data: DnaAnalyzeRequest) =>
      this.request<DnaAnalyzeResponse>('/api/dna/analyze', {
        method: 'POST',
        body: data,
        timeout: 60000,
      }),
  };

  analytics = {
    get: (userId: string) =>
      this.request<AnalyticsResponse>(`/api/analytics/${userId}`, {
        method: 'GET',
      }),
  };

  viral = {
    predict: (data: ViralPredictRequest) =>
      this.request<ViralPredictResponse>('/api/viral/predict', {
        method: 'POST',
        body: data,
      }),
  };

  auth = {
    register: (data: RegisterRequest) =>
      this.request<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: data,
      }),

    login: async (data: LoginRequest) => {
      const response = await this.request<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: data,
      });
      if (response.token) {
        this.setAuthToken(response.token);
      }
      return response;
    },

    verify: (data: VerifyTokenRequest) =>
      this.request<VerifyTokenResponse>('/api/auth/verify', {
        method: 'POST',
        body: data,
      }),

    logout: () => {
      this.setAuthToken(null);
    },
  };

  automation = {
    create: (data: CreateAutomationRequest) =>
      this.request<Automation>('/api/automation/create', {
        method: 'POST',
        body: data,
      }),

    list: (userId: string) =>
      this.request<ListAutomationsResponse>(`/api/automation/list?userId=${userId}`, {
        method: 'GET',
      }),

    delete: (automationId: string) =>
      this.request<DeleteAutomationResponse>(`/api/automation/${automationId}`, {
        method: 'DELETE',
      }),
  };

  community = {
    createPost: (data: CreatePostRequest) =>
      this.request<{ success: boolean; post: Post }>('/api/community/post', {
        method: 'POST',
        body: data,
      }),

    getPost: (postId: string) =>
      this.request<{ success: boolean; post: Post }>(`/api/community/post/${postId}`, {
        method: 'GET',
      }),

    getFeed: (userId?: string, limit = 50, offset = 0) => {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      params.append('limit', limit.toString());
      params.append('offset', offset.toString());
      return this.request<FeedResponse>(`/api/community/feed?${params}`, {
        method: 'GET',
      });
    },

    likePost: (postId: string, userId: string) =>
      this.request<{ success: boolean; message: string; postId: string }>(
        `/api/community/post/${postId}/like`,
        {
          method: 'POST',
          body: { userId },
        }
      ),

    addComment: (postId: string, userId: string, content: string) =>
      this.request<{ success: boolean; comment: Comment }>(
        `/api/community/post/${postId}/comment`,
        {
          method: 'POST',
          body: { userId, content },
        }
      ),

    createGroup: (data: CreateGroupRequest) =>
      this.request<{ success: boolean; group: Group }>('/api/community/group', {
        method: 'POST',
        body: data,
      }),

    getUser: (userId: string) =>
      this.request<{ success: boolean; user: UserProfile }>(`/api/community/user/${userId}`, {
        method: 'GET',
      }),
  };

  trends = {
    current: () =>
      this.request<CurrentTrendsResponse>('/api/trends/current', {
        method: 'GET',
      }),

    predict: () =>
      this.request<PredictTrendsResponse>('/api/trends/predict', {
        method: 'GET',
      }),
  };

  multiply = {
    generate: (data: MultiplyGenerateRequest) =>
      this.request<MultiplyGenerateResponse>('/api/multiply-v2/generate', {
        method: 'POST',
        body: data,
        timeout: 120000,
      }),
  };

  multiplyV2 = {
    /**
     * Generate 100+ content pieces from a single video
     * @param data - Content multiplication request with video details and preferences
     * @returns Promise with multiplication result including all generated pieces
     */
    generate: (data: MultiplyV2GenerateRequest) =>
      this.request<MultiplyV2GenerateResponse>('/api/multiply-v2/generate', {
        method: 'POST',
        body: data,
        timeout: 180000, // 3 minutes for large content generation
      }),

    /**
     * Check the status of a content generation job
     * @param jobId - The unique job identifier returned from generate
     * @returns Promise with current job status and progress
     */
    getStatus: (jobId: string) =>
      this.request<MultiplyV2StatusResponse>(`/api/multiply-v2/status/${jobId}`, {
        method: 'GET',
      }),

    /**
     * Fetch all generated content pieces for a completed job
     * @param jobId - The unique job identifier
     * @returns Promise with complete multiplication results
     */
    getResults: (jobId: string) =>
      this.request<MultiplyV2ResultsResponse>(`/api/multiply-v2/results/${jobId}`, {
        method: 'GET',
      }),
  };

  workspace = {
    create: (data: CreateWorkspaceRequest) =>
      this.request<{ success: boolean; workspace: Workspace }>('/api/workspace/create', {
        method: 'POST',
        body: data,
      }),

    get: (workspaceId: string) =>
      this.request<{ success: boolean; workspace: Workspace }>(`/api/workspace/${workspaceId}`, {
        method: 'GET',
      }),

    getUsers: (workspaceId: string) =>
      this.request<WorkspaceUsersResponse>(`/api/workspace/${workspaceId}/users`, {
        method: 'GET',
      }),
  };

  marketplace = {
    createListing: (data: CreateListingRequest) =>
      this.request<{ success: boolean; listing: Listing }>('/api/marketplace/list', {
        method: 'POST',
        body: data,
      }),

    purchase: (data: PurchaseListingRequest) =>
      this.request<PurchaseListingResponse>('/api/marketplace/purchase', {
        method: 'POST',
        body: data,
      }),

    getListings: (type?: string, search?: string, limit = 20) => {
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      if (search) params.append('search', search);
      params.append('limit', limit.toString());
      return this.request<ListingsResponse>(`/api/marketplace/listings?${params}`, {
        method: 'GET',
      });
    },
  };

  integrations = {
    connect: (data: ConnectPlatformRequest) =>
      this.request<PlatformConnection>('/api/integrations/connect', {
        method: 'POST',
        body: data,
      }),

    post: (data: PostToPlatformRequest) =>
      this.request<PostToPlatformResponse>('/api/integrations/post', {
        method: 'POST',
        body: data,
      }),

    list: (userId: string) =>
      this.request<ListConnectionsResponse>(`/api/integrations/list/${userId}`, {
        method: 'GET',
      }),
  };

  roi = {
    calculate: (userId: string) =>
      this.request<RoiResponse>(`/api/roi/${userId}`, {
        method: 'GET',
      }),
  };

  creativeDirector = {
    analyze: (data: AnalyzeContentRequest) =>
      this.request<AnalyzeContentResponse>('/api/creative-director/analyze', {
        method: 'POST',
        body: data,
        timeout: 60000,
      }),
  };

  viralAnalyzer = {
    analyze: (data: AnalyzeViralRequest) =>
      this.request<AnalyzeViralResponse>('/api/viral-analyzer/analyze', {
        method: 'POST',
        body: data,
        timeout: 60000,
      }),
  };

  cultural = {
    adapt: (data: CulturalAdaptRequest) =>
      this.request<CulturalAdaptResponse>('/api/cultural/adapt', {
        method: 'POST',
        body: data,
      }),

    getRegions: () =>
      this.request<SupportedRegionsResponse>('/api/cultural/regions', {
        method: 'GET',
      }),
  };

  voice = {
    train: async (userId: string, samples: File[]): Promise<VoiceTrainResponse> => {
      const formData = new FormData();
      formData.append('userId', userId);
      samples.forEach((sample) => {
        formData.append('samples', sample);
      });

      const headers: Record<string, string> = {};
      if (this.authToken) {
        headers['Authorization'] = `Bearer ${this.authToken}`;
      }

      const response = await fetch(`${this.baseUrl}/api/voice/train`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch {
          // Response is not JSON
        }
        throw this.createErrorFromResponse(response.status, errorData);
      }

      return response.json();
    },

    getTrainStatus: (jobId: string) =>
      this.request<VoiceTrainStatusResponse>(`/api/voice/train/${jobId}`, {
        method: 'GET',
      }),

    generate: (data: VoiceGenerateRequest) =>
      this.request<VoiceGenerateResponse>('/api/voice/generate', {
        method: 'POST',
        body: data,
      }),
  };

  graph = {
    explore: (topic?: string, depth: number = 2) => {
      const params = new URLSearchParams();
      if (topic) params.append('topic', topic);
      params.append('depth', depth.toString());
      return this.request<GraphData>(`/api/graph/explore?${params}`, {
        method: 'GET',
      });
    },

    getRelated: (contentId: string, limit: number = 10) => {
      const params = new URLSearchParams();
      params.append('contentId', contentId);
      params.append('limit', limit.toString());
      return this.request<RelatedContentResponse>(`/api/graph/related?${params}`, {
        method: 'GET',
      });
    },
  };

  membership = {
    subscribe: (data: SubscribeRequest) =>
      this.request<SubscribeResponse>('/api/membership/subscribe', {
        method: 'POST',
        body: data,
      }),

    cancelSubscription: () =>
      this.request<CancelSubscriptionResponse>('/api/membership/cancel', {
        method: 'POST',
      }),

    upgradeSubscription: (data: UpgradeSubscriptionRequest) =>
      this.request<UpgradeSubscriptionResponse>('/api/membership/subscribe', {
        method: 'POST',
        body: data,
      }),

    getSubscriptionStatus: () =>
      this.request<SubscriptionStatusResponse>('/api/membership/status', {
        method: 'GET',
      }),
  };

  analyticsDashboard = {
    getDashboard: (userId: string, dateRange?: DateRange) => {
      const params = new URLSearchParams();
      params.append('userId', userId);
      if (dateRange) {
        params.append('startDate', dateRange.startDate);
        params.append('endDate', dateRange.endDate);
      }
      return this.request<AnalyticsDashboardResponse>(
        `/api/analytics-dashboard/metrics?${params}`,
        {
          method: 'GET',
        }
      );
    },

    getMetrics: (userId: string) =>
      this.request<MetricsResponse>(`/api/analytics-dashboard/metrics?userId=${userId}`, {
        method: 'GET',
      }),

    getInsights: (userId: string) =>
      this.request<InsightsResponse>(`/api/analytics-dashboard/insights?userId=${userId}`, {
        method: 'GET',
      }),

    getPlatformPerformance: (userId: string) =>
      this.request<PlatformPerformanceResponse>(
        `/api/analytics-dashboard/platforms?userId=${userId}`,
        {
          method: 'GET',
        }
      ),

    exportAnalytics: (userId: string, format: 'csv' | 'pdf') =>
      this.request<ExportAnalyticsResponse>(
        `/api/analytics-dashboard/export?userId=${userId}&format=${format}`,
        {
          method: 'GET',
        }
      ),
  };

  safety = {
    /**
     * Check content for safety violations
     * @param data - Safety check request with content details
     * @returns Promise with safety check result including violations and suggestions
     */
    check: (data: SafetyCheckRequest) =>
      this.request<SafetyCheckResponse>('/api/safety/check', {
        method: 'POST',
        body: data,
        timeout: 60000, // 60 seconds for AI moderation
      }),

    /**
     * Get violation history for specific content
     * @param contentId - The unique content identifier
     * @returns Promise with all safety checks performed on this content
     */
    getHistory: (contentId: string) =>
      this.request<SafetyHistoryResponse>(`/api/safety/history/${contentId}`, {
        method: 'GET',
      }),

    /**
     * Approve flagged content after manual review
     * @param data - Approval request with check ID and approver details
     * @returns Promise with approval confirmation
     */
    approve: (data: ApproveContentRequest) =>
      this.request<ApproveContentResponse>('/api/safety/approve', {
        method: 'POST',
        body: data,
      }),

    /**
     * Reject unsafe content after manual review
     * @param data - Rejection request with check ID, reason, and reviewer details
     * @returns Promise with rejection confirmation
     */
    reject: (data: RejectContentRequest) =>
      this.request<RejectContentResponse>('/api/safety/reject', {
        method: 'POST',
        body: data,
      }),
  };
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

const apiClient = new ApiClient(API_URL);

// Development logging
if (process.env.NODE_ENV === 'development') {
  apiClient.addRequestInterceptor({
    onRequest: (config) => {
      console.log(`[API Request] ${config.method}`, config);
      return config;
    },
  });
}

export default apiClient;
export { ApiClient };

// Legacy export for backward compatibility
export const api = {
  upload: apiClient.upload.file,
};
