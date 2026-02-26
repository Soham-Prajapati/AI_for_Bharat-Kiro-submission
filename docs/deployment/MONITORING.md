# 📊 Monitoring Guide

## CloudWatch Logs

**Enable Logging:**
```javascript
const winston = require('winston');
const CloudWatchTransport = require('winston-cloudwatch');

const logger = winston.createLogger({
  transports: [
    new CloudWatchTransport({
      logGroupName: '/aws/ecs/content-ai',
      logStreamName: 'application',
      awsRegion: 'us-east-1'
    })
  ]
});
```

## Key Metrics

### API Metrics
- **Request Count** - Total API requests
- **Latency** - Response time (p50, p95, p99)
- **Error Rate** - 4xx and 5xx errors
- **Throughput** - Requests per second

### AI Processing Metrics
- **Processing Time** - Time to analyze content
- **Success Rate** - Successful vs failed analyses
- **Queue Length** - Pending jobs
- **Cost per Request** - Bedrock API costs

### Infrastructure Metrics
- **CPU Usage** - ECS task CPU
- **Memory Usage** - ECS task memory
- **Network I/O** - Data transfer
- **Storage** - S3 usage

## CloudWatch Alarms

**High Error Rate:**
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name content-ai-high-errors \
  --alarm-description "Alert when error rate > 5%" \
  --metric-name ErrorRate \
  --namespace ContentAI \
  --statistic Average \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2
```

**High Cost:**
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name content-ai-high-cost \
  --alarm-description "Alert when daily cost > $10" \
  --metric-name EstimatedCharges \
  --namespace AWS/Billing \
  --statistic Maximum \
  --period 86400 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold
```

## Grafana Dashboard

**Install Grafana:**
```bash
docker run -d -p 3001:3000 grafana/grafana
```

**Add CloudWatch Data Source:**
1. Go to Configuration → Data Sources
2. Add CloudWatch
3. Configure AWS credentials
4. Select region: us-east-1

**Dashboard Panels:**
- API Request Rate (line chart)
- Error Rate (gauge)
- Processing Time (histogram)
- Cost Tracking (line chart)
- Active Users (counter)

## Custom Metrics

**Track in Code:**
```javascript
const { CloudWatch } = require('@aws-sdk/client-cloudwatch');
const cloudwatch = new CloudWatch({ region: 'us-east-1' });

async function trackMetric(name, value) {
  await cloudwatch.putMetricData({
    Namespace: 'ContentAI',
    MetricData: [{
      MetricName: name,
      Value: value,
      Unit: 'Count',
      Timestamp: new Date()
    }]
  });
}

// Usage
await trackMetric('VideoProcessed', 1);
await trackMetric('ProcessingTime', 45);
```

## Cost Monitoring

**Daily Cost Check:**
```bash
aws ce get-cost-and-usage \
  --time-period Start=2026-02-26,End=2026-02-27 \
  --granularity DAILY \
  --metrics BlendedCost \
  --group-by Type=SERVICE
```

**Budget Alert:**
- Set $80 monthly budget
- Alert at 50% ($40)
- Alert at 80% ($64)
- Alert at 100% ($80)

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

## Alerts

**Email Alerts:**
- Error rate > 5%
- Latency > 2 seconds
- Daily cost > $10
- CPU usage > 80%
- Memory usage > 80%

**Slack Alerts:**
```javascript
const axios = require('axios');

async function sendSlackAlert(message) {
  await axios.post(process.env.SLACK_WEBHOOK, {
    text: `🚨 Alert: ${message}`
  });
}
```
