# ViralAnalyzer Component Architecture

## Overview
This document defines the architecture for integrating the ViralAnalyzer component with the backend `/api/viral-analyzer/analyze` endpoint. The design emphasizes type safety, clean data flow, proper error handling, and maintainability.

---

## 1. TypeScript Interfaces

### 1.1 Core Data Types

```typescript
// frontend/types/viral-analyzer.ts

/**
 * Timeline event representing a viral hook at a specific timestamp
 */
export interface TimelineEvent {
  /** Timestamp in format "MM:SS" or "HH:MM:SS" */
  timestamp: string;
  /** Type of hook (visual, emotional, narrative, audio) */
  type: 'visual' | 'emotional' | 'narrative' | 'audio';
  /** Impact level of the hook */
  impact: 'high' | 'medium' | 'low';
  /** Optional description of the hook */
  description?: string;
}

/**
 * Viral pattern detected in the content
 */
export interface ViralPattern {
  /** Pattern type identifier */
  type: string;
  /** Strength score (0-1) */
  strength: number;
  /** Human-readable description */
  description: string;
  /** Optional recommendations for this pattern */
  recommendations?: string[];
}

/**
 * Complete viral analysis result
 */
export interface ViralAnalysis {
  /** Original video URL analyzed */
  videoUrl: string;
  /** Overall viral score (0-100) */
  viralScore: number;
  /** Detected viral patterns */
  patterns: ViralPattern[];
  /** Timeline hooks/events */
  hooks: TimelineEvent[];
  /** Strategic guide for replication */
  guide: string;
  /** Analysis timestamp */
  analyzedAt?: string;
  /** Data source (for debugging) */
  source?: string;
}

/**
 * Request payload for viral analysis
 */
export interface AnalyzeViralRequest {
  videoUrl: string;
  /** Optional: Additional metadata for analysis */
  metadata?: {
    platform?: string;
    duration?: number;
    category?: string;
  };
}

/**
 * Response from viral analysis endpoint
 */
export interface AnalyzeViralResponse extends ViralAnalysis {
  /** Success indicator */
  success?: boolean;
  /** Error message if analysis failed */
  error?: string;
}
```

### 1.2 Component State Types

```typescript
/**
 * Loading states for the analysis process
 */
export type AnalysisLoadingState = 
  | 'idle'           // No analysis in progress
  | 'validating'     // Validating input
  | 'analyzing'      // Analysis in progress
  | 'complete'       // Analysis complete
  | 'error';         // Error occurred

/**
 * Component state interface
 */
export interface ViralAnalyzerState {
  /** Current loading state */
  loadingState: AnalysisLoadingState;
  /** Analysis result data */
  analysis: ViralAnalysis | null;
  /** Error information */
  error: {
    message: string;
    code?: string;
    details?: any;
  } | null;
  /** Input video URL */
  videoUrl: string;
  /** Progress percentage (0-100) */
  progress: number;
}
```

---

## 2. API Client Integration

### 2.1 Enhanced API Method

The API client already has the `viralAnalyzer.analyze` method. We'll ensure it's properly typed:

```typescript
// frontend/services/api.ts (already exists, verify types)

viralAnalyzer = {
  analyze: (data: AnalyzeViralRequest) =>
    this.request<AnalyzeViralResponse>('/api/viral-analyzer/analyze', {
      method: 'POST',
      body: data,
      timeout: 60000, // 60 seconds for video analysis
    }),
};
```

### 2.2 Service Layer (Optional Abstraction)

For better separation of concerns, create a dedicated service:

```typescript
// frontend/services/viral-analyzer.service.ts

import apiClient from './api';
import { AnalyzeViralRequest, AnalyzeViralResponse } from '@/types/viral-analyzer';
import { ApiError } from '@/types/api';

export class ViralAnalyzerService {
  /**
   * Analyze viral content from a video URL
   * @throws {ApiError} If the request fails
   */
  static async analyzeVideo(videoUrl: string): Promise<AnalyzeViralResponse> {
    // Validate URL format
    if (!this.isValidVideoUrl(videoUrl)) {
      throw new ApiError(
        'Invalid video URL format',
        400,
        'INVALID_URL'
      );
    }

    const request: AnalyzeViralRequest = {
      videoUrl,
      metadata: {
        platform: this.detectPlatform(videoUrl),
      },
    };

    return apiClient.viralAnalyzer.analyze(request);
  }

  /**
   * Validate video URL format
   */
  private static isValidVideoUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  /**
   * Detect platform from URL
   */
  private static detectPlatform(url: string): string | undefined {
    const urlLower = url.toLowerCase();
    if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
      return 'youtube';
    }
    if (urlLower.includes('tiktok.com')) {
      return 'tiktok';
    }
    if (urlLower.includes('instagram.com')) {
      return 'instagram';
    }
    return undefined;
  }
}
```

