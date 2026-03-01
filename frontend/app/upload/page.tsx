'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import FileUploader from '@/components/FileUploader'
import apiClient from '@/services/api' // using if available, or fetch directly

export default function UploadPage() {
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setYoutubeUrl('') // Clear URL if file selected
    setUploadProgress(0)
    setError(null)
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setYoutubeUrl(e.target.value)
    if (e.target.value) {
      setSelectedFile(null) // Clear file if URL entered
    }
    setUploadProgress(0)
    setError(null)
  }

  const handleUpload = async () => {
    if (!selectedFile && !youtubeUrl) {
      setError("Please provide a file or a YouTube link")
      return
    }
    
    setIsUploading(true)
    setError(null)
    setUploadProgress(10) // Initial progress
    
    try {
      if (youtubeUrl) {
        // Upload via URL API
        setUploadProgress(30)
        const response = await fetch('/api/upload/youtube', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: youtubeUrl, userId: 'demo_user' })
        })
        
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'Failed to process YouTube URL')
        
        setUploadProgress(80)
        // Wait a sec to show progress
        await new Promise(r => setTimeout(r, 800))
        setUploadProgress(100)
        
      } else if (selectedFile) {
        // Upload via File API
        setUploadProgress(20)
        const formData = new FormData()
        formData.append('file', selectedFile)
        formData.append('userId', 'demo_user')
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'Failed to upload file')
        
        setUploadProgress(90)
        // Wait a sec
        await new Promise(r => setTimeout(r, 600))
        setUploadProgress(100)
      }
      
      // Success - Redirect to dashboard to see the generated content
      setTimeout(() => router.push('/dashboard'), 500)
      
    } catch (err: any) {
      console.error("Upload error:", err)
      setError(err.message || 'An error occurred during upload')
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Upload Content</h1>
        <p className="text-gray-400">Upload your video or audio file to get started</p>
      </div>

      <div className="space-y-6">
        <FileUploader onFileSelect={handleFileSelect} selectedFile={selectedFile} />

        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-800"></div>
          <span className="text-gray-500 font-medium">OR</span>
          <div className="flex-1 h-px bg-gray-800"></div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Paste YouTube / Instagram / TikTok Link
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={youtubeUrl}
              onChange={handleUrlChange}
              placeholder="https://www.youtube.com/watch?v=..."
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
            />
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {(selectedFile || youtubeUrl) && !isUploading && (
          <div className="flex gap-4">
            <button
              onClick={handleUpload}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold hover:opacity-90 transition-opacity"
            >
              Process {youtubeUrl ? 'Link' : 'Content'}
            </button>
            <button
              onClick={() => {
                setSelectedFile(null)
                setYoutubeUrl('')
              }}
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
