'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import ModeSelector from '@/components/ModeSelector'

type CreatorMode = 'ai-first' | 'hybrid' | 'human-first'

const DOMAINS = [
  { id: 'food',          label: 'Food & Cooking',     icon: '🍳' },
  { id: 'education',     label: 'Education',           icon: '📚' },
  { id: 'travel',        label: 'Travel & Adventure',  icon: '✈️' },
  { id: 'product',       label: 'Product Reviews',     icon: '📦' },
  { id: 'entertainment', label: 'Entertainment',       icon: '🎬' },
  { id: 'technology',    label: 'Technology',          icon: '💻' },
  { id: 'health',        label: 'Health & Fitness',    icon: '💪' },
  { id: 'business',      label: 'Business & Finance',  icon: '📈' },
]

const AUDIENCE_TYPES = [
  { id: 'general',      label: 'General Public',  icon: '🌐' },
  { id: 'youth',        label: 'Youth (13–25)',    icon: '🎮' },
  { id: 'professional', label: 'Professionals',   icon: '💼' },
  { id: 'beginners',    label: 'Beginners',       icon: '🌱' },
  { id: 'intermediate', label: 'Intermediate',    icon: '🔧' },
  { id: 'expert',       label: 'Experts',         icon: '🏆' },
]

const CREATOR_TYPES = [
  { id: 'educator',     label: 'Educator',         icon: '🎓', desc: 'Teach, explain, guide' },
  { id: 'entertainer',  label: 'Entertainer',      icon: '🎭', desc: 'Comedy, skits, fun content' },
  { id: 'storyteller',  label: 'Storyteller',      icon: '📖', desc: 'Narratives, vlogs, journeys' },
  { id: 'reviewer',     label: 'Reviewer',         icon: '⭐', desc: 'Reviews, comparisons, unboxing' },
  { id: 'motivator',    label: 'Motivator',        icon: '🔥', desc: 'Inspire, uplift, challenge' },
  { id: 'analyst',      label: 'Analyst',          icon: '🔍', desc: 'Deep dives, research, commentary' },
]

const TONES = [
  { id: 'casual',       label: 'Casual & Friendly',   icon: '😊' },
  { id: 'professional', label: 'Professional',         icon: '🎯' },
  { id: 'funny',        label: 'Funny & Relatable',    icon: '😂' },
  { id: 'inspiring',    label: 'Inspiring',            icon: '✨' },
  { id: 'raw',          label: 'Raw & Authentic',      icon: '💯' },
  { id: 'informative',  label: 'Deep & Informative',   icon: '🧠' },
]

const LANGUAGES = [
  { id: 'english', label: 'English',    flag: '🇬🇧' },
  { id: 'hindi',   label: 'Hindi',      flag: '🇮🇳' },
  { id: 'tamil',   label: 'Tamil',      flag: '🌟' },
  { id: 'telugu',  label: 'Telugu',     flag: '🌟' },
  { id: 'bengali', label: 'Bengali',    flag: '🌟' },
  { id: 'marathi', label: 'Marathi',    flag: '🌟' },
  { id: 'gujarati',label: 'Gujarati',   flag: '🌟' },
  { id: 'kannada', label: 'Kannada',    flag: '🌟' },
  { id: 'punjabi', label: 'Punjabi',    flag: '🌟' },
  { id: 'odia',    label: 'Odia',       flag: '🌟' },
]

