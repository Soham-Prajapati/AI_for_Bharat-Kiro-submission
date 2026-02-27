/**
 * Main entry point for Content Intelligence Platform
 */

import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { logger } from './middleware/logger.middleware';
import { requestIdMiddleware } from './middleware/requestId.middleware';
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
import trendsRoute from './routes/trends.route';
import voiceRoute from './routes/voice.route';
import dopamineRoute from './routes/dopamine.route';
import watermarkRoute from './routes/watermark.route';
import multiplyRoute from './routes/multiply.route';
import marketplaceRoute from './routes/marketplace.route';
import graphRoute from './routes/graph.route';
import communityRoute from './routes/community.route';
import membershipRoute from './routes/membership.route';
import automationRoute from './routes/automation.route';
import workspaceRoute from './routes/workspace.route';
import graphRoute from './routes/graph.route';
import { workspaceWSServer } from './services/workspace-ws.service';
import { createServer } from 'http';

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Request tracking
app.use(requestIdMiddleware);
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
app.use('/api/trends', trendsRoute);
app.use('/api/voice', voiceRoute);
app.use('/api/dopamine', dopamineRoute);
app.use('/api/watermark', watermarkRoute);
app.use('/api/multiply', multiplyRoute);
app.use('/api/marketplace', marketplaceRoute);
app.use('/api/graph', graphRoute);
app.use('/api/community', communityRoute);
app.use('/api/membership', membershipRoute);
app.use('/api/automation', automationRoute);
app.use('/api/workspace', workspaceRoute);
app.use('/api/graph', graphRoute);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handlers (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`🚀 Content Intelligence Platform running on port ${PORT}`);
    
    // Initialize WebSocket server
    workspaceWSServer.initialize(server);
    console.log(`🔌 WebSocket server ready at ws://localhost:${PORT}/ws/workspace`);
  });
}

export default app;
