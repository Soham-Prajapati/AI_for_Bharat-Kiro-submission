import type { Metadata } from 'next'
import './globals.css'
import { ToastProvider } from '@/context/ToastContext'
import { AppProvider } from '@/context/AppContext'
import ToastContainer from '@/components/ToastContainer'
import ConditionalSidebar from '@/components/ConditionalSidebar'

export const metadata: Metadata = {
  title: 'ContentAI — 1 Video. 6 Platforms. 60 Seconds.',
  description: 'AI-powered content intelligence for Indian creators. Powered by AWS Bedrock.',
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
          <ToastProvider>
            <div className="flex h-screen overflow-hidden">
              <ConditionalSidebar />
              <main id="main-scroll" className="flex-1 overflow-y-auto">
                {children}
              </main>
            </div>
            <ToastContainer />
          </ToastProvider>
        </AppProvider>
      </body>
    </html>
  )
}
