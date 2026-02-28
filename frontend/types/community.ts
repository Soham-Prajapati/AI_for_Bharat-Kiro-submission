/**
 * Community Feature Type Definitions
 * Defines interfaces for posts, users, groups, and interactions
 */

export interface User {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  bio?: string;
  followerCount: number;
  followingCount: number;
  isFollowing?: boolean;
  verified?: boolean;
}

export interface PostImage {
  id: string;
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface Post {
  id: string;
  author: User;
  content: string;
  images?: PostImage[];
  likeCount: number;
  commentCount: number;
  shareCount?: number;
  isLiked: boolean;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

export interface Comment {
  id: string;
  author: User;
  content: string;
  likeCount: number;
  isLiked: boolean;
  createdAt: Date | string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  coverImage?: string;
  memberCount: number;
  postCount?: number;
  isJoined: boolean;
  isPrivate?: boolean;
  createdAt: Date | string;
}

export interface CreatePostData {
  content: string;
  images?: File[];
}

export interface FeedFilters {
  sortBy?: 'recent' | 'popular' | 'following';
  groupId?: string;
}
