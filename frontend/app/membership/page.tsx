'use client';

import React, { useState } from 'react';
import PricingTable from '@/components/PricingTable';
import SubscriptionManagement from '@/components/SubscriptionManagement';
import { useToast } from '@/context/ToastContext';

export default function MembershipPage() {
  const { addToast } = useToast();
  const [currentPlanId, setCurrentPlanId] = useState<string>('free');
  const [showManagement, setShowManagement] = useState(false);

  const currentPlanDetails = {
    free: { id: 'free', name: 'Free', price: null },
    pro: { id: 'pro', name: 'Pro', price: 29, renewalDate: '2024-02-15' },
    enterprise: { id: 'enterprise', name: 'Enterprise', price: 99, renewalDate: '2024-02-15' },
  };

  const handleSubscribe = (tierId: string) => {
    if (tierId === currentPlanId) {
      addToast('info', 'You are already on this plan');
      return;
    }

    if (tierId === 'enterprise') {
      addToast('info', 'Redirecting to sales team...');
      // In production, this would open a contact form or redirect to sales
      setTimeout(() => {
        addToast('success', 'Sales team will contact you within 24 hours');
      }, 1500);
      return;
    }

    // Simulate subscription change
    setCurrentPlanId(tierId);
    setShowManagement(true);
    addToast(
      'success',
      `Successfully ${tierId === 'free' ? 'downgraded to' : 'upgraded to'} ${tierId.charAt(0).toUpperCase() + tierId.slice(1)} plan!`
    );
  };

  const handleUpgrade = () => {
    addToast('info', 'Redirecting to upgrade options...');
    setShowManagement(false);
    // Scroll to pricing table
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const handleDowngrade = () => {
    if (currentPlanId === 'enterprise') {
      setCurrentPlanId('pro');
      addToast('success', 'Downgraded to Pro plan. Changes will take effect at the end of your billing period.');
    } else if (currentPlanId === 'pro') {
      setCurrentPlanId('free');
      addToast('success', 'Downgraded to Free plan. Changes will take effect at the end of your billing period.');
    }
  };

  const handleCancel = () => {
    setCurrentPlanId('free');
    setShowManagement(false);
    addToast('success', 'Subscription cancelled. You will retain access until the end of your billing period.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-indigo-900/20 animate-pulse-slow" />
        
        <div className="relative max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-purple-600/20 border border-purple-500/50 rounded-full text-sm font-semibold text-purple-300 animate-fade-in">
            Pricing Plans
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up">
            <span className="bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
              Choose Your Plan
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8 animate-slide-up">
            Unlock the full potential of AI-powered content intelligence
          </p>

          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-400 animate-fade-in">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>14-day money-back guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Management Section */}
      {showManagement && currentPlanId !== 'free' && (
        <div className="py-12 animate-slide-up">
          <SubscriptionManagement
            currentPlan={currentPlanDetails[currentPlanId as keyof typeof currentPlanDetails]}
            onUpgrade={handleUpgrade}
            onDowngrade={handleDowngrade}
            onCancel={handleCancel}
          />
        </div>
      )}

      {/* Pricing Table */}
      <div className="py-16 animate-fade-in">
        <PricingTable currentPlanId={currentPlanId} onSubscribe={handleSubscribe} />
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Frequently Asked Questions
        </h2>
        
        <div className="space-y-6">
          {[
            {
              question: 'Can I change my plan later?',
              answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately for upgrades, or at the end of your billing period for downgrades.',
            },
            {
              question: 'What payment methods do you accept?',
              answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and wire transfers for Enterprise plans.',
            },
            {
              question: 'Is there a free trial?',
              answer: 'The Free plan is available forever with no credit card required. Pro and Enterprise plans come with a 14-day money-back guarantee.',
            },
            {
              question: 'What happens if I cancel?',
              answer: 'You retain access to your paid features until the end of your billing period. After that, your account automatically downgrades to the Free plan.',
            },
          ].map((faq, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300"
            >
              <h3 className="text-xl font-semibold mb-3 text-white">{faq.question}</h3>
              <p className="text-gray-300">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 via-blue-900/30 to-indigo-900/30" />
        
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of content creators using AI to maximize their reach
          </p>
          <button
            onClick={() => handleSubscribe('pro')}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-2xl hover:shadow-purple-500/50 text-lg"
          >
            Start Free Trial
          </button>
        </div>
      </div>
    </div>
  );
}
