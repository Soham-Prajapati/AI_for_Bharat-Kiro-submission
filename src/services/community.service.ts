/**
 * Community Service
 * 
 * Creator network, forums, groups
 * - User profiles with follow/unfollow
 * - Discussion threads and comments
 * - Groups and communities
 * - Moderation tools (spam detection, content filtering)
 * - Activity feed and notifications
 */

export interface UserProfile {
  userId: string;
  username: string;
  displayName: string;
  bio: string;
  avatar?: string;
  coverImage?: string;
  followers: number;
  following: number;
  postsCount: number;
  joinedAt: string;
  verified: boolean;
  badges: string[];
  socialLinks?: {
    youtube?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
}

export interface Post {
  postId: string;
  userId: string;
  username: string;
  content: string;
  mediaUrls?: string[];
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  isPinned: boolean;
  isEdited: boolean;
}

export interface Comment {
  commentId: string;
  postId: string;
  userId: string;
  username: string;
  content: string;
  likes: number;
  replies: Comment[];
  createdAt: string;
  isEdited: boolean;
}

export interface Group {
  groupId: string;
  name: string;
  description: string;
  coverImage?: string;
  creatorId: string;
  members: number;
  postsCount: number;
  isPrivate: boolean;
  tags: string[];
  createdAt: string;
  rules?: string[];
}

export interface ActivityFeedItem {
  activityId: string;
  type: 'post' | 'comment' | 'follow' | 'like' | 'join_group';
  userId: string;
  username: string;
  content: string;
  targetId?: string;
  timestamp: string;
}

export interface ModerationAction {
  actionId: string;
  type: 'warn' | 'mute' | 'ban' | 'delete_post' | 'delete_comment';
  targetUserId: string;
  targetContentId?: string;
  reason: string;
  moderatorId: string;
  timestamp: string;
  duration?: number; // in hours
}

export class CommunityService {
  private users: Map<string, UserProfile>;
  private posts: Map<string, Post>;
  private comments: Map<string, Comment>;
  private groups: Map<string, Group>;
  private followers: Map<string, Set<string>>; // userId -> Set of follower userIds
  private following: Map<string, Set<string>>; // userId -> Set of following userIds
  private groupMembers: Map<string, Set<string>>; // groupId -> Set of member userIds

  constructor() {
    this.users = new Map();
    this.posts = new Map();
    this.comments = new Map();
    this.groups = new Map();
    this.followers = new Map();
    this.following = new Map();
    this.groupMembers = new Map();
  }

  // ============================================================================
  // USER PROFILE MANAGEMENT
  // ============================================================================

  /**
   * Create or update user profile
   */
  async createProfile(profile: Omit<UserProfile, 'followers' | 'following' | 'postsCount' | 'joinedAt'>): Promise<UserProfile> {
    const existingProfile = this.users.get(profile.userId);

    const userProfile: UserProfile = {
      ...profile,
      followers: existingProfile?.followers || 0,
      following: existingProfile?.following || 0,
      postsCount: existingProfile?.postsCount || 0,
      joinedAt: existingProfile?.joinedAt || new Date().toISOString(),
    };

    this.users.set(profile.userId, userProfile);
    return userProfile;
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    return this.users.get(userId) || null;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const profile = this.users.get(userId);
    if (!profile) {
      throw new Error('User not found');
    }

    const updated = { ...profile, ...updates };
    this.users.set(userId, updated);
    return updated;
  }

  /**
   * Search users by username or display name
   */
  async searchUsers(query: string, limit: number = 20): Promise<UserProfile[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.users.values())
      .filter(
        (u) =>
          u.username.toLowerCase().includes(lowerQuery) ||
          u.displayName.toLowerCase().includes(lowerQuery)
      )
      .slice(0, limit);
  }

  // ============================================================================
  // FOLLOW/UNFOLLOW
  // ============================================================================

  /**
   * Follow a user
   */
  async followUser(followerId: string, followeeId: string): Promise<void> {
    if (followerId === followeeId) {
      throw new Error('Cannot follow yourself');
    }

    // Add to follower's following list
    if (!this.following.has(followerId)) {
      this.following.set(followerId, new Set());
    }
    this.following.get(followerId)!.add(followeeId);

    // Add to followee's followers list
    if (!this.followers.has(followeeId)) {
      this.followers.set(followeeId, new Set());
    }
    this.followers.get(followeeId)!.add(followerId);

    // Update counts
    const follower = this.users.get(followerId);
    const followee = this.users.get(followeeId);
    if (follower) follower.following++;
    if (followee) followee.followers++;
  }

