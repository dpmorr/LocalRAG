import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Career Mentor',
  description: 'Your personalized AI-powered career guidance platform',
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
