'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Bell, Heart, Volume2, Moon, ChevronRight, Mic,
  Star, Shield, Info
} from 'lucide-react'
import Header from '@/components/layout/Header'
import TabBar from '@/components/layout/TabBar'
import { getSportIcon } from '@/lib/utils'
import type { Sport, VoiceStyle } from '@/types'

const SPORTS: Sport[] = ['NBA', 'NFL', 'MLB', 'NHL', 'Soccer']

const VOICE_OPTIONS: { value: VoiceStyle; label: string; icon: string; desc: string }[] = [
  { value: 'classic', label: 'Classic', icon: '🎙️', desc: 'ESPN-style broadcast' },
  { value: 'hype', label: 'Hype', icon: '⚡', desc: 'High-energy & exciting' },
  { value: 'analytical', label: 'Analytical', icon: '📊', desc: 'Deep tactical insight' },
]

interface ToggleRowProps {
  icon: React.ReactNode
  label: string
  description?: string
  value: boolean
  onChange: (v: boolean) => void
}

function ToggleRow({ icon, label, description, value, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between py-3.5 px-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-[#2c2c2e] flex items-center justify-center text-[#8e8e93] flex-shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[14px] font-medium text-white">{label}</p>
          {description && <p className="text-[11px] text-[#636366] mt-0.5">{description}</p>}
        </div>
      </div>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => onChange(!value)}
        className={`relative w-12 h-6.5 rounded-full transition-colors duration-200 flex-shrink-0 ${
          value ? 'bg-[#30d158]' : 'bg-[#3a3a3c]'
        }`}
        style={{ width: 48, height: 28 }}
      >
        <motion.div
          className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm"
          animate={{ left: value ? 23 : 4 }}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        />
      </motion.button>
    </div>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <p className="px-4 pt-5 pb-1 text-[12px] font-semibold text-[#8e8e93] uppercase tracking-wider">
      {title}
    </p>
  )
}

