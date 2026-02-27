import React from 'react';
import { useAppContext, useUser, useContent } from './AppContext';

// ============================================================================
// Example 1: Login Component
// ============================================================================

export function LoginExample() {
  const { actions } = useAppContext();

  const handleLogin = async () => {
    try {
      actions.setLoading(true);
      actions.clearError();

      // Simulate API call
      const userData = {
        id: '123',
        name: 'Jane Smith',
        email: 'jane@example.com',
        avatar: 'https://example.com/avatar.jpg',
        subscription: 'pro' as const,
        preferences: {
          emailNotifications: true,
          pushNotifications: true,
          autoSave: true,
        },
      };

      actions.setUser(userData);
      actions.setLoading(false);
    } catch (error) {
      actions.setError('Login failed. Please try again.');
      actions.setLoading(false);
    }
  };

  return <button onClick={handleLogin}>Login</button>;
}

// ============================================================================
// Example 2: Content List Component
// ============================================================================

export function ContentListExample() {
  const { items, currentItem } = useContent();
  const { actions } = useAppContext();

  const handleSelectItem = (item: typeof items[0]) => {
    actions.setCurrentItem(item);
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm('Are you sure?')) {
      actions.deleteContentItem(id);
    }
  };

  return (
    <div>
      <h2>Content Items ({items.length})</h2>
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => handleSelectItem(item)}
          style={{
            padding: '10px',
            border: currentItem?.id === item.id ? '2px solid blue' : '1px solid gray',
            margin: '5px 0',
          }}
        >
          <h3>{item.title}</h3>
          <p>Type: {item.type}</p>
          <p>Status: {item.status}</p>
          <button onClick={(e) => {
            e.stopPropagation();
            handleDeleteItem(item.id);
          }}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Example 3: Content Generator Component
// ============================================================================

export function ContentGeneratorExample() {
  const { generationStatus } = useContent();
  const { actions } = useAppContext();

  const handleGenerate = async () => {
    try {
      actions.setGenerationStatus({
        isGenerating: true,
        progress: 0,
        message: 'Starting generation...',
      });

      // Simulate progress
      for (let i = 0; i <= 100; i += 20) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        actions.setGenerationStatus({
          isGenerating: true,
          progress: i,
          message: `Generating content... ${i}%`,
        });
      }

      // Add generated content
      const newItem = {
        id: Date.now().toString(),
        title: 'Generated Article',
        type: 'article' as const,
        content: 'This is AI-generated content...',
        status: 'draft' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      actions.addContentItem(newItem);
      actions.setGenerationStatus(null);
    } catch (error) {
      actions.setError('Generation failed');
      actions.setGenerationStatus(null);
    }
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={generationStatus?.isGenerating}>
        Generate Content
      </button>
      {generationStatus && (
        <div>
          <p>{generationStatus.message}</p>
          <progress value={generationStatus.progress} max={100} />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Example 4: Settings Component
// ============================================================================

export function SettingsExample() {
  const { state, actions } = useAppContext();
  const { theme, notifications } = state.settings;

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    actions.updateSettings({ theme: newTheme });
  };

  const handleNotificationToggle = (type: keyof typeof notifications) => {
    actions.updateSettings({
      notifications: {
        ...notifications,
        [type]: !notifications[type],
      },
    });
  };

  return (
    <div>
      <h2>Settings</h2>
      
      <div>
        <h3>Theme</h3>
        <select value={theme} onChange={(e) => handleThemeChange(e.target.value as any)}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="system">System</option>
        </select>
      </div>

      <div>
        <h3>Notifications</h3>
        <label>
          <input
            type="checkbox"
            checked={notifications.email}
            onChange={() => handleNotificationToggle('email')}
          />
          Email Notifications
        </label>
        <label>
          <input
            type="checkbox"
            checked={notifications.push}
            onChange={() => handleNotificationToggle('push')}
          />
          Push Notifications
        </label>
        <label>
          <input
            type="checkbox"
            checked={notifications.inApp}
            onChange={() => handleNotificationToggle('inApp')}
          />
          In-App Notifications
        </label>
      </div>
    </div>
  );
}

// ============================================================================
// Example 5: User Profile Component
// ============================================================================

export function UserProfileExample() {
  const user = useUser();
  const { actions } = useAppContext();

  if (!user) {
    return <div>Please log in</div>;
  }

  const handleUpdatePreferences = () => {
    actions.setUser({
      ...user,
      preferences: {
        ...user.preferences,
        autoSave: !user.preferences.autoSave,
      },
    });
  };

  const handleLogout = () => {
    actions.logoutUser();
  };

  return (
    <div>
      <img src={user.avatar} alt={user.name} />
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <p>Subscription: {user.subscription}</p>
      
      <div>
        <h3>Preferences</h3>
        <label>
          <input
            type="checkbox"
            checked={user.preferences.autoSave}
            onChange={handleUpdatePreferences}
          />
          Auto Save
        </label>
      </div>

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

// ============================================================================
// Example 6: Error Handling Component
// ============================================================================

export function ErrorHandlerExample() {
  const { state, actions } = useAppContext();

  if (!state.error) {
    return null;
  }

  return (
    <div style={{ padding: '10px', background: '#fee', border: '1px solid red' }}>
      <strong>Error:</strong> {state.error}
      <button onClick={() => actions.clearError()}>Dismiss</button>
    </div>
  );
}

// ============================================================================
// Example 7: Loading Indicator Component
// ============================================================================

export function LoadingIndicatorExample() {
  const { state } = useAppContext();

  if (!state.loading) {
    return null;
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <div className="spinner">Loading...</div>
    </div>
  );
}
