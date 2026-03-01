/**
 * SubscriptionManager Example Component
 * Demonstrates usage of the useSubscription hook
 */

import React from 'react';
import { useSubscription } from '@/hooks';
import { SubscriptionTier } from '@/types/api';

export function SubscriptionManagerExample() {
  const {
    subscription,
    plans,
    loading,
    error,
    isSubscribed,
    currentTier,
    subscribe,
    cancelSubscription,
    upgradeSubscription,
    refreshStatus,
    clearError,
  } = useSubscription();

  const handleSubscribe = async (tierId: SubscriptionTier) => {
    const success = await subscribe(tierId, 'credit_card');
    if (success) {
      alert('Successfully subscribed!');
    }
  };

  const handleUpgrade = async (newTierId: SubscriptionTier) => {
    const success = await upgradeSubscription(newTierId);
    if (success) {
      alert('Successfully upgraded!');
    }
  };

  const handleCancel = async () => {
    if (confirm('Are you sure you want to cancel your subscription?')) {
      const success = await cancelSubscription();
      if (success) {
        alert('Subscription cancelled');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-gray-600">Loading subscription information...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-red-800">{error}</p>
          </div>
          <button
            onClick={clearError}
            className="text-red-600 hover:text-red-800 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Current Subscription Status */}
      <div className="mb-8 bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Your Subscription</h2>
          <button
            onClick={refreshStatus}
            disabled={loading}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {subscription ? (
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="text-gray-600 w-32">Current Plan:</span>
              <span className="font-semibold text-lg capitalize">{currentTier}</span>
              {isSubscribed && (
                <span className="ml-3 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  Active
                </span>
              )}
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 w-32">Status:</span>
              <span className="capitalize">{subscription.status}</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 w-32">Start Date:</span>
              <span>{new Date(subscription.startDate).toLocaleDateString()}</span>
            </div>
            {subscription.endDate && (
              <div className="flex items-center">
                <span className="text-gray-600 w-32">End Date:</span>
                <span>{new Date(subscription.endDate).toLocaleDateString()}</span>
              </div>
            )}
            {isSubscribed && (
              <div className="pt-4 border-t">
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel Subscription
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-600">No active subscription</p>
        )}
      </div>

      {/* Available Plans */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const isCurrentPlan = plan.tierId === currentTier;
            const canUpgrade = !isCurrentPlan && isSubscribed;
            const canSubscribe = !isSubscribed;

            return (
              <div
                key={plan.tierId}
                className={`bg-white rounded-lg shadow-md p-6 ${
                  isCurrentPlan ? 'ring-2 ring-blue-600' : ''
                }`}
              >
                {isCurrentPlan && (
                  <div className="mb-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      Current Plan
                    </span>
                  </div>
                )}

                <h3 className="text-xl font-bold text-gray-900 mb-2 capitalize">
                  {plan.name}
                </h3>

                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900">
                    ${plan.price}
                  </span>
                  <span className="text-gray-600">/month</span>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg
                        className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.limits && (
                  <div className="mb-6 p-3 bg-gray-50 rounded-lg text-sm">
                    <p className="font-semibold text-gray-700 mb-1">Limits:</p>
                    {plan.limits.uploads && (
                      <p className="text-gray-600">
                        • {plan.limits.uploads} uploads/month
                      </p>
                    )}
                    {plan.limits.generations && (
                      <p className="text-gray-600">
                        • {plan.limits.generations} generations/month
                      </p>
                    )}
                    {plan.limits.storage && (
                      <p className="text-gray-600">
                        • {plan.limits.storage}GB storage
                      </p>
                    )}
                  </div>
                )}

                {!isCurrentPlan && (
                  <button
                    onClick={() =>
                      canUpgrade
                        ? handleUpgrade(plan.tierId)
                        : handleSubscribe(plan.tierId)
                    }
                    disabled={loading}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loading
                      ? 'Processing...'
                      : canUpgrade
                      ? 'Upgrade'
                      : 'Subscribe'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default SubscriptionManagerExample;
