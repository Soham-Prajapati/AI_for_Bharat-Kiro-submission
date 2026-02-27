# Toast Notification System

A modern, accessible toast notification system for displaying API errors and user feedback.

## Features

- ✅ 4 toast types: success, error, warning, info
- ✅ Auto-dismiss after 5 seconds (configurable)
- ✅ Stack multiple toasts
- ✅ Smooth animations (slide in/out)
- ✅ Progress bar showing time remaining
- ✅ Manual close button
- ✅ Clean TailwindCSS design
- ✅ TypeScript support

## Usage

### Basic Usage

```tsx
import { useToast } from '@/context/ToastContext';

function MyComponent() {
  const { addToast } = useToast();

  const handleSuccess = () => {
    addToast('success', 'Operation completed successfully!');
  };

  const handleError = () => {
    addToast('error', 'Something went wrong. Please try again.');
  };

  const handleWarning = () => {
    addToast('warning', 'This action cannot be undone.');
  };

  const handleInfo = () => {
    addToast('info', 'New features are available!');
  };

  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
      <button onClick={handleWarning}>Show Warning</button>
      <button onClick={handleInfo}>Show Info</button>
    </div>
  );
}
```

### Custom Duration

```tsx
// Toast that stays for 10 seconds
addToast('info', 'This will stay longer', 10000);

// Toast that doesn't auto-dismiss (duration = 0)
addToast('error', 'Critical error - manual dismiss only', 0);
```

### API Error Handling

```tsx
import { useToast } from '@/context/ToastContext';

function MyComponent() {
  const { addToast } = useToast();

  const fetchData = async () => {
    try {
      const response = await fetch('/api/data');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      addToast('success', 'Data loaded successfully!');
    } catch (error) {
      addToast('error', error.message || 'An error occurred');
    }
  };

  return <button onClick={fetchData}>Load Data</button>;
}
```

### Integration with API Service

```tsx
// In your API service (services/api.ts)
import { toast } from 'react-hot-toast'; // Remove this if using
// Instead, pass the addToast function or use a global error handler

// Example with axios interceptor
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // You can access the toast context here if needed
    const message = error.response?.data?.message || 'An error occurred';
    // Call your global error handler that uses addToast
    return Promise.reject(error);
  }
);
```

## API Reference

### `useToast()` Hook

Returns an object with:

- `toasts`: Array of current toast objects
- `addToast(type, message, duration?)`: Add a new toast
  - `type`: 'success' | 'error' | 'warning' | 'info'
  - `message`: string - The message to display
  - `duration`: number (optional, default: 5000ms) - Auto-dismiss duration
- `removeToast(id)`: Manually remove a toast by ID

### Toast Types

- **success**: Green - For successful operations
- **error**: Red - For errors and failures
- **warning**: Yellow - For warnings and cautions
- **info**: Blue - For informational messages

## Styling

The toast system uses TailwindCSS with the following features:

- Backdrop blur for modern glass effect
- Smooth slide-in/out animations
- Progress bar with opacity
- Responsive design (min-width: 320px, max-width: 448px)
- Fixed positioning (top-right corner)
- High z-index (z-50) to appear above other content

## Accessibility

- Close button has `aria-label="Close"`
- Semantic color coding
- Clear visual indicators (icons)
- Keyboard accessible (can be closed with button)

## Notes

- The ToastProvider is already integrated in the root layout
- Toasts appear in the top-right corner
- Multiple toasts stack vertically
- Each toast has a unique ID for tracking
- Auto-dismiss can be disabled by setting duration to 0
