import type { Metadata } from 'next'
import { Instrument_Sans, Lora } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const instrumentSans = Instrument_Sans({ 
  subsets: ["latin"],
  variable: '--font-instrument'
});

// Lora as a stand-in for Recolta (similar elegant serif)
// Replace with actual Recolta font when font files are available
const lora = Lora({
  subsets: ["latin"],
  weight: ['400', '500', '600', '700'],
  variable: '--font-recolta'
});

export const metadata: Metadata = {
  title: 'Yele - Learn Guitar Your Way',
  description: 'Yele teaches you to learn by doing on any string instrument. Just you, your instrument, and music you actually want to make.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${instrumentSans.variable} ${lora.variable} font-sans antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
