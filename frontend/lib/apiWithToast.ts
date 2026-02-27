import { ToastType } from '@/context/ToastContext';

/**
 * Helper type for the addToast function
 */
export type AddToastFn = (type: ToastType, message: string, duration?: number) => void;

/**
 * Wrapper for API calls that automatically shows toast notifications on error
 * @param apiCall - The API call function to execute
 * @param addToast - The addToast function from useToast hook
 * @param options - Configuration options
 * @returns Promise with the API call result
 */
export async function apiWithToast<T>(
  apiCall: () => Promise<T>,
  addToast: AddToastFn,
  options?: {
    successMessage?: string;
    errorMessage?: string;
    showSuccess?: boolean;
  }
): Promise<T> {
  try {
    const result = await apiCall();
    
    if (options?.showSuccess && options?.successMessage) {
      addToast('success', options.successMessage);
    }
    
    return result;
  } catch (error: any) {
    const errorMessage = 
      options?.errorMessage || 
      error?.message || 
      'An unexpected error occurred';
    
    addToast('error', errorMessage);
    throw error;
  }
}

/**
 * Extract user-friendly error message from various error types
 */
export function getErrorMessage(error: any): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error?.response?.statusText) {
    return error.response.statusText;
  }
  
  return 'An unexpected error occurred';
}
