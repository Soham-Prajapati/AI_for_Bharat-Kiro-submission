import React from 'react';
import { ViralScoreGauge } from './ViralScoreGauge';

/**
 * Example usage of the ViralScoreGauge component
 */
export const ViralScoreGaugeExample: React.FC = () => {
  // Example 1: High viral potential
  const highScoreExample = {
    score: 85,
    factors: {
      hook: 0.92,
      pacing: 0.78,
      emotion: 0.88,
      trending: 0.82,
    },
    suggestions: [
      'Consider adding a stronger call-to-action at the end',
      'The pacing could be slightly faster in the middle section',
    ],
  };

  // Example 2: Medium viral potential
  const mediumScoreExample = {
    score: 58,
    factors: {
      hook: 0.65,
      pacing: 0.72,
      emotion: 0.45,
      trending: 0.51,
    },
    suggestions: [
      'Strengthen the opening hook to grab attention faster',
      'Add more emotional peaks throughout the content',
      'Incorporate trending topics or hashtags',
      'Consider restructuring for better pacing',
    ],
  };

  // Example 3: Low viral potential
  const lowScoreExample = {
    score: 28,
    factors: {
      hook: 0.35,
      pacing: 0.28,
      emotion: 0.22,
      trending: 0.25,
    },
    suggestions: [
      'Completely rework the opening - it needs a stronger hook',
      'Add emotional storytelling elements',
      'Research and incorporate trending topics',
      'Improve pacing with better cuts and transitions',
      'Consider adding music or sound effects',
    ],
  };

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <h1 className="text-4xl font-bold text-white text-center mb-12">
          Viral Score Gauge Examples
        </h1>

        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-300 mb-4">
              High Viral Potential
            </h2>
            <ViralScoreGauge {...highScoreExample} />
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-300 mb-4">
              Medium Viral Potential
            </h2>
            <ViralScoreGauge {...mediumScoreExample} />
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-300 mb-4">
              Low Viral Potential
            </h2>
            <ViralScoreGauge {...lowScoreExample} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViralScoreGaugeExample;
