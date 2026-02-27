# ModeSelector Integration Guide

This guide explains how to integrate the ModeSelector component into your Content Intelligence Platform.

## Files Created

1. **Component**: `frontend/components/ModeSelector.tsx`
   - Main component with three mode cards
   - Responsive design with animations
   - Accessibility features

2. **Example Pages**:
   - `frontend/app/onboarding/page.tsx` - Onboarding flow example
   - `frontend/app/demo/mode-selector/page.tsx` - Interactive demo

3. **Documentation**: `frontend/components/ModeSelector.README.md`

## Quick Start

### 1. Basic Usage

```tsx
import ModeSelector from '@/components/ModeSelector'
import { useState } from 'react'

function MyPage() {
  const [mode, setMode] = useState<'ai-first' | 'hybrid' | 'human-first'>()

  return (
    <ModeSelector 
      selectedMode={mode}
      onModeSelect={setMode}
    />
  )
}
```

### 2. With Backend Integration

```tsx
import ModeSelector from '@/components/ModeSelector'
import { useState, useEffect } from 'react'

function OnboardingPage() {
  const [mode, setMode] = useState<'ai-first' | 'hybrid' | 'human-first'>()

  // Load saved mode
  useEffect(() => {
    const savedMode = localStorage.getItem('creatorMode')
    if (savedMode) setMode(savedMode as any)
  }, [])

  const handleModeSelect = async (newMode) => {
    setMode(newMode)
    
    // Save to localStorage
    localStorage.setItem('creatorMode', newMode)
    
    // Save to backend
    await fetch('/api/user/preferences', {
      method: 'POST',
      body: JSON.stringify({ creatorMode: newMode })
    })
  }

  return <ModeSelector selectedMode={mode} onModeSelect={handleModeSelect} />
}
```

### 3. In Settings Page

```tsx
import ModeSelector from '@/components/ModeSelector'

function SettingsPage() {
  const { user, updateUser } = useUser()

  return (
    <div>
      <h2>Creator Mode Settings</h2>
      <ModeSelector 
        selectedMode={user.creatorMode}
        onModeSelect={(mode) => updateUser({ creatorMode: mode })}
      />
    </div>
  )
}
```

## Integration Points

### 1. Onboarding Flow
Add to the onboarding process after user signup:
- Step 1: Account creation
- **Step 2: Mode selection** ← Add ModeSelector here
- Step 3: Platform connections
- Step 4: First content upload

### 2. Settings Page
Allow users to change their mode anytime:
```
Settings > Preferences > Creator Mode
```

### 3. Dashboard
Show current mode with option to change:
```tsx
<div className="dashboard-header">
  <p>Current Mode: {user.creatorMode}</p>
  <button onClick={() => setShowModeSelector(true)}>
    Change Mode
  </button>
</div>
```

## Backend Schema

Add to your user model:

```typescript
interface User {
  // ... existing fields
  creatorMode: 'ai-first' | 'hybrid' | 'human-first'
  creatorModeSelectedAt: Date
}
```

## API Endpoints

### Save Mode Selection
```
POST /api/user/preferences
Body: { creatorMode: 'hybrid' }
```

### Get User Preferences
```
GET /api/user/preferences
Response: { creatorMode: 'hybrid', ... }
```

## Feature Flags by Mode

Use the selected mode to enable/disable features:

```typescript
const features = {
  'ai-first': {
    aiScriptGeneration: true,
    aiVoiceover: true,
    aiBroll: true,
    aiThumbnails: true,
    manualUpload: false
  },
  'hybrid': {
    aiScriptGeneration: false,
    aiVoiceover: false,
    aiBroll: false,
    aiThumbnails: true,
    manualUpload: true,
    aiTranscription: true,
    aiCaptions: true,
    aiTranslation: true
  },
  'human-first': {
    aiScriptGeneration: false,
    aiVoiceover: false,
    aiBroll: false,
    aiThumbnails: false,
    manualUpload: true,
    aiTranslation: true,
    aiSeoSuggestions: true
  }
}

// Usage
const userFeatures = features[user.creatorMode]
if (userFeatures.aiScriptGeneration) {
  // Show AI script generation UI
}
```

## Analytics Tracking

Track mode selection and usage:

```typescript
// On mode selection
analytics.track('Creator Mode Selected', {
  mode: selectedMode,
  previousMode: user.creatorMode,
  timestamp: new Date()
})

// Track feature usage by mode
analytics.track('Feature Used', {
  feature: 'ai-transcription',
  creatorMode: user.creatorMode
})
```

## Testing

### View Demo Page
```bash
npm run dev
# Visit: http://localhost:3000/demo/mode-selector
```

### View Onboarding Example
```bash
# Visit: http://localhost:3000/onboarding
```

## Customization

### Change Colors
Edit the `gradient` property in `modes` array:
```typescript
{
  id: 'ai-first',
  gradient: 'from-purple-500 to-blue-500' // Change these
}
```

### Add/Remove Benefits
Edit the `benefits` array for each mode:
```typescript
{
  id: 'hybrid',
  benefits: [
    'Upload your own content',
    'AI transcription & captions',
    // Add more benefits here
  ]
}
```

### Change Recommended Mode
Move the `recommended: true` flag to a different mode:
```typescript
{
  id: 'ai-first',
  recommended: true // Make AI-First recommended instead
}
```

## Accessibility

The component includes:
- ✓ Keyboard navigation (Tab, Enter, Space)
- ✓ ARIA labels (`aria-label`, `aria-pressed`)
- ✓ High contrast text (WCAG AA compliant)
- ✓ Large touch targets (48px minimum)
- ✓ Focus indicators

## Browser Support

- Chrome/Edge: ✓ Full support
- Firefox: ✓ Full support
- Safari: ✓ Full support
- Mobile browsers: ✓ Full support

## Dependencies

Required packages (already in package.json):
- `framer-motion`: ^10.x
- `react`: ^18.x
- `tailwindcss`: ^3.x

## Next Steps

1. ✅ Component created
2. ✅ Demo pages created
3. ✅ Documentation written
4. ⏳ Add to onboarding flow
5. ⏳ Add to settings page
6. ⏳ Implement backend API
7. ⏳ Add analytics tracking
8. ⏳ Test with real users

## Support

For questions or issues:
- See: `frontend/components/ModeSelector.README.md`
- Demo: `http://localhost:3000/demo/mode-selector`
- Example: `frontend/app/onboarding/page.tsx`
