/**
 * KLA SVG Asset Library
 * All inline SVGs for logo, platform icons, decorative elements, and India map
 */

// ── Platform Icons ──────────────────────────────────────────────
export function YouTubeIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

export function InstagramIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  )
}

export function LinkedInIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

export function TwitterXIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

export function FacebookIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

export function TikTokIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  )
}

// ── Decorative SVGs ──────────────────────────────────────────────

export function GridDotPattern({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="400" height="400" viewBox="0 0 400 400" fill="none">
      <defs>
        <pattern id="dot-grid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="currentColor" opacity="0.35" />
        </pattern>
      </defs>
      <rect width="400" height="400" fill="url(#dot-grid)" />
    </svg>
  )
}

export function WaveformSVG({ className = '' }: { className?: string }) {
  const bars = Array.from({ length: 48 }, (_, i) => {
    const h = 10 + Math.sin(i * 0.45) * 20 + Math.sin(i * 0.9) * 12 + Math.sin(i * 1.8) * 8
    return Math.max(4, h)
  })
  return (
    <svg className={className} viewBox="0 0 240 60" fill="none">
      {bars.map((h, i) => (
        <rect
          key={i}
          x={i * 5}
          y={(60 - h) / 2}
          width="3"
          height={h}
          rx="1.5"
          fill="currentColor"
          opacity={0.3 + (i / 48) * 0.7}
        />
      ))}
    </svg>
  )
}

export function ArrowRightSVG({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  )
}

export function CheckCircleSVG({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

export function DNAHelixSVG({ className = '' }: { className?: string }) {
  const path1 = 'M 10 5 C 30 5, 30 25, 50 25 C 70 25, 70 45, 90 45 C 110 45, 110 25, 130 25 C 150 25, 150 5, 170 5'
  const path2 = 'M 10 45 C 30 45, 30 25, 50 25 C 70 25, 70 5, 90 5 C 110 5, 110 25, 130 25 C 150 25, 150 45, 170 45'
  return (
    <svg className={className} viewBox="0 0 180 50" fill="none">
      <path d={path1} stroke="#6366F1" strokeWidth="2" opacity="0.6" />
      <path d={path2} stroke="#22D3EE" strokeWidth="2" opacity="0.6" />
      {[25, 50, 90, 130, 155].map((x, i) => (
        <line key={i} x1={x} y1="10" x2={x} y2="40" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="2 2" />
      ))}
    </svg>
  )
}

export function IndiaSilhouetteSVG({ className = '' }: { className?: string }) {
  // Simplified India outline path
  return (
    <svg className={className} viewBox="0 0 200 220" fill="none">
      <path
        d="M 95 10 L 115 12 L 145 20 L 160 35 L 170 55 L 165 70 L 175 85 L 180 105 L 170 120 L 155 130 L 145 150 L 135 170 L 120 190 L 100 210 L 85 195 L 70 175 L 58 155 L 48 135 L 35 120 L 25 105 L 20 85 L 25 70 L 30 55 L 40 40 L 55 28 L 75 18 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="currentColor"
        fillOpacity="0.06"
        strokeOpacity="0.3"
      />
      {/* Dots for major cities */}
      {[
        { cx: 75, cy: 70, label: 'Delhi' },
        { cx: 90, cy: 130, label: 'Mumbai' },
        { cx: 125, cy: 145, label: 'Chennai' },
        { cx: 115, cy: 105, label: 'Hyderabad' },
        { cx: 130, cy: 80, label: 'Kolkata' },
        { cx: 80, cy: 160, label: 'Bengaluru' },
      ].map((city, i) => (
        <g key={i}>
          <circle cx={city.cx} cy={city.cy} r="3" fill="#6366F1" opacity="0.7" />
          <circle cx={city.cx} cy={city.cy} r="6" fill="none" stroke="#6366F1" strokeWidth="0.5" opacity="0.3" />
        </g>
      ))}
      {/* Connection lines between cities */}
      <path d="M 75 70 L 90 130 L 125 145 L 115 105 L 130 80 L 80 160" stroke="#6366F1" strokeWidth="0.5" opacity="0.2" strokeDasharray="3 4" />
    </svg>
  )
}

export function PlatformFlowSVG({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 300 160" fill="none">
      {/* Center node */}
      <circle cx="150" cy="80" r="20" fill="#6366F1" fillOpacity="0.15" stroke="#6366F1" strokeWidth="1.5" />
      <text x="150" y="84" textAnchor="middle" fill="#818CF8" fontSize="9" fontFamily="JetBrains Mono">KLA</text>
      {/* Spokes */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        const x2 = 150 + Math.cos(rad) * 55
        const y2 = 80 + Math.sin(rad) * 55
        return (
          <g key={i}>
            <line x1="150" y1="80" x2={x2} y2={y2} stroke="rgba(99,102,241,0.3)" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx={x2} cy={y2} r="10" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          </g>
        )
      })}
    </svg>
  )
}

