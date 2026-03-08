import * as dotenv from 'dotenv';
import * as fs from 'fs/promises';
import * as path from 'path';
import { uploadFileToS3 } from '../services/s3.service';

dotenv.config();

/**
 * Example: Upload a local file to S3 using environment-based AWS configuration.
 *
 * Required .env values:
 * - AWS_ACCESS_KEY_ID
 * - AWS_SECRET_ACCESS_KEY
 * - AWS_REGION
 * - S3_BUCKET_NAME
 *
 * Usage:
 *   npx ts-node src/examples/s3-upload.example.ts ./uploads/sample.mp4
 */
async function runS3UploadExample(): Promise<void> {
  const localFilePath = process.argv[2];

  if (!localFilePath) {
    throw new Error('Provide a file path: npx ts-node src/examples/s3-upload.example.ts <file-path>');
  }

  const fileBuffer = await fs.readFile(localFilePath);
  const fileName = path.basename(localFilePath);
  const key = `example-uploads/${Date.now()}-${fileName}`;

  const uploadResult = await uploadFileToS3(fileBuffer, key, 'application/octet-stream');

  console.log('✅ S3 upload successful');
  console.log('Bucket:', uploadResult.bucket);
  console.log('Key:', uploadResult.key);
  console.log('URL:', uploadResult.url);
}

runS3UploadExample().catch((error) => {
  console.error('❌ S3 upload example failed:', error.message);
  process.exit(1);
});
