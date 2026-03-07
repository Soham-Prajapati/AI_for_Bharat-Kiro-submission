# 📊 Monitoring Guide

## Overview

This guide covers the complete monitoring setup for the Content Intelligence Platform using AWS CloudWatch. The monitoring system tracks API performance, infrastructure health, business metrics, and costs.

**Monitoring Components:**
- CloudWatch Dashboard (real-time metrics visualization)
- CloudWatch Alarms (automated alerts)
- CloudWatch Logs (application and error logs)
- Custom Metrics (business KPIs)
- Cost Monitoring (budget tracking)

## Quick Setup

Run the automated setup script:

```bash
# Set your alert email
export ALERT_EMAIL="your-email@example.com"
export AWS_REGION="us-east-1"

# Run setup script
chmod +x infrastructure/setup-monitoring.sh
./infrastructure/setup-monitoring.sh
```

This script will:
1. Create SNS topic for alerts
2. Subscribe your email to alerts
3. Create CloudWatch dashboard
4. Configure all alarms
5. Set up log groups and metric filters

**Important:** Check your email and confirm the SNS subscription!

## CloudWatch Dashboard

The dashboard provides real-time visibility into:
- API response times (avg, p95, p99)
- Error rates (4xx, 5xx)
- CPU and memory utilization
- Request volume
- S3 storage metrics
- Recent errors
- Business metrics

**Access Dashboard:**
```
https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=ContentIntelligencePlatform-Production
```

**Manual Dashboard Creation:**
```bash
aws cloudwatch put-dashboard \
  --dashboard-name ContentIntelligencePlatform-Production \
  --dashboard-body file://infrastructure/cloudwatch-dashboard.json \
  --region us-east-1
```

## CloudWatch Alarms

### Configured Alarms

| Alarm | Threshold | Description |
|-------|-----------|-------------|
| HighErrorRate | >5% | API error rate exceeds 5% |
| HighResponseTime | >3s | API response time exceeds 3 seconds |
| HighCPU | >80% | CPU utilization exceeds 80% |
| HighMemory | >80% | Memory utilization exceeds 80% |
| HealthCheckFailed | ≥1 | Health check endpoint failing |
| DailyBudget | >$10 | Daily AWS costs exceed $10 |

### Test Alarms

```bash
# Test an alarm by setting it to ALARM state
aws cloudwatch set-alarm-state \
  --alarm-name ContentIntelligence-HighErrorRate \
  --state-value ALARM \
  --state-reason "Testing alarm notification" \
  --region us-east-1

# Check alarm status
aws cloudwatch describe-alarms \
  --alarm-names ContentIntelligence-HighErrorRate \
  --region us-east-1
```

### Alarm Actions

When an alarm triggers:
1. SNS notification sent to subscribed email
2. Email contains alarm details and metrics
3. Team can investigate via dashboard link
4. Alarm auto-resolves when metric returns to normal

## CloudWatch Logs

### Log Groups

**Application Logs:**
- Log Group: `/aws/ecs/content-intelligence-platform`
- Retention: 30 days
- Format: JSON structured logs

**Enable Logging in Application:**
```javascript
const winston = require('winston');
const CloudWatchTransport = require('winston-cloudwatch');

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new CloudWatchTransport({
      logGroupName: '/aws/ecs/content-intelligence-platform',
      logStreamName: `app-${new Date().toISOString().split('T')[0]}`,
      awsRegion: process.env.AWS_REGION || 'us-east-1',
      jsonMessage: true
    }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Usage
logger.info('Video processed', { videoId: '123', duration: 45 });
logger.error('Processing failed', { error: err.message, stack: err.stack });
```

### Log Queries

**View Recent Errors:**
```
fields @timestamp, @message
| filter @message like /ERROR/
| sort @timestamp desc
| limit 20
```

**API Latency Analysis:**
```
fields @timestamp, duration
| filter @message like /API request/
| stats avg(duration), max(duration), min(duration) by bin(5m)
```

**Error Rate by Endpoint:**
```
fields @timestamp, endpoint, status
| filter status >= 400
| stats count() by endpoint
| sort count desc
```

**Access Logs via CLI:**
```bash
# Tail logs in real-time
aws logs tail /aws/ecs/content-intelligence-platform --follow --region us-east-1

# Query logs
aws logs filter-log-events \
  --log-group-name /aws/ecs/content-intelligence-platform \
  --filter-pattern "ERROR" \
  --start-time $(date -u -d '1 hour ago' +%s)000 \
  --region us-east-1
```

## Key Metrics

