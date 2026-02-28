# VoiceTrainer Integration Guide

## Quick Start

### 1. Install Dependencies

The VoiceTrainer component requires the following to be set up in your project:

```bash
# Already included in the project
- React 18+
- TypeScript
- Tailwind CSS
- Toast notification system
```

### 2. Ensure Toast Provider is Configured

Make sure your app is wrapped with the `ToastProvider`:

```tsx
// app/layout.tsx or _app.tsx
import { ToastProvider } from '@/context/ToastContext';
import { ToastContainer } from '@/components/ToastContainer';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ToastProvider>
          {children}
          <ToastContainer />
        </ToastProvider>
      </body>
    </html>
  );
}
```

### 3. Import and Use

```tsx
import VoiceTrainer from '@/components/VoiceTrainer';

export default function VoiceTrainingPage() {
  return (
    <div className="container mx-auto py-8">
      <VoiceTrainer
        userId="user-123"
        onTrainingComplete={(modelId) => {
          console.log('Model trained:', modelId);
        }}
      />
    </div>
  );
}
```

## Integration Patterns

### Pattern 1: Multi-Step Onboarding

```tsx
'use client';

import { useState } from 'react';
import VoiceTrainer from '@/components/VoiceTrainer';

export default function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const [voiceModelId, setVoiceModelId] = useState<string | null>(null);

  const handleTrainingComplete = (modelId: string) => {
    setVoiceModelId(modelId);
    setStep(3); // Move to next step
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-between">
          <Step number={1} active={step === 1} completed={step > 1} label="Account Setup" />
          <Step number={2} active={step === 2} completed={step > 2} label="Voice Training" />
          <Step number={3} active={step === 3} completed={step > 3} label="Preferences" />
        </div>
      </div>

      {/* Step Content */}
      {step === 1 && (
        <div>
          <h2>Step 1: Account Setup</h2>
          {/* Account setup form */}
          <button onClick={() => setStep(2)}>Next</button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2>Step 2: Train Your Voice</h2>
          <p className="mb-6">Record samples to create your personalized AI voice</p>
          <VoiceTrainer
            userId="user-123"
            onTrainingComplete={handleTrainingComplete}
          />
        </div>
      )}

      {step === 3 && (
        <div>
          <h2>Step 3: Preferences</h2>
          <p>Voice Model ID: {voiceModelId}</p>
          {/* Preferences form */}
        </div>
      )}
    </div>
  );
}
```

### Pattern 2: Dashboard Integration

```tsx
'use client';

import { useState } from 'react';
import VoiceTrainer from '@/components/VoiceTrainer';

export default function VoiceDashboard() {
  const [showTrainer, setShowTrainer] = useState(false);
  const [models, setModels] = useState<string[]>([]);

  const handleTrainingComplete = (modelId: string) => {
    setModels([...models, modelId]);
    setShowTrainer(false);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Voice Models</h1>
        <button
          onClick={() => setShowTrainer(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Train New Voice
        </button>
      </div>

      {/* Existing Models */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {models.map((modelId) => (
          <div key={modelId} className="p-4 border rounded-lg">
            <h3 className="font-semibold">Voice Model</h3>
            <p className="text-sm text-gray-600">{modelId}</p>
            <button className="mt-2 text-blue-600 hover:underline">
              Use This Voice
            </button>
          </div>
        ))}
      </div>

      {/* Training Modal */}
      {showTrainer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Train New Voice</h2>
              <button
                onClick={() => setShowTrainer(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <VoiceTrainer
              userId="user-123"
              onTrainingComplete={handleTrainingComplete}
            />
          </div>
        </div>
      )}
    </div>
  );
}
```

### Pattern 3: With Authentication

