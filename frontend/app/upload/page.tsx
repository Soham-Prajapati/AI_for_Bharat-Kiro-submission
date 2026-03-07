'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import FileUploader from '@/components/FileUploader'

const SUPPORTED_FORMATS = ['MP4', 'MOV', 'AVI', 'MP3', 'WAV', 'M4A', 'WebM']
const OUTPUT_FORMATS = [
  { icon: '▶', label: 'YouTube Script',   color: '#FF0000' },
  { icon: '◎', label: 'Instagram Reel',   color: '#E1306C' },
  { icon: '♪', label: 'TikTok Caption',   color: '#00F2EA' },
  { icon: 'in', label: 'LinkedIn Article', color: '#0077B5' },
  { icon: '𝕏', label: 'X/Twitter Thread', color: '#1DA1F2' },
  { icon: '📝', label: 'Hindi Blog Post',  color: '#818CF8' },
  { icon: '🎙', label: 'Podcast Script',   color: '#22D3EE' },
  { icon: '📊', label: 'Viral Score',      color: '#F97316' },
]

export default function UploadPage() {
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [processingStep, setProcessingStep] = useState('')

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setYoutubeUrl('')
    setUploadProgress(0)
    setError(null)
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setYoutubeUrl(e.target.value)
    if (e.target.value) setSelectedFile(null)
    setUploadProgress(0)
    setError(null)
  }

  const handleUpload = async () => {
    if (!selectedFile && !youtubeUrl) {
      setError('Please provide a file or a video link')
      return
    }

    setIsUploading(true)
    setError(null)
    setUploadProgress(10)

    try {
      if (youtubeUrl) {
        setProcessingStep('Fetching video metadata…')
        setUploadProgress(30)
        const response = await fetch('/api/upload/youtube', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: youtubeUrl, userId: 'demo_user' })
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'Failed to process URL')
        setProcessingStep('Transcribing audio with AWS Transcribe…')
        setUploadProgress(60)
        await new Promise(r => setTimeout(r, 800))
        setProcessingStep('Generating content variants with Bedrock…')
        setUploadProgress(90)
        await new Promise(r => setTimeout(r, 600))
        setUploadProgress(100)
      } else if (selectedFile) {
        setProcessingStep('Uploading to S3…')
        setUploadProgress(20)
        const formData = new FormData()
        formData.append('file', selectedFile)
        formData.append('userId', 'demo_user')
        const response = await fetch('/api/upload', { method: 'POST', body: formData })
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'Failed to upload file')
        setProcessingStep('Analysing content…')
        setUploadProgress(70)
        await new Promise(r => setTimeout(r, 700))
        setUploadProgress(100)
      }

      setTimeout(() => router.push('/workspace'), 600)
    } catch (err: any) {
      setError(err.message || 'Upload failed. Please try again.')
      setIsUploading(false)
      setUploadProgress(0)
      setProcessingStep('')
    }
  }

  const canUpload = (selectedFile || youtubeUrl) && !isUploading

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
            <span className="text-[10px] font-mono font-semibold text-brand-400 uppercase tracking-widest">AI Content Engine</span>
          </div>
          <h1 className="text-4xl font-black font-display text-white leading-none">
            Upload <span className="bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">Content</span>
          </h1>
          <p className="mt-2 text-white/40 text-sm">One video → 8+ platform-ready formats, powered by AWS Bedrock + Transcribe.</p>
        </div>

        {/* What you'll get */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {OUTPUT_FORMATS.map((f) => (
            <div key={f.label} className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5">
              <span className="text-sm font-bold" style={{ color: f.color }}>{f.icon}</span>
              <span className="text-xs text-white/60 truncate">{f.label}</span>
            </div>
          ))}
        </div>

        {/* Upload Zone */}
        <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-6 space-y-6">
          <FileUploader onFileSelect={handleFileSelect} selectedFile={selectedFile} />

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-white/[0.07]" />
            <span className="text-xs font-mono text-white/25 uppercase tracking-widest">or paste a link</span>
            <div className="flex-1 h-px bg-white/[0.07]" />
          </div>

          {/* URL Input */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-white/40 uppercase tracking-widest">YouTube / Instagram / TikTok URL</label>
            <input
              type="url"
              value={youtubeUrl}
              onChange={handleUrlChange}
              placeholder="https://www.youtube.com/watch?v=…"
              className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30 transition-all"
            />
          </div>

          {/* Supported formats */}
          <div className="flex flex-wrap gap-2">
            {SUPPORTED_FORMATS.map(f => (
              <span key={f} className="text-[10px] font-mono text-white/25 bg-white/[0.04] border border-white/[0.06] rounded-md px-2 py-0.5">{f}</span>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            <span>⚠</span>
            <span>{error}</span>
          </div>
        )}

        {/* Progress */}
        {isUploading && (
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
                <span className="text-sm text-white/60">{processingStep}</span>
              </div>
              <span className="text-sm font-mono font-bold text-brand-400">{uploadProgress}%</span>
            </div>
            <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-cyan-400 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-white/30 font-mono">Analysing content → generating platform variants → scoring virality…</p>
          </div>
        )}

        {/* CTA */}
        {canUpload && (
          <div className="flex gap-3">
            <button
              onClick={handleUpload}
              className="flex-1 bg-brand-600 hover:bg-brand-500 text-white py-4 rounded-xl font-bold font-display text-base transition-all duration-200 shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30"
            >
              Process {youtubeUrl ? 'Link' : 'Content'} →
            </button>
            <button
              onClick={() => { setSelectedFile(null); setYoutubeUrl('') }}
              className="px-6 py-4 bg-white/[0.03] border border-white/[0.07] text-white/60 rounded-xl hover:border-white/[0.15] hover:text-white transition-all"
            >
              Clear
            </button>
          </div>
        )}

        {!canUpload && !isUploading && (
          <button
            disabled
            className="w-full py-4 rounded-xl font-bold text-base bg-white/[0.03] border border-white/[0.07] text-white/20 cursor-not-allowed"
          >
            Select a file or paste a URL to continue
          </button>
        )}

      </div>
    </div>
  )
}
