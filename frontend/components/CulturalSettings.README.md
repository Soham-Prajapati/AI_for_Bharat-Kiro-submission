# CulturalSettings Component

## Quick Start

```tsx
import CulturalSettings from '@/components/CulturalSettings'

export default function MyPage() {
  return <CulturalSettings />
}
```

## What It Does

Adapts content for different regional audiences by automatically replacing:
- 🎉 Festivals (Thanksgiving → Diwali)
- 💰 Currencies ($ → ₹)
- 📏 Measurements (miles → kilometers)
- 🔗 Cultural references (Super Bowl → IPL Finals)

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialContent` | `string` | `''` | Initial content to display |
| `onAdaptationComplete` | `function` | - | Callback when adaptation completes |
| `showPreview` | `boolean` | `true` | Show adapted content preview |
| `animated` | `boolean` | `true` | Enable animations |

## Examples

### Basic
```tsx
<CulturalSettings />
```

### With Content
```tsx
<CulturalSettings 
  initialContent="Join our Thanksgiving sale for $99!"
/>
```

### With Callback
```tsx
<CulturalSettings 
  onAdaptationComplete={(adaptation) => {
    console.log(adaptation.adaptedContent)
    // "Join our Diwali sale for ₹99!"
  }}
/>
```

## Direct API Usage

```tsx
import apiClient from '@/services/api'

// Adapt content
const result = await apiClient.cultural.adapt({
  content: 'Your content',
  targetRegion: 'india'
})

// Get regions
const regions = await apiClient.cultural.getRegions()
```

## Supported Regions

- 🇮🇳 India
- 🇬🇧 United Kingdom
- 🇺🇸 United States
- 🇨🇦 Canada
- 🇦🇺 Australia

## Features

- ✅ Real-time adaptation
- ✅ Automatic caching
- ✅ Loading states
- ✅ Error handling
- ✅ Changes breakdown
- ✅ Confidence scoring
- ✅ Responsive design

## Files

- `CulturalSettings.tsx` - Main component
- `CulturalSettings.INTEGRATION.md` - Detailed integration guide
- `CulturalSettings.example.tsx` - Working examples
- `CulturalSettings.REVIEW.md` - Implementation review

## API Endpoints

- `POST /api/cultural/adapt` - Adapt content
- `GET /api/cultural/regions` - Get available regions

## Need Help?

See `CulturalSettings.INTEGRATION.md` for comprehensive documentation and examples.
