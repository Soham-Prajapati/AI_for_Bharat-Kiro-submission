/**
 * Community API Routes
 * POST /api/community/post - Create a post
 * GET /api/community/feed - Get community feed
 * POST /api/community/post/:id/like - Like a post
 * POST /api/community/post/:id/comment - Comment on a post
 * DELETE /api/community/post/:id - Delete a post
 * POST /api/community/group - Create a group
 * GET /api/community/groups - List groups
 * POST /api/community/group/:id/join - Join a group
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.middleware';
import { ValidationError } from '../types/errors';
import { communityService } from '../services/community.service';

const router = Router();

/**
 * POST /api/community/post
 * Create a new post
 */
router.post('/post', asyncHandler(async (req: Request, res: Response) => {
  const { userId, content, groupId, images } = req.body;

  if (!userId || !content) {
    throw new ValidationError('userId and content required');
  }

  const post = communityService.createPost(userId, content, groupId, images);

  res.status(201).json({
    success: true,
    post: {
      id: post.id,
      userId: post.userId,
      content: post.content,
      images: post.images,
      likes: post.likes.length,
      comments: post.comments.length,
      groupId: post.groupId,
      createdAt: post.createdAt
    }
  });
}));

/**
 * GET /api/community/feed
 * Get community feed
 */
router.get('/feed', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.query.userId as string;
  const limit = parseInt(req.query.limit as string) || 50;
  const offset = parseInt(req.query.offset as string) || 0;

  const posts = communityService.getFeed(userId, limit, offset);

  res.json({
    success: true,
    posts: posts.map(post => ({
      id: post.id,
      userId: post.userId,
      content: post.content,
      images: post.images,
      likes: post.likes.length,
      comments: post.comments.length,
      groupId: post.groupId,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt
    })),
    count: posts.length,
    limit,
    offset
  });
}));

/**
 * GET /api/community/post/:id
 * Get a specific post
 */
router.get('/post/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const post = communityService.getPost(id);

  if (!post) {
    return res.status(404).json({
      success: false,
      error: 'Post not found'
    });
  }

  res.json({
    success: true,
    post: {
      id: post.id,
      userId: post.userId,
      content: post.content,
      images: post.images,
      likes: post.likes,
      comments: post.comments,
      groupId: post.groupId,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt
    }
  });
}));

/**
 * POST /api/community/post/:id/like
 * Like a post
 */
router.post('/post/:id/like', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.body;

  if (!userId) {
    throw new ValidationError('userId required');
  }

  const success = communityService.likePost(id, userId);

  if (!success) {
    return res.status(404).json({
      success: false,
      error: 'Post not found'
    });
  }

  res.json({
    success: true,
    message: 'Post liked',
    postId: id
  });
}));

/**
 * DELETE /api/community/post/:id/like
 * Unlike a post
 */
router.delete('/post/:id/like', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.body;

  if (!userId) {
    throw new ValidationError('userId required');
  }

  const success = communityService.unlikePost(id, userId);

  if (!success) {
    return res.status(404).json({
      success: false,
      error: 'Post not found'
    });
  }

  res.json({
    success: true,
    message: 'Post unliked',
    postId: id
  });
}));

/**
 * POST /api/community/post/:id/comment
 * Add a comment to a post
 */
router.post('/post/:id/comment', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId, content } = req.body;

  if (!userId || !content) {
    throw new ValidationError('userId and content required');
  }

  const comment = communityService.addComment(id, userId, content);

  if (!comment) {
    return res.status(404).json({
      success: false,
      error: 'Post not found'
    });
  }

  res.status(201).json({
    success: true,
    comment: {
      id: comment.id,
      userId: comment.userId,
      postId: comment.postId,
      content: comment.content,
      createdAt: comment.createdAt
    }
  });
}));

/**
 * DELETE /api/community/post/:id
 * Delete a post
 */
