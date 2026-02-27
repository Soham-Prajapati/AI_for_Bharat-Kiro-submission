/**
 * Main entry point for Content Intelligence Platform
 */

import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { logger } from './middleware/logger.middleware';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { apiLimiter } from './middleware/ratelimit.middleware';
import uploadRoute from './routes/upload.route';
import processRoute from './routes/process.route';
import generateRoute from './routes/generate.route';
import authRoute from './routes/auth.route';
import dnaRoute from './routes/dna.route';
import analyticsRoute from './routes/analytics.route';
import viralRoute from './routes/viral.route';
import roiRoute from './routes/roi.route';
import culturalRoute from './routes/cultural.route';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(logger);

// Rate limiting
app.use('/api', apiLimiter);

// Routes
app.use('/api/upload', uploadRoute);
app.use('/api/process', processRoute);
app.use('/api/generate', generateRoute);
app.use('/api/auth', authRoute);
app.use('/api/dna', dnaRoute);
app.use('/api/analytics', analyticsRoute);
app.use('/api/viral', viralRoute);
app.use('/api/roi', roiRoute);
app.use('/api/cultural', culturalRoute);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(notFoundHandler);
app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Content Intelligence Platform running on port ${PORT}`);
  });
}

export default app;
