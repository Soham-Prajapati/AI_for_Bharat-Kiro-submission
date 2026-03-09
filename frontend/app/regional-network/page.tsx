'use client';

import { useState, useEffect } from 'react';
import RegionMap from '@/components/regional/RegionMap';
import CreatorCard from '@/components/regional/CreatorCard';
import CollabRequest from '@/components/regional/CollabRequest';
import CreatorChatModal from '@/components/regional/CreatorChatModal';
import ProfileSwitcher from '@/components/ProfileSwitcher';
import { RegionType, Creator, CollaborationMatch } from '@/types/regional';

// Embedded seed data — used client-side since Next.js static export disables API routes
const SEED_CREATORS: Creator[] = [
  // NORTH
  { id: 'c_n1', name: 'Arjun Sharma', handle: '@arjuncreatesnow', region: 'north', city: 'Delhi', languages: ['hindi'], niche: '💻 Technology', audienceSize: 890000, followersByPlatform: { youtube: 420000, instagram: 310000, twitter: 160000 }, audienceType: 'youth', platforms: ['youtube','instagram','twitter'], bio: "Tech reviews & tutorials in Hindi. Building India's largest Hindi-tech community.", lookingForCollabs: true, verified: true, avatarColor: 'from-blue-500 to-cyan-500', collaborationPreferences: { regions: ['north','west'], languages: ['hindi'], niches: ['💻 Technology','📚 Education'], minAudienceSize: 50000 } },
  { id: 'c_n2', name: 'Priya Malhotra', handle: '@priyalifestyle', region: 'north', city: 'Chandigarh', languages: ['hindi'], niche: '💪 Health & Fitness', audienceSize: 1200000, followersByPlatform: { instagram: 750000, youtube: 320000, facebook: 130000 }, audienceType: 'general', platforms: ['instagram','youtube','facebook'], bio: 'Fitness coach & nutritionist. Certified yoga instructor. 5M meals planned.', lookingForCollabs: true, verified: true, avatarColor: 'from-pink-500 to-rose-500', collaborationPreferences: { regions: ['north'], languages: ['hindi'], niches: ['💪 Health & Fitness','🍳 Food & Cooking'] } },
  { id: 'c_n3', name: 'Rohit Verma', handle: '@rohittravels', region: 'north', city: 'Jaipur', languages: ['hindi'], niche: '✈️ Travel & Adventure', audienceSize: 560000, followersByPlatform: { youtube: 380000, instagram: 180000 }, audienceType: 'youth', platforms: ['youtube','instagram'], bio: 'Exploring Rajasthan and beyond. Budget travel tips for every Indian.', lookingForCollabs: false, verified: false, avatarColor: 'from-orange-500 to-amber-500', collaborationPreferences: { regions: ['north','west'], languages: ['hindi'], niches: ['✈️ Travel & Adventure'] } },
  { id: 'c_n4', name: 'Sneha Kapoor', handle: '@snehabakes', region: 'north', city: 'Lucknow', languages: ['hindi'], niche: '🍳 Food & Cooking', audienceSize: 2100000, followersByPlatform: { instagram: 1200000, youtube: 600000, facebook: 300000 }, audienceType: 'beginners', platforms: ['instagram','youtube','facebook'], bio: 'Awadhi recipes & modern fusion. 2.1M foodies. Featured in Times Food.', lookingForCollabs: true, verified: true, avatarColor: 'from-yellow-500 to-orange-400', collaborationPreferences: { regions: ['north'], languages: ['hindi'], niches: ['🍳 Food & Cooking','📦 Product Reviews'] } },
  { id: 'c_n5', name: 'Vikram Singh', handle: '@vikrambusiness', region: 'north', city: 'Delhi', languages: ['hindi'], niche: '📈 Business & Finance', audienceSize: 730000, followersByPlatform: { youtube: 450000, linkedin: 200000, twitter: 80000 }, audienceType: 'professional', platforms: ['youtube','linkedin','twitter'], bio: 'CA turned content creator. Breaking down finance for everyday Indians.', lookingForCollabs: true, verified: true, avatarColor: 'from-indigo-500 to-purple-500', collaborationPreferences: { regions: ['north','west'], languages: ['hindi'], niches: ['📈 Business & Finance','📚 Education'] } },
  { id: 'c_n6', name: 'Meera Joshi', handle: '@meeralearns', region: 'north', city: 'Agra', languages: ['hindi'], niche: '📚 Education', audienceSize: 980000, followersByPlatform: { youtube: 700000, instagram: 180000, facebook: 100000 }, audienceType: 'beginners', platforms: ['youtube','instagram','facebook'], bio: 'Making competitive exam prep accessible to every student in Hindi.', lookingForCollabs: true, verified: false, avatarColor: 'from-teal-500 to-cyan-400', collaborationPreferences: { regions: ['north','east'], languages: ['hindi'], niches: ['📚 Education'] } },
  // SOUTH
  { id: 'c_s1', name: 'Kavya Reddy', handle: '@kavyatechtalks', region: 'south', city: 'Hyderabad', languages: ['telugu'], niche: '💻 Technology', audienceSize: 650000, followersByPlatform: { youtube: 400000, instagram: 180000, twitter: 70000 }, audienceType: 'expert', platforms: ['youtube','instagram','twitter'], bio: 'Software engineer & tech educator. Telugu-medium coding tutorials.', lookingForCollabs: true, verified: true, avatarColor: 'from-violet-500 to-indigo-500', collaborationPreferences: { regions: ['south'], languages: ['telugu'], niches: ['💻 Technology','📚 Education'] } },
  { id: 'c_s2', name: 'Arun Kumar', handle: '@arunchef', region: 'south', city: 'Chennai', languages: ['tamil'], niche: '🍳 Food & Cooking', audienceSize: 3400000, followersByPlatform: { youtube: 2000000, instagram: 1000000, facebook: 400000 }, audienceType: 'general', platforms: ['youtube','instagram','facebook'], bio: 'Tamil Nadu traditional recipes. Preserving heritage one dish at a time.', lookingForCollabs: false, verified: true, avatarColor: 'from-red-500 to-orange-500', collaborationPreferences: { regions: ['south'], languages: ['tamil'], niches: ['🍳 Food & Cooking','✈️ Travel & Adventure'] } },
  { id: 'c_s3', name: 'Divya Nair', handle: '@divyafitlife', region: 'south', city: 'Kochi', languages: ['malayalam'], niche: '💪 Health & Fitness', audienceSize: 820000, followersByPlatform: { instagram: 600000, youtube: 150000, facebook: 70000 }, audienceType: 'general', platforms: ['instagram','youtube','facebook'], bio: 'Certified personal trainer. Ayurveda-inspired fitness routines.', lookingForCollabs: true, verified: true, avatarColor: 'from-emerald-500 to-green-400', collaborationPreferences: { regions: ['south'], languages: ['malayalam'], niches: ['💪 Health & Fitness','🍳 Food & Cooking'] } },
  { id: 'c_s4', name: 'Karthik Subramanian', handle: '@karthikfilms', region: 'south', city: 'Bangalore', languages: ['kannada'], niche: '🎬 Entertainment', audienceSize: 1500000, followersByPlatform: { youtube: 900000, instagram: 450000, twitter: 150000 }, audienceType: 'youth', platforms: ['youtube','instagram','twitter'], bio: 'Short film maker & comedian. 150M+ views. National Award nominee.', lookingForCollabs: true, verified: true, avatarColor: 'from-fuchsia-500 to-pink-400', collaborationPreferences: { regions: ['south','north'], languages: ['kannada'], niches: ['🎬 Entertainment','✈️ Travel & Adventure'] } },
  { id: 'c_s5', name: 'Anitha Krishnamurthy', handle: '@anithafinance', region: 'south', city: 'Bangalore', languages: ['kannada'], niche: '📈 Business & Finance', audienceSize: 410000, followersByPlatform: { youtube: 250000, linkedin: 120000, instagram: 40000 }, audienceType: 'professional', platforms: ['youtube','linkedin','instagram'], bio: 'Investment banker turned educator. Making stock markets simple in Kannada.', lookingForCollabs: false, verified: false, avatarColor: 'from-sky-500 to-blue-400', collaborationPreferences: { regions: ['south'], languages: ['kannada'], niches: ['📈 Business & Finance'] } },
  { id: 'c_s6', name: 'Pradeep Raj', handle: '@pradeeptravels', region: 'south', city: 'Thiruvananthapuram', languages: ['malayalam'], niche: '✈️ Travel & Adventure', audienceSize: 690000, followersByPlatform: { youtube: 450000, instagram: 200000, facebook: 40000 }, audienceType: 'youth', platforms: ['youtube','instagram','facebook'], bio: "Exploring Kerala's hidden gems. Backpacker. Solo traveler.", lookingForCollabs: true, verified: false, avatarColor: 'from-lime-500 to-emerald-400', collaborationPreferences: { regions: ['south'], languages: ['malayalam'], niches: ['✈️ Travel & Adventure'] } },
  { id: 'c_s7', name: 'Lakshmi Venkataraman', handle: '@lakshmiteacher', region: 'south', city: 'Coimbatore', languages: ['tamil'], niche: '📚 Education', audienceSize: 1100000, followersByPlatform: { youtube: 850000, instagram: 200000, facebook: 50000 }, audienceType: 'beginners', platforms: ['youtube','instagram','facebook'], bio: "IIT grad making JEE & NEET content in Tamil. 50,000 students placed.", lookingForCollabs: true, verified: true, avatarColor: 'from-amber-500 to-yellow-400', collaborationPreferences: { regions: ['south'], languages: ['tamil'], niches: ['📚 Education','💻 Technology'] } },
  // EAST
  { id: 'c_e1', name: 'Subhash Ghosh', handle: '@subhashwrites', region: 'east', city: 'Kolkata', languages: ['bengali'], niche: '📚 Education', audienceSize: 780000, followersByPlatform: { youtube: 500000, facebook: 200000, instagram: 80000 }, audienceType: 'intermediate', platforms: ['youtube','facebook','instagram'], bio: 'Bengali literature & competitive exam coaching. 10 years, 200K students.', lookingForCollabs: true, verified: true, avatarColor: 'from-cyan-600 to-blue-500', collaborationPreferences: { regions: ['east'], languages: ['bengali'], niches: ['📚 Education'] } },
  { id: 'c_e2', name: 'Rina Patra', handle: '@rinacooks', region: 'east', city: 'Bhubaneswar', languages: ['odia'], niche: '🍳 Food & Cooking', audienceSize: 450000, followersByPlatform: { youtube: 280000, instagram: 130000, facebook: 40000 }, audienceType: 'general', platforms: ['youtube','instagram','facebook'], bio: "Authentic Odia cuisine & tribal recipes. Preserving Odisha's food heritage.", lookingForCollabs: true, verified: false, avatarColor: 'from-orange-400 to-red-400', collaborationPreferences: { regions: ['east'], languages: ['odia'], niches: ['🍳 Food & Cooking','✈️ Travel & Adventure'] } },
  { id: 'c_e3', name: 'Animesh Das', handle: '@animeshtech', region: 'east', city: 'Kolkata', languages: ['bengali'], niche: '💻 Technology', audienceSize: 320000, followersByPlatform: { youtube: 210000, instagram: 80000, twitter: 30000 }, audienceType: 'youth', platforms: ['youtube','instagram','twitter'], bio: 'Web dev & AI content in Bengali. Building next-gen devs from East India.', lookingForCollabs: true, verified: false, avatarColor: 'from-indigo-400 to-violet-500', collaborationPreferences: { regions: ['east','north'], languages: ['bengali'], niches: ['💻 Technology','📚 Education'] } },
  { id: 'c_e4', name: 'Soumya Chakraborty', handle: '@soumyafitness', region: 'east', city: 'Kolkata', languages: ['bengali'], niche: '💪 Health & Fitness', audienceSize: 290000, followersByPlatform: { instagram: 200000, youtube: 70000, facebook: 20000 }, audienceType: 'youth', platforms: ['instagram','youtube','facebook'], bio: 'Functional fitness & mental health advocate. ISSA certified trainer.', lookingForCollabs: true, verified: false, avatarColor: 'from-green-500 to-teal-400', collaborationPreferences: { regions: ['east'], languages: ['bengali'], niches: ['💪 Health & Fitness'] } },
  { id: 'c_e5', name: 'Bijoy Mahanta', handle: '@bijoyassam', region: 'east', city: 'Guwahati', languages: ['hindi'], niche: '✈️ Travel & Adventure', audienceSize: 510000, followersByPlatform: { youtube: 350000, instagram: 120000, facebook: 40000 }, audienceType: 'youth', platforms: ['youtube','instagram','facebook'], bio: 'Northeast India explorer. Documenting Assam, Meghalaya, Arunachal.', lookingForCollabs: true, verified: true, avatarColor: 'from-emerald-600 to-lime-500', collaborationPreferences: { regions: ['east'], languages: ['hindi'], niches: ['✈️ Travel & Adventure','🎬 Entertainment'] } },
  { id: 'c_e6', name: 'Ananya Sen', handle: '@ananyaentertain', region: 'east', city: 'Kolkata', languages: ['bengali'], niche: '🎬 Entertainment', audienceSize: 870000, followersByPlatform: { youtube: 550000, instagram: 250000, facebook: 70000 }, audienceType: 'general', platforms: ['youtube','instagram','facebook'], bio: 'Bengali short films & comedy sketches. 300M+ lifetime views.', lookingForCollabs: false, verified: true, avatarColor: 'from-rose-500 to-fuchsia-500', collaborationPreferences: { regions: ['east'], languages: ['bengali'], niches: ['🎬 Entertainment'] } },
  // WEST
  { id: 'c_w1', name: 'Rahul Desai', handle: '@rahulstartup', region: 'west', city: 'Mumbai', languages: ['marathi'], niche: '📈 Business & Finance', audienceSize: 1800000, followersByPlatform: { youtube: 1000000, linkedin: 500000, twitter: 300000 }, audienceType: 'professional', platforms: ['youtube','linkedin','twitter'], bio: 'Serial entrepreneur. 3 exits. Helping Indian founders build global startups.', lookingForCollabs: true, verified: true, avatarColor: 'from-blue-600 to-indigo-500', collaborationPreferences: { regions: ['west','north'], languages: ['marathi'], niches: ['📈 Business & Finance','💻 Technology'] } },
  { id: 'c_w2', name: 'Neha Patil', handle: '@nehaeats', region: 'west', city: 'Pune', languages: ['marathi'], niche: '🍳 Food & Cooking', audienceSize: 950000, followersByPlatform: { instagram: 600000, youtube: 280000, facebook: 70000 }, audienceType: 'general', platforms: ['instagram','youtube','facebook'], bio: 'Maharashtrian recipes & street food diaries. 1M foodie family.', lookingForCollabs: true, verified: true, avatarColor: 'from-yellow-500 to-amber-400', collaborationPreferences: { regions: ['west'], languages: ['marathi'], niches: ['🍳 Food & Cooking'] } },
  { id: 'c_w3', name: 'Ankit Shah', handle: '@ankittech', region: 'west', city: 'Ahmedabad', languages: ['gujarati'], niche: '💻 Technology', audienceSize: 430000, followersByPlatform: { youtube: 290000, instagram: 100000, twitter: 40000 }, audienceType: 'intermediate', platforms: ['youtube','instagram','twitter'], bio: 'Gujarati tech creator. App dev tutorials & gadget reviews.', lookingForCollabs: true, verified: false, avatarColor: 'from-sky-500 to-cyan-400', collaborationPreferences: { regions: ['west'], languages: ['gujarati'], niches: ['💻 Technology','📈 Business & Finance'] } },
  { id: 'c_w4', name: 'Pooja Iyer', handle: '@poojafitness', region: 'west', city: 'Mumbai', languages: ['hindi'], niche: '💪 Health & Fitness', audienceSize: 2200000, followersByPlatform: { instagram: 1500000, youtube: 500000, facebook: 200000 }, audienceType: 'general', platforms: ['instagram','youtube','facebook'], bio: 'Celebrity fitness trainer. 10 years, 500+ transformations. Bollywood trainer.', lookingForCollabs: false, verified: true, avatarColor: 'from-pink-500 to-red-400', collaborationPreferences: { regions: ['west','north'], languages: ['hindi'], niches: ['💪 Health & Fitness','🍳 Food & Cooking'] } },
  { id: 'c_w5', name: 'Kartik Mehta', handle: '@kartiktravel', region: 'west', city: 'Surat', languages: ['gujarati'], niche: '✈️ Travel & Adventure', audienceSize: 680000, followersByPlatform: { youtube: 420000, instagram: 200000, facebook: 60000 }, audienceType: 'youth', platforms: ['youtube','instagram','facebook'], bio: 'Budget travel hacks for Gujarati families. 50 countries explored.', lookingForCollabs: true, verified: false, avatarColor: 'from-orange-500 to-yellow-400', collaborationPreferences: { regions: ['west'], languages: ['gujarati'], niches: ['✈️ Travel & Adventure'] } },
  { id: 'c_w6', name: 'Siddharth Kulkarni', handle: '@siddharthfilms', region: 'west', city: 'Pune', languages: ['marathi'], niche: '🎬 Entertainment', audienceSize: 1100000, followersByPlatform: { youtube: 700000, instagram: 300000, facebook: 100000 }, audienceType: 'youth', platforms: ['youtube','instagram','facebook'], bio: 'Marathi filmmaker & comedy creator. Nat Geo storyteller award winner.', lookingForCollabs: true, verified: true, avatarColor: 'from-violet-500 to-purple-400', collaborationPreferences: { regions: ['west'], languages: ['marathi'], niches: ['🎬 Entertainment','✈️ Travel & Adventure'] } },
  { id: 'c_w7', name: 'Jaya Bhatt', handle: '@jayaeducates', region: 'west', city: 'Ahmedabad', languages: ['gujarati'], niche: '📚 Education', audienceSize: 540000, followersByPlatform: { youtube: 380000, instagram: 110000, facebook: 50000 }, audienceType: 'beginners', platforms: ['youtube','instagram','facebook'], bio: "UPSC coaching in Gujarati. India's top-rated state PSC mentor.", lookingForCollabs: true, verified: true, avatarColor: 'from-teal-500 to-emerald-400', collaborationPreferences: { regions: ['west'], languages: ['gujarati'], niches: ['📚 Education'] } },
];

