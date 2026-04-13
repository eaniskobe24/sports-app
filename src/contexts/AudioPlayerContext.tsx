'use client'

import {
  createContext, useContext, useState, useEffect,
  useCallback, useRef, ReactNode,
} from 'react'
import type { Game, VoiceStyle, CommentaryType } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

export type AudioState = 'idle' | 'loading' | 'playing' | 'paused'
export type AutoCastPhase = 'idle' | 'generating' | 'speaking' | 'waiting'

export interface AudioPlayerContextType {
  // Current playback
  audioState:          AudioState
  currentText:         string
  streamingText:       string   // live-streamed text while generating
  currentVoiceStyle:   VoiceStyle
  currentGame:         Game | null

  // Auto-cast engine
  autoCastPhase:       AutoCastPhase
  autoCastCountdown:   number        // seconds until next generation
  autoCastGame:        Game | null
  isAutoCast:          boolean       // derived: autoCastPhase !== 'idle'

  // One-shot TTS (called from GameCaster for manual generation)
  speakNow: (text: string, voiceStyle: VoiceStyle, game: Game) => Promise<void>

  // Auto-cast controls
  startAutoCast:  (game: Game, voiceStyle: VoiceStyle, type: CommentaryType) => void
  stopAutoCast:   () => void
  skipCountdown:  () => void   // immediately trigger next generation

  // Playback controls (usable from MiniPlayer)
  pauseResume: () => void
  stop:        () => void
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AudioPlayerContext = createContext<AudioPlayerContextType>({
  audioState: 'idle', currentText: '', streamingText: '',
  currentVoiceStyle: 'classic', currentGame: null,
  autoCastPhase: 'idle', autoCastCountdown: 0, autoCastGame: null,
  isAutoCast: false,
  speakNow: async () => {}, startAutoCast: () => {}, stopAutoCast: () => {},
  skipCountdown: () => {}, pauseResume: () => {}, stop: () => {},
})

// ─── Provider ─────────────────────────────────────────────────────────────────

const AUTO_CAST_INTERVAL = 40   // seconds between commentaries
const GAME_PAYLOAD_KEYS = [
  'id','sport','league','homeTeam','awayTeam','score','period',
  'timeRemaining','status','isPlayoffs','seriesInfo',
] as const

function buildGamePayload(game: Game) {
  return {
    ...Object.fromEntries(GAME_PAYLOAD_KEYS.map(k => [k, game[k]])),
    keyMoments:  game.keyMoments.slice(-3),
    recentPlays: game.playByPlay.slice(-3),
  }
}

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const [audioState,        setAudioState]        = useState<AudioState>('idle')
  const [currentText,       setCurrentText]        = useState('')
  const [streamingText,     setStreamingText]      = useState('')
  const [currentVoiceStyle, setCurrentVoiceStyle]  = useState<VoiceStyle>('classic')
  const [currentGame,       setCurrentGame]        = useState<Game | null>(null)
  const [autoCastPhase,     setAutoCastPhase]      = useState<AutoCastPhase>('idle')
  const [autoCastCountdown, setAutoCastCountdown]  = useState(0)
  const [autoCastGame,      setAutoCastGame]       = useState<Game | null>(null)

  const audioRef            = useRef<HTMLAudioElement | null>(null)
  const audioBlobRef        = useRef<string | null>(null)
  const abortRef            = useRef<AbortController | null>(null)
  const countdownTimerRef   = useRef<ReturnType<typeof setInterval> | null>(null)
  const isAutoCastRef       = useRef(false)
  const autoCastGameRef     = useRef<Game | null>(null)
  const autoCastVoiceRef    = useRef<VoiceStyle>('classic')
  const autoCastTypeRef     = useRef<CommentaryType>('play-by-play')

  // ── CSS var: extend tab-bar height when mini-player is visible ─────────────
  const isAutoCast = autoCastPhase !== 'idle'

  useEffect(() => {
    const visible = audioState !== 'idle' || isAutoCast
    document.documentElement.style.setProperty(
      '--tab-bar-height', visible ? '148px' : '80px'
    )
  }, [audioState, isAutoCast])

  // ── Cleanup ────────────────────────────────────────────────────────────────
  useEffect(() => () => {
    clearCountdown()
    abortRef.current?.abort()
    audioRef.current?.pause()
    if (audioBlobRef.current) URL.revokeObjectURL(audioBlobRef.current)
  }, [])

  // ── Helpers ────────────────────────────────────────────────────────────────

