# API Services

## File Upload API

### Usage Example

```typescript
import { api } from '@/services/api';
import { UploadError } from '@/types/api';

// Basic upload
try {
  const response = await api.upload(file);
  console.log('File uploaded:', response.fileId);
} catch (error) {
  if (error instanceof UploadError) {
    console.error('Upload failed:', error.message);
    console.error('Error code:', error.code);
  }
}

// Upload with progress tracking
try {
  const response = await api.upload(file, (progress) => {
    console.log(`Upload progress: ${progress}%`);
    // Update UI progress bar here
  });
  console.log('Upload complete:', response);
} catch (error) {
  if (error instanceof UploadError) {
    // Handle specific error codes
    switch (error.code) {
      case 'FILE_TOO_LARGE':
        alert('File is too large. Maximum size is 100MB');
        break;
      case 'UNSUPPORTED_FILE_TYPE':
        alert('This file type is not supported');
        break;
      case 'NETWORK_ERROR':
        alert('Network error. Please check your connection');
        break;
      default:
        alert(`Upload failed: ${error.message}`);
    }
  }
}
```

### Error Codes

- `FILE_TOO_LARGE` - File exceeds 100MB limit
- `INVALID_FILE` - File is empty or invalid
- `UNSUPPORTED_FILE_TYPE` - File type not supported by backend
- `NETWORK_ERROR` - Network connection issue
- `TIMEOUT` - Upload took too long
- `CANCELLED` - Upload was cancelled
- `SERVER_ERROR` - Backend server error
- `INVALID_RESPONSE` - Unexpected response format

### Configuration

Set the API URL in `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

For production, update to your production API URL.
