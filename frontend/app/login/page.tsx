'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated, user, loading, hydrated } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Redirect if already logged in (wait for hydration)
  useEffect(() => {
    if (!hydrated) return
    if (isAuthenticated && user) {
      if (!user.onboardingComplete && !user.domain) {
        router.replace('/onboarding')
      } else {
        router.replace('/dashboard')
      }
    }
  }, [hydrated, isAuthenticated, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) return

    setError(null)
    setSubmitting(true)

    try {
      const result = await login(email.trim(), password)
      if (result.success) {
        const u = (result as any).user
        if (u && !u.onboardingComplete && !u.domain) {
          router.push('/onboarding')
        } else {
          router.push('/dashboard')
        }
      } else {
        setError((result as any).error || 'Login failed. Please check your credentials.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white flex items-center justify-center px-4">
      {/* Background glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(99,102,241,0.1),transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,rgba(34,211,238,0.05),transparent_60%)] pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-3xl font-black font-display bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">
              KLA
            </span>
          </Link>
          <p className="mt-2 text-white/40 text-sm">AI-powered content intelligence for creators</p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-8">
          <h1 className="text-2xl font-black font-display text-white mb-1">Welcome back</h1>
          <p className="text-white/40 text-sm mb-7">Sign in to your creator account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-mono font-semibold text-white/40 uppercase tracking-widest mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
                className="w-full bg-white/[0.04] border border-white/[0.10] rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-brand-500/50 focus:bg-white/[0.06] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold text-white/40 uppercase tracking-widest mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-white/[0.04] border border-white/[0.10] rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-brand-500/50 focus:bg-white/[0.06] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || loading || !email || !password}
              className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-brand-500/20 mt-2"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : 'Sign in'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-xs text-white/20 font-mono">OR</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          <p className="text-center text-sm text-white/40">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
              Create one free
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-white/20 mt-4 font-mono">
          New here? <Link href="/register" className="text-white/40 hover:text-white/60 transition-colors">Register first →</Link>
        </p>
      </div>
    </div>
  )
}
