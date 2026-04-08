'use client'

import { useParams, notFound } from 'next/navigation'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Header from '@/components/layout/Header'
import TabBar from '@/components/layout/TabBar'
import ScoreBoard from '@/components/games/ScoreBoard'
import GameTimeline from '@/components/games/GameTimeline'
import PlayByPlay from '@/components/games/PlayByPlay'
import GameCaster from '@/components/gamecaster/GameCaster'
import { getGameById } from '@/lib/mockData'
import { getSportIcon } from '@/lib/utils'

type Tab = 'gamecaster' | 'timeline' | 'playbyplay' | 'stats'

const tabs: { id: Tab; label: string; emoji: string }[] = [
  { id: 'gamecaster', label: 'AI Cast', emoji: '🎙️' },
  { id: 'timeline', label: 'Moments', emoji: '⚡' },
  { id: 'playbyplay', label: 'Plays', emoji: '▶️' },
  { id: 'stats', label: 'Stats', emoji: '📊' },
]

function StatsView({ game }: { game: ReturnType<typeof getGameById> }) {
  if (!game) return null
  const home = game.homeStats
  const away = game.awayStats

  if (!home && !away) {
    return (
      <div className="mx-4 bg-[#1c1c1e] rounded-2xl p-6 text-center">
        <p className="text-[13px] text-[#636366]">Stats not available yet</p>
      </div>
    )
  }

  type StatDef = { key: string; label: string; format?: (v: number | string | undefined) => string }
  let statDefs: StatDef[] = []

  if (game.sport === 'NBA') {
    statDefs = [
      { key: 'fieldGoalsMade', label: 'Field Goals', format: (v) => home?.fieldGoalsMade && home?.fieldGoalsAttempted ? `${home.fieldGoalsMade}/${home.fieldGoalsAttempted}` : '-' },
      { key: 'threesMade', label: '3-Pointers', format: (v) => '-' },
      { key: 'rebounds', label: 'Rebounds' },
      { key: 'assists', label: 'Assists' },
      { key: 'turnovers', label: 'Turnovers' },
    ]
  } else if (game.sport === 'Soccer') {
    statDefs = [
      { key: 'possession', label: 'Possession', format: (v) => v ? `${v}%` : '-' },
      { key: 'shots', label: 'Shots' },
      { key: 'shotsOnTarget', label: 'Shots on Target' },
      { key: 'fouls', label: 'Fouls' },
      { key: 'corners', label: 'Corners' },
    ]
  } else if (game.sport === 'NHL') {
    statDefs = [
      { key: 'shotsOnGoal', label: 'Shots on Goal' },
      { key: 'powerPlays', label: 'Power Plays' },
      { key: 'faceoffWinPct', label: 'Faceoff Win %', format: (v) => v ? `${v}%` : '-' },
    ]
  } else if (game.sport === 'MLB') {
    statDefs = [
      { key: 'hits', label: 'Hits' },
      { key: 'errors', label: 'Errors' },
    ]
  }

  return (
    <div className="mx-4 mb-4">
      <div className="bg-[#1c1c1e] rounded-2xl overflow-hidden">
        {/* Header row */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#38383a]/50">
          <span
            className="text-[12px] font-bold px-2 py-0.5 rounded"
            style={{ backgroundColor: `${game.awayTeam.primaryColor}30`, color: game.awayTeam.primaryColor }}
          >
            {game.awayTeam.abbreviation}
          </span>
          <span className="text-[11px] text-[#636366] uppercase tracking-wide font-medium">Team Stats</span>
          <span
            className="text-[12px] font-bold px-2 py-0.5 rounded"
            style={{ backgroundColor: `${game.homeTeam.primaryColor}30`, color: game.homeTeam.primaryColor }}
          >
            {game.homeTeam.abbreviation}
          </span>
        </div>

        {/* Stat rows */}
        {statDefs.map(({ key, label, format }) => {
          const awayVal = away ? (away as Record<string, number | string | undefined>)[key] : undefined
          const homeVal = home ? (home as Record<string, number | string | undefined>)[key] : undefined
          const awayStr = format ? format(awayVal) : (awayVal !== undefined ? String(awayVal) : '—')
          const homeStr = format ? format(homeVal) : (homeVal !== undefined ? String(homeVal) : '—')

          return (
            <div key={key} className="flex items-center justify-between px-4 py-3 border-b border-[#38383a]/30 last:border-0">
              <span className="text-[14px] font-semibold text-white w-16 tabular-nums">{awayStr}</span>
              <span className="text-[11px] text-[#8e8e93] flex-1 text-center">{label}</span>
              <span className="text-[14px] font-semibold text-white w-16 text-right tabular-nums">{homeStr}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function GamePage() {
  const params = useParams()
  const id = params?.id as string
  const game = getGameById(id)
  const [activeTab, setActiveTab] = useState<Tab>('gamecaster')

  if (!game) {
    return (
      <div className="flex flex-col min-h-screen bg-black pb-tab-bar">
        <Header showBack title="Game" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[#636366]">Game not found</p>
        </div>
        <TabBar />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-black pb-tab-bar">
      <Header
        showBack
        title={`${game.awayTeam.abbreviation} vs ${game.homeTeam.abbreviation}`}
        rightElement={
          <span className="text-[14px]">{getSportIcon(game.sport)}</span>
        }
      />

      <div className="flex-1 overflow-y-auto">
        {/* Scoreboard */}
        <div className="pt-2">
          <ScoreBoard game={game} />
        </div>

        {/* Tab selector */}
        <div className="px-4 mb-4">
          <div className="bg-[#1c1c1e] rounded-xl p-1 flex gap-0.5">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 rounded-lg text-[11px] font-semibold transition-all duration-150 flex items-center justify-center gap-1 ${
                  activeTab === tab.id
                    ? 'bg-[#2c2c2e] text-white shadow'
                    : 'text-[#636366]'
                }`}
              >
                <span className="text-[12px]">{tab.emoji}</span>
                <span className="hidden xs:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === 'gamecaster' && <GameCaster game={game} />}
          {activeTab === 'timeline' && <GameTimeline game={game} />}
          {activeTab === 'playbyplay' && <PlayByPlay game={game} />}
          {activeTab === 'stats' && <StatsView game={game} />}
        </motion.div>

        {/* Game description for upcoming */}
        {game.status === 'upcoming' && game.description && (
          <div className="mx-4 mb-4 bg-[#1c1c1e] rounded-2xl p-4">
            <h3 className="text-[12px] font-semibold text-[#8e8e93] uppercase tracking-wider mb-2">Preview</h3>
            <p className="text-[13px] text-[#ebebf5]/70 leading-relaxed">{game.description}</p>
          </div>
        )}
      </div>

      <TabBar />
    </div>
  )
}
