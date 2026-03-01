'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import apiClient from '@/services/api';
import { useToastNotifications } from '@/hooks/useToastNotifications';

// ============================================================================
// TYPES
// ============================================================================

type RecordingState = 'idle' | 'recording' | 'processing' | 'error';

interface AudioSample {
  id: string;
  blob: Blob;
  url: string;
  duration: number;
  timestamp: number;
}

interface TrainingProgress {
  samplesCollected: number;
  isTraining: boolean;
  modelId?: string;
  estimatedTime?: string;
}

interface VoiceTrainerProps {
  userId: string;
  minSamples?: number;
  maxSamples?: number;
  sampleDuration?: number;
  onTrainingComplete?: (modelId: string) => void;
  onError?: (error: Error) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function VoiceTrainer({
  userId,
  minSamples = 3,
  maxSamples = 10,
  sampleDuration = 10,
  onTrainingComplete,
  onError,
}: VoiceTrainerProps) {
  // State Management
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [samples, setSamples] = useState<AudioSample[]>([]);
  const [trainingProgress, setTrainingProgress] = useState<TrainingProgress>({
    samplesCollected: 0,
    isTraining: false,
  });
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);

  // Refs for WebAudio API
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingStartTimeRef = useRef<number>(0);

  // Toast notifications
  const toast = useToastNotifications();

  // ============================================================================
  // MICROPHONE PERMISSION
  // ============================================================================

