import { Router, Request, Response } from 'express';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { asyncHandler } from '../middleware/asyncHandler.middleware';
import { awsConfig } from '../config/aws';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

const DRAFTS_BUCKET = 'ai-bharat-file-storage-us';
const DRAFTS_REGION = 'us-east-1';

const getDraftsS3Client = (): S3Client =>
  new S3Client({
    region: DRAFTS_REGION,
    credentials:
      awsConfig.accessKeyId && awsConfig.secretAccessKey
        ? { accessKeyId: awsConfig.accessKeyId, secretAccessKey: awsConfig.secretAccessKey }
        : undefined,
  });

async function s3Put(key: string, body: string): Promise<void> {
  const client = getDraftsS3Client();
  await client.send(
    new PutObjectCommand({
      Bucket: DRAFTS_BUCKET,
      Key: key,
      Body: body,
      ContentType: 'application/json',
    })
  );
}

async function s3Get(key: string): Promise<string | null> {
  try {
    const client = getDraftsS3Client();
    const res = await client.send(
      new GetObjectCommand({ Bucket: DRAFTS_BUCKET, Key: key })
    );
    return await res.Body!.transformToString();
  } catch (err: any) {
    if (err?.name === 'NoSuchKey' || err?.$metadata?.httpStatusCode === 404) {
      return null;
    }
    throw err;
  }
}

async function s3Delete(key: string): Promise<void> {
  const client = getDraftsS3Client();
  await client.send(
    new DeleteObjectCommand({ Bucket: DRAFTS_BUCKET, Key: key })
  );
}

export interface DraftMeta {
  draftId: string;
  name: string;
  iterationNumber: number;
  platforms: string[];
  createdAt: string;
  domain?: string;
}

export interface DraftContent extends DraftMeta {
  userId: string;
  platformsContent: Record<string, string>;
  transcript?: string;
  improvements?: string[];
}

const indexKey = (userId: string): string => `drafts/${userId}/index.json`;
const draftKey = (userId: string, draftId: string): string => `drafts/${userId}/${draftId}.json`;

async function getIndex(userId: string): Promise<DraftMeta[]> {
  const raw = await s3Get(indexKey(userId));
  if (!raw) return [];
  return JSON.parse(raw) as DraftMeta[];
}

async function saveIndex(userId: string, drafts: DraftMeta[]): Promise<void> {
  await s3Put(indexKey(userId), JSON.stringify(drafts));
}

// POST /api/drafts/save
router.post('/save', asyncHandler(async (req: Request, res: Response) => {
  const {
    userId,
    name,
    iterationNumber,
    platforms,
    transcript,
    domain,
    improvements,
  } = req.body as {
    userId: string;
    name: string;
    iterationNumber: number;
    platforms: Record<string, string>;
    transcript?: string;
    domain?: string;
    improvements?: string[];
  };

  if (!userId || !name || iterationNumber === undefined || !platforms) {
    res.status(400).json({ success: false, error: 'userId, name, iterationNumber, and platforms are required' });
    return;
  }

  const draftId = uuidv4();
  const createdAt = new Date().toISOString();

  const meta: DraftMeta = {
    draftId,
    name,
    iterationNumber,
    platforms: Object.keys(platforms),
    createdAt,
    domain,
  };

  const content: DraftContent = {
    ...meta,
    userId,
    platformsContent: platforms,
    transcript,
    improvements,
  };

  const index = await getIndex(userId);
  index.unshift(meta);

  await Promise.all([
    s3Put(draftKey(userId, draftId), JSON.stringify(content)),
    saveIndex(userId, index),
  ]);

  res.json({ success: true, draftId, savedAt: createdAt });
}));

// GET /api/drafts/:userId
router.get('/:userId', asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  const drafts = await getIndex(userId);
  res.json({ success: true, drafts });
}));

// GET /api/drafts/:userId/:draftId
router.get('/:userId/:draftId', asyncHandler(async (req: Request, res: Response) => {
  const { userId, draftId } = req.params;

  const raw = await s3Get(draftKey(userId, draftId));
  if (!raw) {
    res.status(404).json({ success: false, error: 'Draft not found' });
    return;
  }

  res.json({ success: true, draft: JSON.parse(raw) as DraftContent });
}));

// DELETE /api/drafts/:userId/:draftId
router.delete('/:userId/:draftId', asyncHandler(async (req: Request, res: Response) => {
  const { userId, draftId } = req.params;

  const index = await getIndex(userId);
  const updated = index.filter((d) => d.draftId !== draftId);

  await Promise.all([
    s3Delete(draftKey(userId, draftId)),
    saveIndex(userId, updated),
  ]);

  res.json({ success: true });
}));

export default router;
