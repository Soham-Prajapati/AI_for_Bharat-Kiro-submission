/**
 * Mock Upload Route (No AWS Required)
 * Use this for development/demo when AWS S3 is not configured
 */

import { Router, Request, Response } from 'express';
import multer from 'multer';
import { asyncHandler } from '../middleware/asyncHandler.middleware';
import { ValidationError } from '../types/errors';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();
const upload = multer({ 
  storage: multer.memoryStorage(), 
  limits: { fileSize: 100 * 1024 * 1024 } 
});

// Sanitize filename
const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .replace(/^\.+/, '')
    .substring(0, 255);
};

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

router.post('/', upload.single('file'), asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ValidationError('No file uploaded');
  }

  const { originalname, mimetype, buffer, size } = req.file;
  const userId = req.body.userId || 'anonymous';
  const sanitizedFilename = sanitizeFilename(originalname);
  const key = `${userId}/${Date.now()}-${sanitizedFilename}`;
  
  // Save file locally (optional - for demo purposes)
  const userDir = path.join(uploadsDir, userId);
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
  }
  
  const filePath = path.join(userDir, `${Date.now()}-${sanitizedFilename}`);
  fs.writeFileSync(filePath, buffer);

  // Return mock response (same format as S3 upload)
  res.json({
    success: true,
    fileId: key,
    fileName: sanitizedFilename,
    mimeType: mimetype,
    size,
    userId,
    url: `http://localhost:3001/uploads/${key}`,
    uploadedAt: new Date().toISOString(),
    localPath: filePath, // For debugging
    note: 'Using mock upload (no AWS S3)'
  });
}));

// Mock YouTube URL processing
router.post('/youtube', asyncHandler(async (req: Request, res: Response) => {
  const { url } = req.body;
  const userId = req.body.userId || 'anonymous';

  if (!url) {
    throw new ValidationError('Video URL is required');
  }

  // Mock response
  res.json({
    success: true,
    fileId: `youtube-${Date.now()}`,
    metadata: {
      title: 'Mock YouTube Video',
      duration: 180,
      thumbnail: 'https://via.placeholder.com/640x360'
    },
    domain: 'youtube.com',
    status: 'processing',
    type: 'url',
    note: 'Using mock YouTube processor (no real API calls)'
  });
}));

export default router;