router.delete('/post/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.body;

  if (!userId) {
    throw new ValidationError('userId required');
  }

  const success = communityService.deletePost(id, userId);

  if (!success) {
    return res.status(404).json({
      success: false,
      error: 'Post not found or unauthorized'
    });
  }

  res.json({
    success: true,
    message: 'Post deleted',
    postId: id
  });
}));

/**
 * POST /api/community/group
 * Create a new group
 */
router.post('/group', asyncHandler(async (req: Request, res: Response) => {
  const { name, description, ownerId } = req.body;

  if (!name || !ownerId) {
    throw new ValidationError('name and ownerId required');
  }

  const group = communityService.createGroup(name, description || '', ownerId);

  res.status(201).json({
    success: true,
    group: {
      id: group.id,
      name: group.name,
      description: group.description,
      ownerId: group.ownerId,
      memberCount: group.members.length,
      postCount: group.posts.length,
      createdAt: group.createdAt
    }
  });
}));

/**
 * GET /api/community/groups
 * List all groups
 */
router.get('/groups', asyncHandler(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 50;

  const groups = communityService.listGroups(limit);

  res.json({
    success: true,
    groups: groups.map(group => ({
      id: group.id,
      name: group.name,
      description: group.description,
      ownerId: group.ownerId,
      memberCount: group.members.length,
      postCount: group.posts.length,
      createdAt: group.createdAt
    })),
    count: groups.length
  });
}));

/**
 * GET /api/community/group/:id
 * Get group details
 */
router.get('/group/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const group = communityService.getGroup(id);

  if (!group) {
    return res.status(404).json({
      success: false,
      error: 'Group not found'
    });
  }

  res.json({
    success: true,
    group: {
      id: group.id,
      name: group.name,
      description: group.description,
      ownerId: group.ownerId,
      members: group.members,
      posts: group.posts,
      createdAt: group.createdAt
    }
  });
}));

/**
 * POST /api/community/group/:id/join
 * Join a group
 */
router.post('/group/:id/join', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.body;

  if (!userId) {
    throw new ValidationError('userId required');
  }

  const success = communityService.joinGroup(id, userId);

  if (!success) {
    return res.status(404).json({
      success: false,
      error: 'Group not found'
    });
  }

  res.json({
    success: true,
    message: 'Joined group',
    groupId: id
  });
}));

/**
 * POST /api/community/group/:id/leave
 * Leave a group
 */
router.post('/group/:id/leave', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.body;

  if (!userId) {
    throw new ValidationError('userId required');
  }

  const success = communityService.leaveGroup(id, userId);

  if (!success) {
    return res.status(404).json({
      success: false,
      error: 'Group not found or you are the owner'
    });
  }

  res.json({
    success: true,
    message: 'Left group',
    groupId: id
  });
}));

/**
 * GET /api/community/user/:id
 * Get user profile
 */
router.get('/user/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Auto-create a default profile if the user hasn't joined the community yet
  const user = communityService.getUser(id) || communityService.upsertUser({ id });

  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      followerCount: user.followers.length,
      followingCount: user.following.length,
      createdAt: user.createdAt
    }
  });
}));

/**
 * POST /api/community/user/:id/follow
 * Follow a user
 */
router.post('/user/:id/follow', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.body;

  if (!userId) {
    throw new ValidationError('userId required');
  }

  const success = communityService.followUser(userId, id);

  if (!success) {
    return res.status(400).json({
      success: false,
      error: 'Cannot follow user'
    });
  }

  res.json({
    success: true,
    message: 'User followed',
    followeeId: id
  });
}));

/**
 * POST /api/community/user/:id/unfollow
 * Unfollow a user
 */
router.post('/user/:id/unfollow', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.body;

  if (!userId) {
    throw new ValidationError('userId required');
  }

  const success = communityService.unfollowUser(userId, id);

  if (!success) {
    return res.status(400).json({
      success: false,
      error: 'Cannot unfollow user'
    });
  }

  res.json({
    success: true,
    message: 'User unfollowed',
    followeeId: id
  });
}));

export default router;
