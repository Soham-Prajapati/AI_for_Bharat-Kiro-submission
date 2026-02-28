# AutomationBuilder Integration Guide

## Quick Start

This guide shows you how to integrate the AutomationBuilder architecture into your components.

## 1. Basic Usage

### Import the Hook

```typescript
import { useAutomation } from '@/hooks/useAutomation';
import { useToast } from '@/context/ToastContext';
```

### Use in Component

```typescript
function AutomationPage() {
  const userId = 'user_123'; // Get from auth context
  const { showToast } = useToast();
  
  const {
    automations,
    loading,
    error,
    createAutomation,
    deleteAutomation,
    toggleAutomation,
  } = useAutomation(userId);

  const handleCreate = async () => {
    try {
      const automation = await createAutomation({
        userId,
        name: 'My Automation',
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
            caption: 'Hello World!',
          },
        }],
        enabled: true,
      });
      
      showToast('success', 'Automation created!');
    } catch (err) {
      showToast('error', 'Failed to create automation');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <button onClick={handleCreate}>Create Automation</button>
      {automations.map((auto) => (
        <div key={auto.automationId}>
          <h3>{auto.name}</h3>
          <button onClick={() => toggleAutomation(auto.automationId, !auto.enabled)}>
            {auto.enabled ? 'Disable' : 'Enable'}
          </button>
          <button onClick={() => deleteAutomation(auto.automationId)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
```

## 2. Form with Validation

```typescript
import { useState } from 'react';
import { useAutomation } from '@/hooks/useAutomation';
import { AutomationValidator } from '@/services/automation.service';
import { Automation } from '@/types/automation';

function AutomationForm() {
  const { createAutomation, validateAutomation } = useAutomation('user_123');
  const [formData, setFormData] = useState<Partial<Automation>>({
    name: '',
    trigger: {
      type: 'schedule',
      cron: '0 9 * * *',
      enabled: true,
    },
    actions: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const validation = validateAutomation(formData);
    if (!validation.valid) {
      console.error('Validation errors:', validation.errors);
      return;
    }

    // Create
    try {
      await createAutomation(formData as any);
      alert('Automation created!');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Automation name"
      />
      {/* Add more fields */}
      <button type="submit">Create</button>
    </form>
  );
}
```

## 3. Testing Automation

