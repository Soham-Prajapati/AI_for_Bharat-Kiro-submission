#!/bin/bash

# 🚀 Content Intelligence Platform - Setup Script
# Usage: ./scripts/setup.sh

set -e

echo ""
echo "🚀 Content Intelligence Platform - Setup"
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Install from python.org"
    exit 1
fi

echo "✅ Python $(python3 --version | cut -d' ' -f2)"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Install from nodejs.org"
    exit 1
fi

echo "✅ Node.js $(node --version)"
echo ""

# Create venv if missing
if [ ! -d ".venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv .venv
fi

# Activate venv
echo "🔌 Activating virtual environment..."
source .venv/bin/activate

# Upgrade pip
pip install --upgrade pip > /dev/null 2>&1

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install
echo ""

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend && npm install && cd ..
echo ""

# Create .env if missing
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file..."
    cat > .env << EOF
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here

# Bedrock Configuration
BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0

# Application Configuration
NODE_ENV=development
PORT=3001
EOF
    echo "⚠️  Update AWS credentials in .env"
else
    echo "✅ .env exists"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start:"
echo "  source .venv/bin/activate"
echo "  ./scripts/start.sh"
echo ""
