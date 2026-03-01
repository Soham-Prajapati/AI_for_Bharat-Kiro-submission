'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger)

export default function ShiftSection() {
  const numRef = useRef<HTMLDivElement>(null)
  const subRef = useRef<HTMLParagraphElement>(null)
  const [count, setCount] = useState(0)
  const counted = useRef(false)

  useEffect(() => {
    const scroller = document.querySelector('#main-scroll') || undefined

    // Big number: scale + unblur on scroll
    gsap.to(numRef.current, {
      opacity: 1, scale: 1, filter: 'blur(0px)',
      duration: 1.2, ease: 'power2.out',
      scrollTrigger: {
        trigger: numRef.current,
        scroller,
        start: 'top 60%',
        toggleActions: 'play none none reverse',
        onEnter: () => {
          if (counted.current) return
          counted.current = true
          // Count 0 → 60 over 5 seconds with cubic ease
          const start = performance.now()
          const dur = 5000
          const animate = (now: number) => {
            const p = Math.min((now - start) / dur, 1)
            const eased = p < 0.5
              ? 4 * p * p * p
              : 1 - Math.pow(-2 * p + 2, 3) / 2
            setCount(Math.floor(eased * 60))
            if (p < 1) requestAnimationFrame(animate)
          }
          requestAnimationFrame(animate)
        }
      }
    })
    gsap.to(subRef.current, {
      opacity: 1, duration: 0.6, delay: 0.4,
      scrollTrigger: { trigger: subRef.current, scroller, start: 'top 55%' }
    })

    return () => { ScrollTrigger.getAll().forEach(t => t.kill()) }
  }, [])

  return (
    <section className="full-section text-center">
      <div className="max-w-[1200px] mx-auto px-6">
        <div
          ref={numRef}
          className="font-display font-black text-[clamp(5rem,15vw,12rem)] tracking-[-4px] leading-none opacity-0 scale-[0.6] blur-[10px]"
        >
          <span className="bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">{count}</span>
          <span className="text-text-primary">s</span>
        </span>
        <p ref={subRef} className="text-[1.3rem] text-text-tertiary max-w-[500px] mx-auto mt-6 opacity-0">
          What if all of that took sixty seconds?
        </p>
      </section>
    </section>
  )
}
