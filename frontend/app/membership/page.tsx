'use client';

import React, { useState } from 'react';
import PricingTable from '@/components/PricingTable';
import SubscriptionManagement from '@/components/SubscriptionManagement';
import { useToast } from '@/context/ToastContext';

const FAQS = [
  { q: 'Can I change my plan later?', a: 'Yes! Upgrade or downgrade anytime. Upgrades apply immediately; downgrades at end of billing period.' },
  { q: 'What payment methods are accepted?', a: 'All major credit cards, UPI, PayPal, and wire transfers for Enterprise. Indian billing in ₹.' },
  { q: 'Is there a free trial?', a: 'The Free plan is available forever with no credit card. Pro and Enterprise include a 14-day money-back guarantee.' },
  { q: 'What happens if I cancel?', a: 'You retain paid features until your billing period ends, then downgrade to Free automatically.' },
]

export default function MembershipPage() {
  const { addToast } = useToast();
  const [currentPlanId, setCurrentPlanId] = useState<string>('free');
  const [showManagement, setShowManagement] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const currentPlanDetails = {
    free:       { id: 'free',       name: 'Free',       price: null },
    pro:        { id: 'pro',        name: 'Pro',        price: 29,  renewalDate: '2024-02-15' },
    enterprise: { id: 'enterprise', name: 'Enterprise', price: 99,  renewalDate: '2024-02-15' },
  };

  const handleSubscribe = (tierId: string) => {
    if (tierId === currentPlanId) { addToast('info', 'You are already on this plan'); return; }
    if (tierId === 'enterprise') {
      addToast('info', 'Connecting you to our sales team…');
      setTimeout(() => addToast('success', 'Sales team will contact you within 24 hours'), 1500);
      return;
    }
    setCurrentPlanId(tierId);
    setShowManagement(true);
    addToast('success', `${tierId === 'free' ? 'Downgraded to' : 'Upgraded to'} ${tierId.charAt(0).toUpperCase() + tierId.slice(1)} plan!`);
  };

  const handleUpgrade = () => { addToast('info', 'Redirecting to upgrade options…'); setShowManagement(false); window.scrollTo({ top: 400, behavior: 'smooth' }); };
  const handleDowngrade = () => {
    if (currentPlanId === 'enterprise') { setCurrentPlanId('pro'); addToast('success', 'Downgraded to Pro. Takes effect at billing period end.'); }
    else if (currentPlanId === 'pro') { setCurrentPlanId('free'); addToast('success', 'Downgraded to Free. Takes effect at billing period end.'); }
  };
  const handleCancel = () => { setCurrentPlanId('free'); setShowManagement(false); addToast('success', 'Subscription cancelled. Access retained until billing period ends.'); };

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 space-y-16 py-10">

        {/* Hero */}
        <div className="text-center space-y-6 pt-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
            <span className="text-[10px] font-mono font-semibold text-brand-400 uppercase tracking-widest">Pricing Plans</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-black font-display leading-none">
            Choose Your{' '}
            <span className="bg-gradient-to-r from-brand-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Plan
            </span>
          </h1>

          <p className="text-lg text-white/50 max-w-2xl mx-auto">
            Unlock the full power of AI-driven content intelligence for Indian creators.
          </p>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-white/40">
            {['No credit card required', 'Cancel anytime', '14-day money-back guarantee'].map(t => (
              <div key={t} className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Subscription Management */}
        {showManagement && currentPlanId !== 'free' && (
          <div className="animate-fade-in">
            <SubscriptionManagement
              currentPlan={currentPlanDetails[currentPlanId as keyof typeof currentPlanDetails]}
              onUpgrade={handleUpgrade}
              onDowngrade={handleDowngrade}
              onCancel={handleCancel}
            />
          </div>
        )}

        {/* Pricing Table */}
        <PricingTable currentPlanId={currentPlanId} onSubscribe={handleSubscribe} />

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black font-display text-center mb-8">
            Frequently Asked{' '}
            <span className="bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">Questions</span>
          </h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-white/[0.12] transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between text-left px-6 py-5"
                >
                  <span className="font-semibold text-white">{faq.q}</span>
                  <span className={`text-white/40 transition-transform duration-200 ${openFaq === i ? 'rotate-45' : ''}`}>＋</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-sm text-white/50 border-t border-white/[0.05] pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="relative overflow-hidden bg-gradient-to-br from-brand-900/40 to-purple-900/20 border border-brand-500/20 rounded-3xl p-12 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.08),transparent_70%)]" />
          <div className="relative">
            <h2 className="text-4xl font-black font-display mb-4">Ready to Grow?</h2>
            <p className="text-white/50 mb-8">Join thousands of Indian creators using AI to multiply their reach.</p>
            <button
              onClick={() => handleSubscribe('pro')}
              className="px-10 py-4 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-brand-500/20 text-base"
            >
              Start Free Trial
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
