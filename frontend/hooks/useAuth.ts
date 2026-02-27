import { useCallback } from 'react';
import { useAppContext, User } from '@/context/AppContext';
import apiClient from '@/services/api';

export function useAuth() {
  const { state, actions } = useAppContext();

  const login = useCallback(async (email: string, password: string) => {
    try {
      actions.setLoading(true);
      actions.clearError();

      const response = await apiClient.auth.login({ email, password });
      
      const user: User = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        avatar: response.user.avatar,
        subscription: 'free',
        preferences: {
          emailNotifications: true,
          pushNotifications: true,
          autoSave: true,
        },
      };
      
      actions.setUser(user);
      
      return { success: true };
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
      
      const user: User = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        avatar: response.user.avatar,
        subscription: 'free',
        preferences: {
          emailNotifications: true,
          pushNotifications: true,
          autoSave: true,
        },
      };
      
      actions.setUser(user);
      
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      actions.setError(message);
      return { success: false, error: message };
    } finally {
      actions.setLoading(false);
    }
  }, [actions]);

  const logout = useCallback(async () => {
    try {
      actions.setLoading(true);
      apiClient.auth.logout();
      actions.logoutUser();
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Logout failed';
      actions.setError(message);
      return { success: false, error: message };
    } finally {
      actions.setLoading(false);
    }
  }, [actions]);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!state.user) return { success: false, error: 'Not authenticated' };

    try {
      actions.setLoading(true);
      actions.clearError();

      // Update local state immediately for better UX
      actions.setUser({ ...state.user, ...updates });
      
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Update failed';
      actions.setError(message);
      return { success: false, error: message };
    } finally {
      actions.setLoading(false);
    }
  }, [state.user, actions]);

  return {
    user: state.user,
    isAuthenticated: !!state.user,
    loading: state.loading,
    error: state.error,
    login,
    register,
    logout,
    updateProfile,
  };
}
