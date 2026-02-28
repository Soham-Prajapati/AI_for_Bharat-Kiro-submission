# AutomationBuilder Component

A modern, visual workflow builder for creating if-this-then-that style automations with drag-and-drop functionality.

## Features

### ✨ Core Functionality
- **Visual Workflow Builder**: Intuitive drag-and-drop interface
- **Trigger Selection**: Choose from 4 trigger types
- **Condition Builder**: Add optional filters and conditions
- **Action Builder**: Chain multiple actions with reordering
- **Flow Diagram**: Real-time visual representation of workflow
- **Automation Management**: List, edit, and manage existing automations

### 🎨 Design
- Modern dark mode UI with TailwindCSS
- Smooth animations with Framer Motion
- Gradient accents and glassmorphism effects
- Responsive layout for all screen sizes
- Interactive hover states and transitions

### 🔧 Triggers
1. **On New Upload** 📤 - Triggered when content is uploaded
2. **On Schedule** ⏰ - Triggered at specific times/intervals
3. **On Platform Post** 📱 - Triggered when content is posted
4. **On Content Generated** ✨ - Triggered when AI generates content

### ⚡ Actions
1. **Generate Content** 🤖 - Use AI to create new content
2. **Post to Platform** 🚀 - Publish to social platforms
3. **Send Notification** 🔔 - Send email/push notifications
4. **Run Workflow** ⚙️ - Execute another automation

## Installation

```bash
# Dependencies are already included in package.json
npm install
```

Required dependencies:
- `react` ^18.3.0
- `framer-motion` ^11.0.0
- `tailwindcss` ^3.4.0

## Usage

### Basic Example

```tsx
import AutomationBuilder from '@/components/AutomationBuilder'

export default function MyPage() {
  const handleSave = (automation) => {
    console.log('Saved:', automation)
    // Save to your backend
  }

  const handleTest = (automation) => {
    console.log('Testing:', automation)
    // Test the automation
  }

  return (
    <AutomationBuilder
      onSave={handleSave}
      onTest={handleTest}
      existingAutomations={[]}
    />
  )
}
```

### With Existing Automations

```tsx
const [automations, setAutomations] = useState([
  {
    id: '1',
    name: 'Auto-post to Instagram',
    description: 'Post when new content is uploaded',
    trigger: { type: 'upload', config: {} },
    conditions: [],
    actions: [
      {
        id: 'a1',
        type: 'post_platform',
        config: { platform: 'instagram' },
        order: 0
      }
    ],
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    runCount: 42
  }
])

<AutomationBuilder
  onSave={(automation) => {
    setAutomations(prev => [...prev, automation])
  }}
  onTest={handleTest}
  existingAutomations={automations}
/>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onSave` | `(automation: Automation) => void` | No | Callback when automation is saved |
| `onTest` | `(automation: Automation) => void` | No | Callback when automation is tested |
| `existingAutomations` | `Automation[]` | No | Array of existing automations to display |

## Types

### Automation

```typescript
interface Automation {
  id: string
  name: string
  description: string
  trigger: Trigger
  conditions: Condition[]
  actions: Action[]
  status: 'active' | 'inactive' | 'draft'
  createdAt: string
  lastRun?: string
  runCount: number
}
```

### Trigger

```typescript
interface Trigger {
  type: 'upload' | 'schedule' | 'platform_post' | 'content_generated'
  config: Record<string, any>
}
```

### Condition

```typescript
interface Condition {
  id: string
  field: string
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than'
  value: string
}
```

### Action

```typescript
interface Action {
  id: string
  type: 'generate_content' | 'post_platform' | 'send_notification' | 'run_workflow'
  config: Record<string, any>
  order: number
}
```

## Component Structure

