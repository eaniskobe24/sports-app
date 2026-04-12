'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Sparkles, Square, Volume2, VolumeX } from 'lucide-react'
import type { Game, VoiceStyle, CommentaryItem, CommentaryType } from '@/types'
import VoiceSelector from './VoiceSelector'
import CommentaryFeed from './CommentaryFeed'

interface GameCasterProps {
  game: Game
}

type AudioState = 'idle' | 'loading' | 'playing' | 'paused' | 'error'

const commentaryTypes: { type: CommentaryType; label: string }[] = [
  { type: 'play-by-play', label: 'Live Action' },
  { type: 'highlight',    label: 'Big Play'   },
  { type: 'analysis',     label: 'Breakdown'  },
  { type: 'summary',      label: 'Summary'    },
]

const voiceEmotionMap: Record<VoiceStyle, CommentaryItem['emotion']> = {
  classic:    'neutral',
  hype:       'excited',
  analytical: 'analytical',
}

// ─── Waveform visualizer ──────────────────────────────────────────────────────
// 8 bars — each assigned its own CSS animation class for organic movement

type WaveformMode = 'idle' | 'thinking' | 'playing'

const BAR_CLASSES = [
  'waveform-bar-1',
  'waveform-bar-2',
  'waveform-bar-3',
  'waveform-bar-4',
  'waveform-bar-5',
  'waveform-bar-6',
  'waveform-bar-7',
  'waveform-bar-8',
]

