/**
 * Jest Test Setup Configuration
 * 
 * This file configures the global test environment including:
 * - Environment variables
 * - AWS service mocks (S3, Bedrock, Transcribe)
 * - Global test utilities
 * - Mock data factories
 * - Global hooks
 */

// Note: AWS mocks are commented out until aws-sdk-client-mock is installed
// import { mockClient } from 'aws-sdk-client-mock';
// import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
// import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
// import { TranscribeClient, StartTranscriptionJobCommand, GetTranscriptionJobCommand } from '@aws-sdk/client-transcribe';

// ============================================================================
// Environment Configuration
// ============================================================================

/**
 * Set up test environment variables
 */
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.AWS_REGION = 'us-east-1';
process.env.AWS_ACCESS_KEY_ID = 'test-access-key';
process.env.AWS_SECRET_ACCESS_KEY = 'test-secret-key';
process.env.S3_BUCKET = 'test-bucket';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
process.env.ALLOWED_ORIGINS = 'http://localhost:3000';
process.env.RATE_LIMIT_WINDOW_MS = '900000';
process.env.RATE_LIMIT_MAX_REQUESTS = '100';
process.env.UPLOAD_RATE_LIMIT_MAX = '10';
process.env.MAX_FILE_SIZE = '104857600';
process.env.ALLOWED_FILE_TYPES = 'video/mp4,video/quicktime,audio/mpeg,audio/wav,text/plain';
process.env.CACHE_TTL_SECONDS = '3600';
process.env.LOG_LEVEL = 'error'; // Reduce noise in tests

// ============================================================================
// AWS Service Mocks
// ============================================================================

/**
 * S3 Client Mock
 */
// export const s3Mock = mockClient(S3Client);

/**
 * Bedrock Runtime Client Mock
 */
// export const bedrockMock = mockClient(BedrockRuntimeClient);

/**
 * Transcribe Client Mock
 */
// export const transcribeMock = mockClient(TranscribeClient);

/**
 * Reset all AWS mocks before each test
 */
beforeEach(() => {
  // s3Mock.reset();
  // bedrockMock.reset();
  // transcribeMock.reset();
});

/**
 * Configure default S3 mock responses
 */
export const setupS3Mocks = () => {
  // Mock successful file upload
  // s3Mock.on(PutObjectCommand).resolves({
  //   ETag: '"mock-etag"',
  //   VersionId: 'mock-version-id',
  // });

  // Mock successful file retrieval
  // s3Mock.on(GetObjectCommand).resolves({
  //   Body: Buffer.from('mock file content') as any,
  //   ContentType: 'application/octet-stream',
  //   ContentLength: 100,
  // });

  // Mock successful file deletion
  // s3Mock.on(DeleteObjectCommand).resolves({});
};

/**
 * Configure default Bedrock mock responses
 */
export const setupBedrockMocks = () => {
  // Mock successful AI model invocation
  // bedrockMock.on(InvokeModelCommand).resolves({
  //   body: new TextEncoder().encode(JSON.stringify({
  //     completion: 'This is a mock AI response for testing purposes.',
  //     stop_reason: 'end_turn',
  //   })),
  //   contentType: 'application/json',
  // });
};

/**
 * Configure default Transcribe mock responses
 */
export const setupTranscribeMocks = () => {
  // Mock transcription job start
  // transcribeMock.on(StartTranscriptionJobCommand).resolves({
  //   TranscriptionJob: {
  //     TranscriptionJobName: 'mock-job-123',
  //     TranscriptionJobStatus: 'IN_PROGRESS',
  //   },
  // });

  // Mock transcription job status check
  // transcribeMock.on(GetTranscriptionJobCommand).resolves({
  //   TranscriptionJob: {
  //     TranscriptionJobName: 'mock-job-123',
  //     TranscriptionJobStatus: 'COMPLETED',
  //     Transcript: {
  //       TranscriptFileUri: 'https://mock-transcript-url.com/transcript.json',
  //     },
  //   },
  // });
};

// ============================================================================
// Mock Data Factories
// ============================================================================

/**
 * Generate mock user data
 */
export const createMockUser = (overrides: Partial<{
  id: string;
  name: string;
  email: string;
  color: string;
}> = {}) => ({
  id: overrides.id || `user-${Date.now()}`,
  name: overrides.name || 'Test User',
  email: overrides.email || 'test@example.com',
  color: overrides.color || '#3B82F6',
});

