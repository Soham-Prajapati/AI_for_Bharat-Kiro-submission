'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger)

const features = [
  { icon: '🎯', title: 'Multi-Platform', desc: 'Generate for YouTube, Instagram, LinkedIn, Twitter, Facebook, TikTok', span: 'col-span-1' },
  { icon: '🌍', title: '9 Indian Languages', desc: 'Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati, English', span: 'col-span-1 md:col-span-2' },
  { icon: '⚡', title: '60 Seconds Flat', desc: 'Transform 1 video into 6 platform-optimized posts in under a minute', span: 'col-span-1' },
  { icon: '🧠', title: 'Creator DNA', desc: 'AI learns your style, tone, and personality for authentic content', span: 'col-span-1' },
  { icon: '📊', title: 'Viral Predictor', desc: 'Get viral score predictions before you post — hooks, pacing, emotional peaks', span: 'col-span-1' },
  { icon: '💰', title: 'ROI Calculator', desc: 'Track time and money saved with detailed analytics', span: 'col-span-1' },
]

export default function FeatureGrid() {
  const gridRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const scroller = document.querySelector('#main-scroll') || undefined

    // Clip-path wipe reveal
    cardRefs.current.filter(Boolean).forEach((card, i) => {
      gsap.fromTo(card, {
        clipPath: 'inset(0 0 100% 0)',
        opacity: 0,
      }, {
        clipPath: 'inset(0 0 0% 0)',
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: card,
          scroller,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
        delay: i * 0.06,
      })
    })

    return () => { ScrollTrigger.getAll().forEach(t => t.kill()) }
  }, [])

  return (
    <section className="py-28 px-6 relative">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <p className="text-text-tertiary text-xs uppercase tracking-[0.2em] mb-3">Features</p>
          <h2 className="font-display text-[clamp(1.8rem,4vw,3rem)] font-extrabold max-w-[600px] mx-auto">
            Everything You Need to <span className="bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">Scale Content</span>
          </h2>
        </p>

        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <div
              key={i}
              ref={el => { cardRefs.current[i] = el }}
              className={`glass glass-hover rounded-2xl p-7 group transition-all duration-300 hover:-translate-y-1 ${f.span}`}
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-display font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{f.desc}</p>
            </p>
          ))}
        </div>
      </section>
    </section>
  )
}
