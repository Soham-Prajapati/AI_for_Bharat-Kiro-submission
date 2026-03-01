# SafetyDashboard Integration Guide

## Quick Start

### Step 1: Install Dependencies

The SafetyDashboard requires the following dependencies:

```bash
npm install framer-motion
# or
yarn add framer-motion
```

TailwindCSS should already be configured in your project.

### Step 2: Import the Component

```tsx
import SafetyDashboard from '@/components/SafetyDashboard';
```

### Step 3: Use in Your Page

```tsx
export default function SafetyPage() {
  return (
    <div className="container mx-auto">
      <SafetyDashboard contentId="your-content-id" />
    </div>
  );
}
```

## Backend Integration

### API Endpoint Setup

The SafetyDashboard expects data from the safety service API. The backend route already exists at:

```
POST /api/safety/check
```

### Request Format

```typescript
interface SafetyCheckRequest {
  contentId: string;
  contentType: 'text' | 'image' | 'video' | 'audio';
  content?: string; // Text content or URL
  url?: string; // Media URL
  platforms?: string[]; // Target platforms
  strictness?: 'low' | 'medium' | 'high';
}
```

### Example API Call

```typescript
const checkContentSafety = async (contentId: string, content: string) => {
  const response = await fetch('/api/safety/check', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contentId,
      contentType: 'text',
      content,
      platforms: ['youtube', 'instagram', 'tiktok', 'twitter', 'linkedin', 'facebook'],
      strictness: 'medium',
    }),
  });

  if (!response.ok) {
    throw new Error('Safety check failed');
  }

  return await response.json();
};
```

### Response Format

The API returns a `SafetyCheckResult` object:

```typescript
interface SafetyCheckResult {
  checkId: string;
  contentId: string;
  safe: boolean;
  overallScore: number; // 0-100
  violations: Violation[];
  warnings: string[];
  suggestions: string[];
  platformCompliance: Record<string, {
    compliant: boolean;
    violations: string[];
    warnings: string[];
  }>;
  moderationLabels?: {
    label: string;
    confidence: number;
    parentLabel?: string;
  }[];
  checkedAt: string;
}
```

## Real-time Data Integration

### Replace Mock Data with API Calls

Modify the SafetyDashboard component to fetch real data:

```typescript
// In SafetyDashboard.tsx
import { useEffect, useState } from 'react';

export default function SafetyDashboard({ contentId, ... }: SafetyDashboardProps) {
  const [safetyData, setSafetyData] = useState<SafetyCheckResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSafetyData = async () => {
      if (!contentId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/safety/check/${contentId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch safety data');
        }
        
        const data = await response.json();
        setSafetyData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchSafetyData();
    
    // Auto-refresh if enabled
    if (autoRefresh) {
      const interval = setInterval(fetchSafetyData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [contentId, autoRefresh, refreshInterval]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!safetyData) return <NoDataMessage />;

  // Rest of the component...
}
```

## Action Handlers

### Approve Content

