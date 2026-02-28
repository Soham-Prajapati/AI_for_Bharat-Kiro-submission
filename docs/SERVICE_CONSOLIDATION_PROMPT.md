# 🔧 SERVICE CONSOLIDATION MASTER PROMPT

> **Purpose:** Merge redundant services, create unified services, and update all imports  
> **Risk Level:** MEDIUM - Creates new files, modifies routes, deletes old services  
> **Prerequisites:** Backup your code or ensure git commit before running

---

## INSTRUCTIONS FOR AI

You are a Lead Technical Architect performing service consolidation on this codebase. Execute ALL steps below in order. Do not skip any step. Verify build passes after each major section.

---

## PHASE 1: CREATE UNIFIED SERVICES

### 1.1 Create `unified-analytics.service.ts`

Create file: `src/services/unified-analytics.service.ts`

This service wraps and consolidates:
- `ecosystem-analytics.service.ts`
- `analytics-dashboard.service.ts`
- `roi-calculator.service.ts`

```typescript
/**
 * Unified Analytics Service
 * Consolidates: Ecosystem Analytics + Analytics Dashboard + ROI Calculator
 * 
 * This is the single source of truth for all analytics operations.
 */

import { EcosystemAnalyticsService, EcosystemAnalytics, AnalyticsResponse, PlatformHandles } from './ecosystem-analytics.service';
import { AnalyticsDashboardService, Metric, Insight, Forecast, PerformanceReport } from './analytics-dashboard.service';
import { ROICalculatorService } from './roi-calculator.service';

// Re-export types for external use
export { EcosystemAnalytics, AnalyticsResponse, PlatformHandles, Metric, Insight, Forecast, PerformanceReport };

export interface UnifiedAnalyticsResult {
  ecosystem: EcosystemAnalytics;
  metrics: {
    overview: any;
    platforms: any;
    trends: any[];
    insights: any[];
  };
  roi: {
    timeSaved: string;
    moneySaved: string;
    roi: string;
    breakdown: any;
    projections: any;
  };
  fetchedAt: Date;
}

export class UnifiedAnalyticsService {
  private ecosystemService: EcosystemAnalyticsService;
  private dashboardService: AnalyticsDashboardService;
  private roiService: ROICalculatorService;

  constructor() {
    this.ecosystemService = new EcosystemAnalyticsService();
    this.dashboardService = new AnalyticsDashboardService();
    this.roiService = new ROICalculatorService();
  }

  // ============================================================================
  // UNIFIED METHODS
  // ============================================================================

  /**
   * Get comprehensive analytics combining all three services
   */
  async getFullAnalytics(userId: string, platformHandles?: PlatformHandles): Promise<UnifiedAnalyticsResult> {
    const [ecosystemResult, dashboardMetrics, roiResult] = await Promise.all([
      this.ecosystemService.getEcosystemAnalytics(userId, platformHandles),
      this.dashboardService.getMetrics(userId, '30d'),
      this.roiService.calculateForUser(userId)
    ]);

    return {
      ecosystem: ecosystemResult.analytics,
      metrics: dashboardMetrics,
      roi: roiResult,
      fetchedAt: new Date()
    };
  }

  // ============================================================================
  // ECOSYSTEM ANALYTICS METHODS (delegated)
  // ============================================================================

  /**
   * Get cross-platform ecosystem analytics
   * @deprecated Use getFullAnalytics() for comprehensive data
   */
  async getEcosystemAnalytics(userId: string, platformHandles?: PlatformHandles): Promise<AnalyticsResponse> {
    return this.ecosystemService.getEcosystemAnalytics(userId, platformHandles);
  }

  /**
   * Shorthand for ecosystem analytics
   */
  async getAnalytics(userId: string): Promise<any> {
    const result = await this.ecosystemService.getEcosystemAnalytics(userId);
    return result.analytics;
  }

  // ============================================================================
  // DASHBOARD METHODS (delegated)
  // ============================================================================

  /**
   * Get dashboard metrics with trends and insights
   */
  async getDashboardMetrics(userId: string, timeRange: string = '30d'): Promise<any> {
    return this.dashboardService.getMetrics(userId, timeRange);
  }

  /**
   * Get actionable insights
   */
  async getInsights(userId: string): Promise<Insight[]> {
    return this.dashboardService.getInsights(userId);
  }

  /**
   * Get forecasts for metrics
   */
  async getForecasts(userId: string): Promise<Forecast[]> {
    return this.dashboardService.getForecasts(userId);
  }

  /**
   * Get performance report
   */
  async getPerformanceReport(userId: string, period: string): Promise<PerformanceReport> {
    return this.dashboardService.getPerformanceReport(userId, period);
  }

  // ============================================================================
  // ROI METHODS (delegated)
  // ============================================================================

  /**
   * Calculate ROI for a user
   */
  async calculateROI(userId: string): Promise<any> {
    return this.roiService.calculateForUser(userId);
  }

  /**
   * Calculate ROI for a single video
   */
  calculateVideoROI(metrics: { duration: number; platforms: number; languages: number }): any {
    return this.roiService.calculateSingleVideo(metrics);
  }

  /**
   * Calculate batch ROI
   */
  calculateBatchROI(videos: Array<{ duration: number; platforms: number; languages: number }>): any {
    return this.roiService.calculateBatch(videos);
  }
}

// Singleton export
export const unifiedAnalyticsService = new UnifiedAnalyticsService();
```

