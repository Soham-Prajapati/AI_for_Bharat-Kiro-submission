/**
 * Membership Service
 *
 * Handles subscription tiers, billing, usage visibility, and membership access.
 */

export interface SubscriptionTier {
	id: string;
	name: 'free' | 'pro' | 'enterprise';
	price: number;
	currency: 'USD' | 'INR';
	interval: 'monthly' | 'yearly';
	features: string[];
	limits: {
		videosPerMonth: number;
		platformsPerVideo: number;
		languagesPerVideo: number;
		storageGB: number;
		aiGenerationsPerMonth: number;
		collaborators: number;
	};
}

export interface BillingEvent {
	id: string;
	subscriptionId: string;
	type:
		| 'payment_success'
		| 'payment_failed'
		| 'refund'
		| 'subscription_created'
		| 'subscription_canceled';
	amount: number;
	currency: string;
	timestamp: Date;
	metadata?: Record<string, any>;
}

export interface Subscription {
	id: string;
	userId: string;
	tierId: string;
	tierName: SubscriptionTier['name'];
	status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'paused';
	currentPeriodStart: Date;
	currentPeriodEnd: Date;
	cancelAtPeriodEnd: boolean;
	trialEnd?: Date;
	paymentMethod?: string;
	billingHistory: BillingEvent[];
}

export interface UsageStats {
	userId: string;
	tierId: string;
	period: string;
	videosProcessed: number;
	aiGenerations: number;
	storageUsedGB: number;
	limits: SubscriptionTier['limits'];
	percentUsed: {
		videos: number;
		aiGenerations: number;
		storage: number;
	};
}

export class MembershipService {
	private subscriptions: Map<string, Subscription> = new Map();
	private usageByUserPeriod: Map<string, UsageStats> = new Map();

	private tiers: SubscriptionTier[] = [
		{
			id: 'tier-free',
			name: 'free',
			price: 0,
			currency: 'USD',
			interval: 'monthly',
			features: ['Basic content generation', '10 videos/month', 'Community access'],
			limits: {
				videosPerMonth: 10,
				platformsPerVideo: 2,
				languagesPerVideo: 1,
				storageGB: 2,
				aiGenerationsPerMonth: 50,
				collaborators: 0,
			},
		},
		{
			id: 'tier-pro-monthly',
			name: 'pro',
			price: 29,
			currency: 'USD',
			interval: 'monthly',
			features: ['Unlimited content', 'Advanced AI', 'Priority support', 'Analytics'],
			limits: {
				videosPerMonth: 100,
				platformsPerVideo: 6,
				languagesPerVideo: 9,
				storageGB: 50,
				aiGenerationsPerMonth: -1,
				collaborators: 3,
			},
		},
		{
			id: 'tier-pro-yearly',
			name: 'pro',
			price: 290,
			currency: 'USD',
			interval: 'yearly',
			features: ['Unlimited content', 'Advanced AI', 'Priority support', 'Analytics', '2 months free'],
			limits: {
				videosPerMonth: 1200,
				platformsPerVideo: 6,
				languagesPerVideo: 9,
				storageGB: 80,
				aiGenerationsPerMonth: -1,
				collaborators: 5,
			},
		},
		{
			id: 'tier-enterprise',
			name: 'enterprise',
			price: 99,
			currency: 'USD',
			interval: 'monthly',
			features: ['Everything in Pro', 'Custom AI models', 'Dedicated support', 'API access', 'White-label'],
			limits: {
				videosPerMonth: -1,
				platformsPerVideo: 6,
				languagesPerVideo: 9,
				storageGB: 500,
				aiGenerationsPerMonth: -1,
				collaborators: -1,
			},
		},
	];

	getTiers(): SubscriptionTier[] {
		return this.tiers;
	}