---

## 3. Data Flow Architecture

### 3.1 Flow Diagram

```
┌─────────────────┐
│  User Input     │
│  (Video URL)    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  ViralAnalyzer          │
│  Component              │
│  - Validation           │
│  - State Management     │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  ViralAnalyzerService   │
│  - URL Validation       │
│  - Platform Detection   │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  API Client             │
│  - Request Formatting   │
│  - Error Handling       │
│  - Retry Logic          │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Backend Endpoint       │
│  /api/viral-analyzer    │
│  /analyze               │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Response Processing    │
│  - Type Validation      │
│  - Error Mapping        │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Component Update       │
│  - State Update         │
│  - UI Rendering         │
└─────────────────────────┘
```

### 3.2 State Management Flow

```typescript
// Component lifecycle states

IDLE → VALIDATING → ANALYZING → COMPLETE
  ↓         ↓           ↓           ↓
  └─────────┴───────────┴──→ ERROR ←┘
```

---

## 4. Error Handling Strategy

### 4.1 Error Types

```typescript
// frontend/types/viral-analyzer.ts

export enum ViralAnalyzerErrorCode {
  INVALID_URL = 'INVALID_URL',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  RATE_LIMIT = 'RATE_LIMIT',
  SERVER_ERROR = 'SERVER_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface ViralAnalyzerError {
  code: ViralAnalyzerErrorCode;
  message: string;
  userMessage: string; // User-friendly message
  retryable: boolean;
  details?: any;
}
```

### 4.2 Error Mapping

```typescript
// frontend/utils/viral-analyzer-errors.ts

import { ApiError } from '@/types/api';
import { ViralAnalyzerError, ViralAnalyzerErrorCode } from '@/types/viral-analyzer';

export function mapApiError(error: ApiError): ViralAnalyzerError {
  // Network errors
  if (error.code === 'NETWORK_ERROR') {
    return {
      code: ViralAnalyzerErrorCode.NETWORK_ERROR,
      message: error.message,
      userMessage: 'Unable to connect. Please check your internet connection.',
      retryable: true,
    };
  }

  // Timeout errors
  if (error.code === 'TIMEOUT_ERROR') {
    return {
      code: ViralAnalyzerErrorCode.TIMEOUT,
      message: error.message,
      userMessage: 'Analysis is taking longer than expected. Please try again.',
      retryable: true,
    };
  }

  // Rate limit errors
  if (error.statusCode === 429) {
    return {
      code: ViralAnalyzerErrorCode.RATE_LIMIT,
      message: error.message,
      userMessage: 'Too many requests. Please wait a moment and try again.',
      retryable: true,
    };
  }

  // Validation errors
  if (error.statusCode === 400) {
    return {
      code: ViralAnalyzerErrorCode.VALIDATION_ERROR,
      message: error.message,
      userMessage: 'Invalid video URL. Please check the URL and try again.',
      retryable: false,
    };
  }

  // Server errors
  if (error.statusCode >= 500) {
    return {
      code: ViralAnalyzerErrorCode.SERVER_ERROR,
      message: error.message,
      userMessage: 'Server error. Our team has been notified. Please try again later.',
      retryable: true,
    };
  }

  // Unknown errors
  return {
    code: ViralAnalyzerErrorCode.UNKNOWN_ERROR,
    message: error.message,
    userMessage: 'An unexpected error occurred. Please try again.',
    retryable: true,
  };
}
```

---

## 5. Component Architecture

### 5.1 Component Structure

