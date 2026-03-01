'use client'

import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart
} from 'recharts'

// ============================================================================
// TYPES
// ============================================================================

export type TrendStatus = 'rising' | 'peak' | 'declining'
export type Platform = 'TikTok' | 'Instagram' | 'YouTube' | 'Twitter' | 'Facebook'

export interface TrendData {
  id: string
  topic: string
  growthRate: number // percentage
  engagementVelocity: number // engagement per hour
  platforms: Platform[]
  status: TrendStatus
  confidence: number // 0-100
  peakPrediction: {
    date: string
    confidence: number
  }
  timeline: {
    date: string
    engagement: number
    mentions: number
  }[]
  platformIntensity: {
    platform: Platform
    intensity: number // 0-100
  }[]
}

export interface TrendDashboardData {
  trends: TrendData[]
  lastUpdated: string
}

interface TrendDashboardProps {
  data?: TrendDashboardData
  animated?: boolean
  showTimeline?: boolean
  showHeatmap?: boolean
  showPredictions?: boolean
}

// ============================================================================
// MOCK DATA FOR TESTING
// ============================================================================

const platforms: Platform[] = ['TikTok', 'Instagram', 'YouTube', 'Twitter', 'Facebook']

const mockTrendData: TrendDashboardData = {
  lastUpdated: new Date().toISOString(),
  trends: [
    {
      id: '1',
      topic: 'AI Content Creation',
      growthRate: 245,
      engagementVelocity: 15000,
      platforms: ['TikTok', 'Instagram', 'YouTube'],
      status: 'rising',
      confidence: 92,
      peakPrediction: { date: '2024-02-15', confidence: 88 },
      timeline: [
        { date: 'Day 1', engagement: 5000, mentions: 120 },
        { date: 'Day 2', engagement: 8000, mentions: 200 },
        { date: 'Day 3', engagement: 15000, mentions: 350 },
        { date: 'Day 4', engagement: 25000, mentions: 580 },
        { date: 'Day 5', engagement: 40000, mentions: 920 }
      ],
      platformIntensity: [
        { platform: 'TikTok', intensity: 95 },
        { platform: 'Instagram', intensity: 78 },
        { platform: 'YouTube', intensity: 65 },
        { platform: 'Twitter', intensity: 45 },
        { platform: 'Facebook', intensity: 30 }
      ]
    },
    {
      id: '2',
      topic: 'Sustainable Fashion',
      growthRate: 189,
      engagementVelocity: 12000,
      platforms: ['Instagram', 'TikTok', 'YouTube'],
      status: 'rising',
      confidence: 85,
      peakPrediction: { date: '2024-02-20', confidence: 82 },
      timeline: [
        { date: 'Day 1', engagement: 3000, mentions: 80 },
        { date: 'Day 2', engagement: 6000, mentions: 150 },
        { date: 'Day 3', engagement: 10000, mentions: 280 },
        { date: 'Day 4', engagement: 18000, mentions: 450 },
        { date: 'Day 5', engagement: 28000, mentions: 720 }
      ],
      platformIntensity: [
        { platform: 'Instagram', intensity: 92 },
        { platform: 'TikTok', intensity: 85 },
        { platform: 'YouTube', intensity: 58 },
        { platform: 'Twitter', intensity: 42 },
        { platform: 'Facebook', intensity: 35 }
      ]
    },
    {
      id: '3',
      topic: 'Productivity Hacks',
      growthRate: 156,
      engagementVelocity: 9500,
      platforms: ['YouTube', 'TikTok', 'Twitter'],
      status: 'peak',
      confidence: 78,
      peakPrediction: { date: '2024-02-10', confidence: 75 },
      timeline: [
        { date: 'Day 1', engagement: 8000, mentions: 200 },
        { date: 'Day 2', engagement: 12000, mentions: 320 },
        { date: 'Day 3', engagement: 15000, mentions: 420 },
        { date: 'Day 4', engagement: 16000, mentions: 450 },
        { date: 'Day 5', engagement: 16500, mentions: 460 }
      ],
      platformIntensity: [
        { platform: 'YouTube', intensity: 88 },
        { platform: 'TikTok', intensity: 72 },
        { platform: 'Twitter', intensity: 65 },
        { platform: 'Instagram', intensity: 48 },
        { platform: 'Facebook', intensity: 28 }
      ]
    },
    {
      id: '4',
      topic: 'Plant-Based Recipes',
      growthRate: 134,
      engagementVelocity: 8200,
      platforms: ['Instagram', 'TikTok', 'Facebook'],
      status: 'rising',
      confidence: 81,
      peakPrediction: { date: '2024-02-18', confidence: 79 },
      timeline: [
        { date: 'Day 1', engagement: 4000, mentions: 100 },
        { date: 'Day 2', engagement: 6500, mentions: 180 },
        { date: 'Day 3', engagement: 9000, mentions: 260 },
        { date: 'Day 4', engagement: 13000, mentions: 380 },
        { date: 'Day 5', engagement: 18000, mentions: 520 }
      ],
      platformIntensity: [
        { platform: 'Instagram', intensity: 90 },
        { platform: 'TikTok', intensity: 75 },
        { platform: 'Facebook', intensity: 62 },
        { platform: 'YouTube', intensity: 45 },
        { platform: 'Twitter', intensity: 32 }
      ]
    },
    {
      id: '5',
      topic: 'Remote Work Tips',
      growthRate: 98,
      engagementVelocity: 6800,
      platforms: ['Twitter', 'YouTube', 'Instagram'],
      status: 'declining',
      confidence: 72,
      peakPrediction: { date: '2024-02-05', confidence: 68 },
      timeline: [
        { date: 'Day 1', engagement: 12000, mentions: 350 },
        { date: 'Day 2', engagement: 10000, mentions: 300 },
        { date: 'Day 3', engagement: 8500, mentions: 250 },
        { date: 'Day 4', engagement: 7000, mentions: 200 },
        { date: 'Day 5', engagement: 6000, mentions: 180 }
      ],
      platformIntensity: [
        { platform: 'Twitter', intensity: 70 },
        { platform: 'YouTube', intensity: 58 },
        { platform: 'Instagram', intensity: 45 },
        { platform: 'TikTok', intensity: 35 },
        { platform: 'Facebook', intensity: 40 }
      ]
    },
    {
      id: '6',
      topic: 'Crypto Trading',
      growthRate: 215,
      engagementVelocity: 13500,
      platforms: ['Twitter', 'YouTube', 'TikTok'],
      status: 'rising',
      confidence: 76,
      peakPrediction: { date: '2024-02-22', confidence: 73 },
      timeline: [
        { date: 'Day 1', engagement: 6000, mentions: 150 },
        { date: 'Day 2', engagement: 10000, mentions: 280 },
        { date: 'Day 3', engagement: 16000, mentions: 450 },
        { date: 'Day 4', engagement: 24000, mentions: 680 },
        { date: 'Day 5', engagement: 35000, mentions: 920 }
      ],
      platformIntensity: [
        { platform: 'Twitter', intensity: 93 },
        { platform: 'YouTube', intensity: 80 },
        { platform: 'TikTok', intensity: 68 },
        { platform: 'Instagram', intensity: 42 },
        { platform: 'Facebook', intensity: 28 }
      ]
    },
    {
      id: '7',
      topic: 'Mental Health Awareness',
      growthRate: 167,
      engagementVelocity: 11000,
      platforms: ['Instagram', 'TikTok', 'YouTube', 'Twitter'],
      status: 'rising',
      confidence: 89,
      peakPrediction: { date: '2024-02-25', confidence: 86 },
      timeline: [
        { date: 'Day 1', engagement: 5000, mentions: 130 },
        { date: 'Day 2', engagement: 8500, mentions: 220 },
        { date: 'Day 3', engagement: 13000, mentions: 350 },
        { date: 'Day 4', engagement: 19000, mentions: 520 },
        { date: 'Day 5', engagement: 27000, mentions: 750 }
      ],
      platformIntensity: [
        { platform: 'Instagram', intensity: 88 },
        { platform: 'TikTok', intensity: 82 },
        { platform: 'YouTube', intensity: 70 },
        { platform: 'Twitter', intensity: 65 },
        { platform: 'Facebook', intensity: 48 }
      ]
    },
    {
      id: '8',
      topic: 'Gaming Highlights',
      growthRate: 198,
      engagementVelocity: 14200,
      platforms: ['TikTok', 'YouTube', 'Twitter'],
      status: 'peak',
      confidence: 84,
      peakPrediction: { date: '2024-02-12', confidence: 81 },
      timeline: [
        { date: 'Day 1', engagement: 10000, mentions: 280 },
        { date: 'Day 2', engagement: 15000, mentions: 420 },
        { date: 'Day 3', engagement: 20000, mentions: 580 },
        { date: 'Day 4', engagement: 22000, mentions: 620 },
        { date: 'Day 5', engagement: 23000, mentions: 640 }
      ],
      platformIntensity: [
        { platform: 'TikTok', intensity: 91 },
        { platform: 'YouTube', intensity: 87 },
        { platform: 'Twitter', intensity: 73 },
        { platform: 'Instagram', intensity: 52 },
        { platform: 'Facebook', intensity: 35 }
      ]
    },
    {
      id: '9',
      topic: 'Home Workout Routines',
      growthRate: 142,
      engagementVelocity: 9800,
      platforms: ['Instagram', 'TikTok', 'YouTube'],
      status: 'rising',
      confidence: 80,
      peakPrediction: { date: '2024-02-17', confidence: 77 },
      timeline: [
        { date: 'Day 1', engagement: 4500, mentions: 110 },
        { date: 'Day 2', engagement: 7000, mentions: 190 },
        { date: 'Day 3', engagement: 10500, mentions: 290 },
        { date: 'Day 4', engagement: 15000, mentions: 420 },
        { date: 'Day 5', engagement: 21000, mentions: 580 }
      ],
      platformIntensity: [
        { platform: 'Instagram', intensity: 86 },
        { platform: 'TikTok', intensity: 79 },
        { platform: 'YouTube', intensity: 72 },
        { platform: 'Twitter', intensity: 38 },
        { platform: 'Facebook', intensity: 44 }
      ]
    },
    {
      id: '10',
      topic: 'Travel Vlogs',
      growthRate: 123,
      engagementVelocity: 8500,
      platforms: ['YouTube', 'Instagram', 'TikTok'],
      status: 'peak',
      confidence: 75,
      peakPrediction: { date: '2024-02-14', confidence: 72 },
      timeline: [
        { date: 'Day 1', engagement: 7000, mentions: 180 },
        { date: 'Day 2', engagement: 10000, mentions: 270 },
        { date: 'Day 3', engagement: 12500, mentions: 340 },
        { date: 'Day 4', engagement: 13500, mentions: 370 },
        { date: 'Day 5', engagement: 14000, mentions: 380 }
      ],
      platformIntensity: [
        { platform: 'YouTube', intensity: 89 },
        { platform: 'Instagram', intensity: 84 },
        { platform: 'TikTok', intensity: 68 },
        { platform: 'Twitter', intensity: 42 },
        { platform: 'Facebook', intensity: 38 }
      ]
    },
    {
      id: '11',
      topic: 'DIY Home Decor',
      growthRate: 178,
      engagementVelocity: 10500,
      platforms: ['Instagram', 'TikTok', 'YouTube', 'Facebook'],
      status: 'rising',
      confidence: 83,
      peakPrediction: { date: '2024-02-19', confidence: 80 },
      timeline: [
        { date: 'Day 1', engagement: 5500, mentions: 140 },
        { date: 'Day 2', engagement: 9000, mentions: 240 },
        { date: 'Day 3', engagement: 14000, mentions: 380 },
        { date: 'Day 4', engagement: 20000, mentions: 550 },
        { date: 'Day 5', engagement: 28000, mentions: 780 }
      ],
      platformIntensity: [
        { platform: 'Instagram', intensity: 92 },
        { platform: 'TikTok', intensity: 81 },
        { platform: 'YouTube', intensity: 66 },
        { platform: 'Facebook', intensity: 58 },
        { platform: 'Twitter', intensity: 32 }
      ]
    },
    {
      id: '12',
      topic: 'Tech Reviews',
      growthRate: 112,
      engagementVelocity: 7800,
      platforms: ['YouTube', 'Twitter', 'TikTok'],
      status: 'peak',
      confidence: 77,
      peakPrediction: { date: '2024-02-11', confidence: 74 },
      timeline: [
        { date: 'Day 1', engagement: 9000, mentions: 220 },
        { date: 'Day 2', engagement: 12000, mentions: 310 },
        { date: 'Day 3', engagement: 14000, mentions: 370 },
        { date: 'Day 4', engagement: 15000, mentions: 390 },
        { date: 'Day 5', engagement: 15500, mentions: 400 }
      ],
      platformIntensity: [
        { platform: 'YouTube', intensity: 90 },
        { platform: 'Twitter', intensity: 76 },
        { platform: 'TikTok', intensity: 62 },
        { platform: 'Instagram', intensity: 48 },
        { platform: 'Facebook', intensity: 30 }
      ]
    },
    {
      id: '13',
      topic: 'Cooking Tutorials',
      growthRate: 145,
      engagementVelocity: 9200,
      platforms: ['TikTok', 'Instagram', 'YouTube', 'Facebook'],
      status: 'rising',
      confidence: 82,
      peakPrediction: { date: '2024-02-21', confidence: 79 },
      timeline: [
        { date: 'Day 1', engagement: 6000, mentions: 150 },
        { date: 'Day 2', engagement: 9500, mentions: 250 },
        { date: 'Day 3', engagement: 14000, mentions: 370 },
        { date: 'Day 4', engagement: 19500, mentions: 520 },
        { date: 'Day 5', engagement: 26000, mentions: 710 }
      ],
      platformIntensity: [
        { platform: 'TikTok', intensity: 88 },
        { platform: 'Instagram', intensity: 85 },
        { platform: 'YouTube', intensity: 78 },
        { platform: 'Facebook', intensity: 62 },
        { platform: 'Twitter', intensity: 38 }
      ]
    },
    {
      id: '14',
      topic: 'Pet Content',
      growthRate: 203,
      engagementVelocity: 15800,
      platforms: ['TikTok', 'Instagram', 'YouTube', 'Facebook'],
      status: 'rising',
      confidence: 91,
      peakPrediction: { date: '2024-02-23', confidence: 88 },
      timeline: [
        { date: 'Day 1', engagement: 8000, mentions: 200 },
        { date: 'Day 2', engagement: 13000, mentions: 340 },
        { date: 'Day 3', engagement: 20000, mentions: 530 },
        { date: 'Day 4', engagement: 30000, mentions: 800 },
        { date: 'Day 5', engagement: 42000, mentions: 1100 }
      ],
      platformIntensity: [
        { platform: 'TikTok', intensity: 96 },
        { platform: 'Instagram', intensity: 93 },
        { platform: 'YouTube', intensity: 75 },
        { platform: 'Facebook', intensity: 68 },
        { platform: 'Twitter', intensity: 52 }
      ]
    },
    {
      id: '15',
      topic: 'Financial Literacy',
      growthRate: 187,
      engagementVelocity: 11500,
      platforms: ['YouTube', 'Twitter', 'Instagram'],
      status: 'rising',
      confidence: 86,
      peakPrediction: { date: '2024-02-24', confidence: 83 },
      timeline: [
        { date: 'Day 1', engagement: 5500, mentions: 140 },
        { date: 'Day 2', engagement: 9000, mentions: 240 },
        { date: 'Day 3', engagement: 14500, mentions: 390 },
        { date: 'Day 4', engagement: 21000, mentions: 570 },
        { date: 'Day 5', engagement: 30000, mentions: 820 }
      ],
      platformIntensity: [
        { platform: 'YouTube', intensity: 87 },
        { platform: 'Twitter', intensity: 82 },
        { platform: 'Instagram', intensity: 68 },
        { platform: 'TikTok', intensity: 55 },
        { platform: 'Facebook', intensity: 42 }
      ]
    },
    {
      id: '16',
      topic: 'Fashion Hauls',
      growthRate: 134,
      engagementVelocity: 8900,
      platforms: ['Instagram', 'TikTok', 'YouTube'],
      status: 'peak',
      confidence: 79,
      peakPrediction: { date: '2024-02-13', confidence: 76 },
      timeline: [
        { date: 'Day 1', engagement: 8500, mentions: 210 },
        { date: 'Day 2', engagement: 12000, mentions: 320 },
        { date: 'Day 3', engagement: 14500, mentions: 390 },
        { date: 'Day 4', engagement: 15500, mentions: 420 },
        { date: 'Day 5', engagement: 16000, mentions: 430 }
      ],
      platformIntensity: [
        { platform: 'Instagram', intensity: 94 },
        { platform: 'TikTok', intensity: 86 },
        { platform: 'YouTube', intensity: 64 },
        { platform: 'Twitter', intensity: 38 },
        { platform: 'Facebook', intensity: 32 }
      ]
    },
    {
      id: '17',
      topic: 'Study Tips',
      growthRate: 156,
      engagementVelocity: 10200,
      platforms: ['TikTok', 'YouTube', 'Instagram'],
      status: 'rising',
      confidence: 81,
      peakPrediction: { date: '2024-02-16', confidence: 78 },
      timeline: [
        { date: 'Day 1', engagement: 4800, mentions: 120 },
        { date: 'Day 2', engagement: 7800, mentions: 200 },
        { date: 'Day 3', engagement: 12000, mentions: 320 },
        { date: 'Day 4', engagement: 17500, mentions: 470 },
        { date: 'Day 5', engagement: 24000, mentions: 650 }
      ],
      platformIntensity: [
        { platform: 'TikTok', intensity: 89 },
        { platform: 'YouTube', intensity: 80 },
        { platform: 'Instagram', intensity: 72 },
        { platform: 'Twitter', intensity: 45 },
        { platform: 'Facebook', intensity: 28 }
      ]
    },
    {
      id: '18',
      topic: 'Car Modifications',
      growthRate: 119,
      engagementVelocity: 7500,
      platforms: ['YouTube', 'TikTok', 'Instagram'],
      status: 'declining',
      confidence: 70,
      peakPrediction: { date: '2024-02-08', confidence: 67 },
      timeline: [
        { date: 'Day 1', engagement: 11000, mentions: 290 },
        { date: 'Day 2', engagement: 9500, mentions: 250 },
        { date: 'Day 3', engagement: 8000, mentions: 210 },
        { date: 'Day 4', engagement: 7000, mentions: 180 },
        { date: 'Day 5', engagement: 6200, mentions: 160 }
      ],
      platformIntensity: [
        { platform: 'YouTube', intensity: 78 },
        { platform: 'TikTok', intensity: 65 },
        { platform: 'Instagram', intensity: 58 },
        { platform: 'Twitter', intensity: 42 },
        { platform: 'Facebook', intensity: 48 }
      ]
    },
    {
      id: '19',
      topic: 'Skincare Routines',
      growthRate: 172,
      engagementVelocity: 11800,
      platforms: ['Instagram', 'TikTok', 'YouTube'],
      status: 'rising',
      confidence: 87,
      peakPrediction: { date: '2024-02-26', confidence: 84 },
      timeline: [
        { date: 'Day 1', engagement: 6500, mentions: 170 },
        { date: 'Day 2', engagement: 10500, mentions: 280 },
        { date: 'Day 3', engagement: 16000, mentions: 430 },
        { date: 'Day 4', engagement: 23000, mentions: 620 },
        { date: 'Day 5', engagement: 32000, mentions: 870 }
      ],
      platformIntensity: [
        { platform: 'Instagram', intensity: 95 },
        { platform: 'TikTok', intensity: 88 },
        { platform: 'YouTube', intensity: 70 },
        { platform: 'Twitter', intensity: 40 },
        { platform: 'Facebook', intensity: 35 }
      ]
    },
    {
      id: '20',
      topic: 'Music Production',
      growthRate: 161,
      engagementVelocity: 10800,
      platforms: ['YouTube', 'TikTok', 'Instagram', 'Twitter'],
      status: 'rising',
      confidence: 84,
      peakPrediction: { date: '2024-02-27', confidence: 81 },
      timeline: [
        { date: 'Day 1', engagement: 5200, mentions: 130 },
        { date: 'Day 2', engagement: 8500, mentions: 220 },
        { date: 'Day 3', engagement: 13000, mentions: 350 },
        { date: 'Day 4', engagement: 19000, mentions: 510 },
        { date: 'Day 5', engagement: 26500, mentions: 720 }
      ],
      platformIntensity: [
        { platform: 'YouTube', intensity: 91 },
        { platform: 'TikTok', intensity: 83 },
        { platform: 'Instagram', intensity: 68 },
        { platform: 'Twitter', intensity: 62 },
        { platform: 'Facebook', intensity: 38 }
      ]
    }
  ]
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getStatusColor(status: TrendStatus): string {
  switch (status) {
    case 'rising':
      return '#10b981' // green
    case 'peak':
      return '#f59e0b' // amber
    case 'declining':
      return '#ef4444' // red
  }
}

function getStatusIcon(status: TrendStatus): string {
  switch (status) {
    case 'rising':
      return '📈'
    case 'peak':
      return '🔥'
    case 'declining':
      return '📉'
  }
}

function getStatusLabel(status: TrendStatus): string {
  switch (status) {
    case 'rising':
      return 'Rising'
    case 'peak':
      return 'Peak'
    case 'declining':
      return 'Declining'
  }
}

function getPlatformIcon(platform: Platform): string {
  const icons: Record<Platform, string> = {
    TikTok: '🎵',
    Instagram: '📷',
    YouTube: '▶️',
    Twitter: '🐦',
    Facebook: '👥'
  }
  return icons[platform]
}

function getIntensityColor(intensity: number): string {
  if (intensity >= 80) return '#10b981'
  if (intensity >= 60) return '#3b82f6'
  if (intensity >= 40) return '#f59e0b'
  return '#6b7280'
}

function formatNumber(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
  return value.toString()
}

// ============================================================================
// TREND CARD COMPONENT
// ============================================================================

interface TrendCardProps {
  trend: TrendData
  index: number
}

function TrendCard({ trend, index }: TrendCardProps) {
  const statusColor = getStatusColor(trend.status)
  const statusIcon = getStatusIcon(trend.status)

  return (
    <div
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-5 hover:border-gray-600 transition-colors"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-1">{trend.topic}</h3>
          <div className="flex items-center gap-2">
            <span
              className="px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
              style={{
                backgroundColor: `${statusColor}20`,
                color: statusColor
              }}
            >
              {statusIcon} {getStatusLabel(trend.status)}
            </span>
          </div>
        </div>
        
        <div
          className="text-2xl font-bold"
          style={{ color: statusColor }}
        >
          +{trend.growthRate}%
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700">
          <div className="text-xs text-gray-400 mb-1">Engagement/hr</div>
          <div className="text-lg font-bold text-white">
            {formatNumber(trend.engagementVelocity)}
          </div>
        </div>
        
        <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700">
          <div className="text-xs text-gray-400 mb-1">Confidence</div>
          <div className="text-lg font-bold text-blue-400">
            {trend.confidence}%
          </div>
        </div>
      </div>

      {/* Platforms */}
      <div className="mb-4">
        <div className="text-xs text-gray-400 mb-2">Active Platforms</div>
        <div className="flex flex-wrap gap-2">
          {trend.platforms.map((platform) => (
            <span
              key={platform}
              className="px-2 py-1 bg-gray-700/50 rounded-md text-xs text-gray-300 flex items-center gap-1"
            >
              {getPlatformIcon(platform)} {platform}
            </span>
          ))}
        </div>
      </div>

      {/* Prediction */}
      <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-blue-400 mb-1">Peak Prediction</div>
            <div className="text-sm font-semibold text-white">
              {new Date(trend.peakPrediction.date).toLocaleDateString()}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-blue-400 mb-1">Confidence</div>
            <div className="text-sm font-semibold text-white">
              {trend.peakPrediction.confidence}%
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// TIMELINE CHART COMPONENT
// ============================================================================

interface TimelineChartProps {
  trend: TrendData
}

function TimelineChart({ trend }: TimelineChartProps) {
  const statusColor = getStatusColor(trend.status)

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800/95 backdrop-blur-sm border border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="text-white font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-400">{entry.name}:</span>
              <span className="text-white font-semibold">
                {formatNumber(entry.value)}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={trend.timeline}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id={`gradient-${trend.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={statusColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={statusColor} stopOpacity={0} />
            </linearGradient>
          </AreaChart>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          
          <XAxis
            dataKey="date"
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
          />
          
          <YAxis
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
            tickFormatter={formatNumber}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          <Area
            type="monotone"
            dataKey="engagement"
            stroke={statusColor}
            strokeWidth={3}
            fill={`url(#gradient-${trend.id})`}
            name="Engagement"
          />
          
          <Line
            type="monotone"
            dataKey="mentions"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={{ fill: '#8b5cf6', r: 4 }}
            name="Mentions"
          />
        </ResponsiveContainer>
      </div>
    </Platform>
  )
}

// ============================================================================
// PLATFORM HEATMAP COMPONENT
// ============================================================================

interface PlatformHeatmapProps {
  trend: TrendData
}

function PlatformHeatmap({ trend }: PlatformHeatmapProps) {
  return (
    <div className="space-y-2">
      {trend.platformIntensity.map((item, index) => (
        <div
          key={item.platform}
          className="flex items-center gap-3"
        >
          <div className="w-24 text-sm text-gray-300 flex items-center gap-2">
            <span>{getPlatformIcon(item.platform)}</span>
            <span>{item.platform}</span>
          </div>
          
          <div className="flex-1 h-8 bg-gray-700/30 rounded-lg overflow-hidden relative">
            <div
              className="h-full rounded-lg flex items-center justify-end pr-3"
              style={{
                backgroundColor: getIntensityColor(item.intensity)
              }}
            >
              <span className="text-xs font-bold text-white">
                {item.intensity}%
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================

export default function TrendDashboard({
  data = mockTrendData,
  animated = true,
  showTimeline = true,
  showHeatmap = true,
  showPredictions = true
}: TrendDashboardProps) {
  const [selectedTrend, setSelectedTrend] = useState<TrendData | null>(null)
  const [filterStatus, setFilterStatus] = useState<TrendStatus | 'all'>('all')

  const filteredTrends = filterStatus === 'all'
    ? data.trends
    : data.trends.filter(t => t.status === filterStatus)

  const risingCount = data.trends.filter(t => t.status === 'rising').length
  const peakCount = data.trends.filter(t => t.status === 'peak').length
  const decliningCount = data.trends.filter(t => t.status === 'declining').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-3xl font-bold text-white">
            Trend Dashboard
          </h2>
          <div className="text-sm text-gray-400">
            Last updated: {new Date(data.lastUpdated).toLocaleString()}
          </div>
        </div>
        <p className="text-gray-400">
          Real-time trending topics with AI-powered predictions and platform analytics
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-5"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total Trends</span>
            <span className="text-2xl">📊</span>
          </div>
          <div className="text-3xl font-bold text-white">{data.trends.length}</div>
        </div>

        <div
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-5"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Rising</span>
            <span className="text-2xl">📈</span>
          </div>
          <div className="text-3xl font-bold text-green-400">{risingCount}</div>
        </div>

        <div
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-5"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">At Peak</span>
            <span className="text-2xl">🔥</span>
          </div>
          <div className="text-3xl font-bold text-amber-400">{peakCount}</div>
        </div>

        <div
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-5"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Declining</span>
            <span className="text-2xl">📉</span>
          </div>
          <div className="text-3xl font-bold text-red-400">{decliningCount}</div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div
        className="flex gap-3 flex-wrap"
      >
        {(['all', 'rising', 'peak', 'declining'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              filterStatus === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
            }`}
          >
            {status === 'all' ? 'All Trends' : `${getStatusIcon(status)} ${getStatusLabel(status)}`}
          </button>
        ))}
      </div>

      {/* Trend Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTrends.map((trend, index) => (
          <div
            key={trend.id}
            onClick={() => setSelectedTrend(trend)}
            className="cursor-pointer"
          >
            <TrendCard trend={trend} index={index} />
          </div>
        ))}
      </div>

      {/* Selected Trend Detail Modal */}
      {selectedTrend && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedTrend(null)}
        >
          <div
            className="bg-gray-900 rounded-2xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {selectedTrend.topic}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span
                      className="px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1"
                      style={{
                        backgroundColor: `${getStatusColor(selectedTrend.status)}20`,
                        color: getStatusColor(selectedTrend.status)
                      }}
                    >
                      {getStatusIcon(selectedTrend.status)} {getStatusLabel(selectedTrend.status)}
                    </span>
                    <span className="text-gray-400 text-sm">
                      Growth: <span className="text-white font-bold">+{selectedTrend.growthRate}%</span>
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => setSelectedTrend(null)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Timeline Chart */}
              {showTimeline && (
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-white mb-4">
                    📈 Trend Timeline
                  </h4>
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-4">
                    <TimelineChart trend={selectedTrend} />
                  </div>
                </div>
              )}

              {/* Platform Heatmap */}
              {showHeatmap && (
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-white mb-4">
                    🗺️ Platform Intensity Heatmap
                  </h4>
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-4">
                    <PlatformHeatmap trend={selectedTrend} />
                  </div>
                </div>
              )}

              {/* Predictions */}
              {showPredictions && (
                <div>
                  <h4 className="text-lg font-bold text-white mb-4">
                    🔮 AI Predictions
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-900/30 to-gray-800/50 backdrop-blur-sm rounded-xl border border-blue-800/30 p-5">
                      <div className="text-blue-400 text-sm mb-2">Peak Date Prediction</div>
                      <div className="text-2xl font-bold text-white mb-1">
                        {new Date(selectedTrend.peakPrediction.date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="text-sm text-gray-400">
                        Confidence: <span className="text-blue-400 font-semibold">
                          {selectedTrend.peakPrediction.confidence}%
                        </span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-900/30 to-gray-800/50 backdrop-blur-sm rounded-xl border border-purple-800/30 p-5">
                      <div className="text-purple-400 text-sm mb-2">Overall Confidence</div>
                      <div className="text-2xl font-bold text-white mb-1">
                        {selectedTrend.confidence}%
                      </div>
                      <div className="text-sm text-gray-400">
                        Based on {selectedTrend.platforms.length} platform{selectedTrend.platforms.length > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Top Predictions Section */}
      {showPredictions && (
        <div
          className="bg-gradient-to-br from-purple-900/20 to-gray-800/50 backdrop-blur-sm rounded-xl border border-purple-700/30 p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>🔮</span>
            <span>Top Predictions</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.trends
              .sort((a, b) => b.confidence - a.confidence)
              .slice(0, 3)
              .map((trend, index) => (
                <div
                  key={trend.id}
                  className="bg-gray-800/30 rounded-lg p-4 border border-gray-700"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="text-2xl font-bold text-purple-400">
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-white">
                        {trend.topic}
                      </div>
                      <div className="text-xs text-gray-400">
                        {trend.confidence}% confidence
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
