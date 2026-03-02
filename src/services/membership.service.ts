/**
 * Membership Service
 * 
 * Handles subscription tiers, billing, and membership management
 */

export interface SubscriptionTier {
  id: string;
  name: 'free' | 'pro' | 'enterprise';
  price: number;
  interval: 'monthly' | 'yearly';
  features: string[];
}

export interface Subscription {
  id: string;
  userId: string;
  tierId: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'paused';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  paymentMethod?: string;
  billingHistory: BillingEvent[];
}

export interface BillingEvent {
  id: string;
  subscriptionId: string;
  type: 'payment_success' | 'payment_failed' | 'refund' | 'subscription_created' | 'subscription_canceled';
  amount: number;
  currency: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: 'card' | 'bank_account';
  last4: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

class MembershipService {
  private subscriptions: Map<string, Subscription> = new Map();
  private tiers: SubscriptionTier[] = [
    {
      id: 'tier-free',
      name: 'free',
      price: 0,
      interval: 'monthly',
      features: ['Basic content generation', '10 videos/month', 'Community access']
    },
    {
      id: 'tier-pro-monthly',
      name: 'pro',
      price: 29,
      interval: 'monthly',
      features: ['Unlimited content', 'Advanced AI', 'Priority support', 'Analytics']
    },
    {
      id: 'tier-pro-yearly',
      name: 'pro',
      price: 290,
      interval: 'yearly',
      features: ['Unlimited content', 'Advanced AI', 'Priority support', 'Analytics', '2 months free']
    },
    {
      id: 'tier-enterprise',
      name: 'enterprise',
      price: 99,
      interval: 'monthly',
      features: ['Everything in Pro', 'Custom AI models', 'Dedicated support', 'API access', 'White-label']
    }
  ];

  /**
   * Get all available subscription tiers
   */
  getTiers(): SubscriptionTier[] {
    return this.tiers;
  }

  /**
   * Subscribe user to a tier
   */
  async subscribe(userId: string, tierId: string, paymentMethodId?: string): Promise<Subscription> {
    const tier = this.tiers.find(t => t.id === tierId);
    if (!tier) {
      throw new Error('Invalid tier ID');
    }

    // Check if user already has active subscription
    const existing = Array.from(this.subscriptions.values()).find(
      s => s.userId === userId && (s.status === 'active' || s.status === 'trialing')
    );
    if (existing) {
      throw new Error('User already has an active subscription');
    }

    const now = new Date();
    const periodEnd = new Date(now);
    if (tier.interval === 'monthly') {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }

    const subscription: Subscription = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      tierId,
      status: tier.price === 0 ? 'active' : 'trialing',
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
      paymentMethod: paymentMethodId,
      billingHistory: [
        {
          id: `evt-${Date.now()}`,
          subscriptionId: '',
          type: 'subscription_created',
          amount: tier.price,
          currency: 'USD',
          timestamp: now
        }
      ]
    };

    subscription.billingHistory[0].subscriptionId = subscription.id;
    this.subscriptions.set(subscription.id, subscription);

    return subscription;
  }

  /**
   * Get subscription by ID
   */
  getSubscription(subscriptionId: string): Subscription | undefined {
    return this.subscriptions.get(subscriptionId);
  }

  /**
   * Get user's active subscription
   */
  getUserSubscription(userId: string): Subscription | undefined {
    return Array.from(this.subscriptions.values()).find(
      s => s.userId === userId && (s.status === 'active' || s.status === 'trialing')
    );
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string, immediate: boolean = false): Promise<Subscription> {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    if (immediate) {
      subscription.status = 'canceled';
      subscription.currentPeriodEnd = new Date();
    } else {
      subscription.cancelAtPeriodEnd = true;
    }

    subscription.billingHistory.push({
      id: `evt-${Date.now()}`,
      subscriptionId: subscription.id,
      type: 'subscription_canceled',
      amount: 0,
      currency: 'USD',
      timestamp: new Date(),
      metadata: { immediate }
    });

    return subscription;
  }