/**
 * Generate mock workspace data
 */
export const createMockWorkspace = (overrides: Partial<{
  id: string;
  name: string;
  content: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}> = {}) => ({
  id: overrides.id || `workspace-${Date.now()}`,
  name: overrides.name || 'Test Workspace',
  content: overrides.content || '',
  version: overrides.version || 0,
  createdAt: overrides.createdAt || new Date(),
  updatedAt: overrides.updatedAt || new Date(),
});

/**
 * Generate mock ADHD session data
 */
export const createMockADHDSession = (overrides: Partial<{
  id: string;
  userId: string;
  taskName: string;
  duration: number;
  startTime: Date;
  completed: boolean;
  interrupted: boolean;
}> = {}) => ({
  id: overrides.id || `session-${Date.now()}`,
  userId: overrides.userId || 'test-user',
  taskName: overrides.taskName || 'Test Task',
  duration: overrides.duration || 25,
  startTime: overrides.startTime || new Date(),
  completed: overrides.completed || false,
  interrupted: overrides.interrupted || false,
});

/**
 * Generate mock file upload data
 */
export const createMockFile = (overrides: Partial<{
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}> = {}) => ({
  fieldname: overrides.fieldname || 'file',
  originalname: overrides.originalname || 'test-file.mp4',
  encoding: overrides.encoding || '7bit',
  mimetype: overrides.mimetype || 'video/mp4',
  size: overrides.size || 1024,
  buffer: overrides.buffer || Buffer.from('mock file content'),
  destination: '',
  filename: '',
  path: '',
  stream: null as any,
});

/**
 * Generate mock S3 upload result
 */
export const createMockS3Upload = (overrides: Partial<{
  key: string;
  bucket: string;
  location: string;
  etag: string;
}> = {}) => ({
  key: overrides.key || `uploads/test-${Date.now()}.mp4`,
  bucket: overrides.bucket || 'test-bucket',
  location: overrides.location || `https://test-bucket.s3.amazonaws.com/uploads/test-${Date.now()}.mp4`,
  etag: overrides.etag || '"mock-etag"',
});

/**
 * Generate mock AI content generation result
 */
export const createMockAIContent = (overrides: Partial<{
  platform: string;
  content: string;
  metadata: Record<string, any>;
}> = {}) => ({
  platform: overrides.platform || 'twitter',
  content: overrides.content || 'This is mock AI-generated content for testing.',
  metadata: overrides.metadata || {
    model: 'claude-3-sonnet',
    tokens: 150,
    confidence: 0.95,
  },
});

/**
 * Generate mock transcription result
 */
export const createMockTranscription = (overrides: Partial<{
  jobName: string;
  status: string;
  transcript: string;
  confidence: number;
}> = {}) => ({
  jobName: overrides.jobName || `transcription-${Date.now()}`,
  status: overrides.status || 'COMPLETED',
  transcript: overrides.transcript || 'This is a mock transcription of the audio content.',
  confidence: overrides.confidence || 0.98,
});

/**
 * Generate mock community post data
 */
export const createMockCommunityPost = (overrides: Partial<{
  id: string;
  userId: string;
  content: string;
  likes: number;
  comments: number;
  createdAt: Date;
}> = {}) => ({
  id: overrides.id || `post-${Date.now()}`,
  userId: overrides.userId || 'test-user',
  content: overrides.content || 'This is a test community post.',
  likes: overrides.likes || 0,
  comments: overrides.comments || 0,
  createdAt: overrides.createdAt || new Date(),
});

// ============================================================================
// Test Utilities
// ============================================================================

/**
 * Wait for a specified amount of time
 */
export const wait = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Create a mock Express request object
 */
export const createMockRequest = (overrides: Partial<{
  body: any;
  params: any;
  query: any;
  headers: any;
  file: any;
  files: any;
}> = {}) => ({
  body: overrides.body || {},
  params: overrides.params || {},
  query: overrides.query || {},
  headers: overrides.headers || {},
  file: overrides.file,
  files: overrides.files,
});

/**
 * Create a mock Express response object
 */
export const createMockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.set = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  return res;
};

/**
 * Create a mock Express next function
 */
export const createMockNext = () => jest.fn();

