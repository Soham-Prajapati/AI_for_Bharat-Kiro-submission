'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import apiClient from '@/services/api'
import { useAuth } from '@/hooks/useAuth'

const DOMAIN_LABELS: Record<string, string> = {
  food: '🍳 Food & Cooking',
  education: '📚 Education',
  travel: '✈️ Travel & Adventure',
  product: '📦 Product Reviews',
  entertainment: '🎬 Entertainment',
  technology: '💻 Technology',
  health: '💪 Health & Fitness',
  business: '📈 Business & Finance',
}

interface ContentItem {
  id: number | string
  title: string
  platform: string
  status: 'published' | 'draft' | 'scheduled'
  date: string
  engagement: string
}

const MOCK_CONTENT: ContentItem[] = [
  { id: 1, title: 'Product Launch Video', platform: 'YouTube', status: 'published', date: '2 hours ago', engagement: '2.4K' },
  { id: 2, title: 'Instagram Reel — Behind the Scenes', platform: 'Instagram', status: 'draft', date: '5 hours ago', engagement: '—' },
  { id: 3, title: 'LinkedIn Post — Industry Insights', platform: 'LinkedIn', status: 'scheduled', date: 'Tomorrow 9AM', engagement: '—' },
  { id: 4, title: 'Twitter Thread — Product Tips', platform: 'Twitter', status: 'published', date: '1 day ago', engagement: '1.8K' },
  { id: 5, title: 'How to 10x Your Reach in Hindi', platform: 'YouTube', status: 'published', date: '2 days ago', engagement: '8.1K' },
]

const PLATFORM_COLORS: Record<string, string> = {
  YouTube: 'text-red-400',
  Instagram: 'text-pink-400',
  LinkedIn: 'text-sky-400',
  Twitter: 'text-blue-400',
  TikTok: 'text-cyan-400',
  Facebook: 'text-indigo-400',
}

