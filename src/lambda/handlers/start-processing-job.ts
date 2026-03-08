import { processingPipeline } from '../../services/processing-pipeline.service';
import { processingJobProcessorService } from '../../services/processing-job-processor.service';
import { logger } from '../../utils/logger';
import { LambdaEvent, LambdaResponse, jsonResponse, parseJsonBody } from '../utils/http';

interface StartProcessingRequest {
  fileId: string;
  fileName?: string;
  mimeType?: string;
  userId?: string;
  platforms?: string[];
  localPath?: string;
  url?: string;
}

/**
 * Lambda handler: starts a processing job and executes the shared job processor.
 * This reuses the same AWS-backed pipeline logic used by the SQS worker.
 */
export const handler = async (event: LambdaEvent): Promise<LambdaResponse> => {
  try {
    const body = parseJsonBody<StartProcessingRequest>(event);

    if (!body.fileId) {
      return jsonResponse(400, { success: false, message: 'fileId is required' });
    }

    const userId = body.userId || 'anonymous';
    const job = await processingPipeline.createJob(body.fileId, userId);

    await processingJobProcessorService.processJob({
      jobId: job.jobId,
      fileId: body.fileId,
      fileName: body.fileName,
      mimeType: body.mimeType,
      userId,
      platforms: body.platforms,
      localPath: body.localPath,
      url: body.url,
    });

    const results = await processingPipeline.getResults(job.jobId);

    return jsonResponse(200, {
      success: true,
      jobId: job.jobId,
      status: 'completed',
      results,
    });
  } catch (error: any) {
    logger.error('Lambda start-processing-job failed', { error: error?.message || String(error) });
    return jsonResponse(500, {
      success: false,
      message: error?.message || 'Failed to start processing job',
    });
  }
};
