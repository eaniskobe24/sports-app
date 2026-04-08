import type { Game, Team } from '@/types'

// ─── Teams ────────────────────────────────────────────────────────────────────

const TEAMS: Record<string, Team> = {
  LAL: { id: 'LAL', name: 'Lakers', city: 'Los Angeles', abbreviation: 'LAL', primaryColor: '#552583', secondaryColor: '#FDB927', record: '52-30', seed: 4 },
  GSW: { id: 'GSW', name: 'Warriors', city: 'Golden State', abbreviation: 'GSW', primaryColor: '#1D428A', secondaryColor: '#FFC72C', record: '55-27', seed: 2 },
  BOS: { id: 'BOS', name: 'Celtics', city: 'Boston', abbreviation: 'BOS', primaryColor: '#007A33', secondaryColor: '#BA9653', record: '64-18', seed: 1 },
  MIA: { id: 'MIA', name: 'Heat', city: 'Miami', abbreviation: 'MIA', primaryColor: '#98002E', secondaryColor: '#F9A01B', record: '47-35', seed: 5 },
  DEN: { id: 'DEN', name: 'Nuggets', city: 'Denver', abbreviation: 'DEN', primaryColor: '#0E2240', secondaryColor: '#FEC524', record: '57-25', seed: 1 },
  OKC: { id: 'OKC', name: 'Thunder', city: 'Oklahoma City', abbreviation: 'OKC', primaryColor: '#007AC1', secondaryColor: '#EF3B24', record: '68-14', seed: 1 },
  MIL: { id: 'MIL', name: 'Bucks', city: 'Milwaukee', abbreviation: 'MIL', primaryColor: '#00471B', secondaryColor: '#EEE1C6', record: '49-33', seed: 3 },
  NYK: { id: 'NYK', name: 'Knicks', city: 'New York', abbreviation: 'NYK', primaryColor: '#006BB6', secondaryColor: '#F58426', record: '51-31', seed: 2 },
  EDM: { id: 'EDM', name: 'Oilers', city: 'Edmonton', abbreviation: 'EDM', primaryColor: '#FF4C00', secondaryColor: '#041E42', record: '52-24-6' },
  VAN: { id: 'VAN', name: 'Canucks', city: 'Vancouver', abbreviation: 'VAN', primaryColor: '#00205B', secondaryColor: '#00843D', record: '49-26-7' },
  NYY: { id: 'NYY', name: 'Yankees', city: 'New York', abbreviation: 'NYY', primaryColor: '#003087', secondaryColor: '#E4002C', record: '4-3' },
  BRS: { id: 'BRS', name: 'Red Sox', city: 'Boston', abbreviation: 'BRS', primaryColor: '#BD3039', secondaryColor: '#0C2340', record: '3-4' },
  LAD: { id: 'LAD', name: 'Dodgers', city: 'Los Angeles', abbreviation: 'LAD', primaryColor: '#005A9C', secondaryColor: '#EF3E42', record: '5-2' },
  SDP: { id: 'SDP', name: 'Padres', city: 'San Diego', abbreviation: 'SDP', primaryColor: '#2F241D', secondaryColor: '#FFC425', record: '4-3' },
  CHC: { id: 'CHC', name: 'Cubs', city: 'Chicago', abbreviation: 'CHC', primaryColor: '#0E3386', secondaryColor: '#CC3433', record: '5-2' },
  STL: { id: 'STL', name: 'Cardinals', city: 'St. Louis', abbreviation: 'STL', primaryColor: '#C41E3A', secondaryColor: '#0C2340', record: '3-4' },
  LAFC: { id: 'LAFC', name: 'FC', city: 'Los Angeles', abbreviation: 'LAFC', primaryColor: '#000000', secondaryColor: '#C39E6D' },
  LAG: { id: 'LAG', name: 'Galaxy', city: 'Los Angeles', abbreviation: 'LAG', primaryColor: '#00245D', secondaryColor: '#FFD700' },
  RMA: { id: 'RMA', name: 'Real Madrid', city: 'Madrid', abbreviation: 'RMA', primaryColor: '#FEBE10', secondaryColor: '#00529F' },
  BAR: { id: 'BAR', name: 'Barcelona', city: 'Barcelona', abbreviation: 'BAR', primaryColor: '#A50044', secondaryColor: '#004D98' },
}

// ─── Games ────────────────────────────────────────────────────────────────────

