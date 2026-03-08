import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { asyncHandler } from '../middleware/asyncHandler.middleware';
import { ValidationError, AuthenticationError } from '../types/errors';
import { userStore } from '../services/user-store.service';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret';
const BCRYPT_ROUNDS = 10;

// ============================================================================
// Token helpers
// ============================================================================

const generateAccessToken = (userId: string, email: string) =>
  jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '24h' });

const generateRefreshToken = (userId: string) =>
  jwt.sign({ userId, type: 'refresh' }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

const buildUserProfile = (user: { userId: string; name: string; email: string; domain?: string; audienceType?: string; creatorMode?: string; createdAt: string }) => ({
  userId: user.userId,
  name: user.name,
  email: user.email,
  domain: user.domain || null,
  audienceType: user.audienceType || null,
  creatorMode: user.creatorMode || null,
  createdAt: user.createdAt,
});

// ============================================================================
// POST /api/auth/register
// ============================================================================
router.post('/register', asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    throw new ValidationError('email, password, and name are required');
  }

  if (password.length < 6) {
    throw new ValidationError('Password must be at least 6 characters');
  }

  const emailKey = email.toLowerCase().trim();

  if (await userStore.existsByEmail(emailKey)) {
    throw new ValidationError('An account with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const userId = `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const newUser = {
    userId,
    name: name.trim(),
    email: emailKey,
    hashedPassword,
    createdAt: new Date().toISOString(),
  };

  await userStore.save(newUser);

  const accessToken = generateAccessToken(userId, emailKey);
  const refreshToken = generateRefreshToken(userId);

  res.status(201).json({
    success: true,
    token: accessToken,
    accessToken,
    refreshToken,
    expiresIn: 86400,
    ...buildUserProfile(newUser),
  });
}));

// ============================================================================
// POST /api/auth/login
// ============================================================================
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ValidationError('email and password are required');
  }

  const emailKey = email.toLowerCase().trim();
  const user = await userStore.getByEmail(emailKey);

  if (!user) {
    throw new AuthenticationError('Invalid email or password');
  }

  const passwordValid = await bcrypt.compare(password, user.hashedPassword);
  if (!passwordValid) {
    throw new AuthenticationError('Invalid email or password');
  }

  const accessToken = generateAccessToken(user.userId, emailKey);
  const refreshToken = generateRefreshToken(user.userId);

  res.json({
    success: true,
    token: accessToken,
    accessToken,
    refreshToken,
    expiresIn: 86400,
    loginAt: new Date().toISOString(),
    ...buildUserProfile(user),
  });
}));

// ============================================================================
// PATCH /api/auth/profile
// Save onboarding choices (domain, audienceType, creatorMode)
// ============================================================================
router.patch('/profile', asyncHandler(async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthenticationError('Authorization token required');
  }

  let decoded: any;
  try {
    decoded = jwt.verify(authHeader.slice(7), JWT_SECRET);
  } catch {
    throw new AuthenticationError('Invalid or expired token');
  }

  const { domain, audienceType, creatorMode, name } = req.body;

  const updated = await userStore.update(decoded.userId, {
    ...(domain !== undefined && { domain }),
    ...(audienceType !== undefined && { audienceType }),
    ...(creatorMode !== undefined && { creatorMode }),
    ...(name !== undefined && { name: name.trim() }),
  });

  if (!updated) {
    throw new AuthenticationError('User not found');
  }

  res.json({ success: true, ...buildUserProfile(updated) });
}));

// ============================================================================
// GET /api/auth/me
// ============================================================================
router.get('/me', asyncHandler(async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthenticationError('Authorization token required');
  }

  let decoded: any;
  try {
    decoded = jwt.verify(authHeader.slice(7), JWT_SECRET);
  } catch {
    throw new AuthenticationError('Invalid or expired token');
  }

  const user = await userStore.getById(decoded.userId);

  if (!user) {
    throw new AuthenticationError('User not found');
  }

  res.json({ success: true, ...buildUserProfile(user) });
}));

// ============================================================================
// POST /api/auth/verify
// ============================================================================
router.post('/verify', asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    throw new ValidationError('token required');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    res.json({ valid: true, userId: decoded.userId, email: decoded.email });
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new AuthenticationError('Token expired');
    }
    throw new AuthenticationError('Invalid token');
  }
}));

// ============================================================================
// POST /api/auth/refresh
// ============================================================================
router.post('/refresh', asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new ValidationError('refreshToken required');
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any;

    if (decoded.type !== 'refresh') {
      throw new AuthenticationError('Invalid refresh token');
    }

    const user = await userStore.getById(decoded.userId);
    const email = user?.email || decoded.userId;
    const newAccessToken = generateAccessToken(decoded.userId, email);

    res.json({
      success: true,
      token: newAccessToken,
      accessToken: newAccessToken,
      expiresIn: 86400,
    });
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new AuthenticationError('Refresh token expired');
    }
    throw new AuthenticationError('Invalid refresh token');
  }
}));

// ============================================================================
// POST /api/auth/reset-demo
// Clears onboarding data so the user goes through the full flow again.
// Used for demo recording.
// ============================================================================
router.post('/reset-demo', asyncHandler(async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthenticationError('Authorization token required');
  }

  let decoded: any;
  try {
    decoded = jwt.verify(authHeader.slice(7), JWT_SECRET);
  } catch {
    throw new AuthenticationError('Invalid or expired token');
  }

  await userStore.update(decoded.userId, {
    domain: null as any,
    audienceType: null as any,
    creatorMode: null as any,
  });

  res.json({ success: true, message: 'Demo reset — onboarding cleared' });
}));

export default router;
