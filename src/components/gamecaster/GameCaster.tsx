'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown, ChevronUp, Sparkles, Square,
  Volume2, VolumeX, Radio, SkipForward,
} from 'lucide-react'
import type { Game, VoiceStyle, CommentaryItem, CommentaryType } from '@/types'
import VoiceSelector from './VoiceSelector'
import CommentaryFeed from './CommentaryFeed'
import { useAudioPlayer } from '@/contexts/AudioPlayerContext'

interface GameCasterProps {
  game: Game
}

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

type WaveformMode = 'idle' | 'thinking' | 'playing'

const BAR_CLASSES = [
  'waveform-bar-1','waveform-bar-2','waveform-bar-3','waveform-bar-4',
  'waveform-bar-5','waveform-bar-6','waveform-bar-7','waveform-bar-8',
]

function Waveform({ mode, color = '#0a84ff' }: { mode: WaveformMode; color?: string }) {
  return (
    <div className={`flex items-end gap-[2px] h-6 ${mode === 'thinking' ? 'waveform-thinking' : ''}`}>
      {BAR_CLASSES.map((cls, i) => (
        <div
          key={i}
          className={`w-[2px] rounded-full transition-all duration-300 ${mode !== 'idle' ? cls : ''}`}
          style={{
            height:          mode === 'idle' ? '4px' : undefined,
            backgroundColor: color,
            opacity:         mode === 'idle' ? 0.25 : 0.9,
          }}
        />
      ))}
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function GameCaster({ game }: GameCasterProps) {
  const player = useAudioPlayer()

  const [isExpanded,       setIsExpanded]       = useState(false)
  const [voiceStyle,       setVoiceStyle]        = useState<VoiceStyle>('classic')
  const [commentaryType,   setCommentaryType]    = useState<CommentaryType>('play-by-play')
  const [commentaryItems,  setCommentaryItems]   = useState<CommentaryItem[]>([])
  const [isGenerating,     setIsGenerating]      = useState(false)
  const [streamingText,    setStreamingText]     = useState('')
  const [error,            setError]             = useState<string | null>(null)
  const [ttsEnabled,       setTtsEnabled]        = useState(true)

  // Which commentary card is currently being played (one-shot)
  const [playingItemId,    setPlayingItemId]     = useState<string | null>(null)

  // Is auto-cast active FOR THIS GAME
  const isThisGameAutoCast =
    player.isAutoCast && player.autoCastGame?.id === game.id

  const isAvailable   = game.status === 'live' || game.status === 'final'
  const isAudioActive = player.audioState === 'playing' || player.audioState === 'loading'

  // Waveform mode
  const waveformMode: WaveformMode =
    player.audioState === 'playing' && player.currentGame?.id === game.id ? 'playing' :
    isGenerating || player.autoCastPhase === 'generating' ? 'thinking' :
    'idle'

  const accentColor =
    voiceStyle === 'hype'       ? '#ff9f0a' :
    voiceStyle === 'analytical' ? '#bf5af2' :
    '#0a84ff'

  // ── One-shot commentary ───────────────────────────────────────────────────

  const generateCommentary = useCallback(async () => {
    if (isGenerating) return

    setIsGenerating(true)
    setStreamingText('')
    setError(null)

    try {
      const res = await fetch('/api/gamecaster', {
        method:  'POST',
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
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(err.error || `Error ${res.status}`)
      }

      const reader = res.body?.getReader()
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
          id:        itemId,
          text:      accumulated.trim(),
          voiceStyle,
          type:      commentaryType,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          emotion:   voiceEmotionMap[voiceStyle],
        }
        setCommentaryItems(prev => [newItem, ...prev].slice(0, 10))

        // Speak via global audio player
        if (ttsEnabled) {
          setPlayingItemId(itemId)
          await player.speakNow(accumulated.trim(), voiceStyle, game)
          setPlayingItemId(null)
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate commentary'
      setError(msg)
    } finally {
      setIsGenerating(false)
      setStreamingText('')
    }
  }, [game, voiceStyle, commentaryType, isGenerating, ttsEnabled, player])

  // ── Auto-cast ─────────────────────────────────────────────────────────────

  const toggleAutoCast = useCallback(() => {
    if (isThisGameAutoCast) {
      player.stopAutoCast()
    } else {
      // Stop any current one-shot playback first
      player.stop()
      player.startAutoCast(game, voiceStyle, commentaryType)
    }
  }, [isThisGameAutoCast, player, game, voiceStyle, commentaryType])

  // ── Per-card playback ─────────────────────────────────────────────────────

  const handleCardPlay = useCallback(async (text: string, style: VoiceStyle, itemId: string) => {
    if (playingItemId === itemId) {
      player.stop()
      setPlayingItemId(null)
      return
    }
    setPlayingItemId(itemId)
    await player.speakNow(text, style, game)
    setPlayingItemId(null)
  }, [playingItemId, player, game])

  const handleCardStop = useCallback(() => {
    player.stop()
    setPlayingItemId(null)
  }, [player])

  // ─────────────────────────────────────────────────────────────────────────

  const headerIsLive =
    isThisGameAutoCast ||
    (player.audioState !== 'idle' && player.currentGame?.id === game.id)

  return (
    <div className="mx-4 mb-4">
      <motion.div
        className="rounded-[22px] overflow-hidden"
        style={{
          background:  'linear-gradient(160deg, #0f0f11 0%, #0a0c12 100%)',
          border: headerIsLive
            ? `1px solid ${accentColor}50`
            : '1px solid rgba(255,255,255,0.08)',
          boxShadow: headerIsLive ? `0 0 28px ${accentColor}18` : 'none',
          transition: 'border-color 0.4s ease, box-shadow 0.4s ease',
        }}
        layout
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <button
          onClick={() => setIsExpanded(v => !v)}
          className="w-full flex items-center justify-between px-4 py-4"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0"
              style={{
                background: headerIsLive ? `${accentColor}22` : 'rgba(255,255,255,0.05)',
                border: `1px solid ${headerIsLive ? accentColor + '40' : 'rgba(255,255,255,0.07)'}`,
                transition: 'all 0.3s ease',
              }}
            >
              <Waveform mode={waveformMode} color={accentColor} />
            </div>

            <div className="text-left">
              <div className="flex items-center gap-2">
                <p className="text-[14px] font-semibold text-white tracking-tight">AI GameCaster</p>

                {/* ON AIR badge */}
                <AnimatePresence>
                  {player.audioState === 'playing' && player.currentGame?.id === game.id && (
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
                  {/* AUTO CAST badge */}
                  {isThisGameAutoCast && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{   opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded-md"
                      style={{ backgroundColor: `${accentColor}20`, border: `1px solid ${accentColor}40` }}
                    >
                      <Radio size={8} style={{ color: accentColor }} />
                      <span className="text-[9px] font-bold tracking-widest" style={{ color: accentColor }}>
                        AUTO
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <p className="text-[11px] text-[#636366] mt-0.5">
                {player.autoCastPhase === 'generating' && isThisGameAutoCast
                  ? 'Writing next commentary…'
                  : player.autoCastPhase === 'waiting' && isThisGameAutoCast
                  ? `Next cast in ${player.autoCastCountdown}s`
                  : player.audioState === 'loading' && player.currentGame?.id === game.id
                  ? 'Loading voice…'
                  : player.audioState === 'playing' && player.currentGame?.id === game.id
                  ? 'Broadcasting live'
                  : isGenerating
                  ? 'Writing commentary…'
                  : commentaryItems.length > 0
                  ? `${commentaryItems.length} clip${commentaryItems.length !== 1 ? 's' : ''}`
                  : 'Powered by Claude + ElevenLabs'
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick stop in header */}
            <AnimatePresence>
              {isThisGameAutoCast && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{   opacity: 0, scale: 0.8 }}
                  onClick={e => { e.stopPropagation(); player.stopAutoCast() }}
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(255,59,48,0.15)' }}
                >
                  <Square size={9} fill="#ff3b30" stroke="none" />
                </motion.button>
              )}
              {player.autoCastPhase === 'waiting' && isThisGameAutoCast && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{   opacity: 0 }}
                  onClick={e => { e.stopPropagation(); player.skipCountdown() }}
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                >
                  <SkipForward size={11} className="text-[#636666]" />
                </motion.button>
              )}
            </AnimatePresence>
            {isExpanded
              ? <ChevronUp   size={15} className="text-[#48484a]" />
              : <ChevronDown size={15} className="text-[#48484a]" />
            }
          </div>
        </button>

        {/* ── Expanded content ─────────────────────────────────────────────── */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{    height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-4 pt-4"
                   style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>

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
                    <VoiceSelector selected={voiceStyle} onChange={style => {
                      setVoiceStyle(style)
                      if (!isThisGameAutoCast) player.stop()
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
                              backgroundColor: commentaryType === type ? `${accentColor}20` : 'rgba(255,255,255,0.05)',
                              color:           commentaryType === type ? accentColor : '#636366',
                              border:         `1px solid ${commentaryType === type ? accentColor + '35' : 'transparent'}`,
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
                        {ttsEnabled ? <Volume2 size={13} className="text-[#48484a]" /> : <VolumeX size={13} className="text-[#48484a]" />}
                        <span className="text-[12px] text-[#636366]">Live voice</span>
                      </div>
                      <button
                        onClick={() => { setTtsEnabled(v => !v); if (ttsEnabled) player.stop() }}
                        className="w-10 h-6 rounded-full transition-all duration-200 flex items-center relative"
                        style={{ backgroundColor: ttsEnabled ? accentColor : 'rgba(255,255,255,0.1)' }}
                      >
                        <motion.div
                          className="absolute w-5 h-5 bg-white rounded-full shadow"
                          animate={{ x: ttsEnabled ? 18 : 2 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        />
                      </button>
                    </div>

                    {/* ── Action buttons ─────────────────────────────────── */}
                    <div className="space-y-2">

                      {/* AUTO CAST — the main feature */}
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={toggleAutoCast}
                        disabled={game.status !== 'live'}
                        className="w-full py-3.5 rounded-xl font-semibold text-[14px] flex items-center justify-center gap-2 transition-all duration-200"
                        style={
                          isThisGameAutoCast
                            ? { backgroundColor: 'rgba(255,59,48,0.1)', color: '#ff3b30', border: '1px solid rgba(255,59,48,0.2)' }
                            : game.status !== 'live'
                            ? { backgroundColor: 'rgba(255,255,255,0.04)', color: '#48484a' }
                            : { background: `linear-gradient(135deg, #0a84ff, #bf5af2)`, color: '#fff' }
                        }
                      >
                        {isThisGameAutoCast ? (
                          <>
                            <Square size={13} strokeWidth={2.5} fill="#ff3b30" stroke="#ff3b30" />
                            Stop Auto Cast
                          </>
                        ) : (
                          <>
                            <Radio size={15} strokeWidth={2} />
                            {game.status === 'live' ? 'Start Auto Cast' : 'Auto Cast (Live only)'}
                          </>
                        )}
                      </motion.button>

                      {/* ONE-SHOT cast */}
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={generateCommentary}
                        disabled={isGenerating || isThisGameAutoCast}
                        className="w-full py-3 rounded-xl font-semibold text-[13px] flex items-center justify-center gap-2 transition-all duration-200"
                        style={
                          isGenerating
                            ? { backgroundColor: 'rgba(255,255,255,0.05)', color: '#636366' }
                            : isThisGameAutoCast
                            ? { backgroundColor: 'rgba(255,255,255,0.04)', color: '#48484a' }
                            : { backgroundColor: `${accentColor}15`, color: accentColor, border: `1px solid ${accentColor}25` }
                        }
                      >
                        {isGenerating ? (
                          <>
                            <div className="w-3 h-3 rounded-full border-2 border-[#636366] border-t-transparent animate-spin" />
                            Generating…
                          </>
                        ) : (
                          <>
                            <Sparkles size={13} strokeWidth={2} />
                            Cast Once
                          </>
                        )}
                      </motion.button>
                    </div>

                    {/* Auto cast info box */}
                    {!isThisGameAutoCast && game.status === 'live' && (
                      <div className="rounded-xl p-3"
                           style={{ background: 'rgba(10,132,255,0.06)', border: '1px solid rgba(10,132,255,0.12)' }}>
                        <p className="text-[11px] text-[#0a84ff] font-medium mb-0.5">Auto Cast</p>
                        <p className="text-[11px] text-[#48484a] leading-relaxed">
                          Generates and speaks new commentary every 40s. Works in the background — keeps playing while you use other parts of the app.
                        </p>
                      </div>
                    )}

                    {/* Error */}
                    {error && (
                      <div className="rounded-xl p-3"
                           style={{ background: 'rgba(255,59,48,0.08)', border: '1px solid rgba(255,59,48,0.15)' }}>
                        <p className="text-[12px] text-[#ff3b30]">{error}</p>
                        <p className="text-[11px] text-[#48484a] mt-1">
                          Add ANTHROPIC_API_KEY to .env.local to enable commentary.
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
                              onClick={() => { setCommentaryItems([]); setError(null) }}
                              className="text-[11px] text-[#48484a] active:text-[#636366]"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                        <CommentaryFeed
                          items={commentaryItems}
                          streamingText={streamingText || (isThisGameAutoCast ? player.streamingText : '')}
                          isGenerating={isGenerating || (isThisGameAutoCast && player.autoCastPhase === 'generating')}
                          playingItemId={playingItemId}
                          audioState={player.audioState}
                          onPlay={handleCardPlay}
                          onStop={handleCardStop}
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
