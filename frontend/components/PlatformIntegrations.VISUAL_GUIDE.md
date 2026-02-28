# PlatformIntegrations - Visual Guide

Visual representation of the component structure and user interactions.

## Component Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                    Platform Integrations                        │
│              Connect and manage your social media accounts      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   YouTube    │  │  Instagram   │  │   LinkedIn   │        │
│  │      ▶       │  │      📷      │  │      💼      │        │
│  │              │  │              │  │              │        │
│  │ ● Connected  │  │ ● Disconn... │  │ ● Connected  │        │
│  │              │  │              │  │              │        │
│  │ @user_youtube│  │              │  │ @user_linked │        │
│  │ 45.2K follow │  │              │  │ 12.5K follow │        │
│  │ 2h ago       │  │              │  │ Just now     │        │
│  │              │  │              │  │              │        │
│  │ [Sync Now]   │  │  [Connect]   │  │ [Sync Now]   │        │
│  │ [Disconnect] │  │              │  │ [Disconnect] │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Twitter    │  │    TikTok    │  │   Facebook   │        │
│  │      🐦      │  │      🎵      │  │      👥      │        │
│  │              │  │              │  │              │        │
│  │ ● Error      │  │ ● Connected  │  │ ● Disconn... │        │
│  │              │  │              │  │              │        │
│  │ Connection   │  │ @user_tiktok │  │              │        │
│  │ failed.      │  │ 89.1K follow │  │              │        │
│  │ Try again.   │  │ 5m ago       │  │              │        │
│  │              │  │              │  │              │        │
│  │  [Connect]   │  │ [Sync Now]   │  │  [Connect]   │        │
│  │              │  │ [Disconnect] │  │              │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Card States

### 1. Disconnected State
```
┌──────────────────────┐
│    Instagram  📷     │
│                      │
│  ● Disconnected      │
│                      │
│                      │
│                      │
│    [  Connect  ]     │
│                      │
└──────────────────────┘
```

### 2. Connecting State (Loading)
```
┌──────────────────────┐
│    Instagram  📷     │
│                      │
│  ● Disconnected      │
│                      │
│                      │
│                      │
│  [ ⟳ Connecting... ] │
│                      │
└──────────────────────┘
```

### 3. Connected State
```
┌──────────────────────┐
│  Instagram  📷    ⚙  │
│                      │
│  ● Connected         │
│                      │
│  Username: @insta    │
│  Followers: 25.3K    │
│  Last Sync: 1h ago   │
│                      │
│    [ Sync Now ]      │
│    [ Disconnect ]    │
└──────────────────────┘
```

### 4. Error State
```
┌──────────────────────┐
│    Twitter  🐦       │
│                      │
│  ● Error             │
│                      │
│  ┌──────────────────┐│
│  │ Connection failed││
│  │ Please try again ││
│  └──────────────────┘│
│                      │
│    [  Connect  ]     │
│                      │
└──────────────────────┘
```

### 5. Syncing State
```
┌──────────────────────┐
│  YouTube  ▶       ⚙  │
│                      │
│  ● Connected         │
│                      │
│  Username: @youtube  │
│  Followers: 100K     │
│  Last Sync: 5m ago   │
│                      │
│  [ ⟳ Syncing... ]    │
│    [ Disconnect ]    │
└──────────────────────┘
```

## Settings Modal

```
┌─────────────────────────────────────────┐
│  Instagram 📷  Settings            ✕    │
├─────────────────────────────────────────┤
│                                         │
│  Auto Post                    ●─────○   │
│  Automatically publish content          │
│                                         │
│  Notifications                ○─────●   │
│  Receive platform updates               │
│                                         │
│  Sync Frequency                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │Realtime │ │ Hourly  │ │  Daily  │  │
│  └─────────┘ └─────────┘ └─────────┘  │
│                                         │
│  ┌──────────┐        ┌──────────────┐  │
│  │  Cancel  │        │ Save Changes │  │
│  └──────────┘        └──────────────┘  │
└─────────────────────────────────────────┘
```

## User Interaction Flow

### Connection Flow
```
User clicks "Connect"
        ↓
Button shows "Connecting..." with spinner
        ↓
Simulated OAuth (2 seconds)
        ↓
    Success? ──No──→ Show error state
        │            Show error toast
        Yes
        ↓
Update card with account info
        ↓
Show success toast
        ↓
Enable Sync and Settings buttons
```

### Sync Flow
```
User clicks "Sync Now"
        ↓
Button shows "Syncing..." with spinner
        ↓
Simulated API call (1.5 seconds)
        ↓
Update "Last Sync" timestamp
        ↓
Show success toast
        ↓
Button returns to "Sync Now"
```

### Settings Flow
```
User clicks Settings icon (⚙)
        ↓
Modal opens with current settings
        ↓
User toggles switches or selects frequency
        ↓
User clicks "Save Changes"
        ↓
Settings saved to state
        ↓
Show success toast
        ↓
Modal closes
```

### Disconnect Flow
```
User clicks "Disconnect"
        ↓
Immediately clear account data
        ↓
Update card to disconnected state
        ↓
Show info toast
        ↓
Show "Connect" button
```

## Toast Notifications

### Success Toast
```
┌─────────────────────────────────┐
│ ✓  Successfully connected to    │
│    Instagram!                    │
└─────────────────────────────────┘
```

