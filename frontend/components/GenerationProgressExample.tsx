'use client';

import { useState } from 'react';
import { useContentGeneration, useRealtimeGeneration } from '@/hooks';
import GenerationProgress from './GenerationProgress';

export default function GenerationProgressExample() {
  const [jobId, setJobId] = useState<string | null>(null);
  const { generateContent } = useContentGeneration();
  const { isConnected } = useRealtimeGeneration(jobId || undefined);

  const handleGenerate = async () => {
    // Start generation
    const result = await generateContent({
      fileId: 'test-file-123',
      platforms: ['youtube', 'instagram', 'twitter'],
      language: 'en',
      creatorMode: 'ai-first',
    });

    if (result.success && result.contentItem) {
      setJobId(result.contentItem.id);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Real-Time Generation Demo</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">WebSocket Status</h2>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
            
            <button
              onClick={handleGenerate}
              disabled={!!jobId}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {jobId ? 'Generating...' : 'Start Generation'}
            </button>
          </div>

          {jobId && (
            <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Job ID: <span className="font-mono font-semibold">{jobId}</span>
              </p>
            </div>
          )}
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">How It Works</h3>
          <ol className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
              <span>Click "Start Generation" to begin content generation</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
              <span>WebSocket connection subscribes to job updates</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
              <span>Real-time progress updates stream from backend</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
              <span>Progress modal shows live updates with step-by-step visualization</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">5</span>
              <span>On completion, results are displayed automatically</span>
            </li>
          </ol>
        </div>
      </div>

      {/* Generation Progress Modal */}
      <GenerationProgress />
    </div>
  );
}
