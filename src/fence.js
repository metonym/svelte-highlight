import { escapeHtml, scopeToCssClass, tokenLines } from "./engine.js";
import { LANGUAGE_ALIASES } from "./languages/aliases.js";
import { loadLanguage } from "./load-language.js";
import { ensureRegistered, registry } from "./registry.js";

/**
 * @typedef {import("./fence.d.ts").ParsedMeta} ParsedMeta
 */

const TOKEN_RE = /(\w+)="([^"]*)"|(\w+)=\{([^}]*)\}|\{([^}]*)\}|(\w+)/g;
const WHITESPACE_RE = /\s+/;
const OPENING_FENCE_RE = /^( {0,3})(`{3,}|~{3,})(.*)$/;
const CLOSING_FENCE_RE = /^( {0,3})(`+|~+)( *)$/;
const INFO_SPLIT_RE = /^(\S*)\s*([\s\S]*)$/;

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
    const end = endStr === undefined ? start : Number(endStr);
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
    const [
      ,
      titleKey,
      titleValue,
      stateKey,
      stateRanges,
      bareRanges,
      bareWord,
    ] = match;

    if (titleKey !== undefined) {
      if (titleKey === "title") result.title = titleValue ?? "";
      continue;
    }

    if (stateKey !== undefined) {
      if (stateKey !== "mark" && stateKey !== "ins" && stateKey !== "del")
        continue;
      for (const line of parseRanges(stateRanges ?? ""))
        result.lines[line] = stateKey;
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

/**
 * @param {string} name
 * @returns {string | undefined}
 */
export function resolveLanguageName(name) {
  const word = name.trim().toLowerCase().split(WHITESPACE_RE)[0] ?? "";
  return LANGUAGE_ALIASES[word];
}

/** @param {string} value */
function escapeAttribute(value) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

/**
 * @param {import("./engine.d.ts").LineToken} token
 */
function renderToken(token) {
  let html = escapeHtml(token.text);
  for (let i = token.scopes.length - 1; i >= 0; i -= 1) {
    const scope = /** @type {string} */ (token.scopes[i]);
    html = `<span class="${scopeToCssClass(scope, "hljs-")}">${html}</span>`;
  }
  return html;
}

/**
 * @param {{ code: string; lang: string; meta?: string }} options
 * @returns {Promise<string>}
 */
export async function highlightFence({ code, lang, meta }) {
  const resolvedLang = resolveLanguageName(lang) ?? lang;
  const language = await loadLanguage(
    /** @type {import("./languages").LanguageName} */ (resolvedLang),
  );
  ensureRegistered(language);
  const { events } = registry.highlight(code, { language: resolvedLang });
  const parsedMeta = meta === undefined ? undefined : parseMeta(meta);

  const lines = tokenLines(events)
    .map((tokens, index) => {
      const state = parsedMeta?.lines[index + 1];
      const stateAttr = state ? ` data-line-state="${state}"` : "";
      return `<span class="line"${stateAttr}>${tokens.map(renderToken).join("")}</span>`;
    })
    .join("\n");

  const titleAttr =
    parsedMeta?.title === undefined
      ? ""
      : ` data-title="${escapeAttribute(parsedMeta.title)}"`;
  const showLineNumbersAttr = parsedMeta?.showLineNumbers
    ? ' data-show-line-numbers="true"'
    : "";

  return (
    `<pre class="hljs" data-language="${escapeAttribute(resolvedLang)}"${titleAttr}${showLineNumbersAttr}>` +
    `<code class="hljs">${lines}</code></pre>`
  );
}

/**
 * @param {string} line
 * @returns {{ indent: number; char: "`" | "~"; len: number; info: string } | null}
 */
function matchOpeningFence(line) {
  const match = OPENING_FENCE_RE.exec(line);
  if (match === null) return null;
  const indent = /** @type {string} */ (match[1]).length;
  const run = /** @type {string} */ (match[2]);
  const char = /** @type {"`" | "~"} */ (run[0]);
  const rest = /** @type {string} */ (match[3]);
  if (char === "`" && rest.includes("`")) return null;
  return { indent, char, len: run.length, info: rest.trim() };
}

/**
 * @param {string} line
 * @param {"`" | "~"} char
 * @param {number} minLen
 * @returns {boolean}
 */
function matchClosingFence(line, char, minLen) {
  const match = CLOSING_FENCE_RE.exec(line);
  if (match === null) return false;
  const run = /** @type {string} */ (match[2]);
  return run[0] === char && run.length >= minLen;
}

/**
 * @param {string} line
 * @param {number} indent
 * @returns {string}
 */
function stripIndent(line, indent) {
  let strip = 0;
  while (strip < indent && line[strip] === " ") strip += 1;
  return line.slice(strip);
}

/**
 * @typedef {import("./fence.d.ts").MarkdownSegment} MarkdownSegment
 * @typedef {import("./fence.d.ts").FenceSegment} FenceSegment
 */

/**
 * @param {{ char: "`" | "~"; len: number; indent: number; info: string; start: number; lines: string[] }} ctx
 * @param {number} id
 * @param {number} end
 * @param {boolean} open
 * @returns {FenceSegment}
 */
function buildFenceSegment(ctx, id, end, open) {
  const infoMatch = /** @type {RegExpExecArray} */ (
    INFO_SPLIT_RE.exec(ctx.info)
  );
  const meta = /** @type {string} */ (infoMatch[2]);
  return {
    id,
    kind: "fence",
    lang: resolveLanguageName(ctx.info),
    info: ctx.info,
    meta: parseMeta(meta),
    code: ctx.lines.join("\n"),
    open,
    start: ctx.start,
    end,
  };
}

/**
 * Parses `text` from `offset` onward as if `offset` were the start of a
 * document (always begins in prose mode - valid since a segment boundary
 * never occurs mid-fence, only at a definite open/close/EOF point).
 * @param {string} text
 * @param {number} offset
 * @param {number} startId
 * @returns {{ segments: MarkdownSegment[]; nextId: number }}
 */
function computeSegments(text, offset, startId) {
  /** @type {MarkdownSegment[]} */
  const segments = [];
  let id = startId;
  const n = text.length;
  let i = offset;
  /** @type {"prose" | "fence"} */
  let mode = "prose";
  let proseStart = offset;
  /** @type {{ char: "`" | "~"; len: number; indent: number; info: string; start: number; lines: string[] } | null} */
  let fenceCtx = null;

  while (i < n) {
    const lineStart = i;
    const nlIndex = text.indexOf("\n", i);
    const hasNewline = nlIndex !== -1;
    const lineEnd = hasNewline ? nlIndex : n;
    const lineEndIncl = hasNewline ? nlIndex + 1 : n;
    const line = text.slice(lineStart, lineEnd);

    if (mode === "prose") {
      const open = matchOpeningFence(line);
      if (open !== null) {
        if (!hasNewline) {
          // Opening line not yet terminated by a newline: stays prose until
          // it is, so a half-received "```ts" never flickers into a fence.
          break;
        }
        if (lineStart > proseStart) {
          segments.push({
            id: id++,
            kind: "text",
            text: text.slice(proseStart, lineStart),
            start: proseStart,
            end: lineStart,
          });
        }
        fenceCtx = {
          char: open.char,
          len: open.len,
          indent: open.indent,
          info: open.info,
          start: lineStart,
          lines: [],
        };
        mode = "fence";
        i = lineEndIncl;
        continue;
      }
      i = lineEndIncl;
      continue;
    }

    // mode === "fence"
    const ctx = /** @type {NonNullable<typeof fenceCtx>} */ (fenceCtx);
    if (hasNewline && matchClosingFence(line, ctx.char, ctx.len)) {
      segments.push(buildFenceSegment(ctx, id++, lineEndIncl, false));
      mode = "prose";
      proseStart = lineEndIncl;
      i = lineEndIncl;
      continue;
    }
    // A same-line-terminated closer requires a newline (like an opener, a
    // still-unterminated closer-looking line might grow into content or a
    // longer/shorter run with the next chunk) - anything else is content.
    ctx.lines.push(stripIndent(line, ctx.indent));
    if (!hasNewline) break;
    i = lineEndIncl;
  }

  if (mode === "fence") {
    segments.push(
      buildFenceSegment(
        /** @type {NonNullable<typeof fenceCtx>} */ (fenceCtx),
        id++,
        n,
        true,
      ),
    );
  } else if (proseStart < n) {
    segments.push({
      id: id++,
      kind: "text",
      text: text.slice(proseStart, n),
      start: proseStart,
      end: n,
    });
  }

  return { segments, nextId: id };
}

/**
 * @returns {import("./fence.d.ts").FenceSplitter}
 */
export function createFenceSplitter() {
  let text = "";
  /** @type {MarkdownSegment[]} */
  let segments = [];
  let nextId = 1;

  return {
    append(chunk) {
      if (chunk === "") return;
      text += chunk;

      const last = segments[segments.length - 1];
      const rescanFrom = last === undefined ? 0 : last.start;
      const result = computeSegments(text, rescanFrom, nextId);
      nextId = result.nextId;

      if (result.segments.length > 0 && last !== undefined) {
        result.segments[0] = {
          .../** @type {MarkdownSegment} */ (result.segments[0]),
          id: last.id,
        };
      }

      segments =
        last === undefined
          ? result.segments
          : [...segments.slice(0, -1), ...result.segments];
    },

    set(newText) {
      if (newText === text) return;
      const oldText = text;
      const minLen = Math.min(oldText.length, newText.length);
      let prefixLen = 0;
      while (prefixLen < minLen && oldText[prefixLen] === newText[prefixLen])
        prefixLen += 1;

      let m = -1;
      for (let i = 0; i < segments.length; i += 1) {
        const segment = /** @type {MarkdownSegment} */ (segments[i]);
        if (segment.start <= prefixLen) m = i;
        else break;
      }

      const kept = m < 1 ? [] : segments.slice(0, m);
      const reuseCandidate = m === -1 ? undefined : segments[m];
      const rebuildFrom =
        reuseCandidate === undefined ? 0 : reuseCandidate.start;

      text = newText;
      const result = computeSegments(text, rebuildFrom, nextId);
      nextId = result.nextId;

      const first = result.segments[0];
      if (
        first !== undefined &&
        reuseCandidate !== undefined &&
        first.kind === reuseCandidate.kind &&
        (first.kind !== "fence" ||
          first.info === /** @type {FenceSegment} */ (reuseCandidate).info)
      ) {
        result.segments[0] = { ...first, id: reuseCandidate.id };
      }

      segments = [...kept, ...result.segments];
    },

    segments() {
      return segments;
    },

    text() {
      return text;
    },

    reset() {
      text = "";
      segments = [];
      nextId = 1;
    },
  };
}
