import { GoogleGenerativeAI } from '@google/generative-ai'
import { saveMemory } from './memories'

const MODEL = 'gemini-2.5-flash'
// Minimum content length (chars) worth sending to Gemini.
const MIN_CONTENT_LENGTH = 60

function getClient() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey) throw new Error('Gemini API key not configured.')
  return new GoogleGenerativeAI(apiKey)
}

/**
 * Extracts 1-2 long-term insights from a journal entry and persists them as
 * memory_type='journal' memories with importance=3.
 *
 * Designed to be called fire-and-forget (no await) — all failures are silent
 * so they never interrupt the journal save UX.
 */
export async function extractAndStoreJournalMemories(userId, content) {
  if (!userId || !content?.trim() || content.trim().length < MIN_CONTENT_LENGTH) {
    return
  }

  try {
    const client = getClient()
    const model = client.getGenerativeModel({ model: MODEL })

    const prompt = `Read the following journal entry and extract 1 to 2 meaningful long-term insights about what this person values, struggles with, or is working toward. Write each insight as a single concise sentence in the third person. Return only the insights — one per line — with no numbering, labels, or extra text. If the entry is too short or vague to yield a meaningful insight, return nothing.

Journal entry:
${content.trim()}`

    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()

    if (!text) return

    const insights = text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 2) // Hard cap at 2 regardless of model output

    await Promise.all(
      insights.map((insight) =>
        saveMemory({
          userId,
          memoryType: 'journal',
          content: insight,
          importance: 3,
        }),
      ),
    )
  } catch {
    // Extraction is best-effort. Failures are intentionally silent.
  }
}
