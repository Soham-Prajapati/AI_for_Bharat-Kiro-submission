'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'

const HIDE_NAVBAR_PATHS = ['/', '/login', '/register', '/onboarding']

export default function ConditionalNavbar() {
  const pathname = usePathname()

  if (pathname && HIDE_NAVBAR_PATHS.includes(pathname)) {
    return null
  }

  return <Navbar />
}