### 1.2 Create `viral-intelligence.service.ts`

Create file: `src/services/viral-intelligence.service.ts`

This service wraps and consolidates:
- `viral-predictor.service.ts`
- `viral-analyzer.service.ts`
- `dopamine-optimizer.service.ts`

```typescript
/**
 * Viral Intelligence Service
 * Consolidates: Viral Predictor + Viral Analyzer + Dopamine Optimizer
 * 
 * Single service for all virality analysis, prediction, and optimization.
 */

import { ViralPredictorService, ViralPredictionRequest, ViralPrediction, ViralPredictionResponse } from './viral-predictor.service';
import { ViralAnalyzerService, ViralContentRequest, ViralPattern, ViralHook, EmotionalTrigger, ViralFormula, ReplicationGuide } from './viral-analyzer.service';
import { DopamineOptimizerService } from './dopamine-optimizer.service';

// Re-export types
export { 
  ViralPredictionRequest, ViralPrediction, ViralPredictionResponse,
  ViralContentRequest, ViralPattern, ViralHook, EmotionalTrigger, ViralFormula, ReplicationGuide
};

export interface ViralIntelligenceResult {
  prediction: ViralPrediction;
  patterns: ViralPattern[];
  hooks: ViralHook[];
  emotionalTriggers: EmotionalTrigger[];
  optimization: {
    overallScore: number;
    improvements: string[];
    optimizedContent?: string;
  };
  analyzedAt: Date;
}

export class ViralIntelligenceService {
  private predictorService: ViralPredictorService;
  private analyzerService: ViralAnalyzerService;
  private dopamineService: DopamineOptimizerService;

  constructor() {
    this.predictorService = new ViralPredictorService();
    this.analyzerService = new ViralAnalyzerService();
    this.dopamineService = new DopamineOptimizerService();
  }

  // ============================================================================
  // UNIFIED METHODS
  // ============================================================================

  /**
   * Comprehensive viral intelligence analysis
   */
  async analyzeComprehensive(
    transcript: string,
    metadata?: { duration?: number; platform?: string; category?: string }
  ): Promise<ViralIntelligenceResult> {
    const [prediction, optimization] = await Promise.all([
      this.predictorService.predictViralScore({ transcript, metadata }),
      this.dopamineService.analyzeContent({ content: transcript, contentType: 'video_script' })
    ]);

    return {
      prediction: prediction.prediction,
      patterns: [],
      hooks: optimization.hooks || [],
      emotionalTriggers: optimization.emotionalPeaks?.map(peak => ({
        triggerId: `trigger-${Date.now()}`,
        emotion: peak.emotion,
        intensity: peak.intensity,
        timestamp: peak.timestamp || 0,
        context: peak.context,
        impact: 'engagement boost'
      })) || [],
      optimization: {
        overallScore: optimization.overallScore,
        improvements: optimization.improvements?.map(i => i.suggestion || i) || [],
        optimizedContent: optimization.optimizedContent
      },
      analyzedAt: new Date()
    };
  }

  // ============================================================================
  // VIRAL PREDICTOR METHODS (delegated)
  // ============================================================================

  /**
   * Predict viral score for content
   */
  async predictScore(request: ViralPredictionRequest): Promise<ViralPredictionResponse> {
    return this.predictorService.predictViralScore(request);
  }

  /**
   * Simple prediction with transcript and optional metadata
   */
  async predict(transcript: string, metadata?: any): Promise<ViralPrediction> {
    const result = await this.predictorService.predictViralScore({ transcript, metadata });
    return result.prediction;
  }

  // ============================================================================
  // VIRAL ANALYZER METHODS (delegated)
  // ============================================================================

  /**
   * Analyze viral content to extract patterns
   */
  async analyzeContent(request: ViralContentRequest): Promise<any> {
    return this.analyzerService.analyzeViralContent(request);
  }

  /**
   * Extract viral patterns from content
   */
  async extractPatterns(content: ViralContentRequest): Promise<ViralPattern[]> {
    const analysis = await this.analyzerService.analyzeViralContent(content);
    return analysis.patterns || [];
  }

  /**
   * Get viral hooks from content
   */
  async extractHooks(content: ViralContentRequest): Promise<ViralHook[]> {
    const analysis = await this.analyzerService.analyzeViralContent(content);
    return analysis.hooks || [];
  }

  /**
   * Generate replication guide
   */
  async getReplicationGuide(content: ViralContentRequest): Promise<ReplicationGuide> {
    const analysis = await this.analyzerService.analyzeViralContent(content);
    return analysis.replicationGuide;
  }

  // ============================================================================
  // DOPAMINE OPTIMIZER METHODS (delegated)
  // ============================================================================

  /**
   * Optimize content for engagement
   */
  async optimizeEngagement(request: {
    content: string;
    contentType: 'video_script' | 'social_post' | 'blog' | 'email';
    duration?: number;
    targetPlatform?: string;
  }): Promise<any> {
    return this.dopamineService.analyzeContent(request);
  }

  /**
   * Analyze hooks in content
   */
  async analyzeHooks(content: string): Promise<any[]> {
    const result = await this.dopamineService.analyzeContent({ 
      content, 
      contentType: 'video_script' 
    });
    return result.hooks || [];
  }

  /**
   * Get retention prediction
   */
  async predictRetention(content: string, duration?: number): Promise<any> {
    const result = await this.dopamineService.analyzeContent({ 
      content, 
      contentType: 'video_script',
      duration 
    });
    return result.retentionPrediction;
  }

  /**
   * Get pacing analysis
   */
  async analyzePacing(content: string): Promise<any> {
    const result = await this.dopamineService.analyzeContent({ 
      content, 
      contentType: 'video_script' 
    });
    return result.pacingAnalysis;
  }
}

// Singleton export
export const viralIntelligenceService = new ViralIntelligenceService();
```

