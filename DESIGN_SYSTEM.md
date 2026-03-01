# ✨ Design System — QALAA (formerly ContentAI)

> **Phase 5 Delivery**
> A comprehensive design system mapping the "Luminous Glass" aesthetic to tangible UI tokens and component structures.

---

## 5.1 Design Direction: "Luminous Glass"

**Design Thesis:** 
QALAA's design should feel like a command center for creators — transparent enough to build trust (you see how the AI thinks), structured enough to feel powerful (you're in control), and luminous enough to feel alive. We use deep void backgrounds overlaid with frosted glass panels, illuminated by brand-specific glows and neo-brutal CTA accents.

## 5.2 Design Tokens

### Colors (CSS Variables)

```css
/* Core Backgrounds */
--bg-void:       #030712; /* Base layer - never pure black */
--bg-deep:       #0A0E1A; /* Secondary deep layer */
--bg-glass:      rgba(255, 255, 255, 0.04); /* Default card surface */
--bg-glass-hover:rgba(255, 255, 255, 0.07); /* Hovered card surface */

/* Borders & Dividers */
--border-glass:   rgba(255, 255, 255, 0.06);
--border-hover:   rgba(255, 255, 255, 0.12);
--border-focus:   rgba(99, 102, 241, 0.5); /* Indigo focus ring */

/* Brand Colors */
--brand-400:  #818CF8;
--brand-500:  #6366F1; /* Primary CTA Action */
--brand-600:  #4F46E5;
--brand-glow: rgba(99, 102, 241, 0.2);

/* Accents & Status */
--accent-cyan: #22D3EE; /* Secondary data highlights */
--success:     #10B981;
--warning:     #F59E0B;
--error:       #EF4444;

/* Text */
--text-primary:   #F9FAFB; /* Headings */
--text-secondary: #9CA3AF; /* Body */
--text-tertiary:  #6B7280; /* Meta / Captions */
```

### Typography Hierarchy

```css
/* Fonts */
--font-display: 'Outfit', sans-serif; /* For Headlines ONLY */
--font-body:    'Inter', sans-serif;  /* For Body Text */
--font-mono:    'JetBrains Mono', monospace; /* Code/Stats */

/* Scale */
.text-hero { font-family: var(--font-display); font-size: clamp(2.5rem, 6vw, 4.5rem); font-weight: 900; letter-spacing: -0.02em; }
.text-h1   { font-family: var(--font-display); font-size: 2.25rem; font-weight: 800; letter-spacing: -0.01em; }
.text-h2   { font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; letter-spacing: -0.01em; }
.text-h3   { font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; }
.text-body { font-family: var(--font-body); font-size: 1rem; font-weight: 400; line-height: 1.6; }
.text-small{ font-family: var(--font-body); font-size: 0.875rem; font-weight: 500; }
```

### Spacing & Grid (8px Base)

* **xs**: 4px (Icon padding)
* **sm**: 8px (Between related elements)
* **md**: 16px (Component internal padding)
* **lg**: 24px (Card padding standard)
* **xl**: 32px (Card padding large / between sections)
* **2xl**: 48px (Major section gaps)
* **3xl**: 64px (Vertical section padding)
* **hero**: 120px (Landing page vertical rhythm)

---

## 5.3 Core Component Library

### 1. Glass Card (The Foundation)
The primary container for all UI elements.
* **Background:** `--bg-glass`
* **Backdrop Filter:** `blur(24px)`
* **Border:** 1px solid `--border-glass`
* **Radius:** `20px`
* **Padding:** `24px` or `32px`
* **Interaction:** On hover, transition `background` to `--bg-glass-hover` and `border-color` to `--border-hover`, while translating Y by `-2px`.

### 2. Primary Button (Neo-Brutal Glow)
The main call to action. Max one per screen.
* **Background:** Linear gradient (`#6366F1` to `#4F46E5`)
* **Text Color:** `#FFFFFF`
* **Font Weight:** 600 (Inter)
* **Border Radius:** `12px`
* **Glow:** `box-shadow: 0 0 20px rgba(99, 102, 241, 0.3)`
* **Interaction:** On hover, increase glow opacity to 0.5 and `transform: translateY(-1px)`.

### 3. Ghost Button
For secondary or cancel actions.
* **Background:** Transparent
* **Border:** 1px solid `--border-glass`
* **Text Color:** `--text-secondary`
* **Border Radius:** `12px`
* **Interaction:** On hover, change background to `--bg-glass` and text to `--text-primary`.

### 4. Input Fields
* **Background:** `rgba(255, 255, 255, 0.02)`
* **Border:** 1px solid `--border-glass`
* **Radius:** `12px`
* **Padding:** 12px 16px
* **Text:** `--text-primary`
* **Focus State:** Border changes to `--brand-500` with a 3px glow ring `box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2)`.

### 5. Badges/Tags
Used for Platform labels (YouTube, LinkedIn) or Status (Processing, Complete).
* **Background:** `--bg-glass` (or subtle status tint `.1` opacity)
* **Border:** 1px solid `--border-glass`
* **Radius:** `50px` (Pill shape)
* **Padding:** 4px 12px
* **Text Format:** `--text-small`, uppercase tracking.

---

## 5.4 Layout & Architecture

### Bento Grid Configuration
Used extensively for Dashboard and Feature showcases.
* **Grid Template Columns:** `repeat(3, 1fr)` (Desktop), `1fr` (Mobile).
* **Grid Gap:** `20px`.
* **Span Rules:** Cards can span 1 or 2 columns based on content density. No 3-column spans (that becomes a banner).

### Navigation Bar
* **Position:** Fixed top, `z-index: 50`.
* **Background:** `--bg-void` with 80% opacity and `blur(12px)`.
* **Border Bottom:** 1px solid `--border-glass`.

## 5.5 Animation Primitives

* **Micro-interactions (Hover/Focus):** `200ms ease`
* **Component Reveal (Scroll in):** `300ms ease-out` (Translate Y from 20px to 0, Opacity 0 to 1).
* **Background Shimmer:** Continuous `20s ease-in-out` infinite loop for aurora background spheres.
