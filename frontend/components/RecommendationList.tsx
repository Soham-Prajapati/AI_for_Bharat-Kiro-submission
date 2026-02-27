'use client';

import { motion } from 'framer-motion';
import { Recommendation, PLATFORM_COLORS, PLATFORM_NAMES } from '@/types/analytics';
import { AlertCircle, TrendingUp, Lightbulb } from 'lucide-react';

interface RecommendationListProps {
  recommendations: Recommendation[];
}

const priorityConfig = {
  high: {
    icon: AlertCircle,
    color: 'text-red-400',
    bgColor: 'bg-red-400/10',
    borderColor: 'border-red-400/30',
  },
  medium: {
    icon: TrendingUp,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
    borderColor: 'border-yellow-400/30',
  },
  low: {
    icon: Lightbulb,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    borderColor: 'border-blue-400/30',
  },
};

export default function RecommendationList({ recommendations }: RecommendationListProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.7 }}
      className="bg-gray-800 rounded-xl p-6 border border-gray-700"
    >
      <h2 className="text-2xl font-bold text-white mb-6">AI Recommendations</h2>
      
      <div className="space-y-4">
        {recommendations.map((rec, index) => {
          const config = priorityConfig[rec.priority];
          const Icon = config.icon;
          const platformColor = rec.platform ? PLATFORM_COLORS[rec.platform] : undefined;
          
          return (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
              className={`p-4 rounded-lg border ${config.borderColor} ${config.bgColor} hover:bg-opacity-20 transition-all duration-300`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-1 ${config.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold uppercase ${config.color}`}>
                      {rec.priority} Priority
                    </span>
                    {rec.platform && (
                      <span 
                        className="text-xs font-medium px-2 py-0.5 rounded"
                        style={{ 
                          backgroundColor: `${platformColor}20`,
                          color: platformColor,
                        }}
                      >
                        {PLATFORM_NAMES[rec.platform]}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-200 text-sm leading-relaxed">{rec.message}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
