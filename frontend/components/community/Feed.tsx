'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Post, CreatePostData, FeedFilters } from '@/types/community';
import PostCard from './PostCard';
import CreatePost from './CreatePost';

interface FeedProps {
  initialPosts?: Post[];
  onLoadMore?: (page: number) => Promise<Post[]>;
  onCreatePost?: (data: CreatePostData) => Promise<void>;
  onLikePost?: (postId: string) => void;
  onCommentPost?: (postId: string) => void;
  onSharePost?: (postId: string) => void;
  userAvatar?: string;
  filters?: FeedFilters;
}

/**
 * Feed Component
 * Social media style feed with infinite scroll, post creation, and filtering
 */
export default function Feed({
  initialPosts = [],
  onLoadMore,
  onCreatePost,
  onLikePost,
  onCommentPost,
  onSharePost,
  userAvatar,
  filters
}: FeedProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'recent' | 'popular' | 'following'>(
    filters?.sortBy || 'recent'
  );
  
  const observerTarget = useRef<HTMLDivElement>(null);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && onLoadMore) {
          loadMorePosts();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoading, page]);

  const loadMorePosts = useCallback(async () => {
    if (!onLoadMore || isLoading) return;

    setIsLoading(true);
    try {
      const newPosts = await onLoadMore(page + 1);
      if (newPosts.length === 0) {
        setHasMore(false);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Failed to load more posts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [onLoadMore, page, isLoading]);

  const handleCreatePost = async (data: CreatePostData) => {
    if (!onCreatePost) return;
    
    await onCreatePost(data);
    // Optionally refresh feed or add new post to top
  };

  const handleFilterChange = (filter: 'recent' | 'popular' | 'following') => {
    setActiveFilter(filter);
    // Reset and reload with new filter
    setPage(1);
    setPosts([]);
    setHasMore(true);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Filter Tabs */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-2 shadow-xl border border-gray-700/50">
        <div className="flex gap-2">
          {(['recent', 'popular', 'following'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => handleFilterChange(filter)}
              className={`flex-1 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                activeFilter === filter
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Create Post */}
      {onCreatePost && (
        <CreatePost
          onSubmit={handleCreatePost}
          userAvatar={userAvatar}
        />
      )}

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.length === 0 && !isLoading ? (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-12 text-center border border-gray-700/50">
            <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No posts yet</h3>
            <p className="text-gray-500">Be the first to share something!</p>
          </p>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={onLikePost}
              onComment={onCommentPost}
              onShare={onSharePost}
            />
          ))
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-4 border-gray-700 border-t-purple-500 animate-spin"></div>
              <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-transparent border-t-pink-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
            </div>
          </div>
        )}

        {/* Infinite Scroll Trigger */}
        {hasMore && <div ref={observerTarget} className="h-4" />}

        {/* End of Feed */}
        {!hasMore && posts.length > 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">You've reached the end</p>
          </p>
        )}
      </div>
    </div>
  );
}