```tsx
'use client';

import { useAuth } from '@/hooks/useAuth';
import VoiceTrainer from '@/components/VoiceTrainer';
import { useRouter } from 'next/navigation';

export default function AuthenticatedVoiceTraining() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const handleTrainingComplete = async (modelId: string) => {
    // Save to user profile
    await fetch('/api/user/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voiceModelId: modelId }),
    });

    router.push('/dashboard');
  };

  return (
    <div className="container mx-auto py-8">
      <VoiceTrainer
        userId={user.id}
        onTrainingComplete={handleTrainingComplete}
        onError={(error) => {
          console.error('Training error:', error);
          // Log to error tracking service
        }}
      />
    </div>
  );
}
```

### Pattern 4: With State Persistence

```tsx
'use client';

import { useState, useEffect } from 'react';
import VoiceTrainer from '@/components/VoiceTrainer';

export default function PersistentVoiceTraining() {
  const [savedModelId, setSavedModelId] = useState<string | null>(null);

  useEffect(() => {
    // Load saved model ID
    const saved = localStorage.getItem('voiceModelId');
    if (saved) {
      setSavedModelId(saved);
    }
  }, []);

  const handleTrainingComplete = (modelId: string) => {
    // Save to localStorage
    localStorage.setItem('voiceModelId', modelId);
    setSavedModelId(modelId);

    // Also save to backend
    fetch('/api/user/voice-model', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ modelId }),
    });
  };

  return (
    <div className="container mx-auto py-8">
      {savedModelId ? (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">
            You already have a trained voice model: <code>{savedModelId}</code>
          </p>
          <button
            onClick={() => setSavedModelId(null)}
            className="mt-2 text-green-600 hover:underline"
          >
            Train a new voice
          </button>
        </div>
      ) : (
        <VoiceTrainer
          userId="user-123"
          onTrainingComplete={handleTrainingComplete}
        />
      )}
    </div>
  );
}
```

## API Integration Details

### Backend Setup Required

Ensure your backend has the voice routes configured:

```typescript
// src/routes/voice.route.ts
import { Router } from 'express';
import multer from 'multer';

const router = Router();
const upload = multer({ 
  storage: multer.memoryStorage(), 
  limits: { fileSize: 50 * 1024 * 1024 } 
});

router.post('/train', upload.array('samples', 10), async (req, res) => {
  // Training logic
});

router.post('/generate', async (req, res) => {
  // Generation logic
});

export default router;
```

### API Client Configuration

The API client is already configured in `frontend/services/api.ts`:

```typescript
voice = {
  train: async (userId: string, samples: File[]): Promise<VoiceTrainResponse> => {
    const formData = new FormData();
    formData.append('userId', userId);
    samples.forEach((sample) => {
      formData.append('samples', sample);
    });

    const response = await fetch(`${this.baseUrl}/api/voice/train`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.authToken}` },
      body: formData,
    });

    return response.json();
  },

  generate: (data: VoiceGenerateRequest) =>
    this.request<VoiceGenerateResponse>('/api/voice/generate', {
      method: 'POST',
      body: data,
    }),
};
```

## Environment Variables

Add to your `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Error Handling Best Practices

### 1. Global Error Boundary

```tsx
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class VoiceTrainerErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('VoiceTrainer error:', error, errorInfo);
    // Log to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-xl font-bold text-red-800 mb-2">
            Voice Training Error
          </h2>
          <p className="text-red-600">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage
<VoiceTrainerErrorBoundary>
  <VoiceTrainer userId="user-123" />
</VoiceTrainerErrorBoundary>
```

### 2. Custom Error Handler

```tsx
import { useToastNotifications } from '@/hooks/useToastNotifications';

export default function VoiceTrainingWithErrorHandler() {
  const toast = useToastNotifications();

  const handleError = (error: Error) => {
    // Log to analytics
    analytics.track('voice_training_error', {
      error: error.message,
      timestamp: new Date().toISOString(),
    });

    // Show user-friendly message
    if (error.message.includes('permission')) {
      toast.error('Please enable microphone access in your browser settings');
    } else if (error.message.includes('network')) {
      toast.error('Network error. Please check your connection and try again');
    } else {
      toast.error('Training failed. Please try again or contact support');
    }
  };

  return (
    <VoiceTrainer
      userId="user-123"
      onError={handleError}
    />
  );
}
```

