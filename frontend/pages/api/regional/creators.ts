import type { NextApiRequest, NextApiResponse } from 'next';
import type { Creator, RegionType } from '@/types/regional';

// ─── Seeded Indian creator database ────────────────────────────────────────
const SEED_CREATORS: Creator[] = [
  // NORTH
  { id: 'c_n1', name: 'Arjun Sharma', handle: '@arjuncreatesnow', region: 'north', city: 'Delhi', languages: ['hindi'], niche: '💻 Technology', audienceSize: 890000, followersByPlatform: { youtube: 420000, instagram: 310000, twitter: 160000 }, audienceType: 'youth', platforms: ['youtube','instagram','twitter'], bio: 'Tech reviews & tutorials in Hindi. Building India\'s largest Hindi-tech community.', lookingForCollabs: true, verified: true, avatarColor: 'from-blue-500 to-cyan-500', collaborationPreferences: { regions: ['north','west'], languages: ['hindi'], niches: ['💻 Technology','📚 Education'], minAudienceSize: 50000 } },
  { id: 'c_n2', name: 'Priya Malhotra', handle: '@priyalifestyle', region: 'north', city: 'Chandigarh', languages: ['hindi','punjabi' as any], niche: '💪 Health & Fitness', audienceSize: 1200000, followersByPlatform: { instagram: 750000, youtube: 320000, facebook: 130000 }, audienceType: 'general', platforms: ['instagram','youtube','facebook'], bio: 'Fitness coach & nutritionist. Certified yoga instructor. 5M meals planned.', lookingForCollabs: true, verified: true, avatarColor: 'from-pink-500 to-rose-500', collaborationPreferences: { regions: ['north'], languages: ['hindi'], niches: ['💪 Health & Fitness','🍳 Food & Cooking'] } },
  { id: 'c_n3', name: 'Rohit Verma', handle: '@rohittravels', region: 'north', city: 'Jaipur', languages: ['hindi'], niche: '✈️ Travel & Adventure', audienceSize: 560000, followersByPlatform: { youtube: 380000, instagram: 180000 }, audienceType: 'youth', platforms: ['youtube','instagram'], bio: 'Exploring Rajasthan and beyond. Budget travel tips for every Indian.', lookingForCollabs: false, verified: false, avatarColor: 'from-orange-500 to-amber-500', collaborationPreferences: { regions: ['north','west'], languages: ['hindi'], niches: ['✈️ Travel & Adventure'] } },
  { id: 'c_n4', name: 'Sneha Kapoor', handle: '@snehabakes', region: 'north', city: 'Lucknow', languages: ['hindi'], niche: '🍳 Food & Cooking', audienceSize: 2100000, followersByPlatform: { instagram: 1200000, youtube: 600000, facebook: 300000 }, audienceType: 'beginners', platforms: ['instagram','youtube','facebook'], bio: 'Awadhi recipes & modern fusion. 2.1M foodies. Featured in Times Food.', lookingForCollabs: true, verified: true, avatarColor: 'from-yellow-500 to-orange-400', collaborationPreferences: { regions: ['north'], languages: ['hindi'], niches: ['🍳 Food & Cooking','📦 Product Reviews'] } },
  { id: 'c_n5', name: 'Vikram Singh', handle: '@vikrambusiness', region: 'north', city: 'Delhi', languages: ['hindi','english' as any], niche: '📈 Business & Finance', audienceSize: 730000, followersByPlatform: { youtube: 450000, linkedin: 200000, twitter: 80000 }, audienceType: 'professional', platforms: ['youtube','linkedin','twitter'], bio: 'CA turned content creator. Breaking down finance for everyday Indians.', lookingForCollabs: true, verified: true, avatarColor: 'from-indigo-500 to-purple-500', collaborationPreferences: { regions: ['north','west'], languages: ['hindi'], niches: ['📈 Business & Finance','📚 Education'] } },
  { id: 'c_n6', name: 'Meera Joshi', handle: '@meeralearns', region: 'north', city: 'Agra', languages: ['hindi'], niche: '📚 Education', audienceSize: 980000, followersByPlatform: { youtube: 700000, instagram: 180000, facebook: 100000 }, audienceType: 'beginners', platforms: ['youtube','instagram','facebook'], bio: 'Making competitive exam prep accessible to every student in Hindi.', lookingForCollabs: true, verified: false, avatarColor: 'from-teal-500 to-cyan-400', collaborationPreferences: { regions: ['north','east'], languages: ['hindi'], niches: ['📚 Education'] } },

  // SOUTH
  { id: 'c_s1', name: 'Kavya Reddy', handle: '@kavyatechtalks', region: 'south', city: 'Hyderabad', languages: ['telugu'], niche: '💻 Technology', audienceSize: 650000, followersByPlatform: { youtube: 400000, instagram: 180000, twitter: 70000 }, audienceType: 'expert', platforms: ['youtube','instagram','twitter'], bio: 'Software engineer & tech educator. Telugu-medium coding tutorials.', lookingForCollabs: true, verified: true, avatarColor: 'from-violet-500 to-indigo-500', collaborationPreferences: { regions: ['south'], languages: ['telugu'], niches: ['💻 Technology','📚 Education'] } },
  { id: 'c_s2', name: 'Arun Kumar', handle: '@arunchef', region: 'south', city: 'Chennai', languages: ['tamil'], niche: '🍳 Food & Cooking', audienceSize: 3400000, followersByPlatform: { youtube: 2000000, instagram: 1000000, facebook: 400000 }, audienceType: 'general', platforms: ['youtube','instagram','facebook'], bio: 'Tamil Nadu traditional recipes. Preserving heritage one dish at a time.', lookingForCollabs: false, verified: true, avatarColor: 'from-red-500 to-orange-500', collaborationPreferences: { regions: ['south'], languages: ['tamil'], niches: ['🍳 Food & Cooking','✈️ Travel & Adventure'] } },
  { id: 'c_s3', name: 'Divya Nair', handle: '@divyafitlife', region: 'south', city: 'Kochi', languages: ['malayalam'], niche: '💪 Health & Fitness', audienceSize: 820000, followersByPlatform: { instagram: 600000, youtube: 150000, facebook: 70000 }, audienceType: 'general', platforms: ['instagram','youtube','facebook'], bio: 'Certified personal trainer. Ayurveda-inspired fitness routines.', lookingForCollabs: true, verified: true, avatarColor: 'from-emerald-500 to-green-400', collaborationPreferences: { regions: ['south'], languages: ['malayalam'], niches: ['💪 Health & Fitness','🍳 Food & Cooking'] } },
  { id: 'c_s4', name: 'Karthik Subramanian', handle: '@karthikfilms', region: 'south', city: 'Bangalore', languages: ['kannada','tamil'], niche: '🎬 Entertainment', audienceSize: 1500000, followersByPlatform: { youtube: 900000, instagram: 450000, twitter: 150000 }, audienceType: 'youth', platforms: ['youtube','instagram','twitter'], bio: 'Short film maker & comedian. 150M+ views. National Award nominee.', lookingForCollabs: true, verified: true, avatarColor: 'from-fuchsia-500 to-pink-400', collaborationPreferences: { regions: ['south','north'], languages: ['kannada','tamil'], niches: ['🎬 Entertainment','✈️ Travel & Adventure'] } },
  { id: 'c_s5', name: 'Anitha Krishnamurthy', handle: '@anithafinance', region: 'south', city: 'Bangalore', languages: ['kannada'], niche: '📈 Business & Finance', audienceSize: 410000, followersByPlatform: { youtube: 250000, linkedin: 120000, instagram: 40000 }, audienceType: 'professional', platforms: ['youtube','linkedin','instagram'], bio: 'Investment banker turned educator. Making stock markets simple in Kannada.', lookingForCollabs: false, verified: false, avatarColor: 'from-sky-500 to-blue-400', collaborationPreferences: { regions: ['south'], languages: ['kannada'], niches: ['📈 Business & Finance'] } },
  { id: 'c_s6', name: 'Pradeep Raj', handle: '@pradeeptravels', region: 'south', city: 'Thiruvananthapuram', languages: ['malayalam'], niche: '✈️ Travel & Adventure', audienceSize: 690000, followersByPlatform: { youtube: 450000, instagram: 200000, facebook: 40000 }, audienceType: 'youth', platforms: ['youtube','instagram','facebook'], bio: 'Exploring Kerala\'s hidden gems. Backpacker. Solo traveler.', lookingForCollabs: true, verified: false, avatarColor: 'from-lime-500 to-emerald-400', collaborationPreferences: { regions: ['south'], languages: ['malayalam'], niches: ['✈️ Travel & Adventure'] } },
  { id: 'c_s7', name: 'Lakshmi Venkataraman', handle: '@lakshmiteacher', region: 'south', city: 'Coimbatore', languages: ['tamil'], niche: '📚 Education', audienceSize: 1100000, followersByPlatform: { youtube: 850000, instagram: 200000, facebook: 50000 }, audienceType: 'beginners', platforms: ['youtube','instagram','facebook'], bio: 'IIT grad making JEE & NEET content in Tamil. 50,000 students placed.', lookingForCollabs: true, verified: true, avatarColor: 'from-amber-500 to-yellow-400', collaborationPreferences: { regions: ['south'], languages: ['tamil'], niches: ['📚 Education','💻 Technology'] } },

  // EAST
  { id: 'c_e1', name: 'Subhash Ghosh', handle: '@subhashwrites', region: 'east', city: 'Kolkata', languages: ['bengali'], niche: '📚 Education', audienceSize: 780000, followersByPlatform: { youtube: 500000, facebook: 200000, instagram: 80000 }, audienceType: 'intermediate', platforms: ['youtube','facebook','instagram'], bio: 'Bengali literature & competitive exam coaching. 10 years, 200K students.', lookingForCollabs: true, verified: true, avatarColor: 'from-cyan-600 to-blue-500', collaborationPreferences: { regions: ['east'], languages: ['bengali'], niches: ['📚 Education'] } },
  { id: 'c_e2', name: 'Rina Patra', handle: '@rinacooks', region: 'east', city: 'Bhubaneswar', languages: ['odia'], niche: '🍳 Food & Cooking', audienceSize: 450000, followersByPlatform: { youtube: 280000, instagram: 130000, facebook: 40000 }, audienceType: 'general', platforms: ['youtube','instagram','facebook'], bio: 'Authentic Odia cuisine & tribal recipes. Preserving Odisha\'s food heritage.', lookingForCollabs: true, verified: false, avatarColor: 'from-orange-400 to-red-400', collaborationPreferences: { regions: ['east'], languages: ['odia'], niches: ['🍳 Food & Cooking','✈️ Travel & Adventure'] } },
  { id: 'c_e3', name: 'Animesh Das', handle: '@animeshtech', region: 'east', city: 'Kolkata', languages: ['bengali'], niche: '💻 Technology', audienceSize: 320000, followersByPlatform: { youtube: 210000, instagram: 80000, twitter: 30000 }, audienceType: 'youth', platforms: ['youtube','instagram','twitter'], bio: 'Web dev & AI content in Bengali. Building next-gen devs from East India.', lookingForCollabs: true, verified: false, avatarColor: 'from-indigo-400 to-violet-500', collaborationPreferences: { regions: ['east','north'], languages: ['bengali'], niches: ['💻 Technology','📚 Education'] } },
  { id: 'c_e4', name: 'Soumya Chakraborty', handle: '@soumyafitness', region: 'east', city: 'Kolkata', languages: ['bengali'], niche: '💪 Health & Fitness', audienceSize: 290000, followersByPlatform: { instagram: 200000, youtube: 70000, facebook: 20000 }, audienceType: 'youth', platforms: ['instagram','youtube','facebook'], bio: 'Functional fitness & mental health advocate. ISSA certified trainer.', lookingForCollabs: true, verified: false, avatarColor: 'from-green-500 to-teal-400', collaborationPreferences: { regions: ['east'], languages: ['bengali'], niches: ['💪 Health & Fitness'] } },
  { id: 'c_e5', name: 'Bijoy Mahanta', handle: '@bijoyassam', region: 'east', city: 'Guwahati', languages: ['hindi'], niche: '✈️ Travel & Adventure', audienceSize: 510000, followersByPlatform: { youtube: 350000, instagram: 120000, facebook: 40000 }, audienceType: 'youth', platforms: ['youtube','instagram','facebook'], bio: 'Northeast India explorer. Documenting Assam, Meghalaya, Arunachal.', lookingForCollabs: true, verified: true, avatarColor: 'from-emerald-600 to-lime-500', collaborationPreferences: { regions: ['east'], languages: ['hindi'], niches: ['✈️ Travel & Adventure','🎬 Entertainment'] } },
  { id: 'c_e6', name: 'Ananya Sen', handle: '@ananyaentertain', region: 'east', city: 'Kolkata', languages: ['bengali'], niche: '🎬 Entertainment', audienceSize: 870000, followersByPlatform: { youtube: 550000, instagram: 250000, facebook: 70000 }, audienceType: 'general', platforms: ['youtube','instagram','facebook'], bio: 'Bengali short films & comedy sketches. 300M+ lifetime views.', lookingForCollabs: false, verified: true, avatarColor: 'from-rose-500 to-fuchsia-500', collaborationPreferences: { regions: ['east'], languages: ['bengali'], niches: ['🎬 Entertainment'] } },

  // WEST
  { id: 'c_w1', name: 'Rahul Desai', handle: '@rahulstartup', region: 'west', city: 'Mumbai', languages: ['marathi','hindi' as any], niche: '📈 Business & Finance', audienceSize: 1800000, followersByPlatform: { youtube: 1000000, linkedin: 500000, twitter: 300000 }, audienceType: 'professional', platforms: ['youtube','linkedin','twitter'], bio: 'Serial entrepreneur. 3 exits. Helping Indian founders build global startups.', lookingForCollabs: true, verified: true, avatarColor: 'from-blue-600 to-indigo-500', collaborationPreferences: { regions: ['west','north'], languages: ['hindi','marathi'], niches: ['📈 Business & Finance','💻 Technology'] } },
  { id: 'c_w2', name: 'Neha Patil', handle: '@nehaeats', region: 'west', city: 'Pune', languages: ['marathi'], niche: '🍳 Food & Cooking', audienceSize: 950000, followersByPlatform: { instagram: 600000, youtube: 280000, facebook: 70000 }, audienceType: 'general', platforms: ['instagram','youtube','facebook'], bio: 'Maharashtrian recipes & street food diaries. 1M foodie family.', lookingForCollabs: true, verified: true, avatarColor: 'from-yellow-500 to-amber-400', collaborationPreferences: { regions: ['west'], languages: ['marathi'], niches: ['🍳 Food & Cooking'] } },
  { id: 'c_w3', name: 'Ankit Shah', handle: '@ankittech', region: 'west', city: 'Ahmedabad', languages: ['gujarati'], niche: '💻 Technology', audienceSize: 430000, followersByPlatform: { youtube: 290000, instagram: 100000, twitter: 40000 }, audienceType: 'intermediate', platforms: ['youtube','instagram','twitter'], bio: 'Gujarati tech creator. App dev tutorials & gadget reviews.', lookingForCollabs: true, verified: false, avatarColor: 'from-sky-500 to-cyan-400', collaborationPreferences: { regions: ['west'], languages: ['gujarati'], niches: ['💻 Technology','📈 Business & Finance'] } },
  { id: 'c_w4', name: 'Pooja Iyer', handle: '@poojafitness', region: 'west', city: 'Mumbai', languages: ['hindi','marathi'], niche: '💪 Health & Fitness', audienceSize: 2200000, followersByPlatform: { instagram: 1500000, youtube: 500000, facebook: 200000 }, audienceType: 'general', platforms: ['instagram','youtube','facebook'], bio: 'Celebrity fitness trainer. 10 years, 500+ transformations. Bollywood trainer.', lookingForCollabs: false, verified: true, avatarColor: 'from-pink-500 to-red-400', collaborationPreferences: { regions: ['west','north'], languages: ['hindi'], niches: ['💪 Health & Fitness','🍳 Food & Cooking'] } },
  { id: 'c_w5', name: 'Kartik Mehta', handle: '@kartiktravel', region: 'west', city: 'Surat', languages: ['gujarati'], niche: '✈️ Travel & Adventure', audienceSize: 680000, followersByPlatform: { youtube: 420000, instagram: 200000, facebook: 60000 }, audienceType: 'youth', platforms: ['youtube','instagram','facebook'], bio: 'Budget travel hacks for Gujarati families. 50 countries explored.', lookingForCollabs: true, verified: false, avatarColor: 'from-orange-500 to-yellow-400', collaborationPreferences: { regions: ['west'], languages: ['gujarati'], niches: ['✈️ Travel & Adventure'] } },
  { id: 'c_w6', name: 'Siddharth Kulkarni', handle: '@siddharthfilms', region: 'west', city: 'Pune', languages: ['marathi'], niche: '🎬 Entertainment', audienceSize: 1100000, followersByPlatform: { youtube: 700000, instagram: 300000, facebook: 100000 }, audienceType: 'youth', platforms: ['youtube','instagram','facebook'], bio: 'Marathi filmmaker & comedy creator. Nat Geo storyteller award winner.', lookingForCollabs: true, verified: true, avatarColor: 'from-violet-500 to-purple-400', collaborationPreferences: { regions: ['west'], languages: ['marathi'], niches: ['🎬 Entertainment','✈️ Travel & Adventure'] } },
  { id: 'c_w7', name: 'Jaya Bhatt', handle: '@jayaeducates', region: 'west', city: 'Ahmedabad', languages: ['gujarati'], niche: '📚 Education', audienceSize: 540000, followersByPlatform: { youtube: 380000, instagram: 110000, facebook: 50000 }, audienceType: 'beginners', platforms: ['youtube','instagram','facebook'], bio: 'UPSC coaching in Gujarati. India\'s top-rated state PSC mentor.', lookingForCollabs: true, verified: true, avatarColor: 'from-teal-500 to-emerald-400', collaborationPreferences: { regions: ['west'], languages: ['gujarati'], niches: ['📚 Education'] } },
];

