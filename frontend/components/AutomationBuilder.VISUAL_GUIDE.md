# AutomationBuilder Visual Guide

A comprehensive visual walkthrough of the AutomationBuilder component's UI and interactions.

## 🎨 Component Overview

```
┌─────────────────────────────────────────────────────────────┐
│  Automation Builder                    [Builder] [List (2)]  │
│  Create powerful if-this-then-that workflows                 │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─── Basic Information ────────────────────────────────┐   │
│  │  Automation Name: [________________________]         │   │
│  │  Description:     [________________________]         │   │
│  │                   [________________________]         │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─── ⚡ Trigger ──────────────────────────────────────┐   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────┐│   │
│  │  │ 📤       │  │ ⏰       │  │ 📱       │  │ ✨   ││   │
│  │  │ On New   │  │ On       │  │ On       │  │ On   ││   │
│  │  │ Upload   │  │ Schedule │  │ Platform │  │ Cont.││   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────┘│   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─── 🔍 Conditions (Optional) ──────── [+ Add Condition]┐  │
│  │  [Field] [Operator ▼] [Value]                      [×]│  │
│  │  [Field] [Operator ▼] [Value]                      [×]│  │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─── 🎬 Actions ──────────────────────── [+ Add Action]┐  │
│  │  ≡ 🤖 Generate Content                           [×] │  │
│  │     [Content Type] [Template]                         │  │
│  │                                                        │  │
│  │  ≡ 🚀 Post to Platform                           [×] │  │
│  │     [Platform ▼] [Account]                            │  │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─── 📊 Workflow Preview ──────────────────────────────┐   │
│  │              ┌──────────┐                             │   │
│  │              │ 📤 Trigger│                            │   │
│  │              └─────┬────┘                             │   │
│  │                    │                                  │   │
│  │              ┌─────▼────┐                             │   │
│  │              │🔍 Cond.(2)│                            │   │
│  │              └─────┬────┘                             │   │
│  │                    │                                  │   │
│  │              ┌─────▼────┐                             │   │
│  │              │🤖 Action 1│                            │   │
│  │              └─────┬────┘                             │   │
│  │                    │                                  │   │
│  │              ┌─────▼────┐                             │   │
│  │              │🚀 Action 2│                            │   │
│  │              └─────┬────┘                             │   │
│  │                    │                                  │   │
│  │              ┌─────▼────┐                             │   │
│  │              │ ✅ Complete│                           │   │
│  │              └──────────┘                             │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  [Reset]                    [Test Automation] [Save]         │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Trigger Selection

### Initial State (No Trigger Selected)

```
┌─── ⚡ Trigger ──────────────────────────────────────────┐
│                                                          │
│  ┌─────────────────────┐  ┌─────────────────────┐      │
│  │  📤                  │  │  ⏰                  │      │
│  │  On New Upload       │  │  On Schedule         │      │
│  │  Triggered when new  │  │  Triggered at        │      │
│  │  content is uploaded │  │  specific times      │      │
│  └─────────────────────┘  └─────────────────────┘      │
│                                                          │
│  ┌─────────────────────┐  ┌─────────────────────┐      │
│  │  📱                  │  │  ✨                  │      │
│  │  On Platform Post    │  │  On Content Gen.     │      │
│  │  Triggered when      │  │  Triggered when AI   │      │
│  │  posted to platform  │  │  generates content   │      │
│  └─────────────────────┘  └─────────────────────┘      │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Selected State

```
┌─── ⚡ Trigger ────────────────────── [Change Trigger] ──┐
│                                                          │
│  ┌────────────────────────────────────────────────┐ [×]│
│  │  📤                                             │    │
│  │  On New Upload                                  │    │
│  │  Triggered when new content is uploaded         │    │
│  │                                                  │    │
│  │  ┌─ Trigger Configuration ────────────────────┐│    │
│  │  │ Triggers on any new upload                  ││    │
│  │  └─────────────────────────────────────────────┘│    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## 🔍 Condition Builder

### Empty State

```
┌─── 🔍 Conditions (Optional) ────────── [+ Add Condition]┐
│                                                           │
│                      🎯                                   │
│     No conditions set. This automation will run          │
│              for all triggers.                            │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

### With Conditions

```
┌─── 🔍 Conditions (Optional) ────────── [+ Add Condition]┐
│                                                           │
│  ┌────────────────────────────────────────────────┐ [×] │
│  │ [fileType    ▼] [equals ▼] [video          ]  │     │
│  └────────────────────────────────────────────────┘     │
│                                                           │
│  ┌────────────────────────────────────────────────┐ [×] │
│  │ [duration    ▼] [greater_than ▼] [60        ]  │     │
│  └────────────────────────────────────────────────┘     │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

## 🎬 Action Builder

### Empty State

```
┌─── 🎬 Actions ──────────────────────────── [+ Add Action]┐
│                                                            │
│                         🚀                                 │
│        Add at least one action to complete                │
│                 your automation                            │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### With Actions (Draggable)

