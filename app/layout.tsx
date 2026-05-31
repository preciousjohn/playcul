import type { Metadata } from 'next'
import { DM_Sans, Instrument_Serif } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: '--font-instrument'
})

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-recolta'
})

export const metadata: Metadata = {
  title: 'Yele - Learn Guitar Your Way',
  description: 'Yele teaches you to learn by doing on any string instrument. Just you, your instrument, and music you actually want to make.',
  generator: 'v0.app',
  icons: {
    icon: '/icon-light-32x32.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${instrumentSerif.variable} font-sans antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
