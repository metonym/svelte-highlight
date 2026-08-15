/**
 * Sealed-chunk bookkeeping for HighlightStream's default (non-virtualized)
 * engine: once `SEAL_CHUNK_LINES` completed lines accumulate, they're
 * folded into one immutable HTML string and never touched again, so keyed
 * `{#each sealedChunks}` reconciliation only ever diffs the (constant-size)
 * unsealed tail, not the whole stream.
 */

/**
 * Joins `lines` (already-highlighted line HTML, one entry per line) into one
 * `<span class="highlight-stream-line" data-line="i">` per line, separated
 * by the newlines a real multi-line block needs.
 * @param {string[]} lines
 * @param {number} startLine Index of `lines[0]` in the overall document.
 * @returns {string}
 */
export function buildSealedChunkHtml(lines, startLine) {
  let html = "";
  for (let i = 0; i < lines.length; i++) {
    const lineIndex = startLine + i;
    const sep = lineIndex > 0 ? "\n" : "";
    html += `${sep}<span class="highlight-stream-line" data-line="${lineIndex}">${lines[i]}</span>`;
  }
  return html;
}

/**
 * Appends `chunk` to `chunks` in place and returns the same array reference
 * (Svelte's `x = x` self-assign invalidation idiom relies on referential
 * equality staying stable so a keyed each-block doesn't rebuild). O(1)
 * amortized, not O(c): a concat/spread-copy here would make sealing chunk
 * `c` of a growing stream cost O(c), i.e. O(c^2) total across the stream.
 * @param {string[]} chunks
 * @param {string} chunk
 * @returns {string[]}
 */
export function pushSealedChunk(chunks, chunk) {
  chunks.push(chunk);
  return chunks;
}
