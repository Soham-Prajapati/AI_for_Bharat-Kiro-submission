'use client';

/**
 * VoiceTrainer Example Usage
 * 
 * This file demonstrates various ways to use the VoiceTrainer component
 * Copy and adapt these examples for your use case
 */

import { useState } from 'react';
import VoiceTrainer from './VoiceTrainer';
import { useToastNotifications } from '@/hooks/useToastNotifications';

// ============================================================================
// EXAMPLE 1: Basic Usage
// ============================================================================

export function BasicVoiceTrainerExample() {
  return (
    <div className=Voice model trained successfully:', newModelId)

    // Auto-hide success message after 5 seconds
    setTimeout(() => setShowSuccess(false), 5000)
  }

  const handleError = (err: Error) => {
    setError(err.message)
    console.error('❌ Training error:', err)

    // Auto-hide error after 5 seconds
    setTimeout(() => setError(null), 5000)
  }

  const handleGenerateVoice = async () => {
    if (!modelId) return

    try {
      const response = await fetch('/api/voice/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelId,
          text: 'Hello! This is my cloned voice.',
          userId: 'demo-user',
        }),
      })

      const data = await response.json()
      console.log('Generated audio:', data)
    } catch (err) {
      console.error('Generation error:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Voice Cloning Studio
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Create your personalized AI voice model in minutes. Record samples,
            train the model, and generate speech in your own voice.
          </p>
        </div>

        {/* Notifications */}
        
          {showSuccess && (
            <div
              className="fixed top-4 right-4 z-50 max-w-md"
            >
              <div className="bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-start gap-3">
                <svg
                  className="w-6 h-6 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <h3 className="font-semibold mb-1">Training Complete!</h3>
                  <p className="text-sm opacity-90">
                    Your voice model is ready. Model ID: {modelId}
                  </p>
                </h3>
                <button
                  onClick={() => setShowSuccess(false)}
                  className="ml-auto hover:bg-white/20 rounded p-1"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {error && (
            <div
              className="fixed top-4 right-4 z-50 max-w-md"
            >
              <div className="bg-red-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-start gap-3">
                <svg
                  className="w-6 h-6 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <h3 className="font-semibold mb-1">Error</h3>
                  <p className="text-sm opacity-90">{error}</p>
                </p>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto hover:bg-white/20 rounded p-1"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Info */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-6 border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-4">
                  How It Works
                </h3>
                <ol className="space-y-4">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      1
                    </span>
                    <div>
                      <h4 className="font-medium text-white">Record Samples</h4>
                      <p className="text-sm text-gray-400">
                        Capture at least 5 voice samples (10 seconds each)
                      </p>
                    </li>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      2
                    </span>
                    <div>
                      <h4 className="font-medium text-white">Review & Edit</h4>
                      <p className="text-sm text-gray-400">
                        Play back samples and remove any you don't like
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      3
                    </span>
                    <div>
                      <h4 className="font-medium text-white">Train Model</h4>
                      <p className="text-sm text-gray-400">
                        AI analyzes your voice and creates a custom model
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      4
                    </span>
                    <div>
                      <h4 className="font-medium text-white">Generate Speech</h4>
                      <p className="text-sm text-gray-400">
                        Use your voice model to create AI-generated audio
                      </p>
                    </div>
                  </li>
                </ol>
              </div>

              <div className="bg-blue-500/10 backdrop-blur rounded-2xl p-6 border border-blue-500/30">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">
                  💡 Tips for Best Results
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• Record in a quiet environment</li>
                  <li>• Speak naturally and clearly</li>
                  <li>• Vary your tone and emotion</li>
                  <li>• Use a good quality microphone</li>
                  <li>• Record different types of sentences</li>
                </ul>
              </div>
            </div>

            {/* Right Column - Trainer */}
            <div className="lg:col-span-2">
              <VoiceTrainer
                userId="demo-user"
                onTrainingComplete={handleTrainingComplete}
                onError={handleError}
              />

              {/* Post-Training Actions */}
              {modelId && (
                <div
                  className="mt-6 bg-gray-800/50 backdrop-blur rounded-2xl p-6 border border-gray-700"
                >
                  <h3 className="text-xl font-semibold text-white mb-4">
                    What's Next?
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <button
                      onClick={handleGenerateVoice}
                      className="p-4 bg-purple-500 hover:bg-purple-600 rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                        />
                      </svg>
                      Generate Voice
                    </button>
                    <button
                      onClick={() => {
                        /* Navigate to dashboard */
                      }}
                      className="p-4 bg-gray-700 hover:bg-gray-600 rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                        />
                      </svg>
                      View Dashboard
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>
            Your voice data is encrypted and stored securely. You can delete your
            voice model at any time.
          </p>
        </div>
      </div>
    </div>
  )
}
