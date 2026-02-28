# LanguageSelector Component

## Overview

The `LanguageSelector` component is a modern, accessible language picker designed for the Content Intelligence Platform's vernacular support feature (Feature #24). It supports 9 Indian languages with native script previews, flag icons, and two layout modes.

## Features

✨ **9 Indian Languages**
- English, Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam

🎨 **Two Layout Modes**
- Grid: Visual language cards in a responsive grid
- Dropdown: Compact dropdown menu for space-constrained UIs

🌙 **Dark Mode Support**
- Fully styled for dark backgrounds with glassmorphism effects

📱 **Responsive Design**
- Mobile: 2 columns
- Tablet: 3 columns
- Desktop: 4-5 columns

♿ **Accessibility**
- ARIA labels and roles
- Keyboard navigation support
- Screen reader friendly

🎭 **Smooth Animations**
- Framer Motion powered transitions
- Hover effects and micro-interactions
- Can be disabled for reduced motion preferences

## Installation

The component is already integrated into the project. No additional installation needed.

**Dependencies:**
- `react` (already installed)
- `framer-motion` (already installed)

## Usage

### Basic Usage (Grid Layout)

```tsx
import LanguageSelector from '@/components/LanguageSelector'

export default function MyPage() {
  const handleLanguageSelect = (language) => {
    console.log('Selected language:', language)
    // Handle language selection (e.g., update state, call API)
  }

  return (
    <LanguageSelector
      onLanguageSelect={handleLanguageSelect}
      selectedLanguage="en"
    />
  )
}
```

### Dropdown Layout

```tsx
<LanguageSelector
  layout="dropdown"
  onLanguageSelect={handleLanguageSelect}
  selectedLanguage="hi"
  showPreview={true}
/>
```

### Without Preview

```tsx
<LanguageSelector
  layout="grid"
  onLanguageSelect={handleLanguageSelect}
  showPreview={false}
/>
```

### Without Animations

```tsx
<LanguageSelector
  onLanguageSelect={handleLanguageSelect}
  animated={false}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onLanguageSelect` | `(language: Language) => void` | `undefined` | Callback fired when a language is selected |
| `selectedLanguage` | `string` | `'en'` | Currently selected language code |
| `showPreview` | `boolean` | `true` | Show native script preview section |
| `animated` | `boolean` | `true` | Enable/disable animations |
| `layout` | `'grid' \| 'dropdown'` | `'grid'` | Layout mode for the selector |

## Language Object

```typescript
interface Language {
  code: string          // ISO 639-1 language code (e.g., 'hi', 'ta')
  name: string          // English name (e.g., 'Hindi', 'Tamil')
  nativeName: string    // Native script name (e.g., 'हिन्दी', 'தமிழ்')
  flag: string          // Flag emoji (e.g., '🇮🇳')
  sampleText: string    // Sample text in native script
}
```

## Supported Languages

| Code | Name | Native Name | Flag |
|------|------|-------------|------|
| `en` | English | English | 🇬🇧 |
| `hi` | Hindi | हिन्दी | 🇮🇳 |
| `bn` | Bengali | বাংলা | 🇮🇳 |
| `ta` | Tamil | தமிழ் | 🇮🇳 |
| `te` | Telugu | తెలుగు | 🇮🇳 |
| `mr` | Marathi | मराठी | 🇮🇳 |
| `gu` | Gujarati | ગુજરાતી | 🇮🇳 |
| `kn` | Kannada | ಕನ್ನಡ | 🇮🇳 |
| `ml` | Malayalam | മലയാളം | 🇮🇳 |

## Integration with Translation API

The component is designed to work seamlessly with the vernacular translation API:

```tsx
import LanguageSelector, { Language } from '@/components/LanguageSelector'
import apiClient from '@/services/api'

export default function TranslationPage() {
  const [selectedLang, setSelectedLang] = useState<Language | null>(null)
  const [content, setContent] = useState('')
  const [translatedContent, setTranslatedContent] = useState('')

  const handleLanguageSelect = async (language: Language) => {
    setSelectedLang(language)
    
    // Call translation API
    if (content) {
      try {
        const response = await apiClient.post('/api/vernacular/translate', {
          content,
          targetLanguage: language.code
        })
        setTranslatedContent(response.data.translatedContent)
      } catch (error) {
        console.error('Translation failed:', error)
      }
    }
  }

  return (
    <div>
      <LanguageSelector
        onLanguageSelect={handleLanguageSelect}
        selectedLanguage={selectedLang?.code || 'en'}
      />
      
      {/* Your content and translation UI */}
    </div>
  )
}
```

## Styling

The component uses TailwindCSS with the project's design system:

- **Colors**: Purple/Pink gradients for primary actions
- **Background**: Gray-800 with glassmorphism effects
- **Borders**: Gray-700 with hover states
- **Text**: White primary, Gray-400 secondary

### Custom Styling

You can wrap the component in a container with custom classes:

