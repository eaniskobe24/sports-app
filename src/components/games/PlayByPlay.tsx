'use client'

import type { Game } from '@/types'
import { getSportAccentColor } from '@/lib/utils'

interface PlayByPlayProps {
  game: Game
}

const typeStyles: Record<string, { dot: string; textColor: string }> = {
  score: { dot: '#30d158', textColor: 'text-white' },
  play: { dot: '#636366', textColor: 'text-[#8e8e93]' },
  timeout: { dot: '#ff9f0a', textColor: 'text-[#ff9f0a]' },
  start: { dot: '#0a84ff', textColor: 'text-[#0a84ff]' },
  end: { dot: '#636366', textColor: 'text-[#636366]' },
  review: { dot: '#bf5af2', textColor: 'text-[#bf5af2]' },
}

export default function PlayByPlay({ game }: PlayByPlayProps) {
  const { playByPlay, status } = game
  if (playByPlay.length === 0) return null

  const accentColor = getSportAccentColor(game.sport)

  return (
    <div className="mx-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[13px] font-semibold text-[#8e8e93] uppercase tracking-wider">
          Play-by-Play
        </h3>
        {status === 'live' && (
          <span className="text-[10px] text-[#0a84ff] font-medium">Live feed</span>
        )}
      </div>

      <div className="bg-[#1c1c1e] rounded-2xl overflow-hidden divide-y divide-[#38383a]/50">
        {playByPlay.map((play, idx) => {
          const style = typeStyles[play.type] || typeStyles.play
          return (
            <div
              key={play.id}
              className="flex items-start gap-3 px-4 py-3 animate-fade-in-up"
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              {/* Status dot */}
              <div className="flex flex-col items-center gap-1 pt-1 flex-shrink-0">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: style.dot }}
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-[13px] leading-snug flex-1 ${style.textColor}`}>
                    {play.description}
                  </p>
                  {play.score && (
                    <span
                      className="text-[11px] font-bold tabular-nums flex-shrink-0"
                      style={{ color: accentColor }}
                    >
                      {play.score}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-[#636366] mt-0.5 block">{play.time}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
