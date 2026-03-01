/**
 * K6 Load Test: File Upload Scenario
 * Tests 100 concurrent users uploading files
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const uploadSuccessRate = new Rate('upload_success_rate');
const uploadDuration = new Trend('upload_duration');
const uploadErrors = new Counter('upload_errors');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp up to 20 users
    { duration: '1m', target: 50 },   // Ramp up to 50 users
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '3m', target: 100 },  // Stay at 100 users
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<2000'], // 95% of requests under 2s
    'http_req_failed': ['rate<0.01'],    // Error rate under 1%
    'upload_success_rate': ['rate>0.99'], // 99% success rate
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Generate test file data
function generateTestFile(sizeKB = 100) {
  const size = sizeKB * 1024;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let content = '';
  for (let i = 0; i < size; i++) {
    content += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return content;
}

export default function () {
  const userId = `user-${__VU}-${__ITER}`;
  
  // Generate file sizes between 50KB and 500KB
  const fileSize = Math.floor(Math.random() * 450) + 50;
  const fileContent = generateTestFile(fileSize);
  
  const formData = {
    file: http.file(fileContent, `test-file-${Date.now()}.txt`, 'text/plain'),
    userId: userId,
  };

  const params = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: '30s',
  };

  const startTime = Date.now();
  const response = http.post(`${BASE_URL}/api/upload`, formData, params);
  const duration = Date.now() - startTime;

  // Record metrics
  uploadDuration.add(duration);
  
  const success = check(response, {
    'status is 200': (r) => r.status === 200,
    'has success field': (r) => r.json('success') === true,
    'has fileId': (r) => r.json('fileId') !== undefined,
    'response time < 2s': () => duration < 2000,
  });

  uploadSuccessRate.add(success);
  
  if (!success) {
    uploadErrors.add(1);
    console.error(`Upload failed: ${response.status} - ${response.body}`);
  }

  // Think time between requests
  sleep(Math.random() * 3 + 1); // 1-4 seconds
}

export function handleSummary(data) {
  return {
    'load-tests/results/upload-load-results.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  const indent = options.indent || '';
  let summary = '\n' + indent + '=== Upload Load Test Summary ===\n\n';
  
  summary += indent + `Total Requests: ${data.metrics.http_reqs.values.count}\n`;
  summary += indent + `Failed Requests: ${data.metrics.http_req_failed.values.passes}\n`;
  summary += indent + `Request Rate: ${data.metrics.http_reqs.values.rate.toFixed(2)} req/s\n\n`;
  
  summary += indent + 'Response Times:\n';
  summary += indent + `  Avg: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
  summary += indent + `  Min: ${data.metrics.http_req_duration.values.min.toFixed(2)}ms\n`;
  summary += indent + `  Max: ${data.metrics.http_req_duration.values.max.toFixed(2)}ms\n`;
  summary += indent + `  p(95): ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n`;
  summary += indent + `  p(99): ${data.metrics.http_req_duration.values['p(99)'].toFixed(2)}ms\n\n`;
  
  summary += indent + `Upload Success Rate: ${(data.metrics.upload_success_rate.values.rate * 100).toFixed(2)}%\n`;
  summary += indent + `Upload Errors: ${data.metrics.upload_errors.values.count}\n`;
  
  return summary;
}
