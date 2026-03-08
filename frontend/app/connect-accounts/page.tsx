'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlatformStatus {
  connected: boolean
  loading: boolean
  configured: boolean
  stats: any
  error?: string
  fetchedAt?: string
}

interface SetupInfo {
  vars: string[]
  steps: string[]
}

// ─── Platform display config ──────────────────────────────────────────────────

const PLATFORMS = [
  {
    id: 'youtube',
    label: 'YouTube',
    icon: '▶',
    color: 'from-red-600/20 to-red-800/10 border-red-600/30',
    badge: 'bg-red-500',
    description: 'Real OAuth — channel subscribers, views, engagement & recent videos',
    route: 'youtube',  // uses /youtube-oauth/* route
  },
  {
    id: 'instagram',
    label: 'Instagram',
    icon: '◎',
    color: 'from-pink-600/20 to-purple-800/10 border-pink-500/30',
    badge: 'bg-pink-500',
    description: 'Followers, reach, impressions & recent posts (Business/Creator account required)',
    route: 'social',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: 'in',
    color: 'from-blue-600/20 to-blue-800/10 border-blue-500/30',
    badge: 'bg-blue-600',
    description: 'Profile connections and post engagement data',
    route: 'social',
  },
  {
    id: 'twitter',
    label: 'Twitter / X',
    icon: '𝕏',
    color: 'from-slate-600/20 to-slate-800/10 border-slate-500/30',
    badge: 'bg-slate-700',
    description: 'Followers, tweet impressions and recent engagement stats',
    route: 'social',
  },
]