```
┌─── 🎬 Actions ──────────────────────────── [+ Add Action]┐
│                                                            │
│  ┌────────────────────────────────────────────────┐ [×]  │
│  │ ≡ 🤖 Generate Content                      #1  │      │
│  │    Use AI to generate new content              │      │
│  │    ┌──────────────┐ ┌──────────────┐          │      │
│  │    │ Content Type │ │ Template     │          │      │
│  │    └──────────────┘ └──────────────┘          │      │
│  └────────────────────────────────────────────────┘      │
│                                                            │
│  ┌────────────────────────────────────────────────┐ [×]  │
│  │ ≡ 🚀 Post to Platform                      #2  │      │
│  │    Publish content to social platforms         │      │
│  │    ┌──────────────┐ ┌──────────────┐          │      │
│  │    │ Platform ▼   │ │ Account      │          │      │
│  │    └──────────────┘ └──────────────┘          │      │
│  └────────────────────────────────────────────────┘      │
│                                                            │
│  ┌────────────────────────────────────────────────┐ [×]  │
│  │ ≡ 🔔 Send Notification                     #3  │      │
│  │    Send email or push notification             │      │
│  │    ┌──────────────┐ ┌──────────────┐          │      │
│  │    │ Type ▼       │ │ Recipient    │          │      │
│  │    └──────────────┘ └──────────────┘          │      │
│  └────────────────────────────────────────────────┘      │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## 📊 Visual Flow Diagram

```
┌─── 📊 Workflow Preview ────────────────────────────────┐
│                                                         │
│                   ┌──────────────┐                     │
│                   │   📤         │                     │
│                   │ On New Upload│                     │
│                   └──────┬───────┘                     │
│                          │                             │
│                          ▼                             │
│                   ┌──────────────┐                     │
│                   │   🔍         │                     │
│                   │ Conditions(2)│                     │
│                   │ fileType=vid │                     │
│                   │ duration>60  │                     │
│                   └──────┬───────┘                     │
│                          │                             │
│                          ▼                             │
│                   ┌──────────────┐                     │
│                   │   🤖         │                     │
│                   │Generate Cont.│                     │
│                   │  Action #1   │                     │
│                   └──────┬───────┘                     │
│                          │                             │
│                          ▼                             │
│                   ┌──────────────┐                     │
│                   │   🚀         │                     │
│                   │Post Platform │                     │
│                   │  Action #2   │                     │
│                   └──────┬───────┘                     │
│                          │                             │
│                          ▼                             │
│                   ┌──────────────┐                     │
│                   │   🔔         │                     │
│                   │Send Notific. │                     │
│                   │  Action #3   │                     │
│                   └──────┬───────┘                     │
│                          │                             │
│                          ▼                             │
│                   ┌──────────────┐                     │
│                   │      ✅      │                     │
│                   │ Automation   │                     │
│                   │  Complete    │                     │
│                   └──────────────┘                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 🎭 Action Selector Modal

```
┌─────────────────────────────────────────────────────┐
│  Select an Action                              [×]  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────┐  ┌──────────────────┐       │
│  │  🤖              │  │  🚀              │       │
│  │  Generate        │  │  Post to         │       │
│  │  Content         │  │  Platform        │       │
│  │  Use AI to       │  │  Publish content │       │
│  │  generate new    │  │  to social       │       │
│  │  content         │  │  platforms       │       │
│  └──────────────────┘  └──────────────────┘       │
│                                                     │
│  ┌──────────────────┐  ┌──────────────────┐       │
│  │  🔔              │  │  ⚙️              │       │
│  │  Send            │  │  Run             │       │
│  │  Notification    │  │  Workflow        │       │
│  │  Send email or   │  │  Execute another │       │
│  │  push notif.     │  │  automation      │       │
│  └──────────────────┘  └──────────────────┘       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 📋 Automation List View

```
┌─────────────────────────────────────────────────────────┐
│  Automation Builder              [Builder] [List (2)]   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─ Filters ──────────────────────────────────────────┐│
│  │ Filter: [All] [Active] [Inactive] [Draft]          ││
│  └─────────────────────────────────────────────────────┘│
│                                                          │
│  ┌─────────────────────────────────────────────────────┐│
│  │ Auto-post to Instagram              [active] [Edit] ││
│  │ Automatically post generated content to Instagram   ││
│  │                                                      ││
│  │ [📤 On New Upload] → [2 conditions] → [2 actions]  ││
│  │                                                      ││
│  │ 🔄 Runs: 42  ⏱️ Last: Jan 20  📅 Created: Jan 15   ││
│  └─────────────────────────────────────────────────────┘│
│                                                          │
│  ┌─────────────────────────────────────────────────────┐│
│  │ Daily Content Generation            [active] [Edit] ││
│  │ Generate and schedule content every day at 9 AM     ││
│  │                                                      ││
│  │ [⏰ On Schedule] → [2 actions]                      ││
│  │                                                      ││
│  │ 🔄 Runs: 11  ⏱️ Last: Jan 21  📅 Created: Jan 10   ││
│  └─────────────────────────────────────────────────────┘│
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## 🎨 Color Palette

