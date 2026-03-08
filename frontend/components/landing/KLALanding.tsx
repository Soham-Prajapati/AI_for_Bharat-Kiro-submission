'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import KLACursor from '@/components/KLACursor'

const IterationF = dynamic(() => import('./IterationF'), { ssr: false, loading: () => <LandingLoader /> })

function LandingLoader() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-orange-500/30 animate-ping" />
          <div className="absolute inset-0 rounded-full border-t-2 border-orange-400 animate-spin" />
        </div>
        <span className="font-mono text-xs text-gray-400 tracking-widest animate-pulse">KLA</span>
      </div>
    </div>
  )
}

export default function KLALanding() {
  return (
    <div className="relative">
      <KLACursor accentColor="#F97316" />
      <Suspense fallback={<LandingLoader />}>
        <IterationF />
      </Suspense>
    </div>
  )
}
