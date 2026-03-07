# AWS CloudWatch Monitoring Guide

Comprehensive monitoring setup for the Content Creator Platform using AWS CloudWatch.

## Table of Contents

- [Quick Start - Deploy Monitoring](#quick-start---deploy-monitoring)
- [Dashboard Overview](#dashboard-overview)
- [Alert Configurations](#alert-configurations)
- [Metrics Glossary](#metrics-glossary)
- [Response Procedures](#response-procedures)
- [Troubleshooting Guide](#troubleshooting-guide)
- [Testing Alerts](#testing-alerts)

## Quick Start - Deploy Monitoring

### Prerequisites

- AWS CLI installed and configured
- `jq` installed (for JSON processing)
- AWS credentials with CloudWatch, SNS permissions
- Email addresses for alert notifications

### Deploy in 3 Steps

#### Step 1: Set Environment Variables

```bash
export AWS_REGION=us-east-1
export CRITICAL_EMAIL=ops-critical@example.com
export WARNING_EMAIL=ops-warning@example.com
```

#### Step 2: Run Setup Script

```bash
chmod +x infrastructure/setup-monitoring.sh
./infrastructure/setup-monitoring.sh
```

The script will:
1. ✓ Create SNS topics for critical and warning alerts
2. ✓ Deploy CloudWatch dashboard with 10 widgets
3. ✓ Create 10 CloudWatch alarms
4. ✓ Optionally test alert delivery

**Expected Duration**: 2-3 minutes

#### Step 3: Confirm Email Subscriptions

1. Check your email inbox for SNS subscription confirmations
2. Click "Confirm subscription" in each email (2 emails total)
3. Verify subscriptions are active:

```bash
aws sns list-subscriptions --region us-east-1
```

### Verify Deployment

```bash
# Check dashboard exists
aws cloudwatch list-dashboards --region us-east-1

# Check alarms are created
aws cloudwatch describe-alarms --region us-east-1 | grep AlarmName

# Test alert delivery (optional)
aws cloudwatch put-metric-data \
  --namespace "ContentCreatorPlatform/Test" \
  --metric-name "TestMetric" \
  --value 10 \
  --region us-east-1
```

### Access Monitoring

- **Dashboard**: https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=ContentCreatorPlatform-Production
- **Alarms**: https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#alarmsV2:
- **Logs**: https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:logs-insights

## Dashboard Overview

### Accessing the Dashboard

1. **AWS Console**: Navigate to CloudWatch → Dashboards → `ContentCreatorPlatform-Production`
2. **Direct URL**: `https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=ContentCreatorPlatform-Production`

### Dashboard Widgets

#### 1. API Latency (ms)
Tracks API response times at different percentiles:
- **P50**: Median response time (50% of requests)
- **P95**: 95th percentile (95% of requests faster than this)
- **P99**: 99th percentile (slowest 1% of requests)

**Normal Range**: P50 < 200ms, P95 < 1000ms, P99 < 2000ms

#### 2. Error Rate Tracking
Monitors HTTP errors:
- **5XX Errors**: Server-side errors (our fault)
- **4XX Errors**: Client-side errors (user/client fault)
- **Total Requests**: Overall request volume

**Normal Range**: Error rate < 1% of total requests

#### 3. Request Throughput
Total API requests per minute.

**Normal Range**: Varies by time of day; baseline 100-1000 req/min

#### 4. CPU and Memory Utilization
ECS container resource usage:
- **CPU %**: Processor utilization
- **Memory %**: RAM utilization

**Normal Range**: CPU < 70%, Memory < 75%

#### 5. Database Query Performance
RDS metrics:
- **Connections**: Active database connections
- **Read Latency**: Time to read from database
- **Write Latency**: Time to write to database

**Normal Range**: Connections < 80, Latency < 50ms

#### 6. S3 Upload/Download Metrics
Object storage operations:
- **Total Requests**: All S3 operations
- **Uploads**: PUT requests
- **Downloads**: GET requests
- **Errors**: 4XX and 5XX errors

**Normal Range**: Error rate < 0.5%

#### 7. Bedrock API Call Metrics
AI model invocations:
- **Total Calls**: Bedrock API invocations
- **Client Errors**: 4XX errors (bad requests)
- **Server Errors**: 5XX errors (Bedrock issues)
- **Latency**: Response time

**Normal Range**: Error rate < 2%, Latency < 5000ms

#### 8. Active User Sessions
User activity tracking:
- **Active Users**: Currently active sessions
- **New Sessions**: New logins/sessions
- **Avg Duration**: Average session length

**Normal Range**: Varies by time of day

#### 9. Recent Errors
Log query showing last 20 error messages from Lambda functions.

#### 10. Lambda Performance
Serverless function metrics:
- **Invocations**: Function calls
- **Errors**: Failed executions
- **Throttles**: Rate-limited calls
- **Duration**: Execution time

**Normal Range**: Error rate < 1%, Throttles = 0

## Alert Configurations

### Critical Alerts (Immediate Response Required)

#### 1. HighErrorRate-CRITICAL
- **Trigger**: Error rate > 5% for 10 minutes
- **Impact**: Users experiencing failures
- **Response Time**: < 5 minutes
- **SNS Topic**: `critical-alerts`

#### 2. BedrockHighFailureRate-CRITICAL
- **Trigger**: Bedrock failures > 10% for 10 minutes
- **Impact**: AI features unavailable
- **Response Time**: < 10 minutes
- **SNS Topic**: `critical-alerts`

#### 3. HealthCheckFailures-CRITICAL
- **Trigger**: Unhealthy hosts detected
- **Impact**: Service degradation or outage
- **Response Time**: < 5 minutes
- **SNS Topic**: `critical-alerts`

### Warning Alerts (Monitor and Plan Response)

#### 4. HighAPILatency-WARNING
- **Trigger**: P95 latency > 2 seconds for 10 minutes
- **Impact**: Slow user experience
- **Response Time**: < 30 minutes
- **SNS Topic**: `warning-alerts`

#### 5. HighCPUUtilization-WARNING
- **Trigger**: CPU > 80% for 5 minutes
- **Impact**: Performance degradation risk
- **Response Time**: < 30 minutes
- **SNS Topic**: `warning-alerts`

#### 6. HighMemoryUtilization-WARNING
- **Trigger**: Memory > 85% for 10 minutes
- **Impact**: Potential OOM crashes
- **Response Time**: < 30 minutes
- **SNS Topic**: `warning-alerts`

#### 7. S3UploadFailures-WARNING
- **Trigger**: S3 errors > 5% for 10 minutes
- **Impact**: Upload failures
- **Response Time**: < 30 minutes
- **SNS Topic**: `warning-alerts`

#### 8. DatabaseConnectionsHigh-WARNING
- **Trigger**: Connections > 80 for 10 minutes
- **Impact**: Connection pool exhaustion risk
- **Response Time**: < 30 minutes
- **SNS Topic**: `warning-alerts`

#### 9. LambdaThrottling-WARNING
- **Trigger**: > 10 throttles in 5 minutes
- **Impact**: Function execution delays
- **Response Time**: < 30 minutes
- **SNS Topic**: `warning-alerts`

#### 10. DiskSpaceHigh-WARNING
- **Trigger**: Free storage < 20% for 10 minutes
- **Impact**: Database write failures risk
- **Response Time**: < 1 hour
- **SNS Topic**: `warning-alerts`

## Metrics Glossary

### API Gateway Metrics

| Metric | Description | Unit |
|--------|-------------|------|
| `Latency` | Time from request to response | Milliseconds |
| `Count` | Total number of API requests | Count |
| `5XXError` | Server-side errors | Count |
| `4XXError` | Client-side errors | Count |

### ECS Metrics

| Metric | Description | Unit |
|--------|-------------|------|
| `CPUUtilization` | Percentage of CPU used | Percent |
| `MemoryUtilization` | Percentage of memory used | Percent |

### RDS Metrics

| Metric | Description | Unit |
|--------|-------------|------|
| `DatabaseConnections` | Active connections | Count |
| `ReadLatency` | Time to complete read operations | Milliseconds |
| `WriteLatency` | Time to complete write operations | Milliseconds |
| `FreeStorageSpace` | Available disk space | Percent |

### S3 Metrics

| Metric | Description | Unit |
|--------|-------------|------|
| `AllRequests` | Total S3 requests | Count |
| `PutRequests` | Upload operations | Count |
| `GetRequests` | Download operations | Count |
| `4xxErrors` | Client errors | Count |
| `5xxErrors` | Server errors | Count |

### Bedrock Metrics

| Metric | Description | Unit |
|--------|-------------|------|
| `Invocations` | Total API calls | Count |
| `InvocationClientErrors` | 4XX errors | Count |
| `InvocationServerErrors` | 5XX errors | Count |
| `InvocationLatency` | Response time | Milliseconds |

### Lambda Metrics

| Metric | Description | Unit |
|--------|-------------|------|
| `Invocations` | Function executions | Count |
| `Errors` | Failed executions | Count |
| `Throttles` | Rate-limited calls | Count |
| `Duration` | Execution time | Milliseconds |

### Custom Metrics

| Metric | Description | Unit |
|--------|-------------|------|
| `ActiveSessions` | Current active users | Count |
| `NewSessions` | New user sessions | Count |
| `SessionDuration` | Average session length | Minutes |

## Response Procedures

### Critical Alert Response

1. **Acknowledge Alert** (< 2 minutes)
   - Check Slack/email for alert details
   - Acknowledge in incident management system

2. **Assess Impact** (< 3 minutes)
   - Check dashboard for affected metrics
   - Verify user impact (error rates, latency)
   - Check recent deployments

3. **Immediate Actions** (< 5 minutes)
   - If recent deployment: Consider rollback
   - Check CloudWatch Logs for errors
   - Verify AWS service health dashboard

4. **Mitigation** (< 15 minutes)
   - Scale resources if needed
   - Restart unhealthy services
   - Enable maintenance mode if necessary

5. **Communication**
   - Notify team in Slack
   - Update status page
   - Document actions taken

6. **Post-Incident**
   - Write incident report
   - Schedule post-mortem
   - Implement preventive measures

### Warning Alert Response

1. **Review Alert** (< 10 minutes)
   - Check dashboard trends
   - Determine if issue is escalating

2. **Investigate** (< 20 minutes)
   - Review logs for patterns
   - Check resource utilization trends
   - Identify root cause

3. **Plan Action** (< 30 minutes)
   - Determine if immediate action needed
   - Schedule maintenance if required
   - Document findings

4. **Implement Fix**
   - Apply configuration changes
   - Scale resources if needed
   - Monitor for improvement

## Troubleshooting Guide

### High Error Rate

**Symptoms**: 5XX errors increasing

**Common Causes**:
- Database connection issues
- Bedrock API failures
- Memory exhaustion
- Dependency service outages

**Investigation Steps**:
```bash
# Check recent errors
aws logs tail /aws/lambda/content-generator --follow --filter-pattern "ERROR"

# Check ECS task health
aws ecs describe-tasks --cluster production --tasks <task-id>

# Check RDS connections
aws rds describe-db-instances --db-instance-identifier production-db
```

**Resolution**:
1. Check CloudWatch Logs for error patterns
2. Verify database connectivity
3. Check Bedrock service status
4. Restart affected services
5. Scale up if resource constrained

### High Latency

**Symptoms**: P95/P99 latency increasing

**Common Causes**:
- Database query performance
- High CPU/memory usage
- Network issues
- Bedrock API slowness

**Investigation Steps**:
```bash
# Check slow queries
aws rds describe-db-log-files --db-instance-identifier production-db

# Check ECS metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name CPUUtilization \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-01T01:00:00Z \
  --period 300 \
  --statistics Average
```

**Resolution**:
1. Identify slow database queries
2. Add database indexes if needed
3. Scale ECS tasks
4. Enable caching
5. Optimize Bedrock prompts

### High CPU/Memory

**Symptoms**: Resource utilization > 80%

**Common Causes**:
- Traffic spike
- Memory leak
- Inefficient code
- Background jobs

**Investigation Steps**:
```bash
# Check ECS task count
aws ecs describe-services --cluster production --services api-service

# Check recent deployments
aws ecs list-task-definitions --family-prefix api --sort DESC
```

**Resolution**:
1. Scale ECS tasks horizontally
2. Check for memory leaks in logs
3. Review recent code changes
4. Optimize resource-intensive operations

### Bedrock Failures

**Symptoms**: High Bedrock error rate

**Common Causes**:
- Rate limiting
- Invalid prompts
- Model unavailability
- Quota exceeded

**Investigation Steps**:
```bash
# Check Bedrock metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/Bedrock \
  --metric-name InvocationServerErrors \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-01T01:00:00Z \
  --period 300 \
  --statistics Sum

# Check service quotas
aws service-quotas get-service-quota \
  --service-code bedrock \
  --quota-code L-12345678
```

**Resolution**:
1. Implement exponential backoff
2. Check AWS service health
3. Request quota increase
4. Add fallback models
5. Implement caching

### S3 Upload Failures

**Symptoms**: High S3 error rate

**Common Causes**:
- Permissions issues
- Network problems
- File size limits
- Bucket policies

**Investigation Steps**:
```bash
# Check S3 bucket metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/S3 \
  --metric-name 5xxErrors \
  --dimensions Name=BucketName,Value=content-uploads \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-01T01:00:00Z \
  --period 300 \
  --statistics Sum

# Check bucket policy
aws s3api get-bucket-policy --bucket content-uploads
```

**Resolution**:
1. Verify IAM permissions
2. Check bucket policies
3. Verify CORS configuration
4. Check file size limits
5. Review network connectivity

## Testing Alerts

### Setup Monitoring

```bash
# Set environment variables
export AWS_REGION=us-east-1
export CRITICAL_EMAIL=ops-critical@example.com
export WARNING_EMAIL=ops-warning@example.com

# Run setup script
chmod +x infrastructure/setup-monitoring.sh
./infrastructure/setup-monitoring.sh
```

### Confirm SNS Subscriptions

1. Check your email for SNS subscription confirmations
2. Click "Confirm subscription" in each email
3. Verify subscriptions:

```bash
aws sns list-subscriptions-by-topic \
  --topic-arn arn:aws:sns:us-east-1:ACCOUNT_ID:critical-alerts
```

### Trigger Test Alerts

#### Method 1: Using Setup Script

The setup script includes an interactive test option:

```bash
./infrastructure/setup-monitoring.sh
# Answer 'y' when prompted to test alerts
```

#### Method 2: Manual Test Alarm

```bash
# Create test alarm
aws cloudwatch put-metric-alarm \
  --alarm-name "TEST-Alert" \
  --alarm-description "Test alarm - safe to delete" \
  --metric-name "TestMetric" \
  --namespace "ContentCreatorPlatform/Test" \
  --statistic "Average" \
  --period 60 \
  --evaluation-periods 1 \
  --threshold 1 \
  --comparison-operator "GreaterThanThreshold" \
  --alarm-actions "arn:aws:sns:us-east-1:ACCOUNT_ID:warning-alerts"

# Trigger alarm
aws cloudwatch put-metric-data \
  --namespace "ContentCreatorPlatform/Test" \
  --metric-name "TestMetric" \
  --value 10

# Wait 1-2 minutes, then check email

# Clean up
aws cloudwatch delete-alarms --alarm-names "TEST-Alert"
```

#### Method 3: Simulate High Error Rate

```bash
# Publish high error count
for i in {1..100}; do
  aws cloudwatch put-metric-data \
    --namespace "AWS/ApiGateway" \
    --metric-name "5XXError" \
    --value 1 \
    --timestamp $(date -u +%Y-%m-%dT%H:%M:%S)
  sleep 1
done
```

#### Method 4: Test Lambda Error Alert

```bash
# Invoke Lambda with error
aws lambda invoke \
  --function-name content-generator \
  --payload '{"error": true}' \
  /dev/null
```

### Verify Alert Delivery

1. **Check Email**: Look for alert notification
2. **Check SNS**: Verify message was published
   ```bash
   aws sns list-subscriptions
   ```
3. **Check CloudWatch**: Verify alarm state
   ```bash
   aws cloudwatch describe-alarms --alarm-names "TEST-Alert"
   ```

### Test Alert Response Time

```bash
# Record start time
START_TIME=$(date +%s)

# Trigger alert
aws cloudwatch put-metric-data \
  --namespace "ContentCreatorPlatform/Test" \
  --metric-name "TestMetric" \
  --value 10

# Wait for email
echo "Waiting for alert email..."
echo "Check your inbox and note the time received"

# Calculate response time
END_TIME=$(date +%s)
ELAPSED=$((END_TIME - START_TIME))
echo "Time elapsed: ${ELAPSED} seconds"
```

### Cleanup Test Resources

```bash
# Delete test alarms
aws cloudwatch delete-alarms \
  --alarm-names $(aws cloudwatch describe-alarms \
    --query 'MetricAlarms[?starts_with(AlarmName, `TEST-`)].AlarmName' \
    --output text)

# Delete test metrics (they expire automatically after 15 months)
```

## Best Practices

1. **Regular Reviews**: Check dashboard daily
2. **Alert Tuning**: Adjust thresholds based on patterns
3. **Documentation**: Keep runbooks updated
4. **Testing**: Test alerts monthly
5. **Escalation**: Define clear escalation paths
6. **Automation**: Automate common responses
7. **Post-Mortems**: Learn from incidents
8. **Capacity Planning**: Monitor trends for scaling

## Additional Resources

- [AWS CloudWatch Documentation](https://docs.aws.amazon.com/cloudwatch/)
- [CloudWatch Alarms Best Practices](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Best_Practice_Recommended_Alarms_AWS_Services.html)
- [SNS Email Notifications](https://docs.aws.amazon.com/sns/latest/dg/sns-email-notifications.html)
- [CloudWatch Logs Insights](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/AnalyzingLogData.html)

## Support

For monitoring issues or questions:
- **Slack**: #ops-monitoring
- **Email**: ops-team@example.com
- **On-Call**: PagerDuty rotation
