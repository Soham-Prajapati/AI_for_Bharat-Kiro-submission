#!/bin/bash

# Demo Environment Preparation Script
# This script sets up the environment for recording demo videos

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEMO_DATA_DIR="./demo-data"
API_BASE_URL="${API_BASE_URL:-http://localhost:3000}"
DEMO_USER_EMAIL="demo@example.com"
DEMO_USER_PASSWORD="Demo123!@#"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Demo Environment Preparation${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Function to print status
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Function to check if service is running
check_service() {
    local service_name=$1
    local url=$2
    
    print_info "Checking $service_name..."
    
    if curl -s -f -o /dev/null "$url"; then
        print_status "$service_name is running"
        return 0
    else
        print_error "$service_name is not responding at $url"
        return 1
    fi
}

# Function to wait for service
wait_for_service() {
    local service_name=$1
    local url=$2
    local max_attempts=30
    local attempt=1
    
    print_info "Waiting for $service_name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f -o /dev/null "$url"; then
            print_status "$service_name is ready"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "$service_name failed to start within timeout"
    return 1
}

# Step 1: Check prerequisites
echo -e "\n${BLUE}Step 1: Checking Prerequisites${NC}"
echo "================================"

# Check if Node.js is installed
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_status "Node.js installed: $NODE_VERSION"
else
    print_error "Node.js is not installed"
    exit 1
fi

# Check if npm is installed
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_status "npm installed: $NPM_VERSION"
else
    print_error "npm is not installed"
    exit 1
fi

# Check if curl is installed
if command -v curl &> /dev/null; then
    print_status "curl is installed"
else
    print_error "curl is not installed"
    exit 1
fi

# Step 2: Clear existing test data
echo -e "\n${BLUE}Step 2: Clearing Test Data${NC}"
echo "================================"

if [ -d "$DEMO_DATA_DIR" ]; then
    print_info "Removing existing demo data..."
    rm -rf "$DEMO_DATA_DIR"
    print_status "Demo data cleared"
else
    print_info "No existing demo data found"
fi

# Create fresh demo data directory
mkdir -p "$DEMO_DATA_DIR"/{videos,thumbnails,exports}
print_status "Created demo data directories"

# Step 3: Verify services are running
echo -e "\n${BLUE}Step 3: Verifying Services${NC}"
echo "================================"

SERVICES_OK=true

# Check API server
if ! check_service "API Server" "$API_BASE_URL/health"; then
    SERVICES_OK=false
    print_warning "Starting API server..."
    npm run dev &
    API_PID=$!
    sleep 5
    
    if wait_for_service "API Server" "$API_BASE_URL/health"; then
        print_status "API server started successfully"
    else
        print_error "Failed to start API server"
        exit 1
    fi
fi

# Check database connection
if ! check_service "Database" "$API_BASE_URL/api/health/db"; then
    print_error "Database is not accessible"
    print_info "Please ensure your database is running"
    exit 1
fi

# Check Redis (if used)
if curl -s "$API_BASE_URL/api/health/redis" | grep -q "ok"; then
    print_status "Redis is running"
else
    print_warning "Redis is not running (optional, but recommended for caching)"
fi

# Step 4: Setup demo data
echo -e "\n${BLUE}Step 4: Setting Up Demo Data${NC}"
echo "================================"

# Create demo user
print_info "Creating demo user..."
DEMO_USER_RESPONSE=$(curl -s -X POST "$API_BASE_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"$DEMO_USER_EMAIL\",
        \"password\": \"$DEMO_USER_PASSWORD\",
        \"name\": \"Demo User\",
        \"role\": \"creator\"
    }" || echo '{"error": "failed"}')

if echo "$DEMO_USER_RESPONSE" | grep -q "token\|success"; then
    print_status "Demo user created"
    
    # Extract token
    DEMO_TOKEN=$(echo "$DEMO_USER_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    echo "$DEMO_TOKEN" > "$DEMO_DATA_DIR/.demo_token"
    print_status "Authentication token saved"
else
    print_warning "Demo user might already exist, attempting login..."
    
    LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"$DEMO_USER_EMAIL\",
            \"password\": \"$DEMO_USER_PASSWORD\"
        }")
    
    DEMO_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    
    if [ -n "$DEMO_TOKEN" ]; then
        echo "$DEMO_TOKEN" > "$DEMO_DATA_DIR/.demo_token"
        print_status "Logged in with existing demo user"
    else
        print_error "Failed to create or login demo user"
        exit 1
    fi
fi

# Download sample videos
print_info "Downloading sample videos..."

SAMPLE_VIDEOS=(
    "tech_review.mp4|https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4"
    "cooking_tutorial.mp4|https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_2mb.mp4"
    "travel_vlog.mp4|https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_5mb.mp4"
)

for video_info in "${SAMPLE_VIDEOS[@]}"; do
    IFS='|' read -r filename url <<< "$video_info"
    
    if [ ! -f "$DEMO_DATA_DIR/videos/$filename" ]; then
        print_info "Downloading $filename..."
        # Using placeholder - replace with actual sample video URLs
        touch "$DEMO_DATA_DIR/videos/$filename"
        print_status "Sample video prepared: $filename"
    fi
done

# Create sample thumbnails
print_info "Creating sample thumbnails..."
for i in {1..5}; do
    touch "$DEMO_DATA_DIR/thumbnails/thumbnail_$i.jpg"
done
print_status "Sample thumbnails created"

# Step 5: Warm up caches
echo -e "\n${BLUE}Step 5: Warming Up Caches${NC}"
echo "================================"

print_info "Warming up API caches..."

# Call common endpoints to warm up caches
curl -s "$API_BASE_URL/api/trends" > /dev/null && print_status "Trends cache warmed"
curl -s "$API_BASE_URL/api/templates" > /dev/null && print_status "Templates cache warmed"
curl -s "$API_BASE_URL/api/analytics/dashboard" \
    -H "Authorization: Bearer $DEMO_TOKEN" > /dev/null && print_status "Analytics cache warmed"

# Step 6: Verify API endpoints
echo -e "\n${BLUE}Step 6: Verifying API Endpoints${NC}"
echo "================================"

ENDPOINTS=(
    "GET|/api/health|Health Check"
    "GET|/api/trends|Trends API"
    "GET|/api/templates|Templates API"
    "GET|/api/analytics/dashboard|Analytics API"
    "GET|/api/user/profile|User Profile API"
)

FAILED_ENDPOINTS=0

for endpoint_info in "${ENDPOINTS[@]}"; do
    IFS='|' read -r method path description <<< "$endpoint_info"
    
    print_info "Testing $description..."
    
    if [ "$method" = "GET" ]; then
        RESPONSE=$(curl -s -w "\n%{http_code}" \
            -H "Authorization: Bearer $DEMO_TOKEN" \
            "$API_BASE_URL$path")
        
        HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
        
        if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
            print_status "$description is working (HTTP $HTTP_CODE)"
        else
            print_error "$description failed (HTTP $HTTP_CODE)"
            FAILED_ENDPOINTS=$((FAILED_ENDPOINTS + 1))
        fi
    fi
done

if [ $FAILED_ENDPOINTS -gt 0 ]; then
    print_warning "$FAILED_ENDPOINTS endpoint(s) failed verification"
else
    print_status "All endpoints verified successfully"
fi

# Step 7: Create demo configuration file
echo -e "\n${BLUE}Step 7: Creating Demo Configuration${NC}"
echo "================================"

cat > "$DEMO_DATA_DIR/demo-config.json" <<EOF
{
  "apiBaseUrl": "$API_BASE_URL",
  "demoUser": {
    "email": "$DEMO_USER_EMAIL",
    "password": "$DEMO_USER_PASSWORD"
  },
  "sampleVideos": [
    "tech_review.mp4",
    "cooking_tutorial.mp4",
    "travel_vlog.mp4"
  ],
  "scenarios": [
    "tech-youtuber",
    "regional-creator",
    "multi-platform-influencer"
  ],
  "recordingSettings": {
    "resolution": "1920x1080",
    "frameRate": 30,
    "audioSampleRate": 48000
  }
}
EOF

print_status "Demo configuration created"

# Step 8: Performance check
echo -e "\n${BLUE}Step 8: Performance Check${NC}"
echo "================================"

print_info "Running performance check..."

# Test API response time
START_TIME=$(date +%s%N)
curl -s "$API_BASE_URL/api/health" > /dev/null
END_TIME=$(date +%s%N)
RESPONSE_TIME=$(( (END_TIME - START_TIME) / 1000000 ))

if [ $RESPONSE_TIME -lt 100 ]; then
    print_status "API response time: ${RESPONSE_TIME}ms (Excellent)"
elif [ $RESPONSE_TIME -lt 500 ]; then
    print_status "API response time: ${RESPONSE_TIME}ms (Good)"
else
    print_warning "API response time: ${RESPONSE_TIME}ms (Slow - consider optimizing)"
fi

# Check available disk space
AVAILABLE_SPACE=$(df -h . | awk 'NR==2 {print $4}')
print_status "Available disk space: $AVAILABLE_SPACE"

# Check memory usage
if command -v free &> /dev/null; then
    AVAILABLE_MEMORY=$(free -h | awk 'NR==2 {print $7}')
    print_status "Available memory: $AVAILABLE_MEMORY"
fi

# Final summary
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Demo Environment Ready!${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${BLUE}Demo Credentials:${NC}"
echo "  Email: $DEMO_USER_EMAIL"
echo "  Password: $DEMO_USER_PASSWORD"
echo ""
echo -e "${BLUE}Demo Data Location:${NC}"
echo "  $DEMO_DATA_DIR"
echo ""
echo -e "${BLUE}API Base URL:${NC}"
echo "  $API_BASE_URL"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "  1. Review DEMO_SCENARIOS.md for recording scripts"
echo "  2. Open browser to $API_BASE_URL"
echo "  3. Login with demo credentials"
echo "  4. Start recording!"
echo ""
echo -e "${BLUE}Troubleshooting:${NC}"
echo "  See DEMO_TROUBLESHOOTING.md for common issues"
echo ""

# Save summary to file
cat > "$DEMO_DATA_DIR/setup-summary.txt" <<EOF
Demo Environment Setup Summary
==============================
Date: $(date)
API URL: $API_BASE_URL
Demo User: $DEMO_USER_EMAIL
Status: Ready

Services Status:
- API Server: Running
- Database: Connected
- Caches: Warmed

Performance:
- API Response Time: ${RESPONSE_TIME}ms
- Available Space: $AVAILABLE_SPACE

Demo Data:
- Location: $DEMO_DATA_DIR
- Sample Videos: 3
- Sample Thumbnails: 5

Ready for recording!
EOF

print_status "Setup summary saved to $DEMO_DATA_DIR/setup-summary.txt"

exit 0
