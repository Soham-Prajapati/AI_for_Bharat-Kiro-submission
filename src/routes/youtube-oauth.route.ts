import { Router, Request, Response } from 'express';
import { google } from 'googleapis';
import { asyncHandler } from '../middleware/asyncHandler.middleware';

const router = Router();

// In-memory store for connected YouTube accounts (keyed by userId)
// In production this would be stored in DynamoDB
const youtubeTokenStore: Record<string, {
  accessToken: string;
  refreshToken: string;
  channelId: string;
  channelName: string;
  channelThumb: string;
  connectedAt: string;
}> = {};

// In-memory store for manually entered platform stats
const manualStatsStore: Record<string, Record<string, {
  platform: string;
  username: string;
  followers: number;
  totalViews: number;
  avgEngagement: number;
  postsPerMonth: number;
  updatedAt: string;
}>> = {};

function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID || '',
    process.env.GOOGLE_CLIENT_SECRET || '',
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/youtube-oauth/callback'
  );
}

// GET /api/youtube-oauth/auth-url?userId=xxx
// Returns the Google OAuth URL to redirect user to
router.get('/auth-url', asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return res.status(503).json({
      error: 'YouTube OAuth not configured',
      message: 'Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI in .env',
      configured: false,
    });
  }

  const oauth2Client = getOAuthClient();
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/yt-analytics.readonly',
    ],
    state: userId as string,
    prompt: 'consent',
  });

  res.json({ url, configured: true });
}));

// GET /api/youtube-oauth/callback?code=xxx&state=userId
// Google redirects here after user grants permission
router.get('/callback', asyncHandler(async (req: Request, res: Response) => {
  const { code, state: userId, error } = req.query;

  if (error) {
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/analytics?youtube=denied`);
  }

  if (!code || !userId) {
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/analytics?youtube=error`);
  }

  try {
    const oauth2Client = getOAuthClient();
    const { tokens } = await oauth2Client.getToken(code as string);
    oauth2Client.setCredentials(tokens);

    // Fetch channel info
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    const channelRes = await youtube.channels.list({
      part: ['snippet', 'statistics'],
      mine: true,
    });

    const channel = channelRes.data.items?.[0];
    if (!channel) throw new Error('No channel found');

    youtubeTokenStore[userId as string] = {
      accessToken: tokens.access_token || '',
      refreshToken: tokens.refresh_token || '',
      channelId: channel.id || '',
      channelName: channel.snippet?.title || '',
      channelThumb: channel.snippet?.thumbnails?.default?.url || '',
      connectedAt: new Date().toISOString(),
    };

    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/analytics?youtube=connected`);
  } catch (err) {
    console.error('YouTube OAuth callback error:', err);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/analytics?youtube=error`);
  }
}));

// GET /api/youtube-oauth/stats/:userId
// Returns real YouTube channel stats for the connected user
router.get('/stats/:userId', asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const stored = youtubeTokenStore[userId];

  if (!stored) {
    return res.json({ connected: false, stats: null });
  }

  try {
    const oauth2Client = getOAuthClient();
    oauth2Client.setCredentials({
      access_token: stored.accessToken,
      refresh_token: stored.refreshToken,
    });

    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    // Fetch channel statistics
    const channelRes = await youtube.channels.list({
      part: ['statistics', 'snippet'],
      id: [stored.channelId],
    });

    const channel = channelRes.data.items?.[0];
    const stats = channel?.statistics;

    // Fetch recent 10 videos
    const videosRes = await youtube.search.list({
      part: ['id', 'snippet'],
      channelId: stored.channelId,
      order: 'date',
      maxResults: 10,
      type: ['video'],
    });

    const videoIds = (videosRes.data.items || [])
      .map(v => v.id?.videoId)
      .filter(Boolean) as string[];

    let totalVideoViews = 0;
    let totalLikes = 0;

    if (videoIds.length > 0) {
      const videoStats = await youtube.videos.list({
        part: ['statistics'],
        id: videoIds,
      });

      for (const v of videoStats.data.items || []) {
        totalVideoViews += parseInt(v.statistics?.viewCount || '0');
        totalLikes += parseInt(v.statistics?.likeCount || '0');
      }
    }

    const subscriberCount = parseInt(stats?.subscriberCount || '0');
    const totalViews = parseInt(stats?.viewCount || '0');
    const videoCount = parseInt(stats?.videoCount || '0');
    const avgEngagement = totalVideoViews > 0 ? ((totalLikes / totalVideoViews) * 100).toFixed(1) : '0';

    res.json({
      connected: true,
      channelName: stored.channelName,
      channelThumb: stored.channelThumb,
      channelId: stored.channelId,
      connectedAt: stored.connectedAt,
      stats: {
        subscribers: subscriberCount,
        totalViews,
        videoCount,
        recentViews: totalVideoViews,
        avgEngagement: parseFloat(avgEngagement),
        recentVideos: videosRes.data.items?.slice(0, 5).map(v => ({
          id: v.id?.videoId,
          title: v.snippet?.title,
          thumb: v.snippet?.thumbnails?.default?.url,
          publishedAt: v.snippet?.publishedAt,
        })) || [],
      },
    });
  } catch (err: any) {
    console.error('YouTube stats fetch error:', err?.message);
    // Token may be expired — clear connection
    if (err?.code === 401) delete youtubeTokenStore[userId];
    res.json({ connected: false, stats: null, error: 'Token expired — please reconnect' });
  }
}));

// DELETE /api/youtube-oauth/disconnect/:userId
router.delete('/disconnect/:userId', asyncHandler(async (req: Request, res: Response) => {
  delete youtubeTokenStore[req.params.userId];
  res.json({ success: true });
}));

// POST /api/youtube-oauth/manual-stats
// Save manually entered stats for non-OAuth platforms
router.post('/manual-stats', asyncHandler(async (req: Request, res: Response) => {
  const { userId, platform, username, followers, totalViews, avgEngagement, postsPerMonth } = req.body;

  if (!userId || !platform) {
    return res.status(400).json({ error: 'userId and platform required' });
  }

  if (!manualStatsStore[userId]) manualStatsStore[userId] = {};

  manualStatsStore[userId][platform] = {
    platform,
    username: username || '',
    followers: parseInt(followers) || 0,
    totalViews: parseInt(totalViews) || 0,
    avgEngagement: parseFloat(avgEngagement) || 0,
    postsPerMonth: parseInt(postsPerMonth) || 0,
    updatedAt: new Date().toISOString(),
  };

  res.json({ success: true, saved: manualStatsStore[userId][platform] });
}));

// GET /api/youtube-oauth/manual-stats/:userId
router.get('/manual-stats/:userId', asyncHandler(async (req: Request, res: Response) => {
  const stats = manualStatsStore[req.params.userId] || {};
  res.json({ stats });
}));

export default router;