export function SparklesSVG({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none">
      {[
        { cx: 20, cy: 20, s: 1.2 },
        { cx: 80, cy: 15, s: 0.8 },
        { cx: 50, cy: 50, s: 1.5 },
        { cx: 15, cy: 75, s: 0.9 },
        { cx: 85, cy: 80, s: 1.1 },
        { cx: 60, cy: 30, s: 0.7 },
      ].map((star, i) => (
        <g key={i} transform={`translate(${star.cx}, ${star.cy}) scale(${star.s})`}>
          <path d="M0 -8 L1.5 -1.5 L8 0 L1.5 1.5 L0 8 L-1.5 1.5 L-8 0 L-1.5 -1.5 Z" fill="#818CF8" opacity="0.5" />
        </g>
      ))}
    </svg>
  )
}

export function KLALogoSVG({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 32" fill="none">
      <text
        x="4" y="26"
        fontFamily="Outfit, sans-serif"
        fontWeight="900"
        fontSize="26"
        letterSpacing="-1"
        fill="white"
      >
        K
      </text>
      <defs>
        <linearGradient id="kla-l-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>
      </defs>
      <text
        x="24" y="26"
        fontFamily="Outfit, sans-serif"
        fontWeight="900"
        fontSize="26"
        letterSpacing="-1"
        fill="url(#kla-l-grad)"
      >
        L
      </text>
      <text
        x="44" y="26"
        fontFamily="Outfit, sans-serif"
        fontWeight="900"
        fontSize="26"
        letterSpacing="-1"
        fill="white"
      >
        A
      </text>
    </svg>
  )
}

export const PLATFORM_CONFIG = [
  { name: 'YouTube',   Icon: YouTubeIcon,   color: '#FF0000', bg: 'bg-red-500/10',    border: 'border-red-500/20',    text: 'text-red-400' },
  { name: 'Instagram', Icon: InstagramIcon, color: '#E1306C', bg: 'bg-pink-500/10',   border: 'border-pink-500/20',   text: 'text-pink-400' },
  { name: 'LinkedIn',  Icon: LinkedInIcon,  color: '#0A66C2', bg: 'bg-blue-500/10',   border: 'border-blue-500/20',   text: 'text-blue-400' },
  { name: 'X / Twitter', Icon: TwitterXIcon, color: '#FFFFFF', bg: 'bg-white/10',    border: 'border-white/20',      text: 'text-white/80' },
  { name: 'Facebook',  Icon: FacebookIcon,  color: '#1877F2', bg: 'bg-blue-400/10',   border: 'border-blue-400/20',   text: 'text-blue-300' },
  { name: 'TikTok',    Icon: TikTokIcon,    color: '#69C9D0', bg: 'bg-teal-400/10',   border: 'border-teal-400/20',   text: 'text-teal-400' },
]
