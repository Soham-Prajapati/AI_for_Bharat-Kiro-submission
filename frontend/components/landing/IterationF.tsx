'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useDesign } from '@/context/DesignContext'
import Link from 'next/link'

// ── Constants ─────────────────────────────────────────────────────────────

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']

const MARQUEE_ITEMS = [
  'YouTube Scripts', 'Instagram Reels', 'LinkedIn Posts', 'Podcast Outlines',
  'Twitter Threads', 'SEO Blogs', 'Carousel Slides', 'Thumbnail Copy',
  'YouTube Shorts', 'WhatsApp Captions', 'Email Newsletters', 'Brand Voice',
]
const MARQUEE_LANGS = [
  'Hindi · हिन्दी', 'Tamil · தமிழ்', 'Telugu · తెలుగు', 'Marathi · मराठी',
  'Bengali · বাংলা', 'Kannada · ಕನ್ನಡ', 'Gujarati · ગુજરાતી', 'Punjabi · ਪੰਜਾਬੀ',
  'Malayalam · മലയാളം',
]

const PLATFORMS = [
  { name: 'YouTube', icon: '▶', desc: 'Full scripts, hooks, chapters, SEO titles & descriptions', color: '#FF0000', what: 'Script · Title · Chapters · Tags' },
  { name: 'Instagram', icon: '◎', desc: 'Reels scripts, carousel slides, captions, hashtags', color: '#E1306C', what: 'Reel · Carousel · Caption · Hashtags' },
  { name: 'LinkedIn', icon: '■', desc: 'Thought leadership posts, authority content, B2B outreach', color: '#0A66C2', what: 'Post · Article · Poll · Hashtags' },
  { name: 'Twitter / X', icon: '𝕏', desc: 'Hooks, threads, single takes, engagement-driven copy', color: '#1DA1F2', what: 'Thread · Hook · Take · Hashtags' },
  { name: 'Podcast', icon: '🎙', desc: 'Episode outlines, guest questions, show notes, summaries', color: '#9333EA', what: 'Outline · Notes · Summary · Quotes' },
  { name: 'Shorts', icon: '▮', desc: 'Vertical video scripts — hook in 1 sec, retain for 60', color: '#F97316', what: 'Hook · Script · CTA · Caption' },
]

const DOMAINS = [
  { icon: '🎓', name: 'Education', sample: '5 ways to crack UPSC without coaching', color: '#818CF8' },
  { icon: '🍛', name: 'Food', sample: "My maa's dal makhani — but make it viral", color: '#F97316' },
  { icon: '✈️', name: 'Travel', sample: '₹10K Ladakh trip: the real itinerary', color: '#22D3EE' },
  { icon: '💻', name: 'Tech', sample: 'I built an AI in 2 hours using free tools', color: '#34D399' },
  { icon: '💰', name: 'Finance', sample: "SIP vs FD: what your bank won't tell you", color: '#FBBF24' },
  { icon: '💅', name: 'Lifestyle', sample: 'Morning routine that actually works for me', color: '#F472B6' },
  { icon: '🏋️', name: 'Fitness', sample: 'Lost 8 kg eating paratha every day', color: '#A78BFA' },
  { icon: '🎮', name: 'Gaming', sample: 'Why Indian gamers are underrated globally', color: '#60A5FA' },
]

const FEATURES = [
  { icon: '🧬', name: 'Creator DNA', desc: 'AI learns your unique voice, tone, and style from past content. Every output sounds like you.' },
  { icon: '🚀', name: 'Viral Score', desc: 'Get a 0-100 virality prediction before publishing. Know what works before you post.' },
  { icon: '🌏', name: '9 Languages', desc: 'Culturally adapted translations — not word-for-word. Chennai reads differently from Delhi.' },
  { icon: '🔍', name: 'SEO Engine', desc: 'Auto-generated keywords, titles, meta descriptions, and hashtags tuned for each platform.' },
  { icon: '🖼️', name: 'Smart Thumbnails', desc: 'AI-selected thumbnail candidates ranked by click-through potential.' },
  { icon: '💧', name: 'Watermark', desc: 'Invisible & visible brand protection on every piece of content you create.' },
  { icon: '⚡', name: 'Batch Generate', desc: 'Plan a month of content in one sitting. Export as PDF, JSON, or CSV files.' },
  { icon: '🤝', name: 'Workspace', desc: 'Real-time collaborative editing with your team. Live cursors, comments, version history.' },
]

const LANGUAGES = [
  { script: 'हिन्दी', name: 'Hindi', speakers: '600M+' },
  { script: 'தமிழ்', name: 'Tamil', speakers: '80M+' },
  { script: 'తెలుగు', name: 'Telugu', speakers: '95M+' },
  { script: 'मराठी', name: 'Marathi', speakers: '95M+' },
  { script: 'বাংলা', name: 'Bengali', speakers: '100M+' },
  { script: 'ಕನ್ನಡ', name: 'Kannada', speakers: '60M+' },
  { script: 'ગુજરાતી', name: 'Gujarati', speakers: '60M+' },
  { script: 'ਪੰਜਾਬੀ', name: 'Punjabi', speakers: '30M+' },
  { script: 'മലയാളം', name: 'Malayalam', speakers: '38M+' },
]

const HERO_LANGS = [
  { lang: 'English', line1: 'Your voice.', line2: 'Every platform.' },
  { lang: 'हिंदी', line1: 'आपकी आवाज़।', line2: 'हर प्लेटफ़ॉर्म।' },
  { lang: 'தமிழ்', line1: 'உங்கள் குரல்.', line2: 'எல்லா தளங்களும்.' },
  { lang: 'తెలుగు', line1: 'మీ గొంతు.', line2: 'ప్రతి వేదిక.' },
  { lang: 'বাংলা', line1: 'আপনার কণ্ঠস্বর।', line2: 'প্রতিটি প্ল্যাটফর্ম।' },
]

// smooth fade state
type FadeState = 'visible' | 'fading-out' | 'fading-in'

// ── Helpers ───────────────────────────────────────────────────────────────

