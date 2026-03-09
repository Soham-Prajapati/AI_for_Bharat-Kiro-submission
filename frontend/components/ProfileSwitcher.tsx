'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'

const DOMAIN_LABELS: Record<string, string> = {
  food:          '🍳 Food & Cooking',
  education:     '📚 Education',
  travel:        '✈️ Travel & Adventure',
  product:       '📦 Product Reviews',
  entertainment: '🎬 Entertainment',
  technology:    '💻 Technology',
  health:        '💪 Health & Fitness',
  business:      '📈 Business & Finance',
}

const AUDIENCE_LABELS: Record<string, string> = {
  beginners:    '🌱 Beginners',
  intermediate: '🔥 Intermediate',
  expert:       '🧠 Expert',
  general:      '🌍 General Public',
  youth:        '⚡ Youth (13–25)',
  professional: '💼 Professional',
}

const CREATOR_MODE_META: Record<string, {
  label: string; emoji: string; desc: string
  color: string; border: string; bg: string
}> = {
  'ai-first':    { label: 'AI-First',    emoji: '🤖', desc: 'Full automation',  color: 'text-purple-400',  border: 'border-purple-500/20',  bg: 'bg-purple-500/10'  },
  'hybrid':      { label: 'Hybrid',      emoji: '🤝', desc: 'AI-assisted',      color: 'text-pink-400',    border: 'border-pink-500/20',    bg: 'bg-pink-500/10'    },
  'human-first': { label: 'Human-First', emoji: '👤', desc: 'Creative control', color: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/10' },
}

interface Props {
  /** Show a compact single-row layout (default: false = stacked pill row) */
  compact?: boolean
}

export default function ProfileSwitcher({ compact = false }: Props) {
  const { user, saveProfile } = useAuth()

  const [showDomainPicker,   setShowDomainPicker]   = useState(false)
  const [showAudiencePicker, setShowAudiencePicker] = useState(false)
  const [showModePicker,     setShowModePicker]     = useState(false)
  const [saving, setSaving] = useState(false)

  const closeAll = () => {
    setShowDomainPicker(false)
    setShowAudiencePicker(false)
    setShowModePicker(false)
  }

  useEffect(() => {
    document.addEventListener('click', closeAll)
    return () => document.removeEventListener('click', closeAll)
  }, [])

  const switchDomain = async (v: string) => {
    setSaving(true); closeAll()
    await saveProfile({ domain: v, audienceType: user?.audienceType, creatorMode: user?.creatorMode })
    setSaving(false)
  }
  const switchAudience = async (v: string) => {
    setSaving(true); closeAll()
    await saveProfile({ domain: user?.domain, audienceType: v, creatorMode: user?.creatorMode })
    setSaving(false)
  }
  const switchMode = async (v: string) => {
    setSaving(true); closeAll()
    await saveProfile({ domain: user?.domain, audienceType: user?.audienceType, creatorMode: v })
    setSaving(false)
  }

  const domainLabel   = user?.domain      ? DOMAIN_LABELS[user.domain]      : null
  const audienceLabel = user?.audienceType? AUDIENCE_LABELS[user.audienceType]: null
  const modeMeta      = user?.creatorMode ? CREATOR_MODE_META[user.creatorMode]: null

  return (
    <div className={`flex items-center gap-2 flex-wrap ${compact ? '' : ''}`} onClick={e => e.stopPropagation()}>

      {/* ── Domain ─────────────────────────────────────────────────── */}
      <div className="relative">
        <button
          onClick={e => { e.stopPropagation(); setShowDomainPicker(v => !v); setShowAudiencePicker(false); setShowModePicker(false) }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 hover:border-cyan-500/40 hover:bg-cyan-500/15 transition-all cursor-pointer"
        >
          <span className="text-[10px] font-mono font-semibold text-cyan-400 uppercase tracking-widest">
            {saving ? '…' : (domainLabel || '＋ Set Domain')}
          </span>
          <span className="text-cyan-400/60 text-[10px]">▾</span>
        </button>

        {showDomainPicker && (
          <div onClick={e => e.stopPropagation()} className="absolute left-0 top-full mt-2 z-[100] bg-[#0d1117] border border-white/[0.12] rounded-2xl shadow-2xl shadow-black/40 p-1.5 min-w-[210px]">
            <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest px-3 pt-2 pb-1">Switch Content Domain</p>
            {Object.entries(DOMAIN_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => switchDomain(key)}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors flex items-center gap-2 ${
                  user?.domain === key
                    ? 'bg-cyan-500/15 text-cyan-400'
                    : 'text-white/70 hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                {user?.domain === key && <span className="text-cyan-400 text-xs">✓</span>}
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Audience ───────────────────────────────────────────────── */}
      <div className="relative">
        <button
          onClick={e => { e.stopPropagation(); setShowAudiencePicker(v => !v); setShowDomainPicker(false); setShowModePicker(false) }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 hover:border-violet-500/40 hover:bg-violet-500/15 transition-all cursor-pointer"
        >
          <span className="text-[10px] font-mono font-semibold text-violet-400 uppercase tracking-widest">
            {saving ? '…' : (audienceLabel || '＋ Set Audience')}
          </span>
          <span className="text-violet-400/60 text-[10px]">▾</span>
        </button>

        {showAudiencePicker && (
          <div onClick={e => e.stopPropagation()} className="absolute left-0 top-full mt-2 z-[100] bg-[#0d1117] border border-white/[0.12] rounded-2xl shadow-2xl shadow-black/40 p-1.5 min-w-[200px]">
            <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest px-3 pt-2 pb-1">Switch Target Audience</p>
            {Object.entries(AUDIENCE_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => switchAudience(key)}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors flex items-center gap-2 ${
                  user?.audienceType === key
                    ? 'bg-violet-500/15 text-violet-400'
                    : 'text-white/70 hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                {user?.audienceType === key && <span className="text-violet-400 text-xs">✓</span>}
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Creator Mode ───────────────────────────────────────────── */}
      <div className="relative">
        <button
          onClick={e => { e.stopPropagation(); setShowModePicker(v => !v); setShowDomainPicker(false); setShowAudiencePicker(false) }}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all cursor-pointer hover:opacity-90 ${
            modeMeta
              ? `${modeMeta.bg} ${modeMeta.border}`
              : 'bg-white/[0.04] border-white/[0.12] hover:border-white/[0.20]'
          }`}
        >
          <span className={`text-[10px] font-mono font-semibold uppercase tracking-widest ${modeMeta?.color || 'text-white/50'}`}>
            {saving ? '…' : modeMeta ? `${modeMeta.emoji} ${modeMeta.label}` : '＋ Set Mode'}
          </span>
          <span className={`text-[10px] opacity-60 ${modeMeta?.color || 'text-white/50'}`}>▾</span>
        </button>

        {showModePicker && (
          <div onClick={e => e.stopPropagation()} className="absolute left-0 top-full mt-2 z-[100] bg-[#0d1117] border border-white/[0.12] rounded-2xl shadow-2xl shadow-black/40 p-1.5 min-w-[230px]">
            <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest px-3 pt-2 pb-1">Switch Creator Mode</p>
            {Object.entries(CREATOR_MODE_META).map(([key, meta]) => (
              <button
                key={key}
                onClick={() => switchMode(key)}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors flex items-start gap-3 ${
                  user?.creatorMode === key
                    ? `${meta.bg} ${meta.color}`
                    : 'text-white/70 hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                <span className="text-lg leading-none mt-0.5">{meta.emoji}</span>
                <div>
                  <div className="text-sm font-semibold leading-tight flex items-center gap-1.5">
                    {meta.label}
                    {user?.creatorMode === key && <span className={`text-xs ${meta.color}`}>✓</span>}
                  </div>
                  <div className="text-[11px] text-white/30 mt-0.5">{meta.desc}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