### 1.3 Create `localization.service.ts`

Create file: `src/services/localization.service.ts`

This service wraps and consolidates:
- `cultural-adapter.service.ts`
- `vernacular.service.ts`

```typescript
/**
 * Localization Service
 * Consolidates: Cultural Adapter + Vernacular Service
 * 
 * Single service for all translation, cultural adaptation, and localization.
 */

import { CulturalAdapterService } from './cultural-adapter.service';
import { VernacularService, VernacularTranslateRequest, TranslationResult, LanguageProfile } from './vernacular.service';

// Re-export types
export { VernacularTranslateRequest, TranslationResult, LanguageProfile };

export interface CulturalAdaptationRequest {
  content: string;
  sourceRegion?: string;
  targetRegion: string;
  contentType?: 'video' | 'blog' | 'social' | 'marketing';
  preserveOriginalMeaning?: boolean;
}

export interface CulturalAdaptationResult {
  adaptedContent: string;
  changes: Array<{
    original: string;
    adapted: string;
    category: string;
    reasoning: string;
  }>;
  confidence: number;
  sourceRegion: string;
  targetRegion: string;
  adaptationSummary: string;
}

export interface LocalizationResult {
  translatedContent: string;
  culturallyAdaptedContent: string;
  transliteration?: string;
  changes: Array<{
    type: 'translation' | 'cultural';
    original: string;
    localized: string;
    reason: string;
  }>;
  qualityScore: number;
  targetLanguage: string;
  targetRegion: string;
  localizedAt: Date;
}

export class LocalizationService {
  private culturalService: CulturalAdapterService;
  private vernacularService: VernacularService;

  constructor() {
    this.culturalService = new CulturalAdapterService();
    this.vernacularService = new VernacularService();
  }

  // ============================================================================
  // UNIFIED METHODS
  // ============================================================================

  /**
   * Full localization: translate AND culturally adapt
   */
  async localizeContent(
    content: string,
    targetLanguage: string,
    targetRegion: string,
    options?: {
      sourceLanguage?: string;
      contentType?: 'video' | 'blog' | 'social' | 'marketing';
      includeTransliteration?: boolean;
    }
  ): Promise<LocalizationResult> {
    // First translate
    const translationResult = await this.vernacularService.translate({
      content,
      sourceLanguage: options?.sourceLanguage || 'en',
      targetLanguage,
      contentType: options?.contentType || 'social',
      includeTransliteration: options?.includeTransliteration
    });

    // Then culturally adapt the translated content
    const culturalResult = await this.culturalService.adaptContent({
      content: translationResult.translatedContent,
      targetRegion,
      contentType: options?.contentType
    });

    // Combine changes
    const allChanges = [
      ...translationResult.culturalAdaptations.map(c => ({
        type: 'translation' as const,
        original: c.original,
        localized: c.adapted,
        reason: c.reason
      })),
      ...culturalResult.changes.map(c => ({
        type: 'cultural' as const,
        original: c.original,
        localized: c.adapted,
        reason: c.reasoning
      }))
    ];

    return {
      translatedContent: translationResult.translatedContent,
      culturallyAdaptedContent: culturalResult.adaptedContent,
      transliteration: translationResult.transliteration,
      changes: allChanges,
      qualityScore: (translationResult.qualityScore + culturalResult.confidence) / 2,
      targetLanguage,
      targetRegion,
      localizedAt: new Date()
    };
  }

  // ============================================================================
  // CULTURAL ADAPTER METHODS (delegated)
  // ============================================================================

  /**
   * Adapt content for a specific region
   */
  async adaptCulturally(request: CulturalAdaptationRequest): Promise<CulturalAdaptationResult> {
    return this.culturalService.adaptContent(request);
  }

  /**
   * Simple cultural adaptation
   */
  async adaptForRegion(content: string, targetRegion: string): Promise<CulturalAdaptationResult> {
    return this.culturalService.adaptContent({ content, targetRegion });
  }

  /**
   * Get supported regions
   */
  getSupportedRegions(): string[] {
    return this.culturalService.getSupportedRegions();
  }

  // ============================================================================
  // VERNACULAR METHODS (delegated)
  // ============================================================================

  /**
   * Translate content to target language
   */
  async translate(request: VernacularTranslateRequest): Promise<TranslationResult> {
    return this.vernacularService.translate(request);
  }

  /**
   * Simple translation
   */
  async translateToLanguage(content: string, targetLanguage: string, sourceLanguage: string = 'en'): Promise<TranslationResult> {
    return this.vernacularService.translate({
      content,
      sourceLanguage,
      targetLanguage
    });
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): LanguageProfile[] {
    return this.vernacularService.getSupportedLanguages();
  }

  /**
   * Get language profile
   */
  getLanguageProfile(languageCode: string): LanguageProfile | undefined {
    return this.vernacularService.getLanguageProfile(languageCode);
  }

  /**
   * Batch translate
   */
  async batchTranslate(
    contents: string[],
    targetLanguage: string,
    sourceLanguage: string = 'en'
  ): Promise<TranslationResult[]> {
    return this.vernacularService.batchTranslate(contents, targetLanguage, sourceLanguage);
  }
}

// Singleton export
export const localizationService = new LocalizationService();
```

