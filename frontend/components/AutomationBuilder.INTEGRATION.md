# AutomationBuilder Integration Guide

Complete guide for integrating the AutomationBuilder component into your application.

## Quick Start

### 1. Basic Integration

```tsx
// app/automations/page.tsx
'use client'

import AutomationBuilder from '@/components/AutomationBuilder'

export default function AutomationsPage() {
  return <AutomationBuilder />
}
```

### 2. With State Management

```tsx
'use client'

import { useState } from 'react'
import AutomationBuilder, { Automation } from '@/components/AutomationBuilder'

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<Automation[]>([])

  const handleSave = (automation: Automation) => {
    setAutomations(prev => {
      const index = prev.findIndex(a => a.id === automation.id)
      if (index >= 0) {
        const updated = [...prev]
        updated[index] = automation
        return updated
      }
      return [...prev, automation]
    })
  }

  const handleTest = (automation: Automation) => {
    console.log('Testing:', automation)
    // Implement test logic
  }

  return (
    <AutomationBuilder
      onSave={handleSave}
      onTest={handleTest}
      existingAutomations={automations}
    />
  )
}
```

## Backend Integration

### API Endpoints

Create these endpoints in your backend:

```typescript
// POST /api/automations - Create automation
// PUT /api/automations/:id - Update automation
// GET /api/automations - List automations
// DELETE /api/automations/:id - Delete automation
// POST /api/automations/:id/test - Test automation
// POST /api/automations/:id/toggle - Enable/disable automation
```

### Example API Client

```typescript
// services/automationApi.ts
import apiClient from './api'
import { Automation } from '@/components/AutomationBuilder'

export const automationApi = {
  // List all automations
  list: async (): Promise<Automation[]> => {
    const response = await apiClient.get('/automations')
    return response.data
  },

  // Get single automation
  get: async (id: string): Promise<Automation> => {
    const response = await apiClient.get(`/automations/${id}`)
    return response.data
  },

  // Create automation
  create: async (automation: Omit<Automation, 'id' | 'createdAt' | 'runCount'>): Promise<Automation> => {
    const response = await apiClient.post('/automations', automation)
    return response.data
  },

  // Update automation
  update: async (id: string, automation: Partial<Automation>): Promise<Automation> => {
    const response = await apiClient.put(`/automations/${id}`, automation)
    return response.data
  },

  // Delete automation
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/automations/${id}`)
  },

  // Test automation
  test: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(`/automations/${id}/test`)
    return response.data
  },

  // Toggle automation status
  toggle: async (id: string, enabled: boolean): Promise<Automation> => {
    const response = await apiClient.post(`/automations/${id}/toggle`, { enabled })
    return response.data
  }
}
```

### Full Integration Example

```tsx
'use client'

