# Regional Network Feature

## Overview

The Regional Network feature connects creators across India by region and language, enabling local collaboration opportunities and community building.

## Features

### 🗺️ Interactive Regional Map
- Visual representation of India's 4 major regions (North, South, East, West)
- Click-to-explore interface with hover effects
- Real-time statistics for each region
- Animated particles and smooth transitions

### 👥 Creator Directory
- Browse creators by region, language, and niche
- Filter by audience size and collaboration preferences
- View detailed creator profiles with:
  - Bio and content niche
  - Audience size
  - Languages spoken
  - Active platforms
  - Collaboration availability

### 🤝 Collaboration Matching
- AI-powered matching algorithm (0-100 score)
- Match factors:
  - Regional proximity (20 points)
  - Language compatibility (25 points)
  - Niche alignment (30 points)
  - Audience size similarity (15 points)
  - Platform overlap (10 points)
- Suggested collaboration types
- Potential reach calculations

### 💬 Collaboration Requests
- Send collaboration requests with custom messages
- Multiple collaboration types:
  - Joint Video
  - Video Series
  - Cross-Promotion
  - Challenge
  - Guest Appearance
  - Custom
- Quick message templates
- Request status tracking

## Regional Hubs

### North India
- **States**: Delhi, Punjab, Haryana, UP, Rajasthan, Uttarakhand, HP, J&K
- **Primary Language**: Hindi
- **Top Niches**: Technology, Education, Comedy, Food, Travel

### South India
- **States**: Tamil Nadu, Karnataka, Kerala, Andhra Pradesh, Telangana
- **Languages**: Tamil, Telugu, Kannada, Malayalam
- **Top Niches**: Food, Film Review, Education, Music, Technology

### East India
- **States**: West Bengal, Odisha, Bihar, Jharkhand, Assam, Northeast states
- **Languages**: Bengali, Odia
- **Top Niches**: Education, Culture, Food, Travel, Art

### West India
- **States**: Maharashtra, Gujarat, Goa, MP, Chhattisgarh
- **Languages**: Marathi, Gujarati, Hindi
- **Top Niches**: Business, Food, Fashion, Technology, Entertainment

## Supported Languages

1. Hindi (हिंदी)
2. Bengali (বাংলা)
3. Tamil (தமிழ்)
4. Telugu (తెలుగు)
5. Marathi (मराठी)
6. Gujarati (ગુજરાતી)
7. Kannada (ಕನ್ನಡ)
8. Malayalam (മലയാളം)
9. Odia (ଓଡ଼ିଆ)

## API Endpoints

### Get Regional Hubs
```
GET /api/regional/hubs
```
Returns all regional hubs with statistics.

### Get Creators by Region
```
GET /api/regional/creators?region=north&language=hindi&niche=technology
```
Query Parameters:
- `region`: north | south | east | west
- `language`: (optional) Filter by language
- `niche`: (optional) Filter by content niche
- `minAudienceSize`: (optional) Minimum audience size

### Get Collaboration Matches
```
GET /api/regional/matches?creatorId=xxx&limit=10
```
Query Parameters:
- `creatorId`: Creator ID to find matches for
- `limit`: Number of matches to return (default: 10)

### Create Collaboration Request
```
POST /api/regional/collab-request
```
Body:
```json
{
  "toCreatorId": "creator_id",
  "message": "Collaboration message",
  "collabType": "video"
}
```

## Component Structure

```
frontend/app/regional-network/
├── page.tsx                    # Main page component
└── README.md                   # This file

frontend/components/regional/
├── RegionMap.tsx              # Interactive India map
├── CreatorCard.tsx            # Creator profile card
└── CollabRequest.tsx          # Collaboration request modal

frontend/types/
└── regional.ts                # TypeScript type definitions

frontend/pages/api/regional/
├── hubs.ts                    # Regional hubs API
├── creators.ts                # Creators API
├── matches.ts                 # Matching API
└── collab-request.ts          # Collaboration request API
```

## Usage

### Basic Usage

```tsx
import RegionalNetworkPage from '@/app/regional-network/page';

// The page is self-contained and handles all state management
<RegionalNetworkPage />
```

### Using Individual Components

```tsx
import RegionMap from '@/components/regional/RegionMap';
import CreatorCard from '@/components/regional/CreatorCard';
import CollabRequest from '@/components/regional/CollabRequest';

// Region Map
<RegionMap
  selectedRegion={selectedRegion}
  onRegionSelect={(region) => setSelectedRegion(region)}
/>

// Creator Card
<CreatorCard
  creator={creator}
  onCollabRequest={(creator) => handleCollabRequest(creator)}
  showMatchInfo={true}
  matchReasons={['Same region', 'Shared language']}
/>

// Collaboration Request Modal
<CollabRequest
  creator={selectedCreator}
  onClose={() => setShowModal(false)}
  onSend={(message, type) => handleSend(message, type)}
/>
```

## Styling

The feature uses:
- **TailwindCSS** for utility-first styling
- **Dark mode** with purple/pink gradient theme
- **Glassmorphism** effects with backdrop blur
- **Smooth animations** and transitions
- **Responsive design** for mobile, tablet, and desktop

### Color Palette

- **Primary**: Purple (#A855F7) to Pink (#EC4899)
- **Background**: Gray-900 with gradient overlays
- **Accents**: Blue, Green, Yellow for regions
- **Text**: White with gray variations

## Responsive Breakpoints

- **Mobile**: < 768px (single column layout)
- **Tablet**: 768px - 1024px (adjusted grid)
- **Desktop**: > 1024px (full two-column layout)

## Performance Optimizations

1. **Lazy Loading**: Components load on demand
2. **Memoization**: Expensive calculations cached
3. **Virtual Scrolling**: For large creator lists
4. **Debounced Search**: Reduces API calls
5. **Optimistic Updates**: Instant UI feedback

## Accessibility

- Semantic HTML elements
- ARIA labels for interactive elements
- Keyboard navigation support
- Screen reader friendly
- High contrast ratios
- Focus indicators

## Future Enhancements

- [ ] Real-time chat between matched creators
- [ ] Video call integration for collaboration planning
- [ ] Collaboration project management tools
- [ ] Success stories and testimonials
- [ ] Regional events and meetups
- [ ] Language-specific content recommendations
- [ ] Advanced filtering and search
- [ ] Creator verification badges
- [ ] Collaboration analytics dashboard

## Testing

```bash
# Run component tests
npm test components/regional

# Run integration tests
npm test app/regional-network

# Run E2E tests
npm run test:e2e regional-network
```

## Troubleshooting

### Creators not loading
- Check API endpoint configuration
- Verify backend service is running
- Check network tab for errors

### Map not interactive
- Ensure JavaScript is enabled
- Check for console errors
- Verify component props are passed correctly

### Collaboration requests failing
- Verify authentication token
- Check request payload format
- Ensure backend API is accessible

## Support

For issues or questions:
- Check the [main documentation](../../README.md)
- Review [API documentation](../../../docs/api/)
- Contact the development team

---

**Last Updated**: 2024
**Version**: 1.0.0
**Status**: Production Ready
