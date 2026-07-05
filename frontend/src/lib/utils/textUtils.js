/**
 * Shared text utilities used across memory-related modules.
 * Provides tokenization and similarity helpers with no external dependencies.
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

/**
 * Lowercases, strips punctuation, splits on whitespace.
 * Drops stopwords and tokens shorter than 3 characters.
 *
 * @param {string} text
 * @returns {string[]}
 */
export function tokenize(text) {
  return (text ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t))
}

/**
 * Computes Jaccard similarity between two strings based on their token sets.
 * Returns a value between 0 (no overlap) and 1 (identical token sets).
 *
 * @param {string} textA
 * @param {string} textB
 * @returns {number}
 */
export function jaccardSimilarity(textA, textB) {
  const setA = new Set(tokenize(textA))
  const setB = new Set(tokenize(textB))

  if (setA.size === 0 && setB.size === 0) return 1

  const intersection = [...setA].filter((t) => setB.has(t)).length
  const union = new Set([...setA, ...setB]).size

  return union === 0 ? 0 : intersection / union
}