## Testing

### Unit Tests Example

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VoiceTrainer from '@/components/VoiceTrainer';
import { ToastProvider } from '@/context/ToastContext';

// Mock MediaRecorder
global.MediaRecorder = jest.fn().mockImplementation(() => ({
  start: jest.fn(),
  stop: jest.fn(),
  ondataavailable: null,
  onstop: null,
  state: 'inactive',
}));

// Mock getUserMedia
global.navigator.mediaDevices = {
  getUserMedia: jest.fn().mockResolvedValue({
    getTracks: () => [{ stop: jest.fn() }],
  }),
};

describe('VoiceTrainer', () => {
  it('renders correctly', () => {
    render(
      <ToastProvider>
        <VoiceTrainer userId="test-user" />
      </ToastProvider>
    );
    
    expect(screen.getByText('Voice Trainer')).toBeInTheDocument();
    expect(screen.getByText('🎤 Start Recording')).toBeInTheDocument();
  });

  it('requests microphone permission on mount', async () => {
    render(
      <ToastProvider>
        <VoiceTrainer userId="test-user" />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    });
  });

  it('starts recording when button clicked', async () => {
    render(
      <ToastProvider>
        <VoiceTrainer userId="test-user" />
      </ToastProvider>
    );

    const recordButton = screen.getByText('🎤 Start Recording');
    fireEvent.click(recordButton);

    await waitFor(() => {
      expect(screen.getByText('⏹ Stop Recording')).toBeInTheDocument();
    });
  });
});
```

## Performance Optimization

### 1. Lazy Loading

```tsx
import dynamic from 'next/dynamic';

const VoiceTrainer = dynamic(() => import('@/components/VoiceTrainer'), {
  loading: () => <div>Loading voice trainer...</div>,
  ssr: false, // Disable SSR for WebAudio components
});

export default function Page() {
  return <VoiceTrainer userId="user-123" />;
}
```

### 2. Memoization

```tsx
import { memo } from 'react';

const MemoizedVoiceTrainer = memo(VoiceTrainer, (prevProps, nextProps) => {
  return prevProps.userId === nextProps.userId;
});

export default MemoizedVoiceTrainer;
```

## Troubleshooting

### Issue: Microphone not detected
**Solution**: Check browser permissions, ensure HTTPS in production

### Issue: Recording fails to start
**Solution**: Verify MediaRecorder support, check console for errors

### Issue: Training API fails
**Solution**: Check network tab, verify backend is running, check CORS

### Issue: Memory leaks
**Solution**: Ensure component cleanup, verify URL revocation

### Issue: Toast notifications not showing
**Solution**: Verify ToastProvider is in layout, check ToastContainer

## Security Considerations

1. **HTTPS Required**: MediaRecorder requires HTTPS in production
2. **User Consent**: Always request explicit permission
3. **Data Privacy**: Inform users about voice data usage
4. **Token Security**: Ensure auth tokens are properly secured
5. **File Validation**: Backend should validate uploaded files

## Browser Support Matrix

| Browser | Version | Support | Notes |
|---------|---------|---------|-------|
| Chrome | 49+ | ✅ Full | Best performance |
| Firefox | 25+ | ✅ Full | Good support |
| Safari | 14.1+ | ✅ Full | Requires HTTPS |
| Edge | 79+ | ✅ Full | Chromium-based |
| Opera | 36+ | ✅ Full | Chromium-based |
| IE | Any | ❌ None | Not supported |

## Next Steps

1. Implement voice generation UI
2. Add training status polling
3. Create voice model management dashboard
4. Add sample quality analysis
5. Implement waveform visualization
