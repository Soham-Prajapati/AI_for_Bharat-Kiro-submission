'use client';

import { useState } from 'react';
import { RegionType } from '@/types/regional';

interface RegionMapProps {
  selectedRegion: RegionType | null;
  onRegionSelect: (region: RegionType) => void;
}

export default function RegionMap({ selectedRegion, onRegionSelect }: RegionMapProps) {
  const [hoveredRegion, setHoveredRegion] = useState<RegionType | null>(null);

  const regions = [
    {
      type: 'north' as RegionType,
      name: 'North India',
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'from-blue-400 to-blue-500',
      position: 'top-[10%] left-[35%]',
      states: ['Delhi', 'Punjab', 'Haryana', 'UP', 'Rajasthan'],
    },
    {
      type: 'south' as RegionType,
      name: 'South India',
      color: 'from-green-500 to-green-600',
      hoverColor: 'from-green-400 to-green-500',
      position: 'bottom-[10%] left-[35%]',
      states: ['Tamil Nadu', 'Karnataka', 'Kerala', 'Andhra Pradesh'],
    },
    {
      type: 'east' as RegionType,
      name: 'East India',
      color: 'from-yellow-500 to-yellow-600',
      hoverColor: 'from-yellow-400 to-yellow-500',
      position: 'top-[35%] right-[15%]',
      states: ['West Bengal', 'Odisha', 'Bihar', 'Assam'],
    },
    {
      type: 'west' as RegionType,
      name: 'West India',
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'from-purple-400 to-purple-500',
      position: 'top-[35%] left-[10%]',
      states: ['Maharashtra', 'Gujarat', 'Goa', 'MP'],
    },
  ];

  return (
    <div className="relative w-full aspect-square bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-purple-500/20 overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-10">
        <svg viewBox="0 0 400 400" className="w-full h-full">
          {/* India outline (simplified) */}
          <path
            d="M200 50 L250 100 L280 150 L290 200 L280 250 L250 300 L200 350 L150 300 L120 250 L110 200 L120 150 L150 100 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-purple-500"
          />
        </svg>
      </div>

      {/* Region Buttons */}
      {regions.map((region) => (
        <button
          key={region.type}
          onClick={() => onRegionSelect(region.type)}
          onMouseEnter={() => setHoveredRegion(region.type)}
          onMouseLeave={() => setHoveredRegion(null)}
          className={`absolute ${region.position} transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
            selectedRegion === region.type
              ? 'scale-110 z-20'
              : hoveredRegion === region.type
              ? 'scale-105 z-10'
              : 'scale-100'
          }`}
        >
          <div
            className={`relative bg-gradient-to-br ${
              selectedRegion === region.type || hoveredRegion === region.type
                ? region.hoverColor
                : region.color
            } rounded-2xl p-6 shadow-2xl border-2 ${
              selectedRegion === region.type
                ? 'border-white shadow-white/50'
                : 'border-transparent'
            } min-w-[140px] transition-all duration-300`}
          >
            {/* Glow effect */}
            {selectedRegion === region.type && (
              <div className="absolute inset-0 bg-white/20 rounded-2xl animate-pulse"></div>
            )}

            <div className="relative z-10">
              <div className="text-white font-bold text-lg mb-1">
                {region.name}
              </div>
              <div className="text-white/80 text-xs">
                {region.states.join(', ')}
              </div>
            </div>

            {/* Hover indicator */}
            {hoveredRegion === region.type && (
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-white rounded-full animate-ping"></div>
            )}
          </div>
        </button>
      ))}

      {/* Center Info */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-full p-8 border border-purple-500/30">
          <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
            🇮🇳
          </div>
          <div className="text-white font-semibold mt-2 text-sm">
            {selectedRegion
              ? regions.find((r) => r.type === selectedRegion)?.name
              : 'Select Region'}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 right-4 bg-black/40 backdrop-blur-sm rounded-lg p-3 border border-purple-500/20">
        <div className="text-xs text-gray-400 mb-2">Click a region to explore creators</div>
        <div className="grid grid-cols-2 gap-2">
          {regions.map((region) => (
            <div key={region.type} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${region.color}`}></div>
              <span className="text-xs text-white">{region.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Animated particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          ></div>
        ))}
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.5;
          }
        }
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
}
