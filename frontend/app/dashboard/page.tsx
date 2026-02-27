'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import ContentCard from '@/components/ContentCard'
import AnalyticsChart from '@/components/AnalyticsChart'
import ExportButton from '@/components/ExportButton'
import { ContentItem, AnalyticsData } from '@/types/content'

// Mock data generator
const generateMockData = (): ContentItem[] => {
  const platforms: ContentItem['platform'][] = ['YouTube', 'Instagram', 'LinkedIn', 'Twitter', 'Facebook', 'Blog']
  const languages = ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Bengali', 'Marathi', 'Gujarati']
  const statuses: ContentItem['status'][] = ['draft', 'published', 'scheduled']
  const tags = ['AI', 'Technology', 'Marketing', 'Education', 'Business', 'Entertainment', 'News', 'Tutorial', 'Review']

  return Array.from({ length: 10 }, (_, i) => ({
    id: `content-${i + 1}`,
    title: `${platforms[i % platforms.length]} Content ${i + 1}: AI-Powered Content Strategy`,
    platform: platforms[i % platforms.length],
    language: languages[i % languages.length],
    content: `This is an AI-generated content piece optimized for ${platforms[i % platforms.length]}. It includes engaging hooks, platform-specific formatting, and multilingual support to maximize reach and engagement across diverse audiences.`,
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    engagement: {
      views: Math.floor(Math.random() * 50000) + 1000,
      likes: Math.floor(Math.random() * 5000) + 100,
      shares: Math.floor(Math.random() * 500) + 10,
      comments: Math.floor(Math.random() * 300) + 5,
    },
    status: statuses[i % statuses.length],
    tags: Array.from({ length: 3 }, () => tags[Math.floor(Math.random() * tags.length)]),
  }))
}

export default function DashboardPage() {
  const router = useRouter()
  const [contentData, setContentData] = useState<ContentItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPlatform, setFilterPlatform] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setContentData(generateMockData())
      setIsLoading(false)
    }
    loadData()
  }, [])

  const filteredContent = useMemo(() => {
    return contentData.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.content.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesPlatform = filterPlatform === 'all' || item.platform === filterPlatform
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus
      return matchesSearch && matchesPlatform && matchesStatus
    })
  }, [contentData, searchQuery, filterPlatform, filterStatus])

  const analyticsData: AnalyticsData[] = useMemo(() => {
    const platformStats = contentData.reduce((acc, item) => {
      if (!acc[item.platform]) {
        acc[item.platform] = { views: 0, engagement: 0, reach: 0 }
      }
      acc[item.platform].views += item.engagement.views
      acc[item.platform].engagement += item.engagement.likes + item.engagement.comments
      acc[item.platform].reach += item.engagement.shares * 10
      return acc
    }, {} as Record<string, { views: number; engagement: number; reach: number }>)

    return Object.entries(platformStats).map(([platform, stats]) => ({
      platform,
      ...stats,
    }))
  }, [contentData])

  const platforms = ['all', 'YouTube', 'Instagram', 'LinkedIn', 'Twitter', 'Facebook', 'Blog']
  const statuses = ['all', 'draft', 'published', 'scheduled']

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
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

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
                Content Dashboard
              </h1>
              <p className="text-lg text-gray-300">
                Manage and analyze your AI-generated content
              </p>
            </div>
            <div className="flex gap-3">
              <ExportButton data={filteredContent} />
              <motion.button
                onClick={() => router.push('/upload')}
                className="px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg border border-gray-700 hover:bg-gray-700 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                + New Content
              </motion.button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <motion.div
              className="p-4 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="text-3xl font-bold text-purple-400 mb-1">
                {contentData.length}
              </div>
              <div className="text-sm text-gray-400">Total Content</div>
            </motion.div>
            <motion.div
              className="p-4 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-3xl font-bold text-pink-400 mb-1">
                {contentData.reduce((sum, item) => sum + item.engagement.views, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Total Views</div>
            </motion.div>
            <motion.div
              className="p-4 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="text-3xl font-bold text-blue-400 mb-1">
                {contentData.filter(item => item.status === 'published').length}
              </div>
              <div className="text-sm text-gray-400">Published</div>
            </motion.div>
            <motion.div
              className="p-4 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="text-3xl font-bold text-green-400 mb-1">
                {new Set(contentData.map(item => item.language)).size}
              </div>
              <div className="text-sm text-gray-400">Languages</div>
            </motion.div>
          </div>
        </motion.div>

        {analyticsData.length > 0 && (
          <div className="mb-8">
            <AnalyticsChart data={analyticsData} />
          </div>
        )}

        <motion.div
          className="mb-6 p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <input
                type="text"
                placeholder="🔍 Search content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <select
                value={filterPlatform}
                onChange={(e) => setFilterPlatform(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none transition-colors"
              >
                {platforms.map(platform => (
                  <option key={platform} value={platform}>
                    {platform === 'all' ? 'All Platforms' : platform}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none transition-colors"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(searchQuery || filterPlatform !== 'all' || filterStatus !== 'all') && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-400">Active filters:</span>
              {searchQuery && (
                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                  Search: "{searchQuery}"
                </span>
              )}
              {filterPlatform !== 'all' && (
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                  Platform: {filterPlatform}
                </span>
              )}
              {filterStatus !== 'all' && (
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                  Status: {filterStatus}
                </span>
              )}
              <button
                onClick={() => {
                  setSearchQuery('')
                  setFilterPlatform('all')
                  setFilterStatus('all')
                }}
                className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm hover:bg-gray-600 transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div
              className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        ) : filteredContent.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {filteredContent.map((content, index) => (
              <ContentCard key={content.id} content={content} index={index} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-white mb-2">No content found</h3>
            <p className="text-gray-400 mb-6">Try adjusting your filters or search query</p>
            <motion.button
              onClick={() => {
                setSearchQuery('')
                setFilterPlatform('all')
                setFilterStatus('all')
              }}
              className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Clear Filters
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
