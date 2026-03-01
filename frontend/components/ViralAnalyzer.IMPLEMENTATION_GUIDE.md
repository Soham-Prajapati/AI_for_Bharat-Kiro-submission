# ViralAnalyzer Implementation Guide

## Quick Start

This guide provides step-by-step instructions for implementing the ViralAnalyzer component using the architecture defined in `ViralAnalyzer.ARCHITECTURE.md`.

---

## Prerequisites

✅ Backend endpoint `/api/viral-analyzer/analyze` is implemented
✅ API client (`frontend/services/api.ts`) has `viralAnalyzer.analyze` method
✅ All type definitions are in place (`frontend/types/viral-analyzer.ts`)

---

## Implementation Steps

### Step 1: Basic Component Structure

Create the main ViralAnalyzer component:

```typescript
// frontend/components/ViralAnalyzer.tsx

'use client';

import React, { useState } from 'react';
import { useViralAnalyzer } from '@/hooks/useViralAnalyzer';
import { ViralScoreGauge } from './ViralScoreGauge';

export const ViralAnalyzer: React.FC = () => {
  const [inputUrl, setInputUrl] = useState('');
  const { analyze, reset, isLoading, hasError, hasResult, analysis, error, progress } =
    useViralAnalyzer();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;

    try {
      await analyze(inputUrl);
    } catch (err) {
      // Error is handled by the hook
      console.error('Analysis failed:', err);
    }
  };

  const handleReset = () => {
    setInputUrl('');
    reset();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Viral Content Analyzer</h1>

      {/* Input Form */}
      {!hasResult && (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-4">
            <input
              type="url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Enter video URL (YouTube, TikTok, Instagram...)"
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
              required
            />
            <button
              type="submit"
              disabled={isLoading || !inputUrl.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        </form>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Analyzing viral patterns...</p>
          <div className="mt-4 max-w-md mx-auto">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">{progress}%</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {hasError && error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <h3 className="text-red-800 font-semibold mb-2">Analysis Failed</h3>
          <p className="text-red-600 mb-4">{error.message}</p>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Results */}
      {hasResult && analysis && (
        <div className="space-y-8">
          {/* Header with Reset Button */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Analysis Results</h2>
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Analyze Another
            </button>
          </div>

          {/* Viral Score */}
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h3 className="text-xl font-semibold mb-4">Viral Score</h3>
            <ViralScoreGauge score={analysis.viralScore} size="large" />
          </div>

          {/* Patterns */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-xl font-semibold mb-4">Viral Patterns</h3>
            <div className="space-y-4">
              {analysis.patterns.map((pattern, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold capitalize">{pattern.type}</h4>
                    <span className="text-sm text-gray-600">
                      {Math.round(pattern.strength * 100)}%
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{pattern.description}</p>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${pattern.strength * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Hooks */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-xl font-semibold mb-4">Timeline Hooks</h3>
            <div className="space-y-3">
              {analysis.hooks.map((hook, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg"
                >
                  <span className="font-mono text-sm font-semibold text-blue-600">
                    {hook.timestamp}
                  </span>
                  <span className="capitalize text-sm text-gray-600">
                    {hook.type}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      hook.impact === 'high'
                        ? 'bg-red-100 text-red-700'
                        : hook.impact === 'medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {hook.impact}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Strategic Guide */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-xl font-semibold mb-4">Strategic Guide</h3>
            <p className="text-gray-700 leading-relaxed">{analysis.guide}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViralAnalyzer;
```

---

### Step 2: Add to Your Application

#### Option A: As a Page

```typescript
// frontend/app/viral-analyzer/page.tsx

import { ViralAnalyzer } from '@/components/ViralAnalyzer';

export default function ViralAnalyzerPage() {
  return <ViralAnalyzer />;
}
```

#### Option B: As a Component in Dashboard

```typescript
// frontend/app/dashboard/page.tsx

import { ViralAnalyzer } from '@/components/ViralAnalyzer';

export default function Dashboard() {
  return (
    <div>
      {/* Other dashboard content */}
      <ViralAnalyzer />
    </div>
  );
}
```

---

### Step 3: Test the Integration

1. **Start the development server:**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Navigate to the component:**
   - Go to `http://localhost:3000/viral-analyzer` (if using as page)
   - Or navigate to your dashboard

3. **Test with a video URL:**
   - Enter a valid video URL (e.g., YouTube link)
   - Click "Analyze"
   - Verify loading state appears
   - Verify results display correctly

4. **Test error handling:**
   - Enter an invalid URL
   - Verify error message displays
   - Click "Try Again" to reset

---

## Advanced Features

### Feature 1: Toast Notifications

Add toast notifications for better UX:

```typescript
import { useToast } from '@/context/ToastContext';

export const ViralAnalyzer: React.FC = () => {
  const { showToast } = useToast();
  
  const { analyze } = useViralAnalyzer({
    onSuccess: (result) => {
      showToast({
        type: 'success',
        message: `Analysis complete! Viral score: ${result.viralScore}`,
      });
    },
    onError: (error) => {
      showToast({
        type: 'error',
        message: error.userMessage,
      });
    },
  });

  // Rest of component...
};
```

### Feature 2: URL Validation

Add real-time URL validation:

