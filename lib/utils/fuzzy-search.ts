/**
 * Simple fuzzy search using Levenshtein distance.
 * Returns items sorted by relevance (best match first).
 */

function levenshtein(a: string, b: string): number {
  const matrix: number[][] = []

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }

  return matrix[b.length][a.length]
}

function normalize(str: string): string {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

/**
 * Generic fuzzy search that works on any type.
 * Pass a getSearchText function to extract the searchable string from each item.
 */
export function fuzzySearchItems<T>(
  query: string,
  items: T[],
  getSearchTexts: (item: T) => string[],
  maxResults = 10
): T[] {
  if (!query.trim()) return items.slice(0, maxResults)

  const normalizedQuery = normalize(query)

  const scored = items.map((item) => {
    const texts = getSearchTexts(item)
    let bestScore = Infinity

    for (const text of texts) {
      const normalizedText = normalize(text)

      // Exact prefix match gets best score
      if (normalizedText.startsWith(normalizedQuery)) {
        bestScore = Math.min(bestScore, 0)
        break
      }

      // Contains match gets good score
      if (normalizedText.includes(normalizedQuery)) {
        bestScore = Math.min(bestScore, 1)
        continue
      }

      // Levenshtein distance for typo tolerance
      const distance = levenshtein(
        normalizedQuery,
        normalizedText.slice(0, normalizedQuery.length + 2)
      )
      bestScore = Math.min(bestScore, distance + 2)
    }

    return { item, score: bestScore }
  })

  return scored
    .filter((s) => s.score <= normalizedQuery.length * 0.6 + 2)
    .sort((a, b) => a.score - b.score)
    .slice(0, maxResults)
    .map((s) => s.item)
}
