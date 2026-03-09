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
const PROCESS_TIMEOUT_MS = 300000 // 5 minutes - AI processing takes time (16MB+ files need AWS Transcribe + Rekognition + 8-platform generation)
const UPLOAD_SESSION_KEY = 'kla_upload_session'
const SESSION_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

interface FullResults {
  platforms: Record<string, PlatformContent>
  viralScore?: number
  analytics?: { detectedDomain?: string; estimatedReach?: number; estimatedEngagement?: number }
  viralAnalysis?: {
    hooks?: Array<{ timestamp: string; type: string; impact: 'high' | 'medium' | 'low'; description: string }>
    recommendations?: string[]
    patterns?: Array<{ type: string; strength: number; description: string }>
  }
  contentFeedback?: {
    overallScore?: number
    grade?: string
    topStrengths?: string[]
    improvements?: Array<{ aspect: string; current: string; suggested: string; impact: 'high' | 'medium' | 'low'; reasoning: string }>
  }
}

// Domain-specific Bedrock agent metadata
const DOMAIN_AGENTS: Record<string, { name: string; emoji: string; description: string; model: string }> = {
  technology:    { name: 'Tech Expert Agent',         emoji: '💻', description: 'Specialised in Indian dev & tech content, career growth tips, and what makes tech go viral.',   model: 'Claude 3.5 Sonnet' },
  food:          { name: 'Food Specialist Agent',     emoji: '🍳', description: 'Expert in regional Indian cuisine, recipe virality, and food content that stops the scroll.',     model: 'Claude 3.5 Sonnet' },
  travel:        { name: 'Travel Expert Agent',       emoji: '✈️', description: 'Knows India\'s destinations, budget travel culture, and wanderlust content for Indian audiences.',  model: 'Claude 3.5 Sonnet' },
  fitness:       { name: 'Fitness & Wellness Agent',  emoji: '💪', description: 'Indian workout culture, yoga trends, and motivational hooks for health-conscious audiences.',        model: 'Claude 3.5 Sonnet' },
  finance:       { name: 'Finance Expert Agent',      emoji: '📈', description: 'Simplifies SIPs, mutual funds, tax saving into engaging content that drives massive engagement.',   model: 'Claude 3.5 Sonnet' },
  entertainment: { name: 'Entertainment Agent',       emoji: '🎬', description: 'Bollywood, OTT culture, memes — viral content for Indian Gen-Z and millennials.',                 model: 'Claude 3.5 Sonnet' },
  education:     { name: 'Education Content Agent',   emoji: '📚', description: 'Turns complex topics into viral learning content for India\'s massive student audience.',          model: 'Claude 3.5 Sonnet' },
  gaming:        { name: 'Gaming Expert Agent',       emoji: '🎮', description: 'BGMI, Free Fire, esports culture — built for Indian gaming creators.',                            model: 'Claude 3.5 Sonnet' },
  health:        { name: 'Health & Wellness Agent',   emoji: '🌿', description: 'Indian wellness, Ayurveda, mental health content tailored for health-seeking audiences.',          model: 'Claude 3.5 Sonnet' },
  business:      { name: 'Business Strategy Agent',   emoji: '💼', description: 'Startup stories, leadership insights, and business growth content for Indian professionals.',      model: 'Claude 3.5 Sonnet' },
  product:       { name: 'Product Review Agent',      emoji: '📦', description: 'Honest reviews, unboxing hooks, and comparison content that converts Indian buyers.',              model: 'Claude 3.5 Sonnet' },
  general:       { name: 'Content Strategy Agent',    emoji: '✦',  description: 'Broad Indian content strategist — platform algorithms, creator trends, and viral frameworks.',    model: 'Claude 3.5 Sonnet' },
}

// ── Processing pipeline stages shown during upload ─────────────────────────
const UPLOAD_STAGES = [
  {
    id: 'analyze',
    label: 'Analyzing content',
    sub: 'Reading file metadata and validating input',
    icon: '🔍',
  },
  {
    id: 'transcribe',
    label: 'Recognizing script',
    sub: 'Transcribing audio and detecting language',
    icon: '🎙️',
  },
  {
    id: 'domain',
    label: 'Detecting domain',
    sub: 'Activating the right niche AI agent',
    icon: '🧠',
  },
  {
    id: 'generate',
    label: 'Generating content',
    sub: 'Writing platform-optimised scripts in parallel',
    icon: '⚡',
  },
  {
    id: 'virality',
    label: 'Scoring virality',
    sub: 'Computing hook strength, trends and reach',
    icon: '📈',
  },
]

