# Regional Network Tests - Quick Start Guide

## 🚀 Quick Start

### Run All Regional Tests
```bash
npm test regional.test.ts
```

### Run with Coverage
```bash
npm test -- --coverage regional.test.ts
```

## 📋 Test Categories

### 1. Creator Discovery
Test creator discovery by region and language:
```bash
npm test -- -t "Creator Discovery"
```

### 2. Matching Algorithm
Test matching accuracy (>80% target):
```bash
npm test -- -t "Matching Algorithm Accuracy"
```

### 3. Collaboration Success
Test collaboration success rate (>80% target):
```bash
npm test -- -t "Collaboration Success Rate"
```

### 4. Edge Cases
Test error handling and edge cases:
```bash
npm test -- -t "Edge Cases"
```

### 5. Caching
Test caching behavior:
```bash
npm test -- -t "Caching Behavior"
```

### 6. Quality Metrics
Test matching quality metrics:
```bash
npm test -- -t "Matching Quality Metrics"
```

## 🎯 Key Test Scenarios

### Test Regional Hubs
All 4 regional hubs (North, South, East, West):
```bash
npm test -- -t "verify all 4 regional hubs"
```

### Test Indian Languages
All 9 Indian languages (hi, bn, te, mr, ta, gu, kn, ml, pa):
```bash
npm test -- -t "verify all 9 Indian languages"
```

### Test Local Collaboration
Local collaboration matching:
```bash
npm test -- -t "Local Collaboration Matching"
```

### Test Integration
End-to-end integration tests:
```bash
npm test -- -t "Integration Tests"
```

## 📊 Expected Results

### Matching Accuracy
- ✅ Region matching: >80%
- ✅ Language matching: >80%
- ✅ Combined matching: >80%

### Collaboration Success
- ✅ Overall success rate: >80%
- ✅ Regional collaboration: >80%
- ✅ Language-based: >80%
- ✅ Local collaboration: >80%

### Performance
- ✅ Response time: <5 seconds
- ✅ Concurrent requests: 50+
- ✅ Cache improvement: Measurable

## 🔍 Test Structure

```
regional.test.ts
├── Creator Discovery by Region (5 tests)
├── Creator Discovery by Language (4 tests)
├── Combined Region + Language Filtering (5 tests)
├── Collaboration Request Creation (5 tests)
├── Matching Algorithm Accuracy (4 tests)
├── Collaboration Success Rate (4 tests)
├── Edge Cases (8 tests)
├── Caching Behavior (5 tests)
├── Creator Profile Completeness (6 tests)
├── Matching Quality Metrics (7 tests)
├── Local Collaboration Matching (5 tests)
└── Integration Tests (4 tests)

Total: 62 tests
```

## 🧪 Sample Test Output

```
PASS  src/__tests__/regional.test.ts
  Regional Network Matching Algorithm Tests
    Creator Discovery by Region
      ✓ should discover creators in North region (45ms)
      ✓ should discover creators in South region (32ms)
      ✓ should discover creators in East region (28ms)
      ✓ should discover creators in West region (31ms)
      ✓ should verify all 4 regional hubs return data (89ms)
    Creator Discovery by Language
      ✓ should discover creators by Hindi language (35ms)
      ✓ should discover creators by Tamil language (29ms)
      ✓ should discover creators by Bengali language (27ms)
      ✓ should verify all 9 Indian languages return data (156ms)
    Matching Algorithm Accuracy (>80%)
      ✓ should achieve >80% matching accuracy for region-based matching (78ms)
      ✓ should achieve >80% matching accuracy for language-based matching (142ms)
      ✓ should achieve >80% accuracy for combined region+language matching (125ms)
    ...

Test Suites: 1 passed, 1 total
Tests:       62 passed, 62 total
Time:        8.234s
```

## 🐛 Debugging Failed Tests

### View Detailed Output
```bash
npm test -- --verbose regional.test.ts
```

### Run Single Test
```bash
npm test -- -t "should discover creators in North region"
```

### Debug Mode
```bash
node --inspect-brk node_modules/.bin/jest regional.test.ts
```

## 📝 API Endpoints Tested

### GET /api/regional/creators
```bash
# Test manually with curl
curl "http://localhost:3000/api/regional/creators?region=North&language=hi"
```

### POST /api/regional/collab
```bash
# Test manually with curl
curl -X POST http://localhost:3000/api/regional/collab \
  -H "Content-Type: application/json" \
  -d '{"fromUserId":"user-1","toUserId":"user-2","message":"Let'\''s collaborate!"}'
```

## 🔧 Troubleshooting

### Cache Issues
If tests fail due to cache:
```bash
# Clear cache before running
npm test -- --clearCache
npm test regional.test.ts
```

### Port Conflicts
If port 3000 is in use:
```bash
# Tests use in-memory Express app, no port needed
# But if running actual server, change PORT in .env
```

### Timeout Issues
If tests timeout:
```bash
# Increase timeout
npm test -- --testTimeout=10000 regional.test.ts
```

## 📈 Coverage Report

Generate coverage report:
```bash
npm test -- --coverage --coverageDirectory=coverage regional.test.ts
```

View coverage in browser:
```bash
# Open coverage/lcov-report/index.html
```

## ✅ Checklist

Before committing:
- [ ] All tests pass
- [ ] Matching accuracy >80%
- [ ] Collaboration success >80%
- [ ] No console errors
- [ ] Coverage >80%
- [ ] Edge cases handled
- [ ] Documentation updated

## 🚦 CI/CD Integration

Tests run automatically on:
- Pull requests
- Commits to main branch
- Scheduled daily runs

## 📚 Related Documentation

- [Test Summary](./REGIONAL_TEST_SUMMARY.md)
- [API Documentation](../../docs/API.md)
- [Regional Network Service](../services/regional-network.service.ts)
- [Main Test README](./README.md)

## 💡 Tips

1. **Run tests frequently** during development
2. **Use watch mode** for rapid feedback
3. **Check coverage** to find untested code
4. **Test edge cases** thoroughly
5. **Keep tests independent** and isolated
6. **Mock external dependencies** properly
7. **Use descriptive test names** for clarity

## 🎓 Learning Resources

- [Jest Documentation](https://jestjs.io/)
- [Supertest Guide](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)

---

**Need Help?** Check the [Test Summary](./REGIONAL_TEST_SUMMARY.md) for detailed information.
