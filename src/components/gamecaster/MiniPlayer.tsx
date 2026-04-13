'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Square, Play, Pause, SkipForward, ChevronRight, Flame } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAudioPlayer } from '@/contexts/AudioPlayerContext'
import { useSpoiler } from '@/contexts/SpoilerContext'

// ─── Compact waveform (5 bars) ────────────────────────────────────────────────

function MiniWaveform({ active, color }: { active: boolean; color: string }) {
  return (
    <div className="flex items-end gap-[2px] h-4 w-6">
      {['waveform-bar-3','waveform-bar-1','waveform-bar-5','waveform-bar-2','waveform-bar-4'].map((cls, i) => (
        <div
          key={i}
          className={`w-[2px] rounded-full ${active ? cls : ''}`}
          style={{
            height:          active ? undefined : '3px',
            backgroundColor: color,
            opacity:         active ? 0.9 : 0.3,
          }}
        />
      ))}
    </div>
  )
}

// ─── Countdown ring ───────────────────────────────────────────────────────────

function CountdownRing({ countdown, total = 40 }: { countdown: number; total?: number }) {
  const r  = 9
  const c  = 2 * Math.PI * r
  const pct = countdown / total
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" className="-rotate-90">
      <circle cx="12" cy="12" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
      <circle
        cx="12" cy="12" r={r} fill="none"
        stroke="#0a84ff" strokeWidth="2"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct)}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s linear' }}
      />
      <text
        x="12" y="12"
        textAnchor="middle" dominantBaseline="central"
        fill="white" fontSize="6" fontWeight="700"
        style={{ transform: 'rotate(90deg)', transformOrigin: '12px 12px' }}
      >
        {countdown}
      </text>
    </svg>
  )
}

// ─── MiniPlayer ───────────────────────────────────────────────────────────────

export default function MiniPlayer() {
  const router  = useRouter()
  const audio   = useAudioPlayer()
  const { spoilerShield } = useSpoiler()

  const visible =
    audio.isAutoCast ||
    audio.audioState === 'playing' ||
    audio.audioState === 'paused'  ||
    audio.audioState === 'loading'

  // Pick accent color from current voice style
  const accentColor =
    audio.currentVoiceStyle === 'hype'       ? '#ff9f0a' :
    audio.currentVoiceStyle === 'analytical' ? '#bf5af2' :
    '#0a84ff'

  // Determine what to show in the label area
  const game = audio.autoCastGame ?? audio.currentGame

  const phaseLabel =
    audio.autoCastPhase === 'generating' ? 'Writing commentary…' :
    audio.autoCastPhase === 'waiting'    ? `Next cast in ${audio.autoCastCountdown}s` :
    audio.audioState    === 'loading'    ? 'Loading voice…' :
    audio.audioState    === 'playing'    ? (audio.currentText.slice(0, 60) + (audio.currentText.length > 60 ? '…' : '')) :
    audio.audioState    === 'paused'     ? 'Paused' :
    'AI GameCaster'

  const scoreLabel = game && !spoilerShield
    ? `${game.awayTeam.abbreviation} ${game.score.away} – ${game.homeTeam.abbreviation} ${game.score.home} · ${game.period}`
    : game
    ? `${game.awayTeam.abbreviation} vs ${game.homeTeam.abbreviation} · ${game.period}`
    : null

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80,  opacity: 0 }}
          animate={{ y: 0,   opacity: 1 }}
          exit={{   y: 80,  opacity: 0 }}
          transition={{ type: 'spring', stiffness: 360, damping: 36 }}
          className="fixed left-1/2 -translate-x-1/2 w-full max-w-[428px] z-[45]"
          style={{ bottom: 'calc(var(--tab-bar-base, 80px) + env(safe-area-inset-bottom))' }}
        >
          <div
            className="mx-3 mb-1 rounded-2xl overflow-hidden"
            style={{
              background:  'rgba(18,18,20,0.97)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              border: `1px solid ${accentColor}30`,
              boxShadow: `0 -4px 24px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(255,255,255,0.06)`,
            }}
          >
            <div className="flex items-center gap-3 px-4 py-3">

              {/* Left: waveform OR countdown ring */}
              <div className="flex-shrink-0">
                {audio.autoCastPhase === 'waiting' ? (
                  <CountdownRing countdown={audio.autoCastCountdown} />
                ) : (
                  <MiniWaveform
                    active={audio.audioState === 'playing'}
                    color={accentColor}
                  />
                )}
              </div>

              {/* Center: game info + phase label */}
              <button
                className="flex-1 text-left min-w-0 active:opacity-70"
                onClick={() => game && router.push(`/game/${game.id}`)}
              >
                <p className="text-[12px] font-semibold text-white truncate leading-tight">
                  {phaseLabel}
                </p>
                {scoreLabel && (
                  <p className="text-[10px] text-[#636366] truncate mt-0.5 leading-tight">
                    {scoreLabel}
                  </p>
                )}
              </button>

              {/* Right: controls */}
              <div className="flex items-center gap-1.5 flex-shrink-0">

                {/* Skip-next / fast-forward countdown */}
                {audio.autoCastPhase === 'waiting' && (
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={audio.skipCountdown}
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                  >
                    <SkipForward size={14} className="text-[#8e8e93]" />
                  </motion.button>
                )}

                {/* Play / Pause */}
                {(audio.audioState === 'playing' || audio.audioState === 'paused') && (
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={audio.pauseResume}
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${accentColor}20`, border: `1px solid ${accentColor}30` }}
                  >
                    {audio.audioState === 'playing'
                      ? <Pause size={13} style={{ color: accentColor }} />
                      : <Play  size={13} style={{ color: accentColor }} strokeWidth={2.5} />
                    }
                  </motion.button>
                )}

                {/* Stop / end session */}
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={audio.isAutoCast ? audio.stopAutoCast : audio.stop}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.2)' }}
                >
                  <Square size={10} fill="#ff3b30" stroke="none" />
                </motion.button>

                {/* Chevron to game page */}
                {game && (
                  <ChevronRight size={13} className="text-[#48484a]" />
                )}
              </div>
            </div>

            {/* Auto-cast mode: live bar indicator at top */}
            {audio.isAutoCast && (
              <div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{
                  background: audio.autoCastPhase === 'generating' || audio.autoCastPhase === 'speaking'
                    ? `linear-gradient(90deg, ${accentColor}, #bf5af2, ${accentColor})`
                    : 'transparent',
                  backgroundSize: '200% 100%',
                  animation: (audio.autoCastPhase === 'generating' || audio.autoCastPhase === 'speaking')
                    ? 'shimmer-slide 2s linear infinite'
                    : 'none',
                }}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
