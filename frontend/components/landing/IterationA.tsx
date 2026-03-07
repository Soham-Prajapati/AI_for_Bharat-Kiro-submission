'use client'

import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'
import { TestimonialsSection, PlatformShowcase, IndiaCoverage, PricingStripSection } from './SharedSections'

gsap.registerPlugin(ScrollTrigger)

const WebGLScene = dynamic(() => import('./WebGLScene'), { ssr: false })

const FEATURES = [
  { icon: '⚡', label: 'Real-Time AI', desc: 'Claude 3 Haiku processes your video as you wait. No queue, no delay.' },
  { icon: '🌏', label: '9 Languages', desc: 'Hindi, Tamil, Telugu, Kannada, Bengali, Marathi, Gujarati, Punjabi, Malayalam.' },
  { icon: '🎯', label: '6 Platforms', desc: 'YouTube, Instagram, LinkedIn, Twitter, Facebook, TikTok. Perfectly formatted.' },
  { icon: '🧬', label: 'Creator DNA', desc: 'Learns your voice. Every output sounds like you, not a robot.' },
  { icon: '🔥', label: 'Viral Score', desc: 'Predict your content\'s potential before you hit publish.' },
  { icon: '🔒', label: 'Human Control', desc: 'Every AI output awaits your approval. You command the engine.' },
]