export default function SettingsPage() {
  const router = useRouter()
  const { user, isAuthenticated, saveProfile } = useAuth()

  const [domain, setDomain] = useState<string>('')
  const [audienceType, setAudienceType] = useState<string>('')
  const [creatorMode, setCreatorMode] = useState<CreatorMode | undefined>()
  const [creatorType, setCreatorType] = useState<string>('')
  const [contentTone, setContentTone] = useState<string>('')
  const [contentLanguages, setContentLanguages] = useState<string[]>([])
  const [saved, setSaved] = useState(false)
  const [activeSection, setActiveSection] = useState<'identity' | 'style' | 'mode'>('identity')

  useEffect(() => {
    if (!isAuthenticated) { router.replace('/login'); return }
    if (user) {
      setDomain(user.domain || '')
      setAudienceType(user.audienceType || '')
      setCreatorMode((user.creatorMode as CreatorMode) || undefined)
      setCreatorType(user.creatorType || '')
      setContentTone(user.contentTone || '')
      setContentLanguages(user.contentLanguages || ['english'])
    }
  }, [isAuthenticated, user, router])

  const toggleLanguage = (id: string) => {
    setContentLanguages(prev =>
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    )
  }

  const handleSave = async () => {
    await saveProfile({ domain, audienceType, creatorMode, creatorType, contentTone, contentLanguages })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const sections = [
    { id: 'identity', label: 'Creator Identity', icon: '🎨' },
    { id: 'style',    label: 'Content Style',    icon: '✍️' },
    { id: 'mode',     label: 'AI Mode',          icon: '🤖' },
  ] as const

  return (
    <div className="min-h-screen bg-bg-base text-text-primary">
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-text-tertiary hover:text-text-primary text-sm mb-4 flex items-center gap-1.5 transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-black font-display text-text-primary">Settings</h1>
          <p className="text-text-tertiary mt-1">Tune KLA to fit how you create content.</p>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-2 mb-8 bg-bg-elevated border border-border-subtle rounded-xl p-1.5">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeSection === s.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-overlay'
              }`}
            >
              <span>{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        {/* ── CREATOR IDENTITY ── */}
        {activeSection === 'identity' && (
          <div className="space-y-8">

            {/* Creator Type */}
            <div>
              <h2 className="text-base font-semibold text-text-primary mb-1">What kind of creator are you?</h2>
              <p className="text-xs text-text-tertiary mb-4">This helps KLA match your content voice and structure.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {CREATOR_TYPES.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setCreatorType(c.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      creatorType === c.id
                        ? 'border-brand-500 bg-brand-500/10 text-brand-300'
                        : 'border-border-subtle bg-bg-elevated text-text-secondary hover:border-border-muted hover:text-text-primary'
                    }`}
                  >
                    <div className="text-2xl mb-2">{c.icon}</div>
                    <div className="font-semibold text-sm">{c.label}</div>
                    <div className="text-xs text-text-tertiary mt-0.5">{c.desc}</div>
                    {creatorType === c.id && <div className="text-xs font-mono text-brand-400 mt-2">✓ Selected</div>}
                  </button>
                ))}
              </div>
            </div>

            {/* Domain */}
            <div>
              <h2 className="text-base font-semibold text-text-primary mb-1">Content domain</h2>
              <p className="text-xs text-text-tertiary mb-4">Your primary niche — KLA tailors trends and hooks for this space.</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {DOMAINS.map(d => (
                  <button
                    key={d.id}
                    onClick={() => setDomain(d.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      domain === d.id
                        ? 'border-brand-500 bg-brand-500/10 text-brand-300'
                        : 'border-border-subtle bg-bg-elevated text-text-secondary hover:border-border-muted hover:text-text-primary'
                    }`}
                  >
                    <div className="text-xl mb-1.5">{d.icon}</div>
                    <div className="font-medium text-xs leading-tight">{d.label}</div>
                    {domain === d.id && <div className="text-[10px] font-mono text-brand-400 mt-1.5">✓</div>}
                  </button>
                ))}
              </div>
            </div>

            {/* Audience */}
            <div>
              <h2 className="text-base font-semibold text-text-primary mb-1">Target audience</h2>
              <p className="text-xs text-text-tertiary mb-4">Shapes tone, complexity and the hooks KLA recommends.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {AUDIENCE_TYPES.map(a => (
                  <button
                    key={a.id}
                    onClick={() => setAudienceType(a.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      audienceType === a.id
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300'
                        : 'border-border-subtle bg-bg-elevated text-text-secondary hover:border-border-muted hover:text-text-primary'
                    }`}
                  >
                    <div className="text-xl mb-1.5">{a.icon}</div>
                    <div className="font-medium text-xs">{a.label}</div>
                    {audienceType === a.id && <div className="text-[10px] font-mono text-cyan-400 mt-1.5">✓</div>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── CONTENT STYLE ── */}
        {activeSection === 'style' && (
          <div className="space-y-8">

            {/* Tone */}
            <div>
              <h2 className="text-base font-semibold text-text-primary mb-1">Content tone</h2>
              <p className="text-xs text-text-tertiary mb-4">How you want your scripts and captions to sound.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {TONES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setContentTone(t.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      contentTone === t.id
                        ? 'border-brand-500 bg-brand-500/10 text-brand-300'
                        : 'border-border-subtle bg-bg-elevated text-text-secondary hover:border-border-muted hover:text-text-primary'
                    }`}
                  >
                    <div className="text-2xl mb-2">{t.icon}</div>
                    <div className="font-semibold text-sm">{t.label}</div>
                    {contentTone === t.id && <div className="text-xs font-mono text-brand-400 mt-2">✓ Selected</div>}
                  </button>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div>
              <h2 className="text-base font-semibold text-text-primary mb-1">Languages you create in</h2>
              <p className="text-xs text-text-tertiary mb-4">Select all that apply — KLA will generate content in these languages.</p>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map(l => (
                  <button
                    key={l.id}
                    onClick={() => toggleLanguage(l.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-all ${
                      contentLanguages.includes(l.id)
                        ? 'border-brand-500 bg-brand-500/10 text-brand-300 font-medium'
                        : 'border-border-subtle bg-bg-elevated text-text-secondary hover:border-border-muted hover:text-text-primary'
                    }`}
                  >
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                    {contentLanguages.includes(l.id) && <span className="text-brand-400 text-xs">✓</span>}
                  </button>
                ))}
              </div>
              {contentLanguages.length === 0 && (
                <p className="text-xs text-amber-400 mt-2">⚠ Select at least one language</p>
              )}
            </div>
          </div>
        )}

        {/* ── AI MODE ── */}
        {activeSection === 'mode' && (
          <div>
            <h2 className="text-base font-semibold text-text-primary mb-1">How do you want to work with AI?</h2>
            <p className="text-xs text-text-tertiary mb-6">This controls how much KLA automates vs. how much you stay in control.</p>
            <ModeSelector selectedMode={creatorMode} onModeSelect={(m) => setCreatorMode(m as CreatorMode)} />
          </div>
        )}

        {/* Save Bar */}
        <div className="mt-10 flex items-center justify-between border-t border-border-subtle pt-6">
          <p className="text-xs text-text-tertiary">Changes are saved to your profile and applied immediately.</p>
          <button
            onClick={handleSave}
            disabled={contentLanguages.length === 0}
            className={`px-8 py-3 rounded-xl font-bold text-sm transition-all duration-200 shadow-sm ${
              saved
                ? 'bg-emerald-600 text-white'
                : 'bg-brand-600 hover:bg-brand-500 text-white disabled:opacity-40'
            }`}
          >
            {saved ? '✓ Saved!' : 'Save changes'}
          </button>
        </div>

      </div>
    </div>
  )
}
