/**
 * useSubscription Hook
 * Manages subscription state and actions for the membership feature
 */

import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/services/api';
import {
  Subscription,
  SubscriptionTier,
  SubscriptionPlan,
  SubscribeRequest,
  UpgradeSubscriptionRequest,
  ApiError,
} from '@/types/api';

interface UseSubscriptionState {
  subscription: Subscription | null;
  plans: SubscriptionPlan[];
  loading: boolean;
  error: string | null;
  isSubscribed: boolean;
  currentTier: SubscriptionTier;
}

interface UseSubscriptionActions {
  subscribe: (tierId: SubscriptionTier, paymentMethod?: string) => Promise<boolean>;
  cancelSubscription: () => Promise<boolean>;
  upgradeSubscription: (newTierId: SubscriptionTier) => Promise<boolean>;
  refreshStatus: () => Promise<void>;
  clearError: () => void;
}

interface UseSubscriptionReturn extends UseSubscriptionState, UseSubscriptionActions {}

/**
 * Custom hook for managing subscription state and actions
 * 
 * @returns {UseSubscriptionReturn} Subscription state and action methods
 * 
 * @example
 * ```tsx
 * const {
 *   subscription,
 *   plans,
 *   loading,
 *   error,
 *   isSubscribed,
 *   currentTier,
 *   subscribe,
 *   cancelSubscription,
 *   upgradeSubscription,
 *   refreshStatus,
 *   clearError
 * } = useSubscription();
 * 
 * // Subscribe to a plan
 * await subscribe('pro', 'credit_card');
 * 
 * // Upgrade subscription
 * await upgradeSubscription('enterprise');
 * 
 * // Cancel subscription
 * await cancelSubscription();
 * ```
 */
export function useSubscription(): UseSubscriptionReturn {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Derived state
  const isSubscribed = subscription?.status === 'active';
  const currentTier: SubscriptionTier = subscription?.tierId || 'free';

  /**
   * Fetch current subscription status
   */
  const fetchSubscriptionStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.membership.getSubscriptionStatus();

      if (response.success) {
        setSubscription(response.subscription);
        setPlans(response.plans);
      } else {
        throw new Error('Failed to fetch subscription status');
      }
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Failed to load subscription information';
      setError(errorMessage);
      console.error('Error fetching subscription status:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Subscribe to a new plan
   */
  const subscribe = useCallback(async (
    tierId: SubscriptionTier,
    paymentMethod?: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const request: SubscribeRequest = {
        tierId,
        paymentMethod,
      };

      const response = await apiClient.membership.subscribe(request);

      if (response.success) {
        setSubscription(response.subscription);
        return true;
      } else {
        throw new Error(response.message || 'Subscription failed');
      }
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : 'Failed to subscribe. Please try again.';
      setError(errorMessage);
      console.error('Error subscribing:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cancel current subscription
   */
  const cancelSubscription = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.membership.cancelSubscription();

      if (response.success) {
        setSubscription(response.subscription);
        return true;
      } else {
        throw new Error(response.message || 'Cancellation failed');
      }
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : 'Failed to cancel subscription. Please try again.';
      setError(errorMessage);
      console.error('Error cancelling subscription:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Upgrade to a higher tier
   */
  const upgradeSubscription = useCallback(async (
    newTierId: SubscriptionTier
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const request: UpgradeSubscriptionRequest = {
        newTierId,
      };

      const response = await apiClient.membership.upgradeSubscription(request);

      if (response.success) {
        setSubscription(response.subscription);
        return true;
      } else {
        throw new Error(response.message || 'Upgrade failed');
      }
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : 'Failed to upgrade subscription. Please try again.';
      setError(errorMessage);
      console.error('Error upgrading subscription:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refresh subscription status
   */
  const refreshStatus = useCallback(async (): Promise<void> => {
    await fetchSubscriptionStatus();
  }, [fetchSubscriptionStatus]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Fetch subscription status on mount
  useEffect(() => {
    fetchSubscriptionStatus();
  }, [fetchSubscriptionStatus]);

  return {
    // State
    subscription,
    plans,
    loading,
    error,
    isSubscribed,
    currentTier,
    // Actions
    subscribe,
    cancelSubscription,
    upgradeSubscription,
    refreshStatus,
    clearError,
  };
}

export default useSubscription;
