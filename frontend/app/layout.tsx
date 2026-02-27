import type { Metadata } from 'next'
import './globals.css'
import { ToastProvider } from '@/context/ToastContext'
import { AppProvider } from '@/context/AppContext'
import ToastContainer from '@/components/ToastContainer'

export const metadata: Metadata = {
  title: 'Content Intelligence Platform',
  description: 'AI-powered content analysis and intelligence platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <AppProvider>
          <ToastProvider>
            {children}
            <ToastContainer />
          </ToastProvider>
        </AppProvider>
      </body>
    </html>
  )
}
