'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger)

export default function CtaSection() {
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    const scroller = document.querySelector('#main-scroll') || undefined

    wordRefs.current.filter(Boolean).forEach((el, i) => {
      gsap.from(el, {
        y: 40, opacity: 0,
        duration: 0.5, delay: i * 0.05,
        scrollTrigger: { trigger: el?.parentElement?.parentElement, scroller, start: 'top 80%', toggleActions: 'play none none reverse' }
      })
    })
    return () => { ScrollTrigger.getAll().forEach(t => t.kill()) }
  }, [])

  const words = 'Stop adapting. Start creating. Let the machines do the rest.'.split(' ')

  return (
    <section className="full-section text-center py-24">
      <div className="max-w-[800px] mx-auto px-6">
        <h2 className="font-display text-[clamp(1.8rem,5vw,3.5rem)] font-extrabold mb-8 leading-tight">
          {words.map((w, i) => (
            <span key={i}>
              <span ref={el => { wordRefs.current[i] = el }} className="inline-block">{w}</span>{' '}
            </span>
          ))}
        </h2>
        <div className="flex gap-4 justify-center">
          <Link href="/upload" className="bg-gradient-to-br from-brand-500 to-brand-600 text-white font-semibold px-8 py-4 rounded-xl brand-glow hover:shadow-[0_0_40px_rgba(99,102,241,0.4)] transition-all hover:-translate-y-0.5 text-base">
            Get Started Free
          </Link>
        </div>
      </section>
    </section>
  )
}
