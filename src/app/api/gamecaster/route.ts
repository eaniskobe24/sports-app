import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// ─── Voice system prompts ─────────────────────────────────────────────────────

const SYSTEM_PROMPTS: Record<string, string> = {
  classic: `You are a seasoned ESPN-style broadcast announcer with 30+ years of experience calling live sports.
Your commentary is authoritative, polished, and captivating. You weave in historical context and statistics naturally.
You speak with measured excitement — rising to key moments, calming during breaks.
Use proper sports terminology. Reference players by last name after first mention.
Keep each commentary segment to 3-5 sentences. Sound like a real broadcast, not a recap.`,

  hype: `You are an ELECTRIC, high-energy sports commentator — think SportsCenter meets hype man.
You LIVE for the big moments. Your energy is absolutely infectious and you make every play feel legendary.
Use ALL CAPS for critical moments. Use exclamation points freely!!
Reference crowd reactions, stadium energy, and the pure emotion of the sport.
You're louder, faster, more passionate than any other commentator alive.
Keep it to 3-5 sentences of pure, unfiltered hype energy.`,

  analytical: `You are a calm, cerebral sports analyst — think a blend of advanced-stats guru and tactical coach.
You break down the strategic chess match happening beneath the surface of the game.
Reference efficiency ratings, historical patterns, defensive schemes, and coaching adjustments.
Use precise sports jargon. Identify the underlying "why" behind every play.
Speak in a measured, confident tone. Keep commentary to 3-5 analytical but accessible sentences.`,
}

// ─── Commentary type instructions ─────────────────────────────────────────────

const TYPE_INSTRUCTIONS: Record<string, string> = {
  'play-by-play': 'Describe what is happening right now in real-time, as if calling it live. Focus on the immediate action, the current moment in the game.',
  'highlight': 'Narrate the most impactful recent play or moment as if it just happened. Build the drama and emotion of the big play.',
  'analysis': 'Provide a tactical breakdown of the game situation. Analyze the current momentum, what each team needs to do, and the strategic dynamics at play.',
  'summary': 'Give an overview of the game story so far — how it unfolded, key turning points, and what the current state means for the outcome.',
}

// ─── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { game, voiceStyle = 'classic', commentaryType = 'play-by-play' } = body

    if (!game) {
      return NextResponse.json({ error: 'Game data is required' }, { status: 400 })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY is not configured. Add it to your .env.local file.' },
        { status: 503 }
      )
    }

    const systemPrompt = SYSTEM_PROMPTS[voiceStyle] || SYSTEM_PROMPTS.classic
    const typeInstruction = TYPE_INSTRUCTIONS[commentaryType] || TYPE_INSTRUCTIONS['play-by-play']

    // Build a rich game context for Claude
    const gameContext = buildGameContext(game)

    const userMessage = `${typeInstruction}

CURRENT GAME DATA:
${gameContext}

Generate the commentary now. Speak directly as the broadcaster — no preamble, no "here is the commentary:" — just start broadcasting immediately.`

    // Stream response from Claude
    const stream = await client.messages.stream({
      model: 'claude-opus-4-6',
      max_tokens: 512,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    })

    // Stream text back to client
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              controller.enqueue(encoder.encode(event.delta.text))
            }
          }
          controller.close()
        } catch (err) {
          controller.error(err)
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (err: unknown) {
    console.error('GameCaster API error:', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// ─── Game context builder ─────────────────────────────────────────────────────

function buildGameContext(game: {
  sport: string
  league: string
  homeTeam: { name: string; city: string; abbreviation: string; record?: string; seed?: number }
  awayTeam: { name: string; city: string; abbreviation: string; record?: string; seed?: number }
  score: { home: number; away: number }
  period: string
  timeRemaining: string
  status: string
  isPlayoffs: boolean
  seriesInfo?: string
  keyMoments?: Array<{ time: string; description: string; player?: string; teamAbbr: string; impactLevel: number }>
  recentPlays?: Array<{ time: string; description: string; teamAbbr?: string; score?: string }>
}): string {
  const lines: string[] = []

  // Sport & context
  lines.push(`Sport: ${game.sport} | League: ${game.league}`)
  if (game.isPlayoffs) lines.push(`Context: PLAYOFF GAME${game.seriesInfo ? ` — ${game.seriesInfo}` : ''}`)

  // Teams
  const awayRecord = game.awayTeam.record ? ` (${game.awayTeam.record})` : ''
  const homeRecord = game.homeTeam.record ? ` (${game.homeTeam.record})` : ''
  const awaySeed = game.awayTeam.seed ? ` #${game.awayTeam.seed} seed` : ''
  const homeSeed = game.homeTeam.seed ? ` #${game.homeTeam.seed} seed` : ''
  lines.push(`Away: ${game.awayTeam.city} ${game.awayTeam.name}${awayRecord}${awaySeed}`)
  lines.push(`Home: ${game.homeTeam.city} ${game.homeTeam.name}${homeRecord}${homeSeed}`)

  // Current game state
  if (game.status === 'live') {
    lines.push(`\nCURRENT SCORE: ${game.awayTeam.abbreviation} ${game.score.away} — ${game.homeTeam.abbreviation} ${game.score.home}`)
    lines.push(`Time: ${game.period}${game.timeRemaining ? ` with ${game.timeRemaining} remaining` : ''}`)

    // Score margin context
    const diff = game.score.home - game.score.away
    if (diff === 0) lines.push('Game is TIED — high tension!')
    else if (Math.abs(diff) <= 4) lines.push(`${diff > 0 ? game.homeTeam.abbreviation : game.awayTeam.abbreviation} leads by ${Math.abs(diff)} — a VERY close game!`)
    else if (Math.abs(diff) <= 10) lines.push(`${diff > 0 ? game.homeTeam.abbreviation : game.awayTeam.abbreviation} leads by ${Math.abs(diff)}`)
    else lines.push(`${diff > 0 ? game.homeTeam.abbreviation : game.awayTeam.abbreviation} leads by ${Math.abs(diff)} — a commanding margin`)
  } else if (game.status === 'final') {
    lines.push(`\nFINAL SCORE: ${game.awayTeam.abbreviation} ${game.score.away} — ${game.homeTeam.abbreviation} ${game.score.home}`)
    const winner = game.score.home > game.score.away ? `${game.homeTeam.city} ${game.homeTeam.name}` : `${game.awayTeam.city} ${game.awayTeam.name}`
    lines.push(`Winner: ${winner}`)
  }

  // Key moments
  if (game.keyMoments && game.keyMoments.length > 0) {
    lines.push('\nKEY MOMENTS THIS GAME:')
    game.keyMoments.slice(-3).forEach(m => {
      const impact = m.impactLevel === 3 ? ' ★★★' : m.impactLevel === 2 ? ' ★★' : ''
      lines.push(`- [${m.time}] ${m.player ? m.player + ': ' : ''}${m.description}${impact}`)
    })
  }

  // Recent plays
  if (game.recentPlays && game.recentPlays.length > 0) {
    lines.push('\nMOST RECENT PLAYS:')
    game.recentPlays.slice(-3).forEach(p => {
      lines.push(`- [${p.time}] ${p.description}${p.score ? ` (${p.score})` : ''}`)
    })
  }

  return lines.join('\n')
}