export default function UploadPage() {
  const router = useRouter()
  const { user, isAuthenticated, hydrated } = useAuth()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [currentStageIndex, setCurrentStageIndex] = useState(-1)
  const [generatedContent, setGeneratedContent] = useState<Record<string, PlatformContent> | null>(null)
  const [fullResults, setFullResults] = useState<FullResults | null>(null)
  const [showAllHooks, setShowAllHooks] = useState(false)
  const [showAllImprovements, setShowAllImprovements] = useState(false)
  const [copiedHook, setCopiedHook] = useState<number | null>(null)
  const [copiedSection, setCopiedSection] = useState<string | null>(null)
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null)
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null)
  const [iterationNumber, setIterationNumber] = useState(1)
  const [isRefining, setIsRefining] = useState(false)
  const [draftSaved, setDraftSaved] = useState(false)
  const [savedTranscript, setSavedTranscript] = useState('')
  const [activeAgent, setActiveAgent] = useState<string | null>(null) // domain key of active agent

  // AI-First ideation state
  const [ideaText, setIdeaText] = useState('')
  const [ideaTone, setIdeaTone] = useState('energetic')
  const isAiFirst = user?.creatorMode === 'ai-first'

  // Extract a thumbnail from the uploaded video file using HTML5 canvas
  useEffect(() => {
    if (!selectedFile || !selectedFile.type.startsWith('video/')) {
      // Don't wipe a restored thumbnail — only clear if there's no persisted one
      if (selectedFile === null) {
        // check localStorage before nuking — restore effect runs first via hydration guard
      }
      return
    }
    const url = URL.createObjectURL(selectedFile)
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.muted = true
    video.src = url
    video.onloadedmetadata = () => {
      video.currentTime = Math.max(video.duration * 0.12, 1) // 12% in — past black intro frames
    }
    video.onseeked = () => {
      const canvas = document.createElement('canvas')
      // Use native video dimensions to avoid any stretching
      const maxWidth = 1280
      const scale = Math.min(1, maxWidth / (video.videoWidth || maxWidth))
      canvas.width  = Math.round((video.videoWidth  || 1280) * scale)
      canvas.height = Math.round((video.videoHeight || 720)  * scale)
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        setVideoThumbnail(canvas.toDataURL('image/jpeg', 0.88))
      }
      URL.revokeObjectURL(url)
    }
    video.onerror = () => URL.revokeObjectURL(url)
  }, [selectedFile])

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

  // ── Restore session from localStorage on mount ───────────────────────────
  useEffect(() => {
    if (!hydrated) return
    try {
      const raw = localStorage.getItem(UPLOAD_SESSION_KEY)
      if (!raw) return
      const s = JSON.parse(raw)
      if (!s.savedAt || Date.now() - new Date(s.savedAt).getTime() > SESSION_TTL_MS) {
        localStorage.removeItem(UPLOAD_SESSION_KEY)
        return
      }
      if (s.generatedContent) setGeneratedContent(s.generatedContent)
      if (s.fullResults)      setFullResults(s.fullResults)
      if (s.savedTranscript)  setSavedTranscript(s.savedTranscript)
      if (s.videoThumbnail)   setVideoThumbnail(s.videoThumbnail)
      if (s.iterationNumber)  setIterationNumber(s.iterationNumber)
      if (s.activeAgent !== undefined) setActiveAgent(s.activeAgent)
      if (s.ideaText)         setIdeaText(s.ideaText)
      if (s.ideaTone)         setIdeaTone(s.ideaTone)
      if (s.viralData)        setViralData(s.viralData)
      if (s.youtubeUrl)       setYoutubeUrl(s.youtubeUrl)
      if (s.uploadedFileName) setUploadedFileName(s.uploadedFileName)
    } catch { /* ignore parse errors */ }
  }, [hydrated]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-save session whenever key results change ────────────────────────
  useEffect(() => {
    if (!hydrated) return
    if (!generatedContent && !ideaText && !youtubeUrl && !uploadedFileName) return
    try {
      localStorage.setItem(UPLOAD_SESSION_KEY, JSON.stringify({
        generatedContent,
        fullResults,
        savedTranscript,
        videoThumbnail,
        iterationNumber,
        activeAgent,
        ideaText,
        ideaTone,
        viralData,
        youtubeUrl,
        uploadedFileName,
        savedAt: new Date().toISOString(),
      }))
    } catch { /* quota exceeded or private mode */ }
  }, [hydrated, generatedContent, fullResults, savedTranscript, videoThumbnail, iterationNumber, activeAgent, ideaText, ideaTone, viralData, youtubeUrl, uploadedFileName]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Clear all upload state + localStorage ────────────────────────────────
  const clearUploadSession = () => {
    setSelectedFile(null)
    setUploadedFileName(null)
    setYoutubeUrl('')
    setGeneratedContent(null)
    setFullResults(null)
    setSavedTranscript('')
    setVideoThumbnail(null)
    setIterationNumber(1)
    setActiveAgent(null)
    setIdeaText('')
    setIdeaTone('energetic')
    setViralData(null)
    setUploadProgress(0)
    setCurrentStageIndex(-1)
    setError(null)
    setDraftSaved(false)
    localStorage.removeItem(UPLOAD_SESSION_KEY)
  }

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setUploadedFileName(file.name)
    setYoutubeUrl('')
    setUploadProgress(0)
    setError(null)
    setGeneratedContent(null)
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setYoutubeUrl(e.target.value)
    if (e.target.value) { setSelectedFile(null); setUploadedFileName(null) }
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
    const deadline = Date.now() + PROCESS_TIMEOUT_MS

    // Step 1: Queue the job
    const queueRes = await fetch(`${API_BASE_URL}/api/upload-to-results/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        userId: user?.id || 'demo_user',
        platforms: TARGET_PLATFORMS,
        domain: user?.domain || 'general',
      }),
    })
    const queueData = await queueRes.json()
    if (!queueRes.ok || !queueData.success) {
      throw new Error(queueData.message || queueData.error || 'Failed to queue processing job')
    }

    const jobId: string = queueData.jobId

    // Step 2: Poll status until completed or failed
    const POLL_INTERVAL = 3000
    while (Date.now() < deadline) {
      await new Promise(r => setTimeout(r, POLL_INTERVAL))

      const statusRes = await fetch(`${API_BASE_URL}/api/upload-to-results/status/${jobId}`)
      if (!statusRes.ok) continue

      const statusData = await statusRes.json()
      const job = statusData.job || {}
      const status: string = job.status || ''
      const progress: number = job.progress || 0
      const step: string = job.currentStep || ''

      // Update UI with live progress — map backend step string → stage index
      if (step) {
        const s = step.toLowerCase()
        if (s.includes('transcrib') || s.includes('speech') || s.includes('audio')) {
          setCurrentStageIndex(1)
        } else if (s.includes('domain') || s.includes('agent') || s.includes('niche')) {
          setCurrentStageIndex(2)
        } else if (s.includes('generat') || s.includes('content') || s.includes('platform')) {
          setCurrentStageIndex(3)
        } else if (s.includes('viral') || s.includes('scor') || s.includes('analyz')) {
          setCurrentStageIndex(4)
        }
      }
      if (progress > 0) setUploadProgress(Math.min(60 + Math.round(progress * 0.35), 94))

      if (status === 'completed') break
      if (status === 'failed') {
        throw new Error(job.error || 'Processing failed on the server')
      }
    }

    if (Date.now() >= deadline) {
      throw new Error('Generation timed out after 5 minutes. Try uploading a shorter video.')
    }

    // Step 3: Fetch the results
    const resultsRes = await fetch(`${API_BASE_URL}/api/upload-to-results/results/${jobId}`)
    if (!resultsRes.ok) throw new Error('Failed to retrieve results')
    const resultsData = await resultsRes.json()

    return resultsData.results as FullResults
  }

  const handleIdeate = async () => {
    if (!ideaText.trim() || ideaText.trim().length < 10) {
      setError('Please describe your idea in at least a few words')
      return
    }

    setIsUploading(true)
    setError(null)
    setGeneratedContent(null)
    setCurrentStageIndex(0)
    setUploadProgress(8)
    setActiveAgent(user?.domain || 'general')

    try {
      setCurrentStageIndex(1)
      setUploadProgress(22)

      setCurrentStageIndex(2)
      setUploadProgress(42)

      const res = await fetch(`${API_BASE_URL}/api/ideate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: ideaText.trim(),
          domain: user?.domain || 'general',
          tone: ideaTone,
          targetAudience: user?.audienceType,
        }),
      })

      setUploadProgress(68)
      setCurrentStageIndex(3)

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Ideation failed')

      setCurrentStageIndex(4)
      setUploadProgress(92)
      setUploadProgress(100)

      const platforms = data.results?.platforms || data.results || {}
      setGeneratedContent(platforms)
      setSavedTranscript(ideaText.trim())
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      setCurrentStageIndex(-1)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile && !youtubeUrl) {
      setError('Please provide a file or a video link')
      return
    }

    setIsUploading(true)
    setError(null)
    setGeneratedContent(null)
    setCurrentStageIndex(0)
    setUploadProgress(5)
    setActiveAgent(user?.domain || 'general')

    try {
      if (youtubeUrl) {
        setCurrentStageIndex(0)
        setUploadProgress(18)
        const response = await fetch(`${API_BASE_URL}/api/upload/youtube`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: youtubeUrl, userId: user?.id || 'demo_user' })
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'Failed to process URL')
        setCurrentStageIndex(1)
        setUploadProgress(38)
        const results = await processUploadToResults({
          fileId: data.fileId,
          fileName: data.metadata?.title || 'YouTube Video',
          mimeType: 'video/mp4',
          url: youtubeUrl,
        })
        setFullResults(results)
        setGeneratedContent(results?.platforms || null)
        setIterationNumber(1)
        setDraftSaved(false)
        setCurrentStageIndex(4)
        setUploadProgress(100)
        const transcript = results?.platforms?.analytics?.content || results?.platforms?.youtube?.content || youtubeUrl
        setSavedTranscript(transcript)
        fetchViralAnalysis(transcript)
      } else if (selectedFile) {
        setCurrentStageIndex(0)
        setUploadProgress(8)

        try {
          const result = await api.upload.file(selectedFile, (progress) => {
            setUploadProgress(8 + Math.round(progress * 0.42)) // 8% to 50%
          }, user?.id || 'demo_user')

          setCurrentStageIndex(1)
          setUploadProgress(52)
          const results = await processUploadToResults({
            fileId: result.fileId,
            fileName: result.fileName,
            mimeType: result.mimeType,
            localPath: (result as any).localPath,
          })
          setFullResults(results)
          setGeneratedContent(results?.platforms || null)
          setIterationNumber(1)
          setDraftSaved(false)
          setCurrentStageIndex(4)
          setUploadProgress(100)
          const transcript = results?.platforms?.analytics?.content || results?.platforms?.youtube?.content || selectedFile?.name || ''
          setSavedTranscript(transcript)
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
      setCurrentStageIndex(-1)
    }
  }

  const canUpload = (selectedFile || youtubeUrl) && !isUploading

  const handleReimproving = async () => {
    if (!generatedContent) return
    setIsRefining(true)
    setError(null)

    const improvements = [
      ...(viralData?.suggestions || []),
      ...(fullResults?.contentFeedback?.improvements?.map(imp => imp.suggested) || []),
      ...(fullResults?.viralAnalysis?.recommendations?.slice(0, 2) || []),
    ].slice(0, 5)

    const platforms = TARGET_PLATFORMS.filter(p => p !== 'analytics' && generatedContent[p])

    try {
      const refinedContent: Record<string, PlatformContent> = { ...generatedContent }

      await Promise.all(platforms.map(async (platform) => {
        const prev = generatedContent[platform]
        if (!prev) return
        try {
          const res = await fetch(`${API_BASE_URL}/api/content/refine`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              platform,
              transcript: savedTranscript,
              previousContent: prev.content,
              improvements,
              domain: user?.domain || fullResults?.analytics?.detectedDomain || 'general',
              audienceType: user?.audienceType || 'general',
              iterationNumber: iterationNumber + 1,
            }),
          })
          if (res.ok) {
            const data = await res.json()
            if (data.success && data.refinedContent) {
              refinedContent[platform] = { ...prev, content: data.refinedContent }
            }
          } else if (res.status === 429) {
            throw new Error('AI rate limit reached for today. Try again tomorrow or use the workspace to manually edit your drafts.')
          }
        } catch (e: any) {
          if (e.message?.includes('rate limit') || e.message?.includes('tomorrow')) throw e
          /* keep original if one platform fails for other reasons */
        }
      }))

      setGeneratedContent(refinedContent)
      setIterationNumber(n => n + 1)
      setDraftSaved(false)
      // Re-run viral analysis on refined content
      const newTranscript = refinedContent?.youtube?.content || refinedContent?.instagram?.content || savedTranscript
      fetchViralAnalysis(newTranscript)
    } catch (e: any) {
      setError('Re-improvise failed: ' + (e.message || 'Unknown error'))
    } finally {
      setIsRefining(false)
    }
  }

  const saveDraft = () => {
    if (!generatedContent) return
    const draft = {
      draftId: `draft_${Date.now()}`,
      name: `Draft ${iterationNumber}`,
      iterationNumber,
      platforms: Object.fromEntries(
        TARGET_PLATFORMS
          .filter(p => generatedContent[p])
          .map(p => [p, generatedContent[p].content])
      ),
      createdAt: new Date().toISOString(),
      domain: user?.domain || fullResults?.analytics?.detectedDomain || 'general',
    }
    const existing = JSON.parse(localStorage.getItem('kla_drafts') || '[]')
    localStorage.setItem('kla_drafts', JSON.stringify([draft, ...existing]))
    localStorage.setItem('kla_current_draft', JSON.stringify(draft))
    localStorage.setItem('workspaceContent', JSON.stringify({
      platform: 'youtube',
      content: generatedContent,
      viralScore: fullResults?.viralScore,
      domain: draft.domain,
    }))
    setDraftSaved(true)
    setTimeout(() => router.push('/workspace'), 800)
  }

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
            {isAiFirst
              ? <><span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Ideate</span> Content</>
              : <>Upload <span className="bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">Content</span></>
            }
          </h1>
          <p className="mt-2 text-white/40 text-sm">
            {isAiFirst
              ? 'Describe your idea — the AI will write the script, hooks, titles and platform content from scratch.'
              : 'One video → 8+ platform-ready formats, powered by AWS Bedrock + Transcribe.'}
          </p>
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

        {/* ── AI-First: Ideation panel ── */}
        {isAiFirst ? (
          <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-6 space-y-5">
            {/* Agent info */}
            {user?.domain && DOMAIN_AGENTS[user.domain] && (
              <div className="flex items-center gap-3 bg-purple-500/8 border border-purple-500/20 rounded-xl px-4 py-3">
                <span className="text-xl">{DOMAIN_AGENTS[user.domain].emoji}</span>
                <div>
                  <p className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest">Ready to generate</p>
                  <p className="text-sm font-semibold text-white/90">{DOMAIN_AGENTS[user.domain].name}</p>
                  <p className="text-[11px] text-white/40">{DOMAIN_AGENTS[user.domain].description}</p>
                </div>
              </div>
            )}

            {/* Idea input */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-white/40 uppercase tracking-widest">Your Idea</label>
              <textarea
                value={ideaText}
                onChange={(e) => setIdeaText(e.target.value)}
                rows={5}
                placeholder={`e.g. "A video about the top 5 underrated hill stations in India that most people have never heard of — budget trip, local food, and hidden spots"`}
                className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 transition-all resize-none leading-relaxed"
              />
              <p className="text-[11px] text-white/25">Be as specific as possible — topic, angle, key points, any inspiration. The more you share, the better the output.</p>
            </div>

            {/* Tone selector */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-white/40 uppercase tracking-widest">Tone</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'energetic',     label: '⚡ Energetic'     },
                  { id: 'informative',   label: '📖 Informative'   },
                  { id: 'conversational',label: '💬 Conversational' },
                  { id: 'inspirational', label: '🌟 Inspirational'  },
                  { id: 'humorous',      label: '😄 Humorous'       },
                  { id: 'professional',  label: '💼 Professional'   },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setIdeaTone(t.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      ideaTone === t.id
                        ? 'bg-brand-600 text-white border border-brand-500'
                        : 'bg-white/[0.04] border border-white/[0.08] text-white/50 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ── Upload Zone ── */
          <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-6 space-y-6">
            <FileUploader onFileSelect={handleFileSelect} selectedFile={selectedFile} />

            {/* Show previously uploaded filename when returning after tab switch */}
            {!selectedFile && uploadedFileName && !generatedContent && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-brand-500/25 text-sm">
                <span className="text-brand-400 text-base flex-shrink-0">📁</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 font-medium truncate">{uploadedFileName}</p>
                  <p className="text-[11px] text-white/40 mt-0.5">Previously selected — re-select the file or paste a URL to process</p>
                </div>
                <button
                  onClick={() => { setUploadedFileName(null); localStorage.removeItem(UPLOAD_SESSION_KEY) }}
                  className="text-white/30 hover:text-white/60 transition-colors flex-shrink-0 text-xs px-2"
                >✕</button>
              </div>
            )}

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
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            <span>⚠</span>
            <span>{error}</span>
          </div>
        )}

        {/* Progress pipeline */}
        {isUploading && (
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 space-y-4">
            {/* Agent banner */}
            {activeAgent && DOMAIN_AGENTS[activeAgent] && (
              <div className="flex items-center gap-3 bg-brand-500/8 border border-brand-500/20 rounded-xl px-4 py-3">
                <span className="text-xl">{DOMAIN_AGENTS[activeAgent].emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest">Agent Active</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
                  </div>
                  <p className="text-sm font-semibold text-white/90">{DOMAIN_AGENTS[activeAgent].name}</p>
                </div>
                <span className="text-[10px] font-mono text-cyan-400/70 shrink-0">{DOMAIN_AGENTS[activeAgent].model}</span>
              </div>
            )}

            {/* Step-by-step pipeline */}
            <div className="space-y-1">
              {UPLOAD_STAGES.map((stage, i) => {
                const isDone    = i < currentStageIndex
                const isActive  = i === currentStageIndex
                const isPending = i > currentStageIndex

                return (
                  <div
                    key={stage.id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      isActive  ? 'bg-brand-500/10 border border-brand-500/25' :
                      isDone    ? 'bg-white/[0.02] border border-white/[0.04]' :
                                  'border border-transparent'
                    }`}
                  >
                    {/* Status icon */}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                      isDone   ? 'bg-emerald-500/20 text-emerald-400' :
                      isActive ? 'bg-brand-500/20 text-brand-300' :
                                 'bg-white/[0.04] text-white/20'
                    }`}>
                      {isDone ? (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : isActive ? (
                        <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse block" />
                      ) : (
                        <span className="text-sm opacity-40">{stage.icon}</span>
                      )}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-semibold transition-colors duration-300 ${
                        isDone   ? 'text-white/50 line-through decoration-white/20' :
                        isActive ? 'text-white' :
                                   'text-white/25'
                      }`}>
                        {stage.label}
                      </div>
                      {isActive && (
                        <div className="text-[11px] text-brand-400/70 font-mono mt-0.5 animate-pulse">
                          {stage.sub}
                        </div>
                      )}
                    </div>

                    {/* Right badge */}
                    <div className="flex-shrink-0 text-right">
                      {isDone && (
                        <span className="text-[10px] font-mono text-emerald-400/70 uppercase tracking-wide">Done</span>
                      )}
                      {isActive && (
                        <span className="text-[10px] font-mono text-brand-400 uppercase tracking-wide animate-pulse">Running…</span>
                      )}
                      {isPending && (
                        <span className="text-[10px] font-mono text-white/15 uppercase tracking-wide">Queued</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Overall progress bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-white/30 font-mono">Overall progress</span>
                <span className="text-sm font-mono font-bold text-brand-400">{uploadProgress}%</span>
              </div>
              <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-500 to-cyan-400 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        {isAiFirst ? (
          <>
            {ideaText.trim().length >= 10 && !isUploading && (
              <div className="flex gap-3">
                <button
                  onClick={handleIdeate}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-4 rounded-xl font-bold font-display text-base transition-all duration-200 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30"
                >
                  ✦ Generate Content from Idea →
                </button>
                <button
                  onClick={() => { setIdeaText(''); setIdeaTone('energetic') }}
                  className="px-6 py-4 bg-white/[0.03] border border-white/[0.07] text-white/60 rounded-xl hover:border-white/[0.15] hover:text-white transition-all"
                >
                  Clear
                </button>
              </div>
            )}
            {ideaText.trim().length < 10 && !isUploading && (
              <button disabled className="w-full py-4 rounded-xl font-bold text-base bg-white/[0.03] border border-white/[0.07] text-white/20 cursor-not-allowed">
                Describe your idea above to continue
              </button>
            )}
          </>
        ) : (
          <>
            {canUpload && (
              <div className="flex gap-3">
                <button
                  onClick={handleUpload}
                  className="flex-1 bg-brand-600 hover:bg-brand-500 text-white py-4 rounded-xl font-bold font-display text-base transition-all duration-200 shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30"
                >
                  Process {youtubeUrl ? 'Link' : 'Content'} →
                </button>
                <button
                  onClick={clearUploadSession}
                  className="px-6 py-4 bg-white/[0.03] border border-white/[0.07] text-white/60 rounded-xl hover:border-white/[0.15] hover:text-white transition-all"
                >
                  Clear
                </button>
              </div>
            )}
            {!canUpload && !isUploading && (
              <button disabled className="w-full py-4 rounded-xl font-bold text-base bg-white/[0.03] border border-white/[0.07] text-white/20 cursor-not-allowed">
                Select a file or paste a URL to continue
              </button>
            )}
          </>
        )}

        {generatedContent && (
          <div className="space-y-4">
            {/* Agent attribution badge */}
            {activeAgent && DOMAIN_AGENTS[activeAgent] && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-brand-500/6 border border-brand-500/15 rounded-xl">
                <span className="text-base">{DOMAIN_AGENTS[activeAgent].emoji}</span>
                <span className="text-xs text-brand-400/80 font-mono">
                  {DOMAIN_AGENTS[activeAgent].name} · {DOMAIN_AGENTS[activeAgent].model} · Parallel generation
                </span>
              </div>
            )}
            {/* Section header */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-semibold text-white">Platform Content</h2>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    iterationNumber > 1 ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : 'bg-white/[0.07] text-white/40'
                  }`}>
                    Draft {iterationNumber}
                  </span>
                  {isRefining && (
                    <span className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-400">
                      <span className="w-3 h-3 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
                      Refining…
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/40">AI-crafted for each platform&apos;s algorithm and audience</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={saveDraft}
                  disabled={draftSaved}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    draftSaved
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-white/[0.06] border border-white/[0.12] text-white/80 hover:border-brand-500/40 hover:text-white'
                  }`}
                >
                  {draftSaved ? '✓ Saved' : '💾 Save to Workspace'}
                </button>
                <button
                  onClick={() => { saveDraft(); }}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  Open Workspace ↗
                </button>
              </div>
            </div>

            {/* Thumbnail strip (video uploads only) */}
            {videoThumbnail && (
              <div className="rounded-xl overflow-hidden border border-white/[0.07] relative">
                {/* 16:9 aspect ratio container prevents stretching */}
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <img
                    src={videoThumbnail}
                    alt="Video thumbnail"
                    className="absolute inset-0 w-full h-full object-contain bg-black"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                </div>
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <span className="text-[10px] font-mono bg-black/60 text-white/70 px-2 py-0.5 rounded">THUMBNAIL PREVIEW</span>
                  <button
                    onClick={() => {
                      const a = document.createElement('a')
                      a.href = videoThumbnail
                      a.download = 'thumbnail.jpg'
                      a.click()
                    }}
                    className="text-[10px] font-mono bg-brand-600/80 hover:bg-brand-500 text-white px-2 py-0.5 rounded transition-colors"
                  >
                    ↓ Save
                  </button>
                </div>
              </div>
            )}

            {/* Platform cards grid */}
            <div className="grid grid-cols-1 gap-3">
              {TARGET_PLATFORMS.filter(p => p !== 'analytics' && generatedContent[p]).map((platform) => {
                const content = generatedContent[platform]
                const meta = (content.metadata || {}) as Record<string, any>
                const isExpanded = expandedPlatform === platform

                const PLATFORM_CONFIG: Record<string, { icon: string; color: string; bg: string; border: string; label: string }> = {
                  youtube:   { icon: '▶', color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/20',    label: 'YouTube' },
                  instagram: { icon: '◎', color: 'text-pink-400',   bg: 'bg-pink-500/10',   border: 'border-pink-500/20',   label: 'Instagram' },
                  tiktok:    { icon: '♪', color: 'text-cyan-400',   bg: 'bg-cyan-500/10',   border: 'border-cyan-500/20',   label: 'TikTok' },
                  linkedin:  { icon: 'in', color: 'text-blue-400',  bg: 'bg-blue-500/10',   border: 'border-blue-500/20',   label: 'LinkedIn' },
                  twitter:   { icon: '𝕏', color: 'text-sky-400',   bg: 'bg-sky-500/10',    border: 'border-sky-500/20',    label: 'X / Twitter' },
                  blog:      { icon: '✍', color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', label: 'Blog Post' },
                  podcast:   { icon: '🎙', color: 'text-amber-400', bg: 'bg-amber-500/10',  border: 'border-amber-500/20',  label: 'Podcast' },
                }
                const cfg = PLATFORM_CONFIG[platform] || { icon: '◆', color: 'text-white/60', bg: 'bg-white/5', border: 'border-white/10', label: platform }

                const copyText = (text: string, key: string) => {
                  navigator.clipboard.writeText(text)
                  setCopiedSection(key)
                  setTimeout(() => setCopiedSection(null), 2000)
                }

                const CopyBtn = ({ text, label }: { text: string; label: string }) => (
                  <button
                    onClick={() => copyText(text, label)}
                    className={`text-[10px] font-mono px-2 py-0.5 rounded transition-colors flex-shrink-0 ${
                      copiedSection === label ? 'bg-green-500/20 text-green-400' : `${cfg.bg} ${cfg.color} hover:opacity-80`
                    }`}
                  >
                    {copiedSection === label ? '✓ Copied' : '📋 Copy'}
                  </button>
                )

                return (
                  <div key={platform} className={`rounded-2xl border ${cfg.border} bg-white/[0.02] overflow-hidden`}>
                    {/* Card header */}
                    <div className={`flex items-center justify-between px-4 py-3 ${cfg.bg} border-b ${cfg.border}`}>
                      <div className="flex items-center gap-2.5">
                        <span className={`text-base ${cfg.color} font-bold w-6 text-center`}>{cfg.icon}</span>
                        <span className={`text-sm font-bold ${cfg.color}`}>{cfg.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {content.hashtags && content.hashtags.length > 0 && (
                          <span className="text-[10px] text-white/30 font-mono">{content.hashtags.length} hashtags</span>
                        )}
                        <button
                          onClick={() => setExpandedPlatform(isExpanded ? null : platform)}
                          className={`text-[11px] font-mono px-3 py-1 rounded-lg border ${cfg.border} ${cfg.color} ${cfg.bg} hover:opacity-80 transition-opacity`}
                        >
                          {isExpanded ? '↑ Collapse' : '↓ Expand'}
                        </button>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      {/* Hook — shown always */}
                      {(meta.hook || meta.headline) && (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-mono uppercase tracking-widest ${cfg.color} opacity-70`}>
                              {platform === 'linkedin' ? '🎯 Opening Line' : '⚡ Hook'}
                            </span>
                            <CopyBtn text={meta.hook || meta.headline} label={`${platform}-hook`} />
                          </div>
                          <p className={`text-sm font-semibold text-white leading-relaxed p-2.5 rounded-xl ${cfg.bg} border ${cfg.border}`}>
                            {meta.hook || meta.headline}
                          </p>
                        </div>
                      )}

                      {/* Title / headline */}
                      {content.title && platform !== 'linkedin' && (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-mono uppercase tracking-widest ${cfg.color} opacity-70`}>Title</span>
                            <CopyBtn text={content.title} label={`${platform}-title`} />
                          </div>
                          <p className="text-sm text-white/90 font-medium">{content.title}</p>
                          {/* Alternative titles for YouTube */}
                          {meta.titleAlternatives && meta.titleAlternatives.length > 0 && isExpanded && (
                            <div className="space-y-1 mt-1">
                              {meta.titleAlternatives.map((alt: string, i: number) => (
                                <div key={i} className="flex items-center justify-between gap-2 text-xs text-white/50 py-0.5">
                                  <span>{alt}</span>
                                  <CopyBtn text={alt} label={`${platform}-title-alt-${i}`} />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Main content / caption / post */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-mono uppercase tracking-widest ${cfg.color} opacity-70`}>
                            {platform === 'twitter' ? 'Thread' : platform === 'youtube' ? 'Description' : platform === 'podcast' ? 'Intro Script' : platform === 'blog' ? 'Opening' : 'Caption'}
                          </span>
                          <CopyBtn text={content.content} label={`${platform}-content`} />
                        </div>
                        <p className={`text-xs text-white/70 leading-relaxed ${isExpanded ? '' : 'line-clamp-4'}`}>
                          {content.content}
                        </p>
                      </div>

                      {/* Platform-specific expanded sections */}
                      {isExpanded && (
                        <div className="space-y-3 pt-1 border-t border-white/[0.05]">
                          {/* YouTube: chapters + thumbnail concept */}
                          {platform === 'youtube' && meta.chapters && (
                            <div className="space-y-1.5">
                              <span className={`text-[10px] font-mono uppercase tracking-widest ${cfg.color} opacity-70`}>Chapters</span>
                              <div className="space-y-1">
                                {meta.chapters.map((ch: { time: string; title: string }, i: number) => (
                                  <div key={i} className="flex items-center gap-3 text-xs">
                                    <span className="font-mono text-white/30 w-10">{ch.time}</span>
                                    <span className="text-white/70">{ch.title}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {platform === 'youtube' && meta.thumbnailConcept && (
                            <div className="space-y-1.5">
                              <span className={`text-[10px] font-mono uppercase tracking-widest ${cfg.color} opacity-70`}>🖼 Thumbnail Concept</span>
                              <p className="text-xs text-white/70 italic">{meta.thumbnailConcept}</p>
                            </div>
                          )}

                          {/* Instagram: reel concept + cover */}
                          {platform === 'instagram' && meta.reelConcept && (
                            <div className="space-y-1.5">
                              <span className={`text-[10px] font-mono uppercase tracking-widest ${cfg.color} opacity-70`}>🎬 Reel Structure</span>
                              <p className="text-xs text-white/70">{meta.reelConcept}</p>
                            </div>
                          )}
                          {platform === 'instagram' && meta.coverConcept && (
                            <div className="space-y-1.5">
                              <span className={`text-[10px] font-mono uppercase tracking-widest ${cfg.color} opacity-70`}>🖼 Cover Concept</span>
                              <p className="text-xs text-white/70 italic">{meta.coverConcept}</p>
                              {videoThumbnail && (
                                <div className="w-32 rounded-xl overflow-hidden mt-1 border border-white/[0.07]">
                                  <div className="relative" style={{ paddingBottom: '100%' }}>
                                    <img src={videoThumbnail} alt="Cover" className="absolute inset-0 w-full h-full object-contain bg-black" />
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* TikTok: video structure + sound */}
                          {platform === 'tiktok' && meta.videoStructure && (
                            <div className="space-y-1.5">
                              <span className={`text-[10px] font-mono uppercase tracking-widest ${cfg.color} opacity-70`}>🎬 Video Structure</span>
                              <p className="text-xs text-white/70">{meta.videoStructure}</p>
                            </div>
                          )}
                          {platform === 'tiktok' && meta.soundSuggestion && (
                            <div className="space-y-1.5">
                              <span className={`text-[10px] font-mono uppercase tracking-widest ${cfg.color} opacity-70`}>🎵 Sound Suggestion</span>
                              <p className="text-xs text-white/70">{meta.soundSuggestion}</p>
                            </div>
                          )}

                          {/* LinkedIn: key insight */}
                          {platform === 'linkedin' && meta.keyInsight && (
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className={`text-[10px] font-mono uppercase tracking-widest ${cfg.color} opacity-70`}>💡 Key Insight</span>
                                <CopyBtn text={meta.keyInsight} label="linkedin-insight" />
                              </div>
                              <p className={`text-xs text-white/80 italic p-2.5 rounded-xl ${cfg.bg} border ${cfg.border}`}>{meta.keyInsight}</p>
                            </div>
                          )}

                          {/* Twitter: full thread */}
                          {platform === 'twitter' && meta.tweets && (
                            <div className="space-y-2">
                              <span className={`text-[10px] font-mono uppercase tracking-widest ${cfg.color} opacity-70`}>Full Thread</span>
                              {meta.tweets.map((tweet: string, i: number) => (
                                <div key={i} className="flex gap-2.5 items-start">
                                  <span className="text-[10px] font-mono text-white/20 w-5 flex-shrink-0 mt-1">{i + 1}</span>
                                  <div className="flex-1 min-w-0 space-y-1">
                                    <p className="text-xs text-white/70 leading-relaxed">{tweet}</p>
                                    <div className="flex items-center gap-2">
                                      <span className={`text-[9px] font-mono ${tweet.length > 280 ? 'text-red-400' : 'text-white/20'}`}>{tweet.length}/280</span>
                                      <CopyBtn text={tweet} label={`twitter-t${i}`} />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Blog: outline */}
                          {platform === 'blog' && meta.outline && (
                            <div className="space-y-1.5">
                              <span className={`text-[10px] font-mono uppercase tracking-widest ${cfg.color} opacity-70`}>Post Outline</span>
                              <div className="space-y-1">
                                {meta.outline.map((item: string, i: number) => (
                                  <div key={i} className="flex items-start gap-2 text-xs text-white/60">
                                    <span className="text-white/20 flex-shrink-0">{'—'}</span>
                                    <span>{item}</span>
                                  </div>
                                ))}
                              </div>
                              {meta.metaDescription && (
                                <div className="mt-2 space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className={`text-[10px] font-mono uppercase tracking-widest ${cfg.color} opacity-70`}>Meta Description</span>
                                    <CopyBtn text={meta.metaDescription} label="blog-meta" />
                                  </div>
                                  <p className="text-xs text-white/50 italic">{meta.metaDescription}</p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Podcast: segments + outro */}
                          {platform === 'podcast' && meta.segments && (
                            <div className="space-y-1.5">
                              <span className={`text-[10px] font-mono uppercase tracking-widest ${cfg.color} opacity-70`}>Episode Segments</span>
                              <div className="space-y-2">
                                {meta.segments.map((seg: { title: string; description: string; duration: string }, i: number) => (
                                  <div key={i} className={`p-2.5 rounded-xl ${cfg.bg} border ${cfg.border} space-y-0.5`}>
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-white/80 font-medium">{seg.title}</span>
                                      {seg.duration && <span className="text-[10px] font-mono text-white/30">{seg.duration}</span>}
                                    </div>
                                    {seg.description && <p className="text-[11px] text-white/50">{seg.description}</p>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {platform === 'podcast' && meta.outro && (
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className={`text-[10px] font-mono uppercase tracking-widest ${cfg.color} opacity-70`}>Outro Script</span>
                                <CopyBtn text={meta.outro} label="podcast-outro" />
                              </div>
                              <p className="text-xs text-white/60 italic">{meta.outro}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Hashtags */}
                      {content.hashtags && content.hashtags.length > 0 && (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-mono uppercase tracking-widest ${cfg.color} opacity-70`}>Hashtags</span>
                            <CopyBtn text={content.hashtags.join(' ')} label={`${platform}-hashtags`} />
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {(isExpanded ? content.hashtags : content.hashtags.slice(0, 8)).map((tag, i) => (
                              <span key={i} className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${cfg.bg} ${cfg.color} opacity-80`}>
                                {tag.startsWith('#') ? tag : `#${tag}`}
                              </span>
                            ))}
                            {!isExpanded && content.hashtags.length > 8 && (
                              <span className="text-[10px] text-white/30 font-mono px-1.5 py-0.5">+{content.hashtags.length - 8} more</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Hook Suggestions ── */}
        {fullResults?.viralAnalysis?.hooks && fullResults.viralAnalysis.hooks.length > 0 && (
          <div className="bg-white/[0.02] border border-cyan-500/20 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 text-lg">💡</span>
              <div>
                <h3 className="text-sm font-semibold text-white">Hook Suggestions</h3>
                <p className="text-xs text-white/40">Use these to maximise your first 3 seconds</p>
              </div>
            </div>
            <div className="space-y-3">
              {(showAllHooks ? fullResults.viralAnalysis.hooks : fullResults.viralAnalysis.hooks.slice(0, 3)).map((hook, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full mt-0.5 flex-shrink-0 ${
                    hook.impact === 'high' ? 'bg-cyan-500/20 text-cyan-400' :
                    hook.impact === 'medium' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-white/10 text-white/40'
                  }`}>{hook.impact?.toUpperCase()}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80">{hook.description}</p>
                    {hook.timestamp && <p className="text-[11px] text-white/30 font-mono mt-0.5">@ {hook.timestamp}</p>}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(hook.description)
                      setCopiedHook(i)
                      setTimeout(() => setCopiedHook(null), 2000)
                    }}
                    className="flex-shrink-0 px-3 py-1 text-[11px] font-mono rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 transition-colors"
                  >
                    {copiedHook === i ? '✓ Copied' : '📋 Copy'}
                  </button>
                </div>
              ))}
            </div>
            {fullResults.viralAnalysis.hooks.length > 3 && (
              <button onClick={() => setShowAllHooks(v => !v)} className="text-xs text-white/40 hover:text-white/70 transition-colors">
                {showAllHooks ? '↑ Show less' : `↓ Show all ${fullResults.viralAnalysis.hooks.length} hooks`}
              </button>
            )}
          </div>
        )}

        {/* ── AI Recommendations ── */}
        {fullResults?.viralAnalysis?.recommendations && fullResults.viralAnalysis.recommendations.length > 0 && (
          <div className="bg-white/[0.02] border border-purple-500/20 rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🚀</span>
              <h3 className="text-sm font-semibold text-white">AI Recommendations</h3>
            </div>
            <ul className="space-y-2">
              {fullResults.viralAnalysis.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-white/70">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 text-[11px] font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Suggested Improvements ── */}
        {fullResults?.contentFeedback?.improvements && fullResults.contentFeedback.improvements.length > 0 && (
          <div className="bg-white/[0.02] border border-orange-500/20 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">✨</span>
                <div>
                  <h3 className="text-sm font-semibold text-white">Suggested Improvements</h3>
                  {fullResults.contentFeedback.grade && (
                    <span className="text-xs text-white/40">Overall Grade: <span className="text-orange-400 font-bold">{fullResults.contentFeedback.grade}</span></span>
                  )}
                </div>
              </div>
              <button
                onClick={handleReimproving}
                disabled={isRefining}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-brand-500/20"
              >
                {isRefining ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Refining Draft {iterationNumber + 1}…
                  </>
                ) : (
                  <>✦ Apply & Re-generate Draft {iterationNumber + 1}</>
                )}
              </button>
            </div>
            <div className="space-y-2">
              {(showAllImprovements ? fullResults.contentFeedback.improvements : fullResults.contentFeedback.improvements.slice(0, 3)).map((imp, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full mt-0.5 flex-shrink-0 ${
                    imp.impact === 'high' ? 'bg-red-500/20 text-red-400' :
                    imp.impact === 'medium' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-white/10 text-white/40'
                  }`}>{imp.impact?.toUpperCase()}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-white/40 uppercase tracking-widest">{imp.aspect}</p>
                    <p className="text-sm text-white/70 mt-0.5">→ {imp.suggested}</p>
                  </div>
                </div>
              ))}
            </div>
            {fullResults.contentFeedback.improvements.length > 3 && (
              <button onClick={() => setShowAllImprovements(v => !v)} className="text-xs text-white/40 hover:text-white/70 transition-colors">
                {showAllImprovements ? '↑ Show less' : `↓ Show all ${fullResults.contentFeedback.improvements.length} improvements`}
              </button>
            )}
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
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-orange-400">⚡</span>
                      <div className="text-xs font-mono font-semibold text-orange-400/70 uppercase tracking-widest">What to Improve</div>
                    </div>
                    <button
                      onClick={handleReimproving}
                      disabled={isRefining}
                      className="text-[11px] font-mono px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-400 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isRefining ? '…' : '↻ Apply All'}
                    </button>
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

        {/* ── Iteration CTA (shown after first analysis) ── */}
        {viralData && !viralLoading && generatedContent && (
          <div className="bg-gradient-to-r from-brand-900/40 to-cyan-900/40 border border-brand-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">🔄</span>
                <h3 className="text-sm font-bold text-white">Not satisfied yet?</h3>
              </div>
              <p className="text-xs text-white/50">
                You&apos;re on <span className="text-brand-400 font-mono font-bold">Draft {iterationNumber}</span>.
                Let AI apply all the improvements above and generate a smarter version.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={saveDraft}
                disabled={draftSaved}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                  draftSaved ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' : 'border-white/[0.12] bg-white/[0.04] text-white/70 hover:text-white hover:border-white/20'
                }`}
              >
                {draftSaved ? '✓ Saved' : '💾 Save Draft'}
              </button>
              <button
                onClick={handleReimproving}
                disabled={isRefining}
                className="px-5 py-2.5 bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand-500/20 whitespace-nowrap"
              >
                {isRefining ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating Draft {iterationNumber + 1}…
                  </span>
                ) : (
                  `✦ Generate Draft ${iterationNumber + 1}`
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
