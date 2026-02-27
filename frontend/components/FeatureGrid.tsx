'use client'

import { motion } from 'framer-motion'

const features = [
  {
    icon: '🎯',
    title: 'Platform Optimization',
    description: 'AI adapts content for YouTube, Instagram, LinkedIn, Twitter, Facebook, and TikTok with platform-specific best practices.',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    icon: '🌐',
    title: '9 Indian Languages',
    description: 'Create content in Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, and Punjabi.',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    icon: '⚡',
    title: '60-Second Generation',
    description: 'What takes 4-6 hours manually now takes just 60 seconds. Save 80% of your content creation time.',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    icon: '🎨',
    title: 'Smart Formatting',
    description: 'Automatic hashtags, captions, descriptions, and thumbnails optimized for each platform.',
    gradient: 'from-orange-500 to-red-500'
  },
  {
    icon: '📊',
    title: 'Analytics Dashboard',
    description: 'Track performance across all platforms with unified analytics and insights.',
    gradient: 'from-indigo-500 to-purple-500'
  },
  {
    icon: '🤖',
    title: 'AI Learning',
    description: 'Our AI learns from your content style and audience preferences to improve over time.',
    gradient: 'from-pink-500 to-rose-500'
  }
]

export default function FeatureGrid() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
            Powerful Features
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Everything you need to scale your content across multiple platforms
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="group relative p-8 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 hover:border-gray-600 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -5 }}
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`} />
              
              <div className="relative z-10">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-bold mb-3 text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Animated border gradient */}
              <motion.div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300`}
                style={{ zIndex: -1 }}
              />
            </motion.div>
          ))}
        </div>

        {/* Platform Icons */}
        <motion.div
          className="mt-20 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-gray-400 mb-6 text-lg">Supported Platforms</p>
          <div className="flex flex-wrap justify-center gap-8 items-center">
            {['YouTube', 'Instagram', 'LinkedIn', 'Twitter', 'Facebook', 'TikTok'].map((platform, index) => (
              <motion.div
                key={platform}
                className="px-6 py-3 bg-gray-800 rounded-lg border border-gray-700 text-gray-300 font-semibold"
                whileHover={{ scale: 1.1, borderColor: '#a855f7' }}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                {platform}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
