# Viral Score Predictor API

## Overview
The Viral Score Predictor API analyzes content to predict its viral potential. It evaluates multiple factors including hook strength, pacing, emotional impact, trending topics, and optimal length.

## Endpoint

### POST /api/viral/predict

Predict viral score for content based on transcript and metadata.

**Request Body:**
```json
{
  "transcript": "string (required)",
  "metadata": {
    "duration": "number (optional, in seconds)",
    "platform": "string (optional)",
    "category": "string (optional)",
    "hasVisuals": "boolean (optional)"
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "prediction": {
    "score": 78,
    "factors": {
      "hook": 90,
      "pacing": 75,
      "emotion": 80,
      "trending": 70,
      "length": 85
    },
    "suggestions": [
      "Great content! Consider posting during peak hours for maximum reach",
      "Add more emotional language to connect with viewers"
    ],
    "confidence": 0.78,
    "category": "high"
  },
  "analyzedAt": "2026-02-27T03:56:00.000Z"
}
```

**Error Responses:**

400 Bad Request - Missing or invalid transcript
```json
{
  "success": false,
  "error": {
    "message": "transcript (non-empty string) required",
    "statusCode": 400,
    "timestamp": "2026-02-27T03:56:00.000Z"
  }
}
```

## Prediction Fields

### score
Type: `number` (0-100)
Description: Overall viral potential score
- 0-49: Low potential
- 50-69: Medium potential
- 70-84: High potential
- 85-100: Viral potential

### factors
Type: `object`
Description: Individual factor scores (all 0-100)

#### hook
Strength of the opening (first 3-5 seconds)
- Evaluates: Compelling questions, bold statements, curiosity gaps
- Weight: 30% of total score

#### pacing
Content flow and rhythm
- Evaluates: Sentence length variation, transitions, momentum
- Weight: 20% of total score

#### emotion
Emotional impact and connection
- Evaluates: Emotional language, storytelling, relatability
- Weight: 25% of total score

#### trending
Relevance to current trends
- Evaluates: Trending topics, current events, popular themes
- Weight: 15% of total score

#### length
Optimal content length
- Evaluates: Word count, duration, platform-specific best practices
- Weight: 10% of total score

### suggestions
Type: `string[]`
Description: Actionable recommendations to improve viral potential

### confidence
Type: `number` (0-1)
Description: Confidence level of the prediction

### category
Type: `'low' | 'medium' | 'high' | 'viral'`
Description: Categorical classification of viral potential

## Usage Example

### cURL
```bash
curl -X POST http://localhost:3000/api/viral/predict \
  -H "Content-Type: application/json" \
  -d '{
    "transcript": "This amazing secret will shock you! How to create viral content...",
    "metadata": {
      "duration": 300,
      "platform": "youtube"
    }
  }'
```

### JavaScript (fetch)
```javascript
const predictViral = async (transcript, metadata = {}) => {
  const response = await fetch('http://localhost:3000/api/viral/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript, metadata })
  });
  return response.json();
};

const result = await predictViral(
  'This is an amazing video about AI...',
  { duration: 300, platform: 'youtube' }
);

console.log('Viral Score:', result.prediction.score);
console.log('Suggestions:', result.prediction.suggestions);
```

### TypeScript
```typescript
interface ViralPredictionRequest {
  transcript: string;
  metadata?: {
    duration?: number;
    platform?: string;
    category?: string;
    hasVisuals?: boolean;
  };
}

interface ViralPredictionResponse {
  success: boolean;
  prediction: {
    score: number;
    factors: {
      hook: number;
      pacing: number;
      emotion: number;
      trending: number;
      length: number;
    };
    suggestions: string[];
    confidence: number;
    category: 'low' | 'medium' | 'high' | 'viral';
  };
  analyzedAt: string;
}

const predictViral = async (
  request: ViralPredictionRequest
): Promise<ViralPredictionResponse> => {
  const response = await fetch('/api/viral/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });
  return response.json();
};
```

## Testing

Run the test script:
```bash
./scripts/test-viral-api.sh
```

This will test:
1. High viral potential content (should score 70+)
2. Low viral potential content (should score <70)
3. Missing transcript (should return 400)
4. Empty transcript (should return 400)

## Scoring Algorithm

The current implementation uses a weighted average of five factors:

```
score = (hook × 0.30) + (pacing × 0.20) + (emotion × 0.25) + (trending × 0.15) + (length × 0.10)
```

### Hook Analysis
- Scans first 100 characters
- Looks for power words: "amazing", "shocking", "secret", "never", "must", "how to", "why"
- Base score: 60, +10 per power word found

### Pacing Analysis
- Calculates average sentence length
- Optimal: 15-25 words per sentence
- Penalizes too short (<15) or too long (>25)

### Emotion Analysis
- Scans for emotional words: "love", "hate", "amazing", "terrible", "incredible", "shocking", "wow"
- Base score: 50, +8 per emotional word found

### Trending Analysis
- Looks for trending topics: "ai", "crypto", "tech", "viral", "trending", "hack", "tip"
- Base score: 40, +12 per trending topic found

### Length Analysis
- Optimal: 150-300 words per minute (if duration provided)
- Fallback: 500-1500 total words
- Scores based on proximity to optimal range

## Integration Notes

### For Frontend (Srushti)
- Use this endpoint in the viral score gauge component (task 2.3b)
- Display score as circular gauge with color gradient
- Show factor breakdown as horizontal bars
- Display suggestions as actionable list
- Animate gauge from 0 to final score

### For AI Service (Nidhi)
- The service in `src/services/viral-predictor.service.ts` needs ML model integration (task 2.3a)
- Replace heuristic analysis with trained model
- Train on dataset of viral vs non-viral videos
- Improve accuracy to >70% (task 2.3d)

### For Testing (Lakshmi)
- Validate prediction accuracy (task 2.3d)
- Test with 50 viral + 50 non-viral videos
- Calculate precision, recall, F1 score
- Verify score is always in range 0-100

## Performance

- **Response time**: ~50-100ms
- **Accuracy**: ~65% (heuristic), target 70%+ with ML model
- **No caching**: Each request is analyzed fresh

## Future Enhancements
- Train ML model on viral video dataset
- Add platform-specific scoring (YouTube vs TikTok)
- Add visual analysis (thumbnail, video quality)
- Add audio analysis (music, sound effects)
- Add A/B testing suggestions
- Add historical performance tracking
- Add competitor benchmarking