function formatNum(n: number): string {
  if (!n) return '0'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function ConnectAccountsInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated, hydrated } = useAuth()

  const [statuses, setStatuses] = useState<Record<string, PlatformStatus>>({
    youtube:   { connected: false, loading: false, configured: true, stats: null },
    instagram: { connected: false, loading: false, configured: true, stats: null },
    linkedin:  { connected: false, loading: false, configured: true, stats: null },
    twitter:   { connected: false, loading: false, configured: true, stats: null },
  })
  const [setup, setSetup] = useState<Record<string, SetupInfo | null>>({})
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 4000)
  }

  const setStatus = (platform: string, patch: Partial<PlatformStatus>) =>
    setStatuses(prev => ({ ...prev, [platform]: { ...prev[platform], ...patch } }))

  // ── Auth guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!hydrated) return
    if (!isAuthenticated) router.replace('/login')
  }, [hydrated, isAuthenticated, router])

  // ── Handle OAuth callback params ────────────────────────────────────────────
  useEffect(() => {
    const platforms = ['youtube', 'instagram', 'linkedin', 'twitter']
    for (const p of platforms) {
      const result = searchParams?.get(p)
      if (result === 'connected') {
        showToast(`✅ ${p.charAt(0).toUpperCase() + p.slice(1)} connected!`)
        fetchStats(p)
      } else if (result === 'denied') {
        showToast(`${p} connection cancelled.`)
      } else if (result === 'error') {
        showToast(`⚠️ ${p} connection failed. Check credentials.`)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // ── Load all stats on mount ──────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return
    for (const p of PLATFORMS) fetchStats(p.id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  // ── Fetch stats for a single platform ───────────────────────────────────────
  const fetchStats = useCallback(async (platform: string) => {
    if (!user?.id) return
    setStatus(platform, { loading: true })
    try {
      const route = platform === 'youtube' ? 'youtube-oauth' : 'social-oauth'
      const url = platform === 'youtube'
        ? `${API}/api/youtube-oauth/stats/${user.id}`
        : `${API}/api/social-oauth/stats/${platform}/${user.id}`

      const res = await fetch(url)
      const data = await res.json()
      setStatus(platform, {
        connected: data.connected,
        stats: data.connected ? data : null,
        error: data.error,
        fetchedAt: data.fetchedAt,
        loading: false,
      })
    } catch {
      setStatus(platform, { loading: false, error: 'Network error' })
    }
  }, [user?.id])

  // ── Connect a platform ───────────────────────────────────────────────────────
  const handleConnect = async (platform: string) => {
    if (!user?.id) return
    setStatus(platform, { loading: true })
    try {
      const url = platform === 'youtube'
        ? `${API}/api/youtube-oauth/auth-url?userId=${user.id}`
        : `${API}/api/social-oauth/auth-url?platform=${platform}&userId=${user.id}`

      const res = await fetch(url)
      const data = await res.json()

      if (!data.configured) {
        setSetup(prev => ({ ...prev, [platform]: data.setup }))
        setStatus(platform, { configured: false, loading: false })
        return
      }
      // Redirect to OAuth
      window.location.href = data.url
    } catch {
      setStatus(platform, { loading: false, error: 'Failed to start connection' })
    }
  }

  // ── Disconnect ───────────────────────────────────────────────────────────────
  const handleDisconnect = async (platform: string) => {
    if (!user?.id) return
    const url = platform === 'youtube'
      ? `${API}/api/youtube-oauth/disconnect/${user.id}`
      : `${API}/api/social-oauth/disconnect/${platform}/${user.id}`
    await fetch(url, { method: 'DELETE' })
    setStatus(platform, { connected: false, stats: null, configured: true })
    showToast(`${platform} disconnected.`)
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_10%,rgba(99,102,241,0.07),transparent_60%)] pointer-events-none" />

      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-white/10 border border-white/20 backdrop-blur-sm rounded-xl px-5 py-3 text-sm font-medium shadow-2xl">
          {toast}
        </div>
      )}

      <div className="relative max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10">
          <Link href="/analytics" className="text-white/30 hover:text-white/60 text-sm transition-colors mb-4 inline-block">
            ← Back to Analytics
          </Link>
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
            <span className="text-[10px] font-mono font-semibold text-brand-400 uppercase tracking-widest">Real-time Analytics</span>
          </div>
          <h1 className="text-4xl font-black font-display text-white mb-2">Connect Your Accounts</h1>
          <p className="text-white/40 text-sm max-w-lg">
            Connect each platform via OAuth to pull live follower counts, engagement and post stats directly into your analytics dashboard.
          </p>
        </div>

        {/* Platform cards */}
        <div className="space-y-5">
          {PLATFORMS.map(p => {
            const s = statuses[p.id]
            const setupInfo = setup[p.id]

            return (
              <div key={p.id} className={`bg-gradient-to-br ${p.color} rounded-2xl p-6`}>
                {/* Card header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl ${p.badge}/20 flex items-center justify-center font-bold text-base`}>
                    {p.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-white">{p.label}</div>
                    <div className="text-[11px] text-white/35">{p.description}</div>
                  </div>
                  {/* Status badge */}
                  {s.connected ? (
                    <span className="flex items-center gap-1.5 text-xs font-mono text-green-400 bg-green-400/10 border border-green-400/20 px-3 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Live
                    </span>
                  ) : (
                    <span className="text-xs font-mono text-white/20">Not connected</span>
                  )}
                </div>

                {/* Stats display */}
                {s.connected && s.stats && <PlatformStats platform={p.id} stats={s.stats} />}

                {/* Error message */}
                {s.error && !s.connected && (
                  <div className="mb-3 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2">
                    ⚠️ {s.error}
                  </div>
                )}

                {/* Setup instructions */}
                {!s.configured && setupInfo && (
                  <div className="mb-4 bg-black/30 border border-white/10 rounded-xl p-4 text-xs">
                    <div className="font-semibold text-amber-400 mb-2">⚙️ Add these to your .env:</div>
                    <pre className="text-white/60 mb-3 font-mono">{setupInfo.vars.map(v => `${v}=your_value`).join('\n')}</pre>
                    <div className="font-semibold text-white/50 mb-1">Setup steps:</div>
                    <ol className="text-white/40 space-y-0.5">
                      {setupInfo.steps.map((step, i) => <li key={i}>{step}</li>)}
                    </ol>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex items-center gap-3 mt-3">
                  {!s.connected ? (
                    <button
                      onClick={() => handleConnect(p.id)}
                      disabled={s.loading}
                      className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all"
                    >
                      {s.loading
                        ? <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        : p.icon}
                      Connect {p.label}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => fetchStats(p.id)}
                        disabled={s.loading}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition-all"
                      >
                        {s.loading
                          ? <span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          : '↻'}
                        Refresh
                      </button>
                      {s.fetchedAt && (
                        <span className="text-[10px] text-white/25 font-mono">
                          Updated {new Date(s.fetchedAt).toLocaleTimeString()}
                        </span>
                      )}
                      <button
                        onClick={() => handleDisconnect(p.id)}
                        className="ml-auto text-xs text-red-400/40 hover:text-red-400 transition-colors"
                      >
                        Disconnect
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/analytics"
            className="inline-flex items-center gap-2 px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-brand-500/20"
          >
            View Analytics Dashboard →
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function ConnectAccountsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#030712]" />}>
      <ConnectAccountsInner />
    </Suspense>
  )
}

// ─── Per-platform stats renderer ─────────────────────────────────────────────

function PlatformStats({ platform, stats }: { platform: string; stats: any }) {
  if (platform === 'youtube') {
    const s = stats.stats
    if (!s) return null
    return (
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-4 bg-white/[0.03] border border-white/[0.07] rounded-xl p-3">
          {stats.channelThumb && <img src={stats.channelThumb} alt="" className="w-9 h-9 rounded-full" />}
          <div>
            <div className="font-bold text-sm text-white">{stats.channelName}</div>
            <div className="text-[10px] text-white/30 font-mono">youtube.com/channel/{stats.channelId}</div>
          </div>
        </div>
        <StatGrid items={[
          { label: 'Subscribers', value: formatNum(s.subscribers) },
          { label: 'Total Views', value: formatNum(s.totalViews) },
          { label: 'Videos', value: formatNum(s.videoCount) },
          { label: 'Avg Engagement', value: `${s.avgEngagement}%` },
        ]} />
        {s.recentVideos?.slice(0, 3).map((v: any) => (
          <div key={v.id} className="flex items-center gap-3 bg-white/[0.02] rounded-xl p-2 mb-1 mt-2">
            {v.thumb && <img src={v.thumb} alt="" className="w-12 h-8 rounded object-cover" />}
            <div className="flex-1 min-w-0">
              <div className="text-xs text-white truncate">{v.title}</div>
              <div className="text-[10px] text-white/30">{new Date(v.publishedAt).toLocaleDateString()}</div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (platform === 'instagram') {
    return (
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-4 bg-white/[0.03] border border-white/[0.07] rounded-xl p-3">
          {stats.profilePicture && <img src={stats.profilePicture} alt="" className="w-9 h-9 rounded-full" />}
          <div>
            <div className="font-bold text-sm text-white">@{stats.username}</div>
            <div className="text-[10px] text-white/30 font-mono">instagram.com/{stats.username}</div>
          </div>
        </div>
        <StatGrid items={[
          { label: 'Followers', value: formatNum(stats.followers) },
          { label: 'Posts', value: formatNum(stats.mediaCount) },
          { label: '30d Reach', value: formatNum(stats.reach30d) },
          { label: '30d Impressions', value: formatNum(stats.impressions30d) },
        ]} />
      </div>
    )
  }

  if (platform === 'linkedin') {
    return (
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-4 bg-white/[0.03] border border-white/[0.07] rounded-xl p-3">
          {stats.profilePicture && <img src={stats.profilePicture} alt="" className="w-9 h-9 rounded-full" />}
          <div>
            <div className="font-bold text-sm text-white">{stats.name}</div>
            <div className="text-[10px] text-white/30 font-mono">LinkedIn Profile</div>
          </div>
        </div>
        <StatGrid items={[
          { label: 'Connections', value: formatNum(stats.connections) },
          { label: 'Profile ID', value: stats.profileId?.substring(0, 8) + '…' },
        ]} />
        {stats.note && <div className="mt-2 text-[11px] text-white/30 italic">{stats.note}</div>}
      </div>
    )
  }

  if (platform === 'twitter') {
    return (
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-4 bg-white/[0.03] border border-white/[0.07] rounded-xl p-3">
          {stats.profilePicture && <img src={stats.profilePicture} alt="" className="w-9 h-9 rounded-full" />}
          <div>
            <div className="font-bold text-sm text-white">{stats.name}</div>
            <div className="text-[10px] text-white/30 font-mono">@{stats.username}</div>
          </div>
        </div>
        <StatGrid items={[
          { label: 'Followers', value: formatNum(stats.followers) },
          { label: 'Following', value: formatNum(stats.following) },
          { label: 'Total Tweets', value: formatNum(stats.tweets) },
        ]} />
        {stats.recentTweets?.slice(0, 2).map((t: any) => (
          <div key={t.id} className="bg-white/[0.02] rounded-xl p-3 mt-2 text-xs">
            <div className="text-white/70 mb-2 line-clamp-2">{t.text}</div>
            <div className="flex gap-4 text-white/30 font-mono">
              <span>❤ {t.likes}</span>
              <span>🔁 {t.retweets}</span>
              <span>👁 {t.impressions || '—'}</span>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return null
}

function StatGrid({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className={`grid gap-2 mb-2 ${items.length <= 2 ? 'grid-cols-2' : 'grid-cols-4'}`}>
      {items.map(item => (
        <div key={item.label} className="bg-white/[0.04] rounded-xl p-3 text-center">
          <div className="text-lg font-black font-display text-white">{item.value}</div>
          <div className="text-[10px] text-white/30 font-mono mt-0.5">{item.label}</div>
        </div>
      ))}
    </div>
  )
}

