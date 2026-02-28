# DopamineOptimizer Visual Guide

Visual reference for understanding the component layout and features.

## Component Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Dopamine Optimization Score                                │
│  AI-powered content engagement analysis                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    ╭─────────╮                              │
│                   ╱           ╲                             │
│                  │     78      │  ← Score Gauge             │
│                   ╲  Excellent ╱                            │
│                    ╰─────────╯                              │
│                                                             │
│  0 ─── 25 ─── 50 ─── 75 ─── 100                            │
├─────────────────────────────────────────────────────────────┤
│  Content Timeline                                           │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Engagement Curve (Area Chart)                      │   │
│  │     ╱╲                                               │   │
│  │    ╱  ╲      ╱╲                                      │   │
│  │   ╱    ╲    ╱  ╲    ╱╲                               │   │
│  │  ╱      ╲  ╱    ╲  ╱  ╲                              │   │
│  │ ╱        ╲╱      ╲╱    ╲                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🎯    💥      🔥    ⚠️    💥      🔥                │   │
│  │  ├──────┼───────┼─────┼─────┼───────┼──────┤        │   │
│  │  0%   20%    40%   60%   80%   100%                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  🎯 Hooks  💥 Emotional Peaks  🔥 Cliffhangers  ⚠️ Dropoff │
├─────────────────────────────────────────────────────────────┤
│  Pacing Analysis                                            │
│  Overall: varied                                      82    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  0% - 20%                              [Fast]       │   │
│  │  ████████████████████████████████████ 85%           │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  20% - 40%                          [Moderate]      │   │
│  │  ████████████████████████ 72%                       │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  40% - 60%                             [Fast]       │   │
│  │  ████████████████████████████████████████ 88%       │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  💡 Improvement Suggestions                                 │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [HIGH] Hook                                   +85   │   │
│  │  Add visual hook in first 2 seconds                 │   │
│  │  ████████████████████████████████████████ 85%       │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  [HIGH] Retention                              +78   │   │
│  │  Reduce information density at 70% mark              │   │
│  │  ██████████████████████████████████ 78%              │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  [MEDIUM] Pacing                               +72   │   │
│  │  Increase pace between 20-40%                        │   │
│  │  ████████████████████████████ 72%                    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Color Coding

### Score Gauge Colors
```
 0-39:  🔴 Red      (#ef4444) - Needs Work
40-59:  🟠 Amber    (#f59e0b) - Fair
60-79:  🟡 Amber    (#f59e0b) - Good
80-100: 🟢 Green    (#10b981) - Excellent
```

### Timeline Markers
```
🎯 Hooks            - Blue (#3b82f6)
💥 Emotional Peaks  - Varies by emotion
🔥 Cliffhangers     - Amber (#f59e0b)
⚠️ Dropoff Points   - Red (#ef4444)
```

### Emotion Colors
```
😊 Joy          - Green (#10b981)
😲 Surprise     - Amber (#f59e0b)
🤔 Anticipation - Purple (#8b5cf6)
🤝 Trust        - Blue (#3b82f6)
😨 Fear         - Red (#ef4444)
😢 Sadness      - Gray (#6b7280)
```

### Pacing Colors
```
Fast     - Green (#10b981)
Moderate - Amber (#f59e0b)
Slow     - Red (#ef4444)
```

### Priority Colors
```
HIGH   - Red (#ef4444)
MEDIUM - Amber (#f59e0b)
LOW    - Blue (#3b82f6)
```

## Interactive Elements

### 1. Timeline Markers (Hover)
```
┌─────────────────────────────┐
│ Hook                        │
│ What if I told you...       │
│ Strength: 85                │
└─────────────────────────────┘
```

### 2. Emotional Peak (Hover)
```
┌─────────────────────────────┐
│ Emotion                     │
│ Mind-blowing reveal         │
│ Intensity: 82               │
│ Emotion: 😲 surprise        │
└─────────────────────────────┘
```

### 3. Dropoff Point (Hover)
```
┌─────────────────────────────┐
│ Dropoff                     │
│ Severity: 65                │
│ Slow pacing, attention loss │
└─────────────────────────────┘
```

## Engagement Curve Visualization

```
High  │     ╱╲
      │    ╱  ╲      ╱╲
      │   ╱    ╲    ╱  ╲    ╱╲
Med   │  ╱      ╲  ╱    ╲  ╱  ╲
      │ ╱        ╲╱      ╲╱    ╲
Low   │╱
      └─────────────────────────────
       0%   20%   40%   60%   80%  100%

Legend:
─── Engagement Level
╱╲  Peaks and valleys
│   Vertical lines = Dropoff points (red)
│   Vertical lines = Strong points (green)
```

## Timeline Layers

