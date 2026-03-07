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
    <div className="min-h-screen bg-[#030712] text-white">
      {/* Header */}
      <header className="border-b border-white/[0.07] bg-[#030712]/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono font-semibold text-emerald-400 uppercase tracking-widest">Creator Network</span>
          </div>
          <h1 className="text-4xl font-black font-display text-white leading-none">
            Regional{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Network</span>
          </h1>
          <p className="text-white/40 mt-2 text-sm">
            Connect with creators across India · Collaborate locally · Grow together
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-white/[0.04] border border-white/[0.07] rounded-xl p-1 w-fit">
          <button
            onClick={() => setActiveTab('explore')}
            className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
              activeTab === 'explore'
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            Explore Regions
          </button>
          <button
            onClick={() => {
              setActiveTab('matches');
              fetchMatches();
            }}
            className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
              activeTab === 'matches'
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            Find Matches
          </button>
        </div>

        {/* Explore Tab */}
        {activeTab === 'explore' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Map Section */}
            <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 font-display">
                Select Your Region
              </h2>
              <RegionMap
                selectedRegion={selectedRegion}
                onRegionSelect={handleRegionSelect}
              />
              
              {/* Region Stats */}
              {selectedRegion && (
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="bg-brand-500/10 rounded-xl p-4 border border-brand-500/20">
                    <div className="text-2xl font-bold text-brand-400">{creators.length}</div>
                    <div className="text-xs font-mono text-white/40 uppercase tracking-widest mt-1">Creators</div>
                  </div>
                  <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
                    <div className="text-2xl font-bold text-emerald-400">{Math.floor(Math.random() * 50) + 20}</div>
                    <div className="text-xs font-mono text-white/40 uppercase tracking-widest mt-1">Active Today</div>
                  </div>
                  <div className="bg-cyan-500/10 rounded-xl p-4 border border-cyan-500/20">
                    <div className="text-2xl font-bold text-cyan-400">{Math.floor(Math.random() * 100) + 50}</div>
                    <div className="text-xs font-mono text-white/40 uppercase tracking-widest mt-1">Collabs</div>
                  </div>
                </div>
              )}
            </div>

            {/* Creators List */}
            <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 font-display">
                {selectedRegion
                  ? `Creators in ${selectedRegion.charAt(0).toUpperCase() + selectedRegion.slice(1)} India`
                  : 'Select a region to view creators'}
              </h2>

              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
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
                <div className="flex flex-col items-center justify-center h-64 text-white/30">
                  <div className="text-5xl mb-4 opacity-30">🗺️</div>
                  <p className="text-sm">Select a region on the map to discover creators</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Matches Tab */}
        {activeTab === 'matches' && (
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-2 font-display">Your Collaboration Matches</h2>
            <p className="text-white/40 text-sm mb-6">AI-powered matches based on your region, language, niche, and audience</p>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
              </div>
            ) : matches.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {matches.map((match, index) => (
                  <div
                    key={index}
                    className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 hover:border-brand-500/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-3xl font-black font-display text-brand-400">
                        {match.matchScore}%
                      </div>
                      <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-mono font-semibold">
                        Match
                      </div>
                    </div>

                    <CreatorCard
                      creator={match.creator2}
                      onCollabRequest={handleCollabRequest}
                      showMatchInfo
                      matchReasons={match.matchReasons}
                    />

                    <div className="mt-4 pt-4 border-t border-white/[0.05]">
                      <div className="text-xs font-mono text-white/30 mb-1 uppercase tracking-widest">Suggested Collaboration:</div>
                      <div className="text-white font-semibold text-sm">{match.suggestedCollabType}</div>
                      <div className="text-xs text-brand-400 mt-2">Potential Reach: {match.potentialReach.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-white/30">
                <div className="text-5xl mb-4 opacity-30">🤝</div>
                <p className="text-sm">No matches found. Complete your profile to get better matches!</p>
              </div>
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
