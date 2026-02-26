#!/bin/bash

# 🚀 Quick Start Script for Content Intelligence Platform
# Run this to get started immediately!

set -e

echo "🚀 Content Intelligence Platform - Quick Start"
echo "=============================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Are you in the project root?"
    exit 1
fi

# Step 1: Environment Setup
echo "📝 Step 1: Setting up environment..."
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ Created .env file from .env.example"
        echo "⚠️  IMPORTANT: Edit .env and add your AWS credentials!"
        echo ""
    else
        echo "⚠️  Warning: .env.example not found"
    fi
else
    echo "✅ .env file already exists"
fi

# Step 2: Install Backend Dependencies
echo ""
echo "📦 Step 2: Installing backend dependencies..."
npm install
echo "✅ Backend dependencies installed"

# Step 3: Install Frontend Dependencies
echo ""
echo "📦 Step 3: Installing frontend dependencies..."
if [ -d "frontend" ]; then
    cd frontend
    npm install
    cd ..
    echo "✅ Frontend dependencies installed"
else
    echo "⚠️  Frontend directory not found, skipping..."
fi

# Step 4: Start LocalStack (optional)
echo ""
echo "🐳 Step 4: Starting LocalStack (optional)..."
if command -v docker-compose &> /dev/null; then
    if [ -f "docker-compose.yml" ]; then
        echo "Starting LocalStack for local AWS emulation..."
        docker-compose up -d
        echo "✅ LocalStack started"
        echo "   Access at: http://localhost:4566"
    else
        echo "⚠️  docker-compose.yml not found"
    fi
else
    echo "⚠️  docker-compose not installed, skipping LocalStack"
    echo "   Install Docker Desktop to use LocalStack"
fi

# Step 5: Setup AWS Resources (if credentials exist)
echo ""
echo "☁️  Step 5: AWS Setup..."
if [ -f "scripts/setup-aws.sh" ]; then
    echo "To setup AWS resources, run:"
    echo "  ./scripts/setup-aws.sh"
else
    echo "⚠️  AWS setup script not found"
fi

# Step 6: Ready to Start
echo ""
echo "=============================================="
echo "✅ SETUP COMPLETE!"
echo "=============================================="
echo ""
echo "🚀 To start the backend:"
echo "   npm run dev"
echo ""
echo "🎨 To start the frontend:"
echo "   cd frontend && npm run dev"
echo ""
echo "📊 To check AWS costs:"
echo "   ./scripts/check-aws-costs.sh"
echo ""
echo "🔍 Health check:"
echo "   curl http://localhost:3001/health"
echo ""
echo "📚 Read the docs:"
echo "   cat README.md"
echo "   cat DAY1_COMPLETE.md"
echo ""
echo "💡 Next steps:"
echo "   1. Edit .env with your AWS credentials"
echo "   2. Run 'npm run dev' to start backend"
echo "   3. Run 'cd frontend && npm run dev' to start frontend"
echo "   4. Open http://localhost:3000 in browser"
echo ""
echo "🏆 LET'S WIN AI FOR BHARAT 2026!"
echo ""
