#!/bin/bash
# Test Analytics API Route

echo "Testing Analytics API..."
echo ""

USER_ID="user-123"

# Test 1: First call (should fetch fresh data)
echo "Test 1: First call - fetching fresh data"
START_TIME=$(date +%s%N)
curl -X GET "http://localhost:3000/api/analytics/$USER_ID" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n"
END_TIME=$(date +%s%N)
DURATION_1=$((($END_TIME - $START_TIME) / 1000000))
echo "Duration: ${DURATION_1}ms"
echo ""

# Test 2: Second call (should return cached data - faster)
echo "Test 2: Second call - should return cached data (faster)"
START_TIME=$(date +%s%N)
curl -X GET "http://localhost:3000/api/analytics/$USER_ID" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n"
END_TIME=$(date +%s%N)
DURATION_2=$((($END_TIME - $START_TIME) / 1000000))
echo "Duration: ${DURATION_2}ms"
echo ""

# Compare durations
if [ $DURATION_2 -lt $DURATION_1 ]; then
  echo "✅ Cache working! Second call was faster (${DURATION_2}ms vs ${DURATION_1}ms)"
else
  echo "⚠️  Cache may not be working (${DURATION_2}ms vs ${DURATION_1}ms)"
fi
echo ""

# Test 3: Missing userId
echo "Test 3: Invalid userId (should return 404)"
curl -X GET "http://localhost:3000/api/analytics/" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n"

echo "Tests complete!"
