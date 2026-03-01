#!/usr/bin/env node

/**
 * Generate Load Test Report
 * Consolidates k6 test results into a comprehensive markdown report
 */

const fs = require('fs');
const path = require('path');

const environment = process.argv[2] || 'staging';
const timestamp = process.argv[3] || new Date().toISOString();
const scenario = process.argv[4] || 'all';

const RESULTS_DIR = 'load-tests/results';
const REPORT_FILE = 'docs/LOAD_TEST_RESULTS.md';

// Result files to process
const resultFiles = {
  upload: 'upload-load-results.json',
  generation: 'content-generation-results.json',
  ratelimit: 'rate-limit-results.json',
  stress: 'stress-test-results.json',
};

function loadResults(filename) {
  const filepath = path.join(RESULTS_DIR, filename);
  if (!fs.existsSync(filepath)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  } catch (error) {
    console.error(`Error loading ${filename}:`, error.message);
    return null;
  }
}

function formatDuration(ms) {
  return `${ms.toFixed(2)}ms`;
}

function formatRate(rate) {
  return `${(rate * 100).toFixed(2)}%`;
}

function getStatusEmoji(value, threshold, inverse = false) {
  const pass = inverse ? value > threshold : value < threshold;
  return pass ? '✅' : '❌';
}

function generateMetricsTable(data, testName) {
  if (!data || !data.metrics) return 'No data available';

  const metrics = data.metrics;
  let table = '\n| Metric | Value | Target | Status |\n';
  table += '|--------|-------|--------|--------|\n';

  // Request metrics
  if (metrics.http_reqs) {
    table += `| Total Requests | ${metrics.http_reqs.values.count} | - | ℹ️ |\n`;
    table += `| Request Rate | ${metrics.http_reqs.values.rate.toFixed(2)} req/s | ≥100 req/s | ${getStatusEmoji(metrics.http_reqs.values.rate, 100, true)} |\n`;
  }

  // Response time metrics
  if (metrics.http_req_duration) {
    const p95 = metrics.http_req_duration.values['p(95)'];
    table += `| Avg Response Time | ${formatDuration(metrics.http_req_duration.values.avg)} | - | ℹ️ |\n`;
    table += `| p(95) Response Time | ${formatDuration(p95)} | <2000ms | ${getStatusEmoji(p95, 2000)} |\n`;
    table += `| p(99) Response Time | ${formatDuration(metrics.http_req_duration.values['p(99)'])} | - | ℹ️ |\n`;
    table += `| Max Response Time | ${formatDuration(metrics.http_req_duration.values.max)} | - | ℹ️ |\n`;
  }

  // Error rate
  if (metrics.http_req_failed) {
    const errorRate = metrics.http_req_failed.values.rate;
    table += `| Error Rate | ${formatRate(errorRate)} | <1% | ${getStatusEmoji(errorRate, 0.01)} |\n`;
  }

  // Test-specific metrics
  if (testName === 'upload' && metrics.upload_success_rate) {
    table += `| Upload Success Rate | ${formatRate(metrics.upload_success_rate.values.rate)} | >99% | ${getStatusEmoji(metrics.upload_success_rate.values.rate, 0.99, true)} |\n`;
  }

  if (testName === 'generation' && metrics.generation_success_rate) {
    table += `| Generation Success Rate | ${formatRate(metrics.generation_success_rate.values.rate)} | >99% | ${getStatusEmoji(metrics.generation_success_rate.values.rate, 0.99, true)} |\n`;
  }

  if (testName === 'ratelimit' && metrics.rate_limit_hit_rate) {
    table += `| Rate Limit Hit Rate | ${formatRate(metrics.rate_limit_hit_rate.values.rate)} | >0% | ${getStatusEmoji(metrics.rate_limit_hit_rate.values.rate, 0, true)} |\n`;
  }

  if (testName === 'stress') {
    if (metrics.error_rate) {
      table += `| System Error Rate | ${formatRate(metrics.error_rate.values.rate)} | <5% | ${getStatusEmoji(metrics.error_rate.values.rate, 0.05)} |\n`;
    }
    if (metrics.cache_hit_rate) {
      table += `| Cache Hit Rate | ${formatRate(metrics.cache_hit_rate.values.rate)} | - | ℹ️ |\n`;
    }
  }

  return table;
}

