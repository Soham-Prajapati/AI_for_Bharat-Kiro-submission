# Membership Page - Integration Guide

## 🚀 Quick Start

The membership page is ready to use at `/membership`. To integrate with your backend:

## 📋 Prerequisites

- Next.js 14+ with App Router
- TailwindCSS configured
- Toast context setup (already configured)
- TypeScript

## 🔌 Backend Integration Steps

### 1. Create Subscription API Endpoint

```typescript
// app/api/subscriptions/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { planId, userId } = await request.json();
  
  try {
    // Your subscription logic here
    const subscription = await createSubscription(userId, planId);
    
    return NextResponse.json({
      success: true,
      subscription,
      checkoutUrl: subscription.checkoutUrl, // Stripe/PayPal URL
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Subscription failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const userId = request.headers.get('user-id');
  
  try {
    const subscription = await getSubscription(userId);
    
    return NextResponse.json({
      success: true,
      subscription,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const userId = request.headers.get('user-id');
  
  try {
    await cancelSubscription(userId);
    
    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
```

### 2. Update Membership Page with API Calls

```typescript
// app/membership/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MembershipPage() {
  const router = useRouter();
  const [currentPlanId, setCurrentPlanId] = useState<string>('free');
  const [loading, setLoading] = useState(true);

  // Fetch current subscription on mount
  useEffect(() => {
    fetchCurrentSubscription();
  }, []);

  const fetchCurrentSubscription = async () => {
    try {
      const response = await fetch('/api/subscriptions');
      const data = await response.json();
      
      if (data.success && data.subscription) {
        setCurrentPlanId(data.subscription.planId);
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (tierId: string) => {
    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: tierId }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        if (data.checkoutUrl) {
          // Redirect to payment gateway
          window.location.href = data.checkoutUrl;
        } else {
          // Free plan or immediate activation
          setCurrentPlanId(tierId);
          showToast('Plan updated successfully!', 'success');
        }
      }
    } catch (error) {
      showToast('Failed to update plan', 'error');
    }
  };

  const handleCancel = async () => {
    try {
      const response = await fetch('/api/subscriptions', {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCurrentPlanId('free');
        showToast('Subscription cancelled', 'success');
      }
    } catch (error) {
      showToast('Failed to cancel subscription', 'error');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    // ... rest of the component
  );
}
```

### 3. Add Authentication Check

```typescript
// app/membership/page.tsx
import { useAuth } from '@/hooks/useAuth';

export default function MembershipPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/membership');
    }
  }, [isAuthenticated]);

  // ... rest of the component
}
```

## 💳 Payment Gateway Integration

### Stripe Integration

```typescript
// lib/stripe.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function createCheckoutSession(
  userId: string,
  planId: string
) {
  const priceIds = {
    pro: process.env.STRIPE_PRO_PRICE_ID,
    enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID,
  };

  const session = await stripe.checkout.sessions.create({
    customer_email: user.email,
    line_items: [
      {
        price: priceIds[planId],
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_URL}/membership?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/membership?canceled=true`,
    metadata: {
      userId,
      planId,
    },
  });

  return session.url;
}

export async function cancelSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.cancel(subscriptionId);
  return subscription;
}
```

### Webhook Handler

```typescript
// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutComplete(session);
      break;

    case 'customer.subscription.deleted':
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionCancelled(subscription);
      break;

    case 'customer.subscription.updated':
      const updatedSubscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionUpdated(updatedSubscription);
      break;
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const { userId, planId } = session.metadata!;
  
  // Update user subscription in database
  await updateUserSubscription(userId, {
    planId,
    status: 'active',
    stripeSubscriptionId: session.subscription as string,
    currentPeriodEnd: new Date(session.expires_at * 1000),
  });
}

async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  // Update user subscription status
  await updateSubscriptionStatus(
    subscription.id,
    'cancelled'
  );
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  // Handle subscription changes
  await updateSubscriptionDetails(subscription.id, {
    status: subscription.status,
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
  });
}
```

## 🗄️ Database Schema

```sql
-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  plan_id VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL, -- active, cancelled, past_due
  stripe_subscription_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
```

## 🔐 Environment Variables

```env
# .env.local

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...

# App
NEXT_PUBLIC_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://...
```

## 📊 Analytics Integration

```typescript
// lib/analytics.ts

export function trackSubscription(planId: string, action: string) {
  // Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'subscription', {
      event_category: 'Subscription',
      event_label: planId,
      event_action: action,
    });
  }

  // Mixpanel
  if (typeof window !== 'undefined' && window.mixpanel) {
    window.mixpanel.track('Subscription Action', {
      plan: planId,
      action: action,
    });
  }
}

// Usage in membership page
const handleSubscribe = async (tierId: string) => {
  trackSubscription(tierId, 'subscribe_clicked');
  
  // ... rest of subscription logic
  
  if (success) {
    trackSubscription(tierId, 'subscribe_completed');
  }
};
```

## 🧪 Testing

### Unit Tests

```typescript
// __tests__/membership.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import MembershipPage from '@/app/membership/page';

