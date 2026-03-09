'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/hooks/useAuth';
import apiClient from '@/services/api';
import { Post, UserProfile, Group, Comment } from '@/types/api';
import Image from 'next/image';
import ProfileSwitcher from '@/components/ProfileSwitcher';

interface KlaDraft {
  draftId: string;
  name: string;
  iterationNumber: number;
  platforms: Record<string, string>;
  createdAt: string;
}

// ============================================================================
// TYPES
// ============================================================================

interface FeedState {
  posts: Post[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  offset: number;
}

interface UserCache {
  [userId: string]: UserProfile;
}

interface OptimisticUpdate {
  postId: string;
  type: 'like' | 'unlike' | 'comment';
  data?: any;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CommunityPage() {
  const { addToast } = useToast();
  const { user } = useAuth();
  const currentUserId = user?.id || 'guest';
  
  // Banner + workspace draft state
  const [bannerDismissed, setBannerDismissed] = useState(true); // avoid flash
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [latestDraft, setLatestDraft] = useState<KlaDraft | null>(null);
  const [draftModalContent, setDraftModalContent] = useState('');

  // State management
  const [feedState, setFeedState] = useState<FeedState>({
    posts: [],
    loading: true,
    error: null,
    hasMore: true,
    offset: 0,
  });
  
  const [userCache, setUserCache] = useState<UserCache>({});
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  
  // Create post state
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImages, setNewPostImages] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  
  // Comment state
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  
  // Refs
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastPostRef = useRef<HTMLDivElement | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================================
  // API CALLS
  // ============================================================================

