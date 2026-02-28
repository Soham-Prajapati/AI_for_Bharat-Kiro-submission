# SafetyDashboard Component

## Overview

The **SafetyDashboard** is a comprehensive content safety and moderation component that provides real-time monitoring, violation detection, and platform compliance checking. It features a visual traffic light system, detailed violation alerts, and actionable insights for content creators.

## Features

### 1. 🚦 Traffic Light System
- **Green (80-100)**: Content is safe and compliant
- **Yellow (50-79)**: Content has warnings or minor violations
- **Red (0-49)**: Content has critical violations

Visual indicator with animated lights that respond to the overall safety score.

### 2. 🚨 Violation Alerts
- Severity levels: Critical, High, Medium, Low
- Category-based classification (explicit, violence, hate speech, etc.)
- Confidence scores for each detection
- Platform-specific impact analysis
- Clickable cards for detailed information

### 3. 📊 Real-time Safety Score Visualization
- Overall safety score (0-100)
- Violation count with severity breakdown
- Warning count
- Platform compliance ratio
- Animated progress bars and metrics

### 4. ✅ Platform Guidelines Compliance Checker
Checks content against platform-specific guidelines:
- YouTube
- Instagram
- TikTok
- Twitter
- LinkedIn
- Facebook

Each platform shows:
- Compliance status (✅/❌)
- Specific violations
- Warnings
- Guidelines met

### 5. 🏷️ Content Moderation Results
- AI-powered moderation labels
- Confidence scores
- Parent category classification
- Visual tag display

### 6. 📜 Violation History Timeline
- Chronological violation display
- Color-coded severity indicators
- Timestamp information
- Location data (for video/text)
- Interactive timeline view

### 7. ⚡ Quick Action Buttons
- **Approve**: Approve safe content for publishing
- **Reject**: Reject unsafe content
- **Flag**: Flag content for manual review with custom reason
- **Re-check**: Run safety check again

### 8. 💡 Smart Suggestions
Actionable recommendations to fix violations:
- Content modification suggestions
- Platform-specific guidance
- Best practices
- Compliance tips

## Usage

### Basic Usage

```tsx
import SafetyDashboard from '@/components/SafetyDashboard';

export default function SafetyPage() {
  return (
    <SafetyDashboard
      contentId="content_123"
      onApprove={(checkId) => console.log('Approved:', checkId)}
      onReject={(checkId) => console.log('Rejected:', checkId)}
      onFlag={(checkId, reason) => console.log('Flagged:', checkId, reason)}
    />
  );
}
```

### With Auto-refresh

```tsx
<SafetyDashboard
  contentId="content_123"
  autoRefresh={true}
  refreshInterval={30000} // 30 seconds
  onApprove={handleApprove}
  onReject={handleReject}
  onFlag={handleFlag}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `contentId` | `string` | `undefined` | ID of the content being checked |
| `onApprove` | `(checkId: string) => void` | `undefined` | Callback when content is approved |
| `onReject` | `(checkId: string) => void` | `undefined` | Callback when content is rejected |
| `onFlag` | `(checkId: string, reason: string) => void` | `undefined` | Callback when content is flagged |
| `autoRefresh` | `boolean` | `false` | Enable automatic data refresh |
| `refreshInterval` | `number` | `30000` | Refresh interval in milliseconds |

## Data Structure

### SafetyCheckResult

```typescript
interface SafetyCheckResult {
  checkId: string;
  contentId: string;
  safe: boolean;
  overallScore: number; // 0-100
  violations: Violation[];
  warnings: string[];
  suggestions: string[];
  platformCompliance: Record<string, {
    compliant: boolean;
    violations: string[];
    warnings: string[];
  }>;
  moderationLabels?: {
    label: string;
    confidence: number;
    parentLabel?: string;
  }[];
  checkedAt: string;
}
```

### Violation

```typescript
interface Violation {
  violationId: string;
  category: 'explicit' | 'violence' | 'hate_speech' | 'harassment' | 'spam' | 'misinformation' | 'copyright' | 'privacy' | 'dangerous';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-100
  description: string;
  location?: {
    start?: number;
    end?: number;
    timestamp?: number;
    boundingBox?: {
      left: number;
      top: number;
      width: number;
      height: number;
    };
  };
  platformViolations?: string[];
  timestamp: string;
}
```

## Violation Categories

| Category | Icon | Description |
|----------|------|-------------|
| `explicit` | 🔞 | Adult or explicit content |
| `violence` | ⚠️ | Violent or graphic content |
| `hate_speech` | 🚫 | Discriminatory or hateful language |
| `harassment` | 😡 | Bullying or harassment |
| `spam` | 📧 | Spam or overly promotional |
| `misinformation` | ❌ | False or misleading information |
| `copyright` | ©️ | Copyright violations |
| `privacy` | 🔒 | Privacy violations |
| `dangerous` | ☢️ | Dangerous activities or content |

## Severity Levels

| Severity | Color | Impact | Action Required |
|----------|-------|--------|------------------|
| `critical` | Red | -40 points | Immediate action required |
| `high` | Orange | -25 points | Must be addressed |
| `medium` | Yellow | -15 points | Should be reviewed |
| `low` | Blue | -5 points | Minor concern |

## Styling

The component uses:
- **TailwindCSS** for styling
- **Framer Motion** for animations
- Gradient backgrounds for visual appeal
- Responsive design (mobile-first)
- Dark mode compatible color scheme

## Integration with Backend

### API Endpoint

```typescript
// POST /api/safety/check
const response = await fetch('/api/safety/check', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contentId: 'content_123',
    contentType: 'text',
    content: 'Your content here...',
    platforms: ['youtube', 'instagram', 'tiktok'],
    strictness: 'medium',
  }),
});

