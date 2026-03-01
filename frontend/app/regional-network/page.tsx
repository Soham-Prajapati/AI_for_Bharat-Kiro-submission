'use client';

import { useState, useEffect } from 'react';
import RegionMap from '@/components/regional/RegionMap';
import CreatorCard from '@/components/regional/CreatorCard';
import CollabRequest from '@/components/regional/CollabRequest';
import { RegionType, Creator, CollaborationMatch } from '@/types/regional';

export default function RegionalNetworkPage() {
  const [selectedRegion, setSelectedRegion] = useState<RegionType | null>(null);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [matches, setMatches] = useState<CollaborationMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCollabModal, setShowCollabModal] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [activeTab, setActiveTab] = useState<'explore' | 'matches'>('explore');

  // Fetch creators when region is selected
  useEffect(() => {
    if (selectedRegion) {
      fetchCreators(selectedRegion);
    }
  }, [selectedRegion]);

  const fetchCreators = async (region: RegionType) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/regional/creators?region=${region}`);
      const data = await response.json();
      setCreators(data.creators || []);
    } catch (error) {
      console.error('Failed to fetch creators:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatches = async () => {
    setLoading(true);
    try {
      // Mock creator ID - in production, get from auth context
      const response = await fetch('/api/regional/matches?creatorId=current_user');
      const data = await response.json();
      setMatches(data.matches || []);
    } catch (error) {
      console.error('Failed to fetch matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegionSelect = (region: RegionType) => {
    setSelectedRegion(region);
    setActiveTab('explore');
  };

  const handleCollabRequest = (creator: Creator) => {
    setSelectedCreator(creator);
    setShowCollabModal(true);
  };

  const handleSendRequest = async (message: string, collabType: string) => {
    try {
      await fetch('/api/regional/collab-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toCreatorId: selectedCreator?.id,
          message,
          collabType,
        }),
      });
      setShowCollabModal(false);
      // Show success toast
    } catch (error) {
      console.error('Failed to send collaboration request:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="border-b border-purple-500/20 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Regional Network
          </h1>
          <p className="text-gray-400 mt-2">
            Connect with creators across India • Collaborate locally • Grow together
          </p>
        </header>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('explore')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'explore'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
            }`}
          >
            Explore Regions
          </button>
          <button
            onClick={() => {
              setActiveTab('matches');
              fetchMatches();
            }}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'matches'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
            }`}
          >
            Find Matches
          </button>
        </main>

        {/* Explore Tab */}
        {activeTab === 'explore' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Map Section */}
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
              <h2 className="text-2xl font-bold text-white mb-4">
                Select Your Region
              </h2>
              <RegionMap
                selectedRegion={selectedRegion}
                onRegionSelect={handleRegionSelect}
              />
              
              {/* Region Stats */}
              {selectedRegion && (
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                    <div className="text-2xl font-bold text-purple-400">
                      {creators.length}
                    </div>
                    <div className="text-sm text-gray-400">Creators</div>
                  </div>
                  <div className="bg-pink-500/10 rounded-lg p-4 border border-pink-500/20">
                    <div className="text-2xl font-bold text-pink-400">
                      {Math.floor(Math.random() * 50) + 20}
                    </div>
                    <div className="text-sm text-gray-400">Active Today</div>
                  </div>
                  <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                    <div className="text-2xl font-bold text-blue-400">
                      {Math.floor(Math.random() * 100) + 50}
                    </div>
                    <div className="text-sm text-gray-400">Collabs</div>
                  </div>
                </div>
              )}
            </div>

            {/* Creators List */}
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
              <h2 className="text-2xl font-bold text-white mb-4">
                {selectedRegion
                  ? `Creators in ${selectedRegion.charAt(0).toUpperCase() + selectedRegion.slice(1)} India`
                  : 'Select a region to view creators'}
              </h2>

              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : creators.length > 0 ? (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {creators.map((creator) => (
                    <CreatorCard
                      key={creator.id}
                      creator={creator}
                      onCollabRequest={handleCollabRequest}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <svg
                    className="w-16 h-16 mb-4 opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <p>Select a region on the map to discover creators</p>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Matches Tab */}
        {activeTab === 'matches' && (
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
            <h2 className="text-2xl font-bold text-white mb-4">
              Your Collaboration Matches
            </h2>
            <p className="text-gray-400 mb-6">
              AI-powered matches based on your region, language, niche, and audience
            </p>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : matches.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {matches.map((match, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/20"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
                        {match.matchScore}%
                      </div>
                      <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold">
                        Match
                      </div>
                    </div>

                    <CreatorCard
                      creator={match.creator2}
                      onCollabRequest={handleCollabRequest}
                      showMatchInfo
                      matchReasons={match.matchReasons}
                    />

                    <div className="mt-4 pt-4 border-t border-purple-500/20">
                      <div className="text-sm text-gray-400 mb-2">
                        Suggested Collaboration:
                      </div>
                      <div className="text-white font-semibold">
                        {match.suggestedCollabType}
                      </div>
                      <div className="text-sm text-purple-400 mt-2">
                        Potential Reach: {match.potentialReach.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <svg
                  className="w-16 h-16 mb-4 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p>No matches found. Complete your profile to get better matches!</p>
              </p>
            )}
          </div>
        )}
      </main>

      {/* Collaboration Request Modal */}
      {showCollabModal && selectedCreator && (
        <CollabRequest
          creator={selectedCreator}
          onClose={() => setShowCollabModal(false)}
          onSend={handleSendRequest}
        />
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(107, 114, 128, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.7);
        }
      `}</style>
    </div>
  );
}
