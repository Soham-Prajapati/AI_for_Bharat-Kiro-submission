'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Upload', href: '/upload', icon: '⬆️' },
  { name: 'Analytics', href: '/analytics', icon: '📈' },
  { name: 'Workspace', href: '/workspace', icon: '👥' },
  { name: 'Marketplace', href: '/marketplace', icon: '🛍️' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const { user, isAuthenticated } = useAuth()

  const displayName = user?.name || 'Guest'
  const displayEmail = user?.email || ''
  const initials = displayName.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase() || 'G'

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-bg-elevated border-r border-border-subtle transition-all duration-200 z-50 ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border-subtle">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-sm">
              C
            </div>
            <span className="text-base font-semibold text-text-primary font-display tracking-tight">KLA</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-bg-overlay rounded-md transition-colors text-text-tertiary hover:text-text-primary"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={`transition-transform ${collapsed ? 'rotate-180' : ''}`}>
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-2 space-y-0.5">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-all text-sm ${
                isActive
                  ? 'bg-brand-600 text-white font-medium'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-overlay'
              }`}
              title={collapsed ? item.name : undefined}
            >
              <span className="text-base">{item.icon}</span>
              {!collapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User Section — only show when authenticated */}
      {isAuthenticated && (
        <div className="absolute bottom-0 left-0 right-0 p-2 border-t border-border-subtle">
          <button className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-bg-overlay transition-colors w-full text-left">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
              {initials}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-text-primary truncate">{displayName}</div>
                <div className="text-xs text-text-tertiary truncate">{displayEmail}</div>
              </div>
            )}
          </button>
        </div>
      )}
    </aside>
  )
}
