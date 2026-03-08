/**
 * Social OAuth Route
 * Handles OAuth 2.0 flows for Instagram, LinkedIn, and Twitter/X
 * GET  /api/social-oauth/auth-url?platform=instagram|linkedin|twitter&userId=xxx
 * GET  /api/social-oauth/callback/:platform?code=xxx&state=userId
 * GET  /api/social-oauth/stats/:platform/:userId
 * DELETE /api/social-oauth/disconnect/:platform/:userId
 */
import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.middleware';
import axios from 'axios';

const router = Router();

// In-memory token + stats store (keyed by platform:userId)
const tokenStore: Record<string, {
  accessToken: string;
  refreshToken?: string;
  userId: string;
  platform: string;
  connectedAt: string;
}> = {};

const statsCache: Record<string, {
  data: any;
  fetchedAt: string;
}> = {};

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// ─── Platform configs ────────────────────────────────────────────────────────

function getConfig(platform: string) {
  switch (platform) {
    case 'instagram':
      return {
        clientId:     process.env.META_APP_ID || '',
        clientSecret: process.env.META_APP_SECRET || '',
        redirectUri:  process.env.META_REDIRECT_URI || `http://localhost:3001/api/social-oauth/callback/instagram`,
        authUrl:      'https://www.facebook.com/v19.0/dialog/oauth',
        tokenUrl:     'https://graph.facebook.com/v19.0/oauth/access_token',
        scope:        'instagram_basic,instagram_manage_insights,pages_show_list,pages_read_engagement',
        configured:   !!(process.env.META_APP_ID && process.env.META_APP_SECRET),
      };
    case 'linkedin':
      return {
        clientId:     process.env.LINKEDIN_CLIENT_ID || '',
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
        redirectUri:  process.env.LINKEDIN_REDIRECT_URI || `http://localhost:3001/api/social-oauth/callback/linkedin`,
        authUrl:      'https://www.linkedin.com/oauth/v2/authorization',
        tokenUrl:     'https://www.linkedin.com/oauth/v2/accessToken',
        scope:        'r_liteprofile r_emailaddress r_organization_social',
        configured:   !!(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET),
      };
    case 'twitter':
      return {
        clientId:     process.env.TWITTER_CLIENT_ID || '',
        clientSecret: process.env.TWITTER_CLIENT_SECRET || '',
        redirectUri:  process.env.TWITTER_REDIRECT_URI || `http://localhost:3001/api/social-oauth/callback/twitter`,
        authUrl:      'https://twitter.com/i/oauth2/authorize',
        tokenUrl:     'https://api.twitter.com/2/oauth2/token',
        scope:        'tweet.read users.read offline.access',
        configured:   !!(process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET),
      };
    default:
      return null;
  }
}

// ─── GET /api/social-oauth/auth-url?platform=xxx&userId=xxx ─────────────────

router.get('/auth-url', asyncHandler(async (req: Request, res: Response) => {
  const { platform, userId } = req.query as { platform: string; userId: string };
  if (!platform || !userId) return res.status(400).json({ error: 'platform and userId required' });

  const cfg = getConfig(platform);
  if (!cfg) return res.status(400).json({ error: `Unknown platform: ${platform}` });

  if (!cfg.configured) {
    const setupInstructions: Record<string, any> = {
      instagram: {
        vars: ['META_APP_ID', 'META_APP_SECRET', 'META_REDIRECT_URI'],
        steps: [
          '1. Go to developers.facebook.com → Create App → Consumer type',
          '2. Add "Instagram Basic Display" and "Instagram Graph API" products',
          '3. Set redirect URI to: http://localhost:3001/api/social-oauth/callback/instagram',
          '4. Your account must be a Business or Creator Instagram account',
          '5. Link your Instagram account to a Facebook Page',
        ],
      },
      linkedin: {
        vars: ['LINKEDIN_CLIENT_ID', 'LINKEDIN_CLIENT_SECRET', 'LINKEDIN_REDIRECT_URI'],
        steps: [
          '1. Go to linkedin.com/developers → Create App',
          '2. Request access to: r_liteprofile, r_emailaddress, r_organization_social',
          '3. Set redirect URI to: http://localhost:3001/api/social-oauth/callback/linkedin',
          '4. Wait for LinkedIn to approve the scopes (can take 1-2 days)',
        ],
      },
      twitter: {
        vars: ['TWITTER_CLIENT_ID', 'TWITTER_CLIENT_SECRET', 'TWITTER_REDIRECT_URI'],
        steps: [
          '1. Go to developer.twitter.com → Projects → Create App',
          '2. Enable OAuth 2.0 in App Settings',
          '3. Set redirect URI to: http://localhost:3001/api/social-oauth/callback/twitter',
          '4. Free tier works for basic profile + tweet stats',
        ],
      },
    };

    return res.json({
      configured: false,
      platform,
      setup: setupInstructions[platform],
    });
  }

  // Build auth URL
  const state = `${userId}:${Date.now()}`;
  const params = new URLSearchParams({
    client_id: cfg.clientId,
    redirect_uri: cfg.redirectUri,
    response_type: 'code',
    scope: cfg.scope,
    state,
  });

  // Twitter requires PKCE — generate code challenge
  if (platform === 'twitter') {
    // Simple PKCE: use state as code_verifier (for demo; production should use crypto)
    const codeVerifier = Buffer.from(`${userId}-${Date.now()}`).toString('base64url');
    params.set('code_challenge', codeVerifier);
    params.set('code_challenge_method', 'plain');
    // Store verifier temporarily
    tokenStore[`pkce:${userId}`] = {
      accessToken: codeVerifier,
      userId,
      platform: 'twitter_pkce',
      connectedAt: new Date().toISOString(),
    };
  }

  res.json({ url: `${cfg.authUrl}?${params}`, configured: true, platform });
}));

