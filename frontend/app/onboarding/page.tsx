'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

// ── Creator archetypes
const CREATOR_TYPES = [
  { id: 'educator',    label: 'Educator',       icon: '🎓', desc: 'I teach and explain things', domain: 'education' },
  { id: 'entertainer', label: 'Entertainer',    icon: '🎭', desc: 'I create fun, engaging content', domain: 'entertainment' },
  { id: 'storyteller', label: 'Storyteller',    icon: '📖', desc: 'I share stories and journeys', domain: 'travel' },
  { id: 'reviewer',    label: 'Reviewer',       icon: '⭐', desc: 'I review and compare things', domain: 'product' },
  { id: 'motivator',   label: 'Motivator',      icon: '🔥', desc: 'I inspire and uplift people', domain: 'health' },
  { id: 'foodie',      label: 'Food Creator',   icon: '🍳', desc: 'I create food content', domain: 'food' },
  { id: 'techie',      label: 'Tech Creator',   icon: '💻', desc: 'I cover tech & digital life', domain: 'technology' },
  { id: 'analyst',     label: 'Business/Finance', icon: '📈', desc: 'I share insights and analysis', domain: 'business' },
]

// ── What they're passionate about (multi-select)
const PASSIONS = [
  { id: 'on-camera',   label: 'Being on camera',       icon: '🎥' },
  { id: 'writing',     label: 'Writing scripts',       icon: '✍️' },
  { id: 'research',    label: 'Deep research',         icon: '🔍' },
  { id: 'editing',     label: 'Video editing',         icon: '🎬' },
  { id: 'storytelling',label: 'Storytelling',          icon: '📖' },
  { id: 'community',   label: 'Building community',    icon: '🤝' },
  { id: 'trends',      label: 'Chasing trends',        icon: '🚀' },
  { id: 'teaching',    label: 'Teaching concepts',     icon: '📚' },
]

const AUDIENCE_TYPES = [
  { id: 'general',      label: 'General Public',  icon: '🌐', desc: 'Wide, mixed audience' },
  { id: 'youth',        label: 'Youth (13–25)',    icon: '🎮', desc: 'Gen Z, students, teens' },
  { id: 'professional', label: 'Professionals',   icon: '💼', desc: 'Working adults, B2B' },
  { id: 'beginners',    label: 'Beginners',       icon: '🌱', desc: 'New to the topic' },
  { id: 'intermediate', label: 'Intermediate',    icon: '🔧', desc: 'Some experience' },
  { id: 'expert',       label: 'Experts',         icon: '🏆', desc: 'Advanced practitioners' },
]

const LANGUAGES = [
  { id: 'english', label: 'English',  flag: '🇬🇧' },
  { id: 'hindi',   label: 'Hindi',    flag: '🇮🇳' },
  { id: 'tamil',   label: 'Tamil',    flag: '🌟' },
  { id: 'telugu',  label: 'Telugu',   flag: '🌟' },
  { id: 'bengali', label: 'Bengali',  flag: '🌟' },
  { id: 'marathi', label: 'Marathi',  flag: '🌟' },
  { id: 'gujarati',label: 'Gujarati', flag: '🌟' },
  { id: 'kannada', label: 'Kannada',  flag: '🌟' },
  { id: 'punjabi', label: 'Punjabi',  flag: '🌟' },
]

const STEP_LABELS = ['Who are you?', 'What drives you?', 'Who do you reach?', 'Your language mix']

