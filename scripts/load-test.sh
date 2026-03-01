#!/bin/bash

###############################################################################
# Load Testing Script for Content Intelligence Platform
# 
# This script runs comprehensive load tests using k6 against the staging
# environment and generates performance reports.
#
# Usage:
#   ./scripts/load-test.sh [scenario] [environment]
#
# Scenarios:
#   all              - Run all test scenarios (default)
#   upload           - File upload load test
#   generation       - Content generation load test
#   ratelimit        - Rate limiting test
#   stress           - Stress test
#
# Environment:
#   staging          - Staging environment (default)
#   local            - Local development
#   production       - Production (use with caution!)
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCENARIO=${1:-all}
ENVIRONMENT=${2:-staging}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RESULTS_DIR="load-tests/results"
REPORT_FILE="docs/LOAD_TEST_RESULTS.md"

# Environment URLs
case $ENVIRONMENT in
  local)
    BASE_URL="http://localhost:3000"
    ;;
  staging)
    BASE_URL="${STAGING_URL:-https://staging.content-intelligence.example.com}"
    ;;
  production)
    BASE_URL="${PRODUCTION_URL:-https://api.content-intelligence.example.com}"
    echo -e "${RED}WARNING: Running load tests against PRODUCTION!${NC}"
    read -p "Are you sure? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
      echo "Aborted."
      exit 1
    fi
    ;;
  *)
    echo -e "${RED}Invalid environment: $ENVIRONMENT${NC}"
    exit 1
    ;;
esac

# Check if k6 is installed
if ! command -v k6 &> /dev/null; then
    echo -e "${RED}Error: k6 is not installed${NC}"
    echo "Install k6: https://k6.io/docs/getting-started/installation/"
    echo ""
    echo "Quick install options:"
    echo "  macOS:   brew install k6"
    echo "  Linux:   sudo apt-get install k6"
    echo "  Windows: choco install k6"
    exit 1
fi

# Create results directory
mkdir -p "$RESULTS_DIR"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Content Intelligence Platform - Load Testing          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Environment:${NC} $ENVIRONMENT"
echo -e "${GREEN}Base URL:${NC} $BASE_URL"
echo -e "${GREEN}Scenario:${NC} $SCENARIO"
echo -e "${GREEN}Timestamp:${NC} $TIMESTAMP"
echo ""

# Function to run a test scenario
run_test() {
  local test_name=$1
  local test_file=$2
  
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${YELLOW}Running: $test_name${NC}"
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  
  if k6 run --env BASE_URL="$BASE_URL" "$test_file"; then
    echo -e "${GREEN}✓ $test_name completed successfully${NC}"
    return 0
  else
    echo -e "${RED}✗ $test_name failed${NC}"
    return 1
  fi
}

# Run tests based on scenario
FAILED_TESTS=0

case $SCENARIO in
  upload)
    run_test "File Upload Load Test" "load-tests/scenarios/upload-load.js" || ((FAILED_TESTS++))
    ;;
  generation)
    run_test "Content Generation Load Test" "load-tests/scenarios/content-generation-load.js" || ((FAILED_TESTS++))
    ;;
  ratelimit)
    run_test "Rate Limiting Test" "load-tests/scenarios/rate-limit-test.js" || ((FAILED_TESTS++))
    ;;
  stress)
    run_test "Stress Test" "load-tests/scenarios/stress-test.js" || ((FAILED_TESTS++))
    ;;
  all)
    echo -e "${BLUE}Running all test scenarios...${NC}"
    echo ""
    
    run_test "1. File Upload Load Test" "load-tests/scenarios/upload-load.js" || ((FAILED_TESTS++))
    echo ""
    sleep 5
    
    run_test "2. Content Generation Load Test" "load-tests/scenarios/content-generation-load.js" || ((FAILED_TESTS++))
    echo ""
    sleep 5
    
    run_test "3. Rate Limiting Test" "load-tests/scenarios/rate-limit-test.js" || ((FAILED_TESTS++))
    echo ""
    sleep 5
    
    run_test "4. Stress Test" "load-tests/scenarios/stress-test.js" || ((FAILED_TESTS++))
    ;;
  *)
    echo -e "${RED}Invalid scenario: $SCENARIO${NC}"
    echo "Valid scenarios: all, upload, generation, ratelimit, stress"
    exit 1
    ;;
esac

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Generating Performance Report...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Generate consolidated report
node scripts/generate-load-test-report.js "$ENVIRONMENT" "$TIMESTAMP" "$SCENARIO"

echo ""
echo -e "${GREEN}✓ Report generated: $REPORT_FILE${NC}"
echo ""

# Summary
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    Test Summary                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
  echo -e "${GREEN}✓ All tests passed successfully!${NC}"
  echo ""
  echo -e "Results saved to: ${GREEN}$RESULTS_DIR${NC}"
  echo -e "Report available at: ${GREEN}$REPORT_FILE${NC}"
  exit 0
else
  echo -e "${RED}✗ $FAILED_TESTS test(s) failed${NC}"
  echo ""
  echo -e "Check results in: ${YELLOW}$RESULTS_DIR${NC}"
  exit 1
fi