function generateReport() {
  let report = `# Load Test Results\n\n`;
  report += `**Environment:** ${environment}\n`;
  report += `**Test Date:** ${new Date(timestamp).toLocaleString()}\n`;
  report += `**Scenario:** ${scenario}\n\n`;

  report += `## Executive Summary\n\n`;
  report += `This report contains the results of load testing performed on the Content Intelligence Platform.\n\n`;

  report += `### Target Metrics\n\n`;
  report += `- **Response Time:** p(95) < 2000ms\n`;
  report += `- **Error Rate:** < 1%\n`;
  report += `- **Throughput:** ≥ 100 req/s\n`;
  report += `- **Success Rate:** > 99%\n\n`;

  // Process each test scenario
  const scenarios = scenario === 'all' ? Object.keys(resultFiles) : [scenario];
  
  for (const testName of scenarios) {
    const filename = resultFiles[testName];
    if (!filename) continue;

    const data = loadResults(filename);
    if (!data) {
      report += `## ${testName.charAt(0).toUpperCase() + testName.slice(1)} Test\n\n`;
      report += `⚠️ No results available for this test.\n\n`;
      continue;
    }

    report += `## ${testName.charAt(0).toUpperCase() + testName.slice(1)} Test\n\n`;

    // Test description
    switch (testName) {
      case 'upload':
        report += `**Description:** Tests 100 concurrent users uploading files of varying sizes (50KB-500KB).\n\n`;
        break;
      case 'generation':
        report += `**Description:** Tests 50 concurrent content generation requests across multiple platforms.\n\n`;
        break;
      case 'ratelimit':
        report += `**Description:** Tests API rate limiting behavior under aggressive load (150 concurrent users).\n\n`;
        break;
      case 'stress':
        report += `**Description:** Stress test pushing system to 400 concurrent users to identify breaking points.\n\n`;
        break;
    }

    report += `### Metrics\n`;
    report += generateMetricsTable(data, testName);
    report += `\n`;

    // Threshold checks
    if (data.metrics) {
      const checks = data.metrics.checks;
      if (checks) {
        report += `### Validation Checks\n\n`;
        report += `- **Passed:** ${checks.values.passes}\n`;
        report += `- **Failed:** ${checks.values.fails}\n`;
        report += `- **Pass Rate:** ${formatRate(checks.values.rate)}\n\n`;
      }
    }

    // Add insights
    report += `### Insights\n\n`;
    
    if (testName === 'upload' && data.metrics.upload_success_rate) {
      const successRate = data.metrics.upload_success_rate.values.rate;
      if (successRate > 0.99) {
        report += `✅ Upload system is performing well with ${formatRate(successRate)} success rate.\n\n`;
      } else {
        report += `⚠️ Upload success rate of ${formatRate(successRate)} is below target. Investigation needed.\n\n`;
      }
    }

    if (testName === 'generation' && data.metrics.http_req_duration) {
      const p95 = data.metrics.http_req_duration.values['p(95)'];
      if (p95 < 2000) {
        report += `✅ Content generation response times are within acceptable limits.\n\n`;
      } else {
        report += `⚠️ Content generation p(95) response time of ${formatDuration(p95)} exceeds 2s target.\n\n`;
      }
    }

    if (testName === 'ratelimit' && data.metrics.rate_limit_hit_rate) {
      const hitRate = data.metrics.rate_limit_hit_rate.values.rate;
      if (hitRate > 0) {
        report += `✅ Rate limiting is working correctly. ${formatRate(hitRate)} of requests were rate limited.\n\n`;
      } else {
        report += `⚠️ Rate limiting may not be configured correctly. No rate limits were triggered.\n\n`;
      }
    }

    if (testName === 'stress' && data.metrics.error_rate) {
      const errorRate = data.metrics.error_rate.values.rate;
      if (errorRate < 0.01) {
        report += `✅ System handled extreme stress exceptionally well with only ${formatRate(errorRate)} errors.\n\n`;
      } else if (errorRate < 0.05) {
        report += `⚠️ System showed some degradation under extreme stress with ${formatRate(errorRate)} error rate.\n\n`;
      } else {
        report += `❌ System struggled under stress with ${formatRate(errorRate)} error rate. Optimization needed.\n\n`;
      }
    }

    report += `---\n\n`;
  }

  // Overall recommendations
  report += `## Recommendations\n\n`;
  report += `### Performance Optimization\n\n`;
  report += `1. **Caching Strategy:** Implement or optimize caching for frequently accessed data\n`;
  report += `2. **Database Indexing:** Review and optimize database queries and indexes\n`;
  report += `3. **Connection Pooling:** Ensure proper connection pool sizing for database and external services\n`;
  report += `4. **CDN Integration:** Consider CDN for static assets and file uploads\n\n`;

  report += `### Scalability\n\n`;
  report += `1. **Horizontal Scaling:** Prepare for horizontal scaling with load balancers\n`;
  report += `2. **Auto-scaling:** Implement auto-scaling based on CPU/memory metrics\n`;
  report += `3. **Queue System:** Consider message queues for async processing of heavy operations\n`;
  report += `4. **Microservices:** Evaluate splitting heavy services into separate microservices\n\n`;

  report += `### Monitoring\n\n`;
  report += `1. **APM Tools:** Implement Application Performance Monitoring (e.g., New Relic, DataDog)\n`;
  report += `2. **Real-time Alerts:** Set up alerts for response time, error rate, and throughput thresholds\n`;
  report += `3. **Log Aggregation:** Centralize logs for better debugging and analysis\n`;
  report += `4. **Custom Metrics:** Track business-specific metrics (upload success rate, generation time)\n\n`;

  report += `## Next Steps\n\n`;
  report += `1. Review failed test scenarios and investigate root causes\n`;
  report += `2. Implement recommended optimizations\n`;
  report += `3. Re-run load tests to validate improvements\n`;
  report += `4. Schedule regular load testing as part of CI/CD pipeline\n`;
  report += `5. Conduct load tests before major releases\n\n`;

  report += `---\n\n`;
  report += `*Report generated on ${new Date().toLocaleString()}*\n`;

  return report;
}

// Generate and save report
try {
  const report = generateReport();
  
  // Ensure docs directory exists
  const docsDir = path.dirname(REPORT_FILE);
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  fs.writeFileSync(REPORT_FILE, report);
  console.log(`✓ Report generated successfully: ${REPORT_FILE}`);
} catch (error) {
  console.error('Error generating report:', error);
  process.exit(1);
}
