import express from 'express';
import request from 'supertest';
import uploadToResultsRoute from '../routes/upload-to-results.route';
import { processingPipeline } from '../services/processing-pipeline.service';

describe('Upload-to-Results Route', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/upload-to-results', uploadToResultsRoute);

  afterAll(() => {
    processingPipeline.clear();
  });

  it('generates platform content after processing request', async () => {
    const response = await request(app)
      .post('/api/upload-to-results/process')
      .send({
        fileId: 'demo-file-1',
        fileName: 'demo.mp4',
        mimeType: 'video/mp4',
        userId: 'demo_user',
        platforms: ['youtube', 'instagram', 'tiktok', 'linkedin', 'twitter', 'blog', 'podcast', 'analytics'],
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.jobId).toBeDefined();
    expect(response.body.results).toBeDefined();
    expect(response.body.results.platforms).toBeDefined();
    expect(response.body.results.platforms.youtube).toBeDefined();
    expect(response.body.results.platforms.instagram).toBeDefined();
    expect(response.body.results.platforms.analytics).toBeDefined();
  });

  it('returns cached results by jobId', async () => {
    const processResponse = await request(app)
      .post('/api/upload-to-results/process')
      .send({
        fileId: 'demo-file-2',
        fileName: 'demo-two.mp4',
        mimeType: 'video/mp4',
        userId: 'demo_user',
      })
      .expect(200);

    const jobId = processResponse.body.jobId;

    const resultsResponse = await request(app)
      .get(`/api/upload-to-results/results/${jobId}`)
      .expect(200);

    expect(resultsResponse.body.success).toBe(true);
    expect(resultsResponse.body.jobId).toBe(jobId);
    expect(resultsResponse.body.results).toBeDefined();
    expect(resultsResponse.body.results.platforms).toBeDefined();
  });
});
