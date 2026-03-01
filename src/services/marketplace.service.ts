/**
 * Marketplace Service
 * 
 * Buy/sell content templates, scripts, thumbnails
 * - Listing creation, pricing, licensing
 * - Payment processing (Stripe/Razorpay integration ready)
 * - Revenue sharing (70% creator, 30% platform)
 * - Search and browse functionality
 * - Transaction management
 */

export interface MarketplaceListing {
  listingId: string;
  sellerId: string;
  sellerName: string;
  title: string;
  description: string;
  category: 'template' | 'script' | 'thumbnail' | 'music' | 'graphics' | 'preset';
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
  paymentMethod: 'stripe' | 'razorpay' | 'paypal';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  licenseKey?: string;
  downloadUrl?: string;
  createdAt: string;
}

export interface CreateListingRequest {
  sellerId: string;
  title: string;
  description: string;
  category: MarketplaceListing['category'];
  price: number;
  currency: 'USD' | 'INR';
  license: MarketplaceListing['license'];
  tags: string[];
  fileUrl: string;
  previewUrl?: string;
}

export interface PurchaseRequest {
  listingId: string;
  buyerId: string;
  paymentMethod: 'stripe' | 'razorpay' | 'paypal';
  paymentToken: string;
}

export interface SearchFilters {
  category?: MarketplaceListing['category'];
  minPrice?: number;
  maxPrice?: number;
  license?: MarketplaceListing['license'];
  tags?: string[];
  sortBy?: 'popular' | 'recent' | 'price-low' | 'price-high' | 'rating';
}

export class MarketplaceService {
  private readonly PLATFORM_FEE_PERCENTAGE = 0.30; // 30% platform fee
  private readonly SELLER_REVENUE_PERCENTAGE = 0.70; // 70% to creator

