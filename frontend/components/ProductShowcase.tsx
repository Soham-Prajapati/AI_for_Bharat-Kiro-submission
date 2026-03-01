'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger)

const urls = ['app.kla.ai/upload', 'app.kla.ai/processing', 'app.kla.ai/dashboard']
const captions = [
  { title: 'Step 1 — Upload Anything', desc: 'Drop a video, paste a YouTube link, or import audio.' },
  { title: 'Step 2 — Watch AI Work Live', desc: 'Transcription, domain detection, multi-platform generation — streamed via SSE.' },
  { title: 'Step 3 — Review & Publish', desc: 'Six platforms. Native tone. Edit inline, then ship it.' },
]

const results = [
  { ico: '📺', name: 'YouTube', text: '"5 मिनट में बनाएं Restaurant Style Paneer | Quick Recipe 🔥"', tags: ['#PaneerRecipe', '#QuickCooking'] },
  { ico: '📸', name: 'Instagram', text: '"POV: Your paneer just went from fridge to restaurant-quality in 5 mins 🧈✨"', tags: ['#Reels', '#FoodTok'] },
  { ico: '💼', name: 'LinkedIn', text: '"What cooking taught me about scaling: The 80/20 rule works in the kitchen too."', tags: ['#ContentStrategy'] },
  { ico: '🐦', name: 'Twitter/X', text: '"5 min paneer recipe that slaps harder than restaurant food. Thread 🧵👇"', tags: ['#FoodTwitter'] },
  { ico: '📘', name: 'Facebook', text: '"Try this tonight! Restaurant-quality paneer in 5 minutes 😍"', tags: ['#HomeChef'] },
  { ico: '🎵', name: 'TikTok', text: '"Wait for the FLIP 🍳 5 min paneer recipe that changed my life"', tags: ['#FoodTikTok'] },
]

