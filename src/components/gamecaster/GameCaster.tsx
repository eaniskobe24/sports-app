'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, ChevronDown, ChevronUp, Sparkles, RefreshCw } from 'lucide-react'
import type { Game, VoiceStyle, CommentaryItem, CommentaryType } from '@/types'
import VoiceSelector from './VoiceSelector'
import CommentaryFeed from './CommentaryFeed'

interface GameCasterProps {
  game: Game
}

const commentaryTypes: { type: CommentaryType; label: string; emoji: string }[] = [
  { type: 'play-by-play', label: 'Live Action', emoji: '▶️' },
  { type: 'highlight', label: 'Big Play', emoji: '⭐' },
  { type: 'analysis', label: 'Breakdown', emoji: '🔍' },
  { type: 'summary', label: 'Summary', emoji: '📋' },
]

const voiceEmotionMap: Record<VoiceStyle, CommentaryItem['emotion']> = {
  classic: 'neutral',
  hype: 'excited',
  analytical: 'analytical',
}

export default function GameCaster({ game }: GameCasterProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [voiceStyle, setVoiceStyle] = useState<VoiceStyle>('classic')
  const [commentaryType, setCommentaryType] = useState<CommentaryType>('play-by-play')
  const [commentaryItems, setCommentaryItems] = useState<CommentaryItem[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const generateCommentary = useCallback(async () => {
    if (isGenerating) {
      // Cancel existing request
      abortRef.current?.abort()
      setIsGenerating(false)
      setStreamingText('')
      return
    }

    setIsGenerating(true)
    setStreamingText('')
    setError(null)
    abortRef.current = new AbortController()

    try {
      const response = await fetch('/api/gamecaster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game: {
            id: game.id,
            sport: game.sport,
            league: game.league,
            homeTeam: game.homeTeam,
            awayTeam: game.awayTeam,
            score: game.score,
            period: game.period,
            timeRemaining: game.timeRemaining,
            status: game.status,
            isPlayoffs: game.isPlayoffs,
            seriesInfo: game.seriesInfo,
            keyMoments: game.keyMoments.slice(-3),
            recentPlays: game.playByPlay.slice(-3),
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
        const newItem: CommentaryItem = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          text: accumulated.trim(),
          voiceStyle,
          type: commentaryType,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          emotion: voiceEmotionMap[voiceStyle],
        }
        setCommentaryItems(prev => [newItem, ...prev].slice(0, 10))
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return
      const msg = err instanceof Error ? err.message : 'Failed to generate commentary'
      setError(msg)
    } finally {
      setIsGenerating(false)
      setStreamingText('')
    }
  }, [game, voiceStyle, commentaryType, isGenerating])

  const clearCommentary = () => {
    setCommentaryItems([])
    setError(null)
  }

  const isAvailable = game.status === 'live' || game.status === 'final'

  return (
    <div className="mx-4 mb-4">
      {/* GameCaster header card */}
      <motion.div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1c1c1e 0%, #0a1628 100%)',
          border: '1px solid rgba(10, 132, 255, 0.2)',
        }}
        layout
      >
        {/* Header bar — always visible */}
        <button
          onClick={() => setIsExpanded(v => !v)}
          className="w-full flex items-center justify-between px-4 py-4"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #0a84ff, #bf5af2)' }}
            >
              <Mic size={16} strokeWidth={2.5} className="text-white" />
            </div>
            <div className="text-left">
              <p className="text-[14px] font-bold text-white">AI GameCaster</p>
              <p className="text-[11px] text-[#8e8e93]">
                {isGenerating
                  ? 'Broadcasting live...'
                  : commentaryItems.length > 0
                  ? `${commentaryItems.length} commentary clips`
                  : 'Powered by Claude'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isGenerating && (
              <div className="flex gap-0.5 items-center">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-1 h-3 rounded-full bg-[#0a84ff]"
                    animate={{ scaleY: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            )}
            {isExpanded ? (
              <ChevronUp size={16} className="text-[#8e8e93]" />
            ) : (
              <ChevronDown size={16} className="text-[#8e8e93]" />
            )}
          </div>
        </button>

        {/* Expanded content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-4 border-t border-[#38383a]/40 pt-4">

                {!isAvailable && (
                  <div className="bg-[#2c2c2e] rounded-xl p-3 text-center">
                    <p className="text-[12px] text-[#8e8e93]">
                      AI commentary available for live and completed games
                    </p>
                  </div>
                )}

                {isAvailable && (
                  <>
                    {/* Voice selector */}
                    <VoiceSelector selected={voiceStyle} onChange={setVoiceStyle} />

                    {/* Commentary type selector */}
                    <div>
                      <p className="text-[11px] font-semibold text-[#8e8e93] uppercase tracking-wider mb-2">
                        Commentary Type
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {commentaryTypes.map(({ type, label, emoji }) => (
                          <button
                            key={type}
                            onClick={() => setCommentaryType(type)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
                              commentaryType === type
                                ? 'bg-[#0a84ff] text-white'
                                : 'bg-[#2c2c2e] text-[#8e8e93]'
                            }`}
                          >
                            <span>{emoji}</span>
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Generate button */}
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={generateCommentary}
                      className={`w-full py-3.5 rounded-xl font-semibold text-[14px] flex items-center justify-center gap-2 transition-all ${
                        isGenerating
                          ? 'bg-[#ff3b30]/15 text-[#ff3b30] border border-[#ff3b30]/30'
                          : 'text-white'
                      }`}
                      style={
                        !isGenerating
                          ? { background: 'linear-gradient(135deg, #0a84ff, #bf5af2)' }
                          : undefined
                      }
                    >
                      {isGenerating ? (
                        <>
                          <MicOff size={16} strokeWidth={2} />
                          Stop Broadcasting
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} strokeWidth={2} />
                          Generate Commentary
                        </>
                      )}
                    </motion.button>

                    {/* Error */}
                    {error && (
                      <div className="bg-[#ff3b30]/10 border border-[#ff3b30]/20 rounded-xl p-3">
                        <p className="text-[12px] text-[#ff3b30]">{error}</p>
                        <p className="text-[11px] text-[#636366] mt-1">
                          Add your ANTHROPIC_API_KEY to .env.local to enable AI commentary.
                        </p>
                      </div>
                    )}

                    {/* Commentary feed */}
                    {(commentaryItems.length > 0 || isGenerating) && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-[11px] font-semibold text-[#8e8e93] uppercase tracking-wider">
                            Broadcast Feed
                          </p>
                          {commentaryItems.length > 0 && !isGenerating && (
                            <button
                              onClick={clearCommentary}
                              className="flex items-center gap-1 text-[11px] text-[#636366] active:text-[#8e8e93]"
                            >
                              <RefreshCw size={11} />
                              Clear
                            </button>
                          )}
                        </div>
                        <CommentaryFeed
                          items={commentaryItems}
                          streamingText={streamingText}
                          isGenerating={isGenerating}
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
