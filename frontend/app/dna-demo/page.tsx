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
    <div className="min-h-screen bg-[#030712] text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 text-[10px] font-mono font-semibold text-brand-400 uppercase tracking-widest mb-4">
            <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-pulse"></span>
            Creator Intelligence
          </span>
          <h1 className="text-5xl font-black font-display text-white mb-4">
            Creator DNA Visualization
          </h1>
          <p className="text-lg text-white/40">
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
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                selectedProfile === index
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/40'
                  : 'bg-white/[0.05] border border-white/[0.07] text-white/60 hover:bg-white/[0.08] hover:text-white'
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
          className="mt-12 bg-white/[0.03] border border-white/[0.07] rounded-2xl p-8"
        >
          <h3 className="text-2xl font-bold font-display text-white mb-4">
            About Creator DNA
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-white/50">
            <div>
              <h4 className="font-semibold text-brand-400 mb-2">What is it?</h4>
              <p className="text-sm leading-relaxed">
                Creator DNA is a personality profiling system that analyzes content 
                across five key dimensions to understand a creator's unique style 
                and approach. This helps match creators with brands and audiences.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-cyan-400 mb-2">How to use it?</h4>
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
