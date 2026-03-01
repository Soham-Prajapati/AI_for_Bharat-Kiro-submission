'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ============================================================================
// TYPES
// ============================================================================

export interface Language {
  code: string
  name: string
  nativeName: string
  flag: string
  sampleText: string
}

interface LanguageSelectorProps {
  onLanguageSelect?: (language: Language) => void
  selectedLanguage?: string
  showPreview?: boolean
  animated?: boolean
  layout?: 'grid' | 'dropdown'
}

// ============================================================================
// LANGUAGE DATA
// ============================================================================

const INDIAN_LANGUAGES: Language[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    sampleText: 'Welcome to our content platform'
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    sampleText: 'हमारे कंटेंट प्लेटफॉर्म में आपका स्वागत है'
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    flag: '🇮🇳',
    sampleText: 'আমাদের কন্টেন্ট প্ল্যাটফর্মে স্বাগতম'
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    flag: '🇮🇳',
    sampleText: 'எங்கள் உள்ளடக்க தளத்திற்கு வரவேற்கிறோம்'
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    flag: '🇮🇳',
    sampleText: 'మా కంటెంట్ ప్లాట్‌ఫారమ్‌కు స్వాగతం'
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    flag: '🇮🇳',
    sampleText: 'आमच्या सामग्री प्लॅटफॉर्मवर आपले स्वागत आहे'
  },
  {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    flag: '🇮🇳',
    sampleText: 'અમારા કન્ટેન્ટ પ્લેટફોર્મમાં આપનું સ્વાગત છે'
  },
  {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    flag: '🇮🇳',
    sampleText: 'ನಮ್ಮ ವಿಷಯ ವೇದಿಕೆಗೆ ಸ್ವಾಗತ'
  },
  {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    flag: '🇮🇳',
    sampleText: 'ഞങ്ങളുടെ ഉള്ളടക്ക പ്ലാറ്റ്ഫോമിലേക്ക് സ്വാഗതം'
  }
]

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function LanguageSelector({
  onLanguageSelect,
  selectedLanguage = 'en',
  showPreview = true,
  animated = true,
  layout = 'grid'
}: LanguageSelectorProps) {
  const [selected, setSelected] = useState<string>(selectedLanguage)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [hoveredLanguage, setHoveredLanguage] = useState<string | null>(null)

  // Update selected language when prop changes
  useEffect(() => {
    setSelected(selectedLanguage)
  }, [selectedLanguage])

  // Get language object by code
  const getLanguage = (code: string): Language => {
    return INDIAN_LANGUAGES.find(lang => lang.code === code) || INDIAN_LANGUAGES[0]
  }

  const selectedLang = getLanguage(selected)

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleLanguageSelect = (language: Language) => {
    setSelected(language.code)
    setIsDropdownOpen(false)
    if (onLanguageSelect) {
      onLanguageSelect(language)
    }
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  // ============================================================================
  // RENDER: GRID LAYOUT
  // ============================================================================

  if (layout === 'grid') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={animated ? { opacity: 0, y: -20 } : {}}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-white mb-2">
            🌐 Language Selection
          </h2>
          <p className="text-gray-400">
            Choose your preferred language for content translation and localization
          </p>
        </motion.div>

        {/* Language Grid */}
        <motion.div
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6"
          initial={animated ? { opacity: 0, y: 20 } : {}}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h3 className="text-xl font-semibold text-white mb-4">
            Select Language
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {INDIAN_LANGUAGES.map((language, index) => {
              const isSelected = selected === language.code
              const isHovered = hoveredLanguage === language.code

              return (
                <motion.button
                  key={language.code}
                  onClick={() => handleLanguageSelect(language)}
                  onMouseEnter={() => setHoveredLanguage(language.code)}
                  onMouseLeave={() => setHoveredLanguage(null)}
                  className={`
                    relative p-4 rounded-lg border-2 transition-all
                    ${isSelected
                      ? 'bg-gradient-to-br from-purple-600 to-pink-600 border-purple-400 shadow-lg'
                      : 'bg-gray-800/50 border-gray-700 hover:border-purple-500'
                    }
                  `}
                  initial={animated ? { opacity: 0, scale: 0.9 } : {}}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={`Select ${language.name}`}
                  aria-pressed={isSelected}
                >
                  {/* Selection indicator */}
                  {isSelected && (
                    <motion.div
                      className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      <span className="text-white text-xs">✓</span>
                    </motion.div>
                  )}

                  {/* Flag */}
                  <div className="text-4xl mb-2">{language.flag}</div>

                  {/* Language name */}
                  <div className="text-sm font-semibold text-white mb-1">
                    {language.name}
                  </div>

                  {/* Native name */}
                  <div className={`text-xs ${isSelected ? 'text-purple-100' : 'text-gray-400'}`}>
                    {language.nativeName}
                  </div>

                  {/* Hover effect */}
                  {isHovered && !isSelected && (
                    <motion.div
                      className="absolute inset-0 bg-purple-500/10 rounded-lg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Preview Section */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              className="bg-gradient-to-br from-purple-900/20 to-gray-800/50 backdrop-blur-sm rounded-xl border border-purple-800/30 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">
                  ✨ Language Preview
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{selectedLang.flag}</span>
                  <span className="text-sm text-gray-400">{selectedLang.name}</span>
                </div>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
                <div className="mb-3">
                  <span className="text-xs text-gray-500 uppercase tracking-wider">
                    Native Script
                  </span>
                </div>
                <motion.p
                  key={selected}
                  className="text-2xl text-white font-medium leading-relaxed"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {selectedLang.sampleText}
                </motion.p>
              </div>

              <div className="mt-4 flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <span>📝</span>
                  <span>Script: {selectedLang.nativeName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🗣️</span>
                  <span>Code: {selectedLang.code.toUpperCase()}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Footer */}
        <motion.div
          className="text-center text-sm text-gray-400"
          initial={animated ? { opacity: 0 } : {}}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p>
            💡 Content will be translated and culturally adapted for the selected language
          </p>
        </motion.div>
      </div>
    )
  }

  // ============================================================================
  // RENDER: DROPDOWN LAYOUT
  // ============================================================================

  return (
    <div className="relative">
      {/* Dropdown Button */}
      <motion.button
        onClick={toggleDropdown}
        className="flex items-center gap-3 px-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg hover:border-purple-500 transition-all"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        aria-label="Select language"
        aria-expanded={isDropdownOpen}
        aria-haspopup="listbox"
      >
        <span className="text-2xl">{selectedLang.flag}</span>
        <div className="flex-1 text-left">
          <div className="text-sm font-semibold text-white">{selectedLang.name}</div>
          <div className="text-xs text-gray-400">{selectedLang.nativeName}</div>
        </div>
        <motion.span
          className="text-gray-400"
          animate={{ rotate: isDropdownOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          ▼
        </motion.span>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isDropdownOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDropdownOpen(false)}
            />

            {/* Dropdown Content */}
            <motion.div
              className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-50 max-h-96 overflow-y-auto"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              role="listbox"
            >
              {INDIAN_LANGUAGES.map((language, index) => {
                const isSelected = selected === language.code

                return (
                  <motion.button
                    key={language.code}
                    onClick={() => handleLanguageSelect(language)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 transition-colors
                      ${isSelected
                        ? 'bg-purple-600/20 border-l-4 border-purple-500'
                        : 'hover:bg-gray-700/50'
                      }
                      ${index !== INDIAN_LANGUAGES.length - 1 ? 'border-b border-gray-700' : ''}
                    `}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <span className="text-2xl">{language.flag}</span>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-semibold text-white">
                        {language.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {language.nativeName}
                      </div>
                    </div>
                    {isSelected && (
                      <span className="text-green-400 text-lg">✓</span>
                    )}
                  </motion.button>
                )
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Preview Section for Dropdown */}
      <AnimatePresence>
        {showPreview && !isDropdownOpen && (
          <motion.div
            className="mt-4 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              Preview
            </div>
            <motion.p
              key={selected}
              className="text-lg text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {selectedLang.sampleText}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
