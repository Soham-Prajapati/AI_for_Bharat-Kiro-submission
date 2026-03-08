import { useCallback } from 'react';
import { useAppContext, User } from '@/context/AppContext';
import apiClient from '@/services/api';

export function useAuth() {
  const { state, actions, hydrated } = useAppContext();

  const login = useCallback(async (email: string, password: string) => {
    try {
      actions.setLoading(true);
      actions.clearError();

      const response = await apiClient.auth.login({ email, password });

      // Set JWT so all subsequent API calls are authenticated
      const token = response.token || response.accessToken;
      if (token) apiClient.setAuthToken(token);

      const user: User = {
        id: response.userId,
        name: response.name || 'Creator',
        email: response.email,
        avatar: undefined,
        subscription: 'free',
        domain: response.domain || undefined,
        audienceType: response.audienceType || undefined,
        creatorMode: response.creatorMode || undefined,
        onboardingComplete: !!response.domain,
        preferences: {
          emailNotifications: true,
          pushNotifications: true,
          autoSave: true,
        },
      };

      actions.setUser(user);
      return { success: true, user };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      actions.setError(message);
      return { success: false, error: message };
    } finally {
      actions.setLoading(false);
    }
  }, [actions]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      actions.setLoading(true);
      actions.clearError();

      const response = await apiClient.auth.register({ name, email, password });

      const token = response.token || response.accessToken;
      if (token) apiClient.setAuthToken(token);

      const user: User = {
        id: response.userId,
        name: response.name || name,
        email: response.email,
        avatar: undefined,
        subscription: 'free',
        onboardingComplete: false,
        preferences: {
          emailNotifications: true,
          pushNotifications: true,
          autoSave: true,
        },
      };

      actions.setUser(user);
      return { success: true, user };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      actions.setError(message);
      return { success: false, error: message };
    } finally {
      actions.setLoading(false);
    }
  }, [actions]);

  const saveProfile = useCallback(async (updates: {
    domain?: string;
    audienceType?: string;
    creatorMode?: string;
    name?: string;
  }) => {
    if (!state.user) return { success: false, error: 'Not authenticated' };

    try {
      actions.setLoading(true);
      actions.clearError();

      // Call backend to persist profile
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiClient.getAuthToken()}`,
        },
        body: JSON.stringify(updates),
      });

      const updatedUser: User = {
        ...state.user,
        ...updates,
        onboardingComplete: true,
      };
      actions.setUser(updatedUser);

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Update failed';
      actions.setError(message);
      return { success: false, error: message };
    } finally {
      actions.setLoading(false);
    }
  }, [state.user, actions]);

  const resetDemo = useCallback(async () => {
    try {
      // Reset profile on backend (clears domain/audienceType/creatorMode)
      const token = apiClient.getAuthToken();
      if (token) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/reset-demo`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
        });
      }
    } catch {
      // Ignore backend errors — still clear everything locally
    }
    // Clear ALL app localStorage
    if (typeof window !== 'undefined') {
      const keysToClear = [
        'authToken', 'app_user', 'app_settings',
        'kla_drafts', 'kla_current_draft', 'workspaceContent',
        'kla_community_banner_dismissed', 'templateContent',
      ];
      keysToClear.forEach(k => localStorage.removeItem(k));
    }
    apiClient.auth.logout();
    actions.logoutUser();
    return { success: true };
  }, [actions]);

  const logout = useCallback(async () => {
    try {
      apiClient.auth.logout();
      actions.logoutUser();
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Logout failed';
      actions.setError(message);
      return { success: false, error: message };
    }
  }, [actions]);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!state.user) return { success: false, error: 'Not authenticated' };
    actions.setUser({ ...state.user, ...updates });
    return { success: true };
  }, [state.user, actions]);

  return {
    user: state.user,
    isAuthenticated: !!state.user,
    hydrated,
    loading: state.loading,
    error: state.error,
    login,
    register,
    logout,
    resetDemo,
    updateProfile,
    saveProfile,
  };
}
