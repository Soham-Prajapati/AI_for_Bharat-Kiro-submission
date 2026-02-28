'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

// ============================================================================
// TYPES
// ============================================================================

export interface ROIMetrics {
  videosProcessed: number
  hoursSaved: number
  moneySaved: number
  roiPercentage: number
}

export interface ProjectionData {
  month: string
  manual: number
  ai: number
  savings: number
}

export interface ROIData {
  metrics: ROIMetrics
  projections: ProjectionData[]
  costPerVideo: {
    manual: number
    ai: number
  }
  timePerVideo: {
    manual: number // in hours
    ai: number // in hours
  }
}

interface ROIDashboardProps {
  data?: ROIData
  animated?: boolean
  showProjections?: boolean
  showComparison?: boolean
}

// ============================================================================
// MOCK DATA FOR TESTING
// ============================================================================

const mockROIData: ROIData = {
  metrics: {
    videosProcessed: 100,
    hoursSaved: 450,
    moneySaved: 22500,
    roiPercentage: 850
  },
  projections: [
    { month: 'Month 1', manual: 5000, ai: 500, savings: 4500 },
    { month: 'Month 2', manual: 10000, ai: 1000, savings: 9000 },
    { month: 'Month 3', manual: 15000, ai: 1500, savings: 13500 },
    { month: 'Month 4', manual: 20000, ai: 2000, savings: 18000 },
    { month: 'Month 5', manual: 25000, ai: 2500, savings: 22500 },
    { month: 'Month 6', manual: 30000, ai: 3000, savings: 27000 }
  ],
  costPerVideo: {
    manual: 250,
    ai: 30
  },
  timePerVideo: {
    manual: 5,
    ai: 0.5
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}

// ============================================================================
// ANIMATED COUNTER COMPONENT
// ============================================================================

interface AnimatedCounterProps {
  value: number
  duration?: number
  formatter?: (value: number) => string
  suffix?: string
  prefix?: string
}

function AnimatedCounter({
  value,
  duration = 2000,
  formatter = formatNumber,
  suffix = '',
  prefix = ''
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const steps = 60
    const increment = value / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value, duration])

  return (
    <span>
      {prefix}
      {formatter(displayValue)}
      {suffix}
    </span>
  )
}

// ============================================================================
// STATS CARD COMPONENT
// ============================================================================

interface StatsCardProps {
  title: string
  value: number
  formatter?: (value: number) => string
  suffix?: string
  prefix?: string
  icon: string
  color: string
  delay: number
}

function StatsCard({
  title,
  value,
  formatter = formatNumber,
  suffix = '',
  prefix = '',
  icon,
  color,
  delay
}: StatsCardProps) {
  return (
    <motion.div
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="text-3xl">{icon}</div>
        <motion.div
          className="px-3 py-1 rounded-full text-xs font-semibold"
          style={{
            backgroundColor: `${color}20`,
            color: color
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: delay + 0.3, type: 'spring' }}
        >
          Live
        </motion.div>
      </div>
      
      <h3 className="text-gray-400 text-sm font-medium mb-2">{title}</h3>
      
      <motion.div
        className="text-3xl font-bold"
        style={{ color }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: delay + 0.2, type: 'spring' }}
      >
        <AnimatedCounter
          value={value}
          formatter={formatter}
          suffix={suffix}
          prefix={prefix}
        />
      </motion.div>
    </motion.div>
  )
}