	async subscribe(userId: string, tierId: string, paymentMethodId?: string): Promise<Subscription> {
		const tier = this.resolveTier(tierId);
		if (!tier) {
			throw new Error('Invalid tier ID');
		}

		const existing = this.getUserSubscription(userId);
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
			tierId: tier.id,
			tierName: tier.name,
			status: tier.price === 0 ? 'active' : 'trialing',
			currentPeriodStart: now,
			currentPeriodEnd: periodEnd,
			cancelAtPeriodEnd: false,
			trialEnd: tier.price === 0 ? undefined : this.addDays(now, 14),
			paymentMethod: paymentMethodId,
			billingHistory: [],
		};

		subscription.billingHistory.push({
			id: `evt-${Date.now()}`,
			subscriptionId: subscription.id,
			type: 'subscription_created',
			amount: tier.price,
			currency: tier.currency,
			timestamp: now,
		});

		this.subscriptions.set(subscription.id, subscription);
		this.ensureUsage(userId, tier.id);
		return subscription;
	}

	getSubscription(subscriptionId: string): Subscription | undefined {
		return this.subscriptions.get(subscriptionId);
	}

	getUserSubscription(userId: string): Subscription | undefined {
		return Array.from(this.subscriptions.values()).find(
			(subscription) =>
				subscription.userId === userId &&
				['active', 'trialing', 'past_due', 'paused'].includes(subscription.status)
		);
	}

	async cancelSubscription(subscriptionId: string, immediate: boolean = false): Promise<Subscription> {
		const subscription = this.subscriptions.get(subscriptionId);
		if (!subscription) {
			throw new Error('Subscription not found');
		}

		if (immediate) {
			subscription.status = 'canceled';
			subscription.currentPeriodEnd = new Date();
			subscription.cancelAtPeriodEnd = false;
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
			metadata: { immediate },
		});

		return subscription;
	}

	async processRecurringBilling(subscriptionId: string): Promise<{ success: boolean; error?: string }> {
		const subscription = this.subscriptions.get(subscriptionId);
		if (!subscription) {
			throw new Error('Subscription not found');
		}

		const tier = this.resolveTier(subscription.tierId);
		if (!tier) {
			throw new Error('Tier not found');
		}

		if (subscription.status === 'canceled') {
			return { success: false, error: 'Subscription canceled' };
		}

		const paymentSuccess = Math.random() > 0.1;

		if (paymentSuccess) {
			const newPeriodEnd = new Date(subscription.currentPeriodEnd);
			if (tier.interval === 'monthly') {
				newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);
			} else {
				newPeriodEnd.setFullYear(newPeriodEnd.getFullYear() + 1);
			}

			subscription.currentPeriodStart = new Date(subscription.currentPeriodEnd);
			subscription.currentPeriodEnd = newPeriodEnd;
			subscription.status = subscription.cancelAtPeriodEnd ? 'canceled' : 'active';

			subscription.billingHistory.push({
				id: `evt-${Date.now()}`,
				subscriptionId: subscription.id,
				type: 'payment_success',
				amount: tier.price,
				currency: tier.currency,
				timestamp: new Date(),
			});

			return { success: true };
		}

		subscription.status = 'past_due';
		subscription.billingHistory.push({
			id: `evt-${Date.now()}`,
			subscriptionId: subscription.id,
			type: 'payment_failed',
			amount: tier.price,
			currency: tier.currency,
			timestamp: new Date(),
			metadata: { reason: 'Insufficient funds' },
		});

		return { success: false, error: 'Payment failed' };
	}

	async retryPayment(subscriptionId: string): Promise<{ success: boolean; error?: string }> {
		return this.processRecurringBilling(subscriptionId);
	}

	async updateSubscription(subscriptionId: string, newTierId: string): Promise<Subscription> {
		const subscription = this.subscriptions.get(subscriptionId);
		if (!subscription) {
			throw new Error('Subscription not found');
		}

		const newTier = this.resolveTier(newTierId);
		if (!newTier) {
			throw new Error('Invalid tier ID');
		}

		const oldTier = this.resolveTier(subscription.tierId);
		const oldPrice = oldTier?.price || 0;
		const isUpgrade = newTier.price > oldPrice;

		subscription.tierId = newTier.id;
		subscription.tierName = newTier.name;
		this.ensureUsage(subscription.userId, newTier.id);

		subscription.billingHistory.push({
			id: `evt-${Date.now()}`,
			subscriptionId: subscription.id,
			type: 'payment_success',
			amount: isUpgrade ? newTier.price - oldPrice : 0,
			currency: newTier.currency,
			timestamp: new Date(),
			metadata: {
				type: isUpgrade ? 'upgrade' : 'downgrade',
				oldTierId: oldTier?.id,
			},
		});

		return subscription;
	}

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
			metadata: { reason },
		};

		subscription.billingHistory.push(refundEvent);
		return refundEvent;
	}

	getBillingHistory(subscriptionId: string): BillingEvent[] {
		const subscription = this.subscriptions.get(subscriptionId);
		if (!subscription) {
			throw new Error('Subscription not found');
		}

		return subscription.billingHistory;
	}

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
			metadata: { action: 'paused' },
		});

		return subscription;
	}

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
			metadata: { action: 'resumed' },
		});

		return subscription;
	}

	async getUsage(userId: string): Promise<UsageStats> {
		const subscription = this.getUserSubscription(userId);
		const tier = this.resolveTier(subscription?.tierId || 'tier-free') || this.tiers[0];
		return this.ensureUsage(userId, tier.id);
	}

	async getContentAccess(userId: string): Promise<{
		tier: string;
		canAccessPremium: boolean;
		canAccessEnterprise: boolean;
	}> {
		const subscription = this.getUserSubscription(userId);
		const tier = this.resolveTier(subscription?.tierId || 'tier-free') || this.tiers[0];
		return {
			tier: tier.name,
			canAccessPremium: ['pro', 'enterprise'].includes(tier.name),
			canAccessEnterprise: tier.name === 'enterprise',
		};
	}

	async trackVideoProcessing(userId: string): Promise<void> {
		const usage = await this.getUsage(userId);
		usage.videosProcessed += 1;
		this.updatePercentUsed(usage);
	}

	async trackAIGeneration(userId: string): Promise<void> {
		const usage = await this.getUsage(userId);
		usage.aiGenerations += 1;
		this.updatePercentUsed(usage);
	}

	async trackStorageUsage(userId: string, sizeGB: number): Promise<void> {
		const usage = await this.getUsage(userId);
		usage.storageUsedGB += sizeGB;
		this.updatePercentUsed(usage);
	}

	clearAll(): void {
		this.subscriptions.clear();
		this.usageByUserPeriod.clear();
	}

	private resolveTier(tierRef: string): SubscriptionTier | undefined {
		return (
			this.tiers.find((tier) => tier.id === tierRef) ||
			this.tiers.find((tier) => tier.name === (tierRef as SubscriptionTier['name']) && tier.interval === 'monthly') ||
			this.tiers.find((tier) => tier.name === (tierRef as SubscriptionTier['name']))
		);
	}

	private ensureUsage(userId: string, tierId: string): UsageStats {
		const period = this.getCurrentPeriod();
		const key = `${userId}:${period}`;

		const existing = this.usageByUserPeriod.get(key);
		if (existing) {
			const tier = this.resolveTier(tierId);
			if (tier) {
				existing.tierId = tier.id;
				existing.limits = tier.limits;
				this.updatePercentUsed(existing);
			}
			return existing;
		}

		const tier = this.resolveTier(tierId) || this.tiers[0];
		const usage: UsageStats = {
			userId,
			tierId: tier.id,
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
		};

		this.usageByUserPeriod.set(key, usage);
		return usage;
	}

	private updatePercentUsed(usage: UsageStats): void {
		usage.percentUsed.videos =
			usage.limits.videosPerMonth <= 0 ? 0 : (usage.videosProcessed / usage.limits.videosPerMonth) * 100;

		usage.percentUsed.aiGenerations =
			usage.limits.aiGenerationsPerMonth <= 0
				? 0
				: (usage.aiGenerations / usage.limits.aiGenerationsPerMonth) * 100;

		usage.percentUsed.storage = usage.limits.storageGB <= 0 ? 0 : (usage.storageUsedGB / usage.limits.storageGB) * 100;
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
}

export const membershipService = new MembershipService();
