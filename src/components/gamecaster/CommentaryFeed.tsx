'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { CommentaryItem, VoiceStyle } from '@/types'
import { getVoiceIcon, getVoiceLabel } from '@/lib/utils'

interface CommentaryFeedProps {
  items: CommentaryItem[]
  streamingText?: string
  isGenerating?: boolean
}

const voiceColors: Record<VoiceStyle, string> = {
  classic: '#0a84ff',
  hype: '#ff9f0a',
  analytical: '#bf5af2',
}

const emotionGradients: Record<CommentaryItem['emotion'], string> = {
  neutral: 'from-[#1c1c1e] to-[#1c1c1e]',
  excited: 'from-[#1c1c1e] to-[#ff9f0a]/5',
  analytical: 'from-[#1c1c1e] to-[#bf5af2]/5',
  tense: 'from-[#1c1c1e] to-[#ff3b30]/5',
}

function CommentaryCard({ item }: { item: CommentaryItem }) {
  const color = voiceColors[item.voiceStyle]
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`bg-gradient-to-br ${emotionGradients[item.emotion]} rounded-2xl p-4 border border-[#38383a]/60`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-[12px]"
            style={{ backgroundColor: `${color}20` }}
          >
            {getVoiceIcon(item.voiceStyle)}
          </div>
          <span className="text-[11px] font-semibold" style={{ color }}>
            {getVoiceLabel(item.voiceStyle)}
          </span>
          <span className="text-[10px] text-[#636366] capitalize">{item.type.replace('-', ' ')}</span>
        </div>
        <span className="text-[10px] text-[#636366]">{item.timestamp}</span>
      </div>

      {/* Commentary text */}
      <p className="text-[14px] leading-relaxed text-white/90 font-light">
        {item.text}
      </p>
    </motion.div>
  )
}

function StreamingCard({ text, voiceStyle }: { text: string; voiceStyle: VoiceStyle }) {
  const color = voiceColors[voiceStyle]
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-4 border"
      style={{
        background: `linear-gradient(135deg, #1c1c1e, ${color}08)`,
        borderColor: `${color}30`,
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[12px] animate-pulse"
          style={{ backgroundColor: `${color}20` }}
        >
          {getVoiceIcon(voiceStyle)}
        </div>
        <span className="text-[11px] font-semibold" style={{ color }}>
          {getVoiceLabel(voiceStyle)}
        </span>
        <div className="flex gap-0.5 items-center ml-1">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-1 h-1 rounded-full"
              style={{ backgroundColor: color }}
              animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
      </div>
      <p className="text-[14px] leading-relaxed text-white/90 font-light">
        {text}
        <span className="inline-block w-0.5 h-4 bg-current opacity-80 ml-0.5 animate-pulse align-middle" />
      </p>
    </motion.div>
  )
}

export default function CommentaryFeed({ items, streamingText, isGenerating }: CommentaryFeedProps) {
  const latestVoice = items[items.length - 1]?.voiceStyle || 'classic'

  if (items.length === 0 && !isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-3">
        <div className="w-12 h-12 rounded-full bg-[#2c2c2e] flex items-center justify-center text-[24px]">
          🎙️
        </div>
        <div className="text-center">
          <p className="text-[14px] font-medium text-white/70">No commentary yet</p>
          <p className="text-[12px] text-[#636366] mt-1">
            Select a voice style and tap Generate
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {items.map(item => (
          <CommentaryCard key={item.id} item={item} />
        ))}
        {isGenerating && streamingText !== undefined && (
          <StreamingCard
            key="streaming"
            text={streamingText || ' '}
            voiceStyle={latestVoice}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