---

## PHASE 2: UPDATE ROUTE IMPORTS

### Service Redirect Map

When updating routes, use this mapping:

| Old Import | New Import |
|------------|------------|
| `import { ecosystemAnalyticsService } from '../services/ecosystem-analytics.service'` | `import { unifiedAnalyticsService } from '../services/unified-analytics.service'` |
| `import { analyticsDashboardService } from '../services/analytics-dashboard.service'` | `import { unifiedAnalyticsService } from '../services/unified-analytics.service'` |
| `import { roiCalculatorService } from '../services/roi-calculator.service'` | `import { unifiedAnalyticsService } from '../services/unified-analytics.service'` |
| `import { viralPredictorService } from '../services/viral-predictor.service'` | `import { viralIntelligenceService } from '../services/viral-intelligence.service'` |
| `import { viralAnalyzerService } from '../services/viral-analyzer.service'` | `import { viralIntelligenceService } from '../services/viral-intelligence.service'` |
| `import { dopamineOptimizerService } from '../services/dopamine-optimizer.service'` | `import { viralIntelligenceService } from '../services/viral-intelligence.service'` |
| `import { culturalAdapterService } from '../services/cultural-adapter.service'` | `import { localizationService } from '../services/localization.service'` |
| `import { vernacularService } from '../services/vernacular.service'` | `import { localizationService } from '../services/localization.service'` |
| `import { contentMultiplierService } from '../services/content-multiplier.service'` | `import { contentMultiplierV2Service } from '../services/content-multiplier-v2.service'` |

