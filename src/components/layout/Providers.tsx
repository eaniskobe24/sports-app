'use client'

import { SpoilerProvider } from '@/contexts/SpoilerContext'

export default function Providers({ children }: { children: React.ReactNode }) {
  return <SpoilerProvider>{children}</SpoilerProvider>
}