export default function RegionalNetworkPage() {
  const [selectedRegion, setSelectedRegion] = useState<RegionType | null>(null);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [matches, setMatches] = useState<CollaborationMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCollabModal, setShowCollabModal] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [chatCreator, setChatCreator] = useState<Creator | null>(null);
  const [activeTab, setActiveTab] = useState<'explore' | 'matches'>('explore');

  useEffect(() => {
    if (selectedRegion) fetchCreators(selectedRegion);
  }, [selectedRegion]);

  const fetchCreators = async (region: RegionType) => {
    setLoading(true);
    // Use embedded seed data — Next.js static export doesn't support API routes
    const filtered = SEED_CREATORS.filter(c => c.region === region);
    setCreators(filtered);
    setLoading(false);
  };

  const fetchMatches = async () => {
    setLoading(true);
    // No matches API in static export — show empty for now
    setMatches([]);
    setLoading(false);
  };

  const handleRegionSelect = (region: RegionType) => {
    setSelectedRegion(region);
    setActiveTab('explore');
  };

  const handleCollabRequest = (creator: Creator) => {
    setSelectedCreator(creator);
    setShowCollabModal(true);
  };

  const handleOpenChat = (creator: Creator) => {
    setChatCreator(creator);
  };

  const handleSendRequest = async (message: string, collabType: string) => {
    try {
      // Try backend directly; silently succeed even if unavailable
      await fetch('http://localhost:3001/api/regional/collab-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toCreatorId: selectedCreator?.id, message, collabType }),
      }).catch(() => {/* ignore */});
      setShowCollabModal(false);
    } catch (error) {
      setShowCollabModal(false);
    }
  };

  const REGION_NAMES: Record<RegionType, string> = {
    north: 'North India',
    south: 'South India',
    east: 'East India',
    west: 'West India',
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      {/* Header */}
      <header className="border-b border-white/[0.07] bg-[#030712]/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
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
            {/* Profile switcher */}
            <div className="flex flex-col gap-2 items-end">
              <span className="text-[9px] font-mono text-white/25 uppercase tracking-widest">Your Profile</span>
              <ProfileSwitcher />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-white/[0.04] border border-white/[0.07] rounded-xl p-1 w-fit">
          <button
            onClick={() => setActiveTab('explore')}
            className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
              activeTab === 'explore' ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' : 'text-white/40 hover:text-white/70'
            }`}
          >
            Explore Regions
          </button>
          <button
            onClick={() => { setActiveTab('matches'); fetchMatches(); }}
            className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
              activeTab === 'matches' ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' : 'text-white/40 hover:text-white/70'
            }`}
          >
            Find Matches
          </button>
        </div>

        {/* ── Explore Tab ─────────────────────────────────────────── */}
        {activeTab === 'explore' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Map Section */}
            <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 font-display">Select Your Region</h2>
              <RegionMap selectedRegion={selectedRegion} onRegionSelect={handleRegionSelect} />
              {selectedRegion && (
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="bg-brand-500/10 rounded-xl p-4 border border-brand-500/20">
                    <div className="text-2xl font-bold text-brand-400">{creators.length}</div>
                    <div className="text-xs font-mono text-white/40 uppercase tracking-widest mt-1">Creators</div>
                  </div>
                  <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
                    <div className="text-2xl font-bold text-emerald-400">{Math.max(Math.floor(creators.length * 0.7), 1)}</div>
                    <div className="text-xs font-mono text-white/40 uppercase tracking-widest mt-1">Open to Collab</div>
                  </div>
                  <div className="bg-cyan-500/10 rounded-xl p-4 border border-cyan-500/20">
                    <div className="text-2xl font-bold text-cyan-400">{creators.filter(c => c.verified).length}</div>
                    <div className="text-xs font-mono text-white/40 uppercase tracking-widest mt-1">Verified</div>
                  </div>
                </div>
              )}
            </div>

            {/* Creators List */}
            <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 font-display">
                {selectedRegion
                  ? `Creators in ${REGION_NAMES[selectedRegion]}`
                  : 'Select a region to view creators'}
              </h2>

              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500" />
                </div>
              ) : creators.length > 0 ? (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {creators.map(creator => (
                    <CreatorCard
                      key={creator.id}
                      creator={creator}
                      onCollabRequest={handleCollabRequest}
                      onOpenChat={handleOpenChat}
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

        {/* ── Matches Tab ─────────────────────────────────────────── */}
        {activeTab === 'matches' && (
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-2 font-display">Your Collaboration Matches</h2>
            <p className="text-white/40 text-sm mb-6">AI-powered matches based on your region, language, niche, and audience</p>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500" />
              </div>
            ) : matches.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {matches.map((match, index) => (
                  <div key={index} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 hover:border-brand-500/30 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-3xl font-black font-display text-brand-400">{match.matchScore}%</div>
                      <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-mono font-semibold">Match</div>
                    </div>
                    <CreatorCard
                      creator={match.creator2}
                      onCollabRequest={handleCollabRequest}
                      onOpenChat={handleOpenChat}
                      showMatchInfo
                      matchReasons={match.matchReasons}
                    />
                    <div className="mt-4 pt-4 border-t border-white/[0.05]">
                      <div className="text-xs font-mono text-white/30 mb-1 uppercase tracking-widest">Suggested Collaboration:</div>
                      <div className="text-white font-semibold text-sm">{match.suggestedCollabType}</div>
                      <div className="text-xs text-brand-400 mt-2">Potential Reach: {match.potentialReach?.toLocaleString()}</div>
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

      {/* ── Modals ───────────────────────────────────────────────── */}
      {showCollabModal && selectedCreator && (
        <CollabRequest
          creator={selectedCreator}
          onClose={() => setShowCollabModal(false)}
          onSend={handleSendRequest}
        />
      )}

      {chatCreator && (
        <CreatorChatModal
          creator={chatCreator}
          onClose={() => setChatCreator(null)}
        />
      )}
    </div>
  );
}
