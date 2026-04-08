'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mic, ChevronRight, Clock } from 'lucide-react'
import type { Game } from '@/types'
import { getSportIcon, getSportAccentColor, cn } from '@/lib/utils'
import LiveIndicator from '@/components/ui/LiveIndicator'
import Badge from '@/components/ui/Badge'

interface GameCardProps {
  game: Game
  featured?: boolean
}

function TeamScore({
  team,
  score,
  isWinning,
  status,
}: {
  team: Game['homeTeam']
  score: number
  isWinning: boolean
  status: Game['status']
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Team color swatch */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-[11px] font-black"
          style={{ backgroundColor: team.primaryColor, color: team.secondaryColor }}
        >
          {team.abbreviation.slice(0, 3)}
        </div>
        <div className="min-w-0">
          <p className={cn('text-[15px] font-semibold truncate', isWinning && status !== 'upcoming' ? 'text-white' : 'text-[#ebebf5]/60')}>
            {team.city}
          </p>
          {team.record && (
            <p className="text-[11px] text-[#636366]">{team.record}</p>
          )}
        </div>
      </div>
      {status !== 'upcoming' && (
        <span
          className={cn(
            'text-[28px] font-black tabular-nums tracking-tight',
            isWinning ? 'text-white' : 'text-[#ebebf5]/50'
          )}
        >
          {score}
        </span>
      )}
    </div>
  )
}

export default function GameCard({ game, featured = false }: GameCardProps) {
  const router = useRouter()
  const accentColor = getSportAccentColor(game.sport)
  const homeWinning = game.score.home >= game.score.away
  const awayWinning = game.score.away >= game.score.home

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={() => router.push(`/game/${game.id}`)}
      className={cn(
        'relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-200',
        'bg-[#1c1c1e] border border-[#38383a]/50',
        'active:border-[#0a84ff]/30',
        featured ? 'w-full' : 'w-[280px] flex-shrink-0'
      )}
    >
      {/* Top accent line for live games */}
      {game.status === 'live' && (
        <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }} />
      )}

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[13px]">{getSportIcon(game.sport)}</span>
            <span className="text-[11px] font-medium text-[#636366] uppercase tracking-wide">
              {game.league}
            </span>
            {game.isPlayoffs && (
              <Badge variant="playoff">Playoffs</Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {game.status === 'live' && <LiveIndicator size="sm" />}
            {game.status === 'final' && <span className="text-[11px] font-semibold text-[#636366] uppercase">Final</span>}
            {game.status === 'upcoming' && (
              <span className="text-[11px] text-[#8e8e93]">{game.startTime}</span>
            )}
          </div>
        </div>

        {/* Scores */}
        <div className="space-y-2 mb-3">
          <TeamScore team={game.awayTeam} score={game.score.away} isWinning={awayWinning} status={game.status} />
          <TeamScore team={game.homeTeam} score={game.score.home} isWinning={homeWinning} status={game.status} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-[#38383a]/40">
          <div className="flex items-center gap-1">
            {game.status === 'live' ? (
              <>
                <span className="text-[12px] font-semibold" style={{ color: accentColor }}>
                  {game.period}
                </span>
                {game.timeRemaining && (
                  <span className="text-[12px] text-[#636366]"> · {game.timeRemaining}</span>
                )}
              </>
            ) : game.status === 'upcoming' ? (
              <span className="text-[12px] text-[#8e8e93] flex items-center gap-1">
                <Clock size={11} />
                {game.startTime}
              </span>
            ) : (
              <span className="text-[12px] text-[#636366]">
                {game.period !== 'OT' ? 'Full Time' : 'After OT'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {game.status === 'live' && (
              <div className="flex items-center gap-1 text-[#0a84ff]">
                <Mic size={11} strokeWidth={2} />
                <span className="text-[10px] font-semibold">AI Cast</span>
              </div>
            )}
            <ChevronRight size={14} className="text-[#636366]" />
          </div>
        </div>

        {/* Series info */}
        {game.seriesInfo && (
          <p className="mt-2 text-[10px] text-[#8e8e93] font-medium">{game.seriesInfo}</p>
        )}
      </div>
    </motion.div>
  )
}
