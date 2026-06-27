/**
 * Parse ANSI SGR escape codes into styled text segments.
 * Malformed sequences are dropped, not thrown.
 */

// The 8 standard color names, indexed by their SGR offset (30-37 / 40-47).
const COLOR_NAMES = [
  "black",
  "red",
  "green",
  "yellow",
  "blue",
  "magenta",
  "cyan",
  "white",
];

/** @typedef {import("./ansi").AnsiColor} AnsiColor */
/** @typedef {import("./ansi").AnsiSegment} AnsiSegment */
/** @typedef {import("./ansi").AnsiStyle} AnsiStyle */

/**
 * The themable name for a standard color offset (0-7).
 * @param {number} offset
 * @returns {string}
 */
function standardName(offset) {
  return COLOR_NAMES[offset] ?? "white";
}

/**
 * Map a 256-color index (0-15 → name, 16+ → index).
 * @param {number} index
 * @returns {AnsiColor}
 */
function paletteColor(index) {
  if (index < 8) return { name: standardName(index) };
  if (index < 16) return { name: `bright-${standardName(index - 8)}` };
  return { index };
}

/**
 * Apply SGR parameters to `style`.
 * @param {AnsiStyle} style
 * @param {number[]} params
 */
function applySgr(style, params) {
  // Empty params (`ESC[m`) reset everything.
  const list = params.length === 0 ? [0] : params;

  for (let i = 0; i < list.length; i += 1) {
    const code = list[i];
    if (code === undefined) continue;

    if (code === 0) {
      // Reset all attributes.
      style.bold = undefined;
      style.dim = undefined;
      style.italic = undefined;
      style.underline = undefined;
      style.fg = undefined;
      style.bg = undefined;
    } else if (code === 1) {
      style.bold = true;
    } else if (code === 2) {
      style.dim = true;
    } else if (code === 3) {
      style.italic = true;
    } else if (code === 4) {
      style.underline = true;
    } else if (code === 22) {
      style.bold = undefined;
      style.dim = undefined;
    } else if (code === 23) {
      style.italic = undefined;
    } else if (code === 24) {
      style.underline = undefined;
    } else if (code >= 30 && code <= 37) {
      style.fg = { name: standardName(code - 30) };
    } else if (code >= 40 && code <= 47) {
      style.bg = { name: standardName(code - 40) };
    } else if (code >= 90 && code <= 97) {
      style.fg = { name: `bright-${standardName(code - 90)}` };
    } else if (code >= 100 && code <= 107) {
      style.bg = { name: `bright-${standardName(code - 100)}` };
    } else if (code === 39) {
      style.fg = undefined;
    } else if (code === 49) {
      style.bg = undefined;
    } else if (code === 38 || code === 48) {
      // Extended color: `38;5;n` (256-color) or `38;2;r;g;b` (truecolor).
      const key = code === 38 ? "fg" : "bg";
      const mode = list[i + 1];
      if (mode === 5) {
        const index = list[i + 2];
        if (typeof index === "number") style[key] = paletteColor(index);
        i += 2;
      } else if (mode === 2) {
        const r = list[i + 2];
        const g = list[i + 3];
        const b = list[i + 4];
        if (
          typeof r === "number" &&
          typeof g === "number" &&
          typeof b === "number"
        ) {
          style[key] = { rgb: [r, g, b] };
        }
        i += 4;
      }
    }
    // Unknown codes: ignore.
  }
}

/**
 * Build a segment from `text` and active fields in `style`.
 * @param {string} text
 * @param {AnsiStyle} style
 * @returns {AnsiSegment}
 */
function toSegment(text, style) {
  /** @type {AnsiSegment} */
  const segment = { text };
  if (style.bold) segment.bold = true;
  if (style.dim) segment.dim = true;
  if (style.italic) segment.italic = true;
  if (style.underline) segment.underline = true;
  if (style.fg) segment.fg = style.fg;
  if (style.bg) segment.bg = style.bg;
  return segment;
}

const ESC = "\x1b";

/**
 * Parse ANSI-escaped terminal output into styled segments.
 *
 * @param {string} text Raw terminal output.
 * @returns {AnsiSegment[]} Styled text segments, in order.
 */
export function parseAnsi(text) {
  if (!text) return [];

  /** @type {AnsiSegment[]} */
  const segments = [];
  /** @type {AnsiStyle} */
  const style = {};
  let buffer = "";

  const flush = () => {
    if (buffer) {
      segments.push(toSegment(buffer, style));
      buffer = "";
    }
  };

  let i = 0;
  while (i < text.length) {
    const ch = text[i];

    if (ch === ESC && text[i + 1] === "[") {
      // Read a CSI sequence: parameters up to a final byte (0x40-0x7e).
      let j = i + 2;
      while (j < text.length) {
        const code = text.charCodeAt(j);
        if (code >= 0x40 && code <= 0x7e) break;
        j += 1;
      }

      if (j >= text.length) {
        // Unterminated: drop the rest.
        break;
      }

      const final = text[j];
      if (final === "m") {
        // SGR applies to text that follows.
        flush();
        const body = text.slice(i + 2, j);
        const params = body
          .split(";")
          .map((part) => (part === "" ? 0 : Number(part)))
          .filter((n) => Number.isInteger(n));
        applySgr(style, params);
      }
      // Non-SGR CSI sequences (cursor moves, etc.) are skipped.
      i = j + 1;
      continue;
    }

    buffer += ch;
    i += 1;
  }

  flush();
  return segments;
}
