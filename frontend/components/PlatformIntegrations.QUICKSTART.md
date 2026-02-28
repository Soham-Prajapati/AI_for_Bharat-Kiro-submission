# PlatformIntegrations - Quick Start Guide

Get the PlatformIntegrations component up and running in 5 minutes.

## 1. Quick Setup

### Option A: Use the Example Component (Fastest)

```tsx
// app/integrations/page.tsx
import PlatformIntegrationsExample from '@/components/PlatformIntegrations.example';

export default function Page() {
  return <PlatformIntegrationsExample />;
}
```

### Option B: Manual Setup

```tsx
// app/integrations/page.tsx
'use client';

import PlatformIntegrations from '@/components/PlatformIntegrations';
import { ToastProvider } from '@/context/ToastContext';
import ToastContainer from '@/components/ToastContainer';

export default function IntegrationsPage() {
  return (
    <ToastProvider>
      <PlatformIntegrations />
      <ToastContainer />
    </ToastProvider>
  );
}
```

## 2. What You Get

### 6 Platform Cards
- **YouTube** - Red theme with video icon
- **Instagram** - Pink/purple gradient theme
- **LinkedIn** - Blue professional theme
- **Twitter** - Sky blue theme
- **TikTok** - Black theme
- **Facebook** - Blue theme

### Each Card Shows
- Platform icon and name
- Connection status (connected/disconnected/error)
- Connect/Disconnect button
- When connected:
  - Username
  - Follower count
  - Last sync time
  - Sync button
  - Settings button

### Settings Modal
- Auto Post toggle
- Notifications toggle
- Sync frequency (realtime/hourly/daily)

## 3. User Flow

### Connecting a Platform
1. Click "Connect" button on any platform card
2. Loading state shows "Connecting..."
3. After 2 seconds, connection completes
4. Success toast notification appears
5. Card updates to show account info

### Syncing Data
1. Click "Sync Now" on connected platform
2. Loading state shows "Syncing..."
3. After 1.5 seconds, sync completes
4. Last sync time updates
5. Success toast notification

### Configuring Settings
1. Click settings icon (⚙️) on connected platform
2. Modal opens with current settings
3. Toggle switches for Auto Post and Notifications
4. Select sync frequency (realtime/hourly/daily)
5. Click "Save Changes"
6. Success toast notification

### Disconnecting
1. Click "Disconnect" button
2. Platform immediately disconnects
3. Card returns to disconnected state
4. Info toast notification

## 4. Customization Examples

### Change Platform Colors

```typescript
// In PlatformIntegrations.tsx
const PLATFORM_CONFIG = {
  youtube: { name: 'YouTube', icon: '▶', color: '#FF0000' }, // Change this
  // ... other platforms
};
```

### Add Custom Platform

```typescript
const PLATFORM_CONFIG = {
  // ... existing platforms
  discord: { 
    name: 'Discord', 
    icon: '💬', 
    color: '#5865F2' 
  },
};

// Update type
type PlatformName = 'youtube' | 'instagram' | 'linkedin' | 'twitter' | 'tiktok' | 'facebook' | 'discord';
```

### Modify Connection Timeout

```typescript
// In handleConnect function
await new Promise(resolve => setTimeout(resolve, 2000)); // Change 2000 to desired ms
```

### Change Success Rate

```typescript
// In handleConnect function
const isSuccess = Math.random() > 0.2; // Change 0.2 (80% success) to desired rate
```

## 5. Integration with Backend

### Replace Mock OAuth with Real Implementation

```typescript
const handleConnect = async (platformId: PlatformName) => {
  setPlatforms(prev =>
    prev.map(p => (p.id === platformId ? { ...p, isLoading: true } : p))
  );

  try {
    // Call your backend OAuth endpoint
    const response = await fetch(`/api/oauth/${platformId}/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) throw new Error('Connection failed');

    const data = await response.json();
    
    setPlatforms(prev =>
      prev.map(p =>
        p.id === platformId
          ? { 
              ...p, 
              status: 'connected', 
              account: {
                username: data.username,
                followers: data.followers,
                lastSync: new Date(data.lastSync),
              },
              isLoading: false 
            }
          : p
      )
    );

    addToast('success', `Successfully connected to ${PLATFORM_CONFIG[platformId].name}!`);
  } catch (error) {
    setPlatforms(prev =>
      prev.map(p =>
        p.id === platformId ? { ...p, status: 'error', isLoading: false } : p
      )
    );

    addToast('error', `Failed to connect to ${PLATFORM_CONFIG[platformId].name}.`);
  }
};
```

### Load Initial Platform Status

```typescript
// Add useEffect to load status on mount
useEffect(() => {
  const loadPlatformStatus = async () => {
    try {
      const response = await fetch('/api/platforms/status');
      const data = await response.json();
      
      setPlatforms(prev =>
        prev.map(p => {
          const platformData = data[p.id];
          if (platformData?.connected) {
            return {
              ...p,
              status: 'connected',
              account: {
                username: platformData.username,
                followers: platformData.followers,
                lastSync: new Date(platformData.lastSync),
              },
            };
          }
          return p;
        })
      );
    } catch (error) {
      console.error('Failed to load platform status:', error);
    }
  };

  loadPlatformStatus();
}, []);
```

## 6. Responsive Breakpoints

The component automatically adjusts layout:

- **Mobile (< 768px)**: 1 column
- **Tablet (768px - 1024px)**: 2 columns
- **Desktop (> 1024px)**: 3 columns

## 7. Toast Notifications

The component uses the existing ToastContext:

- **Success**: Green - Connection/sync successful
- **Error**: Red - Connection/sync failed
- **Info**: Blue - Disconnection notice

## 8. Accessibility Features

- Semantic HTML structure
- ARIA labels on icon buttons
- Keyboard navigation support
- Focus management in modals
- Screen reader friendly status text

## 9. Performance Tips

- Component uses local state (no global state pollution)
- Animations are GPU-accelerated via Framer Motion
- Efficient re-renders (only affected cards update)
- Lazy loading ready (can add React.lazy if needed)

## 10. Common Issues

### Toast not showing
**Solution**: Ensure ToastProvider wraps the component and ToastContainer is rendered.

### Animations not smooth
**Solution**: Check that framer-motion is installed: `npm install framer-motion`

### Cards not responsive
**Solution**: Verify Tailwind's responsive classes are working. Check tailwind.config.ts includes proper breakpoints.

### Settings not saving
**Solution**: Currently saves to local state only. Implement backend persistence for production.

## Next Steps

1. ✅ Component is ready to use as-is for demos
2. 🔄 Replace mock OAuth with real implementation
3. 🔄 Connect to backend API for persistence
4. 🔄 Add analytics tracking
5. 🔄 Implement real-time sync with WebSockets

## Support

For detailed documentation, see `PlatformIntegrations.README.md`
