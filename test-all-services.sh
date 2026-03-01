#!/bin/bash

# Service Testing Script
# Tests all 27 AI services for initialization

echo "🧪 Testing All 27 AI Services"
echo "=============================="
echo ""

PASSED=0
FAILED=0
TOTAL=27

# Test function
test_service() {
  SERVICE_NAME=$1
  SERVICE_CLASS=$2
  SERVICE_PATH=$3
  
  echo "Testing: $SERVICE_NAME"
  
  RESULT=$(npx ts-node -e "
import { $SERVICE_CLASS } from '$SERVICE_PATH';
try {
  const service = new $SERVICE_CLASS();
  console.log('PASSED');
} catch (error: any) {
  console.log('FAILED: ' + error.message);
}
" 2>&1)
  
  if [[ $RESULT == *"PASSED"* ]]; then
    echo "✅ $SERVICE_NAME - PASSED"
    ((PASSED++))
  else
    echo "❌ $SERVICE_NAME - FAILED"
    echo "   Error: $RESULT"
    ((FAILED++))
  fi
  echo ""
}

# Test all services
test_service "viral-analyzer.service.ts" "ViralAnalyzerService" "./src/services/viral-analyzer.service"
test_service "content-multiplier-v2.service.ts" "ContentMultiplierV2Service" "./src/services/content-multiplier-v2.service"
test_service "safety.service.ts" "SafetyService" "./src/services/safety.service"
test_service "vernacular.service.ts" "VernacularService" "./src/services/vernacular.service"
test_service "regional-network.service.ts" "RegionalNetworkService" "./src/services/regional-network.service"
test_service "creative-director.service.ts" "CreativeDirectorService" "./src/services/creative-director.service"
test_service "adhd-navigator.service.ts" "ADHDNavigatorService" "./src/services/adhd-navigator.service"
test_service "platform-integration.service.ts" "PlatformIntegrationService" "./src/services/platform-integration.service"
test_service "automation.service.ts" "AutomationService" "./src/services/automation.service"
test_service "membership.service.ts" "MembershipService" "./src/services/membership.service"
test_service "community.service.ts" "CommunityService" "./src/services/community.service"
test_service "knowledge-graph.service.ts" "KnowledgeGraphService" "./src/services/knowledge-graph.service"
test_service "marketplace.service.ts" "MarketplaceService" "./src/services/marketplace.service"
test_service "watermark.service.ts" "WatermarkService" "./src/services/watermark.service"
test_service "dopamine-optimizer.service.ts" "DopamineOptimizerService" "./src/services/dopamine-optimizer.service"
test_service "voice-clone.service.ts" "VoiceCloneService" "./src/services/voice-clone.service"
test_service "trend-predictor.service.ts" "TrendPredictorService" "./src/services/trend-predictor.service"
test_service "workspace.service.ts" "WorkspaceService" "./src/services/workspace.service"
test_service "cultural-adapter.service.ts" "CulturalAdapterService" "./src/services/cultural-adapter.service"
test_service "viral-predictor.service.ts" "ViralPredictorService" "./src/services/viral-predictor.service"
test_service "ecosystem-analytics.service.ts" "EcosystemAnalyticsService" "./src/services/ecosystem-analytics.service"
test_service "analytics-dashboard.service.ts" "AnalyticsDashboardService" "./src/services/analytics-dashboard.service"
test_service "dna-analysis.service.ts" "DNAAnalysisService" "./src/services/dna-analysis.service"
test_service "mode-detection.service.ts" "ModeDetectionService" "./src/services/mode-detection.service"
test_service "human-content-processor.service.ts" "HumanContentProcessorService" "./src/services/human-content-processor.service"
test_service "ai-content-generator.service.ts" "AIContentGeneratorService" "./src/services/ai-content-generator.service"
test_service "platform-content-generator.service.ts" "PlatformContentGeneratorService" "./src/services/platform-content-generator.service"

# Summary
echo "=============================="
echo "📊 Test Summary"
echo "=============================="
echo "Total Services: $TOTAL"
echo "✅ Passed: $PASSED"
echo "❌ Failed: $FAILED"
echo "Success Rate: $(( PASSED * 100 / TOTAL ))%"
echo ""

if [ $FAILED -eq 0 ]; then
  echo "🎉 All services passed!"
  exit 0
else
  echo "⚠️  Some services failed. Check errors above."
  exit 1
fi
