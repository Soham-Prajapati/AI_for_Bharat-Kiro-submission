# ViralAnalyzer Architecture - Visual Diagrams

## Component Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                      ViralAnalyzer                          │
│                    (Main Container)                         │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │              ViralAnalyzerInput                       │ │
│  │  ┌─────────────────────────────────────────────────┐ │ │
│  │  │  • URL Input Field                              │ │ │
│  │  │  • Analyze Button                               │ │ │
│  │  │  • Validation Messages                          │ │ │
│  │  └─────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │           ViralAnalyzerLoading                        │ │
│  │  ┌─────────────────────────────────────────────────┐ │ │
│  │  │  • Progress Bar                                 │ │ │
│  │  │  • Loading Animation                            │ │ │
│  │  │  • Status Messages                              │ │ │
│  │  └─────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │            ViralAnalyzerError                         │ │
│  │  ┌─────────────────────────────────────────────────┐ │ │
│  │  │  • Error Icon                                   │ │ │
│  │  │  • Error Message                                │ │ │
│  │  │  • Retry Button                                 │ │ │
│  │  └─────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │          ViralAnalyzerResults                         │ │
│  │  ┌─────────────────────────────────────────────────┐ │ │
│  │  │  ViralScoreGauge (Overall Score)                │ │ │
│  │  └─────────────────────────────────────────────────┘ │ │
│  │  ┌─────────────────────────────────────────────────┐ │ │
│  │  │  PatternsSection                                │ │ │
│  │  │    • PatternCard (Hook)                         │ │ │
│  │  │    • PatternCard (Pacing)                       │ │ │
│  │  │    • PatternCard (Emotion)                      │ │ │
│  │  └─────────────────────────────────────────────────┘ │ │
│  │  ┌─────────────────────────────────────────────────┐ │ │
│  │  │  TimelineSection                                │ │ │
│  │  │    • TimelineEvent (0:00 - Visual)              │ │ │
│  │  │    • TimelineEvent (0:15 - Emotional)           │ │ │
│  │  └─────────────────────────────────────────────────┘ │ │
│  │  ┌─────────────────────────────────────────────────┐ │ │
│  │  │  GuideSection                                   │ │ │
│  │  │    • Strategic Guide Text                       │ │ │
│  │  └─────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

```
┌──────────────┐
│     USER     │
│   (Input)    │
└──────┬───────┘
       │ Enter URL
       ▼
┌──────────────────────────────────────────┐
│         ViralAnalyzer Component          │
│  ┌────────────────────────────────────┐  │
│  │   useViralAnalyzer Hook            │  │
│  │   • State Management               │  │
│  │   • analyze(url)                   │  │
│  └────────┬───────────────────────────┘  │
└───────────┼──────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────────┐
│      Check Cache (Session Storage)        │
│  ┌─────────────────────────────────────┐  │
│  │  ViralAnalyzerCache.get(url)        │  │
│  └─────────┬───────────────────────────┘  │
└───────────┼───────────────────────────────┘
            │
      ┌─────┴─────┐
      │           │
   Found?      Not Found
      │           │
      ▼           ▼
┌──────────┐  ┌────────────────────────────┐
│  Return  │  │  ViralAnalyzerService      │
│  Cached  │  │  • validateUrl()           │
│  Result  │  │  • detectPlatform()        │
└──────────┘  │  • analyzeVideo()          │
              └────────┬───────────────────┘
                       │
                       ▼
              ┌────────────────────────────┐
              │      API Client            │
              │  • Request formatting      │
              │  • Error handling          │
              │  • Retry logic             │
              └────────┬───────────────────┘
                       │
                       ▼
              ┌────────────────────────────┐
              │   Backend Endpoint         │
              │   POST /api/viral-analyzer │
              │        /analyze            │
              └────────┬───────────────────┘
                       │
                       ▼
              ┌────────────────────────────┐
              │   Response Processing      │
              │  • Validate structure      │
              │  • Map errors              │
              └────────┬───────────────────┘
                       │
                       ▼
              ┌────────────────────────────┐
              │   Cache Result             │
              │   ViralAnalyzerCache.set() │
              └────────┬───────────────────┘
                       │
                       ▼
              ┌────────────────────────────┐
              │   Update Component State   │
              │  • analysis = result       │
              │  • loadingState = complete │
              └────────┬───────────────────┘
                       │
                       ▼
              ┌────────────────────────────┐
              │      Render Results        │
              │  • Viral Score Gauge       │
              │  • Patterns List           │
              │  • Timeline Hooks          │
              │  • Strategic Guide         │
              └────────────────────────────┘
```

---

## State Machine Diagram

