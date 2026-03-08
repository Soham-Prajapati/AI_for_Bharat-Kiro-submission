'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, Search, Filter, TrendingUp } from 'lucide-react';
import apiClient from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import ListingCard from '@/components/marketplace/ListingCard';
import SearchBar from '@/components/marketplace/SearchBar';
import CheckoutModal from '@/components/marketplace/CheckoutModal';
import PurchaseHistory from '@/components/marketplace/PurchaseHistory';
import SellerDashboard from '@/components/marketplace/SellerDashboard';
import { Listing, ListingType } from '@/types/api';

type ViewMode = 'browse' | 'purchases' | 'seller';

export default function MarketplacePage() {
  const { user } = useAuth()
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('browse');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ListingType | 'all'>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  const userId = user?.id || 'demo_user';

  useEffect(() => {
    loadListings();
  }, []);

  useEffect(() => {
    filterListings();
  }, [listings, searchQuery, selectedType, priceRange]);

  const loadListings = async () => {
    try {
      setLoading(true);
      const response = await apiClient.marketplace.getListings();
      // Map backend listingId to id, normalize fields for the frontend Listing type
      const mapped: Listing[] = (response.listings as any[]).map((l: any) => ({
        id: l.id ?? l.listingId,
        title: l.title,
        description: l.description,
        price: l.price ?? 0,
        type: (l.type ?? l.category ?? 'template') as ListingType,
        userId: l.userId ?? l.sellerId ?? '',
        fileUrl: l.fileUrl ?? l.previewUrl,
        status: (l.status ?? 'active') as 'active' | 'sold' | 'inactive',
        rating: l.rating,
        sales: l.sales ?? l.salesCount,
        createdAt: l.createdAt,
      }));
      setListings(mapped);
    } catch (error) {
      console.error('Failed to load listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterListings = () => {
    let filtered = [...listings];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (listing) =>
          listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          listing.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter((listing) => listing.type === selectedType);
    }

    // Price filter
    filtered = filtered.filter(
      (listing) => listing.price >= priceRange[0] && listing.price <= priceRange[1]
    );

    setFilteredListings(filtered);
  };

  const handlePurchase = (listing: Listing) => {
    setSelectedListing(listing);
    setShowCheckout(true);
  };

  const handleCheckoutComplete = () => {
    setShowCheckout(false);
    setSelectedListing(null);
    // Refresh purchases if in purchase history view
    if (viewMode === 'purchases') {
      // Trigger refresh
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      {/* Header */}
      <div className="border-b border-white/[0.07] bg-[#030712]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="text-[10px] font-mono font-semibold text-amber-400 uppercase tracking-widest">Creator Marketplace</span>
              </div>
              <h1 className="text-2xl font-black font-display text-white">Marketplace</h1>
            </div>
            
            {/* View Mode Tabs */}
            <div className="flex gap-1 bg-white/[0.04] border border-white/[0.07] rounded-xl p-1">
              {(['browse', 'purchases', 'seller'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-mono font-semibold capitalize transition-all duration-200 ${
                    viewMode === mode
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  {mode === 'purchases' ? 'My Purchases' : mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <p className="mt-1 text-white/40 text-xs font-mono">
            Buy and sell content templates, scripts &amp; assets
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
          {/* Browse View */}
          {viewMode === 'browse' && (
            <>
              {/* Search and Filters */}
              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedType={selectedType}
                onTypeChange={setSelectedType}
                priceRange={priceRange}
                onPriceRangeChange={setPriceRange}
              />

              {/* Stats */}
              <div className="mb-6 flex items-center gap-4 text-xs font-mono text-white/30">
                <span>Showing {filteredListings.length} of {listings.length} items</span>
                {searchQuery && <span className="text-brand-400">Search: &ldquo;{searchQuery}&rdquo;</span>}
              </div>

              {/* Listings Grid */}
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
                </div>
              ) : filteredListings.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-5xl mb-4">🛍️</div>
                  <p className="text-white/40 text-base">No listings found</p>
                  <p className="text-white/20 text-sm mt-2">Try adjusting your filters or search query</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredListings.map((listing, index) => (
                    <ListingCard
                      key={listing.id ?? `listing-${index}`}
                      listing={listing}
                      index={index}
                      onPurchase={handlePurchase}
                    />
                  ))}
                </div>
              )}
            </>
          )}

        {/* Purchase History View */}
          {viewMode === 'purchases' && (
            <PurchaseHistory userId={userId} />
          )}

          {/* Seller Dashboard View */}
          {viewMode === 'seller' && (
            <SellerDashboard userId={userId} />
        )}
      </div>

      {/* Checkout Modal */}
      {showCheckout && selectedListing && (
        <CheckoutModal
          listing={selectedListing}
          userId={userId}
          onClose={() => setShowCheckout(false)}
          onComplete={handleCheckoutComplete}
        />
      )}
    </div>
  );
}
