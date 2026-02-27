'use client'

import { motion } from 'framer-motion'

interface FilePreviewProps {
  file: File
  onRemove: () => void
}

export default function FilePreview({ file, onRemove }: FilePreviewProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getFileIcon = (type: string): string => {
    if (type.startsWith('video/')) return '🎥'
    if (type.startsWith('audio/')) return '🎵'
    return '📄'
  }

  return (
    <motion.div
      className="p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="text-5xl flex-shrink-0">
            {getFileIcon(file.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white truncate mb-1">
              {file.name}
            </h3>
            <div className="flex flex-wrap gap-3 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <span className="font-medium">Size:</span>
                {formatFileSize(file.size)}
              </span>
              <span className="flex items-center gap-1">
                <span className="font-medium">Type:</span>
                {file.type.split('/')[1]?.toUpperCase() || 'Unknown'}
              </span>
            </div>
          </div>
        </div>

        <motion.button
          onClick={onRemove}
          className="flex-shrink-0 p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Remove file"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </motion.button>
      </div>
    </motion.div>
  )
}
