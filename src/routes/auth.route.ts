import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../middleware/asyncHandler.middleware';
import { ValidationError, AuthenticationError } from '../types/errors';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret';

// Generate access token (24h expiry)
const generateAccessToken = (userId: string, email: string) => {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '24h' });
};

// Generate refresh token (7d expiry)
const generateRefreshToken = (userId: string) => {
  return jwt.sign({ userId, type: 'refresh' }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

/**
 * POST /api/auth/register
 * Register new user
 */
router.post('/register', asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    throw new ValidationError('email, password, and name required');
  }

  // TODO: Integrate with AWS Cognito or bcrypt password hashing
  const userId = `user-${Date.now()}`;
  const accessToken = generateAccessToken(userId, email);
  const refreshToken = generateRefreshToken(userId);

  res.json({
    success: true,
    userId,
    email,
    name,
    accessToken,
    refreshToken,
    expiresIn: 86400, // 24 hours in seconds
    createdAt: new Date().toISOString()
  });
}));

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ValidationError('email and password required');
  }

  // TODO: Verify with AWS Cognito or bcrypt
  const userId = `user-${Date.now()}`;
  const accessToken = generateAccessToken(userId, email);
  const refreshToken = generateRefreshToken(userId);

  res.json({
    success: true,
    userId,
    email,
    accessToken,
    refreshToken,
    expiresIn: 86400,
    loginAt: new Date().toISOString()
  });
}));

/**
 * POST /api/auth/verify
 * Verify JWT token
 */
router.post('/verify', asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    throw new ValidationError('token required');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    res.json({
      valid: true,
      userId: decoded.userId,
      email: decoded.email
    });
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new AuthenticationError('Token expired');
    }
    throw new AuthenticationError('Invalid token');
  }
}));

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
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

    // TODO: Get user email from database
    const email = 'user@example.com';
    const newAccessToken = generateAccessToken(decoded.userId, email);

    res.json({
      success: true,
      accessToken: newAccessToken,
      expiresIn: 86400
    });
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new AuthenticationError('Refresh token expired');
    }
    throw new AuthenticationError('Invalid refresh token');
  }
}));

export default router;
