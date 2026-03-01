'use client';

import { Search, Filter, X } from 'lucide-react';
import { ListingType } from '@/types/api';
import { useState } from 'react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedType: ListingType | 'all';
  onTypeChange: (type: ListingType | 'all') => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
}

const listingTypes: Array<{ value: ListingType | 'all'; label: string; icon: string }> = [
  { value: 'all', label: 'All', icon: '🌟' },
  { value: 'template', label: 'Templates', icon: '📄' },
  { value: 'script', label: 'Scripts', icon: '📝' },
  { value: 'thumbnail', label: 'Thumbnails', icon: '🖼️' },
  { value: 'music', label: 'Music', icon: '🎵' },
  { value: 'effect', label: 'Effects', icon: '✨' },
];

export default function SearchBar({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  priceRange,
  onPriceRangeChange,
}: SearchBarProps) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="mb-8">
      {/* Search Input */}
      <div className="flex gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search templates, scripts, thumbnails..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            showFilters
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          <Filter className="w-5 h-5" />
          Filters
        </button>
      </div>

      {/* Type Filter Chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {listingTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => onTypeChange(type.value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedType === type.value
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <span>{type.icon}</span>
            <span>{type.label}</span>
          </button>
        ))}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Price Range</h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm text-gray-400 mb-2">Min Price</label>
                <input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => onPriceRangeChange([Number(e.target.value), priceRange[1]])}
                  min="0"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              
              <div className="flex-1">
                <label className="block text-sm text-gray-400 mb-2">Max Price</label>
                <input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => onPriceRangeChange([priceRange[0], Number(e.target.value)])}
                  min="0"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>

            <button
              onClick={() => {
                onPriceRangeChange([0, 1000]);
                onSearchChange('');
                onTypeChange('all');
              }}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
