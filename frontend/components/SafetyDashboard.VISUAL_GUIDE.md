# SafetyDashboard Visual Guide

## Component Overview

The SafetyDashboard is a comprehensive content moderation interface with 8 main sections:

```
┌─────────────────────────────────────────────────────────────┐
│                     SAFETY DASHBOARD                         │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  1. TRAFFIC LIGHT SYSTEM                           │    │
│  │     ┌──────┐                                       │    │
│  │     │  🔴  │  Red: Critical (0-49)                 │    │
│  │     │  🟡  │  Yellow: Warning (50-79)              │    │
│  │     │  🟢  │  Green: Safe (80-100)                 │    │
│  │     └──────┘                                       │    │
│  │     Score: 65                                      │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  2. REAL-TIME SAFETY METRICS                       │    │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐             │    │
│  │  │ 65   │ │  3   │ │  2   │ │ 1/3  │             │    │
│  │  │Score │ │Viols │ │Warns │ │Compl │             │    │
│  │  └──────┘ └──────┘ └──────┘ └──────┘             │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  3. VIOLATION ALERTS                               │    │
│  │  ┌──────────────────────────────────────────┐     │    │
│  │  │ 🔞 Explicit Content        [HIGH]        │     │    │
│  │  │ Potentially explicit content detected    │     │    │
│  │  │ Confidence: 85% | Affects: YT, IG, TT   │     │    │
│  │  └──────────────────────────────────────────┘     │    │
│  │  ┌──────────────────────────────────────────┐     │    │
│  │  │ 📧 Spam                    [MEDIUM]      │     │    │
│  │  │ Overly promotional content               │     │    │
│  │  │ Confidence: 72% | Affects: TW, LI       │     │    │
│  │  └──────────────────────────────────────────┘     │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  4. PLATFORM COMPLIANCE CHECKER                    │    │
│  │  ┌────────┐ ┌────────┐ ┌────────┐                │    │
│  │  │YouTube │ │Instagram│ │TikTok  │                │    │
│  │  │   ❌   │ │   ❌    │ │   ✅   │                │    │
│  │  └────────┘ └────────┘ └────────┘                │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  5. MODERATION LABELS                              │    │
│  │  [Explicit Content 85%] [Spam 72%]                │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  6. SUGGESTIONS                                    │    │
│  │  • Remove or blur explicit content                │    │
│  │  • Reduce promotional language                    │    │
│  │  • Add credible sources                           │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  7. VIOLATION HISTORY TIMELINE                     │    │
│  │  │                                                 │    │
│  │  ●─── 🔞 Explicit (3h ago)                        │    │
│  │  │                                                 │    │
│  │  ●─── 📧 Spam (2h ago)                            │    │
│  │  │                                                 │    │
│  │  ●─── ❌ Misinformation (1h ago)                  │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  8. QUICK ACTION BUTTONS                           │    │
│  │  [✅ Approve] [❌ Reject] [🚩 Flag] [🔄 Re-check] │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## 1. Traffic Light System

### Visual Design

```
     ┌──────────┐
     │          │
     │    🔴    │  ← Red Light (Critical: 0-49)
     │          │
     ├──────────┤
     │          │
     │    🟡    │  ← Yellow Light (Warning: 50-79)
     │          │
     ├──────────┤
     │          │
     │    🟢    │  ← Green Light (Safe: 80-100)
     │          │
     └──────────┘
        Score
          65
```

### States

| Score Range | Light | Color | Status | Action Required |
|-------------|-------|-------|--------|-----------------|
| 80-100 | 🟢 Green | #10b981 | Safe | None - Ready to publish |
| 50-79 | 🟡 Yellow | #f59e0b | Warning | Review recommended |
| 0-49 | 🔴 Red | #ef4444 | Critical | Must fix before publishing |

### Animation

- Active light glows with box-shadow
- Smooth color transitions (0.3s ease)
- Pulsing effect on active light

## 2. Real-time Safety Metrics

### Layout

```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│   Overall   │ Violations  │  Warnings   │  Platform   │
│    Score    │             │             │ Compliance  │
├─────────────┼─────────────┼─────────────┼─────────────┤
│             │             │             │             │
│     65      │      3      │      2      │     1/3     │
│             │             │             │             │
│ ▓▓▓▓▓▓▓░░░  │  1 critical │  Requires   │  Platforms  │
│             │  2 high     │  attention  │  approved   │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