function StatCard({ label, value, change, positive, icon }: {
  label: string; value: string; change: string; positive: boolean; icon: string
}) {
  return (
    <div className="group relative bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 hover:border-brand-500/30 hover:bg-white/[0.05] transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <span className="text-2xl">{icon}</span>
        <span className={`text-xs font-mono font-semibold px-2 py-1 rounded-full ${positive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
          {change}
        </span>
      </div>
      <div className="text-3xl font-black font-display text-white mb-1">{value}</div>
      <div className="text-xs font-mono text-white/40 uppercase tracking-widest">{label}</div>
      <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-brand-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, hydrated } = useAuth()
  const [content, setContent] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statCards, setStatCards] = useState([
    { label: 'Total Content',  value: '—',    change: '…', positive: true, icon: '🎬' },
    { label: 'This Month',     value: '—',    change: '…', positive: true, icon: '📅' },
    { label: 'Avg Engagement', value: '—',    change: '…', positive: true, icon: '📈' },
    { label: 'Hours Saved',    value: '—',    change: '…', positive: true, icon: '⚡' },
  ])

  // Redirect to login if not authenticated (wait for hydration first)
  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace('/login')
    }
  }, [hydrated, isAuthenticated, router])

  useEffect(() => {
    if (!isAuthenticated || !user) return

    const fetchDashboard = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await apiClient.analyticsDashboard.getDashboard(user.id)

        if (response.success && response.dashboard) {
          const { dashboard } = response

          if (dashboard.metrics && dashboard.metrics.length > 0) {
            const metricsMap = dashboard.metrics.reduce((acc, metric) => {
              acc[metric.name] = metric
              return acc
            }, {} as Record<string, any>)

            setStatCards([
              {
                label: 'Total Content',
                value: metricsMap['totalContent']?.value?.toString() || metricsMap['Total Views']?.value
                  ? `${Math.round(metricsMap['Total Views'].value / 1000)}K` : '127',
                change: metricsMap['totalContent']?.change
                  ? `${metricsMap['totalContent'].change > 0 ? '+' : ''}${metricsMap['totalContent'].change}%` : '+12%',
                positive: metricsMap['totalContent']?.trend !== 'down',
                icon: '🎬',
              },
              {
                label: 'This Month',
                value: metricsMap['monthlyContent']?.value?.toString() || '24',
                change: metricsMap['monthlyContent']?.change
                  ? `${metricsMap['monthlyContent'].change > 0 ? '+' : ''}${metricsMap['monthlyContent'].change}%` : '+8%',
                positive: metricsMap['monthlyContent']?.trend !== 'down',
                icon: '📅',
              },
              {
                label: 'Avg Engagement',
                value: metricsMap['avgEngagement']?.value
                  ? `${(metricsMap['avgEngagement'].value / 1000).toFixed(1)}K` : '4.2K',
                change: metricsMap['avgEngagement']?.change
                  ? `${metricsMap['avgEngagement'].change > 0 ? '+' : ''}${metricsMap['avgEngagement'].change}%` : '+15%',
                positive: metricsMap['avgEngagement']?.trend !== 'down',
                icon: '📈',
              },
              {
                label: 'Hours Saved',
                value: metricsMap['hoursSaved']?.value ? `${metricsMap['hoursSaved'].value}h` : '48h',
                change: metricsMap['hoursSaved']?.change
                  ? `${metricsMap['hoursSaved'].change > 0 ? '+' : ''}${metricsMap['hoursSaved'].change}%` : '+22%',
                positive: metricsMap['hoursSaved']?.trend !== 'down',
                icon: '⚡',
              },
            ])
          } else {
            setStatCards([
              { label: 'Total Content',  value: '127',  change: '+12%', positive: true, icon: '🎬' },
              { label: 'This Month',     value: '24',   change: '+8%',  positive: true, icon: '📅' },
              { label: 'Avg Engagement', value: '4.2K', change: '+15%', positive: true, icon: '📈' },
              { label: 'Hours Saved',    value: '48h',  change: '+22%', positive: true, icon: '⚡' },
            ])
          }

          if (dashboard.platformPerformance && dashboard.platformPerformance.length > 0) {
            const contentItems: ContentItem[] = dashboard.platformPerformance.slice(0, 5).map((perf, idx) => ({
              id: `content-${idx}`,
              title: `${perf.platform} Content`,
              platform: perf.platform.charAt(0).toUpperCase() + perf.platform.slice(1),
              status: 'published' as const,
              date: '2 hours ago',
              engagement: perf.metrics.views > 0 ? `${(perf.metrics.views / 1000).toFixed(1)}K` : '—',
            }))
            setContent(contentItems)
          } else {
            setContent(MOCK_CONTENT)
          }
        } else {
          setStatCards([
            { label: 'Total Content',  value: '127',  change: '+12%', positive: true, icon: '🎬' },
            { label: 'This Month',     value: '24',   change: '+8%',  positive: true, icon: '📅' },
            { label: 'Avg Engagement', value: '4.2K', change: '+15%', positive: true, icon: '📈' },
            { label: 'Hours Saved',    value: '48h',  change: '+22%', positive: true, icon: '⚡' },
          ])
          setContent(MOCK_CONTENT)
        }
      } catch (err: any) {
        console.error('Failed to fetch dashboard:', err)
        setError(err.message || 'Failed to load dashboard data')
        setStatCards([
          { label: 'Total Content',  value: '127',  change: '+12%', positive: true, icon: '🎬' },
          { label: 'This Month',     value: '24',   change: '+8%',  positive: true, icon: '📅' },
          { label: 'Avg Engagement', value: '4.2K', change: '+15%', positive: true, icon: '📈' },
          { label: 'Hours Saved',    value: '48h',  change: '+22%', positive: true, icon: '⚡' },
        ])
        setContent(MOCK_CONTENT)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [isAuthenticated, user])

  if (!hydrated) return null   // wait for localStorage restore
  if (!isAuthenticated) return null

  const firstName = user?.name?.split(' ')[0] || 'Creator'
  const domainLabel = user?.domain ? DOMAIN_LABELS[user.domain] : null

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
                <span className="text-[10px] font-mono font-semibold text-brand-400 uppercase tracking-widest">Live Dashboard</span>
              </div>
              {domainLabel && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                  <span className="text-[10px] font-mono font-semibold text-cyan-400 uppercase tracking-widest">{domainLabel}</span>
                </div>
              )}
            </div>
            <h1 className="text-4xl font-black font-display text-white leading-none">
              Welcome back,{' '}
              <span className="bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">{firstName}</span>
            </h1>
            <p className="mt-2 text-white/40 text-sm">Your content intelligence overview — updated in real time.</p>
          </div>
          <Link
            href="/upload"
            className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-brand-500/20"
          >
            <span>＋</span>
            <span>New Upload</span>
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
              <div className="w-12 h-12 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white/40 text-sm">Loading your dashboard…</p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((s, i) => <StatCard key={i} {...s} />)}
            </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xs font-mono font-semibold text-white/30 uppercase tracking-widest mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/upload"
              className="group relative overflow-hidden bg-gradient-to-br from-brand-600/30 to-brand-800/20 border border-brand-500/30 rounded-2xl p-6 hover:border-brand-400/50 transition-all duration-300"
            >
              <div className="text-3xl mb-3">⬆️</div>
              <div className="font-bold text-white mb-1 font-display">Upload Content</div>
              <div className="text-sm text-white/50">Transform video or audio into 10+ formats</div>
              <div className="mt-4 text-xs font-mono text-brand-400 group-hover:translate-x-1 transition-transform">Upload now →</div>
            </Link>
            <Link
              href="/analytics"
              className="group bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 hover:border-cyan-500/30 hover:bg-white/[0.05] transition-all duration-300"
            >
              <div className="text-3xl mb-3">📊</div>
              <div className="font-bold text-white mb-1 font-display">Analytics</div>
              <div className="text-sm text-white/50">Track performance across all platforms</div>
              <div className="mt-4 text-xs font-mono text-cyan-400 group-hover:translate-x-1 transition-transform">View analytics →</div>
            </Link>
            <Link
              href="/marketplace"
              className="group bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 hover:border-amber-500/30 hover:bg-white/[0.05] transition-all duration-300"
            >
              <div className="text-3xl mb-3">🛍️</div>
              <div className="font-bold text-white mb-1 font-display">Marketplace</div>
              <div className="text-sm text-white/50">Browse AI templates &amp; content packs</div>
              <div className="mt-4 text-xs font-mono text-amber-400 group-hover:translate-x-1 transition-transform">Explore →</div>
            </Link>
          </div>
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: '/community',        label: 'Community',        icon: '🤝', color: 'text-purple-400' },
            { href: '/workspace',        label: 'Workspace',        icon: '🗂️', color: 'text-indigo-400' },
            { href: '/regional-network', label: 'Regional Network', icon: '🗺️', color: 'text-emerald-400' },
            { href: '/membership',       label: 'Membership',       icon: '👑', color: 'text-amber-400' },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-200"
            >
              <span className="text-xl">{action.icon}</span>
              <span className={`text-sm font-semibold ${action.color}`}>{action.label}</span>
            </Link>
          ))}
        </div>

        {/* Recent Content */}
        <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.07]">
            <h2 className="font-bold text-white font-display">Recent Content</h2>
            <Link href="/workspace" className="text-xs font-mono text-brand-400 hover:text-brand-300 transition-colors">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-white/[0.05]">
            {content.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.03] transition-colors cursor-pointer group">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white text-sm truncate group-hover:text-brand-300 transition-colors">{item.title}</div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-white/30">
                    <span className={PLATFORM_COLORS[item.platform] ?? 'text-white/40'}>{item.platform}</span>
                    <span>·</span>
                    <span>{item.date}</span>
                    {item.engagement !== '—' && (
                      <>
                        <span>·</span>
                        <span className="text-emerald-400">{item.engagement} views</span>
                      </>
                    )}
                  </div>
                </div>
                <span className={`ml-4 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wide ${
                  item.status === 'published' ? 'bg-emerald-500/10 text-emerald-400' :
                  item.status === 'draft'     ? 'bg-amber-500/10  text-amber-400'   :
                                               'bg-sky-500/10    text-sky-400'
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Presence */}
        <div>
          <h2 className="text-xs font-mono font-semibold text-white/30 uppercase tracking-widest mb-4">Platform Presence</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { name: 'YouTube',   followers: '42.8K', color: '#FF0000', icon: '▶' },
              { name: 'Instagram', followers: '18.3K', color: '#E1306C', icon: '◎' },
              { name: 'LinkedIn',  followers: '9.1K',  color: '#0077B5', icon: 'in' },
              { name: 'Twitter',   followers: '6.7K',  color: '#1DA1F2', icon: '𝕏' },
              { name: 'TikTok',    followers: '31.2K', color: '#00F2EA', icon: '♪' },
              { name: 'Facebook',  followers: '7.4K',  color: '#1877F2', icon: 'f' },
            ].map((p) => (
              <div key={p.name} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 text-center hover:border-white/[0.12] transition-colors">
                <div className="text-lg font-bold mb-1" style={{ color: p.color }}>{p.icon}</div>
                <div className="text-[10px] font-mono text-white/30 mb-1">{p.name}</div>
                <div className="text-sm font-bold text-white">{p.followers}</div>
              </div>
            ))}
          </div>
        </div>
          </>
        )}

      </div>
    </div>
  )
}
