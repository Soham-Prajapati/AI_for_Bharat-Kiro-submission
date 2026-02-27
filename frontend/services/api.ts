/**
 * Production-Ready API Client
 * Type-safe methods for all 28+ backend routes
 * Features: Error handling, interceptors, retry logic, request/response transformation
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
  // Upload
  UploadRequest,
  UploadResponse,
  // Process
  ProcessRequest,
  ProcessResponse,
  ProcessStatusResponse,
  // Generate
  GenerateRequest,
  GenerateResponse,
  // DNA
  DnaAnalyzeRequest,
  DnaAnalyzeResponse,
  // Analytics
  AnalyticsResponse,
  // Viral
  ViralPredictRequest,
  ViralPredictResponse,
  // Auth
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  VerifyTokenRequest,
  VerifyTokenResponse,
  // Automation
  CreateAutomationRequest,
  Automation,
  ListAutomationsResponse,
  DeleteAutomationResponse,
  // Community
  CreatePostRequest,
  Post,
  FeedResponse,
  CreateGroupRequest,
  Group,
  UserProfile,
  Comment,
  // Trends
  CurrentTrendsResponse,
  PredictTrendsResponse,
  // Multiply
  MultiplyGenerateRequest,
  MultiplyGenerateResponse,
  // Workspace
  CreateWorkspaceRequest,
  Workspace,
  WorkspaceUsersResponse,
  // Marketplace
  CreateListingRequest,
  Listing,
  PurchaseListingRequest,
  PurchaseListingResponse,
  ListingsResponse,
  // Integrations
  ConnectPlatformRequest,
  PlatformConnection,
  PostToPlatformRequest,
  PostToPlatformResponse,
  ListConnectionsResponse,
  // ROI
  RoiResponse,
  // Creative Director
  AnalyzeContentRequest,
  AnalyzeContentResponse,
  // Viral Analyzer
  AnalyzeViralRequest,
  AnalyzeViralResponse,
} from '@/types/api';

// ============================================================================
// CONFIGURATION
// ============================================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const UPLOAD_TIMEOUT = 300000; // 5 minutes
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

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

  setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  getAuthToken(): string | null {
    return this.authToken;
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

    // Retry on network errors, timeouts, and 5xx errors
    if (error instanceof NetworkError || error instanceof TimeoutError) {
      return true;
    }

    if (error.statusCode >= 500 && error.statusCode < 600) {
      return true;
    }

    // Retry on rate limit with exponential backoff
    if (error instanceof RateLimitError) {
      return true;
    }

    return false;
  }

  private calculateRetryDelay(attempt: number, baseDelay: number, error?: ApiError): number {
    // Use retry-after header if available
    if (error instanceof RateLimitError && error.retryAfter) {
      return error.retryAfter * 1000;
    }

    // Exponential backoff: baseDelay * 2^attempt
    return baseDelay * Math.pow(2, attempt);
  }

  // --------------------------------------------------------------------------
  // CORE REQUEST METHOD
  // --------------------------------------------------------------------------

  private async request<T>(
    endpoint: string,
    config: RequestConfig
  ): Promise<T> {
    let lastError: ApiError | null = null;
    const maxRetries = config.retries ?? MAX_RETRIES;
    const retryDelay = config.retryDelay ?? RETRY_DELAY;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Apply request interceptors
        let modifiedConfig = { ...config };
        for (const interceptor of this.requestInterceptors) {
          if (interceptor.onRequest) {
            modifiedConfig = await interceptor.onRequest(modifiedConfig);
          }
        }

        // Build headers
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          ...modifiedConfig.headers,
        };

        if (this.authToken) {
          headers['Authorization'] = `Bearer ${this.authToken}`;
        }

        // Create abort controller for timeout
        const controller = new AbortController();
        const timeout = modifiedConfig.timeout ?? DEFAULT_TIMEOUT;
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
          // Make request
          const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: modifiedConfig.method,
            headers,
            body: modifiedConfig.body ? JSON.stringify(modifiedConfig.body) : undefined,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          // Apply response interceptors
          let modifiedResponse = response;
          for (const interceptor of this.responseInterceptors) {
            if (interceptor.onResponse) {
              modifiedResponse = await interceptor.onResponse(modifiedResponse);
            }
          }

          // Handle response
          if (!modifiedResponse.ok) {
            let errorData: any = {};
            try {
              errorData = await modifiedResponse.json();
            } catch {
              // Response is not JSON
            }

            const error = this.createErrorFromResponse(modifiedResponse.status, errorData);

            // Call error interceptors
            for (const interceptor of this.responseInterceptors) {
              if (interceptor.onError) {
                interceptor.onError(error);
              }
            }

            throw error;
          }

          // Parse successful response
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

        // Call request error interceptors
        for (const interceptor of this.requestInterceptors) {
          if (interceptor.onError) {
            interceptor.onError(lastError);
          }
        }

        // Check if we should retry
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
      // Validate file size
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

      // Validate file exists
      if (!file || file.size === 0) {
        reject(new UploadError('Invalid file or empty file', 400, 'INVALID_FILE'));
        return;
      }

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });

      // Handle successful upload
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

      // Handle network errors
      xhr.addEventListener('error', () => {
        reject(new UploadError('Network error. Please check your connection', 0, 'NETWORK_ERROR'));
      });

      // Handle request timeout
      xhr.addEventListener('timeout', () => {
        reject(new UploadError('Upload timeout. Please try again', 0, 'TIMEOUT'));
      });

      // Handle request abort
      xhr.addEventListener('abort', () => {
        reject(new UploadError('Upload cancelled', 0, 'CANCELLED'));
      });

      // Prepare form data
      const formData = new FormData();
      formData.append('file', file);
      if (userId) {
        formData.append('userId', userId);
      }

      // Configure and send request
      xhr.open('POST', `${this.baseUrl}/api/upload`);
      xhr.timeout = UPLOAD_TIMEOUT;

      if (this.authToken) {
        xhr.setRequestHeader('Authorization', `Bearer ${this.authToken}`);
      }

      xhr.send(formData);
    });
  }

  // --------------------------------------------------------------------------
  // UPLOAD API
  // --------------------------------------------------------------------------

  upload = {
    file: (file: File, onProgress?: (progress: number) => void, userId?: string) =>
      this.uploadWithProgress(file, onProgress, userId),
  };

  // --------------------------------------------------------------------------
  // PROCESS API
  // --------------------------------------------------------------------------

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

  // --------------------------------------------------------------------------
  // GENERATE API
  // --------------------------------------------------------------------------

  generate = {
    create: (data: GenerateRequest) =>
      this.request<GenerateResponse>('/api/generate', {
        method: 'POST',
        body: data,
        timeout: 60000, // 1 minute for AI generation
      }),

    get: (generationId: string) =>
      this.request<GenerateResponse>(`/api/generate/${generationId}`, {
        method: 'GET',
      }),
  };

  // --------------------------------------------------------------------------
  // DNA ANALYSIS API
  // --------------------------------------------------------------------------

  dna = {
    analyze: (data: DnaAnalyzeRequest) =>
      this.request<DnaAnalyzeResponse>('/api/dna/analyze', {
        method: 'POST',
        body: data,
        timeout: 60000,
      }),
  };

  // --------------------------------------------------------------------------
  // ANALYTICS API
  // --------------------------------------------------------------------------

  analytics = {
    get: (userId: string) =>
      this.request<AnalyticsResponse>(`/api/analytics/${userId}`, {
        method: 'GET',
      }),
  };

  // --------------------------------------------------------------------------
  // VIRAL PREDICTION API
  // --------------------------------------------------------------------------

  viral = {
    predict: (data: ViralPredictRequest) =>
      this.request<ViralPredictResponse>('/api/viral/predict', {
        method: 'POST',
        body: data,
      }),
  };

  // --------------------------------------------------------------------------
  // AUTH API
  // --------------------------------------------------------------------------

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
      // Auto-set token on successful login
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

  // --------------------------------------------------------------------------
  // AUTOMATION API
  // --------------------------------------------------------------------------

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

  // --------------------------------------------------------------------------
  // COMMUNITY API
  // --------------------------------------------------------------------------

  community = {
    // Posts
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

    unlikePost: (postId: string, userId: string) =>
      this.request<{ success: boolean; message: string; postId: string }>(
        `/api/community/post/${postId}/like`,
        {
          method: 'DELETE',
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

    deletePost: (postId: string, userId: string) =>
      this.request<{ success: boolean; message: string; postId: string }>(
        `/api/community/post/${postId}`,
        {
          method: 'DELETE',
          body: { userId },
        }
      ),

    // Groups
    createGroup: (data: CreateGroupRequest) =>
      this.request<{ success: boolean; group: Group }>('/api/community/group', {
        method: 'POST',
        body: data,
      }),

    getGroup: (groupId: string) =>
      this.request<{ success: boolean; group: Group }>(`/api/community/group/${groupId}`, {
        method: 'GET',
      }),

    listGroups: (limit = 50) =>
      this.request<{ success: boolean; groups: Group[]; count: number }>(
        `/api/community/groups?limit=${limit}`,
        {
          method: 'GET',
        }
      ),

    joinGroup: (groupId: string, userId: string) =>
      this.request<{ success: boolean; message: string; groupId: string }>(
        `/api/community/group/${groupId}/join`,
        {
          method: 'POST',
          body: { userId },
        }
      ),

    leaveGroup: (groupId: string, userId: string) =>
      this.request<{ success: boolean; message: string; groupId: string }>(
        `/api/community/group/${groupId}/leave`,
        {
          method: 'POST',
          body: { userId },
        }
      ),

    // Users
    getUser: (userId: string) =>
      this.request<{ success: boolean; user: UserProfile }>(`/api/community/user/${userId}`, {
        method: 'GET',
      }),

    followUser: (userId: string, followeeId: string) =>
      this.request<{ success: boolean; message: string; followeeId: string }>(
        `/api/community/user/${followeeId}/follow`,
        {
          method: 'POST',
          body: { userId },
        }
      ),

    unfollowUser: (userId: string, followeeId: string) =>
      this.request<{ success: boolean; message: string; followeeId: string }>(
        `/api/community/user/${followeeId}/unfollow`,
        {
          method: 'POST',
          body: { userId },
        }
      ),
  };

  // --------------------------------------------------------------------------
  // TRENDS API
  // --------------------------------------------------------------------------

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

  // --------------------------------------------------------------------------
  // MULTIPLY API
  // --------------------------------------------------------------------------

  multiply = {
    generate: (data: MultiplyGenerateRequest) =>
      this.request<MultiplyGenerateResponse>('/api/multiply/generate', {
        method: 'POST',
        body: data,
        timeout: 120000, // 2 minutes for content multiplication
      }),
  };

  // --------------------------------------------------------------------------
  // WORKSPACE API
  // --------------------------------------------------------------------------

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

    delete: (workspaceId: string) =>
      this.request<{ success: boolean; message: string; workspaceId: string }>(
        `/api/workspace/${workspaceId}`,
        {
          method: 'DELETE',
        }
      ),
  };

  // --------------------------------------------------------------------------
  // MARKETPLACE API
  // --------------------------------------------------------------------------

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

  // --------------------------------------------------------------------------
  // INTEGRATIONS API
  // --------------------------------------------------------------------------

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

  // --------------------------------------------------------------------------
  // ROI API
  // --------------------------------------------------------------------------

  roi = {
    calculate: (userId: string) =>
      this.request<RoiResponse>(`/api/roi/${userId}`, {
        method: 'GET',
      }),
  };

  // --------------------------------------------------------------------------
  // CREATIVE DIRECTOR API
  // --------------------------------------------------------------------------

  creativeDirector = {
    analyze: (data: AnalyzeContentRequest) =>
      this.request<AnalyzeContentResponse>('/api/creative-director/analyze', {
        method: 'POST',
        body: data,
        timeout: 60000,
      }),
  };

  // --------------------------------------------------------------------------
  // VIRAL ANALYZER API
  // --------------------------------------------------------------------------

  viralAnalyzer = {
    analyze: (data: AnalyzeViralRequest) =>
      this.request<AnalyzeViralResponse>('/api/viral-analyzer/analyze', {
        method: 'POST',
        body: data,
        timeout: 60000,
      }),
  };
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

const apiClient = new ApiClient(API_URL);

// ============================================================================
// DEFAULT INTERCEPTORS
// ============================================================================

// Request logging interceptor (development only)
if (process.env.NODE_ENV === 'development') {
  apiClient.addRequestInterceptor({
    onRequest: (config) => {
      console.log(`[API Request] ${config.method}`, config);
      return config;
    },
    onError: (error) => {
      console.error('[API Request Error]', error);
    },
  });

  apiClient.addResponseInterceptor({
    onResponse: (response) => {
      console.log('[API Response]', response.status, response.statusText);
      return response;
    },
    onError: (error) => {
      console.error('[API Response Error]', error);
    },
  });
}

// Auth token persistence interceptor
if (typeof window !== 'undefined') {
  // Load token from localStorage on initialization
  const savedToken = localStorage.getItem('authToken');
  if (savedToken) {
    apiClient.setAuthToken(savedToken);
  }

  // Save token to localStorage when set
  const originalSetAuthToken = apiClient.setAuthToken.bind(apiClient);
  apiClient.setAuthToken = (token: string | null) => {
    originalSetAuthToken(token);
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default apiClient;
export { ApiClient };

// Legacy export for backward compatibility
export const api = {
  upload: apiClient.upload.file,
};
