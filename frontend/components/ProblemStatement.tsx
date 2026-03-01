'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger)

export default function ProblemStatement() {
  const sectionRef = useRef<HTMLElement>(null)
  const subRef = useRef<HTMLParagraphElement>(null)
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    const scroller = document.querySelector('#main-scroll') || undefined

    // Line-by-line reveal on scroll
    lineRefs.current.filter(Boolean).forEach((el) => {
      gsap.to(el, {
        y: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: {
          trigger: el?.parentElement,
          scroller,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        }
      })
    })
    gsap.to(subRef.current, {
      opacity: 1, duration: 0.6,
      scrollTrigger: { trigger: subRef.current, scroller, start: 'top 85%' }
    })

    return () => { ScrollTrigger.getAll().forEach(t => t.kill()) }
  }, [])

  const lines = [
    { pre: 'You create ', em: 'one video', post: '.', color: 'text-brand-400' },
    { pre: 'Then spend ', em: '3 hours', post: ' adapting it', color: 'text-accent-orange' },
    { pre: 'for ', em: '6 different platforms', post: '.', color: 'text-cyan-400' },
  ]

  return (
    <section ref={sectionRef} className="full-section text-center">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="font-display font-extrabold text-[clamp(1.8rem,5vw,3.5rem)] leading-[1.3] tracking-tight max-w-[900px] mx-auto">
          {lines.map((line, i) => (
            <span key={i} className="block overflow-hidden">
              <span
                ref={el => { lineRefs.current[i] = el }}
                className="block translate-y-full"
              >
                {line.pre}<span className={line.color}>{line.em}</span>{line.post}
              </span>
            </span>
          ))}
        </div>
        <p ref={subRef} className="mt-6 text-lg text-text-tertiary opacity-0">
          Different formats. Different tones. Different hashtags. Different languages. Every. Single. Time.
        </p>
      </div>
    </section>
  )
}
