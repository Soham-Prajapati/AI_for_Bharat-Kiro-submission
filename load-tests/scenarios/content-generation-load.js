/**
 * K6 Load Test: Content Generation Scenario
 * Tests 50 concurrent content generation requests
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const generationSuccessRate = new Rate('generation_success_rate');
const generationDuration = new Trend('generation_duration');
const generationErrors = new Counter('generation_errors');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp up to 10 users
    { duration: '1m', target: 25 },   // Ramp up to 25 users
    { duration: '2m', target: 50 },   // Ramp up to 50 users
    { duration: '3m', target: 50 },   // Stay at 50 users
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<2000'], // 95% of requests under 2s
    'http_req_failed': ['rate<0.01'],    // Error rate under 1%
    'generation_success_rate': ['rate>0.99'], // 99% success rate
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

const PLATFORMS = ['instagram', 'twitter', 'linkedin', 'tiktok', 'youtube'];
const LANGUAGES = ['en', 'es', 'fr', 'de', 'pt'];
const CREATOR_MODES = ['hybrid', 'professional', 'casual'];

// Mock job IDs (in real scenario, these would be from actual uploads)
const MOCK_JOB_IDS = [
  'job-001', 'job-002', 'job-003', 'job-004', 'job-005',
  'job-006', 'job-007', 'job-008', 'job-009', 'job-010'
];

export default function () {
  const userId = `user-${__VU}`;
  
  // Randomly select platforms (1-3 platforms per request)
  const numPlatforms = Math.floor(Math.random() * 3) + 1;
  const selectedPlatforms = [];
  for (let i = 0; i < numPlatforms; i++) {
    const platform = PLATFORMS[Math.floor(Math.random() * PLATFORMS.length)];
    if (!selectedPlatforms.includes(platform)) {
      selectedPlatforms.push(platform);
    }
  }

  const payload = {
    jobId: MOCK_JOB_IDS[Math.floor(Math.random() * MOCK_JOB_IDS.length)],
    platforms: selectedPlatforms,
    language: LANGUAGES[Math.floor(Math.random() * LANGUAGES.length)],
    creatorMode: CREATOR_MODES[Math.floor(Math.random() * CREATOR_MODES.length)],
  };

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: '30s',
  };

  const startTime = Date.now();
  const response = http.post(`${BASE_URL}/api/generate`, JSON.stringify(payload), params);
  const duration = Date.now() - startTime;

  // Record metrics
  generationDuration.add(duration);
  
  const success = check(response, {
    'status is 200': (r) => r.status === 200,
    'has success field': (r) => r.json('success') === true,
    'has generationId': (r) => r.json('generationId') !== undefined,
    'has results': (r) => r.json('results') !== undefined,
    'response time < 2s': () => duration < 2000,
  });

  generationSuccessRate.add(success);
  
  if (!success) {
    generationErrors.add(1);
    console.error(`Generation failed: ${response.status} - ${response.body}`);
  }

  // If generation successful, test retrieval
  if (success && response.json('generationId')) {
    sleep(0.5);
    
    const generationId = response.json('generationId');
    const getResponse = http.get(`${BASE_URL}/api/generate/${generationId}`, params);
    
    check(getResponse, {
      'retrieval status is 200': (r) => r.status === 200,
      'retrieval has data': (r) => r.json('generationId') === generationId,
    });
  }

  // Think time between requests
  sleep(Math.random() * 4 + 2); // 2-6 seconds
}

export function handleSummary(data) {
  return {
    'load-tests/results/content-generation-results.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  const indent = options.indent || '';
  let summary = '\n' + indent + '=== Content Generation Load Test Summary ===\n\n';
  
  summary += indent + `Total Requests: ${data.metrics.http_reqs.values.count}\n`;
  summary += indent + `Failed Requests: ${data.metrics.http_req_failed.values.passes}\n`;
  summary += indent + `Request Rate: ${data.metrics.http_reqs.values.rate.toFixed(2)} req/s\n\n`;
  
  summary += indent + 'Response Times:\n';
  summary += indent + `  Avg: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
  summary += indent + `  Min: ${data.metrics.http_req_duration.values.min.toFixed(2)}ms\n`;
  summary += indent + `  Max: ${data.metrics.http_req_duration.values.max.toFixed(2)}ms\n`;
  summary += indent + `  p(95): ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n`;
  summary += indent + `  p(99): ${data.metrics.http_req_duration.values['p(99)'].toFixed(2)}ms\n\n`;
  
  summary += indent + `Generation Success Rate: ${(data.metrics.generation_success_rate.values.rate * 100).toFixed(2)}%\n`;
  summary += indent + `Generation Errors: ${data.metrics.generation_errors.values.count}\n`;
  
  return summary;
}
