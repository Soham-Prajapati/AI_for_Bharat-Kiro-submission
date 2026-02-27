# 🚀 Deployment Guide

## Prerequisites
- AWS EC2 instance running
- Docker installed on EC2
- SSH access configured
- `.env` file on EC2 at `/home/ec2-user/.env`

## Environment Variables
```bash
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
PORT=3000
```

## Deploy Backend

### Option 1: EC2 Deployment
```bash
# Set EC2 host
export EC2_HOST="ec2-user@your-instance.compute.amazonaws.com"

# Deploy
./scripts/deploy.sh
```

### Option 2: Local Testing
```bash
# Build
./scripts/build.sh

# Run
docker run -p 3000:3000 --env-file .env content-intelligence-backend
```

## Verify Deployment
```bash
curl http://your-instance:3000/health
```

## Rollback
```bash
ssh $EC2_HOST
docker stop content-intelligence-backend
docker start content-intelligence-backend-previous
```
