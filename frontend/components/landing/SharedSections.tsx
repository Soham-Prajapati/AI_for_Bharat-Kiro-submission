'use client'

import { WaveformSVG, IndiaSilhouetteSVG, PLATFORM_CONFIG, CheckCircleSVG, DNAHelixSVG } from './SVGAssets'

// ── Theme System ──────────────────────────────────────────────
export type SectionTheme = 'indigo' | 'orange' | 'cyan' | 'noir'

interface ThemeTokens {
  label: string; accent: string; accentAlt: string
  gradFrom: string; gradTo: string; sectionBg: string
  cardBg: string; cardBorder: string; bodyText: string
  starColor: string; highlightCardBg: string; highlightBorder: string
  btnPrimary: string; dot: string
}

export const THEMES: Record<SectionTheme, ThemeTokens> = {
  indigo: {
    label: 'text-brand-400', accent: 'text-brand-400', accentAlt: 'text-cyan-400',
    gradFrom: 'from-brand-400', gradTo: 'to-cyan-400', sectionBg: 'bg-bg-deep',
    cardBg: 'bg-white/[0.03] border-white/[0.08]', cardBorder: 'border-white/[0.08]',
    bodyText: 'text-white/40', starColor: 'text-amber-400',
    highlightCardBg: 'bg-gradient-to-b from-brand-500/20 to-brand-600/5',
    highlightBorder: 'border-brand-500/40',
    btnPrimary: 'bg-gradient-to-br from-brand-500 to-brand-600 text-white hover:shadow-[0_0_30px_rgba(99,102,241,0.35)]',
    dot: 'bg-emerald-400',
  },
  orange: {
    label: 'text-orange-400', accent: 'text-orange-400', accentAlt: 'text-red-400',
    gradFrom: 'from-orange-400', gradTo: 'to-red-400', sectionBg: 'bg-[#0a0500]',
    cardBg: 'bg-orange-500/[0.05] border-orange-500/[0.1]', cardBorder: 'border-orange-500/[0.1]',
    bodyText: 'text-white/40', starColor: 'text-orange-400',
    highlightCardBg: 'bg-gradient-to-b from-orange-500/25 to-orange-600/5',
    highlightBorder: 'border-orange-500/50',
    btnPrimary: 'bg-gradient-to-br from-orange-500 to-red-500 text-white hover:shadow-[0_0_30px_rgba(249,115,22,0.4)]',
    dot: 'bg-orange-400',
  },
  cyan: {
    label: 'text-cyan-400', accent: 'text-cyan-400', accentAlt: 'text-brand-400',
    gradFrom: 'from-cyan-400', gradTo: 'to-brand-400', sectionBg: 'bg-bg-deep',
    cardBg: 'bg-cyan-400/[0.03] border-cyan-400/[0.1]', cardBorder: 'border-cyan-400/[0.1]',
    bodyText: 'text-white/40', starColor: 'text-cyan-300',
    highlightCardBg: 'bg-gradient-to-b from-cyan-500/20 to-cyan-600/5',
    highlightBorder: 'border-cyan-400/40',
    btnPrimary: 'bg-gradient-to-br from-cyan-500 to-brand-500 text-white hover:shadow-[0_0_30px_rgba(34,211,238,0.35)]',
    dot: 'bg-cyan-400',
  },
  noir: {
    label: 'text-white/30', accent: 'text-white', accentAlt: 'text-white/60',
    gradFrom: 'from-white', gradTo: 'to-white/40', sectionBg: 'bg-[#040709]',
    cardBg: 'bg-white/[0.025] border-white/[0.07]', cardBorder: 'border-white/[0.07]',
    bodyText: 'text-white/30', starColor: 'text-white/50',
    highlightCardBg: 'bg-white/[0.07]',
    highlightBorder: 'border-white/[0.25]',
    btnPrimary: 'bg-white text-black hover:bg-white/90',
    dot: 'bg-white/50',
  },
}

interface SectionProps { theme?: SectionTheme }

