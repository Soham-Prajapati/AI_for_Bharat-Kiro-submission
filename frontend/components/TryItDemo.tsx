'use client'

import { useState, useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger)

export default function TryItDemo() {
  const sectionRef = useRef<HTMLElement>(null)
  const [url, setUrl] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle')
  const [status, setStatus] = useState('')

  useEffect(() => {
    const scroller = document.querySelector('#main-scroll') || undefined

    gsap.from(sectionRef.current, {
      y: 20, opacity: 0, duration: 0.8,
      scrollTrigger: { trigger: sectionRef.current, scroller, start: 'top 80%' }
    })
    return () => { ScrollTrigger.getAll().forEach(t => t.kill()) }
  }, [])

  const generate = async () => {
    if (!url.trim()) return
    setState('loading')
    setStatus('Transcribing audio…')
    await wait(1500)
    setStatus('Analyzing content with Claude 3…')
    await wait(1500)
    setStatus('Generating for 6 platforms…')
    await wait(1500)
    setStatus('Done! 🎉')
    setState('done')
  }

  const wait = (ms: number) => new Promise(r => setTimeout(r, ms))

  const results = [
    { p: 'YouTube', text: '"5 मिनट में बनाएं Restaurant Style Paneer | Quick Recipe 🔥"', tags: '#PaneerRecipe #QuickCooking' },
    { p: 'Instagram', text: '"POV: Your paneer just went from fridge to restaurant-quality 🧈✨"', tags: '#Reels #FoodTok' },
    { p: 'LinkedIn', text: '"What cooking taught me about scaling: The 80/20 rule works in the kitchen too."', tags: '#ContentStrategy' },
    { p: 'Twitter/X', text: '"5 min paneer recipe that slaps. Thread 🧵👇"', tags: '#FoodTwitter' },
    { p: 'Facebook', text: '"Try this tonight! Restaurant-quality paneer in 5 minutes 😍"', tags: '#HomeChef' },
    { p: 'TikTok', text: '"Wait for the FLIP 🍳 5 min paneer recipe!"', tags: '#FoodTikTok' },
  ]

  return (
    <section ref={sectionRef} id="try" className="py-28 px-6">
      <div className="max-w-[700px] mx-auto">
        <div className="text-center mb-10">
          <p className="text-text-tertiary text-xs uppercase tracking-[0.2em] mb-3">Interactive Demo</p>
          <h2 className="font-display text-[clamp(1.5rem,4vw,2.5rem)] font-extrabold">
            Try It <span className="bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">Yourself</span>
          </h2>
        </p>

        <div className="glass rounded-2xl p-6 mb-6">
          <div className="flex gap-3 items-center">
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="Paste a YouTube URL…"
              className="flex-1 bg-white/5 border border-white/[0.08] rounded-xl px-4 py-3 text-sm placeholder-text-tertiary focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30 transition-all"
            />
            <button
              onClick={generate}
              disabled={state === 'loading'}
              className="bg-gradient-to-br from-brand-500 to-brand-600 text-white font-semibold px-6 py-3 rounded-xl hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] transition-all disabled:opacity-50 text-sm"
            >
              {state === 'loading' ? '⏳' : 'Generate'}
            </button>
          </div>

          {state === 'loading' && (
            <div className="mt-4 flex items-center gap-3 text-sm text-brand-400">
              <div className="w-4 h-4 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
              {status}
            </div>
          )}
        </div>

        {state === 'done' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {results.map((r, i) => (
              <div key={i} className="glass glass-hover rounded-xl p-4 transition-all hover:-translate-y-0.5" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="font-display font-bold text-xs mb-1">{r.p}</div>
                <div className="text-[0.75rem] text-text-secondary leading-relaxed mb-2">{r.text}</div>
                <div className="text-[0.65rem] text-brand-400">{r.tags}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </section>
  )
}
