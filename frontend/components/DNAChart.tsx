'use client'

import { useState } from 'react'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts'

// TypeScript types for DNA data
export interface DNADimension {
  dimension: string
  value: number
  fullMark: number
  description: string
  color: string
  icon: string
}

export interface CreatorDNA {
  creatorId: string
  creatorName: string
  dimensions: DNADimension[]
}

interface DNAChartProps {
  dnaData?: CreatorDNA
  showLegend?: boolean
  animated?: boolean
}

// Mock data for testing
const mockDNAData: CreatorDNA = {
  creatorId: 'creator-001',
  creatorName: 'Sample Creator',
  dimensions: [
    {
      dimension: 'Energy',
      value: 85,
      fullMark: 100,
      description: 'Enthusiasm and dynamism in content delivery',
      color: '#ec4899',
      icon: '⚡'
    },
    {
      dimension: 'Formality',
      value: 45,
      fullMark: 100,
      description: 'Professional tone vs casual approach',
      color: '#8b5cf6',
      icon: '👔'
    },
    {
      dimension: 'Humor',
      value: 70,
      fullMark: 100,
      description: 'Use of comedy and lighthearted content',
      color: '#06b6d4',
      icon: '😄'
    },
    {
      dimension: 'Technical Depth',
      value: 90,
      fullMark: 100,
      description: 'Complexity and detail in explanations',
      color: '#3b82f6',
      icon: '🔬'
    },
    {
      dimension: 'Storytelling',
      value: 75,
      fullMark: 100,
      description: 'Narrative structure and emotional connection',
      color: '#a855f7',
      icon: '📖'
    }
  ]
}

export default function DNAChart({ 
  dnaData = mockDNAData, 
  showLegend = true,
  animated = true 
}: DNAChartProps) {
  const [hoveredDimension, setHoveredDimension] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  // Trigger animation on mount
  useState(() => {
    if (animated) {
      setTimeout(() => setIsVisible(true), 100)
    } else {
      setIsVisible(true)
    }
  })

  // Prepare data for recharts
  const chartData = dnaData.dimensions.map(dim => ({
    dimension: dim.dimension,
    value: isVisible ? dim.value : 0,
    fullMark: dim.fullMark
  }))

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dimension = dnaData.dimensions.find(
        d => d.dimension === payload[0].payload.dimension
      )
      
      if (dimension) {
        return (
          <div
            className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-4 shadow-xl"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{dimension.icon}</span>
              <span className="font-bold text-white">{dimension.dimension}</span>
            </span>
            <div className="text-3xl font-bold mb-2" style={{ color: dimension.color }}>
              {dimension.value}/100
            </span>
            <div className="text-sm text-gray-300 max-w-xs">
              {dimension.description}
            </div>
          </div>
        )
      }
    }
    return null
  }

  return (
    <div
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6"
    >
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Creator DNA Profile
        </h2>
        <p className="text-gray-400 text-sm">
          Personality dimensions for {dnaData.creatorName}
        </p>
      </div>

      {/* Radar Chart */}
      <div className="relative">
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={chartData}>
            <defs>
              <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity={0.8} />
                <stop offset="50%" stopColor="#ec4899" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.4} />
              </linearGradient>
            </defs>
            <PolarGrid 
              stroke="#374151" 
              strokeWidth={1}
            />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fill: '#d1d5db', fontSize: 14, fontWeight: 600 }}
              tickLine={false}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickCount={6}
            />
            <Radar
              name="DNA Profile"
              dataKey="value"
              stroke="#a855f7"
              fill="url(#radarGradient)"
              fillOpacity={0.6}
              strokeWidth={3}
              animationDuration={animated ? 1500 : 0}
              animationEasing="ease-out"
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend with dimension details */}
      {showLegend && (
        <div
          className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {dnaData.dimensions.map((dimension, index) => (
            <div
              key={dimension.dimension}
              className={`p-4 rounded-lg border transition-all cursor-pointer ${
                hoveredDimension === dimension.dimension
                  ? 'bg-gray-700/70 border-gray-500'
                  : 'bg-gray-800/30 border-gray-700'
              }`}
              onMouseEnter={() => setHoveredDimension(dimension.dimension)}
              onMouseLeave={() => setHoveredDimension(null)}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{dimension.icon}</span>
                <div className="flex-1">
                  <div className="font-semibold text-white text-sm">
                    {dimension.dimension}
                  </span>
                  <div 
                    className="text-2xl font-bold"
                    style={{ color: dimension.color }}
                  >
                    {dimension.value}
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-400 leading-relaxed">
                {dimension.description}
              </div>
              
              {/* Progress bar */}
              <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ 
                    background: `linear-gradient(90deg, ${dimension.color}dd, ${dimension.color})` 
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <div
        className="mt-6 pt-6 border-t border-gray-700 grid grid-cols-3 gap-4 text-center"
      >
        <div>
          <div className="text-2xl font-bold text-purple-400">
            {Math.round(
              dnaData.dimensions.reduce((sum, d) => sum + d.value, 0) / 
              dnaData.dimensions.length
            )}
          </div>
          <div className="text-xs text-gray-400 mt-1">Average Score</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-pink-400">
            {Math.max(...dnaData.dimensions.map(d => d.value))}
          </div>
          <div className="text-xs text-gray-400 mt-1">Highest Dimension</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-blue-400">
            {dnaData.dimensions.length}
          </div>
          <div className="text-xs text-gray-400 mt-1">Total Dimensions</div>
        </div>
      </div>
    </div>
  )
}
