# Vernacular Translation Tests - Quick Start Guide

## Overview
Quick reference guide for running and understanding the vernacular translation quality tests.

## Quick Run Commands

### Run All Vernacular Tests
```bash
npm test -- src/__tests__/vernacular.test.ts
```

### Run with Verbose Output
```bash
npm test -- src/__tests__/vernacular.test.ts --verbose
```

### Run Specific Test Suite
```bash
# Native speaker validation tests
npm test -- src/__tests__/vernacular.test.ts -t "Native Speaker Validation"

# Cultural adaptation tests
npm test -- src/__tests__/vernacular.test.ts -t "Cultural Context Adaptation"

# Script rendering tests
npm test -- src/__tests__/vernacular.test.ts -t "Native Script Rendering"

# All 9 language tests
npm test -- src/__tests__/vernacular.test.ts -t "Translation Support"
```

### Run Tests for Specific Language
```bash
# Hindi tests
npm test -- src/__tests__/vernacular.test.ts -t "Hindi"

# Tamil tests
npm test -- src/__tests__/vernacular.test.ts -t "Tamil"

# Bengali tests
npm test -- src/__tests__/vernacular.test.ts -t "Bengali"
```

## Test Structure

### 116 Tests Organized in 13 Suites

1. **Translation Support for 9 Languages** (37 tests)
   - Tests basic translation for all 9 Indian languages
   - Validates simple, marketing, cultural, and long content

2. **Native Speaker Validation** (4 tests)
   - Simulates >85% native speaker approval
   - Validates quality metrics

3. **Cultural Context Adaptation** (5 tests)
   - Festival adaptations
   - Currency conversions
   - Measurement conversions

4. **Regional Idioms** (7 tests)
   - English idiom translations
   - Meaning preservation

5. **Festival and Cultural Events** (7 tests)
   - Major Indian festivals
   - Regional variations

6. **Native Script Rendering** (13 tests)
   - All 8 native scripts
   - Special character handling

7. **Translation Quality** (5 tests)
   - Confidence scores
   - Consistency checks

8. **Regional Variations** (5 tests)
   - North, South, East, West India

9. **Edge Cases** (12 tests)
   - Error handling
   - Special content types

10. **Translation Consistency** (4 tests)
    - Batch translations
    - Terminology consistency

11. **Performance** (4 tests)
    - Speed benchmarks
    - Concurrent handling

12. **Real-World Scenarios** (8 tests)
    - E-commerce, marketing, social media

13. **Response Validation** (5 tests)
    - API response structure

## 9 Indian Languages Covered

| Language | Code | Script | Speakers |
|----------|------|--------|----------|
| Hindi | hi | Devanagari | 600M |
| Bengali | bn | Bengali | 265M |
| Tamil | ta | Tamil | 80M |
| Telugu | te | Telugu | 95M |
| Marathi | mr | Devanagari | 83M |
| Gujarati | gu | Gujarati | 56M |
| Kannada | kn | Kannada | 44M |
| Malayalam | ml | Malayalam | 38M |
| Punjabi | pa | Gurmukhi | 33M |

## API Endpoint

### POST /api/vernacular/translate

**Request**:
```json
{
  "content": "Hello, how are you?",
  "targetLanguage": "hi"
}
```

**Response**:
```json
{
  "original": "Hello, how are you?",
  "translated": "[HI] Hello, how are you?",
  "targetLanguage": "hi",
  "confidence": 0.95,
  "culturalAdaptations": [
    "Replaced \"Thanksgiving\" with \"Diwali\"",
    "Converted USD to INR"
  ]
}
```

## Key Test Features

### Native Speaker Validator
Simulates native speaker approval ratings:
```typescript
const approvalScore = NativeSpeakerValidator.validate(translation, 'hi');
// Returns: 85-100 (percentage)
```

### Cultural Elements Tested
- **Festivals**: Diwali, Holi, Pongal, Onam, Durga Puja
- **Currency**: USD → INR (₹)
- **Measurements**: Miles → Kilometers
- **Idioms**: 5+ common English idioms

### Quality Thresholds
- ✅ Confidence Score: >85%
- ✅ Native Speaker Approval: >85%
- ✅ Translation Speed: <1 second
- ✅ Concurrent Handling: 10+ requests

