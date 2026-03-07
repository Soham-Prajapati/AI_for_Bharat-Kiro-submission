/**
 * Marketplace Service
 * 
 * Handles marketplace operations including:
 * - Item listing and management
 * - Payment processing (Stripe/Razorpay)
 * - Refund handling
 * - Dispute management
 * - Revenue sharing (70% creator, 30% platform)
 */

export interface MarketplaceItem {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  status: 'active' | 'sold' | 'expired' | 'removed';
  createdAt: Date;
  expiresAt: Date;
}

export interface PaymentMethod {
  provider: 'stripe' | 'razorpay';
  token: string;
  last4?: string;
  brand?: string;
}

export interface Transaction {
  id: string;
  itemId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'partially_refunded';
  paymentProvider: 'stripe' | 'razorpay';
  paymentId: string;
  creatorShare: number;
  platformShare: number;
  createdAt: Date;
  completedAt?: Date;
}

export interface Refund {
  id: string;
  transactionId: string;
  amount: number;
  reason: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
}

export interface Dispute {
  id: string;
  transactionId: string;
  buyerId: string;
  sellerId: string;
  reason: string;
  status: 'open' | 'seller_responded' | 'resolved' | 'closed';
  buyerEvidence?: string;
  sellerResponse?: string;
  resolution?: string;
  createdAt: Date;
  resolvedAt?: Date;
}

export interface MarketplaceListing {
  listingId: string;
  sellerId: string;
  sellerName: string;
  title: string;
  description: string;
  category: 'template' | 'script' | 'thumbnail' | 'music' | 'graphics' | 'preset' | 'effect';
  price: number;
  currency: 'USD' | 'INR';
  license: 'personal' | 'commercial' | 'extended';
  tags: string[];
  previewUrl?: string;
  downloadUrl?: string;
  rating: number;
  reviewCount: number;
  salesCount: number;
  createdAt: string;
  updatedAt: string;
  itemId?: string;
}

export interface MarketplaceTransaction {
  transactionId: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  currency: string;
  platformFee: number;
  sellerRevenue: number;
  paymentMethod: 'stripe' | 'razorpay' | 'paypal' | 'mock';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  licenseKey?: string;
  downloadUrl?: string;
  createdAt: string;
}

export class MarketplaceService {
  private items: Map<string, MarketplaceItem> = new Map();
  private transactions: Map<string, Transaction> = new Map();
  private refunds: Map<string, Refund> = new Map();
  private disputes: Map<string, Dispute> = new Map();
  private purchases: Map<string, Set<string>> = new Map(); // buyerId -> Set of itemIds
  private listings: Map<string, MarketplaceListing> = new Map();

