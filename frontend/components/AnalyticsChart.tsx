'use client'

import { AnalyticsData } from '@/types/content'
import { useState } from 'react'

interface AnalyticsChartProps {
  data: AnalyticsData[];
}

export default function AnalyticsChart({ data }: AnalyticsChartProps) {
  const [activeMetric, setActiveMetric] = useState<'views' | 'engagement' | 'reach'>('views')

  const maxValue = Math.max(...data.map(d => d[activeMetric]))

  const metrics = [
    { key: 'views' as const, label: 'Views', color: 'purple', icon: '👁️' },
    { key: 'engagement' as const, label: 'Engagement', color: 'pink', icon: '❤️' },
    { key: 'reach' as const, label: 'Reach', color: 'blue', icon: '🌐' },
  ]

  return (
    <div
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Analytics Overview</h2>
        <div className="flex gap-2">
          {metrics.map((metric) => (
            <button
              key={metric.key}
              onClick={() => setActiveMetric(metric.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeMetric === metric.key
                  ? `bg-${metric.color}-600 text-white`
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {metric.icon} {metric.label}
            </button>
          ))}
        </h2>
      </div>

      {/* Bar Chart */}
      <div className="space-y-4">
        {data.map((item, index) => {
          const percentage = (item[activeMetric] / maxValue) * 100
          const metric = metrics.find(m => m.key === activeMetric)!

          return (
            <div
              key={item.platform}
            >
              <div className="flex items-center gap-4 mb-2">
                <div className="w-24 text-sm font-semibold text-gray-300">
                  {item.platform}
                </div>
                <div className="flex-1">
                  <div className="relative h-10 bg-gray-700/50 rounded-lg overflow-hidden">
                    <div
                      className={`absolute inset-y-0 left-0 bg-gradient-to-r from-${metric.color}-500 to-${metric.color}-600 rounded-lg flex items-center justify-end px-3`}
                    >
                      <span className="text-white font-semibold text-sm">
                        {item[activeMetric].toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-700">
        {metrics.map((metric, index) => {
          const total = data.reduce((sum, item) => sum + item[metric.key], 0)
          return (
            <div
              key={metric.key}
              className="text-center"
            >
              <div className="text-3xl mb-2">{metric.icon}</div>
              <div className={`text-2xl font-bold text-${metric.color}-400 mb-1`}>
                {total.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Total {metric.label}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