const TESTIMONIALS = [
  {
    text: "I used to spend 4 hours adapting every video. कLA cut it to 4 minutes. I'm launching on 3 new platforms this month.",
    name: 'Priya Sharma',
    handle: '@priyacooks',
    platform: 'YouTube · 280K subscribers',
    avatar: 'PS',
    avatarGrad: 'from-pink-500 to-orange-400',
  },
  {
    text: "The Hindi and Tamil outputs are genuinely good — not translated, actually culturally adapted. My south India audience exploded.",
    name: 'Karthik Rajan',
    handle: '@karthiktech',
    platform: 'LinkedIn · 45K followers',
    avatar: 'KR',
    avatarGrad: 'from-brand-400 to-cyan-400',
  },
  {
    text: "Creator DNA is wild. My clients say the AI posts sound exactly like me. I run 6 creator accounts with कLA as my only tool now.",
    name: 'Ananya Verma',
    handle: '@ananya.creates',
    platform: 'Instagram · 520K followers',
    avatar: 'AV',
    avatarGrad: 'from-purple-500 to-pink-400',
  },
]

const INDIA_LANGUAGES = [
  { name: 'हिन्दी', romanized: 'Hindi', speakers: '600M+' },
  { name: 'தமிழ்', romanized: 'Tamil', speakers: '80M+' },
  { name: 'తెలుగు', romanized: 'Telugu', speakers: '95M+' },
  { name: 'ಕನ್ನಡ', romanized: 'Kannada', speakers: '60M+' },
  { name: 'বাংলা', romanized: 'Bengali', speakers: '100M+' },
  { name: 'मराठी', romanized: 'Marathi', speakers: '95M+' },
  { name: 'ગુજરાતી', romanized: 'Gujarati', speakers: '60M+' },
  { name: 'ਪੰਜਾਬੀ', romanized: 'Punjabi', speakers: '30M+' },
  { name: 'മലയാളം', romanized: 'Malayalam', speakers: '38M+' },
]

