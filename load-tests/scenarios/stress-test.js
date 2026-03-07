/**
 * K6 Stress Test: Database/Cache Performance Under Stress
 * Tests system behavior under extreme load
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('error_rate');
const cacheHitRate = new Rate('cache_hit_rate');
const systemErrors = new Counter('system_errors');
const requestDuration = new Trend('request_duration');

// Stress test configuration - push system to limits
export const options = {
  stages: [
    { duration: '1m', target: 50 },    // Warm up
    { duration: '2m', target: 100 },   // Increase load
    { duration: '2m', target: 200 },   // Stress level
    { duration: '2m', target: 300 },   // Breaking point
    { duration: '1m', target: 400 },   // Maximum stress
    { duration: '2m', target: 0 },     // Recovery
  ],
  thresholds: {
    'http_req_duration': ['p(95)<5000'], // Allow higher latency under stress
    'error_rate': ['rate<0.05'],         // Allow up to 5% errors under extreme stress
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Mix of endpoints to test different system components
const TEST_SCENARIOS = [
  {
    name: 'analytics',
    endpoint: '/api/analytics/stress-user-',
    method: 'GET',
    weight: 30,
  },
  {
    name: 'viral',
    endpoint: '/api/viral/stress-content-',
    method: 'GET',
    weight: 20,
  },
  {
    name: 'trends',
    endpoint: '/api/trends/technology',
    method: 'GET',
    weight: 15,
  },
  {
    name: 'roi',
    endpoint: '/api/roi/stress-campaign-',
    method: 'GET',
    weight: 15,
  },
  {
    name: 'cultural',
    endpoint: '/api/cultural/stress-content-',
    method: 'GET',
    weight: 10,
  },
  {
    name: 'health',
    endpoint: '/health',
    method: 'GET',
    weight: 10,
  },
];

function selectScenario() {
  const totalWeight = TEST_SCENARIOS.reduce((sum, s) => sum + s.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const scenario of TEST_SCENARIOS) {
    random -= scenario.weight;
    if (random <= 0) {
      return scenario;
    }
  }
  return TEST_SCENARIOS[0];
}

export default function () {
  const scenario = selectScenario();
  let endpoint = scenario.endpoint;
  
  // Add random ID for parameterized endpoints
  if (endpoint.includes('-')) {
    endpoint += Math.floor(Math.random() * 1000);
  }

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: '15s',
  };

  const startTime = Date.now();
  const response = http.get(`${BASE_URL}${endpoint}`, params);
  const duration = Date.now() - startTime;

  requestDuration.add(duration);

  // Check for cache hits
  if (response.json('cached') === true) {
    cacheHitRate.add(1);
  } else {
    cacheHitRate.add(0);
  }

  const success = check(response, {
    'status is 2xx or 429': (r) => r.status >= 200 && r.status < 300 || r.status === 429,
    'response time acceptable': () => duration < 10000,
    'has valid response': (r) => r.body && r.body.length > 0,
  });

  if (!success && response.status !== 429) {
    errorRate.add(1);
    systemErrors.add(1);
    console.error(`Error on ${endpoint}: ${response.status} - ${response.body.substring(0, 100)}`);
  } else {
    errorRate.add(0);
  }

  // Minimal sleep to maintain stress
  sleep(0.05);
}

export function handleSummary(data) {
  return {
    'load-tests/results/stress-test-results.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  const indent = options.indent || '';
  let summary = '\n' + indent + '=== Stress Test Summary ===\n\n';
  
  summary += indent + `Total Requests: ${data.metrics.http_reqs.values.count}\n`;
  summary += indent + `System Errors: ${data.metrics.system_errors.values.count}\n`;
  summary += indent + `Peak Request Rate: ${data.metrics.http_reqs.values.rate.toFixed(2)} req/s\n\n`;
  
  summary += indent + 'Response Times:\n';
  summary += indent + `  Avg: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
  summary += indent + `  Min: ${data.metrics.http_req_duration.values.min.toFixed(2)}ms\n`;
  summary += indent + `  Max: ${data.metrics.http_req_duration.values.max.toFixed(2)}ms\n`;
  summary += indent + `  p(50): ${data.metrics.http_req_duration.values['p(50)'].toFixed(2)}ms\n`;
  summary += indent + `  p(95): ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n`;
  summary += indent + `  p(99): ${data.metrics.http_req_duration.values['p(99)'].toFixed(2)}ms\n\n`;
  
  summary += indent + `Error Rate: ${(data.metrics.error_rate.values.rate * 100).toFixed(2)}%\n`;
  summary += indent + `Cache Hit Rate: ${(data.metrics.cache_hit_rate.values.rate * 100).toFixed(2)}%\n\n`;
  
  summary += indent + 'System Performance:\n';
  if (data.metrics.error_rate.values.rate < 0.01) {
    summary += indent + '  ✓ Excellent - System handled stress well\n';
  } else if (data.metrics.error_rate.values.rate < 0.05) {
    summary += indent + '  ⚠ Good - Some degradation under extreme load\n';
  } else {
    summary += indent + '  ✗ Poor - System struggled under stress\n';
  }
  
  return summary;
}
