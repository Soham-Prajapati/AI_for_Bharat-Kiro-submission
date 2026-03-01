import { Router, Request, Response } from 'express';
import multer from 'multer';
import { asyncHandler } from '../middleware/asyncHandler.middleware';
import { ValidationError } from '../types/errors';
import { S3Service } from '../services/s3.service';
import { watermarkService } from '../services/watermark.service';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } });
const s3Service = new S3Service();

// POST /api/watermark/add - Add watermark to media
router.post('/add', upload.single('file'), asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ValidationError('No file uploaded');
  }

  const { position = 'bottom-right', opacity = 0.7, logoUrl } = req.body;

  if (!logoUrl) {
    throw new ValidationError('logoUrl is required');
  }

  // Upload original to S3
  const key = `watermarked/${Date.now()}-${req.file.originalname}`;
  await s3Service.upload(req.file.buffer, key, req.file.mimetype);

  // Uses the actual watermark service
  const watermarkResult = await watermarkService.applyWatermark({
    mediaUrl: `https://s3.amazonaws.com/${key}`, // Using a mock URL format based on the uploaded key
    mediaType: req.file.mimetype.startsWith('video') ? 'video' : 'image', // Basic type inference
    watermarkType: 'visible',
    visibleOptions: {
      logoUrl,
      position: position as any,
      opacity: Number(opacity),
      size: 'medium'
    }
  }, 'default-user'); // Hardcoded user ID since there is no auth middleware yet

  res.json({
    success: true,
    watermarkedUrl: watermarkResult.watermarkedUrl,
    position,
    opacity,
    message: 'Watermark added'
  });
}));

export default router;
