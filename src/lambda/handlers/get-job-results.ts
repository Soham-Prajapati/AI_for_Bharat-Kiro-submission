import { processingPipeline } from '../../services/processing-pipeline.service';
import { logger } from '../../utils/logger';
import { LambdaEvent, LambdaResponse, jsonResponse } from '../utils/http';

/**
 * Lambda handler: Retrieve processing job status and results.
 * jobId can be supplied via pathParameters.jobId or queryStringParameters.jobId
 */
export const handler = async (event: LambdaEvent): Promise<LambdaResponse> => {
  try {
    const jobId = event.pathParameters?.jobId || event.queryStringParameters?.jobId;

    if (!jobId) {
      return jsonResponse(400, {
        success: false,
        message: 'jobId is required',
      });
    }

    const job = await processingPipeline.getJob(jobId);
    if (!job) {
      return jsonResponse(404, {
        success: false,
        message: 'Job not found',
      });
    }

    const results = await processingPipeline.getResults(jobId);

    return jsonResponse(200, {
      success: true,
      job,
      results,
    });
  } catch (error: any) {
    logger.error('Lambda get-job-results failed', { error: error?.message || String(error) });
    return jsonResponse(500, {
      success: false,
      message: error?.message || 'Failed to retrieve job results',
    });
  }
};