### API Metrics
- **Request Count** - Total API requests per period
- **Latency** - Response time (p50, p95, p99)
- **Error Rate** - 4xx and 5xx error percentages
- **Throughput** - Requests per second
- **Success Rate** - Percentage of successful requests

### AI Processing Metrics
- **Processing Time** - Time to analyze content (avg, p95)
- **Success Rate** - Successful vs failed analyses
- **Queue Length** - Pending jobs in processing queue
- **Cost per Request** - Bedrock API costs per operation
- **Videos Processed** - Total videos analyzed
- **Content Generated** - Total content pieces created

### Infrastructure Metrics
- **CPU Usage** - ECS task CPU utilization (%)
- **Memory Usage** - ECS task memory utilization (%)
- **Network I/O** - Data transfer in/out
- **Storage** - S3 bucket size and object count
- **Container Health** - Healthy vs unhealthy hosts

### Business Metrics
- **Active Users** - Unique users per period
- **Upload Success Rate** - Successful uploads vs failures
- **Transcription Completion** - Completed transcriptions
- **Content Export** - Exported content count
- **API Usage by Endpoint** - Most used endpoints

## Custom Metrics

Track business-specific metrics in your application:

```javascript
const { CloudWatch } = require('@aws-sdk/client-cloudwatch');
const cloudwatch = new CloudWatch({ region: process.env.AWS_REGION });

class MetricsService {
  async trackMetric(name, value, unit = 'Count') {
    try {
      await cloudwatch.putMetricData({
        Namespace: 'ContentIntelligence',
        MetricData: [{
          MetricName: name,
          Value: value,
          Unit: unit,
          Timestamp: new Date(),
          Dimensions: [
            {
              Name: 'Environment',
              Value: process.env.NODE_ENV || 'production'
            }
          ]
        }]
      });
    } catch (error) {
      console.error('Failed to track metric:', error);
    }
  }

  async trackVideoProcessed(videoId, duration) {
    await this.trackMetric('VideoProcessed', 1);
    await this.trackMetric('ProcessingDuration', duration, 'Seconds');
  }

  async trackContentGenerated(contentType) {
    await this.trackMetric('ContentGenerated', 1);
    await this.trackMetric(`Content_${contentType}`, 1);
  }

  async trackAPILatency(endpoint, duration) {
    await this.trackMetric(`API_${endpoint}_Latency`, duration, 'Milliseconds');
  }

  async trackError(errorType) {
    await this.trackMetric('ErrorCount', 1);
    await this.trackMetric(`Error_${errorType}`, 1);
  }
}

module.exports = new MetricsService();

// Usage in your application
const metrics = require('./services/metrics');

// Track video processing
await metrics.trackVideoProcessed('video-123', 45);

// Track content generation
await metrics.trackContentGenerated('linkedin-post');

// Track API latency
const startTime = Date.now();
// ... API call ...
await metrics.trackAPILatency('upload', Date.now() - startTime);

// Track errors
try {
  // ... operation ...
} catch (error) {
  await metrics.trackError('TranscriptionFailed');
  throw error;
}
```

## Cost Monitoring

### Budget Setup

**Create Monthly Budget:**
```bash
# Create budget configuration
cat > budget.json << EOF
{
  "BudgetName": "ContentIntelligence-Monthly",
  "BudgetLimit": {
    "Amount": "80",
    "Unit": "USD"
  },
  "TimeUnit": "MONTHLY",
  "BudgetType": "COST",
  "CostFilters": {},
  "CostTypes": {
    "IncludeTax": true,
    "IncludeSubscription": true,
    "UseBlended": false,
    "IncludeRefund": false,
    "IncludeCredit": false,
    "IncludeUpfront": true,
    "IncludeRecurring": true,
    "IncludeOtherSubscription": true,
    "IncludeSupport": true,
    "IncludeDiscount": true,
    "UseAmortized": false
  }
}
EOF

# Create notifications configuration
cat > notifications.json << EOF
[
  {
    "Notification": {
      "NotificationType": "ACTUAL",
      "ComparisonOperator": "GREATER_THAN",
      "Threshold": 50,
      "ThresholdType": "PERCENTAGE"
    },
    "Subscribers": [
      {
        "SubscriptionType": "EMAIL",
        "Address": "your-email@example.com"
      }
    ]
  },
  {
    "Notification": {
      "NotificationType": "ACTUAL",
      "ComparisonOperator": "GREATER_THAN",
      "Threshold": 80,
      "ThresholdType": "PERCENTAGE"
    },
    "Subscribers": [
      {
        "SubscriptionType": "EMAIL",
        "Address": "your-email@example.com"
      }
    ]
  },
  {
    "Notification": {
      "NotificationType": "ACTUAL",
      "ComparisonOperator": "GREATER_THAN",
      "Threshold": 100,
      "ThresholdType": "PERCENTAGE"
    },
    "Subscribers": [
      {
        "SubscriptionType": "EMAIL",
        "Address": "your-email@example.com"
      }
    ]
  }
]
EOF

# Create budget
aws budgets create-budget \
  --account-id $(aws sts get-caller-identity --query Account --output text) \
  --budget file://budget.json \
  --notifications-with-subscribers file://notifications.json
```

