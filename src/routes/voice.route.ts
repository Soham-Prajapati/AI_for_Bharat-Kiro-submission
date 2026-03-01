import { Router, Request, Response } from 'express';
import multer from 'multer';
import { asyncHandler } from '../middleware/asyncHandler.middleware';
import { ValidationError } from '../types/errors';
import { S3Service } from '../services/s3.service';
import { voiceCloneService } from '../services/voice-clone.service';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });
const s3Service = new S3Service();

// POST /api/voice/train - Train voice model
router.post('/train', upload.array('samples', 10), asyncHandler(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  const { userId } = req.body;

  if (!files || files.length < 3) {
    throw new ValidationError('At least 3 voice samples required');
  }

  if (!userId) {
    throw new ValidationError('userId is required');
  }

  // Upload samples to S3
  const uploadedSamples = [];
  for (const file of files) {
    const key = `voice-models/${userId}/samples/${Date.now()}-${file.originalname}`;
    const result = await s3Service.upload(file.buffer, key, file.mimetype);
    uploadedSamples.push(result.url);
  }

  // Uses the actual voice clone service
  const trainingResult = await voiceCloneService.trainVoice({
    userId,
    name: `Voice-${Date.now()}`,
    audioSamples: uploadedSamples
  });

  res.json({
    success: true,
    modelId: trainingResult.voiceId,
    samplesUploaded: uploadedSamples.length,
    status: trainingResult.status,
    estimatedTime: '5-10 minutes',
    estimatedCompletion: trainingResult.estimatedCompletion,
    message: 'Voice model training started'
  });
}));

// POST /api/voice/generate - Generate audio with cloned voice
router.post('/generate', asyncHandler(async (req: Request, res: Response) => {
  const { modelId, text } = req.body;

  if (!modelId) {
    throw new ValidationError('modelId is required');
  }

  if (!text || text.length === 0) {
    throw new ValidationError('text is required');
  }

  if (text.length > 5000) {
    throw new ValidationError('text must be less than 5000 characters');
  }

  // Uses the actual voice clone service
  const generationResult = await voiceCloneService.generateSpeech({
    voiceId: modelId,
    text
  });

  res.json({
    success: true,
    audioUrl: generationResult.audioUrl,
    duration: generationResult.duration,
    status: 'completed',
    message: 'Audio generated'
  });
}));

export default router;
