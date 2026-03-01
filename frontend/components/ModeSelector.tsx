'use client'

import { useState } from 'react'

type CreatorMode = 'ai-first' | 'hybrid' | 'human-first'

interface ModeSelectorProps {
  selectedMode?: CreatorMode
  onModeSelect: (mode: CreatorMode) => void
}

interface ModeCardData {
  id: CreatorMode
  icon: string
  title: string
  subtitle: string
  description: string
  benefits: string[]
  timeSaved: string
  gradient: string
  recommended?: boolean
}

const modes: ModeCardData[] = [
  {
    id: 'ai-first',
    icon: '🤖',
    title: 'AI-First',
    subtitle: 'Full Automation',
    description: 'Let AI handle everything from script to final content',
    benefits: [
      'AI generates scripts & voiceovers',
      'Automatic B-roll selection',
      'AI-created thumbnails',
      'Platform-optimized content',
      'Instant multi-platform export'
    ],
    timeSaved: '95% time saved',
    gradient: 'from-purple-500 to-blue-500'
  },
  {
    id: 'hybrid',
    icon: '🤝',
    title: 'Hybrid',
    subtitle: 'AI-Assisted',
    description: 'You create, AI enhances and optimizes',
    benefits: [
      'Upload your own content',
      'AI transcription & captions',
      'Multi-language translation',
      'SEO optimization',
      'Smart content repurposing'
    ],
    timeSaved: '80% time saved',
    gradient: 'from-pink-500 to-purple-500',
    recommended: true
  },
  {
    id: 'human-first',
    icon: '👤',
    title: 'Human-First',
    subtitle: 'Minimal AI',
    description: 'Full creative control with AI assistance',
    benefits: [
      'Complete creative control',
      'AI translation only',
      'SEO suggestions',
      'Analytics insights',
      'Manual approval workflow'
    ],
    timeSaved: '40% time saved',
    gradient: 'from-cyan-500 to-green-500'
  }
]

export default function ModeSelector({ selectedMode, onModeSelect }: ModeSelectorProps) {
  const [hoveredMode, setHoveredMode] = useState<CreatorMode | null>(null)

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      <div className="max-w-7xl mx-auto">
        <div
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
            Choose Your Creator Mode
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Select the workflow that matches your content creation style
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {modes.map((mode, index) => {
            const isSelected = selectedMode === mode.id
            const isHovered = hoveredMode === mode.id

            return (
              <div
                key={mode.id}
                className="relative"
                onHoverStart={() => setHoveredMode(mode.id)}
                onHoverEnd={() => setHoveredMode(null)}
              >
                {/* Recommended Badge */}
                {mode.recommended && (
                  <div
                    className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20"
                  >
                    <span className="inline-block px-4 py-1 text-sm font-semibold text-white bg-gradient-to-r from-pink-500 to-purple-500 rounded-full shadow-lg">
                      ⭐ Recommended
                    </span>
                  </div>
                )}

                {/* Card */}
                <div
                  className={`
                    relative h-full p-8 rounded-2xl backdrop-blur-sm transition-all duration-300
                    ${isSelected 
                      ? 'bg-gray-800 border-2 shadow-2xl' 
                      : 'bg-gray-800/50 border border-gray-700 hover:border-gray-600'
                    }
                  `}
                  style={{
                    borderColor: isSelected ? `rgb(168, 85, 247)` : undefined,
                    boxShadow: isSelected ? '0 0 40px rgba(168, 85, 247, 0.4)' : undefined
                  }}
                >
                  {/* Gradient overlay */}
                  <div 
                    className={`absolute inset-0 bg-gradient-to-br ${mode.gradient} opacity-0 ${isHovered || isSelected ? 'opacity-10' : ''} rounded-2xl transition-opacity duration-300`}
                  />

                  {/* Glowing border effect for selected */}
                  {isSelected && (
                    <div
                      className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${mode.gradient} opacity-20 blur-xl`}
                      style={{ zIndex: -1 }}
                    />
                  )}

                  <div className="relative z-10">
                    {/* Icon */}
                    <div 
                      className="text-6xl mb-4"
                    >
                      {mode.icon}
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold mb-1 text-white">
                      {mode.title}
                    </h3>
                    <p className={`text-sm font-semibold mb-3 bg-gradient-to-r ${mode.gradient} bg-clip-text text-transparent`}>
                      {mode.subtitle}
                    </p>

                    {/* Description */}
                    <p className="text-gray-400 mb-6 leading-relaxed">
                      {mode.description}
                    </p>

                    {/* Time Saved Badge */}
                    <div className="inline-block px-3 py-1 mb-6 text-sm font-semibold text-purple-300 bg-purple-900/50 rounded-full border border-purple-500/30">
                      ⚡ {mode.timeSaved}
                    </div>

                    {/* Benefits List */}
                    <ul className="space-y-3 mb-8">
                      {mode.benefits.map((benefit, idx) => (
                        <li
                          key={idx}
                          className="flex items-start text-gray-300 text-sm"
                        >
                          <span className="text-green-400 mr-2 mt-0.5">✓</span>
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </ul>

                    {/* Select Button */}
                    <button
                      onClick={() => onModeSelect(mode.id)}
                      className={`
                        w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300
                        ${isSelected
                          ? `bg-gradient-to-r ${mode.gradient} text-white shadow-lg`
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }
                      `}
                      aria-label={`Select ${mode.title} mode`}
                      aria-pressed={isSelected}
                    >
                      {isSelected ? '✓ Selected' : 'Select Mode'}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Info Footer */}
        <div
          className="mt-12 text-center"
        >
          <p className="text-gray-400 text-sm">
            💡 You can change your creator mode anytime in settings
          </p>
        </div>
      </div>
    </section>
  )
}
