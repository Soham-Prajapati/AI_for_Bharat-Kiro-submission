# LanguageSelector Integration Guide

## Quick Start

### 1. Import the Component

```tsx
import LanguageSelector, { Language } from '@/components/LanguageSelector'
```

### 2. Add to Your Page

```tsx
export default function MyPage() {
  const handleLanguageSelect = (language: Language) => {
    console.log('Selected:', language)
  }

  return (
    <LanguageSelector
      onLanguageSelect={handleLanguageSelect}
      selectedLanguage="en"
    />
  )
}
```

### 3. Done! 🎉

The component is fully self-contained and ready to use.

---

## Integration Scenarios

### Scenario 1: Content Translation Dashboard

**Use Case**: Allow users to select a target language for content translation.

**Implementation**:

```tsx
'use client'

import { useState } from 'react'
import LanguageSelector, { Language } from '@/components/LanguageSelector'
import apiClient from '@/services/api'

export default function TranslationDashboard() {
  const [selectedLang, setSelectedLang] = useState<Language | null>(null)
  const [content, setContent] = useState('')
  const [translatedContent, setTranslatedContent] = useState('')
  const [loading, setLoading] = useState(false)

  const handleTranslate = async () => {
    if (!selectedLang || !content) return

    setLoading(true)
    try {
      const response = await apiClient.post('/api/vernacular/translate', {
        content,
        targetLanguage: selectedLang.code,
        sourceLanguage: 'en'
      })
      
      setTranslatedContent(response.data.translatedContent)
    } catch (error) {
      console.error('Translation failed:', error)
      alert('Translation failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-4xl font-bold text-white mb-8">
        Content Translation
      </h1>

      {/* Language Selector */}
      <LanguageSelector
        onLanguageSelect={setSelectedLang}
        selectedLanguage={selectedLang?.code || 'en'}
        layout="grid"
        showPreview={true}
      />

      {/* Translation Interface */}
      <div className="mt-8 space-y-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter content to translate..."
          className="w-full h-40 bg-gray-800 text-white rounded-lg p-4 border border-gray-700"
        />

        <button
          onClick={handleTranslate}
          disabled={!selectedLang || !content || loading}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg disabled:opacity-50"
        >
          {loading ? 'Translating...' : 'Translate'}
        </button>

        {translatedContent && (
          <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
            <h3 className="text-white font-semibold mb-2">
              Translated Content ({selectedLang?.name})
            </h3>
            <p className="text-white">{translatedContent}</p>
          </div>
        )}
      </div>
    </div>
  )
}
```

---

### Scenario 2: User Settings / Preferences

**Use Case**: Allow users to set their preferred language in settings.

**Implementation**:

```tsx
'use client'

import { useState, useEffect } from 'react'
import LanguageSelector, { Language } from '@/components/LanguageSelector'

export default function SettingsPage() {
  const [language, setLanguage] = useState('en')

  // Load saved preference on mount
  useEffect(() => {
    const saved = localStorage.getItem('preferredLanguage')
    if (saved) setLanguage(saved)
  }, [])

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang.code)
    localStorage.setItem('preferredLanguage', lang.code)
    
    // Optionally update user profile via API
    // await apiClient.patch('/api/user/preferences', {
    //   language: lang.code
    // })
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">
          Language Preference
        </h2>
        
        <LanguageSelector
          layout="dropdown"
          selectedLanguage={language}
          onLanguageSelect={handleLanguageChange}
          showPreview={true}
        />

        <p className="mt-4 text-sm text-gray-400">
          This will be used as the default language for all content.
        </p>
      </div>
    </div>
  )
}
```

---

### Scenario 3: Multi-Platform Content Generation

**Use Case**: Select language before generating platform-specific content.

**Implementation**:

