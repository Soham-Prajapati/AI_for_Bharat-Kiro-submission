import React from 'react';
import ViralScoreGauge from './ViralScoreGauge';

/**
 * Example usage of the ViralScoreGauge component
 */
export const ViralScoreGaugeExample: React.FC = () => {
  // Example 1: High viral potential
  const highScoreExample = {
    score: 85,
    factors: [
      { name: 'hook', impact: 0.92, description: 'Hook is strong' },
      { name: 'pacing', impact: 0.78, description: 'Pacing is good' },
      { name: 'emotion', impact: 0.88, description: 'Emotion is high' },
      { name: 'trending', impact: 0.82, description: 'Trending potential' },
    ],
    recommendations: [
      'Consider adding a stronger call-to-action at the end',
      'The pacing could be slightly faster in the middle section',
    ],
  };

  // Example 2: Medium viral potential
  const mediumScoreExample = {
    score: 58,
    factors: [
      { name: 'hook', impact: 0.65, description: '' },
      { name: 'pacing', impact: 0.72, description: '' },
      { name: 'emotion', impact: 0.45, description: '' },
      { name: 'trending', impact: 0.51, description: '' },
    ],
    recommendations: [
      'Strengthen the opening hook to grab attention faster',
      'Add more emotional peaks throughout the content',
      'Incorporate trending topics or hashtags',
      'Consider restructuring for better pacing',
    ],
  };

  // Example 3: Low viral potential
  const lowScoreExample = {
    score: 28,
    factors: [
      { name: 'hook', impact: 0.35, description: '' },
      { name: 'pacing', impact: 0.28, description: '' },
      { name: 'emotion', impact: 0.22, description: '' },
      { name: 'trending', impact: 0.25, description: '' },
    ],
    recommendations: [
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
            <ViralScoreGauge data={highScoreExample} />
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-300 mb-4">
              Medium Viral Potential
            </h2>
            <ViralScoreGauge data={mediumScoreExample} />
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-300 mb-4">
              Low Viral Potential
            </h2>
            <ViralScoreGauge data={lowScoreExample} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViralScoreGaugeExample;
