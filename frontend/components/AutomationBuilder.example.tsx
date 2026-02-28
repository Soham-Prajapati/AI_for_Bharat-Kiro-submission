'use client'

import { useState } from 'react'
import AutomationBuilder, { Automation } from './AutomationBuilder'

/**
 * Example usage of the AutomationBuilder component
 * 
 * This demonstrates how to integrate the AutomationBuilder into your application
 * with save, test, and list functionality.
 */

export default function AutomationBuilderExample() {
  const [automations, setAutomations] = useState<Automation[]>([
    {
      id: '1',
      name: 'Auto-post to Instagram',
      description: 'Automatically post generated content to Instagram when new videos are uploaded',
      trigger: {
        type: 'upload',
        config: {}
      },
      conditions: [
        {
          id: 'c1',
          field: 'fileType',
          operator: 'equals',
          value: 'video'
        }
      ],
      actions: [
        {
          id: 'a1',
          type: 'generate_content',
          config: {
            contentType: 'instagram_post',
            template: 'viral'
          },
          order: 0
        },
        {
          id: 'a2',
          type: 'post_platform',
          config: {
            platform: 'instagram',
            account: 'main'
          },
          order: 1
        }
      ],
      status: 'active',
      createdAt: '2024-01-15T10:00:00Z',
      lastRun: '2024-01-20T14:30:00Z',
      runCount: 42
    },
    {
      id: '2',
      name: 'Daily Content Generation',
      description: 'Generate and schedule content every day at 9 AM',
      trigger: {
        type: 'schedule',
        config: {
          time: '09:00',
          frequency: 'daily'
        }
      },
      conditions: [],
      actions: [
        {
          id: 'a3',
          type: 'generate_content',
          config: {
            contentType: 'multi_platform',
            template: 'trending'
          },
          order: 0
        },
        {
          id: 'a4',
          type: 'send_notification',
          config: {
            type: 'email',
            recipient: 'team@example.com'
          },
          order: 1
        }
      ],
      status: 'active',
      createdAt: '2024-01-10T08:00:00Z',
      lastRun: '2024-01-21T09:00:00Z',
      runCount: 11
    }
  ])

  const handleSave = (automation: Automation) => {
    setAutomations(prev => {
      const existing = prev.find(a => a.id === automation.id)
      if (existing) {
        return prev.map(a => a.id === automation.id ? automation : a)
      }
      return [...prev, automation]
    })
    
    console.log('Automation saved:', automation)
    alert(`Automation "${automation.name}" saved successfully!`)
  }

  const handleTest = (automation: Automation) => {
    console.log('Testing automation:', automation)
    alert(`Testing automation "${automation.name}"...\n\nThis would execute the workflow in test mode.`)
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <AutomationBuilder
        onSave={handleSave}
        onTest={handleTest}
        existingAutomations={automations}
      />
    </div>
  )
}
