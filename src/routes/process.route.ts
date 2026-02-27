import { Router, Request, Response } from 'express';
import { transcribeService } from '../services/transcription.service';
import { S3Service } from '../services/s3.service';
import { asyncHandler } from '../middleware/asyncHandler.middleware';
import { ValidationError, AWSError } from '../types/errors';

const router = Router();
const s3Service = new S3Service();

router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const { fileId, contentType } = req.body;

  if (!fileId) {
    throw new ValidationError('fileId required');
  }

  try {
    const fileUri = await s3Service.getPresignedUrl(fileId);
    const jobName = `transcribe-${Date.now()}`;
    
    await transcribeService.startTranscription(fileUri, jobName);

    res.json({
      success: true,
      jobId: jobName,
      fileId,
      status: 'processing',
      startedAt: new Date().toISOString()
    });
  } catch (error: any) {
    throw new AWSError(error.message || 'Processing failed', 'Transcribe');
  }
}));

router.get('/:jobId', asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = req.params;

  if (!jobId) {
    throw new ValidationError('jobId required');
  }

  try {
    const result = await transcribeService.getTranscriptionStatus(jobId);

    res.json({
      jobId,
      status: result.status,
      transcript: result.transcript,
      completedAt: new Date().toISOString()
    });
  } catch (error: any) {
    throw new AWSError(error.message || 'Status check failed', 'Transcribe');
  }
}));

export default router;
