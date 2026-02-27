import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../types/errors';

export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
        throw new ValidationError(messages);
      }
      next(error);
    }
  };
};

// Common validation schemas
export const schemas = {
  auth: {
    login: z.object({
      body: z.object({
        email: z.string().email(),
        password: z.string().min(8),
      }),
    }),
    register: z.object({
      body: z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().min(2).max(100),
      }),
    }),
  },
  upload: z.object({
    body: z.object({
      userId: z.string().optional(),
    }),
  }),
  generate: z.object({
    body: z.object({
      jobId: z.string(),
      platforms: z.array(z.enum(['youtube', 'instagram', 'linkedin', 'twitter', 'facebook', 'tiktok'])),
      language: z.enum(['en', 'hi', 'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml']).optional(),
      creatorMode: z.enum(['ai-first', 'hybrid', 'human-first']).optional(),
    }),
  }),
};
