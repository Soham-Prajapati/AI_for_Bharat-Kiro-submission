'use client'

import { usePathname } from 'next/navigation'
import ConditionalSidebar from './ConditionalSidebar'

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLanding = pathname === '/'

  if (isLanding) {
    // Full-window layout for the landing page — no sidebar, no overflow container
    // Window scroll is used so Lenis + GSAP ScrollTrigger work natively
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
