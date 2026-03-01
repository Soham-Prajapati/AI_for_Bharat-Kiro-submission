'use client';

import { useState, useEffect } from 'react';
import { Plus, DollarSign, TrendingUp, Package, Edit, Trash2, Eye } from 'lucide-react';
import { Listing, CreateListingRequest } from '@/types/api';
import apiClient from '@/services/api';
import CreateListingModal from './CreateListingModal';

interface SellerDashboardProps {
  userId: string;
}

// Mock seller listings
const mockSellerListings: Listing[] = [
  {
    id: 'listing_seller_001',
    title: 'My Premium Template Pack',
    description: 'High-quality templates for content creators',
    price: 49.99,
    type: 'template',
    userId: 'user_123',
    status: 'active',
    rating: 4.8,
    sales: 45,
    createdAt: '2026-02-15T10:00:00Z',
  },
  {
    id: 'listing_seller_002',
    title: 'Viral Script Collection',
    description: '20 proven scripts for viral content',
    price: 29.99,
    type: 'script',
    userId: 'user_123',
    status: 'active',
    rating: 4.9,
    sales: 67,
    createdAt: '2026-02-10T14:30:00Z',
  },
];

export default function SellerDashboard({ userId }: SellerDashboardProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadSellerListings();
  }, [userId]);

  const loadSellerListings = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await apiClient.marketplace.getSellerListings(userId);
      // setListings(response.listings);
      
      // Mock data for now
      setTimeout(() => {
        setListings(mockSellerListings);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Failed to load seller listings:', error);
      setLoading(false);
    }
  };

  const handleCreateListing = async (data: CreateListingRequest) => {
    try {
      const response = await apiClient.marketplace.createListing(data);
      if (response.success) {
        setListings([response.listing, ...listings]);
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Failed to create listing:', error);
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) {
      return;
    }

    try {
      // TODO: Implement delete API call
      // await apiClient.marketplace.deleteListing(listingId);
      setListings(listings.filter((l) => l.id !== listingId));
    } catch (error) {
      console.error('Failed to delete listing:', error);
    }
  };

  const totalRevenue = listings.reduce((sum, l) => sum + (l.price * (l.sales || 0)), 0);
  const totalSales = listings.reduce((sum, l) => sum + (l.sales || 0), 0);
  const avgRating = listings.length > 0
    ? listings.reduce((sum, l) => sum + (l.rating || 0), 0) / listings.length
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div
          className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl p-6 border border-green-500/30"
        >
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-300" />
            <p className="text-green-300 text-sm">Total Revenue</p>
          </div>
          <p className="text-3xl font-bold text-white">${totalRevenue.toFixed(2)}</p>
        </div>

        <div
          className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl p-6 border border-blue-500/30"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-300" />
            <p className="text-blue-300 text-sm">Total Sales</p>
          </div>
          <p className="text-3xl font-bold text-white">{totalSales}</p>
        </div>

        <div
          className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl p-6 border border-purple-500/30"
        >
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-5 h-5 text-purple-300" />
            <p className="text-purple-300 text-sm">Active Listings</p>
          </div>
          <p className="text-3xl font-bold text-white">{listings.length}</p>
        </div>

        <div
          className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 rounded-xl p-6 border border-yellow-500/30"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-yellow-300" />
            <p className="text-yellow-300 text-sm">Avg Rating</p>
          </div>
          <p className="text-3xl font-bold text-white">{avgRating.toFixed(1)}</p>
        </div>
      </div>

      {/* Create Listing Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create New Listing
        </button>
      </div>

      {/* Listings Table */}
      {listings.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No listings yet</p>
          <p className="text-gray-500 text-sm mt-2 mb-6">
            Create your first listing to start selling
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Listing
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing, index) => (
            <div
              key={listing.id}
              className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-white">{listing.title}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        listing.status === 'active'
                          ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                          : 'bg-gray-500/10 text-gray-400 border border-gray-500/30'
                      }`}
                    >
                      {listing.status}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/30">
                      {listing.type}
                    </span>
                  </div>

                  <p className="text-gray-400 text-sm mb-4">{listing.description}</p>

                  <div className="flex flex-wrap gap-6 text-sm">
                    <div>
                      <span className="text-gray-500">Price:</span>
                      <span className="text-white font-bold ml-2">${listing.price.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Sales:</span>
                      <span className="text-white font-bold ml-2">{listing.sales || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Revenue:</span>
                      <span className="text-white font-bold ml-2">
                        ${((listing.sales || 0) * listing.price).toFixed(2)}
                      </span>
                    </div>
                    {listing.rating && (
                      <div>
                        <span className="text-gray-500">Rating:</span>
                        <span className="text-white font-bold ml-2">{listing.rating.toFixed(1)} ⭐</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {/* TODO: Implement view */}}
                    className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    title="View"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {/* TODO: Implement edit */}}
                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteListing(listing.id)}
                    className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Listing Modal */}
      {showCreateModal && (
        <CreateListingModal
          userId={userId}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateListing}
        />
      )}
    </div>
  );
}
