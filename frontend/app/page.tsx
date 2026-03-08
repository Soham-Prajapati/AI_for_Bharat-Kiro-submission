'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import KLALanding from '@/components/landing/KLALanding'

export default function Home() {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated && user) {
      if (!user.onboardingComplete && !user.domain) {
        router.replace('/onboarding')
      } else {
        router.replace('/dashboard')
      }
    }
  }, [isAuthenticated, user, router])

  return <KLALanding />
}
