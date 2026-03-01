'use client';

import React, { useState } from 'react';
import SafetyDashboard from './SafetyDashboard';

/**
 * SafetyDashboard Example Usage
 * 
 * This file demonstrates various ways to use the SafetyDashboard component
 * in different scenarios.
 */

export default function SafetyDashboardExample() {
  const [activeTab, setActiveTab] = useState<'basic' | 'autoRefresh' | 'callbacks'>('basic');

  // Example callbacks
  const handleApprove = (checkId: string) => {
    console.log('✅ Content approved:', checkId);
    alert(`Content ${checkId} has been approved for publishing!`);
  };

  const handleReject = (checkId: string) => {
    console.log('❌ Content rejected:', checkId);
    alert(`Content ${checkId} has been rejected and will not be published.`);
  };

  const handleFlag = (checkId: string, reason: string) => {
    console.log('🚩 Content flagged:', checkId, 'Reason:', reason);
    alert(`Content ${checkId} has been flagged for manual review.\nReason: ${reason}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            SafetyDashboard Examples
          </h1>
          <p className="text-gray-600">
            Explore different usage scenarios for the SafetyDashboard component
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('basic')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'basic'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Basic Usage
          </button>
          <button
            onClick={() => setActiveTab('autoRefresh')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'autoRefresh'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Auto-Refresh
          </button>
          <button
            onClick={() => setActiveTab('callbacks')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'callbacks'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            With Callbacks
          </button>
        </div>

        {/* Code Examples */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Code Example</h2>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <code>
              {activeTab === 'basic' && `import SafetyDashboard from '@/components/SafetyDashboard';

export default function MyPage() {
  return (
    <SafetyDashboard contentId="content_123" />
  );
}`}
              {activeTab === 'autoRefresh' && `import SafetyDashboard from '@/components/SafetyDashboard';

export default function MyPage() {
  return (
    <SafetyDashboard
      contentId="content_123"
      autoRefresh={true}
      refreshInterval={30000} // 30 seconds
    />
  );
}`}
              {activeTab === 'callbacks' && `import SafetyDashboard from '@/components/SafetyDashboard';

export default function MyPage() {
  const handleApprove = (checkId: string) => {
    console.log('Approved:', checkId);
    // Call your API to approve content
  };

  const handleReject = (checkId: string) => {
    console.log('Rejected:', checkId);
    // Call your API to reject content
  };

  const handleFlag = (checkId: string, reason: string) => {
    console.log('Flagged:', checkId, reason);
    // Call your API to flag content
  };

  return (
    <SafetyDashboard
      contentId="content_123"
      onApprove={handleApprove}
      onReject={handleReject}
      onFlag={handleFlag}
    />
  );
}`}
            </code>
          </pre>
        </div>

        {/* Live Demo */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Live Demo</h2>
          
          {activeTab === 'basic' && (
            <div>
              <p className="text-gray-600 mb-4">
                Basic usage with default settings. No callbacks or auto-refresh.
              </p>
              <SafetyDashboard contentId="content_basic" />
            </h2>
          )}

          {activeTab === 'autoRefresh' && (
            <div>
              <p className="text-gray-600 mb-4">
                Dashboard with auto-refresh enabled. The safety score will update every 30 seconds.
              </p>
              <SafetyDashboard
                contentId="content_refresh"
                autoRefresh={true}
                refreshInterval={30000}
              />
            </div>
          )}

          {activeTab === 'callbacks' && (
            <div>
              <p className="text-gray-600 mb-4">
                Dashboard with action callbacks. Try clicking the action buttons to see alerts.
              </p>
              <SafetyDashboard
                contentId="content_callbacks"
                onApprove={handleApprove}
                onReject={handleReject}
                onFlag={handleFlag}
              />
            </div>
          )}
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-3">🚦</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Traffic Light System</h3>
            <p className="text-gray-600 text-sm">
              Visual indicator showing content safety status at a glance with green, yellow, and red lights.
            </p>
          </h3>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-3">🚨</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Violation Alerts</h3>
            <p className="text-gray-600 text-sm">
              Detailed alerts with severity levels, confidence scores, and platform-specific impacts.
            </p>
          </h3>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Real-time Metrics</h3>
            <p className="text-gray-600 text-sm">
              Live safety score visualization with animated progress bars and key metrics.
            </p>
          </h3>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-3">✅</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Platform Compliance</h3>
            <p className="text-gray-600 text-sm">
              Check content against guidelines for YouTube, Instagram, TikTok, and more.
            </p>
          </h3>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-3">📜</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Violation History</h3>
            <p className="text-gray-600 text-sm">
              Timeline view of all violations with timestamps and detailed information.
            </p>
          </h3>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Quick Actions</h3>
            <p className="text-gray-600 text-sm">
              Approve, reject, flag, or re-check content with one-click actions.
            </p>
          </h3>
        </div>

        {/* Integration Guide */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🚀 Integration Guide</h2>
          <div className="space-y-3 text-gray-700">
            <div className="flex items-start space-x-2">
              <span className="font-bold text-blue-600">1.</span>
              <span>Import the SafetyDashboard component into your page</span>
            </span>
            <div className="flex items-start space-x-2">
              <span className="font-bold text-blue-600">2.</span>
              <span>Pass the contentId prop to identify the content being checked</span>
            </span>
            <div className="flex items-start space-x-2">
              <span className="font-bold text-blue-600">3.</span>
              <span>Add callback functions for approve, reject, and flag actions</span>
            </span>
            <div className="flex items-start space-x-2">
              <span className="font-bold text-blue-600">4.</span>
              <span>Enable autoRefresh for real-time monitoring (optional)</span>
            </span>
            <div className="flex items-start space-x-2">
              <span className="font-bold text-blue-600">5.</span>
              <span>Connect to your backend API to fetch real safety data</span>
            </span>
          </h2>
        </div>

        {/* API Integration Example */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">API Integration</h2>
          <p className="text-gray-600 mb-4">
            To integrate with your backend, replace the mock data with API calls:
          </p>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <code>{`// In your SafetyDashboard component
useEffect(() => {
  const fetchSafetyData = async () => {
    try {
      const response = await fetch(\`/api/safety/check/\${contentId}\`);
      const data = await response.json();
      setSafetyData(data);
    } catch (error) {
      console.error('Failed to fetch safety data:', error);
    }
  };

  fetchSafetyData();
  
  if (autoRefresh) {
    const interval = setInterval(fetchSafetyData, refreshInterval);
    return () => clearInterval(interval);
  }
}, [contentId, autoRefresh, refreshInterval]);`}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
