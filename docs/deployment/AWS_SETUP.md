# ☁️ AWS Setup Guide

## Step 1: IAM Roles

**Create ECS Task Role:**
```bash
aws iam create-role --role-name ContentAI-ECS-TaskRole \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"Service": "ecs-tasks.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }]
  }'
```

**Attach Policies:**
```bash
aws iam attach-role-policy --role-name ContentAI-ECS-TaskRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonBedrockFullAccess

aws iam attach-role-policy --role-name ContentAI-ECS-TaskRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

aws iam attach-role-policy --role-name ContentAI-ECS-TaskRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess
```

## Step 2: S3 Buckets

**Create Bucket:**
```bash
aws s3 mb s3://content-ai-uploads --region us-east-1

aws s3api put-bucket-versioning \
  --bucket content-ai-uploads \
  --versioning-configuration Status=Enabled

aws s3api put-bucket-encryption \
  --bucket content-ai-uploads \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'
```

**Set Lifecycle Policy:**
```bash
aws s3api put-bucket-lifecycle-configuration \
  --bucket content-ai-uploads \
  --lifecycle-configuration '{
    "Rules": [{
      "Id": "DeleteOldFiles",
      "Status": "Enabled",
      "Expiration": {"Days": 30}
    }]
  }'
```

## Step 3: DynamoDB Tables

**Create Content Table:**
```bash
aws dynamodb create-table \
  --table-name content \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=userId,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
  --global-secondary-indexes '[{
    "IndexName": "userId-index",
    "KeySchema": [{"AttributeName":"userId","KeyType":"HASH"}],
    "Projection": {"ProjectionType":"ALL"},
    "ProvisionedThroughput": {"ReadCapacityUnits":5,"WriteCapacityUnits":5}
  }]' \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
```

## Step 4: Bedrock Access

**Enable Bedrock:**
```bash
aws bedrock list-foundation-models --region us-east-1
```

**Request Model Access:**
1. Go to AWS Console → Bedrock
2. Click "Model access"
3. Request access to Claude 3.5 Sonnet
4. Wait for approval (~5 minutes)

## Step 5: VPC Configuration

**Create VPC:**
```bash
aws ec2 create-vpc --cidr-block 10.0.0.0/16

aws ec2 create-subnet --vpc-id vpc-xxx \
  --cidr-block 10.0.1.0/24 --availability-zone us-east-1a

aws ec2 create-subnet --vpc-id vpc-xxx \
  --cidr-block 10.0.2.0/24 --availability-zone us-east-1b
```

**Create Security Group:**
```bash
aws ec2 create-security-group \
  --group-name content-ai-sg \
  --description "Content AI Security Group" \
  --vpc-id vpc-xxx

aws ec2 authorize-security-group-ingress \
  --group-id sg-xxx \
  --protocol tcp --port 3000 --cidr 0.0.0.0/0
```

## Step 6: Load Balancer

**Create ALB:**
```bash
aws elbv2 create-load-balancer \
  --name content-ai-alb \
  --subnets subnet-xxx subnet-yyy \
  --security-groups sg-xxx

aws elbv2 create-target-group \
  --name content-ai-targets \
  --protocol HTTP --port 3000 \
  --vpc-id vpc-xxx --target-type ip
```

## Cost Tracking

**Set Budget Alert:**
```bash
aws budgets create-budget \
  --account-id 123456789 \
  --budget '{
    "BudgetName": "ContentAI-Budget",
    "BudgetLimit": {"Amount": "80", "Unit": "USD"},
    "TimeUnit": "MONTHLY",
    "BudgetType": "COST"
  }' \
  --notifications-with-subscribers '[{
    "Notification": {
      "NotificationType": "ACTUAL",
      "ComparisonOperator": "GREATER_THAN",
      "Threshold": 80
    },
    "Subscribers": [{
      "SubscriptionType": "EMAIL",
      "Address": "your-email@example.com"
    }]
  }]'
```

## Verify Setup

```bash
# Check IAM role
aws iam get-role --role-name ContentAI-ECS-TaskRole

# Check S3 bucket
aws s3 ls s3://content-ai-uploads

# Check DynamoDB table
aws dynamodb describe-table --table-name content

# Check Bedrock access
aws bedrock list-foundation-models --region us-east-1
```