### Error Toast
```
┌─────────────────────────────────┐
│ ✕  Failed to connect to Twitter.│
│    Please try again.             │
└─────────────────────────────────┘
```

### Info Toast
```
┌─────────────────────────────────┐
│ ℹ  Disconnected from LinkedIn   │
└─────────────────────────────────┘
```

## Responsive Behavior

### Desktop (3 columns)
```
┌────────┐ ┌────────┐ ┌────────┐
│YouTube │ │Instagram│ │LinkedIn│
└────────┘ └────────┘ └────────┘
┌────────┐ ┌────────┐ ┌────────┐
│Twitter │ │ TikTok │ │Facebook│
└────────┘ └────────┘ └────────┘
```

### Tablet (2 columns)
```
┌────────┐ ┌────────┐
│YouTube │ │Instagram│
└────────┘ └────────┘
┌────────┐ ┌────────┐
│LinkedIn│ │Twitter │
└────────┘ └────────┘
┌────────┐ ┌────────┐
│ TikTok │ │Facebook│
└────────┘ └────────┘
```

### Mobile (1 column)
```
┌────────┐
│YouTube │
└────────┘
┌────────┐
│Instagram│
└────────┘
┌────────┐
│LinkedIn│
└────────┘
┌────────┐
│Twitter │
└────────┘
┌────────┐
│ TikTok │
└────────┘
┌────────┐
│Facebook│
└────────┘
```

## Animation Timeline

### Card Entry Animation
```
Time: 0ms     100ms    200ms    300ms    400ms    500ms
      ↓        ↓        ↓        ↓        ↓        ↓
Card1: [Fade in + Slide up]
Card2:          [Fade in + Slide up]
Card3:                   [Fade in + Slide up]
Card4:                            [Fade in + Slide up]
Card5:                                     [Fade in + Slide up]
Card6:                                              [Fade in + Slide up]
```

### Modal Animation
```
Backdrop: Fade in (300ms)
Modal:    Scale up + Fade in (300ms)
```

### Button Hover
```
Normal → Hover: Scale 1.0 → 1.02 (200ms)
```

### Button Press
```
Hover → Press: Scale 1.02 → 0.98 (100ms)
```

## Color Scheme

### Platform Colors
- **YouTube**: #FF0000 (Red)
- **Instagram**: #E4405F (Pink)
- **LinkedIn**: #0A66C2 (Blue)
- **Twitter**: #1DA1F2 (Sky Blue)
- **TikTok**: #000000 (Black)
- **Facebook**: #1877F2 (Blue)

### Status Colors
- **Connected**: Green (#10B981)
- **Disconnected**: Gray (#6B7280)
- **Error**: Red (#EF4444)

### Background Colors
- **Main Background**: Gradient (Gray-900 → Gray-800 → Gray-900)
- **Card Background**: Gray-800
- **Card Border**: Gray-700
- **Card Hover Border**: Gray-600

## Component Hierarchy

```
PlatformIntegrations (Main Component)
├── Header
│   ├── Title
│   └── Description
├── Platform Grid
│   ├── PlatformCard (YouTube)
│   │   ├── Header (Icon, Name, Status, Settings)
│   │   ├── Account Info (if connected)
│   │   ├── Error Message (if error)
│   │   └── Action Buttons
│   ├── PlatformCard (Instagram)
│   ├── PlatformCard (LinkedIn)
│   ├── PlatformCard (Twitter)
│   ├── PlatformCard (TikTok)
│   └── PlatformCard (Facebook)
└── SettingsModal (conditional)
    ├── Header (Icon, Name, Close)
    ├── Settings Form
    │   ├── Auto Post Toggle
    │   ├── Notifications Toggle
    │   └── Sync Frequency Selector
    └── Action Buttons (Cancel, Save)
```

## State Management

```
platforms: Platform[]
  ├── id: PlatformName
  ├── name: string
  ├── icon: string
  ├── color: string
  ├── status: ConnectionStatus
  ├── account: PlatformAccount | null
  │   ├── username: string
  │   ├── followers: number
  │   └── lastSync: Date | null
  └── isLoading: boolean

platformSettings: Record<PlatformName, PlatformSettings>
  └── [platformId]
      ├── autoPost: boolean
      ├── notifications: boolean
      └── syncFrequency: 'realtime' | 'hourly' | 'daily'

selectedPlatform: PlatformName | null
showSettingsModal: boolean
```

## Key Features Visualization

### 1. Connection Status Indicator
```
● Connected    (Green dot)
● Disconnected (Gray dot)
● Error        (Red dot)
```

### 2. Loading Spinner
```
⟳ (Rotating animation)
```

### 3. Settings Icon
```
⚙ (Gear icon, top-right of connected cards)
```

### 4. Toggle Switch
```
Off: ○─────●
On:  ●─────○
```

### 5. Number Formatting
```
1,234      → 1.2K
45,678     → 45.7K
1,234,567  → 1.2M
```

### 6. Time Formatting
```
< 1 minute  → Just now
< 60 minutes → Xm ago
< 24 hours   → Xh ago
≥ 24 hours   → Xd ago
```

This visual guide provides a comprehensive overview of the component's structure, states, and interactions.
