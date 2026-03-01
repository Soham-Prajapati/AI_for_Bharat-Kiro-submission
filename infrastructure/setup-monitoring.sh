#!/bin/bash

# CloudWatch Monitoring Setup Script
# This script sets up CloudWatch dashboards, alarms, and SNS notifications

set -e

# Configuration
AWS_REGION="${AWS_REGION:-us-east-1}"
SNS_TOPIC_NAME="content-intelligence-alerts"
EMAIL_ENDPOINT="${ALERT_EMAIL:-admin@example.com}"
DASHBOARD_FILE="infrastructure/cloudwatch-dashboard.json"
ALARMS_FILE="infrastructure/cloudwatch-alarms.json"

echo "🚀 Setting up CloudWatch Monitoring..."
echo "Region: $AWS_REGION"
echo "Alert Email: $EMAIL_ENDPOINT"

# Step 1: Create SNS Topic for Alerts
echo ""
echo "📧 Creating SNS topic for alerts..."
SNS_TOPIC_ARN=$(aws sns create-topic \
  --name "$SNS_TOPIC_NAME" \
  --region "$AWS_REGION" \
  --query 'TopicArn' \
  --output text)

echo "✅ SNS Topic created: $SNS_TOPIC_ARN"

# Step 2: Subscribe email to SNS topic
echo ""
echo "📬 Subscribing email to SNS topic..."
aws sns subscribe \
  --topic-arn "$SNS_TOPIC_ARN" \
  --protocol email \
  --notification-endpoint "$EMAIL_ENDPOINT" \
  --region "$AWS_REGION"

echo "✅ Email subscription created. Please check your email and confirm the subscription!"

# Step 3: Get AWS Account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo ""
echo "📋 AWS Account ID: $AWS_ACCOUNT_ID"

# Step 4: Create CloudWatch Dashboard
echo ""
echo "📊 Creating CloudWatch Dashboard..."

# Read dashboard JSON and create it
DASHBOARD_NAME=$(jq -r '.dashboardName' "$DASHBOARD_FILE")
DASHBOARD_BODY=$(jq -c '.dashboardBody' "$DASHBOARD_FILE")

aws cloudwatch put-dashboard \
  --dashboard-name "$DASHBOARD_NAME" \
  --dashboard-body "$DASHBOARD_BODY" \
  --region "$AWS_REGION"

echo "✅ Dashboard created: $DASHBOARD_NAME"
echo "   View at: https://console.aws.amazon.com/cloudwatch/home?region=$AWS_REGION#dashboards:name=$DASHBOARD_NAME"

# Step 5: Create CloudWatch Alarms
echo ""
echo "🚨 Creating CloudWatch Alarms..."

# Read alarms from JSON and create each one
jq -c '.alarms[]' "$ALARMS_FILE" | while read -r alarm; do
  ALARM_NAME=$(echo "$alarm" | jq -r '.AlarmName')
  
  # Replace ACCOUNT_ID placeholder with actual account ID
  alarm=$(echo "$alarm" | sed "s/ACCOUNT_ID/$AWS_ACCOUNT_ID/g")
  
  # Extract alarm properties
  ALARM_DESC=$(echo "$alarm" | jq -r '.AlarmDescription')
  METRIC_NAME=$(echo "$alarm" | jq -r '.MetricName')
  NAMESPACE=$(echo "$alarm" | jq -r '.Namespace')
  STATISTIC=$(echo "$alarm" | jq -r '.Statistic')
  PERIOD=$(echo "$alarm" | jq -r '.Period')
  EVAL_PERIODS=$(echo "$alarm" | jq -r '.EvaluationPeriods')
  THRESHOLD=$(echo "$alarm" | jq -r '.Threshold')
  COMPARISON=$(echo "$alarm" | jq -r '.ComparisonOperator')
  TREAT_MISSING=$(echo "$alarm" | jq -r '.TreatMissingData')
  
  echo "  Creating alarm: $ALARM_NAME"
  
  # Build alarm command
  aws cloudwatch put-metric-alarm \
    --alarm-name "$ALARM_NAME" \
    --alarm-description "$ALARM_DESC" \
    --metric-name "$METRIC_NAME" \
    --namespace "$NAMESPACE" \
    --statistic "$STATISTIC" \
    --period "$PERIOD" \
    --evaluation-periods "$EVAL_PERIODS" \
    --threshold "$THRESHOLD" \
    --comparison-operator "$COMPARISON" \
    --treat-missing-data "$TREAT_MISSING" \
    --alarm-actions "$SNS_TOPIC_ARN" \
    --region "$AWS_REGION"
  
  echo "  ✅ Alarm created: $ALARM_NAME"
done

# Step 6: Create Log Group (if not exists)
echo ""
echo "📝 Creating CloudWatch Log Group..."
LOG_GROUP_NAME="/aws/ecs/content-intelligence-platform"

aws logs create-log-group \
  --log-group-name "$LOG_GROUP_NAME" \
  --region "$AWS_REGION" 2>/dev/null || echo "  Log group already exists"

# Set retention policy (30 days)
aws logs put-retention-policy \
  --log-group-name "$LOG_GROUP_NAME" \
  --retention-in-days 30 \
  --region "$AWS_REGION"

echo "✅ Log group configured: $LOG_GROUP_NAME (30 day retention)"

# Step 7: Create Metric Filters for Custom Metrics
echo ""
echo "📈 Creating Metric Filters..."

# Error rate metric filter
aws logs put-metric-filter \
  --log-group-name "$LOG_GROUP_NAME" \
  --filter-name "ErrorCount" \
  --filter-pattern "[time, request_id, level = ERROR*, ...]" \
  --metric-transformations \
    metricName=ErrorCount,metricNamespace=ContentIntelligence,metricValue=1,defaultValue=0 \
  --region "$AWS_REGION"

echo "  ✅ Metric filter created: ErrorCount"

# API latency metric filter
aws logs put-metric-filter \
  --log-group-name "$LOG_GROUP_NAME" \
  --filter-name "APILatency" \
  --filter-pattern "[time, request_id, level, msg, duration]" \
  --metric-transformations \
    metricName=APILatency,metricNamespace=ContentIntelligence,metricValue='$duration',unit=Milliseconds \
  --region "$AWS_REGION"

echo "  ✅ Metric filter created: APILatency"

# Step 8: Summary
echo ""
echo "✨ CloudWatch Monitoring Setup Complete!"
echo ""
echo "📊 Dashboard: https://console.aws.amazon.com/cloudwatch/home?region=$AWS_REGION#dashboards:name=$DASHBOARD_NAME"
echo "🚨 Alarms: https://console.aws.amazon.com/cloudwatch/home?region=$AWS_REGION#alarmsV2:"
echo "📝 Logs: https://console.aws.amazon.com/cloudwatch/home?region=$AWS_REGION#logsV2:log-groups/log-group/$LOG_GROUP_NAME"
echo ""
echo "⚠️  IMPORTANT: Check your email ($EMAIL_ENDPOINT) and confirm the SNS subscription!"
echo ""
echo "Next steps:"
echo "  1. Confirm SNS email subscription"
echo "  2. Test alarms with: aws cloudwatch set-alarm-state --alarm-name ContentIntelligence-HighErrorRate --state-value ALARM --state-reason 'Testing'"
echo "  3. Deploy application with CloudWatch logging enabled"
echo "  4. Monitor dashboard for metrics"
