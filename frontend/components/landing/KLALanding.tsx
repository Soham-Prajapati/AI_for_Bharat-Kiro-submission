'use client'

import { useState, Suspense } from 'react'
import dynamic from 'next/dynamic'
import KLACursor from '@/components/KLACursor'

// Dynamically load heavy components with placeholders
const IterationA = dynamic(() => import('./IterationA'), { ssr: false, loading: () => <LandingLoader /> })
const IterationB = dynamic(() => import('./IterationB'), { ssr: false, loading: () => <LandingLoader /> })
const IterationC = dynamic(() => import('./IterationC'), { ssr: false, loading: () => <LandingLoader /> })
const IterationD = dynamic(() => import('./IterationD'), { ssr: false, loading: () => <LandingLoader /> })
const IterationE = dynamic(() => import('./IterationE'), { ssr: false, loading: () => <LandingLoader /> })

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

interface IterationMeta {
  id: 'A' | 'B' | 'C' | 'D' | 'E'
  label: string
  desc: string
  accent: string
  bg: string
}

const ITERATIONS: IterationMeta[] = [
  {
    id: 'A',
    label: 'Void Forge',
    desc: 'Three.js · Particles · GSAP',
    accent: 'from-brand-400 to-cyan-400',
    bg: 'bg-brand-500/20',
  },
  {
    id: 'B',
    label: 'Kinetic Type',
    desc: 'Marquee · Bold · Expressive',
    accent: 'from-orange-400 to-red-400',
    bg: 'bg-accent-orange/20',
  },
  {
    id: 'C',
    label: 'Crystal UI',
    desc: 'Glass · 3D Tilt · Clean',
    accent: 'from-cyan-400 to-brand-400',
    bg: 'bg-cyan-400/20',
  },
  {
    id: 'D',
    label: 'Prismatic',
    desc: 'Narrative · Deep Scroll · SVG Rich',
    accent: 'from-brand-400 to-cyan-400',
    bg: 'bg-brand-500/20',
  },
  {
    id: 'E',
    label: 'Noir Protocol',
    desc: 'Terminal · Agency · Precision',
    accent: 'from-white/60 to-white/20',
    bg: 'bg-white/10',
  },
]

export default function KLALanding() {
  const [active, setActive] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('D')
  const [panelOpen, setPanelOpen] = useState(false)

  return (
    <div className="relative">
      {/* Dual-ring cursor — blend-mode-safe */}
      <KLACursor />
      {/* ── Render active iteration ── */}
      <Suspense fallback={<LandingLoader />}>
        {active === 'A' && <IterationA />}
        {active === 'B' && <IterationB />}
        {active === 'C' && <IterationC />}
        {active === 'D' && <IterationD />}
        {active === 'E' && <IterationE />}
      </Suspense>

      {/* ── Floating design switcher ── */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-2">
        {/* Panel */}
        {panelOpen && (
          <div className="mb-2 bg-bg-elevated border border-white/[0.12] backdrop-blur-2xl rounded-2xl p-3 shadow-2xl shadow-black/80 w-56">
            <div className="text-white/40 text-[10px] font-mono tracking-[0.3em] uppercase mb-3 px-1">Design Iterations</div>
            <div className="space-y-1.5">
              {ITERATIONS.map((it) => (
                <button
                  key={it.id}
                  onClick={() => { setActive(it.id); setPanelOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                  className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 text-left ${
                    active === it.id
                      ? 'bg-white/[0.1] border border-white/[0.14]'
                      : 'hover:bg-white/[0.05] border border-transparent'
                  }`}
                >
                  {/* Color swatch */}
                  <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${it.bg}`}>
                    <span className={`font-display font-black text-sm bg-gradient-to-br ${it.accent} bg-clip-text text-transparent`}>
                      {it.id}
                    </span>
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold leading-tight">{it.label}</div>
                    <div className="text-white/30 text-[10px] font-mono">{it.desc}</div>
                  </div>
                  {active === it.id && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-white/[0.07] text-white/20 text-[10px] font-mono text-center">
              KLA by BMAD · Design Lab
            </div>
          </div>
        )}

        {/* Toggle button */}
        <button
          onClick={() => setPanelOpen(prev => !prev)}
          className={`group flex items-center gap-2.5 bg-bg-elevated border border-white/[0.12] backdrop-blur-2xl rounded-full px-4 py-2.5 text-sm font-semibold text-white shadow-xl shadow-black/60 transition-all hover:border-white/[0.22] hover:shadow-2xl ${
            panelOpen ? 'border-white/[0.2]' : ''
          }`}
          title="Switch design iteration"
        >
          <div className={`w-5 h-5 rounded-md flex items-center justify-center ${ITERATIONS.find(i => i.id === active)?.bg || ''}`}>
            <span className={`font-display font-black text-xs bg-gradient-to-br ${ITERATIONS.find(i => i.id === active)?.accent || ''} bg-clip-text text-transparent`}>
              {active}
            </span>
          </div>
          <span className="text-white/70 hidden sm:block">{ITERATIONS.find(i => i.id === active)?.label}</span>
          <svg
            className={`w-3 h-3 text-white/40 transition-transform duration-200 ${panelOpen ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
