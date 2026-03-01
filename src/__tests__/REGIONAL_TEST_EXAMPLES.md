# Regional Network Tests - Example Test Runs

## 📋 Example Test Scenarios

### Example 1: Test North Region Hindi Creators

**Scenario:** Find Hindi-speaking creators in North India

```bash
npm test -- -t "should filter creators by North region and Hindi language"
```

**Expected Result:**
```json
{
  "region": "North",
  "language": "hi",
  "creators": [
    {
      "id": "c1",
      "name": "Creator 1",
      "region": "North",
      "language": "hi",
      "followers": 50000
    }
  ]
}
```

### Example 2: Test South Region Tamil Creators

**Scenario:** Find Tamil-speaking creators in South India

```bash
npm test -- -t "should filter creators by South region and Tamil language"
```

**Expected Result:**
```json
{
  "region": "South",
  "language": "ta",
  "creators": [
    {
      "id": "c2",
      "name": "Creator 2",
      "region": "South",
      "language": "ta",
      "followers": 75000
    }
  ]
}
```

### Example 3: Test Collaboration Request

**Scenario:** Create collaboration between two creators

```bash
npm test -- -t "should create collaboration request successfully"
```

**Request:**
```json
{
  "fromUserId": "user-1",
  "toUserId": "user-2",
  "message": "Let's collaborate on a regional content project!"
}
```

**Expected Response:**
```json
{
  "collabId": "collab_1234567890",
  "fromUserId": "user-1",
  "toUserId": "user-2",
  "status": "pending",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Example 4: Test Matching Accuracy

**Scenario:** Verify >80% matching accuracy

```bash
npm test -- -t "should achieve >80% matching accuracy"
```

**Test Process:**
1. Test all 4 regions (North, South, East, West)
2. Test all 9 languages (hi, bn, te, mr, ta, gu, kn, ml, pa)
3. Calculate accuracy: (successful_matches / total_matches) * 100
4. Assert accuracy >= 80%

**Expected Output:**
```
✓ Region matching accuracy: 100% (4/4)
✓ Language matching accuracy: 100% (9/9)
✓ Combined matching accuracy: 100% (8/8)
```

### Example 5: Test Collaboration Success Rate

**Scenario:** Verify >80% collaboration success rate

```bash
npm test -- -t "should achieve >80% successful collaboration rate"
```

**Test Process:**
1. Create 100 collaboration requests
2. Count successful requests (status 200 + collabId present)
3. Calculate success rate: (successful / total) * 100
4. Assert success_rate >= 80%

**Expected Output:**
```
✓ Collaboration success rate: 100% (100/100)
```

## 🎯 Regional Hub Examples

### North Region
**Languages:** Hindi (hi), Punjabi (pa)

```bash
# Test North + Hindi
curl "http://localhost:3000/api/regional/creators?region=North&language=hi"

# Test North + Punjabi
curl "http://localhost:3000/api/regional/creators?region=North&language=pa"
```

### South Region
**Languages:** Tamil (ta), Telugu (te), Kannada (kn), Malayalam (ml)

```bash
# Test South + Tamil
curl "http://localhost:3000/api/regional/creators?region=South&language=ta"

# Test South + Telugu
curl "http://localhost:3000/api/regional/creators?region=South&language=te"
```

### East Region
**Languages:** Bengali (bn)

```bash
# Test East + Bengali
curl "http://localhost:3000/api/regional/creators?region=East&language=bn"
```

### West Region
**Languages:** Gujarati (gu), Marathi (mr)

```bash
# Test West + Gujarati
curl "http://localhost:3000/api/regional/creators?region=West&language=gu"

# Test West + Marathi
curl "http://localhost:3000/api/regional/creators?region=West&language=mr"
```

## 🔍 Edge Case Examples

### Example 6: Invalid Region

```bash
npm test -- -t "should handle invalid region gracefully"
```

**Request:**
```
GET /api/regional/creators?region=InvalidRegion
```

**Expected:** Returns 200 with empty or default creators array

### Example 7: No Parameters

```bash
npm test -- -t "should handle request with no region or language"
```

**Request:**
```
GET /api/regional/creators
```

**Expected:** Returns 200 with all creators or default response

### Example 8: Same User Collaboration

```bash
npm test -- -t "should handle collaboration with same user"
```

**Request:**
```json
{
  "fromUserId": "user-1",
  "toUserId": "user-1"
}
```

**Expected:** Returns 200 or 400 (implementation dependent)

## 📊 Performance Examples

### Example 9: Concurrent Requests

**Scenario:** Test 50 concurrent requests

```bash
npm test -- -t "should verify matching algorithm handles scale"
```

**Test Process:**
1. Create 50 simultaneous requests
2. Mix of different regions and languages
3. Measure success rate
4. Assert success_rate >= 80%

### Example 10: Response Time

**Scenario:** Verify response time <5 seconds

```bash
npm test -- -t "should verify response time is acceptable"
```

**Test Process:**
1. Record start time
2. Make API request
3. Record end time
4. Calculate response_time = end - start
5. Assert response_time < 5000ms

## 🧪 Integration Example

### Example 11: Full Workflow

**Scenario:** Complete discover → match → collaborate workflow

```bash
npm test -- -t "should complete full workflow"
```

**Steps:**
1. **Discover:** GET /api/regional/creators?region=North&language=hi
2. **Match:** Identify compatible creators from results
3. **Collaborate:** POST /api/regional/collab with creator IDs

**Expected Flow:**
```
Step 1: Discovery
  → GET /api/regional/creators?region=North&language=hi
  ← 200 OK with creators array

