'use client'

import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'

const NO_SIDEBAR_ROUTES = ['/', '/login', '/register', '/onboarding']

export default function ConditionalSidebar() {
  const pathname = usePathname()
  
  // Hide sidebar on landing, auth and onboarding pages
  if (NO_SIDEBAR_ROUTES.includes(pathname ?? '')) {
    return null
  }
  
  return (
    <>
      <Sidebar />
      <style jsx global>{`
        main {
          margin-left: 16rem;
        }
      `}</style>
    </>
  )
}