```typescript
// frontend/components/ViralAnalyzer.tsx

import React, { useState, useCallback } from 'react';
import { ViralAnalyzerService } from '@/services/viral-analyzer.service';
import { ViralAnalyzerState, AnalysisLoadingState } from '@/types/viral-analyzer';
import { mapApiError } from '@/utils/viral-analyzer-errors';
import { ApiError } from '@/types/api';

export const ViralAnalyzer: React.FC = () => {
  // State management
  const [state, setState] = useState<ViralAnalyzerState>({
    loadingState: 'idle',
    analysis: null,
    error: null,
    videoUrl: '',
    progress: 0,
  });

  // Analysis handler
  const handleAnalyze = useCallback(async () => {
    // Implementation details...
  }, [state.videoUrl]);

  // Render logic
  return (
    // Component JSX...
  );
};
```

### 5.2 Custom Hook (Alternative)

```typescript
// frontend/hooks/useViralAnalyzer.ts

import { useState, useCallback } from 'react';
import { ViralAnalyzerService } from '@/services/viral-analyzer.service';
import { ViralAnalyzerState } from '@/types/viral-analyzer';
import { mapApiError } from '@/utils/viral-analyzer-errors';

export function useViralAnalyzer() {
  const [state, setState] = useState<ViralAnalyzerState>({
    loadingState: 'idle',
    analysis: null,
    error: null,
    videoUrl: '',
    progress: 0,
  });

  const analyze = useCallback(async (videoUrl: string) => {
    setState(prev => ({
      ...prev,
      loadingState: 'validating',
      error: null,
      videoUrl,
      progress: 10,
    }));

    try {
      setState(prev => ({ ...prev, loadingState: 'analyzing', progress: 30 }));
      
      const result = await ViralAnalyzerService.analyzeVideo(videoUrl);
      
      setState(prev => ({
        ...prev,
        loadingState: 'complete',
        analysis: result,
        progress: 100,
      }));

      return result;
    } catch (error) {
      const mappedError = mapApiError(error as any);
      
      setState(prev => ({
        ...prev,
        loadingState: 'error',
        error: {
          message: mappedError.userMessage,
          code: mappedError.code,
          details: mappedError,
        },
        progress: 0,
      }));

      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      loadingState: 'idle',
      analysis: null,
      error: null,
      videoUrl: '',
      progress: 0,
    });
  }, []);

  return {
    ...state,
    analyze,
    reset,
    isLoading: state.loadingState === 'analyzing' || state.loadingState === 'validating',
    hasError: state.loadingState === 'error',
    hasResult: state.loadingState === 'complete' && state.analysis !== null,
  };
}
```

---

## 6. Visualization Components

### 6.1 Component Hierarchy

```
ViralAnalyzer (Main Container)
├── ViralAnalyzerInput
│   ├── URL Input Field
│   ├── Analyze Button
│   └── Validation Messages
├── ViralAnalyzerLoading
│   ├── Progress Bar
│   ├── Loading Animation
│   └── Status Messages
├── ViralAnalyzerError
│   ├── Error Icon
│   ├── Error Message
│   └── Retry Button
└── ViralAnalyzerResults
    ├── ViralScoreGauge (Overall Score)
    ├── PatternsSection
    │   └── PatternCard[] (Each pattern)
    ├── TimelineSection
    │   └── TimelineEvent[] (Hooks visualization)
    └── GuideSection
        └── Strategic Guide Text
```

### 6.2 Sub-Component Interfaces

```typescript
// Pattern Card Component
interface PatternCardProps {
  pattern: ViralPattern;
  index: number;
}

// Timeline Event Component
interface TimelineEventProps {
  event: TimelineEvent;
  totalDuration?: number; // For positioning
}

// Viral Score Gauge Component (already exists)
interface ViralScoreGaugeProps {
  score: number;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}
```

---

## 7. Loading States & UX

### 7.1 Loading State Indicators

```typescript
const loadingMessages: Record<AnalysisLoadingState, string> = {
  idle: '',
  validating: 'Validating video URL...',
  analyzing: 'Analyzing viral patterns...',
  complete: 'Analysis complete!',
  error: 'Analysis failed',
};

const loadingProgress: Record<AnalysisLoadingState, number> = {
  idle: 0,
  validating: 10,
  analyzing: 50,
  complete: 100,
  error: 0,
};
```

### 7.2 Progressive Enhancement

