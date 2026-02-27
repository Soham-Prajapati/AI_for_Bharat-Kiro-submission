#!/bin/bash

# 🚀 Content Intelligence Platform - Setup Script
# Usage: ./setup.sh [shubh|nidhi|srushti|lakshmi]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║   CONTENT INTELLIGENCE PLATFORM - SETUP                   ║"
echo "║   AI for Bharat Hackathon 2026                            ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if name provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: Please provide your name${NC}"
    echo "Usage: ./setup.sh [shubh|nidhi|srushti|lakshmi]"
    exit 1
fi

DEVELOPER_NAME=$1
echo -e "${GREEN}👋 Welcome, ${DEVELOPER_NAME}!${NC}\n"

# Check Python version
echo -e "${YELLOW}🔍 Checking Python version...${NC}"
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 not found. Please install Python 3.11+${NC}"
    echo "Install with: brew install python@3.11"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
echo -e "${GREEN}✅ Found Python ${PYTHON_VERSION}${NC}\n"

# Check Node.js (if needed for frontend)
echo -e "${YELLOW}🔍 Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js not found (optional for frontend)${NC}"
else
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Found Node.js ${NODE_VERSION}${NC}"
fi
echo ""

# Create virtual environment
echo -e "${YELLOW}📦 Creating virtual environment...${NC}"
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
    echo -e "${GREEN}✅ Virtual environment created${NC}"
else
    echo -e "${BLUE}ℹ️  Virtual environment already exists${NC}"
fi
echo ""

# Activate virtual environment
echo -e "${YELLOW}🔌 Activating virtual environment...${NC}"
source .venv/bin/activate
echo -e "${GREEN}✅ Virtual environment activated${NC}\n"

# Upgrade pip
echo -e "${YELLOW}⬆️  Upgrading pip...${NC}"
pip install --upgrade pip > /dev/null 2>&1
echo -e "${GREEN}✅ pip upgraded${NC}\n"

# Install dependencies
echo -e "${YELLOW}📚 Installing dependencies...${NC}"
if [ -f "package.json" ]; then
    echo "Installing Node.js dependencies..."
    npm install
fi

if [ -f "requirements.txt" ]; then
    echo "Installing Python dependencies..."
    pip install -r requirements.txt
elif [ -f "package.json" ]; then
    echo "Installing from package.json..."
    npm install
fi
echo -e "${GREEN}✅ Dependencies installed${NC}\n"

# Create .env file if it doesn't exist
echo -e "${YELLOW}⚙️  Setting up environment variables...${NC}"
if [ ! -f ".env" ]; then
    cat > .env << EOF
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here

# Bedrock Configuration
BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0

# Application Configuration
NODE_ENV=development
PORT=3000
API_PORT=8000

# Developer
DEVELOPER_NAME=${DEVELOPER_NAME}
EOF
    echo -e "${GREEN}✅ .env file created${NC}"
    echo -e "${YELLOW}⚠️  Please update AWS credentials in .env file${NC}"
else
    echo -e "${BLUE}ℹ️  .env file already exists${NC}"
fi
echo ""

# Create developer-specific config
echo -e "${YELLOW}👤 Creating developer profile for ${DEVELOPER_NAME}...${NC}"
mkdir -p .dev-profiles
cat > .dev-profiles/${DEVELOPER_NAME}.json << EOF
{
  "name": "${DEVELOPER_NAME}",
  "role": "$(get_role ${DEVELOPER_NAME})",
  "responsibilities": $(get_responsibilities ${DEVELOPER_NAME}),
  "setupDate": "$(date +%Y-%m-%d)",
  "workstreams": $(get_workstreams ${DEVELOPER_NAME})
}
EOF
echo -e "${GREEN}✅ Developer profile created${NC}\n"

# Function to get role
get_role() {
    case $1 in
        shubh|soham)
            echo "Backend Architect + AWS Lead"
            ;;
        nidhi)
            echo "AI Intelligence Lead"
            ;;
        srushti)
            echo "Frontend + UX Lead"
            ;;
        lakshmi)
            echo "Testing + DevOps + Demo Lead"
            ;;
        *)
            echo "Developer"
            ;;
    esac
}

