import { useToast } from '@/context/ToastContext';
import { getErrorMessage } from '@/lib/apiWithToast';

/**
 * Enhanced toast hook with common notification patterns
 * Provides convenient methods for typical use cases
 */
export function useToastNotifications() {
  const { addToast } = useToast();

  return {
    // Direct access to addToast
    addToast,

    // Convenience methods
    success: (message: string, duration?: number) => {
      addToast('success', message, duration);
    },

    error: (error: any, customMessage?: string, duration?: number) => {
      const message = customMessage || getErrorMessage(error);
      addToast('error', message, duration);
    },

    warning: (message: string, duration?: number) => {
      addToast('warning', message, duration);
    },

    info: (message: string, duration?: number) => {
      addToast('info', message, duration);
    },

    // API-specific helpers
    apiSuccess: (operation: string = 'Operation') => {
      addToast('success', `${operation} completed successfully!`);
    },

    apiError: (error: any, operation: string = 'Operation') => {
      const message = `${operation} failed: ${getErrorMessage(error)}`;
      addToast('error', message);
    },

    // Form validation
    validationError: (message: string = 'Please check your input') => {
      addToast('warning', message);
    },

    // Network errors
    networkError: () => {
      addToast('error', 'Network error. Please check your connection.', 0);
    },

    // Permission errors
    permissionError: () => {
      addToast('error', 'You do not have permission to perform this action.');
    },

    // Generic loading complete
    loadingComplete: (itemName: string = 'Data') => {
      addToast('success', `${itemName} loaded successfully!`);
    },

    // Save confirmation
    saveSuccess: () => {
      addToast('success', 'Changes saved successfully!');
    },

    // Delete confirmation
    deleteSuccess: (itemName: string = 'Item') => {
      addToast('success', `${itemName} deleted successfully!`);
    },
  };
}
