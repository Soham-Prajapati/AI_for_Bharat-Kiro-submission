'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger)

const plans = [
  { name: 'Starter', price: 'Free', desc: 'For individual creators just getting started.', features: ['5 videos/month', '3 platforms', 'English + Hindi', 'Basic analytics'], cta: 'Start Free', pop: false },
  { name: 'Pro', price: '₹999', desc: 'For serious creators scaling across platforms.', features: ['50 videos/month', '6 platforms', '9 languages', 'Viral predictor', 'Creator DNA', 'Priority support'], cta: 'Go Pro', pop: true },
  { name: 'Team', price: '₹2,999', desc: 'For agencies and content teams.', features: ['Unlimited videos', '6 platforms', '9 languages', 'All AI features', 'Collaborative workspace', 'Custom integrations'], cta: 'Contact Us', pop: false },
]

export default function PricingCards() {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const scroller = document.querySelector('#main-scroll') || undefined

    cardRefs.current.filter(Boolean).forEach((card, i) => {
      gsap.from(card, {
        y: 60, opacity: 0,
        duration: 0.7, delay: i * 0.12,
        scrollTrigger: { trigger: card, scroller, start: 'top 85%', toggleActions: 'play none none reverse' }
      })
    })
    return () => { ScrollTrigger.getAll().forEach(t => t.kill()) }
  }, [])

  return (
    <section className="py-28 px-6 relative">
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center mb-16">
          <p className="text-text-tertiary text-xs uppercase tracking-[0.2em] mb-3">Pricing</p>
          <h2 className="font-display text-[clamp(1.8rem,4vw,3rem)] font-extrabold">
            Simple, <span className="bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">Honest</span> Pricing
          </h2>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan, i) => (
            <div
              key={i}
              ref={el => { cardRefs.current[i] = el }}
              className={`glass glass-hover rounded-2xl p-7 flex flex-col transition-all hover:-translate-y-1 ${plan.pop ? 'border-brand-500/30 ring-1 ring-brand-500/20 relative' : ''}`}
            >
              {plan.pop && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs px-3 py-0.5 bg-brand-500 text-white rounded-full font-semibold">Most Popular</div>
              )}
              <h3 className="font-display text-lg font-bold mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-display font-black">{plan.price}</span>
                {plan.price !== 'Free' && <span className="text-text-tertiary text-sm">/month</span>}
              </span>
              <p className="text-text-secondary text-sm mb-5">{plan.desc}</p>
              <ul className="flex-1 space-y-2.5 mb-6">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-text-secondary">
                    <span className="text-accent-success text-xs">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/membership"
                className={`text-center py-3 rounded-xl font-semibold text-sm transition-all ${plan.pop
                  ? 'bg-gradient-to-br from-brand-500 to-brand-600 text-white brand-glow hover:shadow-[0_0_35px_rgba(99,102,241,0.3)]'
                  : 'bg-white/5 text-text-primary border border-white/10 hover:bg-white/10'
                }`}
              >
                {plan.cta}
              </Link>
            </h3>
          ))}
        </div>
      </section>
    </section>
  )
}
