# VoiceTrainer Component

## Overview

The `VoiceTrainer` component provides a complete voice recording and training interface for creating AI voice models. It features WebAudio API integration, comprehensive error handling, state management, and user feedback through toast notifications.

## Features

### ✅ WebAudio API Integration
- High-quality audio recording with MediaRecorder API
- Audio enhancement (echo cancellation, noise suppression, auto gain control)
- Support for multiple audio formats (webm, mp4)
- Real-time recording timer with auto-stop
- Audio playback for sample review

### ✅ Error Handling
- **Microphone Permission Denied**: Clear messaging with retry option
- **Recording Failures**: Graceful error handling with user feedback
- **API Errors**: Comprehensive error messages during training
- **Validation**: Minimum duration checks, sample count limits
- **Browser Compatibility**: Fallback for unsupported MIME types

### ✅ State Management
- **Recording States**: idle, recording, processing, error
- **Samples Array**: Complete sample lifecycle management
- **Training Progress**: Real-time progress tracking
- **Permission State**: Microphone access status tracking

### ✅ Resource Cleanup
- Automatic cleanup on component unmount
- MediaRecorder stream termination
- Audio URL revocation to prevent memory leaks
- Timer cleanup

### ✅ User Feedback
- Toast notifications for all user actions
- Visual recording indicator with pulse animation
- Progress bar showing sample collection
- Real-time recording timer
- Training status updates

## Usage

### Basic Example

```tsx
import VoiceTrainer from '@/components/VoiceTrainer';

export default function VoiceTrainingPage() {
  const handleTrainingComplete = (modelId: string) => {
    console.log('Training complete! Model ID:', modelId);
    // Save modelId to database or state
  };

  const handleError = (error: Error) => {
    console.error('Training error:', error);
  };

  return (
    <VoiceTrainer
      userId="user-123"
      onTrainingComplete={handleTrainingComplete}
      onError={handleError}
    />
  );
}
```

### Advanced Example with Custom Configuration

```tsx
import VoiceTrainer from '@/components/VoiceTrainer';

export default function CustomVoiceTraining() {
  return (
    <VoiceTrainer
      userId="user-123"
      minSamples={5}           // Require 5 samples minimum
      maxSamples={15}          // Allow up to 15 samples
      sampleDuration={15}      // 15 seconds per sample
      onTrainingComplete={(modelId) => {
        // Store model ID
        localStorage.setItem('voiceModelId', modelId);
        // Navigate to next step
        router.push('/voice-generation');
      }}
      onError={(error) => {
        // Custom error handling
        logErrorToService(error);
      }}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `userId` | `string` | **Required** | User ID for associating the voice model |
| `minSamples` | `number` | `3` | Minimum number of samples required for training |
| `maxSamples` | `number` | `10` | Maximum number of samples allowed |
| `sampleDuration` | `number` | `10` | Maximum duration per sample in seconds |
| `onTrainingComplete` | `(modelId: string) => void` | `undefined` | Callback when training starts successfully |
| `onError` | `(error: Error) => void` | `undefined` | Callback for error handling |

## API Integration

The component uses the voice API endpoints defined in `frontend/services/api.ts`:

### Training Endpoint
```typescript
POST /api/voice/train
Content-Type: multipart/form-data

Body:
- userId: string
- samples: File[] (3-10 audio files)

Response:
{
  success: boolean;
  modelId: string;
  samplesUploaded: number;
  status: 'training' | 'ready' | 'failed';
  estimatedTime: string;
  message: string;
}
```

## State Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     Component Lifecycle                      │
└─────────────────────────────────────────────────────────────┘

1. Mount → Request Microphone Permission
   ├─ Granted → permissionGranted = true
   └─ Denied → permissionGranted = false, show error

2. Recording Flow
   ├─ Start Recording → recordingState = 'recording'
   ├─ Timer starts → recordingTime updates every 100ms
   ├─ Auto-stop at sampleDuration
   └─ Stop Recording → handleRecordingStop()
       ├─ Validate duration (min 2s)
       ├─ Create AudioSample object
       └─ Add to samples array

3. Sample Management
   ├─ Play sample → HTML5 audio element
   ├─ Delete sample → Remove from array, revoke URL
   └─ Clear all → Remove all samples, revoke all URLs

4. Training Flow
   ├─ Validate sample count (>= minSamples)
   ├─ Convert Blobs to Files
   ├─ recordingState = 'processing'
   ├─ Call apiClient.voice.train()
   └─ Success → Show model ID, call onTrainingComplete
       Failure → Show error, call onError

5. Cleanup
   └─ Unmount → Stop recording, stop streams, revoke URLs
```

