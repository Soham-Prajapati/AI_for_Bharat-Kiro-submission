'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type IterationId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F'

export interface IterationMeta {
  id: IterationId
  label: string
  desc: string
  accent: string
  bg: string
}

export const ITERATIONS: IterationMeta[] = [
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
    bg: 'bg-orange-500/20',
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
  {
    id: 'F',
    label: 'Final',
    desc: 'Kinetic · Cultural · Yours',
    accent: 'from-orange-400 to-brand-400',
    bg: 'bg-orange-500/15',
  },
]

export const ACCENT_COLORS: Record<IterationId, string> = {
  A: '#818CF8',
  B: '#F97316',
  C: '#22D3EE',
  D: '#818CF8',
  E: '#ffffff',
  F: '#F97316',
}

interface DesignContextValue {
  active: IterationId
  setActive: (id: IterationId) => void
  panelOpen: boolean
  setPanelOpen: (open: boolean | ((prev: boolean) => boolean)) => void
  isDark: boolean
  toggleTheme: () => void
  mounted: boolean
}

const DesignContext = createContext<DesignContextValue | null>(null)

export function DesignProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<IterationId>('F')
  const [panelOpen, setPanelOpen] = useState(false)
  // Always start as false (server-safe). Correct from localStorage after mount
  // to avoid SSR/client hydration mismatch.
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('kla_theme')
    if (saved === 'dark') setIsDark(true)
    setMounted(true)
  }, [])

  const toggleTheme = () => setIsDark(prev => {
    const next = !prev
    localStorage.setItem('kla_theme', next ? 'dark' : 'light')
    return next
  })

  // Sync dark/light class on <html> for global CSS
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    document.documentElement.classList.toggle('light', !isDark)
  }, [isDark])

  return (
    <DesignContext.Provider value={{ active, setActive, panelOpen, setPanelOpen, isDark, toggleTheme, mounted }}>
      {children}
    </DesignContext.Provider>
  )
}

export function useDesign() {
  const ctx = useContext(DesignContext)
  if (!ctx) throw new Error('useDesign must be used inside DesignProvider')
  return ctx
}
