# Content Intelligence Platform - Setup Guide

## Quick Start

```bash
cd frontend
npm install
npm run dev
```

Visit http://localhost:3000 to see your landing page!

## What's Included

### Pages
- **app/page.tsx** - Main landing page combining all components

### Components
1. **Hero.tsx** - Hero section with:
   - Animated gradient background
   - Real-time counting stats (4.5hrs saved, 6 platforms, 10,000+ content)
   - CTA buttons (Start Free Trial, Watch Demo)
   - Responsive design

2. **FeatureGrid.tsx** - Features section with:
   - 6 key features with icons and descriptions
   - Platform optimization, 9 languages, 60-second generation
   - Smart formatting, analytics, AI learning
   - Supported platforms badges

3. **PricingCards.tsx** - Pricing section with:
   - Free tier (₹0/forever)
   - Pro tier (₹999/month) - marked as popular
   - Enterprise tier (Custom pricing)
   - Feature lists and CTAs

4. **Footer.tsx** - Footer with:
   - Brand information
   - Link sections (Product, Company, Resources, Legal)
   - Social media links
   - Copyright and badges

### Styling & Configuration
- **globals.css** - Global styles with dark mode
- **tailwind.config.ts** - Tailwind configuration with custom animations
- **postcss.config.js** - PostCSS configuration
- **layout.tsx** - Root layout with metadata

## Key Features

### Animations
- Framer Motion for smooth transitions
- Hover effects on cards and buttons
- Scroll-triggered animations (whileInView)
- Counting animations for stats

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Flexible grids and layouts
- Touch-friendly buttons

### Dark Mode
- Dark theme by default
- Gradient backgrounds (purple, pink, blue)
- Glass morphism effects (backdrop-blur)
- Consistent color scheme

## Customization Tips

### Change Colors
Edit `tailwind.config.ts`:
```typescript
theme: {
  extend: {
    colors: {
      // Add your custom colors
    }
  }
}
```

### Modify Content
- Hero stats: Edit `Hero.tsx` useState initial values
- Features: Update `features` array in `FeatureGrid.tsx`
- Pricing: Modify `pricingTiers` array in `PricingCards.tsx`
- Footer links: Update `footerLinks` object in `Footer.tsx`

### Adjust Animations
Framer Motion props to tweak:
- `initial` - Starting state
- `animate` - End state
- `transition` - Animation timing
- `whileHover` - Hover effects
- `whileTap` - Click effects

## Production Build

```bash
npm run build
npm start
```

## Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Docker
```bash
docker build -t content-platform-frontend .
docker run -p 3000:3000 content-platform-frontend
```

## Troubleshooting

### Port already in use
```bash
# Kill process on port 3000
npx kill-port 3000
# Or use different port
npm run dev -- -p 3001
```

### Module not found
```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript errors
```bash
npm run build
# Check output for specific errors
```

## Next Steps

1. Add actual API integration
2. Implement authentication
3. Connect to backend services
4. Add more pages (About, Blog, etc.)
5. Set up analytics tracking
6. Add SEO optimization
7. Implement form validation
8. Add loading states

## Support

For issues or questions, refer to:
- Next.js docs: https://nextjs.org/docs
- Tailwind docs: https://tailwindcss.com/docs
- Framer Motion docs: https://www.framer.com/motion/