/**
 * Assert that an error has a specific message
 */
export const expectErrorMessage = (error: any, message: string) => {
  expect(error).toBeDefined();
  expect(error.message).toBe(message);
};

/**
 * Assert that a response has a specific status and success flag
 */
export const expectSuccessResponse = (response: any, status: number = 200) => {
  expect(response.status).toBe(status);
  expect(response.body.success).toBe(true);
};

/**
 * Assert that a response has a specific error status
 */
export const expectErrorResponse = (response: any, status: number, message?: string) => {
  expect(response.status).toBe(status);
  if (message) {
    expect(response.body.error || response.body.message).toContain(message);
  }
};

/**
 * Mock console methods to reduce test output noise
 */
export const mockConsole = () => {
  const originalConsole = { ...console };
  
  beforeAll(() => {
    console.log = jest.fn();
    console.info = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  });

  afterAll(() => {
    console.log = originalConsole.log;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
  });
};

/**
 * Generate a random string for testing
 */
export const randomString = (length: number = 10): string => {
  return Math.random().toString(36).substring(2, 2 + length);
};

/**
 * Generate a random number within a range
 */
export const randomNumber = (min: number = 0, max: number = 100): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// ============================================================================
// Global Test Hooks
// ============================================================================

/**
 * Global setup before all tests
 */
beforeAll(() => {
  // Set up default AWS mocks
  setupS3Mocks();
  setupBedrockMocks();
  setupTranscribeMocks();
});

/**
 * Global cleanup after all tests
 */
afterAll(async () => {
  // Clean up any resources
  // s3Mock.restore();
  // bedrockMock.restore();
  // transcribeMock.restore();
  
  // Allow time for cleanup
  await wait(100);
});

/**
 * Reset mocks and state before each test
 */
beforeEach(() => {
  // Clear all mocks
  jest.clearAllMocks();
  
  // Reset AWS mocks
  // s3Mock.reset();
  // bedrockMock.reset();
  // transcribeMock.reset();
  
  // Re-apply default mock behaviors
  setupS3Mocks();
  setupBedrockMocks();
  setupTranscribeMocks();
});

// ============================================================================
// Custom Matchers
// ============================================================================

/**
 * Extend Jest matchers with custom assertions
 */
expect.extend({
  /**
   * Check if a value is a valid UUID
   */
  toBeValidUUID(received: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const pass = uuidRegex.test(received);
    
    return {
      pass,
      message: () => pass
        ? `expected ${received} not to be a valid UUID`
        : `expected ${received} to be a valid UUID`,
    };
  },

  /**
   * Check if a value is a valid ISO date string
   */
  toBeValidISODate(received: string) {
    const date = new Date(received);
    const pass = !isNaN(date.getTime()) && received === date.toISOString();
    
    return {
      pass,
      message: () => pass
        ? `expected ${received} not to be a valid ISO date`
        : `expected ${received} to be a valid ISO date`,
    };
  },

  /**
   * Check if an object has all required properties
   */
  toHaveProperties(received: any, properties: string[]) {
    const missingProps = properties.filter(prop => !(prop in received));
    const pass = missingProps.length === 0;
    
    return {
      pass,
      message: () => pass
        ? `expected object not to have properties ${properties.join(', ')}`
        : `expected object to have properties ${missingProps.join(', ')}`,
    };
  },
});

// ============================================================================
// Type Declarations for Custom Matchers
// ============================================================================

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidUUID(): R;
      toBeValidISODate(): R;
      toHaveProperties(properties: string[]): R;
    }
  }
}

// ============================================================================
// Export All Utilities
// ============================================================================

export default {
  // Mocks (commented out until aws-sdk-client-mock is installed)
  // s3Mock,
  // bedrockMock,
  // transcribeMock,
  setupS3Mocks,
  setupBedrockMocks,
  setupTranscribeMocks,
  
  // Factories
  createMockUser,
  createMockWorkspace,
  createMockADHDSession,
  createMockFile,
  createMockS3Upload,
  createMockAIContent,
  createMockTranscription,
  createMockCommunityPost,
  
  // Utilities
  wait,
  createMockRequest,
  createMockResponse,
  createMockNext,
  expectErrorMessage,
  expectSuccessResponse,
  expectErrorResponse,
  mockConsole,
  randomString,
  randomNumber,
};