export default function ProfilePage() {
  const [favoriteSports, setFavoriteSports] = useState<Sport[]>(['NBA', 'Soccer'])
  const [preferredVoice, setPreferredVoice] = useState<VoiceStyle>('classic')
  const [notifications, setNotifications] = useState({
    gameStart: true,
    bigPlays: true,
    closeGames: false,
    finalScore: true,
  })
  const [autoCommentary, setAutoCommentary] = useState(false)

  const toggleSport = (sport: Sport) => {
    setFavoriteSports(prev =>
      prev.includes(sport) ? prev.filter(s => s !== sport) : [...prev, sport]
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-black pb-tab-bar">
      <Header title="Profile" />

      <div className="flex-1 overflow-y-auto">
        {/* User avatar / header */}
        <div className="flex flex-col items-center py-6 px-4">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-[32px] mb-3"
            style={{ background: 'linear-gradient(135deg, #0a84ff, #bf5af2)' }}
          >
            🏆
          </div>
          <p className="text-[18px] font-bold text-white">Sports Fan</p>
          <p className="text-[13px] text-[#636366] mt-1">Member since April 2026</p>
          <div className="flex gap-4 mt-4">
            <div className="text-center">
              <p className="text-[16px] font-bold text-white">9</p>
              <p className="text-[10px] text-[#636366]">Games Today</p>
            </div>
            <div className="w-px bg-[#38383a]" />
            <div className="text-center">
              <p className="text-[16px] font-bold text-white">5</p>
              <p className="text-[10px] text-[#636366]">Live Now</p>
            </div>
            <div className="w-px bg-[#38383a]" />
            <div className="text-center">
              <p className="text-[16px] font-bold text-white">2</p>
              <p className="text-[10px] text-[#636366]">Fav Sports</p>
            </div>
          </div>
        </div>

        {/* Favorite sports */}
        <SectionHeader title="Favorite Sports" />
        <div className="mx-4 bg-[#1c1c1e] rounded-2xl overflow-hidden divide-y divide-[#38383a]/50">
          {SPORTS.map(sport => (
            <button
              key={sport}
              onClick={() => toggleSport(sport)}
              className="w-full flex items-center justify-between px-4 py-3.5"
            >
              <div className="flex items-center gap-3">
                <span className="text-[20px]">{getSportIcon(sport)}</span>
                <span className="text-[14px] font-medium text-white">{sport}</span>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                favoriteSports.includes(sport) ? 'bg-[#0a84ff] border-[#0a84ff]' : 'border-[#636366]'
              }`}>
                {favoriteSports.includes(sport) && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 rounded-full bg-white"
                  />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* AI GameCaster voice */}
        <SectionHeader title="AI GameCaster Voice" />
        <div className="mx-4 bg-[#1c1c1e] rounded-2xl overflow-hidden">
          <div className="grid grid-cols-3 gap-2 p-3">
            {VOICE_OPTIONS.map(({ value, label, icon, desc }) => (
              <motion.button
                key={value}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPreferredVoice(value)}
                className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-all ${
                  preferredVoice === value
                    ? 'border-[#0a84ff]/50 bg-[#0a84ff]/10'
                    : 'border-[#38383a] bg-[#2c2c2e]'
                }`}
              >
                <span className="text-[20px]">{icon}</span>
                <span className={`text-[11px] font-semibold ${
                  preferredVoice === value ? 'text-[#0a84ff]' : 'text-[#8e8e93]'
                }`}>{label}</span>
                <span className="text-[9px] text-[#636366] text-center leading-snug">{desc}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* GameCaster settings */}
        <div className="mx-4 mt-3 bg-[#1c1c1e] rounded-2xl overflow-hidden divide-y divide-[#38383a]/50">
          <ToggleRow
            icon={<Mic size={16} />}
            label="Auto-Commentary"
            description="Generate commentary every 30 seconds"
            value={autoCommentary}
            onChange={setAutoCommentary}
          />
        </div>

        {/* Notifications */}
        <SectionHeader title="Notifications" />
        <div className="mx-4 bg-[#1c1c1e] rounded-2xl overflow-hidden divide-y divide-[#38383a]/50">
          <ToggleRow
            icon={<Bell size={16} />}
            label="Game Start"
            description="When your favorite teams tip off"
            value={notifications.gameStart}
            onChange={v => setNotifications(prev => ({ ...prev, gameStart: v }))}
          />
          <ToggleRow
            icon={<Star size={16} />}
            label="Big Plays"
            description="Touchdowns, home runs, buzzer beaters"
            value={notifications.bigPlays}
            onChange={v => setNotifications(prev => ({ ...prev, bigPlays: v }))}
          />
          <ToggleRow
            icon={<Heart size={16} />}
            label="Close Games"
            description="Notified when games are within 5 points"
            value={notifications.closeGames}
            onChange={v => setNotifications(prev => ({ ...prev, closeGames: v }))}
          />
          <ToggleRow
            icon={<Volume2 size={16} />}
            label="Final Scores"
            value={notifications.finalScore}
            onChange={v => setNotifications(prev => ({ ...prev, finalScore: v }))}
          />
        </div>

        {/* About */}
        <SectionHeader title="About" />
        <div className="mx-4 bg-[#1c1c1e] rounded-2xl overflow-hidden divide-y divide-[#38383a]/50">
          <button className="w-full flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#2c2c2e] flex items-center justify-center">
                <Shield size={16} className="text-[#8e8e93]" />
              </div>
              <span className="text-[14px] text-white">Privacy Policy</span>
            </div>
            <ChevronRight size={16} className="text-[#636366]" />
          </button>
          <button className="w-full flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#2c2c2e] flex items-center justify-center">
                <Info size={16} className="text-[#8e8e93]" />
              </div>
              <span className="text-[14px] text-white">App Version</span>
            </div>
            <span className="text-[13px] text-[#636366]">1.0.0</span>
          </button>
        </div>

        {/* AI attribution */}
        <div className="mx-4 mt-4 mb-2 p-4 bg-gradient-to-br from-[#1c1c1e] to-[#0a1628] rounded-2xl border border-[#0a84ff]/15">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[14px]">🤖</span>
            <p className="text-[12px] font-semibold text-[#0a84ff]">Powered by Claude</p>
          </div>
          <p className="text-[11px] text-[#636366] leading-relaxed">
            AI GameCaster uses Claude Opus 4.6 to generate real-time sports commentary.
            Requires an Anthropic API key to be configured in your environment.
          </p>
        </div>
      </div>

      <TabBar />
    </div>
  )
}
