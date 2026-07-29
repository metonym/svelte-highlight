/**
 * Append one sealed HTML chunk in O(1) amortized time.
 *
 * HighlightStream seals finished line spans into immutable HTML strings and
 * keeps them in an array rendered by `{#each}`. Spreading into a new array
 * on every seal (`[...chunks, next]`) copies the whole list, which is O(c²)
 * over a long stream. Mutating with `push` and returning the same reference
 * lets Svelte 4 callers reassign (`chunks = pushSealedChunk(chunks, next)`)
 * for reactivity without the copy.
 *
 * @param {string[]} chunks
 * @param {string} chunk
 * @returns {string[]}
 */
export function pushSealedChunk(chunks, chunk) {
  chunks.push(chunk);
  return chunks;
}
