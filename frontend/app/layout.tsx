import type { Metadata } from 'next'
import './globals.css'
import { ToastProvider } from '@/context/ToastContext'
import { AppProvider } from '@/context/AppContext'
import { DesignProvider } from '@/context/DesignContext'
import ToastContainer from '@/components/ToastContainer'
import ConditionalLayout from '@/components/ConditionalLayout'
import DesignSwitcherPanel from '@/components/DesignSwitcherPanel'

export const metadata: Metadata = {
  title: 'KLA — 1 Video. 6 Platforms. 60 Seconds.',
  description: 'KLA is India\'s AI-powered content engine. Upload one video, get platform-perfect content for 6 networks in 9 Indian languages in 60 seconds.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-bg-base text-text-primary font-sans">
        <AppProvider>
          <DesignProvider>
            <ToastProvider>
              <ConditionalLayout>
                {children}
              </ConditionalLayout>
              <ToastContainer />
              <DesignSwitcherPanel />
            </ToastProvider>
          </DesignProvider>
        </AppProvider>
      </body>
    </html>
  )
}
