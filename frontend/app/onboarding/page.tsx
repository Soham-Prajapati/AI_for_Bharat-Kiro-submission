'use client'

import { useState } from 'react'
import ModeSelector from '@/components/ModeSelector'

type CreatorMode = 'ai-first' | 'hybrid' | 'human-first'

export default function OnboardingPage() {
  const [selectedMode, setSelectedMode] = useState<CreatorMode>()

  const handleModeSelect = (mode: CreatorMode) => {
    setSelectedMode(mode)
    console.log('Selected mode:', mode)
    // Here you would typically save to backend or local storage
  }

  const handleContinue = () => {
    if (selectedMode) {
      console.log('Continuing with mode:', selectedMode)
      // Navigate to next step or dashboard
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <div className="pt-12 pb-8 text-center">
        <div
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome to Content Intelligence Platform
          </h1>
          <p className="text-gray-400">
            Step 1 of 3: Choose your creator mode
          </p>
        </div>
      </div>

      {/* Mode Selector */}
      <ModeSelector 
        selectedMode={selectedMode}
        onModeSelect={handleModeSelect}
      />

      {/* Continue Button */}
      {selectedMode && (
        <div
          className="flex justify-center pb-20"
        >
          <button
            onClick={handleContinue}
            className="px-12 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-purple-500/50 transition-all"
          >
            Continue to Next Step →
          </button>
        </div>
      )}
    </div>
  )
}
