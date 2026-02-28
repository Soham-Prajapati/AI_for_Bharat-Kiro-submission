# Community UI Visual Guide

Visual reference for the Community UI components design system.

## Color Palette

### Dark Mode Theme
```
Background Gradients:
- Primary: from-gray-900 to-gray-800
- Accent: from-purple-600 to-pink-600
- Alternative: from-purple-600 via-pink-600 to-blue-600

Text Colors:
- Primary: text-white
- Secondary: text-gray-400
- Tertiary: text-gray-500

Border Colors:
- Default: border-gray-700/50
- Hover: border-purple-500/30
- Active: border-purple-500

Interactive States:
- Hover: hover:bg-gray-700/50
- Active: bg-purple-500/20
- Focus: ring-2 ring-purple-500/50
```

## Component Layouts

### Feed Component
```
┌─────────────────────────────────────────┐
│  [Recent] [Popular] [Following]         │  ← Filter Tabs
├─────────────────────────────────────────┤
│  ┌───┐                                  │
│  │ 👤│  What's on your mind?            │  ← Create Post
│  └───┘  [📷]              [Post Button] │
├─────────────────────────────────────────┤
│  ┌───┐  Alex Chen ✓ · 1h ago          │
│  │ 👤│  Post content here...            │  ← Post Card
│  └───┘  [Image Gallery]                 │
│         ❤️ 234  💬 45  🔗              │
├─────────────────────────────────────────┤
│  ┌───┐  Maria Garcia · 2h ago         │
│  │ 👤│  Another post...                 │  ← Post Card
│  └───┘  ❤️ 567  💬 89  🔗              │
├─────────────────────────────────────────┤
│         [Loading Spinner]                │
└─────────────────────────────────────────┘
```

### ProfileCard Component
```
┌─────────────────────────────────┐
│  ╔═══════════════════════════╗  │  ← Gradient Header
│  ║                           ║  │
│  ╚═══════════════════════════╝  │
│     ┌─────┐                     │
│     │ 👤  │ ✓                   │  ← Avatar + Badge
│     └─────┘                     │
│                                 │
│  Sarah Johnson                  │  ← Name
│  @sarahj                        │  ← Username
│  Content creator & strategist   │  ← Bio
│                                 │
│  12.5K          842             │  ← Stats
│  Followers      Following       │
│  ─────────────────────────────  │
│  [Follow Button]                │  ← Action
│  ─────────────────────────────  │
│  RECENT POSTS                   │
│  • Post preview 1...            │  ← Recent Posts
│    ❤️ 234  💬 45               │
│  • Post preview 2...            │
│    ❤️ 567  💬 89               │
└─────────────────────────────────┘
```

### PostCard Component
```
┌─────────────────────────────────────────┐
│  ┌───┐  Alex Chen ✓                    │  ← Header
│  │ 👤│  @alexchen · 1h ago              │
│  └───┘                                  │
│                                         │
│  Just launched our new platform! 🚀    │  ← Content
│  The AI-powered insights are...        │
│  [Show more]                            │
│                                         │
│  ┌─────────────┬─────────────┐        │  ← Images
│  │   Image 1   │   Image 2   │        │
│  └─────────────┴─────────────┘        │
│  ─────────────────────────────────────  │
│  ❤️ 234    💬 45           🔗         │  ← Actions
└─────────────────────────────────────────┘
```

### GroupList Component
```
┌─────────────────────────────────────────┐
│  Groups                [+ Create Group]  │  ← Header
│  Discover and join communities          │
├─────────────┬─────────────┬─────────────┤
│ ┌─────────┐ │ ┌─────────┐ │ ┌─────────┐ │
│ │ Cover   │ │ │ Cover   │ │ │ Cover   │ │  ← Group Cards
│ │ Image   │ │ │ Image   │ │ │ Image   │ │
│ └─────────┘ │ └─────────┘ │ └─────────┘ │
│             │             │             │
│ Content Hub │ AI Marketing│ Video Pro   │  ← Group Info
│ Community   │ Strategies  │ Creators    │
│ for...      │ Exploring...│ Professional│
│             │             │             │
│ 👥 15.4K    │ 👥 8.9K     │ 👥 12.3K    │  ← Stats
│ 📝 3.2K     │ 📝 1.5K     │ 📝 2.8K     │
│             │             │             │
│ [✓ Joined]  │ [Join]      │ [✓ Joined]  │  ← Actions
└─────────────┴─────────────┴─────────────┘
```

## Responsive Breakpoints

### Mobile (< 640px)
- Single column layout
- Full-width components
- Stacked navigation
- Touch-friendly buttons (min 44px)

### Tablet (640px - 1024px)
- 2-column grid for groups
- Sidebar below main content
- Optimized spacing

### Desktop (> 1024px)
- 3-column layout (2 for feed, 1 for sidebar)
- 3-column grid for groups
- Maximum content width: 1280px

## Animation Specifications

### Transitions
```css
/* Standard transition */
transition-all duration-200

/* Smooth transition */
transition-all duration-300

/* Button hover */
transform hover:scale-105
transition-all duration-200

/* Loading spinner */
animate-spin (1s linear infinite)
```

