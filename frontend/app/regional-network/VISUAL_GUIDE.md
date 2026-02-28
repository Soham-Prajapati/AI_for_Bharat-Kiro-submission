# Regional Network Visual Guide

## 🎨 Design System

### Color Palette

```
Primary Gradient: Purple (#A855F7) → Pink (#EC4899)
Background: Gray-900 (#111827) with gradient overlays
Accents:
  - North: Blue (#3B82F6)
  - South: Green (#10B981)
  - East: Yellow (#F59E0B)
  - West: Purple (#A855F7)
Text:
  - Primary: White (#FFFFFF)
  - Secondary: Gray-400 (#9CA3AF)
  - Tertiary: Gray-500 (#6B7280)
```

### Typography

```
Headings: Font-bold, gradient text
Body: Font-normal, white/gray
Labels: Font-semibold, uppercase
```

### Spacing

```
Container: max-w-7xl mx-auto px-4
Sections: py-8
Cards: p-6
Gaps: gap-4 (1rem) to gap-8 (2rem)
```

## 📱 Page Layout

```
┌─────────────────────────────────────────────────────────┐
│                        HEADER                            │
│  Regional Network                                        │
│  Connect with creators across India                      │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  [Explore Regions]  [Find Matches]                      │
└─────────────────────────────────────────────────────────┘
┌──────────────────────────┬──────────────────────────────┐
│                          │                              │
│    INTERACTIVE MAP       │    CREATORS LIST             │
│                          │                              │
│    ┌──────────────┐      │  ┌────────────────────────┐ │
│    │   🇮🇳 India   │      │  │  Creator Card 1        │ │
│    │              │      │  └────────────────────────┘ │
│    │  [N] [E]     │      │  ┌────────────────────────┐ │
│    │  [W] [S]     │      │  │  Creator Card 2        │ │
│    └──────────────┘      │  └────────────────────────┘ │
│                          │  ┌────────────────────────┐ │
│    Region Stats:         │  │  Creator Card 3        │ │
│    ┌────┐┌────┐┌────┐   │  └────────────────────────┘ │
│    │3.5K││ 42 ││120 │   │                              │
│    └────┘└────┘└────┘   │  [Load More...]              │
│                          │                              │
└──────────────────────────┴──────────────────────────────┘
```

## 🗺️ Interactive Map Component

### States

**Default State**
```
┌─────────────────────────┐
│                         │
│    Select Your Region   │
│                         │
│   ┌─────────────────┐   │
│   │                 │   │
│   │   [N]    [E]    │   │
│   │      🇮🇳        │   │
│   │   [W]    [S]    │   │
│   │                 │   │
│   └─────────────────┘   │
│                         │
└─────────────────────────┘
```

**Hover State**
```
┌─────────────────────────┐
│                         │
│   ┌─────────────────┐   │
│   │  [N] ← Glowing  │   │
│   │      🇮🇳        │   │
│   │   [W]    [S]    │   │
│   └─────────────────┘   │
│                         │
└─────────────────────────┘
```

**Selected State**
```
┌─────────────────────────┐
│                         │
│   ┌─────────────────┐   │
│   │ [N]← Selected   │   │
│   │  ✓  🇮🇳        │   │
│   │   [W]    [S]    │   │
│   └─────────────────┘   │
│                         │
│  Stats: 3.5K creators   │
└─────────────────────────┘
```

### Region Buttons

```
┌──────────────────────┐
│   North India        │
│   Delhi, Punjab...   │
└──────────────────────┘
  ↓ Hover
┌──────────────────────┐
│   North India    ●   │ ← Pulse indicator
│   Delhi, Punjab...   │
└──────────────────────┘
  ↓ Selected
┌══════════════════════┐
║   North India    ✓   ║ ← White border
║   Delhi, Punjab...   ║
└══════════════════════┘
```

## 👤 Creator Card Component

### Layout

```
┌─────────────────────────────────────────────────┐
│  ┌────┐  Creator Name              [50K]       │
│  │ C  │  Technology • North India              │
│  └────┘                                         │
│         Tech content creator from north India   │
│                                                 │
│         [Hindi] [English]                       │
│                                                 │
│         📺 🐦 📸 💼                              │
│                                                 │
│         [🤝 Request Collaboration]              │
└─────────────────────────────────────────────────┘
```

### With Match Info

```
┌─────────────────────────────────────────────────┐
│  ┌────┐  Creator Name              [50K]       │
│  │ C  │  Technology • North India              │
│  └────┘                                         │
│         Tech content creator...                 │
│                                                 │
│         Why this match:                         │
│         ✓ Same region - easier to collaborate   │
│         ✓ Shared language: Hindi                │
│         ✓ Highly compatible content niches      │
│                                                 │
│         [🤝 Request Collaboration]              │
└─────────────────────────────────────────────────┘
```

### States

**Default**
- Border: purple-500/20
- Background: gray-800/50

**Hover**
- Border: purple-500/40
- Shadow: purple-500/20
- Scale: 1.02

**Unavailable**
- Button: gray-700
- Text: gray-400
- Cursor: not-allowed

## 💬 Collaboration Request Modal

### Layout

