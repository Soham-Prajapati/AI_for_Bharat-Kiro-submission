'use client'

import Link from 'next/link'

export default function DashboardPage() {
  const stats = [
    { label: 'Total Content', value: '127', change: '+12%', positive: true },
    { label: 'This Month', value: '24', change: '+8%', positive: true },
    { label: 'Avg. Engagement', value: '4.2K', change: '+15%', positive: true },
    { label: 'Time Saved', value: '48h', change: '+22%', positive: true },
  ]

  const recentContent = [
    { id: 1, title: 'Product Launch Video', platform: 'YouTube', status: 'published', date: '2 hours ago', engagement: '2.4K' },
    { id: 2, title: 'Instagram Reel - Behind the Scenes', platform: 'Instagram', status: 'draft', date: '5 hours ago', engagement: '-' },
    { id: 3, title: 'LinkedIn Post - Industry Insights', platform: 'LinkedIn', status: 'scheduled', date: 'Tomorrow 9AM', engagement: '-' },
    { id: 4, title: 'Twitter Thread - Product Tips', platform: 'Twitter', status: 'published', date: '1 day ago', engagement: '1.8K' },
  ]

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-h1 text-text-primary mb-2">Dashboard</h1>
        <p className="text-text-secondary">Welcome back! Here's your content overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-bg-elevated border border-border-subtle rounded-lg p-6 hover:border-border-DEFAULT transition-colors">
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link 
          href="/upload" 
          className="bg-brand-600 hover:bg-brand-700 text-white rounded-lg p-6 transition-colors group"
        >
          <div className="text-2xl mb-3">⬆️</div>
          <div className="font-semibold mb-1">Upload Content</div>
          <div className="text-sm text-brand-100">Transform your video or audio</div>
        </Link>
        
        <Link 
          href="/analytics" 
          className="bg-bg-elevated border border-border-subtle hover:border-border-DEFAULT rounded-lg p-6 transition-colors group"
        >
          <div className="text-2xl mb-3">📈</div>
          <div className="font-semibold text-text-primary mb-1">View Analytics</div>
          <div className="text-sm text-text-secondary">Track your performance</div>
        </Link>
        
        <Link 
          href="/marketplace" 
          className="bg-bg-elevated border border-border-subtle hover:border-border-DEFAULT rounded-lg p-6 transition-colors group"
        >
          <div className="text-2xl mb-3">🛍️</div>
          <div className="font-semibold text-text-primary mb-1">Marketplace</div>
          <div className="text-sm text-text-secondary">Browse templates</div>
        </Link>
      </div>

      {/* Recent Content */}
      <div className="bg-bg-elevated border border-border-subtle rounded-lg">
        <div className="flex items-center justify-between p-6 border-b border-border-subtle">
          <h2 className="text-h3 text-text-primary">Recent Content</h2>
          <Link href="/analytics" className="text-sm text-brand-600 hover:text-brand-500 transition-colors font-medium">
            View all →
          </Link>
        </div>
        
        <div className="divide-y divide-border-subtle">
          {recentContent.map((item) => (
            <div key={item.id} className="p-6 hover:bg-bg-overlay transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-text-primary mb-1 truncate">{item.title}</div>
                  <div className="flex items-center gap-3 text-sm text-text-tertiary">
                    <span>{item.platform}</span>
                    <span>•</span>
                    <span>{item.date}</span>
                    {item.engagement !== '-' && (
                      <>
                        <span>•</span>
                        <span>{item.engagement} views</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="ml-4">
                  <span className={`px-3 py-1 rounded-md text-xs font-medium ${
                    item.status === 'published' ? 'bg-green-500/10 text-green-500' :
                    item.status === 'draft' ? 'bg-yellow-500/10 text-yellow-500' :
                    'bg-blue-500/10 text-blue-500'
                  }`}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
