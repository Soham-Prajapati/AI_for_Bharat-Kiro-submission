#!/bin/bash

# AWS CloudWatch Monitoring Setup Script
# This script deploys dashboards, configures alarms, and sets up SNS topics

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION="${AWS_REGION:-us-east-1}"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
CRITICAL_EMAIL="${CRITICAL_EMAIL:-ops-critical@example.com}"
WARNING_EMAIL="${WARNING_EMAIL:-ops-warning@example.com}"

echo -e "${GREEN}=== AWS CloudWatch Monitoring Setup ===${NC}"
echo "Region: $AWS_REGION"
echo "Account ID: $ACCOUNT_ID"
echo ""

# Function to create SNS topic
create_sns_topic() {
    local topic_name=$1
    local email=$2
    
    echo -e "${YELLOW}Creating SNS topic: $topic_name${NC}"
    
    # Create topic
    topic_arn=$(aws sns create-topic \
        --name "$topic_name" \
        --region "$AWS_REGION" \
        --query 'TopicArn' \
        --output text)
    
    echo "Topic ARN: $topic_arn"
    
    # Subscribe email
    echo "Subscribing email: $email"
    aws sns subscribe \
        --topic-arn "$topic_arn" \
        --protocol email \
        --notification-endpoint "$email" \
        --region "$AWS_REGION"
    
    echo -e "${GREEN}✓ SNS topic created. Check $email for confirmation.${NC}"
    echo ""
    
    echo "$topic_arn"
}

# Function to deploy CloudWatch dashboard
deploy_dashboard() {
    echo -e "${YELLOW}Deploying CloudWatch Dashboard${NC}"
    
    # Read dashboard configuration
    dashboard_body=$(cat infrastructure/cloudwatch-dashboard.json | jq -c '.dashboardBody')
    dashboard_name=$(cat infrastructure/cloudwatch-dashboard.json | jq -r '.dashboardName')
    
    # Create dashboard
    aws cloudwatch put-dashboard \
        --dashboard-name "$dashboard_name" \
        --dashboard-body "$dashboard_body" \
        --region "$AWS_REGION"
    
    echo -e "${GREEN}✓ Dashboard deployed: $dashboard_name${NC}"
    echo "View at: https://console.aws.amazon.com/cloudwatch/home?region=$AWS_REGION#dashboards:name=$dashboard_name"
    echo ""
}

# Function to create CloudWatch alarms
create_alarms() {
    local critical_topic_arn=$1
    local warning_topic_arn=$2
    
    echo -e "${YELLOW}Creating CloudWatch Alarms${NC}"
    
    # Read alarms configuration
    alarms=$(cat infrastructure/cloudwatch-alarms.json | jq -c '.alarms[]')
    
    while IFS= read -r alarm; do
        alarm_name=$(echo "$alarm" | jq -r '.AlarmName')
        severity=$(echo "$alarm" | jq -r '.Severity')
        
        echo "Creating alarm: $alarm_name ($severity)"
        
        # Replace ACCOUNT_ID placeholder
        alarm_json=$(echo "$alarm" | sed "s/ACCOUNT_ID/$ACCOUNT_ID/g")
        
        # Replace SNS topic ARN based on severity
        if [ "$severity" = "CRITICAL" ]; then
            alarm_json=$(echo "$alarm_json" | jq --arg arn "$critical_topic_arn" '.AlarmActions = [$arn]')
        else
            alarm_json=$(echo "$alarm_json" | jq --arg arn "$warning_topic_arn" '.AlarmActions = [$arn]')
        fi
        
        # Remove Severity field (not part of AWS API)
        alarm_json=$(echo "$alarm_json" | jq 'del(.Severity)')
        
        # Create alarm
        metric_name=$(echo "$alarm_json" | jq -r '.MetricName')
        namespace=$(echo "$alarm_json" | jq -r '.Namespace')
        threshold=$(echo "$alarm_json" | jq -r '.Threshold')
        comparison=$(echo "$alarm_json" | jq -r '.ComparisonOperator')
        period=$(echo "$alarm_json" | jq -r '.Period')
        eval_periods=$(echo "$alarm_json" | jq -r '.EvaluationPeriods')
        description=$(echo "$alarm_json" | jq -r '.AlarmDescription')
        actions=$(echo "$alarm_json" | jq -r '.AlarmActions[0]')
        
        # Check if using ExtendedStatistic or Statistic
        if echo "$alarm_json" | jq -e '.ExtendedStatistic' > /dev/null; then
            statistic=$(echo "$alarm_json" | jq -r '.ExtendedStatistic')
            aws cloudwatch put-metric-alarm \
                --alarm-name "$alarm_name" \
                --alarm-description "$description" \
                --metric-name "$metric_name" \
                --namespace "$namespace" \
                --extended-statistic "$statistic" \
                --period "$period" \
                --evaluation-periods "$eval_periods" \
                --threshold "$threshold" \
                --comparison-operator "$comparison" \
                --alarm-actions "$actions" \
                --treat-missing-data notBreaching \
                --region "$AWS_REGION"
        else
            statistic=$(echo "$alarm_json" | jq -r '.Statistic')
            aws cloudwatch put-metric-alarm \
                --alarm-name "$alarm_name" \
                --alarm-description "$description" \
                --metric-name "$metric_name" \
                --namespace "$namespace" \
                --statistic "$statistic" \
                --period "$period" \
                --evaluation-periods "$eval_periods" \
                --threshold "$threshold" \
                --comparison-operator "$comparison" \
                --alarm-actions "$actions" \
                --treat-missing-data notBreaching \
                --region "$AWS_REGION"
        fi
        
        echo -e "${GREEN}✓ Alarm created: $alarm_name${NC}"
    done <<< "$alarms"
    
    echo ""
}

