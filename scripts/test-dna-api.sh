#!/bin/bash
# Test DNA Analysis API Route

echo "Testing DNA Analysis API..."
echo ""

# Test 1: Valid request
echo "Test 1: Valid request with userId and videoIds"
curl -X POST http://localhost:3000/api/dna/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "videoIds": ["video-1", "video-2", "video-3", "video-4", "video-5"]
  }' \
  -w "\nStatus: %{http_code}\n\n"

# Test 2: Missing userId
echo "Test 2: Missing userId (should return 400)"
curl -X POST http://localhost:3000/api/dna/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "videoIds": ["video-1", "video-2"]
  }' \
  -w "\nStatus: %{http_code}\n\n"

# Test 3: Empty videoIds array
echo "Test 3: Empty videoIds array (should return 400)"
curl -X POST http://localhost:3000/api/dna/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "videoIds": []
  }' \
  -w "\nStatus: %{http_code}\n\n"

# Test 4: videoIds not an array
echo "Test 4: videoIds not an array (should return 400)"
curl -X POST http://localhost:3000/api/dna/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "videoIds": "not-an-array"
  }' \
  -w "\nStatus: %{http_code}\n\n"

echo "Tests complete!"
