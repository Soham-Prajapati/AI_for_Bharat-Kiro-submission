/**
 * CreativeDirector Component Examples
 * Demonstrates various usage patterns and configurations
 */

import React, { useState } from 'react'
import CreativeDirector, {
  ScoreCard,
  FeedbackItem,
  ImprovementList,
  OverallScoreGauge,
} from './CreativeDirector'
import { AnalyzeContentResponse } from '@/types/api'

// ============================================================================
// Example 1: Basic Usage
// ============================================================================

export function BasicExample() {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Basic Usage</h2>
      <CreativeDirector
        contentId="example-basic"
        initialContent="This is a sample content for analysis. It demonstrates the basic usage of the CreativeDirector component."
      />
    </div>
  )
}

// ============================================================================
// Example 2: With Callback
// ============================================================================

export function CallbackExample() {
  const [analysisResult, setAnalysisResult] = useState<AnalyzeContentResponse | null>(null)

  const handleAnalysisComplete = (result: AnalyzeContentResponse) => {
    console.log('Analysis completed:', result)
    setAnalysisResult(result)
    // You can save to state, send to analytics, etc.
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">With Callback</h2>
      <CreativeDirector
        contentId="example-callback"
        onAnalysisComplete={handleAnalysisComplete}
      />
      {analysisResult && (
        <div className="mt-4 p-4 bg-green-900/20 border border-green-800/30 rounded-lg">
          <p className="text-green-400">
            Analysis complete! Overall score: {analysisResult.score.overall}
          </p>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Example 3: Auto-Analyze
// ============================================================================

export function AutoAnalyzeExample() {
  const sampleContent = `
    Welcome to our comprehensive guide on content creation.
    In this article, we'll explore the key elements that make content engaging.
    From structure to pacing, we'll cover everything you need to know.
  `

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Auto-Analyze on Mount</h2>
      <CreativeDirector
        contentId="example-auto"
        initialContent={sampleContent}
        autoAnalyze={true}
      />
    </div>
  )
}

// ============================================================================
// Example 4: Without Header
// ============================================================================

export function NoHeaderExample() {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Embedded (No Header)</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Your Dashboard</h3>
          <p className="text-gray-400">Other content here...</p>
        </div>
        <div>
          <CreativeDirector
            contentId="example-embedded"
            showHeader={false}
            className="max-w-2xl"
          />
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Example 5: Using Individual Sub-components
// ============================================================================

export function SubComponentsExample() {
  const mockFeedback = [
    {
      aspect: 'Opening Hook',
      rating: 'excellent' as const,
      comment: 'Strong opening that immediately captures attention with a compelling question.',
    },
    {
      aspect: 'Content Flow',
      rating: 'good' as const,
      comment: 'Logical progression of ideas with smooth transitions between sections.',
    },
    {
      aspect: 'Call to Action',
      rating: 'fair' as const,
      comment: 'CTA is present but could be more prominent and specific.',
    },
  ]

  const mockImprovements = [
    'Add specific statistics or data points to support your claims',
    'Include more concrete examples to illustrate key concepts',
    'Strengthen the call-to-action with urgency and clear next steps',
    'Break up long paragraphs for better readability',
  ]

  return (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-bold mb-4">Individual Sub-components</h2>

      {/* Score Cards */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Score Cards</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ScoreCard label="Structure" score={85} icon="🏗️" delay={0} />
          <ScoreCard label="Pacing" score={78} icon="⚡" delay={0.1} />
          <ScoreCard label="Engagement" score={92} icon="🎯" delay={0.2} />
          <ScoreCard label="Clarity" score={88} icon="💎" delay={0.3} />
        </div>
      </div>

      {/* Overall Score Gauge */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Overall Score Gauge</h3>
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <OverallScoreGauge score={86} />
        </div>
      </div>

      {/* Feedback Items */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Feedback Items</h3>
        <div className="space-y-4">
          {mockFeedback.map((feedback, index) => (
            <FeedbackItem key={index} feedback={feedback} index={index} />
          ))}
        </div>
      </div>

      {/* Improvement List */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Improvement List</h3>
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <ImprovementList improvements={mockImprovements} />
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Example 6: Integration with AppContext
// ============================================================================

export function AppContextExample() {
  // This example shows how to integrate with AppContext
  // Uncomment when using in actual application

  /*
  import { useAppContext } from '@/context/AppContext'

  const { state, actions } = useAppContext()
  const currentContent = state.content.currentItem

  const handleAnalysisComplete = (result: AnalyzeContentResponse) => {
    // Save analysis result to context
    actions.updateContentItem(currentContent.id, {
      metadata: {
        ...currentContent.metadata,
        lastAnalysis: result,
        lastAnalyzedAt: new Date().toISOString(),
      },
    })
  }

  return (
    <CreativeDirector
      contentId={currentContent?.id}
      initialContent={currentContent?.content}
      onAnalysisComplete={handleAnalysisComplete}
    />
  )
  */

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">AppContext Integration</h2>
      <p className="text-gray-400 mb-4">
        See source code for integration example with AppContext
      </p>
      <CreativeDirector contentId="example-context" />
    </div>
  )
}

// ============================================================================
// Example 7: Custom Styling
// ============================================================================

export function CustomStylingExample() {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Custom Styling</h2>
      <CreativeDirector
        contentId="example-custom"
        className="bg-gradient-to-br from-purple-900 via-gray-900 to-blue-900"
        showHeader={true}
      />
    </div>
  )
}

// ============================================================================
// Example 8: Multiple Analyses
// ============================================================================

export function MultipleAnalysesExample() {
  const [analyses, setAnalyses] = useState<AnalyzeContentResponse[]>([])

  const handleAnalysisComplete = (result: AnalyzeContentResponse) => {
    setAnalyses((prev) => [...prev, result])
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Multiple Analyses Tracking</h2>
      <CreativeDirector
        contentId="example-multiple"
        onAnalysisComplete={handleAnalysisComplete}
      />
      {analyses.length > 0 && (
        <div className="mt-8 bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Analysis History</h3>
          <div className="space-y-2">
            {analyses.map((analysis, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg"
              >
                <span className="text-sm text-gray-400">
                  Analysis #{index + 1}
                </span>
                <span className="text-lg font-bold text-blue-400">
                  Score: {analysis.score.overall}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Example 9: Comparison View
// ============================================================================

export function ComparisonExample() {
  const [version1, setVersion1] = useState<AnalyzeContentResponse | null>(null)
  const [version2, setVersion2] = useState<AnalyzeContentResponse | null>(null)

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">A/B Comparison</h2>
      <div className="grid grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Version A</h3>
          <CreativeDirector
            contentId="version-a"
            showHeader={false}
            onAnalysisComplete={setVersion1}
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Version B</h3>
          <CreativeDirector
            contentId="version-b"
            showHeader={false}
            onAnalysisComplete={setVersion2}
          />
        </div>
      </div>
      {version1 && version2 && (
        <div className="mt-8 bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Comparison Results</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400 mb-2">Version A</p>
              <p className="text-3xl font-bold text-blue-400">
                {version1.score.overall}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-2">Version B</p>
              <p className="text-3xl font-bold text-green-400">
                {version2.score.overall}
              </p>
            </div>
          </div>
          <div className="mt-4 text-center">
            {version2.score.overall > version1.score.overall ? (
              <p className="text-green-400">Version B performs better! 🎉</p>
            ) : version1.score.overall > version2.score.overall ? (
              <p className="text-blue-400">Version A performs better! 🎉</p>
            ) : (
              <p className="text-gray-400">Both versions are equal</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Example 10: Minimal Score Display
// ============================================================================

export function MinimalScoreExample() {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Minimal Score Display</h2>
      <div className="max-w-md mx-auto space-y-4">
        <ScoreCard label="Overall Quality" score={86} icon="⭐" animated={true} />
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <ImprovementList
            improvements={[
              'Add more specific examples',
              'Improve opening hook',
              'Strengthen call-to-action',
            ]}
          />
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Export All Examples
// ============================================================================

export default function CreativeDirectorExamples() {
  const [activeExample, setActiveExample] = useState('basic')

  const examples = [
    { id: 'basic', name: 'Basic Usage', component: BasicExample },
    { id: 'callback', name: 'With Callback', component: CallbackExample },
    { id: 'auto', name: 'Auto-Analyze', component: AutoAnalyzeExample },
    { id: 'noheader', name: 'No Header', component: NoHeaderExample },
    { id: 'subcomponents', name: 'Sub-components', component: SubComponentsExample },
    { id: 'context', name: 'AppContext', component: AppContextExample },
    { id: 'styling', name: 'Custom Styling', component: CustomStylingExample },
    { id: 'multiple', name: 'Multiple Analyses', component: MultipleAnalysesExample },
    { id: 'comparison', name: 'A/B Comparison', component: ComparisonExample },
    { id: 'minimal', name: 'Minimal Display', component: MinimalScoreExample },
  ]

  const ActiveComponent = examples.find((ex) => ex.id === activeExample)?.component || BasicExample

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          CreativeDirector Examples
        </h1>

        {/* Example Selector */}
        <div className="mb-8 flex flex-wrap gap-2 justify-center">
          {examples.map((example) => (
            <button
              key={example.id}
              onClick={() => setActiveExample(example.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeExample === example.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {example.name}
            </button>
          ))}
        </div>

        {/* Active Example */}
        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
          <ActiveComponent />
        </div>
      </div>
    </div>
  )
}
