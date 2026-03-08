import { S3Service } from '../../services/s3.service';
import { logger } from '../../utils/logger';
import { LambdaEvent, LambdaResponse, jsonResponse, parseJsonBody } from '../utils/http';

interface UploadMediaRequest {
  userId?: string;
  fileName: string;
  mimeType: string;
  fileBase64: string;
}

const s3Service = new S3Service();

/**
 * Lambda handler: Upload media to S3 and return CloudFront delivery URL.
 * Expected API Gateway JSON body:
 * {
 *   "userId": "u_123",
 *   "fileName": "video.mp4",
 *   "mimeType": "video/mp4",
 *   "fileBase64": "..."
 * }
 */
export const handler = async (event: LambdaEvent): Promise<LambdaResponse> => {
  try {
    const body = parseJsonBody<UploadMediaRequest>(event);

    if (!body.fileName || !body.mimeType || !body.fileBase64) {
      return jsonResponse(400, {
        success: false,
        message: 'fileName, mimeType, and fileBase64 are required',
      });
    }

    const userId = body.userId || 'anonymous';
    const fileBuffer = Buffer.from(body.fileBase64, 'base64');

    const uploadResult = await s3Service.uploadMedia(
      fileBuffer,
      body.fileName,
      body.mimeType,
      `uploads/${userId}`
    );

    return jsonResponse(200, {
      success: true,
      fileId: uploadResult.key,
      fileName: body.fileName,
      mimeType: body.mimeType,
      size: fileBuffer.length,
      userId,
      url: uploadResult.cdnUrl,
      cdnUrl: uploadResult.cdnUrl,
      s3Url: uploadResult.s3Url,
      uploadedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('Lambda upload-media failed', { error: error?.message || String(error) });
    return jsonResponse(500, {
      success: false,
      message: error?.message || 'Upload failed',
    });
  }
};
