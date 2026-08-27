import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: 'KaushalPulse — Skilling Outcomes & Impact, Maharashtra',
  description:
    'Longitudinal skilling-outcomes and impact-measurement platform for Maharashtra: training, certification, placement, wage progression, and retention.',
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/favicon1.png', sizes: 'any' },
    ],
    apple: [
      { url: '/favicon1.png' },
    ],
    shortcut: ['/favicon1.png'],
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#2b3f8c',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  )
}
