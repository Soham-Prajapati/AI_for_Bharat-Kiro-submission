# Dashboard Quick Start Guide

## 🚀 Getting Started

### 1. Start the Development Server
```bash
cd frontend
npm run dev
```

### 2. Access the Dashboard
Open your browser and navigate to:
```
http://localhost:3000/dashboard
```

## 📋 Features at a Glance

### Content Cards
- **10 Mock Items** pre-loaded for testing
- **Platform Icons**: YouTube 📺, Instagram 📸, LinkedIn 💼, Twitter 🐦, Facebook 👥, Blog 📝
- **Status Badges**: Draft (yellow), Published (green), Scheduled (blue)
- **Engagement Metrics**: Views, Likes, Shares, Comments

### Search & Filter
```
🔍 Search Box → Type to filter content
📱 Platform Filter → Select specific platform
✅ Status Filter → Filter by draft/published/scheduled
🗑️ Clear All → Reset all filters
```

### Analytics
- **Views**: Total content views by platform
- **Engagement**: Likes + Comments combined
- **Reach**: Shares × 10 multiplier
- **Interactive**: Click metric buttons to switch views

### Export
1. Click "Export Data" button
2. Choose format:
   - 📄 PDF (as text file)
   - 📋 JSON (raw data)
   - 📊 CSV (spreadsheet)
3. File downloads automatically

## 🎨 Design Features

### Dark Mode Theme
- Consistent with landing page
- Purple/Pink/Blue gradient accents
- Animated background orbs
- Glass-morphism effects

### Animations
- **Staggered Loading**: Cards appear sequentially
- **Hover Effects**: Scale and elevation
- **Smooth Transitions**: 60fps animations
- **Loading States**: Spinner during data fetch

### Responsive Layout
- **Mobile**: 1 column
- **Tablet**: 2 columns
- **Desktop**: 3 columns

## 🔧 Customization

### Change Mock Data Count
Edit `frontend/app/dashboard/page.tsx`:
```typescript
// Change from 10 to any number
Array.from({ length: 10 }, (_, i) => ({
  // Change to: Array.from({ length: 20 }, (_, i) => ({
```

### Add New Platform
Edit `frontend/types/content.ts`:
```typescript
platform: 'YouTube' | 'Instagram' | 'LinkedIn' | 'Twitter' | 'Facebook' | 'Blog' | 'TikTok';
```

Then update `ContentCard.tsx`:
```typescript
const platformColors = {
  // ... existing
  TikTok: 'from-pink-400 to-cyan-400',
}

const platformIcons = {
  // ... existing
  TikTok: '🎵',
}
```

### Modify Colors
Edit Tailwind classes in components:
```typescript
// Purple accent
className="bg-purple-600"

// Change to blue
className="bg-blue-600"
```

## 🔌 API Integration

### Replace Mock Data with Real API

Edit `frontend/app/dashboard/page.tsx`:

```typescript
// Remove this:
useEffect(() => {
  const loadData = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setContentData(generateMockData())
    setIsLoading(false)
  }
  loadData()
}, [])

// Replace with:
useEffect(() => {
  const loadData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/generate/:id')
      const data = await response.json()
      setContentData(data)
    } catch (error) {
      console.error('Failed to load content:', error)
    } finally {
      setIsLoading(false)
    }
  }
  loadData()
}, [])
```

## 📊 Data Structure

### ContentItem Interface
```typescript
{
  id: string                    // Unique identifier
  title: string                 // Content title
  platform: string              // Platform name
  language: string              // Content language
  content: string               // Content text
  createdAt: string            // ISO date string
  engagement: {
    views: number              // View count
    likes: number              // Like count
    shares: number             // Share count
    comments: number           // Comment count
  }
  status: string               // draft | published | scheduled
  tags: string[]               // Content tags
}
```

## 🎯 Common Tasks

### Filter by Platform
1. Click platform dropdown
2. Select "YouTube"
3. Only YouTube content shows

### Search Content
1. Type "AI" in search box
2. Content with "AI" in title/content shows
3. Clear search to reset

### Export to CSV
1. Click "Export Data"
2. Select "Export as CSV"
3. Open in Excel/Google Sheets

### View Analytics
1. Scroll to analytics section
2. Click "Engagement" button
3. See engagement by platform

## 🐛 Troubleshooting

### Dashboard is blank
- Check console for errors
- Ensure mock data is generating
- Verify all imports are correct

### Animations are laggy
- Close other browser tabs
- Enable hardware acceleration
- Check CPU usage

### Export not working
- Check browser download settings
- Allow pop-ups for localhost
- Check browser console

### Filters not working
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Check state updates in React DevTools

## 📱 Mobile Testing

### Test Responsive Design
1. Open Chrome DevTools (F12)
2. Click device toolbar icon
3. Select device:
   - iPhone 12 Pro
   - iPad Pro
   - Galaxy S20

### Mobile Features
- Touch-friendly buttons
- Swipeable cards (future)
- Collapsible filters
- Bottom navigation (future)

## 🚀 Performance Tips

### Optimize for Large Datasets
1. Implement virtualization (react-window)
2. Add pagination
3. Lazy load images
4. Debounce search input

### Reduce Bundle Size
1. Use dynamic imports
2. Code split by route
3. Optimize images
4. Remove unused dependencies

## 📚 Next Steps

1. **Connect Backend**: Integrate real API endpoints
2. **Add Authentication**: Protect dashboard routes
3. **Real-time Updates**: WebSocket for live data
4. **Advanced Filters**: Date range, engagement thresholds
5. **Bulk Actions**: Multi-select and batch operations
6. **Content Editor**: In-place editing
7. **Scheduling**: Calendar view for scheduled content
8. **Notifications**: Alert for new content
9. **Collaboration**: Share and comment features
10. **Mobile App**: React Native version

## 🎓 Learning Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Hooks](https://react.dev/reference/react)

## 💡 Pro Tips

1. Use React DevTools to inspect component state
2. Check Network tab for API calls
3. Use Lighthouse for performance audits
4. Test with real data early
5. Keep components small and focused
6. Use TypeScript for type safety
7. Write tests for critical features
8. Document complex logic
9. Use ESLint for code quality
10. Keep dependencies updated

---

**Need Help?** Check the main README or create an issue on GitHub.
