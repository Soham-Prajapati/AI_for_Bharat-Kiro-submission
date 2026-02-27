'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function Hero() {
  const [timesSaved, setTimesSaved] = useState(0)
  const [contentGenerated, setContentGenerated] = useState(0)

  useEffect(() => {
    const timeSavedInterval = setInterval(() => {
      setTimesSaved(prev => (prev < 4.5 ? prev + 0.1 : 4.5))
    }, 50)

    const contentInterval = setInterval(() => {
      setContentGenerated(prev => (prev < 10000 ? prev + 100 : 10000))
    }, 20)

    return () => {
      clearInterval(timeSavedInterval)
      clearInterval(contentInterval)
    }
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.span
            className="inline-block px-4 py-2 mb-6 text-sm font-semibold text-purple-300 bg-purple-900/50 rounded-full border border-purple-500/30"
            whileHover={{ scale: 1.05 }}
          >
            🚀 AI-Powered Content Intelligence
          </motion.span>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
            Transform Content
            <br />
            <span className="text-white">In 60 Seconds</span>
          </h1>

          <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Stop spending 80% of your time repurposing content. Let AI generate platform-optimized content across 6 platforms in 9 Indian languages.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <motion.button
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-purple-500/50 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Free Trial
            </motion.button>
            <motion.button
              className="px-8 py-4 bg-gray-800 text-white font-semibold rounded-lg border border-gray-700 hover:bg-gray-700 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Watch Demo
            </motion.button>
          </div>

          {/* Animated Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <motion.div
              className="p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-4xl font-bold text-purple-400 mb-2">
                {timesSaved.toFixed(1)}hrs
              </div>
              <div className="text-gray-400">Saved Per Video</div>
            </motion.div>

            <motion.div
              className="p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="text-4xl font-bold text-pink-400 mb-2">6</div>
              <div className="text-gray-400">Platforms Supported</div>
            </motion.div>

            <motion.div
              className="p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="text-4xl font-bold text-blue-400 mb-2">
                {Math.floor(contentGenerated).toLocaleString()}+
              </div>
              <div className="text-gray-400">Content Generated</div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