import { useState, useEffect } from 'react'
import AutomationBuilder, { Automation } from '@/components/AutomationBuilder'
import { automationApi } from '@/services/automationApi'

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<Automation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load automations on mount
  useEffect(() => {
    loadAutomations()
  }, [])

  const loadAutomations = async () => {
    try {
      setLoading(true)
      const data = await automationApi.list()
      setAutomations(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load automations')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (automation: Automation) => {
    try {
      let saved: Automation
      
      if (automation.id && automations.find(a => a.id === automation.id)) {
        // Update existing
        saved = await automationApi.update(automation.id, automation)
        setAutomations(prev => prev.map(a => a.id === saved.id ? saved : a))
      } else {
        // Create new
        saved = await automationApi.create(automation)
        setAutomations(prev => [...prev, saved])
      }

      alert(`Automation "${saved.name}" saved successfully!`)
    } catch (err: any) {
      alert(`Failed to save: ${err.message}`)
    }
  }

  const handleTest = async (automation: Automation) => {
    try {
      const result = await automationApi.test(automation.id)
      alert(`Test ${result.success ? 'passed' : 'failed'}: ${result.message}`)
    } catch (err: any) {
      alert(`Test failed: ${err.message}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading automations...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">Error: {error}</div>
      </div>
    )
  }

  return (
    <AutomationBuilder
      onSave={handleSave}
      onTest={handleTest}
      existingAutomations={automations}
    />
  )
}
```

## State Management Integration

### Redux

```typescript
// store/automationSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Automation } from '@/components/AutomationBuilder'
import { automationApi } from '@/services/automationApi'

interface AutomationState {
  automations: Automation[]
  loading: boolean
  error: string | null
}

const initialState: AutomationState = {
  automations: [],
  loading: false,
  error: null
}

export const fetchAutomations = createAsyncThunk(
  'automations/fetch',
  async () => {
    return await automationApi.list()
  }
)

export const saveAutomation = createAsyncThunk(
  'automations/save',
  async (automation: Automation) => {
    if (automation.id) {
      return await automationApi.update(automation.id, automation)
    }
    return await automationApi.create(automation)
  }
)

const automationSlice = createSlice({
  name: 'automations',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAutomations.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchAutomations.fulfilled, (state, action) => {
        state.loading = false
        state.automations = action.payload
      })
      .addCase(fetchAutomations.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch'
      })
      .addCase(saveAutomation.fulfilled, (state, action) => {
        const index = state.automations.findIndex(a => a.id === action.payload.id)
        if (index >= 0) {
          state.automations[index] = action.payload
        } else {
          state.automations.push(action.payload)
        }
      })
  }
})

export default automationSlice.reducer
```

```tsx
// Component using Redux
'use client'

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import AutomationBuilder from '@/components/AutomationBuilder'
import { fetchAutomations, saveAutomation } from '@/store/automationSlice'
import { RootState, AppDispatch } from '@/store'

export default function AutomationsPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { automations, loading } = useSelector((state: RootState) => state.automations)

  useEffect(() => {
    dispatch(fetchAutomations())
  }, [dispatch])

  const handleSave = (automation: Automation) => {
    dispatch(saveAutomation(automation))
  }

  if (loading) return <div>Loading...</div>

  return (
    <AutomationBuilder
      onSave={handleSave}
      existingAutomations={automations}
    />
  )
}
```

### Zustand

```typescript
// store/automationStore.ts
import { create } from 'zustand'
import { Automation } from '@/components/AutomationBuilder'
import { automationApi } from '@/services/automationApi'

interface AutomationStore {
  automations: Automation[]
  loading: boolean
  error: string | null
  fetchAutomations: () => Promise<void>
  saveAutomation: (automation: Automation) => Promise<void>
  deleteAutomation: (id: string) => Promise<void>
}

export const useAutomationStore = create<AutomationStore>((set, get) => ({
  automations: [],
  loading: false,
  error: null,

  fetchAutomations: async () => {
    set({ loading: true, error: null })
    try {
      const automations = await automationApi.list()
      set({ automations, loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  saveAutomation: async (automation: Automation) => {
    try {
      let saved: Automation
      if (automation.id) {
        saved = await automationApi.update(automation.id, automation)
      } else {
        saved = await automationApi.create(automation)
      }
      
      set((state) => ({
        automations: state.automations.some(a => a.id === saved.id)
          ? state.automations.map(a => a.id === saved.id ? saved : a)
          : [...state.automations, saved]
      }))
    } catch (error: any) {
      set({ error: error.message })
      throw error
    }
  },

  deleteAutomation: async (id: string) => {
    try {
      await automationApi.delete(id)
      set((state) => ({
        automations: state.automations.filter(a => a.id !== id)
      }))
    } catch (error: any) {
      set({ error: error.message })
      throw error
    }
  }
}))
```

```tsx
// Component using Zustand
'use client'

import { useEffect } from 'react'
import AutomationBuilder from '@/components/AutomationBuilder'
import { useAutomationStore } from '@/store/automationStore'

export default function AutomationsPage() {
  const { automations, loading, fetchAutomations, saveAutomation } = useAutomationStore()

  useEffect(() => {
    fetchAutomations()
  }, [fetchAutomations])

  if (loading) return <div>Loading...</div>

  return (
    <AutomationBuilder
      onSave={saveAutomation}
      existingAutomations={automations}
    />
  )
}
```

## Real-time Updates

### WebSocket Integration

```typescript
// hooks/useAutomationUpdates.ts
import { useEffect } from 'react'
import { Automation } from '@/components/AutomationBuilder'

export function useAutomationUpdates(
  onUpdate: (automation: Automation) => void,
  onDelete: (id: string) => void
) {
  useEffect(() => {
    const ws = new WebSocket('ws://your-api.com/automations/updates')

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      switch (data.type) {
        case 'automation_updated':
          onUpdate(data.automation)
          break
        case 'automation_deleted':
          onDelete(data.id)
          break
        case 'automation_executed':
          console.log('Automation executed:', data)
          break
      }
    }

    return () => ws.close()
  }, [onUpdate, onDelete])
}
```

```tsx
// Usage
const [automations, setAutomations] = useState<Automation[]>([])

useAutomationUpdates(
  (automation) => {
    setAutomations(prev => 
      prev.map(a => a.id === automation.id ? automation : a)
    )
  },
  (id) => {
    setAutomations(prev => prev.filter(a => a.id !== id))
  }
)
```

## Execution Engine Integration

### Trigger Handlers

```typescript
// services/automationEngine.ts
import { Automation, TriggerType } from '@/components/AutomationBuilder'

export class AutomationEngine {
  private automations: Automation[] = []

  loadAutomations(automations: Automation[]) {
    this.automations = automations.filter(a => a.status === 'active')
  }

  async handleTrigger(triggerType: TriggerType, data: any) {
    const matchingAutomations = this.automations.filter(
      a => a.trigger.type === triggerType
    )

    for (const automation of matchingAutomations) {
      if (this.evaluateConditions(automation, data)) {
        await this.executeActions(automation, data)
      }
    }
  }

  private evaluateConditions(automation: Automation, data: any): boolean {
    if (automation.conditions.length === 0) return true

    return automation.conditions.every(condition => {
      const fieldValue = data[condition.field]
      
      switch (condition.operator) {
        case 'equals':
          return fieldValue === condition.value
        case 'contains':
          return String(fieldValue).includes(condition.value)
        case 'greater_than':
          return Number(fieldValue) > Number(condition.value)
        case 'less_than':
          return Number(fieldValue) < Number(condition.value)
        default:
          return false
      }
    })
  }

  private async executeActions(automation: Automation, data: any) {
    const sortedActions = [...automation.actions].sort((a, b) => a.order - b.order)

    for (const action of sortedActions) {
      await this.executeAction(action, data)
    }

    // Update run count
    automation.runCount++
    automation.lastRun = new Date().toISOString()
  }

  private async executeAction(action: Action, data: any) {
    switch (action.type) {
      case 'generate_content':
        await this.generateContent(action.config, data)
        break
      case 'post_platform':
        await this.postToPlatform(action.config, data)
        break
      case 'send_notification':
        await this.sendNotification(action.config, data)
        break
      case 'run_workflow':
        await this.runWorkflow(action.config, data)
        break
    }
  }

  private async generateContent(config: any, data: any) {
    // Implement content generation
    console.log('Generating content:', config, data)
  }

  private async postToPlatform(config: any, data: any) {
    // Implement platform posting
    console.log('Posting to platform:', config, data)
  }

  private async sendNotification(config: any, data: any) {
    // Implement notification sending
    console.log('Sending notification:', config, data)
  }

  private async runWorkflow(config: any, data: any) {
    // Implement workflow execution
    console.log('Running workflow:', config, data)
  }
}
```

### Usage in Application

```typescript
// app/api/upload/route.ts
import { AutomationEngine } from '@/services/automationEngine'
import { automationApi } from '@/services/automationApi'

const engine = new AutomationEngine()

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file')

  // Process upload
  const uploadData = {
    fileType: file.type,
    fileName: file.name,
    fileSize: file.size,
    uploadedAt: new Date().toISOString()
  }

  // Trigger automations
  const automations = await automationApi.list()
  engine.loadAutomations(automations)
  await engine.handleTrigger('upload', uploadData)

  return Response.json({ success: true })
}
```

## Testing

### Unit Tests

```typescript
// __tests__/AutomationBuilder.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import AutomationBuilder from '@/components/AutomationBuilder'

describe('AutomationBuilder', () => {
  it('renders builder view by default', () => {
    render(<AutomationBuilder />)
    expect(screen.getByText('Automation Builder')).toBeInTheDocument()
  })

  it('allows selecting a trigger', () => {
    render(<AutomationBuilder />)
    const uploadTrigger = screen.getByText('On New Upload')
    fireEvent.click(uploadTrigger)
    expect(screen.getByText('Change Trigger')).toBeInTheDocument()
  })

  it('calls onSave when automation is saved', () => {
    const onSave = jest.fn()
    render(<AutomationBuilder onSave={onSave} />)
    
    // Select trigger
    fireEvent.click(screen.getByText('On New Upload'))
    
    // Add action
    fireEvent.click(screen.getByText('+ Add Action'))
    fireEvent.click(screen.getByText('Generate Content'))
    
    // Fill name
    const nameInput = screen.getByPlaceholderText('e.g., Auto-post to Instagram')
    fireEvent.change(nameInput, { target: { value: 'Test Automation' } })
    
    // Save
    fireEvent.click(screen.getByText('Save Automation'))
    
    expect(onSave).toHaveBeenCalled()
  })
})
```

## Performance Optimization

### Memoization

```tsx
import { useMemo, useCallback } from 'react'

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<Automation[]>([])

  const handleSave = useCallback((automation: Automation) => {
    setAutomations(prev => {
      const index = prev.findIndex(a => a.id === automation.id)
      if (index >= 0) {
        const updated = [...prev]
        updated[index] = automation
        return updated
      }
      return [...prev, automation]
    })
  }, [])

  const activeAutomations = useMemo(
    () => automations.filter(a => a.status === 'active'),
    [automations]
  )

  return (
    <AutomationBuilder
      onSave={handleSave}
      existingAutomations={activeAutomations}
    />
  )
}
```

## Security Considerations

1. **Validate automation data** on the backend
2. **Sanitize user inputs** in conditions and actions
3. **Rate limit** automation execution
4. **Audit log** all automation changes
5. **Permission checks** before execution
6. **Sandbox** action execution

## Troubleshooting

### Common Issues

**Issue**: Automations not saving
- Check API endpoint connectivity
- Verify authentication tokens
- Check browser console for errors

**Issue**: Drag-and-drop not working
- Ensure framer-motion is installed
- Check for CSS conflicts
- Verify touch events on mobile

**Issue**: Flow diagram not rendering
- Check for missing trigger/actions
- Verify animation delays
- Check browser compatibility

## Next Steps

1. Implement backend API endpoints
2. Set up automation execution engine
3. Add monitoring and logging
4. Create automation templates
5. Add analytics dashboard
6. Implement webhook triggers
7. Add custom action plugins

## Support

For additional help:
- Check the README.md for basic usage
- Review VISUAL_GUIDE.md for UI details
- See example.tsx for implementation examples
