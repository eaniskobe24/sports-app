import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Sport, GameStatus, VoiceStyle, Game } from '@/types'

export type GameIntensity = 'fire' | 'clutch' | 'close' | 'tied' | null

/**
 * Returns how exciting a live game is based on score margin + game clock.
 * Used for the Heat Badge — visible even when Spoiler Shield is active.
 *
 * fire   = tied OR within margin AND late game (final period/OT)
 * clutch = close AND late game
 * close  = within margin, early game
 * tied   = tied, early game
 * null   = not live, or blowout
 */
export function getGameIntensity(game: Game): GameIntensity {
  if (game.status !== 'live') return null

  const { home, away } = game.score
  const diff = Math.abs(home - away)
  const tied = diff === 0
  const close = isGameClose(home, away, game.sport)

  if (!close && !tied) return null

  // Detect late game from the period string
  const p = game.period.toUpperCase()
  const isLate =
    p.includes('Q4') || p.includes('4TH') ||
    p.includes('OT') ||
    (p.includes('3RD') && (game.sport === 'NHL' || game.sport === 'Soccer')) ||
    p.includes('9TH') || p.includes('8TH') || p.includes('7TH') ||
    (p.includes('2ND') && game.sport === 'Soccer')

  if (tied && isLate) return 'fire'
  if (close && isLate) return 'clutch'
  if (tied) return 'tied'
  return 'close'
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getSportIcon(sport: Sport): string {
  const icons: Record<Sport, string> = {
    NBA: '🏀',
    NFL: '🏈',
    MLB: '⚾',
    NHL: '🏒',
    Soccer: '⚽',
  }
  return icons[sport]
}

export function getSportAccentColor(sport: Sport): string {
  const colors: Record<Sport, string> = {
    NBA: '#ff9f0a',
    NFL: '#30d158',
    MLB: '#0a84ff',
    NHL: '#64d2ff',
    Soccer: '#30d158',
  }
  return colors[sport]
}

export function getStatusColor(status: GameStatus): string {
  const colors: Record<GameStatus, string> = {
    live: '#ff3b30',
    upcoming: '#8e8e93',
    final: '#636366',
  }
  return colors[status]
}

export function getStatusLabel(status: GameStatus): string {
  const labels: Record<GameStatus, string> = {
    live: 'LIVE',
    upcoming: 'UPCOMING',
    final: 'FINAL',
  }
  return labels[status]
}

export function getVoiceLabel(voice: VoiceStyle): string {
  const labels: Record<VoiceStyle, string> = {
    classic: 'Classic',
    hype: 'Hype',
    analytical: 'Analyst',
  }
  return labels[voice]
}

export function getVoiceIcon(voice: VoiceStyle): string {
  const icons: Record<VoiceStyle, string> = {
    classic: '🎙️',
    hype: '⚡',
    analytical: '📊',
  }
  return icons[voice]
}

export function getVoiceDescription(voice: VoiceStyle): string {
  const descs: Record<VoiceStyle, string> = {
    classic: 'Professional broadcast style',
    hype: 'High-energy & electrifying',
    analytical: 'Deep tactical breakdown',
  }
  return descs[voice]
}

export function formatGameTime(sport: Sport, period: string, time: string): string {
  if (!time) return period
  return `${period} · ${time}`
}

export function getWinner(homeScore: number, awayScore: number): 'home' | 'away' | 'tie' {
  if (homeScore > awayScore) return 'home'
  if (awayScore > homeScore) return 'away'
  return 'tie'
}

export function formatRecord(record: string): string {
  return record || ''
}

export function getLeagueName(sport: Sport, league: string): string {
  return league || sport
}

export function isGameClose(homeScore: number, awayScore: number, sport: Sport): boolean {
  const diff = Math.abs(homeScore - awayScore)
  const thresholds: Record<Sport, number> = {
    NBA: 6,
    NFL: 7,
    MLB: 2,
    NHL: 1,
    Soccer: 1,
  }
  return diff <= thresholds[sport]
}

export function getImpactColor(level: 1 | 2 | 3): string {
  const colors = {
    1: '#8e8e93',
    2: '#ff9f0a',
    3: '#ff3b30',
  }
  return colors[level]
}

export function pluralize(count: number, word: string): string {
  return count === 1 ? `${count} ${word}` : `${count} ${word}s`
}
