'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

const DOMAIN_LABELS: Record<string, string> = {
  food: '🍳 Food',
  education: '📚 Education',
  travel: '✈️ Travel',
  product: '📦 Products',
  entertainment: '🎬 Entertainment',
  technology: '💻 Tech',
  health: '💪 Health',
  business: '📈 Business',
}

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, logout, resetDemo } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Upload', path: '/upload', icon: '📤' },
    { name: 'Analytics', path: '/analytics', icon: '📈' },
    { name: 'Workspace', path: '/workspace', icon: '👥' },
    { name: 'Calendar', path: '/calendar', icon: '📅' },
    { name: 'Marketplace', path: '/marketplace', icon: '🛒' },
    { name: 'Community', path: '/community', icon: '💬' },
  ]

  const isActive = (path: string) => pathname === path

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const handleResetDemo = async () => {
    if (!confirm('Reset demo? This will clear all your data and restart from the beginning (register → onboarding → dashboard).')) return
    setIsResetting(true)
    setIsUserMenuOpen(false)
    await resetDemo()
    router.push('/register')
  }

  const initials = user?.name
    ? user.name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
    : 'U'

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#030712]/95 backdrop-blur-sm border-b border-white/[0.07]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-black font-display bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">
              KLA
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  isActive(item.path)
                    ? 'bg-brand-600/20 text-brand-300 border border-brand-500/20'
                    : 'text-white/50 hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                <span className="mr-1">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>

          {/* User section */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(v => !v)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.07] transition-all"
                >
                  {/* Avatar */}
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
                    {initials}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-white leading-none">{user.name}</div>
                    {user.domain && (
                      <div className="text-[10px] text-white/30 font-mono mt-0.5">
                        {DOMAIN_LABELS[user.domain] || user.domain}
                      </div>
                    )}
                  </div>
                  <span className="text-white/20 text-xs">▾</span>
                </button>

                {/* Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-12 w-52 bg-[#0d1117] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-white/[0.06]">
                      <div className="text-sm font-semibold text-white">{user.name}</div>
                      <div className="text-xs text-white/30 font-mono truncate">{user.email}</div>
                    </div>
                    <div className="p-1.5 space-y-0.5">
                      <Link
                        href="/onboarding"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors"
                      >
                        ⚙️ Edit Profile
                      </Link>
                      <button
                        onClick={handleResetDemo}
                        disabled={isResetting}
                        className="w-full text-left px-3 py-2 text-sm text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition-colors disabled:opacity-50"
                      >
                        🎬 Reset Demo
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        ↩ Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-lg transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-white/40 hover:text-white"
          >
            <span className="text-xl">{isMenuOpen ? '✕' : '☰'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#030712] border-t border-white/[0.07]">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive(item.path)
                    ? 'bg-brand-600/20 text-brand-300'
                    : 'text-white/50 hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </Link>
            ))}
            <div className="pt-3 border-t border-white/[0.06]">
              {isAuthenticated && user ? (
                <>
                  <div className="px-4 py-2 text-sm text-white/50">{user.name} · {user.email}</div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10"
                  >
                    ↩ Sign out
                  </button>
                </>
              ) : (
                <Link href="/login" className="block px-4 py-3 rounded-xl text-sm text-brand-400 hover:bg-brand-500/10">
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

