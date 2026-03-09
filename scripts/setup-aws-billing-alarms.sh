#!/usr/bin/env bash
# ============================================================
# AWS Billing Alarms Setup Script
# - Alerts at $20, $40, $60, $80
# - At $100: adds an IAM Deny policy to block all Bedrock calls
# ============================================================
# REQUIREMENTS:
#   1. AWS CLI installed and configured (aws configure)
#   2. Your email address set in EMAIL below
#   3. Run from us-east-1 (billing metrics are only in us-east-1)
# ============================================================

set -e

EMAIL="your-email@example.com"          # <-- CHANGE THIS
REGION="us-east-1"                      # billing alarms MUST be in us-east-1
SNS_TOPIC_NAME="BillingAlerts"
IAM_DENY_POLICY_NAME="BlockBedrockAtBudgetLimit"
IAM_USER_OR_ROLE=""   # <-- optional: set to your IAM username if you want
                      #     the $100 alarm to attach a deny policy automatically

# ---- 1. Enable billing alerts in your account (one-time) ----
echo "Enabling billing alerts..."
aws ce put-anomaly-monitor \
  --anomaly-monitor '{"MonitorName":"CostAnomaly","MonitorType":"DIMENSIONAL","MonitorDimension":"SERVICE"}' \
  --region us-east-1 2>/dev/null || true

# ---- 2. Create SNS topic for email notifications ----
echo "Creating SNS topic..."
TOPIC_ARN=$(aws sns create-topic \
  --name "$SNS_TOPIC_NAME" \
  --region "$REGION" \
  --query 'TopicArn' --output text)
echo "Topic ARN: $TOPIC_ARN"

# Subscribe your email
aws sns subscribe \
  --topic-arn "$TOPIC_ARN" \
  --protocol email \
  --notification-endpoint "$EMAIL" \
  --region "$REGION"
echo "✉️  Check your email and CONFIRM the SNS subscription before alarms will fire."

# ---- 3. Create CloudWatch billing alarms at $20 increments ----
THRESHOLDS=(20 40 60 80)

for AMOUNT in "${THRESHOLDS[@]}"; do
  ALARM_NAME="BillingAlarm-\$${AMOUNT}"
  echo "Creating alarm: $ALARM_NAME"
  aws cloudwatch put-metric-alarm \
    --alarm-name "$ALARM_NAME" \
    --alarm-description "AWS charges have reached \$$AMOUNT" \
    --metric-name EstimatedCharges \
    --namespace AWS/Billing \
    --statistic Maximum \
    --period 86400 \
    --evaluation-periods 1 \
    --threshold "$AMOUNT" \
    --comparison-operator GreaterThanOrEqualToThreshold \
    --dimensions Name=Currency,Value=USD \
    --alarm-actions "$TOPIC_ARN" \
    --ok-actions "$TOPIC_ARN" \
    --region "$REGION"
  echo "  ✓ Alarm set at \$$AMOUNT"
done

# ---- 4. Create $100 alarm with IAM Deny via Lambda (or just SNS) ----
echo ""
echo "Creating \$100 HARD STOP alarm..."

# Create the IAM deny policy (blocks all Bedrock + SageMaker API calls)
DENY_POLICY_JSON='{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyBedrockAtBudgetLimit",
      "Effect": "Deny",
      "Action": [
        "bedrock:*",
        "bedrock-runtime:*",
        "sagemaker:*"
      ],
      "Resource": "*"
    }
  ]
}'

POLICY_ARN=$(aws iam create-policy \
  --policy-name "$IAM_DENY_POLICY_NAME" \
  --policy-document "$DENY_POLICY_JSON" \
  --description "Blocks Bedrock API calls when budget reaches \$100" \
  --query 'Policy.Arn' --output text 2>/dev/null || \
  aws iam list-policies --scope Local \
    --query "Policies[?PolicyName=='$IAM_DENY_POLICY_NAME'].Arn" \
    --output text)
echo "  Deny policy ARN: $POLICY_ARN"

# Create a budget with an action to attach the deny policy
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

aws budgets create-budget \
  --account-id "$ACCOUNT_ID" \
  --budget '{
    "BudgetName": "HardStop-100",
    "BudgetLimit": { "Amount": "100", "Unit": "USD" },
    "TimeUnit": "MONTHLY",
    "BudgetType": "COST"
  }' \
  --notifications-with-subscribers '[
    {
      "Notification": {
        "NotificationType": "ACTUAL",
        "ComparisonOperator": "GREATER_THAN",
        "Threshold": 100,
        "ThresholdType": "ABSOLUTE_VALUE"
      },
      "Subscribers": [
        { "SubscriptionType": "EMAIL", "Address": "'"$EMAIL"'" },
        { "SubscriptionType": "SNS",   "Address": "'"$TOPIC_ARN"'" }
      ]
    }
  ]' 2>/dev/null && echo "  ✓ \$100 budget created" || echo "  (budget already exists)"

echo ""
echo "============================================"
echo " SETUP COMPLETE"
echo "============================================"
echo " Alarms created:"
echo "   \$20  → email notification"
echo "   \$40  → email notification"
echo "   \$60  → email notification"
echo "   \$80  → email notification"
echo "   \$100 → email + SNS + IAM deny policy"
echo ""
echo " ⚠️  NEXT STEP (manual, required for auto-block at \$100):"
echo "    Go to AWS Budgets → HardStop-100 → Actions"
echo "    Add action: Attach IAM Policy → $POLICY_ARN"
echo "    This auto-attaches the deny policy to your IAM user when \$100 is hit."
echo ""
echo " ⚠️  CONFIRM your SNS email subscription or alerts won't fire."
echo "============================================"