export default function OnboardingPage() {
  const router = useRouter()
  const { user, isAuthenticated, saveProfile } = useAuth()
  const [step, setStep] = useState(1)

  const [creatorType, setCreatorType] = useState<string>('')
  const [passions, setPassions] = useState<string[]>([])
  const [audienceType, setAudienceType] = useState<string>('')
  const [languages, setLanguages] = useState<string[]>(['english'])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login')
  }, [isAuthenticated, router])

  const togglePassion = (id: string) =>
    setPassions(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])

  const toggleLang = (id: string) =>
    setLanguages(prev => prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id])

  const selectedType = CREATOR_TYPES.find(c => c.id === creatorType)

  const handleFinish = async () => {
    if (!creatorType || !audienceType || languages.length === 0) return
    setSaving(true)
    try {
      await saveProfile({
        creatorType,
        domain: selectedType?.domain || 'general',
        audienceType,
        contentLanguages: languages,
        creatorMode: 'hybrid',
      })
      router.push('/dashboard')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_40%_20%,rgba(99,102,241,0.08),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_80%,rgba(34,211,238,0.04),transparent_60%)]" />

      <div className="relative max-w-4xl mx-auto px-4 py-16">

        {/* Step indicator */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
            <span className="text-[10px] font-mono font-semibold text-brand-400 uppercase tracking-widest">
              Step {step} of 4 — {STEP_LABELS[step - 1]}
            </span>
          </div>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3, 4].map(s => (
              <div
                key={s}
                className={`rounded-full transition-all duration-500 ${
                  s < step ? 'bg-brand-500 w-8 h-1' :
                  s === step ? 'bg-brand-400 w-12 h-1' :
                  'bg-white/10 w-6 h-1'
                }`}
              />
            ))}
          </div>

          {step === 1 && (
            <>
              <h1 className="text-5xl font-black font-display text-white mb-4 leading-none">
                Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!<br />
                <span className="bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">
                  What kind of creator are you?
                </span>
              </h1>
              <p className="text-white/40 text-base max-w-lg mx-auto">
                Pick the archetype that fits you best. This personalises your entire KLA experience.
              </p>
            </>
          )}
          {step === 2 && (
            <>
              <h1 className="text-5xl font-black font-display text-white mb-4 leading-none">
                What&apos;s your{' '}
                <span className="bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">
                  creative strength?
                </span>
              </h1>
              <p className="text-white/40 text-base max-w-lg mx-auto">
                Pick all that feel like <em>you</em>. KLA uses this to bias towards your strengths.
              </p>
            </>
          )}
          {step === 3 && (
            <>
              <h1 className="text-5xl font-black font-display text-white mb-4 leading-none">
                Who do you{' '}
                <span className="bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">
                  create for?
                </span>
              </h1>
              <p className="text-white/40 text-base max-w-lg mx-auto">
                This shapes tone, hooks, and content structure for your audience.
              </p>
            </>
          )}
          {step === 4 && (
            <>
              <h1 className="text-5xl font-black font-display text-white mb-4 leading-none">
                Which{' '}
                <span className="bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">
                  languages
                </span>{' '}
                do you use?
              </h1>
              <p className="text-white/40 text-base max-w-lg mx-auto">
                KLA will generate content in these languages. Pick all that apply.
              </p>
            </>
          )}
        </div>

        {/* ── Step 1: Creator Type ── */}
        {step === 1 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {CREATOR_TYPES.map(c => (
                <button
                  key={c.id}
                  onClick={() => setCreatorType(c.id)}
                  className={`group p-4 rounded-2xl border text-left transition-all duration-200 ${
                    creatorType === c.id
                      ? 'border-brand-500 bg-brand-500/15 shadow-lg shadow-brand-500/10'
                      : 'border-white/[0.07] bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="text-3xl mb-2">{c.icon}</div>
                  <div className={`font-bold text-sm mb-1 ${creatorType === c.id ? 'text-brand-300' : 'text-white'}`}>
                    {c.label}
                  </div>
                  <div className="text-xs text-white/30">{c.desc}</div>
                  {creatorType === c.id && <div className="mt-2 text-brand-400 text-xs font-mono">✓ That&apos;s me</div>}
                </button>
              ))}
            </div>
            <div className="flex justify-end mt-10">
              {creatorType && (
                <button
                  onClick={() => setStep(2)}
                  className="px-12 py-4 bg-brand-600 hover:bg-brand-500 text-white font-bold font-display text-base rounded-xl shadow-lg shadow-brand-500/20 transition-all duration-200"
                >
                  Continue →
                </button>
              )}
            </div>
          </>
        )}

        {/* ── Step 2: Passions / Strengths ── */}
        {step === 2 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {PASSIONS.map(p => (
                <button
                  key={p.id}
                  onClick={() => togglePassion(p.id)}
                  className={`group p-4 rounded-2xl border text-left transition-all duration-200 ${
                    passions.includes(p.id)
                      ? 'border-brand-500 bg-brand-500/15 shadow-lg shadow-brand-500/10'
                      : 'border-white/[0.07] bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="text-3xl mb-2">{p.icon}</div>
                  <div className={`font-bold text-sm ${passions.includes(p.id) ? 'text-brand-300' : 'text-white'}`}>
                    {p.label}
                  </div>
                  {passions.includes(p.id) && <div className="mt-2 text-brand-400 text-xs font-mono">✓</div>}
                </button>
              ))}
            </div>
            <div className="flex justify-between items-center mt-10">
              <button onClick={() => setStep(1)} className="text-white/30 hover:text-white/60 text-sm transition-colors">
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-12 py-4 bg-brand-600 hover:bg-brand-500 text-white font-bold font-display text-base rounded-xl shadow-lg shadow-brand-500/20 transition-all duration-200"
              >
                {passions.length === 0 ? 'Skip →' : 'Continue →'}
              </button>
            </div>
          </>
        )}

        {/* ── Step 3: Audience ── */}
        {step === 3 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {AUDIENCE_TYPES.map(a => (
                <button
                  key={a.id}
                  onClick={() => setAudienceType(a.id)}
                  className={`group p-5 rounded-2xl border text-left transition-all duration-200 ${
                    audienceType === a.id
                      ? 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/10'
                      : 'border-white/[0.07] bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="text-3xl mb-2">{a.icon}</div>
                  <div className={`font-bold text-sm mb-1 ${audienceType === a.id ? 'text-cyan-300' : 'text-white'}`}>
                    {a.label}
                  </div>
                  <div className="text-xs text-white/30">{a.desc}</div>
                  {audienceType === a.id && <div className="mt-2 text-cyan-400 text-xs font-mono">✓ My audience</div>}
                </button>
              ))}
            </div>
            <div className="flex justify-between items-center mt-10">
              <button onClick={() => setStep(2)} className="text-white/30 hover:text-white/60 text-sm transition-colors">
                ← Back
              </button>
              {audienceType && (
                <button
                  onClick={() => setStep(4)}
                  className="px-12 py-4 bg-brand-600 hover:bg-brand-500 text-white font-bold font-display text-base rounded-xl shadow-lg shadow-brand-500/20 transition-all duration-200"
                >
                  Continue →
                </button>
              )}
            </div>
          </>
        )}

        {/* ── Step 4: Languages + Welcome ── */}
        {step === 4 && (
          <>
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {LANGUAGES.map(l => (
                <button
                  key={l.id}
                  onClick={() => toggleLang(l.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-full border text-sm font-medium transition-all ${
                    languages.includes(l.id)
                      ? 'border-brand-500 bg-brand-500/15 text-brand-300'
                      : 'border-white/[0.07] bg-white/[0.03] text-white/60 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <span className="text-base">{l.flag}</span>
                  <span>{l.label}</span>
                  {languages.includes(l.id) && <span className="text-brand-400 text-xs">✓</span>}
                </button>
              ))}
            </div>

            {/* Personalised summary card */}
            {audienceType && creatorType && (
              <div className="bg-white/[0.03] border border-brand-500/20 rounded-2xl p-6 text-center mb-6">
                <div className="text-4xl mb-3">{selectedType?.icon}</div>
                <p className="text-white/50 text-sm font-mono uppercase tracking-widest mb-2">KLA is now tuned for</p>
                <p className="text-xl font-bold text-white">
                  {user?.name?.split(' ')[0] || 'You'} —{' '}
                  <span className="text-brand-300">{selectedType?.label}</span>
                </p>
                <p className="text-white/40 text-sm mt-1">
                  {selectedType?.domain} content · {AUDIENCE_TYPES.find(a => a.id === audienceType)?.label} audience · {languages.join(', ')}
                </p>
              </div>
            )}

            <div className="flex justify-between items-center">
              <button onClick={() => setStep(3)} className="text-white/30 hover:text-white/60 text-sm transition-colors">
                ← Back
              </button>
              <button
                onClick={handleFinish}
                disabled={saving || languages.length === 0 || !audienceType}
                className="px-12 py-4 bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 disabled:opacity-60 text-white font-bold font-display text-base rounded-xl shadow-lg shadow-brand-500/20 transition-all duration-200"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Setting up…
                  </span>
                ) : 'Start creating →'}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  )
}

