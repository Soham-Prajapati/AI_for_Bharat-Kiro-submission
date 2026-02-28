# Membership Feature - Quick Start Guide

## 🚀 Quick Start (5 minutes)

### 1. Import the Hook

```tsx
import { useSubscription } from '@/hooks';
```

### 2. Use in Your Component

```tsx
function MyComponent() {
  const {
    subscription,      // Current subscription data
    plans,            // Available plans
    loading,          // Loading state
    error,            // Error message
    isSubscribed,     // Boolean: has active subscription
    currentTier,      // Current tier: 'free' | 'basic' | 'pro' | 'enterprise'
    subscribe,        // Function to subscribe
    cancelSubscription, // Function to cancel
    upgradeSubscription, // Function to upgrade
  } = useSubscription();

  // Your component logic here
}
```

### 3. Common Operations

#### Subscribe to a Plan
```tsx
const handleSubscribe = async () => {
  const success = await subscribe('pro', 'credit_card');
  if (success) {
    alert('Subscribed!');
  }
};
```

#### Upgrade Subscription
```tsx
const handleUpgrade = async () => {
  const success = await upgradeSubscription('enterprise');
  if (success) {
    alert('Upgraded!');
  }
};
```

#### Cancel Subscription
```tsx
const handleCancel = async () => {
  const success = await cancelSubscription();
  if (success) {
    alert('Cancelled!');
  }
};
```

## 📋 Complete Example

```tsx
import React from 'react';
import { useSubscription } from '@/hooks';

export function SubscriptionPage() {
  const {
    subscription,
    plans,
    loading,
    error,
    isSubscribed,
    currentTier,
    subscribe,
    cancelSubscription,
  } = useSubscription();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Current Plan: {currentTier}</h1>
      
      {isSubscribed ? (
        <button onClick={cancelSubscription}>
          Cancel Subscription
        </button>
      ) : (
        <div>
          {plans.map(plan => (
            <button 
              key={plan.tierId}
              onClick={() => subscribe(plan.tierId)}
            >
              Subscribe to {plan.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

## 🎯 API Methods (Direct Usage)

If you need to use the API directly without the hook:

```tsx
import apiClient from '@/services/api';

// Get subscription status
const status = await apiClient.membership.getSubscriptionStatus();

// Subscribe
const result = await apiClient.membership.subscribe({
  tierId: 'pro',
  paymentMethod: 'credit_card'
});

// Cancel
const cancelResult = await apiClient.membership.cancelSubscription();

// Upgrade
const upgradeResult = await apiClient.membership.upgradeSubscription({
  newTierId: 'enterprise'
});
```

## 📦 TypeScript Types

```typescript
import {
  SubscriptionTier,
  SubscriptionStatus,
  Subscription,
  SubscriptionPlan,
} from '@/types/api';

// Tier options
type SubscriptionTier = 'free' | 'basic' | 'pro' | 'enterprise';

// Status options
type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'pending';
```

## ⚡ Hook Return Values

| Property | Type | Description |
|----------|------|-------------|
| `subscription` | `Subscription \| null` | Current subscription |
| `plans` | `SubscriptionPlan[]` | Available plans |
| `loading` | `boolean` | Loading state |
| `error` | `string \| null` | Error message |
| `isSubscribed` | `boolean` | Has active subscription |
| `currentTier` | `SubscriptionTier` | Current tier |
| `subscribe()` | `(tier, payment?) => Promise<boolean>` | Subscribe function |
| `cancelSubscription()` | `() => Promise<boolean>` | Cancel function |
| `upgradeSubscription()` | `(tier) => Promise<boolean>` | Upgrade function |
| `refreshStatus()` | `() => Promise<void>` | Refresh data |
| `clearError()` | `() => void` | Clear error |

## 🎨 UI Patterns

### Loading State
```tsx
{loading && <Spinner />}
```

### Error Display
```tsx
{error && (
  <div className="error">
    {error}
    <button onClick={clearError}>×</button>
  </div>
)}
```

### Conditional Rendering
```tsx
{isSubscribed ? (
  <ActiveSubscriptionView />
) : (
  <SubscribeCTA />
)}
```

### Plan Comparison
```tsx
{plans.map(plan => (
  <PlanCard
    key={plan.tierId}
    plan={plan}
    isCurrent={plan.tierId === currentTier}
    onSelect={() => subscribe(plan.tierId)}
  />
))}
```

## 🔥 Pro Tips

1. **Always check loading state** before showing UI
2. **Use isSubscribed** for conditional rendering
3. **Combine with toast notifications** for better UX
4. **Confirm before cancelling** subscriptions
5. **Handle errors gracefully** with user-friendly messages

## 🐛 Troubleshooting

**Hook returns null subscription?**
- User might not be authenticated
- Check API endpoint is accessible

**Subscribe returns false?**
- Check the `error` state for details
- Verify payment method is valid

**Loading never resolves?**
- Check network connectivity
- Verify backend is running

## 📚 More Information

- Full documentation: `MEMBERSHIP_INTEGRATION.md`
- Example component: `components/SubscriptionManager.example.tsx`
- API types: `types/api.ts`
- API client: `services/api.ts`

---

**Ready to use!** Import the hook and start building your subscription UI.