/**
 * API Route: Get creators by region
 * GET /api/regional/creators?region=north&language=hindi&niche=technology
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { region, language, niche } = req.query;

  // Try backend first, fall back to seeded data
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const params = new URLSearchParams();
    if (region) params.append('region', region as string);
    if (language) params.append('language', language as string);
    if (niche) params.append('niche', niche as string);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const response = await fetch(`${backendUrl}/api/regional/creators?${params.toString()}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      // Merge backend creators with seed data so we always have rich fields
      const merged = (data.creators || []).map((c: any, i: number) => ({
        ...SEED_CREATORS[i % SEED_CREATORS.length],
        ...c,
        followersByPlatform: c.followersByPlatform || { youtube: Math.round(c.audienceSize * 0.6), instagram: Math.round(c.audienceSize * 0.4) },
        audienceType: c.audienceType || 'general',
        verified: c.verified ?? (c.audienceSize > 500000),
        handle: c.handle || `@${c.name.toLowerCase().replace(/\s+/g, '')}`,
        city: c.city || 'India',
        avatarColor: c.avatarColor || 'from-brand-500 to-cyan-500',
      }));
      return res.status(200).json({ region, creators: merged });
    }
  } catch {
    // Backend unreachable — use seeded data
  }

  // Filter seeded creators by region/language/niche
  let creators = region
    ? SEED_CREATORS.filter(c => c.region === (region as RegionType))
    : SEED_CREATORS;

  if (language) {
    creators = creators.filter(c => c.languages.includes(language as any));
  }
  if (niche) {
    const n = (niche as string).toLowerCase();
    creators = creators.filter(c => c.niche.toLowerCase().includes(n));
  }

  return res.status(200).json({ region, creators });
}