  /**
   * Process recurring billing
   */
  async processRecurringBilling(subscriptionId: string): Promise<{ success: boolean; error?: string }> {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const tier = this.tiers.find(t => t.id === subscription.tierId);
    if (!tier) {
      throw new Error('Tier not found');
    }

    // Simulate payment processing
    const paymentSuccess = Math.random() > 0.1; // 90% success rate

    if (paymentSuccess) {
      // Extend subscription period
      const newPeriodEnd = new Date(subscription.currentPeriodEnd);
      if (tier.interval === 'monthly') {
        newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);
      } else {
        newPeriodEnd.setFullYear(newPeriodEnd.getFullYear() + 1);
      }

      subscription.currentPeriodStart = subscription.currentPeriodEnd;
      subscription.currentPeriodEnd = newPeriodEnd;
      subscription.status = 'active';

      subscription.billingHistory.push({
        id: `evt-${Date.now()}`,
        subscriptionId: subscription.id,
        type: 'payment_success',
        amount: tier.price,
        currency: 'USD',
        timestamp: new Date()
      });

      return { success: true };
    } else {
      subscription.status = 'past_due';

      subscription.billingHistory.push({
        id: `evt-${Date.now()}`,
        subscriptionId: subscription.id,
        type: 'payment_failed',
        amount: tier.price,
        currency: 'USD',
        timestamp: new Date(),
        metadata: { reason: 'Insufficient funds' }
      });

      return { success: false, error: 'Payment failed' };
    }
  }

  /**
   * Retry failed payment
   */
  async retryPayment(subscriptionId: string): Promise<{ success: boolean; error?: string }> {
    return this.processRecurringBilling(subscriptionId);
  }

  /**
   * Update subscription tier (upgrade/downgrade)
   */
  async updateSubscription(subscriptionId: string, newTierId: string): Promise<Subscription> {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const newTier = this.tiers.find(t => t.id === newTierId);
    if (!newTier) {
      throw new Error('Invalid tier ID');
    }

    const oldTier = this.tiers.find(t => t.id === subscription.tierId);
    const isUpgrade = newTier.price > (oldTier?.price || 0);

    subscription.tierId = newTierId;

    subscription.billingHistory.push({
      id: `evt-${Date.now()}`,
      subscriptionId: subscription.id,
      type: 'payment_success',
      amount: isUpgrade ? newTier.price - (oldTier?.price || 0) : 0,
      currency: 'USD',
      timestamp: new Date(),
      metadata: { type: isUpgrade ? 'upgrade' : 'downgrade', oldTierId: oldTier?.id }
    });

    return subscription;
  }

  /**
   * Process refund
   */
  async refund(subscriptionId: string, amount: number, reason?: string): Promise<BillingEvent> {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const refundEvent: BillingEvent = {
      id: `evt-${Date.now()}`,
      subscriptionId: subscription.id,
      type: 'refund',
      amount,
      currency: 'USD',
      timestamp: new Date(),
      metadata: { reason }
    };

    subscription.billingHistory.push(refundEvent);

    return refundEvent;
  }

  /**
   * Get billing history for subscription
   */
  getBillingHistory(subscriptionId: string): BillingEvent[] {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    return subscription.billingHistory;
  }

  /**
   * Pause subscription
   */
  async pauseSubscription(subscriptionId: string): Promise<Subscription> {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    subscription.status = 'paused';

    subscription.billingHistory.push({
      id: `evt-${Date.now()}`,
      subscriptionId: subscription.id,
      type: 'subscription_canceled',
      amount: 0,
      currency: 'USD',
      timestamp: new Date(),
      metadata: { action: 'paused' }
    });

    return subscription;
  }

  /**
   * Resume paused subscription
   */
  async resumeSubscription(subscriptionId: string): Promise<Subscription> {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    if (subscription.status !== 'paused') {
      throw new Error('Subscription is not paused');
    }

    subscription.status = 'active';

    subscription.billingHistory.push({
      id: `evt-${Date.now()}`,
      subscriptionId: subscription.id,
      type: 'subscription_created',
      amount: 0,
      currency: 'USD',
      timestamp: new Date(),
      metadata: { action: 'resumed' }
    });

    return subscription;
  }

  /**
   * Clear all subscriptions (for testing)
   */
  clearAll(): void {
    this.subscriptions.clear();
  }
}

export const membershipService = new MembershipService();
