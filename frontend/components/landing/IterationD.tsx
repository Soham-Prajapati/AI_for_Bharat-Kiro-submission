'use client'

import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'
import {
  PLATFORM_CONFIG, KLALogoSVG, GridDotPattern, WaveformSVG,
  SparklesSVG, ArrowRightSVG
} from './SVGAssets'
import { TestimonialsSection, PlatformShowcase, IndiaCoverage, CreatorDNASection, PricingStripSection } from './SharedSections'

gsap.registerPlugin(ScrollTrigger)

const WebGLScene = dynamic(() => import('./WebGLScene'), { ssr: false })

/** Iteration D: PRISMATIC
 * Inspired by: lusion.co immersive narrative, Lando Norris scroll-storytelling,
 *              Pioneer immersive world, Resn WebGL surrealist playground.
 *
 * Concept: One long scroll tells the full कLA story as a cinematic journey.
 * - Pinned hero with parallax depth layers
 * - Scroll-driven stat counter panel (numbers tick as you scroll)
 * - Full-bleed image-style platform cards with parallax offsets
 * - Horizontal feature ticker between sections
 * - Gradient mesh backgrounds that change color as you scroll
 * - DNA section with animated helix SVG
 * - Testimonials with India map
 * - Pricing cards
 * - Full-screen CTA with Three.js sphere
 */
