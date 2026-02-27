'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'

interface FileUploaderProps {
  onFileSelect: (file: File) => void
  selectedFile: File | null
}

export default function FileUploader({ onFileSelect, selectedFile }: FileUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0])
    }
  }, [onFileSelect])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
      'audio/*': ['.mp3', '.wav', '.m4a', '.aac', '.ogg']
    },
    maxFiles: 1,
    multiple: false
  })

  return (
    <motion.div
      {...getRootProps()}
      className={`relative p-12 border-2 border-dashed rounded-2xl transition-all cursor-pointer ${
        isDragActive && !isDragReject
          ? 'border-purple-500 bg-purple-500/10'
          : isDragReject
          ? 'border-red-500 bg-red-500/10'
          : selectedFile
          ? 'border-gray-700 bg-gray-800/30'
          : 'border-gray-700 bg-gray-800/50 hover:border-purple-500/50 hover:bg-gray-800/70'
      }`}
      whileHover={{ scale: selectedFile ? 1 : 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <input {...getInputProps()} />
      
      <AnimatePresence mode="wait">
        {isDragActive && !isDragReject ? (
          <motion.div
            key="drag-active"
            className="text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="text-6xl mb-4">📥</div>
            <p className="text-xl font-semibold text-purple-400 mb-2">
              Drop your file here
            </p>
            <p className="text-gray-400">
              Release to upload
            </p>
          </motion.div>
        ) : isDragReject ? (
          <motion.div
            key="drag-reject"
            className="text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="text-6xl mb-4">❌</div>
            <p className="text-xl font-semibold text-red-400 mb-2">
              Invalid file type
            </p>
            <p className="text-gray-400">
              Please upload video or audio files only
            </p>
          </motion.div>
        ) : selectedFile ? (
          <motion.div
            key="file-selected"
            className="text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="text-6xl mb-4">✅</div>
            <p className="text-xl font-semibold text-green-400 mb-2">
              File ready to upload
            </p>
            <p className="text-gray-400">
              Click or drag to replace
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="default"
            className="text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="text-6xl mb-4">📁</div>
            <p className="text-xl font-semibold text-white mb-2">
              Drag & drop your file here
            </p>
            <p className="text-gray-400 mb-4">
              or click to browse
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700/50 rounded-lg text-sm text-gray-300">
              <span>Supported:</span>
              <span className="font-semibold text-purple-400">Video</span>
              <span className="text-gray-500">•</span>
              <span className="font-semibold text-blue-400">Audio</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated corner accents */}
      <motion.div
        className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-purple-500 rounded-tl-2xl"
        animate={{
          opacity: isDragActive && !isDragReject ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
      />
      <motion.div
        className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-purple-500 rounded-tr-2xl"
        animate={{
          opacity: isDragActive && !isDragReject ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-purple-500 rounded-bl-2xl"
        animate={{
          opacity: isDragActive && !isDragReject ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-purple-500 rounded-br-2xl"
        animate={{
          opacity: isDragActive && !isDragReject ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  )
}