# Function to test alert triggering
test_alerts() {
    echo -e "${YELLOW}Testing Alert System${NC}"
    echo "This will trigger a test alarm to verify email delivery."
    echo ""
    
    # Create a test alarm with low threshold
    test_alarm_name="TEST-Alert-$(date +%s)"
    
    aws cloudwatch put-metric-alarm \
        --alarm-name "$test_alarm_name" \
        --alarm-description "Test alarm - safe to delete" \
        --metric-name "TestMetric" \
        --namespace "ContentCreatorPlatform/Test" \
        --statistic "Average" \
        --period 60 \
        --evaluation-periods 1 \
        --threshold 1 \
        --comparison-operator "GreaterThanThreshold" \
        --alarm-actions "$1" \
        --region "$AWS_REGION"
    
    echo "Test alarm created: $test_alarm_name"
    
    # Publish test metric to trigger alarm
    aws cloudwatch put-metric-data \
        --namespace "ContentCreatorPlatform/Test" \
        --metric-name "TestMetric" \
        --value 10 \
        --region "$AWS_REGION"
    
    echo -e "${GREEN}✓ Test metric published${NC}"
    echo "The alarm should trigger within 1-2 minutes."
    echo "Check your email for the alert notification."
    echo ""
    echo "To delete the test alarm:"
    echo "  aws cloudwatch delete-alarms --alarm-names $test_alarm_name --region $AWS_REGION"
    echo ""
}

# Function to display monitoring URLs
display_urls() {
    echo -e "${GREEN}=== Monitoring Setup Complete ===${NC}"
    echo ""
    echo "Dashboard URL:"
    echo "  https://console.aws.amazon.com/cloudwatch/home?region=$AWS_REGION#dashboards:name=ContentCreatorPlatform-Production"
    echo ""
    echo "Alarms URL:"
    echo "  https://console.aws.amazon.com/cloudwatch/home?region=$AWS_REGION#alarmsV2:"
    echo ""
    echo "Logs Insights URL:"
    echo "  https://console.aws.amazon.com/cloudwatch/home?region=$AWS_REGION#logsV2:logs-insights"
    echo ""
    echo "SNS Topics:"
    echo "  Critical: $1"
    echo "  Warning: $2"
    echo ""
    echo -e "${YELLOW}Important: Check your email and confirm SNS subscriptions!${NC}"
    echo ""
}

# Main execution
main() {
    echo "Starting monitoring setup..."
    echo ""
    
    # Step 1: Create SNS topics
    echo -e "${GREEN}Step 1: Creating SNS Topics${NC}"
    critical_topic_arn=$(create_sns_topic "critical-alerts" "$CRITICAL_EMAIL")
    warning_topic_arn=$(create_sns_topic "warning-alerts" "$WARNING_EMAIL")
    
    # Step 2: Deploy dashboard
    echo -e "${GREEN}Step 2: Deploying Dashboard${NC}"
    deploy_dashboard
    
    # Step 3: Create alarms
    echo -e "${GREEN}Step 3: Creating Alarms${NC}"
    create_alarms "$critical_topic_arn" "$warning_topic_arn"
    
    # Step 4: Test alerts (optional)
    read -p "Do you want to test alert delivery? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        test_alerts "$warning_topic_arn"
    fi
    
    # Display summary
    display_urls "$critical_topic_arn" "$warning_topic_arn"
    
    echo -e "${GREEN}✓ Monitoring setup complete!${NC}"
}

# Run main function
main
