'use client';

import { Star, ShoppingCart, Download, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Listing } from '@/types/api';

interface ListingCardProps {
  listing: Listing;
  index: number;
  onPurchase: (listing: Listing) => void;
}

type ListingType = 'template' | 'script' | 'thumbnail' | 'music' | 'effect';

const typeColors: Record<ListingType, string> = {
  template: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
  script: 'from-green-500/20 to-green-600/10 border-green-500/30',
  thumbnail: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
  music: 'from-pink-500/20 to-pink-600/10 border-pink-500/30',
  effect: 'from-orange-500/20 to-orange-600/10 border-orange-500/30',
};

const typeIcons: Record<ListingType, string> = {
  template: '📄',
  script: '📝',
  thumbnail: '🖼️',
  music: '🎵',
  effect: '✨',
};

export default function ListingCard({ listing, index, onPurchase }: ListingCardProps) {
  const router = useRouter()
  const safeType = (listing.type as ListingType) in typeColors
    ? (listing.type as ListingType)
    : 'template';

  const isFree = listing.price === 0
  const isTemplate = safeType === 'template' || safeType === 'script'

  const handleUseTemplate = () => {
    localStorage.setItem('templateContent', JSON.stringify({
      title: listing.title,
      description: listing.description || '',
      type: safeType,
    }))
    router.push('/upload?from=template')
  }

  return (
    <div
      className={`bg-gradient-to-br ${typeColors[safeType]} rounded-xl p-6 border hover:scale-[1.02] transition-transform`}
    >
      {/* Preview Image */}
      <div className="relative mb-4 rounded-lg overflow-hidden bg-gray-800 h-48 flex items-center justify-center">
        {listing.fileUrl ? (
          <img
            src={listing.fileUrl}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-6xl">{typeIcons[safeType]}</div>
        )}
        
        {/* Type Badge */}
        <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
          {safeType.charAt(0).toUpperCase() + safeType.slice(1)}
        </div>

        {/* Free Badge */}
        {isFree && (
          <div className="absolute top-2 right-2 bg-green-500/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white">
            FREE
          </div>
        )}

        {/* Status Badge */}
        {listing.status === 'sold' && (
          <div className="absolute top-2 right-2 bg-red-500/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
            Sold
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
        {listing.title}
      </h3>

      {/* Description */}
      {listing.description && (
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {listing.description}
        </p>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
        {listing.rating !== undefined && (
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span>{listing.rating.toFixed(1)}</span>
          </div>
        )}
        {listing.sales !== undefined && (
          <div className="flex items-center gap-1">
            <Download className="w-4 h-4" />
            <span>{listing.sales}</span>
          </div>
        )}
      </div>

      {/* Price and Action */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-2xl font-bold text-white">
            {isFree ? 'Free' : `₹${listing.price}`}
          </div>
          {!isFree && <div className="text-xs text-gray-500">INR</div>}
        </div>

        <div className="flex flex-col gap-2 items-end">
          {/* Use Template button for free template/script items */}
          {isFree && isTemplate && (
            <button
              onClick={handleUseTemplate}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm bg-brand-600 hover:bg-brand-500 text-white transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              Use Template
            </button>
          )}

          {/* Buy Now for paid items */}
          {!isFree && (
            <button
              onClick={() => onPurchase(listing)}
              disabled={listing.status !== 'active'}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                listing.status === 'active'
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              {listing.status === 'active' ? 'Buy Now' : 'Unavailable'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

