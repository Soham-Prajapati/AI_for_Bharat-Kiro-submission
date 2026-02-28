# Membership Feature Integration Guide

## Overview

The membership feature provides a complete subscription management system with API client integration and state management through a custom React hook.

## Features

- ✅ Type-safe API methods for all membership operations
- ✅ Custom React hook with loading and error states
- ✅ Automatic subscription status fetching
- ✅ Support for subscribe, upgrade, and cancel operations
- ✅ Comprehensive error handling with user-friendly messages
- ✅ TypeScript types for all subscription data

## Files Created/Modified

### New Files
- `frontend/hooks/useSubscription.ts` - Custom hook for subscription management

### Modified Files
- `frontend/services/api.ts` - Added membership API methods
- `frontend/types/api.ts` - Added membership TypeScript types
- `frontend/hooks/index.ts` - Exported useSubscription hook

## API Methods

### Available Endpoints

```typescript
apiClient.membership.subscribe(data: SubscribeRequest)
apiClient.membership.cancelSubscription()
apiClient.membership.upgradeSubscription(data: UpgradeSubscriptionRequest)
apiClient.membership.getSubscriptionStatus()
```

### Backend API Mapping

- `POST /api/membership/subscribe` - Subscribe to a plan or upgrade
- `POST /api/membership/cancel` - Cancel current subscription
- `GET /api/membership/status` - Get subscription status and available plans

## TypeScript Types

### Subscription Tiers
```typescript
type SubscriptionTier = 'free' | 'basic' | 'pro' | 'enterprise';
```

### Subscription Status
```typescript
type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'pending';
```

### Main Types
- `Subscription` - Current subscription details
- `SubscriptionPlan` - Plan information with features and limits
- `SubscribeRequest` - Request payload for subscribing
- `SubscribeResponse` - Response from subscribe endpoint
- `CancelSubscriptionResponse` - Response from cancel endpoint
- `UpgradeSubscriptionRequest` - Request payload for upgrading
- `UpgradeSubscriptionResponse` - Response from upgrade endpoint
- `SubscriptionStatusResponse` - Response with status and available plans

## Usage Examples

### Basic Usage

```tsx
import { useSubscription } from '@/hooks';

function SubscriptionPage() {
  const {
    subscription,
    plans,
    loading,
    error,
    isSubscribed,
    currentTier,
    subscribe,
    cancelSubscription,
    upgradeSubscription,
    refreshStatus,
    clearError
  } = useSubscription();

  if (loading) {
    return <div>Loading subscription information...</div>;
  }

  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
        <button onClick={clearError}>Dismiss</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Current Plan: {currentTier}</h1>
      <p>Status: {subscription?.status}</p>
    </div>
  );
}
```

### Subscribe to a Plan

```tsx
async function handleSubscribe(tierId: SubscriptionTier) {
  const success = await subscribe(tierId, 'credit_card');
  
  if (success) {
    console.log('Successfully subscribed!');
  } else {
    console.log('Subscription failed. Check error state.');
  }
}

// Usage
<button onClick={() => handleSubscribe('pro')}>
  Subscribe to Pro
</button>
```

### Upgrade Subscription

```tsx
async function handleUpgrade() {
  const success = await upgradeSubscription('enterprise');
  
  if (success) {
    console.log('Successfully upgraded!');
  }
}

<button onClick={handleUpgrade}>
  Upgrade to Enterprise
</button>
```

### Cancel Subscription

```tsx
async function handleCancel() {
  if (confirm('Are you sure you want to cancel?')) {
    const success = await cancelSubscription();
    
    if (success) {
      console.log('Subscription cancelled');
    }
  }
}

<button onClick={handleCancel}>
  Cancel Subscription
</button>
```

### Display Available Plans

