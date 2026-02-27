'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import FileUploader from '@/components/FileUploader'
import FilePreview from '@/components/FilePreview'
import ProgressBar from '@/components/ProgressBar'

export default function UploadPage() {
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setUploadProgress(0)
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setUploadProgress(0)
  }

  const simulateUpload = async () => {
    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 2
      })
    }, 50)

    // Wait for upload to complete
    await new Promise((resolve) => {
      const checkComplete = setInterval(() => {
        if (uploadProgress >= 100) {
          clearInterval(checkComplete)
          resolve(true)
        }
      }, 100)
    })

    // Wait a bit to show completion
    setTimeout(() => {
      router.push('/dashboard')
    }, 1500)
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    
    try {
      await simulateUpload()
      // TODO: Replace with actual API call
      // const formData = new FormData()
      // formData.append('file', selectedFile)
      // const response = await fetch('/api/upload', {
      //   method: 'POST',
      //   body: formData,
      // })
    } catch (error) {
      console.error('Upload failed:', error)
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
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

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Upload Your Content
          </motion.h1>
          <motion.p
            className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Upload your video or audio file and let AI transform it into platform-optimized content
          </motion.p>
        </motion.div>

        {/* Upload Area */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          {/* File Uploader */}
          <FileUploader
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
          />

          {/* File Preview */}
          <AnimatePresence>
            {selectedFile && (
              <FilePreview
                file={selectedFile}
                onRemove={handleRemoveFile}
              />
            )}
          </AnimatePresence>

          {/* Progress Bar */}
          <AnimatePresence>
            {isUploading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ProgressBar progress={uploadProgress} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Upload Button */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <motion.button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className={`px-8 py-4 font-semibold rounded-lg shadow-lg transition-all ${
                !selectedFile || isUploading
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-purple-500/50'
              }`}
              whileHover={selectedFile && !isUploading ? { scale: 1.05 } : {}}
              whileTap={selectedFile && !isUploading ? { scale: 0.95 } : {}}
            >
              {isUploading ? 'Uploading...' : 'Start Upload'}
            </motion.button>

            <motion.button
              onClick={() => router.push('/')}
              className="px-8 py-4 bg-gray-800 text-white font-semibold rounded-lg border border-gray-700 hover:bg-gray-700 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cancel
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Info Cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <div className="p-4 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 text-center">
            <div className="text-3xl mb-2">⚡</div>
            <div className="text-sm text-gray-400">60-second processing</div>
          </div>
          <div className="p-4 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 text-center">
            <div className="text-3xl mb-2">🌐</div>
            <div className="text-sm text-gray-400">9 Indian languages</div>
          </div>
          <div className="p-4 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 text-center">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-sm text-gray-400">6 platforms optimized</div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