### Method Call Mapping

| Old Method Call | New Method Call |
|-----------------|-----------------|
| `ecosystemAnalyticsService.getEcosystemAnalytics(userId)` | `unifiedAnalyticsService.getEcosystemAnalytics(userId)` |
| `ecosystemAnalyticsService.getAnalytics(userId)` | `unifiedAnalyticsService.getAnalytics(userId)` |
| `roiCalculatorService.calculate(userId)` | `unifiedAnalyticsService.calculateROI(userId)` |
| `roiCalculatorService.calculateSingleVideo(metrics)` | `unifiedAnalyticsService.calculateVideoROI(metrics)` |
| `viralPredictorService.predictViralScore(request)` | `viralIntelligenceService.predictScore(request)` |
| `viralPredictorService.predict(transcript, metadata)` | `viralIntelligenceService.predict(transcript, metadata)` |
| `viralAnalyzerService.analyzeViralContent(request)` | `viralIntelligenceService.analyzeContent(request)` |
| `dopamineOptimizerService.analyzeContent(request)` | `viralIntelligenceService.optimizeEngagement(request)` |
| `culturalAdapterService.adaptContent(request)` | `localizationService.adaptCulturally(request)` |
| `culturalAdapterService.adapt(content, region)` | `localizationService.adaptForRegion(content, region)` |
| `culturalAdapterService.getSupportedRegions()` | `localizationService.getSupportedRegions()` |
| `vernacularService.translate(request)` | `localizationService.translate(request)` |
| `contentMultiplierService.multiply(request)` | `contentMultiplierV2Service.multiply(request)` |

### 2.1 Update `analytics.route.ts`

