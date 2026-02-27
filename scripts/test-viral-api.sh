#!/bin/bash
# Test Viral Score API Route

echo "Testing Viral Score Predictor API..."
echo ""

# Test 1: High viral potential content
echo "Test 1: High viral potential content"
curl -X POST http://localhost:3000/api/viral/predict \
  -H "Content-Type: application/json" \
  -d '{
    "transcript": "This is an amazing secret that will shock you! How to use AI to create viral content in just 5 minutes. The results are incredible and you must see this. This trending hack will change everything you know about content creation.",
    "metadata": {
      "duration": 300,
      "platform": "youtube",
      "category": "tech"
    }
  }' \
  -w "\nStatus: %{http_code}\n\n"

# Test 2: Low viral potential content
echo "Test 2: Low viral potential content"
curl -X POST http://localhost:3000/api/viral/predict \
  -H "Content-Type: application/json" \
  -d '{
    "transcript": "This is a regular video about some topic. It contains information that might be useful. The content is okay and provides some value.",
    "metadata": {
      "duration": 180
    }
  }' \
  -w "\nStatus: %{http_code}\n\n"

# Test 3: Missing transcript
echo "Test 3: Missing transcript (should return 400)"
curl -X POST http://localhost:3000/api/viral/predict \
  -H "Content-Type: application/json" \
  -d '{
    "metadata": {}
  }' \
  -w "\nStatus: %{http_code}\n\n"

# Test 4: Empty transcript
echo "Test 4: Empty transcript (should return 400)"
curl -X POST http://localhost:3000/api/viral/predict \
  -H "Content-Type: application/json" \
  -d '{
    "transcript": "",
    "metadata": {}
  }' \
  -w "\nStatus: %{http_code}\n\n"

echo "Tests complete!"
