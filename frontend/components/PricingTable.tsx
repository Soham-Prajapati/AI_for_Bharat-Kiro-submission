'use client';

import React from 'react';
import SubscriptionCard, { SubscriptionTier } from './SubscriptionCard';

interface PricingTableProps {
  currentPlanId?: string;
  onSubscribe: (tierId: string) => void;
}

const pricingTiers: SubscriptionTier[] = [
  {
    id: 'free',
    name: 'Free',
    price: null,
    period: 'forever',
    description: 'Perfect for getting started',
    gradient: 'from-gray-900 to-gray-800',
    cta: 'Get Started',
    features: [
      { text: 'Basic content analysis', included: true },
      { text: '5 videos per month', included: true },
      { text: '1 platform integration', included: true },
      { text: 'Community support', included: true },
      { text: 'Basic analytics', included: true },
      { text: 'Priority support', included: false },
      { text: 'Advanced AI features', included: false },
      { text: 'Custom integrations', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    period: 'month',
    description: 'For content creators and small teams',
    gradient: 'from-purple-900 to-blue-900',
    cta: 'Subscribe to Pro',
    popular: true,
    features: [
      { text: 'All basic features', included: true },
      { text: 'Unlimited videos', included: true },
      { text: '6 platform integrations', included: true },
      { text: 'Priority support', included: true },
      { text: 'Advanced analytics & insights', included: true },
      { text: 'AI-powered recommendations', included: true },
      { text: 'Viral score predictions', included: true },
      { text: 'Content DNA analysis', included: true },
      { text: 'Custom integrations', included: false },
      { text: 'White-label options', included: false },
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    period: 'month',
    description: 'For agencies and large organizations',
    gradient: 'from-indigo-900 to-purple-900',
    cta: 'Contact Sales',
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Unlimited team members', included: true },
      { text: 'Custom integrations', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'White-label options', included: true },
      { text: 'API access', included: true },
      { text: 'Custom AI model training', included: true },
      { text: 'SLA guarantee', included: true },
      { text: 'Advanced security features', included: true },
      { text: 'Custom reporting', included: true },
    ],
  },
];

export default function PricingTable({ currentPlanId, onSubscribe }: PricingTableProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">
      {pricingTiers.map((tier) => (
        <SubscriptionCard
          key={tier.id}
          tier={tier}
          isCurrentPlan={currentPlanId === tier.id}
          onSubscribe={onSubscribe}
        />
      ))}
    </div>
  );
}

export { pricingTiers };
export type { SubscriptionTier };
