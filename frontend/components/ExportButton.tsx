'use client'

import { useState } from 'react'
import { ExportFormat, ContentItem } from '@/types/content'

interface ExportButtonProps {
  data: ContentItem[];
}

export default function ExportButton({ data }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const exportFormats: ExportFormat[] = [
    { type: 'pdf', label: 'Export as PDF', icon: '📄' },
    { type: 'json', label: 'Export as JSON', icon: '📋' },
    { type: 'csv', label: 'Export as CSV', icon: '📊' },
  ]

  const handleExport = async (format: ExportFormat['type']) => {
    setIsExporting(true)
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 1500))

    try {
      let content = ''
      let filename = `content-export-${Date.now()}`
      let mimeType = ''

      switch (format) {
        case 'json':
          content = JSON.stringify(data, null, 2)
          filename += '.json'
          mimeType = 'application/json'
          break
        
        case 'csv':
          const headers = ['ID', 'Title', 'Platform', 'Language', 'Status', 'Views', 'Likes', 'Shares', 'Comments']
          const rows = data.map(item => [
            item.id,
            item.title,
            item.platform,
            item.language,
            item.status,
            item.engagement.views,
            item.engagement.likes,
            item.engagement.shares,
            item.engagement.comments,
          ])
          content = [headers, ...rows].map(row => row.join(',')).join('\n')
          filename += '.csv'
          mimeType = 'text/csv'
          break
        
        case 'pdf':
          // For PDF, we'll create a simple text representation
          content = data.map(item => 
            `Title: ${item.title}\nPlatform: ${item.platform}\nLanguage: ${item.language}\nStatus: ${item.status}\nViews: ${item.engagement.views}\n\n`
          ).join('---\n\n')
          filename += '.txt' // Using .txt as a simple alternative to PDF
          mimeType = 'text/plain'
          break
      }

      // Create and trigger download
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setIsOpen(false)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-purple-500/50 transition-all flex items-center gap-2"
        disabled={isExporting}
      >
        {isExporting ? (
          <>
            <div
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            />
            Exporting...
          </>
        ) : (
          <>
            <span className="text-xl">📥</span>
            Export Data
          </>
        )}
      </div>

      
        {isOpen && !isExporting && (
          <div
            className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-50"
          >
            {exportFormats.map((format, index) => (
              <button
                key={format.type}
                onClick={() => handleExport(format.type)}
                className="w-full px-4 py-3 text-left text-white hover:bg-gray-700 transition-colors flex items-center gap-3"
              >
                <span className="text-2xl">{format.icon}</span>
                <span className="font-medium">{format.label}</span>
              </div>
            ))}
          </div>
        )}
      

      {/* Backdrop */}
      
        {isOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      
    </div>
  )
}
