/**
 * Community API Tests
 */

import request from 'supertest';
import app from '../index';
import { communityService } from '../services/community.service';

describe('Community API', () => {
  const testUserId = 'test-user-1';
  const testUserId2 = 'test-user-2';

  describe('POST /api/community/post', () => {
    it('should create a new post', async () => {
      const response = await request(app)
        .post('/api/community/post')
        .send({
          userId: testUserId,
          content: 'This is my first post!'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.post).toHaveProperty('id');
      expect(response.body.post.content).toBe('This is my first post!');
      expect(response.body.post.userId).toBe(testUserId);
    });

    it('should create post with images', async () => {
      const response = await request(app)
        .post('/api/community/post')
        .send({
          userId: testUserId,
          content: 'Check out these images!',
          images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg']
        });

      expect(response.status).toBe(201);
      expect(response.body.post.images).toHaveLength(2);
    });

    it('should return 400 if userId is missing', async () => {
      const response = await request(app)
        .post('/api/community/post')
        .send({
          content: 'Missing userId'
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 if content is missing', async () => {
      const response = await request(app)
        .post('/api/community/post')
        .send({
          userId: testUserId
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/community/feed', () => {
    beforeEach(async () => {
      // Create some test posts
      await request(app)
        .post('/api/community/post')
        .send({ userId: testUserId, content: 'Post 1' });
      
      await request(app)
        .post('/api/community/post')
        .send({ userId: testUserId2, content: 'Post 2' });
    });

    it('should get community feed', async () => {
      const response = await request(app)
        .get('/api/community/feed');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.posts).toBeInstanceOf(Array);
      expect(response.body.posts.length).toBeGreaterThan(0);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/community/feed?limit=1&offset=0');

      expect(response.status).toBe(200);
      expect(response.body.posts).toHaveLength(1);
      expect(response.body.limit).toBe(1);
      expect(response.body.offset).toBe(0);
    });
  });

  describe('POST /api/community/post/:id/like', () => {
    let postId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/community/post')
        .send({ userId: testUserId, content: 'Like this post!' });
      
      postId = response.body.post.id;
    });

    it('should like a post', async () => {
      const response = await request(app)
        .post(`/api/community/post/${postId}/like`)
        .send({ userId: testUserId2 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify like was added
      const postResponse = await request(app)
        .get(`/api/community/post/${postId}`);
      
      expect(postResponse.body.post.likes).toContain(testUserId2);
    });

    it('should return 404 for non-existent post', async () => {
      const response = await request(app)
        .post('/api/community/post/non-existent/like')
        .send({ userId: testUserId });

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/community/post/:id/comment', () => {
    let postId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/community/post')
        .send({ userId: testUserId, content: 'Comment on this!' });
      
      postId = response.body.post.id;
    });

    it('should add a comment to a post', async () => {
      const response = await request(app)
        .post(`/api/community/post/${postId}/comment`)
        .send({
          userId: testUserId2,
          content: 'Great post!'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.comment.content).toBe('Great post!');

      // Verify comment was added
      const postResponse = await request(app)
        .get(`/api/community/post/${postId}`);
      
      expect(postResponse.body.post.comments).toHaveLength(1);
    });
  });

  describe('DELETE /api/community/post/:id', () => {
    let postId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/community/post')
        .send({ userId: testUserId, content: 'Delete me!' });
      
      postId = response.body.post.id;
    });

    it('should delete own post', async () => {
      const response = await request(app)
        .delete(`/api/community/post/${postId}`)
        .send({ userId: testUserId });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify post is deleted
      const getResponse = await request(app)
        .get(`/api/community/post/${postId}`);
      
      expect(getResponse.status).toBe(404);
    });

    it('should not delete other user\'s post', async () => {
      const response = await request(app)
        .delete(`/api/community/post/${postId}`)
        .send({ userId: testUserId2 });

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/community/group', () => {
    it('should create a new group', async () => {
      const response = await request(app)
        .post('/api/community/group')
        .send({
          name: 'Tech Creators',
          description: 'A group for tech content creators',
          ownerId: testUserId
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.group.name).toBe('Tech Creators');
      expect(response.body.group.ownerId).toBe(testUserId);
    });

    it('should return 400 if name is missing', async () => {
      const response = await request(app)
        .post('/api/community/group')
        .send({
          ownerId: testUserId
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/community/groups', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/community/group')
        .send({
          name: 'Group 1',
          description: 'First group',
          ownerId: testUserId
        });
    });

    it('should list all groups', async () => {
      const response = await request(app)
        .get('/api/community/groups');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.groups).toBeInstanceOf(Array);
      expect(response.body.groups.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/community/group/:id/join', () => {
    let groupId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/community/group')
        .send({
          name: 'Join Test Group',
          description: 'Test joining',
          ownerId: testUserId
        });
      
      groupId = response.body.group.id;
    });

    it('should join a group', async () => {
      const response = await request(app)
        .post(`/api/community/group/${groupId}/join`)
        .send({ userId: testUserId2 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify user joined
      const groupResponse = await request(app)
        .get(`/api/community/group/${groupId}`);
      
      expect(groupResponse.body.group.members).toContain(testUserId2);
    });
  });

  describe('User Follow/Unfollow', () => {
    beforeEach(() => {
      // Create test users
      communityService.upsertUser({
        id: testUserId,
        name: 'User 1',
        email: 'user1@test.com'
      });

      communityService.upsertUser({
        id: testUserId2,
        name: 'User 2',
        email: 'user2@test.com'
      });
    });

    it('should follow a user', async () => {
      const response = await request(app)
        .post(`/api/community/user/${testUserId2}/follow`)
        .send({ userId: testUserId });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should unfollow a user', async () => {
      // First follow
      await request(app)
        .post(`/api/community/user/${testUserId2}/follow`)
        .send({ userId: testUserId });

      // Then unfollow
      const response = await request(app)
        .post(`/api/community/user/${testUserId2}/unfollow`)
        .send({ userId: testUserId });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should get user profile', async () => {
      const response = await request(app)
        .get(`/api/community/user/${testUserId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user.id).toBe(testUserId);
    });
  });
});
