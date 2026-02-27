import type { Metadata } from 'next'
import './globals.css'

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
        {children}
      </body>
    </html>
  )
}