```
┌─────────────────────────────────────────────────────┐
│  Collaboration Request                          [X] │
│  Send a collaboration request to Creator Name       │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌────┐ Creator Name                               │
│  │ C  │ Technology • 50K followers                 │
│  └────┘ Tech content creator...                    │
│                                                     │
│  Collaboration Type:                                │
│  ┌──────────────┐ ┌──────────────┐                │
│  │ 🎥 Joint     │ │ 📺 Series    │                │
│  │    Video     │ │              │                │
│  └──────────────┘ └──────────────┘                │
│  ┌──────────────┐ ┌──────────────┐                │
│  │ 📢 Cross-    │ │ 🎯 Challenge │                │
│  │    Promotion │ │              │                │
│  └──────────────┘ └──────────────┘                │
│                                                     │
│  Your Message:                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │ Hi! I love your content...                  │   │
│  │                                             │   │
│  │                                             │   │
│  └─────────────────────────────────────────────┘   │
│  250 / 500 characters                               │
│                                                     │
│  Quick Templates:                                   │
│  ┌─────────────────────────────────────────────┐   │
│  │ Hi! I love your content on [topic]...       │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  💡 Tips for a great request:                      │
│     • Be specific about your idea                   │
│     • Mention what value you bring                  │
│                                                     │
├─────────────────────────────────────────────────────┤
│              [Cancel]  [🚀 Send Request]           │
└─────────────────────────────────────────────────────┘
```

### Animations

**Modal Entry**
```
Backdrop: Fade in (0.2s)
Modal: Slide up + fade in (0.3s)
```

**Button States**
```
Default → Hover → Active
  ↓        ↓        ↓
Scale:   1.0     1.05     0.95
Shadow:  30%     50%      20%
```

## 🎯 Match Score Display

```
┌─────────────────────────────────────┐
│  ┌──────┐                           │
│  │  78% │  [Match]                  │
│  └──────┘                           │
│                                     │
│  Creator Card...                    │
│                                     │
│  ─────────────────────────────────  │
│  Suggested Collaboration:           │
│  Joint video or series              │
│  Potential Reach: 150,000           │
└─────────────────────────────────────┘
```

### Score Colors

```
90-100%: Gradient green (#10B981 → #059669)
75-89%:  Gradient purple (#A855F7 → #9333EA)
60-74%:  Gradient blue (#3B82F6 → #2563EB)
<60%:    Gradient gray (#6B7280 → #4B5563)
```

## 📊 Statistics Cards

```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   3,500      │ │      42      │ │     120      │
│   Creators   │ │ Active Today │ │   Collabs    │
└──────────────┘ └──────────────┘ └──────────────┘
   Purple/10       Pink/10          Blue/10
```

## 🎭 Loading States

### Spinner
```
    ┌─────┐
    │  ○  │  ← Rotating
    └─────┘
```

### Skeleton Cards
```
┌─────────────────────────────────────┐
│  ┌────┐  ▓▓▓▓▓▓▓▓▓▓▓▓              │
│  │▓▓▓▓│  ▓▓▓▓▓▓▓▓▓▓▓▓              │
│  └────┘                             │
│         ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │
│                                     │
│         ▓▓▓▓ ▓▓▓▓                   │
└─────────────────────────────────────┘
```

## 🎨 Gradient Examples

### Primary Gradient
```css
background: linear-gradient(to right, #A855F7, #EC4899);
```

### Background Gradient
```css
background: linear-gradient(
  to bottom right,
  #111827,
  #581C87,
  #111827
);
```

### Card Gradient
```css
background: linear-gradient(
  to bottom right,
  rgba(168, 85, 247, 0.1),
  rgba(236, 72, 153, 0.1)
);
```

## 🌊 Animation Examples

### Float Animation
```css
@keyframes float {
  0%, 100% {
    transform: translateY(0);
    opacity: 0;
  }
  50% {
    transform: translateY(-20px);
    opacity: 0.5;
  }
}
```

### Pulse Animation
```css
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
```

### Slide Up Animation
```css
@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

## 📱 Responsive Breakpoints

### Mobile (< 768px)
```
┌─────────────────┐
│     HEADER      │
├─────────────────┤
│     TABS        │
├─────────────────┤
│                 │
│      MAP        │
│                 │
├─────────────────┤
│   Creator 1     │
├─────────────────┤
│   Creator 2     │
├─────────────────┤
│   Creator 3     │
└─────────────────┘
```

### Tablet (768px - 1024px)
```
┌─────────────────────────────┐
│          HEADER             │
├─────────────────────────────┤
│          TABS               │
├──────────────┬──────────────┤
│              │              │
│     MAP      │   Creators   │
│              │              │
└──────────────┴──────────────┘
```

### Desktop (> 1024px)
```
┌───────────────────────────────────────┐
│              HEADER                   │
├───────────────────────────────────────┤
│              TABS                     │
├──────────────────┬────────────────────┤
│                  │                    │
│       MAP        │     Creators       │
│                  │                    │
│   Region Stats   │   (Scrollable)     │
│                  │                    │
└──────────────────┴────────────────────┘
```

## 🎯 Interactive Elements

### Hover Effects
- Scale: 1.02 - 1.05
- Shadow: Increase opacity
- Border: Brighten color
- Cursor: pointer

### Click Effects
- Scale: 0.95 - 0.98
- Shadow: Decrease opacity
- Haptic feedback (mobile)

### Focus States
- Ring: 2px purple-500
- Outline: none
- Border: purple-500

## 🌈 Theme Variations

### Light Mode (Future)
```
Background: White (#FFFFFF)
Text: Gray-900 (#111827)
Cards: Gray-50 (#F9FAFB)
Borders: Gray-200 (#E5E7EB)
```

### High Contrast Mode
```
Background: Black (#000000)
Text: White (#FFFFFF)
Borders: White (#FFFFFF)
Shadows: None
```

---

**Design System Version**: 1.0.0
**Last Updated**: 2024
**Figma**: [Link to design files]
