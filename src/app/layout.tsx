import type { Metadata, Viewport } from 'next'
import './globals.css'
import Providers from '@/components/layout/Providers'
import MiniPlayer from '@/components/gamecaster/MiniPlayer'

// ─── App metadata (App Store / PWA) ───────────────────────────────────────────

export const metadata: Metadata = {
  title: 'GameCast — Live Sports + AI Commentary',
  description: 'Real-time sports scores with AI-powered live voice commentary. Works in the background so you never miss a play.',
  applicationName: 'GameCast',
  authors: [{ name: 'GameCast' }],
  keywords: ['sports', 'live scores', 'AI commentary', 'NBA', 'NFL', 'MLB', 'NHL', 'soccer'],
  manifest: '/manifest.json',

  // iOS home screen (PWA)
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'GameCast',
  },

  // Open Graph
  openGraph: {
    title: 'GameCast — Live Sports + AI Commentary',
    description: 'Real-time scores with live AI voice commentary',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // Apple-recommended: matches our true-black background
  themeColor: [
    { media: '(prefers-color-scheme: dark)',  color: '#000000' },
    { media: '(prefers-color-scheme: light)', color: '#000000' },
  ],
  // Extend into status bar on notched iPhones
  viewportFit: 'cover',
}

// ─── Root layout ──────────────────────────────────────────────────────────────

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* ── iOS PWA / App Store compliance ── */}
        <meta name="apple-mobile-web-app-capable"            content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style"   content="black-translucent" />
        <meta name="apple-mobile-web-app-title"              content="GameCast" />
        <meta name="mobile-web-app-capable"                  content="yes" />

        {/* iOS touch icons (replace with actual PNGs for App Store submission) */}
        <link rel="apple-touch-icon"                 href="/icon-192.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icon-152.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/icon-120.png" />

        {/* Splash screens for iPhone — required for full-screen PWA */}
        <meta name="apple-touch-fullscreen" content="yes" />

        {/* Service worker registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `,
          }}
        />
      </head>

      <body className="bg-black text-white antialiased min-h-screen overflow-x-hidden">
        <Providers>
          {/* App shell — max-width keeps it phone-sized on desktop/tablet */}
          <div className="mx-auto max-w-[428px] min-h-screen relative bg-black">
            {children}
          </div>

          {/*
            MiniPlayer: fixed-position, above the tab bar.
            Rendered OUTSIDE the max-width container so it can
            be properly centered relative to the app shell.
          */}
          <div className="fixed bottom-0 left-0 right-0 z-[45] pointer-events-none">
            <div className="mx-auto max-w-[428px] pointer-events-auto">
              <MiniPlayer />
            </div>
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
