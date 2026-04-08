'use client'

import type { Game } from '@/types'
import { getSportIcon, getSportAccentColor } from '@/lib/utils'
import LiveIndicator from '@/components/ui/LiveIndicator'
import Badge from '@/components/ui/Badge'

interface ScoreBoardProps {
  game: Game
}

function TeamDisplay({ team, score, isHome, status }: {
  team: Game['homeTeam']
  score: number
  isHome: boolean
  status: Game['status']
}) {
  return (
    <div className={`flex flex-col items-center gap-2 flex-1 ${isHome ? '' : ''}`}>
      {/* Team logo / color block */}
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-[13px] font-black shadow-lg"
        style={{
          backgroundColor: team.primaryColor,
          color: team.secondaryColor,
          boxShadow: `0 4px 20px ${team.primaryColor}40`,
        }}
      >
        {team.abbreviation}
      </div>
      <div className="text-center">
        <p className="text-[13px] font-semibold text-white">{team.city}</p>
        <p className="text-[11px] text-[#8e8e93]">{team.name}</p>
        {team.record && <p className="text-[10px] text-[#636366] mt-0.5">{team.record}</p>}
        {team.seed && <p className="text-[10px] text-[#8e8e93] mt-0.5">#{team.seed} seed</p>}
      </div>
      {status !== 'upcoming' && (
        <span className="text-[48px] font-black tabular-nums tracking-tight leading-none text-white">
          {score}
        </span>
      )}
    </div>
  )
}

export default function ScoreBoard({ game }: ScoreBoardProps) {
  const accentColor = getSportAccentColor(game.sport)

  return (
    <div
      className="mx-4 rounded-3xl overflow-hidden mb-4"
      style={{ background: 'linear-gradient(145deg, #1c1c1e 0%, #141414 100%)' }}
    >
      {/* Top status bar */}
      <div
        className="h-1"
        style={{
          background: game.status === 'live'
            ? `linear-gradient(90deg, #ff3b30, ${accentColor})`
            : 'transparent',
        }}
      />

      <div className="p-5">
        {/* League + status */}
        <div className="flex items-center justify-center gap-2 mb-5">
          <span className="text-[14px]">{getSportIcon(game.sport)}</span>
          <span className="text-[12px] font-medium text-[#8e8e93] uppercase tracking-wider">
            {game.league}
          </span>
          {game.isPlayoffs && <Badge variant="playoff">Playoffs</Badge>}
        </div>

        {/* Scoreline */}
        <div className="flex items-center gap-4">
          <TeamDisplay team={game.awayTeam} score={game.score.away} isHome={false} status={game.status} />

          {/* Center divider */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            {game.status === 'upcoming' ? (
              <div className="flex flex-col items-center gap-1">
                <span className="text-[28px] font-light text-[#636366]">vs</span>
                <span className="text-[12px] text-[#8e8e93] text-center">{game.startTime}</span>
              </div>
            ) : (
              <>
                <span className="text-[18px] font-light text-[#3a3a3c]">—</span>
                <div className="flex flex-col items-center mt-1">
                  {game.status === 'live' && (
                    <LiveIndicator size="sm" />
                  )}
                  <span
                    className="text-[13px] font-semibold mt-1"
                    style={{ color: game.status === 'live' ? accentColor : '#636366' }}
                  >
                    {game.period}
                    {game.timeRemaining && ` · ${game.timeRemaining}`}
                  </span>
                  {game.status === 'final' && (
                    <span className="text-[11px] text-[#636366] uppercase tracking-wide">Final</span>
                  )}
                </div>
              </>
            )}
          </div>

          <TeamDisplay team={game.homeTeam} score={game.score.home} isHome status={game.status} />
        </div>

        {/* Series info */}
        {game.seriesInfo && (
          <p className="text-center text-[11px] text-[#8e8e93] mt-4 font-medium">
            {game.seriesInfo}
          </p>
        )}

        {/* Venue + broadcast */}
        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="text-[10px] text-[#636366]">{game.venue}</span>
          <span className="text-[10px] text-[#636366]">·</span>
          <span className="text-[10px] text-[#636366]">{game.broadcast}</span>
        </div>
      </div>
    </div>
  )
}
