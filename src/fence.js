/**
 * @typedef {import("./fence.d.ts").ParsedMeta} ParsedMeta
 */

const TOKEN_RE = /(\w+)="([^"]*)"|(\w+)=\{([^}]*)\}|\{([^}]*)\}|(\w+)/g;

/**
 * Expands a comma-separated `1,3-5` range string into individual 1-indexed
 * line numbers.
 * @param {string} ranges
 * @returns {number[]}
 */
function parseRanges(ranges) {
  /** @type {number[]} */
  const lines = [];
  for (const part of ranges.split(",")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const [startStr, endStr] = trimmed.split("-");
    const start = Number(startStr);
    const end = endStr !== undefined ? Number(endStr) : start;
    if (!Number.isInteger(start) || !Number.isInteger(end)) continue;
    for (let line = start; line <= end; line += 1) lines.push(line);
  }
  return lines;
}

/**
 * @param {string} meta
 * @returns {ParsedMeta}
 */
export function parseMeta(meta) {
  /** @type {ParsedMeta} */
  const result = { lines: {} };

  for (const match of meta.matchAll(TOKEN_RE)) {
    const [, titleKey, titleValue, stateKey, stateRanges, bareRanges, bareWord] = match;

    if (titleKey !== undefined) {
      if (titleKey === "title") result.title = titleValue;
      continue;
    }

    if (stateKey !== undefined) {
      if (stateKey !== "mark" && stateKey !== "ins" && stateKey !== "del") continue;
      for (const line of parseRanges(stateRanges ?? "")) result.lines[line] = stateKey;
      continue;
    }

    if (bareRanges !== undefined) {
      for (const line of parseRanges(bareRanges)) result.lines[line] = "mark";
      continue;
    }

    if (bareWord === "showLineNumbers") result.showLineNumbers = true;
  }

  return result;
}
