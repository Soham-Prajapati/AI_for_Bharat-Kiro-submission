/**
 * Community Service
 * Creator network, forums, groups
 */

import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  followers: string[];
  following: string[];
  createdAt: Date;
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  images?: string[];
  likes: string[];
  comments: Comment[];
  groupId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  userId: string;
  postId: string;
  content: string;
  createdAt: Date;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  members: string[];
  posts: string[];
  createdAt: Date;
}

class CommunityService {
  private users: Map<string, User> = new Map();
  private posts: Map<string, Post> = new Map();
  private groups: Map<string, Group> = new Map();

  /**
   * Create a new post
   */
  createPost(userId: string, content: string, groupId?: string, images?: string[]): Post {
    const post: Post = {
      id: uuidv4(),
      userId,
      content,
      images,
      likes: [],
      comments: [],
      groupId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.posts.set(post.id, post);

    if (groupId) {
      const group = this.groups.get(groupId);
      if (group) {
        group.posts.push(post.id);
      }
    }

    return post;
  }

  /**
   * Get feed (all posts, sorted by date)
   */
  getFeed(userId?: string, limit: number = 50, offset: number = 0): Post[] {
    let posts = Array.from(this.posts.values());

    // Sort by date (newest first)
    posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Apply pagination
    return posts.slice(offset, offset + limit);
  }

  /**
   * Get post by ID
   */
  getPost(postId: string): Post | undefined {
    return this.posts.get(postId);
  }

  /**
   * Like a post
   */
  likePost(postId: string, userId: string): boolean {
    const post = this.posts.get(postId);
    if (!post) return false;

    if (!post.likes.includes(userId)) {
      post.likes.push(userId);
      post.updatedAt = new Date();
    }

    return true;
  }

  /**
   * Unlike a post
   */
  unlikePost(postId: string, userId: string): boolean {
    const post = this.posts.get(postId);
    if (!post) return false;

    const index = post.likes.indexOf(userId);
    if (index > -1) {
      post.likes.splice(index, 1);
      post.updatedAt = new Date();
    }

    return true;
  }

  /**
   * Add comment to post
   */
  addComment(postId: string, userId: string, content: string): Comment | null {
    const post = this.posts.get(postId);
    if (!post) return null;

    const comment: Comment = {
      id: uuidv4(),
      userId,
      postId,
      content,
      createdAt: new Date()
    };

    post.comments.push(comment);
    post.updatedAt = new Date();

    return comment;
  }

  /**
   * Delete post
   */
  deletePost(postId: string, userId: string): boolean {
    const post = this.posts.get(postId);
    if (!post || post.userId !== userId) return false;

    return this.posts.delete(postId);
  }

  /**
   * Create group
   */
  createGroup(name: string, description: string, ownerId: string): Group {
    const group: Group = {
      id: uuidv4(),
      name,
      description,
      ownerId,
      members: [ownerId],
      posts: [],
      createdAt: new Date()
    };

    this.groups.set(group.id, group);
    return group;
  }

  /**
   * Get group by ID
   */
  getGroup(groupId: string): Group | undefined {
    return this.groups.get(groupId);
  }

  /**
   * List all groups
   */
  listGroups(limit: number = 50): Group[] {
    return Array.from(this.groups.values()).slice(0, limit);
  }

  /**
   * Join group
   */
  joinGroup(groupId: string, userId: string): boolean {
    const group = this.groups.get(groupId);
    if (!group) return false;

    if (!group.members.includes(userId)) {
      group.members.push(userId);
    }

    return true;
  }

  /**
   * Leave group
   */
  leaveGroup(groupId: string, userId: string): boolean {
    const group = this.groups.get(groupId);
    if (!group || group.ownerId === userId) return false;

    const index = group.members.indexOf(userId);
    if (index > -1) {
      group.members.splice(index, 1);
    }

    return true;
  }

  /**
   * Get user profile
   */
  getUser(userId: string): User | undefined {
    return this.users.get(userId);
  }

  /**
   * Create or update user
   */
  upsertUser(user: Partial<User> & { id: string }): User {
    const existing = this.users.get(user.id);

    const updated: User = {
      id: user.id,
      name: user.name || existing?.name || 'Anonymous',
      email: user.email || existing?.email || '',
      avatar: user.avatar || existing?.avatar,
      bio: user.bio || existing?.bio,
      followers: existing?.followers || [],
      following: existing?.following || [],
      createdAt: existing?.createdAt || new Date()
    };

    this.users.set(user.id, updated);
    return updated;
  }

  /**
   * Follow user
   */
  followUser(followerId: string, followeeId: string): boolean {
    const follower = this.users.get(followerId);
    const followee = this.users.get(followeeId);

    if (!follower || !followee || followerId === followeeId) return false;

    if (!follower.following.includes(followeeId)) {
      follower.following.push(followeeId);
    }

    if (!followee.followers.includes(followerId)) {
      followee.followers.push(followerId);
    }

    return true;
  }

  /**
   * Unfollow user
   */
  unfollowUser(followerId: string, followeeId: string): boolean {
    const follower = this.users.get(followerId);
    const followee = this.users.get(followeeId);

    if (!follower || !followee) return false;

    const followingIndex = follower.following.indexOf(followeeId);
    if (followingIndex > -1) {
      follower.following.splice(followingIndex, 1);
    }

    const followerIndex = followee.followers.indexOf(followerId);
    if (followerIndex > -1) {
      followee.followers.splice(followerIndex, 1);
    }

    return true;
  }
}

export const communityService = new CommunityService();
