/**
 * useViralAnalyzer Hook
 * Custom React hook for viral content analysis
 * Manages state, API calls, caching, and error handling
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { ViralAnalyzerService } from '@/services/viral-analyzer.service';
import { ViralAnalyzerCache } from '@/utils/viral-analyzer-cache';
import { mapApiError } from '@/utils/viral-analyzer-errors';
import {
  ViralAnalyzerState,
  AnalyzeViralResponse,
  UseViralAnalyzerReturn,
} from '@/types/viral-analyzer';

/**
 * Hook configuration options
 */
interface UseViralAnalyzerOptions {
  /** Enable caching (default: true) */
  enableCache?: boolean;
  /** Callback when analysis completes */
  onSuccess?: (result: AnalyzeViralResponse) => void;
  /** Callback when error occurs */
  onError?: (error: any) => void;
  /** Initial video URL */
  initialUrl?: string;
}

/**
 * Custom hook for viral content analysis
 * @param options - Hook configuration
 * @returns Hook state and methods
 */
export function useViralAnalyzer(
  options: UseViralAnalyzerOptions = {}
): UseViralAnalyzerReturn {
  const {
    enableCache = true,
    onSuccess,
    onError,
    initialUrl = '',
  } = options;

  // State
  const [state, setState] = useState<ViralAnalyzerState>({
    loadingState: 'idle',
    analysis: null,
    error: null,
    videoUrl: initialUrl,
    progress: 0,
  });

  // Refs for cleanup
  const abortControllerRef = useRef<AbortController | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Cleanup function
   */
  const cleanup = useCallback(() => {
    // Abort ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Clear progress timer
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  /**
   * Simulate progress during analysis
   */
  const startProgressSimulation = useCallback(() => {
    // Clear existing timer
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
    }

    let currentProgress = 30;
    progressTimerRef.current = setInterval(() => {
      currentProgress += Math.random() * 10;
      if (currentProgress >= 90) {
        currentProgress = 90; // Cap at 90% until real completion
        if (progressTimerRef.current) {
          clearInterval(progressTimerRef.current);
        }
      }
      setState((prev) => ({ ...prev, progress: Math.floor(currentProgress) }));
    }, 500);
  }, []);

  /**
   * Analyze video URL
   */
  const analyze = useCallback(
    async (videoUrl: string): Promise<AnalyzeViralResponse> => {
      // Cleanup previous request
      cleanup();

      // Update state to validating
      setState((prev) => ({
        ...prev,
        loadingState: 'validating',
        error: null,
        videoUrl,
        progress: 10,
      }));

      try {
        // Check cache first
        if (enableCache) {
          const cached = ViralAnalyzerCache.get(videoUrl);
          if (cached) {
            setState((prev) => ({
              ...prev,
              loadingState: 'complete',
              analysis: cached,
              progress: 100,
            }));

            if (onSuccess) {
              onSuccess(cached);
            }

            return cached;
          }
        }

        // Update state to analyzing
        setState((prev) => ({
          ...prev,
          loadingState: 'analyzing',
          progress: 30,
        }));

        // Start progress simulation
        startProgressSimulation();

        // Create abort controller for this request
        abortControllerRef.current = new AbortController();

        // Make API request
        const result = await ViralAnalyzerService.analyzeVideo(videoUrl);

        // Clear progress timer
        if (progressTimerRef.current) {
          clearInterval(progressTimerRef.current);
          progressTimerRef.current = null;
        }

        // Cache result
        if (enableCache) {
          ViralAnalyzerCache.set(videoUrl, result);
        }

        // Update state to complete
        setState((prev) => ({
          ...prev,
          loadingState: 'complete',
          analysis: result,
          progress: 100,
        }));

        // Call success callback
        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (error: any) {
        // Clear progress timer
        if (progressTimerRef.current) {
          clearInterval(progressTimerRef.current);
          progressTimerRef.current = null;
        }

        // Don't update state if request was aborted
        if (error.name === 'AbortError') {
          return Promise.reject(error);
        }

        // Map error to user-friendly format
        const mappedError = mapApiError(error);

        // Update state to error
        setState((prev) => ({
          ...prev,
          loadingState: 'error',
          error: {
            message: mappedError.userMessage,
            code: mappedError.code,
            details: mappedError,
          },
          progress: 0,
        }));

        // Call error callback
        if (onError) {
          onError(mappedError);
        }

        throw error;
      }
    },
    [enableCache, onSuccess, onError, cleanup, startProgressSimulation]
  );

  /**
   * Reset state to idle
   */
  const reset = useCallback(() => {
    cleanup();
    setState({
      loadingState: 'idle',
      analysis: null,
      error: null,
      videoUrl: '',
      progress: 0,
    });
  }, [cleanup]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // Computed properties
  const isLoading =
    state.loadingState === 'analyzing' || state.loadingState === 'validating';
  const hasError = state.loadingState === 'error';
  const hasResult = state.loadingState === 'complete' && state.analysis !== null;

  return {
    ...state,
    analyze,
    reset,
    isLoading,
    hasError,
    hasResult,
  };
}

export default useViralAnalyzer;
