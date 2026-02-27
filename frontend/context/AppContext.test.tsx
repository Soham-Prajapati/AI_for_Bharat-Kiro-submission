import { renderHook, act } from '@testing-library/react';
import { AppProvider, useAppContext, actionCreators } from './AppContext';
import type { User, ContentItem } from './AppContext';

// ============================================================================
// Test Wrapper
// ============================================================================

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppProvider>{children}</AppProvider>
);

// ============================================================================
// Mock Data
// ============================================================================

const mockUser: User = {
  id: '123',
  name: 'Test User',
  email: 'test@example.com',
  subscription: 'pro',
  preferences: {
    emailNotifications: true,
    pushNotifications: false,
    autoSave: true,
  },
};

const mockContentItem: ContentItem = {
  id: '456',
  title: 'Test Article',
  type: 'article',
  content: 'Test content',
  status: 'draft',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

// ============================================================================
// Tests
// ============================================================================

describe('AppContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('User Actions', () => {
    it('should set user', () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });

      act(() => {
        result.current.dispatch(actionCreators.setUser(mockUser));
      });

      expect(result.current.state.user).toEqual(mockUser);
      expect(result.current.state.error).toBeNull();
    });

    it('should logout user', () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });

      act(() => {
        result.current.dispatch(actionCreators.setUser(mockUser));
      });

      expect(result.current.state.user).toEqual(mockUser);

      act(() => {
        result.current.dispatch(actionCreators.logoutUser());
      });

      expect(result.current.state.user).toBeNull();
      expect(result.current.state.content.items).toEqual([]);
    });

    it('should persist user to localStorage', () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });

      act(() => {
        result.current.dispatch(actionCreators.setUser(mockUser));
      });

      const stored = localStorage.getItem('app_user');
      expect(stored).toBeTruthy();
      expect(JSON.parse(stored!)).toEqual(mockUser);
    });
  });

  describe('Content Actions', () => {
    it('should add content item', () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });

      act(() => {
        result.current.dispatch(actionCreators.addContentItem(mockContentItem));
      });

      expect(result.current.state.content.items).toHaveLength(1);
      expect(result.current.state.content.items[0]).toEqual(mockContentItem);
    });

    it('should update content item', () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });

      act(() => {
        result.current.dispatch(actionCreators.addContentItem(mockContentItem));
      });

      const updates = { title: 'Updated Title', status: 'published' as const };

      act(() => {
        result.current.dispatch(actionCreators.updateContentItem(mockContentItem.id, updates));
      });

      const updatedItem = result.current.state.content.items[0];
      expect(updatedItem.title).toBe('Updated Title');
      expect(updatedItem.status).toBe('published');
      expect(updatedItem.updatedAt).not.toBe(mockContentItem.updatedAt);
    });

    it('should delete content item', () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });

      act(() => {
        result.current.dispatch(actionCreators.addContentItem(mockContentItem));
      });

      expect(result.current.state.content.items).toHaveLength(1);

      act(() => {
        result.current.dispatch(actionCreators.deleteContentItem(mockContentItem.id));
      });

      expect(result.current.state.content.items).toHaveLength(0);
    });

    it('should set current item', () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });

      act(() => {
        result.current.dispatch(actionCreators.setCurrentItem(mockContentItem));
      });

      expect(result.current.state.content.currentItem).toEqual(mockContentItem);
    });

    it('should set generation status', () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });

      const status = {
        isGenerating: true,
        progress: 50,
        message: 'Generating...',
      };

      act(() => {
        result.current.dispatch(actionCreators.setGenerationStatus(status));
      });

      expect(result.current.state.content.generationStatus).toEqual(status);
    });

    it('should clear current item when deleted', () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });

      act(() => {
        result.current.dispatch(actionCreators.addContentItem(mockContentItem));
        result.current.dispatch(actionCreators.setCurrentItem(mockContentItem));
      });

      expect(result.current.state.content.currentItem).toEqual(mockContentItem);

      act(() => {
        result.current.dispatch(actionCreators.deleteContentItem(mockContentItem.id));
      });

      expect(result.current.state.content.currentItem).toBeNull();
    });
  });

  describe('Settings Actions', () => {
    it('should update theme', () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });

      act(() => {
        result.current.dispatch(actionCreators.updateSettings({ theme: 'dark' }));
      });

      expect(result.current.state.settings.theme).toBe('dark');
    });

    it('should update notifications', () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });

      act(() => {
        result.current.dispatch(
          actionCreators.updateSettings({
            notifications: { email: false, push: true, inApp: false },
          })
        );
      });

      expect(result.current.state.settings.notifications).toEqual({
        email: false,
        push: true,
        inApp: false,
      });
    });

    it('should persist settings to localStorage', () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });

      act(() => {
        result.current.dispatch(actionCreators.updateSettings({ theme: 'dark' }));
      });

      const stored = localStorage.getItem('app_settings');
      expect(stored).toBeTruthy();
      const settings = JSON.parse(stored!);
      expect(settings.theme).toBe('dark');
    });
  });

  describe('Loading and Error Actions', () => {
    it('should set loading state', () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });

      act(() => {
        result.current.dispatch(actionCreators.setLoading(true));
      });

      expect(result.current.state.loading).toBe(true);

      act(() => {
        result.current.dispatch(actionCreators.setLoading(false));
      });

      expect(result.current.state.loading).toBe(false);
    });

    it('should set error', () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });

      act(() => {
        result.current.dispatch(actionCreators.setError('Test error'));
      });

      expect(result.current.state.error).toBe('Test error');
      expect(result.current.state.loading).toBe(false);
    });

    it('should clear error', () => {
      const { result } = renderHook(() => useAppContext(), { wrapper });

      act(() => {
        result.current.dispatch(actionCreators.setError('Test error'));
      });

      expect(result.current.state.error).toBe('Test error');

      act(() => {
        result.current.dispatch(actionCreators.clearError());
      });

      expect(result.current.state.error).toBeNull();
    });
  });

  describe('Action Creators', () => {
    it('should have correct action types', () => {
      expect(actionCreators.setUser(mockUser).type).toBe('SET_USER');
      expect(actionCreators.logoutUser().type).toBe('LOGOUT_USER');
      expect(actionCreators.setLoading(true).type).toBe('SET_LOADING');
      expect(actionCreators.setError('error').type).toBe('SET_ERROR');
      expect(actionCreators.clearError().type).toBe('CLEAR_ERROR');
    });
  });

  describe('LocalStorage Persistence', () => {
    it('should load user from localStorage on mount', () => {
      localStorage.setItem('app_user', JSON.stringify(mockUser));

      const { result } = renderHook(() => useAppContext(), { wrapper });

      expect(result.current.state.user).toEqual(mockUser);
    });

    it('should load settings from localStorage on mount', () => {
      const customSettings = {
        theme: 'dark' as const,
        language: 'es',
        notifications: { email: false, push: false, inApp: false },
      };

      localStorage.setItem('app_settings', JSON.stringify(customSettings));

      const { result } = renderHook(() => useAppContext(), { wrapper });

      expect(result.current.state.settings).toEqual(customSettings);
    });

    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem('app_user', 'invalid json');

      const { result } = renderHook(() => useAppContext(), { wrapper });

      expect(result.current.state.user).toBeNull();
    });
  });
});