## Error Scenarios

### 1. Microphone Permission Denied
```
User Action: Component mounts
Error: NotAllowedError
Handling:
- Set permissionGranted = false
- Show red alert with "Request Permission" button
- Toast: "Microphone permission denied..."
```

### 2. No Microphone Found
```
User Action: Request permission
Error: NotFoundError
Handling:
- Toast: "No microphone found..."
- Set recordingState = 'error'
- Call onError callback
```

### 3. Microphone In Use
```
User Action: Start recording
Error: NotReadableError
Handling:
- Toast: "Microphone is already in use..."
- Set recordingState = 'error'
```

### 4. Recording Too Short
```
User Action: Stop recording before 2 seconds
Validation: duration < 2
Handling:
- Toast: "Recording too short..."
- Don't add to samples
- Return to idle state
```

### 5. API Training Error
```
User Action: Start training
Error: API request fails
Handling:
- Toast: "Training failed: [error message]"
- Set recordingState = 'error'
- Set isTraining = false
- Call onError callback
```

## Browser Compatibility

### Supported Browsers
- Chrome 49+
- Firefox 25+
- Safari 14.1+
- Edge 79+

### Required APIs
- `navigator.mediaDevices.getUserMedia()`
- `MediaRecorder`
- `Blob` and `URL.createObjectURL()`

### MIME Type Fallback
```typescript
const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
  ? 'audio/webm' 
  : 'audio/mp4';
```

## Accessibility

- Semantic HTML with proper button labels
- Visual recording indicator (pulsing red dot)
- Clear status messages
- Keyboard accessible controls
- Screen reader friendly error messages

## Performance Considerations

### Memory Management
- Audio URLs are revoked when samples are deleted
- All resources cleaned up on unmount
- MediaRecorder chunks cleared after each recording

### Recording Optimization
- Audio chunks collected every 100ms
- Timer updates every 100ms (not every ms)
- Auto-stop prevents excessive recording

### API Optimization
- Files sent as multipart/form-data
- Efficient blob-to-file conversion
- Single API call for all samples

## Styling

The component uses Tailwind CSS with a clean, modern design:
- White background with shadow
- Blue primary color for actions
- Red for recording/errors
- Green for success/training
- Gray for disabled states

### Customization
To customize styles, modify the className strings in the component or wrap it in a styled container.

## Testing Checklist

- [ ] Microphone permission request works
- [ ] Recording starts and stops correctly
- [ ] Timer displays accurate time
- [ ] Auto-stop works at configured duration
- [ ] Samples can be played back
- [ ] Samples can be deleted
- [ ] Clear all removes all samples
- [ ] Training validates minimum samples
- [ ] Training sends correct data to API
- [ ] Error messages display correctly
- [ ] Toast notifications appear
- [ ] Component cleans up on unmount
- [ ] Works in different browsers
- [ ] Handles permission denial gracefully
- [ ] Handles API errors gracefully

## Future Enhancements

1. **Waveform Visualization**: Show audio waveform during recording
2. **Sample Quality Analysis**: Analyze audio quality before training
3. **Batch Upload**: Allow uploading pre-recorded samples
4. **Training Status Polling**: Poll API for training completion
5. **Sample Editing**: Trim or enhance samples before training
6. **Voice Preview**: Generate sample audio with trained model
7. **Multi-language Support**: i18n for all text content
8. **Dark Mode**: Theme support
9. **Mobile Optimization**: Better mobile UX
10. **Offline Support**: Queue training when offline

## Related Files

- `frontend/services/api.ts` - API client with voice endpoints
- `frontend/types/api.ts` - TypeScript types for voice API
- `frontend/context/ToastContext.tsx` - Toast notification system
- `frontend/hooks/useToastNotifications.ts` - Toast hook
- `src/routes/voice.route.ts` - Backend voice API routes

## Support

For issues or questions:
1. Check browser console for errors
2. Verify microphone permissions in browser settings
3. Test with different browsers
4. Check API endpoint availability
5. Review backend logs for training errors
