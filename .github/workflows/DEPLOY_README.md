# CD Deployment Workflow Documentation

This document explains the GitHub Actions CD workflow for deploying to production.

## Overview

The workflow automatically deploys your application to AWS EC2 when code is pushed to the `main` branch. It includes:

- ✅ CI workflow dependency check
- 🐳 Docker image building and pushing
- 🚀 Automated deployment to EC2
- 🏥 Health checks
- 🔄 Automatic rollback on failure
- 📢 Notifications (Slack, Email, GitHub)

## Required Secrets

Configure these secrets in your GitHub repository settings (`Settings > Secrets and variables > Actions`):

### Docker Hub (Option 1)
- `DOCKER_USERNAME` - Your Docker Hub username
- `DOCKER_PASSWORD` - Your Docker Hub password or access token

### AWS ECR (Option 2)
- `AWS_ACCESS_KEY_ID` - AWS access key with ECR permissions
- `AWS_SECRET_ACCESS_KEY` - AWS secret access key
- `AWS_REGION` - AWS region (e.g., `us-east-1`)
- `AWS_ACCOUNT_ID` - Your AWS account ID

### EC2 Deployment (Required)
- `EC2_SSH_KEY` - Private SSH key for EC2 access (entire key content)
- `EC2_HOST` - EC2 instance public IP or hostname
- `EC2_USER` - SSH username (usually `ec2-user` or `ubuntu`)
- `APP_URL` - Your application URL (e.g., `https://app.example.com`)

### Notifications (Optional)
- `SLACK_WEBHOOK_URL` - Slack incoming webhook URL
- `NOTIFICATION_EMAIL` - Email address for notifications
- `SMTP_SERVER` - SMTP server address
- `SMTP_PORT` - SMTP port (usually 587)
- `SMTP_USERNAME` - SMTP username
- `SMTP_PASSWORD` - SMTP password

## Workflow Steps

### 1. Wait for CI
Ensures the CI workflow passes before deployment begins.

### 2. Build and Push Docker Image
- Builds Docker image with caching
- Pushes to Docker Hub and/or AWS ECR
- Tags with commit SHA and timestamp
- Saves deployment metadata

### 3. Deploy to EC2
- Connects via SSH to EC2 instance
- Backs up current container
- Pulls and starts new container
- Keeps last 3 backup containers

### 4. Health Check
- Polls application health endpoint
- Retries up to 30 times (5 minutes)
- Triggers rollback if health check fails

### 5. Rollback (On Failure)
- Automatically triggered if deployment or health check fails
- Restores previous container
- Verifies rollback success

### 6. Notifications
- Sends status to Slack
- Sends email notification
- Creates GitHub deployment status

## Prerequisites

### EC2 Instance Setup

1. **Install Docker on EC2:**
```bash
# Amazon Linux 2
sudo yum update -y
sudo yum install docker -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

# Ubuntu
sudo apt-get update
sudo apt-get install docker.io -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ubuntu
```

2. **Configure SSH Access:**
```bash
# On your local machine, generate SSH key if needed
ssh-keygen -t ed25519 -C "github-actions-deploy"

# Copy public key to EC2
ssh-copy-id -i ~/.ssh/deploy_key.pub ec2-user@your-ec2-ip

# Add private key content to GitHub secret EC2_SSH_KEY
cat ~/.ssh/deploy_key
```

3. **Configure Security Group:**
- Allow inbound SSH (port 22) from GitHub Actions IPs
- Allow inbound HTTP (port 80) or HTTPS (port 443)
- Allow outbound traffic for Docker pulls

### Application Requirements

Your application must:

1. **Have a Dockerfile** in the repository root
2. **Expose a health endpoint** at `/health` that returns 200 OK
3. **Listen on port 3000** (or update the workflow port mapping)

Example health endpoint:
```javascript
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});
```

## Manual Deployment

Trigger deployment manually from GitHub Actions UI:
1. Go to Actions tab
2. Select "CD - Deploy to Production"
3. Click "Run workflow"
4. Select branch and run

## Rollback Procedure

### Automatic Rollback
The workflow automatically rolls back if:
- Deployment fails
- Health check fails after deployment

### Manual Rollback
To manually rollback to a previous version:

```bash
# SSH to EC2
ssh -i your-key.pem ec2-user@your-ec2-ip

# List backup containers
docker ps -a --filter "name=app-backup-"

# Stop current container
docker stop app
docker rm app

# Restore backup (replace timestamp)
docker rename app-backup-1234567890 app
docker start app

# Or pull specific image version
docker pull your-image:specific-tag
docker run -d --name app -p 80:3000 your-image:specific-tag
```

## Monitoring

### View Deployment Status
- GitHub Actions UI: Real-time logs
- GitHub Deployments: Repository > Environments > production
- Slack: Automated notifications
- Email: Deployment status emails

### Check Application Health
```bash
# From local machine
curl https://your-app-url/health

# From EC2
docker logs app
docker ps
```

## Troubleshooting

### Deployment Fails
1. Check GitHub Actions logs
2. Verify all secrets are configured
3. Ensure EC2 instance is accessible
4. Check Docker Hub/ECR credentials

### Health Check Fails
1. Verify `/health` endpoint exists
2. Check application logs: `docker logs app`
3. Ensure correct port mapping
4. Check EC2 security group rules

### SSH Connection Issues
1. Verify EC2_SSH_KEY secret format (include BEGIN/END lines)
2. Check EC2 security group allows SSH from GitHub IPs
3. Verify EC2_USER matches instance AMI default user

### Docker Pull Fails
1. Check Docker Hub/ECR credentials
2. Verify image name and tags
3. Ensure EC2 has internet access
4. Check Docker Hub rate limits

## Security Best Practices

1. **Use GitHub Environments** for production with required reviewers
2. **Rotate SSH keys** regularly
3. **Use IAM roles** instead of access keys when possible
4. **Enable Docker Content Trust** for image signing
5. **Scan images** for vulnerabilities before deployment
6. **Use secrets** for all sensitive data
7. **Limit SSH access** to specific IP ranges
8. **Enable CloudWatch** logging for EC2 instances

## Customization

### Change Deployment Target
Update the `deploy` job to target different platforms:
- Kubernetes: Use `kubectl` commands
- ECS: Use AWS ECS actions
- Lambda: Use serverless framework
- Other cloud providers: Adapt SSH commands

### Add Deployment Steps
Add steps before or after deployment:
- Database migrations
- Cache clearing
- CDN invalidation
- Smoke tests

### Modify Health Check
Adjust health check parameters in the workflow:
- `MAX_ATTEMPTS`: Number of retry attempts
- Sleep duration between attempts
- Health endpoint path

## Support

For issues or questions:
1. Check GitHub Actions logs
2. Review this documentation
3. Check EC2 instance logs
4. Contact DevOps team