```tsx
'use client'

import { useState } from 'react'
import LanguageSelector, { Language } from '@/components/LanguageSelector'
import apiClient from '@/services/api'

export default function ContentGenerator() {
  const [language, setLanguage] = useState<Language | null>(null)
  const [platform, setPlatform] = useState<string>('')
  const [generatedContent, setGeneratedContent] = useState<any>(null)

  const handleGenerate = async () => {
    if (!language || !platform) return

    try {
      const response = await apiClient.post('/api/generate', {
        platform,
        language: language.code,
        // ... other parameters
      })
      
      setGeneratedContent(response.data)
    } catch (error) {
      console.error('Generation failed:', error)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-4xl font-bold text-white mb-8">
        Generate Content
      </h1>

      {/* Step 1: Select Language */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-4">
          1. Select Language
        </h2>
        <LanguageSelector
          onLanguageSelect={setLanguage}
          selectedLanguage={language?.code || 'en'}
          layout="grid"
        />
      </div>

      {/* Step 2: Select Platform */}
      {language && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">
            2. Select Platform
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {['YouTube', 'Instagram', 'LinkedIn'].map((p) => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className={`p-4 rounded-lg border-2 ${
                  platform === p
                    ? 'bg-purple-600 border-purple-400'
                    : 'bg-gray-800 border-gray-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Generate */}
      {language && platform && (
        <button
          onClick={handleGenerate}
          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg"
        >
          Generate Content
        </button>
      )}
    </div>
  )
}
```

---

### Scenario 4: Global App Context

**Use Case**: Make language selection available throughout the app.

**Implementation**:

**1. Create Language Context**:

```tsx
// context/LanguageContext.tsx
'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { Language } from '@/components/LanguageSelector'

interface LanguageContextType {
  language: Language | null
  setLanguage: (language: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language | null>(null)

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
```

**2. Wrap App with Provider**:

```tsx
// app/layout.tsx
import { LanguageProvider } from '@/context/LanguageContext'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
```

**3. Use in Components**:

```tsx
// Any component
'use client'

import { useLanguage } from '@/context/LanguageContext'
import LanguageSelector from '@/components/LanguageSelector'

export default function MyComponent() {
  const { language, setLanguage } = useLanguage()

  return (
    <div>
      <LanguageSelector
        onLanguageSelect={setLanguage}
        selectedLanguage={language?.code || 'en'}
      />
      
      {language && (
        <p>Current language: {language.name}</p>
      )}
    </div>
  )
}
```

---

## API Integration

### Translation API Endpoint

**Endpoint**: `POST /api/vernacular/translate`

**Request**:
```json
{
  "content": "Welcome to our platform",
  "targetLanguage": "hi",
  "sourceLanguage": "en"
}
```

**Response**:
```json
{
  "translatedContent": "हमारे प्लेटफॉर्म में आपका स्वागत है",
  "targetLanguage": "hi",
  "confidence": 0.95
}
```

**Integration Example**:

```tsx
import apiClient from '@/services/api'

async function translateContent(content: string, targetLang: string) {
  try {
    const response = await apiClient.post('/api/vernacular/translate', {
      content,
      targetLanguage: targetLang,
      sourceLanguage: 'en'
    })
    
    return response.data.translatedContent
  } catch (error) {
    console.error('Translation error:', error)
    throw error
  }
}

// Usage
const translated = await translateContent('Hello', 'hi')
console.log(translated) // "नमस्ते"
```

---

## State Management

### Option 1: Local State (Simple)

```tsx
const [language, setLanguage] = useState<Language | null>(null)
```

### Option 2: Context API (App-wide)

See "Scenario 4: Global App Context" above.

### Option 3: URL Parameters (Shareable)

```tsx
'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import LanguageSelector, { Language } from '@/components/LanguageSelector'

export default function MyPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const langCode = searchParams.get('lang') || 'en'

  const handleLanguageSelect = (language: Language) => {
    const params = new URLSearchParams(searchParams)
    params.set('lang', language.code)
    router.push(`?${params.toString()}`)
  }

  return (
    <LanguageSelector
      onLanguageSelect={handleLanguageSelect}
      selectedLanguage={langCode}
    />
  )
}
```

### Option 4: LocalStorage (Persistent)

```tsx
'use client'

import { useState, useEffect } from 'react'
import LanguageSelector, { Language } from '@/components/LanguageSelector'

export default function MyPage() {
  const [language, setLanguage] = useState('en')

  useEffect(() => {
    const saved = localStorage.getItem('preferredLanguage')
    if (saved) setLanguage(saved)
  }, [])

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang.code)
    localStorage.setItem('preferredLanguage', lang.code)
  }

  return (
    <LanguageSelector
      onLanguageSelect={handleLanguageSelect}
      selectedLanguage={language}
    />
  )
}
```

---

## Styling Customization

### Custom Container

```tsx
<div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-900 to-purple-900 rounded-2xl">
  <LanguageSelector onLanguageSelect={handleSelect} />