```
                    ┌──────────┐
                    │   IDLE   │
                    └────┬─────┘
                         │
                    User clicks
                    "Analyze"
                         │
                         ▼
                  ┌─────────────┐
                  │ VALIDATING  │
                  └──────┬──────┘
                         │
                    ┌────┴────┐
                    │         │
              Valid URL   Invalid URL
                    │         │
                    ▼         ▼
            ┌──────────┐  ┌───────┐
            │ANALYZING │  │ ERROR │
            └────┬─────┘  └───┬───┘
                 │            │
            ┌────┴────┐       │
            │         │       │
       Success    Failure     │
            │         │       │
            ▼         ▼       │
        ┌─────────┐ ┌───────┐│
        │COMPLETE │ │ ERROR ││
        └────┬────┘ └───┬───┘│
             │          │    │
             │          │    │
             └──────────┴────┘
                    │
              User clicks
              "Try Again"
              or "Analyze
               Another"
                    │
                    ▼
              ┌──────────┐
              │   IDLE   │
              └──────────┘
```

---

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      API Request                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                    ┌────┴────┐
                    │         │
               Success    Error
                    │         │
                    ▼         ▼
            ┌──────────┐  ┌──────────────────────────────────┐
            │  Return  │  │      Catch Error                 │
            │  Result  │  │  • ApiError                      │
            └──────────┘  │  • NetworkError                  │
                          │  • TimeoutError                  │
                          │  • ValidationError               │
                          └────────┬─────────────────────────┘
                                   │
                                   ▼
                          ┌────────────────────────────────────┐
                          │   mapApiError()                    │
                          │  • Determine error type            │
                          │  • Get user-friendly message       │
                          │  • Check if retryable              │
                          └────────┬───────────────────────────┘
                                   │
                                   ▼
                          ┌────────────────────────────────────┐
                          │   ViralAnalyzerError               │
                          │  • code: NETWORK_ERROR             │
                          │  • message: Technical message      │
                          │  • userMessage: Friendly message   │
                          │  • retryable: true/false           │
                          └────────┬───────────────────────────┘
                                   │
                              ┌────┴────┐
                              │         │
                        Retryable?   Not Retryable
                              │         │
                              ▼         ▼
                    ┌──────────────┐  ┌──────────────┐
                    │ Show Retry   │  │ Show Error   │
                    │ Button       │  │ Message Only │
                    └──────────────┘  └──────────────┘
```

---

## Cache Strategy Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    analyze(url) Called                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
                ┌─────────────────────┐
                │  Normalize URL      │
                │  • Lowercase        │
                │  • Remove trailing/ │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │  Check Cache        │
                │  sessionStorage     │
                └──────────┬──────────┘
                           │
                      ┌────┴────┐
                      │         │
                  Found?    Not Found
                      │         │
                      ▼         ▼
            ┌──────────────┐  ┌──────────────┐
            │ Check Expiry │  │  Make API    │
            │ (1 hour)     │  │  Request     │
            └──────┬───────┘  └──────┬───────┘
                   │                 │
              ┌────┴────┐            │
              │         │            │
          Expired   Valid            │
              │         │            │
              ▼         ▼            ▼
        ┌─────────┐ ┌──────────┐ ┌──────────┐
        │  Make   │ │  Return  │ │  Cache   │
        │  API    │ │  Cached  │ │  Result  │
        │ Request │ │  Result  │ │          │
        └────┬────┘ └──────────┘ └────┬─────┘
             │                        │
             └────────────┬───────────┘
                          │
                          ▼
                ┌──────────────────────┐
                │  Enforce Cache Limit │
                │  (Max 50 entries)    │
                │  Remove oldest if    │
                │  limit exceeded      │
                └──────────────────────┘
```

---

## Component Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                    Component Mount                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
                ┌─────────────────────┐
                │  Initialize State   │
                │  • loadingState:    │
                │    'idle'           │
                │  • analysis: null   │
                │  • error: null      │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │  Render Input Form  │
                └──────────┬──────────┘
                           │
                    User enters URL
                    and clicks Analyze
                           │
                           ▼
                ┌─────────────────────┐
                │  setState:          │
                │  'validating'       │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │  Validate URL       │
                └──────────┬──────────┘
                           │
                      ┌────┴────┐
                      │         │
                  Valid     Invalid
                      │         │
                      ▼         ▼
            ┌──────────────┐  ┌──────────────┐
            │  setState:   │  │  setState:   │
            │ 'analyzing'  │  │   'error'    │
            └──────┬───────┘  └──────────────┘
                   │
                   ▼
            ┌──────────────────┐
            │  Start Progress  │
            │  Simulation      │
            └──────┬───────────┘
                   │
                   ▼
            ┌──────────────────┐
            │  Make API Call   │
            └──────┬───────────┘
                   │
              ┌────┴────┐
              │         │
          Success   Failure
              │         │
              ▼         ▼
      ┌──────────┐  ┌──────────┐
      │setState: │  │setState: │
      │'complete'│  │ 'error'  │
      └────┬─────┘  └────┬─────┘
           │             │
           ▼             ▼
      ┌──────────┐  ┌──────────┐
      │  Render  │  │  Render  │
      │ Results  │  │  Error   │
      └──────────┘  └──────────┘