// ─── GET /api/social-oauth/callback/:platform ────────────────────────────────

router.get('/callback/:platform', asyncHandler(async (req: Request, res: Response) => {
  const { platform } = req.params;
  const { code, state, error } = req.query as Record<string, string>;

  if (error) {
    return res.redirect(`${FRONTEND_URL}/connect-accounts?${platform}=denied`);
  }

  const userId = state?.split(':')[0];
  if (!code || !userId) {
    return res.redirect(`${FRONTEND_URL}/connect-accounts?${platform}=error`);
  }

  const cfg = getConfig(platform);
  if (!cfg) return res.redirect(`${FRONTEND_URL}/connect-accounts?${platform}=error`);

  try {
    let accessToken = '';
    let refreshToken = '';

    if (platform === 'twitter') {
      const codeVerifier = tokenStore[`pkce:${userId}`]?.accessToken || '';
      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: cfg.redirectUri,
        code_verifier: codeVerifier,
        client_id: cfg.clientId,
      });
      const tokenRes = await axios.post(cfg.tokenUrl, body.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${cfg.clientId}:${cfg.clientSecret}`).toString('base64')}`,
        },
      });
      accessToken = tokenRes.data.access_token;
      refreshToken = tokenRes.data.refresh_token || '';
    } else {
      // Instagram and LinkedIn use standard code exchange
      const tokenRes = await axios.get(cfg.tokenUrl, {
        params: {
          client_id: cfg.clientId,
          client_secret: cfg.clientSecret,
          redirect_uri: cfg.redirectUri,
          code,
          grant_type: 'authorization_code',
        },
      });
      accessToken = tokenRes.data.access_token;
      refreshToken = tokenRes.data.refresh_token || '';
    }

    tokenStore[`${platform}:${userId}`] = {
      accessToken,
      refreshToken,
      userId,
      platform,
      connectedAt: new Date().toISOString(),
    };

    res.redirect(`${FRONTEND_URL}/connect-accounts?${platform}=connected`);
  } catch (err: any) {
    console.error(`${platform} OAuth callback error:`, err?.response?.data || err?.message);
    res.redirect(`${FRONTEND_URL}/connect-accounts?${platform}=error`);
  }
}));

// ─── GET /api/social-oauth/stats/:platform/:userId ───────────────────────────