  /**
   * Unfollow a user
   */
  async unfollowUser(followerId: string, followeeId: string): Promise<void> {
    this.following.get(followerId)?.delete(followeeId);
    this.followers.get(followeeId)?.delete(followerId);

    // Update counts
    const follower = this.users.get(followerId);
    const followee = this.users.get(followeeId);
    if (follower && follower.following > 0) follower.following--;
    if (followee && followee.followers > 0) followee.followers--;
  }

  /**
   * Get user's followers
   */
  async getFollowers(userId: string, limit: number = 50): Promise<UserProfile[]> {
    const followerIds = Array.from(this.followers.get(userId) || []);
    return followerIds
      .slice(0, limit)
      .map((id) => this.users.get(id))
      .filter((u): u is UserProfile => u !== undefined);
  }

  /**
   * Get users that a user is following
   */
  async getFollowing(userId: string, limit: number = 50): Promise<UserProfile[]> {
    const followingIds = Array.from(this.following.get(userId) || []);
    return followingIds
      .slice(0, limit)
      .map((id) => this.users.get(id))
      .filter((u): u is UserProfile => u !== undefined);
  }

  /**
   * Check if user A follows user B
   */
  async isFollowing(followerId: string, followeeId: string): Promise<boolean> {
    return this.following.get(followerId)?.has(followeeId) || false;
  }

  // ============================================================================
  // POSTS
  // ============================================================================

  /**
   * Create a post
   */
  async createPost(
    userId: string,
    content: string,
    options?: {
      mediaUrls?: string[];
      tags?: string[];
      groupId?: string;
    }
  ): Promise<Post> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check for spam
    if (await this.isSpam(content)) {
      throw new Error('Post flagged as spam');
    }

    const post: Post = {
      postId: this.generateId('post'),
      userId,
      username: user.username,
      content,
      mediaUrls: options?.mediaUrls || [],
      likes: 0,
      comments: 0,
      shares: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: options?.tags || [],
      isPinned: false,
      isEdited: false,
    };

    this.posts.set(post.postId, post);
    user.postsCount++;