function calcViralScore(text: string): number {
  if (!text.trim()) return 0
  let score = 40
  if (text.length > 30) score += 15
  if (/\?/.test(text)) score += 10
  if (/!/.test(text)) score += 5
  if (/\d/.test(text)) score += 8
  if (/\b(you|your|आप|तुम)\b/i.test(text)) score += 7
  if (/\b(secret|insider|hack|truth|never|always)\b/i.test(text)) score += 12
  return Math.min(score, 99)
}

// ── India Map SVG ────────────────────────────────────────────────────────
function IndiaMap({ isDark }: { isDark: boolean }) {
  const stroke = isDark ? 'rgba(129,140,248,0.5)' : 'rgba(79,70,229,0.4)'
  const fill = isDark ? 'rgba(129,140,248,0.08)' : 'rgba(79,70,229,0.06)'
  const glow = isDark ? 'rgba(129,140,248,0.15)' : 'rgba(79,70,229,0.1)'
  const cityColor = isDark ? '#818CF8' : '#4F46E5'
  const cities = [
    { name: 'Delhi', x: 155, y: 120, r: 4 },
    { name: 'Mumbai', x: 108, y: 235, r: 3.5 },
    { name: 'Chennai', x: 183, y: 315, r: 3 },
    { name: 'Kolkata', x: 235, y: 190, r: 3 },
    { name: 'Bengaluru', x: 155, y: 320, r: 3 },
    { name: 'Hyderabad', x: 155, y: 265, r: 3 },
  ]
  return (
    <svg viewBox="0 0 320 420" fill="none" className="w-full h-full max-w-[280px]">
      <defs>
        <filter id="map-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <path
        d="M 155 25 C 163 22, 175 20, 185 22 C 195 24, 200 28, 208 35
           C 215 42, 220 50, 228 55 C 235 60, 242 58, 248 62
           C 255 68, 258 75, 255 85 C 252 95, 248 100, 250 108
           C 252 118, 258 125, 258 135 C 258 145, 252 152, 248 160
           C 245 168, 242 175, 240 185 C 238 192, 238 198, 235 205
           C 232 215, 228 222, 225 230 C 222 238, 218 245, 212 255
           C 208 262, 205 268, 200 275 C 195 282, 190 290, 188 298
           C 185 308, 182 318, 178 325 C 175 332, 172 338, 170 345
           C 168 352, 170 358, 172 362 C 175 368, 178 372, 175 378
           C 172 382, 168 385, 162 385 C 158 385, 155 382, 152 378
           C 148 372, 145 368, 142 362 C 138 355, 135 348, 132 340
           C 128 332, 122 325, 118 318 C 112 308, 108 298, 102 290
           C 96 280, 90 270, 85 260 C 80 250, 76 242, 72 232
           C 68 222, 65 215, 62 205 C 58 195, 55 185, 55 175
           C 55 165, 58 155, 60 148 C 62 140, 60 132, 58 125
           C 55 118, 52 112, 52 105 C 52 95, 55 88, 58 80
           C 62 72, 68 65, 72 58 C 78 50, 82 45, 88 40
           C 95 35, 102 32, 110 30 C 118 28, 128 25, 138 24
           C 145 23, 150 24, 155 25 Z"
        fill={fill} stroke={stroke} strokeWidth="1.8" strokeLinejoin="round" filter="url(#map-glow)"
      />
      {/* NE India */}
      <path
        d="M 250 108 C 255 102, 262 98, 268 96 C 275 94, 280 96, 282 102
           C 284 108, 280 112, 274 114 C 268 116, 260 114, 255 116"
        fill={fill} stroke={stroke} strokeWidth="1.2"
      />
      {/* Sri Lanka */}
      <ellipse cx="175" cy="395" rx="10" ry="14" fill={glow} stroke={stroke} strokeWidth="0.8" />
      {/* City dots */}
      {cities.map((city, i) => (
        <g key={i}>
          <circle cx={city.x} cy={city.y} r={city.r + 8} fill={cityColor} opacity="0.06" />
          <circle cx={city.x} cy={city.y} r={city.r} fill={cityColor} opacity="0.9" />
          <text x={city.x + 8} y={city.y + 3} fontSize="8"
            fill={isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)'} fontFamily="monospace">
            {city.name}
          </text>
        </g>
      ))}
      <path
        d={cities.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ')}
        stroke={isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)'}
        strokeWidth="0.8" strokeDasharray="4 8"
      />
    </svg>
  )
}

// ── DNA Radar Chart ──────────────────────────────────────────────────────
function DNARadar({ isDark }: { isDark: boolean }) {
  const axes = ['Hook', 'Clarity', 'Emotion', 'SEO', 'Virality', 'Brand']
  const values = [0.88, 0.72, 0.95, 0.80, 0.91, 0.85]
  const cx = 100, cy = 100, r = 70
  const points = axes.map((_, i) => {
    const angle = (i / axes.length) * 2 * Math.PI - Math.PI / 2
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
  })
  const valPoints = values.map((v, i) => {
    const angle = (i / axes.length) * 2 * Math.PI - Math.PI / 2
    return `${cx + r * v * Math.cos(angle)},${cy + r * v * Math.sin(angle)}`
  }).join(' ')
  const lineColor = isDark ? 'rgba(129,140,248,0.3)' : 'rgba(79,70,229,0.2)'
  const gridColor = isDark ? 'rgba(129,140,248,0.15)' : 'rgba(79,70,229,0.1)'
  return (
    <svg viewBox="0 0 200 200" className="w-48 h-48">
      {points.map((p, i) => (
        <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={lineColor} strokeWidth="1" />
      ))}
      {[0.25, 0.5, 0.75, 1].map(scale => (
        <polygon key={scale}
          points={axes.map((_, i) => {
            const a = (i / axes.length) * 2 * Math.PI - Math.PI / 2
            return `${cx + r * scale * Math.cos(a)},${cy + r * scale * Math.sin(a)}`
          }).join(' ')}
          fill="none" stroke={gridColor} strokeWidth="0.8"
        />
      ))}
      <polygon points={valPoints}
        fill={isDark ? 'rgba(129,140,248,0.2)' : 'rgba(79,70,229,0.15)'}
        stroke={isDark ? '#818CF8' : '#4F46E5'} strokeWidth="1.5"
      />
      {axes.map((label, i) => (
        <text key={i}
          x={points[i].x + (points[i].x > cx ? 6 : points[i].x < cx ? -6 : 0)}
          y={points[i].y + (points[i].y > cy ? 10 : points[i].y < cy ? -4 : 4)}
          textAnchor={points[i].x > cx ? 'start' : points[i].x < cx ? 'end' : 'middle'}
          fontSize="7"
          fill={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
        >{label}</text>
      ))}
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export default function IterationF() {
  const { isDark } = useDesign()

  // ── Easter eggs ─────────────────────────────────────────────────────────
  const [konamiActive, setKonamiActive] = useState(false)
  const [logoClicks, setLogoClicks] = useState(0)
  const [showDNA, setShowDNA] = useState(false)
  const konamiBuffer = useRef<string[]>([])
  const logoTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const scrollDirRef = useRef<'up' | 'down' | null>(null)
  const scrollFlips = useRef(0)
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Hero auto-cycle language with smooth fading ────────────────────────
  const [heroLangIdx, setHeroLangIdx] = useState(0)
  const [nextLangIdx, setNextLangIdx] = useState(0)
  const [fadeState, setFadeState] = useState<FadeState>('visible')

  // ── Secret phrase tracker (easter egg) ──────────────────────────────────
  const [secretInput, setSecretInput] = useState('')
  const [easterLevel, setEasterLevel] = useState(0) // 0-3 levels
  const [showMatrix, setShowMatrix] = useState(false)

  // ── Viral score ─────────────────────────────────────────────────────────
  const [viralInput, setViralInput] = useState('')
  const [viralScore, setViralScore] = useState(0)
  const viralRaf = useRef<number | null>(null)

  // ── Konami listener ─────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      konamiBuffer.current = [...konamiBuffer.current.slice(-9), e.key]
      if (konamiBuffer.current.join(',') === KONAMI.join(',')) {
        setKonamiActive(true)
        setTimeout(() => setKonamiActive(false), 4000)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // ── Hero language auto-cycle with crossfade ────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setFadeState('fading-out')
      setTimeout(() => {
        setHeroLangIdx(prev => {
          const next = (prev + 1) % HERO_LANGS.length
          setNextLangIdx(next)
          return next
        })
        setFadeState('fading-in')
        setTimeout(() => setFadeState('visible'), 500)
      }, 500)
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  // ── Secret word easter egg listener ─────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Track typed characters
      setSecretInput(prev => {
        const next = (prev + e.key).slice(-10)
        // "bharat" typed anywhere unlocks level 1
        if (next.includes('bharat') && easterLevel < 1) {
          setEasterLevel(1)
          setTimeout(() => setEasterLevel(0), 5000)
        }
        // "creator" typed unlocks level 2 — matrix rain
        if (next.includes('creator')) {
          setShowMatrix(true)
          setTimeout(() => setShowMatrix(false), 6000)
        }
        return next
      })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [easterLevel])

  // ── Rapid scroll easter egg (scroll up/down 5x fast = confetti) ────────
  useEffect(() => {
    const onScroll = (e: WheelEvent) => {
      const dir = e.deltaY > 0 ? 'down' : 'up'
      if (scrollDirRef.current && dir !== scrollDirRef.current) {
        scrollFlips.current++
        if (scrollTimer.current) clearTimeout(scrollTimer.current)
        scrollTimer.current = setTimeout(() => { scrollFlips.current = 0 }, 2000)
        if (scrollFlips.current >= 8) {
          setShowConfetti(true)
          scrollFlips.current = 0
          setTimeout(() => setShowConfetti(false), 4000)
        }
      }
      scrollDirRef.current = dir
    }
    window.addEventListener('wheel', onScroll)
    return () => window.removeEventListener('wheel', onScroll)
  }, [])

  // ── Viral score animation ──────────────────────────────────────────────
  const animateViral = useCallback((target: number) => {
    if (viralRaf.current) cancelAnimationFrame(viralRaf.current)
    let current = 0
    const step = () => {
      current = Math.min(current + 2, target)
      setViralScore(current)
      if (current < target) viralRaf.current = requestAnimationFrame(step)
    }
    viralRaf.current = requestAnimationFrame(step)
  }, [])

  useEffect(() => {
    animateViral(calcViralScore(viralInput))
  }, [viralInput, animateViral])

  // ── Logo triple-click for DNA ──────────────────────────────────────────
  const handleLogoClick = () => {
    const count = logoClicks + 1
    setLogoClicks(count)
    if (logoTimer.current) clearTimeout(logoTimer.current)
    if (count >= 3) {
      setShowDNA(prev => !prev)
      setLogoClicks(0)
    } else {
      logoTimer.current = setTimeout(() => setLogoClicks(0), 1500)
    }
  }

  // ── Theme tokens ────────────────────────────────────────────────────────
  const t = {
    bg: isDark ? 'bg-[#030712]' : 'bg-white',
    bgAlt: isDark ? 'bg-white/[0.015]' : 'bg-gray-50',
    text: isDark ? 'text-white' : 'text-gray-900',
    textSub: isDark ? 'text-white/50' : 'text-gray-500',
    textMuted: isDark ? 'text-white/30' : 'text-gray-400',
    textFaint: isDark ? 'text-white/15' : 'text-gray-300',
    card: isDark ? 'bg-white/[0.03] border-white/[0.07]' : 'bg-white border-gray-200 shadow-sm',
    cardHover: isDark ? 'hover:bg-white/[0.06] hover:border-white/[0.12]' : 'hover:bg-gray-50 hover:border-gray-300 hover:shadow-md',
    border: isDark ? 'border-white/[0.07]' : 'border-gray-200',
    borderFaint: isDark ? 'border-white/[0.04]' : 'border-gray-100',
    navBg: isDark ? 'bg-[#030712]/80' : 'bg-white/80',
    navBorder: isDark ? 'border-white/[0.06]' : 'border-gray-200/80',
    inputBg: isDark
      ? 'bg-white/[0.04] border-white/[0.08] text-white placeholder-white/20'
      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400',
  }

  const currentHeroLang = HERO_LANGS[heroLangIdx]

  return (
    <div className={`relative min-h-screen ${t.bg} ${t.text} overflow-x-hidden font-sans`}>

      {/* ── Konami overlay ──────────────────────────────────────────────── */}
      {konamiActive && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center pointer-events-none"
          style={{ background: isDark ? 'rgba(3,7,18,0.92)' : 'rgba(255,255,255,0.95)' }}>
          <div className="text-center animate-bounce">
            <div className="text-7xl mb-4">🔓</div>
            <div className="text-4xl font-black tracking-tight bg-gradient-to-r from-orange-400 to-indigo-400 bg-clip-text text-transparent">
              Creator Mode Unlocked
            </div>
            <div className={`mt-3 font-mono text-sm ${t.textMuted}`}>↑↑↓↓←→←→BA — you are one of us</div>
          </div>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="absolute w-2 h-2 rounded-full animate-ping"
              style={{
                background: ['#F97316', '#818CF8', '#22D3EE', '#34D399', '#FBBF24'][i % 5],
                left: `${10 + (i * 7) % 80}%`,
                top: `${10 + (i * 11) % 70}%`,
                animationDelay: `${i * 150}ms`,
                animationDuration: '1s',
              }} />
          ))}
        </div>
      )}

      {/* ── "bharat" easter egg — tricolor pulse ring ────────────────────── */}
      {easterLevel >= 1 && (
        <div className="fixed inset-0 z-[9996] pointer-events-none">
          <div className="absolute inset-0" style={{ animation: 'tricolor-pulse 2s ease-in-out infinite' }}>
            <div className="absolute inset-0 rounded-full" style={{
              border: '3px solid',
              borderImage: 'linear-gradient(180deg, #FF9933 33%, #FFFFFF 33%, #FFFFFF 66%, #138808 66%) 1',
              opacity: 0.4,
              animation: 'tricolor-ring 2s ease-in-out infinite',
            }} />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="text-5xl font-black bg-gradient-to-b from-[#FF9933] via-white to-[#138808] bg-clip-text text-transparent" style={{ animation: 'scale-breathe 2s ease-in-out infinite' }}>
              जय हिंद 🇮🇳
            </div>
            <div className={`mt-2 font-mono text-xs ${t.textMuted}`}>type &ldquo;creator&rdquo; for the next level...</div>
          </div>
        </div>
      )}

      {/* ── "creator" easter egg — Devanagari matrix rain ─────────────── */}
      {showMatrix && (
        <div className="fixed inset-0 z-[9997] pointer-events-none overflow-hidden"
          style={{ background: isDark ? 'rgba(3,7,18,0.85)' : 'rgba(255,255,255,0.9)' }}>
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="absolute text-sm font-mono" style={{
              left: `${(i * 3.33) % 100}%`,
              animation: `matrix-fall ${2 + Math.random() * 3}s linear infinite`,
              animationDelay: `${Math.random() * 2}s`,
              color: ['#F97316', '#818CF8', '#22D3EE', '#138808', '#FF9933'][i % 5],
              opacity: 0.6 + Math.random() * 0.4,
              fontSize: `${10 + Math.random() * 8}px`,
            }}>
              {'अआइईउऊऋएऐओऔकखगघचछजझटठडढणतथदधनपफबभमयरलवशषसह'.split('').sort(() => Math.random() - 0.5).slice(0, 8 + Math.floor(Math.random() * 12)).join('\n')}
            </div>
          ))}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10">
            <div className="text-6xl font-black mb-4" style={{ textShadow: '0 0 40px rgba(249,115,22,0.5)' }}>
              <span className="text-orange-500">क</span><span className={isDark ? 'text-white' : 'text-gray-900'}>LA</span>
            </div>
            <div className="text-lg font-bold bg-gradient-to-r from-orange-400 to-indigo-400 bg-clip-text text-transparent">
              Made for Bharat&apos;s Creators
            </div>
            <div className={`mt-1 text-xs font-mono ${t.textMuted}`}>scroll up & down 5 times fast for one more...</div>
          </div>
        </div>
      )}

      {/* ── DNA modal ──────────────────────────────────────────────────── */}
      {showDNA && (
        <div className="fixed inset-0 z-[9997] flex items-center justify-center"
          style={{ background: isDark ? 'rgba(3,7,18,0.85)' : 'rgba(0,0,0,0.3)' }}
          onClick={() => setShowDNA(false)}>
          <div className={`rounded-2xl p-6 flex flex-col items-center gap-3 shadow-2xl border ${
            isDark ? 'bg-[#0A0E1A] border-indigo-500/30' : 'bg-white border-gray-200'
          }`} onClick={e => e.stopPropagation()}>
            <div className="text-xs font-mono text-indigo-400 uppercase tracking-widest">Your Content DNA</div>
            <DNARadar isDark={isDark} />
            <div className={`text-[10px] ${t.textMuted}`}>Triple-click the कLA logo to toggle</div>
          </div>
        </div>
      )}

      {/* ── Confetti burst (rapid scroll easter egg) ─────────────────── */}
      {showConfetti && (
        <div className="fixed inset-0 z-[9998] pointer-events-none overflow-hidden">
          {Array.from({ length: 60 }).map((_, i) => (
            <div key={i} className="absolute" style={{
              left: `${Math.random() * 100}%`,
              top: '-5%',
              width: `${6 + Math.random() * 8}px`,
              height: `${6 + Math.random() * 8}px`,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              background: ['#FF9933', '#FFFFFF', '#138808', '#F97316', '#818CF8', '#22D3EE', '#FBBF24', '#F472B6'][i % 8],
              animation: `confetti-fall ${2 + Math.random() * 2}s ease-in forwards`,
              animationDelay: `${Math.random() * 0.8}s`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }} />
          ))}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 text-center" style={{ animation: 'scale-breathe 1s ease-in-out infinite' }}>
            <div className="text-5xl mb-2">🎉</div>
            <div className="text-xl font-black bg-gradient-to-r from-orange-400 to-indigo-400 bg-clip-text text-transparent">
              You found it!
            </div>
            <div className={`text-xs mt-1 font-mono ${t.textMuted}`}>You&apos;re a true explorer</div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
           NAV
         ═══════════════════════════════════════════════════════════════════ */}
      <nav className={`sticky top-0 z-50 ${t.navBg} backdrop-blur-xl border-b ${t.navBorder}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
          <button onClick={handleLogoClick} className="relative flex items-center gap-0 outline-none group">
            <span className="font-black text-xl tracking-[-0.05em] flex items-baseline" style={{ lineHeight: 1 }}>
              <span className="text-orange-500 relative">
                क
                {/* Connecting matra line */}
                <span className="absolute top-[1px] right-[-6px] w-[10px] h-[2.5px] bg-orange-500 rounded-full" />
              </span>
              <span className={`${isDark ? 'text-white' : 'text-gray-900'} bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent`}>L</span>
              <span className={isDark ? 'text-white' : 'text-gray-900'}>A</span>
            </span>
            {logoClicks > 0 && (
              <span className="absolute -top-0.5 -right-2 w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping" />
            )}
          </button>

          <div className={`hidden md:flex items-center gap-8 text-sm ${t.textSub}`}>
            <a href="#how-it-works" className="hover:text-orange-400 transition-colors">How It Works</a>
            <a href="#platforms" className="hover:text-orange-400 transition-colors">Platforms</a>
            <a href="#domains" className="hover:text-orange-400 transition-colors">Domains</a>
            <a href="#languages" className="hover:text-orange-400 transition-colors">Languages</a>
            <a href="#features" className="hover:text-orange-400 transition-colors">Features</a>
          </div>

          <Link href="/onboarding"
            className="px-5 py-2 rounded-full font-semibold text-sm bg-gradient-to-r from-orange-400 to-indigo-500 text-white hover:opacity-90 transition-opacity">
            Try कLA Free
          </Link>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════════
           HERO
         ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[85vh] flex flex-col justify-center px-6 md:px-16 py-20 overflow-hidden">
        {isDark && (
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }} />
        )}
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none"
          style={{ opacity: isDark ? 0.08 : 0.04, background: 'radial-gradient(circle, #818CF8 0%, #F97316 60%, transparent 100%)' }} />

        <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 max-w-2xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
              <span className="font-mono text-xs text-orange-500 uppercase tracking-[0.3em]">
                India&rsquo;s AI Content Engine
              </span>
            </div>

            <div className="relative overflow-hidden" style={{ minHeight: 'clamp(7rem, 20vw, 16rem)' }}>
              <h1
                className="font-black leading-[0.9] tracking-tight"
                style={{
                  fontSize: 'clamp(3rem, 9vw, 7rem)',
                  transition: 'opacity 0.5s ease, transform 0.5s ease, filter 0.3s ease',
                  opacity: fadeState === 'fading-out' ? 0 : 1,
                  transform: fadeState === 'fading-out' ? 'translateY(20px)' : fadeState === 'fading-in' ? 'translateY(0)' : 'translateY(0)',
                  filter: fadeState === 'fading-out' ? 'blur(6px)' : 'blur(0)',
                }}>
                <span className={`block ${t.text}`}>{currentHeroLang.line1}</span>
                <span className="block bg-gradient-to-r from-orange-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                  {currentHeroLang.line2}
                </span>
              </h1>
            </div>

            <p className={`mt-8 text-lg md:text-xl leading-relaxed max-w-lg ${t.textSub}`}>
              Upload <strong className={t.text}>1 video</strong>, get optimized content for{' '}
              <strong className={t.text}>6 platforms</strong> in{' '}
              <strong className="text-orange-400">under 60 seconds</strong>.
              In your language, for your domain. Fully AI or semi-manual — your call.
            </p>

            <div className="flex items-center gap-4 mt-10 flex-wrap">
              <Link href="/onboarding"
                className="px-8 py-4 rounded-full font-bold text-sm bg-gradient-to-r from-orange-400 to-indigo-500 text-white hover:opacity-90 transition-opacity shadow-lg shadow-orange-500/20">
                Start Creating Free →
              </Link>
              <a href="#how-it-works"
                className={`px-8 py-4 rounded-full font-semibold text-sm border transition-all ${t.border} ${t.textSub}`}>
                See How It Works
              </a>
            </div>

            <div className="flex items-center gap-2 mt-8">
              {HERO_LANGS.map((v, i) => (
                <button key={i} onClick={() => setHeroLangIdx(i)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                    i === heroLangIdx
                      ? 'border-orange-400/50 text-orange-400 bg-orange-400/10'
                      : `${t.borderFaint} ${t.textFaint}`
                  }`}>
                  {v.lang}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-shrink-0 lg:w-[320px]">
            <ProcessPreview isDark={isDark} />
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div className={`w-px h-10 bg-gradient-to-b to-transparent animate-pulse ${isDark ? 'from-white/30' : 'from-gray-300'}`} />
          <span className={`font-mono text-[9px] tracking-widest ${t.textFaint}`}>SCROLL</span>
        </div>
      </section>

      {/* ── MARQUEE 1 ─────────────────────────────────────────────────── */}
      <div className={`border-y ${t.borderFaint} py-4 overflow-hidden ${t.bgAlt}`}>
        <div className="flex gap-10 animate-marquee-left whitespace-nowrap" aria-hidden>
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className={`text-sm font-medium uppercase tracking-widest flex items-center gap-3 ${t.textMuted}`}>
              <span className="w-1 h-1 rounded-full bg-orange-400/60" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
           HOW IT WORKS
         ═══════════════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-24 px-6 md:px-16 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="font-mono text-xs text-orange-500 uppercase tracking-[0.3em] mb-3">How It Works</p>
          <h2 className={`font-black text-4xl md:text-5xl leading-tight ${t.text}`}>
            Three steps. Sixty seconds.
          </h2>
          <p className={`mt-4 max-w-lg mx-auto text-base ${t.textSub}`}>
            No learning curve. No complex setup. Just upload and go.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              step: '01', title: 'Upload anything', icon: '📤',
              desc: 'Drop a video, audio file, or paste text. We handle YouTube links, podcast recordings, blog posts — whatever you have.',
            },
            {
              step: '02', title: 'AI does the work', icon: '⚡',
              desc: 'कLA detects your domain, adapts tone for each platform, generates SEO-optimized content, and scores virality — all in under 60 seconds.',
            },
            {
              step: '03', title: 'Review & publish', icon: '🚀',
              desc: 'Get ready-to-post content for YouTube, Instagram, LinkedIn, Twitter, Podcast, and Shorts. Edit anything, export everywhere.',
            },
          ].map((s, i) => (
            <div key={i} className={`relative rounded-2xl border p-8 transition-all duration-300 ${t.card} ${t.cardHover}`}>
              <div className="flex items-center gap-4 mb-5">
                <span className="text-3xl">{s.icon}</span>
                <span className="font-mono text-xs text-orange-400 font-bold">{s.step}</span>
              </div>
              <h3 className={`font-bold text-xl mb-3 ${t.text}`}>{s.title}</h3>
              <p className={`text-sm leading-relaxed ${t.textSub}`}>{s.desc}</p>
              {i < 2 && (
                <div className={`hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 text-2xl ${t.textFaint}`}>→</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
           PLATFORMS
         ═══════════════════════════════════════════════════════════════════ */}
      <section id="platforms" className={`py-24 px-6 md:px-16 ${t.bgAlt} border-y ${t.borderFaint}`}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <p className="font-mono text-xs text-indigo-400 uppercase tracking-[0.3em] mb-3">6 Platforms</p>
            <h2 className={`font-black text-4xl md:text-5xl leading-tight ${t.text}`}>
              One upload. Six perfect outputs.
            </h2>
            <p className={`mt-4 max-w-lg text-base ${t.textSub}`}>
              Each platform has different rules — length, tone, hashtags, format. कLA knows them all.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PLATFORMS.map((p, i) => (
              <div key={i} className={`rounded-2xl border p-6 transition-all duration-300 group ${t.card} ${t.cardHover}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
                    style={{ background: `${p.color}15`, color: p.color }}>
                    {p.icon}
                  </div>
                  <div>
                    <h3 className={`font-bold ${t.text}`}>{p.name}</h3>
                    <p className="font-mono text-[10px] text-orange-400">{p.what}</p>
                  </div>
                </div>
                <p className={`text-sm leading-relaxed ${t.textSub}`}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
           DOMAIN INTELLIGENCE
         ═══════════════════════════════════════════════════════════════════ */}
      <section id="domains" className="py-24 px-6 md:px-16 max-w-7xl mx-auto">
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="font-mono text-xs text-cyan-500 uppercase tracking-[0.3em] mb-3">Domain Intelligence</p>
            <h2 className={`font-black text-4xl md:text-5xl leading-tight ${t.text}`}>
              कLA knows your niche.
            </h2>
          </div>
          <p className={`max-w-sm text-sm leading-relaxed md:text-right ${t.textSub}`}>
            Auto-detects your content domain and adapts tone, keywords, and style. Every creator gets a custom AI voice.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {DOMAINS.map((d, i) => (
            <div key={i} className={`rounded-2xl border p-5 transition-all duration-300 ${t.card} ${t.cardHover}`}>
              <span className="text-2xl block mb-3">{d.icon}</span>
              <div className={`font-bold text-sm mb-2 ${t.text}`}>{d.name}</div>
              <div className={`text-xs leading-relaxed ${t.textSub}`}>&ldquo;{d.sample}&rdquo;</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── MARQUEE 2 — Languages ─────────────────────────────────────── */}
      <div className={`border-y ${t.borderFaint} py-4 overflow-hidden ${t.bgAlt}`}>
        <div className="flex gap-10 animate-marquee-right whitespace-nowrap" aria-hidden>
          {[...MARQUEE_LANGS, ...MARQUEE_LANGS].map((item, i) => (
            <span key={i} className={`text-sm font-medium uppercase tracking-widest flex items-center gap-3 ${t.textMuted}`}>
              <span className="w-1 h-1 rounded-full bg-indigo-400/60" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
           LANGUAGE COVERAGE + INDIA MAP
         ═══════════════════════════════════════════════════════════════════ */}
      <section id="languages" className="py-24 px-6 md:px-16 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="font-mono text-xs text-indigo-400 uppercase tracking-[0.3em] mb-3">Coverage</p>
            <h2 className={`font-black text-4xl md:text-5xl leading-tight mb-6 ${t.text}`}>
              Every creator.{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                Every corner of India.
              </span>
            </h2>
            <p className={`text-base leading-relaxed mb-10 max-w-md ${t.textSub}`}>
              कLA adapts your content to 9 regional languages with cultural intelligence — not word-for-word translation.
              Your audience in Chennai gets a different emotional resonance than your audience in Delhi.
            </p>
            <div className="grid grid-cols-3 gap-3">
              {LANGUAGES.map((lang, i) => (
                <div key={i} className={`rounded-xl border p-3 transition-all duration-300 ${t.card} ${t.cardHover}`}>
                  <div className={`font-bold text-lg ${t.text}`}>{lang.script}</div>
                  <div className={`text-xs ${t.textMuted}`}>{lang.name}</div>
                  <div className={`text-[10px] font-mono mt-1 ${t.textFaint}`}>{lang.speakers}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex items-center justify-center min-h-[380px]">
            <IndiaMap isDark={isDark} />
            <div className={`absolute top-4 right-4 rounded-2xl px-5 py-3 text-center shadow-xl border backdrop-blur-sm ${
              isDark ? 'bg-white/[0.06] border-white/10' : 'bg-white border-gray-200'
            }`}>
              <div className="font-black text-3xl bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">1.4B</div>
              <div className={`text-xs mt-0.5 ${t.textMuted}`}>People Reachable</div>
            </div>
            <div className={`absolute bottom-4 left-4 rounded-2xl px-5 py-3 text-center shadow-xl border backdrop-blur-sm ${
              isDark ? 'bg-white/[0.06] border-white/10' : 'bg-white border-gray-200'
            }`}>
              <div className="font-black text-3xl text-cyan-400">28</div>
              <div className={`text-xs mt-0.5 ${t.textMuted}`}>States Covered</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
           KEY FEATURES
         ═══════════════════════════════════════════════════════════════════ */}
      <section id="features" className={`py-24 px-6 md:px-16 ${t.bgAlt} border-y ${t.borderFaint}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-mono text-xs text-orange-500 uppercase tracking-[0.3em] mb-3">Built for Creators</p>
            <h2 className={`font-black text-4xl md:text-5xl leading-tight ${t.text}`}>
              25+ features. One platform.
            </h2>
            <p className={`mt-4 max-w-lg mx-auto text-base ${t.textSub}`}>
              Everything you need to create, optimize, and publish — without switching tools.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className={`rounded-2xl border p-6 transition-all duration-300 ${t.card} ${t.cardHover}`}>
                <span className="text-2xl block mb-3">{f.icon}</span>
                <h3 className={`font-bold text-sm mb-2 ${t.text}`}>{f.name}</h3>
                <p className={`text-xs leading-relaxed ${t.textSub}`}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
           CREATIVE CONTROL (MODES)
         ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 md:px-16 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="font-mono text-xs text-indigo-400 uppercase tracking-[0.3em] mb-3">Your Creative Control</p>
          <h2 className={`font-black text-4xl md:text-5xl leading-tight ${t.text}`}>
            Full AI or semi-manual.<br />You decide.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className={`rounded-2xl border p-8 transition-all duration-300 ${t.card} ${t.cardHover}`}>
            <div className="flex items-center justify-between mb-5">
              <h3 className={`font-black text-xl ${t.text}`}>Full AI Mode</h3>
              <span className="font-mono text-[9px] px-2.5 py-1 rounded-full border border-indigo-400/30 text-indigo-400 bg-indigo-400/10 uppercase tracking-widest">
                Hands Free
              </span>
            </div>
            <p className={`text-sm leading-relaxed mb-4 ${t.textSub}`}>
              Describe your domain, paste a rough idea, pick a platform. कLA writes everything — hook, script, hashtags, thumbnail copy.
            </p>
            <ul className="space-y-2">
              {['Complete scripts in <30 seconds', 'Platform-specific tone auto-tuned', 'Batch generate a month of content'].map((b, i) => (
                <li key={i} className={`flex items-center gap-2.5 text-sm ${t.textSub}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <div className={`rounded-2xl border p-8 transition-all duration-300 ${t.card} ${t.cardHover}`}>
            <div className="flex items-center justify-between mb-5">
              <h3 className={`font-black text-xl ${t.text}`}>Co-Creator Mode</h3>
              <span className="font-mono text-[9px] px-2.5 py-1 rounded-full border border-orange-400/30 text-orange-400 bg-orange-400/10 uppercase tracking-widest">
                Your Voice
              </span>
            </div>
            <p className={`text-sm leading-relaxed mb-4 ${t.textSub}`}>
              You write the idea, कLA amplifies it. Keep your raw voice — AI just sharpens the hook, structures the flow, fills the gaps.
            </p>
            <ul className="space-y-2">
              {['Your draft + AI structure & polish', 'Fine-tune each section manually', 'Sound like you, not a bot'].map((b, i) => (
                <li key={i} className={`flex items-center gap-2.5 text-sm ${t.textSub}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
           VIRAL SCORE INTERACTIVE
         ═══════════════════════════════════════════════════════════════════ */}
      <section className={`py-24 px-6 md:px-16 ${t.bgAlt} border-y ${t.borderFaint}`}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="font-mono text-xs text-orange-500 uppercase tracking-[0.3em] mb-3">Try It Now</p>
            <h2 className={`font-black text-4xl md:text-5xl ${t.text} mb-3`}>Is your idea viral?</h2>
            <p className={`text-sm ${t.textSub}`}>
              Type any video title or content idea. Get an instant virality prediction.
            </p>
          </div>

          <textarea
            value={viralInput}
            onChange={e => setViralInput(e.target.value)}
            placeholder="e.g. 5 secrets about UPSC that nobody tells you..."
            className={`w-full rounded-2xl px-6 py-5 text-sm resize-none border focus:outline-none focus:border-orange-400/50 transition-colors ${t.inputBg}`}
            rows={3}
          />
          <div className="mt-4 flex items-center gap-4">
            <div className={`flex-1 h-3 rounded-full overflow-hidden ${isDark ? 'bg-white/[0.06]' : 'bg-gray-200'}`}>
              <div className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${viralScore}%`,
                  background: viralScore > 70
                    ? 'linear-gradient(90deg, #F97316, #818CF8)'
                    : viralScore > 40
                      ? 'linear-gradient(90deg, #FBBF24, #F97316)'
                      : `linear-gradient(90deg, ${isDark ? '#4B5563' : '#9CA3AF'}, #FBBF24)`,
                }} />
            </div>
            <span className="font-mono text-3xl font-black min-w-[4ch] text-right"
              style={{ color: viralScore > 70 ? '#F97316' : viralScore > 40 ? '#FBBF24' : (isDark ? '#6B7280' : '#9CA3AF') }}>
              {viralScore}%
            </span>
            <span className={`text-xs font-mono ${t.textMuted}`}>
              {viralScore > 80 ? '🔥 Banger' : viralScore > 60 ? '⚡ Strong' : viralScore > 40 ? '👍 Decent' : '📝 Keep going'}
            </span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
           STATS
         ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 md:px-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { num: '850M+', label: 'Indian internet users by 2025' },
            { num: '9', label: 'Regional languages supported' },
            { num: '6', label: 'Platforms, one workflow' },
            { num: '<60s', label: 'From upload to 6 outputs' },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col">
              <span className="font-black text-5xl md:text-6xl bg-gradient-to-r from-orange-400 to-indigo-400 bg-clip-text text-transparent leading-none">
                {stat.num}
              </span>
              <span className={`text-xs mt-2 leading-relaxed ${t.textMuted}`}>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
           FINAL CTA
         ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-32 px-6 flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full blur-[120px]"
            style={{ opacity: isDark ? 0.12 : 0.06, background: 'radial-gradient(ellipse, #F97316 0%, #818CF8 50%, transparent 100%)' }} />
        </div>

        <h2 className={`font-black leading-none tracking-tight relative z-10 ${t.text}`}
          style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)' }}>
          Create a culture,<br />
          <span className="bg-gradient-to-r from-orange-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            not just a brand.
          </span>
        </h2>

        <p className={`mt-6 max-w-lg text-base leading-relaxed relative z-10 ${t.textSub}`}>
          Indian creators are publishing 3× more content with कLA. Your voice deserves every platform.
        </p>

        <div className="flex items-center gap-4 mt-12 relative z-10 flex-wrap justify-center">
          <Link href="/onboarding"
            className="px-10 py-5 rounded-full font-bold text-sm bg-gradient-to-r from-orange-400 to-indigo-500 text-white hover:opacity-90 transition-opacity shadow-lg shadow-orange-500/25">
            Start for Free — No Card Needed
          </Link>
        </div>

        <div className={`mt-16 font-mono text-[9px] uppercase tracking-widest relative z-10 ${t.textFaint}`}>
          psst... type &ldquo;bharat&rdquo; anywhere on this page
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
           FOOTER
         ═══════════════════════════════════════════════════════════════════ */}
      <footer className={`border-t ${t.borderFaint} py-12 px-6 md:px-16`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="font-black text-xl tracking-[-0.05em] flex items-baseline" style={{ lineHeight: 1 }}>
            <span className="text-orange-500 relative">
              क
              <span className="absolute top-[1px] right-[-6px] w-[10px] h-[2.5px] bg-orange-500 rounded-full" />
            </span>
            <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">L</span>
            <span className={isDark ? 'text-white/60' : 'text-gray-600'}>A</span>
          </div>
          <div className={`flex items-center gap-6 text-sm ${t.textSub}`}>
            <Link href="/upload" className="hover:text-orange-400 transition-colors">Upload</Link>
            <Link href="/dashboard" className="hover:text-orange-400 transition-colors">Dashboard</Link>
            <Link href="/marketplace" className="hover:text-orange-400 transition-colors">Marketplace</Link>
            <Link href="/community" className="hover:text-orange-400 transition-colors">Community</Link>
          </div>
          <div className={`font-mono text-[10px] ${t.textFaint}`}>Built for Bharat © 2026</div>
        </div>
      </footer>

      {/* ── Keyframes ─────────────────────────────────────────────────── */}
      <style>{`
        @keyframes marquee-left {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
        .animate-marquee-left  { animation: marquee-left  28s linear infinite; }
        .animate-marquee-right { animation: marquee-right 22s linear infinite; }
        @keyframes matrix-fall {
          0%   { transform: translateY(-100vh); }
          100% { transform: translateY(100vh); }
        }
        @keyframes tricolor-ring {
          0%, 100% { transform: scale(0.8); opacity: 0; }
          50%      { transform: scale(1.5); opacity: 0.4; }
        }
        @keyframes scale-breathe {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.1); }
        }
        @keyframes confetti-fall {
          0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// PROCESS PREVIEW (Hero right side)
// ═══════════════════════════════════════════════════════════════════════════
function ProcessPreview({ isDark }: { isDark: boolean }) {
  const t = {
    card: isDark ? 'bg-white/[0.04] border-white/[0.08]' : 'bg-white border-gray-200 shadow-sm',
    text: isDark ? 'text-white' : 'text-gray-900',
    sub: isDark ? 'text-white/40' : 'text-gray-500',
    faint: isDark ? 'text-white/20' : 'text-gray-300',
    bar: isDark ? 'bg-white/10' : 'bg-gray-200',
    connector: isDark ? 'border-white/[0.08]' : 'border-gray-200',
  }

  return (
    <div className="flex flex-col gap-3 w-full max-w-[280px]">
      {/* Step 1: Upload */}
      <div className={`rounded-2xl border p-4 ${t.card}`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">📤</span>
          <span className={`text-xs font-mono font-bold ${t.sub}`}>STEP 01 — Upload</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex-1 h-8 rounded-lg flex items-center px-3 ${isDark ? 'bg-white/[0.06]' : 'bg-gray-100'}`}>
            <span className={`text-[10px] ${t.faint}`}>my_video.mp4</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-orange-400/15 flex items-center justify-center text-orange-400 text-sm">↑</div>
        </div>
      </div>

      <div className={`h-4 w-px mx-auto border-l-2 border-dashed ${t.connector}`} />

      {/* Step 2: Processing */}
      <div className={`rounded-2xl border p-4 ${t.card}`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">⚡</span>
          <span className={`text-xs font-mono font-bold ${t.sub}`}>STEP 02 — AI processes</span>
        </div>
        <div className="space-y-2">
          {['Domain: Education ✓', 'Language: Hindi ✓', 'Tone: Conversational ✓'].map((line, i) => (
            <div key={i} className={`text-[11px] ${t.sub}`}>{line}</div>
          ))}
          <div className={`h-1.5 rounded-full overflow-hidden ${t.bar}`}>
            <div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-indigo-400 animate-pulse" style={{ width: '85%' }} />
          </div>
        </div>
      </div>

      <div className={`h-4 w-px mx-auto border-l-2 border-dashed ${t.connector}`} />

      {/* Step 3: Output */}
      <div className={`rounded-2xl border p-4 ${t.card}`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🚀</span>
          <span className={`text-xs font-mono font-bold ${t.sub}`}>STEP 03 — 6 outputs ready</span>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['YT', 'IG', 'LI', 'X', 'Pod', 'Shorts'].map((p, i) => (
            <span key={i} className={`text-[9px] px-2 py-1 rounded-full border font-mono ${
              isDark ? 'border-white/[0.08] text-white/40' : 'border-gray-200 text-gray-500'
            }`}>{p}</span>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3">
          <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${t.bar}`}>
            <div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-indigo-400" style={{ width: '87%' }} />
          </div>
          <span className="text-[9px] font-mono text-orange-400 font-bold">87% viral</span>
        </div>
      </div>
    </div>
  )
}
