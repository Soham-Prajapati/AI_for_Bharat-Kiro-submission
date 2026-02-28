# AutomationBuilder Quick Start Guide

Get up and running with the AutomationBuilder component in 5 minutes.

## 1. Basic Usage (30 seconds)

Create a new page and import the component:

```tsx
// app/automations/page.tsx
'use client'

import AutomationBuilder from '@/components/AutomationBuilder'

export default function AutomationsPage() {
  return <AutomationBuilder />
}
```

That's it! Navigate to `/automations` to see the builder.

## 2. With Save Handler (2 minutes)

Add a save handler to persist automations:

```tsx
'use client'

import { useState } from 'react'
import AutomationBuilder, { Automation } from '@/components/AutomationBuilder'

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<Automation[]>([])

  const handleSave = (automation: Automation) => {
    setAutomations(prev => {
      // Update existing or add new
      const index = prev.findIndex(a => a.id === automation.id)
      if (index >= 0) {
        const updated = [...prev]
        updated[index] = automation
        return updated
      }
      return [...prev, automation]
    })
    
    alert(`Saved: ${automation.name}`)
  }

  return (
    <AutomationBuilder
      onSave={handleSave}
      existingAutomations={automations}
    />
  )
}
```

## 3. With API Integration (5 minutes)

Connect to your backend API:

```tsx
'use client'

import { useState, useEffect } from 'react'
import AutomationBuilder, { Automation } from '@/components/AutomationBuilder'

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<Automation[]>([])

  // Load automations on mount
  useEffect(() => {
    fetch('/api/automations')
      .then(res => res.json())
      .then(data => setAutomations(data))
  }, [])

  // Save automation
  const handleSave = async (automation: Automation) => {
    const method = automation.id ? 'PUT' : 'POST'
    const url = automation.id 
      ? `/api/automations/${automation.id}`
      : '/api/automations'

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(automation)
    })

    const saved = await response.json()
    
    setAutomations(prev => {
      const index = prev.findIndex(a => a.id === saved.id)
      if (index >= 0) {
        const updated = [...prev]
        updated[index] = saved
        return updated
      }
      return [...prev, saved]
    })

    alert(`Saved: ${saved.name}`)
  }

  // Test automation
  const handleTest = async (automation: Automation) => {
    const response = await fetch(`/api/automations/${automation.id}/test`, {
      method: 'POST'
    })
    const result = await response.json()
    alert(`Test result: ${result.message}`)
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

## How to Use the Builder

### Step 1: Select a Trigger
Click on one of the four trigger cards:
- 📤 On New Upload
- ⏰ On Schedule
- 📱 On Platform Post
- ✨ On Content Generated

### Step 2: Add Conditions (Optional)
Click "+ Add Condition" to filter when the automation runs:
- Choose a field name
- Select an operator (equals, contains, etc.)
- Enter a value

### Step 3: Add Actions
Click "+ Add Action" and select from:
- 🤖 Generate Content
- 🚀 Post to Platform
- 🔔 Send Notification
- ⚙️ Run Workflow

Configure each action with the required settings.

### Step 4: Review Flow
Check the visual flow diagram to see your automation workflow.

### Step 5: Save or Test
- Click "Test Automation" to run a test
- Click "Save Automation" to save it

## Example Automation

Here's a complete example automation:

```typescript
{
  name: "Auto-post to Instagram",
  description: "Post generated content when videos are uploaded",
  trigger: {
    type: "upload",
    config: {}
  },
  conditions: [
    {
      field: "fileType",
      operator: "equals",
      value: "video"
    }
  ],
  actions: [
    {
      type: "generate_content",
      config: {
        contentType: "instagram_post",
        template: "viral"
      },
      order: 0
    },
    {
      type: "post_platform",
      config: {
        platform: "instagram",
        account: "main"
      },
      order: 1
    }
  ],
  status: "active"
}
```

## Common Use Cases

### 1. Auto-post on Upload
```
Trigger: On New Upload
Condition: fileType = video
Actions:
  1. Generate Content (social post)
  2. Post to Platform (Instagram)
```

### 2. Daily Content Generation
```
Trigger: On Schedule (9 AM daily)
Actions:
  1. Generate Content (multi-platform)
  2. Send Notification (email team)
```

### 3. Cross-platform Publishing
```
Trigger: On Platform Post (Instagram)
Actions:
  1. Post to Platform (TikTok)
  2. Post to Platform (YouTube Shorts)
  3. Send Notification (success message)
```

### 4. Content Pipeline
```
Trigger: On Content Generated
Condition: quality_score > 80
Actions:
  1. Post to Platform (all platforms)
  2. Run Workflow (analytics tracking)
```

## Tips

1. **Start Simple**: Begin with one trigger and one action
2. **Test First**: Always test before activating
3. **Use Conditions**: Filter to avoid unwanted executions
4. **Order Matters**: Actions run in the order you set
5. **Drag to Reorder**: Drag actions to change execution order

## Keyboard Shortcuts

- **Tab**: Navigate between fields
- **Enter**: Submit forms
- **Escape**: Close modals
- **Click + Drag**: Reorder actions

## Troubleshooting

**Q: Trigger not showing?**
A: Make sure you clicked on a trigger card first.

**Q: Can't add actions?**
A: You need to select a trigger before adding actions.

**Q: Actions not reordering?**
A: Click and hold the action card, then drag up or down.

**Q: Save button disabled?**
A: Ensure you have a name, trigger, and at least one action.

## Next Steps

- Read **README.md** for full documentation
- Check **VISUAL_GUIDE.md** for UI details
- See **INTEGRATION.md** for backend setup
- Review **example.tsx** for more examples

## Need Help?

1. Check the documentation files
2. Review the example file
3. Look at the type definitions in the component
4. Test with the example automations

## Ready to Build!

You now have everything you need to create powerful automations. Start building your first workflow! 🚀
