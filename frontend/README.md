# Content Intelligence Platform - Frontend

A modern, responsive landing page built with Next.js 14, TailwindCSS, and Framer Motion.

## Features

- 🎨 Dark mode with gradient backgrounds
- ✨ Smooth animations with Framer Motion
- 📱 Fully responsive (mobile, tablet, desktop)
- ⚡ Next.js 14 App Router
- 🎯 TypeScript for type safety
- 🌈 TailwindCSS for styling

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx       # Root layout with metadata
│   ├── page.tsx         # Main landing page
│   └── globals.css      # Global styles
├── components/
│   ├── Hero.tsx         # Hero section with animated stats
│   ├── FeatureGrid.tsx  # Features showcase
│   ├── PricingCards.tsx # Pricing tiers
│   └── Footer.tsx       # Footer with links
├── public/              # Static assets
└── tailwind.config.ts   # Tailwind configuration
```

## Components

### Hero
- Animated gradient background
- Real-time counting stats
- CTA buttons with hover effects
- Responsive design

### FeatureGrid
- 6 key features with icons
- Hover animations
- Platform badges
- Gradient overlays

### PricingCards
- 3 pricing tiers (Free, Pro, Enterprise)
- Feature comparison
- Popular badge
- Responsive grid

### Footer
- Multi-column link sections
- Social media links
- Brand information
- Mobile-friendly

## Build for Production

```bash
npm run build
npm start
```

## Technologies

- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type safety
- **TailwindCSS** - Utility-first CSS
- **Framer Motion** - Animation library

## Customization

### Colors
Edit `tailwind.config.ts` to customize the color scheme.

### Content
Update component files to modify text, features, and pricing.

### Animations
Adjust Framer Motion parameters in component files for different animation effects.

## License

MIT