export default function IterationA() {
  const containerRef = useRef<HTMLDivElement>(null)
  const heroTitleRef = useRef<HTMLDivElement>(null)
  const heroSubRef = useRef<HTMLParagraphElement>(null)
  const heroCTARef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const featureSectionRef = useRef<HTMLDivElement>(null)
  const featureCardsRef = useRef<(HTMLDivElement | null)[]>([])
  const ctaSectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Smooth scroll via Lenis
    let lenis: any
    ;(async () => {
      try {
        const LenisModule = await import('@studio-freight/lenis')
        const Lenis = LenisModule.default
        lenis = new Lenis({
          duration: 1.4,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          orientation: 'vertical',
          smoothWheel: true,
        })
        lenis.on('scroll', ScrollTrigger.update)
        const raf = (time: number) => { lenis.raf(time); requestAnimationFrame(raf) }
        requestAnimationFrame(raf)
      } catch {}
    })()

    // Hero entrance
    const ctx = gsap.context(() => {
      const chars = heroTitleRef.current?.querySelectorAll('.char')
      if (chars) {
        gsap.fromTo(chars,
          { y: 120, opacity: 0, rotateX: 60 },
          { y: 0, opacity: 1, rotateX: 0, duration: 1, stagger: 0.04, ease: 'power4.out', delay: 0.3 }
        )
      }
      gsap.fromTo(heroSubRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', delay: 1 }
      )
      gsap.fromTo(heroCTARef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 1.2 }
      )
      gsap.fromTo(statsRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', delay: 1.5 }
      )

      // Feature cards — scroll reveal
      featureCardsRef.current.forEach((card, i) => {
        if (!card) return
        gsap.fromTo(card,
          { y: 60, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
            delay: (i % 3) * 0.1,
          }
        )
      })

      // CTA section
      gsap.fromTo(ctaSectionRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: ctaSectionRef.current, start: 'top 80%' }
        }
      )
    }, containerRef)

    return () => {
      ctx.revert()
      lenis?.destroy()
    }
  }, [])

  // Split title into layered spans for character animation
  const renderTitle = () => {
    const lines = [
      { text: '1 Video.', highlight: false },
      { text: '6 Platforms.', highlight: true },
      { text: '60 Seconds.', highlight: false },
    ]
    return lines.map((line, li) => (
      <div key={li} className="overflow-hidden leading-none mb-2">
        {line.text.split('').map((char, ci) => (
          <span
            key={ci}
            className={`char inline-block ${char === ' ' ? 'w-[0.3em]' : ''} ${
              line.highlight
                ? 'bg-gradient-to-r from-brand-400 via-cyan-400 to-brand-400 bg-clip-text text-transparent'
                : 'text-white'
            }`}
            style={{ opacity: 0 }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </div>
    ))
  }

  return (
    <div ref={containerRef} className="bg-bg-base">
      {/* ══════════ NAV ══════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
        <div className="max-w-[1200px] mx-auto px-6 py-5 flex items-center justify-between pointer-events-auto">
          <div className="font-display font-black text-2xl tracking-[-1px]"><span className="text-orange-500">क</span><span className="text-white">LA</span></div>
          <div className="hidden md:flex items-center gap-8">
            {['Product', 'Features', 'Pricing'].map(item => (
              <a key={item} href="#" className="text-white/40 hover:text-white text-sm transition-colors font-medium">{item}</a>
            ))}
          </div>
          <Link href="/upload"
            className="bg-white/[0.06] border border-white/10 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-white/[0.12] transition-all"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* ══════════ HERO ══════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center pt-24 pb-16 overflow-hidden">
        {/* Three.js particles background */}
        <WebGLScene variant="particles" className="opacity-70" />

        {/* Ambient orbs */}
        <div className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] rounded-full bg-brand-500/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-cyan-400/15 blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-[1100px] mx-auto px-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 border border-white/10 bg-white/[0.04] backdrop-blur-xl rounded-full px-5 py-2 text-xs text-white/50 mb-12 font-mono">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            AI for Bharat 2026 &nbsp;·&nbsp; Powered by <span className="text-accent-orange font-semibold ml-1">AWS Bedrock</span>
          </div>

          {/* Main title */}
          <h1 ref={heroTitleRef} className="font-display font-black text-[clamp(3.5rem,9vw,8rem)] tracking-[-4px] perspective-[800px] mb-8">
            {renderTitle()}
          </h1>

          {/* Sub */}
          <p ref={heroSubRef} className="text-[1.1rem] md:text-xl text-white/50 max-w-[600px] mx-auto leading-relaxed mb-10">
            कLA's AI engine turns one upload into platform-perfect content across YouTube, Instagram, LinkedIn & more — in 9 Indian languages, in under a minute.
          </p>

          {/* CTAs */}
          <div ref={heroCTARef} className="flex gap-4 flex-wrap justify-center">
            <Link href="/upload"
              className="group relative inline-flex items-center gap-2 bg-gradient-to-br from-brand-500 to-brand-600 text-white font-bold text-base px-8 py-4 rounded-2xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[0_0_50px_rgba(99,102,241,0.4)]"
            >
              <span className="relative z-10">Start Creating Free</span>
              <span className="relative z-10 text-xl">→</span>
              <div className="absolute inset-0 bg-gradient-to-br from-brand-400 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link href="/demo"
              className="inline-flex items-center gap-2 border border-white/10 bg-white/[0.03] text-white/70 font-medium text-base px-8 py-4 rounded-2xl hover:bg-white/[0.07] hover:text-white hover:border-white/20 transition-all"
            >
              Watch Demo
            </Link>
          </div>

          {/* Stats strip */}
          <div ref={statsRef} className="grid grid-cols-3 gap-4 max-w-lg mx-auto mt-16">
            {[
              { num: '60s', label: 'Generation' },
              { num: '6', label: 'Platforms' },
              { num: '9', label: 'Languages' },
            ].map(s => (
              <div key={s.label} className="border border-white/[0.07] bg-white/[0.03] backdrop-blur-xl rounded-2xl p-5">
                <div className="font-display font-black text-4xl bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">{s.num}</div>
                <div className="text-white/40 text-xs mt-1 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20 text-xs">
          <span className="font-mono tracking-widest uppercase">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/20 to-transparent" />
        </div>
      </section>

      {/* ══════════ FEATURE GRID ══════════ */}
      <section ref={featureSectionRef} className="relative py-32 px-6">
        <div className="max-w-[1200px] mx-auto">
          {/* Section header */}
          <div className="text-center mb-20">
            <p className="font-mono text-xs text-brand-400 tracking-[0.3em] uppercase mb-4">The Engine</p>
            <h2 className="font-display font-black text-[clamp(2.5rem,5vw,4.5rem)] text-white tracking-[-2px]">
              What कLA does<br />
              <span className="bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">while you sleep</span>
            </h2>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                ref={el => { featureCardsRef.current[i] = el }}
                className="group relative border border-white/[0.07] bg-white/[0.025] backdrop-blur-xl rounded-3xl p-7 hover:border-brand-500/40 hover:bg-white/[0.05] transition-all duration-500 cursor-default"
                style={{ opacity: 0 }}
              >
                {/* Hover glow */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-brand-500/10 to-cyan-400/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="text-4xl mb-4">{f.icon}</div>
                  <h3 className="font-display font-bold text-lg text-white mb-2">{f.label}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Background decorations */}
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] rounded-full bg-brand-500/10 blur-[100px] pointer-events-none -translate-y-1/2" />
      </section>

      {/* ══════════ PROCESS ══════════ */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-900/10 to-transparent pointer-events-none" />
        <div className="max-w-[900px] mx-auto text-center relative z-10">
          <p className="font-mono text-xs text-cyan-400 tracking-[0.3em] uppercase mb-4">How It Works</p>
          <h2 className="font-display font-black text-[clamp(2rem,4vw,3.5rem)] text-white tracking-[-2px] mb-16">
            Drop. Generate. Publish.
          </h2>
          <div className="flex flex-col md:flex-row gap-8 items-center">
            {[
              { step: '01', title: 'Upload', desc: 'Drop any video, audio, or text file.' },
              { step: '02', title: 'AI Engines Fire', desc: 'Transcribe → Understand → Generate → Translate.' },
              { step: '03', title: 'Review & Ship', desc: 'Approve AI outputs, then publish in one click.' },
            ].map((s, i) => (
              <div key={i} className="flex-1 relative">
                {i < 2 && <div className="hidden md:block absolute top-6 -right-4 w-8 h-px bg-white/10 z-10" />}
                <div className="border border-white/[0.07] bg-white/[0.025] rounded-3xl p-8 text-left">
                  <div className="font-mono text-brand-400 text-sm mb-3">{s.step}</div>
                  <h3 className="font-display font-bold text-2xl text-white mb-2">{s.title}</h3>
                  <p className="text-white/40 text-sm">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ PLATFORM SHOWCASE ══════════ */}
      <PlatformShowcase />

      {/* ══════════ INDIA COVERAGE ══════════ */}
      <IndiaCoverage />

      {/* ══════════ TESTIMONIALS ══════════ */}
      <TestimonialsSection variant="dark" />

      {/* ══════════ PRICING ══════════ */}
      <PricingStripSection />

      {/* ══════════ CTA ══════════ */}
      <section className="relative py-40 px-6 overflow-hidden">
        <WebGLScene variant="sphere" className="opacity-30" />
        <div ref={ctaSectionRef} className="relative z-10 max-w-[800px] mx-auto text-center" style={{ opacity: 0 }}>
          <h2 className="font-display font-black text-[clamp(3rem,7vw,6rem)] text-white tracking-[-3px] leading-none mb-8">
            Create once.<br />
            <span className="bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">Reach everyone.</span>
          </h2>
          <p className="text-white/40 text-lg mb-12">
            Join 50,000+ Indian creators already using कLA to multiply their reach.
          </p>
          <Link href="/upload"
            className="inline-flex items-center gap-3 bg-white text-bg-base font-black text-lg px-10 py-5 rounded-2xl hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] transition-all hover:-translate-y-1"
          >
            Launch कLA Free
          </Link>
        </div>
        <div className="absolute inset-0 bg-gradient-radial from-brand-500/10 to-transparent pointer-events-none" />
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="border-t border-white/[0.06] py-10 px-6">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-white/30 text-sm">
          <span className="font-display font-bold text-xl"><span className="text-orange-500">क</span><span className="text-white">LA</span></span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white/60 transition-colors">Product</a>
            <a href="/membership" className="hover:text-white/60 transition-colors">Pricing</a>
            <a href="/dashboard" className="hover:text-white/60 transition-colors">Dashboard</a>
          </div>
          <span>© 2026 कLA. Built for Bharat.</span>
        </div>
      </footer>
    </div>
  )
}
