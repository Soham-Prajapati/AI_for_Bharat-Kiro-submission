# ModeSelector Component

A beautiful, interactive component for selecting creator modes in the Content Intelligence Platform.

## Features

✨ **Three Creator Modes:**
- 🤖 **AI-First**: Full automation for speed and scale
- 🤝 **Hybrid**: AI-assisted workflow (Recommended for 80% of creators)
- 👤 **Human-First**: Minimal AI with full creative control

🎨 **Design Features:**
- Dark mode with purple/pink gradient accents
- Smooth framer-motion animations
- Glowing border effect on selected mode
- Hover animations and transitions
- Responsive grid layout (1 col mobile, 3 cols desktop)
- Recommended badge on Hybrid mode
- Time saved indicators for each mode

♿ **Accessibility:**
- Keyboard navigation support
- ARIA labels and pressed states
- Large touch targets (48px minimum)
- High contrast text

## Usage

```tsx
import ModeSelector from '@/components/ModeSelector'
import { useState } from 'react'

function MyComponent() {
  const [mode, setMode] = useState<'ai-first' | 'hybrid' | 'human-first'>()

  return (
    <ModeSelector 
      selectedMode={mode}
      onModeSelect={(newMode) => setMode(newMode)}
    />
  )
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `selectedMode` | `'ai-first' \| 'hybrid' \| 'human-first'` | No | Currently selected mode |
| `onModeSelect` | `(mode: CreatorMode) => void` | Yes | Callback when mode is selected |

## Mode Details

### AI-First (Full Automation) 🤖
- **For:** Speed and scale
- **Time Saved:** 95%
- **Features:**
  - AI generates scripts & voiceovers
  - Automatic B-roll selection
  - AI-created thumbnails
  - Platform-optimized content
  - Instant multi-platform export
- **Use Case:** Daily content creators, agencies

### Hybrid (AI-Assisted) 🤝 [RECOMMENDED]
- **For:** Creators who shoot their own content
- **Time Saved:** 80%
- **Features:**
  - Upload your own content
  - AI transcription & captions
  - Multi-language translation
  - SEO optimization
  - Smart content repurposing
- **Use Case:** YouTubers, vloggers, educators (80% of creators)

### Human-First (Minimal AI) 👤
- **For:** Full creative control
- **Time Saved:** 40%
- **Features:**
  - Complete creative control
  - AI translation only
  - SEO suggestions
  - Analytics insights
  - Manual approval workflow
- **Use Case:** Premium creators, brand partnerships

## Styling

The component uses Tailwind CSS classes and matches the existing design system:
- Background: `bg-gray-800` with gradient overlays
- Borders: `border-gray-700` with purple glow on selection
- Text: White headings, gray-400 descriptions
- Gradients: Purple-to-pink, blue-to-cyan, etc.

## Animation Details

- **Card entrance:** Staggered fade-in with upward motion
- **Hover effect:** Card lifts up (-8px) with gradient overlay
- **Selected state:** Pulsing glow effect, scale animation
- **Button interactions:** Scale on hover/tap
- **Icon animation:** Slight rotation and scale on hover

## Example: Onboarding Flow

See `frontend/app/onboarding/page.tsx` for a complete example of using ModeSelector in an onboarding flow.

## Dependencies

- `framer-motion`: For smooth animations
- `react`: Core React hooks (useState)
- Tailwind CSS: For styling

## Notes

- Users can change their mode anytime in settings
- The Hybrid mode is recommended for most creators (80%)
- Each mode has different features and pricing tiers
- Mode selection should be persisted to backend/localStorage
