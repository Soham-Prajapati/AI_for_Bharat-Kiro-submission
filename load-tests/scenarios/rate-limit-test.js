/**
 * K6 Load Test: API Rate Limiting Test
 * Tests rate limiting behavior under load
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const rateLimitHitRate = new Rate('rate_limit_hit_rate');
const successfulRequests = new Counter('successful_requests');
const rateLimitedRequests = new Counter('rate_limited_requests');
const requestDuration = new Trend('request_duration');

// Test configuration - aggressive to trigger rate limits
export const options = {
  stages: [
    { duration: '10s', target: 50 },   // Quick ramp to 50 users
    { duration: '30s', target: 100 },  // Ramp to 100 users
    { duration: '1m', target: 150 },   // Push to 150 users
    { duration: '30s', target: 0 },    // Ramp down
  ],
  thresholds: {
    'rate_limit_hit_rate': ['rate>0'], // Expect some rate limiting
    'http_req_duration': ['p(95)<2000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

const ENDPOINTS = [
  '/api/analytics/test-user-123',
  '/api/viral/test-content-456',
  '/api/trends/technology',
  '/api/roi/test-campaign-789',
  '/api/cultural/test-content-101',
];

export default function () {
  const endpoint = ENDPOINTS[Math.floor(Math.random() * ENDPOINTS.length)];
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: '10s',
  };

  const startTime = Date.now();
  const response = http.get(`${BASE_URL}${endpoint}`, params);
  const duration = Date.now() - startTime;

  requestDuration.add(duration);

  // Check for rate limiting
  const isRateLimited = response.status === 429;
  rateLimitHitRate.add(isRateLimited);
  
  if (isRateLimited) {
    rateLimitedRequests.add(1);
  } else if (response.status === 200) {
    successfulRequests.add(1);
  }

  check(response, {
    'status is 200 or 429': (r) => r.status === 200 || r.status === 429,
    'has proper rate limit response': (r) => {
      if (r.status === 429) {
        return r.body.includes('Too many requests') || r.body.includes('rate limit');
      }
      return true;
    },
  });

  // Minimal sleep to stress test rate limits
  sleep(0.1);
}

export function handleSummary(data) {
  return {
    'load-tests/results/rate-limit-results.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  const indent = options.indent || '';
  let summary = '\n' + indent + '=== Rate Limit Test Summary ===\n\n';
  
  summary += indent + `Total Requests: ${data.metrics.http_reqs.values.count}\n`;
  summary += indent + `Successful Requests: ${data.metrics.successful_requests.values.count}\n`;
  summary += indent + `Rate Limited Requests: ${data.metrics.rate_limited_requests.values.count}\n`;
  summary += indent + `Request Rate: ${data.metrics.http_reqs.values.rate.toFixed(2)} req/s\n\n`;
  
  summary += indent + 'Response Times:\n';
  summary += indent + `  Avg: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
  summary += indent + `  p(95): ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n`;
  summary += indent + `  p(99): ${data.metrics.http_req_duration.values['p(99)'].toFixed(2)}ms\n\n`;
  
  const rateLimitRate = data.metrics.rate_limit_hit_rate.values.rate * 100;
  summary += indent + `Rate Limit Hit Rate: ${rateLimitRate.toFixed(2)}%\n`;
  summary += indent + '\nRate limiting is working as expected if hit rate > 0%\n';
  
  return summary;
}
