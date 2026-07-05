import { GoogleGenerativeAI } from '@google/generative-ai'
import { getExtractionHash, setExtractionHash } from './journal'
import { getMemories, saveMemory } from './memories'
import { jaccardSimilarity } from './utils/textUtils'

const MODEL = 'gemini-2.5-flash'
const MIN_CONTENT_LENGTH = 60
const SIMILARITY_THRESHOLD = 0.75

// Module-level concurrency guard.
// Tracks user IDs with an extraction already in progress.
const inFlight = new Set()

function getClient() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey) throw new Error('Gemini API key not configured.')
  return new GoogleGenerativeAI(apiKey)
}

/**
 * Returns a hex SHA-256 digest of the given string.
 * Uses the native Web Crypto API — no external dependencies.
 */
async function hashContent(content) {
  const encoded = new TextEncoder().encode(content)
  const buffer = await crypto.subtle.digest('SHA-256', encoded)
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Returns true if the error is an HTTP 429 Too Many Requests from Gemini.
 * The Google AI SDK wraps HTTP errors — we check both numeric status properties
 * and the error message string to handle all SDK versions.
 */
function isRateLimitError(err) {
  if (!err) return false
  const msg = String(err?.message ?? '')
  return (
    err?.status === 429 ||
    err?.statusCode === 429 ||
    msg.includes('429') ||
    msg.toLowerCase().includes('too many requests')
  )
}

/**
 * Removes insights from a batch that are too similar to one already kept.
 * Processes in order — first occurrence wins.
 */
function dedupeWithinBatch(insights) {
  const unique = []
  for (const candidate of insights) {
    const isDuplicate = unique.some(
      (kept) => jaccardSimilarity(candidate, kept) >= SIMILARITY_THRESHOLD,
    )
    if (!isDuplicate) {
      unique.push(candidate)
    }
  }
  return unique
}

/**
 * Extracts 1-2 long-term insights from a journal entry and persists them as
 * memory_type='journal' memories with importance=3.
 *
 * Idempotent: skips extraction if the journal content has not changed since
 * the last successful extraction (tracked via last_processed_content_hash).
 *
 * On Gemini 429 rate-limit: restores the previous hash so the next save
 * can retry, rather than permanently locking out extraction for this content.
 *
 * Designed to be called fire-and-forget (no await) — failures never interrupt
 * the journal save UX.
 *
 * @param {string} userId
 * @param {string} journalId
 * @param {string} content - The raw journal entry content
 */
export async function extractAndStoreJournalMemories(userId, journalId, content) {
  if (!userId || !journalId || !content?.trim() || content.trim().length < MIN_CONTENT_LENGTH) {
    return
  }

  // Concurrency guard: skip if an extraction is already running for this user.
  if (inFlight.has(userId)) return
  inFlight.add(userId)

  try {
    // Primary idempotency check: compare content hash against the stored hash.
    const contentHash = await hashContent(content.trim())

    // Preserve the previous hash so we can restore it if Gemini rate-limits.
    // If the fetch fails we treat the previous hash as null (will re-extract).
    let previousHash = null
    try {
      previousHash = await getExtractionHash(journalId, userId)
      if (previousHash === contentHash) return // Content unchanged — nothing to do.
    } catch {
      // Hash fetch failed — proceed without a false negative.
    }

    // Write the new hash immediately to lock concurrent saves of this content.
    // On 429, this is rolled back so the next save can retry.
    await setExtractionHash(journalId, userId, contentHash)

    const client = getClient()
    const model = client.getGenerativeModel({ model: MODEL })

    const prompt = `Analyze the journal entry below. Extract 1 to 2 long-term insights about what this person values, struggles with, or is working toward.

Rules:
- Write in the third person
- Keep each insight under 20 words
- Return only the insights — one per line — with no numbering or extra text
- If the entry is too short or vague, return nothing

Journal entry:
${content.trim()}`

    let result
    try {
      result = await model.generateContent(prompt)
    } catch (geminiErr) {
      if (isRateLimitError(geminiErr)) {
        // Gemini rejected the request — extraction never ran.
        // Restore the previous hash so the next save is not permanently blocked.
        if (import.meta.env.DEV) {
          console.warn(
            '[Mirror] Journal extraction skipped — Gemini rate limit (429). ' +
              'The previous content hash has been restored; extraction will retry on the next save.',
          )
        }
        await setExtractionHash(journalId, userId, previousHash).catch(() => {})
        return
      }
      // Non-429 Gemini error — propagate to the outer catch for silent handling.
      throw geminiErr
    }

    const text = result.response.text().trim()

    if (!text) return

    const insights = text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 2)

    // Secondary guard 1: intra-batch dedup.
    const batchUnique = dedupeWithinBatch(insights)

    // Secondary guard 2: cross-memory Jaccard check against existing journal memories.
    let journalMemories = []
    try {
      const existing = await getMemories(userId)
      journalMemories = existing.filter((m) => m.memory_type === 'journal')
    } catch {
      // Non-fatal — proceed without cross-check if fetch fails.
    }

    const uniqueInsights = batchUnique.filter((insight) =>
      journalMemories.every(
        (mem) => jaccardSimilarity(insight, mem.content) < SIMILARITY_THRESHOLD,
      ),
    )

    if (uniqueInsights.length > 0) {
      await Promise.all(
        uniqueInsights.map((insight) =>
          saveMemory({
            userId,
            memoryType: 'journal',
            content: insight,
            importance: 3,
          }),
        ),
      )
    }
  } catch {
    // Extraction is best-effort. Unexpected failures are intentionally silent.
  } finally {
    // Always release the lock — even on error — so future saves are not blocked.
    inFlight.delete(userId)
  }
}
