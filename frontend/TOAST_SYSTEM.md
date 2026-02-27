# Toast Notification System

A complete toast notification system for displaying API errors and user feedback gracefully.

## 📦 What's Included

### Core Files
- **`context/ToastContext.tsx`** - React context for managing toast state
- **`components/Toast.tsx`** - Individual toast component with animations
- **`components/ToastContainer.tsx`** - Container that renders all toasts
- **`lib/apiWithToast.ts`** - Helper utilities for API error handling

### Documentation & Examples
- **`context/TOAST_USAGE.md`** - Detailed usage guide
- **`components/ToastExample.tsx`** - Interactive examples

## ✨ Features

✅ **4 Toast Types**: success, error, warning, info  
✅ **Auto-dismiss**: Configurable duration (default 5s)  
✅ **Stack Multiple Toasts**: Show multiple notifications simultaneously  
✅ **Smooth Animations**: Slide in/out with opacity transitions  
✅ **Progress Bar**: Visual indicator of remaining time  
✅ **Manual Close**: Close button on each toast  
✅ **Modern Design**: TailwindCSS with backdrop blur  
✅ **TypeScript**: Full type safety  
✅ **Accessible**: ARIA labels and semantic HTML  

## 🚀 Quick Start

### 1. Use in Any Component

```tsx
import { useToast } from '@/context/ToastContext';

function MyComponent() {
  const { addToast } = useToast();

  const handleClick = () => {
    addToast('success', 'Operation completed!');
  };

  return <button onClick={handleClick}>Click Me</button>;
}
```

### 2. API Error Handling

```tsx
import { useToast } from '@/context/ToastContext';
import { getErrorMessage } from '@/lib/apiWithToast';

function MyComponent() {
  const { addToast } = useToast();

  const fetchData = async () => {
    try {
      const response = await fetch('/api/data');
      if (!response.ok) throw new Error('Failed to fetch');
      addToast('success', 'Data loaded!');
    } catch (error) {
      addToast('error', getErrorMessage(error));
    }
  };

  return <button onClick={fetchData}>Load Data</button>;
}
```

### 3. Using the Helper Utility

```tsx
import { useToast } from '@/context/ToastContext';
import { apiWithToast } from '@/lib/apiWithToast';
import { api } from '@/services/api';

function UploadComponent() {
  const { addToast } = useToast();

  const handleUpload = async (file: File) => {
    try {
      await apiWithToast(
        () => api.upload(file),
        addToast,
        {
          successMessage: 'File uploaded successfully!',
          showSuccess: true,
        }
      );
    } catch (error) {
      // Error toast already shown
    }
  };

  return <input type="file" onChange={(e) => handleUpload(e.target.files[0])} />;
}
```

## 🎨 Toast Types

| Type | Color | Use Case |
|------|-------|----------|
| `success` | Green | Successful operations |
| `error` | Red | Errors and failures |
| `warning` | Yellow | Warnings and cautions |
| `info` | Blue | Informational messages |

## ⚙️ Configuration

### Custom Duration

```tsx
// 10 second toast
addToast('info', 'This stays longer', 10000);

// No auto-dismiss (manual close only)
addToast('error', 'Critical error', 0);
```

### Toast Position

Toasts appear in the **top-right corner** by default. To change position, edit `ToastContainer.tsx`:

```tsx
// Top-right (default)
<div className="fixed top-4 right-4 z-50">

// Top-left
<div className="fixed top-4 left-4 z-50">

// Bottom-right
<div className="fixed bottom-4 right-4 z-50">

// Bottom-left
<div className="fixed bottom-4 left-4 z-50">
```

## 🔧 Integration Status

✅ **ToastProvider** - Integrated in `app/layout.tsx`  
✅ **ToastContainer** - Rendered globally  
✅ **useToast Hook** - Available in all components  
✅ **API Helpers** - Ready to use with existing API service  

## 📝 API Reference

### `useToast()` Hook

```tsx
const { toasts, addToast, removeToast } = useToast();
```

- **`toasts`**: Array of current toast objects
- **`addToast(type, message, duration?)`**: Add a new toast
  - `type`: 'success' | 'error' | 'warning' | 'info'
  - `message`: string
  - `duration`: number (ms, default: 5000, 0 = no auto-dismiss)
- **`removeToast(id)`**: Manually remove a toast

### Helper Functions

```tsx
import { apiWithToast, getErrorMessage } from '@/lib/apiWithToast';
```

- **`apiWithToast(apiCall, addToast, options?)`**: Wrap API calls with automatic error toasts
- **`getErrorMessage(error)`**: Extract user-friendly error messages

## 🎯 Best Practices

1. **Use appropriate toast types** - Match the type to the message context
2. **Keep messages concise** - Short, clear messages work best
3. **Don't overuse** - Too many toasts can be overwhelming
4. **Use custom durations wisely** - Critical errors might need longer display time
5. **Combine with loading states** - Show toasts after operations complete

## 🧪 Testing

To test the toast system, use the example component:

```tsx
import ToastExample from '@/components/ToastExample';

// Add to any page
<ToastExample />
```

## 📚 Additional Resources

- See `context/TOAST_USAGE.md` for detailed usage examples
- See `components/ToastExample.tsx` for interactive demos
- Check existing components for integration patterns

## 🎉 Ready to Use!

The toast system is fully integrated and ready to use throughout your application. Simply import `useToast()` in any component and start showing notifications!
