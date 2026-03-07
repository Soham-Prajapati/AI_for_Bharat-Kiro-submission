'use client'

import { useDesign, ITERATIONS } from '@/context/DesignContext'
import { usePathname } from 'next/navigation'

export default function DesignSwitcherPanel() {
  const { active, setActive, panelOpen, setPanelOpen, isDark, toggleTheme } = useDesign()
  const pathname = usePathname()
  const isLanding = pathname === '/'

  const activeIt = ITERATIONS.find((i) => i.id === active)!

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-2">
      {/* Expanded panel */}
      {panelOpen && (
        <div className={`mb-2 border backdrop-blur-2xl rounded-2xl p-3 shadow-2xl w-60 ${
          isDark
            ? 'bg-[#0A0F1E]/95 border-white/[0.12] shadow-black/80'
            : 'bg-white/95 border-gray-200 shadow-gray-300/60'
        }`}>
          <div className={`text-[10px] font-mono tracking-[0.3em] uppercase mb-3 px-1 ${
            isDark ? 'text-white/40' : 'text-gray-400'
          }`}>
            Design Iterations
          </div>

          <div className="space-y-1">
            {ITERATIONS.map((it) => (
              <button
                key={it.id}
                onClick={() => {
                  setActive(it.id)
                  setPanelOpen(false)
                  if (isLanding) window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 text-left ${
                  active === it.id
                    ? isDark
                      ? 'bg-white/[0.1] border border-white/[0.14]'
                      : 'bg-gray-100 border border-gray-200'
                    : isDark
                      ? 'hover:bg-white/[0.05] border border-transparent'
                      : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${it.bg}`}
                >
                  <span
                    className={`font-display font-black text-sm bg-gradient-to-br ${it.accent} bg-clip-text text-transparent`}
                  >
                    {it.id}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-semibold leading-tight truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {it.label}
                  </div>
                  <div className={`text-[10px] font-mono truncate ${isDark ? 'text-white/30' : 'text-gray-400'}`}>{it.desc}</div>
                </div>

                {active === it.id && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>

          {/* Light / Dark toggle */}
          <div className={`mt-3 pt-3 border-t flex items-center justify-between ${
            isDark ? 'border-white/[0.07]' : 'border-gray-200'
          }`}>
            <span className={`text-[10px] font-mono ${isDark ? 'text-white/30' : 'text-gray-400'}`}>Theme</span>
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                isDark
                  ? 'bg-white/[0.08] text-white/60 hover:bg-white/[0.12]'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isDark ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  Dark
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Light
                </>
              )}
            </button>
          </div>

          <div className={`mt-2 text-[10px] font-mono text-center ${isDark ? 'text-white/20' : 'text-gray-300'}`}>
            कLA by BMAD · Design Lab
          </div>
        </div>
      )}

      {/* Toggle pill */}
      <button
        onClick={() => setPanelOpen((prev) => !prev)}
        className={`group flex items-center gap-2.5 border backdrop-blur-2xl rounded-full px-4 py-2.5 text-sm font-semibold shadow-xl transition-all ${
          isDark
            ? `bg-[#0A0F1E]/90 border-white/[0.12] text-white shadow-black/60 hover:border-white/[0.25] ${panelOpen ? 'border-white/[0.22]' : ''}`
            : `bg-white/90 border-gray-200 text-gray-900 shadow-gray-300/40 hover:border-gray-300 ${panelOpen ? 'border-gray-300' : ''}`
        }`}
        title="Switch design iteration"
      >
        <div
          className={`w-5 h-5 rounded-md flex items-center justify-center ${activeIt.bg}`}
        >
          <span
            className={`font-display font-black text-xs bg-gradient-to-br ${activeIt.accent} bg-clip-text text-transparent`}
          >
            {active}
          </span>
        </div>
        <span className={`hidden sm:block ${isDark ? 'text-white/70' : 'text-gray-600'}`}>{activeIt.label}</span>
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${isDark ? 'text-white/40' : 'text-gray-400'} ${
            panelOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  )
}
