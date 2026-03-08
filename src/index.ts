/**
 * Main entry point for Content Intelligence Platform
 */

import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { logger } from './middleware/logger.middleware';
import { requestIdMiddleware } from './middleware/requestId.middleware';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { apiLimiter } from './middleware/ratelimit.middleware';
import uploadRoute from './routes/upload.route';
import uploadRouteMock from './routes/upload.route.mock';
import processRoute from './routes/process.route';
import generateRoute from './routes/generate.route';
import ideateRoute from './routes/ideate.route';
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
import uploadToResultsRoute from './routes/upload-to-results.route';
import youtubeOAuthRoute from './routes/youtube-oauth.route';
import socialOAuthRoute from './routes/social-oauth.route';
import contentRefineRouter from './routes/content-refine.route';
import draftsRouter from './routes/drafts.route';
import { sqsWorkerService } from './services/sqs-worker.service';
import { workspaceWSServer } from './services/workspace-ws.service';
import { createServer } from 'http';

dotenv.config();

// Use mock upload if AWS credentials/S3 bucket are not configured in .env.
const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const s3BucketName = process.env.S3_BUCKET_NAME || process.env.S3_BUCKET;
const placeholderAccessKeys = new Set(['your_access_key', 'your_access_key_here']);
const placeholderSecretKeys = new Set(['your_secret_key', 'your_secret_key_here']);

const USE_MOCK_UPLOAD =
  !awsAccessKeyId ||
  !awsSecretAccessKey ||
  !s3BucketName ||
  placeholderAccessKeys.has(awsAccessKeyId) ||
  placeholderSecretKeys.has(awsSecretAccessKey);

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

// Serve locally uploaded files (fallback when S3 is unavailable)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Request tracking
app.use(requestIdMiddleware);
app.use(logger);

// Rate limiting
app.use('/api', apiLimiter);

// Routes
app.use('/api/upload', USE_MOCK_UPLOAD ? uploadRouteMock : uploadRoute);
if (USE_MOCK_UPLOAD) {
  console.log('⚠️  Using MOCK upload (AWS S3 not configured)');
  console.log('   Files will be saved locally to ./uploads/');
}
app.use('/api/upload-to-results', uploadToResultsRoute);
app.use('/api/process', processRoute);
app.use('/api/generate', generateRoute);
app.use('/api/ideate', ideateRoute);
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
app.use('/api/marketplace', marketplaceRoute);
app.use('/api/graph', graphRoute);
app.use('/api/community', communityRoute);
app.use('/api/membership', membershipRoute);
app.use('/api/automation', automationRoute);
app.use('/api/workspace', workspaceRoute);
app.use('/api/analytics-dashboard', analyticsDashboardRoute);
app.use('/api/integrations', integrationsRoute);
app.use('/api/adhd', adhdRoute);
app.use('/api/creative-director', creativeDirectorRoute);
app.use('/api/viral-analyzer', viralAnalyzerRoute);
app.use('/api/multiply-v2', multiplyV2Route);
app.use('/api/safety', safetyRoute);
app.use('/api/vernacular', vernacularRoute);
app.use('/api/regional', regionalRoute);
app.use('/api/youtube-oauth', youtubeOAuthRoute);
app.use('/api/social-oauth', socialOAuthRoute);
app.use('/api/content', contentRefineRouter);
app.use('/api/drafts', draftsRouter);

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

    // Start asynchronous SQS worker for processing jobs.
    sqsWorkerService.startPolling();
  });
}

export default app;
