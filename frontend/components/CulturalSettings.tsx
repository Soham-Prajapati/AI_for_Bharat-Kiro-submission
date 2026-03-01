'use client'

import { useState, useEffect } from 'react'
import apiClient from '@/services/api'
import { CulturalAdaptation, CulturalChange } from '@/types/api'

// ============================================================================
// TYPES
// ============================================================================

interface CulturalSettingsProps {
  initialContent?: string
  onAdaptationComplete?: (adaptation: CulturalAdaptation) => void
  showPreview?: boolean
  animated?: boolean
}

interface AdaptationCache {
  [key: string]: CulturalAdaptation
}

// ============================================================================
// REGION METADATA
// ============================================================================

const REGION_INFO: Record<string, { flag: string; name: string; description: string }> = {
  india: {
    flag: '🇮🇳',
    name: 'India',
    description: 'Adapt content for Indian audiences with local festivals, currency, and references'
  },
  uk: {
    flag: '🇬🇧',
    name: 'United Kingdom',
    description: 'Adapt content for UK audiences with British English and local references'
  },
  us: {
    flag: '🇺🇸',
    name: 'United States',
    description: 'Standard US English content (default)'
  },
  canada: {
    flag: '🇨🇦',
    name: 'Canada',
    description: 'Adapt content for Canadian audiences'
  },
  australia: {
    flag: '🇦🇺',
    name: 'Australia',
    description: 'Adapt content for Australian audiences'
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getCacheKey(content: string, region: string): string {
  return `${region}:${content.substring(0, 100)}`
}

function getChangeIcon(type: CulturalChange['type']): string {
  const icons = {
    idiom: '💬',
    festival: '🎉',
    currency: '💰',
    measurement: '📏',
    reference: '🔗'
  }
  return icons[type] || '✏️'
}

function getChangeColor(type: CulturalChange['type']): string {
  const colors = {
    idiom: '#8b5cf6',
    festival: '#ec4899',
    currency: '#10b981',
    measurement: '#3b82f6',
    reference: '#f59e0b'
  }
  return colors[type] || '#6b7280'
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CulturalSettings({
  initialContent = '',
  onAdaptationComplete,
  showPreview = true,
  animated = true
}: CulturalSettingsProps) {
  // State
  const [content, setContent] = useState(initialContent)
  const [selectedRegion, setSelectedRegion] = useState<string>('us')
  const [availableRegions, setAvailableRegions] = useState<string[]>([])
  const [adaptation, setAdaptation] = useState<CulturalAdaptation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cache, setCache] = useState<AdaptationCache>({})
  const [loadingRegions, setLoadingRegions] = useState(true)

  // Load available regions on mount
  useEffect(() => {
    loadRegions()
  }, [])

  // Update content when initialContent changes
  useEffect(() => {
    setContent(initialContent)
  }, [initialContent])

  // ============================================================================
  // API CALLS
  // ============================================================================

  const loadRegions = async () => {
    try {
      setLoadingRegions(true)
      const response = await apiClient.cultural.getRegions()
      setAvailableRegions(response.regions)
    } catch (err: any) {
      console.error('Failed to load regions:', err)
      setError('Failed to load available regions')
      // Fallback to default regions
      setAvailableRegions(['india', 'uk', 'us', 'canada', 'australia'])
    } finally {
      setLoadingRegions(false)
    }
  }

  const adaptContent = async (targetRegion: string) => {
    if (!content.trim()) {
      setError('Please enter content to adapt')
      return
    }

    // Check cache first
    const cacheKey = getCacheKey(content, targetRegion)
    if (cache[cacheKey]) {
      setAdaptation(cache[cacheKey])
      if (onAdaptationComplete) {
        onAdaptationComplete(cache[cacheKey])
      }
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await apiClient.cultural.adapt({
        content,
        targetRegion
      })

      setAdaptation(response.adaptation)

      // Update cache
      setCache(prev => ({
        ...prev,
        [cacheKey]: response.adaptation
      }))

      if (onAdaptationComplete) {
        onAdaptationComplete(response.adaptation)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to adapt content')
      console.error('Cultural adaptation error:', err)
    } finally {
      setLoading(false)
    }
  }

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region)
    if (content.trim()) {
      adaptContent(region)
    }
  }

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    setAdaptation(null) // Clear adaptation when content changes
  }

  const handleAdaptClick = () => {
    adaptContent(selectedRegion)
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        initial={animated ? { opacity: 0, y: -20 } : {}}
      >
        <h2 className="text-3xl font-bold text-white mb-2">
          🌍 Cultural Adaptation
        </h2>
        <p className="text-gray-400">
          Adapt your content for different regional audiences with culturally relevant references
        </p>
      </div>

      {/* Region Selection */}
      <div
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6"
        initial={animated ? { opacity: 0, y: 20 } : {}}
      >
        <h3 className="text-xl font-semibold text-white mb-4">
          Select Target Region
        </h3>

        {loadingRegions ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-24 bg-gray-700 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {availableRegions.map((region, index) => {
              const info = REGION_INFO[region] || {
                flag: '🌐',
                name: region.charAt(0).toUpperCase() + region.slice(1),
                description: `Adapt content for ${region}`
              }

              return (
                <button
                  key={region}
                  onClick={() => handleRegionChange(region)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedRegion === region
                      ? 'bg-purple-600 border-purple-400'
                      : 'bg-gray-800/50 border-gray-700 hover:border-purple-500'
                  }`}
                  initial={animated ? { opacity: 0, scale: 0.9 } : {}}
                  title={info.description}
                >
                  <div className="text-3xl mb-2">{info.flag}</div>
                  <div className="text-sm font-semibold text-white">
                    {info.name}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Content Input */}
      <div
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6"
        initial={animated ? { opacity: 0, y: 20 } : {}}
      >
        <h3 className="text-xl font-semibold text-white mb-4">
          Content to Adapt
        </h3>

        <textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Enter your content here... (e.g., 'Join us for our Thanksgiving sale! Get 50% off, that's just $99!')"
          className="w-full h-32 bg-gray-900/50 text-white rounded-lg p-4 border border-gray-700 focus:border-purple-500 focus:outline-none resize-none"
        />

        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-400">
            {content.length} characters
          </span>
          <button
            onClick={handleAdaptClick}
            disabled={loading || !content.trim()}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span>
                Adapting...
              </span>
            ) : (
              'Adapt Content'
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      
        {error && (
          <div
            className="p-4 bg-red-900/20 border border-red-800/30 rounded-lg"
          >
            <p className="text-red-400">⚠️ {error}</p>
          </p>
        )}
      

      {/* Loading State */}
      {loading && (
        <div
          className="bg-gray-800/50 rounded-xl p-6 animate-pulse"
        >
          <div className="h-32 bg-gray-700 rounded mb-4"></div>
          <div className="h-24 bg-gray-700 rounded"></div>
        </div>
      )}

      {/* Adaptation Results */}
      
        {!loading && adaptation && showPreview && (
          <div
            className="space-y-4"
          >
            {/* Adapted Content */}
            <div className="bg-gradient-to-br from-green-900/20 to-gray-800/50 backdrop-blur-sm rounded-xl border border-green-800/30 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">
                  ✨ Adapted Content
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Confidence:</span>
                  <span className="text-lg font-bold text-green-400">
                    {Math.round(adaptation.confidence * 100)}%
                  </span>
                </span>
              </span>

              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <p className="text-white text-lg leading-relaxed">
                  {adaptation.adaptedContent}
                </p>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span className="text-2xl">
                  {REGION_INFO[adaptation.targetRegion]?.flag || '🌐'}
                </span>
                <span className="text-sm text-gray-400">
                  Adapted for {REGION_INFO[adaptation.targetRegion]?.name || adaptation.targetRegion}
                </span>
              </div>
            </div>

            {/* Changes Breakdown */}
            {adaptation.changes.length > 0 && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-white mb-4">
                  📝 Changes Made ({adaptation.changes.length})
                </h3>

                <div className="space-y-3">
                  {adaptation.changes.map((change, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700"
                    >
                      <div className="text-2xl">
                        {getChangeIcon(change.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="px-2 py-1 rounded text-xs font-semibold"
                            style={{
                              backgroundColor: `${getChangeColor(change.type)}20`,
                              color: getChangeColor(change.type)
                            }}
                          >
                            {change.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-red-400 line-through">
                            {change.original}
                          </span>
                          <span className="text-gray-500">→</span>
                          <span className="text-green-400 font-semibold">
                            {change.adapted}
                          </span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Changes Message */}
            {adaptation.changes.length === 0 && (
              <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-4">
                <p className="text-blue-400">
                  ℹ️ No cultural adaptations needed for this content in the selected region.
                </p>
              </div>
            )}
          </div>
        )}
      
    </div>
  )
}