```
AutomationBuilder/
├── Main Component
│   ├── Header (Builder/List toggle)
│   ├── Builder View
│   │   ├── Basic Information
│   │   ├── Trigger Section
│   │   ├── Conditions Section
│   │   ├── Actions Section
│   │   ├── Flow Diagram
│   │   └── Action Buttons
│   └── List View
│       ├── Filters
│       └── Automation Cards
├── TriggerCard
├── SelectedTrigger
├── ConditionRow
├── ActionRow (with Reorder)
├── FlowDiagram
├── ActionSelectorModal
├── AutomationList
└── AutomationCard
```

## Features in Detail

### Drag-and-Drop Actions

Actions can be reordered by dragging them up or down. This uses Framer Motion's `Reorder` component for smooth animations.

### Visual Flow Diagram

The flow diagram automatically updates as you build your automation:
- Shows trigger at the top
- Displays conditions (if any)
- Lists all actions in order
- Ends with success indicator

### Condition Builder

Add multiple conditions with:
- Field name input
- Operator selection (equals, contains, greater than, less than)
- Value input
- Easy removal

### Action Configuration

Each action type has specific configuration fields:
- **Generate Content**: Content type, template
- **Post to Platform**: Platform selection, account
- **Send Notification**: Type (email/push/slack), recipient
- **Run Workflow**: Workflow ID

## Styling

The component uses:
- **TailwindCSS** for utility classes
- **Gradient backgrounds** for visual appeal
- **Glassmorphism** with backdrop-blur
- **Dark mode** optimized colors
- **Smooth animations** with Framer Motion

### Color Scheme

- Background: Gray-900 to Gray-800 gradient
- Cards: Gray-800/50 with backdrop blur
- Accents: Purple-600 to Pink-600 gradient
- Borders: Gray-700
- Text: White primary, Gray-400 secondary

## Animations

- **Fade in**: Initial component load
- **Slide up**: Cards and sections
- **Scale**: Hover effects on buttons
- **Reorder**: Drag-and-drop actions
- **Flow diagram**: Sequential reveal

## Accessibility

- Semantic HTML structure
- Keyboard navigation support
- Focus states on interactive elements
- ARIA labels where appropriate
- Color contrast meets WCAG standards

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Optimized re-renders with React hooks
- Efficient animation with Framer Motion
- Lazy loading of modal components
- Minimal bundle size impact

## Customization

### Adding New Trigger Types

```typescript
const TRIGGER_OPTIONS = [
  // Add your custom trigger
  {
    type: 'custom_trigger' as TriggerType,
    label: 'Custom Trigger',
    icon: '🎯',
    description: 'Your custom trigger description',
    color: 'from-indigo-500 to-purple-500'
  }
]
```

### Adding New Action Types

```typescript
const ACTION_OPTIONS = [
  // Add your custom action
  {
    type: 'custom_action' as ActionType,
    label: 'Custom Action',
    icon: '⭐',
    description: 'Your custom action description',
    color: 'from-pink-500 to-rose-500'
  }
]
```

## Integration Examples

### With API Backend

```typescript
const handleSave = async (automation: Automation) => {
  try {
    const response = await fetch('/api/automations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(automation)
    })
    const saved = await response.json()
    console.log('Saved:', saved)
  } catch (error) {
    console.error('Save failed:', error)
  }
}
```

### With State Management

```typescript
// Redux example
const handleSave = (automation: Automation) => {
  dispatch(saveAutomation(automation))
}

// Zustand example
const handleSave = (automation: Automation) => {
  useAutomationStore.getState().addAutomation(automation)
}
```

## Troubleshooting

### Animations not working
- Ensure `framer-motion` is installed
- Check for conflicting CSS

### Drag-and-drop issues
- Verify `Reorder` component from framer-motion
- Check for z-index conflicts

### Styling issues
- Ensure TailwindCSS is configured
- Check `tailwind.config.ts` includes component path

## Future Enhancements

- [ ] Advanced condition logic (AND/OR groups)
- [ ] Automation templates
- [ ] Version history
- [ ] Duplicate automation
- [ ] Import/export automations
- [ ] Automation analytics
- [ ] Webhook triggers
- [ ] Custom action plugins

## License

Part of the Content Intelligence Platform frontend.

## Support

For issues or questions, please refer to the main project documentation.
