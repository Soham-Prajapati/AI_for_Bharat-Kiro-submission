# CI/CD Pipeline Verification Guide

## Overview

This document verifies the CI/CD pipeline configuration and provides testing procedures to ensure reliable deployments.

## CI Pipeline (.github/workflows/ci.yml)

### ✅ Verified Components

**Triggers:**
- ✅ Runs on push to `main` and `develop` branches
- ✅ Runs on pull requests to `main` and `develop` branches

**Jobs:**

1. **Lint Job**
   - ✅ Runs on Ubuntu latest
   - ✅ Uses Node.js 18
   - ✅ Caches npm dependencies
   - ✅ Runs `npm run lint`

2. **Test Job**
   - ✅ Runs on Ubuntu latest
   - ✅ Uses Node.js 18
   - ✅ Caches npm dependencies
   - ✅ Runs tests with coverage
   - ✅ Enforces 80% coverage threshold
   - ✅ Uploads coverage artifacts (30 day retention)

### Required Environment Variables

None required for CI - all dependencies installed from package.json

### Testing CI Pipeline

**Test on Pull Request:**
```bash
# Create a test branch
git checkout -b test/ci-pipeline

# Make a small change
echo "# CI Test" >> README.md

# Commit and push
git add README.md
git commit -m "test: verify CI pipeline"
git push origin test/ci-pipeline

# Create PR on GitHub
# Verify both lint and test jobs pass
```

**Expected Results:**
- ✅ Lint job completes in ~2-3 minutes
- ✅ Test job completes in ~3-5 minutes
- ✅ Coverage report uploaded to artifacts
- ✅ All checks pass before merge allowed

## CD Pipeline (.github/workflows/deploy.yml)

### ✅ Verified Components

**Triggers:**
- ✅ Runs on push to `main` branch
- ✅ Supports manual workflow dispatch

**Jobs:**

1. **Wait for CI**
   - ✅ Waits for CI workflow to complete
   - ✅ Blocks deployment if CI fails

2. **Build and Push**
   - ✅ Builds Docker image
   - ✅ Supports Docker Hub and AWS ECR
   - ✅ Tags with SHA, branch, timestamp
   - ✅ Uses build cache for faster builds
   - ✅ Saves deployment metadata

3. **Deploy**
   - ✅ Deploys to AWS EC2
   - ✅ Uses SSH for deployment
   - ✅ Implements blue-green deployment
   - ✅ Runs health checks
   - ✅ Automatic rollback on failure
   - ✅ Cleans up old containers

4. **Notify**
   - ✅ Sends Slack notifications
   - ✅ Sends email notifications
   - ✅ Creates GitHub deployment status

### Required Secrets

**Docker Hub (Optional):**
- `DOCKER_USERNAME` - Docker Hub username
- `DOCKER_PASSWORD` - Docker Hub password/token

**AWS (Required):**
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `AWS_REGION` - AWS region (e.g., us-east-1)
- `AWS_ACCOUNT_ID` - AWS account ID

**EC2 Deployment (Required):**
- `EC2_HOST` - EC2 instance public IP/hostname
- `EC2_USER` - SSH user (e.g., ubuntu, ec2-user)
- `EC2_SSH_KEY` - Private SSH key for EC2 access
- `APP_URL` - Application URL for health checks

**Notifications (Optional):**
- `SLACK_WEBHOOK_URL` - Slack incoming webhook URL
- `NOTIFICATION_EMAIL` - Email for deployment notifications
- `SMTP_SERVER` - SMTP server address
- `SMTP_PORT` - SMTP port (587 for TLS)
- `SMTP_USERNAME` - SMTP username
- `SMTP_PASSWORD` - SMTP password

### Setting Up Secrets

**Via GitHub UI:**
1. Go to repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add each secret with its value

**Via GitHub CLI:**
```bash
# Install GitHub CLI
brew install gh  # macOS
# or
sudo apt install gh  # Ubuntu

# Authenticate
gh auth login

# Set secrets
gh secret set AWS_ACCESS_KEY_ID
gh secret set AWS_SECRET_ACCESS_KEY
gh secret set AWS_REGION -b "us-east-1"
gh secret set EC2_HOST
gh secret set EC2_USER -b "ubuntu"
gh secret set EC2_SSH_KEY < ~/.ssh/deploy_key
gh secret set APP_URL -b "https://api.example.com"
```

### Testing Deployment Pipeline

