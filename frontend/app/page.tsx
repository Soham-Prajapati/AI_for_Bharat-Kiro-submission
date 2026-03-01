'use client'

import dynamic from 'next/dynamic'
import Hero from '@/components/Hero'
import ProblemStatement from '@/components/ProblemStatement'
import ShiftSection from '@/components/ShiftSection'
import ProductShowcase from '@/components/ProductShowcase'
import HowItWorks from '@/components/HowItWorks'
import FeatureGrid from '@/components/FeatureGrid'
import TryItDemo from '@/components/TryItDemo'
import PricingCards from '@/components/PricingCards'
import CtaSection from '@/components/CtaSection'
import Footer from '@/components/Footer'

const CustomCursor = dynamic(() => import('@/components/CustomCursor'), { ssr: false })

export default function Home() {
  return (
    <div className="min-h-screen bg-bg-base relative">
      <CustomCursor />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/[0.04]">
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between h-16">
          <span className="font-display font-bold text-lg">
            Content<span className="bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">AI</span>
          </span>
          <div className="hidden md:flex items-center gap-8 text-sm text-text-secondary">
            <a href="#showcase" className="hover:text-text-primary transition-colors">Product</a>
            <a href="#try" className="hover:text-text-primary transition-colors">Features</a>
            <a href="#try" className="hover:text-text-primary transition-colors">Try It</a>
            <a href="/membership" className="hover:text-text-primary transition-colors">Pricing</a>
          </div>
          <a href="/upload" className="bg-gradient-to-br from-brand-500 to-brand-600 text-white font-semibold text-sm px-5 py-2 rounded-lg hover:shadow-[0_0_25px_rgba(99,102,241,0.3)] transition-all">
            Get Started
          </a>
        </div>
      </nav>

      {/* Cinematic sections */}
      <Hero />
      <ProblemStatement />
      <ShiftSection />
      <ProductShowcase />
      <HowItWorks />
      <FeatureGrid />
      <TryItDemo />
      <PricingCards />
      <CtaSection />
      <Footer />
    </div>
  )
}