export const games: Game[] = [
  // ── NBA LIVE: Lakers vs Warriors (Playoff Game 1) ──────────────────────────
  {
    id: 'nba-lal-gsw-1',
    sport: 'NBA',
    league: 'NBA Playoffs',
    status: 'live',
    homeTeam: TEAMS.LAL,
    awayTeam: TEAMS.GSW,
    score: { home: 94, away: 88 },
    period: 'Q3',
    timeRemaining: '8:42',
    venue: 'Crypto.com Arena, Los Angeles',
    broadcast: 'ESPN',
    isPlayoffs: true,
    seriesInfo: 'Series tied 0-0 · Game 1',
    keyMoments: [
      { id: 'k1', time: 'Q1 2:14', type: 'basket', description: 'LeBron James slams home the alley-oop from AD to take the lead', teamAbbr: 'LAL', player: 'LeBron James', impactLevel: 2 },
      { id: 'k2', time: 'Q2 5:30', type: 'basket', description: 'Curry drills the corner three — Warriors cut it to two', teamAbbr: 'GSW', player: 'S. Curry', impactLevel: 2 },
      { id: 'k3', time: 'Q2 0:08', type: 'basket', description: 'Anthony Davis puts up the floater at the buzzer — Lakers lead by 6 at half', teamAbbr: 'LAL', player: 'A. Davis', impactLevel: 3 },
      { id: 'k4', time: 'Q3 11:22', type: 'turnover', description: 'Thompson steals the inbound pass — Warriors score off the turnover', teamAbbr: 'GSW', player: 'K. Thompson', impactLevel: 1 },
    ],
    playByPlay: [
      { id: 'p1', time: 'Q3 9:15', description: 'LeBron James drives baseline and draws the foul — goes to the line', teamAbbr: 'LAL', score: '92-88', type: 'play' },
      { id: 'p2', time: 'Q3 9:03', description: 'James makes both free throws', teamAbbr: 'LAL', score: '94-88', type: 'score' },
      { id: 'p3', time: 'Q3 8:55', description: 'Warriors call timeout — Kerr drawing up a play', type: 'timeout' },
      { id: 'p4', time: 'Q3 8:42', description: 'Curry probes the defense from the top of the arc — looking for Green off the screen', teamAbbr: 'GSW', score: '94-88', type: 'play' },
      { id: 'p5', time: 'Q3 8:32', description: 'Anthony Davis denies the entry pass — Warriors reset', teamAbbr: 'LAL', score: '94-88', type: 'play' },
    ],
    homeStats: {
      fieldGoalsMade: 36, fieldGoalsAttempted: 74,
      threesMade: 8, threesAttempted: 22,
      rebounds: 38, assists: 21, turnovers: 9,
    },
    awayStats: {
      fieldGoalsMade: 34, fieldGoalsAttempted: 71,
      threesMade: 11, threesAttempted: 31,
      rebounds: 32, assists: 19, turnovers: 11,
    },
  },

  // ── NBA LIVE: Celtics vs Heat (Playoff Game 2) ─────────────────────────────
  {
    id: 'nba-bos-mia-2',
    sport: 'NBA',
    league: 'NBA Playoffs',
    status: 'live',
    homeTeam: TEAMS.BOS,
    awayTeam: TEAMS.MIA,
    score: { home: 108, away: 104 },
    period: 'Q4',
    timeRemaining: '2:13',
    venue: 'TD Garden, Boston',
    broadcast: 'TNT',
    isPlayoffs: true,
    seriesInfo: 'Boston leads 1-0 · Game 2',
    keyMoments: [
      { id: 'k1', time: 'Q4 5:44', type: 'basket', description: 'Jimmy Butler ties it up with a pull-up mid-range jumper — crowd goes silent', teamAbbr: 'MIA', player: 'J. Butler', impactLevel: 3 },
      { id: 'k2', time: 'Q4 4:20', type: 'basket', description: 'Jayson Tatum answers immediately — stepback three from the logo!', teamAbbr: 'BOS', player: 'J. Tatum', impactLevel: 3 },
      { id: 'k3', time: 'Q4 3:01', type: 'turnover', description: 'Butler loses it at half court — Brown converts on the other end', teamAbbr: 'BOS', player: 'J. Brown', impactLevel: 2 },
    ],
    playByPlay: [
      { id: 'p1', time: 'Q4 2:45', description: 'Tatum with the crossover — scores through contact! And one!', teamAbbr: 'BOS', score: '107-104', type: 'score' },
      { id: 'p2', time: 'Q4 2:33', description: 'Tatum misses the FT — Butler grabs the long rebound', teamAbbr: 'MIA', score: '107-104', type: 'play' },
      { id: 'p3', time: 'Q4 2:20', description: 'Heat push in transition — Adebayo layup is BLOCKED by Porzingis!', teamAbbr: 'BOS', score: '107-104', type: 'play' },
      { id: 'p4', time: 'Q4 2:13', description: 'Jaylen Brown drives and floats one in — Celtics lead by 4!', teamAbbr: 'BOS', score: '108-104', type: 'score' },
    ],
    homeStats: {
      fieldGoalsMade: 41, fieldGoalsAttempted: 82,
      threesMade: 14, threesAttempted: 38,
      rebounds: 42, assists: 28, turnovers: 7,
    },
    awayStats: {
      fieldGoalsMade: 39, fieldGoalsAttempted: 80,
      threesMade: 10, threesAttempted: 29,
      rebounds: 38, assists: 22, turnovers: 12,
    },
  },

  // ── NBA UPCOMING: Nuggets vs Thunder ──────────────────────────────────────
  {
    id: 'nba-den-okc-1',
    sport: 'NBA',
    league: 'NBA Playoffs',
    status: 'upcoming',
    homeTeam: TEAMS.DEN,
    awayTeam: TEAMS.OKC,
    score: { home: 0, away: 0 },
    period: '',
    timeRemaining: '',
    venue: 'Ball Arena, Denver',
    broadcast: 'ESPN',
    isPlayoffs: true,
    seriesInfo: 'Series tied 0-0 · Game 1',
    startTime: 'Tonight · 7:30 PM ET',
    keyMoments: [],
    playByPlay: [],
    description: 'The reigning MVP faces the league\'s most dynamic young point guard in a first-round playoff clash.',
  },

  // ── NBA FINAL: Bucks vs Knicks (OT) ──────────────────────────────────────
  {
    id: 'nba-mil-nyk-f',
    sport: 'NBA',
    league: 'NBA Playoffs',
    status: 'final',
    homeTeam: TEAMS.MIL,
    awayTeam: TEAMS.NYK,
    score: { home: 122, away: 118 },
    period: 'OT',
    timeRemaining: 'Final',
    venue: 'Fiserv Forum, Milwaukee',
    broadcast: 'TNT',
    isPlayoffs: true,
    seriesInfo: 'Milwaukee leads 1-0',
    keyMoments: [
      { id: 'k1', time: 'OT 0:04', type: 'basket', description: 'Giannis seals it with two free throws in the final seconds of OT', teamAbbr: 'MIL', player: 'Giannis', impactLevel: 3 },
      { id: 'k2', time: 'Q4 0:00', type: 'basket', description: 'Brunson hits the buzzer beater to force overtime — MSG going wild!', teamAbbr: 'NYK', player: 'J. Brunson', impactLevel: 3 },
    ],
    playByPlay: [],
    homeStats: {
      fieldGoalsMade: 44, fieldGoalsAttempted: 88,
      threesMade: 13, threesAttempted: 34,
      rebounds: 45, assists: 24, turnovers: 13,
    },
    awayStats: {
      fieldGoalsMade: 42, fieldGoalsAttempted: 85,
      threesMade: 15, threesAttempted: 42,
      rebounds: 40, assists: 26, turnovers: 14,
    },
  },

  // ── NHL LIVE: Oilers vs Canucks (Playoffs) ─────────────────────────────────
  {
    id: 'nhl-edm-van-g3',
    sport: 'NHL',
    league: 'NHL Playoffs',
    status: 'live',
    homeTeam: TEAMS.EDM,
    awayTeam: TEAMS.VAN,
    score: { home: 2, away: 1 },
    period: '2nd',
    timeRemaining: '6:23',
    venue: 'Rogers Place, Edmonton',
    broadcast: 'TNT',
    isPlayoffs: true,
    seriesInfo: 'Series tied 1-1 · Game 3',
    keyMoments: [
      { id: 'k1', time: '1st 8:04', type: 'goal', description: 'McDavid wires one top shelf — Oilers draw first blood', teamAbbr: 'EDM', player: 'C. McDavid', impactLevel: 3 },
      { id: 'k2', time: '1st 14:22', type: 'goal', description: 'Boeser deflects the point shot past Skinner to tie it', teamAbbr: 'VAN', player: 'B. Boeser', impactLevel: 2 },
      { id: 'k3', time: '2nd 2:51', type: 'goal', description: 'Draisaitl power play goal — Oilers restore the lead!', teamAbbr: 'EDM', player: 'L. Draisaitl', impactLevel: 2 },
    ],
    playByPlay: [
      { id: 'p1', time: '2nd 7:02', description: 'Canucks power play ends — Oilers kill it successfully', type: 'play' },
      { id: 'p2', time: '2nd 6:55', description: 'McDavid at full speed breaks into the zone — shot wide', teamAbbr: 'EDM', score: '2-1', type: 'play' },
      { id: 'p3', time: '2nd 6:23', description: 'Hughes carries it in — shot blocked by Darnell Nurse', teamAbbr: 'VAN', score: '2-1', type: 'play' },
    ],
    homeStats: {
      shotsOnGoal: 22, powerPlays: '1/3', faceoffWinPct: 52,
    },
    awayStats: {
      shotsOnGoal: 18, powerPlays: '0/2', faceoffWinPct: 48,
    },
  },

  // ── MLB LIVE: Yankees vs Red Sox ──────────────────────────────────────────
  {
    id: 'mlb-nyy-brs-1',
    sport: 'MLB',
    league: 'MLB',
    status: 'live',
    homeTeam: TEAMS.NYY,
    awayTeam: TEAMS.BRS,
    score: { home: 5, away: 3 },
    period: 'Bot 7th',
    timeRemaining: '2 Outs',
    venue: 'Yankee Stadium, New York',
    broadcast: 'ESPN',
    isPlayoffs: false,
    keyMoments: [
      { id: 'k1', time: 'Top 3rd', type: 'homerun', description: 'Turner crushes one to deep left — Red Sox take the early lead!', teamAbbr: 'BRS', player: 'T. Turner', impactLevel: 3 },
      { id: 'k2', time: 'Bot 5th', type: 'homerun', description: 'Judge OBLITERATES one to the upper deck — 3-run homer! Yankees lead!', teamAbbr: 'NYY', player: 'A. Judge', impactLevel: 3 },
      { id: 'k3', time: 'Bot 6th', type: 'homerun', description: 'Soto adds insurance with a solo shot to right', teamAbbr: 'NYY', player: 'J. Soto', impactLevel: 2 },
    ],
    playByPlay: [
      { id: 'p1', time: 'Bot 7th', description: 'Cole walks Betts on a full count — first batter of the inning reaches', teamAbbr: 'BRS', score: '5-3', type: 'play' },
      { id: 'p2', time: 'Bot 7th', description: 'Bogaerts grounds out to shortstop — Betts moves to second', teamAbbr: 'BRS', score: '5-3', type: 'play' },
      { id: 'p3', time: 'Bot 7th', description: 'Devers at the plate — 2-1 count, looking for that big hit', teamAbbr: 'BRS', score: '5-3', type: 'play' },
    ],
    homeStats: { hits: 8, errors: 1 },
    awayStats: { hits: 6, errors: 0 },
  },

  // ── MLB UPCOMING: Dodgers vs Padres ────────────────────────────────────────
  {
    id: 'mlb-lad-sdp-1',
    sport: 'MLB',
    league: 'MLB',
    status: 'upcoming',
    homeTeam: TEAMS.LAD,
    awayTeam: TEAMS.SDP,
    score: { home: 0, away: 0 },
    period: '',
    timeRemaining: '',
    venue: 'Dodger Stadium, Los Angeles',
    broadcast: 'Apple TV+',
    isPlayoffs: false,
    startTime: 'Tonight · 8:05 PM PT',
    keyMoments: [],
    playByPlay: [],
    description: 'Yoshinobu Yamamoto (2-0, 1.50 ERA) takes the mound against Dylan Cease (1-1, 2.84 ERA) in the rubber match of this three-game divisional series.',
  },

  // ── MLB FINAL: Cubs vs Cardinals ──────────────────────────────────────────
  {
    id: 'mlb-chc-stl-f',
    sport: 'MLB',
    league: 'MLB',
    status: 'final',
    homeTeam: TEAMS.CHC,
    awayTeam: TEAMS.STL,
    score: { home: 7, away: 4 },
    period: 'Bot 9th',
    timeRemaining: 'Final',
    venue: 'Wrigley Field, Chicago',
    broadcast: 'Marquee',
    isPlayoffs: false,
    keyMoments: [
      { id: 'k1', time: 'Top 7th', type: 'homerun', description: 'Goldschmidt ties it at 4 with a 2-run shot to left-center', teamAbbr: 'STL', player: 'P. Goldschmidt', impactLevel: 3 },
      { id: 'k2', time: 'Bot 8th', type: 'homerun', description: 'Swanson grand slam off the left-field scoreboard — Cubs erupt!', teamAbbr: 'CHC', player: 'D. Swanson', impactLevel: 3 },
    ],
    playByPlay: [],
    homeStats: { hits: 11, errors: 1 },
    awayStats: { hits: 9, errors: 2 },
  },

  // ── Soccer LIVE: LAFC vs LA Galaxy ────────────────────────────────────────
  {
    id: 'mls-lafc-lag-1',
    sport: 'Soccer',
    league: 'MLS',
    status: 'live',
    homeTeam: TEAMS.LAFC,
    awayTeam: TEAMS.LAG,
    score: { home: 2, away: 1 },
    period: "67'",
    timeRemaining: '',
    venue: 'BMO Stadium, Los Angeles',
    broadcast: 'Apple TV+',
    isPlayoffs: false,
    keyMoments: [
      { id: 'k1', time: "12'", type: 'goal', description: 'Riqui Puig dazzles with a no-look backheel — Galaxy take the lead!', teamAbbr: 'LAG', player: 'R. Puig', impactLevel: 3 },
      { id: 'k2', time: "38'", type: 'goal', description: 'Messi curls a free kick perfectly around the wall — 1-1!', teamAbbr: 'LAFC', player: 'L. Messi', impactLevel: 3 },
      { id: 'k3', time: "54'", type: 'goal', description: 'Messi with a rocket from 25 yards — LAFC take the lead!', teamAbbr: 'LAFC', player: 'L. Messi', impactLevel: 3 },
    ],
    playByPlay: [
      { id: 'p1', time: "67'", description: 'Messi dribbles past two defenders near the corner flag — crowd on its feet', teamAbbr: 'LAFC', score: '2-1', type: 'play' },
      { id: 'p2', time: "66'", description: 'Galaxy corner — cleared by Blackmon at the near post', type: 'play' },
      { id: 'p3', time: "65'", description: 'Puig cuts inside — curling effort just inches over the bar', teamAbbr: 'LAG', score: '2-1', type: 'play' },
    ],
    homeStats: { possession: 56, shots: 12, shotsOnTarget: 5, fouls: 9, corners: 5 },
    awayStats: { possession: 44, shots: 8, shotsOnTarget: 3, fouls: 11, corners: 3 },
  },

  // ── Soccer LIVE: Real Madrid vs Barcelona (El Clasico!) ───────────────────
  {
    id: 'ucl-rma-bar-1',
    sport: 'Soccer',
    league: 'Champions League',
    status: 'live',
    homeTeam: TEAMS.RMA,
    awayTeam: TEAMS.BAR,
    score: { home: 1, away: 1 },
    period: "45'+2",
    timeRemaining: '',
    venue: 'Santiago Bernabéu, Madrid',
    broadcast: 'Paramount+',
    isPlayoffs: true,
    seriesInfo: 'UCL Semi-Final · 1st Leg',
    keyMoments: [
      { id: 'k1', time: "23'", type: 'goal', description: 'Vinícius Jr. opens the scoring with a stunning left-footed curler — Bernabéu erupts!', teamAbbr: 'RMA', player: 'Vinícius Jr.', impactLevel: 3 },
      { id: 'k2', time: "41'", type: 'goal', description: 'Yamal fires in off the post — 16-year-old sensation equalizes for Barca!', teamAbbr: 'BAR', player: 'L. Yamal', impactLevel: 3 },
    ],
    playByPlay: [
      { id: 'p1', time: "45'+2", description: '45+2 mins — Additional time being added due to injury', type: 'play' },
      { id: 'p2', time: "44'", description: 'Bellingham surges forward — shot deflected wide for a corner', teamAbbr: 'RMA', score: '1-1', type: 'play' },
      { id: 'p3', time: "43'", description: 'Pedri with a defense-splitting through ball — Lewandowski offside by a whisker', teamAbbr: 'BAR', score: '1-1', type: 'play' },
    ],
    homeStats: { possession: 48, shots: 7, shotsOnTarget: 3, fouls: 8, corners: 4 },
    awayStats: { possession: 52, shots: 6, shotsOnTarget: 2, fouls: 7, corners: 3 },
  },
]

// ─── Helper functions ─────────────────────────────────────────────────────────

export function getGameById(id: string): Game | undefined {
  return games.find(g => g.id === id)
}

export function getLiveGames(): Game[] {
  return games.filter(g => g.status === 'live')
}

export function getUpcomingGames(): Game[] {
  return games.filter(g => g.status === 'upcoming')
}

export function getFinalGames(): Game[] {
  return games.filter(g => g.status === 'final')
}

export function getGamesBySport(sport: string): Game[] {
  return games.filter(g => g.sport === sport)
}

export function getFeaturedGame(): Game {
  // Return the most impactful live game
  const live = getLiveGames()
  const clasico = live.find(g => g.id === 'ucl-rma-bar-1')
  if (clasico) return clasico
  const playoff = live.find(g => g.isPlayoffs)
  if (playoff) return playoff
  return live[0] || games[0]
}
