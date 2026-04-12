'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell } from 'lucide-react'
import Header from '@/components/layout/Header'
import TabBar from '@/components/layout/TabBar'
import GameCard from '@/components/games/GameCard'
import LiveIndicator from '@/components/ui/LiveIndicator'
import { games, getLiveGames, getUpcomingGames, getFinalGames, getFeaturedGame } from '@/lib/mockData'
import { getSportIcon } from '@/lib/utils'
import Link from 'next/link'

const SPORT_FILTERS = ['All', 'NBA', 'NHL', 'MLB', 'Soccer'] as const
type FilterType = typeof SPORT_FILTERS[number]

export default function HomePage() {
  const [filter, setFilter] = useState<FilterType>('All')

  const liveGames    = getLiveGames()
  const upcomingGames = getUpcomingGames()
  const finalGames   = getFinalGames()
  const featured     = getFeaturedGame()

  const filteredLive     = filter === 'All' ? liveGames     : liveGames.filter(g => g.sport === filter)
  const filteredUpcoming = filter === 'All' ? upcomingGames : upcomingGames.filter(g => g.sport === filter)
  const filteredFinal    = filter === 'All' ? finalGames    : finalGames.filter(g => g.sport === filter)

  return (
    <div className="flex flex-col min-h-screen bg-black pb-tab-bar">
      <Header
        showSettings
        rightElement={
          <button className="relative text-[#636366] active:opacity-50">
            <Bell size={19} strokeWidth={1.6} />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[#ff3b30] rounded-full" />
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto">

        {/* ── Featured Game Hero ────────────────────────────────────────── */}
        {featured && featured.status === 'live' && (
          <div className="px-4 pt-3 pb-4">
            <Link href={`/game/${featured.id}`}>
              <div
                className="relative rounded-[28px] overflow-hidden"
                style={{ minHeight: 200 }}
              >
                {/* Team-color gradient backdrop — breathes slowly */}
                <div
                  className="absolute inset-0 hero-glow"
                  style={{
                    background: `linear-gradient(135deg, ${featured.homeTeam.primaryColor}55 0%, ${featured.awayTeam.primaryColor}55 100%)`,
                  }}
                />
                {/* Dark overlay for contrast */}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 100%)' }} />

                <div className="relative p-5">
                  {/* Top row: League + LIVE badge */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <LiveIndicator />
                      <span className="text-[11px] font-semibold text-white/60 uppercase tracking-widest">
                        {featured.league}
                      </span>
                    </div>
                    {featured.isPlayoffs && (
                      <span
                        className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full"
                        style={{ backgroundColor: 'rgba(191,90,242,0.2)', color: '#bf5af2', border: '1px solid rgba(191,90,242,0.3)' }}
                      >
                        Playoffs
                      </span>
                    )}
                  </div>

                  {/* Scores — the centrepiece */}
                  <div className="flex items-center justify-between">
                    {/* Away team */}
                    <div className="flex-1">
                      <p className="text-[11px] font-medium text-white/50 uppercase tracking-wider mb-1">
                        {featured.awayTeam.city}
                      </p>
                      <p className="text-[13px] font-bold text-white/80 mb-2">
                        {featured.awayTeam.name}
                      </p>
                      <p
                        className="text-[58px] font-black tabular-nums leading-none"
                        style={{ color: featured.awayTeam.primaryColor || 'white', textShadow: `0 0 40px ${featured.awayTeam.primaryColor}60` }}
                      >
                        {featured.score.away}
                      </p>
                    </div>

                    {/* Period / Time — center */}
                    <div className="flex flex-col items-center gap-1 px-4">
                      <div
                        className="px-3 py-1 rounded-full text-[11px] font-semibold text-white"
                        style={{ backgroundColor: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)' }}
                      >
                        {featured.period}
                      </div>
                      {featured.timeRemaining && (
                        <p className="text-[10px] text-white/45 font-medium tracking-wide">
                          {featured.timeRemaining}
                        </p>
                      )}
                    </div>

                    {/* Home team */}
                    <div className="flex-1 items-end text-right">
                      <p className="text-[11px] font-medium text-white/50 uppercase tracking-wider mb-1 text-right">
                        {featured.homeTeam.city}
                      </p>
                      <p className="text-[13px] font-bold text-white/80 mb-2 text-right">
                        {featured.homeTeam.name}
                      </p>
                      <p
                        className="text-[58px] font-black tabular-nums leading-none text-right"
                        style={{ color: featured.homeTeam.primaryColor || 'white', textShadow: `0 0 40px ${featured.homeTeam.primaryColor}60` }}
                      >
                        {featured.score.home}
                      </p>
                    </div>
                  </div>

                  {/* Series info */}
                  {featured.seriesInfo && (
                    <p className="text-[10px] text-white/35 text-center mt-3 tracking-wide">
                      {featured.seriesInfo}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* ── Sport filter pills ────────────────────────────────────────── */}
        <div className="px-4 pb-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {SPORT_FILTERS.map(sport => (
              <motion.button
                key={sport}
                whileTap={{ scale: 0.94 }}
                onClick={() => setFilter(sport)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap flex-shrink-0 transition-all duration-150"
                style={
                  filter === sport
                    ? { backgroundColor: 'white', color: 'black' }
                    : { backgroundColor: 'rgba(255,255,255,0.06)', color: '#636366' }
                }
              >
                {sport !== 'All' && <span>{getSportIcon(sport as any)}</span>}
                {sport}
              </motion.button>
            ))}
          </div>
        </div>

        {/* ── Live Games ─────────────────────────────────────────────────── */}
        {filteredLive.length > 0 && (
          <section className="mb-5">
            <div className="flex items-center justify-between px-4 mb-3">
              <div className="flex items-center gap-2">
                <LiveIndicator size="sm" />
                <h2 className="text-[15px] font-semibold text-white tracking-tight">Live Now</h2>
              </div>
              <span className="text-[11px] text-[#48484a]">{filteredLive.length} games</span>
            </div>
            <div className="flex gap-3 overflow-x-auto px-4 pb-1 no-scrollbar">
              {filteredLive.map((game, idx) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0  }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <GameCard game={game} />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* ── Upcoming Games ────────────────────────────────────────────── */}
        {filteredUpcoming.length > 0 && (
          <section className="mb-5">
            <div className="flex items-center justify-between px-4 mb-3">
              <h2 className="text-[15px] font-semibold text-white tracking-tight">Upcoming</h2>
              <span className="text-[11px] text-[#48484a]">{filteredUpcoming.length} games</span>
            </div>
            <div className="px-4 space-y-2.5">
              {filteredUpcoming.map((game, idx) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 8  }}
                  animate={{ opacity: 1, y: 0  }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <GameCard game={game} featured />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* ── Recent Results ────────────────────────────────────────────── */}
        {filteredFinal.length > 0 && (
          <section className="mb-5">
            <div className="flex items-center justify-between px-4 mb-3">
              <h2 className="text-[15px] font-semibold text-white tracking-tight">Results</h2>
            </div>
            <div className="px-4 space-y-2.5">
              {filteredFinal.map((game, idx) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 8  }}
                  animate={{ opacity: 1, y: 0  }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <GameCard game={game} featured />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {filteredLive.length === 0 && filteredUpcoming.length === 0 && filteredFinal.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
            <span className="text-[40px] mb-3">{getSportIcon(filter as any) || '🏆'}</span>
            <p className="text-[14px] font-medium text-[#48484a]">No {filter} games today</p>
          </div>
        )}

      </div>

      <TabBar />
    </div>
  )
}
