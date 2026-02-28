# PlatformIntegrations Component

A comprehensive platform integration management component for connecting and managing social media accounts with OAuth flow simulation.

## Features

### Core Functionality
- **6 Platform Support**: YouTube, Instagram, LinkedIn, Twitter, TikTok, Facebook
- **OAuth Flow Simulation**: Connect/disconnect with realistic loading states
- **Connection Status**: Real-time status indicators (connected, disconnected, error)
- **Account Information**: Display username, followers, and last sync time
- **Sync Functionality**: Manual sync with loading states and timestamps
- **Platform Settings**: Configurable settings modal for each platform

### UI/UX Features
- **Responsive Design**: 3 columns (desktop), 2 columns (tablet), 1 column (mobile)
- **Dark Mode**: Modern dark theme with gradient backgrounds
- **Smooth Animations**: Framer Motion animations for all interactions
- **Toast Notifications**: Success/error/info notifications for all actions
- **Loading States**: Visual feedback during async operations
- **Platform Branding**: Color-coded cards with platform-specific styling

### Settings Options
- **Auto Post**: Toggle automatic content publishing
- **Notifications**: Enable/disable platform notifications
- **Sync Frequency**: Choose between realtime, hourly, or daily sync

## Installation

The component requires the following dependencies (already included in package.json):

```json
{
  "framer-motion": "^11.0.0",
  "react": "^18.3.0",
  "react-dom": "^18.3.0"
}
```

## Usage

### Basic Usage

```tsx
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

### In Next.js App Router

```tsx
// app/integrations/page.tsx
'use client';

import PlatformIntegrations from '@/components/PlatformIntegrations';
import { ToastProvider } from '@/context/ToastContext';
import ToastContainer from '@/components/ToastContainer';

export default function IntegrationsPage() {
  return (
    <ToastProvider>
      <div className="min-h-screen">
        <PlatformIntegrations />
        <ToastContainer />
      </div>
    </ToastProvider>
  );
}
```

## Component Structure

### Main Component: `PlatformIntegrations`
The root component that manages state and renders the platform grid.

**State Management:**
- `platforms`: Array of platform objects with connection status
- `selectedPlatform`: Currently selected platform for settings
- `showSettingsModal`: Modal visibility state
- `platformSettings`: Settings configuration for each platform

**Key Functions:**
- `handleConnect(platformId)`: Initiates OAuth connection flow
- `handleDisconnect(platformId)`: Disconnects platform
- `handleSync(platformId)`: Syncs platform data
- `openSettings(platformId)`: Opens settings modal

### Sub-Component: `PlatformCard`
Individual platform card displaying connection status and actions.

**Props:**
- `platform`: Platform data object
- `index`: Card index for staggered animations
- `onConnect`: Connect handler
- `onDisconnect`: Disconnect handler
- `onSync`: Sync handler
- `onSettings`: Settings handler
- `formatNumber`: Number formatting utility
- `formatLastSync`: Date formatting utility

### Sub-Component: `SettingsModal`
Modal for configuring platform-specific settings.

**Props:**
- `platform`: Platform identifier
- `settings`: Current settings object
- `onClose`: Close handler
- `onSave`: Save handler
- `onChange`: Settings change handler

## Types

```typescript
type PlatformName = 'youtube' | 'instagram' | 'linkedin' | 'twitter' | 'tiktok' | 'facebook';

type ConnectionStatus = 'connected' | 'disconnected' | 'error';

interface PlatformAccount {
  username: string;
  followers: number;
  lastSync: Date | null;
}

interface Platform {
  id: PlatformName;
  name: string;
  icon: string;
  color: string;
  status: ConnectionStatus;
  account: PlatformAccount | null;
  isLoading: boolean;
}

interface PlatformSettings {
  autoPost: boolean;
  notifications: boolean;
  syncFrequency: 'realtime' | 'hourly' | 'daily';
}
```

## Customization

### Adding New Platforms

To add a new platform, update the `PLATFORM_CONFIG` object:

```typescript
const PLATFORM_CONFIG = {
  // ... existing platforms
  newplatform: { 
    name: 'New Platform', 
    icon: '🆕', 
    color: '#FF00FF' 
  },
};
```

### Styling

The component uses TailwindCSS with custom gradients and colors. Key styling classes:

- Background: `bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900`
- Cards: `bg-gray-800 rounded-xl border border-gray-700`
- Buttons: Platform-specific gradient backgrounds
- Animations: Framer Motion with staggered delays

### OAuth Integration

Currently simulates OAuth flow. To integrate real OAuth:

1. Replace the `handleConnect` function with actual OAuth logic
2. Use platform-specific OAuth libraries
3. Handle OAuth callbacks and token storage
4. Update error handling for real API responses

```typescript
const handleConnect = async (platformId: PlatformName) => {
  // Replace with actual OAuth implementation
  const authUrl = getOAuthUrl(platformId);
  const popup = window.open(authUrl, 'oauth', 'width=600,height=700');
  
  // Listen for OAuth callback
  window.addEventListener('message', (event) => {
    if (event.data.type === 'oauth-success') {
      // Handle successful authentication
      updatePlatformStatus(platformId, event.data.account);
    }
  });
};
```

## API Integration

To connect to a real backend API:

```typescript
// services/platformService.ts
export const platformService = {
  connect: async (platform: PlatformName) => {
    const response = await fetch(`/api/platforms/${platform}/connect`, {
      method: 'POST',
    });
    return response.json();
  },
  
  disconnect: async (platform: PlatformName) => {
    const response = await fetch(`/api/platforms/${platform}/disconnect`, {
      method: 'POST',
    });
    return response.json();
  },
  
  sync: async (platform: PlatformName) => {
    const response = await fetch(`/api/platforms/${platform}/sync`, {
      method: 'POST',
    });
    return response.json();
  },
  
  getStatus: async () => {
    const response = await fetch('/api/platforms/status');
    return response.json();
  },
};
```

## Accessibility

The component includes:
- ARIA labels for icon buttons
- Keyboard navigation support
- Focus management in modals
- Screen reader friendly status indicators

## Performance

- Lazy loading of platform data
- Optimized re-renders with React.memo (can be added)
- Efficient state updates
- Debounced sync operations

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Responsive design optimized

## Troubleshooting

### Toast notifications not appearing
Ensure `ToastProvider` wraps the component and `ToastContainer` is rendered.

### Animations not working
Check that `framer-motion` is installed: `npm install framer-motion`

### Styling issues
Verify TailwindCSS is configured correctly in `tailwind.config.ts`

## Future Enhancements

- [ ] Real OAuth integration
- [ ] Backend API connection
- [ ] Persistent storage (localStorage/database)
- [ ] Advanced analytics per platform
- [ ] Bulk operations (connect/disconnect all)
- [ ] Platform health monitoring
- [ ] Scheduled sync configuration
- [ ] Multi-account support per platform
- [ ] Platform-specific content preview
- [ ] Export/import settings

## License

Part of the Content Intelligence Platform Frontend