```typescript
const [urlError, setUrlError] = useState<string | null>(null);

const validateUrl = (url: string) => {
  if (!url) {
    setUrlError(null);
    return;
  }

  try {
    new URL(url);
    setUrlError(null);
  } catch {
    setUrlError('Please enter a valid URL');
  }
};

<input
  type="url"
  value={inputUrl}
  onChange={(e) => {
    setInputUrl(e.target.value);
    validateUrl(e.target.value);
  }}
  className={urlError ? 'border-red-500' : ''}
/>
{urlError && <p className="text-red-500 text-sm mt-1">{urlError}</p>}
```

### Feature 3: Export Results

Add ability to export analysis results:

```typescript
const exportResults = () => {
  if (!analysis) return;

  const data = {
    videoUrl: analysis.videoUrl,
    viralScore: analysis.viralScore,
    patterns: analysis.patterns,
    hooks: analysis.hooks,
    guide: analysis.guide,
    analyzedAt: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `viral-analysis-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

<button onClick={exportResults}>Export Results</button>
```

### Feature 4: Comparison Mode

Compare multiple analyses:

```typescript
const [analyses, setAnalyses] = useState<ViralAnalysis[]>([]);

const handleAnalysisComplete = (result: AnalyzeViralResponse) => {
  setAnalyses((prev) => [...prev, result]);
};

// Display comparison table
<table>
  <thead>
    <tr>
      <th>Video</th>
      <th>Score</th>
      <th>Patterns</th>
    </tr>
  </thead>
  <tbody>
    {analyses.map((analysis, index) => (
      <tr key={index}>
        <td>{analysis.videoUrl}</td>
        <td>{analysis.viralScore}</td>
        <td>{analysis.patterns.length}</td>
      </tr>
    ))}
  </tbody>
</table>
```

---

## Styling Options

### Option 1: Tailwind CSS (Recommended)

Already used in the basic implementation above.

### Option 2: CSS Modules

```typescript
import styles from './ViralAnalyzer.module.css';

<div className={styles.container}>
  {/* Component content */}
</div>
```

### Option 3: Styled Components

```typescript
import styled from 'styled-components';

const Container = styled.div`
  max-width: 1024px;
  margin: 0 auto;
  padding: 24px;
`;

<Container>
  {/* Component content */}
</Container>
```

---

## Testing

### Unit Tests

```typescript
// frontend/__tests__/ViralAnalyzer.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ViralAnalyzer } from '@/components/ViralAnalyzer';

describe('ViralAnalyzer', () => {
  it('renders input form', () => {
    render(<ViralAnalyzer />);
    expect(screen.getByPlaceholderText(/enter video url/i)).toBeInTheDocument();
  });

  it('shows loading state during analysis', async () => {
    render(<ViralAnalyzer />);
    
    const input = screen.getByPlaceholderText(/enter video url/i);
    const button = screen.getByText(/analyze/i);

    fireEvent.change(input, { target: { value: 'https://youtube.com/watch?v=test' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/analyzing/i)).toBeInTheDocument();
    });
  });

  it('displays results after successful analysis', async () => {
    // Mock API response
    // Test results display
  });
});
```

---

## Troubleshooting

### Issue: "Module not found" errors

**Solution:** Ensure all imports use the correct path aliases:
```typescript
import { useViralAnalyzer } from '@/hooks/useViralAnalyzer';
import { ViralAnalyzerService } from '@/services/viral-analyzer.service';
```

### Issue: API request fails with CORS error

**Solution:** Ensure backend has CORS configured:
```typescript
// backend/src/index.ts
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
}));
```

### Issue: Cache not working

**Solution:** Check if sessionStorage is available:
```typescript
if (typeof window !== 'undefined' && window.sessionStorage) {
  // Cache is available
}
```

### Issue: TypeScript errors

**Solution:** Ensure all type definitions are imported:
```typescript
import type { ViralAnalysis, ViralPattern } from '@/types/viral-analyzer';
```

---

## Performance Optimization

### 1. Code Splitting

```typescript
import dynamic from 'next/dynamic';

const ViralAnalyzer = dynamic(() => import('@/components/ViralAnalyzer'), {
  loading: () => <p>Loading...</p>,
});
```

### 2. Memoization

```typescript
import { useMemo } from 'react';

const sortedPatterns = useMemo(() => {
  return ViralAnalyzerService.sortPatternsByStrength(analysis.patterns);
}, [analysis.patterns]);
```

### 3. Debounced Input

```typescript
import { useDebouncedCallback } from 'use-debounce';

const debouncedValidate = useDebouncedCallback((url: string) => {
  validateUrl(url);
}, 300);
```

---

## Next Steps

1. ✅ Implement basic component
2. ✅ Test with backend endpoint
3. ⬜ Add advanced features (export, comparison)
4. ⬜ Implement sub-components (PatternCard, TimelineVisualization)
5. ⬜ Add animations and transitions
6. ⬜ Write comprehensive tests
7. ⬜ Optimize performance
8. ⬜ Add accessibility features

---

## Resources

- **Architecture Document:** `ViralAnalyzer.ARCHITECTURE.md`
- **Type Definitions:** `frontend/types/viral-analyzer.ts`
- **Service Layer:** `frontend/services/viral-analyzer.service.ts`
- **Custom Hook:** `frontend/hooks/useViralAnalyzer.ts`
- **API Client:** `frontend/services/api.ts`

---

## Support

For questions or issues:
1. Check the architecture document for design decisions
2. Review type definitions for data structures
3. Test API endpoint directly using curl or Postman
4. Check browser console for errors
5. Verify all dependencies are installed

---

**Happy coding! 🚀**