### Daily Cost Check

**View Current Month Costs:**
```bash
# Get cost breakdown by service
aws ce get-cost-and-usage \
  --time-period Start=$(date -u -d 'month start' +%Y-%m-%d),End=$(date -u +%Y-%m-%d) \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=SERVICE \
  --region us-east-1

# Get daily costs for last 7 days
aws ce get-cost-and-usage \
  --time-period Start=$(date -u -d '7 days ago' +%Y-%m-%d),End=$(date -u +%Y-%m-%d) \
  --granularity DAILY \
  --metrics BlendedCost \
  --region us-east-1
```

**Cost Monitoring Script:**
```bash
#!/bin/bash
# scripts/check-costs.sh

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
START_DATE=$(date -u -d 'month start' +%Y-%m-%d)
END_DATE=$(date -u +%Y-%m-%d)

echo "💰 AWS Cost Report"
echo "Account: $ACCOUNT_ID"
echo "Period: $START_DATE to $END_DATE"
echo ""

# Get total cost
TOTAL_COST=$(aws ce get-cost-and-usage \
  --time-period Start=$START_DATE,End=$END_DATE \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --query 'ResultsByTime[0].Total.BlendedCost.Amount' \
  --output text)

echo "Total Cost: \$$TOTAL_COST"
echo ""

# Get cost by service
echo "Cost by Service:"
aws ce get-cost-and-usage \
  --time-period Start=$START_DATE,End=$END_DATE \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=SERVICE \
  --query 'ResultsByTime[0].Groups[].[Keys[0], Metrics.BlendedCost.Amount]' \
  --output table

# Check if over budget
BUDGET=80
if (( $(echo "$TOTAL_COST > $BUDGET" | bc -l) )); then
  echo ""
  echo "⚠️  WARNING: Over budget! ($TOTAL_COST > $BUDGET)"
fi
```

### Cost Optimization Tips

1. **Use AWS Free Tier:**
   - 750 hours EC2 t2.micro (first 12 months)
   - 5GB S3 storage
   - 25GB DynamoDB storage
   - 1M Lambda requests

2. **Optimize S3:**
   - Enable lifecycle policies (delete after 90 days)
   - Use S3 Intelligent-Tiering
   - Compress files before upload

3. **Optimize Compute:**
   - Use spot instances (70% cheaper)
   - Right-size instances
   - Use auto-scaling

4. **Monitor Bedrock Costs:**
   - Track API calls per day
   - Set usage limits
   - Cache responses when possible

## Health Checks

**Endpoint:**
```javascript
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime(),
    checks: {
      database: await checkDatabase(),
      s3: await checkS3(),
      bedrock: await checkBedrock()
    }
  };
  res.json(health);
});
```

**Monitor:**
```bash
# Check every 30 seconds
watch -n 30 'curl -s http://api.example.com/health | jq'
```

## Alerts and Notifications

### SNS Topic Setup

**Create SNS Topic:**
```bash
# Create topic
SNS_TOPIC_ARN=$(aws sns create-topic \
  --name content-intelligence-alerts \
  --region us-east-1 \
  --query 'TopicArn' \
  --output text)

# Subscribe email
aws sns subscribe \
  --topic-arn $SNS_TOPIC_ARN \
  --protocol email \
  --notification-endpoint your-email@example.com \
  --region us-east-1

# Subscribe SMS (optional)
aws sns subscribe \
  --topic-arn $SNS_TOPIC_ARN \
  --protocol sms \
  --notification-endpoint +1234567890 \
  --region us-east-1
```

### Alert Channels

**Email Alerts:**
- Error rate > 5%
- Latency > 3 seconds
- Daily cost > $10
- CPU usage > 80%
- Memory usage > 80%
- Health check failures

