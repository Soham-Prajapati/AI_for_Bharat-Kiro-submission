'use client';

import { useEffect, useState } from 'react';
import { useContent } from '@/context/AppContext';

interface GenerationStep {
  step: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  message?: string;
  timestamp: number;
}

const GENERATION_STEPS: GenerationStep[] = [
  { step: 'upload', status: 'pending', message: 'Uploading file...', timestamp: 0 },
  { step: 'transcribe', status: 'pending', message: 'Transcribing content...', timestamp: 0 },
  { step: 'analyze', status: 'pending', message: 'Analyzing content...', timestamp: 0 },
  { step: 'generate', status: 'pending', message: 'Generating platform content...', timestamp: 0 },
  { step: 'optimize', status: 'pending', message: 'Optimizing for engagement...', timestamp: 0 },
  { step: 'complete', status: 'pending', message: 'Finalizing...', timestamp: 0 },
];

export default function GenerationProgress() {
  const { generationStatus } = useContent();
  const [steps, setSteps] = useState<GenerationStep[]>(GENERATION_STEPS);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (!generationStatus?.isGenerating) {
      // Reset steps when not generating
      setSteps(GENERATION_STEPS);
      setCurrentStepIndex(0);
      return;
    }

    // Update steps based on progress
    const progress = generationStatus.progress;
    const newStepIndex = Math.floor((progress / 100) * GENERATION_STEPS.length);
    
    setCurrentStepIndex(newStepIndex);
    
    setSteps(prevSteps =>
      prevSteps.map((step, index) => {
        if (index < newStepIndex) {
          return { ...step, status: 'completed', timestamp: Date.now() };
        } else if (index === newStepIndex) {
          return { ...step, status: 'active', timestamp: Date.now() };
        }
        return { ...step, status: 'pending', timestamp: 0 };
      })
    );
  }, [generationStatus]);

  if (!generationStatus?.isGenerating && generationStatus?.progress !== 100) {
    return null;
  }

  const isComplete = generationStatus?.progress === 100;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4">
            {isComplete ? (
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {isComplete ? 'Generation Complete!' : 'Generating Content'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {generationStatus?.message || 'Processing your content...'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Progress
            </span>
            <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
              {generationStatus?.progress || 0}%
            </span>
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out"
              style={{ width: `${generationStatus?.progress || 0}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={step.step}
              className={`flex items-start gap-4 p-4 rounded-lg transition-all duration-300 ${
                step.status === 'active'
                  ? 'bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-500'
                  : step.status === 'completed'
                  ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500'
                  : step.status === 'error'
                  ? 'bg-red-50 dark:bg-red-900/20 border-2 border-red-500'
                  : 'bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent'
              }`}
            >
              {/* Step Icon */}
              <div className="flex-shrink-0 mt-1">
                {step.status === 'completed' ? (
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : step.status === 'active' ? (
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                  </div>
                ) : step.status === 'error' ? (
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full" />
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`text-sm font-semibold ${
                    step.status === 'active'
                      ? 'text-purple-700 dark:text-purple-300'
                      : step.status === 'completed'
                      ? 'text-green-700 dark:text-green-300'
                      : step.status === 'error'
                      ? 'text-red-700 dark:text-red-300'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {step.message}
                  </h3>
                  {step.status === 'active' && (
                    <span className="text-xs text-purple-600 dark:text-purple-400 font-medium animate-pulse">
                      In Progress
                    </span>
                  )}
                  {step.status === 'completed' && (
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                      Done
                    </span>
                  )}
                </div>
                
                {/* Progress indicator for active step */}
                {step.status === 'active' && (
                  <div className="mt-2">
                    <div className="h-1 bg-purple-200 dark:bg-purple-800 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full animate-progress" style={{ width: '60%' }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {isComplete && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Your content has been generated successfully!
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
            >
              View Results
            </button>
          </div>
        )}

        {/* Estimated Time */}
        {!isComplete && (
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Estimated time remaining: {Math.max(0, Math.ceil((100 - (generationStatus?.progress || 0)) / 10))} seconds
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes progress {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(400%);
          }
        }
        .animate-progress {
          animation: progress 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