  /**
   * List an item for sale
   */
  async listItem(params: {
    sellerId: string;
    title: string;
    description: string;
    price: number;
    currency?: string;
    expiresInDays?: number;
  }): Promise<MarketplaceItem> {
    const item: MarketplaceItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sellerId: params.sellerId,
      title: params.title,
      description: params.description,
      price: params.price,
      currency: params.currency || 'USD',
      status: 'active',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + (params.expiresInDays || 30) * 24 * 60 * 60 * 1000),
    };

    this.items.set(item.id, item);
    return item;
  }

  /**
   * Get item by ID
   */
  async getItem(itemId: string): Promise<MarketplaceItem | null> {
    return this.items.get(itemId) || null;
  }

  /**
   * Process a purchase with payment
   */
  async purchaseItem(params: {
    itemId: string;
    buyerId: string;
    paymentMethod: PaymentMethod;
  }): Promise<Transaction> {
    const item = this.items.get(params.itemId);
    
    if (!item) {
      throw new Error('Item not found');
    }

    // Check for duplicate purchase first (before status check)
    const buyerPurchases = this.purchases.get(params.buyerId) || new Set();
    if (buyerPurchases.has(params.itemId)) {
      throw new Error('Item already purchased');
    }

    // Check expiration before status
    if (new Date() > item.expiresAt) {
      item.status = 'expired';
      throw new Error('Item has expired');
    }

    if (item.status !== 'active') {
      throw new Error(`Item is ${item.status}`);
    }

    // Simulate payment processing
    const paymentResult = await this.processPayment({
      amount: item.price,
      currency: item.currency,
      paymentMethod: params.paymentMethod,
    });

    if (!paymentResult.success) {
      throw new Error(paymentResult.error || 'Payment failed');
    }

    // Calculate revenue split (70% creator, 30% platform)
    const creatorShare = Math.round(item.price * 0.70 * 100) / 100;
    const platformShare = Math.round(item.price * 0.30 * 100) / 100;

    const transaction: Transaction = {
      id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      itemId: params.itemId,
      buyerId: params.buyerId,
      sellerId: item.sellerId,
      amount: item.price,
      currency: item.currency,
      status: 'completed',
      paymentProvider: params.paymentMethod.provider,
      paymentId: paymentResult.paymentId!,
      creatorShare,
      platformShare,
      createdAt: new Date(),
      completedAt: new Date(),
    };

    this.transactions.set(transaction.id, transaction);
    
    // Mark item as sold
    item.status = 'sold';
    
    // Track purchase
    buyerPurchases.add(params.itemId);
    this.purchases.set(params.buyerId, buyerPurchases);

    return transaction;
  }

  /**
   * Process payment through provider
   */
  private async processPayment(params: {
    amount: number;
    currency: string;
    paymentMethod: PaymentMethod;
  }): Promise<{ success: boolean; paymentId?: string; error?: string }> {
    // Simulate payment provider processing
    const { token } = params.paymentMethod;

    // Test mode tokens
    if (token === 'tok_visa') {
      return { success: true, paymentId: `pay_${Date.now()}` };
    }

    if (token === 'tok_chargeDeclined') {
      return { success: false, error: 'Card declined' };
    }

    if (token === 'tok_insufficientFunds') {
      return { success: false, error: 'Insufficient funds' };
    }

    if (token === 'tok_networkError') {
      return { success: false, error: 'Network error' };
    }

    // Default success for other tokens
    return { success: true, paymentId: `pay_${Date.now()}` };
  }

  /**
   * Process a refund
   */
  async refundTransaction(params: {
    transactionId: string;
    amount?: number; // If not provided, full refund
    reason: string;
  }): Promise<Refund> {
    const transaction = this.transactions.get(params.transactionId);
    
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.status === 'refunded') {
      throw new Error('Transaction already refunded');
    }

    if (transaction.status !== 'completed') {
      throw new Error('Can only refund completed transactions');
    }

    const refundAmount = params.amount || transaction.amount;

    if (refundAmount > transaction.amount) {
      throw new Error('Refund amount exceeds transaction amount');
    }

    const refund: Refund = {
      id: `ref-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      transactionId: params.transactionId,
      amount: refundAmount,
      reason: params.reason,
      status: 'completed',
      createdAt: new Date(),
      completedAt: new Date(),
    };

    this.refunds.set(refund.id, refund);

    // Update transaction status
    if (refundAmount === transaction.amount) {
      transaction.status = 'refunded';
    } else {
      transaction.status = 'partially_refunded';
    }

    return refund;
  }

  /**
   * Create a dispute
   */
  async createDispute(params: {
    transactionId: string;
    buyerId: string;
    reason: string;
    evidence?: string;
  }): Promise<Dispute> {
    const transaction = this.transactions.get(params.transactionId);
    
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.buyerId !== params.buyerId) {
      throw new Error('Only the buyer can create a dispute');
    }

    if (transaction.status === 'refunded') {
      throw new Error('Cannot dispute a refunded transaction');
    }

    const dispute: Dispute = {
      id: `dis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      transactionId: params.transactionId,
      buyerId: params.buyerId,
      sellerId: transaction.sellerId,
      reason: params.reason,
      status: 'open',
      buyerEvidence: params.evidence,
      createdAt: new Date(),
    };

    this.disputes.set(dispute.id, dispute);
    return dispute;
  }

  /**
   * Seller responds to dispute
   */
  async respondToDispute(params: {
    disputeId: string;
    sellerId: string;
    response: string;
  }): Promise<Dispute> {
    const dispute = this.disputes.get(params.disputeId);
    
    if (!dispute) {
      throw new Error('Dispute not found');
    }

    if (dispute.sellerId !== params.sellerId) {
      throw new Error('Only the seller can respond to this dispute');
    }

    if (dispute.status !== 'open') {
      throw new Error('Dispute is not open');
    }

    dispute.sellerResponse = params.response;
    dispute.status = 'seller_responded';

    return dispute;
  }

  /**
   * Get transaction by ID
   */
  async getTransaction(transactionId: string): Promise<Transaction | null> {
    return this.transactions.get(transactionId) || null;
  }

  /**
   * Get dispute by ID
   */
  async getDispute(disputeId: string): Promise<Dispute | null> {
    return this.disputes.get(disputeId) || null;
  }

  /**
   * Legacy API: create listing (route compatibility)
   */
  async createListing(request: {
    sellerId: string;
    title: string;
    description: string;
    category: MarketplaceListing['category'];
    price: number;
    currency?: 'USD' | 'INR';
    license?: MarketplaceListing['license'];
    tags?: string[];
    fileUrl?: string;
    previewUrl?: string;
  }): Promise<MarketplaceListing> {
    const item = await this.listItem({
      sellerId: request.sellerId,
      title: request.title,
      description: request.description,
      price: request.price,
      currency: request.currency || 'USD',
    });

    const listing: MarketplaceListing = {
      listingId: `listing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sellerId: request.sellerId,
      sellerName: `Seller ${request.sellerId}`,
      title: request.title,
      description: request.description,
      category: request.category,
      price: request.price,
      currency: request.currency || 'USD',
      license: request.license || 'personal',
      tags: request.tags || [],
      previewUrl: request.previewUrl,
      downloadUrl: request.fileUrl,
      rating: 0,
      reviewCount: 0,
      salesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      itemId: item.id,
    };

    this.listings.set(listing.listingId, listing);
    return listing;
  }

  /**
   * Legacy API: purchase listing (route compatibility)
   */
  async purchaseListing(request: {
    listingId: string;
    buyerId: string;
    paymentMethod: 'stripe' | 'razorpay' | 'paypal' | 'mock';
    paymentToken: string;
  }): Promise<MarketplaceTransaction> {
    const listing = this.listings.get(request.listingId);
    if (!listing) {
      throw new Error('Listing not found');
    }

    if (!listing.itemId) {
      throw new Error('Listing item mapping not found');
    }

    const provider: 'stripe' | 'razorpay' =
      request.paymentMethod === 'razorpay' ? 'razorpay' : 'stripe';

    const transaction = await this.purchaseItem({
      itemId: listing.itemId,
      buyerId: request.buyerId,
      paymentMethod: {
        provider,
        token: request.paymentToken || 'tok_visa',
      },
    });

    listing.salesCount += 1;
    listing.updatedAt = new Date().toISOString();

    return {
      transactionId: transaction.id,
      listingId: listing.listingId,
      buyerId: request.buyerId,
      sellerId: listing.sellerId,
      amount: transaction.amount,
      currency: transaction.currency,
      platformFee: transaction.platformShare,
      sellerRevenue: transaction.creatorShare,
      paymentMethod: request.paymentMethod,
      paymentStatus: transaction.status === 'completed' ? 'completed' : 'failed',
      licenseKey: `LIC-${transaction.id.toUpperCase()}`,
      downloadUrl: listing.downloadUrl,
      createdAt: transaction.createdAt.toISOString(),
    };
  }

  /**
   * Legacy API: search listings (route compatibility)
   */
  async searchListings(
    query?: string,
    filters?: { category?: MarketplaceListing['category'] },
    page: number = 1,
    limit: number = 20
  ): Promise<{ listings: MarketplaceListing[]; total: number; page: number; totalPages: number }> {
    let listings = Array.from(this.listings.values());

    if (query) {
      const lowered = query.toLowerCase();
      listings = listings.filter(
        (listing) =>
          listing.title.toLowerCase().includes(lowered) ||
          listing.description.toLowerCase().includes(lowered) ||
          listing.tags.some((tag) => tag.toLowerCase().includes(lowered))
      );
    }

    if (filters?.category) {
      listings = listings.filter((listing) => listing.category === filters.category);
    }

    const total = listings.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (Math.max(page, 1) - 1) * limit;
    const paged = listings.slice(start, start + limit);

    return {
      listings: paged,
      total,
      page,
      totalPages,
    };
  }

  /**
   * Clear all data (for testing)
   */
  clear(): void {
    this.items.clear();
    this.transactions.clear();
    this.refunds.clear();
    this.disputes.clear();
    this.purchases.clear();
    this.listings.clear();
  }
}

export const marketplaceService = new MarketplaceService();
