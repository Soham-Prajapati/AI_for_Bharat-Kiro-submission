'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import gsap from 'gsap'

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)
  const subRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const techRef = useRef<HTMLDivElement>(null)
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([])
  const [counter, setCounter] = useState(0)

  // 60s count-up in the hero stat
  useEffect(() => {
    let frame: number
    const start = performance.now()
    const duration = 5000 // 5 seconds
    const target = 60

    const animate = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // ease-in-out cubic for immersive feel
      const eased = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2
      setCounter(Math.floor(eased * target))
      if (progress < 1) frame = requestAnimationFrame(animate)
    }

    // Start after hero animation completes (~2s)
    const timeout = setTimeout(() => {
      frame = requestAnimationFrame(animate)
    }, 2000)

    return () => { clearTimeout(timeout); cancelAnimationFrame(frame) }
  }, [])

  // GSAP hero timeline
  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.3 })

    tl.to(badgeRef.current, { opacity: 1, duration: 0.6, ease: 'power2.out' })
      .to(wordRefs.current.filter(Boolean), {
        opacity: 1, y: 0, rotateX: 0,
        duration: 0.7, stagger: 0.08, ease: 'power3.out'
      }, '-=0.3')
      .to(subRef.current, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3')
      .to(ctaRef.current, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.2')
      .to(techRef.current, { opacity: 1, duration: 0.5, ease: 'power2.out' }, '-=0.2')

    return () => { tl.kill() }
  }, [])

  // Mouse parallax on depth layers
  useEffect(() => {
    const layers = document.querySelectorAll<HTMLDivElement>('.depth-layer')
    const onMove = (e: MouseEvent) => {
      layers.forEach(l => {
        const speed = parseFloat(l.dataset.speed || '0')
        const dx = (e.clientX - window.innerWidth / 2) * speed
        const dy = (e.clientY - window.innerHeight / 2) * speed
        l.style.transform = `translate(${dx}px, ${dy}px)`
      })
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  const words = [
    { text: '1', hl: false }, { text: 'Video.', hl: false },
    { text: '6', hl: true }, { text: 'Platforms.', hl: true },
    { text: '60', hl: false }, { text: 'Seconds.', hl: false },
  ]

  return (
    <section ref={sectionRef} className="full-section pt-20 text-center relative">
      {/* Ambient background */}
      <div className="ambient">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {/* Parallax depth layers */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="depth-layer absolute w-[300px] h-[300px] rounded-full bg-brand-500 opacity-[0.12] top-[10%] left-[5%] blur-[80px]" data-speed="0.03" />
        <div className="depth-layer absolute w-[200px] h-[200px] rounded-full bg-cyan-400 opacity-[0.12] bottom-[15%] right-[10%] blur-[60px]" data-speed="0.05" />
        <div className="depth-layer absolute w-[250px] h-[250px] rounded-full bg-accent-orange opacity-[0.12] top-[60%] left-[50%] blur-[100px]" data-speed="0.02" />
      </div>

      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        {/* Badge */}
        <div ref={badgeRef} className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs text-text-secondary mb-10 opacity-0">
          <div className="w-2 h-2 bg-accent-success rounded-full animate-pulse-glow" />
          AI for Bharat 2026 · Powered by <span className="text-accent-orange font-semibold">&nbsp;AWS Bedrock</span>
        </div>

        {/* Title */}
        <h1 className="font-display text-[clamp(3rem,8vw,6rem)] font-black leading-none tracking-[-3px] mb-8">
          {words.map((w, i) => (
            <span key={i}>
              <span
                ref={el => { wordRefs.current[i] = el }}
                className={`inline-block opacity-0 translate-y-20 [transform:rotateX(40deg)] origin-bottom ${w.hl ? 'bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent' : ''}`}
              >
                {w.text}
              </span>
              {i === 1 || i === 3 ? <br /> : ' '}
            </span>
          ))}
        </h1>

        {/* Sub */}
        <p ref={subRef} className="text-lg text-text-secondary max-w-[550px] mx-auto mb-10 leading-relaxed opacity-0 translate-y-8">
          Upload once. AI generates platform-native content for YouTube, Instagram, LinkedIn, Twitter, Facebook & TikTok — in 9 Indian languages.
        </p>

        {/* CTAs */}
        <div ref={ctaRef} className="flex gap-4 justify-center flex-wrap opacity-0 translate-y-5">
          <Link href="#showcase" className="inline-flex items-center gap-2 bg-gradient-to-br from-brand-500 to-brand-600 text-white font-semibold text-base px-8 py-3.5 rounded-xl brand-glow hover:shadow-[0_0_40px_rgba(99,102,241,0.4)] transition-all hover:-translate-y-0.5">
            🚀 See It In Action
          </Link>
          <Link href="#try" className="inline-flex items-center gap-2 bg-transparent text-text-secondary font-medium text-base px-8 py-3.5 rounded-xl border border-white/10 hover:bg-white/5 hover:border-white/20 hover:text-text-primary transition-all">
            🎯 Try It Yourself
          </Link>
        </div>

        {/* Tech badges */}
        <div ref={techRef} className="flex gap-3 justify-center flex-wrap mt-6 opacity-0">
          {['AWS Bedrock', 'Claude 3', 'AWS Transcribe', 'S3 + DynamoDB'].map(t => (
            <span key={t} className="text-[0.7rem] px-3 py-1 rounded-md bg-accent-orange/[0.08] border border-accent-orange/[0.15] text-accent-orange font-medium font-mono">
              {t}
            </span>
          ))}
        </div>

        {/* Stats row with 60s count-up */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto mt-16">
          <div className="glass glass-hover rounded-2xl p-6 text-center">
            <div className="text-4xl font-display font-black bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">{counter}s</div>
            <div className="text-text-tertiary text-sm mt-1">Avg. Generation Time</div>
          </div>
          <div className="glass glass-hover rounded-2xl p-6 text-center">
            <div className="text-4xl font-display font-black text-brand-400">6</div>
            <div className="text-text-tertiary text-sm mt-1">Platforms Supported</div>
          </div>
          <div className="glass glass-hover rounded-2xl p-6 text-center">
            <div className="text-4xl font-display font-black text-cyan-400">9</div>
            <div className="text-text-tertiary text-sm mt-1">Indian Languages</div>
          </div>
        </div>
      </div>
    </section>
  )
}
