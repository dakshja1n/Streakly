import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: 'HabitKit - Habit Tracker',
  description:
    'Build better routines with a modern habit tracker featuring heatmaps, streaks, badges, and consistency analytics.',
  generator: 'v0.app',
  applicationName: 'HabitKit',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'HabitKit',
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#09090b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`dark bg-zinc-950 ${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-zinc-950 font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function () {
                navigator.serviceWorker.register('/sw.js').catch(function (err) {
                  console.log('[v0] Service worker registration failed:', err);
                });
              });
            }
          `}
        </Script>
      </body>
    </html>
  )
}
