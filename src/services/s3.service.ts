import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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
      throw new Error('Invalid file extension');
    }
    if (key.includes('..') || key.includes('//')) {
      throw new Error('Invalid file path');
    }
  }

  async upload(file: Buffer, key: string, mimeType: string): Promise<S3UploadResult> {
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
  }

  async getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    this.validateKey(key);

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.client, command, { expiresIn });
  }

  async delete(key: string): Promise<void> {
    this.validateKey(key);

    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.client.send(command);
  }

  async listByPrefix(prefix: string): Promise<string[]> {
    if (prefix.includes('..')) {
      throw new Error('Invalid prefix');
    }

    const command = new ListObjectsV2Command({
      Bucket: this.bucket,
      Prefix: prefix,
      MaxKeys: 1000,
    });

    const response = await this.client.send(command);
    return response.Contents?.map(obj => obj.Key!).filter(Boolean) || [];
  }
}
