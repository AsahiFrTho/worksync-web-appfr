import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist_Mono, Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/lib/theme-context'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
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
  colorScheme: 'dark light',
  themeColor: '#0A0A0A',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark bg-background" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
