'use client';

import { useState } from 'react';

export type InsightType = 'opportunity' | 'warning' | 'success';

export interface Insight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  details?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface InsightPanelProps {
  insights: Insight[];
  loading?: boolean;
  className?: string;
}

const insightConfig: Record<InsightType, {
  icon: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  iconBg: string;
}> = {
  opportunity: {
    icon: '💡',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-400',
    iconBg: 'bg-blue-500/20',
  },
  warning: {
    icon: '⚠️',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    textColor: 'text-yellow-400',
    iconBg: 'bg-yellow-500/20',
  },
  success: {
    icon: '✓',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    textColor: 'text-green-400',
    iconBg: 'bg-green-500/20',
  },
};

function InsightCard({ insight, index }: { insight: Insight; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = insightConfig[insight.type];

  return (
    <div
      className={`${config.bgColor} ${config.borderColor} border rounded-xl p-4 hover:shadow-lg transition-shadow`}
      role="article"
      aria-label={`${insight.type} insight: ${insight.title}`}
    >
      <div className="flex items-start gap-4">
        <div className={`${config.iconBg} rounded-lg p-3 flex-shrink-0`}>
          <span className="text-2xl" role="img" aria-label={insight.type}>
            {config.icon}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-semibold ${config.textColor} mb-1`}>
            {insight.title}
          </h3>
          <p className="text-gray-300 text-sm mb-3">
            {insight.description}
          </p>

          {insight.details && (
            <>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-sm text-gray-400 hover:text-gray-300 transition-colors mb-2 flex items-center gap-1"
                aria-expanded={isExpanded}
                aria-controls={`insight-details-${insight.id}`}
              >
                <span>{isExpanded ? '▼' : '▶'}</span>
                {isExpanded ? 'Hide details' : 'Show details'}
              </button>

              
                {isExpanded && (
                  <div
                    id={`insight-details-${insight.id}`}
                    className="overflow-hidden"
                  >
                    <div className="bg-gray-900/50 rounded-lg p-3 mb-3">
                      <p className="text-gray-400 text-sm">{insight.details}</p>
                    </div>
                  </div>
                )}
              
            </>
          )}

          {insight.action && (
            <button
              onClick={insight.action.onClick}
              className={`${config.textColor} bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors`}
            >
              {insight.action.label}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function InsightPanel({
  insights,
  loading = false,
  className = '',
}: InsightPanelProps) {
  const [filter, setFilter] = useState<InsightType | 'all'>('all');

  const filteredInsights = filter === 'all'
    ? insights
    : insights.filter((i) => i.type === filter);

  const counts = {
    opportunity: insights.filter((i) => i.type === 'opportunity').length,
    warning: insights.filter((i) => i.type === 'warning').length,
    success: insights.filter((i) => i.type === 'success').length,
  };

  if (loading) {
    return (
      <div
        className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 ${className}`}
      >
        <h2 className="text-2xl font-bold text-white mb-6">AI Insights</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-gray-700/30 rounded-xl h-32"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 ${className}`}
      role="region"
      aria-label="AI Insights Panel"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">AI Insights</h2>
        <div className="flex gap-2">
          <FilterButton
            label="All"
            count={insights.length}
            active={filter === 'all'}
            onClick={() => setFilter('all')}
          />
          <FilterButton
            label="Opportunities"
            count={counts.opportunity}
            active={filter === 'opportunity'}
            onClick={() => setFilter('opportunity')}
            color="blue"
          />
          <FilterButton
            label="Warnings"
            count={counts.warning}
            active={filter === 'warning'}
            onClick={() => setFilter('warning')}
            color="yellow"
          />
          <FilterButton
            label="Success"
            count={counts.success}
            active={filter === 'success'}
            onClick={() => setFilter('success')}
            color="green"
          />
        </div>
      </div>

      {filteredInsights.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-2">🔍</div>
          <p>No insights available</p>
        </div>
      ) : (
        <div className="space-y-4">
          
            {filteredInsights.map((insight, index) => (
              <InsightCard key={insight.id} insight={insight} index={index} />
            ))}
          
        </div>
      )}
    </div>
  );
}

function FilterButton({
  label,
  count,
  active,
  onClick,
  color,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  color?: 'blue' | 'yellow' | 'green';
}) {
  const colorClasses = color
    ? {
        blue: 'bg-blue-600 text-white',
        yellow: 'bg-yellow-600 text-white',
        green: 'bg-green-600 text-white',
      }[color]
    : 'bg-purple-600 text-white';

  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
        active ? colorClasses : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
    >
      {label} <span className="opacity-75">({count})</span>
    </div>
  );
}
