import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { AWSError, ValidationError } from '../types/errors';

export interface S3UploadResult {
  key: string;
  bucket: string;
  url: string;
  size: number;
}

const ALLOWED_EXTENSIONS = ['.mp4', '.mov', '.avi', '.mp3', '.wav', '.txt', '.json'];

export class S3Service {
  private client: S3Client;
  private bucket: string;

  constructor(region: string = process.env.AWS_REGION || 'us-east-1', bucket: string = process.env.S3_BUCKET || 'content-intelligence-uploads') {
    this.client = new S3Client({ region });
    this.bucket = bucket;
  }

  private validateKey(key: string): void {
    const ext = key.substring(key.lastIndexOf('.'));
    if (!ALLOWED_EXTENSIONS.includes(ext.toLowerCase())) {
      throw new ValidationError('Invalid file extension');
    }
    if (key.includes('..') || key.includes('//')) {
      throw new ValidationError('Invalid file path');
    }
  }

  async upload(file: Buffer, key: string, mimeType: string): Promise<S3UploadResult> {
    try {
      this.validateKey(key);

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file,
        ContentType: mimeType,
        ServerSideEncryption: 'AES256',
      });

      await this.client.send(command);

      return {
        key,
        bucket: this.bucket,
        url: `https://${this.bucket}.s3.amazonaws.com/${key}`,
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

      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      return await getSignedUrl(this.client, command, { expiresIn });
    } catch (error: any) {
      if (error instanceof ValidationError) throw error;
      throw new AWSError(error.message || 'Failed to generate presigned URL', 'S3', error.code);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      this.validateKey(key);

      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.client.send(command);
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

      const command = new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: prefix,
        MaxKeys: 1000,
      });

      const response = await this.client.send(command);
      return response.Contents?.map(obj => obj.Key!).filter(Boolean) || [];
    } catch (error: any) {
      if (error instanceof ValidationError) throw error;
      throw new AWSError(error.message || 'List failed', 'S3', error.code);
    }
  }
}