// ============================================================================
// CUSTOM TOOLTIP FOR CHART
// ============================================================================

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800/95 backdrop-blur-sm border border-gray-700 rounded-lg p-4 shadow-xl">
        <p className="text-white font-semibold mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-400">{entry.name}:</span>
            <span className="text-white font-semibold">
              {formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ROIDashboard({
  data = mockROIData,
  animated = true,
  showProjections = true,
  showComparison = true
}: ROIDashboardProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold text-white mb-2">
          ROI Dashboard
        </h2>
        <p className="text-gray-400">
          Track your savings and return on investment with AI-powered video analysis
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Videos Processed"
          value={data.metrics.videosProcessed}
          icon="🎬"
          color="#3b82f6"
          delay={0.1}
        />
        
        <StatsCard
          title="Hours Saved"
          value={data.metrics.hoursSaved}
          suffix=" hrs"
          icon="⏱️"
          color="#8b5cf6"
          delay={0.2}
        />
        
        <StatsCard
          title="Money Saved"
          value={data.metrics.moneySaved}
          formatter={formatCurrency}
          icon="💰"
          color="#10b981"
          delay={0.3}
        />
        
        <StatsCard
          title="ROI"
          value={data.metrics.roiPercentage}
          suffix="%"
          icon="📈"
          color="#f59e0b"
          delay={0.4}
        />
      </div>

      {/* Projections Chart */}
      {showProjections && (
        <motion.div
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-2">
              6-Month Savings Projection
            </h3>
            <p className="text-gray-400 text-sm">
              Cumulative cost comparison: Manual vs AI approach
            </p>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data.projections}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="manualGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="aiGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                
                <XAxis
                  dataKey="month"
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                />
                
                <YAxis
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                
                <Tooltip content={<CustomTooltip />} />
                
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
                
                <Line
                  type="monotone"
                  dataKey="manual"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={{ fill: '#ef4444', r: 5 }}
                  activeDot={{ r: 7 }}
                  name="Manual Cost"
                />
                
                <Line
                  type="monotone"
                  dataKey="ai"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 5 }}
                  activeDot={{ r: 7 }}
                  name="AI Cost"
                />
                
                <Line
                  type="monotone"
                  dataKey="savings"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 5 }}
                  activeDot={{ r: 7 }}
                  name="Total Savings"
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Comparison Cards */}
      {showComparison && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Manual Approach */}
          <motion.div
            className="bg-gradient-to-br from-red-900/20 to-gray-800/50 backdrop-blur-sm rounded-xl border border-red-800/30 p-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="text-4xl">👤</div>
              <div>
                <h3 className="text-xl font-bold text-white">Manual Approach</h3>
                <p className="text-gray-400 text-sm">Traditional video analysis</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                <span className="text-gray-300">Cost per video</span>
                <span className="text-2xl font-bold text-red-400">
                  {formatCurrency(data.costPerVideo.manual)}
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                <span className="text-gray-300">Time per video</span>
                <span className="text-2xl font-bold text-red-400">
                  {data.timePerVideo.manual} hrs
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                <span className="text-gray-300">Total cost (100 videos)</span>
                <span className="text-2xl font-bold text-red-400">
                  {formatCurrency(data.costPerVideo.manual * data.metrics.videosProcessed)}
                </span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-red-900/20 border border-red-800/30 rounded-lg">
              <p className="text-sm text-gray-300">
                ⚠️ High cost, time-intensive, limited scalability
              </p>
            </div>
          </motion.div>

          {/* AI Approach */}
          <motion.div
            className="bg-gradient-to-br from-green-900/20 to-gray-800/50 backdrop-blur-sm rounded-xl border border-green-800/30 p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="text-4xl">🤖</div>
              <div>
                <h3 className="text-xl font-bold text-white">AI Approach</h3>
                <p className="text-gray-400 text-sm">Automated video analysis</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                <span className="text-gray-300">Cost per video</span>
                <span className="text-2xl font-bold text-green-400">
                  {formatCurrency(data.costPerVideo.ai)}
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                <span className="text-gray-300">Time per video</span>
                <span className="text-2xl font-bold text-green-400">
                  {data.timePerVideo.ai} hrs
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                <span className="text-gray-300">Total cost (100 videos)</span>
                <span className="text-2xl font-bold text-green-400">
                  {formatCurrency(data.costPerVideo.ai * data.metrics.videosProcessed)}
                </span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-900/20 border border-green-800/30 rounded-lg">
              <p className="text-sm text-gray-300">
                ✅ Low cost, fast processing, infinitely scalable
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Summary Banner */}
      <motion.div
        className="bg-gradient-to-r from-blue-900/30 via-purple-900/30 to-pink-900/30 backdrop-blur-sm rounded-xl border border-blue-700/30 p-8"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <div className="text-center">
          <motion.div
            className="text-5xl mb-4"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 1, type: 'spring', stiffness: 200 }}
          >
            🎉
          </motion.div>
          
          <h3 className="text-2xl font-bold text-white mb-2">
            You're saving{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
              <AnimatedCounter
                value={data.metrics.moneySaved}
                formatter={formatCurrency}
                duration={2500}
              />
            </span>
          </h3>
          
          <p className="text-gray-300 text-lg">
            That's a{' '}
            <span className="font-bold text-yellow-400">
              <AnimatedCounter value={data.metrics.roiPercentage} suffix="%" />
            </span>
            {' '}return on investment with{' '}
            <span className="font-bold text-blue-400">
              <AnimatedCounter value={data.metrics.hoursSaved} suffix=" hours" />
            </span>
            {' '}saved across{' '}
            <span className="font-bold text-purple-400">
              <AnimatedCounter value={data.metrics.videosProcessed} suffix=" videos" />
            </span>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
