'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'
import { TestimonialsSection, PlatformShowcase, IndiaCoverage, PricingStripSection } from './SharedSections'

gsap.registerPlugin(ScrollTrigger)

const MARQUEE_ITEMS = ['1 VIDEO', '6 PLATFORMS', '60 SECONDS', '9 LANGUAGES', 'CREATOR DNA', 'VIRAL SCORE', 'KLA ENGINE']

const PLATFORMS = ['YouTube', 'Instagram', 'LinkedIn', 'Twitter', 'Facebook', 'TikTok']

function MarqueeStrip({ reverse = false, speed = 40 }: { reverse?: boolean; speed?: number }) {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS]
  return (
    <div className="overflow-hidden whitespace-nowrap py-4 border-y border-white/10">
      <div
        className="inline-flex gap-8"
        style={{
          animation: `marquee${reverse ? 'Rev' : ''} ${speed}s linear infinite`,
        }}
      >
        {items.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-8 font-display font-black text-5xl md:text-7xl tracking-[-2px]">
            <span className={i % 3 === 1 ? 'text-accent-orange' : 'text-white'}>{item}</span>
            <span className="text-white/20 text-3xl font-light">×</span>
          </span>
        ))}
      </div>
    </div>
  )
}

export default function IterationB() {
  const containerRef = useRef<HTMLDivElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)
  const [hoveredPlatform, setHoveredPlatform] = useState<number | null>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Staggered line entrance
      const lines = headlineRef.current?.querySelectorAll('.line')
      if (lines) {
        gsap.fromTo(lines,
          { y: '110%', skewY: 4 },
          { y: '0%', skewY: 0, duration: 1.1, stagger: 0.12, ease: 'power4.out', delay: 0.2 }
        )
      }

      // Counter 0 → 60
      let counter = { val: 0 }
      gsap.to(counter, {
        val: 60,
        duration: 3,
        delay: 1.5,
        ease: 'power2.out',
        onUpdate: () => {
          if (counterRef.current) counterRef.current.textContent = Math.floor(counter.val) + 's'
        }
      })

      // Scroll-triggered sections
      gsap.utils.toArray<HTMLElement>('.reveal-b').forEach((el) => {
        gsap.fromTo(el,
          { y: 80, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%' }
          }
        )
      })

      // Platform list items
      gsap.utils.toArray<HTMLElement>('.platform-item').forEach((el, i) => {
        gsap.fromTo(el,
          { x: -60, opacity: 0 },
          {
            x: 0, opacity: 1, duration: 0.7, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 90%' },
            delay: i * 0.08,
          }
        )
      })
    }, containerRef)

    // Smooth scroll via Lenis
    let lenis: any
    ;(async () => {
      try {
        const LenisModule = await import('@studio-freight/lenis')
        const Lenis = LenisModule.default
        lenis = new Lenis({ duration: 1.2, smoothWheel: true })
        lenis.on('scroll', ScrollTrigger.update)
        const raf = (time: number) => { lenis.raf(time); requestAnimationFrame(raf) }
        requestAnimationFrame(raf)
      } catch {}
    })()

    return () => {
      ctx.revert()
      lenis?.destroy()
    }
  }, [])

  return (
    <div ref={containerRef} className="bg-[#050505] text-white">
      <style>{`
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-33.33%); } }
        @keyframes marqueeRev { from { transform: translateX(-33.33%); } to { transform: translateX(0); } }
      `}</style>

      {/* ══════════ HERO ══════════ */}
      <section className="relative min-h-screen flex flex-col pt-32 pb-0 overflow-hidden">
        {/* Background noise texture simulation */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")', backgroundSize: '200px' }} />

        <div className="flex-1 max-w-[1400px] mx-auto w-full px-6 flex flex-col justify-center">
          {/* Eyebrow */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-px bg-accent-orange" />
            <span className="font-mono text-xs text-accent-orange tracking-[0.3em] uppercase">India's Content Engine</span>
          </div>

          {/* Main headline */}
          <h1 ref={headlineRef} className="font-display font-black leading-[0.88] tracking-[-4px] mb-0">
            {[
              { text: 'CREATE', color: 'text-white' },
              { text: 'ONCE.', color: 'text-white' },
              { text: 'REACH', color: 'text-accent-orange' },
              { text: 'EVERYONE.', color: 'text-accent-orange' },
            ].map((l, i) => (
              <div key={i} className="overflow-hidden">
                <span
                  className={`line inline-block text-[clamp(4rem,12vw,11rem)] ${l.color}`}
                  style={{ display: 'block' }}
                >
                  {l.text}
                </span>
              </div>
            ))}
          </h1>
        </div>

        {/* Bottom info row */}
        <div className="max-w-[1400px] mx-auto w-full px-6 pb-16 flex flex-col md:flex-row justify-between items-end gap-8">
          <p className="text-white/40 text-base max-w-xs leading-relaxed">
            KLA transforms a single video into 54 platform-ready content pieces across 6 networks & 9 languages.
          </p>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="font-display font-black text-5xl text-accent-orange">
                <span ref={counterRef}>0s</span>
              </div>
              <div className="text-white/30 text-xs font-mono mt-1 tracking-wider">AVG. GENERATION</div>
            </div>
            <Link href="/upload"
              className="bg-accent-orange text-black font-black text-base px-8 py-4 rounded-full hover:bg-white transition-colors hover:-translate-y-0.5 transform"
            >
              TRY IT NOW →
            </Link>
          </div>
        </div>

        {/* Right-side vertical text */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center gap-3">
          <div className="w-px h-20 bg-white/10" />
          <span className="font-mono text-[10px] text-white/20 tracking-[0.4em] uppercase rotate-90 whitespace-nowrap">KLA — 2026</span>
          <div className="w-px h-20 bg-white/10" />
        </div>
      </section>

      {/* ══════════ MARQUEE ══════════ */}
      <div className="py-2 bg-[#050505]">
        <MarqueeStrip speed={35} />
        <MarqueeStrip reverse speed={28} />
      </div>

      {/* ══════════ PLATFORMS ══════════ */}
      <section className="py-32 px-6 border-t border-white/[0.06]">
        <div className="max-w-[1200px] mx-auto">
          <div className="reveal-b mb-16">
            <p className="font-mono text-xs text-white/30 tracking-[0.3em] uppercase mb-3">Platforms</p>
            <h2 className="font-display font-black text-[clamp(2.5rem,6vw,5rem)] tracking-[-3px]">
              Six channels.<br />Zero extra work.
            </h2>
          </div>

          <div className="space-y-0">
            {PLATFORMS.map((p, i) => (
              <div
                key={i}
                className={`platform-item flex items-center justify-between py-6 border-b border-white/[0.07] cursor-default transition-all duration-300 group ${hoveredPlatform === i ? 'pl-4' : ''}`}
                onMouseEnter={() => setHoveredPlatform(i)}
                onMouseLeave={() => setHoveredPlatform(null)}
                style={{ opacity: 0 }}
              >
                <div className="flex items-center gap-6">
                  <span className="font-mono text-xs text-white/20 w-8">{String(i + 1).padStart(2, '0')}</span>
                  <span className="font-display font-black text-[clamp(1.5rem,4vw,3.5rem)] tracking-[-1px] transition-colors duration-300 group-hover:text-accent-orange">
                    {p}
                  </span>
                </div>
                <div className={`font-mono text-xs text-white/30 transition-all duration-300 ${hoveredPlatform === i ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
                  Platform-native format ↗
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ SPLIT FEATURE ══════════ */}
      <section className="py-24 px-6 bg-accent-orange">
        <div className="max-w-[1200px] mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="reveal-b">
            <h2 className="font-display font-black text-[clamp(2.5rem,5vw,4.5rem)] text-black tracking-[-3px] leading-tight">
              Creator DNA.<br />Your voice.<br />Everywhere.
            </h2>
          </div>
          <div className="reveal-b">
            <p className="text-black/70 text-lg leading-relaxed mb-8">
              KLA learns your unique style from past content. Every AI-generated post sounds exactly like you wrote it — not a generic template.
            </p>
            <Link href="/upload" className="inline-flex items-center gap-2 bg-black text-white font-bold px-8 py-4 rounded-full hover:bg-white/90 hover:text-black transition-all">
              Activate DNA Profile
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════ LANGUAGE GRID ══════════ */}
      <section className="py-32 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="reveal-b text-center mb-16">
            <h2 className="font-display font-black text-[clamp(2.5rem,6vw,5.5rem)] tracking-[-3px]">
              India's <span className="text-white/20">9</span> languages.<br />
              <span className="text-accent-orange">One upload.</span>
            </h2>
          </div>
          <div className="reveal-b grid grid-cols-3 md:grid-cols-9 gap-4 text-center">
            {['हिन्दी', 'தமிழ்', 'తెలుగు', 'ಕನ್ನಡ', 'বাংলা', 'मराठी', 'ગુજરાતી', 'ਪੰਜਾਬੀ', 'മലയാളം'].map((lang, i) => (
              <div key={i} className="border border-white/[0.07] bg-white/[0.02] rounded-xl py-3 px-2 text-sm font-medium text-white/50 hover:text-white hover:border-white/20 transition-all cursor-default">
                {lang}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CTA ══════════ */}
      <section className="py-32 px-6 bg-[#050505] border-t border-white/[0.06] text-center">
        <div className="reveal-b max-w-[900px] mx-auto">
          <h2 className="font-display font-black text-[clamp(3rem,8vw,7rem)] tracking-[-4px] leading-none mb-12">
            STOP<br /><span className="text-white/20">ADAPTING.</span><br />START<br /><span className="text-accent-orange">CREATING.</span>
          </h2>
          <Link href="/upload"
            className="inline-flex items-center gap-3 border-2 border-white text-white font-black text-xl px-12 py-5 rounded-full hover:bg-white hover:text-black transition-all duration-300"
          >
            Launch KLA Free
          </Link>
        </div>
      </section>

      {/* ══════════ PLATFORM SHOWCASE ══════════ */}
      <PlatformShowcase />

      {/* ══════════ INDIA COVERAGE ══════════ */}
      <IndiaCoverage />

      {/* ══════════ TESTIMONIALS ══════════ */}
      <TestimonialsSection variant="orange" />

      {/* ══════════ PRICING ══════════ */}
      <PricingStripSection />

      {/* ══════════ FOOTER ══════════ */}
      <footer className="border-t border-white/[0.06] py-10 px-6">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-white/30 text-sm">
          <span className="font-display font-black text-3xl text-white tracking-[-1px]">KLA</span>
          <div className="font-mono text-xs tracking-[0.2em]">India's Content Multiplication Engine · © 2026</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white/60 transition-colors">Pricing</a>
            <a href="/dashboard" className="hover:text-white/60 transition-colors">Dashboard</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
