/**
 * TrendDashboard Component - Usage Examples
 * 
 * This file demonstrates how to use the TrendDashboard component
 * with various configurations and custom data.
 */

import React from 'react';
import TrendDashboard, { TrendDashboardData, TrendData } from './TrendDashboard'

// ============================================================================
// EXAMPLE 1: Basic Usage with Default Mock Data
// ============================================================================

export function BasicTrendDashboard() {
  return <TrendDashboard />
}

// ============================================================================
// EXAMPLE 2: With Custom Data
// ============================================================================

export function CustomTrendDashboard() {
  const customData: TrendDashboardData = {
    lastUpdated: new Date().toISOString(),
    trends: [
      {
        id: 'custom-1',
        topic: 'Custom Trend Topic',
        growthRate: 180,
        engagementVelocity: 12000,
        platforms: ['TikTok', 'Instagram'],
        status: 'rising',
        confidence: 85,
        peakPrediction: {
          date: '2024-03-01',
          confidence: 82
        },
        timeline: [
          { date: 'Day 1', engagement: 5000, mentions: 120 },
          { date: 'Day 2', engagement: 8000, mentions: 200 },
          { date: 'Day 3', engagement: 12000, mentions: 320 },
          { date: 'Day 4', engagement: 18000, mentions: 480 },
          { date: 'Day 5', engagement: 25000, mentions: 650 }
        ],
        platformIntensity: [
          { platform: 'TikTok', intensity: 92 },
          { platform: 'Instagram', intensity: 85 },
          { platform: 'YouTube', intensity: 60 },
          { platform: 'Twitter', intensity: 45 },
          { platform: 'Facebook', intensity: 30 }
        ]
      }
      // Add more trends as needed
    ]
  }

  return <TrendDashboard data={customData} />
}

// ============================================================================
// EXAMPLE 3: Minimal Configuration (No Animations)
// ============================================================================

export function MinimalTrendDashboard() {
  return (
    <TrendDashboard
      animated={false}
      showTimeline={false}
      showHeatmap={false}
      showPredictions={false}
    />
  )
}

// ============================================================================
// EXAMPLE 4: Timeline and Heatmap Only
// ============================================================================

export function AnalyticsFocusedDashboard() {
  return (
    <TrendDashboard
      showTimeline={true}
      showHeatmap={true}
      showPredictions={false}
    />
  )
}

// ============================================================================
// EXAMPLE 5: Predictions Focus
// ============================================================================

export function PredictionsFocusedDashboard() {
  return (
    <TrendDashboard
      showTimeline={false}
      showHeatmap={false}
      showPredictions={true}
    />
  )
}

// ============================================================================
// EXAMPLE 6: Integration with API
// ============================================================================

export function APIIntegratedDashboard() {
  // Example of how to integrate with an API
  const [trendData, setTrendData] = React.useState<TrendDashboardData | undefined>()
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchTrends() {
      try {
        const response = await fetch('/api/trends')
        const data = await response.json()
        setTrendData(data)
      } catch (error) {
        console.error('Failed to fetch trends:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrends()
  }, [])

  if (loading) {
    return <div className="text-white">Loading trends...</div>
  }

  return <TrendDashboard data={trendData} />
}

// ============================================================================
// EXAMPLE 7: With Auto-Refresh
// ============================================================================

export function AutoRefreshDashboard() {
  const [trendData, setTrendData] = React.useState<TrendDashboardData | undefined>()

  React.useEffect(() => {
    // Fetch initial data
    fetchTrends()

    // Set up auto-refresh every 5 minutes
    const interval = setInterval(fetchTrends, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  async function fetchTrends() {
    try {
      const response = await fetch('/api/trends')
      const data = await response.json()
      setTrendData(data)
    } catch (error) {
      console.error('Failed to fetch trends:', error)
    }
  }

  return <TrendDashboard data={trendData} />
}

// Note: Add 'use client' directive and import React if using these examples in Next.js
