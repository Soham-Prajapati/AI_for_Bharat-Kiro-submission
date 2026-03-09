'use client'

import { usePathname } from 'next/navigation'
import ConditionalSidebar from './ConditionalSidebar'

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const noSidebar = ['/', '/login', '/register', '/onboarding'].includes(pathname ?? '')

  if (noSidebar) {
    // Full-window layout — no sidebar, no overflow container
    return <>{children}</>
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <ConditionalSidebar />
      <main id="main-scroll" className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
