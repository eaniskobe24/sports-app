'use client'

import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, ChevronRight, Clock, Eye, EyeOff, Flame, Zap } from 'lucide-react'
import type { Game } from '@/types'
import { getSportIcon, getSportAccentColor, cn, getGameIntensity, type GameIntensity } from '@/lib/utils'
import LiveIndicator from '@/components/ui/LiveIndicator'
import Badge from '@/components/ui/Badge'
import { useSpoiler } from '@/contexts/SpoilerContext'

interface GameCardProps {
  game: Game
  featured?: boolean
}

// ─── Heat badge ────────────────────────────────────────────────────────────
// Visible even when Spoiler Shield is active — shows excitement without score

function HeatBadge({ intensity }: { intensity: GameIntensity }) {
  if (!intensity) return null

  const config = {
    fire:   { label: 'FIRE',   icon: <Flame  size={9} />, bg: 'rgba(255,59,48,0.15)',  border: 'rgba(255,59,48,0.35)',  color: '#ff3b30' },
    clutch: { label: 'CLUTCH', icon: <Zap    size={9} />, bg: 'rgba(255,159,10,0.15)', border: 'rgba(255,159,10,0.35)', color: '#ff9f0a' },
    close:  { label: 'CLOSE',  icon: null,                bg: 'rgba(255,214,10,0.12)', border: 'rgba(255,214,10,0.3)',  color: '#ffd60a' },
    tied:   { label: 'TIED',   icon: null,                bg: 'rgba(255,255,255,0.07)', border: 'rgba(255,255,255,0.18)', color: '#ebebf5' },
  }

  const c = config[intensity]

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold tracking-widest"
      style={{ backgroundColor: c.bg, border: `1px solid ${c.border}`, color: c.color }}
    >
      {c.icon}
      {c.label}
    </motion.span>
  )
}

// ─── Spoiler-aware score display ───────────────────────────────────────────

function TeamRow({
  team,
  score,
  isWinning,
  status,
  hidden,
}: {
  team: Game['homeTeam']
  score: number
  isWinning: boolean
  status: Game['status']
  hidden: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-[11px] font-black"
          style={{ backgroundColor: team.primaryColor, color: team.secondaryColor }}
        >
          {team.abbreviation.slice(0, 3)}
        </div>
        <div className="min-w-0">
          <p className={cn(
            'text-[15px] font-semibold truncate',
            // When hidden, never dim a team (can't telegraph who's winning)
            !hidden && isWinning && status !== 'upcoming' ? 'text-white' : 'text-[#ebebf5]/60'
          )}>
            {team.city}
          </p>
          {team.record && (
            <p className="text-[11px] text-[#636366]">{team.record}</p>
          )}
        </div>
      </div>

      {status !== 'upcoming' && (
        hidden ? (
          // Spoiler shield: blurred placeholder
          <span className="text-[26px] font-black tabular-nums text-[#ebebf5]/20 select-none"
                style={{ filter: 'blur(6px)', userSelect: 'none' }}>
            {score}
          </span>
        ) : (
          <span className={cn(
            'text-[28px] font-black tabular-nums tracking-tight',
            isWinning ? 'text-white' : 'text-[#ebebf5]/50'
          )}>
            {score}
          </span>
        )
      )}
    </div>
  )
}

// ─── Main card ─────────────────────────────────────────────────────────────

