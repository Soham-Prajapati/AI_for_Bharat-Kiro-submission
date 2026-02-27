import { Request, Response, NextFunction } from 'express';

const ALLOWED_MIME_TYPES = [
  'video/mp4', 'video/quicktime', 'video/x-msvideo',
  'audio/mpeg', 'audio/wav', 'audio/mp3',
  'text/plain', 'application/json'
];

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export const validateFileUpload = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided' });
  }

  if (!ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
    return res.status(400).json({ error: 'Invalid file type' });
  }

  if (req.file.size > MAX_FILE_SIZE) {
    return res.status(400).json({ error: 'File too large' });
  }

  next();
};

export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  if (req.body.userId) {
    req.body.userId = req.body.userId.replace(/[^a-zA-Z0-9-_]/g, '');
  }
  next();
};
