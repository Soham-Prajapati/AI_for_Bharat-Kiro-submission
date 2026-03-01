# 📜 Design Rules — ContentAI Design Constitution

> Every design decision in ContentAI must trace back to these rules. This is the law of the land. No exceptions without documented justification.
>
> **Design Direction:** Luminous Glass — dark glassmorphic base, bento grid layouts, neo-brutalist CTA accents, aurora gradient atmospherics, kinetic typography heroes
>
> **Last Updated:** March 1, 2026

---

## 1. Color Rules

### DO ✅
- Use `--bg-void` (#030712) as the deepest background layer
- Use `--bg-glass` (rgba 255,255,255,0.04) for all card surfaces
- Use `--brand-500` (#6366F1) as the primary action color
- Use `--cyan` (#22D3EE) ONLY for secondary accents and data highlights
- Apply brand glow (`box-shadow: 0 0 20px rgba(99,102,241,0.2)`) on primary CTAs
- Use `--text-secondary` (#9CA3AF) for body text, `--text-primary` (#F9FAFB) for headings

### DON'T ❌
- Never use pure black (#000000) — always use `--bg-void` (#030712) or darker values
- Never use pure white (#FFFFFF) for text — always `--text-primary` (#F9FAFB)
- Never mix more than 3 hues on a single screen (brand indigo + cyan accent + one status color max)
- Never put brand-colored text on brand-colored backgrounds
- Never use color as the ONLY indicator — always pair with icon/text for accessibility

### Glass Opacity Scale
```
Background card:    rgba(255, 255, 255, 0.04)
Background hover:   rgba(255, 255, 255, 0.07)
Border default:     rgba(255, 255, 255, 0.06)
Border hover:       rgba(255, 255, 255, 0.12)
Border focus:       rgba(99, 102, 241, 0.5)
```

---

## 2. Typography Rules

### Hierarchy
| Level | Font | Weight | Size | Use Case |
|-------|------|--------|------|----------|
| Hero | Outfit | 900 | clamp(2.5rem, 6vw, 4.5rem) | Landing page hero headline ONLY |
| H1 | Outfit | 800 | 2.25rem | Page titles |
| H2 | Outfit | 800 | 1.5rem | Section titles |
| H3 | Outfit | 700 | 1.25rem | Card titles |
| Body | Inter | 400 | 1rem | All paragraph text |
| Small | Inter | 500 | 0.875rem | Labels, secondary info |
| Mono | JetBrains Mono | 500 | 0.75rem | Code, stats, timestamps |

### Rules
- **Outfit** is for HEADLINES ONLY. Never use Outfit for body text.
- **Inter** is for everything else. Do not introduce new fonts without design review.
- Hero headlines: max 8 words. If it needs more words, the headline is wrong.
- Section titles: max 12 words.
- CTA buttons: max 4 words. "Start Creating — Free" not "Get Started With ContentAI Today For Free"
- Letter-spacing: -2px on hero, -1px on H1/H2, 0 on body, +1px on labels

---

## 3. Spacing Rules

### Grid
Base unit: **8px**. Every spacing value must be a multiple of 4px.

| Token | Value | Use |
|-------|-------|-----|
| xs | 4px | Icon padding, inline gaps |
| sm | 8px | Between related elements |
| md | 16px | Component internal padding |
| lg | 24px | Card padding |
| xl | 32px | Between sections |
| 2xl | 48px | Major section gaps |
| 3xl | 64px | Vertical section padding |
| hero | 80-120px | Section padding on landing pages |

### Rules
- Card padding: ALWAYS 24px (sm screens) or 32px (lg screens)
- Gap between cards in a grid: ALWAYS 20px
- Section vertical padding: 120px on desktop, 80px on mobile
- Never eyeball spacing — use the tokens

---

## 4. Component Rules

### Glass Cards
```css
/* Default */
background: rgba(255, 255, 255, 0.04);
backdrop-filter: blur(24px);
border: 1px solid rgba(255, 255, 255, 0.06);
border-radius: 20px;
padding: 32px;

/* Hover — ALWAYS animate */
transition: all 0.3s ease;
hover:background → rgba(255, 255, 255, 0.07);
hover:border-color → rgba(255, 255, 255, 0.12);
hover:transform → translateY(-2px);
```

### Buttons
| Type | Use | Visual |
|------|-----|--------|
| Primary | Main action (1 per screen) | Indigo gradient + glow shadow |
| Secondary | Secondary action | Transparent + border |
| Ghost | Tertiary/back/cancel | No border, text only |
| Destructive | Delete/remove | Red background, white text |

**Rules:**
- Only ONE primary button per screen viewport
- Buttons always have hover state (translateY -1px + increased glow)
- Minimum touch target: 44px height
- Button border-radius: 12px (ALWAYS — never 0, never fully rounded)
- Icon + text buttons: icon BEFORE text, 8px gap

### Inputs
- Always have 4 states: default, focus, error, disabled
- Focus = indigo border glow ring (3px)
- Error = red border + red helper text below
- Placeholder text color: `--text-tertiary`
- Border-radius: 12px (matches buttons)

---

## 5. Animation Rules

### Timing
| Type | Duration | Easing |
|------|----------|--------|
| Micro (hover, focus) | 200ms | ease |
| Component (reveal, slide) | 300ms | ease-out |
| Page (section reveal) | 700ms | cubic-bezier(0.16, 1, 0.3, 1) |
| Background (orb float) | 20s | ease-in-out |
| Counter (number count-up) | 1s | linear |

### Rules
- **Everything interactive MUST animate on hover.** No static buttons, no static cards.
- Scroll reveal: elements come from bottom (translateY 30px → 0) with opacity fade
- Stagger delays: 100ms between siblings in a list/grid
- NEVER animate font-size or width — use transform and opacity only
- Processing screen: animated elements must communicate progress, not decorate
- Landing page: minimum 3 scroll-triggered animations

### What SHOULD Animate
- ✅ Card hover lift
- ✅ Button hover glow increase
- ✅ Section reveal on scroll
- ✅ Counter numbers on visibility
- ✅ Progress bars filling
- ✅ Platform cards stagger-in

### What SHOULD NOT Animate
- ❌ Navigation (unless hamburger open/close)
- ❌ Footer
- ❌ Text content that needs to be read immediately
- ❌ Error states (show instantly)
- ❌ Loading spinners beyond 3 seconds (show progress instead)

---

## 6. Layout Rules

### Bento Grid
- Features section: 3-column grid, cards can span 2 columns
- Gap: 20px
- Mobile: collapse to single column
- Cards NEVER span 3 columns (that's a banner, not a card)

### Max Widths
- Content: 1200px
- Text blocks: 600px (for readability)
- Hero headline: 800px

### Responsive Breakpoints
| Name | Width | Columns |
|------|-------|---------|
| Mobile | < 640px | 1 |
| Tablet | 640-1024px | 2 |
| Desktop | > 1024px | 3 |

---

## 7. Image & Media Rules

- **No placeholder images.** Every image slot must have a real image (stock, generated, SVG, or CSS art)
- Overlay treatment: always place images behind a semi-transparent glass layer
- Aspect ratios: 16:9 for feature images, 1:1 for avatars, 3:2 for cards
- Emoji usage: allowed in feature cards and badges, NOT in headings or CTAs
- Icons: use emoji for feature cards (keeps it friendly), custom SVG for navigation

---

## 8. Accessibility Rules

- **Contrast ratio:** 4.5:1 minimum for body text, 3:1 for large text (WCAG AA)
- All interactive elements must have visible focus indicators (indigo ring)
- All images must have alt text
- Color must NEVER be the sole indicator of state
- Touch targets: 44px minimum
- Glass blur: always test that text remains readable over blurred backgrounds
- Keyboard navigation: all interactive elements reachable via Tab
- Reduced motion: respect `prefers-reduced-motion` media query

---

## 9. Content Writing Rules

| Element | Max Length | Example |
|---------|-----------|---------|
| Hero headline | 8 words | "1 Video. 6 Platforms. 60 Seconds." |
| Section title | 12 words | "Not just another AI tool." |
| Card title | 5 words | "6 Platforms, 1 Upload" |
| Card description | 30 words | Keep it scannable |
| CTA button | 4 words | "Start Creating — Free" |
| Badge/chip | 2 words | "Most Popular" |

**Voice rules:**
- Use active voice ("Upload your video" not "Your video can be uploaded")
- Use numbers over words ("6" not "six") for impact
- Use periods for emphasis. "60 seconds. Done."
- Never use "leverage," "utilize," "facilitate," "synergize"
- Contractions are good ("we're" not "we are")

---

## 10. Brand Consistency Rules

- The indigo→cyan gradient is our signature. Use it in: logo, hero highlights, CTAs, social posts
- Dark backgrounds are NOT optional on the main product — no light mode for v1
- Glass effects must appear on EVERY page (at minimum, the navigation bar)
- Outfit font for headlines must be consistent across website, pitch deck, social posts
- The glow effect on primary buttons is NON-NEGOTIABLE — it's our visual signature
- Every screen should be identifiable as ContentAI even without the logo visible

---

## Quick Reference Card

```
Background:     #030712 (void) → rgba(255,255,255,0.04) (glass)
Text:           #F9FAFB (primary) → #9CA3AF (secondary) → #6B7280 (tertiary)
Brand:          #6366F1 (primary) → #818CF8 (light) → #22D3EE (accent)
Radius:         12px (buttons/inputs) → 16-20px (cards) → 50px (badges)
Padding:        24-32px (cards) → 12-14px (buttons) → 12-16px (inputs)
Animation:      200ms (micro) → 300ms (component) → 700ms (page)
Font:           Outfit (display) → Inter (body) → JetBrains Mono (code)
Grid:           8px base → 20px card gap → 120px section padding
```