  function clearCountdown() {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current)
      countdownTimerRef.current = null
    }
  }

  function updateMediaSession(text: string, voiceStyle: VoiceStyle, game: Game) {
    if (!('mediaSession' in navigator)) return
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title:  `${voiceStyle.charAt(0).toUpperCase() + voiceStyle.slice(1)} Commentary`,
        artist: `${game.awayTeam.abbreviation} ${game.score.away} — ${game.homeTeam.abbreviation} ${game.score.home}`,
        album:  `${game.league} · ${game.period}`,
        artwork: [{ src: '/icon-512.png', sizes: '512x512', type: 'image/png' }],
      })
    } catch {}
  }

  function registerMediaSessionHandlers(audio: HTMLAudioElement, onSkip?: () => void) {
    if (!('mediaSession' in navigator)) return
    navigator.mediaSession.setActionHandler('play',       () => audio.play().catch(() => {}))
    navigator.mediaSession.setActionHandler('pause',      () => audio.pause())
    navigator.mediaSession.setActionHandler('stop',       () => stopAudio())
    if (onSkip) {
      navigator.mediaSession.setActionHandler('nexttrack', onSkip)
    }
  }

  // ── Core: fetch TTS and play ───────────────────────────────────────────────

  async function fetchAndPlay(
    text: string,
    voiceStyle: VoiceStyle,
    game: Game,
    onEnded?: () => void,
  ): Promise<void> {
    setAudioState('loading')
    setCurrentText(text)
    setCurrentVoiceStyle(voiceStyle)
    setCurrentGame(game)
    updateMediaSession(text, voiceStyle, game)

    try {
      const res = await fetch('/api/tts', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ text, voiceStyle }),
      })

      if (!res.ok) {
        setAudioState('idle')
        onEnded?.()
        return
      }

      const blob = await res.blob()
      if (audioBlobRef.current) URL.revokeObjectURL(audioBlobRef.current)
      const url = URL.createObjectURL(blob)
      audioBlobRef.current = url

      const audio = new Audio(url)
      // iOS requires these attributes for background playback
      audio.setAttribute('playsinline', 'true')
      audio.setAttribute('preload', 'auto')
      audioRef.current = audio

      registerMediaSessionHandlers(audio, isAutoCastRef.current ? triggerNextNow : undefined)

      audio.onplay   = () => setAudioState('playing')
      audio.onpause  = () => {
        if (audio.ended) return
        setAudioState('paused')
      }
      audio.onended  = () => {
        setAudioState('idle')
        onEnded?.()
      }
      audio.onerror  = () => {
        setAudioState('idle')
        onEnded?.()
      }

      await audio.play()
    } catch {
      setAudioState('idle')
      onEnded?.()
    }
  }

  // ── Core: generate commentary text (streaming) ────────────────────────────

  async function generateText(
    game: Game,
    voiceStyle: VoiceStyle,
    type: CommentaryType,
    signal: AbortSignal,
  ): Promise<string> {
    setStreamingText('')

    const res = await fetch('/api/gamecaster', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        game:           buildGamePayload(game),
        voiceStyle,
        commentaryType: type,
      }),
      signal,
    })

    if (!res.ok) throw new Error('Generation failed')

    const reader = res.body?.getReader()
    if (!reader) throw new Error('No body')

    const decoder = new TextDecoder()
    let accumulated = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      accumulated += decoder.decode(value, { stream: true })
      setStreamingText(accumulated)
    }

    setStreamingText('')
    return accumulated.trim()
  }

  // ── One-shot TTS (used by GameCaster for manual "Cast Live") ──────────────

  const speakNow = useCallback(async (
    text: string,
    voiceStyle: VoiceStyle,
    game: Game,
  ) => {
    stopAudio()
    await fetchAndPlay(text, voiceStyle, game)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Auto-cast engine ──────────────────────────────────────────────────────

  function startCountdown() {
    clearCountdown()
    let remaining = AUTO_CAST_INTERVAL
    setAutoCastCountdown(remaining)

    countdownTimerRef.current = setInterval(() => {
      remaining -= 1
      setAutoCastCountdown(remaining)
      if (remaining <= 0) {
        clearCountdown()
        if (isAutoCastRef.current) runAutoCastCycle()
      }
    }, 1000)
  }

  async function runAutoCastCycle() {
    const game      = autoCastGameRef.current
    const voice     = autoCastVoiceRef.current
    const type      = autoCastTypeRef.current

    if (!game || !isAutoCastRef.current) return

    abortRef.current?.abort()
    abortRef.current = new AbortController()

    setAutoCastPhase('generating')

    try {
      const text = await generateText(game, voice, type, abortRef.current.signal)
      if (!text || !isAutoCastRef.current) return

      setAutoCastPhase('speaking')

      await fetchAndPlay(text, voice, game, () => {
        if (isAutoCastRef.current) {
          setAutoCastPhase('waiting')
          startCountdown()
        }
      })
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return
      // On error: wait then retry
      if (isAutoCastRef.current) {
        setAutoCastPhase('waiting')
        startCountdown()
      }
    }
  }

  function triggerNextNow() {
    clearCountdown()
    if (isAutoCastRef.current) runAutoCastCycle()
  }

  const startAutoCast = useCallback((game: Game, voiceStyle: VoiceStyle, type: CommentaryType) => {
    isAutoCastRef.current = true
    autoCastGameRef.current = game
    autoCastVoiceRef.current = voiceStyle
    autoCastTypeRef.current = type
    setAutoCastGame(game)
    runAutoCastCycle()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stopAutoCast = useCallback(() => {
    isAutoCastRef.current = false
    clearCountdown()
    setAutoCastPhase('idle')
    setAutoCastCountdown(0)
    setAutoCastGame(null)
    stopAudio()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const skipCountdown = useCallback(() => {
    if (!isAutoCastRef.current) return
    triggerNextNow()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Playback controls ─────────────────────────────────────────────────────

  function stopAudio() {
    abortRef.current?.abort()
    abortRef.current = null
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setAudioState('idle')
    setStreamingText('')
  }

  const pauseResume = useCallback(() => {
    if (!audioRef.current) return
    if (audioRef.current.paused) {
      audioRef.current.play().catch(() => {})
    } else {
      audioRef.current.pause()
    }
  }, [])

  const stop = useCallback(() => {
    stopAudio()
    if (!isAutoCastRef.current) {
      setCurrentText('')
      setCurrentGame(null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <AudioPlayerContext.Provider value={{
      audioState, currentText, streamingText, currentVoiceStyle, currentGame,
      autoCastPhase, autoCastCountdown, autoCastGame,
      isAutoCast: isAutoCast,
      speakNow, startAutoCast, stopAutoCast, skipCountdown,
      pauseResume, stop,
    }}>
      {children}
    </AudioPlayerContext.Provider>
  )
}

export function useAudioPlayer() {
  return useContext(AudioPlayerContext)
}
