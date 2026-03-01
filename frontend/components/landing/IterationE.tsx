'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'
import {
  PLATFORM_CONFIG, KLALogoSVG, WaveformSVG, PlatformFlowSVG, ArrowRightSVG, GridDotPattern
} from './SVGAssets'
import { TestimonialsSection, PlatformShowcase, IndiaCoverage, PricingStripSection } from './SharedSections'

gsap.registerPlugin(ScrollTrigger)

const WebGLScene = dynamic(() => import('./WebGLScene'), { ssr: false })

/**
 * Iteration E: NOIR PROTOCOL
 * Inspired by: KPR (parallax/interactive), Moxy Studio (scroll-triggered layers),
 *              Jeton (dark finance premium), Formless.xyz (interactive storytelling)
 *
 * Concept: Architectural precision, deep dark surfaces, horizontal rule dividers,
 *          numbered sections, technical precision aesthetic. Like a Bloomberg Terminal
 *          meets a creative agency. Every section has a clear purpose and breathing room.
 */
export default function IterationE() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeFeature, setActiveFeature] = useState(0)

  const FEATURES = [
    {
      num: '01',
      title: 'Domain Intelligence',
      body: 'KLA auto-detects 8 content domains from your video — education, food, travel, tech, finance, lifestyle, fitness, and entertainment. Each domain unlocks specialized output templates.',
      visual: '🧠',
    },
    {
      num: '02',
      title: 'Creator DNA Profiling',
      body: 'Your voice fingerprint. KLA learns sentence rhythm, vocabulary set, tone markers, and cultural touchpoints from 5 past videos. Every output is filtered through your DNA.',
      visual: '🧬',
    },
    {
      num: '03',
      title: 'Platform-Native Output',
      body: '6 platforms, 6 completely different algorithms. KLA generates YouTube\'s long-form description, Instagram\'s punchy caption, LinkedIn\'s professional framing, all simultaneously.',
      visual: '🎯',
    },
    {
      num: '04',
      title: 'Cultural Intelligence',
      body: 'Not translation. Adaptation. A cooking video in Tamil for Chennai has different cultural context than Hindi for Delhi. KLA knows the difference.',
      visual: '🌏',
    },
    {
      num: '05',
      title: 'Viral Score Prediction',
      body: 'Before you publish, KLA gives your content a viral likelihood score (0–100) based on engagement patterns from similar content. High score? Push it immediately.',
      visual: '🔥',
    },
  ]

  useEffect(() => {
    let lenis: any
    ;(async () => {
      try {
        const { default: Lenis } = await import('@studio-freight/lenis')
        lenis = new Lenis({ duration: 1.3, smoothWheel: true })
        lenis.on('scroll', ScrollTrigger.update)
        const raf = (time: number) => { lenis.raf(time); requestAnimationFrame(raf) }
        requestAnimationFrame(raf)
      } catch {}
    })()

    const ctx = gsap.context(() => {
      // Hero entrance
      gsap.fromTo('.e-headline span',
        { y: '120%', skewY: 5 },
        { y: '0%', skewY: 0, duration: 1.3, stagger: 0.1, ease: 'power4.out', delay: 0.3 }
      )
      gsap.fromTo('.e-hero-meta',
        { x: -30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.9, ease: 'power3.out', delay: 1.4, stagger: 0.1 }
      )

      // Numbered section reveals
      gsap.utils.toArray<HTMLElement>('.e-reveal').forEach(el => {
        gsap.fromTo(el,
          { y: 50, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%' }
          }
        )
      })

      // Feature rows — alternating left/right
      gsap.utils.toArray<HTMLElement>('.e-feat-row').forEach((el, i) => {
        gsap.fromTo(el,
          { x: i % 2 === 0 ? -60 : 60, opacity: 0 },
          {
            x: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%' }
          }
        )
      })

      // Parallax backgrounds
      gsap.utils.toArray<HTMLElement>('.e-parallax-bg').forEach(el => {
        gsap.to(el, {
          y: '-20%',
          ease: 'none',
          scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1.5 }
        })
      })

      // Number counter reveal
      gsap.utils.toArray<HTMLElement>('.e-number').forEach(el => {
        gsap.fromTo(el,
          { textContent: '0', opacity: 0 },
          {
            opacity: 1, duration: 0.5,
            scrollTrigger: { trigger: el, start: 'top 85%' }
          }
        )
      })

    }, containerRef)

    // Feature auto-cycle
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % FEATURES.length)
    }, 3500)

    return () => { ctx.revert(); lenis?.destroy(); clearInterval(interval) }
  }, [])

  return (
    <div ref={containerRef} className="bg-[#040709] text-white overflow-hidden">
      <style>{`
        @keyframes scan-line {
          0% { transform: translateY(-100%); opacity: 0; }
          20% { opacity: 0.03; }
          80% { opacity: 0.03; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        @keyframes e-blink { 0%,100%{ opacity: 1 } 50%{ opacity: 0 } }
        .e-cursor::after { content: '|'; animation: e-blink 1s step-end infinite; margin-left: 2px; color: #818CF8; }
      `}</style>

      {/* Scan line effect */}
      <div className="fixed inset-0 pointer-events-none z-[1]">
        <div style={{ animation: 'scan-line 8s linear infinite', height: '3px', background: 'white', position: 'absolute', width: '100%' }} />
      </div>

      {/* ══════════ NAV ══════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.05]">
        <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <KLALogoSVG className="h-7 w-18" />
            <div className="w-px h-4 bg-white/10 hidden md:block" />
            <span className="hidden md:block font-mono text-[10px] text-white/20 tracking-[0.3em] uppercase">Content Engine</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-6 mr-4">
              {['Product', 'Pricing', 'Docs'].map(item => (
                <a key={item} href="#" className="text-white/35 hover:text-white text-sm transition-colors font-mono">{item}</a>
              ))}
            </div>
            <div className="flex items-center gap-2 border border-white/10 bg-white/[0.04] rounded-full px-4 py-2">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse flex-shrink-0" />
              <span className="text-white/50 text-xs font-mono">System online</span>
            </div>
            <Link href="/upload" className="ml-2 bg-white text-black font-bold text-sm px-5 py-2 rounded-full hover:bg-white/90 transition-all">
              Launch →
            </Link>
          </div>
        </div>
      </nav>

      {/* ══════════ HERO ══════════ */}
      <section className="relative min-h-screen flex flex-col pt-14 overflow-hidden">
        {/* Parallax background grid */}
        <div className="e-parallax-bg absolute inset-0">
          <GridDotPattern className="w-full h-full text-white opacity-[0.02]" />
        </div>

        {/* WebGL just barely visible */}
        <WebGLScene variant="grid" className="opacity-20" />

        {/* Ambient */}
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-brand-700/15 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[10%] right-[-8%] w-[500px] h-[500px] rounded-full bg-cyan-800/12 blur-[120px] pointer-events-none" />

        {/* Main content */}
        <div className="flex-1 max-w-[1400px] mx-auto w-full px-6 flex flex-col justify-center py-20">
          {/* Section label */}
          <div className="e-hero-meta flex items-center gap-4 mb-12">
            <div className="w-8 h-px bg-brand-500" />
            <span className="font-mono text-[10px] text-brand-400 tracking-[0.4em] uppercase">KLA — Content Protocol v2.6</span>
          </div>

          {/* Giant headline */}
          <h1 className="e-headline font-display font-black leading-[0.86] tracking-[-5px] mb-0">
            {[
              { text: 'ONE', indent: false },
              { text: 'VIDEO.', indent: false },
              { text: 'SIX', indent: true, accent: true },
              { text: 'PLATFORMS.', indent: true, accent: true },
              { text: 'SIXTY', indent: false },
              { text: 'SECONDS.', indent: false },
            ].map((line, i) => (
              <div key={i} className="overflow-hidden" style={{ paddingLeft: line.indent ? 'clamp(2rem, 8vw, 10rem)' : '0' }}>
                <span
                  className={`inline-block text-[clamp(3.5rem,10vw,10rem)] ${
                    line.accent
                      ? 'bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent'
                      : 'text-white'
                  }`}
                >
                  {line.text}
                </span>
              </div>
            ))}
          </h1>
        </div>

        {/* Bottom strip */}
        <div className="e-hero-meta border-t border-white/[0.06] max-w-[1400px] mx-auto w-full px-6 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <p className="text-white/35 text-sm max-w-xs leading-relaxed">
            India's AI content engine. Upload once, get platform-perfect content for 6 networks in 9 languages. In under 60 seconds.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link href="/upload"
              className="group flex items-center gap-2 bg-gradient-to-br from-brand-500 to-brand-600 text-white font-bold px-8 py-3.5 rounded-full hover:shadow-[0_0_40px_rgba(99,102,241,0.35)] transition-all hover:-translate-y-0.5"
            >
              Deploy KLA
              <ArrowRightSVG className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/demo" className="flex items-center gap-2 border border-white/10 text-white/50 font-medium px-8 py-3.5 rounded-full hover:bg-white/[0.05] hover:text-white transition-all">
              Watch Demo
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════ CAPABILITIES TERMINAL ══════════ */}
      <section className="py-20 px-6 border-t border-white/[0.05] bg-[#040709]">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left: feature list */}
            <div>
              <div className="e-reveal font-mono text-xs text-white/20 tracking-[0.3em] uppercase mb-8">
                / capabilities
              </div>
              <div className="space-y-0">
                {FEATURES.map((feat, i) => (
                  <div
                    key={i}
                    className={`e-feat-row border-b border-white/[0.06] py-5 cursor-pointer transition-all duration-300 ${
                      activeFeature === i ? 'pl-4 border-l-2 border-l-brand-500 -ml-4' : 'hover:pl-2'
                    }`}
                    onClick={() => setActiveFeature(i)}
                  >
                    <div className="flex items-center gap-6">
                      <span className="font-mono text-xs text-brand-400 w-6 flex-shrink-0">{feat.num}</span>
                      <span className={`font-display font-bold text-xl transition-colors ${activeFeature === i ? 'text-white' : 'text-white/40'}`}>
                        {feat.title}
                      </span>
                      <span className="ml-auto text-lg">{activeFeature === i ? feat.visual : ''}</span>
                    </div>
                    {activeFeature === i && (
                      <div className="mt-3 ml-12 text-white/45 text-sm leading-relaxed">
                        {feat.body}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: terminal window */}
            <div className="e-reveal sticky top-24">
              <div className="border border-white/[0.08] bg-[#0a0c10] rounded-2xl overflow-hidden">
                {/* Terminal header */}
                <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.07]">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                  </div>
                  <span className="font-mono text-xs text-white/20 ml-2">kla.engine — content_pipeline</span>
                </div>
                {/* Terminal body */}
                <div className="p-6 font-mono text-xs space-y-3">
                  <div className="text-white/20">$ kla process --input="video.mp4" --mode=full</div>
                  <div className="text-emerald-400">✓ Transcription complete (AWS Transcribe)</div>
                  <div className="text-emerald-400">✓ Domain detected: <span className="text-white/60">tech_education</span></div>
                  <div className="text-brand-400">⟳ Generating platform content...</div>
                  <div className="space-y-1 pl-4 border-l border-white/[0.1]">
                    {PLATFORM_CONFIG.map((p, i) => (
                      <div key={i} className="flex items-center gap-2 text-white/30">
                        <span className="text-emerald-400">✓</span>
                        <span>{p.name}</span>
                        <span className="text-white/15">·</span>
                        <span className="text-white/20">{3 + i}s</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-emerald-400">✓ Cultural adaptation: <span className="text-white/60">9 languages</span></div>
                  <div className="text-brand-400">⟳ Calculating viral score...</div>
                  <div className="text-emerald-400">✓ Viral score: <span className="text-white font-bold">87/100</span> — High potential</div>
                  <div className="text-white/20 mt-2">Total time: <span className="text-white/50">52s</span></div>
                  <div className="text-brand-400 e-cursor">Ready</div>
                </div>

                {/* Waveform at bottom */}
                <div className="border-t border-white/[0.07] px-5 py-3">
                  <WaveformSVG className="w-full text-brand-400 opacity-40 h-8" />
                </div>
              </div>

              {/* Platform flow diagram */}
              <div className="mt-4 border border-white/[0.06] bg-white/[0.02] rounded-2xl p-5 text-center">
                <PlatformFlowSVG className="w-full h-24 opacity-60" />
                <p className="text-white/20 text-xs font-mono mt-2">Real-time content routing</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ METRICS ROW ══════════ */}
      <section className="border-y border-white/[0.05] bg-[#040709]">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/[0.05]">
            {[
              { num: '60s', desc: 'Generation time' },
              { num: '54×', desc: 'Content multiplication' },
              { num: '9', desc: 'Indian languages' },
              { num: '50K+', desc: 'Active creators' },
            ].map((m, i) => (
              <div key={i} className="e-reveal py-12 px-8 text-center">
                <div className="font-display font-black text-[3.5rem] text-white tracking-[-2px]">{m.num}</div>
                <div className="text-white/20 text-xs font-mono mt-1 tracking-[0.2em] uppercase">{m.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ PLATFORMS ══════════ */}
      <PlatformShowcase />

      {/* ══════════ INDIA COVERAGE ══════════ */}
      <IndiaCoverage />

      {/* ══════════ TESTIMONIALS ══════════ */}
      <TestimonialsSection variant="darker" />

      {/* ══════════ PRICING ══════════ */}
      <PricingStripSection />

      {/* ══════════ CTA ══════════ */}
      <section className="relative py-40 px-6 overflow-hidden border-t border-white/[0.05]">
        <WebGLScene variant="sphere" className="opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-900/15 to-transparent pointer-events-none" />

        <div className="e-reveal relative z-10 max-w-[1000px] mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="font-mono text-xs text-brand-400 tracking-[0.3em] uppercase mb-5">/ call_to_action</div>
              <h2 className="font-display font-black text-[clamp(3rem,6vw,5rem)] tracking-[-3px] text-white leading-tight">
                Ship content<br />at machine speed.
              </h2>
            </div>
            <div className="space-y-5">
              <p className="text-white/40 text-lg leading-relaxed">
                Stop formatting. Stop translating. Stop adapting. KLA does all of it in under 60 seconds so you can focus on what you do best: creating.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/upload"
                  className="flex items-center justify-center gap-2 bg-gradient-to-br from-brand-500 to-brand-600 text-white font-bold px-8 py-4 rounded-xl hover:shadow-[0_0_40px_rgba(99,102,241,0.3)] transition-all hover:-translate-y-0.5"
                >
                  Deploy KLA Free
                </Link>
                <Link href="/membership"
                  className="flex items-center justify-center gap-2 border border-white/10 text-white/50 font-medium px-8 py-4 rounded-xl hover:bg-white/[0.05] hover:text-white transition-all"
                >
                  View Pricing
                </Link>
              </div>
              <p className="text-white/20 text-xs font-mono">No card required · 10 free videos · Cancel anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="border-t border-white/[0.05] py-10 px-6 bg-[#02030a]">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-5">
          <KLALogoSVG className="h-7 w-18" />
          <div className="flex gap-6 font-mono text-xs text-white/20">
            {['Product', 'Pricing', 'Privacy', 'Terms', 'Contact'].map(l => (
              <a key={l} href="#" className="hover:text-white/50 transition-colors">{l}</a>
            ))}
          </div>
          <div className="font-mono text-[10px] text-white/15 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            © 2026 KLA · Made in India 🇮🇳
          </div>
        </div>
      </footer>
    </div>
  )
}
