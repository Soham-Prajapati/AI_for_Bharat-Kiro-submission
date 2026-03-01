'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, Search, Filter, TrendingUp } from 'lucide-react';
import apiClient from '@/services/api';
import ListingCard from '@/components/marketplace/ListingCard';
import SearchBar from '@/components/marketplace/SearchBar';
import CheckoutModal from '@/components/marketplace/CheckoutModal';
import PurchaseHistory from '@/components/marketplace/PurchaseHistory';
import SellerDashboard from '@/components/marketplace/SellerDashboard';
import { Listing, ListingType } from '@/types/api';

type ViewMode = 'browse' | 'purchases' | 'seller';

export default function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('browse');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ListingType | 'all'>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  // Mock user ID (in production, get from auth context)
  const userId = 'user_123';

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
      setListings(response.listings);
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
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-8 h-8 text-purple-400" />
                <h1 className="text-3xl sm:text-4xl font-bold">Marketplace</h1>
              </h1>
              
              {/* View Mode Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('browse')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    viewMode === 'browse'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  Browse
                </button>
                <button
                  onClick={() => setViewMode('purchases')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    viewMode === 'purchases'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  My Purchases
                </button>
                <button
                  onClick={() => setViewMode('seller')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    viewMode === 'seller'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  Sell
                </button>
              </div>
            </div>
            <p className="text-gray-400 text-sm sm:text-base">
              Buy and sell content templates, scripts, and assets
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <div
              className="mb-6 flex items-center gap-4 text-sm text-gray-400"
            >
              <span>
                Showing {filteredListings.length} of {listings.length} items
              </span>
              {searchQuery && (
                <span className="text-purple-400">
                  Search: "{searchQuery}"
                </span>
              )}
            </div>

            {/* Listings Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="text-center py-20">
                <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No listings found</p>
                <p className="text-gray-500 text-sm mt-2">
                  Try adjusting your filters or search query
                </p>
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredListings.map((listing, index) => (
                  <ListingCard
                    key={listing.id}
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