**1. Test Build Locally:**
```bash
# Build Docker image
docker build -t content-intelligence-platform:test .

# Run container
docker run -d -p 3000:3000 \
  -e NODE_ENV=production \
  --name test-app \
  content-intelligence-platform:test

# Test health endpoint
curl http://localhost:3000/health

# Clean up
docker stop test-app
docker rm test-app
```

**2. Test Deployment with Dummy Commit:**
```bash
# Create deployment test branch
git checkout main
git pull origin main

# Make a dummy change
echo "# Deployment Test $(date)" >> DEPLOYMENT_TEST.md

# Commit and push
git add DEPLOYMENT_TEST.md
git commit -m "test: verify deployment pipeline"
git push origin main

# Monitor deployment
# Go to: https://github.com/YOUR_ORG/YOUR_REPO/actions
```

**3. Verify Deployment:**
```bash
# Check application is running
curl https://your-app-url.com/health

# Check Docker container on EC2
ssh -i ~/.ssh/deploy_key ubuntu@your-ec2-host "docker ps"

# Check logs
ssh -i ~/.ssh/deploy_key ubuntu@your-ec2-host "docker logs app"
```

**4. Test Rollback:**
```bash
# Manually trigger rollback by stopping the app
ssh -i ~/.ssh/deploy_key ubuntu@your-ec2-host "docker stop app"

# Deploy again - should trigger rollback
git commit --allow-empty -m "test: trigger rollback"
git push origin main

# Verify rollback worked
curl https://your-app-url.com/health
```

## Deployment Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Push to main branch                      │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    CI Workflow Triggered                     │
│  ┌──────────────┐              ┌──────────────┐            │
│  │  Lint Job    │              │  Test Job    │            │
│  │  - ESLint    │              │  - Unit      │            │
│  │  - Format    │              │  - Coverage  │            │
│  └──────────────┘              └──────────────┘            │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │  CI Passed?    │
                    └────┬───────┬───┘
                         │       │
                    Yes  │       │  No
                         │       │
                         │       └──────────► Stop (PR blocked)
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   CD Workflow Triggered                      │
│                                                              │
│  Step 1: Wait for CI ✓                                      │
│  Step 2: Build Docker Image                                 │
│  Step 3: Push to Registry (Docker Hub / ECR)               │
│  Step 4: Deploy to EC2                                      │
│          - Pull new image                                    │
│          - Backup current container                          │
│          - Start new container                               │
│  Step 5: Health Check                                        │
│          - Test /health endpoint                             │
│          - Verify 200 response                               │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │ Health Check   │
                    │   Passed?      │
                    └────┬───────┬───┘
                         │       │
                    Yes  │       │  No
                         │       │
                         │       └──────────► Rollback
                         │                    - Stop new container
                         │                    - Restore backup
                         │                    - Verify health
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Deployment Success                        │
│  - Send Slack notification                                   │
│  - Send email notification                                   │
│  - Create GitHub deployment status                           │
│  - Clean up old containers                                   │
└─────────────────────────────────────────────────────────────┘
```

## Environment-Specific Deployments

### Staging Environment (Recommended)

Add a staging deployment workflow:

```yaml
# .github/workflows/deploy-staging.yml
name: Deploy to Staging

on:
  push:
    branches: [develop]

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    environment:
      name: staging
      url: ${{ secrets.STAGING_APP_URL }}
    steps:
      # Similar to production deploy but with staging secrets
      - name: Deploy to Staging EC2
        run: |
          # Deploy to staging server
          ssh -i ~/.ssh/staging_key ${{ secrets.STAGING_EC2_USER }}@${{ secrets.STAGING_EC2_HOST }} \
            "docker pull ${{ env.DOCKER_IMAGE_NAME }}:develop && \
             docker stop app-staging || true && \
             docker rm app-staging || true && \
             docker run -d --name app-staging -p 80:3000 ${{ env.DOCKER_IMAGE_NAME }}:develop"
```

**Staging Secrets:**
- `STAGING_EC2_HOST`
- `STAGING_EC2_USER`
- `STAGING_EC2_SSH_KEY`
- `STAGING_APP_URL`

### Environment Variables Configuration

**Production Environment Variables:**
```bash
# On EC2 instance, create .env file
cat > /home/ubuntu/.env << EOF
NODE_ENV=production
PORT=3000
AWS_REGION=us-east-1
S3_BUCKET=content-intelligence-platform
DYNAMODB_TABLE=content-cache
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
API_SECRET=$(openssl rand -base64 32)
ALLOWED_ORIGINS=https://yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
EOF

