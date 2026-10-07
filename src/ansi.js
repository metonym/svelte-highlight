// Malformed sequences are dropped, not thrown.

// Indexed by SGR offset (30-37 / 40-47).
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
 * @param {number} offset
 * @returns {string}
 */
function standardName(offset) {
  return COLOR_NAMES[offset] ?? "white";
}

/**
 * @param {number} index
 * @returns {AnsiColor}
 */
function paletteColor(index) {
  if (index < 8) return { name: standardName(index) };
  if (index < 16) return { name: `bright-${standardName(index - 8)}` };
  return { index };
}

/**
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
      style.bold = undefined;
      style.dim = undefined;
      style.italic = undefined;
      style.underline = undefined;
      style.reverse = undefined;
      style.strikethrough = undefined;
      style.conceal = undefined;
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
    } else if (code === 21) {
      // Spec: double underline (some emitters misuse it as "bold off").
      style.underline = true;
    } else if (code === 7) {
      style.reverse = true;
    } else if (code === 27) {
      style.reverse = undefined;
    } else if (code === 8) {
      style.conceal = true;
    } else if (code === 28) {
      style.conceal = undefined;
    } else if (code === 9) {
      style.strikethrough = true;
    } else if (code === 29) {
      style.strikethrough = undefined;
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
      // `38;5;n` (256-color) or `38;2;r;g;b` (truecolor).
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
  }
}

/**
 * `;`-separated integers in `text.slice(start, end)`; an empty part is 0.
 * All-digit bodies are parsed by char code to skip the split/map/filter
 * allocations; anything else falls back to that chain for `Number()` parity.
 * @param {string} text
 * @param {number} start
 * @param {number} end
 * @returns {number[]}
 */
function parseSgrParams(text, start, end) {
  /** @type {number[]} */
  const params = [];
  let value = 0;
  let digits = 0;
  for (let k = start; k < end; k += 1) {
    const code = text.charCodeAt(k);
    if (code === 0x3b) {
      params.push(value);
      value = 0;
      digits = 0;
    } else if (code >= 0x30 && code <= 0x39 && digits < 15) {
      value = value * 10 + (code - 0x30);
      digits += 1;
    } else {
      return text
        .slice(start, end)
        .split(";")
        .map((part) => (part === "" ? 0 : Number(part)))
        .filter((n) => Number.isInteger(n));
    }
  }
  params.push(value);
  return params;
}

/**
 * @param {string} text
 * @param {AnsiStyle} style
 * @param {string} [link]
 * @returns {AnsiSegment}
 */
function toSegment(text, style, link) {
  /** @type {AnsiSegment} */
  const segment = { text };
  if (style.bold) segment.bold = true;
  if (style.dim) segment.dim = true;
  if (style.italic) segment.italic = true;
  if (style.underline) segment.underline = true;
  if (style.strikethrough) segment.strikethrough = true;
  if (style.conceal) segment.conceal = true;
  // Swap only on output so a later SGR 27 restores the original mapping.
  const fg = style.reverse ? style.bg : style.fg;
  const bg = style.reverse ? style.fg : style.bg;
  if (fg) segment.fg = fg;
  if (bg) segment.bg = bg;
  if (link) segment.link = link;
  return segment;
}

const ESC = "\x1b";

/**
 * Index of the next ESC or `\r` at or after `from` (or `text.length`).
 * @param {string} text
 * @param {number} from
 */
function plainRunEnd(text, from) {
  let j = from;
  while (j < text.length) {
    const code = text.charCodeAt(j);
    if (code === 0x1b || code === 0x0d) break;
    j += 1;
  }
  return j;
}

/**
 * Index of the BEL or ST (`ESC \\`) ending a string sequence, or -1.
 * @param {string} text
 * @param {number} from
 */
function stringTerminator(text, from) {
  for (let j = from; j < text.length; j += 1) {
    if (text[j] === "\x07") return j;
    if (text[j] === ESC && text[j + 1] === "\\") return j;
  }
  return -1;
}

// OSC 8 targets with any other scheme (javascript:, data:, ...) are dropped.
const ALLOWED_LINK_SCHEMES = ["http:", "https:", "mailto:"];

/**
 * @param {string} uri
 * @returns {string | undefined}
 */
function sanitizeLink(uri) {
  const trimmed = uri.trim();
  const lower = trimmed.toLowerCase();
  return ALLOWED_LINK_SCHEMES.some((scheme) => lower.startsWith(scheme))
    ? trimmed
    : undefined;
}

/**
 * @param {string} text Raw terminal output.
 * @returns {AnsiSegment[]}
 */
export function parseAnsi(text) {
  if (!text) return [];
  const session = createAnsiSession();
  session.append(text);
  return session.finish();
}

/** @typedef {import("./ansi").AnsiSession} AnsiSession */

/**
 * @returns {AnsiSession}
 */