export function TestimonialsSection({ theme = 'indigo' }: SectionProps) {
  const tk = THEMES[theme]
  return (
    <section className={`${tk.sectionBg} py-28 px-6 overflow-hidden`}>
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <p className={`font-mono text-xs tracking-[0.3em] uppercase mb-3 ${tk.label}`}>Creator Stories</p>
          <h2 className="font-display font-black text-[clamp(2.5rem,5vw,4rem)] tracking-[-2px] text-white">
            Real creators.<br />
            <span className={`bg-gradient-to-r ${tk.gradFrom} ${tk.gradTo} bg-clip-text text-transparent`}>Real results.</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className={`relative border ${tk.cardBg} rounded-3xl p-7 flex flex-col gap-5`}>
              <div className="flex gap-1">
                {Array(5).fill(0).map((_, s) => (
                  <svg key={s} className={`w-3.5 h-3.5 ${tk.starColor}`} viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.887a1 1 0 00-1.176 0l-3.976 2.887c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                ))}
              </div>
              <p className={`text-sm leading-relaxed flex-1 ${tk.bodyText} font-medium`}>"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.avatarGrad} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>{t.avatar}</div>
                <div>
                  <div className="font-semibold text-sm text-white">{t.name}</div>
                  <div className={`text-xs ${tk.bodyText}`}>{t.platform}</div>
                </div>
              </div>
              <WaveformSVG className={`absolute -bottom-1 right-4 w-24 opacity-10 ${tk.accent}`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function IndiaCoverage({ theme = 'indigo' }: SectionProps) {
  const tk = THEMES[theme]
  const mapColor = theme === 'orange' ? 'text-orange-400' : theme === 'cyan' ? 'text-cyan-400' : theme === 'noir' ? 'text-white/40' : 'text-brand-400'
  return (
    <section className="py-28 px-6 bg-bg-base overflow-hidden">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className={`font-mono text-xs ${tk.label} tracking-[0.3em] uppercase mb-4`}>Coverage</p>
            <h2 className="font-display font-black text-[clamp(2.5rem,5vw,4rem)] tracking-[-2px] text-white mb-6">
              Every creator.<br />
              <span className={`bg-gradient-to-r ${tk.gradFrom} ${tk.gradTo} bg-clip-text text-transparent`}>
                Every corner of India.
              </span>
            </h2>
            <p className={`${tk.bodyText} text-base leading-relaxed mb-10 max-w-md`}>
              कLA adapts your content to 9 regional languages with cultural intelligence — not just word-for-word translation. Your audience in Chennai gets a different emotional resonance than your audience in Delhi.
            </p>
            <div className="grid grid-cols-3 gap-3">
              {INDIA_LANGUAGES.map((lang, i) => (
                <div key={i} className={`border ${tk.cardBorder} bg-white/[0.025] rounded-2xl p-3 hover:bg-white/[0.05] transition-all duration-300 cursor-default group`}>
                  <div className="font-display font-bold text-lg text-white mb-0.5">{lang.name}</div>
                  <div className="text-white/30 text-xs">{lang.romanized}</div>
                  <div className="text-white/20 text-[10px] font-mono mt-1">{lang.speakers}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative flex items-center justify-center min-h-[340px]">
            <IndiaSilhouetteSVG className={`w-64 h-72 relative z-10 ${mapColor}`} />
            <div className="absolute top-4 right-4 bg-white/[0.06] border border-white/10 backdrop-blur-xl rounded-2xl px-5 py-3 text-center shadow-xl">
              <div className={`font-display font-black text-3xl bg-gradient-to-r ${tk.gradFrom} ${tk.gradTo} bg-clip-text text-transparent`}>1.4B</div>
              <div className="text-white/30 text-xs mt-0.5">People Reachable</div>
            </div>
            <div className="absolute bottom-4 left-4 bg-white/[0.06] border border-white/10 backdrop-blur-xl rounded-2xl px-5 py-3 text-center shadow-xl">
              <div className={`font-display font-black text-3xl ${tk.accentAlt}`}>28</div>
              <div className="text-white/30 text-xs mt-0.5">States Covered</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function PlatformShowcase({ theme = 'indigo' }: SectionProps) {
  const tk = THEMES[theme]
  return (
    <section className="py-24 px-6 bg-bg-deep">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-14">
          <p className={`font-mono text-xs ${tk.label} tracking-[0.3em] uppercase mb-3`}>Platform Coverage</p>
          <h2 className="font-display font-black text-[clamp(2rem,4vw,3.5rem)] tracking-[-2px] text-white">
            One upload.<br />
            <span className={`bg-gradient-to-r ${tk.gradFrom} ${tk.gradTo} bg-clip-text text-transparent`}>
              Six perfect executions.
            </span>
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {PLATFORM_CONFIG.map((platform, i) => (
            <div key={i} className={`group relative border ${platform.border} ${platform.bg} rounded-2xl p-5 flex flex-col items-center gap-3 hover:scale-105 transition-all duration-300 cursor-default`}>
              <platform.Icon className={`w-7 h-7 ${platform.text}`} />
              <span className="text-white/60 text-xs font-medium text-center">{platform.name}</span>
              <div className="w-full h-px bg-white/[0.06]" />
              <div className="flex flex-col gap-1.5 w-full">
                {['Captions', 'Hashtags', 'Thumbnail'].map((item, j) => (
                  <div key={j} className="flex items-center gap-1.5 text-white/30 text-[10px]">
                    <CheckCircleSVG className={`w-3 h-3 flex-shrink-0 ${theme === 'orange' ? 'text-orange-400' : theme === 'noir' ? 'text-white/40' : 'text-emerald-400'}`} />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function CreatorDNASection({ theme = 'indigo' }: SectionProps) {
  const tk = THEMES[theme]
  return (
    <section className="py-28 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-bg-base via-transparent to-bg-base pointer-events-none" />
      <div className="max-w-[900px] mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-3 mb-8">
          <DNAHelixSVG className="w-48 opacity-80" />
        </div>
        <p className={`font-mono text-xs ${tk.label} tracking-[0.3em] uppercase mb-4`}>Creator DNA</p>
        <h2 className="font-display font-black text-[clamp(2.5rem,5vw,4.5rem)] tracking-[-3px] text-white mb-6">
          The AI that sounds like{' '}
          <span className={`bg-gradient-to-r ${tk.gradFrom} ${tk.gradTo} bg-clip-text text-transparent`}>you</span>.
        </h2>
        <p className={`${tk.bodyText} text-lg leading-relaxed max-w-2xl mx-auto mb-12`}>
          कLA profiles your communication style, vocabulary, tone, and cultural references from your existing content. Every AI output then gets filtered through your DNA before you see it. The result: content that feels personal, not generated.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { step: '01', title: 'Upload 5 past videos', desc: 'कLA reads tone, vocabulary, sentence rhythms.' },
            { step: '02', title: 'DNA model built', desc: 'A unique voice fingerprint — never shared.' },
            { step: '03', title: 'Every output, in your voice', desc: 'Captions, scripts, translations — all you.' },
          ].map((s, i) => (
            <div key={i} className={`border ${tk.cardBorder} bg-white/[0.03] rounded-3xl p-6 text-left`}>
              <div className={`font-mono ${tk.label} text-sm mb-3`}>{s.step}</div>
              <h3 className="font-display font-bold text-lg text-white mb-2">{s.title}</h3>
              <p className={`${tk.bodyText} text-sm`}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function PricingStripSection({ theme = 'indigo' }: SectionProps) {
  const tk = THEMES[theme]
  return (
    <section className={`py-20 px-6 ${tk.sectionBg} border-y border-white/[0.06]`}>
      <div className="max-w-[1000px] mx-auto">
        <div className="text-center mb-12">
          <p className={`font-mono text-xs ${tk.label} tracking-[0.3em] uppercase mb-3`}>Pricing</p>
          <h2 className="font-display font-black text-[clamp(2rem,4vw,3rem)] tracking-[-2px] text-white">
            Start free.<br />
            <span className={`bg-gradient-to-r ${tk.gradFrom} ${tk.gradTo} bg-clip-text text-transparent`}>
              Scale when you&#39;re ready.
            </span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { name: 'Starter', price: '₹0', desc: 'First 10 videos free', cta: 'Start Free', highlight: false, features: ['5 platforms', '3 languages', '10 videos/mo'] },
            { name: 'Creator', price: '₹999', desc: 'per month', cta: 'Get Creator', highlight: true, features: ['6 platforms', '9 languages', 'Unlimited videos', 'Creator DNA', 'Viral Score'] },
            { name: 'Agency', price: '₹4,999', desc: 'per month', cta: 'Contact Us', highlight: false, features: ['Everything in Creator', '20 creator accounts', 'Priority support', 'API access'] },
          ].map((plan, i) => (
            <div key={i} className={`relative rounded-3xl p-7 border ${
              plan.highlight
                ? `${tk.highlightCardBg} ${tk.highlightBorder}`
                : `bg-white/[0.025] ${tk.cardBorder}`
            }`}>
              {plan.highlight && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r ${tk.gradFrom} ${tk.gradTo} text-white text-[10px] font-bold px-4 py-1 rounded-full`}>
                  MOST POPULAR
                </div>
              )}
              <div className="text-white/50 text-sm font-medium mb-4">{plan.name}</div>
              <div className="font-display font-black text-4xl text-white mb-1">{plan.price}</div>
              <div className={`${tk.bodyText} text-xs mb-6`}>{plan.desc}</div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f, fi) => (
                  <li key={fi} className="flex items-center gap-2 text-white/50 text-sm">
                    <CheckCircleSVG className={`w-4 h-4 flex-shrink-0 ${theme === 'orange' ? 'text-orange-400' : theme === 'noir' ? 'text-white/40' : 'text-emerald-400'}`} />
                    {f}
                  </li>
                ))}
              </ul>
              <button className={`w-full py-3 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5 ${
                plan.highlight ? tk.btnPrimary : 'bg-white/[0.06] border border-white/10 text-white/70 hover:bg-white/[0.1] hover:text-white'
              }`}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
