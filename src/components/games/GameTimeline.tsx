'use client'

import type { Game, KeyMoment } from '@/types'
import { getImpactColor, getSportAccentColor } from '@/lib/utils'

interface GameTimelineProps {
  game: Game
}

const momentTypeIcon: Record<KeyMoment['type'], string> = {
  goal: '⚽',
  touchdown: '🏈',
  homerun: '⚾',
  basket: '🏀',
  turnover: '🔄',
  penalty: '🟨',
  challenge: '🔍',
  timeout: '⏱️',
}

export default function GameTimeline({ game }: GameTimelineProps) {
  const { keyMoments, status } = game
  if (keyMoments.length === 0) return null

  const accentColor = getSportAccentColor(game.sport)

  return (
    <div className="mx-4 mb-4">
      <h3 className="text-[13px] font-semibold text-[#8e8e93] uppercase tracking-wider mb-3">
        Key Moments
      </h3>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-3 top-0 bottom-0 w-px bg-[#38383a]" />

        <div className="space-y-1">
          {keyMoments.map((moment, idx) => (
            <div
              key={moment.id}
              className="relative flex gap-4 pl-9 py-2 animate-fade-in-up rounded-xl hover:bg-[#1c1c1e] transition-colors"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              {/* Timeline dot */}
              <div
                className="absolute left-1.5 top-3.5 w-3 h-3 rounded-full border-2 border-black flex-shrink-0"
                style={{
                  backgroundColor: getImpactColor(moment.impactLevel),
                  boxShadow: moment.impactLevel === 3 ? `0 0 8px ${getImpactColor(3)}60` : 'none',
                }}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[14px]">{momentTypeIcon[moment.type]}</span>
                    {moment.player && (
                      <span className="text-[12px] font-semibold text-white">{moment.player}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {/* Team color pill */}
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: `${accentColor}20`,
                        color: accentColor,
                      }}
                    >
                      {moment.teamAbbr}
                    </span>
                    <span className="text-[10px] text-[#636366]">{moment.time}</span>
                  </div>
                </div>
                <p className="text-[12px] text-[#8e8e93] mt-0.5 leading-relaxed">
                  {moment.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
