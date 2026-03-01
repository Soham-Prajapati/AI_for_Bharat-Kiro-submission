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
import analyticsDashboardRoute from './routes/analytics-dashboard.route';
import integrationsRoute from './routes/integrations.route';
import adhdRoute from './routes/adhd.route';
import creativeDirectorRoute from './routes/creative-director.route';
import viralAnalyzerRoute from './routes/viral-analyzer.route';
import multiplyV2Route from './routes/multiply-v2.route';
import safetyRoute from './routes/safety.route';
import vernacularRoute from './routes/vernacular.route';
import regionalRoute from './routes/regional.route';
import { workspaceWSServer } from './services/workspace-ws.service';
import { createServer } from 'http';

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// Strict CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 hours
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
app.use('/api/membership', membershipRoute);
app.use('/api/automation', automationRoute);
app.use('/api/analytics-dashboard', analyticsDashboardRoute);
app.use('/api/integrations', integrationsRoute);
app.use('/api/adhd', adhdRoute);
app.use('/api/creative-director', creativeDirectorRoute);
app.use('/api/viral-analyzer', viralAnalyzerRoute);
app.use('/api/multiply-v2', multiplyV2Route);
app.use('/api/safety', safetyRoute);
app.use('/api/vernacular', vernacularRoute);
app.use('/api/regional', regionalRoute);

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
