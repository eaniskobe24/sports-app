import { NextRequest, NextResponse } from 'next/server'

// ElevenLabs voice IDs — mapped to commentary styles
// Each voice chosen to match the persona of the commentator
const VOICE_IDS: Record<string, string> = {
  classic: 'pNInz6obpgDQGcFmaJgB',   // Adam — deep, broadcast-quality professional
  hype: 'yoZ06aMxZJJ28mfd3POQ',       // Sam — raspy, high-energy
  analytical: '21m00Tcm4TlvDq8ikWAM', // Rachel — calm, measured, authoritative
}

export async function POST(request: NextRequest) {
  try {
    const { text, voiceStyle = 'classic' } = await request.json()

    if (!text?.trim()) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    if (!process.env.ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { error: 'ELEVENLABS_API_KEY not configured. Add it to .env.local to enable live voice.' },
        { status: 503 }
      )
    }

    const voiceId = VOICE_IDS[voiceStyle] || VOICE_IDS.classic

    const elevenRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: voiceStyle === 'analytical' ? 0.65 : 0.45,
            similarity_boost: 0.75,
            style: voiceStyle === 'hype' ? 0.8 : voiceStyle === 'classic' ? 0.35 : 0.1,
            use_speaker_boost: true,
          },
          output_format: 'mp3_44100_128',
        }),
      }
    )

    if (!elevenRes.ok) {
      const errText = await elevenRes.text().catch(() => '')
      console.error('ElevenLabs TTS error:', elevenRes.status, errText)
      return NextResponse.json(
        { error: 'Voice generation failed. Check your ElevenLabs API key and quota.' },
        { status: elevenRes.status }
      )
    }

    // Stream audio directly back to the client
    return new Response(elevenRes.body, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (err) {
    console.error('TTS route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
