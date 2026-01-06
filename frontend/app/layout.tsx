import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pivotr - AI-powered career coaching',
  description: 'Stuck? Find your next move. Personalised career roadmaps in minutes with AI-powered coaching.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