export default function IterationD() {
  const containerRef = useRef<HTMLDivElement>(null)
  const heroTextRef = useRef<HTMLDivElement>(null)
  const scrollIndicatorRef = useRef<HTMLDivElement>(null)
  const gradMeshRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let lenis: any
    ;(async () => {
      try {
        const { default: Lenis } = await import('@studio-freight/lenis')
        lenis = new Lenis({ duration: 1.5, smoothWheel: true, easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) })
        lenis.on('scroll', ScrollTrigger.update)
        const raf = (time: number) => { lenis.raf(time); requestAnimationFrame(raf) }
        requestAnimationFrame(raf)
      } catch {}
    })()

    const ctx = gsap.context(() => {
      // ── Hero text stagger ──
      gsap.fromTo('.d-hero-line',
        { y: '100%', opacity: 0 },
        { y: '0%', opacity: 1, duration: 1.2, stagger: 0.15, ease: 'power4.out', delay: 0.4 }
      )
      gsap.fromTo('.d-hero-sub',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 1.4 }
      )
      gsap.fromTo('.d-hero-cta',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 1.7 }
      )

      // ── Scroll indicator fade in/out ──
      gsap.to(scrollIndicatorRef.current, {
        opacity: 0, y: 10,
        scrollTrigger: { trigger: '.d-section-2', start: 'top 90%', scrub: 1 }
      })

      // ── Gradient mesh scroll color shift ──
      gsap.to(gradMeshRef.current, {
        '--mesh-color-1': '#0a0a2e',
        '--mesh-color-2': '#001a1a',
        ease: 'none',
        scrollTrigger: { trigger: containerRef.current, start: 'top top', end: 'bottom bottom', scrub: true }
      })

      // ── Platform cards parallax ──
      gsap.utils.toArray<HTMLElement>('.d-platform-card').forEach((card, i) => {
        const dir = i % 2 === 0 ? -40 : 40
        gsap.fromTo(card,
          { y: dir, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: card, start: 'top 88%' }
          }
        )
      })

      // ── Stat panels ──
      gsap.utils.toArray<HTMLElement>('.d-stat').forEach((el, i) => {
        gsap.fromTo(el,
          { scale: 0.8, opacity: 0 },
          {
            scale: 1, opacity: 1, duration: 0.7, ease: 'back.out(1.5)',
            scrollTrigger: { trigger: el, start: 'top 85%' },
            delay: i * 0.1,
          }
        )
      })

      // ── Section reveals ──
      gsap.utils.toArray<HTMLElement>('.d-reveal').forEach(el => {
        gsap.fromTo(el,
          { y: 60, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%' }
          }
        )
      })

      // ── Horizontal ticker scroll ──
      // auto-plays via CSS animation

    }, containerRef)

    return () => { ctx.revert(); lenis?.destroy() }
  }, [])

  const TICKER_ITEMS = ['1 VIDEO', '6 PLATFORMS', '9 LANGUAGES', '60 SECONDS', 'CREATOR DNA', 'VIRAL SCORE', 'कLA ENGINE', 'BHARAT FIRST']

  return (
    <div ref={containerRef} className="bg-bg-base text-white overflow-hidden">
      <style>{`
        @keyframes ticker-d { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes float-d { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        @keyframes glow-pulse { 0%,100% { opacity: 0.4; } 50% { opacity: 0.8; } }
      `}</style>

      {/* ══════════ NAV ══════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-[1280px] mx-auto px-6 py-5 flex items-center justify-between">
          <KLALogoSVG className="h-8 w-20" />
          <div className="hidden md:flex items-center gap-8">
            {['Product', 'How It Works', 'Pricing', 'Languages'].map(item => (
              <a key={item} href="#" className="text-white/40 hover:text-white text-sm transition-colors">{item}</a>
            ))}
          </div>
          <Link href="/upload" className="bg-gradient-to-br from-brand-500 to-brand-600 text-white text-sm font-bold px-5 py-2.5 rounded-full hover:shadow-[0_0_25px_rgba(99,102,241,0.4)] transition-all hover:-translate-y-0.5">
            Try कLA Free
          </Link>
        </div>
      </nav>

      {/* ══════════ HERO ══════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* WebGL background */}
        <WebGLScene variant="particles" className="opacity-60" />

        {/* Gradient mesh */}
        <div ref={gradMeshRef} className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-900/40 via-transparent to-cyan-900/20" />
          <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] rounded-full bg-brand-600/20 blur-[150px] animate-[glow-pulse_6s_ease-in-out_infinite]" />
          <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-600/15 blur-[130px] animate-[glow-pulse_8s_ease-in-out_infinite_-2s]" />
        </div>

        {/* Dot grid */}
        <GridDotPattern className="absolute inset-0 w-full h-full text-white opacity-[0.015]" />

        <div className="relative z-10 text-center max-w-[1100px] mx-auto px-6">
          {/* Kicker */}
          <div className="d-hero-sub inline-flex items-center gap-2.5 bg-white/[0.06] border border-white/10 backdrop-blur-xl rounded-full px-5 py-2.5 text-sm text-white/60 mb-12">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            India's #1 Content Multiplication Engine
          </div>

          {/* Headline */}
          <h1 className="font-display font-black text-[clamp(4rem,10vw,9rem)] tracking-[-5px] leading-[0.88] mb-8">
            {[
              { text: 'The engine', hl: false },
              { text: 'behind every', hl: false },
              { text: 'creator.', hl: true },
            ].map((line, i) => (
              <div key={i} className="overflow-hidden block">
                <span
                  className={`d-hero-line inline-block ${
                    line.hl
                      ? 'bg-gradient-to-r from-brand-400 via-cyan-300 to-brand-400 bg-clip-text text-transparent'
                      : 'text-white'
                  }`}
                >
                  {line.text}
                </span>
              </div>
            ))}
          </h1>

          <p className="d-hero-sub text-white/45 text-xl max-w-[560px] mx-auto leading-relaxed mb-12">
            One video in. 54 platform-perfect pieces out. In 60 seconds. In 9 Indian languages.
          </p>

          <div className="d-hero-cta flex gap-5 flex-wrap justify-center">
            <Link href="/upload"
              className="group relative inline-flex items-center gap-3 bg-gradient-to-br from-brand-500 to-brand-600 text-white font-bold text-lg px-10 py-[18px] rounded-2xl overflow-hidden hover:shadow-[0_0_60px_rgba(99,102,241,0.45)] transition-all hover:-translate-y-1"
            >
              <span className="relative z-10">Start Creating Free</span>
              <ArrowRightSVG className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-br from-brand-400 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
            <Link href="/demo"
              className="inline-flex items-center gap-2 text-white/60 font-medium text-lg hover:text-white transition-colors"
            >
              ▶ See the demo
            </Link>
          </div>

          {/* Platform logos — centered 2-row, soft glow on hover, no animation */}
          <div className="flex flex-col items-center gap-3 mt-12">
            <span className="text-white/20 text-xs font-mono tracking-[0.2em] uppercase">Works with</span>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {PLATFORM_CONFIG.map((p, i) => (
                <div key={i}
                  className={`w-10 h-10 rounded-xl ${p.bg} border ${p.border} flex items-center justify-center transition-all duration-300 hover:shadow-[0_0_16px_rgba(255,255,255,0.08)] hover:scale-105 hover:border-white/20`}
                  title={p.name}
                >
                  <p.Icon className={`w-5 h-5 ${p.text}`} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div ref={scrollIndicatorRef} className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20">
          <span className="font-mono text-[10px] tracking-[0.4em] uppercase">Scroll</span>
          <div className="w-5 h-8 rounded-full border border-white/10 flex items-center justify-center">
            <div className="w-0.5 h-2 bg-white/30 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ══════════ TICKER ══════════ */}
      <div className="d-section-2 border-y border-white/[0.06] py-5 overflow-hidden bg-bg-deep">
        <div
          className="inline-flex gap-10 whitespace-nowrap"
          style={{ animation: 'ticker-d 30s linear infinite' }}
        >
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-10 font-display font-black text-2xl tracking-[-0.5px]">
              <span className={i % 5 === 2 ? 'text-brand-400' : i % 5 === 4 ? 'text-cyan-400' : 'text-white/30'}>
                {item}
              </span>
              <span className="text-white/10">◇</span>
            </span>
          ))}
        </div>
      </div>

      {/* ══════════ STATS PANEL ══════════ */}
      <section className="py-24 px-6 bg-bg-base">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { val: '60s', label: 'Average generation', sub: 'From upload to done' },
              { val: '54×', label: 'Content multiplied', sub: '6 platforms × 9 languages' },
              { val: '9', label: 'Indian languages', sub: 'With cultural intelligence' },
              { val: '4–6h', label: 'Saved per video', sub: 'vs. manual workflows' },
            ].map((stat, i) => (
              <div key={i} className="d-stat relative border border-white/[0.07] bg-white/[0.025] rounded-3xl p-7 overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-[40px]"
                  style={{ background: i % 2 === 0 ? 'rgba(99,102,241,0.15)' : 'rgba(34,211,238,0.1)' }} />
                <div className="relative z-10">
                  <div className="font-display font-black text-5xl bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                    {stat.val}
                  </div>
                  <div className="text-white font-semibold text-base mb-1">{stat.label}</div>
                  <div className="text-white/30 text-xs">{stat.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ PLATFORMS ══════════ */}
      <PlatformShowcase />

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section className="py-28 px-6 bg-bg-base relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 right-[-10%] w-[400px] h-[400px] rounded-full bg-brand-500/8 blur-[100px]" />
        </div>
        <div className="max-w-[1200px] mx-auto">
          <div className="d-reveal text-center mb-16">
            <p className="font-mono text-xs text-brand-400 tracking-[0.3em] uppercase mb-3">Process</p>
            <h2 className="font-display font-black text-[clamp(2.5rem,5vw,4.5rem)] tracking-[-2px] text-white">
              Three steps to<br />
              <span className="bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">infinite reach</span>
            </h2>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-500/30 to-transparent -translate-y-1/2" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {[
                {
                  step: '01', icon: '📥',
                  title: 'Drop Your Content',
                  body: 'Video, audio, or text. Any format, any duration. Drag and drop into कLA.',
                  detail: 'Supports MP4, MOV, MP3, WAV, YouTube links, and plain text scripts.'
                },
                {
                  step: '02', icon: '⚡',
                  title: 'AI Engine Fires',
                  body: 'Transcription → domain detection → platform generation → cultural translation. All in parallel.',
                  detail: 'Powered by AWS Bedrock (Claude 3), AWS Transcribe, and कLA\'s own cultural intelligence layer.'
                },
                {
                  step: '03', icon: '🚀',
                  title: 'Review & Deploy',
                  body: 'Every output waits for your nod. Edit inline, then publish in one click.',
                  detail: 'Full human control. कLA never auto-posts without your explicit approval.'
                }
              ].map((s, i) => (
                <div key={i} className="d-platform-card relative bg-white/[0.025] border border-white/[0.07] rounded-3xl p-8 hover:border-brand-500/30 hover:bg-white/[0.04] transition-all duration-500 group">
                  {/* Step number badge */}
                  <div className="absolute -top-4 left-8 bg-bg-base border border-white/[0.1] rounded-full px-3 py-1 font-mono text-xs text-brand-400">
                    {s.step}
                  </div>
                  <div className="text-5xl mb-5">{s.icon}</div>
                  <h3 className="font-display font-bold text-2xl text-white mb-3">{s.title}</h3>
                  <p className="text-white/50 text-base leading-relaxed mb-4">{s.body}</p>
                  <p className="text-white/25 text-xs leading-relaxed border-t border-white/[0.06] pt-4">{s.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ CREATOR DNA ══════════ */}
      <CreatorDNASection />

      {/* ══════════ INDIA COVERAGE ══════════ */}
      <IndiaCoverage />

      {/* ══════════ TESTIMONIALS ══════════ */}
      <TestimonialsSection theme="indigo" />

      {/* ══════════ PRICING STRIP ══════════ */}
      <PricingStripSection />

      {/* ══════════ CTA ══════════ */}
      <section className="relative min-h-[80vh] flex items-center justify-center py-32 px-6 overflow-hidden">
        <WebGLScene variant="sphere" className="opacity-35" />
        <div className="absolute inset-0 bg-gradient-radial from-brand-600/15 via-transparent to-transparent pointer-events-none" />

        <div className="d-reveal relative z-10 text-center max-w-[800px] mx-auto">
          <SparklesSVG className="w-24 h-24 mx-auto mb-6 opacity-60" />
          <h2 className="font-display font-black text-[clamp(3rem,7vw,6.5rem)] tracking-[-4px] text-white leading-none mb-6">
            Your voice.<br />
            <span className="bg-gradient-to-r from-brand-400 via-cyan-300 to-brand-400 bg-clip-text text-transparent">
              Just louder.
            </span>
          </h2>
          <p className="text-white/40 text-xl mb-12">
            Join 50,000+ Indian creators scaling with कLA.
          </p>
          <Link href="/upload"
            className="inline-flex items-center gap-3 bg-white text-bg-base font-black text-xl px-12 py-5 rounded-2xl hover:shadow-[0_0_70px_rgba(255,255,255,0.25)] transition-all hover:-translate-y-1"
          >
            Launch कLA Free
            <ArrowRightSVG className="w-5 h-5" />
          </Link>
          <p className="text-white/20 text-sm mt-6 font-mono">No credit card · First 10 videos free · Cancel anytime</p>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="border-t border-white/[0.06] py-14 px-6">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            <div>
              <KLALogoSVG className="h-8 w-20 mb-4" />
              <p className="text-white/30 text-sm leading-relaxed">India's AI-powered content multiplication engine. Built for Bharat.</p>
            </div>
            {[
              { title: 'Product', links: ['How It Works', 'Platforms', 'Languages', 'Creator DNA', 'Viral Score'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Security'] },
            ].map(col => (
              <div key={col.title}>
                <div className="text-white/60 text-sm font-semibold mb-4">{col.title}</div>
                <ul className="space-y-2.5">
                  {col.links.map(link => (
                    <li key={link}>
                      <a href="#" className="text-white/30 text-sm hover:text-white/60 transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/[0.06] pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-white/20 text-xs font-mono">
            <span>© 2026 कLA Technologies. Built for AI for Bharat.</span>
            <span>Powered by AWS Bedrock · Made in India 🇮🇳</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
