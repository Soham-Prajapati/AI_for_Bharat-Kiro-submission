# TrendDashboard Visual Guide

## Component Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Trend Dashboard                    Last updated: [timestamp]   │
│  Real-time trending topics with AI-powered predictions...       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ 📊       │  │ 📈       │  │ 🔥       │  │ 📉       │       │
│  │ Total    │  │ Rising   │  │ At Peak  │  │ Declining│       │
│  │   20     │  │   14     │  │    4     │  │    2     │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [All Trends] [📈 Rising] [🔥 Peak] [📉 Declining]             │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ AI Content   │  │ Sustainable  │  │ Productivity │         │
│  │ Creation     │  │ Fashion      │  │ Hacks        │         │
│  │              │  │              │  │              │         │
│  │ 📈 Rising    │  │ 📈 Rising    │  │ 🔥 Peak      │         │
│  │        +245% │  │        +189% │  │        +156% │         │
│  │              │  │              │  │              │         │
│  │ Engagement/hr│  │ Engagement/hr│  │ Engagement/hr│         │
│  │    15.0K     │  │    12.0K     │  │     9.5K     │         │
│  │              │  │              │  │              │         │
│  │ Confidence   │  │ Confidence   │  │ Confidence   │         │
│  │     92%      │  │     85%      │  │     78%      │         │
│  │              │  │              │  │              │         │
│  │ 🎵 TikTok    │  │ 📷 Instagram │  │ ▶️ YouTube   │         │
│  │ 📷 Instagram │  │ 🎵 TikTok    │  │ 🎵 TikTok    │         │
│  │ ▶️ YouTube   │  │ ▶️ YouTube   │  │ 🐦 Twitter   │         │
│  │              │  │              │  │              │         │
│  │ Peak: Feb 15 │  │ Peak: Feb 20 │  │ Peak: Feb 10 │         │
│  │ Conf: 88%    │  │ Conf: 82%    │  │ Conf: 75%    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  [... more trend cards in 3-column grid ...]                    │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🔮 Top Predictions                                             │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ #1           │  │ #2           │  │ #3           │         │
│  │ AI Content   │  │ Pet Content  │  │ Mental Health│         │
│  │ 92% conf     │  │ 91% conf     │  │ 89% conf     │         │
│  │ ████████████ │  │ ███████████  │  │ ██████████   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Detail Modal (Click on any trend card)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                              ×   │
│  AI Content Creation                                            │
│  📈 Rising  Growth: +245%                                       │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📈 Trend Timeline                                              │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                                                    ╱╲      │ │
│  │                                              ╱╲  ╱  ╲     │ │
│  │                                        ╱╲  ╱  ╲╱    ╲    │ │
│  │                                  ╱╲  ╱  ╲╱            ╲   │ │
│  │                            ╱╲  ╱  ╲╱                   ╲  │ │
│  │                      ╱╲  ╱  ╲╱                          ╲ │ │
│  │                ╱╲  ╱  ╲╱                                 ╲│ │
│  │          ╱╲  ╱  ╲╱                                        │ │
│  │    ╱╲  ╱  ╲╱                                              │ │
│  │  ╱  ╲╱                                                    │ │
│  └───────────────────────────────────────────────────────────┘ │
│    Day 1    Day 2    Day 3    Day 4    Day 5                   │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🗺️ Platform Intensity Heatmap                                 │
│                                                                  │
│  🎵 TikTok     ████████████████████████████████████ 95%        │
│  📷 Instagram  ████████████████████████████ 78%                │
│  ▶️ YouTube    ████████████████████ 65%                        │
│  🐦 Twitter    ██████████████ 45%                              │
│  👥 Facebook   ██████████ 30%                                  │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🔮 AI Predictions                                              │
│                                                                  │
│  ┌─────────────────────────┐  ┌─────────────────────────┐     │
│  │ Peak Date Prediction    │  │ Overall Confidence      │     │
│  │                         │  │                         │     │
│  │ February 15, 2024       │  │        92%              │     │
│  │                         │  │                         │     │
│  │ Confidence: 88%         │  │ Based on 3 platforms    │     │
│  └─────────────────────────┘  └─────────────────────────┘     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Color Coding

### Status Badges
- **📈 Rising** - Green background (#10b981)
- **🔥 Peak** - Amber background (#f59e0b)
- **📉 Declining** - Red background (#ef4444)

### Platform Intensity Heatmap
- **80-100%** - Green (#10b981)
- **60-79%** - Blue (#3b82f6)
- **40-59%** - Amber (#f59e0b)
- **0-39%** - Gray (#6b7280)

## Interactive Features

1. **Hover Effects**
   - Trend cards scale up slightly (1.02x)
   - Smooth transitions on all interactive elements

2. **Click Actions**
   - Click any trend card to open detailed modal
   - Click outside modal or × button to close

3. **Filter Buttons**
   - Click to filter trends by status
   - Active filter highlighted in blue

4. **Chart Interactions**
   - Hover over timeline chart to see exact values
   - Tooltip shows engagement and mentions

## Animations

1. **On Load**
   - Stats cards fade in with stagger effect
   - Trend cards animate in sequence
   - Progress bars animate from 0 to target value

2. **Modal**
   - Backdrop fades in
   - Modal scales up from 0.9 to 1.0
   - Content animates in sequence

3. **Heatmap**
   - Bars animate from left to right
   - Staggered animation for each platform

## Responsive Breakpoints

- **Mobile (< 768px)**: 1 column
- **Tablet (768px - 1024px)**: 2 columns
- **Desktop (> 1024px)**: 3 columns
- **Stats Overview**: 1 → 2 → 4 columns

## Platform Icons

- 🎵 TikTok
- 📷 Instagram
- ▶️ YouTube
- 🐦 Twitter
- 👥 Facebook

## Status Icons

- 📈 Rising
- 🔥 Peak
- 📉 Declining
- 📊 Total Trends
- 🔮 Predictions
