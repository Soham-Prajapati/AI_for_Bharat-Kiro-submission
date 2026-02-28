# KnowledgeGraph Visual Guide

Visual reference for the KnowledgeGraph component design and interactions.

## Component Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Knowledge Graph                    [−] [+] [↻]             │
│  150 nodes, 230 connections                                 │
├─────────────────────────────────────────────────────────────┤
│  [Search nodes...]                    [All Types ▼]         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                    ●────●                                    │
│                   ╱      ╲                                   │
│              ●───●        ●───●                              │
│             ╱     ╲      ╱     ╲                             │
│            ●       ●────●       ●                            │
│             ╲     ╱      ╲     ╱                             │
│              ●───●        ●───●                              │
│                   ╲      ╱                                   │
│                    ●────●                                    │
│                                                              │
│                  [Interactive Canvas]                        │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  ● Content  ● Topics  ● Creators          Zoom: 100%        │
└─────────────────────────────────────────────────────────────┘
```

## Color Scheme

### Node Colors
```
Content (Blue):   #3b82f6  ████████
Topic (Pink):     #ec4899  ████████
Creator (Green):  #10b981  ████████
```

### Background Colors
```
Canvas:           #111827  ████████
Container:        #1f2937  ████████
Border:           #374151  ████████
Hover:            #4b5563  ████████
```

### Accent Colors
```
Primary:          #a855f7  ████████
Secondary:        #ec4899  ████████
Success:          #10b981  ████████
Warning:          #f59e0b  ████████
Error:            #ef4444  ████████
```

## Node Visualization

### Node Types & Sizes

```
Content Node (Small):
    ●
   8px

Topic Node (Large):
    ●●
   12px

Creator Node (Medium):
    ●
   10px
```

### Node States

```
Normal:           ●  (solid color)
Hovered:          ◉  (white outline)
Selected:         ⊙  (thick white outline)
```

### Edge Styles

```
Normal Edge:      ────  (gray, thin)
Strong Edge:      ━━━━  (gray, thick)
Weak Edge:        ····  (gray, dotted)
```

## Interaction States

### 1. Default State
```
┌─────────────────────────────┐
│  Knowledge Graph            │
├─────────────────────────────┤
│                             │
│      ●────●────●            │
│     ╱      ╲    ╲           │
│    ●        ●────●          │
│                             │
│  Cursor: grab               │
└─────────────────────────────┘
```

### 2. Hover State
```
┌─────────────────────────────┐
│  Knowledge Graph            │
├─────────────────────────────┤
│                             │
│      ●────◉────●            │
│     ╱      ╲    ╲           │
│    ●        ●────●          │
│                             │
│  ┌─────────────┐            │
│  │ AI Content  │            │
│  │ Topic       │            │
│  │ Weight: 10  │            │
│  └─────────────┘            │
│  Cursor: pointer            │
└─────────────────────────────┘
```

### 3. Selected State
```
┌─────────────────────────────┐
│  Knowledge Graph            │
├─────────────────────────────┤
│                             │
│      ●────⊙────●            │
│     ╱      ╲    ╲           │
│    ●        ●────●          │
│                             │
├─────────────────────────────┤
│  ● AI Content               │
│  Type: Topic                │
│  Weight: 10                 │
│  [View Details]             │
└─────────────────────────────┘
```

### 4. Dragging State
```
┌─────────────────────────────┐
│  Knowledge Graph            │
├─────────────────────────────┤
│                             │
│      ●────●────●            │
│     ╱      ╲    ╲           │
│    ●        ●────●          │
│         ↓↓↓                 │
│  Cursor: grabbing           │
└─────────────────────────────┘
```

## Control Buttons

### Zoom Controls
```
┌───┐ ┌───┐ ┌───┐
│ − │ │ + │ │ ↻ │
└───┘ └───┘ └───┘
Zoom  Zoom  Reset
Out   In    View
```

### Filter Dropdown
```
┌──────────────┐
│ All Types  ▼ │
├──────────────┤
│ ✓ All Types  │
│   Content    │
│   Topics     │
│   Creators   │
└──────────────┘
```

## Search Interface

### Search Bar States

```
Empty:
┌─────────────────────────────┐
│ 🔍 Search nodes...          │
└─────────────────────────────┘

Active:
┌─────────────────────────────┐
│ 🔍 AI Content            ✕  │
└─────────────────────────────┘

