#!/bin/bash

# 🚀 Quick Start Script - Run Backend + Frontend
# Usage: ./start.sh

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Starting Content Intelligence Platform...${NC}\n"

# Check if venv exists
if [ ! -d ".venv" ]; then
    echo -e "${YELLOW}⚠️  Virtual environment not found. Run ./setup.sh first${NC}"
    exit 1
fi

# Activate venv
source .venv/bin/activate

# Start backend in background
echo -e "${GREEN}🔧 Starting Backend API...${NC}"
cd src
npm run dev &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend
echo -e "${GREEN}🎨 Starting Frontend...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo -e "${GREEN}✅ Services started!${NC}"
echo -e "${BLUE}📍 Backend API: http://localhost:8000${NC}"
echo -e "${BLUE}📍 Frontend: http://localhost:3000${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
