'use client'

import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'

export default function ConditionalSidebar() {
  const pathname = usePathname()
  
  // Hide sidebar on landing page
  if (pathname === '/') {
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
