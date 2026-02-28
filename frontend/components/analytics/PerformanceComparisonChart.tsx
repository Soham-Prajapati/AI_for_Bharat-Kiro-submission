'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { motion } from 'framer-motion';

export interface ComparisonData {
  platform: string;
  engagement: number;
  reach: number;
  conversions: number;
  roi: number;
}

export interface PerformanceComparisonChartProps {
  data: ComparisonData[];
  type?: 'bar' | 'radar';
  title: string;
  height?: number;
}

export const PerformanceComparisonChart: React.FC<PerformanceComparisonChartProps> = ({
  data,
  type = 'bar',
  title,
  height = 300,
}) => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-gray-700 bg-gray-900/95 p-3 shadow-xl backdrop-blur-sm">
          <p className="mb-2 text-sm font-semibold text-white">
            {payload[0].payload.platform}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-400">{entry.name}:</span>
              <span className="font-semibold text-white">
                {entry.value.toFixed(1)}
                {entry.name === 'ROI' ? 'x' : '%'}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-gray-800 bg-gradient-to-br from-gray-900/50 to-gray-800/30 p-6 backdrop-blur-sm"
    >
      <h3 className="mb-4 text-lg font-semibold text-white">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        {type === 'radar' ? (
          <RadarChart data={data}>
            <PolarGrid stroke="#374151" />
            <PolarAngleAxis
              dataKey="platform"
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
            />
            <PolarRadiusAxis stroke="#9CA3AF" style={{ fontSize: '10px' }} />
            <Radar
              name="Engagement"
              dataKey="engagement"
              stroke="#3B82F6"
              fill="#3B82F6"
              fillOpacity={0.3}
            />
            <Radar
              name="Reach"
              dataKey="reach"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.3}
            />
            <Radar
              name="Conversions"
              dataKey="conversions"
              stroke="#F59E0B"
              fill="#F59E0B"
              fillOpacity={0.3}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              iconType="circle"
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="platform"
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
            />
            <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              iconType="circle"
            />
            <Bar dataKey="engagement" fill="#3B82F6" name="Engagement" />
            <Bar dataKey="reach" fill="#10B981" name="Reach" />
            <Bar dataKey="conversions" fill="#F59E0B" name="Conversions" />
            <Bar dataKey="roi" fill="#8B5CF6" name="ROI" />
          </BarChart>
        )}
      </ResponsiveContainer>
    </motion.div>
  );
};
