'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import FileUploader from '@/components/FileUploader'

export default function UploadPage() {
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setUploadProgress(0)
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    
    setIsUploading(true)
    
    // Simulate upload
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => router.push('/dashboard'), 500)
          return 100
        }
        return prev + 5
      })
    }, 100)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Upload Content</h1>
        <p className="text-gray-400">Upload your video or audio file to get started</p>
      </div>

      <div className="space-y-6">
        <FileUploader onFileSelect={handleFileSelect} selectedFile={selectedFile} />

        {selectedFile && !isUploading && (
          <div className="flex gap-4">
            <button
              onClick={handleUpload}
              className="flex-1 bg-white text-black py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Process Content
            </button>
            <button
              onClick={() => setSelectedFile(null)}
              className="px-6 py-4 bg-[#0A0A0A] border border-[#1A1A1A] text-white rounded-xl hover:border-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {isUploading && (
          <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl p-6">
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Processing...</span>
                <span className="text-white font-medium">{uploadProgress}%</span>
              </div>
              <div className="h-2 bg-black rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
            <p className="text-sm text-gray-400">
              Analyzing your content and generating platform-specific versions...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