export default function GameCard({ game, featured = false }: GameCardProps) {
  const router = useRouter()
  const accentColor = getSportAccentColor(game.sport)
  const homeWinning = game.score.home >= game.score.away
  const awayWinning = game.score.away >= game.score.home
  const intensity = getGameIntensity(game)

  const { spoilerShield, revealedGames, revealGame, hideGame } = useSpoiler()
  const isRevealed = revealedGames.has(game.id)
  // Shield active for this card only if global shield is on AND not individually revealed
  const scoresHidden = spoilerShield && !isRevealed

  const handleRevealToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isRevealed) hideGame(game.id); else revealGame(game.id)
  }

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={() => router.push(`/game/${game.id}`)}
      className={cn(
        'relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-200',
        'border',
        'active:border-[#0a84ff]/30',
        featured ? 'w-full' : 'w-[280px] flex-shrink-0'
      )}
      style={{
        backgroundColor: '#131315',
        borderColor: intensity === 'fire'
          ? 'rgba(255,59,48,0.25)'
          : intensity === 'clutch'
          ? 'rgba(255,159,10,0.2)'
          : 'rgba(255,255,255,0.07)',
      }}
    >
      {/* Top accent stripe — live games only */}
      {game.status === 'live' && (
        <div
          className="h-[2px] w-full"
          style={{
            background: intensity === 'fire'
              ? 'linear-gradient(90deg, #ff3b30, #ff9f0a, transparent)'
              : intensity === 'clutch'
              ? `linear-gradient(90deg, #ff9f0a, ${accentColor}, transparent)`
              : `linear-gradient(90deg, ${accentColor}, transparent)`,
          }}
        />
      )}

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[13px]">{getSportIcon(game.sport)}</span>
            <span className="text-[11px] font-medium text-[#48484a] uppercase tracking-wide">
              {game.league}
            </span>
            {game.isPlayoffs && <Badge variant="playoff">Playoffs</Badge>}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Heat badge — always visible, even when scores hidden */}
            <HeatBadge intensity={intensity} />

            {game.status === 'live'     && <LiveIndicator size="sm" />}
            {game.status === 'final'    && (
              <span className="text-[11px] font-semibold text-[#48484a] uppercase">
                {scoresHidden ? 'Final ·  ?' : 'Final'}
              </span>
            )}
            {game.status === 'upcoming' && (
              <span className="text-[11px] text-[#636366]">{game.startTime}</span>
            )}
          </div>
        </div>

        {/* Scores */}
        <div className="space-y-2 mb-3">
          <TeamRow team={game.awayTeam} score={game.score.away} isWinning={awayWinning} status={game.status} hidden={scoresHidden} />
          <TeamRow team={game.homeTeam} score={game.score.home} isWinning={homeWinning} status={game.status} hidden={scoresHidden} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2"
             style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-1">
            {game.status === 'live' ? (
              <>
                <span className="text-[12px] font-semibold" style={{ color: accentColor }}>
                  {game.period}
                </span>
                {game.timeRemaining && (
                  <span className="text-[12px] text-[#48484a]"> · {game.timeRemaining}</span>
                )}
              </>
            ) : game.status === 'upcoming' ? (
              <span className="text-[12px] text-[#636366] flex items-center gap-1">
                <Clock size={11} />
                {game.startTime}
              </span>
            ) : (
              <span className="text-[12px] text-[#48484a]">
                {game.period === 'OT' ? 'After OT' : 'Full Time'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Per-card reveal/hide toggle (only when shield is active & game has scores) */}
            {spoilerShield && game.status !== 'upcoming' && (
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={handleRevealToggle}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded-md transition-all"
                style={{
                  backgroundColor: isRevealed ? 'rgba(255,255,255,0.08)' : 'rgba(10,132,255,0.12)',
                  border: isRevealed ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(10,132,255,0.25)',
                }}
              >
                {isRevealed
                  ? <EyeOff size={10} className="text-[#636366]" />
                  : <Eye    size={10} className="text-[#0a84ff]"  />
                }
                <span className="text-[9px] font-semibold"
                      style={{ color: isRevealed ? '#48484a' : '#0a84ff' }}>
                  {isRevealed ? 'Hide' : 'Reveal'}
                </span>
              </motion.button>
            )}

            {game.status === 'live' && (
              <div className="flex items-center gap-1 text-[#0a84ff]">
                <Mic size={11} strokeWidth={2} />
                <span className="text-[10px] font-semibold">AI Cast</span>
              </div>
            )}
            <ChevronRight size={14} className="text-[#48484a]" />
          </div>
        </div>

        {game.seriesInfo && (
          <p className="mt-2 text-[10px] text-[#636366] font-medium">{game.seriesInfo}</p>
        )}
      </div>
    </motion.div>
  )
}
