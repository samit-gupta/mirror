import { GoogleGenerativeAI } from '@google/generative-ai'

const MODEL = 'gemini-2.5-flash'

// Internal reasoning prompt. This is not the Future Self prompt.
// Gemini acts as a pattern analysis engine, not as Future Self.
// It must never address or coach the user — its output is internal context only.
const PATTERN_PROMPT = `You are an internal reasoning engine analyzing a set of user memories to identify recurring behavioural patterns.

Rules:
- Only identify patterns that appear across multiple memories. Ignore isolated events.
- Describe behaviour, never identity. Do not label or judge the person.
- Do not coach, advise, or address the user. This output is internal context only.
- Return a maximum of 3 patterns.
- If no meaningful recurring patterns exist, return an empty patterns array.
- Output ONLY valid JSON matching this exact schema:

{
  "patterns": [
    {
      "type": "avoidance | delay | self-doubt | consistency | growth | relapse | overcommitment | other",
      "summary": "One sentence describing the recurring behaviour in under 30 words."
    }
  ]
}`

function getClient() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey) throw new Error('Gemini API key is not configured.')
  return new GoogleGenerativeAI(apiKey)
}

/**
 * Analyzes ranked memories to detect recurring behavioural patterns.
 *
 * Returns an array of pattern objects, or [] if:
 * - fewer than 2 memories are supplied (not enough signal for a pattern)
 * - Gemini returns invalid or unparseable JSON
 * - any network or API error occurs
 *
 * Pattern extraction is an enhancement, not a dependency. Any failure is
 * intentionally silent — the chat pipeline always continues normally.
 *
 * @param {Array} memories - Ranked memory rows from rankMemories()
 * @returns {Promise<Array<{type: string, summary: string}>>}
 */
export async function extractPatterns(memories) {
  // Patterns require at least 2 memories to have a meaningful recurring signal.
  if (!memories?.length || memories.length < 2) return []

  try {
    const client = getClient()
    const model = client.getGenerativeModel({
      model: MODEL,
      generationConfig: { responseMimeType: 'application/json' },
    })

    const memoryList = memories.map((m) => `- ${m.content.trim()}`).join('\n')
    const result = await model.generateContent(
      `${PATTERN_PROMPT}\n\nMemories to analyze:\n${memoryList}`,
    )

    const parsed = JSON.parse(result.response.text().trim())

    if (!Array.isArray(parsed?.patterns)) return []

    return parsed.patterns.filter(
      (p) =>
        typeof p?.type === 'string' &&
        typeof p?.summary === 'string' &&
        p.summary.trim().length > 0,
    )
  } catch {
    // Any failure — network, API error, or JSON parse — returns no patterns.
    // The chat pipeline continues normally without pattern context.
    return []
  }
}