# Function to get responsibilities
get_responsibilities() {
    case $1 in
        shubh|soham)
            echo '["AWS Infrastructure", "AI Service Manager", "Content Processor", "Analysis Engine", "API Endpoints"]'
            ;;
        nidhi)
            echo '["Domain Detection", "Domain Adapters", "Generation Engine", "Multi-language Support", "Prompt Engineering"]'
            ;;
        srushti)
            echo '["Landing Page", "Upload UI", "Analysis Dashboard", "Generation Studio", "Approval Workflow UI"]'
            ;;
        lakshmi)
            echo '["CI/CD Pipeline", "Testing Framework", "Monitoring", "Demo Script", "Presentation Deck"]'
            ;;
        *)
            echo '["General Development"]'
            ;;
    esac
}

# Function to get workstreams
get_workstreams() {
    case $1 in
        shubh|soham)
            echo '["Stream A - Backend Core"]'
            ;;
        nidhi)
            echo '["Stream B - AI Intelligence"]'
            ;;
        srushti)
            echo '["Stream C - Frontend"]'
            ;;
        lakshmi)
            echo '["Stream D - Quality & Demo"]'
            ;;
        *)
            echo '["General"]'
            ;;
    esac
}

# Show next steps based on developer
echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   🎯 YOUR NEXT STEPS (${DEVELOPER_NAME})${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}\n"

case $DEVELOPER_NAME in
    shubh|soham)
        echo -e "${GREEN}📋 Your Role: Backend Architect + AWS Lead${NC}"
        echo ""
        echo "Day 1 Tasks:"
        echo "  1. Set up AWS infrastructure (CDK)"
        echo "  2. Configure Bedrock, Transcribe, Rekognition"
        echo "  3. Build AI Service Manager"
        echo "  4. Create Content Processor core"
        echo ""
        echo "To start development:"
        echo "  ${YELLOW}source .venv/bin/activate${NC}"
        echo "  ${YELLOW}cd src/services${NC}"
        echo "  ${YELLOW}# Start coding AIServiceManager.ts${NC}"
        ;;
    nidhi)
        echo -e "${GREEN}📋 Your Role: AI Intelligence Lead${NC}"
        echo ""
        echo "Day 1 Tasks:"
        echo "  1. Build domain detection engine"
        echo "  2. Create domain adapters (Education, Food, Travel, Reviews)"
        echo "  3. Implement domain-specific analysis patterns"
        echo ""
        echo "To start development:"
        echo "  ${YELLOW}source .venv/bin/activate${NC}"
        echo "  ${YELLOW}cd src/services${NC}"
        echo "  ${YELLOW}# Start coding DomainAdapter.ts${NC}"
        ;;
    srushti)
        echo -e "${GREEN}📋 Your Role: Frontend + UX Lead${NC}"
        echo ""
        echo "Day 1 Tasks:"
        echo "  1. Create landing page + upload interface"
        echo "  2. Build drag-drop file upload with preview"
        echo "  3. Design results dashboard wireframe"
        echo ""
        echo "To start development:"
        echo "  ${YELLOW}source .venv/bin/activate${NC}"
        echo "  ${YELLOW}cd frontend${NC}"
        echo "  ${YELLOW}npm run dev${NC}"
        ;;
    lakshmi)
        echo -e "${GREEN}📋 Your Role: Testing + DevOps + Demo Lead${NC}"
        echo ""
        echo "Day 1 Tasks:"
        echo "  1. Set up CI/CD pipeline (GitHub Actions)"
        echo "  2. Configure testing framework (Jest)"
        echo "  3. Set up CloudWatch monitoring"
        echo ""
        echo "To start development:"
        echo "  ${YELLOW}source .venv/bin/activate${NC}"
        echo "  ${YELLOW}cd tests${NC}"
        echo "  ${YELLOW}npm test${NC}"
        ;;
esac

echo ""
echo -e "${BLUE}📚 Reference Documents:${NC}"
echo "  • HACKATHON_BATTLE_PLAN.md - Complete 6-day plan"
echo "  • PERSONA_GUIDE.md - Expert perspectives"
echo "  • QUICK_REFERENCE.md - Quick lookup"
echo ""
echo -e "${BLUE}💬 Daily Standups:${NC}"
echo "  • 9:00 AM - Morning sync (15 min)"
echo "  • 6:00 PM - Evening sync (15 min)"
echo ""
echo -e "${GREEN}✅ Setup complete! Ready to build something INSANE! 🚀${NC}"
echo -e "${YELLOW}⏰ Deadline: March 4, 2026 - LET'S WIN THIS! 🔥${NC}\n"
