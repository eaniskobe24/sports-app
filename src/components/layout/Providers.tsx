'use client'

import { SpoilerProvider }     from '@/contexts/SpoilerContext'
import { AudioPlayerProvider } from '@/contexts/AudioPlayerContext'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SpoilerProvider>
      <AudioPlayerProvider>
        {children}
      </AudioPlayerProvider>
    </SpoilerProvider>
  )
}
