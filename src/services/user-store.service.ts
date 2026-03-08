/**
 * S3-backed user store.
 * Each user is stored as a JSON object at:
 *   s3://<bucket>/users/<email-slug>.json   (primary – keyed by email)
 *   s3://<bucket>/users/by-id/<userId>.ref  (index – maps userId → email slug)
 *
 * An in-memory cache prevents redundant S3 calls within the same process lifetime.
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { hasS3Config, awsConfig } from '../config/aws';
import { logger } from '../utils/logger';

// Users bucket is in us-east-1 regardless of main AWS_REGION
const USER_BUCKET_REGION = 'us-east-1';

const getUserS3Client = (): S3Client =>
  new S3Client({
    region: USER_BUCKET_REGION,
    credentials:
      awsConfig.accessKeyId && awsConfig.secretAccessKey
        ? { accessKeyId: awsConfig.accessKeyId, secretAccessKey: awsConfig.secretAccessKey }
        : undefined,
  });

export interface UserRecord {
  userId: string;
  name: string;
  email: string;
  hashedPassword: string;
  domain?: string;
  audienceType?: string;
  creatorMode?: string;
  createdAt: string;
  updatedAt?: string;
}

// Normalise an email address into a safe S3 key segment
const emailToSlug = (email: string): string =>
  email.toLowerCase().trim().replace(/[^a-z0-9._-]/g, '_');

const userKey = (email: string): string => `users/${emailToSlug(email)}.json`;
const userIdRefKey = (userId: string): string => `users/by-id/${userId}.ref`;

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

async function s3Put(key: string, body: string, contentType = 'application/json'): Promise<void> {
  const client = getUserS3Client();
  await client.send(
    new PutObjectCommand({
      Bucket: awsConfig.s3BucketName!,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
}

async function s3Get(key: string): Promise<string | null> {
  try {
    const client = getUserS3Client();
    const res = await client.send(
      new GetObjectCommand({ Bucket: awsConfig.s3BucketName!, Key: key })
    );
    return await res.Body!.transformToString();
  } catch (err: any) {
    if (err?.name === 'NoSuchKey' || err?.$metadata?.httpStatusCode === 404) {
      return null;
    }
    throw err;
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// UserStore class
// ──────────────────────────────────────────────────────────────────────────────

class UserStore {
  // In-memory cache: email → UserRecord
  private cache = new Map<string, UserRecord>();

  private useS3(): boolean {
    return hasS3Config();
  }

  // ---------- write ----------

  async save(user: UserRecord): Promise<void> {
    const key = user.email.toLowerCase().trim();
    this.cache.set(key, user);

    if (!this.useS3()) {
      logger.warn('S3 not configured – user stored in memory only', { userId: user.userId });
      return;
    }

    try {
      const json = JSON.stringify(user);
      await Promise.all([
        s3Put(userKey(user.email), json),
        // Store reverse index so we can look up email from userId
        s3Put(userIdRefKey(user.userId), emailToSlug(user.email), 'text/plain'),
      ]);
      logger.info('User saved to S3', { userId: user.userId, email: user.email });
    } catch (err) {
      logger.error('Failed to save user to S3 – user exists in memory cache only', {
        userId: user.userId,
        err,
      });
    }
  }

  // ---------- read by email ----------

  async getByEmail(email: string): Promise<UserRecord | null> {
    const key = email.toLowerCase().trim();

    // Cache hit
    if (this.cache.has(key)) return this.cache.get(key)!;

    if (!this.useS3()) return null;

    try {
      const raw = await s3Get(userKey(email));
      if (!raw) return null;
      const user = JSON.parse(raw) as UserRecord;
      this.cache.set(key, user);
      return user;
    } catch (err) {
      logger.error('Failed to fetch user from S3 by email', { email, err });
      return null;
    }
  }

  // ---------- read by userId ----------

  async getById(userId: string): Promise<UserRecord | null> {
    // Check cache first
    for (const u of this.cache.values()) {
      if (u.userId === userId) return u;
    }

    if (!this.useS3()) return null;

    try {
      // Fetch the reverse-index ref to get the email slug
      const slug = await s3Get(userIdRefKey(userId));
      if (!slug) return null;

      // Re-construct the email key from the slug
      const raw = await s3Get(`users/${slug}.json`);
      if (!raw) return null;

      const user = JSON.parse(raw) as UserRecord;
      this.cache.set(user.email.toLowerCase().trim(), user);
      return user;
    } catch (err) {
      logger.error('Failed to fetch user from S3 by userId', { userId, err });
      return null;
    }
  }

  // ---------- exists ----------

  async existsByEmail(email: string): Promise<boolean> {
    return (await this.getByEmail(email)) !== null;
  }

  // ---------- update partial fields ----------

  async update(userId: string, patch: Partial<UserRecord>): Promise<UserRecord | null> {
    const user = await this.getById(userId);
    if (!user) return null;

    const updated: UserRecord = {
      ...user,
      ...patch,
      userId: user.userId, // never overwrite identity
      email: user.email,
      hashedPassword: user.hashedPassword,
      updatedAt: new Date().toISOString(),
    };

    await this.save(updated);
    return updated;
  }
}

// Singleton
export const userStore = new UserStore();
