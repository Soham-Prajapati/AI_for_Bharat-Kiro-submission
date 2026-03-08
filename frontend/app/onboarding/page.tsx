'use client'

import { useState, useEffect } from 'react'
import ModeSelector from '@/components/ModeSelector'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

type CreatorMode = 'ai-first' | 'hybrid' | 'human-first'

const DOMAINS = [
  { id: 'food',     label: 'Food & Cooking',       icon: '🍳', desc: 'Recipes, reviews, culinary tips' },
  { id: 'education', label: 'Education',            icon: '📚', desc: 'Tutorials, courses, explainers' },
  { id: 'travel',   label: 'Travel & Adventure',    icon: '✈️', desc: 'Destinations, vlogs, guides' },
  { id: 'product',  label: 'Product Reviews',       icon: '📦', desc: 'Tech, gadgets, unboxings' },
  { id: 'entertainment', label: 'Entertainment',    icon: '🎬', desc: 'Comedy, drama, storytelling' },
  { id: 'technology', label: 'Technology',          icon: '💻', desc: 'Dev, AI, startups, SaaS' },
  { id: 'health',   label: 'Health & Fitness',      icon: '💪', desc: 'Workouts, nutrition, wellness' },
  { id: 'business', label: 'Business & Finance',    icon: '📈', desc: 'Investing, entrepreneurship, money' },
]

