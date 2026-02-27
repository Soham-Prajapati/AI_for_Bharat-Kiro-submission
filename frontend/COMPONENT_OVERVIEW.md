# Component Overview

## Visual Structure

```
┌─────────────────────────────────────────────────────────────┐
│                         HERO SECTION                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  🚀 AI-Powered Content Intelligence                   │  │
│  │                                                        │  │
│  │         Transform Content In 60 Seconds               │  │
│  │                                                        │  │
│  │  Stop spending 80% of your time repurposing content   │  │
│  │                                                        │  │
│  │  [Start Free Trial]  [Watch Demo]                     │  │
│  │                                                        │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │  │
│  │  │ 4.5hrs   │  │    6     │  │ 10,000+  │           │  │
│  │  │ Saved    │  │Platforms │  │ Content  │           │  │
│  │  └──────────┘  └──────────┘  └──────────┘           │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      FEATURES SECTION                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ 🎯 Platform │  │ 🌐 9 Indian │  │ ⚡ 60-Second│        │
│  │ Optimization│  │  Languages  │  │ Generation  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ 🎨 Smart    │  │ 📊 Analytics│  │ 🤖 AI       │        │
│  │ Formatting  │  │  Dashboard  │  │  Learning   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                              │
│  Supported: [YouTube] [Instagram] [LinkedIn] [Twitter]      │
│             [Facebook] [TikTok]                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      PRICING SECTION                         │
│  ┌──────────┐  ┌──────────────┐  ┌──────────┐             │
│  │   FREE   │  │ PRO ⭐       │  │ENTERPRISE│             │
│  │   ₹0     │  │ ₹999/month   │  │  Custom  │             │
│  │          │  │              │  │          │             │
│  │ • 5/mo   │  │ • Unlimited  │  │ • All Pro│             │
│  │ • 2 plat │  │ • 6 platforms│  │ • Teams  │             │
│  │ • Basic  │  │ • Analytics  │  │ • White  │             │
│  │          │  │ • 9 langs    │  │   label  │             │
│  │[Start]   │  │[Start Trial] │  │[Contact] │             │
│  └──────────┘  └──────────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                         FOOTER                               │
│  Content Intelligence                                        │
│  Transform content across 6 platforms in 60 seconds          │
│  [𝕏] [in] [▶] [📷]                                          │
│                                                              │
│  Product    Company    Resources    Legal                   │
│  Features   About      Docs         Privacy                 │
│  Pricing    Blog       Help         Terms                   │
│  API        Careers    Community    Security                │
│                                                              │
│  © 2024 Content Intelligence Platform                       │
└─────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Hero Component (`components/Hero.tsx`)

**Purpose**: First impression, value proposition, and key metrics

**Features**:
- Animated gradient background with floating orbs
- Real-time counting animations for stats
- Two CTA buttons with hover effects
- Fully responsive layout

**Key Stats**:
- 4.5 hours saved per video
- 6 platforms supported
- 10,000+ content pieces generated

**Animations**:
- Background orbs: 8-10s loop with scale/position changes
- Stats: Count-up animation on mount
- Buttons: Scale on hover/tap
- Text: Fade-in and slide-up on load

---

### 2. FeatureGrid Component (`components/FeatureGrid.tsx`)

**Purpose**: Showcase platform capabilities and features

**Features**:
- 6 feature cards in responsive grid
- Hover effects with gradient overlays
- Platform badges section
- Scroll-triggered animations

**Feature Cards**:
1. 🎯 Platform Optimization - Multi-platform content adaptation
2. 🌐 9 Indian Languages - Hindi, Tamil, Telugu, Bengali, etc.
3. ⚡ 60-Second Generation - 80% time savings
4. 🎨 Smart Formatting - Auto hashtags, captions, thumbnails
5. 📊 Analytics Dashboard - Unified performance tracking
6. 🤖 AI Learning - Adaptive content improvement

**Animations**:
- Cards: Staggered fade-in (0.1s delay each)
- Hover: Lift effect (-5px) + gradient overlay
- Platform badges: Scale on hover

---

### 3. PricingCards Component (`components/PricingCards.tsx`)

**Purpose**: Display pricing tiers and drive conversions

**Tiers**:

**Free Tier**:
- Price: ₹0/forever
- 5 content generations/month
- 2 platforms
- Basic analytics
- Community support
- 1 language

**Pro Tier** (Most Popular):
- Price: ₹999/month
- Unlimited generations
- All 6 platforms
- Advanced analytics
- Priority support
- All 9 languages
- Custom branding
- API access

**Enterprise Tier**:
- Price: Custom
- Everything in Pro
- Unlimited team members
- White-label solution
- Dedicated account manager
- Custom integrations
- SLA guarantee
- Training & onboarding

**Animations**:
- Cards: Staggered fade-in
- Pro card: Scaled up (105%) with glow
- Buttons: Scale on hover/tap
- Popular badge: Positioned above card

---

### 4. Footer Component (`components/Footer.tsx`)

**Purpose**: Navigation, legal links, and brand information

**Sections**:
- **Brand**: Logo, tagline, social links
- **Product**: Features, Pricing, API, Integrations
- **Company**: About, Blog, Careers, Contact
- **Resources**: Docs, Help, Community, Status
- **Legal**: Privacy, Terms, Security, Cookies

**Social Links**:
- Twitter (𝕏)
- LinkedIn (in)
- YouTube (▶)
- Instagram (📷)

**Animations**:
- Sections: Staggered fade-in
- Social icons: Scale on hover
- Links: Color transition on hover

---

## Responsive Breakpoints

```
Mobile:    < 640px  (sm)
Tablet:    640-768px (md)
Desktop:   768-1024px (lg)
Wide:      > 1024px
```

## Color Scheme

**Primary Gradients**:
- Purple to Pink: `from-purple-600 to-pink-600`
- Blue to Cyan: `from-blue-600 to-cyan-600`
- Purple to Blue: `from-purple-400 to-blue-400`

**Background**:
- Base: `bg-gray-900`
- Cards: `bg-gray-800/50` with backdrop-blur
- Borders: `border-gray-700`

**Text**:
- Primary: `text-white`
- Secondary: `text-gray-300`
- Muted: `text-gray-400`

## Animation Patterns

**Entry Animations**:
```typescript
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.6 }}
```

**Hover Effects**:
```typescript
whileHover={{ scale: 1.05, y: -5 }}
```

**Scroll Triggers**:
```typescript
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true }}
```

## Performance Optimizations

1. **Lazy Loading**: Components load on scroll
2. **Once Animations**: Animations trigger once per scroll
3. **Backdrop Blur**: GPU-accelerated effects
4. **Optimized Images**: Next.js Image component ready
5. **Code Splitting**: Automatic with Next.js 14

## Accessibility

- Semantic HTML elements
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus states on all interactive elements
- Color contrast ratios meet WCAG AA standards

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari, Chrome Android
