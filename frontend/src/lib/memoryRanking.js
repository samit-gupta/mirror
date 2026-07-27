/**
 * Memory Intelligence — Phase 1
 *
 * Lightweight hybrid ranking for memory relevance.
 * Pure JS — no API calls, no schema changes.
 *
 * score = (importance × 3) + (keyword overlap × 2) + recency bonus
 */

const STOPWORDS = new Set([
  'i', 'me', 'my', 'myself', 'we', 'our', 'you', 'your', 'he', 'she', 'it',
  'they', 'them', 'what', 'which', 'who', 'whom', 'this', 'that', 'these',
  'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have',
  'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
  'may', 'might', 'can', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by',
  'from', 'as', 'into', 'about', 'an', 'the', 'a', 'and', 'but', 'or',
  'so', 'yet', 'nor', 'not', 'no', 'if', 'then', 'than', 'too', 'very',
  'just', 'also', 'how', 'why', 'when', 'where', 'get', 'got', 'want',
])

// Memories scoring at or below this threshold have zero keyword overlap with the
// current message and no recent signal. Exclude them to avoid injecting irrelevant context.
const MIN_RELEVANCE_SCORE = 3

/**
 * Lowercases, strips punctuation, splits on whitespace.
 * Drops stopwords and tokens shorter than 3 characters.
 */
function tokenize(text) {
  return (text ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t))
}

/**
 * Returns 0–2 bonus points based on how recently the memory was created.
 * Rewards fresh journal insights over stale records.
 */
function recencyBonus(createdAt) {
  if (!createdAt) return 0
  const ageDays = (Date.now() - new Date(createdAt).getTime()) / 86_400_000
  if (ageDays <= 7) return 2
  if (ageDays <= 30) return 1
  return 0
}

/**
 * Ranks memories by hybrid score and returns the top-K entries.
 *
 * @param {Array}  memories    - Raw memory rows from getMemories()
 * @param {string} userMessage - The current user message to compare against
 * @param {object} options
 * @param {number} options.topK - Maximum memories to return (default 5)
 * @returns {Array} Top-K memories in descending score order, _score stripped
 */
export function rankMemories(memories, userMessage, { topK = 5 } = {}) {
  if (!memories?.length) return []

  const queryTokens = new Set(tokenize(userMessage))
  const hasQuery = queryTokens.size > 0

  const scored = memories.map((memory) => {
    const contentTokens = tokenize(memory.content)

    const overlap = hasQuery
      ? contentTokens.filter((t) => queryTokens.has(t)).length
      : 0

    const score =
      (memory.importance ?? 1) * 3 +
      overlap * 2 +
      recencyBonus(memory.created_at)

    return { ...memory, _score: score }
  })

  return scored
    .filter(({ _score }) => _score > MIN_RELEVANCE_SCORE)
    .sort((a, b) => b._score - a._score)
    .slice(0, topK)
    .map(({ _score, ...memory }) => memory) // strip internal field before passing to Gemini
}
