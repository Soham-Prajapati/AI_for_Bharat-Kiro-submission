import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { AWSError, ValidationError } from '../types/errors';
import { awsConfig, getS3Client, hasS3Config, toCloudFrontUrl, toS3HttpUrl } from '../config/aws';

export interface S3UploadResult {
  key: string;
  bucket: string;
  s3Url: string;
  cdnUrl: string;
  url: string;
  size: number;
}

const ALLOWED_EXTENSIONS = ['.mp4', '.mov', '.avi', '.mp3', '.wav', '.txt', '.json'];
const ALLOWED_MIME_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/webm',
  'audio/mpeg',
  'audio/wav',
  'audio/x-m4a',
  'text/plain',
  'application/json',
];

export class S3Service {
  private client: S3Client | null;

  constructor() {
    this.client = null;
  }

  private getBucketName(): string {
    const bucket = awsConfig.s3BucketName;
    if (!bucket) {
      throw new ValidationError('S3 bucket is not configured. Set S3_BUCKET_NAME in your .env file.');
    }
    return bucket;
  }

  private getClient(): S3Client {
    if (this.client) {
      return this.client;
    }

    if (!hasS3Config()) {
      throw new ValidationError(
        'AWS S3 is not configured. Set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, and S3_BUCKET_NAME in .env.'
      );
    }

    this.client = getS3Client();

    return this.client;
  }

  private buildUploadKey(originalName: string, prefix: string = 'uploads'): string {
    const safeName = originalName
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/\.{2,}/g, '.')
      .replace(/^\.+/, '')
      .substring(0, 255);

    return `${prefix}/${Date.now()}-${randomUUID().slice(0, 8)}-${safeName}`;
  }

  private validateKey(key: string, mimeType?: string): void {
    const ext = key.substring(key.lastIndexOf('.'));
    const normalizedExt = ext.toLowerCase();
    const normalizedMimeType = (mimeType || '').toLowerCase();

    const hasAllowedExtension = ALLOWED_EXTENSIONS.includes(normalizedExt)
      || ['.m4a', '.webm'].includes(normalizedExt);
    const hasAllowedMimeType = normalizedMimeType.length > 0 && ALLOWED_MIME_TYPES.includes(normalizedMimeType);

    if (!hasAllowedExtension && !hasAllowedMimeType) {
      throw new ValidationError('Invalid file extension or MIME type');
    }
    if (key.includes('..') || key.includes('//')) {
      throw new ValidationError('Invalid file path');
    }
  }

  async upload(file: Buffer, key: string, mimeType: string): Promise<S3UploadResult> {
    try {
      this.validateKey(key, mimeType);
      const client = this.getClient();
      const bucket = this.getBucketName();

      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: file,
        ContentType: mimeType,
        ServerSideEncryption: 'AES256',
      });

      await client.send(command);

      const s3Url = toS3HttpUrl(key);
      const cdnUrl = toCloudFrontUrl(key);

      return {
        key,
        bucket,
        s3Url,
        cdnUrl,
        url: cdnUrl,
        size: file.length,
      };
    } catch (error: any) {
      if (error instanceof ValidationError) throw error;
      throw new AWSError(error.message || 'Upload failed', 'S3', error.code);
    }
  }

  async getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      this.validateKey(key);
      const client = this.getClient();
      const bucket = this.getBucketName();

      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      return await getSignedUrl(client, command, { expiresIn });
    } catch (error: any) {
      if (error instanceof ValidationError) throw error;
      throw new AWSError(error.message || 'Failed to generate presigned URL', 'S3', error.code);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      this.validateKey(key);
      const client = this.getClient();
      const bucket = this.getBucketName();

      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      await client.send(command);
    } catch (error: any) {
      if (error instanceof ValidationError) throw error;
      throw new AWSError(error.message || 'Delete failed', 'S3', error.code);
    }
  }

  async listByPrefix(prefix: string): Promise<string[]> {
    try {
      if (prefix.includes('..')) {
        throw new ValidationError('Invalid prefix');
      }
      const client = this.getClient();
      const bucket = this.getBucketName();

      const command = new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        MaxKeys: 1000,
      });

      const response = await client.send(command);
      return response.Contents?.map(obj => obj.Key!).filter(Boolean) || [];
    } catch (error: any) {
      if (error instanceof ValidationError) throw error;
      throw new AWSError(error.message || 'List failed', 'S3', error.code);
    }
  }

  async uploadMedia(file: Buffer, originalName: string, mimeType: string, prefix: string = 'uploads'): Promise<S3UploadResult> {
    const key = this.buildUploadKey(originalName, prefix);
    return this.upload(file, key, mimeType);
  }
}

// Reusable helper for one-off uploads from routes/services/scripts.
// It uses AWS credentials and S3 bucket settings only from environment variables.
export const uploadFileToS3 = async (file: Buffer, key: string, mimeType: string): Promise<S3UploadResult> => {
  const s3Service = new S3Service();
  return s3Service.upload(file, key, mimeType);
};