describe('MembershipPage', () => {
  it('renders pricing tiers', () => {
    render(<MembershipPage />);
    
    expect(screen.getByText('Free')).toBeInTheDocument();
    expect(screen.getByText('Pro')).toBeInTheDocument();
    expect(screen.getByText('Enterprise')).toBeInTheDocument();
  });

  it('handles subscription click', async () => {
    const { getByText } = render(<MembershipPage />);
    
    const subscribeButton = getByText('Subscribe to Pro');
    fireEvent.click(subscribeButton);
    
    // Assert API call was made
    expect(fetch).toHaveBeenCalledWith('/api/subscriptions', {
      method: 'POST',
      body: JSON.stringify({ planId: 'pro' }),
    });
  });
});
```

### E2E Tests (Playwright)

```typescript
// e2e/membership.spec.ts
import { test, expect } from '@playwright/test';

test('complete subscription flow', async ({ page }) => {
  await page.goto('/membership');
  
  // Click Pro plan
  await page.click('text=Subscribe to Pro');
  
  // Should redirect to Stripe checkout
  await expect(page).toHaveURL(/checkout.stripe.com/);
  
  // Fill payment details (test mode)
  await page.fill('[name="cardNumber"]', '4242424242424242');
  await page.fill('[name="cardExpiry"]', '12/34');
  await page.fill('[name="cardCvc"]', '123');
  
  // Submit payment
  await page.click('button[type="submit"]');
  
  // Should redirect back to membership page
  await expect(page).toHaveURL('/membership?success=true');
  
  // Should show success message
  await expect(page.locator('text=Current Plan')).toBeVisible();
});
```

## 🚀 Deployment Checklist

- [ ] Set up Stripe account and get API keys
- [ ] Create products and prices in Stripe dashboard
- [ ] Configure webhook endpoint in Stripe
- [ ] Set environment variables in production
- [ ] Test payment flow in Stripe test mode
- [ ] Set up database tables
- [ ] Configure authentication
- [ ] Add analytics tracking
- [ ] Test responsive design on all devices
- [ ] Set up error monitoring (Sentry)
- [ ] Configure email notifications
- [ ] Test webhook handling
- [ ] Set up subscription management
- [ ] Add terms of service and privacy policy links
- [ ] Test cancellation flow
- [ ] Set up customer support integration

## 📧 Email Notifications

```typescript
// lib/email.ts
import { sendEmail } from './email-service';

export async function sendSubscriptionConfirmation(
  email: string,
  planName: string
) {
  await sendEmail({
    to: email,
    subject: `Welcome to ${planName}!`,
    template: 'subscription-confirmation',
    data: {
      planName,
      features: getPlanFeatures(planName),
      dashboardUrl: `${process.env.NEXT_PUBLIC_URL}/dashboard`,
    },
  });
}

export async function sendCancellationConfirmation(
  email: string,
  endDate: Date
) {
  await sendEmail({
    to: email,
    subject: 'Subscription Cancelled',
    template: 'subscription-cancelled',
    data: {
      endDate: endDate.toLocaleDateString(),
      reactivateUrl: `${process.env.NEXT_PUBLIC_URL}/membership`,
    },
  });
}
```

## 🔄 Subscription State Management

```typescript
// hooks/useSubscription.ts
import { create } from 'zustand';

interface SubscriptionState {
  subscription: Subscription | null;
  loading: boolean;
  error: string | null;
  fetchSubscription: () => Promise<void>;
  updateSubscription: (planId: string) => Promise<void>;
  cancelSubscription: () => Promise<void>;
}

export const useSubscription = create<SubscriptionState>((set) => ({
  subscription: null,
  loading: false,
  error: null,

  fetchSubscription: async () => {
    set({ loading: true });
    try {
      const response = await fetch('/api/subscriptions');
      const data = await response.json();
      set({ subscription: data.subscription, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch subscription', loading: false });
    }
  },

  updateSubscription: async (planId: string) => {
    set({ loading: true });
    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        body: JSON.stringify({ planId }),
      });
      const data = await response.json();
      set({ subscription: data.subscription, loading: false });
    } catch (error) {
      set({ error: 'Failed to update subscription', loading: false });
    }
  },

  cancelSubscription: async () => {
    set({ loading: true });
    try {
      await fetch('/api/subscriptions', { method: 'DELETE' });
      set({ subscription: null, loading: false });
    } catch (error) {
      set({ error: 'Failed to cancel subscription', loading: false });
    }
  },
}));
```

## 📱 Mobile Optimization

The page is already responsive, but for optimal mobile experience:

1. **Touch Targets**: All buttons are 44x44px minimum
2. **Viewport**: Meta viewport tag is set in layout
3. **Performance**: Lazy load images and components
4. **Gestures**: Swipe between pricing tiers on mobile

```typescript
// Optional: Add swipe gestures for mobile
import { useSwipeable } from 'react-swipeable';

const handlers = useSwipeable({
  onSwipedLeft: () => setActiveTier(next),
  onSwipedRight: () => setActiveTier(prev),
});
```

## 🎯 Next Steps

1. **Implement payment gateway** (Stripe recommended)
2. **Set up webhook handlers** for subscription events
3. **Add authentication** to protect the page
4. **Connect to backend API** for real subscription data
5. **Add analytics tracking** for conversion optimization
6. **Set up email notifications** for subscription events
7. **Test thoroughly** in staging environment
8. **Deploy to production** with monitoring

## 📚 Additional Resources

- [Stripe Subscriptions Guide](https://stripe.com/docs/billing/subscriptions/overview)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
