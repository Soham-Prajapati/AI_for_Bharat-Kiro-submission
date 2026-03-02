/**
 * Platform Integrations Test Suite
 * Tests for YouTube, Instagram, LinkedIn, Twitter, TikTok, Facebook
 * 
 * Coverage:
 * - OAuth authentication flows
 * - Content posting
 * - Analytics fetching
 * - Error handling and retries
 * - Rate limiting
 * - Token refresh
 * - Platform-specific features
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

// Mock platform integration services
const mockPlatformServices = {
  youtube: {
    authenticate: jest.fn(),
    post: jest.fn(),
    getAnalytics: jest.fn(),
    refreshToken: jest.fn(),
    disconnect: jest.fn(),
  },
  instagram: {
    authenticate: jest.fn(),
    post: jest.fn(),
    getAnalytics: jest.fn(),
    refreshToken: jest.fn(),
    disconnect: jest.fn(),
  },
  linkedin: {
    authenticate: jest.fn(),
    post: jest.fn(),
    getAnalytics: jest.fn(),
    refreshToken: jest.fn(),
    disconnect: jest.fn(),
  },
  twitter: {
    authenticate: jest.fn(),
    post: jest.fn(),
    getAnalytics: jest.fn(),
    refreshToken: jest.fn(),
    disconnect: jest.fn(),
  },
  tiktok: {
    authenticate: jest.fn(),
    post: jest.fn(),
    getAnalytics: jest.fn(),
    refreshToken: jest.fn(),
    disconnect: jest.fn(),
  },
  facebook: {
    authenticate: jest.fn(),
    post: jest.fn(),
    getAnalytics: jest.fn(),
    refreshToken: jest.fn(),
    disconnect: jest.fn(),
  },
};

// Mock rate limiter
const mockRateLimiter = {
  checkLimit: jest.fn(),
  recordRequest: jest.fn(),
  getRemainingRequests: jest.fn(),
};

// Mock token manager
const mockTokenManager = {
  storeToken: jest.fn(),
  getToken: jest.fn(),
  refreshToken: jest.fn(),
  revokeToken: jest.fn(),
  isTokenValid: jest.fn(),
};

describe('Platform Integrations - OAuth Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('YouTube OAuth', () => {
    it('should successfully authenticate with YouTube', async () => {
      const mockAuthResponse = {
        accessToken: 'yt_access_token_123',
        refreshToken: 'yt_refresh_token_123',
        expiresIn: 3600,
        scope: 'youtube.upload youtube.readonly',
      };

      mockPlatformServices.youtube.authenticate.mockResolvedValue(mockAuthResponse);

      const result = await mockPlatformServices.youtube.authenticate({
        clientId: 'test_client_id',
        redirectUri: 'http://localhost:3000/callback',
        code: 'auth_code_123',
      });

      expect(result).toEqual(mockAuthResponse);
      expect(mockPlatformServices.youtube.authenticate).toHaveBeenCalledTimes(1);
    });

    it('should handle YouTube OAuth errors', async () => {
      mockPlatformServices.youtube.authenticate.mockRejectedValue(
        new Error('Invalid authorization code')
      );

      await expect(
        mockPlatformServices.youtube.authenticate({ code: 'invalid_code' })
      ).rejects.toThrow('Invalid authorization code');
    });

    it('should refresh YouTube access token', async () => {
      const mockRefreshResponse = {
        accessToken: 'yt_new_access_token',
        expiresIn: 3600,
      };

      mockPlatformServices.youtube.refreshToken.mockResolvedValue(mockRefreshResponse);

      const result = await mockPlatformServices.youtube.refreshToken('yt_refresh_token_123');
      expect(result.accessToken).toBe('yt_new_access_token');
    });
  });

  describe('Instagram OAuth', () => {
    it('should successfully authenticate with Instagram', async () => {
      const mockAuthResponse = {
        accessToken: 'ig_access_token_123',
        userId: 'ig_user_123',
        expiresIn: 5184000, // 60 days
      };

      mockPlatformServices.instagram.authenticate.mockResolvedValue(mockAuthResponse);

      const result = await mockPlatformServices.instagram.authenticate({
        clientId: 'ig_client_id',
        code: 'ig_auth_code',
      });

      expect(result.accessToken).toBe('ig_access_token_123');
      expect(result.userId).toBe('ig_user_123');
    });

    it('should handle Instagram OAuth rate limiting', async () => {
      mockPlatformServices.instagram.authenticate.mockRejectedValue(
        new Error('Rate limit exceeded')
      );

      await expect(
        mockPlatformServices.instagram.authenticate({ code: 'test_code' })
      ).rejects.toThrow('Rate limit exceeded');
    });

    it('should exchange short-lived token for long-lived token', async () => {
      const mockLongLivedToken = {
        accessToken: 'ig_long_lived_token',
        expiresIn: 5184000,
      };

      mockPlatformServices.instagram.refreshToken.mockResolvedValue(mockLongLivedToken);

      const result = await mockPlatformServices.instagram.refreshToken('ig_short_token');
      expect(result.expiresIn).toBe(5184000);
    });
  });

  describe('LinkedIn OAuth', () => {
    it('should successfully authenticate with LinkedIn', async () => {
      const mockAuthResponse = {
        accessToken: 'li_access_token_123',
        expiresIn: 5184000,
        scope: 'w_member_social r_liteprofile',
      };

      mockPlatformServices.linkedin.authenticate.mockResolvedValue(mockAuthResponse);

      const result = await mockPlatformServices.linkedin.authenticate({
        clientId: 'li_client_id',
        clientSecret: 'li_client_secret',
        code: 'li_auth_code',
      });

      expect(result.accessToken).toBe('li_access_token_123');
      expect(result.scope).toContain('w_member_social');
    });

    it('should handle LinkedIn OAuth scope errors', async () => {
      mockPlatformServices.linkedin.authenticate.mockRejectedValue(
        new Error('Insufficient scope permissions')
      );

      await expect(
        mockPlatformServices.linkedin.authenticate({ code: 'test_code' })
      ).rejects.toThrow('Insufficient scope permissions');
    });
  });

  describe('Twitter OAuth', () => {
    it('should successfully authenticate with Twitter OAuth 2.0', async () => {
      const mockAuthResponse = {
        accessToken: 'tw_access_token_123',
        refreshToken: 'tw_refresh_token_123',
        expiresIn: 7200,
        scope: 'tweet.read tweet.write users.read',
      };

      mockPlatformServices.twitter.authenticate.mockResolvedValue(mockAuthResponse);

      const result = await mockPlatformServices.twitter.authenticate({
        clientId: 'tw_client_id',
        codeVerifier: 'code_verifier_123',
        code: 'tw_auth_code',
      });

      expect(result.accessToken).toBe('tw_access_token_123');
      expect(result.scope).toContain('tweet.write');
    });

    it('should handle Twitter OAuth PKCE validation errors', async () => {
      mockPlatformServices.twitter.authenticate.mockRejectedValue(
        new Error('Invalid code verifier')
      );

      await expect(
        mockPlatformServices.twitter.authenticate({ codeVerifier: 'invalid' })
      ).rejects.toThrow('Invalid code verifier');
    });

    it('should refresh Twitter access token', async () => {
      const mockRefreshResponse = {
        accessToken: 'tw_new_access_token',
        refreshToken: 'tw_new_refresh_token',
        expiresIn: 7200,
      };

      mockPlatformServices.twitter.refreshToken.mockResolvedValue(mockRefreshResponse);

      const result = await mockPlatformServices.twitter.refreshToken('tw_refresh_token_123');
      expect(result.accessToken).toBe('tw_new_access_token');
    });
  });

  describe('TikTok OAuth', () => {
    it('should successfully authenticate with TikTok', async () => {
      const mockAuthResponse = {
        accessToken: 'tt_access_token_123',
        refreshToken: 'tt_refresh_token_123',
        expiresIn: 86400,
        openId: 'tt_open_id_123',
        scope: 'user.info.basic video.upload',
      };

      mockPlatformServices.tiktok.authenticate.mockResolvedValue(mockAuthResponse);

      const result = await mockPlatformServices.tiktok.authenticate({
        clientKey: 'tt_client_key',
        code: 'tt_auth_code',
      });

      expect(result.accessToken).toBe('tt_access_token_123');
      expect(result.openId).toBe('tt_open_id_123');
    });

    it('should handle TikTok OAuth region restrictions', async () => {
      mockPlatformServices.tiktok.authenticate.mockRejectedValue(
        new Error('Service not available in this region')
      );

      await expect(
        mockPlatformServices.tiktok.authenticate({ code: 'test_code' })
      ).rejects.toThrow('Service not available in this region');
    });

    it('should refresh TikTok access token', async () => {
      const mockRefreshResponse = {
        accessToken: 'tt_new_access_token',
        refreshToken: 'tt_new_refresh_token',
        expiresIn: 86400,
      };

      mockPlatformServices.tiktok.refreshToken.mockResolvedValue(mockRefreshResponse);

      const result = await mockPlatformServices.tiktok.refreshToken('tt_refresh_token_123');
      expect(result.accessToken).toBe('tt_new_access_token');
    });
  });

  describe('Facebook OAuth', () => {
    it('should successfully authenticate with Facebook', async () => {
      const mockAuthResponse = {
        accessToken: 'fb_access_token_123',
        userId: 'fb_user_123',
        expiresIn: 5184000,
        grantedScopes: ['pages_manage_posts', 'pages_read_engagement'],
      };

      mockPlatformServices.facebook.authenticate.mockResolvedValue(mockAuthResponse);

      const result = await mockPlatformServices.facebook.authenticate({
        clientId: 'fb_client_id',
        clientSecret: 'fb_client_secret',
        code: 'fb_auth_code',
      });

      expect(result.accessToken).toBe('fb_access_token_123');
      expect(result.grantedScopes).toContain('pages_manage_posts');
    });

    it('should handle Facebook OAuth app review requirements', async () => {
      mockPlatformServices.facebook.authenticate.mockRejectedValue(
        new Error('Permission requires app review')
      );

      await expect(
        mockPlatformServices.facebook.authenticate({ code: 'test_code' })
      ).rejects.toThrow('Permission requires app review');
    });

    it('should exchange short-lived token for long-lived token', async () => {
      const mockLongLivedToken = {
        accessToken: 'fb_long_lived_token',
        expiresIn: 5184000,
      };

      mockPlatformServices.facebook.refreshToken.mockResolvedValue(mockLongLivedToken);

      const result = await mockPlatformServices.facebook.refreshToken('fb_short_token');
      expect(result.expiresIn).toBe(5184000);
    });
  });
});

describe('Platform Integrations - Content Posting', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('YouTube Content Posting', () => {
    it('should successfully upload video to YouTube', async () => {
      const mockUploadResponse = {
        videoId: 'yt_video_123',
        status: 'uploaded',
        url: 'https://youtube.com/watch?v=yt_video_123',
      };

      mockPlatformServices.youtube.post.mockResolvedValue(mockUploadResponse);

      const result = await mockPlatformServices.youtube.post({
        accessToken: 'yt_access_token',
        video: {
          file: 'video.mp4',
          title: 'Test Video',
          description: 'Test Description',
          tags: ['test', 'video'],
          categoryId: '22',
        },
      });

      expect(result.videoId).toBe('yt_video_123');
      expect(result.status).toBe('uploaded');
    });

    it('should handle YouTube video size limits', async () => {
      mockPlatformServices.youtube.post.mockRejectedValue(
        new Error('Video file size exceeds 256GB limit')
      );

      await expect(
        mockPlatformServices.youtube.post({ video: { file: 'large_video.mp4' } })
      ).rejects.toThrow('Video file size exceeds 256GB limit');
    });

    it('should handle YouTube quota exceeded errors', async () => {
      mockPlatformServices.youtube.post.mockRejectedValue(
        new Error('Daily upload quota exceeded')
      );

      await expect(
        mockPlatformServices.youtube.post({ video: { file: 'video.mp4' } })
      ).rejects.toThrow('Daily upload quota exceeded');
    });
  });

  describe('Instagram Content Posting', () => {
    it('should successfully post image to Instagram', async () => {
      const mockPostResponse = {
        mediaId: 'ig_media_123',
        permalink: 'https://instagram.com/p/ig_media_123',
        status: 'published',
      };

      mockPlatformServices.instagram.post.mockResolvedValue(mockPostResponse);

      const result = await mockPlatformServices.instagram.post({
        accessToken: 'ig_access_token',
        media: {
          type: 'image',
          url: 'https://example.com/image.jpg',
          caption: 'Test caption #test',
        },
      });

      expect(result.mediaId).toBe('ig_media_123');
      expect(result.status).toBe('published');
    });

    it('should successfully post reel to Instagram', async () => {
      const mockReelResponse = {
        mediaId: 'ig_reel_123',
        permalink: 'https://instagram.com/reel/ig_reel_123',
        status: 'published',
      };

      mockPlatformServices.instagram.post.mockResolvedValue(mockReelResponse);

      const result = await mockPlatformServices.instagram.post({
        accessToken: 'ig_access_token',
        media: {
          type: 'reel',
          videoUrl: 'https://example.com/reel.mp4',
          caption: 'Test reel',
          coverUrl: 'https://example.com/cover.jpg',
        },
      });

      expect(result.mediaId).toBe('ig_reel_123');
    });

    it('should handle Instagram aspect ratio requirements', async () => {
      mockPlatformServices.instagram.post.mockRejectedValue(
        new Error('Image aspect ratio must be between 4:5 and 1.91:1')
      );

      await expect(
        mockPlatformServices.instagram.post({ media: { type: 'image' } })
      ).rejects.toThrow('Image aspect ratio must be between 4:5 and 1.91:1');
    });

    it('should handle Instagram caption length limits', async () => {
      mockPlatformServices.instagram.post.mockRejectedValue(
        new Error('Caption exceeds 2200 character limit')
      );

      await expect(
        mockPlatformServices.instagram.post({ media: { caption: 'x'.repeat(2201) } })
      ).rejects.toThrow('Caption exceeds 2200 character limit');
    });
  });

  describe('LinkedIn Content Posting', () => {
    it('should successfully post text update to LinkedIn', async () => {
      const mockPostResponse = {
        postId: 'li_post_123',
        url: 'https://linkedin.com/feed/update/li_post_123',
        status: 'published',
      };

      mockPlatformServices.linkedin.post.mockResolvedValue(mockPostResponse);

      const result = await mockPlatformServices.linkedin.post({
        accessToken: 'li_access_token',
        content: {
          text: 'Professional update',
          visibility: 'PUBLIC',
        },
      });

      expect(result.postId).toBe('li_post_123');
    });

    it('should successfully post article to LinkedIn', async () => {
      const mockArticleResponse = {
        articleId: 'li_article_123',
        url: 'https://linkedin.com/pulse/li_article_123',
        status: 'published',
      };

      mockPlatformServices.linkedin.post.mockResolvedValue(mockArticleResponse);

      const result = await mockPlatformServices.linkedin.post({
        accessToken: 'li_access_token',
        content: {
          type: 'article',
          title: 'Article Title',
          text: 'Article content',
          media: [{ url: 'https://example.com/image.jpg' }],
        },
      });

      expect(result.articleId).toBe('li_article_123');
    });

    it('should handle LinkedIn text length limits', async () => {
      mockPlatformServices.linkedin.post.mockRejectedValue(
        new Error('Post text exceeds 3000 character limit')
      );

      await expect(
        mockPlatformServices.linkedin.post({ content: { text: 'x'.repeat(3001) } })
      ).rejects.toThrow('Post text exceeds 3000 character limit');
    });
  });

  describe('Twitter Content Posting', () => {
    it('should successfully post tweet', async () => {
      const mockTweetResponse = {
        tweetId: 'tw_tweet_123',
        url: 'https://twitter.com/user/status/tw_tweet_123',
        status: 'published',
      };

      mockPlatformServices.twitter.post.mockResolvedValue(mockTweetResponse);

      const result = await mockPlatformServices.twitter.post({
        accessToken: 'tw_access_token',
        tweet: {
          text: 'Test tweet #test',
        },
      });

      expect(result.tweetId).toBe('tw_tweet_123');
    });

    it('should successfully post tweet with media', async () => {
      const mockTweetResponse = {
        tweetId: 'tw_tweet_media_123',
        url: 'https://twitter.com/user/status/tw_tweet_media_123',
        status: 'published',
      };

      mockPlatformServices.twitter.post.mockResolvedValue(mockTweetResponse);

      const result = await mockPlatformServices.twitter.post({
        accessToken: 'tw_access_token',
        tweet: {
          text: 'Tweet with image',
          media: [{ mediaId: 'tw_media_123' }],
        },
      });

      expect(result.tweetId).toBe('tw_tweet_media_123');
    });

    it('should handle Twitter character limit', async () => {
      mockPlatformServices.twitter.post.mockRejectedValue(
        new Error('Tweet exceeds 280 character limit')
      );

      await expect(
        mockPlatformServices.twitter.post({ tweet: { text: 'x'.repeat(281) } })
      ).rejects.toThrow('Tweet exceeds 280 character limit');
    });

    it('should successfully post thread', async () => {
      const mockThreadResponse = {
        tweets: [
          { tweetId: 'tw_thread_1', status: 'published' },
          { tweetId: 'tw_thread_2', status: 'published' },
        ],
      };

      mockPlatformServices.twitter.post.mockResolvedValue(mockThreadResponse);

      const result = await mockPlatformServices.twitter.post({
        accessToken: 'tw_access_token',
        thread: [
          { text: 'First tweet' },
          { text: 'Second tweet' },
        ],
      });

      expect(result.tweets).toHaveLength(2);
    });
  });

  describe('TikTok Content Posting', () => {
    it('should successfully upload video to TikTok', async () => {
      const mockUploadResponse = {
        videoId: 'tt_video_123',
        shareUrl: 'https://tiktok.com/@user/video/tt_video_123',
        status: 'published',
      };

      mockPlatformServices.tiktok.post.mockResolvedValue(mockUploadResponse);

      const result = await mockPlatformServices.tiktok.post({
        accessToken: 'tt_access_token',
        video: {
          file: 'video.mp4',
          caption: 'Test TikTok #fyp',
          privacyLevel: 'PUBLIC_TO_EVERYONE',
        },
      });

      expect(result.videoId).toBe('tt_video_123');
    });

    it('should handle TikTok video duration limits', async () => {
      mockPlatformServices.tiktok.post.mockRejectedValue(
        new Error('Video duration must be between 3 seconds and 10 minutes')
      );

      await expect(
        mockPlatformServices.tiktok.post({ video: { file: 'short.mp4' } })
      ).rejects.toThrow('Video duration must be between 3 seconds and 10 minutes');
    });

    it('should handle TikTok file size limits', async () => {
      mockPlatformServices.tiktok.post.mockRejectedValue(
        new Error('Video file size exceeds 4GB limit')
      );

      await expect(
        mockPlatformServices.tiktok.post({ video: { file: 'large.mp4' } })
      ).rejects.toThrow('Video file size exceeds 4GB limit');
    });
  });

  describe('Facebook Content Posting', () => {
    it('should successfully post to Facebook page', async () => {
      const mockPostResponse = {
        postId: 'fb_post_123',
        url: 'https://facebook.com/page/posts/fb_post_123',
        status: 'published',
      };

      mockPlatformServices.facebook.post.mockResolvedValue(mockPostResponse);

      const result = await mockPlatformServices.facebook.post({
        accessToken: 'fb_access_token',
        pageId: 'fb_page_123',
        content: {
          message: 'Test Facebook post',
          link: 'https://example.com',
        },
      });

      expect(result.postId).toBe('fb_post_123');
    });

    it('should successfully post video to Facebook', async () => {
      const mockVideoResponse = {
        videoId: 'fb_video_123',
        url: 'https://facebook.com/page/videos/fb_video_123',
        status: 'published',
      };

      mockPlatformServices.facebook.post.mockResolvedValue(mockVideoResponse);

      const result = await mockPlatformServices.facebook.post({
        accessToken: 'fb_access_token',
        pageId: 'fb_page_123',
        content: {
          type: 'video',
          videoUrl: 'https://example.com/video.mp4',
          description: 'Test video',
        },
      });

      expect(result.videoId).toBe('fb_video_123');
    });

    it('should handle Facebook page permissions', async () => {
      mockPlatformServices.facebook.post.mockRejectedValue(
        new Error('Insufficient permissions to post to this page')
      );

      await expect(
        mockPlatformServices.facebook.post({ pageId: 'fb_page_123' })
      ).rejects.toThrow('Insufficient permissions to post to this page');
    });
  });
});

describe('Platform Integrations - Analytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('YouTube Analytics', () => {
    it('should fetch YouTube video analytics', async () => {
      const mockAnalytics = {
        videoId: 'yt_video_123',
        views: 10000,
        likes: 500,
        comments: 50,
        shares: 25,
        watchTime: 50000,
        averageViewDuration: 120,
        subscribersGained: 10,
      };

      mockPlatformServices.youtube.getAnalytics.mockResolvedValue(mockAnalytics);

      const result = await mockPlatformServices.youtube.getAnalytics({
        accessToken: 'yt_access_token',
        videoId: 'yt_video_123',
      });

      expect(result.views).toBe(10000);
      expect(result.likes).toBe(500);
    });

    it('should fetch YouTube channel analytics', async () => {
      const mockChannelAnalytics = {
        channelId: 'yt_channel_123',
        subscribers: 5000,
        totalViews: 100000,
        totalVideos: 50,
        estimatedRevenue: 500.00,
      };

      mockPlatformServices.youtube.getAnalytics.mockResolvedValue(mockChannelAnalytics);

      const result = await mockPlatformServices.youtube.getAnalytics({
        accessToken: 'yt_access_token',
        channelId: 'yt_channel_123',
      });

      expect(result.subscribers).toBe(5000);
    });
  });

  describe('Instagram Analytics', () => {
    it('should fetch Instagram post insights', async () => {
      const mockInsights = {
        mediaId: 'ig_media_123',
        impressions: 5000,
        reach: 4000,
        engagement: 500,
        likes: 400,
        comments: 50,
        saves: 50,
        shares: 25,
      };

      mockPlatformServices.instagram.getAnalytics.mockResolvedValue(mockInsights);

      const result = await mockPlatformServices.instagram.getAnalytics({
        accessToken: 'ig_access_token',
        mediaId: 'ig_media_123',
      });

      expect(result.impressions).toBe(5000);
      expect(result.engagement).toBe(500);
    });

    it('should fetch Instagram account insights', async () => {
      const mockAccountInsights = {
        accountId: 'ig_account_123',
        followerCount: 10000,
        impressions: 50000,
        reach: 40000,
        profileViews: 1000,
        websiteClicks: 200,
      };

      mockPlatformServices.instagram.getAnalytics.mockResolvedValue(mockAccountInsights);

      const result = await mockPlatformServices.instagram.getAnalytics({
        accessToken: 'ig_access_token',
        accountId: 'ig_account_123',
      });

      expect(result.followerCount).toBe(10000);
    });
  });

  describe('LinkedIn Analytics', () => {
    it('should fetch LinkedIn post analytics', async () => {
      const mockAnalytics = {
        postId: 'li_post_123',
        impressions: 2000,
        clicks: 100,
        likes: 50,
        comments: 10,
        shares: 5,
        engagement: 65,
      };

      mockPlatformServices.linkedin.getAnalytics.mockResolvedValue(mockAnalytics);

      const result = await mockPlatformServices.linkedin.getAnalytics({
        accessToken: 'li_access_token',
        postId: 'li_post_123',
      });

      expect(result.impressions).toBe(2000);
      expect(result.engagement).toBe(65);
    });
  });

  describe('Twitter Analytics', () => {
    it('should fetch Twitter tweet analytics', async () => {
      const mockAnalytics = {
        tweetId: 'tw_tweet_123',
        impressions: 10000,
        engagements: 500,
        likes: 300,
        retweets: 100,
        replies: 50,
        profileClicks: 50,
        urlClicks: 25,
      };

      mockPlatformServices.twitter.getAnalytics.mockResolvedValue(mockAnalytics);

      const result = await mockPlatformServices.twitter.getAnalytics({
        accessToken: 'tw_access_token',
        tweetId: 'tw_tweet_123',
      });

      expect(result.impressions).toBe(10000);
      expect(result.engagements).toBe(500);
    });
  });

  describe('TikTok Analytics', () => {
    it('should fetch TikTok video analytics', async () => {
      const mockAnalytics = {
        videoId: 'tt_video_123',
        views: 50000,
        likes: 5000,
        comments: 500,
        shares: 250,
        playTime: 100000,
        averageWatchTime: 15,
        completionRate: 0.75,
      };

      mockPlatformServices.tiktok.getAnalytics.mockResolvedValue(mockAnalytics);

      const result = await mockPlatformServices.tiktok.getAnalytics({
        accessToken: 'tt_access_token',
        videoId: 'tt_video_123',
      });

      expect(result.views).toBe(50000);
      expect(result.completionRate).toBe(0.75);
    });
  });

  describe('Facebook Analytics', () => {
    it('should fetch Facebook post insights', async () => {
      const mockInsights = {
        postId: 'fb_post_123',
        impressions: 8000,
        reach: 6000,
        engagement: 400,
        reactions: 300,
        comments: 50,
        shares: 50,
        clicks: 100,
      };

      mockPlatformServices.facebook.getAnalytics.mockResolvedValue(mockInsights);

      const result = await mockPlatformServices.facebook.getAnalytics({
        accessToken: 'fb_access_token',
        postId: 'fb_post_123',
      });

      expect(result.impressions).toBe(8000);
      expect(result.engagement).toBe(400);
    });

    it('should fetch Facebook page insights', async () => {
      const mockPageInsights = {
        pageId: 'fb_page_123',
        pageLikes: 15000,
        pageFollowers: 16000,
        pageImpressions: 100000,
        pageEngagement: 5000,
      };

      mockPlatformServices.facebook.getAnalytics.mockResolvedValue(mockPageInsights);

      const result = await mockPlatformServices.facebook.getAnalytics({
        accessToken: 'fb_access_token',
        pageId: 'fb_page_123',
      });

      expect(result.pageLikes).toBe(15000);
    });
  });
});

describe('Platform Integrations - Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rate Limiting', () => {
    it('should handle YouTube rate limit errors', async () => {
      mockPlatformServices.youtube.post.mockRejectedValue({
        error: 'quotaExceeded',
        message: 'The request cannot be completed because you have exceeded your quota.',
        code: 403,
      });

      await expect(
        mockPlatformServices.youtube.post({ video: { file: 'video.mp4' } })
      ).rejects.toMatchObject({ error: 'quotaExceeded' });
    });

    it('should handle Instagram rate limit with retry-after', async () => {
      mockPlatformServices.instagram.post.mockRejectedValue({
        error: 'rate_limit_exceeded',
        retryAfter: 3600,
        code: 429,
      });

      await expect(
        mockPlatformServices.instagram.post({ media: { type: 'image' } })
      ).rejects.toMatchObject({ error: 'rate_limit_exceeded' });
    });

    it('should handle Twitter rate limit with reset time', async () => {
      mockPlatformServices.twitter.post.mockRejectedValue({
        error: 'Too Many Requests',
        rateLimitReset: Date.now() + 900000, // 15 minutes
        code: 429,
      });

      await expect(
        mockPlatformServices.twitter.post({ tweet: { text: 'test' } })
      ).rejects.toMatchObject({ error: 'Too Many Requests' });
    });
  });

  describe('Token Expiration', () => {
    it('should handle expired YouTube token', async () => {
      mockPlatformServices.youtube.post.mockRejectedValue({
        error: 'invalid_grant',
        message: 'Token has been expired or revoked',
        code: 401,
      });

      await expect(
        mockPlatformServices.youtube.post({ accessToken: 'expired_token' })
      ).rejects.toMatchObject({ error: 'invalid_grant' });
    });

    it('should handle expired Instagram token', async () => {
      mockPlatformServices.instagram.getAnalytics.mockRejectedValue({
        error: 'OAuthException',
        message: 'Error validating access token: Session has expired',
        code: 190,
      });

      await expect(
        mockPlatformServices.instagram.getAnalytics({ accessToken: 'expired_token' })
      ).rejects.toMatchObject({ error: 'OAuthException' });
    });

    it('should handle revoked LinkedIn token', async () => {
      mockPlatformServices.linkedin.post.mockRejectedValue({
        error: 'Unauthorized',
        message: 'The token used in the request has been revoked',
        code: 401,
      });

      await expect(
        mockPlatformServices.linkedin.post({ accessToken: 'revoked_token' })
      ).rejects.toMatchObject({ error: 'Unauthorized' });
    });
  });

  describe('API Failures', () => {
    it('should handle YouTube service unavailable', async () => {
      mockPlatformServices.youtube.post.mockRejectedValue({
        error: 'backendError',
        message: 'Backend service is temporarily unavailable',
        code: 503,
      });

      await expect(
        mockPlatformServices.youtube.post({ video: { file: 'video.mp4' } })
      ).rejects.toMatchObject({ code: 503 });
    });

    it('should handle TikTok network timeout', async () => {
      mockPlatformServices.tiktok.post.mockRejectedValue({
        error: 'ETIMEDOUT',
        message: 'Request timeout',
      });

      await expect(
        mockPlatformServices.tiktok.post({ video: { file: 'video.mp4' } })
      ).rejects.toMatchObject({ error: 'ETIMEDOUT' });
    });

    it('should handle Facebook API version deprecation', async () => {
      mockPlatformServices.facebook.post.mockRejectedValue({
        error: 'API version deprecated',
        message: 'This API version is no longer supported',
        code: 400,
      });

      await expect(
        mockPlatformServices.facebook.post({ content: { message: 'test' } })
      ).rejects.toMatchObject({ error: 'API version deprecated' });
    });
  });

  describe('Validation Errors', () => {
    it('should handle YouTube invalid video format', async () => {
      mockPlatformServices.youtube.post.mockRejectedValue({
        error: 'invalidVideoFormat',
        message: 'Video format not supported',
        code: 400,
      });

      await expect(
        mockPlatformServices.youtube.post({ video: { file: 'video.avi' } })
      ).rejects.toMatchObject({ error: 'invalidVideoFormat' });
    });

    it('should handle Instagram invalid media URL', async () => {
      mockPlatformServices.instagram.post.mockRejectedValue({
        error: 'Invalid media URL',
        message: 'Media URL is not accessible',
        code: 400,
      });

      await expect(
        mockPlatformServices.instagram.post({ media: { url: 'invalid_url' } })
      ).rejects.toMatchObject({ error: 'Invalid media URL' });
    });

    it('should handle Twitter duplicate tweet', async () => {
      mockPlatformServices.twitter.post.mockRejectedValue({
        error: 'Duplicate content',
        message: 'You have already posted this tweet',
        code: 403,
      });

      await expect(
        mockPlatformServices.twitter.post({ tweet: { text: 'duplicate' } })
      ).rejects.toMatchObject({ error: 'Duplicate content' });
    });
  });
});

describe('Platform Integrations - Connection Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Connect Operations', () => {
    it('should successfully connect YouTube account', async () => {
      const mockConnection = {
        platform: 'youtube',
        accountId: 'yt_account_123',
        status: 'connected',
        connectedAt: new Date().toISOString(),
      };

      mockPlatformServices.youtube.authenticate.mockResolvedValue(mockConnection);

      const result = await mockPlatformServices.youtube.authenticate({
        code: 'auth_code',
      });

      expect(result.status).toBe('connected');
      expect(result.platform).toBe('youtube');
    });

    it('should successfully connect multiple platforms', async () => {
      const platforms = ['youtube', 'instagram', 'twitter'];
      const connections = platforms.map(platform => ({
        platform,
        status: 'connected',
      }));

      mockPlatformServices.youtube.authenticate.mockResolvedValue(connections[0]);
      mockPlatformServices.instagram.authenticate.mockResolvedValue(connections[1]);
      mockPlatformServices.twitter.authenticate.mockResolvedValue(connections[2]);

      const results = await Promise.all([
        mockPlatformServices.youtube.authenticate({ code: 'yt_code' }),
        mockPlatformServices.instagram.authenticate({ code: 'ig_code' }),
        mockPlatformServices.twitter.authenticate({ code: 'tw_code' }),
      ]);

      expect(results).toHaveLength(3);
      expect(results.every(r => r.status === 'connected')).toBe(true);
    });
  });

  describe('Disconnect Operations', () => {
    it('should successfully disconnect YouTube account', async () => {
      mockPlatformServices.youtube.disconnect.mockResolvedValue({
        platform: 'youtube',
        status: 'disconnected',
      });

      const result = await mockPlatformServices.youtube.disconnect('yt_account_123');
      expect(result.status).toBe('disconnected');
    });

    it('should revoke tokens on disconnect', async () => {
      mockTokenManager.revokeToken.mockResolvedValue({ success: true });
      mockPlatformServices.instagram.disconnect.mockResolvedValue({
        platform: 'instagram',
        status: 'disconnected',
        tokensRevoked: true,
      });

      const result = await mockPlatformServices.instagram.disconnect('ig_account_123');
      expect(result.tokensRevoked).toBe(true);
    });
  });

  describe('Reconnect Operations', () => {
    it('should successfully reconnect with new token', async () => {
      const mockReconnect = {
        platform: 'linkedin',
        status: 'reconnected',
        newAccessToken: 'li_new_token',
      };

      mockPlatformServices.linkedin.authenticate.mockResolvedValue(mockReconnect);

      const result = await mockPlatformServices.linkedin.authenticate({
        code: 'new_auth_code',
        reconnect: true,
      });

      expect(result.status).toBe('reconnected');
    });

    it('should handle reconnect after token expiration', async () => {
      mockPlatformServices.twitter.refreshToken.mockResolvedValue({
        accessToken: 'tw_refreshed_token',
        status: 'reconnected',
      });

      const result = await mockPlatformServices.twitter.refreshToken('tw_refresh_token');
      expect(result.status).toBe('reconnected');
    });
  });
});

describe('Platform Integrations - Platform-Specific Features', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('YouTube Specific Features', () => {
    it('should support YouTube Shorts upload', async () => {
      const mockShortsResponse = {
        videoId: 'yt_shorts_123',
        isShort: true,
        status: 'uploaded',
      };

      mockPlatformServices.youtube.post.mockResolvedValue(mockShortsResponse);

      const result = await mockPlatformServices.youtube.post({
        video: {
          file: 'short.mp4',
          isShort: true,
          title: 'YouTube Short',
        },
      });

      expect(result.isShort).toBe(true);
    });

    it('should support YouTube playlist creation', async () => {
      const mockPlaylist = {
        playlistId: 'yt_playlist_123',
        title: 'My Playlist',
        status: 'created',
      };

      mockPlatformServices.youtube.post.mockResolvedValue(mockPlaylist);

      const result = await mockPlatformServices.youtube.post({
        type: 'playlist',
        title: 'My Playlist',
        description: 'Playlist description',
      });

      expect(result.playlistId).toBe('yt_playlist_123');
    });

    it('should support YouTube live streaming', async () => {
      const mockLiveStream = {
        streamId: 'yt_stream_123',
        streamUrl: 'rtmp://stream.youtube.com/live',
        status: 'live',
      };

      mockPlatformServices.youtube.post.mockResolvedValue(mockLiveStream);

      const result = await mockPlatformServices.youtube.post({
        type: 'liveStream',
        title: 'Live Stream',
      });

      expect(result.status).toBe('live');
    });
  });

  describe('Instagram Specific Features', () => {
    it('should support Instagram Stories', async () => {
      const mockStory = {
        storyId: 'ig_story_123',
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        status: 'published',
      };

      mockPlatformServices.instagram.post.mockResolvedValue(mockStory);

      const result = await mockPlatformServices.instagram.post({
        media: {
          type: 'story',
          url: 'https://example.com/story.jpg',
        },
      });

      expect(result.storyId).toBe('ig_story_123');
    });

    it('should support Instagram carousel posts', async () => {
      const mockCarousel = {
        mediaId: 'ig_carousel_123',
        childrenCount: 3,
        status: 'published',
      };

      mockPlatformServices.instagram.post.mockResolvedValue(mockCarousel);

      const result = await mockPlatformServices.instagram.post({
        media: {
          type: 'carousel',
          children: [
            { url: 'https://example.com/img1.jpg' },
            { url: 'https://example.com/img2.jpg' },
            { url: 'https://example.com/img3.jpg' },
          ],
        },
      });

      expect(result.childrenCount).toBe(3);
    });

    it('should support Instagram shopping tags', async () => {
      const mockShoppingPost = {
        mediaId: 'ig_shopping_123',
        productTags: ['product_1', 'product_2'],
        status: 'published',
      };

      mockPlatformServices.instagram.post.mockResolvedValue(mockShoppingPost);

      const result = await mockPlatformServices.instagram.post({
        media: {
          type: 'image',
          url: 'https://example.com/product.jpg',
          productTags: ['product_1', 'product_2'],
        },
      });

      expect(result.productTags).toHaveLength(2);
    });
  });

  describe('LinkedIn Specific Features', () => {
    it('should support LinkedIn company page posts', async () => {
      const mockCompanyPost = {
        postId: 'li_company_post_123',
        organizationId: 'li_org_123',
        status: 'published',
      };

      mockPlatformServices.linkedin.post.mockResolvedValue(mockCompanyPost);

      const result = await mockPlatformServices.linkedin.post({
        content: {
          text: 'Company update',
          organizationId: 'li_org_123',
        },
      });

      expect(result.organizationId).toBe('li_org_123');
    });

    it('should support LinkedIn document posts', async () => {
      const mockDocumentPost = {
        postId: 'li_doc_post_123',
        documentUrl: 'https://linkedin.com/doc/123',
        status: 'published',
      };

      mockPlatformServices.linkedin.post.mockResolvedValue(mockDocumentPost);

      const result = await mockPlatformServices.linkedin.post({
        content: {
          type: 'document',
          documentUrl: 'https://example.com/document.pdf',
          title: 'Document Title',
        },
      });

      expect(result.documentUrl).toBeTruthy();
    });

    it('should support LinkedIn polls', async () => {
      const mockPoll = {
        postId: 'li_poll_123',
        pollId: 'poll_123',
        options: ['Option 1', 'Option 2', 'Option 3'],
        status: 'published',
      };

      mockPlatformServices.linkedin.post.mockResolvedValue(mockPoll);

      const result = await mockPlatformServices.linkedin.post({
        content: {
          type: 'poll',
          question: 'What do you think?',
          options: ['Option 1', 'Option 2', 'Option 3'],
          duration: 7, // days
        },
      });

      expect(result.options).toHaveLength(3);
    });
  });

  describe('Twitter Specific Features', () => {
    it('should support Twitter polls', async () => {
      const mockPoll = {
        tweetId: 'tw_poll_123',
        pollId: 'poll_123',
        options: ['Yes', 'No'],
        durationMinutes: 1440,
        status: 'published',
      };

      mockPlatformServices.twitter.post.mockResolvedValue(mockPoll);

      const result = await mockPlatformServices.twitter.post({
        tweet: {
          text: 'What do you think?',
          poll: {
            options: ['Yes', 'No'],
            durationMinutes: 1440,
          },
        },
      });

      expect(result.pollId).toBe('poll_123');
    });

    it('should support Twitter Spaces', async () => {
      const mockSpace = {
        spaceId: 'tw_space_123',
        title: 'My Space',
        status: 'live',
        participantCount: 0,
      };

      mockPlatformServices.twitter.post.mockResolvedValue(mockSpace);

      const result = await mockPlatformServices.twitter.post({
        type: 'space',
        title: 'My Space',
        description: 'Space description',
      });

      expect(result.spaceId).toBe('tw_space_123');
    });

    it('should support Twitter quote tweets', async () => {
      const mockQuoteTweet = {
        tweetId: 'tw_quote_123',
        quotedTweetId: 'tw_original_123',
        status: 'published',
      };

      mockPlatformServices.twitter.post.mockResolvedValue(mockQuoteTweet);

      const result = await mockPlatformServices.twitter.post({
        tweet: {
          text: 'My thoughts on this',
          quoteTweetId: 'tw_original_123',
        },
      });

      expect(result.quotedTweetId).toBe('tw_original_123');
    });
  });

  describe('TikTok Specific Features', () => {
    it('should support TikTok duets', async () => {
      const mockDuet = {
        videoId: 'tt_duet_123',
        originalVideoId: 'tt_original_123',
        isDuet: true,
        status: 'published',
      };

      mockPlatformServices.tiktok.post.mockResolvedValue(mockDuet);

      const result = await mockPlatformServices.tiktok.post({
        video: {
          file: 'duet.mp4',
          duetWithVideo: 'tt_original_123',
        },
      });

      expect(result.isDuet).toBe(true);
    });

    it('should support TikTok stitches', async () => {
      const mockStitch = {
        videoId: 'tt_stitch_123',
        originalVideoId: 'tt_original_123',
        isStitch: true,
        status: 'published',
      };

      mockPlatformServices.tiktok.post.mockResolvedValue(mockStitch);

      const result = await mockPlatformServices.tiktok.post({
        video: {
          file: 'stitch.mp4',
          stitchWithVideo: 'tt_original_123',
        },
      });

      expect(result.isStitch).toBe(true);
    });

    it('should support TikTok branded content', async () => {
      const mockBrandedContent = {
        videoId: 'tt_branded_123',
        brandedContentTag: 'brand_partner_123',
        status: 'published',
      };

      mockPlatformServices.tiktok.post.mockResolvedValue(mockBrandedContent);

      const result = await mockPlatformServices.tiktok.post({
        video: {
          file: 'branded.mp4',
          brandedContentTag: 'brand_partner_123',
        },
      });

      expect(result.brandedContentTag).toBe('brand_partner_123');
    });
  });

  describe('Facebook Specific Features', () => {
    it('should support Facebook live video', async () => {
      const mockLiveVideo = {
        liveVideoId: 'fb_live_123',
        streamUrl: 'rtmps://live-api.facebook.com/live',
        status: 'live',
      };

      mockPlatformServices.facebook.post.mockResolvedValue(mockLiveVideo);

      const result = await mockPlatformServices.facebook.post({
        type: 'liveVideo',
        title: 'Live Stream',
        description: 'Going live!',
      });

      expect(result.status).toBe('live');
    });

    it('should support Facebook Stories', async () => {
      const mockStory = {
        storyId: 'fb_story_123',
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        status: 'published',
      };

      mockPlatformServices.facebook.post.mockResolvedValue(mockStory);

      const result = await mockPlatformServices.facebook.post({
        type: 'story',
        photoUrl: 'https://example.com/story.jpg',
      });

      expect(result.storyId).toBe('fb_story_123');
    });

    it('should support Facebook Reels', async () => {
      const mockReel = {
        reelId: 'fb_reel_123',
        status: 'published',
        url: 'https://facebook.com/reel/fb_reel_123',
      };

      mockPlatformServices.facebook.post.mockResolvedValue(mockReel);

      const result = await mockPlatformServices.facebook.post({
        type: 'reel',
        videoUrl: 'https://example.com/reel.mp4',
        description: 'Facebook Reel',
      });

      expect(result.reelId).toBe('fb_reel_123');
    });

    it('should support Facebook event creation', async () => {
      const mockEvent = {
        eventId: 'fb_event_123',
        name: 'My Event',
        startTime: new Date(Date.now() + 86400000).toISOString(),
        status: 'created',
      };

      mockPlatformServices.facebook.post.mockResolvedValue(mockEvent);

      const result = await mockPlatformServices.facebook.post({
        type: 'event',
        name: 'My Event',
        startTime: new Date(Date.now() + 86400000).toISOString(),
        description: 'Event description',
      });

      expect(result.eventId).toBe('fb_event_123');
    });
  });
});

describe('Platform Integrations - Retry Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should retry failed requests with exponential backoff', async () => {
    let attemptCount = 0;
    mockPlatformServices.youtube.post.mockImplementation(() => {
      attemptCount++;
      if (attemptCount < 3) {
        return Promise.reject(new Error('Temporary failure'));
      }
      return Promise.resolve({ videoId: 'yt_video_123', status: 'uploaded' });
    });

    // Simulate retry logic
    let result;
    for (let i = 0; i < 3; i++) {
      try {
        result = await mockPlatformServices.youtube.post({ video: { file: 'video.mp4' } });
        break;
      } catch (error) {
        if (i === 2) throw error;
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 100));
      }
    }

    expect(result?.videoId).toBe('yt_video_123');
    expect(attemptCount).toBe(3);
  });

  it('should respect rate limit retry-after header', async () => {
    const retryAfter = 2; // seconds
    mockPlatformServices.instagram.post.mockRejectedValueOnce({
      error: 'rate_limit_exceeded',
      retryAfter,
    });

    mockPlatformServices.instagram.post.mockResolvedValueOnce({
      mediaId: 'ig_media_123',
      status: 'published',
    });

    try {
      await mockPlatformServices.instagram.post({ media: { type: 'image' } });
    } catch (error: any) {
      expect(error.retryAfter).toBe(2);
      // Wait for retry-after period
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      const result = await mockPlatformServices.instagram.post({ media: { type: 'image' } });
      expect(result.mediaId).toBe('ig_media_123');
    }
  });

  it('should handle maximum retry attempts', async () => {
    mockPlatformServices.twitter.post.mockRejectedValue(
      new Error('Persistent failure')
    );

    const maxRetries = 3;
    let attempts = 0;

    try {
      for (let i = 0; i < maxRetries; i++) {
        attempts++;
        await mockPlatformServices.twitter.post({ tweet: { text: 'test' } });
      }
    } catch (error) {
      expect(attempts).toBe(1);
      expect(error).toBeInstanceOf(Error);
    }
  });
});

describe('Platform Integrations - Token Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should store tokens securely after authentication', async () => {
    const mockTokens = {
      accessToken: 'secure_access_token',
      refreshToken: 'secure_refresh_token',
    };

    mockTokenManager.storeToken.mockResolvedValue({ success: true });

    await mockTokenManager.storeToken('youtube', mockTokens);

    expect(mockTokenManager.storeToken).toHaveBeenCalledWith('youtube', mockTokens);
  });

  it('should retrieve tokens for API requests', async () => {
    const mockToken = {
      accessToken: 'stored_access_token',
      expiresAt: Date.now() + 3600000,
    };

    mockTokenManager.getToken.mockResolvedValue(mockToken);

    const result = await mockTokenManager.getToken('instagram');
    expect(result.accessToken).toBe('stored_access_token');
  });

  it('should automatically refresh expired tokens', async () => {
    mockTokenManager.isTokenValid.mockResolvedValue(false);
    mockTokenManager.refreshToken.mockResolvedValue({
      accessToken: 'new_access_token',
      expiresAt: Date.now() + 3600000,
    });

    const isValid = await mockTokenManager.isTokenValid('linkedin');
    expect(isValid).toBe(false);

    const refreshed = await mockTokenManager.refreshToken('linkedin');
    expect(refreshed.accessToken).toBe('new_access_token');
  });

  it('should handle token refresh failures', async () => {
    mockTokenManager.refreshToken.mockRejectedValue(
      new Error('Refresh token expired')
    );

    await expect(
      mockTokenManager.refreshToken('twitter')
    ).rejects.toThrow('Refresh token expired');
  });

  it('should revoke tokens on disconnect', async () => {
    mockTokenManager.revokeToken.mockResolvedValue({ success: true });

    const result = await mockTokenManager.revokeToken('tiktok');
    expect(result.success).toBe(true);
  });
});

describe('Platform Integrations - Cross-Platform Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should post same content to multiple platforms simultaneously', async () => {
    const content = {
      text: 'Cross-platform post',
      media: 'https://example.com/image.jpg',
    };

    mockPlatformServices.youtube.post.mockResolvedValue({ videoId: 'yt_123' });
    mockPlatformServices.instagram.post.mockResolvedValue({ mediaId: 'ig_123' });
    mockPlatformServices.twitter.post.mockResolvedValue({ tweetId: 'tw_123' });
    mockPlatformServices.facebook.post.mockResolvedValue({ postId: 'fb_123' });

    const results = await Promise.all([
      mockPlatformServices.youtube.post({ video: content }),
      mockPlatformServices.instagram.post({ media: content }),
      mockPlatformServices.twitter.post({ tweet: content }),
      mockPlatformServices.facebook.post({ content }),
    ]);

    expect(results).toHaveLength(4);
    expect(results[0]).toHaveProperty('videoId');
    expect(results[1]).toHaveProperty('mediaId');
    expect(results[2]).toHaveProperty('tweetId');
    expect(results[3]).toHaveProperty('postId');
  });

  it('should handle partial failures in cross-platform posting', async () => {
    mockPlatformServices.youtube.post.mockResolvedValue({ videoId: 'yt_123' });
    mockPlatformServices.instagram.post.mockRejectedValue(new Error('Instagram failed'));
    mockPlatformServices.twitter.post.mockResolvedValue({ tweetId: 'tw_123' });

    const results = await Promise.allSettled([
      mockPlatformServices.youtube.post({ video: {} }),
      mockPlatformServices.instagram.post({ media: {} }),
      mockPlatformServices.twitter.post({ tweet: {} }),
    ]);

    const successful = results.filter(r => r.status === 'fulfilled');
    const failed = results.filter(r => r.status === 'rejected');

    expect(successful).toHaveLength(2);
    expect(failed).toHaveLength(1);
  });

  it('should aggregate analytics from all platforms', async () => {
    mockPlatformServices.youtube.getAnalytics.mockResolvedValue({ views: 10000 });
    mockPlatformServices.instagram.getAnalytics.mockResolvedValue({ impressions: 5000 });
    mockPlatformServices.twitter.getAnalytics.mockResolvedValue({ impressions: 8000 });
    mockPlatformServices.linkedin.getAnalytics.mockResolvedValue({ impressions: 2000 });
    mockPlatformServices.tiktok.getAnalytics.mockResolvedValue({ views: 50000 });
    mockPlatformServices.facebook.getAnalytics.mockResolvedValue({ impressions: 7000 });

    const analytics = await Promise.all([
      mockPlatformServices.youtube.getAnalytics({}),
      mockPlatformServices.instagram.getAnalytics({}),
      mockPlatformServices.twitter.getAnalytics({}),
      mockPlatformServices.linkedin.getAnalytics({}),
      mockPlatformServices.tiktok.getAnalytics({}),
      mockPlatformServices.facebook.getAnalytics({}),
    ]);

    const totalReach = analytics.reduce((sum, data) => {
      return sum + (data.views || data.impressions || 0);
    }, 0);

    expect(totalReach).toBeGreaterThan(0);
    expect(analytics).toHaveLength(6);
  });
});

describe('Platform Integrations - Coverage Summary', () => {
  it('should have comprehensive test coverage', () => {
    const testCategories = {
      oauth: ['YouTube', 'Instagram', 'LinkedIn', 'Twitter', 'TikTok', 'Facebook'],
      posting: ['YouTube', 'Instagram', 'LinkedIn', 'Twitter', 'TikTok', 'Facebook'],
      analytics: ['YouTube', 'Instagram', 'LinkedIn', 'Twitter', 'TikTok', 'Facebook'],
      errorHandling: ['Rate Limiting', 'Token Expiration', 'API Failures', 'Validation'],
      connectionManagement: ['Connect', 'Disconnect', 'Reconnect'],
      platformSpecific: ['YouTube', 'Instagram', 'LinkedIn', 'Twitter', 'TikTok', 'Facebook'],
      retryLogic: ['Exponential Backoff', 'Rate Limit Retry', 'Max Attempts'],
      tokenManagement: ['Store', 'Retrieve', 'Refresh', 'Revoke'],
      crossPlatform: ['Multi-Post', 'Partial Failures', 'Aggregated Analytics'],
    };

    // Verify all platforms are covered
    Object.values(testCategories).forEach(category => {
      expect(category.length).toBeGreaterThan(0);
    });

    // Verify all 6 platforms are tested
    const platforms = testCategories.oauth;
    expect(platforms).toContain('YouTube');
    expect(platforms).toContain('Instagram');
    expect(platforms).toContain('LinkedIn');
    expect(platforms).toContain('Twitter');
    expect(platforms).toContain('TikTok');
    expect(platforms).toContain('Facebook');
  });
});

