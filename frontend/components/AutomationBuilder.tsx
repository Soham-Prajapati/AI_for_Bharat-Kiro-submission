'use client'

import { useState, useCallback } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type TriggerType = 'upload' | 'schedule' | 'platform_post' | 'content_generated'
export type ActionType = 'generate_content' | 'post_platform' | 'send_notification' | 'run_workflow'
export type ConditionOperator = 'equals' | 'contains' | 'greater_than' | 'less_than'
export type AutomationStatus = 'active' | 'inactive' | 'draft'

export interface Condition {
  id: string
  field: string
  operator: ConditionOperator
  value: string
}

export interface Action {
  id: string
  type: ActionType
  config: Record<string, any>
  order: number
}

export interface Trigger {
  type: TriggerType
  config: Record<string, any>
}

export interface Automation {
  id: string
  name: string
  description: string
  trigger: Trigger
  conditions: Condition[]
  actions: Action[]
  status: AutomationStatus
  createdAt: string
  lastRun?: string
  runCount: number
}

interface AutomationBuilderProps {
  onSave?: (automation: Automation) => void
  onTest?: (automation: Automation) => void
  existingAutomations?: Automation[]
}

// ============================================================================
// CONSTANTS
// ============================================================================

const TRIGGER_OPTIONS = [
  {
    type: 'upload' as TriggerType,
    label: 'On New Upload',
    icon: '📤',
    description: 'Triggered when new content is uploaded',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    type: 'schedule' as TriggerType,
    label: 'On Schedule',
    icon: '⏰',
    description: 'Triggered at specific times or intervals',
    color: 'from-purple-500 to-pink-500'
  },
  {
    type: 'platform_post' as TriggerType,
    label: 'On Platform Post',
    icon: '📱',
    description: 'Triggered when content is posted to a platform',
    color: 'from-green-500 to-emerald-500'
  },
  {
    type: 'content_generated' as TriggerType,
    label: 'On Content Generated',
    icon: '✨',
    description: 'Triggered when AI generates new content',
    color: 'from-orange-500 to-red-500'
  }
]