    return post;
  }

  /**
   * Get post by ID
   */
  async getPost(postId: string): Promise<Post | null> {
    return this.posts.get(postId) || null;
  }

  /**
   * Update post
   */
  async updatePost(postId: string, userId: string, content: string): Promise<Post> {
    const post = this.posts.get(postId);
    if (!post) {
      throw new Error('Post not found');
    }
    if (post.userId !== userId) {
      throw new Error('Unauthorized');
    }

    post.content = content;
    post.updatedAt = new Date().toISOString();
    post.isEdited = true;

    return post;
  }

  /**
   * Delete post
   */
  async deletePost(postId: string, userId: string): Promise<void> {
    const post = this.posts.get(postId);
    if (!post) {
      throw new Error('Post not found');
    }
    if (post.userId !== userId) {
      throw new Error('Unauthorized');
    }

    this.posts.delete(postId);

    const user = this.users.get(userId);
    if (user && user.postsCount > 0) user.postsCount--;
  }

  /**
   * Like a post
   */
  async likePost(postId: string, userId: string): Promise<void> {
    const post = this.posts.get(postId);
    if (!post) {
      throw new Error('Post not found');
    }
    post.likes++;
  }

  /**
   * Get user's posts
   */
  async getUserPosts(userId: string, limit: number = 20): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter((p) => p.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  /**
   * Get activity feed (posts from followed users)
   */
  async getFeed(userId: string, limit: number = 50): Promise<Post[]> {
    const followingIds = Array.from(this.following.get(userId) || []);
    followingIds.push(userId); // Include own posts

    return Array.from(this.posts.values())
      .filter((p) => followingIds.includes(p.userId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  // ============================================================================
  // COMMENTS
  // ============================================================================

  /**
   * Add comment to post
   */
  async addComment(postId: string, userId: string, content: string): Promise<Comment> {
    const post = this.posts.get(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const comment: Comment = {
      commentId: this.generateId('comment'),
      postId,
      userId,
      username: user.username,
      content,
      likes: 0,
      replies: [],
      createdAt: new Date().toISOString(),
      isEdited: false,
    };

    this.comments.set(comment.commentId, comment);
    post.comments++;

    return comment;
  }

  /**
   * Get comments for a post
   */
  async getComments(postId: string, limit: number = 50): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter((c) => c.postId === postId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  /**
   * Delete comment
   */
  async deleteComment(commentId: string, userId: string): Promise<void> {
    const comment = this.comments.get(commentId);
    if (!comment) {
      throw new Error('Comment not found');
    }
    if (comment.userId !== userId) {
      throw new Error('Unauthorized');
    }

    this.comments.delete(commentId);

    const post = this.posts.get(comment.postId);
    if (post && post.comments > 0) post.comments--;
  }

  // ============================================================================
  // GROUPS
  // ============================================================================

  /**
   * Create a group
   */
  async createGroup(
    creatorId: string,
    name: string,
    description: string,
    options?: {
      coverImage?: string;
      isPrivate?: boolean;
      tags?: string[];
      rules?: string[];
    }
  ): Promise<Group> {
    const group: Group = {
      groupId: this.generateId('group'),
      name,
      description,
      coverImage: options?.coverImage,
      creatorId,
      members: 1,
      postsCount: 0,
      isPrivate: options?.isPrivate || false,
      tags: options?.tags || [],
      createdAt: new Date().toISOString(),
      rules: options?.rules,
    };

    this.groups.set(group.groupId, group);

    // Add creator as first member
    if (!this.groupMembers.has(group.groupId)) {
      this.groupMembers.set(group.groupId, new Set());
    }
    this.groupMembers.get(group.groupId)!.add(creatorId);

    return group;
  }

  /**
   * Get group by ID
   */
  async getGroup(groupId: string): Promise<Group | null> {
    return this.groups.get(groupId) || null;
  }

  /**
   * Join a group
   */
  async joinGroup(groupId: string, userId: string): Promise<void> {
    const group = this.groups.get(groupId);
    if (!group) {
      throw new Error('Group not found');
    }

    if (!this.groupMembers.has(groupId)) {
      this.groupMembers.set(groupId, new Set());
    }

    const members = this.groupMembers.get(groupId)!;
    if (!members.has(userId)) {
      members.add(userId);
      group.members++;
    }
  }

  /**
   * Leave a group
   */
  async leaveGroup(groupId: string, userId: string): Promise<void> {
    const group = this.groups.get(groupId);
    if (!group) {
      throw new Error('Group not found');
    }

    const members = this.groupMembers.get(groupId);
    if (members?.has(userId)) {
      members.delete(userId);
      if (group.members > 0) group.members--;
    }
  }

  /**
   * Get user's groups
   */
  async getUserGroups(userId: string): Promise<Group[]> {
    const userGroups: Group[] = [];

    for (const [groupId, members] of this.groupMembers.entries()) {
      if (members.has(userId)) {
        const group = this.groups.get(groupId);
        if (group) userGroups.push(group);
      }
    }

    return userGroups;
  }

  /**
   * Search groups
   */
  async searchGroups(query: string, limit: number = 20): Promise<Group[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.groups.values())
      .filter(
        (g) =>
          g.name.toLowerCase().includes(lowerQuery) ||
          g.description.toLowerCase().includes(lowerQuery) ||
          g.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
      )
      .slice(0, limit);
  }

  // ============================================================================
  // MODERATION
  // ============================================================================

  /**
   * Check if content is spam (basic implementation)
   */
  private async isSpam(content: string): Promise<boolean> {
    const spamKeywords = ['buy now', 'click here', 'free money', 'limited offer'];
    const lowerContent = content.toLowerCase();

    // Check for spam keywords
    const hasSpamKeywords = spamKeywords.some((keyword) =>
      lowerContent.includes(keyword)
    );

    // Check for excessive caps
    const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
    const excessiveCaps = capsRatio > 0.5 && content.length > 20;

    // Check for excessive links
    const linkCount = (content.match(/https?:\/\//g) || []).length;
    const excessiveLinks = linkCount > 3;

    return hasSpamKeywords || excessiveCaps || excessiveLinks;
  }

  /**
   * Moderate content (delete spam, ban users)
   */
  async moderateContent(
    moderatorId: string,
    action: ModerationAction
  ): Promise<void> {
    // TODO: Implement moderation actions
    console.log('Moderation action:', action);
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get community statistics
   */
  getStatistics(): {
    totalUsers: number;
    totalPosts: number;
    totalComments: number;
    totalGroups: number;
  } {
    return {
      totalUsers: this.users.size,
      totalPosts: this.posts.size,
      totalComments: this.comments.size,
      totalGroups: this.groups.size,
    };
  }

  /**
   * Get mock data for testing
   */
  getMockData(): {
    users: UserProfile[];
    posts: Post[];
    groups: Group[];
  } {
    const users: UserProfile[] = [
      {
        userId: 'user_001',
        username: 'foodvlogger',
        displayName: 'Food Vlogger',
        bio: 'Sharing delicious recipes from around the world 🍕',
        followers: 1250,
        following: 340,
        postsCount: 87,
        joinedAt: '2025-01-15T10:00:00Z',
        verified: true,
        badges: ['Top Contributor', 'Early Adopter'],
        socialLinks: {
          youtube: 'youtube.com/foodvlogger',
          instagram: 'instagram.com/foodvlogger',
        },
      },
      {
        userId: 'user_002',
        username: 'techexplorer',
        displayName: 'Tech Explorer',
        bio: 'Exploring the latest in AI and technology 🤖',
        followers: 890,
        following: 210,
        postsCount: 52,
        joinedAt: '2025-02-01T14:00:00Z',
        verified: false,
        badges: ['Active Member'],
      },
      {
        userId: 'user_003',
        username: 'travelguru',
        displayName: 'Travel Guru',
        bio: 'Wanderlust | 50+ countries visited ✈️',
        followers: 2100,
        following: 450,
        postsCount: 134,
        joinedAt: '2024-12-10T08:00:00Z',
        verified: true,
        badges: ['Top Contributor', 'Verified Creator'],
      },
    ];

    const posts: Post[] = [
      {
        postId: 'post_001',
        userId: 'user_001',
        username: 'foodvlogger',
        content: 'Just posted a new video on making authentic Butter Chicken! Check it out 🍗',
        likes: 245,
        comments: 18,
        shares: 12,
        createdAt: '2026-02-27T10:30:00Z',
        updatedAt: '2026-02-27T10:30:00Z',
        tags: ['food', 'recipe', 'indian'],
        isPinned: false,
        isEdited: false,
      },
      {
        postId: 'post_002',
        userId: 'user_002',
        username: 'techexplorer',
        content: 'AI is revolutionizing content creation. Here are my top 5 tools for creators in 2026...',
        likes: 189,
        comments: 24,
        shares: 31,
        createdAt: '2026-02-27T14:15:00Z',
        updatedAt: '2026-02-27T14:15:00Z',
        tags: ['ai', 'tools', 'creators'],
        isPinned: true,
        isEdited: false,
      },
      {
        postId: 'post_003',
        userId: 'user_003',
        username: 'travelguru',
        content: 'Hidden gems in Rajasthan that tourists miss! Thread 🧵',
        likes: 412,
        comments: 56,
        shares: 78,
        createdAt: '2026-02-26T16:45:00Z',
        updatedAt: '2026-02-26T16:45:00Z',
        tags: ['travel', 'india', 'rajasthan'],
        isPinned: false,
        isEdited: false,
      },
    ];

    const groups: Group[] = [
      {
        groupId: 'group_001',
        name: 'Food Creators Network',
        description: 'A community for food content creators to share tips, recipes, and collaborate',
        creatorId: 'user_001',
        members: 342,
        postsCount: 1247,
        isPrivate: false,
        tags: ['food', 'cooking', 'recipes'],
        createdAt: '2025-06-15T10:00:00Z',
        rules: [
          'Be respectful to all members',
          'No spam or self-promotion without permission',
          'Share original content only',
        ],
      },
      {
        groupId: 'group_002',
        name: 'AI Content Creators',
        description: 'Discussing AI tools and techniques for content creation',
        creatorId: 'user_002',
        members: 567,
        postsCount: 2134,
        isPrivate: false,
        tags: ['ai', 'technology', 'content'],
        createdAt: '2025-08-20T14:00:00Z',
      },
      {
        groupId: 'group_003',
        name: 'Travel Vloggers Hub',
        description: 'Connect with fellow travel vloggers and share experiences',
        creatorId: 'user_003',
        members: 891,
        postsCount: 3456,
        isPrivate: false,
        tags: ['travel', 'vlogging', 'adventure'],
        createdAt: '2025-05-10T09:00:00Z',
      },
    ];

    return { users, posts, groups };
  }
}