export function createAnsiSession() {
  /** @type {AnsiSegment[]} */
  const segments = [];
  /** @type {AnsiStyle} */
  const style = {};
  let buffer = "";
  /** @type {string | undefined} */
  let link;
  // Incomplete trailing sequence from the last append(), retried with more input.
  let pending = "";
  let finished = false;
  // Lowest index in `segments` changed since the last delta(); only
  // resetLine() can lower it.
  let changedFrom = 0;

  const flush = () => {
    if (buffer) {
      segments.push(toSegment(buffer, style, link));
      buffer = "";
    }
  };

  // Lone `\r`: drop back to the last `\n` (a line-level overwrite).
  const resetLine = () => {
    const bufferBreak = buffer.lastIndexOf("\n");
    if (bufferBreak !== -1) {
      buffer = buffer.slice(0, bufferBreak + 1);
      return;
    }
    buffer = "";
    let last = segments.pop();
    while (last !== undefined && last.text.lastIndexOf("\n") === -1) {
      last = segments.pop();
    }
    if (segments.length < changedFrom) changedFrom = segments.length;
    if (last !== undefined) {
      last.text = last.text.slice(0, last.text.lastIndexOf("\n") + 1);
      segments.push(last);
    }
  };

  /**
   * Unless `atEnd`, an incomplete trailing sequence is returned unconsumed;
   * at the end it is dropped (a lone `\r` still overwrites).
   * @param {string} input
   * @param {boolean} atEnd
   * @returns {string} Unconsumed tail (always "" when `atEnd`).
   */
  const scan = (input, atEnd) => {
    let i = 0;

    while (i < input.length) {
      const ch = input[i];

      if (ch === ESC && input[i + 1] === "[") {
        let j = i + 2;
        while (j < input.length) {
          const code = input.charCodeAt(j);
          if (code >= 0x40 && code <= 0x7e) break;
          j += 1;
        }

        if (j >= input.length) {
          if (atEnd) break;
          return input.slice(i);
        }

        if (input[j] === "m") {
          flush();
          applySgr(style, parseSgrParams(input, i + 2, j));
        }
        i = j + 1;
        continue;
      }

      if (ch === ESC && input[i + 1] === "]") {
        const j = stringTerminator(input, i + 2);
        if (j === -1) {
          if (atEnd) break;
          return input.slice(i);
        }

        const body = input.slice(i + 2, j);
        const firstSemi = body.indexOf(";");
        const command = firstSemi === -1 ? body : body.slice(0, firstSemi);
        // OSC 8 hyperlink `8;params;uri`; an empty uri closes the link.
        if (command === "8" && firstSemi !== -1) {
          const rest = body.slice(firstSemi + 1);
          const secondSemi = rest.indexOf(";");
          if (secondSemi !== -1) {
            flush();
            const uri = rest.slice(secondSemi + 1);
            link = uri ? sanitizeLink(uri) : undefined;
          }
        }
        i = j + (input[j] === ESC ? 2 : 1);
        continue;
      }

      if (ch === ESC) {
        const next = input[i + 1];

        // DCS/SOS/PM/APC: string-terminated like OSC, no rendered state.
        if (next === "P" || next === "X" || next === "^" || next === "_") {
          const j = stringTerminator(input, i + 2);
          if (j === -1) {
            if (atEnd) break;
            return input.slice(i);
          }
          i = j + (input[j] === ESC ? 2 : 1);
          continue;
        }

        // Charset select: ESC, intermediate, designator.
        if (next !== undefined && "()*+-./".includes(next)) {
          if (i + 2 >= input.length) {
            if (atEnd) break;
            return input.slice(i);
          }
          i += 3;
          continue;
        }

        if (next === undefined) {
          if (!atEnd) return input.slice(i);
          i += 1;
          continue;
        }

        i += 2;
        continue;
      }

      if (ch === "\r") {
        if (i + 1 >= input.length) {
          if (!atEnd) return input.slice(i);
          resetLine();
          i += 1;
          continue;
        }
        if (input[i + 1] === "\n") {
          buffer += "\n";
          i += 2;
          continue;
        }
        resetLine();
        i += 1;
        continue;
      }

      const runEnd = plainRunEnd(input, i + 1);
      buffer += input.slice(i, runEnd);
      i = runEnd;
    }

    return "";
  };

  return {
    append(chunk) {
      if (finished) return;
      pending = scan(pending + chunk, false);
    },
    segments() {
      const result = segments.slice();
      if (buffer) result.push(toSegment(buffer, style, link));
      return result;
    },
    delta() {
      const start = changedFrom;
      const changed = segments.slice(start);
      if (buffer) changed.push(toSegment(buffer, style, link));
      // The live `buffer` segment is always re-sent next time.
      changedFrom = segments.length;
      return { start, segments: changed };
    },
    finish() {
      if (!finished) {
        scan(pending, true);
        pending = "";
        flush();
        finished = true;
      }
      return segments.slice();
    },
  };
}