const safetyResult = await response.json();
```

### Real-time Updates

For production, replace mock data with API calls:

```typescript
useEffect(() => {
  const fetchSafetyData = async () => {
    const response = await fetch(`/api/safety/check/${contentId}`);
    const data = await response.json();
    setSafetyData(data);
  };

  fetchSafetyData();
  
  if (autoRefresh) {
    const interval = setInterval(fetchSafetyData, refreshInterval);
    return () => clearInterval(interval);
  }
}, [contentId, autoRefresh, refreshInterval]);
```

## Examples

### Example 1: Content Review Dashboard

```tsx
function ContentReviewPage() {
  const handleApprove = async (checkId: string) => {
    await fetch(`/api/content/approve/${checkId}`, { method: 'POST' });
    toast.success('Content approved!');
  };

  const handleReject = async (checkId: string) => {
    await fetch(`/api/content/reject/${checkId}`, { method: 'POST' });
    toast.error('Content rejected');
  };

  const handleFlag = async (checkId: string, reason: string) => {
    await fetch(`/api/content/flag/${checkId}`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    toast.info('Content flagged for review');
  };

  return (
    <SafetyDashboard
      contentId="content_123"
      onApprove={handleApprove}
      onReject={handleReject}
      onFlag={handleFlag}
      autoRefresh={true}
    />
  );
}
```

### Example 2: Monitoring Multiple Contents

```tsx
function SafetyMonitor() {
  const [selectedContent, setSelectedContent] = useState('content_1');

  return (
    <div>
      <select onChange={(e) => setSelectedContent(e.target.value)}>
        <option value="content_1">Content 1</option>
        <option value="content_2">Content 2</option>
        <option value="content_3">Content 3</option>
      </select>

      <SafetyDashboard
        key={selectedContent}
        contentId={selectedContent}
        autoRefresh={true}
        refreshInterval={15000}
      />
    </div>
  );
}
```

## Performance

- **Initial Load**: < 100ms (with mock data)
- **Animation Duration**: 0.3-1s (smooth transitions)
- **Re-render Optimization**: Uses React.memo for violation cards
- **Auto-refresh**: Configurable interval (default: 30s)

## Accessibility

- Semantic HTML structure
- ARIA labels for interactive elements
- Keyboard navigation support
- Screen reader friendly
- Color contrast compliance (WCAG AA)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

```json
{
  "react": "^18.0.0",
  "framer-motion": "^10.0.0",
  "tailwindcss": "^3.0.0"
}
```

## Future Enhancements

- [ ] Export safety reports as PDF
- [ ] Batch content checking
- [ ] Custom violation rules
- [ ] Integration with AWS Rekognition
- [ ] Integration with AWS Bedrock
- [ ] Real-time WebSocket updates
- [ ] Historical trend analysis
- [ ] Team collaboration features
- [ ] Custom platform guidelines

## License

MIT

## Support

For issues or questions, please contact the development team or open an issue in the repository.