The timeline has three horizontal layers:

```
Layer 1 (Top):    🎯 🎯 🎯  ← Hooks
Layer 2 (Middle): 💥 💥 💥  ← Emotional Peaks
Layer 3 (Bottom): 🔥 🔥 🔥  ← Cliffhangers

Vertical bars:    ⚠️ ⚠️ ⚠️  ← Dropoff Points (span all layers)
```

## Pacing Segments

Background colors show pacing:

```
┌────────┬────────┬────────┬────────┬────────┐
│ Fast   │ Mod    │ Fast   │ Mod    │ Fast   │
│ Green  │ Amber  │ Green  │ Amber  │ Green  │
│ 0-20%  │ 20-40% │ 40-60% │ 60-80% │ 80-100%│
└────────┴────────┴────────┴────────┴────────┘
```

## Improvement Cards

```
┌─────────────────────────────────────────────┐
│ [HIGH] Hook                            +85  │ ← Priority & Impact
│ Add visual hook in first 2 seconds         │ ← Suggestion
│ ████████████████████████████████████ 85%   │ ← Impact Bar
└─────────────────────────────────────────────┘
```

## Responsive Behavior

### Desktop (>1024px)
```
┌─────────────────────────────────────┐
│  Full width, all features visible   │
│  Timeline: 100% width               │
│  Gauge: Centered                    │
└─────────────────────────────────────┘
```

### Tablet (768px - 1024px)
```
┌───────────────────────────┐
│  Slightly compressed      │
│  Timeline: 100% width     │
│  Gauge: Centered          │
└───────────────────────────┘
```

### Mobile (<768px)
```
┌─────────────────┐
│  Stacked layout │
│  Timeline: Full │
│  Gauge: Smaller │
└─────────────────┘
```

## Animation Sequence

```
Time  Element                 Animation
────  ──────────────────────  ─────────────────────
0.0s  Container               Fade in + slide up
0.5s  Score number            Scale up (spring)
0.8s  Timeline container      Fade in
1.0s  Timeline markers        Stagger (0.1s each)
1.2s  Pacing analysis         Fade in
1.3s  Pacing bars             Slide in (stagger)
1.6s  Improvements            Fade in
1.7s  Improvement cards       Slide in (stagger)
2.0s  All animations complete
```

## Data Flow Visualization

```
Backend API
    │
    ├─→ overallScore ──────────→ Score Gauge
    │
    ├─→ hooks ─────────────────→ Timeline (🎯)
    │
    ├─→ emotionalPeaks ────────→ Timeline (💥)
    │
    ├─→ cliffhangers ──────────→ Timeline (🔥)
    │
    ├─→ retentionPrediction ───→ Timeline (⚠️) + Engagement Curve
    │
    ├─→ pacingAnalysis ────────→ Pacing Section + Timeline Background
    │
    └─→ improvements ──────────→ Improvements Section
```

## Marker Positioning

Markers are positioned using percentage-based positioning:

```
Position: 0%    = Start of content
Position: 25%   = Quarter through
Position: 50%   = Halfway
Position: 75%   = Three-quarters
Position: 100%  = End of content

Example:
Hook at position 15 = 15% from left edge
Peak at position 58 = 58% from left edge
```

## Tooltip Positioning

```
Marker Position          Tooltip Position
───────────────          ────────────────
Left side (0-30%)    →   Right of cursor
Center (30-70%)      →   Above cursor
Right side (70-100%) →   Left of cursor
```

## Z-Index Layers

```
Layer 5: Tooltips (z-50)
Layer 4: Dropoff markers (vertical bars)
Layer 3: Timeline markers (🎯💥🔥)
Layer 2: Engagement curve
Layer 1: Pacing background
Layer 0: Container background
```

## Best Practices

### Visual Hierarchy
1. Score gauge (largest, centered)
2. Timeline (prominent, interactive)
3. Pacing analysis (supporting detail)
4. Improvements (actionable items)

### Color Usage
- Use green for positive metrics
- Use red for warnings/issues
- Use amber for moderate/neutral
- Use blue for informational

### Spacing
- 6-8 units between major sections
- 3-4 units between related items
- 2 units for tight groupings

### Typography
- Headers: 2xl, bold, white
- Subheaders: lg, semibold, white
- Body: sm, regular, gray-300
- Labels: xs, regular, gray-400

## Accessibility Notes

- All markers have hover states
- Tooltips provide text alternatives
- Color is not the only indicator (icons used)
- Keyboard navigation supported
- Screen reader friendly structure

## Performance Considerations

- Markers rendered with absolute positioning (no layout shifts)
- Animations use GPU-accelerated properties
- Charts use SVG for crisp rendering
- Tooltips use fixed positioning (no reflow)
