# Load Testing Suite

Comprehensive load testing suite for the Content Intelligence Platform using k6.

## Overview

This suite tests the platform's performance under various load conditions:

- **File Upload Load Test:** 100 concurrent users uploading files
- **Content Generation Load Test:** 50 concurrent content generation requests
- **Rate Limiting Test:** Validates rate limiting under aggressive load
- **Stress Test:** Pushes system to breaking point (400 concurrent users)

## Prerequisites

### Install k6

**macOS:**
```bash
brew install k6
```

**Linux (Debian/Ubuntu):**
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

**Windows (Chocolatey):**
```powershell
choco install k6
```

**Docker:**
```bash
docker pull grafana/k6
```

## Quick Start

### Run All Tests (Staging)

```bash
./scripts/load-test.sh all staging
```

### Run Individual Tests

```bash
# File upload test
./scripts/load-test.sh upload staging

# Content generation test
./scripts/load-test.sh generation staging

# Rate limiting test
./scripts/load-test.sh ratelimit staging

# Stress test
./scripts/load-test.sh stress staging
```

### Run Against Local Environment

```bash
./scripts/load-test.sh all local
```

## Test Scenarios

### 1. File Upload Load Test

**File:** `scenarios/upload-load.js`

**Load Profile:**
- Ramp up: 0 → 100 users over 3.5 minutes
- Sustained: 100 users for 3 minutes
- Ramp down: 100 → 0 users over 30 seconds

**What it tests:**
- File upload endpoint performance
- S3 upload handling
- Multipart form data processing
- File sizes: 50KB - 500KB

**Target Metrics:**
- p(95) response time: < 2s
- Error rate: < 1%
- Success rate: > 99%

### 2. Content Generation Load Test

**File:** `scenarios/content-generation-load.js`

**Load Profile:**
- Ramp up: 0 → 50 users over 3.5 minutes
- Sustained: 50 users for 3 minutes
- Ramp down: 50 → 0 users over 30 seconds

**What it tests:**
- Content generation API
- AWS Bedrock integration
- Multi-platform generation
- Cache performance

**Target Metrics:**
- p(95) response time: < 2s
- Error rate: < 1%
- Success rate: > 99%

### 3. Rate Limiting Test

**File:** `scenarios/rate-limit-test.js`

**Load Profile:**
- Aggressive ramp: 0 → 150 users over 1.5 minutes
- Sustained: 150 users for 1 minute
- Ramp down: 150 → 0 users over 30 seconds

**What it tests:**
- Rate limiting middleware
- 429 response handling
- Rate limit recovery
- Multiple endpoint protection

**Expected Behavior:**
- Some requests should be rate limited (429 status)
- Rate limiting should protect the system
- Non-rate-limited requests should succeed

### 4. Stress Test

**File:** `scenarios/stress-test.js`

**Load Profile:**
- Progressive stress: 0 → 400 users over 8 minutes
- Maximum stress: 400 users for 1 minute
- Recovery: 400 → 0 users over 2 minutes

**What it tests:**
- System breaking point
- Database/cache under extreme load
- Error handling under stress
- System recovery

**Acceptable Metrics:**
- p(95) response time: < 5s (under stress)
- Error rate: < 5% (under extreme stress)

## Understanding Results

### Response Time Metrics

- **Avg:** Average response time across all requests
- **Min/Max:** Fastest and slowest response times
- **p(50):** 50% of requests completed within this time (median)
- **p(95):** 95% of requests completed within this time (target: <2s)
- **p(99):** 99% of requests completed within this time

### Success Metrics

- **Success Rate:** Percentage of requests that completed successfully
- **Error Rate:** Percentage of requests that failed
- **Throughput:** Requests per second (target: ≥100 req/s)

### Custom Metrics

Each test includes custom metrics specific to the scenario:

- **Upload Test:** `upload_success_rate`, `upload_duration`
- **Generation Test:** `generation_success_rate`, `generation_duration`
- **Rate Limit Test:** `rate_limit_hit_rate`, `rate_limited_requests`
- **Stress Test:** `error_rate`, `cache_hit_rate`, `system_errors`

## Results and Reports

### Result Files

JSON results are saved to `load-tests/results/`:
- `upload-load-results.json`
- `content-generation-results.json`
- `rate-limit-results.json`
- `stress-test-results.json`

### Consolidated Report

A comprehensive markdown report is generated at:
```
docs/LOAD_TEST_RESULTS.md
```

The report includes:
- Executive summary
- Metrics tables with pass/fail indicators
- Insights and analysis
- Recommendations for optimization
- Next steps

## Advanced Usage

### Custom Environment URL

```bash
export BASE_URL="https://custom-env.example.com"
./scripts/load-test.sh all staging
```

### Run Individual Scenario with k6 Directly

```bash
k6 run --env BASE_URL="http://localhost:3000" load-tests/scenarios/upload-load.js
```

### Docker Execution

```bash
docker run --rm -i grafana/k6 run --env BASE_URL="http://host.docker.internal:3000" - < load-tests/scenarios/upload-load.js
```

### Cloud Execution (k6 Cloud)

```bash
k6 cloud load-tests/scenarios/upload-load.js
```

## Interpreting Results

### ✅ Good Performance

- p(95) < 2000ms
- Error rate < 1%
- Throughput ≥ 100 req/s
- Success rate > 99%

### ⚠️ Needs Attention

- p(95) between 2000-5000ms
- Error rate between 1-5%
- Throughput between 50-100 req/s
- Success rate between 95-99%

### ❌ Critical Issues

- p(95) > 5000ms
- Error rate > 5%
- Throughput < 50 req/s
- Success rate < 95%

## Troubleshooting

### High Error Rates

1. Check application logs for errors
2. Verify database connections
3. Check AWS service limits
4. Review rate limiting configuration

### Slow Response Times

1. Enable APM tools for detailed tracing
2. Check database query performance
3. Review cache hit rates
4. Analyze network latency

### Rate Limiting Not Working

1. Verify rate limit middleware configuration
2. Check if rate limits are per-IP or global
3. Review rate limit window and max requests

## Best Practices

1. **Baseline First:** Run tests on a known-good version to establish baseline
2. **Incremental Load:** Start with lower load and gradually increase
3. **Monitor Resources:** Watch CPU, memory, and database metrics during tests
4. **Test Regularly:** Include load tests in CI/CD pipeline
5. **Document Changes:** Track performance changes over time
6. **Realistic Data:** Use production-like data sizes and patterns

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Load Tests

on:
  schedule:
    - cron: '0 2 * * 0'  # Weekly on Sunday at 2 AM
  workflow_dispatch:

jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install k6
        run: |
          sudo gpg -k
          sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
          echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
          sudo apt-get update
          sudo apt-get install k6
      - name: Run Load Tests
        run: ./scripts/load-test.sh all staging
        env:
          STAGING_URL: ${{ secrets.STAGING_URL }}
      - name: Upload Results
        uses: actions/upload-artifact@v3
        with:
          name: load-test-results
          path: |
            load-tests/results/
            docs/LOAD_TEST_RESULTS.md
```

## Resources

- [k6 Documentation](https://k6.io/docs/)
- [k6 Examples](https://k6.io/docs/examples/)
- [Performance Testing Best Practices](https://k6.io/docs/testing-guides/test-types/)
- [k6 Cloud](https://k6.io/cloud/)

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review k6 documentation
3. Check application logs
4. Contact the DevOps team