  /**
   * Create a new marketplace listing
   */
  async createListing(request: CreateListingRequest): Promise<MarketplaceListing> {
    // Validate input
    this.validateListingRequest(request);

    // Generate listing ID
    const listingId = this.generateListingId();

    // Create listing object
    const listing: MarketplaceListing = {
      listingId,
      sellerId: request.sellerId,
      sellerName: await this.getSellerName(request.sellerId),
      title: request.title,
      description: request.description,
      category: request.category,
      price: request.price,
      currency: request.currency,
      license: request.license,
      tags: request.tags,
      previewUrl: request.previewUrl,
      downloadUrl: request.fileUrl,
      rating: 0,
      reviewCount: 0,
      salesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // TODO: Save to database
    // await this.db.listings.create(listing);

    return listing;
  }

  /**
   * Purchase a listing
   */
  async purchaseListing(request: PurchaseRequest): Promise<MarketplaceTransaction> {
    // Get listing details
    const listing = await this.getListing(request.listingId);
    if (!listing) {
      throw new Error('Listing not found');
    }

    // Calculate fees
    const amount = listing.price;
    const platformFee = amount * this.PLATFORM_FEE_PERCENTAGE;
    const sellerRevenue = amount * this.SELLER_REVENUE_PERCENTAGE;

    // Process payment
    const paymentResult = await this.processPayment({
      amount,
      currency: listing.currency,
      paymentMethod: request.paymentMethod,
      paymentToken: request.paymentToken,
      buyerId: request.buyerId,
    });

    if (!paymentResult.success) {
      throw new Error(`Payment failed: ${paymentResult.error}`);
    }

    // Generate license key
    const licenseKey = this.generateLicenseKey(request.listingId, request.buyerId);

    // Create transaction record
    const transaction: MarketplaceTransaction = {
      transactionId: this.generateTransactionId(),
      listingId: request.listingId,
      buyerId: request.buyerId,
      sellerId: listing.sellerId,
      amount,
      currency: listing.currency,
      platformFee,
      sellerRevenue,
      paymentMethod: request.paymentMethod,
      paymentStatus: 'completed',
      licenseKey,
      downloadUrl: listing.downloadUrl,
      createdAt: new Date().toISOString(),
    };

    // TODO: Save transaction to database
    // await this.db.transactions.create(transaction);

    // Update listing sales count
    // await this.db.listings.update(listing.listingId, { salesCount: listing.salesCount + 1 });

    // Transfer revenue to seller (70%)
    await this.transferRevenueToSeller(listing.sellerId, sellerRevenue, listing.currency);

    return transaction;
  }

  /**
   * Search and browse listings
   */
  async searchListings(
    query?: string,
    filters?: SearchFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<{ listings: MarketplaceListing[]; total: number; page: number; totalPages: number }> {
    // TODO: Query database with filters
    // For now, return mock data
    const mockListings = this.getMockListings();

    // Apply filters
    let filtered = mockListings;

    if (query) {
      filtered = filtered.filter(
        (l) =>
          l.title.toLowerCase().includes(query.toLowerCase()) ||
          l.description.toLowerCase().includes(query.toLowerCase()) ||
          l.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
      );
    }

    if (filters?.category) {
      filtered = filtered.filter((l) => l.category === filters.category);
    }

    if (filters?.minPrice !== undefined) {
      filtered = filtered.filter((l) => l.price >= filters.minPrice!);
    }

    if (filters?.maxPrice !== undefined) {
      filtered = filtered.filter((l) => l.price <= filters.maxPrice!);
    }

    if (filters?.license) {
      filtered = filtered.filter((l) => l.license === filters.license);
    }

    if (filters?.tags && filters.tags.length > 0) {
      filtered = filtered.filter((l) => filters.tags!.some((tag) => l.tags.includes(tag)));
    }

    // Apply sorting
    if (filters?.sortBy) {
      filtered = this.sortListings(filtered, filters.sortBy);
    }

    // Pagination
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const listings = filtered.slice(start, end);

    return { listings, total, page, totalPages };
  }

  /**
   * Get listing by ID
   */
  async getListing(listingId: string): Promise<MarketplaceListing | null> {
    // TODO: Query database
    const mockListings = this.getMockListings();
    return mockListings.find((l) => l.listingId === listingId) || null;
  }

  /**
   * Get seller's listings
   */
  async getSellerListings(sellerId: string): Promise<MarketplaceListing[]> {
    // TODO: Query database
    const mockListings = this.getMockListings();
    return mockListings.filter((l) => l.sellerId === sellerId);
  }

  /**
   * Get buyer's purchases
   */
  async getBuyerPurchases(buyerId: string): Promise<MarketplaceTransaction[]> {
    // TODO: Query database
    return this.getMockTransactions().filter((t) => t.buyerId === buyerId);
  }

  /**
   * Get seller's sales
   */
  async getSellerSales(sellerId: string): Promise<MarketplaceTransaction[]> {
    // TODO: Query database
    return this.getMockTransactions().filter((t) => t.sellerId === sellerId);
  }

  /**
   * Update listing
   */
  async updateListing(
    listingId: string,
    updates: Partial<CreateListingRequest>
  ): Promise<MarketplaceListing> {
    const listing = await this.getListing(listingId);
    if (!listing) {
      throw new Error('Listing not found');
    }

    // Apply updates
    const updated: MarketplaceListing = {
      ...listing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // TODO: Save to database
    // await this.db.listings.update(listingId, updated);

    return updated;
  }

  /**
   * Delete listing
   */
  async deleteListing(listingId: string, sellerId: string): Promise<void> {
    const listing = await this.getListing(listingId);
    if (!listing) {
      throw new Error('Listing not found');
    }

    if (listing.sellerId !== sellerId) {
      throw new Error('Unauthorized: You can only delete your own listings');
    }

    // TODO: Delete from database
    // await this.db.listings.delete(listingId);
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private validateListingRequest(request: CreateListingRequest): void {
    if (!request.title || request.title.length < 5) {
      throw new Error('Title must be at least 5 characters');
    }
    if (!request.description || request.description.length < 20) {
      throw new Error('Description must be at least 20 characters');
    }
    if (request.price <= 0) {
      throw new Error('Price must be greater than 0');
    }
    if (!request.fileUrl) {
      throw new Error('File URL is required');
    }
  }

  private async processPayment(params: {
    amount: number;
    currency: string;
    paymentMethod: string;
    paymentToken: string;
    buyerId: string;
  }): Promise<{ success: boolean; error?: string }> {
    // TODO: Integrate with Stripe/Razorpay
    // For now, simulate successful payment
    console.log('Processing payment:', params);

    // Simulate payment processing
    if (params.paymentMethod === 'stripe') {
      // await stripe.charges.create({ ... });
    } else if (params.paymentMethod === 'razorpay') {
      // await razorpay.payments.capture({ ... });
    }

    return { success: true };
  }

  private async transferRevenueToSeller(
    sellerId: string,
    amount: number,
    currency: string
  ): Promise<void> {
    // TODO: Transfer funds to seller's account
    console.log(`Transferring ${amount} ${currency} to seller ${sellerId}`);

    // Stripe Connect or Razorpay Route
    // await stripe.transfers.create({
    //   amount: amount * 100, // cents
    //   currency: currency.toLowerCase(),
    //   destination: sellerStripeAccountId,
    // });
  }

  private sortListings(
    listings: MarketplaceListing[],
    sortBy: SearchFilters['sortBy']
  ): MarketplaceListing[] {
    const sorted = [...listings];

    switch (sortBy) {
      case 'popular':
        return sorted.sort((a, b) => b.salesCount - a.salesCount);
      case 'recent':
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      default:
        return sorted;
    }
  }

  private generateListingId(): string {
    return `listing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTransactionId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateLicenseKey(listingId: string, buyerId: string): string {
    const hash = Buffer.from(`${listingId}:${buyerId}:${Date.now()}`).toString('base64');
    return `LIC-${hash.substr(0, 16).toUpperCase()}`;
  }

  private async getSellerName(sellerId: string): Promise<string> {
    // TODO: Query user database
    return `Seller ${sellerId.substr(0, 8)}`;
  }

  // ============================================================================
  // MOCK DATA (for testing)
  // ============================================================================

  private getMockListings(): MarketplaceListing[] {
    return [
      {
        listingId: 'listing_001',
        sellerId: 'seller_001',
        sellerName: 'ProCreator',
        title: 'Viral YouTube Shorts Template Pack',
        description: 'Professional templates for creating viral YouTube Shorts. Includes 10 templates with hooks, transitions, and text overlays.',
        category: 'template',
        price: 29.99,
        currency: 'USD',
        license: 'commercial',
        tags: ['youtube', 'shorts', 'viral', 'templates'],
        previewUrl: 'https://example.com/preview1.jpg',
        downloadUrl: 'https://example.com/download1.zip',
        rating: 4.8,
        reviewCount: 127,
        salesCount: 543,
        createdAt: '2026-02-15T10:00:00Z',
        updatedAt: '2026-02-15T10:00:00Z',
      },
      {
        listingId: 'listing_002',
        sellerId: 'seller_002',
        sellerName: 'ContentKing',
        title: 'Instagram Reel Scripts Bundle',
        description: '50 proven Instagram Reel scripts that get engagement. Includes hooks, storytelling frameworks, and CTAs.',
        category: 'script',
        price: 19.99,
        currency: 'USD',
        license: 'personal',
        tags: ['instagram', 'reels', 'scripts', 'engagement'],
        previewUrl: 'https://example.com/preview2.jpg',
        rating: 4.9,
        reviewCount: 89,
        salesCount: 321,
        createdAt: '2026-02-20T14:30:00Z',
        updatedAt: '2026-02-20T14:30:00Z',
      },
      {
        listingId: 'listing_003',
        sellerId: 'seller_003',
        sellerName: 'DesignPro',
        title: 'Premium Thumbnail Pack - 100 Designs',
        description: 'Eye-catching thumbnail designs for YouTube videos. Fully customizable PSD files included.',
        category: 'thumbnail',
        price: 39.99,
        currency: 'USD',
        license: 'extended',
        tags: ['youtube', 'thumbnails', 'design', 'clickbait'],
        previewUrl: 'https://example.com/preview3.jpg',
        downloadUrl: 'https://example.com/download3.zip',
        rating: 4.7,
        reviewCount: 203,
        salesCount: 876,
        createdAt: '2026-02-10T08:15:00Z',
        updatedAt: '2026-02-10T08:15:00Z',
      },
    ];
  }

  private getMockTransactions(): MarketplaceTransaction[] {
    return [
      {
        transactionId: 'txn_001',
        listingId: 'listing_001',
        buyerId: 'buyer_001',
        sellerId: 'seller_001',
        amount: 29.99,
        currency: 'USD',
        platformFee: 8.997,
        sellerRevenue: 20.993,
        paymentMethod: 'stripe',
        paymentStatus: 'completed',
        licenseKey: 'LIC-ABC123DEF456',
        downloadUrl: 'https://example.com/download1.zip',
        createdAt: '2026-02-25T12:00:00Z',
      },
    ];
  }
}

export const marketplaceService = new MarketplaceService();
