'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

type Platform = 'youtube' | 'instagram' | 'tiktok' | 'twitter' | 'linkedin' | 'blog' | 'podcast'
type EventStatus = 'scheduled' | 'posted' | 'missed'
type ContentPillar = 'educational' | 'entertainment' | 'promotional' | 'personal' | 'bts'

interface CalendarEvent {
  id: string
  userId: string
  title: string
  platform: Platform
  scheduledAt: string
  content?: string
  draftId?: string
  status: EventStatus
  pillar?: ContentPillar
  notifiedMissed?: boolean
  createdAt: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const PLATFORM_CONFIG: Record<Platform, { emoji: string; color: string; bg: string; label: string }> = {
  youtube:   { emoji: '▶️', color: 'text-red-400',    bg: 'bg-red-500/10',    label: 'YouTube'   },
  instagram: { emoji: '📸', color: 'text-pink-400',   bg: 'bg-pink-500/10',   label: 'Instagram' },
  tiktok:    { emoji: '🎵', color: 'text-cyan-400',   bg: 'bg-cyan-500/10',   label: 'TikTok'    },
  twitter:   { emoji: '𝕏',  color: 'text-sky-400',    bg: 'bg-sky-500/10',    label: 'Twitter/X' },
  linkedin:  { emoji: '💼', color: 'text-blue-400',   bg: 'bg-blue-500/10',   label: 'LinkedIn'  },
  blog:      { emoji: '✍️', color: 'text-amber-400',  bg: 'bg-amber-500/10',  label: 'Blog'      },
  podcast:   { emoji: '🎙️', color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'Podcast'   },
}

// Research-backed best posting times for Indian creators (IST)
const BEST_TIMES: Record<Platform, { times: string[]; note: string }> = {
  youtube:   { times: ['7–9 PM', '1–3 PM'], note: 'Peak viewing after work/school' },
  instagram: { times: ['6–8 PM', '12–2 PM'], note: 'Lunch scroll + evening wind-down' },
  tiktok:    { times: ['7–9 PM', '9–11 AM'], note: 'Highest Reels engagement window' },
  twitter:   { times: ['8–10 AM', '5–7 PM'], note: 'Morning commute + end of work day' },
  linkedin:  { times: ['7–9 AM', '12–1 PM'], note: 'Professional hours peak' },
  blog:      { times: ['9–11 AM', '4–6 PM'], note: 'Deep-read sessions' },
  podcast:   { times: ['6–8 AM', '6–8 PM'], note: 'Commute & workout windows' },
}

const PILLAR_CONFIG: Record<ContentPillar, { label: string; emoji: string; color: string; bg: string; hex: string }> = {
  educational:   { label: 'Educational',   emoji: '📚', color: 'text-blue-400',    bg: 'bg-blue-500/15',    hex: '#60a5fa' },
  entertainment: { label: 'Entertainment', emoji: '🎬', color: 'text-pink-400',    bg: 'bg-pink-500/15',    hex: '#f472b6' },
  promotional:   { label: 'Promotional',   emoji: '📢', color: 'text-amber-400',   bg: 'bg-amber-500/15',   hex: '#fbbf24' },
  personal:      { label: 'Personal',      emoji: '🙋', color: 'text-emerald-400', bg: 'bg-emerald-500/15', hex: '#34d399' },
  bts:           { label: 'Behind-Scenes', emoji: '🎥', color: 'text-purple-400',  bg: 'bg-purple-500/15',  hex: '#a78bfa' },
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

const PLATFORM_DOT_COLORS: Record<Platform, string> = {
  youtube: 'bg-red-400', instagram: 'bg-pink-400', tiktok: 'bg-cyan-400',
  twitter: 'bg-sky-400', linkedin: 'bg-blue-400',  blog: 'bg-amber-400', podcast: 'bg-purple-400',
}

function getMonthDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = Array(firstDay).fill(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  return cells
}

function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function eventsByDate(events: CalendarEvent[]): Record<string, CalendarEvent[]> {
  const map: Record<string, CalendarEvent[]> = {}
  events.forEach(e => {
    const key = e.scheduledAt.slice(0, 10)
    if (!map[key]) map[key] = []
    map[key].push(e)
  })
  return map
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const toRad = (deg: number) => (deg - 90) * Math.PI / 180
  const x1 = cx + r * Math.cos(toRad(startAngle))
  const y1 = cy + r * Math.sin(toRad(startAngle))
  const x2 = cx + r * Math.cos(toRad(endAngle))
  const y2 = cy + r * Math.sin(toRad(endAngle))
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`
}

function formatCountdown(date: Date): string {
  const diff = date.getTime() - Date.now()
  if (diff <= 0) return 'Now'
  const h = Math.floor(diff / 3600000)
  const d = Math.floor(h / 24)
  if (d > 0) return `${d}d ${h % 24}h`
  if (h > 0) return `${h}h ${Math.floor((diff % 3600000) / 60000)}m`
  return `${Math.floor(diff / 60000)}m`
}

export default function CalendarPage() {
  const { user, isAuthenticated, hydrated } = useAuth()
  const router = useRouter()

  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [missedEvents, setMissedEvents] = useState<CalendarEvent[]>([])
  const [missedBannerDismissed, setMissedBannerDismissed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [rescheduleId, setRescheduleId] = useState<string | null>(null)
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleTime, setRescheduleTime] = useState('09:00')
  const [now, setNow] = useState(new Date())

  const [newTitle, setNewTitle] = useState('')
  const [newPlatform, setNewPlatform] = useState<Platform>('youtube')
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('09:00')
  const [newContent, setNewContent] = useState('')
  const [newPillar, setNewPillar] = useState<ContentPillar>('educational')
  const [isSaving, setIsSaving] = useState(false)

  // Live countdown ticker
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (hydrated && !isAuthenticated) router.replace('/login')
  }, [hydrated, isAuthenticated, router])

  useEffect(() => {
    if (!user?.id) return
    const fetchData = async () => {
      setLoading(true)
      try {
        const [eventsRes, missedRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/calendar/${user.id}`),
          fetch(`${API_BASE_URL}/api/calendar/missed/${user.id}`),
        ])
        if (eventsRes.ok) {
          const data = await eventsRes.json()
          setEvents(Array.isArray(data) ? data : [])
        }
        if (missedRes.ok) {
          const data = await missedRes.json()
          setMissedEvents(Array.isArray(data) ? data : [])
        }
      } catch { /* graceful */ }
      finally { setLoading(false) }
    }
    fetchData()
  }, [user?.id])

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const cells = getMonthDays(year, month)
  const evMap = eventsByDate(events)
  const todayStr = toDateKey(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
  const selectedEvents = selectedDate ? (evMap[selectedDate] ?? []) : []

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1))

  // ── Streak calculation ──────────────────────────────────────────────────────
  const postedDates = new Set(
    events.filter(e => e.status === 'posted').map(e => e.scheduledAt.slice(0, 10))
  )
  const computeStreak = () => {
    let streak = 0
    const d = new Date()
    while (true) {
      const key = toDateKey(d.getFullYear(), d.getMonth(), d.getDate())
      if (postedDates.has(key)) { streak++; d.setDate(d.getDate() - 1) }
      else break
    }
    return streak
  }
  const currentStreak = computeStreak()

  // ── 30-day heatmap ──────────────────────────────────────────────────────────
  const heatmapDays: { key: string; count: number; isToday: boolean }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    const key = toDateKey(d.getFullYear(), d.getMonth(), d.getDate())
    heatmapDays.push({ key, count: evMap[key]?.filter(e => e.status === 'posted').length ?? 0, isToday: key === todayStr })
  }

  // ── Upcoming 7 days ─────────────────────────────────────────────────────────
  const upcoming7 = events
    .filter(e => e.status === 'scheduled' && new Date(e.scheduledAt) > now)
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 8)

  // ── Content pillar balance ───────────────────────────────────────────────────
  const pillarCounts = (Object.keys(PILLAR_CONFIG) as ContentPillar[]).map(p => ({
    pillar: p,
    count: events.filter(e => e.pillar === p).length,
  }))
  const pillarTotal = pillarCounts.reduce((s, p) => s + p.count, 0)

  const buildPillarPie = () => {
    if (pillarTotal === 0) return []
    let start = 0
    return pillarCounts.filter(p => p.count > 0).map(p => {
      const angle = (p.count / pillarTotal) * 360
      const end = start + angle
      const path = angle >= 359.99
        ? `M 60 5 A 55 55 0 1 1 59.99 5 Z`
        : describeArc(60, 60, 55, start, end)
      const result = { ...p, path }
      start = end
      return result
    })
  }
  const pillarPie = buildPillarPie()

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleMarkPosted = async (eventId: string) => {
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, status: 'posted' as EventStatus } : e))
    try {
      await fetch(`${API_BASE_URL}/api/calendar/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, status: 'posted' }),
      })
    } catch {
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, status: 'scheduled' as EventStatus } : e))
    }
  }

  const handleReschedule = async (eventId: string) => {
    if (!rescheduleDate || !rescheduleTime) return
    const scheduledAt = new Date(`${rescheduleDate}T${rescheduleTime}`).toISOString()
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, status: 'scheduled', scheduledAt } : e))
    setRescheduleId(null)
    try {
      await fetch(`${API_BASE_URL}/api/calendar/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, status: 'scheduled', scheduledAt }),
      })
    } catch { /* silent */ }
  }

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle || !newDate || !newTime || !user?.id) return
    setIsSaving(true)
    const optimistic: CalendarEvent = {
      id: `temp-${Date.now()}`, userId: user.id, title: newTitle,
      platform: newPlatform, pillar: newPillar,
      scheduledAt: new Date(`${newDate}T${newTime}`).toISOString(),
      content: newContent || undefined, status: 'scheduled', createdAt: new Date().toISOString(),
    }
    setEvents(prev => [...prev, optimistic])
    setShowAddModal(false)
    setNewTitle(''); setNewContent('')
    try {
      const res = await fetch(`${API_BASE_URL}/api/calendar/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, title: newTitle, platform: newPlatform,
          pillar: newPillar, scheduledAt: optimistic.scheduledAt, content: newContent || undefined }),
      })
      if (res.ok) {
        const created = await res.json()
        setEvents(prev => prev.map(e => e.id === optimistic.id ? created : e))
      }
    } catch { /* keep optimistic */ }
    finally { setIsSaving(false) }
  }

  const openAddModal = () => {
    setNewDate(selectedDate ?? todayStr)
    setShowAddModal(true)
  }

  // Stats
  const postedCount  = events.filter(e => e.status === 'posted').length
  const missedCount  = events.filter(e => e.status === 'missed').length
  const upcomingCount = events.filter(e => e.status === 'scheduled' && new Date(e.scheduledAt) >= now).length
  const totalCount   = events.length

  if (!hydrated || (!isAuthenticated && hydrated)) return null

  return (
    <div className="min-h-screen bg-[#030712] text-white">

      {/* Missed deadline banner */}
      {missedEvents.length > 0 && !missedBannerDismissed && (
        <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-red-400 text-lg">⚠️</span>
            <p className="text-red-300 text-sm font-medium">
              {missedEvents.length} missed deadline{missedEvents.length > 1 ? 's' : ''}.{' '}
              <span className="text-red-400/70 font-normal">Click a missed post to reschedule.</span>
            </p>
          </div>
          <button onClick={() => setMissedBannerDismissed(true)} className="text-red-400/60 hover:text-red-300 transition-colors text-lg leading-none ml-4">✕</button>
        </div>
      )}

      <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-6">

        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">Content Calendar</h1>
            <p className="text-white/40 text-sm mt-1">Plan, schedule, and track your content across all platforms</p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 shadow-lg shadow-brand-500/20"
          >
            <span className="text-base leading-none">+</span> Schedule Post
          </button>
        </div>

        {/* ── Streak + Heatmap bar ─────────────────────────────────────────── */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 flex flex-wrap items-center gap-6">
          {/* Streak */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-3xl">{currentStreak > 0 ? '🔥' : '💤'}</div>
            <div>
              <p className="text-2xl font-black text-white leading-none">{currentStreak}<span className="text-sm font-normal text-white/40 ml-1">day streak</span></p>
              <p className="text-xs text-white/35 mt-0.5">
                {currentStreak === 0 ? 'Post today to start a streak!' : `Keep it up — post today!`}
              </p>
            </div>
          </div>

          <div className="streak-divider w-px h-10 bg-white/[0.07] flex-shrink-0 hidden sm:block" />

          {/* 30-day heatmap */}
          <div className="flex-1 min-w-0">
            <p className="heatmap-label text-[10px] font-mono text-white/25 uppercase tracking-widest mb-2">Last 30 days</p>
            <div className="flex gap-1 flex-wrap">
              {heatmapDays.map(({ key, count, isToday }) => (
                <div
                  key={key}
                  title={`${key}: ${count} post${count !== 1 ? 's' : ''}`}
                  className={[
                    'w-4 h-4 rounded-sm transition-all cursor-default',
                    isToday ? 'heatmap-today ring-1 ring-white/30' : '',
                    count === 0 ? 'heatmap-cell-empty bg-white/[0.05]'
                    : count === 1 ? 'heatmap-cell-1 bg-brand-500/40'
                    : count === 2 ? 'heatmap-cell-2 bg-brand-500/70'
                    : 'bg-brand-500',
                  ].join(' ')}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="heatmap-label text-[9px] text-white/20">Less</span>
              <span className="heatmap-cell-empty heatmap-legend-empty w-3 h-3 rounded-sm bg-white/[0.05]" />
              <span className="heatmap-cell-1 w-3 h-3 rounded-sm bg-brand-500/40" />
              <span className="heatmap-cell-2 w-3 h-3 rounded-sm bg-brand-500/70" />
              <span className="w-3 h-3 rounded-sm bg-brand-500" />
              <span className="heatmap-label text-[9px] text-white/20">More</span>
            </div>
          </div>

          {/* Quick stats pills */}
          <div className="flex gap-2 flex-shrink-0 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="text-xs text-green-400 font-medium">{postedCount} posted</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
              <span className="text-xs text-brand-400 font-medium">{upcomingCount} upcoming</span>
            </div>
            {missedCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                <span className="text-xs text-red-400 font-medium">{missedCount} missed</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Main grid ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT: Calendar */}
          <div className="lg:col-span-2 bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-6">
              <button onClick={prevMonth} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.07] text-white/60 hover:text-white transition-all duration-200 text-lg">‹</button>
              <h2 className="text-lg font-semibold text-white">{MONTH_NAMES[month]} {year}</h2>
              <button onClick={nextMonth} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.07] text-white/60 hover:text-white transition-all duration-200 text-lg">›</button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-2">
              {DAY_NAMES.map(d => (
                <div key={d} className="text-center text-xs font-medium text-white/30 py-2">{d}</div>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, idx) => {
                if (day === null) return <div key={`empty-${idx}`} />
                const dateKey = toDateKey(year, month, day)
                const dayEvents = evMap[dateKey] ?? []
                const isToday = dateKey === todayStr
                const isSelected = dateKey === selectedDate
                const hasMissed = dayEvents.some(e => e.status === 'missed')

                return (
                  <button
                    key={dateKey}
                    onClick={() => setSelectedDate(isSelected ? null : dateKey)}
                    className={[
                      'relative flex flex-col items-center py-2 px-1 rounded-xl transition-all duration-200 min-h-[56px] group',
                      isSelected ? 'bg-brand-500/20 border border-brand-500/40'
                      : isToday  ? 'bg-white/[0.05] border border-white/[0.1]'
                      : hasMissed ? 'hover:bg-red-500/5 border border-transparent hover:border-red-500/20'
                      : 'hover:bg-white/[0.05] border border-transparent',
                    ].join(' ')}
                  >
                    <span className={[
                      'text-sm font-medium leading-none mb-1.5',
                      isToday    ? 'w-7 h-7 flex items-center justify-center rounded-full bg-brand-500 text-white ring-2 ring-brand-500 ring-offset-2 ring-offset-[#030712]'
                      : isSelected ? 'text-brand-400'
                      : 'text-white/70 group-hover:text-white',
                    ].join(' ')}>
                      {day}
                    </span>
                    {dayEvents.length > 0 && (
                      <div className="flex gap-0.5 flex-wrap justify-center max-w-[40px]">
                        {dayEvents.slice(0, 3).map((ev, i) => (
                          <span key={ev.id ?? i} className={[
                            'w-1.5 h-1.5 rounded-full',
                            ev.status === 'missed'  ? 'bg-red-400'
                            : ev.status === 'posted' ? 'bg-green-400'
                            : PLATFORM_DOT_COLORS[ev.platform] ?? 'bg-white/40',
                          ].join(' ')} />
                        ))}
                        {dayEvents.length > 3 && <span className="text-[9px] text-white/30 leading-none">+{dayEvents.length - 3}</span>}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/[0.06]">
              <div className="flex items-center gap-1.5 text-xs text-white/40"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> Posted</div>
              <div className="flex items-center gap-1.5 text-xs text-white/40"><span className="w-2 h-2 rounded-full bg-brand-500 inline-block" /> Scheduled</div>
              <div className="flex items-center gap-1.5 text-xs text-white/40"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Missed</div>
            </div>
          </div>

          {/* RIGHT: Contextual panel */}
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 flex flex-col gap-4 overflow-y-auto max-h-[600px]">

            {selectedDate ? (
              /* ── Selected date detail ── */
              <>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white text-sm">
                    {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </h3>
                  <button onClick={openAddModal} className="text-xs text-brand-400 hover:text-brand-300 transition-colors font-medium">+ Add</button>
                </div>

                {selectedEvents.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
                    <div className="text-4xl mb-3">📭</div>
                    <p className="text-white/40 text-sm">No posts scheduled</p>
                    <button onClick={openAddModal} className="mt-3 text-xs text-brand-400 hover:text-brand-300 underline transition-colors">Schedule a post</button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedEvents.map(ev => {
                      const cfg = PLATFORM_CONFIG[ev.platform]
                      const time = new Date(ev.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                      const isRescheduling = rescheduleId === ev.id
                      return (
                        <div key={ev.id} className={[
                          'rounded-xl p-3 border transition-all duration-200',
                          ev.status === 'missed'  ? 'bg-red-500/5 border-red-500/40'
                          : ev.status === 'posted' ? 'bg-green-500/5 border-green-500/20'
                          : 'bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.05]',
                        ].join(' ')}>
                          <div className="flex items-start gap-2.5">
                            <span className={`text-base w-8 h-8 flex items-center justify-center rounded-lg ${cfg.bg} flex-shrink-0`}>{cfg.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">{ev.title}</p>
                              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                <span className={`text-xs ${cfg.color}`}>{cfg.label}</span>
                                <span className="text-white/20">·</span>
                                <span className="text-xs text-white/40">{time}</span>
                                {ev.pillar && (
                                  <>
                                    <span className="text-white/20">·</span>
                                    <span className={`text-xs ${PILLAR_CONFIG[ev.pillar].color}`}>{PILLAR_CONFIG[ev.pillar].emoji} {PILLAR_CONFIG[ev.pillar].label}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-2.5 gap-2">
                            {ev.status === 'missed' && <span className="inline-flex items-center gap-1 text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20 animate-pulse font-medium">⚠ Missed</span>}
                            {ev.status === 'posted' && <span className="inline-flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20 font-medium">✓ Posted</span>}
                            {ev.status === 'scheduled' && <span className="inline-flex items-center gap-1 text-xs text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full border border-brand-500/20 font-medium">🕐 Scheduled</span>}
                            <div className="flex gap-2 ml-auto">
                              {ev.status === 'missed' && !isRescheduling && (
                                <button onClick={() => { setRescheduleId(ev.id); setRescheduleDate(todayStr); setRescheduleTime('09:00') }} className="text-xs text-amber-400 hover:text-amber-300 transition-colors">Reschedule</button>
                              )}
                              {ev.status !== 'posted' && !isRescheduling && (
                                <button onClick={() => handleMarkPosted(ev.id)} className="text-xs text-white/40 hover:text-green-400 transition-colors">Mark Posted →</button>
                              )}
                            </div>
                          </div>

                          {/* Inline reschedule picker */}
                          {isRescheduling && (
                            <div className="mt-3 pt-3 border-t border-white/[0.07] space-y-2">
                              <p className="text-xs text-white/40 font-medium">Pick a new date & time</p>
                              <div className="flex gap-2">
                                <input type="date" value={rescheduleDate} onChange={e => setRescheduleDate(e.target.value)}
                                  className="flex-1 bg-white/[0.05] border border-white/[0.1] rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500/50 [color-scheme:dark]" />
                                <input type="time" value={rescheduleTime} onChange={e => setRescheduleTime(e.target.value)}
                                  className="w-24 bg-white/[0.05] border border-white/[0.1] rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500/50 [color-scheme:dark]" />
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => setRescheduleId(null)} className="flex-1 py-1 text-xs text-white/40 hover:text-white border border-white/[0.07] rounded-lg transition-colors">Cancel</button>
                                <button onClick={() => handleReschedule(ev.id)} className="flex-1 py-1 text-xs text-amber-400 border border-amber-500/30 rounded-lg hover:bg-amber-500/10 transition-colors font-medium">Confirm</button>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Best time to post for platforms used on this day */}
                {selectedEvents.length > 0 && (
                  <div className="pt-3 border-t border-white/[0.06]">
                    <p className="text-[10px] font-mono text-white/25 uppercase tracking-widest mb-3">⏰ Best times (IST)</p>
                    <div className="space-y-2">
                      {[...new Set(selectedEvents.map(e => e.platform))].map(platform => {
                        const bt = BEST_TIMES[platform]
                        const cfg = PLATFORM_CONFIG[platform]
                        return (
                          <div key={platform} className="flex items-start gap-2">
                            <span className={`text-sm w-6 h-6 flex items-center justify-center rounded-md ${cfg.bg} flex-shrink-0 mt-0.5`}>{cfg.emoji}</span>
                            <div>
                              <div className="flex gap-1.5 flex-wrap">
                                {bt.times.map(t => (
                                  <span key={t} className={`text-xs font-medium ${cfg.color} bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.07]`}>{t}</span>
                                ))}
                              </div>
                              <p className="text-[10px] text-white/25 mt-0.5">{bt.note}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* ── No date selected: upcoming countdown ── */
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">Upcoming Posts</p>
                  <span className="text-[10px] font-mono text-white/25 uppercase tracking-widest">Next up</span>
                </div>

                {upcoming7.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
                    <div className="text-5xl mb-4">📅</div>
                    <p className="text-white/50 font-medium">Nothing scheduled</p>
                    <p className="text-white/30 text-sm mt-1">Click a date or schedule a post</p>
                    <button onClick={openAddModal} className="mt-4 text-xs text-brand-400 hover:text-brand-300 underline transition-colors">+ Schedule your first post</button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {upcoming7.map(ev => {
                      const cfg = PLATFORM_CONFIG[ev.platform]
                      const evDate = new Date(ev.scheduledAt)
                      const countdown = formatCountdown(evDate)
                      const isToday2 = ev.scheduledAt.slice(0, 10) === todayStr
                      return (
                        <div key={ev.id} onClick={() => setSelectedDate(ev.scheduledAt.slice(0, 10))}
                          className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] cursor-pointer transition-all group">
                          <span className={`text-sm w-8 h-8 flex items-center justify-center rounded-lg ${cfg.bg} flex-shrink-0`}>{cfg.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-white truncate">{ev.title}</p>
                            <p className="text-[10px] text-white/35 mt-0.5">
                              {isToday2 ? 'Today' : evDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                              {' · '}{evDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <span className={`text-[10px] font-mono font-semibold flex-shrink-0 ${isToday2 ? 'text-amber-400' : 'text-white/30'}`}>{countdown}</span>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Best time tips (generic) */}
                <div className="pt-3 border-t border-white/[0.06]">
                  <p className="text-[10px] font-mono text-white/25 uppercase tracking-widest mb-3">⏰ Best times to post (IST)</p>
                  <div className="grid grid-cols-1 gap-1.5">
                    {(['youtube','instagram','tiktok'] as Platform[]).map(platform => {
                      const bt = BEST_TIMES[platform]
                      const cfg = PLATFORM_CONFIG[platform]
                      return (
                        <div key={platform} className="flex items-center gap-2">
                          <span className="text-sm">{cfg.emoji}</span>
                          <span className={`text-xs ${cfg.color} font-medium w-20 shrink-0`}>{cfg.label}</span>
                          <div className="flex gap-1 flex-wrap">
                            {bt.times.map(t => <span key={t} className="text-[10px] text-white/40 bg-white/[0.04] px-1.5 py-0.5 rounded">{t}</span>)}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Bottom stats row ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Post status donut */}
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 flex items-center gap-8">
            <div className="flex-shrink-0">
              <svg width="160" height="160" viewBox="0 0 160 160">
                {loading ? (
                  <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="20" />
                ) : totalCount === 0 ? (
                  <circle cx="80" cy="80" r="70" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
                ) : (
                  [
                    { count: postedCount,   color: '#22c55e' },
                    { count: missedCount,   color: '#ef4444' },
                    { count: upcomingCount, color: '#6366f1' },
                  ].filter(s => s.count > 0).reduce<{ segs: React.ReactNode[]; start: number }>((acc, seg) => {
                    const angle = (seg.count / totalCount) * 360
                    const end = acc.start + angle
                    const path = angle >= 359.99 ? `M 80 10 A 70 70 0 1 1 79.99 10 Z` : describeArc(80, 80, 70, acc.start, end)
                    acc.segs.push(<path key={seg.color} d={path} fill={seg.color} opacity={0.85} />)
                    acc.start = end
                    return acc
                  }, { segs: [], start: 0 }).segs
                )}
                <circle cx="80" cy="80" r="46" fill="#030712" className="chart-inner-fill" />
                <text x="80" y="76" textAnchor="middle" fill="white" fontSize="22" fontWeight="700">{totalCount}</text>
                <text x="80" y="93" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="10">total</text>
              </svg>
            </div>
            <div className="flex-1 space-y-3">
              {[
                { label: 'Posted',   count: postedCount,   color: '#22c55e' },
                { label: 'Missed',   count: missedCount,   color: '#ef4444' },
                { label: 'Upcoming', count: upcomingCount, color: '#6366f1' },
              ].map(seg => (
                <div key={seg.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
                    <span className="text-sm text-white/60">{seg.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-white">{seg.count}</span>
                </div>
              ))}
              <div className="pt-3 border-t border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/40">Total scheduled</span>
                  <span className="text-sm font-semibold text-white">{totalCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content pillar balance */}
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 flex items-center gap-6">
            <div className="flex-shrink-0">
              <svg width="120" height="120" viewBox="0 0 120 120">
                {pillarTotal === 0 ? (
                  <>
                    <circle cx="60" cy="60" r="55" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
                    <circle cx="60" cy="60" r="34" fill="#030712" className="chart-inner-fill" />
                    <text x="60" y="64" textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="9">no data</text>
                  </>
                ) : (
                  <>
                    {pillarPie.map((seg, i) => (
                      <path key={i} d={seg.path} fill={PILLAR_CONFIG[seg.pillar].hex} opacity={0.85} />
                    ))}
                    <circle cx="60" cy="60" r="34" fill="#030712" className="chart-inner-fill" />
                    <text x="60" y="56" textAnchor="middle" fill="white" fontSize="16" fontWeight="700">{pillarTotal}</text>
                    <text x="60" y="70" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="8">posts</text>
                  </>
                )}
              </svg>
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-xs font-mono text-white/25 uppercase tracking-widest mb-3">Content Pillars</p>
              {pillarCounts.map(({ pillar, count }) => {
                const cfg = PILLAR_CONFIG[pillar]
                const pct = pillarTotal > 0 ? Math.round((count / pillarTotal) * 100) : 0
                return (
                  <div key={pillar}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs text-white/55 flex items-center gap-1">{cfg.emoji} {cfg.label}</span>
                      <span className="text-xs font-semibold text-white">{count}</span>
                    </div>
                    <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: cfg.hex }} />
                    </div>
                  </div>
                )
              })}
              {pillarTotal === 0 && <p className="text-xs text-white/25 text-center py-2">Add content pillar tags when scheduling posts</p>}
            </div>
          </div>
        </div>
      </div>

      {/* ── Add Event Modal ──────────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative modal-bg bg-[#0d1117] border border-white/[0.1] rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-white">Schedule a Post</h2>
              <button onClick={() => setShowAddModal(false)} className="text-white/40 hover:text-white transition-colors text-xl leading-none">✕</button>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Title</label>
                <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Post title or topic" required
                  className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand-500/50 focus:bg-white/[0.07] transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Platform</label>
                  <select value={newPlatform} onChange={e => setNewPlatform(e.target.value as Platform)}
                    className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500/50 transition-all appearance-none">
                    {(Object.keys(PLATFORM_CONFIG) as Platform[]).map(p => (
                      <option key={p} value={p} className="bg-[#0d1117]">{PLATFORM_CONFIG[p].emoji} {PLATFORM_CONFIG[p].label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Content Pillar</label>
                  <select value={newPillar} onChange={e => setNewPillar(e.target.value as ContentPillar)}
                    className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500/50 transition-all appearance-none">
                    {(Object.keys(PILLAR_CONFIG) as ContentPillar[]).map(p => (
                      <option key={p} value={p} className="bg-[#0d1117]">{PILLAR_CONFIG[p].emoji} {PILLAR_CONFIG[p].label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Date</label>
                  <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} required
                    className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500/50 transition-all [color-scheme:dark]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Time</label>
                  <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} required
                    className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500/50 transition-all [color-scheme:dark]" />
                </div>
              </div>

              {/* Best time suggestion */}
              <div className="flex items-center gap-2 px-3 py-2 bg-brand-500/5 border border-brand-500/15 rounded-xl">
                <span className="text-sm">⏰</span>
                <p className="text-xs text-white/45">
                  <span className="text-brand-400 font-medium">Best time for {PLATFORM_CONFIG[newPlatform].label}:</span>{' '}
                  {BEST_TIMES[newPlatform].times.join(' or ')} IST
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Notes <span className="text-white/20">(optional)</span></label>
                <textarea value={newContent} onChange={e => setNewContent(e.target.value)} placeholder="Brief content outline or ideas..." rows={2}
                  className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand-500/50 focus:bg-white/[0.07] transition-all resize-none" />
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-white/[0.1] text-sm text-white/60 hover:text-white hover:border-white/[0.2] transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSaving ? 'Saving...' : 'Schedule Post'}
                </button>
              </div>
            </form>
          </div>
        </div>

      )}
    </div>
  )
}
