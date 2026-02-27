#!/bin/bash
set -e

# Configuration
EC2_HOST=${EC2_HOST:-"ec2-user@your-instance.compute.amazonaws.com"}
APP_NAME="content-intelligence-backend"

echo "🚀 Deploying to AWS EC2..."

# Build locally
./scripts/build.sh

# Save Docker image
echo "📦 Saving Docker image..."
docker save $APP_NAME | gzip > /tmp/$APP_NAME.tar.gz

# Upload to EC2
echo "⬆️  Uploading to EC2..."
scp /tmp/$APP_NAME.tar.gz $EC2_HOST:/tmp/

# Deploy on EC2
echo "🔧 Deploying on EC2..."
ssh $EC2_HOST << 'EOF'
  cd /tmp
  docker load < content-intelligence-backend.tar.gz
  docker stop content-intelligence-backend || true
  docker rm content-intelligence-backend || true
  docker run -d --name content-intelligence-backend -p 3000:3000 --env-file /home/ec2-user/.env content-intelligence-backend
  rm content-intelligence-backend.tar.gz
EOF

echo "✅ Deployment complete!"
echo "Backend running at: http://$EC2_HOST:3000"
