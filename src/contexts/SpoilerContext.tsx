'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

interface SpoilerContextType {
  spoilerShield: boolean
  toggleSpoilerShield: () => void
  revealedGames: Set<string>
  revealGame: (gameId: string) => void
  hideGame: (gameId: string) => void
}

const SpoilerContext = createContext<SpoilerContextType>({
  spoilerShield: false,
  toggleSpoilerShield: () => {},
  revealedGames: new Set(),
  revealGame: () => {},
  hideGame: () => {},
})

export function SpoilerProvider({ children }: { children: ReactNode }) {
  const [spoilerShield, setSpoilerShield] = useState(false)
  const [revealedGames, setRevealedGames] = useState<Set<string>>(new Set())

  // Load persisted state on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('spoilerShield')
      if (stored === 'true') setSpoilerShield(true)
    } catch {}
  }, [])

  const toggleSpoilerShield = useCallback(() => {
    setSpoilerShield(prev => {
      const next = !prev
      try { localStorage.setItem('spoilerShield', String(next)) } catch {}
      // Clear per-game reveals when shield is turned off
      if (!next) setRevealedGames(new Set())
      return next
    })
  }, [])

  const revealGame = useCallback((gameId: string) => {
    setRevealedGames(prev => { const s = new Set(prev); s.add(gameId); return s })
  }, [])

  const hideGame = useCallback((gameId: string) => {
    setRevealedGames(prev => {
      const next = new Set(prev)
      next.delete(gameId)
      return next
    })
  }, [])

  return (
    <SpoilerContext.Provider value={{ spoilerShield, toggleSpoilerShield, revealedGames, revealGame, hideGame }}>
      {children}
    </SpoilerContext.Provider>
  )
}

export function useSpoiler() {
  return useContext(SpoilerContext)
}