```typescript
// BEFORE
import { ecosystemAnalyticsService } from '../services/ecosystem-analytics.service';

// AFTER
import { unifiedAnalyticsService } from '../services/unified-analytics.service';

// Update method calls:
// ecosystemAnalyticsService.getAnalytics(userId) → unifiedAnalyticsService.getAnalytics(userId)
```

### 2.2 Update `roi.route.ts`

```typescript
// BEFORE
import { roiCalculatorService } from '../services/roi-calculator.service';

// AFTER
import { unifiedAnalyticsService } from '../services/unified-analytics.service';

// Update method calls:
// roiCalculatorService.calculate(userId) → unifiedAnalyticsService.calculateROI(userId)
```

### 2.3 Update `viral.route.ts`

```typescript
// BEFORE
import { viralPredictorService } from '../services/viral-predictor.service';

// AFTER
import { viralIntelligenceService } from '../services/viral-intelligence.service';

// Update method calls:
// viralPredictorService.predict(transcript, metadata) → viralIntelligenceService.predict(transcript, metadata)
```

### 2.4 Update `cultural.route.ts`

```typescript
// BEFORE
import { culturalAdapterService } from '../services/cultural-adapter.service';

// AFTER
import { localizationService } from '../services/localization.service';

// Update method calls:
// culturalAdapterService.adapt(content, targetRegion) → localizationService.adaptForRegion(content, targetRegion)
// culturalAdapterService.getSupportedRegions() → localizationService.getSupportedRegions()
```

### 2.5 Wire Mock Routes to Unified Services

These routes currently use mock data. Update them to use the unified services:

#### `analytics-dashboard.route.ts`
```typescript
// ADD import
import { unifiedAnalyticsService } from '../services/unified-analytics.service';

// REPLACE mock with:
const metrics = await unifiedAnalyticsService.getDashboardMetrics(userId, timeRange);
res.json(metrics);
```

#### `dopamine.route.ts`
```typescript
// ADD import
import { viralIntelligenceService } from '../services/viral-intelligence.service';

// REPLACE mock with:
const optimization = await viralIntelligenceService.optimizeEngagement({
  content: transcript,
  contentType: 'video_script'
});
res.json(optimization);
```

#### `viral-analyzer.route.ts`
```typescript
// ADD import
import { viralIntelligenceService } from '../services/viral-intelligence.service';

// REPLACE mock with:
const analysis = await viralIntelligenceService.analyzeContent(request);
res.json(analysis);
```

#### `vernacular.route.ts`
```typescript
// ADD import
import { localizationService } from '../services/localization.service';

// REPLACE mock with:
const translation = await localizationService.translateToLanguage(content, targetLanguage);
res.json(translation);
```

#### `multiply.route.ts`
```typescript
// ADD import
import { contentMultiplierV2Service } from '../services/content-multiplier-v2.service';

// REPLACE mock with:
const result = await contentMultiplierV2Service.multiply(request);
res.json(result);
```

---

## PHASE 3: UPDATE FRONTEND API CLIENT

Update `frontend/services/api.ts`:

### 3.1 Update multiply endpoint to use V2

```typescript
// BEFORE
multiply = {
  generate: (data: MultiplyGenerateRequest) =>
    this.request<MultiplyGenerateResponse>('/api/multiply/generate', {
      method: 'POST',
      body: data,
      timeout: 120000,
    }),
};

// AFTER
multiply = {
  generate: (data: MultiplyGenerateRequest) =>
    this.request<MultiplyGenerateResponse>('/api/multiply-v2/generate', {
      method: 'POST',
      body: data,
      timeout: 120000,
    }),
};
```

---

## PHASE 4: DELETE REDUNDANT FILES

After all imports are updated and build passes, delete these files:

### Services to Delete
```
src/services/content-multiplier.service.ts
```

### Routes to Delete (Optional - can keep as aliases)
```
src/routes/multiply.route.ts  (if frontend updated to use multiply-v2)
```