Results:
┌─────────────────────────────┐
│ 🔍 AI                    ✕  │
├─────────────────────────────┤
│ Showing 5 of 150 nodes      │
└─────────────────────────────┘
```

## Tooltip Design

### Node Tooltip
```
┌─────────────────────┐
│ ● Topic             │
│ AI Content          │
│ Weight: 10          │
└─────────────────────┘
```

### Detailed Tooltip
```
┌─────────────────────────────┐
│ ● Topic                     │
│ AI Content Generation       │
│ Weight: 10                  │
│ ─────────────────────────   │
│ Connections: 15             │
│ Related: Video Editing      │
└─────────────────────────────┘
```

## Loading States

### Initial Load
```
┌─────────────────────────────┐
│  Knowledge Graph            │
├─────────────────────────────┤
│                             │
│         ⟳                   │
│   Loading graph...          │
│                             │
└─────────────────────────────┘
```

### Error State
```
┌─────────────────────────────┐
│  Knowledge Graph            │
├─────────────────────────────┤
│                             │
│         ⚠                   │
│   Error loading graph       │
│   Failed to fetch data      │
│                             │
│   [Retry]                   │
│                             │
└─────────────────────────────┘
```

## Animation Sequences

### 1. Component Mount
```
Frame 1:  opacity: 0, y: 20
Frame 2:  opacity: 0.5, y: 10
Frame 3:  opacity: 1, y: 0
Duration: 600ms
```

### 2. Node Appearance
```
Frame 1:  scale: 0, opacity: 0
Frame 2:  scale: 0.5, opacity: 0.5
Frame 3:  scale: 1, opacity: 1
Duration: 300ms
Stagger: 50ms per node
```

### 3. Physics Simulation
```
Initial:  alpha = 1.0 (high energy)
Step 1:   alpha = 0.8 (nodes moving)
Step 2:   alpha = 0.5 (settling)
Step 3:   alpha = 0.2 (almost stable)
Final:    alpha < 0.001 (stable)
```

### 4. Zoom Animation
```
Zoom In:  scale: 1.0 → 1.2
Zoom Out: scale: 1.0 → 0.8
Duration: 200ms
Easing:   ease-out
```

## Responsive Breakpoints

### Desktop (1200px+)
```
┌─────────────────────────────────────┐
│  Knowledge Graph                    │
│  Width: 1200px, Height: 700px       │
│                                     │
│  [Full featured graph]              │
│                                     │
└─────────────────────────────────────┘
```

### Tablet (768px - 1199px)
```
┌───────────────────────────┐
│  Knowledge Graph          │
│  Width: 800px, Height: 600│
│                           │
│  [Simplified controls]    │
│                           │
└───────────────────────────┘
```

### Mobile (< 768px)
```
┌─────────────────┐
│  Knowledge Graph│
│  Width: 100%    │
│  Height: 500px  │
│                 │
│  [Touch enabled]│
│                 │
└─────────────────┘
```

## Performance Indicators

### Node Count vs Performance
```
100 nodes:   ████████████ 60fps (Excellent)
500 nodes:   ██████████   60fps (Great)
1000 nodes:  ████████     45fps (Good)
2000 nodes:  ████         30fps (Acceptable)
5000+ nodes: ██           15fps (Slow)
```

### Optimization Levels
```
Level 1 (< 100 nodes):
- Full labels
- Smooth animations
- All effects enabled

Level 2 (100-500 nodes):
- Labels on zoom
- Standard animations
- Most effects enabled

Level 3 (500-1000 nodes):
- Labels on hover
- Reduced animations
- Essential effects only

Level 4 (1000+ nodes):
- No labels
- Minimal animations
- Performance mode
```

## Accessibility Features

### Keyboard Navigation
```
Tab:        Focus next control
Shift+Tab:  Focus previous control
Enter:      Activate focused control
Escape:     Close tooltip/deselect
+/-:        Zoom in/out
Arrow keys: Pan view
```

### Screen Reader Announcements
```
"Knowledge graph with 150 nodes and 230 connections"
"Node selected: AI Content, type: topic, weight: 10"
"Zoom level: 120 percent"
"Filter applied: showing content nodes only"
```

## Best Practices

### Do's ✅
- Use consistent colors for node types
- Provide clear hover feedback
- Show loading states
- Handle errors gracefully
- Optimize for large datasets
- Support keyboard navigation
- Provide zoom controls
- Include search functionality

### Don'ts ❌
- Don't render too many labels at once
- Don't use jarring animations
- Don't hide important controls
- Don't ignore mobile users
- Don't skip loading states
- Don't forget error handling
- Don't overcomplicate the UI
- Don't sacrifice performance

## Future Enhancements

### Planned Features
```
Phase 1:
- ✅ Basic graph rendering
- ✅ Zoom and pan
- ✅ Node selection
- ✅ Search and filter

Phase 2:
- [ ] 3D visualization
- [ ] Clustering
- [ ] Path finding
- [ ] Export as image

Phase 3:
- [ ] Real-time updates
- [ ] Collaborative editing
- [ ] Custom node shapes
- [ ] Advanced analytics
```

## Design Tokens

### Spacing
```
xs:  4px
sm:  8px
md:  16px
lg:  24px
xl:  32px
2xl: 48px
```

### Border Radius
```
sm:  4px
md:  8px
lg:  12px
xl:  16px
```

### Shadows
```
sm:  0 1px 2px rgba(0,0,0,0.05)
md:  0 4px 6px rgba(0,0,0,0.1)
lg:  0 10px 15px rgba(0,0,0,0.2)
xl:  0 20px 25px rgba(0,0,0,0.3)
```

### Typography
```
xs:  12px
sm:  14px
md:  16px
lg:  18px
xl:  20px
2xl: 24px
```

This visual guide provides a comprehensive reference for the KnowledgeGraph component's design and behavior.
