import React, { useState } from 'react';

// Types
interface Annotation {
  id: string;
  timestamp: number;
  type: 'hook' | 'emotional-peak' | 'cliffhanger' | 'call-to-action';
  title: string;
  description: string;
  impact: number;
}

interface Pattern {
  id: string;
  title: string;
  description: string;
  frequency: number;
  effectiveness: number;
  examples: string[];
}

interface ViralMetrics {
  totalViews: number;
  engagementRate: number;
  shareRate: number;
  retentionRate: number;
}

// Mock Data
const mockAnnotations: Annotation[] = [
  {
    id: '1',
    timestamp: 2,
    type: 'hook',
    title: 'Strong Opening Hook',
    description: 'Immediate visual impact with unexpected element',
    impact: 95
  },
  {
    id: '2',
    timestamp: 15,
    type: 'emotional-peak',
    title: 'Emotional Peak',
    description: 'Surprise reveal that triggers strong reaction',
    impact: 88
  },
  {
    id: '3',
    timestamp: 28,
    type: 'cliffhanger',
    title: 'Mid-Point Cliffhanger',
    description: 'Creates anticipation for what comes next',
    impact: 82
  },
  {
    id: '4',
    timestamp: 45,
    type: 'call-to-action',
    title: 'Clear CTA',
    description: 'Direct engagement prompt with low friction',
    impact: 90
  }
];

const mockPatterns: Pattern[] = [
  {
    id: '1',
    title: 'Pattern Interrupt',
    description: 'Breaks viewer expectations within first 3 seconds',
    frequency: 87,
    effectiveness: 92,
    examples: ['Unexpected sound', 'Visual surprise', 'Contrarian statement']
  },
  {
    id: '2',
    title: 'Emotional Storytelling',
    description: 'Uses personal narrative to create connection',
    frequency: 78,
    effectiveness: 85,
    examples: ['Personal struggle', 'Transformation story', 'Relatable moment']
  },
  {
    id: '3',
    title: 'Loop Technique',
    description: 'Creates rewatchability through layered content',
    frequency: 65,
    effectiveness: 88,
    examples: ['Hidden details', 'Background elements', 'Easter eggs']
  },
  {
    id: '4',
    title: 'Social Proof',
    description: 'Leverages community validation and trends',
    frequency: 92,
    effectiveness: 79,
    examples: ['Trending audio', 'Popular format', 'Challenge participation']
  }
];

const mockMetrics: ViralMetrics = {
  totalViews: 2847000,
  engagementRate: 8.4,
  shareRate: 3.2,
  retentionRate: 76
};

