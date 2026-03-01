# LanguageSelector - Quick Start Guide

Get up and running with the LanguageSelector component in 5 minutes! 🚀

---

## 1. Basic Usage (30 seconds)

```tsx
'use client'

import LanguageSelector from '@/components/LanguageSelector'

export default function MyPage() {
  return (
    <LanguageSelector
      onLanguageSelect={(language) => {
        console.log('Selected:', language.name)
      }}
    />
  )
}
```

**That's it!** The component is fully functional with default settings.

---

## 2. With State Management (1 minute)

```tsx
'use client'

import { useState } from 'react'
import LanguageSelector, { Language } from '@/components/LanguageSelector'

export default function MyPage() {
  const [language, setLanguage] = useState<Language | null>(null)

  return (
    <div>
      <LanguageSelector
        onLanguageSelect={setLanguage}
        selectedLanguage={language?.code || 'en'}
      />
      
      {language && (
        <p>You selected: {language.name}</p>
      )}
    </div>
  )
}
```

---

## 3. Dropdown Layout (1 minute)

Perfect for sidebars or compact spaces:

```tsx
<LanguageSelector
  layout="dropdown"
  onLanguageSelect={(lang) => console.log(lang)}
  selectedLanguage="en"
/>
```

---

## 4. Without Preview (30 seconds)

Hide the preview section to save space:

```tsx
<LanguageSelector
  showPreview={false}
  onLanguageSelect={(lang) => console.log(lang)}
/>
```

---

## 5. Translation Integration (2 minutes)

Connect to the translation API:

```tsx
'use client'

import { useState } from 'react'
import LanguageSelector, { Language } from '@/components/LanguageSelector'
import apiClient from '@/services/api'

export default function TranslationPage() {
  const [language, setLanguage] = useState<Language | null>(null)
  const [content, setContent] = useState('')
  const [translated, setTranslated] = useState('')

  const handleTranslate = async () => {
    if (!language || !content) return

    const response = await apiClient.post('/api/vernacular/translate', {
      content,
      targetLanguage: language.code
    })
    
    setTranslated(response.data.translatedContent)
  }

  return (
    <div className="p-8">
      <LanguageSelector
        onLanguageSelect={setLanguage}
        selectedLanguage={language?.code || 'en'}
      />
      
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Enter text to translate..."
        className="w-full mt-4 p-4 bg-gray-800 text-white rounded-lg"
      />
      
      <button
        onClick={handleTranslate}
        className="mt-4 px-6 py-3 bg-purple-600 text-white rounded-lg"
      >
        Translate
      </button>
      
      {translated && (
        <div className="mt-4 p-4 bg-gray-800 rounded-lg">
          <p className="text-white">{translated}</p>
        </div>
      )}
    </div>
  )
}
```

---

## Common Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onLanguageSelect` | `function` | - | Callback when language is selected |
| `selectedLanguage` | `string` | `'en'` | Current language code |
| `layout` | `'grid' \| 'dropdown'` | `'grid'` | Layout mode |
| `showPreview` | `boolean` | `true` | Show preview section |
| `animated` | `boolean` | `true` | Enable animations |

---

## Supported Languages

- 🇬🇧 English (`en`)
- 🇮🇳 Hindi (`hi`) - हिन्दी
- 🇮🇳 Bengali (`bn`) - বাংলা
- 🇮🇳 Tamil (`ta`) - தமிழ்
- 🇮🇳 Telugu (`te`) - తెలుగు
- 🇮🇳 Marathi (`mr`) - मराठी
- 🇮🇳 Gujarati (`gu`) - ગુજરાતી
- 🇮🇳 Kannada (`kn`) - ಕನ್ನಡ
- 🇮🇳 Malayalam (`ml`) - മലയാളം

---

## Tips & Tricks

### 💡 Tip 1: Save to LocalStorage

```tsx
const handleLanguageSelect = (lang: Language) => {
  localStorage.setItem('preferredLanguage', lang.code)
  setLanguage(lang)
}
```

### 💡 Tip 2: Load Saved Preference

```tsx
useEffect(() => {
  const saved = localStorage.getItem('preferredLanguage')
  if (saved) setLanguage(saved)
}, [])
```

### 💡 Tip 3: Use in URL Parameters

```tsx
const searchParams = useSearchParams()
const langCode = searchParams.get('lang') || 'en'

<LanguageSelector
  selectedLanguage={langCode}
  onLanguageSelect={(lang) => {
    router.push(`?lang=${lang.code}`)
  }}
/>
```

### 💡 Tip 4: Disable Animations for Performance

```tsx
<LanguageSelector animated={false} />
```

---

## Next Steps

1. ✅ Read [LanguageSelector.README.md](./LanguageSelector.README.md) for full documentation
2. ✅ Check [LanguageSelector.example.tsx](./LanguageSelector.example.tsx) for more examples
3. ✅ Review [LanguageSelector.INTEGRATION.md](./LanguageSelector.INTEGRATION.md) for integration patterns
4. ✅ See [LanguageSelector.VISUAL_GUIDE.md](./LanguageSelector.VISUAL_GUIDE.md) for design specs

---

## Need Help?

- Check the examples in `LanguageSelector.example.tsx`
- Review the component source code
- Read the full documentation in `LanguageSelector.README.md`

---

**You're all set!** 🎉

Start using the LanguageSelector component in your project now.
