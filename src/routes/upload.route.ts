import { Router, Request, Response } from 'express';
import multer from 'multer';
import { S3Service } from '../services/s3.service';
import { asyncHandler } from '../middleware/asyncHandler.middleware';
import { ValidationError, AWSError } from '../types/errors';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } });
const s3Service = new S3Service();

router.post('/', upload.single('file'), asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ValidationError('No file uploaded');
  }

  const { originalname, mimetype, buffer, size } = req.file;
  const userId = req.body.userId || 'anonymous';
  const key = `${userId}/${Date.now()}-${originalname}`;

  try {
    const result = await s3Service.upload(buffer, key, mimetype);

    res.json({
      success: true,
      fileId: result.key,
      fileName: originalname,
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

export default router;
