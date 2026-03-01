'use client';

import React from 'react';

export interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  subtitle?: string;
  color?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon,
  trend = 'stable',
  subtitle,
  color = 'blue',
}) => {
  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-400';
    if (trend === 'down') return 'text-red-400';
    return 'text-gray-400';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return '↑';
    if (trend === 'down') return '↓';
    return '→';
  };

  const colorClasses = {
    blue: 'from-blue-500/10 to-blue-600/5 border-blue-500/20',
    purple: 'from-purple-500/10 to-purple-600/5 border-purple-500/20',
    green: 'from-green-500/10 to-green-600/5 border-green-500/20',
    orange: 'from-orange-500/10 to-orange-600/5 border-orange-500/20',
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl border bg-gradient-to-br p-6 backdrop-blur-sm ${
        colorClasses[color as keyof typeof colorClasses] || colorClasses.blue
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <h3 className="mt-2 text-3xl font-bold text-white">{value}</h3>
          {subtitle && (
            <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="rounded-lg bg-white/5 p-3 text-2xl">{icon}</div>
        )}
      </div>
      
      {change !== undefined && (
        <div className="mt-4 flex items-center gap-2">
          <span className={`text-sm font-semibold ${getTrendColor()}`}>
            {getTrendIcon()} {Math.abs(change)}%
          </span>
          <span className="text-xs text-gray-500">vs last period</span>
        </div>
      )}
    </div>
  );
};
