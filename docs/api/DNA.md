# DNA Analysis API

## Overview
The DNA Analysis API analyzes a creator's past content to build a comprehensive personality profile. This profile includes personality traits, content topics, tone, vocabulary level, and archetype classification.

## Endpoint

### POST /api/dna/analyze

Analyzes creator's past content to build personality profile.

**Request Body:**
```json
{
  "userId": "string (required)",
  "videoIds": ["string"] (required, non-empty array)
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "userId": "user-123",
  "videoCount": 5,
  "profile": {
    "personality": "energetic",
    "topics": ["technology", "gaming", "tutorials"],
    "tone": "casual",
    "vocabularyLevel": "intermediate",
    "archetype": "educator",
    "confidence": 0.92,
    "traits": ["clear", "structured", "patient", "enthusiastic"],
    "dimensions": {
      "energy": 0.85,
      "formality": 0.35,
      "humor": 0.65,
      "technicalDepth": 0.75,
      "storytelling": 0.80
    }
  },
  "analyzedAt": "2026-02-27T03:56:00.000Z"
}
```

**Error Responses:**

400 Bad Request - Missing or invalid parameters
```json
{
  "success": false,
  "error": {
    "message": "userId and videoIds[] (non-empty array) required",
    "statusCode": 400,
    "timestamp": "2026-02-27T03:56:00.000Z"
  }
}
```

## Profile Fields

### personality
Type: `string`
Description: Overall personality classification (e.g., "energetic", "calm", "analytical")

### topics
Type: `string[]`
Description: Main content topics the creator focuses on

### tone
Type: `string`
Description: Communication tone (e.g., "casual", "formal", "professional")

### vocabularyLevel
Type: `string`
Description: Vocabulary complexity level (e.g., "beginner", "intermediate", "advanced")

### archetype
Type: `string`
Description: Creator archetype classification
Options: "educator", "entertainer", "reviewer", "storyteller", "analyst"

### confidence
Type: `number` (0-1)
Description: Confidence score of the analysis

### traits
Type: `string[]`
Description: Key personality traits identified

### dimensions
Type: `object`
Description: Five-dimensional personality analysis (all values 0-1)
- **energy**: Content energy level
- **formality**: Formal vs casual communication
- **humor**: Use of humor and entertainment
- **technicalDepth**: Technical complexity level
- **storytelling**: Narrative and storytelling ability

## Usage Example

### cURL
```bash
curl -X POST http://localhost:3000/api/dna/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "videoIds": ["video-1", "video-2", "video-3", "video-4", "video-5"]
  }'
```

### JavaScript (fetch)
```javascript
const response = await fetch('http://localhost:3000/api/dna/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user-123',
    videoIds: ['video-1', 'video-2', 'video-3', 'video-4', 'video-5']
  })
});

const data = await response.json();
console.log(data.profile);
```

### TypeScript
```typescript
interface DNAAnalysisRequest {
  userId: string;
  videoIds: string[];
}

interface DNAAnalysisResponse {
  success: boolean;
  userId: string;
  videoCount: number;
  profile: {
    personality: string;
    topics: string[];
    tone: string;
    vocabularyLevel: string;
    archetype: string;
    confidence: number;
    traits: string[];
    dimensions: {
      energy: number;
      formality: number;
      humor: number;
      technicalDepth: number;
      storytelling: number;
    };
  };
  analyzedAt: string;
}

const analyzeDNA = async (request: DNAAnalysisRequest): Promise<DNAAnalysisResponse> => {
  const response = await fetch('/api/dna/analyze', {
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
./scripts/test-dna-api.sh
```

This will test:
1. Valid request with userId and videoIds
2. Missing userId (should return 400)
3. Empty videoIds array (should return 400)
4. Invalid videoIds type (should return 400)

## Integration Notes

### For Frontend (Srushti)
- Use this endpoint in the DNA visualization component (task 2.1c)
- Display the `dimensions` object in a radar chart
- Show `traits` as badges
- Display `archetype` with an icon

### For AI Service (Nidhi)
- The service stub in `src/services/dna-analysis.service.ts` needs full implementation (task 2.1a)
- Replace mock data with real Bedrock analysis
- Analyze transcripts from the provided videoIds
- Calculate personality dimensions based on content analysis

## Future Enhancements
- Cache DNA profiles in DynamoDB (1 hour TTL)
- Add support for incremental updates (analyze new videos only)
- Add comparison feature (compare two creators' DNA)
- Add trend analysis (how DNA changes over time)
