export type Sport = 'NBA' | 'NHL' | 'NFL' | 'MLB' | 'Soccer'
export type GameStatus = 'live' | 'upcoming' | 'final'
export type VoiceStyle = 'classic' | 'hype' | 'analytical'
export type CommentaryType = 'play-by-play' | 'highlight' | 'analysis' | 'summary'
export type ImpactLevel = 1 | 2 | 3

export interface Team {
  id: string
  name: string
  abbreviation: string
  city: string
  primaryColor: string
  secondaryColor: string
  record?: string
  seed?: number
}

export interface KeyMoment {
  id: string
  time: string
  type: 'goal' | 'touchdown' | 'homerun' | 'basket' | 'turnover' | 'penalty' | 'challenge' | 'timeout'
  description: string
  teamAbbr: string
  player?: string
  impactLevel: ImpactLevel
}

export interface PlayByPlayItem {
  id: string
  time: string
  description: string
  teamAbbr?: string
  score?: string
  type: 'play' | 'score' | 'timeout' | 'start' | 'end' | 'review'
}

export interface BoxScoreRow {
  player: string
  position: string
  stats: Record<string, string | number>
}

export interface TeamStats {
  // Basketball
  fieldGoalsMade?: number
  fieldGoalsAttempted?: number
  threesMade?: number
  threesAttempted?: number
  freeThrowsMade?: number
  freeThrowsAttempted?: number
  rebounds?: number
  assists?: number
  turnovers?: number
  steals?: number
  blocks?: number
  // Football
  rushingYards?: number
  passingYards?: number
  touchdowns?: number
  timeOfPossession?: string
  firstDowns?: number
  // Baseball
  hits?: number
  errors?: number
  leftOnBase?: number
  // Soccer
  shots?: number
  shotsOnTarget?: number
  possession?: number
  fouls?: number
  corners?: number
  // Hockey
  shotsOnGoal?: number
  powerPlays?: string
  faceoffWinPct?: number
}

export interface Game {
  id: string
  sport: Sport
  league: string
  status: GameStatus
  homeTeam: Team
  awayTeam: Team
  score: { home: number; away: number }
  period: string
  timeRemaining: string
  venue: string
  broadcast: string
  isPlayoffs: boolean
  seriesInfo?: string
  startTime?: string
  keyMoments: KeyMoment[]
  playByPlay: PlayByPlayItem[]
  homeStats?: TeamStats
  awayStats?: TeamStats
  description?: string
}

export interface CommentaryItem {
  id: string
  text: string
  voiceStyle: VoiceStyle
  type: CommentaryType
  timestamp: string
  emotion: 'neutral' | 'excited' | 'analytical' | 'tense'
}

export interface UserProfile {
  favoriteTeams: string[]
  favoriteLeagues: Sport[]
  preferredVoice: VoiceStyle
  darkMode: boolean
  notifications: {
    gameStart: boolean
    bigPlays: boolean
    closeGames: boolean
    finalScore: boolean
  }
}
