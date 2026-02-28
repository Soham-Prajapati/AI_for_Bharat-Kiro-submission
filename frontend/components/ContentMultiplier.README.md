# ContentMultiplier Component

## Overview

The `ContentMultiplier` component is a powerful UI tool that transforms a single video into 50+ pieces of repurposed content including clips, quotes, and audiograms. It provides an intuitive interface for browsing, searching, filtering, and exporting generated content.

## Features

### Core Functionality
- ✅ **Content Generation**: Generate 50+ content pieces from a single video transcript
- ✅ **Dual View Modes**: Toggle between Grid and Tree view for different browsing experiences
- ✅ **Advanced Search**: Real-time search across all content titles, text, and platforms
- ✅ **Type Filtering**: Filter by content type (clips, quotes, audiograms, or all)
- ✅ **Bulk Selection**: Select individual items or use Select All/Deselect All
- ✅ **Export Options**: Export selected items or all filtered items as JSON

### UI/UX Features
- ✅ **Smooth Animations**: Framer Motion animations for all interactions
- ✅ **Loading States**: Visual feedback during content generation
- ✅ **Error Handling**: Clear error messages with retry options
- ✅ **Dark Theme**: Optimized for dark mode with gradient accents
- ✅ **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- ✅ **Performance**: Optimized rendering for 50+ items with virtualization

## Installation

```bash
# The component is already included in the project
# No additional installation required
```

## Dependencies

- `framer-motion`: For smooth animations
- `@/services/api`: API client for backend communication
- `@/types/api`: TypeScript type definitions

## Usage

### Basic Example

```tsx
import ContentMultiplier from '@/components/ContentMultiplier'

function MyPage() {
  const handleExport = (items) => {
    console.log('Exported items:', items)
    // Handle export logic
  }

  return (
    <ContentMultiplier
      videoId="video-123"
      transcript="Your video transcript here..."
      onExport={handleExport}
    />
  )
}
```

### With State Management

```tsx
import { useState } from 'react'
import ContentMultiplier from '@/components/ContentMultiplier'

function ContentPage() {
  const [transcript, setTranscript] = useState('')
  const [exportedContent, setExportedContent] = useState([])

  return (
    <div>
      <textarea
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        placeholder="Paste your transcript..."
      />
      
      <ContentMultiplier
        transcript={transcript}
        onExport={setExportedContent}
      />
      
      {exportedContent.length > 0 && (
        <div>Successfully exported {exportedContent.length} items!</div>
      )}
    </div>
  )
}
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `videoId` | `string` | No | `undefined` | Unique identifier for the video |
| `transcript` | `string` | No | `undefined` | Video transcript text to process |
| `onExport` | `(items: ContentItem[]) => void` | No | `undefined` | Callback function when items are exported |

## API Integration

The component integrates with the backend API through `apiClient.multiply.generate()`:

```typescript
// API Request
const response = await apiClient.multiply.generate({
  videoId: 'video-123',
  transcript: 'Your transcript...',
  platforms: ['youtube', 'instagram', 'tiktok', 'linkedin', 'twitter', 'facebook']
})

// API Response
{
  clips: Clip[],
  quotes: Quote[],
  audiograms: Audiogram[],
  totalPieces: number,
  generatedAt: string
}
```

## Content Types

### Clip
```typescript
{
  id: string
  duration: number
  url: string
  platform: Platform
}
```

### Quote
```typescript
{
  id: string
  text: string
  imageUrl: string
}
```

### Audiogram
```typescript
{
  id: string
  duration: number
  url: string
}
```

## View Modes

### Grid View
- Displays content as cards in a responsive grid
- 1-4 columns depending on screen size
- Hover effects and animations
- Visual thumbnails with type icons

### Tree View
- Groups content by type (clips, quotes, audiograms)
- Hierarchical structure
- Expandable sections
- Compact list format

## Features in Detail

### Search Functionality
- Real-time filtering as you type
- Searches across:
  - Content titles
  - Quote text
  - Platform names
- Case-insensitive matching

### Type Filtering
- Filter by specific content type
- Options: All, Clips, Quotes, Audiograms
- Updates results instantly
- Works in combination with search

### Selection System
- Click any item to toggle selection
- Visual feedback with purple border
- Checkmark icon on selected items
- Select All / Deselect All buttons
- Selection count display

### Export System
- **Export Selected**: Downloads only selected items
- **Export All**: Downloads all filtered items
- Format: JSON file with metadata
- Filename includes timestamp
- Triggers `onExport` callback

## Styling

The component uses Tailwind CSS with a dark theme:

- **Background**: `bg-gray-800/50` with backdrop blur
- **Borders**: `border-gray-700` with hover effects
- **Accents**: Purple and pink gradients
- **Text**: White primary, gray secondary
- **Animations**: Framer Motion for smooth transitions

## Performance Considerations

### Optimizations
- `useMemo` for filtered content calculations
- `AnimatePresence` for smooth list updates
- Lazy rendering with staggered animations
- Efficient selection state management with `Set`

### Rendering 50+ Items
- Staggered animation delays (0.05s per item)
- Optimized re-renders with React hooks
- Minimal DOM updates on selection changes

## Error Handling

The component handles various error scenarios:

1. **No Transcript**: Shows error message
2. **API Failure**: Displays error with retry option
3. **Network Issues**: Graceful degradation
4. **Empty Results**: Shows empty state with guidance

## Accessibility

- Semantic HTML structure
- Keyboard navigation support
- ARIA labels on interactive elements
- Focus states on all buttons
- Screen reader friendly

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Responsive design

## Testing

### Manual Testing
1. Generate content with sample transcript
2. Test search functionality
3. Try all filter options
4. Toggle between view modes
5. Test selection and export
6. Verify responsive behavior

### Test Cases
- [ ] Generate with valid transcript
- [ ] Generate with empty transcript
- [ ] Search with various queries
- [ ] Filter by each content type
- [ ] Select/deselect items
- [ ] Export selected items
- [ ] Export all items
- [ ] Toggle view modes
- [ ] Responsive on mobile

## Troubleshooting

### Content Not Generating
- Verify transcript is provided
- Check API endpoint is accessible
- Review browser console for errors

### Search Not Working
- Ensure search query is not empty
- Check filtered content array
- Verify search logic in `useMemo`

### Export Not Downloading
- Check browser download permissions
- Verify Blob API support
- Review console for errors

## Future Enhancements

- [ ] Pagination for large datasets
- [ ] Virtual scrolling for performance
- [ ] Preview modal for content items
- [ ] Drag-and-drop reordering
- [ ] Custom export formats (CSV, Excel)
- [ ] Batch editing capabilities
- [ ] Content analytics dashboard
- [ ] Share functionality

## Related Components

- `ContentCard`: Individual content display
- `DNAChart`: Creator personality visualization
- `ViralScoreGauge`: Viral prediction display
- `GenerationProgress`: Real-time progress tracking

## Support

For issues or questions:
1. Check this README
2. Review `ContentMultiplier.example.tsx`
3. Check `ContentMultiplier.INTEGRATION.md`
4. Contact the development team

## License

Part of the Content Intelligence Platform project.
