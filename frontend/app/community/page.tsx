'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/context/ToastContext';
import apiClient from '@/services/api';
import { Post, UserProfile, Group, Comment } from '@/types/api';
import Image from 'next/image';

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
  const [currentUserId] = useState('user-123'); // TODO: Get from auth context
  
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

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT SIDEBAR - User Profile */}
          <aside className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  U
                </div>
                <h3 className="mt-4 text-lg font-semibold">User Profile</h3>
                <p className="text-sm text-gray-500">@user123</p>
                
                <div className="flex gap-4 mt-4 text-center">
                  <div>
                    <div className="font-bold">0</div>
                    <div className="text-xs text-gray-500">Posts</div>
                  </div>
                  <div>
                    <div className="font-bold">0</div>
                    <div className="text-xs text-gray-500">Followers</div>
                  </div>
                  <div>
                    <div className="font-bold">0</div>
                    <div className="text-xs text-gray-500">Following</div>
                  </div>
                </div>
              </div>
              
              <nav className="mt-6 space-y-2">
                <button className="w-full text-left px-4 py-2 rounded-lg bg-blue-50 text-blue-600 font-medium">
                  Feed
                </button>
                <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 text-gray-700">
                  My Posts
                </button>
                <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 text-gray-700">
                  Saved
                </button>
                <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 text-gray-700">
                  Groups
                </button>
              </nav>
            </div>
          </aside>

          {/* CENTER - Feed */}
          <main className="lg:col-span-6">
            
            {/* Create Post */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Create Post</h2>
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  <label className="cursor-pointer px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg flex items-center gap-2">
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
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPosting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>

            {/* Feed Posts */}
            {feedState.loading && feedState.posts.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading feed...</p>
              </div>
            ) : feedState.error ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-red-600">{feedState.error}</p>
                <button
                  onClick={() => fetchFeed(0, false)}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            ) : feedState.posts.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500">No posts yet. Be the first to post!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {feedState.posts.map((post, index) => (
                  <div
                    key={post.id}
                    ref={index === feedState.posts.length - 1 ? lastPostRef : null}
                    className="bg-white rounded-lg shadow p-6"
                  >
                    {/* Post Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {post.userId.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold">{userCache[post.userId]?.name || post.userId}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Post Content */}
                    <p className="text-gray-800 mb-4">{post.content}</p>

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
                    <div className="flex items-center gap-6 pt-4 border-t">
                      <button
                        onClick={() => handleLikePost(post.id)}
                        className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
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
                        className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>{post.comments}</span>
                      </button>
                    </div>

                    {/* Comment Section */}
                    {expandedPosts.has(post.id) && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={commentInputs[post.id] || ''}
                            onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                            placeholder="Write a comment..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleAddComment(post.id);
                              }
                            }}
                          />
                          <button
                            onClick={() => handleAddComment(post.id)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
                  <div className="bg-white rounded-lg shadow p-6 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                )}
              </div>
            )}
          </main>

          {/* RIGHT SIDEBAR - Groups & Trending */}
          <aside className="lg:col-span-3">
            
            {/* Groups */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Groups</h3>
              {groupsLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : groups.length === 0 ? (
                <p className="text-sm text-gray-500">No groups yet</p>
              ) : (
                <div className="space-y-3">
                  {groups.map(group => (
                    <div key={group.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{group.name}</div>
                        <div className="text-xs text-gray-500">{group.memberCount} members</div>
                      </div>
                      <button className="text-sm text-blue-600 hover:text-blue-700">
                        Join
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Trending */}
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h3 className="text-lg font-semibold mb-4">Trending</h3>
              <div className="space-y-3">
                <div className="pb-3 border-b">
                  <div className="text-sm text-gray-500">#ContentCreation</div>
                  <div className="text-xs text-gray-400">1.2K posts</div>
                </div>
                <div className="pb-3 border-b">
                  <div className="text-sm text-gray-500">#VideoMarketing</div>
                  <div className="text-xs text-gray-400">856 posts</div>
                </div>
                <div className="pb-3 border-b">
                  <div className="text-sm text-gray-500">#SocialMedia</div>
                  <div className="text-xs text-gray-400">642 posts</div>
                </div>
                <div className="pb-3">
                  <div className="text-sm text-gray-500">#CreatorEconomy</div>
                  <div className="text-xs text-gray-400">521 posts</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
