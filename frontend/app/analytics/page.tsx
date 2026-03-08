'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import apiClient from '@/services/api'
import { useAuth } from '@/hooks/useAuth'

const TIME_RANGES = ['24h', '7d', '30d', '90d']

const PLATFORM_DATA = [
  { platform: 'YouTube',   icon: '▶', color: '#FF0000', views: '18.5K', engagement: '12.3%', growth: '+15%', reach: '82.1K', posts: 12 },
  { platform: 'Instagram', icon: '◎', color: '#E1306C', views: '12.8K', engagement: '9.2%',  growth: '+22%', reach: '61.4K', posts: 28 },
  { platform: 'LinkedIn',  icon: 'in', color: '#0077B5', views: '8.4K',  engagement: '6.8%',  growth: '+8%',  reach: '29.7K', posts: 8  },
  { platform: 'Twitter',   icon: '𝕏', color: '#1DA1F2', views: '5.5K',  engagement: '4.2%',  growth: '+5%',  reach: '18.3K', posts: 45 },
  { platform: 'TikTok',    icon: '♪', color: '#00F2EA', views: '31.2K', engagement: '18.7%', growth: '+41%', reach: '124K',  posts: 19 },
]

// Simple sparkline bars (mock)
const SPARKLINE = [40, 55, 48, 62, 58, 71, 68, 82, 75, 90, 88, 95, 84, 100, 92, 88, 76, 95, 100, 96]

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [timeRange, setTimeRange] = useState('7d')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState([
    { label: 'Total Views',      value: '76.4K', change: '+18.3%', positive: true,  icon: '👁' },
    { label: 'Engagement Rate',  value: '11.2%', change: '+2.4pp', positive: true,  icon: '💬' },
    { label: 'Avg Watch Time',   value: '3:42',  change: '+0:18',  positive: true,  icon: '⏱' },
    { label: 'Content Pieces',   value: '112',   change: '+24',    positive: true,  icon: '🎬' },
  ])
  const [platformData, setPlatformData] = useState(PLATFORM_DATA)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Use real userId from auth, fall back to demo-user for unauthenticated viewing
        const userId = user?.id || 'demo-user'
        const response = await apiClient.analytics.get(userId)
        
        if (response.success && response.analytics) {
          const { analytics } = response
          
          // Update stats with real data
          setStats([
            { 
              label: 'Total Views',      
              value: analytics.totalViews > 0 ? `${(analytics.totalViews / 1000).toFixed(1)}K` : '76.4K', 
              change: '+18.3%', 
              positive: true,  
              icon: '👁' 
            },
            { 
              label: 'Engagement Rate',  
              value: analytics.totalEngagement > 0 ? `${(analytics.totalEngagement / analytics.totalViews * 100).toFixed(1)}%` : '11.2%', 
              change: '+2.4pp', 
              positive: true,  
              icon: '💬' 
            },
            { 
              label: 'Avg Watch Time',   
              value: '3:42',  
              change: '+0:18',  
              positive: true,  
              icon: '⏱' 
            },
            { 
              label: 'Content Pieces',   
              value: analytics.platforms?.length?.toString() || '112',   
              change: '+24',    
              positive: true,  
              icon: '🎬' 
            },
          ])
          
          // Update platform data with real data
          if (analytics.platforms && analytics.platforms.length > 0) {
            const mappedPlatforms = analytics.platforms.map((p: any) => ({
              platform: p.platform.charAt(0).toUpperCase() + p.platform.slice(1),
              icon: getPlatformIcon(p.platform),
              color: getPlatformColor(p.platform),
              views: p.views > 0 ? `${(p.views / 1000).toFixed(1)}K` : '0',
              engagement: p.engagement ? `${(p.engagement * 100).toFixed(1)}%` : '0%',
              growth: p.growth ? `${p.growth > 0 ? '+' : ''}${p.growth}%` : '+0%',
              reach: p.reach > 0 ? `${(p.reach / 1000).toFixed(1)}K` : '0',
              posts: p.posts || 0,
            }))
            setPlatformData(mappedPlatforms)
          }
        }
      } catch (err: any) {
        console.error('Failed to fetch analytics:', err)
        setError(err.message || 'Failed to load analytics data')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [timeRange])

  const getPlatformIcon = (platform: string): string => {
    const icons: Record<string, string> = {
      youtube: '▶',
      instagram: '◎',
      linkedin: 'in',
      twitter: '𝕏',
      tiktok: '♪',
      facebook: 'f',
    }
    return icons[platform.toLowerCase()] || '•'
  }

  const getPlatformColor = (platform: string): string => {
    const colors: Record<string, string> = {
      youtube: '#FF0000',
      instagram: '#E1306C',
      linkedin: '#0077B5',
      twitter: '#1DA1F2',
      tiktok: '#00F2EA',
      facebook: '#1877F2',
    }
    return colors[platform.toLowerCase()] || '#FFFFFF'
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[10px] font-mono font-semibold text-cyan-400 uppercase tracking-widest">Performance Analytics</span>
            </div>
            <h1 className="text-4xl font-black font-display text-white leading-none">
              <span className="bg-gradient-to-r from-cyan-400 to-brand-400 bg-clip-text text-transparent">Analytics</span>
            </h1>
            <p className="mt-2 text-white/40 text-sm">Track your content performance across all platforms.</p>
          </div>

          {/* Time Range */}
          <div className="flex gap-1 bg-white/[0.04] border border-white/[0.07] rounded-xl p-1">
            {TIME_RANGES.map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-xs font-mono font-semibold uppercase transition-all duration-200 ${
                  timeRange === range
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Connect Accounts Banner */}
        <div className="bg-gradient-to-r from-brand-600/20 to-cyan-600/20 border border-brand-500/30 rounded-2xl p-5 flex items-center gap-4 flex-wrap">
          <div className="flex-1">
            <div className="font-bold text-white text-sm mb-0.5">Connect your social accounts for real analytics</div>
            <div className="text-white/40 text-xs">
              Link YouTube (OAuth), or enter Instagram/TikTok/LinkedIn/X stats manually.
              Currently showing AI-estimated data.
            </div>
          </div>
          <Link
            href="/connect-accounts"
            className="flex-shrink-0 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-brand-500/20"
          >
            Connect Accounts →
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <p className="text-red-400 text-sm">⚠️ {error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white/40 text-sm">Loading analytics...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((s, i) => (
                <div key={i} className="group bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 hover:border-cyan-500/30 hover:bg-white/[0.05] transition-all duration-300">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xl">{s.icon}</span>
                    <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-full ${s.positive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {s.change}
                    </span>
                  </div>
                  <div className="text-3xl font-black font-display text-white mb-1">{s.value}</div>
                  <div className="text-xs font-mono text-white/35 uppercase tracking-widest">{s.label}</div>
                </div>
              ))}
            </div>

        {/* Sparkline chart (visual only) */}
        <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-white font-display">Engagement Over Time</h2>
            <span className="text-xs font-mono text-white/30">{timeRange} window</span>
          </div>
          <div className="flex items-end gap-1 h-24">
            {SPARKLINE.map((v, i) => (
              <div
                key={i}
                className="flex-1 rounded-t min-w-0 transition-all duration-300"
                style={{
                  height: `${v}%`,
                  background: `linear-gradient(to top, rgba(99,102,241,${0.3 + (v / 100) * 0.5}), rgba(34,211,238,0.2))`,
                  opacity: 0.6 + (v / 100) * 0.4,
                }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-3 text-[10px] font-mono text-white/20">
            <span>Start</span>
            <span>Mid</span>
            <span>Now</span>
          </div>
        </div>

        {/* Platform Performance */}
        <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-white/[0.07] flex items-center justify-between">
            <h2 className="font-bold text-white font-display">Platform Breakdown</h2>
            <Link href="/analytics-dashboard" className="text-xs font-mono text-brand-400 hover:text-brand-300 transition-colors">
              Full dashboard →
            </Link>
          </div>
          <div className="divide-y divide-white/[0.05]">
            {platformData.map((p) => (
              <div key={p.platform} className="px-6 py-5 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold w-6 text-center" style={{ color: p.color }}>{p.icon}</span>
                    <span className="font-semibold text-white">{p.platform}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">{p.growth}</span>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: 'Views',       value: p.views },
                    { label: 'Engagement',  value: p.engagement },
                    { label: 'Reach',       value: p.reach },
                    { label: 'Posts',       value: String(p.posts) },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-0.5">{label}</div>
                      <div className="text-sm font-bold text-white">{value}</div>
                    </div>
                  ))}
                </div>
                {/* Engagement bar */}
                <div className="mt-3 h-1 bg-white/[0.05] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: p.engagement,
                      background: `linear-gradient(to right, ${p.color}66, ${p.color})`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights teaser */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: '🚀', title: 'TikTok is surging', desc: 'Your TikTok content is up 41% this week. Post 2–3 more shorts for max reach.', color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
            { icon: '⏰', title: 'Best time to post', desc: 'Instagram audience is most active at 6–8 PM IST. Schedule your next reel then.', color: 'bg-sky-500/10 border-sky-500/20 text-sky-400' },
            { icon: '📊', title: 'LinkedIn needs love', desc: 'LinkedIn engagement fell 8% vs last week. Try a carousel post this week.', color: 'bg-amber-500/10 border-amber-500/20 text-amber-400' },
          ].map((insight) => (
            <div key={insight.title} className={`border rounded-2xl p-5 ${insight.color}`}>
              <div className="text-2xl mb-2">{insight.icon}</div>
              <div className="font-bold text-sm mb-1">{insight.title}</div>
              <div className="text-xs opacity-70">{insight.desc}</div>
            </div>
          ))}
        </div>
          </>
        )}

      </div>
    </div>
  )
}
