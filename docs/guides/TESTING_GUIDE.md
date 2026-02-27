# 🧪 Testing Guide

**Comprehensive testing strategy for the Content Intelligence Platform**

---

## Testing Pyramid

```
        /\
       /E2E\         ← 10% (slow, expensive)
      /------\
     /Integration\   ← 30% (medium speed)
    /------------\
   /  Unit Tests  \  ← 60% (fast, cheap)
  /----------------\
```

---

## 1. Unit Tests (60%)

**What:** Test individual functions in isolation

**Tools:**
- Jest (JavaScript)
- pytest (Python)

**Example:**

```javascript
// src/utils/transcript.js
function extractKeywords(text) {
  return text.split(' ')
    .filter(word => word.length > 5)
    .slice(0, 10);
}

// src/utils/transcript.test.js
describe('extractKeywords', () => {
  it('should extract words longer than 5 chars', () => {
    const text = 'Hello world testing keywords extraction';
    const result = extractKeywords(text);
    expect(result).toContain('testing');
    expect(result).toContain('keywords');
    expect(result).not.toContain('world');
  });
});
```

**Run:**
```bash
npm test
```

---

## 2. Integration Tests (30%)

**What:** Test multiple components working together

**Tools:**
- Supertest (API testing)
- LocalStack (AWS mocking)

**Example:**

```javascript
// tests/integration/upload.test.js
const request = require('supertest');
const app = require('../src/app');

describe('POST /api/upload', () => {
  it('should upload video and return content ID', async () => {
    const response = await request(app)
      .post('/api/upload')
      .attach('file', 'tests/fixtures/video.mp4')
      .expect(200);
    
    expect(response.body).toHaveProperty('id');
    expect(response.body.status).toBe('processing');
  });
});
```

**Run:**
```bash
npm run test:integration
```

---

## 3. E2E Tests (10%)

**What:** Test complete user flows in browser

**Tools:**
- Playwright
- Cypress

**Example:**

```javascript
// tests/e2e/upload-flow.spec.js
const { test, expect } = require('@playwright/test');

test('user can upload and analyze video', async ({ page }) => {
  // 1. Go to homepage
  await page.goto('http://localhost:3000');
  
  // 2. Click upload button
  await page.click('button:has-text("Upload")');
  
  // 3. Upload file
  await page.setInputFiles('input[type="file"]', 'tests/fixtures/video.mp4');
  
  // 4. Wait for processing
  await page.waitForSelector('.status:has-text("Complete")');
  
  // 5. Verify results
  const results = await page.textContent('.results');
  expect(results).toContain('YouTube Short');
});
```

**Run:**
```bash
npm run test:e2e
```

---

## Testing with FREE Tools

### GitHub Copilot Testing (FREE)

```javascript
// Mock GitHub Copilot in tests
jest.mock('../src/services/mockAI', () => ({
  analyze: jest.fn().mockResolvedValue({
    summary: 'Test summary',
    keywords: ['test', 'mock']
  })
}));
```

### LocalStack Testing (FREE AWS)

```javascript
// tests/setup.js
process.env.AWS_ENDPOINT = 'http://localhost:4566';
process.env.AWS_ACCESS_KEY_ID = 'test';
process.env.AWS_SECRET_ACCESS_KEY = 'test';

// Now all AWS SDK calls go to LocalStack (FREE!)
```

---

## Test Coverage Goals

**Minimum Coverage:**
- Unit tests: 80%
- Integration tests: 60%
- E2E tests: Critical paths only

**Check Coverage:**
```bash
npm run test:coverage
```

**Output:**
```
File                | % Stmts | % Branch | % Funcs | % Lines
--------------------|---------|----------|---------|--------
All files           |   85.2  |   78.4   |   82.1  |   85.2
 src/utils          |   92.1  |   88.3   |   90.0  |   92.1
 src/services       |   78.5  |   70.2   |   75.0  |   78.5
```

---

## Testing Checklist

### Before Committing

- [ ] All tests pass (`npm test`)
- [ ] Coverage > 80% (`npm run test:coverage`)
- [ ] No console.log() left in code
- [ ] Linter passes (`npm run lint`)

### Before PR

- [ ] Integration tests pass
- [ ] E2E tests pass (critical paths)
- [ ] Manual testing done
- [ ] Screenshots/video of feature

### Before Merge to Main

- [ ] All CI checks pass
- [ ] Code reviewed by 1+ person
- [ ] Documentation updated
- [ ] Changelog updated

---

## CI/CD Testing

**GitHub Actions:**

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install dependencies
        run: npm install
      
      - name: Run unit tests
        run: npm test
      
      - name: Run integration tests
        run: npm run test:integration
      
      - name: Check coverage
        run: npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## Performance Testing

**Load Testing with k6 (FREE):**

```javascript
// tests/load/upload.js
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 10,        // 10 virtual users
  duration: '30s' // for 30 seconds
};

export default function() {
  let response = http.post('http://localhost:3000/api/upload', {
    file: open('video.mp4', 'b')
  });
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 2s': (r) => r.timings.duration < 2000
  });
}
```

**Run:**
```bash
k6 run tests/load/upload.js
```

---

## Security Testing

**OWASP ZAP (FREE):**

```bash
# Start ZAP proxy
docker run -p 8080:8080 owasp/zap2docker-stable

# Run security scan
zap-cli quick-scan http://localhost:3000
```

**Check for:**
- SQL injection
- XSS vulnerabilities
- CSRF tokens
- Authentication bypass
- Sensitive data exposure

---

## Manual Testing Checklist

### Upload Feature

- [ ] Upload video (MP4, MOV)
- [ ] Upload audio (MP3, WAV)
- [ ] Upload text (TXT, PDF)
- [ ] Upload large file (>100MB)
- [ ] Upload invalid format
- [ ] Upload with no internet
- [ ] Cancel upload mid-way

### Analysis Feature

- [ ] Analyze video content
- [ ] Generate YouTube Short
- [ ] Generate Instagram Reel
- [ ] Generate Twitter thread
- [ ] Generate LinkedIn post
- [ ] Multi-language support
- [ ] Domain-specific analysis

### UI/UX

- [ ] Mobile responsive
- [ ] Dark mode works
- [ ] Accessibility (screen reader)
- [ ] Keyboard navigation
- [ ] Loading states
- [ ] Error states
- [ ] Empty states

---

## Bug Reporting Template

```markdown
## Bug Report

**Title:** Upload fails for MP4 files > 100MB

**Steps to Reproduce:**
1. Go to homepage
2. Click "Upload"
3. Select video.mp4 (150MB)
4. Click "Upload"

**Expected:**
Upload should work with progress bar

**Actual:**
Upload fails with "Request timeout" error

**Environment:**
- Browser: Chrome 120
- OS: macOS 14
- Network: WiFi

**Screenshots:**
[Attach screenshot]

**Logs:**
```
Error: Request timeout after 30s
  at upload.js:45
```

**Priority:** High (blocks main feature)
```

---

## Testing Schedule

**Daily:**
- Run unit tests before every commit
- Run integration tests before pushing

**Weekly:**
- Full E2E test suite
- Performance testing
- Security scan

**Before Demo:**
- Complete manual testing
- Load testing with expected traffic
- Cross-browser testing
- Mobile testing

---

**Remember: Test with FREE tools during development. Use AWS only for final validation!**
