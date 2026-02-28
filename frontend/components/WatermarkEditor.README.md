# WatermarkEditor Component

A comprehensive watermark editor component for adding logos to images and videos with real-time preview and drag-drop positioning.

## Features

✅ **Drag-drop logo upload** - Upload logos via drag-drop or file picker
✅ **Position presets** - Quick positioning (top-left, top-right, bottom-left, bottom-right, center)
✅ **Custom positioning** - Drag the watermark anywhere on the preview
✅ **Opacity control** - Adjust watermark transparency (0-100%)
✅ **Size control** - Scale watermark size (5-50%)
✅ **Rotation control** - Rotate watermark (-180° to 180°)
✅ **Real-time preview** - See changes instantly
✅ **Responsive layout** - Works on desktop and mobile
✅ **Dark theme** - Matches existing component design
✅ **Framer Motion animations** - Smooth transitions and interactions
✅ **Toast notifications** - User feedback for all actions
✅ **TypeScript** - Full type safety

## Usage

### Basic Usage

```tsx
import WatermarkEditor from '@/components/WatermarkEditor';

export default function MyPage() {
  return (
    <WatermarkEditor
      onExport={(url) => console.log('Exported:', url)}
      onError={(error) => console.error('Error:', error)}
    />
  );
}
```

### With Existing Content

```tsx
<WatermarkEditor
  contentUrl="https://example.com/image.jpg"
  contentType="image"
  onExport={(url) => {
    // Download or save the watermarked content
    window.open(url, '_blank');
  }}
/>
```

### With Video Content

```tsx
<WatermarkEditor
  contentUrl="https://example.com/video.mp4"
  contentType="video"
  onExport={(url) => {
    // Handle video export
  }}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `contentUrl` | `string` | `undefined` | URL of the content to watermark |
| `contentType` | `'image' \| 'video'` | `'image'` | Type of content |
| `onExport` | `(url: string) => void` | `undefined` | Callback when export is clicked |
| `onError` | `(error: Error) => void` | `undefined` | Callback when an error occurs |

## Component Structure

```
WatermarkEditor
├── Left Panel (Controls)
│   ├── Logo Upload (drag-drop)
│   ├── Position Presets (5 buttons)
│   ├── Opacity Slider (0-100%)
│   ├── Size Slider (5-50%)
│   └── Rotation Slider (-180° to 180°)
└── Right Panel (Preview)
    ├── Content Display (image/video)
    ├── Draggable Watermark Overlay
    └── Export Button
```

## Styling

The component uses:
- **Tailwind CSS** for styling
- **Dark theme** (gray-900, gray-800 backgrounds)
- **Blue accents** for interactive elements
- **Framer Motion** for animations
- **Responsive grid** layout (1 column mobile, 3 columns desktop)

## Integration with API

The component is designed to integrate with the watermark API:

```typescript
// In the handleExport function, replace the mock implementation with:
const response = await apiClient.watermark.add({
  mediaUrl: previewUrl,
  mediaType: contentType,
  watermarkType: 'visible',
  visibleOptions: {
    logoUrl: settings.logoUrl,
    position: settings.position,
    opacity: settings.opacity / 100,
    size: 'custom',
    customSize: { width: settings.size, height: settings.size },
    rotation: settings.rotation,
  },
});

onExport?.(response.watermarkedUrl);
```

## Keyboard Shortcuts

- **Arrow keys** - Fine-tune watermark position (when in custom mode)
- **+/-** - Adjust size
- **[/]** - Adjust rotation

## Accessibility

- All controls have proper labels
- Keyboard navigation supported
- ARIA attributes for screen readers
- Focus indicators on interactive elements

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Dependencies

- `react` - Core framework
- `framer-motion` - Animations
- `@/services/api` - API client
- `@/hooks/useToastNotifications` - Toast notifications

## File Size

- Component: ~15KB (uncompressed)
- No external dependencies beyond project requirements

## Performance

- Optimized re-renders with `useCallback` and `useMemo`
- Efficient drag handling
- Lazy loading of preview images
- Memory cleanup on unmount

## Testing

```bash
# Run component tests
npm test WatermarkEditor

# Test scenarios:
# 1. Upload logo (valid/invalid files)
# 2. Position presets (all 5 positions)
# 3. Custom drag positioning
# 4. Opacity adjustment (0-100%)
# 5. Size adjustment (5-50%)
# 6. Rotation adjustment (-180° to 180°)
# 7. Export with/without logo
# 8. Error handling
```

## Future Enhancements

- [ ] Multiple watermarks
- [ ] Text watermarks
- [ ] Watermark templates
- [ ] Batch processing
- [ ] Invisible watermarks (steganography)
- [ ] Watermark detection
- [ ] Undo/redo functionality
- [ ] Save presets
- [ ] Export to different formats

## Related Components

- `DopamineOptimizer.tsx` - Similar dark theme and layout
- `VoiceTrainer.tsx` - Similar file upload patterns
- `ContentMultiplier.tsx` - Similar preview functionality

## License

Part of the Content Intelligence Platform project.
