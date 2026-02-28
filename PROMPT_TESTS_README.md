# Prompt Tests - Quick Reference Guide

## Overview
Comprehensive unit tests for TikTok and Twitter Thread prompt generators with **100% code coverage**.

## Test Files
- `src/__tests__/prompts/tiktok.test.ts` - 40 tests for TikTok prompt generator
- `src/__tests__/prompts/twitter-thread.test.ts` - 58 tests for Twitter Thread prompt generator

## Running Tests

### Run Both Test Files
```bash
npx jest --config=jest.prompts.config.js --testPathPattern="(tiktok|twitter-thread).test.ts"
```

### Run with Coverage
```bash
npx jest --config=jest.prompts.config.js --testPathPattern="(tiktok|twitter-thread).test.ts" --coverage
```

### Run TikTok Tests Only
```bash
npx jest --config=jest.prompts.config.js src/__tests__/prompts/tiktok.test.ts
```

### Run Twitter Thread Tests Only
```bash
npx jest --config=jest.prompts.config.js src/__tests__/prompts/twitter-thread.test.ts
```

### Run with Verbose Output
```bash
npx jest --config=jest.prompts.config.js --testPathPattern="(tiktok|twitter-thread).test.ts" --verbose
```

### Watch Mode (for development)
```bash
npx jest --config=jest.prompts.config.js --testPathPattern="(tiktok|twitter-thread).test.ts" --watch
```

## Test Results Summary

### ✅ TikTok Prompt Tests (40 tests)
- Basic Functionality: 4 tests
- Domain-Specific Content: 4 tests
- Keyword Handling: 4 tests
- Trending Content: 3 tests
- TikTok-Specific Requirements: 7 tests
- Transcript Handling: 5 tests
- Language Support: 4 tests
- Output Format Requirements: 2 tests
- Edge Cases: 5 tests
- Integration Tests: 2 tests

### ✅ Twitter Thread Prompt Tests (58 tests)
- Basic Functionality: 6 tests
- Thread Length Variations: 5 tests
- Domain-Specific Content: 4 tests
- Keyword Handling: 5 tests
- Twitter-Specific Requirements: 6 tests
- Thread Structure: 3 tests
- Transcript Handling: 7 tests
- Language Support: 5 tests
- Output Format Requirements: 3 tests
- Edge Cases: 6 tests
- Integration Tests: 3 tests
- Readability and Formatting: 4 tests

## Coverage Report
```
Test Suites: 2 passed, 2 total
Tests:       98 passed, 98 total
Coverage:    100% (statements, branches, functions, lines)
```

## What's Tested

### TikTok Prompt Generator
✅ Transcript truncation (800 chars)
✅ Domain specialization
✅ Keyword integration
✅ Language support (English, Spanish, French, German, Japanese)
✅ Trending element (optional)
✅ Hook requirements (1-second max)
✅ Caption requirements (150 chars max)
✅ Hashtag strategy (#FYP, niche, trending)
✅ Text overlays with timing
✅ CTA requirements
✅ Viral formula structure
✅ Script timing (0-25s breakdown)
✅ JSON output format
✅ Edge cases (empty inputs, special characters, Unicode)

### Twitter Thread Prompt Generator
✅ Transcript truncation (1500 chars)
✅ Domain specialization
✅ Keyword integration
✅ Language support (English, Spanish, French, German, Portuguese, Japanese)
✅ Thread length variations (1-100 tweets, default: 10)
✅ 280-character limit per tweet
✅ Thread emoji (🧵) in first tweet
✅ Hook requirements (scroll-stopper)
✅ Tweet structure (hook, context, value, summary, CTA)
✅ Hashtag guidelines (2-3 per tweet)
✅ Media suggestions
✅ Engagement tactics
✅ Viral elements
✅ JSON output format
✅ Edge cases (empty inputs, special characters, Unicode, URLs, mentions)

## Configuration
Tests use a separate Jest configuration file (`jest.prompts.config.js`) that:
- Isolates prompt tests from other tests
- Excludes AWS service dependencies
- Focuses coverage on prompt files only
- Sets 80% coverage threshold (exceeded with 100%)

## Troubleshooting

### Issue: Tests fail with AWS mock errors
**Solution**: Use `jest.prompts.config.js` instead of the default `jest.config.js`

### Issue: Coverage shows low percentage
**Solution**: Use the `--collectCoverageFrom` flag to target specific files:
```bash
npx jest --config=jest.prompts.config.js \
  --testPathPattern="(tiktok|twitter-thread).test.ts" \
  --coverage \
  --collectCoverageFrom="src/prompts/tiktok.prompt.ts" \
  --collectCoverageFrom="src/prompts/twitter-thread.prompt.ts"
```

### Issue: Other test files interfere
**Solution**: Use `--testPathPattern` to run only specific tests:
```bash
npx jest --config=jest.prompts.config.js --testPathPattern="(tiktok|twitter-thread).test.ts"
```

## Adding New Tests

To add new test cases:

1. Open the relevant test file
2. Add a new `it()` or `test()` block within the appropriate `describe()` section
3. Follow the existing pattern:
```typescript
it('should handle new scenario', () => {
  const input: TikTokInput = {
    transcript: 'Test content',
    domain: 'test',
    keywords: ['test'],
  };

  const result = generateTikTokPrompt(input);

  expect(result).toContain('expected content');
});
```

## Best Practices

1. **Run tests before committing**: Ensure all tests pass
2. **Maintain 100% coverage**: Add tests for any new functionality
3. **Test edge cases**: Include tests for empty inputs, special characters, etc.
4. **Use descriptive test names**: Make it clear what each test validates
5. **Group related tests**: Use `describe()` blocks to organize tests logically

## Additional Resources

- Full test summary: See `TEST_SUMMARY.md`
- Source files:
  - `src/prompts/tiktok.prompt.ts`
  - `src/prompts/twitter-thread.prompt.ts`
- Test files:
  - `src/__tests__/prompts/tiktok.test.ts`
  - `src/__tests__/prompts/twitter-thread.test.ts`
