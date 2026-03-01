'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="relative py-20 px-6 border-t border-white/[0.05]">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="font-display font-bold text-xl mb-3">Content<span className="bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">AI</span></div>
            <p className="text-text-tertiary text-sm leading-relaxed mb-3">
              AI-powered content intelligence for Indian creators. 1 Video. 6 Platforms. 60 Seconds.
            </p>
            <div className="flex gap-2 flex-wrap">
              {['AWS Bedrock', 'Claude 3'].map(t => (
                <span key={t} className="text-[0.6rem] px-2 py-0.5 rounded bg-accent-orange/10 border border-accent-orange/15 text-accent-orange font-mono">{t}</span>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-display font-semibold text-sm mb-4 text-text-primary">Product</h4>
            <ul className="space-y-2.5 text-text-secondary text-sm">
              <li><Link href="/upload" className="hover:text-text-primary transition-colors">Upload</Link></li>
              <li><Link href="/dashboard" className="hover:text-text-primary transition-colors">Dashboard</Link></li>
              <li><Link href="/analytics" className="hover:text-text-primary transition-colors">Analytics</Link></li>
              <li><Link href="/marketplace" className="hover:text-text-primary transition-colors">Marketplace</Link></li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-display font-semibold text-sm mb-4 text-text-primary">Features</h4>
            <ul className="space-y-2.5 text-text-secondary text-sm">
              <li>Multi-Platform Generation</li>
              <li>9 Indian Languages</li>
              <li>Creator DNA Analysis</li>
              <li>Viral Score Predictor</li>
            </ul>
          </div>

          {/* Team */}
          <div>
            <h4 className="font-display font-semibold text-sm mb-4 text-text-primary">Team</h4>
            <ul className="space-y-2.5 text-text-secondary text-sm">
              <li>AI for Bharat 2026</li>
              <li><Link href="/community" className="hover:text-text-primary transition-colors">Community</Link></li>
              <li><Link href="/membership" className="hover:text-text-primary transition-colors">Pricing</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/[0.05]">
          <p className="text-text-tertiary text-xs">© 2026 ContentAI. Built for AI for Bharat.</p>
          <p className="text-text-tertiary text-xs">Powered by AWS Bedrock · Claude 3 · AWS Transcribe</p>
        </div>
      </div>
    </footer>
  )
}
