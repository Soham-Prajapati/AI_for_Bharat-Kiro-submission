'use client'

import { useState } from 'react'
import ModeSelector from '@/components/ModeSelector'
import { useRouter } from 'next/navigation'

type CreatorMode = 'ai-first' | 'hybrid' | 'human-first'

export default function OnboardingPage() {
  const router = useRouter()
  const [selectedMode, setSelectedMode] = useState<CreatorMode>()

  const handleModeSelect = (mode: CreatorMode) => {
    setSelectedMode(mode)
  }

  const handleContinue = () => {
    if (selectedMode) {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_40%_20%,rgba(99,102,241,0.08),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_80%,rgba(34,211,238,0.04),transparent_60%)]" />

      <div className="relative max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
            <span className="text-[10px] font-mono font-semibold text-brand-400 uppercase tracking-widest">Step 1 of 3 — Creator Mode</span>
          </div>
          <h1 className="text-5xl font-black font-display text-white mb-4 leading-none">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">
              KLA
            </span>
          </h1>
          <p className="text-white/40 text-lg max-w-xl mx-auto">
            Choose how you want to work with AI. You can change this any time.
          </p>
        </div>

        {/* Mode Selector */}
        <ModeSelector
          selectedMode={selectedMode}
          onModeSelect={handleModeSelect}
        />

        {/* Continue Button */}
        {selectedMode && (
          <div className="flex justify-center mt-10">
            <button
              onClick={handleContinue}
              className="px-12 py-4 bg-brand-600 hover:bg-brand-500 text-white font-bold font-display text-base rounded-xl shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30 transition-all duration-200"
            >
              Continue →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
