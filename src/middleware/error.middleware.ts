import { Request, Response, NextFunction } from 'express';

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
};

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  if (err.code === 'NoSuchKey') {
    return res.status(404).json({ error: 'File not found' });
  }

  if (err.code === 'AccessDenied') {
    return res.status(403).json({ error: 'Access denied' });
  }

  res.status(500).json({ error: 'Internal server error' });
};