```

---

## Service Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              ViralAnalyzerService (Static Class)            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Public Methods:                                            │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  analyzeVideo(url: string)                            │ │
│  │    → Promise<AnalyzeViralResponse>                    │ │
│  └───────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  extractVideoId(url: string)                          │ │
│  │    → string | null                                    │ │
│  └───────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  getPlatformDisplayName(platform?: string)            │ │
│  │    → string                                           │ │
│  └───────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  formatTimestamp(timestamp: string)                   │ │
│  │    → string                                           │ │
│  └───────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  timestampToSeconds(timestamp: string)                │ │
│  │    → number                                           │ │
│  └───────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  getStrengthCategory(strength: number)                │ │
│  │    → 'weak' | 'moderate' | 'strong'                  │ │
│  └───────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  getScoreColor(score: number)                         │ │
│  │    → string                                           │ │
│  └───────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  sortPatternsByStrength(patterns: any[])              │ │
│  │    → any[]                                            │ │
│  └───────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  sortHooksByTimestamp(hooks: any[])                   │ │
│  │    → any[]                                            │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  Private Methods:                                           │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  isValidVideoUrl(url: string) → boolean               │ │
│  └───────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  normalizeUrl(url: string) → string                   │ │
│  └───────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  detectPlatform(url: string) → string | undefined     │ │
│  └───────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  validateResponse(response: any) → void               │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Type System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Type Hierarchy                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Core Data Types                                            │
│  ├── TimelineEvent                                          │
│  │   ├── timestamp: string                                 │
│  │   ├── type: 'visual' | 'emotional' | ...               │
│  │   ├── impact: 'high' | 'medium' | 'low'                │
│  │   └── description?: string                              │
│  │                                                          │
│  ├── ViralPattern                                           │
│  │   ├── type: string                                      │
│  │   ├── strength: number (0-1)                            │
│  │   ├── description: string                               │
│  │   └── recommendations?: string[]                        │
│  │                                                          │
│  └── ViralAnalysis                                          │
│      ├── videoUrl: string                                  │
│      ├── viralScore: number (0-100)                        │
│      ├── patterns: ViralPattern[]                          │
│      ├── hooks: TimelineEvent[]                            │
│      ├── guide: string                                     │
│      ├── analyzedAt?: string                               │
│      └── source?: string                                   │
│                                                             │
│  Request/Response Types                                     │
│  ├── AnalyzeViralRequest                                    │
│  │   ├── videoUrl: string                                  │
│  │   └── metadata?: { ... }                                │
│  │                                                          │
│  └── AnalyzeViralResponse extends ViralAnalysis             │
│      ├── success?: boolean                                 │
│      └── error?: string                                    │
│                                                             │
│  State Types                                                │
│  ├── AnalysisLoadingState                                   │
│  │   'idle' | 'validating' | 'analyzing' |                │
│  │   'complete' | 'error'                                  │
│  │                                                          │
│  └── ViralAnalyzerState                                     │
│      ├── loadingState: AnalysisLoadingState                │
│      ├── analysis: ViralAnalysis | null                    │
│      ├── error: { ... } | null                             │
│      ├── videoUrl: string                                  │
│      └── progress: number                                  │
│                                                             │
│  Error Types                                                │
│  ├── ViralAnalyzerErrorCode (enum)                         │
│  │   INVALID_URL, NETWORK_ERROR, TIMEOUT,                 │
│  │   RATE_LIMIT, SERVER_ERROR, etc.                       │
│  │                                                          │
│  └── ViralAnalyzerError                                     │
│      ├── code: ViralAnalyzerErrorCode                      │
│      ├── message: string                                   │
│      ├── userMessage: string                               │
│      ├── retryable: boolean                                │
│      └── details?: any                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Integration Points

```
┌─────────────────────────────────────────────────────────────┐
│                  External Dependencies                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  API Client (frontend/services/api.ts)                      │
│  └── viralAnalyzer.analyze(data)                            │
│      • Already implemented                                  │
│      • Returns Promise<AnalyzeViralResponse>                │
│                                                             │
│  Toast System (frontend/context/ToastContext.tsx)           │
│  └── showToast({ type, message })                           │
│      • Optional integration                                 │
│      • For success/error notifications                      │
│                                                             │
│  ViralScoreGauge (frontend/components/ViralScoreGauge.tsx)  │
│  └── <ViralScoreGauge score={87} size="large" />           │
│      • Already exists                                       │
│      • Displays viral score visually                        │
│                                                             │
│  Backend Endpoint (src/routes/viral-analyzer.route.ts)      │
│  └── POST /api/viral-analyzer/analyze                       │
│      • Already implemented                                  │
│      • Returns mock data (to be replaced)                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

These diagrams provide a visual understanding of the ViralAnalyzer architecture, making it easier to understand the relationships between components, data flow, and system behavior.