**Slack Integration:**
```javascript
// src/services/alerts.ts
import axios from 'axios';

class AlertService {
  private slackWebhook = process.env.SLACK_WEBHOOK_URL;

  async sendSlackAlert(message: string, severity: 'info' | 'warning' | 'error') {
    if (!this.slackWebhook) return;

    const colors = {
      info: '#36a64f',
      warning: '#ff9900',
      error: '#ff0000'
    };

    const emoji = {
      info: ':information_source:',
      warning: ':warning:',
      error: ':rotating_light:'
    };

    try {
      await axios.post(this.slackWebhook, {
        attachments: [{
          color: colors[severity],
          title: `${emoji[severity]} ${severity.toUpperCase()} Alert`,
          text: message,
          footer: 'Content Intelligence Platform',
          ts: Math.floor(Date.now() / 1000)
        }]
      });
    } catch (error) {
      console.error('Failed to send Slack alert:', error);
    }
  }

  async sendErrorAlert(error: Error, context?: any) {
    const message = `
*Error:* ${error.message}
*Stack:* \`\`\`${error.stack}\`\`\`
*Context:* ${JSON.stringify(context, null, 2)}
*Time:* ${new Date().toISOString()}
    `;
    await this.sendSlackAlert(message, 'error');
  }

  async sendMetricAlert(metric: string, value: number, threshold: number) {
    const message = `
*Metric:* ${metric}
*Current Value:* ${value}
*Threshold:* ${threshold}
*Time:* ${new Date().toISOString()}
    `;
    await this.sendSlackAlert(message, 'warning');
  }
}

export default new AlertService();

// Usage
import alerts from './services/alerts';

try {
  // ... operation ...
} catch (error) {
  await alerts.sendErrorAlert(error, { userId, videoId });
  throw error;
}

// Metric threshold alert
if (errorRate > 5) {
  await alerts.sendMetricAlert('Error Rate', errorRate, 5);
}
```

### PagerDuty Integration (Optional)

```bash
# Subscribe PagerDuty to SNS topic
aws sns subscribe \
  --topic-arn $SNS_TOPIC_ARN \
  --protocol https \
  --notification-endpoint https://events.pagerduty.com/integration/YOUR_KEY/enqueue \
  --region us-east-1
```

## Monitoring Best Practices

### 1. Set Appropriate Thresholds
- Start conservative, adjust based on actual traffic
- Use percentiles (p95, p99) not just averages
- Consider time of day variations

### 2. Reduce Alert Fatigue
- Only alert on actionable issues
- Use warning vs critical severity levels
- Implement alert aggregation (don't spam)

### 3. Document Runbooks
- What does this alert mean?
- How to investigate?
- How to resolve?
- Who to escalate to?

### 4. Regular Review
- Review metrics weekly
- Adjust thresholds monthly
- Remove unused metrics
- Update dashboards based on feedback

### 5. Test Monitoring
- Test alarms regularly
- Verify notifications work
- Practice incident response
- Update contact information

## Troubleshooting

### No Metrics Appearing

**Check CloudWatch Agent:**
```bash
# Verify logs are being sent
aws logs describe-log-streams \
  --log-group-name /aws/ecs/content-intelligence-platform \
  --region us-east-1

# Check recent log events
aws logs tail /aws/ecs/content-intelligence-platform --follow
```

**Check IAM Permissions:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cloudwatch:PutMetricData",
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "*"
    }
  ]
}
```

### Alarms Not Triggering

**Verify Alarm Configuration:**
```bash
aws cloudwatch describe-alarms \
  --alarm-names ContentIntelligence-HighErrorRate \
  --region us-east-1
```

**Check Alarm History:**
```bash
aws cloudwatch describe-alarm-history \
  --alarm-name ContentIntelligence-HighErrorRate \
  --history-item-type StateUpdate \
  --max-records 10 \
  --region us-east-1
```

### High CloudWatch Costs

**Reduce Log Retention:**
```bash
aws logs put-retention-policy \
  --log-group-name /aws/ecs/content-intelligence-platform \
  --retention-in-days 7 \
  --region us-east-1
```

**Filter Logs:**
- Don't log debug messages in production
- Use log levels appropriately
- Sample high-volume logs

**Optimize Metrics:**
- Reduce metric resolution (use 5min instead of 1min)
- Remove unused custom metrics
- Use metric filters instead of custom metrics where possible

## Additional Resources

- [AWS CloudWatch Documentation](https://docs.aws.amazon.com/cloudwatch/)
- [CloudWatch Pricing](https://aws.amazon.com/cloudwatch/pricing/)
- [CloudWatch Best Practices](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Best_Practice_Recommended_Alarms_AWS_Services.html)
- [Monitoring Dashboard Examples](https://github.com/aws-samples/cloudwatch-dashboards)

---

**Last Updated:** 2026-02-27  
**Maintained By:** DevOps Team  
**Review Schedule:** Monthly
