'use client'

import { motion } from 'framer-motion'
import Header from '@/components/layout/Header'
import TabBar from '@/components/layout/TabBar'
import GameCard from '@/components/games/GameCard'
import LiveIndicator from '@/components/ui/LiveIndicator'
import { getLiveGames } from '@/lib/mockData'
import { getSportIcon } from '@/lib/utils'
import type { Sport } from '@/types'

export default function LivePage() {
  const liveGames = getLiveGames()

  // Group by sport
  const bySport = liveGames.reduce((acc, game) => {
    if (!acc[game.sport]) acc[game.sport] = []
    acc[game.sport].push(game)
    return acc
  }, {} as Record<Sport, typeof liveGames>)

  return (
    <div className="flex flex-col min-h-screen bg-black pb-tab-bar">
      <Header
        title="Live Games"
        rightElement={
          <div className="flex items-center gap-1">
            <LiveIndicator size="sm" />
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto">
        {liveGames.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#1c1c1e] flex items-center justify-center text-[32px] mb-4">
              📡
            </div>
            <p className="text-[16px] font-semibold text-white mb-2">No live games right now</p>
            <p className="text-[13px] text-[#636366]">Check back soon for live action</p>
          </div>
        ) : (
          <div className="py-2">
            {/* Stats bar */}
            <div className="mx-4 mb-4 bg-[#1c1c1e] rounded-2xl p-4 flex items-center justify-around">
              <div className="text-center">
                <p className="text-[24px] font-black text-white">{liveGames.length}</p>
                <p className="text-[10px] text-[#8e8e93] uppercase tracking-wide">Live Games</p>
              </div>
              <div className="w-px h-8 bg-[#38383a]" />
              <div className="text-center">
                <p className="text-[24px] font-black text-white">
                  {liveGames.filter(g => g.isPlayoffs).length}
                </p>
                <p className="text-[10px] text-[#8e8e93] uppercase tracking-wide">Playoff Games</p>
              </div>
              <div className="w-px h-8 bg-[#38383a]" />
              <div className="text-center">
                <p className="text-[24px] font-black text-white">
                  {Object.keys(bySport).length}
                </p>
                <p className="text-[10px] text-[#8e8e93] uppercase tracking-wide">Sports</p>
              </div>
            </div>

            {/* Games grouped by sport */}
            {(Object.entries(bySport) as [Sport, typeof liveGames][]).map(([sport, sportGames], sIdx) => (
              <motion.section
                key={sport}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: sIdx * 0.1 }}
                className="mb-6"
              >
                <div className="flex items-center gap-2 px-4 mb-3">
                  <span className="text-[18px]">{getSportIcon(sport)}</span>
                  <h2 className="text-[15px] font-bold text-white">{sport}</h2>
                  <span className="text-[11px] text-[#636366] ml-1">{sportGames.length} live</span>
                </div>

                <div className="px-4 space-y-3">
                  {sportGames.map((game, idx) => (
                    <motion.div
                      key={game.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: sIdx * 0.1 + idx * 0.05 }}
                    >
                      <GameCard game={game} featured />
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            ))}
          </div>
        )}
      </div>

      <TabBar />
    </div>
  )
}
