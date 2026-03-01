'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

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
    <div
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
    >
      <input {...getInputProps()} />
      
      {isDragActive && !isDragReject ? (
        <div className="text-center">
          <div className="text-6xl mb-4">📥</div>
          <p className="text-xl font-semibold text-purple-400 mb-2">
            Drop your file here
          </p>
          <p className="text-gray-400">Release to upload</p>
        </div>
      ) : isDragReject ? (
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-xl font-semibold text-red-400 mb-2">
            Invalid file type
          </p>
          <p className="text-gray-400">
            Please upload video or audio files only
          </p>
        </div>
      ) : selectedFile ? (
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <p className="text-xl font-semibold text-green-400 mb-2">
            {selectedFile.name}
          </p>
          <p className="text-gray-400">
            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Click or drag to replace
          </p>
        </div>
      ) : (
        <div className="text-center">
          <div className="text-6xl mb-4">📁</div>
          <p className="text-xl font-semibold text-gray-200 mb-2">
            Drop your video or audio file here
          </p>
          <p className="text-gray-400 mb-4">
            or click to browse
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-500">
            <span className="px-3 py-1 bg-gray-700 rounded-full">MP4</span>
            <span className="px-3 py-1 bg-gray-700 rounded-full">MOV</span>
            <span className="px-3 py-1 bg-gray-700 rounded-full">MP3</span>
            <span className="px-3 py-1 bg-gray-700 rounded-full">WAV</span>
          </div>
        </div>
      )}
    </div>
  )
}
