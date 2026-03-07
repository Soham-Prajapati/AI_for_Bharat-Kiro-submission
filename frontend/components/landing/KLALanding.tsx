'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import KLACursor from '@/components/KLACursor'
import { useDesign, ACCENT_COLORS } from '@/context/DesignContext'

// Dynamically load heavy iteration components
const IterationA = dynamic(() => import('./IterationA'), { ssr: false, loading: () => <LandingLoader /> })
const IterationB = dynamic(() => import('./IterationB'), { ssr: false, loading: () => <LandingLoader /> })
const IterationC = dynamic(() => import('./IterationC'), { ssr: false, loading: () => <LandingLoader /> })
const IterationD = dynamic(() => import('./IterationD'), { ssr: false, loading: () => <LandingLoader /> })
const IterationE = dynamic(() => import('./IterationE'), { ssr: false, loading: () => <LandingLoader /> })
const IterationF = dynamic(() => import('./IterationF'), { ssr: false, loading: () => <LandingLoader /> })

function LandingLoader() {
  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-brand-500/30 animate-ping" />
          <div className="absolute inset-0 rounded-full border-t-2 border-brand-400 animate-spin" />
        </div>
        <span className="font-mono text-xs text-white/30 tracking-widest animate-pulse">KLA</span>
      </div>
    </div>
  )
}

export default function KLALanding() {
  const { active } = useDesign()

  return (
    <div className="relative">
      {/* Theme-aware dual-ring cursor */}
      <KLACursor accentColor={ACCENT_COLORS[active]} />

      {/* Render active design iteration */}
      <Suspense fallback={<LandingLoader />}>
        {active === 'A' && <IterationA />}
        {active === 'B' && <IterationB />}
        {active === 'C' && <IterationC />}
        {active === 'D' && <IterationD />}
        {active === 'E' && <IterationE />}
        {active === 'F' && <IterationF />}
      </Suspense>

      {/* Design switcher is global — rendered via DesignSwitcherPanel in layout.tsx */}
    </div>
  )
}