```tsx
<div className="max-w-4xl mx-auto p-6">
  <LanguageSelector onLanguageSelect={handleLanguageSelect} />
</div>
```

## Accessibility

The component follows WCAG 2.1 guidelines:

- ✅ Keyboard navigation (Tab, Enter, Escape)
- ✅ ARIA labels and roles
- ✅ Focus indicators
- ✅ Screen reader announcements
- ✅ Color contrast ratios meet AA standards

### Keyboard Shortcuts

**Grid Layout:**
- `Tab`: Navigate between language cards
- `Enter/Space`: Select language
- `Shift+Tab`: Navigate backwards

**Dropdown Layout:**
- `Tab`: Focus dropdown button
- `Enter/Space`: Open/close dropdown
- `↑/↓`: Navigate options (when open)
- `Enter`: Select option
- `Escape`: Close dropdown

## Performance

- **Lazy rendering**: Only visible elements are animated
- **Memoization**: Language data is static and not re-computed
- **Optimized animations**: Uses GPU-accelerated transforms
- **No external API calls**: All language data is local

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Examples

### Example 1: Content Translation Dashboard

```tsx
'use client'

import { useState } from 'react'
import LanguageSelector, { Language } from '@/components/LanguageSelector'

export default function TranslationDashboard() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null)

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">
          Content Translation
        </h1>
        
        <LanguageSelector
          onLanguageSelect={setSelectedLanguage}
          selectedLanguage={selectedLanguage?.code || 'en'}
          layout="grid"
          showPreview={true}
        />
        
        {selectedLanguage && (
          <div className="mt-8 p-6 bg-gray-800 rounded-lg">
            <p className="text-white">
              Selected: {selectedLanguage.name} ({selectedLanguage.nativeName})
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
```

### Example 2: Compact Sidebar Widget

```tsx
'use client'

import LanguageSelector from '@/components/LanguageSelector'

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-800 p-4">
      <h3 className="text-white font-semibold mb-4">Language</h3>
      
      <LanguageSelector
        layout="dropdown"
        showPreview={false}
        animated={false}
        onLanguageSelect={(lang) => {
          // Update app language
          localStorage.setItem('preferredLanguage', lang.code)
        }}
      />
    </aside>
  )
}
```

### Example 3: Multi-Step Form

```tsx
'use client'

import { useState } from 'react'
import LanguageSelector, { Language } from '@/components/LanguageSelector'

export default function ContentCreationWizard() {
  const [step, setStep] = useState(1)
  const [language, setLanguage] = useState<Language | null>(null)

  return (
    <div className="max-w-4xl mx-auto p-8">
      {step === 1 && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">
            Step 1: Choose Language
          </h2>
          
          <LanguageSelector
            onLanguageSelect={(lang) => {
              setLanguage(lang)
              setStep(2)
            }}
          />
        </div>
      )}
      
      {step === 2 && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">
            Step 2: Create Content
          </h2>
          <p className="text-gray-400">
            Creating content in {language?.name}...
          </p>
        </div>
      )}
    </div>
  )
}
```

## Testing

### Manual Testing Checklist

- [ ] All 9 languages display correctly
- [ ] Grid layout is responsive on mobile/tablet/desktop
- [ ] Dropdown opens and closes properly
- [ ] Selected language is highlighted
- [ ] Preview section updates when language changes
- [ ] Keyboard navigation works
- [ ] Animations are smooth
- [ ] Dark mode styling looks good
- [ ] Component works with and without callbacks

### Unit Testing (Future)

```typescript
// Example test structure
describe('LanguageSelector', () => {
  it('renders all 9 languages', () => {
    // Test implementation
  })
  
  it('calls onLanguageSelect when language is clicked', () => {
    // Test implementation
  })
  
  it('displays preview when showPreview is true', () => {
    // Test implementation
  })
})
```

## Troubleshooting

### Issue: Native scripts not displaying

**Solution**: Ensure your system has fonts installed for Indian languages. Most modern browsers include these by default.

### Issue: Animations are janky

**Solution**: Check if `framer-motion` is properly installed. Run `npm install framer-motion`.

### Issue: Dropdown not closing on outside click

**Solution**: This is expected behavior. The backdrop click handler should close it. Check for z-index conflicts.

## Future Enhancements

- [ ] Add language search/filter
- [ ] Support for more languages (Arabic, Chinese, etc.)
- [ ] Voice preview for each language
- [ ] RTL (Right-to-Left) support for Arabic/Hebrew
- [ ] Language detection from browser settings
- [ ] Favorite/recent languages section

## Related Components

- `CulturalSettings.tsx` - Cultural adaptation for regional content
- `ModeSelector.tsx` - Creator mode selection
- Translation API at `/api/vernacular/translate`

## Support

For issues or questions:
1. Check this documentation
2. Review the component source code
3. Check the FEATURES_MASTER.md for Feature #24 specifications
4. Contact the development team

---

**Last Updated**: 2024
**Component Version**: 1.0.0
**Feature**: #24 Vernacular Support
