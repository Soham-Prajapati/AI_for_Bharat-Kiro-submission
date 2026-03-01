'use client'

import DNAChart from '@/components/DNAChart'
import { CreatorDNA } from '@/types/dna'
import { useState } from 'react'

// Multiple creator profiles for comparison
const creatorProfiles: CreatorDNA[] = [
  {
    creatorId: 'creator-001',
    creatorName: 'Tech Educator',
    dimensions: [
      {
        dimension: 'Energy',
        value: 85,
        fullMark: 100,
        description: 'Enthusiasm and dynamism in content delivery',
        color: '#ec4899',
        icon: '⚡'
      },
      {
        dimension: 'Formality',
        value: 45,
        fullMark: 100,
        description: 'Professional tone vs casual approach',
        color: '#8b5cf6',
        icon: '👔'
      },
      {
        dimension: 'Humor',
        value: 70,
        fullMark: 100,
        description: 'Use of comedy and lighthearted content',
        color: '#06b6d4',
        icon: '😄'
      },
      {
        dimension: 'Technical Depth',
        value: 90,
        fullMark: 100,
        description: 'Complexity and detail in explanations',
        color: '#3b82f6',
        icon: '🔬'
      },
      {
        dimension: 'Storytelling',
        value: 75,
        fullMark: 100,
        description: 'Narrative structure and emotional connection',
        color: '#a855f7',
        icon: '📖'
      }
    ]
  },
  {
    creatorId: 'creator-002',
    creatorName: 'Lifestyle Vlogger',
    dimensions: [
      {
        dimension: 'Energy',
        value: 95,
        fullMark: 100,
        description: 'Enthusiasm and dynamism in content delivery',
        color: '#ec4899',
        icon: '⚡'
      },
      {
        dimension: 'Formality',
        value: 20,
        fullMark: 100,
        description: 'Professional tone vs casual approach',
        color: '#8b5cf6',
        icon: '👔'
      },
      {
        dimension: 'Humor',
        value: 85,
        fullMark: 100,
        description: 'Use of comedy and lighthearted content',
        color: '#06b6d4',
        icon: '😄'
      },
      {
        dimension: 'Technical Depth',
        value: 30,
        fullMark: 100,
        description: 'Complexity and detail in explanations',
        color: '#3b82f6',
        icon: '🔬'
      },
      {
        dimension: 'Storytelling',
        value: 90,
        fullMark: 100,
        description: 'Narrative structure and emotional connection',
        color: '#a855f7',
        icon: '📖'
      }
    ]
  },
  {
    creatorId: 'creator-003',
    creatorName: 'Business Analyst',
    dimensions: [
      {
        dimension: 'Energy',
        value: 50,
        fullMark: 100,
        description: 'Enthusiasm and dynamism in content delivery',
        color: '#ec4899',
        icon: '⚡'
      },
      {
        dimension: 'Formality',
        value: 90,
        fullMark: 100,
        description: 'Professional tone vs casual approach',
        color: '#8b5cf6',
        icon: '👔'
      },
      {
        dimension: 'Humor',
        value: 25,
        fullMark: 100,
        description: 'Use of comedy and lighthearted content',
        color: '#06b6d4',
        icon: '😄'
      },
      {
        dimension: 'Technical Depth',
        value: 85,
        fullMark: 100,
        description: 'Complexity and detail in explanations',
        color: '#3b82f6',
        icon: '🔬'
      },
      {
        dimension: 'Storytelling',
        value: 60,
        fullMark: 100,
        description: 'Narrative structure and emotional connection',
        color: '#a855f7',
        icon: '📖'
      }
    ]
  }
]

export default function DNADemoPage() {
  const [selectedProfile, setSelectedProfile] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            Creator DNA Visualization
          </h1>
          <p className="text-xl text-gray-400">
            Explore personality dimensions across different creator profiles
          </p>
        </div>

        {/* Profile Selector */}
        <div
          className="flex justify-center gap-4 mb-8"
        >
          {creatorProfiles.map((profile, index) => (
            <div
              key={profile.creatorId}
              onClick={() => setSelectedProfile(index)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                selectedProfile === index
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {profile.creatorName}
            </div>
          ))}
        </div>

        {/* DNA Chart */}
        <DNAChart 
          key={selectedProfile} 
          dnaData={creatorProfiles[selectedProfile]} 
          showLegend={true}
          animated={true}
        />

        {/* Info Section */}
        <div
          className="mt-12 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 p-8"
        >
          <h3 className="text-2xl font-bold text-white mb-4">
            About Creator DNA
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-gray-300">
            <div>
              <h4 className="font-semibold text-purple-400 mb-2">What is it?</h4>
              <p className="text-sm leading-relaxed">
                Creator DNA is a personality profiling system that analyzes content 
                across five key dimensions to understand a creator's unique style 
                and approach. This helps match creators with brands and audiences.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-pink-400 mb-2">How to use it?</h4>
              <p className="text-sm leading-relaxed">
                Hover over the radar chart or dimension cards to see detailed 
                information. Switch between different creator profiles to compare 
                their personality traits and content styles.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
