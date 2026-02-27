import Hero from '@/components/Hero'
import FeatureGrid from '@/components/FeatureGrid'
import PricingCards from '@/components/PricingCards'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900">
      <Hero />
      <FeatureGrid />
      <PricingCards />
      <Footer />
    </main>
  )
}