# Update deploy workflow to use .env file
docker run -d \
  --name app \
  --restart unless-stopped \
  -p 80:3000 \
  --env-file /home/ubuntu/.env \
  ${{ env.DOCKER_IMAGE_NAME }}:latest
```

## Monitoring Deployments

### GitHub Actions Dashboard

Monitor deployments at:
```
https://github.com/YOUR_ORG/YOUR_REPO/actions
```

### Deployment Metrics

Track these metrics:
- Deployment frequency (how often)
- Deployment duration (how long)
- Deployment success rate (%)
- Mean time to recovery (MTTR)
- Rollback frequency

### Deployment Logs

**View workflow logs:**
```bash
# Using GitHub CLI
gh run list --workflow=deploy.yml
gh run view RUN_ID --log
```

**View application logs on EC2:**
```bash
ssh -i ~/.ssh/deploy_key ubuntu@your-ec2-host "docker logs -f app"
```

## Troubleshooting

### Deployment Fails at Build Step

**Issue:** Docker build fails

**Solution:**
```bash
# Check Dockerfile syntax
docker build -t test .

# Check for missing dependencies
npm install

# Verify TypeScript compiles
npm run build
```

### Deployment Fails at Health Check

**Issue:** Health check returns non-200 status

**Solution:**
```bash
# SSH to EC2 and check logs
ssh -i ~/.ssh/deploy_key ubuntu@your-ec2-host

# Check container status
docker ps -a

# Check container logs
docker logs app

# Check if port is accessible
curl localhost:3000/health

# Check environment variables
docker exec app env
```

### Rollback Fails

**Issue:** Rollback doesn't restore service

**Solution:**
```bash
# Manually restore from backup
ssh -i ~/.ssh/deploy_key ubuntu@your-ec2-host

# Find backup container
docker ps -a | grep app-backup

# Restore manually
docker stop app
docker rm app
docker rename app-backup-TIMESTAMP app
docker start app

# Verify
curl localhost:3000/health
```

### SSH Connection Fails

**Issue:** Cannot connect to EC2

**Solution:**
```bash
# Verify SSH key is correct
cat ~/.ssh/deploy_key

# Test SSH connection locally
ssh -i ~/.ssh/deploy_key ubuntu@your-ec2-host

# Check EC2 security group allows SSH from GitHub Actions IPs
# GitHub Actions IP ranges: https://api.github.com/meta

# Verify EC2 instance is running
aws ec2 describe-instances --instance-ids i-xxxxx
```

## Best Practices

### 1. Always Test Locally First
```bash
# Build and test before pushing
npm run build
npm test
docker build -t test .
docker run -p 3000:3000 test
```

### 2. Use Feature Flags
```javascript
// Enable gradual rollout
const features = {
  newFeature: process.env.FEATURE_NEW_FEATURE === 'true'
};

if (features.newFeature) {
  // New code path
} else {
  // Old code path
}
```

### 3. Monitor After Deployment
- Watch error rates for 30 minutes
- Check response times
- Monitor resource usage
- Review logs for errors

### 4. Document Changes
```bash
# Good commit message
git commit -m "feat: add video transcription caching

- Cache transcription results in DynamoDB
- Reduce Bedrock API calls by 80%
- Add cache invalidation endpoint

Closes #123"
```

### 5. Maintain Rollback Capability
- Keep last 3 container backups
- Document rollback procedure
- Test rollback regularly
- Have manual rollback plan

## Security Checklist

- [ ] All secrets stored in GitHub Secrets (not in code)
- [ ] SSH keys have restricted permissions (600)
- [ ] EC2 security group limits SSH to necessary IPs
- [ ] Docker images scanned for vulnerabilities
- [ ] Environment variables validated before deployment
- [ ] HTTPS enforced for all endpoints
- [ ] Secrets rotated regularly (every 90 days)

## Performance Optimization

### Faster Builds
```dockerfile
# Use build cache
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Smaller final image
FROM node:18-alpine
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
```

### Faster Deployments
- Use Docker layer caching
- Minimize image size
- Use CDN for static assets
- Implement health check timeout

---

**Last Updated:** 2026-02-27  
**Maintained By:** DevOps Team  
**Next Review:** 2026-03-27
