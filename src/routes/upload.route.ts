import { Router, Request, Response } from 'express';
import multer from 'multer';
import { S3Service } from '../services/s3.service';
import { asyncHandler } from '../middleware/asyncHandler.middleware';
import { ValidationError, AWSError } from '../types/errors';
import { videoURLProcessor } from '../services/video-url-processor.service';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } });
const s3Service = new S3Service();

// Sanitize filename to prevent path traversal and special characters
const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars with underscore
    .replace(/\.{2,}/g, '.') // Replace multiple dots with single dot
    .replace(/^\.+/, '') // Remove leading dots
    .substring(0, 255); // Limit length
};

router.post('/', upload.single('file'), asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ValidationError('No file uploaded');
  }

  const { originalname, mimetype, buffer, size } = req.file;
  const userId = req.body.userId || 'anonymous';
  const sanitizedFilename = sanitizeFilename(originalname);
  const key = `${userId}/${Date.now()}-${sanitizedFilename}`;

  try {
    const result = await s3Service.upload(buffer, key, mimetype);

    res.json({
      success: true,
      fileId: result.key,
      fileName: sanitizedFilename,
      mimeType: mimetype,
      size,
      userId,
      url: result.url,
      uploadedAt: new Date().toISOString()
    });
  } catch (error: any) {
    throw new AWSError(error.message || 'Upload failed', 'S3');
  }
}));

// Process YouTube or any supported Video URL
router.post('/youtube', asyncHandler(async (req: Request, res: Response) => {
  const { url } = req.body;
  const userId = req.body.userId || 'anonymous';

  if (!url) {
    throw new ValidationError('Video URL is required');
  }

  try {
    // Note: processFromURL currently simulates extraction for the demo to return quickly
    const result = await videoURLProcessor.processFromURL(url, userId);

    res.json({
      success: true,
      fileId: result.videoId,
      metadata: result.metadata,
      domain: result.domain,
      status: 'processing',
      type: 'url'
    });
  } catch (error: any) {
    throw new AWSError(error.message || 'Failed to process video URL', 'Video URL Processor');
  }
}));

export default router;
