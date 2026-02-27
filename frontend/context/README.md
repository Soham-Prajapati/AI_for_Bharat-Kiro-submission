# AppContext Usage Guide

## Setup

Wrap your app with the `AppProvider`:

```tsx
import { AppProvider } from './context/AppContext';

function App() {
  return (
    <AppProvider>
      <YourApp />
    </AppProvider>
  );
}
```

## Basic Usage

### Using the main hook

```tsx
import { useAppContext } from './context/AppContext';

function MyComponent() {
  const { state, actions } = useAppContext();
  
  // Access state
  const user = state.user;
  const contentItems = state.content.items;
  
  // Dispatch actions
  const handleLogin = (userData) => {
    actions.setUser(userData);
  };
  
  return <div>{user?.name}</div>;
}
```

### Using convenience hooks

```tsx
import { useUser, useContent, useSettings } from './context/AppContext';

function Profile() {
  const user = useUser();
  const { items, currentItem } = useContent();
  const settings = useSettings();
  
  return (
    <div>
      <h1>{user?.name}</h1>
      <p>Theme: {settings.theme}</p>
      <p>Content items: {items.length}</p>
    </div>
  );
}
```

## Action Examples

### User Actions

```tsx
const { actions } = useAppContext();

// Set user
actions.setUser({
  id: '123',
  name: 'John Doe',
  email: 'john@example.com',
  subscription: 'pro',
  preferences: {
    emailNotifications: true,
    pushNotifications: false,
    autoSave: true,
  },
});

// Logout
actions.logoutUser();
```

### Content Actions

```tsx
// Add content item
actions.addContentItem({
  id: '456',
  title: 'My Article',
  type: 'article',
  content: 'Article content...',
  status: 'draft',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// Update content item
actions.updateContentItem('456', {
  title: 'Updated Title',
  status: 'published',
});

// Delete content item
actions.deleteContentItem('456');

// Set current item
actions.setCurrentItem(contentItem);

// Set generation status
actions.setGenerationStatus({
  isGenerating: true,
  progress: 50,
  message: 'Generating content...',
});
```

### Settings Actions

```tsx
// Update theme
actions.updateSettings({
  theme: 'dark',
});

// Update notifications
actions.updateSettings({
  notifications: {
    email: false,
    push: true,
    inApp: true,
  },
});
```

### Loading & Error Actions

```tsx
// Set loading
actions.setLoading(true);

// Set error
actions.setError('Failed to load content');

// Clear error
actions.clearError();
```

## LocalStorage Persistence

User data and settings are automatically persisted to localStorage:
- User: `app_user`
- Settings: `app_settings`

This happens automatically when state changes.

## TypeScript Support

All types are exported for use in your components:

```tsx
import type { User, ContentItem, Settings, AppState } from './context/AppContext';
```