router.get('/stats/:platform/:userId', asyncHandler(async (req: Request, res: Response) => {
  const { platform, userId } = req.params;
  const stored = tokenStore[`${platform}:${userId}`];

  if (!stored) return res.json({ connected: false, stats: null });

  // Return cached stats if fresh (< 15 min)
  const cacheKey = `${platform}:${userId}`;
  const cached = statsCache[cacheKey];
  if (cached) {
    const ageMs = Date.now() - new Date(cached.fetchedAt).getTime();
    if (ageMs < 15 * 60 * 1000) {
      return res.json({ connected: true, cached: true, fetchedAt: cached.fetchedAt, ...cached.data });
    }
  }

  try {
    let stats: any = {};
    const token = stored.accessToken;

    if (platform === 'instagram') {
      // Get Facebook pages first, then linked Instagram business account
      const pagesRes = await axios.get('https://graph.facebook.com/v19.0/me/accounts', {
        params: { access_token: token, fields: 'id,name,instagram_business_account' },
      });

      const page = pagesRes.data.data?.find((p: any) => p.instagram_business_account);
      if (!page?.instagram_business_account?.id) {
        return res.json({
          connected: true,
          stats: null,
          error: 'No Instagram Business account linked to your Facebook page. Convert your Instagram to a Business/Creator account first.',
        });
      }

      const igId = page.instagram_business_account.id;

      // Fetch Instagram profile + insights
      const profileRes = await axios.get(`https://graph.facebook.com/v19.0/${igId}`, {
        params: {
          access_token: token,
          fields: 'username,followers_count,media_count,profile_picture_url,biography',
        },
      });

      // Fetch insights (reach, impressions for last 30 days)
      let insights: any = {};
      try {
        const insightsRes = await axios.get(`https://graph.facebook.com/v19.0/${igId}/insights`, {
          params: {
            access_token: token,
            metric: 'reach,impressions,profile_views',
            period: 'day',
            since: Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000),
            until: Math.floor(Date.now() / 1000),
          },
        });
        const insightData = insightsRes.data.data || [];
        for (const m of insightData) {
          const total = (m.values || []).reduce((s: number, v: any) => s + (v.value || 0), 0);
          insights[m.name] = total;
        }
      } catch {}

      // Fetch recent media
      let recentMedia: any[] = [];
      try {
        const mediaRes = await axios.get(`https://graph.facebook.com/v19.0/${igId}/media`, {
          params: {
            access_token: token,
            fields: 'id,caption,like_count,comments_count,timestamp,thumbnail_url,media_url,permalink',
            limit: 5,
          },
        });
        recentMedia = mediaRes.data.data || [];
      } catch {}

      const profile = profileRes.data;
      stats = {
        platform: 'instagram',
        username: profile.username,
        profilePicture: profile.profile_picture_url,
        followers: profile.followers_count,
        mediaCount: profile.media_count,
        reach30d: insights.reach || 0,
        impressions30d: insights.impressions || 0,
        profileViews30d: insights.profile_views || 0,
        recentPosts: recentMedia.map((m: any) => ({
          id: m.id,
          caption: m.caption?.substring(0, 80),
          likes: m.like_count,
          comments: m.comments_count,
          timestamp: m.timestamp,
          url: m.permalink,
        })),
      };
    }

    else if (platform === 'linkedin') {
      // Get profile
      const profileRes = await axios.get('https://api.linkedin.com/v2/me', {
        headers: { Authorization: `Bearer ${token}` },
        params: { projection: '(id,localizedFirstName,localizedLastName,profilePicture(displayImage~:playableStreams))' },
      });

      // Get follower stats (requires r_organization_social or use personal network size)
      let followerCount = 0;
      try {
        const networkRes = await axios.get('https://api.linkedin.com/v2/networkSizes/urn:li:person:' + profileRes.data.id, {
          headers: { Authorization: `Bearer ${token}` },
          params: { edgeType: 'CompanyFollowedByMember' },
        });
        followerCount = networkRes.data.firstDegreeSize || 0;
      } catch {}

      const profile = profileRes.data;
      const thumb = profile.profilePicture?.['displayImage~']?.elements?.[0]?.identifiers?.[0]?.identifier;

      stats = {
        platform: 'linkedin',
        name: `${profile.localizedFirstName} ${profile.localizedLastName}`,
        profileId: profile.id,
        profilePicture: thumb || null,
        connections: followerCount,
        note: 'Full post analytics require LinkedIn Marketing API partner access.',
      };
    }

    else if (platform === 'twitter') {
      // Get user profile
      const meRes = await axios.get('https://api.twitter.com/2/users/me', {
        headers: { Authorization: `Bearer ${token}` },
        params: { 'user.fields': 'public_metrics,profile_image_url,description,username' },
      });

      const user = meRes.data.data;
      const metrics = user.public_metrics || {};

      // Get recent tweets with engagement
      let recentTweets: any[] = [];
      try {
        const tweetsRes = await axios.get(`https://api.twitter.com/2/users/${user.id}/tweets`, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            max_results: 10,
            'tweet.fields': 'public_metrics,created_at',
          },
        });
        recentTweets = (tweetsRes.data.data || []).map((t: any) => ({
          id: t.id,
          text: t.text?.substring(0, 100),
          likes: t.public_metrics?.like_count || 0,
          retweets: t.public_metrics?.retweet_count || 0,
          replies: t.public_metrics?.reply_count || 0,
          impressions: t.public_metrics?.impression_count || 0,
          createdAt: t.created_at,
        }));
      } catch {}

      stats = {
        platform: 'twitter',
        username: user.username,
        name: user.name,
        profilePicture: user.profile_image_url,
        followers: metrics.followers_count || 0,
        following: metrics.following_count || 0,
        tweets: metrics.tweet_count || 0,
        recentTweets,
      };
    }

    statsCache[cacheKey] = { data: stats, fetchedAt: new Date().toISOString() };
    res.json({ connected: true, cached: false, fetchedAt: new Date().toISOString(), ...stats });

  } catch (err: any) {
    console.error(`${platform} stats error:`, err?.response?.data || err?.message);
    const status = err?.response?.status;
    if (status === 401) delete tokenStore[`${platform}:${userId}`];
    res.json({ connected: false, stats: null, error: status === 401 ? 'Token expired — please reconnect' : 'Failed to fetch stats' });
  }
}));

// ─── DELETE /api/social-oauth/disconnect/:platform/:userId ───────────────────

router.delete('/disconnect/:platform/:userId', asyncHandler(async (req: Request, res: Response) => {
  const { platform, userId } = req.params;
  delete tokenStore[`${platform}:${userId}`];
  delete statsCache[`${platform}:${userId}`];
  res.json({ success: true });
}));

// ─── GET /api/social-oauth/status/:userId ────────────────────────────────────
// Returns which platforms are connected for a user

router.get('/status/:userId', asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const platforms = ['instagram', 'linkedin', 'twitter'];
  const status: Record<string, boolean> = {};
  for (const p of platforms) {
    status[p] = !!tokenStore[`${p}:${userId}`];
  }
  res.json({ status });
}));

export default router;
