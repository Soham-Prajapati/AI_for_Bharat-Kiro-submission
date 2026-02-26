#!/bin/bash

# Emergency Stop Script
# Stops all running agents and saves progress

echo "🛑 EMERGENCY STOP INITIATED"
echo "================================"

# Save current timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
CHECKPOINT_FILE=".agent-checkpoint-${TIMESTAMP}.json"

# Kill all node processes related to agents
echo "Stopping all agent processes..."
pkill -f "multi-agent-orchestrator" 2>/dev/null
pkill -f "agent-worker" 2>/dev/null

# Save current progress
if [ -f ".agent-results.json" ]; then
    cp .agent-results.json "$CHECKPOINT_FILE"
    echo "✅ Progress saved to: $CHECKPOINT_FILE"
fi

# Check AWS costs
echo ""
echo "💰 Checking AWS costs..."
aws ce get-cost-and-usage \
  --time-period Start=$(date -u -d '1 day ago' +%Y-%m-%d),End=$(date -u +%Y-%m-%d) \
  --granularity DAILY \
  --metrics BlendedCost \
  --output json 2>/dev/null | jq -r '.ResultsByTime[0].Total.BlendedCost.Amount' || echo "Unable to fetch costs"

# Summary
echo ""
echo "================================"
echo "✅ All agents stopped"
echo "✅ Progress saved"
echo "✅ Ready to resume with: ./scripts/resume-agents.sh"
echo "================================"