```tsx
function PlansList() {
  const { plans, currentTier, subscribe } = useSubscription();

  return (
    <div>
      {plans.map((plan) => (
        <div key={plan.tierId}>
          <h3>{plan.name}</h3>
          <p>${plan.price}/month</p>
          <ul>
            {plan.features.map((feature, idx) => (
              <li key={idx}>{feature}</li>
            ))}
          </ul>
          {plan.tierId !== currentTier && (
            <button onClick={() => subscribe(plan.tierId)}>
              Select Plan
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Refresh Subscription Status

```tsx
function RefreshButton() {
  const { refreshStatus, loading } = useSubscription();

  return (
    <button onClick={refreshStatus} disabled={loading}>
      {loading ? 'Refreshing...' : 'Refresh Status'}
    </button>
  );
}
```

## Hook API Reference

### State Properties

| Property | Type | Description |
|----------|------|-------------|
| `subscription` | `Subscription \| null` | Current subscription details |
| `plans` | `SubscriptionPlan[]` | Available subscription plans |
| `loading` | `boolean` | Loading state for async operations |
| `error` | `string \| null` | Error message if operation failed |
| `isSubscribed` | `boolean` | Whether user has active subscription |
| `currentTier` | `SubscriptionTier` | Current subscription tier |

### Action Methods

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `subscribe` | `tierId: SubscriptionTier, paymentMethod?: string` | `Promise<boolean>` | Subscribe to a plan |
| `cancelSubscription` | None | `Promise<boolean>` | Cancel current subscription |
| `upgradeSubscription` | `newTierId: SubscriptionTier` | `Promise<boolean>` | Upgrade to higher tier |
| `refreshStatus` | None | `Promise<void>` | Refresh subscription status |
| `clearError` | None | `void` | Clear error state |

## Error Handling

The hook provides comprehensive error handling:

1. **Network Errors**: Caught and displayed with user-friendly messages
2. **API Errors**: Parsed from backend responses
3. **Validation Errors**: Handled by the API client
4. **Authentication Errors**: Automatically handled by API interceptors

### Error Display Pattern

```tsx
function ErrorDisplay() {
  const { error, clearError } = useSubscription();

  if (!error) return null;

  return (
    <div className="error-banner">
      <p>{error}</p>
      <button onClick={clearError}>×</button>
    </div>
  );
}
```

## Loading States

The hook manages loading states automatically:

```tsx
function SubscriptionButton() {
  const { loading, subscribe } = useSubscription();

  return (
    <button 
      onClick={() => subscribe('pro')} 
      disabled={loading}
    >
      {loading ? 'Processing...' : 'Subscribe'}
    </button>
  );
}
```

## Integration with Toast Notifications

Combine with the toast system for better UX:

```tsx
import { useSubscription } from '@/hooks';
import { useToast } from '@/context/ToastContext';

function SubscriptionManager() {
  const { subscribe, cancelSubscription } = useSubscription();
  const { showToast } = useToast();

  async function handleSubscribe(tierId: SubscriptionTier) {
    const success = await subscribe(tierId);
    
    if (success) {
      showToast('Successfully subscribed!', 'success');
    } else {
      showToast('Subscription failed', 'error');
    }
  }

  async function handleCancel() {
    const success = await cancelSubscription();
    
    if (success) {
      showToast('Subscription cancelled', 'info');
    }
  }

  return (
    <div>
      <button onClick={() => handleSubscribe('pro')}>Subscribe</button>
      <button onClick={handleCancel}>Cancel</button>
    </div>
  );
}
```

## Best Practices

1. **Always check loading state** before performing actions
2. **Display errors prominently** to users
3. **Confirm cancellations** before executing
4. **Refresh status** after successful operations
5. **Use derived state** (`isSubscribed`, `currentTier`) for conditional rendering
6. **Clear errors** after user acknowledges them
7. **Combine with toast notifications** for better UX

## Testing

### Manual Testing Checklist

- [ ] Subscribe to a plan
- [ ] Upgrade subscription
- [ ] Cancel subscription
- [ ] View subscription status
- [ ] Handle network errors
- [ ] Handle API errors
- [ ] Loading states display correctly
- [ ] Error messages are user-friendly

### Example Test Cases

```typescript
// Test subscription flow
test('should subscribe to a plan', async () => {
  const { result } = renderHook(() => useSubscription());
  
  await act(async () => {
    const success = await result.current.subscribe('pro');
    expect(success).toBe(true);
  });
  
  expect(result.current.currentTier).toBe('pro');
  expect(result.current.isSubscribed).toBe(true);
});

// Test error handling
test('should handle subscription errors', async () => {
  const { result } = renderHook(() => useSubscription());
  
  // Mock API error
  apiClient.membership.subscribe = jest.fn().mockRejectedValue(
    new Error('Payment failed')
  );
  
  await act(async () => {
    const success = await result.current.subscribe('pro');
    expect(success).toBe(false);
  });
  
  expect(result.current.error).toBeTruthy();
});
```

## Troubleshooting

### Common Issues

**Issue**: Hook returns null subscription
- **Solution**: Ensure user is authenticated and API endpoint is accessible

**Issue**: Subscribe method returns false
- **Solution**: Check error state for details, verify payment method

**Issue**: Loading state never resolves
- **Solution**: Check network connectivity and API endpoint availability

**Issue**: TypeScript errors
- **Solution**: Ensure all types are imported from `@/types/api`

## Next Steps

1. Create UI components for subscription management
2. Add payment integration (Stripe, PayPal, etc.)
3. Implement subscription analytics
4. Add email notifications for subscription events
5. Create admin dashboard for subscription management

## Support

For issues or questions:
- Check the error state for detailed messages
- Review API client logs in development mode
- Verify backend endpoints are running
- Check authentication token is valid
