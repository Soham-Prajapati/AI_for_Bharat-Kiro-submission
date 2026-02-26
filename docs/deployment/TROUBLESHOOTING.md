# 🔧 Troubleshooting Guide

## Container Issues

### Container Won't Start

**Check logs:**
```bash
docker logs content-ai
aws ecs describe-tasks --cluster content-ai-cluster --tasks task-id
```

**Common causes:**
- Missing environment variables
- Port already in use
- Insufficient memory
- Invalid Dockerfile

**Fix:**
```bash
# Check env vars
docker run --env-file .env content-ai

# Use different port
docker run -p 3001:3000 content-ai

# Increase memory
docker run --memory=2g content-ai
```

### Container Crashes

**Check exit code:**
```bash
docker inspect content-ai --format='{{.State.ExitCode}}'
```

**Exit codes:**
- `0` - Normal exit
- `1` - Application error
- `137` - Out of memory (OOM)
- `139` - Segmentation fault

**Fix OOM:**
```bash
# Increase memory limit
docker run --memory=4g content-ai
```

## AWS Connectivity

### Cannot Connect to Bedrock

**Error:** `AccessDeniedException`

**Fix:**
```bash
# Check IAM permissions
aws iam get-role-policy --role-name ContentAI-ECS-TaskRole

# Request model access
# Go to AWS Console → Bedrock → Model access
```

### S3 Upload Fails

**Error:** `Access Denied`

**Fix:**
```bash
# Check bucket policy
aws s3api get-bucket-policy --bucket content-ai-uploads

# Add CORS if needed
aws s3api put-bucket-cors --bucket content-ai-uploads \
  --cors-configuration file://cors.json
```

### DynamoDB Throttling

**Error:** `ProvisionedThroughputExceededException`

**Fix:**
```bash
# Increase capacity
aws dynamodb update-table --table-name content \
  --provisioned-throughput ReadCapacityUnits=10,WriteCapacityUnits=10

# Or enable auto-scaling
aws application-autoscaling register-scalable-target \
  --service-namespace dynamodb \
  --resource-id table/content \
  --scalable-dimension dynamodb:table:ReadCapacityUnits \
  --min-capacity 5 --max-capacity 100
```

## Performance Issues

### Slow API Response

**Check:**
1. CloudWatch metrics for latency
2. Database query performance
3. Network latency
4. AI processing time

**Fix:**
```javascript
// Add caching
const cache = new Map();

app.get('/api/content/:id', async (req, res) => {
  const cached = cache.get(req.params.id);
  if (cached) return res.json(cached);
  
  const content = await getContent(req.params.id);
  cache.set(req.params.id, content);
  res.json(content);
});
```

### High Memory Usage

**Check:**
```bash
docker stats content-ai
```

**Fix:**
```javascript
// Limit concurrent processing
const pLimit = require('p-limit');
const limit = pLimit(5); // Max 5 concurrent

const results = await Promise.all(
  files.map(file => limit(() => processFile(file)))
);
```

### Database Connection Pool Exhausted

**Error:** `Too many connections`

**Fix:**
```javascript
// Increase pool size
const pool = new Pool({
  max: 20, // Increase from default 10
  idleTimeoutMillis: 30000
});
```

## Debugging

### Enable Debug Logs

```bash
# Set environment variable
DEBUG=* node server.js

# Or in code
process.env.LOG_LEVEL = 'debug';
```

### Check AWS Service Status

```bash
# Check service health
aws health describe-events --filter eventTypeCategories=issue

# Check Bedrock status
curl https://status.aws.amazon.com/
```

### Test Bedrock Locally

```javascript
const { BedrockRuntime } = require('@aws-sdk/client-bedrock-runtime');

const client = new BedrockRuntime({ region: 'us-east-1' });

try {
  const response = await client.invokeModel({
    modelId: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 100
    })
  });
  console.log('Bedrock working!');
} catch (error) {
  console.error('Bedrock error:', error);
}
```

## Cost Issues

### Unexpected High Costs

**Check:**
```bash
# Get cost breakdown
aws ce get-cost-and-usage \
  --time-period Start=2026-02-26,End=2026-02-27 \
  --granularity DAILY \
  --metrics BlendedCost \
  --group-by Type=SERVICE
```

**Common causes:**
- Too many Bedrock API calls
- Large S3 storage
- High data transfer
- Forgot to stop ECS tasks

**Fix:**
```bash
# Stop ECS service
aws ecs update-service --cluster content-ai-cluster \
  --service content-ai-service --desired-count 0

# Delete S3 objects
aws s3 rm s3://content-ai-uploads --recursive

# Delete DynamoDB items
aws dynamodb scan --table-name content | \
  jq -r '.Items[].id.S' | \
  xargs -I {} aws dynamodb delete-item --table-name content --key '{"id":{"S":"{}"}}'
```

## Common Errors

### "Module not found"

**Fix:**
```bash
npm install
docker build --no-cache -t content-ai .
```

### "Port 3000 already in use"

**Fix:**
```bash
# Find process
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 node server.js
```

### "Cannot connect to database"

**Fix:**
```bash
# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check security group
aws ec2 describe-security-groups --group-ids sg-xxx
```

## Emergency Procedures

### Stop Everything

```bash
# Stop ECS service
aws ecs update-service --cluster content-ai-cluster \
  --service content-ai-service --desired-count 0

# Stop local containers
docker stop $(docker ps -q)
```

### Rollback Deployment

```bash
# Revert to previous task definition
aws ecs update-service --cluster content-ai-cluster \
  --service content-ai-service \
  --task-definition content-ai:1
```

### Contact Support

- AWS Support: https://console.aws.amazon.com/support
- GitHub Issues: https://github.com/your-repo/issues
- Email: support@example.com
