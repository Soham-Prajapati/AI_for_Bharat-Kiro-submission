'use client'

/**
 * LanguageSelector Component - Usage Examples
 * 
 * This file demonstrates various ways to use the LanguageSelector component
 * in different scenarios and configurations.
 */

import { useState } from 'react'
import LanguageSelector, { Language } from './LanguageSelector'

// ============================================================================
// EXAMPLE 1: Basic Grid Layout
// ============================================================================

export function BasicGridExample() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null)

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <LanguageSelector
          onLanguageSelect={setSelectedLanguage}
          selectedLanguage={selectedLanguage?.code || 'en'}
          layout="grid"
          showPreview={true}
          animated={true}
        />

        {/* Display selected language info */}
        {selectedLanguage && (
          <div className="mt-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">
              Selected Language Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Code:</span>
                <span className="text-white ml-2">{selectedLanguage.code}</span>
              </div>
              <div>
                <span className="text-gray-400">Name:</span>
                <span className="text-white ml-2">{selectedLanguage.name}</span>
              </div>
              <div>
                <span className="text-gray-400">Native Name:</span>
                <span className="text-white ml-2">{selectedLanguage.nativeName}</span>
              </div>
              <div>
                <span className="text-gray-400">Flag:</span>
                <span className="text-2xl ml-2">{selectedLanguage.flag}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// EXAMPLE 2: Dropdown Layout (Compact)
// ============================================================================

export function DropdownExample() {
  const [language, setLanguage] = useState('en')

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6">
          Compact Language Selector
        </h2>

        <LanguageSelector
          layout="dropdown"
          selectedLanguage={language}
          onLanguageSelect={(lang) => setLanguage(lang.code)}
          showPreview={true}
          animated={true}
        />

        <div className="mt-6 p-4 bg-gray-800 rounded-lg">
          <p className="text-gray-400 text-sm">
            Current language code: <span className="text-white font-mono">{language}</span>
          </p>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// EXAMPLE 3: Integration with Translation API
// ============================================================================

export function TranslationIntegrationExample() {
  const [selectedLang, setSelectedLang] = useState<Language | null>(null)
  const [sourceText, setSourceText] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [loading, setLoading] = useState(false)

  const handleTranslate = async () => {
    if (!selectedLang || !sourceText) return

    setLoading(true)
    try {
      // Simulate API call
      // In production, replace with actual API call:
      // const response = await apiClient.post('/api/vernacular/translate', {
      //   content: sourceText,
      //   targetLanguage: selectedLang.code
      // })
      
      await new Promise(resolve => setTimeout(resolve, 1500))
      setTranslatedText(`[Translated to ${selectedLang.name}]: ${sourceText}`)
    } catch (error) {
      console.error('Translation failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">
          Content Translation Demo
        </h1>

        {/* Language Selector */}
        <LanguageSelector
          onLanguageSelect={setSelectedLang}
          selectedLanguage={selectedLang?.code || 'en'}
          layout="grid"
          showPreview={true}
        />

        {/* Translation Interface */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Source Text */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              Source Text (English)
            </h3>
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Enter text to translate..."
              className="w-full h-40 bg-gray-900 text-white rounded-lg p-4 border border-gray-700 focus:border-purple-500 focus:outline-none resize-none"
            />
          </div>

          {/* Translated Text */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              Translated Text {selectedLang && `(${selectedLang.name})`}
            </h3>
            <div className="w-full h-40 bg-gray-900 text-white rounded-lg p-4 border border-gray-700 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <span className="text-gray-400">Translating...</span>
                </div>
              ) : translatedText ? (
                <p>{translatedText}</p>
              ) : (
                <p className="text-gray-500">Translation will appear here...</p>
              )}
            </div>
          </div>
        </div>

        {/* Translate Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleTranslate}
            disabled={!selectedLang || !sourceText || loading}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
          >
            {loading ? 'Translating...' : 'Translate Content'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// EXAMPLE 4: Multi-Step Content Creation Wizard
// ============================================================================

export function WizardExample() {
  const [step, setStep] = useState(1)
  const [language, setLanguage] = useState<Language | null>(null)
  const [contentType, setContentType] = useState('')

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang)
    setStep(2)
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-8 flex items-center justify-center gap-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  s === step
                    ? 'bg-purple-600 text-white'
                    : s < step
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                {s < step ? '✓' : s}
              </div>
              {s < 3 && (
                <div
                  className={`w-16 h-1 ${
                    s < step ? 'bg-green-600' : 'bg-gray-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Language Selection */}
        {step === 1 && (
          <div>
            <h2 className="text-3xl font-bold text-white mb-6 text-center">
              Step 1: Choose Your Language
            </h2>
            <LanguageSelector
              onLanguageSelect={handleLanguageSelect}
              layout="grid"
              showPreview={true}
            />
          </div>
        )}

        {/* Step 2: Content Type */}
        {step === 2 && (
          <div>
            <h2 className="text-3xl font-bold text-white mb-6 text-center">
              Step 2: Select Content Type
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {['Video', 'Audio', 'Text', 'Image'].map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setContentType(type)
                    setStep(3)
                  }}
                  className="p-6 bg-gray-800 border border-gray-700 rounded-lg hover:border-purple-500 transition-all"
                >
                  <div className="text-4xl mb-2">
                    {type === 'Video' && '🎥'}
                    {type === 'Audio' && '🎵'}
                    {type === 'Text' && '📝'}
                    {type === 'Image' && '🖼️'}
                  </div>
                  <div className="text-white font-semibold">{type}</div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(1)}
              className="mt-6 px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
            >
              ← Back
            </button>
          </div>
        )}

        {/* Step 3: Summary */}
        {step === 3 && (
          <div>
            <h2 className="text-3xl font-bold text-white mb-6 text-center">
              Step 3: Review & Create
            </h2>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">
                Your Selections
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{language?.flag}</span>
                  <div>
                    <div className="text-white font-semibold">
                      Language: {language?.name}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {language?.nativeName}
                    </div>
                  </div>
                </div>
                <div className="text-white">
                  Content Type: <span className="font-semibold">{contentType}</span>
                </div>
              </div>
              <div className="mt-6 flex gap-4">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                >
                  ← Back
                </button>
                <button
                  onClick={() => alert('Content creation started!')}
                  className="flex-1 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg"
                >
                  Create Content
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// EXAMPLE 5: Sidebar Widget (Minimal)
// ============================================================================

export function SidebarWidgetExample() {
  const [language, setLanguage] = useState('en')

  return (
    <div className="flex min-h-screen bg-gray-900">
      {/* Sidebar */}
      <aside className="w-80 bg-gray-800 border-r border-gray-700 p-6">
        <h2 className="text-xl font-bold text-white mb-6">Settings</h2>

        <div className="space-y-6">
          {/* Language Setting */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Language Preference
            </h3>
            <LanguageSelector
              layout="dropdown"
              selectedLanguage={language}
              onLanguageSelect={(lang) => {
                setLanguage(lang.code)
                localStorage.setItem('preferredLanguage', lang.code)
              }}
              showPreview={false}
              animated={false}
            />
          </div>

          {/* Other Settings */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Other Settings
            </h3>
            <div className="space-y-2">
              <div className="p-3 bg-gray-900 rounded-lg text-gray-400 text-sm">
                Theme: Dark
              </div>
              <div className="p-3 bg-gray-900 rounded-lg text-gray-400 text-sm">
                Notifications: On
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-white mb-4">
          Dashboard
        </h1>
        <p className="text-gray-400">
          Current language: <span className="text-white font-mono">{language}</span>
        </p>
      </main>
    </div>
  )
}

// ============================================================================
// EXAMPLE 6: Without Animations (Performance Mode)
// ============================================================================

export function PerformanceModeExample() {
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">
          Performance Mode (No Animations)
        </h1>
        
        <LanguageSelector
          onLanguageSelect={(lang) => console.log('Selected:', lang)}
          animated={false}
          layout="grid"
        />
      </div>
    </div>
  )
}

// ============================================================================
// DEFAULT EXPORT: All Examples in Tabs
// ============================================================================

export default function LanguageSelectorExamples() {
  const [activeExample, setActiveExample] = useState('basic')

  const examples = [
    { id: 'basic', label: 'Basic Grid', component: BasicGridExample },
    { id: 'dropdown', label: 'Dropdown', component: DropdownExample },
    { id: 'translation', label: 'Translation', component: TranslationIntegrationExample },
    { id: 'wizard', label: 'Wizard', component: WizardExample },
    { id: 'sidebar', label: 'Sidebar', component: SidebarWidgetExample },
    { id: 'performance', label: 'Performance', component: PerformanceModeExample },
  ]

  const ActiveComponent = examples.find(ex => ex.id === activeExample)?.component || BasicGridExample

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Tab Navigation */}
      <div className="bg-gray-800 border-b border-gray-700 px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-4">
            LanguageSelector Examples
          </h1>
          <div className="flex gap-2 overflow-x-auto">
            {examples.map((example) => (
              <button
                key={example.id}
                onClick={() => setActiveExample(example.id)}
                className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  activeExample === example.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {example.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Example */}
      <ActiveComponent />
    </div>
  )
}
