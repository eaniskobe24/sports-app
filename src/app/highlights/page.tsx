'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Zap, Trophy, Target } from 'lucide-react'
import Header from '@/components/layout/Header'
import TabBar from '@/components/layout/TabBar'
import { games } from '@/lib/mockData'
import { getSportIcon, getSportAccentColor } from '@/lib/utils'
import type { KeyMoment } from '@/types'

interface HighlightItem {
  gameId: string
  sport: string
  league: string
  homeTeam: string
  awayTeam: string
  moment: KeyMoment
  accentColor: string
}

// Collect all level 3 key moments from all games
const highlights: HighlightItem[] = games
  .filter(g => g.status === 'live' || g.status === 'final')
  .flatMap(game =>
    game.keyMoments
      .filter(m => m.impactLevel >= 2)
      .map(moment => ({
        gameId: game.id,
        sport: game.sport,
        league: game.league,
        homeTeam: game.homeTeam.abbreviation,
        awayTeam: game.awayTeam.abbreviation,
        moment,
        accentColor: getSportAccentColor(game.sport),
      }))
  )
  .sort((a, b) => b.moment.impactLevel - a.moment.impactLevel)

const momentTypeIcon: Record<KeyMoment['type'], string> = {
  goal: '⚽',
  touchdown: '🏈',
  homerun: '🏠',
  basket: '🏀',
  turnover: '🔄',
  penalty: '🟨',
  challenge: '🔍',
  timeout: '⏱️',
}

const QUICK_STATS = [
  { icon: '🏀', label: 'Playoff games live', value: '4' },
  { icon: '⚽', label: 'El Clásico underway', value: '🔥' },
  { icon: '⚾', label: 'Judge HR tonight', value: '3-run' },
]

export default function HighlightsPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col min-h-screen bg-black pb-tab-bar">
      <Header title="Top Plays" />

      <div className="flex-1 overflow-y-auto">
        <div className="py-3">
          {/* Tonight at a glance */}
          <div className="px-4 mb-5">
            <p className="text-[12px] font-semibold text-[#8e8e93] uppercase tracking-wider mb-3">
              Tonight at a glance
            </p>
            <div className="grid grid-cols-3 gap-2">
              {QUICK_STATS.map((stat, i) => (
                <div
                  key={i}
                  className="bg-[#1c1c1e] rounded-2xl p-3 flex flex-col gap-1.5 items-center text-center"
                >
                  <span className="text-[20px]">{stat.icon}</span>
                  <span className="text-[15px] font-black text-white">{stat.value}</span>
                  <span className="text-[9px] text-[#636366] leading-snug">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Highlights feed */}
          <div className="px-4 mb-3">
            <div className="flex items-center gap-2">
              <Zap size={15} className="text-[#ff9f0a]" />
              <p className="text-[15px] font-bold text-white">Big Moments</p>
            </div>
          </div>

          <div className="px-4 space-y-3">
            {highlights.map((h, idx) => (
              <motion.div
                key={`${h.gameId}-${h.moment.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                onClick={() => router.push(`/game/${h.gameId}`)}
                className="bg-[#1c1c1e] rounded-2xl p-4 cursor-pointer active:bg-[#2c2c2e] transition-colors border border-[#38383a]/40"
              >
                <div className="flex items-start gap-3">
                  {/* Sport icon */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-[18px] flex-shrink-0"
                    style={{ backgroundColor: `${h.accentColor}15` }}
                  >
                    {momentTypeIcon[h.moment.type]}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Game ref */}
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[11px]">{getSportIcon(h.sport as any)}</span>
                      <span className="text-[10px] text-[#636366] font-medium uppercase tracking-wide">
                        {h.awayTeam} vs {h.homeTeam}
                      </span>
                      <span className="text-[10px] text-[#636366]">· {h.moment.time}</span>
                    </div>

                    {/* Player + team */}
                    <div className="flex items-center gap-2 mb-1.5">
                      {h.moment.player && (
                        <span className="text-[13px] font-bold text-white">{h.moment.player}</span>
                      )}
                      <span
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: `${h.accentColor}20`,
                          color: h.accentColor,
                        }}
                      >
                        {h.moment.teamAbbr}
                      </span>
                      {h.moment.impactLevel === 3 && (
                        <span className="text-[10px] text-[#ff9f0a] font-semibold">★ Game changer</span>
                      )}
                    </div>

                    <p className="text-[12px] text-[#8e8e93] leading-relaxed">
                      {h.moment.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}

            {highlights.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="text-[40px] mb-3">🎬</span>
                <p className="text-[15px] font-medium text-[#8e8e93]">Highlights coming soon</p>
              </div>
            )}
          </div>

          {/* Playoff Bracket teaser */}
          <div className="mx-4 mt-6 bg-gradient-to-br from-[#1c1c1e] to-[#0a1628] rounded-2xl p-4 border border-[#0a84ff]/20">
            <div className="flex items-center gap-2 mb-2">
              <Trophy size={16} className="text-[#ff9f0a]" />
              <p className="text-[13px] font-bold text-white">Playoff Bracket</p>
            </div>
            <p className="text-[12px] text-[#8e8e93] leading-relaxed">
              NBA Playoffs are in full swing. Lakers, Celtics, Nuggets, and Thunder headline a stacked first round.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {['LAL 1-0', 'BOS 1-0', 'DEN 0-0', 'OKC 0-0'].map(s => (
                <span key={s} className="text-[11px] bg-[#0a84ff]/15 text-[#0a84ff] px-2 py-1 rounded-lg font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <TabBar />
    </div>
  )
}