const ViralAnalyzer: React.FC = () => {
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);
  const [hoveredPattern, setHoveredPattern] = useState<string | null>(null);
  const videoDuration = 60; // seconds

  const getAnnotationColor = (type: Annotation['type']) => {
    const colors = {
      'hook': 'bg-purple-500',
      'emotional-peak': 'bg-pink-500',
      'cliffhanger': 'bg-orange-500',
      'call-to-action': 'bg-blue-500'
    };
    return colors[type];
  };

  const getAnnotationIcon = (type: Annotation['type']) => {
    const icons = {
      'hook': '🎣',
      'emotional-peak': '💥',
      'cliffhanger': '⏸️',
      'call-to-action': '👆'
    };
    return icons[type];
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Viral Content Analyzer
          </h1>
          <p className="text-gray-400">Decode the DNA of viral success</p>
        </p>

        {/* Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            label="Total Views"
            value={formatNumber(mockMetrics.totalViews)}
            icon="👁️"
            trend="+24%"
          />
          <MetricCard
            label="Engagement Rate"
            value={`${mockMetrics.engagementRate}%`}
            icon="❤️"
            trend="+12%"
          />
          <MetricCard
            label="Share Rate"
            value={`${mockMetrics.shareRate}%`}
            icon="🔄"
            trend="+8%"
          />
          <MetricCard
            label="Retention"
            value={`${mockMetrics.retentionRate}%`}
            icon="⏱️"
            trend="+15%"
          />
        </div>

        {/* Timeline Section */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span>📊</span>
            Content Timeline
          </h2>
          
          <div className="space-y-6">
            {/* Timeline Bar */}
            <div className="relative h-24 bg-gray-900/50 rounded-xl overflow-hidden">
              {/* Progress gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20" />
              
              {/* Time markers */}
              <div className="absolute inset-0 flex items-end pb-2 px-4">
                {[0, 15, 30, 45, 60].map((time) => (
                  <div
                    key={time}
                    className="flex-1 text-center text-xs text-gray-500"
                    style={{ marginLeft: time === 0 ? 0 : 'auto' }}
                  >
                    {time}s
                  </div>
                ))}
              </div>

              {/* Annotation markers */}
              {mockAnnotations.map((annotation) => (
                <div
                  key={annotation.id}
                  className="absolute top-0 bottom-0 cursor-pointer transform transition-all hover:scale-110"
                  style={{ left: `${(annotation.timestamp / videoDuration) * 100}%` }}
                  onClick={() => setSelectedAnnotation(annotation)}
                  onMouseEnter={() => setSelectedAnnotation(annotation)}
                >
                  <div className="relative h-full flex flex-col items-center justify-center">
                    <div className={`w-1 h-full ${getAnnotationColor(annotation.type)} opacity-60`} />
                    <div className={`absolute top-2 w-8 h-8 ${getAnnotationColor(annotation.type)} rounded-full flex items-center justify-center text-lg shadow-lg ring-2 ring-gray-900`}>
                      {getAnnotationIcon(annotation.type)}
                    </div>
                  </div>
                </div>
              ))}
            </h2>

            {/* Selected Annotation Details */}
            {selectedAnnotation && (
              <div className={`${getAnnotationColor(selectedAnnotation.type)} bg-opacity-10 border-l-4 ${getAnnotationColor(selectedAnnotation.type)} rounded-lg p-4 animate-fade-in`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getAnnotationIcon(selectedAnnotation.type)}</span>
                      <h3 className="text-lg font-semibold">{selectedAnnotation.title}</h3>
                      <span className="text-xs text-gray-400">@ {selectedAnnotation.timestamp}s</span>
                    </span>
                    <p className="text-gray-300 text-sm mb-3">{selectedAnnotation.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">Impact Score:</span>
                      <div className="flex-1 max-w-xs h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getAnnotationColor(selectedAnnotation.type)} transition-all duration-500`}
                          style={{ width: `${selectedAnnotation.impact}%` }}
                        />
                      </p>
                      <span className="text-sm font-bold">{selectedAnnotation.impact}%</span>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="flex flex-wrap gap-4 justify-center">
              {(['hook', 'emotional-peak', 'cliffhanger', 'call-to-action'] as const).map((type) => (
                <div key={type} className="flex items-center gap-2 text-sm">
                  <div className={`w-3 h-3 ${getAnnotationColor(type)} rounded-full`} />
                  <span className="text-gray-400 capitalize">{type.replace('-', ' ')}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Pattern Cards */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span>🧬</span>
            Success Patterns Detected
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockPatterns.map((pattern) => (
              <PatternCard
                key={pattern.id}
                pattern={pattern}
                isHovered={hoveredPattern === pattern.id}
                onHover={() => setHoveredPattern(pattern.id)}
                onLeave={() => setHoveredPattern(null)}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

// Metric Card Component
interface MetricCardProps {
  label: string;
  value: string;
  icon: string;
  trend: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, icon, trend }) => (
  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700/50 shadow-lg hover:shadow-xl transition-all hover:scale-105">
    <div className="flex items-center justify-between mb-2">
      <span className="text-2xl">{icon}</span>
      <span className="text-green-400 text-sm font-semibold">{trend}</span>
    </span>
    <div className="text-3xl font-bold mb-1">{value}</div>
    <div className="text-gray-400 text-sm">{label}</div>
  </div>
);

// Pattern Card Component
interface PatternCardProps {
  pattern: Pattern;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
}

const PatternCard: React.FC<PatternCardProps> = ({ pattern, isHovered, onHover, onLeave }) => (
  <div
    className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-lg transition-all cursor-pointer ${
      isHovered ? 'scale-105 shadow-2xl border-purple-500/50' : ''
    }`}
    onMouseEnter={onHover}
    onMouseLeave={onLeave}
  >
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-bold mb-2">{pattern.title}</h3>
        <p className="text-gray-400 text-sm">{pattern.description}</p>
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-gray-500 mb-1">Frequency</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                style={{ width: `${pattern.frequency}%` }}
              />
            </div>
            <span className="text-sm font-bold">{pattern.frequency}%</span>
          </span>
        </span>
        <div>
          <div className="text-xs text-gray-500 mb-1">Effectiveness</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                style={{ width: `${pattern.effectiveness}%` }}
              />
            </div>
            <span className="text-sm font-bold">{pattern.effectiveness}%</span>
          </span>
        </div>
      </div>

      {isHovered && (
        <div className="animate-fade-in">
          <div className="text-xs text-gray-500 mb-2">Examples:</div>
          <div className="flex flex-wrap gap-2">
            {pattern.examples.map((example, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs border border-purple-500/30"
              >
                {example}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

export default ViralAnalyzer;
