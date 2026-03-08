'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const PLATFORMS = ['YouTube', 'Instagram', 'TikTok', 'LinkedIn', 'Twitter', 'Blog'] as const;
type Platform = typeof PLATFORMS[number];

interface Draft {
  draftId: string;
  name: string;
  iterationNumber: number;
  platforms: Record<string, string>;
  createdAt: string;
}

const AVATAR_COLORS = ['from-violet-500 to-indigo-500', 'from-cyan-500 to-blue-500', 'from-emerald-500 to-teal-500'];
const COLLAB_INITIALS = ['S', 'R'];

export default function WorkspacePage() {
  const { user } = useAuth();

  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);
  const [activePlatform, setActivePlatform] = useState<Platform>('YouTube');
  const [editedContent, setEditedContent] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [copyStatus, setCopyStatus] = useState(false);

  // Load drafts from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('kla_drafts');
      const currentRaw = localStorage.getItem('kla_current_draft');

      // kla_current_draft always holds the most recently saved draft
      let activeToLoad: Draft | null = null;
      if (currentRaw) {
        activeToLoad = JSON.parse(currentRaw);
      }

      if (raw) {
        const parsed: Draft[] = JSON.parse(raw);
        setDrafts(parsed);
        // Use kla_current_draft if available, otherwise newest (index 0)
        const latest = activeToLoad || parsed[0];
        if (latest) {
          setSelectedDraft(latest);
          const platformKey = activePlatform.toLowerCase();
          setEditedContent(latest.platforms[platformKey] || '');
        }
      } else if (activeToLoad) {
        setDrafts([activeToLoad]);
        setSelectedDraft(activeToLoad);
        const platformKey = activePlatform.toLowerCase();
        setEditedContent(activeToLoad.platforms[platformKey] || '');
      }
    } catch {
      // ignore parse errors
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDraft = useCallback((draft: Draft) => {
    setSelectedDraft(draft);
    setActivePlatform('YouTube');
    setEditedContent(draft.platforms['youtube'] || draft.platforms['YouTube'] || '');
    setPublishStatus('idle');
  }, []);

  const switchPlatform = useCallback((platform: Platform) => {
    // Save current edits back to selectedDraft in memory
    if (selectedDraft) {
      const key = activePlatform.toLowerCase();
      setSelectedDraft(prev => prev ? { ...prev, platforms: { ...prev.platforms, [key]: editedContent } } : prev);
    }
    setActivePlatform(platform);
    if (selectedDraft) {
      const key = platform.toLowerCase();
      const content = selectedDraft.platforms[key] || selectedDraft.platforms[platform] || '';
      setEditedContent(content);
    }
  }, [selectedDraft, activePlatform, editedContent]);

  const handlePublishToCommunity = async () => {
    if (!editedContent.trim()) return;
    setIsPublishing(true);
    setPublishStatus('idle');
    try {
      const res = await fetch(`${API_BASE}/api/community/post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || 'guest',
          content: editedContent,
          images: [],
        }),
      });
      if (res.ok) {
        setPublishStatus('success');
      } else {
        setPublishStatus('error');
      }
    } catch {
      setPublishStatus('error');
    } finally {
      setIsPublishing(false);
      setTimeout(() => setPublishStatus('idle'), 3000);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editedContent).then(() => {
      setCopyStatus(true);
      setTimeout(() => setCopyStatus(false), 2000);
    });
  };

  const handleDownload = () => {
    const blob = new Blob([editedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedDraft?.name || 'draft'}-${activePlatform}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const hasDrafts = drafts.length > 0;

  return (
    <div className="min-h-screen bg-[#030712] text-white flex flex-col">
      {/* Header */}
      <header className="bg-[#0A0E1A] border-b border-white/[0.07] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-600/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold text-white font-display">
              {selectedDraft ? selectedDraft.name : 'Workspace'}
            </h1>
            {selectedDraft && (
              <span className="text-xs text-white/30">
                {new Date(selectedDraft.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            )}
          </div>
          {selectedDraft && (
            <span className="ml-2 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-brand-500/15 text-brand-400 border border-brand-500/20">
              Draft {selectedDraft.iterationNumber}
            </span>
          )}
        </div>

        {/* Collaborators */}
        <div className="flex items-center gap-3">
          <div className="flex items-center -space-x-2">
            {COLLAB_INITIALS.map((initial, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full bg-gradient-to-br ${AVATAR_COLORS[i + 1]} border-2 border-[#0A0E1A] flex items-center justify-center text-xs font-bold`}
                title={`Collaborator ${i + 1}`}
              >
                {initial}
              </div>
            ))}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 border-2 border-[#0A0E1A] flex items-center justify-center text-xs font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'Y'}
            </div>
          </div>
          <button className="text-xs text-brand-400 hover:text-brand-300 font-semibold border border-brand-500/20 px-3 py-1.5 rounded-lg hover:bg-brand-500/10 transition-all">
            + Invite collaborator
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar — Draft list */}
        <aside className="w-64 border-r border-white/[0.08] bg-[#0A0E1A] flex flex-col overflow-hidden">
          <div className="p-4 border-b border-white/[0.06]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-white/40">Saved Drafts</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {drafts.length === 0 ? (
              <div className="text-center py-8 px-3">
                <div className="text-3xl mb-3 opacity-30">📄</div>
                <p className="text-xs text-white/30 leading-relaxed">No drafts yet. Upload a video to generate content.</p>
              </div>
            ) : (
              drafts.map((draft) => (
                <button
                  key={draft.draftId}
                  onClick={() => loadDraft(draft)}
                  className={`w-full text-left p-3 rounded-xl transition-all ${
                    selectedDraft?.draftId === draft.draftId
                      ? 'bg-brand-500/15 border border-brand-500/30'
                      : 'bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium text-white/90 truncate leading-tight">{draft.name}</span>
                    <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      selectedDraft?.draftId === draft.draftId ? 'bg-brand-500/20 text-brand-400' : 'bg-white/[0.06] text-white/30'
                    }`}>
                      v{draft.iterationNumber}
                    </span>
                  </div>
                  <div className="text-[11px] text-white/30 mt-1">
                    {new Date(draft.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {Object.keys(draft.platforms).slice(0, 3).map((p) => (
                      <span key={p} className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.05] text-white/30 capitalize">{p}</span>
                    ))}
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Main area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {!hasDrafts ? (
            /* Onboarding panel */
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="max-w-md text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-brand-600/10 border border-brand-500/20 flex items-center justify-center">
                  <svg className="w-10 h-10 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-3 font-display">Your workspace is ready</h2>
                <p className="text-white/50 text-sm leading-relaxed mb-6">
                  Workspace is where you refine and publish your content. Upload a video first — your AI-generated drafts for YouTube, Instagram, TikTok, and more will appear here ready to edit and publish.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href="/upload"
                    className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold text-sm transition-all"
                  >
                    Upload a video →
                  </a>
                  <a
                    href="/results"
                    className="px-6 py-3 bg-white/[0.05] hover:bg-white/[0.08] text-white/70 hover:text-white rounded-xl font-semibold text-sm transition-all border border-white/[0.08]"
                  >
                    View results
                  </a>
                </div>
                <div className="mt-8 grid grid-cols-3 gap-4">
                  {['YouTube', 'Instagram', 'TikTok'].map((p) => (
                    <div key={p} className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-center">
                      <div className="text-2xl mb-1">
                        {p === 'YouTube' ? '▶' : p === 'Instagram' ? '📸' : '🎵'}
                      </div>
                      <div className="text-xs text-white/40">{p}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : !selectedDraft ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-white/30 text-sm">Select a draft from the left to start editing</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Platform tabs */}
              <div className="border-b border-white/[0.07]">
                <div className="px-6 flex items-center gap-1 overflow-x-auto max-w-3xl mx-auto">
                {PLATFORMS.map((platform) => {
                  const key = platform.toLowerCase();
                  const hasContent = !!(selectedDraft.platforms[key] || selectedDraft.platforms[platform]);
                  return (
                    <button
                      key={platform}
                      onClick={() => switchPlatform(platform)}
                      className={`relative px-4 py-3 text-sm font-semibold whitespace-nowrap transition-all ${
                        activePlatform === platform
                          ? 'text-brand-400 border-b-2 border-brand-500'
                          : hasContent
                          ? 'text-white/60 hover:text-white'
                          : 'text-white/25 hover:text-white/40'
                      }`}
                    >
                      {platform}
                      {hasContent && activePlatform !== platform && (
                        <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-brand-500/60" />
                      )}
                    </button>
                  );
                })}
                </div>
              </div>

              {/* Editor area */}
              <div className="flex-1 flex flex-col overflow-hidden p-6 gap-4 max-w-3xl w-full mx-auto">
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="flex-1 w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 text-white/90 text-sm leading-relaxed resize-none focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 placeholder:text-white/20 font-mono transition-all"
                  placeholder={`No ${activePlatform} content in this draft. You can write here or regenerate content from the upload page.`}
                  spellCheck={false}
                />

                {/* Share/Export section */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] rounded-xl text-sm text-white/70 hover:text-white transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    {copyStatus ? '✓ Copied!' : 'Copy'}
                  </button>

                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] rounded-xl text-sm text-white/70 hover:text-white transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download .txt
                  </button>

                  <button
                    onClick={handlePublishToCommunity}
                    disabled={isPublishing || !editedContent.trim()}
                    className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                      publishStatus === 'success'
                        ? 'bg-emerald-600 text-white'
                        : publishStatus === 'error'
                        ? 'bg-red-600 text-white'
                        : 'bg-brand-600 hover:bg-brand-500 text-white'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {isPublishing
                      ? 'Publishing…'
                      : publishStatus === 'success'
                      ? '✓ Posted to Community!'
                      : publishStatus === 'error'
                      ? '✕ Failed — Retry'
                      : 'Post to KLA Community'}
                  </button>

                  <span className="text-xs text-white/25 ml-auto">
                    {editedContent.length} chars · {editedContent.trim().split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