```typescript
const handleApprove = async (checkId: string) => {
  try {
    const response = await fetch(`/api/content/approve/${checkId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to approve content');
    }

    // Show success message
    toast.success('Content approved successfully!');
    
    // Refresh data or navigate
    router.push('/dashboard');
  } catch (error) {
    toast.error('Failed to approve content');
    console.error(error);
  }
};
```

### Reject Content

```typescript
const handleReject = async (checkId: string) => {
  try {
    const response = await fetch(`/api/content/reject/${checkId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to reject content');
    }

    toast.error('Content rejected');
    router.push('/dashboard');
  } catch (error) {
    toast.error('Failed to reject content');
    console.error(error);
  }
};
```

### Flag Content

```typescript
const handleFlag = async (checkId: string, reason: string) => {
  try {
    const response = await fetch(`/api/content/flag/${checkId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      throw new Error('Failed to flag content');
    }

    toast.info('Content flagged for manual review');
  } catch (error) {
    toast.error('Failed to flag content');
    console.error(error);
  }
};
```

## Usage Scenarios

### Scenario 1: Content Review Workflow

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SafetyDashboard from '@/components/SafetyDashboard';
import { toast } from '@/components/Toast';

export default function ContentReviewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [processing, setProcessing] = useState(false);

  const handleApprove = async (checkId: string) => {
    setProcessing(true);
    try {
      await fetch(`/api/content/approve/${checkId}`, { method: 'POST' });
      toast.success('Content approved and published!');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Failed to approve content');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (checkId: string) => {
    setProcessing(true);
    try {
      await fetch(`/api/content/reject/${checkId}`, { method: 'POST' });
      toast.error('Content rejected');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Failed to reject content');
    } finally {
      setProcessing(false);
    }
  };

  const handleFlag = async (checkId: string, reason: string) => {
    try {
      await fetch(`/api/content/flag/${checkId}`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
      toast.info('Content flagged for review');
    } catch (error) {
      toast.error('Failed to flag content');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SafetyDashboard
        contentId={params.id}
        onApprove={handleApprove}
        onReject={handleReject}
        onFlag={handleFlag}
        autoRefresh={true}
        refreshInterval={30000}
      />
      
      {processing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
            <p className="mt-4 text-gray-700">Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
}
```

### Scenario 2: Batch Content Moderation

```tsx
'use client';

import { useState } from 'react';
import SafetyDashboard from '@/components/SafetyDashboard';

export default function BatchModerationPage() {
  const [contentIds] = useState(['content_1', 'content_2', 'content_3']);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<Record<string, 'approved' | 'rejected' | 'flagged'>>({});

  const currentContentId = contentIds[currentIndex];

  const handleApprove = (checkId: string) => {
    setResults(prev => ({ ...prev, [currentContentId]: 'approved' }));
    moveToNext();
  };

  const handleReject = (checkId: string) => {
    setResults(prev => ({ ...prev, [currentContentId]: 'rejected' }));
    moveToNext();
  };

  const handleFlag = (checkId: string, reason: string) => {
    setResults(prev => ({ ...prev, [currentContentId]: 'flagged' }));
    moveToNext();
  };

  const moveToNext = () => {
    if (currentIndex < contentIds.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Content {currentIndex + 1} of {contentIds.length}
            </span>
            <span className="text-sm text-gray-500">
              {Object.keys(results).length} reviewed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / contentIds.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Dashboard */}
        <SafetyDashboard
          key={currentContentId}
          contentId={currentContentId}
          onApprove={handleApprove}
          onReject={handleReject}
          onFlag={handleFlag}
        />

        {/* Navigation */}
        <div className="mt-6 flex justify-between">
          <button
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium"
          >
            ← Previous
          </button>
          <button
            onClick={moveToNext}
            disabled={currentIndex === contentIds.length - 1}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium"
          >
            Skip →
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Scenario 3: Real-time Monitoring Dashboard

```tsx
'use client';

import { useState, useEffect } from 'react';
import SafetyDashboard from '@/components/SafetyDashboard';

export default function MonitoringDashboard() {
  const [recentContent, setRecentContent] = useState<string[]>([]);
  const [selectedContent, setSelectedContent] = useState<string | null>(null);

  useEffect(() => {
    // Fetch recent content that needs review
    const fetchRecentContent = async () => {
      const response = await fetch('/api/content/pending-review');
      const data = await response.json();
      setRecentContent(data.contentIds);
      if (data.contentIds.length > 0) {
        setSelectedContent(data.contentIds[0]);
      }
    };

    fetchRecentContent();
    
    // Poll for new content every 30 seconds
    const interval = setInterval(fetchRecentContent, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Pending Review ({recentContent.length})
          </h2>
          <div className="space-y-2">
            {recentContent.map(contentId => (
              <button
                key={contentId}
                onClick={() => setSelectedContent(contentId)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  selectedContent === contentId
                    ? 'bg-blue-100 text-blue-900'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                }`}
              >
                {contentId}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {selectedContent ? (
            <SafetyDashboard
              key={selectedContent}
              contentId={selectedContent}
              autoRefresh={true}
              refreshInterval={15000}
              onApprove={(checkId) => {
                setRecentContent(prev => prev.filter(id => id !== selectedContent));
                setSelectedContent(recentContent[0] || null);
              }}
              onReject={(checkId) => {
                setRecentContent(prev => prev.filter(id => id !== selectedContent));
                setSelectedContent(recentContent[0] || null);
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  All Clear!
                </h3>
                <p className="text-gray-600">
                  No content pending review at the moment.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

## Testing

### Unit Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import SafetyDashboard from './SafetyDashboard';

describe('SafetyDashboard', () => {
  it('renders traffic light system', () => {
    render(<SafetyDashboard contentId="test_123" />);
    expect(screen.getByText('Safety Status')).toBeInTheDocument();
  });

  it('displays violations', () => {
    render(<SafetyDashboard contentId="test_123" />);
    expect(screen.getByText('Violation Alerts')).toBeInTheDocument();
  });

  it('calls onApprove when approve button is clicked', () => {
    const handleApprove = jest.fn();
    render(<SafetyDashboard contentId="test_123" onApprove={handleApprove} />);
    
    const approveButton = screen.getByText('Approve Content');
    fireEvent.click(approveButton);
    
    expect(handleApprove).toHaveBeenCalled();
  });
});
```

## Troubleshooting

### Issue: Component not rendering

**Solution**: Ensure all dependencies are installed:
```bash
npm install framer-motion
```

### Issue: Styles not applying

**Solution**: Verify TailwindCSS is configured correctly in `tailwind.config.js`:
```javascript
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  // ...
};
```

### Issue: API calls failing

**Solution**: Check that the backend safety service is running and the API endpoint is correct:
```typescript
// Verify the endpoint exists
const response = await fetch('/api/safety/check', {
  method: 'POST',
  body: JSON.stringify({ /* ... */ }),
});
console.log(response.status); // Should be 200
```

## Best Practices

1. **Always provide contentId**: The component needs a content ID to function properly
2. **Handle errors gracefully**: Wrap API calls in try-catch blocks
3. **Show loading states**: Display loading indicators while fetching data
4. **Use auto-refresh wisely**: Only enable for monitoring dashboards, not for single content reviews
5. **Implement proper authentication**: Ensure only authorized users can approve/reject content
6. **Log actions**: Keep audit logs of all approve/reject/flag actions
7. **Test with real data**: Use actual content to test the safety checks

## Next Steps

1. Connect to your backend API
2. Implement authentication and authorization
3. Add analytics tracking
4. Customize styling to match your brand
5. Add export functionality for reports
6. Implement team collaboration features

For more information, see the [README](./SafetyDashboard.README.md) and [example usage](./SafetyDashboard.example.tsx).
