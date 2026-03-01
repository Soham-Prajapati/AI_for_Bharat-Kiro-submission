'use client'

import { useState } from 'react'

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d')

  const stats = [
    { label: 'Total Views', value: '45.2K', change: '+12.5%', positive: true },
    { label: 'Engagement Rate', value: '8.4%', change: '+2.1%', positive: true },
    { label: 'Avg. Watch Time', value: '3:24', change: '+0:45', positive: true },
    { label: 'Conversions', value: '234', change: '+18%', positive: true },
  ]

  const platformData = [
    { platform: 'YouTube', views: '18.5K', engagement: '12.3%', growth: '+15%' },
    { platform: 'Instagram', views: '12.8K', engagement: '9.2%', growth: '+22%' },
    { platform: 'LinkedIn', views: '8.4K', engagement: '6.8%', growth: '+8%' },
    { platform: 'Twitter', views: '5.5K', engagement: '4.2%', growth: '+5%' },
  ]

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-h1 text-text-primary mb-2">Analytics</h1>
            <p className="text-text-secondary">Track your content performance across platforms</p>
          </p>
          
          {/* Time Range Selector */}
          <div className="flex gap-2 bg-bg-elevated border border-border-subtle rounded-lg p-1">
            {['24h', '7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-brand-600 text-white'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {range}
              </button>
            ))}
          </h1>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-bg-elevated border border-border-subtle rounded-lg p-6">
            <div className="text-sm text-text-tertiary mb-2">{stat.label}</div>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold text-text-primary">{stat.value}</div>
              <div className={`text-sm font-medium ${stat.positive ? 'text-green-500' : 'text-red-500'}`}>
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Platform Performance */}
      <div className="bg-bg-elevated border border-border-subtle rounded-lg mb-8">
        <div className="p-6 border-b border-border-subtle">
          <h2 className="text-h3 text-text-primary">Platform Performance</h2>
        </h2>
        
        <div className="divide-y divide-border-subtle">
          {platformData.map((platform, index) => (
            <div key={index} className="p-6 hover:bg-bg-overlay transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="font-semibold text-text-primary">{platform.platform}</div>
                <div className="text-sm font-medium text-green-500">{platform.growth}</div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-text-tertiary mb-1">Views</div>
                  <div className="text-lg font-semibold text-text-primary">{platform.views}</div>
                </div>
                <div>
                  <div className="text-xs text-text-tertiary mb-1">Engagement</div>
                  <div className="text-lg font-semibold text-text-primary">{platform.engagement}</div>
                </div>
                <div>
                  <div className="text-xs text-text-tertiary mb-1">Growth</div>
                  <div className="text-lg font-semibold text-green-500">{platform.growth}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="bg-bg-elevated border border-border-subtle rounded-lg p-6">
        <h2 className="text-h3 text-text-primary mb-6">Engagement Over Time</h2>
        <div className="h-64 flex items-center justify-center border border-border-subtle rounded-lg bg-bg-base">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <div className="text-text-secondary">Chart visualization coming soon</div>
          </h2>
        </div>
      </div>
    </div>
  )
}