### Hover Effects
```
Cards:
- Border: gray-700/50 → purple-500/30
- Scale: 1 → 1.02 (subtle)

Buttons:
- Scale: 1 → 1.05
- Gradient shift: darker shades

Images:
- Scale: 1 → 1.1 (within container)
- Transition: 300ms
```

## Spacing System

```
Component Padding:
- Cards: p-6 (24px)
- Buttons: px-6 py-2.5 (24px, 10px)
- Sections: py-8 (32px)

Gaps:
- Grid: gap-6 (24px)
- Flex: gap-4 (16px)
- Small: gap-2 (8px)

Margins:
- Section: mb-8 (32px)
- Card: mb-6 (24px)
- Element: mb-4 (16px)
```

## Typography

```
Headings:
- H1: text-4xl font-bold (36px)
- H2: text-2xl font-bold (24px)
- H3: text-xl font-bold (20px)
- H4: text-lg font-semibold (18px)

Body:
- Primary: text-base (16px)
- Secondary: text-sm (14px)
- Small: text-xs (12px)

Weights:
- Bold: font-bold (700)
- Semibold: font-semibold (600)
- Medium: font-medium (500)
- Regular: font-normal (400)
```

## Icon Sizes

```
Standard Icons:
- Small: w-4 h-4 (16px)
- Medium: w-5 h-5 (20px)
- Large: w-6 h-6 (24px)

Avatar Sizes:
- Small: w-8 h-8 (32px)
- Medium: w-12 h-12 (48px)
- Large: w-24 h-24 (96px)
```

## Border Radius

```
- Small: rounded-lg (8px)
- Medium: rounded-xl (12px)
- Large: rounded-2xl (16px)
- Circle: rounded-full (9999px)
```

## Shadow System

```
Cards:
- Default: shadow-xl
- Hover: shadow-2xl

Buttons:
- Active: shadow-lg

Rings:
- Focus: ring-2 ring-purple-500/50
- Avatar: ring-2 ring-purple-500/30
- Active: ring-4 ring-gray-900
```

## Interactive States

### Buttons
```
Default State:
- bg-gradient-to-r from-purple-600 to-pink-600
- text-white font-medium

Hover State:
- from-purple-700 to-pink-700
- transform scale-105

Disabled State:
- from-gray-600 to-gray-700
- cursor-not-allowed
- opacity-50

Active State:
- Pressed effect (scale-95)
```

### Input Fields
```
Default:
- bg-gray-800/50
- border-transparent

Focus:
- ring-2 ring-purple-500/50
- border-purple-500

Error:
- ring-2 ring-red-500/50
- border-red-500
```

## Loading States

### Spinner
```
Dual-ring spinner:
- Outer ring: border-gray-700 border-t-purple-500
- Inner ring: border-t-pink-500 (reverse rotation)
- Size: w-12 h-12
- Animation: spin (1s)
```

### Skeleton Screens
```
<div className="animate-pulse">
  <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
  <div className="h-4 bg-gray-700 rounded w-1/2"></div>
</div>
```

## Accessibility Features

### Focus Indicators
```
- Visible focus rings: ring-2 ring-purple-500
- High contrast: text-white on dark backgrounds
- Minimum touch target: 44x44px
```

### ARIA Labels
```
- Icon buttons: aria-label="Like post"
- Images: alt="Descriptive text"
- Loading states: aria-busy="true"
- Expandable content: aria-expanded="true/false"
```

### Keyboard Navigation
```
- Tab order: logical flow
- Enter/Space: activate buttons
- Escape: close modals
- Arrow keys: navigate lists
```

## Image Handling

### Gallery Layouts
```
1 image:  grid-cols-1 (full width)
2 images: grid-cols-2 (equal split)
3 images: grid-cols-3 (first spans 2 cols)
4+ images: grid-cols-2 (2x2 with +N overlay)
```

### Image Optimization
```
- Lazy loading: loading="lazy"
- Object fit: object-cover
- Aspect ratio: aspect-video or aspect-square
- Max height: h-64 (256px)
```

## Empty States

### Design Pattern
```
┌─────────────────────────────┐
│                             │
│         [Icon]              │  ← Large gray icon
│                             │
│    No posts yet             │  ← Heading
│  Be the first to share!     │  ← Description
│                             │
│    [Action Button]          │  ← CTA
│                             │
└─────────────────────────────┘
```

## Best Practices

### Performance
- Use `loading="lazy"` for images
- Implement virtual scrolling for 100+ items
- Memoize components with React.memo
- Debounce scroll events

### Accessibility
- Maintain 4.5:1 contrast ratio
- Provide alt text for all images
- Use semantic HTML elements
- Test with screen readers

### Responsive Design
- Mobile-first approach
- Touch-friendly targets (44px min)
- Readable font sizes (16px min)
- Adequate spacing on small screens

### Dark Mode
- Use opacity for subtle effects
- Gradient overlays for depth
- Consistent color temperature
- Test in various lighting conditions
