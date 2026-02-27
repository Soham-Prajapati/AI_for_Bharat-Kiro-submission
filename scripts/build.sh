#!/bin/bash
set -e

echo "🚀 Building backend..."
npm run build

echo "🐳 Building Docker image..."
docker build -t content-intelligence-backend .

echo "✅ Build complete!"
echo "To run locally: docker run -p 3000:3000 --env-file .env content-intelligence-backend"
