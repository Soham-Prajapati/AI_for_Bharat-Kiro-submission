'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export interface MetricCardProps {
  name: string;
  value: number;
  change?: number;
  icon?: string;
  format?: 'number' | 'currency' | 'percentage';
  loading?: boolean;
  className?: string;
}

export default function MetricCard({
  name,
  value,
  change,
  icon,
  format = 'number',
  loading = false,
  className = '',
}: MetricCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  // Animated counter effect
  useEffect(() => {
    if (loading) return;

    const duration = 1000; // 1 second
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, loading]);

  const formatValue = (val: number): string => {
    switch (format) {
      case 'currency':
        return `$${val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
      case 'percentage':
        return `${val.toFixed(1)}%`;
      default:
        return val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }
  };

  const isPositive = change !== undefined && change >= 0;
  const changeColor = isPositive ? 'text-green-400' : 'text-red-400';
  const changeBgColor = isPositive ? 'bg-green-500/10' : 'bg-red-500/10';

  if (loading) {
    return (
      <motion.div
        className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-700 rounded w-3/4 mb-3"></div>
          <div className="h-3 bg-gray-700 rounded w-1/3"></div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 hover:border-gray-600 transition-colors ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      role="article"
      aria-label={`${name} metric card`}
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-400">{name}</h3>
        {icon && (
          <span className="text-2xl" role="img" aria-label={`${name} icon`}>
            {icon}
          </span>
        )}
      </div>

      <div className="mb-3">
        <motion.div
          className="text-3xl font-bold text-white"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {formatValue(displayValue)}
        </motion.div>
      </div>

      {change !== undefined && (
        <motion.div
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg ${changeBgColor} ${changeColor}`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <span className="text-lg" aria-label={isPositive ? 'trending up' : 'trending down'}>
            {isPositive ? '↑' : '↓'}
          </span>
          <span className="text-sm font-semibold">
            {Math.abs(change).toFixed(1)}%
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