  const requestMicrophonePermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      audioStreamRef.current = stream;
      setPermissionGranted(true);
      toast.success('Microphone access granted');
      return stream;
    } catch (error: any) {
      setPermissionGranted(false);
      setRecordingState('error');
      
      let errorMessage = 'Microphone access denied';
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Microphone permission denied. Please allow microphone access in your browser settings.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No microphone found. Please connect a microphone and try again.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Microphone is already in use by another application.';
      }
      
      toast.error(errorMessage);
      onError?.(new Error(errorMessage));
      throw error;
    }
  }, [toast, onError]);

  // ============================================================================
  // RECORDING CONTROLS
  // ============================================================================

  const startRecording = useCallback(async () => {
    try {
      // Request permission if not already granted
      let stream = audioStreamRef.current;
      if (!stream || !stream.active) {
        stream = await requestMicrophonePermission();
      }

      if (!stream) {
        throw new Error('Failed to get audio stream');
      }

      // Check if we've reached max samples
      if (samples.length >= maxSamples) {
        toast.warning(`Maximum ${maxSamples} samples reached`);
        return;
      }

      // Reset audio chunks
      audioChunksRef.current = [];

      // Create MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : 'audio/mp4';
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000,
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        handleRecordingStop();
      };

      mediaRecorder.onerror = (event: any) => {
        const errorMessage = `Recording failed: ${event.error?.message || 'Unknown error'}`;
        toast.error(errorMessage);
        setRecordingState('error');
        onError?.(new Error(errorMessage));
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100); // Collect data every 100ms

      setRecordingState('recording');
      recordingStartTimeRef.current = Date.now();
      setRecordingTime(0);

      // Start timer
      recordingTimerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - recordingStartTimeRef.current) / 1000);
        setRecordingTime(elapsed);

        // Auto-stop after sampleDuration
        if (elapsed >= sampleDuration) {
          stopRecording();
        }
      }, 100);

      toast.info(`Recording started (${sampleDuration}s max)`);
    } catch (error: any) {
      const errorMessage = `Failed to start recording: ${error.message}`;
      toast.error(errorMessage);
      setRecordingState('error');
      onError?.(error);
    }
  }, [samples.length, maxSamples, sampleDuration, requestMicrophonePermission, toast, onError]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      
      // Clear timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  }, []);

  const handleRecordingStop = useCallback(() => {
    const audioBlob = new Blob(audioChunksRef.current, { 
      type: mediaRecorderRef.current?.mimeType || 'audio/webm' 
    });
    
    const duration = Math.floor((Date.now() - recordingStartTimeRef.current) / 1000);
    
    // Validate minimum duration (at least 2 seconds)
    if (duration < 2) {
      toast.warning('Recording too short. Please record at least 2 seconds.');
      setRecordingState('idle');
      return;
    }

    const audioUrl = URL.createObjectURL(audioBlob);
    const newSample: AudioSample = {
      id: `sample-${Date.now()}`,
      blob: audioBlob,
      url: audioUrl,
      duration,
      timestamp: Date.now(),
    };

    setSamples((prev) => [...prev, newSample]);
    setTrainingProgress((prev) => ({
      ...prev,
      samplesCollected: prev.samplesCollected + 1,
    }));

    setRecordingState('idle');
    setRecordingTime(0);
    toast.success(`Sample ${samples.length + 1} recorded (${duration}s)`);
  }, [samples.length, toast]);

  // ============================================================================
  // SAMPLE MANAGEMENT
  // ============================================================================

  const deleteSample = useCallback((sampleId: string) => {
    setSamples((prev) => {
      const sample = prev.find((s) => s.id === sampleId);
      if (sample) {
        URL.revokeObjectURL(sample.url);
      }
      return prev.filter((s) => s.id !== sampleId);
    });
    
    setTrainingProgress((prev) => ({
      ...prev,
      samplesCollected: Math.max(0, prev.samplesCollected - 1),
    }));
    
    toast.info('Sample deleted');
  }, [toast]);

  const clearAllSamples = useCallback(() => {
    samples.forEach((sample) => {
      URL.revokeObjectURL(sample.url);
    });
    setSamples([]);
    setTrainingProgress({
      samplesCollected: 0,
      isTraining: false,
    });
    toast.info('All samples cleared');
  }, [samples, toast]);

  // ============================================================================
  // TRAINING
  // ============================================================================

  const startTraining = useCallback(async () => {
    if (samples.length < minSamples) {
      toast.warning(`Please record at least ${minSamples} samples`);
      return;
    }

    try {
      setRecordingState('processing');
      setTrainingProgress((prev) => ({ ...prev, isTraining: true }));
      toast.info('Starting voice training...');

      // Convert blobs to files
      const files = samples.map((sample, index) => {
        const extension = sample.blob.type.includes('webm') ? 'webm' : 'mp4';
        return new File([sample.blob], `sample-${index + 1}.${extension}`, {
          type: sample.blob.type,
        });
      });

      // Call API
      const response = await apiClient.voice.train(userId, files);

      if (response.success) {
        setTrainingProgress({
          samplesCollected: samples.length,
          isTraining: false,
          modelId: response.jobId,
          estimatedTime: response.estimatedTime ? `${response.estimatedTime}s` : undefined,
        });
        
        setRecordingState('idle');
        toast.success(`Training started! Job ID: ${response.jobId}`);
        toast.info(`Estimated completion: ${response.estimatedTime}s`);
        
        onTrainingComplete?.(response.jobId);
      } else {
        throw new Error(response.message || 'Training failed');
      }
    } catch (error: any) {
      const errorMessage = `Training failed: ${error.message}`;
      toast.error(errorMessage);
      setRecordingState('error');
      setTrainingProgress((prev) => ({ ...prev, isTraining: false }));
      onError?.(error);
    }
  }, [samples, minSamples, userId, toast, onTrainingComplete, onError]);

  // ============================================================================
  // CLEANUP
  // ============================================================================

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      
      samples.forEach((sample) => {
        URL.revokeObjectURL(sample.url);
      });
    };
  }, [samples]);

  // ============================================================================
  // RENDER
  // ============================================================================

  const canStartTraining = samples.length >= minSamples && !trainingProgress.isTraining;
  const isRecording = recordingState === 'recording';
  const isProcessing = recordingState === 'processing';

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Voice Trainer</h2>
        <p className="text-gray-600">
          Record {minSamples}-{maxSamples} voice samples to train your AI voice model
        </p>
      </div>

      {/* Permission Status */}
      {permissionGranted === false && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-medium">Microphone Access Required</p>
          <p className="text-red-600 text-sm mt-1">
            Please grant microphone permission to record voice samples.
          </p>
          <button
            onClick={requestMicrophonePermission}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Request Permission
          </button>
        </div>
      )}

      {/* Recording Controls */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing || samples.length >= maxSamples}
              className={`px-6 py-3 rounded-lg font-medium transition ${
                isRecording
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed'
              }`}
            >
              {isRecording ? '⏹ Stop Recording' : '🎤 Start Recording'}
            </button>
            
            {isRecording && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                <span className="text-gray-700 font-mono">
                  {recordingTime}s / {sampleDuration}s
                </span>
              </div>
            )}
          </div>

          {samples.length > 0 && (
            <button
              onClick={clearAllSamples}
              disabled={isRecording || isProcessing}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-2">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Samples: {samples.length} / {maxSamples}</span>
            <span>{Math.round((samples.length / maxSamples) * 100)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${(samples.length / maxSamples) * 100}%` }}
            />
          </div>
        </div>

        {samples.length < minSamples && (
          <p className="text-sm text-gray-500">
            Record at least {minSamples - samples.length} more sample(s) to start training
          </p>
        )}
      </div>

      {/* Samples List */}
      {samples.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Recorded Samples</h3>
          <div className="space-y-2">
            {samples.map((sample, index) => (
              <div
                key={sample.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-gray-700 font-medium">Sample {index + 1}</span>
                  <audio
                    src={sample.url}
                    controls
                    className="h-8"
                    preload="metadata"
                  />
                  <span className="text-sm text-gray-500">{sample.duration}s</span>
                </div>
                <button
                  onClick={() => deleteSample(sample.id)}
                  disabled={isRecording || isProcessing}
                  className="px-3 py-1 text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Training Button */}
      <div className="border-t pt-6">
        <button
          onClick={startTraining}
          disabled={!canStartTraining || isProcessing}
          className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Training in progress...
            </span>
          ) : (
            `Start Training (${samples.length} samples)`
          )}
        </button>

        {trainingProgress.modelId && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">Training Started!</p>
            <p className="text-green-700 text-sm mt-1">
              Model ID: <code className="bg-green-100 px-2 py-1 rounded">{trainingProgress.modelId}</code>
            </p>
            {trainingProgress.estimatedTime && (
              <p className="text-green-600 text-sm mt-1">
                Estimated completion: {trainingProgress.estimatedTime}
              </p>
            )}
          </div>
        )}
      </div>

      {/* State Indicator */}
      {recordingState === 'error' && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-medium">Error</p>
          <p className="text-red-600 text-sm mt-1">
            An error occurred. Please try again or check your microphone settings.
          </p>
        </div>
      )}
    </div>
  );
}
