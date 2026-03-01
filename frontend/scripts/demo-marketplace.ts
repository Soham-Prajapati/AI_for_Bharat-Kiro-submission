/**
 * Marketplace Demo Script
 * Demonstrates the marketplace functionality with mock data
 * Task 4.1b: Build marketplace UI (Srushti)
 */

import { Listing, ListingType } from '@/types/api';

// Generate 100+ mock listings for testing
export function generateMockListings(count: number = 100): Listing[] {
  const types: ListingType[] = ['template', 'script', 'thumbnail', 'music', 'effect'];
  const titles = {
    template: [
      'Premium Video Template Pack',
      'Social Media Template Bundle',
      'Professional Presentation Templates',
      'YouTube Intro Template Collection',
      'Instagram Story Templates',
    ],
    script: [
      'Viral Video Script Collection',
      'Engaging Hook Scripts',
      'Product Review Script Pack',
      'Tutorial Script Templates',
      'Comedy Sketch Scripts',
    ],
    thumbnail: [
      'Eye-Catching Thumbnail Pack',
      'Professional Thumbnail Templates',
      'Gaming Thumbnail Bundle',
      'Vlog Thumbnail Collection',
      'Tutorial Thumbnail Pack',
    ],
    music: [
      'Royalty-Free Background Music',
      'Upbeat Intro Music Pack',
      'Cinematic Soundtrack Collection',
      'Lo-Fi Study Music Bundle',
      'Epic Trailer Music Pack',
    ],
    effect: [
      'Transition Effects Pack',
      'Particle Effects Bundle',
      'Color Grading Presets',
      'Sound Effects Collection',
      'Motion Graphics Pack',
    ],
  };

  const descriptions = {
    template: 'High-quality, professionally designed templates ready to use',
    script: 'Proven scripts that drive engagement and views',
    thumbnail: 'Attention-grabbing thumbnails that increase click-through rates',
    music: 'Royalty-free music perfect for your content',
    effect: 'Professional effects to enhance your videos',
  };

  const listings: Listing[] = [];

  for (let i = 0; i < count; i++) {
    const type = types[i % types.length];
    const titleOptions = titles[type];
    const title = `${titleOptions[i % titleOptions.length]} ${Math.floor(i / titleOptions.length) + 1}`;

    listings.push({
      id: `listing_${i.toString().padStart(4, '0')}`,
      title,
      description: descriptions[type],
      price: Math.round((Math.random() * 90 + 10) * 100) / 100, // $10-$100
      type,
      userId: `user_${Math.floor(Math.random() * 20)}`,
      status: Math.random() > 0.1 ? 'active' : 'sold', // 90% active
      rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0-5.0
      sales: Math.floor(Math.random() * 200),
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  return listings;
}

// Demo scenarios
export const demoScenarios = {
  // Scenario 1: Browse 100 listings
  browse100Listings: () => {
    console.log('📦 Scenario 1: Browse 100 Listings');
    const listings = generateMockListings(100);
    console.log(`✅ Generated ${listings.length} listings`);
    console.log(`   - Templates: ${listings.filter(l => l.type === 'template').length}`);
    console.log(`   - Scripts: ${listings.filter(l => l.type === 'script').length}`);
    console.log(`   - Thumbnails: ${listings.filter(l => l.type === 'thumbnail').length}`);
    console.log(`   - Music: ${listings.filter(l => l.type === 'music').length}`);
    console.log(`   - Effects: ${listings.filter(l => l.type === 'effect').length}`);
    return listings;
  },

  // Scenario 2: Search functionality
  searchListings: (listings: Listing[], query: string) => {
    console.log(`🔍 Scenario 2: Search for "${query}"`);
    const results = listings.filter(
      l => l.title.toLowerCase().includes(query.toLowerCase()) ||
        l.description?.toLowerCase().includes(query.toLowerCase())
    );
    console.log(`✅ Found ${results.length} results`);
    return results;
  },

  // Scenario 3: Filter by type
  filterByType: (listings: Listing[], type: ListingType) => {
    console.log(`🎯 Scenario 3: Filter by type "${type}"`);
    const results = listings.filter(l => l.type === type);
    console.log(`✅ Found ${results.length} ${type} listings`);
    return results;
  },

  // Scenario 4: Filter by price range
  filterByPrice: (listings: Listing[], min: number, max: number) => {
    console.log(`💰 Scenario 4: Filter by price $${min}-$${max}`);
    const results = listings.filter(l => l.price >= min && l.price <= max);
    console.log(`✅ Found ${results.length} listings in price range`);
    return results;
  },

  // Scenario 5: Purchase flow
  purchaseListing: (listing: Listing) => {
    console.log(`🛒 Scenario 5: Purchase "${listing.title}"`);
    console.log(`   - Price: $${listing.price.toFixed(2)}`);
    console.log(`   - Type: ${listing.type}`);
    console.log(`   - Rating: ${listing.rating?.toFixed(1)} ⭐`);
    console.log(`   - Sales: ${listing.sales}`);
    console.log('✅ Purchase initiated');
    return {
      success: true,
      transaction: {
        id: `txn_${Date.now()}`,
        listingId: listing.id,
        userId: 'demo_user',
        amount: listing.price,
        status: 'completed' as const,
        paymentMethod: 'stripe',
        purchasedAt: new Date().toISOString(),
      },
      downloadUrl: `https://example.com/download/${listing.id}`,
    };
  },

  // Scenario 6: Combined filters
  combinedFilters: (listings: Listing[], query: string, type: ListingType | 'all', minPrice: number, maxPrice: number) => {
    console.log(`🎨 Scenario 6: Combined Filters`);
    console.log(`   - Search: "${query}"`);
    console.log(`   - Type: ${type}`);
    console.log(`   - Price: $${minPrice}-$${maxPrice}`);

    let results = listings;

    // Apply search
    if (query) {
      results = results.filter(
        l => l.title.toLowerCase().includes(query.toLowerCase()) ||
          l.description?.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Apply type filter
    if (type !== 'all') {
      results = results.filter(l => l.type === type);
    }

    // Apply price filter
    results = results.filter(l => l.price >= minPrice && l.price <= maxPrice);

    console.log(`✅ Found ${results.length} listings matching all filters`);
    return results;
  },

  // Scenario 7: Performance test
  performanceTest: () => {
    console.log('⚡ Scenario 7: Performance Test');

    const start = performance.now();
    const listings = generateMockListings(150);
    const generateTime = performance.now() - start;

    const searchStart = performance.now();
    const searchResults = listings.filter(l => l.title.toLowerCase().includes('template'));
    const searchTime = performance.now() - searchStart;

    const filterStart = performance.now();
    const filterResults = listings.filter(l => l.type === 'template' && l.price >= 20 && l.price <= 50);
    const filterTime = performance.now() - filterStart;

    console.log(`✅ Performance Results:`);
    console.log(`   - Generate 150 listings: ${generateTime.toFixed(2)}ms`);
    console.log(`   - Search 150 listings: ${searchTime.toFixed(2)}ms`);
    console.log(`   - Filter 150 listings: ${filterTime.toFixed(2)}ms`);
    console.log(`   - Total time: ${(generateTime + searchTime + filterTime).toFixed(2)}ms`);

    return {
      generateTime,
      searchTime,
      filterTime,
      totalListings: listings.length,
      searchResults: searchResults.length,
      filterResults: filterResults.length,
    };
  },
};

// Run all demo scenarios
export function runAllDemos() {
  console.log('🚀 Running Marketplace Demo Scenarios\n');

  // Scenario 1: Browse
  const listings = demoScenarios.browse100Listings();
  console.log('');

  // Scenario 2: Search
  demoScenarios.searchListings(listings, 'template');
  console.log('');

  // Scenario 3: Filter by type
  demoScenarios.filterByType(listings, 'script');
  console.log('');

  // Scenario 4: Filter by price
  demoScenarios.filterByPrice(listings, 20, 50);
  console.log('');

  // Scenario 5: Purchase
  const sampleListing = listings[0];
  demoScenarios.purchaseListing(sampleListing);
  console.log('');

  // Scenario 6: Combined filters
  demoScenarios.combinedFilters(listings, 'video', 'template', 30, 70);
  console.log('');

  // Scenario 7: Performance
  demoScenarios.performanceTest();
  console.log('');

  console.log('✅ All demo scenarios completed successfully!');
}

// Export for use in other files
export default {
  generateMockListings,
  demoScenarios,
  runAllDemos,
};
