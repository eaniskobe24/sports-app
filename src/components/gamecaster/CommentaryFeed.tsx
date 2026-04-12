'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Play, Square, Loader } from 'lucide-react'
import type { CommentaryItem, VoiceStyle } from '@/types'
import { getVoiceIcon, getVoiceLabel } from '@/lib/utils'

type AudioState = 'idle' | 'loading' | 'playing' | 'paused' | 'error'

interface CommentaryFeedProps {
  items:         CommentaryItem[]
  streamingText?: string
  isGenerating?:  boolean
  playingItemId?: string | null
  audioState?:    AudioState
  onPlay?:        (text: string, style: VoiceStyle, itemId: string) => void
  onStop?:        () => void
}

const voiceColors: Record<VoiceStyle, string> = {
  classic:    '#0a84ff',
  hype:       '#ff9f0a',
  analytical: '#bf5af2',
}

// ─── Single commentary card ────────────────────────────────────────────────

function CommentaryCard({
  item,
  isPlaying,
  audioState,
  onPlay,
  onStop,
}: {
  item:       CommentaryItem
  isPlaying:  boolean
  audioState: AudioState
  onPlay:     () => void
  onStop:     () => void
}) {
  const color = voiceColors[item.voiceStyle]

  const showLoadingSpinner = isPlaying && audioState === 'loading'
  const showPlayingSquare  = isPlaying && audioState === 'playing'
  const showPauseIcon      = isPlaying && audioState === 'paused'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0,  scale: 1    }}
      exit={{    opacity: 0, y: -6               }}
      transition={{ type: 'spring', stiffness: 340, damping: 32 }}
      className="rounded-2xl p-4"
      style={{
        background:   isPlaying
          ? `linear-gradient(160deg, #0f0f11, ${color}0c)`
          : 'rgba(255,255,255,0.04)',
        border:       `1px solid ${isPlaying ? color + '28' : 'rgba(255,255,255,0.07)'}`,
        transition:   'border-color 0.3s ease, background 0.3s ease',
      }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-[11px]"
            style={{ backgroundColor: `${color}18` }}
          >
            {getVoiceIcon(item.voiceStyle)}
          </div>
          <span className="text-[11px] font-semibold" style={{ color }}>
            {getVoiceLabel(item.voiceStyle)}
          </span>
          <span className="text-[10px] text-[#48484a] capitalize">
            {item.type.replace('-', ' ')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#48484a]">{item.timestamp}</span>

          {/* Play/stop audio button */}
          <button
            onClick={isPlaying ? onStop : onPlay}
            className="w-6 h-6 rounded-full flex items-center justify-center transition-all active:scale-90"
            style={{
              backgroundColor: isPlaying ? `${color}22` : 'rgba(255,255,255,0.06)',
              border: `1px solid ${isPlaying ? color + '30' : 'rgba(255,255,255,0.08)'}`,
            }}
          >
            {showLoadingSpinner ? (
              <Loader size={9} style={{ color }} className="audio-spinner" />
            ) : showPlayingSquare ? (
              <Square size={8} fill={color} stroke="none" />
            ) : showPauseIcon ? (
              <Play size={9} style={{ color }} />
            ) : (
              <Play size={9} className="text-[#636366]" style={{ marginLeft: '1px' }} />
            )}
          </button>
        </div>
      </div>

      {/* Commentary text */}
      <p className="text-[13.5px] leading-relaxed text-white/85 font-light tracking-tight">
        {item.text}
      </p>
    </motion.div>
  )
}

// ─── Streaming card ────────────────────────────────────────────────────────

function StreamingCard({ text, voiceStyle }: { text: string; voiceStyle: VoiceStyle }) {
  const color = voiceColors[voiceStyle]
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0  }}
      className="rounded-2xl p-4"
      style={{
        background:  `linear-gradient(160deg, #0f0f11, ${color}08)`,
        border:      `1px solid ${color}22`,
      }}
    >
      <div className="flex items-center gap-2 mb-2.5">
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] animate-pulse"
          style={{ backgroundColor: `${color}18` }}
        >
          {getVoiceIcon(voiceStyle)}
        </div>
        <span className="text-[11px] font-semibold" style={{ color }}>
          {getVoiceLabel(voiceStyle)}
        </span>
        {/* Animated dots */}
        <div className="flex gap-0.5 items-center ml-0.5">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-[3px] h-[3px] rounded-full"
              style={{ backgroundColor: color }}
              animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
              transition={{ duration: 0.75, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
      <p className="text-[13.5px] leading-relaxed text-white/85 font-light tracking-tight">
        {text || ' '}
        <span
          className="inline-block w-0.5 h-[14px] ml-0.5 align-middle animate-pulse"
          style={{ backgroundColor: color, opacity: 0.8 }}
        />
      </p>
    </motion.div>
  )
}

// ─── Feed container ────────────────────────────────────────────────────────

export default function CommentaryFeed({
  items,
  streamingText,
  isGenerating,
  playingItemId,
  audioState = 'idle',
  onPlay,
  onStop,
}: CommentaryFeedProps) {
  const latestVoice = items[0]?.voiceStyle || 'classic'

  if (items.length === 0 && !isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-3">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.05)' }}
        >
          <span className="text-[22px]">🎙️</span>
        </div>
        <div className="text-center">
          <p className="text-[13px] font-medium text-white/50">No commentary yet</p>
          <p className="text-[11px] text-[#48484a] mt-1">Select a style and tap Cast Live</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      <AnimatePresence mode="popLayout">
        {/* Streaming card always on top */}
        {isGenerating && streamingText !== undefined && (
          <StreamingCard
            key="streaming"
            text={streamingText || ' '}
            voiceStyle={latestVoice}
          />
        )}
        {items.map(item => (
          <CommentaryCard
            key={item.id}
            item={item}
            isPlaying={playingItemId === item.id}
            audioState={audioState}
            onPlay={() => onPlay?.(item.text, item.voiceStyle, item.id)}
            onStop={() => onStop?.()}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