  const fetchFeed = useCallback(async (offset: number = 0, append: boolean = false) => {
    try {
      setFeedState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await apiClient.community.getFeed(undefined, 50, offset);
      
      if (response.success) {
        setFeedState(prev => ({
          ...prev,
          posts: append ? [...prev.posts, ...response.posts] : response.posts,
          loading: false,
          hasMore: response.posts.length === 50,
          offset: offset + response.posts.length,
        }));
        
        // Cache user data
        response.posts.forEach(post => {
          if (post.userId && !userCache[post.userId]) {
            fetchUserProfile(post.userId);
          }
        });
      }
    } catch (error: any) {
      setFeedState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load feed',
      }));
      addToast('error', 'Failed to load feed');
    }
  }, [userCache, addToast]);

  const fetchUserProfile = async (userId: string) => {
    if (userCache[userId]) return;
    
    try {
      const response = await apiClient.community.getUser(userId);
      if (response.success) {
        setUserCache(prev => ({ ...prev, [userId]: response.user }));
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  const fetchGroups = async () => {
    try {
      setGroupsLoading(true);
      const response = await apiClient.community.createGroup({
        name: '',
        description: '',
        ownerId: currentUserId,
      });
      // Note: API doesn't have list groups endpoint, using mock data
      setGroups([]);
      setGroupsLoading(false);
    } catch (error) {
      setGroupsLoading(false);
    }
  };

  // ============================================================================
  // POST ACTIONS
  // ============================================================================

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      addToast('warning', 'Please enter some content');
      return;
    }

    try {
      setIsPosting(true);
      const response = await apiClient.community.createPost({
        userId: currentUserId,
        content: newPostContent,
        images: newPostImages,
      });

      if (response.success) {
        addToast('success', 'Post created successfully!');
        setNewPostContent('');
        setNewPostImages([]);
        
        // Refresh feed
        await fetchFeed(0, false);
      }
    } catch (error: any) {
      addToast('error', error.message || 'Failed to create post');
    } finally {
      setIsPosting(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    // Optimistic update
    setFeedState(prev => ({
      ...prev,
      posts: prev.posts.map(post =>
        post.id === postId
          ? { ...post, likes: post.likes + 1 }
          : post
      ),
    }));

    try {
      await apiClient.community.likePost(postId, currentUserId);
    } catch (error: any) {
      // Revert on error
      setFeedState(prev => ({
        ...prev,
        posts: prev.posts.map(post =>
          post.id === postId
            ? { ...post, likes: post.likes - 1 }
            : post
        ),
      }));
      addToast('error', 'Failed to like post');
    }
  };

  const handleAddComment = async (postId: string) => {
    const content = commentInputs[postId]?.trim();
    if (!content) return;

    try {
      const response = await apiClient.community.addComment(postId, currentUserId, content);
      
      if (response.success) {
        addToast('success', 'Comment added!');
        setCommentInputs(prev => ({ ...prev, [postId]: '' }));
        
        // Update comment count
        setFeedState(prev => ({
          ...prev,
          posts: prev.posts.map(post =>
            post.id === postId
              ? { ...post, comments: post.comments + 1 }
              : post
          ),
        }));
      }
    } catch (error: any) {
      addToast('error', 'Failed to add comment');
    }
  };

  // ============================================================================
  // IMAGE UPLOAD
  // ============================================================================

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const uploadPromises = Array.from(files).map(file =>
        apiClient.upload.file(file, undefined, currentUserId)
      );

      const results = await Promise.all(uploadPromises);
      const urls = results.map(r => r.url);
      
      setNewPostImages(prev => [...prev, ...urls]);
      addToast('success', `${files.length} image(s) uploaded`);
    } catch (error: any) {
      addToast('error', 'Failed to upload images');
    }
  };

  // ============================================================================
  // INFINITE SCROLL
  // ============================================================================

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && feedState.hasMore && !feedState.loading) {
          fetchFeed(feedState.offset, true);
        }
      },
      { threshold: 0.5 }
    );

    if (lastPostRef.current) {
      observerRef.current.observe(lastPostRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [feedState.hasMore, feedState.loading, feedState.offset, fetchFeed]);

  // ============================================================================
  // REAL-TIME UPDATES (POLLING)
  // ============================================================================

  useEffect(() => {
    pollingIntervalRef.current = setInterval(() => {
      fetchFeed(0, false);
    }, 30000); // Poll every 30 seconds

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [fetchFeed]);

  // ============================================================================
  // INITIAL LOAD
  // ============================================================================

  useEffect(() => {
    fetchFeed(0, false);
    fetchGroups();
  }, []);

  // Load banner state and latest draft from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const dismissed = localStorage.getItem('kla_community_banner_dismissed');
    setBannerDismissed(dismissed === 'true');
    try {
      const raw = localStorage.getItem('kla_current_draft');
      if (raw) {
        const draft: KlaDraft = JSON.parse(raw);
        setLatestDraft(draft);
      } else {
        const draftsRaw = localStorage.getItem('kla_drafts');
        if (draftsRaw) {
          const drafts: KlaDraft[] = JSON.parse(draftsRaw);
          if (drafts.length > 0) setLatestDraft(drafts[drafts.length - 1]);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const dismissBanner = () => {
    setBannerDismissed(true);
    localStorage.setItem('kla_community_banner_dismissed', 'true');
  };

  const openWorkspaceModal = () => {
    if (!latestDraft) return;
    const firstContent = Object.values(latestDraft.platforms).find(v => v?.trim()) || '';
    setDraftModalContent(firstContent);
    setShowWorkspaceModal(true);
  };

  const useWorkspaceDraftAsPost = () => {
    setNewPostContent(draftModalContent);
    setShowWorkspaceModal(false);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      {/* Dismissible community banner */}
      {!bannerDismissed && (
        <div className="bg-gradient-to-r from-brand-600/20 via-indigo-600/10 to-transparent border-b border-brand-500/20 px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-lg">🇮🇳</span>
              <p className="text-sm text-white/80">
                <span className="font-semibold text-white">KLA Community</span>
                {' — '}Share your content journey with <span className="text-brand-400 font-semibold">10,000+ Indian creators</span>. Posts here appear in the community feed visible to all KLA members — not on Instagram, YouTube, or other social platforms.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <ProfileSwitcher />
              <button
                onClick={dismissBanner}
                className="text-white/40 hover:text-white transition-colors p-1 rounded"
                aria-label="Dismiss banner"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workspace draft modal */}
      {showWorkspaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0A0E1A] border border-white/[0.08] rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-white/[0.06]">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white font-display">Share from Workspace</h3>
                <button onClick={() => setShowWorkspaceModal(false)} className="text-white/40 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {latestDraft && (
                <p className="text-xs text-white/40 mt-1">
                  From: <span className="text-white/60">{latestDraft.name}</span> · Draft {latestDraft.iterationNumber}
                </p>
              )}
            </div>
            <div className="p-6">
              <textarea
                value={draftModalContent}
                onChange={(e) => setDraftModalContent(e.target.value)}
                className="w-full h-48 bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 text-white/80 text-sm resize-none focus:outline-none focus:border-brand-500/40 transition-all"
                placeholder="Draft content will appear here…"
              />
              <p className="text-xs text-white/30 mt-2">✦ This will be posted to the KLA internal community feed — not to any external social platform.</p>
            </div>
            <div className="px-6 pb-6 flex gap-3 justify-end">
              <button
                onClick={() => setShowWorkspaceModal(false)}
                className="px-4 py-2 text-sm text-white/50 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={useWorkspaceDraftAsPost}
                className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-semibold transition-all"
              >
                Use as post draft
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT SIDEBAR - User Profile */}
          <aside className="lg:col-span-3">
            <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 sticky top-6">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-gradient-to-br from-brand-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  U
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">User Profile</h3>
                <p className="text-sm text-white/40">@user123</p>
                
                <div className="flex gap-4 mt-4 text-center">
                  <div>
                    <div className="font-bold text-white">0</div>
                    <div className="text-xs text-white/40">Posts</div>
                  </div>
                  <div>
                    <div className="font-bold text-white">0</div>
                    <div className="text-xs text-white/40">Followers</div>
                  </div>
                  <div>
                    <div className="font-bold text-white">0</div>
                    <div className="text-xs text-white/40">Following</div>
                  </div>
                </div>
              </div>
              
              <nav className="mt-6 space-y-2">
                <button className="w-full text-left px-4 py-2 rounded-xl bg-brand-500/10 text-brand-400 font-semibold text-sm">
                  Feed
                </button>
                <button className="w-full text-left px-4 py-2 rounded-xl hover:bg-white/[0.04] text-white/60 hover:text-white text-sm transition-colors">
                  My Posts
                </button>
                <button className="w-full text-left px-4 py-2 rounded-xl hover:bg-white/[0.04] text-white/60 hover:text-white text-sm transition-colors">
                  Saved
                </button>
                <button className="w-full text-left px-4 py-2 rounded-xl hover:bg-white/[0.04] text-white/60 hover:text-white text-sm transition-colors">
                  Groups
                </button>
              </nav>
            </div>
          </aside>

          {/* CENTER - Feed */}
          <main className="lg:col-span-6">
            
            {/* Create Post */}
            <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 mb-6">
              <h2 className="text-lg font-bold text-white mb-4 font-display">Create Post</h2>
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full p-3 bg-white/[0.03] border border-white/[0.07] rounded-xl resize-none focus:ring-1 focus:ring-brand-500/50 focus:border-brand-500/40 text-white placeholder:text-white/20 text-sm outline-none transition-all"
                rows={3}
              />
              
              {newPostImages.length > 0 && (
                <div className="mt-3 flex gap-2 flex-wrap">
                  {newPostImages.map((url, idx) => (
                    <div key={idx} className="relative w-20 h-20">
                      <Image
                        src={url}
                        alt={`Upload ${idx + 1}`}
                        fill
                        className="object-cover rounded"
                      />
                      <button
                        onClick={() => setNewPostImages(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-4 flex items-center justify-between">
                <div className="flex gap-2">
                  <label className="cursor-pointer px-4 py-2 text-white/50 hover:text-white hover:bg-white/[0.04] rounded-lg flex items-center gap-2 text-sm transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Photo
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                
                <button
                  onClick={handleCreatePost}
                  disabled={isPosting || !newPostContent.trim()}
                  className="px-6 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {isPosting ? 'Posting…' : 'Post'}
                </button>
              </div>
            </div>

            {/* Post visibility hint */}
            <p className="text-xs text-white/30 px-1 -mt-3 mb-6">
              ✦ Your post will be visible to all KLA creators in this feed — this is the KLA internal community, not Instagram/YouTube/etc.
            </p>

            {/* Feed Posts */}
            {feedState.loading && feedState.posts.length === 0 ? (
              <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto"></div>
                <p className="mt-4 text-white/40 text-sm">Loading feed…</p>
              </div>
            ) : feedState.error ? (
              <div className="bg-white/[0.03] border border-red-500/20 rounded-2xl p-12 text-center">
                <p className="text-red-400">{feedState.error}</p>
                <button
                  onClick={() => fetchFeed(0, false)}
                  className="mt-4 px-6 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-500 text-sm font-semibold"
                >
                  Retry
                </button>
              </div>
            ) : feedState.posts.length === 0 ? (
              <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-12 text-center">
                <p className="text-white/40">No posts yet. Be the first to share!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {feedState.posts.map((post, index) => (
                  <div
                    key={post.id}
                    ref={index === feedState.posts.length - 1 ? lastPostRef : null}
                    className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 hover:border-white/[0.12] transition-colors"
                  >
                    {/* Post Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {post.userId.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-white text-sm">{userCache[post.userId]?.name || post.userId}</div>
                        <div className="text-xs text-white/30">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Post Content */}
                    <p className="text-white/80 text-sm mb-4 leading-relaxed">{post.content}</p>

                    {/* Post Images */}
                    {post.images && post.images.length > 0 && (
                      <div className="mb-4 grid grid-cols-2 gap-2">
                        {post.images.map((img, idx) => (
                          <div key={idx} className="relative h-48">
                            <Image
                              src={img}
                              alt={`Post image ${idx + 1}`}
                              fill
                              className="object-cover rounded-lg"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Post Actions */}
                    <div className="flex items-center gap-6 pt-4 border-t border-white/[0.05]">
                      <button
                        onClick={() => handleLikePost(post.id)}
                        className="flex items-center gap-2 text-white/40 hover:text-brand-400 transition-colors text-sm"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                        <span>{post.likes}</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          const newExpanded = new Set(expandedPosts);
                          if (newExpanded.has(post.id)) {
                            newExpanded.delete(post.id);
                          } else {
                            newExpanded.add(post.id);
                          }
                          setExpandedPosts(newExpanded);
                        }}
                        className="flex items-center gap-2 text-white/40 hover:text-cyan-400 transition-colors text-sm"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>{post.comments}</span>
                      </button>
                    </div>

                    {/* Comment Section */}
                    {expandedPosts.has(post.id) && (
                      <div className="mt-4 pt-4 border-t border-white/[0.05]">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={commentInputs[post.id] || ''}
                            onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                            placeholder="Write a comment…"
                            className="flex-1 px-3 py-2 bg-white/[0.03] border border-white/[0.07] rounded-xl text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-brand-500/40 transition-all"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleAddComment(post.id);
                              }
                            }}
                          />
                          <button
                            onClick={() => handleAddComment(post.id)}
                            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-semibold transition-all"
                          >
                            Send
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Loading More */}
                {feedState.loading && feedState.posts.length > 0 && (
                  <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto"></div>
                  </div>
                )}
              </div>
            )}
          </main>

          {/* RIGHT SIDEBAR - Groups & Trending */}
          <aside className="lg:col-span-3">

            {/* Share from Workspace card */}
            <div className="bg-gradient-to-br from-brand-600/10 to-indigo-600/5 border border-brand-500/20 rounded-2xl p-5 mb-6">
              <div className="text-2xl mb-2">📤</div>
              <h3 className="font-bold text-white text-sm mb-1 font-display">Share your latest draft</h3>
              <p className="text-xs text-white/40 mb-4 leading-relaxed">
                {latestDraft
                  ? `"${latestDraft.name}" · Draft ${latestDraft.iterationNumber}`
                  : 'No drafts yet. Upload a video to generate content.'}
              </p>
              <button
                onClick={openWorkspaceModal}
                disabled={!latestDraft}
                className="w-full px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Share to community
              </button>
              {!latestDraft && (
                <a href="/upload" className="block text-center text-xs text-brand-400 hover:text-brand-300 mt-2 transition-colors">
                  Upload a video →
                </a>
              )}
            </div>
            
            {/* Groups */}
            <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 mb-6">
              <h3 className="text-base font-bold text-white mb-4 font-display">Groups</h3>
              {groupsLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto"></div>
                </div>
              ) : groups.length === 0 ? (
                <p className="text-sm text-white/30">No groups yet</p>
              ) : (
                <div className="space-y-3">
                  {groups.map(group => (
                    <div key={group.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-white text-sm">{group.name}</div>
                        <div className="text-xs text-white/30">{group.memberCount} members</div>
                      </div>
                      <button className="text-xs text-brand-400 hover:text-brand-300 font-semibold transition-colors">
                        Join
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Trending */}
            <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 sticky top-6">
              <h3 className="text-base font-bold text-white mb-4 font-display">Trending</h3>
              <div className="space-y-3">
                {[
                  { tag: '#ContentCreation', posts: '1.2K' },
                  { tag: '#VideoMarketing',  posts: '856' },
                  { tag: '#SocialMedia',     posts: '642' },
                  { tag: '#CreatorEconomy', posts: '521' },
                  { tag: '#HindiContent',   posts: '389' },
                ].map(t => (
                  <div key={t.tag} className="pb-3 border-b border-white/[0.05] last:border-0 last:pb-0">
                    <div className="text-sm text-brand-400 font-semibold">{t.tag}</div>
                    <div className="text-xs text-white/30">{t.posts} posts</div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
