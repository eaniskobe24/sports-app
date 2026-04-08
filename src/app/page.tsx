'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Zap } from 'lucide-react'
import Header from '@/components/layout/Header'
import TabBar from '@/components/layout/TabBar'
import GameCard from '@/components/games/GameCard'
import LiveIndicator from '@/components/ui/LiveIndicator'
import { games, getLiveGames, getUpcomingGames, getFinalGames, getFeaturedGame } from '@/lib/mockData'
import { getSportIcon } from '@/lib/utils'

const SPORT_FILTERS = ['All', 'NBA', 'NHL', 'MLB', 'Soccer'] as const
type FilterType = typeof SPORT_FILTERS[number]

export default function HomePage() {
  const [filter, setFilter] = useState<FilterType>('All')

  const liveGames = getLiveGames()
  const upcomingGames = getUpcomingGames()
  const finalGames = getFinalGames()
  const featured = getFeaturedGame()

  const filteredLive = filter === 'All' ? liveGames : liveGames.filter(g => g.sport === filter)
  const filteredUpcoming = filter === 'All' ? upcomingGames : upcomingGames.filter(g => g.sport === filter)
  const filteredFinal = filter === 'All' ? finalGames : finalGames.filter(g => g.sport === filter)

  return (
    <div className="flex flex-col min-h-screen bg-black pb-tab-bar">
      {/* Header */}
      <Header
        showSettings
        rightElement={
          <button className="relative text-[#8e8e93] active:opacity-50">
            <Bell size={20} strokeWidth={1.8} />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#ff3b30] rounded-full" />
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto">
        {/* Featured Game Banner */}
        {featured && featured.status === 'live' && (
          <div className="px-4 pb-4">
            <div className="relative rounded-3xl overflow-hidden">
              {/* Background gradient using team colors */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  background: `linear-gradient(135deg, ${featured.homeTeam.primaryColor}, ${featured.awayTeam.primaryColor})`,
                }}
              />
              <div className="relative p-5">
                <div className="flex items-center gap-2 mb-4">
                  <LiveIndicator />
                  <span className="text-[12px] font-medium text-white/70 uppercase tracking-wider">
                    {featured.league}
                  </span>
                  {featured.isPlayoffs && (
                    <span className="text-[10px] font-bold text-[#bf5af2] uppercase tracking-wide">
                      · Playoffs
                    </span>
                  )}
                </div>

                {/* Score display */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[13px] font-medium text-white/70">{featured.awayTeam.city}</span>
                    <span className="text-[42px] font-black tabular-nums text-white leading-none">
                      {featured.score.away}
                    </span>
                  </div>
                  <div className="text-center">
                    <div
                      className="px-3 py-1 rounded-full text-[12px] font-semibold"
                      style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white' }}
                    >
                      {featured.period}
                      {featured.timeRemaining && ` · ${featured.timeRemaining}`}
                    </div>
                  </div>
                  <div className="flex flex-col gap-0.5 items-end">
                    <span className="text-[13px] font-medium text-white/70">{featured.homeTeam.city}</span>
                    <span className="text-[42px] font-black tabular-nums text-white leading-none">
                      {featured.score.home}
                    </span>
                  </div>
                </div>

                {featured.seriesInfo && (
                  <p className="text-[11px] text-white/50 text-center">{featured.seriesInfo}</p>
                )}

                {/* AI Cast badge */}
                <div className="flex items-center justify-center mt-3">
                  <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1">
                    <Zap size={11} className="text-[#0a84ff]" />
                    <span className="text-[11px] font-medium text-white/80">AI GameCaster Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sport filter pills */}
        <div className="px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {SPORT_FILTERS.map(sport => (
              <motion.button
                key={sport}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(sport)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                  filter === sport
                    ? 'bg-white text-black'
                    : 'bg-[#1c1c1e] text-[#8e8e93]'
                }`}
              >
                {sport !== 'All' && <span>{getSportIcon(sport as any)}</span>}
                {sport}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Live Games */}
        {filteredLive.length > 0 && (
          <section className="mb-5">
            <div className="flex items-center justify-between px-4 mb-3">
              <div className="flex items-center gap-2">
                <LiveIndicator size="sm" />
                <h2 className="text-[16px] font-bold text-white">
                  Live Now
                </h2>
              </div>
              <span className="text-[12px] text-[#8e8e93]">{filteredLive.length} games</span>
            </div>
            <div className="flex gap-3 overflow-x-auto px-4 pb-1 no-scrollbar">
              {filteredLive.map((game, idx) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <GameCard game={game} />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Games */}
        {filteredUpcoming.length > 0 && (
          <section className="mb-5">
            <div className="flex items-center justify-between px-4 mb-3">
              <h2 className="text-[16px] font-bold text-white">Upcoming</h2>
              <span className="text-[12px] text-[#8e8e93]">{filteredUpcoming.length} games</span>
            </div>
            <div className="px-4 space-y-3">
              {filteredUpcoming.map((game, idx) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <GameCard game={game} featured />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Recent Results */}
        {filteredFinal.length > 0 && (
          <section className="mb-5">
            <div className="flex items-center justify-between px-4 mb-3">
              <h2 className="text-[16px] font-bold text-white">Results</h2>
            </div>
            <div className="px-4 space-y-3">
              {filteredFinal.map((game, idx) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
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
            <p className="text-[15px] font-medium text-[#8e8e93]">No {filter} games today</p>
          </div>
        )}
      </div>

      <TabBar />
    </div>
  )
}