### Update `src/index.ts`

Remove these imports if routes are deleted:
```typescript
// REMOVE if deleting multiply.route.ts
import multiplyRoute from './routes/multiply.route';
app.use('/api/multiply', multiplyRoute);
```

---

## PHASE 5: VALIDATION

### 5.1 Build Check
```bash
npm run build
```

### 5.2 Test Check
```bash
npm test
```

### 5.3 Verify No Broken Imports
```bash
grep -r "ecosystem-analytics.service" src/routes/
grep -r "roi-calculator.service" src/routes/
grep -r "viral-predictor.service" src/routes/
grep -r "viral-analyzer.service" src/routes/
grep -r "dopamine-optimizer.service" src/routes/
grep -r "cultural-adapter.service" src/routes/
grep -r "vernacular.service" src/routes/
grep -r "content-multiplier.service" src/routes/
```

All commands should return NO results.

### 5.4 Start Server Test
```bash
npm run dev
# Test endpoints manually
```

---

## EXECUTION CHECKLIST

- [ ] **Phase 1.1:** Create `unified-analytics.service.ts`
- [ ] **Phase 1.2:** Create `viral-intelligence.service.ts`
- [ ] **Phase 1.3:** Create `localization.service.ts`
- [ ] **Checkpoint:** `npm run build` passes
- [ ] **Phase 2.1:** Update `analytics.route.ts` imports
- [ ] **Phase 2.2:** Update `roi.route.ts` imports
- [ ] **Phase 2.3:** Update `viral.route.ts` imports
- [ ] **Phase 2.4:** Update `cultural.route.ts` imports
- [ ] **Phase 2.5:** Wire mock routes to unified services
- [ ] **Checkpoint:** `npm run build` passes
- [ ] **Phase 3.1:** Update frontend API client
- [ ] **Checkpoint:** Frontend build passes
- [ ] **Phase 4:** Delete redundant service files
- [ ] **Phase 5:** Full validation

---

## SUMMARY OF CHANGES

### Files Created (3)
1. `src/services/unified-analytics.service.ts`
2. `src/services/viral-intelligence.service.ts`
3. `src/services/localization.service.ts`

### Files Modified (Routes - 8)
1. `src/routes/analytics.route.ts`
2. `src/routes/roi.route.ts`
3. `src/routes/viral.route.ts`
4. `src/routes/cultural.route.ts`
5. `src/routes/analytics-dashboard.route.ts`
6. `src/routes/dopamine.route.ts`
7. `src/routes/viral-analyzer.route.ts`
8. `src/routes/vernacular.route.ts`

### Files Modified (Other - 2)
1. `src/index.ts` (remove multiply route if deleted)
2. `frontend/services/api.ts`

### Files Deleted (1)
1. `src/services/content-multiplier.service.ts`

### Routes Optionally Deleted (1)
1. `src/routes/multiply.route.ts`

### Services Kept (For Backward Compatibility)
These services are kept but wrapped by unified services:
- `ecosystem-analytics.service.ts` (used by unified-analytics)
- `analytics-dashboard.service.ts` (used by unified-analytics)
- `roi-calculator.service.ts` (used by unified-analytics)
- `viral-predictor.service.ts` (used by viral-intelligence)
- `viral-analyzer.service.ts` (used by viral-intelligence)
- `dopamine-optimizer.service.ts` (used by viral-intelligence)
- `cultural-adapter.service.ts` (used by localization)
- `vernacular.service.ts` (used by localization)

---

## NOTES

1. **Wrapper Pattern:** The unified services use composition (wrapping old services) rather than combining all code into one file. This preserves existing functionality while providing a unified interface.

2. **Backward Compatibility:** Old services are kept so that if any code still references them directly, it won't break. They can be deleted later after full verification.

3. **Gradual Migration:** Routes can be migrated one at a time. Each route update can be tested independently.

4. **Type Safety:** The unified services re-export types from the wrapped services, so TypeScript compatibility is maintained.
