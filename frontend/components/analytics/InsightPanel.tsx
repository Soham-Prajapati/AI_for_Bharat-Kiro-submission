'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface Insight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'tip';
  title: string;
  description: string;
  action?: string;
  platform?: string;
}

export interface InsightPanelProps {
  insights: Insight[];
  title?: string;
}

export const InsightPanel: React.FC<InsightPanelProps> = ({
  insights,
  title = 'AI-Generated Insights',
}) => {
  const getInsightStyles = (type: Insight['type']) => {
    const styles = {
      success: {
        bg: 'from-green-500/10 to-green-600/5',
        border: 'border-green-500/30',
        icon: '✓',
        iconBg: 'bg-green-500/20',
        iconText: 'text-green-400',
      },
      warning: {
        bg: 'from-yellow-500/10 to-yellow-600/5',
        border: 'border-yellow-500/30',
        icon: '⚠',
        iconBg: 'bg-yellow-500/20',
        iconText: 'text-yellow-400',
      },
      info: {
        bg: 'from-blue-500/10 to-blue-600/5',
        border: 'border-blue-500/30',
        icon: 'ℹ',
        iconBg: 'bg-blue-500/20',
        iconText: 'text-blue-400',
      },
      tip: {
        bg: 'from-purple-500/10 to-purple-600/5',
        border: 'border-purple-500/30',
        icon: '💡',
        iconBg: 'bg-purple-500/20',
        iconText: 'text-purple-400',
      },
    };
    return styles[type];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-gray-800 bg-gradient-to-br from-gray-900/50 to-gray-800/30 p-6 backdrop-blur-sm"
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xl">🤖</span>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>

      <div className="space-y-3">
        {insights.map((insight, index) => {
          const styles = getInsightStyles(insight.type);
          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`rounded-lg border bg-gradient-to-r p-4 ${styles.border} ${styles.bg}`}
            >
              <div className="flex gap-3">
                <div
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${styles.iconBg}`}
                >
                  <span className={`text-lg ${styles.iconText}`}>
                    {styles.icon}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold text-white">{insight.title}</h4>
                    {insight.platform && (
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-gray-300">
                        {insight.platform}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-400">
                    {insight.description}
                  </p>
                  {insight.action && (
                    <button className="mt-2 text-xs font-medium text-blue-400 hover:text-blue-300">
                      {insight.action} →
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
