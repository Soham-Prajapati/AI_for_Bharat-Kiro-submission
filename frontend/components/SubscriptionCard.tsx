'use client';

import React from 'react';

export interface SubscriptionFeature {
  text: string;
  included: boolean;
}

export interface SubscriptionTier {
  id: string;
  name: string;
  price: number | null; // null for free tier
  period: string;
  description: string;
  features: SubscriptionFeature[];
  cta: string;
  popular?: boolean;
  gradient: string;
}

interface SubscriptionCardProps {
  tier: SubscriptionTier;
  isCurrentPlan?: boolean;
  onSubscribe: (tierId: string) => void;
}

export default function SubscriptionCard({ 
  tier, 
  isCurrentPlan = false, 
  onSubscribe 
}: SubscriptionCardProps) {
  return (
    <div
      className={`
        relative rounded-2xl p-8 transition-all duration-300
        ${tier.popular 
          ? 'bg-gradient-to-br from-purple-900/50 via-blue-900/50 to-indigo-900/50 border-2 border-purple-500 scale-105 shadow-2xl shadow-purple-500/20' 
          : 'bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-gray-700 hover:border-gray-600'
        }
        hover:scale-105 hover:shadow-xl backdrop-blur-sm
      `}
    >
      {tier.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-sm font-semibold">
          Most Popular
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          {tier.name}
        </h3>
        <p className="text-gray-400 text-sm mb-4">{tier.description}</p>
        
        <div className="flex items-baseline justify-center gap-2">
          {tier.price === null ? (
            <span className="text-5xl font-bold text-white">Free</span>
          ) : (
            <>
              <span className="text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                ${tier.price}
              </span>
              <span className="text-gray-400">/{tier.period}</span>
            </>
          )}
        </p>
      </div>

      <ul className="space-y-4 mb-8">
        {tier.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            {feature.included ? (
              <svg
                className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
            <span className={feature.included ? 'text-gray-200' : 'text-gray-500'}>
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSubscribe(tier.id)}
        disabled={isCurrentPlan}
        className={`
          w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300
          ${isCurrentPlan
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
            : tier.popular
            ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-purple-500/50'
            : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
          }
        `}
      >
        {isCurrentPlan ? 'Current Plan' : tier.cta}
      </button>
    </div>
  );
}
