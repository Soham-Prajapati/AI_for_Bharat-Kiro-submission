# 🚀 Deployment Guide

## Prerequisites

- Docker installed
- AWS account with $80 credits
- GitHub repository
- Domain name (optional)

## Docker Setup

**Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

**Build & Run:**
```bash
docker build -t content-ai .
docker run -p 3000:3000 content-ai
```

## Environment Variables

```bash
# .env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://...
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0
JWT_SECRET=...
API_KEY=...
```

## AWS ECS Deployment

**1. Push to ECR:**
```bash
aws ecr create-repository --repository-name content-ai
docker tag content-ai:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/content-ai:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/content-ai:latest
```

**2. Create ECS Task:**
```bash
aws ecs create-cluster --cluster-name content-ai-cluster
aws ecs register-task-definition --cli-input-json file://task-definition.json
```

**3. Deploy Service:**
```bash
aws ecs create-service \
  --cluster content-ai-cluster \
  --service-name content-ai-service \
  --task-definition content-ai:1 \
  --desired-count 1 \
  --launch-type FARGATE
```

## CI/CD with GitHub Actions

**.github/workflows/deploy.yml:**
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Build & Push
        run: |
          docker build -t content-ai .
          docker tag content-ai:latest $ECR_REGISTRY/content-ai:latest
          docker push $ECR_REGISTRY/content-ai:latest
      
      - name: Deploy to ECS
        run: |
          aws ecs update-service --cluster content-ai-cluster \
            --service content-ai-service --force-new-deployment
```

## Secrets Management

**Store in AWS Secrets Manager:**
```bash
aws secretsmanager create-secret \
  --name content-ai/prod \
  --secret-string '{"DATABASE_URL":"...","JWT_SECRET":"..."}'
```

**Access in code:**
```javascript
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager();

const secrets = await secretsManager.getSecretValue({
  SecretId: 'content-ai/prod'
}).promise();

const config = JSON.parse(secrets.SecretString);
```

## Health Checks

```javascript
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});
```

## Cost Optimization

- Use Fargate Spot (70% cheaper)
- Auto-scale based on CPU
- Cache with CloudFront
- Use S3 lifecycle policies

**Expected Costs:**
- ECS Fargate: $5-10/day
- Bedrock: $0.08/video
- S3: $1-2/day
- Total: ~$10-20 for testing
