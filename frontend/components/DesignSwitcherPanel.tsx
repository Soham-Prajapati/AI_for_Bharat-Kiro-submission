'use client'

import { useDesign } from '@/context/DesignContext'

export default function DesignSwitcherPanel() {
  const { isDark, toggleTheme } = useDesign()

  return (
    <button
      onClick={toggleTheme}
      className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-2 border backdrop-blur-2xl rounded-full px-4 py-2.5 text-sm font-medium shadow-xl transition-all ${
        isDark
          ? 'bg-[#0A0F1E]/90 border-white/[0.12] text-white/70 shadow-black/60 hover:border-white/[0.25]'
          : 'bg-white/90 border-gray-200 text-gray-600 shadow-gray-300/40 hover:border-gray-300'
      }`}
      title="Toggle light / dark mode"
      aria-label="Toggle light / dark mode"
    >
      {isDark ? (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
      <span className="hidden sm:block">{isDark ? 'Light' : 'Dark'}</span>
    </button>
  )
}