```typescript
// Simulate progress during analysis
const simulateProgress = (
  startProgress: number,
  endProgress: number,
  duration: number,
  onProgress: (progress: number) => void
) => {
  const steps = 20;
  const stepDuration = duration / steps;
  const progressIncrement = (endProgress - startProgress) / steps;
  
  let currentStep = 0;
  const interval = setInterval(() => {
    currentStep++;
    const newProgress = startProgress + (progressIncrement * currentStep);
    onProgress(Math.min(newProgress, endProgress));
    
    if (currentStep >= steps) {
      clearInterval(interval);
    }
  }, stepDuration);
  
  return () => clearInterval(interval);
};
```

---

## 8. Testing Strategy

### 8.1 Unit Tests

```typescript
// frontend/__tests__/viral-analyzer.service.test.ts

describe('ViralAnalyzerService', () => {
  describe('analyzeVideo', () => {
    it('should validate URL format', async () => {
      await expect(
        ViralAnalyzerService.analyzeVideo('invalid-url')
      ).rejects.toThrow('Invalid video URL format');
    });

    it('should detect platform from URL', () => {
      const youtubeUrl = 'https://youtube.com/watch?v=123';
      // Test platform detection
    });

    it('should handle API errors gracefully', async () => {
      // Mock API error
      // Verify error mapping
    });
  });
});
```

### 8.2 Integration Tests

```typescript
// frontend/__tests__/ViralAnalyzer.integration.test.tsx

describe('ViralAnalyzer Integration', () => {
  it('should complete full analysis flow', async () => {
    // 1. Render component
    // 2. Enter URL
    // 3. Click analyze
    // 4. Wait for results
    // 5. Verify results displayed
  });

  it('should handle network errors', async () => {
    // Mock network failure
    // Verify error UI
    // Verify retry functionality
  });
});
```

---

## 9. Performance Considerations

### 9.1 Optimization Strategies

1. **Debounced Input Validation**
   - Validate URL format on input with 300ms debounce
   - Prevent unnecessary API calls

2. **Memoization**
   - Memoize expensive calculations (pattern sorting, timeline positioning)
   - Use `React.memo` for sub-components

3. **Lazy Loading**
   - Code-split visualization components
   - Load chart libraries on-demand

4. **Caching**
   - Cache analysis results by URL (session storage)
   - Implement cache expiration (e.g., 1 hour)

### 9.2 Implementation Example

```typescript
// frontend/utils/viral-analyzer-cache.ts

interface CacheEntry {
  data: AnalyzeViralResponse;
  timestamp: number;
}

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export class ViralAnalyzerCache {
  private static STORAGE_KEY = 'viral_analyzer_cache';

  static get(videoUrl: string): AnalyzeViralResponse | null {
    try {
      const cache = this.getCache();
      const entry = cache[videoUrl];
      
      if (!entry) return null;
      
      const isExpired = Date.now() - entry.timestamp > CACHE_DURATION;
      if (isExpired) {
        this.remove(videoUrl);
        return null;
      }
      
      return entry.data;
    } catch {
      return null;
    }
  }

  static set(videoUrl: string, data: AnalyzeViralResponse): void {
    try {
      const cache = this.getCache();
      cache[videoUrl] = {
        data,
        timestamp: Date.now(),
      };
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(cache));
    } catch {
      // Storage quota exceeded or unavailable
    }
  }

  private static getCache(): Record<string, CacheEntry> {
    try {
      const cached = sessionStorage.getItem(this.STORAGE_KEY);
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  }

  private static remove(videoUrl: string): void {
    try {
      const cache = this.getCache();
      delete cache[videoUrl];
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(cache));
    } catch {
      // Ignore errors
    }
  }
}
```

---

## 10. Accessibility

### 10.1 ARIA Labels

```typescript
// Ensure all interactive elements have proper labels
<button
  onClick={handleAnalyze}
  disabled={isLoading}
  aria-label="Analyze video for viral patterns"
  aria-busy={isLoading}
>
  Analyze
</button>

<div
  role="progressbar"
  aria-valuenow={progress}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label="Analysis progress"
>
  {progress}%
</div>
```

### 10.2 Keyboard Navigation

- All interactive elements must be keyboard accessible
- Implement focus management for modal/overlay states
- Provide keyboard shortcuts for common actions

---

## 11. Security Considerations

### 11.1 Input Sanitization

```typescript
// Sanitize URL input to prevent XSS
function sanitizeUrl(url: string): string {
  // Remove any javascript: or data: protocols
  const sanitized = url.trim();
  const urlObj = new URL(sanitized);
  
  if (!['http:', 'https:'].includes(urlObj.protocol)) {
    throw new Error('Invalid protocol');
  }
  
  return sanitized;
}
```

