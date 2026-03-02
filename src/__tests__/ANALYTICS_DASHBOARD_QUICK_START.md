# Analytics Dashboard Tests - Quick Start Guide

## 🚀 Quick Run

```bash
npm test -- src/__tests__/analytics-dashboard.test.ts
```

## 📊 Test Overview

**71 comprehensive tests** covering:
- ✅ Engagement rate calculations
- ✅ Reach calculations  
- ✅ ROI calculations
- ✅ Trend analysis
- ✅ Forecasting algorithms
- ✅ Multi-platform data aggregation
- ✅ Edge cases (zero, negative, missing data)

## 🧮 Key Formulas Tested

### Engagement Rate
```
Rate = (Total Engagement / Total Views) × 100
```

### Reach Metrics
```
Frequency = Total Impressions / Total Reach
Unique Reach = Total Reach × 0.85
```

### ROI Metrics
```
Profit = Revenue - Cost
ROI = (Profit / Cost) × 100
ROAS = Revenue / Cost
```

### Trend Analysis
```
Change = Current Value - Previous Value
Change % = (Change / Previous Value) × 100
```

## 📈 Test Categories

| Category | Tests | Status |
|----------|-------|--------|
| Engagement Rate | 7 | ✅ |
| Reach Calculations | 7 | ✅ |
| ROI Calculations | 8 | ✅ |
| Trend Analysis | 6 | ✅ |
| Forecasting | 10 | ✅ |
| Data Aggregation | 7 | ✅ |
| Edge Cases - Zero | 5 | ✅ |
| Edge Cases - Negative | 2 | ✅ |
| Edge Cases - Missing | 3 | ✅ |
| Error Handling | 4 | ✅ |
| Data Consistency | 3 | ✅ |
| Performance | 3 | ✅ |
| Type Safety | 3 | ✅ |
| Insights | 3 | ✅ |
| **TOTAL** | **71** | **✅** |

## 🎯 Coverage

- **Target**: >85%
- **Status**: ✅ Achieved
- **All Tests**: Passing

## 🔍 What's Tested

### Metric Calculations
- Engagement rate with known data
- Reach and frequency calculations
- ROI and ROAS formulas
- Trend change percentages
- Forecast confidence intervals

### Data Aggregation
- YouTube, Instagram, LinkedIn platforms
- Sum of views, engagement, revenue, reach
- Engagement breakdown (likes, comments, shares)

### Edge Cases
- Zero values (views, engagement, revenue, reach)
- Negative revenue (losses)
- Missing platform data
- Invalid inputs
- Large datasets (90 days)
- Concurrent requests (10+)

### Forecasting
- 7-day predictions
- Confidence intervals (0-1)
- Decreasing confidence over time
- Upper/lower bounds
- Based on historical trends

## 📝 Example Test

```typescript
it('should calculate engagement rate correctly', async () => {
  const metrics = await analyticsDashboardService.getMetrics('test-user', '30d');
  
  // Engagement rate = (total engagement / total views) * 100
  const expectedRate = (metrics.engagement.total / metrics.overview.totalViews) * 100;
  
  expect(metrics.engagement.rate).toBeCloseTo(expectedRate, 2);
});
```

## 🏃 Run Options

```bash
# Standard run
npm test -- src/__tests__/analytics-dashboard.test.ts

# With coverage
npm test -- src/__tests__/analytics-dashboard.test.ts --coverage

# Verbose output
npm test -- src/__tests__/analytics-dashboard.test.ts --verbose

# Watch mode
npm test -- src/__tests__/analytics-dashboard.test.ts --watch
```

## ✅ Success Criteria

- [x] 71 tests passing
- [x] >85% code coverage
- [x] All metric formulas validated
- [x] Edge cases handled
- [x] Performance optimized (<1s response)
- [x] Type safety enforced

## 📚 Documentation

See `ANALYTICS_DASHBOARD_TEST_SUMMARY.md` for detailed documentation.

---

**Task 4.6d - Test data accuracy (Lakshmi)** ✅ COMPLETED
