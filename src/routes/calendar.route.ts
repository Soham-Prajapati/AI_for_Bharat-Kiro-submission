import { Router, Request, Response } from 'express';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { asyncHandler } from '../middleware/asyncHandler.middleware';
import { ValidationError } from '../types/errors';
import { awsConfig } from '../config/aws';

const router = Router();

const CALENDAR_BUCKET = process.env.S3_BUCKET_NAME || 'ai-bharat-file-storage-us';
const CALENDAR_REGION = process.env.AWS_REGION_USERS || 'us-east-1';

const VALID_PLATFORMS = ['youtube', 'instagram', 'tiktok', 'twitter', 'linkedin', 'blog', 'podcast'] as const;

type Platform = typeof VALID_PLATFORMS[number];

interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  platform: Platform;
  scheduledAt: string;
  content?: string;
  draftId?: string;
  status: 'scheduled' | 'posted' | 'missed';
  notifiedMissed?: boolean;
  createdAt: string;
}

const getS3Client = (): S3Client =>
  new S3Client({
    region: CALENDAR_REGION,
    credentials:
      awsConfig.accessKeyId && awsConfig.secretAccessKey
        ? { accessKeyId: awsConfig.accessKeyId, secretAccessKey: awsConfig.secretAccessKey }
        : undefined,
  });

async function s3Put(key: string, body: string): Promise<void> {
  const client = getS3Client();
  await client.send(
    new PutObjectCommand({
      Bucket: CALENDAR_BUCKET,
      Key: key,
      Body: body,
      ContentType: 'application/json',
    })
  );
}

async function s3Get(key: string): Promise<string | null> {
  try {
    const client = getS3Client();
    const res = await client.send(
      new GetObjectCommand({ Bucket: CALENDAR_BUCKET, Key: key })
    );
    return await res.Body!.transformToString();
  } catch (err: any) {
    if (err?.name === 'NoSuchKey' || err?.$metadata?.httpStatusCode === 404) {
      return null;
    }
    throw err;
  }
}

const eventsKey = (userId: string): string => `calendar/${userId}/events.json`;

async function getEvents(userId: string): Promise<CalendarEvent[]> {
  const raw = await s3Get(eventsKey(userId));
  if (!raw) return [];
  return JSON.parse(raw) as CalendarEvent[];
}

async function saveEvents(userId: string, events: CalendarEvent[]): Promise<void> {
  await s3Put(eventsKey(userId), JSON.stringify(events));
}

// POST / — create event
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const { userId, title, platform, scheduledAt, content, draftId } = req.body as {
    userId: string;
    title: string;
    platform: Platform;
    scheduledAt: string;
    content?: string;
    draftId?: string;
  };

  if (!userId || !title || !platform || !scheduledAt) {
    throw new ValidationError('userId, title, platform, and scheduledAt are required');
  }

  if (!VALID_PLATFORMS.includes(platform)) {
    throw new ValidationError(`platform must be one of: ${VALID_PLATFORMS.join(', ')}`);
  }

  const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
  const createdAt = new Date().toISOString();

  const event: CalendarEvent = {
    id,
    userId,
    title,
    platform,
    scheduledAt,
    status: 'scheduled',
    createdAt,
    ...(content !== undefined && { content }),
    ...(draftId !== undefined && { draftId }),
  };

  const events = await getEvents(userId);
  events.push(event);
  await saveEvents(userId, events);

  res.status(201).json({ success: true, event });
}));

// GET /missed/:userId — must be before /:userId to avoid route conflict
router.get('/missed/:userId', asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const now = new Date().toISOString();

  const events = await getEvents(userId);
  const missed = events.filter(
    (e) => e.scheduledAt < now && e.status === 'scheduled'
  );

  res.json({ missed, count: missed.length });
}));

// GET /:userId — list all events
router.get('/:userId', asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const events = await getEvents(userId);
  res.json({ events });
}));

// PATCH /:eventId — update event
router.patch('/:eventId', asyncHandler(async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const { userId, status, title, content, scheduledAt, notifiedMissed } = req.body as {
    userId: string;
    status?: 'scheduled' | 'posted' | 'missed';
    title?: string;
    content?: string;
    scheduledAt?: string;
    notifiedMissed?: boolean;
  };

  if (!userId) {
    throw new ValidationError('userId is required in request body');
  }

  const events = await getEvents(userId);
  const idx = events.findIndex((e) => e.id === eventId);

  if (idx === -1) {
    res.status(404).json({ success: false, error: 'Event not found' });
    return;
  }

  const updated: CalendarEvent = {
    ...events[idx],
    ...(status !== undefined && { status }),
    ...(title !== undefined && { title }),
    ...(content !== undefined && { content }),
    ...(scheduledAt !== undefined && { scheduledAt }),
    ...(notifiedMissed !== undefined && { notifiedMissed }),
  };

  events[idx] = updated;
  await saveEvents(userId, events);

  res.json({ success: true, event: updated });
}));

// DELETE /:eventId — delete event
router.delete('/:eventId', asyncHandler(async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const userId = (req.body?.userId || req.query?.userId) as string | undefined;

  if (!userId) {
    throw new ValidationError('userId is required');
  }

  const events = await getEvents(userId);
  const filtered = events.filter((e) => e.id !== eventId);

  if (filtered.length === events.length) {
    res.status(404).json({ success: false, error: 'Event not found' });
    return;
  }

  await saveEvents(userId, filtered);
  res.json({ success: true });
}));

export default router;
