'use client';

import React, { useState } from 'react';

interface SubscriptionManagementProps {
  currentPlan: {
    id: string;
    name: string;
    price: number | null;
    renewalDate?: string;
  };
  onUpgrade: () => void;
  onDowngrade: () => void;
  onCancel: () => void;
}

export default function SubscriptionManagement({
  currentPlan,
  onUpgrade,
  onDowngrade,
  onCancel,
}: SubscriptionManagementProps) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleCancelClick = () => {
    setShowCancelConfirm(true);
  };

  const handleConfirmCancel = () => {
    onCancel();
    setShowCancelConfirm(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 mb-16">
      <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Manage Your Subscription
        </h2>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-black/30 rounded-lg p-6 border border-gray-700">
            <div className="text-sm text-gray-400 mb-2">Current Plan</div>
            <div className="text-2xl font-bold text-white mb-1">{currentPlan.name}</div>
            <div className="text-lg text-gray-300">
              {currentPlan.price === null ? 'Free' : `$${currentPlan.price}/month`}
            </div>
          </div>

          {currentPlan.renewalDate && (
            <div className="bg-black/30 rounded-lg p-6 border border-gray-700">
              <div className="text-sm text-gray-400 mb-2">Next Billing Date</div>
              <div className="text-2xl font-bold text-white">
                {new Date(currentPlan.renewalDate).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {currentPlan.id !== 'enterprise' && (
            <button
              onClick={onUpgrade}
              className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-purple-500/50"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                Upgrade Plan
              </span>
            </button>
          )}

          {currentPlan.id !== 'free' && (
            <>
              <button
                onClick={onDowngrade}
                className="w-full md:w-auto px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-all duration-300 border border-white/20 ml-0 md:ml-4"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  Downgrade Plan
                </span>
              </button>

              <button
                onClick={handleCancelClick}
                className="w-full md:w-auto px-6 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 font-semibold rounded-lg transition-all duration-300 border border-red-600/50 ml-0 md:ml-4"
              >
                Cancel Subscription
              </button>
            </>
          )}
        </div>

        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full border border-gray-700 shadow-2xl">
              <h3 className="text-2xl font-bold mb-4 text-white">Cancel Subscription?</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to cancel your subscription? You'll lose access to all premium features at the end of your billing period.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={handleConfirmCancel}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-300"
                >
                  Yes, Cancel
                </button>
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all duration-300"
                >
                  Keep Plan
                </button>
              </h3>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
