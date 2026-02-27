'use client'

import { useState } from 'react'
import ModeSelector from '@/components/ModeSelector'
import { motion } from 'framer-motion'

type CreatorMode = 'ai-first' | 'hybrid' | 'human-first'

export default function ModeSelectorDemo() {
  const [selectedMode, setSelectedMode] = useState<CreatorMode>('hybrid')

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Demo Header */}
      <div className="bg-gray-800 border-b border-gray-700 py-6 px-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          ModeSelector Component Demo
        </h1>
        <p className="text-gray-400">
          Interactive demonstration of the creator mode selector
        </p>
      </div>

      {/* Current State Display */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <motion.div
          className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-bold text-white mb-4">Current State</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">Selected Mode:</p>
              <p className="text-2xl font-bold text-purple-400">
                {selectedMode ? selectedMode.toUpperCase() : 'None'}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Mode Description:</p>
              <p className="text-white">
                {selectedMode === 'ai-first' && 'Full automation for speed and scale'}
                {selectedMode === 'hybrid' && 'AI-assisted workflow (Recommended)'}
                {selectedMode === 'human-first' && 'Minimal AI with full creative control'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Component Demo */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-6">Component</h2>
          <ModeSelector 
            selectedMode={selectedMode}
            onModeSelect={setSelectedMode}
          />
        </div>

        {/* Usage Example */}
        <motion.div
          className="bg-gray-800 rounded-lg p-6 mt-8 border border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-bold text-white mb-4">Usage Example</h2>
          <pre className="bg-gray-900 rounded p-4 overflow-x-auto">
            <code className="text-sm text-gray-300">
{`import ModeSelector from '@/components/ModeSelector'
import { useState } from 'react'

function MyComponent() {
  const [mode, setMode] = useState<'ai-first' | 'hybrid' | 'human-first'>('hybrid')

  return (
    <ModeSelector 
      selectedMode={mode}
      onModeSelect={(newMode) => {
        setMode(newMode)
        console.log('Selected:', newMode)
      }}
    />
  )
}`}
            </code>
          </pre>
        </motion.div>

        {/* Features List */}
        <motion.div
          className="bg-gray-800 rounded-lg p-6 mt-8 border border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-bold text-white mb-4">Component Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-purple-400 font-semibold mb-2">Design</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>✓ Dark mode with gradient accents</li>
                <li>✓ Glowing border on selection</li>
                <li>✓ Smooth framer-motion animations</li>
                <li>✓ Responsive grid layout</li>
                <li>✓ Hover effects and transitions</li>
              </ul>
            </div>
            <div>
              <h3 className="text-pink-400 font-semibold mb-2">Functionality</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>✓ Three creator modes</li>
                <li>✓ Recommended badge</li>
                <li>✓ Time saved indicators</li>
                <li>✓ Keyboard navigation</li>
                <li>✓ ARIA labels for accessibility</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="mt-8 flex flex-wrap gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <button
            onClick={() => setSelectedMode('ai-first')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
          >
            Select AI-First
          </button>
          <button
            onClick={() => setSelectedMode('hybrid')}
            className="px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
          >
            Select Hybrid
          </button>
          <button
            onClick={() => setSelectedMode('human-first')}
            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-green-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
          >
            Select Human-First
          </button>
        </motion.div>
      </div>
    </div>
  )
}