### Triggers
- **On New Upload**: Blue to Cyan gradient (`from-blue-500 to-cyan-500`)
- **On Schedule**: Purple to Pink gradient (`from-purple-500 to-pink-500`)
- **On Platform Post**: Green to Emerald gradient (`from-green-500 to-emerald-500`)
- **On Content Generated**: Orange to Red gradient (`from-orange-500 to-red-500`)

### Actions
- **Generate Content**: Purple to Indigo gradient (`from-purple-500 to-indigo-500`)
- **Post to Platform**: Blue to Cyan gradient (`from-blue-500 to-cyan-500`)
- **Send Notification**: Yellow to Orange gradient (`from-yellow-500 to-orange-500`)
- **Run Workflow**: Green to Teal gradient (`from-green-500 to-teal-500`)

### Status Badges
- **Active**: Green (`bg-green-500/20 text-green-400`)
- **Inactive**: Gray (`bg-gray-500/20 text-gray-400`)
- **Draft**: Yellow (`bg-yellow-500/20 text-yellow-400`)

### UI Elements
- **Background**: Gray-900 to Gray-800 gradient
- **Cards**: Gray-800/50 with backdrop blur
- **Borders**: Gray-700
- **Primary Button**: Purple-600 to Pink-600 gradient
- **Secondary Button**: Gray-700
- **Danger**: Red-600

## 🎬 Animations

### Entry Animations
- **Fade in**: Opacity 0 → 1 (0.5s)
- **Slide up**: Y: 20px → 0 (0.6s)
- **Scale**: Scale 0.9 → 1 (0.3s)

### Hover Effects
- **Cards**: Scale 1.05, Y: -5px
- **Buttons**: Scale 1.05
- **Action rows**: Scale 1.02

### Drag-and-Drop
- **Reorder**: Smooth position transitions
- **Grab cursor**: On hover over action rows

### Flow Diagram
- **Sequential reveal**: Each node appears with delay
- **Connecting lines**: Height animates from 0

## 📱 Responsive Breakpoints

### Mobile (< 768px)
- Single column layout
- Stacked trigger cards
- Full-width inputs
- Simplified flow diagram

### Tablet (768px - 1024px)
- Two-column trigger grid
- Two-column action grid
- Compact condition rows

### Desktop (> 1024px)
- Four-column trigger grid
- Full-width action rows
- Detailed flow diagram
- Side-by-side layouts

## ♿ Accessibility Features

- **Keyboard Navigation**: Tab through all interactive elements
- **Focus Indicators**: Visible focus rings on inputs/buttons
- **ARIA Labels**: Descriptive labels for screen readers
- **Color Contrast**: WCAG AA compliant
- **Semantic HTML**: Proper heading hierarchy

## 🎯 Interactive States

### Buttons
- **Default**: Base color
- **Hover**: Lighter shade, scale 1.05
- **Active**: Darker shade, scale 0.95
- **Disabled**: 50% opacity, no pointer events

### Inputs
- **Default**: Gray-700 background
- **Focus**: Purple-500 border
- **Error**: Red-500 border
- **Disabled**: Gray-600 background

### Cards
- **Default**: Gray-800/50 background
- **Hover**: Border color change, slight lift
- **Selected**: Purple-500 border
- **Dragging**: Elevated shadow, cursor grabbing

## 🔄 State Flow

```
Initial State
    ↓
Select Trigger
    ↓
Add Conditions (Optional)
    ↓
Add Actions (Required)
    ↓
Configure Actions
    ↓
Review Flow Diagram
    ↓
Test or Save
    ↓
View in List
```

## 💡 UX Best Practices

1. **Progressive Disclosure**: Show sections as user progresses
2. **Visual Feedback**: Immediate response to all interactions
3. **Clear Hierarchy**: Important actions stand out
4. **Undo Support**: Easy removal of conditions/actions
5. **Validation**: Clear error messages
6. **Empty States**: Helpful guidance when no content
7. **Loading States**: Smooth transitions during operations
8. **Success Feedback**: Confirmation of completed actions
