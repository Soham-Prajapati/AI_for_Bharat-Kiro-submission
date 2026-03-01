'use client';

import React, { useState } from 'react';
import Feed from './Feed';
import ProfileCard from './ProfileCard';
import GroupList from './GroupList';
import { Post, User, Group, CreatePostData } from '@/types/community';

/**
 * CommunityExample Component
 * Complete example implementation of the Community UI
 * Demonstrates all components working together with mock data
 */

// Mock Data
const mockCurrentUser: User = {
  id: '1',
  name: 'Sarah Johnson',
  username: 'sarahj',
  avatar: 'https://i.pravatar.cc/150?img=1',
  bio: 'Content creator & digital strategist. Passionate about building communities.',
  followerCount: 12500,
  followingCount: 842,
  verified: true,
};

const mockPosts: Post[] = [
  {
    id: '1',
    author: {
      id: '2',
      name: 'Alex Chen',
      username: 'alexchen',
      avatar: 'https://i.pravatar.cc/150?img=2',
      followerCount: 5420,
      followingCount: 320,
      verified: true,
    },
    content: 'Just launched our new content intelligence platform! 🚀 The AI-powered insights are game-changing. Check it out and let me know what you think!',
    images: [
      {
        id: 'img1',
        url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
        alt: 'Dashboard screenshot',
      },
    ],
    likeCount: 234,
    commentCount: 45,
    shareCount: 12,
    isLiked: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  },
  {
    id: '2',
    author: {
      id: '3',
      name: 'Maria Garcia',
      username: 'mariag',
      avatar: 'https://i.pravatar.cc/150?img=3',
      followerCount: 8900,
      followingCount: 456,
      verified: false,
    },
    content: 'Tips for creating viral content:\n\n1. Know your audience\n2. Tell compelling stories\n3. Use data-driven insights\n4. Optimize for each platform\n5. Engage authentically\n\nWhat would you add to this list?',
    likeCount: 567,
    commentCount: 89,
    isLiked: true,
    createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
  },
  {
    id: '3',
    author: {
      id: '4',
      name: 'David Kim',
      username: 'davidk',
      avatar: 'https://i.pravatar.cc/150?img=4',
      followerCount: 15600,
      followingCount: 1200,
      verified: true,
    },
    content: 'Behind the scenes of our latest campaign. The team worked incredibly hard to make this happen! 📸✨',
    images: [
      {
        id: 'img2',
        url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
        alt: 'Team collaboration',
      },
      {
        id: 'img3',
        url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800',
        alt: 'Office workspace',
      },
      {
        id: 'img4',
        url: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800',
        alt: 'Creative meeting',
      },
    ],
    likeCount: 892,
    commentCount: 124,
    isLiked: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
];

const mockGroups: Group[] = [
  {
    id: '1',
    name: 'Content Creators Hub',
    description: 'A community for content creators to share tips, strategies, and collaborate on projects.',
    coverImage: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800',
    memberCount: 15420,
    postCount: 3240,
    isJoined: true,
    isPrivate: false,
    createdAt: new Date(Date.now() - 7776000000).toISOString(), // 90 days ago
  },
  {
    id: '2',
    name: 'AI & Marketing',
    description: 'Exploring the intersection of artificial intelligence and modern marketing strategies.',
    memberCount: 8900,
    postCount: 1567,
    isJoined: false,
    isPrivate: false,
    createdAt: new Date(Date.now() - 5184000000).toISOString(), // 60 days ago
  },
  {
    id: '3',
    name: 'Video Production Pro',
    description: 'Professional video creators sharing techniques, gear reviews, and industry insights.',
    coverImage: 'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=800',
    memberCount: 12300,
    postCount: 2890,
    isJoined: true,
    isPrivate: false,
    createdAt: new Date(Date.now() - 10368000000).toISOString(), // 120 days ago
  },
  {
    id: '4',
    name: 'Elite Strategists',
    description: 'Exclusive group for senior marketing strategists and thought leaders.',
    memberCount: 450,
    postCount: 234,
    isJoined: false,
    isPrivate: true,
    createdAt: new Date(Date.now() - 2592000000).toISOString(), // 30 days ago
  },
];

export default function CommunityExample() {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [groups, setGroups] = useState<Group[]>(mockGroups);

  // Handler functions
  const handleCreatePost = async (data: CreatePostData) => {
    console.log('Creating post:', data);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Add new post to feed
    const newPost: Post = {
      id: Date.now().toString(),
      author: mockCurrentUser,
      content: data.content,
      images: data.images?.map((file, index) => ({
        id: `img-${Date.now()}-${index}`,
        url: URL.createObjectURL(file),
        alt: file.name,
      })),
      likeCount: 0,
      commentCount: 0,
      isLiked: false,
      createdAt: new Date().toISOString(),
    };
    
    setPosts([newPost, ...posts]);
  };

  const handleLoadMore = async (page: number): Promise<Post[]> => {
    console.log('Loading page:', page);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return empty array to simulate end of feed
    return [];
  };

  const handleLikePost = (postId: string) => {
    console.log('Like post:', postId);
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1 }
        : post
    ));
  };

  const handleCommentPost = (postId: string) => {
    console.log('Comment on post:', postId);
    // Navigate to post detail or open comment modal
  };

  const handleSharePost = (postId: string) => {
    console.log('Share post:', postId);
    // Open share modal
  };

  const handleFollowUser = (userId: string) => {
    console.log('Follow user:', userId);
  };

  const handleUnfollowUser = (userId: string) => {
    console.log('Unfollow user:', userId);
  };

  const handleViewProfile = (userId: string) => {
    console.log('View profile:', userId);
    // Navigate to user profile
  };

  const handleJoinGroup = (groupId: string) => {
    console.log('Join group:', groupId);
    setGroups(groups.map(group =>
      group.id === groupId
        ? { ...group, isJoined: true, memberCount: group.memberCount + 1 }
        : group
    ));
  };

  const handleLeaveGroup = (groupId: string) => {
    console.log('Leave group:', groupId);
    setGroups(groups.map(group =>
      group.id === groupId
        ? { ...group, isJoined: false, memberCount: group.memberCount - 1 }
        : group
    ));
  };

  const handleCreateGroup = () => {
    console.log('Create group');
    // Open create group modal
  };

  const handleViewGroup = (groupId: string) => {
    console.log('View group:', groupId);
    // Navigate to group page
  };

  return (
    <div className="min-h-screen bg-gray-950 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Community</h1>
          <p className="text-gray-400">Connect, share, and grow together</p>
        </header>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed - 2 columns on large screens */}
          <div className="lg:col-span-2">
            <Feed
              initialPosts={posts}
              onLoadMore={handleLoadMore}
              onCreatePost={handleCreatePost}
              onLikePost={handleLikePost}
              onCommentPost={handleCommentPost}
              onSharePost={handleSharePost}
              userAvatar={mockCurrentUser.avatar}
            />
          </header>

          {/* Sidebar - 1 column on large screens */}
          <aside className="space-y-6">
            {/* Profile Card */}
            <ProfileCard
              user={mockCurrentUser}
              recentPosts={posts.slice(0, 3)}
              onViewProfile={handleViewProfile}
              isCurrentUser={true}
            />

            {/* Suggested Users */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white px-2">Suggested Users</h3>
              {[
                {
                  id: '5',
                  name: 'Emma Wilson',
                  username: 'emmaw',
                  avatar: 'https://i.pravatar.cc/150?img=5',
                  bio: 'Digital marketing expert',
                  followerCount: 6700,
                  followingCount: 340,
                  verified: false,
                },
                {
                  id: '6',
                  name: 'James Lee',
                  username: 'jameslee',
                  avatar: 'https://i.pravatar.cc/150?img=6',
                  bio: 'Content strategist',
                  followerCount: 4200,
                  followingCount: 280,
                  verified: true,
                },
              ].map(user => (
                <ProfileCard
                  key={user.id}
                  user={user}
                  onFollow={handleFollowUser}
                  onUnfollow={handleUnfollowUser}
                  onViewProfile={handleViewProfile}
                />
              ))}
            </div>
          </aside>
        </div>

        {/* Groups Section */}
        <div className="mt-12">
          <GroupList
            groups={groups}
            onJoinGroup={handleJoinGroup}
            onLeaveGroup={handleLeaveGroup}
            onCreateGroup={handleCreateGroup}
            onViewGroup={handleViewGroup}
          />
        </div>
      </div>
    </div>
  );
}
