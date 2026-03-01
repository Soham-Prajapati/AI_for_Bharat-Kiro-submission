/**
 * Membership Service
 * 
 * Subscription tiers and exclusive content access
 * - Stripe subscription integration
 * - Tiered access control (Free, Pro, Enterprise)
 * - Exclusive content gating
 * - Usage tracking and limits
 * - Billing and payment management
 */

export interface MembershipTier {
  tierId: string;
  name: string;
  displayName: string;
  description: string;
  price: number;
  currency: 'USD' | 'INR';
  billingPeriod: 'monthly' | 'yearly';
  features: string[];
  limits: {
    videosPerMonth: number;
    platformsPerVideo: number;
    languagesPerVideo: number;
    storageGB: number;
    aiGenerationsPerMonth: number;
    collaborators: number;
  };
  stripePriceId?: string;
  isPopular: boolean;
  trialDays: number;
}

export interface Subscription {
  subscriptionId: string;
  userId: string;
  tierId: string;
  tierName: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'paused';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UsageStats {
  userId: string;
  tierId: string;
  period: string; // YYYY-MM
  videosProcessed: number;
  aiGenerations: number;
  storageUsedGB: number;
  limits: MembershipTier['limits'];
  percentUsed: {
    videos: number;
    aiGenerations: number;
    storage: number;
  };
}

export interface PaymentMethod {
  paymentMethodId: string;
  userId: string;
  type: 'card' | 'upi' | 'bank_account';
  last4: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export class MembershipService {
  private tiers: Map<string, MembershipTier>;
  private subscriptions: Map<string, Subscription>;
  private usage: Map<string, UsageStats>;

  constructor() {
    this.tiers = new Map();
    this.subscriptions = new Map();
    this.usage = new Map();
    this.initializeTiers();
  }

  /**
   * Initialize membership tiers
   */
  private initializeTiers(): void {
    const tiers: MembershipTier[] = [
      {
        tierId: 'free',
        name: 'free',
        displayName: 'Free',
        description: 'Perfect for trying out the platform',
        price: 0,
        currency: 'USD',
        billingPeriod: 'monthly',
        features: [
          'Process 5 videos per month',
          'Generate content for 2 platforms',
          'Single language support',
          '1 GB storage',
          'Basic AI generations',
          'Community access',
        ],
        limits: {
          videosPerMonth: 5,
          platformsPerVideo: 2,
          languagesPerVideo: 1,
          storageGB: 1,
          aiGenerationsPerMonth: 50,
          collaborators: 0,
        },
        isPopular: false,
        trialDays: 0,
      },
      {
        tierId: 'pro',
        name: 'pro',
        displayName: 'Pro',
        description: 'For serious content creators',
        price: 29,
        currency: 'USD',
        billingPeriod: 'monthly',
        features: [
          'Process 100 videos per month',
          'Generate content for all 6 platforms',
          'All 9 languages supported',
          '50 GB storage',
          'Unlimited AI generations',
          'Voice cloning',
          'Trend predictions',
          'Viral score analysis',
          'Priority support',
          '3 collaborators',
        ],
        limits: {
          videosPerMonth: 100,
          platformsPerVideo: 6,
          languagesPerVideo: 9,
          storageGB: 50,
          aiGenerationsPerMonth: -1, // unlimited
          collaborators: 3,
        },
        stripePriceId: 'price_pro_monthly',
        isPopular: true,
        trialDays: 14,
      },
      {
        tierId: 'enterprise',
        name: 'enterprise',
        displayName: 'Enterprise',
        description: 'For teams and agencies',
        price: 99,
        currency: 'USD',
        billingPeriod: 'monthly',
        features: [
          'Unlimited videos',
          'All platforms and languages',
          '500 GB storage',
          'Unlimited AI generations',
          'Voice cloning',
          'Custom branding',
          'White-label options',
          'API access',
          'Dedicated account manager',
          'Custom integrations',
          'Unlimited collaborators',
          'Advanced analytics',
        ],
        limits: {
          videosPerMonth: -1, // unlimited
          platformsPerVideo: 6,
          languagesPerVideo: 9,
          storageGB: 500,
          aiGenerationsPerMonth: -1, // unlimited
          collaborators: -1, // unlimited
        },
        stripePriceId: 'price_enterprise_monthly',
        isPopular: false,
        trialDays: 30,
      },
    ];

    for (const tier of tiers) {
      this.tiers.set(tier.tierId, tier);
    }
  }

  // ============================================================================
  // TIER MANAGEMENT
  // ============================================================================

  /**
   * Get all membership tiers
   */
  getTiers(): MembershipTier[] {
    return Array.from(this.tiers.values());
  }

  /**
   * Get specific tier
   */
  getTier(tierId: string): MembershipTier | null {
    return this.tiers.get(tierId) || null;
  }

  /**
   * Compare tiers
   */
  compareTiers(currentTierId: string, targetTierId: string): {
    isUpgrade: boolean;
    isDowngrade: boolean;
    priceDifference: number;
    featureDifferences: string[];
  } {
    const current = this.tiers.get(currentTierId);
    const target = this.tiers.get(targetTierId);

    if (!current || !target) {
      throw new Error('Invalid tier IDs');
    }

    const priceDifference = target.price - current.price;
    const isUpgrade = priceDifference > 0;
    const isDowngrade = priceDifference < 0;

    // Find feature differences
    const featureDifferences = target.features.filter(
      (f) => !current.features.includes(f)
    );

    return {
      isUpgrade,
      isDowngrade,
      priceDifference: Math.abs(priceDifference),
      featureDifferences,
    };
  }

  // ============================================================================
  // SUBSCRIPTION MANAGEMENT
  // ============================================================================

  /**
   * Create subscription
   */
  async subscribe(
    userId: string,
    tierId: string,
    paymentMethodId?: string
  ): Promise<Subscription> {
    const tier = this.tiers.get(tierId);
    if (!tier) {
      throw new Error('Invalid tier');
    }

    // Check if user already has active subscription
    const existing = await this.getUserSubscription(userId);
    if (existing && existing.status === 'active') {
      throw new Error('User already has active subscription');
    }

    // Create Stripe subscription (mock for now)
    const stripeSubscriptionId = await this.createStripeSubscription(
      userId,
      tier.stripePriceId || '',
      paymentMethodId
    );

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const subscription: Subscription = {
      subscriptionId: this.generateId('sub'),
      userId,
      tierId,
      tierName: tier.name,
      status: tier.trialDays > 0 ? 'trialing' : 'active',
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: periodEnd.toISOString(),
      cancelAtPeriodEnd: false,
      trialEnd: tier.trialDays > 0 ? this.addDays(now, tier.trialDays).toISOString() : undefined,
      stripeSubscriptionId,
      stripeCustomerId: `cus_${userId}`,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    this.subscriptions.set(userId, subscription);

    // Initialize usage tracking
    this.initializeUsage(userId, tierId);

    return subscription;
  }

  /**
   * Get user's subscription
   */
  async getUserSubscription(userId: string): Promise<Subscription | null> {
    return this.subscriptions.get(userId) || null;
  }

  /**
   * Update subscription (upgrade/downgrade)
   */
  async updateSubscription(
    userId: string,
    newTierId: string
  ): Promise<Subscription> {
    const subscription = this.subscriptions.get(userId);
    if (!subscription) {
      throw new Error('No active subscription found');
    }

    const newTier = this.tiers.get(newTierId);
    if (!newTier) {
      throw new Error('Invalid tier');
    }

    // Update Stripe subscription (mock)
    await this.updateStripeSubscription(
      subscription.stripeSubscriptionId || '',
      newTier.stripePriceId || ''
    );

    subscription.tierId = newTierId;
    subscription.tierName = newTier.name;
    subscription.updatedAt = new Date().toISOString();

    // Update usage limits
    this.updateUsageLimits(userId, newTierId);

    return subscription;
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    userId: string,
    immediate: boolean = false
  ): Promise<Subscription> {
    const subscription = this.subscriptions.get(userId);
    if (!subscription) {
      throw new Error('No active subscription found');
    }

    if (immediate) {
      subscription.status = 'canceled';
      subscription.currentPeriodEnd = new Date().toISOString();
    } else {
      subscription.cancelAtPeriodEnd = true;
    }

    subscription.updatedAt = new Date().toISOString();

    // Cancel Stripe subscription (mock)
    await this.cancelStripeSubscription(
      subscription.stripeSubscriptionId || '',
      immediate
    );

    return subscription;
  }

  /**
   * Reactivate canceled subscription
   */
  async reactivateSubscription(userId: string): Promise<Subscription> {
    const subscription = this.subscriptions.get(userId);
    if (!subscription) {
      throw new Error('No subscription found');
    }

    if (subscription.status !== 'canceled' && !subscription.cancelAtPeriodEnd) {
      throw new Error('Subscription is not canceled');
    }

    subscription.status = 'active';
    subscription.cancelAtPeriodEnd = false;
    subscription.updatedAt = new Date().toISOString();

    // Reactivate Stripe subscription (mock)
    await this.reactivateStripeSubscription(subscription.stripeSubscriptionId || '');

    return subscription;
  }

  // ============================================================================
  // ACCESS CONTROL
  // ============================================================================

  /**
   * Check if user has access to feature
   */
  async hasAccess(userId: string, feature: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription || subscription.status !== 'active') {
      // Free tier access
      const freeTier = this.tiers.get('free');
      return freeTier?.features.includes(feature) || false;
    }

    const tier = this.tiers.get(subscription.tierId);
    return tier?.features.includes(feature) || false;
  }

  /**
   * Check if user can perform action based on limits
   */
  async canPerformAction(
    userId: string,
    action: 'process_video' | 'ai_generation' | 'add_collaborator'
  ): Promise<{ allowed: boolean; reason?: string }> {
    const subscription = await this.getUserSubscription(userId);
    const tierId = subscription?.tierId || 'free';
    const tier = this.tiers.get(tierId);

    if (!tier) {
      return { allowed: false, reason: 'Invalid tier' };
    }

    const usage = await this.getUsage(userId);

    switch (action) {
      case 'process_video':
        if (tier.limits.videosPerMonth === -1) {
          return { allowed: true };
        }
        if (usage.videosProcessed >= tier.limits.videosPerMonth) {
          return {
            allowed: false,
            reason: `Monthly limit of ${tier.limits.videosPerMonth} videos reached`,
          };
        }
        return { allowed: true };

      case 'ai_generation':
        if (tier.limits.aiGenerationsPerMonth === -1) {
          return { allowed: true };
        }
        if (usage.aiGenerations >= tier.limits.aiGenerationsPerMonth) {
          return {
            allowed: false,
            reason: `Monthly limit of ${tier.limits.aiGenerationsPerMonth} AI generations reached`,
          };
        }
        return { allowed: true };

      case 'add_collaborator':
        if (tier.limits.collaborators === -1) {
          return { allowed: true };
        }
        if (tier.limits.collaborators === 0) {
          return {
            allowed: false,
            reason: 'Collaborators not available in your plan',
          };
        }
        return { allowed: true };

      default:
        return { allowed: false, reason: 'Unknown action' };
    }
  }

  /**
   * Get content access level
   */
  async getContentAccess(userId: string): Promise<{
    tier: string;
    canAccessPremium: boolean;
    canAccessEnterprise: boolean;
  }> {
    const subscription = await this.getUserSubscription(userId);
    const tierId = subscription?.tierId || 'free';

    return {
      tier: tierId,
      canAccessPremium: ['pro', 'enterprise'].includes(tierId),
      canAccessEnterprise: tierId === 'enterprise',
    };
  }

  // ============================================================================
  // USAGE TRACKING
  // ============================================================================

  /**
   * Initialize usage tracking for user
   */
  private initializeUsage(userId: string, tierId: string): void {
    const tier = this.tiers.get(tierId);
    if (!tier) return;

    const period = this.getCurrentPeriod();
    const usageKey = `${userId}_${period}`;

    this.usage.set(usageKey, {
      userId,
      tierId,
      period,
      videosProcessed: 0,
      aiGenerations: 0,
      storageUsedGB: 0,
      limits: tier.limits,
      percentUsed: {
        videos: 0,
        aiGenerations: 0,
        storage: 0,
      },
    });
  }

  /**
   * Get usage stats
   */
  async getUsage(userId: string): Promise<UsageStats> {
    const period = this.getCurrentPeriod();
    const usageKey = `${userId}_${period}`;

    let usage = this.usage.get(usageKey);
    if (!usage) {
      const subscription = await this.getUserSubscription(userId);
      const tierId = subscription?.tierId || 'free';
      this.initializeUsage(userId, tierId);
      usage = this.usage.get(usageKey)!;
    }

    return usage;
  }

  /**
   * Track video processing
   */
  async trackVideoProcessing(userId: string): Promise<void> {
    const usage = await this.getUsage(userId);
    usage.videosProcessed++;
    this.updatePercentUsed(usage);
  }

  /**
   * Track AI generation
   */
  async trackAIGeneration(userId: string): Promise<void> {
    const usage = await this.getUsage(userId);
    usage.aiGenerations++;
    this.updatePercentUsed(usage);
  }

  /**
   * Track storage usage
   */
  async trackStorageUsage(userId: string, sizeGB: number): Promise<void> {
    const usage = await this.getUsage(userId);
    usage.storageUsedGB += sizeGB;
    this.updatePercentUsed(usage);
  }

  /**
   * Update percent used calculations
   */
  private updatePercentUsed(usage: UsageStats): void {
    usage.percentUsed.videos =
      usage.limits.videosPerMonth === -1
        ? 0
        : (usage.videosProcessed / usage.limits.videosPerMonth) * 100;

    usage.percentUsed.aiGenerations =
      usage.limits.aiGenerationsPerMonth === -1
        ? 0
        : (usage.aiGenerations / usage.limits.aiGenerationsPerMonth) * 100;

    usage.percentUsed.storage =
      (usage.storageUsedGB / usage.limits.storageGB) * 100;
  }

  /**
   * Update usage limits when tier changes
   */
  private updateUsageLimits(userId: string, newTierId: string): void {
    const tier = this.tiers.get(newTierId);
    if (!tier) return;

    const period = this.getCurrentPeriod();
    const usageKey = `${userId}_${period}`;
    const usage = this.usage.get(usageKey);

    if (usage) {
      usage.tierId = newTierId;
      usage.limits = tier.limits;
      this.updatePercentUsed(usage);
    }
  }

  // ============================================================================
  // STRIPE INTEGRATION (MOCK)
  // ============================================================================

  private async createStripeSubscription(
    userId: string,
    priceId: string,
    paymentMethodId?: string
  ): Promise<string> {
    // TODO: Integrate with Stripe API
    console.log('Creating Stripe subscription:', { userId, priceId, paymentMethodId });
    return `sub_${Date.now()}`;
  }

  private async updateStripeSubscription(
    subscriptionId: string,
    newPriceId: string
  ): Promise<void> {
    // TODO: Integrate with Stripe API
    console.log('Updating Stripe subscription:', { subscriptionId, newPriceId });
  }

  private async cancelStripeSubscription(
    subscriptionId: string,
    immediate: boolean
  ): Promise<void> {
    // TODO: Integrate with Stripe API
    console.log('Canceling Stripe subscription:', { subscriptionId, immediate });
  }

  private async reactivateStripeSubscription(subscriptionId: string): Promise<void> {
    // TODO: Integrate with Stripe API
    console.log('Reactivating Stripe subscription:', subscriptionId);
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentPeriod(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Get mock subscriptions for testing
   */
  getMockSubscriptions(): Subscription[] {
    return [
      {
        subscriptionId: 'sub_001',
        userId: 'user_001',
        tierId: 'pro',
        tierName: 'pro',
        status: 'active',
        currentPeriodStart: '2026-02-01T00:00:00Z',
        currentPeriodEnd: '2026-03-01T00:00:00Z',
        cancelAtPeriodEnd: false,
        stripeSubscriptionId: 'sub_stripe_001',
        stripeCustomerId: 'cus_user_001',
        createdAt: '2026-02-01T00:00:00Z',
        updatedAt: '2026-02-01T00:00:00Z',
      },
      {
        subscriptionId: 'sub_002',
        userId: 'user_002',
        tierId: 'enterprise',
        tierName: 'enterprise',
        status: 'active',
        currentPeriodStart: '2026-01-15T00:00:00Z',
        currentPeriodEnd: '2026-02-15T00:00:00Z',
        cancelAtPeriodEnd: false,
        stripeSubscriptionId: 'sub_stripe_002',
        stripeCustomerId: 'cus_user_002',
        createdAt: '2026-01-15T00:00:00Z',
        updatedAt: '2026-01-15T00:00:00Z',
      },
    ];
  }
}

export const membershipService = new MembershipService();