const AUDIENCE_TYPES = [
  { id: 'general',       label: 'General Public',   icon: '🌐', desc: 'Wide, mixed audience' },
  { id: 'youth',         label: 'Youth (13–25)',     icon: '🎮', desc: 'Gen Z, students, teens' },
  { id: 'professional',  label: 'Professionals',    icon: '💼', desc: 'Working adults, B2B' },
  { id: 'beginners',     label: 'Beginners',        icon: '🌱', desc: 'New to the topic' },
  { id: 'intermediate',  label: 'Intermediate',     icon: '🔧', desc: 'Some experience' },
  { id: 'expert',        label: 'Experts',          icon: '🏆', desc: 'Advanced practitioners' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { user, isAuthenticated, saveProfile } = useAuth()
  const [step, setStep] = useState(1)
  const [selectedMode, setSelectedMode] = useState<CreatorMode>()
  const [selectedDomain, setSelectedDomain] = useState<string>()
  const [selectedAudience, setSelectedAudience] = useState<string>()
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login')
    }
  }, [isAuthenticated, router])

  const handleContinueStep1 = () => {
    if (selectedMode) setStep(2)
  }

  const handleContinueStep2 = () => {
    if (selectedDomain) setStep(3)
  }

  const handleFinish = async () => {
    if (!selectedDomain || !selectedAudience || !selectedMode) return
    setSaving(true)
    try {
      await saveProfile({
        domain: selectedDomain,
        audienceType: selectedAudience,
        creatorMode: selectedMode,
      })
      router.push('/dashboard')
    } finally {
      setSaving(false)
    }
  }

  const stepLabel = ['Creator Mode', 'Your Domain', 'Your Audience'][step - 1]

  return (
    <div className="min-h-screen bg-[#030712] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_40%_20%,rgba(99,102,241,0.08),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_80%,rgba(34,211,238,0.04),transparent_60%)]" />

      <div className="relative max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
            <span className="text-[10px] font-mono font-semibold text-brand-400 uppercase tracking-widest">
              Step {step} of 3 — {stepLabel}
            </span>
          </div>

          {/* Step progress bar */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3].map(s => (
              <div key={s} className={`h-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-brand-500 w-12' : 'bg-white/10 w-8'}`} />
            ))}
          </div>

          {step === 1 && (
            <>
              <h1 className="text-5xl font-black font-display text-white mb-4 leading-none">
                Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''} to{' '}
                <span className="bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">KLA</span>
              </h1>
              <p className="text-white/40 text-lg max-w-xl mx-auto">
                Choose how you want to work with AI. You can change this any time.
              </p>
            </>
          )}
          {step === 2 && (
            <>
              <h1 className="text-5xl font-black font-display text-white mb-4 leading-none">
                What&apos;s your{' '}
                <span className="bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">domain?</span>
              </h1>
              <p className="text-white/40 text-lg max-w-xl mx-auto">
                We&apos;ll personalise viral trends and content suggestions for your niche.
              </p>
            </>
          )}
          {step === 3 && (
            <>
              <h1 className="text-5xl font-black font-display text-white mb-4 leading-none">
                Who&apos;s your{' '}
                <span className="bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">audience?</span>
              </h1>
              <p className="text-white/40 text-lg max-w-xl mx-auto">
                This shapes the tone, complexity and hooks we recommend for your content.
              </p>
            </>
          )}
        </div>

        {/* Step 1 — Creator Mode */}
        {step === 1 && (
          <>
            <ModeSelector selectedMode={selectedMode} onModeSelect={setSelectedMode} />
            {selectedMode && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={handleContinueStep1}
                  className="px-12 py-4 bg-brand-600 hover:bg-brand-500 text-white font-bold font-display text-base rounded-xl shadow-lg shadow-brand-500/20 transition-all duration-200"
                >
                  Continue →
                </button>
              </div>
            )}
          </>
        )}

        {/* Step 2 — Domain */}
        {step === 2 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {DOMAINS.map(d => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDomain(d.id)}
                  className={`group p-4 rounded-2xl border text-left transition-all duration-200 ${
                    selectedDomain === d.id
                      ? 'border-brand-500 bg-brand-500/15 shadow-lg shadow-brand-500/10'
                      : 'border-white/[0.07] bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="text-3xl mb-2">{d.icon}</div>
                  <div className={`font-bold text-sm mb-1 ${selectedDomain === d.id ? 'text-brand-300' : 'text-white'}`}>
                    {d.label}
                  </div>
                  <div className="text-xs text-white/30">{d.desc}</div>
                  {selectedDomain === d.id && (
                    <div className="mt-2 text-brand-400 text-xs font-mono">✓ Selected</div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center mt-10">
              <button onClick={() => setStep(1)} className="text-white/30 hover:text-white/60 text-sm transition-colors">
                ← Back
              </button>
              {selectedDomain && (
                <button
                  onClick={handleContinueStep2}
                  className="px-12 py-4 bg-brand-600 hover:bg-brand-500 text-white font-bold font-display text-base rounded-xl shadow-lg shadow-brand-500/20 transition-all duration-200"
                >
                  Continue →
                </button>
              )}
            </div>
          </>
        )}

        {/* Step 3 — Audience Type */}
        {step === 3 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {AUDIENCE_TYPES.map(a => (
                <button
                  key={a.id}
                  onClick={() => setSelectedAudience(a.id)}
                  className={`group p-5 rounded-2xl border text-left transition-all duration-200 ${
                    selectedAudience === a.id
                      ? 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/10'
                      : 'border-white/[0.07] bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="text-3xl mb-2">{a.icon}</div>
                  <div className={`font-bold text-sm mb-1 ${selectedAudience === a.id ? 'text-cyan-300' : 'text-white'}`}>
                    {a.label}
                  </div>
                  <div className="text-xs text-white/30">{a.desc}</div>
                  {selectedAudience === a.id && (
                    <div className="mt-2 text-cyan-400 text-xs font-mono">✓ Selected</div>
                  )}
                </button>
              ))}
            </div>

            {/* Summary */}
            {selectedAudience && (
              <div className="mt-8 bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 flex flex-wrap gap-4">
                <div>
                  <div className="text-xs text-white/30 font-mono mb-1">CREATOR MODE</div>
                  <div className="text-sm font-semibold text-brand-300 capitalize">{selectedMode?.replace('-', ' ')}</div>
                </div>
                <div className="w-px bg-white/10" />
                <div>
                  <div className="text-xs text-white/30 font-mono mb-1">DOMAIN</div>
                  <div className="text-sm font-semibold text-white">
                    {DOMAINS.find(d => d.id === selectedDomain)?.label}
                  </div>
                </div>
                <div className="w-px bg-white/10" />
                <div>
                  <div className="text-xs text-white/30 font-mono mb-1">AUDIENCE</div>
                  <div className="text-sm font-semibold text-cyan-300">
                    {AUDIENCE_TYPES.find(a => a.id === selectedAudience)?.label}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mt-8">
              <button onClick={() => setStep(2)} className="text-white/30 hover:text-white/60 text-sm transition-colors">
                ← Back
              </button>
              {selectedAudience && (
                <button
                  onClick={handleFinish}
                  disabled={saving}
                  className="px-12 py-4 bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 disabled:opacity-60 text-white font-bold font-display text-base rounded-xl shadow-lg shadow-brand-500/20 transition-all duration-200"
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Saving…
                    </span>
                  ) : 'Go to Dashboard →'}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