```typescript
function AutomationTester({ automationId }: { automationId: string }) {
  const { testAutomation, testResults } = useAutomation();
  const [testing, setTesting] = useState(false);

  const handleTest = async () => {
    setTesting(true);
    try {
      const results = await testAutomation(automationId, true);
      console.log('Test results:', results);
    } catch (err) {
      console.error('Test failed:', err);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div>
      <button onClick={handleTest} disabled={testing}>
        {testing ? 'Testing...' : 'Test Automation'}
      </button>
      
      {testResults && (
        <div>
          <h3>Test Results</h3>
          <p>Success: {testResults.success ? 'Yes' : 'No'}</p>
          <p>Duration: {testResults.duration}ms</p>
          {testResults.results.map((result, i) => (
            <div key={i}>
              <p>Action: {result.actionType}</p>
              <p>Status: {result.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## 4. Using Templates

```typescript
function TemplateSelector() {
  const { templates, createFromTemplate, fetchTemplates } = useAutomation('user_123');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleSelectTemplate = async (templateId: string) => {
    try {
      const automation = await createFromTemplate(templateId, 'user_123');
      console.log('Created from template:', automation);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Templates</h2>
      {templates.map((template) => (
        <div key={template.id}>
          <h3>{template.name}</h3>
          <p>{template.description}</p>
          <button onClick={() => handleSelectTemplate(template.id)}>
            Use Template
          </button>
        </div>
      ))}
    </div>
  );
}
```

## 5. Cron Expression Builder

```typescript
import { CRON_PRESETS, describeCronExpression } from '@/types/automation';
import { isValidCronExpression } from '@/utils/automation.utils';

function CronBuilder({ value, onChange }: { value: string; onChange: (cron: string) => void }) {
  const [customCron, setCustomCron] = useState(value);
  const [isValid, setIsValid] = useState(true);

  const handlePresetSelect = (cron: string) => {
    onChange(cron);
    setCustomCron(cron);
  };

  const handleCustomChange = (cron: string) => {
    setCustomCron(cron);
    const valid = isValidCronExpression(cron);
    setIsValid(valid);
    if (valid) {
      onChange(cron);
    }
  };

  return (
    <div>
      <h3>Schedule</h3>
      
      {/* Presets */}
      <div>
        <h4>Common Schedules</h4>
        {CRON_PRESETS.map((preset) => (
          <button
            key={preset.expression}
            onClick={() => handlePresetSelect(preset.expression)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Custom */}
      <div>
        <h4>Custom Cron Expression</h4>
        <input
          type="text"
          value={customCron}
          onChange={(e) => handleCustomChange(e.target.value)}
          placeholder="0 9 * * *"
        />
        {!isValid && <p style={{ color: 'red' }}>Invalid cron expression</p>}
        {isValid && <p>{describeCronExpression(customCron)}</p>}
      </div>
    </div>
  );
}
```

## 6. Action Builder

```typescript
import { getAvailableActions, getActionConfig } from '@/utils/automation.utils';
import { AutomationAction, ActionType } from '@/types/automation';

function ActionBuilder({ onAdd }: { onAdd: (action: AutomationAction) => void }) {
  const [selectedType, setSelectedType] = useState<ActionType>('post');
  const [actionData, setActionData] = useState<any>({});

  const availableActions = getAvailableActions();
  const config = getActionConfig(selectedType);

  const handleAdd = () => {
    const action: AutomationAction = {
      id: `action_${Date.now()}`,
      type: selectedType,
      enabled: true,
      order: 1,
      ...actionData,
    } as any;

    onAdd(action);
  };

  return (
    <div>
      <h3>Add Action</h3>
      
      {/* Action Type Selector */}
      <select
        value={selectedType}
        onChange={(e) => setSelectedType(e.target.value as ActionType)}
      >
        {availableActions.map((action) => (
          <option key={action.type} value={action.type}>
            {action.icon} {action.label}
          </option>
        ))}
      </select>

      {/* Dynamic Fields */}
      <div>
        <h4>{config.label}</h4>
        <p>{config.description}</p>
        
        {config.configFields.map((field) => (
          <div key={field.key}>
            <label>{field.label}</label>
            {field.type === 'text' && (
              <input
                type="text"
                placeholder={field.placeholder}
                onChange={(e) =>
                  setActionData({ ...actionData, [field.key]: e.target.value })
                }
              />
            )}
            {field.type === 'select' && (
              <select
                onChange={(e) =>
                  setActionData({ ...actionData, [field.key]: e.target.value })
                }
              >
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
            {field.helpText && <small>{field.helpText}</small>}
          </div>
        ))}
      </div>

      <button onClick={handleAdd}>Add Action</button>
    </div>
  );
}
```

## 7. Execution History

```typescript
import { useAutomationHistory } from '@/hooks/useAutomation';
import { formatDate, formatDuration } from '@/utils/automation.utils';

function ExecutionHistory({ automationId }: { automationId: string }) {
  const { executions, loading, fetchHistory } = useAutomationHistory();

  useEffect(() => {
    fetchHistory(automationId);
  }, [automationId]);

  if (loading) return <div>Loading history...</div>;

  return (
    <div>
      <h3>Execution History</h3>
      {executions.map((execution) => (
        <div key={execution.executionId}>
          <p>Status: {execution.status}</p>
          <p>Started: {formatDate(execution.startedAt)}</p>
          {execution.duration && <p>Duration: {formatDuration(execution.duration)}</p>}
          
          <h4>Results</h4>
          {execution.results.map((result, i) => (
            <div key={i}>
              <p>Action: {result.actionType}</p>
              <p>Status: {result.status}</p>
              {result.error && <p style={{ color: 'red' }}>Error: {result.error}</p>}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
```

## 8. Complete Example

```typescript
import { useState } from 'react';
import { useAutomation } from '@/hooks/useAutomation';
import { useToast } from '@/context/ToastContext';
import {
  Automation,
  AutomationTrigger,
  AutomationAction,
} from '@/types/automation';

function CompleteAutomationBuilder() {
  const userId = 'user_123';
  const { createAutomation, validateAutomation } = useAutomation(userId);
  const { showToast } = useToast();

  const [step, setStep] = useState<'trigger' | 'actions' | 'review'>('trigger');
  const [automation, setAutomation] = useState<Partial<Automation>>({
    name: '',
    description: '',
    trigger: undefined,
    actions: [],
    enabled: true,
  });

  const handleNext = () => {
    if (step === 'trigger') setStep('actions');
    else if (step === 'actions') setStep('review');
  };

  const handleBack = () => {
    if (step === 'actions') setStep('trigger');
    else if (step === 'review') setStep('actions');
  };

  const handleSubmit = async () => {
    const validation = validateAutomation(automation);
    
    if (!validation.valid) {
      showToast('error', 'Please fix validation errors');
      return;
    }

    try {
      await createAutomation({
        userId,
        ...automation,
      } as any);
      
      showToast('success', 'Automation created successfully!');
    } catch (err) {
      showToast('error', 'Failed to create automation');
    }
  };

  return (
    <div>
      <h1>Create Automation</h1>
      
      {/* Step Indicator */}
      <div>
        <span className={step === 'trigger' ? 'active' : ''}>1. Trigger</span>
        <span className={step === 'actions' ? 'active' : ''}>2. Actions</span>
        <span className={step === 'review' ? 'active' : ''}>3. Review</span>
      </div>

      {/* Step Content */}
      {step === 'trigger' && (
        <div>
          <h2>Configure Trigger</h2>
          {/* Trigger configuration UI */}
        </div>
      )}

      {step === 'actions' && (
        <div>
          <h2>Add Actions</h2>
          {/* Actions configuration UI */}
        </div>
      )}

      {step === 'review' && (
        <div>
          <h2>Review & Create</h2>
          <pre>{JSON.stringify(automation, null, 2)}</pre>
        </div>
      )}

      {/* Navigation */}
      <div>
        {step !== 'trigger' && <button onClick={handleBack}>Back</button>}
        {step !== 'review' && <button onClick={handleNext}>Next</button>}
        {step === 'review' && <button onClick={handleSubmit}>Create</button>}
      </div>
    </div>
  );
}
```

## API Reference

### useAutomation Hook

```typescript
const {
  // State
  automations: Automation[];
  loading: boolean;
  error: string | null;
  selectedAutomation: Automation | null;
  testResults: TestAutomationResponse | null;
  validationResult: ValidationResult | null;
  templates: AutomationTemplate[];

  // Actions
  fetchAutomations: (params: ListAutomationsRequest) => Promise<void>;
  createAutomation: (data: CreateAutomationRequest) => Promise<Automation>;
  updateAutomation: (id: string, data: UpdateAutomationRequest) => Promise<Automation>;
  deleteAutomation: (id: string) => Promise<void>;
  toggleAutomation: (id: string, enabled: boolean) => Promise<void>;
  testAutomation: (id: string, dryRun?: boolean) => Promise<TestAutomationResponse>;
  triggerAutomation: (id: string) => Promise<string>;
  duplicateAutomation: (id: string, newName?: string) => Promise<Automation>;
  validateAutomation: (automation: Partial<Automation>) => ValidationResult;
  selectAutomation: (automation: Automation | null) => void;
  fetchTemplates: () => Promise<void>;
  createFromTemplate: (templateId: string, userId: string) => Promise<Automation>;
  clearError: () => void;
  refresh: () => Promise<void>;
} = useAutomation(userId);
```

### AutomationService

```typescript
import automationService from '@/services/automation.service';

// All methods return Promises
await automationService.create(data);
await automationService.list(params);
await automationService.get(id);
await automationService.update(id, data);
await automationService.delete(id);
await automationService.toggle({ automationId, enabled });
await automationService.test({ automationId, dryRun });
await automationService.trigger(id);
await automationService.getHistory({ automationId });
await automationService.getTemplates();
await automationService.validate(automation);
```

### Utility Functions

```typescript
import {
  describeCronExpression,
  isValidCronExpression,
  getNextExecutionTime,
  getActionConfig,
  getAvailableActions,
  getEventConfig,
  getPlatformConfig,
  formatDate,
  formatDuration,
  generateId,
} from '@/utils/automation.utils';
```

## Best Practices

1. **Always validate before submitting**
   ```typescript
   const validation = validateAutomation(data);
   if (!validation.valid) return;
   ```

2. **Handle errors gracefully**
   ```typescript
   try {
     await createAutomation(data);
   } catch (err) {
     showToast('error', err.message);
   }
   ```

3. **Show loading states**
   ```typescript
   {loading && <Spinner />}
   {!loading && <Content />}
   ```

4. **Use TypeScript types**
   ```typescript
   const automation: Automation = { ... };
   ```

5. **Leverage existing components**
   ```typescript
   import { FileUploader } from '@/components/FileUploader';
   import { PlatformCard } from '@/components/PlatformCard';
   ```

## Next Steps

1. Implement the AutomationBuilder UI component
2. Add backend endpoints for missing functionality
3. Integrate with existing authentication system
4. Add real-time updates via WebSocket
5. Implement automation analytics

## Support

- See `AUTOMATION_ARCHITECTURE.md` for detailed architecture
- Check `types/automation.ts` for all type definitions
- Review `services/automation.service.ts` for API methods
- Look at `hooks/useAutomation.ts` for hook implementation