</div>
```

### Custom Theme Colors

The component uses TailwindCSS classes. To customize colors, wrap in a container with custom CSS variables:

```tsx
<div style={{
  '--color-primary': '#8b5cf6',
  '--color-secondary': '#ec4899'
}}>
  <LanguageSelector onLanguageSelect={handleSelect} />
</div>
```

---

## Performance Optimization

### 1. Lazy Loading

```tsx
import dynamic from 'next/dynamic'

const LanguageSelector = dynamic(
  () => import('@/components/LanguageSelector'),
  { ssr: false }
)
```

### 2. Memoization

```tsx
import { useMemo, useCallback } from 'react'

const handleLanguageSelect = useCallback((language: Language) => {
  // Handle selection
}, [])

const memoizedSelector = useMemo(() => (
  <LanguageSelector
    onLanguageSelect={handleLanguageSelect}
    selectedLanguage={language}
  />
), [language, handleLanguageSelect])
```

### 3. Disable Animations

```tsx
<LanguageSelector
  animated={false}
  onLanguageSelect={handleSelect}
/>
```

---

## Error Handling

### Handle Missing Callback

```tsx
<LanguageSelector
  onLanguageSelect={(lang) => {
    try {
      // Your logic
    } catch (error) {
      console.error('Language selection failed:', error)
      // Show error toast
    }
  }}
/>
```

### Handle API Errors

```tsx
const handleLanguageSelect = async (language: Language) => {
  try {
    await apiClient.post('/api/user/language', {
      language: language.code
    })
  } catch (error) {
    console.error('Failed to save language preference:', error)
    // Revert to previous language
    setLanguage(previousLanguage)
    // Show error message
    alert('Failed to save language preference')
  }
}
```

---

## Testing

### Unit Test Example

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import LanguageSelector from '@/components/LanguageSelector'

describe('LanguageSelector', () => {
  it('calls onLanguageSelect when language is clicked', () => {
    const handleSelect = jest.fn()
    
    render(
      <LanguageSelector
        onLanguageSelect={handleSelect}
        selectedLanguage="en"
      />
    )
    
    const hindiButton = screen.getByText('Hindi')
    fireEvent.click(hindiButton)
    
    expect(handleSelect).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'hi', name: 'Hindi' })
    )
  })
})
```

---

## Troubleshooting

### Issue: Component not rendering

**Solution**: Ensure you're using it in a Client Component (`'use client'` directive).

### Issue: Callback not firing

**Solution**: Check that `onLanguageSelect` prop is passed correctly.

### Issue: Styles not applying

**Solution**: Ensure TailwindCSS is configured to scan the components directory.

---

## Best Practices

1. ✅ Always provide `onLanguageSelect` callback
2. ✅ Use controlled component pattern with `selectedLanguage`
3. ✅ Store language preference in localStorage or database
4. ✅ Show loading state during API calls
5. ✅ Handle errors gracefully
6. ✅ Use dropdown layout for space-constrained UIs
7. ✅ Disable animations for performance-critical pages
8. ✅ Test with all 9 languages

---

## Related Documentation

- [LanguageSelector.README.md](./LanguageSelector.README.md) - Full component documentation
- [LanguageSelector.example.tsx](./LanguageSelector.example.tsx) - Usage examples
- [FEATURES_MASTER.md](../../docs/FEATURES_MASTER.md) - Feature #24 specifications

---

**Need Help?**

Check the examples in `LanguageSelector.example.tsx` or review the component source code.
