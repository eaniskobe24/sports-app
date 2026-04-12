import type { Metadata, Viewport } from 'next'
import './globals.css'
import Providers from '@/components/layout/Providers'

export const metadata: Metadata = {
  title: 'GameCast — Live Sports + AI Commentary',
  description: 'Real-time sports scores with AI-powered play-by-play narration',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="bg-black text-white font-sans antialiased min-h-screen">
        <Providers>
          {/* App shell — max width for mobile-first feel */}
          <div className="mx-auto max-w-[428px] min-h-screen relative bg-black">
            {children}
          </div>
        </Providers>
        {/* Desktop background glow */}
        <div
          className="fixed inset-0 -z-10 pointer-events-none hidden lg:block"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(10,132,255,0.04) 0%, transparent 100%)',
          }}
        />
      </body>
    </html>
  )
}
