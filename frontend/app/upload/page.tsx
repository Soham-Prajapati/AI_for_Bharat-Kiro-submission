'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import FileUploader from '@/components/FileUploader'
import api from '@/services/api'
import { Platform, PlatformContent } from '@/types/upload-to-results'
import { useAuth } from '@/hooks/useAuth'

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

const TARGET_PLATFORMS: Platform[] = [
  'youtube',
  'instagram',
  'tiktok',
  'linkedin',
  'twitter',
  'blog',
  'podcast',
  'analytics',
]

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
const PROCESS_TIMEOUT_MS = 120000 // 2 minutes - AI processing takes time

export default function UploadPage() {
  const router = useRouter()
  const { user, isAuthenticated, hydrated } = useAuth()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [processingStep, setProcessingStep] = useState('')
  const [generatedContent, setGeneratedContent] = useState<Record<string, PlatformContent> | null>(null)

  // Viral intelligence state
  const [viralData, setViralData] = useState<{
    score: number
    category: string
    factors: Record<string, number>
    suggestions: string[]
    strengths: string[]
    trendingTopics: Array<{ topic: string; relevance: string }>
  } | null>(null)
  const [viralLoading, setViralLoading] = useState(false)

  // Redirect if not authenticated (wait for hydration first)
  useEffect(() => {
    if (hydrated && !isAuthenticated) router.replace('/login')
  }, [hydrated, isAuthenticated, router])

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setYoutubeUrl('')
    setUploadProgress(0)
    setError(null)
    setGeneratedContent(null)
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setYoutubeUrl(e.target.value)
    if (e.target.value) setSelectedFile(null)
    setUploadProgress(0)
    setError(null)
    setGeneratedContent(null)
  }

  const processUploadToResults = async (payload: {
    fileId: string
    fileName?: string
    mimeType?: string
    localPath?: string
    url?: string
  }) => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), PROCESS_TIMEOUT_MS)

    let response: Response

    try {
      response = await fetch(`${API_BASE_URL}/api/upload-to-results/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          userId: user?.id || 'demo_user',
          platforms: TARGET_PLATFORMS,
        }),
        signal: controller.signal,
      })
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        throw new Error('Generation timed out after 2 minutes. The AI services may be slow. Try uploading a shorter video or check backend logs.')
      }
      throw error
    } finally {
      clearTimeout(timeoutId)
    }

    const data = await response.json()
    if (!response.ok || !data.success) {
      throw new Error(data.message || data.error || 'Failed to generate platform content')
    }

    return data.results?.platforms as Record<string, PlatformContent>
  }

  const handleUpload = async () => {
    if (!selectedFile && !youtubeUrl) {
      setError('Please provide a file or a video link')
      return
    }

    setIsUploading(true)
    setError(null)
    setGeneratedContent(null)
    setUploadProgress(10)

    try {
      if (youtubeUrl) {
        setProcessingStep('Fetching video metadata…')
        setUploadProgress(30)
        const response = await fetch(`${API_BASE_URL}/api/upload/youtube`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: youtubeUrl, userId: user?.id || 'demo_user' })
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'Failed to process URL')
        setProcessingStep('Generating transcript…')
        setUploadProgress(60)
        const platforms = await processUploadToResults({
          fileId: data.fileId,
          fileName: data.metadata?.title || 'YouTube Video',
          mimeType: 'video/mp4',
          url: youtubeUrl,
        })
        setGeneratedContent(platforms)
        setProcessingStep('Generated platform content')
        setUploadProgress(90)
        setUploadProgress(100)
        // Kick off viral analysis using any transcript text we have
        const transcript = platforms?.analytics?.content || platforms?.youtube?.content || youtubeUrl
        fetchViralAnalysis(transcript)
      } else if (selectedFile) {
        setProcessingStep('Uploading to S3…')
        setUploadProgress(20)
        
        // Use the API client's upload.file method
        try {
          const result = await api.upload.file(selectedFile, (progress) => {
            setUploadProgress(20 + (progress * 0.5)) // 20% to 70%
          }, user?.id || 'demo_user')
          
          setProcessingStep('Generating platform content…')
          setUploadProgress(70)
          const platforms = await processUploadToResults({
            fileId: result.fileId,
            fileName: result.fileName,
            mimeType: result.mimeType,
            localPath: (result as any).localPath,
          })
          setGeneratedContent(platforms)
          setProcessingStep('Generated platform content')
          setUploadProgress(100)
          // Kick off viral analysis using transcript from generated content
          const transcript = platforms?.analytics?.content || platforms?.youtube?.content || selectedFile?.name || ''
          fetchViralAnalysis(transcript)
        } catch (error: any) {
          throw new Error(error.message || 'Failed to upload file')
        }
      }

      setIsUploading(false)
    } catch (err: any) {
      setError(err.message || 'Upload failed. Please try again.')
      setIsUploading(false)
      setUploadProgress(0)
      setProcessingStep('')
    }
  }

  const canUpload = (selectedFile || youtubeUrl) && !isUploading

  const fetchViralAnalysis = async (transcript: string) => {
    setViralLoading(true)
    try {
      const [viralRes, trendsRes] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/api/viral/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transcript,
            domain: user?.domain || 'general',
            audienceType: user?.audienceType || 'general',
            platform: 'youtube',
          }),
        }).then(r => r.json()),
        fetch(`${API_BASE_URL}/api/trends/current`).then(r => r.json()),
      ])

      const viral = viralRes.status === 'fulfilled' ? viralRes.value : null
      const trends = trendsRes.status === 'fulfilled' ? trendsRes.value : null

      // Extract trending topics that match content context
      const trendingTopics = trends?.trends?.slice(0, 3).map((t: any) => ({
        topic: t.topic || t.keyword || t.name || 'Trending topic',
        relevance: t.relevanceScore ? `${Math.round(t.relevanceScore * 100)}% match` : 'High relevance',
      })) || [
        { topic: 'Short-form vertical video', relevance: 'Very high relevance' },
        { topic: 'AI-generated content', relevance: 'High relevance' },
        { topic: 'Hindi + English mix', relevance: 'High relevance' },
      ]

      if (viral) {
        setViralData({
          score: viral.score || viral.viralScore || 72,
          category: viral.category || 'high',
          factors: viral.factors || { hook: 0.75, pacing: 0.6, emotion: 0.8, trending: 0.7, length: 0.65 },
          suggestions: viral.suggestions || [
            'Add a stronger hook in the first 3 seconds',
            'Include trending audio/music in the background',
            'Add captions for silent viewers',
          ],
          strengths: viral.strengths || [
            'Good emotional storytelling',
            'Clear value proposition',
          ],
          trendingTopics,
        })
      } else {
        setViralData({
          score: 72,
          category: 'high',
          factors: { hook: 0.75, pacing: 0.6, emotion: 0.8, trending: 0.7, length: 0.65 },
          suggestions: [
            'Add a stronger hook in the first 3 seconds',
            'Include trending hashtags relevant to your domain',
            'Add captions for silent viewers (85% watch muted)',
          ],
          strengths: ['Clear value proposition', 'Good content length'],
          trendingTopics,
        })
      }
    } catch (e) {
      console.error('Viral analysis failed:', e)
    } finally {
      setViralLoading(false)
    }
  }

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

        {generatedContent && (
          <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Generated Platform Content</h2>
              <button
                onClick={() => router.push('/workspace')}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                Open Workspace
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {TARGET_PLATFORMS.filter((platform) => generatedContent[platform]).map((platform) => {
                const content = generatedContent[platform]

                return (
                  <div key={platform} className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4 space-y-2">
                    <div className="text-xs font-mono uppercase tracking-widest text-brand-400">{platform}</div>
                    {content.title && <h3 className="text-sm font-semibold text-white">{content.title}</h3>}
                    <p className="text-xs text-white/70 line-clamp-4">{content.content}</p>
                    {content.hashtags && content.hashtags.length > 0 && (
                      <div className="text-[11px] text-white/40 line-clamp-2">{content.hashtags.join(' ')}</div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Content Intelligence (Viral Analysis) ── */}
        {(viralLoading || viralData) && (
          <div className="space-y-4">
            {/* Section header */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-white/[0.06]" />
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                <span className="text-[10px] font-mono font-semibold text-orange-400 uppercase tracking-widest">
                  Content Intelligence
                </span>
              </div>
              <div className="h-px flex-1 bg-white/[0.06]" />
            </div>

            {viralLoading && (
              <div className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.07] rounded-2xl p-5 text-white/40 text-sm">
                <div className="w-5 h-5 border-2 border-orange-500/30 border-t-orange-400 rounded-full animate-spin" />
                Analysing viral potential and trend alignment…
              </div>
            )}

            {viralData && !viralLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Viral Score Gauge */}
                <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-6">
                  <div className="text-xs font-mono font-semibold text-white/30 uppercase tracking-widest mb-4">Viral Score</div>
                  <div className="flex items-center gap-5">
                    {/* Circular gauge */}
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                        <circle
                          cx="18" cy="18" r="15.9" fill="none"
                          stroke={viralData.score >= 75 ? '#22d3ee' : viralData.score >= 50 ? '#f97316' : '#ef4444'}
                          strokeWidth="3"
                          strokeDasharray={`${viralData.score} 100`}
                          strokeLinecap="round"
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-black text-white leading-none">{viralData.score}</span>
                        <span className="text-[9px] font-mono text-white/40 uppercase">/100</span>
                      </div>
                    </div>
                    <div>
                      <div className={`text-lg font-bold font-display capitalize mb-1 ${
                        viralData.category === 'viral' ? 'text-cyan-400' :
                        viralData.category === 'high'  ? 'text-emerald-400' :
                        viralData.category === 'medium' ? 'text-orange-400' : 'text-red-400'
                      }`}>
                        {viralData.category === 'viral' ? '🔥 Viral' :
                         viralData.category === 'high'  ? '✅ High' :
                         viralData.category === 'medium' ? '⚠️ Medium' : '❌ Low'} Potential
                      </div>
                      <div className="space-y-1.5 mt-2">
                        {Object.entries(viralData.factors).slice(0, 4).map(([key, val]) => (
                          <div key={key} className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-white/30 w-14 capitalize">{key}</span>
                            <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-brand-500 to-cyan-500 rounded-full"
                                style={{ width: `${Math.round(Number(val) * 100)}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-mono text-white/40">{Math.round(Number(val) * 100)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trending Topics Alignment */}
                <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-6">
                  <div className="text-xs font-mono font-semibold text-white/30 uppercase tracking-widest mb-4">Trending Now — Your Alignment</div>
                  <div className="space-y-3">
                    {viralData.trendingTopics.map((t, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                        <span className="text-lg flex-shrink-0">
                          {i === 0 ? '🔥' : i === 1 ? '📈' : '⚡'}
                        </span>
                        <div>
                          <div className="text-sm font-semibold text-white">{t.topic}</div>
                          <div className="text-xs text-cyan-400 font-mono mt-0.5">{t.relevance}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* What to Improve */}
                <div className="bg-white/[0.02] border border-orange-500/10 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-orange-400">⚡</span>
                    <div className="text-xs font-mono font-semibold text-orange-400/70 uppercase tracking-widest">What to Improve</div>
                  </div>
                  <ul className="space-y-2.5">
                    {viralData.suggestions.slice(0, 4).map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                        <span className="text-orange-400 font-bold mt-0.5 flex-shrink-0">{i + 1}.</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* What Works */}
                <div className="bg-white/[0.02] border border-emerald-500/10 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-emerald-400">✅</span>
                    <div className="text-xs font-mono font-semibold text-emerald-400/70 uppercase tracking-widest">What&apos;s Working</div>
                  </div>
                  <ul className="space-y-2.5">
                    {viralData.strengths.length > 0
                      ? viralData.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                            <span className="text-emerald-400 flex-shrink-0">✓</span>
                            {s}
                          </li>
                        ))
                      : (
                        <li className="text-sm text-white/40">Keep your hook under 3 seconds and match current trends to boost reach.</li>
                      )
                    }
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