### Color Coding

- **Overall Score**: Blue gradient (#3b82f6 → #1e40af)
- **Violations**: Red gradient (#ef4444 → #991b1b)
- **Warnings**: Yellow gradient (#f59e0b → #b45309)
- **Compliance**: Green gradient (#10b981 → #047857)

## 3. Violation Alerts

### Card Structure

```
┌────────────────────────────────────────────────────────┐
│ 🔞  Explicit Content                    [HIGH]    3h ago│
├────────────────────────────────────────────────────────┤
│ Potentially explicit or adult content detected         │
│                                                         │
│ Confidence: 85%  |  Affects: youtube, instagram, tiktok│
└────────────────────────────────────────────────────────┘
```

### Severity Colors

| Severity | Background | Border | Text |
|----------|-----------|--------|------|
| Critical | #fef2f2 | #fecaca | #dc2626 |
| High | #fff7ed | #fed7aa | #ea580c |
| Medium | #fefce8 | #fef08a | #ca8a04 |
| Low | #eff6ff | #bfdbfe | #2563eb |

### Category Icons

| Category | Icon | Description |
|----------|------|-------------|
| explicit | 🔞 | Adult/explicit content |
| violence | ⚠️ | Violent content |
| hate_speech | 🚫 | Hate speech |
| harassment | 😡 | Harassment |
| spam | 📧 | Spam/promotional |
| misinformation | ❌ | False information |
| copyright | ©️ | Copyright violation |
| privacy | 🔒 | Privacy violation |
| dangerous | ☢️ | Dangerous content |

## 4. Platform Compliance Checker

### Grid Layout

```
┌──────────┬──────────┬──────────┐
│ YouTube  │Instagram │  TikTok  │
│    ❌    │    ❌    │    ✅    │
├──────────┼──────────┼──────────┤
│ Twitter  │ LinkedIn │ Facebook │
│    ❌    │    ✅    │    ✅    │
└──────────┴──────────┴──────────┘
```

### Compliance Card

```
┌─────────────────────────┐
│ YouTube            ❌   │
├─────────────────────────┤
│ Violations:             │
│ • Explicit content      │
│                         │
│ Warnings:               │
│ • May require age gate  │
└─────────────────────────┘
```

### States

- **Compliant**: Green background (#f0fdf4), checkmark (✅)
- **Non-compliant**: Red background (#fef2f2), cross (❌)

## 5. Moderation Labels

### Tag Design

```
┌──────────────────────┐  ┌──────────────────┐
│ Explicit Content 85% │  │    Spam 72%      │
└──────────────────────┘  └──────────────────┘
```

### Styling

- Gradient background: Purple to Pink (#f3e8ff → #fce7f3)
- Border: Purple (#e9d5ff)
- Text: Purple (#581c87)
- Rounded full (pill shape)
- Confidence percentage displayed

## 6. Suggestions Panel

### Layout

```
┌─────────────────────────────────────────┐
│ 💡 Suggestions                          │
├─────────────────────────────────────────┤
│ • Remove or blur explicit content       │
│ • Reduce promotional language           │
│ • Add credible sources to support claims│
│ • Consider alternative ways to convey   │
│ • Review content for unintentional bias │
└─────────────────────────────────────────┘
```

### Styling

- Gradient background: Blue to Indigo (#eff6ff → #eef2ff)
- Border: Blue (#bfdbfe)
- Bullet points in blue (#2563eb)
- Animated entrance (stagger effect)

## 7. Violation History Timeline

### Timeline Structure

```
     │
     ●─────┐
     │     │ 🔞 Explicit Content (HIGH)
     │     │ Detected 3 hours ago
     │     │ At timestamp: 15s
     │     └─────────────────────────
     │
     ●─────┐
     │     │ 📧 Spam (MEDIUM)
     │     │ Detected 2 hours ago
     │     │ Position: 120-145
     │     └─────────────────────────
     │
     ●─────┐
     │     │ ❌ Misinformation (LOW)
     │     │ Detected 1 hour ago
     │     └─────────────────────────
     │
```

### Timeline Dot Colors

- **Critical**: Red (#ef4444)
- **High**: Orange (#f97316)
- **Medium**: Yellow (#eab308)
- **Low**: Blue (#3b82f6)

## 8. Quick Action Buttons

### Button Layout

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ ✅ Approve   │ ❌ Reject    │ 🚩 Flag      │ 🔄 Re-check  │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

### Button States

| Button | Color | Hover | Disabled |
|--------|-------|-------|----------|
| Approve | Green (#10b981) | Darker green | Gray (#d1d5db) |
| Reject | Red (#ef4444) | Darker red | - |
| Flag | Yellow (#eab308) | Darker yellow | - |
| Re-check | Blue (#3b82f6) | Darker blue | - |

### Interactions

- **Hover**: Scale 1.05, shadow increase
- **Click**: Scale 0.95
- **Disabled**: Opacity 0.5, cursor not-allowed

## Modal Designs

### Flag Modal

```
┌─────────────────────────────────────┐
│ 🚩 Flag Content                     │
├─────────────────────────────────────┤
│ Please provide a reason for         │
│ flagging this content for manual    │
│ review.                             │
│                                     │
│ ┌─────────────────────────────────┐│
│ │ Describe the issue...           ││
│ │                                 ││
│ │                                 ││
│ └─────────────────────────────────┘│
│                                     │
│ [Submit Flag]  [Cancel]             │
└─────────────────────────────────────┘
```

### Violation Detail Modal

```
┌─────────────────────────────────────────┐
│ 🔞 Explicit Content          [HIGH]  ×  │
├─────────────────────────────────────────┤
│ Description:                            │
│ Potentially explicit or adult content   │
│ detected in the video                   │
│                                         │
│ Confidence:                             │
│ ▓▓▓▓▓▓▓▓░░ 85%                         │
│                                         │
│ Affected Platforms:                     │
│ [youtube] [instagram] [tiktok]          │
│                                         │
│ Location:                               │
│ Timestamp: 15s                          │
│                                         │
│ Detected:                               │
│ 3 hours ago                             │
└─────────────────────────────────────────┘
```

## Responsive Design

### Desktop (1024px+)

- Full 3-column grid for platform compliance
- Side-by-side metrics cards
- Wide timeline view

### Tablet (768px - 1023px)

- 2-column grid for platform compliance
- Stacked metrics cards
- Condensed timeline

### Mobile (< 768px)

- Single column layout
- Stacked metrics cards
- Compact timeline
- Full-width buttons

## Animation Timings

| Element | Animation | Duration | Delay |
|---------|-----------|----------|-------|
| Traffic Light | Glow | 0.3s | 0s |
| Metrics Cards | Slide up | 0.5s | 0.1s each |
| Violation Cards | Slide in | 0.3s | 0.1s each |
| Progress Bars | Width expand | 1s | 0s |
| Modal | Scale + fade | 0.2s | 0s |
| Timeline Items | Slide in | 0.3s | 0.1s each |

## Color Palette

### Primary Colors

- **Blue**: #3b82f6 (Primary actions)
- **Green**: #10b981 (Success/Safe)
- **Yellow**: #eab308 (Warning)
- **Red**: #ef4444 (Error/Critical)
- **Purple**: #a855f7 (Labels)

### Neutral Colors

- **Gray 50**: #f9fafb (Background)
- **Gray 100**: #f3f4f6 (Card background)
- **Gray 200**: #e5e7eb (Borders)
- **Gray 600**: #4b5563 (Secondary text)
- **Gray 900**: #111827 (Primary text)

## Typography

- **Headings**: Font weight 700 (bold)
- **Body**: Font weight 400 (normal)
- **Labels**: Font weight 500 (medium)
- **Buttons**: Font weight 600 (semibold)

### Font Sizes

- **H1**: 2rem (32px)
- **H2**: 1.5rem (24px)
- **H3**: 1.25rem (20px)
- **Body**: 1rem (16px)
- **Small**: 0.875rem (14px)
- **Tiny**: 0.75rem (12px)

## Accessibility

- **ARIA labels**: All interactive elements
- **Keyboard navigation**: Tab order optimized
- **Focus indicators**: Visible focus rings
- **Color contrast**: WCAG AA compliant
- **Screen reader**: Descriptive text for all icons

## Performance

- **Initial render**: < 100ms
- **Animation frame rate**: 60fps
- **Re-render optimization**: React.memo
- **Lazy loading**: Images and heavy components
- **Code splitting**: Modal components

This visual guide provides a comprehensive overview of the SafetyDashboard's design system, layout, and interactive elements.