## Common Test Patterns

### Testing a Single Language
```typescript
const response = await request(app)
  .post('/api/vernacular/translate')
  .send({
    content: 'Hello, how are you?',
    targetLanguage: 'hi',
  })
  .expect(200);

expect(response.body.confidence).toBeGreaterThanOrEqual(0.85);
```

### Testing All 9 Languages
```typescript
for (const [key, lang] of Object.entries(INDIAN_LANGUAGES)) {
  const response = await request(app)
    .post('/api/vernacular/translate')
    .send({
      content: 'Welcome!',
      targetLanguage: lang.code,
    })
    .expect(200);
}
```

### Testing Cultural Adaptation
```typescript
const response = await request(app)
  .post('/api/vernacular/translate')
  .send({
    content: 'Join our Thanksgiving sale!',
    targetLanguage: 'hi',
  })
  .expect(200);

expect(response.body.culturalAdaptations).toBeDefined();
// Should adapt Thanksgiving → Diwali
```

## Expected Test Results

```
PASS src/__tests__/vernacular.test.ts
  VernacularTranslationService
    ✓ Translation Support for 9 Indian Languages (37 tests)
    ✓ Native Speaker Validation (4 tests)
    ✓ Cultural Context Adaptation (5 tests)
    ✓ Regional Idioms and Expressions (7 tests)
    ✓ Festival and Cultural Events (7 tests)
    ✓ Native Script Rendering (13 tests)
    ✓ Translation Quality and Accuracy (5 tests)
    ✓ Regional Variations (5 tests)
    ✓ Edge Cases and Error Handling (12 tests)
    ✓ Translation Consistency (4 tests)
    ✓ Performance and Scalability (4 tests)
    ✓ Integration and Real-World Scenarios (8 tests)
    ✓ Response Structure Validation (5 tests)

Test Suites: 1 passed, 1 total
Tests:       116 passed, 116 total
```

## Troubleshooting

### Tests Failing?

1. **Check route is mounted**:
   ```typescript
   app.use('/api/vernacular', vernacularRoute);
   ```

2. **Verify request body parsing**:
   ```typescript
   app.use(express.json());
   ```

3. **Check language codes**:
   - Use 2-letter ISO codes: hi, bn, ta, te, mr, gu, kn, ml, pa

### Performance Issues?

- Tests should complete in <10 seconds
- Individual translations should be <1 second
- Concurrent tests handle 10+ simultaneous requests

### Mock vs Production

Current tests use mock translation service:
```typescript
// Mock response format
{
  translated: `[${targetLanguage.toUpperCase()}] ${content}`,
  confidence: 0.95,
  culturalAdaptations: [...]
}
```

For production, replace with real AI translation service.

## Test Coverage Goals

- ✅ **Language Coverage**: 9/9 languages (100%)
- ✅ **Quality Threshold**: >85% confidence
- ✅ **Native Approval**: >85% simulated approval
- ✅ **Cultural Adaptation**: 100% coverage
- ✅ **Script Rendering**: All 8 native scripts
- ✅ **Edge Cases**: 12 scenarios covered
- ✅ **Performance**: <1s per translation

## Next Steps

1. **Run the tests**: `npm test -- src/__tests__/vernacular.test.ts`
2. **Review results**: Check all 116 tests pass
3. **Explore test file**: `src/__tests__/vernacular.test.ts`
4. **Read summary**: `src/__tests__/VERNACULAR_TEST_SUMMARY.md`
5. **Implement production**: Replace mock with real translation service

## Files

- **Test File**: `src/__tests__/vernacular.test.ts`
- **Route File**: `src/routes/vernacular.route.ts`
- **Summary**: `src/__tests__/VERNACULAR_TEST_SUMMARY.md`
- **Quick Start**: `src/__tests__/VERNACULAR_TESTS_QUICK_START.md` (this file)

## Support

For questions or issues:
1. Check test output for specific failures
2. Review VERNACULAR_TEST_SUMMARY.md for detailed coverage
3. Examine test file for implementation examples
4. Verify API endpoint is correctly configured

---

**Quick Command**: `npm test -- src/__tests__/vernacular.test.ts --verbose`

**Expected Result**: ✅ 116 tests passing

**Time**: ~5-10 seconds
