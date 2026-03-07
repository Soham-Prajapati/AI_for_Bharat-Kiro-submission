'use client'

import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'
import { TestimonialsSection, PlatformShowcase, IndiaCoverage, PricingStripSection } from './SharedSections'

gsap.registerPlugin(ScrollTrigger)

const WebGLScene = dynamic(() => import('./WebGLScene'), { ssr: false })

const STEPS = [
  { n: '01', title: 'Drop Your Video', body: 'Any format. Any length. कLA accepts video, audio, or plain text.' },
  { n: '02', title: 'AI Understands It', body: 'Domain detection, transcription, and semantic analysis happen in parallel.' },
  { n: '03', title: 'Platform Content Generated', body: 'Captions, scripts, hashtags, and thumbnails — tailored to each algorithm.' },
  { n: '04', title: 'Review & Publish', body: 'Every output waits for your approval. One click sends it everywhere.' },
]

const METRICS = [
  { value: '4–6h', label: 'Creator time saved per video', sub: 'vs. manual distribution' },
  { value: '54×', label: 'Content pieces from 1 upload', sub: '6 platforms × 9 languages' },
  { value: '0.3s', label: 'Viral score prediction', sub: 'Before publishing' },
]

export default function IterationC() {
  const containerRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const productCardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let lenis: any
    ;(async () => {
      try {
        const LenisModule = await import('@studio-freight/lenis')
        const Lenis = LenisModule.default
        lenis = new Lenis({ duration: 1.6, easing: (t: number) => 1 - Math.pow(1 - t, 4), smoothWheel: true })
        lenis.on('scroll', ScrollTrigger.update)
        const raf = (time: number) => { lenis.raf(time); requestAnimationFrame(raf) }
        requestAnimationFrame(raf)
      } catch {}
    })()

    const ctx = gsap.context(() => {
      // Hero entrance
      gsap.fromTo('.hero-word',
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.1, stagger: 0.06, ease: 'power4.out', delay: 0.3 }
      )
      gsap.fromTo('.hero-sub',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', delay: 1.1 }
      )
      gsap.fromTo('.hero-cta',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 1.3 }
      )
      gsap.fromTo('.hero-badge',
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.7, ease: 'back.out(1.7)', delay: 0.1 }
      )

      // Product card - 3D tilt on scroll
      if (productCardRef.current) {
        gsap.to(productCardRef.current, {
          rotateX: 8,
          rotateY: -6,
          scale: 1.02,
          scrollTrigger: {
            trigger: productCardRef.current,
            start: 'top 80%',
            end: 'top 30%',
            scrub: 1.5,
          }
        })
      }

      // Metrics count-up
      gsap.utils.toArray<HTMLElement>('.metric-card').forEach((el, i) => {
        gsap.fromTo(el,
          { y: 50, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%' },
            delay: i * 0.12,
          }
        )
      })

      // Step cards
      gsap.utils.toArray<HTMLElement>('.step-card').forEach((el, i) => {
        gsap.fromTo(el,
          { x: i % 2 === 0 ? -50 : 50, opacity: 0 },
          {
            x: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%' },
          }
        )
      })

      // Reveal elements
      gsap.utils.toArray<HTMLElement>('.reveal-c').forEach((el) => {
        gsap.fromTo(el,
          { y: 50, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%' }
          }
        )
      })
    }, containerRef)

    return () => {
      ctx.revert()
      lenis?.destroy()
    }
  }, [])

  return (
    <div ref={containerRef} className="bg-bg-base text-white overflow-hidden">
      {/* ══════════ NAV ══════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="font-display font-black text-2xl tracking-[-1px]">
            <span className="text-orange-500">क</span><span className="bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">L</span><span className="text-white">A</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {['Product', 'How It Works', 'Pricing'].map(item => (
              <a key={item} href="#" className="text-white/50 hover:text-white text-sm transition-colors font-medium">{item}</a>
            ))}
          </div>
          <Link href="/upload" className="bg-white/[0.08] border border-white/10 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-white/[0.14] transition-all">
            Get Started
          </Link>
        </div>
      </nav>

      {/* ══════════ HERO ══════════ */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center text-center pt-24 pb-24 px-6">
        {/* Multi-layer gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] rounded-full bg-brand-600/25 blur-[140px]" />
          <div className="absolute top-[20%] right-[-15%] w-[500px] h-[500px] rounded-full bg-cyan-500/15 blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[30%] w-[400px] h-[400px] rounded-full bg-accent-orange/10 blur-[100px]" />
        </div>

        {/* Grid texture */}
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative z-10 max-w-[1000px] mx-auto">
          {/* Top badge */}
          <div className="hero-badge inline-flex items-center gap-3 bg-white/[0.06] border border-white/10 backdrop-blur-xl rounded-2xl px-5 py-2.5 mb-10">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-400 to-cyan-400 flex items-center justify-center text-xs">✦</div>
            <span className="text-white/60 text-sm font-medium">AI for Bharat 2026</span>
            <div className="w-px h-4 bg-white/20" />
            <span className="text-white/40 text-xs font-mono">AWS Bedrock</span>
          </div>

          {/* Headline */}
          <h1 className="font-display font-black text-[clamp(3.5rem,8vw,7rem)] tracking-[-4px] leading-[0.9] mb-8">
            {['The', 'content', 'engine', 'for', 'every', 'creator.'].map((w, i) => (
              <span key={i} className={`hero-word inline-block mr-[0.2em] mb-1 ${i === 2 ? 'bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent' : ''}`}
                style={{ opacity: 0 }}>
                {w}
              </span>
            ))}
          </h1>

          {/* Sub */}
          <p className="hero-sub text-white/50 text-lg md:text-xl max-w-[540px] mx-auto leading-relaxed mb-10" style={{ opacity: 0 }}>
            Upload one video. कLA generates platform-perfect content for 6 networks in 9 Indian languages — in 60 seconds.
          </p>

          {/* CTAs */}
          <div className="hero-cta flex gap-4 flex-wrap justify-center" style={{ opacity: 0 }}>
            <Link href="/upload"
              className="relative group inline-flex items-center gap-2 bg-gradient-to-br from-brand-500 to-brand-600 text-white font-bold text-base px-8 py-4 rounded-2xl hover:shadow-[0_0_50px_rgba(99,102,241,0.4)] transition-all hover:-translate-y-0.5"
            >
              <span>Start Free</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link href="/demo"
              className="inline-flex items-center gap-2 bg-white/[0.07] border border-white/10 text-white/70 font-medium text-base px-8 py-4 rounded-2xl hover:bg-white/[0.12] hover:text-white transition-all"
            >
              ▶ Watch Demo
            </Link>
          </div>
        </div>

        {/* Floating metrics badges */}
        <div className="relative z-10 mt-20 flex flex-wrap justify-center gap-4">
          {[
            { icon: '⚡', text: '60s generation' },
            { icon: '🌏', text: '9 Indian languages' },
            { icon: '🎯', text: '6 platforms' },
          ].map((b, i) => (
            <div key={i} className="flex items-center gap-2 bg-white/[0.05] border border-white/[0.08] backdrop-blur-xl rounded-full px-5 py-2.5 text-sm text-white/60">
              <span>{b.icon}</span>
              <span>{b.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ PRODUCT CARD ══════════ */}
      <section className="py-16 px-6">
        <div className="max-w-[900px] mx-auto">
          <div
            ref={productCardRef}
            className="relative rounded-3xl overflow-hidden border border-white/[0.08] bg-bg-elevated"
            style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
          >
            {/* Simulated dashboard UI inside card */}
            <div className="p-8 md:p-12">
              {/* Card header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="text-white/40 text-xs font-mono mb-1">kla.ai/dashboard</div>
                  <div className="font-display font-bold text-xl text-white">Content Hub</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-white/40 text-xs font-mono">live</span>
                </div>
              </div>

              {/* Platform outputs grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                {['YouTube', 'Instagram', 'LinkedIn', 'Twitter', 'Facebook', 'TikTok'].map((p, i) => (
                  <div key={p} className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.06]">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white/60 text-xs font-medium">{p}</span>
                      <div className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${i < 3 ? 'bg-emerald-400/15 text-emerald-400' : 'bg-brand-400/15 text-brand-400'}`}>
                        {i < 3 ? 'ready' : 'gen...'}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className={`h-1.5 rounded-full bg-white/10 ${i < 3 ? '' : 'animate-pulse'}`}
                        style={{ width: i < 3 ? '100%' : `${40 + i * 12}%` }} />
                      <div className="h-1.5 rounded-full bg-white/[0.06]" style={{ width: '75%' }} />
                      <div className="h-1.5 rounded-full bg-white/[0.04]" style={{ width: '55%' }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Viral score bar */}
              <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-5">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-white/60 text-sm font-medium">Viral Score</span>
                  <span className="font-display font-bold text-2xl bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">87</span>
                </div>
                <div className="h-2 bg-white/[0.07] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-brand-500 to-cyan-400 rounded-full" style={{ width: '87%' }} />
                </div>
                <p className="text-white/30 text-xs mt-2">High viral potential — publish immediately</p>
              </div>
            </div>

            {/* Card background glow */}
            <div className="absolute inset-0 pointer-events-none rounded-3xl"
              style={{ background: 'radial-gradient(ellipse at 30% 30%, rgba(99,102,241,0.07) 0%, transparent 60%)' }} />
          </div>
        </div>
      </section>

      {/* ══════════ METRICS ══════════ */}
      <section className="py-24 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {METRICS.map((m, i) => (
              <div key={i} className="metric-card relative border border-white/[0.07] bg-white/[0.025] rounded-3xl p-8 overflow-hidden" style={{ opacity: 0 }}>
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-brand-500/10 blur-[40px]" />
                <div className="relative z-10">
                  <div className="font-display font-black text-5xl bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent mb-3">{m.value}</div>
                  <div className="text-white font-semibold text-lg mb-1">{m.label}</div>
                  <div className="text-white/30 text-sm">{m.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section className="py-24 px-6">
        <div className="max-w-[900px] mx-auto">
          <div className="reveal-c text-center mb-16">
            <p className="font-mono text-xs text-brand-400 tracking-[0.3em] uppercase mb-3">Process</p>
            <h2 className="font-display font-black text-[clamp(2.5rem,5vw,4rem)] tracking-[-2px]">
              Four steps to<br />
              <span className="bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">infinite reach</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {STEPS.map((s, i) => (
              <div key={i} className="step-card border border-white/[0.07] bg-white/[0.03] rounded-3xl p-7 hover:border-white/[0.14] hover:bg-white/[0.05] transition-all duration-300">
                <div className="font-mono text-brand-400 text-sm mb-3">{s.n}</div>
                <h3 className="font-display font-bold text-xl text-white mb-2">{s.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CTA ══════════ */}
      <section className="relative py-40 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-900/20 to-transparent" />
          <WebGLScene variant="sphere" className="opacity-25" />
        </div>
        <div className="reveal-c relative z-10 max-w-[700px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 border border-emerald-400/30 bg-emerald-400/10 rounded-full px-4 py-2 text-emerald-400 text-xs font-mono mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Free for your first 10 videos · No credit card
          </div>
          <h2 className="font-display font-black text-[clamp(2.5rem,6vw,5.5rem)] tracking-[-3px] text-white mb-4">
            Your voice.<br />
            <span className="bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">Just louder.</span>
          </h2>
          <p className="text-white/40 text-lg mb-10">Join 50,000+ Indian creators multiplying their reach with कLA.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/upload"
              className="bg-gradient-to-br from-brand-500 to-brand-600 text-white font-bold text-base px-10 py-4 rounded-2xl hover:shadow-[0_0_50px_rgba(99,102,241,0.35)] transition-all hover:-translate-y-0.5"
            >
              Start Creating Free
            </Link>
            <Link href="/membership"
              className="border border-white/10 bg-white/[0.05] text-white/70 font-medium text-base px-10 py-4 rounded-2xl hover:bg-white/[0.09] hover:text-white transition-all"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════ PLATFORM SHOWCASE ══════════ */}
      <PlatformShowcase theme="cyan" />

      {/* ══════════ INDIA COVERAGE ══════════ */}
      <IndiaCoverage theme="cyan" />

      {/* ══════════ TESTIMONIALS ══════════ */}
      <TestimonialsSection theme="cyan" />

      {/* ══════════ PRICING ══════════ */}
      <PricingStripSection theme="cyan" />

      {/* ══════════ FOOTER ══════════ */}
      <footer className="border-t border-white/[0.06] py-10 px-6">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-display font-black text-2xl tracking-[-1px]">
            <span className="text-orange-500">क</span><span className="bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">L</span><span className="text-white">A</span>
          </div>
          <div className="flex gap-6 text-sm text-white/30">
            <a href="#" className="hover:text-white/60 transition-colors">Product</a>
            <a href="/membership" className="hover:text-white/60 transition-colors">Pricing</a>
            <a href="/dashboard" className="hover:text-white/60 transition-colors">Dashboard</a>
          </div>
          <div className="text-white/20 text-xs font-mono">© 2026 कLA · Built for Bharat</div>
        </div>
      </footer>
    </div>
  )
}
