'use client';

import React, { useState, useEffect } from 'react';
// ============================================================================
// TYPES
// ============================================================================

interface Violation {
  violationId: string;
  category: 'explicit' | 'violence' | 'hate_speech' | 'harassment' | 'spam' | 'misinformation' | 'copyright' | 'privacy' | 'dangerous';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  description: string;
  location?: {
    start?: number;
    end?: number;
    timestamp?: number;
    boundingBox?: {
      left: number;
      top: number;
      width: number;
      height: number;
    };
  };
  platformViolations?: string[];
  timestamp: string;
}

interface SafetyCheckResult {
  checkId: string;
  contentId: string;
  safe: boolean;
  overallScore: number;
  violations: Violation[];
  warnings: string[];
  suggestions: string[];
  platformCompliance: Record<string, {
    compliant: boolean;
    violations: string[];
    warnings: string[];
  }>;
  moderationLabels?: {
    label: string;
    confidence: number;
    parentLabel?: string;
  }[];
  checkedAt: string;
}

interface SafetyDashboardProps {
  contentId?: string;
  onApprove?: (checkId: string) => void;
  onReject?: (checkId: string) => void;
  onFlag?: (checkId: string, reason: string) => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockViolations: Violation[] = [
  {
    violationId: 'v1',
    category: 'explicit',
    severity: 'high',
    confidence: 85,
    description: 'Potentially explicit or adult content detected',
    platformViolations: ['youtube', 'instagram', 'tiktok'],
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    violationId: 'v2',
    category: 'spam',
    severity: 'medium',
    confidence: 72,
    description: 'Content appears to be spam or overly promotional',
    platformViolations: ['twitter', 'linkedin'],
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    violationId: 'v3',
    category: 'misinformation',
    severity: 'low',
    confidence: 60,
    description: 'Content may contain unverified claims',
    platformViolations: ['facebook'],
    timestamp: new Date(Date.now() - 10800000).toISOString(),
  },
];

const mockSafetyCheck: SafetyCheckResult = {
  checkId: 'check_123',
  contentId: 'content_456',
  safe: false,
  overallScore: 65,
  violations: mockViolations,
  warnings: [
    'Excessive use of capital letters may be perceived as shouting',
    'Mild profanity detected - may not be suitable for all audiences',
  ],
  suggestions: [
    'Remove or blur explicit content',
    'Reduce promotional language',
    'Add credible sources to support claims',
  ],
  platformCompliance: {
    youtube: {
      compliant: false,
      violations: ['explicit: Potentially explicit or adult content detected'],
      warnings: ['Content may require age gate on youtube'],
    },
    instagram: {
      compliant: false,
      violations: ['explicit: Potentially explicit or adult content detected'],
      warnings: [],
    },
    twitter: {
      compliant: false,
      violations: ['spam: Content appears to be spam or overly promotional'],
      warnings: [],
    },
  },
  moderationLabels: [
    { label: 'Explicit Content', confidence: 85 },
    { label: 'Spam', confidence: 72 },
  ],
  checkedAt: new Date().toISOString(),
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SafetyDashboard({
  contentId,
  onApprove,
  onReject,
  onFlag,
  autoRefresh = false,
  refreshInterval = 30000,
}: SafetyDashboardProps) {
  const [safetyData, setSafetyData] = useState<SafetyCheckResult>(mockSafetyCheck);
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [historyView, setHistoryView] = useState(false);

  // Auto-refresh safety data
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        // In production, fetch from API
        // For now, simulate data update
        setSafetyData(prev => ({
          ...prev,
          overallScore: Math.max(0, Math.min(100, prev.overallScore + Math.random() * 10 - 5)),
          checkedAt: new Date().toISOString(),
        }));
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  // Get traffic light color based on score
  const getTrafficLightStatus = (score: number): 'green' | 'yellow' | 'red' => {
    if (score >= 80) return 'green';
    if (score >= 50) return 'yellow';
    return 'red';
  };

  const trafficLightStatus = getTrafficLightStatus(safetyData.overallScore);

  // Get severity color
  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case 'explicit': return '🔞';
      case 'violence': return '⚠️';
      case 'hate_speech': return '🚫';
      case 'harassment': return '😡';
      case 'spam': return '📧';
      case 'misinformation': return '❌';
      case 'copyright': return '©️';
      case 'privacy': return '🔒';
      case 'dangerous': return '☢️';
      default: return '⚠️';
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor(diff / 60000);
    
    if (hours > 24) return date.toLocaleDateString();
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Safety & Moderation</h1>
          <p className="text-gray-600 mt-1">Content safety analysis and compliance monitoring</p>
        </div>
        <button
          onClick={() => setHistoryView(!historyView)}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          {historyView ? '📊 Dashboard' : '📜 History'}
        </button>
      </div>

      {/* Traffic Light System */}
      <div
        className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Safety Status</h2>
            <p className="text-gray-600">Overall content safety score</p>
          </div>

          {/* Traffic Light */}
          <div className="flex flex-col items-center space-y-3">
            <div className="relative">
              <div className="w-24 h-72 bg-gray-900 rounded-full p-4 flex flex-col justify-around items-center shadow-xl">
                {/* Red Light */}
                <div
                  className="w-16 h-16 rounded-full"
                />
                {/* Yellow Light */}
                <div
                  className="w-16 h-16 rounded-full"
                />
                {/* Green Light */}
                <div
                  className="w-16 h-16 rounded-full"
                />
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">{safetyData.overallScore}</div>
              <div className="text-sm text-gray-600">Safety Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Safety Score Visualization */}
      <div
        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-4">Safety Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Overall Score */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
            <div className="text-sm text-blue-600 font-medium mb-1">Overall Score</div>
            <div className="text-3xl font-bold text-blue-900">{safetyData.overallScore}</div>
            <div className="mt-2 bg-blue-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-blue-600"
              />
            </div>
          </div>

          {/* Violations */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4">
            <div className="text-sm text-red-600 font-medium mb-1">Violations</div>
            <div className="text-3xl font-bold text-red-900">{safetyData.violations.length}</div>
            <div className="text-xs text-red-600 mt-1">
              {safetyData.violations.filter(v => v.severity === 'critical' || v.severity === 'high').length} critical/high
            </div>
          </div>

          {/* Warnings */}
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4">
            <div className="text-sm text-yellow-600 font-medium mb-1">Warnings</div>
            <div className="text-3xl font-bold text-yellow-900">{safetyData.warnings.length}</div>
            <div className="text-xs text-yellow-600 mt-1">Requires attention</div>
          </div>

          {/* Platform Compliance */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
            <div className="text-sm text-green-600 font-medium mb-1">Compliant Platforms</div>
            <div className="text-3xl font-bold text-green-900">
              {Object.values(safetyData.platformCompliance).filter(p => p.compliant).length}/
              {Object.keys(safetyData.platformCompliance).length}
            </div>
            <div className="text-xs text-green-600 mt-1">Platforms approved</div>
          </div>
        </div>
      </div>

      {/* Violation Alerts */}
      <div
        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-4">Violation Alerts</h3>
        <div className="space-y-3">
{safetyData.violations.map((violation, index) => (
              <div
                key={violation.violationId}
                className={`border rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow ${getSeverityColor(violation.severity)}`}
                onClick={() => setSelectedViolation(violation)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="text-2xl">{getCategoryIcon(violation.category)}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-bold capitalize">{violation.category.replace('_', ' ')}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium uppercase ${getSeverityColor(violation.severity)}`}>
                          {violation.severity}
                        </span>
                      </div>
                      <p className="text-sm mb-2">{violation.description}</p>
                      <div className="flex items-center space-x-4 text-xs">
                        <span className="flex items-center space-x-1">
                          <span className="font-medium">Confidence:</span>
                          <span>{violation.confidence}%</span>
                        </span>
                        {violation.platformViolations && violation.platformViolations.length > 0 && (
                          <span className="flex items-center space-x-1">
                            <span className="font-medium">Affects:</span>
                            <span>{violation.platformViolations.join(', ')}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatTimestamp(violation.timestamp)}
                  </div>
                </div>
              </div>
            ))}
{safetyData.violations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">✅</div>
              <div className="font-medium">No violations detected</div>
              <div className="text-sm">Content meets all safety guidelines</div>
            </div>
          )}
        </div>
      </div>

      {/* Platform Guidelines Compliance Checker */}
      <div
        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-4">Platform Compliance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(safetyData.platformCompliance).map(([platform, compliance]) => (
            <div
              key={platform}
              className={`border rounded-xl p-4 ${
                compliance.compliant
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold capitalize">{platform}</span>
                <span className="text-2xl">
                  {compliance.compliant ? '✅' : '❌'}
                </span>
              </div>
              
              {compliance.violations.length > 0 && (
                <div className="mb-2">
                  <div className="text-xs font-medium text-red-600 mb-1">Violations:</div>
                  <ul className="text-xs space-y-1">
                    {compliance.violations.map((v, i) => (
                      <li key={i} className="text-red-700">• {v}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {compliance.warnings.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-yellow-600 mb-1">Warnings:</div>
                  <ul className="text-xs space-y-1">
                    {compliance.warnings.map((w, i) => (
                      <li key={i} className="text-yellow-700">• {w}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {compliance.compliant && (
                <div className="text-xs text-green-700">
                  All guidelines met ✓
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content Moderation Results */}
      <div
        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-4">Moderation Labels</h3>
        <div className="flex flex-wrap gap-2">
          {safetyData.moderationLabels && safetyData.moderationLabels.length > 0 ? (
            safetyData.moderationLabels.map((label, index) => (
              <div
                key={index}
                className="bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 rounded-full px-4 py-2"
              >
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-purple-900">{label.label}</span>
                  <span className="text-xs text-purple-600">{label.confidence}%</span>
                </div>
                {label.parentLabel && (
                  <div className="text-xs text-purple-600 mt-0.5">
                    Category: {label.parentLabel}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-gray-500 text-sm">No moderation labels detected</div>
          )}
        </div>
      </div>

      {/* Suggestions */}
      {safetyData.suggestions.length > 0 && (
        <div
          className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 border border-blue-200"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4">💡 Suggestions</h3>
          <ul className="space-y-2">
            {safetyData.suggestions.map((suggestion, index) => (
              <li
                key={index}
                className="flex items-start space-x-2"
              >
                <span className="text-blue-600 font-bold">•</span>
                <span className="text-gray-700">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Violation History Timeline */}
      {historyView && (
        <div
          className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6">Violation History</h3>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />
            
            {/* Timeline items */}
            <div className="space-y-6">
              {safetyData.violations.map((violation, index) => (
                <div
                  key={violation.violationId}
                  className="relative pl-16"
                >
                  {/* Timeline dot */}
                  <div className={`absolute left-6 w-5 h-5 rounded-full border-4 border-white ${
                    violation.severity === 'critical' ? 'bg-red-500' :
                    violation.severity === 'high' ? 'bg-orange-500' :
                    violation.severity === 'medium' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`} />
                  
                  {/* Content */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{getCategoryIcon(violation.category)}</span>
                        <span className="font-bold capitalize">{violation.category.replace('_', ' ')}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium uppercase ${getSeverityColor(violation.severity)}`}>
                          {violation.severity}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{formatTimestamp(violation.timestamp)}</span>
                    </div>
                    <p className="text-sm text-gray-700">{violation.description}</p>
                    {violation.location?.timestamp && (
                      <div className="text-xs text-gray-500 mt-2">
                        📍 Timestamp: {violation.location.timestamp}s
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Action Buttons */}
      <div
        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onApprove?.(safetyData.checkId)}
            disabled={!safetyData.safe}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
              safetyData.safe
                ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-200'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <span className="text-xl">✅</span>
            <span>Approve Content</span>
          </button>

          <button
            onClick={() => onReject?.(safetyData.checkId)}
            className="flex items-center space-x-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-red-200"
          >
            <span className="text-xl">❌</span>
            <span>Reject Content</span>
          </button>

          <button
            onClick={() => setShowFlagModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-yellow-200"
          >
            <span className="text-xl">🚩</span>
            <span>Flag for Review</span>
          </button>

          <button
            onClick={() => setSafetyData(mockSafetyCheck)}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-200"
          >
            <span className="text-xl">🔄</span>
            <span>Re-check Content</span>
          </button>
        </div>
      </div>

      {/* Flag Modal */}
{showFlagModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowFlagModal(false)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-4">🚩 Flag Content</h3>
              <p className="text-gray-600 mb-4">
                Please provide a reason for flagging this content for manual review.
              </p>
              
              <textarea
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                placeholder="Describe the issue..."
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
              />
              
              <div className="flex space-x-3 mt-4">
                <button
                  onClick={() => {
                    onFlag?.(safetyData.checkId, flagReason);
                    setShowFlagModal(false);
                    setFlagReason('');
                  }}
                  disabled={!flagReason.trim()}
                  className="flex-1 px-4 py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
                >
                  Submit Flag
                </button>
                <button
                  onClick={() => {
                    setShowFlagModal(false);
                    setFlagReason('');
                  }}
                  className="px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
{/* Violation Detail Modal */}
{selectedViolation && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedViolation(null)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{getCategoryIcon(selectedViolation.category)}</span>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 capitalize">
                      {selectedViolation.category.replace('_', ' ')}
                    </h3>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium uppercase mt-1 ${getSeverityColor(selectedViolation.severity)}`}>
                      {selectedViolation.severity}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedViolation(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-700">{selectedViolation.description}</p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Confidence</h4>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                      />
                    </div>
                    <span className="font-bold text-gray-900">{selectedViolation.confidence}%</span>
                  </div>
                </div>

                {selectedViolation.platformViolations && selectedViolation.platformViolations.length > 0 && (
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Affected Platforms</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedViolation.platformViolations.map((platform) => (
                        <span
                          key={platform}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium"
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedViolation.location && (
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Location</h4>
                    <div className="bg-gray-50 rounded-lg p-3 text-sm">
                      {selectedViolation.location.timestamp !== undefined && (
                        <div>Timestamp: {selectedViolation.location.timestamp}s</div>
                      )}
                      {selectedViolation.location.start !== undefined && (
                        <div>Position: {selectedViolation.location.start} - {selectedViolation.location.end}</div>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Detected</h4>
                  <p className="text-gray-600 text-sm">{formatTimestamp(selectedViolation.timestamp)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
</div>
  );
}
