'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger)

const steps = [
  { num: '01', title: 'Upload & Detect', desc: 'Paste a YouTube link or drop a file. AI transcribes (AWS Transcribe), detects your creator DNA, and identifies the domain — all before you blink.', time: '~10 seconds', tech: 'AWS Transcribe + S3' },
  { num: '02', title: 'AI Generates Everything', desc: 'Claude 3 (via AWS Bedrock) detects domain, generates platform-native content, SEO, hashtags, and vernacular translations — one pass.', time: '~40 seconds', tech: 'Bedrock + Claude 3' },
  { num: '03', title: 'Review & Publish', desc: 'Human-in-the-loop. Edit inline, approve what works. Your voice, your control.', time: '~10 seconds', tech: 'DynamoDB + Lambda' },
]

export default function HowItWorks() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const track = trackRef.current
    const wrap = wrapRef.current
    if (!track || !wrap) return

    const scroller = document.querySelector('#main-scroll') || undefined

    // Horizontal scroll
    const totalWidth = track.scrollWidth - window.innerWidth
    gsap.to(track, {
      x: -totalWidth,
      ease: 'none',
      scrollTrigger: {
        trigger: wrap,
        scroller,
        start: 'top top',
        end: () => `+=${totalWidth}`,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
      }
    })

    // Stagger card animations
    cardRefs.current.filter(Boolean).forEach((card, i) => {
      gsap.from(card, {
        y: 30, opacity: 0,
        scrollTrigger: {
          trigger: wrap,
          scroller,
          start: `top+=${i * 25}% center`,
          toggleActions: 'play none none reverse',
        },
        duration: 0.6,
      })
    })

    return () => { ScrollTrigger.getAll().forEach(t => t.kill()) }
  }, [])

  return (
    <section ref={wrapRef} className="overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full pt-16 pb-8 z-10 pointer-events-none px-8">
        <p className="text-text-tertiary text-xs uppercase tracking-[0.2em] mb-3">How It Works</p>
        <h2 className="font-display text-[clamp(1.5rem,3vw,2rem)] font-extrabold">Three Steps. Sixty Seconds.</h2>
      </div>

      <div ref={trackRef} className="flex items-center gap-8 pl-8 pr-32 h-screen" style={{ width: `${100 + steps.length * 40}vw` }}>
        <div className="w-[40vw] shrink-0" />
        {steps.map((step, i) => (
          <div
            key={i}
            ref={el => { cardRefs.current[i] = el }}
            className="glass glass-hover group rounded-2xl p-8 min-w-[420px] max-w-[440px] shrink-0 flex flex-col justify-between min-h-[340px] border-t-2"
            style={{ borderTopColor: i === 0 ? 'var(--brand-l)' : i === 1 ? 'var(--cyan)' : 'var(--success)' }}
          >
            <div>
              <div className="font-display text-5xl font-extrabold text-text-tertiary mb-4 opacity-20">{step.num}</div>
              <h3 className="font-display text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{step.desc}</p>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <span className="text-xs px-2.5 py-1 rounded-md bg-accent-success/10 text-accent-success font-medium font-mono">{step.time}</span>
              <span className="text-xs px-2.5 py-1 rounded-md bg-accent-orange/10 text-accent-orange font-medium font-mono">{step.tech}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
