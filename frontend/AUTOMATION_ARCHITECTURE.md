# AutomationBuilder Component Architecture

## Overview

This document outlines the complete architecture for the AutomationBuilder component integration, including TypeScript interfaces, API client methods, state management, and error handling strategies.

## Table of Contents

1. [Backend API Analysis](#backend-api-analysis)
2. [TypeScript Interfaces](#typescript-interfaces)
3. [API Integration](#api-integration)
4. [State Management](#state-management)
5. [Error Handling](#error-handling)
6. [Validation Strategy](#validation-strategy)
7. [Component Integration](#component-integration)
8. [Best Practices](#best-practices)

---

## Backend API Analysis

### Available Endpoints

Based on `src/routes/automation.route.ts`, the following endpoints are available:

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| POST | `/api/automation/create` | Create new automation | ✅ Implemented |
| GET | `/api/automation/list` | List user automations | ✅ Implemented |
| DELETE | `/api/automation/:id` | Delete automation | ✅ Implemented |
| PUT | `/api/automation/:id` | Update automation | 🔄 To be implemented |
| PATCH | `/api/automation/:id/toggle` | Toggle enabled state | 🔄 To be implemented |
| POST | `/api/automation/:id/test` | Test automation | 🔄 To be implemented |
| POST | `/api/automation/:id/trigger` | Manually trigger | 🔄 To be implemented |
| GET | `/api/automation/:id/history` | Get execution history | 🔄 To be implemented |
| GET | `/api/automation/templates` | Get templates | 🔄 To be implemented |

### Current Backend Data Structure

```typescript
{
  automationId: string;
  userId: string;
  name: string;
  trigger: {
    type: 'schedule' | 'event' | 'manual';
    cron?: string;
    event?: string;
  };
  actions: Array<{
    type: string;
    platform?: string;
    contentType?: string;
    [key: string]: any;
  }>;
  status: 'active' | 'paused' | 'deleted';
  createdAt: string;
}
```

---

## TypeScript Interfaces

### Core Types

All automation types are defined in `frontend/types/automation.ts`:

#### 1. Automation Entity

```typescript
interface Automation {
  automationId: string;
  userId: string;
  name: string;
  description?: string;
  trigger: AutomationTrigger;
  conditions?: AutomationCondition[];
  actions: AutomationAction[];
  enabled: boolean;
  status: AutomationStatus;
  createdAt: string;
  updatedAt?: string;
  lastRunAt?: string;
  nextRunAt?: string;
  runCount?: number;
  errorCount?: number;
}
```

#### 2. Trigger Types

```typescript
type TriggerType = 'schedule' | 'event' | 'manual' | 'webhook' | 'content_ready';

// Schedule Trigger (Cron-based)
interface ScheduleTrigger {
  type: 'schedule';
  cron: string;
  timezone?: string;
  description?: string;
  enabled: boolean;
}

// Event Trigger (System events)
interface EventTrigger {
  type: 'event';
  event: EventType;
  filters?: Record<string, any>;
  enabled: boolean;
}

// Manual Trigger (User-initiated)
interface ManualTrigger {
  type: 'manual';
  enabled: boolean;
}

// Webhook Trigger (External systems)
interface WebhookTrigger {
  type: 'webhook';
  webhookUrl: string;
  secret?: string;
  method?: 'POST' | 'GET';
  enabled: boolean;
}

// Content Ready Trigger (Content generation complete)
interface ContentReadyTrigger {
  type: 'content_ready';
  contentType?: 'video' | 'image' | 'text' | 'audio';
  minQualityScore?: number;
  enabled: boolean;
}
```

#### 3. Action Types

```typescript
type ActionType =
  | 'post'           // Post to social platform
  | 'generate'       // Generate content
  | 'notify'         // Send notification
  | 'webhook'        // Call external webhook
  | 'email'          // Send email
  | 'analyze'        // Analyze content
  | 'multiply'       // Create content variations
  | 'adapt_cultural' // Cultural adaptation
  | 'train_voice'    // Train voice model
  | 'update_analytics'; // Update analytics

// Example: Post Action
interface PostAction {
  id: string;
  type: 'post';
  enabled: boolean;
  order: number;
  platform: Platform;
  connectionId?: string;
  content: {
    title?: string;
    description?: string;
    caption?: string;
    hashtags?: string[];
    mediaUrl?: string;
  };
  scheduledTime?: string;
  retryOnFailure?: boolean;
  maxRetries?: number;
}
```

#### 4. Condition Types

```typescript
interface AutomationCondition {
  id: string;
  field: string;
  operator: ConditionOperator;
  value: any;
  logic?: 'AND' | 'OR';
}

type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'less_than'
  | 'contains'
  | 'not_contains'
  | 'in'
  | 'not_in'
  | 'exists'
  | 'not_exists';
```

---

## API Integration

### Service Layer

The automation service is implemented in `frontend/services/automation.service.ts`:

```typescript
import automationService from '@/services/automation.service';

// Create automation
const automation = await automationService.create({
  userId: 'user_123',
  name: 'Daily Instagram Post',
  trigger: {
    type: 'schedule',
    cron: '0 9 * * *',
    enabled: true,
  },
  actions: [{
    id: 'action_1',
    type: 'post',
    enabled: true,
    order: 1,
    platform: 'instagram',
    content: {
      caption: 'Good morning!',
      hashtags: ['#morning', '#motivation'],
    },
  }],
  enabled: true,
});

// List automations
const response = await automationService.list({
  userId: 'user_123',
  status: 'active',
  limit: 20,
  offset: 0,
});

// Update automation
const updated = await automationService.update('auto_123', {
  name: 'Updated Name',
  enabled: false,
});

// Delete automation
await automationService.delete('auto_123');

// Test automation (dry run)
const testResults = await automationService.test({
  automationId: 'auto_123',
  dryRun: true,
});

// Trigger automation manually
const { executionId } = await automationService.trigger('auto_123');

// Get execution history
const history = await automationService.getHistory({
  automationId: 'auto_123',
  limit: 10,
});
```

### API Client Methods

All methods are integrated into the existing `frontend/services/api.ts` structure:

```typescript
// In api.ts, add to the ApiClient class:
automation = {
  create: (data: CreateAutomationRequest) =>
    this.request<Automation>('/api/automation/create', {
      method: 'POST',
      body: data,
    }),

  list: (userId: string, params?: ListAutomationsRequest) =>
    this.request<ListAutomationsResponse>(
      `/api/automation/list?userId=${userId}&...`,
      { method: 'GET' }
    ),

  get: (automationId: string) =>
    this.request<Automation>(`/api/automation/${automationId}`, {
      method: 'GET',
    }),

  update: (automationId: string, data: UpdateAutomationRequest) =>
    this.request<Automation>(`/api/automation/${automationId}`, {
      method: 'PUT',
      body: data,
    }),

  delete: (automationId: string) =>
    this.request<DeleteAutomationResponse>(`/api/automation/${automationId}`, {
      method: 'DELETE',
    }),

  toggle: (automationId: string, enabled: boolean) =>
    this.request<ToggleAutomationResponse>(
      `/api/automation/${automationId}/toggle`,
      { method: 'PATCH', body: { enabled } }
    ),

  test: (automationId: string, dryRun?: boolean) =>
    this.request<TestAutomationResponse>(
      `/api/automation/${automationId}/test`,
      { method: 'POST', body: { dryRun }, timeout: 60000 }
    ),

  trigger: (automationId: string) =>
    this.request<{ executionId: string }>(
      `/api/automation/${automationId}/trigger`,
      { method: 'POST' }
    ),

  getHistory: (automationId: string, params?: GetAutomationHistoryRequest) =>
    this.request<GetAutomationHistoryResponse>(
      `/api/automation/${automationId}/history?...`,
      { method: 'GET' }
    ),

  getTemplates: () =>
    this.request<AutomationTemplate[]>('/api/automation/templates', {
      method: 'GET',
    }),

  validate: (automation: Partial<Automation>) =>
    this.request<ValidationResult>('/api/automation/validate', {
      method: 'POST',
      body: automation,
    }),
};
```

---

## State Management

### Approach: Local State with Custom Hook

We use a **custom React hook** (`useAutomation`) for state management instead of global context. This approach is chosen because:

1. **Scoped State**: Automation data is typically used in specific pages/components
2. **Performance**: Avoids unnecessary re-renders across the app
3. **Simplicity**: No need for complex context providers
4. **Flexibility**: Easy to extend with additional features

### Hook Usage

```typescript
import { useAutomation } from '@/hooks/useAutomation';

function AutomationBuilder() {
  const {
    // State
    automations,
    loading,
    error,
    selectedAutomation,
    testResults,
    validationResult,
    templates,

    // Actions
    createAutomation,
    updateAutomation,
    deleteAutomation,
    toggleAutomation,
    testAutomation,
    triggerAutomation,
    validateAutomation,
    selectAutomation,
    fetchTemplates,
    createFromTemplate,
    clearError,
    refresh,
  } = useAutomation(userId);

  // Component logic...
}
```

### State Structure

```typescript
interface AutomationListState {
  automations: Automation[];
  loading: boolean;
  error: string | null;
  filters: {
    status?: AutomationStatus;
    search?: string;
  };
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
  selectedAutomation?: Automation;
}
```

### When to Use Context vs Hook

| Use Case | Recommendation |
|----------|----------------|
| Single page automation builder | ✅ Custom Hook |
| Automation list view | ✅ Custom Hook |
| Global automation status indicator | ⚠️ Consider Context |
| Multiple components need same data | ⚠️ Consider Context |
| Real-time automation updates | ⚠️ Consider Context + WebSocket |

---

## Error Handling

### Error Types

All errors extend from the base `ApiError` class:

```typescript
class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code: string,
    public details?: any
  ) {
    super(message);
  }
}

// Specific error types
class ValidationError extends ApiError { }
class AuthenticationError extends ApiError { }
class AuthorizationError extends ApiError { }
class NotFoundError extends ApiError { }
class RateLimitError extends ApiError { }
class NetworkError extends ApiError { }
class TimeoutError extends ApiError { }
```

### Error Handling Strategy

#### 1. Service Layer

```typescript
try {
  const automation = await automationService.create(data);
  return automation;
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation errors
    showToast('error', error.message);
  } else if (error instanceof AuthenticationError) {
    // Redirect to login
    router.push('/login');
  } else if (error instanceof NetworkError) {
    // Show retry option
    showToast('error', 'Network error. Please try again.');
  } else {
    // Generic error
    showToast('error', 'An unexpected error occurred');
  }
  throw error;
}
```

#### 2. Component Layer

```typescript
const handleCreate = async () => {
  try {
    setLoading(true);
    const automation = await createAutomation(formData);
    showToast('success', 'Automation created successfully');
    router.push(`/automations/${automation.automationId}`);
  } catch (error) {
    // Error already handled by service layer
    // Just update UI state
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
```

#### 3. Toast Integration

```typescript
import { useToast } from '@/context/ToastContext';

const { showToast } = useToast();

// Success
showToast('success', 'Automation created successfully');

// Error
showToast('error', 'Failed to create automation');

// Warning
showToast('warning', 'Some actions may not execute');

// Info
showToast('info', 'Automation is being tested');
```

### Retry Logic

The API client includes automatic retry logic for:

- Network errors
- Timeout errors
- 5xx server errors
- Rate limit errors (with exponential backoff)

```typescript
// Configured in api.ts
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second base delay

// Exponential backoff: 1s, 2s, 4s
```

---

## Validation Strategy

### Client-Side Validation

The `AutomationValidator` class provides comprehensive validation:

```typescript
import { AutomationValidator } from '@/services/automation.service';

// Validate complete automation
const result = AutomationValidator.validateAutomation(automation);

if (!result.valid) {
  console.error('Validation errors:', result.errors);
  // Display errors to user
}

if (result.warnings.length > 0) {
  console.warn('Validation warnings:', result.warnings);
  // Display warnings to user
}
```

### Validation Rules

#### Trigger Validation

- **Schedule**: Cron expression must be valid (5 parts)
- **Webhook**: URL must be valid HTTPS endpoint
- **Event**: Event type must be supported
- **Content Ready**: Quality score must be 0-100

#### Action Validation

- **Post**: Platform and content required
- **Webhook**: Valid URL required
- **Email**: At least one recipient and subject required
- **Generate**: At least one platform required

#### Condition Validation

- **Field**: Must not be empty
- **Operator**: Must be valid operator
- **Value**: Warning if empty

### Real-Time Validation

```typescript
const [formData, setFormData] = useState<Partial<Automation>>({});
const [errors, setErrors] = useState<ValidationError[]>([]);

useEffect(() => {
  const result = AutomationValidator.validateAutomation(formData);
  setErrors(result.errors);
}, [formData]);
```

---

## Component Integration

### AutomationBuilder Component Structure

```typescript
import { useAutomation } from '@/hooks/useAutomation';
import { AutomationValidator } from '@/services/automation.service';

export function AutomationBuilder() {
  const { createAutomation, validateAutomation } = useAutomation(userId);
  const [step, setStep] = useState<'trigger' | 'conditions' | 'actions' | 'review'>('trigger');
  const [formData, setFormData] = useState<Partial<Automation>>({});

  const handleSubmit = async () => {
    const validation = validateAutomation(formData);
    
    if (!validation.valid) {
      showToast('error', 'Please fix validation errors');
      return;
    }

    try {
      const automation = await createAutomation(formData as CreateAutomationRequest);
      showToast('success', 'Automation created successfully');
      router.push('/automations');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <div>
      {/* Step indicator */}
      {/* Form fields based on current step */}
      {/* Validation errors display */}
      {/* Submit button */}
    </div>
  );
}
```

### Integration with Existing Components

The AutomationBuilder can integrate with existing components:

```typescript
// Use existing FileUploader for media
import { FileUploader } from '@/components/FileUploader';

// Use existing PlatformCard for platform selection
import { PlatformCard } from '@/components/PlatformCard';

// Use existing Toast system
import { useToast } from '@/context/ToastContext';

// Use existing ModeSelector for creator mode
import { ModeSelector } from '@/components/ModeSelector';
```

---

## Best Practices

### 1. Type Safety

✅ **DO**: Use strict TypeScript types
```typescript
const automation: Automation = await createAutomation(data);
```

❌ **DON'T**: Use `any` types
```typescript
const automation: any = await createAutomation(data);
```

### 2. Error Handling

✅ **DO**: Handle specific error types
```typescript
catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation
  } else if (error instanceof NetworkError) {
    // Handle network
  }
}
```

❌ **DON'T**: Catch and ignore errors
```typescript
catch (error) {
  console.log(error);
}
```

### 3. Loading States

✅ **DO**: Show loading indicators
```typescript
{loading && <Spinner />}
{!loading && <AutomationList />}
```

❌ **DON'T**: Leave users waiting without feedback
```typescript
<AutomationList /> {/* No loading state */}
```

### 4. Validation

✅ **DO**: Validate before submission
```typescript
const validation = validateAutomation(formData);
if (!validation.valid) return;
```

❌ **DON'T**: Submit without validation
```typescript
await createAutomation(formData); // No validation
```

### 5. State Management

✅ **DO**: Use custom hooks for scoped state
```typescript
const { automations, loading } = useAutomation(userId);
```

❌ **DON'T**: Prop drill through multiple levels
```typescript
<Parent automations={automations}>
  <Child automations={automations}>
    <GrandChild automations={automations} />
  </Child>
</Parent>
```

---

## Testing Strategy

### Unit Tests

```typescript
// Test validation
describe('AutomationValidator', () => {
  it('should validate schedule trigger', () => {
    const result = AutomationValidator.validateTrigger({
      type: 'schedule',
      cron: '0 9 * * *',
      enabled: true,
    });
    expect(result.valid).toBe(true);
  });
});
```

### Integration Tests

```typescript
// Test API integration
describe('AutomationService', () => {
  it('should create automation', async () => {
    const automation = await automationService.create({
      userId: 'test_user',
      name: 'Test Automation',
      trigger: { type: 'manual', enabled: true },
      actions: [],
    });
    expect(automation.automationId).toBeDefined();
  });
});
```

### E2E Tests

```typescript
// Test complete workflow
describe('Automation Builder', () => {
  it('should create automation from UI', async () => {
    // Navigate to builder
    // Fill form
    // Submit
    // Verify creation
  });
});
```

---

## Performance Considerations

### 1. Pagination

Always use pagination for large lists:

```typescript
const { automations } = useAutomation(userId);
// Automatically handles pagination with limit/offset
```

### 2. Debouncing

Debounce validation and search:

```typescript
const debouncedValidate = useMemo(
  () => debounce((data) => validateAutomation(data), 300),
  []
);
```

### 3. Memoization

Memoize expensive computations:

```typescript
const sortedAutomations = useMemo(
  () => automations.sort((a, b) => a.name.localeCompare(b.name)),
  [automations]
);
```

### 4. Lazy Loading

Load templates and history on demand:

```typescript
const { fetchTemplates } = useAutomation();

useEffect(() => {
  if (showTemplates) {
    fetchTemplates();
  }
}, [showTemplates]);
```

---

## Security Considerations

### 1. Authentication

All API requests include authentication token:

```typescript
headers['Authorization'] = `Bearer ${this.authToken}`;
```

### 2. Input Sanitization

Validate and sanitize all user inputs:

```typescript
const sanitizedName = name.trim().slice(0, 100);
```

### 3. Webhook Security

Require secrets for webhook triggers:

```typescript
interface WebhookTrigger {
  webhookUrl: string;
  secret?: string; // HMAC signature verification
}
```

### 4. Rate Limiting

Respect rate limits with exponential backoff:

```typescript
if (error instanceof RateLimitError) {
  await sleep(error.retryAfter * 1000);
  // Retry request
}
```

---

## Migration Path

### Phase 1: Core Functionality (Week 1)
- ✅ TypeScript interfaces
- ✅ API service layer
- ✅ Custom hooks
- ✅ Basic validation

### Phase 2: UI Components (Week 2)
- 🔄 AutomationBuilder component
- 🔄 Trigger configuration UI
- 🔄 Action configuration UI
- 🔄 Condition builder UI

### Phase 3: Advanced Features (Week 3)
- 🔄 Template system
- 🔄 Testing functionality
- 🔄 Execution history
- 🔄 Real-time updates

### Phase 4: Polish & Testing (Week 4)
- 🔄 Error handling refinement
- 🔄 Performance optimization
- 🔄 Comprehensive testing
- 🔄 Documentation

---

## Resources

### Files Created

1. `frontend/types/automation.ts` - Complete type definitions
2. `frontend/services/automation.service.ts` - API service layer
3. `frontend/hooks/useAutomation.ts` - React hooks
4. `frontend/AUTOMATION_ARCHITECTURE.md` - This document

### Existing Files to Update

1. `frontend/services/api.ts` - Add automation methods to ApiClient
2. `frontend/types/api.ts` - Import automation types
3. `frontend/components/AutomationBuilder.tsx` - Implement using new architecture

### Related Documentation

- [API Client Guide](./services/API_CLIENT_GUIDE.md)
- [Toast System](./TOAST_SYSTEM.md)
- [State Management](./STATE_MANAGEMENT_SUMMARY.md)
- [Component Overview](./COMPONENT_OVERVIEW.md)

---

## Support

For questions or issues:

1. Check existing components for patterns
2. Review API client documentation
3. Test with mock data first
4. Use TypeScript for type safety
5. Follow error handling best practices

---

**Last Updated**: 2024
**Version**: 1.0.0
**Status**: Ready for Implementation