function Waveform({ mode, color = '#0a84ff' }: { mode: WaveformMode; color?: string }) {
  return (
    <div
      className={`flex items-end gap-[2px] h-6 ${mode === 'thinking' ? 'waveform-thinking' : ''}`}
    >
      {BAR_CLASSES.map((cls, i) => (
        <div
          key={i}
          className={`w-[2px] rounded-full transition-all duration-300 ${mode !== 'idle' ? cls : ''}`}
          style={{
            height: mode === 'idle' ? '4px' : undefined,
            backgroundColor: color,
            opacity: mode === 'idle' ? 0.25 : 0.9,
          }}
        />
      ))}
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function GameCaster({ game }: GameCasterProps) {
  const [isExpanded,      setIsExpanded]      = useState(false)
  const [voiceStyle,      setVoiceStyle]      = useState<VoiceStyle>('classic')
  const [commentaryType,  setCommentaryType]  = useState<CommentaryType>('play-by-play')
  const [commentaryItems, setCommentaryItems] = useState<CommentaryItem[]>([])
  const [isGenerating,    setIsGenerating]    = useState(false)
  const [streamingText,   setStreamingText]   = useState('')
  const [error,           setError]           = useState<string | null>(null)
  const [audioState,      setAudioState]      = useState<AudioState>('idle')
  const [ttsEnabled,      setTtsEnabled]      = useState(true)
  // ID of the commentary item currently being spoken
  const [playingItemId,   setPlayingItemId]   = useState<string | null>(null)

  const abortRef    = useRef<AbortController | null>(null)
  const audioRef    = useRef<HTMLAudioElement | null>(null)
  const audioBlobRef = useRef<string | null>(null)

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      if (audioBlobRef.current) {
        URL.revokeObjectURL(audioBlobRef.current)
      }
    }
  }, [])

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setAudioState('idle')
    setPlayingItemId(null)
  }, [])

  // ─── Fetch TTS audio and play it ─────────────────────────────────────────

  const speakText = useCallback(async (text: string, style: VoiceStyle, itemId?: string) => {
    if (!ttsEnabled) return

    stopAudio()
    setAudioState('loading')
    if (itemId) setPlayingItemId(itemId)

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceStyle: style }),
      })

      if (!res.ok) {
        // TTS unavailable — fail silently, text still shows
        setAudioState('idle')
        setPlayingItemId(null)
        return
      }

      const blob = await res.blob()

      if (audioBlobRef.current) URL.revokeObjectURL(audioBlobRef.current)
      const url = URL.createObjectURL(blob)
      audioBlobRef.current = url

      const audio = new Audio(url)
      audioRef.current = audio

      audio.onplay  = () => setAudioState('playing')
      audio.onpause = () => setAudioState('paused')
      audio.onended = () => {
        setAudioState('idle')
        setPlayingItemId(null)
      }
      audio.onerror = () => {
        setAudioState('idle')
        setPlayingItemId(null)
      }

      await audio.play()
    } catch {
      setAudioState('idle')
      setPlayingItemId(null)
    }
  }, [ttsEnabled, stopAudio])

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) return
    if (audioState === 'playing') {
      audioRef.current.pause()
    } else if (audioState === 'paused') {
      audioRef.current.play()
    }
  }, [audioState])

  // ─── Generate commentary ──────────────────────────────────────────────────

  const generateCommentary = useCallback(async () => {
    if (isGenerating) {
      abortRef.current?.abort()
      setIsGenerating(false)
      setStreamingText('')
      return
    }

    setIsGenerating(true)
    setStreamingText('')
    setError(null)
    stopAudio()
    abortRef.current = new AbortController()

    try {
      const response = await fetch('/api/gamecaster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game: {
            id:            game.id,
            sport:         game.sport,
            league:        game.league,
            homeTeam:      game.homeTeam,
            awayTeam:      game.awayTeam,
            score:         game.score,
            period:        game.period,
            timeRemaining: game.timeRemaining,
            status:        game.status,
            isPlayoffs:    game.isPlayoffs,
            seriesInfo:    game.seriesInfo,
            keyMoments:    game.keyMoments.slice(-3),
            recentPlays:   game.playByPlay.slice(-3),
          },
          voiceStyle,
          commentaryType,
        }),
        signal: abortRef.current.signal,
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(err.error || `Error ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setStreamingText(accumulated)
      }

      if (accumulated.trim()) {
        const itemId = `${Date.now()}-${Math.random().toString(36).slice(2)}`
        const newItem: CommentaryItem = {
          id:         itemId,
          text:       accumulated.trim(),
          voiceStyle,
          type:       commentaryType,
          timestamp:  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          emotion:    voiceEmotionMap[voiceStyle],
        }
        setCommentaryItems(prev => [newItem, ...prev].slice(0, 10))

        // Auto-speak the new commentary
        speakText(accumulated.trim(), voiceStyle, itemId)
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return
      const msg = err instanceof Error ? err.message : 'Failed to generate commentary'
      setError(msg)
    } finally {
      setIsGenerating(false)
      setStreamingText('')
    }
  }, [game, voiceStyle, commentaryType, isGenerating, speakText, stopAudio])

  // ─── Derived state ────────────────────────────────────────────────────────

  const isAvailable   = game.status === 'live' || game.status === 'final'
  const isAudioActive = audioState === 'playing' || audioState === 'loading'

  const waveformMode: WaveformMode =
    audioState === 'playing'  ? 'playing'  :
    isGenerating              ? 'thinking' :
    'idle'

  const accentColor =
    voiceStyle === 'hype'       ? '#ff9f0a' :
    voiceStyle === 'analytical' ? '#bf5af2' :
    '#0a84ff'

  return (
    <div className="mx-4 mb-4">
      <motion.div
        className="rounded-[22px] overflow-hidden"
        style={{
          background:  'linear-gradient(160deg, #0f0f11 0%, #0a0c12 100%)',
          border:      isAudioActive
            ? `1px solid ${accentColor}50`
            : '1px solid rgba(255,255,255,0.08)',
          boxShadow:   isAudioActive
            ? `0 0 28px ${accentColor}18`
            : 'none',
          transition:  'border-color 0.4s ease, box-shadow 0.4s ease',
        }}
        layout
      >
        {/* ── Header bar ─────────────────────────────────────────────────── */}
        <button
          onClick={() => setIsExpanded(v => !v)}
          className="w-full flex items-center justify-between px-4 py-4"
        >
          <div className="flex items-center gap-3">
            {/* Waveform icon — the signature visual */}
            <div
              className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0"
              style={{
                background: isAudioActive
                  ? `${accentColor}22`
                  : 'rgba(255,255,255,0.05)',
                border: `1px solid ${isAudioActive ? accentColor + '40' : 'rgba(255,255,255,0.07)'}`,
                transition: 'all 0.3s ease',
              }}
            >
              <Waveform mode={waveformMode} color={accentColor} />
            </div>

            <div className="text-left">
              <div className="flex items-center gap-2">
                <p className="text-[14px] font-semibold text-white tracking-tight">
                  AI GameCaster
                </p>
                {/* ON AIR badge — appears when audio plays */}
                <AnimatePresence>
                  {audioState === 'playing' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{   opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded-md"
                      style={{ backgroundColor: '#ff3b3022', border: '1px solid #ff3b3040' }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-[#ff3b30] on-air-dot" />
                      <span className="text-[9px] font-bold text-[#ff3b30] tracking-widest">ON AIR</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <p className="text-[11px] text-[#636366] mt-0.5">
                {audioState === 'loading'
                  ? 'Loading voice...'
                  : audioState === 'playing'
                  ? 'Broadcasting live'
                  : isGenerating
                  ? 'Writing commentary...'
                  : commentaryItems.length > 0
                  ? `${commentaryItems.length} clip${commentaryItems.length !== 1 ? 's' : ''}`
                  : 'Powered by Claude + ElevenLabs'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio quick controls in header */}
            <AnimatePresence>
              {(audioState === 'playing' || audioState === 'paused') && (
                <motion.button
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{   opacity: 0, x: 8 }}
                  onClick={e => { e.stopPropagation(); togglePlayPause() }}
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${accentColor}20` }}
                >
                  {audioState === 'playing'
                    ? <Square size={10} fill={accentColor} stroke="none" />
                    : <Volume2 size={12} style={{ color: accentColor }} />
                  }
                </motion.button>
              )}
            </AnimatePresence>

            {isExpanded
              ? <ChevronUp  size={15} className="text-[#48484a]" />
              : <ChevronDown size={15} className="text-[#48484a]" />
            }
          </div>
        </button>

        {/* ── Expanded content ───────────────────────────────────────────── */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{    height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div
                className="px-4 pb-4 space-y-4 pt-4"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
              >

                {!isAvailable && (
                  <div className="rounded-xl p-3 text-center"
                       style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <p className="text-[12px] text-[#636366]">
                      AI commentary available for live and completed games
                    </p>
                  </div>
                )}

                {isAvailable && (
                  <>
                    {/* Voice selector */}
                    <VoiceSelector selected={voiceStyle} onChange={style => {
                      setVoiceStyle(style)
                      stopAudio()
                    }} />

                    {/* Commentary type */}
                    <div>
                      <p className="text-[10px] font-semibold text-[#48484a] uppercase tracking-widest mb-2.5">
                        Type
                      </p>
                      <div className="flex gap-1.5 flex-wrap">
                        {commentaryTypes.map(({ type, label }) => (
                          <button
                            key={type}
                            onClick={() => setCommentaryType(type)}
                            className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150"
                            style={{
                              backgroundColor: commentaryType === type
                                ? `${accentColor}20`
                                : 'rgba(255,255,255,0.05)',
                              color: commentaryType === type ? accentColor : '#636366',
                              border: `1px solid ${commentaryType === type ? accentColor + '35' : 'transparent'}`,
                            }}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* TTS toggle */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {ttsEnabled
                          ? <Volume2  size={13} className="text-[#48484a]" />
                          : <VolumeX  size={13} className="text-[#48484a]" />
                        }
                        <span className="text-[12px] text-[#636366]">Live voice</span>
                      </div>
                      <button
                        onClick={() => { setTtsEnabled(v => !v); if (ttsEnabled) stopAudio() }}
                        className="w-10 h-6 rounded-full transition-all duration-200 flex items-center relative"
                        style={{
                          backgroundColor: ttsEnabled ? accentColor : 'rgba(255,255,255,0.1)',
                        }}
                      >
                        <motion.div
                          className="absolute w-5 h-5 bg-white rounded-full shadow"
                          animate={{ x: ttsEnabled ? 18 : 2 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        />
                      </button>
                    </div>

                    {/* Generate / Stop button */}
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={generateCommentary}
                      className="w-full py-3.5 rounded-xl font-semibold text-[14px] flex items-center justify-center gap-2 transition-all duration-200"
                      style={
                        isGenerating
                          ? { backgroundColor: 'rgba(255,59,48,0.1)', color: '#ff3b30', border: '1px solid rgba(255,59,48,0.2)' }
                          : { background: `linear-gradient(135deg, ${accentColor}, ${voiceStyle === 'hype' ? '#ff3b30' : voiceStyle === 'analytical' ? '#0a84ff' : '#bf5af2'})`, color: '#fff' }
                      }
                    >
                      {isGenerating ? (
                        <>
                          <Square size={14} strokeWidth={2.5} />
                          Stop
                        </>
                      ) : (
                        <>
                          <Sparkles size={15} strokeWidth={2} />
                          Cast Live
                        </>
                      )}
                    </motion.button>

                    {/* Error */}
                    {error && (
                      <div className="rounded-xl p-3"
                           style={{ background: 'rgba(255,59,48,0.08)', border: '1px solid rgba(255,59,48,0.15)' }}>
                        <p className="text-[12px] text-[#ff3b30]">{error}</p>
                        <p className="text-[11px] text-[#48484a] mt-1">
                          Add ANTHROPIC_API_KEY to .env.local to enable AI commentary.
                        </p>
                      </div>
                    )}

                    {/* Commentary feed */}
                    {(commentaryItems.length > 0 || isGenerating) && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-[10px] font-semibold text-[#48484a] uppercase tracking-widest">
                            Broadcast Feed
                          </p>
                          {commentaryItems.length > 0 && !isGenerating && (
                            <button
                              onClick={() => { setCommentaryItems([]); setError(null); stopAudio() }}
                              className="text-[11px] text-[#48484a] active:text-[#636366]"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                        <CommentaryFeed
                          items={commentaryItems}
                          streamingText={streamingText}
                          isGenerating={isGenerating}
                          playingItemId={playingItemId}
                          audioState={audioState}
                          onPlay={speakText}
                          onStop={stopAudio}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
