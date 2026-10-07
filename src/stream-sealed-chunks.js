/**
 * Joins already-highlighted `lines` into `highlight-stream-line` spans
 * separated by newlines.
 * @param {string[]} lines
 * @param {number} startLine Index of `lines[0]` in the overall document.
 * @returns {string}
 */
export function buildSealedChunkHtml(lines, startLine) {
  if (lines.length === 0) return "";
  // Every line but the document's first gets a leading "\n"; the check is
  // hoisted out of the loop.
  let html = `<span class="highlight-stream-line" data-line="${startLine}">${lines[0]}</span>`;
  for (let i = 1; i < lines.length; i++) {
    const lineIndex = startLine + i;
    html += `\n<span class="highlight-stream-line" data-line="${lineIndex}">${lines[i]}</span>`;
  }
  return startLine > 0 ? `\n${html}` : html;
}

/**
 * Appends in place and returns the same array (for Svelte's `x = x`
 * invalidation). Don't copy: that makes sealing O(c^2) over a stream.
 * @param {string[]} chunks
 * @param {string} chunk
 * @returns {string[]}
 */
export function pushSealedChunk(chunks, chunk) {
  chunks.push(chunk);
  return chunks;
}