Step 2: Matching
  → Analyze creators for compatibility
  ← Select creator-1 and creator-2

Step 3: Collaboration
  → POST /api/regional/collab
     { fromUserId: "creator-1", toUserId: "creator-2" }
  ← 200 OK with collabId and status: "pending"
```

## 📈 Quality Metrics Examples

### Example 12: Precision Measurement

**Scenario:** Measure matching precision

```bash
npm test -- -t "should measure precision of region matching"
```

**Calculation:**
```
precision = (matching_creators / total_creators) * 100

Example:
- Total creators returned: 10
- Creators matching target region: 9
- Precision: (9/10) * 100 = 90%
- Assert: 90% >= 80% ✓
```

### Example 13: Overall Quality Score

**Scenario:** Calculate overall matching quality

```bash
npm test -- -t "should calculate overall matching quality score"
```

**Test Scenarios:**
```javascript
[
  { region: 'North', language: 'hi' },  // Score: 100
  { region: 'South', language: 'ta' },  // Score: 100
  { region: 'East', language: 'bn' },   // Score: 100
  { region: 'West', language: 'gu' },   // Score: 100
  // ... 5 more scenarios
]

Average Quality = Total Score / Number of Scenarios
Expected: >= 80%
```

## 🎓 Learning Examples

### Example 14: Understanding Cache

**Scenario:** See how caching works

```bash
npm test -- -t "should cache creator discovery results"
```

**Process:**
```
Request 1: GET /api/regional/creators?region=North
  → Cache MISS
  → Fetch from service
  → Store in cache
  → Return response (slower)

Request 2: GET /api/regional/creators?region=North
  → Cache HIT
  → Return from cache
  → Return response (faster)
```

### Example 15: Profile Validation

**Scenario:** Validate creator profile structure

```bash
npm test -- -t "should verify creator profiles have required fields"
```

**Validation Checks:**
```javascript
✓ Has 'id' field (string)
✓ Has 'name' field (string, non-empty)
✓ Has 'region' field (string, valid region)
✓ Has 'language' field (string, valid language code)
✓ Has 'followers' field (number, >= 0)
```

## 🚀 Quick Test Commands

```bash
# Run all tests
npm test regional.test.ts

# Run specific category
npm test -- -t "Creator Discovery"
npm test -- -t "Matching Algorithm"
npm test -- -t "Collaboration Success"
npm test -- -t "Edge Cases"
npm test -- -t "Caching Behavior"

# Run with coverage
npm test -- --coverage regional.test.ts

# Run in watch mode
npm test -- --watch regional.test.ts

# Run verbose
npm test -- --verbose regional.test.ts

# Run single test
npm test -- -t "should discover creators in North region"
```

## 📝 Manual Testing Examples

### Using curl

```bash
# Test creator discovery
curl -X GET "http://localhost:3000/api/regional/creators?region=North&language=hi"

# Test collaboration
curl -X POST http://localhost:3000/api/regional/collab \
  -H "Content-Type: application/json" \
  -d '{
    "fromUserId": "user-1",
    "toUserId": "user-2",
    "message": "Let'\''s collaborate!"
  }'
```

### Using Postman

**Collection:** Regional Network API

**Request 1: Get Creators**
- Method: GET
- URL: `http://localhost:3000/api/regional/creators`
- Params:
  - region: North
  - language: hi

**Request 2: Create Collaboration**
- Method: POST
- URL: `http://localhost:3000/api/regional/collab`
- Body (JSON):
```json
{
  "fromUserId": "user-1",
  "toUserId": "user-2",
  "message": "Let's collaborate!"
}
```

## 🎯 Success Indicators

When tests pass, you should see:

```
PASS  src/__tests__/regional.test.ts
  Regional Network Matching Algorithm Tests
    ✓ All 62 tests passing
    ✓ Matching accuracy >80%
    ✓ Collaboration success >80%
    ✓ Response time <5s
    ✓ Cache working correctly
    ✓ Edge cases handled
    ✓ Quality metrics met

Test Suites: 1 passed, 1 total
Tests:       62 passed, 62 total
Snapshots:   0 total
Time:        8.234s
```

---

**Need more examples?** Check the [Test Summary](./REGIONAL_TEST_SUMMARY.md) or [Quick Start Guide](./REGIONAL_TESTS_QUICK_START.md).