### 11.2 Rate Limiting (Client-Side)

```typescript
// Prevent abuse by limiting requests
class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests = 10;
  private readonly timeWindow = 60000; // 1 minute

  canMakeRequest(): boolean {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    return this.requests.length < this.maxRequests;
  }

  recordRequest(): void {
    this.requests.push(Date.now());
  }
}
```

---

## 12. File Structure

```
frontend/
├── components/
│   ├── ViralAnalyzer.tsx                    # Main component
│   ├── ViralAnalyzer.ARCHITECTURE.md        # This file
│   ├── viral-analyzer/
│   │   ├── ViralAnalyzerInput.tsx
│   │   ├── ViralAnalyzerLoading.tsx
│   │   ├── ViralAnalyzerError.tsx
│   │   ├── ViralAnalyzerResults.tsx
│   │   ├── PatternCard.tsx
│   │   └── TimelineVisualization.tsx
├── hooks/
│   └── useViralAnalyzer.ts                  # Custom hook
├── services/
│   └── viral-analyzer.service.ts            # Service layer
├── types/
│   └── viral-analyzer.ts                    # Type definitions
├── utils/
│   ├── viral-analyzer-errors.ts             # Error mapping
│   └── viral-analyzer-cache.ts              # Caching utility
└── __tests__/
    ├── viral-analyzer.service.test.ts
    ├── useViralAnalyzer.test.ts
    └── ViralAnalyzer.integration.test.tsx
```

---

## 13. Implementation Checklist

### Phase 1: Foundation
- [ ] Create type definitions (`types/viral-analyzer.ts`)
- [ ] Implement service layer (`services/viral-analyzer.service.ts`)
- [ ] Create error mapping utility (`utils/viral-analyzer-errors.ts`)
- [ ] Implement custom hook (`hooks/useViralAnalyzer.ts`)

### Phase 2: Core Component
- [ ] Build main ViralAnalyzer component
- [ ] Implement input validation
- [ ] Add loading states
- [ ] Implement error handling

### Phase 3: Visualization
- [ ] Create PatternCard component
- [ ] Build TimelineVisualization component
- [ ] Integrate ViralScoreGauge (existing)
- [ ] Add results display

### Phase 4: Enhancement
- [ ] Implement caching
- [ ] Add progressive loading
- [ ] Optimize performance
- [ ] Add accessibility features

### Phase 5: Testing
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Manual testing
- [ ] Accessibility audit

---

## 14. API Contract

### Request
```typescript
POST /api/viral-analyzer/analyze
Content-Type: application/json

{
  "videoUrl": "https://youtube.com/watch?v=example",
  "metadata": {
    "platform": "youtube",
    "duration": 120,
    "category": "entertainment"
  }
}
```

### Response (Success)
```typescript
200 OK
Content-Type: application/json

{
  "videoUrl": "https://youtube.com/watch?v=example",
  "viralScore": 87,
  "patterns": [
    {
      "type": "hook",
      "strength": 0.92,
      "description": "Immediate visual impact in first 3 seconds"
    }
  ],
  "hooks": [
    {
      "timestamp": "0:00",
      "type": "visual",
      "impact": "high"
    }
  ],
  "guide": "Replicate the fast-paced editing...",
  "analyzedAt": "2024-01-15T10:30:00Z",
  "source": "ai-analysis"
}
```

### Response (Error)
```typescript
400 Bad Request
Content-Type: application/json

{
  "success": false,
  "error": "Invalid video URL format",
  "code": "VALIDATION_ERROR"
}
```

---

## Summary

This architecture provides:

✅ **Type Safety**: Comprehensive TypeScript interfaces for all data structures
✅ **Clean Separation**: Service layer abstracts API calls from components
✅ **Error Handling**: Robust error mapping and user-friendly messages
✅ **Loading States**: Progressive loading with clear user feedback
✅ **Performance**: Caching, memoization, and optimization strategies
✅ **Accessibility**: ARIA labels and keyboard navigation
✅ **Testability**: Clear testing strategy with unit and integration tests
✅ **Maintainability**: Well-organized file structure and documentation

The design follows React best practices, leverages existing infrastructure (API client, toast system), and provides a solid foundation for future enhancements.