export default function ProductShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const mockRef = useRef<HTMLDivElement>(null)
  const [activeSlide, setActiveSlide] = useState(0)
  const [procStarted, setProcStarted] = useState(false)
  const [procPercent, setProcPercent] = useState(0)
  const [procSteps, setProcSteps] = useState([0, 0, 0, 0, 0, 0]) // 0=wait, 1=active, 2=done
  const [cardsVis, setCardsVis] = useState<boolean[]>(new Array(6).fill(false))

  // Pinned scroll + slide switching
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const scroller = document.querySelector('#main-scroll') || undefined

    ScrollTrigger.create({
      trigger: section,
      scroller,
      start: 'top top',
      end: 'bottom bottom',
      pin: pinRef.current,
      pinSpacing: false,
    })

    gsap.to(mockRef.current, {
      scale: 1, opacity: 1, duration: 0.8, ease: 'power2.out',
      scrollTrigger: { trigger: section, scroller, start: 'top 80%' }
    })

    ScrollTrigger.create({
      trigger: section,
      scroller,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const idx = Math.min(2, Math.floor(self.progress * 3))
        setActiveSlide(idx)
      }
    })

    return () => { ScrollTrigger.getAll().forEach(t => t.kill()) }
  }, [])

  // Process animation when slide 1 is active
  useEffect(() => {
    if (activeSlide === 1 && !procStarted) {
      setProcStarted(true)
      const steps = [15, 30, 50, 73, 88, 100]
      let i = 0
      const tick = () => {
        if (i >= steps.length) return
        setProcPercent(steps[i])
        setProcSteps(prev => prev.map((s, x) =>
          x < i ? 2 : x === i ? 1 : 0
        ))
        if (i === steps.length - 1) {
          setProcSteps(new Array(6).fill(2))
        }
        i++
        setTimeout(tick, 700)
      }
      tick()
    }
  }, [activeSlide, procStarted])

  // Stagger result cards when slide 2 is active
  useEffect(() => {
    if (activeSlide === 2) {
      results.forEach((_, i) => {
        setTimeout(() => setCardsVis(prev => { const n = [...prev]; n[i] = true; return n }), i * 120)
      })
    }
  }, [activeSlide])

  const circumference = 2 * Math.PI * 65
  const dashOffset = circumference - (procPercent / 100) * circumference

  const stepLabels = ['Uploading & validating', 'Transcribing audio (Hindi)', 'Detecting domain: Food', 'Generating for 6 platforms', 'Translating to 9 languages', 'Viral Score prediction']
  const stepIcons = ['⏳', '🔄', '✅']

  return (
    <section ref={sectionRef} id="showcase" className="min-h-[300vh]">
      <div ref={pinRef} className="h-screen flex items-center justify-center flex-col gap-8">
        <div className="max-w-[1200px] mx-auto px-6 w-full">
          {/* Browser Mockup */}
          <div ref={mockRef} className="bg-[#0D1117] border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.6),0_0_60px_rgba(99,102,241,0.06)] w-full max-w-[960px] mx-auto scale-90 opacity-0">
            {/* Title bar */}
            <div className="flex items-center gap-2 px-4 py-3 bg-white/[0.03] border-b border-white/[0.06]">
              <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
              <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
              <div className="w-3 h-3 rounded-full bg-[#28C840]" />
              <div className="ml-4 bg-white/5 px-3 py-1 rounded-md text-[0.7rem] text-text-tertiary font-mono flex-1 text-center transition-all">
                {urls[activeSlide]}
              </div>
            </div>

            {/* Screen */}
            <div className="relative min-h-[440px] overflow-hidden">
              {/* Upload */}
              <div className={`absolute inset-0 p-6 transition-all duration-700 flex flex-col items-center justify-center ${activeSlide === 0 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-5 scale-[0.96] pointer-events-none'}`}>
                <div className="w-4/5 max-w-[480px] border-2 border-dashed border-brand-500/30 rounded-2xl p-14 text-center bg-brand-500/[0.03]">
                  <div className="text-4xl">📁</div>
                  <h3 className="font-display font-bold mt-3 mb-1">Drop your video here</h3>
                  <p className="text-text-tertiary text-sm">MP4, MOV, AVI up to 500MB — or paste a YouTube link</p>
                  <div className="mt-4 flex gap-1.5 justify-center flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-md bg-white/5 border border-white/[0.08] text-text-tertiary">🎬 cooking_tutorial.mp4</span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-white/5 border border-white/[0.08] text-accent-success">Uploading… 67%</span>
                  </div>
                </div>
              </div>

              {/* Processing */}
              <div className={`absolute inset-0 p-7 transition-all duration-700 flex gap-6 ${activeSlide === 1 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-5 scale-[0.96] pointer-events-none'}`}>
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="w-[150px] h-[150px] relative flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 150 150">
                      <defs>
                        <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#818CF8" />
                          <stop offset="100%" stopColor="#22D3EE" />
                        </linearGradient>
                      </defs>
                      <circle cx="75" cy="75" r="65" fill="none" strokeWidth="4" stroke="rgba(255,255,255,0.05)" />
                      <circle cx="75" cy="75" r="65" fill="none" strokeWidth="4" stroke="url(#rg)" strokeLinecap="round"
                        strokeDasharray={circumference} strokeDashoffset={dashOffset}
                        style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
                    </svg>
                    <div className="z-10 font-display">
                      <span className="text-3xl font-black">{procPercent}</span>
                      <span className="text-lg text-text-tertiary">%</span>
                    </div>
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-2.5 justify-center">
                  {stepLabels.map((label, i) => (
                    <div key={i} className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs transition-all duration-500 ${
                      procSteps[i] === 2 ? 'text-accent-success opacity-100' :
                      procSteps[i] === 1 ? 'text-brand-400 bg-brand-500/[0.08] opacity-100' :
                      'text-text-tertiary opacity-40'
                    }`}>
                      {stepIcons[procSteps[i]]} {label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Results */}
              <div className={`absolute inset-0 p-4 transition-all duration-700 ${activeSlide === 2 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-5 scale-[0.96] pointer-events-none'}`}>
                <div className="grid grid-cols-3 gap-2.5 min-h-[420px] content-start">
                  {results.map((r, i) => (
                    <div key={i} className={`glass glass-hover rounded-xl p-3.5 transition-all duration-500 ${cardsVis[i] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2.5'}`}>
                      <div className="text-lg mb-1">{r.ico}</div>
                      <div className="font-display font-bold text-xs mb-1">{r.name}</div>
                      <div className="text-[0.7rem] text-text-tertiary leading-relaxed">{r.text}</div>
                      <div className="flex gap-1 flex-wrap mt-1.5">
                        {r.tags.map(t => <span key={t} className="text-[0.6rem] px-1.5 py-0.5 bg-brand-500/10 rounded text-brand-400">{t}</span>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Caption */}
          <div className="text-center mt-6">
            <h3 className="font-display text-xl font-extrabold mb-1">{captions[activeSlide].title}</h3>
            <p className="text-text-secondary text-sm">{captions[activeSlide].desc}</p>
            <div className="flex gap-1 justify-center mt-4">
              {[0, 1, 2].map(i => (
                <div key={i} className="h-1 rounded-full max-w-[72px] flex-1 bg-white/[0.08] overflow-hidden">
                  <div className={`h-full rounded-full bg-brand-400 transition-all duration-500 ${i <= activeSlide ? 'w-full' : 'w-0'}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
