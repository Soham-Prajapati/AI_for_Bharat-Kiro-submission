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
  // Geo-accurate India — viewBox 0 0 220 280
  // Projection: x = (lon-68)*7.33, y = 280-(lat-8)*9.66
  // NW Kashmir (37°N,73°E), Arunachal (28°N,97°E), Kanyakumari (8°N,77.5°E)
  const cities = [
    { cx: 67,  cy: 81,  label: 'Delhi',     r: 4.5, glow: '#818CF8' },
    { cx: 36,  cy: 173, label: 'Mumbai',    r: 3.5, glow: '#22D3EE' },
    { cx: 90,  cy: 231, label: 'Chennai',   r: 3.5, glow: '#22D3EE' },
    { cx: 150, cy: 139, label: 'Kolkata',   r: 3.5, glow: '#818CF8' },
    { cx: 77,  cy: 189, label: 'Hyderabad', r: 3.0, glow: '#818CF8' },
    { cx: 70,  cy: 233, label: 'Bengaluru', r: 3.0, glow: '#22D3EE' },
  ]
  return (
    <svg className={className} viewBox="0 0 220 280" fill="none">
      <defs>
        <filter id="city-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="india-glow" x="-8%" y="-8%" width="116%" height="116%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <linearGradient id="india-fill" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%"   stopColor="#6366F1" stopOpacity="0.22" />
          <stop offset="55%"  stopColor="#4F46E5" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.08" />
        </linearGradient>
        <linearGradient id="india-stroke" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#818CF8" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.35" />
        </linearGradient>
      </defs>

      {/* ── Main India silhouette — geo-projected, clockwise from Kashmir NW ── */}
      <path
        d="
          M 37 10
          C 50 4, 68 8, 82 17
          C 96 24, 112 22, 132 28
          C 150 33, 166 40, 176 50
          C 186 58, 196 68, 210 76
          C 216 82, 215 92, 208 98
          C 200 106, 193 114, 188 124
          C 183 134, 178 142, 172 150
          C 166 145, 160 138, 158 130
          C 156 122, 158 112, 162 106
          C 164 110, 162 120, 160 130
          C 158 140, 156 150, 156 160
          C 154 170, 152 180, 148 190
          C 142 202, 133 214, 122 228
          C 116 238, 110 252, 108 264
          C 106 270, 107 276, 108 277
          C 104 270, 99 258, 93 247
          C 84 234, 75 220, 68 207
          C 62 196, 55 185, 49 174
          C 44 165, 40 155, 36 144
          C 32 133, 28 122, 24 114
          C 20 108, 16 102, 16 96
          C 18 88, 22 80, 22 72
          C 21 64, 18 54, 20 44
          C 22 34, 28 24, 33 16
          C 35 12, 36 10, 37 10 Z
        "
        fill="url(#india-fill)"
        stroke="url(#india-stroke)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        filter="url(#india-glow)"
      />

      {/* ── Saurashtra / Kathiawar Peninsula (Gujarat) ── */}
      <path
        d="M 24 114 C 18 118, 10 122, 7 132 C 4 142, 8 152, 16 157
           C 24 162, 34 160, 40 154 C 46 148, 46 138, 42 130 C 38 124, 32 118, 24 114 Z"
        fill="rgba(99,102,241,0.10)"
        stroke="rgba(129,140,248,0.30)"
        strokeWidth="0.9"
      />

      {/* ── NE States (Assam/Nagaland/Manipur bulge after chicken neck) ── */}
      <path
        d="M 162 106 C 168 100, 176 96, 184 96 C 196 96, 210 100, 214 110
           C 218 120, 210 130, 200 132 C 190 134, 180 128, 172 120
           C 166 114, 162 110, 162 106 Z"
        fill="rgba(99,102,241,0.08)"
        stroke="rgba(129,140,248,0.25)"
        strokeWidth="0.8"
      />

      {/* ── Dashed connection lines between cities ── */}
      <path
        d={cities.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.cx} ${c.cy}`).join(' ')}
        stroke="rgba(99,102,241,0.15)"
        strokeWidth="0.6"
        strokeDasharray="3 5"
        fill="none"
      />

      {/* ── City dots ── */}
      {cities.map((city, i) => (
        <g key={i} filter="url(#city-glow)">
          <circle cx={city.cx} cy={city.cy} r={city.r + 6} fill={city.glow} fillOpacity="0.05" />
          <circle cx={city.cx} cy={city.cy} r={city.r} fill={city.glow} opacity="0.9" />
          <circle cx={city.cx} cy={city.cy} r={city.r * 2.6} fill="none" stroke={city.glow} strokeWidth="0.6" opacity="0.28" />
        </g>
      ))}

      {/* ── Delhi capital pulse rings ── */}
      <circle cx={67} cy={81} r="13" fill="none" stroke="#818CF8" strokeWidth="0.5" opacity="0.20" strokeDasharray="2 4" />
      <circle cx={67} cy={81} r="19" fill="none" stroke="#818CF8" strokeWidth="0.3" opacity="0.10" strokeDasharray="1 5" />

      {/* ── Sri Lanka ── */}
      <ellipse cx="100" cy="275" rx="5" ry="7" fill="rgba(34,211,238,0.07)" stroke="rgba(34,211,238,0.28)" strokeWidth="0.8" />
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

export function KLALogoSVG({ className = '', isDark = true }: { className?: string; isDark?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 86 36" fill="none">
      <defs>
        <linearGradient id="kla-l-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>
      </defs>
      {/* क — orange, positioned tight */}
      <text
        x="0" y="28"
        fontFamily="Outfit, sans-serif"
        fontWeight="900"
        fontSize="28"
        fill="#F97316"
      >
        क
      </text>
      {/* Connecting matra line — extends from the top stroke of क into L */}
      <line x1="16" y1="6.5" x2="28" y2="6.5" stroke="#F97316" strokeWidth="2.8" strokeLinecap="round" />
      {/* L — gradient, tight to क */}
      <text
        x="24" y="28"
        fontFamily="Outfit, sans-serif"
        fontWeight="900"
        fontSize="28"
        fill="url(#kla-l-grad)"
      >
        L
      </text>
      {/* A — white/dark text */}
      <text
        x="42" y="28"
        fontFamily="Outfit, sans-serif"
        fontWeight="900"
        fontSize="28"
        fill={isDark ? '#ffffff' : '#1f2937'}
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

// ── Neural Network SVG ─────────────────────────────────────────
export function NeuralNetSVG({ className = '' }: { className?: string }) {
  const layers = [
    [{ x: 30, y: 40 }, { x: 30, y: 80 }, { x: 30, y: 120 }, { x: 30, y: 160 }],
    [{ x: 100, y: 55 }, { x: 100, y: 95 }, { x: 100, y: 135 }],
    [{ x: 170, y: 70 }, { x: 170, y: 110 }, { x: 170, y: 150 }],
    [{ x: 240, y: 85 }, { x: 240, y: 125 }],
  ]
  return (
    <svg className={className} viewBox="0 0 270 200" fill="none">
      <defs>
        <radialGradient id="nn-node" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6366F1" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#6366F1" stopOpacity="0.3" />
        </radialGradient>
      </defs>
      {/* Connections */}
      {layers.slice(0, -1).map((layer, li) =>
        layer.map((from, fi) =>
          layers[li + 1].map((to, ti) => (
            <line
              key={`${li}-${fi}-${ti}`}
              x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              stroke="rgba(99,102,241,0.15)" strokeWidth="0.8"
            />
          ))
        )
      )}
      {/* Nodes */}
      {layers.flat().map((node, i) => (
        <g key={i}>
          <circle cx={node.x} cy={node.y} r="7" fill="rgba(99,102,241,0.12)" stroke="rgba(99,102,241,0.5)" strokeWidth="1" />
          <circle cx={node.x} cy={node.y} r="3" fill="url(#nn-node)" />
        </g>
      ))}
    </svg>
  )
}

// ── Fingerprint SVG ────────────────────────────────────────────
export function FingerprintSVG({ className = '' }: { className?: string }) {
  const rings = [8, 18, 28, 38, 48, 58]
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none">
      <defs>
        <clipPath id="fp-clip">
          <circle cx="60" cy="60" r="56" />
        </clipPath>
      </defs>
      {rings.map((r, i) => (
        <circle
          key={i}
          cx="60" cy="60" r={r}
          stroke="rgba(99,102,241,0.35)"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray={`${r * 0.6} ${r * 0.15}`}
          strokeLinecap="round"
          clipPath="url(#fp-clip)"
        />
      ))}
      <circle cx="60" cy="60" r="4" fill="#6366F1" opacity="0.8" />
    </svg>
  )
}

// ── Radial Burst SVG ───────────────────────────────────────────
export function RadialBurstSVG({ className = '', color = '#6366F1' }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none">
      {Array.from({ length: 24 }, (_, i) => {
        const angle = (i / 24) * Math.PI * 2
        const x1 = 100 + Math.cos(angle) * 30
        const y1 = 100 + Math.sin(angle) * 30
        const len = i % 3 === 0 ? 65 : i % 2 === 0 ? 50 : 38
        const x2 = 100 + Math.cos(angle) * len
        const y2 = 100 + Math.sin(angle) * len
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={color} strokeWidth={i % 3 === 0 ? '1.5' : '0.8'}
            opacity={i % 3 === 0 ? '0.5' : '0.2'}
          />
        )
      })}
      <circle cx="100" cy="100" r="28" fill="none" stroke={color} strokeWidth="1.5" opacity="0.3" />
      <circle cx="100" cy="100" r="8" fill={color} opacity="0.6" />
    </svg>
  )
}

// ── Circuit Board Pattern ──────────────────────────────────────
export function CircuitSVG({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 300 200" fill="none">
      <defs>
        <pattern id="circuit-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 10 0 L 10 20 L 30 20 L 30 40 L 50 40" stroke="rgba(99,102,241,0.2)" strokeWidth="1" fill="none" />
          <path d="M 0 30 L 20 30 L 20 10 L 40 10 L 40 30 L 60 30" stroke="rgba(34,211,238,0.15)" strokeWidth="1" fill="none" />
          <circle cx="10" cy="20" r="2.5" fill="rgba(99,102,241,0.4)" />
          <circle cx="30" cy="40" r="2.5" fill="rgba(34,211,238,0.35)" />
          <circle cx="20" cy="10" r="2" fill="rgba(99,102,241,0.3)" />
          <rect x="44" y="36" width="8" height="8" rx="1" fill="none" stroke="rgba(99,102,241,0.3)" strokeWidth="0.8" />
        </pattern>
      </defs>
      <rect width="300" height="200" fill="url(#circuit-pattern)" />
    </svg>
  )
}

// ── Content Transform Flow ─────────────────────────────────────
export function ContentFlowSVG({ className = '' }: { className?: string }) {
  const platforms = ['YT', 'IG', 'LI', 'X', 'FB', 'TT']
  const yPositions = [15, 38, 61, 84, 107, 130]
  return (
    <svg className={className} viewBox="0 0 260 150" fill="none">
      {/* Video input */}
      <rect x="5" y="55" width="50" height="40" rx="8" fill="rgba(99,102,241,0.1)" stroke="rgba(99,102,241,0.35)" strokeWidth="1.2" />
      <polygon points="28,65 28,85 44,75" fill="rgba(99,102,241,0.6)" />
      <text x="10" y="105" fill="rgba(99,102,241,0.5)" fontSize="7" fontFamily="JetBrains Mono">VIDEO</text>

      {/* KLA Engine */}
      <rect x="95" y="48" width="60" height="55" rx="10" fill="rgba(99,102,241,0.08)" stroke="rgba(99,102,241,0.4)" strokeWidth="1.5" />
      <text x="110" y="72" fill="#818CF8" fontSize="10" fontFamily="Outfit" fontWeight="900">KLA</text>
      <text x="102" y="87" fill="rgba(99,102,241,0.4)" fontSize="7" fontFamily="JetBrains Mono">ENGINE</text>
      {/* Pulse rings */}
      <circle cx="125" cy="75" r="32" fill="none" stroke="rgba(99,102,241,0.08)" strokeWidth="1" />
      <circle cx="125" cy="75" r="42" fill="none" stroke="rgba(99,102,241,0.05)" strokeWidth="1" />

      {/* Arrows in */}
      <path d="M 58 75 L 92 75" stroke="rgba(99,102,241,0.4)" strokeWidth="1.5" markerEnd="url(#arrow)" />

      {/* Arrows out to platforms */}
      {yPositions.map((y, i) => (
        <g key={i}>
          <path d={`M 158 75 Q 185 75 ${188} ${y + 7}`} stroke="rgba(99,102,241,0.2)" strokeWidth="1" fill="none" />
          <rect x={192} y={y} width={28} height={18} rx={4}
            fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
          <text x={199} y={y + 12} fill="rgba(255,255,255,0.4)" fontSize="7" fontFamily="JetBrains Mono">{platforms[i]}</text>
        </g>
      ))}

      <defs>
        <marker id="arrow" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
          <path d="M 0 0 L 6 3 L 0 6 Z" fill="rgba(99,102,241,0.5)" />
        </marker>
      </defs>
    </svg>
  )
}
