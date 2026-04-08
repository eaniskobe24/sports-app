'use client'

import type { VoiceStyle } from '@/types'
import { getVoiceIcon, getVoiceLabel, getVoiceDescription, cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface VoiceSelectorProps {
  selected: VoiceStyle
  onChange: (voice: VoiceStyle) => void
}

const voices: VoiceStyle[] = ['classic', 'hype', 'analytical']

const voiceColors: Record<VoiceStyle, string> = {
  classic: '#0a84ff',
  hype: '#ff9f0a',
  analytical: '#bf5af2',
}

export default function VoiceSelector({ selected, onChange }: VoiceSelectorProps) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-[#8e8e93] uppercase tracking-wider mb-2">
        Commentator Style
      </p>
      <div className="flex gap-2">
        {voices.map(voice => {
          const isSelected = selected === voice
          const color = voiceColors[voice]
          return (
            <motion.button
              key={voice}
              whileTap={{ scale: 0.95 }}
              onClick={() => onChange(voice)}
              className={cn(
                'flex-1 flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-xl border transition-all duration-150',
                isSelected
                  ? 'border-transparent'
                  : 'border-[#38383a] bg-[#2c2c2e]'
              )}
              style={
                isSelected
                  ? {
                      backgroundColor: `${color}18`,
                      borderColor: `${color}50`,
                    }
                  : undefined
              }
            >
              <span className="text-[18px]">{getVoiceIcon(voice)}</span>
              <span
                className="text-[11px] font-semibold"
                style={{ color: isSelected ? color : '#8e8e93' }}
              >
                {getVoiceLabel(voice)}
              </span>
            </motion.button>
          )
        })}
      </div>
      {/* Selected voice description */}
      <p className="text-[11px] text-[#636366] mt-2 text-center">
        {getVoiceDescription(selected)}
      </p>
    </div>
  )
}