const ACTION_OPTIONS = [
  {
    type: 'generate_content' as ActionType,
    label: 'Generate Content',
    icon: '🤖',
    description: 'Use AI to generate new content',
    color: 'from-purple-500 to-indigo-500'
  },
  {
    type: 'post_platform' as ActionType,
    label: 'Post to Platform',
    icon: '🚀',
    description: 'Publish content to social platforms',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    type: 'send_notification' as ActionType,
    label: 'Send Notification',
    icon: '🔔',
    description: 'Send email or push notification',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    type: 'run_workflow' as ActionType,
    label: 'Run Workflow',
    icon: '⚙️',
    description: 'Execute another automation workflow',
    color: 'from-green-500 to-teal-500'
  }
]

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AutomationBuilder({
  onSave,
  onTest,
  existingAutomations = []
}: AutomationBuilderProps) {
  const [view, setView] = useState<'builder' | 'list'>('builder')
  const [automationName, setAutomationName] = useState('')
  const [automationDescription, setAutomationDescription] = useState('')
  const [selectedTrigger, setSelectedTrigger] = useState<Trigger | null>(null)
  const [conditions, setConditions] = useState<Condition[]>([])
  const [actions, setActions] = useState<Action[]>([])
  const [showTriggerSelector, setShowTriggerSelector] = useState(false)
  const [showActionSelector, setShowActionSelector] = useState(false)
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null)

  // Generate unique ID
  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  // Add condition
  const addCondition = () => {
    setConditions([
      ...conditions,
      {
        id: generateId(),
        field: '',
        operator: 'equals',
        value: ''
      }
    ])
  }

  // Remove condition
  const removeCondition = (id: string) => {
    setConditions(conditions.filter(c => c.id !== id))
  }

  // Update condition
  const updateCondition = (id: string, updates: Partial<Condition>) => {
    setConditions(conditions.map(c => c.id === id ? { ...c, ...updates } : c))
  }

  // Add action
  const addAction = (type: ActionType) => {
    setActions([
      ...actions,
      {
        id: generateId(),
        type,
        config: {},
        order: actions.length
      }
    ])
    setShowActionSelector(false)
  }

  // Remove action
  const removeAction = (id: string) => {
    setActions(actions.filter(a => a.id !== id))
  }

  // Update action config
  const updateActionConfig = (id: string, config: Record<string, any>) => {
    setActions(actions.map(a => a.id === id ? { ...a, config } : a))
  }

  // Save automation
  const handleSave = () => {
    if (!automationName || !selectedTrigger || actions.length === 0) {
      alert('Please provide a name, trigger, and at least one action')
      return
    }

    const automation: Automation = {
      id: editingAutomation?.id || generateId(),
      name: automationName,
      description: automationDescription,
      trigger: selectedTrigger,
      conditions,
      actions,
      status: 'draft',
      createdAt: editingAutomation?.createdAt || new Date().toISOString(),
      runCount: editingAutomation?.runCount || 0
    }

    onSave?.(automation)
    resetBuilder()
  }

  // Test automation
  const handleTest = () => {
    if (!selectedTrigger || actions.length === 0) {
      alert('Please configure trigger and actions before testing')
      return
    }

    const automation: Automation = {
      id: 'test',
      name: automationName || 'Test Automation',
      description: automationDescription,
      trigger: selectedTrigger,
      conditions,
      actions,
      status: 'draft',
      createdAt: new Date().toISOString(),
      runCount: 0
    }

    onTest?.(automation)
  }

  // Reset builder
  const resetBuilder = () => {
    setAutomationName('')
    setAutomationDescription('')
    setSelectedTrigger(null)
    setConditions([])
    setActions([])
    setEditingAutomation(null)
  }

  // Load automation for editing
  const loadAutomation = (automation: Automation) => {
    setEditingAutomation(automation)
    setAutomationName(automation.name)
    setAutomationDescription(automation.description)
    setSelectedTrigger(automation.trigger)
    setConditions(automation.conditions)
    setActions(automation.actions)
    setView('builder')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Automation Builder
              </h1>
              <p className="text-gray-400">
                Create powerful if-this-then-that workflows
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setView('builder')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  view === 'builder'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Builder
              </button>
              <button
                onClick={() => setView('list')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  view === 'list'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Automations ({existingAutomations.length})
              </button>
            </div>
          </div>
        </div>

        {/* Builder View */}
        {view === 'builder' && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6"
            >
              <h2 className="text-xl font-bold text-white mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Automation Name *
                  </label>
                  <input
                    type="text"
                    value={automationName}
                    onChange={(e) => setAutomationName(e.target.value)}
                    placeholder="e.g., Auto-post to Instagram"
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={automationDescription}
                    onChange={(e) => setAutomationDescription(e.target.value)}
                    placeholder="Describe what this automation does..."
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Trigger Section */}
            <div
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>⚡</span>
                  <span>Trigger</span>
                </h2>
                {selectedTrigger && (
                  <button
                    onClick={() => setShowTriggerSelector(true)}
                    className="text-sm text-purple-400 hover:text-purple-300"
                  >
                    Change Trigger
                  </button>
                )}
              </div>

              {!selectedTrigger ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {TRIGGER_OPTIONS.map((trigger, index) => (
                    <TriggerCard
                      key={trigger.type}
                      trigger={trigger}
                      index={index}
                      onSelect={() => setSelectedTrigger({ type: trigger.type, config: {} })}
                    />
                  ))}
                </div>
              ) : (
                <SelectedTrigger
                  trigger={selectedTrigger}
                  onRemove={() => setSelectedTrigger(null)}
                />
              )}
            </div>

            {/* Conditions Section */}
            {selectedTrigger && (
              <div
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>🔍</span>
                    <span>Conditions (Optional)</span>
                  </h2>
                  <button
                    onClick={addCondition}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm"
                  >
                    + Add Condition
                  </button>
                </div>

                {conditions.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <div className="text-4xl mb-2">🎯</div>
                    <p>No conditions set. This automation will run for all triggers.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {conditions.map((condition, index) => (
                      <ConditionRow
                        key={condition.id}
                        condition={condition}
                        index={index}
                        onUpdate={(updates) => updateCondition(condition.id, updates)}
                        onRemove={() => removeCondition(condition.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Actions Section */}
            {selectedTrigger && (
              <div
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>🎬</span>
                    <span>Actions *</span>
                  </h2>
                  <button
                    onClick={() => setShowActionSelector(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold text-sm"
                  >
                    + Add Action
                  </button>
                </div>

                {actions.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <div className="text-4xl mb-2">🚀</div>
                    <p>Add at least one action to complete your automation</p>
                  </div>
                ) : (
                  <div
                    className="space-y-3"
                  >
                    {actions.map((action, index) => (
                      <ActionRow
                        key={action.id}
                        action={action}
                        index={index}
                        onUpdate={(config) => updateActionConfig(action.id, config)}
                        onRemove={() => removeAction(action.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Visual Flow Diagram */}
            {selectedTrigger && actions.length > 0 && (
              <div
                className="bg-gradient-to-br from-purple-900/20 to-gray-800/50 backdrop-blur-sm rounded-xl border border-purple-700/30 p-6"
              >
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <span>📊</span>
                  <span>Workflow Preview</span>
                </h2>
                <FlowDiagram
                  trigger={selectedTrigger}
                  conditions={conditions}
                  actions={actions}
                />
              </div>
            )}

            {/* Action Buttons */}
            {selectedTrigger && (
              <div
                className="flex items-center justify-between gap-4"
              >
                <button
                  onClick={resetBuilder}
                  className="px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold"
                >
                  Reset
                </button>
                <div className="flex gap-4">
                  <button
                    onClick={handleTest}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold"
                  >
                    Test Automation
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold"
                  >
                    Save Automation
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* List View */}
        {view === 'list' && (
          <AutomationList
            automations={existingAutomations}
            onEdit={loadAutomation}
          />
        )}
      </div>

      {/* Action Selector Modal */}
      
        {showActionSelector && (
          <ActionSelectorModal
            onSelect={addAction}
            onClose={() => setShowActionSelector(false)}
          />
        )}
      
    </div>
  )
}

// ============================================================================
// TRIGGER CARD COMPONENT
// ============================================================================

interface TriggerCardProps {
  trigger: typeof TRIGGER_OPTIONS[0]
  index: number
  onSelect: () => void
}

function TriggerCard({ trigger, index, onSelect }: TriggerCardProps) {
  return (
    <div
      className={`bg-gradient-to-br ${trigger.color} p-6 rounded-xl cursor-pointer border-2 border-transparent hover:border-white/30 transition-all`}
      onClick={onSelect}
    >
      <div className="text-4xl mb-3">{trigger.icon}</div>
      <h3 className="text-lg font-bold text-white mb-2">{trigger.label}</h3>
      <p className="text-sm text-white/80">{trigger.description}</p>
    </div>
  )
}

// ============================================================================
// SELECTED TRIGGER COMPONENT
// ============================================================================

interface SelectedTriggerProps {
  trigger: Trigger
  onRemove: () => void
}

function SelectedTrigger({ trigger, onRemove }: SelectedTriggerProps) {
  const triggerOption = TRIGGER_OPTIONS.find(t => t.type === trigger.type)
  if (!triggerOption) return null

  return (
    <div
      className={`bg-gradient-to-br ${triggerOption.color} p-6 rounded-xl relative`}
    >
      <button
        onClick={onRemove}
        className="absolute top-3 right-3 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all"
      >
        ✕
      </button>
      <div className="flex items-start gap-4">
        <div className="text-5xl">{triggerOption.icon}</div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-2">{triggerOption.label}</h3>
          <p className="text-white/90 mb-4">{triggerOption.description}</p>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-xs text-white/70 mb-2">Trigger Configuration</div>
            <div className="text-sm text-white">
              {trigger.type === 'schedule' && 'Configure schedule settings...'}
              {trigger.type === 'upload' && 'Triggers on any new upload'}
              {trigger.type === 'platform_post' && 'Configure platform settings...'}
              {trigger.type === 'content_generated' && 'Triggers when AI generates content'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// CONDITION ROW COMPONENT
// ============================================================================

interface ConditionRowProps {
  condition: Condition
  index: number
  onUpdate: (updates: Partial<Condition>) => void
  onRemove: () => void
}

function ConditionRow({ condition, index, onUpdate, onRemove }: ConditionRowProps) {
  return (
    <div
      className="bg-gray-700/50 rounded-lg p-4 border border-gray-600"
    >
      <div className="flex items-center gap-3">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            value={condition.field}
            onChange={(e) => onUpdate({ field: e.target.value })}
            placeholder="Field name"
            className="px-3 py-2 bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-500 focus:outline-none text-sm"
          />
          <select
            value={condition.operator}
            onChange={(e) => onUpdate({ operator: e.target.value as ConditionOperator })}
            className="px-3 py-2 bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-500 focus:outline-none text-sm"
          >
            <option value="equals">Equals</option>
            <option value="contains">Contains</option>
            <option value="greater_than">Greater Than</option>
            <option value="less_than">Less Than</option>
          </select>
          <input
            type="text"
            value={condition.value}
            onChange={(e) => onUpdate({ value: e.target.value })}
            placeholder="Value"
            className="px-3 py-2 bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-500 focus:outline-none text-sm"
          />
        </div>
        <button
          onClick={onRemove}
          className="w-8 h-8 bg-red-600/20 hover:bg-red-600/40 rounded flex items-center justify-center text-red-400"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// ACTION ROW COMPONENT
// ============================================================================

interface ActionRowProps {
  action: Action
  index: number
  onUpdate: (config: Record<string, any>) => void
  onRemove: () => void
}

function ActionRow({ action, index, onUpdate, onRemove }: ActionRowProps) {
  const actionOption = ACTION_OPTIONS.find(a => a.type === action.type)
  if (!actionOption) return null

  return (
    <div
      className="bg-gray-700/50 rounded-lg p-4 border border-gray-600"
    >
      <div className="flex items-start gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="text-3xl">{actionOption.icon}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-white font-semibold">{actionOption.label}</h4>
              <span className="text-xs text-gray-400">#{index + 1}</span>
            </div>
            <p className="text-sm text-gray-400 mb-3">{actionOption.description}</p>
            
            {/* Action-specific configuration */}
            <div className="space-y-2">
              {action.type === 'generate_content' && (
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Content type"
                    className="px-3 py-2 bg-gray-600 text-white rounded border border-gray-500 focus:border-purple-500 focus:outline-none text-sm"
                    onChange={(e) => onUpdate({ ...action.config, contentType: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Template"
                    className="px-3 py-2 bg-gray-600 text-white rounded border border-gray-500 focus:border-purple-500 focus:outline-none text-sm"
                    onChange={(e) => onUpdate({ ...action.config, template: e.target.value })}
                  />
                </div>
              )}
              
              {action.type === 'post_platform' && (
                <div className="grid grid-cols-2 gap-2">
                  <select
                    className="px-3 py-2 bg-gray-600 text-white rounded border border-gray-500 focus:border-purple-500 focus:outline-none text-sm"
                    onChange={(e) => onUpdate({ ...action.config, platform: e.target.value })}
                  >
                    <option value="">Select platform</option>
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="youtube">YouTube</option>
                    <option value="twitter">Twitter</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Account"
                    className="px-3 py-2 bg-gray-600 text-white rounded border border-gray-500 focus:border-purple-500 focus:outline-none text-sm"
                    onChange={(e) => onUpdate({ ...action.config, account: e.target.value })}
                  />
                </div>
              )}
              
              {action.type === 'send_notification' && (
                <div className="grid grid-cols-2 gap-2">
                  <select
                    className="px-3 py-2 bg-gray-600 text-white rounded border border-gray-500 focus:border-purple-500 focus:outline-none text-sm"
                    onChange={(e) => onUpdate({ ...action.config, type: e.target.value })}
                  >
                    <option value="">Notification type</option>
                    <option value="email">Email</option>
                    <option value="push">Push</option>
                    <option value="slack">Slack</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Recipient"
                    className="px-3 py-2 bg-gray-600 text-white rounded border border-gray-500 focus:border-purple-500 focus:outline-none text-sm"
                    onChange={(e) => onUpdate({ ...action.config, recipient: e.target.value })}
                  />
                </div>
              )}
              
              {action.type === 'run_workflow' && (
                <input
                  type="text"
                  placeholder="Workflow ID or name"
                  className="w-full px-3 py-2 bg-gray-600 text-white rounded border border-gray-500 focus:border-purple-500 focus:outline-none text-sm"
                  onChange={(e) => onUpdate({ ...action.config, workflowId: e.target.value })}
                />
              )}
            </div>
          </div>
        </div>
        <button
          onClick={onRemove}
          className="w-8 h-8 bg-red-600/20 hover:bg-red-600/40 rounded flex items-center justify-center text-red-400"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// FLOW DIAGRAM COMPONENT
// ============================================================================

interface FlowDiagramProps {
  trigger: Trigger
  conditions: Condition[]
  actions: Action[]
}

function FlowDiagram({ trigger, conditions, actions }: FlowDiagramProps) {
  const triggerOption = TRIGGER_OPTIONS.find(t => t.type === trigger.type)

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Trigger Node */}
      <div
        className={`bg-gradient-to-br ${triggerOption?.color} p-4 rounded-xl min-w-[200px] text-center`}
      >
        <div className="text-3xl mb-2">{triggerOption?.icon}</div>
        <div className="text-white font-semibold text-sm">{triggerOption?.label}</div>
      </div>

      {/* Arrow */}
      <div
        className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"
      />

      {/* Conditions Node (if any) */}
      {conditions.length > 0 && (
        <>
          <div
            className="bg-blue-900/30 border-2 border-blue-500 p-4 rounded-xl min-w-[200px]"
          >
            <div className="text-2xl mb-2 text-center">🔍</div>
            <div className="text-white font-semibold text-sm text-center mb-2">
              Conditions ({conditions.length})
            </div>
            <div className="space-y-1">
              {conditions.slice(0, 2).map((condition, idx) => (
                <div key={idx} className="text-xs text-blue-300 truncate">
                  {condition.field || 'Field'} {condition.operator} {condition.value || 'value'}
                </div>
              ))}
              {conditions.length > 2 && (
                <div className="text-xs text-blue-400">+{conditions.length - 2} more</div>
              )}
            </div>
          </div>

          <div
            className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"
          />
        </>
      )}

      {/* Actions Nodes */}
      <div className="flex flex-col items-center gap-3 w-full max-w-md">
        {actions.map((action, index) => {
          const actionOption = ACTION_OPTIONS.find(a => a.type === action.type)
          return (
            <div
              key={action.id}
              className="w-full"
            >
              <div className={`bg-gradient-to-br ${actionOption?.color} p-4 rounded-xl`}>
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{actionOption?.icon}</div>
                  <div className="flex-1">
                    <div className="text-white font-semibold text-sm">
                      {actionOption?.label}
                    </div>
                    <div className="text-white/70 text-xs">Action #{index + 1}</div>
                  </div>
                </div>
              </div>
              {index < actions.length - 1 && (
                <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full mx-auto my-2" />
              )}
            </div>
          )
        })}
      </div>

      {/* Success Node */}
      <div
        className="w-1 h-8 bg-gradient-to-b from-pink-500 to-green-500 rounded-full"
      />

      <div
        className="bg-gradient-to-br from-green-500 to-emerald-500 p-4 rounded-xl min-w-[200px] text-center"
      >
        <div className="text-3xl mb-2">✅</div>
        <div className="text-white font-semibold text-sm">Automation Complete</div>
      </div>
    </div>
  )
}

// ============================================================================
// ACTION SELECTOR MODAL
// ============================================================================

interface ActionSelectorModalProps {
  onSelect: (type: ActionType) => void
  onClose: () => void
}

function ActionSelectorModal({ onSelect, onClose }: ActionSelectorModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-2xl border border-gray-700 p-6 max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">Select an Action</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center text-gray-300"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ACTION_OPTIONS.map((action, index) => (
            <div
              key={action.type}
              className={`bg-gradient-to-br ${action.color} p-5 rounded-xl cursor-pointer border-2 border-transparent hover:border-white/30 transition-all`}
              onClick={() => onSelect(action.type)}
            >
              <div className="text-4xl mb-3">{action.icon}</div>
              <h4 className="text-lg font-bold text-white mb-2">{action.label}</h4>
              <p className="text-sm text-white/80">{action.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// AUTOMATION LIST COMPONENT
// ============================================================================

interface AutomationListProps {
  automations: Automation[]
  onEdit: (automation: Automation) => void
}

function AutomationList({ automations, onEdit }: AutomationListProps) {
  const [filter, setFilter] = useState<AutomationStatus | 'all'>('all')

  const filteredAutomations = automations.filter(
    a => filter === 'all' || a.status === filter
  )

  const getStatusColor = (status: AutomationStatus) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'inactive': return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      case 'draft': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-4"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">Filter:</span>
          {(['all', 'active', 'inactive', 'draft'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                filter === status
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Automation Cards */}
      {filteredAutomations.length === 0 ? (
        <div
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-12 text-center"
        >
          <div className="text-6xl mb-4">🤖</div>
          <h3 className="text-xl font-bold text-white mb-2">No Automations Found</h3>
          <p className="text-gray-400">Create your first automation to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredAutomations.map((automation, index) => (
            <AutomationCard
              key={automation.id}
              automation={automation}
              index={index}
              onEdit={() => onEdit(automation)}
              getStatusColor={getStatusColor}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// AUTOMATION CARD COMPONENT
// ============================================================================

interface AutomationCardProps {
  automation: Automation
  index: number
  onEdit: () => void
  getStatusColor: (status: AutomationStatus) => string
}

function AutomationCard({ automation, index, onEdit, getStatusColor }: AutomationCardProps) {
  const triggerOption = TRIGGER_OPTIONS.find(t => t.type === automation.trigger.type)

  return (
    <div
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 hover:border-purple-500/50 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-white">{automation.name}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(automation.status)}`}>
              {automation.status}
            </span>
          </div>
          {automation.description && (
            <p className="text-sm text-gray-400 mb-3">{automation.description}</p>
          )}
        </div>
        <button
          onClick={onEdit}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold text-sm"
        >
          Edit
        </button>
      </div>

      {/* Workflow Summary */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`bg-gradient-to-br ${triggerOption?.color} px-3 py-2 rounded-lg flex items-center gap-2`}>
          <span className="text-xl">{triggerOption?.icon}</span>
          <span className="text-white text-sm font-semibold">{triggerOption?.label}</span>
        </div>
        <span className="text-gray-400">→</span>
        {automation.conditions.length > 0 && (
          <>
            <div className="bg-blue-900/30 border border-blue-500/30 px-3 py-2 rounded-lg">
              <span className="text-blue-400 text-sm">{automation.conditions.length} conditions</span>
            </div>
            <span className="text-gray-400">→</span>
          </>
        )}
        <div className="bg-purple-900/30 border border-purple-500/30 px-3 py-2 rounded-lg">
          <span className="text-purple-400 text-sm">{automation.actions.length} actions</span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <span>🔄</span>
          <span>Runs: {automation.runCount}</span>
        </div>
        {automation.lastRun && (
          <div className="flex items-center gap-2">
            <span>⏱️</span>
            <span>Last: {new Date(automation.lastRun).toLocaleDateString()}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span>📅</span>
          <span>Created: {new Date(automation.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  )
}
