# Membership & Pricing Page

A stunning, fully responsive membership and pricing page for the Content Intelligence Platform.

## 🎯 Features

### Pricing Tiers
- **Free Tier**: Basic features, 5 videos/month, 1 platform
- **Pro Tier ($29/mo)**: All features, unlimited videos, 6 platforms, priority support
- **Enterprise Tier ($99/mo)**: Everything + custom integrations, dedicated support, white-label

### Components

#### 1. **SubscriptionCard** (`/components/SubscriptionCard.tsx`)
Individual pricing card with:
- Gradient backgrounds
- Feature list with checkmarks
- Hover animations and scale effects
- "Most Popular" badge for Pro tier
- Responsive design

#### 2. **PricingTable** (`/components/PricingTable.tsx`)
Grid layout for all pricing tiers:
- Responsive grid (1 col mobile, 2 col tablet, 3 col desktop)
- Handles current plan highlighting
- Exports pricing data for reuse

#### 3. **SubscriptionManagement** (`/components/SubscriptionManagement.tsx`)
Subscription management interface:
- Current plan display
- Next billing date
- Upgrade/downgrade buttons
- Cancel subscription with confirmation modal
- Conditional rendering based on plan type

### Design Features

✨ **Visual Effects**:
- Gradient backgrounds with backdrop blur
- Smooth hover animations and scale transforms
- Animated hero section with pulse effects
- Fade-in and slide-up animations
- Shadow effects on hover

🎨 **Dark Mode Design**:
- Dark gradient backgrounds
- Purple/blue accent colors
- Glass-morphism effects
- High contrast for readability

📱 **Responsive Layout**:
- Mobile-first approach
- Breakpoints: sm, md, lg
- Flexible grid system
- Touch-friendly buttons

## 🚀 Usage

### Basic Implementation

```tsx
import PricingTable from '@/components/PricingTable';

function MyPage() {
  const handleSubscribe = (tierId: string) => {
    // Handle subscription logic
    console.log('Subscribe to:', tierId);
  };

  return (
    <PricingTable 
      currentPlanId="free" 
      onSubscribe={handleSubscribe} 
    />
  );
}
```

### With Subscription Management

```tsx
import SubscriptionManagement from '@/components/SubscriptionManagement';

function MyPage() {
  const currentPlan = {
    id: 'pro',
    name: 'Pro',
    price: 29,
    renewalDate: '2024-02-15'
  };

  return (
    <SubscriptionManagement
      currentPlan={currentPlan}
      onUpgrade={() => console.log('Upgrade')}
      onDowngrade={() => console.log('Downgrade')}
      onCancel={() => console.log('Cancel')}
    />
  );
}
```

## 🎨 Customization

### Modify Pricing Tiers

Edit `frontend/components/PricingTable.tsx`:

```tsx
const pricingTiers: SubscriptionTier[] = [
  {
    id: 'custom',
    name: 'Custom Plan',
    price: 49,
    period: 'month',
    description: 'Your custom description',
    gradient: 'from-blue-900 to-purple-900',
    cta: 'Subscribe Now',
    popular: false,
    features: [
      { text: 'Feature 1', included: true },
      { text: 'Feature 2', included: false },
    ],
  },
];
```

### Customize Colors

The page uses Tailwind CSS classes. Key color schemes:
- Primary gradient: `from-purple-600 to-blue-600`
- Background: `from-gray-900 to-gray-800`
- Borders: `border-gray-700`
- Text: `text-gray-300`

### Animation Customization

Animations are defined in `tailwind.config.ts`:
- `animate-fade-in`: Fade in effect
- `animate-slide-up`: Slide up effect
- `animate-pulse-slow`: Slow pulse effect

## 📋 Integration Checklist

- [x] Create pricing tiers
- [x] Implement subscription cards
- [x] Add subscription management
- [x] Responsive design
- [x] Dark mode styling
- [x] Hover animations
- [x] Toast notifications
- [x] FAQ section
- [x] CTA section
- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Backend API integration
- [ ] User authentication check
- [ ] Analytics tracking

## 🔗 API Integration

To connect with a backend:

```tsx
const handleSubscribe = async (tierId: string) => {
  try {
    const response = await fetch('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId: tierId }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      showToast('Subscription successful!', 'success');
      // Redirect to payment or dashboard
    }
  } catch (error) {
    showToast('Subscription failed', 'error');
  }
};
```

## 🎯 Next Steps

1. **Payment Integration**: Add Stripe or PayPal checkout
2. **User Authentication**: Check if user is logged in
3. **Backend API**: Connect to subscription management API
4. **Analytics**: Track conversion events
5. **A/B Testing**: Test different pricing strategies
6. **Email Notifications**: Send confirmation emails

## 📱 Responsive Breakpoints

- **Mobile**: < 768px (1 column)
- **Tablet**: 768px - 1024px (2 columns)
- **Desktop**: > 1024px (3 columns)

## 🎨 Color Palette

- **Purple**: `#9333ea` (purple-600)
- **Blue**: `#2563eb` (blue-600)
- **Gray Dark**: `#111827` (gray-900)
- **Gray Medium**: `#1f2937` (gray-800)
- **Gray Light**: `#374151` (gray-700)

## 📄 License

Part of the Content Intelligence Platform project.
