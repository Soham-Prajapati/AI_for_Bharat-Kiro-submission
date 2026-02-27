# Analytics Dashboard - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Start the Development Server
```bash
cd frontend
npm run dev
```

### Step 2: Open the Analytics Dashboard
Navigate to: **http://localhost:3000/analytics**

### Step 3: Explore the Features
- View platform performance cards
- Check engagement trends in the chart
- Read AI-generated recommendations

## 📱 What You'll See

### Summary Cards (Top)
Three cards showing:
- **Total Followers**: 0.6M across all platforms
- **Avg Engagement**: 5.7%
- **Growing Platforms**: 3 out of 6

### Platform Cards (Grid)
Six cards displaying:
- YouTube (125K followers, 4.5% engagement)
- Instagram (89K followers, 9.2% engagement) 
- LinkedIn (34K followers, 3.8% engagement)
- Twitter (56K followers, 2.8% engagement)
- TikTok (210K followers, 11.5% engagement)
- Facebook (67K followers, 2.2% engagement)

### Engagement Chart
Line chart showing 5 months of engagement data for all platforms

### Recommendations
6 AI-generated insights including:
- Instagram engagement is 2x higher than YouTube
- TikTok is fastest-growing (+150%)
- LinkedIn posts on Tuesdays get 40% more engagement
- And more...

## 🎨 Features to Try

### Hover Effects
- Hover over platform cards to see shadow effects
- Hover over chart lines to see detailed tooltips

### Responsive Design
- Resize your browser to see responsive layouts
- Try mobile view (< 768px)
- Try tablet view (768px - 1024px)
- Try desktop view (> 1024px)

### Animations
- Watch cards fade in with staggered timing
- See engagement bars animate on load
- Notice smooth transitions on hover

## 🔧 Customization

### Change Mock Data
Edit `frontend/app/analytics/page.tsx`:

```typescript
// Update platform data
const platformsData: PlatformData[] = [
  {
    platform: 'youtube',
    followers: 200000, // Change this
    engagement: 0.06,  // Change this
    trend: 'up',
    topPost: {
      title: 'Your custom title',
      views: 50000,
      likes: 4000,
    },
  },
  // ... more platforms
];
```

### Change Colors
Edit `frontend/types/analytics.ts`:

```typescript
export const PLATFORM_COLORS: Record<Platform, string> = {
  youtube: '#FF0000',    // Change to your color
  instagram: '#E1306C',  // Change to your color
  // ... more platforms
};
```

### Add More Recommendations
Edit `frontend/app/analytics/page.tsx`:

```typescript
const recommendations: Recommendation[] = [
  {
    id: '7',
    priority: 'high',
    message: 'Your custom recommendation',
    platform: 'youtube',
  },
  // ... more recommendations
];
```

## 📊 Understanding the Data

### Engagement Rate
Calculated as: `(likes + comments + shares) / followers`
- Good: > 5%
- Average: 2-5%
- Needs improvement: < 2%

### Trend Indicators
- **Up (↑)**: Growing follower count
- **Down (↓)**: Declining follower count
- **Stable (−)**: No significant change

### Priority Levels
- **High**: Urgent action needed or major opportunity
- **Medium**: Important but not urgent
- **Low**: Nice to have or informational

## 🔗 Add to Navigation

To add analytics link to your app navigation:

1. Import Navigation component:
```tsx
import Navigation from '@/components/Navigation';
```

2. Add to your layout:
```tsx
export default function Layout({ children }) {
  return (
    <>
      <Navigation />
      {children}
    </>
  );
}
```

## 📚 Learn More

- **README.md**: Detailed feature documentation
- **INTEGRATION.md**: API integration guide
- **SUMMARY.md**: Complete implementation summary

## 🆘 Troubleshooting

### Dashboard not loading?
- Check that you're in the `frontend` directory
- Ensure `npm run dev` is running
- Verify you're accessing `http://localhost:3000/analytics`

### Components not rendering?
- Check browser console for errors
- Verify all dependencies are installed: `npm install`
- Clear Next.js cache: `rm -rf .next`

### Styling issues?
- Ensure Tailwind CSS is configured
- Check `tailwind.config.ts` includes app directory
- Verify `globals.css` imports Tailwind directives

## 💡 Tips

1. **Performance**: The dashboard is optimized with animations and lazy loading
2. **Accessibility**: All components use semantic HTML and ARIA labels
3. **Mobile-First**: Designed for mobile, enhanced for desktop
4. **Type-Safe**: Full TypeScript support with strict types
5. **Extensible**: Easy to add new platforms or metrics

## 🎯 Next Steps

1. ✅ View the dashboard
2. ✅ Explore all features
3. ✅ Customize mock data
4. ⬜ Integrate with real APIs (see INTEGRATION.md)
5. ⬜ Add authentication
6. ⬜ Deploy to production

---

**Need help?** Check the other documentation files or review the component source code for detailed implementation details.
